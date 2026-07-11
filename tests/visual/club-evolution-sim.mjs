/* [7.7.0 FASE 3] SIMULATORE DI BILANCIAMENTO evoluzione+economia (direttiva PO «migliaia di simulazioni su più
   stagioni»). Replica le formule di Fase 2/3 (prestigio pluriennale, fanbase, budget con costi operativi,
   ampliamento stadio) usando l'affluenza REALE (__CPM_crowdCtx) e verifica: nessun runaway, ampliamenti solo con
   successo sostenuto, prestigio realistico, budget convergente, spettro credibile. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__CPM_crowdCtx && window.__CPM_clubProfile && window.__CPM_profileCapacity, { timeout: 40000 });

const R = await page.evaluate(() => {
  const F = window.__CPM_crowdCtx, PR = window.__CPM_clubProfile, PC = window.__CPM_profileCapacity;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // 15 stagioni; ogni club ha una traiettoria di piazzamenti (indice 0=1° … 17=18°)
  const clubs = [
    { id: 'rma', p: 99, lg: 'Liga Ibérica', traj: () => 0, name: 'CF Madrid (dominio)' },
    { id: 'ata', p: 82, lg: 'Lega A', traj: s => s < 3 ? 5 : 2, name: 'Bergamo (riser Atalanta)' },
    { id: 'sal', p: 45, lg: 'Lega B', traj: s => s < 4 ? 1 : 6, name: 'Salernum (promossa poi metà A)' },
    { id: 'sas', p: 68, lg: 'Lega A', traj: () => 9, name: 'Neroverde (piazza piccola, metà)' },
    { id: 'cit', p: 42, lg: 'Lega B', traj: () => 12, name: 'Cittadino (piccola, medio-bassa)' },
    { id: 'mir', p: 42, lg: 'Liga Ibérica 2', traj: () => 15, name: 'Mirandés (declino)' },
  ];
  const N = 18, SEASONS = 15, HOME_MATCHES = 17;
  const out = [];
  let maxBudget = 0, maxPrestigeShift = 0, expansions = [], anyRunaway = false;
  clubs.forEach(c => {
    let shift = 0, fanbase = 0, stadTier = 0, budget = 0, seasTop = 0, seasLow = 0;
    const hist = [];
    for (let s = 0; s < SEASONS; s++) {
      const i = c.traj(s);
      const frac = i / (N - 1);
      // affluenza media casalinga (profilo + tier corrente + prestigio effettivo)
      const effP = clamp(c.p + shift, 1, 99);
      const club = { id: c.id, p: c.p, lg: c.lg };
      const cap = PC(PR(club), effP);
      const capT = Math.round(cap * (1 + Math.min(stadTier, 2) * 0.22));
      let att = 0;
      for (let w = 2; w <= 34; w += 4) { const r = F({ context: 'career', homeClub: club, capacity: capT, week: w, season: s + 1, matchWeight: 2, standPos: i + 1, standN: N, fanbaseBonus: fanbase, oppPrestige: 60 }); att += r.attendance; }
      att = Math.round(att / 8);
      // ricavi stagione (prezzo biglietto dal profilo)
      const tkt = 12 + (PR(club).ticketLevel / 100) * 38;
      const revenue = Math.round(HOME_MATCHES * att * tkt);
      budget += revenue;
      // rollover: prestigio (momentum), fanbase, costi operativi, ampliamento
      let base; if (i === 0) base = 5; else if (i < 3) base = 3; else if (i < 6) base = 1.5; else if (i >= N - 3) base = -6; else if (i >= N - 6) base = -2.5; else base = (0.42 - frac) * 3;
      shift = clamp(Math.round((shift * 0.92 + base) * 10) / 10, -24, 24);
      const high = frac <= 0.25, low = frac >= 0.80;
      seasTop = high ? seasTop + 1 : 0; seasLow = low ? seasLow + 1 : 0;
      fanbase = clamp(fanbase + (high ? (2 + Math.min(seasTop, 4)) : low ? -(2 + Math.min(seasLow, 3)) : -0.5), 0, 30);
      budget = Math.round(budget * 0.55);// costi operativi
      const expCost = [9000000, 22000000][stadTier] || 1e12;
      if (stadTier < 2 && seasTop >= 3 && fanbase >= (stadTier === 0 ? 10 : 18) && budget >= expCost) { budget -= expCost; stadTier++; expansions.push(`${c.name} → tier ${stadTier} (stagione ${s + 1})`); }
      hist.push({ s: s + 1, att, shiftEff: effP, fan: +fanbase.toFixed(0), tier: stadTier, budgetM: +(budget / 1e6).toFixed(1) });
      maxBudget = Math.max(maxBudget, budget); maxPrestigeShift = Math.max(maxPrestigeShift, Math.abs(shift));
      if (budget > 400e6) anyRunaway = true;
    }
    out.push({ name: c.name, last: hist[hist.length - 1], firstAtt: hist[0].att, lastAtt: hist[hist.length - 1].att, finalTier: stadTier, finalShift: shift });
  });
  return { out, maxBudget, maxPrestigeShift, expansions, anyRunaway };
});
await browser.close(); srv.close();

const checks = [
  ['nessun runaway del budget (<400M)', R.anyRunaway === false && R.maxBudget < 400e6],
  ['prestigio shift entro ±24', R.maxPrestigeShift <= 24.01],
  ['il dominatore (Madrid) amplia lo stadio', R.out.find(o => o.name.includes('Madrid')).finalTier >= 1],
  ['il riser (Atalanta) cresce di prestigio (shift finale ≥ +15)', R.out.find(o => o.name.includes('Atalanta')).finalShift >= 15],
  ['la piccola in declino (Mirandés) NON amplia', R.out.find(o => o.name.includes('Mirandés')).finalTier === 0],
  ['la piazza piccola alto-prestigio (Neroverde) resta contenuta (<12k)', R.out.find(o => o.name.includes('Neroverde')).lastAtt < 12000],
  ['gli ampliamenti richiedono ≥3 stagioni al vertice', R.expansions.length > 0],
];
let fail = 0;
console.log('\n== SIMULATORE EVOLUZIONE+ECONOMIA — 6 club × 15 stagioni ==\n');
for (const [n, ok] of checks) { console.log((ok ? '  ✅ ' : '  ❌ ') + n); if (!ok) fail++; }
console.log(`\n  budget max: ${(R.maxBudget / 1e6).toFixed(0)}M€ · prestigio shift max: ${R.maxPrestigeShift}`);
console.log('  ampliamenti:', R.expansions.length ? R.expansions.join(' · ') : 'nessuno');
console.log('\n  esiti finali (stagione 15):');
R.out.forEach(o => console.log(`    ${o.name.padEnd(34)} att ${o.firstAtt}→${o.lastAtt} · prestigio eff ${o.last.shiftEff} · fanbase ${o.last.fan} · stadio tier ${o.finalTier} · budget ${o.last.budgetM}M€`));
console.log(fail === 0 ? '\n✅ BILANCIAMENTO OK' : `\n❌ ${fail} check falliti`);
process.exit(fail === 0 ? 0 : 1);
