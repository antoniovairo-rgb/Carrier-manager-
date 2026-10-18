#!/usr/bin/env node
/* [PO-255/PO-269 · giro 51] SONDA + GUARDIANO: il chip «v <versione>» non copre NULLA.
   Decisione PO 17/10 «Spostarlo nella testata»: la versione vive nella testata (Home: angolo destro della testata; carriera:
   accanto a «Salva · ora»). Pagina pulita (Home), Crediti aperti dalla Home e carriera da salvataggio sintetico, a 360x800 e
   412x915. Per ogni schermata misura a ~1 s il chip ([data-cpm=badge255]): visibilita', rettangolo, e la SOVRAPPOSIZIONE (px²)
   con ogni elemento di contenuto visibile (testo, pulsanti, link, campi, immagini/svg, pannello dei Crediti) che non sia suo
   antenato o discendente.
   VERDE: sovrapposizione 0 px² su Home, carriera e Crediti a 360 e 412; sulla Home e in carriera il chip e' VISIBILE e sta
   DENTRO la testata (nasconderlo non basta a passare); coi Crediti aperti puo' essere nascosto (correzione Modal del giro 51).
   ROSSO: CPM_ROSSO=1 arma window.__CPM_NO_CHIP269 → torna il chip fisso in basso a destra: copre la barra e i Crediti, deve uscire 1.
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
  const chip = document.querySelector('[data-cpm="badge255"]'); if (!chip) return null;
  const r = chip.getBoundingClientRect(); let op = 1; for (let e = chip; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity;
  const vis = getComputedStyle(chip).visibility !== 'hidden' && op > 0.05;
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const contenuto = (el) => /^(BUTTON|A|INPUT|SELECT|TEXTAREA|IMG|CANVAS|svg)$/.test(el.tagName) || el.getAttribute('role') === 'button'
    || [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || (sel && el.matches(sel));
  let px = 0; const tocchi = [];
  if (vis) for (const el of document.querySelectorAll('body *')) {
    if (el === chip || el.contains(chip) || chip.contains(el)) continue;
    const q = el.getBoundingClientRect(); if (!q.width || !q.height) continue; const a = inter(q, r); if (!a) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || !contenuto(el)) continue;
    px += a; tocchi.push(((el.textContent || el.getAttribute('aria-label') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 24)) + ` ${Math.round(a)}px²`);
  }
  const sb = document.querySelector('button[title="Salva carriera"]');
  const testata = sb ? sb.parentElement.parentElement : chip.closest('div[style*="linear-gradient(150deg"]');
  const t = testata && testata.getBoundingClientRect();
  const dentro = !!t && r.left >= t.left - 0.5 && r.right <= t.right + 0.5 && r.top >= t.top - 0.5 && r.bottom <= t.bottom + 0.5;
  return { testo: (chip.textContent || '').trim(), visibile: vis, rect: [r.left, r.top, r.width, r.height].map(Math.round), px: Math.round(px), tocchi: tocchi.slice(0, 6), dentro };
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
  await page.screenshot({ path: path.join(OUT, `home-${w}-${ROSSO ? 'rosso' : 'verde'}.png`) });
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
  const fmt = (m) => m ? `${m.visibile ? 'visibile' : 'nascosto'} rect ${m.rect} testata ${m.dentro ? 'si' : 'no'} · ${m.px} px² [${m.tocchi.join(', ')}]` : 'assente';
  console.log(`  ${w}px · home: ${fmt(home)}\n  ${w}px · crediti: ${fmt(cred)}\n  ${w}px · carriera: ${fmt(car)}`);
  for (const [nome, m, testata] of [['Home', home, true], ['Crediti', cred, false], ['carriera', car, true]]) {
    if (!m) { ko.push(`${w}px ${nome}: chip non trovato`); continue; }
    if (m.px > 0) ko.push(`${w}px ${nome}: il chip copre ${m.px} px² [${m.tocchi.join(', ')}]`);
    if (testata && !m.visibile) ko.push(`${w}px ${nome}: il chip non e' visibile`);
    if (testata && !m.dentro) ko.push(`${w}px ${nome}: il chip non sta nella testata (rect ${m.rect})`);
  }
}
await b.close(); srv.close();
if (process.env.CPM_JSON) console.log(JSON.stringify(esiti));
console.log(`chip-269 · ${ROSSO ? 'ROSSO __CPM_NO_CHIP269' : 'verde'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — la versione sta nella testata e non copre nulla (Home, carriera, Crediti) a 360 e 412 px'); process.exit(0);
