#!/usr/bin/env node
/* [7.263.0 collaudo PO «FC Hornets con lo stemma WAT»] GUARDIANO — la SIGLA deve derivare dal NOME MOSTRATO.
   La bonifica copyright (5.96.0) rinominò i club ma lasciò le sigle del mondo reale: «FC Islington» con
   stemma ARS, «FC Stamford» con CHE, «FC Hornets» con WAT. Oltre all'incoerenza visibile su ogni tabellone,
   e' un residuo di de-branding che audit-copyright non vede (scansiona i nomi, non le sigle).
   Regola asserita: la sigla non deve codificare il club REALE (cioe' l'id, che nel DB e' il nome vero)
   quando NON e' derivabile dal nome di fantasia. Piu': 3 lettere, e nessun duplicato NUOVO.
   Uso: node club-abbr-coherence-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const clubs = [];
const RX = /mkT\("([^"]+)","([^"]+)","([^"]+)",/g;
let m; while ((m = RX.exec(src))) clubs.push({ id: m[1], name: m[2], abbr: m[3] });

const norm = x => x.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z]/g, '');
const wordsOf = n => n.split(/\s+/).filter(x => !/^(FC|AC|SC|AS|SS|CF|CD|U18)$/i.test(x));
const issues = [];

// ───── (1) nessuna sigla deve codificare il club REALE senza essere derivabile dal nome mostrato
const leftovers = clubs.filter(c => {
  const A = norm(c.abbr), I = norm(c.id), W = wordsOf(c.name);
  const fromName = W.some(x => norm(x).startsWith(A)) || A === norm(W.map(x => x[0] || '').join('')) || norm(W.join('')).includes(A);
  return (I.startsWith(A) || A.startsWith(I)) && !fromName;
});
console.log(`(1) club: ${clubs.length} · sigle che codificano il club reale invece del nome mostrato: ${leftovers.length}`);
leftovers.slice(0, 10).forEach(c => console.log(`    ${c.id.padEnd(8)} "${c.name}" → ${c.abbr}`));
if (leftovers.length) issues.push(`${leftovers.length} sigle sono residui di de-branding (codificano il club reale, non il nome mostrato)`);

// ───── (2) formato: 2-4 lettere maiuscole
const badFmt = clubs.filter(c => !/^[A-Z0-9]{2,4}$/.test(c.abbr));
console.log(`(2) formato sigla (2-4 maiuscole): ${badFmt.length} fuori formato`, badFmt.map(c => c.name + '→' + c.abbr).join(' ') || '');
if (badFmt.length) issues.push(`${badFmt.length} sigle fuori formato`);

// ───── (3) duplicati: sono ammessi SOLO quelli storici tra nazioni diverse (audit 7.8.2), mai nuovi
const ALLOWED_DUP = new Set(['VAL', 'MOR', 'EST', 'ASC', 'BRS']);
const byAbbr = {}; clubs.forEach(c => (byAbbr[c.abbr] = byAbbr[c.abbr] || []).push(c.name));
const dups = Object.entries(byAbbr).filter(([, v]) => v.length > 1);
const newDups = dups.filter(([k]) => !ALLOWED_DUP.has(k));
console.log(`(3) duplicati: ${dups.length} totali (${dups.map(([k, v]) => k + '×' + v.length).join(' ')}) · non previsti: ${newDups.length}`);
if (newDups.length) issues.push(`sigle duplicate NUOVE: ${newDups.map(([k, v]) => k + ' (' + v.join(' / ') + ')').join(' · ')}`);

// ───── (4) la migrazione deve risincronizzare la sigla anche nella CLASSIFICA salvata
if (!/newP\.standings[\s\S]{0,400}_syncClub70/.test(src)) issues.push('la migrazione non risincronizza le sigle nella classifica salvata: i save in corso mostrerebbero quelle vecchie');
else console.log('(4) migrazione — la classifica salvata viene risincronizzata per id: sì');

if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — ogni sigla deriva dal nome mostrato, nessun residuo del mondo reale');
