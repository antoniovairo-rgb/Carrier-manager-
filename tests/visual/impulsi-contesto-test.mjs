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

/* ── (B-bis) le DOMANDE DELLA STAMPA: stesso principio, altro pool ──
   [collaudo PO «troppo presto!», terza volta] Alla decima settimana di un ragazzo di Primavera 2 il
   giornalista chiedeva delle «voci di mercato sul suo conto». Il meccanismo per filtrare le domande
   esiste dal 6.97.0; queste tre non lo usavano. */
{
  const qi = src.indexOf('const INTERVIEW_QS=[');
  const qbody = src.slice(qi, src.indexOf('\n];', qi));
  const qre = /\{ctx:\[([^\]]*)\],([^\n]*?)q:"([^"]{0,150})/g;
  const dom = []; let q;
  while ((q = qre.exec(qbody))) dom.push({ ctx: q[1].replace(/"/g, ''), head: q[2], q: q[3] });
  const STATUS = /voci di mercato|giocatore importante|punto di riferimento nello spogliatoio/i;
  const scoperte = dom.filter(d => STATUS.test(d.q) && !/cond:/.test(d.head));
  console.log(`\ndomande d'intervista nel pool: ${dom.length} · che danno per scontato uno status, senza condizione: ${scoperte.length}`);
  scoperte.forEach(d => console.log(`   ✗ [${d.ctx}] ${d.q.slice(0, 78)}`));
  if (dom.length < 150) guasti.push(`solo ${dom.length} domande estratte: il pool delle interviste non e' stato letto (sonda cieca)`);
  if (scoperte.length) guasti.push(`${scoperte.length} domande della stampa danno per scontato uno status senza condizione: possono essere poste a un ragazzo della Primavera`);

  const s3 = leggi('_statusOk453');
  if (!s3) guasti.push("la regola condivisa _statusOk453 non esiste piu': il fix e' stato rimosso");
  else { let f; try { f = eval('(' + s3 + ')'); } catch (e) { guasti.push(`_statusOk453 non e' valutabile: ${e.message}`); }
    if (f) { const r = { ragazzo: !!f(RAGAZZO), affermato: !!f(AFFERMATO), esploso: !!f(ESPLOSO) };
      console.log(`_statusOk453: ragazzo di Primavera ${r.ragazzo ? 'SI ✗' : 'no ✓'} · professionista affermato ${r.affermato ? 'si ✓' : 'NO ✗'} · giovane esploso ${r.esploso ? 'si ✓' : 'no (giusto: il peso nello spogliatoio si guadagna)'}`);
      if (r.ragazzo) guasti.push('_statusOk453 considera «importante» un ragazzo di Primavera');
      if (!r.affermato) guasti.push('_statusOk453 esclude un professionista affermato: la domanda non uscirebbe mai'); } }
}

/* ── (B-ter) [7.999.77] «PRIMA vittoria in CASA»: 3-0 in trasferta e la stampa chiedeva della prima casalinga ──
   Ogni domanda post-gara che nomina il luogo o una «prima» volta deve avere una condizione; la regola
   _primaCasa77 deve dire no in trasferta, no se il calendario ha gia' una vittoria in casa, si' altrimenti.
   Rosso: CPM_ROSSO77=1 simula window.__CPM_NO_CASA77 (la regola torna cieca al calendario). */
{
  const qi = src.indexOf('const INTERVIEW_QS=[');
  const qbody = src.slice(qi, src.indexOf('\n];', qi));
  const qre = /\{ctx:\[([^\]]*)\],([^\n]*?)q:"([^"]{0,150})/g;
  const dom = []; let q;
  while ((q = qre.exec(qbody))) dom.push({ ctx: q[1].replace(/"/g, ''), head: q[2], q: q[3] });
  const LUOGO = /in casa|casalinga|casalingo|trasferta|prima vittoria/i;
  const scoperte = dom.filter(d => /win|loss|draw/.test(d.ctx) && LUOGO.test(d.q) && !/cond:/.test(d.head));
  console.log(`\ndomande post-gara che nominano luogo o «prima vittoria» senza condizione: ${scoperte.length}`);
  scoperte.forEach(d => console.log(`   ✗ [${d.ctx}] ${d.q.slice(0, 78)}`));
  if (scoperte.length) guasti.push(`${scoperte.length} domande post-gara nominano il luogo senza condizione`);
  const i0 = src.indexOf('const _primaCasa77=');
  if (i0 < 0) guasti.push("la regola _primaCasa77 non esiste piu'");
  else {
    const txt = src.slice(i0, src.indexOf('};\n', i0) + 1).replace(/^const _primaCasa77=/, '');
    const window = process.env.CPM_ROSSO77 ? { __CPM_NO_CASA77: 1 } : {};
    let f; try { f = eval('(' + txt + ')'); } catch (e) { guasti.push(`_primaCasa77 non valutabile: ${e.message}`); }
    if (f) {
      const cal = (vinta) => [{ week: 3, played: true, isHome: true, result: { won: vinta } }, { week: 5, played: true, isHome: false, result: { won: true } }];
      const casi = [
        ['trasferta (il caso del PO)', { week: 9, calendar: [] }, { isHome: false }, false],
        ['casa, gia\' vinta in casa alla 3a', { week: 9, calendar: cal(true) }, { isHome: true }, false],
        ['casa, nessuna vittoria in casa prima', { week: 9, calendar: cal(false) }, { isHome: true }, true],
      ];
      for (const [nome, p, v, atteso] of casi) { const r = !!f(p, v);
        console.log(`_primaCasa77 ${nome}: ${r ? 'si' : 'no'} ${r === atteso ? '✓' : '✗'}`);
        if (r !== atteso) guasti.push(`_primaCasa77 sbaglia «${nome}»: ${r} invece di ${atteso}`); }
    }
  }
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
