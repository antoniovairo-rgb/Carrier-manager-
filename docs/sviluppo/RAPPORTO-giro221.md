# Rapporto giro 221 — PO-480 (barra «Pressione» = timer vero) e PO-486 (segnale sui tasti spenti)

Ramo `sviluppo/giro221-barra-tasti`, partito da `lavoro/196` (= 7.999.195). `GAME_VERSION` non toccata (regola del giro: nel
file resta `7.999.195`; la consegna chiama il giro «versione 7.999.196», la porterà la sessione di rilascio).
Partenza dai dubbi aperti: giro 210 dubbio 3 (timer e barra non coincidono) e giro 213 dubbio 6 (i tasti spenti non dicono nulla).

---

## 1. Misura prima (braccio rosso `__CPM_NO_G221` = il gioco com'era)

Strumento: il guardiano nuovo `tests/visual/barra-221.mjs` (descritto al §3). Telefono 375×667 con tocco vero, GLB spento.
Il timer si misura **dal vero**: la sonda avvolge `setTimeout` e riconosce il timer dell'anticipo perché è quello dentro la cui
callback nasce l'evento `ActionTimeout`; la barra si legge con `getAnimations()` al primo fotogramma in `hl_choose`.

| livello (distanza marcatore) | timer misurato | barra della scheda delle giocate | scarto |
|---|---|---|---|
| lontano (85) | 16.000 ms | 9.000 ms | −7.000 ms |
| medio (40) | 12.000 ms | 6.000 ms | −6.000 ms |
| addosso (5) | 9.000 ms | 4.000 ms | −5.000 ms |

La barra si svuotava 4–6 s **prima** che il marcatore arrivasse, come scritto nel dubbio 3 del giro 210. La barra della scheda
del movimento in `hl_choose` (giro 210) usava la stessa formula vecchia (9/6/4 s), quindi lo stesso scarto.

Tasti spenti: prima di toccare il gioco ho verificato che un tocco su un `<button disabled>` arriva come `pointerdown` (dito e
mouse) ma **non** come `click` (Chromium del banco: `pointerdown`+`touchstart` sì, `click` no). Nel rosso il tocco su
«Simula — prima vivi la settimana» non produce nessuna animazione nel fotogramma dopo il tocco (telefono e PC).

Un'altra cosa trovata leggendo il codice (non era nella consegna, ma è la stessa domanda «barra = timer»): il timer prende la
durata **una volta**, all'ingresso in `hl_choose`, mentre le barre la ricalcolavano a ogni disegno da `defDist`; dal giro 210 sul
telefono il pad resta in `hl_choose` e una mossa alza `defDist` (+3..+20), quindi poteva far cambiare fascia alla barra mentre il
timer restava quello armato. La formula condivisa sotto chiude anche questo caso.

## 2. Correzioni

### A — PO-480: una sola formula (`src/15-live-match.jsx`)
- `durataEsitazione221(dd)` (funzione di modulo): `dd>60 → 16000 · dd>35 → 12000 · altrimenti 9000` — i valori del 7.916.
- `_durEsit221()` nel componente: la durata è **fissata** con la stessa chiave che riarma il timer (fase · scena · pausa), sul
  `defDist` di quell'istante. La leggono **il timer** dell'auto-anticipo (`baseDelay`), **la barra della scheda delle giocate**
  (`_dl905`) e **la barra della scheda del movimento** in `hl_choose` (`_dl210`).
- Rosso `window.__CPM_NO_G221`: timer com'era (stessa formula 16/12/9 su `defDistRef`), barre col vecchio 9/6/4.
- Gancio di prova (solo `?cpmtest=1`, nell'effetto dei gancetti esistente): `window.__CPM_DD221(v)` posa la distanza del
  marcatore per portare la scena in uno dei tre livelli.
- Fuori ambito, non toccato: i valori 16/12/9 (decisione 7.916), il conto alla ripresa dalla pausa (vedi dubbi), il timer stesso.

### B — PO-486: segnale sui tasti spenti (`src/19-app-root.jsx`, `src/00-head.html`, `src/18-career-app.jsx`)
- Nello strato `tocco213`, il `pointerdown` su un tasto spento (prima usciva subito) chiama `scuoti(el)`: mette
  `data-scuoti221` sulla scritta del motivo (`[data-motivo221]` dentro il tasto; se non c'è, sul tasto intero) **nello stesso
  evento**, così il fotogramma dopo il tocco la disegna già in movimento. L'attributo si toglie dopo 420 ms; un nuovo tocco
  riavvia l'animazione.
- CSS: `cpmScuoti221` 0,32 s, scuotimento orizzontale −4/+4/−3/+2 px con la proprietà `translate` (non `transform`, per non
  sovrascrivere trasformazioni di posizione — lezione del giro 213). Con `prefers-reduced-motion` solo `cpmLampo221`: la scritta
  prende per 0,4 s il colore oro dei token (`TINTE.oro`, passato come variabile CSS `--lampo221`, nessun colore scritto a mano).
- `data-motivo221` messo su «prima vivi la settimana» e sugli altri motivi di Simula (`simula-motivo`) e sul sottotitolo del tasto
  principale quando è spento (`avanza23`).
- La guardia contro il doppio tocco del giro 213 **non è toccata**: vive sul `click`, che su un tasto spento non arriva, e il
  ramo che la gestisce esce ancora per i tasti spenti come prima. `data-scuoti221` è nella lista degli attributi dello strato
  che l'osservatore della rotellina ignora.
- Rosso `window.__CPM_NO_G221`: nessun segnale (il resto dello strato 213 invariato).

## 3. Guardiano nuovo `barra-221` (verde + rosso nello stesso giro)

`npm run barra-221` (in `ci-runner.mjs`: catene **completa** e **carriera**, una volta ciascuna, verificato contando le voci;
`node --check` verde).
- **A**: tre livelli × due barre (scheda delle giocate da scena forzata in `hl_choose`; scheda del movimento dopo una mossa col
  pad, telefono). Giudizio |durata barra − durata misurata del timer| ≤ 300 ms. Il rosso deve essere bocciato nei tre livelli.
- **B**: tocco (telefono) e clic (PC) su «Simula — prima vivi la settimana», più telefono con moto ridotto. Giudizio: nel primo
  fotogramma dopo il `pointerdown` la scritta del motivo ha l'animazione giusta (keyframe con `translate`; col moto ridotto solo
  colore e nessun `translate`), e nessuna azione (settimana, `weekLived`, partite, testo della pagina invariati; nessun `click`
  al tasto; nessuna rotellina; contatore del doppio tocco invariato). Il rosso deve essere bocciato su telefono e PC.
- «Non giudicato» = rosso.

Esito sul build del commit (corsa unica, verde poi rosso):

| | verde | rosso `__CPM_NO_G221` |
|---|---|---|
| A scheda giocate lontano / medio / addosso | barra 16.000 / 12.000 / 9.000 ms = timer (scarto 0) | 9.000 / 6.000 / 4.000 contro 16/12/9 s → bocciato ×3 |
| A scheda movimento lontano / medio / addosso | 16.000 / 12.000 / 9.000 = timer (scarto 0, 0, −4 ms) | (non provata nel rosso: basta la prima barra) |
| B telefono | `cpmScuoti221` nel fotogramma dopo il tocco (16 ms), nessuna azione | nessun segnale → bocciato |
| B PC | `cpmScuoti221` (2 ms), nessuna azione | nessun segnale → bocciato |
| B telefono moto ridotto | `cpmLampo221`, solo colore | — |

## 4. Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m` e `df -h` prima)

CONTROLLI_QUI

## Dubbi per il PO

1. **La barra dopo una pausa.** Il timer, alla ripresa dalla pausa, riparte con il tempo **intero** (comportamento di sempre);
   la barra invece riparte da dove era (dal giro 210 conta il tempo dall'ingresso in `hl_choose`). Dopo una pausa quindi la
   barra si svuota prima del marcatore. Non l'ho toccato: va deciso se il timer deve riprendere dal tempo rimasto (più giusto)
   o la barra ripartire piena.
2. **Rientro nella stessa scena.** Nel primo livello misurato del verde la barra, pur lunga 16 s, si è svuotata 5,1 s prima
   dello scatto (solo nella prima prova della pagina; nelle altre cinque lo scarto è stato 36–169 ms). La mia ipotesi, **non
   verificata**: la prima scena forzata aveva lo stesso indice di una scena già passata da `hl_choose` su quella pagina, quindi
   la chiave del giro 210 non è cambiata e la barra è partita «già avanti». Nella partita vera l'indice cambia a ogni highlight; può succedere con «rivedi» o una catena
   che torna sulla stessa scena? Non l'ho verificato. Il guardiano giudica la durata (come da consegna) e stampa questo scarto.
3. **Ampiezza e durata della vibrazione** (4 px, 0,32 s) e **colore del lampo** col moto ridotto (oro dei token) sono scelte
   mie; vanno guardate sul telefono.
4. **Vibrazione del telefono** (`navigator.vibrate`): non aggiunta; la consegna parla di scuotimento della scritta.
5. **Quali tasti spenti hanno una «scritta del motivo»**: l'ho marcata su Simula e sul tasto principale della settimana. Ogni
   altro tasto spento del gioco vibra per intero (ripiego). Se il PO vuole la regola solo dove c'è un motivo scritto, va detto.
6. Roadmap: questo giro non è un rilascio e non ho scritto righe in `docs/governo/ROADMAP.md`.
