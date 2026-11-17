#!/usr/bin/env node
/* [giro 261] SONDA (non guardiano) per il bisect dei due rossi della serata: la sola serata di presentazione.
     A) `fermo`  = striscia piu' lunga senza moto per corpo, in tempo di scena (stesso metro di presentazione-142, beat 1);
     B) `pro` e `nuca` per corpo (stesso metro di spalle-146, tre campioni dopo 2,5 s).
   Uso: node misura-261.mjs [A|B|AB] [giri]   (CPM_NO=__CPM_NO_G261,... per accendere i rossi; CPM_BEAT per il beat di A) */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
const cosa = process.argv[2] || 'AB', giri = +(process.argv[3] || 1), NO = (process.env.CPM_NO || '').split(',').filter(Boolean);
const srv = await startServer(), port = srv.address().port, browser = await launchBrowser();
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: { name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1, drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: PRO.id, presentSeason: 1,
  seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 },
  form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000, goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [],
  contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
for (let g = 0; g < giri; g++) {
  if (/A/.test(cosa)) {
    const { misura } = await import('./presentazione-142-misura.mjs');
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page);
    await page.addInitScript(([o, no]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; no.forEach(k => { window[k] = 1; }); localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, NO]);
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      const m = await misura({ page, beat: +(process.env.CPM_BEAT || 1), finestra: 3000 });
      console.log('A ' + JSON.stringify({ fermo: m.traccia.fermo, max: Math.max(...m.traccia.fermo), scena: m.traccia.scena, campioni: m.traccia.campioni, clip: m.men.map(x => x.clip), eroe: m.men.findIndex(x => x.eroe) }));
    } catch (e) { console.log('A errore ' + String(e.message || e).slice(0, 200)); }
    await page.close();
  }
  if (/L/.test(cosa)) {/* traccia LUNGA della fila al beat 1: stesso campione e stesso criterio di presentazione-142 (ossa head/hand/spine_03/upperarm,
       spostamento massimo < 1,5 mm fra due campioni), ma per CPM_DUR ms e con la velocita' (mm/s di scena) accanto: dice DOVE nel tempo di scena un corpo si ferma */
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page);
    await page.addInitScript(([o, no]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; no.forEach(k => { window[k] = 1; }); localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, NO]);
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(b => window.__CPM_CAREER.apriPresentazione(b), +(process.env.CPM_BEAT || 1));
      await page.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 });
      const T = await page.evaluate(async ([dur, passo]) => { const P = window.__CPM_PRES142, v = new THREE.Vector3(), S = [];
        const snap = () => ({ el: P.el, pz: P.men.map(m => { const a = []; m.updateMatrixWorld(true); m.traverse(o => { if (o.isBone && /^(head|hand_[lr]|spine_03|upperarm_[lr])$/.test(o.name)) { o.getWorldPosition(v); a.push(v.x, v.y, v.z); } }); return a; }) });
        const t0 = performance.now(); while (performance.now() - t0 < dur) { S.push(snap()); await new Promise(r => setTimeout(r, passo)); }
        const out = P.men.map((_, i) => { let best = 0, run = 0, r0 = 0, bestDa = 0; const lente = []; for (let k = 1; k < S.length; k++) { const a = S[k - 1].pz[i], b = S[k].pz[i]; let mx = 0; for (let j = 0; j < a.length; j += 3) mx = Math.max(mx, Math.hypot(a[j] - b[j], a[j + 1] - b[j + 1], a[j + 2] - b[j + 2]));
            const dt = (S[k].el || 0) - (S[k - 1].el || 0); if (mx < 0.0015) { if (run === 0) r0 = S[k - 1].el; run += dt; if (run > best) { best = run; bestDa = r0; } } else run = 0; if (dt > 0) lente.push(mx / dt * 1000); }
          lente.sort((p, q) => p - q); return { fermo: +best.toFixed(2), da: +bestDa.toFixed(2), vMed: +lente[Math.floor(lente.length / 2)].toFixed(1), v10: +lente[Math.floor(lente.length / 10)].toFixed(1) }; });
        return { el0: +S[0].el.toFixed(2), el1: +S[S.length - 1].el.toFixed(2), campioni: S.length, passoScena: +((S[S.length - 1].el - S[0].el) / S.length).toFixed(3), corpi: out }; }, [+(process.env.CPM_DUR || 30000), +(process.env.CPM_PASSO || 120)]);
      console.log('L ' + JSON.stringify({ max: Math.max(...T.corpi.map(x => x.fermo)), ...T }));
    } catch (e) { console.log('L errore ' + String(e.message || e).slice(0, 200)); }
    await page.close();
  }
  if (/B/.test(cosa)) {
    const M = await import('./spalle-146-scene.mjs');
    const S = await M.scenaPresentazione(browser, port, { width: 360, height: 800 }, NO[0] || false, 'misura261');
    const ok = S.filter(x => !x.errore), E = ok.filter(x => x.chi === 'eroe').map(x => x.nuca).sort((a, b) => a - b);
    console.log('B ' + JSON.stringify({ errori: S.filter(x => x.errore).map(x => x.errore), n: ok.length, proMin: Math.min(...ok.map(x => x.pro)), sotto: ok.filter(x => !(x.pro >= 0.008)).length,
      pro: ok.map(x => `${x.fase}/${x.chi} ${x.pro}`).join(' · '), nucaEroe: E, nucaMed: E[Math.floor(E.length / 2)], nucaTutti: ok.map(x => x.nuca).join(' ') }));
  }
}
await browser.close(); srv.close();
