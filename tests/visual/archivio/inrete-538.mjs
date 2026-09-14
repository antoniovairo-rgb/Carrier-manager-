#!/usr/bin/env node
/* 7.538 — VERIFICA REGRESSIONE 003 (nota PO su build 7.534, SIT #122 «Parabola d'esterno — cambio
   gioco!», esito CHANCE ma palla IN RETE): il rimedio 7.533 nega il certificato-rete su kind="chance"
   nei canali in_net/in_net_high. Se il caso passa da un ALTRO canale (assist_shot, cross_goal, deflect)
   il gate non lo vede. Qui si forza la scena e si legge il collettore __CPM_NET546 (canale, premio,
   esito, certificato) + lo stato FINALE della palla rispetto allo specchio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, waitBallSettle, sleep } from './lib/harness.mjs';
const GI = [122, 122, 122, 118, 106];
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; });
await openMatch(page, port, { name: 'InRete' });
await sleep(600);
for (const gi of GI) {
  await forceSituation(page, gi, { settle: 600, choose: true });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await waitBallSettle(page, { maxMs: 10000, quietMs: 800 });
  const r = await page.evaluate(() => {
    const s = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); const S = (s && s.samples) || [];
    if (!S.length) return null;
    const sk = S[S.length - 1].sk; const W = S.filter(q => q.sk === sk);
    const fin = W[W.length - 1];
    let pen = null; for (const q of W) if (!pen || q.x > pen.x) pen = q;
    return { fin: { x: +fin.x.toFixed(1), z: +fin.z.toFixed(1) }, pen: { x: +pen.x.toFixed(1), z: +pen.z.toFixed(1) },
             disp: window.__CPM_DISPATCH ? { ht: window.__CPM_DISPATCH.ht, rew: window.__CPM_DISPATCH.rew, kind: window.__CPM_DISPATCH.kind, post: window.__CPM_DISPATCH.post } : null };
  });
  const inNet = r && r.fin.x >= 47.5 && Math.abs(r.fin.z) <= 3.6;
  console.log(`gi${gi} — finale x ${r ? r.fin.x : '?'} z ${r ? r.fin.z : '?'} · max x ${r ? r.pen.x : '?'} · ${inNet ? '⚽ IN RETE ⚠️' : 'fuori dallo specchio'} · dispatch ${JSON.stringify(r && r.disp)}`);
}
const net = await page.evaluate(() => window.__CPM_NET546 || []);
console.log(`\ncanali-rete attraversati (${net.length}):`);
net.forEach(e => console.log(`  ${String(e.ch).padEnd(12)} ht=${e.ht} rew=${e.rew} ok=${e.ok} certificato=${e.cert}`));
await b.close(); srv.close();
