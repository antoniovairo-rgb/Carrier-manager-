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
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 2 · Elementi fuori dallo schermo a destra (fra parentesi: contenuti da un antenato che li ritaglia/fa scorrere)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Impostazioni | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Creazione | 0 (2) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Offerte | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Dashboard | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Classifica | 0 (11) | 0 (11) | 0 (11) | 0 (10) | 0 (10) |
| Stagione · Calendario | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Coppe | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Club | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Profilo | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Nazionale | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Agente | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Prepartita | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 3 · Testo reso sotto i 10 px — sotto/totale (minimo)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/28 (11) | 0/28 (11) | 0/28 (11) | 0/28 (11) | 0/28 (11) |
| Impostazioni | 0/29 (11) | 0/29 (11) | 0/29 (11) | 0/29 (11) | 0/29 (11) |
| Creazione | 0/841 (11) | 0/841 (11) | 0/841 (11) | 0/841 (11) | 0/841 (11) |
| Offerte | 0/43 (11) | 0/43 (11) | 0/43 (11) | 0/43 (11) | 0/43 (11) |
| Dashboard | 0/201 (11) | 0/201 (11) | 0/201 (11) | 0/201 (11) | 0/201 (11) |
| Stagione · Classifica | 0/394 (11) | 0/394 (11) | 0/394 (11) | 0/395 (11) | 0/395 (11) |
| Stagione · Calendario | 0/322 (11) | 0/322 (11) | 0/322 (11) | 0/322 (11) | 0/322 (11) |
| Stagione · Coppe | 0/48 (11) | 0/48 (11) | 0/48 (11) | 0/48 (11) | 0/48 (11) |
| Club | 0/154 (11) | 0/154 (11) | 0/154 (11) | 0/154 (11) | 0/154 (11) |
| Carriera · Profilo | 0/326 (11) | 0/326 (11) | 0/326 (11) | 0/326 (11) | 0/326 (11) |
| Carriera · Nazionale | 0/114 (11) | 0/114 (11) | 0/114 (11) | 0/114 (11) | 0/114 (11) |
| Agente | 0/123 (11) | 0/123 (11) | 0/123 (11) | 0/123 (11) | 0/123 (11) |
| Prepartita | 0/35 (11) | 0/35 (11) | 0/35 (11) | 0/35 (11) | 0/35 (11) |
| **TOTALE** | **0/2658** | **0/2658** | **0/2658** | **0/2659** | **0/2659** |

### 3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/28 | 0/28 | 0/28 | 0/28 | 0/28 |
| Impostazioni | 0/29 | 0/29 | 0/29 | 0/29 | 0/29 |
| Creazione | 0/841 | 0/841 | 0/841 | 0/841 | 0/841 |
| Offerte | 0/43 | 0/43 | 0/43 | 0/43 | 0/43 |
| Dashboard | 0/201 | 0/201 | 0/201 | 0/201 | 0/201 |
| Stagione · Classifica | 0/394 | 0/394 | 0/394 | 0/395 | 0/395 |
| Stagione · Calendario | 0/322 | 0/322 | 0/322 | 0/322 | 0/322 |
| Stagione · Coppe | 0/48 | 0/48 | 0/48 | 0/48 | 0/48 |
| Club | 0/154 | 0/154 | 0/154 | 0/154 | 0/154 |
| Carriera · Profilo | 0/326 | 0/326 | 0/326 | 0/326 | 0/326 |
| Carriera · Nazionale | 0/114 | 0/114 | 0/114 | 0/114 | 0/114 |
| Agente | 0/123 | 0/123 | 0/123 | 0/123 | 0/123 |
| Prepartita | 0/35 | 0/35 | 0/35 | 0/35 | 0/35 |
| **TOTALE** | **0/2658** | **0/2658** | **0/2658** | **0/2659** | **0/2659** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) |
| Impostazioni | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) |
| Creazione | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) |
| Offerte | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) |
| Dashboard | 0/126 (38 · 37) | 0/126 (38 · 37) | 0/126 (38 · 37) | 0/126 (38 · 37) | 0/126 (38 · 37) |
| Stagione · Classifica | 0/350 (9 · 35) | 0/350 (9 · 35) | 0/350 (9 · 35) | 0/351 (9 · 35) | 0/351 (9 · 35) |
| Stagione · Calendario | 0/239 (9 · 74) | 0/239 (9 · 74) | 0/239 (9 · 74) | 0/239 (9 · 74) | 0/239 (9 · 74) |
| Stagione · Coppe | 0/26 (9 · 13) | 0/26 (9 · 13) | 0/26 (9 · 13) | 0/26 (9 · 13) | 0/26 (9 · 13) |
| Club | 0/94 (25 · 35) | 0/94 (25 · 35) | 0/94 (25 · 35) | 0/94 (25 · 35) | 0/94 (25 · 35) |
| Carriera · Profilo | 0/196 (39 · 91) | 0/196 (39 · 91) | 0/196 (39 · 91) | 0/196 (39 · 91) | 0/196 (39 · 91) |
| Carriera · Nazionale | 0/73 (19 · 22) | 0/73 (19 · 22) | 0/73 (19 · 22) | 0/73 (19 · 22) | 0/73 (19 · 22) |
| Agente | 0/93 (6 · 24) | 0/93 (6 · 24) | 0/93 (6 · 24) | 0/93 (6 · 24) | 0/93 (6 · 24) |
| Prepartita | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) |
| **TOTALE** | **0/2086** | **0/2086** | **0/2086** | **0/2087** | **0/2087** |

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
| **TOTALE** | **5** | **5** | **5** | **5** | **5** |

### 5-bis · QUANTO E' LUNGA — altezza dello scorritore in px (fra parentesi: schermate da 915 px del PO)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 800 (0.87) | 742 (0.81) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Impostazioni | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Creazione | 1749 (1.91) | 1749 (1.91) | 1749 (1.91) | 1749 (1.91) | 1721 (1.88) |
| Offerte | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Dashboard | 2830 (3.09) | 2799 (3.06) | 2799 (3.06) | 2700 (2.95) | 2682 (2.93) |
| Stagione · Classifica | 2035 (2.22) | 2035 (2.22) | 2035 (2.22) | 2035 (2.22) | 2035 (2.22) |
| Stagione · Calendario | 1651 (1.8) | 1651 (1.8) | 1651 (1.8) | 1651 (1.8) | 1651 (1.8) |
| Stagione · Coppe | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Club | 1565 (1.71) | 1540 (1.68) | 1539 (1.68) | 1527 (1.67) | 1527 (1.67) |
| Carriera · Profilo | 3662 (4) | 3621 (3.96) | 3621 (3.96) | 3575 (3.91) | 3545 (3.87) |
| Carriera · Nazionale | 1195 (1.31) | 1195 (1.31) | 1195 (1.31) | 1183 (1.29) | 1183 (1.29) |
| Agente | 1652 (1.81) | 1652 (1.81) | 1594 (1.74) | 1594 (1.74) | 1594 (1.74) |
| Prepartita | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |

> Lo scorritore misurato a 412 px, schermata per schermata: Home fuori carriera `documento` · Impostazioni `documento` · Creazione `div#root>div.cpm-root>div.cpm-scroll` · Offerte `documento` · Dashboard `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Classifica `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Calendario `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Coppe `documento` · Club `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Profilo `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Nazionale `div#root>div.cpm-root>div.cpm-scroll` · Agente `div#root>div.cpm-root>div.cpm-scroll` · Prepartita `documento`

### 6 · Censimento del reso — TINTE DI TESTO diverse

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 9 | 9 | 9 | 9 | 9 |
| Offerte | 6 | 6 | 6 | 6 | 6 |
| Dashboard | 14 | 14 | 14 | 14 | 14 |
| Stagione · Classifica | 13 | 13 | 13 | 13 | 13 |
| Stagione · Calendario | 10 | 10 | 10 | 10 | 10 |
| Stagione · Coppe | 6 | 6 | 6 | 6 | 6 |
| Club | 11 | 11 | 11 | 11 | 11 |
| Carriera · Profilo | 18 | 18 | 18 | 18 | 18 |
| Carriera · Nazionale | 9 | 9 | 9 | 9 | 9 |
| Agente | 9 | 9 | 9 | 9 | 9 |
| Prepartita | 6 | 6 | 6 | 6 | 6 |

### 7 · Censimento del reso — FONDI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 4 | 4 | 4 | 4 | 4 |
| Dashboard | 7 | 7 | 7 | 7 | 7 |
| Stagione · Classifica | 10 | 10 | 10 | 10 | 10 |
| Stagione · Calendario | 9 | 9 | 9 | 9 | 9 |
| Stagione · Coppe | 3 | 3 | 3 | 3 | 3 |
| Club | 4 | 4 | 4 | 4 | 4 |
| Carriera · Profilo | 8 | 8 | 8 | 8 | 8 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 5 | 5 | 5 | 5 | 5 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |

### 8 · Censimento del reso — CORPI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 4 | 4 | 4 | 4 | 4 |
| Offerte | 4 | 4 | 4 | 4 | 4 |
| Dashboard | 11 | 11 | 11 | 11 | 11 |
| Stagione · Classifica | 9 | 9 | 9 | 9 | 9 |
| Stagione · Calendario | 10 | 10 | 10 | 10 | 10 |
| Stagione · Coppe | 7 | 7 | 7 | 7 | 7 |
| Club | 10 | 10 | 10 | 10 | 10 |
| Carriera · Profilo | 7 | 7 | 7 | 7 | 7 |
| Carriera · Nazionale | 8 | 8 | 8 | 8 | 8 |
| Agente | 11 | 11 | 11 | 11 | 11 |
| Prepartita | 4 | 4 | 4 | 4 | 4 |

### 9 · Censimento del reso — RAGGI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 5 | 5 | 5 | 5 | 5 |
| Impostazioni | 5 | 5 | 5 | 5 | 5 |
| Creazione | 5 | 5 | 5 | 5 | 5 |
| Offerte | 3 | 3 | 3 | 3 | 3 |
| Dashboard | 7 | 7 | 7 | 7 | 7 |
| Stagione · Classifica | 5 | 5 | 5 | 5 | 5 |
| Stagione · Calendario | 5 | 5 | 5 | 5 | 5 |
| Stagione · Coppe | 4 | 4 | 4 | 4 | 4 |
| Club | 6 | 6 | 6 | 6 | 6 |
| Carriera · Profilo | 11 | 11 | 11 | 11 | 11 |
| Carriera · Nazionale | 5 | 5 | 5 | 5 | 5 |
| Agente | 7 | 7 | 7 | 7 | 7 |
| Prepartita | 5 | 5 | 5 | 5 | 5 |

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
| Creazione | 360 | `div:nth-child(3)>div:nth-child(2)>button:nth-child(5)` | 3.5 | AvataaarsPablo Stanleyhttps://avat |
| Creazione | 360 | `div:nth-child(3)>div:nth-child(2)>button:nth-child(10)` | 3.5 | AvataaarsPablo Stanleyhttps://avat |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 1159.1 | Liga Ibérica 2 |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 1049.5 | Ligue Nationale 2 |
| Stagione · Classifica | 360 | `div:nth-child(3)>div:nth-child(1)>button.cpm-press` | 918.1 | Deutsche Liga 2 |

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
| Dashboard | 5.02:1 | 4.5:1 | `#b45309` su `#ffffff` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(3)` | ↓ ti pesa |
| Dashboard | 5.17:1 | 4.5:1 | `#2563eb` su `#ffffff` | 12 / 700 | 1 | `div:nth-child(12)>div:nth-child(1)>span:nth-child(2)` | Titolare Affermato |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(1)` | Gol e assist |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(3)` | in 12 partite |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 10 | `div:nth-child(4)>div:nth-child(1)>span.cpm-num` | 4 |
| Stagione · Classifica | 4.97:1 | 4.5:1 | `#596a80` su `#fef3c7` | 11 / 700 | 1 | `div:nth-child(3)>div:nth-child(5)>div:nth-child(1)` | 5 |
| Stagione · Classifica | 5.02:1 | 4.5:1 | `#ffffff` su `#b45309` | 11 / 800 | 1 | `tr:nth-child(3)>td:nth-child(2)>span.cpm-num` | 3 |
| Stagione · Classifica | 5.33:1 | 4.5:1 | `#a34a08` su `#fef3c7` | 11 / 700 | 1 | `div:nth-child(3)>div:nth-child(5)>div:nth-child(3)` | 80 |
| Stagione · Classifica | 5.34:1 | 4.5:1 | `#137036` su `#f1eee8` | 12 / 400 | 9 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(5)` | 0 |
| Stagione · Classifica | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 400 | 51 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(4)` | 0 |
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
| Club | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 800 | 6 | `div:nth-child(4)>div:nth-child(2)>span.cpm-num` | S. |
| Club | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 11 / 400 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(2)` | / anno |
| Club | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 700 | 3 | `div:nth-child(4)>div:nth-child(2)>span.cpm-num` | 8° |
| Club | 5.48:1 | 4.5:1 | `#026fa7` su `#ffffff` | 12 / 700 | 1 | `div:nth-child(1)>div:nth-child(1)>span.cpm-num` | 50 |
| Club | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 20 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(6)` | 🩺 Dr. |
| Carriera · Profilo | 4.73:1 | 3:1 | `#026fa7` su `#f1eee8` | 17 / 800 | 1 | `div:nth-child(2)>div:nth-child(3)>div.cpm-num` | 12 |
| Carriera · Profilo | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 10 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Stipendio |
| Carriera · Profilo | 5.00:1 | 3:1 | `#995404` su `#f1eee8` | 17 / 800 | 2 | `div:nth-child(2)>div:nth-child(1)>div.cpm-num` | 14 |
| Carriera · Profilo | 5.06:1 | 4.5:1 | `#596a80` su `#f5f5f5` | 11 / 600 | 12 | `div:nth-child(2)>div:nth-child(5)>span:nth-child(2)` | 200 partite |
| Carriera · Profilo | 5.15:1 | 3:1 | `#0f7334` su `#f1eee8` | 17 / 800 | 1 | `div:nth-child(2)>div:nth-child(6)>div.cpm-num` | 45M€ |
| Carriera · Nazionale | 4.66:1 | 4.5:1 | `#596a80` su `#e7ecf5` | 11 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | 0 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 900 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 2 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 400 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 31 |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 2 | `div:nth-child(3)>div:nth-child(2)>div:nth-child(1)` | Prossimi tornei |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 12 | `div:nth-child(1)>div:nth-child(3)>div:nth-child(1)` | Mercato |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 500 | 2 | `div:nth-child(2)>div:nth-child(3)>button:nth-child(2)` | Ambiziosa |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(3)>div:nth-child(2)` | 🔴 Chiuso |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11.5 / 400 | 1 | `div:nth-child(1)>div:nth-child(4)>button.cpm-press.cpm-focus` | Cambia procuratore |
| Prepartita | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Stadio |
| Prepartita | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(3)>div:nth-child(4)` | Contropiede |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(4)>div:nth-child(4)` | Attenzione: centrocampo fi |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | `div:nth-child(1)>div:nth-child(5)>button.cpm-press.cpm-focus` | 🔍 Analisi completa |
| Prepartita | 7.13:1 | 4.5:1 | `#166534` su `#ffffff` | 11.5 / 700 | 2 | `div:nth-child(2)>div:nth-child(2)>b:nth-child(1)` | Gioco aereo |

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

