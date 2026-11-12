#!/usr/bin/env node
/* [giro 170b PO-367] ANALISI dei file grezzi di gesti-170b.mjs (out/giro170b/raw/*.json). Sola lettura, nessun browser.
   Scrive out/giro170b/analisi.json e stampa una tabella per gesto. Le definizioni sono qui, dichiarate PRIMA dei numeri:

   SCALA       1 u-mondo = 1,8 m / (quota osso testa − quota punta piede, mediana a corpo eretto): la stessa convenzione di __CPM_PIEDI.
   PARTENZA    fotogramma in cui il gioco arma il PRIMO arco dell'esito (__CPM_CONT121 passa da 0 a 1). Risoluzione 16,7 ms.
   ARTO        l'osso (punta sx/dx, caviglia sx/dx, testa) piu' vicino al centro del pallone alla partenza.
   dContatto   distanza arto–centro pallone alla partenza, in cm (raggio del pallone nel gioco: 0,20 u).
   dtMin       istante della distanza MINIMA arto–pallone in ±0,5 s, meno la partenza (ms). ≈0 = il pallone parte dal piede.
   dtPicco     istante del PICCO di velocita' dell'arto (rispetto al bacino) in ±0,5 s, meno la partenza (ms). Nel calcio vero il
               pallone lascia il piede attorno al picco: |dtPicco| grande = il pallone parte prima/dopo lo schiaffo visibile.
   APPOGGIO    il piede NON calciante nella finestra [partenza −0,20 s, +0,10 s], se la sua punta sta entro 6 cm dal suolo:
               scorrimento orizzontale in cm per fotogramma (1/60 s). Per i gesti senza arco: tutti i fotogrammi col gesto montato.
   PATTINA     quota dei fotogrammi di gesto con un piede a terra (≤6 cm) che scorre oltre 0,5 m/s (definizione di __CPM_PIEDI).
   CORPO-PALLA fotogrammi in cui il centro del pallone sta dentro il tronco (capsula bacino-petto-testa, raggio 14 cm) o dentro
               coscia/stinco (raggio 6 cm).
   CORPO-CORPO fotogrammi con un altro bacino a meno di 45 cm (in pianta) dal bacino dell'eroe.
   ORIENTA     angolo fra il «davanti» del petto (da spalla sx/dx) e la direzione reale del pallone nei 3 fotogrammi dopo la
               partenza (gradi); accanto, lo stesso angolo secondo il gioco (__CPM_CONT121.at, radice del corpo ↔ bersaglio).
   SCATTO      per ogni fotogramma fuori dallo stacco nero: variazione, fra due fotogrammi consecutivi, della velocita' di una
               articolazione rispetto al bacino. Oltre 12 cm/fotogramma² (≈ 430 m/s², 44 g) e' uno scatto di posa.
               Si riporta il massimo, l'articolazione e se cade entro 2 fotogrammi da un cambio di clip.
   SALTO RADICE spostamento del bacino in pianta oltre 35 cm in un fotogramma (21 m/s) fuori dallo stacco nero. */
import fs from 'node:fs';
import path from 'node:path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = path.join(HERE, 'out', 'giro170b', 'raw');
const N = ['pel', 'chest', 'head', 'shL', 'shR', 'elL', 'elR', 'haL', 'haR', 'hiL', 'hiR', 'knL', 'knR', 'anL', 'anR', 'toL', 'toR'];
const J = (h, n) => { const i = N.indexOf(n) * 3; return h && h[i] != null ? [h[i], h[i + 1], h[i + 2]] : null; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; const len = a => Math.hypot(a[0], a[1], a[2]); const dist = (a, b) => len(sub(a, b));
const med = a => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const pc = (a, q) => { const s = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : null; };
const r1 = x => x == null ? null : +x.toFixed(1); const r0 = x => x == null ? null : Math.round(x);
const segD = (p, a, b) => { const ab = sub(b, a), ap = sub(p, a); const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2] + 1e-9))); return dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]); };
const ang = (ax, az, bx, bz) => { const d = Math.atan2(ax * bz - az * bx, ax * bx + az * bz); return Math.abs(d) * 180 / Math.PI; };

export function analizza(R) {
  const F = (R.fr || []).filter(x => x.h && x.b); if (F.length < 30) return { errore: 'pochi fotogrammi (' + F.length + ')' };
  const alt = med(F.map(x => { const hd = J(x.h, 'head'), l = J(x.h, 'toL'), r = J(x.h, 'toR'); return hd && l && r ? hd[1] - Math.min(l[1], r[1]) : null; }).filter(a => a > 1.2));
  const m = alt ? 1.8 / alt : 1; const suolo = pc(F.flatMap(x => [J(x.h, 'toL')[1], J(x.h, 'toR')[1]]), 0.03);
  const o = { n: F.length, scala: +m.toFixed(3), clip: R.clip, tipo: R.info && R.info.type, variante: R.info && R.info.variant, label: R.info && R.info.label };
  /* gesto montato */
  const gF = F.filter(x => x.g && x.g[0] && x.g[1] > 0.5 && !x.cut);
  o.gesto = { fotogrammi: gF.length, s: +(gF.length / 60).toFixed(2), nomi: [...new Set(F.filter(x => x.g && x.g[0]).map(x => x.g[0] + '/' + x.g[3]))], quotaClip: (() => { const q = {}; for (const x of F) if (x.g && x.g[0] && x.g[7]) { const k = x.g[0] + '/' + x.g[3]; q[k] = Math.max(q[k] || 0, x.g[2] / x.g[7]); } for (const k in q) q[k] = +q[k].toFixed(2); return q; })(), ts: [...new Set(gF.map(x => x.g[6]))].slice(0, 4) };
  /* partenza */
  let d = -1; for (let i = 1; i < F.length; i++) if (F[i].na > 0 && F[i - 1].na === 0) { d = i; break; }
  if (d < 0 && F[0].na > 0) d = 0;
  const A = ['toL', 'toR', 'anL', 'anR', 'head'];
  if (d >= 0) {
    const x = F[d]; let arto = null, dc = 1e9;
    const vRel = (i, n) => { if (i < 1 || i >= F.length) return 0; const p = sub(J(F[i].h, n), J(F[i].h, 'pel')), q = sub(J(F[i - 1].h, n), J(F[i - 1].h, 'pel')); return dist(p, q) * m * 60; };
    const pkF = n => { let v = 0; for (let i = Math.max(1, d - 10); i <= Math.min(F.length - 1, d + 25); i++) if (!F[i].cut) v = Math.max(v, vRel(i, n)); return v; };/* fino a +0,42 s: il piede calciante puo' arrivare DOPO la partenza */
    const dTesta = dist(J(x.h, 'head'), x.b), dPiede = Math.min(dist(J(x.h, 'toL'), x.b), dist(J(x.h, 'toR'), x.b));
    if ((x.b[1] - suolo) * m > 1.0 && dTesta < dPiede) arto = 'head'; else arto = pkF('toL') >= pkF('toR') ? 'toL' : 'toR';
    dc = dist(J(x.h, arto), x.b);
    const fam = arto === 'head' ? 'testa' : (arto.endsWith('L') ? 'sx' : 'dx');
    const lo = Math.max(1, d - 30), hi = Math.min(F.length - 1, d + 30); let iMin = d, dMin = 1e9, iPk = d, vPk = 0;
    for (let i = lo; i <= hi; i++) { const p = J(F[i].h, arto); const dd = dist(p, F[i].b); if (dd < dMin) { dMin = dd; iMin = i; }
      const q = J(F[i - 1].h, arto); const rp = sub(p, J(F[i].h, 'pel')), rq = sub(q, J(F[i - 1].h, 'pel')); const v = dist(rp, rq) * m * 60; if (v > vPk && !F[i].cut) { vPk = v; iPk = i; } }
    const b0 = x.b, b3 = F[Math.min(F.length - 1, d + 3)].b; const vb = [b3[0] - b0[0], b3[2] - b0[2]]; const vPalla = Math.hypot(b3[0] - b0[0], b3[1] - b0[1], b3[2] - b0[2]) * m * 60 / 3;
    const sL = J(x.h, 'shL'), sR = J(x.h, 'shR'), hL = J(x.h, 'hiL'), hR = J(x.h, 'hiR');
    const fw = (L, Rr) => { const rx = Rr[0] - L[0], rz = Rr[2] - L[2]; return [rz, -rx]; };/* su × (dx − sx) */
    const fp = fw(sL, sR), fb = fw(hL, hR); const c = (R.c121 || [])[0] || {};
    o.contatto = { fotogramma: d, tScena: x.ck, arto: fam, osso: arto, dContattoCm: r1(dc * m * 100), dMinCm: r1(dMin * m * 100), dtMinMs: r0((iMin - d) * 1000 / 60), dtPiccoMs: r0((iPk - d) * 1000 / 60), vArtoMs: r1(vPk), vPallaMs: r1(vPalla), quotaPallaCm: r1((x.b[1] - suolo) * m * 100),
      orientaPettoGradi: Math.hypot(vb[0], vb[1]) > 0.02 ? r0(ang(fp[0], fp[1], vb[0], vb[1])) : null, orientaBacinoGradi: Math.hypot(vb[0], vb[1]) > 0.02 ? r0(ang(fb[0], fb[1], vb[0], vb[1])) : null, orientaGiocoGradi: c.at != null ? c.at : null, versoPortaGradi: c.a != null ? c.a : null,
      corpoPallaGiocoCm: c.db != null ? r0(c.db * m * 100) : null, actGioco: c.act || null, clipAllaPartenza: x.g ? x.g[0] + '/' + x.g[3] + '@' + (x.g[7] ? (x.g[2] / x.g[7]).toFixed(2) : '?') : null, pesoGesto: x.g ? x.g[1] : null, inStacco: x.cut };
    /* piede d'appoggio */
    if (arto !== 'head') { const app = arto.endsWith('L') ? 'toR' : 'toL'; const sc = []; let tot = 0; const hq = [];
      /* piede d'appoggio = il NON calciante, da 0,10 s prima a 0,05 s dopo la partenza (il piede e' piantato per definizione del gesto) */
      for (let i = Math.max(1, d - 6); i <= Math.min(F.length - 1, d + 3); i++) { const p = J(F[i].h, app), q = J(F[i - 1].h, app); if (!F[i].cut && !F[i - 1].cut) { const s = Math.hypot(p[0] - q[0], p[2] - q[2]) * m * 100; sc.push(s); tot += s; hq.push((p[1] - suolo) * m * 100); } }
      o.appoggio = { piede: app, fotogrammi: sc.length, cmPerFotogrammaMed: r1(med(sc)), cmPerFotogrammaMax: r1(Math.max(...sc, 0)), cmTotali: r1(tot), quotaPuntaCm: r1(med(hq)), bacinoSuCm: r1((J(x.h, 'pel')[1] - med(F.filter(y => !(y.g && y.g[0])).map(y => J(y.h, 'pel')[1]))) * m * 100) }; }
  } else o.contatto = null;
  /* pattinamento sul gesto, compenetrazioni, scatti */
  let cont = 0, sk = 0; const scorr = [];
  for (let i = 1; i < F.length; i++) { const x = F[i], y = F[i - 1]; if (!(x.g && x.g[0] && x.g[1] > 0.5) || x.cut || y.cut) continue; let c = false, s = false;
    for (const a of ['toL', 'toR']) { const p = J(x.h, a), q = J(y.h, a); if ((p[1] - suolo) * m <= 0.06) { c = true; const v = Math.hypot(p[0] - q[0], p[2] - q[2]) * m * 60; scorr.push(v * 100 / 60); if (v > 0.5) s = true; } }
    if (c) cont++; if (s) sk++; }
  o.pattina = { fotogrammiATerra: cont, quota: cont ? +(sk / cont).toFixed(2) : null, cmPerFotogrammaMed: r1(med(scorr)), cmPerFotogrammaP90: r1(pc(scorr, 0.9)) };
  let tronco = 0, gamba = 0, corpi = 0, dCorpoMin = 1e9, vivi = 0;
  for (const x of F) { if (x.cut || !/^hl_/.test(x.ph || '')) continue; vivi++; const P = n => J(x.h, n);
    if (segD(x.b, P('pel'), P('chest')) * m < 0.14) tronco++;/* solo bacino-petto: la testa tocca il pallone per mestiere nel colpo di testa */
    if (Math.min(segD(x.b, P('hiL'), P('knL')), segD(x.b, P('hiR'), P('knR')), segD(x.b, P('knL'), P('anL')), segD(x.b, P('knR'), P('anR'))) * m < 0.06) gamba++;
    let vicino = false; for (let i = 0; i < x.o.length; i += 2) { const dd = Math.hypot(x.o[i] - P('pel')[0], x.o[i + 1] - P('pel')[2]) * m; if (dd < dCorpoMin) dCorpoMin = dd; if (dd < 0.45) vicino = true; } if (vicino) corpi++; }
  o.compenetra = { fotogrammi: vivi, palloneNelTronco: tronco, palloneNellaGamba: gamba, corpoCorpo: corpi, corpoPiuVicinoCm: dCorpoMin < 1e8 ? r0(dCorpoMin * 100) : null };
  let yMax = 0, yI = -1, nYaw = 0; let sMax = 0, sJ = null, sI = -1, nScatti = 0, salti = 0, sClip = false; const cambi = []; for (let i = 1; i < F.length; i++) { const a = F[i].g ? F[i].g[0] + '/' + F[i].g[3] : '', b = F[i - 1].g ? F[i - 1].g[0] + '/' + F[i - 1].g[3] : ''; if (a !== b) cambi.push(i); }
  const vel = (i, n) => { const p = sub(J(F[i].h, n), J(F[i].h, 'pel')), q = sub(J(F[i - 1].h, n), J(F[i - 1].h, 'pel')); return dist(p, q) * m * 100; };
  for (let i = 2; i < F.length; i++) { if (F[i].cut || F[i - 1].cut || F[i - 2].cut) continue; if (F[i].f - F[i - 1].f !== 1 || F[i - 1].f - F[i - 2].f !== 1) continue;
    const pp = J(F[i].h, 'pel'), pq = J(F[i - 1].h, 'pel'); if (Math.hypot(pp[0] - pq[0], pp[2] - pq[2]) * m > 0.35) salti++;
    let fm = 0, fj = null; for (const n of N) { if (n === 'pel') continue; const a = Math.abs(vel(i, n) - vel(i - 1, n)); if (a > fm) { fm = a; fj = n; } }
    if (fm > 12) nScatti++; if (fm > sMax) { sMax = fm; sJ = fj; sI = i; }
    { const fwd = k => { const L = J(F[k].h, 'shL'), R2 = J(F[k].h, 'shR'); return Math.atan2(-(R2[0] - L[0]), R2[2] - L[2]); }; let dy = Math.abs(fwd(i) - fwd(i - 1)) * 180 / Math.PI; if (dy > 180) dy = 360 - dy; if (dy > yMax) { yMax = dy; yI = i; } if (dy > 20) nYaw++; } }
  if (sI >= 0) sClip = cambi.some(c => Math.abs(c - sI) <= 2);
  o.scatti = { maxCmF2: r1(sMax), articolazione: sJ, alFotogramma: sI, vicinoCambioClip: sClip, fotogrammiOltre12: nScatti, saltiRadice: salti, giroMaxGradiF: r0(yMax), giroAlFotogramma: yI, giriOltre20: nYaw, giroRispettoPartenzaMs: d >= 0 && yI >= 0 ? r0((yI - d) * 1000 / 60) : null, giroPesoGesto: yI >= 0 && F[yI].g ? [F[yI].g[0], F[yI].g[1], F[yI].g[3]] : null, cambiClip: cambi.length, rispettoPartenzaMs: d >= 0 && sI >= 0 ? r0((sI - d) * 1000 / 60) : null };
  /* portiere (per le parate): mano piu' vicina al pallone, quando */
  const K = F.filter(x => x.k && x.k[0] != null && !x.cut); if (K.length > 20) { let dm = 1e9, im = -1; for (let i = 0; i < K.length; i++) { for (const off of [6, 9]) { const p = [K[i].k[off], K[i].k[off + 1], K[i].k[off + 2]]; if (p[0] == null) continue; const dd = dist(p, K[i].b); if (dd < dm) { dm = dd; im = i; } } }
    o.portiere = { manoPallaMinCm: r0(dm * m * 100), alFotogramma: im >= 0 ? K[im].f : null, bacinoQuotaMinCm: r0((Math.min(...K.map(x => x.k[1])) - suolo) * m * 100) }; }
  return o;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = fs.readdirSync(RAW).filter(f => f.endsWith('.json')).sort(); const per = {}; const tutte = [];
  for (const f of files) { const R = JSON.parse(fs.readFileSync(path.join(RAW, f))); if (R.errore) { tutte.push({ file: f, g: R.g, errore: R.errore }); continue; } const a = analizza(R); tutte.push({ file: f, g: R.g, gi: R.gi, k: R.k, seme: R.seme, out: R.out, kind: R.kind, ...a }); (per[R.g] = per[R.g] || []).push(a); }
  const agg = {}; const col = (L, f) => L.map(f).filter(x => x != null && Number.isFinite(x));
  for (const [g, L0] of Object.entries(per)) { const L = L0.filter(x => !x.errore); const C = L.filter(x => x.contatto);
    const clip = {}; for (const x of L) for (const k of Object.keys(x.clip || {})) clip[k] = (clip[k] | 0) + 1;
    agg[g] = { esecuzioni: L0.length, valide: L.length, conArco: C.length, clip,
      dContattoCm: [r1(med(col(C, x => x.contatto.dContattoCm))), r1(pc(col(C, x => x.contatto.dContattoCm), 0.9))],
      dtMinMs: [r0(med(col(C, x => x.contatto.dtMinMs))), r0(Math.max(...col(C, x => Math.abs(x.contatto.dtMinMs)), 0))],
      dtPiccoMs: [r0(med(col(C, x => x.contatto.dtPiccoMs))), r0(pc(col(C, x => Math.abs(x.contatto.dtPiccoMs)), 0.9))],
      corpoPallaCm: [r0(med(col(C, x => x.contatto.corpoPallaGiocoCm))), r0(Math.max(...col(C, x => x.contatto.corpoPallaGiocoCm), 0))], senzaGestoAllaPartenza: C.filter(x => !(x.contatto.pesoGesto > 0.5)).length, bacinoSuCm: r0(med(col(L, x => x.appoggio && x.appoggio.bacinoSuCm))), manoPallaGkCm: r0(med(col(L, x => x.portiere && x.portiere.manoPallaMinCm))), vArtoMs: r1(med(col(C, x => x.contatto.vArtoMs))), vPallaMs: r1(med(col(C, x => x.contatto.vPallaMs))),
      orientaPetto: [r0(med(col(C, x => x.contatto.orientaPettoGradi))), r0(pc(col(C, x => x.contatto.orientaPettoGradi), 0.9))], orientaGioco: [r0(med(col(C, x => x.contatto.orientaGiocoGradi))), r0(pc(col(C, x => x.contatto.orientaGiocoGradi), 0.9))],
      appoggioCmF: [r1(med(col(L, x => x.appoggio && x.appoggio.cmPerFotogrammaMed))), r1(pc(col(L, x => x.appoggio && x.appoggio.cmPerFotogrammaMax), 0.9))], appoggioQuotaCm: [r1(med(col(L, x => x.appoggio && x.appoggio.quotaPuntaCm))), r1(pc(col(L, x => x.appoggio && x.appoggio.quotaPuntaCm), 0.9))], appoggioTotCm: r1(med(col(L, x => x.appoggio && x.appoggio.cmTotali))),
      pattina: [med(col(L, x => x.pattina.quota)), r1(med(col(L, x => x.pattina.cmPerFotogrammaMed)))],
      tronco: L.filter(x => x.compenetra.palloneNelTronco > 0).length, gamba: L.filter(x => x.compenetra.palloneNellaGamba > 0).length, corpi: L.filter(x => x.compenetra.corpoCorpo > 0).length,
      scattoMax: [r1(med(col(L, x => x.scatti.maxCmF2))), r1(Math.max(...col(L, x => x.scatti.maxCmF2), 0))], scattiOltre12: r1(med(col(L, x => x.scatti.fotogrammiOltre12))), scattoAlCambioClip: L.filter(x => x.scatti.vicinoCambioClip).length, saltiRadice: L.filter(x => x.scatti.saltiRadice > 0).length, giroMax: [r0(med(col(L, x => x.scatti.giroMaxGradiF))), r0(Math.max(...col(L, x => x.scatti.giroMaxGradiF), 0))], conGiroOltre20: L.filter(x => x.scatti.giriOltre20 > 0).length,
      durataGestoS: r1(med(col(L, x => x.gesto.s))) }; }
  fs.writeFileSync(path.join(RAW, '..', 'analisi.json'), JSON.stringify({ agg, esecuzioni: tutte }, null, 1));
  for (const [g, a] of Object.entries(agg)) console.log(g.padEnd(12), JSON.stringify(a));
}
