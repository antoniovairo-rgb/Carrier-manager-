# RAPPORTO giro 175 — La stessa partita intera, rigiocata identica, dava risultati diversi (PO-372)

Ramo `sviluppo/giro175-partita-riproducibile`, partito da `lavoro/191` (`13fa539`). `GAME_VERSION` non toccata.
Punto di partenza: `docs/sviluppo/RAPPORTO-giro166.md` §4.3.

## 0. In breve

- **Il difetto è riprodotto e misurato.** Sul codice di partenza: «Marco Bellandi», 6 partite intere identiche per
  costruzione → 4-0 · 3-0 · 0-0 · 0-0 · 4-0 · 0-0; «Tobia Ferrante», 6 giri dei primi 20' → in 1 su 6 il motore
  nasce da un campo diverso.
- **Le cause sono cinque, tutte del GIOCO** (un giocatore vero, a parità di scelte, avrebbe visto partite diverse),
  più una dello **strumento** (il pilota automatico). Sono in §2, ognuna con la sua misura.
- **Corrette** con un solo interruttore rosso `window.__CPM_NO_G175` (riporta il comportamento di prima). Dopo le
  correzioni: **8 nomi × 3 ripetizioni = 24 partite, libro mastro identico voce per voce** a 1× · 1,5× · 2×, con
  semi diversi del flusso di prova (cioè come `Math.random` in produzione) e a processore conteso; **corpi 3D
  accesi = corpi spenti** (stesso libro mastro, 307 voci); motore identico **chiamata per chiamata**.
- **Guardiano `npm run riproduci-175`**: verde col verde (5 nomi × 3 ripetizioni + 1 partita coi corpi accesi,
  16 partite), rosso col rosso (2 nomi su 2 si separano già al minuto 0-1). ≈ 27 minuti.
- **Il pilota automatico** dei guardiani ora sceglie sul battito della scena, non a orologio (§2.6). ⚠️ Misurato
  anche il contrario: sul codice corretto, col vecchio pilota a orologio, 6 partite su 6 restano identiche — il
  pilota a orologio è una fonte **letta nel codice**, che nelle mie misure **non ha prodotto** differenze.
- **⚠️ Le partite dei guardiani non sono più le stesse di ieri** (stesse regole, altri sorteggi): «Collaudo
  Salienti» finiva 2-0 e ora finisce 1-0, sempre. È la conseguenza attesa di §2.1 e va saputa da chi confronta
  numeri vecchi e nuovi (§5).
- **Non chiuso / non giudicato** (§7): lo «stato che sopravvive tra due partite nella stessa pagina» (la sonda non
  è riuscita a rigiocare la partita senza ricaricare); il movimento dell'eroe fatto DAL GIOCATORE in scena, che
  legge le posizioni rese dal 3D; la catena completa da 102 passi (non lanciata, vedi §6).

## 1. Come ho misurato

Sonda nuova di sola misura, `tests/visual/_diag175.mjs`. Gioca la stessa partita N volte (stesso salvataggio
sintetico del giro 166, stesso seme del pilota) e registra per ogni giro:

1. **ogni chiamata al motore del possesso** — avvolge `creaMotorePossesso`: metodo, argomenti e impronta dello
   stato dopo la chiamata (`tick`, `chiedi.*`, `probEroe`, `risolviEroe.dado`, `giocaScena`, `xgPunto`…). È lo
   strumento che ha deciso tutto: il motore ha un flusso di sorteggi con stato, quindi la prima chiamata diversa
   è la causa, non il sintomo;
2. i sorteggi senza seme (`Math.random`) e quelli del flusso di prova (`_cpmRnd`, cioè `rng()`/`pick()` sotto
   `?cpmtest`), contati per minuto, fase e chiamante;
3. il libro mastro (`__CPM_EV`).

Variabili utili: `NOME`, `GIRI`, `PAR`, `VELS=1,1.5,2`, `GLBS=0,1`, `RESEED=1` (seme del flusso di prova diverso a
ogni giro), `PILOTA=orologio`, `STOPMIN`, `FLAGS=__CPM_NO_G175`.

Un fatto che spiega perché la variabilità si vedeva «2 nomi su 3»: sotto `?cpmtest` `rng()` e `pick()` non sono
`Math.random` ma **un unico flusso di prova con stato**, che parte uguale a ogni caricamento ma viene consumato
anche dalla carriera prima della partita e dai cori a orologio. Il suo punto di arrivo al calcio d'inizio cambia
con i tempi reali: stessi valori quasi sempre, altri valori ogni tanto. In produzione è `Math.random` e cambia
sempre.

## 2. Le fonti trovate

| # | Fonte | Di chi è | Misura (prima) | Stato |
|---|---|---|---|---|
| 2.1 | Ventidue ed eroe al calcio d'inizio (e possesso iniziale) sorteggiati senza seme | GIOCO | motore creato con due campi diversi: portiere a 4,48 in 5 giri e a 12,52 nel sesto; eroe a 58,38 contro 45,48 («Tobia», 1 giro su 6; «Marco», 3 su 6) | corretta |
| 2.2 | Assestamento del pallone dopo l'esito sorteggiato senza seme | GIOCO | stessa famiglia della 2.3 (da lì nasce la scena incatenata) | corretta |
| 2.3 | La scena incatenata nasce dal pallone **reso** (3D, tempo reale) | GIOCO | «Marco», 13': eroe a y 45,86 · 47,01 · 45,80 in tre giri partiti uguali; rientra nel motore con `riprendi` → 4-0 · 3-0 · 4-0 | corretta |
| 2.4 | I passi del motore pagati in ritardo non aggiornano gli specchi | GIOCO | «Tobia», 78', tre velocità: eroe di scena a y 36,7273 contro 36,7114; stato del motore diverso dal tick 1803 in poi | corretta |
| 2.5 | Il motore nasce dall'eroe spostato durante l'attesa dei corpi 3D | GIOCO | «Collaudo Salienti», corpi accesi contro spenti: eroe a 50,62 invece di 47,61 → **4-0 invece di 1-0** | corretta |
| 2.6 | Il pilota automatico sceglie a orologio (300 ms) mentre il marcatore si avvicina a tempo reale | STRUMENTO | letta nel codice; sul codice corretto **0 chiamate di scena diverse su 79** col pilota a orologio (6 partite) | pilota sul battito |
| 2.7 | «Una voce in più al minuto 0» (rapporto 166) | conseguenza di 2.1 | col rosso: una ripetizione ha `turn · motore-calcio_inizio` al minuto 0 e l'altra no, perché il campo iniziale è diverso | sparita con 2.1 |

### 2.1 Il campo del calcio d'inizio (GIOCO)

`src/15`, stato iniziale di `matchPlayers` (r. ~2171): i 21 uomini nascono dal modulo con uno scarto `rng(-4,4)`
per coordinata; l'eroe nasce da `getStartPos(situations[0])`; il possesso iniziale ha un `rng(-5,5)`. `rng()` non
ha seme. Queste posizioni sono il `cfg.giocatori` e il `cfg.eroe` con cui il motore viene creato al primo battito:
campo diverso → partita diversa dal minuto 1.

Correzione: un generatore col **seme della partita + un'etichetta** (`_rnd175("ventidue")`, `"eroe0"`,
`"possesso0"`). Stessi intervalli, stesso numero di sorteggi, stesso ordine: cambia solo da dove vengono i numeri.

### 2.2 e 2.3 La scena incatenata (GIOCO)

Dopo un esito «a metà» (occasione, dribbling riuscito, cross, angolo) il gioco incatena una seconda scena. Il suo
punto di partenza era il bersaglio del pallone, e quel bersaglio aveva due difetti:

- era sorteggiato con `rng()` senza seme (`handleAction`, r. ~10117: il commento 7.57 lo dichiarava «deterministico
  (rng seedato)», ma non lo era);
- alla chiusura della scena `_allinea781` (7.781) lo porta **sul pallone reso dal 3D**, una posizione che dipende
  dai fotogrammi e da quanto dura la lettura.

Quel punto diventava la posizione dell'eroe nella seconda scena, cioè un ingresso di `probEroe`/`xgPunto`/
`giocaScena` e poi di `chiedi.riprendi({eroe})`: il motore ripartiva da uno stato diverso.

Correzione: (a) l'assestamento usa il generatore della scena (seme della partita + scena + minuto); (b) il punto
deciso si conserva (`settle175Ref`) e la scena incatenata nasce da lì. `_allinea781` resta com'è: il pallone
logico continua ad allinearsi a quello visto, e la cronaca riparte da dove sta la palla. Cambia solo da dove nasce
l'eroe della seconda metà: dal punto a cui l'arco mirava, non da dove il pallone reso è arrivato.

**Cosa cambia a schermo (non misurato sul telefono):** all'apertura della scena incatenata l'eroe può stare a
qualche unità dal pallone reso, se il pallone reso non aveva raggiunto il punto deciso. Nelle misure lo scarto fra
i giri era 0,06-1,2 unità in y.

### 2.4 Gli specchi dei passi in ritardo (GIOCO)

Ogni minuto il motore riceve 22 passi. Quelli che l'intervallo a orologio non fa in tempo a battere si pagano al
battito del minuto (cicli 161 e 967, giri precedenti): il motore li riceve tutti, ma **gli specchi** (pallone
logico, bersaglio, ventidue, eroe, portatore, turno) restavano fermi all'ultimo passo arrivato a orologio. La scena
che si apre su quel battito legge gli specchi: un passo prima o un passo dopo secondo il tempo reale.

Correzione: ogni passo pagato in ritardo fa ciò che fa il passo puntuale (`_specDeb175`: stessa condizione
`_vivo966`, stessi eventi del passo). Il motore non riceve nulla di nuovo. Effetto collaterale dichiarato: il
libro mastro di «Tobia» passa da 277 a 279 voci, perché due cambi di turno avvenuti in passi pagati in ritardo ora
vengono annotati come gli altri.

### 2.5 L'attesa dei corpi 3D (GIOCO)

Coi corpi accesi il primo battito aspetta il caricamento (5,2 s nella misura). In quell'attesa gira la «deriva»
dell'eroe (r. ~9400: un giro ogni 500 ms **reali**, con `rng()`), che non è fermata da `corpiHold232`. Al primo
battito il motore veniva creato con `pPosRef.current`, cioè con l'eroe già spostato. Su un telefono lento sarebbe
un'altra partita ancora.

Correzione: al primo battito (minuto 0, partita non ripresa) il motore nasce dall'eroe del calcio d'inizio
(`_eroeNasce175`). Senza attesa era già così, perché il primo battito arriva prima del primo giro di deriva:
i numeri delle partite a corpi spenti non cambiano per questa correzione.

### 2.6 Il pilota automatico (STRUMENTO)

`__CPM_AUTOPLAY` gira su un `setInterval` di 300 ms reali. Nella fase «muoviti» il marcatore si avvicina a ogni
battito di pressione (100 ms di scena) e la sua distanza entra nel malus di marcatura: passando a «scegli» dopo
0-3 battiti secondo l'orologio, il pilota poteva consegnare al dado probabilità diverse.

Ora, sotto pilota, il passaggio lo fa **il battito di pressione della scena** dopo un numero fisso di passi
(`window.__CPM_AP175 = {k}`; `k` = metà del vecchio giro, 2 con 300/350 ms): la distanza del marcatore alla scelta
è sempre la stessa. Dove quel battito non esiste (piazzati) resta il giro di prima. `pilota:"orologio"` (solo
sonde) rimette il vecchio. Il giocatore vero non è toccato: il suo tempo di decisione è una sua scelta.

⚠️ Onestà sulla misura: sul codice corretto ho rigiocato «Marco Bellandi» e «Ettore Malvasi» (3 ripetizioni
ciascuno, tre velocità) **col vecchio pilota a orologio**: libro mastro e stato del motore identici, 0 chiamate di
scena con argomenti diversi su 79. Non posso quindi confermare che il pilota a orologio abbia mai separato due
partite: è una dipendenza dal tempo reale presente nel codice, tolta perché la consegna lo chiede.

## 3. Cosa NON ho trovato (o è spento)

- **Motore del possesso** (`src/14`): nessun `Math.random`, `Date.now` o `performance.now` (cercati). A parità di
  chiamate è identico: verificato dalle impronte dello stato dopo ogni `tick`.
- **Ordine dei timer e del `requestAnimationFrame`**: dopo le correzioni, a tre velocità e a processore conteso
  (3 partite insieme su 4 processori), nessuna differenza di stato del motore. Le chiamate di sola resa
  (`chiedi.scenaMuovi`, ripetuta un numero variabile di volte) cambiano di numero ma il motore ne ripristina lo
  stato: non entrano nella partita.
- **Condizioni a tempo reale dentro il battito** (`Date.now() - …` alle r. ~8392, ~8520, ~8530, ~6854): stanno nei
  rami delle vecchie macchine narrative, spenti dal motore unico (`if(!MOTORE870||_inHL77)`). Letti, non misurati.
- **Sorteggi senza seme che restano, di sola resa**: cori (`chantFor`), testi degli esiti (`pick(OUTCOME_TX…)`),
  meteo e folla disegnati, pubblico 3D, identificativi di Three.js, la deriva dell'eroe fra un passo e l'altro.
  Non entrano nel libro mastro (lo prova il guardiano, che dà a ogni ripetizione un seme diverso del flusso di
  prova). ⚠️ Non ho misurato se il TESTO dell'esito letto dal giocatore cambia fra due partite uguali: è
  plausibile che cambi (è un `pick()`), l'esito no.

## 4. Guardiano `riproduci-175`

`cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium npm run riproduci-175` (≈ 27 minuti).

- **A. Statico** (5 controlli): interruttore, generatore col seme della partita, i punti corretti, nessun `rng()`
  nudo rimasto nei due blocchi.
- **B. Partite**: 5 nomi × 3 ripetizioni. Le tre ripetizioni di un nome sono diverse apposta per lo strumento —
  velocità 1× · 1,5× · 2×, **seme diverso del flusso di prova** (`__CPM_RESEED_PENDING`), tre partite insieme — e
  devono dare lo stesso libro mastro voce per voce (senza `ts`/`t`/`npd`, come i giri 161 e 166) e lo stesso
  risultato. Ogni partita deve arrivare oltre il 90' con almeno una scena e 100 voci, altrimenti è NON GIUDICATO =
  rosso.
- **C. Corpi 3D accesi**: una partita coi corpi accesi (2×) ha lo stesso libro mastro di quella a corpi spenti.
  Si escludono le voci `corpi232`: sono la nota dell'attesa del caricamento (millisecondi reali), esistono solo
  coi corpi accesi e non sono un fatto della partita.
- **Rosso** (`__CPM_NO_G175`): 2 nomi × 3 ripetizioni fermate al 30'; su **ogni** nome almeno una coppia deve
  separarsi (confronto sul prefisso fino al 25').

Esito sulla build del commit `20845bf`:

```
A. STATICO  ✓ A1 … ✓ A5
B. braccio VERDE — 5 nomi × 3 ripetizioni
  ✓ «Collaudo Salienti» — 1× 1-0 307v 92' 7sc 204 s · 1.5× 1-0 307v 92' 7sc 159 s · 2× 1-0 307v 92' 7sc 139 s
  ✓ «Tobia Ferrante»    — 1× 2-0 279v 92' 7sc 211 s · 1.5× 2-0 279v 92' 7sc 158 s · 2× 2-0 279v 92' 7sc 136 s
  ✓ «Marco Bellandi»    — 1× 2-1 294v 96' 7sc 213 s · 1.5× 2-1 294v 96' 7sc 168 s · 2× 2-1 294v 96' 7sc 145 s
  ✓ «Ettore Malvasi»    — 1× 3-0 295v 92' 9sc 222 s · 1.5× 3-0 295v 92' 9sc 180 s · 2× 3-0 295v 92' 9sc 151 s
  ✓ «Livio Corradini»   — 1× 5-0 316v 92' 8sc 209 s · 1.5× 5-0 316v 92' 8sc 168 s · 2× 5-0 316v 92' 8sc 146 s
  pilota: {"k":2}
C. corpi 3D accesi
  ✓ «Collaudo Salienti» coi corpi accesi (2×) = corpi spenti — 1-0 307v (+2 note d'attesa dei corpi, escluse)
B. braccio ROSSO (__CPM_NO_G175)
  ✓ si separano «Tobia Ferrante» — 104v · 98v · 97v al 30' · rip. 0≠1 alla voce 0 · rip. 0≠2 alla voce 1
  ✓ si separano «Marco Bellandi» — 106v · 93v · 90v al 30' · rip. 0≠1 alla voce 0 · rip. 0≠2 alla voce 0
MISURA — partite verdi 16 · nomi identici 5/5 · nomi rossi separati 2/2
VERDE: PASSA
ROSSO: CADE (come deve): le differenze tornano
```

Fuori dal guardiano, con la sonda (stesse varianti, prima dell'ultima correzione 2.5 che non tocca le partite a
corpi spenti): altri 3 nomi («Sandro Pieri» 2-0, «Dario Venturi» 1-1, «Nico Albanese» 2-1), 3 ripetizioni
ciascuno, libro mastro e motore identici. In tutto **8 nomi, 24 partite**.

Iscritto in `ci-runner.mjs` una volta sola per lista: catena `completa`, mappa `src/15-` della catena mirata,
insieme dei passi lenti. Verificato: nessun doppione nelle cinque catene.

## 5. Conseguenze per gli altri guardiani

- **Le partite cambiano, la taratura no.** Le posizioni iniziali escono dagli stessi intervalli ma da un altro
  generatore: ogni partita dei guardiani che passa da `LiveMatch` è una partita diversa da quella di ieri (e ora
  sempre la stessa). Esempio: «Collaudo Salienti» 2-0 (rapporto 166) → 1-0.
- **`lib/partita-166.mjs`**: `apriCarriera166` accetta `vel`, `glb`, `reseed`; `gioca166` accetta `pilota` e azzera
  il libro mastro **prima** di premere il bottone (prima lo azzerava dopo il montaggio). Valori predefiniti
  invariati: `solo-highlight-166` e `audio-161` non cambiano modo di giocare.
- **Chi confronta due partite «uguali»** (bracci verde/rosso, `solo-highlight-166`, `audio-161`) ora confronta
  davvero la stessa partita, a patto di usare lo stesso nome/settimana/avversario (il seme) e le stesse scelte.

## 6. Controlli

DA COMPILARE

## 7. Domande e punti aperti per la sessione madre

1. **Stato che sopravvive tra due partite nella stessa pagina: NON GIUDICATO.** Ho scritto una sonda che gioca la
   partita, rimette il giocatore com'era e la rigioca senza ricaricare: la seconda partita non si è mai montata
   (l'intervista post-partita resta aperta e copre il prompt; tre tentativi). La sonda non è nel ramo. Dalla sola
   lettura: le variabili globali modificabili toccate dalla partita sono `_ORIG26` (`src/11`, l'origine della scena
   da cross/angolo: si azzera solo quando `hlIdx` supera quello della scena, quindi una partita che FINISCE su una
   scena d'origine la lascia accesa alla successiva), `_MEM927`, il libro mastro e il flusso di prova. **Non ho
   corretto `_ORIG26`** perché non ho una misura del difetto (regola: misura prima di correggere). Domanda: vale un
   giro per una sonda che giochi due partite di fila nella stessa pagina?
2. **Il movimento dell'eroe fatto dal giocatore in scena legge il 3D.** `_moveGain317` (r. ~9520, decisione 7.322
   «il marcatore è quello che si vede») calcola quanto ci si stacca dal marcatore dalle posizioni RESE delle mesh:
   dipendono dai fotogrammi. Il pilota automatico non muove mai l'eroe, quindi i guardiani non lo vedono; un
   giocatore vero che preme lo stesso tasto nello stesso momento su due telefoni diversi può ottenere uno stacco
   diverso, e quindi una probabilità diversa. Non misurato, non toccato: cambiarlo vuol dire rimettere mano a una
   decisione del PO. Domanda: «le stesse scelte» comprende i passi dell'eroe in scena?
3. **Il tempo di decisione del giocatore vero conta, ed è voluto.** Nella fase «muoviti» il marcatore si avvicina a
   tempo reale e dopo 9-16 secondi di attesa arriva il contrasto automatico: chi aspetta di più gioca una scena
   diversa. L'ho trattato come una scelta del giocatore, non come un difetto. Lo segnalo perché «a parità di
   scelte» in questo rapporto significa: stesse giocate scelte, stessi passi, stessa attesa in battiti di scena.
4. **`_allinea781` resta una porta aperta fra 3D e logica.** L'ho chiusa solo dove entrava nella partita (la scena
   incatenata). Il pallone logico continua ad allinearsi a quello reso alla chiusura di ogni scena; per le scene
   non incatenate la ripresa usa già il pallone del motore (SEME-a C1, giro 161). Se in futuro qualcuno leggerà
   `ballTargetRef` dopo una scena per decidere qualcosa, il difetto torna: propongo l'invariante «una posizione
   resa dal 3D non entra mai nel motore né in una probabilità» in `CLAUDE.md` (non l'ho scritto: decide la madre).
5. **La scena incatenata nasce dal punto deciso: da vedere sul telefono.** A schermo l'eroe della seconda metà può
   stare a qualche unità dal pallone reso (§2.3). Non ho una misura visiva.
6. **Il testo dell'esito è ancora un `pick()` senza seme** (e così i cori): due partite uguali possono mostrare una
   frase diversa per lo stesso esito. Non è nel libro mastro. Domanda: va reso riproducibile anche il testo?
7. **`highlight-95` e gli altri guardiani che contano difetti su partite vere giocano ora partite diverse da ieri**
   (§5). Un loro rosso su questo ramo va letto contro una loro corsa su `lavoro/191`, non contro i numeri storici.
8. **Catena completa da 102 passi: non lanciata.** Il giro 166 ha misurato 11 passi in 8 ore con due rossi già
   presenti su `main`. Ho eseguito, uno alla volta, il nucleo della catena del motore e i controlli nominati nella
   consegna (§6).
