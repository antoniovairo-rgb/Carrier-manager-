# Giro 284 — Home da PC e tendine leggibili (PO-542 · PO-543)

Versione di destinazione 7.999.198 (rapida, decisione PO 19/11). Ramo `sviluppo/giro284-home-pc`, partito da
`lavoro/198`. **Solo grafica**: nessun cambio di funzione; `GAME_VERSION` non toccata (come da consegna).

## Cosa è cambiato

| File | Intervento |
|---|---|
| `src/17-menu-creazione-pannelli.jsx` | tre classi nuove sulla Home: `cpm-home284` (colonna), `cpm-logo284` (riquadro del logo), `cpm-tasti284` (riga «1 2 3 salvataggi»). Nessuna riga di logica toccata. |
| `src/19-app-root.jsx` | regole CSS **solo da 900 px** per la Home (colonna, logo, «Nuova carriera», tasti); regola globale delle voci delle tendine (`option`, `optgroup`) sui token `TINTE.sup` / `TINTE.testo`. Tutto dietro il rosso `window.__CPM_NO_G284`. |
| `tests/visual/homepc-284.mjs` + `npm run homepc-284` | guardiano nuovo (verde + rosso). |
| `docs/sviluppo/giro284/` | foto `prima-*` (7.999.197), `dopo-*`, `rosso-*` (= 7.999.197 riprodotta dal rosso). |

### PO-542 — causa misurata
- **Logo al 69–78% dell'altezza**: la regola «schermata piena» del giro 114 fa crescere il primo blocco (`flex:1 0 auto`) fino a riempire la finestra; da PC il contenuto è corto e tutto lo spazio va al logo.
- **«Nuova carriera» a un terzo**: `.cpm-slots` da 900 px è una griglia a tre colonne; a carriera zero ha un figlio solo, che occupa la prima colonna.
- **Colonna non centrata (80 px / 54 px)**: il padding della `.cpm-scroll` (268 a sinistra, 48 a destra) sta sotto lo zoom 1,12, il menu laterale (220 px) no: 268×1,12 − 220 = 80, 48×1,12 = 54.
- **Tasti 1 2 3 di 22×19 px**: le etichette `.kbd` col corpo caption.

### PO-542 — correzione (solo ≥ 900 px)
Riquadro del logo alto quanto il contenuto e almeno il 32% della finestra; colonna larga al massimo 720 px (806 a schermo) centrata nello spazio a destra del menu (padding sinistro = 220/1,12 + margine) e centrata in verticale; «Nuova carriera» su tutta la riga quando è l'unico figlio; tasti 1 2 3 da 44 px CSS (49 a schermo), cifra a `FS.bodyLg`, etichetta a `FS.body`.

### PO-543 — causa e correzione
`select option{background:#fff}` era cablato, mentre il testo delle voci veniva ereditato dal `<select>` (testo chiaro del tema): **1,13:1** sulla tendina della nazione. Ora `option` e `optgroup` hanno fondo `TINTE.sup` e testo `TINTE.testo`: **14,79:1**. La regola è globale, quindi copre le tre tendine del gioco: nazione (creazione), lega (classifica, con `optgroup`), codici del taccuino (partita). Le ultime due non sono raggiungibili dalla Home: il guardiano le rappresenta con una tendina di prova con `optgroup` sulle stesse regole; nessuna delle due ha uno stile proprio sulle voci (verificato nel sorgente).

## Misure prima / dopo (`npm run homepc-284`, Chromium headless)

| Misura | Soglia | 7.999.197 (prima) | Dopo |
|---|---|---|---|
| H1 logo / finestra a 1366×768 | ≤ 40% | 68,8% (528 px) | **34,2%** (262 px) |
| H1 logo / finestra a 1920×1080 | ≤ 40% | 77,8% (840 px) | **32,0%** (346 px) |
| H2 «Nuova carriera» / colonna a 1366 | ≥ 90% | 32,7% (331/1012) | **100%** (806/806) |
| H2 «Nuova carriera» / colonna a 1920 | ≥ 90% | 33,0% (516/1566) | **100%** (806/806) |
| H3 scarto sinistra/destra a 1366 | ≤ 8 px | 26 (80 / 54) | **0** (170 / 170) |
| H3 scarto sinistra/destra a 1920 | ≤ 8 px | 26 (80 / 54) | **0** (447 / 447) |
| H4 Crediti visibile senza scorrere a 1366×768 | sì | sì (701–746 px) | sì (583–628 px) |
| H5 tasti 1 2 3 (a schermo) | ≥ 44×44, testo ≥ 14 | 22×19, 13,4 | **49×49, 16,8** |
| T1 contrasto minimo delle voci (10 voci, 2 tendine) | ≥ 4,5 | 1,13 | **14,79** |
| 1883×971 (foto del PO, informativa) | — | logo 75,3% · Nuova 32,9% · 80/54 | logo 32,0% · Nuova 100% · 428/428 |
| Telefono 360 / 375 / 412, verde contro rosso | 0 pixel diversi | — | **0 / 0 / 0** |

Il rosso `__CPM_NO_G284` fa cadere H1, H2, H3, H5 e T1. **H4 non può cadere col rosso**: sulla 7.999.197 «Crediti» era già dentro la finestra a 1366×768 (misurato 701–746 px su 768); si giudica solo nel verde. Lo dichiaro invece di inventare un rosso.

## Controlli eseguiti (catena «solo grafica»)

| Controllo | Esito |
|---|---|
| `homepc-284` (verde + rosso) | verde |
| `test:logic` | verde |
| `save-compat` | verde (12 pass · 0 fail) |
| `tema-unico` (verde + rosso) | verde |
| `design-system` | verde |
| `griglia-mobile` | verde (uscita 0, 14 schermate × 5 larghezze; Home 0 difetti a ogni larghezza). Ha riscritto le foto di `docs/collaudo-grafico/g0/`: rimesse con `git checkout --` |
| `career-critical` | verde (uscita 0, tutte le sonde della catena PASS) |
| `tools/build-src.mjs` + `tools/check-src.mjs` | IDENTICO dopo la ricomposizione; privacy allineata |

## Dubbi per il PO

1. **I tasti «1 2 3» restano indicazioni da tastiera, non tasti da toccare.** Ora sono grandi (49 px) e leggibili, ma cliccarli non fa nulla, come prima: la funzione è il tasto 1/2/3 della tastiera. Renderli cliccabili sarebbe una funzione nuova (fuori dall'ambito «solo grafica»): scelta tua.
2. **Larghezza massima della colonna: 806 px a schermo** (720 CSS sotto lo zoom 1,12). L'ho scelta io come «sensata»; a 1920 lascia 447 px per lato. Se la vuoi più larga è un numero solo.
3. **Centratura verticale**: da PC il blocco (logo + azioni) sta al centro della finestra, quindi sopra il logo resta spazio vuoto (circa 140 px a 1366×768). L'alternativa è tenerlo in alto con lo spazio vuoto in fondo.
4. **Tendina del sistema**: la correzione dà fondo e testo espliciti alle voci; la finestra della lista resta quella di Chrome (bordi, barra di scorrimento). Verificato solo su Chromium headless desktop, non su Chrome per Windows/Mac reale né su Android (dove la lista è nativa e di solito ignora questi stili).
5. Con salvataggi già presenti la griglia a tre colonne dei salvataggi resta com'era (una carta per colonna): non era nella foto, non l'ho toccata.
