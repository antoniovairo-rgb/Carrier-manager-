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
| Impostazioni | 17/32 (0) | 17/32 (0) | 17/32 (0) | 17/32 (0) | 17/32 (0) |
| Creazione | 281/838 (3) | 281/838 (3) | 281/838 (3) | 281/838 (3) | 281/838 (3) |
| Offerte | 12/38 (5) | 12/38 (5) | 12/38 (5) | 12/38 (5) | 12/38 (5) |
| Dashboard | 23/104 (72) | 23/104 (72) | 23/104 (72) | 23/104 (72) | 23/104 (72) |
| Stagione · Classifica | 118/356 (40) | 118/356 (40) | 118/356 (40) | 118/357 (40) | 118/357 (40) |
| Stagione · Calendario | 166/284 (40) | 166/284 (40) | 166/284 (40) | 166/284 (40) | 166/284 (40) |
| Stagione · Coppe | 1/10 (40) | 1/10 (40) | 1/10 (40) | 1/10 (40) | 1/10 (40) |
| Club | 124/215 (65) | 124/215 (65) | 124/215 (65) | 124/215 (65) | 124/215 (65) |
| Carriera · Profilo | 123/236 (78) | 123/236 (78) | 123/236 (78) | 123/236 (78) | 123/236 (78) |
| Carriera · Nazionale | 19/61 (55) | 19/61 (55) | 19/61 (55) | 19/61 (55) | 19/61 (55) |
| Agente | 23/91 (34) | 23/91 (34) | 23/91 (34) | 23/91 (34) | 23/91 (34) |
| Prepartita | 10/22 (13) | 10/22 (13) | 10/22 (13) | 10/22 (13) | 10/22 (13) |
| **TOTALE** | **917/2291** | **917/2291** | **917/2291** | **917/2292** | **917/2292** |

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
| Home fuori carriera | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 13 / 400 | 3 | ⚡ Nuova carriera |
| Home fuori carriera | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 12 / 400 | 1 | Crea il tuo calciatore, su |
| Impostazioni | 2.38:1 | 4.5:1 | `#94a3b8` su `#f0f7ff` | 10 / 400 | 1 | Le impostazioni si salvano |
| Impostazioni | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 10 / 400 | 12 | 30 |
| Impostazioni | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 9 / 600 | 3 | ( |
| Impostazioni | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 9 / 400 | 1 | Audio sintetizzato in temp |
| Impostazioni | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 11 / 700 | 2 | 🎨 Grafica |
| Creazione | 2.05:1 | 4.5:1 | `#f59e0b` su `#f8fafc` | 10 / 400 | 8 | 🏆 Scalatore Nato |
| Creazione | 2.18:1 | 4.5:1 | `#94a3b8` su `#f7e9ec` | 10 / 400 | 1 | Potenza e istinto del gol |
| Creazione | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 9 / 400 | 252 | Liga Ibérica |
| Creazione | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 10 / 400 | 7 | Tecnica sopraffina e impre |
| Creazione | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 10 / 700 | 2 | 👤 Identità |
| Offerte | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 10 / 400 | 6 | Provino |
| Offerte | 2.96:1 | 4.5:1 | `#d97706` su `#f4f7fb` | 11 / 700 | 3 | 7.4 |
| Offerte | 4.04:1 | 4.5:1 | `#64748b` su `#f7e9ec` | 11 / 400 | 3 | 🇮🇹 |
| Offerte | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 11 / 400 | 6 | 🇮🇹 |
| Offerte | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 13 / 400 | 2 | Scegli → |
| Dashboard | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 10 / 400 | 6 | 4 |
| Dashboard | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 11 / 700 | 6 | Stagione |
| Dashboard | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 9 / 400 | 3 | ( |
| Dashboard | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 11 / 400 | 3 | 26 |
| Dashboard | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 8 / 400 | 1 | OVR |
| Stagione · Classifica | 2.00:1 | 4.5:1 | `#f59e0b` su `#fef9c3` | 11 / 700 | 1 | 80 |
| Stagione · Classifica | 2.15:1 | 4.5:1 | `#f59e0b` su `#ffffff` | 10 / 700 | 2 | # |
| Stagione · Classifica | 2.15:1 | 4.5:1 | `#f59e0b` su `#ffffff` | 11 / 700 | 1 | 🥇 |
| Stagione · Classifica | 2.39:1 | 4.5:1 | `#94a3b8` su `#fef9c3` | 10 / 700 | 2 | # |
| Stagione · Classifica | 2.54:1 | 4.5:1 | `#9ca3af` su `#ffffff` | 11 / 700 | 1 | 🥈 |
| Stagione · Calendario | 2.39:1 | 3:1 | `#94a3b8` su `#f4f7fb` | 15 / 800 | 10 | – |
| Stagione · Calendario | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 9 / 400 | 10 | voto |
| Stagione · Calendario | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 10 / 400 | 26 | 13 |
| Stagione · Calendario | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 7 / 400 | 23 | ⚽ |
| Stagione · Calendario | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 8 / 400 | 1 | OVR |
| Stagione · Coppe | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 8 / 400 | 1 | OVR |
| Stagione · Coppe | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Stagione · Coppe | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 11 / 400 | 1 | Coppa Nazionale: dal tuo s |
| Stagione · Coppe | 8.77:1 | 4.5:1 | `#ffffff` su `#8e1f33` | 13 / 900 | 2 | K |
| Stagione · Coppe | 8.77:1 | 4.5:1 | `#ffffff` su `#8e1f33` | 12 / 800 | 1 | ☕ Sostieni lo sviluppo di |
| Club | 2.18:1 | 4.5:1 | `#94a3b8` su `#f7e9ec` | 10 / 700 | 1 | 9 |
| Club | 2.18:1 | 4.5:1 | `#94a3b8` su `#f7e9ec` | 9 / 400 | 1 | Centravanti |
| Club | 2.38:1 | 4.5:1 | `#94a3b8` su `#f0f7ff` | 8 / 400 | 1 | fiducia |
| Club | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 9 / 400 | 14 | — |
| Club | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 10 / 700 | 11 | 2 |
| Carriera · Profilo | 2.35:1 | 4.5:1 | `#94a3b8` su `#f5f5f5` | 12 / 600 | 14 | 🏛️ |
| Carriera · Profilo | 2.35:1 | 4.5:1 | `#94a3b8` su `#f5f5f5` | 10 / 600 | 14 | 200 partite |
| Carriera · Profilo | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 10 / 400 | 10 | Stipendio |
| Carriera · Profilo | 2.54:1 | 4.5:1 | `#10b981` su `#ffffff` | 10 / 400 | 3 | Cifre del Calcio |
| Carriera · Profilo | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 10 / 400 | 18 | S.4 · FC Salernum |
| Carriera · Nazionale | 2.16:1 | 4.5:1 | `#94a3b8` su `#e7ecf5` | 10 / 400 | 2 | 0 |
| Carriera · Nazionale | 2.38:1 | 4.5:1 | `#94a3b8` su `#f0f7ff` | 11 / 900 | 6 | 2 |
| Carriera · Nazionale | 2.38:1 | 4.5:1 | `#94a3b8` su `#f0f7ff` | 10 / 400 | 6 | 31 |
| Carriera · Nazionale | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 9 / 400 | 2 | Prossimi tornei |
| Carriera · Nazionale | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 8 / 400 | 1 | OVR |
| Agente | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 11 / 400 | 3 | « |
| Agente | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 8 / 400 | 1 | OVR |
| Agente | 2.56:1 | 4.5:1 | `#94a3b8` su `#ffffff` | 11.5 / 400 | 1 | Cambia procuratore |
| Agente | 3.07:1 | 4.5:1 | `#16a34a` su `#f4f7fb` | 13 / 800 | 2 | €4.9M |
| Agente | 3.30:1 | 3:1 | `#16a34a` su `#ffffff` | 17.3 / 900 | 1 | 82 |
| Prepartita | 2.39:1 | 4.5:1 | `#94a3b8` su `#f4f7fb` | 10 / 400 | 4 | Stadio |
| Prepartita | 3.30:1 | 4.5:1 | `#16a34a` su `#ffffff` | 11.5 / 700 | 4 | Gioco aereo |
| Prepartita | 4.34:1 | 4.5:1 | `#64748b` su `#f1f5f9` | 10 / 400 | 2 | 🗡️ |
| Prepartita | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 10.5 / 400 | 1 | Attenzione: centrocampo fi |
| Prepartita | 4.76:1 | 4.5:1 | `#64748b` su `#ffffff` | 12 / 400 | 1 | 🔍 Analisi completa |

## Fuori portata di questa sonda (dichiarato, non misurato)

- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.
- Il **tema scuro**: qui si misura solo il tema chiaro (`cpm-dark=0`).
- Tutto cio' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.
- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.
- I **fondi a gradiente/immagine**: il contrasto su quei nodi e' escluso, non stimato.
- L'**altezza**: niente e' misurato sull'overflow verticale o sulla lunghezza della pagina.

