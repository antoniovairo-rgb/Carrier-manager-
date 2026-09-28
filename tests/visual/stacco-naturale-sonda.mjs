#!/usr/bin/env node
/* [7.999.45 sonda — taccuino PO SIT #3 «codice 001: all'apertura il pallone non e' ai piedi di nessuno dei nostri (eroe >= 43,3 u)»]
   Partita NATURALE col pilota automatico (le scene le apre il motore, come sul telefono). A ogni ingresso in scelta registra la
   distanza eroe-pallone (coordinate di gioco, y scalata 0,68) e il testimone __CPM_STACCO45 (riscritture del motore evitate /
   avvenute sulla scena gia' messa in posizione). CPM_MS durata (150000) · CPM_NOMI partite (Stacco1,Stacco2) · CPM_INIT bracci. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 150000), NOMI = (process.env.CPM_NOMI || 'Stacco1,Stacco2').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const tutte = []; let ev = 0, rosse = 0;
for (const nome of NOMI) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REC = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now(); let prev = null, k = 0;
  while (Date.now() - t0 < MS) {
    const r = await page.evaluate(() => { try { const ph = window.__CPM_PHASE(); if (ph !== 'hl_choose') return { ph }; const s = window.__CPM_STATE(); const q = window.__CPM_CURSIT && window.__CPM_CURSIT();
      return { ph, h: s.hero, bl: s.ball, gi: q ? q.gi : null, clock: s.clock }; } catch (e) { return null; } }).catch(() => null);
    if (r && r.ph === 'hl_choose' && prev !== 'hl_choose' && r.h && r.bl) { k++; const d = Math.hypot(r.h.x - r.bl.x, (r.h.y - r.bl.y) * 0.68); tutte.push({ nome, gi: r.gi, min: r.clock, d: +d.toFixed(1) }); }
    if (r && r.ph === 'ended') break;
    prev = r && r.ph; await sleep(120);
  }
  const st = await page.evaluate(() => window.__CPM_STACCO45 || null).catch(() => null); if (st) { ev += st.evitate | 0; rosse += st.rosse | 0; }
  await page.close();
}
await b.close(); srv.close();
const lont = tutte.filter(x => x.d > 12);
console.log(`scene aperte ${tutte.length} · eroe a oltre 12 u dal pallone in scelta ${lont.length} ${JSON.stringify(lont.slice(0, 8))} · riscritture del motore evitate ${ev} · avvenute sulla scena in posizione ${rosse}`);
console.log('distanze: ' + tutte.map(x => x.d).join(' '));
