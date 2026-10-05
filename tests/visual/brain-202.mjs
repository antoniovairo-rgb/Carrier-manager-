#!/usr/bin/env node
/* [7.999.137 PO-202, direttiva PO 05/10 «il brain deve decidere tutto durante la partita» + decisione PO «talento nel brain»]
   GUARDIANO in due parti.
   (A) TALENTO NEL BRAIN, in node: 120 partite del motore sulle 24 configurazioni vere della vissuta S12 (fixtures/cfg-202-s12.json,
       eroe OVR 93), 5 semi ciascuna, occasioni dell'eroe nel motore. VERDE: gol dell'eroe a partita fra 0,55 e 1,0 (obiettivo PO 0,6-0,9; misurato 0,71 a K=3). ROSSO (__CPM_NO_TAL202):
       sotto lo 0,5 (misurato 0,35).
   (B) LA SCENA LA GIOCA IL MOTORE, in una partita vera dal salvataggio S12 (autoplay, seme fisso): VERDE almeno una scena di tiro o
       assist decisa da giocaScena (testimone __CPM_SCENA137). ROSSO (__CPM_NO_BRAIN137): nessuna. Uso: node brain-202.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const P = [[8, 50, 1], [18, 12], [18, 38], [18, 62], [18, 88], [38, 25], [38, 50], [38, 75], [55, 22], [55, 78]], Q = [[95, 50, 1], [82, 12], [82, 38], [82, 62], [82, 88], [62, 25], [62, 50], [62, 75], [48, 20], [48, 50], [48, 80]];
const R = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
const gio = () => P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: R(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: R(i), x: p[0], y: p[1] })));
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));/* le 24 configurazioni vere (giocatori, forze, tattiche) registrate dalla vissuta S12 il 05/10 */
const braccioA = (W) => { const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W); let e = 0; const N = CFG.length * 5;
  for (let s = 0; s < N; s++) { const c0 = CFG[s % CFG.length]; const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const B = 22; for (let m = 1; m <= 46; m++) for (let b = 0; b < B; b++) M.tick({ min: Math.min(m, 45), dt: 1 / B, dec: true });
    M.chiedi.riprendi({ centro: true, lato: 'away' }); for (let m = 46; m <= 93; m++) for (let b = 0; b < B; b++) M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true });
    const q = (M.pagelle() || []).find(x => x.eroe || x.i === M.HERO); e += q ? (q.gol | 0) : 0; }
  return +(e / N).toFixed(3); };
const A = { verde: braccioA({ __CPM_NO_TETTO202: true }), rosso: braccioA({ __CPM_NO_TETTO202: true, __CPM_NO_TAL202: true }) };
console.log('A talento, gol dell\'eroe a partita ' + JSON.stringify(A));
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const Bx = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_BRAIN137 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { const s = await page.evaluate(() => ({ f: window.__CPM_PHASE && window.__CPM_PHASE(), n: (window.__CPM_SCENA137 || []).filter(x => x && x.g).length })); ph = s.f; if (ph === 'ended' || (!rosso && s.n >= 2)) break; await sleep(1000); }
  const r = await page.evaluate(() => { const W = window.__CPM_SCENA137 || []; return { scene: W.length, decise: W.filter(x => x && x.g).length, esiti: W.filter(x => x && x.g).map(x => x.fam + ':' + x.g.esito).slice(0, 8) }; });
  Bx[rosso ? 'rosso' : 'verde'] = { fase: ph, ...r }; console.log('B ' + (rosso ? 'rosso ' : 'verde ') + JSON.stringify(Bx[rosso ? 'rosso' : 'verde'])); await ctx.close();
}
await b.close(); srv.close();
const g = [];
if (!(A.verde >= 0.55 && A.verde <= 1.0)) g.push('A verde fuori banda 0,55-1,0: ' + A.verde);
if (!(A.rosso < 0.5)) g.push('A rosso: il talento spento non si vede ' + A.rosso);
if (!(Bx.verde.decise >= 1)) g.push('B verde: nessuna scena decisa dal motore ' + JSON.stringify(Bx.verde));
if (!(Bx.rosso.decise === 0)) g.push('B rosso: scene decise dal motore anche spento ' + JSON.stringify(Bx.rosso));
if (g.length) { console.log('❌ brain-202'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ brain-202 verde (e il rosso si vede)');
