# Rapporto giro 374 — PO-633 «‹In linea› fino a fine stagione»

Base: `lavoro/201` @ 8543a9cc (7.999.215 + giro 364). Ramo: `sviluppo/giro374-obiettivo`. GAME_VERSION e `docs/governo` non toccati.

## Il difetto (misurato prima)
`objDone(obj,cur)` (src/09) dice se la posizione **di adesso** centra il bersaglio. Home e rassegna di fine partita lo usavano
come «traguardo raggiunto»: con la squadra nella zona l'obiettivo di classifica mostrava ✅ (e «FATTO» in Home) a stagione in corso.

Misura (guardiano `obiettivo-374`, braccio rosso `__CPM_NO_G374` = comportamento di prima, calendario vero di 34 giornate di
campionato, squadra prima in classifica):
- **33 giornate su 34 con ✅ prima dell'ultima** (tutte quelle in cui si era nella zona);
- **2 schermate** su cui compariva: Home («Obiettivi della stagione», ✅ + «FATTO») e rassegna di fine partita (`obiettivo224`, ✅).

Gli altri punti in cui compare lo stesso obiettivo, controllati uno per uno:
| Punto | File | Quando | Esito |
|---|---|---|---|
| Home, riquadro «Obiettivi della stagione» | src/18 ~9727 | in stagione | **corretto** |
| Rassegna di fine partita (obiettivo224) | src/15 ~13407 | in stagione | **corretto** |
| Scheda Club «La stagione» (giro 337) | src/18 ~10703 | in stagione | gia' «in linea» / «sotto l'obiettivo», nessun ✅; non toccata |
| Scheda presidente (apertura) / card apertura Home | src/18 ~8057, ~9626 | inizio stagione | solo 🎯, non toccate |
| Voci del presidente (clubVoices, deriveStances) | src/18 ~2466, src/17 ~2932 | in stagione | umore, nessun ✅; non toccate (vedi dubbio 3) |
| Notifiche di traguardo (Sprint 73) | src/18 ~4480 | in stagione | solo gol/assist/presenze, mai la classifica; non toccata |
| Verdetto di fine stagione, presidente e mister di fine stagione | src/16 ~3436, ~3506 | stagione chiusa | `objDone` a stagione chiusa = stessa regola; non toccati |
| Bonus/malus di fine stagione, bilancio conferenza (pledgeOutcome) | src/18 ~5710, ~2279 | stagione chiusa | idem; non toccati |

## La correzione (alla sorgente, una funzione)
src/09, accanto a `objDone`:
- `stagioneChiusa374(p, oraGiocata)` — chiusa = nessuna giornata di campionato (`!type` o `type:"league"`) ancora da giocare;
  `oraGiocata` conta come giocata la partita appena finita (rassegna, che mostra la classifica DOPO la giornata). Calendario
  assente → `true` (regola di prima, nessun modo di saperlo).
- `statoObiettivo374(obj, cur, chiusa)` → `{k, done}` con `k` ∈ `fatto · mancato · in_linea · sotto · in_corso`. Solo l'obiettivo
  di **classifica** cambia: a stagione aperta e' `in_linea`/`sotto`, mai `done`. Gol/assist/presenze invariati (raggiunto il
  numero, il traguardo e' vero e non si perde).
- Hook di lettura `window.__CPM_OBJ374` / `__CPM_CHIUSA374`. Rosso `window.__CPM_NO_G374`.
- Deterministico, nessun campo nuovo nel salvataggio, nessun SAVE bump.

Siti collegati: Home (src/18: ✅/FATTO solo a stagione chiusa, a destra «3° / top 4 · in linea» o «· sotto») e rassegna
(src/15: «1° ora · in linea» / «8° ora · sotto»). Entrambi espongono `data-obj374`.

## Misura dopo (guardiano `npm run obiettivo-374`, verde + rosso, 2 min 26 s)
```
VERDE: M giornate 34 · ✅ prima dell'ultima 0 · ✅ all'ultima true · fuori zona a fine mancato
  A1 in_linea «🎯 Finisci nei primi 41° ora · in linea»
  A2 sotto «🎯 Finisci nei primi 48° ora · sotto»
  A3 fatto «✅ Finisci nei primi 41° ora»
  H1 in_linea «🎯 Finisci nei primi 41° / top 4 · in linea»
  H2 fatto «✅ Finisci nei primi 4FATTO»
ROSSO __CPM_NO_G374: M giornate 34 · ✅ prima dell'ultima 33 · ✅ all'ultima true · fuori zona a fine mancato
  A1 fatto «✅ Finisci nei primi 41° ora»
  A2 mancato «🎯 Finisci nei primi 48° ora»
  A3 fatto «✅ Finisci nei primi 41° ora»
  H1 fatto «✅ Finisci nei primi 4FATTO»
  H2 fatto «✅ Finisci nei primi 4FATTO»
✅ obiettivo-374
```
Riga della MAPPA: quella che esiste gia' per `src/18-|src/10-` (ci-runner.mjs). `npm run mappa-unica` verde.

## File e funzioni toccati
- `src/09-audio-scout-anagrafiche.jsx`: aggiunte `_g374`, `stagioneChiusa374`, `statoObiettivo374` (dopo `objDone`, che resta identica).
- `src/15-live-match.jsx`: rassegna di fine partita, blocco «(b) numeri di stagione» (`_obj`), variabile `_md0336`, attributo `data-obj374`.
- `src/18-career-app.jsx`: `CareerApp`, riquadro Home «Obiettivi della stagione» (3 righe).
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`).
- `tests/visual/obiettivo-374.mjs` (nuovo), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (riga MAPPA).

## Guardiani della zona NON girati (li giudica il treno)
`home-298`, `club-337`, `classifica-259` (legge il numero di `obiettivo224`: il testo ora ha « · in linea» dopo «N° ora», la sua
regex prende il primo numero — compatibile, non verificato qui), `salienti-229`, `home-199`, `home-335`, `career-critical`,
`save-compat`, `test:logic`, gate `validate-situations`.

## Dubbi per il PO (consigliata per prima, GIA' APPLICATA)
1. **Che cosa dire a stagione aperta.**
   - **(applicata) 🎯 + «in linea» / «sotto» accanto alla posizione**, ✅ e «FATTO» solo a stagione chiusa: il testo che il PO ha chiesto, la scheda Club del giro 337 dice gia' lo stesso.
   - un'etichetta colorata «IN LINEA» al posto di «FATTO» (piu' visibile, ma un riquadro in piu' nella riga);
   - nessuna parola, solo 🎯 e la posizione (piu' sobrio, ma non si capisce se si e' dentro o fuori).
2. **Quando la stagione e' «chiusa».**
   - **(applicata) quando non resta nessuna giornata di CAMPIONATO da giocare** (coppe ed Europa non contano: l'obiettivo e' di classifica);
   - alla settimana 38 / al verdetto di fine stagione (✅ non si vedrebbe mai fra l'ultima giornata e il verdetto);
   - quando la posizione e' matematicamente certa (✅ anche prima dell'ultima giornata se nessuno puo' piu' superarti: piu' giusto, ma un calcolo in piu' e una regola diversa da spiegare).
3. **Voci del presidente in stagione** (`clubVoices`, `deriveStances`): leggono `p.seasonObjectives.position`, che non esiste
   (`seasonObjectives` e' una lista), quindi il presidente confronta sempre con «meta' classifica» e non col vero obiettivo.
   Non tocca il ✅ e resta fuori ambito.
   - **(applicata) lasciarle come sono e aprirne una voce di backlog**;
   - correggerle qui leggendo il target dell'obiettivo di classifica (`ambizione337`), cambiando gli umori gia' visti dal PO;
   - toglierle.

## Sentinelle
`node ci-runner.mjs giro obiettivo-374` sul build 7.999.215 + giro 374: **18/18 verdi** (obiettivo-374 + 17 sentinelle, fra cui
`home-298`, `career-critical`, `partita-vera`, `griglia-mobile`, `design-system`). Le foto rigenerate da `griglia-mobile` in
`docs/collaudo-grafico` e `docs/governo/STABILITA.json` scritti dal runner sono stati riportati com'erano (non si toccano da un giro).
