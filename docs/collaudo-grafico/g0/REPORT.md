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
| Home fuori carriera | 0/18 (11) | 0/18 (11) | 0/18 (11) | 0/18 (11) | 0/18 (11) |
| Impostazioni | 0/20 (11) | 0/20 (11) | 0/20 (11) | 0/20 (11) | 0/20 (11) |
| Creazione | 0/563 (11) | 0/563 (11) | 0/563 (11) | 0/563 (11) | 0/563 (11) |
| Offerte | 0/32 (11) | 0/32 (11) | 0/32 (11) | 0/32 (11) | 0/32 (11) |
| Dashboard | 0/95 (11) | 0/95 (11) | 0/95 (11) | 0/95 (11) | 0/95 (11) |
| Stagione · Classifica | 0/241 (11) | 0/241 (11) | 0/241 (11) | 0/241 (11) | 0/241 (11) |
| Stagione · Calendario | 0/229 (11) | 0/229 (11) | 0/229 (11) | 0/229 (11) | 0/229 (11) |
| Stagione · Coppe | 0/31 (11) | 0/31 (11) | 0/31 (11) | 0/31 (11) | 0/31 (11) |
| Club | 0/86 (11) | 0/86 (11) | 0/86 (11) | 0/86 (11) | 0/86 (11) |
| Carriera · Profilo | 0/99 (11) | 0/99 (11) | 0/99 (11) | 0/99 (11) | 0/99 (11) |
| Carriera · Nazionale | 0/97 (11) | 0/97 (11) | 0/97 (11) | 0/97 (11) | 0/97 (11) |
| Agente | 0/94 (11) | 0/94 (11) | 0/94 (11) | 0/94 (11) | 0/94 (11) |
| Ufficio | 0/140 (11) | 0/140 (11) | 0/140 (11) | 0/140 (11) | 0/140 (11) |
| **TOTALE** | **0/1745** | **0/1745** | **0/1745** | **0/1745** | **0/1745** |

### 3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/18 | 0/18 | 0/18 | 0/18 | 0/18 |
| Impostazioni | 0/20 | 0/20 | 0/20 | 0/20 | 0/20 |
| Creazione | 0/563 | 0/563 | 0/563 | 0/563 | 0/563 |
| Offerte | 0/32 | 0/32 | 0/32 | 0/32 | 0/32 |
| Dashboard | 0/95 | 0/95 | 0/95 | 0/95 | 0/95 |
| Stagione · Classifica | 0/241 | 0/241 | 0/241 | 0/241 | 0/241 |
| Stagione · Calendario | 0/229 | 0/229 | 0/229 | 0/229 | 0/229 |
| Stagione · Coppe | 0/31 | 0/31 | 0/31 | 0/31 | 0/31 |
| Club | 0/86 | 0/86 | 0/86 | 0/86 | 0/86 |
| Carriera · Profilo | 0/99 | 0/99 | 0/99 | 0/99 | 0/99 |
| Carriera · Nazionale | 0/97 | 0/97 | 0/97 | 0/97 | 0/97 |
| Agente | 0/94 | 0/94 | 0/94 | 0/94 | 0/94 |
| Ufficio | 0/140 | 0/140 | 0/140 | 0/140 | 0/140 |
| **TOTALE** | **0/1745** | **0/1745** | **0/1745** | **0/1745** | **0/1745** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/8 (5 · 5) | 0/8 (5 · 5) | 0/8 (5 · 5) | 0/8 (5 · 5) | 0/8 (5 · 5) |
| Impostazioni | 0/15 (0 · 5) | 0/15 (0 · 5) | 0/15 (0 · 5) | 0/15 (0 · 5) | 0/15 (0 · 5) |
| Creazione | 0/804 (1 · 10) | 0/804 (1 · 10) | 0/804 (1 · 10) | 0/804 (1 · 10) | 0/804 (1 · 10) |
| Offerte | 0/29 (0 · 6) | 0/29 (0 · 6) | 0/29 (0 · 6) | 0/29 (0 · 6) | 0/29 (0 · 6) |
| Dashboard | 0/71 (2 · 23) | 0/71 (2 · 23) | 0/71 (2 · 23) | 0/71 (2 · 23) | 0/71 (2 · 23) |
| Stagione · Classifica | 0/240 (0 · 20) | 0/240 (0 · 20) | 0/240 (0 · 20) | 0/240 (0 · 20) | 0/240 (0 · 20) |
| Stagione · Calendario | 0/207 (0 · 31) | 0/207 (0 · 31) | 0/207 (0 · 31) | 0/207 (0 · 31) | 0/207 (0 · 31) |
| Stagione · Coppe | 0/25 (0 · 7) | 0/25 (0 · 7) | 0/25 (0 · 7) | 0/25 (0 · 7) | 0/25 (0 · 7) |
| Club | 0/68 (0 · 20) | 0/68 (0 · 20) | 0/68 (0 · 20) | 0/68 (0 · 20) | 0/68 (0 · 20) |
| Carriera · Profilo | 0/68 (16 · 16) | 0/68 (16 · 16) | 0/68 (16 · 16) | 0/68 (16 · 16) | 0/68 (16 · 16) |
| Carriera · Nazionale | 0/63 (18 · 17) | 0/63 (18 · 17) | 0/63 (18 · 17) | 0/63 (18 · 17) | 0/63 (18 · 17) |
| Agente | 0/76 (0 · 19) | 0/76 (0 · 19) | 0/76 (0 · 19) | 0/76 (0 · 19) | 0/76 (0 · 19) |
| Ufficio | 0/110 (0 · 31) | 0/110 (0 · 31) | 0/110 (0 · 31) | 0/110 (0 · 31) | 0/110 (0 · 31) |
| **TOTALE** | **0/1784** | **0/1784** | **0/1784** | **0/1784** | **0/1784** |

### 5 · Bottoni pieni di marca (una sola azione primaria per vista)

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

### 5-bis · QUANTO E' LUNGA — altezza dello scorritore in px (fra parentesi: schermate da 915 px del PO)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Impostazioni | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Creazione | 1174 (1.28) | 1174 (1.28) | 1174 (1.28) | 1174 (1.28) | 1174 (1.28) |
| Offerte | 800 (0.87) | 667 (0.73) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Dashboard | 1940 (2.12) | 1927 (2.11) | 1927 (2.11) | 1927 (2.11) | 1911 (2.09) |
| Stagione · Classifica | 1305 (1.43) | 1305 (1.43) | 1305 (1.43) | 1305 (1.43) | 1305 (1.43) |
| Stagione · Calendario | 1374 (1.5) | 1361 (1.49) | 1361 (1.49) | 1361 (1.49) | 1361 (1.49) |
| Stagione · Coppe | 800 (0.87) | 745 (0.81) | 844 (0.92) | 915 (1) | 932 (1.02) |
| Club | 1266 (1.38) | 1221 (1.33) | 1221 (1.33) | 1208 (1.32) | 1208 (1.32) |
| Carriera · Profilo | 1794 (1.96) | 1782 (1.95) | 1782 (1.95) | 1782 (1.95) | 1782 (1.95) |
| Carriera · Nazionale | 1078 (1.18) | 1078 (1.18) | 1065 (1.16) | 1065 (1.16) | 1065 (1.16) |
| Agente | 1590 (1.74) | 1543 (1.69) | 1543 (1.69) | 1543 (1.69) | 1495 (1.63) |
| Ufficio | 1618 (1.77) | 1558 (1.7) | 1558 (1.7) | 1506 (1.65) | 1468 (1.6) |

> Lo scorritore misurato a 412 px, schermata per schermata: Home fuori carriera `documento` · Impostazioni `documento` · Creazione `div#root>div.cpm-root>div.cpm-scroll` · Offerte `documento` · Dashboard `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Classifica `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Calendario `div#root>div.cpm-root>div.cpm-scroll` · Stagione · Coppe `documento` · Club `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Profilo `div#root>div.cpm-root>div.cpm-scroll` · Carriera · Nazionale `div#root>div.cpm-root>div.cpm-scroll` · Agente `div#root>div.cpm-root>div.cpm-scroll` · Ufficio `div#root>div.cpm-root>div.cpm-scroll`

### 6 · Censimento del reso — TINTE DI TESTO diverse

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 3 | 3 | 3 | 3 | 3 |
| Impostazioni | 4 | 4 | 4 | 4 | 4 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 3 | 3 | 3 | 3 | 3 |
| Dashboard | 11 | 11 | 11 | 11 | 11 |
| Stagione · Classifica | 8 | 8 | 8 | 8 | 8 |
| Stagione · Calendario | 9 | 9 | 9 | 9 | 9 |
| Stagione · Coppe | 4 | 4 | 4 | 4 | 4 |
| Club | 7 | 7 | 7 | 7 | 7 |
| Carriera · Profilo | 10 | 10 | 10 | 10 | 10 |
| Carriera · Nazionale | 8 | 8 | 8 | 8 | 8 |
| Agente | 8 | 8 | 8 | 8 | 8 |
| Ufficio | 8 | 8 | 8 | 8 | 8 |

### 7 · Censimento del reso — FONDI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 3 | 3 | 3 | 3 | 3 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 5 | 5 | 5 | 5 | 5 |
| Dashboard | 4 | 4 | 4 | 4 | 4 |
| Stagione · Classifica | 12 | 12 | 12 | 12 | 12 |
| Stagione · Calendario | 8 | 8 | 8 | 8 | 8 |
| Stagione · Coppe | 4 | 4 | 4 | 4 | 4 |
| Club | 5 | 5 | 5 | 5 | 5 |
| Carriera · Profilo | 5 | 5 | 5 | 5 | 5 |
| Carriera · Nazionale | 6 | 6 | 6 | 6 | 6 |
| Agente | 5 | 5 | 5 | 5 | 5 |
| Ufficio | 4 | 4 | 4 | 4 | 4 |

### 8 · Censimento del reso — CORPI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 4 | 4 | 4 | 4 | 4 |
| Impostazioni | 4 | 4 | 4 | 4 | 4 |
| Creazione | 6 | 6 | 6 | 6 | 6 |
| Offerte | 4 | 4 | 4 | 4 | 4 |
| Dashboard | 7 | 7 | 7 | 7 | 7 |
| Stagione · Classifica | 6 | 6 | 6 | 6 | 6 |
| Stagione · Calendario | 4 | 4 | 4 | 4 | 4 |
| Stagione · Coppe | 5 | 5 | 5 | 5 | 5 |
| Club | 6 | 6 | 6 | 6 | 6 |
| Carriera · Profilo | 6 | 6 | 6 | 6 | 6 |
| Carriera · Nazionale | 3 | 3 | 3 | 3 | 3 |
| Agente | 6 | 6 | 6 | 6 | 6 |
| Ufficio | 4 | 4 | 4 | 4 | 4 |

### 9 · Censimento del reso — RAGGI diversi

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 5 | 5 | 5 | 5 | 5 |
| Impostazioni | 3 | 3 | 3 | 3 | 3 |
| Creazione | 4 | 4 | 4 | 4 | 4 |
| Offerte | 2 | 2 | 2 | 2 | 2 |
| Dashboard | 6 | 6 | 7 | 7 | 7 |
| Stagione · Classifica | 5 | 5 | 6 | 6 | 6 |
| Stagione · Calendario | 4 | 4 | 5 | 5 | 5 |
| Stagione · Coppe | 4 | 4 | 5 | 5 | 5 |
| Club | 6 | 6 | 6 | 6 | 6 |
| Carriera · Profilo | 8 | 8 | 8 | 8 | 8 |
| Carriera · Nazionale | 5 | 5 | 6 | 6 | 6 |
| Agente | 4 | 4 | 5 | 5 | 5 |
| Ufficio | 5 | 5 | 6 | 6 | 6 |

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
| Home fuori carriera | 1 | 1 | 1 | 1 | 1 |
| Impostazioni | 2 | 2 | 2 | 2 | 2 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 1 | 1 | 1 | 1 | 1 |
| Dashboard | 1 | 1 | 1 | 1 | 1 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 1 | 1 | 1 | 1 | 1 |
| Stagione · Coppe | 1 | 1 | 1 | 1 | 1 |
| Club | 1 | 1 | 1 | 1 | 1 |
| Carriera · Profilo | 1 | 1 | 1 | 1 | 1 |
| Carriera · Nazionale | 1 | 1 | 1 | 1 | 1 |
| Agente | 1 | 1 | 1 | 1 | 1 |
| Ufficio | 1 | 1 | 1 | 1 | 1 |
| **TOTALE** | **14** | **14** | **14** | **14** | **14** |

> [22/09] Il PO ha segnalato in pochi minuti sette schermate come «disomogenee» o «fuori standard».
> Non sono sette difetti: sono superfici rimaste SCURE quando il tema scuro e' stato ritirato (7.947).
> Qui si contano e si nominano, cosi' la famiglia si chiude con una misura invece che un rilievo per volta.

| schermata | alt. px | luminanza | fondo | selettore | testo |
|---|---:|---:|---|---|---|
| Home fuori carriera | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Impostazioni | 73 | 0.013 | `#1a1e27` | `div.cpm-root>div:nth-child(1)>div:nth-child(1)` | ⚙️ Opzioni✕ |
|  | 842 | 0.005 | `#0d0f14` | `div.cpm-root>div:nth-child(1)>div:nth-child(2)` | 🎧 Audio🔇 Silenzia tutto🏟️ Audio |
| Creazione | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Offerte | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Dashboard | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Stagione · Classifica | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Stagione · Calendario | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Stagione · Coppe | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Club | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Carriera · Profilo | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Carriera · Nazionale | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Agente | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |
| Ufficio | 915 | 0.005 | `#0d0f14` | `div#root>div.cpm-root` | *{box-sizing:border-box;} @keyfram |

### 9-ter · ALTEZZA delle strisce di fondo — voce di menu' / sostieni / idee (px)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 |
| Impostazioni | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 | 56 / 0 / 0 |
| Creazione | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Offerte | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Dashboard | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Stagione · Classifica | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Stagione · Calendario | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Stagione · Coppe | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Club | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Carriera · Profilo | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Carriera · Nazionale | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Agente | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |
| Ufficio | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 | 58 / 26 / 26 |

> La voce di menu' e' un bersaglio per il dito: la soglia consigliata per il tocco e' **44 px**.
> Le due strisce di servizio sono un invito, non un comando, e possono stare piu' basse.

### 9-bis · EMOJI rese (il provino approvato dal PO non ne ha nessuna)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 6 | 6 | 6 | 6 | 6 |
| Impostazioni | 9 | 9 | 9 | 9 | 9 |
| Creazione | 5 | 5 | 5 | 5 | 5 |
| Offerte | 0 | 0 | 0 | 0 | 0 |
| Dashboard | 10 | 10 | 10 | 10 | 10 |
| Stagione · Classifica | 8 | 8 | 8 | 8 | 8 |
| Stagione · Calendario | 31 | 31 | 31 | 31 | 31 |
| Stagione · Coppe | 9 | 9 | 9 | 9 | 9 |
| Club | 10 | 10 | 10 | 10 | 10 |
| Carriera · Profilo | 4 | 4 | 4 | 4 | 4 |
| Carriera · Nazionale | 13 | 13 | 13 | 13 | 13 |
| Agente | 12 | 12 | 12 | 12 | 12 |
| Ufficio | 17 | 17 | 17 | 17 | 17 |
| **TOTALE** | **134** | **134** | **134** | **134** | **134** |

> Contati i CARATTERI emoji sul testo reso. Il provino (`docs/collaudo-grafico/proposta-schermate/`)
> non ne usa **nessuna**: i cappelli sono etichetta maiuscoletta + filo + azione, la barra in basso
> e' solo testo. Questo numero e' la distanza fra il gioco e la direzione approvata.

| schermata | primi testi con emoji |
|---|---|
| Home fuori carriera | `Si scende in campo! ⚽` · `⚽` · `ℹ️` · `🏠` · `🎬` · `📂` |
| Impostazioni | `⚙️ Opzioni` · `🎧 Audio` · `🔇 Silenzia tutto` · `🏟️ Audio partite` · `✨ Effetti sonori` · `📣 Pubblico` |
| Creazione | `Si scende in campo! ⚽` · `👤 Identità` · `🗺️ Percorso` · `📋 Percorso carriera` · `⭐ Club dei sogni (facoltativo)` · `⚡ Modalità Sfida (facoltativa:` |
| Offerte | `Si scende in campo! ⚽` |
| Dashboard | `Si scende in campo! ⚽` · `⚡ Vivi la Settimana` · `🤝` · `⭐` · `🎁` · `🌱 Il ragazzo della Primavera` |
| Stagione · Classifica | `Si scende in campo! ⚽` · `📊` · `📅` · `🏆` · `🏆 Campione (promossa)` · `⬆ Promosse (2-3)` |
| Stagione · Calendario | `Si scende in campo! ⚽` · `📊` · `📅` · `🏆` · `⚽` · `V vinta · N pareggio · P persa` |
| Stagione · Coppe | `Si scende in campo! ⚽` · `📊` · `📅` · `🏆` · `⭐` · `🌍` |
| Club | `Si scende in campo! ⚽` · `🏛️` · `🧣` · `🩺 Dr.` · `(medico sociale) · 📋` · `✨ Forma e morale` |
| Carriera · Profilo | `Si scende in campo! ⚽` · `👤` · `🌍` · `☕ Sostieni il progetto` · `💡 Idee e feedback` |
| Carriera · Nazionale | `Si scende in campo! ⚽` · `👤` · `🌍` · `⚽` · `📊` · `🎽` |
| Agente | `Si scende in campo! ⚽` · `📣` · `🤵 Obiettivo della stagione` · `✂️ Licenzia il procuratore` · `🔴 Chiuso` · `⚠️` |
| Ufficio | `Si scende in campo! ⚽` · `🏋️` · `🏃` · `🧠` · `🏫` · `🏡` |

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
| Stagione |  |  |  |  | 4 | 1 | 2 | 3 | 3 | 4 | 7 | 7 | 3 | **9** |
| Settimana |  |  |  |  | 4 |  | 1 | 2 | 1 |  | 5 | 5 | 8 | **7** |
| Gol |  |  |  | 1 | 2 | 2 | 1 |  |  | 4 | 3 |  |  | **6** |
| Fiducia |  |  |  |  | 1 |  |  |  | 2 | 1 | 1 | 1 | 4 | **6** |
| Partite |  | 1 |  |  | 2 |  | 3 |  |  |  | 1 |  | 1 | **5** |
| Presenze |  |  |  |  |  |  |  | 1 |  | 3 | 6 |  |  | **3** |
| Morale |  |  |  |  | 1 |  |  |  | 3 |  |  |  | 4 | **3** |
| Assist |  |  |  | 1 | 2 |  |  |  |  | 3 |  |  |  | **3** |
| Contratto |  |  |  |  |  |  |  |  | 1 | 1 |  | 4 |  | **3** |
| Forma |  |  |  |  | 1 |  |  |  | 3 |  |  |  | 1 | **3** |
| Valore |  |  |  |  |  |  |  |  |  | 1 |  | 1 | 1 | **3** |
| Fatica |  |  |  |  | 1 |  |  |  |  |  |  |  | 3 | **2** |
| Obiettivi |  |  | 1 |  | 2 |  |  |  |  |  |  |  |  | **2** |
| Trofei |  |  |  |  |  |  |  |  |  | 2 |  |  |  | **1** |
| Stipendio |  |  |  |  |  |  |  |  |  |  |  | 2 |  | **1** |
| Media voto |  |  |  |  | 1 |  |  |  |  |  |  |  |  | **1** |
| Punti |  |  |  |  |  | 1 |  |  |  |  |  |  |  | **1** |

## Dettaglio · DOVE STANNO I PIXEL nelle schermate lunghe (a 412 px)

> [21/09 · rilievo PO «il tab carriera e' lunghissimo»] Sapere che una schermata e' lunga non dice
> quale pezzo la allunga. Qui i blocchi di primo livello dello scorritore, dal piu' alto, con la
> quota sul totale e il testo che portano. Solo sopra le due schermate: sotto non c'e' niente da accorciare.

| schermata | blocco | px | quota | testo |
|---|---:|---:|---:|---|
| Dashboard (1927 px) | 1 | 197 | 10.2 % | 86ATTGrafica ProbeItalia · Attaccante · 28 |
|  | 2 | 179 | 9.3 % | Stagione 12 · Settimana 11 di 3810Partite1 |
|  | 3 | 171 | 8.9 % | Lo spogliatoio🎁Claudio Milani ti deve una |
|  | 4 | 139 | 7.2 % | Obiettivi personali›✅ Batti il tuo record: |
|  | 5 | 117 | 6 % | 0AvanzaEscIndietroSpcConferma☕ Sostieni il |
|  | 6 | 95 | 4.9 % | SALFC SalernumLega B · St. 12 · Sett. 11/3 |
|  | 7 | 77 | 4 % | 🤝78/100Fiducia del mister⭐64/100Popolarit |
|  | 8 | 71 | 3.7 % | Adesso guardano te› |
|  | 9 | 71 | 3.7 % | Il mondo fuori› |
|  | 10 | 68 | 3.5 % | ⚡ Vivi la Settimanaallenamento, eventi e c |
|  | 11 | 62 | 3.2 % | Il progetto del club› |
|  | 12 | 62 | 3.2 % | Sponsor› |

## 9-quinquies · I CARATTERI RESI (a 412 px, la taglia del PO)

> [G9 · 22/09, collaudo PO «la schermata iniziale e' rimasta completamente fuori standard»] Il provino
> approvato ha UN carattere vero, **Barlow** (+ **Barlow Condensed** per i numerali incolonnati). Una
> schermata che ne rende altri e' fuori standard per costruzione — e finora nessun numero lo diceva:
> si guardava il contrasto, il corpo, il raggio, mai la FAMIGLIA. Qui c'e' la prima famiglia della
> `font-family` calcolata, cioe' quella che il browser usa davvero, con quanti nodi la portano.

| schermata | famiglie | dettaglio (famiglia x nodi) |
|---|---:|---|
| Home fuori carriera | 1 | Barlow x8 |
| Impostazioni | 1 | Barlow x15 |
| Creazione | 2 | Barlow x802 · Barlow Condensed x2 |
| Offerte | 1 | Barlow x29 |
| Dashboard | 2 | Barlow x56 · Barlow Condensed x15 |
| Stagione · Classifica | 2 | Barlow x226 · Barlow Condensed x14 |
| Stagione · Calendario | 2 | Barlow x199 · Barlow Condensed x8 |
| Stagione · Coppe | 2 | Barlow x17 · Barlow Condensed x8 |
| Club | 2 | Barlow x57 · Barlow Condensed x11 |
| Carriera · Profilo | 2 | Barlow x56 · Barlow Condensed x12 |
| Carriera · Nazionale | 2 | Barlow x56 · Barlow Condensed x7 |
| Agente | 2 | Barlow x68 · Barlow Condensed x8 |
| Ufficio | 2 | Barlow x101 · Barlow Condensed x9 |

## 9-octies · I CORPI, UNO PER UNO, COL NODO CHE LI PORTA (a 412 px)

> [G13 · 22/09] Stessa lezione delle tinte e del pavimento (G8.8): un elenco di numeri non fa
> trovare il nodo. Qui ogni corpo reso, con quanti nodi lo portano e un esempio — cosi' un corpo
> fuori scala si va a prendere invece di cercarlo a mano nel sorgente.

| schermata | corpi | dettaglio (px x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 4 | **11** x4 (Home) · **12** x1 (Crea il tuo ) · **13** x2 (ℹ️) · **15** x1 (Nuova carrie) |
| Impostazioni | 4 | **11** x7 (🎧 Audio) · **12** x6 (🔇 Silenzia ) · **13** x1 (Informativa ) · **15** x1 (⚙️ Opzioni) |
| Creazione | 6 | **11** x289 (Nuova carrie) · **12** x259 (ATTACCANTE) · **13** x1 (← Home) · **15** x1 (Inizia i pro) · **17** x1 (NOME) · **32** x1 (Crea il tuo ) |
| Offerte | 4 | **11** x12 (Primavera 1) · **12** x7 (3) · **13** x6 (Torino Athle) · **17** x1 (Offerte rice) |
| Dashboard | 7 | **11** x37 (Lega B · St.) · **12** x5 (Italia · Att) · **13** x16 (Il gruppo pr) · **15** x3 (78) · **17** x2 (FC Salernum) · **20** x3 (⚡ Vivi la Se) · **32** x4 (10) |
| Stagione · Classifica | 6 | **11** x37 (Lega B · St.) · **12** x161 (Classifica) · **13** x20 (34) · **17** x1 (FC Salernum) · **20** x1 (−13 dalla ve) · **32** x1 (Classifica) |
| Stagione · Calendario | 4 | **11** x177 (Lega B · St.) · **12** x19 (Classifica) · **17** x1 (FC Salernum) · **32** x1 (Calendario) |
| Stagione · Coppe | 5 | **11** x15 (Lega B · St.) · **12** x6 (Classifica) · **13** x1 (Nessuna copp) · **17** x1 (FC Salernum) · **32** x1 (Coppe) |
| Club | 6 | **11** x45 (Lega B · St.) · **12** x16 (Lega B) · **15** x2 (78) · **17** x1 (FC Salernum) · **24** x1 (FC Salernum) · **32** x1 (45) |
| Carriera · Profilo | 6 | **11** x51 (Lega B · St.) · **12** x3 (Profilo) · **13** x1 (28 anni · FC) · **17** x7 (FC Salernum) · **24** x1 (Grafica Prob) · **32** x4 (150) |
| Carriera · Nazionale | 3 | **11** x50 (Lega B · St.) · **12** x11 (Profilo) · **17** x1 (FC Salernum) |
| Agente | 6 | **11** x55 (Lega B · St.) · **12** x9 (Andrea Turat) · **13** x8 (Andrea Turat) · **15** x1 (€45 mln) · **17** x1 (FC Salernum) · **32** x1 (Agente) |
| Ufficio | 4 | **11** x106 (Lega B · St.) · **17** x1 (FC Salernum) · **32** x1 (Ufficio) · **44** x1 (€4,56 mln) |

## 9-septies · LE TINTE DEL TESTO, UNA PER UNA (a 412 px, la taglia del PO)

> [G14 · 22/09] Il conteggio dice che la Dashboard rende quattordici tinte contro le cinque del
> provino, ma non dice QUALI — e la differenza e' tutta li': una tinta **semantica** (vittoria,
> sconfitta, allarme) e' un'informazione e deve restare; un grigio nato per sbaglio e' debito.
> Qui ogni tinta col numero di nodi e un esempio, in ordine di diffusione.

| schermata | tinte | dettaglio (tinta x nodi · esempio) |
|---|---:|---|
| Home fuori carriera | 3 | `#9aa3b2` x4 (Crea il tuo ca) · `#0d0f14` x2 (Nuova carriera) · `#f4f1ea` x2 (ℹ️) |
| Impostazioni | 4 | `#f4f1ea` x7 (⚙️ Opzioni) · `#8f98a8` x5 (85) · `#9aa3b2` x2 (🎧 Audio) · `#e8b44a` x1 (Informativa su) |
| Creazione | 6 | `#ffffff` x260 (CFM) · `#f4f1ea` x258 (Crea il tuo ca) · `#8f98a8` x255 (← Home) · `#9aa3b2` x20 (187 cm · 80 kg) · `#e8b44a` x9 (📋 Percorso ca) · `#0d0f14` x2 (Inizia i provi) |
| Offerte | 3 | `#9aa3b2` x19 (3) · `#f4f1ea` x9 (TAT) · `#0d0f14` x1 (Scegli →) |
| Dashboard | 11 | `#f4f1ea` x28 (10) · `#9aa3b2` x22 (Italia · Attac) · `#8f98a8` x7 (Stagione) · `#e8b44a` x4 (7,4) · `#0d0f14` x2 (⚡ Vivi la Sett) · `#86efac` x2 (Batti il tuo r) · `#4ade80` x2 (FATTO) · `#47484a` x1 (allenamento, e) · `#b7707d` x1 (78) · `#a78bfa` x1 (64) · `#d97706` x1 (Nel pieno dell) |
| Stagione · Classifica | 8 | `#9aa3b2` x100 (Calendario) · `#f4f1ea` x62 (Classifica) · `#4ade80` x27 (8) · `#f87171` x27 (1) · `#8f98a8` x9 (Club) · `#0d0f14` x8 (P) · `#e8b44a` x5 (SAL) · `#ffffff` x2 (3) |
| Stagione · Calendario | 9 | `#8f98a8` x75 (12) · `#9aa3b2` x39 (Classifica) · `#f4f1ea` x33 (Calendario) · `#fcd34d` x25 (2) · `#86efac` x20 (1) · `#e8b44a` x5 (Calendario) · `#fca5a5` x5 (6) · `#4ade80` x4 (Casa) · `#0d0f14` x1 (Stagione) |
| Stagione · Coppe | 4 | `#9aa3b2` x14 (Classifica) · `#f4f1ea` x8 (Coppe) · `#e8b44a` x2 (Coppe) · `#0d0f14` x1 (Stagione) |
| Club | 7 | `#f4f1ea` x27 (SAL) · `#ffffff` x15 (45) · `#9aa3b2` x14 (Fiducia del mi) · `#8f98a8` x8 (24) · `#e8b44a` x2 (Procuratore ›) · `#4ade80` x1 (72/100) · `#0d0f14` x1 (Club) |
| Carriera · Profilo | 10 | `#9aa3b2` x22 (28 anni · FC S) · `#f4f1ea` x21 (150) · `#8f98a8` x13 (6) · `#e8b44a` x4 (3) · `#fbbf24` x2 (14) · `#b7707d` x2 (6) · `#16a34a` x1 (Titolare) · `#60a5fa` x1 (10) · `#4ade80` x1 (€45 mln) · `#0d0f14` x1 (Carriera) |
| Carriera · Nazionale | 8 | `#9aa3b2` x26 (Profilo) · `#8f98a8` x16 (Ordine del CT:) · `#f4f1ea` x13 (SAL) · `#e8b44a` x2 (Nazionale) · `#fcd34d` x2 (1) · `#7d97ca` x2 (Grafica Probe) · `#ffffff` x1 (Questa stagion) · `#0d0f14` x1 (Carriera) |
| Agente | 8 | `#9aa3b2` x40 (Contratto tras) · `#f4f1ea` x23 (Agente) · `#fca5a5` x4 (Fine stagione) · `#8f98a8` x3 (Assegna «) · `#e8b44a` x2 (€45 mln) · `#86efac` x2 (€6 mln) · `#fbbf24` x1 (1 stagione) · `#0d0f14` x1 (Agente) |
| Ufficio | 8 | `#f4f1ea` x45 (€4,56 mln) · `#9aa3b2` x45 (Lega B · St. 1) · `#e8b44a` x9 (FONDA →) · `#0d0f14` x4 (generale) · `#4ade80` x2 (★ consigliato) · `#86efac` x2 (sobrio) · `#fcd34d` x2 (vistoso) · `#8f98a8` x1 (· morale e fid) |

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
| Dashboard | 0 | — | — |
| Stagione · Classifica | 0 | — | — |
| Stagione · Calendario | 0 | — | — |
| Stagione · Coppe | 0 | — | — |
| Club | 3 | 0.8 % | giocatore x3 |
| Carriera · Profilo | 0 | — | — |
| Carriera · Nazionale | 0 | — | — |
| Agente | 1 | 0.8 % | procuratore x1 |
| Ufficio | 0 | — | — |

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
| Home fuori carriera | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 3 | `div.cpm-nav-tabs>button:nth-child(2)>div:nth-child(2)` | Rivedi intro |
| Home fuori carriera | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 12 / 400 | 1 | `div.cpm-piena>div:nth-child(3)>p:nth-child(1)` | Crea il tuo calciatore, su |
| Home fuori carriera | 12.55:1 | 4.5:1 | `#f4f1ea` su `#262b37` | 13 / 400 | 2 | `div:nth-child(4)>button.cpm-press.cpm-focus>span:nth-child(1)` | ℹ️ |
| Home fuori carriera | 16.99:1 | 3:1 | `#0d0f14` su `#f4f1ea` | 15 / 700 | 1 | `div.cpm-piena>div.cpm-slots>button.cpm-press.cpm-focus` | Nuova carriera |
| Home fuori carriera | 16.99:1 | 4.5:1 | `#0d0f14` su `#f4f1ea` | 11 / 400 | 1 | `div.cpm-nav-tabs>button.cpm-tab-act>div:nth-child(2)` | Home |
| Impostazioni | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(2)>span.cpm-num` | 85 |
| Impostazioni | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 700 | 2 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | 🎧 Audio |
| Impostazioni | 6.59:1 | 4.5:1 | `#8f98a8` su `#0d0f14` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(3)` | Le impostazioni si salvano |
| Impostazioni | 8.78:1 | 4.5:1 | `#e8b44a` su `#1a1e27` | 13 / 700 | 1 | `div:nth-child(2)>div:nth-child(2)>a.cpm-press.cpm-focus` | Informativa sulla privacy |
| Impostazioni | 14.79:1 | 4.5:1 | `#f4f1ea` su `#1a1e27` | 12 / 600 | 6 | `div:nth-child(1)>div:nth-child(2)>span:nth-child(1)` | 🔇 Silenzia tutto |
| Creazione | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 700 | 2 | `div.cpm-create>div:nth-child(1)>div:nth-child(1)` | 👤 Identità |
| Creazione | 6.17:1 | 4.5:1 | `#9aa3b2` su `#16233b` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(2)>div:nth-child(2)` | 3 provini → offerte dalle  |
| Creazione | 6.34:1 | 4.5:1 | `#8f98a8` su `#11141b` | 11 / 400 | 252 | `div:nth-child(2)>button:nth-child(1)>span:nth-child(3)` | Liga Ibérica |
| Creazione | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 9 | `div:nth-child(1)>div:nth-child(3)>label:nth-child(1)` | Aspetto calciatore |
| Creazione | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 12 / 600 | 1 | `div:nth-child(1)>div:nth-child(4)>div.cpm-num` | 187 cm · 80 kg |
| Offerte | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 8 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Primavera 1 |
| Offerte | 6.69:1 | 4.5:1 | `#9aa3b2` su `#2a1620` | 11 / 400 | 4 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Primavera 1 |
| Offerte | 7.54:1 | 4.5:1 | `#9aa3b2` su `#0d0f14` | 12 / 400 | 7 | `div.cpm-piena>div:nth-child(1)>p:nth-child(3)` | 3 |
| Offerte | 12.55:1 | 4.5:1 | `#f4f1ea` su `#262b37` | 13 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Scegli → |
| Offerte | 14.79:1 | 3:1 | `#f4f1ea` su `#1a1e27` | 27 / 900 | 2 | `div:nth-child(1)>svg:nth-child(1)>text:nth-child(3)` | VAL |
| Dashboard | 4.47:1 | 3:1 | `#b7707d` su `#1a1e27` | 20 / 800 | 1 | `div:nth-child(1)>div:nth-child(1)>span.cpm-num` | 78 |
| Dashboard | 5.24:1 | 4.5:1 | `#d97706` su `#1a1e27` | 12 / 700 | 1 | `div:nth-child(15)>div:nth-child(1)>span:nth-child(2)` | Nel pieno della carriera |
| Dashboard | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 700 | 3 | `div:nth-child(3)>div:nth-child(1)>div:nth-child(1)` | Stagione |
| Dashboard | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 600 | 2 | `div:nth-child(1)>span.cpm-num>span:nth-child(1)` | /100 |
| Dashboard | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 2 | `div:nth-child(15)>div:nth-child(1)>span.cpm-num` | 28 |
| Stagione · Classifica | 5.02:1 | 4.5:1 | `#ffffff` su `#b45309` | 11 / 800 | 1 | `tr:nth-child(3)>td:nth-child(2)>span.cpm-num` | 3 |
| Stagione · Classifica | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 700 | 9 | `thead:nth-child(1)>tr:nth-child(1)>th:nth-child(3)` | Club |
| Stagione · Classifica | 6.03:1 | 4.5:1 | `#f87171` su `#1a1e27` | 12 / 400 | 13 | `tbody:nth-child(2)>tr:nth-child(1)>td:nth-child(7)` | 1 |
| Stagione · Classifica | 6.31:1 | 4.5:1 | `#f87171` su `#161a22` | 12 / 400 | 2 | `tbody:nth-child(2)>tr:nth-child(14)>td:nth-child(7)` | 8 |
| Stagione · Classifica | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 12 / 400 | 43 | `tbody:nth-child(2)>tr:nth-child(1)>td:nth-child(4)` | 19 |
| Stagione · Calendario | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 600 | 48 | `div:nth-child(1)>div:nth-child(12)>div:nth-child(1)` | LAR |
| Stagione · Calendario | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 27 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(12)` | 12 |
| Stagione · Calendario | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 25 | `div:nth-child(2)>div:nth-child(2)>span:nth-child(2)` | 11ª giornata |
| Stagione · Calendario | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 5 | `div.cpm-nav-tabs>button:nth-child(1)>div:nth-child(1)` | Home |
| Stagione · Calendario | 7.24:1 | 4.5:1 | `#9aa3b2` su `#11141b` | 11 / 700 | 4 | `div:nth-child(2)>div:nth-child(2)>span:nth-child(1)` | Fuori |
| Stagione · Coppe | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 5 | `div.cpm-nav-tabs>button:nth-child(1)>div:nth-child(1)` | Home |
| Stagione · Coppe | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 1 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Le competizioni si aprono  |
| Stagione · Coppe | 7.24:1 | 4.5:1 | `#9aa3b2` su `#11141b` | 11 / 400 | 3 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Quest'anno non sei in gara |
| Stagione · Coppe | 7.24:1 | 4.5:1 | `#9aa3b2` su `#11141b` | 12 / 700 | 2 | `div.cpm-career>div.cpm-tabs40>button.cpm-focus` | Classifica |
| Stagione · Coppe | 7.54:1 | 4.5:1 | `#9aa3b2` su `#0d0f14` | 11 / 400 | 2 | `div.cpm-career>header:nth-child(1)>span.cpm-num` | Lega B · St. 12 · Sett. 11 |
| Club | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 6 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(2)` | ✨ Forma e morale |
| Club | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 700 | 2 | `div:nth-child(9)>button.cpm-press.cpm-t40>span.cpm-num` | 24 |
| Club | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 5 | `div.cpm-nav-tabs>button:nth-child(1)>div:nth-child(1)` | Home |
| Club | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 4 | `div:nth-child(2)>button.cpm-press.cpm-t40>span:nth-child(1)` | scade a fine stagione 13 ( |
| Club | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 12 / 600 | 2 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(2)` | Fiducia del mister |
| Carriera · Profilo | 4.94:1 | 3:1 | `#b7707d` su `#11141b` | 17 / 800 | 2 | `div:nth-child(1)>div:nth-child(2)>div.cpm-num` | 6 |
| Carriera · Profilo | 5.01:1 | 4.5:1 | `#16a34a` su `#0e231b` | 11 / 700 | 1 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(2)` | Titolare |
| Carriera · Profilo | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 700 | 7 | `div:nth-child(3)>button.cpm-press.cpm-t40>span.cpm-num` | 6 |
| Carriera · Profilo | 6.34:1 | 4.5:1 | `#8f98a8` su `#11141b` | 11 / 400 | 6 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Gol stagione |
| Carriera · Profilo | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 9 | `section:nth-child(1)>div:nth-child(1)>span:nth-child(2)` | Presenze |
| Carriera · Nazionale | 5.55:1 | 4.5:1 | `#7d97ca` su `#182032` | 12 / 900 | 2 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(2)` | Grafica Probe |
| Carriera · Nazionale | 5.60:1 | 4.5:1 | `#8f98a8` su `#182032` | 11 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>span.cpm-num` | 14 |
| Carriera · Nazionale | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 2 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(1)` | Ordine del CT: livello, go |
| Carriera · Nazionale | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 16 | `div:nth-child(2)>div:nth-child(1)>div:nth-child(3)` | Oggi la maglia numero 9 è  |
| Carriera · Nazionale | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 5 | `div.cpm-nav-tabs>button:nth-child(1)>div:nth-child(1)` | Home |
| Agente | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 3 | `div:nth-child(2)>div:nth-child(1)>button.cpm-press.cpm-focus` | Assegna « |
| Agente | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 10 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(2)` | Procuratore |
| Agente | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 5 | `div.cpm-nav-tabs>button:nth-child(1)>div:nth-child(1)` | Home |
| Agente | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 700 | 3 | `div:nth-child(1)>div:nth-child(2)>div:nth-child(2)` | Rapporto con |
| Agente | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 12 / 400 | 2 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(1)` | Contratto trascorso · scad |
| Ufficio | 5.74:1 | 4.5:1 | `#8f98a8` su `#1a1e27` | 11 / 400 | 1 | `div:nth-child(2)>div:nth-child(1)>span:nth-child(1)` | · morale e fiducia del mis |
| Ufficio | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 400 | 28 | `div:nth-child(1)>div:nth-child(1)>div:nth-child(1)` | Patrimonio: |
| Ufficio | 6.56:1 | 4.5:1 | `#9aa3b2` su `#1a1e27` | 11 / 600 | 14 | `div:nth-child(1)>span:nth-child(1)>span.cpm-num` | Livello |
| Ufficio | 7.54:1 | 4.5:1 | `#9aa3b2` su `#0d0f14` | 11 / 400 | 2 | `div.cpm-career>header:nth-child(1)>span.cpm-num` | Lega B · St. 12 · Sett. 11 |
| Ufficio | 7.54:1 | 4.5:1 | `#9aa3b2` su `#0d0f14` | 11 / 700 | 1 | `div:nth-child(1)>div:nth-child(1)>span:nth-child(1)` | Patrimonio e staff |

## Cosa NON e' stato misurato

- prepartita: playMatch → nomatch

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

