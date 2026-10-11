#!/usr/bin/env node
/* Card «Prossima partita» della dashboard: nomi squadra troncati con «…» a 360/375/412 px.
 * Misura ogni nome della card (scrollWidth > clientWidth = troncato) e fotografa la card.
 * Uso: CPM_LABEL=prima|dopo CPM_CHROME=/opt/pw-browsers/chromium node prossima-partita-card-test.mjs
 * Foto in docs/sviluppo/foto/prossima-partita/<label>-<px>.png. Non modifica il gioco. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const LABEL = process.env.CPM_LABEL || 'prova';
const out = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'prossima-partita'); fs.mkdirSync(out, { recursive: true });
const LARG = [360, 375, 412];
// Nomi lunghi di proposito: il caso peggiore del campionato Primavera e il nome reale del club
const AVVERSARIO = 'FC Modenese Primavera';
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const R = { label: LABEL, misure: [], errori: [] };
for (const w of LARG) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => R.errori.push(String(e).slice(0, 160)));
  await page.addInitScript(() => { window.__CPM_CAMT767ON = true;
    const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 66, jerseyNum: 77, tutorialDone: true,
      club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
      teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
      stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
      form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} });
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
  try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); await sleep(400); } catch (_e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')).catch(() => {}); await sleep(1200);
  // la card: il contenitore che contiene l'etichetta «Prossima partita»
  const m = await page.evaluate(() => {
    const lab = [...document.querySelectorAll('div')].find(d => d.childElementCount === 0 && (d.innerText || '').trim().toLowerCase() === 'prossima partita');
    if (!lab) return { trovata: false };
    let card = lab; for (let i = 0; i < 8 && card.parentElement; i++) { card = card.parentElement; if (card.getBoundingClientRect().width > 300 && card.getBoundingClientRect().height > 120) break; }
    const nomi = [...card.querySelectorAll('div')].filter(d => d.childElementCount === 0 && getComputedStyle(d).textOverflow === 'ellipsis').map(d => ({ t: d.innerText.trim(), larghezza: Math.round(d.clientWidth), contenuto: Math.round(d.scrollWidth), troncato: d.scrollWidth > d.clientWidth + 0.5, righe: Math.round(d.getBoundingClientRect().height / parseFloat(getComputedStyle(d).lineHeight || getComputedStyle(d).fontSize)) }));
    const r = card.getBoundingClientRect();
    return { trovata: true, altezza: Math.round(r.height), larghezza: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top + window.scrollY), nomi, sx: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  if (m.trovata) {
    const r = m; await page.screenshot({ path: path.join(out, `${LABEL}-${w}.png`), clip: { x: 0, y: Math.max(0, r.y - 8), width: w, height: r.altezza + 16 }, fullPage: true });
  }
  R.misure.push({ px: w, ...m });
  await ctx.close();
}
await browser.close(); server.close();
fs.writeFileSync(path.join(out, `misure-${LABEL}.json`), JSON.stringify(R, null, 2));
for (const x of R.misure) {
  if (!x.trovata) { console.log(`${x.px}px  card NON TROVATA`); continue; }
  const tr = x.nomi.filter(n => n.troncato).map(n => `«${n.t}» ${n.contenuto}>${n.larghezza}`);
  console.log(`${x.px}px  card ${x.larghezza}×${x.altezza}  nomi=${x.nomi.length}  troncati=${tr.length}${tr.length ? ' → ' + tr.join(' | ') : ''}  sx=${x.sx}`);
}
if (R.errori.length) console.log('ERRORI:', R.errori.slice(0, 3));
