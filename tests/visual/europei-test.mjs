#!/usr/bin/env node
/* GUARDIANO — LA CLASSIFICA EUROPEA CONTA TUTTA LA STAGIONE (7.538.0).
   Collaudo PO (S.7, FC Rotterdam → FC Partenope a stagione in corso): «e i gol con l'altra squadra non li
   conti. errore anche gala della classifica capocannonieri». Verificato sul salvataggio vero: 42 gol in
   stagione, 26 con la maglia precedente. Due numeri DIVERSI, e solo uno era sbagliato:
   · classifica di LEGA A (duello capocannoniere) = 8 → GIUSTO: chi cambia campionato non porta i suoi gol
     nella classifica marcatori del nuovo (invariante 7.336, nata da un collaudo PO precedente);
   · classifica EUROPEA (Re dei Bomber, Trofeo d'Oro) = 8 → SBAGLIATO: in Europa il campo di gara sono tutti
     i campionati, e i 26 gol di prima contano. Deve dire 34.
   Qui si pretendono entrambe le cose insieme, così il rimedio all'una non può rompere l'altra.
   Eseguibile con: node europei-test.mjs */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => typeof window.buildSeasonCarry === 'function' && typeof window.leagueGoalsOf === 'function' && typeof window.euroSeasonGoalsOf === 'function' && typeof window.generateSeasonAwards === 'function', null, { timeout: 40000 });

const r = await page.evaluate(() => {
  const mh = (n, g) => Array.from({ length: n }, (_, i) => ({ goals: i < g ? 1 : 0, assists: 0 }));
  /* la scena del PO: 26 gare e 26 gol di LEGA con l'olandese, poi il trasferimento in Lega A */
  const primo = { season: 7, proStatus: 'pro', club: { id: 'rot', n: 'FC Rotterdam', lg: 'Eredivisie' }, goals: 26, assists: 12, matches: 26, matchHistory: mh(26, 26) };
  const nuovo = { id: 'prt', n: 'FC Partenope', a: 'PRT', lg: 'Lega A', p: 84 };
  const carry = window.buildSeasonCarry(primo, nuovo);
  /* dopo il trasferimento: 8 gol di lega col nuovo club (gli altri in coppa/Europa) */
  const dopo = { name: 'Probe', season: 7, age: 23, ovr: 88, proStatus: 'pro', club: nuovo, goals: 16, assists: 8, matches: 19,
    seasonCarry: carry, matchHistory: mh(11, 8), totalGoals: 100, leagueRecordOverrides: {} };
  const st = [{ id: 'prt', n: 'FC Partenope', pts: 70, gd: 20, gf: 60, played: 11 }, { id: 'x', n: 'Altro', pts: 60, gd: 10, gf: 50, played: 11 }];
  const aw = window.generateSeasonAwards(dopo, st);
  return {
    carryLg: carry.lg, carryLgAll: carry.lgAll, carryLgName: carry.lgName,
    lega: window.leagueGoalsOf(dopo),
    europa: window.euroSeasonGoalsOf(dopo),
    scarpaGoals: aw.scarpaOro.playerGoals,
    /* controprova (invariante 7.336): un carry di PRIMAVERA non deve entrare nemmeno in Europa */
    u18: (() => { const u = { season: 1, proStatus: 'u18', club: { id: 'u', n: 'U18', lg: 'Primavera' }, goals: 18, assists: 4, matches: 18, matchHistory: mh(18, 18) };
      const c = window.buildSeasonCarry(u, { id: 'p', n: 'Pro', lg: 'Lega A' });
      return { lg: c.lg, lgAll: c.lgAll }; })(),
    /* controprova: stessa lega → il travaso di lega resta pieno (nessuna regressione 7.293) */
    stessaLega: (() => { const c = window.buildSeasonCarry({ ...primo, club: { id: 'a', n: 'A', lg: 'Lega A' } }, nuovo); return { lg: c.lg, lgAll: c.lgAll }; })(),
  };
});
await browser.close(); srv.close();
console.log(JSON.stringify(r, null, 1));
const ko = [];
if (r.carryLg !== 0) ko.push(`travaso di LEGA fra campionati diversi: ${r.carryLg} (deve essere 0 — invariante 7.336)`);
if (r.carryLgAll !== 26) ko.push(`gol di lega di tutte le maglie: ${r.carryLgAll} (attesi 26)`);
if (r.lega !== 8) ko.push(`classifica di Lega A: ${r.lega} (attesi 8 — i gol olandesi NON contano qui)`);
if (r.europa !== 34) ko.push(`classifica europea: ${r.europa} (attesi 34 = 26 + 8)`);
if (r.scarpaGoals !== 34) ko.push(`Re dei Bomber mostra ${r.scarpaGoals} (attesi 34)`);
if (r.u18.lgAll !== 0) ko.push(`la Primavera entra in Europa: lgAll ${r.u18.lgAll} (deve essere 0)`);
if (r.stessaLega.lg !== 26) ko.push(`stessa lega: travaso ${r.stessaLega.lg} (attesi 26 — regressione 7.293)`);
if (errs.length) ko.push(`errori di pagina: ${errs.join(' | ')}`);
if (ko.length) { console.log('\n❌ ' + ko.join('\n❌ ')); process.exit(1); }
console.log('\n✅ lega 8 · Europa 34 · Primavera fuori · travaso a parità di lega intatto');
