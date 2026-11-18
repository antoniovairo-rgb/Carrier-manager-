#!/usr/bin/env node
/* [giro 264] SONDA (non guardiano): il PASSO REALE del metronomo della partita intera. Avvolge l'intervallo del metronomo (periodo
   CPM_PER, 77 ms a 1x) e misura l'intervallo reale fra due battute (solo quelli < 1 s: le pause di scena e di ripresa non contano) e
   il tempo speso dentro le battute, fino al minuto CPM_MIN (15). Bracci (CPM_BRACCI, separati da virgola):
     rosso  = __CPM_NO_G264 (battito nudo, come prima del giro 264)
     verde  = il gioco com'e' (flushSync sul solo battito del minuto)
     tutti  = primo tentativo emulato dalla sonda: OGNI battuta dentro flushSync (sul braccio rosso)
   ⚠️ I ms di «playing» per minuto NON sono una misura del passo: contano anche le pause dopo un gol, e nel braccio rosso la partita
   puo' essere un'altra (e' il difetto). Il passo si legge dagli intervalli. */
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const MIN = +(process.env.CPM_MIN || 15), PER = +(process.env.CPM_PER || 77), VEL = process.env.CPM_VEL || '1';
for (const br of (process.env.CPM_BRACCI || 'rosso,verde,tutti').split(',')) {
  const A = await apriCarriera166({ nome: 'Collaudo Salienti', vel: VEL, init: br === 'verde' ? {} : { __CPM_NO_G264: true } });
  await A.page.evaluate(({ per, tutti }) => { window.__V264 = { iv: [], last: 0, cb: 0, n: 0 }; const V = window.__V264; const si = window.setInterval;
    window.setInterval = function (fn, ms, ...a) { if (ms !== per) return si.call(window, fn, ms, ...a);
      return si.call(window, function () { const t = performance.now(); if (V.last) V.iv.push(Math.round(t - V.last)); V.last = t; if (tutti) ReactDOM.flushSync(fn); else fn(); V.cb += performance.now() - t; V.n++; }, ms); }; }, { per: PER, tutti: br === 'tutti' });
  await apriPrompt166(A.page); const g = await gioca166(A.page, 'intera', { seme: 7300, fermaAlMinuto: MIN });
  const F = await A.page.evaluate(() => window.__V264); const iv = F.iv.filter(x => x < 1000).sort((a, b) => a - b);
  console.log(JSON.stringify({ braccio: br, vel: VEL, minuto: g.minMax, battute: F.n, intervalloMedio: +(iv.reduce((a, b) => a + b, 0) / Math.max(1, iv.length)).toFixed(1), mediano: iv[iv.length >> 1], p90: iv[Math.floor(iv.length * .9)], msPerBattuta: +(F.cb / Math.max(1, F.n)).toFixed(2), playingMsPerMinuto: Math.round((g.fasi.playing || 0) / Math.max(1, g.minMax)), esiti: (g.ev || []).filter(e => e.ev === 'esito').map(e => e.key).join(','), gol: (g.ev || []).filter(e => e.ev === 'goal').map(e => e.min).join(',') }));
  await A.b.close(); A.srv.close();
}
process.exit(0);
