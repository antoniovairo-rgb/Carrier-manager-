# Rapporto giro 396 — rosso nuovo `gol-eroe-154` nel treno della 7.999.216

Ramo `sviluppo/giro396-gol-eroe`, base `lavoro/201` (872aba4e). GAME_VERSION, SAVE_VERSION e docs/governo non toccati.
Il gioco non è stato toccato: la causa è nel guardiano.

## Causa (misurata dal log)

Treno 45787013506, parte 01: `❌ gol-eroe-154: k7 verde: misura non valida (ended)`. Era l'unico errore: 9 partite valide su 10
(il minimo è 8) e tutte le altre condizioni erano verdi. Il guardiano però esce rosso a ogni partita non valida.

- k7 verde, primo tentativo: «misura incompleta — riprovo una volta» (il guardiano non stampa il motivo).
- k7 verde, secondo tentativo: `{"home":0,"away":0}` · `eroe fluido gol ?` · `scena gol undefined`. La partita è finita
  (`ended`), il risultato registrato e la pagella c'erano. Mancava solo `rec.log`.
- `rec.log` è `M._S._golLog`. Quel registro **nasce al primo gol** (src/14-motore-possesso.jsx:416, `case 'gol'`:
  `S._golLog=S._golLog||[]`). Su uno 0-0 non esiste. Il guardiano leggeva «registro assente» come «dato mancante», quindi
  dichiarava non valida una partita regolare.
- In locale k7 verde è finita 1-0 (valida, 385 s). L'esito della stessa partita cambia fra un'esecuzione e l'altra (l'autoplay
  dipende dai tempi), quindi lo 0-0 esce di rado e non si può ripetere a comando. Questo spiega perché il treno precedente e il
  treno grande della notte erano verdi.

**Verdetto: guardiano instabile, non un difetto del gioco.** Il tempo non c'entra: la partita era arrivata a `ended` in 266 s.

## Correzione (alla sorgente, nel guardiano)

`tests/visual/gol-eroe-154.mjs`, solo la lettura del registro dentro `gioca()`:
- registro assente **e** tabellone del motore (`_S.tab.home.gol + _S.tab.away.gol`) a 0 → registro vuoto `[]`: la partita è
  valida e si giudica;
- registro assente con gol sul tabellone → resta `null`, cioè «non valida», come prima;
- testimone `vuoto396`, stampato sulla riga della partita e contato nella riga VERDE («partite 0-0 senza registro»);
- rosso `CPM_NO_G396=1`: il comportamento di prima.

Nessuna soglia cambiata (NMIN, PMIN, fascia 0,2-1,2). Una partita «non giudicata» resta rossa.

## Prova

- `tests/visual/sonda-396.mjs` (sonda, nessuno script npm la nomina). Apre una partita vera e la legge a inizio gara, cioè
  motore vivo, tabellone 0-0 e registro assente: la condizione viene provocata, non attesa.
  - verde: `{"motore":true,"tab":[0,0],"haLog":false,"log":[]}`;
  - rosso: `log: null`;
  - con un gol finto nel registro (dichiarato) il registro viene letto così com'è. `✅ sonda-396 verde e rosso`.
- `node ci-runner.mjs giro gol-eroe-154` sulla punta corretta: **18/18 verdi**. Dentro: `gol-eroe-154` 4034 s (10+10 partite,
  verde e rosso) e le 17 sentinelle. In questa corsa non è uscito nessuno 0-0: lo 0-0 lo prova la sonda, non il campione.

## File toccati

- `tests/visual/gol-eroe-154.mjs`: `gioca()`, valutazione finale nella pagina (`zero396`, `log`, `vuoto396`), riga di stampa
  per partita e riga VERDE.
- `tests/visual/sonda-396.mjs`: nuova.
- `docs/sviluppo/RAPPORTO-giro396.md`: questo rapporto.

## Dubbi per il PO

1. **(consigliata, già applicata)** Uno 0-0 è una partita valida: un registro assente vale «nessun gol» solo se lo conferma il
   tabellone del motore. Il guardiano resta severo su ogni altro dato mancante.
2. Correggere il gioco invece del guardiano: creare `_golLog=[]` all'avvio del motore (src/14). È più pulito come dato, ma tocca
   il motore e quindi fa girare la catena completa. Il risultato è lo stesso.
3. Rendere tollerante il guardiano: rosso solo se le partite valide scendono sotto NMIN. È sconsigliato, perché nasconderebbe una
   partita non valida per altre cause («non giudicato» deve restare rosso).

Resta un'osservazione aperta: il guardiano non stampa perché è fallito il primo tentativo («misura incompleta»). Con ogni
probabilità era lo stesso 0-0 (stessa partita e stesso seme), ma **non posso confermarlo**: il log non lo dice.
