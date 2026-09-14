#!/usr/bin/env node
/* DIAGNOSI (scratch, non guardiano): separa i DUE driver posizionali nella STESSA lettura.
   A = stageSitPositions (posizioni LOGICHE React, __CPM_MP)
   B = AI off-ball del render-loop (mesh, __CPM_STATE)
   Se A e' vicino al pallone e B no, l'allontanamento nasce nel render-loop.       */
const PRES=+(process.env.CPM_PRES||0), INTRO=+(process.env.CPM_INTRO||0);
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const N = +(process.env.CPM_N || 40);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(([pr, it]) => { window.__CPM_GLB = false; window.__CPM_CINE = 1; if (pr) window.__CPM_PRESENT = 1; if (it) window.__CPM_FORCE_INTRO = it; }, [+(process.env.CPM_PRES||0), +(process.env.CPM_INTRO||0)]);
const { total } = await openMatch(page, port); await sleep(500);

const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
  const MP = window.__CPM_MP && window.__CPM_MP(); if (!MP) return null;
  const bx = S.ball.x, by = S.ball.y;
  /* mesh: home non-gk + eroe */
  const mesh = [];
  (S.players || []).forEach((p, i) => { if (p.gk || p.team !== 'home') return; mesh.push({ i, d: Math.hypot(p.x - bx, p.y - by), x: p.x, y: p.y }); });
  if (S.hero) mesh.push({ i: -1, d: Math.hypot(S.hero.x - bx, S.hero.y - by), x: S.hero.x, y: S.hero.y });
  mesh.sort((a, c) => a.d - c.d);
  /* logico: stesso pallone MESH (una sola sorgente per la palla), giocatori logici */
  const log = [];
  MP.forEach((q, i) => { if (!q || q.t !== 'home' || q.gk) return; log.push({ i, d: Math.hypot(q.x - bx, q.y - by), x: q.x, y: q.y }); });
  const hT = S.heroTarget;
  if (hT && hT.x != null) log.push({ i: -1, d: Math.hypot(hT.x - bx, hT.y - by), x: hT.x, y: hT.y });
  log.sort((a, c) => a.d - c.d);
  if (mesh.length < 4 || log.length < 4) return null;
  return {
    ph: S.phase,
    bx: +bx.toFixed(1), by: +by.toFixed(1),
    meshD1: +mesh[1].d.toFixed(1), meshD2: +mesh[2].d.toFixed(1), meshVic: mesh.slice(1).filter(z => z.d <= 12).length,
    logD1: +log[1].d.toFixed(1), logD2: +log[2].d.toFixed(1), logVic: log.slice(1).filter(z => z.d <= 12).length,
    /* CHI e' il piu' vicino, per indice di rosa: 1-4 DIF · 5-7 CEN · 8-9 ATT · -1 eroe */
    meshChi: mesh[1].i, logChi: log[1].i,
    /* scarto per uomo fra logico e mesh: quanto il render-loop sposta ciascuno */
    scarti: log.filter(z => z.i >= 0).map(z => { const m = mesh.find(w => w.i === z.i); return m ? +Math.hypot(m.x - z.x, m.y - z.y).toFixed(1) : null; }),
    /* distanza dal pallone, per uomo, logico -> mesh */
    perUomo: log.filter(z => z.i >= 0).map(z => { const m = mesh.find(w => w.i === z.i); return { i: z.i, L: +z.d.toFixed(1), M: m ? +m.d.toFixed(1) : null }; }),
  };
};

const R0 = [], R1 = [];
const passo = Math.max(1, Math.floor(total / N));
for (let gi = 0; gi < total; gi += passo) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(320); const a = await page.evaluate(LEGGI); if (a) R0.push({ gi, ...a });
  await sleep(1300); const c = await page.evaluate(LEGGI); if (c) R1.push({ gi, ...c });
}
srv.close(); await b.close();
const med = a => { const s = a.filter(Number.isFinite).slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const st = (nome, R) => {
  console.log(`\n=== ${nome} — ${R.length} scene ===`);
  console.log(`  LOGICO (stageSitPositions) 1º compagno: mediana ${med(R.map(r => r.logD1)).toFixed(1)} m · 2º ${med(R.map(r => r.logD2)).toFixed(1)} m · entro 12 m: mediana ${med(R.map(r => r.logVic))} · vuote ${(100 * R.filter(r => r.logVic === 0).length / R.length).toFixed(0)}%`);
  console.log(`  MESH   (render-loop)       1º compagno: mediana ${med(R.map(r => r.meshD1)).toFixed(1)} m · 2º ${med(R.map(r => r.meshD2)).toFixed(1)} m · entro 12 m: mediana ${med(R.map(r => r.meshVic))} · vuote ${(100 * R.filter(r => r.meshVic === 0).length / R.length).toFixed(0)}%`);
  const sc = [].concat(...R.map(r => r.scarti)).filter(Number.isFinite);
  console.log(`  spostamento per uomo logico→mesh: mediana ${med(sc).toFixed(1)} m · max ${Math.max(...sc).toFixed(1)} m`);
  const cnt = {}; R.forEach(r => { const k = r.logChi; cnt['L' + k] = (cnt['L' + k] || 0) + 1; });
  const cnt2 = {}; R.forEach(r => { const k = r.meshChi; cnt2['M' + k] = (cnt2['M' + k] || 0) + 1; });
  console.log(`  chi e' il 1º compagno (logico): ${JSON.stringify(cnt)}`);
  console.log(`  chi e' il 1º compagno (mesh)  : ${JSON.stringify(cnt2)}`);
  /* per REPARTO: quanto ciascun reparto e' lontano dal pallone, logico vs mesh */
  const rep = { DIF: [1,2,3,4], CEN: [5,6,7], ATT: [8,9] };
  for (const [nm, idx] of Object.entries(rep)) {
    const L = [], M = [];
    R.forEach(r => r.perUomo.forEach(u => { if (idx.includes(u.i)) { L.push(u.L); if (u.M != null) M.push(u.M); } }));
    console.log(`  ${nm}: dal pallone logico ${med(L).toFixed(1)} m → mesh ${med(M).toFixed(1)} m`);
  }
};
console.log(`\n[ PRESENT=${PRES} FORCE_INTRO=${INTRO} ]`);
st('APERTURA (+0,3 s)', R0);
st('LETTURA (+1,6 s)', R1);
