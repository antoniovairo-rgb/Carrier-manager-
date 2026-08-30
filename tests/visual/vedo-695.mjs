/* [STRUMENTO] LA SCENA SALIENTE SI VEDE DAVVERO? — collaudo PO 7.694: «le azioni pericolose, gol e
   tentativi non si vedono». Finora ho misurato NUMERI del pallone; qui si GUARDA: appena una finestra
   e' aperta e il pallone e' in area, si scatta. Se il pallone e' fuori inquadratura, o la scena e' vuota,
   nessun numero interno puo' accorgersene. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const dir = 'out/vedo695'; fs.mkdirSync(dir, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let scatti = 0;
for (const seme of [9200, 7300]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Vd' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let presi = 0;
  for (let k = 0; k < 900 && presi < 4; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); const h = window.__CPM_HOLD && window.__CPM_HOLD();
      const bx = st && st.ball ? st.ball.x : 50; const d = h && h.pgDir ? h.pgDir : 0;
      /* ⚠️ il verso lo deve DIRE la costruzione viva: col ripiego «d=1» gli scatti cadevano nella coda
         dopo la rete, col pallone a centrocampo per il calcio d'inizio e un'avanzata 90 che non
         significava niente. Se non c'e' costruzione, non si scatta. */
      return { w: window.__CPM_SAL689_WHY || null, adv: d === 0 ? -1 : (d > 0 ? bx : 100 - bx), bx, c: st ? st.clock : null, pg: !!(h && h.pg) };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.w && r.pg && r.adv >= 80) { presi++; scatti++;
      const f = `${dir}/${seme}-${r.c}-${r.w}-adv${Math.round(r.adv)}.png`;
      await page.screenshot({ path: f });
      console.log(`  scatto → ${f}`); }
    if (r.c != null && r.c >= 89) break;
  }
  await ctx.close();
}
await b.close(); srv.close();
console.log(`\n  scatti totali: ${scatti}\n`);
