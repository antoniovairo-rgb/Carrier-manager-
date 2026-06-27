# Acceptance Criteria

Checklist di accettazione della **Live Match Development Platform (LMQP)**. Si conforma a `MASTER_PROMPT.md` e a `LIVE_MATCH_QA_SPEC.md`.

> **Stato: STUB / da completare.** Documento scheletro: i controlli dettagliati vanno popolati progressivamente. **Target: 600–1000 controlli.**

Da completare con checklist dettagliata per le seguenti aree:

- **Gameplay**
- **Highlight**
- **Replay**
- **Validator**
- **Performance**
- **AI Review**
- **Dashboard**
- **Regression**
- **Failure Collector**

---

## Note di raccordo (onestà documentale)

I criteri di accettazione **per-Situation** discendono direttamente dalle *Definition of Done* dei validator in `VALIDATORS.md` (LMV-001…) e dalle DoD dei moduli in `LIVE_MATCH_QA_SPEC.md` (cap. 3.x). Quando questo documento verrà popolato, ogni voce dovrà essere:

- **verificabile** (manuale o automatica) — preferibilmente automatica (charter: "eliminare il testing manuale ripetitivo");
- **tracciabile** a un validator / modulo / Situation;
- **deterministica** (riproducibile via Seed).

Prerequisito tecnico per rendere automatizzabile la maggior parte dei controlli (Highlight/Replay/Validator/Regression/Failure Collector): il **layer Event + Timeline** osservabile nel motore (vedi mappature in `LIVE_MATCH_QA_SPEC.md` e `VALIDATORS.md`).
