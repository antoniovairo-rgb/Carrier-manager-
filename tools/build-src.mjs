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

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC    = path.join(ROOT, 'src');
const TARGET = path.join(ROOT, 'CARRIER-MANAGER-AV.html');

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
