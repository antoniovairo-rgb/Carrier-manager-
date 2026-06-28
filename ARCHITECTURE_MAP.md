# ARCHITECTURE_MAP.md — Fase 1 (Master Execution Plan)

> Mappa architetturale di CPM / Live Match Development Platform. Stato 5.39.0. Vedi anche `REPOSITORY_AUDIT.md`, `DEPENDENCY_MAP.md`.

## 1. Macro-architettura
```
┌─────────────────────────── CARRIER-MANAGER-AV.html (single-file, ~20.664 righe) ───────────────────────────┐
│  DATA            ENGINE (puro)              REACT / RENDER                         PERSISTENZA              │
│  CLUBS           deriveIntent (13)          App (router phase)                     storage (3 slot)         │
│  SITUATIONS 179  decideExecution            ├─ Home/Create/Trial/Offers           migratePlayer (pura)     │
│  BG_MATCH 161    deriveHL / timeline        ├─ LiveMatch (state machine match)     autosave useEffect       │
│  NAME_BY_NAT     deriveBallState/SitCine    │   └─ ThreeMatchView (render-loop 3D)                          │
│  LEAGUE_RECORDS  buildHLTimeline/validate   └─ CareerApp (state machine carriera, `player` God object)      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
        │ osservabilità: window.__CPM_* (17 hook) + cpmEmit→MATCH_TL (ring buffer)
        ▼
┌─────────────────── LMQP (tests/visual/) — indipendente dal gameplay ───────────────────┐
│  validate-situations.mjs (orchestratore)  →  checks/*.mjs (12)  →  report.mjs (+Dashboard)│
│  lib/: harness · situations/decision/cine/bgmatch (loader puri) · replay · perf · vision/ │
│  test/{vision(28),logic(16)}  ·  runner: save-compat/stress/replay/cross-validate/vision-compare │
│  CI: gira tutto ad ogni push                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Layer del gioco (ordine di dipendenza, single scope)
| Range ≈ | Layer | Contenuto |
|---|---|---|
| 1–151 | Shell | HTML, CDN, spinner, theme |
| 152–1618 | Data | AVATARS, CLUBS, U18, LEAGUE_RECORDS, WEEKLY_EVENTS, BG_MATCH(2126–2315) |
| **1619–1653** | Engine | **deriveIntent** (+override tactic.it) · costruttori S/A |
| 1654–2410 | Data | **SITUATIONS** (179) · ZONES |
| 2410–4860 | Core | calcOvr, succRate, **storage**, debug tools, Claude API, calendario/sim |
| 4860–6686 | Scene | makeCrowdTex, buildStadium, UI primitives |
| **6687–6973** | Engine | deriveBallState/SitCine · deriveHL · buildHLTimeline/validate/resolve · **decideExecution** |
| 6974–7035 | Bus | intentLabel/Title · **cpmEmit/MATCH_TL** |
| **7036–8998** | Render | **ThreeMatchView** (render-loop, off-ball AI 7826+, fireConclusion, executor) |
| 8999–14029 | Match | **LiveMatch** (state machine, handleAction/Continue, 17 hook __CPM_*) |
| **14030–14276** | Save | **migratePlayer** (pura) |
| 14279–19960 | Carriera | **CareerApp** (`player`, tabs, mercato/coppe/euro, autosave/migration) |
| 19961–20664 | Root | App router + mount |

## 3. Pipeline simulation-first (flusso di controllo)
```
Situation (INTENT, sorgente unica)
   ↓ decideExecution(intent, ctx{attrs,pressure,fatigue,morale,x,weather,foot,seed})
Decision {execution, outcome, quality}   ← puro, deterministico (seed)
   ↓ deriveHL(sit,act) → {type,pattern,variant}
   ↓ buildHLTimeline → beats → validateHLTimeline (invarianti) → resolveTimeline
Render-loop (ThreeMatchView): off-ball AI + animOne + fireConclusion(arco modulato dalla quality)
   ↓ cpmEmit → MATCH_TL (HighlightForced/ActionResolved/HighlightTimeline/HighlightAdvance)
Osservabilità → LMQP (probe/replay/validator) → Report
```

## 4. State machines
- **App.phase** (non persistito): `loading→home→create→trial→offers→career`.
- **LiveMatch.phase**: `matchday→formations→walkout→playing→hl_intro→hl_move→hl_choose→hl_result→ended`. Le `hl_*` sono highlight interattivi; tra HL il clock avanza (BG tick) emettendo `BG_MATCH`.
- **CareerApp**: tab dashboard/calendar/standings/training/profile; tutto in `player` (autosave); migration al mount.

## 5. Confini architetturali (cosa è disaccoppiato)
- **Motori puri** (deriveIntent/decideExecution/deriveHL/buildHLTimeline/validateHLTimeline/deriveBallState/deriveSitCine/migratePlayer): nessuna dipendenza React/Three → **caricati e testati node-side** dalla LMQP (`lib/{situations,decision,cine,bgmatch}.mjs`). È il confine pulito.
- **Render/React-coupled** (ThreeMatchView/LiveMatch/CareerApp): monoliti, gate-blind sul render → split solo con collaudo dal vivo (vedi `docs/ARCHITECTURE_REFACTOR_MAP.md`).
- **LMQP**: completamente separata dal gameplay; osserva via `window.__CPM_*` + `MATCH_TL`. Open/Closed sui provider AI Vision.

## 6. Coordinate
Logica `{x:0–100, y:0–100}` (x=100 = porta avversaria); mondo Three.js `{x:-50..+50, z:-30..+30}` via `toThree`/`G2X`/`G2Z`. `__CPM_STATE().players` espone le posizioni **mesh** (visive) riconvertite in coord di gioco.
