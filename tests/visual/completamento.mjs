/* [21/09 · richiesta PO «per ogni schermata mi serve la percentuale di completamento»]

   UNA PERCENTUALE È UNA CONVENZIONE, E QUINDI VA DICHIARATA. Qui non c'è nessun giudizio:
   si leggono i numeri già misurati dalla griglia mobile (`docs/collaudo-grafico/g0/dati.json`,
   412 px, la taglia del PO) e si combinano con una formula scritta, ripetibile e discutibile.

   100 punti così ripartiti:
     · 50 — I DIFETTI (12,5 ciascuno): overflow orizzontale · elementi fuori schermo ·
            testo sotto il pavimento di 11 px · contrasto sotto la soglia WCAG. Pieno se zero.
     · 30 — IL SISTEMA (10 ciascuno), contro il provino che il PO ha approvato:
            5 tinte di testo · 6 corpi · 3 raggi. Punteggio parziale = bersaglio / reso.
     · 10 — LA LUNGHEZZA: pieno fino a 2 schermate, poi 10 × (2 / schermate).
     · 10 — UNA SOLA AZIONE PRIMARIA: pieno con ≤ 1 bottone pieno di marca.

   COSA NON MISURA, e va detto ogni volta: la bellezza, la gerarchia, il telefono vero del PO,
   e le schermate che non sono ancora nel metro (post-partita, partita, cinematiche).

   Uso:  node completamento.mjs                                                            */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const F = path.join(ROOT, 'docs', 'collaudo-grafico', 'g0', 'dati.json');
if (!fs.existsSync(F)) { console.error('manca ' + F + ': prima gira `node griglia-mobile.mjs`'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(F, 'utf8'));

const NOMI = { home: 'Home fuori carriera', impostazioni: 'Impostazioni', creazione: 'Creazione', offerte: 'Offerte',
  dashboard: 'Dashboard', 'stagione-classifica': 'Classifica', 'stagione-calendario': 'Calendario',
  'stagione-coppe': 'Coppe', club: 'Club', 'carriera-profilo': 'Profilo', 'carriera-nazionale': 'Nazionale',
  agente: 'Affari', prepartita: 'Prepartita' };
const BERS = { tinte: 5, corpi: 6, raggi: 3 };   /* il provino approvato dal PO */
const SCHERMO = 915;

const righe = [];
for (const k of Object.keys(D.dati)) {
  const m = D.dati[k][412]; if (!m) continue;
  const pieno = (v) => v === 0 ? 12.5 : 0;
  const dif = pieno(m.overflowPx) + pieno(m.nFuori) + pieno(m.nSottoPav) + pieno(m.nSotto);
  const quota = (bersaglio, reso) => reso <= bersaglio ? 10 : 10 * (bersaglio / reso);
  const sis = quota(BERS.tinte, m.nColTesto) + quota(BERS.corpi, m.nCorpi) + quota(BERS.raggi, m.nRaggi);
  const sch = (m.altezzaPx || SCHERMO) / SCHERMO;
  const lun = sch <= 2 ? 10 : 10 * (2 / sch);
  const cta = (m.nMarca || 0) <= 1 ? 10 : 10 * (1 / m.nMarca);
  righe.push({ nome: NOMI[k] || k, dif, sis, lun, cta, tot: dif + sis + lun + cta,
    sch, tinte: m.nColTesto, corpi: m.nCorpi, raggi: m.nRaggi, marca: m.nMarca || 0 });
}
righe.sort((a, b) => b.tot - a.tot);

const p1 = (x) => x.toFixed(1).padStart(5);
console.log('\n=== PERCENTUALE DI COMPLETAMENTO, SCHERMATA PER SCHERMATA (412 px) ===');
console.log('formula dichiarata in testa al file · difetti 50 · sistema 30 · lunghezza 10 · una sola azione 10\n');
console.log('schermata             tot%   dif  sist  lung  azio |  schermate  tinte corpi raggi');
for (const r of righe) {
  console.log(`${r.nome.padEnd(20)} ${p1(r.tot)}  ${p1(r.dif)} ${p1(r.sis)} ${p1(r.lun)} ${p1(r.cta)} | ${r.sch.toFixed(2).padStart(9)}  ${String(r.tinte).padStart(5)} ${String(r.corpi).padStart(5)} ${String(r.raggi).padStart(5)}`);
}
const media = righe.reduce((s, r) => s + r.tot, 0) / righe.length;
console.log(`\nMEDIA delle ${righe.length} schermate nel metro: ${media.toFixed(1)} %`);
console.log('NON nel conto: post-partita, partita (HUD/telecronaca), schermate cinematiche, e l\'Android del PO.');
