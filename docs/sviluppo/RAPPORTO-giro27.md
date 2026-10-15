# Rapporto giro 27 — taccuino PO 15/10 sulla 7.999.169: PO-207 (rigore senza ripartenza) · PO-257 (000 finta) · PO-258 (111 punizione)

Ramo `sviluppo/taccuino-169`, partito da 64ef86e (7.999.169). `GAME_VERSION` **non** cambiata (istruzione del giro). Nessun push su `main`.
Salvataggio di prova: `tests/visual/fixtures/save-190-s12-ovr93.json` (S12; il salvataggio S.13 W.21 del PO non è nel repo, quindi
la partita contro FC Foxshire non l'ho rigiocata: **non posso confermare** che la sequenza del PO sia identica a quella riprodotta).
Misure percettive (PO-257, PO-258) con GLB acceso, `__CPM_PRESENT=1`, pagina nuova per scena. PO-207 è una misura del motore e del
campo 2D, non percettiva del corpo: GLB spento come in `ripartenza-207`.

## 1. PO-207 (riaperta) — dopo il gol su rigore non si riparte da centrocampo

### Riproduzione

Sonda `docs/sviluppo/dati-giro27/sonda-ripresa-207.mjs`: partita vera dal salvataggio S12, al 9' il motore fischia il rigore per l'eroe
con `chiedi.piazzato({kind:'pen', batt:HERO})` — la stessa porta del ponte verso la scena: il motore apre l'occasione `_piaz27` e il
live costruisce la scena «🔴 RIGORE! …» (`scenaDalMotorePiazzato`). L'eroe calcia dal pulsante di stile; il dado del motore è forzato a
gol solo per quella scena. Con `__CPM_RIG190_K=1` (ogni fallo in area è rigore) in due partite intere l'eroe non ha avuto nessun rigore:
per questo il rigore si chiede al motore.

### Misura PRIMA

- Testimone `__CPM_KO207`: la ripresa **c'è** — `{lato:"away", dopo:"kickoff", palla:[50,50]}`: il pallone del motore torna al centro e
  la palla va a chi ha subito il gol.
- Ma la battuta parte dopo **2 passi**, cioè 270-470 ms reali, con **8-10 giocatori di movimento su 20 nella metà sbagliata** (misurato
  su tre gol della stessa partita: rigore 8, gol in scena 9, punizione 10) e l'eroe ancora sul dischetto avversario.
- Fotografia del campo 2D al primo fotogramma utile (`docs/sviluppo/foto-giro27/po207-prima-rigore.png`): banner «Si riparte dal centro»,
  il pallone è già uscito dal cerchio, l'eroe (77) è sul dischetto, mezza squadra è nell'area avversaria. Il calcio d'inizio non si vede.

Una lettura sbagliata da dichiarare: nella prima sonda il pallone **3D** risultava fermo in rete (x 100,3) con `hlPostArcType="in_net"`
congelato per 14 s. Quei valori (`__CPM_ARC`, `__CPM_OWN497`) li scrive solo il render 3D, che in `playing` non disegna: erano
**stantii**, non una misura del gioco. Il PO guarda il campo 2D, che legge `motore.stato()`.

### Causa

`src/14-motore-possesso.jsx:992` (`tickKickoff`): la battuta aspetta 2 passi e, se nessuno è entro 6u dal centro, al 5° passo
**teletrasporta** il più vicino sul pallone. `src/14-motore-possesso.jsx` `riprendi({centro:true})` (r. ~1231) metteva il pallone al
centro senza toccare i ventidue: dopo una scena di rigore/punizione erano tutti schierati sul piazzato.

### Correzione

- `src/14-motore-possesso.jsx:1239` — con l'opzione `schiera` la ripresa dal centro **schiera i ventidue** con la stessa regola del
  calcio d'inizio già usata dal passo (ognuno nella sua metà sul proprio slot, portieri al centro della porta, i due più vicini della
  squadra che batte sul pallone) e **tiene la palla ferma 11 passi** (`S.kickoff.hold`). Il campo era coperto dall'highlight: è lo stacco
  di regia, come lo SNAP del 3D in `handleContinue`.
- `src/15-live-match.jsx:5534` e `:5555` — le due chiamate `riprendi` del ramo KO207 (gol nato in scena o da piazzato) passano
  `schiera`. I gol nati dal motore stesso (stato `rete`) **non** passano da qui: restano come prima (vedi «Aperto»).
- Testimone `__CPM_KO27` (`src/14-motore-possesso.jsx:997`): alla **battuta**, solo nel motore della partita vera (`cfg.brainLive`; il
  motore del banco non lo passa e prima scriveva voci doppie), giocatori fuori metà, passi di attesa, posizione dell'eroe.
- Rosso `__CPM_NO_SCHIERA27`.

### Misura DOPO

Guardiano nuovo `npm run ripartenza-piazzato` (`tests/visual/ripartenza-piazzato-27.mjs`), casi rigore («Tiro potente», pen_power) e
punizione diretta dal limite («Bordata potente», fk_power), partita vera, pagina nuova per caso e braccio:

| caso | braccio | ripresa (KO207) | fuori metà alla battuta | passi di palla ferma | eroe alla battuta |
|---|---|---|---|---|---|
| rigore | verde | kickoff, (50,50), palla a chi ha subito | **0** | **11** | (46,50) |
| rigore | rosso `__CPM_NO_SCHIERA27` | kickoff, (50,50) | 6 | 2 (battuta al 5°) | (85,50) dischetto |
| punizione | verde | kickoff, (50,50) | **0** | **11** | (46,50) |
| punizione | rosso | kickoff, (50,50) | 6 | 2 (battuta al 5°) | (80,49) |

Soglie: verde fuori ≤ 2 e hold ≥ 8; rosso fuori ≥ 5. Giocato due volte (la seconda sul build finale, dopo la correzione di PO-257), stessi numeri.
Fotografia dopo: `docs/sviluppo/foto-giro27/po207-dopo-rigore.png` — le due squadre ciascuna nella sua metà, l'eroe al cerchio, il
pallone giocato dal centro dalla squadra che ha subito il gol.

`ripartenza-207`: il suo secondo braccio rosso (`rosso18`, recupero MIN202 che consuma il calcio d'inizio) **non vedeva più** il difetto,
perché 11 passi di palla ferma non si consumano con al massimo 8 passi di recupero: la nuova difesa copre anche quella. Il braccio ora
spegne anche `__CPM_NO_SCHIERA27`, così prova il guardiano del giro 18 da solo. Dopo: verde 1/1 al centro, rosso 0 ripartenze, rosso18
`volo@50,50` (difetto visibile) → ✅.

⚠️ Taratura dichiarata: 11 passi sono una scelta (circa mezzo minuto di gioco: con ~22 passi al minuto — il valore lo dà il commento del 7.962 A14 in src/15, non l'ho rimisurato — e `MATCH_TICK_MS` 1700 ms sono
~0,85 s reali a 1x). Non l'ho misurata sul telefono: le fotografie headless (una ogni ~1 s sotto carico) non arrivano a cogliere il
fermo-immagine della battuta, colgono la formazione.

### Aperto

- I gol costruiti dal motore stesso (stato `rete` → `kickoff`) mostrano lo stesso 8-10 fuori metà alla battuta (misurato, gol al 17'
  della sonda). Non passano da `riprendi` e non li ho toccati: lì il campo è visibile e uno schieramento istantaneo sarebbe un
  teletrasporto in vista. È un cantiere separato.

## 2. PO-257 — «🌀 Finta e cambio di passo» intercettata: codice 000

Sonda/guardiano `npm run finta-257` (`tests/visual/finta-257.mjs`), GLB acceso, pagina nuova per giro, scena «fra le linee» costruita dal
motore (`scenaDalMotoreLinee`), azione «Finta e cambio di passo», esito forzato `fail/intercepted`; per fotogramma `__CPM_GST`.

### Misura PRIMA

- Tipo cinematico **`pass`**, variante nulla: la regola 7.798 (`src/11-ui-kit-highlight.jsx:1920`) rende come passaggio ogni dribbling
  con premio «assist». È una scelta documentata (il pallone parte, qualcuno lo colpisce): non l'ho toccata.
- Clip: passaggio `pass` 0,46 s a scala 1 contro finestra `GESTURE_WIN.pass` 0,55 s (dentro la finestra); finta `change` 1,75 s a scala
  3,18 = 0,55 s (la durata della finta `_fnt39`). Peso massimo 1 per entrambe. L'intercetto **non** interrompe la clip del passaggio
  (arriva a ct 0,458 su 0,46). Mira al rilascio (`__CPM_AIM517`): errore 0 rad in tutti i giri.
- Il difetto misurato è l'**ordine**: giro 0 `dribble>pass>change` — la finta non si vede prima e viene giocata **intera dopo** il
  passaggio (a 4889 ms); giro 1 `change>pass>change` — prima e di nuovo dopo.

### Causa

`src/12-three-match-view.jsx:7023-7024`: la finta del build-up (`_fnt39`) avanza il suo tempo solo dentro la timeline; quando parte il
passaggio è ancora sotto la sua durata e resta in sospeso. La condizione del gesto (`src/12-three-match-view.jsx:10520`,
`_fnt39&&!actType&&…&&t<dur`) a passaggio finito (`actType` nullo) la rimonta da capo.

### Correzione

`src/12-three-match-view.jsx:10518`: partito il gesto conclusivo dell'eroe, la finta della scena è consumata (`t=dur`). Rosso
`__CPM_NO_FINTA257`.

### Misura DOPO (finta-257, 2 giri per braccio)

| braccio | giro 0 | giro 1 | finte dopo il passaggio |
|---|---|---|---|
| verde | `dribble>pass>miss` | `change>pass>miss` | **0** |
| rosso | `dribble>pass>change` | `change>pass>change` | 2 |

`miss` è la clip di disappunto dopo l'intercetto (2,13 s), che prima non si vedeva perché la finta rimontata la copriva nel giro 0.

### Aperto

Nel giro 0 la finta **non si vede prima** del passaggio (resta la clip di conduzione `dribble`): è il difetto già dichiarato nel 7.798
(«la finta che precede non si vede, la clip è una sola») e dipende dal build-up scelto. Non corretto in questo giro.

## 3. PO-258 — punizione «Bordata potente» parata: codice 111

Sonda `docs/sviluppo/dati-giro27/sonda-punizione-258.mjs`: scena di punizione costruita dal motore (`scenaDalMotorePiazzato`, x 79-85,
portiere «Tucker» come nel taccuino), pulsante di stile `fk_power` (variante `freekick_direct`, `src/11-ui-kit-highlight.jsx:2010`),
esito forzato a «parata» avvolgendo `resolveSetPieceShot` (senza: 10 «palo» su 12). Fotogrammi `__CPM_GK229` giudicati con lo stesso
criterio di `gk-miss-229` (`CPM_OFFLINE`). Stessa sonda sui due build, con `git worktree` del ramo `sviluppo/highlight-252` (69d5fb6).

| | 7.999.169 | `sviluppo/highlight-252` |
|---|---|---|
| gesto del portiere | `gk_block` 6/6 | `gk_dive` 6/6 |
| il corpo parte rispetto al calcio | **−0,20 / −0,22 s, cioè PRIMA del calcio, 6/6** | +0,06 / +0,08 s, 6/6 |
| disteso rispetto al passaggio del pallone | −0,42 / −1,19 s (si butta e aspetta) | −0,66 / +0,09 s |
| verso sbagliato | 1/6 (fk2) | 0/6 |
| verdetto col criterio gk-miss-229 | ROSSO (verso opposto) | VERDE |

Log completi: `docs/sviluppo/dati-giro27/punizione-258-v169.log`, `punizione-258-v252.log`.

**Il giro 22 risolve il caso sui campioni misurati: non ho toccato quel codice.** Quale dei due commit del giro 22 lo chiude
(0dc23f6 «il riflesso della parata aspetta il calcio» o 69d5fb6 «la pancia della punizione diretta») **non posso confermarlo**: non ho
fatto la bisezione. Residuo sul ramo 252, dichiarato e non giudicato: 3 scene su 6 con il portiere disteso 0,58-0,66 s prima del
passaggio, tutte con calcio→piano oltre 1 s (pallone a terra, quota 0,22 — il volo dell'arco finisce prima del suo piano).

I guardiani esistenti **non vedono** questo caso: passano da `handleAction`, non dal pulsante di stile del piazzato.

| guardiano | 7.999.169 (+ questo giro) | `sviluppo/highlight-252` |
|---|---|---|
| `gk-dive-sync` | ✅ anticipo mediano −0,04 s, peggiore −0,10 | ✅ −0,04 / −0,10 |
| `gk-miss-229` | ✅ 12 giudicati, mediano −0,38 s | ✅ 12 giudicati, mediano −0,37 s |

Quando il ramo 252 sarà integrato, la sonda della punizione andrebbe trasformata in guardiano (sulla 169 oggi sarebbe rossa).

## 4. Chiusura

| passo | esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` · `node tools/check-src.mjs` | ✅ identico byte per byte (7.209.208 byte, 21 frammenti) |
| `ripartenza-piazzato` (nuovo) | ✅ verde rigore + punizione, rossi visibili |
| `finta-257` (nuovo) | ✅ verde 0 finte dopo, rosso 2 |
| `ripartenza-207` | ✅ verde, rosso e rosso18 visibili |
| `gk-dive-sync` | ✅ |
| `gk-miss-229` | ✅ |
| `goal-postarc` | ✅ 6 gol dichiarati, 6 in porta, classi A/B/C 0 |
| `validate-situations` | ✅ PASS 14/14, fingerprint 00001505, 0 failure (warn: motion, bg-coherence, live-smoke) |
| `partita-vera` | ✅ bande tengono (6/6 gol con manovra, nomi 67/67) |
| `test:logic` | ✅ 43/43 |

Non eseguiti in questo giro: `save-compat`, `replay`, `career-critical`, `design-system` (non richiesti; il salvataggio non cambia,
nessun campo nuovo). La catena completa di CLAUDE.md per il motore li prevede prima di una promozione su `main`.
