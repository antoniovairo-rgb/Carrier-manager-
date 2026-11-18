#!/usr/bin/env node
/* [giro 264] SONDA (non guardiano): DURATA REALE della partita intera di rassegna-200 (telefono 375 px a densita' 2, velocita' 2,
   «Collaudo Salienti», seme 7300) con e senza __CPM_NO_G264. Serve a sapere se un «non finita entro 420 s» dipende dal giro 264.
   CPM_BRACCI = rosso,verde (in quest'ordine di default) · tetto 700 s. Stampa durata, minuto raggiunto, risultato, impronta del libro. */
import crypto from 'node:crypto';
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
for (const br of (process.env.CPM_BRACCI || 'rosso,verde').split(',')) {
  const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init: br === 'rosso' ? { __CPM_NO_G264: true } : {}, nome: 'Collaudo Salienti', vel: process.env.CPM_VEL || '2' });
  await apriPrompt166(A.page); const g = await gioca166(A.page, 'intera', { seme: 7300, tetto: 700000 });
  console.log(JSON.stringify({ braccio: br, finita: g.finita, sec: Math.round(g.tPartita / 1000), minuto: g.minMax, score: g.score, playingSec: Math.round((g.fasi.playing || 0) / 1000), sceneSec: Math.round(((g.fasi.hl_intro || 0) + (g.fasi.hl_move || 0) + (g.fasi.hl_choose || 0) + (g.fasi.hl_result || 0)) / 1000), impronta: crypto.createHash('md5').update(JSON.stringify(seq166(g.ev || []))).digest('hex').slice(0, 10) }));
  await A.b.close(); A.srv.close();
}
process.exit(0);
