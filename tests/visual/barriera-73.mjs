#!/usr/bin/env node
/* [7.999.73 guardiano — collaudo Codex 001 su gi81 «Punizione — muro a 9 metri»: difensori distanziati, niente barriera compatta]
   La barriera nasce a 1,5u di campo fra un difensore e l'altro, ma le passate successive (marcature, coperture) e la bolla di
   repulsione da 6,5u la allargavano a y 49-60. VERDE → i quattro avversari piu' vicini al pallone (a 7-12u) occupano una fascia
   larga ≤ 6u di campo. ROSSO (__CPM_NO_MURO72) → ≥ 9u. Posizioni dalle MESH (__CPM_STATE). Uso: node barriera-73.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
/* [giro 418, riparazione treno 7.999.218] la misura si fa in DIECI momenti (6 s di lettura), non in uno: un solo campione a 3,6 s di parete
   era verde o rosso secondo la fase dell'attesa attiva (misura-418: 4,4u in ~3 campioni su 10, 13-16u negli altri). Terzo braccio
   __CPM_NO_G418 (avversari fuori barriera liberi di entrare nei 9,15 m): deve uscire rosso. Soglia invariata: <= 6u in OGNI momento. */
async function braccio(rosso, no418) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; if (r[0]) window.__CPM_NO_MURO72 = 1; if (r[1]) window.__CPM_NO_G418 = 1; }, [rosso, no418]);
  await openMatch(p, port, { skipLoadAll: true, name: 'Bar73' }); await sleep(1000);
  await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_FORCE_SIT(81, true); window.__CPM_FROZEN = false; });
  await p.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(3600); const cc = [];
  for (let k = 0; k < 10; k++) { if (k) await sleep(600); cc.push(await p.evaluate(() => { const s = window.__CPM_STATE(); const bl = s.ball;
    const w = s.players.filter(q => q.team === 'away' && !q.gk).map(q => ({ d: Math.hypot(q.x - bl.x, (q.y - bl.y) * 0.68), y: q.y })).filter(q => q.d > 7 && q.d < 12).sort((a, c) => a.d - c.d).slice(0, 4);
    return { n: w.length, largo: w.length ? Math.max(...w.map(q => q.y)) - Math.min(...w.map(q => q.y)) : null }; })); }
  if (process.env.CPM_DUMP418) console.log(JSON.stringify(cc));
  await p.close(); const l = cc.map(c => c.largo).filter(x => x != null);
  return { n: Math.min(...cc.map(c => c.n)), largo: l.length === cc.length ? Math.max(...l) : null, min: l.length ? Math.min(...l) : null, k: cc.length };
}
const v = await braccio(false, false), r = await braccio(true, false);
/* il braccio 418 si ripete (al massimo 3 aperture, dichiarate): la scena forzata non nasce sempre dallo stesso punto e solo in alcune un
   difensore congelato sta vicino ai 9 m. Nessuna apertura con il difetto = non giudicato = rosso. */
let z = null, prove418 = 0; while (prove418 < 3) { prove418++; z = await braccio(false, true); if (z.largo != null && z.largo > 6) break; }
console.log(`VERDE: ${v.n} in barriera · larga ${v.largo == null ? '—' : v.largo.toFixed(1)}u di campo (peggiore di ${v.k} momenti)`);
console.log(`ROSSO (__CPM_NO_MURO72): ${r.n} in barriera · larga ${r.largo == null ? '—' : r.largo.toFixed(1)}u`);
console.log(`ROSSO (__CPM_NO_G418): larga fino a ${z.largo == null ? '—' : z.largo.toFixed(1)}u (deve superare 6u in almeno un momento) · aperture ${prove418}/3`);
const ok = v.n === 4 && v.largo != null && v.largo <= 6 && r.largo != null && r.largo >= 9 && z.largo != null && z.largo > 6;
await b.close(); srv.close();
console.log(ok ? '✅ barriera-73 verde (e il rosso si vede)' : '❌ barriera-73 ROSSO'); process.exit(ok ? 0 : 1);
