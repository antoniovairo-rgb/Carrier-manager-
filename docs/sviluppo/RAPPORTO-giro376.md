# Rapporto giro 376 — PO-647: il trofeo nella festa (appoggio sul trespolo e rotazione in mano)

Ramo: `sviluppo/giro376-trofeo` (base `lavoro/201` @ 8543a9cc). GAME_VERSION e `docs/governo` non toccati.

## Voce del PO
«durante il festeggiamento 3D il trofeo non è posizionato bene sul trespolo e ruota anche nelle mani dei giocatori / eroe».

## Misura PRIMA (dalle mesh, sonda `tests/visual/trofeo-376.mjs` con `__CPM_NO_G376`)

Premiazione di squadra (src/12, GLB acceso). Scarto verticale = vertice visibile più basso del trofeo − piano del piedistallo (1,05);
orizzontale = asse del trofeo − asse del piedistallo; giro in mano = velocità angolare del trofeo rispetto a chi lo tiene.

| trofeo | verticale | orizzontale | giro in mano (mediana) | fotogrammi in mano oltre 0,6 rad/s |
|---|---|---|---|---|
| coppa (cup) | **−0,093** (affonda) | 0 | **1,30 rad/s** | 100% |
| piatto di campionato (league) | **−0,360** (affonda) | 0 | **1,30 rad/s** | 100% |
| coppa internazionale (int) | **−0,102** (affonda) | 0 | **1,30 rad/s** | 100% |
| coppa, eroe capitano | **−0,093** | 0 | **1,30 rad/s** | 100% |

Parata sul pullman (src/16, piedistallo a prua, corpi di ripiego): coppa europea **+0,135**, piatto **+0,138** (galleggia sopra il trespolo).

Cause:
- src/12: la quota di riposo era fissa, `_top − 0,25·scala`, che non è la base di nessun trofeo (la base vera è a 0,10 locale per le coppe,
  −0,46 per il piatto che sta in piedi sul bordo).
- src/12: `trophyGrp.rotation.y += aDt*1.3` a ogni fotogramma, in mano compresa.
- src/16: il piano del piedistallo stava a 0,2, la base del trofeo (scala 0,62) 0,14 più su.
- src/16, rotazione: già ferma in mano all'eroe; **nessun ramo della parata mette la coppa in mano a un compagno** (letto nel codice: o
  in mano all'eroe con i corpi CGTrader, o sul piedistallo e lì gira). Niente da correggere lì.

## Correzione (alla sorgente, deterministica)

- **src/12 `_base376` / `_low376`** (dopo la costruzione di `trophyGrp`): base = vertice visibile più basso della geometria, nel
  riferimento del gruppo senza scala, calcolata una volta per tipo di trofeo. Il riposo sul piedistallo usa `_top − base·scala`.
- **src/12, rotazione** (al posto di `trophyGrp.rotation.y+=aDt*1.3`): gira solo con `_rest192` (appoggiato). In mano è RIGIDO col
  corpo del più vicino fra eroe e capitano: verso = verso del corpo a meno di mezzo giro (coppa e piatto simmetrici: manici sulla
  linea delle mani), quindi il passaggio capitano→eroe, dove i due si guardano, non fa girare la coppa. Unico tratto in moto: il volo
  della presa dal piedistallo, con la stessa curva della presa (`_grab192`).
  Prima stesura scartata dalla misura: inseguimento esponenziale (τ 0,1 s) → 24% dei fotogrammi in mano oltre 0,6 rad/s (le transizioni).
- **src/16, `ParataBus3D`** (dopo `_spin429.scale.setScalar(_TSC453)`): il piedistallo `cped` sale fino al vertice più basso del
  trofeo (base ferma a −0,2). Il trofeo non si sposta: la presa in mano (`presaCoppa192`) conta dalla quota 0,2.
- Testimone `__CPM_T376` (src/12, solo `cpmtest` e solo se armato). Rosso: `window.__CPM_NO_G376` (comportamento di prima, in tutti e tre i punti).

## Misura DOPO

| trofeo | verticale | orizzontale | giro in mano (mediana) | oltre 0,6 rad/s | fotogrammi appoggio / in mano |
|---|---|---|---|---|---|
| cup | 0 | 0 | 0 | 0% | 75 / 148 |
| league | 0 | 0 | 0 | 0% | 81 / 157 |
| int | 0 | 0 | 0 | 0% | 64 / 140 |
| cup, eroe capitano | 0 | 0 | 0 | 0% | 34 / 62 |

Pullman: −0,003 / −0,004 (resto = rollio del pullman, 0,008 rad sul bordo del cubo), orizzontale ≤ 0,004.

Foto (deviceScaleFactor 2) in `docs/collaudo-po/giro376/`: `prima|dopo-piedistallo-{cup,league,int}.png`,
`prima|dopo-in-mano-{cup,league,int}.png`, `prima|dopo-pullman-coppa.png`. La più leggibile: `*-piedistallo-league.png` (il piatto
infilato nel piedistallo, poi posato sul bordo).

## Guardiano
`npm run trofeo-376` (~9 min, nelle LENTI): A premiazione × {cup, league, int, eroe capitano} verde+rosso; B pullman verde+rosso.
Soglie: appoggio |verticale| ≤ 0,01 e orizzontale ≤ 0,01; in mano mediana ≤ 0,05 rad/s e quota oltre 0,6 rad/s ≤ 10%; il rosso deve
mostrare il giro (≥ 1,0 rad/s) e, per l'appoggio, ≥ 0,05. «Non giudicato» (pochi fotogrammi) = rosso.
MAPPA: aggiunto in testa alle righe esistenti `/src\/12-|src\/13-/` e `/src\/16-/` (nessuna riga nuova); `mappa-unica` verde.

## File e funzioni toccati
- `src/12-three-match-view.jsx`: helper `_vis376`/`_base376`/`_low376` dopo `trophyGrp`; quota `_ry0` del piedistallo (blocco giro 192 B);
  riga della rotazione del trofeo + testimone `__CPM_T376`.
- `src/16-scene-3d-cerimonie.jsx`: `ParataBus3D`, altezza del piedistallo `cped`.
- `CARRIER-MANAGER-AV.html` (ricomposto con `build-src`).
- `tests/visual/trofeo-376.mjs` (nuovo), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (MAPPA + LENTI).

## Guardiani della zona NON girati (li giudica il treno)
`cerimonie-192` (B: volo della coppa, D: parata), `pullman-204` (P: piedistallo vuoto dopo la presa), `podio-260`, `serata-314`,
`salto-323`, `rigori-296`, `presentazione-225`, il resto delle righe src/12 e src/16. Girati: `trofeo-376` (verde+rosso), le 17
sentinelle (`node ci-runner.mjs giro trofeo-376`), `mappa-unica`.

## Dubbi per il PO (consigliata per prima, già applicata)
1. **[APPLICATA] Il trofeo gira solo sul piedistallo, in mano è fermo rispetto a chi lo tiene** (manici sulla linea delle mani).
   Effetto in scena: vetrina che ruota piano finché nessuno la prende, poi un oggetto vero.
2. Il trofeo non gira mai, nemmeno sul piedistallo (rivolto verso la camera): più sobrio, come in una premiazione vera; si perde l'effetto vetrina.
3. In mano mantiene il verso che aveva al momento della presa (fisica pura): rischio di manici davanti/dietro al corpo, mani che
   stringono l'aria; scartata per questo.

Altre note per il PO:
- A inizio passaggio capitano→eroe il CORPO del capitano si gira di colpo verso l'eroe (codice del giro 137, non toccato): ora il
  trofeo resta rigido con le sue mani, quindi lo scatto che si vede è quello del corpo, non della coppa. Se disturba, è una voce a parte.
- Il piatto di campionato sul piedistallo sta in piedi sul bordo (è un disco verticale). Alternativa: posarlo inclinato su un leggio. Da decidere.
- PO-655 (sul pullman con i corpi CGTrader il trofeo non si vede) resta fuori da questo giro.
