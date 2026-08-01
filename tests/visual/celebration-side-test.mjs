#!/usr/bin/env node
/* [7.278.0 collaudo PO «il festeggiamento del trofeo deve avvenire sotto la curva dei propri tifosi»]
   GUARDIANO del LATO della premiazione. Nel 3D convivono DUE convenzioni di «casa» (lezione 7.52.2):
   il lato-MESH (l'eroe è sempre la squadra di casa fisica) e il lato-TRIBUNA (la Curva Sud, x=+, ospita
   i tifosi della squadra di casa REALE). Il giro di campo della cerimonia puntava sempre a x=+ — cioè,
   in trasferta, sotto la curva degli AVVERSARI.
   Misura: durante il beat «sotto la curva» (cerT≈8.5s) la x dell'eroe deve stare sul lato dei PROPRI
   tifosi: positiva in casa, NEGATIVA in trasferta. Hook test-only `__CPM_CERX`.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node celebration-side-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const pump = (page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(window.__CPM_CERT || 0)))));
const runCeremony = async (page, upTo) => {
  await page.waitForFunction(() => typeof window.__CPM_FORCE_CEREMONY === 'function', { timeout: 25000 });
  await page.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: "CAMPIONI D'ITALIA", kind: 'league' }));
  let cur = 0, guard = 0;
  while (cur < upTo && guard++ < 4000) cur = await pump(page);
  const x = await page.evaluate(() => (typeof window.__CPM_CERX === 'number' ? window.__CPM_CERX : null));
  return { cerT: cur, x };
};

// ───── (A) IN CASA: la festa sta sul lato della Curva Sud (x positiva)
{
  const page = await browser.newPage({ viewport: { width: 700, height: 800 } });
  page.on('pageerror', e => issues.push('pageerror(casa): ' + String(e.message).slice(0, 120)));
  await installCdnRoutes(page);
  await openMatch(page, port, {});
  const r = await runCeremony(page, 8.6);
  console.log(`(A) casa — cerT ${r.cerT.toFixed(1)}s · x eroe ${r.x === null ? 'HOOK ASSENTE' : r.x.toFixed(1)}`);
  if (r.x === null) issues.push('(A) hook __CPM_CERX non esposto');
  else if (r.x < 20) issues.push(`(A) in casa la festa non è sotto la Curva Sud (x=${r.x.toFixed(1)}, attesa > +20)`);
  await page.close();
}

// ───── (B) IN TRASFERTA: la festa deve spostarsi sul lato dei propri tifosi (x negativa)
{
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  page.on('pageerror', e => issues.push('pageerror(trasferta): ' + String(e.message).slice(0, 120)));
  await installCdnRoutes(page);
  const save = { phase: 'career', player: {
    name: 'Curva Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 26, ovr: 78,
    tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
    seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 74, teamChemistry: 64,
    club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
    stats: { 'velocità': 78, tecnica: 78, fisico: 75, 'mentalità': 77, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
    form: 82, morale: 80, fatigue: 30, popularity: 52, totalMatches: 130, totalGoals: 55,
    matchHistory: [], contract: { duration: 3, wage: 14000, expiresAtSeason: 8 } } };
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  // porta il calendario su una gara in TRASFERTA, poi entra nel live
  const away = await page.evaluate(() => {
    try {
      const C = window.__CPM_CAREER; const p = C.get ? C.get() : null;
      const s = JSON.parse(localStorage.getItem('cpm-v3'));
      const cal = (s.player.calendar || []).filter(m => m && !m.played && !m.isHome && !m.type);
      return cal.length ? cal[0].week : null;
    } catch (e) { return null; }
  });
  if (away == null) issues.push('(B) nessuna gara in trasferta nel calendario del save');
  else {
    for (let a = 0; a < 40 && !(await page.evaluate(() => typeof window.__CPM_FORCE_CEREMONY === 'function')); a++) {
      const done = await page.evaluate((w) => {
        const C = window.__CPM_CAREER; C.dismiss();
        const s = JSON.parse(localStorage.getItem('cpm-v3'));
        if ((s.player.week || 1) >= w) { const pm = C.playMatch ? C.playMatch() : false; if (pm === true) return 'match'; }
        const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments();
        return 'step';
      }, away);
      await sleep(done === 'match' ? 2500 : 700);
    }
    const isAway = await page.evaluate(() => { const t = document.body.innerText || ''; return /trasferta/i.test(t) || true; });
    if (!(await page.evaluate(() => typeof window.__CPM_FORCE_CEREMONY === 'function'))) issues.push('(B) live in trasferta non raggiunto');
    else {
      const r = await runCeremony(page, 8.6);
      console.log(`(B) trasferta (W.${away}) — cerT ${r.cerT.toFixed(1)}s · x eroe ${r.x === null ? 'HOOK ASSENTE' : r.x.toFixed(1)}`);
      if (r.x === null) issues.push('(B) hook __CPM_CERX non esposto');
      else if (r.x > -20) issues.push(`(B) in trasferta la festa è ancora sotto la curva AVVERSARIA (x=${r.x.toFixed(1)}, attesa < -20)`);
    }
  }
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — la premiazione si svolge sempre sotto la curva dei propri tifosi');
