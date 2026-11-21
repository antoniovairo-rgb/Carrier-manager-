/* [giro 310 PO-584 T5] Infortuni dell'eroe a stagione con la funzione VERA (simInjuryRoll, esposta da __CPM_CAREER), fatica curata (38) e
   trascurata (78), verde contro rosso __CPM_NO_G310D. 38 partite a stagione, l'assenza salta le partite. CPM_S=4000 node misura-310-infortuni.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const NS = +(process.env.CPM_S || 4000);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(pl => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, EROE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.simInjuryRoll), null, { timeout: 60000 });
const R = await page.evaluate(NS => { const C = window.__CPM_CAREER; const P0 = C.snapshot(); const out = {};
  for (const rosso of [false, true]) { window.__CPM_NO_G310D = rosso ? 1 : undefined;
    for (const f of [30, 38, 55, 70, 78]) { let t = 0, z = 0, wk = 0;
      for (let s = 0; s < NS; s++) { let n = 0, ass = 0; for (let m = 0; m < 38; m++) { if (ass > 0) { ass--; continue; }
        const r = C.simInjuryRoll({ ...P0, injured: false, fatigue: f }, (s * 977 + m * 31 + f * 7 + 1) >>> 0); if (r && r.injured) { n++; ass = r.injuryWeeks; wk += r.injuryWeeks; } }
        t += n; if (!n) z++; }
      out[(rosso ? 'rosso' : 'verde') + ' · fatica ' + f] = { infortuniStagione: +(t / NS).toFixed(2), stagioniSenza: +(z / NS).toFixed(3), settimaneFuori: +(wk / NS).toFixed(1) }; } }
  window.__CPM_NO_G310D = undefined; return out; }, NS);
console.table(R); if (errors.length) console.log('errori pagina', errors.slice(0, 3));
fs.mkdirSync('out/misura-310', { recursive: true }); fs.writeFileSync('out/misura-310/infortuni.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
