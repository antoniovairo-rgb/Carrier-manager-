#!/usr/bin/env node
/* [PO-263 · giro 37, eccezione PO 15/10 «Correggi tutte e tre»] GUARDIANO: CHI NON SCENDE IN CAMPO NON SI INFORTUNA IN PARTITA
 * NE' PRENDE FATICA DI PARTITA SU «SIMULA».
 *
 * Handler VERI (__CPM_CAREER, ?cpmtest=1), stato da localStorage 'cpm-v3', una pagina nuova per braccio (come squalifica-222).
 * Il tiro d'infortunio della gara simulata e' SEEDATO (simInjuryRoll, seme standingsSeed(club,stagione,settimana)+7 in lega, +11
 * in coppa): il guardiano cerca nella pagina una settimana in cui, a fatica 90, il tiro SCATTA — cosi' il braccio sano di
 * controllo si infortuna e la misura non e' cieca. Bracci:
 *   LEGA, settimana col tiro che scatta (fatica 90): sano (controllo: infortunato) · squalificato, non convocato (bottone «Simula»
 *     vero) · svincolato (step) → nessun infortunio, fatica che scende.
 *   LEGA, settimana senza tiro (fatica 60): sano vs squalificato/non convocato/svincolato → chi non gioca chiude con MENO fatica
 *     del sano (niente +6..11 di partita).
 *   COPPA iniettata in una settimana libera col tiro +11 che scatta: sano (controllo) · squalificato · svincolato.
 * Prova del rosso: CPM_ROSSO=1 arma window.__CPM_NO_SIM263 → chi non gioca si infortuna e si stanca: il guardiano DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node infortunio-263.mjs   (CPM_JSON=1 stampa i numeri grezzi)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const guasti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) guasti.push(m); };

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (extra) => ({ phase: 'career', player: { name: 'Collaudo Zona G', nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 8 },
  matches: 0, totalMatches: 0, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 0,
  sessionsThisWeek: 3/* piano settimanale completo → niente allenamento automatico: la fatica attesa e' ESATTA (confondente tolto) */,
  yellAccum: 0, seasonCards: { y: 0, r: 0 }/* senza yellAccum la migrazione azzera isSuspended al caricamento (giro 33) */, ...extra } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_SIM263 = true;
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errori };
}

const stato = (page) => page.evaluate(() => {
  const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  const h = p.matchHistory || []; const u = h[h.length - 1] || null;
  return { week: p.week, fatigue: p.fatigue, injured: !!p.injured, injuryWeeks: p.injuryWeeks || 0, injuryType: p.injuryType || null, matches: p.matches || 0,
    ultima: u && { cup: !!u.cup, nc: !!u.nonConvocato, sq: !!u.squalificato, svinc: !!u.svincolato, rating: u.rating } };
});

// settimane: il tiro seedato (replica di simInjuryRoll a fatica 90, perkFisio assente) e il calendario vero della stagione 2
let WI = null, W0 = null, WC = null, SC = 2;
const tiroDi = (page, s) => page.evaluate((s) => { const t = {}; for (let w = 1; w <= 38; w++) for (const k of [7, 11]) {
    const r = seededRng(((standingsSeed('b04', s, w) + k) >>> 0) || 1); const mf = Math.min(100, 90 + 12 + Math.round(r() * 10)); const roll = r();
    t[w + '|' + k] = (mf > 82 && roll < 0.07); } return t; }, s);
{ const { ctx, page } = await apri(baseSave({}));
  const tiro = await page.evaluate(() => { const t = {}; for (let w = 1; w <= 38; w++) for (const k of [7, 11]) {
    const r = seededRng(((standingsSeed('b04', 2, w) + k) >>> 0) || 1); const mf = Math.min(100, 90 + 12 + Math.round(r() * 10)); const roll = r();
    t[w + '|' + k] = (mf > 82 && roll < 0.07); } return t; });
  for (let w = 2; w <= 36; w++) {
    await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w); await sleep(220);
    const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    if (t && !t.type && tiro[w + '|7'] && !WI) WI = w;
    if (t && !t.type && !tiro[w + '|7'] && !W0 && w > 4) W0 = w;
    if (!t && tiro[w + '|11'] && !WC) WC = w;
  }
  await ctx.close(); }
// coppa: la settimana in cui il tiro +11 scatta (stagione 2: W3/W8/W30) e' sempre una giornata di lega → nel braccio coppa la
// giornata di lega di quella settimana si marca giocata e al suo posto si inietta il turno di coppa (la classifica non e' misurata qui)
{ const { ctx, page } = await apri(baseSave({}));
  const tiro = await tiroDi(page, 2);
  for (let w = 2; w <= 36 && !WC; w++) if (tiro[w + '|11']) WC = w;
  await ctx.close(); }
if (!WI || !W0) { console.log(`✗ settimane non trovate (tiro ${WI} · neutra ${W0}): misura cieca`); process.exit(1); }

async function braccio(id, extra, via, sett) {
  const coppa = id.endsWith('-coppa');
  const { ctx, page, errori } = await apri(baseSave({ week: sett, weekLived: false, ...(coppa ? { season: SC } : {}), ...extra }));
  if (coppa) {
    await page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot();
      C.patch({ week: w, weekLived: false, cup: { active: true, round: 1, results: [], bracket: [], eliminated: false },
        calendar: [...(p.calendar || []).map(m => (m.week === w && !m.type && !m.played) ? { ...m, played: true, result: { homeScore: 1, awayScore: 1, won: false, drew: true } } : m), { matchday: 991, week: w, opponentId: 'b07', opponentName: 'SV Rheinau', isHome: true, played: false, result: null,
          type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale' }] }); }, WC);
    await sleep(600);
  }
  const suspVivo = await page.evaluate(() => !!(window.__CPM_CAREER.snapshot() || {}).isSuspended);
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.step(); C.dismiss(); }); await sleep(500);
  const prima = await stato(page);
  const fatPrima = await page.evaluate(() => window.__CPM_CAREER.snapshot().fatigue);
  let azione = '';
  if (via === 'bottone' || via === 'nonconv') {
    await page.evaluate((st) => window.__CPM_CAREER.apriPartita(st), via === 'nonconv' ? 'not_called' : 'starter'); await sleep(500);
    azione = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => /Simula/.test(x.textContent || '') && !/Non puoi/.test(x.textContent || ''));
      if (!b.length) return 'nessun bottone Simula'; const t = (b[b.length - 1].textContent || '').trim(); b[b.length - 1].click(); return t; });
  } else {
    for (let i = 0; i < 5; i++) {
      const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
      azione += r + ' '; await sleep(600);
      if ((await page.evaluate(() => window.__CPM_CAREER.snapshot().week)) !== prima.week) break;
    }
  }
  await sleep(900);
  const dopo = await stato(page);
  await ctx.close();
  return { id, via, sett, azione, suspVivo, fatPrima, prima, dopo, errori, avanzata: dopo.week === prima.week + 1 };
}

const R = [];
// LEGA, settimana col tiro che scatta, fatica 90
R.push(await braccio('sano-tiro', { fatigue: 90 }, 'bottone', WI));
R.push(await braccio('squalificato-tiro', { fatigue: 90, isSuspended: true }, 'bottone', WI));
R.push(await braccio('nonconv-tiro', { fatigue: 90, coachTrust: 5 }, 'nonconv', WI));
R.push(await braccio('svincolato-tiro', { fatigue: 90, contractExpired: true }, 'step', WI));
// LEGA, settimana neutra, fatica 60
R.push(await braccio('sano-fatica', { fatigue: 60 }, 'bottone', W0));
R.push(await braccio('squalificato-fatica', { fatigue: 60, isSuspended: true }, 'bottone', W0));
R.push(await braccio('nonconv-fatica', { fatigue: 60, coachTrust: 5 }, 'nonconv', W0));
R.push(await braccio('svincolato-fatica', { fatigue: 60, contractExpired: true }, 'step', W0));
// COPPA iniettata, tiro +11 che scatta
if (WC) {
  R.push(await braccio('sano-coppa', { fatigue: 90 }, 'bottone', WC));
  R.push(await braccio('squalificato-coppa', { fatigue: 90, isSuspended: true }, 'bottone', WC));
  R.push(await braccio('svincolato-coppa', { fatigue: 90, contractExpired: true }, 'step', WC));
}
if (process.env.CPM_JSON === '1') console.log(JSON.stringify({ WI, W0, WC, R }, null, 1));

const g = (id) => R.find(r => r.id === id);
console.log(`PO-263 · lega: tiro W${WI} · neutra W${W0} · coppa ${WC ? 'iniettata in S' + SC + ' W' + WC : 'non trovata'}${ROSSO ? ' · ROSSO (__CPM_NO_SIM263)' : ''}`);
console.log('braccio               via      fatica      infortunio        ultima voce');
for (const r of R) console.log(`${r.id.padEnd(21)} ${r.via.padEnd(8)} ${String(r.fatPrima + '→' + r.dopo.fatigue).padEnd(11)} ${(r.dopo.injured ? r.dopo.injuryType + ' ' + r.dopo.injuryWeeks + 'w' : 'no').padEnd(17)} ${JSON.stringify(r.dopo.ultima)}`);

for (const r of R) { ok(r.avanzata, `${r.id}: la settimana avanza (misura non cieca)`); ok(!r.errori.length, `${r.id}: nessun errore di pagina ${r.errori.join(' | ')}`); }
ok(g('sano-tiro').dopo.injured, 'lega, sano a fatica 90: il tiro seedato lo infortuna (controllo: la misura vede il tiro)');
const rec = (f) => Math.max(0, f - 6);/* settimana senza gara (doAdvanceWeek): -6, nessun nutrizionista nel salvataggio */
for (const id of ['squalificato-tiro', 'nonconv-tiro', 'svincolato-tiro']) {
  const r = g(id); ok(!r.dopo.injured, `${id}: nessun infortunio in una partita non giocata`);
  ok(r.dopo.fatigue === rec(r.fatPrima), `${id}: fatica da settimana senza gara (${r.fatPrima}→${r.dopo.fatigue}, attesa ${rec(r.fatPrima)})`);
}
ok(g('squalificato-tiro').suspVivo && g('squalificato-fatica').suspVivo, 'squalifica viva prima della partita (misura non cieca)');
ok(!!(g('nonconv-tiro').dopo.ultima || {}).nc && !!(g('nonconv-fatica').dopo.ultima || {}).nc, 'non convocato: la decisione del mister e\' arrivata alla simulazione (misura non cieca)');
{ const r = g('sano-fatica'); ok(r.dopo.fatigue >= Math.min(100, r.fatPrima + 6), `sano, settimana neutra: fatica di partita (${r.fatPrima}→${r.dopo.fatigue}, controllo)`); }
for (const id of ['squalificato-fatica', 'nonconv-fatica', 'svincolato-fatica']) {
  const r = g(id); ok(!r.dopo.injured && r.dopo.fatigue === rec(r.fatPrima), `${id}: fatica da settimana senza gara (${r.fatPrima}→${r.dopo.fatigue}, attesa ${rec(r.fatPrima)}), niente +6..11 di partita`);
}
if (WC) {
  ok(g('sano-coppa').dopo.injured && (g('sano-coppa').dopo.ultima || {}).cup, 'coppa, sano a fatica 90: il tiro +11 lo infortuna (controllo)');
  for (const id of ['squalificato-coppa', 'svincolato-coppa']) { const r = g(id);
    ok(!r.dopo.injured && r.dopo.fatigue === rec(r.fatPrima) && (r.dopo.ultima || {}).cup, `${id}: nessun infortunio, fatica da settimana senza gara (${r.fatPrima}→${r.dopo.fatigue}, attesa ${rec(r.fatPrima)})`); }
} else ok(false, 'nessuna settimana di coppa misurabile');

console.log(righe.join('\n'));
console.log(guasti.length ? `\n✗ ROSSO infortunio-263: ${guasti.length} controlli falliti` : '\n✅ VERDE infortunio-263');
await browser.close(); srv.close();
process.exit(guasti.length ? 1 : 0);
