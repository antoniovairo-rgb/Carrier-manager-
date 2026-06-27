# TECHNICAL DISCOVERY REPORT — Career Player Manager (CPM) / Live Match Development Platform

> Fase di sola lettura. **Nessun file modificato, nessun commit, nessun refactoring.** Report di studio.
> Branch analizzato: `claude/ai-vision-first-run` (≡ `main`). GAME_VERSION **5.37.0** · SAVE_VERSION **7**.
> Data: 2026-06-27.

---

## 1. Executive Summary

**Cos'è.** CPM è un *career simulator* calcistico (controlli UN giocatore dalla U18 al professionismo) interamente racchiuso in **un singolo file** `CARRIER-MANAGER-AV.html` (**20.633 righe**), React 18 + Three.js r128 + Babel-standalone, transpilato in-browser, **zero build step**. Attorno al gioco esiste una **Live Match Quality Platform (LMQP)** sotto `tests/visual/` (Playwright headless, ~2.640 righe) e un corpus documentale di charter/spec (~5.000 righe).

**Stato reale (onesto).**
- Il **gioco** è completo e maturo come *career manager*: carriera, mercato, classifiche, coppe, Euro/Mondiale, training, infortuni (parziale), diario, obiettivi.
- Il **Live Match Engine** ha una solida architettura *simulation-first* (`Intent → Decision → Simulation → Animation`): `deriveIntent` (13 intenti) → `decideExecution` (Decision Engine seedato) → `deriveHL`/timeline → render-loop 3D con off-ball AI sofisticata. **Ma** il cuore del render resta **ibrido** (archi/animazioni in parte pre-autorati) e l'AI individuale per-frame è euristica, non deliberativa completa.
- La **LMQP** è documentata in modo eccellente (spec 3.1–3.13, 30 validator LMV, 200 acceptance criteria) ma **implementata solo in parte**: il quality gate (`validate-situations`, **10 categorie, verde**) valida **frame congelati** → stato/coerenza/golden/decisione, **non il movimento né la leggibilità temporale**. Replay Engine, Regression Engine ricco, Performance Monitor completo, Failure Package ricco, AI Vision di secondo livello sono *avviati* (LMQP-1…11) ma non completi.

**Punto di forza dominante:** disciplina di *determinismo* e *onestà documentale* (ogni doc ha una tabella "stato attuale" che distingue 🟢/🟡/🔴). **Rischio dominante:** il **single-file da 20k righe** con 133 `useState`/69 `useEffect`/65 `useRef` e **141 `setTimeout`** è un collo di bottiglia di manutenibilità e una fonte strutturale di fragilità (sequencing a timer, closure stale, impossibilità di unit-test del gioco).

**Gap #1 (strutturale):** il gate non vede il movimento → la maggioranza degli Acceptance Criteria (animazione/camera/replay/cronaca/NPC) **non è automaticamente verificabile**. Il prerequisito già identificato dal team è il **layer Event+Timeline** (LMQP-1, avviato) + cattura video/sequenza.

---

## 2. Architettura del repository

### 2.1 Struttura cartelle (file tracciati)

```
CMP/
├── CARRIER-MANAGER-AV.html      ← IL GIOCO (20.633 righe, single-file, tutto qui)
├── CLAUDE.md                    ← istruzioni operative (allineate a 5.37.0/v7/10-cat; unico ref stale: branch di lavoro)
├── MASTER_PROMPT.md             ← charter LMQP (mission/vision/regole/autorizzazioni)
├── LIVE_MATCH_QA_SPEC.md        ← spec LMQP cap. 3.1–3.13 (+ tabella "stato implementazione")
├── VALIDATORS.md                ← catalogo 30 validator LMV-001…030 (SPEC, non implementati)
├── DEVELOPMENT_RULES.md         ← regole 1–20 (Football First, Regression Policy, Git, cleanup)
├── ACCEPTANCE_CRITERIA.md       ← AC-001…200 (+ tabella copertura gate)
├── AI_VISION_REVIEW.md          ← spec AI Vision cap. 1–23
├── ROADMAP.md                   ← Phase 1–5 / M1–M5
├── LIVE-MATCH-ENGINE.md         ← engine doc "onesto" (pipeline + scorecard, rif. 5.15)
├── CHANGELOG.md
├── SESSION-2026-06-18.md        ← log di sessione
├── sw.js, test.html             ← service worker + pagina di test
├── docs/
│   ├── LIVE_MATCH_ENGINE.md     ← engine doc esteso (2.089 righe) + catalogo 179 Situations
│   ├── LIVE_MATCH_ENGINE.html, LIVE_MATCH_3D_ROADMAP.md
│   ├── MISSIONE_PIPELINE_REPORT.md, SITUATIONS_VALIDATION_REPORT.md, situations_validation.json
├── tests/
│   ├── situations-3d-validation.js   ← regole analitiche coerenza HL↔3D (usate da data-coherence)
│   └── visual/                       ← LMQP (vedi §2.3)
├── versions/                    ← 48 HTML storici (archivio di versioni del gioco)
└── .github/workflows/           ← deploy-pages.yml (Pages su push main) + validate-situations.yml (CI gate)
```

### 2.2 Layer applicativi del gioco (single-file, global scope, ordine di dipendenza)

| Range righe (≈) | Layer | Contenuto |
|---|---|---|
| 1–151 | Shell | HTML, CDN imports, spinner, theme `TH`/`TH_DARK` |
| 152–698 | Asset/Data | `AVATARS`+`AvatarSVG`, `CLUBS` (9 leghe)+`TeamBadge` |
| 699–1618 | Data | `U18_CLUBS`, `LEAGUE_RECORDS`, `WEEKLY_EVENTS`, `BG_MATCH` |
| **1619–1653** | **Engine** | **`deriveIntent`** (13 intenti) + costruttori `S`/`A` |
| 1654–2410 | Data | **`SITUATIONS`** (179) + `ZONES` |
| 2410–4196 | Core helpers | `calcOvr`, `succRate`, `generateTransferOffer`, **`storage`** (save/load), debug tools, **Claude API integration** |
| 4197–4860 | Sim/calendar | `toThree`, `generateSeasonCalendar`, `initStandings`/`updateStandings`, `simulateMatch`, roster gen |
| 4860–6686 | 3D scene | `makeCrowdTex`, `buildStadium`, UI primitives |
| **6687–6973** | **Engine core** | `deriveBallState`/`deriveSitCine`/`hlBallState`/**`deriveHL`** · `buildHLTimeline`/`validateHLTimeline`/`resolveTimeline` · **`decideExecution`** (Decision Engine) |
| 6974–7035 | Display+Bus | `intentLabel`/`intentTitle`/`stateIncoherent` · **`cpmEmit`/MATCH_TL** (Event+Timeline layer, LMQP-1) |
| **7036–8998** | **3D render** | **`ThreeMatchView`** — render-loop, `animOne` (locomozione), `fireConclusion`, **off-ball AI** (7826–7980), executor timeline, test hooks |
| 8999–10300 | DPad/UI match | `DPad`, `MatchdayCard`, `FormationView`, `WalkoutOverlay`, `CHAIN_SITS` |
| **8999–14014** | **Match flow** | **`LiveMatch`** — state machine (`matchday→…→ended`), `handleAction`/`handleContinue`, BG tick, **17 hook `window.__CPM_*`** |
| 10306–13372 | Screens | `ProTransitionScreen`, `HomeScreen`, `CreateScreen`, `OffersScreen`, `TrialFlow`, `NAT_CLUB_DATA`, `CAREER_MILESTONES`, `TutorialOverlay` |
| **14015–19793** | **Career SM** | **`CareerApp`** — state machine carriera + **migration save** (accretiva) |
| 19794–20633 | Root | `App` router (`phase`) + mount |

### 2.3 LMQP — `tests/visual/`

```
validate-situations.mjs      ← orchestratore del gate (10 categorie)
report.mjs                   ← report HTML + Dashboard LMQP (LMQP-9)
run-3d-validation.mjs / run-force-all.mjs / run-golden.mjs / run-metrics.mjs  ← runner ausiliari
checks/                      ← 10 validator modulari (import statico)
  initial-state · orientation · visual · movements · golden · final-state ·
  determinism · post-highlight · data-coherence · timeline
lib/
  harness.mjs                ← server statico + Playwright + hook force/freeze + dHash + stateSig
  situations.mjs             ← estrae SITUATIONS dal sorgente (Function() eval, zero re-impl)
  football-metrics.mjs · perf-monitor.mjs (LMQP-8) · failure-collector.mjs (LMQP-7) ·
  replay-trace.mjs (LMQP-10/11) · ai-vision.mjs (adattatore gate→engine)
  vision/                    ← AI Vision framework provider-based (Open/Closed)
    provider.mjs · engine.mjs · registry.mjs · config.mjs · scoring.mjs · prompts.mjs ·
    capture.mjs · cache.mjs · report.mjs · logger.mjs · providers/{ollama,anthropic,openai,gemini,index}
test/vision/*.test.mjs       ← 28 unit test (node --test)
golden-sigs.json · decision-baseline.json   ← baseline committate (regressione stato + decisione)
```

---

## 3. Mappa delle dipendenze

### 3.1 Gioco (dipendenze interne, single global scope)

```
deriveIntent ──► S()/A() ──► SITUATIONS (179)
                                 │
   deriveBallState/deriveSitCine ┘ (congelati su sit.ballState/sit.cine alla costruzione)
                                 │
              ┌──────────────────┴───────────────────┐
              ▼                                       ▼
        deriveHL(sit,act) ───► buildHLTimeline ──► validateHLTimeline
              │                       │                     │
              │                       └──► resolveTimeline ─┘ (beat → posizioni)
              ▼                                       
        LiveMatch (state machine) ──► decideExecution(intent,ctx) ──► {execution,outcome,quality}
              │                                       │
              │  props (hlType/variant/ballState/quality/playerX…)
              ▼                                       ▼
        ThreeMatchView (render-loop) ◄── propsRef ── off-ball AI · animOne · fireConclusion · executor
              │
              ▼
        cpmEmit → MATCH_TL (ring buffer) → window.__CPM_TIMELINE  (osservabilità per la LMQP)

  CareerApp (state `player` unico) ──► LiveMatch (per ogni partita)
            │ autosave useEffect ──► storage (localStorage / window.storage)
            └ migration mount useEffect ──► backfill campi mancanti
  App (phase router) ──► Home/Create/Trial/Offers/CareerApp
```

**Componenti centrali (hub):**
- `player` (oggetto-stato unico in `CareerApp`) — **God object**: identità, carriera, stats, calendario, classifiche, coppe, infortuni, relazioni. Tutto vi dipende.
- `ThreeMatchView` — render-loop monolitico (~1.960 righe) che concentra off-ball AI, locomozione, conclusioni, executor timeline, camera.
- `LiveMatch` — state machine match (~5.000 righe) hub di props/refs verso il 3D.
- `decideExecution` / `deriveHL` — keystone logico, **puri e node-testabili** (unico isolotto realmente isolato).

**Componenti periferici:** `AVATARS`, `LEAGUE_RECORDS`, `WEEKLY_EVENTS`, `TutorialOverlay`, screens.

**Dipendenze forti:** `ThreeMatchView` ↔ `LiveMatch` (props+refs molto larghe); `CareerApp` ↔ tutto (player). **Dipendenze deboli/sane:** i motori logici (`deriveIntent`/`decideExecution`/`buildHLTimeline`) non conoscono React né Three → riusati node-side dalla LMQP via `lib/situations.mjs`.

**Dipendenze circolari:** nessuna a livello di modulo (è single scope, ordine top-down). A livello concettuale c'è accoppiamento bidirezionale `LiveMatch ⇄ ThreeMatchView` via `propsRef` + `window.__CPM_*` (i hook di test scrivono/leggono stato React).

**Colli di bottiglia:** (a) il **file unico** (ogni modifica tocca lo stesso file, niente module boundary); (b) il **render-loop** (off-ball AI O(N²) + allocazioni per-frame); (c) il **sequencing a `setTimeout`** (141 occorrenze) nel flusso match.

### 3.2 LMQP (dipendenze pulite, modulari)

```
validate-situations.mjs ──► harness.mjs (server/browser/hook)
                        ├─► situations.mjs (loader sorgente)
                        ├─► checks/*.mjs (10, import statico)  ◄── tests/situations-3d-validation.js (data-coherence)
                        ├─► lib/{failure-collector,perf-monitor,replay-trace,ai-vision}
                        └─► report.mjs (HTML+Dashboard)
vision/: engine ──► provider (interfaccia) ──► registry ──► providers/*  (Open/Closed, zero accoppiamento)
```
Architettura LMQP **sana**: Open/Closed sui provider vision, check modulari, baseline committate. Limite: i check sono **importati staticamente** (non un plugin-registry runtime → cap. 3.12/3.13 ancora 🔴).

---

## 4. Flusso completo dei dati

Mappatura sulla pipeline richiesta (DB → … → Report):

| Stadio | Input | Output / Trasformazione | Dove |
|---|---|---|---|
| **Database** | costanti statiche | `CLUBS`, `SITUATIONS` (179, con `intent`/`ballState`/`cine` congelati alla costruzione), `NAME_BY_NAT`, `LEAGUE_RECORDS` | 152–2410 |
| **Persistenza** | oggetto `player` | `storage.save` → JSON in `localStorage`/`window.storage` (3 slot); `load` con integrity-check + `_corrupted`; **migration** accretiva al mount | 4165, 14040+ |
| **Simulation (sfondo)** | club, ovr, isHome | `simulateMatch` (gol pesati per prestige), `updateStandings`; `BG_MATCH` cronaca | 4824+, 2091 |
| **Situation** | gioco corrente | `selectContextualSituations` pesca le HL dal pool; `S()` produce `{intent,ballState,cine,…}` | 8237 |
| **Decision Engine** | `intent` + `ctx{attrs,pressure,fatigue,morale,x,weather,foot,side,seed}` | `{execution,outcome,quality}` deterministico (PRNG LCG seedato); `q∈[0,1]` da skill−pressione−fatica+morale+rumore | 6918 |
| **Cinematica** | `sit`+`act` | `deriveHL` → `{type,pattern,variant}`; `buildHLTimeline` → beat → `validateHLTimeline` (invarianti) → `resolveTimeline` → posizioni | 6714–6908 |
| **Animation/Render** | props (hlType/variant/quality/posizioni) | render-loop: off-ball AI (target+repulsione), `animOne` (crossfade corsa↔idle), `fireConclusion` (swing+arco), post-archi | 7036–8998 |
| **Event/Timeline** | flusso HL | `cpmEmit` → `MATCH_TL` ring buffer (HighlightForced/ActionResolved/…) → `window.__CPM_TIMELINE` | 7032 |
| **Replay** | post-highlight | `samplePostHighlight` (camera/palla/giocatori per-frame) → `writeReplayTrace` → `out/validate/replay/*.json` (campione) | replay-trace.mjs |
| **Validator** | stato congelato + timeline + sorgente | 10 check → issues/warnings → `categories[]` | checks/*.mjs |
| **AI Vision** | screenshot multi-fase | provider (Ollama/…) → engine → scoring → verdetti | vision/ |
| **Report** | categories + perf + failures | `run-summary.json` (fingerprint) + `index.html` (Dashboard) + `ai-vision/index.html` | report.mjs, failure-collector |

**Determinismo end-to-end:** seed `__CPM_RESEED(gi)` + LCG in `decideExecution` + `hashStr` → stessa situation/stato ⇒ stesso esito. `golden-sigs.json` (firma stato `{htx,hty,cam,ch,ca}`) e `decision-baseline.json` (firma `intent|hlType|ballState`) sono i guardiani della regressione.

---

## 5. Analisi del Live Match Engine

### 5.1 Pipeline (per fase: input → output → responsabilità → componenti)

1. **Generazione Situation** — *in:* contesto partita; *out:* `sit` con `intent`/`ballState`/`cine`; *resp:* classificare l'intenzione (mai l'esecuzione); *comp:* `deriveIntent`, `S()`, `selectContextualSituations`.
   - ⚠️ **`deriveIntent` legge ancora `sit.text`** (regex su titolo) alla costruzione. La *cinematica* (`deriveBallState`/`deriveSitCine`) è invece **text-free** (intent strutturale + override `tactic.bs`/`tactic.cn`). Quindi "niente testo" vale per CINE, non per l'intent.
2. **Scelta azione** — *in:* `sit.actions[]` (la SCELTA tattica del giocatore, label/stat/rew/fail); *out:* `act` scelto + `k`; *resp:* l'utente sceglie un **intento/stile di rischio** (display via `intentLabel`/`intentLabelDedup`), non un'animazione; *comp:* `LiveMatch.handleAction`.
3. **Decisione** — *in:* `intent`+`ctx`; *out:* `{execution,outcome,quality}`; *resp:* decidere COME e con quale ESITO, deterministico e contestuale; *comp:* `decideExecution`. Validato: forte+libero ~76% positivi, debole+pressione ~1%, 0 esiti impossibili.
4. **Highlight/Timeline** — *in:* `sit`+`act`(+reward); *out:* `{type,pattern,variant}` + timeline di beat + posizioni risolte; *resp:* costruire la SEQUENZA calcistica (possesso continuo, n° passaggi, no teleport); *comp:* `deriveHL`, `buildHLTimeline`, `validateHLTimeline`, `resolveTimeline`.
5. **Animazione** — *in:* props; *out:* mesh animati; *resp:* locomozione + gesto conclusivo + reazioni; *comp:* `animOne` (crossfade `_runB`), `fireConclusion`, wind-up eroe. 🟡 archi in parte pre-autorati per variante (la qualità ne modula pace/precisione/altezza — F4–F7).
6. **Replay** — 🔴 **non esiste un Replay Engine** (cap. 3.5). Esiste solo `samplePostHighlight`+`writeReplayTrace` (tracce per-frame del *campione*) e un Replay Viewer 2D nel report (LMQP-10/11).
7. **Telecamera** — *resp:* regia per-pattern (CINE-5, `HL_ZONE_COL`/preset drift); *out:* camera-target via ref. 🟡 esiste, non validata come copertura AC.
8. **Cronaca** — `BG_MATCH` (densità scalata sul momentum, 5.37) + commenti HL. 🔴 sincronia cronaca↔video non validata.
9. **Post-highlight** — ripresa dal centro dopo gol dell'eroe (riusa preset drift), chaining `CHAIN_SITS`. 🟡 non coperto dal gate (forza le situation, bypassa `handleContinue`).
10. **Ritorno al gameplay** — `handleContinue` avanza HL o BG; `onMatchEnd` instrada per `matchContext` (career/cup/national/euro).

### 5.2 Off-ball AI (render-loop, 7826–7980) — il fiore all'occhiello

Tutto **visivo** (offset sul target del lerp, **niente mutazione di `matchPlayers`** → zero save-risk) e **deterministico** (nessun RNG/now). Passi:
- **PASS 1:** shape-flow (blocco scorre col pallone, DIF>CEN>ATT), shift possession-aware (legge il *Football State* `sr.current.football`), pressing, **obiettivi per ruolo** (ATT corse primo/secondo palo/profondità verso lo spazio più libero `_openAt`; CEN linee di passaggio; DIF linea), barriera punizioni (3 difensori), sgombero area sui set-piece.
- **PASS 1b:** marcatura goal-side del più vicino.
- **PASS 1c (F10):** copertura della **linea di passaggio più pericolosa** (legge il ricevente con più `danger = adv·0.7+open·0.3`).
- **PASS 1d (F11):** **press & cover** (raddoppio goal-side nell'ultimo terzo).
- **PASS 2:** repulsione (bolla personale 6.5u) anti-ammucchiate + l'eroe respinge i compagni (one-way).
- **F13:** il portiere che difende **stringe l'angolo** uscendo, con cap entro i bound asseriti dal gate.

Limiti: euristica (non lettura individuale completa per-frame di spazi/pericoli/scelte del portatore — scorecard punti 4/5/6 = 🟡); costo O(N²) per pass; allocazioni per-frame.

### 5.3 Scorecard direttiva (da `LIVE-MATCH-ENGINE.md`, verificata)
1 Situations=solo intenzione 🟡 · 2 Esecuzione dal motore ✅ · 3 No "animazione predefinita" 🔴 · 4 22 attivi 🟡 · 5 Leggere l'azione ogni frame 🟡 · 6 Animazione=conseguenza 🟡 · 7 Racconta una storia 🟡 · 8 Sensazione vera partita 🔴 · 9 Migrare 179+test 🟡.

---

## 6. Analisi del Rendering

- **Stack:** Three.js r128 (UMD CDN), `ThreeMatchView` monta UNA volta (`useEffect [] `), aggiorna via ref (`sr.current`/`propsRef`) → niente re-render React nel loop. `setClearColor(0x050810)` anti-flash.
- **Scena:** `buildStadium` (una volta), folla = `THREE.CanvasTexture` procedurali (`makeCrowdTex`), 22 giocatori + eroe (mesh low-poly), rete/LED/meteo.
- **Loop:** `requestAnimationFrame(loop)` (7514). Per frame: `updateFootballState()` (throttle interno), off-ball AI (5 passi), `animOne` per ogni mesh, executor timeline (`tlOn`), camera. `animOne` usa crossfade continuo corsa↔idle (`mesh._runB`, easing accel/decel) — risolve il "T-pose glide".
- **Materiali/illuminazione/post:** stadio notturno, ombre basilari; nessun post-processing pipeline. Coerente col target "browser leggero, single-file".
- **Punti critici:**
  1. **Allocazioni per-frame** nell'off-ball AI (`_tg`, `_hmP`, `_awP`, oggetti `{x,y,…}` per 22 giocatori, ogni frame) → pressione GC su mobile.
  2. **O(N²)** su più passi (marcatura, press&cover, line-cover, repulsione) — accettabile con 22 attori ma non headroom.
  3. **Frame neri/transizione** all'esito (osservato nel run AI Vision: dopo `__CPM_RESOLVE` il 3D dura poche centinaia di ms poi compare la card bianca mentre `matchPhase` resta `hl_result`) — sintomo di accoppiamento fase-React ⇄ teardown canvas.
  4. **Render-loop monolitico** (~1.960 righe in una funzione) — difficile da profilare/isolare.

---

## 7. Analisi del Database

- **Non c'è un DB**: dati statici in costanti JS (`CLUBS`, `SITUATIONS`, `NAME_BY_NAT`, `LEAGUE_RECORDS`, `WEEKLY_EVENTS`, `BG_MATCH`). "Database" nel senso LMQP = il **catalogo Situation** (array, non registry con metadati/validator associati → cap. 3.13 🔴).
- **Modelli principali:** `player` (God object), `CLUBS entry` (`{id,n,a,p,c,c2,nat,lg}`), `Situation` (`{text,zones,startZone,moveZone,actions,lockMovement,maxMoves,tactic,intent,ballState,cine}`), `calendar[]`, `standings[]`, `cup{}`, `euroMondiale{}`.
- **Serializzazione:** `JSON.stringify(player)` intero ad ogni autosave (`useEffect` su change). Nessuna normalizzazione/diff → si serializza tutto, ogni volta.
- **Duplicazioni/incoerenze dati riscontrate:**
  - **Doppia engine-doc:** `LIVE-MATCH-ENGINE.md` (root) e `docs/LIVE_MATCH_ENGINE.md` (esteso) coesistono → rischio drift.
  - **`SITUATIONS` ridondanza segnali:** `intent`/`ballState`/`cine` sono *derivati* ma **congelati** nel dato (52+3 con override `tactic.bs`/`tactic.cn`); coerenza garantita solo finché `deriveBallState`/`deriveSitCine` non cambiano (oggi protetto da data-coherence + decision-baseline).
  - **`versions/` (48 HTML)** committati nel repo: archivio pesante, ridondante col versioning Git.

---

## 8. Analisi delle Performance

- **Avvio:** Babel-standalone transpila in-browser → ~1–2 s (load misurato dal gate ~4.7 s headless software-rendered). `perf-monitor` (LMQP-8) misura load-time, JS heap, frame-timing — **warn-only** (mai FAIL): es. ultimo gate `5.7fps · avg 176ms · p95 300ms · heap 40MB` (FPS basso = swiftshader software, non rappresentativo del device reale).
- **CPU/RAM/GPU:** nessuna misura CPU/GPU nel gate; heap sì (Chromium). Nessuna leak/zombie detection automatica (health-check processi = manuale `ps`).
- **Allocazioni:** vedi §6 (per-frame nell'AI). Il gioco usa **141 `setTimeout`** per il sequencing → ogni timer è un'allocazione + rischio di accumulo se non ripuliti (alcuni in `LiveMatch` con cleanup, altri "fire-and-forget").
- **Memory leak potenziali:**
  - `setTimeout` fire-and-forget nel flusso match (non sempre clearati allo smontaggio di `LiveMatch`).
  - `MATCH_TL` è **bounded** (ring 500) → OK.
  - Three.js: mesh/texture create in `buildStadium` una volta; verificare `dispose()` allo smontaggio di `ThreeMatchView` (da confermare dal vivo).
- **GC:** la pressione viene dall'AI off-ball per-frame. Mitigabile con buffer riusati (oggetti pre-allocati) senza cambiare la logica.
- **Processi inutili:** la LMQP rispetta cleanup (`finally{ browser.close(); srv.close(); }`).

---

## 9. Analisi della Persistenza

- **Meccanismo:** `storage` async con doppio backend (`window.storage` nativo / `localStorage`), 3 slot (`cpm-v3`, `cpm-v3-s2`, `cpm-v3-s3`). Autosave su ogni change di `player`. Integrity: richiede `player.name`; JSON corrotto → `{_corrupted:true}` (gestito in UI).
- **SAVE_VERSION = 7** (v7 = `player.foot`). **Ma:** la migration **non legge `saveVersion`** — è una catena **accretiva di backfill per-campo** (`if(!newP.X) newP.X=default`) accumulata su decine di Sprint (41/50/51/174/176…). Robusta (carica qualsiasi save vecchio) ma:
  - `SAVE_VERSION` è di fatto **decorativo** (scritto, mai usato come gate di migrazione).
  - La logica di migrazione è **lunga e dispersa** nel mount `useEffect` → difficile da auditare; rischio di ordine (es. `getLeagueClubs` dipende da club già rifrescato).
- **Save compat (AC-131…140):** il meccanismo c'è (🟢🟡) ma **manca un test automatico** che carichi save storici nel gate → la compat è verificata solo a mano.

---

## 10. Confronto documentazione ↔ implementazione (evidenze)

Le tabelle "stato attuale" nei doc sono **oneste e accurate**; ho verificato i punti chiave contro il codice. Sintesi delle divergenze con evidenza:

| # | Documento/claim | Realtà nel codice | Evidenza |
|---|---|---|---|
| D1 | `LIVE-MATCH-ENGINE.md`: "intent MAI da parole" | `deriveIntent` (1620) fa regex su `sit.text` | `const txt=((sit&&sit.text)||"").toLowerCase()` + `/rigore/.test(txt)`… |
| D2 | `CLAUDE.md` **on-disk è allineato** (5.37.0/v7/10-cat/~20.600 righe) — la versione "4.91/v6/9-cat" era lo *snapshot* nel system-prompt, non il file | nessuna correzione necessaria su versione/categorie; resta stale solo il **branch di lavoro** (vedi D9) | verificato: CLAUDE.md L58/L72/L202 |
| D3 | `LIVE-MATCH-ENGINE.md` rif. riga (deriveHL 6650, deriveIntent 1618…) | drift: deriveHL **6714**, deriveIntent **1619**, decideExecution **6918** | grep |
| D4 | Spec cap. 3.5 "Replay Engine" | 🔴 assente; solo trace campione + viewer 2D | `replay-trace.mjs` (24 righe), nessun Replay Engine |
| D5 | Spec cap. 3.9 / charter: AI Vision "secondo livello, non blocca CI" | ✅ coerente (skip pulito se provider giù, exit 0) | `ai-vision-review.mjs` L41-47, 82-83 |
| D6 | `AC-151…160` Audio | 🔴 **il gioco non ha audio** → AC aspirazionali | nessun `Audio`/`<audio>`/WebAudio nel match |
| D7 | DEV_RULES cap.11 "vietati timeout arbitrari" (per Playwright) | il **gioco** usa 141 `setTimeout`; il **gate** usa `sleep(ms)` fissi (700/750/300) in final-state | `validate-situations.mjs` L110-118 |
| D8 | Game embed Claude API | modello **`claude-sonnet-4-20250514`** (stale; l'ultimo è `claude-sonnet-4-6`) | L4235 `CLAUDE_MODEL` |
| D9 | Politica Git (`MASTER_PROMPT`): branch di lavoro `claude/remote-control-6w43ie` | **branch inesistente** nei remoti | `git branch -r` |
| D10 | Spec 3.12/3.13 plugin/registry/config-first | 🔴 check importati staticamente; Situation=array; config via env var | `validate-situations.mjs` import L26-35 |

**Conclusione §10:** nessuna *bugia* documentale (le tabelle stato-attuale sono corrette); le divergenze sono (a) **drift di riferimenti** (CLAUDE.md, numeri di riga), (b) **spec aspirazionali** non ancora implementate (Replay/Audio/Plugin), (c) un paio di **valori stale** (modello Claude, branch git).

---

## 11. Violazioni delle Development Rules

| Regola (DEV_RULES) | Stato | Evidenza/impatto |
|---|---|---|
| cap.4 No duplicazione/magic numbers, **Single Responsibility** | 🔴 violata | `ThreeMatchView` (~1.960 righe), `LiveMatch` (~5.000), `CareerApp` (~5.700): funzioni multi-responsabilità; magic numbers ovunque nell'AI (`24`, `6.5`, `0.42`…) |
| cap.4 **Reuse Before Rewrite** | 🟡 | i motori logici sono riusati (gate). Ma molta geometria/threshold ripetuta inline |
| cap.5 **Regression Policy** (unit/integration/replay/animation/perf regression, *FAIL blocca*) | 🟡/🔴 | esistono golden+decision-baseline+10 check, **mancano** replay/animation/performance regression; perf è warn-only |
| cap.5 **Regression Rule** (prova automatica che nulla è peggiorato) | 🔴 | prova parziale (firma stato+decisione), non un Regression Engine (cap. 3.6) |
| cap.9 **Automatic Build Policy** (build→lint→type-check→…) | 🟡 N/A | no build step; no lint/type-check (vanilla JS in `<script type=text/babel>`) |
| cap.10 **Mandatory Visual Testing** (validare movimento/animazioni) | 🔴 | gate a **frame congelati** → movimento non validato (limite strutturale dichiarato) |
| cap.13 **Resource Management** (CPU/RAM/leak) | 🟡 | perf-monitor warn-only; no CPU/GPU, no leak detection |
| cap.6 **No Blind Fix / Root Cause** | 🟢 | pratica adottata (audit-first, commit descrittivi, baseline) |
| cap.8 Git autonomia | 🟢 | rispettata (push su branch di lavoro autonomo; main su OK) |

---

## 12. Violazioni / non-copertura degli Acceptance Criteria

Riepilogo da `ACCEPTANCE_CRITERIA.md` (tabella copertura, verificata):

- **Verificabili oggi dal gate (parziale):** AC-004/005 (crash/eccezioni), AC-006/007/008 (gate+golden), AC-018/020 (posizioni iniziali/no-teleport), AC-022/028/029 (fisica arco/no-boomerang), AC-121/129 (stabilità su 179), AC-172 (no PASS→FAIL via golden/decision-baseline).
- **NON verificabili automaticamente (gap principali):**
  - **Animazione AC-031…040** 🔴 (movimento non visto dal gate).
  - **Camera AC-041…048** 🔴 (solo flag camera in firma).
  - **Replay AC-051…060** 🔴 (no Replay Engine).
  - **Commentary AC-049/050** 🔴 (sincronia cronaca↔video).
  - **NPC AC-081…090** 🟡 (off-ball "no zombie" non *verificato* dal vivo).
  - **Performance AC-111…120** 🔴 (no FPS/CPU/RAM/leak gating; AC-130 stress 1.000 HL assente).
  - **Save AC-131…140** 🟡 (meccanismo sì, test no).
  - **UI AC-141…150** 🔴, **Audio AC-151…160** 🔴 (audio inesistente), **AI Vision AC-161…170** 🟡 (framework sì, integrazione gate no), **Release AC-191…200** 🔴 (no processo RC).

**Impatto:** la maggioranza degli AC su *movimento/leggibilità temporale* è bloccata dallo stesso prerequisito → **Event+Timeline + cattura video** (LMQP-1 avviato).

---

## 13. Technical Debt

| Categoria | Evidenza | Gravità |
|---|---|---|
| **File unico 20.633 righe** | tutto in `CARRIER-MANAGER-AV.html` | Alta (manutenibilità/testabilità) |
| **Funzioni-monstre** | `ThreeMatchView`/`LiveMatch`/`CareerApp` | Alta |
| **State sprawl** | 133 `useState` · 69 `useEffect` · 65 `useRef` | Alta (closure stale già mitigate con `*Ref`) |
| **Sequencing a timer** | 141 `setTimeout` (5 `setInterval`) | Media-Alta (fragilità/leak) |
| **Magic numbers** | soglie AI/geometria/timing inline non nominate | Media |
| **Riga da 17.813 char** (L2715) | blob dati minificato in una riga | Media (leggibilità/diff) |
| **Migration accretiva** | catena `if(!field)` su decine di Sprint, `SAVE_VERSION` non usato | Media |
| **`versions/` (48 HTML)** in repo | archivio ridondante col Git | Bassa-Media (peso repo) |
| **Doc drift** | riferimenti di riga negli engine-doc, branch di lavoro stale (CLAUDE.md/MASTER_PROMPT), modello Claude in-game stale | Media (fuorvia gli agenti) |
| **Doppia engine-doc** | root vs `docs/` | Bassa |
| **TODO/FIXME** | solo 2 marker → debito **non marcato** (peggio: invisibile) | Info |
| **File spazzatura non tracciati** (sessione) | `_patch*.js`, `_audit_states.js`, `lt_*.txt`, `serveo*.txt`, `*.glb` nella working dir (ora in stash) | Bassa |

---

## 14. Codice morto / sospetto

- **`Football State` inerte storicamente** (`updateFootballState`) — nato "consumato da nessuno" (F1), ora consumato dall'off-ball (F2). Non più morto, ma verificare che il throttle non lasci campi stale.
- **Claude API integration** (`callClaudeAPI`, `_aiMockMode`, `toggleAIMock`, L4234+) — feature opzionale gated da API key; di fatto **inattiva** di default (no key). Modello **stale**. Candidata a dead-code se non usata.
- **`window.cpmDebugSimulate`/`cpmDebugLeagues`** (4202+) — debug tools console-only; legittimi ma da escludere in "produzione".
- **`run-metrics.mjs`/`run-force-all.mjs`/`run-golden.mjs`** — runner ausiliari; verificare se ancora usati vs il gate unico.
- **`test.html`, `sw.js`** — verificare attualità (service worker registrato?).
- *(Nessun dead-code certo individuato senza esecuzione; le voci sopra sono candidate da confermare.)*

---

## 15. Duplicazioni

- **Logica `cappedMM`** replicata node-side in `situations.mjs` (`cappedMM`) ↔ gioco (movement cap) — *intenzionale* (riuso senza browser) ma è una **seconda fonte di verità** da tenere in sync.
- **Regex di esecuzione** ripetute: `deriveHL`, `intentLabel`, `intentTitle`, `deriveIntent` parsano stringhe sovrapposte (cross/testa/volée/cucchiaio…) in punti diversi.
- **Soglie geometriche** (bound campo `2..98`, `clamp`, distanze pressing) ripetute inline nell'AI.
- **Engine doc** duplicata (root + docs/).
- **Generazione calendario/standings** invocata in ~10 punti (`generateSeasonCalendar`/`initStandings`) con piccole varianti di seed → pattern ripetuto.

---

## 16. Debolezze architetturali

1. **Single-file monolitico** → nessun confine di modulo, ogni feature tocca lo stesso file, impossibile unit-testare il gioco (solo i motori puri sono node-testabili).
2. **Accoppiamento `LiveMatch ⇄ ThreeMatchView`** via props larghissime + `propsRef` + `window.__CPM_*` (test hooks che leggono/scrivono stato React).
3. **God object `player`** → ogni sotto-sistema vi dipende; serializzazione monolitica.
4. **Sequencing a `setTimeout`** invece di state-machine esplicita/event-driven → fragile, dipendente dai tempi (anche il gate usa `sleep` fissi, contro la regola "attese basate sullo stato").
5. **Render-loop monolitico** che mescola AI/locomozione/conclusione/camera/executor.
6. **LMQP senza plugin runtime** (cap. 3.12/3.13 🔴): check import-statici, no registry Situation/Validator/Event.
7. **Gate cieco al movimento** (frame congelati) → tetto strutturale alla copertura AC.
8. **`SAVE_VERSION` non usato** per la migrazione → versioning save solo nominale.

---

## 17. Punti di forza

1. **Architettura simulation-first reale** (`Intent→Decision→Simulation→Animation`) con motori **puri, deterministici, node-testabili** (`deriveIntent`/`decideExecution`/`buildHLTimeline`/`validateHLTimeline`).
2. **Determinismo disciplinato** (seed ovunque su setup/render; golden + decision-baseline; gate `determinism`).
3. **Off-ball AI sofisticata e *save-safe*** (puramente visiva, deterministica, con press&cover/line-cover/marcatura/repulsione).
4. **Invarianti calcistiche come check logici** (`validateHLTimeline`: possesso continuo, no teleport, testa⇐cross, n° passaggi) + invariante CINE (testa/volée solo su palla aerea) come **FAIL bloccante**.
5. **LMQP ben architettata** dove implementata: check modulari, AI Vision Open/Closed, baseline committate, Dashboard, run-summary con fingerprint.
6. **Onestà documentale** sistematica (ogni doc ha la tabella 🟢/🟡/🔴) — rara e preziosa.
7. **CI + deploy** funzionanti (gate su PR, Pages via Actions).
8. **Zero dipendenze build** → portabilità estrema (apri l'HTML e gioca).

---

## 18. Rischi

| Rischio | Probabilità | Impatto | Note |
|---|---|---|---|
| Regressione visiva non intercettata (gate cieco al movimento) | Alta | Alto | richiede Timeline+video |
| Fragilità da `setTimeout` (race/leak) | Media | Medio-Alto | sequencing match |
| Crescita insostenibile del single-file | Alta | Alto | già 20.6k righe |
| Migration save che diverge / `SAVE_VERSION` ignoto | Media | Alto (perdita carriere) | nessun test save storico |
| Doc drift fuorvia gli agenti (CLAUDE.md stale) | Alta | Medio | numeri/righe/branch obsoleti |
| Perf su device reale (GC per-frame) | Media | Medio | non misurata su mobile |
| Dipendenza CDN (React/Three/Babel) | Bassa-Media | Alto se cade | mitigata nel gate, non in prod |
| Modello Claude stale nell'integrazione in-game | Bassa | Basso | feature opzionale |

---

## 19. Roadmap tecnica consigliata

Coerente con `ROADMAP.md` Phase 2 (Engine Stabilization) e con i prerequisiti già identificati:

- **Ora (sblocca tutto):** completare il **layer Event+Timeline fine-granulare** (BallTouched/CameraChanged/per-beat) + **cattura video/sequenza** → abilita Semantic/Motion/Narrative validator e gran parte degli AC movimento.
- **Breve:** **Save migration test** nel gate (carica save storici sintetici) + far **usare `SAVE_VERSION`** come gate di migrazione; **allineare CLAUDE.md** allo stato reale.
- **Breve:** **Performance Monitor** → soglie reali (device-profile), leak/zombie detection; perf da warn a gate condizionato.
- **Medio:** **Replay Engine** (registrazione completa di ogni HL, snapshot/diff) → abilita AC-051…060 e Regression Gallery (cap. 3.6).
- **Medio:** **estrazione modulare** incrementale del gioco (almeno separare i motori puri in `<script>` distinti o moduli) senza rompere il single-file deploy.
- **Lungo:** **Plugin/registry** (cap. 3.12/3.13), AI individuale per-frame completa, audio (prerequisito per AC-151…160), Release Candidate process.

---

## 20. Top 100 interventi (ordinati per priorità)

> Legenda: **B**eneficio · **R**ischio · **E**ffort (S/M/L) · **Dep** dipendenze. Nessuno implementato in questa fase.

### CRITICAL (stabilità / dati / regressioni cieche)
1. Timeline fine-granulare + cattura video nel gate — B: sblocca AC movimento; R: medio; E: L; Dep: LMQP-1.
2. Test automatico **save compat** (carica save storici) nel gate — B: previene perdita carriere; R: basso; E: M.
3. Far **usare `SAVE_VERSION`** come gate di migrazione (oggi ignorato) — B: migrazioni deterministiche; R: medio; E: M.
4. **Cleanup `setTimeout`** in `LiveMatch` allo smontaggio (audit dei 141 timer) — B: no leak/race; R: medio; E: M.
5. Verifica `dispose()` Three.js (mesh/texture) allo smontaggio `ThreeMatchView` — B: no leak GPU; R: basso; E: S.
6. Replay Engine minimo (registra ogni HL, non solo campione) — B: AC-051…060, regression; R: medio; E: L.
7. Regression Engine: baseline ricca (oltre stato+decisione) — B: "prova che nulla peggiora"; R: medio; E: L.
8. Frame neri/teardown all'esito (canvas vs card) — B: leggibilità/AI Vision; R: medio; E: M.
9. Gate: sostituire `sleep` fissi con attese **state-based** (regola DEV cap.11) — B: stabilità CI; R: medio; E: M.
10. Stress test 1.000 HL consecutivi (AC-130) headless — B: stabilità; R: basso; E: M.
11. Leak/zombie detection automatica nel Performance Monitor — B: DEV cap.13; R: basso; E: M.
12. Allineare **CLAUDE.md** (5.37/v7/10-cat/righe/branch) — B: agenti non fuorviati; R: nullo; E: S.
13. Health-check processi automatico (oggi manuale `ps`) — B: cleanup garantito; R: basso; E: S.
14. Coprire `handleContinue`/chaining/post-highlight nel gate (oggi bypassati) — B: regressioni ripresa; R: medio; E: M.
15. Test sincronia cronaca↔esito (AC-049/050) a livello evento — B: coerenza narrativa; R: basso; E: M.

### HIGH (qualità match / football intelligence / copertura AC)
16. Semantic Validator per-Situation (beat fini) — B: AC-071…080; E: L; Dep: 1.
17. Motion Validator (fluidità/continuità) — B: AC-031…040; E: L; Dep: 1.
18. Camera Validator (protagonista/palla sempre visibili) — B: AC-041…048; E: M; Dep: 1.
19. Football Intelligence Score dal vivo (reazioni/marcature) — B: AC-061…070; E: L; Dep: 1.
20. AI individuale per-frame (scelte del portatore, più coperture) — B: realismo; E: L.
21. Ritiro degli archi pre-autorati → traiettorie 100% derivate dalla decisione (Step 3 residuo) — B: scorecard #3/#6; E: L.
22. Migrare i 35 testi Situation esecutivi a pura intenzione (oggi risolti solo a display) — B: scorecard #1; E: M.
23. Rendere `deriveIntent` text-free (come la cinematica) — B: coerenza direttiva; R: medio (golden); E: M.
24. NPC liveness validata dal vivo (no zombie, AC-081…090) — B: realismo; E: M; Dep: 1.
25. Arbitro/panchine/comunicazione GK reattivi — B: AC-085/086/087; E: M.
26. Pubblico reattivo agli eventi (AC-088) verificato — B: immersione; E: S.
27. Off-ball: bufferizzare oggetti per-frame (no alloc) — B: GC/mobile; R: basso; E: M.
28. Off-ball: ridurre O(N²) (griglia spaziale per repulsione/marcatura) — B: perf; E: M.
29. Decision Engine: aggiungere modulo squadra/altre tattiche — B: varietà; E: M.
30. Validare il piede preferito (F8) sull'esito — B: realismo; E: S.
31. Coerenza outcome-key estesa (taxonomy completa) — B: semantica esito; E: S.
32. Validare la barriera punizioni + visibilità portiere dal vivo — B: set-piece; E: M.
33. Validare sgombero area sui rigori — B: set-piece; E: S.
34. Cross-validation Validator×AI Vision (cap. 16) — B: meno falsi positivi; E: M.
35. Situation Recognition AI Vision ↔ Semantic come ponte formale — B: AC-161; E: M; Dep: 1.
36. AI Vision: cattura video continua (oggi frame multipli) — B: leggibilità temporale; E: M.
37. Build Comparison AI Vision (build N-1 vs N) — B: trend qualità; E: M.
38. Implementare `analyze()` OpenAI/Gemini provider — B: ridondanza provider; E: S.
39. Failure Package ricco (video/snapshot per-fail) — B: debugging; E: M; Dep: 6.
40. Coverage tracker per-Situation (AC come check per-situation, target 600–1000) — B: copertura; E: L.
41. Validare no-boomerang/teletrasporto palla dal vivo (AC-029/030) — B: fisica; E: M; Dep: 1.
42. Validare collisioni/inerzia/rimbalzi (AC-091…100) — B: fisica; E: L; Dep: 1.
43. Validare post-highlight conclude (AC-039/055/056) — B: narrativa; E: M; Dep: 6.
44. Validare durata replay adeguata alla Situation (AC-079) — B: narrativa; E: S; Dep: 6.
45. Coerenza camera↔pattern nella firma golden — B: regressione regia; E: S.

### MEDIUM (manutenibilità / architettura / DX)
46. Estrarre i motori puri (`deriveIntent`/`decide…`/`buildHLTimeline`) in `<script>` separato/modulo — B: testabilità; R: medio; E: M.
47. Spezzare `ThreeMatchView` (AI / locomozione / conclusione / camera) — B: leggibilità; R: medio; E: L.
48. Spezzare `LiveMatch` (state machine / UI / hook) — B: leggibilità; R: medio; E: L.
49. Spezzare `CareerApp` (carriera / mercato / competizioni / migration) — B: leggibilità; E: L.
50. Estrarre la **migration save** in funzione dedicata versione-gated — B: auditabilità; E: M.
51. Centralizzare i magic numbers AI in costanti nominate — B: leggibilità; E: S.
52. Centralizzare le regex di esecuzione in un dizionario unico — B: anti-drift; E: S.
53. Unificare l'engine-doc (root vs docs/) — B: una fonte; E: S.
54. Spostare `versions/` fuori dal repo (release asset/branch) — B: peso; R: basso; E: S.
55. Rimuovere file spazzatura non tracciati (sessione) / .gitignore — B: pulizia; E: S.
56. Aggiornare il modello Claude in-game (`claude-sonnet-4-6`) o rimuovere la feature — B: correttezza; E: S.
57. Aggiornare la "Politica Git" (branch `remote-control` inesistente) nei doc — B: coerenza; E: S.
58. Marcare il debito con TODO/FIXME tracciabili — B: visibilità; E: S.
59. Registry Situation con metadati/validator associati (cap. 3.13) — B: estendibilità; E: L.
60. Event Registry formale (cap. 3.13) — B: validator disaccoppiati; E: M; Dep: 1.
61. Validator/Plugin registry runtime (cap. 3.12) — B: open/closed; E: L.
62. Config-first per il gate (file vs env var) — B: cap. 3.13; E: M.
63. Modalità QA Core (Single/Stress/Regression/Nightly) — B: cap. 3.2; E: M.
64. State machine esplicita del QA Core (IDLE→…→COMPLETED) — B: tracciabilità; E: M.
65. Recovery automatico (browser crash/timeout) nel gate — B: resilienza; E: M.
66. Football Intelligence KB dichiarativa (estrarre regole dal codice) — B: cap. 3.10; E: L.
67. Knowledge Base errori ricorrenti (cap. 21) — B: apprendimento; E: M.
68. Trend Analysis storico (Quality Score per build) — B: cap. 18; E: M.
69. Dashboard: Home live multi-run + search/filtri — B: cap. 3.8; E: M.
70. Visual Comparison due replay affiancati — B: cap. 3.6; E: M; Dep: 6.
71. Esportazione report PDF/CSV — B: cap. 3.8; E: S.
72. Notifiche (regressione/fine suite/FAIL critical) — B: DX; E: S.
73. Profilo perf per-device (mobile target) — B: realismo perf; E: M.
74. Misura CPU/GPU nel Performance Monitor — B: cap. 3.11; E: M.
75. Test dispose/teardown match (memoria stabile su 100 match) — B: AC-117/119; E: M.
76. Rendere `selectContextualSituations` testabile node-side — B: copertura selezione; E: M.
77. Determinismo della selezione HL (oggi non coperta dal gate) — B: anti-flicker; E: M.
78. Coprire `simulateMatch`/standings con unit test node — B: integrità classifiche; E: M.
79. Coprire `generateSeasonCalendar` invariants (no disallineamento giornate) — B: stabilità stagione; E: S.
80. Lint/format leggero (anche solo Prettier sul blocco babel estratto) — B: qualità; E: M.
81. Documentare l'API `window.__CPM_*` (17 hook) come contratto — B: stabilità gate; E: S.
82. Single source per `cappedMM` (oggi duplicata) — B: anti-drift; E: S.
83. Estrarre il blob dati L2715 (17.8k char) su righe leggibili — B: diff/leggibilità; E: S.
84. Validare HUD non copre palla/protagonista (AC-141/142) — B: UI; E: M.
85. Validare timer/punteggio/nomi sincronizzati (AC-144…147) — B: UI; E: M.

### LOW (polish / futuro)
86. Audio layer (prerequisito AC-151…160) — B: immersione; E: L.
87. Nuove telecamere (Broadcast/Drone/Goal) come plugin — B: cap. 3.12; E: L; Dep: 61.
88. Replay cinematici/rallentati — B: qualità; E: M; Dep: 6.
89. Post-processing leggero (bloom/vignette controllati) — B: estetica; E: M.
90. Illuminazione dinamica/meteo avanzato — B: estetica; E: M.
91. Heatmap/xG/Player Rating (Analytics plugin) — B: cap. 3.12; E: M.
92. Commentary plugin IT/EN/AI — B: cap. 3.12; E: M.
93. Scenario Library + Scenario Score (cap. 3.3) — B: copertura mirata; E: L.
94. Generazione exhaustive multi-asse (meteo/zona/difficoltà/tattica) — B: copertura; E: L.
95. Plugin Marketplace predisposizione (cap. 3.12) — B: futuro; E: L.
96. Release Candidate process (Quality Score globale, soglie) — B: AC-191…200; E: M.
97. Human Review Workflow + escalation (cap. 19 AI Vision) — B: governance; E: M.
98. Retention/compressione Failure Package (cap. 3.7) — B: housekeeping; E: S.
99. Service worker/offline verificato (`sw.js`) — B: PWA; E: S.
100. Internazionalizzazione completa UI (oggi parziale IT/EN) — B: reach; E: M.

---

### Appendice — Metriche raccolte (evidenza quantitativa)
- File gioco: **20.633 righe**; riga più lunga **17.813 char** (L2715, blob dati).
- React: **133 `useState` · 69 `useEffect` · 65 `useRef`**.
- Timing: **141 `setTimeout` · 5 `setInterval`**.
- Hook test: **17 `window.__CPM_*`**.
- `console.*`: 20 · `try/catch`: 22 · TODO/FIXME/HACK: **2**.
- Tag di churn (Sprint/LMQP/F): **159**.
- LMQP: **10 check** gate (verde 10/10) · **28** unit test vision · golden+decision baseline committate.
- Doc: charter + 6 spec + 2 engine-doc; tutte con tabella "stato attuale" onesta.

*Fine report. Studio completato senza modifiche al repository.*
