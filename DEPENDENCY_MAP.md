# DEPENDENCY_MAP.md — Fase 1 (Master Execution Plan)

> Mappa delle dipendenze di CPM / Live Match Development Platform. Stato 5.39.0. Vedi `ARCHITECTURE_MAP.md`, `REPOSITORY_AUDIT.md`.

## 1. Grafo del gioco (global scope, dipendenze concettuali)
```
deriveIntent ──► S()/A() ──► SITUATIONS (179)        [+override tactic.it]
   deriveBallState / deriveSitCine ┘  (congelati in sit.ballState / sit.cine)
                                   │
   deriveHL(sit,act) ──► buildHLTimeline ──► validateHLTimeline ──► resolveTimeline
                                   │
   LiveMatch (state machine) ──► decideExecution(intent,ctx) ──► {execution,outcome,quality}
        │  props (hlType/variant/ballState/quality/playerX…) + propsRef + window.__CPM_*
        ▼
   ThreeMatchView (render-loop) ◄── propsRef ── off-ball AI · animOne · fireConclusion · executor
        │  cpmEmit ──► MATCH_TL ──► window.__CPM_TIMELINE
   CareerApp (player) ──► LiveMatch (per match) ; autosave ──► storage ; mount ──► migratePlayer
   App (phase router) ──► Home / Create / Trial / Offers / CareerApp
```

## 2. Hub (componenti centrali — alta connettività)
| Hub | Ruolo | Dipendono da lui |
|---|---|---|
| `player` (stato in CareerApp) | God object (identità/carriera/stats/calendar/standings/cup/euro/injury…) | tutto il flusso carriera + autosave + migration |
| `ThreeMatchView` | render-loop (off-ball AI, locomozione, conclusione, camera, executor) | LiveMatch (props/ref) |
| `LiveMatch` | state machine match + 17 hook `__CPM_*` | CareerApp/Trial; pilota ThreeMatchView |
| `decideExecution` / `deriveHL` | keystone logico (esecuzione/cinematica) | LiveMatch + LMQP (node) |

## 3. Dipendenze forti vs deboli
- **Forti (accoppiamento):** `LiveMatch ⇄ ThreeMatchView` (props larghe + `propsRef` + `window.__CPM_*` letti/scritti da entrambi i lati). `CareerApp → tutto` (via `player`).
- **Deboli/sane:** i motori puri NON conoscono React/Three → la LMQP li carica node-side senza browser (`lib/situations.mjs` estrae deriveIntent/deriveBallState/deriveSitCine+S/A/SITUATIONS; `lib/decision.mjs` decideExecution; `lib/cine.mjs` deriveHL/buildHLTimeline/validateHLTimeline; `lib/bgmatch.mjs` BG_MATCH).

## 4. Dipendenze circolari
- **A livello di modulo:** nessuna (single file, ordine top-down; function declarations hoisted).
- **A livello concettuale:** ciclo `LiveMatch ⇄ ThreeMatchView` via `propsRef`/`window.__CPM_*` (i hook di test leggono/scrivono stato React) — accoppiamento bidirezionale, non circolarità d'import.

## 5. Dipendenze esterne (runtime)
- **CDN UMD:** React 18.2.0, ReactDOM, Three.js r128 (+GLTFLoader/SkeletonUtils), Babel-standalone 7.23.6, Phaser. **Single point of failure** in prod (se il CDN cade, il gioco non carica). Mitigato SOLO nel gate (route-interception → node_modules locali), **non in produzione**.
- **Opzionale:** Claude API in-game (`callClaudeAPI`, gated da API key; modello `claude-sonnet-4-6`).
- **AI Vision (LMQP):** Ollama Cloud (`gemma3:27b`) via `.env` (gitignored).

## 6. Grafo LMQP (pulito, modulare)
```
validate-situations.mjs ──► lib/harness.mjs (server/browser/probe/sampler)
                        ├─► lib/situations.mjs (loader SITUATIONS+motori intent)
                        ├─► checks/*.mjs (12: initial-state·orientation·visual·movements·golden·
                        │                 final-state·determinism·post-highlight·data-coherence·
                        │                 timeline·motion·ball-motion)
                        ├─► lib/{failure-collector,perf-monitor,replay-trace,replay,ai-vision}
                        └─► report.mjs (HTML + LMQP Dashboard)
test/logic/*  ─► lib/{situations,decision,cine,bgmatch}  (motori puri)
test/vision/* ─► lib/vision/*  (engine AI Vision; provider Open/Closed: ollama/anthropic/openai/gemini)
baseline committate: golden-sigs.json · decision-baseline.json · backbone-baseline.json · vision-baseline.json
```
- I check sono **importati staticamente** (non plugin runtime → cap. 3.12/3.13 ancora da costruire). Nessuna dipendenza circolare nella LMQP.

## 7. Colli di bottiglia (dipendenze problematiche)
1. **File unico** → ogni modifica tocca lo stesso file; nessun confine di modulo per il gioco.
2. **`player` God object** → serializzazione monolitica, ogni sotto-sistema vi dipende.
3. **Render-loop monolitico** + accoppiamento `LiveMatch⇄ThreeMatchView`.
4. **CDN runtime** in produzione (no fallback locale fuori dal gate).
5. **`window.__CPM_*` (17 hook)** = contratto implicito tra gioco e LMQP (da documentare formalmente).
