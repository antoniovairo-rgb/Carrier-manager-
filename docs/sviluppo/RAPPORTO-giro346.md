# Rapporto giro 346 — il tiro che «torna indietro» (PO-585) e i movimenti che contano (PO-561)

Base: `lavoro/201` (fd2b933). Ramo: `sviluppo/giro346-tiro-movimenti`. GAME_VERSION non toccata.

Le due voci PO-585 e PO-561 non stanno nel BACKLOG di `lavoro/201`: le ho lette da `origin/main:docs/governo/BACKLOG.md`.

## Cosa chiedeva il PO

- **PO-585** (taccuino 7.999.198, S.1 W.30, 19' contro FC Werkstadt, «Ricevi fra le linee: hai spazio!» → «Tiro da fuori» → miss).
  Bozza: codice 012, pallone tornato indietro di 19,0 u, scrittore 16. PO: «c'è uno scambio con un compagno di squadra invisibile».
- **PO-561**: «I movimenti incidono sulla probabilità di successo della giocata o è solo "un abbellimento", dovrebbero contare davvero!»

## PO-585 — cosa ho misurato

Sonda nuova `tests/visual/misura-346.mjs` (scena dal motore o dal catalogo, esito scelto, arretramento del pallone letto sul testimone
di bordo e dentro la finestra d'esito, firma dello scrittore).

Lo scrittore 16 è il blocco «esito» di `src/12` (tutti i dopo-arco). Arretramento per tipo d'esito sbagliato, prima della correzione:

| Esito | Arretramento (u) | «codice 012» |
|---|---|---|
| fuori | 0,6 – 4,4 | no |
| respinto da un difensore | 2,9 – 3,0 | no |
| parato | 6,1 – 8,3 | no |
| **palo/traversa** | **13,8 – 14,2** | **sì, 7 scene su 7** |

Causa: dal legno il pallone tornava **sempre a x 34 fisso** (riga `ball.position.x+=(34-…)`), cioè 14 u dentro il campo, verso chi
aveva tirato da fuori, e lì restava senza che nessuno lo prendesse. È l'unico esito che riproduce la firma della nota (012 + scrittore 16).

**Cosa NON ho potuto confermare:**
- i **19,0 u** esatti della nota: il massimo che ho riprodotto è 14,2 u;
- che il caso del PO fosse davvero un legno: la nota dice solo «miss», non il tipo d'esito. Il legno è l'unico tipo, fra quelli
  misurati, che supera la soglia del codice 012 (12 u).

### Correzione (`src/12-three-match-view.jsx`, ramo `post_rebound`)

- il rimbalzo dal legno si ferma **5–8 u davanti alla linea di porta** (punto fisso per scena, calcolato dall'arco: niente sorteggi);
- dopo 0,5 s di scena **l'avversario di movimento più vicino (entro 26 u) va a raccoglierlo** (stesso canale del raccoglitore del
  giro 415, `_pkCol415`): il pallone ha un padrone visibile, non «un compagno invisibile».

Rosso `window.__CPM_NO_G346A` = comportamento di prima.

| | Prima (rosso) | Dopo (verde) |
|---|---|---|
| Arretramento nella finestra d'esito, legno | 14,0 – 14,2 u (6 su 6) | al massimo 7,0 u (8 su 8) |
| «codice 012» | 6 su 6 | 0 su 8 |
| Raccoglitore armato | — | 8 su 8 |
| Fuori / parato (non toccati) | 0,6 – 8,3 u | 0,6 – 8,3 u |

## PO-561 — cosa ho misurato

Il sospetto del PO era fondato **per tiro e assist su azione**. Dal 7.999.137 quegli esiti li decide il motore (`giocaScena`, `src/14`)
partendo dal punto dell'occasione: posizione dopo i passi e marcatura non entravano nel conto. La percentuale sul tasto si muoveva
coi passi, l'esito no. Misura del rosso: **0 tiri cambiati su 1090** qualunque mossa si faccia.
(Dribbling, difesa e le altre famiglie passano da un altro conto, che i passi li leggeva già con `defPenalty`: non le ho toccate.)

### Cosa ho cambiato

- `src/15-live-match.jsx`: ogni passo (tasti o pad) accumula spostamento e «stacco dal marcatore» (lo stesso guadagno del giro 317,
  portato fra −1 e +1 per passo); si azzera all'apertura della scena; va a `giocaScena` come `mov`.
- `src/14-motore-possesso.jsx`: `giocaScena` usa la **posizione dopo i passi** (distanza e angolo verso la porta li ricalcola il
  motore, come per ogni altro tiro) e uno **stacco** fra −2 e +2:
  - tiro: resistenza al tiro × (1 + 0,10 · stacco);
  - assist: precisione del passaggio + 0,03 · stacco; tiro del compagno × (1 + 0,05 · stacco).
- Senza passi il conto è **identico a prima** (109 azioni su 109 con lo stesso gol atteso). Nessun sorteggio nuovo: il determinismo
  non cambia (`match-sequence` e `replay` verdi).

Rosso `window.__CPM_NO_G346B` = i passi non arrivano al motore.

### Prima / dopo (banco `tests/visual/movimenti-346.mjs`: 253 azioni di 88 scene × 10 stati, attributi 80)

Riuscita media (gol sul tiro; gol del compagno sull'assist), fino a 2 passi:

| Mossa | Tiro prima | Tiro dopo | Assist prima | Assist dopo |
|---|---|---|---|---|
| fermo | 7,38% | 7,37% | 37,01% | 37,01% |
| mossa migliore | 7,38% | **10,23% (+38,8%)** | 37,04% | **40,00% (+8,1%)** |
| verso la porta | 7,38% | 9,09% (+23,3%) | 37,05% | 36,99% (0%) |
| addosso al marcatore | 7,38% | 7,94% (+7,7%) | 37,17% | 32,81% (−11,3%) |
| all'indietro | 7,38% | 6,74% (−8,5%) | 37,09% | 39,81% (+7,6%) |
| mossa peggiore | 7,38% | **5,31% (−28,0%)** | 37,05% | **32,81% (−11,3%)** |

(«Prima» = braccio rosso. Le differenze di centesimi sul «prima» dell'assist sono rumore del banco: i sorteggi a valle divergono.)

Lettura: muoversi bene vale circa **+3 punti di gol su 100 tiri**, muoversi male ne toglie 2. Chi non si muove non perde niente.

**Nel gioco vero** (partita viva, 2 passi dati dai tasti): il motore riceve i passi e tira dal punto nuovo; col rosso no. Verificato
dentro il guardiano.

**Cosa NON ho misurato:** quanti gol in più a partita fa l'eroe nel flusso vero. Il gioco automatico del banco non fa passi, quindi
`sim-motore` e `partita-vera` non vedono il peso nuovo. Il limite teorico è quello della tabella.

## Guardiano `npm run tiro-346` (verde + due rossi)

- **A verde** — 8 legni (4 scene dal motore + 4 dal catalogo) più un «fuori» e un «parato»: arretramento nella finestra d'esito
  sotto 12 u, nessun «codice 012», bersaglio del rimbalzo 5–8 u dalla linea, raccoglitore armato. Nessuna scena non giudicata.
- **A rosso** (`__CPM_NO_G346A`) — 6 legni: 6 su 6 con ≥ 12 u e «codice 012».
- **Vero** — partita viva, 2 passi dai tasti: il motore li riceve col verde, non col rosso `__CPM_NO_G346B`.
- **B** — banco: tiro mossa migliore fra +15% e +60%, peggiore ≤ −10%; assist migliore ≥ +3%, peggiore ≤ −5%; identità senza passi;
  col rosso 0 tiri cambiati.

Sta in testa alle righe della MAPPA già esistenti per `src/12-|src/13-`, `src/14-` e `src/15-` (`npm run mappa-unica` verde).
Durata sul banco: 481 s.

## Catena del giro

`node ci-runner.mjs giro tiro-346 ball-owner ball-jump-census match-sequence sim-motore` sul commit 0edbdd8: **20 verdi su 22**.

- ✅ tiro-346 · ball-owner · match-sequence · replay · partita-vera · gk-dive-sync · career-critical e le altre sentinelle.
- ❌ **sim-motore**: «gol a partita 2,29 fuori da 2,3–3,5». È il **rosso dichiarato** in `ROSSI-DICHIARATI.json` su main («dal giro 310,
  gol 2,29 contro soglia 2,3; si sistema con PO-599»): stesso numero, non viene da questo giro.
- ❌ **ball-jump-census**: «copertura insufficiente, 3 scene su un minimo di 13» (non un salto: non ha giocato abbastanza scene).
  Rigiocato da solo, senza altri passi accanto: sul ramo **3 scene su 26** (9929 fotogrammi), sulla base `fd2b933` senza le mie
  modifiche **3 scene su 26** (9586 fotogrammi). È rosso uguale sulla base: non viene da questo giro. Non è in `ROSSI-DICHIARATI.json`:
  sul treno comparirà come rosso nuovo finché non si ripara o non si dichiara (dubbio 5). Nelle 3 scene giocate: 6 salti attribuiti,
  tutti dentro uno stacco nero, 0 visibili — ma su 3 scene non è un risultato.

## Dubbi per il PO

**1. Quanto devono pesare i movimenti?**
- **a) Moderato, come applicato (consigliata):** mossa migliore +39% relativo sul tiro (7,4% → 10,2%), peggiore −28%; assist +8% / −11%.
  Si sente senza trasformare ogni occasione in un gol.
- b) Lieve: metà dei pesi (circa +19% / −14% sul tiro). Più prudente per il bilanciamento, ma rischia di restare «un abbellimento».
- c) Forte: pesi doppi (stima circa +75% / −50% sul tiro, **non misurata**). Premia molto il giocatore bravo; va rimisurata la media gol.
- d) Solo premio: i passi sbagliati non tolgono niente. Più gentile, ma muoversi a caso non costa.

**2. La percentuale sul tasto non è la riuscita vera** (c'era già prima di questo giro). Tiro: tasto 12,4%, gol veri 7,4%.
Assist: tasto 8,7%, gol del compagno 37,0%.
- **a) Far leggere al tasto il conto del motore (consigliata):** un giro dedicato; il numero mostrato diventa quello vero, passi compresi.
- b) Togliere il numero e lasciare tre parole (difficile / possibile / buona).
- c) Lasciare così.

**3. Il caso esatto di PO-585.** Ho corretto l'unico esito che riproduce «012 + scrittore 16» (il legno, 14 u), non i 19,0 u della nota.
- **a) Chiudere PO-585 a collaudo sul telefono (consigliata):** se il PO rivede il pallone tornare indietro, la nota nuova dirà il tipo d'esito.
- b) Far scrivere alla bozza del taccuino anche il tipo d'esito (palo / parato / fuori / respinto): la prossima nota si riproduce al primo colpo.
- c) Tenere PO-585 aperta finché non riproduco i 19,0 u.

**4. Dove va il pallone dopo il legno.**
- **a) 5–8 u davanti alla porta e un avversario lo raccoglie (applicato, consigliata).**
- b) Lo raccoglie il portiere.
- c) Esce sul fondo (rimessa dal fondo).

**5. `ball-jump-census` è rosso anche sulla base** (gioca 3 scene in 15 minuti, ne servono 13). Può fermare il rilascio del vagone come rosso nuovo.
- **a) Un giro dedicato a ripararlo (consigliata):** capire perché la partita del censimento produce così poche scene (non l'ho indagato).
- b) Dichiararlo in `ROSSI-DICHIARATI.json` finché non è riparato, come `sim-motore`.
- c) Toglierlo dal trenino e lasciarlo solo al treno grande di notte.
