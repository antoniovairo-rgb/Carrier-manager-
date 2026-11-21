#!/usr/bin/env node
/* SONDA giro 293 (PO-562) — «gunther continua a muoversi avanti ed indietro prima della mia scelta» (ritorno di PO-545).
   Sola lettura. GLB acceso, stacco di scena attivo (__CPM_PRESENT=1), un campione per FOTOGRAMMA col TEMPO DI SCENA.
   A differenza di misura-286 non guarda solo «il corpo piu' vicino al pallone»: per ogni scena registra TUTTI i corpi e dice
     · chi e' il portatore (il corpo piu' spesso piu' vicino al pallone dopo l'apertura), di che squadra, come si chiama, a che distanza;
     · le sue inversioni avanti/indietro (isteresi 0,12 u per asse) per secondo di scena e l'escursione massima;
     · le inversioni del PALLONE (un pallone che oscilla fa oscillare chi lo segue);
     · ogni altro corpo entro CPM_RAGGIO u dal pallone (default 6) che va avanti e indietro (il PO guarda la zona del pallone);
     · per il portatore: se e' nell'attesa di lettura (testimone __CPM_G286W: k, battitore, portatore difensivo), o guidato da altro.

     CPM_CHROME=… node misura-293.mjs                  scansione (gi a passo CPM_PASSO, default 4; una pagina ogni CPM_PER scene, default 12)
     CPM_GI=44,50                                       scene nominate          CPM_NUOVA=1 una pagina nuova per scena
     CPM_SEC=<secondi di scena, default 8>              CPM_TRACCIA=1           CPM_INIT=<js>   CPM_OUT=<file json>
     CPM_FLUSSO=<n> highlight del flusso vero (n partite, primo highlight)      CPM_ROOT=<altra copia del gioco> */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const SEC = +(process.env.CPM_SEC || 8), NUOVA = !!process.env.CPM_NUOVA, PER = +(process.env.CPM_PER || 12), RAGGIO = +(process.env.CPM_RAGGIO || 6), SALTA = 0.6, IST = 0.12;
const srv = await startServer(process.env.CPM_ROOT || undefined), port = srv.address().port, b = await launchBrowser();
const PRE = ph => ph === 'hl_intro' || ph === 'hl_move' || ph === 'hl_choose';

export function inversioni(S) { /* S = [{st,x,z}] */
  let n = 0, amp = 0;
  for (const ax of ['x', 'z']) { let dir = 0, ext = S[0][ax]; const v0 = S[0][ax];
    for (const p of S) { const v = p[ax];
      if (!dir) { if (v - v0 > IST) { dir = 1; ext = v; } else if (v0 - v > IST) { dir = -1; ext = v; } continue; }
      if (dir > 0) { if (v > ext) ext = v; else if (ext - v > IST) { n++; amp = Math.max(amp, ext - v); dir = -1; ext = v; } }
      else { if (v < ext) ext = v; else if (v - ext > IST) { n++; amp = Math.max(amp, v - ext); dir = 1; ext = v; } } } }
  return { n, amp };
}
function analizza(R, MP, W) {
  R = R.filter(f => PRE(f.ph)); if (R.length < 2) return { nonGiud: 'nessun fotogramma prima della scelta' };
  const st0 = R[0].st; R = R.filter(f => f.st - st0 >= SALTA); if (R.length < 12) return { nonGiud: `solo ${R.length} fotogrammi dopo l'apertura` };
  const dur = R[R.length - 1].st - R[0].st; if (!(dur >= 2.5)) return { nonGiud: `solo ${dur.toFixed(2)} s di scena` };
  const serie = i => R.map(f => { const q = f.pl[i]; return q ? { st: f.st, x: q.mx - 50, z: (q.my - 50) * 0.68, d: Math.hypot(q.mx - f.bx, (q.my - f.by) * 0.68), port: q.port, ph: f.ph } : null; }).filter(Boolean);
  const c = {}; for (const f of R) c[f.i] = (c[f.i] || 0) + 1;
  const ord = Object.entries(c).sort((a, b) => b[1] - a[1]); const pi = +ord[0][0];
  const chi = i => i === 23 ? { t: 'eroe', n: 'EROE' } : (MP && MP[i] ? { t: MP[i].t === 'home' ? 'compagno' : 'avversario', n: MP[i].n, gk: MP[i].gk } : { t: '?', n: '?' });
  const uno = i => { const S = serie(i); if (S.length < 12) return null; const v = inversioni(S); let strada = 0; for (let k = 1; k < S.length; k++) strada += Math.hypot(S[k].x - S[k - 1].x, S[k].z - S[k - 1].z);
    const ds = S.map(s => s.d).sort((a, b) => a - b); return { i, ...chi(i), inv: v.n, invS: +(v.n / dur).toFixed(2), amp: +v.amp.toFixed(2), strada: +strada.toFixed(2), dMed: +ds[ds.length >> 1].toFixed(2), dMax: +ds[ds.length - 1].toFixed(2), port: S.filter(s => s.port).length };
  };
  const P = uno(pi); if (!P) return { nonGiud: 'portatore non campionato' };
  const pall = inversioni(R.map(f => ({ st: f.st, x: f.bx - 50, z: (f.by - 50) * 0.68 })));
  const vicini = []; for (let i = 0; i < 24; i++) { if (i === pi) continue; const o = uno(i); if (o && o.dMed <= RAGGIO && (o.invS > 1 || o.amp > 0.5)) vicini.push(o); }
  const w = (W || []).filter(x => x.i === pi), wk = w.length ? { n: w.length, kMin: Math.min(...w.map(x => x.k)), kMax: Math.max(...w.map(x => x.k)), tk: w.filter(x => x.tk).length, tc: w.filter(x => x.tc).length } : null;
  if (process.env.CPM_TRACCIA) { const S = serie(pi); for (let k = 0; k < S.length; k++) { const f = R[k]; console.log(`     ${(S[k].st - st0).toFixed(2)} ${S[k].ph} corpo(${S[k].x.toFixed(2)};${S[k].z.toFixed(2)}) pallone(${(f.bx - 50).toFixed(2)};${((f.by - 50) * 0.68).toFixed(2)}) d ${S[k].d.toFixed(2)} ws${f.ws} ${f.src || ''}${S[k].port ? ' port850' : ''}`); } }
  return { pi, quota: Math.round(100 * ord[0][1] / R.length), fot: R.length, dur: +dur.toFixed(2), P, invPall: pall.n, ampPall: +pall.amp.toFixed(2), vicini, wk, fasi: [...new Set(R.map(f => f.ph.replace('hl_', '')))].join('+') };
}
async function apri(nome, flusso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(js => { window.__CPM_PRESENT = 1; window.__CPM_G286W = []; if (js) { try { (0, eval)(js); } catch (_e) {} }
    window.__R293 = []; const giro = () => { try { if (window.__R293_ON && window.__CPM_OWN && window.__CPM_PHASE) { const ph = window.__CPM_PHASE(); if (/^hl_/.test(ph || '')) { const o = window.__CPM_OWN(); const w = window.__CPM_WS ? window.__CPM_WS() : null; if (o) { const pl = []; for (let i = 0; i < 23; i++) { const q = window.__CPM_PLPOS(i); pl.push(q ? { mx: q.mx, my: q.my, port: q.port ? 1 : 0 } : null); } try { const S = window.__CPM_STATE(); const h = S && S.hero; pl[23] = h ? { mx: h.x, my: h.y } : null; } catch (_e) { pl[23] = null; } window.__R293.push({ st: window.__CPM_SCENET || 0, ph, bx: o.x, by: o.y, i: o.i === -2 ? 23 : o.i, d: o.d, pl, ws: w ? w.ws : null, src: w ? w.src : null }); } } } } catch (_e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); }, process.env.CPM_INIT || '');
  await openMatch(page, port, flusso ? { skipLoadAll: true, name: nome } : (nome ? { name: nome } : undefined)); await sleep(700);
  const t0 = Date.now(); while (Date.now() - t0 < 60000) { if (await page.evaluate(() => window.__CPM_GLB_READY === true)) break; await sleep(400); }
  return page;
}
async function raccogli(page) {
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) { await sleep(400); const s = await page.evaluate(() => { const R = window.__R293; return R.length ? [R[0].st, R[R.length - 1].st, R[R.length - 1].ph] : null; }); if (s && s[1] - s[0] >= SEC + 0.6) break; if (s && !/^hl_(intro|move|choose)$/.test(s[2]) && Date.now() - t0 > 3000) break; }
  const [R, MP, W, glb] = await page.evaluate(() => { window.__R293_ON = 0; return [window.__R293, window.__CPM_MP ? window.__CPM_MP() : null, window.__CPM_G286W, window.__CPM_GLB_READY === true]; });
  return { ...analizza(R, MP, W), glb };
}
function riga(id, o) {
  if (o.nonGiud) return `  ${id}: NON GIUDICATO (${o.nonGiud})`;
  const P = o.P, mal = P.invS > 1 || P.amp > 0.5;
  return `  ${mal ? '✗' : (o.vicini.length ? '~' : '·')} ${id}: portatore ${P.t} ${P.n}#${P.i} (${o.quota}%, d mediana ${P.dMed} max ${P.dMax}) · ${o.fasi} · ${o.fot} fot/${o.dur} s · inversioni ${P.inv} (${P.invS}/s) escursione ${P.amp} u strada ${P.strada} u · pallone inv ${o.invPall} (${o.ampPall} u)${P.port ? ' · port850 ' + P.port : ''}${o.wk ? ` · attesa k ${o.wk.kMin}-${o.wk.kMax} batt ${o.wk.tk} dif ${o.wk.tc} (${o.wk.n})` : ' · FUORI dall\'attesa di lettura'}${o.vicini.length ? ' · vicini che oscillano: ' + o.vicini.map(v => `${v.t} ${v.n}#${v.i} d${v.dMed} ${v.invS}/s ${v.amp}u`).join(', ') : ''}${o.glb ? '' : ' · GLB NON PRONTO'}`;
}
const out = [];
if (process.env.CPM_FLUSSO) {
  /* flusso vero: CPM_FLUSSO partite (nomi diversi = semi diversi), fino a CPM_HL highlight per partita (default 6). Durante la lettura NESSUN pilota
     (la scena si comporta come col giocatore che guarda e non tocca); dopo SEC secondi di scena il pilota sceglie e si rispegne all'esito. */
  const HL = +(process.env.CPM_HL || 6), NOMI = (process.env.CPM_NOMI || '').split(',').filter(Boolean);
  for (let k = 0; k < +process.env.CPM_FLUSSO; k++) { const nome = NOMI[k] || ('Flusso' + 'ABCDEFGHIJKLMNOPQRST'[k % 20]); const page = await apri(nome, true);
    try { for (let h = 0; h < HL; h++) {
      const t0 = Date.now(); let ph = null; while (Date.now() - t0 < 200000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (/^hl_(intro|move|choose)$/.test(ph || '') || ph === 'ended') break; await sleep(120); }
      if (!/^hl_/.test(ph || '')) break;
      await page.evaluate(() => { window.__R293 = []; window.__CPM_G286W = []; window.__R293_ON = 1; });
      let o; try { o = await raccogli(page); } catch (e) { o = { nonGiud: 'errore ' + String(e.message || e).slice(0, 80) }; }
      const inf = await page.evaluate(() => { let c = null, s = null, m = null; try { c = window.__CPM_CURSIT && window.__CPM_CURSIT(); } catch (_e) {} try { s = window.__CPM_SPOT073 && window.__CPM_SPOT073(); } catch (_e) {} try { m = window.__CPM_STATE().clock; } catch (_e) {} return { c, s, m }; });
      o.sit = inf.c; o.spot = inf.s; o.min = inf.m; out.push({ flusso: nome, h, ...o });
      console.log(riga(`flusso ${nome} #${h + 1} ${inf.m}' gi${inf.c ? inf.c.gi : '?'} ${inf.c ? inf.c.type + (inf.c.offBall ? '/offBall' : '') + ' «' + inf.c.t.slice(0, 34) + '»' : ''}${inf.s && inf.s.spot ? ' punto ' + inf.s.spot.at + ' batt ' + inf.s.spot.taker : ''}${inf.s && inf.s.orig ? ' origine ' + inf.s.orig.at : ''}`, o));
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { policy: 'seeded', seed: s, tickMs: 200 }), 7 + k * 13 + h);
      const t1 = Date.now(); while (Date.now() - t1 < 60000) { const p2 = await page.evaluate(() => window.__CPM_PHASE()); if (!/^hl_(intro|move|choose)$/.test(p2 || '')) break; await sleep(100); }
      await page.evaluate(() => window.__CPM_AUTOPLAY(false));
      const t2 = Date.now(); while (Date.now() - t2 < 60000) { const p3 = await page.evaluate(() => window.__CPM_PHASE()); if (p3 !== 'hl_result') break; await sleep(100); }
    } } catch (e) { console.log('  partita ' + nome + ': errore ' + String(e.message || e).slice(0, 100)); }
    await page.close(); }
} else {
  const passo = +(process.env.CPM_PASSO || 4), GI = process.env.CPM_GI ? process.env.CPM_GI.split(',').map(Number) : Array.from({ length: Math.ceil(191 / passo) }, (_, k) => k * passo);
  let page = null, n = 0;
  for (const gi of GI) {
    if (NUOVA || !page || n % PER === 0) { if (page) await page.close(); page = await apri(process.env.CPM_NOME || null, false); } n++;
    let o; try { const ok = await page.evaluate(g => { window.__CPM_FROZEN = false; window.__R293 = []; window.__CPM_G286W = []; window.__R293_ON = 1; return window.__CPM_FORCE_SIT(g, false); }, gi); o = ok ? await raccogli(page) : { nonGiud: 'force fallito' }; } catch (e) { o = { nonGiud: 'errore ' + String(e.message || e).slice(0, 80) }; }
    out.push({ gi, ...o }); console.log(riga('gi' + gi, o));
  }
  if (page) await page.close();
}
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(out));
await b.close(); srv.close();
