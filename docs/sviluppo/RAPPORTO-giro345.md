# Rapporto giro 345 — PO-376 «B: riaccendo lo spostamento» (le scene dell'eroe tornano a partire dalla fascia)

Base `lavoro/201` (punta `fd2b933`), ramo `sviluppo/giro345-fasce`. GAME_VERSION non toccata.
File del gioco toccato: solo `src/14-motore-possesso.jsx` (più il ricomposto `CARRIER-MANAGER-AV.html`).
Il ramo porta anche rapporto e sonde del giro 324 (`docs/sviluppo/RAPPORTO-giro324.md`, `docs/sviluppo/giro324/`), che stavano
solo sul ramo `sviluppo/giro324-fasce` mai unito: senza, questo rapporto non avrebbe il suo «prima».

## Risposta in breve
Con la richiesta «fascia» aperta l'eroe ora si allarga davvero e la scena «Palla sulla fascia» torna a uscire.

| Misura | Prima (rosso `__CPM_NO_G345`) | Dopo (verde) |
|---|---|---|
| Partite vere, 12 per braccio (3 salvataggi × 4 semi, tutte finite al 90'): scene di fascia dell'eroe (F1) | **1 su 75 (1,3 %)** | **8 su 70 (11,4 %)** |
| Partite vere: partite con almeno una scena di fascia | 1 su 12 | 6 su 12 |
| Banco node, 2.000 partite per braccio: occasioni dell'eroe di tipo «fascia» | 10 su 10.049 (**0,1 %**) | 956 su 10.438 (**9,2 %**) |
| Banco node: partite con almeno una scena di fascia | 0,5 % | 39,0 % |
| Banco node: richieste «fascia» esaudite | 1 su 1.699 | 896 su 1.717 (52 %) |
| Banco node: gol a partita (due squadre) | 2,07 | 2,05 (−1,2 %) |

## Premessa: i ruoli non esistono (la misura «per ruolo» non si può fare)
La richiesta era misurare per ruolo (punta, ala, terzino, centrocampista). Come già scritto dal giro 324, e riverificato oggi
sul codice della base:
- la creazione scrive sempre `position:"Attaccante"` (il selettore del ruolo è stato tolto con la 7.999.49);
- il motore crea l'eroe sempre come punta con posto fisso `SLOT_EROE={x:60,y:50}`; in `src/14` la parola `position` non compare
  (0 occorrenze): il ruolo del salvataggio non entra nel motore.

Quindi **non esiste una quota «per ruolo» da misurare**: la tabella è per salvataggio (livello dell'eroe), come al giro 324.
Dare all'eroe un ruolo vero (ala, terzino…) è una funzione nuova (strada C del giro 324), non fa parte di questo giro: è il
dubbio 2 più sotto.

Stessa cosa per «tattica» e «ordine del mister»: oggi l'unica richiesta di «fascia» che arriva al motore è il **tipo d'occasione**
che la partita chiede a rotazione (2 voci su 8, `src/15`). La tattica entra nel motore solo come ampiezza delle corsie dei compagni
(`amp`), e le schede del mister che parlano di «allargarsi» (`eroe_marcato` e simili) non hanno un canale verso la posizione
dell'eroe. Non li ho collegati: è il dubbio 3.

## Causa (misurata dal giro 324, confermata)
Nella partita vissuta l'occasione dell'eroe nasce quando ha il pallone oltre x 64 e sono passati 16' dall'ultima; il tipo lo
decide il punto in cui si trova. La scena «fascia» chiede 22 o più dal centro; l'eroe ha il posto a y 50 e senza palla si scosta
al massimo di 15. Il blocco del 23/09 che lo portava largo sulla richiesta «fascia» è spento da «l'eroe dal gioco» (`_EG`,
7.999.6). La richiesta «fascia» partiva (24 % delle finestre) ma non spostava nessuno: 1 esaudita su 1.699.

## Correzione (src/14, rosso `window.__CPM_NO_G345`)
Vale solo nella partita vissuta (`brainLive`), solo con la richiesta «fascia» aperta, da 11' dopo l'ultima occasione dell'eroe.
1. **L'eroe si allarga.** Con la squadra in possesso va a (72, 84) o (72, 16); senza palla tiene la corsia larga (y 78 o 22) alla
   sua altezza. Il lato è quello del pallone nel momento in cui si muove: una lettura, nessun sorteggio. Corsa 11 unità al minuto
   (sotto il tetto di 12 del passo umano).
2. **L'occasione aspetta che sia arrivato.** Finché non è a 22 dal centro non è la prima scelta del passaggio e, se il pallone gli
   arriva lo stesso, l'occasione non si apre. Al massimo 12 minuti di gioco, poi vale la prima che capita (un highlight non si perde).
3. **Scambio di posizione.** L'ala di quel lato prende il posto centrale dell'eroe finché lui è largo.
4. **Il cross in gioco aperto verso l'eroe largo non è una scena.** Prima chiudeva la richiesta con una scena «cross» con l'eroe
   sulla linea laterale; ora il pallone gli arriva e l'occasione nasce da lì. Angoli e punizioni invariati.
5. **Largo oltre la trequarti è «fascia», non «conclusione».** Con x ≥ 70 e 22 o più dal centro (fuori dalla larghezza dell'area)
   il tipo era «conclusione» o «spalle» anche sulla linea laterale.

Nessun sorteggio aggiunto o tolto dal codice; la simulazione rapida (`brainLive` spento) è identica al bit nei due bracci.

### Come ci sono arrivato (misure intermedie al banco, 1.000 partite, quota «fascia»)
| Passo | Quota | Nota |
|---|---|---|
| solo spostamento in possesso (il blocco del 23/09 com'era) | 0,2 % | 36 unità da fare a 6 al minuto, e a ogni palla persa tornava al centro |
| + corsia larga anche senza palla | 2,2 % | riceveva palla mentre si stava ancora allargando |
| + attesa dell'arrivo e classificazione oltre la trequarti | 4,1 % | occasioni dell'eroe +7,2 % (fuori dal ±5 %) |
| + niente scena «cross» verso l'eroe largo | 5,0 % | |
| + partenza a 11' e attesa fino a 12' | 6,7 % | **gol −5,1 %**: al centro non restava nessuno |
| + scambio di posizione con l'ala | 6,3 % | gol −2,2 % |
| + corsa a 11 unità al minuto (era 9) | **9,4 %** | gol invariati sullo stesso campione |

Provato e tolto: un premio di passaggio all'eroe già largo (0, 12, 24 punti: 5,9 % · 6,3 % · 6,5 %, non era quello il freno) e una
penalità di passaggio mentre si allarga (0, 15, 30: nessun effetto).

## Guardiano `npm run fasce-345` (banco node, ~80 s, nessun browser)
`tests/visual/fasce-345.mjs`, nella riga `src/14` della MAPPA (già esistente). 2.000 partite per braccio nel modo partita
vissuta, stessi semi, verde e rosso nello stesso giro.

**Banda, scritta prima della correzione: quota «fascia» delle occasioni dell'eroe in [8 %, 25 %].** Sono valori di progetto miei,
non una statistica del calcio vero: il tetto è la quota delle richieste «fascia» (2 su 8), il pavimento circa un terzo. Non ho
una fonte verificabile sulla quota reale di azioni di una punta centrale che partono dalla fascia: è il dubbio 1.

Esito sul build consegnato (N=2000, semi da 1000):
- quota «fascia» verde **9,2 %** (in banda) · rosso **0,1 %** (sotto il 4 %: il difetto si vede spento);
- gol −1,2 % (tolleranza ±9,3 %) · tiri −1,2 % (±3 %) · xG −1,8 % (±3 %) · cross −1,6 % (±5 %) · passaggi −1,1 % (±3 %);
- occasioni dell'eroe a partita 5,22 contro 5,02: **+3,9 %** (±5 %) · possesso della squadra dell'eroe −0,79 punti (±1,5);
- simulazione rapida identica nei due bracci · verde ripetibile (stesse partite, stessa firma);
- prova del rosso `CPM_ROSSO=1`: esce 1 («quota 0,1 %»).

**Limiti, da leggere prima dei numeri.**
- Nel banco **la richiesta della partita è emulata** (la finestra si apre al 12' e 10 minuti dopo l'ultima occasione; il tipo esce
  dalla stessa tabella di `src/15` con un indice seminato). Il numero vero è quello delle partite nel browser; il banco è il
  guardiano perché è ripetibile e gioca 4.000 partite in 80 secondi.
- La tolleranza sui gol (4 % più 2,5 errori standard, la formula di `passaggi-228`) con 2.000 partite è larga ±9,3 %: un calo
  dell'1-2 % dei gol della squadra **non si distingue dal rumore** con questo banco. Tiri, xG, cross, passaggi e possesso sono
  tutti leggermente sotto (fra −1,1 % e −1,8 %): la direzione è coerente, quindi un piccolo costo c'è.
- Nel banco nessuno gioca la scena: i gol sono quelli del gioco fluido. I gol dell'eroe nascono negli highlight e una scena
  «fascia» (cross, dribbling) ha un esito diverso da una «conclusione». **L'effetto sui gol dell'eroe e sul risultato delle partite
  vere non è misurato**: 12 partite per braccio non bastano e la sonda non registra il punteggio.

## Partite vere (sonda del 324: `docs/sviluppo/giro345/misura-345.mjs`)
Flusso vero dal salvataggio, pilota «mano», velocità 2×, GLB spento (misura di logica), 4 pagine in parallelo. Stesso build,
due bracci: `CPM_FLAGS=__CPM_NO_G345` (prima) e verde (dopo). Tutte le 24 partite sono arrivate al fischio (90'-95').

| Salvataggio (ruolo: Attaccante) | Braccio | Partite | Scene | F1 tipo fascia | F2 eroe largo | F3 cross/angolo verso l'eroe |
|---|---|---|---|---|---|---|
| s1 · Primavera, OVR 62 | prima | 4 | 19 | 1 | 1 | 1 |
| s1 · Primavera, OVR 62 | dopo | 4 | 18 | 3 | 2 | 1 |
| s5 · professionista, OVR 74 | prima | 4 | 28 | 0 | 0 | 1 |
| s5 · professionista, OVR 74 | dopo | 4 | 24 | 3 | 3 | 1 |
| s12 · professionista, OVR 93 | prima | 4 | 28 | 0 | 0 | 5 |
| s12 · professionista, OVR 93 | dopo | 4 | 28 | 2 | 2 | 4 |
| **Tutte** | **prima** | **12** | **75 (6,3/partita)** | **1 (1,3 %)** | **1 (1,3 %)** | **7 (9,3 %)** |
| **Tutte** | **dopo** | **12** | **70 (5,8/partita)** | **8 (11,4 %)** | **7 (10,0 %)** | **6 (8,6 %)** |

Tipi di scena, prima: fra le linee 32 · difesa 12 · conclusione 10 · punizione 8 · angolo 5 · scheda 3 · cross 2 · spalle 2 · fascia 1.
Dopo: fra le linee 26 · difesa 12 · **fascia 8** · punizione 6 · conclusione 6 · scheda 4 · cross 3 · angolo 3 · spalle 2.
Elenco scena per scena in `giro345/partite-prima-rosso.txt` e `giro345/partite-dopo-verde.txt`.

Da leggere con prudenza: 12 partite per braccio sono poche. Le scene totali passano da 75 a 70 e le «conclusione» da 10 a 6:
con questi numeri non posso dire se è un effetto della modifica o rumore (nel banco le «conclusione» scendono da 13,0 % a 11,6 %,
quindi una parte è vera: le scene di fascia prendono il posto di altre, non si aggiungono).

## Catena del giro
`node ci-runner.mjs giro fasce-345 match-sequence sim-motore` (guardiano + 2 chiesti + 17 sentinelle, `replay` è fra le sentinelle).
`validate-situations` non eseguito: `deriveHL` e `src/04` non sono toccati.

**Esito sul build consegnato: 19 verdi su 20.**
- Verdi: `fasce-345` (79 s) · `match-sequence` (978 s) · `mappa-unica` · `test:logic` · `save-compat` · `replay` · `migrazione-194` ·
  `design-system` · `tema-unico` · `griglia-mobile` · `render-3d-023` · `tunnel-285` · `home-298` · `web-237` · `career-critical` ·
  `battito-264` · `partita-vera` (631 s) · `gk-dive-sync` · `schermate-97`.
- **Rosso: `sim-motore`** — «B: gol a partita 2,29 fuori da 2,3-3,5». È il rosso già scritto in `docs/governo/ROSSI-DICHIARATI.json`
  («rosso dichiarato dal giro 310 (gol 2,29 contro soglia 2,3; si sistema con PO-599)»), con lo stesso valore. `sim-motore` gioca la
  simulazione rapida, dove la modifica non entra (`fasce-345` verifica che è identica nei due bracci). Non l'ho rieseguito sulla
  base in questa sessione: l'uguaglianza col valore dichiarato è la prova che ho.

## Verifica a occhio, GLB acceso (una scena)
Partita vera s1 seme 4 con `__CPM_GLB=true` e `__CPM_PRESENT=1`: al 24' si apre «Palla sulla fascia: metti in mezzo?» con l'eroe a
(65 · 27,3); scelta «Cross basso teso». Foto: `giro345/foto-345-fascia-scelta.png` e `giro345/foto-345-fascia-esito.png`.
Cosa si vede: la scena si apre, l'eroe ha il pallone, calcia e il pallone parte verso l'area; due avversari lo chiudono.
**Cosa non convince:** a 23 dal centro l'eroe a schermo è sul mezzo spazio di sinistra, non sulla linea laterale; la porta è
quasi di fronte. Per il motore è «fascia» (soglia 22), a occhio è una fascia stretta. È una scena sola: non dice quanto spesso
succede (nelle 8 scene di fascia misurate la distanza dal centro va da 19,8 a 31). È il dubbio 6.

## Fuori ambito, dichiarato
- `docs/governo/BACKLOG.md`, voce PO-376: dice ancora «DA FARE — 198»; non l'ho toccata (i giri non scrivono il governo).
- Nessuna verifica sul telefono: il comportamento in campo (l'eroe che corre largo, l'ala che taglia dentro) va guardato dal PO.

## Dubbi per il PO
1. **La banda 8-25 % va bene?** È un valore mio, non ho una fonte sul calcio vero.
   - **A (consigliata): tenerla.** In partita vuol dire circa una scena di fascia ogni due partite (6 su 12 misurate).
   - B: alzare il pavimento (per esempio 12 %): serve far partire l'eroe prima o aspettarlo di più, e il costo sui gol della
     squadra cresce (misurato −5 % senza lo scambio di posizione).
   - C: alzare la quota delle richieste «fascia» nella rotazione di `src/15` (oggi 2 su 8): più scene di fascia senza toccare
     ancora il motore, ma a scapito di «conclusione» o «fra le linee».
2. **«Per ruolo» non esiste: lo si vuole?**
   - **A (consigliata): no per ora.** L'eroe resta una punta che ogni tanto si allarga; PO-376 si chiude con questo giro.
   - B: far contare `player.position` solo sulla quota delle richieste (un'ala chiede «fascia» 4 volte su 8, una punta 2): piccolo,
     ma il ruolo oggi non è sceglibile alla creazione.
   - C: posto vero nel modulo e scelta del ruolo (strada C del giro 324): funzione nuova, più giri, tutte le bande da ritarare.
3. **Tattica e ordine del mister.**
   - **A (consigliata): un giro a parte per la scheda «il mister gli indica di allargarsi»** (`eroe_marcato`, «Seguo le
     indicazioni»): la prossima richiesta diventa «fascia». È la promessa più visibile, oggi a vuoto.
   - B: anche la tattica (squadre con ampiezza alta chiedono «fascia» più spesso).
   - C: niente: resta solo la rotazione.
4. **Il piccolo costo sul gioco fluido** (tiri −1,2 %, xG −1,8 %, passaggi −1,1 % nel banco) è accettabile?
   - **A (consigliata): sì**, è dentro le tolleranze degli altri guardiani del motore e lo scambio con l'ala lo ha già dimezzato.
   - B: misurarlo meglio prima di unire (10.000 partite per braccio, e il punteggio nelle partite vere).
   - C: ridurlo accorciando l'attesa (meno scene di fascia: a 8 minuti erano il 5 %, sotto la banda).
6. **La fascia a schermo è stretta** (foto: eroe a 23 dal centro, sembra mezzo spazio).
   - **A (consigliata): guardarla sul telefono prima di decidere**; se non basta, un giro piccolo che apre la scena solo oltre 28
     dal centro (l'eroe va già verso y 16/84): meno scene ma più larghe, da rimisurare contro la banda.
   - B: alzare subito la soglia a 28 in questo ramo (non misurato: la quota potrebbe uscire dalla banda).
   - C: lasciare così.
5. **Dal giro 324, ancora aperti:** «fra le linee» resta il tipo più frequente (26 scene su 70) e i cross dei compagni verso
   l'eroe sono pochi (3 su 70).

## File
- `src/14-motore-possesso.jsx` — la correzione (cercare `345`).
- `tests/visual/fasce-345.mjs` — guardiano; `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (riga `src/14` della MAPPA).
- `docs/sviluppo/giro345/misura-345.mjs` — sonda delle partite vere (per eseguirla va copiata in `tests/visual/`).
- `docs/sviluppo/giro345/partite-*.txt` — uscita completa dei due bracci.
