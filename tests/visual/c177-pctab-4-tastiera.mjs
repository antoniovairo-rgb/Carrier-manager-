#!/usr/bin/env node
/* [collaudo PO-292 · 7.999.177] TASTIERA SU PC: ordine del Tab e anello di fuoco, Invio/Spazio/Esc, elementi cliccabili NON raggiungibili da tastiera
   (cursor:pointer senza ruolo ne' tabindex), sulla home, la creazione e le schede della carriera. NON modifica il gioco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, FORMATI, nuovoContesto, premiTesto, scatta, salvaLog, log, bottoniVisibili, testoPagina } from './c177-pctab-lib.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const f = FORMATI[process.env.C177_F1 || 'pc1366'], sigla = process.env.C177_F1 || 'pc1366';
const audit = (page) => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const nativi = 'button,a[href],input,select,textarea,summary,[tabindex],[role=button]';
  const out = []; for (const e of document.body.querySelectorAll('*')) { if (!vis(e) || getComputedStyle(e).cursor !== 'pointer') continue; if (e.closest(nativi) && !e.matches(nativi) === false) {} if (e.matches(nativi) || e.closest(nativi)) continue; if (e.tagName === 'LABEL') continue; const r = e.getBoundingClientRect(); if (r.width < 14 || r.height < 14) continue; out.push({ t: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/)[0] : ''), tx: (e.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }); }
  return out.slice(0, 15);
});
const fuoco = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { tag: a.tagName, t: (a.textContent || a.placeholder || a.getAttribute('aria-label') || '').trim().slice(0, 28), ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none'), dentro: r.bottom > 0 && r.top < innerHeight }; });
async function giroTab(page, n) { const seq = []; for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await sleep(120); seq.push(await fuoco(page)); } return seq; }
const { ctx, page, errs } = await nuovoContesto(b, f); await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Nuova carriera/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(1000);
const R = {};
R.homeTab = await giroTab(page, 8); R.homeNonFocus = await audit(page);
console.log('HOME tab:', R.homeTab.map(x => x ? x.t + (x.ring ? '' : '(senza anello)') : '-').join(' > ')); console.log('HOME cliccabili non raggiungibili:', JSON.stringify(R.homeNonFocus));
await page.keyboard.press('Shift+Tab'); 
await premiTesto(page, f, '^\\s*Nuova carriera\\s*$'); await sleep(900);
R.creaNonFocus = await audit(page); console.log('CREA cliccabili non raggiungibili:', JSON.stringify(R.creaNonFocus));
await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.scrollTo(0, 0); });
R.creaTab = await giroTab(page, 24); console.log('CREA tab:', R.creaTab.map(x => x ? x.t + (x.ring ? '' : '(senza anello)') : '-').join(' > '));
await scatta(page, f, sigla, 'tastiera-crea-tab');
/* nome da tastiera + Invio su «Inizia i provini» */
const inp = page.locator('input[placeholder^="Es."]'); await inp.focus(); await page.keyboard.type('Luca Tastiera', { delay: 20 });
for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); await sleep(100); const x = await fuoco(page); if (x && /Inizia i provini/.test(x.t)) { R.ctaRaggiunta = true; break; } }
await page.keyboard.press('Enter'); await sleep(1500);
R.dopoInvio = (await testoPagina(page, 120)); console.log('CREA dopo Invio sul CTA:', R.dopoInvio, '| CTA raggiunta con Tab:', !!R.ctaRaggiunta);
await b.close().catch(() => {});
log.push({ fmt: sigla, nome: 'tastiera-home-crea', R });
salvaLog('tastiera-' + sigla);
srv.close();
