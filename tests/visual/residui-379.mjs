#!/usr/bin/env node
/* [giro 379] GUARDIANO DEI DUE RESIDUI (PO-658 da PO-190, PO-659 da PO-214), su carriere SIMULATE dal salvataggio S12 (OVR 93, club
   prestigio 96: e' quello che produce le goleade). Le regole di giudizio sono scritte qui PRIMA della misura (RAPPORTO-giro379 §1).

   A · PO-658 «nelle goleade la pagella dell'eroe e' incoerente col risultato». Si simula col tasto «Simula» (step() del banco chiama
       la stessa simulateAndAdvance del bottone; tornei della Nazionale simulati con __CPM_SIM_NAT): la S13 intera a Merseyside, poi
       (dopo il trasferimento del braccio B a S14 W6) il resto della S14 e la S15 intera al club nuovo — semi diversi (club, stagione,
       settimana) e forze diverse. Ogni gara simulata dell'eroe entra nello storico con risultato, gol, assist e voto. Regole:
       A1 gol >= 0, assist >= 0, gol + assist <= gol della squadra dell'eroe;
       A2 chi ha giocato (non infortunato/squalificato/non convocato/svincolato) ha un voto in [4, 10];
       A3 goleada (scarto >= 3): vinta -> voto >= 6,0; persa senza gol ne' assist dell'eroe -> voto <= 6,5;
       A4 goleada vinta con doppietta o piu' -> voto >= 7,0;
       A5 copertura: almeno 8 goleade giudicate, altrimenti NON GIUDICATO (= rosso).
       ⚠️ RITOCCO DOPO LA MISURA, DICHIARATO (RAPPORTO-giro379 §2): la corsa del treno ha trovato una goleada vinta con voto 5,9 e la
       sonda misura-379 (5.000 simulate) dice che l'unica causa e' l'ESPULSIONE dell'eroe decisa dal motore (voto della pagella 4,8).
       Da li': A3 «vinta -> voto >= 6,0» vale per chi finisce la partita; l'eroe espulso (testimone __CPM_CART310 della stessa gara)
       ne e' escluso, e in cambio vale
       A6 la riga dell'eroe della simulata con l'eroe espulso dice «espulso» accanto al voto: catena vera motore -> tabellino -> riga,
       sulla simulata n. 348 della sonda (3-0, 2 assist, voto 5,6, espulso; se il motore cambia si cerca la prima espulsione entro 3000
       semi, altrimenti NON GIUDICATO). Soglie invariate.
       Rosso A (CPM_ROSSO=1): __CPM_NO_G379A (la riga non dichiara l'espulsione: A6 rosso) e, per provare il GIUDICE di A1-A4, la sonda
       provoca il difetto sulle gare misurate (voto della goleada rovesciato 12 - v, un gol in piu' della squadra all'eroe in una gara).

   B · PO-659 «con Simula la presentazione al club nuovo resta un riquadro in Home invece della sala stampa prima della prima partita».
       Trasferimento vero (offerta generata dal gioco + acceptTransfer), poi «Simula» sulla prima gara col club nuovo. Regole:
       B1 al Simula si apre la sala stampa con la PRESENTAZIONE (le risposte dei tre toni) e la settimana NON e' ancora avanzata;
       B2 rispondendo (domanda, rilancio) e chiudendo la prima pagina la gara si simula (storico +1, settimana +1);
       B3 presentedClub = club nuovo e in Home non c'e' piu' il riquadro «Presentazione · <club>».
       Rosso B (CPM_ROSSO=1 -> __CPM_NO_G379B): comportamento di prima (B1 falso: la settimana avanza e il riquadro resta in Home).
   Uso: node residui-379.mjs (verde) · CPM_ROSSO=1 node residui-379.mjs (rosso). npm run residui-379 = entrambi. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const STAGIONI = +(process.env.CPM_STAGIONI || 1);/* stagioni intere a Merseyside prima del trasferimento (il contratto del salvataggio scade dopo la S14) */
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (r) { window.__CPM_NO_G379A = 1; window.__CPM_NO_G379B = 1; } localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, ROSSO]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
await page.evaluate(() => window.__CPM_CAREER.dismiss());

const gare = []; const visti = new Set();
const raccogli = async () => {
  const mh = await page.evaluate(() => (window.__CPM_CAREER.snapshot().matchHistory || []).filter(m => m && m.simulated).map(m => ({ s: m.season, w: m.week, o: m.opponent, hs: m.homeScore, as: m.awayScore, g: m.goals | 0, a: m.assists | 0, v: m.rating, fuori: !!(m.injured || m.squalificato || m.nonConvocato || m.svincolato), naz: !!m.nat, comp: m.cup ? 'coppa' : m.euro ? 'europa' : 'lega' })));
  const esp = await page.evaluate(() => (window.__CPM_CART310 || []).filter(c => c && c.r).map(c => c.s + '|' + c.w));
  for (const m of mh) { const k = m.s + '|' + m.w + '|' + m.o + '|' + m.comp; if (visti.has(k)) continue; visti.add(k); m.esp = esp.includes(m.s + '|' + m.w); if (m.s >= 13) gare.push(m); }
};
/* passo di carriera come career-sim-test: rollover, tornei, aperture */
async function passo() {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return { res, st: C.get() }; });
  if (r.res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(900); await page.evaluate(() => window.__CPM_CAREER.dismiss()); }
  else if (r.res && r.res.startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
  await sleep(120);
  return r;
}
async function finoA(cond, max) { let r = null; for (let i = 0; i < max; i++) { r = await passo(); if (r.res === 'simulated') await raccogli(); if (await cond(r)) return r; } return r; }

/* ── A: dalla S12 W38 (rollover) la S13 intera a Merseyside ── */
const t0 = Date.now();
await finoA(async r => r.st.season >= 13 + STAGIONI, 400);
await raccogli();
const nA = gare.length;

/* ── B: trasferimento, poi Simula sulla prima gara col club nuovo ── */
const B = { ok: false };
await finoA(async r => r.st.week >= 6, 60);
const prima = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { club: p.club && p.club.id, pres: p.presentedClub }; });
await page.evaluate(() => { const C = window.__CPM_CAREER; const o = generateTransferOffer(C.snapshot()); o.type = 'trasferimento'; C.setOffer(o); });
await sleep(800);
await page.evaluate(() => window.__CPM_CAREER.acceptOffer()); await sleep(1500);
await page.evaluate(() => window.__CPM_CAREER.dismiss());
const dopo = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { club: p.club && p.club.id, nome: p.club && p.club.n, pres: p.presentedClub, w: p.week, s: p.season }; });
B.trasferito = !!dopo.club && dopo.club !== prima.club;
/* si porta la settimana fino al punto in cui il prossimo passo e' «Simula» su una gara col club nuovo */
for (let i = 0; i < 12; i++) {
  const q = await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); return { lived: !!p.weekLived, md: !!C.thisWeekMd(), ap: C.openingPending() }; });
  if (q.lived && q.md && !(Array.isArray(q.ap) && q.ap.length)) break;
  await passo();
}
const pre = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { w: p.week, s: p.season, n: (p.matchHistory || []).length, pres: p.presentedClub, club: p.club && p.club.id }; });
B.riquadroPrima = await page.evaluate(async () => { window.__CPM_CAREER.goTab('dashboard'); await new Promise(r => setTimeout(r, 600)); return /Presentazione ·/i.test(document.body.innerText); });
/* le finestre rimaste aperte dalla corsa (verifica del mister, traguardi, feste dei trofei) coprono la sala stampa: il giocatore le chiude
   prima di poter premere «Simula» — chiudi163 per le finestre, «Festeggia» per le feste */
await page.evaluate(() => window.__CPM_CAREER.chiudi163()); await sleep(600);
for (let i = 0; i < 4; i++) { const f = page.getByRole('button', { name: /Festeggia/ }).first(); if (!(await f.isVisible().catch(() => false))) break; await f.click({ timeout: 3000 }).catch(() => {}); await sleep(900); }
const res = await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(1500);
B.passo = res;
const sala = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { pres: [...document.querySelectorAll('[data-cpm="risposta24"]')].some(e => /Sono qui per vincere qualcosa/.test(e.innerText)), nr: document.querySelectorAll('[data-cpm="risposta24"]').length, testo: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300), w: p.week, n: (p.matchHistory || []).length }; });
if (process.env.CPM_FOTO) await page.screenshot({ path: process.env.CPM_FOTO }); B.vis = await page.evaluate(() => { const e = document.querySelector('[data-cpm="risposta24"]'); if (!e) return null; const r = e.getBoundingClientRect(); const out = [r.x, r.y, r.width, r.height].map(Math.round); let n = e; while (n) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) { out.push((n.className || n.tagName) + ':' + cs.display + '/' + cs.visibility + '/' + cs.opacity); break; } n = n.parentElement; } return out; }); B.sala = sala.pres; B.risposte = sala.nr; if (!sala.pres) B.schermo = sala.testo; B.fermo = sala.w === pre.w && sala.n === pre.n;
let clic = 0;
if (sala.pres) {
  for (let k = 0; k < 2; k++) { try { await page.locator('[data-cpm="risposta24"]').first().click({ timeout: 5000 }); clic++; } catch (e) { B.errClic = String(e.message).split('\n').slice(0, 6).join(' | ').slice(0, 600); } await sleep(900); }
  if (await page.evaluate(() => !!document.querySelector('[data-cpm="prima-pagina24"]'))) { try { await page.getByRole('button', { name: 'Chiudi', exact: true }).first().click({ timeout: 5000 }); clic++; } catch (e) {} }
  await sleep(2000);
}
B.clic = clic;
const fine = await page.evaluate(async () => { const C = window.__CPM_CAREER; C.dismiss(); C.goTab('dashboard'); await new Promise(r => setTimeout(r, 700)); const p = C.snapshot(); return { w: p.week, n: (p.matchHistory || []).length, pres: p.presentedClub, club: p.club && p.club.id, riquadro: /Presentazione ·/i.test(document.body.innerText), ult: (p.matchHistory || []).slice(-1)[0] || null }; });
B.simulata = fine.n === pre.n + 1 && fine.w === pre.w + 1;
B.presentato = fine.pres === fine.club; B.riquadroDopo = fine.riquadro;
B.ok = B.trasferito && B.riquadroPrima && B.sala && B.fermo && B.simulata && B.presentato && !B.riquadroDopo;
console.log('B ' + JSON.stringify({ prima, dopo, pre, ...B, ultima: fine.ult && { o: fine.ult.opponent, hs: fine.ult.homeScore, as: fine.ult.awayScore, v: fine.ult.rating } }));

/* stagione al club nuovo: altre gare per A (avversari diversi, forza diversa) */
const sB = (await page.evaluate(() => window.__CPM_CAREER.get())).season;
await finoA(async r => r.st.season > sB + 1, 300);/* resto della stagione del trasferimento + una stagione intera al club nuovo */
await raccogli();

/* ── giudizio A ── */
if (ROSSO) { /* provocazione dichiarata: il giudice deve vedere il difetto */
  let fatto = false;
  for (const m of gare) { if (m.v != null && Math.abs(m.hs - m.as) >= 3) m.v = Math.round((12 - m.v) * 10) / 10; if (!fatto && m.hs > 0) { m.g = m.hs + 1; fatto = true; } }
}
const viol = [];
let gol = 0, golWin = 0, golLoss = 0, espulsi = 0;
for (const m of gare) {
  const d = m.hs - m.as, k = `S${m.s}W${m.w} ${m.comp} ${m.hs}-${m.as} vs ${m.o} · G${m.g} A${m.a} voto ${m.v}`;
  if (m.g < 0 || m.a < 0 || m.g + m.a > m.hs) viol.push('A1 ' + k);
  if (!m.fuori && !(m.v != null && m.v >= 4 && m.v <= 10)) viol.push('A2 ' + k);
  if (m.fuori || m.v == null) continue;
  if (Math.abs(d) >= 3) {
    gol++; if (d > 0) golWin++; else golLoss++;
    if (m.esp) { espulsi++; continue; }/* A3/A4 valgono per chi finisce la partita (ritocco dichiarato in testa) */
    if (d > 0 && m.v < 6.0) viol.push('A3 vinta ' + k);
    if (d < 0 && m.g + m.a === 0 && m.v > 6.5) viol.push('A3 persa ' + k);
    if (d > 0 && m.g >= 2 && m.v < 7.0) viol.push('A4 ' + k);
  }
}
/* A6: catena motore -> tabellino -> riga sulla simulata con l'eroe espulso */
const A6 = await page.evaluate(() => {
  const p = window.__CPM_CAREER.snapshot(); const lc = CLUBS.filter(c => c.lg === p.club.lg && c.id !== p.club.id);
  const prova = (i) => { const opp = lc[i % lc.length], seed = (i * 2654435761 + 12345) >>> 0, q = { ...p, week: 1 + (i % 30) };
    const sim = simulateMatch(p.club, opp, p.ovr, i % 2 === 0, seed, {}, { motore: true, giocatore: q, stileEroe: (typeof stileMotore === 'function' ? stileMotore(q) : null), stile: (q.coach && q.coach.style) || null });
    if (!(sim.cart310 && sim.cart310.r)) return null;
    const ps = _pSimStats(sim, p.ovr, p.archetype?.id || p.archetype || '', seededRng(hashStr('psim|' + seed) >>> 0)); const v = votoSimEroe(sim, ps);
    return { i, ris: sim.homeScore + '-' + sim.awayScore, v, riga: _heroSimLine(ps, v) }; };
  let r = prova(348); for (let i = 0; !r && i < 3000; i++) r = prova(i); return r;
}).catch(e => ({ err: String(e).slice(0, 160) }));
if (!A6 || A6.err) viol.push('A6 NON GIUDICATO: nessuna simulata con l\'eroe espulso trovata ' + (A6 && A6.err || ''));
else if (!/espulso/.test(A6.riga)) viol.push(`A6 riga senza «espulso»: simulata n. ${A6.i} ${A6.ris} voto ${A6.v} →${A6.riga}`);
console.log('A6 ' + JSON.stringify(A6));
const giud = gol >= 8;
const okA = giud && viol.length === 0;
const sec = Math.round((Date.now() - t0) / 1000);
const voti = gare.filter(m => !m.fuori && m.v != null && Math.abs(m.hs - m.as) >= 3).map(m => `${m.hs}-${m.as}:G${m.g}A${m.a}v${m.v}`);
console.log(`A gare simulate ${gare.length} (${nA} a Merseyside) · goleade ${gol} (vinte ${golWin}, perse ${golLoss}) · eroe espulso in goleada ${espulsi} · violazioni ${viol.length}`);
console.log('  goleade: ' + voti.join(' · '));
viol.slice(0, 12).forEach(v => console.log('  ✗ ' + v));
console.log(`pageerror ${errori.length}${errori.length ? ' → ' + errori[0] : ''} · ${sec}s`);
await b.close(); srv.close();
const vA = ROSSO ? !okA : okA, vB = ROSSO ? !B.ok : B.ok;
const braccio = ROSSO ? 'ROSSO' : 'VERDE';
const motivoA = !giud ? `NON GIUDICATO: ${gol} goleade < 8` : (okA ? 'pagella coerente col risultato' : `${viol.length} violazioni`);
const motivoB = B.ok ? 'sala stampa prima della gara simulata, riquadro sparito' : `trasferito ${B.trasferito} · riquadro prima ${B.riquadroPrima} · sala ${B.sala} · fermo ${B.fermo} · simulata ${B.simulata} · presentato ${B.presentato} · riquadro dopo ${B.riquadroDopo}`;
const pass = vA && vB && errori.length === 0 && (ROSSO || giud);
console.log(`braccio ${braccio} · A: ${motivoA} → ${vA ? 'atteso' : 'NON atteso'} · B: ${motivoB} → ${vB ? 'atteso' : 'NON atteso'}`);
console.log(pass ? `✅ residui-379 ${braccio} come atteso` : `❌ residui-379 ${braccio} NON come atteso`);
process.exit(pass ? 0 : 1);
