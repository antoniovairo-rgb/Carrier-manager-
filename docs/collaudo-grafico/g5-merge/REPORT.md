# G5 — Non regressione del metro grafico dopo il merge col motore

Build **7.890.0** (`GAME_VERSION` in `CARRIER-MANAGER-AV.html`; il campo `versione` dentro `dati.json`
resta **`?`** perché la sonda legge solo i primi 400 000 byte del file e `GAME_VERSION` oggi sta
all'offset ~538 000 — stesso comportamento già visto in `g0` e in `g28`, non è una regressione di
questa corsa) · HEAD `f8cb0b3` (merge dell'overhaul grafico G0→G4.1 nella linea del motore) ·
ramo `grafica/overhaul-2026-09` · sonda `tests/visual/griglia-mobile.mjs` · seme `4242`.

**Scopo.** G5 non è un nuovo intervento grafico: è la misura di controllo dopo che l'overhaul
G0-G4.1 è stato fuso (merge) nella linea del motore. Il compito è accertare, con gli stessi numeri
usati per tutto l'overhaul, che il merge non abbia fatto regredire nulla — non impressioni, numeri.

## Le tre corse

| # | comando | tema | larghezze | scatti | esito | cartella |
|---|---|---|---:|---|---|---|
| 1 | `CPM_OUT=… node tests/visual/griglia-mobile.mjs` | chiaro | 360·375·390·412·430 | no | **exit 0** | `chiaro/` |
| 2 | `CPM_TEMA=scuro CPM_OUT=… node tests/visual/griglia-mobile.mjs` | scuro | 360·375·390·412·430 | no | **exit 0** | `scuro/` |
| 3 | `CPM_TEMA=scuro CPM_LARG=412 CPM_FOTO=1 CPM_OUT=… node tests/visual/griglia-mobile.mjs` | scuro | 412 | sì (13 png) | **exit 0** | `scuro-412/` |

Le tre corse sono passate **al primo tentativo**, nessuna rilanciata. `saltate: []` ed `errori: []`
in tutti e tre i `dati.json`. Nessun elemento «fuori dallo schermo» (`nFuori`) a nessuna larghezza,
in nessun tema: la colonna 2 delle tabelle sotto è sempre `0 (…)`, dove il numero fra parentesi è
contenuto — cioè si legge scorrendo dentro un riquadro voluto, non sporge dalla pagina.

## 1 · Tabella riassuntiva — totali su tutte le schermate, per larghezza

| metrica | tema | 360 | 375 | 390 | 412 | 430 |
|---|---|---:|---:|---:|---:|---:|
| overflow (px) | chiaro | 0 | 0 | 0 | 0 | 0 |
| overflow (px) | scuro | 0 | 0 | 0 | 0 | 0 |
| fuori dallo schermo | chiaro | 0 | 0 | 0 | 0 | 0 |
| fuori dallo schermo | scuro | 0 | 0 | 0 | 0 | 0 |
| <10px sotto/tot | chiaro | 29/2781 | 29/2781 | 29/2781 | 29/2782 | 29/2782 |
| <10px sotto/tot | scuro | 29/2781 | 29/2781 | 29/2781 | 29/2782 | 29/2782 |
| contrasto sotto/mis | chiaro | 62/2309 | 62/2309 | 62/2309 | 62/2310 | 62/2310 |
| contrasto sotto/mis | scuro | 61/2309 | 61/2309 | 61/2309 | 61/2310 | 61/2310 |
| marca (bottoni pieni) | chiaro | 5 | 5 | 5 | 5 | 5 |
| marca (bottoni pieni) | scuro | 4 | 4 | 4 | 4 | 4 |

Le cinque larghezze danno numeri identici su testo e contrasto (atteso: nessuna `@media` di queste
schermate cambia corpo o colore sotto i 640 px — v. nota di metodo in `g0/REPORT.md`); l'unica
oscillazione è nel numero di nodi «misurati»/«totale» fra 412-430 px e 360-390 px (±1), dovuta
all'impaginazione che sposta un separatore di riga, non a un difetto nuovo.

## 2 · Dettaglio per schermata × larghezza

### Tema chiaro

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
| Home fuori carriera | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) |
| Impostazioni | 0/32 (10) | 0/32 (10) | 0/32 (10) | 0/32 (10) | 0/32 (10) |
| Creazione | 0/841 (10) | 0/841 (10) | 0/841 (10) | 0/841 (10) | 0/841 (10) |
| Offerte | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) |
| Dashboard | 10/197 (9) | 10/197 (9) | 10/197 (9) | 10/197 (9) | 10/197 (9) |
| Stagione · Classifica | 1/396 (9) | 1/396 (9) | 1/396 (9) | 1/397 (9) | 1/397 (9) |
| Stagione · Calendario | 11/324 (9) | 11/324 (9) | 11/324 (9) | 11/324 (9) | 11/324 (9) |
| Stagione · Coppe | 1/50 (9) | 1/50 (9) | 1/50 (9) | 1/50 (9) | 1/50 (9) |
| Club | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) |
| Carriera · Profilo | 2/314 (9) | 2/314 (9) | 2/314 (9) | 2/314 (9) | 2/314 (9) |
| Carriera · Nazionale | 1/116 (9) | 1/116 (9) | 1/116 (9) | 1/116 (9) | 1/116 (9) |
| Agente | 1/125 (9) | 1/125 (9) | 1/125 (9) | 1/125 (9) | 1/125 (9) |
| Prepartita | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) |
| **TOTALE** | **29/2781** | **29/2781** | **29/2781** | **29/2782** | **29/2782** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (esclusi per gradiente)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) |
| Impostazioni | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) |
| Creazione | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) |
| Offerte | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) |
| Dashboard | 3/122 (75) | 3/122 (75) | 3/122 (75) | 3/122 (75) | 3/122 (75) |
| Stagione · Classifica | 4/356 (40) | 4/356 (40) | 4/356 (40) | 4/357 (40) | 4/357 (40) |
| Stagione · Calendario | 1/284 (40) | 1/284 (40) | 1/284 (40) | 1/284 (40) | 1/284 (40) |
| Stagione · Coppe | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) |
| Club | 34/215 (65) | 34/215 (65) | 34/215 (65) | 34/215 (65) | 34/215 (65) |
| Carriera · Profilo | 20/236 (78) | 20/236 (78) | 20/236 (78) | 20/236 (78) | 20/236 (78) |
| Carriera · Nazionale | 0/61 (55) | 0/61 (55) | 0/61 (55) | 0/61 (55) | 0/61 (55) |
| Agente | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) |
| Prepartita | 0/22 (13) | 0/22 (13) | 0/22 (13) | 0/22 (13) | 0/22 (13) |
| **TOTALE** | **62/2309** | **62/2309** | **62/2309** | **62/2310** | **62/2310** |

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

### Tema scuro

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
| Home fuori carriera | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) |
| Impostazioni | 0/32 (10) | 0/32 (10) | 0/32 (10) | 0/32 (10) | 0/32 (10) |
| Creazione | 0/841 (10) | 0/841 (10) | 0/841 (10) | 0/841 (10) | 0/841 (10) |
| Offerte | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) |
| Dashboard | 10/197 (9) | 10/197 (9) | 10/197 (9) | 10/197 (9) | 10/197 (9) |
| Stagione · Classifica | 1/396 (9) | 1/396 (9) | 1/396 (9) | 1/397 (9) | 1/397 (9) |
| Stagione · Calendario | 11/324 (9) | 11/324 (9) | 11/324 (9) | 11/324 (9) | 11/324 (9) |
| Stagione · Coppe | 1/50 (9) | 1/50 (9) | 1/50 (9) | 1/50 (9) | 1/50 (9) |
| Club | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) | 2/280 (8.5) |
| Carriera · Profilo | 2/314 (9) | 2/314 (9) | 2/314 (9) | 2/314 (9) | 2/314 (9) |
| Carriera · Nazionale | 1/116 (9) | 1/116 (9) | 1/116 (9) | 1/116 (9) | 1/116 (9) |
| Agente | 1/125 (9) | 1/125 (9) | 1/125 (9) | 1/125 (9) | 1/125 (9) |
| Prepartita | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) |
| **TOTALE** | **29/2781** | **29/2781** | **29/2781** | **29/2782** | **29/2782** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (esclusi per gradiente)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) |
| Impostazioni | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) |
| Creazione | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) |
| Offerte | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) |
| Dashboard | 13/122 (75) | 13/122 (75) | 13/122 (75) | 13/122 (75) | 13/122 (75) |
| Stagione · Classifica | 4/356 (40) | 4/356 (40) | 4/356 (40) | 4/357 (40) | 4/357 (40) |
| Stagione · Calendario | 15/284 (40) | 15/284 (40) | 15/284 (40) | 15/284 (40) | 15/284 (40) |
| Stagione · Coppe | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) |
| Club | 10/215 (65) | 10/215 (65) | 10/215 (65) | 10/215 (65) | 10/215 (65) |
| Carriera · Profilo | 17/236 (78) | 17/236 (78) | 17/236 (78) | 17/236 (78) | 17/236 (78) |
| Carriera · Nazionale | 2/61 (55) | 2/61 (55) | 2/61 (55) | 2/61 (55) | 2/61 (55) |
| Agente | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) |
| Prepartita | 0/22 (13) | 0/22 (13) | 0/22 (13) | 0/22 (13) | 0/22 (13) |
| **TOTALE** | **61/2309** | **61/2309** | **61/2309** | **61/2310** | **61/2310** |

### 5 · Bottoni pieni di marca (una sola azione primaria per vista)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0 | 0 | 0 | 0 | 0 |
| Impostazioni | 0 | 0 | 0 | 0 | 0 |
| Creazione | 1 | 1 | 1 | 1 | 1 |
| Offerte | 1 | 1 | 1 | 1 | 1 |
| Dashboard | 0 | 0 | 0 | 0 | 0 |
| Stagione · Classifica | 1 | 1 | 1 | 1 | 1 |
| Stagione · Calendario | 0 | 0 | 0 | 0 | 0 |
| Stagione · Coppe | 0 | 0 | 0 | 0 | 0 |
| Club | 0 | 0 | 0 | 0 | 0 |
| Carriera · Profilo | 0 | 0 | 0 | 0 | 0 |
| Carriera · Nazionale | 0 | 0 | 0 | 0 | 0 |
| Agente | 0 | 0 | 0 | 0 | 0 |
| Prepartita | 1 | 1 | 1 | 1 | 1 |
| **TOTALE** | **4** | **4** | **4** | **4** | **4** |

(Dashboard passa da 1 bottone di marca in chiaro a 0 in scuro: nel tema scuro quel bottone non
soddisfa più il criterio «pieno di marca» della sonda — è un effetto del tema, non un difetto nuovo,
ed è comunque un numero più basso, non più alto.)

## 3 · Confronto con la base 7.888 (`g0`, prima dell'overhaul)

| metrica | base 7.888 (g0) | G5 chiaro | G5 scuro |
|---|---:|---:|---:|
| overflow (px, tutte le larghezze) | 0 | 0 | 0 |
| fuori dallo schermo | 0 | 0 | 0 |
| <10px sotto/tot (a 412px) | 463/2760 | **29/2782** | **29/2782** |
| contrasto sotto/mis (a 412px) | 917/2291 (chiaro) · 1000/2291 (scuro) | **62/2310** | **61/2310** |
| marca (bottoni pieni) | non misurato a G0 (metrica introdotta con G3.2) | 5 | 4 |

Il totale dei nodi cresce leggermente (2291→2310 misurati per il contrasto, 2760→2782 per il
testo) perché fra G0 e oggi sono stati aggiunti contenuti reali (es. Dashboard: 176→197 nodi di
testo) — non è un artefatto della sonda, è dichiarato nel confronto nodo-per-nodo con g0 fatto per
questa verifica. Nessuna singola schermata peggiora su nessun campo rispetto a g0: il confronto
(`overflowPx`, `nFuori`, `nPiccoli`, `minFs`, `nSotto`) sulle 13 schermate a 412px non trova un
solo valore in cui G5-chiaro sia peggiore di g0; tutte le variazioni sono verso lo zero o verso
soglie di leggibilità più alte (es. `minFs` passa da 7-9px a 8.5-10px).

## 4 · Confronto con l'ultima misura pre-merge (`g28`, 412px, chiaro)

Confronto campo per campo (`overflowPx`, `nFuori`, `nContenuti`, `nPiccoli`, `minFs`, `nTesto`,
`nMisurati`, `nSotto`, `nGradiente`, `nMarca`) fra `g28-sostieni/dati.json` e la corsa G5-chiaro,
sulle 13 schermate a 412px:

**Nessuna differenza su nessun campo, in nessuna delle 13 schermate.** I due `dati.json` sono
identici a 412px su tutti i valori numerici sopra elencati. La corsa `g27-partita` (stessa area di
lavoro, `CPM_PARTITA=1`) è più vecchia di `g28` nella sequenza e mostrava ancora bottoni di marca
non ridotti su Dashboard/Stagione/Club/Carriera/Agente (12 marca totali a 412px, contro i 5 di
g28): non è usata come riferimento di regressione — lo è `g28`, esplicitamente l'ultima misura
prima del merge — ma conferma che la riduzione dei bottoni di marca era già chiusa a `g28`, cioè
prima del merge, e non un effetto (voluto o accidentale) del merge stesso.

## 5 · Regressioni rispetto a `g28`

**Nessuna.** Overflow, elementi fuori schermo, testo sotto i 10px, contrasto WCAG e bottoni di
marca sono identici, campo per campo, schermata per schermata, a 412px chiaro, fra `g28` (ultima
misura pre-merge) e questa corsa (`f8cb0b3`, post-merge). Il merge del motore non ha toccato la
grafica.

## 6 · Non verificato

- **Il telefono vero del PO.** Questa è Chromium headless a 412×915 (e alle altre 4 larghezze),
  non un Android vero: restano fuori i font di sistema, il sub-pixel, il tocco, la GPU, le
  prestazioni, la barra di sistema e il ritaglio del notch.
- **Le schermate di partita.** HUD in gioco, telecronaca, highlight, scena 3D, fine partita e
  cerimonie non sono nel metro delle tre corse G5 (misurano solo le 13 schermate raggiungibili
  senza giocare). `g27-partita` le aveva incluse una volta (`CPM_PARTITA=1`, prima del merge, con
  numeri di marca poi migliorati) ma non è stata ripetuta qui: nessuna misura di partita post-merge.
- **Il seme è unico** (`CPM_SEME=4242`, il default): non copre la variabilità reale di club/dati
  estratti a caso nelle Offerte o nella Creazione con un seme diverso.
- **Gli stati e le transizioni** (premuto, attivo, disabilitato, focus, hover) non sono misurati:
  le animazioni sono portate al termine prima di ogni lettura, per costruzione della sonda.
- **I fondi a gradiente/immagine** sono esclusi dal contrasto (dichiarato dalla sonda stessa,
  colonna «esclusi per gradiente» nelle tabelle 4).
- **L'altezza** della pagina (overflow verticale, lunghezza) non è misurata da questa sonda.

## Cartelle di questa misura

- `chiaro/` — `REPORT.md` + `dati.json` della corsa 1 (chiaro, 5 larghezze).
- `scuro/` — `REPORT.md` + `dati.json` della corsa 2 (scuro, 5 larghezze).
- `scuro-412/` — `REPORT.md` + `dati.json` della corsa 3 (scuro, 412px) + `412/*.png`, i 13 scatti
  a schermo intero delle 13 schermate raggiungibili senza giocare, in tema scuro, alla taglia del
  PO (412×915). Ogni PNG è sotto i 200 KB (il più pesante, `carriera-profilo.png`, è ~167 KB): non
  è stata necessaria alcuna riduzione né selezione dei 6 rappresentativi prevista in caso di
  superamento della soglia.
