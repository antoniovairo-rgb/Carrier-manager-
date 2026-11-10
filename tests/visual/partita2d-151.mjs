#!/usr/bin/env node
/* [giro 151 PO-353/PO-354 guardiano — foto PO docs/collaudo-po/188-partita2d-scie.png (ramo poc/marioprada-character-system),
   partita 2D su PC: «troppe traiettorie di passaggio durante la partita 2D, lasciano troppa scia» e la cronaca «Tedesco (SIC) a tu per tu
   col portiere, conclude di prima!» col pallone a centrocampo].
   Partite VERE (provino, autoplay seminato, velocita' 2x) col testimone __CPM_W151 armato, a 360x800 (tocco) e 1440x900 (mouse).
   S) SCIA (decisione PO-353: corta e sottile, sparisce in meno di mezzo secondo, solo mentre il pallone viaggia). Per ogni fotogramma
      del Campo2D il testimone dice: eta' della scia in TEMPO DI SCENA (somma dei dt del disegno, quindi non dipende dagli fps), lunghezza
      in pixel CSS, lunghezza della tratteggiata verso il bersaglio, stato del pallone. Criteri: eta' massima < SOGLIA_ETA (0,5 s, parola
      del PO); nessun fotogramma con scia disegnata e pallone NON in volo; nessuna tratteggiata; almeno MIN_VOLO fotogrammi in volo con
      la scia (altrimenti «non giudicato» = rosso).
   C) CRONACA (PO-354): per ogni riga del motore che racconta un fatto di ZONA (tiro e cross: i soli che portano il proprio luogo) si misura
      la distanza in METRI fra il pallone del MOTORE nell'istante in cui la riga esce e il luogo del fatto (segmento from→to dichiarato
      dalla riga); «lontano» = oltre DIST_M metri. Si giudica il pallone del motore perche' il Campo2D lo disegna nel fotogramma dopo
      (richiamo 62 ms, riaggancio oltre 22 punti): in headless pero' il Campo2D gira a 3-5 fps e fra due fotogrammi il motore compie
      fino a 8 sotto-tick, quindi il pallone RESO del primo fotogramma dopo la riga e' dichiarato accanto (con prima/dopo: quanto prima
      era ancora li', quanto dopo ci arriva) ma non giudicato — misura lo scheduler della sonda. Criterio: quota di righe di zona
      lontane <= SOGLIA_C, su almeno MIN_RIGHE righe (sotto = non giudicato = rosso).
   ROSSO: CPM_PROVA_ROSSO=1 rigira con __CPM_NO_G151S (la scia di prima) e pretende che S cada; con __CPM_NO_G151C (se il giro corregge
   la cronaca) pretende che C cada. Verde e rossi stampati per ultimi. CPM_FOTO_151=<cartella> salva le foto. Non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const FORMATI = { t360: { w: 360, h: 800, touch: true }, pc: { w: 1440, h: 900, touch: false } };
const NOMI = (process.env.CPM_NOMI151 || 'Rossi,Bianchi').split(',');
const FIN = +(process.env.CPM_FIN151 || 75000);
const SOGLIA_ETA = 0.5, MIN_VOLO = 20, DIST_M = +(process.env.CPM_DIST151 || 15), MIN_RIGHE = 8;
/* SOGLIA_C fissata DOPO la misura (giro 151, 8 partite vere): verde 0/30 righe di zona col pallone del motore lontano, rosso
   __CPM_NO_G151C 24/53 (45%). 10% sta lontano da entrambi. Non si abbassa. */
const SOGLIA_C = 0.10;
/* solo i fatti che portano il PROPRIO luogo (from/to del motore): parata, palo, murato e rigore nella riga prendono from dall'arco
   corrente, che non e' il luogo del fatto — misurarli darebbe numeri dello strumento */
const ZONA = new Set(['tiro', 'cross']);
const ROSSO = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO_151 || '';
const CON_C = !process.env.CPM_SOLO_S151;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function partita(fk, nome, sw) {
  const f = FORMATI[fk]; const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_W151 = {}; for (const k of o) window[k] = true; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, sw);
  let out = { fk, nome, sw: sw.join('+') || 'verde' };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: nome });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 15101, policy: 'seeded', tickMs: 350 }));
    const t0 = Date.now(); let foto = false;
    while (Date.now() - t0 < FIN) {
      await sleep(2500);
      const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'ended') break;
      if (FOTO && !foto && ph === 'playing') { const v = await page.evaluate(() => (window.__CPM_W151 || {}).volo); if (v) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${sw.includes('__CPM_NO_G151S') ? 'prima' : sw.length ? 'rossoC' : 'dopo'}-${fk}-${nome}.png` }); foto = true; } }
    }
    const w = await page.evaluate(() => { const w = window.__CPM_W151 || {}; return { rec: w.rec || [], righe: w.righe || [], vw: w.vw, lw: w.lw, vecchi: w.vecchi | 0 }; });
    out = { ...out, ...w, min: w.righe.length ? w.righe[w.righe.length - 1].m : null };
  } catch (e) { out.ko = 'eccezione: ' + String(e && e.message || e).slice(0, 160); }
  if (errs.length) out.ko = (out.ko || '') + ' pageerror: ' + errs.slice(0, 2).join(' | ');
  await ctx.close(); return out;
}
const M = (a, b) => Math.hypot((a[0] - b[0]) * 1.05, (a[1] - b[1]) * 0.68);
const dSeg = (p, a, c) => { if (!c) return M(p, a); const ax = a[0] * 1.05, ay = a[1] * 0.68, cx = c[0] * 1.05, cy = c[1] * 0.68, px = p[0] * 1.05, py = p[1] * 0.68; const dx = cx - ax, dy = cy - ay, L = dx * dx + dy * dy; let u = L > 0 ? ((px - ax) * dx + (py - ay) * dy) / L : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(px - (ax + u * dx), py - (ay + u * dy)); };
function misura(p) {
  if (p.ko) return { ko: p.ko };
  const R = p.rec; /* [ts, volo, scia, eta, px, tratt, bx, by, ora] */
  const conScia = R.filter(r => r[2] > 1);
  const etaS = conScia.map(r => r[3]).sort((a, c) => a - c), pxS = conScia.map(r => r[4]).sort((a, c) => a - c);
  const q = (A, k) => A.length ? A[Math.min(A.length - 1, Math.floor(A.length * k))] : null;
  const S = { fot: R.length, volo: R.filter(r => r[1]).length, conScia: conScia.length, voloScia: conScia.filter(r => r[1]).length,
    ferme: conScia.filter(r => !r[1]).length, etaMax: etaS.length ? etaS[etaS.length - 1] : null, etaP50: q(etaS, 0.5), etaP95: q(etaS, 0.95),
    pxMax: pxS.length ? pxS[pxS.length - 1] : null, pxP50: q(pxS, 0.5), pxP95: q(pxS, 0.95), tratt: R.filter(r => r[5] > 0).length,
    trattMax: R.reduce((m, r) => Math.max(m, r[5]), 0), insieme: R.reduce((m, r) => Math.max(m, (r[2] > 1 ? 1 : 0) + (r[5] > 0 ? 1 : 0)), 0), lw: p.lw, vw: p.vw };
  /* cronaca: il fotogramma piu' vicino all'uscita della riga */
  const righe = [];
  for (const g of p.righe) {
    if (!ZONA.has(g.kind) || !g.from) continue;
    const A = [g.from.x, g.from.y], C = g.to ? [g.to.x, g.to.y] : null;
    /* il primo fotogramma DOPO l'uscita della riga (quello prima mostra il pallone di un passo fa) */
    let j = -1, best = 1e9; for (let i = 0; i < R.length; i++) if (R[i][8] >= g.t) { j = i; best = R[i][8] - g.t; break; }
    if (!g.palla) { righe.push({ ...g, nonGiud: 1 }); continue; }
    if (j < 0 || best > 400 || R[j][6] < 0) j = -1;
    const dM = dSeg(g.palla, A, C);
    if (j < 0) { righe.push({ m: g.m, kind: g.kind, kp: g.kp, txt: g.txt, d: null, dMot: +dM.toFixed(1), lontano: dM > DIST_M ? 1 : 0, lontano2d: null, from: A, to: C, palla: g.palla, stato: g.stato }); continue; }
    const d0 = dSeg([R[j][6], R[j][7]], A, C);
    let prima = null, dopo = null;
    for (let i = j; i >= 0 && R[j][8] - R[i][8] <= 8000; i--) if (R[i][6] >= 0 && dSeg([R[i][6], R[i][7]], A, C) <= DIST_M) { prima = R[j][8] - R[i][8]; break; }
    for (let i = j; i < R.length && R[i][8] - R[j][8] <= 8000; i++) if (R[i][6] >= 0 && dSeg([R[i][6], R[i][7]], A, C) <= DIST_M) { dopo = R[i][8] - R[j][8]; break; }
    righe.push({ m: g.m, kind: g.kind, kp: g.kp, txt: g.txt, d: +d0.toFixed(1), dMot: dM == null ? null : +dM.toFixed(1), lontano: (dM != null && dM > DIST_M) ? 1 : 0, lontano2d: d0 > DIST_M ? 1 : 0, intorno: d0 > DIST_M ? R.filter(r => Math.abs(r[8] - g.t) < 1500).map(r => [r[8] - g.t, r[1], r[6], r[7], r[9], r[10]]) : undefined, prima, dopo, from: A, to: C, b2d: [R[j][6], R[j][7]], palla: g.palla, stato: g.stato });
  }
  const giud = righe.filter(r => !r.nonGiud);
  const fps = R.length > 1 ? +(R.length / ((R[R.length - 1][8] - R[0][8]) / 1000)).toFixed(1) : null;
  return { S: { ...S, fps }, righe, C: { n: giud.length, lontane: giud.filter(r => r.lontano).length, lontane2d: giud.filter(r => r.lontano2d).length, giud2d: giud.filter(r => r.lontano2d != null).length, nonGiud: righe.length - giud.length, tutte: p.righe.length, vecchi: p.vecchi | 0 } };
}
async function giro(sw) { const out = []; for (const fk of Object.keys(FORMATI)) for (const nome of NOMI) { const p = await partita(fk, nome, sw); const m = misura(p); out.push({ fk, nome, min: p.min, ...m }); } return out; }
const giudicaS = m => { if (m.ko) return [m.ko]; const S = m.S, k = [];
  if (S.voloScia < MIN_VOLO) k.push(`S fotogrammi in volo con la scia ${S.voloScia} < ${MIN_VOLO} (non giudicato)`);
  if (S.etaMax != null && S.etaMax >= SOGLIA_ETA) k.push(`S eta' massima della scia ${S.etaMax.toFixed(2)} s >= ${SOGLIA_ETA} s`);
  if (S.ferme) k.push(`S ${S.ferme} fotogrammi con la scia disegnata e il pallone non in volo`);
  if (S.tratt) k.push(`S ${S.tratt} fotogrammi con la tratteggiata verso il bersaglio (max ${S.trattMax} px)`);
  return k; };
const giudicaC = (r) => { const n = r.reduce((s, m) => s + (m.C ? m.C.n : 0), 0), l = r.reduce((s, m) => s + (m.C ? m.C.lontane : 0), 0); const k = [];
  if (n < MIN_RIGHE) k.push(`C righe di zona giudicate ${n} < ${MIN_RIGHE} (non giudicato)`);
  else if (SOGLIA_C != null && l / n > SOGLIA_C) k.push(`C righe di zona col pallone lontano ${l}/${n} = ${(100 * l / n).toFixed(0)}% > ${(SOGLIA_C * 100).toFixed(0)}%`);
  return { k, n, l }; };
const stampa = (r, tag) => { for (const m of r) { if (m.ko) { console.log(tag, m.fk, m.nome, m.ko); continue; } const S = m.S;
  console.log(`${tag} ${m.fk.padEnd(4)} ${m.nome.padEnd(8)} min ${m.min} | fotogrammi ${S.fot} volo ${S.volo} | scia: ${S.conScia} fot (in volo ${S.voloScia}, FERMA ${S.ferme}) eta' p50 ${S.etaP50} p95 ${S.etaP95} max ${S.etaMax} s · ${S.pxP50}/${S.pxP95}/${S.pxMax} px · spessore ${S.lw} px | tratteggiata ${S.tratt} fot max ${S.trattMax} px | insieme ${S.insieme} | fps ${S.fps} | cronaca zona: pallone del motore lontano ${m.C.lontane}/${m.C.n} (reso nel fotogramma dopo ${m.C.lontane2d}/${m.C.giud2d}, non giud ${m.C.nonGiud}, righe motore ${m.C.tutte}, fatti scesi in coda ${m.C.vecchi}) | ${giudicaS(m).join(' · ') || 'S OK'}`);
  for (const x of m.righe.filter(x => x.lontano)) console.log(`   ${tag} lontana ${x.m}' ${x.kind}/${x.kp} motore ${x.dMot} m (reso ${x.d}) prima ${x.prima} ms dopo ${x.dopo} ms stato ${x.stato} from ${x.from} to ${x.to} b2d ${x.b2d} palla ${x.palla} «${x.txt}»`); } };
const verde = await giro([]);
let rS = null, rC = null;
if (ROSSO) { rS = await giro(['__CPM_NO_G151S']); if (CON_C) rC = await giro(['__CPM_NO_G151C']); }
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/partita2d-151.json', import.meta.url), JSON.stringify({ verde, rS, rC }, null, 1));
/* verde e rossi stampati per ultimi */
let esito = 0;
if (ROSSO) { stampa(rS, 'ROSSO-S'); if (rC) stampa(rC, 'ROSSO-C'); }
stampa(verde, 'VERDE');
const kv = verde.filter(m => giudicaS(m).length), cv = giudicaC(verde);
if (kv.length || cv.k.length || verde.length < Object.keys(FORMATI).length * NOMI.length) { console.log(`❌ verde: scia fuori criterio in ${kv.length}/${verde.length} partite${cv.k.length ? ' · ' + cv.k.join(' · ') : ''}`); esito = 1; }
else console.log(`✅ verde: scia sotto ${SOGLIA_ETA} s, mai ferma, nessuna tratteggiata in ${verde.length} partite · cronaca di zona col pallone lontano ${cv.l}/${cv.n}${SOGLIA_C != null ? ` <= ${(SOGLIA_C * 100).toFixed(0)}%` : ' (soglia non fissata)'}`);
if (ROSSO) {
  const cs = rS.filter(m => giudicaS(m).some(t => /eta'|ferma|tratteggiata/.test(t))).length;
  if (cs !== rS.length) { console.log(`❌ rosso S: con __CPM_NO_G151S cadono ${cs}/${rS.length} partite — il guardiano non vede la scia di prima`); esito = 1; }
  else console.log(`✅ rosso S: __CPM_NO_G151S cade su ${cs}/${rS.length} partite`);
  if (rC) { const cc = giudicaC(rC); if (!cc.k.length || cc.k.some(t => /non giudicato/.test(t))) { console.log(`❌ rosso C: con __CPM_NO_G151C righe lontane ${cc.l}/${cc.n} — il guardiano non vede la cronaca di prima${cc.k.length ? ' · ' + cc.k.join(' · ') : ''}`); esito = 1; }
    else console.log(`✅ rosso C: __CPM_NO_G151C cade · ${cc.k.join(' · ')}`); }
}
srv.close(); await b.close(); process.exit(esito);
