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
const TAU_MIN = 0.30;
const OUT = path.join(__dirname, '..', 'out', 'giro422'); fs.mkdirSync(OUT, { recursive: true });

async function main() {
  const lavori = [...PROVA.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 1 })), ...NATURALI.map(([gi, k, tipo]) => ({ gi, k, tipo, prova: 0 }))];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
  let idx = 0; const worker = async () => { while (idx < lavori.length) { const L = lavori[idx++];
    const run = async () => { const o = { w422: {} }; if (L.prova) o.extra = ['__CPM_TESTA422_PROVA']; const r = await scena(b, port, L.gi, L.k, 'success', o); r.w422 = o.w422.v || null; return r; };
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
      else if (!(w.tau0 >= TAU_MIN)) m.push(`non giudicato (attesa provocata ${w.tau0} s < ${TAU_MIN})`);
      r.tau0 = w ? w.tau0 : null; r.tauLanc = w ? w.tauLanc : null; }
    const ngr = m.some(x => /non giudicato/.test(x));
    if (m.length) { boc++; if (ngr) ng++; else if (r.prova) bocProva++; }
    console.log(`${m.length ? 'NO ' : 'ok '} gi${r.gi} a${r.k} (${r.tipo}${r.prova ? ', PROVA attesa ' + r.tau0 + ' s' : ', naturale'}): dCont ${r.dCont} · scPicco ${r.scPicco} · scClip ${r.scClip} · peso ${r.peso} · scatto ${r.scatto} · scivolo ${r.scivolo}${m.length ? ' — ' + m.join(' · ') : ''}`);
  }
  fs.writeFileSync(path.join(OUT, `guardiano-${ROSSO ? 'rosso' : 'verde'}.json`), JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO || null, soglie: SOGLIE, tauMin: TAU_MIN, scene: out }, null, 1));
  if (ROSSO) { const ok = bocProva >= 2; console.log(`\nbraccio ROSSO (${ROSSO}): ${bocProva}/3 scene PROVA bocciate su misura (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  console.log(`\nbraccio VERDE: ${out.length - boc}/${out.length} scene dentro le soglie${ng ? ' · ' + ng + ' NON GIUDICATE (= rosso)' : ''} — ${boc ? 'FALLITO' : 'PASS'}`); return boc ? 1 : 0;
}
main().then(c => process.exit(c)).catch(e => { console.error('FATALE', e); process.exit(2); });
