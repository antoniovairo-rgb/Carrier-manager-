#!/usr/bin/env node
/* ============================================================================
   check-src.mjs — LA PROVA: il ricomposto è IDENTICO BYTE PER BYTE?

   Ricompone CARRIER-MANAGER-AV.html dai frammenti di src/ IN MEMORIA (non scrive
   nulla) e lo confronta byte per byte con il file versionato. Se differiscono di
   un solo byte, esce 1 e dice dove.

   Confronti:
     1. ricomposto  vs  CARRIER-MANAGER-AV.html sul disco   → BLOCCANTE
        È il file che il gioco carica e che tutto il resto del progetto legge:
        build di packaging, quality gate, sonde e il modello analitico
        tests/situations-3d-validation.js, che estrae blocchi di codice dal
        sorgente ancorandosi a righe specifiche. Se questo confronto passa,
        nulla di tutto quello si accorge che i frammenti esistono.
     2. disco  vs  git HEAD                                  → INFORMATIVO
        Dopo una modifica legittima ai frammenti + rebuild, HEAD è indietro per
        definizione: qui si segnala soltanto che c'è da committare.

   Uso: node tools/check-src.mjs        (esce 0 se identici, 1 se differiscono)
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compose } from './build-src.mjs';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(ROOT, 'CARRIER-MANAGER-AV.html');
const REL    = 'CARRIER-MANAGER-AV.html';

/** Primo byte diverso fra due buffer, con riga/colonna e contesto leggibile. */
function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;

  const head = a.subarray(0, i).toString('utf8');
  const line = head.split('\n').length;
  const col  = i - (head.lastIndexOf('\n') + 1) + 1;
  const peek = (buf) => JSON.stringify(buf.subarray(i, Math.min(i + 60, buf.length)).toString('utf8'));

  if (i === n) {
    return { line, col, why: a.length > b.length
      ? `il ricomposto ha ${a.length - b.length} byte IN PIÙ in coda`
      : `al ricomposto mancano ${b.length - a.length} byte in coda` };
  }
  return { line, col, why: `primo byte diverso all'offset ${i}\n     ricomposto: ${peek(a)}\n     atteso    : ${peek(b)}` };
}

let fail = false;

// ── 1. ricomposto vs file sul disco ─────────────────────────────────────────
let text, files;
try {
  ({ text, files } = compose());
} catch (e) {
  console.error(`✗ i frammenti di src/ non si possono ricomporre: ${e.message}`);
  process.exit(1);
}
const rebuilt = Buffer.from(text, 'utf8');

if (!fs.existsSync(TARGET)) {
  console.error(`✗ manca ${REL}: non c'è niente con cui confrontare.`);
  process.exit(1);
}
const onDisk = fs.readFileSync(TARGET);

console.log(`frammenti: ${files.length}  ·  ${REL}: ${onDisk.length} byte`);

if (rebuilt.equals(onDisk)) {
  console.log(`✓ IDENTICO BYTE PER BYTE — ${rebuilt.length} byte ricomposti da ${files.length} frammenti.`);
} else {
  fail = true;
  const d = firstDiff(rebuilt, onDisk);
  console.error(`✗ DIFFERISCONO — ricomposto ${rebuilt.length} byte, sul disco ${onDisk.length} byte`);
  console.error(`  riga ${d.line}, colonna ${d.col}: ${d.why}`);
  console.error(`  I frammenti e ${REL} non raccontano la stessa cosa.`);
  console.error(`  Se la fonte giusta sono i frammenti: node tools/build-src.mjs`);
  console.error(`  Se qualcuno ha modificato il file GENERATO: quella modifica va portata nel frammento`);
  console.error(`  che copre quella riga (l'intestazione di ogni frammento dice quali righe copre).`);
}

// ── 2. disco vs git HEAD (informativo) ──────────────────────────────────────
try {
  const inGit = execFileSync('git', ['show', `HEAD:${REL}`], { cwd: ROOT, maxBuffer: 1 << 28 });
  if (inGit.equals(onDisk)) {
    console.log(`✓ ${REL} è allineato al file in git (HEAD).`);
  } else {
    console.log(`· ${REL} differisce da git HEAD (${inGit.length} → ${onDisk.length} byte): c'è da committare.`);
  }
} catch {
  console.log(`· confronto con git HEAD saltato (git non disponibile o file non ancora versionato).`);
}

process.exit(fail ? 1 : 0);
