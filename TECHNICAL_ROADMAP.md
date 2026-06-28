# TECHNICAL_ROADMAP.md — Fase 2 (Master Execution Plan)

> Piano di lavoro derivato da `REPOSITORY_AUDIT.md` / `TECHNICAL_DEBT.md`, **mappato sulle 13 fasi del Master Execution Plan**. Stato base: 5.39.0 · gate 12/12 · test:logic 16/16 · test:vision 28/28 · zero regressioni. Backlog operativo: `BACKLOG.md`.

## Principi di prioritizzazione
1. **Stabilità > feature** (charter). 2. **Zero regressioni** (3 baseline: stato·decisione·narrazione). 3. **Metodo di verifica esplicito per ogni item** — distinzione critica emersa dall'audit:
   - **GATE-VERIFICABILE (autonomo):** stato/movimento-esistenza/fisica-direzione/decisione/narrazione/dati → gate + test:logic + replay.
   - **PERCEPTUAL (AI Vision o occhio):** regia/leggibilità/qualità animazione/realismo render → AI Vision (2° livello) + **collaudo a campione del proprietario** (workflow concordato: tu vai a campione sul render quando è stabile).
4. Effort: **S** (≤½ giornata) · **M** (1-2 gg) · **L** (sprint).

## Mappatura Fasi del Master Plan ↔ stato reale ↔ lavoro
| Fase | Obiettivo | Stato attuale | Lavoro residuo (priorità) | Verifica |
|---|---|---|---|---|
| **3 — Architectural Refactoring** | semplificare, modularizzare, no behavior change | 🟡 motori puri già estratti a tooling (#46) | A1/A2 split monoliti (🟠 L), A5 magic numbers (🟡), A7 plugin (🟡), G3 unifica engine-doc (🟢) | **MISTO**: refactor logica → gate; split render → **live** |
| **4 — Engine Stabilization** | zero bug/crash, sync interna | 🟢 stabile (gate 12/12, fingerprint invariato, stress 220 HL no-crash) | E1 CDN-fallback prod (🟠 M), audit `setTimeout` (🟡), `dispose()` Three (🟡) | gate + stress + node |
| **5 — Full Synchronization** | Situation→…→Post-Highlight coerenti | 🟡 backbone narrativo validato (timeline check su 179) | sync cronaca↔esito↔animazione fine (🟡 M), AC-049/050 | timeline/backbone (gate) + AI Vision (cronaca↔video) |
| **6 — Gameplay Quality** | calcio credibile (situations, off/def, NPC, varietà) | 🟢 dati ottimi (audit 0 difetti), AI off-ball viva, FI validata | fine-tuning mirato situations (🟡, **live/flag utente**), +varietà cronaca (🟢 autonomo), B4 AI individuale (🟡 L) | data-audit + AI Vision + **campione utente** |
| **7 — Animation Quality** | nessuna animazione artificiale | 🔴 perceptual, AI Vision animationQuality ~40-55 | B3 archi derivati dalla decisione (🟠 L), blending/transizioni | **AI Vision + live** (non gate-verificabile) |
| **8 — Replay Engine** | standard televisivo | 🟡 slice DATI fatto (registrazione+validazione completezza, D1) | Replay Debugger UI, video, eventi per-frame, diff build (🟡 L) | replay (gate) + live |
| **9 — Camera System** | broadcast | 🔴 perceptual (AI Vision cameraQuality 50-65) | tracking/framing/zoom/cinematic (🟡 L) | **AI Vision + live** |
| **10 — Performance** | massimizzare CPU/RAM/GPU, no leak | 🟡 perf-monitor (load/heap/fps warn-only) | D1 alloc per-frame off-ball (🟡 M), D2 leak/zombie auto (🟡 M), CPU/GPU | perf-monitor + stress |
| **11 — AI Vision** | implementare AI_VISION_REVIEW.md (Ollama, provider-based) | 🟢 **operativa** (gemma3:27b, #34/#35/#37) | analyze() OpenAI/Gemini, video continuo, scoring storico (🟡 M) | test:vision + run reali |
| **12 — Automated QA** | pipeline Build→…→Report automatica | 🟢 **CI esegue tutto** (vision/logic/gate/save/replay) | Acceptance/Regression formali come gate CI, Failure Package ricco (🟡 M) | CI |
| **13 — New Features** | nuove camere/replay/situations/stadi/competizioni | ⛔ solo dopo 1-12 | — | tutto |

## Sequenza consigliata (rispettando il vincolo "una fase alla volta")
La Fase 3 (refactoring) è il prossimo passo del Master Plan. **Raccomandazione di metodo:** dentro la Fase 3 affrontare PRIMA gli item **gate-verificabili in autonomia** (riduzione duplicazioni logiche, magic numbers nei motori puri, unifica doc, dead-code) e trattare lo **split dei monoliti render** come sotto-fase **a coppie** (io implemento ≤300 righe/step, tu collaudi a campione), perché il gate è cieco al render. Vedi `docs/ARCHITECTURE_REFACTOR_MAP.md` per la strategia di split.

## Rischi trasversali
- **Render gate-blind** (Fasi 7/9 e parte 3/6): la verifica "è migliore?" è perceptual → AI Vision (rumore ±) + occhio. Le micro-modifiche render NON sono certificabili come miglioramento in autonomia (provato empiricamente).
- **CDN runtime** (E1): rischio di disponibilità in produzione.
- **Single-file**: ogni step di refactoring tocca lo stesso file → step piccoli + 3 baseline come rete.

## Allineamento documentale
Ogni fase rispetta `LIVE_MATCH_QA_SPEC.md`, `VALIDATORS.md`, `DEVELOPMENT_RULES.md`, `ACCEPTANCE_CRITERIA.md`, `AI_VISION_REVIEW.md`, `ROADMAP.md`. Prima di chiudere ogni fase: gate + test:logic + test:vision + save-compat + replay (CI) + report.
