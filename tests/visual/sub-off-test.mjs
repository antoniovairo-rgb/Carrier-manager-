#!/usr/bin/env node
/* [7.38.0 Sezione 8] PROBE — convocazioni/panchina intelligenti:
   (1) SOSTITUZIONE IN USCITA dal vivo: starter con fatica alta → esce al minuto pre-calcolato,
       overlay «SOSTITUITO AL N'», e a commit la matchHistory porta matchStatus:"subbed_off" + minutesPlayed<90;
   (2) TURNOVER DI COPPA nel prompt: titolare affaticato + cupRound 1 → «Turnover di coppa» (panchina);
   (3) controprova: FINALE di coppa (round 4, mw 10) → resta titolare (niente turnover). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const baseSave = (extra = {}, playerExtra = {}) => ({ phase: 'career', player: {
  name: 'SubOff Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 8, age: 24, ovr: 76,
  tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
  squadRole: 'titolare', coachTrust: 88,
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 85, morale: 74, fatigue: 74, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 },
  ...playerExtra }, ...extra });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  return page;
};

// ── (1) sostituzione in uscita dal vivo ──────────────────────────────────
{
  const page = await boot(baseSave());
  // entra nel live di campionato con gli handler VERI (pattern live-validator)
  for (let a = 0; a < 14 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
    await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch';
      if (pm !== true) { const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments(); } });
    await sleep(900);
  }
  if (!(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function'))) {
    issues.push('(1) impossibile raggiungere il live di campionato');
  } else {
    const fatig = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return s.player.fatigue; });
    console.log('(1) live raggiunto · fatica pre-gara:', fatig);
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded' }));
    let sawSubOverlay = false, sawMinLine = false, over = false;
    const t0 = Date.now(); let lastTxt = '';
    while (Date.now() - t0 < 300000) {
      await sleep(1200);
      const st = await page.evaluate(() => ({ txt: document.body.innerText.slice(0, 2500), ap: typeof window.__CPM_AUTOPLAY === 'function' }));
      lastTxt = st.txt;
      if (/SOSTITUITO AL \d+'/.test(st.txt)) sawSubOverlay = true;
      /* ⚠️ NON usare /FISCHIO FINALE/i: da sostituito compare il pulsante «Salta al fischio finale →»
         mentre la partita è ancora in corso, e il ciclo usciva al 73' credendola finita. */
      if (/FISCHIO FINALE/.test(st.txt) && !/Salta al fischio finale/i.test(st.txt)) {
        /* il banner del fischio finale compare mentre la schermata di fine partita sta ancora montando:
           la riga dei minuti giocati arriva un istante dopo → si campiona di nuovo prima di giudicare. */
        over = true; await sleep(2600);
        const fin = await page.evaluate(() => document.body.innerText.slice(0, 2500));
        lastTxt = fin;
        if (/' giocati/.test(st.txt) || /' giocati/.test(fin)) sawMinLine = true;
        if (process.env.SO_DEBUG) console.log('[debug] testo post-fischio:\n' + fin.replace(/\n{2,}/g, '\n').slice(0, 900));
        if (/SOSTITUITO AL \d+'/.test(fin)) sawSubOverlay = true;
        break;
      }
      if (!st.ap) { over = true; break; } // LiveMatch smontato = già committato
    }
    if (!over) issues.push('(1) partita mai finita entro 5 min');
    if (!sawSubOverlay) issues.push('(1) overlay «SOSTITUITO AL N\'» mai apparso');
    if (over && !sawMinLine && /FISCHIO/i.test(lastTxt)) issues.push('(1) riga minuti giocati assente nel post-partita');
    // commit: tap sul post-partita (Enter sul panel ended)
    for (let k = 0; k < 8; k++) {
      const done = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return (s.player.matchHistory || []).length > 0; });
      if (done) break;
      try { await page.keyboard.press('Enter'); } catch (e) {}
      try { const b = page.getByRole('button').filter({ hasText: /Continua|Vai|→/ }).first(); await b.click({ timeout: 1500 }); } catch (e) {}
      await sleep(1200);
    }
    const entry = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const mh = s.player.matchHistory || []; return mh[mh.length - 1] || null; });
    console.log('(1) entry:', JSON.stringify(entry && { st: entry.matchStatus, min: entry.minutesPlayed, r: entry.rating }));
    if (!entry) issues.push('(1) matchHistory vuota dopo il commit');
    else {
      if (entry.matchStatus !== 'subbed_off') issues.push(`(1) matchStatus atteso "subbed_off", trovato "${entry.matchStatus}"`);
      if (!(entry.minutesPlayed >= 55 && entry.minutesPlayed < 90)) issues.push(`(1) minutesPlayed fuori range: ${entry.minutesPlayed}`);
    }
  }
  await page.close();
}

// ── (2) turnover di coppa nel prompt ─────────────────────────────────────
{
  const save = baseSave({}, { weekLived: true, fatigue: 70,
    calendar: [{ matchday: 990, week: 8, opponentId: 'fcb', opponentName: 'FC Bayerland', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'R16' }],
    cup: { active: true, round: 1, results: [], champion: false, eliminated: false } });
  const page = await boot(save);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(400);
  try { await page.getByRole('button').filter({ hasText: /Gioca/ }).first().click({ timeout: 6000 }); } catch (e) { issues.push('(2) CTA Gioca non trovato'); }
  await sleep(900);
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  console.log('(2) prompt:', /Turnover di coppa/.test(txt) ? 'Turnover di coppa ✓' : (txt.match(/Panchina[^\n]*|Sei Titolare/g) || ['??']).join(' | '));
  if (!/Turnover di coppa/.test(txt)) issues.push('(2) «Turnover di coppa» assente nel prompt (titolare affaticato, R16)');
  if (!/Panchina/.test(txt)) issues.push('(2) stato Panchina assente nel prompt di coppa');
  await page.close();
}

// ── (3) controprova: FINALE di coppa → niente turnover ───────────────────
{
  const save = baseSave({}, { weekLived: true, fatigue: 70,
    calendar: [{ matchday: 994, week: 8, opponentId: 'fcb', opponentName: 'FC Bayerland', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 4, cupRoundName: 'Finale' }],
    cup: { active: true, round: 4, results: [], champion: false, eliminated: false } });
  const page = await boot(save);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(400);
  try { await page.getByRole('button').filter({ hasText: /Gioca/ }).first().click({ timeout: 6000 }); } catch (e) { issues.push('(3) CTA Gioca non trovato'); }
  await sleep(900);
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  console.log('(3) prompt finale:', /Sei Titolare/.test(txt) ? 'Titolare ✓' : (txt.match(/Turnover di coppa|Panchina[^\n]*/g) || ['??']).join(' | '));
  if (/Turnover di coppa/.test(txt)) issues.push('(3) turnover applicato anche in FINALE (mw 10) — sbagliato');
  if (!/Sei Titolare/.test(txt)) issues.push('(3) «Sei Titolare» assente nel prompt della finale');
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SUB-OFF/TURNOVER OK (uscita live + minuti · turnover R16 · finale titolare)');
process.exit(issues.length ? 1 : 0);
