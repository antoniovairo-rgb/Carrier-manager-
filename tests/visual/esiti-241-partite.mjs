#!/usr/bin/env node
/* [giro 41 PO-218/240] CENSIMENTO SUL FLUSSO VERO — strumento, non guardiano. Partite intere dal salvataggio S12 (come esiti-218), pilota
   seedato; per ogni scena dell'eroe abbina riquadro (__CPM_OUTCOME, campionato durante hl_result), motore (__CPM_RES218) e 3D (__CPM_V241)
   e le giudica col classificatore del censimento forzato (lib/esiti-241.mjs).
   Uso: node esiti-241-partite.mjs [semi separati da virgola]   (CPM_GLB=1 per il GLB acceso; CPM_ROSSO=1 per il braccio rosso) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname as LIBDIR } from './lib/harness.mjs';
import { contraddizioni } from './lib/esiti-241.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = (process.argv[2] || '1234,2021').split(',').map(Number);
const ROSSO = !!process.env.CPM_ROSSO, GLB = !!process.env.CPM_GLB;
const srv = await startServer(); const b = await launchBrowser(); const tutte = [];
for (const sd of SEMI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s, r, g]) => { window.__CPM_GLB = g; window.__CPM_REC = true; window.__CPM_V241 = {}; if (r) window.__CPM_NO_ESITI241 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, ROSSO, GLB]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await sleep(3000);
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const snap = {}; const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 480000) {
    const o = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const W = window.__CPM_V241 || {}; const O = window.__CPM_OUTCOME;
      return { ph, k: W.k, o: (ph === 'hl_result' && O) ? { ok: O.ok, outKey: O.outKey || null, outKind: O.outKind || null, overlay: O.overlay || null, text: O.text || null, label: O.actionLabel || null } : null }; }).catch(() => ({}));
    ph = o.ph; if (o.o && o.k != null) snap[o.k] = o.o; if (ph === 'ended' || ph === 'ceremony') break; await sleep(300);
  }
  const fin = await page.evaluate(() => ({ res: window.__CPM_RES218 || [], v: (window.__CPM_V241 || {}).all || [] }));
  const usate = new Set();
  for (const v of fin.v) { const o = snap[v.k]; if (!o) continue; const i = fin.res.findIndex((r, j) => !usate.has(j) && r.label === o.label); if (i >= 0) usate.add(i);
    const r = { seme: sd, ...o, ev: i >= 0 ? fin.res[i].ev : [], v }; r.contr = contraddizioni(r); tutte.push(r); }
  console.log(`seme ${sd} fine ${ph} · scene dell'eroe ${Object.keys(snap).length} · 3D ${fin.v.length} · motore ${fin.res.length}`);
  await page.close();
}
await b.close(); srv.close();
const OUT = path.join(LIBDIR, '..', 'out', 'esiti-241-partite' + (ROSSO ? '-rosso' : '')); fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, SEMI.join('-') + '.json'), JSON.stringify(tutte, null, 1));
const C = tutte.filter(r => r.contr.length);
console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} scene ${tutte.length} · contraddizioni ${C.length}`);
tutte.forEach(r => console.log(`  ${r.seme} «${r.label}» ${r.outKey}/${r.outKind || '-'} «${r.overlay}» «${String(r.text || '').slice(0, 60)}» 3D ${JSON.stringify({ pa: Object.keys(r.v.pa || {}), gk: Object.keys(r.v.gk || {}), def: Object.keys(r.v.def || {}), net: r.v.inNet })}${r.contr.length ? ' ❌ ' + r.contr.join(' | ') : ''}`));
