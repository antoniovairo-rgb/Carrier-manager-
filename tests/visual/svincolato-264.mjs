#!/usr/bin/env node
/* [PO-264 · giro 37, eccezione PO 15/10 «Correggi tutte e tre»] GUARDIANO: LO SVINCOLATO NELLE COMPETIZIONI SIMULATE HA LA VOCE
 * DI STORICO MARCATA, SENZA VOTO — COME IN LEGA (7.419).
 *
 * Handler VERI (__CPM_CAREER, ?cpmtest=1), stato da localStorage 'cpm-v3', una pagina nuova per braccio. In una settimana libera
 * della stagione 2 si inietta una gara di girone europeo (euro_group), di eliminazione europea (euro, ottavi) o di Coppa e la si
 * simula con step(). Bracci: sano (controllo: voce col voto) e svincolato (voce `svincolato`, rating nullo, 0 gol/assist, nessuna
 * presenza) per ciascuna competizione, piu' la lega come riferimento dello schema.
 * Prova del rosso: CPM_ROSSO=1 arma window.__CPM_NO_EU264 → la voce dello svincolato torna col voto di squadra: DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node svincolato-264.mjs   (CPM_JSON=1 stampa i numeri grezzi)
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
  
  yellAccum: 0, seasonCards: { y: 0, r: 0 }/* senza yellAccum la migrazione azzera isSuspended al caricamento (giro 33) */, ...extra } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_EU264 = true;
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
  return { week: p.week, matches: p.matches || 0, totalMatches: p.totalMatches || 0, goals: p.goals || 0, assists: p.assists || 0, histN: h.length,
    ultima: u && { euro: !!u.euro, ko: u.euroPhase || null, cup: !!u.cup, svinc: !!u.svincolato, rating: u.rating, goals: u.goals, assists: u.assists } };
});

let WE = null, WL = null, OPP = null;
{ const { ctx, page } = await apri(baseSave({}));
  OPP = await page.evaluate(() => { const c = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 70 && c.p <= 82); return c && { id: c.id, n: c.n }; });
  for (let w = 3; w <= 36 && !(WE && WL); w++) {
    await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w); await sleep(220);
    const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    if (!t && !WE) WE = w; if (t && !t.type && !WL) WL = w;
  }
  await ctx.close(); }
if (!WE || !WL || !OPP) { console.log(`✗ settimane/avversario non trovati (libera ${WE} · lega ${WL} · ${OPP && OPP.id}): misura cieca`); process.exit(1); }

async function braccio(id, extra, comp) {
  const { ctx, page, errori } = await apri(baseSave({ week: comp === 'lega' ? WL : WE, weekLived: false, ...extra }));
  if (comp !== 'lega') {
    await page.evaluate(({ w, comp, opp }) => { const C = window.__CPM_CAREER, p = C.snapshot();
      const md = comp === 'cup' ? { matchday: 991, week: w, opponentId: 'b07', opponentName: 'SV Rheinau', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale' }
        : { matchday: comp === 'euro_group' ? 981 : 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: comp, competition: 'UEL', ...(comp === 'euro' ? { euroPhase: 'r16' } : {}) };
      C.patch({ week: w, weekLived: false,
        ...(comp === 'cup' ? { cup: { active: true, round: 1, results: [], bracket: [], eliminated: false } }
          : { euro: { active: true, competition: 'UEL', phase: comp === 'euro' ? 'r16' : 'group', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: comp === 'euro', champion: false, eliminated: false, koResults: [], koRound: 0 } }),
        calendar: [...(p.calendar || []), md] }); }, { w: WE, comp, opp: OPP });
    await sleep(600);
  }
  const prima = await stato(page);
  let azione = '';
  for (let i = 0; i < 5; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
    azione += r + ' '; await sleep(600);
    if ((await page.evaluate(() => window.__CPM_CAREER.snapshot().week)) !== prima.week) break;
  }
  await sleep(900);
  const dopo = await stato(page);
  await ctx.close();
  return { id, comp, azione, prima, dopo, errori, dM: dopo.matches - prima.matches, avanzata: dopo.week === prima.week + 1 };
}

const R = [];
for (const comp of ['lega', 'euro_group', 'euro', 'cup']) {
  R.push(await braccio('sano-' + comp, {}, comp));
  R.push(await braccio('svincolato-' + comp, { contractExpired: true }, comp));
}
if (process.env.CPM_JSON === '1') console.log(JSON.stringify({ WE, WL, OPP, R }, null, 1));
const g = (id) => R.find(r => r.id === id);
console.log(`PO-264 · lega W${WL} · gare iniettate in W${WE} (avversario europeo ${OPP.n})${ROSSO ? ' · ROSSO (__CPM_NO_EU264)' : ''}`);
console.log('braccio                presenze  storico  ultima voce');
for (const r of R) console.log(`${r.id.padEnd(22)} ${String(r.prima.matches + '→' + r.dopo.matches).padEnd(9)} ${String(r.prima.histN + '→' + r.dopo.histN).padEnd(8)} ${JSON.stringify(r.dopo.ultima)}  [${r.azione.trim().slice(0, 30)}]`);

for (const r of R) { ok(r.avanzata, `${r.id}: la settimana avanza (misura non cieca)`); ok(!r.errori.length, `${r.id}: nessun errore di pagina ${r.errori.join(' | ')}`);
  ok(r.dopo.histN === r.prima.histN + 1, `${r.id}: una voce di storico scritta`); }
const tipo = { lega: (u) => !u.euro && !u.cup, euro_group: (u) => u.euro && !u.ko, euro: (u) => u.euro && u.ko === 'r16', cup: (u) => u.cup };
for (const comp of ['lega', 'euro_group', 'euro', 'cup']) {
  const s = g('sano-' + comp), v = g('svincolato-' + comp), us = s.dopo.ultima || {}, uv = v.dopo.ultima || {};
  ok(tipo[comp](us) && typeof us.rating === 'number' && s.dM === 1, `${comp}, sano: voce della competizione col voto e presenza (controllo)`);
  ok(tipo[comp](uv), `${comp}, svincolato: la voce e' della competizione giusta (misura non cieca)`);
  ok(uv.svinc === true && uv.rating == null, `${comp}, svincolato: voce marcata «svincolato», voto nullo (era ${JSON.stringify(uv.rating)})`);
  ok(v.dM === 0 && uv.goals === 0 && uv.assists === 0, `${comp}, svincolato: nessuna presenza, gol o assist`);
}
console.log(righe.join('\n'));
console.log(guasti.length ? `\n✗ ROSSO svincolato-264: ${guasti.length} controlli falliti` : '\n✅ VERDE svincolato-264');
await browser.close(); srv.close();
process.exit(guasti.length ? 1 : 0);
