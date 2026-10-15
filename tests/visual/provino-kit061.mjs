#!/usr/bin/env node
/* [PO-061 giro 48] PROVINO DEI KIT 3D: corpo di gioco CGTrader (kit-adapter lod1, quello che si vede in campo) vestito col codice
   VERO del gioco — il blocco fra i marcatori KIT061 di src/12 viene copiato, non riscritto — fotografato di fronte e di schiena
   per tutti i motivi di maglia, con la stessa resa del renderer della partita (ACES, esposizione 0,52, sRGB).
   Uso: node tests/visual/provino-kit061.mjs <nome-foto> [lod1|lod2] ; CPM_ROSSO=1 → __CPM_NO_KIT061 (kit come prima).
   Scrive docs/sviluppo/foto-giro48/<nome-foto>.png e stampa le misure del kit (__CPM_KIT061). */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'src/12-three-match-view.jsx'), 'utf8');
const a = src.indexOf('/*KIT061*/'), b = src.indexOf('/*/KIT061*/'); if (a < 0 || b < 0) { console.log('marcatori KIT061 assenti'); process.exit(2); }
const kitCode = src.slice(a, b);
const NOME = process.argv[2] || 'provino-kit'; const LOD = process.argv[3] || 'lod1'; const ROSSO = process.env.CPM_ROSSO === '1';
const VICINO = process.env.CPM_VICINO === '1';
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>
</head><body style="margin:0;background:#16202c"><div id="r" style="display:flex;flex-wrap:wrap;gap:3px;width:1240px"></div><script>
${ROSSO ? 'window.__CPM_NO_KIT061=1;' : ''}
const sr={current:null};const _guanti201=()=>{};const _hyperKitMaterialCache=new Map();
${kitCode}
(async()=>{try{const L=new THREE.GLTFLoader();const ld=u=>new Promise((ok,ko)=>L.load(u,ok,undefined,ko));const corpo=await ld('../../assets/cgtrader-review-${LOD}-kit-adapter.glb');
const W=${VICINO ? 300 : 150},H=${VICINO ? 300 : 210},ren=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});ren.setSize(W,H);ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=0.52;
const sc=new THREE.Scene();sc.background=new THREE.Color(0x24402a);sc.add(new THREE.AmbientLight(0xffffff,0.66*0.62*2.2));sc.add(new THREE.HemisphereLight(0xdfe8ff,0x3a5a32,0.46*0.62*2.2));const dl=new THREE.DirectionalLight(0xfff4e0,1.5);dl.position.set(3,6,5);sc.add(dl);const dl2=new THREE.DirectionalLight(0xc8d8ff,0.5);dl2.position.set(-4,3,-5);sc.add(dl2);
const KITS=[['solid','#c8102e','#ffffff'],['stripes','#111111','#ffffff'],['stripesw','#1d4ed8','#ffffff'],['hoops','#15803d','#ffffff'],['halves','#7c3aed','#facc15'],['sash','#ffffff','#dc2626'],['vband','#0f172a','#38bdf8'],['band','#f97316','#111111'],['sleeves','#b91c1c','#ffffff'],['solid','#f5f5f5','#0b3d91'],['solid','#fde047','#111827'],['solid','#0b1d3a','#e11d48']];
const out=[];for(const [pat,sh,c2] of KITS)for(const vista of ['fronte','schiena']){const av=THREE.SkeletonUtils.clone(corpo.scene);sc.add(av);av.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});
  const osso=re=>{let x=null;av.traverse(o=>{if(!x&&o.isBone&&re.test(o.name))x=o;});return x;};av.updateMatrixWorld(true);const hd=osso(/head$/i),ft=osso(/ball_l$/i);const vh=new THREE.Vector3(),vf=new THREE.Vector3();hd.getWorldPosition(vh);ft.getWorldPosition(vf);av.scale.setScalar(1.8/(vh.y-vf.y));
  if(vista==='schiena')av.rotation.y=Math.PI;av.updateMatrixWorld(true);
  const mx=new THREE.AnimationMixer(av);const c=corpo.animations.find(x=>x.name==='idle')||corpo.animations[0];if(c){mx.clipAction(c).play();mx.setTime(c.duration*0.3);}av.updateMatrixWorld(true);
  const lum=(()=>{const h=sh.replace('#','');return 0.2126*parseInt(h.slice(0,2),16)/255+0.7152*parseInt(h.slice(2,4),16)/255+0.0722*parseInt(h.slice(4,6),16)/255;})();
  _applyHyperKit(av,{shirt:sh,c2,pattern:pat,shorts:lum<0.5?'#f1f1f3':'#181826',socks:sh,shoes:'#141418'},null,10);${process.env.CPM_DIAG==='pelle'?"av.traverse(o=>{if(o.isMesh&&!/^Hyper/.test(o.material&&o.material.name||''))o.visible=false;});":''}${process.env.CPM_DIAG==='tinta'?"av.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='HyperShirt'){o.material=o.material.clone();o.material.map=null;o.material.color.set('#22c55e');}});":''}
  const cam=new THREE.PerspectiveCamera(${VICINO ? 18 : 30},W/H,0.05,50);hd.getWorldPosition(vh);const cy=vh.y-${VICINO ? 0.34 : 0.62};cam.position.set(0,cy,${VICINO ? 2.6 : 3.1});cam.lookAt(0,cy-${VICINO ? 0.02 : 0.08},0);ren.render(sc,cam);
  if(vista==='fronte'){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d');cx.drawImage(ren.domElement,0,0);const d=cx.getImageData(0,0,W,H).data;
    /* misura: fra i pixel della maglia (vicini al primo o al secondo colore, dopo luce e tonemapping) la quota del SECONDO colore; e i pixel color pelle nel riquadro del petto (macchia) */
    const P=document.createElement('canvas');P.width=P.height=1;const pc=P.getContext('2d');const rgb=h=>{pc.fillStyle=h;pc.fillRect(0,0,1,1);return pc.getImageData(0,0,1,1).data;};
    let nA=0,nB=0,pel=0;const near=(i,c,t)=>{const r=d[i]/(c[0]+8),g=d[i+1]/(c[1]+8),bb=d[i+2]/(c[2]+8),m=(r+g+bb)/3;return m>0.25&&m<1.6&&Math.abs(r-m)<t*m&&Math.abs(g-m)<t*m&&Math.abs(bb-m)<t*m;};
    const sh8=[...rgb(sh)],c28=[...rgb(c2)],skin=[200,140,110];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=4*(y*W+x);const dA=Math.hypot(d[i]-sh8[0]*0.85,d[i+1]-sh8[1]*0.85,d[i+2]-sh8[2]*0.85),dB=Math.hypot(d[i]-c28[0]*0.85,d[i+1]-c28[1]*0.85,d[i+2]-c28[2]*0.85);if(Math.min(dA,dB)<110){if(dB<dA)nB++;else nA++;}
      if(x>W*0.38&&x<W*0.62&&y>H*0.215&&y<H*0.42){const r=d[i],g=d[i+1],bb=d[i+2];if(r>120&&r>g+25&&g>bb+5&&r-bb>45&&r-bb<130)pel++;}}
    (window.__MISURE=window.__MISURE||[]).push({pat,sh,c2,quotaB:+(nB/Math.max(1,nA+nB)).toFixed(3),pelle:pel});}
  const f=document.createElement('figure');f.style.margin='0';const im=new Image();im.src=ren.domElement.toDataURL();f.appendChild(im);const cap=document.createElement('figcaption');cap.style.cssText='color:#cbd5e1;font:10px sans-serif;text-align:center';cap.textContent=pat+' '+vista;f.appendChild(cap);document.getElementById('r').appendChild(f);
  out.push(pat+'/'+vista);sc.remove(av);}
window.__PROVINO={ok:true,n:out.length,kit:window.__CPM_KIT061||null,misure:window.__MISURE||[]};}catch(e){window.__PROVINO={ok:false,err:String(e.stack||e.message)};}})();</script></body></html>`;
const dir = path.join(ROOT, 'tests/visual'); const tmp = path.join(dir, 'provino-kit061.tmp.html'); fs.writeFileSync(tmp, html);
const srv = await startServer(); const port = srv.address().port; const br = await launchBrowser();
const p = await br.newPage({ viewport: { width: 1240, height: 400 } }); await installCdnRoutes(p);
const E = []; p.on('pageerror', e => E.push(e.message));
await p.goto(`http://localhost:${port}/tests/visual/provino-kit061.tmp.html`); await p.waitForFunction(() => window.__PROVINO, null, { timeout: 120000 });
const r = await p.evaluate(() => window.__PROVINO); const od = process.env.CPM_OUT ? path.resolve(process.env.CPM_OUT) : path.join(ROOT, 'docs/sviluppo/foto-giro48'); fs.mkdirSync(od, { recursive: true });
await p.screenshot({ path: path.join(od, NOME + '.png'), fullPage: true });
console.log('PROVINO ' + JSON.stringify({ ...r, errori: E.slice(0, 3) })); await br.close(); srv.close(); fs.unlinkSync(tmp);
process.exit(r.ok && !E.length ? 0 : 1);
