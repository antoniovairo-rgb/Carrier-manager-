# Rapporto giro 273: squalifica-222 (controllo nato rosso nella 197)

Ramo `sviluppo/giro273-squalifica`, partito da `lavoro/197` 7398dada. `GAME_VERSION` non toccato. Nessun file in `src/` toccato.

## In breve

- **Il gioco non è sbagliato. Il controllo leggeva il salvataggio dopo 900 ms fissi.** L'autosave ha un debounce di
  600 ms che riparte a ogni cambio di `player`. Nei bracci che passano dal prompt («Simula» vero), a volte si apre la
  finestra «momento di carriera» circa 450 ms dopo la simulazione. La copia delle finestre aperte (`scelte201`, giro 201)
  modifica `player`, il debounce riparte e il salvataggio arriva a circa 1060 ms. Così la lettura a 900 ms trovava ancora
  **la settimana precedente** (week vecchia, squalifica non scontata, storico vuoto). È la stessa causa che il giro 270 ha
  trovato in `infortunio-263`.
- **Nessun commit di lavoro/197 fa nascere il difetto.** Il ritardo si vede anche sulla 7.999.196 pubblicata (3076a1b7).
  Per questo non ho fatto il bisect (vedi la tabella).
- **Correzione nel controllo, secondo PROCESSO.md (regole PO-311).** Il controllo ora aspetta un evento invece di un
  tempo fisso: la settimana dello stato vivo deve essere cambiata e il salvataggio deve coincidere con lo stato vivo.
  Il confronto usa week, isSuspended, presenze stagione e carriera, gol, assist, lunghezza dello storico e ultima voce.
  Il tetto è di 10 s: se scade, il braccio è «non giudicato» ed esce rosso (regola 7). Nessuna soglia cambiata. La prova
  del rosso (`CPM_ROSSO=1` → `__CPM_NO_SQ222`) resta intatta. L'ultima riga stampata dice il braccio e i primi due
  difetti (regola 1).
- Nuova sonda `tests/visual/probe-squalifica-273.mjs`, che non è un guardiano. Rifà lo stesso flusso e stampa per ogni
  braccio quando arriva il salvataggio e quali campi di `player` cambiano dopo l'azione (`TRACCIA273`).

## Misure: «196 / 197 prima / dopo»

Chromium `/opt/pw-browsers/chromium`, un controllo alla volta, `CPM_CI_PAR=0`.

| | 7.999.196 (3076a1b7) | lavoro/197 prima (7398dada) | lavoro/197 dopo (da09c182) |
|---|---|---|---|
| Bracci con salvataggio oltre 900 ms (sonda) | **3 su 81** (3,7%): squalificato, non-convocato, sano-coppa | **11 su 144** (7,6%): non-convocato ×5, sano-coppa ×3, squalificato-coppa ×2, squalificato ×1 | stessa causa nel gioco (non toccato); il controllo non ne dipende più |
| Cambio che riarma il debounce | `scelte201` a 452-467 ms, chiavi `["settimana","momento"]` | `scelte201` a 451-467 ms, chiavi `["intervista","momento"]` | — |
| Salvataggio normale (bracci dal prompt) | 607-632 ms | 605-636 ms | — |
| squalifica-222, braccio verde | verde (sessione madre) | rosso 2 su 2 (sessione madre); qui 1 verde su 1 col controllo originale | **verde 3 su 3** di fila (55-57 s, uscita 0) |
| squalifica-222, braccio rosso (`CPM_ROSSO=1`) | — | rosso, 9 controlli falliti | **rosso, uscita 1**, stessi 9 controlli falliti del controllo originale (confronto riga per riga) |

Con questi campioni, 3/81 contro 11/144 non si distinguono dal caso, quindi non posso dire che la 197 lo renda più
frequente. Posso dire solo che il fenomeno c'è su tutte e due le versioni. I campioni della 196 vengono da 9 corse complete
della sonda, quelli della 197 da 16.

## Commit che lo fa nascere

Non c'è, nel tratto 3076a1b7..7398dada. Il meccanismo viene da due parti già presenti sulla 196: il debounce
dell'autosave (600 ms) e la copia `scelte201` delle finestre aperte (giro 201). Il «momento di carriera» che si apre a
circa 450 ms dalla simulazione non esce in tutti i bracci. Non ho misurato da cosa dipenda.

## Controlli eseguiti (dopo la correzione)

| Controllo | Esito | Durata |
|---|---|---|
| squalifica-222 verde ×3 | ✅ ✅ ✅ | 55 · 55 · 57 s |
| squalifica-222 rosso (`CPM_ROSSO=1`) | ✗ come deve (uscita 1, 9 falliti) | 56 s |
| infortunio-263 | ✅ | 80 s |
| coppa-prestito-245 | ✅ (verde e rosso) | 24 s |
| test:logic | ✅ | 2 s |
| save-compat | ✅ PASS | 1 s |

Non ho toccato `src/`, quindi la mappa mirata di `ci-runner.mjs` non aggiunge controlli, e non servono `build-src` e
`check-src`. `ci-runner.mjs` non è cambiato.

## Dubbi per il PO

1. **È un comportamento del gioco da tenere?** Dopo una simulazione, il salvataggio su disco può arrivare circa 1,1 s
   dopo invece di 0,6 s, quando si apre una finestra (momento di carriera). Il `pagehide` fa già un salvataggio
   immediato, quindi chiudendo l'app non si perde niente (codice di `src/18`, flush su pagehide; il caso «app chiusa in
   quel secondo» non l'ho misurato). Non l'ho cambiato: è una scelta di gioco, non del controllo.
2. **Gli altri controlli che leggono `cpm-v3` dopo un'attesa fissa.** Possono avere la stessa fragilità: due già trovati,
   `infortunio-263` (giro 270) e `squalifica-222` (questo giro). Non li ho censiti, perché la consegna limita il giro a
   questo controllo. Il PO decide se aprire un censimento: cercare `sleep(` seguito da una lettura di `localStorage` in
   `tests/visual`.
3. **Roadmap.** Non ho scritto una riga nel registro delle release, perché il giro non spedisce una versione e
   `GAME_VERSION` non è toccato. Se la riga del lotto 197 deve citare il giro 273, la scrive la sessione di rilascio.
