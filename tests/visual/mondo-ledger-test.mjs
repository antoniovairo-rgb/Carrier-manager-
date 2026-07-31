#!/usr/bin/env node
/* [7.270.0 P2+P4] GUARDIANO di «Il mondo ti attraversa» e «Il conto delle parole».
   P2 chiude il difetto: rivale, ex compagni, ex club e CT esistono nel salvataggio e vivono la loro
   stagione, ma incrociavano il giocatore solo dentro i novanta minuti. P4: il ledger registrava promesse
   e torti dal 7.26.0 senza quasi mai riscuoterli.
   Asserzioni: (1) la voce del rivale usa i NUMERI veri (i suoi e i tuoi); (2) l'ex compagno ha un nome
   REALE della rosa di quel club, non inventato; (3) l'ex club è raccontato con la sua posizione VERA;
   (4) una sola voce a settimana e mai due settimane di fila; (5) il ledger si riscuote solo dopo ≥6
   settimane, col verdetto derivato dai fatti successivi, e la voce si marca `done` (non si ripete).
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node mondo-ledger-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const club = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const lg = (w, o = {}) => ({ week: w, opponent: 'FC Rivale', goals: 0, assists: 0, rating: 6.6, won: false, ...o });
const mk = (x = {}) => ({ phase: 'career', player: {
  name: 'Mondo Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 5, week: 14, age: 26, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 5, presidentModalSeason: 5, drawSeen: 5, coachPactSeason: 5,
  seasonPledge: { season: 5, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 70, teamChemistry: 60,
  club, stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 30, popularity: 45, nationalCaps: 0, serialDone: { disciplina: 5, giovane: 5, bomber: 5 }, serialSeenSeason: 5,
  contract: { duration: 3, wage: 9000, expiresAtSeason: 9 }, ...x } });
const boot = async (save) => {
  const pg = await browser.newPage({ viewport: { width: 480, height: 1500 } });
  await installCdnRoutes(pg);
  pg.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await pg.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1000);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1100);
  return pg;
};
const txt = (pg) => pg.evaluate(() => document.body.innerText);
const getP = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
/* la voce del mondo è seedata fra le candidate: si sonda su più settimane finché non esce quella cercata */
const cerca = async (extra, rx, weeks) => {
  for (const w of weeks) {
    const pg = await boot(mk({ ...extra, week: w }));
    const t = await txt(pg); await pg.close();
    if (rx.test(t)) return { ok: true, t, w };
  }
  return { ok: false, t: '' };
};

const RIVAL = { name: 'Federico López', ovr: 80, age: 26, seasons: 5, goals: 4, totalGoals: 55, trophies: 1,
  relationship: 'rivale', awards: { palloneOros: [] }, club: { id: 'bar', n: 'FC Catalunya', p: 92, lg: 'Liga Ibérica' } };
const GOALS10 = Array.from({ length: 10 }, (_, i) => lg(3 + i, { goals: 1 }));

// ───── (1) la voce del rivale porta i NUMERI veri ─────
{
  const r = await cerca({ rival: RIVAL, matchHistory: GOALS10 }, /parla di te/i, [14,15,16,17,18,19,20,21]);
  console.log('(1) il rivale parla di te:', r.ok);
  if (!r.ok) issues.push('la voce del rivale non compare mai in cinque settimane sondate');
  else {
    const nums = /10/.test(r.t) && /\b4\b/.test(r.t);   // 10 gol tuoi di lega · 4 suoi
    console.log('    numeri veri (10 tuoi · 4 suoi):', nums);
    if (!nums) issues.push('la voce del rivale non usa i numeri reali della stagione');
  }
}

// ───── (2) l'ex compagno ha un nome REALE della rosa di quel club ─────
{
  const r = await cerca({ history: [{ season: 3, club: 'FC Salento', clubId: 'lec' }], matchHistory: GOALS10 }, /Ti chiama /i, [14,15,16,17,18,19,20,21,22,23]);
  console.log('(2) chiamata di un ex compagno:', r.ok);
  if (!r.ok) issues.push('la chiamata dell\'ex compagno non compare mai');
  else {
    const nome = (r.t.match(/Ti chiama ([A-ZÀ-Ù][^\n]{2,30})/) || [])[1] || '';
    const vero = await (async () => {
      const pg = await boot(mk({ history: [{ season: 3, club: 'FC Salento', clubId: 'lec' }] }));
      const roster = await pg.evaluate(() => { try { const c = CLUBS.find(x => x.id === 'lec'); return generateTeamRoster(c, 5).map(r => r.name); } catch (e) { return []; } });
      await pg.close(); return roster.includes(nome.trim());
    })();
    console.log('    nome «' + nome.trim() + '» presente nella rosa vera del club:', vero);
    if (!vero) issues.push('il nome dell\'ex compagno non viene dalla rosa reale di quel club');
    if (!/FC Salento/.test(r.t)) issues.push('la chiamata non nomina il club di provenienza');
  }
}

// ───── (3) l'ex club è raccontato con la posizione VERA ─────
{
  const st = Array.from({ length: 18 }, (_, q) => ({ id: q === 1 ? 'lec' : (q === 5 ? 'b04' : 'c' + q), n: q === 1 ? 'FC Salento' : (q === 5 ? 'FC Werkstadt' : 'C' + q), pts: 50 - q * 2, gf: 20, ga: 12 }));
  const r = await cerca({ history: [{ season: 3, club: 'FC Salento', clubId: 'lec' }], standings: st, matchHistory: GOALS10 }, /FC Salento vola|Il FC Salento vola/i, [14,15,16,17,18,19,20,21,22,23]);
  console.log('(3) l\'ex club raccontato dalla classifica vera:', r.ok, r.ok ? '(2° posto)' : '');
  if (!r.ok) issues.push('l\'ex club in zona alta non produce nessuna voce');
  else if (!/2°/.test(r.t)) issues.push('la voce sull\'ex club non riporta la posizione reale');
}

// ───── (4) una voce alla volta, mai due settimane di fila ─────
{
  const pg = await boot(mk({ rival: RIVAL, matchHistory: GOALS10, worldSeen: { s: 5, w: 13, k: [] } }));
  const t = await txt(pg);
  console.log('(4) cooldown rispettato (nessuna voce a una settimana dall\'ultima):', !/Il mondo fuori/i.test(t));
  if (/Il mondo fuori/i.test(t)) issues.push('la voce esce a una sola settimana dalla precedente: manca il cooldown');
  await pg.close();
}

// ───── (5) il ledger si riscuote solo dopo ≥6 settimane, e una volta sola ─────
{
  const fresco = await boot(mk({ ledger: [{ t: 'patto', who: 'il mister', what: '4 gol in 5 gare di lega', season: 5, week: 12 }], matchHistory: GOALS10 }));
  const t0 = await txt(fresco);
  console.log('(5a) promessa di 2 settimane fa: non ancora riscossa:', !/Il conto delle parole/i.test(t0));
  if (/Il conto delle parole/i.test(t0)) issues.push('il ledger si riscuote troppo presto (meno di 6 settimane)');
  await fresco.close();

  const pg = await boot(mk({ week: 20, ledger: [{ t: 'patto', who: 'il mister', what: '4 gol in 5 gare di lega', season: 5, week: 5 }], matchHistory: GOALS10 }));
  const t1 = await txt(pg);
  const esce = /Il conto delle parole/i.test(t1);
  const bene = /Le parole hanno retto/i.test(t1);
  console.log('(5b) riscossa dopo 15 settimane:', esce, '· verdetto positivo dai fatti (10 gol):', bene);
  if (!esce) issues.push('il ledger non viene mai riscosso');
  if (!bene) issues.push('con 10 gol dopo la promessa il verdetto dovrebbe essere positivo');
  if (!/il mister/i.test(t1)) issues.push('la riscossione non nomina chi se l\'era segnata');
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /stretta di mano|Prendere nota/i.test(x.textContent || '') && x.offsetParent !== null); if (b) b.click(); });
  await sleep(900);
  const p = await getP(pg);
  const done = (p.ledger || []).every(l => l.done);
  console.log('(5c) voce marcata done (non si ripete):', done);
  if (!done) issues.push('la voce del ledger non viene marcata: tornerebbe ogni settimana');
  const t2 = await txt(pg);
  if (/Il conto delle parole/i.test(t2)) issues.push('la riscossione resta a schermo dopo essere stata chiusa');
  await pg.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ MONDO + LEDGER OK (voci dai dati veri · una alla volta · le parole tornano indietro una volta sola)');
