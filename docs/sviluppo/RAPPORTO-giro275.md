# Rapporto giro 275 — playing-mdref (career-critical) nato nella 197

Ramo `sviluppo/giro275-playing-mdref` da `lavoro/197` a `a81ebb10`. Decisione PO-516 (18/11 14:10): un rosso nato nella 197 si ripara prima dell'uscita.

## Esito in breve

**Il gioco funziona; era la sonda a essere rimasta indietro.** Il pre-partita si apre, l'uscita invalida il riferimento e lo si riapre senza problemi. Il controllo `playing-mdref` non trovava più il pulsante «Gioca vs …» della Home, per via del nuovo disegno a due righe deciso dal PO in PO-514 (giro 263). Ho corretto solo la sonda, senza toccare nessun file `src/`, le soglie o `GAME_VERSION`.

## Commit che lo fa nascere

`8b08c2c1` — «giro 263 PO-514: i due pulsanti della scheda «Prossima» con la stessa misura».

Da quel commit il titolo del pulsante principale è diviso in due `<span>` a blocco: «⚽ Gioca» e «vs FC Madrid Este». Il `textContent` del pulsante li incolla e diventa «⚽ Giocavs FC Madrid Este». La sonda cercava `/Gioca vs/i` proprio sul `textContent`: il clic non partiva, il pre-partita non si apriva mai, e ne venivano fuori i tre rossi «(ROSSO) … lo scenario non è quello previsto», «(1) … sonda cieca» e «(3) REGRESSIONE …».

Misura sui due commit adiacenti (file di gioco del commit, sonda originale):

| build | playing-mdref |
|---|---|
| `8b08c2c1^` | verde |
| `8b08c2c1` | rosso 3 (gli stessi tre del V3b) |

Non ho fatto la bisezione completa: la misura diretta sui due commit adiacenti individua già il commit, e il testo del pulsante letto sulla 197 spiega il meccanismo.

## Correzione

`tests/visual/playing-mdref-test.mjs`, funzione `apriPrePartita`: ora la ricerca legge `x.innerText` (il testo come lo vede il giocatore, con un a capo fra i due blocchi) con la regex `/Gioca\s+vs/i`. Lo spazio fra «Gioca» e «vs» resta obbligatorio. Il resto della sonda non cambia: stessi cinque percorsi, stessi controlli e stesso braccio rosso `__CPM_NO_P0_3`.

## 196 / 197 prima / dopo

| controllo | 196 (3076a1b7) | 197 prima (a81ebb10) | 197 dopo (questo ramo) |
|---|---|---|---|
| playing-mdref, braccio verde | verde | **rosso 3** (sonda cieca) | verde (md11 aperta, invalidata all'uscita, riaperta md11) |
| playing-mdref, braccio rosso `__CPM_NO_P0_3` | difetto riprodotto | non giudicato (pre-partita mai aperto) | difetto riprodotto ✓ |
| sonda nuova sulla 196 | — | — | verde, rosso riprodotto |
| career-critical intera | verde 11/11 (dal V3b) | rosso al 3° passo, passi 4-11 mai girati | **verde 11/11, 2 volte di fila** (21:49-21:54 e 21:54-21:59) |
| test:logic | — | — | 51/51 |
| save-compat | — | — | 12 pass · 0 fail |

Guardiani mirati: nessuno. La MAPPA di `ci-runner.mjs` è indicizzata sui file `src/` e non ne ho toccato nessuno. Non ho eseguito `pulsanti-263` perché la Home non è cambiata.

## Dubbi per il PO

1. **Nome accessibile del pulsante.** Dal giro 263 il `textContent` (che è anche il nome letto da uno screen reader) del pulsante principale è «⚽ Giocavs FC Madrid Este», senza lo spazio. A schermo si legge bene, su due righe. Basterebbe uno spazio fra i due `<span>` o un `aria-label` col testo intero. Non l'ho corretto perché esce dall'ambito del giro (lotto 197 chiuso): resta una vostra decisione.
2. **`occasioni-dinamiche-test.mjs:28`** usa la stessa ricerca `/Gioca vs/` sul `textContent`, quindi sulla 197 rischia lo stesso cieco. Non l'ho misurato né corretto (fuori dall'ambito del giro). Va deciso se ripararlo nello stesso modo.
3. `double-tap-test.mjs` (righe 125/132) usa «Gioca vs» in un filtro di **esclusione** limitato al modal: è verde in tutte e due le passate, ma con il testo incollato l'esclusione del pulsante di Home non scatta più. Oggi è innocuo perché il filtro guarda solo dentro il modal. Lo segnalo, non l'ho toccato.
