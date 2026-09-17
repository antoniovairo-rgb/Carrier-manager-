/* GUARDIANO DELLA BANDA — il tabellino del motore contro la partita vera, due bracci appaiati.
   VERDE  = com'e' spedito (22 decisioni al minuto, la linea del fuorigioco nella scelta del ricevente)
   ROSSO  = __CPM_NO943 a 11 decisioni, cioe' la partita di ieri.
   Giudica DUE cose, e servono tutt'e due: (a) il verde sta sotto il tetto di voci fuori banda,
   (b) il verde e' STRETTAMENTE migliore del rosso. Senza (b) un tetto largo passerebbe anche se
   la modifica non servisse a niente; senza (a) basterebbe peggiorare il rosso.
   Campione: CPM_N (default 60). Le voci rare (rigori, espulsioni) a 60 partite sono 3-4 eventi in
   tutto e ballano di +/-1: il tetto ha il margine che serve, e la misura per decidere si fa a 200. */
import { execFileSync } from 'node:child_process';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const N = +(process.env.CPM_N || 60);
const TETTO = +(process.env.CPM_TETTO || 6);
function braccio(nome, env){
  const out = execFileSync(process.execPath, [path.join(QUI,'tabellino-vero.mjs')],
    { encoding:'utf8', env:{...process.env, CPM_PARTITE:String(N), ...env}, maxBuffer:8*1024*1024 });
  const m = out.match(/voci a zero[^:]*:\s*(\d+)\s*·\s*voci fuori dal doppio\/meta':\s*(\d+)/);
  if(!m) throw new Error(`il banco non ha stampato il verdetto per il braccio ${nome}`);
  return { zero:+m[1], fuori:+m[2] };
}
const verde = braccio('verde', { CPM_DEC:'22' });
const rosso = braccio('rosso', { CPM_DEC:'11', CPM_ROSSO:'__CPM_NO943' });
console.log(`\n=== BANDA DEL TABELLINO === ${N} partite per braccio`);
console.log(`  verde (22 dec/min + linea nella scelta): ${verde.fuori} voci fuori banda · ${verde.zero} a zero`);
console.log(`  rosso (11 dec/min, come ieri):           ${rosso.fuori} voci fuori banda · ${rosso.zero} a zero`);
const okTetto = verde.fuori <= TETTO;
const okMeglio = verde.fuori < rosso.fuori;
const okZero = verde.zero <= rosso.zero;
if(!okTetto) console.log(`  ✗ il verde sfora il tetto (${verde.fuori} > ${TETTO})`);
if(!okMeglio) console.log(`  ✗ il verde non batte il rosso (${verde.fuori} contro ${rosso.fuori})`);
if(!okZero) console.log(`  ✗ il verde ha piu' voci a zero del rosso (${verde.zero} contro ${rosso.zero})`);
const ok = okTetto && okMeglio && okZero;
console.log(ok ? '\n✅ PASS — il tabellino del motore sta nella banda e batte la partita di ieri'
               : '\n❌ FAIL — la banda del tabellino non regge');
process.exit(ok ? 0 : 1);
