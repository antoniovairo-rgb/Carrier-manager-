---
name: game-qa
description: "Router della verifica su Korward Elite: dato cosa hai toccato (motore 3D, situations, esiti, carriera, tornei, economia, migration, testi, UI, GLB, store) dice quale suite lanciare, se il gate 14/14 la vede o e' cieco, e impone il metodo misura-correggi-rimisura prima di dichiarare chiuso un bug."
---

# game-qa — cosa lanciare, e cosa il gate NON vede

## Quando si attiva
Dopo ogni modifica a `CARRIER-MANAGER-AV.html`, prima di dichiarare chiuso un bug, prima di ogni push.
Non e' una checklist morale: e' un router. Trova la riga dell'area toccata, lancia quelle suite, leggi i numeri.

## Metodo — No Blind Fix (non negoziabile)
1. **Misura prima.** Numero riproducibile del difetto (probe, sweep, hook). Nessuna misura ⇒ nessuna patch.
2. **Correggi al chokepoint unico.** Un solo punto (vedi skill `architect`), mai N rami paralleli.
3. **Ri-misura.** Stesso comando di prima: il numero deve muoversi nella direzione attesa. Riporta prima→dopo.
4. **Lascia un guardiano.** Se il bug e' alla **seconda** comparsa, la probe permanente e' obbligatoria
   (dettagli su come scriverla e dove metterla: skill `auto-regression`).
Correlati: credibilita' calcistica → `realism-reviewer` · fps/GC/heap → `performance-analyzer` ·
filiera store → `production-ready` · leggibilita' schermate → `ui-reviewer`.

## Router — area toccata → suite
| Area toccata | Suite da lanciare (da `tests/visual/`) | Il gate la vede? |
|---|---|---|
| Qualunque cosa nel file di gioco | `npm run validate-situations` (14/14) | — e' il gate |
| Render-loop, `animOne`, AI off-ball, archi palla | `node live-validator.mjs` (LMV_CTX=career e trial) + `shape-analyzer` `distribution-analyzer` `realism-analyzer` | **NO** (frame congelati) |
| Traiettorie/teleport/foot-slide | `footslide-test` `passlane-test` `ball-scene-snap-test` `carry-ball-test` | **NO** |
| SITUATIONS (aggiunte/testi/`it`/`bs`) | gate + `validate-situations:update-golden` (rigenera e committa) | SI (data-coherence, golden) |
| Esiti / Decision Engine / `decideExecution` | `npm run engine-sweep` · `npm run def-sweep` · `defensive-outcome-test` `defensive-live-test` | parziale (timeline) |
| Catene, secondo tempo | `chain-coherence-test` + `action-sweep` | **NO** |
| Portiere, riflessi, set-piece | `gk-reflex-test` `setpiece-test` `aerial-contact-test` `woodwork` | **NO** |
| Cronaca BG / microsim punteggio | `bg-microsim-test` | SI (bg-coherence) |
| Carriera: settimana, classifiche, avanzamento | `career-invariants` `career-sim-test` `tripath-chokepoint-test` | **NO** (cieco) |
| Tornei, coppe, Europa, Nazionale | `stab-nat-trigger-test` `cup-zombie-test` `euro-ko-zombie-test` `euro-holder-test` `dup-fixture-test` | **NO** |
| Economia, mercato, valore, simulazione | `sim-balance-test` `market-value-test` `attendance-sim` `club-evolution-sim` | **NO** |
| Migration / `SAVE_VERSION` / save | `save-stamp-test` · `npm run save-compat` · `npm run stress` | **NO** |
| Testi mostrati all'utente | `text-typo-lint` `no-calendar-year-test` `no-official-acronym-test` | **NO** |
| UI CareerApp, dashboard, pannelli | screenshot con harness + `devtools-visibility-test` `collaudo338-test` | **NO** |
| Modelli CH38 / gesti / percettivo | `glb-gesture-smoke` · `VS_GLB=1 node vision-contact-sheets.mjs` | **NO** (gate GLB OFF) |
| Nomi club/stadi/record (copyright) | `node tools/audit-copyright.mjs` → deve dare **0 hit** | **NO**, bloccante store |
| Build offline / dist | `node tools/build-dist.mjs && node tools/validate-dist.mjs` | **NO** |

## Comandi
```bash
# GATE — obbligatorio prima di ogni push che tocca il file di gioco (~10 min)
cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run validate-situations
# atteso: 14/14 · "✅ PASS" · fingerprint 00001505 · 0 failure (i warn NON bloccano)
# il verdetto si legge da run-summary.json, mai dallo scroll: one-liner in `production-ready`

# loop di sviluppo, ~2 min — NON sostituisce il gate
npm run quick-gate

# guardiani carriera (settimana/classifiche/tornei/economia/mercato/migration): comandi e cosa
# asserisce ciascuno in `auto-regression`

# partite VERE (il gate non le gioca)
LMV_CTX=career LMV_MATCHES=3 node live-validator.mjs
LMV_CTX=trial node live-validator.mjs
# baseline: LMV_UPDATE_BASELINE=1 (solo se il cambio di numeri e' voluto e spiegato)

# motori puri, decine di migliaia di contesti
npm run engine-sweep && npm run def-sweep
```

### action-sweep — STRUMENTO D'INDAGINE, non gate
Setaccio: forza tutte le 191 situations, risolve un'azione, legge `draftBugNote` (quello che il gioco stesso
dichiara di aver visto) e produce l'elenco oggettivo delle azioni difettose per classe. Serve a **trovare** i
bug, non a sbarrare un push; non ha soglie e non va messo in CI.
```bash
node action-sweep.mjs                      # esito fail su tutte
AS_OUT=success node action-sweep.mjs       # esito riuscito
AS_FROM=0 AS_TO=60 AS_ACT=1 node action-sweep.mjs   # fetta, per girarlo in parallelo
AS_WAIT=3400 node action-sweep.mjs         # finestra: sotto i 3400ms la scena non e' finita
```
Difetti tipici che pesca: gol che non entra · palla che si ferma prima della linea · assist che non arriva ai
piedi · palla che torna indietro (boomerang) · statue con palla viva · esito dichiarato ≠ scena mostrata.

## Criteri di uscita
- Gate 14/14, `✅ PASS`, fingerprint `00001505`, 0 failure.
- Ogni riga del router pertinente all'area toccata e' stata lanciata, non solo il gate.
- Per ogni difetto: numero **prima** e numero **dopo**, citati nel messaggio di commit/risposta.
- `GAME_VERSION` bumpata (contenuto obbligatorio del commento: `production-ready`).
- Se il push tocca la carriera: i quattro guardiani verdi. Se tocca nomi/testi: `audit-copyright` 0 hit.
- Se una parte resta gate-cieca e non misurata, dillo esplicitamente: "da collaudare dal vivo".

## Errori gia' commessi (non ripeterli)
- **Dichiarare chiuso col solo gate.** Carriera, movimento, GLB, audio, camera, transizioni, cerimonie e UI
  sono ciechi al gate: 29 bug del QA massivo vivevano proprio li'.
- **Misurare male una scena in campo** (presentazione spenta sotto `?cpmtest=1`, verifiche percettive
  GLB-OFF, tempi giudicati a occhio in headless, stacco di scena scambiato per teletrasporto, piano
  della porta sbagliato, medie su sottogruppi opposti, campione singolo): catalogo completo delle
  trappole di misura in `realism-reviewer`.
- **Editare mentre gira il gate** o senza aver letto `GAME_VERSION`: regole in `patch-only`.
- **Rigenerare golden/baseline per far tornare verde.** Si rigenerano solo quando il cambio di numeri e'
  voluto, spiegato e citato nel commit.
