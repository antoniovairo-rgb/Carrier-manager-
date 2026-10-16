// COLLAUDO L6 1-bis — effetto per voce dell'Ufficio misurato sulle funzioni VERE del gioco esposte dall'harness
// (__CPM_CAREER.weeklyGrowthFields / weeklyEconomyFields / simInjuryRoll / investRate24), con Math.random riseminato
// identico nei due bracci (con e senza la voce): il confronto e' esatto, senza il rumore delle carriere intere.
// Solo misura. Uso: node ufficio-puro.mjs  → docs/collaudi/dati-carriere-l6-bis/ufficio-puro.json
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../lib/harness.mjs';
const GAME = process.env.CPM_GAME || 'CM170.html';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage(); await installCdnRoutes(page);
const save = { phase: 'career', player: { name: 'Ufficio Puro', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 10, age: 23, ovr: 70, tutorialDone: true, archetype: 'bomber', position: 'Attaccante', foot: 'R',
  club: { id: 'gor', n: 'FC Deventer', a: 'DEV', p: 60, c: '#f59e0b', c2: '#dc2626', nat: '🇳🇱', lg: 'Liga Oranje' }, stats: { 'velocità': 68, tecnica: 68, fisico: 68, 'mentalità': 68, tiro: 72, passaggio: 66, dribbling: 68, posizionamento: 70 },
  form: 70, morale: 60, fatigue: 20, coachTrust: 65, bankBalance: 3000000, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
await page.addInitScript(s => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-v3', s); } catch (e) {} }, JSON.stringify(save));
await page.goto(`http://localhost:${port}/${GAME}?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(800);
const R = await page.evaluate(() => {
  const C = window.__CPM_CAREER, P0 = C.snapshot(), orig = Math.random;
  const seed = s => { s = (s >>> 0) || 1; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const stSum = st => Object.values(st).reduce((a, b) => a + b, 0);
  const out = { version: GAME_VERSION };
  // 1) personal trainer: punti statistica per settimana di auto-allenamento (stessi semi nei 4 livelli)
  out.trainer = {};
  for (const fat of [20, 40]) for (let lv = 0; lv <= 3; lv++) { let pts = 0; const N = 3000;
    for (let i = 1; i <= N; i++) { seed(i * 7 + fat); const p = { ...P0, fatigue: fat, sessionsThisWeek: 0, perkTrainer: lv > 0, perkTrainerLv: lv || undefined }; const g = C.weeklyGrowthFields(p, {}); pts += stSum(g.stats) - stSum(P0.stats); }
    out.trainer[`fatica${fat}_lv${lv}`] = +(pts / N).toFixed(4); }
  // 2) mental coach e beni (casa, barca): morale dopo una settimana, partendo da 50/60/70
  out.morale = {};
  for (const m of [50, 60, 70]) { const row = {}; for (const [k, ext] of [['nessuno', {}], ['mental1', { perkMental: true, perkMentalLv: 1 }], ['mental3', { perkMental: true, perkMentalLv: 3 }], ['casa', { beni24: ['casa'] }], ['casa+barca', { beni24: ['casa', 'barca'] }]]) {
      seed(99); const g = C.weeklyGrowthFields({ ...P0, morale: m, sessionsThisWeek: 3, ...ext }, { morale: m }); row[k] = g.morale; } out.morale['da' + m] = row; }
  // equilibrio della morale su 60 settimane (solo drift + voce; nessun evento)
  out.moraleEquilibrio = {};
  for (const [k, ext] of [['nessuno', {}], ['mental3', { perkMental: true, perkMentalLv: 3 }], ['casa+barca', { beni24: ['casa', 'barca'] }]]) { let m = 60; for (let w = 0; w < 60; w++) { seed(5 + w); m = C.weeklyGrowthFields({ ...P0, morale: m, sessionsThisWeek: 3, ...ext }, { morale: m }).morale; } out.moraleEquilibrio[k] = m; }
  // 3) fisioterapista: tasso d'infortunio per gara simulata (stessi semi), a tre livelli di fatica
  out.infortuni = {};
  for (const fat of [45, 60, 70, 80]) for (let lv = 0; lv <= 3; lv++) { let n = 0; const N = 40000;
    for (let i = 1; i <= N; i++) { const r = C.simInjuryRoll({ ...P0, fatigue: fat, injured: false, perkFisio: lv > 0, perkFisioLv: lv || undefined }, i * 13 + 1); if (r && r.injured) n++; }
    out.infortuni[`fatica${fat}_lv${lv}`] = +(100 * n / N).toFixed(3); }
  // 4) costo settimanale (weeklyEconomyFields: saldo dopo una settimana, stipendio 6000)
  out.economia = {};
  for (const [k, ext] of [['nessuno', {}], ['trainer3', { perkTrainer: true, perkTrainerLv: 3 }], ['nutri3', { perkNutrition: true, perkNutritionLv: 3 }], ['fisio3', { perkFisio: true, perkFisioLv: 3 }], ['mental3', { perkMental: true, perkMentalLv: 3 }],
      ['tutti3', { perkTrainer: true, perkTrainerLv: 3, perkNutrition: true, perkNutritionLv: 3, perkFisio: true, perkFisioLv: 3, perkMental: true, perkMentalLv: 3 }], ['accademia', { academy24: { name: 'x', founded: 1, grads: [], tot: 0, paused: false } }],
      ['svincolato', { contractExpired: true }]]) { const e = C.weeklyEconomyFields({ ...P0, bankBalance: 1000000, ...ext }); out.economia[k] = (e.bankBalance != null ? e.bankBalance - 1000000 : 'nessun accredito'); }
  // 5) investimenti: resa per stagione 1..10 su 30 nomi
  out.investimenti = {};
  for (const prof of ['prudente', 'bilanciato', 'rischioso']) { const v = []; for (let n = 0; n < 30; n++) for (let s = 1; s <= 10; s++) v.push(C.investRate24({ name: 'Collaudo Bis ' + String(n).padStart(2, '0') }, s, prof)); v.sort((a, b) => a - b);
    out.investimenti[prof] = { media: +(v.reduce((a, b) => a + b, 0) / v.length * 100).toFixed(2), min: +(v[0] * 100).toFixed(1), max: +(v[v.length - 1] * 100).toFixed(1), negative: v.filter(x => x < 0).length, n: v.length }; }
  // 6) beni: una tantum (dalla tabella del gioco)
  out.beni = BENI24.map(d => ({ k: d.k, costo: d.c, pop: d.pop, trust: d.trust, moraleSett: d.mor }));
  out.staffTabella = STAFF24.map(d => ({ k: d.k, fx: d.fx, costoLv: [1, 2, 3].map(l => staffCost24({ contract: { wage: 6000 } , [d.k]: true, [d.lv]: l }, d.k)) }));
  out.accademia = { costo: academyCost24({ contract: { wage: 6000 } }), legacyMax: 'rag min(30, tot*3) + fondazione 10 + ricchezza 0/6/12/20' };
  Math.random = orig; return out;
});
fs.writeFileSync(path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6-bis', 'ufficio-puro.json'), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await browser.close(); srv.close();
