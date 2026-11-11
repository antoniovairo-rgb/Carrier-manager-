#!/usr/bin/env node
/* [giro 159] GUARDIANO DEI SEGUITI DEL 155 (decisioni PO 11/11): PO-358 Legacy 14/trofeo, PO-359 derby inventato, B4 scadenza dei
   contratti, D9 rinnovo sulla media di due stagioni, B11 presenze in Primavera a parte nella lettera d'addio.
   Ogni voce ha una prova sul gioco vero (funzioni del gioco chiamate nella pagina; per B4 anche il flusso vero: offerta posata con
   setOffer, accettata con acceptOffer, due cambi di stagione con startNewSeason) e la stessa prova con l'interruttore rosso.
   Tre bracci:
     A · verde (nessun interruttore)
     B · rosso per voce: window.__CPM_NO_G159_<voce> acceso solo per la prova di quella voce
     C · rosso unico: window.__CPM_NO_G159 dal caricamento, tutte le prove devono cadere
   «Non giudicato» conta come ROSSO in A e come NON caduto in B/C. Soglie fisse, non si abbassano.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node seguiti-159-test.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const HTML = fs.readFileSync(ROOT + 'CARRIER-MANAGER-AV.html', 'utf8');

/* 0 · le funzioni provate devono essere USATE dove il difetto viveva */
const statico = {
  L358: HTML.includes('Math.min(trophies*LEGACY_PER_TROFEO159,LEGACY_TETTI358.trofei)'),
  T359: HTML.includes('"mun-liv":{name:"Derby della Brughiera Rossa"'),
  B4tr: HTML.includes('...contrattoFirma159(p.season||1,_newDur98,(p.week||1)>5)'),
  B4pro: HTML.includes('contract:{...contrattoFirma159(newSeason,offer.duration||1,false)'),
  D9: HTML.includes('const growthMult=_gR159>12?1.18:_gR159>6?1.08:0.97;') && HTML.includes('const _gR159=golRinnovo159(player);'),
  B11: HTML.includes('{presenzeLettera159(p).testo}'),
};
const staticoOk = Object.values(statico).every(Boolean);

const LOGICA = {
  L358: () => { const t = n => calcLegacyScore({ trophies: new Array(n).fill({}), season: 1, history: [], ovr: 60 });
    const v = { t1: t(1), t2: t(2), t5: t(5), t10: t(10), t12: t(12) };
    return { ok: v.t1 === 14 && v.t2 === 28 && v.t5 === 70 && v.t10 === 140 && v.t12 === 140, dato: v }; },
  T359: () => { const d = isDerby('mun', 'liv'), e = isDerby('liv', 'mun'); const n = d && d.name;
    return { ok: !!n && n === (e && e.name) && !/Mersey|Manchester|Ovest Lontano/i.test(n), dato: n }; },
  B4: () => { const pro = contrattoFirma159(3, 1, false), pro2 = contrattoFirma159(3, 3, false), gen = contrattoFirma159(3, 1, true), gen2 = contrattoFirma159(3, 2, true);
    /* invariante: scadenza = stagione + duration - 1 (duration scala di uno a ogni cambio stagione, a zero e' scaduto) */
    const inv = [pro, pro2, gen, gen2].every(c => c.expiresAtSeason === 3 + c.duration - 1);
    return { ok: inv && pro.expiresAtSeason === 3 && pro2.expiresAtSeason === 5 && gen.expiresAtSeason === 4 && gen2.expiresAtSeason === 5, dato: { pro, pro2, gen, gen2 } }; },
  D9: () => { const p = { season: 4, goals: 0, history: [{ season: 3, goals: 20 }, { season: 2, goals: 2 }] };
    const g = golRinnovo159(p), g2 = golRinnovo159({ ...p, goals: 10 }), g0 = golRinnovo159({ season: 1, goals: 5, history: [] });
    return { ok: g === 10 && g2 === 15 && g0 === 5, dato: { inizioStagione: g, conDieciGol: g2, senzaStagionePrima: g0 } }; },
  B11: () => { const p = { totalMatches: 701, proStatus: 'pro', season: 20, history: [{ season: 1, club: 'FC Prova Primavera', matches: 30 }, { season: 2, club: 'FC Prova Primavera', matches: 31 }, { season: 3, club: 'FC Prova', matches: 40 }] };
    const l = presenzeLettera159(p);
    return { ok: l.pro === 640 && l.primavera === 61 && /^640 presenze \(Primavera: 61 presenze\)$/.test(l.testo), dato: l }; },
};
const ORD = Object.keys(LOGICA);

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const save = () => ({ phase: 'career', player: { name: 'Collaudo Seguiti', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 20, age: 22, ovr: 72,
  tutorialDone: true, club: CLUB, coachTrust: 85, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 4 }, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } });

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];
const apri = async (rossoUnico) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G159 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save(), r: rossoUnico });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  return { ctx, page };
};
const contratto = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
  return { season: p.season, week: p.week, club: p.club && p.club.id, duration: p.contract && p.contract.duration, exp: p.contract && p.contract.expiresAtSeason, svincolato: !!p.contractExpired }; });

/* B4 · flusso vero: trasferimento di gennaio (W20) per «1 stagione», poi due cambi di stagione */
const provaB4flusso = async (page, rosso) => {
  if (rosso) await page.evaluate(() => { window.__CPM_NO_G159_B4 = 1; });
  try {
    const posata = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); let o = null; for (let i = 0; i < 40 && !o; i++) o = generateTransferOffer(p);
      if (!o || o.isRenewal) return 'nessuna offerta'; return window.__CPM_CAREER.setOffer({ ...o, type: 'trasferimento definitivo', duration: 1, buyClause: undefined, minMatches: undefined }); });/* con OVR 72 il generatore propone solo prestiti: il rientro dal prestito al cambio stagione nasconderebbe il contratto firmato */
    await sleep(600);
    const acc = await page.evaluate(() => window.__CPM_CAREER.acceptOffer()); await sleep(900);
    const firma = await contratto(page);
    const n1 = await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return window.__CPM_CAREER.startNewSeason(); }); await sleep(1600);
    const s3 = await contratto(page);
    const n2 = await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return window.__CPM_CAREER.startNewSeason(); }); await sleep(1600);
    const s4 = await contratto(page);
    const dato = { posata, acc, firma, s3, s4 };
    if (posata !== true || acc !== true || n1 !== true || n2 !== true || firma.club === 'b04' || s3.season !== 3 || s4.season !== 4) return { ok: null, dato };
    /* verde: firmato a meta' della S2, vale fino a fine S3 (PO), quindi in S3 e' vivo e dice «scade a fine 3», in S4 e' scaduto */
    return { ok: firma.exp === 3 && !s3.svincolato && s3.exp === 3 && s3.duration === 1 && s4.svincolato === true, dato };
  } finally { await page.evaluate(() => { delete window.__CPM_NO_G159_B4; }); }
};

const braccio = async (nome, rossoUnico, rossoPerVoce) => { const R = {};
  const { ctx, page } = await apri(rossoUnico);
  for (const k of ORD) R[k] = await page.evaluate(([k, src, rosso]) => { try { if (rosso) window['__CPM_NO_G159_' + k] = true; const f = eval('(' + src + ')'); return f(); } catch (e) { return { ok: null, dato: 'non giudicato: ' + e.message }; } finally { delete window['__CPM_NO_G159_' + k]; } }, [k, LOGICA[k].toString(), rossoPerVoce]);
  R.B4flusso = await provaB4flusso(page, rossoPerVoce);
  await ctx.close();
  console.log(`\n── braccio ${nome}`); for (const [k, v] of Object.entries(R)) console.log(`  ${k.padEnd(8)} ${v.ok === true ? 'VERDE' : v.ok === false ? 'ROSSO' : 'NON GIUDICATO'}  ${JSON.stringify(v.dato).slice(0, 300)}`);
  return R; };

const A = await braccio('A · verde', false, false);
const B = await braccio('B · rosso per voce (__CPM_NO_G159_<voce>)', false, true);
const C = await braccio('C · rosso unico (__CPM_NO_G159)', true, false);
await b.close(); srv.close();

const CODICI = [...ORD, 'B4flusso'];
const guasti = [];
if (!staticoOk) guasti.push('uso nel codice mancante: ' + JSON.stringify(statico));
for (const k of CODICI) {
  if (!A[k] || A[k].ok !== true) guasti.push(`${k}: verde non verde (${A[k] ? (A[k].ok === null ? 'non giudicato' : 'rosso') : 'assente'})`);
  if (!B[k] || B[k].ok !== false) guasti.push(`${k}: il rosso per voce non cade (${B[k] ? (B[k].ok === null ? 'non giudicato' : 'verde') : 'assente'})`);
  if (!C[k] || C[k].ok !== false) guasti.push(`${k}: il rosso unico non cade (${C[k] ? (C[k].ok === null ? 'non giudicato' : 'verde') : 'assente'})`);
}
if (errs.length) guasti.push('errori di pagina: ' + errs.slice(0, 3).join(' | '));
fs.mkdirSync(ROOT + 'tests/visual/out', { recursive: true });
fs.writeFileSync(ROOT + 'tests/visual/out/seguiti-159.json', JSON.stringify({ statico, A, B, C, guasti }, null, 1));
const riga = (R) => CODICI.map(k => `${k}:${R[k] ? (R[k].ok === true ? 'V' : R[k].ok === false ? 'R' : '?') : '-'}`).join(' ');
console.log('\n════ seguiti-159 ════');
console.log('uso nel codice:', staticoOk ? 'ok' : 'MANCANTE');
console.log('VERDE (A)       ', riga(A));
console.log('ROSSO per voce  ', riga(B));
console.log('ROSSO unico     ', riga(C));
if (guasti.length) { console.log('\n❌ SEGUITI-159 ROSSO —\n  ' + guasti.join('\n  ')); process.exit(1); }
console.log(`\n✅ SEGUITI-159 VERDE — ${CODICI.length} prove: verdi accese, ciascuna cade col suo interruttore e con __CPM_NO_G159`);
