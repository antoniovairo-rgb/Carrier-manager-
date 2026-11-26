#!/usr/bin/env node
/* [giro 390, PO-653] GUARDIANO «quando l'eroe fa un passaggio ad un compagno, in particolare tentativi di assist, quest'ultimo non e'
   gia' nella scena». Partite VERE (il cast della scena lo dichiara il motore: sul banco forzato non c'e'), GLB acceso, costruzione e
   teatro accesi, telefono 412x915. Due partite per braccio (s1 seme 2, s5 seme 3: le due partite in cui il difetto e' stato misurato),
   i due bracci in parallelo. La sonda sceglie a ogni scena un'azione di passaggio/assist e legge il testimone __CPM_W390 (camera
   DISEGNATA, piedi e testa del ricevente).
   VERDE (per ogni scena giudicata, ricevente = il compagno nominato in lettura, poi quello servito dal lancio):
     - nel quadro all'apertura, alla scelta e al lancio (piedi e testa dentro il 92 % orizzontale e il 95 % verticale);
     - nel quadro per almeno il 90 % della lettura;
     - davanti all'eroe all'apertura di almeno 4 u (posizione credibile per il passaggio: il punto del giro 99 e' 12 u avanti, 6 in area);
     - almeno 3 scene giudicate, nessun errore di pagina; una scena senza fotogrammi o senza lancio e' dichiarata e non conta.
   ROSSO (__CPM_NO_G390): almeno una scena deve violare una delle regole, altrimenti il guardiano non distingue e diventa rosso.
   Il ricevente della lettura diverso da quello del lancio si dichiara e non si giudica (dubbio del rapporto 390). */
import { corsa390, riepilogo390 } from './misura-390.mjs';

const lavori = [{ sk: 's1', sd: 2 }, { sk: 's5', sd: 3 }];
const braccio = async (flags) => { const out = [];
  await Promise.all(lavori.map(async (l) => { const f = await corsa390({ flags, saves: [l.sk], semi: [l.sd], par: 1 }); out.push(...f); }));
  return out; };
const giudica = (r) => { const m = r.m, d = [];
  if (m.ape.q !== 1) d.push(`fuori dal quadro all'apertura (nx ${m.ape.nx})`);
  if (m.sce && m.sce.q !== 1) d.push(`fuori dal quadro alla scelta (nx ${m.sce.nx})`);
  if (m.lancio.q !== 1) d.push(`fuori dal quadro al lancio (nx ${m.lancio.nx})`);
  if (m.quotaLettura == null || m.quotaLettura < 0.9) d.push(`nel quadro solo per ${m.quotaLettura} della lettura`);
  if (m.ape.avanti < 4) d.push(`all'apertura sta ${m.ape.avanti} u davanti all'eroe (meno di 4)`);
  return d; };
const [V, R] = await Promise.all([braccio([]), braccio(['__CPM_NO_G390'])]);
let rosso = false; const esito = {};
for (const [nome, F] of [['verde', V], ['rosso __CPM_NO_G390', R]]) {
  console.log(`\n=== braccio ${nome}`);
  const righe = F.flatMap(f => (f && f.righe) || []); const err = F.flatMap(f => (f && f.errs) || []).concat(F.filter(f => f && f.err).map(f => f.err));
  for (const f of F) console.log(`  partita ${f.sk}/${f.sd}: ${f.chiusa || 'errore'} al ${f.mMax || '-'}', ${f.righe ? f.righe.length : 0} scene di passaggio`);
  let difetti = 0, giud = 0;
  for (const r of righe) { if (!r.m || r.m.cieco) { console.log(`  · ${r.nome} «${(r.az || '').slice(0, 26)}»: non giudicata (${r.m ? r.m.cieco : 'senza misura'})`); continue; }
    giud++; const d = giudica(r); if (d.length) difetti++;
    console.log(`  ${d.length ? '✗' : '✓'} ${r.nome} «${(r.az || '').slice(0, 26)}» ric#${r.m.idxLett}${r.m.stesso ? '' : '→#' + r.m.idxLancio + ' (servito un altro: dichiarato)'} ape nx ${r.m.ape.nx} avanti ${r.m.ape.avanti} | lettura ${r.m.quotaLettura} | lancio nx ${r.m.lancio.nx}${d.length ? ' — ' + d.join(' · ') : ''}`); }
  riepilogo390(righe);
  esito[nome] = { giud, difetti, err: err.length };
  if (err.length) console.log(`  errori di pagina: ${err.slice(0, 3).join(' | ')}`);
}
const v = esito['verde'], r = esito['rosso __CPM_NO_G390'];
const motivi = [];
if (v.err) motivi.push(`verde: ${v.err} errori di pagina`);
if (v.giud < 3) motivi.push(`verde: solo ${v.giud} scene giudicate (servono almeno 3): non giudicato`);
if (v.difetti) motivi.push(`verde: ${v.difetti} scene col ricevente fuori scena o fuori posto`);
if (r.giud < 3) motivi.push(`rosso: solo ${r.giud} scene giudicate: non giudicato`);
if (!r.difetti) motivi.push('rosso: nessuna scena col difetto — il guardiano non distingue');
rosso = motivi.length > 0;
console.log(`\nricevente-390: verde ${v.giud} scene, ${v.difetti} difetti · rosso ${r.giud} scene, ${r.difetti} difetti`);
console.log(rosso ? `❌ ROSSO — ${motivi.join(' · ')}` : '✅ VERDE — il ricevente del passaggio e\' in scena, davanti all\'eroe e nel quadro dall\'apertura al lancio; senza la correzione no');
process.exit(rosso ? 1 : 0);
