#!/usr/bin/env node
/* [giro 331] SONDA (solo misura) della serata di presentazione per pelle-240: N passate del testimone misuraPelle240, per ogni passata
   il colore reso di ogni viso, la foto del primo piano dei primi corpi e lo stato della scena (luci, punti additivi visibili).
   Uso: node misura-331-pelle.mjs   · CPM_N=12 · CPM_FOTO=out/g331/pelle */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g331', { recursive: true });
const N = +(process.env.CPM_N || 12), FOTO = process.env.CPM_FOTO || 'out/g331/pelle', EXTRA = process.env.CPM_EXTRA ? JSON.parse(process.env.CPM_EXTRA) : {};
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage();
await p.addInitScript(([o, ex]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'night'; for (const k in ex) window[k] = ex[k]; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, EXTRA]);
await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200); try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(1));
await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 });
await p.waitForFunction(() => window.__CPM_PRES142.men.every(m => { const h = m.userData && m.userData.cpmNativeHair; return h && h.applied; }), null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
for (let g = 0; g < N; g++) {
  await p.evaluate((r) => { window.__CPM_G240W = { chiedi: true, scena: 'presentazione', esiti: [], foto: [], fotoMax: 6, raggio: +r }; }, process.env.CPM_RAGGIO || 0);
  await p.waitForFunction(() => { const W = window.__CPM_G240W; return W && (W.esiti.length > 0 || W.errore); }, null, { timeout: 60000 }).catch(() => {});
  const r = await p.evaluate(() => { const W = window.__CPM_G240W, E = W.esiti[0]; if (!E) return { err: W.errore || 'muto' }; const S = window.__CPM_PRES142.scene; const luci = [], punti = [];
    S.traverse(o => { if (o.isLight) luci.push((o.type || '').replace('Light', '') + ':' + (+o.intensity.toFixed(2)) + (o.visible ? '' : '(off)')); if (o.isPoints && o.visible) punti.push((o.material.opacity != null ? +o.material.opacity.toFixed(2) : '?') + '/' + (o.material.blending) + '/' + (o.material.depthTest ? 'dt' : 'nodt')); });
    return { t: E.t, corpi: E.corpi.filter(c => c.nome).map(c => ({ n: c.nome, reso: c.reso, px: c.px })), luci: luci.join(' '), punti: punti.join(' '), foto: W.foto, w: window.__CPM_PRES331 || null }; });
  if (r.err) { console.log(g, 'ERR', r.err); continue; }
  (r.foto || []).forEach((u, i) => { if (u) fs.writeFileSync(`${FOTO}-p${g}-v${i}.jpg`, Buffer.from(u.split(',')[1], 'base64')); });
  console.log(g, 't', r.t, r.corpi.map(c => c.n.split(' ')[0] + ' ' + (c.reso || []).join(',') + '(' + c.px + ')').join(' | ')); console.log('   luci', r.luci, '· punti', r.punti, r.w ? JSON.stringify(r.w) : '');
  await sleep(+(process.env.CPM_PASSO || 1200)); }
await b.close(); srv.close();
