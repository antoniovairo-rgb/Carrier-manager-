#!/usr/bin/env node
/* PROBE RILASCIO giro 2 (punto 1): partita VERA dal salvataggio S12 fino al fischio (playMatch + autoplay seeded),
   poi percorso post-partita -> intervista a 375x812. Per ogni passo: testo visibile (inizio), scroll orizzontale,
   errori/avvisi di console e pageerror, screenshot. Esplorativa: non asserisce, registra. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = process.env.PROBE_OUT || path.join(process.cwd(), 'shots-375');
fs.mkdirSync(OUT, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const msgs = []; let cur = 'avvio';
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push({ s: cur, t: m.type(), x: m.text().slice(0, 160) }); });
page.on('pageerror', e => msgs.push({ s: cur, t: 'pageerror', x: String(e.message).slice(0, 160) }));
await page.addInitScript(s => { window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
cur = 'partita';
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
const t0 = Date.now(); let ph = '';
while (Date.now() - t0 < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
console.log(`fischio: fase=${ph} dopo ${Math.round((Date.now() - t0) / 1000)} s`);
const score = await page.evaluate(() => window.__CPM_SCORE ? JSON.stringify(window.__CPM_SCORE()) : 'n/d').catch(() => 'n/d');
console.log('punteggio: ' + score);
const snap = async (label) => {
  cur = label; await sleep(1500);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth).catch(() => -1);
  const txt = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 260)).catch(() => '');
  await page.screenshot({ path: path.join(OUT, label + '.png'), fullPage: false }).catch(() => {});
  console.log(`[${label}] overflowX=${ov}px · msg=${msgs.filter(m => m.s === label).length}\n    testo: «${txt}»`);
};
await snap('01-fine-partita');
// percorso: click sul nodo cliccabile più interno che contiene l'etichetta (innerText: il CSS mette in maiuscolo)
const ETICHETTE = ['Salta premiazione', 'Torna alla dashboard', 'Intervista', 'Sala stampa', 'giornalist', 'Apri la busta', 'Rispondi', 'Continua', 'Avanti', 'Vai avanti', 'Prosegui', 'Chiudi'];
const bottoni = () => page.evaluate(() => [...new Set([...document.querySelectorAll('button,[role="button"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => t && t.length <= 40))].slice(0, 30));
const clickEt = async (lbl) => page.evaluate(l => {
  const els = [...document.querySelectorAll('button,[role="button"],div,span,p')].filter(e => (e.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase().includes(l.toLowerCase()) && e.children.length <= 3);
  const el = els.sort((x, y) => (x.innerText || '').length - (y.innerText || '').length)[0];
  if (!el) return null; el.click(); return (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40);
}, lbl);
for (let i = 2; i <= 9; i++) {
  let clicked = null;
  for (const l of ETICHETTE) { clicked = await clickEt(l); if (clicked) break; }
  console.log('   pulsanti visibili: ' + (await bottoni()).join(' | '));
  await snap(`${String(i).padStart(2, '0')}-dopo-click-${clicked ? clicked.replace(/[^A-Za-z0-9]+/g, '_') : 'nessuno'}`.slice(0, 70));
  if (!clicked) break;
}
// torna alla dashboard col localizzatore di pulsanti (il click via innerText non ha cambiato schermata)
await page.locator('button').filter({ hasText: 'Torna alla dashboard' }).first().click({ timeout: 6000 }).catch(e => console.log('click Torna: ' + e.message.slice(0, 80)));
await snap('21-dashboard-dopo-partita');
// dashboard dopo il post-partita: l'intervista compare da sola? se no, hook forceInterview (NON percorso utente, dichiarato)
const busta = await page.evaluate(() => /busta|intervist|giornalist|sala stampa/i.test(document.body.innerText || ''));
console.log('intervista/busta visibile senza hook: ' + busta);
if (!busta) {
  const ok = await page.evaluate(() => { try { return window.__CPM_CAREER.forceInterview('win'); } catch (e) { return 'errore: ' + e.message; } });
  console.log('hook forceInterview(win) -> ' + JSON.stringify(ok));
  await sleep(1200); await snap('20-intervista-via-hook');
  const ov2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('overflowX intervista = ' + ov2 + 'px');
}
console.log('── messaggi ──'); for (const m of msgs) console.log(`  [${m.s}] ${m.t}: ${m.x}`);
console.log('TOTALE messaggi: ' + msgs.length);
await b.close(); srv.close();
