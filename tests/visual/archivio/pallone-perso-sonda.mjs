#!/usr/bin/env node
/* [7.999.37 sonda — collaudo PO «si perde il pallone per strada»] Partita VERA col pilota automatico (eroe forte, campionato). Ogni 200 ms:
   fase, pallone (mesh), distanza dal giocatore piu' vicino (__CPM_STATE().heldBy.dist, unita' di campo). Per fase: quota di campioni col
   pallone a piu' di 4 unita' da chiunque, e i tratti ABBANDONATI (pallone lontano da tutti e fermo) con durata. Sola lettura. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SEED = +(process.env.CPM_SEED || 9600), RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const SAVE = { phase: 'career', player: { name: 'Probe Pallone', nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 27, ovr: 88,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4, tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 85, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 88, tecnica: 88, fisico: 88, 'mentalità': 88, tiro: 88, passaggio: 88, dribbling: 88, posizionamento: 88 },
  form: 85, morale: 90, fatigue: 20, coachTrust: 95, squadRole: 'leader', popularity: 80, value: 80, bankBalance: 90000, goals: 10, assists: 5, matches: 11, contract: { duration: 3, wage: 90000, expiresAtSeason: 8 } } };
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript((c) => { window.__CPM_GLB = false; if (c.red) window.__CPM_NO_PERSO37 = true; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); try { localStorage.setItem('cpm-match-speed', '1'); } catch (e) {} }, { red: RED, sv: SAVE });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {} await sleep(2500);
await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca vs/i.test(x.textContent || '')); if (b2) b2.click(); }); await sleep(1500);
await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca la partita/i.test(x.textContent || '')); if (b2) b2.click(); }); await sleep(2500);
for (let i = 0; i < 30; i++) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph === 'playing') break; await page.keyboard.press('Enter'); await sleep(1500); }
await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEED);
const C = []; const t0 = Date.now(); const TETTO = +(process.env.CPM_MS || 300000);
while (Date.now() - t0 < TETTO) { const r = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const ph = window.__CPM_PHASE && window.__CPM_PHASE(); return { t: performance.now(), ph, d: (s.ball && s.ball.heldBy) ? s.ball.heldBy.dist : null, chi: (s.ball && s.ball.heldBy) ? s.ball.heldBy.role : null, bx: s.ball ? s.ball.x : null, bz: s.ball ? s.ball.y : null, clock: s.clock, hx: s.hero ? s.hero.x : null, hy: s.hero ? s.hero.y : null, sit: (function () { try { const q = window.__CPM_CURSIT && window.__CPM_CURSIT(); return q ? (q.gi + ':' + (q.text || q.t || '').slice(0, 30)) : null; } catch (e) { return null; } })(), ht: (function () { try { return window.__CPM_HLTYPE ? window.__CPM_HLTYPE() : null; } catch (e) { return null; } })() }; } catch (e) { return null; } }).catch(() => null);
  if (r) { C.push(r); if (r.ph === 'ended' || r.ph === 'ceremony') break; } await sleep(200); }
await b.close(); srv.close();
if (process.env.CPM_DUMP) fs.writeFileSync(process.env.CPM_DUMP, JSON.stringify(C));
const perFase = {}; for (const c of C) { if (c.d == null) continue; const f = (perFase[c.ph] = perFase[c.ph] || { n: 0, lontano: 0 }); f.n++; if (c.d > 4) f.lontano++; }
/* tratti abbandonati: pallone a piu' di 4 unita' da tutti E fermo (spostamento < 0,3 fra due campioni), consecutivi */
const tratti = []; let cur = null;
for (let i = 1; i < C.length; i++) { const a = C[i - 1], c = C[i]; const fermo = a.bx != null && c.bx != null && Math.hypot(c.bx - a.bx, c.bz - a.bz) < 0.3;
  if (c.d != null && c.d > 4 && fermo && c.ph === a.ph) { if (!cur) cur = { ph: c.ph, t0: a.t, dMax: c.d, clock: c.clock }; cur.t1 = c.t; cur.dMax = Math.max(cur.dMax, c.d); }
  else if (cur) { tratti.push(cur); cur = null; } }
if (cur) tratti.push(cur);
const lunghi = tratti.map(x => ({ ph: x.ph, s: +((x.t1 - x.t0) / 1000).toFixed(1), dMax: x.dMax, min: x.clock })).filter(x => x.s >= 0.6);
console.log('campioni', C.length, 'per fase', JSON.stringify(Object.fromEntries(Object.entries(perFase).map(([k, v]) => [k, { n: v.n, lontano: +(100 * v.lontano / v.n).toFixed(1) + '%' }]))));
console.log('tratti abbandonati >= 0,6 s:', lunghi.length, JSON.stringify(lunghi.slice(0, 25)));
