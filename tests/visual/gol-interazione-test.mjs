#!/usr/bin/env node
/* [7.999.10] GUARDIANO — UN'INTERAZIONE NON MANGIA UN GOL (collaudo PO «3 gol e non due come indicato»).
   L'interazione sostituiva la riga di cronaca del minuto con ef:null: se quella riga era il gol del motore, il tabellone non lo contava
   e il tabellino del motore si'. Partita riprodotta: Unico122 (seed autoplay 5391), gol del n. 6 al 24' nel motore.
   Verde: tabellone = motore, e il testimone registra l'interazione RINVIATA sul minuto del gol.
   CPM_ROSSO=1 → __CPM_NO_GOLINTX10: tabellone 3, motore 4. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_GOLPERSO_REC = 1; if (r) window.__CPM_NO_GOLINTX10 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Unico122' });
await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 5391);
const t0 = Date.now(); while (Date.now() - t0 < 300000) { await sleep(500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const d = await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return { score: window.__CPM_SCORE && window.__CPM_SCORE(), tab: M ? M.tabellino() : null, perso: window.__CPM_GOLPERSO || [] }; });
await b.close(); srv.close();
const tH = d.tab ? d.tab.home.gol : null, tA = d.tab ? d.tab.away.gol : null;
console.log(`tabellone ${d.score.home}-${d.score.away} · motore ${tH}-${tA} · gol incrociati con un'interazione: ${JSON.stringify(d.perso.filter(p => p.dove === 'interazione'))}`);
const allineati = d.score.home === tH && d.score.away === tA, incrocio = d.perso.some(p => p.dove === 'interazione');
if (!incrocio) { console.log('❌ SONDA CIECA: nessun gol del motore nello stesso minuto di un\'interazione — la partita riprodotta non e\' piu\' quella'); process.exit(2); }
if (ROSSO) { console.log(!allineati ? '✅ ROSSO come atteso: l\'interazione mangia il gol' : '❌ il rosso non riproduce il difetto'); process.exit(!allineati ? 0 : 1); }
console.log(allineati ? '✅ PASS gol-interazione' : '❌ FAIL gol-interazione: tabellone e motore non coincidono'); process.exit(allineati ? 0 : 1);
