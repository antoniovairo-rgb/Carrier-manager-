# RAPPORTO giro 301 — PO-588 «esito miss ma la palla è finita IN RETE»

Ramo `sviluppo/giro301-esito-rete`, partito da `lavoro/198` (b3b75b9, 7.999.198; `GAME_VERSION` non toccata).
Rosso del giro: `window.__CPM_NO_G301`. Guardiano nuovo: `npm run esito-rete-301`. Sonde nuove: `tests/visual/misura-301.mjs`
(scene forzate) e `tests/visual/misura-301-partite.mjs` (partite vere).

Tutti i numeri vengono da strumenti eseguiti in questa sessione (headless, 412×915). Dove un numero non l'ho misurato lo dico.

## In breve

**Il caso del PO non l'ho riprodotto.** Su 44 tiri falliti misurati sulla 198 prima di ogni modifica (scena e azione del PO comprese,
forzati e di partita vera, GLB accesi e spenti) il pallone non è mai entrato in porta e il rilevatore del gioco non ha mai scritto
«IN RETE». Stesso esito sulla 196 (0 su 15). **La causa della nota del PO resta quindi non trovata.**

Ho comunque aggiunto una **barriera di ultima istanza**: durante l'esito di un'azione fallita il pallone non può stare oltre la linea
di porta avversaria, fra i pali e sotto la traversa. È provata con una provocazione di collaudo (verde 0 su 8, rosso 8 su 8), non sul
caso reale. È una rete di sicurezza, non la correzione della causa: vedi «Dubbi per il PO».

## 1. Come ho misurato

- «In rete» = pallone oltre la linea di porta (x ≥ 48,6), fra i pali (|z| ≤ 3,66), sotto la traversa (y ≤ 2,44): la stessa geometria
  del rilevatore di bordo (`draftBugNote`, src/10), quello che ha scritto la bozza del PO.
- Per fotogramma, in tutta la finestra d'esito: posizione del pallone, arco vivo, tipo di post-arco (`__CPM_PA457`), e dal testimone di
  bordo (`__CPM_WATCH_SNAP`) chi ha scritto il pallone. A scena finita la sonda chiama il rilevatore del gioco col contesto del tasto ⚠️
  (`__CPM_BUGCTX`).
- Scene forzate: pagina nuova per scena, `__CPM_PRESENT=1`, `__CPM_CINE=1`, fine scena = arco e post-arco spenti da 1,2 s di scena.
  La scena del PO («💥 Palla buona al limite dell'area!») è del motore: la sonda la costruisce con `scenaDalMotoreConclusione` e la
  mette in coda a `SITUATIONS`; l'eroe è messo dove era nella nota (x logico 83,8, y 36).
- «nat» = azione fatta fallire, tipo d'esito deciso dal gioco (chiave «miss», come nella nota). «wide/saved/post/blocked» = tipo
  forzato con `__CPM_FORCE_KIND` (in quel caso anche la chiave d'esito prende quel nome).
- Partite vere: provino, coda reattiva, a ogni scelta un'azione da gol (di preferenza «Piazzato nell'angolo basso») fatta fallire.

## 2. Tabella «196 / 198 prima / dopo»

| | 196 (3076a1b7) | 198 prima (b3b75b9) | 198 + giro 301 (dopo) |
|---|---|---|---|
| Scena del PO forzata, GLB accesi: tiri non-gol col pallone in rete | 0 su 8 | 0 su 8 | 0 su 8 (dentro il guardiano) |
| Altre scene forzate (tiro, testa), GLB accesi: non-gol in rete | 0 su 7 | non misurato | 0 su 24 (dentro il guardiano) |
| Partite vere, GLB spenti (4 pagine, 3 hanno prodotto scene): tiri falliti in rete | non misurato | 0 su 17 | non misurato |
| Partite vere, GLB accesi (tre corse, due interrotte da me): tiri falliti in rete nella finestra d'esito | non misurato | 0 su 19 | non misurato |
| Rilevatore del gioco «IN RETE» su un esito non-gol | 0 su 15 | 0 su 44 | 0 su 32 |
| Gol di controprova: entrati | 1 su 1 | 1 su 1 | 6 su 6 |
| Provocato (bersaglio dell'arco messo dentro la porta dal collaudo): pallone in rete | non misurabile (il gancio non c'è) | non misurabile (il gancio non c'è) | verde 0 su 8 · rosso `__CPM_NO_G301` 8 su 8 |

Famiglie dei 32 tiri non-gol del guardiano (tipo/chiave/esito): tiro/miss/parata 6 · tiro/miss/palo 1 · tiro/miss/murato 1 ·
tiro/fuori 7 · tiro/parata 5 · tiro/palo 4 · tiro/murato 3 · testa/fuori 2 · testa/parata 2 · testa/palo 1.
Nelle partite vere (198 prima, GLB spenti): tiro/miss/fuori 4 · tiro/miss/murato 3 · tiro/miss/parata 2 · testa/miss (palo, murato,
fuori) 3 · punizione/miss (murato, parata) 2 · tiro/intercetto (parata, murato, fuori) 3. La scena e l'azione del PO sono uscite da
sole 2 volte (fuori, parata): pallone mai in rete.

Dove si ferma il pallone, misurato: fuori → x 48,5 (0,1 u prima della linea), z oltre il palo; palo → x 47,9–48,3; parata →
x 43,3–46,5; murato → x 34,9–41,8.

Cose viste e non giudicate come difetto:
- Nelle partite vere l'azione «🏃 Conduci palla al piede e tira» (scena «Fra le linee…») con la forzatura «fallita» è uscita
  **riuscita**, chiave «assist», pallone in rete dal canale del gol (3 volte su 3). Non è un esito non-gol: è un assist riuscito,
  la forzatura della sonda lì non vale. Non ho controllato il tabellone.
- In una partita vera con i GLB accesi (4 pagine insieme, macchina carica) una scena «miss/murato» ha **un** campione del testimone
  col pallone in porta, in fase highlight, senza scrittore e fuori dalla finestra d'esito. Rigiocata due volte non si è ripetuta.
  Lettura più probabile, non provata: il testimone scrive a inizio fotogramma, prima dello stacco di scena, quindi il primo campione
  di una scena nuova porta il pallone dov'era prima.

## 3. Che cosa ho letto nel codice

Ho seguito ogni canale che scrive il pallone su un tiro fallito (src/12): bersaglio dell'arco (x 43–47; fuori 48,5; palo 48,3),
respinta, palo e rimbalzo, assestamento logico (x logico ≤ 98 = 48,0), punto di ripresa (x 72–86). Nessuno, per come è scritto, porta
il pallone oltre 48,6 fra i pali. Esiste già un guardiano geometrico (7.530) che sposta di lato un pallone trovato in porta senza
certificato, ma lavora solo senza arco e senza post-arco e con un guadagno per fotogramma: mentre un arco o una respinta sono vivi
non guarda.

## 4. Che cosa ho cambiato nel gioco

Solo `src/12-three-match-view.jsx`, dietro `window.__CPM_NO_G301`.

1. **Barriera a fine fotogramma** (dopo tutti gli scrittori del pallone, prima del disegno): in `hl_result`, con azione fallita e
   senza certificato-rete (`_netOk535`), se il pallone è oltre la linea fra i pali e sotto la traversa viene riportato sulla linea
   (x 48,55) nello stesso fotogramma. Sui gol non agisce (azione riuscita, o canale-rete certificato).
2. **Testimone `__CPM_G301W`** (solo collaudo e `__CPM_REC`): ogni volta che la barriera serve registra chi scriveva il pallone
   (arco, tipo di post-arco, codice scrittore). Nei 32 tiri non provocati del guardiano: 0 interventi.
3. **Provocazione `__CPM_RETE301`** (solo `?cpmtest=1`): mette il bersaglio dell'arco di un'azione fallita 0,9 u oltre la linea,
   fra i pali. Serve solo a provare la barriera.

Non ho toccato l'arco della parata né il tuffo del portiere (giro 295): la barriera sta in fondo al fotogramma, la provocazione in un
punto dell'armo dell'arco che il giro 295 non modifica (non ho provato l'unione dei due rami).

## 5. Il guardiano `esito-rete-301`

`tests/visual/esito-rete-301.mjs`, `npm run esito-rete-301`, aggiunto alla prima riga di `src/12` nella MAPPA di `ci-runner.mjs`.
GLB accesi, pagina nuova per scena. Corsa intera del 20/11: uscita 0, circa 20 minuti.

| Braccio | Cosa giudica | Esito |
|---|---|---|
| A, il gioco com'è (verde) | 32 tiri non-gol di famiglie diverse, caso del PO compreso: mai un fotogramma in rete, rilevatore muto | 32 giudicati · 0 in rete · rilevatore 0 · barriera intervenuta 0 volte · 0 non giudicati |
| B, provocato (verde) | 8 tiri falliti col bersaglio dell'arco dentro la porta | 8 giudicati · 0 in rete · barriera intervenuta in 8 su 8 |
| Controprova (verde) | 6 gol: il pallone entra | 6 su 6 entrati |
| B, provocato (rosso `__CPM_NO_G301`) | il difetto si rivede in almeno 6 scene su 8 | 8 su 8 in rete (2–6 fotogrammi, x fino a 49,5) |

Limiti dichiarati:
- Il braccio A è verde anche senza la barriera (sulla 198 prima era già 0 in rete): il rosso si vede solo nel braccio provocato.
- Nel rosso il rilevatore del gioco **non** scrive «IN RETE» (0 su 8): guarda l'ultimo campione della scena e lì il pallone è già
  tornato fuori. Il guardiano giudica ogni fotogramma, più severo del rilevatore; la nota del PO richiede invece un pallone che
  **resta** in rete a fine scena, cosa che la provocazione non produce.
- La corsa intera è stata fatta sul commit precedente all'ultimo; fra i due cambia solo una riga di commento in src/12.

## 6. Controlli

| Controllo | Esito |
|---|---|
| `esito-rete-301` | verde (uscita 0) |
| `test:logic` | verde (uscita 0) |
| `save-compat` | verde, 12 pass · 0 fail |
| `rete-252` | verde (in rete 4 su 4 nel verde e nel rosso; passo max 0,99 u contro 4,40 u) |
| `node tools/build-src.mjs` + `check-src.mjs` | file di gioco ricomposto e committato; `check-src` dopo il commit: «CARRIER-MANAGER-AV.html è allineato al file in git (HEAD)» |

**NON eseguiti** (tempo finito: il giro è durato circa 3 ore e un quarto, quasi tutto in misura):
- chiesti in più dalla consegna: `esito-280`, `esiti-218`, `gk-dive-sync`, `portiere-265`, `salti-274`, `contatto-103`,
  `ball-attended`, `validate-situations`. Di `esito-280` ed `esiti-218` non ho quindi il confronto dei rossi con `lavoro/198`.
- resto della MAPPA di `src/12` (unione delle righe): `rigorista-257`, `tunnel-285`, `formazioni-262`, `tunnel-245`,
  `coreografie-244`, `coreografie-252`, `salienti-243`, `guardalinee-222`, `dribbling-226`, `tocco3d-219`, `lotteria-191`,
  `piazzato-204`, `pullman-204`, `nomi-182`, `chiusura-99`, `parata-100`, `consegna-103`, `colla-103`, `carriera3-94`, `assist-298`,
  `scena3d-96`, `spazio-296`, `panchina-293`, `pc-tablet-292`, `ingresso-285`, `corpi-073`, `ingresso-276`, `stadi-064`,
  `render-3d-023`, `avvicinamento-61`, `linee-61`, `pallone-278`, `ingresso-277`, `inquadra-273`, `memoria-275`, `buildup-sync`,
  `po229-gi38`, `gk-miss-229`, `portiere-223`, `goal-postarc`, `cross-218`, `scene-221`, `fila-227`, `bambini-294`, `partita-vera`,
  `bambini-236`, `pressing-143`, `conduci-242`, `ingresso-245`, `giornale-244`, `difesa-220-scena`, `ingresso-camminata-245`,
  `analisi-217`, `piedi-252`, `difesa-252`, `rinvio-252`, `portiere-252`, `aereo-252`, `difesa-220-giro31`, `apertura-261`,
  `parata-258`, `esiti-241`, `camera-252`, `reazione-252`, `spot-266`, `testa-143`, `stadi-071`, `cerimonie`,
  `passaggio-coppa-137`, `kit-061`, `strisce-corpo`, `portatore-286`, `intercetto-291`.
- per regola non eseguiti: `highlight-95`, `ingresso-206`, `career-critical`.

Un incidente da dichiarare: per controllare la sintassi ho lanciato per errore `node -e "import('./tests/visual/ci-runner.mjs')"`.
L'ho fermato dopo circa 3 secondi; non ho visto controlli partiti né file cambiati (`git status` pulito, `STABILITA.json` intatto).

## 7. PO-587 «il difensore scivola prima dell'effettiva giocata»

Non l'ho misurato e non l'ho toccato. Dal codice: sull'esito «murato» il difensore più vicino al punto del muro parte in scivolata
all'armo dell'arco (giro 241). **Non ho trovato una causa comune con PO-588**: non avendo riprodotto il pallone in rete non posso
dire né che ci sia né che non ci sia. Nei tiri murati misurati (9 fra forzati e di partita) il pallone si è fermato a x 34,9–41,8.

## Dubbi per il PO

1. **La causa di PO-588 non è trovata.** La barriera impedisce al pallone di restare in rete su un'azione fallita, chiunque ce lo
   porti, ma non so chi ce l'ha portato nella partita del PO. Se la nota si ripete sulla versione con la barriera, vuol dire che il
   pallone entra per una strada che la barriera non copre (per esempio fuori dalla fase d'esito, o con l'azione che il gioco
   considera riuscita).
2. **Che cosa ha visto il PO di preciso?** La bozza dice dove era il pallone all'ultimo campione della scena. Servirebbe sapere se
   il pallone è entrato col tiro, dopo una respinta, o con un secondo tiro di un compagno: sono tre strade diverse nel codice.
3. **Con la barriera il pallone si ferma sulla linea** (x 48,55) invece di uscire di lato come fa il guardiano 7.530. È la scelta
   più semplice; a schermo non l'ho guardata (nessuna prova fotografica in questo giro).
4. **Tiro del compagno su occasione sprecata «fuori»** (giro 93): dal codice il pallone va a x 49,4 e z ±6,2 partendo da dentro
   lo specchio, quindi può passare la linea fra i pali prima di uscire di lato. Non l'ho misurato e la barriera non lo copre
   (lì l'azione dell'eroe è riuscita, esito «occasione»). Lo segnalo come possibile strada da misurare.
5. **Unione col giro 295** (stesso file, arco della parata allungato fino al piano del portiere «mai oltre la linea»): non provata.
