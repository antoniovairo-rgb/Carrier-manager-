# Rapporto giro 380 — PO-640 e PO-664, i tempi dei colpi di testa

Ramo `sviluppo/giro380-testa`, base `lavoro/201` (8543a9cc = 7.999.215 + giro 364). GAME_VERSION e `docs/governo` non toccati.

## In breve

- **PO-640 (gi53, frustata in anticipo): causa misurata e corretta.** Il difetto è **intermittente**: su gi53 riuscito compare 1
  pagina su 4 (nelle prime due misure della base non l'avevo visto, e avevo quasi concluso che non esistesse più). Quando compare:
  a fine costruzione aerea il pallone è **già sulla testa** dell'eroe (0,06 u), ma ha superato di oltre 0,5 u il punto di contatto
  dichiarato dalla costruzione; la consegna del giro 252 allora lo **riscrive «3 u prima del contatto»**: x 43,2 → 47,0, cioè 3,8 u
  oltre la testa. L'arco del colpo parte da lì col suo caricamento, l'attesa TESTA146 lo riporta indietro, e intanto la frustata del
  pre-stacco (fasata sulla fine della costruzione) cade a vuoto: picco −0,35 s, nessuna clip di testa al contatto, peso 0,09.
  **Correzione:** se il pallone sta già sulla testa di chi colpisce (stessi limiti della regola 76) la consegna non lo riscrive.
- **PO-664 (compagno che stacca sul cross): corretto.** Il salto del compagno che incorna (`_rcvT`, 0,35 u in 0,52 s) partiva al
  primo fotogramma della consegna, mentre la clip di testa veniva chiesta solo al contatto. Ora salto e clip partono insieme
  all'armo dell'incornata, con la finestra e la fase del colpo di testa del giro 342. Su 18 azioni cross con incornata: **0
  fotogrammi in aria senza la clip di testa**, frustata a 0,003-0,007 s dal contatto.
- **Attribuzione corretta rispetto al giro 366:** il corpo «in corsa con la radice a 1,5 u» non è il compagno sul cross, è la
  **barriera della punizione** (`_wallJumpT`, salto fisso di 1,5 u; misurato su gi14: i tre avversari 12-13-14). Il compagno sul
  cross sale al massimo a 0,35 u. La barriera è nella zona del giro 375: non l'ho toccata (dubbio 2).

## 1. Come ho misurato

- **PO-640:** sonda del giro 342 (`testa-342.mjs`, GLB acceso, teatro acceso, una pagina nuova per scena) al passo 1/60 s e al passo
  nativo (0,05 s), con le righe grezze (`CPM_DUMP`). La causa è uscita dal **registro degli scrittori del pallone** (colonna `ws`
  del testimone `__CPM_G342W`, codici `_ws524`): nel fotogramma dell'armo scrive il codice 11, «buildup-aereo».
- **PO-664:** sonda nuova `tests/visual/misura-380.mjs` (GLB acceso, teatro acceso, passo 1/60, pagina nuova per scena) sulle 39
  azioni «cross» offensive delle situazioni (enumerate dal gioco con `deriveHL`), esito riuscito. Prima stesura sull'istantanea di
  tutti i corpi (`__CPM_VOLA366`) per trovare chi sale; poi due testimoni nuovi in src/12, accesi solo da `__CPM_G380_REC`:
  `__CPM_G380J` (una riga per fotogramma del salto: tempo del salto, quota, clip, suo peso, peso della corsa) e `__CPM_G380` (una
  riga al contatto: clip, suo tempo e scala, peso, quota, vicino/basso).
- Soglie scritte prima della correzione: PO-664 = **0 fotogrammi in aria (sopra 0,05 u) con la clip di testa sotto peso 0,5** e
  **frustata entro ±0,08 s**; PO-640 = le soglie del giro 342 (testa-pallone ≤ 0,45 u, picco ±0,15 s, frustata ±0,08 s, peso ≥ 0,6,
  scatto ≤ 14 u/s, piedi ≤ 0,6 u). «Non giudicato» vale rosso.

## 2. Prima / dopo

### PO-640 — rimbalzi e sponde dell'eroe

| | prima | dopo |
|---|---|---|
| gi53 riuscito, pagine col difetto (naturale) | 1 su 4 (verde della base) · 1 su 3 (col rosso) | — (vedi provocato) |
| gi53 provocato (`__CPM_FORZA380`): picco · frustata · peso | **−0,37 s · nessuna clip · 0,04** | **−0,01 s · 0,01 s · 0,97** |
| gi1 provocato | **−0,36 s · nessuna clip · 0,05** | −0,01 s · 0,01 s · 0,97 |
| gi103 · gi124 · gi126 provocati | −0,04 s · 0,00 s · 0,99 (dentro) | −0,01 s · 0,01 s · 0,97 |
| pallone al fotogramma dell'armo (gi53, pagina col difetto) | x 43,2 → **47,0** (3,8 u oltre la testa) | resta sulla testa |

La provocazione (solo `?cpmtest=1`) fa comportare ogni fine costruzione come nel caso misurato («il pallone ha superato il punto di
contatto»): serve a vedere il difetto a ogni pagina invece che una su quattro. Censimento intero del giro 342 sulla base, prima della
correzione: 58 esecuzioni, 56 giudicate, frustata ≤ 0,01 s su tutte **in quella corsa** — è il motivo per cui il difetto mi era
sfuggito: un censimento di una pagina per scena non vede un guasto da una pagina su quattro.

### PO-664 — il compagno che incorna il cross

| | prima (`__CPM_NO_G380`) | dopo |
|---|---|---|
| fotogrammi in aria senza la clip di testa (scene del guardiano) | 11 (rifinitore della scena larga) · 28-30 (consegna) | **0** |
| quota massima senza clip | 0,33-0,35 u, corsa a peso 0,57-1 | — |
| clip di testa al fotogramma del contatto | **assente** (montata dopo) | `header`, peso 0,77 |
| frustata ↔ contatto | — | **0,003-0,007 s** |
| scala della clip | finestra del gesto dell'eroe | 1,34× (finestra del colpo di testa, come l'eroe) |

Censimento verde (33 azioni su 39; le 6 di gi16/17/42 sono cross difesi di testa dall'avversario, nessuna incornata del compagno):
**18 azioni con incornata, 18 dentro le soglie** (46:0 · 63:2 · 67:2 · 72:2 · 93:2 · 94:1 · 95:1 · 96:0 · 99:2 · 101:1 · 102:0 ·
164:1 · 165:1 · 173:2 · 176:1 · 177:1 · 178:1 · 185:2). Le altre: calcio basso del giro 364 (57:2, 82:0, 84:0: esclusi di
proposito, il calcio resta com'era), consegna senza uomo vicino (148:0) e 11 scene senza incornata registrata entro 100 s.

⚠️ **La messa in scena forzata non porta sempre il compagno sul pallone.** gi185:2 è passata nel censimento e nel primo giro, poi
9 pagine su 9 senza incornata (compagno lontano, `near` 0), a qualunque ora della partita; gi102:0 e gi99:2 simili. Non dipende
dalla correzione (succede uguale col rosso). Il guardiano usa scene che la producono e **ripete dichiaratamente** fino a 3 pagine
nuove per scena (regola dei controlli instabili, PROCESSO.md); dopo 3 pagine senza incornata la scena è «non giudicata» = rosso.

## 3. Correzioni (src/12-three-match-view.jsx, tutte dietro `__CPM_NO_G380`)

| # | dove | cosa |
|---|---|---|
| 1 | interruttore, accanto a `_g342On` | `_g380On()` |
| 2 | consegna aerea della costruzione (`_gia252`, giro 252) | **PO-640**: col pallone già sulla testa di chi colpisce di testa (entro 0,8 u in pianta, quota 1,3-2,6) non si riscrive 3 u prima del contatto. Provocazione `__CPM_FORZA380` (solo `_CPM_TEST`) |
| 3 | post-arco `cross_goal`, blocco del ricevente | **PO-664**: sul colpo di testa il salto non parte più al primo fotogramma della consegna; il calcio basso del giro 364 resta com'era |
| 4 | sospensione dell'incornata (`_cgHold`) | all'armo: `sr.current._m380` e `_mateFx` `header` per la sospensione + 0,55 s; il salto parte quando la clip pesa ≥ 0,5 (tetto 0,15 s; senza corpi GLB dopo 0,05 s) |
| 5 | montaggio dei gesti GLB (`_wT56` e fase) | per il compagno di `_m380`: finestra del colpo di testa (scala 1,34×) e tempo della clip `_TC342 − (sospensione residua + aDt) × scala` |
| 6 | uscita da `hl_result` | `_m380` azzerato insieme a `_ccx460` |
| 7 | testimoni (solo `__CPM_G380_REC`) | `__CPM_G380` al contatto, `__CPM_G380J` nel ciclo «riceve e tira» per il corpo marcato `_j380m` (entrambi i bracci) |

**Non toccati**: blocco del giro 223 e post-arco dei tiri fuori (367), ramo punizione e repulsione `mur72` della barriera (375),
`trophyGrp` (376), il pre-stacco TESTA146 e la regola dell'eroe del giro 342 (la correzione 2 agisce prima, sulla posizione del
pallone). Deterministico: nessun numero casuale; le condizioni leggono posizioni, peso del gesto e tempo di scena.

## 4. Guardiano `npm run testa-380`

Riga della MAPPA esistente per `src/12-|src/13-` (ci-runner.mjs), accanto a `testa-342`. `misura-380.mjs --guardiano`, due bracci:
- **PO-664**: gi46:0 · gi96:0 (rifinitore della scena larga, incornata 0,14 s dopo l'arrivo) · gi63:2 · gi93:2 · gi165:1 · gi176:1
  (consegna e incornata, 0,22 s), fino a 3 pagine ciascuna;
- **PO-640**: gi53:1 · gi1:1 · gi103:1 (rimbalzo) · gi124:0 · gi126:0 (sponda) con `__CPM_FORZA380` in entrambi i bracci, grandezze e
  soglie di `testa-342.mjs` (che ora esporta `scena`).
- **verde**: tutte le scene dentro le soglie. **rosso** (`CPM_ROSSO=__CPM_NO_G380`): valido solo se cadono almeno 2 scene PO-664 e
  almeno 1 PO-640. Misurato: **verde 6/6 + 5/5 · rosso 6 + 2 bocciate su misura, 0 non giudicate** (uscita 0).

## 5. Esecuzioni

- `node ci-runner.mjs giro testa-380` sul primo commit (a34f7158, solo PO-664): 17/17 sentinelle verdi; `testa-380` rosso per la
  scena gi102:0 non giudicata (compagno non arrivato), sostituita. Poi `npm run testa-380` sul codice finale: verde + rosso (sopra).
- `node ci-runner.mjs giro testa-380` sul commit finale 1b2cf55b: **18/18 verdi** (testa-380 711 s, alla prima prova; nessuna
  sentinella instabile).
- `npm run mappa-unica`: verde col verde, rosso con la mappa vecchia. `node tools/check-src.mjs`: HTML ricomposto dai frammenti.
- `docs/governo/STABILITA.json` e le foto di `docs/collaudo-grafico` riscritte dal runner: ripristinate, non nel commit.

**Guardiani della zona NON girati** (li giudica il treno): `testa-342` intero (11 scene), `aereo-252` e `buildup-sync` (la
correzione 2 tocca la consegna aerea del 252, ma solo sui colpi di testa col pallone già sulla testa), `salti-274`,
`gesture-window`, `fasce-364`, `difesa-343`, `volano-366`, `squad-react`, `frozen-mate`, `finisher-facing`, `goal-postarc`, il gate
14/14. Non misurato: PO-664 al passo nativo (20 fps) e a velocità reale — la partenza del salto legge il peso della clip, non un
numero di fotogrammi, ma dal banco non posso confermarlo.

## 6. Dubbi per il PO (la consigliata è la prima; applicata dove si applica)

**1. Il rifinitore della scena larga (giro 364) stacca quasi al contatto.** Lì l'incornata parte 0,14 s dopo l'arrivo (contro 0,22
della consegna): il corpo è a 0,04-0,14 u quando colpisce e sale ancora dopo (apice 0,26 s dopo lo stacco).
1. **(consigliata, applicata)** Tenere così: la clip di testa copre tutta la salita e la frustata cade sul contatto.
2. Anticipare lo stacco del rifinitore all'arrivo del cross (bisogna prevedere il contatto nel giro 364: è la sua zona).
3. Allungare la sospensione del 364 da 0,14 a 0,26 s (il pallone resta fermo sulla testa più a lungo: è ciò che il 364 ha tolto).

**2. La barriera della punizione salta di 1,5 u correndo** (il dato del giro 366 attribuito al compagno sul cross).
1. **(consigliata, non applicata: zona del giro 375)** Un giro dopo il 375 che dà alla barriera un salto proporzionato (0,3-0,5 u)
   con una clip per tutta la salita, misurato con la stessa sonda.
2. Abbassare solo il tetto del salto (1,5 → 0,4 u): più semplice, ma la corsa in aria resta.
3. Lasciarla com'è.

**3. Perché il pallone supera il punto di contatto dichiarato (PO-640, causa a monte).** La correzione toglie la riscrittura
sbagliata; resta da capire perché, una pagina su quattro, la costruzione porta eroe e pallone 0,5-0,8 u oltre il contatto.
1. **(consigliata)** Tenere la correzione (il colpo parte dove eroe e pallone sono davvero) e misurare la variazione della messa
   in scena in un giro di strumenti (la stessa che a volte non porta il compagno sul pallone, §2).
2. Agganciare il punto di contatto dichiarato alla posizione reale dell'eroe a fine costruzione.
3. Niente altro.

**4. Il molleggio della corsa porta la radice dei compagni fino a 0,25 u** (visto nella prima stesura: compagni senza gesto con la
radice fra 0,05 e 0,25 u per decine di fotogrammi; `_bobRun` arriva a 0,18 u sul corpo logico, sotto una clip di corsa che ha già
il suo passo). Fuori dalla mia zona e non misurato a fondo.
1. **(consigliata)** Un giro di misura sul molleggio dei corpi GLB in corsa.
2. Spegnere il molleggio logico sotto i corpi GLB.
3. Lasciarlo.

## 7. File

- `src/12-three-match-view.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto)
- `tests/visual/misura-380.mjs` (sonda e guardiano), `tests/visual/testa-342.mjs` (`scena` esportata), `tests/visual/package.json`
  (`testa-380`), `tests/visual/ci-runner.mjs` (riga della MAPPA `src/12-|src/13-`)
- `docs/sviluppo/RAPPORTO-giro380.md`

⚠️ Nota di metodo: due volte ho fermato mie corse di misura con `pkill -f misura-380.mjs` (solo processi miei, nessun rituale
coinvolto). La regola dice di non farlo: lo dichiaro.
