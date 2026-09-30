#!/usr/bin/env node
/* [7.999.73 guardiano — collaudo Codex 001 su gi81 «Punizione — muro a 9 metri»: difensori distanziati, niente barriera compatta]
   La barriera nasce a 1,5u di campo fra un difensore e l'altro, ma le passate successive (marcature, coperture) e la bolla di
   repulsione da 6,5u la allargavano a y 49-60. VERDE → i quattro avversari piu' vicini al pallone (a 7-12u) occupano una fascia
   larga ≤ 6u di campo. ROSSO (__CPM_NO_MURO72) → ≥ 9u. Posizioni dalle MESH (__CPM_STATE). Uso: node barriera-73.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; if (r) window.__CPM_NO_MURO72 = 1; }, rosso);
  await openMatch(p, port, { skipLoadAll: true, name: 'Bar73' }); await sleep(1000);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_FORCE_SIT(81, true); window.__CPM_FROZEN = false; });
  await p.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(3600);
  const r = await p.evaluate(() => { const s = window.__CPM_STATE(); const bl = s.ball;
    const w = s.players.filter(q => q.team === 'away' && !q.gk).map(q => ({ d: Math.hypot(q.x - bl.x, (q.y - bl.y) * 0.68), y: q.y })).filter(q => q.d > 7 && q.d < 12).sort((a, c) => a.d - c.d).slice(0, 4);
    return { n: w.length, largo: w.length ? Math.max(...w.map(q => q.y)) - Math.min(...w.map(q => q.y)) : null }; });
  await p.close(); return r;
}
const v = await braccio(false), r = await braccio(true);
console.log(`VERDE: ${v.n} in barriera · larga ${v.largo == null ? '—' : v.largo.toFixed(1)}u di campo`);
console.log(`ROSSO (__CPM_NO_MURO72): ${r.n} in barriera · larga ${r.largo == null ? '—' : r.largo.toFixed(1)}u`);
const ok = v.n === 4 && v.largo <= 6 && r.largo != null && r.largo >= 9;
await b.close(); srv.close();
console.log(ok ? '✅ barriera-73 verde (e il rosso si vede)' : '❌ barriera-73 ROSSO'); process.exit(ok ? 0 : 1);
