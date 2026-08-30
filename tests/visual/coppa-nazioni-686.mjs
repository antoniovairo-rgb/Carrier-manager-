/* [7.686.0 GUARDIANO] IL TROFEO DELLA COPPA DELLE NAZIONI SI ALZA UNA VOLTA SOLA, E IN FINALE.
   COLLAUDO PO con due screenshot: «ho vinto la coppa alla 3a giornata e poi dopo c'e' la finale da
   giocare, brutto bug!» e, la sera dopo, la stessa coppa alzata di nuovo in finale ai rigori. Il PO
   ha vinto DUE volte lo stesso trofeo nella stessa edizione.
   CAUSA: due regole scritte in momenti diversi che non si conoscevano. La coda del torneo viene estesa
   con una FINALE quando il girone chiude con 4+ punti (7.41), ma la cerimonia scattava a «ultima gara
   del girone con 7+ punti» — la regola vecchia, di quando il torneo finiva col girone. Con tre vittorie
   sono nove punti: finale in calendario E trofeo alzato.
   Qui si asserisce la regola su una coda qualsiasi, e la PROVA DEL ROSSO (`__CPM_NO686`) ripristina la
   regola vecchia e PRETENDE che il test veda il difetto: se non lo vede, non sta guardando niente. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
/* ⚠️ `__CPM_CAREER` si arma solo a CARRIERA AVVIATA: aprire la pagina nuda non basta (misurato:
   timeout). Si parte da un salvataggio, come fa actor-diag. */
const SAVE = { phase: 'career', player: { name: 'NatCup Probe', nation: 'Spagna', avatarId: 7, proStatus: 'pro', season: 10, week: 21, weekLived: true, age: 26, ovr: 82, tutorialDone: true,
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 12 } } };
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const CASI = [
  { nome: 'girone finito, 6 punti, finale ancora da giocare', q: { matchIdx: 2, opponents: ['A', 'B', 'C'], pts: 6, isFinal: false }, atteso: false },
  { nome: 'girone finito, 9 punti (tre vittorie) — il caso del PO', q: { matchIdx: 2, opponents: ['A', 'B', 'C'], pts: 9, isFinal: false }, atteso: false },
  { nome: 'girone a meta', q: { matchIdx: 1, opponents: ['A', 'B', 'C'], pts: 3, isFinal: false }, atteso: false },
  { nome: 'FINALE, ultima gara della coda', q: { matchIdx: 3, opponents: ['A', 'B', 'C', 'F'], pts: 9, isFinal: true }, atteso: true },
  { nome: 'coda estesa ma non ancora alla finale', q: { matchIdx: 2, opponents: ['A', 'B', 'C', 'F'], pts: 9, isFinal: true }, atteso: false },
];
async function giro(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(([r, sv]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO686 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (_e) {} }, [rosso, SAVE]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r2 = document.getElementById('root'); return r2 && r2.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (_e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.natCupStake), null, { timeout: 30000 });
  const out = [];
  for (const c of CASI) out.push({ ...c, avuto: await page.evaluate(q => window.__CPM_CAREER.natCupStake(q), c.q) });
  await ctx.close();
  return out;
}
console.log('\n=== IL TROFEO DELLA COPPA DELLE NAZIONI SI ALZA SOLO IN FINALE ===\n');
/* FASE A — prova del rosso: con la regola vecchia il difetto DEVE comparire */
const rosso = await giro(true);
const visto = rosso.filter(r => r.avuto !== r.atteso);
console.log(`  FASE A (regola vecchia, __CPM_NO686): differenze viste ${visto.length}`);
for (const r of visto) console.log(`    · ${r.nome} → trofeo ${r.avuto} (atteso ${r.atteso})`);
if (!visto.length) { console.log('\n❌ FAIL — lo strumento NON vede il difetto con la regola vecchia: non sta guardando niente.\n'); await b.close(); srv.close(); process.exit(1); }
/* FASE B — verde: con la regola nuova ogni caso deve tornare */
const verde = await giro(false);
let ko = 0;
for (const r of verde) { const ok = r.avuto === r.atteso; if (!ok) ko++; console.log(`  ${ok ? '✅' : '❌'} ${r.nome} → trofeo ${r.avuto} (atteso ${r.atteso})`); }
await b.close(); srv.close();
console.log(ko ? `\n❌ FAIL — ${ko} caso/i fuori regola.\n` : '\n✅ PASS — il trofeo si alza una volta sola, e solo vincendo la finale.\n');
process.exit(ko ? 1 : 0);
