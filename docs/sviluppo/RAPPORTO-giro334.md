# Giro 334 — Ellisse d'attesa (PO-610)

Base: `lavoro/201` (d681977, versione 7.999.206). Ramo: `sviluppo/giro334-ellisse-attesa`. `GAME_VERSION` non toccata (rilascio automatico acceso).

## Esito in breve

| | prima (avanti-e-indietro) | dopo (ellisse) | tetto |
|---|---|---|---|
| `movimento-147`, compagni fermi prima dell'azione (5 corse a velocità reale) | 19,9 – 29,8% | **6,9 – 18,0%** | 25 |
| `movimento-147`, avversari fermi | 22,6 – 28,2% | **10,7 – 13,2%** | 25 |
| `ellisse-334` (guardiano nuovo, 8 scene GLB acceso), campioni sotto 0,5 u/s | 21,0% | **0,7%** | 5 |
| catena del giro (`ellisse-334`, `movimento-147`, `portatore-286`, `walkout-fermi-197` + 17 sentinelle) | — | **21/21 verdi** | — |

`movimento-147` è tolto da `docs/governo/ROSSI-DICHIARATI.json`. Nessuna soglia è stata cambiata.

## Che cosa è cambiato nel gioco

`src/12-three-match-view.jsx`, attesa attiva prima della scelta (blocco 7.999.144, una riga):

- **prima:** il punto andava avanti e indietro di 1 u su una retta, `base + u·sin(t)`. La velocità `1,6·|cos t|` passa dallo zero
  due volte per giro e sta sotto 0,5 u/s per il 20% del tempo, per costruzione;
- **ora:** `base + u·sin(t) + u⊥·0,5·cos(t)`, cioè un piccolo giro (ellisse 1 u × 0,5 u) sulla stessa direzione di prima
  (compagni in diagonale verso la porta, avversari sulla linea del pallone). La velocità sta fra 0,8 e 1,6 u/s e non passa mai da zero.
  Il verso del giro è alternato per indice, così due vicini non girano in coppia.

Restano uguali: la base fissa + spostamento (niente deriva, regola del 685), il raggio di 35 u dal pallone, il respiro per chi è
più lontano, il portiere escluso, e la **rampa `_k286`**: tutto lo spostamento, ellisse compresa, è moltiplicato per `_k286`, quindi
chi ha il pallone (o ci arriva entro 1,8 u) si ferma come prima. `portatore-286` è verde nella catena.

**Rosso `window.__CPM_NO_G334`** = il comportamento di oggi (avanti-e-indietro: la componente di traverso vale zero).

## Misure

### movimento-147 a velocità reale (sonda del giro 331)

`CPM_SOLO=prima334 node movimento-147.mjs` (modalità aggiunta in questo giro: braccio verde e braccio «prima» `__CPM_NO_G334`
insieme, stesse partite, nessun giudizio). Tre partite per braccio, rapporto scena/orologio 1,03-1,05. Registro completo in
`docs/sviluppo/giro334/misura-movimento-147.log`.

| corsa | dopo: compagni / avversari (campioni) | prima: compagni / avversari (campioni) |
|---|---|---|
| 1 | 8,4% / 11,9% (298 / 539) | 26,3% / 28,2% (342 / 614) |
| 2 | 6,9% / 13,2% (262 / 494) | 25,6% / 26,5% (305 / 562) |
| 3 | 7,7% / 10,7% (324 / 619) | 25,4% / 25,4% (280 / 532) |
| 4 | 7,7% / 13,0% (285 / 537) | 29,8% / 27,2% (285 / 523) |
| 5 | 18,0% / 11,9% (327 / 564) | 19,9% / 22,6% (316 / 552) |
| catena del giro (guardiano vero, verde + rosso) | 6,7% / 10,8% (312 / 557) | rosso `__CPM_NO_ATTIVI147`: 88,9% / 86,3% |

Il verde sta sotto il tetto 25 in **6 corse su 6**; il braccio «prima» lo supera in 4 su 5 (la quinta, 19,9%, è la stessa
variabilità che il giro 331 aveva visto fra 25 e 32). Il residuo del verde (7-18%) non viene più dal moto d'attesa: viene dai corpi
tenuti fermi vicino al pallone (giro 286) e dai fotogrammi in cui il pallone si sposta durante la lettura (vedi sotto).

### ellisse-334 (guardiano nuovo)

`npm run ellisse-334` — scene forzate gi31, gi36, gi44, gi20, gi60, gi80, gi140, gi160; GLB acceso, stacco di scena acceso, una pagina
nuova per scena, campioni registrati dentro la pagina. La velocità si misura sull'**orologio della pagina** (`performance.now`), perché
l'attesa attiva si muove su quell'orologio: il tempo di scena sul banco GLB-acceso è tappato e gonfierebbe le velocità (lezione del 331).
Contano i corpi fra 3,5 e 33 u dal pallone il cui percorso sta in un rettangolo fra 0,9 e 2,6 u (cioè chi fa l'attesa attiva).

| corsa | verde: campioni sotto 0,5 u/s | rosso `__CPM_NO_G334` | esito |
|---|---|---|---|
| prova 3 (lista con gi54) | 0,1% di 8.440 | 20,8% di 9.029 | rosso per gi54 (vedi dubbio 2) |
| prova 4 (lista definitiva) | 0,7% di 8.695 | 21,0% di 9.765 | ✅ |
| catena del giro | — | — | ✅ (342 s) |

Il rosso misura 21%, il valore che la geometria prevede (20%). Velocità minima dei corpi nel verde: 0,7-0,78 u/s quasi ovunque.

**Due correzioni dello strumento, misurate prima di fissare le soglie:**
1. Nella prima prova gi31 e gi54 mostravano corpi «fermi all'80%». Tracciati: il pallone si allontana oltre 35 u durante `hl_move`, e quei
   corpi passano (correttamente) al respiro di 0,3 u. Ora la misura considera solo i campioni entro 33 u dal pallone.
2. In gi54 un corpo restava «fermo al 48-63%»: è l'avversario a cui il pallone arriva a scena in corsa, che il giro 286 ferma e tiene
   fermo. Da quando il pallone gli passa entro 3,5 u il corpo esce dalla misura; gi54 è fuori dalla lista (lì il portatore cambia ogni volta).

Soglie fissate dopo la misura: verde ≤ 5%, rosso ≥ 12%, e nel verde nessun corpo fermo per più del 10% dei suoi campioni.

### Catena del giro

`node ci-runner.mjs giro ellisse-334 movimento-147 portatore-286 walkout-fermi-197` sul commit 9be5ae2: **21/21 verdi**
(ellisse-334 342 s, movimento-147 1145 s, portatore-286 359 s, walkout-fermi-197 229 s, poi le 17 sentinelle). Le foto di
`docs/collaudo-grafico` rigenerate da `griglia-mobile` non sono state committate (differenze di pochi byte, non toccate da questo giro).

## Foto (GLB acceso) per il collaudo

In `docs/sviluppo/giro334/`, scena gi31 («Avversario porta palla — sfida in scivolata»), stesso seme nei due bracci:

- `prima-strade-gi31.png` / `dopo-strade-gi31.png` — le strade degli otto corpi visti dall'alto durante la lettura (1 u = 60 px):
  **prima segmenti, dopo ellissi**. È l'immagine che mostra la differenza; una foto ferma non la può mostrare.
- `prima-gi31-1.png`, `prima-gi31-2.png`, `dopo-gi31-1.png`, `dopo-gi31-2.png` — il gioco a 412×915, a 2 s e 3 s dall'inizio della lettura.

## Come collaudarlo sul telefono

1. Gioca una partita e, a ogni highlight, **non premere subito**: resta nella schermata di scelta 5-6 secondi.
2. Guarda i compagni e gli avversari intorno all'azione (entro mezza metà campo): ora ognuno disegna un piccolo giro, non deve mai
   esserci l'istante in cui si ferma e torna indietro sulla stessa linea.
3. Guarda chi ha il pallone (o l'avversario che lo porta, nelle scene difensive): deve restare **fermo**, come dopo il giro 286.
4. Da segnalare nel taccuino: corpi che «pattinano» in cerchio a gambe ferme, giri troppo larghi o troppo veloci, due vicini che
   girano allineati come una coreografia.
5. Confronto col prima: non serve un'opzione nel gioco; le foto `prima-strade`/`dopo-strade` sono il confronto.

## Dubbi per il PO

**Dubbio 1 — Ampiezza dell'ellisse.** Ho scelto asse lungo 1 u (quello di prima) e asse corto 0,5 u: la velocità più bassa è 0,8 u/s,
con margine sulla soglia 0,5.
1. *(consigliata)* Tenere 1 × 0,5 e decidere dopo il collaudo sul telefono.
2. Ellisse più tonda (1 × 0,7): moto più uniforme, ma il giro si nota di più ed è meno «calcio».
3. Ellisse più stretta (1 × 0,35): più simile al prima, velocità minima 0,56 u/s, sul filo della soglia.

**Dubbio 2 — gi54 fuori dal guardiano `ellisse-334`.** Lì il pallone viaggia durante la lettura e il portatore cambia ogni volta; la
misura confonde il portatore fermo (giusto, giro 286) con un corpo in attesa.
1. *(consigliata)* Lasciarla fuori: il portatore la giudica già `portatore-286`/`portatore-293`.
2. Rimetterla escludendo per nome il portatore dichiarato dal 3D (serve un gancio in più nel gioco).
3. Rimetterla con una soglia per scena più larga: sconsigliata, è abbassare una soglia.

**Dubbio 3 — Il residuo di `movimento-147` (compagni 7-18%).** La quinta corsa ha dato 18%: viene dai corpi vicini al pallone e dai
momenti in cui il pallone si sposta durante la lettura, non dal moto d'attesa.
1. *(consigliata)* Accettarlo: è dentro il tetto 25 e sotto il tuo 30, con margine.
2. Indagare in un giro dedicato da dove vengono i fermi della quinta corsa (scena per scena), senza cambiare il gioco.
3. Allargare il raggio di 35 u dell'attesa attiva: cambierebbe il comportamento anche dei corpi lontani, sconsigliata senza misura.

## File toccati

- Gioco: `src/12-three-match-view.jsx` (ellisse + rosso `__CPM_NO_G334`), `CARRIER-MANAGER-AV.html` ricomposto (`check-src` identico).
- Guardiani: `tests/visual/ellisse-334.mjs` (nuovo, `npm run ellisse-334`, riga della mappa per `src/12`/`src/13` in `ci-runner.mjs`),
  `tests/visual/movimento-147.mjs` (modalità `CPM_SOLO=prima334`, nota del giro 334).
- Governo: `docs/governo/ROSSI-DICHIARATI.json` (tolto `movimento-147`), `docs/governo/STABILITA.json` (giro della catena).
- Documenti: questo rapporto, `docs/sviluppo/giro334/` (foto e registro della misura).

## Che cosa non è stato verificato

- La resa sul telefono (fluidità del giro, effetto «pattinaggio» delle gambe): solo il tuo collaudo lo dice.
- `movimento-147` completo (verde + rosso) è girato una volta (nella catena); il braccio verde sei volte, il rosso è nel codice di
  prima e non è toccato da questo giro.
- Il treno su GitHub Actions non è stato guardato: lo fa l'unione.
