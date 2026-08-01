/* [7.280.0] SONDA UV — dove cade il CENTRO DEL PETTO nella texture della maglia CH38.
   Il numero sul dorso è già mappato (U~0.5625, metodo 7.32.7) ma la fascia verticale dell'Ajax va sul FRONTE,
   e quel punto non era mai stato misurato. Dipinge 16 colonne numerate e riprende il modello davanti e dietro:
   la colonna al centro del petto è l'ancora della fascia.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node kit-uv-front-probe.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d');
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 520, height: 660 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function', { timeout: 40000 });
await sleep(500);

const shots = await page.evaluate(async () => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
  const N = 16;
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d');
  const w = 512 / N;
  for (let i = 0; i < N; i++) {
    x.fillStyle = `hsl(${Math.round(i * 360 / N)},85%,${i % 2 ? 42 : 62}%)`;
    x.fillRect(Math.round(i * w), 0, Math.ceil(w), 512);
    x.fillStyle = '#000'; x.font = 'bold 26px monospace'; x.textAlign = 'center';
    x.save(); x.translate(Math.round(i * w + w / 2), 300); x.scale(1, -1); x.fillText(String(i), 0, 0); x.restore();
  }
  const tex = new THREE.CanvasTexture(cv); tex.needsUpdate = true;
  model.traverse(o => {
    if (!o.isMesh) return;
    const nm = (o.name || '').toLowerCase();
    if (nm.includes('shirt')) o.material = new THREE.MeshBasicMaterial({ map: tex });
    else if (nm.includes('body') || nm.includes('shorts')) o.material = new THREE.MeshBasicMaterial({ color: 0x777777 });
    else o.visible = false;
  });
  const W = 520, H = 660;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x1b2530);
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight(0xffffff, 1.2)); scene.add(model);
  const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
  const torsoY = bb.min.y + sz.y * 0.70;
  const cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
  const out = {};
  for (const [k, dz] of [['fronte', 1], ['dorso', -1]]) {
    cam.position.set(c.x, torsoY, c.z + dz * sz.y * 0.85); cam.lookAt(c.x, torsoY, c.z);
    renderer.render(scene, cam);
    out[k] = renderer.domElement.toDataURL('image/png');
  }
  return out;
});
for (const k of Object.keys(shots)) {
  fs.writeFileSync(path.join(OUT, `uvcol-${k}.png`), Buffer.from(shots[k].split(',')[1], 'base64'));
  console.log('→', path.join(OUT, `uvcol-${k}.png`));
}
console.log('pageerr:', errs.length ? errs : 0);
await browser.close(); srv.close();
