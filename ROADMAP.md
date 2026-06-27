# ROADMAP.md

**Live Match Development Platform — Product Roadmap**

Version 1.0

> Si conforma a `MASTER_PROMPT.md` (charter LMQP). Documento vivo (DoD attuale: sez. 1–5).

---

## 1. Vision

### Obiettivo

Diventare uno dei framework più avanzati per **sviluppo, validazione e miglioramento continuo** di un motore Live Match calcistico. La piattaforma non genera solo highlight: produce **azioni credibili, realistiche, leggibili e sincronizzate**, supportate da QA completo, validazione automatica e revisione AI.

### Mission

Realizzare il miglior Live Match Engine per un Football Career Manager mobile, garantendo: realismo calcistico · fluidità visiva · qualità cinematografica · coerenza narrativa · assenza di regressioni · sviluppo guidato dai dati · miglioramento continuo.

### Long-Term Vision

Nel lungo periodo: generare automaticamente highlight realistici · validare ogni azione senza intervento umano · individuare regressioni automaticamente · assistere gli sviluppatori · migliorare progressivamente la qualità tramite analisi oggettive.

### Core Principles

`Football First → Situation First → Quality First → Automation First → AI Assisted Development → Continuous Improvement`

---

## 2. Current Platform Status

| Componente | Stato (da roadmap) |
|---|---|
| **Quality Assurance** | Completato — documentazione tecnica, validator, Acceptance Criteria, AI Vision Review, Development Rules |
| **Live Match Engine** | Parzialmente implementato — highlight giocabili, da migliorare realismo/sincronizzazione/Football Intelligence/animazioni/cinematografia |
| **Highlight Engine** | Funzionante — da evolvere: post-highlight, continuità narrativa, varietà, riduzione ripetizioni |
| **Replay Engine** | Disponibile — da migliorare: durata, inquadrature, cinematografia, fluidità |
| **Camera System** | Disponibile — servono nuove telecamere, migliore inseguimento palla, transizioni naturali |
| **AI Review** | Architettura definita — da integrare nel ciclo di sviluppo |

> ⚠️ **Precisazione del repo (onestà documentale):** la riga "QA Completato" è vera per la **documentazione/specifica**; l'**implementazione** del QA è ancora parziale (il quality gate `tests/visual` copre stato/coerenza/golden ma non movimento/replay/AI). Vedi le mappature in `LIVE_MATCH_QA_SPEC.md`, `VALIDATORS.md`, `ACCEPTANCE_CRITERIA.md`. "Replay Engine disponibile" nel codice = solo screenshot/post-arco, non un Replay Engine completo (cap. 3.5 🔴).

---

## 3. Product Pillars

1. **Football Realism** — ogni highlight indistinguibile da una reale azione calcistica.
2. **Visual Quality** — standard grafico moderno (animazioni, illuminazione, replay, telecamere, post-processing).
3. **Football Intelligence** — decisioni credibili; **le animazioni sono conseguenza delle decisioni, mai il contrario**.
4. **Automation** — ogni attività ripetitiva automatizzata (testing, regression, validator, AI review, report).
5. **Developer Experience** — Claude Code sviluppa/testa/valida col minimo intervento umano.
6. **Scalability** — nuovi componenti integrabili senza modificare l'architettura esistente.

---

## 4. Strategic Objectives

| ID | Obiettivo |
|---|---|
| **SO-001** | aumentare il realismo calcistico |
| **SO-002** | ridurre gli errori visivi |
| **SO-003** | ridurre le regressioni |
| **SO-004** | migliorare la qualità degli highlight |
| **SO-005** | incrementare il livello di automazione |
| **SO-006** | ridurre il tempo medio di sviluppo |
| **SO-007** | ridurre il tempo medio di debugging |
| **SO-008** | migliorare continuamente il Quality Score |
| **SO-009** | ridurre gli interventi manuali durante il QA |
| **SO-010** | preparare la piattaforma a evoluzioni future senza modificare il Core Engine |

---

## 5. Development Roadmap

Fasi incrementali; ogni fase produce un miglioramento **misurabile**; una fase inizia solo dopo il completamento della precedente.

| Fase | Tema | Stato | Deliverable / Obiettivi |
|---|---|---|---|
| **Phase 1** | **Foundation** | ✅ **Completata** | LIVE_MATCH_QA_SPEC · VALIDATORS · DEVELOPMENT_RULES · ACCEPTANCE_CRITERIA · AI_VISION_REVIEW → fondamenta architetturali definite |
| **Phase 2** | **Engine Stabilization** | 🟡 **in corso** | **avviata (5.35→5.37):** Event+Timeline layer (LMQP-1), Semantic/CINE validator dal vivo come 10ª categoria del gate (LMQP-2/3), domain+coverage checks (LMQP-4), decision-regression baseline (LMQP-5), **coerenza dell'esito** (LMQP-6), **Failure Collector** `run-summary.json` (LMQP-7), **Performance Monitor** headless warn-only (LMQP-8), **Dashboard** nel report (LMQP-9). Restano: validator semantici per-Situation completi (beat fini), Replay Engine, Failure Package ricco (video/snapshot), AI-Vision |
| **Phase 3** | **Football Realism** | ⏳ | Football Intelligence · nuovi comportamenti offensivi · varietà azioni · NPC migliori · meno animazioni ripetitive |
| **Phase 4** | **Visual Excellence** | ⏳ | nuove telecamere · replay cinematografici · animazioni avanzate · post-processing · illuminazione dinamica |
| **Phase 5** | **AI Driven Development** | ⏳ | integrazione AI Vision · suggerimenti automatici · revisione automatica build · dashboard intelligente · benchmark evolutivi |

---

## 6. Milestones

Milestone progressive, in ordine cronologico; ogni milestone = incremento misurabile di qualità.

| Milestone | Tema | Stato | Obiettivi |
|---|---|---|---|
| **M1** | Foundation | ✅ Completata | architettura · documentazione standard · QA Framework · Validator · Development Rules · Acceptance Criteria · AI Vision Review |
| **M2** | Engine Stabilization | 🟡 In sviluppo | eliminazione regressioni · sincronizzazione completa · qualità highlight · stabilizzazione animazioni · ottimizzazione replay |
| **M3** | Football Realism | ⏳ Pianificata | realismo azioni · NPC migliori · decisioni credibili · varietà Situation · post-highlight |
| **M4** | Visual Excellence | ⏳ Pianificata | nuove animazioni · nuove telecamere · replay cinematografici · illuminazione · immersione |
| **M5** | AI Driven Development | ⏳ Pianificata | AI Vision integrata · QA automatizzato · benchmark evolutivi · suggerimenti automatici · analisi comparative |

---

## 7. Prioritization Model

| Priorità | Descrizione / esempi |
|---|---|
| **Critical** | blocca la qualità → immediata: crash · regressioni · perdita dati · replay non funzionanti |
| **High** | impatta direttamente il giocatore: animazioni · Football Intelligence · sincronizzazione · highlight |
| **Medium** | migliora la qualità generale: nuove telecamere · effetti grafici · UI |
| **Low** | miglioramenti incrementali · pianificabili dopo |

---

## 8. Key Performance Indicators

- **KPI Tecnici:** Build Success Rate · Regression Rate · Validator Pass Rate · Test Coverage · Crash Rate · Memory Stability · Average Build Time.
- **KPI Gameplay:** Highlight Quality Score · Football Intelligence Score · Camera Quality Score · Replay Quality Score · Animation Quality Score · Situation Recognition Accuracy.
- **KPI AI:** AI Vision Accuracy · Confidence Score medio · False Positive Rate · False Negative Rate · Tempo medio di revisione.
- **KPI Prodotto:** regressioni per release · tempo medio correzione bug · qualità media delle release · stabilità complessiva.

---

## 9. Project Risks

- **Tecnici:** regressioni · perdita di sincronizzazione · aumento complessità · duplicazione logica · degrado performance.
- **Architetturali:** dipendenze eccessive · componenti accoppiati · perdita modularità · difficoltà di manutenzione.
- **Qualità:** diminuzione realismo · incoerenza narrativa · peggioramento highlight · animazioni ripetitive.
- **Mitigazione:** validator · test automatici · AI Vision Review · benchmark · regression testing.

---

## 10. Future Extensions

La piattaforma evolve **senza modificare il Core Engine**; le estensioni saranno documenti indipendenti, compatibili con la documentazione esistente: Football Intelligence · NPC Intelligence · Camera Guidelines · Animation Guidelines · Commentary Guidelines · Performance Handbook · Dataset Specification · Plugin SDK · AI Training Handbook · Benchmark Library.

---

## 11. Release Strategy

```
Sviluppo → Build → Testing → Validator → AI Vision Review → Acceptance Criteria →
Regression Suite → Release Candidate → Release
```

Nessuna fase può essere saltata.

**Release Gates** (tutti contemporaneamente): Build PASS · Validator PASS · AI Review PASS · Acceptance PASS · nessuna regressione critica · documentazione aggiornata.

---

## 12. Success Criteria

Il progetto ha successo quando: gli highlight sono calcisticamente credibili · il comportamento dei giocatori è naturale · la qualità visiva è costante · il QA è completamente automatizzato · le regressioni sono intercettate prima del rilascio · Claude Code sviluppa e valida seguendo la documentazione senza interventi manuali continui · ogni versione mantiene o migliora la qualità della precedente.

---

## 13. Long-Term Vision

La piattaforma evolverà in un **ecosistema completo** per lo sviluppo di motori calcistici, capace di: generare automaticamente highlight realistici · validare autonomamente la qualità · assistere gli sviluppatori lungo tutto il ciclo · confrontare versioni · produrre report tecnici e gestionali · supportare il miglioramento continuo con strumenti AI.

> L'obiettivo finale non è solo un Live Match Engine di elevata qualità, ma una **piattaforma di sviluppo, validazione e miglioramento continuo** che preservi qualità, stabilità e manutenibilità nel tempo.

---

## Definition of Done (Roadmap)

Completa quando definisce visione strategica condivisa, milestone evolutive, priorità e criteri di successo, rischi e KPI, e una direzione chiara per le future attività. **Ogni decisione tecnica e funzionale deve poter essere ricondotta agli obiettivi di questo documento** (coerenza tra architettura, implementazione, qualità e visione di lungo periodo).

---

## Nota di raccordo — Phase 1 "Foundation" ✅ e prossimo passo concreto

La **Phase 1 (Foundation)** è di fatto **completata in questa sessione**: tutti i deliverable documentali esistono nel repo (charter, spec 3.1–3.13, validator LMV-001…030, development rules 1–20, acceptance AC-001…200, AI vision 1–23).

Il primo passo **implementativo** della **Phase 2 (Engine Stabilization)** — coerente con tutte le mappature di copertura — è il **layer Event + Timeline** osservabile nel motore: prerequisito di Replay Engine, validator Semantic/Motion/Narrative, Regression Engine ricco e Failure Package. È il candidato come prima attività di codice quando si passa dalla spec all'implementazione.
