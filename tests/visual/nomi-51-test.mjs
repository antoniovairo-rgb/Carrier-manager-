/* [7.999.102] + nessuna targhetta senza corpo (CPM_RED102=1 → __CPM_NO_NOMI102 deve mostrarne). [7.999.97 GUARDIANO PO-051] targhette numero+cognome sopra i giocatori SOLO negli highlight: in cronaca nessuna,
   in hl_* almeno due visibili (eroe compreso). CPM_RED=1 → __CPM_NO_NOMI51 → nessuna targhetta → deve FALLIRE il verde. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1', RED102 = process.env.CPM_RED102 === '1', GI = (process.env.CPM_GI || '3,33').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
for (const gi of GI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_GLB = true; window.__CPM_DTREAL = 1; if (r === 1) window.__CPM_NO_NOMI51 = 1; if (r === 2) window.__CPM_NO_NOMI102 = 1; }, RED ? 1 : (RED102 ? 2 : 0));
  await openMatch(page, port, { skipLoadAll: true, name: 'Nomi51' }); await sleep(1500);
  const playing = await page.evaluate(() => window.__CPM_NOMI51 || null);
  await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); }, gi);
  await page.waitForFunction(() => /^hl_/.test(window.__CPM_PHASE && window.__CPM_PHASE()), { timeout: 30000 }).catch(() => {});
  await sleep(2500);
  const w = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), n: window.__CPM_NOMI51 || null }));
  await page.screenshot({ path: `/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/nomi51-gi${gi}${RED ? '-r' : ''}.png` });
  out.push({ gi, playing, ...w }); await page.close();
}
console.log(JSON.stringify(out)); await b.close(); srv.close();
const vis = o => (o.n && o.n.visibili) | 0;
const orf = out.reduce((a, o) => a + ((o.n && o.n.senzaCorpo) | 0), 0);
if (RED102) { const r = orf > 0; console.log(r ? `✅ ROSSO102 come atteso: ${orf} targhette senza corpo` : '❌ il rosso102 non riproduce'); process.exit(r ? 0 : 1); }
const ok = RED ? out.every(o => vis(o) === 0) : out.every(o => (!o.playing || o.playing.visibili === 0) && /^hl_/.test(o.ph) && vis(o) >= 2) && orf === 0;
console.log(`targhette senza corpo: ${orf}`);
console.log(RED ? (ok ? '✅ ROSSO come atteso: senza targhette' : '❌ il rosso mostra targhette') : (ok ? '✅ PASS nomi-51' : '❌ FAIL nomi-51'));
process.exit(ok ? 0 : 1);
