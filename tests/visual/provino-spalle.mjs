#!/usr/bin/env node
/* [7.999.21] PROVINO DELLE SPALLE: corpo di gioco (CGTrader lod1) con le clip idle e jog, SENZA e CON la correzione di postura del
   gioco (copiata da src/12 fra i marcatori CORR23, non riscritta), fotografato di fronte e di lato da vicino. Scrive
   tests/character-lab/spalle/provino-<angolo>.png e stampa la pendenza collo->spalla. Uso: node tests/visual/provino-spalle.mjs [0.32] */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'src/12-three-match-view.jsx'), 'utf8');
const a = src.indexOf('/*CORR23*/'), b = src.indexOf('/*/CORR23*/'); if (a < 0 || b < 0) { console.log('marcatori CORR23 assenti'); process.exit(2); }
const corr = src.slice(a, b);
const ANG = process.argv[2] || '';
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>
<script>${corr}</script></head><body style="margin:0;background:#1b2330"><div id="r" style="display:flex;flex-wrap:wrap;gap:4px"></div><script>
(async()=>{try{const L=new THREE.GLTFLoader();const ld=u=>new Promise((ok,ko)=>L.load(u,ok,undefined,ko));const corpo=await ld('../../assets/cgtrader-review-lod1-kit-adapter.glb');
${ANG ? `const _s=_corrPostura23.toString();` : ''}
const W=240,H=300,ren=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});ren.setSize(W,H);const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a3a2a);sc.add(new THREE.HemisphereLight(0xffffff,0x445544,1.2));const dl=new THREE.DirectionalLight(0xffffff,0.8);dl.position.set(3,5,4);sc.add(dl);
const out=[];for(const clipN of ['idle','jog'])for(const corr of [0,1])for(const vista of ['fronte','lato']){const av=THREE.SkeletonUtils.clone(corpo.scene);sc.add(av);av.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});
  const osso=re=>{let x=null;av.traverse(o=>{if(!x&&o.isBone&&re.test(o.name))x=o;});return x;};av.updateMatrixWorld(true);const hd=osso(/head$/i),ft=osso(/ball_l$/i);const vh=new THREE.Vector3(),vf=new THREE.Vector3();hd.getWorldPosition(vh);ft.getWorldPosition(vf);av.scale.setScalar(1.8/(vh.y-vf.y));av.updateMatrixWorld(true);
  const mx=new THREE.AnimationMixer(av);const c=corpo.animations.find(x=>x.name===clipN);mx.clipAction(c).play();mx.setTime(c.duration*0.3);av.updateMatrixWorld(true);
  window.__CPM_SPALLE21=[];if(corr){const B=_ossa23(av);_corrPostura23(B);}else{window.__CPM_NO_SPALLE21=1;window.__CPM_NO_POSTURA23=1;const B=_ossa23(av);_corrPostura23(B);window.__CPM_NO_POSTURA23=0;window.__CPM_NO_SPALLE21=0;}
  av.updateMatrixWorld(true);const n=osso(/neck_01$/),l=osso(/upperarm_l$/),r=osso(/upperarm_r$/);const N=new THREE.Vector3(),Lp=new THREE.Vector3(),Rp=new THREE.Vector3();n.getWorldPosition(N);l.getWorldPosition(Lp);r.getWorldPosition(Rp);
  const lat=(Math.hypot(Lp.x-N.x,Lp.z-N.z)+Math.hypot(Rp.x-N.x,Rp.z-N.z))/2,pend=Math.atan2(N.y-(Lp.y+Rp.y)/2,lat)*180/Math.PI;const fl=osso(/lowerarm_l$/),Fp=new THREE.Vector3();fl.getWorldPosition(Fp);const vv=Fp.clone().sub(Lp).normalize(),braccio=Math.acos(Math.max(-1,Math.min(1,-vv.y)))*180/Math.PI;
  const cam=new THREE.PerspectiveCamera(30,W/H,0.05,50);const cy=N.y-0.05;if(vista==="fronte")cam.position.set(0,cy,2.6);else cam.position.set(2.6,cy,0.3);cam.lookAt(0,cy-0.3,0);ren.render(sc,cam);
  const f=document.createElement('figure');f.style.margin='0';const im=new Image();im.src=ren.domElement.toDataURL();f.appendChild(im);const cap=document.createElement('figcaption');cap.style.cssText='color:#dde;font:12px sans-serif;text-align:center';cap.textContent=clipN+' · '+(corr?'CON':'SENZA')+' correzione · '+vista+' · spalla '+pend.toFixed(0)+'° · braccio '+braccio.toFixed(0)+'°';f.appendChild(cap);document.getElementById('r').appendChild(f);
  out.push({clip:clipN,corr,vista,pend:+pend.toFixed(1),braccio:+braccio.toFixed(0)});sc.remove(av);}
window.__PROVINO={ok:true,out};}catch(e){window.__PROVINO={ok:false,err:String(e.message)};}})();</script></body></html>`;
const dir = path.join(ROOT, 'tests/visual'); fs.writeFileSync(path.join(dir, 'provino-spalle.tmp.html'), html);
const srv = await startServer(); const port = srv.address().port; const br = await launchBrowser();
const p = await br.newPage({ viewport: { width: 1000, height: 640 } }); await installCdnRoutes(p);
await p.goto(`http://localhost:${port}/tests/visual/provino-spalle.tmp.html`); await p.waitForFunction(() => window.__PROVINO, null, { timeout: 60000 });
const r = await p.evaluate(() => window.__PROVINO); fs.mkdirSync(path.join(ROOT, 'tests/character-lab/spalle'), { recursive: true });
await p.screenshot({ path: path.join(ROOT, 'tests/character-lab/spalle/provino.png'), fullPage: true });
console.log(JSON.stringify(r)); await br.close(); srv.close(); fs.unlinkSync(path.join(dir, 'provino-spalle.tmp.html'));
