# EXECUTION PLAN — CPM / Live Match Development Platform

> Documento vivo. Sequenzia la **Top 100** del `TECHNICAL_DISCOVERY_REPORT.md` per dipendenza e valore.
> Allineato a `ROADMAP.md` Phase 2 (Engine Stabilization) e al workflow `MASTER_PROMPT`/`DEVELOPMENT_RULES`.
> Stato iniziale: GAME_VERSION 5.37.1 · gate 10/10 · `test:vision` 28/28.

## Principi
- **Safety-net prima del refactoring**: blindare dati/stabilità prima di toccare il cuore del motore.
- **Sblocco #1**: i validator di *movimento* (animazione/camera/replay/NPC/fisica) dipendono dal **layer Event+Timeline fine-granulare + cattura video** → priorità alta perché abilita ~15 interventi a valle.
- **Per ogni sprint**: ≤300 righe nette · gate **10/10** · `test:vision` 28/28 · bump `GAME_VERSION` se tocca il gioco · commit atomici · `main` solo su OK del proprietario.
- **Rischio crescente**: prima LMQP-side (zero save-risk), poi il refactoring del monolite quando esiste la rete per intercettare le regressioni.

## Dipendenze critiche
```
A (safety)  ── indipendente ──►  promuovibile subito
B1→B2 (Event+Timeline+video)  ── sblocca ──►  C1..C4, D1..D2, E3
A2 (cleanup off-ball)  ── abilita ──►  E2 (perf)
C+D attivi  ── prerequisito ──►  F2 (split monolite sicuro)
```

## Fase A — Safety Net & Housekeeping (rischio basso)
| Sprint | Task (Top 100) | Deliverable | Effort | Rischio | Stato |
|---|---|---|---|---|---|
| **A1 — Save safety** | #50 estrai migration in funzione pura ✅ · #2 test save-compat (12/12) ✅ · #3 `SAVE_VERSION` stamp ⏭️ deferito | `migratePlayer()` pura + `run-save-compat.mjs` | M | Basso-Medio | ✅ **fatto** (5.37.2) |
| **A2 — Resource hygiene** | #11 leak-watch (heap monitor in `run-stress`) ✅ · #4 cleanup `setTimeout` ⏭️ · #5 `dispose()` Three ⏭️ · #13 health-check ⏭️ | `run-stress.mjs` | M | Basso-Medio | 🟡 parziale |
| **A3 — Stress & housekeeping** | #10 stress 220 HL no-crash ✅ (`run-stress.mjs`) · #55 gitignore (nessuna spazzatura presente) ✅ · #58/#81/#82/#83 ⏭️ minori | stabilità verificata | S-M | Basso | 🟡 parziale |

## Fase B — Sblocco: Osservabilità del Movimento (Critical)
| Sprint | Task | Deliverable | Effort | Rischio |
|---|---|---|---|---|
| **B1 — Timeline fine** ✅ | #1a backbone narrativo per-beat: evento `HighlightTimeline` (buildHLTimeline+validateHLTimeline) validato dal gate (htCount 23, 19 beat-tag, 0 violazioni). Eventi render-loop fini (BallTouched/CameraChanged) → step successivo | bus eventi beat | L | Medio · **fatto 5.38.0** |
| **B2 — Motion validator** ✅ | **Risolto:** `__CPM_STATE().players` espone GIÀ le posizioni **mesh (visive)** (derivate da `mesh.position`) → nessun probe nuovo. Nuovo `sampleMotion` (campiona le mesh in fase attiva *choose*) + check **`motion`** = 11ª categoria del gate: valida liveness off-ball (alive ≥15/21, no teletrasporto). Misurato: 19–21/21 vivi, salto 1.5–3.3. **LMQP-side, zero modifiche al gioco.** Copre #17/AC-081…090 "No Dead Players". #1b cattura video / #9 attese state-based → step successivo | 11ª categoria gate | L | Medio · **fatto** |

## Fase C — Validator del Movimento + Realismo (High) — dipende da B
| Sprint | Task | Copre AC | Effort |
|---|---|---|---|
| **C1 — Semantic/Motion** | #16 Semantic per-Situation · #17 Motion | AC-031…040, 071…080 | L |
| **C2 — Camera/Ball/Physics** | **#18 Camera → ESITO TEST: perceptual, NON gate geometrico.** Misurato+ispezionato a video: hero/ball spesso off-screen ma azione **leggibile** (cross inquadra l'area, difensiva inquadra la palla, camera-drift post-azione) → soglie on-screen = falsi positivi. Routato all'**AI Vision** (cap. 3.9, già implementato, scorea `cameraQuality`). **#41 ball-progression/no-boomerang ✅** = 12ª categoria `ball-motion` (conclusioni: no salto indietro, no net negativo; guardia del fix 5.14). **#42 collisioni** → prossimo geometrico | AC-041…048 via AI Vision; **029/030 ✅ (ball-motion)**; 091…100 geometrici | L · **ball-motion fatto** |
| **C3 — FI/NPC** | **#24 reattività difensiva ✅** (in `motion`: ≥1 difensore impegna il portatore con palla in metà offensiva; scoping che esclude le rimesse GK). #19 FI Score · #25 arbitro/panchine/GK · #30 piede → prossimi | AC-061…070, **081…090 (motion ✅)** | L · **#24 fatto** |
| **C4 — AI Vision ponte** | #35 Situation Recognition↔Semantic · #36 video AI Vision · #34 cross-validation · #37 build comparison | AC-161…170 | M |

## Fase D — Replay & Regression Engine (Critical/High)
| Sprint | Task | Deliverable | Effort |
|---|---|---|---|
| **D1 — Replay Engine** | #6 registrazione completa ogni HL + snapshot | AC-051…060 | L |
| **D2 — Regression ricca** | #7 baseline oltre stato+decisione · #39 Failure Package ricco · #70 visual comparison | Regression Gallery (cap. 3.6) | L |

## Fase E — Engine Realism (High)
| Sprint | Task | Scorecard | Effort |
|---|---|---|---|
| **E1 — Animazione=conseguenza** | #21 ritiro archi pre-autorati → traiettorie derivate | #3/#6 | L |
| **E2 — AI individuale** | #20 lettura per-frame · #27/#28 off-ball no-alloc + griglia spaziale | #4/#5 + perf | L |
| **E3 — Intent text-free** | #22 testi a pura intenzione · #23 `deriveIntent` text-free · #29 fattori decisione | #1 | M |

## Fase F — Architettura & Manutenibilità (Medium) — dopo la rete C/D
| Sprint | Task | Effort | Rischio |
|---|---|---|---|
| **F1 — Estrazione motori** | #46 motori puri in modulo · #51 magic numbers · #52 regex centralizzate | M | Medio |
| **F2 — Split componenti** | #47 `ThreeMatchView` · #48 `LiveMatch` · #49 `CareerApp` | L | Medio-Alto |
| **F3 — Plugin/Registry** | #59 Situation registry · #60 Event registry · #61 Validator plugin · #62 config-first · #63/#64/#65 QA Core | L | Medio |

## Fase G — Polish & Futuro (Low)
#86 Audio · #87 nuove camere · #88 replay cinematici · #89 post-processing · #91 analytics · #96 Release Candidate · #100 i18n.

## Rischi del piano
- **Refactoring monolite (F2)**: punto più rischioso → solo con C/D attivi; step ≤300 righe; golden+decision-baseline come rete.
- **Save path GATE-BLIND**: il gate non carica save → A1 crea la prima rete di test su quel path (testare node-side).
- **Render GATE-BLIND al movimento** finché B non è pronto: modifiche al render restano "a rischio", verifica dal vivo.

---
*Aggiornare lo stato sprint ad ogni completamento.*
