# TECHNICAL_DEBT.md — Fase 1 (Master Execution Plan)

> Debito tecnico di CPM / Live Match Development Platform, classificato per priorità e **aggiornato allo stato 5.39.0** (la sessione corrente ha ridotto molto il debito QA). Vedi `REPOSITORY_AUDIT.md`, `ARCHITECTURE_MAP.md`, `DEPENDENCY_MAP.md`.

## Legenda
🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low · ✅ risolto/mitigato in questa sessione

## A. Architettura & manutenibilità
| # | Debito | Gravità | Note |
|---|---|---|---|
| A1 | **File unico 20.664 righe** — nessun module system | 🟠 | manutenibilità; motori puri già estraibili a tooling (✅ parziale) |
| A2 | **Monoliti** `ThreeMatchView` (~1.960) / `LiveMatch` (~5.000) / `CareerApp` (~5.700) | 🟠 | split gate-blind → richiede collaudo dal vivo (mappa: `docs/ARCHITECTURE_REFACTOR_MAP.md`) |
| A3 | **God object `player`** — serializzazione monolitica, accoppiamento diffuso | 🟡 | |
| A4 | **Accoppiamento `LiveMatch ⇄ ThreeMatchView`** (props larghe + `propsRef` + `__CPM_*`) | 🟡 | |
| A5 | Magic numbers/regex ripetuti inline (off-ball AI, deriveHL) | 🟡 | da centralizzare contestualmente allo split |
| A6 | Riga dati ~17.8k char (blob minificato) | 🟢 | leggibilità/diff |
| A7 | Plugin/registry runtime assenti (cap. 3.12/3.13) | 🟡 | i check LMQP sono import-statici |

## B. Engine & dati
| # | Debito | Gravità | Note |
|---|---|---|---|
| B1 | **`deriveIntent` legge `sit.text`** (coupling testo→intent) | 🟡 | ✅ mitigato: override `tactic.it` (5.39.0) permette di congelare l'intent prima di editare i testi |
| B2 | **35 testi "esecutivi"** nei dati (risolti a display) | 🟢 | ✅ rivalutato: sono testi-scena evocativi e BUONI; riscriverli alla cieca peggiorerebbe — fine-tuning mirato, non sistematico |
| B3 | Render in parte **animation-driven** (archi pre-autorati) — scorecard #3 | 🟠 | F4–F7 derivano già pace/precisione dalla decisione; ritiro completo = sprint |
| B4 | AI individuale per-frame incompleta (off-ball euristica) | 🟡 | F10/F11/F13 fatti; lettura completa spazi/pericoli = sprint |

## C. Persistenza
| # | Debito | Gravità | Note |
|---|---|---|---|
| C1 | **`SAVE_VERSION` scritto ma non usato** come gate di migrazione (field-presence based) | 🟡 | robusto ma versioning solo nominale |
| C2 | Migration accretiva (~79 backfill) | 🟢 | ✅ estratta in `migratePlayer` pura + **test `save-compat` 12/12** (path prima cieco) |

## D. Rendering & performance
| # | Debito | Gravità | Note |
|---|---|---|---|
| D1 | Allocazioni per-frame nell'off-ball AI (GC mobile) | 🟡 | O(N²) su più passi (22 attori) |
| D2 | Nessuna misura CPU/GPU/leak completa | 🟡 | perf-monitor (load/heap/fps warn-only) presente; leak/zombie auto da fare |
| D3 | Frame nero/teardown all'esito (transizione → card riepilogo) | 🟢 | ✅ gestito nella cattura AI Vision (guardia luma) |

## E. Dipendenze esterne
| # | Debito | Gravità | Note |
|---|---|---|---|
| E1 | **CDN runtime** (React/Three/Babel) — single point of failure in PROD | 🟠 | fallback locale solo nel gate, non in produzione |
| E2 | Audio inesistente (AC-151…160 aspirazionali) | 🟢 | feature, non debito |

## F. QA & copertura (fortemente migliorato in questa sessione)
| # | Stato | Note |
|---|---|---|
| F1 | ✅ Gate **9→12 categorie** | +timeline(backbone) +motion(liveness+reattività+no-teleport) +ball-motion(no-boomerang) |
| F2 | ✅ Suite logica node **test:logic 16** | Decision Engine, cine-backbone su TUTTE le 179, backbone-regression, data-audit, cronaca-audit |
| F3 | ✅ **3 baseline di regressione** | stato (golden) · decisione (decision-baseline) · narrazione (backbone-baseline) |
| F4 | ✅ **Save-compat + Replay (D1 slice) + Stress** in CI | path save/replay prima non coperti |
| F5 | ✅ **AI Vision operativa** (Ollama gemma3:27b) | situation-recognition, cross-validation (#34), build-comparison (#37) |
| F6 | ✅ **CI esegue tutta la suite** ad ogni push | prima solo il gate |
| F7 | 🟡 **Render/regia = perceptual** | non gate-verificabile (provato: soglie geometriche → falsi positivi); serve AI Vision o occhio |
| F8 | 🟡 Replay Engine completo, Failure Package ricco, Plugin system | sprint grandi |

## G. Doc drift
| # | Debito | Gravità | Note |
|---|---|---|---|
| G1 | Riferimenti di riga negli engine-doc | 🟢 | da rinfrescare periodicamente |
| G2 | ✅ Branch/modello/versione stale | corretti in sessione (model `claude-sonnet-4-6`, branch refs, versioni) |
| G3 | Doppia engine-doc (root + docs/) | 🟢 | da unificare |

## Sintesi per la roadmap (Fase 2)
- **Critical (🔴):** nessun debito *bloccante* aperto (zero crash/regressioni; gate 12/12). Il rischio più alto residuo è E1 (CDN in prod).
- **High (🟠):** split monoliti (A1/A2), CDN fallback prod (E1), archi animation-driven (B3).
- **Medium (🟡):** SAVE_VERSION gate (C1), perf/leak (D2), B1/B4, A3/A4/A5/A7, F7/F8.
- **Low (🟢):** housekeeping vari.

> Nota di onestà: il debito **QA** (storicamente il più grave) è stato **ridotto sostanzialmente** in questa sessione. Il debito **architetturale** (single-file/monoliti) resta il principale, ma è gate-blind → va affrontato con collaudo dal vivo (Fase 3+), non alla cieca.
