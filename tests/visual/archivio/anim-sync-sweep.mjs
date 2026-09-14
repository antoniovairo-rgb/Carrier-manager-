/* [7.324.0] QA MASSIVO — SINCRONIZZAZIONE ANIMAZIONE ⟺ FISICA (direttiva PO, punto 5+6)

   Sweep su un campione ampio del pool, entrambi gli esiti, recorder per-frame. Per ogni scena misura
   le QUATTRO anomalie che la direttiva elenca:
     A. LANCIO ORFANO   — il pallone accelera (>14 u/s da quasi fermo) mentre NESSUN sistema lo guida
                          (niente arco, niente post-arco, niente executor): «la palla parte prima del contatto».
     B. PALLA DIETRO    — in conduzione (palla <3.2u, corpo in marcia) la proiezione sulla direzione di
                          marcia scende sotto -0.35u: «il pallone rimane indietro».
     C. TELEPORT EROE   — salto della mesh >6u fra due frame adiacenti fuori dagli snap di scena
                          (primi 600ms dopo il cambio di hlSitKey): «scatti improvvisi».
     D. PALLA SOSPESA   — quota >1.6 per >0.8s SENZA arco attivo ne' post-arco aereo: pallone a mezz'aria
                          che nessuno sta calciando.
   Ogni anomalia stampa gi/esito/frame per la riproduzione. Exit ≠0 se una qualsiasi scena ne produce.

     node anim-sync-sweep.mjs            (campione standard, ~24 scene)
     SWEEP_N=60 node anim-sync-sweep.mjs (campione allargato)
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const N = Math.max(6, parseInt(process.env.SWEEP_N || '24', 10));
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let fails = 0, scanned = 0;
const anomalie = [];

/* campione deterministico distribuito sul pool */
const pool = await (async () => {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port); await sleep(600);
  const tot = await page.evaluate(() => (window.__CPM_SITS || []).length);
  await page.close();
  const out = []; for (let i = 0; i < N; i++) out.push(Math.floor(i * tot / N));
  return out;
})();

for (const gi of pool) {
  for (const esito of ['success', 'fail']) {
    const page = await b.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => { anomalie.push(`gi${gi}/${esito} pageerror: ${e.message.slice(0, 90)}`); });
    await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
    await openMatch(page, port); await sleep(700);
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(650);
    await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(350);
    await page.evaluate(() => window.__CPM_REC_DRAIN());
    await page.evaluate(o => { window.__CPM_FORCE_OUTCOME = o; window.__CPM_RESOLVE(0); }, esito);
    await sleep(3400);
    const fr = await page.evaluate(() => window.__CPM_REC_DRAIN());
    await page.close();
    if (fr.length < 6) continue;
    scanned++;
    const probs = [];
    /* A — lanci orfani */
    let armato = true;
    for (let i = 1; i < fr.length; i++) {
      const dt = (fr[i].t - fr[i - 1].t) / 1000; if (dt <= 0) continue;
      const sp = Math.hypot(fr[i].b[0] - fr[i - 1].b[0], fr[i].b[1] - fr[i - 1].b[1]) / dt;
      if (armato && sp > 14) { const f = fr[i]; if (!f.pa && !f.arc && !f.tl) probs.push(`A lancio orfano ${sp.toFixed(0)}u/s @f${i}`); armato = false; }
      if (sp < 2) armato = true;
    }
    /* B — palla dietro in marcia */
    for (let i = 2; i < fr.length; i++) {
      const mx = fr[i].h[0] - fr[i - 2].h[0], mz = fr[i].h[1] - fr[i - 2].h[1]; const ml = Math.hypot(mx, mz);
      if (ml < 0.12) continue;
      const bx = fr[i].b[0] - fr[i].h[0], bz = fr[i].b[1] - fr[i].h[1];
      if (Math.hypot(bx, bz) > 3.2) continue;
      if (fr[i].arc || fr[i].pa) continue; /* palla partita/guidata da un esito: non è conduzione */
      if ((bx * mx + bz * mz) / ml < -0.35) { probs.push(`B palla dietro ${((bx * mx + bz * mz) / ml).toFixed(2)}u @f${i}`); break; }
    }
    /* C — teleport eroe fuori dagli snap */
    let lastSk = fr[0].sk, skT = fr[0].t;
    for (let i = 1; i < fr.length; i++) {
      if (fr[i].sk !== lastSk) { lastSk = fr[i].sk; skT = fr[i].t; }
      const d = Math.hypot(fr[i].h[0] - fr[i - 1].h[0], fr[i].h[1] - fr[i - 1].h[1]);
      if (d > 6 && (fr[i].t - skT) > 600) { probs.push(`C teleport eroe ${d.toFixed(1)}u @f${i}`); break; }
    }
    /* D — palla sospesa senza arco */
    let airT = null;
    for (let i = 0; i < fr.length; i++) {
      const airborne = fr[i].b[2] > 1.6 && !fr[i].arc && !/in_net_high|deflect|cross_goal|onetwo_back/.test(fr[i].pa || '');
      if (airborne) { if (airT == null) airT = fr[i].t; else if (fr[i].t - airT > 800) { probs.push(`D palla sospesa y${fr[i].b[2]} @f${i}`); break; } }
      else airT = null;
    }
    if (probs.length) { fails++; anomalie.push(`gi${gi}/${esito}: ${probs.join(' · ')}`); }
  }
}

console.log(`scene analizzate ${scanned} (${pool.length} situations × 2 esiti)`);
anomalie.forEach(a => console.log('❌', a));
console.log(fails || anomalie.length ? `\n❌ FAIL — ${fails} scene con anomalie di sync` : `\n✅ PASS — nessun lancio orfano, palla mai dietro, zero teleport, zero palloni sospesi`);
await b.close(); srv.close();
process.exit(fails || anomalie.length ? 2 : 0);
