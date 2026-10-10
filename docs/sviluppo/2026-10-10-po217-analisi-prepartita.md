# PO-217 — Analisi pre-partita: card uguali e mezza schermata vuota

**Stato: APERTA (lavoro in corso, non chiusa).** Modifica applicata e compilata; guardiano visivo e foto **non ancora fatti**.

## Cosa ho misurato
- Foto del PO `docs/governo/foto/po217-analisi-prepartita.jpg` (412 px): tre card di testo, poi «Entra in campo», poi circa metà schermo vuoto.
- Causa: il contenitore `data-cpm="scout23"` (`src/13-prepartita-formazioni.jsx`, funzione `ScoutReportScreen`) non occupa l'altezza disponibile; il pulsante segue il contenuto invece di stare in fondo.

## Cosa ho cambiato (solo `src/13-prepartita-formazioni.jsx`)
1. Il contenitore ha `minHeight:"100%"` (`:92`).
2. Il pulsante «Entra in campo» è dentro un `div` con `marginTop:"auto"` (`:131`), così va in fondo quando c'è spazio.
3. Commento JavaScript sopra il `return(` che spiega la modifica.

## Interruttore rosso
`window.__CPM_NO_PO217` riporta entrambi gli stili al valore precedente (nessun `minHeight`, nessun `marginTop`).

## Limite noto (da verificare)
- `minHeight:"100%"` vale solo se il genitore ha un'altezza definita. Non ho ancora verificato il genitore in `src/15-live-match.jsx:9914`: se non ce l'ha, la modifica non cambia nulla. Va misurato con una partita reale.

## Verifiche eseguite
- `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → ricomposto da 21 frammenti.
- `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE (exit 0).
- `npm run test:logic` (in `tests/visual`) → 43/43 verdi.

## Non ancora fatto
- **Guardiano**: serve una sonda che apra lo schermo scout (fase `matchday` con `showScout` true). Oggi non esiste un hook né un percorso breve per arrivarci; l'harness `openMatch` arriva al provino e alle situation, non alla fase matchday.
- **Foto prima/dopo** a 360, 375 e 412 px, tema chiaro e scuro.
- **Catena grafica** (`ci:grafica`): non lanciata.

## Domanda per il PO (gusto, non decisa)
Le tre card restano di testo uguale. Opzioni:
1. **Gerarchia per importanza**: la difficoltà resta in alto, «Da neutralizzare» e «Consiglio del mister» diventano più marcate (intestazione o accento colore).
2. **Consiglio del mister in evidenza**: unica card in risalto sotto la difficoltà, le altre due compatte.
3. **Lasciare le card uguali** e risolvere solo lo spazio vuoto (come sopra).

Non ho deciso: la modifica corrente tratta solo lo spazio vuoto.
