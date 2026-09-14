#!/usr/bin/env node
/* MISSIONE, blocco 2 — L'ANAGRAFE DELLA FASE D'ESITO, con prova del rosso.
   Il censimento per fase del 7.555 ha diviso il verdetto in due meta' opposte: nella cronaca il pallone in
   moto ha quasi sempre un nome (0,07% anonimi), nella fase d'ESITO no (44-55%). Qui si misura solo quella
   fase, prima e dopo la firma della macchina del post-arco.
   Rosso = __CPM_NO557 (nessuna firma sull'esito, il comportamento fino al 7.556). Verde = 7.557.
   Il numero giudicato: anonimi in `hl_result`. Rosso e verde ALTERNATI nello stesso processo (regola 5).
     CPM_CHROME=... node esito-557.mjs [CPM_MS=180000] [CPM_GIRI=2]                                      */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 180000), GIRI = +(process.env.CPM_GIRI || 2);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = { verde: [], rosso: [] };
async function giro(rosso, seed) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true;
    if (r) window.__CPM_NO557 = true;
    window.__CPM_OWN497 = { f: 0, dich: 0, multi: 0, mosso: 0, anon: 0, coppie: {} };
  }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await sleep(MS);
  const W = await page.evaluate(() => window.__CPM_OWN497);
  await page.close();
  return W;
}
for (let g = 0; g < GIRI; g++) { const seed = 7100 + g * 137; out.rosso.push(await giro(true, seed)); out.verde.push(await giro(false, seed)); }
srv.close(); await b.close();
const pc = (x, y) => y ? (100 * x / y).toFixed(2) + '%' : '—';
function fase(arr, f) { const b2 = { mosso: 0, anon: 0, multi: 0 };
  for (const w of arr) { const v = (w.perFase || {})[f]; if (v) { b2.mosso += v.mosso; b2.anon += v.anon; b2.multi += v.multi; } } return b2; }
console.log(`\n=== L'ANAGRAFE DELLA FASE D'ESITO — ${GIRI} giri per colore, alternati ===\n`);
const R = fase(out.rosso, 'hl_result'), V = fase(out.verde, 'hl_result');
const Rp = fase(out.rosso, 'playing'), Vp = fase(out.verde, 'playing');
console.log(`  hl_result  ROSSO  si muove ${R.mosso} · anonimi ${R.anon} (${pc(R.anon, R.mosso)}) · doppie ${R.multi}`);
console.log(`  hl_result  VERDE  si muove ${V.mosso} · anonimi ${V.anon} (${pc(V.anon, V.mosso)}) · doppie ${V.multi}`);
console.log(`  playing    ROSSO  si muove ${Rp.mosso} · anonimi ${Rp.anon} (${pc(Rp.anon, Rp.mosso)}) · doppie ${Rp.multi}`);
console.log(`  playing    VERDE  si muove ${Vp.mosso} · anonimi ${Vp.anon} (${pc(Vp.anon, Vp.mosso)}) · doppie ${Vp.multi}`);
const cop = {}; for (const w of out.verde) for (const [k, n] of Object.entries(w.coppie || {})) cop[k] = (cop[k] || 0) + n;
const rim = Object.entries(cop).sort((a, c) => c[1] - a[1]).slice(0, 8);
if (rim.length) { console.log(`\n  doppie scritture rimaste nel verde:`); for (const [k, n] of rim) console.log(`    ${k}  x${n}`); }
console.log('');
if (!R.mosso || !V.mosso) { console.log(`✗ INCONCLUDENTE — la fase d'esito non ha prodotto abbastanza fotogrammi (rosso ${R.mosso}, verde ${V.mosso}): allunga CPM_MS.`); process.exit(1); }
const rR = R.anon / R.mosso, rV = V.anon / V.mosso;
if (rR < 0.15) { console.log(`✗ NON SEPARATI — il rosso ha gia' solo ${pc(R.anon, R.mosso)} di anonimi: il guardiano non prova niente.`); process.exit(1); }
if (rV > 0.05) { console.log(`✗ FAIL — il verde ha ancora ${pc(V.anon, V.mosso)} di movimento senza nome nella fase d'esito (rosso ${pc(R.anon, R.mosso)}).`); process.exit(1); }
if (V.multi > Vp.multi + R.multi) { console.log(`✗ FAIL — la firma dell'esito ha creato ${V.multi} doppie scritture nuove.`); process.exit(1); }
console.log(`✓ PASS — fase d'esito: rosso ${pc(R.anon, R.mosso)} senza nome, verde ${pc(V.anon, V.mosso)}. Doppie nel verde: ${V.multi}.`);
