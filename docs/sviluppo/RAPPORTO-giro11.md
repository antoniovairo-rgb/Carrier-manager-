# Rapporto sviluppatrice — giro 11 · PO-218 (caso cross) e PO-209 (intestazione «FC Laguna»)

Ramo `sviluppo/esiti-218-209`, partito da `poc/marioprada-character-system` a `416c3ec` (7.999.163, contiene PO-226).
Ambito: sottoinsieme bloccante del 17/10 (`docs/governo/DECISIONI.md`, 13/10). Zona G non toccata (stagioni, offerte, impulsi,
Nazionale, economia: nessuna riga cambiata; la correzione PO-209 tocca solo la *lettura* del club nell'intervista).
Nessun bump di `GAME_VERSION` sul ramo (come il giro 10: la versione si assegna all'integrazione).
Riferimenti di riga: sorgente **dopo** la modifica.

## 1. PO-218 «esiti bugiardi» — il cross

### 1.1 Misura su partite vere seedate (prima di toccare)

Sonda (in scratchpad, non versionata): salvataggio S12 (`tests/visual/fixtures/save-190-s12-ovr93.json`), autoplay seedato,
testimone `__CPM_RES218` (riquadro + fatti del motore), 14 partite (semi 1234, 2021, 7, 99, 11-16), politiche `seeded` e `cross`.

| | scene | cross dell'eroe | cross ricevuto (testa/volée) | contraddizioni riquadro ↔ motore |
|---|---|---|---|---|
| partite vere | 98 | **0** | 10 | 0 |

- Il cross dell'eroe **non è comparso in 98 scene vere**. Causa misurata: col motore del possesso le scene nascono dalle occasioni
  del motore (`src/15-live-match.jsx:4647`, `src/04-situazioni-zone-piazzati.jsx:955` `scenaDalMotoreFascia`); l'occasione
  «fascia» chiede l'eroe largo (`|y-50| >= 24`, `src/14-motore-possesso.jsx:332`) e l'eroe è sempre `rl:"AT"`
  (`src/14:106`). Anche chiedendo sempre «fascia» (gancio di sonda `__CPM_TIPO_OCC`, `src/15:4647`, solo `?cpmtest=1`) il motore
  ha servito altri tipi (testimone `__CPM_B7`: chiesto «fascia», ottenuti angolo / spalle / fra-le-linee). Il gancio resta,
  inerte fuori dalle sonde; dichiaro che **non ha prodotto scene di cross**.
- Cross ricevuto: 10 scene di testa (palo, parata, murato, fuori, gol) tutte concordi fra riquadro e motore. Nessun difetto misurato lì.

Quindi il cross dell'eroe è stato misurato per **enumerazione** (catalogo intero, motore vero) e su **scena forzata dentro una
partita vera** (`__CPM_FORCE_SIT`, esito fallito, tipo d'errore lasciato al motore oppure forzato solo per il 3D).

### 1.2 Cosa ho misurato

- **Quanto pesa**: 6.000 decisioni di `decideExecution('cross')` (attributi S12, pressione 0-3). Sul cross fallito il tipo d'errore è
  parata/presa **39,4%** (ripiego da assist/gol, `src/15:8864`), murato 17,2%, angolo 17,1%, intercetto 17,0%, fuori **9,2%**.
- **Riquadro** (enumerazione, 44 azioni-cross del catalogo): **8 azioni** con fail `miss` e premio assist (5 cross: «Cross a rientrare»
  ×2, «Cross d'esterno», «Cross a rientrare perfetto», «Cross a rientrare guardato»; 3 cross da punizione: «Cross alto» ×2, «Cross sul
  secondo palo») uscivano col lessico del **tiro**: «Tiro fuori di poco», «Grande parata del portiere», «Conclusione murata».
  Causa: `_hlOvlCat` (`src/05-cronaca-stadi-formazioni.jsx:410-419`) manda ogni `miss` fallito alla categoria tiro.
- **Motore** (motore vero creato in pagina, cast con difensore e portiere, 40 azioni × 5 tipi = 200 casi):
  - presa del portiere (riquadro «Il portiere esce e la prende», 3D presa) registrata **«intercetto» del difensore** (`src/14:1338` base);
  - cross fuori misura registrato **«spazzata» del difensore** (`src/14:1339` base);
  - cross da punizione sbagliato registrato come **tiro dell'eroe** (fam `freekick` fuori da `famPass`, finiva in `tiroEroe`).
  - Totale col rosso: **95 contraddizioni su 200**.
- **3D** (testimone nuovo `__CPM_X218`, `src/12-three-match-view.jsx:4129` e `:4550`, solo `__CPM_REC`; scheda gi16 «Cross teso»):
  | esito | 3D prima |
  |---|---|
  | parata/presa | pallone fermo in presa a x 39 (coerente) |
  | angolo | pallone verso il fondo, x 46,6 a fine finestra (coerente) |
  | **fuori** | **deviazione in campo, assestamento in area a x 38,5, \|z\| 20** — riquadro «Passaggio fuori misura» (linea di fondo 48,6) |
  | murato | deviazione in campo (coerente con «respinto») |
  Causa: `_wide83` (`src/12:4505`) portava oltre la linea solo i tiri e l'angolo, non il cross fuori.

### 1.3 Correzioni (interruttore rosso unico `window.__CPM_NO_CROSS218`)

| Dove | Cosa |
|---|---|
| `src/05-cronaca-stadi-formazioni.jsx:417` | un `miss` su un'etichetta da cross (non da tiro) va al lessico del passaggio/cross |
| `src/05:364-365`, `:435` | pool proprie del cross (`_MISS_OVL_CROSS`, `_MISS_TX_CROSS`): «Cross troppo lungo», «Il portiere esce e blocca il cross», «Cross respinto» |
| `src/15-live-match.jsx:8977` | la riga di cronaca del cross sbagliato usa le parole del cross |
| `src/14-motore-possesso.jsx:1324` | il cross da punizione sbagliato (`freekick` + variante `cross` + premio assist) è un cross, non un tiro |
| `src/14:1333-1339` | cross sbagliato: parata/presa → evento `presa` del portiere; fuori → evento `fuori` («pallone troppo lungo»); murato/intercetto/angolo invariati (intercetto o spazzata del difensore) |
| `src/12-three-match-view.jsx:4505` | il cross fuori (`out/wide/overhit/missed`) si assesta oltre la linea di fondo, come il tiro fuori |

Non toccati: la famiglia del riquadro (quindi il controllo `overlay_arc` del gate resta identico), la decisione `decideExecution`
(baseline invariata), i cross riusciti e il tabellino (`presa` e `fuori` non hanno voce nel tabellino; il tiro fantasma della punizione
sbagliata non viene più contato, ed era sbagliato contarlo).

### 1.4 Guardiano `tests/visual/cross-218.mjs` (`npm run cross-218`, in `ci-runner` per src/05, 12, 14, 15 e nella completa)

| | riquadro col lessico del tiro | motore in contraddizione | 3D cross fuori, x finale |
|---|---|---|---|
| **verde** | **0 / 40** azioni | **0 / 200** | **46,8** (oltre la linea) |
| **rosso** `__CPM_NO_CROSS218` | 24 | 95 / 200 | 39,0 (in area) |

Soglie: verde 0 / 0 / x ≥ 46; rosso ≥1 / ≥1 / x < 44. Restano verdi `lessico-218` (0/138, rosso 138/138) dopo la modifica.
Gancio di sonda aggiunto: politica autoplay `cross` (`src/15:2613`), sceglie il cross quando la scheda ne ha uno.

### 1.5 Cosa resta aperto (dichiarato)

- Il cross dell'eroe **in partita vera** non l'ho visto: con l'eroe sempre attaccante centrale il motore non apre scene «fascia».
  La correzione è misurata su enumerazione + scena forzata; il collaudo dal vivo richiede un eroe che arrivi largo.
- Sul cross fallito il 39% dei casi è «presa del portiere» per *ripiego* (l'esito deciso era assist/gol, l'esito fallito lo trasforma
  in parata, `src/15:8864`): ora è coerente nei tre canali, ma è una scelta di gioco del PO se debba pesare così tanto.

## 2. PO-209 — «FC Laguna» al posto del club nuovo (unito a PO-211)

### 2.1 Riproduzione — **RIPRODOTTO**

Sonda sul flusso vero (S12 portato alla settimana 20), firma vera dall'interfaccia (`setOffer` + click «Accetta»), partita vera in
autoplay fino a `ended`, testo letto dal DOM.

- **Scenario «post»**: l'eroe passa a FC Laguna, gioca la settimana 21 contro FC Sicania; dopo il fischio arriva l'offerta di FC Moreira
  e il PO firma prima di guardare l'intervista.
  - Tabellino: «FC Laguna — FC Sicania» → **giusto** (il club con cui si è giocato).
  - Intervista: scena «FC MOREIRA», «MRA 0 – 0 FC Sicania», «DOMANI IN EDICOLA · MRA 0-0 FC SICANIA» → **sbagliata**.
  - È lo schema esatto delle due foto (PO-209 tabellino «FC Laguna», PO-211 intervista «MRA 3-0 FC Empolese»; FC Empolese è in Lega B
    come FC Laguna, `src/02-club-leghe-albo.jsx:204,208`). L'attesa «doveva esserci FC Moreira» nasce dall'ordine delle schermate.
- **Scenario «prestito»** (proprietario FC Moreira, prestito secco a FC Laguna): tabellino «FC Laguna», intervista «LAG 0 – 1 FC Sicania»
  → coerenti; il club genitore non entra in nessuna delle due.

Percorso (`src/18-career-app.jsx`): `onMatchEnd` avanza la settimana (`:3754`) e programma l'intervista dopo 900 ms (`:3799`) salvando
avversario e risultato ma **non il club**; il cambio di settimana può aprire un'offerta (effetto mercato `:1160-1195`); l'intervista
aspetta finché l'offerta è aperta (`:6356`, testimone `__CPM_IVBLK231` = «mercato»); «Accetta» scrive `club:newClub` (`:5753`);
l'intervista leggeva `player.club` al momento della visione (`:6364`, `:6372`, `:6414`, `:6428`, `:6455`).
Limite dichiarato: nella sonda l'offerta è forzata con `setOffer`; il percorso naturale (effetto mercato con `Math.random`) è letto
dal codice, non fatto scattare.

### 2.2 Correzione (interruttore rosso `window.__CPM_NO_TESTA209`)

- `src/18-career-app.jsx:3799`: `onMatchEnd` congela nell'intervista il club con cui si è giocata la partita (`club:player.club`).
- `src/18:6364, 6372, 6414, 6428, 6455`: scena 3D/2D, «Domani in edicola», domanda e risposte leggono `interviewModal.club`, con
  ripiego su `player.club`.
- Nessuna modifica a mercato, offerte, avanzamento settimana (zona G).

### 2.3 Guardiano `tests/visual/testata-209.mjs` (`npm run testata-209`, in `ci-runner` per src/18 e nella completa)

| | tabellino | edicola | scena dell'intervista |
|---|---|---|---|
| **verde** | FC Laguna — FC Sicania | «LAG 0-0 FC SICANIA» | FC Laguna |
| **rosso** `__CPM_NO_TESTA209` | FC Laguna — FC Sicania | «MRA 0-0 FC SICANIA» | FC Moreira |

### 2.4 Emerso lungo la strada, fuori ambito (non corretto, da registrare)

- «Domani in edicola» mostra «Sett. 22» per la partita della settimana 21 (`src/18:6413`): legge la settimana già avanzata, stessa radice.
- Dopo un trasferimento a metà stagione `player.playedMd` del club vecchio restava nel salvataggio e la guardia di
  `getThisWeekMatchday` (`src/18:841`) rispondeva «nomatch» per le giornate del club nuovo. Osservato solo con un trasferimento forzato
  in sonda: **da verificare** se capita fuori dalla sonda. È zona G: non toccato.

## 3. Catena `node ci-runner.mjs mirata 416c3ec`

Eseguita sul ramo al commit `49b0d57` (il codice di questo rapporto) contro la base `416c3ec`: file toccati src/05, 12, 14, 15, 18 → **49 passi**, dalle 15:27
alle 21:20 circa (ora del container).

**Esito: ✅ 49/49 verdi**, con **due passi «instabili»** (rossi alla prima prova, verdi alla seconda — il runner ne concede una):

- `nomi-219` (8.681 s le due prove): primo giro «vicini 84% su 25 nominati (servono >=90% su >=12)». Misura le distanze dei
  compagni nominati dall'eroe nel 3D: nessuna riga toccata in questo giro ci passa (cast/scambio `__CPM_NO_CAST219`/`__CPM_NO_SWAP219`).
- `tabellino-228` (636 s): primo giro, partita k4, tabellino 2-0, tabellone 2-0, motore 2-0 ma `golLog` con un terzo gol avversario
  al 93' (`scena:false`). Le mie modifiche al motore cambiano solo i fatti del cross *sbagliato* (presa/fuori al posto di
  intercetto/spazzata) e non toccano gol né tabellone; non l'ho riprodotto né indagato in questo giro.

Per regola PO 13/10 «un guardiano instabile due volte si ripara»: questa è la prima volta che li registro instabili su questo ramo.
Tutti verdi al primo colpo i guardiani dell'area toccata: `lessico-218`, `cross-218` (242 s), `esiti-218` (1.123 s),
`validate-situations` (731 s), `partita-vera`, `possesso-209`, `tabellino-216`, `intervista-231`, `testata-209` (549 s),
`career-critical` (891 s), `save-compat`.

## 4. File del giro

- Codice: `src/05-cronaca-stadi-formazioni.jsx`, `src/12-three-match-view.jsx`, `src/14-motore-possesso.jsx`, `src/15-live-match.jsx`,
  `src/18-career-app.jsx` e il generato `CARRIER-MANAGER-AV.html` (`node tools/check-src.mjs`: identico byte per byte).
- Guardiani: `tests/visual/cross-218.mjs`, `tests/visual/testata-209.mjs` (+ `package.json`, `ci-runner.mjs`: mappa e passi lenti).
- Interruttori rossi: `__CPM_NO_CROSS218`, `__CPM_NO_TESTA209`. Ganci solo sonda: `__CPM_X218` (sotto `__CPM_REC`), politica autoplay
  `cross`, `__CPM_TIPO_OCC` (sotto `?cpmtest=1`, senza effetto misurato).
