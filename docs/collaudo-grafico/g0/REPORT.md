# G0 — Griglia mobile: la misura di partenza

Build **?** · sonda `tests/visual/griglia-mobile.mjs` · seme `4242` · tema chiaro.

**Dichiarato:** e' **Chromium headless** alla taglia del telefono (la 412×915 e' quella del PO), **non un Android vero**.
Restano fuori dalla misura: il rendering dei font di sistema Android, il tocco, la GPU, le prestazioni, la barra di sistema e il ritaglio del notch.
Lo scatto e' la **prima schermata** (viewport), non la pagina intera: i numeri invece coprono **tutto il DOM**, anche sotto la piega.

## Come si leggono i numeri

- **overflow** — `documentElement.scrollWidth − clientWidth`, in px. `0` = la pagina non scorre in orizzontale.
- **fuori** — elementi il cui `getBoundingClientRect().right` supera la larghezza dello schermo, contati solo nella loro versione **piu' esterna** (un figlio che sporge perche' sporge il padre non e' un secondo difetto) e solo se **nessun antenato li ritaglia o li fa scorrere**. Quelli contenuti sono in una colonna a parte.
- **<10px** — nodi di testo **visibili** con `font-size` reso sotto i 10 px, sul totale dei nodi di testo visibili; fra parentesi il minimo trovato.
- **contrasto** — nodi sotto la soglia WCAG (4,5:1; 3:1 se il corpo e' ≥18 px o ≥14 px in grassetto) sul totale dei nodi **misurabili**. I nodi su fondo a gradiente/immagine sono **esclusi** e contati a parte: un rapporto letto su un fondo che cambia sotto la riga sarebbe inventato.

## Lo strumento e' tarato

`CPM_TARATURA=1 node tests/visual/griglia-mobile.mjs` fa girare la stessa misura su due paginette costruite a mano,
di cui si conosce la risposta esatta (un elemento che sporge di 88 px, uno che sporge ma e' contenuto da un antenato che scorre,
un testo a 8 px, una coppia a 4,48:1, una a 3,94:1, una su gradiente da escludere, un nodo nascosto da non contare,
e un velo a tutto schermo che deve far ignorare la pagina sotto): **13 controlli su 13**. Senza questa prova, uno zero qui sotto
potrebbe essere della sonda invece che del gioco.

Due dettagli di metodo che cambiano i numeri, e quindi vanno detti:

- **Impostazioni** e' un velo `position:fixed; inset:0` opaco sopra la Home. La misura riparte da quel velo, altrimenti
  conterebbe anche i nodi della Home che nessuno vede (nella prima stesura erano 60 nodi invece di 32).
- **Creazione** contiene la lista dei 200 club dei sogni dentro un riquadro alto 220 px: quei nodi sono **resi**, quindi contati.
  E' la ragione per cui quella schermata ha 841 nodi di testo contro i 176 del Cruscotto — il numero e' vero, non gonfiato da un errore.

> **Perche' le colonne 2-4 sono identiche fra le cinque larghezze.** Il testo non cambia numero di nodi
> quando va a capo, e nessuna `@media` di queste schermate cambia corpo o colore sotto i 640 px: cambia solo
> l'impaginazione. L'unica grandezza che *puo'* cambiare con la larghezza e' l'overflow (tabella 1-2).
> La tabella 0 serve appunto a provare che le cinque corse sono davvero cinque larghezze diverse.

### 0 · Larghezza del riquadro letta DALLA PAGINA (prova che le cinque corse sono cinque larghezze)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 360 | 375 | 390 | 412 | 430 |
| Impostazioni | 360 | 375 | 390 | 412 | 430 |
| Creazione | 360 | 375 | 390 | 412 | 430 |
| Offerte | 360 | 375 | 390 | 412 | 430 |
| Dashboard | 360 | 375 | 390 | 412 | 430 |
| Stagione · Classifica | 360 | 375 | 390 | 412 | 430 |
| Stagione · Calendario | 360 | 375 | 390 | 412 | 430 |
| Stagione · Coppe | 360 | 375 | 390 | 412 | 430 |
| Club | 360 | 375 | 390 | 412 | 430 |
| Carriera · Profilo | 360 | 375 | 390 | 412 | 430 |
| Carriera · Nazionale | 360 | 375 | 390 | 412 | 430 |
| Agente | 360 | 375 | 390 | 412 | 430 |
| Prepartita | 360 | 375 | 390 | 412 | 430 |
| Partita · HUD in gioco | 360 | 375 | 390 | 412 | 430 |
| Partita · HUD con la scelta | 360 | 375 | 390 | 412 | 430 |

### 1 · Overflow orizzontale (px di pagina che escono dallo schermo)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 | 0 | 0 | 0 | 0 |
| Impostazioni | 0 | 0 | 0 | 0 | 0 |
| Creazione | 0 | 0 | 0 | 0 | 0 |
| Offerte | 0 | 0 | 0 | 0 | 0 |
| Dashboard | 0 | 0 | 0 | 0 | 0 |
| Stagione · Classifica | 0 | 0 | 0 | 0 | 0 |
| Stagione · Calendario | 0 | 0 | 0 | 0 | 0 |
| Stagione · Coppe | 0 | 0 | 0 | 0 | 0 |
| Club | 0 | 0 | 0 | 0 | 0 |
| Carriera · Profilo | 0 | 0 | 0 | 0 | 0 |
| Carriera · Nazionale | 0 | 0 | 0 | 0 | 0 |
| Agente | 0 | 0 | 0 | 0 | 0 |
| Prepartita | 0 | 0 | 0 | 0 | 0 |
| Partita · HUD in gioco | 0 | 0 | 0 | 0 | 0 |
| Partita · HUD con la scelta | 0 | 0 | 0 | 0 | 0 |
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 2 · Elementi fuori dallo schermo a destra (fra parentesi: contenuti da un antenato che li ritaglia/fa scorrere)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Impostazioni | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Creazione | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Offerte | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Dashboard | 0 (1) | 0 (1) | 0 (1) | 0 (1) | 0 (1) |
| Stagione · Classifica | 0 (11) | 0 (11) | 0 (10) | 0 (10) | 0 (10) |
| Stagione · Calendario | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Coppe | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Club | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Profilo | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Nazionale | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Agente | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Prepartita | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Partita · HUD in gioco | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Partita · HUD con la scelta | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 3 · Testo reso sotto i 10 px — sotto/totale (minimo)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/28 (11) | 0/28 (11) | 0/28 (11) | 0/28 (11) | 0/28 (11) |
| Impostazioni | 0/29 (11) | 0/29 (11) | 0/29 (11) | 0/29 (11) | 0/29 (11) |
| Creazione | 0/589 (11) | 0/589 (11) | 0/589 (11) | 0/589 (11) | 0/589 (11) |
| Offerte | 0/40 (11) | 0/40 (11) | 0/40 (11) | 0/40 (11) | 0/40 (11) |
| Dashboard | 0/118 (11) | 0/118 (11) | 0/118 (11) | 0/118 (11) | 0/118 (11) |
| Stagione · Classifica | 0/333 (11) | 0/333 (11) | 0/333 (11) | 0/334 (11) | 0/334 (11) |
| Stagione · Calendario | 0/308 (11) | 0/308 (11) | 0/308 (11) | 0/308 (11) | 0/308 (11) |
| Stagione · Coppe | 0/42 (11) | 0/42 (11) | 0/42 (11) | 0/42 (11) | 0/42 (11) |
| Club | 0/185 (11) | 0/185 (11) | 0/185 (11) | 0/185 (11) | 0/185 (11) |
| Carriera · Profilo | 0/129 (11) | 0/129 (11) | 0/129 (11) | 0/129 (11) | 0/129 (11) |
| Carriera · Nazionale | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) |
| Agente | 0/118 (11) | 0/118 (11) | 0/118 (11) | 0/118 (11) | 0/118 (11) |
| Prepartita | 0/33 (11) | 0/33 (11) | 0/33 (11) | 0/33 (11) | 0/33 (11) |
| Partita · HUD in gioco | 0/47 (11) | 0/25 (11) | 0/47 (11) | 0/18 (11) | 0/47 (11) |
| Partita · HUD con la scelta | 0/56 (11) | 0/56 (11) | 0/36 (11) | 0/56 (11) | 0/56 (11) |
| **TOTALE** | **0/2163** | **0/2141** | **0/2143** | **0/2135** | **0/2164** |

### 3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/28 | 0/28 | 0/28 | 0/28 | 0/28 |
| Impostazioni | 0/29 | 0/29 | 0/29 | 0/29 | 0/29 |
| Creazione | 0/589 | 0/589 | 0/589 | 0/589 | 0/589 |
| Offerte | 0/40 | 0/40 | 0/40 | 0/40 | 0/40 |
| Dashboard | 0/118 | 0/118 | 0/118 | 0/118 | 0/118 |
| Stagione · Classifica | 0/333 | 0/333 | 0/333 | 0/334 | 0/334 |
| Stagione · Calendario | 0/308 | 0/308 | 0/308 | 0/308 | 0/308 |
| Stagione · Coppe | 0/42 | 0/42 | 0/42 | 0/42 | 0/42 |
| Club | 0/185 | 0/185 | 0/185 | 0/185 | 0/185 |
| Carriera · Profilo | 0/129 | 0/129 | 0/129 | 0/129 | 0/129 |
| Carriera · Nazionale | 0/108 | 0/108 | 0/108 | 0/108 | 0/108 |
| Agente | 0/118 | 0/118 | 0/118 | 0/118 | 0/118 |
| Prepartita | 0/33 | 0/33 | 0/33 | 0/33 | 0/33 |
| Partita · HUD in gioco | 0/47 | 0/25 | 0/47 | 0/18 | 0/47 |
| Partita · HUD con la scelta | 0/56 | 0/56 | 0/36 | 0/56 | 0/56 |
| **TOTALE** | **0/2163** | **0/2141** | **0/2143** | **0/2135** | **0/2164** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) |
| Impostazioni | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) |
| Creazione | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) |
| Offerte | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) |
| Dashboard | 0/91 (14 · 16) | 0/91 (14 · 16) | 0/91 (14 · 16) | 0/91 (14 · 16) | 0/91 (14 · 16) |
| Stagione · Classifica | 0/323 (9 · 19) | 0/323 (9 · 19) | 0/323 (9 · 19) | 0/324 (9 · 19) | 0/324 (9 · 19) |
| Stagione · Calendario | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) |
| Stagione · Coppe | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) |
| Club | 0/126 (25 · 35) | 0/126 (25 · 35) | 0/126 (25 · 35) | 0/126 (25 · 35) | 0/126 (25 · 35) |
| Carriera · Profilo | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) |
| Carriera · Nazionale | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) |
| Agente | 0/94 (6 · 18) | 0/94 (6 · 18) | 0/94 (6 · 18) | 0/94 (6 · 18) | 0/94 (6 · 18) |
| Prepartita | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) |
| Partita · HUD in gioco | 0/24 (10 · 15) | 0/5 (15 · 7) | 0/24 (10 · 15) | 0/5 (9 · 6) | 0/24 (10 · 15) |
| Partita · HUD con la scelta | 0/24 (19 · 15) | 0/24 (19 · 15) | 0/5 (26 · 7) | 0/24 (19 · 15) | 0/24 (19 · 15) |
| **TOTALE** | **0/1998** | **0/1979** | **0/1979** | **0/1980** | **0/1999** |

### 5 · Bottoni pieni di marca (una sola azione primaria per vista)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 | 0 | 0 | 0 | 0 |
| Impostazioni | 0 | 0 | 0 | 0 | 0 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 1 | 1 | 1 | 1 | 1 |
| Dashboard | 1 | 1 | 1 | 1 | 1 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 0 | 0 | 0 | 0 | 0 |
| Stagione · Coppe | 0 | 0 | 0 | 0 | 0 |
| Club | 0 | 0 | 0 | 0 | 0 |
| Carriera · Profilo | 0 | 0 | 0 | 0 | 0 |
| Carriera · Nazionale | 0 | 0 | 0 | 0 | 0 |
| Agente | 0 | 0 | 0 | 0 | 0 |
| Prepartita | 1 | 1 | 1 | 1 | 1 |
| Partita · HUD in gioco | 0 | 1 | 0 | 0 | 0 |
| Partita · HUD con la scelta | 0 | 0 | 1 | 0 | 0 |
| **TOTALE** | **5** | **6** | **6** | **5** | **5** |

### 5-bis · QUANTO E' LUNGA — altezza dello scorritore in px (fra parentesi: schermate da 915 px del PO)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 800 (0.87) | 696 (0.76) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Impostazioni | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Creazione | 1724 (1.88) | 1724 (1.88) | 1724 (1.88) | 1724 (1.88) | 1696 (1.85) |
| Offerte | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Dashboard | 1460 (1.6) | 1460 (1.6) | 1460 (1.6) | 1460 (1.6) | 1460 (1.6) |
| Stagione · Classifica | 1751 (1.91) | 1751 (1.91) | 1751 (1.91) | 1751 (1.91) | 1751 (1.91) |
| Stagione · Calendario | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) |
| Stagione · Coppe | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Club | 1703 (1.86) | 1690 (1.85) | 1690 (1.85) | 1677 (1.83) | 1665 (1.82) |
| Carriera · Profilo | 2083 (2.28) | 2068 (2.26) | 2068 (2.26) | 2022 (2.21) | 2022 (2.21) |
| Carriera · Nazionale | 1152 (1.26) | 1139 (1.24) | 1139 (1.24) | 1139 (1.24) | 1139 (1.24) |
| Agente | 1624 (1.77) | 1572 (1.72) | 1554 (1.7) | 1554 (1.7) | 1554 (1.7) |
| Prepartita | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Partita · HUD in gioco | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Partita · HUD con la scelta | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |

> Lo scorritore misurato a 412 px, schermata per schermata: Home fuori carriera `documento` · Impostazioni `documento` · Creazione `div#root>div.cpm-root>div.cpm-scroll` · Offerte `documento` · Dashboard `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Classifica `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Calendario `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Coppe `documento` · Club `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Profilo `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Nazionale `div#root>div.cpm-root>div.cpm-scroll` · Agente `div#root>div.cpm-root>div.cpm-scroll` · Prepartita `documento` · Partita · HUD in gioco `documento` · Partita · HUD con la scelta `documento`

### 6 · Censimento del reso — TINTE DI TESTO diverse

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 9 | 9 | 9 | 9 | 9 |
| Offerte | 6 | 6 | 6 | 6 | 6 |
| Dashboard | 10 | 10 | 10 | 10 | 10 |
| Stagione · Classifica | 9 | 9 | 9 | 9 | 9 |
| Stagione · Calendario | 10 | 10 | 10 | 10 | 10 |
| Stagione · Coppe | 6 | 6 | 6 | 6 | 6 |
| Club | 10 | 10 | 10 | 10 | 10 |
| Carriera · Profilo | 9 | 9 | 9 | 9 | 9 |
| Carriera · Nazionale | 9 | 9 | 9 | 9 | 9 |
| Agente | 9 | 9 | 9 | 9 | 9 |
| Prepartita | 6 | 6 | 6 | 6 | 6 |
| Partita · HUD in gioco | 9 | 3 | 9 | 3 | 9 |
| Partita · HUD con la scelta | 9 | 9 | 3 | 9 | 9 |

### 7 · Censimento del reso — FONDI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 4 | 4 | 4 | 4 | 4 |
| Dashboard | 7 | 7 | 7 | 7 | 7 |
| Stagione · Classifica | 8 | 8 | 8 | 8 | 8 |
| Stagione · Calendario | 9 | 9 | 9 | 9 | 9 |
| Stagione · Coppe | 3 | 3 | 3 | 3 | 3 |
| Club | 4 | 4 | 4 | 4 | 4 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 5 | 5 | 5 | 5 | 5 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |
| Partita · HUD in gioco | 4 | 3 | 4 | 3 | 4 |
| Partita · HUD con la scelta | 4 | 4 | 3 | 4 | 4 |

### 8 · Censimento del reso — CORPI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 3 | 3 | 3 | 3 | 3 |
| Offerte | 3 | 3 | 3 | 3 | 3 |
| Dashboard | 7 | 7 | 7 | 7 | 7 |
| Stagione · Classifica | 6 | 6 | 6 | 6 | 6 |
| Stagione · Calendario | 7 | 7 | 7 | 7 | 7 |
| Stagione · Coppe | 6 | 6 | 6 | 6 | 6 |
| Club | 7 | 7 | 7 | 7 | 7 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 7 | 7 | 7 | 7 | 7 |
| Agente | 8 | 8 | 8 | 8 | 8 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |
| Partita · HUD in gioco | 2 | 2 | 2 | 3 | 2 |
| Partita · HUD con la scelta | 2 | 2 | 2 | 2 | 2 |

### 9 · Censimento del reso — RAGGI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 4 | 4 | 4 | 4 | 4 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 3 | 3 | 3 | 3 | 3 |
| Offerte | 2 | 2 | 2 | 2 | 2 |
| Dashboard | 3 | 3 | 3 | 3 | 3 |
| Stagione · Classifica | 3 | 3 | 3 | 3 | 3 |
| Stagione · Calendario | 3 | 3 | 3 | 3 | 3 |
| Stagione · Coppe | 3 | 3 | 3 | 3 | 3 |
| Club | 5 | 5 | 5 | 5 | 5 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 3 | 3 | 3 | 3 | 3 |
| Agente | 3 | 3 | 3 | 3 | 3 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |
| Partita · HUD in gioco | 5 | 4 | 5 | 3 | 5 |
| Partita · HUD con la scelta | 6 | 6 | 6 | 6 | 6 |

> **Metro di paragone.** Il provino della direzione (`docs/collaudo-grafico/proposta-schermate/`,
> misurato da `tests/visual/provino-schermate.mjs`) rende, su tutte e tre le schermate:
> **5 tinte di testo · 6 corpi (11 · 12,5 · 14 · 16 · 19 · 26) · 3 raggi (3 · 6 · 50%)**, identici fra loro.
> La coerenza fra schermate chiesta dal PO li' e' un fatto misurato, non una dichiarazione.

## Dettaglio · gli elementi che sporgono (i 5 peggiori per schermata, alla larghezza in cui sporgono di piu')

| schermata | larghezza | selettore | px fuori | testo |
|---|---:|---|---:|---|
| — | — | nessun elemento esce dallo schermo a nessuna delle larghezze misurate | — | — |

## Dettaglio · il contenuto che sporge ma e' CONTENUTO (si legge solo scorrendo in orizzontale dentro il riquadro)

Non e' overflow di pagina — la pagina non si sposta — ma e' contenuto che sullo schermo del telefono **non si vede tutto in una volta**.

| schermata | larghezza | selettore | px oltre il bordo | testo |
|---|---:|---|---:|---|
| Dashboard | 360 | `div.cpm-scroll>div.cpm-career>div:nth-child(2)` | 6.7 | ⚡ Vivi la Settimanaallenamento, ev |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 1123 | Liga Ibérica 2 |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 1016.2 | Ligue Nationale 2 |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 888 | Deutsche Liga 2 |

### 9-quater · SUPERFICI SCURE in un gioco a tema unico CHIARO (riquadri larghi mezzo schermo, alti >= 40 px, luminanza < 0,25)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 0 | 0 | 0 | 0 | 0 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 0 | 0 | 0 | 0 | 0 |
| Dashboard | 6 | 6 | 6 | 6 | 6 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 1 | 1 | 1 | 1 | 1 |
| Stagione · Coppe | 1 | 1 | 1 | 1 | 1 |
| Club | 2 | 2 | 2 | 2 | 2 |
| Carriera · Profilo | 5 | 5 | 5 | 5 | 5 |
| Carriera · Nazionale | 1 | 1 | 1 | 1 | 1 |
| Agente | 1 | 1 | 1 | 1 | 1 |
| Prepartita | 1 | 1 | 1 | 1 | 1 |
| Partita · HUD in gioco | 1 | 1 | 1 | 1 | 1 |
| Partita · HUD con la scelta | 1 | 1 | 1 | 1 | 1 |
| **TOTALE** | **23** | **23** | **23** | **23** | **23** |

> [22/09] Il PO ha segnalato in pochi minuti sette schermate come «disomogenee» o «fuori standard».
> Non sono sette difetti: sono superfici rimaste SCURE quando il tema scuro e' stato ritirato (7.947).
> Qui si contano e si nominano, cosi' la famiglia si chiude con una misura invece che un rilievo per volta.

| schermata | alt. px | luminanza | fondo | selettore | testo |
|---|---:|---:|---|---|---|
| Home fuori carriera | 258 | 0.095 | `#a3263a` | `div.cpm-scroll>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteFootball Career Simula |
| Creazione | 52 | 0.07 | `#8e1f33` | `div.cpm-create>div:nth-child(2)>button.cpm-focus` | ⚡ INIZIA I PROVINI |
| Dashboard | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
|  | 62 | 0.07 | `#8e1f33` | `div.cpm-career>div:nth-child(2)>button.cpm-press` | ⚡ Vivi la Settimanaallenamento, ev |
|  | 58 | 0.017 | `#14243a` | `div.cpm-scroll>div.cpm-career>div:nth-child(5)` | Il tuo procuratore› |
|  | 67 | 0.012 | `#241a12` | `div.cpm-scroll>div.cpm-career>div:nth-child(7)` | Adesso guardano teNEL PIENO› |
|  | 67 | 0.016 | `#0f2430` | `div.cpm-scroll>div.cpm-career>div:nth-child(8)` | Il mondo fuori› |
|  | 53 | 0.011 | `#1b1730` | `div.cpm-scroll>div.cpm-career>div:nth-child(9)` | 🌱 Il ragazzo della Primavera1/4› |
| Stagione · Classifica | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
| Stagione · Calendario | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
| Stagione · Coppe | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
| Club | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
|  | 207 | 0.016 | `#112240` | `div.cpm-career>div:nth-child(2)>div:nth-child(10)` | Lo Spogliatoio🧠Gabriele PirasIl M |
| Carriera · Profilo | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
|  | 53 | 0.014 | `#1a1f2e` | `div.cpm-career>div:nth-child(3)>div:nth-child(1)` | Biografia› |
|  | 69 | 0.042 | `#312e81` | `div.cpm-career>div:nth-child(3)>div:nth-child(6)` | 🆚 Il tuo rivale› |
|  | 62 | 0.022 | `#1e293b` | `div.cpm-career>div:nth-child(3)>div:nth-child(7)` | ⭐ Club dei sogni› |
|  | 58 | 0.022 | `#1e293b` | `div.cpm-career>div:nth-child(3)>div:nth-child(10)` | 💪 Stile di gioco› |
| Carriera · Nazionale | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
| Agente | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 18:52Italia ·  |
| Prepartita | 45 | 0.07 | `#8e1f33` | `div:nth-child(1)>div:nth-child(6)>button.cpm-press.cpm-focus` | 📋 Formazioni → |
| Partita · HUD in gioco | 915 | 0.002 | `#050810` | `div#root>div.cpm-root>div.cpm-scroll` | 🎯 PROVINO 1/3@keyframes cpmSwapCa |
| Partita · HUD con la scelta | 915 | 0.002 | `#050810` | `div#root>div.cpm-root>div.cpm-scroll` | 🎯 PROVINO 1/3@keyframes cpmSwapCa |

### 9-ter · ALTEZZA delle strisce di fondo — voce di menu' / sostieni / idee (px)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 |
| Impostazioni | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 |
| Creazione | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Offerte | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Dashboard | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Stagione · Classifica | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Stagione · Calendario | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Stagione · Coppe | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Club | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Carriera · Profilo | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Carriera · Nazionale | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Agente | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 | 49 / 26 / 25 |
| Prepartita | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Partita · HUD in gioco | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Partita · HUD con la scelta | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |

> La voce di menu' e' un bersaglio per il dito: la soglia consigliata per il tocco e' **44 px**.
> Le due strisce di servizio sono un invito, non un comando, e possono stare piu' basse.

### 9-bis · EMOJI rese (il provino approvato dal PO non ne ha nessuna)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 9 | 9 | 9 | 9 | 9 |
| Impostazioni | 12 | 12 | 12 | 12 | 12 |
| Creazione | 14 | 14 | 14 | 14 | 14 |
| Offerte | 7 | 7 | 7 | 7 | 7 |
| Dashboard | 10 | 10 | 10 | 10 | 10 |
| Stagione · Classifica | 15 | 15 | 15 | 15 | 15 |
| Stagione · Calendario | 58 | 58 | 58 | 58 | 58 |
| Stagione · Coppe | 7 | 7 | 7 | 7 | 7 |
| Club | 22 | 22 | 22 | 22 | 22 |
| Carriera · Profilo | 21 | 21 | 21 | 21 | 21 |
| Carriera · Nazionale | 12 | 12 | 12 | 12 | 12 |
| Agente | 16 | 16 | 16 | 16 | 16 |
| Prepartita | 9 | 9 | 9 | 9 | 9 |
| Partita · HUD in gioco | 12 | 8 | 10 | 6 | 12 |
| Partita · HUD con la scelta | 12 | 12 | 11 | 14 | 12 |
| **TOTALE** | **236** | **232** | **233** | **232** | **236** |

> Contati i CARATTERI emoji sul testo reso. Il provino (`docs/collaudo-grafico/proposta-schermate/`)
> non ne usa **nessuna**: i cappelli sono etichetta maiuscoletta + filo + azione, la barra in basso
> e' solo testo. Questo numero e' la distanza fra il gioco e la direzione approvata.

| schermata | primi testi con emoji |
|---|---|
| Home fuori carriera | `Si scende in campo! ⚽` · `⚽` · `⚡ Nuova carriera` · `🎬 Revisione azioni (sviluppo)` · `🏠` · `🎬` |
| Impostazioni | `⚙️ Impostazioni` · `🎨 Grafica` · `🎧 Audio` · `🔇 Muto totale` · `🎵 Musica menu` · `🏟️ Audio partite` |
| Creazione | `Si scende in campo! ⚽` · `👤 Identità` · `🎯 Stile & percorso` · `📋 Percorso carriera` · `💪` · `🪄` |
| Offerte | `Si scende in campo! ⚽` · `⚽` · `🎯` · `⭐ TOP` |
| Dashboard | `Si scende in campo! ⚽` · `⚽` · `⚡ Vivi la Settimana` · `🌱 Il ragazzo della Primavera` · `🔥` · `🏟️ Partita di Questa Settiman` |
| Stagione · Classifica | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `★` |
| Stagione · Calendario | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `▶` |
| Stagione · Coppe | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `☕ Sostieni lo sviluppo di` |
| Club | `Si scende in campo! ⚽` · `⚽` · `⭐⭐⭐` · `🏛️` · `🧣` · `🩺 Dr.` |
| Carriera · Profilo | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `🆚 Il tuo rivale` · `⭐ Club dei sogni` |
| Carriera · Nazionale | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `📊` · `🏆` |
| Agente | `Si scende in campo! ⚽` · `⚽` · `🤵 Agente · −` · `🏋️` · `🥗` · `✂️ Rescindi (stop 10%)` |
| Prepartita | `Si scende in campo! ⚽` · `⚽` · `· Giornata 10 di 34 ⚠︎ ?g` · `🎭` · `🌧️ Pioggia` · `🎙️ ANALISI DEL MISTER — COME ` |
| Partita · HUD in gioco | `Si scende in campo! ⚽` · `🎯 PROVINO` · `☀️` · `⏸` · `⚠️` · `⏳` |
| Partita · HUD con la scelta | `Si scende in campo! ⚽` · `🎯 PROVINO` · `☀️` · `⏸` · `⚠️` · `⚽` |

## Ridondanze · la stessa grandezza, quante volte e dove (412 px, fisarmoniche come le trova il giocatore)

> [21/09 · richiesta PO] Si contano le ETICHETTE, non i numeri: un «14» si ripete per caso, un
> «Assist» no. Due letture con rimedi opposti: **nella colonna** una grandezza ripetuta dentro la
> stessa schermata (da togliere); **nella riga** la stessa grandezza in molte schermate — che non e'
> per forza un difetto (lo stipendio sta bene in Contratto e dall'Agente), ma sopra le quattro
> schermate o e' un cruscotto voluto o e' rumore. Nessuna soglia: e' un censimento.
>
> **LIMITE DICHIARATO, e cambia la lettura**: le otto schermate di carriera condividono la TESTATA
> dell'eroe (OVR, forma, morale, fatica). Una grandezza che risulta su **8 schermate** e' quasi
> sempre quella — cioe' un cruscotto VOLUTO, non una ridondanza. Finche' lo strumento non separa
> testata e corpo, la riga da 8 non accusa nessuno: si legge la COLONNA.

| etichetta | Home fuori carriera | Impostazioni | Creazione | Offerte | Dashboard | Classifica | Calendario | Coppe | Club | Profilo | Nazionale | Agente | Prepartita | Partita · HUD in gioco | Partita · HUD con la scelta | schermate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Stagione |  |  |  |  | 2 | 1 | 2 | 1 | 3 | 1 | 5 | 2 |  |  |  | **8** |
| Forma |  |  |  |  | 3 | 1 | 1 | 1 | 3 | 1 | 1 | 1 |  |  |  | **8** |
| OVR |  |  |  |  | 1 | 1 | 1 | 1 | 1 | 2 | 3 | 1 |  |  |  | **8** |
| Fatica |  |  |  |  | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 2 |  |  |  | **8** |
| Morale |  |  |  |  | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 1 |  |  |  | **8** |
| Gol |  |  | 1 | 1 | 2 |  |  |  |  | 3 | 2 |  |  |  | 2 | **6** |
| Partite |  | 1 |  |  | 2 |  | 2 |  |  | 1 | 1 |  |  |  |  | **5** |
| Settimana |  |  |  |  | 4 |  |  |  |  |  | 4 | 3 |  |  |  | **3** |
| Assist |  |  | 1 |  | 2 |  |  |  |  | 3 |  |  |  |  |  | **3** |
| Contratto |  |  |  |  |  |  |  |  | 2 | 1 |  | 2 |  |  |  | **3** |
| Fiducia |  |  |  |  | 1 |  |  |  |  | 1 |  | 2 |  |  |  | **3** |
| Presenze |  |  |  |  |  |  |  |  |  | 1 | 1 |  |  |  |  | **2** |
| Valore |  |  |  |  |  |  |  |  |  | 1 |  | 1 |  |  |  | **2** |
| Stipendio |  |  |  |  |  |  |  |  |  |  |  | 3 |  |  |  | **1** |
| Trofei |  |  |  |  |  |  |  |  |  | 1 |  |  |  |  |  | **1** |

## Dettaglio · DOVE STANNO I PIXEL nelle schermate lunghe (a 412 px)

> [21/09 · rilievo PO «il tab carriera e' lunghissimo»] Sapere che una schermata e' lunga non dice
> quale pezzo la allunga. Qui i blocchi di primo livello dello scorritore, dal piu' alto, con la
> quota sul totale e il testo che portano. Solo sopra le due schermate: sotto non c'e' niente da accorciare.

| schermata | blocco | px | quota | testo |
|---|---:|---:|---:|---|
| Carriera · Profilo (2022 px) | 1 | 314 | 15.5 % | Attributivelocità82tecnica81fisico80mental |
|  | 2 | 176 | 8.7 % | StatisticheGol stag.14Assist stag.6Partite |
|  | 3 | 104 | 5.1 % | Timeline StagioniS.3🥇 Coppa Nazionale🌍 C |
|  | 4 | 90 | 4.4 % | 🎬 Rivedi l'intro📁 Esporta salvataggio JS |
|  | 5 | 69 | 3.4 % | 🆚 Il tuo rivale› |
|  | 6 | 68 | 3.4 % | TitolareProssimo gradino — Leader: la fasc |
|  | 7 | 67 | 3.3 % | Record & Premi Personali⚽ 22 gol/stag.🎯 9 |
|  | 8 | 67 | 3.3 % | 🐞Strumenti di collaudoIl tasto ⚠️ accanto |
|  | 9 | 62 | 3.1 % | ⭐ Club dei sogni› |
|  | 10 | 58 | 2.9 % | 💪 Stile di gioco› |
|  | 11 | 55 | 2.7 % | Calciatore professionistaStagioni da pro:  |
|  | 12 | 53 | 2.6 % | Biografia› |

## 9-quinquies · I CARATTERI RESI (a 412 px, la taglia del PO)

> [G9 · 22/09, collaudo PO «la schermata iniziale e' rimasta completamente fuori standard»] Il provino
> approvato ha UN carattere vero, **Barlow** (+ **Barlow Condensed** per i numerali incolonnati). Una
> schermata che ne rende altri e' fuori standard per costruzione — e finora nessun numero lo diceva:
> si guardava il contrasto, il corpo, il raggio, mai la FAMIGLIA. Qui c'e' la prima famiglia della
> `font-family` calcolata, cioe' quella che il browser usa davvero, con quanti nodi la portano.

| schermata | famiglie | dettaglio (famiglia x nodi) |
|---|---:|---|
| Home fuori carriera | 1 | Barlow x4 |
| Impostazioni | 1 | Barlow x20 |
| Creazione | 1 | Barlow x819 |
| Offerte | 1 | Barlow x29 |
| Dashboard | 1 | Barlow x91 |
| Stagione · Classifica | 1 | Barlow x324 |
| Stagione · Calendario | 1 | Barlow x239 |
| Stagione · Coppe | 1 | Barlow x26 |
| Club | 1 | Barlow x126 |
| Carriera · Profilo | 1 | Barlow x89 |
| Carriera · Nazionale | 1 | Barlow x73 |
| Agente | 1 | Barlow x94 |
| Prepartita | 1 | Barlow x17 |
| Partita · HUD in gioco | 1 | Barlow x5 |
| Partita · HUD con la scelta | 1 | Barlow x24 |

## 9-octies · I CORPI, UNO PER UNO, COL NODO CHE LI PORTA (a 412 px)

> [G13 · 22/09] Stessa lezione delle tinte e del pavimento (G8.8): un elenco di numeri non fa
> trovare il nodo. Qui ogni corpo reso, con quanti nodi lo portano e un esempio — cosi' un corpo
> fuori scala si va a prendere invece di cercarlo a mano nel sorgente.

| schermata | corpi | dettaglio (px x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 2 | **12** x1 (Crea il tuo ) · **13** x3 (⚡ Nuova carr) |
| Impostazioni | 3 | **11** x12 (🎨 Grafica) · **12** x7 (🎵 Musica me) · **15** x1 (⚙️ Impostazi) |
| Creazione | 3 | **11** x313 (👤 Identità) · **12** x253 (📋 Percorso ) · **15** x1 (⚡ INIZIA I P) |
| Offerte | 3 | **11** x17 (Riepilogo pr) · **12** x6 (2) · **13** x3 (Scegli →) |
| Dashboard | 7 | **11** x50 (Elite) · **12** x12 (Lega B) · **13** x11 (K) · **17** x3 (78) · **20** x4 (Grafica Prob) · **24** x4 (82) · **32** x4 (12) |
| Stagione · Classifica | 6 | **11** x106 (Elite) · **12** x160 (TAT) · **13** x35 (K) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Stagione · Calendario | 7 | **11** x155 (Elite) · **12** x37 (vs) · **13** x4 (K) · **15** x30 (2) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Stagione · Coppe | 6 | **11** x15 (Elite) · **12** x1 (☕ Sostieni l) · **13** x5 (K) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Club | 7 | **11** x100 (Elite) · **12** x4 (50) · **13** x12 (K) · **15** x3 (FC Salernum) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x2 (82) |
| Carriera · Profilo | 6 | **11** x72 (Elite) · **12** x2 (Strumenti di) · **13** x4 (K) · **17** x9 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Carriera · Nazionale | 7 | **11** x51 (Elite) · **12** x10 (Grafica Prob) · **13** x5 (K) · **15** x2 (82) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Agente | 8 | **11** x68 (Elite) · **12** x4 («Guarda,) · **13** x15 (K) · **15** x1 (45.0M) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) · **32** x1 (4.56M€) |
| Prepartita | 3 | **11** x11 (Fantasioso) · **12** x5 (Stadio Saler) · **13** x1 (📋 Formazion) |
| Partita · HUD in gioco | 3 | **11** x3 (🎯 PROVINO) · **12** x1 (💥 Collo pie) · **13** x1 (12 fps · cor) |
| Partita · HUD con la scelta | 2 | **11** x16 (🎯 PROVINO) · **12** x8 (53%) |

## 9-septies · LE TINTE DEL TESTO, UNA PER UNA (a 412 px, la taglia del PO)

> [G14 · 22/09] Il conteggio dice che la Dashboard rende quattordici tinte contro le cinque del
> provino, ma non dice QUALI — e la differenza e' tutta li': una tinta **semantica** (vittoria,
> sconfitta, allarme) e' un'informazione e deve restare; un grigio nato per sbaglio e' debito.
> Qui ogni tinta col numero di nodi e un esempio, in ordine di diffusione.

| schermata | tinte | dettaglio (tinta x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 1 | `#526279` x4 (⚡ Nuova carrie) |
| Impostazioni | 3 | `#1e293b` x9 (⚙️ Impostazion) · `#596a80` x9 (30) · `#526279` x2 (🎨 Grafica) |
| Creazione | 9 | `#596a80` x263 (👤 Identità) · `#000000` x260 (CFM) · `#1e293b` x259 (CF Madrid) · `#526279` x16 (Aspetto calcia) · `#a34a08` x8 (🏆 Scalatore N) · `#166534` x6 (tiro) · `#b91c1c` x4 (velocità) · `#8e1f33` x2 (📋 Percorso ca) · `#ffffff` x1 (⚡ INIZIA I PRO) |
| Offerte | 6 | `#526279` x9 (Scegli →) · `#1e293b` x9 (TAT) · `#596a80` x6 (Provino) · `#92400e` x3 (7.4) · `#8e1f33` x1 (⭐ TOP) · `#ffffff` x1 (Scegli →) |
| Dashboard | 10 | `#1e293b` x20 (12) · `#526279` x19 (Lega B) · `#ffffff` x16 (82) · `#596a80` x13 (Forma) · `#8e1f33` x9 (78) · `#166534` x5 (14) · `#b91c1c` x3 (P) · `#6c1f2e` x2 (Salva) · `#92400e` x2 (7.2) · `#7c3aed` x2 (6) |
| Stagione · Classifica | 9 | `#526279` x116 (0) · `#1e293b` x97 (TAT) · `#596a80` x50 (Forma) · `#166534` x19 (0) · `#b91c1c` x18 (0) · `#ffffff` x13 (82) · `#8e1f33` x7 (K) · `#6c1f2e` x2 (Salva) · `#0f172a` x2 (1) |
| Stagione · Calendario | 10 | `#526279` x70 (Prossime parti) · `#1e293b` x66 (PIS) · `#596a80` x39 (Forma) · `#ffffff` x21 (82) · `#b91c1c` x12 (2) · `#92400e` x10 (7.2) · `#166534` x10 (1) · `#8e1f33` x8 (K) · `#6c1f2e` x2 (Salva) · `#0f172a` x1 (Gioca →) |
| Stagione · Coppe | 6 | `#ffffff` x11 (82) · `#1e293b` x5 (78) · `#8e1f33` x4 (K) · `#596a80` x3 (Forma) · `#6c1f2e` x2 (Salva) · `#526279` x1 (Coppa Nazional) |
| Club | 10 | `#596a80` x50 (Forma) · `#526279` x26 (Lega B) · `#1e293b` x21 (SAL) · `#ffffff` x11 (82) · `#8e1f33` x8 (38k) · `#92400e` x3 (52) · `#166534` x3 (2.7M€) · `#6c1f2e` x2 (Salva) · `#1e40af` x1 (50) · `#7c3aed` x1 (50) |
| Carriera · Profilo | 9 | `#596a80` x16 (Forma) · `#1e293b` x16 (78) · `#526279` x16 (Record & Premi) · `#166534` x12 (45M€) · `#ffffff` x11 (82) · `#92400e` x7 (14) · `#8e1f33` x6 (6) · `#1e40af` x3 (12) · `#6c1f2e` x2 (Salva) |
| Carriera · Nazionale | 9 | `#596a80` x19 (Forma) · `#526279` x18 (La maglia nume) · `#ffffff` x12 (82) · `#1e293b` x12 (78) · `#8e1f33` x4 (K) · `#6c1f2e` x2 (Salva) · `#92400e` x2 (1) · `#003399` x2 (Grafica Probe) · `#166534` x2 (82) |
| Agente | 9 | `#526279` x36 (Patrimonio) · `#1e293b` x18 (4.56M€) · `#ffffff` x11 (82) · `#8e1f33` x10 (45.0M) · `#b91c1c` x7 (S.) · `#596a80` x5 (Forma) · `#7c3aed` x3 (🤵 Agente · −) · `#6c1f2e` x2 (Salva) · `#166534` x2 (€4.9M) |
| Prepartita | 6 | `#1e293b` x6 (Stadio Salernu) · `#596a80` x4 (Stadio) · `#526279` x3 (🔍 Analisi com) · `#166534` x2 (Dribbling nell) · `#8e1f33` x1 (🎙️ ANALISI DE) · `#ffffff` x1 (📋 Formazioni ) |
| Partita · HUD in gioco | 3 | `#8e1f33` x3 (🎯 PROVINO) · `#fbbf24` x1 (12 fps · corpi) · `#ffffff` x1 (💥 Collo pieno) |
| Partita · HUD con la scelta | 9 | `#e8eef7` x9 (53%) · `#cbd5e1` x5 (possesso) · `#8e1f33` x3 (🎯 PROVINO) · `#4ade80` x2 (1) · `#e4d1d2` x1 (GRA) · `#c7dd87` x1 (POL) · `#60a5fa` x1 (0) · `#f87171` x1 (6.2) · `#94a3b8` x1 (Trequarti) |

## 9-sexies · LO SPAZIO DELLE FIGURINE (a 412 px, la taglia del PO)

> [G12 · 22/09, direttiva PO «predisponi lo spazio dei volti rettangolari in verticale, stile
> panini»] Il riquadro del volto ha un contratto: **rapporto 5:7 verticale**. Qui, schermata per
> schermata, quante figurine ci sono e qual e' lo **scarto peggiore** dal rapporto dichiarato.
> Finche' l'arte non arriva il riquadro mostra il ripiego, ma lo SPAZIO e' gia' quello giusto.

| schermata | figurine | scarto dal 5:7 | tipi |
|---|---:|---:|---|
| Home fuori carriera | 0 | — | — |
| Impostazioni | 0 | — | — |
| Creazione | 11 | 0.9 % | giocatore x11 |
| Offerte | 0 | — | — |
| Dashboard | 2 | 0.9 % | giocatore x2 |
| Stagione · Classifica | 2 | 0.9 % | giocatore x2 |
| Stagione · Calendario | 2 | 0.9 % | giocatore x2 |
| Stagione · Coppe | 2 | 0.9 % | giocatore x2 |
| Club | 2 | 0.9 % | giocatore x2 |
| Carriera · Profilo | 2 | 0.9 % | giocatore x2 |
| Carriera · Nazionale | 2 | 0.9 % | giocatore x2 |
| Agente | 3 | 0.9 % | giocatore x2 · procuratore x1 |
| Prepartita | 0 | — | — |
| Partita · HUD in gioco | 0 | — | — |
| Partita · HUD con la scelta | 1 | 0.7 % | giocatore x1 |

## Dettaglio · i nodi SOTTO IL PAVIMENTO di 11 px (a 412 px, la taglia del PO)

> [G8.8] Stessa lezione della colonna selettore del contrasto: un conteggio non basta a trovare i nodi.
> Qui ogni nodo reso sotto gli 11 px porta corpo, peso, selettore e il testo che mostra.

| schermata | px / peso | occorrenze | selettore | esempio |
|---|---|---:|---|---|
| — | — | 0 | nessuno | — |

## Dettaglio · le 5 coppie testo/fondo peggiori per schermata (a 412 px, la taglia del PO)

> [G8.7] La colonna **selettore** c'era gia' nel dato e non veniva stampata. Senza, un nodo che riceve
> il colore come DATO da un componente condiviso non si trova cercando nel sorgente — e infatti un passo
> si e' chiuso con «non li ho trovati». Un metro che sa dove sta il difetto deve dirlo.

| schermata | rapporto | soglia | testo su fondo | px / peso | occorrenze | selettore | esempio |
|---|---:|---:|---|---|---:|---|---|
| Home fuori carriera | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 13 / 400 | 3 | `div.cpm-slots>div:nth-child(1)>button.cpm-press.cpm-focus` | ⚡ Nuova carriera |
| Home fuori carriera | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | `div:nth-child(1)>div:nth-child(3)>p:nth-child(1)` | Crea il tuo calciatore, su |
| Impostazioni | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(3)` | Le impostazioni si salvano |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 7 | `div:nth-child(1)>div:nth-child(2)>span.cpm-num` | 30 |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 600 | 1 | `div:nth-child(1)>span:nth-child(1)>span:nth-child(1)` | in arrivo |
| Impostazioni | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 700 | 2 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | 🎨 Grafica |
| Impostazioni | 14.63:1 | 4.5:1 | `#1e293b` su `#ffffff` | 12 / 600 | 7 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(1)` | 🎵 Musica menu |
| Creazione | 4.69:1 | 4.5:1 | `#596a80` su `#f7e9ec` | 11 / 400 | 1 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(3)` | Potenza e istinto del gol |
| Creazione | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 259 | `div:nth-child(2)>button:nth-child(2)>div:nth-child(3)` | Tecnica sopraffina e impre |
| Creazione | 5.12:1 | 4.5:1 | `#a34a08` su `#f1eee8` | 11 / 400 | 8 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(3)` | 🏆 Scalatore Nato |
| Creazione | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 8 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(2)` | Vinci il campionato entro  |
| Creazione | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 2 | `div.cpm-create>div:nth-child(1)>div:nth-child(1)` | 👤 Identità |
| Offerte | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 6 | `div:nth-child(2)>div.cpm-num>div:nth-child(1)` | Provino |
| Offerte | 5.27:1 | 4.5:1 | `#526279` su `#f7e9ec` | 11 / 400 | 2 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | · Prestigio |
| Offerte | 6.12:1 | 4.5:1 | `#92400e` su `#f1eee8` | 11 / 700 | 3 | `div:nth-child(2)>div.cpm-num>div:nth-child(3)` | 7.4 |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 5 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(1)` | Riepilogo provini |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 13 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Scegli → |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(1)` | Gol e assist |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(3)` | in 12 partite |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 8 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 5 | `div:nth-child(11)>div:nth-child(1)>span.cpm-num` | 28 |
| Dashboard | 5.53:1 | 4.5:1 | `#b91c1c` su `#fbe9e9` | 11 / 800 | 3 | `div:nth-child(3)>div:nth-child(2)>span.cpm-num` | P |
| Stagione · Classifica | 5.02:1 | 4.5:1 | `#ffffff` su `#b45309` | 11 / 800 | 1 | `tr:nth-child(3)>td:nth-child(2)>span.cpm-num` | 3 |
| Stagione · Classifica | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 400 | 51 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(4)` | 0 |
| Stagione · Classifica | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 28 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Stagione · Classifica | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 22 | `div:nth-child(1)>div:nth-child(2)>span:nth-child(2)` | CRE |
| Stagione · Classifica | 5.59:1 | 4.5:1 | `#b91c1c` su `#f1eee8` | 12 / 400 | 9 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(7)` | 0 |
| Stagione · Calendario | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 10 | `div:nth-child(2)>div:nth-child(4)>div:nth-child(2)` | voto |
| Stagione · Calendario | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 40 | `div:nth-child(2)>div:nth-child(2)>div:nth-child(2)` | W. |
| Stagione · Calendario | 5.42:1 | 4.5:1 | `#0f172a` su `#16a34a` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(2)>button.cpm-press.cpm-focus` | Gioca → |
| Stagione · Calendario | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 26 | `div:nth-child(3)>div:nth-child(2)>div:nth-child(13)` | 13 |
| Stagione · Calendario | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Stagione · Coppe | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Stagione · Coppe | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(3)>div:nth-child(1)>div:nth-child(3)` | Coppa Nazionale: dal tuo s |
| Stagione · Coppe | 7.58:1 | 4.5:1 | `#8e1f33` su `#f1eee8` | 13 / 900 | 2 | `button:nth-child(2)>span:nth-child(1)>span:nth-child(1)` | K |
| Stagione · Coppe | 7.58:1 | 4.5:1 | `#8e1f33` su `#f1eee8` | 12 / 800 | 1 | `div.cpm-career>div.cpm-nav-bar>button:nth-child(2)` | ☕ Sostieni lo sviluppo di |
| Stagione · Coppe | 7.58:1 | 4.5:1 | `#8e1f33` su `#f1eee8` | 11 / 700 | 1 | `button:nth-child(2)>span:nth-child(1)>span:nth-child(2)` | Elite |
| Club | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 800 | 22 | `div:nth-child(4)>div:nth-child(2)>span.cpm-num` | S. |
| Club | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 11 / 400 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(2)` | / anno |
| Club | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 700 | 11 | `div:nth-child(4)>div:nth-child(2)>span.cpm-num` | 13° |
| Club | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 20 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(6)` | 🩺 Dr. |
| Club | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 5 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Carriera · Profilo | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 6 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Gol stag. |
| Carriera · Profilo | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 8 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Carriera · Profilo | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 2 | `div:nth-child(3)>div:nth-child(23)>button:nth-child(1)` | 🎬 Rivedi l'intro |
| Carriera · Profilo | 5.93:1 | 4.5:1 | `#526279` su `#f0fdf4` | 11 / 400 | 2 | `div:nth-child(3)>div:nth-child(13)>div:nth-child(2)` | Stagioni da pro: |
| Carriera · Profilo | 6.12:1 | 3:1 | `#92400e` su `#f1eee8` | 17 / 800 | 2 | `div:nth-child(2)>div:nth-child(1)>div.cpm-num` | 14 |
| Carriera · Nazionale | 4.66:1 | 4.5:1 | `#596a80` su `#e7ecf5` | 11 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | 0 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 900 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 2 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 400 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 31 |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 2 | `div:nth-child(3)>div:nth-child(2)>div:nth-child(1)` | Prossimi tornei |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 12 | `div:nth-child(1)>div:nth-child(3)>div:nth-child(1)` | Mercato |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 500 | 2 | `div:nth-child(2)>div:nth-child(3)>button:nth-child(2)` | Ambiziosa |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(3)>div:nth-child(2)` | 🔴 Chiuso |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 2 | `div:nth-child(1)>div:nth-child(4)>button.cpm-press.cpm-focus` | Cambia procuratore |
| Prepartita | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Stadio |
| Prepartita | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(3)>div:nth-child(4)` | Fantasioso |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(4)>div:nth-child(4)` | Attenzione: centrocampo fi |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | `div:nth-child(1)>div:nth-child(5)>button.cpm-press.cpm-focus` | 🔍 Analisi completa |
| Prepartita | 7.13:1 | 4.5:1 | `#166534` su `#ffffff` | 11 / 700 | 2 | `div:nth-child(2)>div:nth-child(2)>b:nth-child(1)` | Dribbling nell'1v1 |
| Partita · HUD in gioco | 7.41:1 | 4.5:1 | `#fbbf24` su `#32343b` | 13 / 800 | 1 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(4)` | 12 fps · corpi pieni |
| Partita · HUD in gioco | 8.06:1 | 4.5:1 | `#8e1f33` su `#eff6ff` | 11 / 700 | 3 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | 🎯 PROVINO |
| Partita · HUD in gioco | 12.31:1 | 4.5:1 | `#ffffff` su `#32343e` | 12 / 800 | 1 | `div:nth-child(1)>div:nth-child(4)>div:nth-child(1)` | 💥 Collo pieno potente |
| Partita · HUD con la scelta | 4.51:1 | 4.5:1 | `#c7dd87` su `#545c6c` | 11 / 800 | 1 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(3)` | POL |
| Partita · HUD con la scelta | 4.52:1 | 4.5:1 | `#cbd5e1` su `#545c6c` | 11 / 600 | 4 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | possesso |
| Partita · HUD con la scelta | 4.52:1 | 4.5:1 | `#cbd5e1` su `#545c6c` | 11 / 700 | 1 | `div:nth-child(2)>div:nth-child(1)>button:nth-child(1)` | Statistiche |
| Partita · HUD con la scelta | 4.58:1 | 4.5:1 | `#e4d1d2` su `#545c6c` | 11 / 800 | 1 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(1)` | GRA |
| Partita · HUD con la scelta | 4.65:1 | 4.5:1 | `#e8eef7` su `#616a7b` | 11 / 700 | 1 | `div:nth-child(2)>div:nth-child(1)>button:nth-child(2)` | Pagelle |

## Cosa NON e' stato misurato

- post-partita: niente fischio entro 300 s — fermo al 90' in fase playing, orologio fermo da 275 s (una partita sola ci mette 163 s)

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

