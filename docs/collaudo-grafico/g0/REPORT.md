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
| Stagione · Classifica | 0 (11) | 0 (11) | 0 (10) | 0 (10) | 0 (10) |
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
| Creazione | 0/589 (11) | 0/589 (11) | 0/589 (11) | 0/589 (11) | 0/589 (11) |
| Offerte | 0/40 (11) | 0/40 (11) | 0/40 (11) | 0/40 (11) | 0/40 (11) |
| Dashboard | 0/157 (11) | 0/157 (11) | 0/157 (11) | 0/157 (11) | 0/157 (11) |
| Stagione · Classifica | 0/370 (11) | 0/370 (11) | 0/370 (11) | 0/371 (11) | 0/371 (11) |
| Stagione · Calendario | 0/308 (11) | 0/308 (11) | 0/308 (11) | 0/308 (11) | 0/308 (11) |
| Stagione · Coppe | 0/42 (11) | 0/42 (11) | 0/42 (11) | 0/42 (11) | 0/42 (11) |
| Club | 0/145 (11) | 0/145 (11) | 0/145 (11) | 0/145 (11) | 0/145 (11) |
| Carriera · Profilo | 0/129 (11) | 0/129 (11) | 0/129 (11) | 0/129 (11) | 0/129 (11) |
| Carriera · Nazionale | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) |
| Agente | 0/116 (11) | 0/116 (11) | 0/116 (11) | 0/116 (11) | 0/116 (11) |
| Prepartita | 0/33 (11) | 0/33 (11) | 0/33 (11) | 0/33 (11) | 0/33 (11) |
| **TOTALE** | **0/2094** | **0/2094** | **0/2094** | **0/2095** | **0/2095** |

### 3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/28 | 0/28 | 0/28 | 0/28 | 0/28 |
| Impostazioni | 0/29 | 0/29 | 0/29 | 0/29 | 0/29 |
| Creazione | 0/589 | 0/589 | 0/589 | 0/589 | 0/589 |
| Offerte | 0/40 | 0/40 | 0/40 | 0/40 | 0/40 |
| Dashboard | 0/157 | 0/157 | 0/157 | 0/157 | 0/157 |
| Stagione · Classifica | 0/370 | 0/370 | 0/370 | 0/371 | 0/371 |
| Stagione · Calendario | 0/308 | 0/308 | 0/308 | 0/308 | 0/308 |
| Stagione · Coppe | 0/42 | 0/42 | 0/42 | 0/42 | 0/42 |
| Club | 0/145 | 0/145 | 0/145 | 0/145 | 0/145 |
| Carriera · Profilo | 0/129 | 0/129 | 0/129 | 0/129 | 0/129 |
| Carriera · Nazionale | 0/108 | 0/108 | 0/108 | 0/108 | 0/108 |
| Agente | 0/116 | 0/116 | 0/116 | 0/116 | 0/116 |
| Prepartita | 0/33 | 0/33 | 0/33 | 0/33 | 0/33 |
| **TOTALE** | **0/2094** | **0/2094** | **0/2094** | **0/2095** | **0/2095** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) | 0/4 (19 · 5) |
| Impostazioni | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) | 0/20 (0 · 9) |
| Creazione | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) | 0/819 (3 · 19) |
| Offerte | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) | 0/29 (5 · 9) |
| Dashboard | 0/115 (16 · 29) | 0/115 (16 · 29) | 0/115 (16 · 29) | 0/115 (16 · 29) | 0/115 (16 · 29) |
| Stagione · Classifica | 0/350 (9 · 29) | 0/350 (9 · 29) | 0/350 (9 · 29) | 0/351 (9 · 29) | 0/351 (9 · 29) |
| Stagione · Calendario | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) | 0/239 (9 · 68) |
| Stagione · Coppe | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) | 0/26 (9 · 7) |
| Club | 0/94 (25 · 27) | 0/94 (25 · 27) | 0/94 (25 · 27) | 0/94 (25 · 27) | 0/94 (25 · 27) |
| Carriera · Profilo | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) | 0/89 (16 · 24) |
| Carriera · Nazionale | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) | 0/73 (19 · 16) |
| Agente | 0/93 (6 · 17) | 0/93 (6 · 17) | 0/93 (6 · 17) | 0/93 (6 · 17) | 0/93 (6 · 17) |
| Prepartita | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) | 0/17 (12 · 6) |
| **TOTALE** | **0/1968** | **0/1968** | **0/1968** | **0/1969** | **0/1969** |

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
| Home fuori carriera | 800 (0.87) | 696 (0.76) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Impostazioni | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Creazione | 1726 (1.89) | 1726 (1.89) | 1726 (1.89) | 1726 (1.89) | 1698 (1.86) |
| Offerte | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Dashboard | 1889 (2.06) | 1889 (2.06) | 1889 (2.06) | 1889 (2.06) | 1873 (2.05) |
| Stagione · Classifica | 1988 (2.17) | 1988 (2.17) | 1988 (2.17) | 1988 (2.17) | 1988 (2.17) |
| Stagione · Calendario | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) | 1593 (1.74) |
| Stagione · Coppe | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Club | 1426 (1.56) | 1425 (1.56) | 1425 (1.56) | 1413 (1.54) | 1400 (1.53) |
| Carriera · Profilo | 2083 (2.28) | 2068 (2.26) | 2068 (2.26) | 2022 (2.21) | 2022 (2.21) |
| Carriera · Nazionale | 1152 (1.26) | 1139 (1.24) | 1139 (1.24) | 1139 (1.24) | 1139 (1.24) |
| Agente | 1576 (1.72) | 1536 (1.68) | 1518 (1.66) | 1518 (1.66) | 1518 (1.66) |
| Prepartita | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |

> Lo scorritore misurato a 412 px, schermata per schermata: Home fuori carriera `documento` · Impostazioni `documento` · Creazione `div#root>div.cpm-root>div.cpm-scroll` · Offerte `documento` · Dashboard `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Classifica `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Calendario `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Coppe `documento` · Club `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Profilo `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Nazionale `div#root>div.cpm-root>div.cpm-scroll` · Agente `div#root>div.cpm-root>div.cpm-scroll` · Prepartita `documento`

### 6 · Censimento del reso — TINTE DI TESTO diverse

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 9 | 9 | 9 | 9 | 9 |
| Offerte | 6 | 6 | 6 | 6 | 6 |
| Dashboard | 13 | 13 | 13 | 13 | 13 |
| Stagione · Classifica | 11 | 11 | 11 | 11 | 11 |
| Stagione · Calendario | 10 | 10 | 10 | 10 | 10 |
| Stagione · Coppe | 6 | 6 | 6 | 6 | 6 |
| Club | 10 | 10 | 10 | 10 | 10 |
| Carriera · Profilo | 9 | 9 | 9 | 9 | 9 |
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
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 5 | 5 | 5 | 5 | 5 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |

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

### 9 · Censimento del reso — RAGGI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 4 | 4 | 4 | 4 | 4 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 3 | 3 | 3 | 3 | 3 |
| Offerte | 2 | 2 | 2 | 2 | 2 |
| Dashboard | 4 | 4 | 4 | 4 | 4 |
| Stagione · Classifica | 4 | 4 | 4 | 4 | 4 |
| Stagione · Calendario | 4 | 4 | 4 | 4 | 4 |
| Stagione · Coppe | 4 | 4 | 4 | 4 | 4 |
| Club | 5 | 5 | 5 | 5 | 5 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 4 | 4 | 4 | 4 | 4 |
| Agente | 4 | 4 | 4 | 4 | 4 |
| Prepartita | 3 | 3 | 3 | 3 | 3 |

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
| Dashboard | 8 | 8 | 8 | 8 | 8 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 1 | 1 | 1 | 1 | 1 |
| Stagione · Coppe | 1 | 1 | 1 | 1 | 1 |
| Club | 2 | 2 | 2 | 2 | 2 |
| Carriera · Profilo | 5 | 5 | 5 | 5 | 5 |
| Carriera · Nazionale | 1 | 1 | 1 | 1 | 1 |
| Agente | 1 | 1 | 1 | 1 | 1 |
| Prepartita | 1 | 1 | 1 | 1 | 1 |
| **TOTALE** | **23** | **23** | **23** | **23** | **23** |

> [22/09] Il PO ha segnalato in pochi minuti sette schermate come «disomogenee» o «fuori standard».
> Non sono sette difetti: sono superfici rimaste SCURE quando il tema scuro e' stato ritirato (7.947).
> Qui si contano e si nominano, cosi' la famiglia si chiude con una misura invece che un rilievo per volta.

| schermata | alt. px | luminanza | fondo | selettore | testo |
|---|---:|---:|---|---|---|
| Home fuori carriera | 258 | 0.095 | `#a3263a` | `div.cpm-scroll>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteFootball Career Simula |
| Creazione | 52 | 0.07 | `#8e1f33` | `div.cpm-create>div:nth-child(2)>button.cpm-focus` | ⚡ INIZIA I PROVINI |
| Dashboard | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
|  | 62 | 0.07 | `#8e1f33` | `div.cpm-career>div:nth-child(2)>button.cpm-press` | ⚡ Vivi la Settimanaallenamento, ev |
|  | 53 | 0.012 | `#241438` | `div.cpm-scroll>div.cpm-career>div:nth-child(4)` | La tua storia› |
|  | 58 | 0.017 | `#14243a` | `div.cpm-scroll>div.cpm-career>div:nth-child(6)` | Il tuo procuratore› |
|  | 58 | 0.013 | `#331426` | `div.cpm-scroll>div.cpm-career>div:nth-child(7)` | ❤️ Vita privata› |
|  | 67 | 0.012 | `#241a12` | `div.cpm-scroll>div.cpm-career>div:nth-child(9)` | Adesso guardano teNEL PIENO› |
| Stagione · Classifica | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
| Stagione · Calendario | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
| Stagione · Coppe | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
| Club | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
|  | 207 | 0.016 | `#112240` | `div.cpm-career>div:nth-child(2)>div:nth-child(10)` | Lo Spogliatoio🧠Luigi TestaIl Ment |
| Carriera · Profilo | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
|  | 53 | 0.014 | `#1a1f2e` | `div.cpm-career>div:nth-child(3)>div:nth-child(1)` | Biografia› |
|  | 69 | 0.042 | `#312e81` | `div.cpm-career>div:nth-child(3)>div:nth-child(6)` | 🆚 Il tuo rivale› |
|  | 62 | 0.022 | `#1e293b` | `div.cpm-career>div:nth-child(3)>div:nth-child(7)` | ⭐ Club dei sogni› |
|  | 58 | 0.022 | `#1e293b` | `div.cpm-career>div:nth-child(3)>div:nth-child(10)` | 💪 Stile di gioco› |
| Carriera · Nazionale | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
| Agente | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 15:16Avataaars |
| Prepartita | 45 | 0.07 | `#8e1f33` | `div:nth-child(1)>div:nth-child(6)>button.cpm-press.cpm-focus` | 📋 Formazioni → |

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

> La voce di menu' e' un bersaglio per il dito: la soglia consigliata per il tocco e' **44 px**.
> Le due strisce di servizio sono un invito, non un comando, e possono stare piu' basse.

### 9-bis · EMOJI rese (il provino approvato dal PO non ne ha nessuna)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 9 | 9 | 9 | 9 | 9 |
| Impostazioni | 12 | 12 | 12 | 12 | 12 |
| Creazione | 14 | 14 | 14 | 14 | 14 |
| Offerte | 7 | 7 | 7 | 7 | 7 |
| Dashboard | 18 | 18 | 18 | 18 | 18 |
| Stagione · Classifica | 17 | 17 | 17 | 17 | 17 |
| Stagione · Calendario | 58 | 58 | 58 | 58 | 58 |
| Stagione · Coppe | 7 | 7 | 7 | 7 | 7 |
| Club | 22 | 22 | 22 | 22 | 22 |
| Carriera · Profilo | 21 | 21 | 21 | 21 | 21 |
| Carriera · Nazionale | 12 | 12 | 12 | 12 | 12 |
| Agente | 14 | 14 | 14 | 14 | 14 |
| Prepartita | 9 | 9 | 9 | 9 | 9 |
| **TOTALE** | **220** | **220** | **220** | **220** | **220** |

> Contati i CARATTERI emoji sul testo reso. Il provino (`docs/collaudo-grafico/proposta-schermate/`)
> non ne usa **nessuna**: i cappelli sono etichetta maiuscoletta + filo + azione, la barra in basso
> e' solo testo. Questo numero e' la distanza fra il gioco e la direzione approvata.

| schermata | primi testi con emoji |
|---|---|
| Home fuori carriera | `Si scende in campo! ⚽` · `⚽` · `⚡ Nuova carriera` · `🎬 Revisione azioni (sviluppo)` · `🏠` · `🎬` |
| Impostazioni | `⚙️ Impostazioni` · `🎨 Grafica` · `🎧 Audio` · `🔇 Muto totale` · `🎵 Musica menu` · `🏟️ Audio partite` |
| Creazione | `Si scende in campo! ⚽` · `👤 Identità` · `🎯 Stile & percorso` · `📋 Percorso carriera` · `💪` · `🪄` |
| Offerte | `Si scende in campo! ⚽` · `⚽` · `🎯` · `⭐ TOP` |
| Dashboard | `Si scende in campo! ⚽` · `⚽` · `⚡ Vivi la Settimana` · `❤️ Vita privata` · `🌱 Il ragazzo della Primavera` · `📅` |
| Stagione · Classifica | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `★` |
| Stagione · Calendario | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `▶` |
| Stagione · Coppe | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `☕ Sostieni lo sviluppo di` |
| Club | `Si scende in campo! ⚽` · `⚽` · `⭐⭐⭐` · `🏛️` · `🧣` · `🩺 Dr.` |
| Carriera · Profilo | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `🆚 Il tuo rivale` · `⭐ Club dei sogni` |
| Carriera · Nazionale | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `📊` · `🏆` |
| Agente | `Si scende in campo! ⚽` · `⚽` · `🤵 Agente · −` · `🏋️` · `🥗` · `✂️ Rescindi (stop 10%)` |
| Prepartita | `Si scende in campo! ⚽` · `⚽` · `· Giornata 11 di 34 ⚠︎ ?g` · `🗡️` · `⛅ Parz. nuvoloso` · `🎙️ ANALISI DEL MISTER — COME ` |

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

| etichetta | Home fuori carriera | Impostazioni | Creazione | Offerte | Dashboard | Classifica | Calendario | Coppe | Club | Profilo | Nazionale | Agente | Prepartita | schermate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Stagione |  |  |  |  | 2 | 1 | 2 | 1 | 3 | 1 | 5 | 2 |  | **8** |
| OVR |  |  |  |  | 1 | 1 | 1 | 1 | 1 | 2 | 3 | 1 |  | **8** |
| Forma |  |  |  |  | 2 | 1 | 1 | 1 | 3 | 1 | 1 | 1 |  | **8** |
| Fatica |  |  |  |  | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 2 |  | **8** |
| Morale |  |  |  |  | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 1 |  | **8** |
| Gol |  |  | 1 | 1 | 3 | 2 |  |  |  | 3 | 2 |  |  | **6** |
| Partite |  | 1 |  |  | 2 |  | 2 |  |  | 1 | 1 |  |  | **5** |
| Settimana |  |  |  |  | 6 |  |  |  |  |  | 4 | 3 |  | **3** |
| Assist |  |  | 1 |  | 2 |  |  |  |  | 3 |  |  |  | **3** |
| Fiducia |  |  |  |  | 1 |  |  |  |  | 1 |  | 2 |  | **3** |
| Contratto |  |  |  |  |  |  |  |  | 2 | 1 |  | 1 |  | **3** |
| Presenze |  |  |  |  |  |  |  |  |  | 1 | 1 |  |  | **2** |
| Valore |  |  |  |  |  |  |  |  |  | 1 |  | 1 |  | **2** |
| Stipendio |  |  |  |  |  |  |  |  |  |  |  | 3 |  | **1** |
| Trofei |  |  |  |  |  |  |  |  |  | 1 |  |  |  | **1** |

## Dettaglio · DOVE STANNO I PIXEL nelle schermate lunghe (a 412 px)

> [21/09 · rilievo PO «il tab carriera e' lunghissimo»] Sapere che una schermata e' lunga non dice
> quale pezzo la allunga. Qui i blocchi di primo livello dello scorritore, dal piu' alto, con la
> quota sul totale e il testo che portano. Solo sopra le due schermate: sotto non c'e' niente da accorciare.

| schermata | blocco | px | quota | testo |
|---|---:|---:|---:|---|
| Dashboard (1889 px) | 1 | 473 | 25.1 % | 📅La tua settimanaSettimana di campionatoS |
|  | 2 | 288 | 15.3 % | Lega B · 11ª giornataProssima partitaCalen |
|  | 3 | 181 | 9.6 % | K⚽rwardEliteSalva · 15:16AvataaarsPablo St |
|  | 4 | 175 | 9.3 % | Stagione 4 · Settimana 12/3812Partite14Gol |
|  | 5 | 101 | 5.4 % | EnterGioca0AvanzaEscIndietroSpcConferma☕ S |
|  | 6 | 86 | 4.6 % | 🏟️ Partita di Questa Settimana · W.12CREF |
|  | 7 | 78 | 4.1 % | ⚡ Vivi la Settimanaallenamento, eventi e c |
|  | 8 | 77 | 4.1 % | 🤝78Fiducia mister⭐64Popolarità |
|  | 9 | 67 | 3.5 % | Adesso guardano teNEL PIENO› |
|  | 10 | 67 | 3.5 % | Il mondo fuori› |
|  | 11 | 58 | 3.1 % | Il progetto del club› |
|  | 12 | 58 | 3.1 % | Il tuo procuratore› |
| Stagione · Classifica (1988 px) | 1 | 1304 | 65.6 % | Lega B ★Lega APremier DivisionLiga Ibérica |
|  | 2 | 317 | 15.9 % | Marcatori Storici — Lega B#5Grafica Probe8 |
|  | 3 | 246 | 12.4 % | Risultati Internazionali — W.12Premier Div |
|  | 4 | 181 | 9.1 % | K⚽rwardEliteSalva · 15:16AvataaarsPablo St |
|  | 5 | 101 | 5.1 % | EnterGioca0AvanzaEscIndietroSpcConferma☕ S |
|  | 6 | 45 | 2.3 % | 📊Classifica📅Calendario🏆Coppe |
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
| Dashboard | 1 | Barlow x115 |
| Stagione · Classifica | 1 | Barlow x351 |
| Stagione · Calendario | 1 | Barlow x239 |
| Stagione · Coppe | 1 | Barlow x26 |
| Club | 1 | Barlow x94 |
| Carriera · Profilo | 1 | Barlow x89 |
| Carriera · Nazionale | 1 | Barlow x73 |
| Agente | 1 | Barlow x93 |
| Prepartita | 1 | Barlow x17 |

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
| Dashboard | 7 | **11** x75 (Elite) · **12** x12 (Lega B) · **13** x10 (K) · **17** x3 (78) · **20** x4 (Grafica Prob) · **24** x4 (82) · **32** x4 (12) |
| Stagione · Classifica | 6 | **11** x132 (Elite) · **12** x161 (TAT) · **13** x34 (K) · **17** x3 (78) · **20** x2 (Grafica Prob) · **24** x1 (82) |
| Stagione · Calendario | 7 | **11** x155 (Elite) · **12** x37 (vs) · **13** x4 (K) · **15** x30 (2) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Stagione · Coppe | 6 | **11** x15 (Elite) · **12** x1 (☕ Sostieni l) · **13** x5 (K) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Club | 7 | **11** x68 (Elite) · **12** x4 (50) · **13** x12 (K) · **15** x3 (FC Salernum) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x2 (82) |
| Carriera · Profilo | 6 | **11** x72 (Elite) · **12** x2 (Strumenti di) · **13** x4 (K) · **17** x9 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Carriera · Nazionale | 7 | **11** x51 (Elite) · **12** x10 (Grafica Prob) · **13** x5 (K) · **15** x2 (82) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) |
| Agente | 8 | **11** x67 (Elite) · **12** x4 («Guarda,) · **13** x15 (K) · **15** x1 (45.0M) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (82) · **32** x1 (4.56M€) |
| Prepartita | 3 | **11** x11 (Contropiede) · **12** x5 (Stadio Saler) · **13** x1 (📋 Formazion) |

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
| Dashboard | 13 | `#526279` x29 (Lega B) · `#1e293b` x21 (12) · `#596a80` x19 (Forma) · `#ffffff` x16 (82) · `#8e1f33` x9 (78) · `#7c3aed` x7 (6) · `#166534` x5 (14) · `#b91c1c` x3 (P) · `#6c1f2e` x2 (Salva) · `#b45309` x1 (↓ ti pesa) · `#155e75` x1 (Nello spogliat) · `#2563eb` x1 (Titolare Affer) · `#92400e` x1 (7.2) |
| Stagione · Classifica | 11 | `#526279` x123 (0) · `#1e293b` x103 (TAT) · `#596a80` x53 (Forma) · `#166534` x23 (0) · `#b91c1c` x18 (0) · `#ffffff` x13 (82) · `#8e1f33` x8 (K) · `#92400e` x4 (5) · `#6c1f2e` x2 (Salva) · `#0f172a` x2 (1) · `#a34a08` x2 (1) |
| Stagione · Calendario | 10 | `#526279` x70 (Prossime parti) · `#1e293b` x66 (CRE) · `#596a80` x39 (Forma) · `#ffffff` x21 (82) · `#166534` x12 (1) · `#92400e` x10 (7.2) · `#b91c1c` x10 (2) · `#8e1f33` x8 (K) · `#6c1f2e` x2 (Salva) · `#0f172a` x1 (Gioca →) |
| Stagione · Coppe | 6 | `#ffffff` x11 (82) · `#1e293b` x5 (78) · `#8e1f33` x4 (K) · `#596a80` x3 (Forma) · `#6c1f2e` x2 (Salva) · `#526279` x1 (Coppa Nazional) |
| Club | 10 | `#596a80` x34 (Forma) · `#526279` x18 (Lega B) · `#1e293b` x13 (SAL) · `#ffffff` x11 (82) · `#8e1f33` x8 (38k) · `#92400e` x3 (52) · `#166534` x3 (2.7M€) · `#6c1f2e` x2 (Salva) · `#1e40af` x1 (50) · `#7c3aed` x1 (50) |
| Carriera · Profilo | 9 | `#596a80` x16 (Forma) · `#1e293b` x16 (78) · `#526279` x16 (Record & Premi) · `#166534` x12 (45M€) · `#ffffff` x11 (82) · `#92400e` x7 (14) · `#8e1f33` x6 (6) · `#1e40af` x3 (12) · `#6c1f2e` x2 (Salva) |
| Carriera · Nazionale | 9 | `#596a80` x19 (Forma) · `#526279` x18 (La maglia nume) · `#ffffff` x12 (82) · `#1e293b` x12 (78) · `#8e1f33` x4 (K) · `#6c1f2e` x2 (Salva) · `#92400e` x2 (1) · `#003399` x2 (Grafica Probe) · `#166534` x2 (82) |
| Agente | 9 | `#526279` x36 (Patrimonio) · `#1e293b` x23 (4.56M€) · `#ffffff` x11 (82) · `#8e1f33` x10 (45.0M) · `#596a80` x5 (Forma) · `#7c3aed` x3 (🤵 Agente · −) · `#6c1f2e` x2 (Salva) · `#166534` x2 (€4.9M) · `#b91c1c` x1 (🚪 Richiedi Ce) |
| Prepartita | 6 | `#1e293b` x6 (Stadio Salernu) · `#596a80` x4 (Stadio) · `#526279` x3 (🔍 Analisi com) · `#166534` x2 (Gioco aereo) · `#8e1f33` x1 (🎙️ ANALISI DE) · `#ffffff` x1 (📋 Formazioni ) |

## 9-sexies · LO SPAZIO DELLE FIGURINE (a 412 px, la taglia del PO)

> [G12 · 22/09, direttiva PO «predisponi lo spazio dei volti rettangolari in verticale, stile
> panini»] Il riquadro del volto ha un contratto: **rapporto 5:7 verticale**. Qui, schermata per
> schermata, quante figurine ci sono e qual e' lo **scarto peggiore** dal rapporto dichiarato.
> Finche' l'arte non arriva il riquadro mostra il ripiego, ma lo SPAZIO e' gia' quello giusto.

| schermata | figurine | scarto dal 5:7 | tipi |
|---|---:|---:|---|
| Home fuori carriera | 0 | — | — |
| Impostazioni | 0 | — | — |
| Creazione | 0 | — | — |
| Offerte | 0 | — | — |
| Dashboard | 1 | 0.9 % | giocatore x1 |
| Stagione · Classifica | 1 | 0.9 % | giocatore x1 |
| Stagione · Calendario | 1 | 0.9 % | giocatore x1 |
| Stagione · Coppe | 1 | 0.9 % | giocatore x1 |
| Club | 1 | 0.9 % | giocatore x1 |
| Carriera · Profilo | 1 | 0.9 % | giocatore x1 |
| Carriera · Nazionale | 1 | 0.9 % | giocatore x1 |
| Agente | 2 | 0.9 % | giocatore x1 · procuratore x1 |
| Prepartita | 0 | — | — |

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
| Dashboard | 5.17:1 | 4.5:1 | `#2563eb` su `#ffffff` | 12 / 700 | 1 | `div:nth-child(13)>div:nth-child(1)>span:nth-child(2)` | Titolare Affermato |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(1)` | Gol e assist |
| Dashboard | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 600 | 3 | `div:nth-child(5)>div:nth-child(1)>div:nth-child(3)` | in 12 partite |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 10 | `div:nth-child(4)>div:nth-child(1)>span.cpm-num` | 4 |
| Stagione · Classifica | 4.97:1 | 4.5:1 | `#596a80` su `#fef3c7` | 11 / 700 | 1 | `div:nth-child(3)>div:nth-child(5)>div:nth-child(1)` | 5 |
| Stagione · Classifica | 5.02:1 | 4.5:1 | `#ffffff` su `#b45309` | 11 / 800 | 1 | `tr:nth-child(3)>td:nth-child(2)>span.cpm-num` | 3 |
| Stagione · Classifica | 5.33:1 | 4.5:1 | `#a34a08` su `#fef3c7` | 11 / 700 | 1 | `div:nth-child(3)>div:nth-child(5)>div:nth-child(3)` | 80 |
| Stagione · Classifica | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 400 | 51 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(4)` | 0 |
| Stagione · Classifica | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 32 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
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
| Prepartita | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(3)>div:nth-child(4)` | Contropiede |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(4)>div:nth-child(4)` | Attenzione: centrocampo fi |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | `div:nth-child(1)>div:nth-child(5)>button.cpm-press.cpm-focus` | 🔍 Analisi completa |
| Prepartita | 7.13:1 | 4.5:1 | `#166534` su `#ffffff` | 11 / 700 | 2 | `div:nth-child(2)>div:nth-child(2)>b:nth-child(1)` | Gioco aereo |

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

