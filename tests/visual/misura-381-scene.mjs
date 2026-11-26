#!/usr/bin/env node
/* SONDA giro 381 (PO-663) — stampa. Scene forzate col pilota del banco, corpi GLB accesi, teatro acceso. A ogni fotogramma delle fasi
   hl_* il testimone __CPM_SCIV381 (src/12) da' per chi suona `tackle`/`slide-tackle`: punto piu' basso del CORPO INTERO sul prato,
   suola, distanza piede-pallone. Uso: node misura-381-scene.mjs  CPM_FLAG=__CPM_NO_G381A  CPM_SCENE=...  CPM_ESITO=fail|ok */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
export async function scene381(b, port, { flags = '', scene = null, esiti = ['ok', 'fail'], nome = 'Scivola381', tetto = 0 } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1062, height: 549 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript((fl) => { window.__CPM_GLB = true; window.__CPM_TOD = 'day'; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; (fl || '').split(',').filter(Boolean).forEach(f => { window[f] = 1; }); }, flags);
  await openMatch(page, port, { name: nome });
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
  /* scene: difensive (l'eroe scivola) + d'attacco (scivola l'avversario sull'esito fallito) */
  const cand = scene || await page.evaluate(() => { const out = { def: [], att: [] }; try { SITUATIONS.forEach((s, i) => { if (s && s.type === 'def') out.def.push(i); else if (s && /dribbl|conduz|slalom/i.test(String(s.text || s.title || ''))) out.att.push(i); }); } catch (e) {} return out.def.slice(0, 8).concat(out.att.slice(0, 4)); });
  await page.evaluate(() => { const R = window.__CPM_R381 = { fr: 0, righe: [] }; const L = () => { try { const s = window.__CPM_SCIV381 && window.__CPM_SCIV381();
      if (s && s.corpi && !window.__CPM_FROZEN && String(s.fase || '').indexOf('hl_') === 0) { R.fr++; for (const c of s.corpi) if (R.righe.length < 40000) R.righe.push([s.sk, c.i, c.eroe ? 1 : 0, c.clip, c.t, c.w, c.corpo, c.suola, c.piedePalla, c.pallaY, c.ry]); }
    } catch (e) { R.err = String(e); } if (window.__CPM_R381 === R) requestAnimationFrame(L); }; requestAnimationFrame(L); });
  const giri = [];
  for (const gi of cand) for (const es of esiti) {
    const n0 = await page.evaluate(() => window.__CPM_R381.righe.length);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await forceSituation(page, gi, { settle: 900, choose: true }); await sleep(1500);
    await page.evaluate((e) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(0); }, es);
    const t0 = Date.now(); while (Date.now() - t0 < 9000) { await sleep(300); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph !== 'hl_result' && Date.now() - t0 > 1500) break; }
    const n1 = await page.evaluate(() => window.__CPM_R381.righe.length); giri.push(`gi${gi}/${es}:${n1 - n0}`);
    if (tetto && n1 >= tetto) break;
  }
  const R = await page.evaluate(() => ({ fr: window.__CPM_R381.fr, righe: window.__CPM_R381.righe, err: window.__CPM_R381.err || null, t381: window.__CPM_T381 || null }));
  await ctx.close(); return { glb, errori, giri, cand, ...R };
}
const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : null; };
export function riassumi381(R) {
  const mid = R.righe.filter(r => (r[3] === 'tackle' || r[3] === 'slide-tackle') && r[4] >= 0.3 && r[4] <= 0.7 && r[5] >= 0.8 && r[6] != null);/* meta' clip, peso pieno: il corpo e' steso */
  const per = {}; for (const r of R.righe) { if (r[3] !== 'tackle' && r[3] !== 'slide-tackle') continue; const k = r[0] + ':' + r[1]; const p = per[k] || (per[k] = { pp: [], eroe: r[2], clip: r[3] }); if (r[8] != null && r[5] >= 0.5) p.pp.push(r[8]); }
  const contatti = Object.values(per).filter(p => p.pp.length).map(p => Math.min(...p.pp));
  return { righe: R.righe.length, mid: mid.length, corpi: Object.keys(per).length, corpoMed: med(mid.map(r => r[6])), corpoP90: pct(mid.map(r => r[6]), 0.9), corpoMax: mid.length ? Math.max(...mid.map(r => r[6])) : null,
    suolaMed: med(mid.map(r => r[7])), contattoMed: med(contatti), contattoMin: contatti.length ? Math.min(...contatti) : null, contatti: contatti.length, eroe: mid.filter(r => r[2]).length, altri: mid.filter(r => !r[2]).length };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const sc = process.env.CPM_SCENE ? process.env.CPM_SCENE.split(',').map(Number) : null;
  const R = await scene381(b, port, { flags: process.env.CPM_FLAG || '', scene: sc, esiti: (process.env.CPM_ESITO || 'ok,fail').split(',') });
  console.log('primo errore', R.errori[0] || '-');
  console.log('candidate', JSON.stringify(R.cand), '\ngiri', R.giri.join(' '), '\nerrori', R.errori.length, R.err || '', 'glb', R.glb);
  console.log(JSON.stringify(riassumi381(R)));
  const pc = {}; for (const r of R.righe) pc[r[3] + (r[2] ? '(eroe)' : '')] = (pc[r[3] + (r[2] ? '(eroe)' : '')] || 0) + 1; console.log('per clip', JSON.stringify(pc));
  console.log('T381', JSON.stringify(R.t381));
  await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 200);
}
