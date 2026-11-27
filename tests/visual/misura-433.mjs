#!/usr/bin/env node
/* [giro 433 · PO-687] SONDA (non guardiano): la carnagione «scura» e' piu' chiara del ritratto?
   Ingresso in campo (GLB acceso, ora congelata con CPM_TOD). I ventidue corpi in fila prendono a turno la pelle di volti dell'indice
   scelti per carnagione (s scura · a ambrata · o olivastra · c chiara), con la STESSA chiamata del gioco (_pelle225 'auto', compensazione
   dell'ora, ESP240) e, nel braccio verde, con la correzione del giro 433 (settimo argomento: la carnagione). Per ogni viso il testimone
   del giro 240 (misuraPelle240, raggio 0,18) fa il primo piano; la sonda legge due grandezze, sul 3D e sul ritratto:
     · «240»: quella di pelle-240 — mediana del riquadro x 40-60 % · y 36-50 % del ritratto contro la mediana dei pixel di pelle (R>G>B,
       R>70) del primo piano 3D. E' cio' che il guardiano giudica con CIE76 <= 12.
     · «viso»: la pelle dell'INTERO viso — mediana di L* sui pixel color pelle (R>G>B, R-B > 18 % di R, R>25) nel riquadro x 28-72 % ·
       y 22-55 % del ritratto e nel riquadro del testimone sul 3D, senza la soglia R>70 (che sui visi scuri scarta proprio le ombre).
   Stampa per carnagione la differenza con segno L*(3D) − L*(ritratto) per le due grandezze (positiva = 3D piu' chiaro).
   Uso: CPM_TOD=night|dusk|day node misura-433.mjs [--rosso]   (rosso = window.__CPM_NO_G433) · CPM_GIRI=3 (giri da 22 visi)
   Scrive out/g433/misura-<tod>-<braccio>.json; con CPM_FOTO=1 anche i primi piani in out/g433/foto-<tod>-<braccio>/. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriIngresso } from './misura-412.mjs';
import fs from 'node:fs';
const ROSSO = process.argv.includes('--rosso'), TOD = process.env.CPM_TOD || 'night', GIRI = +(process.env.CPM_GIRI || 3), FOTO = !!process.env.CPM_FOTO;
const BR = ROSSO ? 'rosso' : 'verde'; fs.mkdirSync('out/g433', { recursive: true });
export const lab = ([r, g, bb]) => { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; const R = f(r), G = f(g), B = f(bb);
  let x = (R * .4124 + G * .3576 + B * .1805) / .95047, y = R * .2126 + G * .7152 + B * .0722, z = (R * .0193 + G * .1192 + B * .9505) / 1.08883; const t = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116; x = t(x); y = t(y); z = t(z); return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
export const dE = (a, c) => { const A = lab(a), C = lab(c); return Math.hypot(A[0] - C[0], A[1] - C[1], A[2] - C[2]); };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };

/* in pagina: tinge i corpi coi volti chiesti, arma il testimone, misura 3D e ritratti */
export async function giro(p, volti, foto) {
  return p.evaluate(async ([volti, foto]) => {
    const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; const tod = window.__CPM_TOD || 'night';
    const corpi = []; S.traverseVisible(o => { if (!(o.userData && o.userData.chi240 && o.userData.chi240.nome && o.userData.chi240.ruolo !== 'eroe')) return; let dentro = false; o.traverse(x => { if (x !== o && x.userData && x.userData.chi240) dentro = true; }); if (!dentro) corpi.push(o); });/* il corpo piu' interno con chi240: quello che il testimone trova risalendo */
    const q = resa240('partita', tod), lin = R.outputEncoding === T.sRGBEncoding; const usati = [];
    for (let i = 0; i < corpi.length && i < volti.length; i++) { const v = volti[i], o = corpi[i]; o.userData.chi240 = Object.assign({}, o.userData.chi240, { nome: 'volto-' + v.n });
      _pelle225(o, v.p, 'auto', new T.Vector3(q[0], q[1], q[2]), lin, ESP240, v.k); usati.push(v); }
    await new Promise(r => setTimeout(r, 1500));
    window.__CPM_G240W = { chiedi: true, scena: 'partita:', esiti: [], foto: foto ? [] : [], fotoMax: 40, raggio: 0.18 };
    for (let k = 0; k < 120 && !window.__CPM_G240W.esiti.length; k++) await new Promise(r => setTimeout(r, 250));
    const W = window.__CPM_G240W; if (!W.esiti.length) return { errore: 'il testimone non ha risposto' };
    const E = W.esiti[0], gl = R.getContext(), Hd = gl.drawingBufferHeight, Rr = Math.round(Hd * 0.18);
    const ld = u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; setTimeout(() => r(null), 8000); });
    const dati = (im, x0, y0, x1, y1) => { const cv = document.createElement('canvas'); cv.width = im.naturalWidth || im.width; cv.height = im.naturalHeight || im.height; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      const X0 = Math.floor(x0), Y0 = Math.floor(y0); return g.getImageData(X0, Y0, Math.max(1, Math.floor(x1) - X0), Math.max(1, Math.floor(y1) - Y0)).data; };
    const medC = (d, filtro) => { const c = [[], [], []]; for (let i = 0; i < d.length; i += 4) if (filtro(d[i], d[i + 1], d[i + 2])) { c[0].push(d[i]); c[1].push(d[i + 1]); c[2].push(d[i + 2]); }
      return c[0].length < 30 ? null : c.map(z => { z.sort((a, b) => a - b); return z[z.length >> 1]; }); };
    const pelleL = (d) => { const L = []; for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (r > g && g > b && (r - b) > 0.18 * r && r > 25) L.push([r, g, b]); } return L; };
    const out = []; let fi = 0; const ritratti = {};
    for (const c of E.corpi) { if (!c.nome) continue; const im3 = (c.px > 0 && W.foto && W.foto[fi]) ? await ld(W.foto[fi]) : null; if (c.px > 0) fi++;
      const v = usati.find(x => 'volto-' + x.n === c.nome); if (!v) continue; const r = { n: v.n, k: v.k, p: v.p, reso: c.reso, px: c.px };
      if (im3) { const s = im3.width, h = Math.min(Rr, s >> 1); const d3 = dati(im3, s / 2 - h, s / 2 - h, s / 2 + h + 1, s / 2 + h + 1); r.pelle3 = pelleL(d3); if (foto) r.foto = W.foto[fi - 1]; }
      if (!ritratti[v.f]) { const im = await ld(v.file); if (im) { const w = im.naturalWidth, H = im.naturalHeight; ritratti[v.f] = { box: medC(dati(im, w * .40, H * .36, w * .60, H * .50), () => true), pelle: pelleL(dati(im, w * .28, H * .22, w * .72, H * .55)) }; } }
      const rt = ritratti[v.f]; if (rt) { r.box = rt.box; r.pelleR = rt.pelle; } out.push(r); }
    return { corpi: corpi.length, nomi: E.corpi.filter(c => c.nome).map(c => c.nome + ':' + c.px), foto: (W.foto || []).length, misure: out };
  }, [volti, foto]);
}

export const NOME = { s: 'scura', a: 'ambrata', o: 'olivastra', c: 'chiara' };
/* un braccio intero: GIRI giri da 22 visi (8 scuri + 5 ambrati + 4 olivastri + 5 chiari), scelti in modo deterministico dall'indice.
   Ritorna { righe, tab } oppure { errore }. */
export async function braccio433(b, port, rosso, giri, foto) {
  const I = JSON.parse(fs.readFileSync(new URL('../../assets/portraits/ai/indice.json', import.meta.url)));
  let s0 = 433; const rnd = () => { s0 = (s0 * 1103515245 + 12345) & 0x7fffffff; return s0 / 0x7fffffff; };
  const per = k => I.g.filter(x => x.k === k && x.p).map(x => ({ n: x.n, k: x.k, p: x.p, f: x.f, file: I.base + x.f })).sort(() => rnd() - 0.5);
  const S = per('s'), A = per('a'), O = per('o'), C = per('c');
  const tutte = [], err = []; let ctx = null, p = null;
  /* l'ingresso dura tre giri di misura (due se la macchina e' carica): poi la partita parte e i corpi della fila spariscono. Si riapre una pagina ogni due giri */
  try { for (let g = 0; g < giri; g++) { if (g % 2 === 0) { if (ctx) await ctx.close(); ctx = null; const Q = await apriIngresso(b, port, rosso ? ['__CPM_NO_G433'] : []); ctx = Q.ctx; p = Q.p; err.push(...Q.err); if (!Q.ok) return { errore: 'ingresso non raggiunto', err }; }
    const volti = [...S.slice(g * 8, g * 8 + 8), ...A.slice(g * 5, g * 5 + 5), ...O.slice(g * 4, g * 4 + 4), ...C.slice(g * 5, g * 5 + 5)];
    const fase = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    const r = await giro(p, volti, foto); if (r.errore) return { errore: `${r.errore} (giro ${g + 1}, fase ${fase})`, err }; tutte.push(...r.misure); if (process.env.CPM_DEBUG) console.log(JSON.stringify({ corpi: r.corpi, foto: r.foto, nomi: r.nomi })); } }
  finally { if (ctx) await ctx.close(); }
  const righe = tutte.map(m => { const L3 = m.pelle3 ? med(m.pelle3.map(x => lab(x)[0])) : null, LR = m.pelleR ? med(m.pelleR.map(x => lab(x)[0])) : null;
    return { n: m.n, k: m.k, p: m.p, reso: m.reso, box: m.box, foto: m.foto, dE240: (m.reso && m.box) ? +dE(m.reso, m.box).toFixed(1) : null, dL240: (m.reso && m.box) ? +(lab(m.reso)[0] - lab(m.box)[0]).toFixed(1) : null,
      Lviso3D: L3 == null ? null : +L3.toFixed(1), LvisoRitratto: LR == null ? null : +LR.toFixed(1), dLviso: (L3 != null && LR != null) ? +(L3 - LR).toFixed(1) : null }; });
  const tab = {}; for (const k of ['s', 'a', 'o', 'c']) { const R = righe.filter(x => x.k === k && x.dE240 != null && x.dLviso != null);
    tab[k] = { n: R.length, dE240med: med(R.map(x => x.dE240)), dE240max: R.length ? Math.max(...R.map(x => x.dE240)) : null, oltre12: R.filter(x => x.dE240 > 12).length, dL240med: med(R.map(x => x.dL240)), dLvisoMed: med(R.map(x => x.dLviso)), LvisoRitrattoMed: med(R.map(x => x.LvisoRitratto)), Lviso3DMed: med(R.map(x => x.Lviso3D)) }; }
  return { righe, tab, err };
}
export const stampa = (titolo, tab) => { console.log(titolo); for (const k of ['s', 'a', 'o', 'c']) { const t = tab[k]; console.log(`  ${NOME[k].padEnd(9)} n ${String(t.n).padStart(2)} · pelle-240: ΔE mediana ${t.dE240med} massima ${t.dE240max} (oltre 12: ${t.oltre12}) · ΔL* ${t.dL240med} · viso intero: L* ritratto ${t.LvisoRitrattoMed} · 3D ${t.Lviso3DMed} · ΔL* ${t.dLvisoMed}`); } };

if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const R = await braccio433(b, port, ROSSO, GIRI, FOTO); await b.close(); srv.close();
  if (R.errore) { console.log('NON GIUDICATO: ' + R.errore); process.exit(1); }
  if (FOTO) { const d = `out/g433/foto-${TOD}-${BR}`; fs.mkdirSync(d, { recursive: true }); for (const m of R.righe) if (m.foto) fs.writeFileSync(`${d}/${m.k}-${m.n}.jpg`, Buffer.from(m.foto.split(',')[1], 'base64')); }
  R.righe.forEach(m => delete m.foto);
  fs.writeFileSync(`out/g433/misura-${TOD}-${BR}.json`, JSON.stringify({ tod: TOD, braccio: BR, tab: R.tab, righe: R.righe, errori: R.err.slice(0, 3) }, null, 1));
  stampa(`misura-433 · ora ${TOD} · braccio ${BR} · visi ${R.righe.length}`, R.tab);
}
