#!/usr/bin/env node
/* [7.357.0] GUARDIANO DELLA COERENZA DI MERCATO — collaudo PO, due schermate a confronto:
   la SAGA sul dashboard diceva «CF Madrid ha chiesto informazioni su di te», e nella scheda Agente le
   VOCI DI MERCATO elencavano Stamford / Goldwald / Manchester. Madrid non c'era.

   Causa: due sistemi che non si conoscevano. La saga tiene il suo club in `player.transferSaga` (con
   l'oggetto club dentro `offer.club`); le voci pescavano tre nomi da un hash sul prestigio senza mai
   guardarla. L'unico club che ti sta davvero cercando — quello che due settimane dopo presenta l'offerta —
   era l'unico assente dall'elenco delle voci.

   ⚠️ LIMITE DICHIARATO: le voci nascono da una IIFE dentro il JSX della scheda Agente, non da una funzione
   pura, quindi NON sono raggiungibili come lo sono `getLeagueClubs` o `generateSeasonCalendar` per gli
   altri guardiani di carriera. Qui si asserisce il CABLAGGIO sul sorgente + il fatto che la pagina
   transpili. Renderla una funzione pura (`marketRumors(player,week)`) e' il passo che la renderebbe
   verificabile davvero: finche' non si fa, questo guardiano vede il collegamento, non il risultato.

   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node market-coherence-test.mjs                            */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { readFileSync } from 'node:fs';

const issues = [];
const src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');

/* --- A. il blocco delle voci deve CONOSCERE la saga --- */
const at = src.indexOf('Sprint 68 — Rumor di Mercato');
if (at < 0) issues.push('(A) non trovo il blocco delle voci di mercato (ancora cambiata?)');
else {
  const blk = src.slice(at, at + 3500);
  const vedeSaga = /transferSaga/.test(blk);
  const escludeDalPool = /!\(_sgC57&&c\.id===_sgC57\.id\)/.test(blk);
  const inTesta = /_rumors\.unshift\(/.test(blk);
  if (!vedeSaga) issues.push('(A) le voci di mercato non guardano piu\' `transferSaga`: la saga torna a essere l\'unico club assente dalle voci');
  if (!escludeDalPool) issues.push('(A) il club della saga non e\' escluso dal sorteggio: puo\' comparire due volte nella stessa lista');
  if (!inTesta) issues.push('(A) il club della saga non e\' messo in cima all\'elenco');
  console.log(`(A) le voci vedono la saga ${vedeSaga ? '✓' : '✗'} · escluso dal sorteggio ${escludeDalPool ? '✓' : '✗'} · in cima ${inTesta ? '✓' : '✗'}`);
  /* il totale mostrato resta 3: saga + 2 sorteggiati, oppure 3 sorteggiati */
  const tot3 = /_usedIdx\.size<\(_sgC57\?2:3\)/.test(blk);
  if (!tot3) issues.push('(A) il conteggio non si adatta: con la saga in testa l\'elenco mostrerebbe 4 voci invece di 3');
  console.log(`(A) elenco sempre di 3 voci ${tot3 ? '✓' : '✗'}`);
}
/* --- B. la saga porta con se' l'oggetto club, non solo il nome (serve per stemma e id) --- */
if (!/transferSaga:\{offer,week:/.test(src))
  issues.push('(B) `transferSaga` non conserva piu\' `offer`: senza, le voci non hanno stemma ne\' id da confrontare');
console.log(`(B) la saga conserva l'offerta (e quindi il club) ${/transferSaga:\{offer,week:/.test(src) ? '✓' : '✗'}`);

/* --- C. la pagina transpila e monta (una IIFE rotta nel JSX qui si vedrebbe) --- */
{
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser(); const page = await browser.newPage();
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await sleep(2500);
  const montato = await page.evaluate(() => !!document.querySelector('#root') && document.body.innerText.length > 40);
  if (errs.length) issues.push('(C) pageerror: ' + errs.slice(0, 2).join(' | '));
  if (!montato) issues.push('(C) la pagina non monta');
  console.log(`(C) transpile + mount ${montato && !errs.length ? '✓' : '✗'}`);
  await browser.close(); srv.close();
}

if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ MERCATO COERENTE — il club della saga compare fra le voci, una volta sola, in cima');
