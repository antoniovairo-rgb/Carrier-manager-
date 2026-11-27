# Rapporto giro 434 — PO-688: la festa del trofeo e la curva dei propri tifosi

Ramo: `sviluppo/giro434-premiazione-curva` (base `main` 7.999.218 + unione di `origin/sviluppo/giro420-esultanza-curva`,
che porta `_own420`). GAME_VERSION e `docs/governo` non toccati. Temi dei giri 431/432/433 (statura, barba/capelli,
carnagione) non toccati.

## La voce

Dubbio 4 del giro 420. La festa del trofeo (7.278) va sotto `CURVA_X = ±(AWAY_GOAL_X-6)` col segno di `heroStandHome`,
ma lo stadio alla ripresa gira di 180° (7.732). Se durante la premiazione lo stadio è ancora girato, la festa finisce sotto
la curva avversaria (il gesto di PO-683). Prima di questo giro non era misurato.

## Misura (prima di correggere)

Sonda/guardiano `tests/visual/premiazione-434.mjs`. Partita di carriera vera (salvataggio sintetico della sonda 296),
**in casa e in trasferta**, telefono 412×600, corpi 3D accesi (`__CPM_GLB=true`). Testimone nuovo `__CPM_G434W` (solo
sotto `?cpmtest=1`), che scrive a ogni fotogramma della cerimonia:
- dove stanno le bandiere e i telefoni «della curva dei tuoi» (7.426/7.429);
- dove va la festa (`CURVA_X`) e dove arriva l'eroe nel giro di campo e sotto la curva;
- quale settore ha davanti la camera.

**Dove stanno i tifosi dell'eroe la sonda lo ricava da sé**, senza fidarsi del codice: segno di casa per la rotazione
vera del gruppo-radice dello stadio (`stadiumRoot.rotation.y`, letta dalla scena: 0 = dritto, π = girato).

I casi misurati sono sei per lato:

| caso | come si raggiunge | stadio |
|---|---|---|
| forzata, stadio dritto | `__CPM_FORCE_CEREMONY` + `__CPM_TEMPO420=1` (in gioco non capita: a fine partita il cronometro è ≥ 90) | dritto |
| forzata, campionato | `__CPM_TEMPO420=2`. È l'espressione `clock>=45`, identica a 90' e a 120': vale per la finale vinta nei regolamentari e per quella vinta ai supplementari | girato |
| forzata, coppa | come sopra, `kind:'cup'` | girato |
| forzata, promozione | `kind:'promo'`: ha il beat «curva» | girato |
| forzata, cerimonia leggera | `light:true`: ha il giro di campo e il beat «curva» | girato |
| **vera, dopo i rigori** | `__CPM_SO_FORCE(120)`: 1-1 al 120', serie vera, premiazione vera; il tempo lo dà il cronometro | girato |

Il «1° tempo» e il «2° tempo» del compito qui non si distinguono per il minuto del gol decisivo. La premiazione arriva
sempre a partita finita, col cronometro ≥ 90, quindi con lo stadio girato. Il caso «dritto» si raggiunge solo col gancio
di collaudo e resta come controllo che la regola non rompa lo stadio dritto.

### Esito prima (rosso `__CPM_NO_G434` = comportamento di `main`)

| lato | caso | tifosi dell'eroe | bandiere/telefoni | festa (`CURVA_X`) | verdetto |
|---|---|---|---|---|---|
| casa | stadio dritto | x+ | x+ | — | coi suoi tifosi |
| casa | campionato girato | x− | **x+** | — | **sotto la curva avversaria** |
| casa | coppa girato | x− | **x+** | — | **sotto la curva avversaria** |
| casa | promozione girato | x− | **x+** | **+40** (eroe a x 32) | **sotto la curva avversaria** |
| casa | leggera girato | x− | **x+** | **+40** (eroe a x 39) | **sotto la curva avversaria** |
| casa | **vera, rigori** | x− | **x+** | — | **sotto la curva avversaria** |
| trasferta | stadio dritto | x− | x− | — | coi suoi tifosi |
| trasferta | campionato girato | x+ | **x−** | — | **sotto la curva avversaria** |
| trasferta | coppa girato | x+ | **x−** | — | **sotto la curva avversaria** |
| trasferta | promozione girato | x+ | **x−** | **−40** | **sotto la curva avversaria** |
| trasferta | leggera girato | x+ | **x−** | **−40** (eroe a x −27) | **sotto la curva avversaria** |
| trasferta | **vera, rigori** | x+ | **x−** | — | **sotto la curva avversaria** |

**Il difetto c'è, e in gioco è sistematico**: 10 premiazioni su 10 a stadio girato, quelle forzate e le due vere dopo i
rigori, mettono la festa dei propri tifosi nella curva avversaria; le 2 a stadio dritto sono giuste. Nella premiazione di
squadra (scudetto e coppa: consegna → capitano → passaggio → sollevamento) l'eroe non corre sotto una curva, ma bandiere
e telefoni «della curva dei tuoi» stanno sotto quella degli altri. Nella promozione e nella cerimonia leggera anche la
corsa e il giro di campo ci vanno. Camera (cerimonie forzate): **avversaria 236 fotogrammi, propria 65**, tribuna 102.

Foto: `docs/collaudo-po/434-prima-trasferta-giro-di-campo.png`. L'eroe ospite (Salernum, in rosso) fa il giro di campo
sotto lo striscione «FORZA NERAZZURRI» dei padroni di casa, e le bandiere della festa sono sopra quella curva.

## Correzione

**src/12** (premiazione in `ThreeMatchView`, un'ancora): il segno della cerimonia `_cSgn` ora è
`segno di casa × _rot434`, dove `_rot434 = (P.half===2 && !__CPM_NO732) ? −1 : 1`. È la stessa espressione che fa girare
lo stadio (`_mir732`) e che usa `_own420` nell'esultanza. Tutta la cerimonia è scritta relativa a `_cSgn`: giro di campo,
curva, bandiere, telefoni, mister, palco e regia. Girandolo, la cerimonia si specchia intera e resta coerente con se
stessa. Rosso: `window.__CPM_NO_G434`.

La regola di `_own420` dice «verso i propri tifosi, oppure verso la panchina se stanno dietro l'altra porta». Il ramo
«panchina» qui non serve: nella premiazione l'eroe parte dal centro e la curva dei suoi è sempre raggiungibile. Si
applica sempre il primo ramo.

### Esito dopo (verde)

Tutte e 12 le premiazioni (10 forzate e 2 vere) hanno bandiere, telefoni e corsa dal lato dei tifosi dell'eroe: **0 sotto
la curva avversaria**, 0 errori di pagina. Camera (cerimonie forzate): **propria 241, avversaria 51**, tribuna 94.
I 51 fotogrammi «avversaria» residui cadono sullo stadio dritto e all'inizio della cerimonia, quando la camera guarda il
palco dal suo lato fisso. Sono misurati, non giudicati: vedi il dubbio 2.

Foto: `434-dopo-trasferta-giro-di-campo.png` mostra l'eroe sotto «CUORE SALERNUM». Ci sono anche le coppie prima/dopo di
casa e quelle dopo i rigori (`434-{prima,dopo}-{casa,trasferta}-{giro-di-campo,rigori}.png`).

## Guardiano

`npm run premiazione-434`, ~15-20 min: due bracci, 12 premiazioni ciascuno, di cui 4 serie di rigori vere. Si mette
nella riga MAPPA esistente di src/12 (`/src\/12-|src\/13-/`, in testa). `CPM_VERE=0` salta le premiazioni vere;
`CPM_SOLO_VERE=1` misura solo quelle.
- **Verde:** 0 non giudicate; almeno 3 giudicate per lato; almeno 2 a stadio girato; 0 sotto la curva avversaria;
  0 pageerror.
- **Rosso `__CPM_NO_G434`:** almeno 2 premiazioni sotto la curva avversaria (misurate: 10).

L'eroe sul banco cammina a pochi fotogrammi al secondo, quindi nella corsa vale «arrivato sotto la curva giusta
(|x| > 12)» oppure «in cammino verso di lei di almeno 3 u dentro il beat». La prima stesura giudicava solo l'arrivo e
bocciava come «avversaria» un eroe che andava nel verso giusto (x 20,4 → 3,1 con bersaglio −40).

## Guardiani eseguiti su questo ramo

| guardiano | esito |
|---|---|
| `premiazione-434` verde, forzate (CPM_VERE=0) | ✅ 10/10, 0 sotto la curva avversaria |
| `premiazione-434` rosso, forzate | ✅ rosso visibile, 8/8 a stadio girato |
| `premiazione-434` verde, solo vere (rigori) | ✅ 2/2 |
| `premiazione-434` rosso, solo vere (rigori) | ✅ rosso visibile, 2/2 |
| `esultanza-420` (verde + rosso) | ✅ |
| `trofeo-376` | ✅ |
| `cerimonie` | ✅ |
| `passaggio-coppa-137` | ✅ |
| `rigori-296` (parti A + B + C, rossi compresi) | ✅ (primo tentativo in parallelo con un altro guardiano: fuori tetto, non giudicato; rifatto da solo) |
| `test:logic` | ✅ 51/51 |
| `save-compat` | ✅ 12/12 |
| `mappa-unica` | ✅ |
| `check-src` | ✅ identico byte per byte |

## Dubbi per il PO

**1. La regola da usare nella premiazione.**
- **A (consigliata, applicata): verso i propri tifosi.** Si specchia l'intera cerimonia col segno vero dei tifosi
  (`casa × stadio girato`). Il palco resta al centro e la festa va sotto la curva dei suoi.
- B: rimettere lo stadio dritto all'inizio della premiazione. Si toglie la rotazione invece di seguirla, ma il pubblico
  «salta» di curva davanti alla camera al fischio finale.
- C: verso la panchina come nell'esultanza (ramo «tifosi dietro l'altra porta» di `_own420`). Qui non serve, perché la
  curva dei suoi è raggiungibile dal centro, e toglierebbe la festa coi tifosi che il PO aveva chiesto nel 7.278.

**2. Camera nella premiazione di squadra con lo stadio dritto.** Il caso si vede solo col gancio di collaudo, ma anche
prima del giro: in trasferta e a stadio dritto la camera guarda la curva avversaria in 10 fotogrammi su 28, all'inizio
della consegna.
- **A (consigliata, applicata): lasciarla.** In gioco la premiazione avviene sempre a stadio girato, dove ora la camera
  guarda i propri tifosi.
- B: far nascere la camera della consegna sempre dal lato dei propri tifosi.
- C: stacco iniziale sulla curva dei propri tifosi prima della consegna.

**3. Dove vive il guardiano.**
- **A (consigliata, applicata): nella riga MAPPA esistente di src/12**, dove vive la cerimonia.
- B: anche nella riga di src/15 (gancio `__CPM_TEMPO420` e `__CPM_FORCE_CEREMONY`, che il giro non tocca).
- C: solo nel treno notturno (`SOLO_NOTTE_329`), per il costo (~15-20 min). Lo sconsiglio: il difetto era visibile in
  ogni premiazione vera.

**4. Supplementari con cambio di campo.** Nel gioco i supplementari non cambiano campo: il tempo resta `clock>=45 ? 2 : 1`.
- **A (consigliata, applicata): nessuna modifica.** La regola segue lo stadio qualunque cosa decida il tempo.
- B: aggiungere il cambio di campo ai supplementari (tocca il 7.732, non è il tema di questo giro).
- C: chiedere una misura dedicata se il PO vede il cambio di campo ai supplementari come difetto.

## Cosa non ho eseguito

Il gate 14/14 (`validate-situations`), `partita-vera`, `career-critical`, `replay` e il guardiano completo `premiazione-434` in una corsa sola (bracci verde+rosso con le premiazioni vere, ~15-20 min) **non sono stati eseguiti in questa sessione**: li giudica il treno al push su `lavoro/**`. La modifica tocca solo il segno della cerimonia (fase `ceremony`) e un testimone sotto `cpmtest`; le due metà del guardiano (forzate e vere) sono state eseguite separatamente, entrambi i bracci.
