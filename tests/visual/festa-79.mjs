#!/usr/bin/env node
/* Sonda: l'eroe nella festa di fine partita «vola con le braccia alzate». Per ogni beat della festa leggera
   (e di campionato con CPM_KIND=league): salto al centro del beat, campioni fitti di posizione del corpo 3D,
   clip in corso, peso della corsa, piede piu' basso. Velocita' su tempo di SCENA (__CPM_SCENET). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const KIND = process.env.CPM_KIND || 'light';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_CER_HOLD = 1; if (r) window.__CPM_NO_VOLO80 = 1; }, !!process.env.CPM_ROSSO80);
await openMatch(p, port, { skipLoadAll: true, name: 'Festa79' }); await sleep(1200);
await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
await p.evaluate(k => { window.__CPM_CER425 = null; window.__CPM_FORCE_CEREMONY(k === 'light' ? { light: true } : { kind: k }); }, KIND);
await p.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beats, null, { timeout: 30000 }).catch(() => {});
const cer = await p.evaluate(() => window.__CPM_CER425);
let t0 = 0; const out = []; let scivola = 0, campioni = 0;
for (let i = 0; i < cer.beats.length; i++) {
  const d = cer.beatsD[i] || 2; await p.evaluate(t => { window.__CPM_CERT_SET = t; }, t0 + d * 0.3); await sleep(600);
  const s = []; for (let k = 0; k < 20; k++) { s.push(await p.evaluate(() => window.__CPM_FOOT77 && window.__CPM_FOOT77())); await sleep(150); }
  const ok = s.filter(Boolean); let dist = 0; for (let k = 1; k < ok.length; k++) dist += Math.hypot(ok[k].rx - ok[k - 1].rx, ok[k].rz - ok[k - 1].rz);
  const dt = ok.length > 1 ? ok[ok.length - 1].st - ok[0].st : 0;
  for (let k = 1; k < ok.length; k++) { const dts = ok[k].st - ok[k - 1].st; if (dts <= 0) continue; campioni++; const v = Math.hypot(ok[k].rx - ok[k - 1].rx, ok[k].rz - ok[k - 1].rz) / dts; if (v > 1.5 && ok[k].gw >= 0.9) scivola++; }
  const clips = [...new Set(ok.map(x => x.g || '-'))].join('/');
  const r = { beat: cer.beats[i], v: dt > 0 ? +(dist / dt).toFixed(2) : null, dist: +dist.toFixed(2), dtScena: +dt.toFixed(2), clip: clips, run: Math.max(...ok.map(x => x.run)), gw: Math.max(...ok.map(x => x.gw)), piede: [Math.min(...ok.map(x => x.foot)), Math.max(...ok.map(x => x.foot))] };
  out.push(r); console.log(JSON.stringify(r));
  t0 += d;
}
await b.close(); srv.close();
const rosso = !!process.env.CPM_ROSSO80;
console.log(`campioni ${campioni} · eroe in movimento con le braccia al cielo (scivola): ${scivola}`);
const ok = campioni >= 40 && (rosso ? scivola > 0 : scivola === 0);
console.log(!ok ? (campioni < 40 ? '❌ festa-79 CIECO' : rosso ? '❌ rosso CIECO' : '❌ festa-79 ROSSO') : (rosso ? '✅ il rosso si vede' : '✅ festa-79 verde: l\'eroe corre quando si sposta'));
process.exit(ok ? 0 : 1);
