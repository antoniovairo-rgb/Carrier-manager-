# Roadmap

Roadmap della **Live Match Development Platform (LMQP)**. Si conforma a `MASTER_PROMPT.md`; il dettaglio architetturale di ogni fase è in `LIVE_MATCH_QA_SPEC.md`.

| Fase | Tema | Riferimento spec |
|---|---|---|
| **Fase 1** | Core QA | cap. 3.2 QA Core |
| **Fase 2** | Replay | cap. 3.5 Replay Engine |
| **Fase 3** | Validator | cap. 3.4 Validator Engine + `VALIDATORS.md` |
| **Fase 4** | Dashboard | cap. 3.8 Visual QA Dashboard |
| **Fase 5** | AI Vision | cap. 3.9 AI Vision Review Engine |
| **Fase 6** | Regression | cap. 3.6 Regression Engine |
| **Fase 7** | Performance | cap. 3.11 Performance Monitor |
| **Fase 8** | Release Candidate | — |

---

## Stato attuale (onestà documentale)

Il gioco (`CARRIER-MANAGER-AV.html`, CPM 5.34.0) ha già un **quality gate** Playwright (`tests/visual`, 9 categorie) che è l'**embrione della Fase 1/3** (Core QA + alcuni validator a frame congelato). Le altre fasi sono in larga parte da costruire.

> **Prerequisito trasversale** emerso dalle mappature di `LIVE_MATCH_QA_SPEC.md` e `VALIDATORS.md`: il **layer Event + Timeline** osservabile nel motore. Sblocca Replay (Fase 2), i validator semantici/narrativi (Fase 3), Regression ricca (Fase 6) e i Failure Package. È il candidato come **primo mattone implementativo** (proposto come "LMQP-1"), una volta dato il via libera.

| Fase | Stato sintetico |
|---|---|
| 1 Core QA | 🟡 gate orchestratore mono-worker (no modalità/state-machine/recovery) |
| 2 Replay | 🔴 da costruire (dipende da Event+Timeline) |
| 3 Validator | 🟡 Technical/Ball/Camera/Player + score analitici; Semantic/Motion/Narrative 🔴 |
| 4 Dashboard | 🟡 report statico `out/validate/index.html` |
| 5 AI Vision | 🔴 (screenshot già disponibili come input) |
| 6 Regression | 🟡 solo golden regression (firma stato) |
| 7 Performance | 🔴 da costruire |
| 8 Release Candidate | 🔴 |
