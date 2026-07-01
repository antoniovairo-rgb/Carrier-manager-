/* TEST DAL VIVO del Live Match (non-gate): verifica M1 (overlay⟺esito) live + screenshot GLB-ON.
   Forza tiri FALLITI su un campione e controlla che il testo overlay appartenga alla famiglia
   dell'esito granulare (outKind) → prova end-to-end della coerenza overlay↔3D↔testo. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/live-match'); fs.mkdirSync(OUT, { recursive: true });

const MISS_OVL = {
  post:["Palo!","Traversa!","Ci è andato vicinissimo","A un passo dal gol"],
  saved:["Grande parata del portiere","Il portiere dice di no","Tentativo respinto","Conclusione centrale","Il gol sembrava fatto"],
  blocked:["Murato dalla difesa","Tentativo respinto","Conclusione murata"],
  wide:["Tiro fuori di poco","Non trova lo specchio","Che peccato!","Occasione mancata","Sfiora il vantaggio"],
};
const norm = k => !k ? null : k==='post'?'post':(['saved','save','corner'].includes(k)?'saved':(['blocked','intercepted','wall_blocked'].includes(k)?'blocked':(['wide','out','overhit','missed','deflected_out','shielded_out','lost','stopped'].includes(k)?'wide':null)));

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
const { total } = await openMatch(page, port);
console.log(`situations: ${total} · GLB ON`);
await sleep(3000);

let checked = 0, coherent = 0; const bad = [];
const sample = []; for (let gi = 0; gi < total; gi += 4) sample.push(gi);
for (const gi of sample) {
  await page.evaluate((g) => { window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g, true, { x: 78, y: 50 }); }, gi);
  await sleep(360);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });
  await sleep(650);
  const o = await page.evaluate(() => window.__CPM_OUTCOME);
  if (!o || o.outKey !== 'miss') continue;         // solo tiri falliti (famiglia "miss")
  const fam = norm(o.outKind); if (!fam) continue;  // solo esiti mappati
  checked++;
  const pool = MISS_OVL[fam];
  const ok = pool.includes(o.overlay);
  if (ok) coherent++; else bad.push({ gi, outKind: o.outKind, fam, overlay: o.overlay });
  await sleep(120);
}
console.log(`\n=== M1 COERENZA OVERLAY⟺ESITO (live) ===`);
console.log(`tiri-miss verificati: ${checked} · coerenti: ${coherent} · incoerenti: ${bad.length}`);
for (const b of bad) console.log(`  ✗ gi=${b.gi} outKind=${b.outKind}→${b.fam} overlay="${b.overlay}"`);

// screenshot full-page di un paio di highlight (HUD + campo + overlay + cronaca)
for (const gi of [0, 6, 12]) {
  await page.evaluate((g) => { window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g, true, { x: 80, y: 50 }); }, gi);
  await sleep(400);
  await page.evaluate(() => { window.__CPM_RESOLVE(0); });
  await sleep(900);
  await page.screenshot({ path: path.join(OUT, `hl-${gi}.png`) });
}
console.log(`pageerrors: ${errs.length ? errs.slice(0,5) : '(nessuno)'}`);
console.log(`screenshots → tests/visual/out/live-match/`);
console.log(bad.length === 0 && errs.length === 0 ? '\n✅ LIVE OK' : '\n⚠️ VEDI SOPRA');
await browser.close(); srv.close();
