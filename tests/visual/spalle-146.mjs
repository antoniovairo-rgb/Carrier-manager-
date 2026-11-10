#!/usr/bin/env node
/* [giro 146 · PO-348 «occhio alla gestione delle spalle, braccia e mani dei calciatori 3D. Devono avere le spalle larghe e proporzionate
   al corpo in tutte le scene e negli highlights!»] GUARDIANO NON-gate, GLB ACCESO, sul gioco vero. Quattro scene: highlight dell'eroe
   (scelta + gesto, gi18 e gi3) · premiazione (alzata del trofeo) · intro · serata di presentazione. Misura ogni corpo 3D vivo con
   __misura146 (spalle-146-misura.mjs: vertici skinnati + ossa, nel mondo, rapporti adimensionali).
   SOGLIE (fissate dopo la misura del giro 146, mai da abbassare — tabella in docs/sviluppo/RAPPORTO-giro146.md):
     · spalle/anche alle articolazioni (Sj/Aj) di OGNI corpo in OGNI campione dentro [2,30 · 2,65]
       (prima: presentazione 1,96-2,00, alzata 1,25-2,12, highlight fino a 2,21; dopo: 2,33-2,44);
     · spalle/statura (Sj/H) di ogni corpo dentro [0,21 · 0,28] (prima: 0,127 nell'alzata, 0,190 nella presentazione; dopo 0,221-0,263);
     · STESSO EROE IN OGNI SCENA: mediana di Sj/Aj per scena, massima/minima <= 1,05 (prima 1,43; dopo 1,03);
     · mani (polso → punta piu' lontana) / statura dentro [0,06 · 0,12] (dopo 0,068-0,105; riferimento mano aperta ~0,108);
     · omero/statura dentro [0,10 · 0,13], avambraccio/statura dentro [0,12 · 0,155] (nessun braccio stirato dalla corporatura).
   Copertura minima per scena (altrimenti «non giudicato» = rosso). Rosso: __CPM_NO_G146 → deve CADERE.
   Uso: node spalle-146.mjs  (CPM_FORMATO=360x800 di default, oppure 1440x900 · CPM_SOLO=verde|rosso) — verde e rosso stampati per ultimi. */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const M = await import('./spalle-146-scene.mjs');
const [VW, VH] = (process.env.CPM_FORMATO || '360x800').split('x').map(Number);
const SJAJ = [2.30, 2.65], SJH = [0.21, 0.28], COER = 1.05, MANO = [0.06, 0.12], UA = [0.10, 0.13], FA = [0.12, 0.155];
const COPERTURA = { highlight: { eroe: 6, tutti: 10 }, premiazione: { eroe: 1, tutti: 3 }, intro: { eroe: 4, tutti: 6 }, presentazione: { eroe: 1, tutti: 5 }, panchina: { eroe: 3, tutti: 3 } };
/* [giro 146b · «sembra che ha lo scartello»] POSTURA (spalle-146-misura.mjs: qS quota teste degli omeri − base del collo · pro protrazione
   davanti al torace · nuca testa davanti alle spalle · spiovV inclinazione visibile collo→acromion · tilt dislivello · collo visibile).
   Misura (360x800 · 1440x900): verde qS/Aj da fermi ≤ −0,439/−0,449 (giro 146 −0,384/−0,409, prima −0,409/−0,382) · presentazione pro ≥ 0,0156
   (giro 146 −0,0064) · nuca eroe presentazione −0,0077/−0,0064 (giro 146 +0,0146/+0,0141) · spiovV da fermi ≤ 38,3° (giro 146 40,8, prima
   45,7) · pro ≤ 0,0283 · tilt ≤ 9,0°. «Da fermi» = tutto tranne l'eroe nell'alzata e i campioni del gesto. */
const QFERMO = -0.43, QALZ = 0.045, COLLOALZ = -0.045, PROMAX = 0.035, PROPRES = 0.008, NUCA = 0.005, SPIOV = 41, TILT = 12;
const srv = await M.startServer(); const port = srv.address().port; const browser = await M.launchBrowser();
async function braccio(rosso) {
  const vp = { width: VW, height: VH }, tag = `guardiano-${rosso ? rosso.replace(/^__CPM_/, '') : 'verde'}-${VW}x${VH}`; const S = [];
  S.push(...await M.scenaPartita(browser, port, vp, rosso, tag)); S.push(...await M.scenaIntro(browser, port, vp, rosso, tag)); S.push(...await M.scenaPresentazione(browser, port, vp, rosso, tag)); S.push(...await M.scenaPanchina(browser, port, vp, rosso, tag));
  const ko = [], ok = S.filter(x => !x.errore && x.H && x.chi !== 'trofeo'), r3 = x => +x.toFixed(3);
  S.filter(x => x.errore).forEach(x => ko.push('non giudicato: ' + x.errore));
  const fuori = (k, [a, b], nome) => { const L = ok.filter(x => !(x[k] >= a && x[k] <= b)); if (L.length) ko.push(`${nome} fuori da [${a}, ${b}] su ${L.length} campioni: ` + [...new Set(L.map(x => `${x.scena}/${x.chi} ${x[k]}`))].slice(0, 6).join(' · ')); };
  fuori('SjAj', SJAJ, 'spalle/anche'); fuori('SjH', SJH, 'spalle/statura'); fuori('manoH', MANO, 'mano/statura'); fuori('uaH', UA, 'omero/statura'); fuori('faH', FA, 'avambraccio/statura');
  const med = a => { a = a.slice().sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; }, per = {};
  for (const [sc, c] of Object.entries(COPERTURA)) { const L = ok.filter(x => x.scena === sc), E = L.filter(x => x.chi === 'eroe');
    if (E.length < c.eroe || L.length < c.tutti) ko.push(`non giudicato: ${sc} — campioni eroe ${E.length}/${c.eroe}, tutti ${L.length}/${c.tutti}`);
    if (E.length) per[sc] = { SjAj: r3(med(E.map(x => x.SjAj))), SjH: r3(med(E.map(x => x.SjH))), mano: r3(med(E.map(x => x.manoH))), min: r3(Math.min(...L.map(x => x.SjAj))) }; }
  const v = Object.values(per).map(x => x.SjAj); const coer = v.length === Object.keys(COPERTURA).length ? r3(Math.max(...v) / Math.min(...v)) : null;
  if (coer == null) ko.push('non giudicato: eroe non misurato in tutte le scene'); else if (!(coer <= COER)) ko.push(`eroe: spalle/anche cambiano fra le scene (massima/minima ${coer} > ${COER}) ` + JSON.stringify(per));
  const alz = x => x.scena === 'premiazione' && x.chi === 'eroe', gest = x => x.scena === 'highlight' && /^gesto/.test(x.fase || '');
  const fermi = ok.filter(x => !alz(x) && !gest(x)), lista = (L, f) => [...new Set(L.map(f))].slice(0, 6).join(' · ');
  const po = ok.filter(x => x.qS == null || x.pro == null || x.nuca == null); if (po.length) ko.push(`non giudicato: postura non misurata su ${po.length} campioni`);
  let L = fermi.filter(x => !(x.qS * x.H / x.Aj <= QFERMO)); if (L.length) ko.push(`spalle ALTE da fermi (quota/anche > ${QFERMO}) su ${L.length}: ` + lista(L, x => `${x.scena}/${x.chi} ${r3(x.qS * x.H / x.Aj)}`));
  L = ok.filter(x => alz(x) && !(x.qS <= QALZ && x.collo >= COLLOALZ)); if (L.length) ko.push(`alzata: spalle verso le orecchie (quota ${L[0].qS} > ${QALZ} o collo ${L[0].collo} < ${COLLOALZ})`);
  if (!ok.some(alz)) ko.push('non giudicato: alzata del trofeo non misurata');
  L = ok.filter(x => !(x.pro <= PROMAX)); if (L.length) ko.push(`spalle PROTRATTE (pro > ${PROMAX}) su ${L.length}: ` + lista(L, x => `${x.scena}/${x.chi} ${x.pro}`));
  L = ok.filter(x => x.scena === 'presentazione' && !(x.pro >= PROPRES)); if (L.length) ko.push(`presentazione: spalle ARRETRATE dietro il torace (pro < ${PROPRES}) su ${L.length}: ` + lista(L, x => `${x.chi} ${x.pro}`));
  for (const sc of ['presentazione', 'intro', 'panchina']) { const E = ok.filter(x => x.scena === sc && x.chi === 'eroe' && x.nuca != null).map(x => x.nuca); if (!E.length) { ko.push(`non giudicato: nuca ${sc}`); continue; }
    const m = med(E); if (!(m <= NUCA)) ko.push(`${sc}: testa davanti alle spalle (nuca ${r3(m)} > ${NUCA}) = gobba di profilo`); }
  L = fermi.filter(x => x.spiovV != null && !(x.spiovV <= SPIOV)); if (L.length) ko.push(`spalle SPIOVENTI da fermi (> ${SPIOV}°) su ${L.length}: ` + lista(L, x => `${x.scena}/${x.chi} ${x.spiovV}`));
  if (!fermi.some(x => x.spiovV != null)) ko.push('non giudicato: inclinazione visibile');
  L = fermi.filter(x => !(x.tilt <= TILT)); if (L.length) ko.push(`linea delle spalle storta (> ${TILT}°) su ${L.length}: ` + lista(L, x => `${x.scena}/${x.chi} ${x.tilt}`));
  const post = {}; for (const sc of Object.keys(COPERTURA)) { const E = ok.filter(x => x.scena === sc && x.chi === 'eroe'); if (E.length) post[sc] = { qSAj: r3(med(E.map(x => x.qS * x.H / x.Aj))), pro: med(E.map(x => x.pro)), nuca: med(E.map(x => x.nuca)), spiovV: med(E.map(x => x.spiovV ?? 0)), collo: med(E.map(x => x.collo)) }; }
  return { formato: `${VW}x${VH}`, campioni: ok.length, eroe: per, postura: post, coerenza: coer, rilievi: ko };
}
/* tre bracci: verde, rosso __CPM_NO_G146 (prima del giro 146), rosso __CPM_NO_G146B (giro 146 com'era: la gobba). CPM_SOLO=verde|g146|g146b */
const SOLO = process.env.CPM_SOLO, BR = [['VERDE', false], ['ROSSO (__CPM_NO_G146)', '__CPM_NO_G146'], ['ROSSO (__CPM_NO_G146B)', '__CPM_NO_G146B']]
  .filter(([n, f]) => !SOLO || (SOLO === 'verde' ? !f : SOLO === 'g146' ? f === '__CPM_NO_G146' : SOLO === 'g146b' ? f === '__CPM_NO_G146B' : true));
const OUT = []; for (const [n, f] of BR) OUT.push([n, f, await braccio(f)]);
await browser.close(); srv.close();
let ok = true; const motivi = [];
for (const [n, f, r] of OUT) { const cade = r.rilievi.length > 0 && !r.rilievi.every(x => /^non giudicato/.test(x));
  if (!f && r.rilievi.length) { ok = false; motivi.push('verde con rilievi'); } if (f && !cade) { ok = false; motivi.push(`il rosso ${f} non cade`); } }
for (const [n, f, r] of OUT) console.log(n + ' ' + JSON.stringify(r));
if (!ok) { console.log('❌ spalle-146 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ spalle-146 verde (e i rossi ' + OUT.filter(x => x[1]).map(x => x[1]).join(', ') + ' cadono)');
