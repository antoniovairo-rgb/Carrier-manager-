# VALIDATORS.md

Standard e catalogo dei **validator** della Live Match Development Platform.

> Documento vivo, organizzato per capitoli. Si conforma a `MASTER_PROMPT.md` (charter LMQP) e a `LIVE_MATCH_QA_SPEC.md` (architettura, cap. 3.4 Validator Engine).
>
> **Catalogo COMPLETO: LMV-001…LMV-030.**
>
> **Differiti (non nel catalogo):** *Lancio del Portiere (NPC)* e *Salvataggio Difensivo (NPC)* — richiedono highlight a **protagonista NPC**, non previsti dal flusso attuale (l'highlight è incentrato sull'eroe). Estensione futura; useranno la struttura standard del cap. 1. Nuovi validator oltre il 030 → prossimo ID libero (`LMV-031`, …).

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

## Validator 004 — Tentativo di Tiro

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-004` |
| **Categoria** | Finalizzazione |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Tiro"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che il tiro sia **gol**: conta che il giocatore tenti realmente una **conclusione verso la porta**. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore cerca **intenzionalmente** di concludere verso la porta. Comprende tutte le tipologie di conclusione.

### Situazioni compatibili / non compatibili

- **Compatibili:** rasoterra · potente · piazzato · a giro · al volo · mezza rovesciata · rovesciata · colpo di punta · da fuori area · conclusione ravvicinata.
- **NON compatibili:** passaggi · cross · rinvii · rilanci del portiere · rimesse laterali · calci d'angolo · **punizioni dirette** (validator dedicato).

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — controlla il pallone |
| 2 | **Preparazione** — individua lo spazio (avanza / sposta la palla / protegge / prepara il piede) |
| 3 | **Gesto tecnico** — conclude verso la porta, gesto chiaramente leggibile |
| 4 | **Traiettoria** — coerente col tipo di tiro |
| 5 | **Reazione** — il portiere reagisce, i difensori deviano, gli attaccanti seguono |
| 6 | **Esito** — uno degli outcome previsti |
| 7 | **Post-Highlight** — conclusione dell'azione chiaramente mostrata |

### Outcome

- **Ammessi:** gol · parata · palo · traversa · deviazione · tiro fuori · muro difensivo · respinta del portiere · ribattuta con prosecuzione.
- **Non ammessi:** pallone che cambia direzione senza contatto · portiere che non reagisce · replay che termina prima dell'esito · tiro che diventa visivamente un passaggio · pallone che scompare o attraversa la porta · animazione interrotta prima dell'impatto.

### Controlli per validator

- **Ball:** traiettoria coerente, velocità compatibile col tipo di tiro, rotazione plausibile, impatto corretto, no teletrasporti, no movimenti innaturali.
- **Player:** il **protagonista** orienta il corpo verso la porta / prepara il gesto / completa la conclusione; il **portiere** segue il pallone / reagisce credibilmente / tenta la parata; i **difensori** chiudono il tiro / cercano la deviazione / seguono la ribattuta.
- **Camera:** protagonista in evidenza, segue il pallone, mostra porta + portiere + esito; **il momento del tiro non va mai nascosto**.
- **Motion:** rincorsa fluida, sincronia gesto↔pallone, animazioni naturali, continuità, no interruzioni improvvise.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta tentando una conclusione verso la porta?"* — se no → **FAIL**.
- **Football Intelligence:** tiro da posizione plausibile, momento scelto correttamente, portiere che reagisce, difensori che ostacolano, attaccanti che seguono la ribattuta → azione credibile.
- **Narrative:** `Possesso → Preparazione → Conclusione → Traiettoria → Reazione → Esito → Post-Highlight`; ogni fase riconoscibile.

### Errori critici (FAIL)

Tiro non riconoscibile · portiere completamente immobile · camera che perde il pallone · replay che termina prima dell'esito · pallone che attraversa giocatori/rete senza collisioni coerenti · cronaca e highlight che mostrano azioni differenti.

### Suggerimenti automatici

Aumentare la durata del post-highlight · anticipare la reazione del portiere · migliorare la traiettoria · sincronizzare cronaca e animazione · rendere più evidente il gesto tecnico.

### Definition of Done

Tentativo di conclusione immediatamente riconoscibile; gesto coerente col tipo di tiro; traiettoria naturale; portiere e difensori che reagiscono credibilmente; risultato finale completamente visibile; post-highlight che conclude la scena; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight che si interrompe **subito dopo il tiro**, senza mostrare parata/gol/deviazione/uscita, è **incompleto** anche se il gesto tecnico è corretto.

---

## Validator 005 — Tentativo di Colpo di Testa

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-005` |
| **Categoria** | Finalizzazione |
| **Priorità** | Alta |

### Scopo

Verifica che una Situation **"Tentativo di Colpo di Testa"** sia rappresentata in modo credibile, leggibile e coerente. Non conta che sia **gol**: conta che il protagonista tenti realmente di **colpire il pallone di testa**. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui un giocatore cerca **intenzionalmente** di colpire un **pallone aereo** con la testa. Comprende situazioni offensive **e** difensive.

### Situazioni compatibili / non compatibili

- **Compatibili:** colpo di testa su cross · su calcio d'angolo · su punizione · spizzata · sponda aerea · difensivo · ravvicinato · in tuffo.
- **NON compatibili:** controllo di petto · stop di coscia · tiro al volo · passaggi rasoterra · colpi di piede.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Preparazione** — pallone in traiettoria aerea, protagonista individua il punto d'impatto |
| 2 | **Attacco del pallone** — si muove sulla traiettoria (anticipo / primo palo / secondo palo / arretra / taglio) |
| 3 | **Confronto** — il difensore contrasta (marca / salta / ostacola / anticipa), mai passivo |
| 4 | **Elevazione** — salta, tempo di elevazione credibile |
| 5 | **Impatto** — colpisce con la testa, momento chiaramente visibile |
| 6 | **Traiettoria** — nuova traiettoria coerente |
| 7 | **Esito** — uno degli outcome previsti |
| 8 | **Post-Highlight** — conseguenze chiaramente mostrate |

### Outcome

- **Ammessi:** gol · parata · deviazione · respinta difensiva · pallone fuori · traversa · palo · sponda · prosecuzione.
- **Non ammessi:** salto assente · impatto non visibile · pallone che cambia direzione **prima** del contatto · difensore immobile · replay interrotto prima dell'esito · protagonista che colpisce senza guardare il pallone.

### Controlli per validator

- **Ball:** traiettoria aerea coerente, impatto corretto, nuova traiettoria compatibile, velocità plausibile, no teletrasporti.
- **Player:** il **protagonista** segue la palla con lo sguardo / attacca la traiettoria / salta correttamente / completa il gesto; il **difensore** contrasta in aria / marca / segue; il **portiere** valuta la traiettoria / reagisce quando coinvolto.
- **Camera:** mostra il pallone in tutta la traiettoria, il salto, il contatto, l'esito.
- **Motion:** sincronia salto↔traiettoria, elevazione naturale, continuità, atterraggio di qualità, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta tentando un colpo di testa?"* — se no → **FAIL**.
- **Football Intelligence:** attacca correttamente la zona del pallone, difensore che contrasta davvero, portiere che reagisce, tempo di salto plausibile, comportamento degli altri coerente.
- **Narrative:** `Traiettoria → Attacco del pallone → Contrasto → Salto → Colpo di testa → Esito → Post-Highlight`; comprensibile anche senza cronaca.

### Errori critici (FAIL)

Il protagonista non salta · pallone che cambia traiettoria senza contatto · difensore che non reagisce · replay che termina prima dell'esito · camera che nasconde l'impatto · cronaca e highlight che mostrano azioni differenti.

### Suggerimenti automatici

Migliorare il tempo di salto · aumentare il contrasto del difensore · migliorare la sincronia col pallone · prolungare il post-highlight · rendere più evidente il punto d'impatto.

### Definition of Done

Tentativo immediatamente riconoscibile; attacco credibile della traiettoria; salto e contatto naturali; difensore e portiere che reagiscono coerentemente; risultato completamente visibile; post-highlight che conclude la scena; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight che mostra **solo il contatto** senza preparazione, contrasto aereo e conseguenze è **incompleto** e non conforme.

---

## Validator 006 — Tentativo di Contrasto

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-006` |
| **Categoria** | Fase Difensiva |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Contrasto"** sia rappresentata in modo credibile, leggibile e coerente. Non conta che il difensore **recuperi** il pallone: conta che tenti realmente di **interrompere o rallentare** l'azione offensiva. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui un difensore cerca **intenzionalmente** di recuperare il possesso o impedire la progressione dell'avversario. Comprende contrasti in piedi e in scivolata, purché coerenti con la Situation.

### Situazioni compatibili / non compatibili

- **Compatibili:** contrasto in piedi · scivolata · chiusura della linea di corsa · anticipo · tackle laterale · tackle frontale · recupero in corsa.
- **NON compatibili:** intercetto di un passaggio · duello aereo · semplice marcatura · pressing senza tentativo di recupero · uscita del portiere.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Lettura dell'azione** — il difensore individua il portatore |
| 2 | **Avvicinamento** — riduce la distanza, adatta velocità e direzione |
| 3 | **Preparazione** — sceglie il momento, non si lancia casualmente |
| 4 | **Tentativo** — esegue il gesto difensivo, chiaramente intenzionale |
| 5 | **Contatto** — con il pallone / con l'avversario / nessun contatto (tutte valide se coerenti) |
| 6 | **Esito** — uno degli outcome previsti |
| 7 | **Post-Highlight** — conseguenze chiaramente mostrate |

### Outcome

- **Ammessi:** recupero del pallone · pallone deviato · fallo · contrasto perso · prosecuzione dell'azione offensiva · rimessa laterale · calcio d'angolo · rimpallo.
- **Non ammessi:** difensore che attraversa l'avversario · contrasto senza movimento preparatorio · portatore che ignora completamente il contrasto · cambio di possesso senza motivo · replay che termina subito dopo il tackle.

### Controlli per validator

- **Ball:** deviazione coerente, perdita del possesso solo dopo un contatto plausibile, traiettoria naturale, no teletrasporti.
- **Player:** il **difensore** osserva il portatore / riduce la distanza / sincronizza il contrasto / completa il gesto; l'**attaccante** reagisce / protegge il pallone / tenta di evitare il contrasto; gli **altri** seguono e si riposizionano.
- **Camera:** difensore e portatore visibili, momento del contrasto chiaro, esito seguito.
- **Motion:** intervento fluido, continuità, scivolata/tackle naturale, recupero dell'equilibrio corretto.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il difensore sta tentando di recuperare il pallone?"* — se no → **FAIL**.
- **Football Intelligence:** momento scelto correttamente, contrasto coerente con la posizione, rischio plausibile, compagni che coprono gli spazi, attaccante coerente.
- **Narrative:** `Pressione → Avvicinamento → Preparazione → Contrasto → Esito → Post-Highlight`; sequenza leggibile.

### Errori critici (FAIL)

Il difensore rimane passivo · il contrasto non è visibile · il pallone cambia possesso senza contatto plausibile · il replay termina prima dell'esito · cronaca e highlight mostrano azioni differenti.

### Suggerimenti automatici

Migliorare il tempo dell'intervento · aumentare la reazione dell'attaccante · sincronizzare il contatto col pallone · prolungare il post-highlight · rendere più evidente il recupero o il mancato recupero.

### Definition of Done

Intenzione difensiva immediatamente riconoscibile; gesto preparato ed eseguito credibilmente; attaccante che reagisce coerentemente; comportamento del pallone naturale; esito completamente visibile; post-highlight che conclude la scena; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un contrasto che si limita a **cambiare improvvisamente il possesso** senza preparazione, gesto tecnico e conseguenze è **incompleto** e non conforme.

---

## Validator 007 — Tentativo di Intercetto

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-007` |
| **Categoria** | Fase Difensiva |
| **Priorità** | Alta |

### Scopo

Verifica che una Situation **"Tentativo di Intercetto"** sia rappresentata in modo credibile, leggibile e coerente. Non conta che il difensore **recuperi**: conta che tenti realmente di **leggere e interrompere una traiettoria** di passaggio o cross. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui un giocatore cerca **intenzionalmente** di anticipare la traiettoria del pallone **senza affrontare direttamente il portatore**. Protagonista: il difensore. Bersaglio: il pallone. (Distinto da LMV-006 contrasto, che affronta il portatore.)

### Situazioni compatibili / non compatibili

- **Compatibili:** intercetto di passaggio · di filtrante · di cross · di lancio · deviazione preventiva · chiusura della linea di passaggio.
- **NON compatibili:** contrasto · tackle · marcatura · duello aereo · uscita del portiere.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Lettura** — osserva portatore e possibile linea di passaggio |
| 2 | **Anticipo** — modifica il movimento per raggiungere la traiettoria |
| 3 | **Tentativo** — il pallone viene giocato, il difensore prova ad anticiparlo |
| 4 | **Contatto** — recupero pulito / deviazione / tocco parziale / mancato contatto |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — prosecuzione dell'azione chiaramente mostrata |

### Outcome

- **Ammessi:** recupero del pallone · deviazione · pallone fuori · rimessa laterale · calcio d'angolo · passaggio riuscito nonostante il tentativo · rimpallo.
- **Non ammessi:** difensore fermo · cambio di posizione senza movimento · pallone che cambia traiettoria senza contatto · replay che termina prima dell'esito.

### Controlli per validator

- **Ball:** traiettoria coerente, deviazione **solo dopo contatto**, velocità naturale, no teletrasporti.
- **Player:** il **difensore** legge la giocata / anticipa / cerca la linea / completa il gesto; il **portatore** completa il passaggio e reagisce all'intercetto; il **destinatario** tenta comunque di raggiungere la palla e adatta il movimento.
- **Camera:** mostra portatore + difensore + pallone, segue la traiettoria fino all'esito.
- **Motion:** corsa continua, anticipo naturale, sincronia con la traiettoria, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il difensore sta tentando di intercettare un passaggio?"* — se no → **FAIL**.
- **Football Intelligence:** tempo dell'anticipo corretto, linea di passaggio realmente chiusa, movimento coerente con la tattica, altri difensori che si riposizionano, attaccanti che reagiscono.
- **Narrative:** `Lettura → Anticipo → Tentativo → Contatto/mancato contatto → Esito → Post-Highlight`; leggibile anche senza cronaca.

### Errori critici (FAIL)

Il difensore non modifica il movimento · pallone che cambia direzione senza contatto · replay che termina prima dell'esito · cronaca e highlight che mostrano azioni differenti · destinatario che ignora completamente la deviazione.

### Suggerimenti automatici

Anticipare il movimento del difensore · rendere più evidente la lettura della giocata · migliorare la sincronia deviazione↔traiettoria · aumentare la reazione del destinatario · prolungare il post-highlight.

### Definition of Done

Intenzione di chiudere la linea immediatamente riconoscibile; anticipo credibile; comportamento del pallone coerente con l'eventuale contatto; attaccanti e difensori che reagiscono naturalmente; risultato completamente visibile; post-highlight senza tagli bruschi; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un intercetto in cui il possesso cambia improvvisamente senza mostrare la **lettura**, il **movimento** del difensore e l'**effettiva deviazione** è **incompleto** e non conforme.

---

## Validator 008 — Tentativo di Parata

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-008` |
| **Categoria** | Fase Difensiva |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Parata"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che il portiere **fermi** il pallone: conta che tenti realmente di **intervenire sulla conclusione** avversaria. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il portiere cerca **intenzionalmente** di impedire che il pallone entri in porta. Comprende ogni tipologia di intervento del portiere.

### Situazioni compatibili / non compatibili

- **Compatibili:** parata in presa · deviazione · tuffo · respinta · uscita bassa · uscita alta · intervento ravvicinato · su colpo di testa · su tiro da fuori area.
- **NON compatibili:** rinvio del portiere · rilancio · semplice raccolta senza pressione · uscita fuori area come difensore.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Lettura** — individua la conclusione, segue il pallone con lo sguardo |
| 2 | **Preparazione** — postura d'attesa (avanza / arretra / si sposta / prepara il tuffo) |
| 3 | **Tentativo** — esegue il gesto, intervento chiaramente intenzionale |
| 4 | **Contatto** — presa / deviazione / respinta / nessun contatto |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — conseguenze dell'intervento chiaramente mostrate |

### Outcome

- **Ammessi:** parata · respinta · deviazione · gol subito · palo · traversa · pallone fuori · ribattuta con prosecuzione.
- **Non ammessi:** portiere completamente immobile · **tuffo nella direzione opposta** · contatto senza sincronizzazione · pallone che attraversa il portiere · replay interrotto prima dell'esito.

### Controlli per validator

- **Ball:** traiettoria coerente, deviazione realistica, variazione di velocità **dopo** il contatto, no teletrasporti, collisioni corrette.
- **Player:** il **portiere** segue il pallone / legge la traiettoria / sceglie il tempo / completa il gesto; gli **attaccanti** seguono l'eventuale respinta; i **difensori** proteggono la porta e reagiscono alla ribattuta.
- **Camera:** pallone e portiere visibili, momento della parata chiaro, esito mostrato.
- **Motion:** tuffo fluido, intervento naturale, sincronia con la traiettoria, recupero dell'equilibrio, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il portiere sta tentando di impedire il gol?"* — se no → **FAIL**.
- **Football Intelligence:** tempo di uscita/tuffo corretto, posizione iniziale plausibile, difensori che seguono, attaccanti sull'eventuale respinta, decisione coerente col tipo di conclusione.
- **Narrative:** `Lettura → Preparazione → Tentativo → Contatto/mancato contatto → Esito → Post-Highlight`; sequenza leggibile.

### Errori critici (FAIL)

Il portiere non reagisce · il pallone attraversa il corpo del portiere · replay che termina prima dell'esito · camera che perde il momento della parata · cronaca e highlight che mostrano azioni differenti.

### Suggerimenti automatici

Anticipare il tempo di reazione · migliorare la sincronia tuffo↔pallone · aumentare il realismo della respinta · prolungare il post-highlight · migliorare il posizionamento iniziale.

### Definition of Done

Tentativo del portiere immediatamente riconoscibile; lettura della traiettoria e gesto credibili; comportamento del pallone coerente con l'eventuale contatto; difensori e attaccanti che reagiscono alla ribattuta o al gol; risultato finale completamente visibile; post-highlight che conclude la sequenza; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight in cui il portiere resta passivo, interviene fuori tempo, o il replay si interrompe prima dell'esito, è **incompleto** e non conforme.

---

## Validator 009 — Tentativo di Recupero del Pallone

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-009` |
| **Categoria** | Transizione Difensiva |
| **Priorità** | Alta |

### Scopo

Verifica che una Situation **"Tentativo di Recupero del Pallone"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che il pallone venga **recuperato**: conta che uno o più giocatori tentino realmente di **riconquistare il possesso** tramite pressione, rincorsa e chiusura degli spazi. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui un giocatore o un **gruppo** prova **intenzionalmente** a riconquistare il possesso **senza** un contrasto diretto o un intercetto specifico. Focus sul **comportamento collettivo** e sulla pressione esercitata. (Distinto da LMV-006/007, individuali.)

### Situazioni compatibili / non compatibili

- **Compatibili:** pressing individuale · pressing collettivo · rincorsa difensiva · recupero dopo perdita del possesso · chiusura degli spazi · contro-pressing · ripiegamento difensivo.
- **NON compatibili:** tackle · intercetto · duello aereo · uscita del portiere · semplice marcatura statica.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Perdita del possesso** — la squadra perde il pallone |
| 2 | **Reazione** — i più vicini iniziano subito il recupero, mai fermi |
| 3 | **Pressione** — i difensori riducono gli spazi, limitano le opzioni avversarie |
| 4 | **Tentativo** — recupero / errore dell'avversario / mantenimento del possesso offensivo |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — come prosegue l'azione, chiaramente mostrato |

### Outcome

- **Ammessi:** recupero del possesso · fallo · pallone fuori · prosecuzione dell'azione offensiva · passaggio riuscito dell'avversario · errore tecnico dell'avversario.
- **Non ammessi:** giocatori completamente immobili · nessuna pressione sul portatore · recupero senza alcuna azione visibile · replay interrotto prima dell'esito.

### Controlli per validator

- **Ball:** pallone coerente con l'azione, cambi di possesso solo da eventi visibili, no cambi improvvisi di traiettoria.
- **Player:** i **difendenti** accelerano verso il portatore / chiudono gli spazi / collaborano / si riposizionano; gli **attaccanti** mantengono il possesso / offrono linee / reagiscono alla pressione.
- **Camera:** portatore sempre visibile, pressione difensiva mostrata, eventuale recupero evidenziato.
- **Motion:** intensità della rincorsa, cambi di direzione fluidi, movimenti naturali, sincronia tra i giocatori coinvolti.
- **Semantic:** *"Un osservatore capirebbe immediatamente che la squadra sta cercando di recuperare il possesso?"* — se no → **FAIL**.
- **Football Intelligence:** il più vicino reagisce per primo, compagni che coprono gli spazi, pressione coordinata, attaccanti con soluzioni credibili, comportamento collettivo tatticamente plausibile.
- **Narrative:** `Perdita → Reazione → Pressione → Tentativo → Esito → Post-Highlight`; chiara anche senza cronaca.

### Errori critici (FAIL)

Nessun giocatore reagisce alla perdita · recupero senza azione visibile · camera che perde il portatore · replay che termina prima dell'esito · cronaca e highlight con intenzioni differenti.

### Suggerimenti automatici

Aumentare la velocità di reazione · migliorare il coordinamento del pressing · rendere più evidente la chiusura degli spazi · prolungare il post-highlight · sincronizzare cronaca e animazione.

### Definition of Done

Reazione alla perdita immediata e riconoscibile; pressione credibile e coordinata; comportamento coerente col contesto tattico; esito completamente visibile; post-highlight che conclude la sequenza; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight in cui il possesso cambia **senza** mostrare pressione, rincorsa e tentativo di recupero è **incompleto** e non conforme.

---

## Validator 010 — Tentativo di Progressione

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-010` |
| **Categoria** | Costruzione dell'Azione |
| **Priorità** | Alta |

### Scopo

Verifica che una Situation **"Tentativo di Progressione"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che il giocatore raggiunga una **zona** specifica: conta che tenti realmente di **avanzare con il pallone** per creare un vantaggio tattico, superare linee di pressione o migliorare la posizione offensiva. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore in possesso conduce **intenzionalmente** il pallone verso una zona più favorevole. La progressione deve avere uno **scopo tattico evidente** e mai apparire come una corsa casuale.

### Situazioni compatibili / non compatibili

- **Compatibili:** conduzione palla · avanzamento centrale · avanzamento sulla fascia · progressione in contropiede · dopo recupero palla · con cambio di direzione · in superiorità numerica.
- **NON compatibili:** dribbling · passaggio · cross · tiro · semplice mantenimento del possesso senza avanzamento.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — controlla il pallone |
| 2 | **Valutazione** — osserva compagni / avversari / spazio; intenzione di avanzare percepibile |
| 3 | **Progressione** — conduce il pallone (accelera / rallenta / cambia direzione / protegge); conduzione **continua** |
| 4 | **Reazione** — gli avversari chiudono gli spazi, i compagni accompagnano |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — prosecuzione dell'azione chiaramente mostrata |

### Outcome

- **Ammessi:** avanzamento riuscito · passaggio/tiro/cross/dribbling successivo · perdita del possesso · fallo subito · recupero difensivo.
- **Non ammessi:** corsa senza direzione plausibile · cambi improvvisi di direzione senza motivo · pallone troppo distante dal protagonista · avversari completamente passivi · replay interrotto prima dell'esito.

### Controlli per validator

- **Ball:** pallone sotto controllo, distanza giocatore-palla coerente, velocità di conduzione naturale, no teletrasporti/rimbalzi anomali.
- **Player:** il **protagonista** guida il pallone / osserva il gioco / modifica il ritmo / protegge il possesso; i **compagni** offrono linee / accompagnano / occupano spazi; gli **avversari** accorciano / rallentano l'azione / si riposizionano.
- **Camera:** protagonista e pallone sempre visibili, direzione della progressione mostrata, spazi disponibili evidenziati, esito mostrato.
- **Motion:** corsa fluida, sincronia corsa↔conduzione, cambi di ritmo naturali, continuità, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta cercando di far avanzare l'azione con il pallone?"* — se no → **FAIL**.
- **Football Intelligence:** progressione in situazione plausibile, spazi sfruttati, compagni che sostengono, avversari che chiudono, ritmo coerente col contesto.
- **Narrative:** `Possesso → Lettura → Progressione → Reazione → Esito → Post-Highlight`; leggibile anche senza cronaca.

### Errori critici (FAIL)

Il protagonista corre senza scopo apparente · il pallone si separa senza motivo · gli avversari non reagiscono · replay che termina prima dell'esito · cronaca che dice "progressione" ma il video mostra altro.

### Suggerimenti automatici

Migliorare la conduzione · aumentare la pressione degli avversari · rendere più evidente la direzione · prolungare il post-highlight · sincronizzare cronaca e animazione.

### Definition of Done

Intenzione di avanzare immediatamente riconoscibile; conduzione naturale e controllata; compagni e avversari che reagiscono credibilmente; conseguenza chiaramente visibile; post-highlight che conclude la sequenza; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Una conduzione **priva di obiettivo tattico**, senza reazioni dei giocatori circostanti o interrotta prima delle conseguenze, è **incompleta** e non conforme.

---

## Validator 011 — Tentativo di Protezione del Pallone

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-011` |
| **Categoria** | Gestione del Possesso |
| **Priorità** | Alta |

### Scopo

Verifica che una Situation **"Tentativo di Protezione del Pallone"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che il protagonista **mantenga** il possesso: conta che tenti realmente di **proteggere il pallone dalla pressione avversaria** per mantenere il controllo dell'azione o attendere il supporto dei compagni. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore usa **corpo, postura e controllo tecnico** per impedire agli avversari di recuperare il possesso. La protezione deve essere **intenzionale e chiaramente riconoscibile**.

### Situazioni compatibili / non compatibili

- **Compatibili:** protezione spalle alla porta · sulla fascia · in attesa del supporto · mantenimento del possesso sotto pressione · schermatura del pallone · gestione del possesso vicino alla linea laterale.
- **NON compatibili:** dribbling · passaggio · tiro · cross · semplice conduzione senza pressione.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — controlla il pallone |
| 2 | **Pressione** — uno o più avversari si avvicinano, pressione chiaramente visibile |
| 3 | **Protezione** — usa il corpo / orienta le spalle / tiene il pallone sul lato opposto al difensore / protegge il possesso |
| 4 | **Reazione** — gli avversari tentano contrasto/anticipo/chiusura; i compagni si smarcano |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — conseguenza della protezione chiaramente mostrata |

### Outcome

- **Ammessi:** mantenimento del possesso · passaggio successivo · fallo subito · perdita del possesso · dribbling/tiro/cross successivo.
- **Non ammessi:** avversari completamente passivi · pallone troppo distante dal protagonista · perdita improvvisa del possesso senza evento visibile · replay interrotto prima dell'esito.

### Controlli per validator

- **Ball:** pallone sotto controllo, distanza coerente, no teletrasporti, no movimenti innaturali.
- **Player:** il **protagonista** protegge col corpo / mantiene l'equilibrio / postura e orientamento coerenti / osserva i compagni; gli **avversari** pressano / cercano il recupero / si adattano al movimento del protagonista; i **compagni** si smarcano / offrono linee / accompagnano.
- **Camera:** protagonista + pallone + difensore più vicino sempre visibili, duello fisico evidenziato, esito mostrato.
- **Motion:** movimenti fluidi, postura naturale, sincronia corpo↔pallone, continuità, no compenetrazioni.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta cercando di mantenere il possesso proteggendo il pallone?"* — se no → **FAIL**.
- **Football Intelligence:** sceglie correttamente quando proteggere, avversari che aumentano la pressione, compagni che offrono uno scarico, scelta tatticamente plausibile.
- **Narrative:** `Possesso → Pressione → Protezione → Reazione → Esito → Post-Highlight`; sequenza leggibile.

### Errori critici (FAIL)

Il protagonista non usa il corpo per proteggere · avversari che non pressano · pallone che si separa senza motivo · replay che termina prima dell'esito · cronaca e highlight che mostrano azioni differenti.

### Suggerimenti automatici

Aumentare la pressione difensiva · migliorare la postura · sincronizzare il controllo del pallone · prolungare il post-highlight · sincronizzare cronaca e animazione.

### Definition of Done

Intenzione di mantenere il possesso immediatamente riconoscibile; uso credibile di corpo e controllo tecnico; pressione avversaria realistica; compagni che offrono soluzioni coerenti; esito completamente visibile; post-highlight che conclude naturalmente; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un highlight in cui il protagonista mantiene il pallone **senza alcuna pressione**, o perde il possesso **senza una causa visibile**, è **incompleto** e non conforme.

---

## Validator 012 — Tentativo di Contropiede

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-012` |
| **Categoria** | Transizione Offensiva |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Contropiede"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che termini con un **gol**: conta che la squadra tenti realmente una **rapida transizione offensiva** dopo il recupero del possesso. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui una squadra, dopo il recupero del pallone, cerca **intenzionalmente** di avanzare rapidamente sfruttando gli spazi lasciati dagli avversari. Il contropiede deve essere **immediatamente riconoscibile**.

### Situazioni compatibili / non compatibili

- **Compatibili:** contropiede centrale · sulla fascia · in superiorità numerica · ripartenza dopo parata · dopo intercetto · dopo recupero del possesso.
- **NON compatibili:** costruzione lenta · possesso prolungato · semplice progressione · calcio piazzato.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Recupero del possesso** — l'azione nasce da un recupero chiaramente visibile |
| 2 | **Transizione** — cambio immediato di atteggiamento, gli offensivi attaccano gli spazi |
| 3 | **Progressione** — il portatore accelera; compagni e avversari cambiano rapidamente comportamento |
| 4 | **Sviluppo** — passaggi / progressioni / dribbling / cambi di gioco verso la porta, rapidamente |
| 5 | **Esito** — uno degli outcome previsti |
| 6 | **Post-Highlight** — conclusione della ripartenza chiaramente mostrata |

### Outcome

- **Ammessi:** tiro · gol · cross · perdita del possesso · fallo subito · recupero difensivo · calcio d'angolo · prosecuzione.
- **Non ammessi:** squadra che rallenta senza motivo · compagni immobili · avversari che non rientrano · replay interrotto prima della conclusione · transizione offensiva non riconoscibile.

### Controlli per validator

- **Ball:** circolazione rapida, traiettorie coerenti, no comportamenti innaturali, continuità dell'azione.
- **Player:** il **portatore** accelera / cerca la verticalità / sceglie coerentemente; i **compagni** attaccano gli spazi / accompagnano / offrono linee; gli **avversari** rientrano rapidamente / rallentano il contropiede / proteggono la porta.
- **Camera:** enfatizza la velocità, mantiene visibili portatore e spazi davanti, segue lo sviluppo senza perdere il pallone, mostra la conclusione.
- **Motion:** accelerazioni credibili, sincronia dei movimenti, corse naturali, continuità.
- **Semantic:** *"Un osservatore capirebbe immediatamente che la squadra sta tentando una rapida ripartenza?"* — se no → **FAIL**.
- **Football Intelligence:** il recupero genera transizione immediata, spazi occupati razionalmente, avversari che rientrano in copertura, scelte offensive coerenti col contropiede, ritmo elevato fino all'esito.
- **Narrative:** `Recupero → Transizione → Accelerazione → Sviluppo → Esito → Post-Highlight`; chiaramente leggibile.

### Errori critici (FAIL)

Il contropiede non nasce da un recupero · la squadra rallenta senza motivo · gli attaccanti non accompagnano · avversari completamente passivi · replay che termina prima dell'esito · cronaca e highlight con intenzioni differenti.

### Suggerimenti automatici

Aumentare la velocità della transizione · migliorare gli inserimenti dei compagni · aumentare il rientro difensivo · prolungare il post-highlight · sincronizzare cronaca e animazione.

### Definition of Done

Ripartenza immediatamente riconoscibile; recupero del possesso chiaramente visibile; ritmo elevato e coerente; compagni e avversari che reagiscono credibilmente; risultato finale completamente mostrato; post-highlight che conclude naturalmente; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un "contropiede" che **non trasmette velocità, transizione offensiva e sfruttamento degli spazi** è **incompleto** e non conforme.

---

## Validator 013 — Tentativo di Assist

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-013` |
| **Categoria** | Creazione di Occasione |
| **Priorità** | Massima |

### Scopo

Verifica che una Situation **"Tentativo di Assist"** sia rappresentata in modo realistico, leggibile e coerente. Non conta che l'assist sia **vincente**: conta che il protagonista tenti realmente di **creare un'occasione da gol per un compagno**. Esito positivo o negativo.

### Definizione

Qualsiasi azione in cui il giocatore cerca **intenzionalmente** di mettere un compagno nelle condizioni di **concludere verso la porta**. Il passaggio deve avere una **chiara finalità offensiva** (distinto da LMV-003, passaggio generico).

### Situazioni compatibili / non compatibili

- **Compatibili:** filtrante decisivo · passaggio in profondità · cross assist · passaggio arretrato · sponda offensiva · passaggio nello spazio · assist dopo dribbling · dopo progressione · su contropiede.
- **NON compatibili:** semplice passaggio di costruzione · cambio di gioco · scarico difensivo · rilancio del portiere · passaggio senza finalità offensiva.

### Timeline attesa

| Fase | Evento |
|---|---|
| 1 | **Possesso** — controlla il pallone |
| 2 | **Lettura del gioco** — osserva movimento del compagno / difensori / spazi; intenzione di creare un'occasione evidente |
| 3 | **Preparazione** — orienta il corpo / prepara il gesto / sceglie il tempo; destinatario identificabile |
| 4 | **Tentativo di assist** — passaggio eseguito, traiettoria coerente col movimento del destinatario |
| 5 | **Reazione** — il destinatario attacca lo spazio e conclude; difensori intercettano/chiudono; portiere legge il pericolo |
| 6 | **Esito** — uno degli outcome previsti |
| 7 | **Post-Highlight** — conclusione dell'occasione mostrata; **il replay non si interrompe subito dopo il passaggio** |

### Outcome

- **Ammessi:** assist riuscito · tiro · gol · parata · intercetto · deviazione · pallone fuori · errore tecnico del destinatario · perdita del possesso.
- **Non ammessi:** destinatario non identificabile · passaggio senza finalità offensiva · nessuna reazione dei difensori · replay interrotto prima della conclusione · occasione da gol non mostrata · effetto **boomerang** · cambio di traiettoria senza contatto.

### Controlli per validator

- **Ball:** traiettoria coerente, velocità compatibile, rotazione plausibile, sincronia col movimento del destinatario, no teletrasporti, **no inversioni innaturali**.
- **Player:** il **protagonista** legge il movimento / orienta il corpo / completa il gesto; il **destinatario** attacca lo spazio / prepara la conclusione / reagisce; i **difensori** chiudono la giocata / marcano il destinatario / reagiscono subito; il **portiere** segue l'evoluzione e si prepara.
- **Camera:** mostra contemporaneamente protagonista e destinatario, segue il pallone, mantiene la porta in inquadratura nella fase finale, mostra l'esito; il cambio camera non rompe la leggibilità.
- **Motion:** gesto fluido, sincronia passaggio↔movimenti, corse naturali, continuità, no movimenti innaturali.
- **Semantic:** *"Un osservatore capirebbe immediatamente che il protagonista sta cercando di creare una chiara occasione da gol per un compagno?"* — se no → **FAIL**.
- **Football Intelligence:** destinatario che attacca correttamente lo spazio, passaggio nel momento giusto, difensori che provano davvero a impedire l'occasione, portiere che reagisce al pericolo, scelta tatticamente plausibile.
- **Narrative:** `Possesso → Lettura → Preparazione → Assist → Movimento del destinatario → Conclusione → Esito → Post-Highlight`; azione completa e comprensibile.

### Errori critici (FAIL)

Destinatario non identificabile · passaggio che non genera una reale occasione · replay che termina prima della conclusione · camera che perde il momento decisivo · cronaca e highlight che mostrano azioni differenti · destinatario passivo che non tenta la giocata.

### Suggerimenti automatici

Migliorare il movimento del destinatario · anticipare il passaggio · aumentare la pressione dei difensori · prolungare il post-highlight · sincronizzare cronaca e animazione · migliorare l'inquadratura della conclusione.

### Definition of Done

Intenzione di creare un'occasione immediatamente riconoscibile; destinatario chiaramente identificabile; passaggio e movimenti coerenti; comportamento di difensori e portiere credibile; risultato finale completamente mostrato; post-highlight che conclude naturalmente; cronaca + timeline + animazione che rappresentano la stessa intenzione.

> Un "tentativo di assist" che **non mostra la creazione dell'occasione** o interrompe il replay prima della conclusione è **incompleto** e non conforme.

---

## Validator 014 — Tentativo di Lancio Lungo

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-014` |
| **Categoria** | Costruzione del Gioco |
| **Priorità** | Media |

**Scopo** — verificare che il protagonista tenti **intenzionalmente** un lancio lungo verso un compagno distante per superare una o più linee di pressione (si verifica l'intenzione, non il successo).

**Definizione** — passaggio di lunga distanza, prevalentemente **aereo**, con finalità di avanzamento dell'azione o cambio della zona di gioco.

- **Compatibili:** lancio lungo centrale · laterale · apertura sulla fascia · in profondità · dopo recupero palla · in contropiede.
- **NON compatibili:** cambio di gioco orizzontale · cross · rilancio del portiere · rinvio difensivo.

**Timeline** — `Possesso → Lettura → Preparazione del corpo → Lancio → Traiettoria → Movimento del destinatario → Esito → Post-Highlight`.

**Outcome ammessi** — ricezione · intercetto · pallone fuori · deviazione · prosecuzione.

**Controlli specifici** — il protagonista ha tempo per eseguire il lancio; destinatario identificabile; traiettoria coerente con la distanza; il pallone non cambia direzione senza contatto; gli avversari tentano di leggere il lancio.

**Errori critici (FAIL)** — il lancio sembra un passaggio corto; destinatario non identificabile; replay che termina prima della ricezione; cronaca che dice "lancio" ma il video mostra altro.

**Definition of Done** — lancio lungo immediatamente riconoscibile, traiettoria credibile, destinatario che reagisce correttamente, post-highlight che mostra la prosecuzione.

---

## Validator 015 — Tentativo di Cambio di Gioco

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-015` |
| **Categoria** | Costruzione del Gioco |
| **Priorità** | Media |

**Scopo** — verificare che il protagonista tenti di **spostare rapidamente il gioco** da un lato all'altro del campo per creare superiorità spaziale.

**Definizione** — passaggio lungo o medio che **trasferisce l'azione su una zona opposta** rispetto a quella di partenza; intenzione evidente.

- **Compatibili:** cambio fascia destra→sinistra · sinistra→destra · dopo pressing · dopo consolidamento del possesso.
- **NON compatibili:** lancio verticale · cross · filtrante · semplice passaggio laterale.

**Timeline** — `Possesso → Lettura degli spazi → Preparazione → Cambio di gioco → Traiettoria → Ricezione → Sviluppo della nuova azione → Post-Highlight`.

**Outcome ammessi** — ricezione pulita · intercetto · controllo imperfetto · uscita del pallone · prosecuzione offensiva.

**Controlli specifici** — il pallone attraversa **realmente** il campo; il cambio ha uno scopo tattico; il destinatario occupa uno spazio libero; la squadra si ridispone; i difensori scivolano verso il nuovo lato.

**Errori critici (FAIL)** — il cambio copre pochi metri; il pallone non attraversa il campo; il destinatario è marcato senza vantaggio; replay che termina prima dello sviluppo.

**Definition of Done** — cambio di gioco chiaramente riconoscibile, che modifica realmente il lato dell'azione e produce una nuova situazione offensiva leggibile.

---

## Validator 016 — Tentativo di Triangolazione

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-016` |
| **Categoria** | Combinazione Offensiva |
| **Priorità** | Alta |

**Scopo** — verificare che due o tre giocatori tentino una **combinazione rapida di passaggi** per superare una linea difensiva (qualità della collaborazione tra compagni).

**Definizione** — sequenza coordinata di passaggi rapidi in cui il protagonista restituisce o riceve nuovamente il pallone per creare un vantaggio.

- **Compatibili:** triangolazione centrale · sulla fascia · al limite dell'area · in contropiede.
- **NON compatibili:** semplice uno-due (validator dedicato, LMV-017) · passaggi indipendenti · possesso palla.

**Timeline** — `Primo passaggio → Movimento del protagonista → Secondo passaggio → Attacco dello spazio → Terzo passaggio (se previsto) → Superamento della linea → Esito → Post-Highlight`.

**Outcome ammessi** — progressione · assist · tiro · intercetto · errore tecnico · prosecuzione.

**Controlli specifici** — tutti i passaggi intenzionali; il protagonista si muove **senza palla**; tempi dei passaggi realistici; i difensori reagiscono alla combinazione; la triangolazione produce un vantaggio tattico.

**Errori critici (FAIL)** — giocatori fermi dopo il passaggio; il protagonista non si smarca; passaggi che sembrano casuali; cronaca che dice "triangolazione" ma il video mostra semplici passaggi consecutivi.

**Definition of Done** — triangolazione immediatamente riconoscibile, movimenti sincronizzati, vantaggio offensivo creato, post-highlight che mostra l'evoluzione.

---

## Validator 017 — Tentativo di Uno-Due

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-017` |
| **Categoria** | Combinazione Offensiva |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti una **combinazione rapida** con un compagno per superare uno o più avversari (intenzione di creare un vantaggio con uno scambio immediato).

**Definizione** — il protagonista passa il pallone a un compagno e **si inserisce immediatamente nello spazio** per riceverlo nuovamente; azione continua e fluida.

- **Compatibili:** uno-due centrale · sulla fascia · al limite dell'area · in contropiede.
- **NON compatibili:** triangolazione a tre (LMV-016) · semplice sequenza di passaggi · assist diretto.

**Timeline** — `Passaggio → Inserimento → Restituzione → Ricezione → Progressione → Esito → Post-Highlight`.

**Outcome ammessi** — progressione · tiro · assist · fallo · intercetto · perdita del possesso.

**Controlli specifici** — il protagonista parte **subito** dopo il passaggio; il compagno restituisce **intenzionalmente**; tempi realistici; i difensori reagiscono; viene creato un vantaggio offensivo.

**Errori critici (FAIL)** — il protagonista resta fermo; il secondo passaggio non è intenzionale; cronaca che dice "uno-due" ma il video mostra due passaggi scollegati.

**Definition of Done** — scambio immediatamente riconoscibile, tempi realistici, chiara progressione offensiva.

---

## Validator 018 — Tentativo di Smarcamento

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-018` |
| **Categoria** | Movimento Senza Palla |
| **Priorità** | Massima |

> Nota: l'ID LMV-018 nel backlog originale era "Protezione del Pallone", ora **assorbita in LMV-011** → LMV-018 è riassegnato a **Smarcamento**.

**Scopo** — verificare che il protagonista tenti di **liberarsi dalla marcatura** per offrire una soluzione di gioco; l'intenzione deve essere evidente **anche se il pallone non viene ricevuto**.

**Definizione** — qualsiasi movimento **senza palla** finalizzato a creare una linea di passaggio favorevole.

- **Compatibili:** smarcamento in ampiezza · in profondità · contromovimento · taglio verso il centro · taglio sul secondo palo.
- **NON compatibili:** semplice corsa casuale · inserimento dopo passaggio (LMV-019) · pressione difensiva.

**Timeline** — `Lettura → Contromovimento → Attacco dello spazio → Creazione della linea di passaggio → Esito → Post-Highlight`.

**Outcome ammessi** — ricezione · mancata ricezione · intercetto · cambio di soluzione del portatore.

**Controlli specifici** — il movimento ha una logica tattica; il protagonista osserva il portatore; il difensore reagisce; viene **realmente** creato spazio; cronaca e movimento coerenti.

**Errori critici (FAIL)** — corsa senza scopo; il difensore ignora completamente il movimento; lo smarcamento termina senza alcuna conseguenza visibile.

**Definition of Done** — smarcamento chiaramente riconoscibile, che crea una reale opzione di passaggio e modifica il comportamento di compagni e avversari.

---

## Validator 019 — Tentativo di Inserimento

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-019` |
| **Categoria** | Movimento Senza Palla |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti un **inserimento offensivo** per attaccare uno spazio libero creato dall'azione della squadra.

**Definizione** — movimento **senza palla** verso una zona offensiva per ricevere il pallone in posizione favorevole; **sincronizzato** con lo sviluppo dell'azione.

- **Compatibili:** inserimento centrale · sul primo palo · sul secondo palo · tra i centrali · da seconda linea.
- **NON compatibili:** semplice smarcamento (LMV-018) · progressione con il pallone · contropiede individuale.

**Timeline** — `Lettura → Attacco dello spazio → Sincronizzazione con il portatore → Tentativo di ricezione → Esito → Post-Highlight`.

**Outcome ammessi** — ricezione · assist · tiro · colpo di testa · intercetto · fuorigioco · mancata ricezione.

**Controlli specifici** — l'inserimento parte nel **momento corretto**; attacca uno spazio realmente libero; il portatore può vedere il movimento; i difensori tentano di seguirlo; sincronizzazione credibile.

**Errori critici (FAIL)** — inserimento troppo presto/tardi; corsa verso una zona senza senso tattico; difensori che non reagiscono; replay che termina prima dell'esito.

**Definition of Done** — inserimento immediatamente riconoscibile, sincronizzato con l'azione offensiva, con conseguenza chiaramente visibile **anche se il pallone non viene ricevuto**.

---

## Validator 020 — Tentativo di Attacco della Profondità

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-020` |
| **Categoria** | Movimento Offensivo |
| **Priorità** | Massima |

**Scopo** — verificare che il protagonista tenti realmente di **attaccare lo spazio alle spalle della linea difensiva** (si verifica l'intenzione, non la ricezione).

**Definizione** — movimento **senza palla** per sfruttare lo spazio dietro la linea difensiva; intenzione immediatamente riconoscibile.

- **Compatibili:** taglio centrale · diagonale · attacco sul filo del fuorigioco · inserimento dietro il terzino · corsa in contropiede.
- **NON compatibili:** semplice smarcamento laterale (LMV-018) · progressione con il pallone · movimento di copertura.

**Timeline** — `Lettura → Osservazione della linea difensiva → Scatto → Attacco dello spazio → Tentativo di ricezione → Esito → Post-Highlight`.

**Outcome ammessi** — ricezione · assist · tiro · gol · fuorigioco · intercetto · mancato passaggio. **Non ammessi:** corsa senza direzione · difensori immobili · replay interrotto.

**Controlli** — *Ball:* sincronia movimento↔passaggio. *Player:* scelta del tempo, traiettoria della corsa, reazione dei difensori, sincronia col portatore. *Camera:* protagonista + linea difensiva + spazio attaccato visibili. *Motion:* corsa naturale e cambi di ritmo. *Semantic:* "È riconoscibile un attacco della profondità?" → no = FAIL. *Football Intelligence:* timing corretto, spazio libero attaccato, reazione della linea.

**Errori critici (FAIL)** — corsa senza scopo · difensore che non reagisce · cronaca/highlight incoerenti.

**Definition of Done** — attacco della profondità immediatamente riconoscibile, sincronizzato col gioco, con conseguenza visibile.

---

## Validator 021 — Tentativo di Ricezione del Pallone

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-021` |
| **Categoria** | Controllo |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti di **ricevere un passaggio mantenendo il controllo**; la ricezione è l'inizio dell'azione offensiva successiva.

- **Compatibili:** ricezione rasoterra · aerea · in corsa · spalle alla porta · sulla fascia.
- **NON compatibili:** controllo orientato (LMV-022) · colpo di testa · deviazione.

**Timeline** — `Movimento → Preparazione → Ricezione → Controllo → Esito → Post-Highlight`.

**Outcome ammessi** — controllo riuscito · controllo imperfetto · pallone perso · deviazione · contrasto.

**Controlli** — *Ball:* punto di impatto e controllo. *Player:* postura, orientamento del corpo, preparazione. *Camera:* ricezione chiaramente visibile. *Motion:* fluidità del controllo. *Semantic:* "È riconoscibile il tentativo di ricevere?" *Football Intelligence:* scelta della posizione + sincronia col passatore.

**Errori critici (FAIL)** — il pallone arriva senza preparazione · controllo innaturale · replay interrotto.

**Definition of Done** — ricezione immediatamente riconoscibile che prepara naturalmente la giocata successiva.

---

## Validator 022 — Tentativo di Controllo Orientato

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-022` |
| **Categoria** | Tecnica Individuale |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti di **orientare il primo controllo** verso la giocata successiva (passaggio, tiro, progressione o dribbling).

- **Compatibili:** controllo verso la porta · verso la fascia · in progressione · dopo lancio · dopo cross.
- **NON compatibili:** semplice stop (LMV-021) · deviazione · colpo di testa.

**Timeline** — `Ricezione → Primo controllo → Orientamento del corpo → Preparazione della giocata → Esito → Post-Highlight`.

**Outcome ammessi** — progressione · tiro · assist · dribbling · perdita del possesso.

**Controlli** — *Ball:* primo tocco e nuova direzione. *Player:* orientamento del corpo, scelta tecnica. *Camera:* primo controllo leggibile. *Motion:* fluidità del gesto. *Semantic:* "Il controllo prepara chiaramente la giocata successiva?" → no = FAIL. *Football Intelligence:* controllo coerente con la situazione tattica.

**Errori critici (FAIL)** — il controllo non modifica realmente la situazione di gioco.

**Definition of Done** — controllo orientato immediatamente riconoscibile che genera un vantaggio tecnico.

---

## Validator 023 — Tentativo di Seconda Palla

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-023` |
| **Categoria** | Opportunismo Offensivo |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti di **conquistare un pallone vagante** generato da respinta, deviazione o rimpallo.

**Definizione** — "seconda palla" = qualsiasi pallone non più controllato da alcun giocatore dopo una giocata precedente.

- **Compatibili:** respinta del portiere · palo · traversa · rimpallo · deviazione.
- **NON compatibili:** ricezione diretta · passaggio intenzionale.

**Timeline** — `Respinta → Lettura → Attacco della seconda palla → Tentativo di controllo → Esito → Post-Highlight`.

**Outcome ammessi** — recupero · tiro · assist · perdita del possesso · fallo.

**Controlli** — *Ball:* traiettoria imprevedibile ma realistica. *Player:* tempo di reazione, aggressività. *Camera:* seconda palla sempre visibile. *Motion:* esplosività del movimento. *Semantic:* "È riconoscibile il tentativo di conquistare una seconda palla?" → no = FAIL. *Football Intelligence:* priorità d'intervento, reattività, lettura del rimbalzo.

**Errori critici (FAIL)** — il protagonista ignora il pallone vagante · replay che termina prima della conclusione.

**Definition of Done** — chiaro tentativo di conquistare una seconda palla, con comportamento realistico di protagonista, avversari e pallone.

---

## Validator 024 — Tentativo di Calcio di Punizione

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-024` |
| **Categoria** | Calci Piazzati |
| **Priorità** | Massima |

**Scopo** — verificare che il protagonista tenti realmente una **giocata offensiva da calcio di punizione** (non solo il gol). Soluzione diretta o indiretta.

- **Compatibili:** tiro diretto · cross in area · schema corto · filtrante · cambio gioco su punizione.
- **NON compatibili:** calcio d'angolo · rigore · rimessa laterale · tiro in azione.

**Timeline** — `Posizionamento → Preparazione → Lettura → Battuta → Traiettoria → Reazione compagni/avversari → Esito → Post-Highlight`.

**Outcome ammessi** — gol · assist · tiro · parata · respinta · deviazione · pallone fuori.

**Controlli** — *Ball:* posizione iniziale, traiettoria, rotazione, velocità. *Player:* il battitore prepara/osserva porta e compagni/esegue; compagni seguono lo schema; difensori marcano/seguono inserimenti; portiere organizza la **barriera** e reagisce. *Camera:* battitore + barriera + porta insieme. *Motion:* rincorsa fluida, battuta sincronizzata. *Semantic:* "È riconoscibile una punizione offensiva?" → no = FAIL. *Football Intelligence:* barriera/inserimenti/portiere ben posizionati.

**Errori critici (FAIL)** — punizione non riconoscibile · barriera immobile · replay interrotto · cronaca incoerente.

**Definition of Done** — punizione immediatamente riconoscibile, tutti reagiscono correttamente, replay che mostra integralmente lo sviluppo.

---

## Validator 025 — Tentativo di Calcio di Rigore

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-025` |
| **Categoria** | Calci Piazzati |
| **Priorità** | Massima |

**Scopo** — verificare che il protagonista tenti la **trasformazione di un rigore** con gesto tecnico credibile e coerente.

- **Compatibili:** tiro potente · angolato · centrale · cucchiaio · rasoterra.
- **NON compatibili:** punizione · tiro in movimento · tap-in.

**Timeline** — `Posizionamento → Preparazione → Rincorsa → Conclusione → Intervento del portiere → Esito → Post-Highlight`.

**Outcome ammessi** — gol · parata · palo · traversa · fuori.

**Controlli** — *Ball:* punto d'impatto, traiettoria, velocità. *Player:* rincorsa, postura, gesto, reazione del portiere. *Camera:* enfatizza il **duello tiratore↔portiere**. *Motion:* rincorsa/tiro/tuffo naturali. *Semantic:* "È riconoscibile un rigore?" → no = FAIL. *Football Intelligence:* realismo della scelta tecnica e del comportamento del portiere.

**Errori critici (FAIL)** — portiere immobile · pallone che attraversa il portiere · replay che termina prematuramente.

**Definition of Done** — rigore chiaramente riconoscibile, duello col portiere realistico, replay che mostra integralmente l'esito.

---

## Validator 026 — Tentativo di Calcio d'Angolo

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-026` |
| **Categoria** | Calci Piazzati |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti di creare una situazione offensiva con la **battuta di un corner**.

- **Compatibili:** corner teso · a rientrare · primo palo · secondo palo · corto.
- **NON compatibili:** cross in azione · punizione laterale.

**Timeline** — `Posizionamento → Preparazione → Battuta → Traiettoria → Movimenti in area → Esito → Post-Highlight`.

**Outcome ammessi** — colpo di testa · deviazione · tiro · gol · respinta · pallone fuori.

**Controlli** — *Ball:* traiettoria, effetto, punto di caduta. *Player:* battitore, inserimenti offensivi, marcature difensive, uscita del portiere. *Camera:* battitore + area di rigore insieme. *Motion:* sincronia battuta↔inserimenti. *Semantic:* "È riconoscibile un calcio d'angolo?" → no = FAIL. *Football Intelligence:* occupazione dell'area, marcature, tempi degli inserimenti.

**Errori critici (FAIL)** — nessuno attacca il pallone · portiere che non reagisce · replay che termina prima della conclusione.

**Definition of Done** — corner immediatamente riconoscibile, battuta credibile, tutti reagiscono, replay che mostra l'intera evoluzione.

---

## Validator 027 — Tentativo di Rimessa Laterale

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-027` |
| **Categoria** | Ripresa del Gioco |
| **Priorità** | Media |

**Scopo** — verificare che il protagonista tenti di **riavviare l'azione** dalla linea laterale scegliendo la soluzione offensiva più efficace (non il solo gesto della rimessa).

- **Compatibili:** rimessa corta · lunga · verso i piedi · nello spazio · in area avversaria.
- **NON compatibili:** calcio di punizione · corner · passaggio in gioco attivo.

**Timeline** — `Posizionamento → Ricerca del destinatario → Rimessa → Ricezione → Sviluppo dell'azione → Post-Highlight`.

**Outcome ammessi** — ricezione · intercetto · progressione · perdita del possesso.

**Controlli** — *Ball:* traiettoria e punto di atterraggio. *Player:* scelta del destinatario, smarcamenti, pressione difensiva. *Camera:* battitore + destinatario visibili. *Motion:* gesto tecnico naturale. *Semantic:* "È riconoscibile una rimessa laterale?" → no = FAIL. *Football Intelligence:* qualità dello smarcamento e della scelta del destinatario.

**Errori critici (FAIL)** — rimessa non riconoscibile · destinatario non identificabile · replay che termina prematuramente.

**Definition of Done** — rimessa laterale immediatamente riconoscibile, scelta del destinatario coerente col contesto, sviluppo dell'azione completamente visibile.

---

## Validator 028 — Tentativo di Deviazione Offensiva

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-028` |
| **Categoria** | Finalizzazione |
| **Priorità** | Alta |

**Scopo** — verificare che il protagonista tenti **intenzionalmente di modificare la traiettoria del pallone** per indirizzarlo in zona favorevole o verso la porta (non il solo gol).

**Definizione** — tocco **intenzionale** per modificare la traiettoria durante un'azione offensiva, con piede/testa/petto o qualsiasi parte consentita.

- **Compatibili:** deviazione su cross · su tiro · tocco sotto porta · ravvicinata · volante.
- **NON compatibili:** controllo del pallone · tiro preparato · colpo di testa in elevazione · semplice stop.

**Timeline** — `Traiettoria → Lettura → Attacco del punto d'impatto → Tentativo di deviazione → Nuova traiettoria → Esito → Post-Highlight`.

**Outcome ammessi** — gol · tiro · assist · deviazione fuori · parata · respinta · perdita del possesso.

**Controlli** — *Ball:* punto di contatto, modifica traiettoria, velocità coerente, **no cambi senza contatto**. *Player:* attacco del pallone, sincronia del gesto, equilibrio, reazione dopo il contatto. *Camera:* contatto giocatore↔pallone perfettamente visibile. *Motion:* gesto naturale, sincronia, continuità. *Semantic:* "È riconoscibile il tentativo di modificare la traiettoria?" → no = FAIL. *Football Intelligence:* scelta del tempo, posizione, comportamento di portiere/difensori.

**Errori critici (FAIL)** — il pallone cambia traiettoria **senza contatto** · replay che termina prima dell'esito · cronaca/video incoerenti.

**Definition of Done** — deviazione chiaramente riconoscibile, modifica realistica della traiettoria, esito mostrato integralmente.

---

## Validator 029 — Tentativo di Sponda Offensiva

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-029` |
| **Categoria** | Gioco di Squadra |
| **Priorità** | Media |

**Scopo** — verificare che il protagonista tenti di **servire un compagno con una sponda offensiva**.

**Definizione** — giocata in cui il protagonista (spesso **spalle alla porta**) usa un **unico tocco** per indirizzare il pallone verso un compagno (piede/testa/petto).

- **Compatibili:** sponda di testa · di petto · di prima · su lancio · in area.
- **NON compatibili:** controllo orientato (LMV-022) · passaggio preparato · assist diretto (LMV-013).

**Timeline** — `Ricezione → Protezione → Tentativo di sponda → Movimento del destinatario → Esito → Post-Highlight`.

**Outcome ammessi** — assist · progressione · tiro · perdita del possesso · intercetto.

**Controlli** — *Ball:* direzione e velocità della sponda. *Player:* postura, orientamento, sincronia col destinatario. *Camera:* protagonista + destinatario. *Motion:* gesto naturale. *Semantic:* "È riconoscibile una sponda offensiva?" → no = FAIL. *Football Intelligence:* scelta del destinatario, pressione difensiva, coordinazione.

**Errori critici (FAIL)** — destinatario non identificabile · pallone che cambia direzione senza contatto · replay che termina prima della conclusione.

**Definition of Done** — sponda immediatamente riconoscibile, destinatario identificabile, evoluzione mostrata integralmente.

---

## Validator 030 — Tentativo di Pressione Offensiva

| Campo | Valore |
|---|---|
| **Identificativo** | `LMV-030` |
| **Categoria** | Transizione Offensiva |
| **Priorità** | Media |

**Scopo** — verificare che il protagonista tenti di esercitare **pressione immediata** sul portatore/primo costruttore avversario per favorire una rapida riconquista in zona offensiva.

**Definizione** — movimento coordinato dell'attaccante per **limitare tempo e spazio** dell'avversario; non cerca necessariamente il contrasto ma **forza una decisione rapida**.

- **Compatibili:** pressione sul portiere · sul difensore centrale · dopo perdita del possesso · laterale.
- **NON compatibili:** tackle (LMV-006) · intercetto (LMV-007) · marcatura prolungata.

**Timeline** — `Perdita del possesso → Reazione → Pressione → Errore o giocata dell'avversario → Esito → Post-Highlight`.

**Outcome ammessi** — errore dell'avversario · recupero del possesso · lancio lungo forzato · uscita dalla pressione.

**Controlli** — *Ball:* coerenza della giocata forzata. *Player:* intensità della pressione, traiettoria della corsa, comportamento dell'avversario. *Camera:* attaccante + portatore visibili. *Motion:* accelerazione, frenata, cambi di direzione. *Semantic:* "È riconoscibile il tentativo di mettere pressione?" → no = FAIL. *Football Intelligence:* angolo di pressione corretto, chiusura della linea di passaggio, avversario coerente.

**Errori critici (FAIL)** — l'attaccante corre senza logica · l'avversario ignora la pressione · cronaca che dice "pressing" ma il video mostra altro.

**Definition of Done** — pressione offensiva immediatamente riconoscibile, che modifica il comportamento dell'avversario e produce una conseguenza tatticamente credibile, **indipendentemente dall'esito**.

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

### LMV-028/029/030 — copertura attuale (sintesi)

- **LMV-028 Deviazione Offensiva:** affine ai beat di prima/tap-in (`shot_first_time`, `cn.tapIn`) e ai post-arco di deviazione; il requisito chiave "**no cambio traiettoria senza contatto**" è già un invariante difeso dal codice (boomerang/fisica palla). Da costruire: il tocco-deviazione come gesto dedicato.
- **LMV-029 Sponda Offensiva:** non rappresentata come giocata a sé (spalle alla porta, tocco unico verso un compagno); vicina a `onetwo`/sponda aerea ma da progettare.
- **LMV-030 Pressione Offensiva:** coperta dall'AI off-ball (pressing F3, press+cover F11, chiusura linea F10) sul lato giusto; manca la **pressione del protagonista** come highlight giocabile (oggi l'eroe pressa solo negli HL difensivi `tackle`/`recover`).

Comune: **non validati** timeline/Semantic/Narrative/post-highlight.

### LMV-024/025/026/027 — copertura attuale (sintesi)

- **LMV-024 Punizione:** ben coperto — intento/hlType `freekick`, traiettoria = decisione (F6), **barriera** di 3 difensori tra palla e porta, set-piece con pressing/corse sospesi. Manca validazione di schema corto/inserimenti.
- **LMV-025 Rigore:** ben coperto — hlType `penalty`, variant `penalty_panenka` (cucchiaio), traiettoria = decisione (F6), reazione portiere (`gkSaveMesh`/`gk_dive`) + uscita angolo (F13), area sgomberata sul set-piece. Il duello tiratore↔portiere c'è; da validare il realismo del tuffo.
- **LMV-026 Angolo:** parziale — l'inserimento aereo in area esiste (insertion/header, F7/F12), ma il **corner come battuta dedicata** (battitore alla bandierina + occupazione area) non è una Situation a sé robusta.
- **LMV-027 Rimessa Laterale:** non coperto — nessuna meccanica di rimessa laterale nel flusso HL; nuova Situation da progettare.

Comune: **non validati** timeline/Semantic/Narrative/post-highlight. Punizione e rigore sono i set-piece meglio supportati grazie a F6/F13.

### LMV-020/021/022/023 — copertura attuale (sintesi)

- **LMV-020 Attacco della Profondità:** intento `through`/`insertion` + corse in profondità nel canale libero (F3) + outcome `offside` nel Decision Engine; il timing "sul filo del fuorigioco" e la reazione della linea difensiva non sono validati.
- **LMV-021 Ricezione / LMV-022 Controllo Orientato:** parzialmente nel beat `assist_recv` (il ricevente controlla prima di concludere), ma **non come Situation autonome col protagonista che riceve/orienta** — oggi la ricezione è un beat intermedio, non un highlight a sé.
- **LMV-023 Seconda Palla:** i post-arco `hit_post`/`deflect`/respinta generano palloni vaganti, ma **non c'è una fase di conquista della seconda palla** giocabile/scriptata → nuova meccanica da progettare.

Comune: questi 4 spingono verso **highlight a protagonista non-conclusore** (ricezione, controllo, palla vagante) che il flusso attuale (HL centrato sulla conclusione dell'eroe) non rappresenta come Situation autonome. **Non validati:** timeline/Semantic/Narrative/post-highlight.

### LMV-017/018/019 — copertura attuale (sintesi)

- **LMV-017 Uno-Due:** intento `onetwo` (give_and_go/wall_pass) presente; ma il pattern richiede che **l'eroe passi e riceva di nuovo** inserendosi — il flusso HL attuale modella l'eroe che passa a un compagno che conclude, **non** il ritorno sull'eroe → da costruire (Timeline + chaining).
- **LMV-018 Smarcamento:** l'off-ball AI F3 ha già attaccanti che corrono nel **canale più libero** (smarcamenti reali) + smarcamenti pre-action (CINE-4); manca la garanzia "intenzione evidente anche senza ricezione" + reazione del marcatore validate.
- **LMV-019 Inserimento:** ben allineato — intento `insertion`, inserimenti aerei (F12), attacco primo/secondo palo (F3); manca la validazione di **sincronizzazione** col portatore e del timing (no fuorigioco involontario).

Comune: **non validati** timeline/Semantic/Narrative/post-highlight (dipendono dal layer Event+Timeline; LMV-017 anche dal chaining).

### LMV-014/015/016 — copertura attuale (sintesi)

- **LMV-014 Lancio Lungo:** esiste a livello di intento (`through`/lancio) e nei testi delle situations ("Lancio lungo", "Lancio millimetrico"); manca un'esecuzione **aerea a lunga gittata** distinta dal passaggio corto (il rischio "sembra un passaggio corto" — errore critico di LMV-014 — è reale e da collaudare).
- **LMV-015 Cambio di Gioco:** intento `switch` presente in `deriveIntent` + situations dedicate ("Cambio gioco rapido 50 metri"); il requisito "il pallone attraversa **realmente** il campo" e lo scivolamento difensivo verso il nuovo lato non sono validati.
- **LMV-016 Triangolazione:** vicino a `onetwo` (give_and_go/wall_pass) ma LMV-016 richiede **2-3 passaggi multi-attore** con movimento senza palla — il flusso HL a singola Situation non rappresenta una vera sequenza multi-passaggio (serve Timeline + chaining).

Comune a tutti e tre: **non validati** timeline/Semantic/Narrative/post-highlight; tutti dipendono dal layer Event+Timeline (e LMV-016 anche dal chaining multi-attore).

### LMV-013 (Tentativo di Assist) — copertura attuale

Ben coperto sul lato esecuzione: è il caso d'uso centrale del passaggio offensivo — qualità decisa dal motore (F9: profondità scatto + pace), beat di **ricezione** (`assist_recv`) → conclusione (`assist_shot`), il compagno **scatta nello spazio** e la palla è giocata sulla corsa, **boomerang risolto** (5.14/5.22, outcome vietato da LMV-013). Regia `THROUGH_BALL`/`COMBINATION` (CINE-5). Distinzione da LMV-003: l'assist ha **finalità offensiva** (porta in inquadratura nella fase finale) — nel codice si riflette nel post-arco verso la conclusione, non in un flag esplicito. **Non validati automaticamente:** timeline a 7 fasi, Semantic ("crea un'occasione da gol?"), reazione difensori/portiere garantita, Narrative, presenza post-highlight con conclusione.

### LMV-012 (Tentativo di Contropiede) — copertura attuale

A livello di dati le situations di contropiede/ripartenza esistono ("Contropiede! Campo aperto", "Contropiede avversario", "Rimessa dal portiere — verticale") e l'AI off-ball ha una **transizione attacco↔difesa** (F2/F3) col baricentro che scorre col possesso. **Limite strutturale forte:** un highlight è una singola Situation interattiva — la **velocità/transizione multi-fase** richiesta da LMV-012 (recupero → accelerazione → sviluppo verso porta) non è realmente rappresentata come sequenza continua; il chaining HL→HL è il meccanismo più vicino ma il gate non lo copre. È il validator che più mette in luce il bisogno del **layer Timeline + chaining osservabile**. **Non validati:** ritmo elevato, rientro difensivo, timeline, Semantic, Narrative, post-highlight.

### LMV-011 (Tentativo di Protezione del Pallone) — copertura attuale

Copertura debole: non esiste un hlType dedicato alla protezione. Tracce: il Decision Engine prevede esiti `shielded_out` (dribbling) e i beat `hold`/`slow` in `buildHLTimeline`; l'AI off-ball produce pressione (F3) e raddoppio (F11) attorno al portatore, che è il presupposto della protezione. **Manca tutto il cuore di LMV-011:** il gesto di *schermatura col corpo* (spalle al difensore, pallone sul lato opposto), il duello fisico leggibile, l'attesa-supporto. È un buon candidato per una **nuova Situation/variant dedicata** (protezione) una volta presente il layer Event+Timeline. **Non validati:** timeline, Semantic, Narrative, post-highlight, pressione garantita.

### LMV-010 (Tentativo di Progressione) — copertura attuale

Coperto a livello di **intento**: `progression`/`run` in `deriveIntent` + esecuzione decisa (`carry_drive`/`burst`/`cut_inside`) con esito `advance`/`stopped`/`lost`. Rendering: shape-flow del reparto col pallone (F3), compagni che offrono linee e avversari che accorciano (F2/F3), regia per pattern `THROUGH_BALL`/dribble (CINE-5). **Punto debole noto:** lo *scopo tattico evidente* (LMV-010 vieta la "corsa casuale") e la conduzione continua leggibile dipendono dal render-loop non collaudato; il distacco progressione↔dribbling (LMV-010 vs LMV-002) è nei dati ma non validato visivamente. **Non validati:** timeline, Semantic, Narrative, post-highlight, "scopo tattico".

### LMV-009 (Tentativo di Recupero del Pallone) — copertura attuale

È il validator più legato alle slice AI off-ball recenti: pressing (F3), transizione attacco↔difesa con la squadra che si compatta e arretra senza possesso (F2/F3), press+cover (F11) e chiusura della linea di passaggio (F10) — proprio il "comportamento collettivo coordinato" di LMV-009. Intento `recover` in `deriveIntent`. **Forte avvertenza:** è esattamente l'area **non validata dal gate** (movimento off-ball) e **non collaudata dal vivo** — il rischio di pressing incoerente/ammucchiato è reale. È il candidato n.1 per il collaudo visivo. **Non validati automaticamente:** coordinamento del pressing, "il più vicino reagisce per primo", timeline, Semantic, Narrative, post-highlight.

### LMV-008 (Tentativo di Parata) — copertura attuale

Rendering: parata con `gkSaveMesh` + `gk_dive` (tuffo del portiere), direzione tuffo `oppDiveDir`, celebrazione parata, e — importante per LMV-008 — l'esito "save" deciso dal motore (`hlOutcomeKind`), con il portiere che esce a stringere l'angolo (F13) e reagisce su tiro/rigore/testa. La direzione del tuffo segue l'esito → riduce il rischio "tuffo nella direzione opposta" (outcome vietato). **Non validati automaticamente:** tempo di reazione/sincronia tuffo↔pallone, posizione iniziale plausibile, timeline, Semantic, Narrative, "pallone non attraversa il portiere", post-highlight. Lato HL la parata è una *reazione* a una conclusione dell'eroe; come Situation autonoma (parata come highlight protagonista) non è prevista dal flusso attuale.

### LMV-007 (Tentativo di Intercetto) — copertura attuale

Concettualmente coperto a livello di **intento**: `deriveIntent` distingue `intercept`/`anticipate`/`recover`, e l'AI deliberativa **F10** chiude la *linea di passaggio più pericolosa* (proprio la "chiusura della linea" di LMV-007). Su passaggio fallito l'esito mira l'avversario che intercetta (fix 5.14) + post-arco `opp_intercept`. **Punto debole:** la *lettura/anticipo* (fasi 1-2) come gesto leggibile del difensore non è scriptata; il distacco netto contrasto↔intercetto (LMV-006 vs LMV-007) esiste nei dati ma non è validato a livello visivo. **Non validati:** timeline, Semantic, Narrative, "deviazione solo dopo contatto", post-highlight.

### LMV-006 (Tentativo di Contrasto) — copertura attuale

Rendering: hlType `tackle` con animazione dedicata (CINE-VAR), e soprattutto il **fix coerenza tackle 5.23** che in un HL difensivo aggancia la palla all'**avversario portatore** (non all'eroe) — coerente col requisito LMV-006 "il difensore tenta di recuperare". Post-arco esito tackle (recupero/fallo). **Punto debole noto:** le fasi 2-3 (avvicinamento + scelta del momento) e la reazione dell'attaccante dipendono dall'AI off-ball generica, non da un duello difensivo scriptato → da collaudare dal vivo. **Non validati:** timeline, Semantic, Narrative, post-highlight, "no attraversamento avversario".

### LMV-005 (Tentativo di Colpo di Testa) — copertura attuale

Rendering: variant testa (`header_diving`/`near_post`/`far_post`) con traiettoria = qualità decisa dal motore (F7), regia dedicata per variant (CINE-2), e soprattutto l'**invariante CINE testa⇒palla aerea** (validato dal gate, `data-coherence`, FAIL bloccante) che garantisce il requisito chiave di LMV-005 (testa solo su pallone aereo). Stato-palla `aerial` derivato da `hlBallState`. **Non validati automaticamente:** elevazione/salto credibile, contrasto aereo garantito del difensore, timeline a 8 fasi, Semantic, Narrative, post-highlight. La fase 4 (elevazione) e il contrasto aereo sono i punti più a rischio da collaudare dal vivo.

### LMV-004 (Tentativo di Tiro) — copertura attuale

Rendering ben coperto: variant tiro decise dal motore (F4: power/curled/first_time/chip/one_on_one) + traiettoria = conseguenza della qualità (F4: pace/precisione/altezza), volée aerea (F12), regia dedicata per variant (CINE-2), reazione portiere (`gkSaveMesh`/`gk_dive`) e uscita sull'angolo (F13), post-arco `in_net`/`hit_post`/`deflect` con esito deciso dal motore (`hlOutcomeKind`, mai "in rete" su fallimento). Outcome vietati "boomerang"/"in rete su miss" già prevenuti. **Non validati automaticamente:** timeline a 7 fasi, Semantic ("è una conclusione verso la porta?"), reazione portiere garantita, Narrative, presenza post-highlight, sincronia cronaca↔animazione.

### LMV-003 (Tentativo di Passaggio) — copertura attuale

È il validator meglio coperto dal rendering: qualità del passaggio decisa dal motore (F9 → profondità scatto + pace), beat di **ricezione** visibile (`assist_recv`), il compagno **scatta** e la palla è giocata sulla corsa, e soprattutto l'**effetto boomerang è già risolto** alla radice (fix 5.14/5.22) — un outcome esplicitamente vietato da LMV-003. Post-arco `assist_recv→assist_shot`. **Non validati automaticamente:** timeline a 8 fasi, Semantic ("sta servendo un compagno?"), identificabilità garantita del destinatario, Narrative, presenza post-highlight. Il "no boomerang" andrebbe trasformato in **caso di regressione permanente** (Regression Suite) — è il candidato ideale per il primo validator automatico una volta presente il layer Event+Timeline.

### LMV-002 (Tentativo di Dribbling) — copertura attuale

Rendering: varianti dribbling decise dal motore (`dribble_feint`/`inside`/`outside`, F-engine), regia ravvicinata dedicata (CINE-5), palla laterale a fine azione, post-arco dribbling-gol → rete. Punto debole noto e rilevante per LMV-002: il **confronto col difensore** (Fase 2/5) è affidato all'AI off-ball generica (pressing/marcatura F3 + deliberativa F10/F11), non a un duello 1v1 scriptato e leggibile → da collaudare dal vivo. **Non validati:** timeline, Semantic ("è un tentativo di superare l'uomo?"), reazione difensore garantita, Narrative, post-highlight.

### LMV-001 (Tentativo di Cross) — copertura attuale

Il motore copre già diversi requisiti *a livello di rendering* (non validati dal gate dal vivo): varianti cross decise dal motore (F5/F8), traiettoria = conseguenza della decisione (F5), regia per-pattern del cross (CINE-5: FAR_POST/CUTBACK/NEAR), reazioni difensive deliberative (F10/F11), uscita portiere (F13), post-arco `cross_goal`. **Non ancora validati automaticamente:** timeline a 9 fasi, eventi obbligatori/vietati, Semantic ("è riconoscibile come cross?"), Narrative (storia completa), presenza del post-highlight, sincronia cronaca↔animazione. → richiede il layer Event+Timeline + un Semantic Validator per-Situation.
