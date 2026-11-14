#!/usr/bin/env node
/* [giro 200 · PO-385, decisione PO «Schede una dopo l'altra»] GUARDIANO rassegna-200 — la rassegna di fine partita (fase `ended`
   di LiveMatch) si legge a QUATTRO schede: 1 risultato e voto · 2 le tue giocate · 3 i giornali · 4 classifica e prossima partita.
   Partita di campionato della carriera da professionista dal prompt vero (lib partita-166), pilota seedato, 375x667 mobile dpr 2.
   VERDE (gioco):
     A. soli highlight: 4 schede, 4 puntini, Avanti e Salta; Avanti porta 1→2→3→4 e il titolo segue; sull'ultima c'e' il tasto di
        sempre (post-continua-v2) e non c'e' Avanti; OGNI scheda (contenuto + piede) entro 1,3 schermi;
        TUTTO IL CONTENUTO DI PRIMA: sulla stessa pagina si accende __CPM_NO_G200 e si rilegge la pagina unica; ogni sua riga di testo
        deve stare in una delle 4 schede; la scheda 4 ha classifica e prossima partita;
        zero errori di pagina.
     B. partita intera (velocita' 2): stesse 4 schede, Avanti fino alla 4, i puntini riportano alla 2, Salta = torna alla carriera
        salvando la partita (matchHistory +1, la rassegna non e' piu' a schermo).
     C. Simula dal prompt: nessuna rassegna (oggi dopo Simula c'e' solo l'avviso col risultato), la partita si salva, zero errori.
   ROSSO window.__CPM_NO_G200 (dall'avvio): pagina unica di prima → nessun puntino ne' Avanti, pagina oltre 1,3 schermi → DEVE essere bocciato.
   «Non giudicato» (partita non finita, scheda non trovata) = rosso. Verde e rosso stampati per ultimi. Foto in docs/sviluppo/giro200/.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rassegna-200.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
import { misuraFine } from './misura-200.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro200'); fs.mkdirSync(FOTO, { recursive: true });
const VP = { width: 375, height: 667 }, TETTO = 1.3;
const righe = (t) => (t || '').split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(x => x.length > 1);
const testoSchede = (page) => page.evaluate(() => { const r = document.querySelector('[data-cpm="rassegna200"]'); return r && r.firstElementChild ? r.firstElementChild.innerText : ''; });
const storia = (page) => page.evaluate(() => ((JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).matchHistory || []).length);
const fase = (page) => page.evaluate(() => (typeof window.__CPM_PHASE === 'function') ? window.__CPM_PHASE() : null).catch(() => null);
const clic = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const verde = [], rosso = [];
const ok = (arr, c, m) => { arr.push([!!c, m]); console.log((c ? '  ✓ ' : '  ✗ ') + m); };

async function giocaFino(modo, init, vel) {
  const A = await apriCarriera166({ vp: VP, mobile: true, init, nome: 'Collaudo Salienti', vel: vel || '1' });
  await apriPrompt166(A.page);
  const g = await gioca166(A.page, modo, { seme: 7300 });
  await sleep(1200);
  return { A, g };
}
/* ---------- A. verde, soli highlight ---------- */
console.log('A) verde — soli highlight');
{
  const { A, g } = await giocaFino('solo', {});
  const p = A.page;
  try {
    ok(verde, g.finita, `partita a soli highlight finita (${JSON.stringify(g.score)})`);
    const st = await p.evaluate(() => ({ schede: [...new Set([...document.querySelectorAll('[data-scheda200]')].map(e => e.getAttribute('data-scheda200')))].sort().join(','),
      puntini: document.querySelectorAll('[data-cpm="puntino200"]').length, avanti: !!document.querySelector('[data-cpm="avanti200"]'), salta: !!document.querySelector('[data-cpm="salta200"]') }));
    ok(verde, st.schede === '1,2,3,4' && st.puntini === 4 && st.avanti && st.salta, `schede ${st.schede} · puntini ${st.puntini} · Avanti ${st.avanti} · Salta ${st.salta}`);
    const unione = new Set(); const misure = [];
    for (let k = 1; k <= 4; k++) {
      const m = await misuraFine(p); const tit = m && m.scheda;
      await p.screenshot({ path: path.join(FOTO, `dopo-rassegna-375-scheda${k}.png`) });
      righe(await testoSchede(p)).forEach(x => unione.add(x));
      misure.push(`${k}:${m ? m.schermi : '?'}`);
      const fin = await p.evaluate(() => ({ avanti: !!document.querySelector('[data-cpm="avanti200"]'), torna: !!document.querySelector('[data-cpm="post-continua-v2"]'), puntini: document.querySelectorAll('[data-cpm="puntino200"]').length }));
      ok(verde, m && new RegExp('^' + k + '/4').test(tit || '') && m.schermi <= TETTO && (k < 4 ? fin.avanti : (!fin.avanti && fin.torna)) && fin.puntini === 4,
        `scheda ${k} «${tit}» · ${m ? m.schermi : '?'} schermi (tetto ${TETTO}) · ${k < 4 ? 'Avanti' : 'tasto di sempre'} ${k < 4 ? fin.avanti : fin.torna}`);
      if (k < 4) { await clic(p, '[data-cpm="avanti200"]'); await sleep(500); }
    }
    const s4 = await p.evaluate(() => { const e = document.querySelector('[data-cpm="classifica200"]'); return e ? e.innerText : ''; });
    ok(verde, /Classifica/i.test(s4) && /contro|Nessuna partita/i.test(s4) && !!(await p.$('[data-cpm="classifica200-io"]')), `scheda 4: classifica (con la tua riga) e prossima partita «${s4.replace(/\s+/g, ' ').slice(0, 120)}»`);
    /* la pagina unica di prima, sulla stessa partita */
    await p.evaluate(() => { window.__CPM_NO_G200 = 1; }); await clic(p, '[data-cpm="puntino200"]'); await sleep(700);
    const unica = righe(await testoSchede(p)); const mR = await misuraFine(p);
    await p.screenshot({ path: path.join(FOTO, 'prima-rassegna-375.png') });
    const mancano = unica.filter(x => !unione.has(x));
    ok(verde, unica.length > 20 && mancano.length === 0, `contenuto di prima presente: ${unica.length - mancano.length}/${unica.length} righe della pagina unica (${mR ? mR.schermi : '?'} schermi) nelle 4 schede${mancano.length ? ' · mancano: ' + mancano.slice(0, 4).join(' | ') : ''}`);
    ok(verde, A.errs.length === 0, `zero errori di pagina ${A.errs.length ? JSON.stringify(A.errs.slice(0, 2)) : ''}`);
    ok(verde, true, `misure schede ${misure.join(' ')} · pagina unica ${mR ? mR.schermi : '?'}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- B. verde, partita intera ---------- */
console.log('B) verde — partita intera (velocita\' 2)');
{
  const { A, g } = await giocaFino('intera', {}, '2');
  const p = A.page;
  try {
    ok(verde, g.finita, `partita intera finita (${JSON.stringify(g.score)}, ${Math.round((g.tPartita || 0) / 1000)} s)`);
    const t = []; for (let k = 1; k <= 4; k++) { const m = await misuraFine(p); t.push(m && m.scheda); if (k < 4) { await clic(p, '[data-cpm="avanti200"]'); await sleep(400); } }
    ok(verde, t.every((x, i) => new RegExp('^' + (i + 1) + '/4').test(x || '')), `schede ${t.join(' → ')}`);
    /* dalla 4 si torna alla 2 coi puntini, poi Salta */
    await p.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[1]) d[1].click(); }); await sleep(400);
    const t2 = (await misuraFine(p) || {}).scheda;
    const n0 = await storia(p); const salta = await clic(p, '[data-cpm="salta200"]');
    let n1 = n0, f1 = null; for (let i = 0; i < 30; i++) { await sleep(500); n1 = await storia(p); if (n1 > n0) break; }
    await sleep(800); f1 = await p.evaluate(() => document.querySelector('[data-cpm="rassegna200"]') ? 'rassegna ancora a schermo' : 'carriera');/* __CPM_PHASE resta all\'ultimo valore dopo lo smontaggio: si guarda il DOM */
    ok(verde, /^2\/4/.test(t2 || '') && salta && n1 === n0 + 1 && f1 === 'carriera' && A.errs.length === 0, `puntino → «${t2}»; Salta torna alla carriera e salva (matchHistory ${n0}→${n1}, fase ${f1}) · errori ${A.errs.length}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- C. verde, Simula ---------- */
console.log('C) verde — Simula dal prompt');
{
  const A = await apriCarriera166({ vp: VP, mobile: true, init: {}, nome: 'Collaudo Salienti' });
  const p = A.page;
  try {
    const pr = await apriPrompt166(A.page); const n0 = await storia(p);
    const c = await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Simula/.test((x.textContent || '').trim())); if (!b) return false; b.click(); return true; });
    let n1 = n0; for (let i = 0; i < 30; i++) { await sleep(500); n1 = await storia(p); if (n1 > n0) break; }
    const r = await p.evaluate(() => ({ rass: !!document.querySelector('[data-cpm="rassegna200"]'), fase: (typeof window.__CPM_PHASE === 'function') ? window.__CPM_PHASE() : null }));
    ok(verde, c && n1 === n0 + 1 && !r.rass && A.errs.length === 0, `Simula: partita salvata (matchHistory ${n0}→${n1}) · nessuna rassegna ${!r.rass} · errori ${A.errs.length} · bottoni ${JSON.stringify(pr.bottoni)}`);
  } catch (e) { ok(verde, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
/* ---------- R. rosso ---------- */
console.log('R) rosso __CPM_NO_G200');
{
  const { A, g } = await giocaFino('solo', { __CPM_NO_G200: true });
  const p = A.page;
  try {
    const m = await misuraFine(p);
    const st = await p.evaluate(() => ({ puntini: document.querySelectorAll('[data-cpm="puntino200"]').length, avanti: !!document.querySelector('[data-cpm="avanti200"]') }));
    const passa = g.finita && st.puntini === 4 && st.avanti && m && m.schermi <= TETTO;
    ok(rosso, !passa && g.finita && !!m, `rosso bocciato: puntini ${st.puntini} · Avanti ${st.avanti} · pagina ${m ? m.schermi : '?'} schermi (finita ${g.finita})`);
  } catch (e) { ok(rosso, false, 'non giudicato: ' + String(e.message).slice(0, 160)); }
  await A.b.close(); A.srv.close();
}
const vOk = verde.length > 0 && verde.every(x => x[0]); const rOk = rosso.length > 0 && rosso.every(x => x[0]);
console.log(`\nVERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
console.log(`ROSSO __CPM_NO_G200 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? '✓ rassegna-200 VERDE' : '✗ rassegna-200 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
