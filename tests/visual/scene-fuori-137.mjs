#!/usr/bin/env node
/* [giro 47 · PO-137] GUARDIANO — LE SCENE 3D FUORI DALLA PARTITA REGGONO IL TELEFONO IN VERTICALE (412x915, corpi accesi).
   (a) GALA': la camera allarga il fov in verticale (testimone __CPM_GALAFOV137.fov > 46): a 46° il campo orizzontale era ~21°
       e i presentatori a |x|=1,7 uscivano tagliati — rosso __CPM_NO_GALAFOV137 (fov 46);
   (b) GALA': i flash dei fotografi sono bagliori rotondi (__CPM_FLASH137.tondo), non quadrati — rosso __CPM_NO_FLASH137;
   (c) PARATA: la folla dipinta e' alta 3,4 e accesa (>=0,7) — rosso __CPM_NO_FOLLA137 (2,6 · 0,35).
   Le misure percettive stanno nel censimento: docs/sviluppo/foto-giro47 (censimento-scene-47.mjs).          */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rossi) {
  const o = { errs: [] };
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  p.on('pageerror', e => o.errs.push(String(e.message).slice(0, 120)));
  await p.addInitScript(x => { for (const k of x.r) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(x.s)); }, { s: SAVE, r: rossi });
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await p.evaluate(() => window.__CPM_CAREER.apriGala());
  await p.waitForFunction(() => !!window.__CPM_GALAFOV137, null, { timeout: 30000 }).catch(() => {}); await sleep(1500);
  Object.assign(o, await p.evaluate(() => ({ fov: (window.__CPM_GALAFOV137 || {}).fov ?? null, tondo: (window.__CPM_FLASH137 || {}).tondo ?? null })));
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
  await p.evaluate(() => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
    const club = { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 80, c: '#c8102e', c2: '#ffffff', nat: '🏴', lg: 'Premier Division' };
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club, euroWin: false, avatarId: 0, heroNum: 77 })); });
  await p.waitForFunction(() => !!window.__CPM_FOLLA137, null, { timeout: 30000 }).catch(() => {});
  o.folla = await p.evaluate(() => window.__CPM_FOLLA137 || null);
  await p.close(); return o;
}
const V = await braccio([]), R = await braccio(['__CPM_NO_GALAFOV137', '__CPM_NO_FLASH137', '__CPM_NO_FOLLA137']);
await b.close(); srv.close();
console.log('VERDE:', JSON.stringify(V)); console.log('ROSSO:', JSON.stringify(R));
const g = [];
if (!(V.fov > 50)) g.push(`gala': fov ${V.fov} (in verticale deve allargarsi oltre 50)`);
if (V.tondo !== true) g.push('gala\': flash ancora quadrati');
if (!(V.folla && V.folla.h >= 3.4 && V.folla.luce >= 0.7)) g.push('parata: folla bassa o spenta ' + JSON.stringify(V.folla));
if (V.errs.length) g.push('pageerror: ' + V.errs[0]);
if (!(R.fov === 46 && R.tondo === false && R.folla && R.folla.h === 2.6)) g.push('il rosso non si vede: ' + JSON.stringify(R));
if (g.length) { console.log('❌ scene-fuori-137 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ scene-fuori-137 verde (e il rosso si vede)');
