# RAPPORTO giro 305 — `corpi-073` braccio 284f instabile (seme 29, codice 001)

Ramo `sviluppo/giro305-corpi`, partito da `prova/198-finale` (0f0b13d8; `GAME_VERSION` non toccata).
Rosso del giro: `window.__CPM_NO_G305`. Guardiano nuovo: `npm run scatto-305`. Base di confronto: `lavoro/198` (b3b75b9d), in un albero
di lavoro separato.

Tutti i numeri vengono da corse eseguite in questa sessione (headless, 412×915, un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`).
Dove un numero viene dai rapporti V2d e R3 lo dico. Dove una cosa non l'ho potuta confermare lo dico.

## In breve

- **Il rosso è riprodotto e il meccanismo è misurato.** Non è il battitore e non è il compagno: è il **pallone**. Nell'apertura rossa
  il pallone resta sul punto della scena precedente (71,6 ; 27,8) e va verso la bandierina a circa 13 u al secondo, per tutta la
  finestra di misura. Il battitore è al suo posto sulla bandierina, ma il pallone non c'è ancora: da qui «compagno più vicino ≥ 3,7 u».
- **La causa è l'ordine di due aggiornamenti nella scena forzata** (`__CPM_FORCE_SIT`, il percorso del banco e della rassegna): il
  «timbro» della messa in scena arriva un aggiornamento PRIMA del pallone sul punto. Il 3D rimette il pallone a posto una volta sola,
  quando vede il timbro: se quel fotogramma cade fra i due aggiornamenti, rimette il pallone sul punto vecchio.
- **Lo stesso ordine c'è anche sulla base** `lavoro/198` (codice identico in quel punto). **Quale giro dell'unione lo renda più
  frequente non posso confermarlo**: vedi «Giro responsabile».
- **Correzione**: nella scena forzata il pallone va sul punto della messa in scena nello stesso aggiornamento del timbro (9 righe in
  `src/15`, solo dentro `__CPM_FORCE_SIT`). Nessuna soglia toccata, sonda `corpi-073` invariata nelle misure.
- **Dopo**: `corpi-073` 284f **10 corse verdi su 10 di fila** (60 aperture, tre semi), primo scatto del pallone sul punto in 60 su 60.

## 1. Frequenze prima e dopo

Braccio 284f. «Apertura» = una scena d'angolo forzata su una pagina nuova (due per seme a corsa).

| dove | come | corse | corse rosse | aperture | aperture col codice 001 |
|---|---|---|---|---|---|
| unione 0f0b13d8 (V2d + R3, dai rapporti) | tre semi | 5 | 2 | 30 | 2 |
| unione 0f0b13d8 (questa sessione) | solo seme 29 | 14 | 1 | 28 | 1 |
| base b3b75b9d (V2d + R3, dai rapporti) | tre semi | 5 | 0 | 30 | 0 |
| base b3b75b9d (questa sessione) | solo seme 29 | 12 | 0 | 24 | 0 |
| **unione + correzione (questa sessione)** | **tre semi** | **10** | **0** | **60** | **0** |

Sull'unione il rosso è uscito in 3 aperture su 58 (circa 1 su 20). Sulla base in 0 su 54.

Con la provocazione (pallone in ritardo di 400 ms, vedi §4) il rosso esce sempre: 2 aperture su 2 senza correzione, 0 su 2 con la
correzione.

### Il precursore (misura più fitta del rosso)

Dal registro `__CPM_SNAP42` (dove lo scatto di scena mette il pallone), per apertura:

| dove | 1° scatto già sul punto | 1° scatto sul punto vecchio, 2° sul punto | 1° e 2° sul punto vecchio (= rosso) |
|---|---|---|---|
| unione, 24 aperture (le ultime 12 corse; delle prime 2 non ho tenuto il registro) | 19 | 4 | 1 |
| base, 24 aperture | 22 | 2 | 0 |
| unione + correzione, 60 aperture | 60 | 0 | 0 |

Sull'unione il primo scatto cade sul punto vecchio in 5 aperture su 24, e in 1 di queste anche il secondo.

Il rapporto R3 aveva già visto sulla base il «primo scatto lontano dal punto» in 6 aperture su 18: la finestra esiste anche lì.

## 2. Il meccanismo dello scatto

Chi scrive il pallone e in che fase (lettura: `hl_move`, cioè prima della scelta):

1. La sonda chiama `__CPM_FORCE_SIT`. In UN aggiornamento arrivano: scena nuova, fase di lettura, posizione dell'eroe e **timbro della
   messa in scena** (`stageStamp`, perché la forzatura chiama `stageSitPositions` direttamente).
2. Il pallone sul punto (bandierina, 97 ; 2,5) lo mette l'effetto «Ball attachment» di `src/15`, che gira DOPO quell'aggiornamento:
   il pallone arriva quindi un aggiornamento più tardi.
3. Nel 3D (`src/12`): al cambio di scena lo **scatto di scena** mette il pallone dove dice il gioco in quel momento (scrittore
   «scena»). Quando vede il timbro nuovo arma UN **ri-taglio** («staging», 7.456) che al fotogramma dopo ripete lo scatto. È uno solo
   per scena.
4. Se tutti e due i fotogrammi cadono fra l'aggiornamento 1 e l'aggiornamento 2 (sul banco i fotogrammi durano 100–220 ms), tutti e
   due gli scatti mettono il pallone sul punto vecchio. Da lì in poi nessuno lo rimette di colpo: lo porta l'**inseguitore** del punto
   logico, a circa 13 u al secondo. Misurato nella corsa rossa: pallone a 73 ; 26 dopo 0,83 s, a 93 ; 7 dopo 2,33 s; compagno più vicino
   fra 16,2 e 5,2 u; codice 001 in 15 campioni su 15.

Registro della corsa rossa (mondo): scatti a `[21,6 ; −15,1]` e `[21,6 ; −15,1]`. Nelle verdi: `[21,6 ; −15,1]` poi `[47 ; −32,3]`,
oppure subito `[47 ; −32,3]`.

**Nel flusso vero questo ordine non c'è**: lì la messa in scena e il pallone nascono nello stesso giro di effetti, quindi nello stesso
aggiornamento. Questo l'ho ricavato leggendo il codice (`src/15`, effetto della fase `hl_intro` e effetto «Ball attachment»), non
misurandolo in partita vera: vedi «Dubbi per il PO».

## 3. Giro responsabile

**Non posso confermarlo.** Quello che ho:

- Il punto di codice del difetto (forzatura → timbro prima del pallone; ri-taglio unico) è **identico** su base e unione: nessuno dei
  giri 293–302 lo tocca (letto il diff `lavoro/198 → prova/198-finale` di `src/12` e `src/15`).
- Il rosso è una gara fra il ciclo di disegno e due aggiornamenti: un giro può solo spostarne i tempi.
- Frequenze: unione 3 su 58 aperture, base 0 su 54. Se la frequenza fosse uguale sui due lati, un risultato così sbilanciato uscirebbe
  circa 1 volta su 7: è un'indicazione, non una prova.
- **Gli interruttori `__CPM_NO_G293 … __CPM_NO_G302` non li ho misurati.** Con un rosso da 1 apertura su 20 servono circa 75 aperture
  per interruttore per avere una frequenza (oltre 30 minuti l'uno, 9 interruttori): fuori dal tetto del giro. Ho scelto di cercare
  il meccanismo direttamente, e trovato quello la correzione non dipende dal giro. La sonda ora ha il comando per farlo
  (`CPM_SPENTI073=__CPM_NO_G293`), se il PO lo vuole.
- I quattro sospetti (293, 301, 294, 295) letti riga per riga: nessuno scrive il pallone nella fase di lettura di una scena d'attacco
  (293: portatore difensivo e ricevente nominato; 301: solo in `hl_result` di un'azione fallita; 294: solo nell'ingresso in campo;
  295: portiere e arco della parata).

## 4. Correzione e guardiano

- `src/15-live-match.jsx`, dentro `__CPM_FORCE_SIT`, subito dopo `stageSitPositions`: se la messa in scena ha un punto del pallone
  (bandierina, rimessa, compagno: non «eroe», non «portiere»), il pallone logico va lì nello stesso aggiornamento. La sorgente è la
  stessa dell'effetto (`_stagedSpotRef`), non c'è un secondo calcolo. Rosso `window.__CPM_NO_G305`.
- Solo collaudo (`?cpmtest=1`): `window.__CPM_RIT305=<ms>` ritarda il piazzamento dell'effetto, per provocare la finestra a comando.
- `tests/visual/corpi-073.mjs`: due comandi nuovi, nessuna misura cambiata — `CPM_SPENTI073` (interruttori accesi prima del
  caricamento) e `CPM_RIT073` (la provocazione).
- Guardiano `npm run scatto-305` (registrato nella mappa della catena mirata, prima riga di `src/15`): esegue `corpi-073 284f` col
  ritardo di 400 ms, due bracci. Esito in questa sessione: **verde 0 aperture su 2 col codice 001; rosso 2 su 2** (16/16 e 16/17
  campioni, primo scatto a 35,8 u: la stessa firma del rosso spontaneo).

## 5. Controlli eseguiti

| controllo | esito |
|---|---|
| `corpi-073 284f`, tre semi, 10 corse di fila | VERDE 10 su 10 (60 aperture, 0 col codice 001; primo scatto lontano dal punto 0 su 60; 161–177 s a corsa) |
| `corpi-073` intero (282, 283, 284f) | NON ESEGUITO (tetto di tempo): i bracci 282 e 283 non sono stati rieseguiti dopo la correzione |
| `scatto-305` | VERDE (rosso di prova visibile) |
| `portatore-293` | VERDE (verde 0 difetti su 14 scene; rosso visibile: 5 su 5 e 1 su 2) — 556 s |
| `test:logic` | VERDE 51 su 51 |
| `save-compat` | VERDE 12 su 12 |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | IDENTICO BYTE PER BYTE |

Non eseguiti (per regola del giro): `highlight-95`, `ingresso-206`, `career-critical`, `ci-runner mirata`. Non eseguiti per tempo:
gate 14/14 (`validate-situations`), `corpi-073` bracci 282 e 283, `esito-rete-301`, `ingresso-294`, `portiere-295`. «Non giudicato» = rosso.

## Dubbi per il PO

1. **Il gate 14/14 non l'ho eseguito.** La correzione sta nel percorso che il gate usa per forzare ogni scena: il pallone arriva sul
   punto un aggiornamento prima, il punto è lo stesso. Mi aspetto firme invariate (il pallone non è nella firma `golden`), ma non
   l'ho misurato. Va fatto girare prima dell'unione.
2. **Giro responsabile non attribuito** (§3). Se serve saperlo: circa 75 aperture per interruttore con `CPM_SPENTI073`. La mia lettura
   è che non ci sia un giro colpevole ma una finestra già presente sulla base, resa visibile da tempi diversi; è una lettura, non una
   misura.
3. **Flusso vero non misurato.** Che in partita vera timbro e pallone arrivino insieme l'ho letto nel codice. Il braccio `284v` di
   `corpi-073` (angoli del motore) non l'ho eseguito. Se sul telefono un'apertura d'angolo desse ancora il codice 001, il passo
   successivo sarebbe nel 3D: far ripetere il ri-taglio del pallone quando arriva il punto, non solo quando arriva il timbro.
4. **La rassegna del PO usa lo stesso percorso** (`__CPM_FORCE_SIT`): la correzione vale anche lì. Non l'ho provata nella rassegna.
