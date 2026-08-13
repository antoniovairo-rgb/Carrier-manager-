#!/usr/bin/env node
/* [collaudo PO «troppo presto, ha poche partite in primavera 2» + «troppo presto!» — due screenshot,
 *  S.1 W.4 e W.5, FC Calabro Primavera, 17 anni, quattro presenze]
 *
 * UN IMPULSO CHE PRESUPPONE UNA CARRIERA NON PUO' USCIRE A CHI NON CE L'HA ANCORA. Il ragazzo della
 * Primavera si vedeva offrire uno spot pubblicitario, un contratto di endorsement, un'auto in cambio di
 * post, una casa in citta' e una convocazione in Nazionale — alla quinta settimana della sua vita.
 *
 * La causa non era un evento sbagliato: era che SEI impulsi della famiglia commerciale non avevano
 * NESSUNA condizione, e quello della Nazionale ne aveva una che guardava l'eta' e i gettoni in Nazionale
 * ma mai se il ragazzo avesse giocato. Misurato prima del fix: 13 impulsi «da carriera avviata»
 * eleggibili per quel giocatore.
 *
 * Questo guardiano non gira nel browser: legge il pool dal sorgente e controlla due cose che sono fatti,
 * non opinioni — (A) ogni impulso il cui TESTO parla di contratti, marchi, soldi o Nazionale ha una
 * condizione; (B) le due regole condivise dicono di no al ragazzo e di si' al professionista.
 * La prova del rosso e' incorporata: se le regole condivise sparissero, (A) fallirebbe da sola.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(QUI, '..', '..', 'CARRIER-MANAGER-AV.html'), 'utf8');
const guasti = [];

/* ── il pool ── */
const body = src.slice(src.indexOf('const WEEKLY_IMPULSES=['));
const re = /\{id:"(wi_[a-z0-9_]+)"([\s\S]*?)txt:"([^"]{0,160})/g;
const voci = []; let m;
while ((m = re.exec(body)) && voci.length < 400) voci.push({ id: m[1], head: m[2], txt: m[3] });
console.log(`impulsi nel pool: ${voci.length}`);
if (voci.length < 80) guasti.push(`solo ${voci.length} impulsi estratti: il pool non e' stato letto (sonda cieca)`);

/* ── (A) chi parla di carriera deve avere una condizione ── */
const PRESUPPONE = /brand|spot pubblicitario|spot personale|sponsor|cachet|endorsement|testimonial|marchio|milion|nazionale|convocat|Champions|capitano|bandiera|procurator|copertina|documentario|autobiograf|fondazione|attico|auto di lusso|comprare casa|ristorante di lusso|socio in un/i;
const senzaCond = voci.filter(v => PRESUPPONE.test(v.txt) && !/cond:/.test(v.head));
console.log(`impulsi che presuppongono una carriera: ${voci.filter(v => PRESUPPONE.test(v.txt)).length} · senza alcuna condizione: ${senzaCond.length}`);
senzaCond.forEach(v => console.log(`   ✗ ${v.id} — ${v.txt.slice(0, 76)}`));
if (senzaCond.length) guasti.push(`${senzaCond.length} impulsi che presuppongono una carriera avviata NON hanno condizione: possono uscire a un ragazzo della Primavera alla prima settimana`);

/* ── (B) le due regole condivise: al ragazzo no, al professionista si' ── */
const leggi = (nome) => { const i = src.indexOf(`const ${nome}=`); if (i < 0) return null;
  /* si taglia solo il punto e virgola FINALE: i primi che si incontrano stanno dentro il try/catch */
  const fine = src.indexOf('\n', i); return src.slice(i, fine).replace(new RegExp(`^const ${nome}=`), '').replace(/;\s*$/, ''); };
const RAGAZZO = { proStatus: 'u18', age: 17, matches: 4, totalMatches: 4, popularity: 12, bank: 0, bankBalance: 0 };
const AFFERMATO = { proStatus: 'pro', age: 26, matches: 30, totalMatches: 120, popularity: 55, bank: 400000, bankBalance: 900000 };
const ESPLOSO = { proStatus: 'pro', age: 19, matches: 6, totalMatches: 6, popularity: 62, bank: 0, bankBalance: 20000 };
for (const [nome, atteso] of [['_brandOk453', { ragazzo: false, affermato: true, esploso: true }],
                              ['_notoOk453', { ragazzo: false, affermato: true, esploso: true }]]) {
  const s = leggi(nome);
  if (!s) { guasti.push(`la regola condivisa ${nome} non esiste piu': il fix e' stato rimosso`); continue; }
  let f; try { f = eval('(' + s + ')'); } catch (e) { guasti.push(`${nome} non e' valutabile: ${e.message}`); continue; }
  const r = { ragazzo: !!f(RAGAZZO), affermato: !!f(AFFERMATO), esploso: !!f(ESPLOSO) };
  console.log(`\n${nome}: ragazzo di Primavera ${r.ragazzo ? 'SI ✗' : 'no ✓'} · professionista affermato ${r.affermato ? 'si ✓' : 'NO ✗'} · giovane esploso ${r.esploso ? 'si ✓' : 'NO ✗'}`);
  for (const k of Object.keys(atteso)) if (r[k] !== atteso[k]) guasti.push(`${nome} risponde ${r[k]} a «${k}» invece di ${atteso[k]}`);
}

/* ── (C) la convocazione in Nazionale segue delle partite giocate ── */
const naz = voci.find(v => v.id === 'wi_nazionale_b');
if (!naz) guasti.push('wi_nazionale_b non trovato: sonda cieca');
else {
  const ok = /totalMatches\|\|p\.matches/.test(naz.head) || /matches\|\|0\)>=/.test(naz.head);
  console.log(`\nwi_nazionale_b guarda le partite giocate: ${ok ? 'si ✓' : 'NO ✗'}`);
  if (!ok) guasti.push('wi_nazionale_b non guarda le presenze: una convocazione puo\' arrivare a chi non ha mai giocato');
}

console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ IMPULSI NEL CONTESTO GIUSTO (nessuna offerta da professionista a un ragazzo della Primavera · le regole condivise reggono ai tre profili)');
process.exit(guasti.length ? 1 : 0);
