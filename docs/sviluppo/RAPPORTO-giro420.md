# Rapporto giro 420 — PO-683: l'esultanza non va mai sotto la curva avversaria

Ramo: `sviluppo/giro420-esultanza-curva` (base `main`). GAME_VERSION e `docs/governo` non toccati.

## La voce del PO

«Non bisogna mai festeggiare solo la curva avversaria, è un gesto antisportivo.»

## Misura (prima di correggere)

Sonda/guardiano `tests/visual/esultanza-420.mjs`: partita di carriera vera (salvataggio sintetico della
sonda 296), **in casa e in trasferta**, primo e secondo tempo, corpi 3D accesi (`__CPM_GLB=true`), gol
forzati con l'esultanza imposta (corsa sotto la curva · corsa alla bandierina · scivolata). Il gioco scrive
il testimone `__CPM_G420W` (solo sotto `?cpmtest=1`): partenza e arrivo dell'eroe, bersaglio della corsa,
dove stanno i suoi tifosi e, per ogni fotogramma, quale settore sta davanti alla camera.

Causa trovata nel codice (src/12, esecuzione dell'esultanza): la corsa «sotto la curva», la corsa alla
bandierina e la scivolata andavano **sempre verso x+**, cioè sotto la curva dietro la porta appena battuta.
Lo stadio mette i tifosi di casa reale nella Curva Sud (x+) e gli ospiti nella Curva Nord (x−), e alla
ripresa gira di 180° (7.732). Quindi quella curva è dei tifosi dell'eroe solo in due casi su quattro:

| partita | tempo | curva dietro la porta attaccata | prima (rosso `__CPM_NO_G420`) | dopo |
|---|---|---|---|---|
| casa | 1° | curva di casa (sua) | festa sotto i suoi | invariato |
| casa | 2° | curva ospiti (avversari) | **3/3 sotto la curva avversaria** | 0/3: corre verso la sua panchina (dx −16,4…−19,7 u) |
| trasferta | 1° | curva di casa (avversari) | **3/3 sotto la curva avversaria** | 0/3: corre verso la sua panchina (dx −18,1…−25,2 u) |
| trasferta | 2° | settore ospiti (suo) | festa sotto i suoi | invariato |

Il gol si segna a 5-7 u dalla linea di fondo: l'eroe è già sotto quella curva, e prima la corsa lo
spostava di −2,4…+4,4 u, cioè restava lì. Totale: verde 12 corse giudicate, 0 sotto la curva avversaria;
rosso 12 corse, 6 sotto la curva avversaria; zero errori di pagina.

**Camera** (misurata, non giudicata): nei sei casi «tifosi dietro la propria porta» la camera guarda la
curva avversaria nel **100%** dei fotogrammi d'esultanza, prima e dopo (236 su 236 fotogrammi). La camera
sta dietro l'eroe verso la porta attaccata: ora l'eroe si allontana da quella curva, ma lo sfondo resta
quello. Vedi dubbio 1.

**Testi** (scansione statica di `src/*.jsx`): due frasi colpevoli in src/15 — r.315 «si gira verso la curva
a braccia larghe: lo stadio esplode, la panchina avversaria molto meno» (verso una curva qualunque e con lo
sberleffo alla panchina avversaria) e r.349 «chiama tutti sotto la curva». In più r.348 «si ferma un attimo
davanti alla curva» (non dice quale).

## Correzione alla fonte

- **src/12** (esecuzione dell'esultanza): `_own420` = dove stanno i tifosi dell'eroe (`heroStandHome` ×
  tempo, la stessa espressione che fa girare lo stadio). Se stanno dietro la propria porta, le corse
  «crowd»/«corner» vanno verso la **panchina dell'eroe** (x −14, lato panchine), lunghe run+4 u; i
  compagni lo raggiungono come prima. Rosso: `window.__CPM_NO_G420`.
- **src/15** testi: «si gira verso i suoi tifosi a braccia larghe: il loro settore esplode» · «alza lo
  sguardo verso i suoi tifosi prima di tornare a centrocampo» · scelta «Sotto i nostri tifosi con la
  squadra» / «chiama tutti sotto il settore dei suoi tifosi».
- **src/15** gancio solo collaudo `__CPM_TEMPO420` (1|2, letto solo sotto `cpmtest`) nella stessa
  espressione `_tempo143` che dà il tempo allo stadio 3D e agli spalti 2D.

## Foto

`docs/collaudo-po/420-{prima,dopo}-{casa,trasferta}-t{1,2}.png` (telefono 412×600, fine esultanza).
In `420-prima-trasferta-t1.png` l'eroe (ospite) festeggia alla bandierina sotto lo striscione «FORZA
NERAZZURRI» dei padroni di casa; in `420-dopo-trasferta-t1.png` è tornato verso la propria metà.

## Guardiano

`npm run esultanza-420` (~8 min, due bracci). Verde: ≥4 corse giudicate per lato, ≥2 coi tifosi dietro la
propria porta, 0 sotto la curva avversaria, 0 errori, 0 testi colpevoli. Rosso `__CPM_NO_G420`: ≥2 corse
sotto la curva avversaria; il rosso dei testi è la stessa scansione sulla base (`CPM_BASE`, default
`origin/main`), che deve trovare le frasi di prima (ne trova 2). Messo nella MAPPA nelle righe di src/12 e
di src/15.

Esito: **verde + rosso visibile** (6 corse sotto la curva avversaria col rosso, 0 col verde).
Giro `node ci-runner.mjs giro esultanza-420`: vedi in fondo.

## Dubbi per il PO

**1. La camera durante l'esultanza guarda ancora la curva avversaria** (100% dei fotogrammi nei casi del
difetto).
- **A (consigliata, applicata): lasciarla.** L'eroe non va più sotto quella curva e se ne allontana; la
  camera inquadra l'eroe, e girarla nel mezzo dell'esito rischia la classe «traballa» (codice 007).
- B: durante le corse verso la panchina portare la camera di lato (dal campo verso le panchine), così lo
  sfondo è la tribuna.
- C: stacco breve su un'inquadratura larga della panchina all'arrivo dell'eroe.

**2. Dove va l'esultanza quando i tifosi sono dietro l'altra porta.**
- **A (consigliata, applicata): verso la propria panchina**, i compagni lo raggiungono.
- B: verso i compagni più vicini (come «corsa incontro ai compagni»), senza direzione fissa.
- C: corsa lunga verso la propria curva (oltre metà campo): realistica in qualche stadio, ma lunga e fuori
  dalla durata dell'esultanza (2,2-4,2 s).

**3. La riga MAPPA «delle esultanze».** `esultanza-braccia` non ha una riga nella MAPPA: sta solo nel treno
grande notturno (`SOLO_NOTTE_329`).
- **A (consigliata, applicata): `esultanza-420` nelle righe esistenti di src/12 e src/15** (i file che tocca).
- B: anche `esultanza-braccia` nella riga di src/12 (la toglierebbe dalla notte).
- C: una riga nuova solo per le esultanze (vietato dalla regola «la riga che esiste già»).

**4. Premiazione con la coppa nel secondo tempo (non misurato in questo giro).** La festa del trofeo
(7.278) va sotto `CURVA_X = ±(AWAY_GOAL_X-6)` col segno di `heroStandHome`, senza tenere conto della
rotazione dello stadio alla ripresa (7.732). Se lo stadio è ancora girato durante la premiazione, la festa
andrebbe sotto la curva sbagliata. Non posso confermarlo senza misura.
- **A (consigliata, applicata): nessuna modifica in questo giro**, voce da aprire con misura (sonda come
  questa sulla `__CPM_FORCE_CEREMONY`).
- B: correggere subito usando la stessa `_own420`.
- C: rimettere lo stadio dritto all'inizio della premiazione.

## Giro

`cd tests/visual && node ci-runner.mjs giro esultanza-420` sulla build 7.999.217 (GAME_VERSION non toccata):
**18/18 verdi** — esultanza-420 (308 s), mappa-unica, test:logic, save-compat, replay, migrazione-194,
design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical,
battito-264, partita-vera, gk-dive-sync, schermate-97. Il resto lo giudica il treno.
Le foto dei guardiani grafici e `docs/governo/STABILITA.json` riscritti dal giro sono stati scartati (non
sono parte della consegna).
