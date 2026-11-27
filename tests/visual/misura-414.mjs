#!/usr/bin/env node
/* [giro 414 · PO-678] SONDA dell'ATTACCATURA dei capelli: la fascia chiara fra capelli e fronte nei primi piani.
   Apre una partita vera all'ingresso in campo (GLB acceso, ora congelata, salvataggio fixtures/save-190-s12-ovr93.json, come misura-412)
   e per ogni corpo con nome fotografa il viso da tre direzioni (fronte, tre quarti a destra e a sinistra), con gli altri corpi nascosti e
   NIENTE fra la camera e la testa (porta, reti, cartelloni: un raggio dalla camera alla testa nasconde cio' che incontra).
   Per ogni foto fa anche un passaggio di ETICHETTE: la testa disegnata con una texture che vale CAPELLI dove le quattro texture della
   testa differiscono (la calotta, a 1024 px, la stessa regola della maschera del giro 240 ma a risoluzione piena e senza dilatazione)
   e PELLE altrove, senza luci; il resto del corpo nero. Cosi' ogni pixel del primo piano sa se e' capelli, pelle o fondo.
   Misura:
     · CONFINE = pixel di PELLE entro R px (R = 3% del lato del viso a schermo) da un pixel di CAPELLI;
     · INTERNO = pixel di pelle oltre 2R dai capelli;
     · CHIARO = L* (CIELAB) piu' alto della mediana di L* dell'INTERNO di oltre 15 punti (un pixel «quasi bianco» rispetto a quel viso).
   Quota per viso = chiari del confine / pixel del confine; si stampa anche la stessa quota nell'interno (riflessi veri della fronte).
   Uso: node misura-414.mjs [--rosso] · CPM_TOD=night|day · CPM_JSON=out/g414/x.json · CPM_FOTO=dir (scrive i primi piani) */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriIngresso } from './misura-412.mjs';
import fs from 'node:fs';
import path from 'node:path';

/* in pagina: prepara la texture delle etichette (una volta) */
export async function preparaEtichette(p) {
  return p.evaluate(async () => {
    if (window.__G414LAB) return true;
    const ld = v => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = './assets/hair-colors/source-textures/HEAD_hair_' + v + '.png'; });
    const [a, b] = await Promise.all([ld('black'), ld('blond')]); if (!a || !b) return false;
    const N = 1024, mk = im => { const c = document.createElement('canvas'); c.width = N; c.height = N; const g = c.getContext('2d'); g.drawImage(im, 0, 0, N, N); return g.getImageData(0, 0, N, N).data; };
    const A = mk(a), B = mk(b), D = new Float32Array(N * N);
    for (let i = 0, j = 0; i < A.length; i += 4, j++) D[j] = (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) > 10 ? 1 : 0;
    const boxa = (src, k) => { const W1 = N + 1, I = new Float64Array(W1 * W1), o = new Float32Array(N * N), n2 = (2 * k + 1) * (2 * k + 1); for (let y = 0; y < N; y++) { let r = 0; for (let x = 0; x < N; x++) { r += src[y * N + x]; I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + r; } }
      for (let y = 0; y < N; y++) { const y0 = Math.max(0, y - k), y1 = Math.min(N, y + k + 1); for (let x = 0; x < N; x++) { const x0 = Math.max(0, x - k), x1 = Math.min(N, x + k + 1); o[y * N + x] = (I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0]) / n2; } } return o; };
    const Z = boxa(D, 40); for (let j = 0; j < Z.length; j++) Z[j] = Z[j] >= 0.6 ? 1 : 0; const Zd = boxa(Z, 24);
    const cv = document.createElement('canvas'); cv.width = N; cv.height = N; const g = cv.getContext('2d'), O = g.createImageData(N, N);
    for (let i = 0, j = 0; i < A.length; i += 4, j++) { const cap = D[j] && Zd[j] > 0; O.data[i] = cap ? 255 : 0; O.data[i + 1] = cap ? 0 : 255; O.data[i + 2] = 0; O.data[i + 3] = 255; }
    g.putImageData(O, 0, 0); const t = new THREE.CanvasTexture(cv); t.flipY = false; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    window.__G414LAB = t; return true; });
}

/* in pagina: un primo piano + il suo passaggio di etichette; ritorna i pixel come base64 RGBA */
export async function scatta(p, nome, ang) {
  return p.evaluate(([nome, ang]) => {
    const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null;
    S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true);
    let head = null; o.traverse(b => { if (b.isBone && /^head$/i.test(b.name) && !head) head = b.getWorldPosition(new T.Vector3()); }); if (!head) return null;
    const root = o.parent || o, ry = root.rotation.y + ang, fw = new T.Vector3(Math.sin(ry), 0, Math.cos(ry));
    const hp = head.clone(); hp.y += 0.07;
    const gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const cam = new T.PerspectiveCamera(16, W / H, 0.8, 60); /* piano vicino a 0,8 m (la testa sta a ~1 m): porta, reti e cartelloni FRA camera e viso restano fuori dal disegno */ cam.position.copy(hp).addScaledVector(fw, 1.0); cam.position.y += 0.05; cam.lookAt(hp); cam.updateMatrixWorld(true);
    const mie = new Set(); o.traverse(x => mie.add(x));
    const nascosti = []; S.traverseVisible(x => { if (x.isSkinnedMesh && !mie.has(x)) nascosti.push(x); });
    /* niente fra camera e testa: ogni oggetto non del corpo che il raggio camera→testa incontra (porta, reti, cartelloni) si nasconde */
    const rc = new T.Raycaster(); rc.camera = cam; const cand = []; S.traverseVisible(x => { if (x.isMesh && !x.isSkinnedMesh && !mie.has(x)) cand.push(x); }); const dir = hp.clone().sub(cam.position); const dist = dir.length(); dir.normalize();
    for (let k = 0; k < 6; k++) { rc.set(cam.position, dir); rc.far = dist - 0.15; let hits = []; for (const c of cand) { if (!c.visible) continue; try { hits.push(...rc.intersectObject(c, false)); } catch (e) {} } hits.sort((a, b) => a.distance - b.distance); const hit = hits.find(h => h.object.visible && !mie.has(h.object)); if (!hit) break; nascosti.push(hit.object); hit.object.visible = false; }
    /* i pali della porta hanno depthTest:false (src/11, 7.8.11/7.15.0): si disegnano SOPRA tutto, anche sopra un corpo che sta davanti. Nella foto si nascondono */
    S.traverseVisible(x => { if (x.isMesh && !mie.has(x) && x.material && !Array.isArray(x.material) && x.material.depthTest === false) nascosti.push(x); });
    nascosti.forEach(x => x.visible = false);
    const leggi = () => { R.render(S, cam); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
    const viso = leggi(); const png = R.domElement.toDataURL('image/png');
    /* passaggio di etichette */
    const bg = S.background, fog = S.fog; S.background = new T.Color(0, 0, 1); S.fog = null; const scambi = [];
    const altriVis = []; S.traverseVisible(x => { if ((x.isMesh || x.isSprite || x.isPoints || x.isLine) && !mie.has(x)) altriVis.push(x); }); altriVis.forEach(x => x.visible = false);
    o.traverse(m => { if (!m.isMesh || !m.material) return; const L = Array.isArray(m.material) ? m.material : [m.material];
      const nx = L.map(mt => { const testa = mt && /^(Material\.002|KorwardNativeHair_)/.test(mt.name || ''); const b = new T.MeshBasicMaterial({ color: testa ? 0xffffff : 0x000000, map: testa ? window.__G414LAB : null, fog: false, toneMapped: false }); b.skinning = !!m.isSkinnedMesh; b.side = mt ? mt.side : T.FrontSide; return b; });
      scambi.push([m, m.material]); m.material = Array.isArray(m.material) ? nx : nx[0]; });
    const enc = R.outputEncoding, tm = R.toneMapping; R.outputEncoding = T.LinearEncoding; R.toneMapping = T.NoToneMapping;
    const lab = leggi();
    R.outputEncoding = enc; R.toneMapping = tm; scambi.forEach(([m, mt]) => { const L = Array.isArray(m.material) ? m.material : [m.material]; L.forEach(x => x.dispose()); m.material = mt; });
    altriVis.forEach(x => x.visible = true); S.background = bg; S.fog = fog; nascosti.forEach(x => x.visible = true);
    const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
    return { W, H, viso: b64(viso), lab: b64(lab), png };
  }, [nome, ang]);
}

const srgb2lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
function Lstar(r, g, b) { const Y = 0.2126 * srgb2lin(r) + 0.7152 * srgb2lin(g) + 0.0722 * srgb2lin(b); return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; }

/* analisi di uno scatto */
export function analizza(s, DL = 15) {
  const { W, H } = s; const V = Buffer.from(s.viso, 'base64'), Lb = Buffer.from(s.lab, 'base64'); const n = W * H;
  const cls = new Uint8Array(n); /* 0 fondo/corpo · 1 capelli · 2 pelle */
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let i = 0; i < n; i++) { const r = Lb[i * 4], g = Lb[i * 4 + 1], b = Lb[i * 4 + 2]; if (r > 160 && g < 90 && b < 90) cls[i] = 1; else if (g > 160 && r < 90 && b < 90) cls[i] = 2; if (cls[i]) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  const lato = Math.max(1, Math.min(x1 - x0, y1 - y0)); const R = Math.max(2, Math.round(lato * 0.03));
  /* distanza (scacchiera) dai capelli, due passate */
  const INF = 1e9, d = new Float32Array(n).fill(INF); for (let i = 0; i < n; i++) if (cls[i] === 1) d[i] = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let v = d[i]; if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + 1); if (x < W - 1) v = Math.min(v, d[i - W + 1] + 1); } d[i] = v; }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; let v = d[i]; if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (y < H - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + 1); if (x > 0) v = Math.min(v, d[i + W - 1] + 1); } d[i] = v; }
  const Lint = [], conf = [], intL = []; let nCap = 0;
  for (let i = 0; i < n; i++) { if (cls[i] === 1) nCap++; if (cls[i] !== 2) continue; const L = Lstar(V[i * 4], V[i * 4 + 1], V[i * 4 + 2]); if (d[i] > 0 && d[i] <= R) conf.push(L); else if (d[i] > 2 * R) { Lint.push(L); intL.push(L); } }
  if (Lint.length < 200 || conf.length < 50 || nCap < 200) return { giudicato: false, R, nInt: Lint.length, nConf: conf.length, nCap };
  Lint.sort((a, b) => a - b); const med = Lint[Lint.length >> 1];
  const chiari = conf.filter(L => L > med + DL).length, chiariInt = intL.filter(L => L > med + DL).length;
  const cm = [...conf].sort((a, b) => a - b);
  return { giudicato: true, R, Lpelle: +med.toFixed(1), Lconf50: +cm[cm.length >> 1].toFixed(1), Lconf95: +cm[Math.floor(cm.length * 0.95)].toFixed(1), nConf: conf.length, quota: +(chiari / conf.length).toFixed(4), quotaInt: +(chiariInt / intL.length).toFixed(4) };
}

export const ANG414 = [0, 0.6, -0.6];
export async function misuraTutti(b, port, flags, tod, fotoDir) {
  process.env.CPM_TOD = tod;
  const { ctx, p, err, ok } = await apriIngresso(b, port, flags);
  if (!ok) { await ctx.close(); return { giudicato: false, motivo: 'ingresso non raggiunto', err }; }
  if (!await preparaEtichette(p)) { await ctx.close(); return { giudicato: false, motivo: 'texture della testa non caricate' }; }
  const corpi = await p.evaluate(() => { const S = window.__CPM3D.scene, o = []; S.traverseVisible(x => { const c = x.userData && x.userData.chi240; if (c && c.nome) { let fg = null; try { fg = aspettoFigurina225(c.nome); } catch (e) {} o.push({ nome: c.nome, ruolo: c.ruolo, h: fg ? fg.h : null, p: fg ? fg.p : null, testa: (x.userData.cpmNativeHair || {}).variant || null }); } }); return o; });
  const righe = [];
  for (const c of corpi) for (const a of ANG414) {
    const s = await scatta(p, c.nome, a); if (!s) { righe.push({ ...c, ang: a, giudicato: false }); continue; }
    const m = analizza(s); righe.push({ ...c, ang: a, ...m });
    if (fotoDir) fs.writeFileSync(path.join(fotoDir, `${tod}-${c.nome.replace(/\W+/g, '_')}${a ? (a > 0 ? '-dx' : '-sx') : ''}.png`), Buffer.from(s.png.split(',')[1], 'base64'));
  }
  await ctx.close();
  return { giudicato: true, righe, err };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ROSSO = process.argv.includes('--rosso'), TOD = process.env.CPM_TOD || 'night';
  fs.mkdirSync('out/g414', { recursive: true }); const fd = process.env.CPM_FOTO || null; if (fd) fs.mkdirSync(fd, { recursive: true });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const r = await misuraTutti(b, port, ROSSO ? ['__CPM_NO_G414'] : [], TOD, fd);
  await b.close(); srv.close();
  if (!r.giudicato) { console.log('NON GIUDICATO:', r.motivo); process.exit(1); }
  const J = process.env.CPM_JSON || `out/g414/misura-414-${TOD}-${ROSSO ? 'rosso' : 'verde'}.json`; fs.writeFileSync(J, JSON.stringify(r, null, 1));
  const G = r.righe.filter(x => x.giudicato); const q = G.map(x => x.quota).sort((a, b) => a - b);
  console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} · ora ${TOD} · scatti giudicati ${G.length}/${r.righe.length}`);
  console.log('nome | capelli | pelle | ang | L* pelle | L* confine 50/95 | quota chiari confine | quota interno');
  G.forEach(x => console.log([x.nome, x.h, x.p, x.ang, x.Lpelle, `${x.Lconf50}/${x.Lconf95}`, (x.quota * 100).toFixed(1) + '%', (x.quotaInt * 100).toFixed(1) + '%'].join(' | ')));
  console.log(`quota chiari al confine: mediana ${(q[q.length >> 1] * 100).toFixed(1)}% · massimo ${(q[q.length - 1] * 100).toFixed(1)}% · media ${(q.reduce((a, b) => a + b, 0) / q.length * 100).toFixed(1)}%`);
  if (r.err && r.err.length) console.log('errori di pagina', r.err);
}

/* [giro 414] FOTO AFFIANCATA figurina | corpo | viso (come foto() di misura-412) con le camere che TAGLIANO cio' che sta fra loro e il
   giocatore: piano vicino appena davanti al corpo (figura intera: 0,8 m prima; viso: 0,2 m prima). Nelle foto del giro 412 la traversa
   della porta stava davanti alla camera del portiere e tagliava il volto: era lo strumento, non il gioco. */
export async function foto414(p, nome, file, titolo) {
  const url = await p.evaluate(async ([nome, titolo]) => { const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true);
    const fg = aspettoFigurina225(nome); const dati = datiFigurina23('giocatore', o.userData.chi240.ruolo === 'eroe' ? 'eroe' : nome, o.userData.chi240.ruolo === 'eroe' ? null : nome);
    let head = null, hips = null; o.traverse(b => { if (!b.isBone) return; if (/^head$/i.test(b.name)) head = b.getWorldPosition(new T.Vector3()); if (/^pelvis$|hips/i.test(b.name) && !hips) hips = b.getWorldPosition(new T.Vector3()); });
    const root = o.parent || o; const ry = root.rotation.y; const fw = new T.Vector3(Math.sin(ry), 0, Math.cos(ry)); const base = (hips || head).clone();
    const mie = new Set(); o.traverse(x => mie.add(x)); const altri = []; S.traverseVisible(x => { if ((x.isSkinnedMesh || (x.isMesh && x.material && !Array.isArray(x.material) && x.material.depthTest === false)) && !mie.has(x)) altri.push(x); }); altri.forEach(x => x.visible = false); /* corpi e pali della porta (depthTest:false: si disegnano sopra tutto) */
    const gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const cam = new T.PerspectiveCamera(24, W / H, 4.4, 120);
    const mid = new T.Vector3(base.x, (head ? head.y : 1.6) * 0.55, base.z); cam.position.copy(mid).addScaledVector(fw, 5.2); cam.position.y = mid.y + 0.25; cam.lookAt(mid); cam.updateMatrixWorld(true);
    R.render(S, cam); const shot = R.domElement.toDataURL('image/png');
    let shot2 = null; if (head) { const c2 = new T.PerspectiveCamera(20, W / H, 0.8, 60); const hp = head.clone(); hp.y += 0.06; c2.position.copy(hp).addScaledVector(fw, 1.0); c2.lookAt(hp); c2.updateMatrixWorld(true); R.render(S, c2); shot2 = R.domElement.toDataURL('image/png'); }
    altri.forEach(x => x.visible = true);
    const ld = (u) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
    const a = fg ? await ld(fg.file) : null, b = await ld(shot), c = shot2 ? await ld(shot2) : null; const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 560; const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, 1400, 560);
    if (a) g.drawImage(a, 20, 40, 440, 440); if (b) { const sc = Math.min(460 / b.width, 480 / b.height), w = b.width * sc, h = b.height * sc; g.drawImage(b, 480 + (460 - w) / 2, 40 + (480 - h) / 2, w, h); }
    if (c) { const s = Math.min(c.width, c.height); g.drawImage(c, (c.width - s) / 2, (c.height - s) / 2, s, s, 940, 40, 440, 440); }
    g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.fillText(nome + (dati && dati.cm ? ` — figurina ${dati.cm} cm, ${dati.kg} kg` : '') + (titolo ? ' · ' + titolo : ''), 20, 28);
    g.font = '16px sans-serif'; g.fillText('figurina (ritratto ' + (fg ? fg.n : '—') + ')', 20, 510); g.fillText('corpo 3D in partita (ingresso, GLB acceso)', 480, 510); g.fillText('primo piano del viso 3D', 940, 510);
    return cv.toDataURL('image/png'); }, [nome, titolo || '']);
  if (url) fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  return !!url;
}
