/* [23/09] B0 — DA DOVE NASCE OGNI SCENA DELL'EROE. Gioca partite intere (2x, highlight risolti via hook, «Continua») e
   legge dal registro `__CPM_EV` gli eventi `scena` con la loro sorgente (motore-occasione · calendario-tick · catena ·
   si-continua · calendario). Metro di B0 (MACRO-PIANO): scene nate da un evento del motore N/N.
   CPM_PARTITE, CPM_DA (indice seme), CPM_SEC (tetto per partita), CPM_ROSSO=<interruttore>, CPM_TAG. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const N = Number(process.env.CPM_PARTITE || 2), DA = Number(process.env.CPM_DA || 0), ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer(); const browser = await launchBrowser();
const esiti = [];
for (let p = DA; p < DA + N; p++) {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} if (r) window[r] = true; }, ROSSO);
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Scene ' + p });
  const t0 = Date.now(); let hl = 0, fine = null;
  while (Date.now() - t0 < Number(process.env.CPM_SEC || 260) * 1000) {
    const f = await page.evaluate(() => window.__CPM_PHASE?.() || null).catch(() => null);
    if (f === 'ended') { fine = 'ended'; break; }
    if (f === 'hl_choose') { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k % 3), hl++).catch(() => {}); await sleep(1500); }
    if (f === 'hl_result') { await sleep(2000); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Continua/i.test(x.textContent || '')); if (b) b.click(); }).catch(() => {}); }
    await sleep(400);
  }
  const scene = await page.evaluate(() => { const EV = typeof window.__CPM_EV === 'function' ? window.__CPM_EV() : (window.__CPM_EV || []); return (EV || []).filter(e => e && e.ev === 'scena').map(e => ({ min: e.min, src: e.src, tipo: e.tipo || null, sk: e.sk || null })); }).catch(() => []);
  const perSrc = {}; scene.forEach(s => { perSrc[s.src] = (perSrc[s.src] | 0) + 1; });
  esiti.push({ partita: p, fine, highlight: hl, scene, perSrc, errori });
  console.log(`partita ${p}: fine ${fine} · scene ${scene.length} · ${JSON.stringify(perSrc)} · errori ${errori.length}`);
  await page.close();
}
const tot = {}; esiti.forEach(e => Object.entries(e.perSrc).forEach(([k, v]) => { tot[k] = (tot[k] | 0) + v; }));
const n = Object.values(tot).reduce((a, b) => a + b, 0);
console.log(`TOTALE scene ${n} · dal motore ${tot['motore-occasione'] | 0}/${n} · ${JSON.stringify(tot)}`);
const out = path.join(here, 'scene-sorgenti'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, `${process.env.CPM_TAG || 'base'}-${DA}.json`), JSON.stringify({ rosso: ROSSO || null, tot, esiti }, null, 1));
await browser.close(); server.close();
