#!/usr/bin/env node
/* 7.538 — «LE AZIONI FINISCONO»: censimento delle CONCLUSIONI CHE NON PARTONO.
   Due scene misurate (pallonetto 1v1, parabola d'esterno) muoiono dove si aprono: nessun arco, il
   collettore del dispatch resta vuoto, la palla non si muove. Qui si misura QUANTO è diffuso, su un
   campione ampio di famiglie: per ogni scena forzata e risolta si registra se il dispatch è avvenuto,
   se la palla ha davvero VIAGGIATO e dove è finita. Nessun rimedio prima di questo numero. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI = (process.env.CPM_GI || '0,6,12,18,24,30,37,45,60,70,77,90,100,106,112,118,122,128,133,137,145,152,160,166,172,179,182,184').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_GLB = false; });
await openMatch(page, port, { name: 'Concl' });
await sleep(500);
const out = [];
for (const gi of GI) {
  await forceSituation(page, gi, { settle: 550, choose: true });
  const pre = await page.evaluate(() => { window.__CPM_DISPATCH = null; const s = window.__CPM_STATE(); return { x: s.ball ? s.ball.x : null }; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  /* si osserva per 6s di ORLOGIO campionando la palla: conta se ha viaggiato e se il dispatch è nato */
  let volo = 0, maxY = 0, dispatch = null, x0 = null, xf = null;
  for (let k = 0; k < 24; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { const s = window.__CPM_STATE(); return { b: s.ball, d: window.__CPM_DISPATCH ? { ht: window.__CPM_DISPATCH.ht, post: window.__CPM_DISPATCH.post } : null }; });
    if (!r.b) continue;
    if (x0 === null) x0 = r.b.x;
    xf = r.b.x; if (r.b.worldY > maxY) maxY = r.b.worldY;
    if (r.d) dispatch = r.d;
  }
  volo = (x0 !== null && xf !== null) ? Math.abs(xf - x0) : 0;
  out.push({ gi, dispatch: !!dispatch, ht: dispatch ? dispatch.ht : null, post: dispatch ? dispatch.post : null, viaggio: +volo.toFixed(1), quota: +maxY.toFixed(2) });
  console.log(`gi${String(gi).padStart(3)} · dispatch ${dispatch ? 'SÌ' : 'NO '} ${String(dispatch ? dispatch.ht : '-').padEnd(8)} post=${String(dispatch ? dispatch.post : '-').padEnd(12)} · viaggio palla ${String(volo.toFixed(1)).padStart(5)}u · quota max ${maxY.toFixed(2)}`);
}
await b.close(); srv.close();
const senza = out.filter(o => !o.dispatch);
const ferme = out.filter(o => o.viaggio < 3);
console.log(`\n=== CENSIMENTO su ${out.length} scene ===`);
console.log(`conclusioni SENZA dispatch: ${senza.length}/${out.length} (${Math.round(senza.length / out.length * 100)}%) → ${senza.map(o => 'gi' + o.gi).join(' ')}`);
console.log(`palla praticamente FERMA (<3u): ${ferme.length}/${out.length} → ${ferme.map(o => 'gi' + o.gi).join(' ')}`);
