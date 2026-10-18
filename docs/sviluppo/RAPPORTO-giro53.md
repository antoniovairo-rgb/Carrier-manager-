# Rapporto giro 53 — PO-273 · PO-274 · PO-275 (collaudo 3D 7.999.171)

Ramo `sviluppo/highlight-273-giro53`, base `lavoro/172-base` (7.999.171). Fonte: collaudo 3D 7.999.171
(`collaudo/release-7.999.171-3d`, `docs/collaudi/RAPPORTO-release-7.999.171-3d.md`). `GAME_VERSION`/`SAVE_VERSION` invariati
(come negli altri giri, la versione la assegna l'unione); toccati solo `src/12-three-match-view.jsx` (+ build
`CARRIER-MANAGER-AV.html`) e `tests/visual/`. Zona G non toccata.

## Sintesi

| Voce | Causa misurata | Correzione | Interruttore rosso | Guardiano (verde · rosso) |
|---|---|---|---|---|
| PO-273 eroe fuori quadro in scelta («Volée di collo potente») | la guardia-palla (7.305) ruotava lo sguardo di 9-10 u verso il pallone sulla bandierina; il tetto che tiene l'eroe nel 94% del semiquadro valeva solo sugli highlight difensivi | il tetto vale anche nelle fasi di presentazione (intro/move/scelta) quando il soggetto è l'eroe | `__CPM_NO_PG273` | `inquadra-273` · 0% · 77,8% |
| PO-274 salti del pallone scoperti in `hl_result` | (a) gli «arco» 6-6,5 u del collaudo sono velocità del tiro × intervallo headless, non teletrasporti; (b) cercando su partite intere, 8 salti VERI (9-19,5 u) tutti dall'aggancio del pallone al piede che trascinava il pallone dalla bandierina | (a) lo strumento giudica solo i salti non spiegati dalla velocità; (b) il pallone lontano vola (parabola) al piede e il calcio lo aspetta | `__CPM_NO_VOLO274` (gioco) · `__CPM_SALTO274` (prova dello strumento) | `salti-274` 30 u/s · 252,7 u/s; `apertura-261` 0 · 4 |
| PO-275 memoria 220→388→507 MB | perdita VERA: alla 2ª partita restavano vive 2 scene e 3 renderer; trattenute da `_glbCache` e `_kitTexCache` via gli ascoltatori `dispose` del renderer vecchio (+ gli agganci di collaudo sotto `cpmtest`) | allo smontaggio si liberano anche le risorse dei modelli e delle maglie in cache | `__CPM_NO_MEM275` | `memoria-275` 1 scena · 2 scene |

## PO-273 — eroe fuori quadro in scelta

**Riproduzione.** Sonda nuova `tests/visual/inquadra-273.mjs`: rigioca le partite m2 e m4 del collaudo (stesso nome
`Coll2`/`Coll4`, stesso seme di autoplay 1442/1584, GLB acceso, `__CPM_PRESENT=1`, `__CPM_REALWAIT=1`, 412×915) e registra
ogni fotogramma delle scene (`__CPM_FR73`, a cui ho aggiunto l'altezza apparente `h`, solo collaudo). Le partite non tornano
identiche fra un giro e l'altro (il tempo reale entra nel flusso), quindi si giudica la **famiglia**, non una scena precisa.

**Misura prima (codice di base).** Scene aeree con «Volée di collo potente» fra le azioni:
- p2 70' «Calcio d'angolo di FERRARI»: eroe fuori **18/22** fotogrammi d'apertura;
- p4 78' «Il cross di COLOMBO arriva alto in area!»: fuori **15/17** in apertura e **1/1** in scelta.
Le altre scene: 0-1 fotogrammi fuori. In scelta il giro 3D registra 1-2 fotogrammi per scena (il resto del tempo la scena è
ferma in lettura), per questo il guardiano giudica intro+move+scelta insieme («presentazione»).

**Causa.** Nei fotogrammi fuori quadro il bersaglio dello sguardo (`tl`) stava sull'eroe, lo sguardo reale (`look`) 9-10 u
più in là verso il pallone sulla bandierina (es. p2: `tl` (27,5; 5,3), `look` (26,2; 14,3); eroe (14,6; 2), pallone (47; 32,3)).
La guardia-palla (7.305: «la regia non perde mai il pallone», attiva in tutte le fasi) ruotava lo sguardo verso il pallone; la
guardia-eroe non interveniva perché il BERSAGLIO conteneva l'eroe (regola 7.704, «non si strattona una vista in viaggio»). Il
tetto che impedisce alla guardia-palla di spingere l'eroe fuori (7.999.74, 94% del semiquadro) valeva solo con `P.hlDef`.

**Correzione** (`src/12`, guardia-palla): lo stesso tetto vale anche quando non siamo in `hl_result` e il soggetto è l'eroe
(`!isResult && !_subjBall50`). Il pallone entra se c'è posto; l'eroe resta dentro. In `hl_result` non cambia nulla (lì il
soggetto passa al pallone per regia, 7.237/7.520).

**Misura dopo** (stesse due partite, verde e rosso nello stesso momento):

| braccio | scene aeree | fotogrammi di presentazione con l'eroe fuori |
|---|---|---|
| verde (giro 53) | p2 corner 70' · p4 cross 34' | **0/7 · 0/9** |
| rosso `__CPM_NO_PG273` | p2 cross 41' · p2 corner 57' · p4 corner 45' | **12/13 · 8/10 · 1/1** |

Guardiano `npm run inquadra-273` (2 partite intere, ~6 min): verde = quota fuori sulle scene aeree ≤ 20%; rosso
(`CPM_ROSSO=__CPM_NO_PG273`) ≥ 50%; cieco (uscita 2) se non compare almeno una scena aerea con 5 fotogrammi.
Esito: verde ✅ **0/28 fotogrammi (0%)** su 3 scene aeree (comprese le due «Volée di collo potente», corner 57' e cross
78') · rosso ✅ **77,8%** (7/9).

**Non risolto qui (annotato).** In `hl_result` delle scene «Ricevi fra le linee» l'eroe resta fuori 43-71 fotogrammi su
81-101: lì il soggetto è passato al pallone (regia voluta dal 7.237); è un'altra decisione di regia, non toccata.

## PO-274 — salti del pallone scoperti in conclusione

**Strumento prima.** Il varco `__CPM_BJ478` dichiara un salto quando il pallone si sposta di ≥ 6 u fra due fotogrammi. Ho
aggiunto a ogni voce il passo di scena (`dt`), durata/lunghezza/tempo dell'arco (`ad`/`al`/`aT`) e l'istante (`t`), così si
calcola il **passo atteso** dell'arco = lunghezza × dt / durata.

**Misura 1 — i salti del collaudo non sono teletrasporti.** `apertura-261` su 6 partite: gli «arco» scoperti in `hl_result`
valevano 6,1-8,7 u con passo atteso 4,3-6,9 u e passi di scena 0,11-0,24 s: è il tiro (30-41 u/s di scena) visto a pochi
fotogrammi — a 60 fps sarebbero ~0,7 u per fotogramma. Stessa trappola già nota (7.360, 7.478, 7.502): soglia fissa = misura
dello scheduler. Ho cambiato il giudizio di `apertura-261`: conta come rosso il salto in `hl_result` non spiegato dalla
velocità (arco oltre 2× il passo atteso + 1 u; senza arco misurabile, oltre 50 u/s di scena). Prova del rosso dello
strumento: `__CPM_SALTO274` (solo collaudo) inietta un teletrasporto di 25 u per scena → **4 teletrasporti contati** ✅.

**Misura 2 — i salti veri.** Col giudizio nuovo il verde di `apertura-261` è risultato rosso: «arco 20,5 u in 0,08 s, arco
in attesa del calcio (T = −0,19)» — l'arco non muove il pallone in attesa, quindi l'aveva mosso uno scrittore anonimo. Sonda
nuova `salti-274.mjs` + registratore di sola diagnosi `__CPM_BALLSET274` (le coordinate del pallone diventano accessori e ogni
assegnamento oltre 6 u si registra con la pila di chiamate; le righe della pila corrispondono al codice trasformato da Babel,
leggibile da `document.scripts`). Su 4 partite intere: **8 salti non spiegati (6,6-19,5 u), tutti dallo stesso scrittore**:
l'aggancio del pallone al piede durante il caricamento del calcio (`_cgKickContact`, `_gain = min(aDt·24, 1)`). Sui corner la
conclusione si arma col pallone ancora sulla bandierina (47; ±32,3) e l'aggancio lo trascinava per 25-35 u fino al piede in
3-4 fotogrammi (19,5 → 12,7 → 7,9 u), senza volo.

**Correzione** (`src/12`, ramo `_cgKickContact`): se all'armo del calcio il pallone è oltre 4 u dal piede, fa una parabola
(quota fino a 0,12 × distanza, max 5) fino al piede a velocità da cross (32 u/s di scena); il calcio aspetta trattenendo
`ballArcT` (stesso schema dell'avanzata 7.773 e dell'attesa del colpo di testa 7.999.146; tetto 2,4 s reali) così che
l'arrivo coincida col contatto. Sotto 4 u resta l'aggancio di prima. Lo scrittore si firma `volo274` nel testimone F2.

**Guardiano** `npm run salti-274` (2 partite intere): il testimone `__CPM_VOLO274` annota in **entrambi i bracci** ogni
conclusione armata col pallone lontano e la velocità di scena massima del pallone nel caricamento (grandezza indipendente
dagli fps). Verde = 0 salti non spiegati e velocità ≤ 60 u/s; rosso (`__CPM_NO_VOLO274`) > 150 u/s.

| braccio | conclusioni col pallone lontano | velocità massima nel caricamento | salti non spiegati |
|---|---|---|---|
| verde | 5 (6,1-8,1 u) | **30 u/s** | 0 |
| rosso `__CPM_NO_VOLO274` | 2 (10,5 · 4,4 u) | **252,7 u/s** | 0 (in quella corsa) |

Prima stesura del rosso scartata: contava i salti non spiegati, e in 2 partite l'evento non è uscito (0) — l'aggancio dal
corner capita circa 2 volte su 4 partite. La velocità nel caricamento lo misura a ogni conclusione col pallone lontano.

**Non risolto qui (annotato).** Classe «avvicinamento» in `hl_intro`/`hl_choose` (6-17,8 u a passi di 0,22-0,30 s): il lerp
del portatore difensivo `min(1, aDt·10)` diventa uno scatto intero quando il passo di scena è ≥ 0,1 s (telefono lento
compreso). Non è in `hl_result` (fuori dalla richiesta) e non è stato corretto.

## PO-275 — memoria fra due partite nella stessa pagina

**Strumento.** `tests/visual/memoria-275.mjs`: Chromium con `--js-flags=--expose-gc`; a ogni tappa `gc()` tre volte, poi heap
e **conteggio degli oggetti vivi per prototipo** (`Runtime.queryObjects` via CDP: Object3D, Mesh, SkinnedMesh, Texture,
BufferGeometry, Material, AnimationMixer, WebGLRenderer, Scene, canvas). `lib/heap-retainers.mjs`: dallo snapshot dell'heap
(lettura a flusso: 700 MB) il percorso più corto dalle radici del GC a ogni `THREE.Scene` viva, con esclusione iterativa.

**È una perdita vera.** Dopo GC, avvio 1ª partita → avvio 2ª: **1 → 2 scene, 2 → 3 renderer, 830 → 1664 corpi animati,
91 → 204 mixer**, heap 326 → 480 MB. Esclusi con misura: cicli `requestAnimationFrame` vivi (uno solo per sorgente), canvas
nel DOM (uno solo), proprietà di `window` (tolte tutte e 439: le scene restano 2).

**Chi la tratteneva** (snapshot):
1. **sotto `?cpmtest=1`**: gli agganci di collaudo `window.__CPM_*` (6 a GLB spento, ~40 a GLB acceso: `__CPM_GKW`,
   `__CPM_VIS665`, `__CPM_STATE`, …) chiudono sulla scena della prima vista. In produzione non esistono (sono sotto
   `_CPM_TEST`/`_SIT_TEST`), ma **pesano su ogni misura di memoria del collaudo**: i 507 MB del rapporto 171 includono questo.
2. **in produzione**: `_glbCache` → modello in cache (`korward-regular-player-stocky.glb`) → suo materiale → ascoltatore
   `dispose` registrato dal renderer della partita vecchia → stato del renderer → luci → `parent` = scena vecchia. I materiali
   dei GLB in cache sono condivisi coi cloni in campo e `renderer.dispose()` non toglie i propri ascoltatori.
3. **in produzione**, dopo il primo rimedio: `_kitTexCache` → texture della maglia → ascoltatore del renderer → contesto WebGL
   → canvas → ascoltatore `webglcontextlost` → scena.

**Correzione** (`src/12`, smontaggio di `ThreeMatchView`): si liberano anche geometrie, materiali e texture dei modelli in
`_glbCache` e le texture di `_kitTexCache`; il loro `dispose` toglie gli ascoltatori. Il contesto WebGL della partita dopo è
nuovo, quindi quelle risorse andavano ricaricate in ogni caso.

**Misura** (tappa «avvio 2ª partita, tolti gli agganci `__CPM*`» = produzione):

| braccio | scene | renderer | corpi animati | heap dopo GC |
|---|---|---|---|---|
| verde (giro 53) | **1** | 2 → 2 | 830 → 830 | **374 MB** |
| rosso `__CPM_NO_MEM275` | 2 | 2 → 3 | 830 → 1664 | 483 MB |

Guardiano `npm run memoria-275` (una partita intera + avvio della seconda, ~5 min). Limite: senza togliere gli agganci di
collaudo la scena vecchia resta comunque viva sotto `cpmtest` — per misurare la memoria di produzione si usa la tappa senza
agganci (`CPM_VIAHOOK275=1`, già nello script npm). Su dispositivo vero: **Non posso confermarlo** (nessuna misura su telefono).

## Residui L1-bis (voce 4)

- **PO-261 eroe piccolo in apertura**: misurato nelle stesse partite di `inquadra-273`, altezza apparente in `hl_intro`
  0,045-0,081 (distanza camera→eroe 22-54 u), in `hl_result` 0,06-0,16. Coincide col collaudo (0,056-0,074). È la taglia di
  regia (7.505/7.509: 0,24 bocciata dal PO sul telefono, oggi 0,18 chiesta): decisione del PO, non toccata.
- **PO-218/250 lessico esiti, PO-143 cross #126**: non misurati in questo giro (tempo speso sulla caccia ai trattenitori di
  memoria e allo scrittore del salto). **Non posso confermarne** lo stato oltre il collaudo 171.

## Verifiche

Tutte eseguite sul build finale di questo ramo (`node tools/check-src.mjs`: identico byte per byte ai 21 frammenti).

| passo | esito |
|---|---|
| `validate-situations` (gate) | ✅ **14/14 PASS**, fingerprint **00001505**, 0 failure (732 s) |
| `test:logic` · `save-compat` · `design-system` · `typing-shortcuts` · `career-critical` | ✅ tutti verdi |
| `inquadra-273` (nuovo) | ✅ verde 0% · rosso `__CPM_NO_PG273` 77,8% |
| `salti-274` (nuovo) | ✅ verde 30 u/s, 0 salti · rosso `__CPM_NO_VOLO274` 252,7 u/s |
| `memoria-275` (nuovo) | ✅ verde 1 scena / 374 MB · rosso `__CPM_NO_MEM275` 2 scene / 483 MB |
| `apertura-261` (giudizio dei salti nuovo) | ✅ verde (prima immagine 4/4, 0 teletrasporti) · rosso `__CPM_SALTO274` 4 teletrasporti |
| `volee-62` (aggancio della volée toccato) | ✅ verde quota minima 0,95 · rosso 0,23 |
| `gk-dive-sync` · `goal-postarc` · `buildup-sync` | ✅ PASS (build-up 37 osservati, salto mediano 0,9 u) |

Non eseguite: la catena `mirata` di `ci-runner.mjs` per intero (per `src/12` sono decine di guardiani, ore di corsa) e
`partita-vera`. I tre guardiani nuovi sono nella MAPPA `src/12-` e fra i passi lenti di `ci-runner.mjs`, non nella `completa`
(decisione del PO). Headless con GL software (7-10 fps, meno con più browser): i tempi assoluti non sono giudicabili, le
grandezze dei guardiani sono adimensionali o in tempo di scena. Riga di roadmap non scritta: questo giro non spedisce una
versione (la scrive l'unione).

## File

- `src/12-three-match-view.jsx`: guardia-palla (PO-273), volo al piede + trattenuta del calcio (PO-274), rilascio delle cache
  allo smontaggio (PO-275); strumenti di solo collaudo: `h` in `__CPM_FR73`, campi `dt/ad/aT/al/ar/t` in `__CPM_BJ478`,
  `__CPM_SALTO274`, `__CPM_BALLSET274`, `__CPM_VOLO274`.
- `tests/visual/`: `inquadra-273.mjs`, `salti-274.mjs`, `memoria-275.mjs`, `lib/heap-retainers.mjs` (nuovi); `apertura-261.mjs`
  (giudizio dei salti); `package.json` (tre script); `ci-runner.mjs` (MAPPA `src/12-` e passi lenti).
