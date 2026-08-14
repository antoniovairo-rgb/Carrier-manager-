#!/usr/bin/env node
/* GUARDIANO — «LE CONVERSAZIONI SONO MOLTO RIPETITIVE CON IL MISTER» (verifica trimestrale).

   PERCHE' NON ERA MISURABILE. La selezione della verifica trimestrale stava IN LINEA dentro l'handler
   della settimana: per giudicarla si poteva solo giocare e dire «sembra ripetitivo». Dal 7.472 e' una
   funzione pura (`pickCoachReview`) usata dall'handler VERO, e la sonda `coachReviewSeq` la fa girare
   N volte di fila intrecciando la memoria esattamente come fa il gioco — cioe' restituisce quello che
   il giocatore legge nell'arco di piu' stagioni, non un campione singolo.

   COSA MISURA, su 16 verifiche = QUATTRO STAGIONI di gioco (W8/16/24/32 per stagione):
     · quante battute DISTINTE del mister si sono viste
     · la distanza minima fra due occorrenze della stessa battuta (in numero di verifiche)
     · quante risposte distinte sono state offerte

   SOGLIE: con 14 battute per fascia, quattro stagioni non devono mostrarne meno di 13 distinte e
   nessuna ripetizione a meno di 13 verifiche di distanza. Prima del 7.472 la memoria era piu' corta
   del pool (10 su 14) e la battuta si estraeva con `pick` casuale sul residuo: la ripetizione tornava
   entro poche verifiche.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node coach-review-variety-test.mjs [--verbose]        */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const N = +(process.env.CPM_N || 16);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const save = { phase: 'career', player: {
  name: 'Probe Mister', nation: 'Italia', avatarId: 1, proStatus: 'pro', season: 3, week: 8, age: 24, ovr: 79,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true,
  seasonPledge: { season: 3, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 78, 'mentalità': 80, tiro: 81, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 84, morale: 85, fatigue: 15, coachTrust: 72, popularity: 60, value: 20, bankBalance: 90000,
  history: [{ season: 2, club: 'FC Salernum', clubId: 'sal', goals: 12, assists: 5, matches: 32, ovr: 77, league: 'Lega A' }],
  matchHistory: [{ won: true, drew: false, rating: 7.4, goals: 1, assists: 0 }],
  contract: { duration: 3, wage: 30000, expiresAtSeason: 6 } } };
await page.addInitScript(sv => { window.__CPM_GLB = false; if (sv.__no472) window.__CPM_NO472 = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, { ...save, __no472: !!process.env.CPM_NO472 });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await sleep(1200);
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.coachReviewSeq), { timeout: 30000 });
const seq = await page.evaluate(n => window.__CPM_CAREER.coachReviewSeq(n), N);
const guasti2 = [];
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.coachWeekSeq), { timeout: 30000 });
const wk = await page.evaluate(n => window.__CPM_CAREER.coachWeekSeq(n), 20);
await b.close(); srv.close();

/* (2) LA VOCE SETTIMANALE — la battuta piu' esposta di tutto il gioco: si legge UNA VOLTA A SETTIMANA.
   Si sceglieva con `hash(stagione|settimana) % 7`, cioe' un'estrazione CON REIMMISSIONE: sette frasi
   pescate a caso si ripetono in media ogni sette e nulla vieta la stessa due settimane di fila. Ora
   l'ordine e' una permutazione seedata percorsa sull'asse delle settimane: dentro una fascia si
   esauriscono tutte prima di rivederne una. */
if (Array.isArray(wk) && wk.length) {
  const ms = wk.map(r => r.m).filter(Boolean);
  const dist = new Set(ms).size;
  let gap = 99, consec = 0; const seen = {};
  ms.forEach((m, i) => { if (seen[m] != null && i - seen[m] < gap) gap = i - seen[m]; if (i && ms[i - 1] === m) consec++; seen[m] = i; });
  if (VERB) wk.forEach((r, i) => console.log(`  W.${String(r.w).padStart(2)} · ${(r.m || '').slice(0, 62)}`));
  console.log(`\n=== voce settimanale del mister · ${ms.length} settimane consecutive ===`);
  console.log(`frasi distinte: ${dist} · distanza minima fra due repliche: ${gap === 99 ? 'nessuna' : gap} · repliche consecutive: ${consec}`);
  if (dist < 7) guasti2.push(`solo ${dist} frasi distinte in ${ms.length} settimane`);
  if (gap !== 99 && gap < 7) guasti2.push(`una frase settimanale torna dopo ${gap} settimane`);
  if (consec) guasti2.push(`${consec} volte la stessa frase due settimane di fila`);
} else guasti2.push('sonda coachWeekSeq non disponibile: ' + JSON.stringify(wk));

if (!Array.isArray(seq)) { console.log('❌ sonda non disponibile: ' + seq); process.exit(2); }
const lines = seq.map(r => r.line);
const distinte = new Set(lines).size;
let minGap = 99; const last = {};
lines.forEach((l, i) => { if (last[l] != null && i - last[l] < minGap) minGap = i - last[l]; last[l] = i; });
const risp = new Set(seq.flatMap(r => r.ch)).size;
if (VERB) seq.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)} S.${r.s} W.${r.w} · ${r.line.slice(0, 62)}`));
console.log(`\n=== ${seq.length} verifiche trimestrali (${Math.round(seq.length / 4)} stagioni) ===`);
console.log(`battute distinte del mister : ${distinte}/${seq.length}`);
console.log(`distanza minima fra due repliche della stessa battuta: ${minGap === 99 ? 'nessuna ripetizione' : minGap + ' verifiche'}`);
console.log(`risposte distinte offerte    : ${risp}`);
const guasti = [];
if (distinte < 13) guasti.push(`solo ${distinte} battute distinte in ${seq.length} verifiche`);
if (minGap !== 99 && minGap < 13) guasti.push(`una battuta torna dopo ${minGap} verifiche`);
if (risp < 8) guasti.push(`solo ${risp} risposte distinte offerte in ${seq.length} verifiche`);
guasti.push(...guasti2);
if (guasti.length) { console.log('\n❌ FAIL'); for (const g of guasti) console.log('  · ' + g); process.exit(1); }
console.log('\n✅ PASS — il mister esaurisce il repertorio prima di ripetersi');
