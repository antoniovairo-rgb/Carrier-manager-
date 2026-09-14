#!/usr/bin/env node
/* 7.537 — VIVACITA' DEI COLORI (nota PO «i colori non sono ancora vividi come prima delle modifiche
   sulle luci»). ⚠️ La prima stesura scattava durante l'autoplay: ogni scatto pescava un'inquadratura
   diversa e la stessa esposizione dava -1,1% e -15,1% in due giri — misurava la scena, non la luce.
   Ora i fotogrammi sono CONTROLLATI: tre scene forzate e CONGELATE (stessa camera, stesso istante) per
   ogni braccio; si confronta la saturazione media (HSV) e la luminosità col mondo pre-7.529 (R5 spenta). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, freeze, sleep } from './lib/harness.mjs';
import { PNG } from 'pngjs'; import fs from 'node:fs';
const SCENE = [0, 30, 120];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function braccio(tag, init) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(init);
  /* ⚠️ NOME FISSO: il seed di partita nasce anche dal nome (7.496) — con un nome per braccio i due
     confronti giravano su partite DIVERSE, cioe' su kit di colori diversi: la stessa build ha dato
     -10,4%/-3,8% in un giro e -4,0%/-10,0% (esattamente scambiati) in quello dopo. Il rumore era lo
     strumento, di nuovo. */
  await openMatch(page, port, { name: 'SatFix' });
  let sSum = 0, vSum = 0, n = 0;
  for (const gi of SCENE) {
    await forceSituation(page, gi, { settle: 900, choose: true });
    await freeze(page);
    const f = '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad/sat-' + tag + '-' + gi + '.png';
    await page.screenshot({ path: f });
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const png = PNG.sync.read(fs.readFileSync(f));
    for (let i = 0; i < png.data.length; i += 4) {
      const R = png.data[i] / 255, G = png.data[i + 1] / 255, B = png.data[i + 2] / 255;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx < 0.08) continue;
      sSum += (mx === 0 ? 0 : (mx - mn) / mx); vSum += mx; n++;
    }
  }
  await page.close();
  return { S: +(sSum / n).toFixed(4), V: +(vSum / n).toFixed(4) };
}
const prima = await braccio('prima', () => { window.__CPM_GLB = false; window.__CPM_NO533 = 1; });
console.log(`PRIMA (R5 spenta, il mondo pre-7.529) — saturazione ${prima.S} · luminosità ${prima.V}`);
const senza = await braccio('senza', () => { window.__CPM_GLB = false; window.__CPM_NO552 = 1; });
console.log(`SENZA rimedio (7.536) — saturazione ${senza.S} (${(((senza.S - prima.S) / prima.S) * 100).toFixed(1)}%) · luminosità ${senza.V} (${(((senza.V - prima.V) / prima.V) * 100).toFixed(1)}%)`);
const con = await braccio('con', () => { window.__CPM_GLB = false; });
console.log(`CON rimedio  (7.537) — saturazione ${con.S} (${(((con.S - prima.S) / prima.S) * 100).toFixed(1)}%) · luminosità ${con.V} (${(((con.V - prima.V) / prima.V) * 100).toFixed(1)}%)`);
await b.close(); srv.close();
