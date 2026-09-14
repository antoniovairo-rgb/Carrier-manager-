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
| Home fuori carriera | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) | 0/28 (10) |
| Impostazioni | 4/32 (9) | 4/32 (9) | 4/32 (9) | 4/32 (9) | 4/32 (9) |
| Creazione | 252/841 (9) | 252/841 (9) | 252/841 (9) | 252/841 (9) | 252/841 (9) |
| Offerte | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) | 0/43 (10) |
| Dashboard | 22/176 (8) | 22/176 (8) | 22/176 (8) | 22/176 (8) | 22/176 (8) |
| Stagione · Classifica | 9/396 (8) | 9/396 (8) | 9/396 (8) | 9/397 (8) | 9/397 (8) |
| Stagione · Calendario | 64/324 (7) | 64/324 (7) | 64/324 (7) | 64/324 (7) | 64/324 (7) |
| Stagione · Coppe | 9/50 (8) | 9/50 (8) | 9/50 (8) | 9/50 (8) | 9/50 (8) |
| Club | 60/280 (8) | 60/280 (8) | 60/280 (8) | 60/280 (8) | 60/280 (8) |
| Carriera · Profilo | 12/314 (7) | 12/314 (7) | 12/314 (7) | 12/314 (7) | 12/314 (7) |
| Carriera · Nazionale | 12/116 (8) | 12/116 (8) | 12/116 (8) | 12/116 (8) | 12/116 (8) |
| Agente | 19/125 (8) | 19/125 (8) | 19/125 (8) | 19/125 (8) | 19/125 (8) |
| Prepartita | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) | 0/35 (10) |
| **TOTALE** | **463/2760** | **463/2760** | **463/2760** | **463/2761** | **463/2761** |

### 4 · Contrasto sotto soglia WCAG — sotto/misurati (esclusi per gradiente)

| schermata | 360px | 375px | 390px | 412px | 430px |
|---|---:|---:|---:|---:|---:|
| Home fuori carriera | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) | 0/4 (24) |
| Impostazioni | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) | 0/32 (0) |
| Creazione | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) | 0/838 (3) |
| Offerte | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) | 0/38 (5) |
| Dashboard | 3/104 (72) | 3/104 (72) | 3/104 (72) | 3/104 (72) | 3/104 (72) |
| Stagione · Classifica | 5/356 (40) | 5/356 (40) | 5/356 (40) | 5/357 (40) | 5/357 (40) |
| Stagione · Calendario | 1/284 (40) | 1/284 (40) | 1/284 (40) | 1/284 (40) | 1/284 (40) |
| Stagione · Coppe | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) | 0/10 (40) |
| Club | 33/215 (65) | 33/215 (65) | 33/215 (65) | 33/215 (65) | 33/215 (65) |
| Carriera · Profilo | 19/236 (78) | 19/236 (78) | 19/236 (78) | 19/236 (78) | 19/236 (78) |
| Carriera · Nazionale | 0/61 (55) | 0/61 (55) | 0/61 (55) | 0/61 (55) | 0/61 (55) |
| Agente | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) | 0/91 (34) |
| Prepartita | 2/22 (13) | 2/22 (13) | 2/22 (13) | 2/22 (13) | 2/22 (13) |
| **TOTALE** | **63/2291** | **63/2291** | **63/2291** | **63/2292** | **63/2292** |

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

## Dettaglio · le 5 coppie testo/fondo peggiori per schermata (a 412 px, la taglia del PO)

| schermata | rapporto | soglia | testo su fondo | px / peso | occorrenze | esempio |
|---|---:|---:|---|---|---:|---|
| Home fuori carriera | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 13 / 400 | 3 | ⚡ Nuova carriera |
| Home fuori carriera | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | Crea il tuo calciatore, su |
| Impostazioni | 5.12:1 | 4.5:1 | `#596a80` su `#f0f7ff` | 10 / 400 | 1 | Le impostazioni si salvano |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 10 / 400 | 12 | 30 |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 9 / 600 | 3 | ( |
| Impostazioni | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 9 / 400 | 1 | Audio sintetizzato in temp |
| Impostazioni | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 700 | 2 | 🎨 Grafica |
| Creazione | 4.69:1 | 4.5:1 | `#596a80` su `#f7e9ec` | 10 / 400 | 1 | Potenza e istinto del gol |
| Creazione | 4.80:1 | 4.5:1 | `#b45309` su `#f8fafc` | 10 / 400 | 8 | 🏆 Scalatore Nato |
| Creazione | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 9 / 400 | 252 | Liga Ibérica |
| Creazione | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 10 / 400 | 7 | Tecnica sopraffina e impre |
| Creazione | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 10 / 700 | 2 | 👤 Identità |
| Offerte | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 10 / 400 | 6 | Provino |
| Offerte | 5.27:1 | 4.5:1 | `#526279` su `#f7e9ec` | 11 / 400 | 3 | 🇮🇹 |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 6 | 🇮🇹 |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 13 / 400 | 2 | Scegli → |
| Offerte | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 10 / 400 | 1 | Riepilogo provini |
| Dashboard | 3.19:1 | 3:1 | `#d97706` su `#ffffff` | 32 / 800 | 1 | 7.2 |
| Dashboard | 3.30:1 | 4.5:1 | `#16a34a` su `#ffffff` | 10 / 700 | 2 | Force |
| Dashboard | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Dashboard | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 32 / 800 | 1 | 14 |
| Dashboard | 3.68:1 | 4.5:1 | `#0891b2` su `#ffffff` | 10 / 700 | 1 | Nello spogliatoio |
| Stagione · Classifica | 2.54:1 | 4.5:1 | `#9ca3af` su `#ffffff` | 11 / 700 | 1 | 🥈 |
| Stagione · Classifica | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Stagione · Classifica | 3.50:1 | 4.5:1 | `#ef4444` su `#f4f7fb` | 12 / 700 | 2 | 16 |
| Stagione · Classifica | 3.76:1 | 4.5:1 | `#ef4444` su `#ffffff` | 12 / 700 | 1 | 17 |
| Stagione · Classifica | 4.49:1 | 4.5:1 | `#15803d` su `#e7f6ec` | 10 / 700 | 1 | ● Live |
| Stagione · Calendario | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Stagione · Calendario | 3.30:1 | 4.5:1 | `#ffffff` su `#16a34a` | 11 / 700 | 1 | Gioca → |
| Stagione · Calendario | 5.02:1 | 4.5:1 | `#ffffff` su `#15803d` | 9.9 / 800 | 5 | V |
| Stagione · Calendario | 5.15:1 | 3:1 | `#596a80` su `#f4f7fb` | 15 / 800 | 10 | – |
| Stagione · Calendario | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 9 / 400 | 10 | voto |
| Stagione · Coppe | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Stagione · Coppe | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 8 / 400 | 1 | OVR |
| Stagione · Coppe | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 11 / 400 | 1 | Coppa Nazionale: dal tuo s |
| Stagione · Coppe | 8.77:1 | 4.5:1 | `#ffffff` su `#8e1f33` | 13 / 900 | 2 | K |
| Stagione · Coppe | 8.77:1 | 4.5:1 | `#ffffff` su `#8e1f33` | 12 / 800 | 1 | ☕ Sostieni lo sviluppo di |
| Club | 2.80:1 | 4.5:1 | `#16a34a` su `#f7e9ec` | 13 / 800 | 1 | 82 |
| Club | 2.96:1 | 4.5:1 | `#d97706` su `#f4f7fb` | 13 / 800 | 11 | 76 |
| Club | 3.05:1 | 3:1 | `#16a34a` su `#f0f7ff` | 14 / 900 | 1 | 78 |
| Club | 3.19:1 | 4.5:1 | `#d97706` su `#ffffff` | 13 / 800 | 11 | 79 |
| Club | 3.30:1 | 4.5:1 | `#ffffff` su `#16a34a` | 9 / 800 | 5 | C |
| Carriera · Profilo | 2.54:1 | 4.5:1 | `#10b981` su `#ffffff` | 10 / 400 | 3 | Cifre del Calcio |
| Carriera · Profilo | 2.96:1 | 3:1 | `#d97706` su `#f4f7fb` | 17 / 800 | 2 | 14 |
| Carriera · Profilo | 3.07:1 | 3:1 | `#16a34a` su `#f4f7fb` | 17 / 800 | 1 | 45M€ |
| Carriera · Profilo | 3.30:1 | 4.5:1 | `#16a34a` su `#ffffff` | 11 / 700 | 8 | 82 |
| Carriera · Profilo | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Carriera · Nazionale | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Carriera · Nazionale | 4.66:1 | 4.5:1 | `#596a80` su `#e7ecf5` | 10 / 400 | 2 | 0 |
| Carriera · Nazionale | 5.12:1 | 4.5:1 | `#596a80` su `#f0f7ff` | 11 / 900 | 6 | 2 |
| Carriera · Nazionale | 5.12:1 | 4.5:1 | `#596a80` su `#f0f7ff` | 10 / 400 | 6 | 31 |
| Carriera · Nazionale | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 9 / 400 | 2 | Prossimi tornei |
| Agente | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11 / 400 | 3 | « |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 8 / 400 | 1 | OVR |
| Agente | 5.53:1 | 4.5:1 | `#596a80` su `#ffffff` | 11.5 / 400 | 1 | Cambia procuratore |
| Agente | 5.70:1 | 4.5:1 | `#7c3aed` su `#ffffff` | 11 / 600 | 3 | 🤵 Agente · − |
| Prepartita | 4.34:1 | 4.5:1 | `#64748b` su `#f1f5f9` | 10 / 400 | 2 | 🗡️ |
| Prepartita | 5.15:1 | 4.5:1 | `#596a80` su `#f4f7fb` | 10 / 400 | 4 | Stadio |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 10.5 / 400 | 1 | Attenzione: centrocampo fi |
| Prepartita | 6.21:1 | 4.5:1 | `#526279` su `#ffffff` | 12 / 400 | 1 | 🔍 Analisi completa |
| Prepartita | 7.13:1 | 4.5:1 | `#166534` su `#ffffff` | 11.5 / 700 | 4 | Gioco aereo |

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: qui si misura solo il tema chiaro (`cpm-dark=0`).
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

