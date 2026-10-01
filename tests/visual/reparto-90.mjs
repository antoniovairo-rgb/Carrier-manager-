/* [PO-132 #134, codici 006/011] Guardiano dell'avanzata prima del gol subito (scene difensive fallite).
   Prima: l'attaccante che deve portare palla fino al tiro era tirato indietro dal driver di formazione
   (fermo con la palla, o mai arrivato sul pallone): pallone immobile ~1,5 s, poi tiro da lontano.
   Misura in tempo reale (__CPM_DTREAL): campioni dell'esito con pallone fermo (<0,3u in 250 ms)
   prima del tiro, e spostamento dei corpi. Rosso __CPM_NO_REPARTO90 (CPM_ROSSO90=1). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_GI || '134,44,134,44,134,44').split(',').map(Number);
let fermi = 0, campioni = 0, casi = 0, sTeam = 0;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_DTREAL = 1; });
  if (process.env.CPM_ROSSO90) await p.addInitScript(() => { window.__CPM_NO_REPARTO90 = 1; });
  await openMatch(p, port, { skipLoadAll: true, name: 'Reparto' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
  await sleep(1500);
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); }).catch(() => {});
  const fr = [];
  for (let k = 0; k < 8; k++) { await sleep(250); fr.push(await p.evaluate(() => { const S = window.__CPM_STATE(); return { ph: window.__CPM_PHASE(), b: S.ball, pl: (S.players || []).map(q => ({ t: q.team, x: q.x, y: q.y, h: !!q.hero, gk: !!q.gk })), adv: window.__CPM_ADV773 || null }; })); }
  const res = fr.filter(f => f.ph === 'hl_result');
  if (!res.length || !res.some(f => f.adv)) { console.log(`gi${gi}: avanzata non armata (salto)`); await ctx.close(); continue; }
  casi++;
  let n = 0;
  for (let k = 1; k < res.length; k++) { const a = res[k - 1].b, c = res[k].b; if (a.x < 18) break; campioni++; n++; if (Math.hypot(c.x - a.x, c.y - a.y) < 0.3) fermi++; }
  const f0 = res[0].pl, f1 = res[res.length - 1].pl; let s = 0, m = 0; f0.forEach((q, i) => { if (q.h || q.gk || !f1[i]) return; s += Math.hypot(f1[i].x - q.x, f1[i].y - q.y); m++; });
  sTeam += s / m;
  console.log(`gi${gi}: pallone ${res.map(f => f.b.x.toFixed(0)).join(' ')} · corpi ${(s / m).toFixed(2)}u`);
  await ctx.close();
}
await b.close(); srv.close();
console.log(`casi ${casi} · campioni prima del tiro ${campioni} · pallone fermo ${fermi} · spostamento medio corpi ${(sTeam / Math.max(casi, 1)).toFixed(2)}u`);
if (casi < 3 || campioni < 8) { console.log('CIECO'); process.exit(2); }
if (process.env.CPM_ROSSO90) { const v = fermi >= campioni * 0.4; console.log(v ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
const ok = fermi <= campioni * 0.25; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
