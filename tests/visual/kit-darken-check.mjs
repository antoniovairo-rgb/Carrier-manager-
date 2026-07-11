/* [7.8.2] verifica il darkening saturation-aware dei kit TINTA UNITA sotto luci match (day): granata, rosso,
   azzurro, bianco. Replica la formula del gioco (_dim=1-s*0.60*(0.45+0.55*(1-l))) e campiona il petto. */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 800, height: 300 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function', { timeout: 40000 });
await sleep(400);
const res = await page.evaluate(async () => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const kits = [{ n: 'granata', c: '#6c1f2e' }, { n: 'rosso', c: '#dc2626' }, { n: 'azzurro', c: '#38bdf8' }, { n: 'bianco', c: '#f5f5f5' }];
  const W = 800, H = 300, cell = W / kits.length;
  // luci match (day) — leggermente potenziate per approssimare l'accumulo dei floodlight reali
  const mkLights = sc => { sc.add(new THREE.AmbientLight(0xffffff, 0.72)); const s = new THREE.DirectionalLight(0xfff6e8, 0.95); s.position.set(30, 85, -24); sc.add(s); sc.add(new THREE.HemisphereLight(0x9fc0ec, 0x2c6a1d, 0.5));[[60, 40, 40], [-60, 40, 40], [60, 40, -40], [-60, 40, -40]].forEach(p => { const fl = new THREE.PointLight(0xffffff, 0.55, 320); fl.position.set(p[0], p[1], p[2]); sc.add(fl); }); };
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x2c6a1d);
  const scene = new THREE.Scene(); mkLights(scene);
  const cam = new THREE.PerspectiveCamera(30, cell / H, 0.1, 100);
  const samples = [];
  kits.forEach((k, i) => {
    const _c = new THREE.Color(k.c); const _hsl = {}; _c.getHSL(_hsl);
    const _dim = 1 - _hsl.s * 0.60 * (0.45 + 0.55 * (1 - _hsl.l)); const _cd = _c.clone().multiplyScalar(_dim);
    const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
    model.traverse(o => { if (!o.isMesh) return; const nm = (o.name || '').toLowerCase(); if (nm.includes('shirt')) o.material = new THREE.MeshLambertMaterial({ color: _cd, emissive: _cd.clone().multiplyScalar(0.14), skinning: true }); else o.visible = false; });
    const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
    const torsoY = bb.min.y + sz.y * 0.66;
    scene.add(model);
    cam.position.set(c.x, torsoY, c.z + sz.y * 0.8); cam.lookAt(c.x, torsoY, c.z);
    renderer.setViewport(i * cell, 0, cell, H); renderer.setScissor(i * cell, 0, cell, H); renderer.setScissorTest(true);
    renderer.render(scene, cam); scene.remove(model);
    samples.push({ n: k.n, c: k.c, dim: +_dim.toFixed(3) });
  });
  return { url: renderer.domElement.toDataURL('image/png'), samples };
});
fs.writeFileSync(path.join(OUT, 'darken-check.png'), Buffer.from(res.url.split(',')[1], 'base64'));
await browser.close(); srv.close();
console.log('darkening applicato:'); res.samples.forEach(s => console.log(`  ${s.n.padEnd(8)} ${s.c} → dim ×${s.dim}`));
console.log('screenshot → out/kit3d/darken-check.png · pageerr', errs.length ? errs : 0);
