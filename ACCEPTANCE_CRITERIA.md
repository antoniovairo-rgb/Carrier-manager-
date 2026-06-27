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

## 10. Replay Acceptance

Il Replay Engine è la prova visiva ufficiale: ogni replay racconta l'**intera evoluzione** dell'highlight.

| ID | Criterio |
|---|---|
| **AC-051** | il replay inizia **prima** dell'evento principale |
| **AC-052** | l'intera Situation è visibile |
| **AC-053** | l'evento principale non è tagliato |
| **AC-054** | l'esito finale è mostrato integralmente |
| **AC-055** | il replay non si interrompe subito dopo l'evento principale |
| **AC-056** | post-highlight naturale |
| **AC-057** | le reazioni dei giocatori sono mostrate |
| **AC-058** | la camera mantiene leggibile l'azione |
| **AC-059** | nessun elemento estraneo nel replay |
| **AC-060** | replay coerente con la cronaca |

## 11. Football Intelligence Acceptance

| ID | Criterio |
|---|---|
| **AC-061** | il protagonista sceglie una soluzione plausibile |
| **AC-062** | la Situation è immediatamente riconoscibile |
| **AC-063** | i compagni creano linee di passaggio |
| **AC-064** | i difensori reagiscono |
| **AC-065** | il portiere interpreta la situazione |
| **AC-066** | marcature credibili |
| **AC-067** | smarcamenti con uno scopo |
| **AC-068** | corse con logica calcistica |
| **AC-069** | decisioni coerenti col contesto della partita |
| **AC-070** | nessun comportamento palesemente irrealistico |

## 12. Highlight Acceptance

Ogni highlight comprensibile anche **senza cronaca**.

| ID | Criterio |
|---|---|
| **AC-071** | inizio dell'azione chiaro |
| **AC-072** | obiettivo del protagonista riconoscibile |
| **AC-073** | sviluppo continuo |
| **AC-074** | esito comprensibile |
| **AC-075** | conclusione naturale |
| **AC-076** | nessun salto temporale |
| **AC-077** | nessun cambio improvviso di ritmo |
| **AC-078** | transizioni fluide |
| **AC-079** | durata adeguata alla Situation |
| **AC-080** | highlight cinematografico |

## 13. NPC Acceptance

Gli NPC non sono comparse.

| ID | Criterio |
|---|---|
| **AC-081** | ogni NPC osserva il pallone |
| **AC-082** | ogni NPC reagisce agli eventi |
| **AC-083** | i difensori tentano di limitare l'azione |
| **AC-084** | i compagni offrono supporto |
| **AC-085** | il portiere comunica con la difesa |
| **AC-086** | l'arbitro mantiene una posizione credibile |
| **AC-087** | le panchine non sono statiche |
| **AC-088** | il pubblico reagisce agli eventi principali |
| **AC-089** | gli NPC non coinvolti mantengono una logica di posizionamento |
| **AC-090** | nessun NPC completamente passivo |

## 14. Physics Acceptance

| ID | Criterio |
|---|---|
| **AC-091** | collisioni coerenti |
| **AC-092** | velocità del pallone realistica |
| **AC-093** | deviazioni coerenti |
| **AC-094** | impatti con reazioni plausibili |
| **AC-095** | inerzia rispettata |
| **AC-096** | rimbalzi credibili |
| **AC-097** | traiettorie che rispettano la fisica |
| **AC-098** | nessuna compenetrazione |
| **AC-099** | collisioni multiple stabili |
| **AC-100** | fisica coerente per tutta la durata dell'highlight |

## 15. Visual Quality Acceptance

| ID | Criterio |
|---|---|
| **AC-101** | animazioni fluide |
| **AC-102** | ombre coerenti |
| **AC-103** | illuminazione uniforme |
| **AC-104** | texture che non degradano improvvisamente |
| **AC-105** | terreno stabile |
| **AC-106** | la rete reagisce correttamente ai gol |
| **AC-107** | effetti particellari che non coprono l'azione |
| **AC-108** | profondità visiva naturale |
| **AC-109** | HUD che non copre elementi importanti |
| **AC-110** | livello qualitativo coerente in tutta la scena |

### Definition of Done (AC-051…110)

Soddisfatti quando replay, football intelligence, highlight, NPC, fisica e qualità grafica rispettano gli standard LMQP e risultano coerenti, leggibili, credibili e completamente sincronizzati.

---

## 16. Performance Acceptance

Le prestazioni sono un **requisito funzionale**: migliorare il gameplay non può peggiorare significativamente le performance.

| ID | Criterio |
|---|---|
| **AC-111** | FPS medio non inferiore alla build precedente |
| **AC-112** | nessun calo improvviso di FPS durante gli highlight |
| **AC-113** | tempo di caricamento highlight entro la soglia definita |
| **AC-114** | tempo di generazione Situation stabile |
| **AC-115** | tempo di avvio replay costante |
| **AC-116** | utilizzo medio CPU entro i limiti |
| **AC-117** | RAM che non cresce progressivamente in sessioni prolungate |
| **AC-118** | nessun memory leak |
| **AC-119** | highlight multipli che non degradano progressivamente il sistema |
| **AC-120** | la chiusura del Live Match libera completamente le risorse |

## 17. Stability Acceptance

La stabilità ha **priorità** sulle nuove funzionalità.

| ID | Criterio |
|---|---|
| **AC-121** | il Live Match Engine non va in crash |
| **AC-122** | il Replay Engine non si interrompe |
| **AC-123** | la camera non perde il target |
| **AC-124** | le animazioni non si bloccano |
| **AC-125** | il pallone non entra in stati inconsistenti |
| **AC-126** | la cronaca non si interrompe |
| **AC-127** | l'HUD non scompare |
| **AC-128** | nessun loop infinito |
| **AC-129** | le eccezioni sono gestite |
| **AC-130** | almeno **1.000 highlight consecutivi** senza crash |

## 18. Save Compatibility Acceptance

Ogni modifica preserva la compatibilità dei salvataggi.

| ID | Criterio |
|---|---|
| **AC-131** | le carriere esistenti si caricano |
| **AC-132** | statistiche integre |
| **AC-133** | dati del giocatore preservati |
| **AC-134** | composizione squadre mantenuta |
| **AC-135** | stato competizioni mantenuto |
| **AC-136** | stagione coerente |
| **AC-137** | trasferimenti preservati |
| **AC-138** | classifiche non corrotte |
| **AC-139** | nessuna perdita di informazioni nel database |
| **AC-140** | nessun reset della carriera richiesto |

## 19. User Interface Acceptance

| ID | Criterio |
|---|---|
| **AC-141** | l'HUD non copre il pallone |
| **AC-142** | l'HUD non copre il protagonista |
| **AC-143** | i pannelli si aggiornano correttamente |
| **AC-144** | timer sincronizzato |
| **AC-145** | punteggio corretto |
| **AC-146** | nomi dei giocatori coerenti |
| **AC-147** | statistiche aggiornate correttamente |
| **AC-148** | notifiche nei momenti opportuni |
| **AC-149** | transizioni UI fluide |
| **AC-150** | l'interfaccia non compromette la leggibilità dell'highlight |

## 20. Audio Acceptance

| ID | Criterio |
|---|---|
| **AC-151** | effetti sonori sincronizzati |
| **AC-152** | il contatto col pallone produce il suono corretto |
| **AC-153** | la folla reagisce agli eventi |
| **AC-154** | volume bilanciato |
| **AC-155** | la telecronaca non si sovrappone agli effetti principali |
| **AC-156** | nessun effetto audio ripetuto |
| **AC-157** | suoni ambientali continui |
| **AC-158** | le variazioni atmosferiche modificano l'ambiente sonoro |
| **AC-159** | l'audio non si interrompe |
| **AC-160** | highlight coerente anche dal punto di vista sonoro |

### Definition of Done (AC-111…160)

Soddisfatti quando il Live Match Engine mantiene elevate prestazioni, completa stabilità operativa, piena compatibilità coi salvataggi, un'interfaccia leggibile e un comparto audio sincronizzato e coerente con l'azione.

---

## 21. AI Vision Acceptance

Secondo livello di validazione: individuare anomalie difficili da cogliere coi test tradizionali.

| ID | Criterio |
|---|---|
| **AC-161** | l'AI Vision riconosce correttamente la Situation |
| **AC-162** | conferma la coerenza cronaca↔highlight |
| **AC-163** | verifica la sincronizzazione del pallone |
| **AC-164** | individua eventuali teleport dei giocatori |
| **AC-165** | rileva animazioni interrotte |
| **AC-166** | verifica la qualità delle transizioni |
| **AC-167** | valuta la leggibilità dell'highlight |
| **AC-168** | conferma che il protagonista sia sempre identificabile |
| **AC-169** | verifica che il replay racconti un'azione completa |
| **AC-170** | produce un punteggio complessivo di qualità |

## 22. Regression Acceptance

Ogni modifica confrontata con la build precedente.

| ID | Criterio |
|---|---|
| **AC-171** | nessuna funzionalità esistente degrada |
| **AC-172** | nessun validator PASS diventa FAIL |
| **AC-173** | il numero totale di errori non aumenta |
| **AC-174** | la qualità visiva non diminuisce |
| **AC-175** | le prestazioni non peggiorano |
| **AC-176** | la Football Intelligence non perde coerenza |
| **AC-177** | la sincronizzazione non degrada |
| **AC-178** | il Replay Engine mantiene il livello qualitativo |
| **AC-179** | la copertura dei test non diminuisce |
| **AC-180** | ogni regressione è **bloccante** fino alla risoluzione |

## 23. Continuous Integration Acceptance

| ID | Criterio |
|---|---|
| **AC-181** | la pipeline CI si completa con esito positivo |
| **AC-182** | tutti gli Unit Test PASS |
| **AC-183** | tutti gli Integration Test PASS |
| **AC-184** | tutti i Validator PASS |
| **AC-185** | tutti i test Playwright PASS |
| **AC-186** | build riproducibile |
| **AC-187** | report finale generato automaticamente |
| **AC-188** | log, screenshot e video archiviati |
| **AC-189** | Failure Package allegati automaticamente |
| **AC-190** | pipeline che termina senza interventi manuali |

## 24. Release Acceptance

Una build è candidabile al rilascio **solo** se soddisfa contemporaneamente tutti i criteri precedenti.

| ID | Criterio |
|---|---|
| **AC-191** | tutti i validator PASS |
| **AC-192** | nessuna regressione aperta di severità critica |
| **AC-193** | Quality Score complessivo sopra la soglia minima |
| **AC-194** | tutti gli highlight di riferimento coerenti |
| **AC-195** | stabilità confermata dagli stress test |
| **AC-196** | documentazione aggiornata |
| **AC-197** | codice conforme alle Development Rules |
| **AC-198** | pacchetto di rilascio completo |
| **AC-199** | il Product Owner verifica facilmente il risultato via Report Finale + evidenze |
| **AC-200** | build contrassegnabile **Release Candidate** solo dopo il superamento di tutti gli AC applicabili |

## 25. Final Acceptance Checklist

Prima di dichiarare completata un'attività, verifica automatica:

✓ compila senza errori · ✓ Unit/Integration/Validator/Playwright PASS · ✓ highlight coerenti · ✓ Replay Engine OK · ✓ Football Intelligence coerente · ✓ nessun teleport · ✓ nessuna animazione interrotta · ✓ nessuna regressione · ✓ nessun crash · ✓ nessun memory leak · ✓ nessun processo residuo · ✓ nessun browser aperto · ✓ nessuna PowerShell/Bash del framework ancora attiva · ✓ tutte le risorse liberate · ✓ Report Finale generato · ✓ Failure Package su errore · ✓ documentazione aggiornata · ✓ build pronta per il rilascio.

### Definition of Done (globale, AC-001…200)

Una modifica è completata **esclusivamente** quando soddisfa **integralmente tutti** gli Acceptance Criteria applicabili, supera ogni fase della pipeline di validazione, non introduce regressioni, mantiene o migliora il livello qualitativo e produce tutte le evidenze necessarie. Il superamento degli AC è **l'unica condizione** per promuovere una build a **Release Candidate** e poi al rilascio.

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
| **Replay (AC-051…060)** | 🔴 nessun Replay Engine (cap. 3.5); AC-055 "non finire subito dopo l'evento" è il principio già seguito nei post-arco ma non validato |
| **Football Intelligence (AC-061…070)** | 🟡 decisioni dal motore (`decideExecution`) + AI off-ball (F2/F3/F10/F11/F13); reazioni/marcature/smarcamenti **non validati dal vivo** |
| **Highlight (AC-071…080)** | 🟡 intent/intro leggibili; continuità/ritmo/cinematografia **non validati** (richiede Timeline + Cinematic Validator) |
| **NPC (AC-081…090)** | 🟡 AI off-ball "no zombie" (F2/F3) + pubblico/bandiere reattivi; arbitro/panchine/comunicazione GK **non validati**; AC-090 "no NPC passivi" è obiettivo F3 ma non verificato |
| **Physics (AC-091…100)** | 🟡 fisica arco/parabola + no-boomerang nel codice; collisioni/inerzia/rimbalzi **non validati** |
| **Visual Quality (AC-101…110)** | 🟡 stadio/ombre/LED/rete/meteo presenti; nessuna validazione automatica di qualità grafica (→ AI Vision, cap. 3.9) |
| **Performance (AC-111…120)** | 🔴 nessuna misura FPS/CPU/RAM/leak nel gate (→ Performance Monitor, cap. 3.11); AC-130 stress test 1.000 HL non implementato |
| **Stability (AC-121…130)** | 🟡 il gate carica il gioco e forza 179 situations senza crash (copertura parziale di AC-121/129); loop/stati-inconsistenti non testati a lungo |
| **Save Compatibility (AC-131…140)** | 🟢🟡 SAVE_VERSION + migration backward-compat (ultimo: v7/foot) è il meccanismo per AC-131…140, ma **non c'è un test automatico** che carichi save storici nel gate |
| **UI (AC-141…150)** | 🔴 la UI del match non è validata dal gate (HUD/timer/punteggio); fuori dallo scope screenshot-canvas |
| **Audio (AC-151…160)** | 🔴 **il gioco non ha un comparto audio** allo stato attuale → questi AC sono aspirazionali (audio da implementare prima di poter essere validato) |
| **AI Vision (AC-161…170)** | 🔴 modulo AI Vision non implementato (cap. 3.9); screenshot già disponibili come input |
| **Regression (AC-171…180)** | 🟡 solo golden regression (firma stato); AC-172 "nessun validator PASS→FAIL" è il principio del gate, ma manca il confronto baseline ricco (cap. 3.6) |
| **CI (AC-181…190)** | 🟡 deploy Pages via GitHub Actions esiste; manca una pipeline CI che esegua il gate + archivi evidenze/Failure Package automaticamente |
| **Release (AC-191…200)** | 🔴 nessun processo Release Candidate formale (Quality Score, soglie, pacchetto di rilascio) |

**Conclusione:** la maggior parte degli AC su movimento/animazione/camera/commentary richiede il **layer Event + Timeline** + i validator Semantic/Motion/Narrative (vedi `LIVE_MATCH_QA_SPEC.md` cap. 3.4–3.7) per diventare automaticamente verificabile. Lo stub "600–1000 controlli" si raggiunge espandendo ogni AC in controlli per-Situation (30 validator × ~20-30 check ciascuno).
