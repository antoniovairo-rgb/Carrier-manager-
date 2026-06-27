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

## Stato attuale (mappatura onesta sul repo)

🔴 **Modulo non implementato.** Oggi:
- Il quality gate cattura **screenshot del canvas** (`tests/visual/out/`) → l'**input** per l'AI Vision è già disponibile, ma non c'è alcuna pipeline di analisi.
- Manca l'interfaccia **Vision Provider** (provider-agnostic, cap. 3.9 + 3.12) e ogni scoring percettivo (Readability/Cinematic/Motion/Football-IQ).
- La **Situation Recognition** (cap. 4) è il ponte naturale verso il **Semantic Validator**: entrambi richiedono che l'highlight sia osservabile come sequenza → prerequisito **layer Event + Timeline** + cattura video (oggi il gate è a frame congelati).

> L'AI Vision è esplicitamente un **secondo livello** (non blocca la CI): utile per la qualità percepita, non per il PASS/FAIL tecnico (charter + cap. 3.9).
