#!/usr/bin/env node
/* [giro 192 · PO-402 «il mister durante la premiazione vola sull'erba, non cammina!»] SONDA DI MISURA (non guardiano).
   Premiazione forzata (cup/int/league) coi corpi 3D, testimone __CPM_COACH77 per fotogramma: posizione del gruppo e delle
   punte dei piedi del mister. Per ogni coppia di fotogrammi in cui il mister si sposta: velocita' (u/s di scena, da __CPM_CER476)
   e SLITTAMENTO = spostamento orizzontale del piede piu' fermo / spostamento del corpo. Un uomo che cammina ha un piede piantato
   (≈0); uno che plana ha i due piedi che viaggiano col corpo (≈1). Uso: CPM_ONLY=cup,int node misura-mister-192.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const KINDS = (process.env.CPM_ONLY || 'cup,int').split(',');
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null; };
for (const kind of KINDS) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; }, FLAGS);
  await openMatch(p, port, { skipLoadAll: true, name: 'Mister192' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(k => { window.__CPM_COACH77 = null; window.__CPM_CER476 = []; window.__CPM_FORCE_CEREMONY({ name: 'COPPA PROVA', kind: k }); }, kind);
  await p.waitForFunction(() => { const W = window.__CPM_COACH77; return W && W.fr.some(f => f.glb === 1); }, null, { timeout: 40000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_COACH77 = { fr: [] }; window.__CPM_CER476 = []; window.__CPM_CERT_SET = 0; });
  await sleep(14000);
  const F = (await p.evaluate(() => (window.__CPM_COACH77 || { fr: [] }).fr)).filter(f => f.glb === 1);
  const C = await p.evaluate(() => (window.__CPM_CER476 || []).map(w => w.coach && [w.t, w.beat, w.coach.v]).filter(Boolean));
  await p.close();
  const sl = [], perBeat = {}, fac = [];
  for (let i = 1; i < F.length; i++) { const a = F[i - 1], c = F[i]; if (!a.tL || !c.tL || !a.g || !c.g) continue;
    const dg = Math.hypot(c.g[0] - a.g[0], c.g[2] - a.g[2]); if (dg < 0.03) continue;
    const dl = Math.hypot(c.tL[0] - a.tL[0], c.tL[2] - a.tL[2]), dr = Math.hypot(c.tR[0] - a.tR[0], c.tR[2] - a.tR[2]);
    const s = Math.min(dl, dr) / dg; sl.push(s); (perBeat[c.b] = perBeat[c.b] || []).push(s);
    const mv = Math.atan2(c.g[0] - a.g[0], c.g[2] - a.g[2]); let e = Math.abs(mv - c.ry) % (2 * Math.PI); if (e > Math.PI) e = 2 * Math.PI - e; fac.push(e * 180 / Math.PI); }
  const vm = C.filter(c => c[2] > 0.3).map(c => c[2]);
  const sep = F.filter(f => f.tL && f.tR).map(f => Math.hypot(f.tL[0] - f.tR[0], f.tL[2] - f.tR[2]));
  console.log(JSON.stringify({ kind, fotogrammi: F.length, inMoto: sl.length, slittamentoMed: med(sl), slittamentoP25: sl.length ? +[...sl].sort((x, y) => x - y)[Math.floor(sl.length / 4)].toFixed(3) : null,
    perBeat: Object.fromEntries(Object.entries(perBeat).map(([k, v]) => [k, [v.length, med(v)]])), velMed: med(vm), versoMed: med(fac), velMax: vm.length ? Math.max(...vm) : null,
    piediSepMin: sep.length ? +Math.min(...sep).toFixed(2) : null, piediSepMax: sep.length ? +Math.max(...sep).toFixed(2) : null }));
}
await b.close(); srv.close();
