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
| Ufficio | 360 | 375 | 390 | 412 | 430 |

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
| Ufficio | 0 | 0 | 0 | 0 | 0 |
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 2 · Elementi fuori dallo schermo a destra (fra parentesi: contenuti da un antenato che li ritaglia/fa scorrere)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Impostazioni | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Creazione | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Offerte | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Dashboard | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Classifica | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Calendario | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Stagione · Coppe | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Club | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Profilo | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Carriera · Nazionale | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Agente | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| Ufficio | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **TOTALE** | **0** | **0** | **0** | **0** | **0** |

### 3 · Testo reso sotto i 10 px — sotto/totale (minimo)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/16 (11) | 0/16 (11) | 0/16 (11) | 0/16 (11) | 0/16 (11) |
| Impostazioni | 0/18 (11) | 0/18 (11) | 0/18 (11) | 0/18 (11) | 0/18 (11) |
| Creazione | 0/603 (11) | 0/603 (11) | 0/603 (11) | 0/603 (11) | 0/603 (11) |
| Offerte | 0/32 (11) | 0/32 (11) | 0/32 (11) | 0/32 (11) | 0/32 (11) |
| Dashboard | 0/104 (11) | 0/104 (11) | 0/104 (11) | 0/104 (11) | 0/104 (11) |
| Stagione · Classifica | 0/248 (11) | 0/248 (11) | 0/248 (11) | 0/248 (11) | 0/248 (11) |
| Stagione · Calendario | 0/242 (11) | 0/242 (11) | 0/242 (11) | 0/242 (11) | 0/242 (11) |
| Stagione · Coppe | 0/44 (11) | 0/44 (11) | 0/44 (11) | 0/44 (11) | 0/44 (11) |
| Club | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) | 0/108 (11) |
| Carriera · Profilo | 0/89 (11) | 0/89 (11) | 0/89 (11) | 0/89 (11) | 0/89 (11) |
| Carriera · Nazionale | 0/111 (11) | 0/111 (11) | 0/111 (11) | 0/111 (11) | 0/111 (11) |
| Agente | 0/110 (11) | 0/110 (11) | 0/110 (11) | 0/110 (11) | 0/110 (11) |
| Ufficio | 0/122 (11) | 0/122 (11) | 0/122 (11) | 0/122 (11) | 0/122 (11) |
| **TOTALE** | **0/1847** | **0/1847** | **0/1847** | **0/1847** | **0/1847** |

### 3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/16 | 0/16 | 0/16 | 0/16 | 0/16 |
| Impostazioni | 0/18 | 0/18 | 0/18 | 0/18 | 0/18 |
| Creazione | 0/603 | 0/603 | 0/603 | 0/603 | 0/603 |
| Offerte | 0/32 | 0/32 | 0/32 | 0/32 | 0/32 |
| Dashboard | 0/104 | 0/104 | 0/104 | 0/104 | 0/104 |
| Stagione · Classifica | 0/248 | 0/248 | 0/248 | 0/248 | 0/248 |
| Stagione · Calendario | 0/242 | 0/242 | 0/242 | 0/242 | 0/242 |
| Stagione · Coppe | 0/44 | 0/44 | 0/44 | 0/44 | 0/44 |
| Club | 0/108 | 0/108 | 0/108 | 0/108 | 0/108 |
| Carriera · Profilo | 0/89 | 0/89 | 0/89 | 0/89 | 0/89 |
| Carriera · Nazionale | 0/111 | 0/111 | 0/111 | 0/111 | 0/111 |
| Agente | 0/110 | 0/110 | 0/110 | 0/110 | 0/110 |
| Ufficio | 0/122 | 0/122 | 0/122 | 0/122 | 0/122 |
| **TOTALE** | **0/1847** | **0/1847** | **0/1847** | **0/1847** | **0/1847** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/2 (9 · 5) | 0/2 (9 · 5) | 0/2 (9 · 5) | 0/2 (9 · 5) | 0/2 (9 · 5) |
| Impostazioni | 0/13 (0 · 5) | 0/13 (0 · 5) | 0/13 (0 · 5) | 0/13 (0 · 5) | 0/13 (0 · 5) |
| Creazione | 0/827 (2 · 26) | 0/827 (2 · 26) | 0/827 (2 · 26) | 0/827 (2 · 26) | 0/827 (2 · 26) |
| Offerte | 0/21 (8 · 6) | 0/21 (8 · 6) | 0/21 (8 · 6) | 0/21 (8 · 6) | 0/21 (8 · 6) |
| Dashboard | 0/70 (9 · 25) | 0/70 (9 · 25) | 0/70 (9 · 25) | 0/70 (9 · 25) | 0/70 (9 · 25) |
| Stagione · Classifica | 0/237 (7 · 22) | 0/237 (7 · 22) | 0/237 (7 · 22) | 0/237 (7 · 22) | 0/237 (7 · 22) |
| Stagione · Calendario | 0/209 (7 · 34) | 0/209 (7 · 34) | 0/209 (7 · 34) | 0/209 (7 · 34) | 0/209 (7 · 34) |
| Stagione · Coppe | 0/27 (7 · 10) | 0/27 (7 · 10) | 0/27 (7 · 10) | 0/27 (7 · 10) | 0/27 (7 · 10) |
| Club | 0/77 (7 · 25) | 0/77 (7 · 25) | 0/77 (7 · 25) | 0/77 (7 · 25) | 0/77 (7 · 25) |
| Carriera · Profilo | 0/60 (9 · 20) | 0/60 (9 · 20) | 0/60 (9 · 20) | 0/60 (9 · 20) | 0/60 (9 · 20) |
| Carriera · Nazionale | 0/68 (25 · 18) | 0/68 (25 · 18) | 0/68 (25 · 18) | 0/68 (25 · 18) | 0/68 (25 · 18) |
| Agente | 0/81 (7 · 22) | 0/81 (7 · 22) | 0/81 (7 · 22) | 0/81 (7 · 22) | 0/81 (7 · 22) |
| Ufficio | 0/84 (7 · 31) | 0/84 (7 · 31) | 0/84 (7 · 31) | 0/84 (7 · 31) | 0/84 (7 · 31) |
| **TOTALE** | **0/1776** | **0/1776** | **0/1776** | **0/1776** | **0/1776** |

### 5 · Bottoni pieni di marca (una sola azione primaria per vista)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 1 | 1 | 1 | 1 | 1 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 1 | 1 | 1 | 1 | 1 |
| Dashboard | 1 | 1 | 1 | 1 | 1 |
| Stagione · Classifica | 0 | 0 | 0 | 0 | 0 |
| Stagione · Calendario | 0 | 0 | 0 | 0 | 0 |
| Stagione · Coppe | 0 | 0 | 0 | 0 | 0 |
| Club | 0 | 0 | 0 | 0 | 0 |
| Carriera · Profilo | 0 | 0 | 0 | 0 | 0 |
| Carriera · Nazionale | 0 | 0 | 0 | 0 | 0 |
| Agente | 0 | 0 | 0 | 0 | 0 |
| Ufficio | 0 | 0 | 0 | 0 | 0 |
| **TOTALE** | **5** | **5** | **5** | **5** | **5** |

### 5-bis · QUANTO E' LUNGA — altezza dello scorritore in px (fra parentesi: schermate da 915 px del PO)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Impostazioni | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Creazione | 1495 (1.63) | 1495 (1.63) | 1495 (1.63) | 1495 (1.63) | 1480 (1.62) |
| Offerte | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Dashboard | 1652 (1.81) | 1652 (1.81) | 1652 (1.81) | 1652 (1.81) | 1635 (1.79) |
| Stagione · Classifica | 1219 (1.33) | 1219 (1.33) | 1219 (1.33) | 1219 (1.33) | 1219 (1.33) |
| Stagione · Calendario | 1232 (1.35) | 1220 (1.33) | 1220 (1.33) | 1220 (1.33) | 1220 (1.33) |
| Stagione · Coppe | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Club | 1212 (1.32) | 1199 (1.31) | 1199 (1.31) | 1186 (1.3) | 1186 (1.3) |
| Carriera · Profilo | 1290 (1.41) | 1277 (1.4) | 1277 (1.4) | 1277 (1.4) | 1277 (1.4) |
| Carriera · Nazionale | 1069 (1.17) | 1069 (1.17) | 1057 (1.16) | 1057 (1.16) | 1057 (1.16) |
| Agente | 1544 (1.69) | 1496 (1.63) | 1496 (1.63) | 1496 (1.63) | 1449 (1.58) |
| Ufficio | 1160 (1.27) | 1114 (1.22) | 1114 (1.22) | 1114 (1.22) | 1090 (1.19) |

> Lo scorritore misurato a 412 px, schermata per schermata: Home fuori carriera `documento` · Impostazioni `documento` · Creazione `div#root>div.cpm-root>div.cpm-scroll` · Offerte `documento` · Dashboard `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Classifica `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Calendario `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Coppe `documento` · Club `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Profilo `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Nazionale `div#root>div.cpm-root>div.cpm-scroll` · Agente `div#root>div.cpm-root>div.cpm-scroll` · Ufficio `div#root>div.cpm-root>div.cpm-scroll`

### 6 · Censimento del reso — TINTE DI TESTO diverse

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 9 | 9 | 9 | 9 | 9 |
| Offerte | 3 | 3 | 3 | 3 | 3 |
| Dashboard | 9 | 9 | 9 | 9 | 9 |
| Stagione · Classifica | 9 | 9 | 9 | 9 | 9 |
| Stagione · Calendario | 9 | 9 | 9 | 9 | 9 |
| Stagione · Coppe | 5 | 5 | 5 | 5 | 5 |
| Club | 8 | 8 | 8 | 8 | 8 |
| Carriera · Profilo | 9 | 9 | 9 | 9 | 9 |
| Carriera · Nazionale | 8 | 8 | 8 | 8 | 8 |
| Agente | 8 | 8 | 8 | 8 | 8 |
| Ufficio | 8 | 8 | 8 | 8 | 8 |

### 7 · Censimento del reso — FONDI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 3 | 3 | 3 | 3 | 3 |
| Dashboard | 4 | 4 | 4 | 4 | 4 |
| Stagione · Classifica | 8 | 8 | 8 | 8 | 8 |
| Stagione · Calendario | 7 | 7 | 7 | 7 | 7 |
| Stagione · Coppe | 3 | 3 | 3 | 3 | 3 |
| Club | 3 | 3 | 3 | 3 | 3 |
| Carriera · Profilo | 3 | 3 | 3 | 3 | 3 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 4 | 4 | 4 | 4 | 4 |
| Ufficio | 3 | 3 | 3 | 3 | 3 |

### 8 · Censimento del reso — CORPI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 4 | 4 | 4 | 4 | 4 |
| Offerte | 2 | 2 | 2 | 2 | 2 |
| Dashboard | 6 | 6 | 6 | 6 | 6 |
| Stagione · Classifica | 5 | 5 | 5 | 5 | 5 |
| Stagione · Calendario | 5 | 5 | 5 | 5 | 5 |
| Stagione · Coppe | 5 | 5 | 5 | 5 | 5 |
| Club | 7 | 7 | 7 | 7 | 7 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 7 | 7 | 7 | 7 | 7 |
| Ufficio | 6 | 6 | 6 | 6 | 6 |

### 9 · Censimento del reso — RAGGI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 4 | 4 | 4 | 4 | 4 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 3 | 3 | 3 | 3 | 3 |
| Offerte | 2 | 2 | 2 | 2 | 2 |
| Dashboard | 4 | 4 | 4 | 4 | 4 |
| Stagione · Classifica | 3 | 3 | 3 | 3 | 3 |
| Stagione · Calendario | 3 | 3 | 3 | 3 | 3 |
| Stagione · Coppe | 3 | 3 | 3 | 3 | 3 |
| Club | 2 | 2 | 2 | 2 | 2 |
| Carriera · Profilo | 5 | 5 | 5 | 5 | 5 |
| Carriera · Nazionale | 3 | 3 | 3 | 3 | 3 |
| Agente | 2 | 2 | 2 | 2 | 2 |
| Ufficio | 3 | 3 | 3 | 3 | 3 |

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
| — | — | niente | — | — |

### 9-quater · SUPERFICI SCURE in un gioco a tema unico CHIARO (riquadri larghi mezzo schermo, alti >= 40 px, luminanza < 0,25)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 2 | 2 | 2 | 2 | 2 |
| Impostazioni | 0 | 0 | 0 | 0 | 0 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 0 | 0 | 0 | 0 | 0 |
| Dashboard | 2 | 2 | 2 | 2 | 2 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 1 | 1 | 1 | 1 | 1 |
| Stagione · Coppe | 1 | 1 | 1 | 1 | 1 |
| Club | 1 | 1 | 1 | 1 | 1 |
| Carriera · Profilo | 1 | 1 | 1 | 1 | 1 |
| Carriera · Nazionale | 1 | 1 | 1 | 1 | 1 |
| Agente | 1 | 1 | 1 | 1 | 1 |
| Ufficio | 1 | 1 | 1 | 1 | 1 |
| **TOTALE** | **13** | **13** | **13** | **13** | **13** |

> [22/09] Il PO ha segnalato in pochi minuti sette schermate come «disomogenee» o «fuori standard».
> Non sono sette difetti: sono superfici rimaste SCURE quando il tema scuro e' stato ritirato (7.947).
> Qui si contano e si nominano, cosi' la famiglia si chiude con una misura invece che un rilievo per volta.

| schermata | alt. px | luminanza | fondo | selettore | testo |
|---|---:|---:|---|---|---|
| Home fuori carriera | 258 | 0.095 | `#a3263a` | `div.cpm-scroll>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSimulatore di carriera |
|  | 47 | 0.07 | `#8e1f33` | `div:nth-child(1)>div.cpm-slots>button.cpm-press.cpm-focus` | Nuova carriera |
| Creazione | 51 | 0.07 | `#8e1f33` | `div.cpm-create>div:nth-child(2)>button.cpm-focus` | Inizia i provini |
| Dashboard | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
|  | 62 | 0.07 | `#8e1f33` | `div.cpm-career>div:nth-child(2)>button.cpm-press` | ⚡ Vivi la Settimanaallenamento, ev |
| Stagione · Classifica | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Stagione · Calendario | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Stagione · Coppe | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Club | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Carriera · Profilo | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Carriera · Nazionale | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Agente | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |
| Ufficio | 118 | 0.044 | `#6c1f2e` | `div.cpm-career>div:nth-child(1)>div:nth-child(1)` | K⚽rwardEliteSalva · 20:36Italia ·  |

### 9-ter · ALTEZZA delle strisce di fondo — voce di menu' / sostieni / idee (px)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 |
| Impostazioni | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 | 53 / 0 / 0 |
| Creazione | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Offerte | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Dashboard | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Stagione · Classifica | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Stagione · Calendario | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Stagione · Coppe | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Club | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Carriera · Profilo | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Carriera · Nazionale | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Agente | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |
| Ufficio | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 | 49 / 26 / 26 |

> La voce di menu' e' un bersaglio per il dito: la soglia consigliata per il tocco e' **44 px**.
> Le due strisce di servizio sono un invito, non un comando, e possono stare piu' basse.

### 9-bis · EMOJI rese (il provino approvato dal PO non ne ha nessuna)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 5 | 5 | 5 | 5 | 5 |
| Impostazioni | 8 | 8 | 8 | 8 | 8 |
| Creazione | 13 | 13 | 13 | 13 | 13 |
| Offerte | 0 | 0 | 0 | 0 | 0 |
| Dashboard | 11 | 11 | 11 | 11 | 11 |
| Stagione · Classifica | 11 | 11 | 11 | 11 | 11 |
| Stagione · Calendario | 32 | 32 | 32 | 32 | 32 |
| Stagione · Coppe | 10 | 10 | 10 | 10 | 10 |
| Club | 11 | 11 | 11 | 11 | 11 |
| Carriera · Profilo | 5 | 5 | 5 | 5 | 5 |
| Carriera · Nazionale | 13 | 13 | 13 | 13 | 13 |
| Agente | 13 | 13 | 13 | 13 | 13 |
| Ufficio | 16 | 16 | 16 | 16 | 16 |
| **TOTALE** | **148** | **148** | **148** | **148** | **148** |

> Contati i CARATTERI emoji sul testo reso. Il provino (`docs/collaudo-grafico/proposta-schermate/`)
> non ne usa **nessuna**: i cappelli sono etichetta maiuscoletta + filo + azione, la barra in basso
> e' solo testo. Questo numero e' la distanza fra il gioco e la direzione approvata.

| schermata | primi testi con emoji |
|---|---|
| Home fuori carriera | `Si scende in campo! ⚽` · `⚽` · `🏠` · `🎬` · `📂` · `⚙️` |
| Impostazioni | `⚙️ Opzioni` · `🎧 Audio` · `🔇 Silenzia tutto` · `🏟️ Audio partite` · `✨ Effetti sonori` · `📣 Pubblico` |
| Creazione | `Si scende in campo! ⚽` · `👤 Identità` · `🎯 Stile e percorso` · `📋 Percorso carriera` · `💪` · `🪄` |
| Offerte | `Si scende in campo! ⚽` |
| Dashboard | `Si scende in campo! ⚽` · `⚽` · `⚡ Vivi la Settimana` · `🤝` · `⭐` · `🎁` |
| Stagione · Classifica | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `★` |
| Stagione · Calendario | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `V vinta · N pareggio · P persa` |
| Stagione · Coppe | `Si scende in campo! ⚽` · `⚽` · `📊` · `📅` · `🏆` · `⭐` |
| Club | `Si scende in campo! ⚽` · `⚽` · `🧭` · `🧣` · `🩺 Dr.` · `(medico sociale) · 📋` |
| Carriera · Profilo | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `☕ Sostieni il gioco` · `💡 Idee e feedback` |
| Carriera · Nazionale | `Si scende in campo! ⚽` · `⚽` · `👤` · `🌍` · `📊` · `🎽` |
| Agente | `Si scende in campo! ⚽` · `⚽` · `📣` · `🤵 Obiettivo della stagione` · `✂️ Licenzia il procuratore` · `🔴 Chiuso` |
| Ufficio | `Si scende in campo! ⚽` · `⚽` · `🏋️` · `🥗` · `🩺` · `🧠` |

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

| etichetta | Home fuori carriera | Impostazioni | Creazione | Offerte | Dashboard | Classifica | Calendario | Coppe | Club | Profilo | Nazionale | Agente | Ufficio | schermate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Stagione |  |  |  |  | 4 | 1 | 2 | 3 | 3 | 3 | 7 | 6 | 3 | **9** |
| OVR |  |  |  |  | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | **9** |
| Settimana |  |  |  |  | 4 |  | 1 | 2 | 1 |  | 4 | 5 | 9 | **7** |
| Gol |  |  | 1 | 1 | 2 | 2 | 1 |  |  | 2 | 3 |  |  | **7** |
| Morale |  |  |  |  | 1 |  |  |  | 4 | 1 | 1 | 1 | 6 | **6** |
| Forma |  |  |  |  | 1 |  |  |  | 4 | 1 | 1 | 1 | 2 | **6** |
| Fatica |  |  |  |  | 1 |  |  |  | 1 | 1 | 1 | 1 | 3 | **6** |
| Fiducia |  |  |  |  | 1 |  |  |  | 1 | 1 |  | 1 | 4 | **5** |
| Partite |  | 1 |  |  | 2 |  | 3 |  |  |  | 1 |  |  | **4** |
| Assist |  |  | 1 | 1 | 2 |  |  |  |  | 2 |  |  |  | **4** |
| Presenze |  |  |  |  |  |  |  | 1 |  | 2 | 6 |  |  | **3** |
| Contratto |  |  |  |  |  |  |  |  | 1 | 1 |  | 2 |  | **3** |
| Obiettivi |  |  | 1 |  | 2 |  |  |  |  |  |  |  |  | **2** |
| Valore |  |  |  |  |  |  |  |  |  | 1 |  | 1 |  | **2** |
| Stipendio |  |  |  |  |  |  |  |  |  |  |  | 2 |  | **1** |
| Media voto |  |  |  |  | 1 |  |  |  |  |  |  |  |  | **1** |
| Punti |  |  |  |  |  | 1 |  |  |  |  |  |  |  | **1** |
| Trofei |  |  |  |  |  |  |  |  |  | 1 |  |  |  | **1** |

## Dettaglio · DOVE STANNO I PIXEL nelle schermate lunghe (a 412 px)

> [21/09 · rilievo PO «il tab carriera e' lunghissimo»] Sapere che una schermata e' lunga non dice
> quale pezzo la allunga. Qui i blocchi di primo livello dello scorritore, dal piu' alto, con la
> quota sul totale e il testo che portano. Solo sopra le due schermate: sotto non c'e' niente da accorciare.

| schermata | blocco | px | quota | testo |
|---|---:|---:|---:|---|
| — | — | — | — | nessuna schermata sopra le due schermate |

## 9-quinquies · I CARATTERI RESI (a 412 px, la taglia del PO)

> [G9 · 22/09, collaudo PO «la schermata iniziale e' rimasta completamente fuori standard»] Il provino
> approvato ha UN carattere vero, **Barlow** (+ **Barlow Condensed** per i numerali incolonnati). Una
> schermata che ne rende altri e' fuori standard per costruzione — e finora nessun numero lo diceva:
> si guardava il contrasto, il corpo, il raggio, mai la FAMIGLIA. Qui c'e' la prima famiglia della
> `font-family` calcolata, cioe' quella che il browser usa davvero, con quanti nodi la portano.

| schermata | famiglie | dettaglio (famiglia x nodi) |
|---|---:|---|
| Home fuori carriera | 1 | Barlow x2 |
| Impostazioni | 1 | Barlow x13 |
| Creazione | 1 | Barlow x827 |
| Offerte | 1 | Barlow x21 |
| Dashboard | 1 | Barlow x70 |
| Stagione · Classifica | 1 | Barlow x237 |
| Stagione · Calendario | 1 | Barlow x209 |
| Stagione · Coppe | 1 | Barlow x27 |
| Club | 1 | Barlow x77 |
| Carriera · Profilo | 1 | Barlow x60 |
| Carriera · Nazionale | 1 | Barlow x68 |
| Agente | 1 | Barlow x81 |
| Ufficio | 1 | Barlow x84 |

## 9-octies · I CORPI, UNO PER UNO, COL NODO CHE LI PORTA (a 412 px)

> [G13 · 22/09] Stessa lezione delle tinte e del pavimento (G8.8): un elenco di numeri non fa
> trovare il nodo. Qui ogni corpo reso, con quanti nodi lo portano e un esempio — cosi' un corpo
> fuori scala si va a prendere invece di cercarlo a mano nel sorgente.

| schermata | corpi | dettaglio (px x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 2 | **12** x1 (Crea il tuo ) · **15** x1 (Nuova carrie) |
| Impostazioni | 3 | **11** x6 (🎧 Audio) · **12** x6 (🔇 Silenzia ) · **15** x1 (⚙️ Opzioni) |
| Creazione | 4 | **11** x314 (👤 Identità) · **12** x259 (ATTACCANTE) · **15** x1 (Inizia i pro) · **17** x1 (NOME) |
| Offerte | 2 | **11** x12 (Primavera 1) · **13** x6 (Torino Athle) |
| Dashboard | 6 | **11** x39 (Elite) · **12** x4 (Claudio Mila) · **13** x16 (K) · **17** x3 (78) · **20** x3 (Grafica Prob) · **24** x5 (86) |
| Stagione · Classifica | 5 | **11** x34 (Elite) · **12** x161 (Classifica) · **13** x22 (K) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Stagione · Calendario | 5 | **11** x170 (Elite) · **12** x27 (Classifica) · **13** x2 (K) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Stagione · Coppe | 5 | **11** x16 (Elite) · **12** x6 (Classifica) · **13** x3 (K) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Club | 7 | **11** x63 (Elite) · **12** x4 (72/100) · **13** x2 (K) · **15** x1 (FC Salernum) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x2 (86) |
| Carriera · Profilo | 6 | **11** x45 (Elite) · **12** x2 (Profilo) · **13** x2 (K) · **17** x9 (78) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Carriera · Nazionale | 6 | **11** x50 (Elite) · **12** x11 (Profilo) · **13** x2 (K) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Agente | 7 | **11** x59 (Elite) · **12** x6 (Andrea Turat) · **13** x10 (K) · **15** x1 (€45 mln) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (86) |
| Ufficio | 6 | **11** x76 (Elite) · **13** x2 (K) · **17** x3 (78) · **20** x1 (Grafica Prob) · **24** x1 (86) · **32** x1 (€4,56 mln) |

## 9-septies · LE TINTE DEL TESTO, UNA PER UNA (a 412 px, la taglia del PO)

> [G14 · 22/09] Il conteggio dice che la Dashboard rende quattordici tinte contro le cinque del
> provino, ma non dice QUALI — e la differenza e' tutta li': una tinta **semantica** (vittoria,
> sconfitta, allarme) e' un'informazione e deve restare; un grigio nato per sbaglio e' debito.
> Qui ogni tinta col numero di nodi e un esempio, in ordine di diffusione.

| schermata | tinte | dettaglio (tinta x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 2 | `#ffffff` x1 (Nuova carriera) · `#526279` x1 (Crea il tuo ca) |
| Impostazioni | 3 | `#1e293b` x7 (⚙️ Opzioni) · `#596a80` x5 (85) · `#526279` x1 (🎧 Audio) |
| Creazione | 9 | `#1e293b` x264 (NOME) · `#596a80` x262 (👤 Identità) · `#000000` x260 (CFM) · `#526279` x18 (187 cm · 80 kg) · `#a34a08` x8 (🏆 Scalatore N) · `#166534` x7 (Effetto sugli ) · `#b91c1c` x4 (Velocità) · `#ffffff` x2 (Inizia i provi) · `#8e1f33` x2 (📋 Percorso ca) |
| Offerte | 3 | `#526279` x14 (Scegli →) · `#1e293b` x6 (TAT) · `#ffffff` x1 (Scegli →) |
| Dashboard | 9 | `#1e293b` x22 (10) · `#ffffff` x12 (86) · `#526279` x12 (Partite) · `#596a80` x10 (Forma) · `#166534` x5 (14) · `#8e1f33` x3 (78) · `#6c1f2e` x2 (Salva) · `#7c3aed` x2 (6) · `#92400e` x2 (7,4) |
| Stagione · Classifica | 9 | `#526279` x90 (Calendario) · `#1e293b` x58 (CRE) · `#b91c1c` x28 (3) · `#166534` x26 (11) · `#ffffff` x14 (86) · `#596a80` x9 (Club) · `#8e1f33` x8 (SAL) · `#6c1f2e` x2 (Salva) · `#0f172a` x2 (1) |
| Stagione · Calendario | 9 | `#596a80` x75 (12) · `#526279` x35 (Classifica) · `#1e293b` x30 (LAR) · `#92400e` x25 (2) · `#166534` x20 (1) · `#ffffff` x12 (86) · `#8e1f33` x5 (Calendario) · `#b91c1c` x5 (6) · `#6c1f2e` x2 (Salva) |
| Stagione · Coppe | 5 | `#ffffff` x12 (86) · `#526279` x6 (Classifica) · `#1e293b` x5 (Nessuna coppa ) · `#6c1f2e` x2 (Salva) · `#8e1f33` x2 (Coppe) |
| Club | 8 | `#1e293b` x28 (SAL) · `#596a80` x17 (Forma) · `#ffffff` x12 (86) · `#526279` x9 (Lega B) · `#8e1f33` x7 (7) · `#6c1f2e` x2 (Salva) · `#92400e` x1 (45) · `#166534` x1 (72/100) |
| Carriera · Profilo | 9 | `#1e293b` x19 (78) · `#596a80` x16 (Forma) · `#ffffff` x12 (86) · `#8e1f33` x4 (6) · `#526279` x3 (Nazionale) · `#6c1f2e` x2 (Salva) · `#92400e` x2 (14) · `#1e40af` x1 (10) · `#166534` x1 (€45 mln) |
| Carriera · Nazionale | 8 | `#596a80` x19 (Forma) · `#1e293b` x14 (78) · `#526279` x14 (Profilo) · `#ffffff` x13 (86) · `#6c1f2e` x2 (Salva) · `#8e1f33` x2 (Nazionale) · `#92400e` x2 (1) · `#003399` x2 (Grafica Probe) |
| Agente | 8 | `#526279` x30 (Rapporto con) · `#1e293b` x23 (78) · `#ffffff` x12 (86) · `#596a80` x6 (Forma) · `#b91c1c` x4 (Fine stagione) · `#6c1f2e` x2 (Salva) · `#8e1f33` x2 (€45 mln) · `#166534` x2 (€6 mln) |
| Ufficio | 8 | `#526279` x34 (Patrimonio:) · `#1e293b` x19 (€4,56 mln) · `#ffffff` x12 (86) · `#8e1f33` x9 (FONDA →) · `#596a80` x4 (Forma) · `#6c1f2e` x2 (Salva) · `#166534` x2 (sobrio) · `#92400e` x2 (vistoso) |

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
| Dashboard | 1 | 0.9 % | giocatore x1 |
| Stagione · Classifica | 1 | 0.9 % | giocatore x1 |
| Stagione · Calendario | 1 | 0.9 % | giocatore x1 |
| Stagione · Coppe | 1 | 0.9 % | giocatore x1 |
| Club | 4 | 0.9 % | giocatore x4 |
| Carriera · Profilo | 1 | 0.9 % | giocatore x1 |
| Carriera · Nazionale | 1 | 0.9 % | giocatore x1 |
| Agente | 2 | 0.9 % | giocatore x1 · procuratore x1 |
| Ufficio | 1 | 0.9 % | giocatore x1 |

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
| Home fuori carriera | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | `div:nth-child(1)>div:nth-child(3)>p:nth-child(1)` | Crea il tuo calciatore, su |
| Home fuori carriera | 8.77:1 | 3:1 | `#ffffff` su `#8e1f33` | 15 / 700 | 1 | `div:nth-child(1)>div.cpm-slots>button.cpm-press.cpm-focus` | Nuova carriera |
| Impostazioni | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Le impostazioni si salvano |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(2)>span.cpm-num` | 85 |
| Impostazioni | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | 🎧 Audio |
| Impostazioni | 14.63:1 | 4.5:1 | `#1e293b` su `#ffffff` | 12 / 600 | 6 | `div:nth-child(1)>div:nth-child(2)>span:nth-child(1)` | 🔇 Silenzia tutto |
| Impostazioni | 14.63:1 | 3:1 | `#1e293b` su `#ffffff` | 15 / 800 | 1 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | ⚙️ Opzioni |
| Creazione | 4.69:1 | 4.5:1 | `#596a80` su `#f7e9ec` | 11 / 400 | 1 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(3)` | Potenza e istinto del gol |
| Creazione | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 259 | `div:nth-child(2)>button:nth-child(2)>div:nth-child(3)` | Tecnica sopraffina e impre |
| Creazione | 5.12:1 | 4.5:1 | `#a34a08` su `#f1eee8` | 11 / 400 | 8 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(3)` | 🏆 Scalatore Nato |
| Creazione | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 8 | `div:nth-child(2)>button:nth-child(1)>div:nth-child(2)` | Vinci il campionato entro  |
| Creazione | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 2 | `div.cpm-create>div:nth-child(1)>div:nth-child(1)` | 👤 Identità |
| Offerte | 5.27:1 | 4.5:1 | `#526279` su `#f7e9ec` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Primavera 1 |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 8 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Primavera 1 |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 13 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Scegli → |
| Offerte | 8.77:1 | 4.5:1 | `#ffffff` su `#8e1f33` | 13 / 700 | 1 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Scegli → |
| Offerte | 12.41:1 | 3:1 | `#1e293b` su `#f7e9ec` | 27 / 900 | 1 | `div:nth-child(1)>svg:nth-child(1)>text:nth-child(3)` | TAT |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 6 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 600 | 2 | `div:nth-child(1)>span.cpm-num>span:nth-child(1)` | /100 |
| Dashboard | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 2 | `div:nth-child(13)>div:nth-child(1)>span.cpm-num` | 28 |
| Dashboard | 5.70:1 | 3:1 | `#7c3aed` su `#ffffff` | 24 / 800 | 1 | `div:nth-child(2)>div:nth-child(3)>div.cpm-num` | 6 |
| Dashboard | 5.70:1 | 3:1 | `#7c3aed` su `#ffffff` | 20 / 800 | 1 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | 64 |
| Stagione · Classifica | 5.02:1 | 4.5:1 | `#ffffff` su `#b45309` | 11 / 800 | 1 | `tr:nth-child(3)>td:nth-child(2)>span.cpm-num` | 3 |
| Stagione · Classifica | 5.27:1 | 4.5:1 | `#526279` su `#f7e9ec` | 12 / 400 | 4 | `tbody:nth-child(2)>tr:nth-child(7)>td:nth-child(4)` | 19 |
| Stagione · Classifica | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 400 | 42 | `tbody:nth-child(2)>tr:nth-child(2)>td:nth-child(4)` | 19 |
| Stagione · Classifica | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 700 | 2 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Calendario |
| Stagione · Classifica | 5.49:1 | 4.5:1 | `#b91c1c` su `#f7e9ec` | 12 / 400 | 1 | `tbody:nth-child(2)>tr:nth-child(7)>td:nth-child(7)` | 3 |
| Stagione · Calendario | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 700 | 2 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Classifica |
| Stagione · Calendario | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 600 | 48 | `div:nth-child(1)>div:nth-child(12)>div:nth-child(1)` | LAR |
| Stagione · Calendario | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 27 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(12)` | 12 |
| Stagione · Calendario | 5.89:1 | 4.5:1 | `#b91c1c` su `#fff1f2` | 11 / 700 | 3 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(6)` | 6 |
| Stagione · Calendario | 5.89:1 | 4.5:1 | `#b91c1c` su `#fff1f2` | 11 / 600 | 2 | `div:nth-child(1)>div:nth-child(6)>div:nth-child(1)` | PIS |
| Stagione · Coppe | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 3 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Quest'anno non sei in gara |
| Stagione · Coppe | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 700 | 2 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Classifica |
| Stagione · Coppe | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Le competizioni si aprono  |
| Stagione · Coppe | 7.58:1 | 4.5:1 | `#8e1f33` su `#f1eee8` | 11 / 700 | 1 | `div.cpm-nav-bar>div:nth-child(2)>button:nth-child(1)` | ☕ Sostieni il gioco |
| Stagione · Coppe | 8.77:1 | 4.5:1 | `#8e1f33` su `#ffffff` | 12 / 700 | 1 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Coppe |
| Club | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 12 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(6)` | 🩺 Dr. |
| Club | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 5 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Club | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 5 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Lega B |
| Club | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(4)` | Progetto: A un passo da qu |
| Club | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 500 | 1 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(1)` | Chimica di squadra |
| Carriera · Profilo | 4.77:1 | 4.5:1 | `#596a80` su `#f1eee8` | 11 / 400 | 6 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Gol stagione |
| Carriera · Profilo | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 700 | 1 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Nazionale |
| Carriera · Profilo | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 10 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Carriera · Profilo | 6.12:1 | 3:1 | `#92400e` su `#f1eee8` | 17 / 800 | 2 | `div:nth-child(1)>div:nth-child(1)>div.cpm-num` | 14 |
| Carriera · Profilo | 6.16:1 | 3:1 | `#166534` su `#f1eee8` | 17 / 800 | 1 | `div:nth-child(1)>div:nth-child(6)>div.cpm-num` | €45 mln |
| Carriera · Nazionale | 4.66:1 | 4.5:1 | `#596a80` su `#e7ecf5` | 11 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | 14 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 900 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 2 |
| Carriera · Nazionale | 4.99:1 | 4.5:1 | `#596a80` su `#f5f3ef` | 11 / 400 | 6 | `div:nth-child(2)>div:nth-child(2)>span.cpm-num` | 31 |
| Carriera · Nazionale | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 12 / 700 | 1 | `div.cpm-career>div:nth-child(2)>button.cpm-focus` | Profilo |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 400 | 16 | `div:nth-child(1)>div:nth-child(6)>div:nth-child(1)` | 🤵 Obiettivo della stagion |
| Agente | 5.36:1 | 4.5:1 | `#526279` su `#f1eee8` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | 🔴 Chiuso |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 3 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Assegna « |
| Agente | 5.59:1 | 4.5:1 | `#b91c1c` su `#f1eee8` | 13 / 800 | 3 | `div:nth-child(1)>div:nth-child(3)>div:nth-child(2)` | Fine stagione |
| Ufficio | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 700 | 3 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Forma |
| Ufficio | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(1)` | · morale e fiducia del mis |
| Ufficio | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 22 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Patrimonio: |
| Ufficio | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 600 | 12 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | Livello |
| Ufficio | 7.09:1 | 4.5:1 | `#92400e` su `#ffffff` | 11 / 600 | 2 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(1)` | vistoso |

## Cosa NON e' stato misurato

- prepartita: playMatch → nomatch

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

