# Rapporto giro 393 — il rigore fuori esce fuori dai pali (rosso di `tiri-367` sul treno della 7.999.216)

Base: `lavoro/201` @ 29d758c8. Ramo: `sviluppo/giro393-tiri`. Non tocca GAME_VERSION né `docs/governo`.

## Il rosso del treno
Corsa 45751390281, parte 20: `✗ braccio verde: gi5 rigore: (2) all'uscita il pallone e' nello specchio`. Unico rosso; braccio rosso di 367 funzionante.

## Causa (misurata)
`misura-367` su gi5 «Angolato rasoterra», esito forzato «fuori», corpi accesi, un browser nuovo per corsa:

| build | corse | distanza dal palo all'uscita (m) | nello specchio |
|---|---|---|---|
| punta 29d758c8 | 6 | 0,74 · 0,06 · 0,02 · 0,18 · 0,09 · 0,09 | 0 su 6 (al limite) |
| 8543a9cc (prima dei giri 367-382) | 6 | 0,06 · 0,15 · 0,07 · 0,28 · 0,14 · 0,18 | 0 su 6 (al limite) |
| **dopo la correzione** | 6 | **0,76 × 6** | 0 su 6 |

Il difetto è **del gioco e preesistente** (c'è già su 8543a9cc), non dei giri 367-382. Nel ramo del rigore
(`src/12-three-match-view.jsx`, dispatcher dell'arco, `t==="penalty"`) il bersaglio è `_rz*7` scalato per la
qualità, cioè |z| ≤ 3,5: **dentro i pali** (mezza luce 3,66) anche quando il motore dice «fuori». Arrivato sulla
linea, la scivolata `wide_slide` del 7.533 (`__CPM_NO546`) spinge il pallone di lato finché |z| supera 3,66 e lì
si ferma: il rigore sbagliato si vede arrivare davanti alla porta e poi scivolare appena oltre il palo
(0,02-0,29 m). Il guardiano diventa rosso quando il fotogramma campionato all'arrivo cade prima che la
scivolata abbia superato il palo: da qui l'esito «a volte». Il guardiano diceva il vero; vedeva il difetto
solo una volta ogni tanto.

## Correzione
- `src/12-three-match-view.jsx`, ramo del rigore (blocco F6, prima dello stile 79): con esito `wide`/`out` il
  bersaglio va oltre il palo dal suo lato, a 3,66 + 0,6 + 0,6·(1−q) (0,6-1,2 m oltre il palo, q alta = più
  vicino) e l'arco arriva sulla linea (`ballArcTgtX ≥ 48`). Sta sotto il tetto del giro 367 per 11 m
  (2,1 m). Rosso `window.__CPM_NO_G393`. `CARRIER-MANAGER-AV.html` ricomposto (`build-src`).
- `tests/visual/misura-367.mjs`: `tiro()` accetta `no393` (e `CPM_NO393=1`) per armare il rosso.
- `tests/visual/tiri-367.mjs`: nel verde anche il rigore deve passare ad almeno 0,5 m dal palo (criterio (2),
  che prima valeva solo per tiri e teste: così il difetto si vede a ogni corsa, non secondo il campione);
  nel rosso tre rigori con `__CPM_NO_G393`, almeno due a meno di 0,5 m dal palo o nello specchio. Nessuna
  soglia abbassata.

## Le righe «sopra il tetto» del log (gi62 2,22 contro 2,07 · gi17 4,03 contro 4,00 · gi1 1,69 contro 1,61)
Non sono rossi: il giudizio (3) è `lato > tetto + 0,35` (tolleranza di campionamento dichiarata nell'intestazione
del guardiano). Il «tetto» stampato nella riga è il tetto senza tolleranza. Tutte e tre stanno sotto tetto + 0,35.

## Prove
Vedi in fondo (verde+rosso di `tiri-367`, sentinelle).

## Dubbi per il PO
1. **(consigliata, applicata)** Il rigore fuori mira 0,6-1,2 m oltre il palo, deciso al calcio: si vede uscire
   di poco, mai davanti alla porta.
2. Allargare la scelta al rigore «alto» (sopra la traversa) per una parte dei fuori: più varietà, ma serve un
   esito del motore che lo dica (oggi c'è solo `wide`).
3. Togliere la scivolata `wide_slide` (7.533) per tutti i piazzati e far decidere il punto solo all'armo,
   come il giro 367 fa per tiri e teste: più pulito, ma tocca anche la punizione (oggi verde) — fuori ambito qui.

Non toccato e da guardare: la punizione ha lo stesso bersaglio `_rz*7` (|z| ≤ 3,5) e la stessa scivolata;
nel treno è verde, non l'ho misurata in questo giro.

### tiri-367 (punta + correzione, 5 min)
- verde: 18 tiri giudicati su 18, mediana 1,07 m, massimo 4,10; gi5 rigore a 0,76 m dal palo, 0,00 dal bersaglio.
- rosso 367: invariato (provocati fino a 11,32 m, scivolata 4,11). Rosso 393: rigori a 0,15 · 0,21 · 0,03 m dal palo.
- `✅ tiri-367 VERDE (verde + rosso)`.
