# BACKLOG.md — Fase 2 (Master Execution Plan)

> Backlog operativo ordinato per priorità. Derivato da `TECHNICAL_ROADMAP.md` / `TECHNICAL_DEBT.md`. Stato base 5.39.0.
> **Pri:** 🔴Critical · 🟠High · 🟡Medium · 🟢Low. **Eff:** S/M/L. **Verifica:** Gate=autonomo · Node=test:logic · Live=collaudo utente · AIV=AI Vision. **Stato:** ☐ aperto · ◑ parziale · ✅ fatto.

## Priorità HIGH 🟠
| ID | Titolo | Fase | Eff | Dipendenze | Verifica | Stato |
|---|---|---|---|---|---|---|
| BL-01 | CDN fallback in PRODUZIONE (React/Three/Babel locali o SW-cache) — rimuove il single-point-of-failure E1. FATTO 7.46.2: il SW cacha tutti gli asset GET al primo fetch (risposte opache incluse), network-first invariato. ⚠️ Collaudo dal vivo: prima visita online → modalità aereo → il gioco deve partire | 4 | M | — | Gate + Live | ✅ (collaudo live pendente) |
| BL-02 | Split `CareerApp` in sotto-componenti UI (tabs) — primo split a basso rischio | 3 | L | baseline | Gate + Live | ☐ |
| BL-03 | Split `LiveMatch` (state-machine / UI / hook) | 3 | L | BL-02 | Gate + Live | ☐ |
| BL-04 | Split `ThreeMatchView` (off-ball AI / locomozione / conclusione / camera) — massimo rischio | 3 | L | BL-03, mappa | **Live** (gate-blind) | ☐ |
| BL-05 | Archi conclusione 100% derivati dalla decisione (ritiro pre-autorati residui, scorecard #3) | 7 | L | — | AIV + Live | ◑ (F4-F7 fatti) |
| BL-06 | Animation quality: blending/transizioni/fluidità (AI Vision animationQuality ~40-55→↑) | 7 | L | — | AIV + Live | ☐ |

| BL-07 | **cpmadapt indebolito** — la risposta adattiva della difesa (shading fascia calda) misura 0.4-0.8u su TUTTA la storia raggiungibile (bisezione 7.46.0: 7.8.20→0.81u · 7.9.0→0.37u · 7.15.0→0.42u · 7.24.0→0.59u · HEAD→0.41u) contro la baseline 6.75.0 di ±6u; valori da «pre-DEF-4» (0.78u) → sospetto: la marcatura PASS 1b o un pass 3D successivo sovrascrive di nuovo lo shading del blocco (`_adSHL`/`adaptShift`). DIAGNOSI 7.46.1 (hook __CPM_MM/__CPM_MP): byFlank OK (R:8/8) · _adSHL formula OK (+6 raggiungibile) · ma la linea LOGICA LiveMatch si sposta solo ~+1.5u (mesh≈logico → il 3D è innocente). Piste: (a) la misura top-4-per-x mescola INGAGGIATI (senza shading) e blocco (con) — a trequarti stanno alle stesse x; (b) convergenza parziale del lerp del loop HL (650ms/tick) nella finestra di misura. RISOLTO 7.46.1: era un ARTEFATTO DI MISURA del test (i «4 più arretrati per x» mescolavano ingaggiati e blocco → segnale cancellato); adapt-test riscritto (misura il BLOCCO via __CPM_MP, escl. 2 più vicini all'eroe, convergenza 2.6s) → separazione 12.29u bidirezionale (+7.27/−5.02). Il gioco non è mai stato rotto | 7 | M | — | adapt-test + Live | ✅ |

## Priorità MEDIUM 🟡
| ID | Titolo | Fase | Eff | Dipendenze | Verifica | Stato |
|---|---|---|---|---|---|---|
| BL-10 | Camera broadcast: tracking/framing/zoom/cinematic (cameraQuality 50-65→↑) | 9 | L | — | AIV + Live | ☐ |
| BL-11 | Off-ball AI: bufferizzare oggetti per-frame (no alloc) + griglia spaziale (O(N²)→). FATTO 7.47.0 (prima metà): pooling dei buffer per-frame del PASS 1 (`_tgB/_tgPool` 24 slot 7 campi · `_hmPB/_awPB/_ptPool` · `_mkClaimB.clear()`) su `sr.current` — semantica identica (nessun consumatore trattiene riferimenti oltre il frame), fingerprint gate invariato. La griglia spaziale (O(N²)→O(N)) resta a backlog: N=22 → il quadratico costa poco, il GC era il collo | 10 | M | — | Gate(motion) + perf | ◑ (pooling ✅) |
| BL-12 | Leak/zombie detection automatica + CPU/GPU nel perf-monitor. FATTO (prima metà, post-7.48.0): `measureLeak()` in perf-monitor — pendenza heap MB/s a scena statica (4 campioni × 700ms, warn >3MB/s) + conteggio canvas zombie a fine run (warn >4); `perf.leak` nel run-summary, warn-only come tutto LMQP-8. CPU/GPU restano a backlog (headless = software render, servono device reali) | 10 | M | — | perf-monitor | ◑ (leak ✅) |
| BL-13 | `SAVE_VERSION` come gate di migrazione reale (+stamp) | 4 | M | — | Node(save-compat) | ☐ |
| BL-14 | Audit & cleanup dei `setTimeout` in `LiveMatch` (no leak/race) + `dispose()` Three. AUDIT 2026-07-14 (post-7.48.0): 20/20 siti setTimeout di LiveMatch SICURI — tracciati in `chantTimersRef`/`fxTimersRef` (flushati su cambio fase + `ended` + unmount, 5.75.0/6.76.0) o effect-local con `clearTimeout` nel cleanup; unico non tracciato = unlock `_contLockRef` (ref-only, innocuo post-unmount). Dispose Three coperto: deep dispose fine partita (BUG-4) + GalaStage3D/InterviewStage3D/IntroCinematic (11 siti dispose). Nessun intervento necessario | 4 | M | — | Gate + stress | ✅ (audit) |
| BL-15 | Sync cronaca↔esito↔animazione fine (AC-049/050) | 5 | M | timeline | AIV + timeline | ☐ |
| BL-16 | AI individuale per-frame (scelte portatore, coperture multiple) | 6 | L | — | Gate(motion) + Live | ◑ (F10/F11/F13) |
| BL-17 | Fine-tuning mirato situations (su flag dal gioco) + intent-decouple uso reale | 6 | M | tactic.it | data-audit + Live | ◑ (gi69) |
| BL-18 | +Varietà cronaca (nuove righe BG_MATCH, anti-ripetizione). 7.48.0: +16 voci lint-coerenti (pool 189) + finestra dedup del picker 3→6 | 6 | S | — | Node(cronaca-audit) + bg-coherence | ✅ |
| BL-19 | AI Vision: implementare analyze() OpenAI/Gemini + video continuo + scoring storico | 11 | M | — | test:vision | ◑ (Ollama) |
| BL-20 | Acceptance + Regression come step formali della CI + Failure Package ricco | 12 | M | — | CI | ◑ (CI base) |
| BL-21 | Replay Engine: registrazione completa di OGNI HL + snapshot/diff tra build | 8 | L | replay slice | replay + Live | ◑ (slice) |
| BL-22 | Plugin/registry runtime (Situation/Validator/Event) — cap. 3.12/3.13 | 3 | L | — | Gate | ☐ |
| BL-23 | Magic numbers/regex dei motori centralizzati (contestuale allo split) | 3 | M | BL-04 | Gate | ☐ |
| BL-25 | Sede dei turni KO successivi (coppa/euro) con `Math.random()<0.5` NUDO (3 siti: ~19142/19167/19496) — va SEEDATA (hashStr club|round|season) per Determinism First; scoperto durante la caccia ai «tifosi sbagliati» 7.52.2 | 4 | S | — | Node + dup-fixture | ☐ |
| BL-24 | `deriveIntent` text-free completo (usando tactic.it su tutte) — opzionale | 3 | M | tactic.it | Gate(decision) | ☐ |

## Priorità LOW 🟢
| ID | Titolo | Fase | Eff | Verifica | Stato |
|---|---|---|---|---|---|
| BL-30 | Unifica engine-doc (root `LIVE-MATCH-ENGINE.md` ↔ `docs/`) | 3 | S | — | ☐ |
| BL-31 | Spezzare la riga dati ~17.8k char (leggibilità/diff) | 3 | S | Gate | ☐ |
| BL-32 | Documentare il contratto `window.__CPM_*` (17 hook) | 3 | S | — | ☐ |
| BL-33 | Rinfrescare riferimenti di riga negli engine-doc | 3 | S | — | ☐ |
| BL-34 | Replay Debugger UI (frame-by-frame, salto evento) | 8 | L | BL-21 | Live | ☐ |
| BL-35 | Audio layer (prerequisito AC-151…160) | 13 | L | — | Live | ☐ |
| BL-36 | Nuove camere/replay/stadi/competizioni | 13 | L | Fasi 1-12 | tutto | ☐ |

## Già fatto in questa sessione (chiuso, per tracciabilità)
✅ Gate 9→12 categorie (timeline/motion/ball-motion) · test:logic 16 (Decision Engine, cine-backbone 179, backbone-regression, data-audit, cronaca-audit) · 3 baseline regressione · save-compat · replay slice (D1) · stress · AI Vision operativa (#34/#35/#37) · CI esegue tutto · migratePlayer estratta · intent-decouple foundation (tactic.it) · gi69 · +12 cronaca · model-id Claude · Technical Discovery + Audit Fase 1.

## Exit Criteria Fase 2
✅ Tutte le attività **classificate** (priorità/effort/dipendenze/rischi/verifica) e **ordinate per priorità**. Mappate sulle 13 fasi del Master Plan. Pronte per l'esecuzione (Fase 3+).
