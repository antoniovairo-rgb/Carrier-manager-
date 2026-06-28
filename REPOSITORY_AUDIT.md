# REPOSITORY_AUDIT.md — Fase 1 (Master Execution Plan)

> Audit completo del repository **Career Player Manager (CPM) / Live Match Development Platform**.
> Stato: GAME_VERSION **5.39.0** · SAVE_VERSION **7** · `CARRIER-MANAGER-AV.html` **20.664 righe** · prod `main`=`1db34ea` (live ✅).
> Approfondimento storico: `docs/TECHNICAL_DISCOVERY_REPORT.md`. Mappe correlate: `ARCHITECTURE_MAP.md`, `DEPENDENCY_MAP.md`, `TECHNICAL_DEBT.md`.

## 0. Sintesi
Il progetto è un **career simulator calcistico single-file** (controlli un giocatore U18→pro) in `CARRIER-MANAGER-AV.html` (React 18 + Three.js r128 + Babel-standalone in-browser, **zero build step**), affiancato da una **Live Match Quality Platform (LMQP)** sotto `tests/visual/` (Playwright + suite node) e da un corpus documentale (charter + 6 spec). Il gioco è **maturo e stabile**; la LMQP è stata **fortemente ampliata** (gate 9→12 categorie + suite logica node + AI Vision + 3 baseline di regressione + CI completa).

## 1. Codice & struttura
- **Gioco:** 1 file, `<script type="text/babel">`, global scope, dichiarazioni in ordine di dipendenza. Nessun module system.
- **LMQP:** `tests/visual/` — `validate-situations.mjs` (orchestratore gate), `checks/` (**12** validator modulari), `lib/` (harness + loader puri + vision/), `test/{vision,logic}/` (**11** file di test), runner ausiliari (`run-save-compat`, `run-stress`, `run-replay`, `cross-validate`, `vision-compare`).
- **Docs:** governance a root (MASTER_PROMPT, LIVE_MATCH_QA_SPEC, VALIDATORS, DEVELOPMENT_RULES, ACCEPTANCE_CRITERIA, AI_VISION_REVIEW, ROADMAP, LIVE-MATCH-ENGINE) + report/mappe in `docs/`.
- **CI:** `.github/workflows/validate-situations.yml` esegue su ogni push: test:vision · test:logic · gate · save-compat · replay. `deploy-pages.yml` pubblica su Pages da `main`.

## 2. Architettura (dettaglio → `ARCHITECTURE_MAP.md`)
Pipeline **simulation-first**: `Situation(intent) → Decision(decideExecution) → Cinematica(deriveHL/timeline) → Render(ThreeMatchView) → Animazione`. State machine partita in `LiveMatch`; state machine carriera in `CareerApp` con oggetto-stato unico `player`. Router `App` (phase: loading→home→…→career).

## 3. Dipendenze (dettaglio → `DEPENDENCY_MAP.md`)
Hub: `player` (God object), `ThreeMatchView` (render-loop ~1.960 righe), `LiveMatch` (~5.000), `CareerApp` (~5.700). Motori logici puri (`deriveIntent`/`decideExecution`/`deriveHL`/`buildHLTimeline`/`validateHLTimeline`) **disaccoppiati da React/Three** → riusati node-side dalla LMQP. Nessuna dipendenza circolare a livello di modulo; accoppiamento forte `LiveMatch⇄ThreeMatchView` via props/ref/`__CPM_*`.

## 4. Live Match Engine
- **`deriveIntent`** (L1619): classifica ogni situation in 1 di **13 intenti** (penalty/freekick/cross/through/dribble/onetwo/insertion/shot/progression/switch/recover/anticipate/intercept). Legge ancora `sit.text` (regex) MA ora rispetta l'override `tactic.it` (5.39.0, intent-decouple). Intent **congelato** in `sit.intent` alla costruzione.
- **`decideExecution`** (L6918): Decision Engine puro/deterministico (PRNG LCG seedato) — da intent+contesto (attrs/pressure/fatigue/morale/x/weather/foot) produce `{execution,outcome,quality}`. Validato: forte+libero≫debole+pressato, 0 esiti impossibili (`test:logic`).
- **Cinematica:** `deriveBallState`/`deriveSitCine` (text-free, da intent+`tactic.bs`/`tactic.cn`) → `deriveHL` (type/pattern/variant) → `buildHLTimeline` (beat) → `validateHLTimeline` (invarianti: possesso continuo, no teleport, testa⇐cross, n.passaggi) → `resolveTimeline`.
- **Stato:** SITUATIONS **179** (3 azioni ciascuna), tutti i 13 intenti usati. Invariante CINE: testa/volée solo su palla aerea (FAIL bloccante).

## 5. Rendering (`ThreeMatchView`, L7036)
- Three.js r128, monta una volta (`useEffect []`), aggiorna via ref (no re-render nel loop). `buildStadium` una volta; folla = `CanvasTexture` procedurali.
- Render-loop (`requestAnimationFrame`): `updateFootballState` (throttle), **off-ball AI** (shape-flow possession-aware, pressing, marcatura goal-side, press&cover F10/F11, repulsione anti-ammucchiate, portiere che stringe l'angolo F13), `animOne` (crossfade corsa↔idle `_runB`), `fireConclusion` (swing+arco), executor timeline.
- **Punti critici:** allocazioni per-frame nell'off-ball AI (GC mobile); O(N²) su più passi (22 attori); render-loop monolitico ~1.960 righe. **Limite strutturale:** il gate cattura frame congelati → non valida la resa visiva (perceptual → AI Vision/occhio).

## 6. Database
- Nessun DB: costanti statiche (`CLUBS` 9 leghe, `SITUATIONS` 179, `BG_MATCH` **161**, `NAME_BY_NAT`, `LEAGUE_RECORDS`, `WEEKLY_EVENTS`). "Catalogo Situation" = array (non registry con metadati).
- **Qualità dati validata** (`test:logic` data-audit/cronaca-audit): 0 duplicati, 0 malformati, tassonomie coerenti (stat/rew/fail/intent/zone; cronaca pd/ef/ms/segnaposto).

## 7. Persistenza
- `storage` async (window.storage nativo / localStorage), 3 slot. Autosave su ogni change di `player`. Integrity-check (richiede name), JSON corrotto → `{_corrupted}`.
- **Migration:** `migratePlayer(player)` (L14030) — **funzione pura estratta** (5.37.2), ~79 backfill per-campo accretivi. `SAVE_VERSION=7` scritto ma non usato come gate di migrazione (field-presence based, robusto). **Test `save-compat`** (12/12) esercita la migration reale su save storici sintetici (path prima gate-blind).

## 8. Simulation
- Background: `simulateMatch` (gol pesati per prestige), `updateStandings`; calendario `generateSeasonCalendar` (deterministico, seed `season*777+hashStr`); `initStandings`. Cronaca background `BG_MATCH` (densità scalata sul momentum).
- Live: `LiveMatch` (matchday→formations→walkout→playing→hl_*→ended), HL pescati da SITUATIONS, BG tick 300ms.

## 9. Replay
- **`lib/replay.mjs` + `run-replay.mjs` (D1 slice, questa sessione):** registra l'**arco completo** dell'highlight (choose→resolve, ~16 frame: palla/eroe/22 giocatori/fase + eventi) → `out/validate/replay/full_NNN.json` e **valida completezza/coerenza** (AC-051…055). In CI.
- `lib/replay-trace.mjs` (LMQP-10/11): traccia per-frame del post-highlight (campione) + Replay Viewer 2D nel report.
- **Manca (sprint):** Replay Debugger UI, video, eventi per-frame del render, snapshot/diff tra build.

## 10. Camera (regia)
- Regia per-pattern (CINE-5, preset drift, `HL_ZONE_COL`), camera-target via ref, `orientation` check (abovePitch). **Qualità di regia (framing/leggibilità) = perceptual** → valutata dall'**AI Vision** (cameraQuality 50-65 sul build attuale), non da soglie geometriche (provato: i frame su crossing/difensiva mostrano hero/ball off-screen ma azione leggibile → soglie geometriche = falsi positivi).

## 11. Animazioni
- `animOne` (locomozione, crossfade `_runB`), animazioni eroe variant-aware (shot/cross/header/tackle/dribble/pass/build), wind-up, post-archi. AI Vision: animationQuality ~40-55 ("rigide/basilari"). **Validazione = perceptual** (AI Vision) o occhio; il gate valida solo lo stato/movimento-esistenza (motion/ball-motion).

## 12. Pipeline completa (Situation→Report)
`SITUATIONS → selectContextualSituations → decideExecution → deriveHL/timeline → render(off-ball+conclusione) → cpmEmit/MATCH_TL → samplePostHighlight/replay → 12 validator → AI Vision → report(run-summary+HTML+dashboard)`. Tutto **deterministico/seedato**; 3 baseline di regressione (golden=stato · decision=decisione · backbone=narrazione).

## 13. Stato QA (rete automatica attuale)
Gate **12/12** · `test:vision` **28/28** · `test:logic` **16/16** (Decision Engine, cine-backbone su 179, backbone-regression, data-audit, cronaca-audit) · `save-compat` 12/12 · `replay` 8/8 · `stress` 220 HL · AI Vision (situation-recognition/cross-validation/build-comparison) · CI esegue tutto. **Fingerprint `00001505` invariato** da inizio sessione = zero regressioni comportamentali.

## Exit Criteria Fase 1
✅ Repository completamente compreso (codice/architettura/dipendenze/engine/rendering/db/persistenza/simulation/replay/camera/animazioni/pipeline). ✅ Nessun componente sconosciuto. Deliverable prodotti: questo file + `ARCHITECTURE_MAP.md` + `DEPENDENCY_MAP.md` + `TECHNICAL_DEBT.md`.
