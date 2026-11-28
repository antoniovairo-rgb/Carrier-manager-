#!/usr/bin/env node
/* [giro 422 PO-640, decisione PO del giro 342 dubbio D «Tutte le consigliate»: «nelle scene di colpo di testa senza costruzione aerea il
   pre-stacco va esteso all'attesa del pallone (TESTA146), con la stessa fase della clip»]
   GUARDIANO DEL PRE-STACCO NELL'ATTESA. GLB acceso, una pagina nuova per scena, teatro acceso, passo 1/60 (stesse regole e stesse misure
   di testa-342.mjs: si importano analizza, giudica e SOGLIE, nessuna soglia nuova e nessuna abbassata).
   Due gruppi di scene, entrambe riuscite:
     PROVA   gi53 a1 «Di testa al volo» · gi48 a1 (rimbalzo) · gi108 a0 (sponda), con __CPM_TESTA422_PROVA: la scena si gioca senza il
             pre-stacco della costruzione e all'esito il pallone sta 6 u lontano dalla testa → il colpo deve aspettarlo (~0,4 s).
             Il testimone __CPM_W422 deve dire che l'attesa c'e' stata davvero (prova=1, tau0 >= 0,30 s): altrimenti NON GIUDICATO = rosso.
     NATURALI gi53 a1 · gi48 a1 senza provocazione: non regressione (dentro le soglie di testa-342 in entrambi i bracci).
   Verde: tutte le scene dentro tutte le soglie. Rosso (CPM_ROSSO=__CPM_NO_G422): valido solo se almeno 2 scene PROVA su 3 cadono su
   misura (le non giudicate non contano) — rosso col rosso, uscita 0. */
import path from 'node:path'; import fs from 'node:fs';
import { startServer, launchBrowser, __dirname } from './lib/harness.mjs';
import { scena, giudica, SOGLIE } from './testa-342.mjs';

const ROSSO = process.env.CPM_ROSSO || '';
const PROVA = [[53, 1, 'rimbalzo'], [48, 1, 'rimbalzo'], [108, 0, 'sponda']];
const NATURALI = [[53, 1, 'rimbalzo'], [48, 1, 'rimbalzo']];
/* [giro 442] TARDI: la gara del treno 46082124679 (gi48 a1 PROVA, dCont 0,91) provocata dalla sonda. Col processore lento il gesto di testa
   si monta col pallone gia' alla testa e l'attesa TESTA146 si arma (e si rilascia) un fotogramma PRIMA della provocazione del 422: il colpo
   parte col pallone a 0,9-1,2 u. __CPM_PROVA442_TARDI rifa' quell'ordine in ogni scena. Verde: dentro le soglie. Rosso CPM_ROSSO=__CPM_NO_G442
   (gira solo queste): almeno 2 su 2 fuori misura. */
const TARDI = [[108, 0, 'sponda'], [48, 1, 'rimbalzo']];
const R442 = /__CPM_NO_G442/.test(ROSSO);
/* [giro 452] BRACCIO LENTO (CPM_LENTO452=1): il runner e' lento come un telefono. Treno 46119456382 parte 21: le quattro scene provocate col
   colpo partito a 1,46-1,85 u dalla testa, perche' il volo 274 (tempo di scena, sotto il rallentatore dell'esito) aveva un tetto di 6 s REALI.
   Qui ogni fotogramma si allunga come sul runner: processore x4 via CDP + zavorra fissa di 60 ms a fotogramma (sonda, il gioco non sa niente):
   misurato 3,4 fotogrammi al secondo e 0,29 s reali a fotogramma nel volo, i numeri del runner (col rosso dCont 1,73-2,0 contro 1,46-1,85 del treno).
   Scene: PROVA + TARDI (i casi col volo). Verde: tutte dentro le soglie E il testimone __CPM_TESTA274 dice che nel volo il fotogramma e' durato
   in media >= 0,25 s reali (altrimenti il braccio non ha provato il caso = NON GIUDICATO = rosso). Rosso CPM_ROSSO=__CPM_NO_G452 (tetto reale di prima): valido se
   almeno 3 scene su 5 cadono su misura col volo chiuso dal tetto (tetto=1). */
const LENTO = !!+process.env.CPM_LENTO452; const R452 = /__CPM_NO_G452/.test(ROSSO);
if (LENTO) { process.env.CPM_CPU442 = process.env.CPM_CPU442 || '4'; process.env.CPM_ZAVORRA452 = process.env.CPM_ZAVORRA452 || '60'; }
const FOTO_MIN = 0.25;/* s reali per fotogramma nel volo (il tetto reale per fotogramma del gioco e' 0,3) */
const TAU_MIN = 0.30;
const OUT = path.join(__dirname, '..', 'out', 'giro422'); fs.mkdirSync(OUT, { recursive: true });

async function main() {
  const lavori = LENTO ? [...PROVA.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 1 })), ...TARDI.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 2 }))]
    : R442 ? TARDI.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 2 }))
    : [...PROVA.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 1 })), ...NATURALI.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 0 })), ...(ROSSO ? [] : TARDI.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 2 })))];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
  let idx = 0; const worker = async () => { while (idx < lavori.length) { const L = lavori[idx++];
    const run = async () => { const o = { w422: {}, cattura: {} }; if (L.prova) o.extra = L.prova === 2 ? ['__CPM_TESTA422_PROVA', '__CPM_PROVA442_TARDI'] : ['__CPM_TESTA422_PROVA']; const r = await scena(b, port, L.gi, L.k, 'success', o); r.w422 = o.w422.v || null; r.t274 = o.cattura.v ? o.cattura.v.t274 : null; return r; };
    let r = await run(); if (r.err) r = await run();/* una sola riprova dichiarata se la pagina non ha prodotto il testimone */
    r.tipo = L.tipo; r.prova = L.prova; out.push(r); } };
  await Promise.all(Array.from({ length: +(process.env.CPM_PAR || 3) }, worker));
  await b.close(); srv.close();
  out.sort((a, c) => c.prova - a.prova || a.gi - c.gi);
  let bocProva = 0, ng = 0, boc = 0;
  for (const r of out) {
    const m = giudica(r);
    if (r.prova) { const w = (r.w422 || []).find(x => x && x.prova === 1);
      if (!w) m.push('non giudicato (testimone __CPM_W422 assente: la provocazione non ha armato l\'attesa)');
      else if (!(w.tau0 >= TAU_MIN) && !(R442 && r.prova === 2)) m.push/* [giro 442] nel rosso del 442 l'attesa corta (0,24 s: solo il caricamento) e' il difetto stesso, non una provocazione mancata */(`non giudicato (attesa provocata ${w.tau0} s < ${TAU_MIN})`);
      r.tau0 = w ? w.tau0 : null; r.tauLanc = w ? w.tauLanc : null;
      if (LENTO) { const v = (r.t274 || []).find(x => x && x.trR != null); r.trR = v ? v.trR : null; r.trS = v ? v.trS : null; r.tetto = v ? v.tetto : null;
        if (!v) m.push('non giudicato (testimone __CPM_TESTA274 assente: nessun volo 274)');
        else if (!(v.nf > 0 && v.trR / v.nf >= FOTO_MIN)) m.push(`non giudicato (fotogramma del volo ${v.nf ? (v.trR / v.nf).toFixed(2) : '?'} s reali < ${FOTO_MIN}: la macchina non era lenta abbastanza)`);
        else if (R452 && v.tetto !== 1) m.push('non giudicato (rosso senza volo chiuso dal tetto)'); } }
    const ngr = m.some(x => /non giudicato/.test(x));
    if (m.length) { boc++; if (ngr) ng++; else if (r.prova) bocProva++; }
    console.log(`${m.length ? 'NO ' : 'ok '} gi${r.gi} a${r.k} (${LENTO ? 'LENTO, ' : ''}${r.tipo}${r.prova ? (r.prova === 2 ? ', TARDI 442' : ', PROVA') + ' attesa ' + r.tau0 + ' s' : ', naturale'}): dCont ${r.dCont} · scPicco ${r.scPicco} · scClip ${r.scClip} · peso ${r.peso} · scatto ${r.scatto} · scivolo ${r.scivolo}${LENTO ? ' · volo ' + r.trR + ' s reali/' + r.trS + ' s scena, tetto ' + r.tetto : ''}${m.length ? ' — ' + m.join(' · ') : ''}`);
  }
  fs.writeFileSync(path.join(OUT, `guardiano-${LENTO ? 'lento-' : ''}${ROSSO ? 'rosso' : 'verde'}.json`), JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO || null, soglie: SOGLIE, tauMin: TAU_MIN, scene: out }, null, 1));
  if (LENTO && R452) { const ok = bocProva >= 3; console.log(`\nbraccio LENTO ROSSO (${ROSSO}): ${bocProva}/${out.length} scene bocciate su misura col volo chiuso dal tetto (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  if (R442) { const ok = bocProva >= TARDI.length; console.log(`\nbraccio ROSSO (${ROSSO}): ${bocProva}/${TARDI.length} scene TARDI bocciate su misura (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  if (ROSSO) { const ok = bocProva >= 2; console.log(`\nbraccio ROSSO (${ROSSO}): ${bocProva}/3 scene PROVA bocciate su misura (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  console.log(`\nbraccio ${LENTO ? 'LENTO ' : ''}VERDE: ${out.length - boc}/${out.length} scene dentro le soglie${ng ? ' · ' + ng + ' NON GIUDICATE (= rosso)' : ''} — ${boc ? 'FALLITO' : 'PASS'}`); return boc ? 1 : 0;
}
main().then(c => process.exit(c)).catch(e => { console.error('FATALE', e); process.exit(2); });
