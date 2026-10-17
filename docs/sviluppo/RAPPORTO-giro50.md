# Rapporto giro 50 — PO-271: i rossi preesistenti dei guardiani

Ramo `sviluppo/guardiani-271-giro50`, partito da `lavoro/172-base` (39776cd, gioco 7.999.171). Decisione PO 16/10: «giro dedicato
ai rossi preesistenti». `GAME_VERSION` e `SAVE_VERSION` **non** cambiate (le cambia l'unione). Zona G ferma. Nessun push su `main`,
nessun force push.

Criterio per ogni guardiano: **verde con la correzione accesa E rosso stabile col suo interruttore, almeno 3 esecuzioni di fila**.

⚠️ **Carico della macchina.** Per buona parte del giro tre lavori in parallelo hanno portato il carico a 14-28 su 4 CPU. Sotto
quel carico le misure GLB diventano false: una corsa di difesa-252 ha dato «eroe fermo 1,00» ovunque, anche nel braccio reale (GLB
non pronto). Quella corsa è stata scartata. Da lì in poi le misure sono state fatte **un browser alla volta**. Le esecuzioni
contate qui sotto sono tutte seriali, salvo dove indicato.

## Tabella

| guardiano | causa misurata | correzione | verdi | rossi |
|---|---|---|---|---|
| `difesa-252` | Dal giro 31 (`__CPM_NO_POSTO31`) il portatore apre la scena a 1,5u dall'eroe. Bisezione su worktree: gi133 col pallone a 51u su 5eb5500, a 1,5u dopo e135a74. L'attesa del contrasto (pallone oltre 5u) non scatta più: contatore `__CPM_DIF252` = 0 su 4 scene in entrambi i bracci, rosso cieco. In più il tetto dell'attesa è sceso a 0,5 s (`__CPM_NO_ATT220`). | **Guardiano**, tre bracci. REALE (gioco com'è, 2 s): nessuna scena ≥ 0,8. PROVA (`NO_POSTO31`+`NO_ATT220`, la condizione originale del difetto): nessuna ≥ 0,8 e correzione attiva. ROSSO (PROVA + `__CPM_NO_DIF252`): almeno 2/3 ≥ 0,8. PROVA e ROSSO si misurano sui primi 0,8 s: su 2 s il rosso usciva a 0,42-0,43 una volta su tre, perché dopo ~0,9 s parte la spinta del contrasto 7.420. gi130 escluso dai bracci di prova (lì l'attesa scatta a caso). | 3/3 consecutive (finestra 0,8 s): reale 0/4, prova 0/3 (correzione attiva 3/3), fermo prova 0,05-0,07 | 3/3 con 3/3 scene a 1,00 |
| `rinvio-252` | Le distanze dei rinvii di gi133/31/130/146 oggi sono corte e **variabili** fra giri (gi133: 20,7u in un giro, 7,2u nel successivo; bersaglio con componente casuale preesistente). Il rosso superava 40 u/s solo per caso. La misura campionata (`__CPM_GK229`) seguiva spesso un altro volo (2u in 0,4 s). Il testimone `__CPM_RINVIO252` si scriveva solo a correzione accesa. | **Testimone** (`src/12`, solo `__CPM_REC`): ora scritto in entrambi i bracci, con `no:1` nel rosso. **Guardiano**: il giudice è la velocità di progetto dell'arco d'esito (distanza / durata) nel punto in cui la correzione decide. Scene con rinvio lungo e stabile: gi36 «Duello aereo su corner» 28,7-29,1u e gi35 «Contropiede» 23,2u, 5 giri su 5 ciascuna. Verde su 7 scene ≤ 32 u/s; rosso su gi36+gi35 almeno una oltre 40. | 3/3 (v max 26,1 u/s) | 3/3 (gi36 47,8-48 u/s · gi35 38,7) |
| `testa-143` | Il rosso A (`__CPM_NO_TESTA43`, scarico) si vede. Il rosso B (`__CPM_NO_TESTA43B`) non porta **mai** il pallone in rete nella finestra osservata, neanche sul commit stesso del giro 43 (075e61f: x 60-78, 4 giri). La scena d'esito si chiude a tempo reale (cineBusy spento sotto cpmtest) con l'arco ancora in volo: è il confondente del 7.460. In più, col rosso combinato lo scarico allunga la costruzione e il colpo di testa non parte nella finestra (bersaglio nullo). | **Guardiano**: i due rossi sono separati. A = scarico presente. B (solo `NO_TESTA43B`, #126/1) = il **bersaglio** del colpo di testa nell'istante in cui viene deciso (`__CPM_HDR786.tx`, mondo) mira la porta (≥ 40, x logico ≥ 90). Verde: bersaglio < 30 (il compagno). | 4/4 (bersaglio verde 15,7-19) | 4/4 (scarico 3/3 · bersaglio B 43-43,6) |
| `spot-266` (PO-266 riaperta) | Sonda per fotogramma su gi64 (GLB spento). Al **primo** fotogramma in `hl_choose` la mesh del vecchio battitore è ancora alla bandierina (97,5; 1,9); al fotogramma dopo lo stacco la porta a (90; 51,5). Lo snap si arma al cambio di chiave e gira al fotogramma successivo (`_lastSitKey`). Sotto carico la pagina va a 2-5 fps e quel fotogramma dura 200-500 ms: il campionamento lo coglieva. A 60 fps è un fotogramma, dentro lo stacco nero: **nessun difetto del gioco**. | **Guardiano**: si campiona dopo tre fotogrammi della scena nuova. Ho anche provato una correzione nel gioco (il battitore logico tornava in formazione, `__CPM_NO_SPOT271`). La mesh non cambiava (il bersaglio dello snap è già (90; 51)), quindi l'ho **ritirata**: non era un difetto vero. | 4/4 | 4/4 (`__CPM_NO_SPOT266`: incollati 1 su 126 e 64) |
| `rimbalzo-189` | Il tabellino del motore arriva 15-26 s dopo il primo disegno del campo, oltre la finestra fissa di 14 s: il rosso restava a 0 px. | **Guardiano**: la finestra segue l'evento (si osserva fino a 3 s dopo la comparsa della striscia, tetto 60 s); il verde osserva almeno 25 s. | 3/3 (fermo a 74 px) | 3/3 (salto 0 → 73 px) |
| `testa-76` | gi171 riuscito, GLB acceso, pagine nuove: 4 giri su 8 con quota all'impatto 0,49-0,60. Il pallone passa accanto alla testa (0,26u, quota 1,47-1,65) **prima** che l'arco sia armato. All'armo è già a 1,35-1,47, sotto il pavimento 1,5 della regola 7.999.76, che quindi non scatta: è una gara fra armo e discesa. | **Gioco** (`src/12`): pavimento della banda di quota 1,5 → 1,3, che è la quota minima che il guardiano accetta. Nuovo rosso di ritirata `__CPM_NO_TESTA76B` (ripristina 1,5). Il rosso del guardiano resta `__CPM_NO_TESTA76`. | 3/3 (1,47-1,54). Sonda: 6/6 fra 1,44 e 1,57 | 3/3 (0,85-0,89) |
| `testa-146` | Col solo `__CPM_NO_TESTA146` il rosso non vede il difetto: l'attesa del 146 non scatta sulle scene forzate (7/7 a 0 s, testa già a 0,24-0,47u), perché a monte il 7.999.76 sincronizza già il colpo. | **Guardiano**, tre bracci: gioco com'è (gi6/gi44 ≤ 1,0); solo `NO_TESTA76` (gi6/gi7 ≤ 1,0: il 146 ripara da solo); rosso `NO_TESTA76`+`NO_TESTA146` (almeno 2 scene ≥ 2,5). Ripiego sul testimone `__CPM_TESTA146` quando `__CPM_P1B2` non scrive. | 3/3 + 1 dopo la correzione di testa-76 | 3/3 (gi6/gi7 2,62-2,75; margine sopra 2,5 sottile) |
| `gala-3d` | Il verde falliva su «Il premio è tuo». Dalla 7.999.124 (PO-199) la busta si svela dal terzo al primo posto, e il guardiano non lo sapeva. | **Guardiano**: clicca gli svelamenti fino al vincitore, poi gli stessi controlli. | 3/3 | 3/3 (`--rosso`) |
| `seme-a` | La divergenza «17', #486» **non si riproduce** sulla 7.999.171: tre partite intere identiche. Trovato invece un difetto dello strumento con STOPMIN: ogni giro si fermava in un istante diverso del minuto d'arresto e la coda del giro più lungo veniva contata come divergenza («#706 al 25'»). | **Guardiano**: confronto troncato ai minuti completi; giri raccoglibili uno per chiamata (`SEME_OUT`/`SEME_DA`). | 3/3 (2 composte) | 3/3 (`__CPM_NO_SEME`: 6', 6', 1') |
| `framing-guard` | (1) Attesa fissa di 2,4 s **reali**: sotto carico 864 fotogrammi su 191 scene contro 5.281 di riferimento. (2) La soglia 0,11 era tarata sulla taglia 0,18 (7.509); la partita normale chiede 0,12 dal 7.713 (decisione PO, `_tg5` in `src/12`), con resa attesa ~0,09. | **Guardiano**: attesa in tempo di scena (`__CPM_SCENET` +1,3 s, tetto 25 s). Soglia verde 0,11 → **0,085**, ritaratura sulla taglia decisa dal PO e non un abbassamento per far passare. Nuovo script `framing-guard:rosso` (`CPM_NO505`, soglia 0,07). | 3/3 (mediana 0,097-0,099 · fuori quadro 2,4-4,1%) | 3/3 (0,054-0,057) |
| `difesa-220-scena` | I «contrasti mai partiti» erano quasi tutti **troncamenti dello strumento**: gesto partito subito (attesa 0) ma fermo a u = 0,08-0,09 perché la finestra d'esito (tempo reale sotto cpmtest) si chiude prima. Dipende dal carico, da qui l'instabilità. | **Guardiano**: «mai partito» conta solo se l'attesa ha consumato la scena (≥ 0,4 s); i troncati sono dichiarati «strumento». Il braccio rosso `__CPM_NO_INTRO220` ora blocca (prima era solo dichiarato). `GIUDICA_DA` per partite raccolte una per chiamata. | 3/3 | 3/3 (un contrasto in hl_intro per partita) |

Le esecuzioni di seme-a, framing-guard e difesa-220-scena sono del primo aiutante del giro. Parte di esse è stata fatta con carico
12-28: seme-a tutte e sei, difesa-220-scena corse 1-2, framing-guard rosso 1. Vanno ripetute a macchina scarica prima di
considerarle definitive (vedi «Controlli finali» per seme-a sul build finale).

## Modifiche al gioco (`src/12-three-match-view.jsx`)

1. **testa-76**: pavimento di quota 1,5 → 1,3 nella regola del colpo di testa che parte quando il pallone attraversa la testa.
   Rosso di ritirata `__CPM_NO_TESTA76B`. Difetto vero misurato: 4/8 → 0/6+3.
2. **Testimone del rinvio**: `__CPM_RINVIO252` scritto anche a correzione spenta. Solo strumentazione sotto `__CPM_REC`,
   nessun effetto sul gioco.

Una correzione per spot-266 (`__CPM_NO_SPOT271`) e un testimone di collaudo (`__CPM_SNAPSKIP271`) sono stati scritti, misurati e
**ritirati**: il difetto non era nel gioco.

## Catene (`tests/visual/ci-runner.mjs`)

- `completa`: rientrano `difesa-252`, `rinvio-252`, `spot-266`, `testa-143`.
- `carriera`: rientra `rimbalzo-189`.
- `seme-a`, `framing-guard`, `testa-76`, `gala-3d` non erano in nessuna catena (non risulta che ne siano stati tolti:
  `git log -S` su `ci-runner.mjs` vuoto), quindi non ve li ho aggiunti. È una decisione da prendere col PO. `testa-146` è già nella
  `grafica`, `difesa-220-scena` già nella `completa`.

## Aperti dichiarati

- **Pallone ai piedi del difensore.** Dal giro 31 la scena difensiva si apre col pallone a 1,5u dall'eroe (portatore addosso).
  La correzione 252 sull'attesa oggi non gira mai nel gioco reale (contatore 0). Il guardiano la prova nella condizione originale.
  Se il PO vuole che il portatore parta più lontano, la 252 torna utile da sola.
- **testa-143 B** si giudica sul bersaglio, non sull'atterraggio: a fps headless la scena si chiude prima che l'arco arrivi.
- **difesa-220-scena**: a fps bassi la metà «mai partito per attesa» è di fatto cieca, con 6-8 gesti su 8 troncati.
- **seme-a**: la divergenza storica al 17' non è riprodotta. Non posso confermare che sia sparita per sempre.
- Durante il giro un mio controllo di sintassi ha avviato per errore `ci-runner.mjs completa` (`node -e import(...)`). L'ho fermato
  dopo ~2 minuti, uccidendo per PID solo quei processi. Non ha scritto nel registro di stabilità.

## Controlli finali sul build del ramo (seriali)

`test:logic` · `save-compat` · `design-system` · `typing-shortcuts` · `career-critical` · `replay` verdi;
`validate-situations` ✅ PASS (fingerprint 00001505, 0 failure); `seme-a` sul build finale ✅ (3 giri identici, 1-0, seme 2311).
Non eseguita la catena mirata completa di `src/12` (circa 40 guardiani): la modifica al gioco tocca solo la regola del colpo di
testa (testa-76/146/143 rieseguiti dopo) e un testimone di collaudo. La mirata va fatta all'unione.
