/* [7.8.2] test DECISIVO: le strisce verticali sono renderizzabili sulla maglia CH38 ad ALTA frequenza?
   Renderizza il torso FRONTALE con N=10/18/28 strisce verticali → se compaiono strisce leggibili si può
   abilitare il pattern «stripes» in 3D (Milan/Inter/Juve); altrimenti resta il limite UV. */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 960, height: 420 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function', { timeout: 40000 });
await sleep(400);
const res = await page.evaluate(async () => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const freqs = [10, 18, 28];
  const W = 960, H = 420, cell = W / freqs.length;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x223040);
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  function stripeTex(n) {
    const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
    x.fillStyle = '#c81414'; x.fillRect(0, 0, S, S); x.fillStyle = '#101010'; const w = S / n;
    for (let i = 1; i < n; i += 2) x.fillRect(Math.round(i * w), 0, Math.ceil(w), S);
    const t = new THREE.CanvasTexture(cv); t.needsUpdate = true; return t;
  }
  const cam = new THREE.PerspectiveCamera(26, cell / H, 0.1, 100);
  for (let i = 0; i < freqs.length; i++) {
    const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
    model.traverse(o => { if (!o.isMesh) return; const nm = (o.name || '').toLowerCase(); if (nm.includes('shirt')) o.material = new THREE.MeshBasicMaterial({ map: stripeTex(freqs[i]) }); else if (nm.includes('body') || nm.includes('shorts')) o.material = new THREE.MeshBasicMaterial({ color: 0x888888 }); else o.visible = false; });
    const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
    const torsoY = bb.min.y + sz.y * 0.62;
    scene.add(model);
    cam.position.set(c.x, torsoY, c.z + sz.y * 0.42); cam.lookAt(c.x, torsoY, c.z);
    renderer.setViewport(i * cell, 0, cell, H); renderer.setScissor(i * cell, 0, cell, H); renderer.setScissorTest(true);
    renderer.render(scene, cam); scene.remove(model);
  }
  return renderer.domElement.toDataURL('image/png');
}, );
fs.writeFileSync(path.join(OUT, 'stripes-freq.png'), Buffer.from(res.split(',')[1], 'base64'));
await browser.close(); srv.close();
console.log('freq 10 | 18 | 28 → out/kit3d/stripes-freq.png · pageerr', errs.length ? errs : 0);
