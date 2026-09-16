/* [C11 · 7.911] I ventidue bambini dell'ingresso in campo: sono corpi CH38, stanno per mano ai calciatori,
   hanno i piedi a terra? Due bracci: VERDE (corpi CH38) e ROSSO (__CPM_NO911, figure procedurali).
   La cerimonia dura pochi secondi e passa da sola: invece di rincorrerla, un campionatore nella pagina
   registra il MASSIMO visto e la foto si scatta appena i bambini entrano in scena. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'bambini-911');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const ris = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript((rosso) => {
    window.__CPM_GLB = true; if (rosso) window.__CPM_NO911 = true;
    window.__CPM_M911MAX = null; window.__CPM_FASI911 = []; window.__CPM_PRONTI911 = null;
    setInterval(() => {
      try {
        const f = (window.__CPM_PHASE && window.__CPM_PHASE()) || null;
        const L = window.__CPM_FASI911;
        if (f && (!L.length || L[L.length - 1].f !== f)) L.push({ f, t: Math.round(performance.now()) });
        const m = window.__CPM_MASCOT911 ? window.__CPM_MASCOT911() : null;
        if (!m) return;
        if (window.__CPM_PRONTI911 == null && m.corpi > 0) window.__CPM_PRONTI911 = { t: Math.round(performance.now()), fase: f };
        const p = window.__CPM_M911MAX;
        if (!p || m.attivi > p.attivi) window.__CPM_M911MAX = Object.assign({ fase: f }, m);
      } catch (_e) {}
    }, 100);
  }, braccio === 'rosso');
  const cdp = await ctx.newCDPSession(page);
  let lastFrame = null;
  cdp.on('Page.screencastFrame', (e) => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', quality: 92, everyNthFrame: 1 });
  let foto = null;
  const scatta = () => { if (lastFrame) { foto = path.join(OUT, `${braccio}.png`); fs.writeFileSync(foto, lastFrame); } };
  /* il percorso del provino entra dritto in `playing` (misurato: unica fase attraversata): la cerimonia si
     raggiunge col gancio di collaudo, come si fa da sempre con la premiazione. */
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' }).catch(() => null);
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  await page.evaluate(() => { try { return window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT(); } catch (_e) { return false; } });
  for (let i = 0; i < 26 && !foto; i++) {
    await sleep(400);
    const m = await page.evaluate(() => { try { return window.__CPM_MASCOT911 ? window.__CPM_MASCOT911() : null; } catch (_e) { return null; } }).catch(() => null);
    if (m && m.attivi > 0) { await sleep(600); scatta(); }
  }
  const max = await page.evaluate(() => window.__CPM_M911MAX || null).catch(() => null);
  const fasi = await page.evaluate(() => window.__CPM_FASI911 || []).catch(() => []);
  const pronti = await page.evaluate(() => window.__CPM_PRONTI911 || null).catch(() => null);
  ris[braccio] = { max, errori, foto, fasi, pronti };
  console.log(`${braccio.toUpperCase()}: massimo visto = ${JSON.stringify(max)} · errori ${errori} · foto ${foto ? 'sì' : 'NO'}`);
  console.log(`  fasi attraversate: ${fasi.map((x) => x.f + '@' + x.t).join(' → ') || '(nessuna)'}`);
  console.log(`  bambini pronti: ${pronti ? pronti.t + ' ms, in fase ' + pronti.fase : 'mai'}`);
  await browser.close();
}
const v = ris.verde.max;
console.log('\n=== C11: i bambini dell\'ingresso ===');
const esiti = [
  ['il gancio esiste e vede i bambini', !!v],
  ['sono corpi CH38, tutti e ventidue', !!(v && v.corpi >= 20 && v.corpi === v.totale)],
  ['se ne vedono in scena durante la cerimonia', !!(v && v.attivi > 0)],
  ['nessun bambino sospeso: piedi entro 0,15u dal prato', !!(v && v.y && v.y.length && v.y.every((q) => Math.abs(q) <= 0.15))],
  ['nessun errore di pagina', ris.verde.errori === 0 && ris.rosso.errori === 0],
];
for (const [t, ok] of esiti) console.log(`  ${ok ? '✅' : '❌'} ${t}`);
console.log(`\n  foto (proporzioni da bambino, mano nella mano): ${ris.verde.foto} · ${ris.rosso.foto}`);
server.close();
