#!/usr/bin/env node
/* [7.32.0] PREVIEW + PROBE — INTRO CINEMATICA: attraversa il flusso REALE (home → crea giocatore → cinematic),
   REGISTRA il video dell'intera intro (recordVideo) e cattura gli screenshot dei beat chiave. Verifica:
   fase raggiunta, beat tutorial (chips), GOOOL, CTA finale → provino; al secondo giro (intro-seen) va
   DRITTO al provino. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, recordVideo: { dir: 'out/intro-video', size: { width: 390, height: 760 } } });/* [7.32.7] viewport ridotto: meno raster per frame in headless → registrazione più fluida */
const page = await ctx.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });/* SENZA cpmtest: la cinematica è spenta sotto test */
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1800);
const click = (rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 30); } return null; }, rx);
console.log('nuova:', await click('Nuova Partita|Nuova Carriera|Nuova'));
await sleep(1400);
// CreateScreen: nome + crea
try { const inp = page.locator('input').first(); await inp.fill('Giovanni Pisano', { timeout: 5000 });/* [7.42.1 collaudo PO] l'eroe del video È Giovanni Pisano */ } catch (e) {}
await sleep(400);
console.log('crea:', await click('INIZIA I PROVINI'));
await sleep(1200);
const inCine = await page.evaluate(() => /La tua storia comincia stanotte|KORWARD ELITE/i.test(document.body.innerText));
console.log('cinematica avviata:', inCine);
if (!inCine) { issues.push('cinematica non avviata dopo la creazione'); await page.screenshot({ path: 'out/intro-debug.png' }); }
// lascia correre TUTTA l'intro (~30s) catturando i beat
const marks = { chips: false, goool: false, cta: false };
for (let t = 0; t < 40 && !marks.cta; t++) {
  const s = await page.evaluate(() => ({ chips: /Scegli l’azione|Scegli l'azione/i.test(document.body.innerText), go: /GOOOL/i.test(document.body.innerText), cta: /Comincia dal provino/i.test(document.body.innerText) }));
  if (s.chips && !marks.chips) { marks.chips = true; await page.screenshot({ path: 'out/intro-beat-tutorial.png' }); }
  if (s.go && !marks.goool) { marks.goool = true; await page.screenshot({ path: 'out/intro-beat-goool.png' }); }
  if (s.cta && !marks.cta) { marks.cta = true; await page.screenshot({ path: 'out/intro-beat-cta.png' }); }
  await sleep(900);
}
const glbOn = await page.evaluate(() => window.__CPM_INTRO_GLB === true);
console.log('beat visti — tutorial:', marks.chips, '· GOOOL:', marks.goool, '· CTA:', marks.cta, '· CH38 agganciato:', glbOn);
if (!glbOn) issues.push('CH38 non agganciato nell\'intro (burattini in scena)');
if (!marks.chips) issues.push('beat tutorial (chips) mai visto');
if (!marks.goool) issues.push('beat GOOOL mai visto');
if (!marks.cta) issues.push('CTA finale mai visto');
console.log('cta:', await click('Comincia dal provino'));
await sleep(1600);
const inTrial = await page.evaluate(() => /PROVINO|provino/i.test(document.body.innerText));
console.log('arrivato al provino:', inTrial);
if (!inTrial) issues.push('CTA non porta al provino');
await page.close();/* chiude e finalizza il video */
const video = await ctx.pages().length; await ctx.close();
// (2) SECONDO GIRO — intro-seen: dalla creazione dritto al provino
const pg2 = await browser.newPage({ viewport: { width: 480, height: 940 } });
await installCdnRoutes(pg2);
pg2.on('pageerror', e => issues.push('pageerror2: ' + String(e.message).slice(0, 150)));
await pg2.addInitScript(() => { localStorage.setItem('cpm-intro-seen', '1'); });
await pg2.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });
await pg2.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1600);
await pg2.evaluate(() => { const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => /Nuova/i.test(e.textContent || '') && e.offsetParent !== null); if (el) el.click(); });
await sleep(1300);
try { await pg2.locator('input').first().fill('Bis Probe', { timeout: 5000 }); } catch (e) {}
await pg2.evaluate(() => { const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => /INIZIA I PROVINI/i.test(e.textContent || '') && e.offsetParent !== null); if (el) el.click(); });
await sleep(1400);
const skip2 = await pg2.evaluate(() => ({ cine: /La tua storia comincia stanotte/i.test(document.body.innerText), trial: /provino/i.test(document.body.innerText) }));
console.log('(2) intro-seen → cinematica saltata:', !skip2.cine, '· al provino:', skip2.trial);
if (skip2.cine) issues.push('cinematica rimostrata con intro-seen');
await pg2.close();

// (3) REPLAY dalla Home — «Rivedi l'intro» apre l'overlay, «Salta» lo chiude
const pg3 = await browser.newPage({ viewport: { width: 480, height: 940 } });
await installCdnRoutes(pg3);
pg3.on('pageerror', e => issues.push('pageerror3: ' + String(e.message).slice(0, 150)));
await pg3.addInitScript(() => { localStorage.setItem('cpm-intro-seen', '1'); });
await pg3.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });
await pg3.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1600);
await pg3.evaluate(() => { const el = [...document.querySelectorAll('button')].find(e => /Rivedi l’intro|Rivedi l'intro/i.test(e.textContent || '') && e.offsetParent !== null); if (el) el.click(); });
await sleep(2200);
const replay = await pg3.evaluate(() => /La tua storia comincia stanotte|KORWARD ELITE/i.test(document.body.innerText));
await pg3.evaluate(() => { const el = [...document.querySelectorAll('button')].find(e => /Salta/i.test(e.textContent || '') && e.offsetParent !== null); if (el) el.click(); });
await sleep(1200);
const backHome = await pg3.evaluate(() => /Nuova carriera|Slot/i.test(document.body.innerText));
console.log('(3) replay dalla Home:', replay, '· salta → torna alla Home:', backHome);
if (!replay) issues.push('«Rivedi l\'intro» non apre la cinematica');
if (!backHome) issues.push('dopo Salta non si torna alla Home');
await pg3.close();

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ INTRO CINEMATICA OK (flusso reale · beat tutorial/GOOOL/CTA · una volta sola) — video in out/intro-video/');
process.exit(issues.length ? 1 : 0);
