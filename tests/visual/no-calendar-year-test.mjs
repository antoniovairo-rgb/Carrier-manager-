#!/usr/bin/env node
/* [7.208.0 collaudo PO «rinnova fino al 2028 ma non mi torna con il numero di stagioni»] GUARDIANO STATICO
   anti-anno-di-calendario. Il gioco non ha anni: conta STAGIONI (S.1, S.2, …). Un anno cablato in un testo
   mostrato all'utente non combacia con nulla e invecchia male — è la seconda volta che ne sfugge uno (la
   7.35.1 aveva ripulito albo d'oro e record, questo era rimasto negli eventi del rivale).
   Il controllo è mirato ai POOL DI TESTO mostrati a schermo (voci con `txt:` o `t:"…"`), non a tutto il file:
   i dati storici non renderizzati e le costanti tecniche (versione dell'API, ecc.) restano legittimi. */
import fs from 'fs';

const SRC = new URL('../../CARRIER-MANAGER-AV.html', import.meta.url);
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const YEAR = /\b(19|20)\d{2}\b/;
const hits = [];
lines.forEach((ln, i) => {
  const n = i + 1;
  if (/^const GAME_VERSION=/.test(ln)) return;              // il changelog inline cita le versioni, non anni di gioco
  if (/anthropic-version|api\.anthropic|EURO_COMP_WINNERS/.test(ln)) return; // costanti tecniche / dati storici non renderizzati
  /* solo le voci di testo dei pool narrativi */
  const m = ln.match(/(?:txt:\s*[`"'][^`"']{0,300}|[,{]\s*t:\s*"[^"]{0,300})/g);
  if (!m) return;
  for (const frag of m) if (YEAR.test(frag)) hits.push(`riga ${n}: ${frag.trim().slice(0, 120)}`);
});
if (hits.length) {
  console.log('❌ FAIL — anni di calendario in testi mostrati all\'utente (il gioco conta STAGIONI):');
  hits.forEach(h => console.log('  ✗ ' + h));
  process.exit(1);
}
console.log(`righe analizzate: ${lines.length}`);
console.log('✅ NESSUN ANNO DI CALENDARIO nei pool di testo (scadenze e ricorrenze sono espresse in stagioni)');
