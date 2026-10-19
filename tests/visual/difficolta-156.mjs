#!/usr/bin/env node
/* [giro 69 PO-156 «A — Curva netta»] Guardiano e strumento della curva di carriera per fase.
   Carriere SIMULATE sugli handler veri (__CPM_CAREER.step, come career-sim-test e il banco L6-bis) partendo da quattro eta'
   (17 · 21 · 26 · 31, una per fase), tre stili (Finalizzatore attaccante · Regista centrocampista · Incursore attaccante) e
   piu' semi; per ogni fase: voto medio, gol a gara, vittorie (tutte le gare in matchHistory, come fasi156.py del giro 67),
   minuti e % titolare dalla decisione del mister calcCoachDecision per ogni gara di campionato (stessa regola del banco L6-bis:
   titolare 90, panchina 90 - ingresso, non convocato 0).
   Partenza di ogni fase = medie misurate dal banco L6-bis per quella fase (OVR e prestigio del club, RAPPORTO-giro69 §1).
   Verde: le quattro fasi entro la tolleranza dei bersagli A. Rosso (__CPM_NO_156): la curva piatta deve uscire di tolleranza.
   Uso: node difficolta-156.mjs [--semi=2] [--stagioni=2] [--par=6] [--rosso] [--json=file] */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const SEMI = Number(args.semi || 2), STAG = Number(args.stagioni || 2), PAR = Number(args.par || 6), ROSSO = !!args.rosso || !!process.env.CPM_ROSSO156;
const BERSAGLI = { gavetta: { voto: 6.0, gol: 0.15, vitt: 35, min: 55, tit: 45 }, affermazione: { voto: 6.4, gol: 0.30, vitt: 45, min: 75, tit: 75 },
  elite: { voto: 6.9, gol: 0.50, vitt: 55, min: 85, tit: 95 }, declino: { voto: 6.3, gol: 0.25, vitt: 45, min: 65, tit: 60 } };
const TOLL = { voto: 0.2, gol: 0.08, vitt: 8, min: 8, tit: 10 };/* tolleranza dichiarata nel RAPPORTO-giro69 */
/* due club per fase (seme dispari / pari): uno sopra il livello dell'eroe e uno sotto, nelle leghe dove le medie del banco L6-bis
   (OVR e prestigio per fase) ricadono; scelti perche' il gioco di prima (rosso) riproduca vittorie e titolarita' del banco. */
const FASI = [{ f: 'gavetta', eta: 17, ovr: 67, club: ['utr', 'gron'] }, { f: 'affermazione', eta: 21, ovr: 74, club: ['rsoc', 'utr'] }, { f: 'elite', eta: 26, ovr: 81, club: ['fra', 'stu'] }, { f: 'declino', eta: 31, ovr: 82, club: ['lille', 'nice'] }];
const STILI = [{ id: 'finalizzatore', pos: 'Attaccante' }, { id: 'regista', pos: 'Centrocampista' }, { id: 'incursore', pos: 'Attaccante' }];
const faseDi = a => a <= 20 ? 'gavetta' : a <= 25 ? 'affermazione' : a <= 30 ? 'elite' : 'declino';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const URL = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

async function prep() {
  const page = await browser.newPage(); await installCdnRoutes(page);
  await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof baseStats === 'function' && typeof ARCHETYPES !== 'undefined' && typeof CLUBS !== 'undefined', null, { timeout: 150000 });
  const out = await page.evaluate(([F, S]) => { const r = {};
    for (const st of S) for (const f of F) { const arc = ARCHETYPES.find(a => a.id === st.id); let s = 777 + f.eta; const o = Math.random; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      const st0 = baseStats(arc); Math.random = o; let best = null;
      for (let d = -40; d <= 40; d++) { const x = {}; Object.keys(st0).forEach(k => x[k] = Math.max(1, Math.min(99, st0[k] + d))); const ov = calcOvr(x); if (!best || Math.abs(ov - f.ovr) < Math.abs(best.ov - f.ovr)) best = { ov, x }; }
      for (const cid of f.club) { const c = CLUBS.find(c => c.id === cid); r[st.id + '|' + f.f + '|' + cid] = { arc: JSON.parse(JSON.stringify(arc)), stats: best.x, ovr: best.ov, club: { id: c.id, n: c.n, a: c.a, p: c.p, c: c.c, c2: c.c2, nat: c.nat, lg: c.lg } }; } }
    return r; }, [FASI, STILI]);
  await page.close(); return out;
}

async function carriera(P, st, f, seme) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } }); await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  const pp = P[st.id + '|' + f.f + '|' + f.club[(seme + 1) % f.club.length]];
  const save = { phase: 'career', player: { name: `Curva ${st.id} ${f.eta} ${seme}`, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 1, week: 1, age: f.eta, ovr: pp.ovr, tutorialDone: true,
    archetype: pp.arc, position: st.pos, foot: 'R', club: pp.club, stats: pp.stats, form: 70, morale: 72, fatigue: 10, coachTrust: 60, contract: { duration: STAG + 2, wage: 6000, expiresAtSeason: STAG + 3 } } };
  await page.addInitScript(([s, seed, rosso]) => { let x = (seed >>> 0) || 1; Math.random = function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (rosso) window.__CPM_NO_156 = 1;
    try { if (!sessionStorage.getItem('c156')) { localStorage.setItem('cpm-v3', s); sessionStorage.setItem('c156', '1'); } } catch (e) {} }, [JSON.stringify(save), 15600 + seme * 7919 + f.eta * 131 + st.id.length, ROSSO]);
  await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 150000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 90000 });
  await sleep(800);
  const gare = [], dec = []; let fatte = 0, iter = 0, stuck = 0, prev = null, fine = 'ok';
  while (fatte < STAG && iter++ < 900) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; let d = null;
      try { const p = C.snapshot(); const md = C.thisWeekMd(); if (p.weekLived && md && (!md.type || md.type === 'league') && !p.injured && !p.isSuspended) {
        const cal = (p.calendar || []).find(m => m.week === p.week && !m.played) || {};
        const cd = calcCoachDecision(p, calcMatchWeight(p, cal.opponentId, p.standings || [], p.week || 1));
        d = { s: p.season, w: p.week, age: p.age, st: cd.status, em: cd.entryMinute }; } } catch (e) {}
      const res = C.step(); C.dismiss(); const p2 = C.snapshot(); return { res, d, s: p2.season, w: p2.week, lived: !!p2.weekLived, age: p2.age, scr: C.screen() }; });
    if (r.d && !dec.find(x => x.s === r.d.s && x.w === r.d.w)) dec.push(r.d);
    if (r.res === 'seasonEnd') {
      const mh = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { age: p.age, ovr: p.ovr, s: p.season, mh: (p.matchHistory || []).filter(m => (m.season || p.season) === p.season) }; });
      for (const m of mh.mh) if (m.rating != null || m.goals != null) gare.push({ age: mh.age, ovr: mh.ovr, r: m.rating, g: m.goals || 0, won: !!m.won, drew: !!m.drew, nc: !!m.nonConvocato, min: m.minuti156 ?? null });
      for (const d of dec) if (d.s === mh.s) d.age = mh.age;
      fatte++; if (fatte >= STAG) break;
      const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); if (ok !== true) { fine = 'startNewSeason:' + ok; break; }
      await sleep(500); await page.evaluate(() => window.__CPM_CAREER.dismiss()); prev = null; continue;
    }
    if (r.res && String(r.res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (r.res && String(r.res).startsWith('error:')) { fine = r.res; break; }
    const k = r.s + '/' + r.w + '/' + r.lived + '/' + r.scr; if (k === prev) { if (++stuck > 25) { fine = 'blocco ' + k; break; } } else stuck = 0; prev = k;
    await sleep(25);
  }
  await page.close();
  return { stile: st.id, fase: f.f, seme, gare, dec, fine, errors };
}

const P = await prep();
const lavori = []; for (let seme = 1; seme <= SEMI; seme++) for (const st of STILI) for (const f of FASI) lavori.push([st, f, seme]);
const ris = []; const t0 = Date.now();
await Promise.all(Array.from({ length: PAR }, async () => { while (lavori.length) { const [st, f, seme] = lavori.shift();
  try { let x; try { x = await carriera(P, st, f, seme); } catch (e1) { console.log(`  ${st.id} ${f.f} seme ${seme}: caricamento fallito, riprovo una volta (${String(e1.message).slice(0, 60)})`); x = await carriera(P, st, f, seme); } ris.push(x); console.log(`  ${st.id} ${f.f} seme ${seme}: ${x.gare.length} gare · ${x.dec.length} decisioni · ${x.fine} · pageerror ${x.errors.length}`); }
  catch (e) { ris.push({ stile: st.id, fase: f.f, seme, gare: [], dec: [], fine: 'ERRORE ' + String(e.message).slice(0, 120), errors: [] }); console.log(`  ${st.id} ${f.f} seme ${seme}: ERRORE ${String(e.message).slice(0, 120)}`); } } }));
await browser.close(); srv.close();

const agg = (filtro) => { const A = {}; for (const F of Object.keys(BERSAGLI)) A[F] = { gare: 0, rN: 0, r: 0, g: 0, V: 0, dN: 0, min: 0, tit: 0 };
  for (const x of ris.filter(filtro)) { for (const m of x.gare) { const a = A[faseDi(m.age)]; if (m.nc) continue; a.gare++; a.g += m.g; a.V += m.won ? 1 : 0; if (m.r != null) { a.rN++; a.r += m.r; } }
    for (const d of x.dec) { const a = A[faseDi(d.age)]; a.dN++; a.min += d.st === 'starter' ? 90 : d.st === 'bench' ? 90 - (d.em || 90) : 0; a.tit += d.st === 'starter' ? 1 : 0; } }
  const o = {}; for (const F in A) { const a = A[F]; o[F] = { gare: a.gare, decisioni: a.dN, voto: +(a.r / Math.max(a.rN, 1)).toFixed(2), gol: +(a.g / Math.max(a.gare, 1)).toFixed(3), vitt: +(100 * a.V / Math.max(a.gare, 1)).toFixed(1), min: +(a.min / Math.max(a.dN, 1)).toFixed(1), tit: +(100 * a.tit / Math.max(a.dN, 1)).toFixed(1) }; }
  return o; };
const tutte = agg(() => true); const perStile = Object.fromEntries(STILI.map(s => [s.id, agg(x => x.stile === s.id)]));
console.log(`\n══ DIFFICOLTA-156 · ${ROSSO ? 'ROSSO (__CPM_NO_156)' : 'VERDE'} · ${ris.length} carriere x ${STAG} stagioni · ${Math.round((Date.now() - t0) / 1000)} s ══`);
console.log('fase           gare  voto (6,0/6,4/6,9/6,3 ±0,2)  gol (±0,08)  vitt (±8)  min (±8)  tit (±10)');
let dentro = 0, celle = 0; const fuori = [];
for (const F of Object.keys(BERSAGLI)) { const m = tutte[F], b = BERSAGLI[F]; const c = k => { const ok = Math.abs(m[k] - b[k]) <= TOLL[k] + 1e-9; celle++; if (ok) dentro++; else fuori.push(`${F}.${k} ${m[k]} (bersaglio ${b[k]})`); return (ok ? '✓' : '✗') + m[k]; };
  console.log(`${F.padEnd(14)} ${String(m.gare).padStart(4)}  ${c('voto').padEnd(27)} ${c('gol').padEnd(12)} ${c('vitt').padEnd(10)} ${c('min').padEnd(9)} ${c('tit')}`); }
for (const s of STILI) console.log(`  ${s.id.padEnd(14)} ` + Object.keys(BERSAGLI).map(F => `${F}: ${perStile[s.id][F].voto}/${perStile[s.id][F].gol}/${perStile[s.id][F].vitt}%/${perStile[s.id][F].min}'/${perStile[s.id][F].tit}%`).join(' · '));
const errori = ris.reduce((s, x) => s + x.errors.length, 0), rotte = ris.filter(x => x.fine !== 'ok').length;
if (args.json) fs.writeFileSync(args.json, JSON.stringify({ rosso: ROSSO, semi: SEMI, stagioni: STAG, tutte, perStile, fuori, carriere: ris.map(x => ({ stile: x.stile, fase: x.fase, seme: x.seme, gare: x.gare.length, dec: x.dec.length, fine: x.fine, errori: x.errors.length })) }, null, 1));
console.log(`celle entro tolleranza: ${dentro}/${celle} · carriere non concluse ${rotte} · pageerror ${errori}`); if (fuori.length) console.log('fuori: ' + fuori.join(' · '));
/* verde: tutte le 20 celle dentro; rosso: la curva piatta deve lasciarne fuori almeno 4 (oggi: titolarita' e minuti di gavetta, voto/gol dell'elite...) */
const pass = rotte === 0 && errori === 0 && (ROSSO ? fuori.length >= 4 : fuori.length === 0);
console.log(pass ? (ROSSO ? '\n✅ ROSSO VISTO — senza la correzione la curva esce di tolleranza' : '\n✅ CURVA OK — le quattro fasi nei bersagli A') : (ROSSO ? '\n❌ ROSSO CIECO — anche senza correzione la curva sta nei bersagli' : '\n❌ CURVA FUORI BERSAGLIO'));
process.exit(pass ? 0 : 1);
