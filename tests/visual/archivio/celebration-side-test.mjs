#!/usr/bin/env node
/* [7.278.0 collaudo PO «il festeggiamento del trofeo deve avvenire sotto la curva dei propri tifosi»]
   GUARDIANO del LATO della premiazione. Nel 3D convivono DUE convenzioni di «casa» (lezione 7.52.2):
   il lato-MESH (l'eroe è sempre la squadra di casa fisica) e il lato-TRIBUNA (la Curva Sud, x=+, ospita
   i tifosi della squadra di casa REALE). Il giro di campo della cerimonia puntava sempre a x=+ — cioè,
   in trasferta, sotto la curva degli AVVERSARI.
   Misura: durante il beat «sotto la curva» (cerT≈8.5s) la x dell'eroe deve stare sul lato dei PROPRI
   tifosi: positiva in casa, NEGATIVA in trasferta. Hook test-only `__CPM_CERX`.
   Due accorgimenti obbligati (lezione 7.24.1): in headless la scena gira a ~1-2 fps, quindi (a) il timer
   a orologio che chiude la cerimonia dopo 14s va neutralizzato o la fase muore a cerT≈0.4, e (b) i frame
   vanno pompati a mano. La gara in TRASFERTA si ottiene con un boot in 2 fasi: si legge il calendario
   migrato e si riparte da una settimana con una gara fuori casa.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node celebration-side-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

/* il timer a orologio della cerimonia (14s) la ucciderebbe prima del beat sotto la curva: in headless
   14s reali valgono ~20 frame. Lo disinnesco SOLO nella probe, come già fatto per il collaudo 7.24.1. */
const freezeCeremonyTimer = (page) => page.addInitScript(() => {
  const st = window.setTimeout;
  window.setTimeout = function (fn, ms, ...a) { if (ms === 14000 || ms === 9500) return 0; return st.call(window, fn, ms, ...a); };
});

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
  await installCdnRoutes(page); await freezeCeremonyTimer(page);
  await openMatch(page, port, {});
  const r = await runCeremony(page, 8.6);
  console.log(`(A) casa — cerT ${r.cerT.toFixed(1)}s · x eroe ${r.x === null ? 'HOOK ASSENTE' : r.x.toFixed(1)}`);
  if (r.x === null) issues.push('(A) hook __CPM_CERX non esposto');
  else if (r.cerT < 8) issues.push(`(A) beat «sotto la curva» non raggiunto (cerT ${r.cerT.toFixed(1)}s)`);
  else if (r.x < 20) issues.push(`(A) in casa la festa non è sotto la Curva Sud (x=${r.x.toFixed(1)}, attesa > +20)`);
  await page.close();
}

// ───── (B) IN TRASFERTA: la festa deve spostarsi sul lato dei propri tifosi (x negativa)
const mkSave = (extra) => ({ phase: 'career', player: {
  name: 'Curva Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 26, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 74, teamChemistry: 64,
  club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 78, tecnica: 78, fisico: 75, 'mentalità': 77, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 82, morale: 80, fatigue: 30, popularity: 52, totalMatches: 130, totalGoals: 55,
  matchHistory: [], contract: { duration: 3, wage: 14000, expiresAtSeason: 8 }, ...extra } });

const bootCareer = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  page.on('pageerror', e => issues.push('pageerror(trasferta): ' + String(e.message).slice(0, 120)));
  await installCdnRoutes(page); await freezeCeremonyTimer(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  return page;
};

{
  // fase 1 — leggo il calendario che la migrazione genera davvero
  const p1 = await bootCareer(mkSave({}));
  await sleep(800);
  const cal = await p1.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')).player.calendar || []; } catch (e) { return []; } });
  await p1.close();
  const away = cal.find(m => m && !m.played && m.isHome === false && !m.type);
  if (!away) issues.push(`(B) nessuna gara di lega in trasferta nel calendario (${cal.length} voci)`);
  else {
    // fase 2 — riparto dalla settimana di quella gara, col calendario VERBATIM
    const p2 = await bootCareer(mkSave({ week: away.week, calendar: cal }));
    for (let a = 0; a < 12 && !(await p2.evaluate(() => typeof window.__CPM_FORCE_CEREMONY === 'function')); a++) {
      const r0 = await p2.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'no-hook';
        if (pm !== true) { const st = C.step ? C.step() : 'no-step'; return pm + '/' + st; } return 'match'; });
      if (process.env.CS_DEBUG) console.log('   [debug] tentativo', a, '→', r0, await p2.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cpm-v3')); const m = (s.player.calendar||[]).find(x=>x&&x.week===s.player.week); return 'W'+s.player.week+(m?(' home='+m.isHome+' played='+m.played+' type='+(m.type||'lega')):' (nessuna voce)'); } catch(e){return 'err';} }));
      await sleep(1400);
    }
    if (!(await p2.evaluate(() => typeof window.__CPM_FORCE_CEREMONY === 'function'))) issues.push('(B) live in trasferta non raggiunto');
    else {
      const r = await runCeremony(p2, 8.6);
      console.log(`(B) trasferta (W.${away.week} vs ${away.opponentName || away.opponentId}) — cerT ${r.cerT.toFixed(1)}s · x eroe ${r.x === null ? 'HOOK ASSENTE' : r.x.toFixed(1)}`);
      if (r.x === null) issues.push('(B) hook __CPM_CERX non esposto');
      else if (r.cerT < 8) issues.push(`(B) beat «sotto la curva» non raggiunto (cerT ${r.cerT.toFixed(1)}s)`);
      else if (r.x > -20) issues.push(`(B) in trasferta la festa è ancora sotto la curva AVVERSARIA (x=${r.x.toFixed(1)}, attesa < -20)`);
    }
    await p2.close();
  }
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — la premiazione si svolge sempre sotto la curva dei propri tifosi');
