/* [7.893 STRUMENTO] LA BARRA SUPERIORE SI SPECCHIA NEL SECONDO TEMPO?
   PO 14/09: «nella barra superiore la posizione degli scudetti e delle relative statistiche devono essere
   invertite tra il primo ed il secondo tempo». Questa sonda non giudica lo stile: legge la posizione a
   schermo dei due blocchi (data-cpm="scudo-casa" / "scudo-ospiti") nel primo tempo (minuto 20-44) e nel
   secondo (dal 50'), e dice se il blocco di casa e' passato da sinistra a destra. Rosso: CPM_ROSSO=__CPM_NO893. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((o) => { window.__CPM_GLB = false; if (o.rosso) window[o.rosso] = true; }, { rosso: ROSSO });
await openMatch(page, port, { skipLoadAll: true, name: 'Ch' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const leggi = () => page.evaluate(() => { try {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return { x: +q.left.toFixed(0), w: +q.width.toFixed(0) }; };
  const bar = document.querySelector('[data-cpm="barra893"]');
  return { min: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, casa: r('[data-cpm="scudo-casa"]'), ospiti: r('[data-cpm="scudo-ospiti"]'), specchio: bar ? bar.getAttribute('data-specchio') : null };
} catch (e) { return null; } });
let primo = null, secondo = null; const t0 = Date.now();
while (Date.now() - t0 < 300000) {
  const s = await leggi();
  if (s && s.min != null && s.casa && s.ospiti) {
    if (!primo && s.min >= 20 && s.min <= 44) primo = s;
    if (!secondo && s.min >= 50) { secondo = s; break; }
  }
  await page.waitForTimeout(200);
}
await b.close(); srv.close();
if (!primo || !secondo) { console.log('NON GIUDICABILE: primo', JSON.stringify(primo), 'secondo', JSON.stringify(secondo)); process.exit(1); }
const sinistra = (s) => s.casa.x < s.ospiti.x;
const out = { primoTempo: { min: primo.min, casaX: primo.casa.x, ospitiX: primo.ospiti.x, casaASinistra: sinistra(primo), specchio: primo.specchio },
  secondoTempo: { min: secondo.min, casaX: secondo.casa.x, ospitiX: secondo.ospiti.x, casaASinistra: sinistra(secondo), specchio: secondo.specchio },
  invertito: sinistra(primo) !== sinistra(secondo) };
console.log(`\nSCUDETTI: ${JSON.stringify(out)}\n`);
