#!/usr/bin/env node
/* [7.289.0 collaudo PO «ha davvero meritato il trofeo d'oro?»]
   GUARDIANO DELLA COERENZA DEI PREMI EUROPEI. Nello screenshot il podio del Trofeo d'Oro era 30-28-23 mentre
   quello del Re dei Bomber, nella stessa schermata, partiva da 39 — e l'eroe compariva con 30 gol nel primo
   pannello e con 48 nella riga «la tua posizione europea» del secondo. Due difetti distinti:
     (A) i candidati europei erano GENERATI DUE VOLTE, con nomi e formule diverse (Trofeo d'Oro 22-30 gol,
         Re dei Bomber 27-40): il premio di miglior giocatore d'Europa si assegnava in un campo più debole
         di quello dei marcatori, e chi aveva segnato di più non era nemmeno candidato;
     (B) il numero dell'eroe cambiava da pannello a pannello (gol di campionato contro gol di tutte le
         competizioni), quindi si leggeva «5ª con 48 gol» sotto un podio che partiva da 39.
   Qui si misura sul motore VERO (`generateSeasonAwards`, esposto in test-mode) su più profili.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node awards-coherence-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const page = await browser.newPage({ viewport: { width: 480, height: 1200 } });
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; localStorage.setItem('cpm-intro-seen', '1'); });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => typeof window.generateSeasonAwards === 'function', null, { timeout: 60000 });

const CLUB = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 82, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
// matchHistory di sola LEGA: leagueGoalsOf conta da qui, p.goals include anche coppe/Europa
const mkHist = (n, gol) => Array.from({ length: n }, (_, i) => ({ week: i + 1, opponent: 'Club ' + i, goals: i < gol ? 1 : 0, assists: i % 4 === 0 ? 1 : 0, rating: 7.2, won: true }));

const profilo = (o) => ({ name: 'Premi Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 7, week: 38, age: 23,
  club: CLUB, ovr: o.ovr, goals: o.tot, assists: o.assTot, matches: 46, matchHistory: mkHist(34, o.lega),
  totalGoals: 200, totalAssists: 60, totalMatches: 220,
  cup: o.coppa ? { champion: true } : null, euro: o.euro ? { champion: true, competition: 'UCL' } : null,
  standings: [], trophies: [] });

const calcola = (p, champ) => page.evaluate(([pl, ch]) => {
  const st = ['tor', 'juve', 'inter', 'milan', 'napoli', 'roma', 'ata', 'lazio', 'fio', 'bol', 'udi', 'sas', 'cag', 'sam', 'gen', 'ver', 'mon2', 'lec']
    .map((id, i) => ({ id, n: id === 'tor' ? 'FC Granata' : 'Club ' + id.toUpperCase(), pts: (id === 'tor' && ch) ? 90 : 80 - i * 4, played: 34, gf: 60 - i, ga: 25 + i }))
    .sort((a, b) => b.pts - a.pts);
  const a = window.generateSeasonAwards(pl, st);
  return { pal: { top3: a.palloneOro.top3.map(c => ({ n: c.name, g: c.goals, tr: c.trofei || null, io: !!c.isPlayer })), vinto: a.palloneOro.playerWins },
    sca: { top3: a.scarpaOro.top3.map(c => ({ n: c.name, g: c.goals, io: !!c.isPlayer })), pos: a.scarpaOro.playerPos, pg: a.scarpaOro.playerGoals },
    lg: a.playerLeagueGoals, la: a.playerLeagueAssists };
}, [p, champ]);

// ── (A) stesso campo: chi entra nel podio del Trofeo d'Oro deve esistere anche fra i marcatori
{
  const r = await calcola(profilo({ ovr: 86, tot: 48, assTot: 18, lega: 30, coppa: true, euro: false }), true);
  const nomiSca = new Set(r.sca.top3.map(x => x.n));
  const golSca = new Map(r.sca.top3.map(x => [x.n, x.g]));
  console.log('── campione + coppa, 30 gol di lega (48 totali), 18 assist');
  console.log('   Trofeo d\'Oro : ' + r.pal.top3.map(c => `${c.n} ${c.g}⚽${c.tr ? ' 🏆' + c.tr : ''}`).join(' · '));
  console.log('   Re dei Bomber: ' + r.sca.top3.map(c => `${c.n} ${c.g}⚽`).join(' · '));
  console.log(`   la tua posizione europea: ${r.sca.pos + 1}ª con ${r.sca.pg} gol (di lega ${r.lg})`);
  const estranei = r.pal.top3.filter(c => !c.io && !nomiSca.has(c.n));
  // chi compare in ENTRAMBI i podi deve avere lo STESSO numero di gol
  const discordi = r.pal.top3.filter(c => golSca.has(c.n) && golSca.get(c.n) !== c.g);
  if (discordi.length) issues.push(`(A) stesso giocatore con gol diversi nei due pannelli: ${discordi.map(c => `${c.n} ${c.g}≠${golSca.get(c.n)}`).join(', ')}`);
  const maxPal = Math.max(...r.pal.top3.filter(c => !c.io).map(c => c.g), 0);
  const maxSca = Math.max(...r.sca.top3.filter(c => !c.io).map(c => c.g), 0);
  console.log(`   miglior avversario: ${maxPal}⚽ nel Trofeo d'Oro vs ${maxSca}⚽ fra i marcatori`);
  if (maxSca - maxPal > 6) issues.push(`(A) il Trofeo d'Oro si assegna in un campo più debole: miglior candidato ${maxPal} gol contro i ${maxSca} del capocannoniere`);
  if (estranei.length > 1) issues.push(`(A) ${estranei.length} candidati al Trofeo d'Oro non esistono fra i marcatori d'Europa`);
  if (r.sca.pg !== r.lg) issues.push(`(A) la riga della posizione europea userebbe ${r.sca.pg} gol invece dei ${r.lg} su cui è fatta la classifica`);
  if (!r.pal.top3.some(c => c.io)) issues.push('(A) un campione con 30 gol e 18 assist non entra nemmeno nel podio del Trofeo d\'Oro');
}

// ── (B) la bacheca pesa: a parità di stagione, chi vince il titolo passa avanti al bomber puro
{
  const conTitolo = await calcola(profilo({ ovr: 86, tot: 32, assTot: 14, lega: 26, coppa: true, euro: true }), true);
  const senza = await calcola(profilo({ ovr: 86, tot: 32, assTot: 14, lega: 26, coppa: false, euro: false }), false);
  console.log(`\n── stessa stagione personale (26 gol di lega), bacheca diversa`);
  console.log(`   con titolo+coppa+Europa → Trofeo d'Oro ${conTitolo.pal.vinto ? 'VINTO' : 'non vinto'} (1° ${conTitolo.pal.top3[0].n})`);
  console.log(`   senza nulla in bacheca  → Trofeo d'Oro ${senza.pal.vinto ? 'VINTO' : 'non vinto'} (1° ${senza.pal.top3[0].n})`);
  if (!conTitolo.pal.vinto) issues.push('(B) nemmeno con titolo, coppa ed Europa il premio arriva: la bacheca non pesa');
  if (senza.pal.vinto) issues.push('(B) il premio arriva anche senza aver vinto niente: la bacheca non pesa');
}

// ── (C) i numeri dell'eroe nei pannelli europei sono quelli di LEGA, non di tutte le competizioni
{
  const r = await calcola(profilo({ ovr: 86, tot: 48, assTot: 18, lega: 30, coppa: true, euro: false }), true);
  const mio = r.pal.top3.find(c => c.io);
  console.log(`\n── coerenza dei numeri: podio ${mio ? mio.g : '—'}⚽ · riga posizione ${r.sca.pg}⚽ · leagueGoals ${r.lg}`);
  if (mio && mio.g !== r.lg) issues.push(`(C) il podio mostra ${mio.g} gol ma la classifica è fatta su ${r.lg}`);
  if (r.sca.pg !== r.lg) issues.push(`(C) la riga della posizione europea non usa i gol di lega`);
  if (r.lg !== 30) issues.push(`(C) leagueGoalsOf non legge lo storico di lega (${r.lg} invece di 30)`);
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — un solo campo europeo, gli stessi numeri in tutti i pannelli, e la bacheca conta');
