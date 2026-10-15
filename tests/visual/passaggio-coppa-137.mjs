#!/usr/bin/env node
/* [giro 47 · PO-002 + PO-137] GUARDIANO — IL CAPITANO ALZA LA COPPA E LA PASSA ALL'EROE (GLB ACCESO).
   Forza la premiazione di squadra (scudetto), porta il tempo dentro i beat con __CPM_CERT_SET e misura:
   (a) al beat `captain` le MANI del capitano stanno sopra la testa (>= 1,9: la coppa e' alzata, non ai fianchi);
   (b) esiste il beat `pass` e la coppa VIAGGIA: all'inizio e' nelle mani del capitano (dC <= 0,35),
       alla fine in quelle dell'eroe (dH <= 0,35) — testimone __CPM_PASSA137;
   (c) nella festa finale l'eroe e' SUL palco (quota >= 0,9), non nascosto dietro fra le file.
   Ogni misura ha il suo rosso: __CPM_NO_CAPALZA137 · __CPM_NO_PASSA137 · __CPM_NO_FESTA137.            */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(p);
  const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CER_HOLD = true; if (r) window[r] = true; }, rosso);
  await openMatch(p, port); await sleep(3000);
  await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' }));
  await p.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beatsD, null, { timeout: 60000 }).catch(() => {});
  const sc = await p.evaluate(() => window.__CPM_CER425 || null);
  const o = { beats: sc ? sc.beats.join('>') : null, maniCap: null, passa: null, festaY: null, errs };
  if (!sc) { await p.close(); return o; }
  const t0 = k => { const i = sc.beats.indexOf(k); return i < 0 ? null : { a: sc.beatsD.slice(0, i).reduce((x, y) => x + y, 0), d: sc.beatsD[i] }; };
  const warp = async t => { await p.evaluate(v => { window.__CPM_CERT_SET = v; }, t); await sleep(2500); };
  const cap = t0('captain');
  if (cap) { const m = []; for (const f of [0.5, 0.8]) { await warp(cap.a + cap.d * f); const q = await p.evaluate(() => window.__CPM_PREMIO23 || null); if (q && q.beat === 'captain' && q.maniY != null) m.push(q.maniY); }
    o.maniCap = m.length ? Math.max(...m) : null; }
  const pa = t0('pass');
  if (pa) { await p.evaluate(() => { window.__CPM_PASSA137 = { campioni: [] }; });
    for (const f of [0.05, 0.15, 0.85, 0.95]) await warp(pa.a + pa.d * f);
    const C = await p.evaluate(() => (window.__CPM_PASSA137 || { campioni: [] }).campioni);
    const ini = C.filter(c => c.bp <= 0.3 && c.glb), fin = C.filter(c => c.bp >= 0.8 && c.glb);
    o.passa = { campioni: C.length, dCinizio: ini.length ? Math.min(...ini.map(c => c.dC)) : null, dHfine: fin.length ? Math.min(...fin.map(c => c.dH)) : null }; }
  const fe = t0('fest');
  if (fe) { await warp(fe.a + fe.d * 0.6); await sleep(1500); o.festaY = await p.evaluate(() => window.__CPM3D ? +window.__CPM3D.hero.position.y.toFixed(2) : null); }
  await p.close(); return o;
}
const V = await braccio('');
const R1 = await braccio('__CPM_NO_CAPALZA137'), R2 = await braccio('__CPM_NO_PASSA137'), R3 = await braccio('__CPM_NO_FESTA137');
await b.close(); srv.close();
console.log('VERDE:', JSON.stringify(V)); console.log('ROSSO capalza:', JSON.stringify(R1)); console.log('ROSSO passa:', JSON.stringify(R2)); console.log('ROSSO festa:', JSON.stringify(R3));
const g = [];
const ok = v => v.maniCap != null && v.maniCap >= 1.9 && v.passa && v.passa.dCinizio != null && v.passa.dCinizio <= 0.35 && v.passa.dHfine != null && v.passa.dHfine <= 0.35 && v.festaY != null && v.festaY >= 0.9 && !v.errs.length;
if (!ok(V)) g.push('il verde non regge: ' + JSON.stringify(V));
if (!(R1.maniCap != null && R1.maniCap < 1.6)) g.push('il rosso CAPALZA non si vede (mani del capitano ' + R1.maniCap + ')');
if (!(R2.beats && !/pass/.test(R2.beats))) g.push('il rosso PASSA non si vede (' + R2.beats + ')');
if (!(R3.festaY != null && R3.festaY < 0.5)) g.push('il rosso FESTA non si vede (quota eroe ' + R3.festaY + ')');
if (g.length) { console.log('❌ passaggio-coppa-137 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ passaggio-coppa-137 verde (e i tre rossi si vedono)');
