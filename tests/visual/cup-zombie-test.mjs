/* [6.79.0] COPPA ZOMBIE — regressione del loop «ricompare la finale di coppa / giornata di lega in loop»
   (collaudo PO S.14): uno stato corrotto (cup.active con round>4 e champion=false, classe pre-6.74) faceva
   rischedulare la FINALE a ogni mount e la voce pendente teneva in ostaggio l'avanzamento settimana.
   Verifica su window.__CPM_MIGRATE (migratePlayer):
   [A] zombie round>4 con finale VINTA nei results → cup chiusa da CAMPIONE, voci di coppa non giocate rimosse;
   [B] zombie round>4 senza finale vinta → cup chiusa da eliminato, voci rimosse;
   [C] coppa GIÀ chiusa (champion) ma voce di coppa non giocata residua → voce rimossa;
   [D] coppa SANA in corso (round 3, semifinale in calendario) → NULLA cambia (zero regressione);
   [E] la migration è IDEMPOTENTE sul risultato bonificato. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await openMatch(page, port);
await sleep(300);

const res = await page.evaluate(() => {
  const M = window.__CPM_MIGRATE;
  if (typeof M !== 'function') return { err: '__CPM_MIGRATE non esposto' };
  const baseCal = [
    { matchday: 12, week: 28, opponentId: 'x1', opponentName: 'FC Catalunya', isHome: true, played: false, result: null },
    { matchday: 990, week: 28, opponentId: 'x2', opponentName: 'FC Catalunya', isHome: false, played: false, result: null, type: 'cup', cupRound: 4, cupRoundName: 'FINALE' },
  ];
  const mkP = (cup, cal) => ({ name: 'T', proStatus: 'pro', season: 14, week: 28, club: { id: 'cfm', n: 'CF Madrid', lg: 'Liga Ibérica', p: 88 }, stats: { velocità: 80 }, ovr: 86, calendar: cal, standings: [], cup });
  const out = {};
  // [A] zombie con finale vinta
  const a = M(mkP({ active: true, round: 5, champion: false, eliminated: false, results: [{ round: 4, won: true, opponent: 'X' }] }, JSON.parse(JSON.stringify(baseCal))));
  out.A = { changed: a.changed, active: a.player.cup.active, champion: a.player.cup.champion, cupEntries: (a.player.calendar || []).filter(m => m.type === 'cup' && !m.played).length };
  // [B] zombie senza finale vinta
  const b = M(mkP({ active: true, round: 5, champion: false, eliminated: false, results: [{ round: 3, won: true, opponent: 'X' }] }, JSON.parse(JSON.stringify(baseCal))));
  out.B = { active: b.player.cup.active, eliminated: b.player.cup.eliminated, champion: b.player.cup.champion, cupEntries: (b.player.calendar || []).filter(m => m.type === 'cup' && !m.played).length };
  // [C] coppa chiusa da campione ma voce residua
  const c = M(mkP({ active: false, round: 5, champion: true, eliminated: false, results: [{ round: 4, won: true, opponent: 'X' }] }, JSON.parse(JSON.stringify(baseCal))));
  out.C = { cupEntries: (c.player.calendar || []).filter(m => m.type === 'cup' && !m.played).length, leagueEntries: (c.player.calendar || []).filter(m => !m.type && !m.played).length };
  // [D] coppa sana in corso (round 3, semifinale a calendario)
  const dCal = JSON.parse(JSON.stringify(baseCal)); dCal[1] = { ...dCal[1], cupRound: 3, cupRoundName: 'Semifinale' };
  const d = M(mkP({ active: true, round: 3, champion: false, eliminated: false, results: [{ round: 2, won: true, opponent: 'X' }] }, dCal));
  out.D = { active: d.player.cup.active, round: d.player.cup.round, cupEntries: (d.player.calendar || []).filter(m => m.type === 'cup' && !m.played).length };
  // [E] idempotenza sul bonificato
  const e2 = M(JSON.parse(JSON.stringify(a.player)));
  out.E = { cupEntries: (e2.player.calendar || []).filter(m => m.type === 'cup' && !m.played).length, champion: e2.player.cup.champion, active: e2.player.cup.active };
  return out;
});
await browser.close(); srv.close();
if (res.err) { console.error('❌ ' + res.err); process.exit(2); }
console.log(JSON.stringify(res, null, 1));
const issues = [];
if (!(res.A.active === false && res.A.champion === true && res.A.cupEntries === 0)) issues.push('A: zombie con finale vinta non chiuso da campione/non ripulito');
if (!(res.B.active === false && res.B.eliminated === true && res.B.cupEntries === 0)) issues.push('B: zombie senza finale vinta non chiuso');
if (!(res.C.cupEntries === 0 && res.C.leagueEntries === 1)) issues.push('C: voce zombie non rimossa (o lega toccata)');
if (!(res.D.active === true && res.D.round === 3 && res.D.cupEntries === 1)) issues.push('D: coppa sana ALTERATA (regressione!)');
if (!(res.E.cupEntries === 0 && res.E.champion === true && res.E.active === false)) issues.push('E: migration non idempotente');
if (errs.length) issues.push('pageerror: ' + errs[0]);
console.log(issues.length ? '\n❌ FAIL — ' + issues.join(' · ') : '\n✅ PASS — coppa zombie bonificata (campione/eliminato onesti, calendario ripulito), coppa sana intatta, idempotente.');
process.exit(issues.length ? 2 : 0);
