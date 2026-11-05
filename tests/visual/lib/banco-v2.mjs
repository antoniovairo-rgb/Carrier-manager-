/* [PO-302 · grafica V2] il banco delle sonde V2 (estratto da grafica-v2.mjs, tappa 1): banco-g0 a meta' stagione, calendario
   generato con la funzione del gioco e la giornata successiva servita, storico dei gol sintetico per il grafico della Carriera. */
import { installCdnRoutes, sleep } from './harness.mjs';
import { SAVE, INIT } from './banco-g0.mjs';
import { armaTemaRosso } from './tema-prova.mjs';
export async function apriBancoV2(b, port, f, { rosso = false, temaRosso = false, errs = [], mancanti = [], prep = '' } = {}) {/* rosso/temaRosso: tema di prova a basso contrasto (lib/tema-prova.mjs) */
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 120)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], save: SAVE });
  if (rosso || temaRosso) await armaTemaRosso(page);
  await page.addInitScript(() => { try { const v = sessionStorage.getItem('v2s'); if (v) localStorage.setItem('cpm-v3', v); } catch (e) {} });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const pronta = () => page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await page.goto(url, { waitUntil: 'load', timeout: 120000 }); await pronta(); await sleep(800);
  await page.evaluate((prep) => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; const lc = CLUBS.filter(c => c.lg === p.club.lg);
    p.calendar = generateSeasonCalendar(p.club, lc, p.season * 777 + hashStr(p.club.id)); const m = p.calendar.find(x => x.week > p.week); p.week = m.week;
    p.calendar.forEach(x => { if (x.week < m.week) { x.played = true; x.result = x.result || { homeScore: 1, awayScore: 0, won: true, drew: false }; } });
    p.standings = p.standings.map(t => ({ ...t, played: Math.min(t.played, m.matchday - 1) }));
    p.history = []; for (let k = 1; k < p.season; k++) p.history.push({ season: k, club: p.club.n, clubId: p.club.id, goals: [2, 5, 7, 9, 4, 12, 15, 19, 11, 13, 16][k - 1] || 8, assists: 3, matches: 30 });
    if (prep) (new Function('p', prep))(p);
    sessionStorage.setItem('v2s', JSON.stringify(s)); }, prep);
  await page.reload({ waitUntil: 'load' }); await pronta(); await sleep(1000);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(f.k + ' Continua'); }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { mancanti.push(f.k + ' carriera'); await ctx.close(); return { ctx, page: null }; }
  await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(300);
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
  return { ctx, page };
}
