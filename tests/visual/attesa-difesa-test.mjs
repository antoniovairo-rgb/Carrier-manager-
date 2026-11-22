#!/usr/bin/env node
/* [7.999.32 guardiano — L'ATTESA IN DIFESA. Idea PO 27/09 «Goalkeeper Idle per la posizione di attesa in difesa»]
   Scene forzate col corpo CGTrader: in una scena d'ATTACCO dell'eroe la posa d'attesa la prendono SOLO gli avversari (away), in una scena
   DIFENSIVA solo i compagni dell'eroe (home). Il testimone `__CPM_ATTESA32` conta, dentro il loop, i campioni in attesa per squadra e quelli
   in attesa quando non dovrebbero. Rosso: CPM_RED=1 → __CPM_NO_ATTESA32 → nessuno in attesa → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_ATTESA32 = 1; }, RED);
await openMatch(page, port, { name: 'Attesa32' }); await sleep(1500);
await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, { timeout: 60000 }).catch(() => {});
const G = await page.evaluate(() => { const S = window.__CPM_SITS || []; let at = -1, df = -1; for (let i = 0; i < S.length; i++) { const s = S[i]; if (!s) continue; if (at < 0 && !s.def && s.type !== 'def') at = i; if (df < 0 && (s.def || s.type === 'def')) df = i; if (at >= 0 && df >= 0) break; } return { at, df }; });
/* [verifica 202 bis] si misura su EVENTI, non su 9 s fissi (PROCESSO.md, controlli instabili, regola 4). La dissolvenza della posa
   (src/12 _attesa32, passo aDt*3 con aDt tappato) dura un numero di FOTOGRAMMI, non di secondi: sul runner lento (treno 45010544455)
   9 s davano pochi campioni e la coda della scena precedente (20 campioni = ~10 corpi x 2 fotogrammi) superava il 3% ammesso; sul banco
   una finestra capitata mentre i corpi correvano dava 12 campioni contro i 20 chiesti. Ora: (1) la coda si ESCLUDE — il testimone si
   azzera dopo 0,5 s E almeno 12 fotogrammi di scena (campioni >= 12 x corpi), quando la dissolvenza (<= 3 fotogrammi) e' finita;
   (2) si osserva almeno 9 s come prima e poi fino a quando la soglia della squadra che deve aspettare e' raggiunta, tetto 40 s.
   Soglie invariate (20 campioni, coda <= 3%). Il rosso (__CPM_NO_ATTESA32) non raggiunge mai la soglia e resta rosso al tetto. */
const misura = async (gi, chi) => {
  await page.evaluate(g => { window.__CPM_ATTESA32 = null; window.__CPM_FORCE_SIT(g, true); }, gi);
  const t0 = Date.now(); let corpi = 0;
  for (; Date.now() - t0 < 15000; await sleep(100)) {
    const w = await page.evaluate(() => { const W = window.__CPM_ATTESA32; return W ? W.campioni : 0; });
    if (!corpi && w) { await sleep(150); corpi = await page.evaluate(() => { const W = window.__CPM_ATTESA32; return W ? W.campioni : 0; }); }
    if (Date.now() - t0 >= 500 && w >= 12 * 22) break; }
  await page.evaluate(() => { window.__CPM_ATTESA32 = null; });
  const t1 = Date.now(); let W = null;
  for (; Date.now() - t1 < 40000; await sleep(250)) {
    W = await page.evaluate(() => window.__CPM_ATTESA32 || null);
    if (Date.now() - t1 >= 9000 && W && (W[chi] | 0) >= 20) break; }
  return W; };
const A = await misura(G.at, 'away'), D = await misura(G.df, 'home');
await b.close(); srv.close();
console.log('attacco gi' + G.at, JSON.stringify(A)); console.log('difesa gi' + G.df, JSON.stringify(D));
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(!errs.length, 'nessun errore di pagina ' + errs.slice(0, 1).join(''));
ok(A && A.away >= 20, `attacco: gli avversari aspettano in difesa (${A && A.away} campioni)`);
ok(A && (A.home | 0) === 0, `attacco: i compagni dell'eroe NON sono in posa difensiva (${A && A.home})`);
ok(D && D.home >= 20, `difesa: i compagni dell'eroe aspettano in difesa (${D && D.home} campioni)`);
/* il testimone si azzera all'avvio della scena mentre la posa della scena PRIMA sta ancora sfumando (~0,3 s): quella coda e' ammessa fino al 3% */
const coda = x => x ? (x.sbagliati | 0) <= Math.max(1, 0.03 * (x.inAttesa | 0)) : true;
ok(D && (D.away | 0) <= 0.03 * D.inAttesa, `difesa: gli avversari NON sono in posa difensiva (${D && D.away}, solo la coda di dissolvenza)`);
ok(coda(A) && coda(D), `nessun corpo in attesa quando non deve, oltre la dissolvenza (${A && A.sbagliati} · ${D && D.sbagliati})`);
if (err.length) { console.log('\nATTESA IN DIFESA: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nATTESA IN DIFESA: PASS'); process.exit(0);
