/* [STRUMENTO] L'OMBRA VEDE LE OCCASIONI? — banco del danger system (§10 missione definitiva).
   Confronta il threat del Match State con le finestre che oggi i piani aprono a dado:
   (a) threat DENTRO le finestre di piano vs FUORI; (b) picchi >=70 fuori da ogni finestra =
   le azioni pericolose che il dado NON mostra; (c) threat al minuto dei GOL del microsim. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; }, { glb: GLB });
await openMatch(page, port, { skipLoadAll: true, name: 'Om' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const camp = [];
for (let k = 0; k < 900; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const ms = window.__CPM_MS && window.__CPM_MS();
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    return { thr: ms ? ms.threat : null, min: ms ? ms.min : null,
      pg: !!(h && h.pg && h.pgStep != null && h.pgStep < h.pgLen), c: ms ? ms.min : 0 };
  } catch (_e) { return null; } });
  if (r && r.thr != null) camp.push(r);
  if (r && r.c >= 89) break;
}
const gol = await page.evaluate(() => ((window.__CPM_EV && window.__CPM_EV()) || [])
  .filter(e => e.ev === 'chronicle' && /goal$/.test(String(e.ef || ''))).map(e => e.min));
await b.close(); srv.close();
const den = camp.filter(c => c.pg).map(c => c.thr), fuo = camp.filter(c => !c.pg).map(c => c.thr);
const st = a => { if (!a.length) return 'n 0'; const s2 = a.slice().sort((x, y) => x - y);
  return `n ${a.length} · mediana ${s2[s2.length >> 1]} · p90 ${s2[Math.floor(s2.length * 0.9)]} · max ${s2[s2.length - 1]}`; };
console.log(`\n=== L'OMBRA VEDE LE OCCASIONI? ===`);
console.log(`  threat DENTRO le finestre di piano: ${st(den)}`);
console.log(`  threat FUORI (cronaca normale)   : ${st(fuo)}`);
const picchi = []; let run = null;
for (const c of camp) { if (!c.pg && c.thr >= 70) { if (!run) run = { min: c.min, max: c.thr, n: 0 } ; run.n++; run.max = Math.max(run.max, c.thr); } else if (run) { picchi.push(run); run = null; } }
if (run) picchi.push(run);
console.log(`  PICCHI >=70 fuori dalle finestre (pericoli che il dado non mostra): ${picchi.length}`);
for (const p of picchi.slice(0, 10)) console.log(`    min ${p.min}: max ${p.max} per ${p.n} campioni`);
console.log(`  GOL del microsim ai minuti: ${gol.join(', ') || 'nessuno'}`);
for (const g of gol) { const vic = camp.filter(c => Math.abs(c.min - g) <= 2).map(c => c.thr);
  console.log(`    threat nei 2' attorno al gol del ${g}': ${st(vic)}`); }
console.log('');
