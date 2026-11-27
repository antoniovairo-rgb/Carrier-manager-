#!/usr/bin/env node
/* [giro 440 · PO-686 bis] SONDA DELLA RESA DELLA BARBA (non del tipo): figurina ↔ primo piano 3D sugli STESSI punti del viso.
   Il 432 giudicava il TIPO di barba (etichetta presente/assente) e usciva verde con barbe che il PO ha bocciato («barba terribile»):
   macchia nera opaca, bordi netti, bocca coperta, pizzetto a rettangolo, colore troppo scuro. Qui si misura la RESA.
   Metodo. I punti del viso si nominano in AZIMUT/ELEVAZIONE attorno al centro della testa (la griglia della rete radiale del giro 432:
   azimut 0 = fronte; MISURATI sulla texture della testa srotolata: rima della bocca -39, labbra -33..-44,5, mento -46..-58). Nel 3D ogni punto si proietta dalla rete della testa (stessa trasformazione
   degli strati, osso head) nella camera del primo piano di fronte; sulla figurina (ritratti 512x512, inquadratura costante: fondale bianco,
   occhi a ~0,39, bocca a ~0,59, mento a ~0,72 dell'altezza, misurati) con una mappa fissa tarata su questi punti (MAPPA_FIG440).
   Per ogni corpo con barba:
     · BOCCA: le labbra del 3D sono le celle con a* alto nella texture della testa (letta dal materiale, non disegnata da noi) attorno a
       (0,-32); «labbra visibili» = quota dei loro punti NON coperti dall'etichetta della barba (alfa >= 0,25). Sulla figurina la stessa zona.
     · BORDO: profilo dello scurimento D = L*pelle - L* lungo l'elevazione sulle guance (azimut +-40) e sul collo (azimut 0, sotto il mento),
       media mobile di 3 gradi: pendenza massima |dD/del| in L* per grado. Salto netto = pendenza alta.
     · COLORE: L*a*b* medio del nucleo della barba (mento, o baffi per i baffi) contro lo stesso nucleo della figurina, CIE76.
     · VARIANZA: deviazione standard di L* nel nucleo (tinta piatta = varianza bassa).
   Uso: node misura-440.mjs [nomi...] · CPM_TOD=night|day · CPM_ROSSO=1 (__CPM_NO_G440) · CPM_DEBUG=dir (sovrapposizione dei punti) */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriEPronti } from './misura-432.mjs';
import { preparaEtichette } from './misura-414.mjs';
import fs from 'node:fs';

/* figurina 512x512: x = 256 + KX*sin(az)*cos(el)*512 ; y = (Y0 - KY*el)*512 (el in gradi). Tarata a occhio su tre punti misurati
   (occhi -3 → 0,39 · narici -25 → 0,53 · rima della bocca -39 → 0,595; pupille a +-20 gradi → +-0,078) e sulla larghezza delle guance; controllo con CPM_DEBUG. */
export const MAPPA_FIG440 = { KX: 0.23, Y0: 0.375, KY: 0.0058 };
const RAD = Math.PI / 180;
export const GRIGLIA440 = (() => { const g = []; for (let el = -70; el <= 6; el += 1) for (let az = -69; az <= 69; az += 1.5) g.push([az, el]); return g; })();

export async function scatta440(p, nome) {
  return p.evaluate(async ([nome, G]) => {
    const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null;
    S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    let mesh = null; o.traverse(m => { if (!mesh && m.isSkinnedMesh && m.material && /^(Material\.002|KorwardNativeHair_)/.test((Array.isArray(m.material) ? m.material[0] : m.material).name || '')) mesh = m; }); if (!mesh) return null;
    const RT = _rete432(mesh); if (!RT) return null;
    S.updateMatrixWorld(true);
    const bone = mesh.skeleton.bones[RT.hb];
    /* proiezione dei punti (az,el) della rete: stessa trasformazione degli strati (osso head x boneInverse x bindMatrix) */
    const M = new T.Matrix4().multiplyMatrices(mesh.skeleton.boneInverses[RT.hb], mesh.bindMatrix); const BW = bone.matrixWorld.clone().multiply(M);
    /* camera FRONTALE rispetto alla testa (non al corpo: in camminata la testa e' inclinata), mirata alla bocca (0,-36), a 1 m */
    const pW = (azd, eld, f) => { const az = azd * Math.PI / 180, el = eld * Math.PI / 180, d = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]; return new T.Vector3(RT.C[0] + d[0] * f, RT.C[1] + d[1] * f, RT.C[2] + d[2] * f).applyMatrix4(BW); };
    const rB = RT.r[Math.floor(((-36 * Math.PI / 180) / Math.PI + 0.5) * NE432) * NA432 + (NA432 >> 1)]; const hp = pW(0, -36, rB), cen = pW(0, 0, 0), fw = pW(0, -10, 1).sub(cen).normalize();
    const gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const cam = new T.PerspectiveCamera(16, W / H, 0.5, 60); cam.position.copy(hp).addScaledVector(fw, 1.0); cam.lookAt(hp); cam.updateMatrixWorld(true);
    const NA = NA432, NE = NE432, v = new T.Vector3(), proj = new Float32Array(G.length * 2);
    for (let i = 0; i < G.length; i++) { const az = G[i][0] * Math.PI / 180, el = G[i][1] * Math.PI / 180; const a = Math.min(NA - 1, Math.max(0, Math.floor((az / (2 * Math.PI) + 0.5) * NA))), e = Math.min(NE - 1, Math.max(0, Math.floor((el / Math.PI + 0.5) * NE))); const r = RT.r[e * NA + a];
      if (!(r > 0)) { proj[i * 2] = -1; proj[i * 2 + 1] = -1; continue; }
      v.set(RT.C[0] + Math.sin(az) * Math.cos(el) * r, RT.C[1] + Math.sin(el) * r, RT.C[2] + Math.cos(az) * Math.cos(el) * r).applyMatrix4(BW).project(cam);
      proj[i * 2] = (v.x + 1) / 2 * W; proj[i * 2 + 1] = (v.y + 1) / 2 * H; /* riga dal basso, come readPixels */ }
    /* labbra: colore della texture della testa nelle celle attorno alla bocca (a* alto) */
    const mt = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material; let lab = null;
    try { const im = mt.map && mt.map.image; if (im) { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g2 = c.getContext('2d'); g2.drawImage(im, 0, 0, 512, 512); const d = g2.getImageData(0, 0, 512, 512).data; lab = [];
      for (let el = -48; el <= -28; el += 1) for (let az = -24; az <= 24; az += 1.5) { const a = Math.min(NA - 1, Math.floor(((az * Math.PI / 180) / (2 * Math.PI) + 0.5) * NA)), e = Math.min(NE - 1, Math.floor(((el * Math.PI / 180) / Math.PI + 0.5) * NE)), k = e * NA + a; if (!(RT.r[k] > 0)) continue;
        const u = RT.hu[k * 2], vv = RT.hu[k * 2 + 1]; const px = Math.min(511, Math.max(0, Math.floor(u * 512))), py = Math.min(511, Math.max(0, Math.floor((mt.map.flipY === false ? vv : 1 - vv) * 512))); const q = (py * 512 + px) * 4; lab.push([az, el, d[q], d[q + 1], d[q + 2]]); } } } catch (e) { lab = null; }
    /* i due rendering del primo piano (come scatta432, angolo 0) */
    const mie = new Set(); o.traverse(x => mie.add(x));
    const nascosti = []; S.traverseVisible(x => { if (x.isSkinnedMesh && !mie.has(x)) nascosti.push(x); });
    const rc = new T.Raycaster(); const cand = []; S.traverseVisible(x => { if (x.isMesh && !x.isSkinnedMesh && !mie.has(x)) cand.push(x); }); const dir = hp.clone().sub(cam.position); const dist = dir.length(); dir.normalize();
    for (let k = 0; k < 6; k++) { rc.set(cam.position, dir); rc.far = dist - 0.15; let hits = []; for (const c of cand) { if (!c.visible) continue; try { hits.push(...rc.intersectObject(c, false)); } catch (e) {} } hits.sort((a, b) => a.distance - b.distance); const hit = hits.find(h => h.object.visible && !mie.has(h.object)); if (!hit) break; nascosti.push(hit.object); hit.object.visible = false; }
    S.traverseVisible(x => { if (x.isMesh && !mie.has(x) && x.material && !Array.isArray(x.material) && x.material.depthTest === false) nascosti.push(x); });
    nascosti.forEach(x => x.visible = false);
    const leggi = () => { R.render(S, cam); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
    const viso = leggi(); const png = R.domElement.toDataURL('image/png');
    const barbe = []; o.traverse(m => { if (/^Barba432/.test(m.name || '') && m.visible) barbe.push(m); }); barbe.forEach(m => m.visible = false); const viso0 = leggi(); barbe.forEach(m => m.visible = true); /* lo stesso fotogramma senza barba: il fondo del viso */
    const bg = S.background, fog = S.fog; S.background = new T.Color(0, 0, 1); S.fog = null; const scambi = [];
    const altriVis = []; S.traverseVisible(x => { if ((x.isMesh || x.isSprite || x.isPoints || x.isLine) && !mie.has(x)) altriVis.push(x); }); altriVis.forEach(x => x.visible = false);
    o.traverse(m => { if (!m.isMesh || !m.material) return; const L = Array.isArray(m.material) ? m.material : [m.material];
      const nx = L.map(mt2 => { const barba = /^Barba432/.test(m.name || ''); const b = new T.MeshBasicMaterial({ color: barba ? 0xff00ff : 0x000000, fog: false, toneMapped: false });
        if (barba && mt2.map) { b.alphaTest = 0.25; b.map = mt2.map; b.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb=diffuse;'); }; }
        else if (m.userData && m.userData.g432) b.visible = false;
        b.skinning = !!m.isSkinnedMesh; b.side = mt2 ? mt2.side : T.FrontSide; return b; });
      scambi.push([m, m.material]); m.material = Array.isArray(m.material) ? nx : nx[0]; });
    const enc = R.outputEncoding, tm = R.toneMapping; R.outputEncoding = T.LinearEncoding; R.toneMapping = T.NoToneMapping;
    const et = leggi();
    /* alfa della sola barba (bianco sulla sua alfa, sul nero; la testa nera scrive la profondita'): per la sfumatura del bordo */
    scambi.forEach(([m]) => { const L = Array.isArray(m.material) ? m.material : [m.material]; L.forEach(b => { if (b.map && b.color && b.color.r > 0.9 && b.color.g < 0.1) { b.color.setRGB(1, 1, 1); b.alphaTest = 0; b.transparent = true; b.depthWrite = false; b.onBeforeCompile = () => {}; b.needsUpdate = true; } }); });
    const alfa = leggi();
    R.outputEncoding = enc; R.toneMapping = tm; scambi.forEach(([m, mt2]) => { const L = Array.isArray(m.material) ? m.material : [m.material]; L.forEach(x => x.dispose()); m.material = mt2; });
    altriVis.forEach(x => x.visible = true); S.background = bg; S.fog = fog; nascosti.forEach(x => x.visible = true);
    /* figurina */
    const fg = aspettoFigurina225(nome); let fig = null;
    if (fg && fg.file) fig = await new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g2 = c.getContext('2d'); g2.drawImage(im, 0, 0, 512, 512); res(g2.getImageData(0, 0, 512, 512).data); }; im.onerror = () => res(null); im.src = fg.file; });
    const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
    const g = o.userData.g432 || {};
    return { W, H, viso: b64(viso), viso0: b64(viso0), et: b64(et), alfa: b64(alfa), png, proj: Array.from(proj), lab, fig: fig ? b64(new Uint8Array(fig.buffer)) : null, figFile: fg && fg.file, b: fg && fg.b, h: fg && fg.h, k: fg && fg.k, bar: g.barba || null, tipo440: g.tipo440 || null };
  }, [nome, GRIGLIA440]);
}

const srgb2lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
export function Lab(r, g, b) { const R = srgb2lin(r), G = srgb2lin(g), B = srgb2lin(b); const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; const fx = f(X), fy = f(Y), fz = f(Z); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; }
const media = A => A.length ? A.reduce((s, v) => s + v, 0) / A.length : NaN;
const dev = A => { const m = media(A); return Math.sqrt(media(A.map(v => (v - m) ** 2))); };
const medianaDi = A => { const s = [...A].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : NaN; };

/* zone del viso (gradi). Nucleo: dove una barba di quel tipo e' piu' folta sulla figurina. */
export const ZONE440 = {
  pelle: ([az, el]) => Math.abs(az) >= 26 && Math.abs(az) <= 38 && el >= -14 && el <= -8,
  bocca: ([az, el]) => Math.abs(az) <= 9 && el >= -43 && el <= -35,
  nucleo: (tipo) => tipo === 'baffi' ? (([az, el]) => Math.abs(az) <= 8 && el >= -34.5 && el <= -31) : (([az, el]) => Math.abs(az) <= 7 && el >= -56 && el <= -50),
};
/* campionatori: Lab medio 3x3 in un punto (x, y dall'alto) */
function camp(buf, W, H, x, y, dalBasso) { const out = [0, 0, 0]; let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = Math.round(x) + dx, yy = Math.round(y) + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const row = dalBasso ? yy : yy; const i = (row * W + xx) * 4; const L = Lab(buf[i], buf[i + 1], buf[i + 2]); out[0] += L[0]; out[1] += L[1]; out[2] += L[2]; n++; } return n ? out.map(v => v / n) : null; }
export function analizza440(s) {
  const V = Buffer.from(s.viso, 'base64'), V0 = Buffer.from(s.viso0, 'base64'), E = Buffer.from(s.et, 'base64'), AL = Buffer.from(s.alfa, 'base64'), F = s.fig ? Buffer.from(s.fig, 'base64') : null; const { W, H } = s; const M = MAPPA_FIG440;
  const pts = GRIGLIA440.map((g, i) => { const x = s.proj[i * 2], y = s.proj[i * 2 + 1]; let r = null, et = false;
    let al = null, r0 = null; if (x >= 1 && y >= 1 && x < W - 1 && y < H - 1) { r = camp(V, W, H, x, y, true); r0 = camp(V0, W, H, x, y, true); const q = (Math.round(y) * W + Math.round(x)) * 4; et = E[q] > 160 && E[q + 2] > 160 && E[q + 1] < 90; al = AL[q] / 255; }
    let f = null; if (F) { const fx = 256 + M.KX * Math.sin(g[0] * RAD) * Math.cos(g[1] * RAD) * 512, fy = (M.Y0 - M.KY * g[1]) * 512; f = camp(F, 512, 512, fx, fy, false); }
    return { az: g[0], el: g[1], r, r0, f, et, al }; });
  const tipo = s.tipo440 || s.bar;
  const zona = (fn, k) => pts.filter(p => fn([p.az, p.el]) && p[k]);
  const pelleR = medianaDi(zona(ZONE440.pelle, 'r').map(p => p.r[0])), pelleF = medianaDi(zona(ZONE440.pelle, 'f').map(p => p.f[0]));
  /* bocca: celle-labbro della texture della testa (a* > mediana + 6 nella finestra), altrimenti la zona fissa */
  let labbra = null; if (s.lab && s.lab.length) { const LL = s.lab.map(([az, el, r, g, b]) => [az, el, Lab(r, g, b)]); const am = medianaDi(LL.map(x => x[2][1])); labbra = LL.filter(x => x[2][1] > am + 6 && Math.abs(x[0]) <= 18 && x[1] <= -32 && x[1] >= -46).map(x => x[0] + ',' + x[1]); }
  const inLabbra = p => labbra && labbra.length >= 6 ? labbra.includes(p.az + ',' + p.el) : ZONE440.bocca([p.az, p.el]);
  const pl = pts.filter(p => inLabbra(p) && p.r); const bocca = pl.length ? 1 - pl.filter(p => p.et).length / pl.length : null;
  /* bocca sulla figurina: quota dei punti della zona fissa con scurimento < 30 (non pelo scuro) */
  const fl = zona(ZONE440.bocca, 'f'); const boccaF = fl.length ? fl.filter(p => pelleF - p.f[0] < 30).length / fl.length : null;
  /* nucleo */
  const nr = zona(ZONE440.nucleo(tipo), 'r'), nf = zona(ZONE440.nucleo(tipo), 'f');
  const mr = nr.length ? [0, 1, 2].map(j => media(nr.map(p => p.r[j]))) : null, mf = nf.length ? [0, 1, 2].map(j => media(nf.map(p => p.f[j]))) : null;
  const dE = mr && mf ? Math.hypot(mr[0] - mf[0], mr[1] - mf[1], mr[2] - mf[2]) : null;
  /* CONTRIBUTO della barba: 3D (con barba - senza barba, stesso fotogramma) contro figurina (nucleo - pelle delle guance), in L*a*b*:
     cosi' l'ombra del naso o del mento della testa 3D non si attribuisce alla barba */
  const m0 = nr.length ? [0, 1, 2].map(j => media(nr.map(p => p.r0[j]))) : null; const pelF3 = (() => { const q = zona(ZONE440.pelle, 'f'); return q.length ? [0, 1, 2].map(j => media(q.map(p => p.f[j]))) : null; })();
  const cR = mr && m0 ? mr.map((v, j) => v - m0[j]) : null, cF = mf && pelF3 ? mf.map((v, j) => v - pelF3[j]) : null;
  const dEc = cR && cF ? Math.hypot(cR[0] - cF[0], cR[1] - cF[1], cR[2] - cF[2]) : null;
  /* bordo: profili di D lungo l'elevazione (guance az +-40, collo az 0 da -50 in giu') */
  const prof = (az, el0, el1, k, pel) => { const P = []; for (let el = el0; el <= el1; el++) { const q = pts.filter(p => Math.abs(p.az - az) <= 1.6 && p.el === el && p[k]); if (q.length) P.push([el, pel - media(q.map(p => p[k][0]))]); } if (P.length < 8) return null; const sm = P.map((x, i) => [x[0], media(P.slice(Math.max(0, i - 1), i + 2).map(y => y[1]))]); let mx = 0; for (let i = 1; i < sm.length; i++) mx = Math.max(mx, Math.abs(sm[i][1] - sm[i - 1][1]) / Math.max(1, sm[i][0] - sm[i - 1][0])); return +mx.toFixed(2); };
  /* bordo: alfa della barba lungo profili che attraversano il bordo, media mobile 5 gradi, normalizzata sul massimo del profilo:
     pendenza massima per grado (stessa definizione della figurina in tools/... fig-stat: p90 barba piena 0,214). Baffi: non giudicati
     (una fascia di 4 gradi non puo' sfumare su 5: dichiarato). */
  const profA = (lista) => { if (lista.length < 8) return null; const v = lista.map(q => q.al); const sm = v.map((_, i) => media(v.slice(Math.max(0, i - 2), i + 3))); const mx = Math.max(...sm); if (mx < 0.15) return null; let m = 0; for (let i = 1; i < sm.length; i++) m = Math.max(m, Math.abs(sm[i] - sm[i - 1]) / mx); return +m.toFixed(3); };
  const colonna = (az, e0, e1) => { const L = []; for (let el = e0; el <= e1; el++) { const q = pts.find(p => Math.abs(p.az - az) < 0.8 && p.el === el && p.al != null); if (q) L.push(q); } return L; };
  const riga = (el, a0, a1) => pts.filter(p => p.el === el && p.al != null && p.az >= Math.min(a0, a1) && p.az <= Math.max(a0, a1)).sort((a, b) => a.az - b.az).map((q, i, A) => q);
  const bordi = tipo === 'baffi' ? [] : tipo === 'pizzetto' ? [riga(-54, 0, -36), riga(-54, 0, 36)] : [colonna(-39, -60, -6), colonna(39, -60, -6), colonna(-54, -60, -6), colonna(54, -60, -6)];
  const bordoR = bordi.map(profA).filter(v => v != null), bordoF = [];
  /* bordo come CONTRASTO: scurimento D = L*pelle - L* lungo le stesse colonne (guance +-39/+-54 da -60 a -6), media mobile 5 gradi:
     pendenza massima in L* per grado, sul 3D e sulla figurina dello stesso corpo */
  const profD = (az, k, pel) => { const P = []; for (let el = -60; el <= -6; el++) { const q = pts.filter(p => Math.abs(p.az - az) <= 0.8 && p.el === el && p[k]); if (q.length) P.push(pel - media(q.map(p => p[k][0]))); } if (P.length < 20) return null; const sm = P.map((_, i) => media(P.slice(Math.max(0, i - 2), i + 3))); let m = 0; for (let i = 1; i < sm.length; i++) m = Math.max(m, Math.abs(sm[i] - sm[i - 1])); return +m.toFixed(2); };
  const colD = (tipo === 'piena' || tipo === 'corta' || tipo === 'stoppia') ? [-39, 39, -54, 54] : [];
  const dR = colD.map(a => profD(a, 'r', pelleR)).filter(v => v != null), dF = colD.map(a => profD(a, 'f', pelleF)).filter(v => v != null);
  return { tipo, h: s.h, k: s.k, labbra: labbra ? labbra.length : 0, bocca: bocca == null ? null : +bocca.toFixed(3), boccaF: boccaF == null ? null : +boccaF.toFixed(3),
    nucleoR: mr && mr.map(v => +v.toFixed(1)), nucleoF: mf && mf.map(v => +v.toFixed(1)), dE: dE == null ? null : +dE.toFixed(1), dEc: dEc == null ? null : +dEc.toFixed(1), contribR: cR && cR.map(v => +v.toFixed(1)), contribF: cF && cF.map(v => +v.toFixed(1)),
    sdR: nr.length ? +dev(nr.map(p => p.r[0])).toFixed(2) : null, sdF: nf.length ? +dev(nf.map(p => p.f[0])).toFixed(2) : null,
    bordoR: bordoR.length ? Math.max(...bordoR) : null, bordoN: bordoR.length, bordoF: null, contrR: dR.length ? Math.max(...dR) : null, contrF: dF.length ? Math.max(...dF) : null, pelleR: +pelleR.toFixed(1), pelleF: +pelleF.toFixed(1), punti: pts };
}

export async function misura440(b, port, flags, tod, nomi, dbg) {
  const { ctx, p, ok, err } = await apriEPronti(b, port, flags, tod);
  if (!ok) { await ctx.close(); return { giudicato: false, motivo: 'ingresso non raggiunto', err }; }
  await preparaEtichette(p);
  const tutti = await p.evaluate(() => { const S = window.__CPM3D.scene, o = []; S.traverseVisible(x => { const c = x.userData && x.userData.chi240; if (c && c.nome) o.push(c.nome); }); return o; });
  const righe = [];
  for (const n of (nomi && nomi.length ? nomi : tutti)) { const s = await scatta440(p, n); if (!s) { righe.push({ nome: n, giudicato: false }); continue; }
    if (!s.bar && !s.tipo440) { righe.push({ nome: n, b: s.b, senza: true }); continue; }
    const a = analizza440(s); righe.push({ nome: n, b: s.b, giudicato: !!(a.nucleoR && a.nucleoF && a.bocca != null), ...a, punti: undefined });
    if (dbg) { fs.mkdirSync(dbg, { recursive: true }); fs.writeFileSync(`${dbg}/${tod}-${n.replace(/\W+/g, '_')}.json`, JSON.stringify({ W: s.W, H: s.H, png: s.png, fig: s.figFile, punti: a.punti.filter((q, i) => i % 3 === 0).map(q => [q.az, q.el, q.et ? 1 : 0]), proj: s.proj })); }
  }
  const tex = await p.evaluate(() => { const A = window.__CPM_ASP432; return A ? { tex: +(A.msTex || 0).toFixed(1), tex440: +(A.msTex440 || 0).toFixed(1), n: A.tex.size } : null; });
  await ctx.close(); return { giudicato: true, righe, tex, err };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const TOD = process.env.CPM_TOD || 'night'; const nomi = process.argv.slice(2); fs.mkdirSync('out/g440', { recursive: true });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const r = await misura440(b, port, process.env.CPM_ROSSO ? ['__CPM_NO_G440'] : [], TOD, nomi, process.env.CPM_DEBUG || null);
  await b.close(); srv.close();
  fs.writeFileSync(`out/g440/misura-440-${TOD}${process.env.CPM_ROSSO ? '-rosso' : ''}.json`, JSON.stringify(r, null, 1));
  if (!r.giudicato) { console.log('NON GIUDICATO', r.motivo); process.exit(1); }
  console.log('nome | barba | tipo | labbra(celle) | bocca 3D / fig | ΔE nucleo | sd L 3D / fig | bordo 3D / fig | nucleo 3D | nucleo fig');
  for (const x of r.righe) if (!x.senza) console.log([x.nome, x.b, x.tipo, x.labbra, `${x.bocca} / ${x.boccaF}`, x.dE, `${x.sdR} / ${x.sdF}`, `${x.bordoR} / ${x.bordoF}`, JSON.stringify(x.nucleoR), JSON.stringify(x.nucleoF)].join(' | '));
  console.log('texture:', JSON.stringify(r.tex));
}
