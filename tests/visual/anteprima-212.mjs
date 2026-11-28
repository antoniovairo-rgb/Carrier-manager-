#!/usr/bin/env node
/* [7.999.134 PO-212 «nella preview di accettazione dell'offerta la posizione ed i punti erano diversi»] GUARDIANO.
   [giro 447 · PO-661] Esteso a TUTTI i casi della firma (sonda misura-447.mjs, stesso percorso vero: modale OFFERTA → testimone
   __CPM_ANTE212 → «Accetta» → classifica salvata): lega diversa e stessa lega, trasferimento e prestito, stagione a meta'
   (S5 sett. 20), inizio stagione (stesso salvataggio riportato alla settimana 1) e fine stagione (S12 sett. 38). Confronta la
   TABELLA INTERA (id:punti:giocate, nell'ordine) oltre a posizione e punti del club.
   VERDE: 8/8 casi identici. ROSSO 1 (__CPM_NO_ANTE212: l'anteprima della lega diversa torna alla classifica del mondo): il caso
   «altra-trasf-meta» deve differire. ROSSO 2 (__CPM_NO_G447: nella stessa lega la firma ricostruisce la classifica): i casi
   «stessa-*» devono differire. Nel verde anche il calendario del club nuovo (giornate passate) deve dire le stesse V/N/P della sua riga. Un caso non firmato o senza testimone e' «non giudicato» = rosso. Uso: node anteprima-212.mjs */
import { misura, CASI } from './misura-447.mjs';
const g = [];
const stampa = (t, r) => r.forEach(e => console.log(t + ' ' + JSON.stringify({ caso: e.caso, club: e.club, sett: e.sett, firmato: e.firmato, ante: e.ante, dopo: e.dopo, tab: e.tabUguale })));
const V = await misura(CASI, null); stampa('verde', V);
for (const e of V) {
  if (!e.firmato || !e.ante) g.push(`verde ${e.caso}: non giudicato (firmato=${e.firmato}, testimone=${!!e.ante})`);
  else if (!e.uguale) g.push(`verde ${e.caso}: anteprima ${JSON.stringify(e.ante)} ≠ dopo ${JSON.stringify(e.dopo)} (tabella uguale: ${e.tabUguale})`);
  if (!e.riga || !e.calendario || e.riga.g !== e.calendario.g || e.riga.v !== e.calendario.v || e.riga.n !== e.calendario.n) g.push(`verde ${e.caso}: calendario del club ${JSON.stringify(e.calendario)} ≠ sua riga in classifica ${JSON.stringify(e.riga)}`);
  if (e.caso.startsWith('altra') && e.ante && e.ante.fonte !== 'trasferimento') g.push(`verde ${e.caso}: fonte ${e.ante.fonte}, attesa «trasferimento»`);
}
const R1 = await misura(CASI.filter(k => k.id === 'altra-trasf-meta'), '__CPM_NO_ANTE212'); stampa('rosso212', R1);
for (const e of R1) if (!e.firmato || !e.ante || e.uguale) g.push(`rosso212 ${e.caso}: il difetto non si vede ${JSON.stringify({ f: e.firmato, a: e.ante, d: e.dopo })}`);
const R2 = await misura(CASI.filter(k => k.lega === 'stessa'), '__CPM_NO_G447'); stampa('rosso447', R2);
for (const e of R2) if (!e.firmato || !e.ante || e.uguale) g.push(`rosso447 ${e.caso}: il difetto non si vede ${JSON.stringify({ f: e.firmato, a: e.ante, d: e.dopo })}`);
if (g.length) { console.log('❌ anteprima-212'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ anteprima-212 verde ${V.length}/${V.length} casi identici (e i due rossi si vedono: ${R1.length} + ${R2.length} casi diversi)`);
