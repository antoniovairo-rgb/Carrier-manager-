#!/usr/bin/env node
/* [giro 56 — PO-279 «Cambia statistiche ad ogni partita altrimenti è ripetitivo e devono essere più interessanti, ad esempio 10 gol,
   4 assist, 100 presenze, gioca con la sua ex squadra dove ha collezionato 20 gol in 50 presenze»] GUARDIANO del riquadro d'inizio
   partita. Carriera VERA: gli handler di __CPM_CAREER (step → liveCurrentWeek/simulateAndAdvance) giocano CPM_PARTITE279 (20) partite
   da un salvataggio con una ex squadra nella stessa lega e totali vicini a traguardi tondi. Prima di ogni partita si legge il
   salvataggio (localStorage) e si chiedono al gioco le schede (__CPM_STAT279.schede, la stessa funzione del riquadro).
   Misura: frase di testa (la prima scheda, quella che si vede per prima) — quante distinte, quante ripetute nelle ultime 3 partite,
   quante volte esce «Il punto forte». Coerenza: ogni numero di ogni fatto si RICALCOLA qui dal salvataggio, con codice indipendente.
   GIUDIZIO (CPM_GIUDICA=1 o --guardiano): testa distinta >= CPM_VAR_MIN (0,7) · 0 teste uguali nelle ultime 3 · 0 numeri incoerenti ·
   almeno un fatto forte (ex squadra o traguardo) in testa · «punto forte» mai in testa.
   Rosso: CPM_ROSSO=__CPM_NO_STAT279 (schede del giro 20).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stat-279.mjs --guardiano */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

if (process.argv.includes('--guardiano')) process.env.CPM_GIUDICA = '1';
const N = +(process.env.CPM_PARTITE279 || 20), VAR_MIN = +(process.env.CPM_VAR_MIN || 0.7), ROSSO = process.env.CPM_ROSSO || '';
const EX = 'FC Goldwald';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(([r, ex]) => {
  window.__CPM_GLB = false; if (r) String(r).split(',').forEach(k => { window[k.trim()] = 1; });
  if (localStorage.getItem('cpm-v3')) return; /* solo al primo caricamento */
  const save = { phase: 'career', player: { name: 'Marco Vairo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 78, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 89, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 74, 'mentalità': 76, tiro: 80, passaggio: 75, dribbling: 77, posizionamento: 93 },
    form: 74, morale: 72, fatigue: 10, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 },
    goals: 0, assists: 0, matches: 0, totalGoals: 97, totalAssists: 48, totalMatches: 98,
    history: [{ season: 1, club: ex, clubId: 'bvb', goals: 12, assists: 4, matches: 30, ovr: 70 }, { season: 2, club: ex, clubId: 'bvb', goals: 8, assists: 5, matches: 20, ovr: 73 },
      { season: 3, club: 'FC Werkstadt', clubId: 'b04', goals: 15, assists: 9, matches: 34, ovr: 76 }] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, [ROSSO, EX]);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER && !!window.__CPM_STAT279, { timeout: 30000 });
await sleep(1200);

const leggi = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')).player; } catch (e) { return null; } });

/* ---- ricalcolo INDIPENDENTE dei numeri di ogni fatto, dal salvataggio prima della partita ---- */
const MIL = { gol: [10, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500], ass: [10, 25, 50, 75, 100, 150, 200, 250, 300], pres: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500], stag: [10, 20, 30, 40, 50] };
const r1 = x => Math.round(x * 10) / 10;
function atteso(k, P, on) {
  const sum = (a, f) => a.reduce((s, h) => s + (Number(h[f]) || 0), 0);
  const pres = (P.matchHistory || []).filter(h => h && !h.injured && !h.svincolato);
  const nx = (L, v) => { for (const m of L) if (m > v) return m; return null; };
  const me = P.club.n || P.club.name;
  switch (k) {
    case 'ex': { const r = (P.history || []).filter(h => h.club === on); const a = sum(r, 'assists'); return [sum(r, 'goals'), ...(a ? [a] : []), sum(r, 'matches')]; }
    case 'trag_gol': { const T = nx(MIL.gol, P.totalGoals || 0); return [T - (P.totalGoals || 0), T, P.totalGoals || 0]; }
    case 'trag_pres': { const T = nx(MIL.pres, P.totalMatches || 0); return [T, P.totalMatches || 0]; }
    case 'trag_ass': { const T = nx(MIL.ass, P.totalAssists || 0); return [T - (P.totalAssists || 0), T, P.totalAssists || 0]; }
    case 'trag_stag': { const T = nx(MIL.stag, P.goals || 0); return [T - (P.goals || 0), T, P.goals || 0, P.matches || 0]; }
    case 'striscia': { let s = 0, g = 0; for (let i = pres.length - 1; i >= 0; i--) { if (!(pres[i].goals > 0)) break; s++; g += pres[i].goals; } return [s, g]; }
    case 'digiuno': { let z = 0; for (let i = pres.length - 1; i >= 0; i--) { if (pres[i].goals > 0) break; z++; } return [z]; }
    case 'andata': { const h = pres.filter(x => x.opponent === on); const g = sum(h, 'goals'), a = sum(h, 'assists'); return [...(g ? [g] : []), ...(a ? [a] : []), r1(h[0].rating)]; }
    case 'avversario': { const h = pres.filter(x => x.opponent === on); const a = sum(h, 'assists'); return [sum(h, 'goals'), ...(a ? [a] : []), h.length]; }
    case 'nazionale': return [P.nationalGoals || 0, P.nationalCaps || 0];
    case 'stagione': return [P.goals || 0, P.assists || 0, P.matches || 0];
    case 'carriera': return [P.totalGoals || 0, P.totalAssists || 0, P.totalMatches || 0];
    case 'club': { const r = (P.history || []).filter(h => h.club === me); return [sum(r, 'goals') + (P.goals || 0), sum(r, 'matches') + (P.matches || 0), r.length + 1]; }
    case 'voto': { const r = pres.filter(h => typeof h.rating === 'number' && h.rating > 0); return [r1(sum(r, 'rating') / r.length), r.length]; }
    case 'ultima': { const r = pres.filter(h => typeof h.rating === 'number' && h.rating > 0); const u = r[r.length - 1]; return [...(u.goals ? [u.goals] : []), ...(u.assists ? [u.assists] : []), r1(u.rating)]; }
  }
  return null;
}
const numeri = s => (String(s).match(/\d+(?:,\d+)?/g) || []).map(x => +x.replace(',', '.'));
const uguali = (a, b) => a && b && a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-9);

const partite = [], incoerenti = []; let iter = 0, prima = await leggi();
while (partite.length < N && iter++ < 600) {
  const res = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
  if (res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(900); await page.evaluate(() => window.__CPM_CAREER.dismiss()); prima = await leggi(); continue; }
  if (res && String(res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (res && String(res).startsWith('error:')) { console.log('errore handler: ' + res); break; }
  await sleep(800); /* l'autosave della carriera e' differito di 600 ms */
  const dopo = await leggi(); if (!dopo) break;
  const a = (prima && prima.matchHistory) || [], b = dopo.matchHistory || [];
  if (b.length > a.length && prima && (prima.season === dopo.season)) {
    const e = b[a.length]; const ctx = e.cup ? 'cup' : e.euro ? 'euro_group' : 'career';
    const r = await page.evaluate(([P, on, c]) => ({ schede: window.__CPM_STAT279.schede(P, on, c), scelta: window.__CPM_STAT279.scegli(P, { n: on }, c) }), [prima, e.opponent, ctx]);
    const testa = r.schede[0] ? r.schede[0].t + ' · ' + r.schede[0].v : '(vuoto)';
    if (!ROSSO) for (const f of r.scelta) {
      const exp = atteso(f.k, prima, e.opponent), inT = numeri(f.t + ' ' + f.v);
      const ko = !exp ? 'tipo sconosciuto' : !uguali(f.n, exp) ? `numeri ${JSON.stringify(f.n)} ≠ salvataggio ${JSON.stringify(exp)}` : inT.some(x => !f.n.some(y => Math.abs(x - y) < 1e-9)) ? `nel testo un numero fuori dai dati (${inT})` : '';
      if (ko) incoerenti.push(`partita ${partite.length + 1} [${f.k}] «${f.t} · ${f.v}»: ${ko}`);
    }
    partite.push({ n: partite.length + 1, s: prima.season, w: prima.week, opp: e.opponent, testa, k: r.schede[0] && r.schede[0].k, deck: r.schede.map(x => x.t + ' · ' + x.v), fatti: r.scelta.length });
  }
  prima = dopo;
}
await browser.close(); srv.close();

const teste = partite.map(p => p.testa);
const distinte = new Set(teste).size, rip3 = teste.filter((t, i) => teste.slice(Math.max(0, i - 3), i).includes(t)).length;
const pfTesta = teste.filter(t => /punto forte/i.test(t)).length;
const pfDeck = partite.filter(p => p.deck.some(d => /punto forte/i.test(d))).length;
const pfUguali = (() => { const c = {}; partite.forEach(p => p.deck.filter(d => /punto forte/i.test(d)).forEach(d => { c[d] = (c[d] || 0) + 1; })); return Math.max(0, ...Object.values(c)); })();
const forti = partite.filter(p => /^(ex|trag_)/.test(p.k || '')).length;
partite.forEach(p => console.log(`#${String(p.n).padStart(2)} S${p.s}W${String(p.w).padStart(2)} vs ${p.opp.padEnd(18)} [${(p.k || '-').padEnd(10)}] ${p.testa}`));
console.log(`STAT-279 ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'} · partite ${partite.length} · teste distinte ${distinte}/${partite.length} · ripetute nelle ultime 3: ${rip3} · «punto forte» in testa ${pfTesta}, nel riquadro ${pfDeck} (stessa frase fino a ${pfUguali} volte) · fatti forti in testa ${forti} · numeri incoerenti ${incoerenti.length} · pageerror ${errors.length}`);
incoerenti.slice(0, 8).forEach(x => console.log('  ✗ ' + x));
try { const d = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'stat-279'); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, ROSSO ? 'rosso.json' : 'verde.json'), JSON.stringify({ partite, incoerenti }, null, 1)); } catch (e) {}
if (process.env.CPM_GIUDICA) {
  const ko = [];
  if (partite.length < N) ko.push(`solo ${partite.length}/${N} partite misurate`);
  if (distinte / Math.max(1, partite.length) < VAR_MIN) ko.push(`varietà ${distinte}/${partite.length} < ${VAR_MIN}`);
  if (rip3) ko.push(`${rip3} frasi di testa ripetute nelle ultime 3 partite`);
  if (incoerenti.length) ko.push(`${incoerenti.length} numeri non coerenti col salvataggio`);
  if (!forti) ko.push('nessun fatto forte (ex squadra/traguardo) in testa');
  if (pfTesta) ko.push(`«punto forte» in testa ${pfTesta} volte`);
  if (errors.length) ko.push('pageerror: ' + errors[0]);
  console.log(ko.length ? '❌ STAT-279 FAIL — ' + ko.join(' · ') : '✅ STAT-279 OK');
  process.exit(ko.length ? 1 : 0);
}
