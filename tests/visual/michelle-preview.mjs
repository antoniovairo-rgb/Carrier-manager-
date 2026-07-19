/* [7.141.0 task #108] ANTEPRIMA ACTOR — renderizza assets/actor-journalist.glb in un mini-viewer
   (stesse librerie/route del gioco: three r128 + GLTFLoader via installCdnRoutes) e cattura
   figura intera / primo piano / retro. Self-contained: il viewer HTML lo scrive questo probe
   (in out/, gitignored) → funziona su un clone fresco. Riusabile per ogni futuro actor-*.glb
   (env ACTOR_GLB=/assets/actor-presenter.glb). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { mkdirSync, writeFileSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out'); mkdirSync(OUT, { recursive: true });
const GLB = process.env.ACTOR_GLB || '/assets/actor-journalist.glb';
const SCRIPT_CLOSE = '</' + 'script>';
const VIEWER = [
  '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:#141824}</style>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">' + SCRIPT_CLOSE,
  '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js">' + SCRIPT_CLOSE,
  '</head><body><script>',
  'const R=new THREE.WebGLRenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(1);document.body.appendChild(R.domElement);',
  'const S=new THREE.Scene();S.background=new THREE.Color(0x141824);',
  'S.add(new THREE.AmbientLight(0x8d97b5,0.55));',
  'const k=new THREE.PointLight(0xffe2ba,1.25,26);k.position.set(-2.2,3.2,3.5);S.add(k);',
  'const f=new THREE.PointLight(0x9fb2d8,0.55,22);f.position.set(2.6,2.0,3.0);S.add(f);',
  'const rim=new THREE.PointLight(0xdce6ff,0.95,20);rim.position.set(0.4,3.3,-3.0);S.add(rim);',
  'const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x10131b,roughness:0.95}));floor.rotation.x=-Math.PI/2;S.add(floor);',
  'const C=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,0.1,50);',
  "const q=new URLSearchParams(location.search);const mode=q.get('m')||'full';const url=q.get('glb')||'/assets/actor-journalist.glb';",
  'new THREE.GLTFLoader().load(url,g=>{',
  '  const av=g.scene;av.updateMatrixWorld(true);',
  '  let ym=1e9,yM=-1e9;const v=new THREE.Vector3();',
  '  av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(v);if(v.y<ym)ym=v.y;if(v.y>yM)yM=v.y;});',
  '  const sc=1.64/Math.max(0.01,yM-ym);av.scale.setScalar(sc);av.updateMatrixWorld(true);',
  '  let xm=1e9,xM=-1e9,ym2=1e9,zm=1e9,zM=-1e9;',
  '  av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(v);if(v.x<xm)xm=v.x;if(v.x>xM)xM=v.x;if(v.y<ym2)ym2=v.y;if(v.z<zm)zm=v.z;if(v.z>zM)zM=v.z;});',
  '  if(isFinite(xm))av.position.set(-(xm+xM)/2,-ym2,-(zm+zM)/2);',
  '  av.traverse(b=>{if(!b.isBone)return;const n=(b.name||"").replace(/[:_.]/g,"");',
  '    if(/mixamorig\\d*RightArm$/i.test(n))b.rotation.set(0.98,-0.30,-0.98);',
  '    else if(/mixamorig\\d*RightForeArm$/i.test(n))b.rotation.set(0.05,0.38,-0.26);',
  '    else if(/mixamorig\\d*LeftArm$/i.test(n))b.rotation.set(0.98,0.30,0.98);',
  '    else if(/mixamorig\\d*LeftForeArm$/i.test(n))b.rotation.set(0.05,-0.38,0.26);});',
  '  av.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});',
  '  S.add(av);',
  "  if(mode==='face'){C.position.set(0.32,1.52,0.95);C.lookAt(0,1.44,0);}",
  "  else if(mode==='back'){C.position.set(0,1.25,-2.6);C.lookAt(0,1.0,0);}",
  '  else{C.position.set(0.55,1.25,2.75);C.lookAt(0,0.92,0);}',
  '  R.render(S,C);window.__READY=true;',
  "},undefined,e=>{document.title='ERR';window.__READY='err';});",
  SCRIPT_CLOSE + '</body></html>'
].join('\n');
writeFileSync(path.join(OUT, 'michelle-viewer.html'), VIEWER);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errs = [];
for (const m of ['full', 'face', 'back']) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 640, height: 900 });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.goto(`http://localhost:${port}/tests/visual/out/michelle-viewer.html?m=${m}&glb=${encodeURIComponent(GLB)}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__READY, null, { timeout: 30000 });
  await sleep(400);
  const ready = await page.evaluate(() => window.__READY);
  if (ready === 'err') errs.push(`GLB load ERR (${m})`);
  await page.screenshot({ path: path.join(OUT, `michelle-${m}.png`) });
  console.log(`→ out/michelle-${m}.png`);
  await page.close();
}
await browser.close(); srv.close();
console.log(errs.length ? '❌ ' + errs.join(' · ') : '✅ anteprime actor generate');
process.exit(errs.length ? 1 : 0);
