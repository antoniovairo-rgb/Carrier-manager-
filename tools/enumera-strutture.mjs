/* L2 — ENUMERATORE DEL GRAFO DELLE STRUTTURE (docs/MODULI-AZIONI-SALIENTI.md)
   Conta le catene VALIDE di moduli (2-5 moduli, dall'innesco a una finalizzazione/esito),
   seguendo ESATTAMENTE gli SBOCCHI dichiarati scheda per scheda. Il numero che stampa e'
   il «quante azioni realmente diverse» del criterio PO — misurato, non a naso.
   Il moltiplicatore corsie (x2) vale per le strutture che attraversano un modulo di fascia. */

const EDGES = {
  C1:['C3','C5','C6','A4'], C2:['A4','F1','F7','T6'], C3:['C4','C5','A3','A4'],
  C4:['F2','F1','F4','F8'], C5:['A1','A3','A5','Z1'], C6:['F1','F3','F8','D6'],
  C7:['C1','C3','C4'],      C8:['A3','A7','C4'],
  A1:['Z2','Z4','D7','A8'], A2:['A7','Z1','Z2','F4'], A3:['A7','Z1','Z4','D1'],
  A4:['A6','D6','A8'],      A5:['Z3','Z6','D7'],      A6:['Z2','A8','D4'],
  A7:['Z4','Z6','D7'],      A8:['Z4','Z6','Z3'],
  F1:['F4','F5','F6'],      F2:['D1','D2'],           F3:['F4','F6'],
  F6:['Z2','Z3'],           F7:['F1','F2','F4'],      F8:['Z1','A1','F1'],
  T1:['D4'],                T2:['Z1','Z2','A1'],      T3:['A2','A7','F7'],
  T4:['T1','A2','F4'],      T6:['A7','Z4','F4'],      T7:['T1','A2','F4'],
  D1:['Z4','F4','F6','A1'], D3:['T3'],                D4:['Z4','Z6'],
  D5:['Z5','A6','Z7'],      D6:['A6','C7','D7'],      D7:['P1','P2','P3','P8'],
  P3:['D5'],                P4:['F4','F5','F6'],      P5:['D5'],
  P6:['Z1'],                P7:['Z6','D8','D7'],
  Z7:['Z2','Z6','P7'],      Z8:['Z7'],                Z9:['P4','P5','P6','T7'],
};
const START = ['C1','C2','C3','C4','C5','C6','C7','C8','T1','T2','T3','T4','T6','T7','P1','P2','P3','P4','P5','P6','P8'];
const TERMINAL = new Set(['Z1','Z2','Z3','Z4','Z5','Z6','Z10','F4','F5','T5','D2','D8','P1','P2','P8']);
const FASCIA = /^(F|C4|C6)/;

const MIN = 2, MAX = 5;
let strutture = 0, conCorsia = 0;
const perLunghezza = {}, perInnesco = {};
const walk = (node, path) => {
  const isTerm = TERMINAL.has(node);
  if (isTerm && path.length >= MIN) {
    strutture++;
    perLunghezza[path.length] = (perLunghezza[path.length] || 0) + 1;
    perInnesco[path[0]] = (perInnesco[path[0]] || 0) + 1;
    if (path.some(n => FASCIA.test(n))) conCorsia++;
  }
  if (path.length >= MAX) return;
  for (const next of (EDGES[node] || [])) {
    if (path.includes(next)) continue; // niente cicli dentro un'azione
    walk(next, [...path, next]);
  }
};
for (const s of START) walk(s, [s]);

const effettive = strutture + conCorsia; // le strutture di fascia contano x2 (sx/dx speculari)
console.log(`strutture valide (catene ${MIN}-${MAX} moduli, innesco→esito): ${strutture}`);
console.log(`  di cui attraversano una fascia (x2 corsie): ${conCorsia}`);
console.log(`  TOTALE EFFETTIVO con corsie speculari: ${effettive}`);
console.log(`  per lunghezza: ${JSON.stringify(perLunghezza)}`);
const top = Object.entries(perInnesco).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log(`  inneschi piu' fertili: ${top.map(([k, v]) => k + ':' + v).join(' · ')}`);
console.log(`  (le VARIANTI di beat/finale dentro ogni scheda e i branch degli esiti moltiplicano oltre — qui si contano solo le SEQUENZE di moduli, la firma anti-deja-vu)`);
