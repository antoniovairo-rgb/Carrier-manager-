# Rapporto giro 400 — PO-575 «Il testo ingrandito (carattere di sistema 130% e 200%)»

Ramo `sviluppo/giro400-testo-grande`, base `lavoro/201` (7.999.215). GAME_VERSION, SAVE_VERSION e `docs/governo` non toccati.
Voce PO-575 (BACKLOG su main, riga 93; origine giro 297, valutazione delle skill gamedev, voce candidata 3).

## In breve

- **Guardiano nuovo `npm run testo-grande-400`** (`tests/visual/testo-grande-400.mjs`): sei schermate (Home, Opzioni, carriera,
  pre-partita, partita, fine partita) × tre scale (100/130/200%) × le cinque larghezze di griglia-mobile/design-system
  (360·375·390·412·430) = **90 misure**, sui rettangoli del DOM: testo **tagliato**, **sovrapposto**, **fuori schermo**, **tasti
  irraggiungibili**. ~460 s sul banco.
- **Misura prima → dopo** (difetti nati con l'ingrandimento, cioè presenti a 130/200% su una larghezza dove a 100% non ci sono):
  **18 → 8**. Sovrapposti **6 → 0**, tagliati **12 → 8**, fuori schermo **0 → 0**, tasti irraggiungibili **0 → 0**.
- **Corretti alla sorgente** (solo col carattere ingrandito, a 100% nessuna regola cambia): i titoli delle schede richiudibili
  (4 titoli in «…») e la barra di navigazione (6 voci che si accavallavano). Rosso: `window.__CPM_NO_G400`.
- **Residui (8)**, elencati uno per uno sotto con foto e messi nell'elenco dei noti `tests/visual/testo-grande-400-noti.json`.
- Verde + due rossi misurati; giro `node ci-runner.mjs giro testo-grande-400`: esito in fondo.

## 1. Come si ingrandisce (dichiarato)

Chromium headless a misura di telefono (`isMobile`, `hasTouch`) con `text-size-adjust: N%` sulla radice. È il moltiplicatore dei
corpi che Chromium applica anche ai corpi scritti in px (misurato su una pagina di prova: 14 px → 18,2 px a 130%). A ogni misura
il guardiano **verifica** che l'ingrandimento sia davvero in pagina: stesso testo campione, corpo a 1,30× e 2,00× quello a 100%
(± 3%), altrimenti la misura è «non giudicata» = rosso. In tutte le 90 misure di questo giro: **1,30× e 2,00× esatti**.

⚠️ **Non posso confermare** che la WebView del pacchetto Android (Capacitor) o la TWA applichino il carattere di sistema
esattamente con questo meccanismo: non ho un telefono qui. Per questo la correzione non dipende dal meccanismo: **legge il corpo
effettivo** di un campione nascosto da 100 px (qualunque cosa lo ingrandisca, il campione cresce). Il collaudo sul telefono del PO
a 130% e 200% resta il giudice (dubbio D4).

Il gioco ha anche il suo «Testo grande» nelle Opzioni (giro 234/235, token FS ×1,15/×1,3): è un'altra cosa e non è stato toccato.

## 2. Cosa misura il guardiano

Per ogni nodo di testo visibile e ogni tasto (`button`, `[role=button]`, `a[href]`) della schermata (sotto un velo a tutto schermo,
come le Opzioni sopra la Home, si misura solo il velo; il testo «solo lettore di schermo» come `.cpm-sr` è escluso):

| difetto | regola |
|---|---|
| **tagliato** | ellissi attiva (`text-overflow` + `scrollWidth > clientWidth`), riga troncata da `-webkit-line-clamp`, oppure il testo esce di > 2 px da un antenato che lo ritaglia (`overflow: hidden/clip`). Un antenato che scorre lo contiene: non è tagliato. |
| **sovrapposto** | due testi di elementi diversi nello stesso strato con intersezione ≥ 30% dell'area del più piccolo (riga per riga, solo la parte visibile), oppure un testo che **esce dal suo tasto** di > 2 px (le parole si toccano coi vicini). |
| **fuori** | il testo esce dallo schermo in larghezza senza un antenato che scorre o ritaglia; in un contenitore fisso anche in altezza; oltre la fine del documento. |
| **tasto** | un tasto visibile e non disabilitato che, portato al centro, al suo centro non riceve il tocco (`elementFromPoint` su un altro elemento), o che esce dallo schermo in larghezza. |

Sulla partita viva il testo cambia a ogni minuto (cronaca, orologio): lì la chiave di un difetto è tipo + elemento, senza testo.

**Verdetto:** verde se tutte le 90 misure sono giudicate **e** nessun difetto nato con l'ingrandimento è fuori dall'elenco dei noti.
Un noto che sparisce è stampato «guarito» (si toglie dall'elenco), non fa rosso. Soglie fisse.

**Rosso (prova che il guardiano vede), mai rimettendo un tema:**
- `CPM_ROSSO400=fix` → `window.__CPM_NO_G400`: le correzioni tornano indietro. Misurato: **ROSSO uscita 1, 10 difetti nuovi**
  (i 4 titoli in «…» e le 6 voci della barra).
- `CPM_ROSSO400=banco` → alterazione dichiarata dal banco, un foglio di stile che vieta l'a-capo nei tasti e li ritaglia
  (`white-space:nowrap; overflow:hidden; text-overflow:ellipsis`). Misurato: **ROSSO uscita 1, 21 difetti nuovi** (Informativa
  sulla privacy, «Firmo l'accordo», «Vai al prossimo momento», …). Nessun token toccato.

## 3. Misure prima / dopo

Prima = braccio `__CPM_NO_G400` con lo strumento definitivo; dopo = braccio verde. A 412 px (tagliati/sovrapposti/fuori/tasti):

| schermata | prima 100% | prima 130% | prima 200% | dopo 100% | dopo 130% | dopo 200% |
|---|---|---|---|---|---|---|
| Home | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 |
| Opzioni | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 |
| Carriera | 0/1/0/0 | 0/1/0/0 | **6/7/0/0** | 0/1/0/0 | 0/1/0/0 | **2/1/0/0** |
| Pre-partita | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 |
| Partita (HUD) | 2/0/0/0 | 2/0/0/0 | 2/0/0/0 | 2/0/0/0 | 2/0/0/0 | 2/0/0/0 |
| Fine partita | 0/0/0/0 | 0/0/0/0 | **4/0/0/0** | 0/0/0/0 | 0/0/0/0 | **4/0/0/0** |

Su tutte le cinque larghezze, difetti nati con l'ingrandimento: **18 → 8**. Numeri grezzi: `docs/collaudo-grafico/testo-grande-400/dati.json`.

Foto (412 px): `docs/collaudo-grafico/testo-grande-400/foto/<schermata>-<scala>.png`; la carriera a 200% prima della correzione è
in `docs/collaudo-grafico/testo-grande-400/prima/carriera-200-prima.png`.

## 4. Corretto alla sorgente

| file | funzione / punto | cosa cambia |
|---|---|---|
| `src/19-app-root.jsx` | nuova `testoGrande400` (subito dopo lo strato `tocco213`, prima del montaggio React) | campione nascosto da 100 px, `ResizeObserver` (+ `visibilitychange`): moltiplicatore in `window.__CPM_TG400`, classe `cpm-tg400` sulla radice da 1,15× in su; foglio di stile `#cpm-tg400` con le regole qui sotto. Spenta da `window.__CPM_NO_G400`. |
| `src/11-ui-kit-highlight.jsx` | `Card`, intestazione richiudibile (`momento` / `momentoNota`) | due classi: `cpm-mom400` sul titolo, `cpm-momn400` sulla nota. Lo stile in linea è identico. |
| `CARRIER-MANAGER-AV.html` | ricomposto con `node tools/build-src.mjs` | — |

Regole (attive SOLO con `cpm-tg400`):
1. **Titolo della scheda richiudibile va a capo** invece di finire in «…»; la nota accanto si restringe invece di passarci sopra.
   Guariti: «Offerta di sponsor · Kappa Ridge», «Il tuo procuratore: boutique o grande agenzia», «🌱 Il tuo allievo»,
   «La tua settimana» (tutti a 200%, il procuratore già a 130% su 360).
2. **Barra di navigazione**: le voci tengono la larghezza del loro nome (`flex-shrink:0`) e la barra scorre (`overflow-x:auto`).
   Prima a 200% le sei voci uscivano dal loro tasto di 3-9 px e si toccavano («STAGIONECLUBCARRIERA…»). Ora a 360-430 px una o
   due voci finali stanno oltre il bordo e si raggiungono scorrendo la barra (il controllo dei tasti lo conferma: 0 irraggiungibili).

A 100% nessuna di queste regole si applica: la classe non c'è, il disegno misurato da griglia-mobile e design-system è lo stesso.
Misurato nel giro: `griglia-mobile` riscrive il suo `dati.json` con **gli stessi numeri** e cambia solo il nome di 5 selettori
(`span:nth-child(1)` → `span.cpm-mom400`); i file di g0 e `docs/governo/STABILITA.json` riscritti dal giro non sono stati committati.

## 5. Residui (non corretti, nell'elenco dei noti)

| # | schermata | difetto | dove | foto |
|---|---|---|---|---|
| R1 | Carriera | «☕ Sostieni il progetto» in «…» nella striscia sopra la barra | 130% a 360/390, 200% ovunque | `foto/carriera-200.png` |
| R2 | Carriera | «💡 Idee e feedback» in «…» nella stessa striscia | 200% ovunque | `foto/carriera-200.png` |
| R3 | Pre-partita | nome dello stadio («Stadio Salernum») in «…» nella riga informazioni (`pp-info287`) | 200% a 360 e 375 | — (solo a 360/375; la foto è a 412) |
| R4 | Partita | nome nella barra del giocatore (`barra-nome-182`) ritagliato di ~31 px | 130%/200% a 375/390/430 (dipende dal nome in scena) | `foto/partita-200.png` |
| R5-R6 | Fine partita | nomi delle squadre nel tabellino (`tab280-sx/dx`) in «…» | 130% a 360/375, 200% ovunque | `foto/fine-partita-200.png` |
| R7-R8 | Fine partita | nomi delle squadre sotto il risultato (`post-nome-squadra`, line-clamp a 2 righe) spezzati a metà parola e troncati («SELEZIO/NE», «POLISPO/RTIVA…») | 200% ovunque | `foto/fine-partita-200.png` |

Già presenti a 100% (informativi, non giudicati da questo guardiano): la freccia «›» della scheda sponsor esce dal suo tasto di 5 px;
il riquadro del risultato in partita (`risultato-v2`) è ritagliato di 3 px in alto (a 200% si vede: «0 - 0» tagliato, `foto/partita-200.png`).

⚠️ R4 vive sulla partita viva: se in una corsa il nome in scena è corto, il difetto non compare e il guardiano lo stampa «guarito».
Non è una prova di guarigione: va tolto dall'elenco solo con una correzione.

## 6. Dubbi per il PO (la consigliata è la prima, ed è quella applicata)

**D1 — Barra di navigazione a 200%.**
1. **(applicata, consigliata)** Le voci tengono la parola intera e la barra scorre di lato: niente parole accavallate, tutte le voci
   raggiungibili; a 360 px «Ufficio» si raggiunge scorrendo.
2. Nella sola barra il corpo si ferma al 130% anche col carattere a 200%: tutto in vista, ma si ignora in parte la scelta
   dell'utente (e non posso confermare che la WebView lo rispetti).
3. Sopra 1,5× la barra mostra le icone senza parola: compatta, ma le icone oggi non ci sono (tolte nel 7.955).

**D2 — Titoli delle schede richiudibili.**
1. **(applicata, consigliata)** Vanno a capo: il titolo si legge intero, la scheda chiusa diventa più alta di una riga.
2. Restano in «…» e il titolo intero compare aprendo la scheda: più compatto, ma la decisione «apro o no» si prende su un titolo
   monco.
3. Tetto al corpo del solo titolo (130%): come l'opzione 2 della D1.

**D3 — Gli 8 residui.**
1. **(applicata, consigliata)** Dichiarati nell'elenco dei noti con foto, corretti in un giro dedicato con la stessa classe
   `cpm-tg400` (fine partita per prima: i nomi spezzati a metà parola sono il difetto più visibile).
2. Correggerli tutti in questo giro: tocca tabellino, HUD e striscia di sostegno, cioè schermate di altri giri in parallelo.
3. Accettarli come limite (l'ellissi è una scelta di disegno a 200%): l'elenco dei noti diventa definitivo.

**D4 — Verifica sul telefono.**
1. **(applicata, consigliata)** Emulazione nel banco + rilevamento in pagina che legge il corpo effettivo, collaudo del PO sul
   telefono a 130% e 200% (Impostazioni Android → Display → Dimensioni carattere) su carriera e fine partita.
2. Plugin nativo che passa la scala di sistema alla pagina (es. un «text zoom» della WebView): misura esatta, ma una dipendenza
   in più nel pacchetto.
3. Bloccare il ridimensionamento del testo (`text-size-adjust:none`): niente difetti, ma toglie l'accessibilità a chi ne ha
   bisogno. Sconsigliata.

## 7. File toccati

- `tests/visual/testo-grande-400.mjs` (nuovo) · `tests/visual/testo-grande-400-noti.json` (nuovo)
- `tests/visual/package.json` (script `testo-grande-400`)
- `tests/visual/ci-runner.mjs` (MAPPA: riga `src/01|11|17|18` e riga `src/19`, righe che esistevano già; `npm run mappa-unica` verde)
- `src/19-app-root.jsx` (`testoGrande400`) · `src/11-ui-kit-highlight.jsx` (`Card`, due `className`) · `CARRIER-MANAGER-AV.html` (ricomposto)
- `docs/collaudo-grafico/testo-grande-400/` (foto e `dati.json`) · questo rapporto

## 8. Prove

- verde: `npm run testo-grande-400` → **VERDE uscita 0**, 90 misure giudicate, 8 noti, 0 nuovi (dentro il giro, 438 s).
- rosso `CPM_ROSSO400=fix` → **ROSSO uscita 1** (10 nuovi) · rosso `CPM_ROSSO400=banco` → **ROSSO uscita 1** (21 nuovi).
- `node ci-runner.mjs giro testo-grande-400` (guardiano + 17 sentinelle): **18/18 verdi** su 7.999.215 (testo-grande-400 438 s,
  griglia-mobile 188 s, design-system, tema-unico, partita-vera 632 s, career-critical 354 s, …). Gli altri guardiani li giudica il treno.
