#!/usr/bin/env node
/* [5.93.0 BIL-7] Test del repair "coppe zombie post-trasferimento" nella migration.
   Caso PO: save a W33 con euro girone 0/6 e Coppa R16 senza gare in calendario →
   la migration deve o RI-SCHEDULARE le gare (se c'è spazio ≤W37) o CHIUDERE onestamente.
   Eseguibile con: node cup-transfer-test.mjs */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function', { timeout: 40000 });

const r = await page.evaluate(() => {
  const M = window.__CPM_MIGRATE;
  const mkSave = (week, calWeeks) => ({
    name: 'T', nation: 'IT', proStatus: 'pro', season: 9, week, ovr: 84, stats: {}, form: 70,
    club: { id: 'wkst_test', n: 'FC Werkstadt T', a: 'WKT', lg: 'Deutsche Liga', p: 72 },
    cup: { active: true, round: 1, eliminated: false, champion: false, results: [], bracket: ['vecchia_lega_1', 'vecchia_lega_2'] },
    euro: { active: true, competition: 'UCL', phase: 'group', groupOpponents: [{ id: 'ea', n: 'EA' }, { id: 'eb', n: 'EB' }, { id: 'ec', n: 'EC' }], groupResults: [], pts: 0, qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0 },
    calendar: calWeeks.map((w, i) => ({ matchday: i + 1, week: w, opponentId: 'x' + i, opponentName: 'X' + i, isHome: true, played: false, result: null })),
  });
  const probe = (p) => ({
    cupEntries: (p.calendar || []).filter(m => m.type === 'cup' && !m.played).map(m => m.week),
    euroEntries: (p.calendar || []).filter(m => (m.type === 'euro_group' || m.type === 'euro') && !m.played).map(m => m.week),
    cupActive: !!(p.cup && p.cup.active), cupElim: !!(p.cup && p.cup.eliminated),
    euroActive: !!(p.euro && p.euro.active), euroElim: !!(p.euro && p.euro.eliminated),
    maxWeek: Math.max(0, ...(p.calendar || []).filter(m => !m.played).map(m => m.week)),
  });
  // CASO A — W33, poche week libere: cup rischedulata; euro (6 gare) non entra → chiusura onesta
  const { player: pa } = M(mkSave(33, [34, 36]));
  // CASO B — W10, spazio abbondante: TUTTO rischedulato e giocabile
  const { player: pb } = M(mkSave(10, [11, 13, 15, 17]));
  return { A: probe(pa), B: probe(pb) };
});

console.log('=== BIL-7 · REPAIR COPPE POST-TRASFERIMENTO ===');
console.log('CASO A (W33, spazio scarso):', JSON.stringify(r.A));
console.log('CASO B (W10, spazio ampio): ', JSON.stringify(r.B));
const issues = [];
// A: la coppa deve tornare giocabile (1 gara, week 34-37) …
if (!(r.A.cupEntries.length === 1 && r.A.cupEntries[0] > 33 && r.A.cupEntries[0] <= 37)) issues.push('A: cup non rischedulata in 34..37: ' + r.A.cupEntries);
// … e l'euro (6 gare in 4 slot) deve CHIUDERSI onestamente, niente zombie
if (!(r.A.euroEntries.length === 0 && r.A.euroElim && !r.A.euroActive)) issues.push('A: euro non chiusa onestamente (entries ' + r.A.euroEntries.length + ', elim ' + r.A.euroElim + ')');
// B: tutto giocabile — 1 cup + 6 euro_group, tutte ≤37, nessuna chiusura
if (!(r.B.cupEntries.length === 1 && r.B.euroEntries.length === 6)) issues.push('B: attese 1 cup + 6 euro, ottenute ' + r.B.cupEntries.length + '+' + r.B.euroEntries.length);
if (!(r.B.cupActive && r.B.euroActive && !r.B.cupElim && !r.B.euroElim)) issues.push('B: competizioni chiuse senza motivo');
if (r.B.maxWeek > 37) issues.push('B: gara oltre W37: ' + r.B.maxWeek);
for (const i of issues) console.log('  ✗ ' + i);
console.log(issues.length === 0 ? '\n✅ BIL-7 REPAIR OK' : '\n❌ BIL-7 REPAIR FAIL');
await browser.close(); srv.close();
process.exit(issues.length === 0 ? 0 : 1);
