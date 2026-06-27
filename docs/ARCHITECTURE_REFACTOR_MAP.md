# ARCHITECTURE REFACTOR MAP (Fase F)

> Mappa operativa per il refactoring architetturale del single-file `CARRIER-MANAGER-AV.html` (~20.650 righe).
> Distingue ciò che è **già estratto/testabile** da ciò che è **gate-blind ad alto rischio** e va fatto con
> verifica dal vivo. Onestà: lo split del monolite NON è eseguibile alla cieca (il gate non vede il render).

## 1. Motori PURI — #46 ✅ (estratti e testati a livello tooling)

Funzioni pure, deterministiche, **senza React/Three**. Già caricate node-side e validate da `test:logic` (9/9)
e dal gate. **L'obiettivo di testabilità di #46 è raggiunto** senza toccare il file di gioco.

| Funzione | Riga | Loader node | Test |
|---|---|---|---|
| `deriveIntent` | 1619 | `lib/situations.mjs` | backbone + intent in `situations` |
| `deriveBallState` | 6687 | `lib/situations.mjs` | coerenza aerea |
| `deriveSitCine` | 6699 | `lib/situations.mjs` | cine in `situations` |
| `deriveHL` | 6714 | `lib/cine.mjs` | cine-backbone (179) |
| `buildHLTimeline` | 6786 | `lib/cine.mjs` | cine-backbone + #7 baseline |
| `validateHLTimeline` | 6866 | `lib/cine.mjs` | cine-backbone (invarianti) |
| `decideExecution` | 6918 | `lib/decision.mjs` | decision.test (#19/#30/determinismo) |
| `migratePlayer` | 14030 | `window.__CPM_MIGRATE` | `run-save-compat` (12/12) |

> Questi sono i candidati naturali a un **modulo `engine/`** in un'eventuale build con module system. Finché
> il gioco resta single-file, l'estrazione *logica* è già garantita dai loader (zero duplicazione: estraggono
> dal sorgente). Spostarli fisicamente in `<script>` separati è cosmetico e a basso valore → non prioritario.

## 2. Monoliti RENDER/REACT — #47/#48/#49 🔴 (gate-blind, alto rischio)

| Componente | Riga | Dim. | Perché lo split è rischioso |
|---|---|---|---|
| `ThreeMatchView` | 7036–~8998 | ~1.960 | render-loop, off-ball AI, `animOne`, `fireConclusion`, executor timeline, camera. **Il gate cattura frame congelati → NON valida il render**: uno split errato passerebbe il gate ma romperebbe il gioco dal vivo. |
| `LiveMatch` | 8999–~14029 | ~5.000 | state-machine match (133 useState/refs aggregati), `handleAction`/`handleContinue`, 17 hook `__CPM_*`. Accoppiamento largo con `ThreeMatchView` via props/ref. |
| `CareerApp` | 14279–~19960 | ~5.700 | state-machine carriera (God object `player`), tabs, mercato/coppe/euro, autosave. |

**Confine onesto:** questi split **non sono autonomamente verificabili** (il gate è cieco al movimento e al
flusso completo). Vanno fatti **con verifica dal vivo** (l'utente collauda ogni step) — modalità a coppie.

### Strategia di split sicura (quando si farà)
1. **Prerequisito**: rete C/D attiva (motion/ball-motion/backbone/regression) per intercettare regressioni *strutturali*; il *render* resta da collaudare a mano.
2. **Step ≤300 righe**, uno alla volta, golden + decision-baseline + backbone-baseline come rete sullo stato/decisione/narrazione.
3. **Ordine a rischio crescente**: prima estrarre helper puri/UI primitives (basso rischio), poi sotto-componenti UI di `CareerApp` (tabs), infine il render-loop di `ThreeMatchView` (massimo rischio, solo con collaudo dal vivo per ogni step).
4. **Verifica per step**: gate 12/12 + `test:vision` + `test:logic` + **collaudo visivo dell'utente** (obbligatorio per `ThreeMatchView`/`LiveMatch`).

## 3. Magic numbers / regex (#51/#52) 🟡
Soglie off-ball AI (`6.5`, `24`, `0.42`…) e regex d'esecuzione (cross/testa/volée) ripetute inline nel render.
Centralizzarle tocca il file di gioco (gate-blind sul render) → **basso valore / rischio non nullo**: da fare
contestualmente allo split del componente che le contiene, con collaudo dal vivo. Non in isolamento.

## 4. Plugin/Registry (#59–#65) 🔴
Il gioco è single-file global-scope senza module system → un plugin runtime è un cambio architetturale grande,
fuori dallo scope di un intervento sicuro incrementale. I check del gate sono già modulari (`checks/*.mjs`,
import statico): il "plugin system" lato QA è parzialmente realizzato; lato gioco resta da progettare.

## Conclusione
- **#46 (testabilità motori puri): ✅ raggiunto** a livello tooling (loader + `test:logic`).
- **#47/#48/#49 (split monolite): preparati, non eseguiti alla cieca** — richiedono collaudo dal vivo (gate-blind).
- **#51/#52/#59–65: contestuali allo split / cambi grandi** — non isolati, non autonomi.

> Questa mappa è il deliverable SICURO di Fase F: rende lo split *eseguibile e verificabile* in una sessione
> dedicata con l'utente, senza aver introdotto rischi in produzione.
