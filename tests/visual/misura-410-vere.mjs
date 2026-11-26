#!/usr/bin/env node
/* SONDA giro 410 (PO-676) — LE PARATE NELLE PARTITE VERE. Non giudica: stampa.
   Partite vere dal salvataggio S5 del collaudo 177 (come misura-295), corpi GLB accesi, pagina nuova per partita, regime «gioco»
   (__CPM_PRESENT=1 + __CPM_REALWAIT + __CPM_CINE=1), pilota automatico a 2x. Un registratore nella pagina svuota a ogni fotogramma il
   testimone __CPM_GKTL (bacino visibile del portiere, giro 410) e fotografa __CPM_GKACT a ogni gesto armato (lato stimato, esito).
   Per ogni reazione del portiere avversario su una PARATA stampa: lato, gesto, contatto (pallone sul suo piano), clip al contatto
   (a terra da 1,25 s per il tuffo), distanza di lato pallone-bacino visibile, quota del bacino e del pallone.
     CPM_CHROME=… node misura-410-vere.mjs   (CPM_SEMI=7,2021,31 · CPM_FLAG=__CPM_NO_G410 · CPM_TETTO=540 · CPM_PAR=3) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SALVA = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const SEMI = (process.env.CPM_SEMI || '7,2021,31').split(',').map(Number), TETTO = +(process.env.CPM_TETTO || 540) * 1000, PAR = +(process.env.CPM_PAR || 3);
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sd, flag) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  let ls; if (SALVA['cpm-v3']) { ls = { ...SALVA }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(SALVA)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, fl]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1;
    (fl || '').split(',').forEach(k => { if (k) window[k] = 1; });
    if (!sessionStorage.getItem('__m410')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__m410', '1'); }
    const L = window.__V410 = [], A = window.__V410A = []; let last = null;
    const f = () => { try { const R = window.__CPM_GKTL; if (R && R.length) { for (const q of R) if (L.length < 80000 && q.gx > 20) L.push(q); window.__CPM_GKTL = []; }
      const g = window.__CPM_GKACT; if (g && g.d148) { const k = JSON.stringify([g.last, g.lastDz, g.d148.sx, g.d148.sz]); if (k !== last) { last = k; A.push({ t: performance.now(), act: g.last, kind: g.lastKind, lat: +Math.abs(g.d148.zq - g.d148.gz).toFixed(2), tt: g.tt410, tp: g.t410 }); } } } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); }, [ls, flag || '']);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < TETTO) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'x'); if (ph === 'ended' || ph === 'ceremony' || ph === 'x') break; await sleep(1000); }
  const [L, A] = await page.evaluate(() => [window.__V410 || [], window.__V410A || []]).catch(() => [[], []]);
  await ctx.close(); return { L, A, ph, sec: Math.round((Date.now() - t0) / 1000) };
}
function analizza(L, A) {
  const seg = []; let cur = null;
  for (const f of L) { const r = f.isOpp && (f.cur === 'dive' || f.cur === 'block' || f.opp === 'gk_dive' || f.opp === 'gk_block');
    if (!r) { cur = null; continue; } if (!cur) { cur = { fr: [] }; seg.push(cur); } cur.fr.push(f); }
  const out = [];
  for (const s of seg) { const F = s.fr, t0 = F[0].t; const a = A.filter(q => q.t <= t0 + 50).pop() || null;
    const iA = F.findIndex(f => f.arcT > 0.01); if (iA < 0) continue;
    let iC = -1; for (let i = iA; i < F.length; i++) if (F[i].bx >= F[i].gx - 0.6) { iC = i; break; }
    const o = { act: F[0].opp, kind: a && a.kind, lat: a && a.lat, tt: a && a.tt, tp: a && a.tp, n: F.length };
    if (iC < 0 || F[iA].bx >= F[iA].gx - 0.6) { o.nc = 1; out.push(o); continue; }
    const C = F[iC]; o.cur = C.cur; o.ct = C.ct; o.terra = C.cur === 'dive' && C.ct >= 1.25; o.vis = C.vz != null ? +Math.abs(C.bz - C.vz).toFixed(2) : null; o.vy = C.vy; o.by = C.by;
    const iS = F.findIndex(f => f.cur === 'dive' && f.ct >= 0.8); o.ant = iS >= 0 && iS <= iC ? +(C.arcT - F[iS].arcT).toFixed(2) : null; out.push(o); }
  return out;
}
const flag = process.env.CPM_FLAG || ''; const coda = [...SEMI], tutte = [];
await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const sd = coda.shift(); const r = await gioca(sd, flag); const S = analizza(r.L, r.A);
  console.log(`\n== seme ${sd}${flag ? ' ' + flag : ''}: fase finale ${r.ph} · ${r.sec} s · fotogrammi del portiere ${r.L.length} · reazioni ${S.length}`);
  for (const o of S) console.log(`  ${o.kind || '?'} ${o.tp || '?'} lato ${o.lat} testo-tuffo ${o.tt} · gesto ${o.act}` + (o.nc ? ' · contatto non trovato' : ` · al contatto clip ${o.cur} ${o.ct}${o.terra ? ' A TERRA' : ''} · stacco ${o.ant} s prima · pallone a ${o.vis} u dal bacino visibile (bacino a quota ${o.vy}, pallone a ${o.by})`));
  tutte.push(...S); } }));
const P = tutte.filter(o => (o.kind === 'saved' || o.kind === 'save') && !o.nc);
const cen = P.filter(o => o.lat < 2), lat = P.filter(o => o.lat >= 2);
console.log(`\nRIEPILOGO parate con contatto: ${P.length} · centrali (lato < 2) ${cen.length}: tuffi ${cen.filter(o => o.act === 'gk_dive').length}, pallone oltre 1 u dal bacino ${cen.filter(o => o.vis > 1).length} · laterali ${lat.length}: a terra al contatto ${lat.filter(o => o.terra).length}, pallone oltre 1,6 u dal bacino ${lat.filter(o => o.vis > 1.6).length}`);
await b.close(); srv.close(); process.exit(0);
