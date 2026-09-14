#!/usr/bin/env node
/* MISSIONE — CODICE 113: IL PORTIERE FA DUE GESTI, FUORI TEMPO.
   Collaudo PO, due segnalazioni: «portiere doppio gesto» e «portiere doppio gesto, fuori tempo!».
   Il testimone `__CPM_GKW` esiste dal 7.465 e registra gia' l'evento che serve: `cut` — un gesto del
   portiere INTERROTTO prima di finire (u<0.95) e sostituito da un altro. Un gesto tagliato a meta' e
   riavviato da zero e' precisamente «doppio, e fuori tempo».
   Qui si forzano le scene una a una e si contano i tagli. Rosso/verde con __CPM_NO113.
     CPM_CHROME=... node portiere-113.mjs [CPM_QUANTE=40]                                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const QUANTE = +(process.env.CPM_QUANTE || 40);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function giro(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 820 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO113 = true; }, [rosso]);
  const { total } = await openMatch(page, port);
  await sleep(600);
  let visti = 0;
  for (let gi = 0; gi < total && visti < QUANTE; gi++) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
    if (!ok) continue;
    const acts = await page.evaluate(() => (window.__CPM_ACTS ? window.__CPM_ACTS() : []));
    if (!acts.length) continue;
    visti++;
    try { await page.evaluate(() => window.__CPM_RESOLVE(0)); } catch (e) { continue; }
    await sleep(2600);
  }
  const W = await page.evaluate(() => { try { const w = window.__CPM_GKW || { ev: [] }; if (w.cur) w.ev.push(w.cur.o); return JSON.parse(JSON.stringify(w.ev)); } catch (e) { return []; } });
  await page.close();
  return { visti, ev: W };
}
const R = await giro(true), V = await giro(false);
srv.close(); await b.close();
function conta(x) {
  const gest = x.ev.filter(e => e.k === 'gest' && e.gk);
  const cut = x.ev.filter(e => e.k === 'cut' && e.same);
  const per = {}; for (const c of cut) { const k = c.from + '→' + c.to; per[k] = (per[k] || 0) + 1; }
  const atU = cut.map(c => c.atU).sort((a, b2) => a - b2);
  return { scene: x.visti, gest: gest.length, cut: cut.length, per, atU };
}
const cr = conta(R), cv = conta(V);
console.log(`\n=== CODICE 113 — IL PORTIERE FA DUE GESTI? ===\n`);
for (const [n, c] of [['ROSSO (nessuna elezione)', cr], ['VERDE', cv]]) {
  console.log(`  ${n}`);
  console.log(`    scene ${c.scene} · gesti del portiere ${c.gest} · TAGLIATI a meta' e riavviati ${c.cut}${c.gest ? ' (' + (100 * c.cut / c.gest).toFixed(0) + '% dei gesti)' : ''}`);
  const p = Object.entries(c.per).sort((a, b2) => b2[1] - a[1]);
  if (p.length) console.log(`    quali: ` + p.map(([k, v]) => `${k} x${v}`).join(' · '));
  if (c.atU.length) console.log(`    tagliati a che punto del gesto (u): ` + c.atU.slice(0, 10).join(', '));
}
console.log('');
if (!cr.gest) { console.log(`✗ INCONCLUDENTE — nessun gesto del portiere osservato.`); process.exit(1); }
if (!cr.cut) { console.log(`✗ NON SEPARATI — nel rosso nessun gesto viene tagliato: il giudizio non prova niente.`); process.exit(1); }
if (!cv.gest) { console.log(`✗ INCONCLUDENTE — nel VERDE non si e' visto NESSUN gesto del portiere: zero tagli su zero gesti non e' un successo, e' cecita'. (La prima passata di questo guardiano aveva stampato un PASS proprio cosi'.)`); process.exit(1); }
if (cv.gest < cr.gest * 0.5) { console.log(`✗ INCONCLUDENTE — il verde ha visto ${cv.gest} gesti contro i ${cr.gest} del rosso: campioni troppo diversi per confrontarli.`); process.exit(1); }
if (cv.cut >= cr.cut) { console.log(`✗ FAIL — il verde taglia ancora ${cv.cut} gesti (rosso ${cr.cut}).`); process.exit(1); }
console.log(`✓ PASS — tagli del gesto del portiere: rosso ${cr.cut}, verde ${cv.cut}.`);
