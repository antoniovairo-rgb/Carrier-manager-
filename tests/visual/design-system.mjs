#!/usr/bin/env node
/* [C4 · GUARDIANO DEL SISTEMA GRAFICO] Statico, senza browser, un secondo.
   La diagnosi del 16/09 diceva che il design system esiste già completo e che il gioco lo usa nel 3,8 %
   dei casi. La 7.919 ha portato gli 871 corpi scritti a mano sotto il pavimento a zero: senza un guardiano,
   il primo `fontSize:10` scritto domani riapre il buco e nessuno se ne accorge finché il PO non fotografa.
   Qui si giudica ciò che è OGGETTIVO e non discutibile:
     1. nessun corpo tipografico scritto a mano SOTTO IL PAVIMENTO dichiarato (FS.caption = 11 px);
     2. nessun raggio scritto a mano che coincida con un token della scala (se il token esiste, si usa);
     3. i numeri di riferimento restano a verbale, così la prossima ondata si misura contro questi.
   Uscita ≠0 solo sulle due regole; il resto è censimento dichiarato. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');
const PAVIMENTO = 11;
const RAD = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 };
const file = fs.readdirSync(SRC).filter(f => f.endsWith('.jsx')).sort();
let sottoPavimento = [], raggiToken = [], corpi = 0, corpiToken = 0, raggi = 0, raggiTok = 0, colori = 0, coloriToken = 0;
for (const f of file) {
  const righe = fs.readFileSync(path.join(SRC, f), 'utf8').split('\n');
  righe.forEach((r, i) => {
    for (const m of r.matchAll(/fontSize:\s*(\d+(?:\.\d+)?)(?![0-9.])/g)) {
      corpi++; if (+m[1] < PAVIMENTO) sottoPavimento.push(`${f}:${i + 1} → fontSize:${m[1]}`);
    }
    corpiToken += (r.match(/fontSize:\s*FS\./g) || []).length;
    for (const m of r.matchAll(/borderRadius:\s*(\d+)(?![0-9])/g)) {
      raggi++; const v = +m[1];
      const t = Object.keys(RAD).find(k => RAD[k] === v);
      if (t) raggiToken.push(`${f}:${i + 1} → borderRadius:${v} (esiste RAD.${t})`);
    }
    raggiTok += (r.match(/borderRadius:\s*RAD\./g) || []).length;
    colori += (r.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
    coloriToken += (r.match(/\bTH\.[a-zA-Z0-9_]+/g) || []).length;
  });
}
const q = (a, b) => (a + b) > 0 ? (100 * a / (a + b)).toFixed(1) : '0.0';
console.log('=== C4 · IL SISTEMA GRAFICO È RISPETTATO? ===');
console.log(`  corpi tipografici:  ${corpiToken} dal sistema · ${corpi} scritti a mano  (${q(corpiToken, corpi)} % dal sistema)`);
console.log(`  raggi:              ${raggiTok} dal sistema · ${raggi} scritti a mano  (${q(raggiTok, raggi)} % dal sistema)`);
console.log(`  colori:             ${coloriToken} dal tema · ${colori} esadecimali a mano  (${q(coloriToken, colori)} % dal tema)`);
let male = 0;
if (sottoPavimento.length) { male++;
  console.log(`\n❌ ${sottoPavimento.length} corpi SOTTO IL PAVIMENTO di ${PAVIMENTO} px (FS.caption):`);
  sottoPavimento.slice(0, 20).forEach(r => console.log('   ' + r));
  if (sottoPavimento.length > 20) console.log(`   … e altri ${sottoPavimento.length - 20}`);
} else console.log(`\n✅ nessun corpo sotto il pavimento di ${PAVIMENTO} px`);
if (raggiToken.length) { male++;
  console.log(`\n❌ ${raggiToken.length} raggi scritti a mano che HANNO GIÀ un token:`);
  raggiToken.slice(0, 20).forEach(r => console.log('   ' + r));
  if (raggiToken.length > 20) console.log(`   … e altri ${raggiToken.length - 20}`);
} else console.log(`✅ nessun raggio scritto a mano che duplichi un token`);
console.log(male ? '\n❌ SISTEMA GRAFICO: regole violate' : '\n✅ SISTEMA GRAFICO OK');
process.exit(male ? 1 : 0);
