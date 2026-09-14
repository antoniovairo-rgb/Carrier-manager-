#!/usr/bin/env node
/* [7.39.0 §9.1/§9.2] PROBE — ritiro precampionato con AMICHEVOLE + gerarchia trasparente:
   (1) alla sessione di ritiro segue l'amichevole seedata (avversario reale della lega, voce nel log,
       nessuna voce in matchHistory — è un'amichevole);
   (2) DETERMINISMO: stesso save → stesso risultato dell'amichevole su due boot;
   (3) «Prossimo gradino» visibile nel Profilo con le soglie vive di calcSquadRole. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = () => ({ phase: 'career', player: { name: 'Ritiro Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 23, ovr: 72, tutorialDone: true, campDone: false, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3, squadRole: 'rotazione', coachTrust: 66,
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 72, tecnica: 71, fisico: 70, 'mentalità': 72, tiro: 74, passaggio: 71, dribbling: 73, posizionamento: 72 },
  form: 72, morale: 70, fatigue: 5, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } });

const boot = async () => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, mkSave());
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  return page;
};

const doRitiro = async (page) => {
  /* [7.337.0 RITIRO 2.0] la card/wizard è un launcher: «Salta il racconto» applica preparazione dello
     staff + gerarchie + amichevoli in un colpo (stesso handler del racconto completo). */
  await page.getByText('Salta il racconto', { exact: false }).first().click({ timeout: 8000 });
  await sleep(1800);
  return page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player;
    const amic = (p.log || []).find(l => l.includes('Amichevole ('));
    return { amic: amic || null, nAmic: (p.log || []).filter(l => l.includes('Amichevole (')).length, campDone: !!p.campDone, mh: (p.matchHistory || []).length, role: p.squadRole }; });
};

// (1)+(2) amichevole nel log, niente matchHistory, determinismo su doppio boot
let first = null;
{
  const pg = await boot(); first = await doRitiro(pg);
  console.log('(1) dopo il ritiro:', JSON.stringify(first));
  if (!first.campDone) issues.push('(1) campDone non settato');
  if (!first.amic) issues.push('(1) voci amichevoli assenti dal log');
  if ((first.nAmic || 0) < 2) issues.push('(1) attese ≥2 amichevoli di precampionato nel log (trovate ' + first.nAmic + ')');
  if (first.mh !== 0) issues.push('(1) l\'amichevole NON deve entrare in matchHistory (trovate ' + first.mh + ' voci)');
  await pg.close();
}
{
  const pg = await boot(); const second = await doRitiro(pg);
  console.log('(2) secondo boot:', JSON.stringify(second.amic));
  if (first.amic && second.amic !== first.amic) issues.push('(2) amichevole NON deterministica: «' + first.amic + '» vs «' + second.amic + '»');
  // (3) prossimo gradino nel Profilo (Carriera → Profilo)
  try {
    await pg.getByText('Carriera', { exact: true }).first().click({ timeout: 6000 }); await sleep(600);
    try { await pg.getByText('Profilo', { exact: false }).first().click({ timeout: 4000 }); await sleep(600); } catch (e) {}
    const txt = await pg.evaluate(() => document.body.innerText);
    console.log('(3) gradino:', /Prossimo gradino/.test(txt) ? 'visibile ✓' : 'ASSENTE');
    if (!/Prossimo gradino/.test(txt)) issues.push('(3) riga «Prossimo gradino» assente nel Profilo');
    else if (!/Titolare: OVR ≥78/.test(txt)) issues.push('(3) soglie del gradino Titolare non mostrate (ruolo rotazione)');
  } catch (e) { issues.push('(3) navigazione Profilo fallita: ' + e.message.slice(0, 80)); }
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ RITIRO+AMICHEVOLE OK (log · no-matchHistory · determinismo · gradino visibile)');
process.exit(issues.length ? 1 : 0);
