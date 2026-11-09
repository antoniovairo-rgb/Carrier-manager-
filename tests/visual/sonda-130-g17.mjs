/* [giro 130] sonda: su pc, quando nasce/muore la pillola d'esito e quanto costa un campione del ciclo G17 di collaudo-110 */
import * as L from './lib/misura-110.mjs';
const N = +(process.env.N || 1); const f = L.FORMATI.find(x => x.k === (process.env.FMT || 'pc'));
const srv = await L.startServer(); const port = srv.address().port; const b = await L.launchBrowser();
for (let i = 0; i < N; i++) {
  const { ctx, page } = await L.apriCarriera(b, port, f, 'giallo', { flags: [], anim: true });
  await L.armaMisure(page); await L.portaPartita(page, 'playing', {});
  if (!(await L.portaScelta(page))) { console.log('scelta non raggiunta'); await ctx.close(); continue; }
  await page.evaluate(() => { window.__t130 = []; const ob = new MutationObserver(() => { const p = document.querySelector('[data-cpm="pillola-esito"]'); const s = !!p; const l = window.__t130[window.__t130.length - 1]; if (!l || l.s !== s) window.__t130.push({ s, t: performance.now() }); }); ob.observe(document.body, { subtree: true, childList: true }); window.__t130_0 = performance.now(); });
  const t0 = Date.now(); const okr = await L.risolvi(page, 'gol'); const tr = Date.now() - t0;
  const pass = []; let n = 0;
  for (let k = 0; k < 40; k++) { const a = Date.now(); const r = await page.evaluate(() => { const bx = document.querySelector('[data-cpm="vista3d-box"]'), p = document.querySelector('[data-cpm="pillola-esito"]'); return !!(bx && p); }); pass.push(Date.now() - a); if (r) n++; await L.sleep(170); }
  const tl = await page.evaluate(() => window.__t130.map(x => (x.s ? '+' : '-') + Math.round(x.t - window.__t130_0)));
  const fps = await page.evaluate(() => new Promise(r => { let c = 0; const s = performance.now(); const g = () => { c++; if (performance.now() - s < 1000) requestAnimationFrame(g); else r(c); }; requestAnimationFrame(g); }));
  pass.sort((x, y) => x - y);
  console.log(`${f.k} giro ${i + 1}: risolvi ${okr} in ${tr} ms · campioni ${n} · evaluate mediana ${pass[20]} ms max ${pass[39]} · pillola ${tl.join(' ')} (ms dal force) · fps ${fps}`);
  await ctx.close();
}
await b.close(); srv.close();
