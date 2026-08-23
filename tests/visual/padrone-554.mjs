#!/usr/bin/env node
/* FASE 1 DELLA MISSIONE — IL PALLONE HA UN PADRONE? BASELINE ALL'APERTURA DELLA SCENA.
   L'audit dice che nel modello non esiste un proprietario: 53 scritture senza priorita', e il «portatore»
   ricostruito a valle per prossimita' geometrica DENTRO il renderer — e solo nella fase di cronaca
   (`_curPh==='playing'`, modello 7.526). Negli HIGHLIGHT quel modello non gira affatto: e' li' che nasce
   il codice 001 del PO, «all'apertura il pallone non e' ai piedi di nessuno».
   Qui si misura, scena per scena, all'apertura: quanto dista il pallone dal compagno piu' vicino, dall'eroe
   e dall'avversario piu' vicino. Nessun rimedio: solo il numero da cui partire.
     CPM_CHROME=... node padrone-554.mjs [CPM_N=60]                                                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 60);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_CINE = 1; if (r) window.__CPM_NO554 = 1; /* rosso: il padrone torna dentro la sola cronaca */ }, process.env.CPM_NO554 ? 1 : 0);
const { total } = await openMatch(page, port);
await sleep(500);
const righe = [];
const passo = Math.max(1, Math.floor(total / N));
for (let gi = 0; gi < total; gi += passo) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(320);
  const r = await page.evaluate(() => {
    const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
    const bx = S.ball.x, by = S.ball.y;
    let mate = 1e9, opp = 1e9;
    for (const p of (S.players || [])) {
      if (p.gk) continue;
      const d = Math.hypot(p.x - bx, p.y - by);
      if (p.team === 'home') { if (d < mate) mate = d; } else if (d < opp) opp = d;
    }
    const h = S.hero ? Math.hypot(S.hero.x - bx, S.hero.y - by) : null;
    return { mate: +mate.toFixed(1), opp: +opp.toFixed(1), hero: h == null ? null : +h.toFixed(1) };
  });
  if (!r) continue;
  await sleep(1200);
  const r2 = await page.evaluate(() => {
    const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
    const bx = S.ball.x, by = S.ball.y; let mate = 1e9;
    for (const p of (S.players || [])) { if (p.gk || p.team !== 'home') continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < mate) mate = d; }
    const h = S.hero ? Math.hypot(S.hero.x - bx, S.hero.y - by) : null;
    return { mate: +mate.toFixed(1), hero: h == null ? null : +h.toFixed(1) };
  });
  righe.push({ gi, ...r, tardi: r2 });
}
srv.close(); await b.close();
const med = a => { const b2 = a.slice().sort((x, y) => x - y); return b2.length ? b2[Math.floor(b2.length / 2)] : NaN; };
const p90 = a => { const b2 = a.slice().sort((x, y) => x - y); return b2.length ? b2[Math.floor(b2.length * 0.9)] : NaN; };
console.log(`\n=== IL PALLONE ALL'APERTURA DELLA SCENA — ${righe.length} scene su ${total} ===\n`);
const peggio = righe.slice().sort((a, b) => b.mate - a.mate).slice(0, 8);
for (const r of peggio) console.log(`  gi${String(r.gi).padStart(3)} · compagno più vicino ${String(r.mate).padStart(5)}u · eroe ${String(r.hero).padStart(5)}u · avversario ${String(r.opp).padStart(5)}u`);
const mates = righe.map(r => r.mate), heroes = righe.map(r => r.hero).filter(x => x != null);
const nostri0 = righe.map(r => Math.min(r.mate, r.hero == null ? 1e9 : r.hero));
console.log(`\n  compagno più vicino al pallone : mediana ${med(mates).toFixed(1)}u · p90 ${p90(mates).toFixed(1)}u · peggiore ${Math.max(...mates).toFixed(1)}u`);
console.log(`  eroe                           : mediana ${med(heroes).toFixed(1)}u · p90 ${p90(heroes).toFixed(1)}u`);
console.log(`  avversario più vicino          : mediana ${med(righe.map(r => r.opp)).toFixed(1)}u`);
console.log(`  il NOSTRO più vicino (eroe compreso): mediana ${med(nostri0).toFixed(1)}u · p90 ${p90(nostri0).toFixed(1)}u · peggiore ${Math.max(...nostri0).toFixed(1)}u`);
const nostri = righe.map(r => Math.min(r.mate, r.hero == null ? 1e9 : r.hero));
const aiPiedi = nostri.filter(d => d <= 2).length, vicino = nostri.filter(d => d <= 5).length;
console.log(`\n  scene col pallone AI PIEDI di un NOSTRO, eroe compreso (<=2u) : ${aiPiedi}/${righe.length}  (${(100 * aiPiedi / righe.length).toFixed(0)}%)`);
console.log(`  scene col pallone a portata di un NOSTRO (<=5u)               : ${vicino}/${righe.length}  (${(100 * vicino / righe.length).toFixed(0)}%)`);
const tardi = righe.map(r => r.tardi).filter(Boolean).map(t => Math.min(t.mate, t.hero == null ? 1e9 : t.hero));
console.log(`\n  --- E DOPO UN SECONDO E MEZZO (il PO guarda la scena, non il fotogramma zero) ---`);
console.log(`  il NOSTRO più vicino: mediana ${med(tardi).toFixed(1)}u · p90 ${p90(tardi).toFixed(1)}u`);
console.log(`  pallone AI PIEDI (<=2u) : ${tardi.filter(d => d <= 2).length}/${tardi.length}  (${(100 * tardi.filter(d => d <= 2).length / Math.max(1, tardi.length)).toFixed(0)}%)`);
console.log(`  pallone a portata (<=5u): ${tardi.filter(d => d <= 5).length}/${tardi.length}  (${(100 * tardi.filter(d => d <= 5).length / Math.max(1, tardi.length)).toFixed(0)}%)`);
console.log('\n⚠️ una unità ≈ un metro (linea di porta ±48,6 · touchline ±33,2). Baseline: nessun rimedio in questa misura.');
