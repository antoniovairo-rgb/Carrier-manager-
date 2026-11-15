#!/usr/bin/env node
/* [giro 190 · PO-380b · G181-02 «la frase del mister alla convocazione e' identica 6 volte su 6»] GUARDIANO convocazione-190.
   Sul gioco vero (?cpmtest=1), con la funzione vera calcCoachDecision e il salvataggio di prova della stagione 12 (OVR 93,
   sempre titolare: e' il caso del collaudo 181):
   1. SEI SETTIMANE DI FILA, ognuna coi suoi fatti (avversario in calendario, ultima partita con voto/gol, stanchezza): le frasi
      distinte devono essere almeno 4 su 6 (partenza misurata: 1 su 6) e OGNI frase deve citare un fatto della sua settimana
      (l'avversario di quella settimana, l'avversario o il voto dell'ultima partita, la serie di gol, la stanchezza).
   2. DETERMINISMO: la stessa settimana chiamata due volte da' la stessa frase.
   3. LA SCELTA NON CAMBIA: su 300 settimane sintetiche status e minuto d'ingresso sono identici a quelli del braccio rosso
      (cambia solo la frase), con lo stesso generatore seminato.
   4. Panchina e non convocato: anche li' 6 settimane danno almeno 3 frasi distinte, ognuna con un fatto.
   Braccio rosso: CPM_ROSSO190B=1 accende __CPM_NO_G190B → deve uscire 1.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node convocazione-190.mjs */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO190B === '1';
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  const page = await browser.newPage(); await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G190B = 1; }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof calcCoachDecision === 'function', null, { timeout: 60000 });
  const R = await page.evaluate((base) => {
    const AVV = ['FC Valmora', 'FC Genova', 'FC Bergamo', 'FC Sardo', 'FC Friulano', 'FC Salento', 'FC Torvelle'];
    const sett = (p0, profilo) => { const out = []; let p = JSON.parse(JSON.stringify(p0));
      for (let i = 0; i < 6; i++) {
        const wk = 10 + i; const avv = AVV[i + 1], prec = AVV[i];
        const voto = profilo.voti[i], gol = profilo.gol[i];
        p.week = wk; p.fatigue = profilo.fat[i];
        p.calendar = [{ matchday: wk, week: wk, opponentId: 'x' + i, opponentName: avv, isHome: i % 2 === 0, played: false }];
        p.matchHistory = [...(p.matchHistory || []).slice(-5), { season: p.season, week: wk - 1, opponent: prec, rating: voto, goals: gol }];
        if (profilo.forza) Object.assign(p, profilo.forza);
        const d = calcCoachDecision(p, 1, seededRng(1000 + i)); const d2 = calcCoachDecision(p, 1, seededRng(1000 + i));
        let serie = 0; for (let k = p.matchHistory.length - 1; k >= 0; k--) { if (p.matchHistory[k].goals > 0) serie++; else break; }
        const fatti = [avv, prec, voto.toFixed(1).replace('.', ','), serie >= 2 ? serie + ' partite' : '@@', 'gambe', 'fisico', 'allenamento'];
        out.push({ wk, status: d.status, reason: d.reason, stessa: d.reason === d2.reason, fatto: fatti.some(f => d.reason.includes(f)), avv });
      }
      return out; };
    const p0 = base.player;
    const tit = sett(p0, { voti: [7.8, 6.4, 5.6, 7.1, 8.2, 6.9], gol: [2, 1, 0, 1, 1, 0], fat: [20, 35, 60, 25, 30, 45] });
    const pan = sett(p0, { voti: [5.8, 6.0, 6.4, 5.5, 6.2, 6.1], gol: [0, 0, 1, 0, 0, 1], fat: [80, 82, 40, 79, 30, 85], forza: { ovr: 55, coachTrust: 35, squadRole: 'riserva', club: { ...p0.club, p: 88 } } });
    const fuo = sett(p0, { voti: [5.2, 5.6, 6.0, 5.4, 5.9, 5.0], gol: [0, 0, 0, 0, 0, 0], fat: [85, 30, 90, 40, 20, 88], forza: { coachTrust: 8 } });
    /* la scelta non cambia: status + minuto d'ingresso contro il braccio rosso, stesso generatore */
    let diversi = 0, n = 0, varieRosso = 0;
    for (let i = 0; i < 300; i++) {
      const s = (k) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
      const p = { ...p0, week: 1 + (i % 38), coachTrust: Math.round(s(1) * 100), fatigue: Math.round(s(2) * 100), form: 30 + Math.round(s(3) * 65), ovr: 50 + Math.round(s(4) * 45),
        calendar: [{ week: 1 + (i % 38), opponentName: AVV[i % 7], played: false }], matchHistory: [{ opponent: AVV[(i + 1) % 7], rating: 5 + s(5) * 4, goals: s(6) > 0.6 ? 1 : 0 }] };
      const v = calcCoachDecision(p, 1 + Math.round(s(7) * 8), seededRng(77 + i));
      const prima = window.__CPM_NO_G190B; window.__CPM_NO_G190B = 1;
      const r = calcCoachDecision(p, 1 + Math.round(s(7) * 8), seededRng(77 + i));
      window.__CPM_NO_G190B = prima;
      n++; if (v.status !== r.status || v.entryMinute !== r.entryMinute) diversi++; if (v.reason !== r.reason) varieRosso++;
    }
    return { tit, pan, fuo, diversi, n, varieRosso };
  }, save);
  const giudica = (nome, arr, minimo) => {
    for (const x of arr) console.log(`    sett. ${x.wk} ${x.status} · «${x.reason}»`);
    const dist = new Set(arr.map(x => x.reason)).size;
    ok(dist >= minimo, `${nome}: frasi distinte su 6 settimane ${dist} (almeno ${minimo}; partenza 1)`);
    ok(arr.every(x => x.fatto), `${nome}: ogni frase cita un fatto della sua settimana (${arr.filter(x => x.fatto).length}/6)`);
    ok(arr.every(x => x.stessa), `${nome}: la stessa settimana da' la stessa frase (${arr.filter(x => x.stessa).length}/6)`);
    return arr;
  };
  console.log('1) titolare (S12, OVR 93)'); const t = giudica('titolare', R.tit, 4);
  ok(t.every(x => x.status === 'starter'), `titolare: status titolare ${t.filter(x => x.status === 'starter').length}/6 (il caso del collaudo)`);
  console.log('2) panchina'); const pb = giudica('panchina', R.pan.filter(x => x.status === 'bench'), 3);
  ok(pb.length >= 4, `panchina: settimane in panchina ${pb.length}/6`);
  console.log('3) non convocato'); const nc = giudica('non convocato', R.fuo.filter(x => x.status === 'not_called'), 3);
  ok(nc.length >= 4, `non convocato: settimane fuori ${nc.length}/6`);
  console.log('4) la scelta del mister non cambia');
  ok(R.diversi === 0, `status e minuto d'ingresso diversi dal braccio rosso: ${R.diversi}/${R.n} (frasi cambiate: ${R.varieRosso})`);
  await page.close();
} catch (e) { ok(false, 'non giudicato: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G190B] ' : ''}convocazione-190: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
