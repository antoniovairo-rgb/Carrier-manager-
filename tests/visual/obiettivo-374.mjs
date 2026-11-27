#!/usr/bin/env node
/* [giro 374 · PO-633, decisione PO «‹In linea› fino a fine stagione»] GUARDIANO obiettivo-374.
   L'obiettivo di classifica del presidente («Finisci nei primi N») e' «fatto» (✅) SOLO a stagione chiusa; prima dice «in linea»
   (dentro la zona) o «sotto» (fuori). Una sola funzione decide (statoObiettivo374 + stagioneChiusa374, src/09).
   Misure, in entrambi i bracci, su una carriera da professionista vera (lib/partita-166) e una partita di campionato giocata:
     M  (misura prima/dopo) sul calendario vero: per ogni giornata di campionato, con la squadra prima in classifica, quante giornate
        prima dell'ultima mostrano ✅ (verde 0; il rosso deve mostrarne) e all'ultima ✅ (in entrambi);
     A1 rassegna di fine partita («obiettivo224»), squadra prima, stagione in corso: «in linea», niente ✅;
     A2 stessa schermata, squadra fuori zona: «sotto», niente ✅;
     A3 stessa schermata, tutte le altre giornate gia' giocate (la partita appena finita e' l'ultima): ✅;
     H1 Home, riquadro «Obiettivi della stagione», squadra prima, stagione in corso: «in linea», niente ✅ ne' «FATTO»;
     H2 Home, stagione chiusa: ✅.
   «Non giudicato» = rosso. Rosso: __CPM_NO_G374 (CPM_ROSSO=1 lo gira da solo) deve mostrare ✅ a meta' stagione in M, A1 e H1.
   Uso: node obiettivo-374.mjs (verde + rosso) */
import fs from 'node:fs';
import { apriCarriera166, apriPrompt166, gioca166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });

const OBJ = [{ type: 'standing', target: 4, label: 'Finisci nei primi 4', bonus: { popularity: 15, value: 0.25 } }];
const NOI = 'b04';
function classifica(st, primo) {
  const altri = st.filter(t => t.id !== NOI), noi = st.find(t => t.id === NOI);
  const mk = (t, pts) => ({ ...t, played: 10, wins: Math.floor(pts / 3), draws: pts % 3, losses: 10 - Math.floor(pts / 3) - (pts % 3), pts, gf: 10 + pts, ga: 10, gd: pts });
  if (primo) return [mk(noi, 30), ...altri.map((t, i) => mk(t, Math.max(0, 20 - i)))];
  return [...altri.slice(0, 7).map((t, i) => mk(t, 28 - i)), mk(noi, 8), ...altri.slice(7).map((t, i) => mk(t, Math.max(0, 7 - i)))];
}
const leggiRassegna = page => page.evaluate(() => { const el = [...document.querySelectorAll('[data-cpm="obiettivo224"]')].find(x => /Finisci nei primi/.test(x.textContent || ''));
  return el ? { k: el.getAttribute('data-obj374'), txt: (el.textContent || '').replace(/\s+/g, ' ').trim() } : null; });
async function leggiHome(page) {
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700);
  await page.evaluate(() => { for (const b of document.querySelectorAll('button[aria-expanded="false"]')) if (/obiettivi della stagione/i.test(b.innerText || '')) b.click(); });
  for (let i = 0; i < 10; i++) { await sleep(300);
    const r = await page.evaluate(() => { const el = [...document.querySelectorAll('[data-obj374]')].find(x => /Finisci nei primi/.test(x.textContent || ''));
      if (!el) return null; const riga = el.parentElement; return { k: el.getAttribute('data-obj374'), txt: (riga.textContent || '').replace(/\s+/g, ' ').trim() }; });
    if (r) return r; }
  return null;
}
const spunta = r => !!(r && /✅/.test(r.txt));

async function braccio(rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G374: 1 } : {}, nome: 'Collaudo Obiettivo' }); const r = { rosso, note: [] };
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    /* M: misura sul calendario vero, squadra prima a ogni giornata */
    r.M = await A.page.evaluate((o) => { const p = window.__CPM_CAREER.snapshot();
      const L = (p.calendar || []).filter(m => m && (!m.type || m.type === 'league')).sort((a, b) => (a.week | 0) - (b.week | 0));
      let prima = 0, ultima = null, fuoriFine = null;
      for (let k = 1; k <= L.length; k++) { const fatte = new Set(L.slice(0, k));
        const q = { ...p, calendar: (p.calendar || []).map(m => fatte.has(m) ? { ...m, played: true } : (L.includes(m) ? { ...m, played: false } : m)) };
        const s = window.__CPM_OBJ374(o, 1, window.__CPM_CHIUSA374(q));
        if (k < L.length && s.done) prima++; if (k === L.length) { ultima = s.done; fuoriFine = window.__CPM_OBJ374(o, 8, window.__CPM_CHIUSA374(q)).k; } }
      return { giornate: L.length, prima, ultima, fuoriFine }; }, OBJ[0]);
    const s0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot());
    const st0 = s0.standings, cal0 = s0.calendar, wk = s0.week;
    const chiuso = (escludiSett) => cal0.map(m => (m && (!m.type || m.type === 'league') && !(escludiSett && (m.week | 0) === wk)) ? { ...m, played: true } : m);
    await apriPrompt166(A.page);
    const g = await gioca166(A.page, 'solo', { seme: 7300 }); r.finita = g.finita;
    if (g.finita) {
      const fase = async (patch) => { await A.page.evaluate((x) => window.__CPM_CAREER.patch(x), patch);
        for (let i = 0; i < 20; i++) { await sleep(300); const v = await leggiRassegna(A.page); if (v) return v; } return null; };
      r.A1 = await fase({ standings: classifica(st0, true), seasonObjectives: OBJ, calendar: cal0 });
      r.A2 = await fase({ standings: classifica(st0, false) });
      await sleep(400); r.A2 = await leggiRassegna(A.page);
      await A.page.evaluate((x) => window.__CPM_CAREER.patch(x), { standings: classifica(st0, true), calendar: chiuso(true) });
      await sleep(900); r.A3 = await leggiRassegna(A.page);
      await A.page.evaluate((x) => window.__CPM_CAREER.patch(x), { calendar: cal0 }); await sleep(300);
      await chiudi166(A.page);
    }
    await A.page.evaluate(() => window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss()).catch(() => {});
    const calOra = await A.page.evaluate(() => window.__CPM_CAREER.snapshot().calendar);
    await A.page.evaluate((x) => window.__CPM_CAREER.patch(x), { standings: classifica(st0, true), seasonObjectives: OBJ, calendar: calOra.map(m => m && (m.week | 0) > wk && (!m.type || m.type === 'league') ? { ...m, played: false } : m) });
    r.H1 = await leggiHome(A.page);
    await A.page.evaluate((x) => window.__CPM_CAREER.patch(x), { calendar: calOra.map(m => (m && (!m.type || m.type === 'league')) ? { ...m, played: true } : m) });
    await sleep(600); r.H2 = await leggiHome(A.page);
    r.errs = A.errs.slice(0, 3);
  } catch (e) { r.note.push(String(e.message).slice(0, 160)); r.errs = A.errs.slice(0, 3); }
  await A.b.close(); A.srv.close(); return r;
}

const SOLO_ROSSO = process.env.CPM_ROSSO === '1';
const V = SOLO_ROSSO ? null : await braccio(false), R = await braccio(true);
const fmt = x => x ? `${x.k} «${x.txt.slice(0, 60)}»` : 'NON LETTO';
for (const r of [V, R].filter(Boolean)) console.log(`${r.rosso ? 'ROSSO __CPM_NO_G374' : 'VERDE'}: M giornate ${r.M ? r.M.giornate : '?'} · ✅ prima dell'ultima ${r.M ? r.M.prima : '?'} · ✅ all'ultima ${r.M ? r.M.ultima : '?'} · fuori zona a fine ${r.M ? r.M.fuoriFine : '?'}\n  A1 ${fmt(r.A1)}\n  A2 ${fmt(r.A2)}\n  A3 ${fmt(r.A3)}\n  H1 ${fmt(r.H1)}\n  H2 ${fmt(r.H2)}\n  finita ${r.finita}${r.note.length ? ' · note ' + r.note.join(' | ') : ''}${(r.errs || []).length ? ' · errori ' + r.errs.join(' | ') : ''}`);
const verdeOk = !!V && !!V.M && V.M.giornate > 1 && V.M.prima === 0 && V.M.ultima === true && V.M.fuoriFine === 'mancato'
  && V.A1 && V.A1.k === 'in_linea' && !spunta(V.A1) && /in linea/.test(V.A1.txt)
  && V.A2 && V.A2.k === 'sotto' && !spunta(V.A2)
  && V.A3 && V.A3.k === 'fatto' && spunta(V.A3)
  && V.H1 && V.H1.k === 'in_linea' && !spunta(V.H1) && !/FATTO/.test(V.H1.txt) && /in linea/.test(V.H1.txt)
  && V.H2 && V.H2.k === 'fatto' && spunta(V.H2) && !(V.errs || []).length;
const rossoVede = !!R.M && R.M.prima > 0 && R.A1 && spunta(R.A1) && R.H1 && spunta(R.H1);
const ok = (SOLO_ROSSO || verdeOk) && rossoVede;
console.log(`${ok ? '✅' : '❌'} obiettivo-374: verde ${SOLO_ROSSO ? 'non girato (CPM_ROSSO=1)' : verdeOk ? '«in linea»/«sotto» fino all\'ultima giornata, ✅ solo a stagione chiusa' : 'NO'} · rosso ${rossoVede ? '✅ a meta\' stagione (il rosso vede)' : 'NON GIUDICATO o uguale'}`);
fs.writeFileSync(new URL('./out/obiettivo-374.json', import.meta.url), JSON.stringify({ ok, V, R }, null, 1));
process.exit(ok ? 0 : 1);
