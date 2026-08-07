#!/usr/bin/env node
/* [7.338.0] SONDA DIAGNOSTICA — la mano del giornalista nell'intervista 3D (collaudo PO «sembra un film horror»).
   Riproduce l'inquadratura del TELEFONO (viewport stretto + bottom-sheet che copre il basso) col giornalista
   UOMO (actor-presenter.glb) e con quello DONNA (actor-journalist.glb), misura via __CPM_IVRIG dove finiscono
   mani/microfono/taccuino e salva screenshot + ritagli zoomati della zona mani.
   Uso: node interview-hand-diag.mjs   (out/ivhand-*.png, misure a stdout) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const ctxOpt = { viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, serviceWorkers: 'block' };/* zoom nitido sulle mani */

const save = (journo) => ({ phase: 'career', player: { name: 'Hand Probe', nation: 'Italia', avatarId: 7, proStatus: 'pro', season: 3, week: 10, weekLived: true, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: 80,
  goals: 6, assists: 2, matches: 9, journalists: [journo],
  matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } });

const MEN = { id: 'j_ferretti', name: 'Marco Ferretti', paper: 'Sprint Sportivo', icon: '📰', color: '#ef4444', type: 'critico' };
const WOMEN = { id: 'j_greco', name: 'Elena Greco', f: true, paper: 'Sport in Rete', icon: '🌐', color: '#8b5cf6', type: 'investigativa' };

for (const [tag, journo] of [['uomo', MEN], ['donna', WOMEN]]) {
  const bctx = await browser.newContext(ctxOpt);
  const page = await bctx.newPage();
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript((o) => { localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save(journo));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(400);
  const ok = await page.evaluate(() => window.__CPM_CAREER.forceInterview('draw'));
  if (ok !== true) { console.log(`${tag}: forceInterview fallita (${ok})`); await bctx.close(); continue; }
  await sleep(6000); /* aggancio actor GLB */
  await page.screenshot({ path: `out/ivhand-${tag}.png` });
  const rig = await page.evaluate(() => window.__CPM_IVRIG || null);
  /* ritagli ESATTI attorno alle mani, dalla proiezione del rig (niente clip a occhio) */
  if (rig && rig.px) {
    const box = (c, r) => c ? { x: Math.max(0, c[0] - r), y: Math.max(0, c[1] - r), width: r * 2, height: r * 2 } : null;
    for (const [k, r] of [['rhand', 90], ['lhand', 90], ['pad', 70]]) {
      const c = rig.px[k === 'rhand' ? 'rHand' : k === 'lhand' ? 'lHand' : 'pad'];
      const b = box(c, r); if (!b) continue;
      try { await page.screenshot({ path: `out/ivhand-${tag}-${k}.png`, clip: b }); } catch (e) { console.log(`clip ${k} fuori viewport`); }
    }
  }
  const gender = await page.evaluate(() => { const t = document.body.innerText; return /Marco Ferretti|Sprint Sportivo/.test(t) ? 'uomo-atteso' : /Elena Greco|Sport in Rete/.test(t) ? 'donna-attesa' : '?'; });
  console.log(`\n=== ${tag.toUpperCase()} (${gender}) ===`);
  console.log(JSON.stringify(rig, null, 1));
  if (rig && rig.pad && rig.spine) {
    const dx = Math.abs(rig.pad.p[0] - rig.spine[0]), dz = Math.abs(rig.pad.p[2] - rig.spine[2]);
    console.log(`taccuino: dist dalla mano ${rig.padFromHand}u · offset dal busto x${dx.toFixed(3)} z${dz.toFixed(3)} · altezza y${rig.pad.p[1]}`);
    console.log(`taccuino bbox: ${JSON.stringify(rig.pad.bb)} (spessore x ${(rig.pad.bb.max[0] - rig.pad.bb.min[0]).toFixed(3)} · y ${(rig.pad.bb.max[1] - rig.pad.bb.min[1]).toFixed(3)} · z ${(rig.pad.bb.max[2] - rig.pad.bb.min[2]).toFixed(3)})`);
  }
  if (errs.length) console.log('PE: ' + errs.join(';'));
  await bctx.close();
}
await browser.close(); srv.close();
console.log('\nscreenshot → out/ivhand-*.png');
