# Giro 257 — seguito di PO-496 (giro 249): rigorista visibile, l'eroe tira in Nazionale e nel provino, ponte chiuso, patto-238 riparato (versione 7.999.197)

Ramo `sviluppo/giro257-rigorista-visibile`. `GAME_VERSION` non toccata.
Partenza: per errore il primo commit è nato su `ee276bc` (punta locale di `lavoro/197`), 11 commit dietro `origin/lavoro/197`
(`c58c5a9`). Me ne sono accorto prima dei controlli finali: ho **unito** `origin/lavoro/197` nel ramo (niente force push), risolto
l'unico conflitto (`tests/visual/ci-runner.mjs`: le catene `completa`/`carriera` di `lavoro/197` + `rigorista-257`), ricomposto
l'HTML (`build-src` + `check-src` IDENTICO BYTE PER BYTE). **Tutti i controlli del rapporto sono stati eseguiti dopo l'unione**,
sul build unito; le corse fatte prima sono state buttate (patto-238 interrotto e rifatto da capo).

Rosso del giro: `window.__CPM_NO_G257` (A, B, C tornano come oggi, cioè come nel giro 249).
Guardiano nuovo: `rigorista-257` (catene `completa` e `carriera`, una volta ciascuna; mappa mirata per src/12-13, 14, 15, 18).
Guardiano riparato: `patto-238` (parte B). Sonde adattate: `sonda-rigore-139.mjs` (`CPM_ROSSO257`, e scrive `rig257` passato al
motore) e `gol-eroe-154.mjs` (vedi sotto). File di gioco toccati: src/11 (componente `SegnoR257`), src/13, src/14, src/15, src/18.

**gol-eroe-154 e il ponte chiuso.** Il suo rosso provocava al 90' un rigore con `chiedi.piazzato(batt: HERO)` senza premio, cioè
proprio la chiamata che C chiude: sul build del giro la prima corsa è uscita «non giudicato» (0 rigori con l'eroe battitore). Ora,
dopo la stessa chiamata, la sonda **scrive** l'eroe nel fermo del motore (stato, come carriera3-94 D2; contatore `__G257SCRITTO`):
è il caso di un rigore dell'eroe con premio o in Nazionale, e la partita resta quella senza premio.

---

## A — «Sì, segnato nella Rosa»

### Regola (una sola, src/14 `rigorista257`, usata da Rosa, formazioni e motore)

- Fra i **dieci compagni titolari** dell'undici del club (`generateTeamRoster(club, stagione)`, indici 0..9; l'eroe è il 10 — sono
  gli stessi della partita: `homeRoster` del live nasce dalla stessa chiamata) il rigorista è l'**attaccante** (Trequartista / Ala /
  Centravanti / Attaccante / Punta, +10) con l'**attitudine al dischetto** più alta, attitudine fissa ricavata dal nome (stesso
  calcolo del giro 249, sul nome intero della rosa). I portieri sono esclusi.
- Con il premio del patto «il rigorista sei tu» (club in cui è stato promesso, `premiMotore238`) il rigorista è l'eroe.
- Nessun campo nuovo nel salvataggio: tutto è derivato.

### Dove si vede

- **Rosa** (Club › Rosa, src/18): «R» dorata (14 px, token `TINTE.oro` / `RAD.xs`) dopo il nome del rigorista fra i titolari;
  col premio dopo il nome dell'eroe. Il nome ha `flex:1; min-width:0` con i puntini: la riga **non** si allarga.
- **Formazioni della partita** (src/13 `FormationView`, nuovo kit): «R» in alto a destra sulla maglia del rigorista, solo nella
  squadra dell'eroe (posizione assoluta: nessuna maglia si sposta).
- **Tabellino**: il tabellino della gara (`tabellino202`) mostra solo statistiche di squadra, senza nomi: la «R» non ha dove stare.
  Vedi dubbio 1.

### Il motore fa calciare quel compagno

Il live passa al motore `cfg.eroe.rig257 = {i, cog}` (indice nei ventidue e cognome che porta in campo). Nel motore (`fermoSet`,
rigore della squadra dell'eroe senza premio) il segnato prende +50 se è in campo con lo stesso nome; se è uscito o espulso torna la
regola del 249 (miglior attaccante in campo). Sorteggi consumati identici (il sorteggio del vecchio criterio si consuma comunque).

---

## B — «In Nazionale tira l'eroe»

`rigorista257` dà `{eroe:true}` per i contesti `national*`, `nationsCup*`, `euroMondiale*` e `trial` (stessa espressione di
`premiMotore238`). Il live passa `rig257 {eroe:true}` e il motore non applica la regola del 249 (`_senzaEroe257` falso): torna il
comportamento di prima della 197, l'eroe vince la scelta del battitore (ruolo «AT» + 6) e il rigore diventa la sua scena.
Nelle formazioni della Nazionale/provino la «R» è sull'eroe.

---

## C — il «ponte» verso una scena programmata a palla ferma (dubbio 4 del 249)

`chiedi.piazzato` nel motore (src/14) è il punto unico in cui il ponte (src/15, `batt: _M.HERO`) imponeva l'eroe sul dischetto. Ora,
per un rigore della squadra dell'eroe **senza premio e fuori da Nazionale/provino**, la richiesta `batt: HERO` è ignorata e resta il
battitore che `fermoSet` ha scelto con la regola del 249/257 (contatore `S.conta.ponte257`). Con il premio e in Nazionale/provino
il ponte nomina l'eroe come prima. Provato con la sonda (C1 motore, C2 partita vera con la stessa chiamata del ponte).

---

## D — `patto-238` riparato (dubbio 8 del 249)

### Causa (misurata nel giro 249)
La parte B (partita vera) giudicava 1-2 punizioni naturali dalla trequarti, e il rosso pretendeva «le batte il compagno più vicino,
quindi non l'eroe»: ma il compagno più vicino può essere l'eroe. Rosso instabile anche sulla base.

### Riparazione («Controlli instabili»: ciò che il gioco non produce si provoca dalla sonda; criterio che non dipende da chi è il più vicino)
- La sonda **provoca** 12 punizioni a partita: ai minuti 20', 35', 50', 65' del motore, a gioco fluido, tre punizioni della squadra
  dalla trequarti **non tirabili** (x 72/74/76, sulla fascia opposta all'eroe), chieste **senza battitore** (`chiedi.piazzato`:
  il battitore lo sceglie `fermoSet` con le sue regole).
- Si giudicano **solo** quelle in cui l'eroe **non** è il compagno più vicino (distanza calcolata dalla sonda sulle posizioni del
  motore): lì verde (eroe designato dal premio) e rosso (compagno più vicino) si separano per costruzione.
- Soglie invariate (verde ≥ 90%, rosso < 50%); nuovo pavimento: meno di 4 giudicate = non giudicato = rosso. Le naturali restano stampate.

---

## Misure e controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, build definitivo, catena unica 19:24-21:06)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE**. `node --check ci-runner.mjs` ok,
nessun doppione nelle catene toccate.

### `rigorista-257` (nuovo, ~4 minuti) — verde e rosso

| Parte | Verde | Rosso `__CPM_NO_G257` |
|---|---|---|
| A1 Rosa a 360 px | «R» su Sam Hall = atteso; 24 righe larghe 317,7-317,7 px; pagina 360/360 | 0 «R» |
| A1 Rosa col premio | «R» sull'eroe; righe 317,7-317,7 px | — |
| A2 formazioni partita vera (S12) | «R» su SPENCER (designato Carter Spencer) | 0 «R» |
| A3 motore 20 partite K=1, segnato il centrocampista GALLI | GALLI 13/13 | RICCI 10/10 (regola del 249) |
| B1 motore Nazionale/provino senza premio | rigori dell'eroe 13/13 | 0/10 |
| B2 regola dei contesti | national, nationsCup, euroMondiale_group/ko, trial, career col premio → eroe; career/cup → compagno | null ovunque |
| B3 provino vero (openMatch) | motore con `rig257 {"eroe":true}`, rigore chiesto senza battitore al 6': l'eroe | compagno (8) |
| C1 motore, ponte al 30' (pen, batt HERO) | senza premio eroe 0/20 · col premio 20/20 · Nazionale 20/20 | senza premio 20/20 |
| C2 partita vera senza premio, ponte provocato al 30' | dischetto `pen:9` = designato SPENCER, scena di sola visione «31' SPENCER goal», eroe 0 battute 0 scene | dischetto `pen:21` (eroe), scena dell'eroe 1 |

### Altri controlli

| Controllo | Esito | Numeri |
|---|---|---|
| `patto-238` (riparato) — 3 passate di fila | ✅ 3/3 verde, rosso visto ogni volta | B verde 12/12 provocate con l'eroe battitore (0 scartate, 0 nulle; naturali 6/6·8/8·7/7) · B rosso 0/12 · A 594/618, rigori 13/13, angoli 388→387 · C verde/rosso. ~11,5 min a passata |
| `rigorista-249` | ✅ verde · rosso `__CPM_NO_G249` bocciato | A senza premio 0/10 (Ricci 10), con premio 13/13 · B scena del compagno 59' SPENCER «GOOOL!» |
| `patto-227` | ✅ verde · rosso `__CPM_NO_G227` bocciato | |
| `momento-165` | ✅ | 33 verdi, 0 rossi |
| `sigle-203` (360/375/390, 1366, rosso) | ✅ | verde 18/0 e 8/0 · rosso atteso e visto. Nota: sigle-203 misura la barra della partita; la larghezza delle righe della Rosa a 360 px con la «R» la misura `rigorista-257` A1 |
| `test:logic` | ✅ | 51 pass · 0 fail (la prima stesura metteva il componente JSX della «R» in src/14, che il test carica come JS puro: 1 fail; spostato in src/11) |
| `save-compat` | ✅ | 12 pass · 0 fail |
| `gol-eroe-154` (sonda adattata) | ✅ verde e rosso | verde 10/10 valide, rigori provocati passati al compagno 7/7, gol fluidi 0 · rosso 7 rigori dell'eroe, 5 gol fluidi |

Non eseguiti (verifica di rilascio): il resto della mappa mirata di src/13, 14, 15, 18 (fra gli altri `highlight-95`,
`ingresso-206`, `career-critical`, `validate-situations`, `partita-vera`, `rosa-228`, `rigore-191`, `piazzato-204`, `rigore-139`,
`formazioni*`, `design-system`). Nessuna foto rigenerata in docs/.

---

## Dubbi per il PO

1. **«Tabellino»**: il tabellino della gara mostra solo numeri di squadra (gol, possesso, tiri…), nessun nome; la «R» l'ho messa
   nelle **formazioni** della partita (prima del calcio d'inizio) e nella Rosa. Se il PO intende un altro elenco con i nomi
   (pagelle, cronaca), va indicato.
2. **Il rigorista della Rosa è quello dell'undici titolare**, non di tutta la rosa: se esce (cambio, espulsione) in partita calcia
   il miglior attaccante rimasto (regola del 249) e la «R» delle formazioni non si sposta. La panchina della Rosa non ha mai la «R».
3. **Il segno è derivato, non scelto**: col cambio di generazione di uno slot della rosa (ogni ~7 stagioni, `generateTeamRoster`)
   il rigorista può cambiare da solo. Nessun campo nel salvataggio, come chiesto.
4. **Nazionale verificata senza una partita di Nazionale vera**: la regola dei contesti (B2) e il motore (B1) sono provati, il
   provino (B3) è una partita vera; una partita di Nazionale giocata dal calendario non l'ho fatta girare (nessun gancio di collaudo
   per aprirla). Il percorso del live è lo stesso del provino (stessa riga che passa `rig257`).
5. **Formazioni: la «R» in alto a destra della maglia** è vicina al riquadro bianco dell'eroe quando il rigorista gli sta accanto
   (foto in sonda: SPENCER accanto a VAIRO); leggibile, ma è una scelta grafica mia.
6. **Ponte chiuso nel motore, non nel live**: il live continua a chiedere `batt: HERO`, è il motore a non concederlo senza premio.
   Un solo punto (chokepoint) copre anche altre chiamate future con `batt: HERO` sul rigore.
7. **patto-238 parte B ora giudica punizioni provocate**: non misura più quante punizioni naturali la partita produce, ma chi le
   batte (che è ciò che il premio decide). Le naturali restano stampate a titolo informativo. Le provocazioni cambiano la partita
   (più punizioni: le naturali viste salgono da 1-2 a 6-11).
8. **Partenza dal commit sbagliato** (vedi in alto): corretto con un'unione, nessuna storia riscritta.
9. **Mappa mirata di src/11**: lo spostamento del componente della «R» tocca src/11 (kit UI); dei guardiani della sua mappa ho eseguito
   solo quelli di questa consegna. Il componente è nuovo e usato solo da Rosa e formazioni.
