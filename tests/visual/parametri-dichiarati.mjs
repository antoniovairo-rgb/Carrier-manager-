/* GUARDIANO: UNA FUNZIONE NON USA UN PARAMETRO CHE NON HA — statico, nessun browser, un secondo.
   Nato da un difetto mio della 7.948, gia' spedito: una sostituzione globale ha aggiunto `!senzaCorpi`
   a QUATTRO scene, ma solo tre avevano quel parametro. Nella quarta — il pullman scoperto —
   `senzaCorpi` era una variabile non dichiarata e la scena LANCIAVA all'avvio.
   Nessun guardiano se n'e' accorto perche' la parata non ne ha uno: vive dietro un titolo vinto, e per
   vederla servirebbe giocare una carriera intera. Questo controllo non ha bisogno di vederla.
   Non prova a fare l'analisi di tutto il file: guarda le bandiere di scena che il progetto usa per
   spegnere un pezzo (elenco esplicito), che sono esattamente quelle che si aggiungono con una
   sostituzione globale e ci si dimentica di dichiarare. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'src');
const BANDIERE = ['senzaCorpi'];
const guasti = [];
let funzioni = 0;
for (const f of fs.readdirSync(SRC).filter(x => /\.jsx$/.test(x))) {
  const testo = fs.readFileSync(path.join(SRC, f), 'utf8');
  const righe = testo.split('\n');
  /* i confini: da una `function NAME(` alla successiva in colonna 0 */
  const inizi = [];
  righe.forEach((r, i) => { if (/^function\s+[A-Za-z_$][\w$]*\s*\(/.test(r)) inizi.push(i); });
  for (let k = 0; k < inizi.length; k++) {
    const a = inizi[k], b = (k + 1 < inizi.length) ? inizi[k + 1] : righe.length;
    const firma = righe[a];
    const corpo = righe.slice(a + 1, b).join('\n');
    const nome = (firma.match(/^function\s+([A-Za-z_$][\w$]*)/) || [])[1] || '?';
    funzioni++;
    for (const flag of BANDIERE) {
      /* [difetto della prima stesura] `senzaCorpi={...}` e' un ATTRIBUTO JSX passato a un figlio, non una
         LETTURA: contarlo dava due falsi positivi (SeasonEndScreen e CareerApp, che la passano e basta).
         Una lettura vera non ha `=` subito dopo il nome. */
      const usata = new RegExp('(^|[^\\w$.])' + flag + '(?!\\s*=[^=])([^\\w$]|$)').test(corpo);
      const dichiarata = new RegExp('(^|[^\\w$.])' + flag + '([^\\w$]|$)').test(firma);
      if (usata && !dichiarata) guasti.push(`${f}:${a + 1} → ${nome}() usa \`${flag}\` ma non lo dichiara`);
    }
  }
}
console.log(`\n=== UNA FUNZIONE NON USA UN PARAMETRO CHE NON HA ===`);
console.log(`  funzioni esaminate: ${funzioni} · bandiere controllate: ${BANDIERE.join(', ')}`);
if (guasti.length) { console.log(`\n❌ ${guasti.length} punti:`); for (const g of guasti) console.log('   ' + g); }
console.log(guasti.length ? '\n❌ FAIL' : '\n✅ PASS — ogni scena che legge una bandiera la riceve come parametro');
process.exit(guasti.length ? 1 : 0);
