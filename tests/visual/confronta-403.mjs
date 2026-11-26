#!/usr/bin/env node
/* [giro 403 — PO-579] SONDA (non guardiano): differenza visiva MISURATA fra due versioni dello stesso GLB.
   Ogni file e' disegnato da three r128 + GLTFLoader r128 (gli stessi del gioco) in posa di riposo, camera fissa frontale e
   di tre quarti, luci fisse, due volte per versione (la seconda e' il rumore: deve fare 0). Numeri per vista:
   diff media per canale (0-255) · quota di pixel con scarto > 8 · scarto massimo · PSNR (dB).
   Uso: node confronta-403.mjs <cartella A con assets/…> <cartella B con assets/…> <uscita> assets/x.glb [assets/y.glb …]
   (i PNG delle viste finiscono in <uscita>: A-<file>-<vista>.png, B-…) */
import fs from 'fs'; import path from 'path'; import http from 'http';
import { launchBrowser } from './lib/harness.mjs';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [A, B, OUT, ...FILES] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const NM = path.join(HERE, 'node_modules/three');
const pagina = `<!doctype html><html><body style="margin:0;background:#000"><canvas id=c width=480 height=720></canvas>
<script src="/three.min.js"></script><script src="/GLTFLoader.js"></script><script>
window.disegna = async (url, vista) => { const r = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, preserveDrawingBuffer: true });
  r.outputEncoding = THREE.sRGBEncoding; r.setClearColor(0x30343a);
  const s = new THREE.Scene(); s.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.9)); const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(2, 4, 3); s.add(d);
  const g = await new Promise((ok, ko) => new THREE.GLTFLoader().load(url, ok, undefined, ko));
  s.add(g.scene); g.scene.updateMatrixWorld(true);
  let bb = new THREE.Box3(); const _v = new THREE.Vector3(); g.scene.traverse(o => { if (o.isBone) bb.expandByPoint(o.getWorldPosition(_v)); }); if (bb.isEmpty()) bb = new THREE.Box3().setFromObject(g.scene); else bb.expandByScalar(bb.getSize(_v).y * 0.08); /* corpo con scheletro: riquadro dalle OSSA (la geometria non deformata ha un'altra scala) */ const c = bb.getCenter(new THREE.Vector3()); const z = bb.getSize(new THREE.Vector3());
  const h = Math.max(z.y, z.x * 1.5, z.z * 1.5) || 1; const cam = new THREE.PerspectiveCamera(30, 480 / 720, h / 100, h * 100);
  const ang = vista === 'tq' ? 0.7 : 0; const dist = vista === 'viso' ? z.y * 0.35 : h * 2.0; if (vista === 'viso') c.y = bb.max.y - z.y * 0.12; cam.position.set(c.x + Math.sin(ang) * dist, c.y, c.z + Math.cos(ang) * dist); cam.lookAt(c);
  let tex = 0; g.scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { if (m.map && m.map.image) tex++; }); });
  r.render(s, cam); const px = new Uint8Array(480 * 720 * 4); const gl = r.getContext(); gl.readPixels(0, 0, 480, 720, gl.RGBA, gl.UNSIGNED_BYTE, px);
  r.dispose(); return { px: Array.from(px), tex, png: document.getElementById('c').toDataURL('image/png') }; };
</script></body></html>`;
const srv = http.createServer((q, s) => { const u = decodeURIComponent(q.url.split('?')[0]);
  const fp = u === '/' ? null : u === '/three.min.js' ? path.join(NM, 'build/three.min.js') : u === '/GLTFLoader.js' ? path.join(NM, 'examples/js/loaders/GLTFLoader.js') : u.startsWith('/A/') ? path.join(A, u.slice(3)) : u.startsWith('/B/') ? path.join(B, u.slice(3)) : null;
  if (!fp) { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(pagina); }
  fs.readFile(fp, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200); s.end(d); }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const br = await launchBrowser(); const righe = [];
for (const f of FILES) for (const vista of ['fronte', 'tq', 'viso']) {
  const pg = await br.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  await pg.goto(`http://localhost:${port}/`);
  const run = async lato => { try { return await pg.evaluate(([u, v]) => window.disegna(u, v), [`/${lato}/${f}`, vista]); } catch (e) { errs.push(lato + ': ' + e.message.slice(0, 120)); return null; } };
  const a1 = await run('A'), a2 = await run('A'), b1 = await run('B');
  const cmp = (x, y) => { if (!x || !y) return null; let sum = 0, over = 0, max = 0, se = 0; const n = x.px.length / 4;
    for (let i = 0; i < x.px.length; i += 4) { let m = 0; for (let k = 0; k < 3; k++) { const d = Math.abs(x.px[i + k] - y.px[i + k]); sum += d; se += d * d; if (d > m) m = d; } if (m > 8) over++; if (m > max) max = m; }
    const mse = se / (n * 3); return { media: +(sum / (n * 3)).toFixed(3), oltre8: +(over / n * 100).toFixed(3), max, psnr: mse ? +(10 * Math.log10(255 * 255 / mse)).toFixed(1) : Infinity }; };
  const nome = path.basename(f, '.glb');
  for (const [lato, x] of [['A', a1], ['B', b1]]) if (x) fs.writeFileSync(path.join(OUT, `${lato}-${nome}-${vista}.png`), Buffer.from(x.png.split(',')[1], 'base64'));
  const r = { f, vista, texA: a1 && a1.tex, texB: b1 && b1.tex, rumore: cmp(a1, a2), diff: cmp(a1, b1), errs };
  righe.push(r); console.log(JSON.stringify(r)); await pg.close();
}
await br.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'confronto.json'), JSON.stringify(righe, null, 1));
