#!/usr/bin/env node
/* GENERA LA MAPPA DEL SORGENTE — `node tools/mappa.mjs > docs/MAPPA.md`
   Collaudo PO: «come mai ci mette tanto a riconoscere il tuo codice? non puoi crearti una mappa?».
   Il gioco e' un unico file da 40k+ righe: ogni ricerca partiva da grep esplorativi. Questa mappa si
   GENERA dal sorgente — scritta a mano si disallineerebbe alla prima release — ed elenca, con la riga:
   ref di stato, hook di collaudo, interruttori rossi, tabelle dati, funzioni. Rigenerare a ogni bump. */
import fs from 'node:fs';
const righe = fs.readFileSync('CARRIER-MANAGER-AV.html', 'utf8').split('\n');
const ver = ((righe.find(l => l.includes('const GAME_VERSION=')) || '').match(/"([\d.]+)"/) || [])[1] || '?';
const out = [];
const P = (s) => out.push(s);
P('# Mappa del sorgente — Korward Elite ' + ver + '\n');
P('_Generata da `tools/mappa.mjs` su ' + righe.length.toLocaleString('it') + ' righe._\n');
P('```\nnode tools/mappa.mjs > docs/MAPPA.md\n```\n');
function sez(titolo, nota, re, et) {
  const visti = new Map();
  for (let i = 0; i < righe.length; i++) {
    const m = righe[i].match(re);
    if (!m) continue;
    const k = et(m).slice(0, 160);
    if (!visti.has(k)) visti.set(k, i + 1);
  }
  if (!visti.size) return;
  P('## ' + titolo + '  (' + visti.size + ')\n');
  if (nota) P(nota + '\n');
  P('| riga | |');
  P('|---:|---|');
  for (const [k, n] of visti) P('| ' + n + ' | ' + k + ' |');
  P('');
}
sez('Stato della partita (useRef)',
  'Il cuore del motore: ogni ref e\' un pezzo di stato che sopravvive ai render.',
  /const (\w+Ref)\s*=\s*useRef\(([^)]{0,24})\)/,
  m => '`' + m[1] + '`' + (m[2] ? ' = ' + m[2] : ''));
sez('Hook di collaudo (window.__CPM_*)',
  'Letti dalle sonde in `tests/visual`. Espongono lo stato, non cambiano il gioco.',
  /window\.(__CPM_[A-Z0-9_]+)\s*=\s*(?:function|\(|\[|\{)/,
  m => '`' + m[1] + '`');
sez('Interruttori rossi (__CPM_NO*)',
  'Ogni rimedio ha il suo: acceso, il difetto torna.',
  /window\.(__CPM_NO\d+)/,
  m => '`' + m[1] + '`');
sez('Tabelle dati',
  'I repertori: righe di cronaca, moduli, situazioni, palette.',
  /^\s*const ([A-Z][A-Z0-9_]{3,})\s*=\s*[\[{]/,
  m => '`' + m[1] + '`');
sez('Funzioni di primo livello', null,
  /^(?:function (\w+)\s*\(|const (\w+)\s*=\s*(?:\([^)]{0,60}\)|\w+)\s*=>)/,
  m => '`' + (m[1] || m[2]) + '`');
console.log(out.join('\n'));
