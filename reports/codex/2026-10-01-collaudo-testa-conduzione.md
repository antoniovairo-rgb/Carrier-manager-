# Collaudo testa e conduzione — rapporto parziale

**Stato: non completo.** Base registrata nel grezzo: commit `2208f4cb707d42bd25854ab710584e5c8f79f4fa`, `GAME_VERSION=7.999.103`. Ramo `codex/2026-10-01-collaudo-testa-conduzione`. Non sono state modificate le sorgenti del gioco. Il comando di acquisizione registrato è `node tests/codex/collaudo-testa-conduzione.mjs`; per ricavare le misure qui sotto dal grezzo compresso: `node tests/codex/testa-conduzione-analisi.mjs`. Le misure complete di ogni caso stanno in `tests/codex/collaudo-testa-conduzione.json.gz` e `reports/codex/2026-10-02-testa-conduzione-misure.json`.

Sono presenti 16 tentativi nel grezzo: 13 validi con metodo 2 (12 colpi di testa, 1 azione etichettata dribbling), 2 tentativi precedenti non utilizzabili e un tentativo senza azione di testa alla scena 39. Per ciascuno dei 13, il banco ha salvato esattamente un evento `ActionResolved` con `gi` ed esito coerenti; lo verifica in `tests/codex/collaudo-testa-conduzione.mjs` prima di assegnare `valid=true`. La maggior parte delle scene ha **una sola ripetizione success**; il campione richiesto era tre ripetizioni per entrambi gli esiti e tutte le azioni pertinenti. Nessun verdetto globale di chiusura per PO-077 o PO-079.

## PO-077 — colpo di testa

La distanza è quella tra pallone e testa nel minimo registrato dal testimone; la sincronia è il distacco tra minimo e picco dello stacco. `>2u` conta passi tra campioni esterni a 50 ms, non dimostra da solo un teletrasporto. I rallentamenti sotto il 30% non compaiono nei dodici casi misurati, ma il campione non copre tutti gli esiti.

| Scena | Casi validi | Minimo pallone–testa (u) | Sincronia (ms) | Rapporto velocità dopo/prima | Passi >2u |
| --- | ---: | --- | --- | --- | --- |
| 6 | 4 (3 success, 1 fail) | 0,04 in tutti | 0 in tutti | 1,38–2,56 | 23–26 |
| 7 | 1 success | 0,047 | 0 | 1,61 | 13 |
| 39 | 0 | non misurabile: nessuna azione di testa trovata | — | — | — |
| 55 | 1 success | 0,043 | 0 | 0,99 | 9 |
| 64 | 1 success | 0,048 | 0 | 1,55 | 12 |
| 86 | 1 success | 0,056 | 0 | 1,83 | 7 |
| 90 | 1 success | 0,034 | 0 | 1,47 | 7 |
| 171 | 3 success | 0,563–0,566 | **591 in tutti** | 3,57–5,18 | 7 in tutti |

**Rilievo prioritario:** nella scena 171 il minimo pallone–testa è sotto la soglia di contatto di 0,6u, ma arriva **591 ms prima** del picco dello stacco in tre ripetizioni. La soglia richiesta è 150 ms: PO-077 resta presente in questa scena secondo il testimone, da riprodurre dal team. Nella ripetizione 1 compare anche un passo di 7,88u in 50 ms; supera `85u/s × dt + 0,5u` nel calcolo del banco. Le foto sono in `reports/codex/collaudo-testa-conduzione/gi171-a0-success-r{0,1,2}-*.png`; i campioni con istante esatto sono nel JSON delle misure. Il ritardo tra campione e foto di metà volo arriva a 75 ms, mentre per contatto e ±100 ms è registrato come 0 ms: le foto sono supporto visivo, il verdetto deriva dai testimoni. Comando per riprodurre il lotto sulla stessa base: `$env:CPM_KIND='header'; $env:CPM_GI='171'; $env:CPM_ACTIONS='0'; $env:CPM_OUTCOME='success'; $env:CPM_BATCH='3'; $env:CPM_FORCE_RERUN='1'; node tests/codex/collaudo-testa-conduzione.mjs`. Il comando è verificato per sintassi e selezione nel codice; la riesecuzione Chromium resta non verificata per memoria insufficiente.

## PO-079 — conduzione

Un solo caso valido: gi18, azione «Dribbling netto», success, ripetizione 0. Il banco misura 500 fotogrammi, il 10,8% con pallone entro 1,2u dal piede più vicino, distanza massima 42,07u e un tratto oltre 2u di 6.927 ms; in 67 dei 190 passi direzionali classificabili il pallone risulta dietro. **Limite decisivo:** il tipo derivato dell'azione nel grezzo è `pass`, non `dribble`. Queste distanze non dimostrano che il portatore perda il pallone *durante una conduzione*: possono includere un passaggio voluto. Non dichiaro PO-079 riprodotto né chiuso. Foto del caso: `reports/codex/collaudo-testa-conduzione/gi18-a0-success-r0-*.png`. Scatti, inversioni oltre 60° e analisi del pattinamento per le nove scene richieste: **non verificati**.

## Aggiunta PO-104, PO-050, PO-143

Nessun campione specifico sulle azioni di tiro delle scene 80 e 90, sui fail delle scene 64 e 126, né sul superamento dell'avversario nella scena 18. Questi tre quesiti sono **non verificati**. La scena 18 qui misurata riguarda solo distanza pallone–piede; non include distanza minima eroe–avversario né la posizione relativa finale.

## Copertura ancora richiesta

Mancano le ripetizioni e gli esiti fail delle scene di testa, la scelta di tutte le azioni di testa, le altre otto scene di conduzione, i casi dell'aggiunta e una valutazione visiva completa. Il campione headless non autorizza conclusioni su FPS o fluidità reale sul telefono. I rilievi restano ipotesi di collaudo finché il team non li riproduce.
