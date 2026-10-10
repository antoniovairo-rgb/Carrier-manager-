#!/usr/bin/env node
/* [PO-066] Riquadri della home fuori standard. Apre la carriera a tre momenti della stagione
 * (inizio · meta' · fine) a 360/375/412 px, fotografa la dashboard e misura le card:
 * larghezza, altezza e testo sotto i 10 px dentro ogni riquadro.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node po066-home-test.mjs
 * Foto in docs/sviluppo/foto/po066/. Non modifica il gioco. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const out = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'po066'); fs.mkdirSync(out, { recursive: true });
const LARG = (process.env.CPM_LARG || '360,375,412').split(',').map(Number);
const MOMENTI = [['inizio', 1], ['meta', 19], ['fine', 36]];
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const R = { misure: [], errori: [] };
for (const [nome, week] of MOMENTI) for (const w of LARG) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => R.errori.push(String(e).slice(0, 160)));
  await page.addInitScript((wk) => { window.__CPM_CAMT767ON = true;
    const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: 'u18', season: 1, week: wk, age: 17, ovr: 66, jerseyNum: 77,
      club: { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
      teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
      stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
      form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, week);
  await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
  try { await page.getByText('Salta', { exact: true }).first().click({ timeout: 4000 }); await sleep(500); } catch (_e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')).catch(() => {}); await sleep(1200);
  const m = await page.evaluate(() => {
    const root = document.querySelector('#root') || document.body;
    const cards = [...root.querySelectorAll('div')].filter(d => {
      const r = d.getBoundingClientRect(), s = getComputedStyle(d);
      return r.width > 120 && r.height > 40 && (s.borderRadius !== '0px') && (s.borderStyle !== 'none' || s.backgroundColor !== 'rgba(0, 0, 0, 0)') && d.children.length > 0 && d.innerText.trim().length > 0 && d.innerText.trim().length < 400;
    });
    const sotto10 = [...root.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.innerText && e.innerText.trim() && parseFloat(getComputedStyle(e).fontSize) < 10).length;
    const sx = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const LAB = ['Home','Stagione','Club','Carriera','Agente','Ufficio','Opzioni'];
    const btns = [...root.querySelectorAll('button')].filter(b => LAB.some(l => l.toUpperCase() === (b.innerText||'').trim().toUpperCase()));
    const navSborda = btns.map(b => { const d = b.firstElementChild || b; const bw = b.getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(d); const tr = r.getBoundingClientRect(); return { t: b.innerText.trim(), sborda: Math.max(0, Math.round(tr.width - bw.width)), esce: tr.left < bw.left - 0.5 || tr.right > bw.right + 0.5 }; });
    const navBloccate = navSborda.filter(x => x.esce).length;
    return { navBloccate, navSborda: navSborda.map(x => x.t + ':' + x.sborda), carte: cards.length, larghezze: cards.slice(0, 40).map(c => Math.round(c.getBoundingClientRect().width)), sotto10, overflowX: sx };
  });
  await page.screenshot({ path: path.join(out, `dashboard-${nome}-${w}.png`), fullPage: false });
  R.misure.push({ momento: nome, w, ...m });
  await ctx.close();
}
await browser.close(); server.close();
fs.writeFileSync(path.join(out, 'misure.json'), JSON.stringify(R, null, 2));
for (const m of R.misure) console.log(`${m.momento.padEnd(7)} ${m.w}px carte=${m.carte} sotto10=${m.sotto10} overflowX=${m.overflowX} navBloccate=${m.navBloccate} [${m.navSborda}]`);
if (R.errori.length) console.log('ERRORI:', R.errori.slice(0, 5));
