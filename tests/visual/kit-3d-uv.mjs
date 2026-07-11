/* [7.8.0] carica footballer.glb in una mini-scena Three con camera RAVVICINATA e applica la texture a strisce
   alla mesh Ch38_Shirt → verifica DIRETTA di come le UV mappano il pattern (leggibile? distorto?). */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d');
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 500, height: 640 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function' && window.kitPatternTex !== undefined || (window.THREE && typeof window.loadGLB === 'function'), { timeout: 40000 });
await sleep(500);

const res = await page.evaluate(async (pat) => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
  // texture a strisce (replica di kitPatternTex)
  function tex(shirt, c2, p) {
    const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
    x.fillStyle = shirt; x.fillRect(0, 0, S, S); x.fillStyle = c2;
    if (p === 'stripes') { const n = 7, w = S / n; for (let i = 1; i < n; i += 2) x.fillRect(Math.round(i * w), 0, Math.ceil(w), S); }
    else if (p === 'hoops') { const n = 8, h = S / n; for (let i = 1; i < n; i += 2) x.fillRect(0, Math.round(i * h), S, Math.ceil(h)); }
    else if (p === 'halves') { x.fillRect(S / 2, 0, S / 2, S); }
    else if (p === 'sash') { x.save(); x.translate(S / 2, S / 2); x.rotate(-Math.PI / 4); x.fillRect(-S, -S * 0.11, S * 2, S * 0.22); x.restore(); }
    const t = new THREE.CanvasTexture(cv); t.needsUpdate = true; return t;
  }
  let shirtFound = false, meshNames = [];
  model.traverse(o => {
    if (!o.isMesh) return; meshNames.push(o.name);
    const nm = (o.name || '').toLowerCase();
    if (nm.includes('shirt')) { shirtFound = true; o.material = new THREE.MeshBasicMaterial({ map: tex('#1d4ed8', '#ffffff', pat) }); }
    else if (nm.includes('body') || nm.includes('hair') || nm.includes('shoes') || nm.includes('socks') || nm.includes('shorts')) { o.material = new THREE.MeshBasicMaterial({ color: 0x888888 }); }
    else o.visible = false;
  });
  // scena
  const W = 500, H = 640;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x22303f);
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
  const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  // inquadra il TORSO (parte alta)
  const torsoY = bb.min.y + sz.y * 0.68;
  cam.position.set(c.x, torsoY, c.z + sz.y * 0.9); cam.lookAt(c.x, torsoY, c.z);
  scene.add(model);
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  return { url, shirtFound, meshNames };
}, process.argv[2] || 'stripes');

const pat = process.argv[2] || 'stripes';
const b64 = res.url.split(',')[1];
fs.writeFileSync(path.join(OUT, `uv-${pat}.png`), Buffer.from(b64, 'base64'));
console.log('shirt mesh trovata:', res.shirtFound, '· mesh:', res.meshNames.join(','), '· pageerr', errs.length ? errs : 0);
console.log('→', path.join(OUT, `uv-${pat}.png`));
await browser.close(); srv.close();
