#!/usr/bin/env node
/* [giro 354 · PO-522] SONDA (misura, non guardiano): la corsa «Vai al prossimo momento» si ferma sul rinnovo; nei 3 s dopo la
   fermata quale finestra si apre sopra il tasto «Vai al rinnovo →», e quando. N corse (CPM_N, default 8), seed di Math.random variato
   dalla pagina. Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-354.mjs  (CPM_FLAG=__CPM_NO_G354 per il braccio di prima) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 8), FLAG = process.env.CPM_FLAG || null, W0 = +(process.env.CPM_W || 27);
const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const salva = (over = {}) => { const s = 80; return { name: 'Sonda Rinnovo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: W0, weekLived: true, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
  club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
  form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
  hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: null, richiamo198: { s: 3, n: 2 }, renewWarn94: 3,
  history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over }; };
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const tot = {}; let coperte = 0, fermate = 0;
try {
  for (let i = 0; i < N; i++) {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } }); await installCdnRoutes(page);
    await page.addInitScript(([pl, f, k]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (f) window[f] = 1;
      let s = 1234567 + k * 7919; Math.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
      localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [salva({ name: 'Sonda Rinnovo ' + i }), FLAG, i]);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
    await sleep(1200); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
    await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; }); await sleep(700);
    await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} }); await sleep(400);
    await page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (t && !t.disabled) t.click(); }); await sleep(450);
    await page.evaluate(() => { const v = document.querySelector('[data-cpm="salta163-vai"]'); if (v) v.click(); });
    const t0 = Date.now(); await sleep(300);
    while (Date.now() - t0 < 60000) { const st = await page.evaluate(() => { const e = document.querySelector('[data-cpm="salta163"]'); return e && e.getAttribute('data-salta163'); }); if (st !== 'corsa') break; await sleep(100); }
    const tf = Date.now(); const viste = [];
    while (Date.now() - tf < 3000) {
      const r = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; const v = [...document.querySelectorAll('.cpm-velo150')].map(f => { const q = f.getAttribute('data-cpm') ? f : f.querySelector('[data-cpm]'); return ((q && q.getAttribute('data-cpm')) || 'finestra') + ':' + (f.innerText || '').split('\n').filter(Boolean)[0].slice(0, 36); });
        const b = document.querySelector('[data-cpm="salta198-vai"]'); const cop = !!b && !!document.querySelector('.cpm-velo150');/* una finestra a tutto schermo copre il tasto ovunque stia */
        return { mot: (L[L.length - 1] || {}).motivo, v, tasto: !!b, cop, w: window.__CPM_CAREER.snapshot().week }; });
      for (const x of r.v) if (!viste.find(y => y.x === x)) viste.push({ x, ms: Date.now() - tf, cop: r.cop });
      if (Date.now() - tf > 2900) { console.log(`  corsa ${i}: fermata «${r.mot}» sett. ${r.w} · tasto ${r.tasto} · coperto ${r.cop} · finestre ${JSON.stringify(viste)} · tenute ${JSON.stringify((await page.evaluate(() => window.__CPM_ATT354 || null)))}`); if (r.mot === 'rinnovo') { fermate++; if (r.cop || viste.length) coperte++; } for (const y of viste) { const k = y.x.split(':')[0]; tot[k] = (tot[k] || 0) + 1; } }
      await sleep(120);
    }
    await page.close();
  }
} finally { await browser.close(); srv.close(); }
console.log(`FINE: fermate sul rinnovo ${fermate}/${N} · con una finestra sopra ${coperte} · per tipo ${JSON.stringify(tot)}`);
