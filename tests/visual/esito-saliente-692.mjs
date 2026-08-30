/* [STRUMENTO] LE SCENE SALIENTI FINISCONO CON QUALCOSA?
   Collaudo PO: «sono comparse azioni 3D extra eroe ma non erano assolutamente salienti, non ha portato
   a nulla... tiro pericoloso, gol, parata del portiere, punizione ecc».
   METRO: per ogni finestra si registra la CAUSA e cosa succede DENTRO — il pallone arriva in area? c'e'
   un tiro? finisce in gol? Una scena che si apre e si chiude senza che accada niente non e' saliente,
   e' un pezzo di partita qualunque mostrato a caso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Es' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let cur = null;
  for (let k = 0; k < 300; k++) {
    await sleep(400);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const ev = (window.__CPM_EV && window.__CPM_EV()) || [];
      return { w: window.__CPM_SAL689_WHY || null, bx: st && st.ball ? st.ball.x : null, clock: st ? st.clock : null,
               gol: ev.filter(e => e.ev === 'goal').length, tiri: ev.filter(e => e.ev === 'chronicle' && e.ms && (e.ms.shots || e.ms.oppShots)).length };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.w && !cur) cur = { causa: r.w, bxMax: r.bx || 50, bxMin: r.bx || 50, gol0: r.gol, tiri0: r.tiri, n: 0 };
    if (r.w && cur) { cur.n++; if (r.bx > cur.bxMax) cur.bxMax = r.bx; if (r.bx < cur.bxMin) cur.bxMin = r.bx; cur.gol1 = r.gol; cur.tiri1 = r.tiri; }
    if (!r.w && cur) { tutte.push({ seme, ...cur }); cur = null; }
    if (r.clock != null && r.clock >= 89) break;
  }
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n=== LE SCENE SALIENTI FINISCONO CON QUALCOSA? ===\n');
console.log(`  finestre osservate: ${tutte.length}\n`);
let conEsito = 0;
for (const f of tutte) {
  const gol = (f.gol1 || 0) - (f.gol0 || 0), tiri = (f.tiri1 || 0) - (f.tiri0 || 0);
  const inArea = f.bxMax >= 84 || f.bxMin <= 16;
  const esito = gol > 0 || tiri > 0 || inArea;
  if (esito) conEsito++;
  console.log(`  [${f.causa.padEnd(12)}] ${String(f.n).padStart(3)} campioni · pallone da gx ${f.bxMin.toFixed(0)} a ${f.bxMax.toFixed(0)} · gol ${gol} · tiri ${tiri} · ${esito ? 'HA PORTATO A QUALCOSA' : '← non ha portato a nulla'}`);
}
console.log(`\n  finestre che portano a qualcosa: ${conEsito}/${tutte.length}`);
const perCausa = {};
for (const f of tutte) { const gol = (f.gol1 || 0) - (f.gol0 || 0), tiri = (f.tiri1 || 0) - (f.tiri0 || 0); const ok = gol > 0 || tiri > 0 || f.bxMax >= 84 || f.bxMin <= 16;
  perCausa[f.causa] = perCausa[f.causa] || [0, 0]; perCausa[f.causa][1]++; if (ok) perCausa[f.causa][0]++; }
for (const [c, [a, t]] of Object.entries(perCausa)) console.log(`    ${c.padEnd(12)} ${a}/${t}`);
console.log('');
