# Rapporto giro 417 — PO-681 «se il gioco è in pausa i pulsanti non devono essere cliccabili»

Ramo: `sviluppo/giro417-pausa` · base `main` 7.999.217 · GAME_VERSION e `docs/governo` **non toccati**.

## 1. Riproduzione (misura prima della correzione)

Sonda `tests/visual/misura-417.mjs` (GLB acceso, provino vero, scena «Solo davanti al portiere!» forzata in `hl_choose`,
pausa col tasto P). Le scelte si riconoscono dal loro gestore (`handleAction`/`handleSetPiece`), non dal testo.

| Misura | PC 1920×1080 prima | Telefono 390×844 prima |
|---|---|---|
| Clic veri del mouse/tocco su una scelta, in pausa | **1 su 1 ESEGUITA** (fase `hl_result` con la pausa ancora sopra) | 0 su 6: il tocco lo prende il velo «Tocca per riprendere» (che toglie la pausa) |
| Invio/Spazio su un tasto di scelta a fuoco (clic da DOM) | non arrivato (già eseguita) | **1 su 1 ESEGUITA** |
| Tasti 1/2/3 | già bloccati da `if(paused)return` | già bloccati |
| Tasto velocità in pausa | **cambia** | **cambia** |
| Aspetto dei tasti in pausa | pieno (opacità 1, nessun `aria-disabled`) | pieno |

Causa misurata: il velo della pausa (`src/15`, `zIndex:30`) copre solo il **campo**. Su PC la colonna destra delle
scelte e la barra in alto stanno fuori dal velo, e nessun gestore controllava `paused` (la tastiera sì, i clic no).

Foto: `docs/collaudo-po/417-prima-scelte-pausa-pc-1920x1080.png` (scelte piene accanto a «PAUSA»),
`417-prima-scelte-pausa-tel-390x844.png`, `417-prima-velocita-pausa-tel-390x844.png`.

## 2. Correzione alla sorgente

**File toccati**
- `src/15-live-match.jsx` (`LiveMatch`):
  - subito dopo `const [paused,setPaused]`: `_g417`, `_pausa417` (pausa in `playing`/`hl_*`), `pausa417Ref`,
    `radice417Ref`, `_blocca417` (filtro di cattura) e un `React.useLayoutEffect` senza dipendenze che in pausa mette
    `aria-disabled="true"` + `data-spento417` su ogni `button` del contenitore della partita (tranne i comandi di pausa) e alla
    ripresa li toglie ripristinando l'`aria-disabled` di prima;
  - `handleAction` e `handleSetPiece`: `if(pausa417Ref.current)return;` **prima** della guardia doppio-tap → in pausa la scelta
    non parte e **non si consuma**;
  - effetto «azione in sospeso» (tasti 0-3 da `hl_move`): in pausa aspetta la ripresa invece di perdere la scelta (`paused` nelle dipendenze);
  - `div` radice del `return` di `LiveMatch`: `ref`, `data-pausa417`, `onClickCapture` e `onPointerDownCapture` = `_blocca417`;
  - comandi che restano vivi, marcati `data-pausa417ok`: i due tasti pausa/ripresa (barra classica e V2), i due tasti audio
    (`data-cpm="audio-partita"`), i due tasti del taccuino, il velo «per riprendere», il pannello del taccuino, il pannello audio
    (avvolto in un `div` `display:contents`).
- `src/00-head.html`: regola `[data-pausa417] button[data-spento417]{opacity:.35;filter:grayscale(.85);pointer-events:none;cursor:default}`.
- `CARRIER-MANAGER-AV.html`: ricomposto (`build-src` + `check-src`).
- `tests/visual/misura-417.mjs` (sonda), `tests/visual/pausa-417.mjs` (guardiano), `tests/visual/package.json`
  (`npm run pausa-417`), `tests/visual/ci-runner.mjs` (riga **esistente** della MAPPA `src/15-`).

Rosso: `window.__CPM_NO_G417` (spegne stato, filtro, aspetto e guardie insieme).

## 3. Misura dopo

| Misura | PC 1920×1080 dopo | Telefono 390×844 dopo |
|---|---|---|
| Scelte eseguite in pausa | **0 su 17** (6 clic veri, 6 Invio/Spazio, 5 tasti 1/2/3/Invio/Spazio) | **0 su 17** |
| Tasti delle scelte in pausa | `aria-disabled="true"`, opacità 0,35, `pointer-events:none` | idem |
| Velocità in pausa | ferma, tasto spento | ferma, tasto spento |
| Tasto ▶ della barra in pausa | vivo, riprende | vivo, riprende |
| Dopo la ripresa, clic sulla stessa scelta | **eseguita** (`hl_result`), tasti di nuovo pieni | **eseguita** |
| Errori di pagina | 0 | 0 |

Foto dopo: `docs/collaudo-po/417-dopo-scelte-pausa-pc-1920x1080.png` (scelte e «1×» spenti, ▶ 🔊 ⚠️ vivi),
`417-dopo-scelte-pausa-tel-390x844.png`, `417-dopo-velocita-pausa-tel-390x844.png`, `417-dopo-scelte-ripresa-pc-1920x1080.png`.

## 4. Guardiano

`npm run pausa-417` (~80 s): verde su PC e telefono (A 0 eseguite su ≥10 tentativi · B tasti spenti · C ripresa che esegue ·
D velocità ferma · E tasto di pausa vivo) **e** rosso con `__CPM_NO_G417` su PC (deve tornare il difetto: misurato 1 scelta
eseguita in pausa). «Non giudicato» = rosso. Riga della MAPPA: `src/15-` (già esistente); `npm run mappa-unica` verde.


## 5. Dubbi per il PO (la consigliata è la prima ed è già applicata)

1. **Cosa si spegne in pausa**
   - **(a) applicata** — tutti i tasti della partita (misurati: scelte e velocità; per costruzione anche «Salta» e gli altri `button` del contenitore, non misurati uno per uno); restano vivi solo pausa/ripresa, velo, audio e taccuino.
   - (b) solo i tasti delle scelte dell'highlight; velocità e il resto restano cliccabili.
   - (c) allargare il velo della pausa a tutta la schermata (colonna destra e barra comprese) invece di spegnere i tasti.
2. **Aspetto dei tasti spenti**
   - **(a) applicata** — opacità 0,35 + quasi grigio: si leggono ancora (si vede cosa si sceglierà alla ripresa).
   - (b) solo opacità 0,5, colori intatti.
   - (c) nasconderli del tutto in pausa.
3. **Al telefono il velo copre la scheda delle scelte e un tocco ovunque riprende la partita** (comportamento di prima, invariato)
   - **(a) applicata** — invariato: tocco sul velo = riprendi, la scelta non parte (serve un secondo tocco).
   - (b) riprendere solo col tasto ▶ della barra (il velo non risponde al tocco).
   - (c) un tocco sopra una scelta riprende e la esegue subito.

## 6. Rituali

`node ci-runner.mjs giro pausa-417` su 7.999.217 + questa modifica: **18/18 verdi** — pausa-417 (81 s), mappa-unica, test:logic,
save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237,
career-critical, battito-264, partita-vera (624 s), gk-dive-sync, schermate-97. Nessun passo ripetuto.
Il gate `validate-situations` completo e il treno della mappa intera non sono stati eseguiti in questo giro (li gira il treno sul vagone).
