# Rapporto giro 224 — PO-488 (statistiche della rassegna con lo spazio che serve) · PO-490 (scheda 4 piena) · accordi dei momenti chiave

Ramo `sviluppo/giro224-rassegna-spazio`, partito da `lavoro/196` (versione 7.999.196). `GAME_VERSION` non toccato.
Rosso unico: `window.__CPM_NO_G224` (torna la rassegna del giro 202 e il testo «Tuo punizione»).
Fotografie del PO lette dal ramo `poc/marioprada-character-system`: `docs/collaudo-po/195-rassegna-statistiche-strette.jpg`,
`docs/collaudo-po/195-rassegna-scheda4-vuota.jpg`.

## Misura prima

Strumento: il guardiano nuovo `tests/visual/rassegna-224.mjs`. Il suo braccio rosso (`__CPM_NO_G224`) rimette il codice di prima,
quindi la stessa corsa misura il prima e il dopo. Partita: campionato da professionista dal prompt vero (lib `partita-166`), soli
highlight, pilota seedato **7304** (la partita del giro 202 con più eventi), festa forzata. A partita finita il banco riempie la
classifica (18 squadre con punti diversi) e lo storico della stagione (5 partite con voto), perché a inizio stagione la classifica è
tutta a 3 punti e non mostra le zone. I numeri si leggono dal DOM: posizione delle voci, rettangoli dei testi ritagliati sulla scatola
del loro elemento, `font-size` calcolato.

| Prima (rosso, giro 202) | 360×640 | 375×667 | 390×844 |
|---|---|---|---|
| voci del tabellino per riga (max) | **3** | **3** | **3** |
| larghezza della voce più stretta / larghezza del tabellino | 0,21 | 0,22 | 0,23 |
| spazio minimo fra un numero e la sua voce | 9 px | 13 px | **7 px** |
| testi sovrapposti (rettangoli che si toccano) | 0 | 0 | 0 |
| scheda 1 (contenuto + piede, in schermi) | 1,27 | 1,20 | 1,00 |
| scheda 4: righe di classifica | 3 (la tua e le due vicine; la sonda conta solo la tua, le altre non hanno testimone) | 3 | 3 |
| scheda 4: altezza del contenuto / spazio sopra il piede | **0,42** | **0,40** | **0,27** |

Il difetto della foto del PO non è un testo che ne copre un altro (0 rettangoli sovrapposti): è la **fila di due-tre voci sulla
stessa riga** con 7-13 px fra un numero e la voce accanto, per cui «29% Possesso 71% 14 Tiri 2» si legge come una frase sola.
Foto prima: `docs/sviluppo/giro224/prima-{360x640,375x667,390x844}-scheda{1,2,4}.png`.

**Accordi dei momenti chiave.** Ho elencato tutti i testi passati a `pushMatchEvent` in `src/15-live-match.jsx` (19 chiamate, 67
stringhe). Uno solo è sbagliato: il gol dell'eroe su palla ferma, `"⚽ Tuo "+_kickWordLow+" al "…` → «Tuo rigore» (corretto per
caso) e «**Tuo punizione**». Il gol di testa passa da «⚽ Tuo gol al …» (corretto). Gli altri testi («Gol di …», «Assist per …»,
«Ammonizione al …», «ESPULSO! al …», «Espulsione avversaria …», «Palo/traversa …», «Gol clamorosamente sprecato …», «Ammonito X per
il fallo su di te …», «Sostituzione …») non hanno problemi di accordo.

## Correzione (`src/15-live-match.jsx`, solo presentazione, tutto sotto `_g224()`)

- **Tabellino della gara (scheda 1): una voce per riga a tutta larghezza** (`data-cpm="tab224"`): numero di casa a sinistra (15 px,
  grassetto), voce al centro (13 px), numero degli ospiti a destra, barra colorata da 3 px sotto (stessi colori `barra286-a/b`).
  Stesse voci, stesso ordine, nessuna tolta. Su PC la colonna si ferma a 560 px, centrata (altrimenti numero e voce finivano a
  1.100 px di distanza).
- **Pagella, commento del mister e momenti chiave passano alla scheda 2** (soluzione più semplice: **le schede restano quattro**).
  Lo spostamento è sempre, non «solo se non ci stanno»: con il tabellino a una voce per riga non ci stanno mai (vedi dubbio 1).
  I titoli delle schede seguono: «1/4 · Risultato» (titolo esteso «Risultato e statistiche»), «2/4 · Voto e giocate». I momenti
  chiave nella scheda 2 stanno in una colonna sola (c'è spazio).
- **Scheda 4** (PO-490), tutto letto dal salvataggio, nessun campo nuovo, ogni riga compare solo se il suo dato c'è:
  - (a) **classifica più lunga**: prime 5, la tua riga con quella sopra e quella sotto, ultime 3, con «⋯» dove salta; striscia
    colorata a sinistra per zona e legenda, con **le stesse regole della scheda Classifiche** (`src/18`: prima divisione Campione/CL
    1-4/EL 5-6/Conf. 7/ultime 3 retrocesse se c'è una serie inferiore; seconda divisione Campione/promozione 2-3/retrocessione;
    Primavera solo il titolo). Campionati di 10 squadre o meno: tutta la classifica. Nella fase a gironi della coppa europea
    (`euro_group`) il **girone** (`euroGroupTable`, la stessa della scheda Europa). Resta la riga «Prima dei risultati degli altri
    campi · questa partita: +N punti».
  - (b) **i tuoi numeri di stagione**: Gol, Assist, Presenze (dal salvataggio: «Prima di questa partita · oggi: 1 gol»), **voto
    medio** delle partite della stagione in `matchHistory`, e gli **obiettivi di stagione** con il loro stato misurato da
    `objCurrent`/`objDone` (lo stesso metro del cruscotto), es. «🎯 Segna 14 gol 3/14».
  - (c) **anteprima della prossima partita**: la riga di sempre («In casa contro … · Campionato · settimana N») più posizione, punti
    e V/N/P dell'avversario, la sua **forma** (la stessa striscia della grafica pre-partita, `_tvTeamStat`) e il **giocatore da
    tenere d'occhio**: il marcatore di quel club nella lista dei Marcatori del campionato (`generateLeagueScorers`), se ha almeno
    un gol.
  - Il tasto «Torna alla Home» resta.
- **Accordo**: `momentoPiazzato224(parola, minuto)` → «⚽ Tuo gol su rigore al 9'», «⚽ Tuo gol su punizione al 18'».

## Misura dopo (stessa partita, stessa corsa)

| Dopo (verde) | 360×640 | 375×667 | 390×844 | PC 1366×768 |
|---|---|---|---|---|
| voci per riga | **1** | **1** | **1** | **1** |
| larghezza voce più stretta / tabellino | 1 | 1 | 1 | 1 |
| spazio minimo numero↔voce | **51 px** | 59 px | 72 px | 191 px |
| testi sovrapposti (tutte e 4 le schede) | 0 | 0 | 0 | 0 |
| testo più piccolo (tutte e 4 le schede) | 12 px | 12 px | 12 px | 12 px |
| scheda 1 (tetto 1,3) | **1,28** | **1,23** | 1,00 | 1,07 |
| scheda 4 (tetto 1,3) | 1,28 | 1,19 | 1,00 | 0,99 |
| scheda 4: contenuto / spazio sopra il piede | 1,26 | **1,16** | 0,85 | 0,94 |
| scheda 4: righe di classifica (colorate) | 11 (10) | 11 (10) | 11 (10) | 11 (10) |

**Il vincolo del giro 202 «scheda 1 entro 1,3 schermi a 375×667» resta valido** (1,23), e regge anche a 360×640 (1,28, margine
stretto: vedi dubbio 2). Con il tetto della lista (12 momenti chiave provocati, informativo del guardiano `rassegna-202`) la scheda 1
a 375×667 passa da 1,45 a **1,23**, perché i momenti chiave non sono più nella scheda 1: il dubbio 2 del giro 202 non c'è più.
Foto dopo: `docs/sviluppo/giro224/dopo-{360x640,375x667,390x844,1366x768}-scheda{1,2,4}.png`.

## Guardiano nuovo `rassegna-224` (in `package.json`, catene `completa` e `carriera` una volta ciascuna, mappe di `src/15-`, lenti)

- **S** (statico): nessun testo di `pushMatchEvent` in `src/15` con «Tuo» davanti a un nome femminile o «Tua» davanti a un maschile.
- **A** mobile 360×640 · 375×667 · 390×844 e **B** PC 1366×768: momento del gol su palla ferma «Tuo gol su …»; scheda 1 con il
  tabellino visibile, 1 voce per riga, ogni voce ≥ 90% della larghezza del tabellino, ≥ 8 px fra numero e voce, nessun testo
  sovrapposto, testo ≥ 12 px, scheda 1 ≤ 1,3 schermi, pagella nella scheda 2; su tutte e quattro le schede nessun testo sovrapposto,
  testo ≥ 12 px, quattro puntini, Avanti/Salta sulle schede 1-3, piede in fondo alla finestra (±2 px); scheda 4 con ≥ 8 righe di
  classifica (con la tua), ≥ 3 colorate, legenda, Gol/Assist/Presenze/Voto medio, prossima partita con posizione e forma
  dell'avversario, ≤ 1,3 schermi e (a 375×667) contenuto ≥ 75% dello spazio sopra il piede; zero errori di pagina.
- **R** rosso `__CPM_NO_G224` (stessa partita): bocciato su 3/3 viewport e testo «Tuo punizione» riconosciuto come sbagliato.
- «Non giudicato» (partita non finita, rassegna/piede non trovati) = rosso.
- Due difetti della sonda trovati e corretti prima del verde: (1) con `lineHeight:1` il rettangolo del glifo sporge di 2-3 px
  oltre la riga e contava come «sovrapposto» sul «Il tuo tabellino» della scheda 2 (uguale nel rosso, foto pulita): ora il
  rettangolo si ritaglia sulla scatola dell'elemento; (2) la pienezza misurata con `scrollHeight` non scende mai sotto 1 (valeva 1
  anche nel rosso semivuoto): ora si misura dal fondo vero del contenuto visibile.

`rassegna-202` aggiornato **senza toccare soglie**: contava i momenti chiave solo nella scheda 1; ora li cerca in qualunque scheda.
`rassegna-200` non modificato.

## Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima di ognuno)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** dopo ogni modifica a `src/`.

| # | Controllo | Esito |
|---|---|---|
| 1 | `rassegna-224` (nuovo) | **verde 10/10**, rosso `__CPM_NO_G224` bocciato |
| 2 | `rassegna-202` | **verde 9/9**, rosso `__CPM_NO_G202` bocciato 2/2 (informativo 12 momenti: 1,23) |
| 3 | `rassegna-200` | **verde 14/14** (contenuto di prima 96/96, schede 1,09 · 1 · 1,02 · 1,19), rosso bocciato |
| 4 | `rifiniture-200` | **verde 10/10**, rosso bocciato 10/10 |
| 5 | `solo-highlight-166` | **verde** (controllo 11 «tabellino, pagella e statistiche identici»: schermata finale 2237 = 2237 car.); rosso cade su 3, 7, 8 come deve. Dura più di 10 minuti: eseguito come comando in sottofondo, con attesa in primo piano sul file di log |
| 6 | `simula-215` | **verde 21/21**, rosso `__CPM_NO_G215` bocciato |
| 7 | `griglia-mobile` | **uscita 0**, misura completa 14 schermate × 5 larghezze (la fase di fine partita non è fra le sue schermate) |
| 8 | `design-system` | **SISTEMA GRAFICO OK** (nessun corpo sotto 12 px, nessun raggio scritto a mano che duplichi un token) |
| 9 | `career-critical` | **uscita 0**, nessun ❌ |
| 10 | `test:logic` | **51/51** |
| 11 | `save-compat` | **12 pass · 0 fail** |

I controlli dei giri precedenti riscrivono le loro foto (`docs/sviluppo/giro200`, `giro202`, …): le ho riportate alla versione
committata con `git checkout --`, non fanno parte di questo giro.

## Dubbi per il PO (nessuna decisione presa)

1. **Pagella, mister e momenti chiave vanno sempre alla scheda 2**, non «solo se non ci stanno»: con il tabellino a una voce per
   riga (17 voci) la scheda 1 è già a 1,23-1,28 schermi, e aggiungerli la porterebbe oltre 1,5. Le schede restano quattro. Nella
   scheda 2 i tre blocchi stanno **in fondo**, dopo «La tua scelta», «Il tuo tabellino», «Le connessioni» e «Il tuo tabellino in
   numeri», perché l'ordine delle schede segue l'ordine dei blocchi nella pagina: portarli in cima vuol dire spostare blocchi di
   codice, cosa che non ho fatto. Da guardare sul telefono.
2. A **360×640 la scheda 1 è 1,28 schermi** (con la festa del trofeo): entro 1,3 ma col margine stretto. Per starci ho tenuto le
   righe compatte (numeri 15 px, interlinea 1,1, barra 3 px, 2 px fra le voci). Se il PO le vuole più ariose, la scheda 1 supera
   1,3 a 360 (misurato: 1,52 con 7 px fra le voci e barra da 4) e il vincolo andrebbe allentato o scritto solo per 375×667.
3. **«Forma (ultime 5)» dell'avversario**: il gioco non salva la sequenza dei risultati delle altre squadre. La striscia è quella
   della grafica pre-partita (`_tvTeamStat`): cinque esiti presi **dal suo bilancio vero** (V/N/P della classifica), in un ordine
   deterministico, non le ultime cinque in ordine di data. Lo dichiara anche il commento nel codice del 7.8.1. Accanto c'è il
   bilancio V/N/P vero. Per la tua squadra la stessa funzione usa le tue ultime 5 vere.
4. **«Giocatore da tenere d'occhio»** = il marcatore di quel club nella lista Marcatori del campionato (`generateLeagueScorers`),
   cioè lo stesso nome e gli stessi gol che il giocatore vede nella schermata Marcatori. È un dato stimato dal gioco (gol per
   prestigio del club e giornate giocate), non contato partita per partita. Compare solo per le partite di campionato e se ha
   almeno un gol.
5. **Coppe e Nazionale**: ho fatto la classifica del **girone** per la fase a gironi della coppa europea. Per la Nazionale e la
   Coppa delle Nazioni non c'è nessuna classifica (come prima); per le partite a eliminazione (coppa nazionale, turni KO europei)
   resta la classifica del campionato del club, come nel giro 200. Il **tabellone del turno** non l'ho fatto: è un blocco nuovo per
   ogni competizione, da decidere se serve.
6. **Numeri di stagione «prima di questa partita»**: la partita si salva quando si torna alla carriera, quindi Gol/Assist/Presenze/
   voto medio sono quelli salvati, con accanto «oggi: N gol / N assist». Come la classifica («prima dei risultati degli altri
   campi»). In alternativa si possono sommare quelli di oggi, ma la presenza e il voto della partita si scrivono solo al salvataggio
   e non so confermare che coincidano in ogni competizione (Nazionale compresa).
7. «ESPULSO! al 70'» non è un errore di accordo e l'ho lasciato; segnalo solo che si legge meglio «Espulso al 70'».
8. Roadmap e `GAME_VERSION` non aggiornati (regola del giro); la riga di roadmap va scritta quando il giro viene promosso.
