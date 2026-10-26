#!/usr/bin/env node
/* [giro 94] GUARDIANO DEL COLLAUDO CARRIERA 177 n.3 (docs/collaudi/RAPPORTO-carriera-177-3.md, ramo collaudo/7.999.177-carriera-3).
   Una prova per difetto, sul gioco caricato (handler veri via __CPM_CAREER, funzioni pure dallo scope globale):
     D1 Nazionale: Italia OVR 88 titolare, il club in Coppa nelle soste (9/19/28/35) → il CT convoca lo stesso (amichevole in
        una settimana libera vicina) oppure lo dice; mai una sosta valutata «passa» senza amichevole ne' messaggio.
     D2 … D9: vedi le funzioni sotto.
   Uso: node carriera3-94.mjs            → verde atteso (uscita 0)
        CPM_ROSSO=D1 node carriera3-94.mjs → accende __CPM_NO_C3D1 (rosso atteso: uscita 1). Idem D2..D9.
        CPM_SOLO=D1,D5 per far girare solo alcune prove. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = (process.env.CPM_ROSSO || '').toUpperCase();
const SOLO = (process.env.CPM_SOLO || '').toUpperCase().split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const vuole = (d) => !SOLO.length || SOLO.includes(d) || (d === 'PURE' && SOLO.some(x => ['D5', 'D6', 'D7', 'D8'].includes(x)));

async function apri(player, extra) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(c => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; window.__CPM_CALLUP = [];
    if (c.rosso) window['__CPM_NO_C3' + c.rosso] = true;
    Object.assign(window, c.extra || {});
    if (c.player) localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: c.player }));
  }, { rosso: ROSSO, player, extra });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  if (player) {
    await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
  } else await sleep(1200);
  page._errors = errors; return page;
}
/* stesso assestamento di nazionale-155 (giro 77): il passo successivo parte solo a registro ri-registrato e fermo */
async function assesta(page) {
  await page.waitForFunction(() => window.__CPM_CAREER !== window.__CPM_C94, null, { timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => { const C = window.__CPM_CAREER; const f = window.__CPM_C94b === C; window.__CPM_C94b = C; return f; }); if (f) break; await sleep(250); }
}
async function passi(page, fino, stag) {
  let last = null;
  for (let i = 0; i < 200; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; window.__CPM_C94 = C; const res = C.step(); C.dismiss(); const s = C.snapshot(); return { res: String(res), season: s && s.season, week: s && s.week }; });
    last = r; if (r.res === 'seasonEnd' || r.season !== stag || r.week > fino || r.res.startsWith('error:')) break;
    if (r.res.startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.dismiss());
    await assesta(page);
  }
  return last;
}
const STATS = { 'velocità': 88, tecnica: 88, fisico: 86, 'mentalità': 87, tiro: 89, passaggio: 86, dribbling: 88, posizionamento: 87 };
const base = (S, o) => ({ name: 'Probe Carriera', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: S, week: 2, age: 26, ovr: 88, tutorialDone: true, nationalCaps: 12,
  campDone: true, presidentModalSeason: S, jerseyNumSeason: S, drawSeen: S, mercatoSeen: S, presentSeason: S, weekLived: false, seasonPledge: { season: S, tone: 'equilibrato' },
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 82, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: STATS, form: 82, morale: 80, fatigue: 10, coachTrust: 85, popularity: 75, goals: 0, assists: 0, matches: 0,
  contract: { duration: 3, wage: 60000, expiresAtSeason: S + 3 }, contractExpired: false, ...(o || {}) });

/* ── D1 ── */
async function d1() {
  const page = await apri(base(5, { week: 7 }));
  /* la Coppa del club nella sosta, come nel collaudo (CUP_ROUND_WEEKS = 9/19/28/35): stato di coppa attivo e ottavo vero alla 9 */
  await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot();
    const opp = (p.standings || []).find(r => r && (r.id || r.n) && r.id !== p.club.id) || {};
    const cal = (p.calendar || []).filter(m => m.type !== 'cup');
    cal.push({ matchday: 990, week: 9, opponentId: opp.id, opponentName: opp.n || opp.name, isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale' });
    C.patch({ calendar: cal, cup: { active: true, round: 1, nextWeek: 9, eliminated: false, champion: false, results: [], bracket: [], cupSurvivors: [], cupBracketMatches: {}, season: p.season } }); });
  await assesta(page);
  const last = await passi(page, 21, 5);
  const R = await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; const cu = window.__CPM_CALLUP || [];
    return { fin: cu.filter(x => x.s === 5 && x.fin).map(x => ({ w: x.w, passa: !!x.passa })), nat: (p.calendar || []).filter(m => m.type === 'national').map(m => m.week),
      caps: (p.nationalCaps || 0) - 12, log: (p.log || []).filter(t => /CT/.test(t)) }; });
  console.log('D1 ' + JSON.stringify({ last, ...R }));
  const passate = R.fin.filter(x => x.passa).map(x => x.w);
  const senzaEsito = passate.filter(w => !R.nat.some(n => n >= w) && !R.log.some(t => t.includes('settimana ' + w + ':')));
  ok(R.fin.length >= 2, `D1: il CT valuta almeno 2 soste (9 e 19) fino alla settimana 21 (${R.fin.length})`);
  ok(senzaEsito.length === 0, `D1: ogni sosta «passa» ha la sua amichevole o un messaggio (senza esito: ${senzaEsito.join(',') || 'nessuna'})`);
  ok(R.fin.some(x => x.w === 9 && x.passa) && R.nat.length >= 1, `D1: con la Coppa nella sosta 9 il CT convoca lo stesso (amichevoli alle settimane ${R.nat.join(',') || 'nessuna'}, presenze ${R.caps})`);
  ok(page._errors.length === 0, `D1: nessun errore di pagina (${page._errors.join(' | ')})`);
  await page.close();
}

/* ── D4 ── banco del motore in node (24 configurazioni S12 x 2 semi): il possesso del tabellino e' la quota dei passaggi */
async function d4() {
  const fs = await import('node:fs'); const path = await import('node:path');
  const s14 = fs.readFileSync(new URL('../../src/14-motore-possesso.jsx', import.meta.url), 'utf8');
  const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
  const W = ROSSO === 'D4' ? { __CPM_NO_C3D4: 1 } : {};
  const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W);
  const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
  let n = 0, oltre = 0, max = 0;
  for (let s = 0; s < CFG.length * 2; s++) { const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    for (let m = 1; m <= 93; m++) { if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' }); for (let b = 0; b < 22; b++) M.tick({ min: Math.min(m, 90), dt: 1 / 22, dec: true }); }
    const t = M.tabellino(); const q = Math.round(100 * t.home.passaggi / Math.max(1, t.home.passaggi + t.away.passaggi)); const gap = Math.abs(t.home.possesso - q);
    n++; if (gap > 5) oltre++; max = Math.max(max, gap); }
  console.log(`D4 ${n} partite: scarto possesso/quota passaggi max ${max}, oltre 5 punti ${oltre}`);
  ok(n >= 40 && oltre === 0, `D4: possesso del tabellino coerente coi passaggi (scarto max ${max}, partite oltre 5 punti ${oltre}/${n})`);
}

/* ── D5 D6 D7 D8: funzioni pure del gioco caricato ── */
async function pure() {
  const page = await apri(null);
  const R = await page.evaluate(() => {
    const out = {};
    /* D5: il testo del livello usa la stessa quota del motore; a valore 80 la quota piena e quella vera divergono */
    const p = { name: 'X', season: 3, week: 1, stats: { tiro: 80 }, perkTrainer: true, perkTrainerLv: 1, perkTrainerFocus: 'tiro' };
    out.d5 = [1, 2, 3].map(lv => { const q = trainerQuota281({ ...p, perkTrainerLv: lv }, 80); const t = trainerFx281(p, lv) || ''; return { lv, atteso: Math.round(1 / q), testo: t, ok: new RegExp('ogni ' + Math.round(1 / q) + ' settimane').test(t) }; });
    /* D6: la stampa delle nazionali */
    const bad = /(^|[^A-Za-zÀ-ÿ'])(Il|il|del|al|dal|nel|sul)\s+(Italia|Argentina|Olanda|Inghilterra|Spagna|Francia|Germania)\b|(^|[^A-Za-zÀ-ÿ'])(a|da|di)\s+(Italia|Argentina|Olanda|Inghilterra)\b/;
    const testi = []; const esiti = [[1, 2], [2, 1], [1, 1], [0, 3], [3, 0], [2, 2]];
    for (const [h, a] of esiti) for (const opp of ['Argentina', 'Olanda', 'Spagna', 'Inghilterra']) for (const g of [0, 1, 2]) {
      const r = generateLocalPressAnalysis({ homeScore: h, awayScore: a, won: h > a, drew: h === a, opponent: opp, isHome: true }, { name: 'Marco Valdes', club: 'Italia', goals: g, assists: 0, rating: 5.5 + g, oppPrestige: 85, homeRoster: [] }, { season: 8, week: 21, nat: true });
      (function w(o) { if (typeof o === 'string') testi.push(o); else if (Array.isArray(o)) o.forEach(w); else if (o && typeof o === 'object') Object.values(o).forEach(w); })(r); }
    out.d6 = { n: testi.length, cattivi: testi.filter(t => bad.test(t)).slice(0, 4), nCattivi: testi.filter(t => bad.test(t)).length };
    /* D7 */
    const pl = { nation: 'Italia', club: { id: 'r', n: 'FC Rendalto', a: 'RDL', c: '#123', c2: '#fff' } };
    const ci = clubIntervista94(pl, 'euroMondiale_group'), cc = clubIntervista94(pl, 'career');
    out.d7 = { naz: ci && (ci.n + '/' + ci.a), club: cc && cc.n };
    /* D8 */
    out.d8 = [_etichettaTurno957({ type: 'euro_group', matchday: 900 }), _etichettaTurno957({ type: 'euro_group', matchday: 904 }), _etichettaTurno957({ matchday: 12 })];
    return out; });
  console.log('D5 ' + JSON.stringify(R.d5)); console.log('D6 ' + JSON.stringify(R.d6)); console.log('D7 ' + JSON.stringify(R.d7)); console.log('D8 ' + JSON.stringify(R.d8));
  ok(R.d5.every(x => x.ok), `D5: il testo del trainer dice le settimane della quota del motore (${R.d5.map(x => x.atteso).join('/')})`);
  ok(R.d6.n > 50 && R.d6.nCattivi === 0, `D6: articoli delle nazionali (${R.d6.nCattivi} frasi sbagliate su ${R.d6.n}${R.d6.cattivi.length ? ': ' + R.d6.cattivi.join(' | ') : ''})`);
  ok(R.d7.naz === 'Italia/ITA' && R.d7.club === 'FC Rendalto', `D7: sala stampa della Nazionale con la Nazionale (${R.d7.naz}), del club col club (${R.d7.club})`);
  ok(!R.d8.slice(0, 2).some(t => /9\d\d/.test(t)) && /12ª giornata/.test(R.d8[2]), `D8: nessun codice interno come giornata (${R.d8.join(' | ')})`);
  ok(page._errors.length === 0, `pure: nessun errore di pagina`);
  await page.close();
}

/* ── D5 schermata: a livello 0 il piano non mostra la resa del livello 1 ── */
async function d5ui() {
  const page = await apri(base(3, { week: 3, stats: { ...STATS, tiro: 80 }, perkTrainer: false, perkTrainerLv: 1, perkTrainerFocus: 'tiro', bankBalance: 5000000 }));
  await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(900);
  await page.waitForSelector('[data-cpm="trainer281-piano"]', { timeout: 15000 }).catch(() => {});
  const t = await page.evaluate(() => { const e = document.querySelector('[data-cpm="trainer288-resa-tiro"]'); return e ? e.textContent.trim() : null; });
  console.log('D5 schermata livello 0: ' + t);
  ok(t != null && /non attivo/i.test(t), `D5: a livello 0 la resa del piano dice «non attivo» (${t})`);
  await page.close();
}

/* ── D3/D10: contratto in scadenza e stagione da svincolato ── */
async function d3() {
  const page = await apri(base(5, { week: 30, contract: { duration: 1, wage: 60000, expiresAtSeason: 5 }, renewalSeason: 0 }));
  await sleep(1500);
  const A = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { log: (p.log || []).find(t => /scade a fine stagione/.test(t)) || null, card: !!document.querySelector('[data-cpm="rinnovo94"]') }; });
  console.log('D3 avviso: ' + JSON.stringify(A));
  ok(!!A.log && A.card, `D3: prima della fine c'e' l'avviso di scadenza con il rinnovo (registro ${!!A.log}, riquadro ${A.card})`);
  await page.evaluate(() => window.__CPM_CAREER.patch({ week: 39, calendar: [] })); await assesta(page);
  for (let i = 0; i < 4; i++) { const r = await page.evaluate(() => { const C = window.__CPM_CAREER; window.__CPM_C94 = C; const x = C.step(); C.dismiss(); return String(x); }); if (r === 'seasonEnd') break; await assesta(page); }
  await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await assesta(page); await sleep(1500);
  const B = await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); return { s: p.season, sv: !!p.contractExpired, ap: C.openingPending(), log: (p.log || []).find(t => /svincolato/.test(t)) || null }; });
  await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
  B.rinnovo = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Negozia rinnovo/.test(b.textContent)));
  console.log('D3 stagione nuova: ' + JSON.stringify(B));
  ok(B.s === 6 && B.sv, `D3: la stagione nuova parte da svincolato (S${B.s}, svincolato ${B.sv})`);
  ok(Array.isArray(B.ap) && B.ap.filter(x => x !== 'addio').length === 0, `D10: niente ritiro/presentazione/conferenza del club da svincolato (${JSON.stringify(B.ap)})`);
  ok(!!B.log, `D3: il gioco dice che sei svincolato (${B.log})`);
  ok(B.rinnovo, `D3: nell'Agente c'e' il pulsante «Negozia rinnovo» anche a contratto scaduto`);
  ok(page._errors.length === 0, `D3: nessun errore di pagina (${page._errors.join(' | ')})`);
  await page.close();
}

/* ── D9: la promessa dell'offerta firmata ── */
async function d9() {
  const page = await apri(base(12, { week: 5, ovr: 88 }));
  await page.evaluate(() => { const C = window.__CPM_CAREER; const o = generateTransferOffer(C.snapshot()); o.minutaggio = 76; o.type = 'trasferimento'; C.setOffer(o); });
  await assesta(page);
  await page.evaluate(() => window.__CPM_CAREER.acceptOffer()); await assesta(page); await sleep(800);
  const R = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { club: p.club && p.club.n, ruolo: p.squadRole, calc: calcSquadRole(p), fid: p.coachTrust, dec: (() => { let t = 0; for (let w = 6; w <= 13; w++) { const d = calcCoachDecision({ ...p, week: w, squadRole: calcSquadRole(p) }, 5); if (d.status === 'starter') t++; } return t; })() }; });
  console.log('D9 ' + JSON.stringify(R));
  ok(R.ruolo === 'titolare' && R.calc === 'titolare', `D9: firmato «Titolare 76%», il ruolo resta titolare (ruolo ${R.ruolo}, ricalcolato ${R.calc})`);
  ok(R.dec >= 5, `D9: il mister lo schiera titolare in almeno 5 gare su 8 (${R.dec})`);
  await page.close();
}

const PROVE = { D1: d1, D3: d3, D4: d4, D5: d5ui, PURE: pure, D9: d9 };
for (const [k, f] of Object.entries(PROVE)) if (vuole(k)) { try { await f(); } catch (e) { ok(false, `${k}: eccezione ${String(e && e.message).slice(0, 200)}`); } }
await browser.close(); srv.close();
console.log(err.length ? `\nFALLITO${ROSSO ? ' (rosso ' + ROSSO + ': atteso)' : ''}: ${err.length}` : '\nVERDE');
process.exit(err.length ? 1 : 0);
