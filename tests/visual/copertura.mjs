/* [7.892.0 SONDA] COPERTURA DEL CAMPO — quanto la riga di telecronaca (data-cpm="com661") e il suo
   contenitore di scelte (data-cpm="sc681") si mangiano il campo 3D visibile sul telefono.
   Il 7.892 sposta la riga in una banda in basso (prima stava al 38% dell'altezza, SOPRA i giocatori) e
   rende compatti i bottoni delle interazioni. Questa sonda non giudica una singola scena: campiona per
   tutta la durata di UNA partita vera (autoplay seedato, clock vero — non forza le Situations) e misura,
   fotogramma per fotogramma, dove sta la riga rispetto al rettangolo del canvas — mai a orologio fisso su
   una scena sola (lezione 7.483: una pagina stanca non e' il gioco; qui il campione E' l'intera partita).
   Non e' un guardiano: non fallisce sul risultato, stampa la misura e uscendo 0 lascia dire al PO se la
   copertura misurata gli va bene. Rosso `__CPM_NO892` rimette il comportamento vecchio (riga sopra i
   giocatori, bottoni non compatti) per confronto a due gambe. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const DUR_S = Number(process.env.CPM_DUR_S || 150);
const STEP_MS = 150;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = process.env.CPM_ROSSO || '';
await page.addInitScript((o) => { window.__CPM_GLB = false; if (o.rosso) window[o.rosso] = true; }, { rosso: ROSSO });
await openMatch(page, port, { skipLoadAll: true, name: 'Ch' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));

const campioni = [];
const t0 = Date.now();
const tEnd = t0 + DUR_S * 1000;
while (Date.now() < tEnd) {
  let c = null;
  try {
    c = await page.evaluate(() => {
      const visRect = (sel) => {
        const el = document.querySelector(`[data-cpm="${sel}"]`);
        if (!el || el.offsetParent === null) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, height: r.height, width: r.width, el };
      };
      const canvases = [...document.querySelectorAll('canvas')];
      let best = null, bestArea = -1;
      for (const cv of canvases) {
        const r = cv.getBoundingClientRect();
        const area = r.width * r.height;
        if (r.width > 0 && r.height > 0 && area > bestArea) { bestArea = area; best = r; }
      }
      const canvas = best ? { top: best.top, height: best.height, width: best.width } : null;
      const comR = visRect('com661');
      const scR = visRect('sc681');
      let comTxt = null;
      if (comR) {
        const el = document.querySelector('[data-cpm="com661"]');
        // il nodo porta un <style> figlio (keyframes CSS): va escluso dal testo, o il testo misurato e' CSS
        const clone = el ? el.cloneNode(true) : null;
        if (clone) clone.querySelectorAll('style').forEach(s => s.remove());
        comTxt = String((clone && clone.textContent) || '').trim().slice(0, 60);
      }
      return {
        phase: typeof window.__CPM_PHASE === 'function' ? window.__CPM_PHASE() : null,
        clock: typeof window.__CPM_CLOCK === 'function' ? window.__CPM_CLOCK() : null,
        canvas,
        com: comR ? { top: comR.top, bottom: comR.bottom, height: comR.height, width: comR.width, text: comTxt } : null,
        sc: scR ? { top: scR.top, bottom: scR.bottom, height: scR.height, width: scR.width } : null,
      };
    });
  } catch (_e) { c = null; }
  if (c) campioni.push(c);
  await new Promise(r => setTimeout(r, STEP_MS));
}

await b.close(); srv.close();

// ---- calcolo fuori dalla pagina ----
function mediana(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, c) => a - c);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function p90(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, c) => a - c);
  const idx = Math.min(s.length - 1, Math.ceil(0.9 * s.length) - 1);
  return s[idx];
}

const validi = campioni.filter(c => c.canvas && c.canvas.height > 0 && c.canvas.width > 0);
const N = validi.length;

if (N === 0) {
  console.log('NON GIUDICABILE: 0 campioni validi (nessun canvas visibile misurato).');
  process.exit(1);
}

const conRigaArr = validi.filter(c => c.com);
const topFracArr = [];
const areaFracArr = [];
let sopraMetaN = 0;
for (const c of conRigaArr) {
  const topFrac = (c.com.top - c.canvas.top) / c.canvas.height;
  const areaFrac = (c.com.width * c.com.height) / (c.canvas.width * c.canvas.height);
  topFracArr.push(topFrac);
  areaFracArr.push(areaFrac);
  if (topFrac < 0.5) sopraMetaN++;
}

const conScelteArr = validi.filter(c => c.sc && c.com);
const hFracArr = [];
const topScelteFracArr = [];
for (const c of conScelteArr) {
  const hFrac = c.com.height / c.canvas.height;
  const topFrac = (c.com.top - c.canvas.top) / c.canvas.height;
  hFracArr.push(hFrac);
  topScelteFracArr.push(topFrac);
}

const esempiTesto = [];
for (const c of conRigaArr) {
  if (c.com.text && !esempiTesto.includes(c.com.text)) esempiTesto.push(c.com.text);
  if (esempiTesto.length >= 3) break;
}

const fix3 = x => (x == null ? null : +x.toFixed(3));

console.log(`\n=== COPERTURA DEL CAMPO (${ROSSO ? 'rosso ' + ROSSO : 'verde'}) — durata ${DUR_S}s, passo ${STEP_MS}ms ===\n`);
console.log(`  campioni totali (canvas visibile): ${N}`);
console.log(`  campioni con riga (com661) presente: ${conRigaArr.length}`);
console.log(`  quota "sopra la meta'" del canvas: ${conRigaArr.length ? (100 * sopraMetaN / conRigaArr.length).toFixed(1) : 'n/d'}%`);
console.log(`  topFrac — mediana: ${fix3(mediana(topFracArr))}  p90: ${fix3(p90(topFracArr))}`);
console.log(`  areaFrac — mediana: ${fix3(mediana(areaFracArr))}  p90: ${fix3(p90(areaFracArr))}`);
console.log(`  campioni con interazione (sc681) presente: ${conScelteArr.length}`);
console.log(`  hFrac (altezza blocco com661, con scelte aperte) — mediana: ${fix3(mediana(hFracArr))}  max: ${fix3(hFracArr.length ? Math.max(...hFracArr) : null)}`);
console.log(`  topFrac (con scelte aperte) — mediana: ${fix3(mediana(topScelteFracArr))}`);
console.log(`  esempi di testo della riga:`);
for (const t of esempiTesto) console.log(`    - "${t}"`);
if (!esempiTesto.length) console.log('    (nessuno: la riga non e\' mai comparsa nel campionamento)');

const out = {
  campioni: N,
  conRiga: conRigaArr.length,
  sopraMeta: fix3(conRigaArr.length ? sopraMetaN / conRigaArr.length : null),
  topMediana: fix3(mediana(topFracArr)),
  topP90: fix3(p90(topFracArr)),
  areaMediana: fix3(mediana(areaFracArr)),
  areaP90: fix3(p90(areaFracArr)),
  conScelte: conScelteArr.length,
  hScelteMediana: fix3(mediana(hFracArr)),
  hScelteMax: fix3(hFracArr.length ? Math.max(...hFracArr) : null),
  topScelteMediana: fix3(mediana(topScelteFracArr)),
};
console.log(`\nCOPERTURA: ${JSON.stringify(out)}\n`);
process.exit(0);
