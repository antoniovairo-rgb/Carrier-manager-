/* [23/09] B3 — I VENTIDUE IN SCENA: chi li muove e come stanno. Partite vere (pilota automatico), campioni ogni 400 ms nelle fasi
   hl_choose/hl_move: giocatori (esclusi portieri) entro 6u dall'eroe (ammucchiata), distanza del primo avversario, compagni davanti
   all'eroe (soluzioni di passaggio), e i passi del brain contro quelli del vecchio scrittore. Coordinate LOGICHE (matchPlayers ed
   eroe, stessa sorgente). CPM_ROSSO=__CPM_NO_B3MUOVI per il rosso. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const N = Number(process.env.CPM_PARTITE || 2), DA = Number(process.env.CPM_DA || 0), ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer(); const browser = await launchBrowser(); const tutti = []; const cont = { brain: 0, vecchio: 0 }; const errori = [];
for (let p = DA; p < DA + N; p++) {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage(); page.on('pageerror', e => errori.push(e.message.slice(0, 120)));
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = 1; window.__CPM_GLB = false; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} if (r) window[r] = true; }, ROSSO);
  await installCdnRoutes(page); await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Scene ' + p, query: { glb: '0' } });
  await page.evaluate(sd => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: sd }), 1000 + p).catch(() => {});
  const t0 = Date.now();
  while (Date.now() - t0 < Number(process.env.CPM_SEC || 240) * 1000) {
    const c = await page.evaluate(() => { const f = window.__CPM_PHASE && window.__CPM_PHASE(); if (f === 'ended') return { fine: 1 }; if (f !== 'hl_choose' && f !== 'hl_move') return null;
      const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.hero) return null;/* mesh per tutti: stessa sorgente */
      const hx = st.hero.x, hy = st.hero.y; const mov = st.players.filter(q => q && !q.gk && (q.team === 'home' || q.team === 'away')); const d = q => Math.hypot(q.x - hx, q.y - hy);
      const opp = mov.filter(q => q.team === 'away').map(d).sort((a, b) => a - b);
      return { vicini: mov.filter(q => d(q) < 6).length, primoAvv: opp[0] ?? null, compagniDavanti: mov.filter(q => q.team === 'home' && q.x > hx + 2).length };
    }).catch(() => null);
    if (c && c.fine) break; if (c) tutti.push(c);
    await sleep(400);
  }
  const w = await page.evaluate(() => ({ b: window.__CPM_B3MUOVI | 0, v: window.__CPM_B3VECCHIO | 0 })).catch(() => ({ b: 0, v: 0 })); cont.brain += w.b; cont.vecchio += w.v;
  await page.close();
}
const med = a => { const v = a.filter(Number.isFinite).sort((x, y) => x - y); return v.length ? +v[Math.floor(v.length / 2)].toFixed(1) : null; };
const S = { rosso: ROSSO || null, campioni: tutti.length, passi: cont, ammucchiataMedia: +(tutti.reduce((a, c) => a + c.vicini, 0) / Math.max(1, tutti.length)).toFixed(2), ammucchiateOltre3: tutti.filter(c => c.vicini > 3).length, primoAvversarioMediana: med(tutti.map(c => c.primoAvv)), compagniDavantiMediana: med(tutti.map(c => c.compagniDavanti)), senzaCompagniDavanti: tutti.filter(c => c.compagniDavanti === 0).length, errori };
console.log(JSON.stringify(S));
fs.mkdirSync(path.join(here, 'scena-corpi'), { recursive: true }); fs.writeFileSync(path.join(here, 'scena-corpi', (ROSSO ? 'rosso' : 'verde') + '.json'), JSON.stringify(S, null, 1));
await browser.close(); server.close();
