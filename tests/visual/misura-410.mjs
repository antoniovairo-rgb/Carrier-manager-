#!/usr/bin/env node
/* SONDA giro 410 (PO-676) — PARATE: TIRO CENTRALE CONTRO TIRO LATERALE. Non giudica: stampa (il guardiano e' portiere-410.mjs).
   Corpi GLB accesi, pagina NUOVA per scena, __CPM_PRESENT=1 + __CPM_CINE=1 (stacco, congelamento e build-up come li vede il giocatore).
   Ogni pagina forza la scena di tiro, esito «parata» (__CPM_FORCE_KIND='saved'), e mette il bersaglio della parata a <dz> u di lato
   dal portiere (__CPM_SVZ410, solo ?cpmtest=1). Testimoni letti a ogni fotogramma DENTRO la pagina:
     __CPM_GKTL  (per avatar portiere: gesto GLB montato, tempo della clip ct, pallone, arco ballArcT/ballArcDur, posizione)
     __CPM_GKACT (gesto armato all'armo dell'arco e distanza di lato stimata dal gioco: d148.zq − d148.gz)
   Per scena stampa: lato stimato, gesto, CONTATTO = primo fotogramma col pallone sul piano del portiere (bx >= gx − 0,6) in tempo
   d'arco (= tempo di scena), STACCO = primo fotogramma con la clip del tuffo oltre 0,80 s (il corpo lascia terra; misurato sulla clip
   nel 7.855: in piedi fino a 0,8 s, in volo 0,8-1,25, a terra da 1,25), TERRA = clip oltre 1,25 s; anticipo = contatto − stacco;
   «a terra al contatto» = clip >= 1,25 nel fotogramma del contatto; lateralita' del pallone dal corpo al contatto |bz − gz|.
     CPM_CHROME=… node misura-410.mjs   (CPM_SCENE='165:0,90:0,…' · CPM_DZ='0.4,1.6,3' · CPM_PAR=2 · CPM_FLAG=__CPM_NO_G410) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
export const SCENE_DEF = '165:0,90:0,9:0,11:0,10:0,7:0,4:0,17:2';
export async function misura410(b, port, sc, dz, flag, foto) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([fl]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; (fl || '').split(',').forEach(k => { if (k) window[k] = 1; });
    const L = window.__M410 = []; const f = () => { try { const R = window.__CPM_GKTL; if (R && R.length) { for (const q of R) { if (L.length < 20000) L.push(q); if (window.__F410 === 1 && q.gx > 20 && q.arcT > 0.01 && q.bx >= q.gx - 1.0) { window.__CPM_FROZEN = true; window.__F410 = 2; } } window.__CPM_GKTL = []; } } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); }, [flag || '']);
  const o = { sc, dz };
  try {
    await openMatch(page, port); await sleep(800);
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), sc.gi)) { await page.close(); o.err = 'force fallito'; return o; }
    await sleep(300);
    await page.evaluate(d => { window.__CPM_FROZEN = false; window.__CPM_GKTL = []; window.__M410.length = 0; window.__CPM_GKACT = {}; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'saved'; window.__CPM_SVZ410 = d; window.__CPM_W410 = null; }, dz);
    await sleep(400);
    if (foto) await page.evaluate(() => { window.__F410 = 1; });
    await page.evaluate(a => window.__CPM_RESOLVE(a), sc.ai);
    /* EVENTO: arco armato, poi spento, + 1,2 s di arco (tetto di parete 240 s) */
    const t0 = Date.now(); let ok = false;
    while (Date.now() - t0 < 240000) { await sleep(500);
      const s = await page.evaluate(() => { const R = (window.__M410 || []).filter(f => f.gx > 20); let arm = -1, end = -1; for (let i = 0; i < R.length; i++) { if (R[i].arcT > 0 && arm < 0) arm = i; if (arm >= 0 && i > arm + 3 && Math.abs(R[i].arcT - R[i - 1].arcT) < 1e-3 && Math.abs(R[i - 1].arcT - R[i - 2].arcT) < 1e-3) { end = i; break; } } return { n: R.length, arm, end, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, opp: R.length ? R[R.length - 1].opp : null }; });
      if (foto && await page.evaluate(() => window.__F410 === 2)) { await sleep(700); await page.screenshot({ path: foto }); o.foto = foto; await page.evaluate(() => { window.__F410 = 3; window.__CPM_FROZEN = false; }); }
      if (s.arm >= 0 && (s.end >= 0 || (s.ph && s.ph !== 'hl_result' && s.n > 5))) { ok = true; await sleep(1500); break; } }
    const [R, A] = await page.evaluate(() => [(window.__M410 || []).slice(), window.__CPM_GKACT || {}]); await page.close();
    const G = R.filter(f => f.gx > 20);
    if (process.env.CPM_DUMP) console.log(JSON.stringify(G.map(f => [f.opp, f.cur, f.ct, f.arcT, f.arcD, f.bx, f.bz, f.gx, f.pz])).slice(0, 6000));
    o.act = A.last || null; o.tt = A.tt410; o.t = A.t410; o.lat = A.d148 ? +Math.abs(A.d148.zq - A.d148.gz).toFixed(2) : null; o.lastDz = A.lastDz;
    if (!ok || !G.length) { o.err = 'arco non visto (' + G.length + ' fotogrammi del portiere)'; return o; }
    /* contatto: primo fotogramma con l'arco vivo e il pallone sul piano del portiere */
    let iA = G.findIndex(f => f.arcT > 0.01); if (iA < 0) { o.err = 'arco mai partito'; return o; }
    if (G[iA].bx >= G[iA].gx - 0.6) { o.err = 'il pallone parte gia\' sul piano del portiere (portiere uscito)'; return o; }
    let iC = -1; for (let i = iA; i < G.length; i++) { const f = G[i]; if (f.bx >= f.gx - 0.6) { iC = i; break; } if (i > iA + 1 && Math.abs(f.arcT - G[i - 1].arcT) < 1e-3) { iC = i - 1; o.cFine = 1; break; } }
    if (iC < 0) { o.err = 'contatto non trovato'; return o; }
    const C = G[iC]; o.arcD = C.arcD; o.tC = C.arcT;
    const iS = G.findIndex((f, i) => i >= iA - 30 && f.cur === 'dive' && f.ct != null && f.ct >= 0.8);
    const iL = G.findIndex((f, i) => i >= iA - 30 && f.cur === 'dive' && f.ct != null && f.ct >= 1.25);
    const tOf = i => (i < 0 ? null : (i < iA ? -(iA - i) * 0.03 : G[i].arcT));/* prima dell'armo: stima a 0,03 s per fotogramma (solo per segno) */
    o.tS = tOf(iS); o.tL = tOf(iL); o.anticipo = o.tS == null ? null : +(o.tC - o.tS).toFixed(2);
    o.ctC = C.cur || null; o.ctT = C.ct; o.terra = !!(C.cur === 'dive' && C.ct != null && C.ct >= 1.25);
    o.bzgz = +Math.abs(C.bz - C.pz).toFixed(2); o.pz0 = G[iA].pz; o.spost = +Math.abs(C.pz - G[iA].pz).toFixed(2);
    o.vis = C.vz != null ? +Math.abs(C.bz - C.vz).toFixed(2) : null; o.rm = C.vz != null ? +(C.vz - C.pz).toFixed(2) : null; o.vy = C.vy; o.cn = C.cn; o.by = C.by;
    { let m = 99; for (let i = iA; i <= iC; i++) { const f = G[i]; if (f.vz != null) m = Math.min(m, Math.hypot(f.bx - f.vx, f.bz - f.vz)); } o.minVis = m < 99 ? +m.toFixed(2) : null; }
    o.gesti = [...new Set(G.slice(iA).map(f => f.cur).filter(Boolean))].join('+');
  } catch (e) { try { await page.close(); } catch (_e) {} o.err = 'errore: ' + String(e.message || e).slice(0, 120); }
  return o;
}
export const riga410 = o => o.err ? `gi${o.sc.gi} a${o.sc.ai} dz ${o.dz}: NON MISURATO (${o.err}) gesto ${o.act}` :
  `gi${o.sc.gi} a${o.sc.ai} dz ${o.dz}: lato stimato ${o.lat} · tipo ${o.t} testo-tuffo ${o.tt} · gesto armato ${o.act} (clip ${o.gesti || '-'}) · contatto a ${o.tC}/${o.arcD} s d'arco${o.cFine ? ' (fine arco)' : ''} · stacco ${o.tS} · terra ${o.tL} · anticipo stacco→contatto ${o.anticipo} s · al contatto clip ${o.ctC} ${o.ctT} pallone a quota ${o.by}${o.terra ? ' A TERRA' : ''} · pallone a ${o.bzgz} u di lato dal corpo procedurale, a ${o.vis} dal BACINO VISIBILE (quota ${o.vy}, clip ${o.cn}, spinta propria della clip ${o.rm}) · minimo pallone-bacino visibile fino al contatto ${o.minVis} · corpo spostato ${o.spost} u`;
if (import.meta.url === `file://${process.argv[1]}`) {
  const SC = (process.env.CPM_SCENE || SCENE_DEF).split(',').map(q => { const [gi, ai] = q.split(':'); return { gi: +gi, ai: +ai }; });
  const DZ = (process.env.CPM_DZ || '0.4,1.6,3').split(',').map(Number), PAR = +(process.env.CPM_PAR || 2);
  const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
  const coda = []; for (const sc of SC) for (const dz of DZ) coda.push({ sc, dz });
  await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const q = coda.shift(); const o = await misura410(b, port, q.sc, q.dz, process.env.CPM_FLAG, process.env.CPM_FOTO ? `${process.env.CPM_FOTO}/gi${q.sc.gi}-dz${q.dz}${process.env.CPM_FLAG ? '-rosso' : '-verde'}.png` : null); console.log(riga410(o)); } }));
  await b.close(); srv.close();
}
