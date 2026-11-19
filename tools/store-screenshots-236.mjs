#!/usr/bin/env node
/* [giro 236 · PO-322] SCREENSHOT TELEFONO PER LA SCHEDA GOOGLE PLAY, dal banco di prova.
   Cattura il gioco VERO (sorgente, bundle locali, nessuna rete esterna) in verticale 9:16 esatto: viewport 405x720 CSS px a
   densita' 8/3 → 1080x1920 px, il formato telefono che la scheda accetta (verificare comunque in Play Console, vedi
   docs/store/IMMAGINI.md). Scrive in docs/store/screenshots/. Il 3D gira con i modelli CH38/GLB accesi (direttiva PO 29/07).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node tools/store-screenshots-236.mjs */
import { startServer, launchBrowser, installCdnRoutes, clickByText, openMatch, sleep, ROOT } from '../tests/visual/lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';

const OUT = path.join(ROOT, 'docs', 'store', 'screenshots'); fs.mkdirSync(OUT, { recursive: true });
const VP = { viewport: { width: 405, height: 720 }, deviceScaleFactor: 8 / 3, isMobile: true, hasTouch: true };
const CLUB = { id: 'cre', n: 'FC Cremona', a: 'CRE', p: 62, c: '#c8102e', c2: '#ffffff', nat: '🇮🇹', lg: 'Lega B' };
const PRO = { name: 'Dario Ferrante', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 2, week: 6, age: 19, ovr: 71, tutorialDone: true, club: CLUB, foot: 'R',
  stats: { 'velocità': 74, tecnica: 70, fisico: 68, 'mentalità': 71, tiro: 75, passaggio: 69, dribbling: 72, posizionamento: 71 },
  form: 72, morale: 64, fatigue: 18, popularity: 48, coachTrust: 66, goals: 4, assists: 2, matches: 5, contract: { duration: 3, wage: 6000, expiresAtSeason: 4 }, bankBalance: 120000 };

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const fatti = [];
async function pagina(init) { const ctx = await browser.newContext(VP); const page = await ctx.newPage();
  /* prima il blocco della rete esterna, POI i bundle locali: in Playwright vince la rotta registrata per ULTIMA */
  await page.route('**', r => { const u = r.request().url(); return (/^https?:\/\//.test(u) && !/localhost|127\.0\.0\.1/.test(u)) ? r.abort() : r.fallback(); });
  await installCdnRoutes(page);
  if (init) await page.addInitScript(init.fn, init.arg); return { ctx, page }; }
const scatta = async (page, nome) => { const f = path.join(OUT, nome); await page.screenshot({ path: f }); fatti.push(nome); console.log('  ✔ ' + nome); };
/* [giro 260 · decisione PO 17/11 B] le schermate fuori partita si scattano COME NELL'APP (?app=twa, criterio del giro 120): e' cio' che
   vede chi scarica dallo store, quindi senza «Sostieni il progetto». Dentro l'app le sonde di collaudo sono spente: la partita (05), che
   ha bisogno di una scena forzata, resta col banco ?cpmtest=1 (in partita il pulsante non c'e' comunque). */
async function apri(page, q = '?app=twa') { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${q}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); }

try {
  // 1 · home  2 · creazione del calciatore
  { const { ctx, page } = await pagina(); await apri(page); await sleep(2500); await scatta(page, '01-home.png');
    if (await clickByText(page, 'Nuova carriera')) { await sleep(1500);
      await page.waitForFunction(() => !/Scarico i giocatori/.test(document.body.innerText), null, { timeout: 60000 }).catch(() => {}); await sleep(800); await scatta(page, '02-creazione.png'); } await ctx.close(); }
  // 3 · plancia di carriera da professionista  4 · classifica
  { const { ctx, page } = await pagina({ fn: (s) => { localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, arg: PRO });
    await apri(page); await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForSelector('button[title="Invia idee e feedback allo sviluppatore"]', { state: 'attached', timeout: 30000 }).catch(() => {}); await sleep(2500);
    /* fuori dal banco le finestre della settimana si aprono davvero (sotto ?cpmtest le chiude __CPM_CAREER.dismiss): si chiudono col
       loro tasto, come farebbe chi gioca, prima di scattare */
    for (let i = 0; i < 6; i++) { const chiuso = await page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].filter(x => x.getBoundingClientRect().height > 40).pop();
      if (!d) return false; const b = [...d.querySelectorAll('button')].filter(x => x.getBoundingClientRect().height > 0).pop(); if (!b) return false; b.click(); return true; });
      if (!chiuso) break; await sleep(900); }
    await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
    const sost = await page.evaluate(() => document.querySelectorAll('button[title="Sostieni lo sviluppo di Korward Elite"]').length);
    if (sost) throw new Error('«Sostieni il progetto» presente nella plancia scattata come app: screenshot non validi');
    await scatta(page, '03-carriera.png');
    if (await clickByText(page, '^Classifica', 5000)) { await sleep(1800); await scatta(page, '04-plancia-classifica.png'); }
    await ctx.close(); }
  // 5 · partita 3D (provino, scena forzata, modelli GLB accesi)
  { const { ctx, page } = await pagina(); await openMatch(page, port, { name: 'Dario Ferrante' });
    await page.evaluate(() => window.__CPM_FORCE_SIT(5, true)); await sleep(9000); await scatta(page, '05-partita.png'); await ctx.close(); }
} catch (e) { console.log('  ✗ ' + String(e && e.message || e).slice(0, 300)); }
finally { await browser.close(); srv.close(); }
console.log(`screenshot: ${fatti.length} (${fatti.join(', ')}) in docs/store/screenshots/`);
process.exit(fatti.length >= 4 ? 0 : 1);
