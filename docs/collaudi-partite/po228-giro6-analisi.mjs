/* PO-228 giro 6 — analisi dei dati grezzi po228-giro6-{a,b}.jsonl (nessuna lettura dal gioco).
   Regola di lettura, verificata sui dati: in ogni riga «etichetta» il valore PRIMA è il lato sinistro, quello DOPO il destro.
   Orientamento: all'86' il lato sinistro della tabella è la squadra che la barra in alto mette a sinistra (TYN nei sei giri);
   nel tabellino finale il lato sinistro è FC Merseyside. Non si assume: si sceglie l'orientamento che rispetta la
   monotonia (un contatore a fine partita non può essere MINORE che all'86'). Uso: node po228-giro6-analisi.mjs */
import fs from 'node:fs';
const D = new URL('.', import.meta.url).pathname;
const righe = [];
for (const f of ['po228-giro6-a.jsonl', 'po228-giro6-b.jsonl']) {
  if (!fs.existsSync(D + f)) continue;
  for (const l of fs.readFileSync(D + f, 'utf8').trim().split('\n')) if (l.trim()) righe.push(JSON.parse(l));
}
const NUM = /^-?\d+(\.\d+)?%?$/;
const LAB = /^[A-Za-zÀ-ÿ' ]{3,}$/;
function coppie(testo) { // {etichetta(lower): {sx, dx}} dal blocco tabella
  const T = testo.split('\n').map(s => s.trim()).filter(Boolean); const out = {};
  for (let j = 1; j + 1 < T.length; j++) if (LAB.test(T[j]) && NUM.test(T[j - 1]) && NUM.test(T[j + 1]) && !out[T[j].toLowerCase()]) out[T[j].toLowerCase()] = { sx: T[j - 1], dx: T[j + 1] };
  return out;
}
const n = (s) => parseFloat(String(s).replace('%', '').replace(',', '.'));
const orient = { passaggi: 'passaggi', cross: 'cross' };
const rows = [];
let tuttiMon = { ok: 0, ko: 0 };
for (const o of righe) {
  const L = o.lettura86 || {};
  const c86 = coppie(L.tab || ''); // sx = prima squadra della barra (TYN nei sei giri)
  const i0 = o.tabellinoFine ? o.tabellinoFine.indexOf('IL TUO TABELLINO') : -1;
  const fin = coppie(i0 > 0 ? o.tabellinoFine.slice(0, i0) : (o.tabellinoFine || '')); // sx = FC Merseyside
  // Due ipotesi di abbinamento. H0: Merseyside (MER) = lato SINISTRO all'86'. H1: MER = lato DESTRO all'86'.
  // Un contatore non scende: in ciascuna riga-conteggio il valore di fine partita deve essere >= quello dell'86' per la STESSA squadra.
  const conta = Object.keys(c86).filter(k => !/%/.test(c86[k].sx) && !/%/.test(c86[k].dx) && fin[k]);
  const monotona = (H) => conta.every(k => {
    const merA = H === 0 ? c86[k].sx : c86[k].dx, tynA = H === 0 ? c86[k].dx : c86[k].sx;
    return n(fin[k].sx) >= n(merA) && n(fin[k].dx) >= n(tynA);
  });
  const h0 = monotona(0), h1 = monotona(1);
  const H = h0 && !h1 ? 0 : (h1 && !h0 ? 1 : null);
  if (H !== null) tuttiMon.ok++; else tuttiMon.ko++;
  const mer86 = (k) => H === 1 ? c86[k]?.dx : c86[k]?.sx;
  const tyn86 = (k) => H === 1 ? c86[k]?.sx : c86[k]?.dx;
  rows.push({ k: o.k, score86: L.score ? `${L.score.home}-${L.score.away}` : '—', min: L.min, phase: L.phase,
    orient: H === null ? 'NON DECIDIBILE' : (H === 1 ? 'H1 MER a destra' : 'H0 MER a sinistra'),
    passMER86: mer86('passaggi'), passTYN86: tyn86('passaggi'), passMERfin: fin.passaggi?.sx, passTYNfin: fin.passaggi?.dx,
    crossMER86: mer86('cross'), crossTYN86: tyn86('cross'), crossMERfin: fin.cross?.sx, crossTYNfin: fin.cross?.dx,
    tiriFin: fin.tiri ? `${fin.tiri.sx}-${fin.tiri.dx}` : null, possFin: fin.possesso ? `${fin.possesso.sx}-${fin.possesso.dx}` : null, tabNum: conta.length });
}
console.table(rows);
console.log('orientamento: rispettato su', tuttiMon.ok, 'partite, indecidibile su', tuttiMon.ko);
fs.writeFileSync(D + 'po228-giro6-aggregato.json', JSON.stringify({ righe: rows, orientamentoOk: tuttiMon.ok, indecidibili: tuttiMon.ko }, null, 1));
