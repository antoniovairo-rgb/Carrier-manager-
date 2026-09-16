/* [D12] Il kit tinto DALL'ATTRIBUTO deve essere identico a quello tinto per nome. Due bracci, stessa partita,
   stesso seme: VERDE (corpo unito, shader) e ROSSO (__CPM_NO910: corpo a sette mesh, tintura per nome).
   Misura: chiamate di disegno per fotogramma, triangoli, colori medi del riquadro dei corpi, foto. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'd12-kit');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const ris = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; const messaggi = [];
  page.on('pageerror', (e) => { errori++; if (messaggi.length < 4) messaggi.push(String(e).slice(0, 140)); });
  page.on('console', (m) => { if (m.type() === 'error' && messaggi.length < 8) messaggi.push('console: ' + m.text().slice(0, 140)); });
  await page.addInitScript((rosso) => {
    window.__CPM_GLB = true; if (rosso) window.__CPM_NO910 = true;
    window.__CPM_DRAW = { calls: 0, frames: 0 };
    const wrap = (proto) => { if (!proto) return; for (const n of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) { const o = proto[n]; if (!o) continue; proto[n] = function (...a) { window.__CPM_DRAW.calls++; return o.apply(this, a); }; } };
    wrap(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype);
    wrap(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype);
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (fn) => raf((t) => { window.__CPM_DRAW.frames++; return fn(t); });
  }, braccio === 'rosso');
  const cdp = await ctx.newCDPSession(page);
  let lastFrame = null;
  cdp.on('Page.screencastFrame', (e) => { lastFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', quality: 92, everyNthFrame: 1 });
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_LOAD_ALL) window.__CPM_LOAD_ALL(); }).catch(() => {});
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  await sleep(4000);
  await page.evaluate(() => { window.__CPM_DRAW.calls = 0; window.__CPM_DRAW.frames = 0; });
  await sleep(8000);
  /* [confronto onesto dei colori] i due bracci sono deterministici sullo stesso seme: le posizioni allo stesso
     minuto coincidono, quindi si aspetta un minuto FISSO e si mette la camera in una posizione FISSA. Cosi' le
     due foto differiscono solo per come sono tinti i corpi, che e' l'unica cosa che questa misura deve giudicare. */
  try {
    await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.clock >= 12; } catch (_e) { return false; } }, { timeout: 60000 });
  } catch (_e) {}
  try { await page.evaluate(() => { window.__CPM_CAM904 = { x: 0, y: 2.0, z: 14, lx: 0, ly: 1.1, lz: 0 }; }); } catch (_e) {}
  await sleep(2500);
  const r = await page.evaluate(() => {
    let tri = 0, corpo = null, mesh = 0, materiali = 0;
    try { tri = window.__CPM_TRI907 ? window.__CPM_TRI907() : 0; } catch (_e) {}
    try { corpo = window.__CPM_BODY909 ? window.__CPM_BODY909() : null; } catch (_e) {}
    return { calls: window.__CPM_DRAW.calls, frames: window.__CPM_DRAW.frames, tri, corpo, mesh, materiali };
  });
  let prev = null, scatti = 0;
  for (let i = 0; i < 8; i++) { await sleep(600); if (lastFrame && (!prev || !lastFrame.equals(prev))) { prev = lastFrame; scatti++; if (scatti >= 2) break; } }
  const foto = path.join(OUT, `${braccio}.png`);
  if (prev) fs.writeFileSync(foto, prev);
  ris[braccio] = { ...r, perFrame: r.frames ? r.calls / r.frames : 0, errori, messaggi, foto: prev ? foto : null };
  console.log(`${braccio.toUpperCase()}: chiamate per fotogramma ${ris[braccio].perFrame.toFixed(0)} · triangoli ${r.tri} · corpo ${r.corpo} · errori ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''} · foto ${prev ? 'sì' : 'NO'}`);
  await browser.close();
}
const v = ris.verde, r = ris.rosso;
console.log(`\n=== D12: unito (verde) contro sette mesh (rosso) ===`);
console.log(`  chiamate di disegno per fotogramma: ${r.perFrame.toFixed(0)} → ${v.perFrame.toFixed(0)} (${(100 * (v.perFrame / r.perFrame - 1)).toFixed(1)} %)`);
console.log(`  triangoli in scena: ${r.tri} → ${v.tri} (devono essere gli stessi)`);
console.log(`  errori di pagina: rosso ${r.errori} · verde ${v.errori}`);
console.log(`  foto da confrontare a occhio sui colori dei kit: ${v.foto} · ${r.foto}`);
server.close();
