#!/usr/bin/env node
/* ============================================================================
   build-src.mjs — RICOMPONE CARRIER-MANAGER-AV.html DAI FRAMMENTI DI src/

   Il gioco è un unico blocco <script> di ~41.100 righe in uno scope condiviso.
   Non serve un sistema di moduli: i frammenti di src/ sono TAGLI, non moduli, e
   questa build li riconcatena nell'ordine esatto. L'unica cosa che rimuove è
   l'intestazione di ogni frammento (tutto fino alla riga con la sentinella
   CMAV-SRC-HEADER-END, quella riga compresa). Nient'altro viene toccato: né uno
   spazio, né un a-capo, né l'ordine.

   PROVA DI CORRETTEZZA: il file ricomposto deve essere IDENTICO BYTE PER BYTE a
   quello versionato. La verifica sta in tools/check-src.mjs.

   Uso:
     node tools/build-src.mjs           scrive CARRIER-MANAGER-AV.html
     node tools/build-src.mjs --check   non scrive, riporta solo se cambierebbe
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC    = path.join(ROOT, 'src');
const TARGET = path.join(ROOT, 'CARRIER-MANAGER-AV.html');

/* ---------------------------------------------------------------------------
   IL BUILD SI RIFIUTA DI PARTIRE MENTRE UN RITUALE LO STA USANDO.

   La notte del 17/09 ho ricostruito il build DUE VOLTE mentre una catena di
   rituali girava sopra il file vecchio. La prima volta ho buttato gli esiti e
   rifatto la catena. La seconda no: ho creduto ai due rossi che ne sono usciti,
   ho REVOCATO una modifica buona e ho scritto al PO una spiegazione falsa,
   costruita sopra il rumore. Rimisurata pulita — un rituale alla volta, build
   fermo — la stessa modifica era verde: replay 1.439 ms con 4 eventi invece di
   13.796 con 1, validate-situations 0 failure con l'impronta della corsa pulita.

   La regola c'era gia', scritta in CLAUDE.md da me. Una regola che si puo'
   dimenticare non e' un metro: e' un promemoria. Qui diventa un metro.

   Chi ha davvero bisogno di forzare (per esempio per ricostruire dopo un
   container riavviato, con processi fantasma nella lista) passa CPM_FORZA_BUILD=1
   e se ne assume il verbale.
   --------------------------------------------------------------------------- */
function rituali_in_corsa(){
  if(process.env.CPM_FORZA_BUILD==='1')return [];
  /* [difetto della prima stesura, trovato usandola] la guardia serve a non CAMBIARE il file sotto i piedi
     di un rituale. `--check` e check-src.mjs non scrivono niente: bloccarli impediva di VERIFICARE, che e'
     l'opposto di cio' che serve — e mi ha impedito di controllare un build appena fatto. */
  if(process.argv.includes('--check'))return [];
  if(String(process.argv[1]||'').includes('check-src'))return [];
  try{
    /* MISURATO: npm lancia i rituali con il comando NUDO (`node run-replay.mjs`), senza percorso —
       cercare «tests/visual» dentro la riga di ps non trova niente, ed e' il motivo per cui la prima
       stesura di questa guardia non e' scattata quando l'ho provata. Quello che li identifica e' il
       CWD: un rituale gira sempre dentro tests/visual. */
    const out = execSync('ps -eo pid,args', {encoding:'utf8', stdio:['ignore','pipe','ignore']});
    const miei = [];
    for(const r of out.split('\n')){
      const m = r.trim().match(/^(\d+)\s+(.*)$/); if(!m) continue;
      const [ , pid, cmd ] = m;
      if(!/(^|\/)node\b/.test(cmd)) continue;
      if(/build-src|check-src/.test(cmd)) continue;
      let cwd = ''; try{ cwd = fs.readlinkSync('/proc/' + pid + '/cwd'); }catch(_e){ continue; }
      if(cwd.endsWith(path.join('tests','visual')) || cwd.includes(path.join('tests','visual') + path.sep))
        miei.push(pid + '  ' + cmd.slice(0, 120));
    }
    return miei;
  }catch(_e){ return []; }/* senza `ps` (ambiente minimo) non si blocca niente: meglio un build in piu' che un build impossibile */
}

{
  const vivi = rituali_in_corsa();
  if(vivi.length){
    console.error('\n⛔ BUILD RIFIUTATO — ci sono ' + vivi.length + ' rituali che stanno usando il build:');
    for(const v of vivi.slice(0,6)) console.error('   ' + v);
    console.error('\n   Ricostruire adesso significa cambiare il file sotto i loro piedi: i loro esiti');
    console.error('   non varrebbero niente, e un rosso finto costa piu\' di un rosso vero.');
    console.error('   Aspetta che finiscano, oppure fermali. Per forzare: CPM_FORZA_BUILD=1\n');
    process.exit(2);
  }
}

const SENTINEL = 'CMAV-SRC-HEADER-END';
const NAME_RE  = /^(\d{2})-[A-Za-z0-9._-]+\.(jsx|html)$/;

/** Elenca i frammenti in ordine, con i controlli di numerazione. */
export function listFragments() {
  if (!fs.existsSync(SRC)) throw new Error(`manca la cartella dei frammenti: ${SRC}`);

  const found = fs.readdirSync(SRC)
    .map(f => ({ file: f, m: NAME_RE.exec(f) }))
    .filter(x => x.m)
    .map(x => ({ file: x.file, n: Number(x.m[1]) }))
    .sort((a, b) => a.n - b.n || a.file.localeCompare(b.file));

  if (found.length === 0) throw new Error(`nessun frammento NN-nome.(jsx|html) in ${SRC}`);

  // La numerazione è l'ordine di concatenazione: deve essere 00,01,…,N-1 senza
  // buchi e senza doppioni, altrimenti l'ordine è ambiguo e la build va fermata.
  found.forEach((f, i) => {
    if (f.n !== i) {
      throw new Error(
        `numerazione dei frammenti rotta: atteso ${String(i).padStart(2, '0')}-…, trovato "${f.file}". ` +
        `I prefissi devono essere contigui da 00 (sono l'ordine di concatenazione).`
      );
    }
  });

  return found.map(f => f.file);
}

/** Toglie l'intestazione di un frammento restituendone il contenuto esatto. */
export function stripHeader(text, file) {
  const at = text.indexOf(SENTINEL);
  if (at === -1) {
    throw new Error(
      `il frammento "${file}" non ha l'intestazione: manca una riga con ${SENTINEL}. ` +
      `Ogni frammento deve dire cosa contiene e a quali righe dell'originale corrispondeva.`
    );
  }
  const nl = text.indexOf('\n', at);
  if (nl === -1) throw new Error(`il frammento "${file}" finisce sulla riga della sentinella: manca il contenuto.`);
  return text.slice(nl + 1);
}

/** Ricompone il file in memoria. Nessuna scrittura. */
export function compose() {
  const files = listFragments();
  let out = '';
  for (const file of files) {
    out += stripHeader(fs.readFileSync(path.join(SRC, file), 'utf8'), file);
  }
  return { text: out, files };
}

function main() {
  const dryRun = process.argv.includes('--check');
  let text, files;
  try {
    ({ text, files } = compose());
  } catch (e) {
    console.error(`✗ i frammenti di src/ non si possono ricomporre: ${e.message}`);
    process.exit(1);
  }

  const before = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : null;
  const same   = before === text;

  if (dryRun) {
    console.log(same
      ? `build-src --check: CARRIER-MANAGER-AV.html è già allineato ai ${files.length} frammenti.`
      : `build-src --check: CARRIER-MANAGER-AV.html DIFFERISCE dai frammenti (serve un rebuild).`);
    process.exit(same ? 0 : 1);
  }

  fs.writeFileSync(TARGET, text);
  const kb = (Buffer.byteLength(text, 'utf8') / 1024).toFixed(0);
  console.log(`CARRIER-MANAGER-AV.html ricomposto da ${files.length} frammenti — ${kb} KB, ${text.split('\n').length} righe.`);
  if (before !== null && !same) console.log('  (il contenuto è CAMBIATO rispetto a prima della build)');
  if (same) console.log('  (byte identici a prima: nessuna modifica nei frammenti)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
