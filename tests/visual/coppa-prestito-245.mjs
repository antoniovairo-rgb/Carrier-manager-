#!/usr/bin/env node
/* [giro 23, questionario PO 15/10 «Resta in coppa» — eccezione zona G per questo solo comportamento] GUARDIANO CARRIERA:
   un PRESTITO a meta' stagione non fa uscire l'eroe dalla Coppa Nazionale.
   Prima (src/18 acceptTransfer): se il calendario del club nuovo non aveva una settimana LIBERA dopo quella corrente, la coppa si
   chiudeva con «fuori dopo il trasferimento» (active:false, eliminated:true). Ora il turno va alla prima settimana utile anche
   con doppio impegno (campionato + coppa nella stessa settimana).
   Banco sul salvataggio S12: si porta l'eroe a una settimana di meta' stagione con la coppa viva (turno successivo a calendario),
   si OCCUPANO con amichevoli della Nazionale tutte le settimane libere del calendario del club nuovo (legaDopoTrasferimento212,
   la stessa funzione del trasferimento) cosi' che non resti una settimana libera, si apre l'offerta di PRESTITO vera e si preme
   «Accetta». Poi si avanza la carriera con gli handler veri (step, Nazionale simulata) fino a dopo la settimana del turno.
   VERDE: dopo la firma coppa attiva e non eliminata, un turno di coppa non giocato a calendario in una settimana di campionato,
   e avanzando il turno viene GIOCATO (voce marcata o risultato registrato). ROSSO (__CPM_NO_COPPA_PRESTITO): coppa chiusa.
   Uso: node coppa-prestito-245.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (s.r) window.__CPM_NO_COPPA_PRESTITO = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const prep = await page.evaluate(() => {
    const C = window.__CPM_CAREER, g = C.snapshot(); const lgMio = g.club && g.club.lg;
    const club = CLUBS.find(x => !x.isU18 && x.lg && x.lg !== lgMio && x.id !== g.club.id && CLUBS.filter(y => y.lg === x.lg && !y.isU18).length >= 10);
    const CRW = [0, 9, 19, 28, 35], CRN = ['', 'Ottavi di Finale', 'Quarti di Finale', 'Semifinale', 'FINALE'];
    const W = 24, R = 3;/* meta' stagione: semifinale in settimana 28 */
    const L = legaDopoTrasferimento212({ ...g, week: W }, club, g.leagueOverrides || {});
    const usate = new Set((L.newCalendar || []).filter(m => !m.played).map(m => m.week));
    const libere = []; for (let w = W + 1; w <= 37; w++) if (!usate.has(w)) libere.push(w);
    const cal = (g.calendar || []).filter(m => m.played || (!m.type && m.week <= W));
    cal.push({ matchday: 993, week: CRW[R], opponentId: 'x', opponentName: 'Avversario di coppa', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: R, cupRoundName: CRN[R] });
    libere.forEach(w => cal.push({ matchday: 800 + w, week: w, opponentId: 'nat', opponentName: 'Portogallo', isHome: true, played: false, result: null, type: 'national' }));
    C.patch({ week: W, weekLived: false, calendar: cal, playedMd: { s: g.season, md: ((g.playedMd && g.playedMd.md) || []).filter(x => x < 990 || x > 999) }/* il salvataggio S12 ha gia' giocato la SUA semifinale (giornata 993): senza pulire il registro la voce di coppa del banco risulterebbe gia' giocata */, euro: null, euroMondiale: null, nationsCupQueue: null, injury: null,
      cup: { active: true, round: R, nextWeek: CRW[R], eliminated: false, champion: false, results: [{ round: 1, won: true }, { round: 2, won: true }], club: g.club.id } });
    return { club: { id: club.id, n: club.n, lg: club.lg }, W, libere, giornateLega: usate.size };
  });
  await sleep(1200);
  await page.evaluate((c) => window.__CPM_CAREER.setOffer({ club: CLUBS.find(x => x.id === c.id), type: 'prestito', wage: 900, duration: 1, fee: 0 }), prep.club);
  await sleep(1500);
  await page.getByRole('button', { name: 'Accetta', exact: true }).first().click({ timeout: 10000 });
  await sleep(2500);
  const dopo = await page.evaluate((W) => { const p = window.__CPM_CAREER.snapshot(); const cu = (p.calendar || []).filter(m => m.type === 'cup' && !m.played);
    const lega = new Set((p.calendar || []).filter(m => !m.type && !m.played).map(m => m.week));
    return { club: p.club && p.club.n, loan: !!p.loan, cup: p.cup && { active: p.cup.active, eliminated: !!p.cup.eliminated, round: p.cup.round, nextWeek: p.cup.nextWeek },
      turno: cu.map(m => ({ week: m.week, doppio: lega.has(m.week) })), log: (p.log || []).filter(x => /Coppa Nazionale/.test(x)).slice(0, 2), week: p.week }; }, prep.W);
  const _e = { prep, dopo };
  if (!rosso && dopo.turno.length) {/* avanza con gli handler veri fino a dopo la settimana del turno */
    const tw = dopo.turno[0].week; const passi = [];
    for (let k = 0; k < 120; k++) { const st = await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const r = C.step(); const p = C.snapshot(); return { r, w: p.week }; });
      passi.push(st.r); await sleep(120); if (st.w > tw || /^error|^blocked|seasonEnd/.test(String(st.r))) break; }
    _e.avanzamento = await page.evaluate((tw) => { const p = window.__CPM_CAREER.snapshot(); const v = (p.calendar || []).filter(m => m.type === 'cup' && m.week === tw);
      return { settimana: p.week, voce: v.map(m => ({ played: !!m.played, result: m.result || null })), risultati: ((p.cup || {}).results || []).length, cup: p.cup && { active: p.cup.active, eliminated: !!p.cup.eliminated, champion: !!p.cup.champion, round: p.cup.round } }; }, tw);
    _e.passi = passi.slice(-6);
  }
  _e.errori = errs.slice(0, 3);
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e; await ctx.close();
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!V.dopo.loan) g.push('verde: il prestito non e\' stato firmato ' + JSON.stringify(V.dopo));
if (!V.prep.libere || V.prep.libere.length === 0) g.push('verde: banco senza settimane libere da occupare (il caso non e\' riprodotto) ' + JSON.stringify(V.prep));
if (!V.dopo.cup || !V.dopo.cup.active || V.dopo.cup.eliminated) g.push('verde: dopo il prestito l\'eroe e\' fuori dalla coppa ' + JSON.stringify(V.dopo));
if (!V.dopo.turno.length || !V.dopo.turno.some(t => t.doppio && t.week > V.prep.W)) g.push('verde: nessun turno di coppa con doppio impegno a calendario ' + JSON.stringify(V.dopo.turno));
const A = V.avanzamento; if (!A || !(A.voce.some(v => v.played && v.result) && A.risultati > 2)) g.push('verde: il turno di coppa non viene giocato avanzando ' + JSON.stringify({ A, passi: V.passi }));
if (V.errori.length) g.push('verde: errori di pagina ' + V.errori.join(' | '));
if (!R.dopo.loan || !(R.dopo.cup && R.dopo.cup.eliminated)) g.push('rosso: il difetto non si vede ' + JSON.stringify(R.dopo));
if (g.length) { console.log('❌ coppa-prestito-245'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ coppa-prestito-245 verde (resta in coppa col doppio impegno, il turno si gioca) e il rosso si vede');
