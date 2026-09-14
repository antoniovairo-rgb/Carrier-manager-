/* [7.8.2] full-body a distanza media: strisce N=11 (rossonere) + hoops, per giudicare la resa a scala reale. */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 600, height: 640 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function', { timeout: 40000 });
await sleep(400);
const res = await page.evaluate(async () => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const W = 600, H = 640, cell = W / 2;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x2c6a1d);
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight(0xffffff, 0.62)); const sun = new THREE.DirectionalLight(0xfff6e8, 0.84); sun.position.set(30, 85, -24); scene.add(sun); scene.add(new THREE.HemisphereLight(0x9fc0ec, 0x2c6a1d, 0.42));
  function tex(kind) {
    const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
    x.fillStyle = '#c81414'; x.fillRect(0, 0, S, S); x.fillStyle = '#101010';
    if (kind === 'stripes') { const n = 11, w = S / n; for (let i = 1; i < n; i += 2) x.fillRect(Math.round(i * w), 0, Math.ceil(w), S); }
    else { const n = 8, h = S / n; for (let i = 1; i < n; i += 2) x.fillRect(0, Math.round(i * h), S, Math.ceil(h)); }
    const t = new THREE.CanvasTexture(cv); t.needsUpdate = true; return t;
  }
  const cam = new THREE.PerspectiveCamera(30, cell / H, 0.1, 100);
  ['stripes', 'hoops'].forEach((kind, i) => {
    const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
    model.traverse(o => { if (!o.isMesh) return; const nm = (o.name || '').toLowerCase(); if (nm.includes('shirt')) o.material = new THREE.MeshLambertMaterial({ map: tex(kind), skinning: true }); else if (nm.includes('shorts')) o.material = new THREE.MeshLambertMaterial({ color: 0x101010, skinning: true }); else if (nm.includes('socks')) o.material = new THREE.MeshLambertMaterial({ color: 0xc81414, skinning: true }); else if (nm.includes('body') || nm.includes('hair')) o.material = new THREE.MeshLambertMaterial({ color: 0xd0a080, skinning: true }); else o.visible = false; });
    const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
    scene.add(model);
    cam.position.set(c.x, c.y + sz.y * 0.05, c.z + sz.y * 0.85); cam.lookAt(c.x, c.y, c.z);
    renderer.setViewport(i * cell, 0, cell, H); renderer.setScissor(i * cell, 0, cell, H); renderer.setScissorTest(true);
    renderer.render(scene, cam); scene.remove(model);
  });
  return renderer.domElement.toDataURL('image/png');
});
fs.writeFileSync(path.join(OUT, 'fullbody-stripes-hoops.png'), Buffer.from(res.split(',')[1], 'base64'));
await browser.close(); srv.close();
console.log('strisce(11) | hoops → out/kit3d/fullbody-stripes-hoops.png · pageerr', errs.length ? errs : 0);
