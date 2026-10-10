# PO-217 — Analisi pre-partita: spazio vuoto sotto «Entra in campo»

**Stato: IN CORSO.** Modifica misurata e guardiano verde/rosso. Catena grafica in corso al momento del commit (esito da completare). Domanda di gusto sulle tre card ancora aperta.

## Misura
- Foto del PO (412 px): tre card, poi «Entra in campo», poi metà schermo vuota.
- WIP precedente: `minHeight:"100%"` sul contenitore `data-cpm="scout23"` (`src/13-prepartita-formazioni.jsx`). **Non aveva effetto**: il genitore (`src/15-live-match.jsx:9886`) non ha altezza definita. Misurato a 915 px: contenitore 453 px con WIP, 445 px con interruttore rosso.
- Il contenitore parte da `top:0` (`scrollY 0`): basta riempire il viewport.

## Modifica
- Contenitore: `minHeight:"100dvh"` e `paddingBottom:SP.lg` (con border-box globale, il padding resta dentro i 100dvh). Pulsante dentro un `div` con `marginTop:"auto"`.
- Il primo tentativo senza padding lasciava il pulsante a filo del bordo, con l'etichetta di collaudo TEST sopra la scritta: aggiunto il margine.

## Interruttore rosso
`window.__CPM_NO_PO217` riporta al comportamento precedente (nessun `minHeight`/`paddingBottom`, `marginBottom:SP.sm`).

## Guardiano
`tests/visual/po217-scout-test.mjs` — apre lo scout (carriera U18, partita), misura a 360/375/412 px lo spazio libero sotto il pulsante (soglia 160 px) e l'overflow orizzontale.

| Misura (915 px alto) | verde | rosso |
|---|---|---|
| 360 px — spazio sotto il pulsante | 16 px | 470 px |
| 375 px | 16 px | 470 px |
| 412 px | 16 px | 489 px |
| Esito | VERDE | ROSSO |

Foto: `docs/sviluppo/foto/po217/scout-{360,375,412}-{verde,rosso}.png`.

## Tema
Il tema scuro non è misurato: il tema è unico e chiaro dal 7.947 (`src/19-app-root.jsx:736`).

## Catena
- `node --test test/logic/*.test.mjs` (in `tests/visual`): 43/43.
- `node tools/check-src.mjs`: identico byte per byte dopo il build.
- `ci-runner.mjs grafica`: avviata in background, log `/home/user/scratch_grafica.log`, esito **da completare**. Durante l'esecuzione i passi `griglia-mobile` ecc. modificano file sotto `docs/collaudo-grafico/`: quelle modifiche NON sono di questo commit e non vanno committate.

## Domanda per il PO (gusto, non decisa)
Le tre card restano di testo uguale. Opzioni:
1. Gerarchia per importanza: «Da neutralizzare» e «Consiglio del mister» con accento.
2. Consiglio del mister in evidenza, le altre due compatte.
3. Lasciare le card uguali (si risolve solo lo spazio vuoto, come ora).
