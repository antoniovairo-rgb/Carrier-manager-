# Rapporto giro 373 — PO-462 «intervista tagliata su PC» · PO-463 «Sempreverde al ritiro» + coda della coppa delle Nazioni

Ramo `sviluppo/giro373-intervista-sempreverde`, base `lavoro/201` (8543a9cc = 7.999.215 + giro 364). GAME_VERSION non toccata,
docs/governo non toccato.

## In breve

| Voce | Prima (misurato) | Dopo (misurato) |
|---|---|---|
| PO-462 intervista 1366×768 | finestra 262→744, contenuto 570 in 480, **2/3** risposte visibili | finestra 180→752, contenuto 570 in 570, **3/3**, niente scorrimento |
| PO-462 1366×657 (lo stesso PC con la barra del browser) | **1/3** (contenuto 570 in 403) | **3/3** (69→641) |
| PO-462 1280×720 | 2/3 | 3/3 |
| PO-462 tablet orizzontale 1180×820 | 2/3 | 3/3 |
| PO-462 telefono 390×844 · tablet 820×1180 | 3/3 | 3/3, **finestra nello stesso punto al pixel** (262→844 · 487→1059) |
| PO-463 «Sempreverde», addio annunciato a 34 anni | mai completata | completata al ritiro |
| PO-463 sfida non riuscita al ritiro | resta «in corso» per sempre | fallita al ritiro |
| PO-463 coppa delle Nazioni | la coda chiusa non porta `trophyWon`/`qualified` | li porta (uguali a `worldMemory`) |

Misure con la domanda **più lunga** del catalogo (`IV_FATTI183`, «Il derby perso brucia più di ogni altra sconfitta…»): è il caso
peggiore, quindi ogni altra domanda ci sta a maggior ragione. Sonda `tests/visual/misura-373.mjs` (`--rosso` per il prima).

## PO-462 — la causa non era lo zoom

La riga del backlog (dal giro 200) indicava lo zoom 1,12 di `.cpm-scroll`, «letto nel CSS, non misurato». Misurato: **l'intervista
non sta dentro `.cpm-scroll`**, è un portale su `document.body` dal 7.302, quindi lo zoom non la tocca. La causa vera è la regola
`cpm-scena150` del giro 150 (src/19): da 768 px in su la fascia della scena era **sempre** il 31% alto dello schermo e la finestra
non poteva superare `69vh − 48 px` = 482 px a 768 di altezza.

**Correzione (src/19, una regola CSS dopo quella del giro 150, solo da 768 px):** la fascia della scena diventa un distanziatore che
cede (`::before`, `flex: 0 1 31vh`) e la finestra può arrivare a tutta l'altezza meno i margini. Se la finestra ci sta, resta
centrata sotto la scena come prima (è il motivo per cui il tablet verticale non si sposta di un pixel); se non ci sta, la fascia si
accorcia quanto serve e la finestra sale sopra il bordo basso della scena. Il telefono (<768) non è toccato. Rosso `__CPM_NO_G373A`.

## PO-463 — la sfida al ritiro e la coda della coppa

- **Sfida.** Il controllo delle sfide sta in `doStartNewSeason` (src/18), ma **dopo** le due uscite verso `doRetire()` (addio
  annunciato · 40 anni); anche «Ritirati» e il ritiro dalla schermata di fine stagione chiamano `doRetire()` direttamente. Chi
  annuncia l'addio a 34 anni (la carta «L'ultima stagione?» compare proprio da 34) non passava mai dal controllo. Correzione in
  `doRetire`: la sfida si giudica con le stesse regole di `CHALLENGES` sui dati della stagione che si chiude; se riuscita →
  `completed`, se no → `failed` (a carriera finita non c'è un'altra occasione). Deterministico, nessun campo nuovo, nessun SAVE.
  Notifica come al passaggio di stagione. Testimone `window.__CPM_SFIDA373`. Rosso `__CPM_NO_G373B`.
- **Coppa delle Nazioni.** La chiusura (src/18, updater dopo l'ultima gara) scriveva l'esito solo in `worldMemory`; la scheda
  «Coppa delle Nazioni S.x» legge `trophyWon`/`qualified` dalla coda per il bordo e il colore (il testo era già stato corretto in
  lettura dal giro 200). Ora la chiusura li scrive anche nella coda. La lettura di riserva del giro 200 resta, per i salvataggi
  vecchi. Stesso rosso `__CPM_NO_G373B`.

## File e funzioni toccate

- `src/19-app-root.jsx` — blocco CSS globale accanto alla regola del giro 150 (nuova regola `cpm-scena150` sotto `__CPM_NO_G373A`).
- `src/18-career-app.jsx` — `doRetire` (sfida al ritiro) · updater di chiusura della coppa delle Nazioni (`nationsCupQueue`).
- `CARRIER-MANAGER-AV.html` — ricomposto con `tools/build-src.mjs`.
- `tests/visual/difetti-373.mjs` (guardiano) · `tests/visual/misura-373.mjs` (sonda, importata dal guardiano).
- `tests/visual/package.json` — script `difetti-373` (verde + rosso, il rosso deve uscire 1).
- `tests/visual/ci-runner.mjs` — `difetti-373` nelle righe della MAPPA che esistono già per `src/18-|src/10-` e `src/19-`, e fra i
  `LENTI` (gioca una finale della coppa). `npm run mappa-unica` verde.

Nessun tocco a src/01, src/07, src/17 (giri 369 e 370 in attesa); src/18 e src/19 sono condivisi con 369/370/371/372: i punti toccati
sono due funzioni e un blocco CSS, lontani da profilo e «Sostieni».

## Guardiano `npm run difetti-373`

Tre parti sul gioco vero: A intervista (quattro viste PC/tablet orizzontale: tre risposte su tre senza scorrere; telefono e tablet
verticale: tre su tre e finestra nello stesso punto del rosso) · B1 ritiro con addio a 34 anni («Sempreverde» completata; «Bomber
Puro» con 3 gol fallita) · B2 finale della coppa delle Nazioni giocata fino al fischio (coda chiusa con `qualified` vero e
`trophyWon` booleano uguale a `worldMemory`). «Non giudicato» = rosso. Il braccio rosso (`CPM_ROSSO373=1`) deve vedere il difetto in
ogni parte tranne le due «non peggiora», altrimenti esce 2.

ESITI_GUARDIANO

## Guardiani della zona NON girati da me (li giudica il treno)

`interviste-211`, `interviste-183`, `intervista-231`, `scelte-201` (intervista: dopo il ricaricamento), `rifiniture-200` (scheda della
coppa delle Nazioni), `rassegna-232`, `accessibilita-234`, `pc-tablet-292`, `design-system`, `griglia-mobile`, `career-critical`,
`save-compat`, `test:logic` e il resto delle righe `src/18-|src/10-` e `src/19-`.

## Dubbi per il PO (la consigliata è la prima, ed è già applicata)

1. **Sfida non riuscita al ritiro.**
   - (a) **consigliata, applicata:** al ritiro, se non riuscita, è «fallita»: la carriera è finita e non c'è un'altra occasione.
   - (b) al ritiro si guarda solo se è riuscita; altrimenti resta «in corso» per sempre (com'era prima per tutte).
   - (c) al ritiro si applicano solo le regole `fail` di ogni sfida, come al passaggio di stagione (molte sfide hanno `fail` sempre
     falso, quindi resterebbero «in corso»).
2. **Intervista su PC basso: la finestra sale sopra la scena.** A 1366×768 copre i 58 px bassi della fascia della scena (il bordo basso del
   tavolo della sala stampa; nomi, microfoni e punteggio restano visibili — foto `tests/visual/out/intervista-373-pc.png`, non nel repo).
   - (a) **consigliata, applicata:** la fascia della scena cede solo quanto serve.
   - (b) finestra più compatta su PC basso (meno spazio fra le risposte, figurine più piccole) senza toccare la scena.
   - (c) su PC basso togliere la riga «In sala» degli altri giornalisti (circa 50 px), scena intatta.
3. **La causa scritta nel backlog era diversa dalla misura** (zoom 1,12 contro regola della scena del giro 150). Opzioni per il registro:
   - (a) **consigliata:** correggere il testo della riga PO-462 alla chiusura, con la causa misurata (non l'ho fatto io: docs/governo
     non si tocca in questo giro).
   - (b) lasciare la riga com'è e rimandare a questo rapporto.
   - (c) aprire una voce sulle letture «non misurate» del giro 200 ancora aperte.
