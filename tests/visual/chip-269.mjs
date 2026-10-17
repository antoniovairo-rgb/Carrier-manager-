#!/usr/bin/env node
/* [PO-255/PO-269 · giro 51] SONDA + GUARDIANO: dove compare il chip «v <versione>» e cosa copre.
   Pagina pulita (Home) e carriera da salvataggio sintetico, a 360x800 e 412x915. Per ogni schermata misura a ~1 s: visibilita'
   del chip (opacita'), rettangolo, e la SOVRAPPOSIZIONE (px²) col pannello dei Crediti e coi pulsanti/link visibili sotto di lui.
   VERDE: aperti i Crediti, il chip non tocca il pannello ne' alcun pulsante (sovrapposizione 0) — a 360 e 412.
   ROSSO: CPM_ROSSO=1 arma window.__CPM_NO_CHIP269 → il chip torna in basso a destra sopra il bordo dei Crediti: deve uscire 1.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node chip-269.mjs  (CPM_JSON=1 stampa i numeri grezzi) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out', 'chip-269'); fs.mkdirSync(OUT, { recursive: true });
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const SAVE = { phase: 'career', player: { name: 'Collaudo Chip', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 70,
  tutorialDone: true, club: CLUB, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } };
const misura = (page, sel) => page.evaluate((sel) => {
  const el = [...document.querySelectorAll('div')].find(d => (d.style.animation || '').includes('cpmBadgeFade'));
  if (!el) return null; const chip = el.firstElementChild || el; const r = chip.getBoundingClientRect(); const cs = getComputedStyle(el); const vis = getComputedStyle(chip).visibility !== 'hidden';
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const pn = sel ? document.querySelector(sel) : null; const pr = pn ? pn.getBoundingClientRect() : null;
  const tocchi = [...(pn || document).querySelectorAll('button,a,[role=button],input,select')].filter(b => { const q = b.getBoundingClientRect(); return q.width && q.height && inter(q, r) > 0; })
    .map(b => (b.textContent || b.getAttribute('aria-label') || b.tagName).trim().slice(0, 30));
  return { testo: (chip.textContent || '').trim(), opacita: vis ? +cs.opacity : 0, nascosto: !vis, rect: [r.left, r.top, r.width, r.height].map(Math.round),
    pannello: pr ? Math.round(inter(pr, r)) : null, tocchi };
}, sel);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ko = []; const esiti = [];
for (const [w, h] of [[360, 800], [412, 915]]) {
  // Home + Crediti
  let ctx = await b.newContext({ viewport: { width: w, height: h } }); let page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CHIP269 = 1; }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.querySelector('[data-cpm="crediti254-pulsante"]'), null, { timeout: 60000 }).catch(() => {});
  const home = await misura(page, null);
  await page.click('[data-cpm="crediti254-pulsante"]').catch(() => {}); await sleep(400);
  const cred = await misura(page, '[data-cpm="crediti238-pannello"]');
  await page.screenshot({ path: path.join(OUT, `crediti-${w}-${ROSSO ? 'rosso' : 'verde'}.png`) });
  await ctx.close();
  // Carriera
  ctx = await b.newContext({ viewport: { width: w, height: h } }); page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CHIP269 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: SAVE, r: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 }); await sleep(800);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(600);
  const car = await misura(page, null);
  await page.screenshot({ path: path.join(OUT, `carriera-${w}-${ROSSO ? 'rosso' : 'verde'}.png`) });
  await ctx.close();
  esiti.push({ w, home, cred, car });
  console.log(`  ${w}px · home: ${home ? `opac ${home.opacita} rect ${home.rect} tocca [${home.tocchi}]` : 'assente'} · crediti: ${cred ? `opac ${cred.opacita} rect ${cred.rect} pannello ${cred.pannello} px² tocca [${cred.tocchi}]` : 'assente'} · carriera: ${car ? `opac ${car.opacita} rect ${car.rect} tocca [${car.tocchi}]` : 'assente'}`);
  if (!cred) ko.push(`${w}px: chip non trovato nei Crediti`);
  else if (cred.opacita > 0.05 && (cred.pannello > 0 || cred.tocchi.length)) ko.push(`${w}px: il chip copre i Crediti (pannello ${cred.pannello} px², pulsanti [${cred.tocchi}])`);
}
await b.close(); srv.close();
if (process.env.CPM_JSON) console.log(JSON.stringify(esiti));
console.log(`chip-269 · ${ROSSO ? 'ROSSO __CPM_NO_CHIP269' : 'verde'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — il chip versione non copre il pannello dei Crediti a 360 e 412 px'); process.exit(0);
