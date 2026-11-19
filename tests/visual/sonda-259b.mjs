#!/usr/bin/env node
/* [giro 259] SONDA (non guardiano): partita intera e soli highlight di solo-highlight-166 (stesso nome, stesso seme del pilota)
   fermate al minuto CPM_MIN (12): stampa la prima voce del libro mastro che differisce. Serve a bisecare il caso 10. */
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const MIN = +(process.env.CPM_MIN || 12);
async function una(modo) { const A = await apriCarriera166({ nome: 'Collaudo Salienti' }); await A.page.evaluate(() => { window.__DE259 = []; window.__CPM_RND14 = {}; const o = window.decideExecution; if (typeof o === 'function') window.decideExecution = function (i, c) { const r = o.apply(this, arguments); try { if (i === 'through' || i === 'onetwo') window.__DE259.push({ i, x: c.x, pr: c.pressure, fa: c.fatigue, mo: c.morale, side: c.side, seed: c.seed, out: r && r.outcome, q: r && Math.round(r.q * 1000) / 1000 }); } catch (e) {} return r; }; });
  await apriPrompt166(A.page);
  const g = await gioca166(A.page, modo, { seme: 7300, fermaAlMinuto: MIN }); const de = await A.page.evaluate(() => window.__CPM_RND14 || {}); console.log(modo, JSON.stringify(de)); await A.b.close(); A.srv.close(); return seq166(g.ev || []); }
const I = await una('intera'), S = await una('solo');
let d = -1; for (let i = 0; i < Math.min(I.length, S.length); i++) if (JSON.stringify(I[i]) !== JSON.stringify(S[i])) { d = i; break; }
const esI = I.filter(e => e.ev === 'esito'), esS = S.filter(e => e.ev === 'esito');
console.log(JSON.stringify({ voci: [I.length, S.length], primaDiff: d, I: d >= 0 ? I[d] : null, S: d >= 0 ? S[d] : null, esitiI: esI.map(e => e.key), esitiS: esS.map(e => e.key) }));
