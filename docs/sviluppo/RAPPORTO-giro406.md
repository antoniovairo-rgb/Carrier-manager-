# Rapporto giro 406 — riparazione dei 4 rossi del treno della 217

Base: `lavoro/201` punta `ccbed196` (7.999.216 + vagoni 372-377). Ramo: `sviluppo/giro406-riparazione-217`.
Fonte dei rossi: treno corsa 45847072319 (parti 10, 21, 28, 31), log dei job letti via API.
**Esito in breve: nessuno dei quattro rossi è un difetto del gioco e nessun vagone l'ha causato.** Tre sono
guardiani instabili o ciechi, uno (difetti-373) era un guardiano nuovo che non poteva mai essere verde sulla parte B1.
Nessuna riga di `src/` toccata → nessun interruttore `__CPM_NO_G406` (non c'è niente da spegnere nel gioco).
Nessuna soglia abbassata. GAME_VERSION e `docs/governo` non toccati.

## File toccati

| File | Cosa |
|---|---|
| `tests/visual/stadi-071.mjs` | `costruisci()`: draw call e triangoli = mediana di 40 fotogrammi (`CPM_CAMPIONI406`); meno campioni = cieco |
| `tests/visual/difetti-373.mjs` | `ritiro()`: rilegge `window.__CPM_CAREER` dopo `patch`; B2: attesa del fischio sul progresso del cronometro |
| `tests/visual/misura-375.mjs` | `misura375()`: catalogo per `intent==='freekick'`; scarta le voci del testimone con la chiave di una scena già letta |
| `tests/visual/scatto-305.mjs` | provocazione di default `CPM_RIT305` 400 → 1200 ms |
| `tests/visual/misura-406.mjs` | nuova sonda: draw call fotogramma per fotogramma, a camera ferma |

## 1. stadi-071 — «mattoni: 329 draw call oltre il tetto 322»

- **Causa (misurata):** il guardiano leggeva le draw call da **un solo fotogramma**. Con la camera ferma
  (`__CPM_CAM904`) e la stessa pagina, in 40 fotogrammi la sonda `misura-406.mjs` legge: mattoni 257-354,
  catino 224-327, tedesco 271-382. Il tetto nasce dal riferimento (gli stadi di oggi) letto allo stesso modo,
  quindi due campioni casuali uno contro l'altro. Sullo stesso commit tre giri hanno dato tetti 322 (treno), 352, 367.
  Quale oggetto della scena fa oscillare il conto: **non posso confermarlo**, non l'ho isolato. La camera è ferma,
  quindi dipende da ciò che si muove nella scena.
- **Vagone colpevole:** nessuno. Riprodotto su `486591b2` (prima dei vagoni) con la stessa variazione
  (catino 327 su base contro 244 sulla punta in un giro, e al contrario in un altro). I vagoni non toccano `buildStadium`.
- **Correzione:** riferimento e candidato si leggono allo stesso modo, come mediana di 40 fotogrammi. Tetto (+8% sul
  più caro di oggi), luci e mesh **invariati**. Il log stampa anche min e max.
- **Prima/dopo:** prima (punta) verde 1 volta su 1 in locale, rosso sul treno. Dopo: due giri in parallelo sulla punta,
  verdi, tetti 356 e 352 (contro 322/352/367 di prima), mattoni mediana 300 e 311. Il rosso (`__CPM_NO_STADI246`)
  continua a vedersi.

## 2. difetti-373 — «9 parti · 7 verdi · 0 rosse · 2 non giudicate»

- **Causa (misurata):** le due parti B1 (ritiro con la sfida) prendevano `C = window.__CPM_CAREER` **prima** di
  `C.patch(...)`. Quell'oggetto si registra a ogni render, quindi le sue funzioni chiudevano sul giocatore di prima:
  senza addio annunciato e con la sfida del salvataggio (`sempreverde`). `C.startNewSeason()` faceva un passaggio di
  stagione normale, e il ritiro non arrivava mai. Lo prova il log del treno: anche la parte «Bomber» riporta
  `challenge:{id:"sempreverde"}`. Riprodotto in locale: stesso «non giudicato», deterministico.
- **Vagone colpevole:** nessun difetto del gioco. Il guardiano arriva col vagone 373 e da quel vagone non poteva
  essere verde su B1. Sulla base non esiste.
- **Correzione B1:** dopo l'attesa del render si rilegge `window.__CPM_CAREER` (per `startNewSeason` e per `snapshot`).
- **B2 (finale della Coppa delle Nazioni):** sul treno era verde. In questa sessione era «non giudicato» su entrambi i
  bracci: misurato, la finale scorreva a ~20 s di parete per minuto ed era al 44' dopo i 400 s fissi. Ora si aspetta
  il fischio finché il cronometro (`__CPM_CLOCK`) o la fase si muovono. Ferma per 120 s = non giudicata, tetto di
  sicurezza 1500 s.
- **Prima/dopo:** prima verde 7/9 (2 non giudicate). Dopo: **verde 9/9**. Il rosso (`CPM_ROSSO373=1`) è 7 rosse +
  2 «non peggiora» uguali, uscita 1 come atteso: B1 Sempreverde e Bomber sono rossi, B2 è rosso.

## 3. barriera-375 — «gi150 non giudicata (non punizione)»

- **Causa (misurata):** la sonda sceglieva le punizioni del catalogo **dal testo** (`/punizion/i`). gi150
  «🎭 Guadagna una punizione!» è un dribbling: `intent` e `deriveIntent` danno `dribble`, mentre le altre sette danno
  `freekick`. Sul treno è stata letta correttamente come «non punizione». In locale invece passava come «giudicata»
  per un altro difetto della sonda: la voce letta aveva pallone 23,2.04 e bersagli identici a gi81, la scena di prima.
  Il testimone `__CPM_PUN343` veniva riempito dalla scena precedente dopo l'azzeramento, finché il cambio di scena non
  arrivava al 3D. Era un **falso verde**.
- **Vagone colpevole:** nessuno nel gioco. Il guardiano arriva col vagone 375.
- **Correzione:** catalogo per `intent==='freekick'`, la stessa regola del gioco (`_hlSetPiece` in src/15). Le voci
  con la chiave di una scena già letta si scartano.
- **Prima/dopo:** prima rosso sul treno (falso verde in locale). Dopo: **verde 12 scene**, 7 del catalogo e 5 del
  motore, tutte a 9,15 m con scarto 0 dalla linea. Il rosso si vede in 12 scene su 12. Resta sopra il pavimento di 10 scene.

## 4. scatto-305 — «rosso non visibile: codice 001 in 0/2 aperture»

- **Causa (misurata):** il rosso del treno non era nel braccio verde, che sul treno aveva 0/25 e 0/24. Era il
  **braccio rosso a non vedersi**: 001 in 14/24 e 13/23, sotto il 75% di corpi-073. In locale il braccio rosso ha
  due modi, su base e punta allo stesso modo: uno netto (21/21, scatto a 74,2 u) e uno al limite (16-17/21, scatto
  a 35,8 u). Il treno ha pescato due volte il secondo. La provocazione `__CPM_RIT305` è un `setTimeout` in
  millisecondi di **parete**, quindi la quota di campioni col difetto dipende dalla velocità della macchina.
- **Vagone colpevole:** nessuno. Su `486591b2` il rosso locale è identico (21/21 e 17/21).
- **Correzione:** provocazione di default 1200 ms. La soglia del 75% non cambia: cambia solo quanto forte si provoca.
- **Prima/dopo:** a 400 ms il rosso era al limite (16/21 locale, 13/23 sul treno). A 1200 ms: rosso 23/23 e 23/23,
  verde 0/20 e 0/21.

## Sentinelle

`node ci-runner.mjs giro stadi-071 difetti-373 barriera-375 scatto-305`: vedi la sezione «Esito del giro» in fondo.

## Dubbi per il PO

1. **stadi-071, statistica della misura.** Opzioni:
   (a) **mediana di 40 fotogrammi per riferimento e candidato** (consigliata, applicata);
   (b) massimo su 40 fotogrammi, il caso peggiore, più severo ma più rumoroso;
   (c) togliere dalla misura ciò che si muove (corpi, palla), per un conto del solo impianto.
   Tetto e margine non cambiano in nessuna delle tre. Resta un'oscillazione della mediana di ±15-25 fra un giro e
   l'altro, ben sotto lo spazio che oggi c'è fra mattoni e tetto (~40-50).
2. **scatto-305, provocazione in tempo di parete.** Opzioni:
   (a) **ritardo più forte, 1200 ms** (consigliata, applicata, nessuna riga di gioco toccata);
   (b) esprimere il ritardo in tempo di scena dentro `src/15`, un ritocco di solo collaudo ma nel file di gioco;
   (c) far contare a corpi-073 il «modo al limite» come rosso, scartata perché sarebbe abbassare la soglia.
3. **difetti-373 B2, durata.** Opzioni:
   (a) **attesa sul progresso del cronometro, ferma 120 s = non giudicata, tetto 1500 s** (consigliata, applicata);
   (b) tenere i 400 s fissi, che su una macchina lenta danno «non giudicato» e quindi rosso;
   (c) accorciare la finale col pilota su `tickMs` più basso, che però non accelera il cronometro del gioco.
   Nota: sul banco di questa sessione B2 dura minuti. Se la parte del treno che lo ospita si allunga troppo, va
   ribilanciata in `DURATE-GUARDIANI.json`, che non ho toccato (sta in `docs/governo`).
4. **misura-406.mjs** è nominata nel commento di stadi-071: se il trenino la conta come file di stadi-071, un ritocco
   della sonda fa girare quel guardiano. Mi pare corretto, ma lo segnalo.

## Esito del giro

`node ci-runner.mjs giro stadi-071 difetti-373 barriera-375 scatto-305` sulla punta del ramo (7.999.216 + vagoni):
**21/21 verdi**, cioè i 4 guardiani più le 17 sentinelle, nessun «instabile» segnalato. Durate: stadi-071 126 s ·
barriera-375 121 s · scatto-305 106 s · **difetti-373 1582 s** (verde + rosso, a due passi in parallelo) ·
partita-vera 643 s · career-critical 323 s.
⚠️ difetti-373 dura ora ~26 minuti sul banco, sul treno 193 s col vecchio tetto di 400 s. Il tempo va quasi tutto
alla finale di B2, che adesso si aspetta fino al fischio. Vedi il dubbio 3.
