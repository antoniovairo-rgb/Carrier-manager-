#!/usr/bin/env node
/* [giro 377 · PO-646 «Rivedere tutti gli impulsi e renderli logici e realistici»] GUARDIANO: UNA SCELTA CHE PROMETTE UN FATTO
 * LO PRODUCE, E L'IMPULSO ESCE SOLO QUANDO HA SENSO.
 *
 * A) CONDIZIONI (catalogo vero __CPM_IMPULSES, profili sintetici):
 *    procuratore e dirigente-idolo solo con la finestra di mercato vicina (W37 si', W8 no) e mai in prestito; prestito d'inverno
 *    solo nelle settimane 13-21; cena con l'ex compagno solo se l'avversario della settimana e' davvero un ex club; raduno
 *    dell'Under B mai nella settimana di una partita; maglia 10 mai a chi ce l'ha; l'amichevole non la propone «il tuo agente».
 * B) FLUSSO VERO (handler __CPM_CAREER): S3 W37, impulso vero «wi_procuratore» → «Aspettiamo» → si vivono le settimane fino a S4
 *    W6: l'offerta del club arriva DENTRO la finestra estiva, nella settimana che il tiro deterministico (ricalcolato qui in node,
 *    stessa formula) dichiara, e il registro lo racconta. Poi S3 W15 riserva, «wi_prestito_inverno» → «Vado»: l'offerta arriva nella
 *    finestra di gennaio ed e' un PRESTITO. Poi «wi_maglia_dieci» → «La prendo»: il numero di maglia diventa 10.
 * Verde: tutti i controlli. Prova del rosso (sempre eseguita): window.__CPM_NO_G377 → condizioni, offerte e maglia di prima:
 * OGNI controllo deve cadere, altrimenti il guardiano non guarda niente. «Non giudicato» (flusso che non arriva alla finestra)
 * = rosso. Uso: CPM_CHROME=/opt/pw-browsers/chromium node impulsi-377.mjs
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };

/* stessa formula del gioco (src/09 hashStr, src/03 tiro377/finestra377) */
const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; } return h; };
const absW = (s, w) => (s - 1) * 38 + w;
function finestra(a) { const s0 = Math.floor((a - 1) / 38), w0 = ((a - 1) % 38) + 1;
  if (w0 <= 3) return [s0 * 38 + w0 + 1, s0 * 38 + 5]; if (w0 <= 21) return [s0 * 38 + Math.max(19, w0 + 1), s0 * 38 + 23]; return [(s0 + 1) * 38 + 1, (s0 + 1) * 38 + 5]; }
const previsto = (name, id, a) => { const f = finestra(a); for (let now = f[0]; now <= f[1]; now++) if ((hashStr(`att377|${name}|Italia|${id}|${now}`) % 1000) / 1000 < 0.45) return now; return null; };
/* la settimana attesa tenendo conto dei rinvii dichiarati dal gioco (un'offerta del mercato gia' aperta fa slittare il tiro) */
const attesoCon = (name, id, a, att) => { const rin = new Set(att.filter(e => e.ev === 'rinvio' && e.id === id).map(e => e.w)); const f = finestra(a);
  for (let now = f[0]; now <= f[1]; now++) if (!rin.has(now) && (hashStr(`att377|${name}|Italia|${id}|${now}`) % 1000) / 1000 < 0.45) return now; return null; };
/* nome il cui tiro arriva a meta' finestra (non alla prima settimana): cosi' si vede che il gioco ASPETTA il tiro, non spara subito */
const scegliNome = (id, a) => { for (let i = 0; i < 400; i++) { const n = `Collaudo Promessa ${i}`; const w = previsto(n, id, a); if (w != null && w > finestra(a)[0]) return { n, w }; } return null; };

const baseSave = (name, extra) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 37, weekLived: false, age: 22, ovr: 72,
  tutorialDone: true, club: CLUB, popularity: 45, hasAgent: true, jerseyNum: 7, jerseyNumSeason: 3,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 4, wage: 6000, expiresAtSeason: 8 }, yellAccum: 0, seasonCards: { y: 0, r: 0 },
  matches: 20, totalMatches: 60, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 80000, history: [{ clubId: 'zz1', season: 1 }, { clubId: CLUB.id, season: 2 }], ...extra } });

async function apri(save, rosso) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G377 = true; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  return { ctx, page, errori };
}
/* sceglie l'impulso vero col gestore del bottone, poi vive le settimane fino a (sF,wF) rispondendo «la prima» agli altri impulsi */
async function promessa(page, id, sF, wF) {
  const r0 = await page.evaluate(id => window.__CPM_CAREER.apriImpulso(id), id); await sleep(250);
  const r1 = await page.evaluate(() => window.__CPM_CAREER.scegli(0)); await sleep(300);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  const offerte = [];
  for (let i = 0; i < 160; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); return { res, st: C.get() }; });
    if (r.res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(900); }
    else if (r.res && r.res.startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    await sleep(900);
    const o = await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); return { s: p.season, w: p.week, log: (p.log || []).slice(0, 4), lived: p.weekLived }; });
    const at = await page.evaluate(() => (window.__CPM_ATT377 && window.__CPM_ATT377.log) || []);
    if (at.some(e => e.ev === 'arrivo' && e.id === id)) offerte.push(o);
    if (r.res === 'lived') { await sleep(120); await page.evaluate(() => { const C = window.__CPM_CAREER; C.scegli(0); }); }
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    if (o.s > sF || (o.s === sF && o.w >= wF)) break;
  }
  const fine = await page.evaluate(id => { const p = window.__CPM_CAREER.snapshot(); return { s: p.season, w: p.week, mem: (p.impMem || {})[id] || null, log: (p.log || []).slice(0, 80), jersey: p.jerseyNum, att: (window.__CPM_ATT377 && window.__CPM_ATT377.log) || [] }; }, id);
  return { r0, r1, fine };
}

async function giro(rosso) {
  const ok = {}; const info = {};
  // ---------------- A) condizioni sul catalogo vero
  const { ctx, page, errori } = await apri(baseSave('Collaudo Condizioni', {}), rosso);
  const A = await page.evaluate(() => {
    const L = window.__CPM_IMPULSES || []; const get = id => L.find(x => x.id === id);
    const el = (id, p) => { const im = get(id); try { return !!im && (!im.cond || !!im.cond(p)); } catch (e) { return false; } };
    const P = (o) => ({ proStatus: 'pro', season: 3, week: 37, age: 22, ovr: 74, popularity: 45, hasAgent: true, coachTrust: 60, squadRole: 'titolare',
      club: { id: 'b04', n: 'FC Werkstadt', p: 74 }, history: [{ clubId: 'zz1' }, { clubId: 'b04' }], matchHistory: [], calendar: [], jerseyNum: 7, matches: 10, totalMatches: 60, ...o });
    const cal = (w, opp) => [{ week: w, played: false, isHome: true, opponentId: opp, opponentName: 'X' }];
    return {
      procVicina: el('wi_procuratore', P({ week: 37 })), procLontana: el('wi_procuratore', P({ week: 8 })), procPrestito: el('wi_procuratore', P({ week: 37, loan: { parentClub: {} } })),
      idoloVicina: el('wi_dirigente_idolo', P({ week: 15 })), idoloLontana: el('wi_dirigente_idolo', P({ week: 26 })),
      prestOk: el('wi_prestito_inverno', P({ week: 15, squadRole: 'riserva', matches: 0, age: 21, ovr: 60, coachTrust: 35 })), prestRuolo: (typeof calcSquadRole === 'function') ? calcSquadRole(P({ week: 15, ovr: 60, coachTrust: 35 })) : '?', prestEstate: el('wi_prestito_inverno', P({ week: 30, squadRole: 'riserva', matches: 0, age: 21, ovr: 60, coachTrust: 35 })),
      cenaEx: el('wi_ex_compagno_cena', P({ week: 10, calendar: cal(10, 'zz1') })), cenaNonEx: el('wi_ex_compagno_cena', P({ week: 10, calendar: cal(10, 'qq9') })),
      nazSosta: el('wi_nazionale_b', P({ age: 21, nationalCaps: 0, week: 10, calendar: [] })), nazGara: el('wi_nazionale_b', P({ age: 21, nationalCaps: 0, week: 10, calendar: cal(10, 'qq9') })),
      dieciAltro: el('wi_maglia_dieci', P({ jerseyNum: 7 })), dieciGia: el('wi_maglia_dieci', P({ jerseyNum: 10 })),
      amichevoleAgente: /agente/i.test((get('wi_amichevole') || {}).txt || ''),
    };
  });
  ok['A procuratore: finestra vicina si, lontana no, in prestito no'] = A.procVicina && !A.procLontana && !A.procPrestito;
  ok['A dirigente-idolo: solo con la finestra vicina'] = A.idoloVicina && !A.idoloLontana;
  ok['A prestito d\'inverno: settimane 13-21, non a W30'] = A.prestOk && !A.prestEstate;
  ok['A cena con l\'ex: solo se l\'avversario e\' un ex club'] = A.cenaEx && !A.cenaNonEx;
  ok['A Under B: nella sosta si, con la partita no'] = A.nazSosta && !A.nazGara;
  ok['A maglia 10: mai a chi ce l\'ha'] = A.dieciAltro && !A.dieciGia;
  ok['A amichevole: non la propone «il tuo agente»'] = !A.amichevoleAgente;
  info.A = A;
  await ctx.close();

  // ---------------- B1) procuratore: «Aspettiamo» → il club arriva nella finestra estiva, nella settimana dichiarata dal tiro
  const aP = absW(3, 37); const nP = scegliNome('wi_procuratore', aP);
  const b1 = await apri(baseSave(nP.n, { season: 3, week: 37 }), rosso);
  const P1 = await promessa(b1.page, 'wi_procuratore', 4, 7);
  const arr1 = P1.fine.att.find(e => e.ev === 'arrivo' && e.id === 'wi_procuratore');
  info.B1 = { nome: nP.n, previsto: nP.w, scelta: P1.r1, mem: P1.fine.mem, arrivo: arr1 || null, fine: `S${P1.fine.s}W${P1.fine.w}`, err: b1.errori.slice(0, 2) };
  const giudicato1 = P1.fine.s > 4 || (P1.fine.s === 4 && P1.fine.w >= 6);
  ok['B1 procuratore: flusso arrivato oltre la finestra (giudicato)'] = giudicato1;
  const w1 = attesoCon(nP.n, 'wi_procuratore', aP, P1.fine.att); info.B1.attesoDopoRinvii = w1;
  ok['B1 procuratore: «Aspettiamo» → offerta vera nella settimana dichiarata dal tiro'] = !!arr1 && arr1.w === w1 && !!(P1.fine.mem && P1.fine.mem.f377 === w1);
  ok['B1 procuratore: il registro della carriera lo racconta'] = P1.fine.log.some(l => /procuratore aveva ragione/.test(l));
  await b1.ctx.close();

  // ---------------- B2) prestito d'inverno: «Vado» → offerta di PRESTITO nella finestra di gennaio
  const aL = absW(3, 15); const nL = scegliNome('wi_prestito_inverno', aL);
  const b2 = await apri(baseSave(nL.n, { season: 3, week: 15, squadRole: 'riserva', matches: 0, age: 21, ovr: 68 }), rosso);
  const P2 = await promessa(b2.page, 'wi_prestito_inverno', 3, 24);
  const arr2 = P2.fine.att.find(e => e.ev === 'arrivo' && e.id === 'wi_prestito_inverno');
  info.B2 = { nome: nL.n, previsto: nL.w, mem: P2.fine.mem, arrivo: arr2 || null, fine: `S${P2.fine.s}W${P2.fine.w}`, err: b2.errori.slice(0, 2) };
  ok['B2 prestito: flusso arrivato oltre la finestra (giudicato)'] = P2.fine.s > 3 || P2.fine.w >= 24;
  const w2 = attesoCon(nL.n, 'wi_prestito_inverno', aL, P2.fine.att); info.B2.attesoDopoRinvii = w2;
  ok['B2 prestito: «Vado» → offerta di prestito nella settimana dichiarata'] = !!arr2 && arr2.w === w2 && /prest/.test(arr2.tipo || '');

  // ---------------- B3) maglia 10: «La prendo» → il numero cambia
  const m0 = await b2.page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); const a = C.apriImpulso('wi_maglia_dieci'); return a; }); await sleep(250);
  await b2.page.evaluate(() => window.__CPM_CAREER.scegli(0)); await sleep(400);
  const j = await b2.page.evaluate(() => window.__CPM_CAREER.snapshot().jerseyNum);
  info.B3 = { apri: m0, jersey: j };
  ok['B3 maglia 10: «La prendo» → jerseyNum 10'] = j === 10;
  await b2.ctx.close();
  const err = [...errori, ...b1.errori, ...b2.errori];
  return { ok, info, err };
}

let exit = 0;
const v = await giro(false);
console.log('VERDE'); for (const k of Object.keys(v.ok)) console.log(`  ${v.ok[k] ? '✅' : '❌'} ${k}`);
console.log('  dati:', JSON.stringify(v.info));
if (v.err.length) console.log('  pageerror:', v.err.slice(0, 3).join(' | '));
if (!Object.values(v.ok).every(Boolean) || v.err.length) exit = 1;
const x = await giro(true);
/* nel rosso i due controlli «giudicato» restano veri (il flusso arriva comunque oltre la finestra): sono la prova che il rosso
   e' stato giudicato davvero, e non si contano fra quelli che devono cadere */
const chiavi = Object.keys(x.ok).filter(k => !/giudicato/.test(k));
const cadute = chiavi.filter(k => !x.ok[k]);
const giud = Object.keys(x.ok).filter(k => /giudicato/.test(k)).every(k => x.ok[k]);
console.log(`ROSSO __CPM_NO_G377 → cadono ${cadute.length}/${chiavi.length}, rosso giudicato: ${giud ? 'si' : 'NO'} ${cadute.length === chiavi.length && giud ? '✅' : '❌'}`);
if (cadute.length !== chiavi.length || !giud) { exit = 1; console.log('  restano verdi:', chiavi.filter(k => x.ok[k]).join(' · ')); }
console.log(exit ? 'IMPULSI-377: ❌ ROSSO' : 'IMPULSI-377: ✅ VERDE');
await browser.close(); srv.close(); process.exit(exit);
