#!/usr/bin/env node
/* SONDA giro 286 (PO-545) — «il portatore di palla prima della scelta si muove in continuazione avanti ed indietro».
   Sola lettura, usa varchi che esistono anche nella 7.999.196 (__CPM_OWN, __CPM_PLPOS, __CPM_SCENET): cosi' la stessa sonda
   gira sulle due versioni. GLB acceso, stacco di scena attivo (__CPM_PRESENT=1).
   Un campione per FOTOGRAMMA (requestAnimationFrame), ognuno col TEMPO DI SCENA: sul banco i fotogrammi sono pochi e
   irregolari, quindi le inversioni si contano per secondo DI SCENA e non per secondo di orologio.

     CPM_CHROME=… node misura-286.mjs                 scansione su una pagina (gi a passo CPM_PASSO, default 8)
     CPM_GI=44,50 CPM_NUOVA=1 …                       scene nominate, una pagina nuova per scena
     CPM_ROOT=<cartella di un'altra versione>         misura un'altra copia del gioco (confronto 196)
     CPM_SEC=<secondi di scena per scena, default 6>  CPM_TRACCIA=1 stampa la traccia del portatore  CPM_INIT=<js> */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const ROOT = process.env.CPM_ROOT || undefined;
const SEC = +(process.env.CPM_SEC || 6), NUOVA = !!process.env.CPM_NUOVA;
const srv = await startServer(ROOT), port = srv.address().port, b = await launchBrowser();

export function analizza(R, traccia) {
  /* solo le fasi prima della scelta */
  R = R.filter(f => f.ph === 'hl_intro' || f.ph === 'hl_move' || f.ph === 'hl_choose');
  if (R.length < 12) return { nonGiud: `solo ${R.length} fotogrammi prima della scelta` };
  const dur = R[R.length - 1].st - R[0].st; if (!(dur > 1.5)) return { nonGiud: `solo ${dur.toFixed(2)} s di scena` };
  /* il portatore: il corpo piu' spesso piu' vicino al pallone */
  const c = {}; for (const f of R) if (f.d < 3.5) c[f.i] = (c[f.i] || 0) + 1;
  const ord = Object.entries(c).sort((a, b) => b[1] - a[1]); if (!ord.length) return { nonGiud: 'nessun corpo entro 3,5 u dal pallone' };
  const pi = +ord[0][0], quota = ord[0][1] / R.length;
  const P = R.map(f => { const q = f.pl[pi]; return q ? { st: f.st, x: q.mx - 50, z: (q.my - 50) * 0.68, tx: q.tx == null ? null : q.tx - 50, tz: q.ty == null ? null : (q.ty - 50) * 0.68, lx: q.lx - 50, lz: (q.ly - 50) * 0.68, bx: f.bx - 50, bz: (f.by - 50) * 0.68, ph: f.ph, ws: f.ws, src: f.src } : null; }).filter(Boolean);
  if (P.length < 12) return { nonGiud: 'portatore non campionato (eroe?)', pi };
  const inv = (get) => { /* inversioni con isteresi 0,12 u lungo ciascun asse; ampiezza = escursione fra due inversioni */
    let n = 0, amp = [];
    for (const ax of [0, 1]) { let dir = 0, ext = get(P[0])[ax];
      for (const p of P) { const v = get(p)[ax]; if (dir >= 0 && v > ext) { ext = v; if (!dir && v - get(P[0])[ax] > 0.12) dir = 1; } else if (dir <= 0 && v < ext) { ext = v; if (!dir && get(P[0])[ax] - v > 0.12) dir = -1; }
        if (dir > 0 && ext - v > 0.12) { n++; amp.push(ext - v); dir = -1; ext = v; } else if (dir < 0 && v - ext > 0.12) { n++; amp.push(v - ext); dir = 1; ext = v; } } }
    return { n, amp }; };
  const cI = inv(p => [p.x, p.z]), bI = inv(p => [p.bx, p.bz]), tI = inv(p => [p.tx == null ? p.x : p.tx, p.tz == null ? p.z : p.tz]), lI = inv(p => [p.lx, p.lz]);
  let strada = 0, xs = P.map(p => p.x), zs = P.map(p => p.z); for (let i = 1; i < P.length; i++) strada += Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z);
  const retta = Math.hypot(P[P.length - 1].x - P[0].x, P[P.length - 1].z - P[0].z);
  if (traccia) for (const p of P) console.log(`     ${p.st.toFixed(2)} ${p.ph} corpo(${p.x.toFixed(2)};${p.z.toFixed(2)}) commesso(${p.tx == null ? '—' : p.tx.toFixed(2)};${p.tz == null ? '—' : p.tz.toFixed(2)}) logico(${p.lx.toFixed(2)};${p.lz.toFixed(2)}) pallone(${p.bx.toFixed(2)};${p.bz.toFixed(2)}) ws${p.ws} ${p.src || ''}`);
  return { pi, quota: +quota.toFixed(2), fot: P.length, dur: +dur.toFixed(2), fps: +(P.length / dur).toFixed(1), inv: cI.n, invS: +(cI.n / dur).toFixed(2), amp: +(Math.max(0, ...cI.amp)).toFixed(2), invPall: bI.n, invBers: tI.n, invLog: lI.n, strada: +strada.toFixed(2), retta: +retta.toFixed(2), escX: +(Math.max(...xs) - Math.min(...xs)).toFixed(2), escZ: +(Math.max(...zs) - Math.min(...zs)).toFixed(2) };
}

async function apri() {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(js => { window.__CPM_PRESENT = 1; if (/INTRO/.test(js || '')) window.__CPM_FORCE_INTRO = 1; if (js) { try { (0, eval)(js); } catch (_e) {} }
    window.__R286 = []; const giro = () => { try { if (window.__R286_ON && window.__CPM_OWN) { const o = window.__CPM_OWN(); const w = window.__CPM_WS ? window.__CPM_WS() : null; if (o) { const pl = []; for (let i = 0; i < 23; i++) pl.push(window.__CPM_PLPOS(i)); try { const S = window.__CPM_STATE(); const h = S && S.hero, ht = S && S.heroTarget; pl[23] = h ? { mx: h.x, my: h.y, lx: ht && ht.x != null ? ht.x : h.x, ly: ht && ht.y != null ? ht.y : h.y, tx: null, ty: null } : null; } catch (_e) { pl[23] = null; } window.__R286.push({ t: performance.now(), st: window.__CPM_SCENET || 0, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : o.ph, bx: o.x, by: o.y, i: o.i === -2 ? 23 : o.i, d: o.d, pl, ws: w ? w.ws : 0, src: w ? w.src : null }); } } } catch (_e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); }, process.env.CPM_INIT || '');
  await openMatch(page, port); await sleep(800);
  const t0 = Date.now(); while (Date.now() - t0 < 60000) { if (await page.evaluate(() => window.__CPM_GLB_READY === true)) break; await sleep(500); }
  return page;
}
async function scena(page, gi) {
  const ok = await page.evaluate(g => { window.__CPM_FROZEN = false; window.__R286 = []; window.__R286_ON = 1; return window.__CPM_FORCE_SIT(g, false); }, gi);
  if (!ok) return { nonGiud: 'force fallito' };
  const t0 = Date.now(); let R = [];
  while (Date.now() - t0 < 90000) { await sleep(400); const s = await page.evaluate(() => { const R = window.__R286; return R.length ? [R[0].st, R[R.length - 1].st, R[R.length - 1].ph] : null; }); if (s && s[1] - s[0] >= SEC) break; if (s && !/^hl_(intro|move|choose)$/.test(s[2]) && Date.now() - t0 > 3000) break; }
  R = await page.evaluate(() => { window.__R286_ON = 0; return window.__R286; });
  const tit = await page.evaluate(g => { try { const s = (window.__CPM_SITS && window.__CPM_SITS()[g]) || null; return s ? s.title : ''; } catch (_e) { return ''; } }, gi);
  return { ...analizza(R, !!process.env.CPM_TRACCIA), tit, glb: await page.evaluate(() => window.__CPM_GLB_READY === true) };
}
const tot = 191, passo = +(process.env.CPM_PASSO || 8);
const GI = process.env.CPM_GI ? process.env.CPM_GI.split(',').map(Number) : Array.from({ length: Math.ceil(tot / passo) }, (_, k) => k * passo);
let page = NUOVA ? null : await apri(); const out = [];
for (const gi of GI) {
  if (NUOVA) page = await apri();
  let o; try { o = await scena(page, gi); } catch (e) { o = { nonGiud: 'errore ' + String(e.message || e).slice(0, 80) }; }
  if (NUOVA) await page.close();
  out.push({ gi, ...o });
  console.log(o.nonGiud ? `  gi${gi}: NON GIUDICATO (${o.nonGiud})` : `  gi${gi}: portatore ${o.pi} (vicino al pallone ${Math.round(o.quota * 100)}%) · ${o.fot} fot in ${o.dur} s di scena (${o.fps}/s) · inversioni corpo ${o.inv} (${o.invS}/s, ampiezza max ${o.amp} u) · pallone ${o.invPall} · bersaglio ${o.invBers} · logico ${o.invLog} · strada ${o.strada} u, retta ${o.retta} u · escursione x ${o.escX} z ${o.escZ}${o.glb ? '' : ' · GLB NON PRONTO'}`);
}
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(out));
await b.close(); srv.close();
