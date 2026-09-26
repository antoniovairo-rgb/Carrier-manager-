#!/usr/bin/env node
/* [7.999.25] GUARDIANO — LE STRISCE DELLE MAGLIE CGTRADER SI DISEGNANO DAL CORPO (collaudo PO: strisce a «V» sul davanti).
   Misurato sulla geometria: nelle due isole UV del davanti il «verso il basso» e' inclinato di +14..+19 e -9..-19 gradi, quindi
   strisce dritte nella texture diventavano una V. Ora il motivo (strisce, righine, cerchi) si cuoce da una mappa che per ogni pixel
   della maglia dice l'angolo attorno al busto (o al braccio) e l'altezza. Partita di prova (seme «Strisce25»: l'avversario ha i cerchi, che passano dalla stessa mappa), corpi CGTrader
   accesi: verde se la mappa e' stata cotta per ogni geometria di maglia usata, copre almeno il 40% della texture e costa meno di
   600 ms per geometria (headless). Il giudizio visivo e' nelle foto di prova tests/character-lab/maglie/strisce-25-*.png.
   CPM_ROSSO=1 → __CPM_NO_STRISCE25: nessuna mappa, motivo disegnato nella texture come prima (la V). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_FORCE_KITPAT = 'stripes'; if (r) window.__CPM_NO_STRISCE25 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Strisce25' }); await sleep(12000);
const w = await page.evaluate(() => (window.__CPM_STRISCE25 || []).slice());
const pats = await page.evaluate(() => [...new Set((window.__CPM_MAGLIE18 || []).map(x => x.pattern))]);
const m = pats.filter(p => p === 'stripes' || p === 'stripesw' || p === 'hoops').length;
await b.close(); srv.close();
console.log(`motivi ${JSON.stringify(pats)} · motivi da mappa ${m} · mappe cotte ${w.length} ${JSON.stringify(w)} · errori pagina ${E.length}`);
if (ROSSO) { const ok = w.length === 0 && m > 0; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.25 nessuna mappa, strisce disegnate nella texture (la V)' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = [];
if (m === 0) fails.push('nessuna maglia a strisce/cerchi in partita: il guardiano non guarda niente');
if (w.length === 0) fails.push('nessuna mappa cotta');
for (const x of w) { if (x.cov < 0.4) fails.push(`copertura ${x.cov} < 0,4 (tri ${x.tri})`); if (x.ms > 600) fails.push(`cottura ${x.ms} ms > 600 (tri ${x.tri})`); }
if (E.length) fails.push('errori di pagina: ' + E[0]);
console.log(fails.length ? '❌ FAIL strisce-corpo\n  ' + fails.join('\n  ') : '✅ PASS strisce-corpo'); process.exit(fails.length ? 1 : 0);
