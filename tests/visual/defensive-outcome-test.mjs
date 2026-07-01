/* Test resolveDefensiveOutcome (5.65.0): verifica che gli esiti difensivi siano VARI e che il rinvio
   lungo (safe_clear) sia ECCEZIONALE — non più il default. Carica il gioco e chiama window.resolveDefensiveOutcome
   su una griglia di contesti realistici, aggregando la distribuzione degli esiti. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(300);

const res = await page.evaluate(() => {
  const f = window.resolveDefensiveOutcome;
  if (typeof f !== 'function') return { err: 'resolveDefensiveOutcome non esposta' };
  // attributi "difensore medio"
  const attrs = { posizionamento: 68, passaggio: 62, tecnica: 58, mentalità: 64, fisico: 70, velocità: 66 };
  const counts = {}, byPressureLong = { lo: 0, hi: 0 }, tot = { lo: 0, hi: 0 };
  let n = 0, longTot = 0, keepTot = 0, towardGoalX = 0;
  // griglia: x (posizione) × y (fascia) × pressure × success × seed
  for (const x of [12, 22, 35, 48, 62]) {
    for (const y of [10, 30, 50, 70, 90]) {
      for (const pressure of [0, 1, 2, 3, 4]) {
        for (const success of [true, false]) {
          for (let seed = 0; seed < 12; seed++) {
            const o = f({ success, x, y, pressure, attrs, foot: 'R', seed: seed * 2654435761 + x * 131 + y * 17 + pressure * 7 });
            counts[o.kind] = (counts[o.kind] || 0) + 1; n++;
            if (o.kind === 'safe_clear') longTot++;
            if (o.poss === 'keep') keepTot++;
            // "verso la porta avversaria": target x REALE = clamp(x+dx, 6, 68) come nel render-loop → deve restare ≤68
            if (!o.toTouch && !o.toGoalLine) { const tgx = Math.max(6, Math.min(x + (o.dx || 0), 68)); if (tgx > 70) towardGoalX++; }
            const bucket = pressure <= 1 ? 'lo' : (pressure >= 3 ? 'hi' : null);
            if (bucket) { tot[bucket]++; if (o.kind === 'safe_clear') byPressureLong[bucket]++; }
          }
        }
      }
    }
  }
  return { n, counts, longPct: +(longTot / n * 100).toFixed(1), keepPct: +(keepTot / n * 100).toFixed(1),
    towardGoalX, loLongPct: +(byPressureLong.lo / (tot.lo || 1) * 100).toFixed(1), hiLongPct: +(byPressureLong.hi / (tot.hi || 1) * 100).toFixed(1) };
});
await browser.close(); srv.close();

if (res.err) { console.log('❌ ' + res.err); process.exit(1); }
console.log('resolveDefensiveOutcome — distribuzione su ' + res.n + ' contesti\n');
const kinds = Object.entries(res.counts).sort((a, b) => b[1] - a[1]);
for (const [k, c] of kinds) console.log('  ' + k.padEnd(16) + ' ' + (c / res.n * 100).toFixed(1).padStart(5) + '%  ' + '█'.repeat(Math.round(c / res.n * 60)));
console.log('\nEsiti distinti: ' + kinds.length);
console.log('Spazzata lunga (safe_clear) globale: ' + res.longPct + '%   (bassa pressione: ' + res.loLongPct + '%  ·  alta pressione: ' + res.hiLongPct + '%)');
console.log('Possesso mantenuto (keep): ' + res.keepPct + '%');
console.log('Esiti con target OLTRE x=70 (verso la porta avversaria): ' + res.towardGoalX + ' su ' + res.n);

const varied = kinds.length >= 7;
const longRare = res.longPct < 22;                 // il rinvio lungo NON è più il default
const longScales = res.hiLongPct > res.loLongPct + 5; // la spazzata sale con la pressione (gated)
const noBomb = res.towardGoalX === 0;              // nessun rinvio fino alla porta avversaria
console.log('\n' + (varied && longRare && longScales && noBomb
  ? '✅ PASS — esiti VARI (' + kinds.length + '), spazzata lunga ECCEZIONALE (' + res.longPct + '%, sale con la pressione), ZERO rinvii fino alla porta avversaria.'
  : '⚠️ CHECK — varied=' + varied + ' longRare=' + longRare + ' longScales=' + longScales + ' noBomb=' + noBomb));
process.exit(varied && longRare && longScales && noBomb ? 0 : 1);
