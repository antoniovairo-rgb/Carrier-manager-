#!/usr/bin/env node
/* [7.999.110 GUARDIANO — collaudo PO 02/10 «deve comparire sopra e deve essere più leggibile»] Carriera a W.38 con il titolo già
   matematico. Il riquadro «Campioni di …!» deve stare SOPRA la «Prossima partita» e la scritta «È matematica» e la frase devono avere
   contrasto ≥ 4,5 col fondo del riquadro (WCAG AA). CPM_RED=1 → __CPM_NO_TITOLO110: tornano i colori crema → deve FALLIRE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
async function apri(ctx, init) { const page = await ctx.newPage(); await installCdnRoutes(page); if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }); await sleep(1200); return page; }
const ctx0 = await browser.newContext(); const p0 = await apri(ctx0, { fn: () => { window.__CPM_GLB = false; }, arg: null });
const SAVE = await p0.evaluate(() => {
  const lg = CLUBS.filter(c => c.lg === 'Premier Division' && !c.isU18).slice(0, 18); const me = lg[0];
  const cal = generateSeasonCalendar(me, lg, 4242).map(m => m.matchday <= 33 ? { ...m, played: true, result: { homeScore: 3, awayScore: 0, won: true, drew: false } } : m);
  const p = { name: 'Test Titolo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 38, weekLived: false, age: 27, ovr: 90, tutorialDone: true, hasAgent: true, bankBalance: 50000, popularity: 60, coachTrust: 80, position: 'Attaccante',
    stats: { 'velocità': 90, tecnica: 90, fisico: 90, 'mentalità': 90, tiro: 90, passaggio: 90, dribbling: 90, posizionamento: 90 }, club: me, calendar: cal, matchHistory: [], worldMemory: [], contract: { duration: 3, wage: 150000, expiresAtSeason: 9 }, log: [], leagueOverrides: {} };
  p.standings = rebuildStandingsFromCalendar(p);
  return { phase: 'career', player: p };
});
await ctx0.close();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
const page = await apri(ctx, { fn: ([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_TITOLO110 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, arg: [SAVE, RED] });
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 }).catch(() => {}); await sleep(3000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(500);
const r = await page.evaluate(() => {
  const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
  const ctr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
  const divs = [...document.querySelectorAll('div')];
  const titolo = divs.filter(d => /CAMPIONI DI/.test(d.textContent || '') && /matematica/i.test(d.textContent || '')).sort((a, b) => a.textContent.length - b.textContent.length)[0];
  const prossima = divs.filter(d => /PROSSIMA PARTITA/i.test(d.textContent || '')).sort((a, b) => a.textContent.length - b.textContent.length)[0];
  if (!titolo) return { err: 'riquadro titolo assente' };
  let card = titolo; while (card && getComputedStyle(card).backgroundColor.match(/rgba\(0, 0, 0, 0\)|transparent/)) card = card.parentElement;
  const bg = card ? getComputedStyle(card).backgroundColor : 'rgb(255,255,255)';
  const cap = [...titolo.querySelectorAll('div')].find(d => /^è matematica$/i.test((d.textContent || '').trim()));
  const fr = [...titolo.querySelectorAll('div')].find(d => /Nessuno può più raggiungervi/.test(d.textContent || '') && d.children.length < 8);
  return { sopra: prossima ? titolo.getBoundingClientRect().top < prossima.getBoundingClientRect().top : null, bg, cCap: cap ? ctr(getComputedStyle(cap).color, bg) : null, cFrase: fr ? ctr(getComputedStyle(fr).color, bg) : null };
});
await page.screenshot({ path: `out/titolo-110${RED ? '-rosso' : ''}.png` });
await browser.close(); srv.close();
console.log(JSON.stringify(r));
const ok = r.sopra === true && r.cCap >= 4.5 && r.cFrase >= 4.5;
if (RED) { const x = r.sopra === true && !(r.cCap >= 4.5 && r.cFrase >= 4.5); console.log(x ? '✅ ROSSO come atteso: testo illeggibile' : '❌ il rosso non riproduce'); process.exit(x ? 0 : 1); }
console.log(ok ? '✅ PASS titolo-110' : '❌ FAIL titolo-110'); process.exit(ok ? 0 : 1);
