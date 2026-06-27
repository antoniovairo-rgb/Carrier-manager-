# ACCEPTANCE_CRITERIA.md

**Live Match Development Platform — Acceptance Criteria**

Version 1.0

> Checklist ufficiale del progetto. Si conforma a `MASTER_PROMPT.md` (charter LMQP) e a `DEVELOPMENT_RULES.md`. Documento vivo (DoD attuale: primi 50 criteri).

---

## 1. Scopo del documento

Definisce i **criteri oggettivi** per determinare se una modifica del Live Match Engine può dirsi completata. Nessuna implementazione è approvabile se non soddisfa **integralmente** i requisiti applicabili.

**Ambito:** Gameplay · Live Match Engine · Football Intelligence · Highlight Engine · Replay Engine · Camera System · Animation System · Physics · Match Simulation · UI del Live Match · Audio · Commentary · Database · Persistenza · Performance.

**Principio fondamentale:** una funzionalità non è completata quando *"sembra funzionare"*, ma solo quando soddisfa **tutti** i criteri applicabili.

---

## 2. Acceptance Philosophy

- **Oggettività** — ogni criterio è verificabile; vietati criteri soggettivi. *(NON "l'animazione sembra migliore" MA "il validator LMV-004 restituisce PASS".)*
- **Ripetibilità** — stesso test → stesso risultato; ogni verifica automatizzabile.
- **Completezza** — verificare casi positivi, negativi, edge case, regressioni, compatibilità (non solo il caso principale).

---

## 3. Acceptance Workflow

```
Implementazione → Build → Lint → Compilation → Unit Test → Integration Test →
Replay Test → Validator Test → Visual Test → Performance Test → Acceptance Criteria → Release
```

Qualsiasi **FAIL interrompe** il flusso.

---

## 4. Global Acceptance Rules

| ID | Criterio |
|---|---|
| **AC-001** | la build si completa senza errori |
| **AC-002** | nessun warning critico |
| **AC-003** | il progetto compila completamente |
| **AC-004** | nessun crash |
| **AC-005** | nessuna eccezione non gestita |
| **AC-006** | tutti i test automatici PASS |
| **AC-007** | tutti i validator interessati PASS |
| **AC-008** | nessuna regressione introdotta |
| **AC-009** | la qualità complessiva non diminuisce |
| **AC-010** | la modifica è documentata |

## 5. Gameplay Acceptance

| ID | Criterio |
|---|---|
| **AC-011** | l'intenzione dell'azione è evidente |
| **AC-012** | l'Outcome è coerente con la Situation |
| **AC-013** | il comportamento del protagonista è credibile |
| **AC-014** | i compagni reagiscono |
| **AC-015** | gli avversari reagiscono |
| **AC-016** | il portiere reagisce quando coinvolto |
| **AC-017** | l'arbitro è coerente con la situazione |
| **AC-018** | posizioni iniziali plausibili |
| **AC-019** | posizioni finali che preparano la fase successiva |
| **AC-020** | nessun teleport |

## 6. Ball Acceptance

| ID | Criterio |
|---|---|
| **AC-021** | pallone sempre visibile salvo occlusioni naturali |
| **AC-022** | traiettoria fisicamente credibile |
| **AC-023** | velocità coerente |
| **AC-024** | rotazioni realistiche |
| **AC-025** | ogni cambio di direzione giustificato da un contatto |
| **AC-026** | il pallone non attraversa giocatori |
| **AC-027** | il pallone non attraversa pali/traversa |
| **AC-028** | punto di impatto coerente |
| **AC-029** | nessun effetto "boomerang" |
| **AC-030** | nessun teletrasporto |

## 7. Animation Acceptance

| ID | Criterio |
|---|---|
| **AC-031** | nessuna animazione che inizia improvvisamente |
| **AC-032** | transizioni fluide |
| **AC-033** | animazioni sincronizzate col pallone |
| **AC-034** | animazioni che rispettano la cronologia dell'azione |
| **AC-035** | gesto tecnico riconoscibile |
| **AC-036** | collisioni naturali |
| **AC-037** | nessuna compenetrazione |
| **AC-038** | nessuna interruzione brusca |
| **AC-039** | post-highlight che conclude naturalmente |
| **AC-040** | il replay non termina prima dell'esito |

## 8. Camera Acceptance

| ID | Criterio |
|---|---|
| **AC-041** | protagonista visibile |
| **AC-042** | pallone seguito correttamente |
| **AC-043** | la camera non perde l'azione |
| **AC-044** | cambi camera fluidi |
| **AC-045** | porta visibile nelle situazioni offensive |
| **AC-046** | nessun movimento brusco |
| **AC-047** | replay con inquadrature coerenti |
| **AC-048** | l'azione è comprensibile osservando **solo** il video |

## 9. Commentary Acceptance

| ID | Criterio |
|---|---|
| **AC-049** | la cronaca descrive la stessa Situation mostrata dal video |
| **AC-050** | cronaca, animazioni e replay completamente sincronizzati |

---

## Definition of Done (AC-001…050)

Soddisfatti quando ogni modifica dimostra **oggettivamente** di rispettare gli standard minimi su compilazione, stabilità, gameplay, fisica del pallone, animazioni, telecamera e sincronizzazione della cronaca. È il **prerequisito** per le verifiche avanzate dei capitoli successivi.

---

## Stato attuale (mappatura onesta sul gate) — target 600–1000 controlli

> Quali AC sono oggi verificabili automaticamente dal quality gate (`tests/visual`) e quali no.

| Gruppo | Copertura attuale |
|---|---|
| **Global (AC-001…010)** | 🟡 AC-004/005 (crash/eccezioni: il gate cattura errori), AC-006/007/008 parziali (gate 9/9 + golden), AC-001/002/003 N/A (no build step) |
| **Gameplay (AC-011…020)** | 🟡 AC-020 no-teleport e AC-018 posizioni iniziali (initial-state/orientation); AC-011/012 a livello di intent; AC-013…017 (reazioni) **non validate** (movimento) |
| **Ball (AC-021…030)** | 🟡 AC-022/028 (fisica arco via `computeArc`), **AC-029 no-boomerang** difeso nel codice; AC-021/023/024/025/026/027/030 **non validati dal vivo** |
| **Animation (AC-031…040)** | 🔴 quasi tutto non validato (il gate è a frame congelati, non valida il movimento); AC-040 post-highlight non coperto |
| **Camera (AC-041…048)** | 🟡 regia per-pattern esiste (CINE-5) ma **non validata** come copertura AC; firma golden include solo flag camera |
| **Commentary (AC-049/050)** | 🔴 sincronia cronaca↔video non validata |

**Conclusione:** la maggior parte degli AC su movimento/animazione/camera/commentary richiede il **layer Event + Timeline** + i validator Semantic/Motion/Narrative (vedi `LIVE_MATCH_QA_SPEC.md` cap. 3.4–3.7) per diventare automaticamente verificabile. Lo stub "600–1000 controlli" si raggiunge espandendo ogni AC in controlli per-Situation (30 validator × ~20-30 check ciascuno).
