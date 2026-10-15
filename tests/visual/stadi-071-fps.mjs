#!/usr/bin/env node
/* [giro 46 PO-071 fase 3 — strumento di collaudo, NON guardiano] fps headless e costo di render delle nuove tipologie di stadio
   contro gli stadi di oggi, a parita' di tutto: stesso build, stesso template forzato e capienza, stessa scena (gi13), stessa
   camera fissa (vista TV), ora congelata (notte). Braccio «oggi» = interruttore rosso __CPM_NO_STADI246. Ogni braccio si ripete
   CPM_GIRI volte (default 2) su pagina nuova e si media: fra due giri l'fps headless si muove quanto l'effetto cercato.
   ⚠️ L'fps headless e' software-rendered: vale il CONFRONTO fra bracci, non il valore assoluto (che sul telefono e' un altro).
   Uso: node stadi-071-fps.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GIRI = +(process.env.CPM_GIRI || 2);
const CASI = [['borgo', 3000], ['catino', 24000], ['mattoni', 22000], ['arena', 60000]];
const TV = { x: 0, y: 16, z: 34, lx: 0, ly: 4, lz: -30 };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function misura(tpl, cap, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; if (o.r) window.__CPM_NO_STADI246 = 1; }, { tpl, cap, r: rosso });
  await openMatch(page, port, { skipLoadAll: true, name: 'Fps071' }); await sleep(800);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true));
  await page.waitForFunction(() => !!window.__CPM_PALI69, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(c => { window.__CPM_CAM904 = c; }, TV); await sleep(6500);
  const r = await page.evaluate(() => { const f = window.__CPM_FPS907 && window.__CPM_FPS907(); const ri = window.__CPM_RINFO769 && window.__CPM_RINFO769();
    return { fps: f ? f.fps5s : null, calls: ri ? ri.calls : null, tri: ri ? ri.tri : null, geo: ri ? ri.geo : null, tex: ri ? ri.tex : null }; });
  await page.close(); return r;
}
const media = a => { const v = a.filter(x => x != null); return v.length ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : null; };
const righe = [];
for (const [t, cap] of CASI) {
  const acc = { oggi: [], nuovo: [] };
  for (let i = 0; i < GIRI; i++) { acc.oggi.push(await misura(t, cap, true)); acc.nuovo.push(await misura(t, cap, false)); }
  const m = k => ({ fps: media(acc[k].map(x => x.fps)), calls: media(acc[k].map(x => x.calls)), tri: media(acc[k].map(x => x.tri)), geo: media(acc[k].map(x => x.geo)), tex: media(acc[k].map(x => x.tex)) });
  const o = m('oggi'), n = m('nuovo'); righe.push({ t, cap, oggi: o, nuovo: n });
  console.log(`${t}:${cap} — fps oggi ${o.fps} → nuovo ${n.fps} · draw call ${o.calls} → ${n.calls} · triangoli ${o.tri} → ${n.tri} · geometrie ${o.geo} → ${n.geo} · texture ${o.tex} → ${n.tex}`);
}
await b.close(); srv.close();
console.log(JSON.stringify(righe));
