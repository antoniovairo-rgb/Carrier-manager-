#!/usr/bin/env node
/* GUARDIANO giro 410 (PO-676) — «fare attenzione ai tiri, soprattutto centrali, che in teoria sono parati dal portiere, sembrano gol
   perche' il portiere si butta prima» (PO, 26/11, sulla 7.999.216). Rosso unico: __CPM_NO_G410.

   Corpi GLB accesi, pagina NUOVA per scena, __CPM_PRESENT=1 + __CPM_CINE=1. Ogni pagina forza una scena di tiro con esito «parata» e
   mette il bersaglio della parata a dz u di lato dal portiere (__CPM_SVZ410, solo ?cpmtest=1). Misura (misura-410.mjs, stessa funzione):
   CONTATTO = primo fotogramma col pallone sul piano del portiere, in tempo d'arco (= tempo di scena); lato = distanza di lato del punto
   di passaggio dal portiere calcolata dal gioco all'armo (d148); BACINO VISIBILE = osso del bacino del corpo GLB (testimone __CPM_GKTL,
   giro 410), non la posizione procedurale; la clip del tuffo e' in volo fra 0,8 e 1,25 s e a terra da 1,25 (misura del 7.855).

   BRACCIO C «sul tiro centrale resta sulla traiettoria» (lato < 2,0 u): ✗ se il portiere si tuffa (gk_dive), o se al contatto il
     pallone passa a piu' di 1,0 u di lato dal bacino visibile, o se il riflesso al contatto e' gia' oltre la sua posa (clip > 1,25 s:
     le clip del riflesso a terra sono giu' da 0,83-0,97 s, quindi il corpo e' sceso prima del pallone), o se col pallone a 0,6 o piu' di
     quota il bacino visibile sta sotto 0,45 (corpo steso sotto il pallone).
   BRACCIO L «sul tiro laterale il tuffo parte in tempo» (lato >= 2,0 u): ✗ se non si tuffa, se al contatto e' gia' a terra (clip >= 1,25 s),
     se lo stacco (clip a 0,8 s) non viene almeno 0,08 s prima del contatto, o se il pallone passa a piu' di 1,6 u dal bacino visibile
     (le mani arrivano ~1,3 u oltre il centro del corpo disteso, nota del giro 223).
   La pagina entra nel braccio per il LATO MISURATO, non per il dz chiesto (il testo «tuffo» puo' spostare il pallone di lato).
   Un caso senza contatto o senza gesto e' NON GIUDICATO = rosso. VERDE = 0 difetti e >= 8 giudicate per braccio, 0 non giudicate.
   ROSSO (__CPM_NO_G410) = ogni braccio rivede il suo difetto in almeno 6 scene giudicate su almeno 8.
   RIPETIZIONE DICHIARATA: una pagina non giudicata si rifa' UNA volta, pagina nuova; vale la seconda, ed e' stampato accanto.

     CPM_CHROME=… node portiere-410.mjs   (CPM_SOLO=verde|rosso · CPM_PAR=4 · CPM_C='165:0:0.5,…' · CPM_L='165:0:3,…') */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura410, riga410 } from './misura-410.mjs';
const P = s => s.split(',').filter(Boolean).map(q => { const [gi, ai, dz] = q.split(':'); return { sc: { gi: +gi, ai: +ai }, dz: +dz }; });
const CEN = P(process.env.CPM_C || '165:0:0.4,9:0:0.4,7:0:0.4,90:0:0.4,165:0:-1.3,9:0:1.3,7:0:-1.3,90:0:1.3,165:0:1.0,9:0:-1.0');
const LAT = P(process.env.CPM_L || '165:0:3,9:0:3,7:0:-3,90:0:3,165:0:-3,9:0:-3,7:0:3,90:0:-3,165:0:2.6,9:0:2.6,165:0:-2.6,7:0:2.6,90:0:2.6,9:0:-2.6');/* [giro 410] 14 pagine laterali: col rosso una parte esce con lato < 2 (misurato 6 su 10 nella catena) e il braccio deve avere >= 8 giudicate in entrambi i colori */
const PAR = +(process.env.CPM_PAR || 4), SOLO = process.env.CPM_SOLO || '';
const SOGLIA = 2.0, VIS_C = 1.0, VIS_L = 1.6, ANT = 0.08, BLK = 1.25;
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();

function giudica(o) {
  if (o.err) return { ng: o.err };
  if (o.lat == null) return { ng: 'lato non calcolato dal gioco' };
  if (o.vis == null) return { ng: 'bacino visibile non letto' };
  if (o.lat < SOGLIA) { const d = []; if (o.act === 'gk_dive') d.push('si tuffa'); if (o.vis > VIS_C) d.push(`pallone a ${o.vis} u dal bacino visibile (> ${VIS_C})`); if (o.by != null && o.by >= 0.6 && o.vy != null && o.vy < 0.45) d.push(`corpo steso sotto un pallone a mezz'altezza (bacino a ${o.vy}, pallone a ${o.by})`); if (o.ctC === 'block' && o.ctT != null && o.ctT > BLK) d.push(`riflesso gia' oltre la sua posa al contatto (clip ${o.ctT} s > ${BLK})`); return { br: 'C', dif: d }; }
  const d = []; if (o.act !== 'gk_dive') d.push('non si tuffa (' + o.act + ')');
  else { if (o.terra) d.push(`gia' a terra al contatto (clip ${o.ctT})`); if (o.anticipo == null || o.anticipo < ANT) d.push(`stacco ${o.anticipo == null ? 'mai' : o.anticipo + ' s'} prima del contatto (< ${ANT})`); }
  if (o.vis > VIS_L) d.push(`pallone a ${o.vis} u dal bacino visibile (> ${VIS_L})`);
  return { br: 'L', dif: d };
}
async function braccio(rosso) {
  const flag = rosso ? '__CPM_NO_G410' : '';
  const coda = [...CEN, ...LAT].map((q, i) => ({ ...q, i })), ris = [];
  console.log(`\n— braccio ${rosso ? 'ROSSO (__CPM_NO_G410)' : 'VERDE'} — ${coda.length} pagine, ${PAR} per volta, GLB acceso`);
  await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const q = coda.shift(); let o = await misura410(b, port, q.sc, q.dz, flag); let g = giudica(o);
    if (g.ng) { const p = g.ng; o = await misura410(b, port, q.sc, q.dz, flag); g = giudica(o); o.rip = p; }
    ris[q.i] = { o, g }; } }));
  const A = { C: { g: 0, d: 0, t: [] }, L: { g: 0, d: 0, t: [] } }; let ng = 0; const NG = [];
  for (const { o, g } of ris) { const rip = o.rip ? ` [pagina ripetuta 1 volta: ${o.rip}]` : '';
    if (g.ng) { ng++; NG.push(`⚠ gi${o.sc.gi} dz ${o.dz}: NON GIUDICATO (${g.ng})${rip}`); continue; }
    const a = A[g.br]; a.g++; if (g.dif.length) a.d++; a.t.push(`${g.dif.length ? '✗' : '·'} ${riga410(o)}${g.dif.length ? ' → ' + g.dif.join('; ') : ''}${rip}`); }
  const NOMI = { C: 'sul tiro centrale resta sulla traiettoria', L: 'sul tiro laterale il tuffo parte in tempo' };
  for (const k of ['C', 'L']) { console.log(`  braccio ${k} «${NOMI[k]}»: giudicate ${A[k].g}, con difetto ${A[k].d}`); for (const t of A[k].t) console.log('    ' + t); }
  for (const t of NG) console.log('  ' + t);
  return { A, ng, NOMI };
}
let ok = true; const fine = [];
if (SOLO !== 'rosso') { const { A, ng, NOMI } = await braccio(false); for (const k of ['C', 'L']) { const v = A[k].d === 0 && A[k].g >= 8 && ng === 0; if (!v) ok = false; fine.push(`VERDE braccio ${k} «${NOMI[k]}»: ${A[k].d} difetti su ${A[k].g} giudicate, ${ng} non giudicate in tutto${v ? '' : ' → NON VERDE'}`); } }
if (SOLO !== 'verde') { const { A, ng, NOMI } = await braccio(true); for (const k of ['C', 'L']) { const v = A[k].d >= 6 && A[k].g >= 8; if (!v) ok = false; fine.push(`ROSSO braccio ${k} «${NOMI[k]}»: difetto rivisto in ${A[k].d} scene su ${A[k].g} giudicate (attese almeno 6 su almeno 8), ${ng} non giudicate${v ? '' : ' → IL ROSSO NON SI VEDE'}`); } }
await b.close(); srv.close();
for (const r of fine) console.log(r);
console.log(ok ? '\n✅ portiere-410 VERDE (verde col verde, rosso col rosso): sul tiro centrale parato il portiere resta sulla traiettoria, sul laterale il tuffo parte in tempo e il pallone arriva al corpo visibile.' : `\n❌ portiere-410 ROSSO — ${fine.filter(r => /→/.test(r)).join(' · ')}`);
process.exit(ok ? 0 : 1);
