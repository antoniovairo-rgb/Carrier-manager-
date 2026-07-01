/* Repro (GLB ON, NO cpmtest): home → Nuova carriera → crea → PROVINO → cattura eventuali crash/errori.
   Serve a diagnosticare "i provini non funzionano più". */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = [], cons = [];
page.on('pageerror', e => errs.push(String(e && e.stack || e)));
page.on('console', m => { if (m.type() === 'error') cons.push(m.text()); });

await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1200);
const clickText = async (re) => page.evaluate((rs) => { const rx = new RegExp(rs, 'i'); const b = [...document.querySelectorAll('button')].find(x => rx.test(x.textContent || '')); if (b) { b.click(); return true; } return false; }, re.source);

console.log('nuova carriera: ' + await clickText(/nuova carriera/));
await sleep(900);
// compila il nome
await page.evaluate(() => { const inp = document.querySelector('input[type="text"],input:not([type])'); if (inp) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(inp, 'Test Bomber'); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
await sleep(500);
console.log('INIZIA I PROVINI: ' + await clickText(/inizia i provini/));
await sleep(900);
console.log('Inizia il provino: ' + await clickText(/inizia il provino/));
await sleep(6000); // lascia montare la LiveMatch del provino + caricare il GLB
// MISURA LUMINOSITÀ del canvas 3D: uno "schermo nero" = canvas quasi tutto scuro
const bright = await page.evaluate(() => {
  const c = document.querySelector('canvas'); if (!c) return { noCanvas: true };
  const w = c.width, h = c.height;
  // rileggi via un canvas 2D di copia
  const cp = document.createElement('canvas'); cp.width = Math.min(w, 200); cp.height = Math.min(h, 200);
  const ctx = cp.getContext('2d'); ctx.drawImage(c, 0, 0, cp.width, cp.height);
  let sum = 0, n = 0, lit = 0; const d = ctx.getImageData(0, 0, cp.width, cp.height).data;
  for (let i = 0; i < d.length; i += 4) { const lum = (d[i] + d[i + 1] + d[i + 2]) / 3; sum += lum; n++; if (lum > 30) lit++; }
  return { w, h, avg: +(sum / n).toFixed(1), litPct: +(lit / n * 100).toFixed(1) };
});
console.log('canvas: ' + bright.w + 'x' + bright.h + ' · luminosità media=' + bright.avg + '/255 · pixel illuminati=' + bright.litPct + '%');
if (!bright.noCanvas && bright.avg < 8) console.log('  ⚠️ CANVAS QUASI NERO → schermo nero riprodotto!');
// GIOCA: per ~70s clicca qualunque bottone azione/continua dell'highlight, catturando crash a runtime
let clicks = 0;
for (let t = 0; t < 70; t++) {
  const did = await page.evaluate(() => {
    const body = document.body.innerText || '';
    if (/ERRORE LiveMatch/i.test(body)) return 'ERR';
    // bottoni azione dell'highlight / continua / prossimo
    const btns = [...document.querySelectorAll('button')].filter(b => {
      const t = (b.textContent || '').trim(); const r = b.getBoundingClientRect();
      return t && r.width > 0 && r.height > 0 && !/nuova carriera|impostazioni|indietro|carica/i.test(t);
    });
    // preferisci azioni di gioco / continua
    const pri = btns.find(b => /continua|prosegui|→|risultati provino|conferma/i.test(b.textContent || '')) || btns[0];
    if (pri) { pri.click(); return pri.textContent.trim().slice(0, 30); }
    return null;
  });
  if (did === 'ERR') { break; }
  if (did) clicks++;
  await sleep(1000);
}
console.log('interazioni durante il gioco: ' + clicks);

const state = await page.evaluate(() => {
  const body = document.body.innerText || '';
  return {
    errBoundary: /ERRORE LiveMatch/i.test(body),
    errMsg: (body.match(/ERRORE LiveMatch[\s\S]{0,220}/i) || [''])[0].replace(/\s+/g, ' ').slice(0, 240),
    hasCanvas: !!document.querySelector('canvas'),
    provinoBadge: /PROVINO/i.test(body),
  };
});
await browser.close(); srv.close();

console.log('\n— DIAGNOSI —');
console.log('canvas 3D presente: ' + state.hasCanvas);
console.log('badge PROVINO presente: ' + state.provinoBadge);
console.log('error boundary "ERRORE LiveMatch": ' + state.errBoundary);
if (state.errMsg) console.log('  → ' + state.errMsg);
console.log('pageerror: ' + (errs.length ? '\n  ' + errs.slice(0, 3).join('\n  ') : 'nessuno'));
console.log('console.error: ' + (cons.length ? '\n  ' + cons.slice(0, 5).join('\n  ') : 'nessuno'));
const broken = state.errBoundary || errs.length > 0;
console.log('\n' + (broken ? '❌ PROVINO ROTTO — vedi errore sopra.' : (state.hasCanvas ? '✅ provino OK (canvas 3D montato, nessun errore).' : '⚠️ inconcludente (nessun canvas, nessun errore).')));
process.exit(broken ? 1 : 0);
