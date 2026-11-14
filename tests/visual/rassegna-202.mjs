#!/usr/bin/env node
/* [giro 202 · PO-461, questionario PO 14/11] GUARDIANO rassegna-202 — la rassegna di fine partita a quattro schede (giro 200):
   (2) il TABELLINO DELLA GARA sta nella SCHEDA 1, accanto a risultato e voto, accorciato (voci in fila, barra sottile) e la scheda 1
       resta entro 1,3 schermi sulla partita vera con piu' eventi trovata con la sonda misura-202 (seme 7304: 2-0, 3 momenti chiave, la
       scheda piu' alta su 13 partite provate fra intere e a soli highlight) con la FESTA (cerimonia forzata e saltata). In piu' si STAMPA
       (senza giudicarla) l'altezza col tetto della lista, 12 momenti chiave provocati con __CPM_PUSH_MEV202: e' un dubbio per il PO;
   (4) Avanti/Salta e i puntini FISSI IN FONDO ALLO SCHERMO su ogni scheda: il fondo del piede coincide col fondo della finestra, la
       colonna che scorre finisce sopra il piede (mai sotto: scorsa fino in fondo, l'ultimo contenuto resta sopra il piede), il piede
       porta env(safe-area-inset-bottom);
   (1) dopo «Simula» nessuna rassegna (resta l'avviso col risultato), la partita si salva.
   Partita di campionato da professionista dal prompt vero (lib partita-166), soli highlight, pilota seedato (seme 7304).
   Viewport: 360x640 · 375x667 · 390x844 (mobile dpr 2, stessa partita ridimensionata) e PC 1366x768 (contesto desktop).
   ROSSO window.__CPM_NO_G202 (dall'avvio, stessa partita e stessi eventi): tabellino nella scheda 4 e piede in fondo alla pagina →
   DEVE essere bocciato. «Non giudicato» (partita non finita, scheda o piede non trovati, meno di 3 momenti chiave) = rosso.
   Verde e rosso stampati per ultimi. Foto in docs/sviluppo/giro202/.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rassegna-202.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
import { festa } from './misura-202.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro202'); fs.mkdirSync(FOTO, { recursive: true });
const TETTO = 1.3, MOBILI = [[360, 640], [375, 667], [390, 844]], PC = [1366, 768];
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const storia = (page) => page.evaluate(() => ((JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).matchHistory || []).length);
const vai = (page, k) => page.evaluate((k) => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (!d[k]) return false; d[k].click(); return true; }, k);

/* una scheda: tabellino dov'e', altezza in schermi, piede fermo in fondo, colonna sopra il piede (anche scorsa fino in fondo) */
async function leggi(page) {
  return page.evaluate(async () => {
    const H = window.innerHeight, root = document.querySelector('[data-cpm="rassegna200"]'); if (!root) return null;
    const sc = root.firstElementChild, piede = document.querySelector('[data-cpm="piede202"]') || root.lastElementChild; if (!sc || !piede) return null;
    const tab = document.querySelector('[data-cpm="tabellino202"]');
    const voci = tab ? tab.querySelectorAll('[data-cpm="tab202-voce"]').length : 0;
    const vociVecchie = tab ? tab.querySelectorAll('[data-cpm="barra286-a"]').length : 0;
    const mk = [...document.querySelectorAll('[data-scheda200="1"] div')].find(d => d.textContent === 'MOMENTI CHIAVE');
    const momenti = mk && mk.nextElementSibling ? mk.nextElementSibling.children.length : 0;
    sc.scrollTop = sc.scrollHeight; await new Promise(r => setTimeout(r, 150));
    const visibili = [...sc.querySelectorAll('*')].filter(e => e.offsetParent && e.children.length === 0 && (e.textContent || '').trim());
    const ultimo = visibili.length ? Math.max(...visibili.map(e => e.getBoundingClientRect().bottom)) : 0;
    const pr = piede.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    const out = { H, contenuto: sc.scrollHeight, piedeH: Math.round(pr.height), schermi: +((sc.scrollHeight + pr.height) / H).toFixed(2),
      piedeFondo: Math.round(pr.bottom), piedeCima: Math.round(pr.top), colonnaFondo: Math.round(sr.bottom), ultimo: Math.round(ultimo),
      safe: /safe-area-inset-bottom/.test(piede.getAttribute('style') || ''),
      tabScheda: tab ? tab.getAttribute('data-scheda200') : null, tabVisibile: !!(tab && tab.offsetParent), tabH: tab ? Math.round(tab.getBoundingClientRect().height) : 0, voci, vociVecchie,
      momenti, festa: !!document.querySelector('[data-cpm="festa-v2"]'), titolo: (document.querySelector('[data-cpm="titolo200"]') || {}).innerText || null,
      avanti: !!document.querySelector('[data-cpm="avanti200"]'), salta: !!document.querySelector('[data-cpm="salta200"]'), puntini: document.querySelectorAll('[data-cpm="puntino200"]').length };
    sc.scrollTop = 0; return out;
  });
}
/* giudizio di una viewport: pretende scheda 1 col tabellino entro il tetto e il piede fermo su TUTTE e quattro le schede */
async function giudica(page, w, h, braccio, fotoNome) {
  await page.setViewportSize({ width: w, height: h }); await sleep(600);
  const S = [];
  for (let k = 0; k < 4; k++) { await vai(page, k); await sleep(450); S.push(await leggi(page)); if (fotoNome && (k === 0 || k === 3)) await page.screenshot({ path: path.join(FOTO, `${fotoNome}-${w}x${h}-scheda${k + 1}.png`) }); }
  await vai(page, 0); await sleep(300);
  if (S.some(x => !x)) return { passa: false, msg: `${w}x${h}: non giudicato (rassegna o piede non trovati)` };
  const s1 = S[0];
  const tabOk = s1.tabScheda === '1' && s1.tabVisibile && s1.voci > 0 && s1.voci === s1.vociVecchie;
  const altOk = s1.schermi <= TETTO;
  const fermi = S.map(x => Math.abs(x.piedeFondo - x.H) <= 2 && x.colonnaFondo <= x.piedeCima + 1 && x.ultimo <= x.piedeCima + 1 && x.safe);
  const navOk = S.every((x, i) => x.puntini === 4 && (i < 3 ? (x.avanti && x.salta) : true));
  const passa = tabOk && altOk && fermi.every(Boolean) && navOk;
  const msg = `${w}x${h} [${braccio}]: tabellino scheda ${s1.tabScheda} visibile ${s1.tabVisibile} (${s1.voci} voci su due colonne, ${s1.tabH} px) · scheda 1 ${s1.schermi} schermi (tetto ${TETTO}; momenti ${s1.momenti}, festa ${s1.festa}) · piede fermo in fondo ${fermi.map(x => x ? '✓' : '✗').join('')} (fondo piede ${S.map(x => x.piedeFondo).join('/')} su ${s1.H}; ultimo testo ${S.map(x => x.ultimo).join('/')} sopra cima piede ${S.map(x => x.piedeCima).join('/')}; safe-area ${S.every(x => x.safe)}) · nav ${navOk}`;
  return { passa, msg, S };
}
const SEME = 7304;
async function preparaPartita(pc, init, provoca = 0) {
  const A = await apriCarriera166({ vp: pc ? { width: PC[0], height: PC[1] } : { width: 375, height: 667 }, mobile: !pc, init, nome: 'Collaudo Salienti' });
  await apriPrompt166(A.page); const g = await gioca166(A.page, 'solo', { seme: SEME }); await sleep(1200);
  let provocati = 0;
  if (g.finita) {
    const n0 = await A.page.evaluate(() => { const mk = [...document.querySelectorAll('[data-scheda200="1"] div')].find(d => d.textContent === 'MOMENTI CHIAVE'); return mk && mk.nextElementSibling ? mk.nextElementSibling.children.length : 0; });
    /* testi nella forma di quelli veri (src/15, pushMatchEvent) */
    const EV = [['goal', '⚽ Gol di Rossi'], ['opp_yellow', '🟨 Ammonito Bianchi per il fallo su di te'], ['yellow', '🟨 Ammonizione'], ['sub', '🔁 Sostituzione: Collaudo Salienti esce — scelta tecnica.'], ['opp_goal', '😨 Gol di Verdi'], ['player_goal', '⚽ Tuo gol (assist di Neri)'], ['post', '🔩 Palo/traversa'], ['opp_red', '🟥 Espulso Gialli per il fallo su di te'], ['miss', '😱 Gol clamorosamente sprecato'], ['player_assist', '🎯 Assist per Rossi'], ['goal', '⚽ Gol di Marroni'], ['red', '🟥 Espulsione avversaria']];
    for (let i = 0; i < provoca; i++) { const r = await A.page.evaluate(({ i, e }) => window.__CPM_PUSH_MEV202 ? window.__CPM_PUSH_MEV202(20 + i * 5, e[0], e[1]) : false, { i, e: EV[i % EV.length] }); if (r) provocati++; }
    await sleep(500); await festa(A.page);
    A.n0 = n0;
  }
  return { A, g, provocati };
}

/* ---------- A. verde: mobile ---------- */
console.log('A) verde — mobile 360x640 · 375x667 · 390x844');
{
  const { A, g } = await preparaPartita(false, {});
  try {
    ok(verde, g.finita && A.n0 >= 3, `partita finita (${JSON.stringify(g.score)}) · momenti chiave ${A.n0} (attesi almeno 3: la partita vera con piu' eventi)`);
    for (const [w, h] of MOBILI) { const r = await giudica(A.page, w, h, 'verde', 'dopo'); ok(verde, r.passa, r.msg); }
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
    /* informativo, non giudicato: il tetto della lista (12 momenti) provocato sulla stessa pagina */
    await A.page.setViewportSize({ width: 375, height: 667 }); await sleep(300);
    let prov = 0; const EV12 = Array.from({ length: 12 }, (_, i) => i);
    for (const i of EV12) { if (await A.page.evaluate((i) => window.__CPM_PUSH_MEV202 ? window.__CPM_PUSH_MEV202(20 + i * 5, i % 2 ? 'sub' : 'goal', i % 2 ? '🔁 Sostituzione: Collaudo Salienti esce — scelta tecnica.' : '⚽ Gol di Rossi') : false, i)) prov++; }
    await sleep(500); await vai(A.page, 0); await sleep(300); const m12 = await leggi(A.page);
    await A.page.screenshot({ path: path.join(FOTO, 'informativo-12momenti-375x667-scheda1.png') });
    console.log(`  · informativo (non giudicato): con il tetto della lista (momenti ${m12 ? m12.momenti : '?'}, ${prov} provocati) la scheda 1 a 375x667 e' ${m12 ? m12.schermi : '?'} schermi`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- B. verde: PC ---------- */
console.log('B) verde — PC 1366x768');
{
  const { A, g } = await preparaPartita(true, {});
  try {
    ok(verde, g.finita && A.n0 >= 3, `partita finita (${JSON.stringify(g.score)}) · momenti chiave ${A.n0}`);
    const r = await giudica(A.page, PC[0], PC[1], 'verde', 'dopo'); ok(verde, r.passa, r.msg);
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- C. verde: Simula ---------- */
console.log('C) verde — Simula dal prompt');
{
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init: {}, nome: 'Collaudo Salienti' });
  const p = A.page;
  try {
    await apriPrompt166(p); const n0 = await storia(p);
    const c = await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Simula/.test((x.textContent || '').trim())); if (!b) return false; b.click(); return true; });
    let n1 = n0; for (let i = 0; i < 30; i++) { await sleep(500); n1 = await storia(p); if (n1 > n0) break; }
    await sleep(800);
    const r = await p.evaluate(() => ({ rass: !!document.querySelector('[data-cpm="rassegna200"]'), puntini: document.querySelectorAll('[data-cpm="puntino200"]').length, piede: !!document.querySelector('[data-cpm="piede202"]') }));
    ok(verde, c && n1 === n0 + 1 && !r.rass && !r.puntini && !r.piede && A.errs.length === 0, `Simula: partita salvata (matchHistory ${n0}→${n1}) · nessuna rassegna ${!r.rass} · puntini ${r.puntini} · errori ${A.errs.length}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- R. rosso: __CPM_NO_G202 ---------- */
console.log('R) rosso __CPM_NO_G202');
{
  const { A, g } = await preparaPartita(false, { __CPM_NO_G202: true });
  try {
    const esiti = [];
    for (const [w, h] of [[360, 640], [375, 667]]) { const r = await giudica(A.page, w, h, 'rosso', 'prima'); esiti.push(r); console.log('    ' + r.msg); }
    const giudicato = g.finita && A.n0 >= 3 && esiti.every(r => r.S);
    ok(rosso, giudicato && esiti.every(r => !r.passa), `rosso bocciato su ${esiti.filter(r => !r.passa).length}/${esiti.length} viewport (giudicato ${giudicato})`);
  } catch (e) { ok(rosso, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G202 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ rassegna-202 VERDE' : '✗ rassegna-202 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
