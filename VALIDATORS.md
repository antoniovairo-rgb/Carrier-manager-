# VALIDATORS.md

Standard e catalogo dei **validator** della Live Match Development Platform.

> Documento vivo, organizzato per capitoli. Si conforma a `MASTER_PROMPT.md` (charter LMQP) e a `LIVE_MATCH_QA_SPEC.md` (architettura, cap. 3.4 Validator Engine).

---

## Capitolo 1 — Standard Universale dei Validator

### Scopo

Definisce gli standard usati da **tutti** i validator della piattaforma. Ogni Situation del Live Match Engine deve rispettare questa struttura. Obiettivo: uniformità, qualità e coerenza nell'intero framework.

### Filosofia

Ogni validator verifica che l'highlight racconti una **storia calcistica completa**. Non basta che un'animazione venga eseguita: ogni highlight deve avere **inizio · sviluppo · conclusione · post-highlight**, e il giocatore deve comprendere immediatamente quale azione è rappresentata.

### Struttura Standard (sezioni di ogni validator)

1. **Descrizione** — descrizione della Situation.
2. **Obiettivo** — l'intenzione calcistica dell'azione.
3. **Contesto** — quando può / non può verificarsi.
4. **Attori** — giocatori coinvolti (es. protagonista, destinatario, difensore, portiere, arbitro).
5. **Timeline** — sequenza completa degli eventi.
6. **Eventi obbligatori** — devono sempre verificarsi.
7. **Eventi opzionali** — possono verificarsi.
8. **Eventi vietati** — incompatibili con la Situation.
9. **Ball Validator** — controlli sul pallone.
10. **Player Validator** — controlli sui giocatori.
11. **Camera Validator** — controlli sulla regia.
12. **Motion Validator** — controlli sulle animazioni.
13. **Semantic Validator** — corretta rappresentazione dell'azione.
14. **Football Intelligence** — credibilità calcistica.
15. **Post Highlight** — controlli sulla conclusione dell'azione.

### Regole Universali

| # | Regola |
|---|---|
| 1 | Il protagonista deve essere chiaramente identificabile. |
| 2 | La palla deve essere sempre visibile nei momenti chiave. |
| 3 | La telecamera deve raccontare l'azione. |
| 4 | Gli avversari devono reagire. |
| 5 | I compagni devono reagire. |
| 6 | Il portiere deve reagire quando coinvolto. |
| 7 | Ogni azione deve avere una conclusione chiaramente visibile. |
| 8 | Ogni highlight deve mostrare il post-highlight. |
| 9 | Cronaca testuale e highlight devono essere perfettamente sincronizzati. |
| 10 | L'animazione non deve mai contraddire la Situation. |

### Livelli di Validazione

| Livello | Significato |
|---|---|
| **Tecnico** | il motore funziona |
| **Logico** | gli eventi sono coerenti |
| **Visivo** | l'azione è leggibile |
| **Calcistico** | l'azione è credibile |
| **Narrativo** | l'azione racconta una storia completa |

### Sistema di Gravità

`INFO → WARNING → MINOR → MAJOR → CRITICAL → FATAL`

### Score

Ogni validator produce: **Technical · Ball · Player · Camera · Motion · Semantic · Football Intelligence · Narrative · Overall Score**.

### Definition of Done (per Situation)

Una Situation è completata solo quando:

- tutti i validator sono implementati;
- tutti i test passano;
- Motion Score > soglia configurata;
- Football Intelligence Score > soglia configurata;
- Narrative Score > soglia configurata;
- il post-highlight è presente;
- la cronaca è coerente con la rappresentazione visiva.

> Lo Standard Universale è il riferimento **obbligatorio** per tutte le Situation: garantisce che ogni azione sia valutata con gli stessi criteri tecnici, calcistici e narrativi.

---

## Validator 001 — Tentativo di Cross

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-001` |
| **Categoria** | Costruzione offensiva |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation classificata come **"Tentativo di Cross"** sia rappresentata in modo corretto, leggibile e credibile. Non solo l'esecuzione dell'animazione: l'intero highlight deve **raccontare chiaramente un tentativo di cross**.

### Definizione

Qualsiasi azione in cui il giocatore in possesso cerca **intenzionalmente** di inviare il pallone nell'area avversaria con un cross. Il risultato può essere positivo o negativo, ma il **tentativo deve risultare evidente**.

### Situazioni compatibili / non compatibili

- **Compatibili:** cross alto · teso · rasoterra · arretrato · a rientrare · primo palo · secondo palo (stessa struttura narrativa).
- **NON compatibili:** passaggi filtranti · cambi di gioco · tiri · lanci lunghi · rinvii · calci piazzati.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Ricezione** — il protagonista entra in possesso |
| 2 | **Controllo** — controlla il pallone |
| 3 | **Preparazione** — crea spazio (avanza / rallenta / protegge / finta) |
| 4 | **Preparazione tecnica** — orienta il corpo, postura coerente con un cross |
| 5 | **Impatto** — il piede colpisce il pallone, momento chiaramente visibile |
| 6 | **Traiettoria** — percorso coerente e leggibile |
| 7 | **Reazione** — attaccanti attaccano l'area, difensori reagiscono, portiere valuta |
| 8 | **Conclusione** — uno degli outcome previsti |
| 9 | **Post-Highlight** — mostra il risultato finale; **non** interrompere subito dopo il cross |

### Outcome

- **Ammessi** (ognuno rappresentato visivamente): colpo di testa · tiro · deviazione · respinta difensore · presa portiere · uscita del pallone · intercetto · gol · nessun destinatario.
- **Non ammessi:** cross seguito da animazione di passaggio corto · cross senza traiettoria · pallone che cambia direzione senza motivo · destinatario che ignora il pallone · difensori completamente immobili · portiere immobile quando coinvolto.

### Controlli per validator

- **Ball:** traiettoria coerente, velocità plausibile, rotazione coerente, destinazione raggiungibile, no teletrasporti, no effetto boomerang.
- **Player:** il **protagonista** guarda verso l'area / postura coerente / completa il gesto; gli **attaccanti** cercano il cross e attaccano lo spazio; i **difensori** marcano / intercettano / reagiscono; il **portiere** segue il pallone / valuta l'uscita / tenta presa o deviazione.
- **Camera:** segue il protagonista in preparazione e il pallone nel cross, mostra area + destinatario + esito; **il momento dell'impatto non va nascosto**.
- **Motion:** preparazione fluida, transizione naturale, continuità, no movimenti bruschi, no compenetrazioni.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta tentando un cross?"* — se no → **FAIL**.
- **Football Intelligence:** cross da zona plausibile, spazio realmente cercato, attaccanti in area, difensori a protezione, portiere che reagisce → azione credibile.
- **Narrative:** storia completa `Inizio → Preparazione → Cross → Traiettoria → Reazione → Conclusione → Post-Highlight`; la mancanza di una fase fondamentale riduce il Narrative Score.

### Errori critici (FAIL)

Il cross non viene mostrato · il pallone cambia direzione senza causa · il replay termina prima dell'esito · il protagonista esegue un'animazione incompatibile · eventi fuori ordine · la camera non mostra il momento decisivo.

### Suggerimenti automatici

Aumentare la durata del post-highlight · anticipare il cambio camera · migliorare il movimento degli attaccanti · correggere la traiettoria · sincronizzare meglio cronaca e animazione.

### Definition of Done

Tentativo di cross immediatamente riconoscibile; gesto tecnico preparato correttamente; traiettoria coerente; compagni/difensori/portiere reagiscono in modo credibile; risultato finale chiaramente visibile; post-highlight che conclude senza tagli bruschi; cronaca + timeline + animazione sincronizzate.

> Un highlight che termina **subito dopo il calcio del pallone**, senza mostrare le conseguenze, è da considerare **incompleto** anche se tecnicamente corretto.

---

## Stato di implementazione (mappatura sul codice attuale)

> Onestà documentale (charter): cosa dello standard esiste già nel gate vs cosa manca.

| Sezione standard | Stato | Note |
|---|---|---|
| Ball / Player / Camera Validator | 🟡 parziale | presenti in forma **frame-congelato/analitica** (`tests/situations-3d-validation.js`, `checks/*.mjs`): fisica palla (`computeArc`), cap movimenti, regia per-pattern |
| Motion Validator | 🔴 | il gate non valida il movimento dal vivo (cattura frame congelati) |
| **Semantic Validator** | 🔴 | nessuna verifica per-Situation della rappresentazione (richiede Event+Timeline) |
| Football Intelligence | 🟡 implicita | regole nel codice, non un validator dedicato con score |
| Eventi obbligatori/opzionali/vietati | 🔴 | richiede l'Event Registry + emissione eventi dal motore |
| Timeline | 🔴 | nessuna timeline registrata |
| Score (9 dimensioni) | 🟡 | la suite analitica produce 6 score aggregati (animazione/fisica_palla/sincronizzazione/regia/post_hl/realismo) per-combo, non i 9 per-Situation dello standard |
| Sistema di gravità INFO..FATAL | 🟡 | il gate distingue issue (FAIL) vs warn; manca la scala completa MINOR/MAJOR/CRITICAL |

**Prerequisito comune** (come per `LIVE_MATCH_QA_SPEC.md`): Semantic Validator, eventi obbligatori/vietati e Timeline dipendono tutti dal **layer Event + Timeline** osservabile nel motore.

### LMV-001 (Tentativo di Cross) — copertura attuale

Il motore copre già diversi requisiti *a livello di rendering* (non validati dal gate dal vivo): varianti cross decise dal motore (F5/F8), traiettoria = conseguenza della decisione (F5), regia per-pattern del cross (CINE-5: FAR_POST/CUTBACK/NEAR), reazioni difensive deliberative (F10/F11), uscita portiere (F13), post-arco `cross_goal`. **Non ancora validati automaticamente:** timeline a 9 fasi, eventi obbligatori/vietati, Semantic ("è riconoscibile come cross?"), Narrative (storia completa), presenza del post-highlight, sincronia cronaca↔animazione. → richiede il layer Event+Timeline + un Semantic Validator per-Situation.
