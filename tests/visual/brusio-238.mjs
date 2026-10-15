#!/usr/bin/env node
/* [giro 20 — PO-238, decisione PO 14/10 «Sostituiscilo»] Guardiano del BRUSIO DI FOLLA (crowd.bed).
   1. STATICO: il vecchio mp3 non e' piu' in assets/, e ne' il gioco (CARRIER-MANAGER-AV.html) ne' i frammenti src/
      contengono il suo nome; il gioco registra il file nuovo.
   2. PERCORSO VERO (pagina SENZA ?cpmtest: sotto cpmtest l'audio e' muto per costruzione): un click sulla home sblocca
      l'audio come farebbe il giocatore → il gioco scarica e DECODIFICA il brusio (hook __CPM_BRUSIO238: file in uso,
      buffer decodificato, durata). Deve essere il file nuovo, decodificato, ~23,78 s.
   3. LOOP: la sonda ridecodifica lo stesso file nella pagina (OfflineAudioContext) e misura il livello nei 20 ms a
      cavallo del giunto contro la mediana delle finestre da 20 ms: |scarto| ≤ 3 dB (il vecchio mp3: -46,8 dB).
   4. CREDITI: la finestra Crediti della home nomina il «Brusio di folla» e non contiene il vecchio nome.
   ROSSO: CPM_ROSSO=__CPM_NO_BRUSIO238 → il gioco non carica il file (torna al synth di riserva), il guardiano esce 1. */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO || '';
const NUOVO = 'brusio-folla-korward.wav', VECCHI = [/football-crowd/i, /69245/];
const ko = [];
// 1) statico
const html = fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8');
const srcTxt = fs.readdirSync(path.join(ROOT, 'src')).map(f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n');
if (fs.readdirSync(path.join(ROOT, 'assets/audio/sfx/crowd')).some(f => VECCHI.some(r => r.test(f)))) ko.push('il vecchio mp3 e\' ancora in assets/audio/sfx/crowd');
for (const r of VECCHI) { if (r.test(html)) ko.push(`il gioco contiene ancora ${r}`); if (r.test(srcTxt)) ko.push(`src/ contiene ancora ${r}`); }
if (!html.includes(NUOVO)) ko.push('il gioco non registra ' + NUOVO);
if (!fs.existsSync(path.join(ROOT, 'assets/audio/sfx/crowd', NUOVO))) ko.push(NUOVO + ' assente da assets/');

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 860 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
if (ROSSO) await page.addInitScript(r => { String(r).split(',').forEach(k => { window[k.trim()] = 1; }); }, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 60000 }).catch(() => {});
await sleep(500);
// 2) gesto → unlock → caricamento del brusio da parte del gioco
await page.mouse.click(4, 4); await sleep(200); await page.mouse.click(4, 4);
let st = null; const t0 = Date.now();
while (Date.now() - t0 < 15000) { st = await page.evaluate(() => (window.__CPM_BRUSIO238 ? window.__CPM_BRUSIO238() : null)); if (st && st.decodificato) break; await sleep(250); }
const ms = Date.now() - t0;
if (!st) ko.push('hook __CPM_BRUSIO238 assente');
else {
  if (!st.urls.length || !st.urls.every(u => u.endsWith(NUOVO))) ko.push(`file del brusio in uso: ${JSON.stringify(st.urls)} (atteso ${NUOVO})`);
  if (!st.decodificato) ko.push('il gioco non ha decodificato il brusio in 15 s (suona il synth di riserva)');
  else if (Math.abs(st.durata - 23.777) > 0.1) ko.push(`durata decodificata ${st.durata.toFixed(3)} s (attesa 23,78)`);
}
// 3) giunto del loop, ridecodificato nella pagina
let giunto = null;
if (st && st.urls.length) {
  giunto = await page.evaluate(async (u) => {
    const ab = await (await fetch(u)).arrayBuffer(); const oc = new OfflineAudioContext(1, 1, 22050); const buf = await oc.decodeAudioData(ab);
    const x = buf.getChannelData(0), N = x.length, w = Math.round(buf.sampleRate * 0.02);
    const rms = (a, n) => { let s = 0; for (let i = 0; i < n; i++) { const v = x[(a + i + N) % N]; s += v * v; } return Math.sqrt(s / n); };
    const win = []; for (let i = 0; i + w <= N; i += w) win.push(rms(i, w)); win.sort((p, q) => p - q);
    const med = win[win.length >> 1]; return { sr: buf.sampleRate, durata: buf.duration, db: 20 * Math.log10(rms(N - (w >> 1), w) / med) };
  }, st.urls[0]).catch(e => ({ errore: e.message }));
  if (giunto.errore) ko.push('ridecodifica fallita: ' + giunto.errore);
  else if (Math.abs(giunto.db) > 3) ko.push(`giunto del loop a ${giunto.db.toFixed(1)} dB dalla mediana (tetto ±3)`);
}
// 4) Crediti
const voce = await page.$('[data-cpm="crediti238-voce-home"]'); let cred = '';
if (!voce) ko.push('voce «Crediti» assente nella home');
else { await voce.scrollIntoViewIfNeeded(); await voce.click(); await sleep(500);
  cred = await page.evaluate(() => (document.querySelector('[data-cpm="crediti238"]') || {}).textContent || '');
  if (!/Brusio di folla/.test(cred)) ko.push('i Crediti non nominano il «Brusio di folla»');
  for (const r of VECCHI) if (r.test(cred)) ko.push(`i Crediti contengono ancora ${r}`);
  if (/football crowd/i.test(cred)) ko.push('i Crediti contengono ancora «football crowd»'); }
if (errs.length) ko.push('pageerror ' + errs[0]);
await b.close(); srv.close();
console.log(`PO-238 brusio · ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'}`);
console.log(`  in uso ${st ? JSON.stringify(st.urls) : '-'} · decodificato ${st ? st.decodificato : '-'} in ${ms} ms · durata ${st ? st.durata.toFixed(3) : '-'} s · giunto ${giunto && giunto.db != null ? giunto.db.toFixed(2) + ' dB' : '-'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — brusio generato in uso e decodificato, loop senza buco, vecchio nome assente da gioco e Crediti'); process.exit(0);
