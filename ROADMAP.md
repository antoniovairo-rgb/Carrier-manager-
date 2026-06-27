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
| **Phase 2** | **Engine Stabilization** | 🟡 in pianificazione | eliminazione regressioni · stabilizzazione Live Match Engine · miglior sincronizzazione · completamento validator · QA automatico integrato |
| **Phase 3** | **Football Realism** | ⏳ | Football Intelligence · nuovi comportamenti offensivi · varietà azioni · NPC migliori · meno animazioni ripetitive |
| **Phase 4** | **Visual Excellence** | ⏳ | nuove telecamere · replay cinematografici · animazioni avanzate · post-processing · illuminazione dinamica |
| **Phase 5** | **AI Driven Development** | ⏳ | integrazione AI Vision · suggerimenti automatici · revisione automatica build · dashboard intelligente · benchmark evolutivi |

---

## Definition of Done (sez. 1–5)

Soddisfatta quando la roadmap descrive chiaramente visione, stato attuale, pilastri strategici, obiettivi di lungo periodo e fasi evolutive del Live Match Engine, fornendo una direzione univoca per le attività future.

---

## Nota di raccordo — Phase 1 "Foundation" ✅ e prossimo passo concreto

La **Phase 1 (Foundation)** è di fatto **completata in questa sessione**: tutti i deliverable documentali esistono nel repo (charter, spec 3.1–3.13, validator LMV-001…030, development rules 1–20, acceptance AC-001…200, AI vision 1–23).

Il primo passo **implementativo** della **Phase 2 (Engine Stabilization)** — coerente con tutte le mappature di copertura — è il **layer Event + Timeline** osservabile nel motore: prerequisito di Replay Engine, validator Semantic/Motion/Narrative, Regression Engine ricco e Failure Package. È il candidato come prima attività di codice quando si passa dalla spec all'implementazione.
