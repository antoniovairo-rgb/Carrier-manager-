#!/usr/bin/env node
/* [giro 53 PO-274] CACCIA al salto del pallone NON spiegato dalla velocita' (apertura-261 lo conta come rosso dal giro 53). Partite vere
   intere, GLB acceso, teatro attivo, autoplay seedato; il registratore __CPM_BALLSET274 (solo diagnosi) annota ogni singolo assegnamento
   che sposta il pallone di oltre 6u con la sua pila di chiamate; alla fine si estrae dal codice trasformato la riga che l'ha scritto.
   Uso: CPM_NOMI=a,b node salti-274.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI = (process.env.CPM_NOMI || 'Ivo Mansi,Nando Orsi').split(','), TETTO = +(process.env.CPM_TETTO || 330000), ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let TOT = 0, VOLI = 0; const VV = [];
for (const [k, nome] of NOMI.entries()) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_BALLSET274 = 1; if (r) r.split('+').forEach(x => window[x] = 1); }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7 + k);
  const t0 = Date.now(); let ph = null; const fasi = [];
  while (Date.now() - t0 < TETTO) { const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (p !== ph) { fasi.push([Math.round((Date.now() - t0) / 1000), p]); ph = p; } if (p === 'ended' || p === 'ceremony') break; await sleep(300); }
  const r = await page.evaluate(() => {
    const bj = (window.__CPM_BJ478 || []).filter(x => !x.mask && !x.nascosto && x.ph === 'hl_result');
    const bs = (window.__CPM_BS274 || []).slice();
    const src = [...document.scripts].map(s => s.text || '').filter(t => t.length > 1e5);
    const snip = st => { const fr = st.split('|').find(f => !/set \[as/.test(f)) || ''; const m = /:(\d+):(\d+)\)?\s*$/.exec(fr.trim()); if (!m || !src.length) return null; const L = +m[1], C = +m[2];
      for (const t of src) { const ln = t.split('\n')[L - 1]; if (ln && ln.length >= C) return ln.slice(Math.max(0, C - 160), C + 60); } return null; };
    return { bj, bs: bs.map(x => ({ ...x, codice: snip(x.st) })), voli: (window.__CPM_VOLO274 || []).slice() };
  });
  const tele = r.bj.filter(x => x.dt > 0 && (x.src === 'arco' && x.al != null && x.ad > 0 ? x.d > 2 * (x.al * x.dt / x.ad) + 1 : x.d / x.dt > 50));
  console.log(`\n### ${nome}: fasi ${fasi.length} · salti scoperti in conclusione ${r.bj.length}, non spiegati ${tele.length}: ${tele.map(x => `${x.src}:${x.d}u/${x.dt}s T${x.aT}/${x.ad} @${x.t}`).join(' ')}`);
  TOT += tele.length; VOLI += r.voli.length; VV.push(...r.voli); console.log(`  conclusioni col pallone lontano: ${r.voli.length} · ${r.voli.slice(0, 8).map(v => `${v.d0}u vmax ${v.vmax} u/s`).join(' · ')}`);
  if (process.env.CPM_PILE) for (const x of r.bs) console.log(`  set ${x.k} ${x.o}→${x.n} @${x.t}\n     pila: ${x.st.slice(0, 300)}\n     codice: ${x.codice ? x.codice.replace(/\s+/g, ' ') : '-'}`);
  await ctx.close();
}
await b.close(); srv.close();
const VM = VV.length ? Math.max(...VV.map(v => v.vmax)) : null;
console.log(`\nTOTALE salti non spiegati in conclusione: ${TOT} · conclusioni col pallone lontano ${VOLI} · velocita' massima del pallone nel caricamento ${VM} u/s`);
if (process.argv.includes('--guardiano')) { if (VV.length < 1) { console.log('❌ sonda cieca: nessuna conclusione col pallone lontano'); process.exit(2); }
  const ok = ROSSO ? VM > 150 : (TOT === 0 && VM <= 60); console.log(ok ? `✅ ${ROSSO ? 'ROSSO come atteso' : 'PASS salti-274'}` : `❌ ${ROSSO ? 'il rosso non riproduce' : 'FAIL salti-274'}`); process.exit(ok ? 0 : 1); }
