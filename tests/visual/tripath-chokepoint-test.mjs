#!/usr/bin/env node
// GUARDIANO TRI-PATH — congruenza/stabilità dei 3 percorsi di avanzamento settimana (accompagna 7.117.0).
//
// PERCHÉ: la classe di bug STAB (stabilizzazione 6.32→6.37, 17 bug) nasceva dalla FRAMMENTAZIONE
// dei 3 path che fanno avanzare la settimana — `simulateAndAdvance` (Simula), il career `onMatchEnd`
// (live) e `doAdvanceWeek` (Avanza). Una logica critica (economia settimanale, crescita/declino,
// relazioni staff, trigger tornei Nazionali) viveva in UN path e non negli altri → esiti divergenti
// a seconda di come l'utente risolveva la settimana. I chokepoint sono stati estratti in helper
// condivisi (`weeklyEconomyFields` · `weeklyGrowthFields` · `weeklyStaffRel` · `natTournamentPatch`/
// `applyNatTournamentTrigger`) e ogni path DELEGA. Nessun test finora asserisce STRUTTURALMENTE che
// tutti e 3 i path continuino a delegare a OGNI chokepoint: il gate visivo è cieco sulla carriera e
// career-sim-test usa `step()` che sceglie UN path per settimana (mai i 3 sulla stessa).
//
// COSA FA: legge CARRIER-MANAGER-AV.html, estrae il corpo di ciascuno dei 3 path (dalla firma nota
// fino al prossimo `const <fn>=` di pari indentazione) e asserisce che ognuno referenzi OGNI
// chokepoint condiviso. Se un futuro edit aggiunge un path/ramo che «dimentica» un chokepoint (la
// forma esatta di STAB-2/7/8), questo test FALLISCE. Puro node, nessun browser, ~istantaneo.
//
// Uso: node tripath-chokepoint-test.mjs   (exit 0 = OK, exit 1 = regressione strutturale)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.resolve(__dirname, '../../CARRIER-MANAGER-AV.html');
const src = fs.readFileSync(HTML, 'utf8');
const lines = src.split('\n');

// I 3 path d'avanzamento settimana della carriera, per firma UNIVOCA (2-space indent = livello CareerApp).
// ⚠️ `onMatchEnd=result=>` (career) e NON `onMatchEnd=r=>` (TrialFlow, che non fa avanzare la carriera).
const PATHS = [
  { name: 'simulateAndAdvance', start: /^  const simulateAndAdvance=\(\)=>\{/ },
  { name: 'onMatchEnd (career)', start: /^  const onMatchEnd=result=>\{/ },
  { name: 'doAdvanceWeek',       start: /^  const doAdvanceWeek=\(\)=>\{/ },
];

// Confine ROBUSTO: il corpo di un path va dalla sua firma alla firma della PROSSIMA funzione sorella
// di CareerApp (2-space indent). Usiamo un elenco di firme-sorella note e prendiamo la più vicina DOPO
// lo start → cattura il corpo INTERO (niente taglio anticipato su un `const` annidato) così un ramo
// senza chokepoint, ovunque nel path, viene comunque intercettato.
const SIBLING_SIGS = [
  /^  const simulateAndAdvance=/, /^  const onMatchEnd=result=>/, /^  const doAdvanceWeek=/,
  /^  const doRetire=/, /^  const doStartNewSeason=/, /^  const startNationalMatch=/,
  /^  const handleEnd=/, /^  const startMatch=/, /^  const liveCurrentWeek=/,
];

// Chokepoint condivisi che OGNI path deve applicare. Il trigger tornei Nazionali può comparire come
// `natTournamentPatch(...)` e/o `applyNatTournamentTrigger(...)` → basta uno dei due (sono la coppia
// puro-helper + attuatore).
const REQUIRED = [
  { label: 'economia settimanale', tokens: ['weeklyEconomyFields'] },
  { label: 'crescita/declino',      tokens: ['weeklyGrowthFields'] },
  { label: 'relazioni staff',       tokens: ['weeklyStaffRel'] },
  { label: 'trigger tornei Nazionali', tokens: ['natTournamentPatch', 'applyNatTournamentTrigger'] },
];

function findStart(re) {
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i;
  return -1;
}
function bodyOf(startIdx) {
  let end = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (SIBLING_SIGS.some(re => re.test(lines[i]))) { end = i; break; }
  }
  return { text: lines.slice(startIdx, end).join('\n'), startLine: startIdx + 1, endLine: end };
}

let failures = 0;
const report = [];
for (const p of PATHS) {
  const si = findStart(p.start);
  if (si < 0) { failures++; report.push(`❌ PATH NON TROVATO: ${p.name} (firma cambiata? aggiorna il test)`); continue; }
  const { text, startLine, endLine } = bodyOf(si);
  const missing = [];
  for (const req of REQUIRED) {
    const ok = req.tokens.some(t => text.includes(t));
    if (!ok) missing.push(req.label);
  }
  if (missing.length) {
    failures++;
    report.push(`❌ ${p.name} (righe ${startLine}-${endLine}): manca ${missing.join(', ')}`);
  } else {
    report.push(`✅ ${p.name} (righe ${startLine}-${endLine}): tutti i chokepoint presenti`);
  }
}

console.log('=== GUARDIANO TRI-PATH — chokepoint condivisi (economia/crescita/staff/tornei) ===');
report.forEach(r => console.log('  ' + r));
if (failures) {
  console.log(`\n❌ FAIL — ${failures} path incompleti. La classe STAB (frammentazione dei path) è RIAPERTA.`);
  console.log('   Ogni path che fa avanzare la settimana DEVE delegare a tutti i chokepoint condivisi.');
  process.exit(1);
}
console.log('\n✅ PASS — tutti e 3 i path delegano a ogni chokepoint condiviso (classe STAB chiusa).');
process.exit(0);
