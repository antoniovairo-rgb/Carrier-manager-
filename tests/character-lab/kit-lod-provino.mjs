/* [23/09] «I giocatori non si vedono bene, il kit non si e' disegnato bene» (PO, telefono). Provino isolato: un corpo
   CGTrader per LOD (0/1/2), posa idle, kit a colore pieno come fa `_applyHyperKit` (maglia/pantaloncini: map=null,
   colore del club). Varianti: completo, e con UNA mesh nascosta alla volta, per sapere da quale mesh vengono le
   chiazze sulla maglia. Fotografa in `kit-lod-provino/`. Nessun codice di gioco coinvolto. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'kit-lod-provino'); fs.mkdirSync(out, { recursive: true });
const server = await startServer();
const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 420, height: 620 } })).newPage();
try {
  await installCdnRoutes(page);
  await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html`);
  await page.waitForFunction(() => window.THREE && THREE.GLTFLoader && THREE.SkeletonUtils, null, { timeout: 60000 });
  await page.evaluate(() => { document.body.innerHTML = ''; const c = document.createElement('canvas'); c.id = 'k'; c.width = 420; c.height = 620; c.style.cssText = 'position:fixed;left:0;top:0'; document.body.appendChild(c); });
  const lods = (process.env.CPM_LODS || 'lod0,lod1,lod2').split(',');
  const nascondi = (process.env.CPM_HIDE ?? ',0,1,2,3,4,5,6').split(',');
  const MODE = process.env.CPM_MODE || ''; /* '' | basic (senza luce) | normals (computeVertexNormals) | mask (BLEND→MASK: opaco, depthWrite, alphaTest 0.5) */
  const report = {};
  for (const lod of lods) for (const h of nascondi) {
    const info = await page.evaluate(async ({ lod, h, MODE }) => {
      const gltf = window.__kitCache?.[lod] || await new Promise((ok, ko) => new THREE.GLTFLoader().load(`./assets/cgtrader-review-${lod}-kit-adapter.glb`, ok, undefined, ko));
      (window.__kitCache = window.__kitCache || {})[lod] = gltf;
      const r = new THREE.WebGLRenderer({ canvas: document.getElementById('k'), antialias: true }); r.setSize(420, 620, false); r.setClearColor(0x2e7d32);
      r.outputEncoding = THREE.sRGBEncoding;
      const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x445544, 0.9)); const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(3, 6, 5); scene.add(d);
      const v = THREE.SkeletonUtils.clone(gltf.scene); scene.add(v);
      const meshes = []; v.traverse(o => { if (o.isMesh) meshes.push(o); });
      meshes.forEach(m => { const mats = Array.isArray(m.material) ? m.material : [m.material]; m.material = mats.map(b => { if (b.name === 'HyperShirt' || b.name === 'HyperShorts') { const c = b.clone(); c.map = null; c.color = new THREE.Color(b.name === 'HyperShirt' ? '#c2185b' : '#f5f5f5'); c.needsUpdate = true; return c; } return b; }); if (m.material.length === 1) m.material = m.material[0]; m.frustumCulled = false; });
      if (h !== '') meshes[+h].visible = false;
      const diag = meshes.map(m => { const g = m.geometry, n = g.attributes.normal, idx = g.index; let bad = 0, zero = 0; if (n) for (let i = 0; i < n.count; i++) { const l = Math.hypot(n.getX(i), n.getY(i), n.getZ(i)); if (l < 0.5) zero++; else if (Math.abs(l - 1) > 0.05) bad++; } const tri = idx ? idx.count / 3 : g.attributes.position.count / 3; const seen = new Set(); let dup = 0; if (idx) for (let t = 0; t < tri; t++) { const k = [idx.getX(3 * t), idx.getX(3 * t + 1), idx.getX(3 * t + 2)].sort((a, b) => a - b).join(','); if (seen.has(k)) dup++; else seen.add(k); } return { name: m.name, mat: (Array.isArray(m.material) ? m.material[0] : m.material).name, vtx: g.attributes.position.count, tri, zeroN: zero, badN: bad, dupTri: dup }; });
      if (MODE === 'basic') meshes.forEach(m => { const o = Array.isArray(m.material) ? m.material[0] : m.material; const b = new THREE.MeshBasicMaterial({ map: o.map, color: o.color, skinning: true }); m.material = b; });
      if (MODE === 'mask') meshes.forEach(m => (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { x.transparent = false; x.depthWrite = true; x.alphaTest = 0.5; x.needsUpdate = true; }));
      if (MODE === 'normals') meshes.forEach(m => m.geometry.computeVertexNormals());
      const mx = new THREE.AnimationMixer(v); const idle = gltf.animations.find(c => c.name === 'idle'); if (idle) { mx.clipAction(idle).play(); mx.setTime(0.4); }
      v.updateMatrixWorld(true);
      let lo = Infinity, hi = -Infinity; v.traverse(o => { if (o.isBone) { const p = new THREE.Vector3(); o.getWorldPosition(p); lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); } });
      const H = hi - lo, cy = lo + H * 0.62;
      const cam = new THREE.PerspectiveCamera(30, 420 / 620, 0.01, 100); cam.position.set(0, cy, H * 1.55); cam.lookAt(0, cy, 0);
      r.render(scene, cam); r.dispose();
      return { mesh: h === '' ? null : { name: meshes[+h].name, mat: (meshes[+h].material.name || '') }, H: +H.toFixed(3), diag };
    }, { lod, h, MODE });
    const f = `${lod}-${h === '' ? 'completo' : 'senza' + h}${MODE ? '-' + MODE : ''}.png`;
    await page.locator('#k').screenshot({ path: path.join(out, f) });
    report[f] = info;
  }
  fs.writeFileSync(path.join(out, `report${MODE ? '-' + MODE : ''}.json`), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
} finally { await browser.close(); server.close(); }
