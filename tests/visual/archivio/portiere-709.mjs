/* [STRUMENTO] LA CLIP DEL TUFFO CONTRO L'OROLOGIO DEL PALLONE — codice 111 del PO su 7.708 (GLB, x2).
   Ipotesi: la clip e' scalata sulla durata STIMATA (_diveDur, 7.512) ma la vita del gesto si allunga
   con l'arco (7.465) — la clip finisce e si congela distesa (clampWhenFinished) mentre la palla vola.
   Qui: GLB ON, si forzano le scene delle note (55 stacco palo lontano, 123 sventagliata), attese da
   2fps (il tempo di scena avanza a 0,05s/fotogramma), e si legge __CPM_GKTL col clock della clip:
   per ogni fotogramma del tuffo, ct/cdur (clip) contro arcT/arcD (pallone). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; window.__CPM_CINE = 1; }, { glb: GLB });
await openMatch(page, port); await sleep(1500);
/* [v2] FORCE_OUTCOME accetta 'success'/'fail' (r.5696) — il mio 'goal' valeva fail; e anche portiere-552 usa 'goal': vizio storico da verbalizzare */
for (const [gi, modo] of [[55, 'success'], [123, 'success'], [55, 'fail']]) {
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) { console.log(`  gi${gi}: force fallita`); continue; }
  await sleep(1200);
  await page.evaluate(m => { window.__CPM_FROZEN = false; window.__CPM_GKTL = []; window.__CPM_FORCE_OUTCOME = m; }, modo);
  await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => {});
  /* a ~2fps il clock di scena avanza ~0,1s/s reale: 45s reali ≈ 4-5s di scena, abbastanza per arco+tuffo */
  await sleep(45000);
  const T = await page.evaluate(() => (window.__CPM_GKTL || []).filter(r => r.isOpp && r.opp));
  console.log(`\n  gi${gi} ${modo} — fotogrammi del gesto: ${T.length}`);
  for (const r of T.slice(0, 24)) {
    const arco = r.arcD > 0 ? `arco ${(Math.max(0, r.arcT) / r.arcD * 100).toFixed(0)}%` : 'arco spento';
    const clip = r.ct != null ? `clip ${r.ct}/${r.cdur}s (${r.cdur > 0 ? (r.ct / r.cdur * 100).toFixed(0) : '?'}%) ts${r.ts}` : 'clip non montata';
    console.log(`    ${r.opp} t+${r.oppT}s · ${clip} · ${arco} · palla y${r.by} → gk py${r.py} pz${r.pz}→tz${r.tz}`);
  }
}
await b.close(); srv.close();
