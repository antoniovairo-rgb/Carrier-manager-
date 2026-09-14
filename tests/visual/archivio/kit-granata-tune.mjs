/* [7.8.2] tuning granata: renderizza la maglia CH38 con la STESSA illuminazione del match (day palette:
   ambient 0.62, sun 0.84 da (30,85,-24), hemi 0.42, + floodlight approx) e materiale MeshLambert con
   emissive×0.14 come il gioco → campiona il pixel del petto per ogni candidato e sceglie il granata che
   NON degenera in rosso/rosa sotto le luci. */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/kit3d'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 300 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.THREE && typeof window.loadGLB === 'function', { timeout: 40000 });
await sleep(400);

const cands = ['#6c1f2e', '#5a2129', '#55252b', '#4e2328', '#4a2126', '#552b2e', '#4d262a'];
const res = await page.evaluate(async (cands) => {
  const THREE = window.THREE;
  const g = await window.loadGLB('./assets/footballer.glb');
  const W = 900, H = 300, cell = W / cands.length;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setClearColor(0x2c6a1d);
  const scene = new THREE.Scene();
  // === luci IDENTICHE al match (day palette) ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const sun = new THREE.DirectionalLight(0xfff6e8, 0.84); sun.position.set(30, 85, -24); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x9fc0ec, 0x2c6a1d, 0.42));
  // approssimazione floodlight (4 PointLight 0.50 come le torri) — contributo parziale a centro campo
  [[60, 40, 40], [-60, 40, 40], [60, 40, -40], [-60, 40, -40]].forEach(p => { const fl = new THREE.PointLight(0xffffff, 0.50, 280); fl.position.set(p[0], p[1], p[2]); scene.add(fl); });
  const samples = [];
  const cam = new THREE.PerspectiveCamera(30, (cell) / H, 0.1, 100);
  for (let i = 0; i < cands.length; i++) {
    const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
    model.traverse(o => {
      if (!o.isMesh) return; const nm = (o.name || '').toLowerCase();
      if (nm.includes('shirt')) { const c = new THREE.Color(cands[i]); o.material = new THREE.MeshLambertMaterial({ color: c, emissive: c.clone().multiplyScalar(0.14), skinning: true }); }
      else if (nm.includes('body') || nm.includes('hair') || nm.includes('shoes') || nm.includes('socks') || nm.includes('shorts')) o.material = new THREE.MeshBasicMaterial({ color: 0x777777 });
      else o.visible = false;
    });
    const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
    const torsoY = bb.min.y + sz.y * 0.66;
    scene.add(model);
    cam.aspect = cell / H; cam.updateProjectionMatrix();
    cam.position.set(c.x, torsoY, c.z + sz.y * 0.55); cam.lookAt(c.x, torsoY, c.z);
    renderer.setViewport(i * cell, 0, cell, H); renderer.setScissor(i * cell, 0, cell, H); renderer.setScissorTest(true);
    renderer.render(scene, cam);
    scene.remove(model);
  }
  // ricampiona: render singolo per pixel-sample preciso del petto
  const out = [];
  for (let i = 0; i < cands.length; i++) {
    const model = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone) ? THREE.SkeletonUtils.clone(g.scene) : g.scene;
    model.traverse(o => { if (!o.isMesh) return; const nm = (o.name || '').toLowerCase(); if (nm.includes('shirt')) { const c = new THREE.Color(cands[i]); o.material = new THREE.MeshLambertMaterial({ color: c, emissive: c.clone().multiplyScalar(0.14), skinning: true }); } else o.visible = false; });
    const bb = new THREE.Box3().setFromObject(model); const c = bb.getCenter(new THREE.Vector3()); const sz = bb.getSize(new THREE.Vector3());
    const torsoY = bb.min.y + sz.y * 0.66;
    const r2 = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); r2.setSize(80, 80); r2.setClearColor(0x000000);
    const cam2 = new THREE.PerspectiveCamera(28, 1, 0.1, 100); cam2.position.set(c.x, torsoY, c.z + sz.y * 0.5); cam2.lookAt(c.x, torsoY, c.z);
    const sc2 = new THREE.Scene(); sc2.add(new THREE.AmbientLight(0xffffff, 0.62)); const s2 = new THREE.DirectionalLight(0xfff6e8, 0.84); s2.position.set(30, 85, -24); sc2.add(s2); sc2.add(new THREE.HemisphereLight(0x9fc0ec, 0x2c6a1d, 0.42));[[60, 40, 40], [-60, 40, 40], [60, 40, -40], [-60, 40, -40]].forEach(p => { const fl = new THREE.PointLight(0xffffff, 0.50, 280); fl.position.set(p[0], p[1], p[2]); sc2.add(fl); }); sc2.add(model);
    r2.render(sc2, cam2);
    const gl = r2.getContext(); const px = new Uint8Array(4); gl.readPixels(40, 40, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    out.push({ hex: cands[i], px: [px[0], px[1], px[2]] });
    r2.dispose();
  }
  return { url: renderer.domElement.toDataURL('image/png'), samples: out };
}, cands);
fs.writeFileSync(path.join(OUT, 'granata-tune.png'), Buffer.from(res.url.split(',')[1], 'base64'));
await browser.close(); srv.close();
console.log('candidati (hex → pixel petto renderizzato sotto luci match):');
res.samples.forEach(s => { const [r, gg, b] = s.px; const rosy = b > 70 && r > 180; console.log(`  ${s.hex} → rgb(${r},${gg},${b})${r >= 250 ? ' ⚠️R-CLAMP' : ''}${rosy ? ' ⚠️ROSA' : ''}`); });
console.log('pageerror:', errs.length ? errs : 0, '· screenshot → out/kit3d/granata-tune.png');
