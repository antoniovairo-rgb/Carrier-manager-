#!/usr/bin/env node
/* [7.999.36 sonda — collaudo PO «risultato esagerato»: Europeo, Spagna-Francia 7-1 (xG 4,38), eroe a 93 con 3 gol e 1 assist]
   Partite VERE col pilota automatico, eroe fortissimo (ovr 93, club 90, forma 95) contro avversari del campionato: per ogni partita
   punteggio finale, gol per ORIGINE (motore / scena dell'eroe) dal registro __CPM_EV, scene giocate. Sola lettura.
   CPM_N partite (default 3), CPM_SEED base. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 3), S0 = +(process.env.CPM_SEED || 9600), RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const SAVE = (k) => ({ phase: 'career', player: { name: 'Probe Forte' + k, nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 27, ovr: 93,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4, tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 90, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 93, tecnica: 93, fisico: 93, 'mentalità': 93, tiro: 93, passaggio: 93, dribbling: 93, posizionamento: 93 },
  form: 95, morale: 100, fatigue: 20, coachTrust: 95, squadRole: 'leader', popularity: 80, value: 80, bankBalance: 90000, goals: 20, assists: 8, matches: 11, contract: { duration: 3, wage: 90000, expiresAtSeason: 8 }, nationalCaps: 30,
  ...(process.env.CPM_EURO === '1' ? { week: 28, euroMondiale: { active: true, type: 'Europeo', season: 4, phase: 'group', host: 'Germania', groupOpponents: ['Olanda', 'Francia', 'Belgio'], groupMatchIdx: 1, groupResults: [{ opp: 'Olanda', won: true, gf: 2, ga: 0 }], groupPts: 3, pts: 3, qualDone: true, qualQualified: true } } : {}) } });
const out = [];
for (let k = 0; k < N; k++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript((c) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (c.red) window.__CPM_NO_PUNT36 = true; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { red: RED, sv: SAVE(k) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {} await sleep(2500);
  await page.evaluate(eu => { const b2 = Array.from(document.querySelectorAll('button')).find(x => (eu ? /Europeo — vs/i : /Gioca vs/i).test(x.textContent || '')); if (b2) b2.click(); }, process.env.CPM_EURO === '1'); await sleep(1500);
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca la partita/i.test(x.textContent || '')); if (b2) b2.click(); }); await sleep(2500);
  for (let i = 0; i < 30; i++) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph === 'playing') break; await page.keyboard.press('Enter'); await sleep(1500); }
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), S0 + k * 31);
  const seen = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 420000) { const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); let key = null; try { const s = window.__CPM_CURSIT && window.__CPM_CURSIT(); if (s) key = s.i + '#' + s.gi; } catch (e) {} return { ph, key }; }).catch(() => ({}));
    if (r.ph === 'ended' || r.ph === 'ceremony') break; if (r.ph && r.ph.startsWith('hl_') && r.key) seen.add(r.key); await sleep(400); }
  const ctx = await page.evaluate(() => { try { return window.__CPM_STATE && window.__CPM_STATE().ctx; } catch (e) { return null; } }).catch(() => null);
  const d = await page.evaluate(() => { const ev = window.__CPM_EV ? window.__CPM_EV() : []; const gol = ev.filter(e => e.ev === 'goal');
    const mo = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const tab = mo ? mo.tabellino() : null;
    return { score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, opp: (window.__CPM_STATE && window.__CPM_STATE().opp) || null,
      gol: gol.map(e => ({ m: e.m != null ? e.m : (e.d && e.d.min), lato: (e.d && (e.d.side || e.d.lato)) || e.side || null, src: (e.d && e.d.src) || e.src || '?' })),
      tiri: tab ? [tab.home.tiri, tab.away.tiri] : null, xg: tab ? [tab.home.xg, tab.away.xg] : null, golMotore: tab ? [tab.home.gol, tab.away.gol] : null, debito: mo ? { add: mo._S.conta.addebitato36 || 0, ass: mo._S.conta.assorbito36 || 0, resta: mo._S.debito36 || 0 } : null }; });
  const perSrc = d.gol.reduce((a, g) => { a[g.src] = (a[g.src] | 0) + 1; return a; }, {});
  out.push({ k, ctx, score: d.score, scene: seen.size, perSrc, golMotore: d.golMotore, tiri: d.tiri, xg: d.xg, debito: d.debito }); console.log(JSON.stringify(out[out.length - 1]));
  await page.close();
}
await b.close(); srv.close();
