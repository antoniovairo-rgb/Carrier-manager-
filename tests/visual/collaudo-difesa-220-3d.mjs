#!/usr/bin/env node
/* COLLAUDO 3D PO-220 «le chiusure difensive dell'eroe ancora non credibili» — SOLA MISURA (non modifica src/ ne' il gioco).
   GLB ACCESO (__CPM_GLB=true) + __CPM_PRESENT=1, pagina NUOVA per ogni scena/partita (lezione 7.483).
   Strumenti del gioco usati (gia' presenti): __CPM_REC_BUF (fotogramma per fotogramma: eroe h, pallone b, 22 mesh p), __CPM_TK220 (testimone del
   contatto: tC = istante in cui il gesto arriva a u=0,18), __CPM_CAST219 (portatore dichiarato dal motore), __CPM_OUTCOME / __CPM_RES218 (esito
   raccontato), __CPM_MP (squadre). TEMPO DI SCENA = somma dei dt tappati a 0,05 s fra due fotogrammi consecutivi (come il clock di scena del
   render-loop): mai un'attesa fissa. Unita' = unita' logiche del campo (0-100); 1 u ~ 1 m in lunghezza.
   MODE=flow  K=1,2,3 OGNI=8  → partite vere dal salvataggio S12 (autoplay seedato) con una scena difensiva ogni OGNI minuti (__CPM_DIF220_OGNI)
   MODE=forced GIS=31:0,32:1 | ALL  → scene SITUATIONS di tipo def forzate (+ __CPM_RESOLVE k) su pagina nuova
   OUT=file.jsonl FOTO=cartella. Analisi: ANALIZZA=file.jsonl rilegge le scene e riscrive la tabella. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';

const MODE = process.env.MODE || 'flow';
const OUT = process.env.OUT || null;
const FOTO = process.env.FOTO || null;
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const DTREAL = process.env.DTREAL === '1';          /* __CPM_DTREAL (src/12 ~3339, banco 819): il tempo di scena segue il tempo reale come sul telefono (dt tappato a 0,3 invece di 0,05) */
const DT_CAP = DTREAL ? 0.3 : 0.05;
/* famiglie delle SITUATIONS di tipo def (forzate): dove il bersaglio dell'eroe e' l'uomo col pallone o il pallone stesso */
const FAM = {}; for (const g of [31, 34, 54, 127, 128, 129, 131, 137, 138, 139, 146, 168, 183, 189, 190]) FAM[g] = 'portatore';
for (const g of [33, 45, 132, 157, 136]) FAM[g] = 'tiro-in-volo'; for (const g of [36, 44, 134]) FAM[g] = 'aereo'; for (const g of [32, 130, 155, 184]) FAM[g] = 'linea-passaggio'; for (const g of [35, 133, 135]) FAM[g] = 'rientro-copertura';

/* ───────── analisi di una scena (pura, rifacibile da file) ───────── */
const U = (wx, wz) => [wx + 50, wz / 0.68 + 50];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function analizza(sc) {
  const F = sc.frames; if (!F.length) return { id: sc.id, errore: 'nessun fotogramma' };
  const CAP = sc.dtCap || 0.05; let t = 0; const T = F.map((f, i) => { if (i) t += Math.min(CAP, Math.max(0, (f.t - F[i - 1].t) / 1000)); return t; });
  const team = sc.team || [];
  const pos = (f) => ({ hero: U(f.h[0], f.h[1]), ball: U(f.b[0], f.b[1]), p: f.p.map(q => U(q[0], q[1])) });
  const ci = F.findIndex(f => f.tc);                         // fotogramma del contatto dichiarato (u=0,18 del gesto)
  const ri = Math.max(0, F.findIndex(f => f.ph === 'hl_result'));
  if (ci < 0 && String(sc.id).startsWith('V-')) return { id: sc.id, gi: sc.gi, k: sc.k, lbl: sc.lbl || null, contatto: false, nFrame: F.length, durata: +T[F.length - 1].toFixed(2), coda: F[0].ph === 'hl_result' && F.length < 20, errore: (F[0].ph === 'hl_result' && F.length < 20) ? `coda della scena precedente (duplicato dello strumento: ${F.length} fotogrammi, ${(+T[F.length - 1].toFixed(2))} s)` : `gesto di contrasto mai arrivato a piena estensione in ${(+T[F.length - 1].toFixed(2))} s di scena (${F.length} fotogrammi)` };
  const ref = ci >= 0 ? ci : F.findIndex((f, i) => i >= ri && T[i] >= T[ri] + 1.0);
  const out = { id: sc.id, gi: sc.gi, k: sc.k, lbl: sc.lbl || null, contatto: ci >= 0, nFrame: F.length, durata: +T[F.length - 1].toFixed(2), troncata: !!sc.troncata };
  if (ref < 0) { out.errore = `non giudicabile: scena chiusa dopo ${F.length} fotogrammi (${out.durata} s di scena) senza contatto del gesto`; return out; }
  const P0 = pos(F[0]);
  /* portatore: dichiarato dal motore (flow) oppure l'avversario di movimento piu' vicino al pallone a inizio scena (forzate) */
  let car = sc.car;
  const at = (ts) => { let j = F.length - 1; for (let i = 0; i < F.length; i++) if (T[i] >= ts) { j = i; break; } return j; };
  const Pc = pos(F[ref]);
  if (car == null || car < 0) { let bd = 1e9; const Pr = pos(F[ri]); Pr.p.forEach((q, i) => { if (team[i] !== 'away' || (sc.gk && sc.gk[i])) return; const d = dist(q, Pr.ball); if (d < bd) { bd = d; car = i; } }); out.carDa = 'avversario-piu-vicino-al-pallone-all-esito'; } else out.carDa = 'motore';
  out.car = car; out.famSit = (sc.gi != null && FAM[sc.gi]) || null; out.fam = String(sc.id).startsWith('F-') ? 'forzata' : 'portatore';/* nelle forzate il portatore non e' dichiarato dal motore: il bersaglio misurato e' il PALLONE */
  out.dHeroPortC = +dist(Pc.hero, Pc.p[car]).toFixed(1);          // eroe-portatore al contatto
  out.dHeroPalC = +dist(Pc.hero, Pc.ball).toFixed(1);             // eroe-pallone al contatto
  out.dPortPalC = +dist(Pc.p[car], Pc.ball).toFixed(1);
  const g0 = at(T[ref] - 0.31); const Pg = pos(F[g0]);            // a inizio gesto (il contatto e' a 0,31 s: u=0,18 su 1,7 s)
  out.dHeroPortG0 = +dist(Pg.hero, Pg.p[car]).toFixed(1);
  out.dHeroPalG0 = +dist(Pg.hero, Pg.ball).toFixed(1);             // eroe-pallone quando il gesto PARTE: la spinta del tackle (src/12 ~7691) mira a questo punto
  out.palSpostG0C = +dist(Pg.ball, Pc.ball).toFixed(1);            // quanto si e' mosso il pallone fra l'avvio del gesto e il contatto (0,31 s)
  out.portSpostG0C = +dist(Pg.p[car], Pc.p[car]).toFixed(1);
  out.esitoCompleto = T[F.length - 1] >= T[ref] + 2.0;             // la scena dura almeno 2 s oltre il contatto (a ~7 fps la finestra reale si chiude prima)
  { const r0 = F.findIndex(f => f.ph === 'hl_result'); if (r0 >= 0) { const Pr = pos(F[r0]); out.dHeroPortRes = +dist(Pr.hero, Pr.p[car]).toFixed(1); out.tRisToContatto = +(T[ref] - T[r0]).toFixed(2);
      let path = 0; for (let i = r0 + 1; i <= ref; i++) path += dist(pos(F[i]).hero, pos(F[i - 1]).hero); out.vEroeAvvicinamento = T[ref] > T[r0] ? +(path / (T[ref] - T[r0])).toFixed(1) : null; } }
  out.dHeroPort0 = +dist(P0.hero, P0.p[car]).toFixed(1);          // a inizio scena
  /* finestra [-0,5 ; +2,5] s dal riferimento: minimi + compenetrazione (corpi sotto 0,6 u, pallone dentro il corpo sotto 0,35 u) */
  let minHP = 99, minHB = 99, minHA = 99, tArr = null, minHPt = null;
  for (let i = 0; i < F.length; i++) { const dt = T[i] - T[ref]; if (dt < -0.5 || dt > 2.5) continue; const P = pos(F[i]);
    const hp = dist(P.hero, P.p[car]), hb = dist(P.hero, P.ball); if (hp < minHP) { minHP = hp; minHPt = +dt.toFixed(2); } if (hb < minHB) minHB = hb;
    P.p.forEach((q, j) => { if (team[j] === 'away' && !(sc.gk && sc.gk[j])) minHA = Math.min(minHA, dist(P.hero, q)); });
    if (tArr == null && dt >= 0 && hb <= 2.0) tArr = dt; }
  out.minHeroPort = +minHP.toFixed(2); out.tMinHeroPort = minHPt; out.minHeroPal = +minHB.toFixed(2); out.minHeroAvv = +minHA.toFixed(2);
  out.ritardoPalla = tArr == null ? null : +tArr.toFixed(2);       // ritardo contatto -> pallone entro 2 u dall'eroe (null = non arriva in 2,5 s)
  out.compBody = minHA < 0.5; out.compPalla = minHB < 0.25;
  /* esito 3D: chi ha il pallone a +1 e +2 s, dove va */
  const own = (ts) => { const j = at(ts), P = pos(F[j]); let bd = dist(P.hero, P.ball), bw = 'eroe', bt = 'home';
    P.p.forEach((q, i) => { if (team[i] === 'ref') return; const d = dist(q, P.ball); if (d < bd) { bd = d; bw = (sc.gk && sc.gk[i] ? 'gk-' : '') + (team[i] === 'away' ? 'avv#' : 'nostro#') + i; bt = team[i]; } });
    let na = 99, nh = dist(P.hero, P.ball); P.p.forEach((q, i) => { if (team[i] === 'ref') return; const d = dist(q, P.ball); if (team[i] === 'away') na = Math.min(na, d); else nh = Math.min(nh, d); });
    return { chi: bd <= 3 ? bw : 'nessuno', team: bd <= 3 ? bt : null, d: +bd.toFixed(1), dNostri: +nh.toFixed(1), dLoro: +na.toFixed(1), x: +P.ball[0].toFixed(1), y: +P.ball[1].toFixed(1) }; };
  out.p1 = own(T[ref] + 1); out.p2 = own(T[ref] + 2);
  out.portVia = +dist(pos(F[at(T[ref] + 2)]).p[car], Pc.p[car]).toFixed(1);  // quanto si e' mosso il portatore in 2 s
  out.ballDx = +(out.p2.x - +Pc.ball[0].toFixed(1)).toFixed(1);               // il pallone avanza verso la porta avversaria (>0) o torna indietro (<0)
  out.ballSpost = +Math.hypot(out.p2.x - Pc.ball[0], out.p2.y - Pc.ball[1]).toFixed(1);
  out.ok = sc.ok; out.kind = sc.kind || null; out.outText = sc.outText || null; out.outKey = sc.outKey || null; out.gEff = sc.gEff || null; out.defGesto = sc.defGesto || null;
  /* coerenza raccontato <-> 3D a +2 s. riuscito: il pallone piu' vicino a un nostro che a un loro; fallito: piu' vicino a un loro. (stesso criterio di difesa-220-misura) */
  if (typeof sc.ok === 'boolean') { const nostro = out.p2.dNostri < out.p2.dLoro; out.coerente = sc.ok ? nostro : !nostro; out.coerente1 = sc.ok ? out.p1.dNostri < out.p1.dLoro : !(out.p1.dNostri < out.p1.dLoro);
    out.coerenteStretto = sc.ok ? (out.p2.team === 'home') : (out.p2.team === 'away'); }
  /* A: non arriva sull'uomo / arriva tardi / attraverso */
  const A = []; if (out.fam === 'portatore' && out.dHeroPortC > 3) A.push('lontano>3u'); if (out.dHeroPalC > 3) A.push('palla>3u');
  if (out.ritardoPalla == null) A.push(out.esitoCompleto ? 'palla-mai-entro2u' : 'palla-non-raggiunta(scena<2s)'); else if (out.ritardoPalla > 0.6) A.push('tardi>0,6s'); if (out.compBody) A.push('compenetra-corpo'); if (out.compPalla) A.push('compenetra-palla');
  if (!out.contatto) A.push('senza-gesto-contatto'); out.A = A;
  /* B: l'esito del riquadro contro chi ha il pallone nel 3D a +2 s (entro 3 u). FORTE = il pallone e' di chi il riquadro dice che NON dovrebbe averlo;
     INDETERMINATO = nessuno entro 3 u (pallone libero/fuori: ne' conferma ne' smentisce). Se la scena e' piu' corta di 2 s dal contatto vale l'ultimo fotogramma (esitoCompleto=false). */
  out.esito3D = out.p2.team === 'home' ? 'nostro' : out.p2.team === 'away' ? 'loro' : 'nessuno';
  out.Bforte = typeof sc.ok === 'boolean' && ((sc.ok && out.esito3D === 'loro') || (!sc.ok && out.esito3D === 'nostro'));
  out.Bindet = typeof sc.ok === 'boolean' && out.esito3D === 'nessuno';
  out.B = out.Bforte;
  const dPrim = out.fam === 'portatore' ? out.dHeroPortC : out.dHeroPalC;
  const grave = (dPrim > 6 || (out.ritardoPalla == null && out.esitoCompleto) || (out.B && dPrim > 3));
  out.gravita = (!A.length && !out.B) ? 'ok' : (grave || (out.B && A.length) ? 'alta' : (A.length >= 2 || dPrim > 3 || out.B ? 'media' : 'bassa'));
  return out;
}

if (process.env.ANALIZZA) {
  const R = fs.readFileSync(process.env.ANALIZZA, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s));
  for (const r of R) console.log(JSON.stringify(analizza(r)));
  process.exit(0);
}

/* ───────── hook in pagina: raccoglie i fotogrammi del registratore e marca il contatto ───────── */
const HOOK = () => {
  window.__MY_FR = [];
  const loop = () => { try {
    const d = window.__CPM_REC_DRAIN && window.__CPM_REC_DRAIN();
    if (d && d.length) { const W = window.__CPM_TK220 || []; const r = W.length ? W[W.length - 1] : null;
      for (const f of d) { const o = { t: f.t, ph: f.ph, ck: f.ck, sk: f.sk, h: f.h, b: f.b, p: f.p, ht: f.ht, lp: f.lp, aok: f.ok || undefined };
        if (window.__CPM_HERODRV769 && window.__CPM_HERODRV769ON) { const q = window.__CPM_HERODRV769; o.drv = [q.hxg, q.hyg, q.mx, q.mz, q.aDt, q.ph]; }
        if (r && r.tC != null && !r._seen) { r._seen = 1; o.tc = 1; o.tkI = W.length - 1; } window.__MY_FR.push(o); } }
  } catch (e) {} requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.__MY_DRAIN = () => { const a = window.__MY_FR; window.__MY_FR = []; return a; };
};

async function foto(page, tag) {
  if (!FOTO) return;
  try { const vp = page.viewportSize(); const box = await page.evaluate(v => { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); const x = Math.max(0, r.x), y = Math.max(0, r.y); return { x, y, width: Math.min(r.width, v.w - x), height: Math.min(r.height, v.h - y) }; }, { w: vp.width, h: vp.height });
    await page.screenshot({ path: path.join(FOTO, tag + '.jpg'), type: 'jpeg', quality: 72, timeout: 20000, ...(box && box.width > 10 ? { clip: box } : {}) }); } catch (e) { console.log('foto fallita', tag, String(e).slice(0, 80)); }
}

/* legge dalla pagina lo stato di contorno di una scena */
const contorno = (page) => page.evaluate(() => { const C = (window.__CPM_CAST219 || []).slice(-1)[0] || null; const mp = window.__CPM_MP ? window.__CPM_MP() : [];
  const W = window.__CPM_TK220 || []; const R = (window.__CPM_RES218 || []).slice(-1)[0] || null; const o = window.__CPM_OUTCOME || null;
  return { cast: C ? { tipo: C.tipo, hl: C.hl, min: C.min, port: C.port || null, eroe: C.eroe || null, dif: C.dif || null } : null, team: mp.map(q => q ? q.t : null), gk: mp.map(q => q ? !!q.gk : false), tk: W.length ? JSON.parse(JSON.stringify(W[W.length - 1])) : null, res: R,
    out: o ? { text: o.text || null, ok: o.ok, key: o.outKey || o.key || null, lbl: o.actionLabel || null } : null }; });

/* una scena = fotogrammi consecutivi con la stessa chiave in fase hl_*; la chiude il cambio di chiave/fase o il tetto di tempo di scena dopo il contatto */
async function seguiScena(page, id, meta, { maxReal = 45000, forcedStart = null } = {}) {
  const sc = { id, ...meta, dtCap: DT_CAP, frames: [], team: null, gk: null, car: null }; let fotoAvvio = !!forcedStart, fotoContatto = false, foto1 = false, tSc = 0, tCont = null, tRes = null, last = null; const t0 = Date.now();
  let pronto = false, stop = false, tkI = null;
  while (Date.now() - t0 < maxReal && !stop) {
    const fr = await page.evaluate(() => window.__MY_DRAIN());
    for (const f of fr) {
      const hl = /^hl_/.test(f.ph || '');
      if (!hl) { if (pronto && sc.frames.length > 4 && !forcedStart) { stop = true; sc.troncata = tCont != null && tSc - tCont < 2.5; } continue; }
      if (last && f.sk !== last.sk && pronto && !forcedStart) { stop = true; sc.troncata = tCont != null && tSc - tCont < 2.5; break; }
      if (last) tSc += Math.min(DT_CAP, Math.max(0, (f.t - last.t) / 1000)); last = f; sc.frames.push(f);
      if (!pronto) { pronto = true; const c = await contorno(page); sc.team = c.team; sc.gk = c.gk; sc.cast = c.cast; if (c.cast && c.cast.port) sc.car = c.cast.port.i; if (!fotoAvvio) { fotoAvvio = true; await foto(page, id + '-1avvio'); } }
      if (f.ph === 'hl_result' && tRes == null) tRes = tSc;
      if (f.tc && tCont == null) { tCont = tSc; tkI = f.tkI; fotoContatto = true; await foto(page, id + '-2contatto'); }
      if (tCont != null && !foto1 && tSc - tCont >= 1.0) { foto1 = true; await foto(page, id + '-3piu1s'); }
      if (tCont != null && tSc - tCont >= 2.6) { stop = true; break; }
      if (tCont == null && tRes != null && tSc - tRes >= 4.5) { stop = true; break; }       // nessun contatto del gesto: 4,5 s di risultato bastano
    }
    if (!stop) await sleep(90);
  }
  if (!foto1 && sc.frames.length) await foto(page, id + '-3piu1s');
  const c = await contorno(page); const tk = c.tk; if (tk) { sc.ok = tk.ok; sc.kind = tk.kind; sc.lbl = sc.lbl || tk.lbl; sc.gEff = tk.gEff || tk.g; sc.tk = tk; }
  if (c.res) { sc.defGesto = c.res.defGesto; if (typeof sc.ok !== 'boolean' && typeof c.res.ok === 'boolean') sc.ok = c.res.ok; sc.resKey = c.res.key; }
  if (c.out) { sc.outText = c.out.text; sc.outKey = c.out.key; if (typeof sc.ok !== 'boolean' && typeof c.out.ok === 'boolean') sc.ok = c.out.ok; }
  sc.realMs = Date.now() - t0; return sc;
}

const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port;
const INIT = ([extra]) => { if (extra && extra.dtr) window.__CPM_DTREAL = 1; window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TK220ON = 1; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; Object.assign(window, extra || {}); };
const save = fs.existsSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url))) : null;
const emit = (rec) => { if (OUT) fs.appendFileSync(OUT, JSON.stringify(rec) + '\n'); const a = analizza(rec); console.log(JSON.stringify({ id: a.id, dPort: a.dHeroPortC, dPal: a.dHeroPalC, rit: a.ritardoPalla, minHP: a.minHeroPort, comp: [a.compBody, a.compPalla], ok: a.ok, p1: a.p1 && a.p1.chi, p2: a.p2 && a.p2.chi, coer: a.coerente, A: a.A, grav: a.gravita, err: a.errore })); };

if (MODE === 'forced') {
  const S = loadSituations(); const defs = []; S.forEach((s, i) => { if (s.type === 'def') defs.push(i); });
  const spec = (process.env.GIS || 'ALL') === 'ALL' ? defs.map(g => `${g}:0`) : process.env.GIS.split(',');
  for (const sp of spec) { const [gi, k] = sp.split(':').map(Number);
    const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 412), height: +(process.env.VH || 915) } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const id = `F-gi${gi}-k${k}`; let rec;
    try { await page.addInitScript(INIT, [{ dtr: DTREAL }]); await page.addInitScript(HOOK);
      await openMatch(page, port, { name: 'D220 ' + gi + '-' + k }); await page.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
      await page.evaluate(() => { window.__MY_DRAIN(); });
      await page.evaluate(([g]) => window.__CPM_FORCE_SIT(g, true), [gi]); await sleep(+(process.env.SETTLE || 2500));
      const lbl = S[gi].actions[k] && S[gi].actions[k].label;
      rec = await (async () => { const p = seguiScenaForzata(page, id, { gi, k, lbl }); return p; })();
    } catch (e) { rec = { id, gi, k, frames: [], errore: String(e).slice(0, 200) }; }
    emit(rec); await ctx.close(); }
} else {
  const KS = (process.env.K || '1,2,3').split(',').map(Number); const OGNI = +(process.env.OGNI || 8);
  for (const kk of KS) { const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 412), height: +(process.env.VH || 915) } }); const page = await ctx.newPage(); await installCdnRoutes(page); const t0 = Date.now();
    try { const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' D220G-' + kk;
      await page.addInitScript(([s, ogni, dtr, drv]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TK220ON = 1; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; window.__CPM_DIF220_OGNI = ogni; if (drv) window.__CPM_HERODRV769ON = 1; if (dtr) window.__CPM_DTREAL = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, OGNI, DTREAL, process.env.DRV === '1']);
      await page.addInitScript(HOOK);
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), kk);
      const LIM = +(process.env.MAXSEC || 900) * 1000; let n = 0;
      while (Date.now() - t0 < LIM) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break;
        if (/^hl_/.test(ph || '')) { const c = await contorno(page);
          if (c.cast && c.cast.tipo === 'difesa') { const sc = await seguiScena(page, `V-k${kk}-s${++n}`, { gi: c.cast.hl, k: kk }); emit(sc); continue; }
          else { await page.evaluate(() => window.__MY_DRAIN()); await sleep(250); continue; } }
        await page.evaluate(() => window.__MY_DRAIN()); await sleep(250); }
      console.log(`k${kk}: ${n} scene difensive in ${Math.round((Date.now() - t0) / 1000)}s`);
    } catch (e) { console.log('ERR k' + kk, String(e).slice(0, 200)); }
    await ctx.close(); }
}
await b.close(); srv.close();

/* scena forzata: si risolve l'azione k e si segue il flusso */
async function seguiScenaForzata(page, id, meta) {
  const pre = await contorno(page); await foto(page, id + '-1avvio');
  await page.evaluate(() => window.__MY_DRAIN());
  await page.evaluate(([k]) => window.__CPM_RESOLVE(k), [meta.k]);
  const sc = await seguiScena(page, id, meta, { forcedStart: true, maxReal: 40000 });
  if (!sc.team || !sc.team.length) { sc.team = pre.team; sc.gk = pre.gk; }
  return sc;
}
