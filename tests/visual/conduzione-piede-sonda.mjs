#!/usr/bin/env node
/* [7.999.44 sonda — rapporto Codex fluidita' 28/09: «piede d'appoggio in movimento durante la conduzione»]
   Per ogni scena (pagina nuova, corpo CGTrader, build-up acceso) legge il testimone __CPM_TIRO34 nei fotogrammi di CONDUZIONE:
   eroe col pallone entro 1,5 u da un piede, nessun arco in volo, nessun gesto montato. Per fascia di velocita' dell'eroe riporta
   lo scivolamento del piede a terra (`sl`, il piu' fermo dei due), il passo della corsa (`rts`×`v0`, cioe' la velocita' che le
   gambe stanno disegnando) e lo scarto velocita'−passo: se le gambe disegnano meno strada di quanta ne fa il corpo, il piede
   appoggiato scivola per costruzione. CPM_SCENE=gi,gi,... (default: scene del taccuino PO + build-up). CPM_AZ=azione (0). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '64,81,38,152,176,92,25,4,12,21').split(',').map(Number);
const AZ = +(process.env.CPM_AZ || 0);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const tutti = [];
for (const gi of SCENE) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; if (window.name === 'x') {} });
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: 'Cond44' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, AZ);
  let n = -1; for (let i = 0; i < 60; i++) { await sleep(600); const m = await page.evaluate(() => (window.__CPM_TIRO34 && window.__CPM_TIRO34.f.length) || 0); if (m > 20 && m === n) break; n = m; }
  const W = await page.evaluate(() => window.__CPM_TIRO34 || null); await page.close();
  if (!W) { console.log(`gi${gi}: testimone vuoto`); continue; }
  if (process.env.CPM_LAG) console.log('  lag in conduzione:', W.f.filter(x => !x.g && !x.arc && x.dL != null && Math.min(x.dL, x.dR) < 1.5).map(x => x.v + '@' + x.lag).join(' '));
  const C = W.f.filter(x => !x.g && !x.arc && x.dL != null && x.dR != null && Math.min(x.dL, x.dR) < 1.5 && x.sl != null && x.v > 0.3 && x.v < 30);
  C.forEach(x => tutti.push({ gi, ...x }));
  const med = a => { const s = a.slice().sort((p, q) => p - q); return s.length ? +s[s.length >> 1].toFixed(2) : null; };
  console.log(`gi${gi}: fotogrammi ${W.f.length} · conduzione ${C.length} · velocita' mediana ${med(C.map(x => x.v))} u/s · piede ${med(C.map(x => x.sl))} u/s · passo gambe ${med(C.filter(x => x.rts != null && x.v0 != null).map(x => x.rts * x.v0))} u/s`);
}
await b.close(); srv.close();
const fasce = [[0, 3], [3, 6], [6, 9], [9, 99]];
const med = a => { const s = a.slice().sort((p, q) => p - q); return s.length ? +s[s.length >> 1].toFixed(2) : null; };
const p90 = a => { const s = a.slice().sort((p, q) => p - q); return s.length ? +s[Math.floor(s.length * 0.9)].toFixed(2) : null; };
console.log(`\nconduzione: ${tutti.length} fotogrammi su ${new Set(tutti.map(x => x.gi)).size} scene`);
for (const [lo, hi] of fasce) {
  const F = tutti.filter(x => x.v >= lo && x.v < hi); const P = F.filter(x => x.rts != null && x.v0 != null);
  console.log(`  ${lo}-${hi === 99 ? '+' : hi} u/s: n=${F.length}${F.length < 20 ? ' (sotto 20: non si conclude)' : ''} · piede med ${med(F.map(x => x.sl))} p90 ${p90(F.map(x => x.sl))} · passo gambe med ${med(P.map(x => x.rts * x.v0))} · scarto velocita'-passo med ${med(P.map(x => x.v - x.rts * x.v0))} · cadenza med ${med(P.map(x => x.rts))} · peso corsa med ${med(F.filter(x => x.rw != null).map(x => x.rw))} · peso fermo med ${med(F.filter(x => x.iw != null).map(x => x.iw))} · velocita' stimata med ${med(F.filter(x => x.sps != null).map(x => x.sps))}`);
}
