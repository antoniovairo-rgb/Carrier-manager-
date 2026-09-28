/* [7.999.50] DUE DECISIONI DEL PO, MISURATE. (1) «Crescita +N» delle offerte applicata davvero: offerGrowthMult vale 1+N/100
   fino alla stagione `until` compresa, 1 dopo, 1 senza campo (salvataggi vecchi); rosso __CPM_NO_CRESC49 → sempre 1.
   (2) «La Scalata» conta solo il campionato: una coppa non basta, il campionato si'; rosso __CPM_NO_SCALATA50 → basta la coppa. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage(); await installCdnRoutes(page);
await page.addInitScript(r => { if (r) { window.__CPM_NO_CRESC49 = true; window.__CPM_NO_SCALATA50 = true; } }, rosso);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => typeof offerGrowthMult === 'function' && typeof CHALLENGES !== 'undefined', null, { timeout: 90000 });
const m = await page.evaluate(() => {
  const sc = CHALLENGES.find(c => c.id === 'scalata');
  return { dentro: offerGrowthMult({ season: 3, growthBoost: { pct: 14, until: 3 } }), dopo: offerGrowthMult({ season: 4, growthBoost: { pct: 14, until: 3 } }),
    vecchio: offerGrowthMult({ season: 3 }), coppa: sc.check({ trophies: [{ season: 2, type: 'cup' }, { season: 2, isNational: true, league: 'Coppa delle Nazioni' }] }),
    campionato: sc.check({ trophies: [{ season: 2, league: 'Lega A' }] }) }; });
await b.close(); srv.close();
console.log(`\n=== DECISIONI 7.999.50 === ${rosso ? '[ROSSO]' : '[VERDE]'}\n  crescita: dentro ${m.dentro} · dopo ${m.dopo} · salvataggio vecchio ${m.vecchio}\n  La Scalata: con sola coppa/Nazionale ${m.coppa} · con campionato ${m.campionato}`);
const ok = rosso ? (m.dentro === 1 && m.coppa === true) : (Math.abs(m.dentro - 1.14) < 1e-9 && m.dopo === 1 && m.vecchio === 1 && m.coppa === false && m.campionato === true);
console.log(ok ? (rosso ? '\n✅ difetto riprodotto — crescita finta e Scalata con qualunque trofeo' : '\n✅ PASS — la crescita dell\'offerta vale davvero e La Scalata vuole il campionato') : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
