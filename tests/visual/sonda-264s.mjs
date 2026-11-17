#!/usr/bin/env node
/* [giro 264] SONDA (non guardiano): statistiche di CPM_N (20) partite DIVERSE (nomi «Statistica 1..N», stessa settimana, stesso pilota
   seedato) giocate per intero. CPM_MODO = intera | solo · CPM_VEL = velocita' della partita intera · CPM_ROSSO=1 accende
   window.__CPM_NO_G264. Per ogni partita: risultato, tabellino del motore (gol, tiri, possesso) e un'impronta del libro mastro.
   Serve a confrontare prima/dopo: il «prima» e' la partita intera col rosso, il «dopo» quella senza. */
import crypto from 'node:crypto';
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const N = +(process.env.CPM_N || 20), DA = +(process.env.CPM_DA || 1), MODO = process.env.CPM_MODO || 'intera', VEL = process.env.CPM_VEL || '2', ROSSO = process.env.CPM_ROSSO === '1';
const tot = { n: 0, gol: 0, tiri: 0, poss: 0 }; const t00 = Date.now();
for (let k = DA; k < DA + N; k++) {
  const A = await apriCarriera166({ nome: 'Statistica ' + k, vel: MODO === 'intera' ? VEL : '1', init: ROSSO ? { __CPM_NO_G264: true } : {} });
  let o = { k, finita: false };
  try { await A.page.evaluate(() => { window.__TAB264 = null; setInterval(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (M) window.__TAB264 = M.tabellino(); } catch (e) {} }, 150); });
    await apriPrompt166(A.page); const g = await gioca166(A.page, MODO, { seme: 7300 });
    const tab = await A.page.evaluate(() => window.__TAB264).catch(() => null); const sq = seq166(g.ev || []);
    const P = (x, f) => (tab && tab[x] && tab[x][f] != null) ? tab[x][f] : null;
    o = { k, finita: !!g.finita, min: g.minMax, score: g.score, scene: g.scene, gol: [P('home', 'gol'), P('away', 'gol')], tiri: [P('home', 'tiri'), P('away', 'tiri')], poss: [P('home', 'possesso'), P('away', 'possesso')], voci: sq.length,
      impronta: crypto.createHash('md5').update(JSON.stringify(sq)).digest('hex').slice(0, 10), esiti: sq.filter(e => e.ev === 'esito').map(e => e.key).join(','), err: A.errs.length, sec: Math.round((g.tPartita || 0) / 1000) };
    if (o.finita && tab) { tot.n++; tot.gol += (o.score.h | 0) + (o.score.a | 0); tot.tiri += (o.tiri[0] | 0) + (o.tiri[1] | 0); tot.poss += o.poss[0] | 0; }
  } catch (e) { o.nota = String(e.message).slice(0, 120); }
  await A.b.close(); A.srv.close(); console.log(JSON.stringify(o));
}
console.log(JSON.stringify({ FINE: true, modo: MODO, vel: VEL, rosso: ROSSO, partite: tot.n, golPerPartita: +(tot.gol / Math.max(1, tot.n)).toFixed(2), tiriPerPartita: +(tot.tiri / Math.max(1, tot.n)).toFixed(2), possessoCasaMedio: +(tot.poss / Math.max(1, tot.n)).toFixed(1), sec: Math.round((Date.now() - t00) / 1000) }));
process.exit(0);
