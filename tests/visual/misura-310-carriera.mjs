/* [giro 310] copia di misura-309-carriera.mjs con CPM_ROSSI=__CPM_NO_G310C,... (interruttori accesi in pagina) e uscite in out/misura-310/.
   [giro 309 PO-583/PO-584/PO-560] SOLA MISURA. Carriera da bandiera sugli handler VERI (__CPM_CAREER.step = «settimana vissuta» +
   Simula/Avanza), eroe che non cambia mai club (contratto rinnovato d'ufficio a ogni stagione, offerte mai accettate).
   Registra per stagione: lega, piazzamento, prestigio effettivo del club (base + clubPrestigeShifts), Europa, trofei, OVR medio della
   rosa, gol/assist/voto dell'eroe, infortuni e squalifiche (eroe), fatica media.
   CPM_CLUB=<id> CPM_STAGIONI=12 CPM_FATICA=gestita|trascurata CPM_OVR=68 CPM_S0=1 CPM_TAG=x node misura-309-carriera.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const CLUB = process.env.CPM_CLUB || 'auto-legaB';
const NS = +(process.env.CPM_STAGIONI || 12), FAT = process.env.CPM_FATICA || 'gestita', OVR = +(process.env.CPM_OVR || 68), S0 = +(process.env.CPM_S0 || 1);
const TAG = (process.env.CPM_TAG || `${CLUB}-${FAT}-o${OVR}-s${S0}`) + (process.env.CPM_ROSSI ? '-rosso' : '-verde');
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
// 1) scelta del club (pagina di servizio)
const ROSSI = (process.env.CPM_ROSSI || '').split(',').filter(Boolean);
await page.addInitScript(R => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; for (const k of R) window[k] = 1; }, ROSSI);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => typeof CLUBS !== 'undefined', null, { timeout: 90000 });
const club = await page.evaluate(id => { if (id !== 'auto-legaB') return CLUBS.find(c => c.id === id);
  const b = CLUBS.filter(c => !c.isU18 && c.lg === 'Lega B').sort((a, b) => a.p - b.p); return b[b.length >> 1]; }, CLUB);
const s = OVR;
await page.addInitScript(({ club, s, S0, TAG }) => {
  const save = { phase: 'career', player: { name: 'Bandiera ' + TAG, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: S0, week: 1, weekLived: false, age: 20, ovr: s, tutorialDone: true, position: 'ATT',
    club, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 60, popularity: 30, contract: { duration: 5, wage: 4000, expiresAtSeason: S0 + 5 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1 } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, { club, s, S0, TAG });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(1000);
const stag = []; const t0 = Date.now();
for (let si = 0; si < NS; si++) {
  let iter = 0, inj = 0, injW = 0, susp = 0, fatSum = 0, fatN = 0, wasInj = false, wasSusp = false, end = null, injTypes = [];
  while (iter++ < 330) {
    const r = await page.evaluate(FAT => { const C = window.__CPM_CAREER; let P = C.snapshot();
      const scr = C.screen(); if (scr === 'seasonEnd' || scr === 'seasonAwards' || scr === 'careerEnd') return { res: 'seasonEnd' };
      if (FAT === 'trascurata' && !P.injured) { C.patch({ fatigue: Math.max(P.fatigue || 0, 78) }); }
      const res = C.step(); return { res, w: P.week, fat: P.fatigue || 0 }; }, FAT);
    await sleep(r.res === 'lived' ? 200 : 120);
    const st = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); return { inj: !!P.injured, it: P.injuryType || P.injurySeverity || null, iw: P.injuryWeeks || 0, sus: !!P.isSuspended, fat: P.fatigue || 0 }; });
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    if (st.inj && !wasInj) { inj++; injTypes.push(st.it + ':' + st.iw); } wasInj = st.inj; if (st.inj) injW++;
    if (st.sus && !wasSusp) susp++; wasSusp = st.sus;
    fatSum += st.fat; fatN++;
    if (r.res === 'seasonEnd') break;
    if (String(r.res).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    if (String(r.res).startsWith('error')) { errors.push('step ' + r.res); break; }
  }
  end = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const id = p.club && (p.club.id || p.club.n);
    const st = (typeof ordinaClassifica259 === 'function' ? ordinaClassifica259(p.standings || [], (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf) : [...(p.standings || [])].sort((a, b) => b.pts - a.pts));
    const me = st.find(t => t.id === id) || {};
    const lg = (p.leagueOverrides || {})[id] || (p.club && p.club.lg);
    const base = (CLUBS.find(c => c.id === id) || {}).p;
    const H = (p.matchHistory || []).filter(h => (h.season || p.season) === p.season);
    const lega = H.filter(h => !h.cup && !h.euro && !h.national);
    const tm = (p.teammates || []).map(t => +t.ovr || +t.rating || 0).filter(Boolean);
    const strisce = (() => { let b = 0, c = 0; lega.forEach(h => { const l = !h.won && !h.drew; c = l ? c + 1 : 0; b = Math.max(b, c); }); return b; })();
    return { season: p.season, lg, pos: st.findIndex(t => t.id === id) + 1, n: st.length, pts: me.pts, w: me.wins, d: me.draws, l: me.losses, gf: me.gf, ga: me.ga,
      base, shift: (p.clubPrestigeShifts || {})[id] || 0, euro: p.euro ? { comp: p.euro.competition, phase: p.euro.phase, champ: !!p.euro.champion, active: !!p.euro.active } : null,
      cup: p.cup ? { champ: !!p.cup.champion, elim: !!p.cup.eliminated, round: p.cup.round || p.cup.currentRound || null } : null,
      trofei: (p.trophies || []).map(t => (t.type || t.name || t.comp || JSON.stringify(t).slice(0, 40)) + '@' + (t.season || '')),
      ovr: p.ovr, age: p.age, goals: p.goals, assists: p.assists, matches: p.matches,
      voto: H.length ? +(H.reduce((a, h) => a + (+h.rating || 0), 0) / H.length).toFixed(2) : null,
      sim: H.filter(h => h.simulated).length, vive: H.filter(h => !h.simulated).length, squal: H.filter(h => h.squalificato || h.suspended).length,
      tmOvr: tm.length ? +(tm.reduce((a, b) => a + b, 0) / tm.length).toFixed(1) : null, tmN: tm.length, strisciaP: strisce,
      risultati: lega.map(h => h.homeScore + '-' + h.awayScore) }; });
  stag.push({ ...end, inj, injW, susp, injTypes, fat: +(fatSum / Math.max(1, fatN)).toFixed(1), passi: iter });
  console.log(`[${TAG}] S${end.season} ${end.lg} ${end.pos}/${end.n} pts ${end.pts} prest ${end.base}+${end.shift} euro ${end.euro ? end.euro.comp + '/' + end.euro.phase : '-'} trofei ${end.trofei.length} ovr ${end.ovr} g${end.goals} a${end.assists} v${end.voto} inj ${inj}(${injW}w) susp ${susp} fat ${(fatSum / fatN).toFixed(0)} rosa ${end.tmOvr} striscia ${end.strisciaP} · ${Math.round((Date.now() - t0) / 1000)}s`);
  fs.mkdirSync('out/misura-310', { recursive: true });
  fs.writeFileSync(`out/misura-310/carriera-${TAG}.json`, JSON.stringify({ club, OVR, FAT, stag, errors }, null, 1));
  if (si < NS - 1) {
    await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(1200); await page.evaluate(() => window.__CPM_CAREER.dismiss());
    await page.evaluate(() => { const C = window.__CPM_CAREER, p = C.snapshot(); C.patch({ contract: { ...(p.contract || {}), duration: 5, expiresAtSeason: (p.season || 1) + 5 }, contractExpired: false, transferListed: false }); });
    const sc = await page.evaluate(() => window.__CPM_CAREER.snapshot()); if (sc.club && sc.club.id !== club.id) { console.log('CLUB CAMBIATO', sc.club.n); }
  }
}
console.log('FINE', TAG, 'errori', errors.length, errors.slice(0, 3));
await browser.close(); srv.close();
