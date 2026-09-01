#!/usr/bin/env node
/* DIAGNOSI — IL PORTIERE, TRE NOTE DEL PO IN UNA MISURA SOLA.
     · «codice 111 — portiere fuori tempo»          -> uMin: la frazione di gesto in cui la palla e' piu' vicina
     · «Non ha effettuato la parata» (tiro da ~30m) -> gesti mancanti: conclusione parata, portiere fermo
     · «codice 113 — portiere doppio gesto»         -> cut: un gesto GK interrotto prima della fine da un altro
   Legge il testimone __CPM_GKW (7.552), scritto DENTRO il blocco CIN-2 sulla riga che anima il portiere.
     CPM_CHROME=... node portiere-552.mjs [--verbose]                                                      */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const VERB = process.argv.includes('--verbose');
const SCENE = (process.env.CPM_SIT || '4,8,12,13,21,27,40,43,51,61,63,79,83,91,97,116,181').split(',').map(Number);
const MODI = (process.env.CPM_MODI || 'fail,success').split(',');/* [7.709] FORCE_OUTCOME accetta 'success'/'fail' (r.5696): il vecchio default 'goal' valeva FAIL — meta' delle misure storiche di questa sonda erano due volte lo stesso braccio */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
const GLB = process.env.CPM_GLB !== '0';/* [direttiva PO 01/09] «i test li devi fare con GLB ON»: il 111 del PO vive sulla clip GLB, non sul procedurale */
await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; window.__CPM_CINE = 1; if (o.n) window.__CPM_NO576 = 1; /* prova del rosso: il riflesso torna a 0,62s fissi */ }, { n: process.env.CPM_NO576 ? 1 : 0, glb: GLB });
await openMatch(page, port); await sleep(800);

const righe = [];
for (const modo of MODI) for (const gi of SCENE) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(350);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_GKW = { ev: [], cur: null }; window.__CPM_GKGATE = []; });
  await page.evaluate(m => { window.__CPM_FORCE_OUTCOME = m; }, modo);
  try { await page.evaluate(() => window.__CPM_RESOLVE(0)); } catch (e) { continue; }
  await sleep(3200);
  const W = await page.evaluate(() => { const w = window.__CPM_GKW || { ev: [] }; const ev = (w.ev || []).slice(); if (w.cur && w.cur.o) ev.push(w.cur.o); return ev; });
  const G = await page.evaluate(() => (window.__CPM_GKGATE || []).slice());
  const gest = W.filter(e => e.k === 'gest' && e.gk);
  const cut = W.filter(e => e.k === 'cut');
  righe.push({ gi, modo, gest, cut, gate: G, tutti: W.filter(e => e.k === 'gest').length });
}
srv.close(); await b.close();

console.log(`\n=== IL PORTIERE — ${righe.length} conclusioni (${MODI.join(' + ')}) ===\n`);
let senza = 0, conCut = 0, tardi = 0, presto = 0, buoni = 0;
for (const r of righe) {
  if (!r.gest.length) { senza++; console.log(`  ❌ gi${String(r.gi).padStart(3)} ${r.modo.padEnd(4)} — NESSUN GESTO DEL PORTIERE · cancello: ${r.gate.length ? r.gate.map(g => `t=${g.t} esito=${g.kind} dif=${g.def} gk=${g.gk} arco=${g.arc}`).join(' | ') : 'MAI RAGGIUNTO (nessuna conclusione)'}`); continue; }
  const g = r.gest[0];
  const u = g.uAtMin == null ? -1 : g.uAtMin;
  const tag = r.cut.length ? '🔁 DOPPIO' : (u < 0 ? '?' : u < 0.25 ? '⏩ TROPPO PRESTO' : u > 0.80 ? '⏪ TROPPO TARDI' : '✅');
  if (r.cut.length) conCut++; else if (u >= 0 && u < 0.25) presto++; else if (u > 0.80) tardi++; else if (u >= 0) buoni++;
  console.log(`  ${tag.padEnd(16)} gi${String(r.gi).padStart(3)} ${r.modo.padEnd(4)} ${g.type.padEnd(8)} dur ${String(g.dur).padStart(5)}s · palla piu' vicina a ${String(g.dzMin).padStart(5)}u al ${(u * 100).toFixed(0)}% del gesto · vita del gesto/volo: all'ultimo fotogramma l'arco era al ${g.arcEnd==null?'gia\' finito':(g.arcEnd*100).toFixed(0)+'%'}${r.cut.length ? ` · TAGLI ${r.cut.map(c => `${c.from}@${(c.atU * 100).toFixed(0)}%->${c.to}`).join(', ')}` : ''}`);
}
const tot = righe.length;
console.log(`\n  conclusioni senza NESSUN gesto del portiere : ${senza}/${tot}`);
console.log(`  gesti INTERROTTI da un secondo gesto        : ${conCut}/${tot}`);
console.log(`  portiere disteso TROPPO PRESTO (<25%)      : ${presto}/${tot}`);
console.log(`  portiere disteso TROPPO TARDI (>80%)       : ${tardi}/${tot}`);
console.log(`  in tempo (25-80%)                          : ${buoni}/${tot}`);
const G = righe.flatMap(r => r.gest);
const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : NaN; };
const vivi = G.filter(g => g.arcEnd != null);
const blk = G.filter(g => g.type === 'gk_block');
console.log(`\n  --- SINTESI ---`);
console.log(`  gesti GK misurati                          : ${G.length}  (tuffi ${G.filter(g=>g.type==='gk_dive').length} · riflessi ${blk.length} · uscite ${G.filter(g=>g.type==='gk_catch').length})`);
console.log(`  gesti che MUOIONO col volo ancora in corso : ${vivi.length}/${G.length}${vivi.length?'  (arco al '+vivi.map(g=>(g.arcEnd*100).toFixed(0)+'%').join(', ')+')':''}`);
console.log(`  distanza MINIMA palla-portiere, mediana    : ${med(G.map(g => g.dzMin)).toFixed(2)}u   (riflessi: ${blk.length?med(blk.map(g=>g.dzMin)).toFixed(2)+'u':'-'})`);
console.log(`  frazione del gesto al minimo, mediana      : ${(med(G.map(g => g.uAtMin == null ? 1 : g.uAtMin)) * 100).toFixed(0)}%`);
if (errs.length) console.log(`\n  ⚠️ errori di pagina: ${errs.slice(0, 3).join(' | ')}`);
console.log('\n⚠️ misura su scene FORZATE, non su partita vera: dice cosa fa il codice quando la conclusione parte, non quanto spesso capita.');
