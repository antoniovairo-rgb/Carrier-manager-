#!/usr/bin/env node
/* [giro 448, PO-652 — dubbio 4 del giro 351] GUARDIANO E SONDA: LE OFFERTE DI MERCATO SU CARRIERE SIMULATE.
   Il giro 351 ha messo le regole delle offerte (src/06 generateTransferOffer) e le ha misurate su una popolazione SINTETICA
   (offerte-351: ogni club x 4 ruoli). Qui si misura quanto spesso capita ogni tipo di offerta in carriere giocate dagli handler
   VERI (__CPM_CAREER.step, come career-sim) e si rigiudicano su quelle offerte le classi del 351.
   Sorgente: il registro inerte `cpmEv("offerta")` (giro 448) scritto da generateTransferOffer, letto dopo ogni settimana
   (`n448` toglie i doppioni: il registro e' un anello da 400 voci).
   Popolazione: CPM_CARRIERE (default 10) carriere da professionista, club scelti su tutta la scala di prestigio, ruolo/OVR vari,
   meta' in lista trasferimenti (piu' offerte), CPM_STAGIONI (default 3) stagioni ciascuna.
   Classi (professionista sotto contratto, regole 351 attive):
     A · ASSURDA: rotazione/titolare/leader, club <= oggi-5 che offre un PRESTITO o un ruolo PEGGIORE.
     B · SENZA GUADAGNO: niente prestigio +3, ruolo migliore, stipendio +10%, durata piu' lunga di un definitivo.
     C · EFFETTI INCOERENTI: morale >= 10 senza guadagno vero (prestigio +5, ruolo migliore, stipendio +15%), oppure crescita >= 10
         da un club piu' debole senza piu' minuti.
     E · REGISTRO INCOMPLETO: una riga senza i campi che servono al giudizio.
   VERDE: A=B=C=E=0, copertura >= 40 offerte giudicabili, >= 3 tipi, >= 6 carriere con almeno un'offerta, 0 pageerror.
   ROSSO (CPM_ROSSO=1 → window.__CPM_NO_G351, le regole di prima sulle stesse carriere): A>0 o B>0, altrimenti il braccio rosso
   e' CIECO = rosso. Il braccio rosso gira su CPM_CARRIERE_ROSSO (default 4) carriere.
   CIECO (window.__CPM_NO_G448 = registro spento, 1 carriera x 1 stagione): il guardiano deve vedere 0 offerte e dichiararsi NON
   GIUDICATO; se ne vede anche una, il registro non e' quello che il gioco scrive = rosso. Nessuna regola del 351 e' risultata violata,
   quindi non c'e' correzione alla fonte (vedi docs/sviluppo/RAPPORTO-giro448.md).
   Copertura insufficiente = NON GIUDICATO = rosso. Uscita 0 solo se entrambi i bracci danno il verdetto atteso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const N = +(process.env.CPM_CARRIERE || 10), NR = +(process.env.CPM_CARRIERE_ROSSO || 4), STAG = +(process.env.CPM_STAGIONI || 3);
const SOLO = process.env.CPM_BRACCIO || 'entrambi';/* verde | rosso | entrambi */
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const b = await launchBrowser();

/* club della popolazione: dalla tabella vera, su tutta la scala di prestigio */
let CL;
{ const pg = await b.newPage(); await installCdnRoutes(pg);
  await pg.goto(url, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => typeof CLUBS !== 'undefined', null, { timeout: 90000 });
  CL = await pg.evaluate(() => CLUBS.filter(c => c && c.p != null && !c.isU18 && c.lg).map(c => ({ id: c.id, n: c.n, a: c.a, p: c.p, c: c.c, c2: c.c2, nat: c.nat, lg: c.lg })).sort((x, y) => x.p - y.p));
  await pg.close(); }
const RUOLI = ['riserva', 'rotazione', 'titolare', 'leader', 'rotazione'], OFF = { riserva: -4, rotazione: -1, titolare: 2, leader: 5 };
function carriera(i, tot) {
  const c = CL[Math.min(CL.length - 1, Math.floor((i + 0.5) / tot * CL.length))];
  const role = RUOLI[i % RUOLI.length], ovr = Math.max(58, Math.min(90, c.p + OFF[role] + (i % 3) - 1));
  const st = Object.fromEntries(['velocità', 'tecnica', 'fisico', 'mentalità', 'tiro', 'passaggio', 'dribbling', 'posizionamento'].map((k, j) => [k, ovr + ((j * 7 + i) % 5) - 2]));
  return { phase: 'career', player: { name: 'Sim Offerte ' + i, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2 + (i % 3), week: 1, age: 20 + (i % 6), ovr,
    tutorialDone: true, club: c, squadRole: role, transferListed: i % 2 === 1, hasAgent: i % 3 === 0, stats: st, form: 70, morale: 72, fatigue: 10,
    totalMatches: 40 + i * 10, contract: { duration: 1 + (i % 4), wage: 0, expiresAtSeason: 2 + (i % 3) + 1 + (i % 4) } } };
}

async function giocaCarriera(save, rosso) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } }); await installCdnRoutes(page);
  const pe = []; page.on('pageerror', e => pe.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; if (r === 'cieco') window.__CPM_NO_G448 = 1; else if (r) window.__CPM_NO_G351 = 1; if (window.localStorage && !sessionStorage.getItem('sv448')) { localStorage.setItem('cpm-v3', JSON.stringify(s)); sessionStorage.setItem('sv448', '1'); } }, [save, rosso]);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  /* stipendio di oggi = quello del gioco per OVR+prestigio (come offerte-351) */
  await page.evaluate(() => { const g = window.__CPM_CAREER.get(); void g; });
  await page.evaluate(s => { const p = s.player; window.__CPM_CAREER.patch({ contract: { ...p.contract, wage: _ovrToWageWeekly133(p.ovr, p.club.p) } }); }, save);
  await sleep(600);
  const offerte = new Map(); let fatte = 0, iter = 0, err = null;
  const leggi = async () => { const ev = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'offerta')); for (const e of ev) offerte.set(e.n448, e); };
  while (iter++ < 110 * STAG && fatte < STAG) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return null; const res = C.step(); return res; });
    await leggi(); if (process.env.CPM_DEBUG) console.log('   step', iter, r, JSON.stringify(await page.evaluate(() => { const g = window.__CPM_CAREER.get(); return [g.season, g.week]; })));
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    if (r === null) { err = 'harness sparito'; break; }
    if (r === 'seasonEnd') { const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); if (ok !== true) { err = 'startNewSeason ' + ok; break; } fatte++; await sleep(700); await page.evaluate(() => window.__CPM_CAREER.dismiss()); continue; }
    if (r && String(r).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (r && String(r).startsWith('error:')) { err = r; break; }
    await sleep(120);
  }
  await leggi();
  await page.close();
  return { offerte: [...offerte.values()], stagioni: fatte, pe, err };
}

const RV = { primavera: 0, riserva: 1, rotazione: 2, titolare: 3, leader: 3 }, rOf = m => m >= 70 ? 3 : m >= 45 ? 2 : 1;
function giudica(tutte) {
  const o = { tot: tutte.length, giud: 0, A: 0, B: 0, C: 0, E: 0, es: { A: [], B: [], C: [], E: [] }, tipi: {}, verso: { su: 0, pari: 0, giu: 0 }, perRuolo: {}, club: {}, stipX: [], mor: [], cre: [], perFin: {} };
  const add = (k, s) => { o[k]++; if (o.es[k].length < 4) o.es[k].push(s); };
  for (const e of tutte) {
    o.tipi[e.tipo] = (o.tipi[e.tipo] || 0) + 1;
    o.club[e.aN] = (o.club[e.aN] || 0) + 1;
    const fin = e.w <= 5 ? 'estate' : e.w >= 19 && e.w <= 23 ? 'inverno' : 'fuori';
    o.perFin[fin] = (o.perFin[fin] || 0) + 1;
    if (e.daP == null || e.aP == null || !e.tipo || e.min == null || e.stip == null || e.stipOggi == null) { add('E', JSON.stringify(e).slice(0, 160)); continue; }
    if (e.pro !== 'pro' || e.svinc || !e.g351 && !process.env.__ROSSO) continue;
    o.giud++;
    const dp = e.aP - e.daP, rNow = RV[e.ruolo] != null ? RV[e.ruolo] : 2, rNew = rOf(+e.min), loan = String(e.tipo).includes('prest'), wr = e.stip / Math.max(1, e.stipOggi);
    o.verso[dp >= 5 ? 'su' : dp <= -5 ? 'giu' : 'pari']++;
    o.perRuolo[e.ruolo] = (o.perRuolo[e.ruolo] || 0) + 1;
    o.stipX.push(wr); o.mor.push(e.mor); o.cre.push(e.cre);
    const s = `S${e.s}W${e.w} ${e.ruolo} ${e.da}(${e.daP}) ovr${e.ovr} <- ${e.aN}(${e.aP}) ${e.tipo} min${e.min} dur${e.dur}/${e.durOggi} stip x${wr.toFixed(2)} mor+${e.mor} cre+${e.cre}`;
    if (rNow >= 2 && dp <= -5 && (loan || rNew < rNow)) add('A', s);
    if (!(dp >= 3 || rNew > rNow || wr >= 1.10 || (!loan && e.dur > (e.durOggi || 0)))) add('B', s);
    const vero = dp >= 5 || rNew > rNow || wr >= 1.15;
    if ((e.mor >= 10 && !vero) || (e.cre >= 10 && dp < 0 && rNew <= rNow)) add('C', s);
  }
  return o;
}
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

async function braccio(rosso, n) {
  if (rosso) process.env.__ROSSO = '1'; else delete process.env.__ROSSO;
  const tutte = [], perCarr = [], pe = [], err = [];
  for (let i = 0; i < n; i++) {
    const sv = carriera(i, n); const t0 = Date.now();
    const r = await giocaCarriera(sv, rosso);
    r.offerte.forEach(e => { e.carr = i; tutte.push(e); });
    perCarr.push({ i, club: sv.player.club.n, p: sv.player.club.p, ruolo: sv.player.squadRole, ovr: sv.player.ovr, lista: sv.player.transferListed, stagioni: r.stagioni, offerte: r.offerte.length, s: Math.round((Date.now() - t0) / 1000) });
    pe.push(...r.pe); if (r.err) err.push(`carriera ${i}: ${r.err}`);
    if (r.stagioni < STAG) err.push(`carriera ${i}: ${r.stagioni}/${STAG} stagioni`);
    console.log(`  [${rosso ? 'rosso' : 'verde'}] carriera ${i} ${sv.player.club.n}(${sv.player.club.p}) ${sv.player.squadRole} ovr${sv.player.ovr}${sv.player.transferListed ? ' in lista' : ''}: ${r.stagioni} stagioni, ${r.offerte.length} offerte (${perCarr.at(-1).s}s)`);
  }
  return { g: giudica(tutte), perCarr, pe, err, tutte };
}

const out = {};
let ok = true;
if (SOLO !== 'rosso') {
  const v = await braccio(false, N); out.verde = { ...v.g, perCarr: v.perCarr, pe: v.pe.length, err: v.err };
  const carrCon = v.perCarr.filter(c => c.offerte > 0).length, nTipi = Object.keys(v.g.tipi).length;
  const cop = v.g.giud >= 40 && nTipi >= 3 && carrCon >= 6 && !v.err.length;
  const verde = cop && v.g.A === 0 && v.g.B === 0 && v.g.C === 0 && v.g.E === 0 && v.pe.length === 0;
  const g = v.g;
  console.log(`\n══ OFFERTE-448 · VERDE · ${N} carriere x ${STAG} stagioni ══`);
  console.log(`  offerte ${g.tot} (giudicabili ${g.giud}) · carriere con offerta ${carrCon}/${N} · pageerror ${v.pe.length}`);
  console.log(`  tipi: ${Object.entries(g.tipi).map(([k, x]) => `${k} ${x} (${(100 * x / g.tot).toFixed(0)}%)`).join(' · ')}`);
  console.log(`  verso: su ${g.verso.su} · pari ${g.verso.pari} · giu ${g.verso.giu} · finestre: ${Object.entries(g.perFin).map(([k, x]) => k + ' ' + x).join(' · ')}`);
  console.log(`  ruolo di chi riceve: ${Object.entries(g.perRuolo).map(([k, x]) => k + ' ' + x).join(' · ')}`);
  console.log(`  cifre: stipendio x oggi mediana ${med(g.stipX)?.toFixed(2)} (min ${Math.min(...g.stipX).toFixed(2)}, max ${Math.max(...g.stipX).toFixed(2)}) · morale mediana +${med(g.mor)} · crescita mediana +${med(g.cre)}`);
  console.log(`  club piu' frequenti: ${Object.entries(g.club).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, x]) => k + ' ' + x).join(' · ')} (${Object.keys(g.club).length} club diversi)`);
  console.log(`  A ${g.A} · B ${g.B} · C ${g.C} · E ${g.E}`); for (const k of 'ABCE') g.es[k].forEach(s => console.log(`    ${k}: ${s}`));
  v.err.forEach(e => console.log('  ✗ ' + e)); if (v.pe.length) console.log('  pageerror: ' + v.pe[0]);
  console.log(cop ? (verde ? '  ✅ verde: le regole del 351 reggono sulle carriere simulate' : '  ❌ ROSSO: una regola del 351 non regge') : '  ❌ NON GIUDICATO (copertura insufficiente) = rosso');
  if (!verde) ok = false;
  out.verde.tutte = v.tutte;
}
if (SOLO !== 'verde') {
  const r = await braccio(true, NR); out.rosso = { ...r.g, perCarr: r.perCarr, pe: r.pe.length, err: r.err };
  const vede = r.g.A > 0 || r.g.B > 0;
  console.log(`\n══ OFFERTE-448 · ROSSO (__CPM_NO_G351, regole di prima) · ${NR} carriere ══`);
  console.log(`  offerte ${r.g.tot} (giudicabili ${r.g.giud}) · A ${r.g.A} · B ${r.g.B} · C ${r.g.C}`); for (const k of 'AB') r.g.es[k].slice(0, 2).forEach(s => console.log(`    ${k}: ${s}`));
  console.log(vede ? '  ✅ il braccio rosso vede le offerte assurde/senza guadagno' : '  ❌ braccio rosso CIECO = rosso');
  if (!vede) ok = false;
}
if (SOLO !== 'verde' && SOLO !== 'rosso') {
  const r = await giocaCarriera(carriera(1, 2), 'cieco');/* la carriera in lista: nel verde produce offerte in una stagione */
  const cieco = r.offerte.length === 0 && r.stagioni >= 1 && !r.err;
  console.log(`\n══ OFFERTE-448 · CIECO (__CPM_NO_G448, registro spento) · 1 carriera ══`);
  console.log(`  offerte viste ${r.offerte.length} · stagioni ${r.stagioni}${r.err ? ' · ' + r.err : ''}`);
  console.log(cieco ? '  ✅ col registro spento il guardiano e\' cieco (NON GIUDICATO): legge davvero cpmEv("offerta")' : '  ❌ il guardiano vede offerte col registro spento = rosso');
  if (!cieco) ok = false;
}
try { fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/offerte-448.json', import.meta.url), JSON.stringify(out, null, 1)); } catch (e) {}
console.log(ok ? '\n✅ OFFERTE-448 PASS' : '\n❌ OFFERTE-448 FAIL');
await b.close(); srv.close();
process.exit(ok ? 0 : 1);
