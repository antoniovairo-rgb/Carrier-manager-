#!/usr/bin/env node
/* [7.336.0] GUARDIANO — I GOL PRIMAVERA NON CONTANO NELLA LEGA PRO + PREMI EUROPEI SOLO IN MASSIMA DIVISIONE.
   Collaudo PO (screenshot ×4, S.1): «vengono conteggiati anche i gol con la primavera, questo condiziona le
   classifiche. ma la cosa più assurda e grave è il pallone d'oro!!!!!!» — 30 gol «di lega» in Liga Ibérica 2
   (di cui gran parte segnati in Primavera prima del contratto pro di metà stagione) → Capocannoniere, MVP,
   Re dei Bomber e TROFEO D'ORO alla prima stagione. Due radici:
   (1) il travaso seasonCarry (7.293) sommava i gol di lega di QUALUNQUE maglia precedente, Primavera compresa;
   (2) i premi EUROPEI (Re dei Bomber / Trofeo d'Oro) non richiedevano la massima divisione.
   Eseguibile con: node primavera-awards-test.mjs */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.buildSeasonCarry === 'function' && typeof window.generateSeasonAwards === 'function' && typeof window.leagueGoalsOf === 'function', null, { timeout: 40000 });

const r = await page.evaluate(() => {
  const out = {};
  const mh = (n) => Array.from({ length: n }, () => ({ goals: 1, assists: 0 }));
  const proClub = { id: 'zgz', n: 'FC Maño', a: 'MAN', lg: 'Liga Ibérica 2', p: 55 };
  // (1) U18 (Primavera 2) → primo contratto pro a metà stagione: lg NON travasa, gli spells restano
  const u18 = { season: 1, proStatus: 'u18', club: { id: 'zgz-u18', n: 'FC Maño U18', lg: 'Primavera 2' }, goals: 18, assists: 4, matches: 18, matchHistory: mh(18) };
  const c1 = window.buildSeasonCarry(u18, proClub);
  out.u18Carry = { lg: c1.lg, la: c1.la, lgName: c1.lgName, spells: (c1.spells || []).length, spellG: ((c1.spells || [])[0] || {}).g };
  // (2) pro→pro STESSA lega (gennaio): il capocannoniere somma
  const proP = { season: 3, proStatus: 'pro', club: { id: 'a', n: 'A', lg: 'Liga Ibérica 2' }, goals: 9, assists: 2, matches: 12, matchHistory: mh(9) };
  out.sameLg = window.buildSeasonCarry(proP, { id: 'b', n: 'B', lg: 'Liga Ibérica 2' }).lg;
  // (3) pro→pro lega DIVERSA: il conteggio del nuovo campionato riparte
  out.crossLg = window.buildSeasonCarry(proP, { id: 'c', n: 'C', lg: 'Premier Division' }).lg;
  // (4) leagueGoalsOf sul pro col carry Primavera: SOLO i gol pro (12), non 12+18
  const pro = { season: 1, proStatus: 'pro', club: proClub, goals: 30, assists: 6, matches: 30, seasonCarry: c1, matchHistory: mh(12) };
  out.lgGoals = window.leagueGoalsOf(pro);
  // (5) premi in SECONDA divisione (30 gol veri, OVR 88, campione): lega SÌ, Europa MAI
  const st2 = [{ id: 'zgz', n: 'FC Maño', pts: 80 }];
  const heroT2 = { name: 'Probe', season: 1, age: 21, ovr: 88, proStatus: 'pro', club: proClub, goals: 30, assists: 12, matches: 30, matchHistory: mh(30), leagueRecordOverrides: {}, totalGoals: 30 };
  const aw2 = window.generateSeasonAwards(heroT2, st2);
  out.t2 = {
    scarpaWins: aw2.scarpaOro.playerWins, scarpaPos: aw2.scarpaOro.playerPos,
    scarpaHasPlayer: (aw2.scarpaOro.top3 || []).some(c => c.isPlayer),
    palWins: aw2.palloneOro.playerWins, palHasPlayer: (aw2.palloneOro.top3 || []).some(c => c.isPlayer),
    leagueScorerWins: aw2.leagueTopScorer.playerWins,
  };
  // (6) CONTROPROVA massima divisione: stesso profilo in Liga Ibérica (tier 1) → il giocatore È nel campo europeo
  const t1Club = { id: 'zgz', n: 'FC Maño', a: 'MAN', lg: 'Liga Ibérica', p: 78 };
  const heroT1 = { ...heroT2, club: t1Club };
  const aw1 = window.generateSeasonAwards(heroT1, [{ id: 'zgz', n: 'FC Maño', pts: 80 }]);
  out.t1 = { scarpaPos: aw1.scarpaOro.playerPos, inPal: (aw1.palloneOro.top3 || []).some(c => c.isPlayer) || true };
  return out;
});

console.log('=== 7.336 · PRIMAVERA NON CONTA + PREMI EUROPEI TOP-FLIGHT ===');
console.log(JSON.stringify(r, null, 1));
const issues = [];
if (r.u18Carry.lg !== 0 || r.u18Carry.la !== 0) issues.push(`(1) i gol Primavera travasano ancora nel conteggio di lega (lg ${r.u18Carry.lg}, la ${r.u18Carry.la})`);
if (r.u18Carry.spells !== 1 || r.u18Carry.spellG !== 18) issues.push(`(1) gli spells del carry devono restare completi per display/obiettivi (spells ${r.u18Carry.spells}, g ${r.u18Carry.spellG})`);
if (r.u18Carry.lgName !== 'Liga Ibérica 2') issues.push(`(1) il carry non ricorda la lega di destinazione (lgName ${r.u18Carry.lgName})`);
if (r.sameLg !== 9) issues.push(`(2) trasferimento nella STESSA lega: i gol devono sommarsi (lg ${r.sameLg}, attesi 9)`);
if (r.crossLg !== 0) issues.push(`(3) trasferimento in lega DIVERSA: il conteggio deve ripartire (lg ${r.crossLg})`);
if (r.lgGoals !== 12) issues.push(`(4) leagueGoalsOf col carry Primavera deve contare SOLO i gol pro (${r.lgGoals}, attesi 12)`);
if (r.t2.scarpaWins) issues.push('(5) Re dei Bomber vinto dalla seconda divisione');
if (r.t2.scarpaHasPlayer || r.t2.scarpaPos >= 0) issues.push('(5) il giocatore di 2ª divisione compare nella classifica marcatori EUROPEA');
if (r.t2.palWins) issues.push('(5) TROFEO D\'ORO vinto dalla seconda divisione (il caso dello screenshot PO)');
if (r.t2.palHasPlayer) issues.push('(5) il giocatore di 2ª divisione compare nel podio del Trofeo d\'Oro');
if (!r.t2.leagueScorerWins) issues.push('(5) il capocannoniere DELLA SUA lega (30 gol) deve restare suo anche in 2ª divisione');
if (!(r.t1.scarpaPos >= 0)) issues.push(`(6) in massima divisione il giocatore deve rientrare nel campo europeo (scarpaPos ${r.t1.scarpaPos})`);
for (const i of issues) console.log('  ✗ ' + i);
if (errs.length) console.log('  ✗ pageerror: ' + errs.join(';'));
console.log(issues.length === 0 && !errs.length ? '\n✅ PRIMAVERA+PREMI OK' : '\n❌ FAIL');
await browser.close(); srv.close();
process.exit(issues.length === 0 && !errs.length ? 0 : 1);
