#!/usr/bin/env node
/* [collaudo 166 PO-229 giro 12] Verso del portiere sui tiri NON riusciti delle partite vere: legge i fotogrammi __CPM_GK229 salvati da
   collaudo-166-partite.mjs (dati/<giro>/gk229.jsonl) e applica la funzione analizza() copiata TALE E QUALE da gk-miss-229.mjs
   (stesse soglie: SOGLIA_X 47,4 · PORTATA 4,5). Uso: node collaudo-166-gk-lato.mjs <giro> [<giro> ...] */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SOGLIA_X = 48.6 - 1.2; const PORTATA = 4.5;
const DATI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'collaudi', 'release-166', 'dati');
function analizza(o) {
  const R = o.R || []; if (!R.length) return { ...o, nonGiud: 'nessun fotogramma' };
  const i0 = R.findIndex(f => f.at); if (i0 < 0) return { ...o, nonGiud: 'arco mai armato' };
  const iK = R.findIndex((f, i) => i >= i0 && f.at && f.aT >= 0); if (iK < 0) return { ...o, nonGiud: 'calcio non campionato' };
  const ckKick = R[iK].ck - R[iK].aT;
  /* attraversamento di una soglia in x, interpolato fra i due fotogrammi a cavallo */
  const passa = (soglia) => {
    for (let i = iK; i < R.length; i++) {
      if (R[i].bx < soglia(R[i])) continue;
      if (i > iK) { const a = R[i - 1], c = R[i]; const da = soglia(a) - a.bx, dc = soglia(c) - c.bx; const w = da / Math.max(1e-6, da - dc);
        return { ck: a.ck + w * (c.ck - a.ck), z: a.bz + w * (c.bz - a.bz), y: a.by + w * (c.by - a.by), gz: a.gz + w * (c.gz - a.gz), passo: c.ck - a.ck }; }
      return { ck: R[i].ck, z: R[i].bz, y: R[i].by, gz: R[i].gz, passo: 0 };
    }
    return null;
  };
  const Li = passa(() => SOGLIA_X);
  /* PASSAGGIO DAL PORTIERE = minimo avvicinamento del pallone al punto in cui il portiere stava al calcio (x,z), fra il calcio e
     la linea: regge anche i tiri da posizione defilata, dove il pallone corre parallelo al piano del portiere. Si raffina
     fra i due fotogrammi a cavallo del minimo con l'interpolazione lineare. */
  const gx0 = R[iK].gx, gz0k = R[iK].gz, dist = f => Math.hypot(f.bx - gx0, f.bz - gz0k);
  const ckFine = Li ? Li.ck : R[iK].ck + 3;
  /* si guarda solo il pallone gia' partito (oltre 1,5u dal punto di calcio): un tiro calciato a un passo dal portiere e che se ne
     allontana subito non «gli passa» accanto — misurato su una girata GLB: minimo a 0,07 s dal calcio, pallone uscito a z 11. */
  const kx = R[iK].bx, kz = R[iK].bz, partito = f => Math.hypot(f.bx - kx, f.bz - kz) >= 1.5;
  let iP = -1; for (let i = iK; i < R.length && R[i].ck <= ckFine; i++) if (partito(R[i]) && (iP < 0 || dist(R[i]) < dist(R[iP]))) iP = i;
  if (iP < 0) return { ...o, nonGiud: 'il pallone non parte dal piede (o non arriva sulla linea)' };
  let P = { ck: R[iP].ck, z: R[iP].bz, y: R[iP].by, gz: gz0k, passo: iP > iK ? R[iP].ck - R[iP - 1].ck : 0 };
  if (iP > iK && iP + 1 < R.length) { let best = dist(R[iP]); for (const [a, c] of [[R[iP - 1], R[iP]], [R[iP], R[iP + 1]]]) for (let w = 0.1; w < 1; w += 0.1) {
    const f = { bx: a.bx + w * (c.bx - a.bx), bz: a.bz + w * (c.bz - a.bz) }; const d = dist(f); if (d < best) { best = d; P = { ck: a.ck + w * (c.ck - a.ck), z: f.bz, y: a.by + w * (c.by - a.by), gz: gz0k, passo: c.ck - a.ck }; } } }
  if (P.passo > 0.15) return { ...o, nonGiud: `passaggio dal portiere fra due fotogrammi distanti ${P.passo.toFixed(2)}s di scena` };
  const dPiano = dist({ bx: R[iP].bx, bz: P.z }) , portata = Math.abs(P.z - P.gz) <= PORTATA && P.y <= 2.6 && dPiano <= PORTATA + 1;
  const r = { ...o, ckKick, ckPiano: P.ck, zPiano: +P.z.toFixed(2), yPiano: +P.y.toFixed(2), dPiano: +dPiano.toFixed(2), portata,
    ckLinea: Li ? Li.ck : null, zLinea: Li ? +Li.z.toFixed(2) : null, arcD: R[i0].aD };
  /* gesto del portiere: il primo armato dall'inizio dell'arco; PARTENZA del corpo = primo spostamento laterale oltre 5 cm */
  const iA = R.findIndex((f, i) => i >= i0 && f.op); if (iA < 0) return { ...r, gesto: null };
  /* verso = il bersaglio FINALE del gesto (il riflesso del 7.999.162 v2 rimira il pallone fino al suo passaggio) */
  let iZ = iA; for (let i = iA; i < R.length && R[i].op === R[iA].op; i++) iZ = i;
  const z0 = R[iA].gz, tz = R[iZ].tz; /* la z del portiere nel fotogramma in cui il gesto si arma: prima puo' ancora scivolare col piazzamento */
  const iS = R.findIndex((f, i) => i >= iA && f.op && Math.abs(f.gz - z0) > 0.05);
  const span = tz == null ? 0 : Math.abs(tz - z0);
  const iF = span > 0.3 ? R.findIndex((f, i) => i >= iA && Math.abs(f.gz - z0) >= 0.95 * span) : -1;
  const ckS = iS >= 0 ? (iS > 0 ? (R[iS - 1].ck + R[iS].ck) / 2 : R[iS].ck) : null;
  /* VERSO: si confronta col punto in cui il pallone attraversa il piano del portiere venendo da DAVANTI. Se il tiro parte gia' al
     suo livello o dietro (dal fondo, da posizione defilata: gi86, pallone da z 17 che taglia lo specchio alle sue spalle) il pallone
     passa da entrambi i lati del portiere: il verso non e' giudicabile e si dichiara (lato 0, «laterale»). Misurato: col punto di
     minimo avvicinamento il riflesso verso il pallone in arrivo risultava «sbagliato», col punto sulla linea lo era il tuffo verso
     la porta — due letture opposte della stessa scena, cioe' nessuna delle due e' un metro. */
  const davanti = R[iK].bx < R[iK].gx - 0.3; const Xp = davanti ? passa(f => f.gx) : null;
  const lato = (!Xp || tz == null || Math.abs(Xp.z - z0) < 0.8) ? 0 : (Math.sign(tz - z0) === Math.sign(Xp.z - z0) ? 1 : -1);
  return { ...r, gesto: R[iA].op, ckS, ckF: iF >= 0 ? R[iF].ck : null, z0: +z0.toFixed(2), tz, lato };
}

const tot = { scene: 0, giudicate: 0, giusto: 0, sbagliato: 0, nonGiud: 0, senzaGesto: 0, senzaGestoAPortata: 0, ritardo: 0 }; const righe = [];
for (const g of process.argv.slice(2)) { const f = path.join(DATI, g, 'gk229.jsonl'); if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)) { const o = JSON.parse(l); tot.scene++;
    const a = analizza({ R: o.R }); const kind = (o.R.find(x => x.ok) || {}).ok || null;
    const riga = { giro: g, partita: o.partita, scena: o.scena, label: o.esito && o.esito.label, fam: o.esito && o.esito.fam, kind, gesto: a.gesto || null, lato: a.lato, nonGiud: a.nonGiud || null, portata: a.portata, zPiano: a.zPiano, z0: a.z0, tz: a.tz, ritardo: a.ckS != null && a.ckPiano != null ? +(a.ckS - a.ckPiano).toFixed(2) : null, zLinea: a.zLinea };
    righe.push(riga);
    if (a.nonGiud) tot.nonGiud++; else if (!a.gesto) { tot.senzaGesto++; if (a.portata) tot.senzaGestoAPortata++; } else { tot.giudicate++; if (a.lato === 1) tot.giusto++; else if (a.lato === -1) tot.sbagliato++; if (riga.ritardo != null && riga.ritardo > 0.05) tot.ritardo++; } } }
for (const r of righe) console.log(JSON.stringify(r));
console.log('TOTALE', JSON.stringify(tot));
