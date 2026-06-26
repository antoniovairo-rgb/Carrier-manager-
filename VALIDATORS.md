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

## Validator 002 — Tentativo di Dribbling

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-002` |
| **Categoria** | Costruzione offensiva |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Dribbling"** sia rappresentata in modo credibile, leggibile e coerente con l'intenzione del protagonista. Non conta il **successo** del dribbling: conta che il giocatore tenti realmente di superare uno o più avversari **mantenendo il controllo del pallone**. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore in possesso cerca **intenzionalmente** di superare un avversario tramite abilità tecnica, cambi di direzione, finte o protezione del pallone.

### Situazioni compatibili / non compatibili

- **Compatibili:** cambio di direzione · finta di corpo · doppio passo · tunnel · sombrero · sterzata · protezione del pallone · dribbling in velocità.
- **NON compatibili:** passaggi · cross · tiri · contrasti · lanci lunghi · semplici conduzioni **senza opposizione**.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — il protagonista controlla il pallone |
| 2 | **Confronto** — almeno un difensore in pressione, presenza evidente |
| 3 | **Preparazione** — rallenta/accelera/cambia direzione, intenzione leggibile |
| 4 | **Gesto tecnico** — esegue il dribbling, finta chiaramente visibile |
| 5 | **Reazione** — il difensore tenta intercetto/contrasto/recupero (mai passivo) |
| 6 | **Esito** — uno degli outcome previsti |
| 7 | **Post-Highlight** — conseguenze immediate dell'azione |

### Outcome

- **Ammessi** (rappresentati visivamente): dribbling riuscito · perdita del possesso · fallo subito · contrasto vinto dal difensore · recupero difensivo · prosecuzione dell'azione · passaggio/tiro/cross successivo.
- **Non ammessi:** difensore completamente immobile · protagonista che attraversa il difensore · cambio di possesso senza contatto · pallone che si separa senza motivo · animazioni incompatibili col gesto.

### Controlli per validator

- **Ball:** pallone sotto controllo durante il gesto, distanza giocatore-palla plausibile, no teletrasporti, no rimbalzi innaturali, traiettoria coerente col movimento.
- **Player:** il **protagonista** protegge la palla / orienta il corpo verso l'avversario / cambia realmente direzione o ritmo / completa il gesto; l'**avversario** legge il movimento / tenta il recupero / reagisce credibilmente; gli **altri** si smarcano / coprono spazi / seguono l'azione.
- **Camera:** protagonista e difensore visibili, momento del dribbling evidenziato, eventuale superamento seguito, esito mostrato.
- **Motion:** gesto fluido, continuità, cambi di direzione naturali, no movimenti bruschi, no compenetrazioni.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta tentando di superare un avversario?"* — se no → **FAIL**.
- **Football Intelligence:** dribbling in situazione plausibile, difensore che reagisce correttamente, momento credibile, compagni che offrono linee, prosecuzione coerente con l'esito.
- **Narrative:** `Possesso → Confronto → Tentativo → Reazione → Esito → Post-Highlight`; l'azione non si interrompe subito dopo il gesto tecnico.

### Errori critici (FAIL)

Il difensore non reagisce · il protagonista attraversa l'avversario · pallone innaturale · la camera perde il momento decisivo · il replay termina prima dell'esito · la cronaca dice "dribbling" ma il video mostra altro.

### Suggerimenti automatici

Aumentare la reazione del difensore · migliorare la sincronia gesto↔pallone · prolungare il post-highlight · rendere più evidente il cambio di direzione · sincronizzare cronaca e animazione.

### Definition of Done

Tentativo di superare l'avversario immediatamente riconoscibile; gesto tecnico leggibile e coerente; difensore che reagisce credibilmente; pallone sotto controllo durante il dribbling; esito chiaramente mostrato; post-highlight che conclude la sequenza; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight in cui il giocatore esegue un movimento casuale **senza una reale sfida con l'avversario** non va classificato come "Tentativo di Dribbling", anche se l'animazione è tecnicamente corretta.

---

## Validator 003 — Tentativo di Passaggio

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-003` |
| **Categoria** | Costruzione del gioco |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Passaggio"** sia rappresentata in modo credibile, leggibile e coerente. Non conta che il passaggio **riesca**: conta che il protagonista tenti realmente di **servire un compagno**. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore in possesso cerca **intenzionalmente** di trasferire il pallone a un compagno. Comprende tutte le tipologie di passaggio.

### Situazioni compatibili / non compatibili

- **Compatibili:** passaggio corto · lungo · rasoterra · alto · filtrante · cambio gioco · appoggio · scarico · triangolazione · assist.
- **NON compatibili:** cross · tiro · rinvio · rilancio del portiere · rimessa laterale · calcio d'angolo · punizione.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — il protagonista controlla il pallone |
| 2 | **Lettura del gioco** — osserva i compagni; intenzione di passare evidente |
| 3 | **Preparazione** — corpo orientato verso la direzione; destinatario identificabile |
| 4 | **Impatto** — colpisce il pallone; gesto coerente col tipo di passaggio |
| 5 | **Traiettoria** — percorso plausibile |
| 6 | **Reazione** — destinatario attacca la palla; difensori intercettano/marcano |
| 7 | **Esito** — uno degli outcome previsti |
| 8 | **Post-Highlight** — conseguenza del passaggio chiaramente mostrata |

### Outcome

- **Ammessi:** passaggio riuscito · intercetto · pallone fuori · deviazione · assist · errore tecnico · recupero avversario · prosecuzione dell'azione.
- **Non ammessi:** pallone che cambia direzione senza contatto · effetto **boomerang** · pallone che torna automaticamente al protagonista · destinatario che ignora il passaggio · passaggio che termina senza mostrare ricevente o intercetto · replay che termina subito dopo il calcio.

### Controlli per validator

- **Ball:** traiettoria coerente, velocità compatibile, rotazione plausibile, destinazione coerente, no teletrasporti, **no inversioni improvvise della traiettoria**.
- **Player:** il **protagonista** orienta il corpo / guarda il destinatario / completa il gesto; il **destinatario** riconosce il passaggio / si muove verso la palla / prepara il controllo; gli **avversari** intercettano / chiudono le linee / reagiscono.
- **Camera:** mostra protagonista + destinatario, segue la traiettoria, mostra l'esito; il destinatario **non** esce dall'inquadratura nel momento decisivo.
- **Motion:** continuità, sincronia gesto↔pallone, corsa naturale del destinatario, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta cercando di servire un compagno?"* — se no → **FAIL**.
- **Football Intelligence:** passaggio verso un compagno realmente disponibile, scelta del destinatario plausibile, destinatario che si smarca, avversari che chiudono gli spazi, ritmo coerente. Penalizza passaggi privi di logica tattica.
- **Narrative:** `Possesso → Lettura → Preparazione → Passaggio → Traiettoria → Ricezione/Intercetto → Post-Highlight`; azione completa e comprensibile.

### Errori critici (FAIL)

Destinatario non identificabile · pallone che cambia direzione senza motivo · effetto **boomerang** · replay che termina prima dell'esito · camera che perde il destinatario · cronaca che dice "passaggio" ma il video mostra altro.

### Suggerimenti automatici

Rendere più evidente il destinatario · migliorare lo smarcamento · sincronizzare gesto↔pallone · prolungare il post-highlight · aumentare la reazione dei difensori.

### Definition of Done

Destinatario chiaramente identificabile; gesto coerente col tipo di passaggio; traiettoria naturale e continua; compagni e avversari che reagiscono credibilmente; risultato completamente visibile; post-highlight senza tagli bruschi; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un passaggio che non mostra chiaramente il **destinatario** o il suo **esito**, anche se tecnicamente corretto, è **incompleto** e non conforme.

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

### LMV-003 (Tentativo di Passaggio) — copertura attuale

È il validator meglio coperto dal rendering: qualità del passaggio decisa dal motore (F9 → profondità scatto + pace), beat di **ricezione** visibile (`assist_recv`), il compagno **scatta** e la palla è giocata sulla corsa, e soprattutto l'**effetto boomerang è già risolto** alla radice (fix 5.14/5.22) — un outcome esplicitamente vietato da LMV-003. Post-arco `assist_recv→assist_shot`. **Non validati automaticamente:** timeline a 8 fasi, Semantic ("sta servendo un compagno?"), identificabilità garantita del destinatario, Narrative, presenza post-highlight. Il "no boomerang" andrebbe trasformato in **caso di regressione permanente** (Regression Suite) — è il candidato ideale per il primo validator automatico una volta presente il layer Event+Timeline.

### LMV-002 (Tentativo di Dribbling) — copertura attuale

Rendering: varianti dribbling decise dal motore (`dribble_feint`/`inside`/`outside`, F-engine), regia ravvicinata dedicata (CINE-5), palla laterale a fine azione, post-arco dribbling-gol → rete. Punto debole noto e rilevante per LMV-002: il **confronto col difensore** (Fase 2/5) è affidato all'AI off-ball generica (pressing/marcatura F3 + deliberativa F10/F11), non a un duello 1v1 scriptato e leggibile → da collaudare dal vivo. **Non validati:** timeline, Semantic ("è un tentativo di superare l'uomo?"), reazione difensore garantita, Narrative, post-highlight.

### LMV-001 (Tentativo di Cross) — copertura attuale

Il motore copre già diversi requisiti *a livello di rendering* (non validati dal gate dal vivo): varianti cross decise dal motore (F5/F8), traiettoria = conseguenza della decisione (F5), regia per-pattern del cross (CINE-5: FAR_POST/CUTBACK/NEAR), reazioni difensive deliberative (F10/F11), uscita portiere (F13), post-arco `cross_goal`. **Non ancora validati automaticamente:** timeline a 9 fasi, eventi obbligatori/vietati, Semantic ("è riconoscibile come cross?"), Narrative (storia completa), presenza del post-highlight, sincronia cronaca↔animazione. → richiede il layer Event+Timeline + un Semantic Validator per-Situation.
