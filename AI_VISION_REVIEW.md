# AI_VISION_REVIEW.md

**Live Match Development Platform — AI Vision Review Specification**

Version 1.0

> Si conforma a `MASTER_PROMPT.md` (charter LMQP). Dettaglio architetturale del modulo: `LIVE_MATCH_QA_SPEC.md` cap. 3.9 (AI Vision Review Engine). Documento vivo (DoD attuale: cap. 1–10).

---

## 1. Scopo del documento

Definisce il comportamento del sistema **AI Vision** che revisiona automaticamente gli highlight del Live Match Engine. L'AI Vision **non genera** highlight: osserva, interpreta, valuta e assegna un **giudizio qualitativo** all'intera sequenza video. Simula un **QA Tester umano esperto di calcio**.

**Ambito:** Highlight · Replay · Animazioni · Movimenti dei giocatori · Pallone · Telecamera · Cronaca · Sincronizzazione · Football Intelligence · Post Highlight.

**Obiettivi:** comprendere l'azione · individuare anomalie · riconoscere errori calcistici · individuare errori grafici · rilevare incoerenze narrative · produrre un report automatico.

**Principio fondamentale:** non confronta pixel — **comprende** ciò che accade, come un osservatore umano.

---

## 2. Review Philosophy

Cinque prospettive di valutazione per ogni highlight:

| Prospettiva | Domanda |
|---|---|
| **Comprensione** | "Cosa sta cercando di fare il protagonista?" |
| **Credibilità** | "Potrebbe realmente verificarsi in partita?" |
| **Coerenza** | "Tutti gli elementi raccontano la stessa azione?" |
| **Qualità** | "È piacevole da osservare?" |
| **Completezza** | "L'azione è mostrata dall'inizio alla fine?" |

---

## 3. Review Workflow

```
Caricamento → Analisi video → Riconoscimento Situation → Football Intelligence →
Animazioni → Pallone → Camera → Replay → Cronaca → Calcolo Score → Report
```

---

## 4. Situation Recognition

Primo compito: identificare automaticamente la Situation (es. Assist · Cross · Dribbling · Progressione · Tiro · Inserimento · Attacco della Profondità · Ricezione · Controllo Orientato · Seconda Palla). L'AI assegna un **livello di confidenza**; sotto soglia → highlight marcato **ambiguo**.

> Collegamento: corrisponde, dal lato percettivo, al **Semantic Validator** (`VALIDATORS.md`) — confronto tra Situation riconosciuta dal video e Situation prevista.

---

## 5. Football Understanding

Dopo l'identificazione, l'AI comprende il **comportamento calcistico**:

- il protagonista ha uno scopo?
- la scelta è plausibile?
- compagni / difensori reagiscono?
- il portiere interpreta correttamente l'azione?
- l'esito è coerente?

---

## 6. Visual Inspection

Analisi di: animazioni · postura · orientamento del corpo · equilibrio · velocità · cambi di direzione · collisioni · sincronizzazione. Obiettivo: individuare **movimenti artificiali**.

---

## 7. Ball Inspection

Il pallone è l'elemento principale. Verifica: traiettoria · velocità · rotazione · collisioni · rimbalzi · deviazioni · punto di impatto. **Ogni cambio di traiettoria deve essere giustificato.**

---

## 8. Camera Inspection

La camera deve **raccontare** l'azione. Verifica: inquadratura · leggibilità · fluidità · inseguimento del pallone · cambi camera · qualità cinematografica.

---

## 9. Replay Inspection

Il replay è una **sequenza completa**. Verifica: inizio corretto · sviluppo completo · esito · post-highlight · durata. **Replay interrotti prematuramente = FAIL.**

---

## 10. Commentary Inspection

La cronaca deve descrivere **esattamente** ciò che viene mostrato. L'AI confronta `cronaca → Situation → animazioni → esito`; qualsiasi incoerenza → **penalizzazione**.

---

## Definition of Done (cap. 1–10)

Soddisfatti quando l'AI Vision osserva un highlight, ne identifica automaticamente la Situation, ne comprende lo sviluppo, verifica la coerenza tra tutti gli elementi della scena e produce una prima valutazione oggettiva della qualità complessiva.

---

## 11. Error Classification

L'AI Vision classifica automaticamente ogni anomalia: non solo individuarla, ma comprenderne **gravità e impatto**.

**Categorie** (un errore può appartenere a più): Football Intelligence · Gameplay · Animazione · Camera · Replay · Pallone · Cronaca · Sincronizzazione · Rendering · Physics · Performance · UI · Audio.

**Severity:**

| Livello | Significato / esempi |
|---|---|
| **Critical** | highlight non approvabile: teleport · replay incompleto · cronaca completamente errata · pallone invisibile · crash |
| **High** | azione comprensibile ma qualità gravemente compromessa: portiere immobile · animazione errata · giocatore senza reazione · collisione evidente |
| **Medium** | errore visibile ma non determinante: camera in ritardo · movimento poco naturale · traiettoria migliorabile |
| **Low** | errore marginale, non compromette la qualità generale |
| **Info** | osservazione / suggerimento / possibile miglioramento |

**Priority ≠ Severity:** un errore raro ma critico può avere priorità inferiore a un errore medio presente in migliaia di highlight. L'AI calcola **entrambe**.

---

## 12. Confidence Model

Ogni valutazione è accompagnata da un **Confidence Score** (0–100):

| Range | Interpretazione |
|---|---|
| **95–100** | quasi certezza |
| **85–94** | molto probabile |
| **70–84** | probabile |
| **50–69** | bassa affidabilità → revisione automatica aggiuntiva |
| **< 50** | informazioni insufficienti → risultato "**Uncertain**" |

**Sorgenti:** qualità del video · visibilità pallone · visibilità protagonista · durata highlight · coerenza della Situation · numero di elementi osservabili.

**Multi-Pass Review** (quando la confidence è insufficiente): `Pass 1 globale → Pass 2 Football → Pass 3 Ball Tracking → Pass 4 Camera → Pass 5 confronto finale`.

---

## 13. Quality Score

Punteggio complessivo (0–100) dalla combinazione pesata:

| Componente | Peso |
|---|---|
| Football Intelligence | 20% |
| Animazioni | 15% |
| Pallone | 15% |
| Replay | 10% |
| Telecamera | 10% |
| Cronaca | 10% |
| Fluidità | 10% |
| Fisica | 5% |
| NPC Behaviour | 5% |
| Qualità Visiva | 10% |

**Quality Rating:** 95–100 **Elite** · 90–94 **Excellent** · 80–89 **Good** · 70–79 **Acceptable** · 60–69 **Needs Improvement** · < 60 **Rejected**.

---

## 14. Root Cause Detection

Non solo segnalare l'errore: cercarne la **causa principale**. Per ogni errore l'AI tenta di rispondere: *perché è accaduto? quale componente è coinvolto? quale validator avrebbe dovuto intercettarlo? esistono anomalie correlate? quale modifica potrebbe risolverlo?*

**Dependency Analysis** — ogni errore collegato ai componenti coinvolti (es. `Replay → Camera → Animation → Situation → Football Intelligence`) per evitare correzioni del solo sintomo.

---

## 15. Automatic Suggestions

Per ogni errore, suggerimenti tecnici **concreti, verificabili, implementabili, specifici**.

> *Esempio* — Errore: "il replay termina prima della conclusione". Suggerimento: "prolungare automaticamente la durata del replay fino al completamento del post-highlight".

Suggerimenti **ordinati** per: impatto · rischio · frequenza · costo stimato.

---

## 16. Cross Validation

Ogni highlight confrontato con più fonti: `Validator × AI Vision × Replay × Cronaca × Log → Decisione Finale`. Una singola fonte non basta.

**Conflict Resolution** — se due sistemi divergono, l'AI: identifica il conflitto · ne descrive il motivo · propone la revisione più affidabile.

---

## Definition of Done (cap. 11–16)

Soddisfatti quando l'AI Vision classifica automaticamente gli errori, ne stima severità e priorità, calcola l'affidabilità delle proprie analisi, assegna un Quality Score, individua la causa principale e propone suggerimenti concreti, integrando validator/replay/cronaca/log in un'unica valutazione coerente.

---

## 17. Build Comparison

Confronto automatico di ogni nuova build con quella di riferimento: non solo errori assoluti, ma **miglioramento vs regressione**.

**Workflow:** `Build N-1 → acquisizione highlight → Build N → acquisizione highlight → analisi comparativa → differenze → Quality Delta → decisione`.

**Scope:** Football Intelligence · Situation Recognition · Animazioni · Pallone · Camera · Replay · Cronaca · Sincronizzazione · Fluidità · Performance visiva.

**Delta Analysis** — per ogni componente: miglioramento / peggioramento / nessuna variazione (espresso **numericamente e testualmente**). Ogni peggioramento significativo → **regressione**, associata ai validator coinvolti.

---

## 18. Trend Analysis

L'AI monitora l'evoluzione qualitativa nel tempo; ogni build alimenta lo storico.

**Historical Metrics:** Quality Score · n. FAIL/WARNING/PASS · severità media · tempo medio di revisione · tempo medio validator · copertura test.

**Trend Indicators:** miglioramenti continui · peggioramenti continui · instabilità · regressioni ricorrenti · componenti più problematici. Il Dashboard mostra l'andamento qualitativo attraverso le build.

---

## 19. Human Review Workflow

L'AI Vision è il **primo livello**; la revisione umana è il livello **finale**.

**Escalation** (intervento umano richiesto quando): Confidence sotto soglia · errori critici non classificabili · risultati contrastanti validator↔AI · nuove Situation non riconosciute · anomalie mai osservate.

**Human Feedback** (registrato): valutazione finale · motivazione · correzioni · conferma/modifica della classificazione AI.

**Review Traceability** — ogni revisione ricostruibile: versione analizzata · dataset · validator eseguiti · report AI · decisione finale.

---

## 20. Dashboard & Reporting

Ogni revisione genera un report strutturato su tre livelli:

- **Report Summary:** id build · data/ora · Situation · validator eseguiti · Quality Score · Confidence Score · PASS/WARNING/FAIL · regressioni.
- **Technical Report:** componenti coinvolti · root cause · suggerimenti automatici · severity · priorità · tempo totale di revisione.
- **Executive Report** (per il Product Owner): qualità complessiva · principali criticità · stato della build · raccomandazione finale.

---

## 21. Continuous Learning

L'AI Vision migliora nel tempo. La **Knowledge Base** conserva: errori ricorrenti · pattern riconosciuti · correzioni applicate · falsi positivi · falsi negativi.

**Continuous Improvement:** aumentare la precisione, ridurre falsi positivi/negativi, migliorare classificazione e raccomandazioni.

**Learning Constraints** — l'apprendimento **non** modifica autonomamente: validator · Acceptance Criteria · Development Rules · logica del QA Engine. L'AI apprende **solo** come migliorare la propria capacità di revisione.

---

## 22. Final Review Decision

Stato finale della build (uno solo):

| Stato | Significato |
|---|---|
| **PASS** | qualità soddisfa tutti i criteri → può proseguire verso il rilascio |
| **PASS WITH WARNING** | anomalie minori → prosegue previa valutazione del team |
| **FAIL** | problemi che impediscono il rilascio → correggere e rivalutare |
| **BLOCKED** | informazioni insufficienti → revisione manuale |

**Final Recommendation:** Ready for Release · Ready for QA · Requires Improvements · Major Rework Required · Manual Review Required.

---

## 23. Definition of Done (globale)

L'AI Vision Review è completo quando sa: comprendere la Situation · analizzare il comportamento calcistico · verificare animazioni/pallone/camera/replay/cronaca · individuare anomalie tecniche e calcistiche · classificare errori/severità/priorità · identificare la causa principale · proporre suggerimenti concreti · confrontare build · monitorare l'evoluzione qualitativa · produrre report per sviluppatori e Product Owner · supportare la revisione umana **senza sostituirla** · contribuire al miglioramento continuo.

> L'AI Vision è il **revisore automatico ufficiale** della piattaforma — un elemento fondamentale del QA del Live Match Engine, ma sempre **secondo livello** (non blocca da solo la CI; charter + cap. 3.9).

---

## Stato attuale (mappatura onesta sul repo)

🟢 **Framework implementato (provider-based, Open/Closed).** Oggi:
- **Architettura** in `tests/visual/lib/vision/`: `VisionProvider` (interfaccia) → `VisionReviewEngine` (Core, parla SOLO con l'interfaccia) → `ProviderRegistry` → provider concreti. Aggiungere un provider = nuova classe + registrazione, **zero modifiche al Core**.
- **Provider:** `OllamaVisionProvider` (1°, locale e **cloud** via `OLLAMA_API_KEY` Bearer), `AnthropicVisionProvider`, + `OpenAI`/`Gemini` predisposti (registrati, `analyze()` da implementare).
- **Pipeline** (runner `ai-vision-review.mjs`): cattura Playwright **multi-fase** (inizio·preparazione·evento·esito·post) → engine (cache+dedup+incrementale, timeout, retry/backoff, fallback, Failure Package) → scoring (Quality 0-100 + Confidence + Severity + Priority + verdict) → **report HTML** + `ai-vision.json`.
- **Config 100% via `.env`** (nessun hardcode nel Core): `VISION_PROVIDER`, `OLLAMA_*`, `ANTHROPIC_*`, timeout/retry/cache/log. **Non blocca MAI la CI** (secondo livello): provider giù → skip pulito.
- **Test** (`npm run test:vision`, 28 test): registry, config, scoring, cache, **engine via mock provider** (successo/cache/retry/BLOCKED/skip), provider offline. Il gate riusa lo stesso engine via `lib/ai-vision.mjs` (adattatore, niente logica duplicata).
- Mancano ancora: cattura **video/sequenza** continua (oggi frame multipli), Situation Recognition come ponte formale al Semantic, confronto tra build, scoring storico, implementazione `analyze()` per OpenAI/Gemini.
- La **Situation Recognition** (cap. 4) è il ponte naturale verso il **Semantic Validator**: entrambi richiedono che l'highlight sia osservabile come sequenza → prerequisito **layer Event + Timeline** + cattura video (oggi il gate è a frame congelati).

> L'AI Vision è esplicitamente un **secondo livello** (non blocca la CI): utile per la qualità percepita, non per il PASS/FAIL tecnico (charter + cap. 3.9).
