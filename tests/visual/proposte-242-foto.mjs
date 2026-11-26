// [giro 242, PO-505 — SOLO PROPOSTA] Provini delle clip candidate per doppio passo / sterzata sul NOSTRO corpo (CGTrader LOD1),
// con three r128 come nel gioco, in una pagina vuota (nessun file del gioco caricato). Per ogni clip: 8 fotogrammi in sequenza
// con la scia del bacino a terra (per vedere il cambio di direzione) + misure: durata, percorso del bacino, cambio di rotta,
// pianta sotto il suolo (sui VERTICI deformati), passo massimo di un piede.
// Uso: CPM_CHROME=/opt/pw-browsers/chromium node proposte-242-foto.mjs <cartella-uscita> <file.glb>:<clip>[:etichetta] ...
// I GLB candidati restano FUORI dal repo (cartella di prova): questa sonda li legge da un percorso assoluto.
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { conPrivacy394 } from './lib/privacy-394.mjs'; /* [giro 394 PO-529] servizi del browser spenti */
const QUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(QUI, '../..');
const OUT = path.resolve(process.argv[2]); fs.mkdirSync(OUT, { recursive: true });
const VOCI = process.argv.slice(3).map(s => { const [f, c, e] = s.split(':'); return { f: path.resolve(REPO, f), c, e: e || c }; });
const CORPO = path.join(REPO, 'assets/cgtrader-review-lod1-kit-adapter.glb');
const br = await chromium.launch(conPrivacy394({ executablePath: process.env.CPM_CHROME || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }));
const page = await br.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.route('http://cpm.local/**', r => {
  const p = decodeURIComponent(new URL(r.request().url()).pathname);
  if (p === '/') return r.fulfill({ contentType: 'text/html', body: '<!doctype html><body style="margin:0;background:#8a8f96"></body>' });
  r.fulfill({ body: fs.readFileSync(p.slice(3)), contentType: 'application/octet-stream' });   // /f/<percorso assoluto>
});
await page.goto('http://cpm.local/');
await page.addScriptTag({ path: path.join(QUI, 'node_modules/three/build/three.min.js') });
await page.addScriptTag({ path: path.join(QUI, 'node_modules/three/examples/js/loaders/GLTFLoader.js') });
await page.evaluate(async (CORPO) => {
  const L = new THREE.GLTFLoader(); window.__carica = u => new Promise((ok, ko) => L.load('http://cpm.local/f/' + u, ok, null, ko));
  const corpo = await window.__carica(CORPO);
  const W = 320, H = 400;
  const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H); R.setPixelRatio(2);
  R.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x8a8f96);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.9)); const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(2, 4, 3); sc.add(dl);
  const suolo = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshLambertMaterial({ color: 0x6f9a62 })); suolo.rotation.x = -Math.PI / 2; sc.add(suolo);
  const griglia = new THREE.GridHelper(30, 30, 0x4d6e44, 0x5f8655); griglia.position.y = 0.002; sc.add(griglia);
  const palla = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshLambertMaterial({ color: 0xffffff })); palla.visible = false; sc.add(palla);
  const m = corpo.scene; sc.add(m);
  const cam = new THREE.PerspectiveCamera(34, W / H, 0.05, 80);
  const mix = new THREE.AnimationMixer(m);
  const osso = n => { let o; m.traverse(x => { if (x.name === n) o = x; }); return o; };
  const pelvis = osso('pelvis'), piedi = [osso('foot_l'), osso('foot_r')];
  const pelli = []; m.traverse(o => { if (o.isSkinnedMesh) { pelli.push(o); o.frustumCulled = false; } });
  const v = new THREE.Vector3();
  const minY = () => { let y = 1e9; m.updateMatrixWorld(true);
    for (const s of pelli) { const pos = s.geometry.attributes.position; s.skeleton.update();
      for (let i = 0; i < pos.count; i += 7) { v.fromBufferAttribute(pos, i); s.boneTransform(i, v); v.applyMatrix4(s.matrixWorld); if (v.y < y) y = v.y; } }
    return y; };
  const y0 = minY();
  let scia = null;
  window.__foglio = async (file, nome, etichetta) => {
    const g = await window.__carica(file); const cl = g.animations.find(c => c.name === nome);
    if (!cl) return { errore: 'clip assente: ' + nome };
    const a = mix.clipAction(cl); mix.stopAllAction(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.reset().play();
    // percorso del bacino a 30 fps e misure
    const P = [], wp = new THREE.Vector3(); let sotto = 0, passoMax = 0, prev = null;
    for (let t = 0; t < cl.duration - 1e-3; t += 1 / 30) {
      a.reset().play(); mix.setTime(t); m.updateMatrixWorld(true); pelvis.getWorldPosition(wp); P.push(wp.clone());
      const y = minY() - y0; if (-y > sotto) sotto = -y;
      const fp = piedi.map(o => { const q = new THREE.Vector3(); o.getWorldPosition(q); return q; });
      if (prev) fp.forEach((q, i) => { passoMax = Math.max(passoMax, q.distanceTo(prev[i])); }); prev = fp;
    }
    let lung = 0; for (let i = 1; i < P.length; i++) lung += Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z);
    // rotta: direzione media del primo e dell'ultimo quarto del percorso
    const dir = (i0, i1) => { const d = new THREE.Vector2(P[i1].x - P[i0].x, P[i1].z - P[i0].z); return d.length() > 0.05 ? d.normalize() : null; };
    const q = Math.max(1, Math.floor(P.length / 4)); const d0 = dir(0, q), d1 = dir(P.length - 1 - q, P.length - 1);
    const svolta = d0 && d1 ? Math.round(Math.acos(Math.max(-1, Math.min(1, d0.dot(d1)))) * 180 / Math.PI) : null;
    if (scia) sc.remove(scia);
    scia = new THREE.Line(new THREE.BufferGeometry().setFromPoints(P.map(p => new THREE.Vector3(p.x, 0.01, p.z))), new THREE.LineBasicMaterial({ color: 0xffd400 }));
    sc.add(scia);
    // inquadratura fissa che contiene tutto il percorso, da 3/4 dietro-lato rispetto alla rotta iniziale
    const c = new THREE.Vector3(); P.forEach(p => c.add(p)); c.divideScalar(P.length);
    let ext = 0; P.forEach(p => { ext = Math.max(ext, Math.hypot(p.x - c.x, p.z - c.z)); });
    const ang = d0 ? Math.atan2(d0.y, d0.x) : 0; const dist = 4.2 + ext * 1.6;
    cam.position.set(c.x - Math.cos(ang) * dist * 0.55 + Math.sin(ang) * dist * 0.84, 1.9 + ext * 0.35, c.z - Math.sin(ang) * dist * 0.55 - Math.cos(ang) * dist * 0.84);
    cam.lookAt(c.x, 0.8, c.z);
    const N = 8, fot = [];
    for (let k = 0; k < N; k++) {
      const t = Math.min(cl.duration - 1 / 60, cl.duration * k / (N - 1)); a.reset().play(); mix.setTime(t); m.updateMatrixWorld(true);
      { const pp = new THREE.Vector3(); pelvis.getWorldPosition(pp); const sx = d0 ? -d0.y : 0, sz = d0 ? d0.x : 1;   // di lato rispetto alla rotta iniziale, alle spalle di 3/4
        cam.position.set(pp.x + sx * 4.6 - (d0 ? d0.x : 0) * 2.2, 1.7, pp.z + sz * 4.6 - (d0 ? d0.y : 0) * 2.2); cam.lookAt(pp.x, 0.75, pp.z); }
      R.render(sc, cam);
      const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; const gg = cv.getContext('2d');
      gg.drawImage(R.domElement, 0, 0); gg.fillStyle = 'rgba(0,0,0,.55)'; gg.fillRect(0, 0, cv.width, 50);
      gg.fillStyle = '#fff'; gg.font = '600 28px sans-serif'; gg.fillText(`${k + 1}/${N} · ${t.toFixed(2).replace('.', ',')} s`, 16, 35);
      fot.push(cv);
    }
    const out = document.createElement('canvas'); const pw = fot[0].width, ph = fot[0].height;
    out.width = pw * 4; out.height = ph * 2 + 60; const o = out.getContext('2d'); o.fillStyle = '#1d2329'; o.fillRect(0, 0, out.width, out.height);
    o.fillStyle = '#fff'; o.font = '700 34px sans-serif'; o.fillText(etichetta, 18, 44);
    fot.forEach((cv, i) => o.drawImage(cv, (i % 4) * pw, 60 + Math.floor(i / 4) * ph));
    return { url: out.toDataURL('image/jpeg', 0.8), clip: nome, durata_s: +cl.duration.toFixed(3), fotogrammi_30fps: Math.round(cl.duration * 30) + 1,
      tracce: cl.tracks.length, bacino_percorso_m: +lung.toFixed(2), svolta_gradi: svolta, sotto_suolo_cm: +(sotto * 100).toFixed(1), passo_piede_max_cm: +(passoMax * 100).toFixed(1) };
  };
}, CORPO);
const misure = [];
for (const { f, c, e } of VOCI) {
  const r = await page.evaluate(([f, c, e]) => window.__foglio(f, c, e), [f, c, e]);
  if (r.errore) { console.log('ERRORE', r.errore); continue; }
  fs.writeFileSync(path.join(OUT, `${c}.jpg`), Buffer.from(r.url.split(',')[1], 'base64')); delete r.url;
  r.file = path.relative(REPO, f).startsWith('..') ? '(cartella di prova, fuori dal repo) ' + path.basename(f) : path.relative(REPO, f);
  misure.push(r); console.log('CLIP ' + JSON.stringify(r));
}
fs.writeFileSync(path.join(OUT, 'misure.json'), JSON.stringify(misure, null, 1) + '\n');
await br.close();
