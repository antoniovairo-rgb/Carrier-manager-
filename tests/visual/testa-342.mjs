#!/usr/bin/env node
/* [giro 342 PO-629 «le azioni da colpi testa vanno riviste, non c'e' il sincronismo ed il movimento non e' naturale» · «era un cross» ·
   «in generale tutti i colpi di testa non sono ben congeniati»]
   CENSIMENTO E GUARDIANO DI TUTTA LA FAMIGLIA DEI COLPI DI TESTA. GLB acceso (direttiva PO 29/07), una pagina nuova per scena (7.483),
   teatro acceso (__CPM_PRESENT + __CPM_CINE), testimone __CPM_G342W (src/12: una riga per fotogramma in hl_result).
   Due orologi:  --passo=60   il tempo di scena avanza di 1/60 s per fotogramma (aritmetica del telefono, «al rallentatore» sul banco)
                 --passo=reale il tempo di scena segue quello vero (sul banco 3-4 fotogrammi al secondo: 0,26-0,30 s a fotogramma,
                               15-20 fotogrammi per scena — MISURATO: verde e rosso ugualmente fuori, la grandezza qui non si misura)
                 --passo=nativo il passo del gioco senza ganci (morsetto 0,05 s a fotogramma: un telefono a 20 fps)
   Modi:   node testa-342.mjs                    censimento di tutte le azioni di testa (riuscite e fallite) → out/giro342/<etichetta>.json
           node testa-342.mjs --guardiano        scene fisse per tipo, soglie qui sotto, uscita 0/1
           CPM_ROSSO=__CPM_NO_G342 …             braccio rosso (comportamento di prima del giro 342): il guardiano DEVE uscire 0 solo
                                                 se le soglie cadono (verde col verde, rosso col rosso)
           --foto                                salva i fotogrammi attorno al contatto (per il PO)
   GRANDEZZE (tempo di SCENA, mai di parete):
     contatto  = fotogramma in cui parte l'arco del colpo (il pallone lascia la testa)
     dCont     = distanza osso-della-testa ↔ pallone al contatto (u; 1 u ≈ 1 m)
     scPicco   = t(massima quota della testa, entro ±1 s, esultanza esclusa) − t(contatto)   (negativo = stacca prima)
     scQuota   = t(contatto) − t(il pallone, scendendo, attraversa la quota che la testa ha al contatto) : ≈0 se arriva in volo
     vArr      = velocita' del pallone nei 0,15 s prima del contatto (u/s di scena): un cross vola, non galleggia
     fase      = tempo della clip al contatto / durata (dove sta il corpo nel gesto quando colpisce)
     scClip    = (tempo della clip al contatto − 0,79 s) / scala: di quanti secondi di SCENA il pallone arriva prima (−) o dopo (+) la frustata
                 della testa nella clip `header` (picco di velocita' in avanti della testa a 0,79 s nativi, misurato con __CPM_CLIP342)
     peso      = peso del gesto al contatto (0..1: sotto 0,6 il corpo sta ancora correndo)
     scivolo   = strada fatta in pianta da un piede a terra mentre il gesto di testa e' montato (peso >= 0,3) (u);
                 scivoloTot = lo stesso su tutta la finestra ±1,2 s (comprende la corsa, solo stampato)
     scatto    = massimo spostamento della testa fra due fotogrammi consecutivi, in u/s di scena (un corpo non fa 14 u/s con la testa)
     giro      = massima velocita' di rotazione del corpo (gradi/s di scena)
     salto     = quota massima del corpo sopra l'erba (u) · atterr = velocita' verticale all'atterraggio (u/s)
   SOGLIE DEL GUARDIANO — scritte PRIMA della correzione, sulla misura della base (rapporto giro 342 §2) e mai abbassate:
     dCont   <= 0,45 u      (raggio del pallone 0,20 + mezza testa 0,12 + margine: «la testa tocca il pallone»)
     |scPicco| <= 0,15 s    (la soglia storica di testa-tempismo, 7.999.33)
     |scClip|  <= 0,08 s    (5 fotogrammi a 60 fps: la frustata della testa coincide col pallone)
     peso    >= 0,60        (il gesto di testa e' il corpo che si vede al contatto)
     scatto  <= 14 u/s      (testa: corsa 7-8 u/s + frustata; oltre e' un teletrasporto)
     scivolo <= 0,60 u      (un piede a terra non pattina per piu' di mezzo metro nell'azione)
   «non giudicato» (testimone vuoto, contatto non trovato) = ROSSO. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';

const ARG = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : null; };
const HAS = k => process.argv.includes('--' + k);
const GUARD = HAS('guardiano'), FOTO = HAS('foto');
const PASSO = ARG('passo') || process.env.CPM_PASSO || '60';
const ROSSO = process.env.CPM_ROSSO || '';
const ETI = ARG('eti') || process.env.CPM_ETI || (ROSSO ? 'rosso' : 'verde');
const PAR = +(ARG('par') || process.env.CPM_PAR || 3);
const OUT = path.join(__dirname, '..', 'out', 'giro342'); fs.mkdirSync(OUT, { recursive: true });

/* tutte le azioni di testa delle SITUATIONS (enumerate dal gioco il 23/11: deriveHL(...).type==='header'), col tipo per il rapporto */
export const TUTTE = [
  [7, 0, 'cross'], [55, 0, 'cross'], [86, 0, 'cross'], [90, 0, 'cross'], [90, 1, 'cross'], [88, 1, 'cross'], [41, 1, 'cross'], [159, 1, 'cross'], [64, 0, 'cross'], [64, 1, 'cross'], [171, 1, 'cross'],
  [6, 0, 'angolo'], [76, 2, 'angolo'],
  [171, 0, 'tuffo'],
  [36, 0, 'difensivo'], [44, 0, 'difensivo'], [134, 0, 'difensivo'], [126, 1, 'difensivo'],
  [64, 2, 'sponda'], [90, 2, 'sponda'], [108, 0, 'sponda'], [108, 1, 'sponda'], [124, 0, 'sponda'], [126, 0, 'sponda'],
  [48, 1, 'rimbalzo'], [53, 1, 'rimbalzo'], [1, 1, 'rimbalzo'], [103, 1, 'rimbalzo'], [52, 0, 'lancio'],
];
/* scene del guardiano: almeno una per tipo, le stesse nei due bracci */
export const GUARDIA = [[7, 0, 'cross'], [86, 0, 'cross'], [90, 0, 'cross'], [6, 0, 'angolo'], [76, 2, 'angolo'], [171, 0, 'tuffo'], [44, 0, 'difensivo'], [134, 0, 'difensivo'], [108, 0, 'sponda'], [48, 1, 'rimbalzo'], [52, 0, 'lancio']];
export const SOGLIE = { dCont: 0.45, scPicco: 0.15, scClip: 0.08, peso: 0.60, scatto: 14, scivolo: 0.60 };

/* colonne del testimone */
const C = { t: 0, tr: 1, hx: 2, hy: 3, hz: 4, bx: 5, by: 6, bz: 7, px: 8, py: 9, pz: 10, ry: 11, kx: 12, ky: 13, kz: 14, lx: 15, ly: 16, lz: 17, rx: 18, rY: 19, rz: 20, g: 21, ct: 22, ts: 23, gw: 24, act: 25, at: 26, arc: 27, arcT: 28, ws: 29, dt: 30 };
const r2 = x => (x == null || !isFinite(x)) ? null : +(+x).toFixed(2);

export function analizza(W) {
  if (!W || !W.f || W.f.length < 12) return { err: 'testimone vuoto', n: W && W.f ? W.f.length : 0 };
  const F = W.f, n = F.length, d = i => Math.hypot(F[i][C.bx] - F[i][C.hx], F[i][C.by] - F[i][C.hy], F[i][C.bz] - F[i][C.hz]);
  /* contatto: l'arco parte (arcT da <=0 a >0) col gesto di testa montato o entro 0,6 u dalla testa; ripiego: minimo testa-pallone */
  let im = 0; for (let i = 1; i < n; i++) if (d(i) < d(im)) im = i;
  let ic = -1; const cand = [];
  for (let i = 1; i < n; i++) if (F[i][C.arc] && F[i][C.arcT] > 0 && (!F[i - 1][C.arc] || F[i - 1][C.arcT] <= 0)) cand.push(i);
  if (cand.length) { ic = cand[0]; for (const i of cand) if (Math.abs(F[i][C.t] - F[im][C.t]) < Math.abs(F[ic][C.t] - F[im][C.t])) ic = i; }
  const comeMin = ic < 0; if (ic < 0) ic = im;
  const tc = F[ic][C.t];
  /* al fotogramma del lancio il pallone e' ancora sull'origine dell'arco (u=0): la distanza si legge li' */
  const dCont = d(ic), hC = F[ic][C.hy];
  const h0 = Math.min(...F.slice(0, Math.min(8, n)).map(x => x[C.hy]));
  /* picco: entro ±1 s dal contatto, mai dentro l'esultanza: ci si ferma al primo fotogramma, dopo il contatto, in cui il gesto non e' piu'
     quello di testa (MISURATO: col solo filtro sulla clip 'lift' il salto dell'esultanza a +1 s veniva preso per lo stacco, gi108) */
  let iEnd = n - 1; for (let i = ic + 1; i < n; i++) if (F[i][C.g] !== 'header' && F[i][C.act] !== 'header') { iEnd = i; break; }
  let ip = ic; for (let i = 0; i <= iEnd; i++) if (Math.abs(F[i][C.t] - tc) <= 1 && F[i][C.g] !== 'lift' && F[i][C.hy] > F[ip][C.hy]) ip = i;
  /* il pallone attraversa (scendendo o salendo) la quota della testa al contatto: ultimo attraversamento prima del contatto */
  let iq = -1; for (let i = ic; i > 0; i--) { const a = F[i - 1][C.by] - hC, b = F[i][C.by] - hC; if (a * b <= 0 && Math.abs(a - b) > 1e-4) { iq = i; break; } }
  /* velocita' d'arrivo del pallone (ultimi 0,15 s) e sua minima nell'ultimo mezzo secondo (un pallone che galleggia) */
  const vB = (i) => { const dt = F[i][C.t] - F[i - 1][C.t]; return dt > 1e-5 ? Math.hypot(F[i][C.bx] - F[i - 1][C.bx], F[i][C.by] - F[i - 1][C.by], F[i][C.bz] - F[i - 1][C.bz]) / dt : 0; };
  let sA = 0, nA = 0, vMin = 1e9, vMaxPre = 0; for (let i = 1; i <= ic; i++) { const dtc = tc - F[i][C.t]; const v = vB(i); if (dtc <= 0.15) { sA += v; nA++; } if (dtc <= 0.5) { vMin = Math.min(vMin, v); } if (dtc <= 1.2) vMaxPre = Math.max(vMaxPre, v); }
  /* corpo */
  let scatto = 0, tScatto = null, giro = 0, salto = 0, vCorsa = 0, nC = 0;
  for (let i = 1; i < n; i++) { const dt = F[i][C.t] - F[i - 1][C.t]; if (dt < 1e-5) continue; const rel = F[i][C.t] - tc; if (rel < -1.2 || rel > 1.2) continue;
    const v = Math.hypot(F[i][C.hx] - F[i - 1][C.hx], F[i][C.hy] - F[i - 1][C.hy], F[i][C.hz] - F[i - 1][C.hz]) / dt; if (v > scatto) { scatto = v; tScatto = rel; }
    let dr = Math.abs(F[i][C.ry] - F[i - 1][C.ry]) % (2 * Math.PI); if (dr > Math.PI) dr = 2 * Math.PI - dr; giro = Math.max(giro, dr * 180 / Math.PI / dt);
    salto = Math.max(salto, F[i][C.py]);
    if (rel >= -0.7 && rel <= -0.2) { vCorsa += Math.hypot(F[i][C.px] - F[i - 1][C.px], F[i][C.pz] - F[i - 1][C.pz]) / dt; nC++; } }
  /* piedi: a terra = entro 0,07 u dalla quota minima di quel piede nella finestra; scivolo = strada in pianta fatta mentre e' a terra */
  const piede = (X, Y, Z) => { let g = 1e9; for (let i = 0; i < n; i++) if (Math.abs(F[i][C.t] - tc) <= 1.2) g = Math.min(g, F[i][Y]); let s = 0, sg = 0, vm = 0, su = null, giu = null;
    for (let i = 1; i < n; i++) { const rel = F[i][C.t] - tc; if (Math.abs(rel) > 1.2) continue; const a = F[i - 1][Y] - g < 0.07, b = F[i][Y] - g < 0.07; const dt = F[i][C.t] - F[i - 1][C.t];
      if (a && b && dt > 1e-5) { const st = Math.hypot(F[i][X] - F[i - 1][X], F[i][Z] - F[i - 1][Z]); s += st; vm = Math.max(vm, st / dt); if (F[i][C.g] === 'header' && F[i][C.gw] >= 0.3) sg += st; }
      if (a && !b && rel <= 0.05) su = rel; if (!a && b && rel > 0 && giu == null) giu = rel; }
    return { s, sg, vm, su, giu }; };
  const pl = piede(C.lx, C.ly, C.lz), pr = piede(C.rx, C.rY, C.rz);
  /* atterraggio: velocita' verticale del corpo nell'ultimo fotogramma in aria dopo il picco */
  let atterr = 0, tTerra = null; for (let i = Math.max(1, ip); i < n; i++) { if (F[i - 1][C.py] > 0.02 && F[i][C.py] <= 0.02) { const dt = F[i][C.t] - F[i - 1][C.t]; atterr = dt > 0 ? (F[i - 1][C.py] - F[i][C.py]) / dt : 0; tTerra = F[i][C.t] - tc; break; } }
  /* busto: inclinazione bacino→testa dalla verticale al contatto (gradi) */
  const busto = Math.atan2(Math.hypot(F[ic][C.hx] - F[ic][C.kx], F[ic][C.hz] - F[ic][C.kz]), Math.max(0.01, F[ic][C.hy] - F[ic][C.ky])) * 180 / Math.PI;
  const dur = (W.m && W.m.dur) || 0;
  return { n, comeMin, tc: r2(tc), dCont: r2(dCont), dMin: r2(d(im)), tMin: r2(F[im][C.t] - tc), scPicco: r2(F[ip][C.t] - tc), scQuota: iq < 0 ? null : r2(tc - F[iq][C.t]),
    qPalla: r2(F[ic][C.by]), qTesta: r2(hC), vArr: r2(nA ? sA / nA : 0), vMin: r2(vMin > 1e8 ? 0 : vMin), vMaxPre: r2(vMaxPre),
    scClip: (F[ic][C.g] === 'header' && F[ic][C.ct] >= 0 && F[ic][C.ts] > 0) ? r2((F[ic][C.ct] - 0.79) / F[ic][C.ts]) : null,
    gesto: F[ic][C.g], fase: dur > 0 && F[ic][C.ct] >= 0 ? r2(F[ic][C.ct] / dur) : null, ts: r2(F[ic][C.ts]), peso: r2(F[ic][C.gw]), actT: r2(F[ic][C.at]),
    salto: r2(salto), saltoTesta: r2(F[ip][C.hy] - h0), atterr: r2(atterr), tTerra: r2(tTerra), vCorsa: r2(nC ? vCorsa / nC : 0), scatto: r2(scatto), tScatto: r2(tScatto), giro: Math.round(giro),
    scivolo: r2(Math.max(pl.sg, pr.sg)), scivoloTot: r2(Math.max(pl.s, pr.s)), vScivolo: r2(Math.max(pl.vm, pr.vm)), staccoSx: r2(pl.su), staccoDx: r2(pr.su), busto: Math.round(busto), clip: W.m && W.m.clip || null, vr: W.m && W.m.vr || null, kind: W.m && W.m.kind || null, chi: W.m ? W.m.chi : null };
}

export function giudica(r) {
  const m = []; if (!r || r.err) return ['non giudicato (' + ((r && r.err) || 'nessun dato') + ')'];
  if (r.comeMin) m.push('non giudicato (l\'arco del colpo non e\' mai partito)');
  if (!(r.dCont <= SOGLIE.dCont)) m.push(`testa-pallone al contatto ${r.dCont} u > ${SOGLIE.dCont}`);
  if (!(Math.abs(r.scPicco) <= SOGLIE.scPicco)) m.push(`picco dello stacco a ${r.scPicco} s dal contatto (oltre ±${SOGLIE.scPicco})`);
  if (!(r.scClip != null && Math.abs(r.scClip) <= SOGLIE.scClip)) m.push(`frustata della clip a ${r.scClip == null ? 'nessuna clip di testa al contatto' : (-r.scClip) + ' s dal contatto'} (oltre ±${SOGLIE.scClip})`);
  if (!(r.peso >= SOGLIE.peso)) m.push(`peso del gesto al contatto ${r.peso} < ${SOGLIE.peso}`);
  if (!(r.scatto <= SOGLIE.scatto)) m.push(`scatto della testa ${r.scatto} u/s > ${SOGLIE.scatto}`);
  if (!(r.scivolo <= SOGLIE.scivolo)) m.push(`piede a terra che scivola ${r.scivolo} u > ${SOGLIE.scivolo}`);
  return m;
}

export async function scena(b, port, gi, k, esito, opt = {}) {/* [giro 380] esportata: testa-380 la usa per le scene di PO-640 */
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: opt.foto ? 2 : 1 }); await installCdnRoutes(page);
  await page.addInitScript(([rosso, passo, extra]) => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_G342_REC = 1; if (passo === 'reale') window.__CPM_DTREAL = 1; else if (passo !== 'nativo') window.__CPM_DT60 = 1; if (rosso) rosso.split(',').forEach(x => { if (x) window[x] = 1; }); (extra || []).forEach(x => { window[x] = 1; }); }, [ROSSO, PASSO, opt.extra || []]);
  let W = null; const foto = [];
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 342' }); await sleep(1200);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 120000 }).catch(() => {});
    await page.evaluate(g => { window.__CPM_G342W = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 40000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(([a, e]) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(a); }, [k, esito]);
    /* fine scena = il testimone non cresce piu' (evento, non tempo fisso) oppure ha superato il contatto di 1,5 s di scena */
    let prev = -1, fermo = 0; const t0 = Date.now();
    while (Date.now() - t0 < (PASSO === 'reale' ? 60000 : 240000)) {
      if (opt.foto) { const tr = await page.evaluate(() => Math.round(performance.now())); const buf = await page.screenshot({ type: 'jpeg', quality: 80 }).catch(() => null); if (buf) foto.push({ tr, buf }); if (foto.length > 400) foto.shift(); } else await sleep(900);
      const st = await page.evaluate(() => { const W = window.__CPM_G342W; if (!W || !W.f.length) return { n: 0, fine: 0, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; const F = W.f; let c = -1; for (let i = 1; i < F.length; i++) if (F[i][27] && F[i][28] > 0 && (!F[i - 1][27] || F[i - 1][28] <= 0)) c = i; return { n: F.length, fine: c >= 0 ? F[F.length - 1][0] - F[c][0] : 0, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; });
      if (st.fine > 1.6) break; if (st.n === prev) { if (++fermo >= (st.n > 20 ? 4 : 30)) break; } else fermo = 0; prev = st.n;
      if (st.ph && !/^hl_/.test(st.ph) && st.n > 0) break;
    }
    W = await page.evaluate(() => window.__CPM_G342W || null);
  } catch (e) { W = W || { err: String(e && e.message || e).slice(0, 120) }; } finally { await page.close().catch(() => {}); }
  const r = (W && W.err && !W.f) ? { err: W.err } : analizza(W);
  if (opt.foto && W && W.f && !r.err) { /* fotogrammi piu' vicini a -0,30 -0,15 0 +0,15 +0,35 s di scena dal contatto */
    const F = W.f, tc = r.tc; const dir = path.join(OUT, 'foto-' + ETI); fs.mkdirSync(dir, { recursive: true });
    for (const off of [-0.45, -0.25, -0.1, 0, 0.12, 0.3, 0.6]) { let bi = 0; for (let i = 1; i < F.length; i++) if (Math.abs(F[i][0] - tc - off) < Math.abs(F[bi][0] - tc - off)) bi = i; const trT = F[bi][1]; let bf = null; for (const f of foto) if (!bf || Math.abs(f.tr - trT) < Math.abs(bf.tr - trT)) bf = f;
      if (bf && Math.abs(bf.tr - trT) < 1500) fs.writeFileSync(path.join(dir, `gi${gi}-a${k}-${esito}_${off >= 0 ? 'p' : 'm'}${Math.abs(off).toFixed(2)}.jpg`), bf.buf); } }
  if (process.env.CPM_DUMP && W && W.f) fs.writeFileSync(path.join(OUT, `dump-${ETI}-gi${gi}-a${k}-${esito}.json`), JSON.stringify(W));
  return { gi, k, esito, ...r };
}

async function main() {
  if (ARG('rianalizza')) { const e = ARG('rianalizza'); const out = []; for (const f of fs.readdirSync(OUT).filter(x => x.startsWith('dump-' + e + '-'))) { const m = f.match(/gi(\d+)-a(\d+)-(\w+)\.json$/); const W = JSON.parse(fs.readFileSync(path.join(OUT, f))); const t = TUTTE.find(z => z[0] === +m[1] && z[1] === +m[2]); out.push({ gi: +m[1], k: +m[2], esito: m[3], tipo: t ? t[2] : '?', ...analizza(W) }); }
    return riepilogo(out, e, false); }
  const lista = (() => { const c = ARG('casi') || process.env.CPM_CASI; if (c) return c.split(',').map(x => { const [g, a] = x.split(':').map(Number); const t = TUTTE.find(z => z[0] === g && z[1] === a); return [g, a, t ? t[2] : '?']; }); return GUARD ? GUARDIA : TUTTE; })();
  const esiti = (ARG('esiti') || process.env.CPM_ESITI || (GUARD ? 'success' : 'success,fail')).split(',');
  const lavori = []; for (const [gi, k, tipo] of lista) for (const e of esiti) lavori.push({ gi, k, tipo, e });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
  let idx = 0; const worker = async () => { while (idx < lavori.length) { const L = lavori[idx++]; let r = await scena(b, port, L.gi, L.k, L.e, { foto: FOTO });
    if (r.err) r = await scena(b, port, L.gi, L.k, L.e, { foto: FOTO });/* una sola riprova dichiarata se la pagina non ha prodotto il testimone */
    r.tipo = L.tipo; out.push(r); console.log(JSON.stringify(r)); } };
  await Promise.all(Array.from({ length: FOTO ? 1 : PAR }, worker));
  await b.close(); srv.close();
  return riepilogo(out, ETI, GUARD);
}
function riepilogo(out, ETI, GUARD) {
  out.sort((a, b2) => a.gi - b2.gi || a.k - b2.k || (a.esito < b2.esito ? 1 : -1));
  const file = path.join(OUT, `${GUARD ? 'guardiano' : 'censimento'}-${ETI}-passo${PASSO}.json`); fs.writeFileSync(file, JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO || null, passo: PASSO, soglie: SOGLIE, scene: out }, null, 1));
  /* riepilogo per tipo */
  const med = a => { const s = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
  const tipi = [...new Set(out.map(x => x.tipo))];
  console.log('\ntipo        scene  dCont(med/max)  |scPicco|(med/max)  |scClip|(med/max)  peso(min)  scatto(max)  scivolo(max)  vArr(med)  bocciate');
  for (const t of tipi.concat(['TUTTE'])) { const S = out.filter(x => (t === 'TUTTE' || x.tipo === t)); const V = S.filter(x => !x.err);
    const mx = k => V.length ? Math.max(...V.map(x => Math.abs(x[k] || 0))) : null, mn = k => V.length ? Math.min(...V.map(x => x[k] == null ? 0 : x[k])) : null;
    console.log(`${t.padEnd(11)} ${String(S.length).padStart(4)}   ${med(V.map(x => x.dCont))}/${mx('dCont')}       ${med(V.map(x => Math.abs(x.scPicco)))}/${mx('scPicco')}          ${med(V.map(x => Math.abs(x.scClip == null ? 9 : x.scClip)))}/${mx('scClip')}            ${mn('peso')}       ${mx('scatto')}        ${mx('scivolo')}        ${med(V.map(x => x.vArr))}      ${S.filter(x => giudica(x).length).length}`); }
  console.log('scritto ' + path.relative(process.cwd(), file));
  if (!GUARD) return 0;
  /* GIUDIZIO. Verde: tutte le scene passano tutte le soglie. Rosso (CPM_ROSSO): il guardiano e' valido solo se il comportamento di
     prima CADE — almeno 3 scene bocciate su soglie di sincronia o di contatto; allora il braccio rosso esce 0 («rosso col rosso»). */
  let boc = 0, ng = 0; for (const r of out) { const m = giudica(r); if (m.length) { boc++; if (m.some(x => /non giudicato/.test(x))) ng++; console.log(`NO   gi${r.gi} a${r.k} (${r.tipo}): ${m.join(' · ')}`); } else console.log(`ok   gi${r.gi} a${r.k} (${r.tipo}): dCont ${r.dCont} · scPicco ${r.scPicco} · peso ${r.peso} · scatto ${r.scatto} · scivolo ${r.scivolo}`); }
  if (ROSSO) { const veri = boc - ng; const ok = veri >= 3; console.log(`\nbraccio ROSSO (${ROSSO}): ${veri} scene bocciate su misura (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  console.log(`\nbraccio VERDE: ${out.length - boc}/${out.length} scene dentro le soglie${ng ? ' · ' + ng + ' NON GIUDICATE (= rosso)' : ''} — ${boc ? 'FALLITO' : 'PASS'}`); return boc ? 1 : 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__dirname, '..', 'testa-342.mjs')) { main().then(c => process.exit(c)).catch(e => { console.error('FATALE', e); process.exit(2); }); }
