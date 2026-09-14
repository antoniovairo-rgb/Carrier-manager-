/* [STRUMENTO] IL PIANO DEL GOL ARRIVA AL PALLONE?
   Il piano 7.649 (_pianoGol649) genera passi con x fino a 77-86: limite dell'area e secondo palo.
   La misura 7.692 dice che dentro una scena di gol il pallone non supera gx 63. Fra il piano e il
   pallone ci sono tre stadi, e il registro cronaca li separa: bx (proposta della riga), bex (dopo il
   freno 30u/riga), bax (dov'era il pallone). Qui si chiede: quante righe di piano escono davvero,
   quanto lontano propongono, e quanto ne resta dopo il freno. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const righe = []; let costruzioni = 0;
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Pi' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let pgPrec = false;
  for (let k = 0; k < 300; k++) {
    await sleep(400);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const h = window.__CPM_HOLD && window.__CPM_HOLD();
      return { pg: !!(h && h.pg), clock: st ? st.clock : null };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.pg && !pgPrec) costruzioni++;
    pgPrec = !!r.pg;
    if (r.clock != null && r.clock >= 89) break;
  }
  const ev = await page.evaluate(() => { try {
    return (window.__CPM_EV() || []).filter(e => e.ev === 'chronicle').map(e => ({ rk: e.rk || null, min: e.min, bx: e.bx, bex: e.bex, bax: e.bax, ef: e.ef || null }));
  } catch (_e) { return []; } });
  for (const e of ev) righe.push({ seme, ...e });
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n=== IL PIANO DEL GOL ARRIVA AL PALLONE? ===\n');
console.log(`  costruzioni osservate: ${costruzioni}`);
const piano = righe.filter(r => r.rk === 'manovra-gol');
const pend = righe.filter(r => r.rk === 'pending');
console.log(`  righe totali di cronaca: ${righe.length}`);
console.log(`  righe del PIANO (rk=manovra-gol): ${piano.length}`);
console.log(`  righe di costruzione senza piano (rk=pending): ${pend.length}\n`);
if (!piano.length) console.log('  ← NESSUNA riga di piano e\' uscita: il piano non arriva mai alla cronaca.\n');
else {
  const q = a => a.length ? a.slice().sort((x, y) => x - y) : [0];
  const bxs = piano.map(r => r.bx).filter(v => v != null);
  const bexs = piano.map(r => r.bex).filter(v => v != null);
  const perse = piano.filter(r => r.bx != null && r.bex == null).length;
  const tagliate = piano.filter(r => r.bx != null && r.bex != null && Math.abs(r.bx - r.bex) > 1).length;
  console.log(`  proposta bx : min ${Math.min(...bxs).toFixed(0)} · med ${q(bxs)[bxs.length >> 1].toFixed(0)} · max ${Math.max(...bxs).toFixed(0)}`);
  if (bexs.length) console.log(`  effettiva bex: min ${Math.min(...bexs).toFixed(0)} · med ${q(bexs)[bexs.length >> 1].toFixed(0)} · max ${Math.max(...bexs).toFixed(0)}`);
  console.log(`  righe con proposta ANNULLATA (bex nullo): ${perse}/${piano.length}`);
  console.log(`  righe ACCORCIATE dal freno (>1u): ${tagliate}/${piano.length}`);
  console.log(`  righe che propongono oltre gx 75: ${bxs.filter(v => v >= 75).length}`);
  if (bexs.length) console.log(`  righe che ARRIVANO oltre gx 75: ${bexs.filter(v => v >= 75).length}`);
  console.log('\n  prime 14 righe di piano:');
  for (const r of piano.slice(0, 14)) console.log(`    ${String(r.min).padStart(2)}' bx ${r.bx == null ? '  -' : r.bx.toFixed(0).padStart(3)} → bex ${r.bex == null ? '  -' : r.bex.toFixed(0).padStart(3)}  (palla era a ${r.bax == null ? '-' : r.bax.toFixed(0)})`);
}
console.log('');
