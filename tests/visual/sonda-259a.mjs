#!/usr/bin/env node
/* [giro 259] SONDA (non guardiano): con quale nome dell'avversario viene chiamata intervista183 dopo la partita di
   solo-highlight-166? Gioca la partita (soli highlight) e confronta il nome nel calendario (thisWeekMd), il nome nella voce di
   matchHistory e la decisione __CPM_IV183. CPM_INIT='{"__CPM_NO_G259":true}' per il braccio rosso. */
import { apriCarriera166, apriPrompt166, gioca166, chiudi166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const init = process.env.CPM_INIT ? JSON.parse(process.env.CPM_INIT) : {};
const A = await apriCarriera166({ nome: process.env.CPM_NOME || 'Collaudo Sorpresa 7', init });
const prima = await A.page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
await apriPrompt166(A.page);
const g = await gioca166(A.page, 'solo', { seme: 7300 });
const c = g.finita ? await chiudi166(A.page) : {};
const dopo = await A.page.evaluate(() => { const mhv = window.__CPM_CAREER.snapshot().matchHistory; const p = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}; const mh = (mhv || p.matchHistory || []).slice(-1)[0] || null;
  return { iv: window.__CPM_IV183 || null, mh: mh && { opponent: mh.opponent, oppId: mh.oppId || mh.opponentId || null, week: mh.week }, season: p.season, week: p.week }; });
console.log(JSON.stringify({ W: A.W, prima, finita: g.finita, iv183: c.iv183 || null, note: g.note, dopo }));
await A.b.close(); A.srv.close();
