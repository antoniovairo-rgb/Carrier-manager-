#!/usr/bin/env node
/* [7.423.0] GUARDIANO — LA PARATA DEL PULLMAN APPARE AI CAMPIONI, E SOLO A LORO
   (evolutiva PO «dopo la cerimonia alla vittoria di uno scudetto o coppa europea farei vedere
    anche scene 3d con il pullman scoperto e tifosi e squadra in festa»)
   COSA MISURA: due carriere portate a Fine Stagione con gli handler veri — (A) da CAMPIONE la
   parata si apre (scena montata, 6 uomini sul tetto, titolo a schermo) e «Continua» la chiude
   verso il resoconto; (B) da NON campione (7°) la parata NON deve mai apparire — e' la prova
   del rosso incorporata: se apparisse a tutti, non celebrerebbe niente.
     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node parata-test.mjs                                  */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];
for (const champ of [true, false]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e).slice(0, 160)));
  await page.addInitScript((isC) => {
    window.__CPM_GLB = false;
    const st = Array.from({ length: 18 }, (_, i) => ({ id: i === 0 ? 'sal' : 'c' + i, n: i === 0 ? 'FC Salernum' : 'Club ' + i, pts: i === 0 ? (isC ? 88 : 40) : (isC ? 40 - i : 70 - i), played: 34, gf: 60, ga: 20, w: 20, d: 4, l: 10 }));
    const save = { phase: 'career', player: {
      name: 'Parata Probe', nation: 'Italia', avatarId: 2, proStatus: 'pro', season: 3, week: 38, weekLived: true, age: 24, ovr: 84,
      campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true,
      club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
      stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 83, tiro: 85, passaggio: 83, dribbling: 84, posizionamento: 83 },
      form: 78, morale: 80, fatigue: 10, popularity: 60, value: 30, bankBalance: 90000, goals: 22, assists: 9, matches: 34,
      standings: st, calendar: [], contract: { duration: 2, wage: 20000, expiresAtSeason: 5 },
    } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, champ);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 5; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return res; });
    if (r === 'seasonEnd') break;
    await sleep(400);
  }
  await sleep(2500);
  try { await page.getByText('Salta il gala', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(3000);
  for (let i = 0; i < 4; i++) {
    const hit = await page.evaluate(() => { const bs = Array.from(document.querySelectorAll('button')); const b2 = bs.find(x => /Continua alla Fine Stagione|Riepilogo/i.test(x.textContent || '')); if (b2) { b2.click(); return true; } return false; });
    if (!hit) break; await sleep(2500);
  }
  await sleep(3000);
  const info = await page.evaluate(() => ({ par: window.__CPM_PARATA || null, txt: /LA PARATA/.test(document.body.innerText || '') }));
  if (champ) {
    if (!info.txt) guasti.push('(A) da CAMPIONE la parata non si e\' aperta');
    if (!info.par || info.par.men < 4) guasti.push('(A) squadra sul tetto assente: ' + JSON.stringify(info.par));
    const closed = await page.evaluate(() => { const bs = Array.from(document.querySelectorAll('button')); const b2 = bs.find(x => /^Continua/.test((x.textContent || '').trim()) && x.closest('[style*="fixed"]')); if (b2) { b2.click(); return true; } return false; });
    await sleep(1500);
    const after = await page.evaluate(() => ({ txt: /LA PARATA/.test(document.body.innerText || ''), fine: /Fine Stagione/i.test(document.body.innerText || '') }));
    if (!closed || after.txt) guasti.push('(A) «Continua» non chiude la parata');
    if (!after.fine) guasti.push('(A) dopo la parata non appare il resoconto di Fine Stagione');
    console.log(`(A) campione: parata ${info.txt ? 'APERTA' : 'assente'} · uomini ${info.par ? info.par.men : '—'} · chiusa e resoconto ${after.fine}`);
  } else {
    if (info.txt) guasti.push('(B) la parata e\' apparsa a un SETTIMO in classifica: non celebra niente');
    console.log(`(B) non campione: parata ${info.txt ? 'APPARSA (guasto)' : 'assente (giusto)'}`);
  }
  await page.close();
}
await b.close(); srv.close();
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — il pullman scoperto sfila per i campioni, e solo per loro');
