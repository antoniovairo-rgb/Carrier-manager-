# LIVE_MATCH_QA_SPEC.md

Specifica tecnica della **Live Match Quality Platform (LMQP)**.

> Documento vivo, organizzato per capitoli. Si conforma alla charter `MASTER_PROMPT.md`.

---

## Capitolo 3.1 — Architettura Generale della Live Match Quality Platform (LMQP)

### Obiettivo

La Live Match Quality Platform (LMQP) è una piattaforma **indipendente dal gameplay**, progettata per validare automaticamente il Live Match Engine durante tutto il suo ciclo di vita.

LMQP **NON** è un insieme di test.

LMQP è un sistema completo di:

- validazione
- debugging
- replay
- raccolta dati
- analisi delle regressioni
- monitoraggio prestazionale
- analisi qualitativa
- supporto allo sviluppo

Ogni modifica al Live Match Engine dovrà poter essere verificata automaticamente attraverso questa piattaforma.

---

### Filosofia Architetturale

LMQP deve essere **completamente separata** dal codice di gameplay.

Il gameplay non deve conoscere il framework QA. Al contrario, sarà LMQP ad osservare il comportamento del gameplay tramite API dedicate, eventi e strumenti di diagnostica.

Questa separazione garantisce:

- modularità;
- manutenibilità;
- possibilità di disattivare completamente il framework in produzione;
- basso impatto sulle prestazioni della build finale.

---

### Principi Architetturali

**Single Responsibility** — ogni componente svolge una sola funzione.

| Componente | Funzione |
|---|---|
| Replay Engine | registra e riproduce |
| Validator Engine | valida |
| Dashboard | visualizza |
| Failure Collector | raccoglie evidenze |

Mai creare componenti che svolgano più responsabilità.

**Event Driven** — il framework non interroga continuamente il motore: reagisce agli **eventi** emessi dal Live Match Engine. Esempi:

`BallReceived` · `PassStarted` · `ShotStarted` · `CrossStarted` · `BallTouched` · `Goal` · `Save` · `AnimationStarted` · `AnimationFinished` · `HighlightStarted` · `HighlightCompleted` · `CameraChanged` · `PlayerCollided`

Ogni validator dovrà utilizzare questi eventi.

**Deterministic Execution** — ogni highlight deve poter essere ricostruito integralmente. Un **Seed** determina: posizione iniziale, giocatori coinvolti, meteo, stato della partita, comportamento IA, telecamera, animazioni. Lo stesso Seed produce sempre lo stesso risultato.

**Observable System** — ogni componente del Live Match Engine deve essere osservabile. LMQP deve poter conoscere in qualsiasi momento: stato del pallone, stato dei giocatori, animazione corrente, camera attiva, evento in corso, validator attivi. Il motore non deve mai diventare una "black box".

---

### Macro Architettura

```
                Live Match Engine
                       │
                       ▼
                    QA Core
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
    Replay         Validator      Performance
    Engine          Engine          Monitor
        │              │               │
        ▼              ▼               ▼
    Timeline        Failure        Resource
    Engine         Collector       Analyzer
        │
        ▼
    Dashboard
        │
        ▼
    AI Vision Layer (opzionale)
```

Ogni modulo dovrà essere indipendente. Nessun modulo dovrà conoscere l'implementazione interna degli altri. La comunicazione avviene tramite **eventi** o **interfacce pubbliche**.

---

### Componenti Principali

**QA Core** — il cuore della piattaforma. Responsabilità: avvio dei test, caricamento dei Seed, coordinamento dei moduli, gestione del ciclo di vita dei test, gestione delle modalità QA. Il QA Core **NON** deve implementare logica calcistica.

**Replay Engine** — registrare gli highlight, ricostruirli, consentire il replay, salvare la timeline.

**Validator Engine** — verificare il comportamento degli highlight, applicare validator specifici, produrre warning / FAIL / score.

**Timeline Engine** — registrare cronologicamente tutti gli eventi. Esempio:

```
0.0  ReceiveBall
0.6  ControlBall
1.2  Run
2.1  Cross
3.4  Header
4.2  Goal
5.0  Celebrate
```

**Failure Collector** — quando un validator fallisce, raccoglie automaticamente: Seed, log, screenshot, video, timeline, stato dei giocatori, stato della palla, stato della camera. Obiettivo: rendere ogni bug immediatamente riproducibile.

**Dashboard** — visualizzare: stato dei test, statistiche, regressioni, score, report, video, replay. La Dashboard **NON** deve contenere logica di validazione.

**Performance Monitor** — monitorare: FPS, CPU, RAM, utilizzo GPU (quando disponibile), memoria del browser, processi, eventuali leak.

**AI Vision Layer** (opzionale) — non fa parte della pipeline critica. Analizza screenshot o brevi clip degli highlight per una valutazione qualitativa. Non determina automaticamente il PASS/FAIL, ma aggiunge osservazioni sulla qualità percepita.

---

### Lifecycle di un Test

1. Inizializzazione della modalità QA.
2. Caricamento del Seed.
3. Avvio del Live Match Engine.
4. Registrazione degli eventi.
5. Esecuzione dell'highlight.
6. Validazione tecnica.
7. Validazione semantica.
8. Raccolta di screenshot e video.
9. Produzione del report.
10. Cleanup completo.
11. Verifica dell'assenza di processi residui.

Ogni fase dovrà essere tracciata e registrata.

---

### Modularità

Ogni modulo deve poter essere sostituito, aggiornato, esteso, disattivato — senza modificare il resto della piattaforma. (Es.: l'AI Vision Layer sostituibile con un altro modello senza impattare Replay/Validator/Dashboard.)

### Estendibilità

L'introduzione di una nuova Situation non dovrà richiedere modifiche all'architettura. Sarà sufficiente:

- registrare la nuova Situation;
- aggiungere il relativo Validator;
- definire il Seed di test;
- aggiornare il catalogo dei test.

L'intero framework dovrà riconoscere automaticamente la nuova Situation.

---

### Obiettivo Finale

LMQP non è un semplice sistema di test: è una **piattaforma permanente di controllo qualità**.

Ogni nuova funzionalità del Live Match Engine dovrà essere progettata pensando fin dall'inizio a come verrà **osservata, validata, riprodotta e monitorata**.

Il successo della piattaforma non sarà misurato dal numero di test eseguiti, ma dalla capacità di:

- ridurre drasticamente il tempo dedicato ai test manuali;
- intercettare regressioni prima che arrivino all'utente finale;
- fornire agli sviluppatori tutti gli strumenti per comprendere e risolvere rapidamente qualsiasi problema.

---

## Capitolo 3.2 — QA Core

### Scopo

Il **QA Core** è il componente centrale di LMQP, responsabile dell'**orchestrazione** dell'intero processo di validazione del Live Match Engine.

Il QA Core **NON** contiene logica calcistica, **NON** contiene logica di rendering. Coordina esclusivamente: esecuzione dei test, gestione del ciclo di vita, orchestrazione dei moduli, gestione delle risorse, raccolta dei risultati.

### Responsabilità

- inizializzare l'ambiente di test;
- avviare Chromium tramite Playwright;
- caricare il Live Match Engine;
- configurare la modalità QA;
- caricare il Seed;
- coordinare Replay / Validator / Timeline / Failure Collector / Dashboard / Performance Monitor;
- avviare il cleanup finale.

Non deve conoscere il comportamento interno di nessun modulo.

### Obiettivi

Il QA Core deve essere: **deterministico**, **stateless** tra due test consecutivi, **resiliente** agli errori, **estendibile**, **indipendente dal gameplay**.

### Modalità di funzionamento

| Modalità | Descrizione |
|---|---|
| **Single Test** | un solo highlight (debugging) |
| **Batch Mode** | una lista di highlight → report finale |
| **Stress Mode** | migliaia di highlight consecutivi, monitorando memoria/FPS/CPU/processi/leak |
| **Regression Mode** | solo gli highlight associati a regressioni note (pre-PR) |
| **Nightly Mode** | intera suite QA in automatico → report completi |

### Ciclo di Vita

```
Initialize → Environment Check → Health Check → Load Configuration →
Launch Browser → Launch Game → Enable QA Mode → Load Seed →
Initialize Modules → Execute Highlight → Collect Events → Validate →
Generate Report → Cleanup → Health Check → Next Test
```

Ogni stato deve essere tracciabile.

### State Machine

```
IDLE → INITIALIZING → READY → RUNNING → VALIDATING → REPORTING → CLEANUP → COMPLETED
                                                                              └→ ERROR
```

Ogni transizione deve essere registrata nei log.

### Gestione Configurazione

Configurabile tramite **file esterni** (nessun parametro hardcoded): numero worker, timeout, browser, modalità headless, numero massimo highlight, registrazione video, screenshot, log level, AI Review, dashboard, replay.

### Scheduler

Responsabile di: ordinare i test, distribuire i worker, limitare il carico, evitare saturazione CPU/RAM. **Privilegia la stabilità del sistema rispetto alla velocità assoluta.**

### Resource Manager

Monitora di continuo: RAM, CPU, browser, Node, Playwright, Vite, processi figli. Al superamento di soglie configurabili: sospende i test, riduce il parallelismo, esegue cleanup, registra un warning. **Mai compromettere la stabilità del PC.**

### Health Manager

- **Prima** di ogni test: browser esistenti, processi Node, porte occupate, server QA, spazio disco, memoria.
- **Dopo** ogni test: browser residui, processi zombie, leak, memoria, CPU.
- Ogni anomalia va riportata.

### Gestione Errori

Il QA Core non deve terminare l'intera esecuzione per un singolo errore recuperabile. Classificazione: `INFO` · `WARNING` · `ERROR` · `CRITICAL` · `FATAL`. **Solo i FATAL** possono interrompere l'intera suite.

### Recovery

Quando possibile, recupero automatico (ogni recovery registrata):

| Evento | Azione |
|---|---|
| Browser crash | riavvia browser |
| Timeout | riavvia test |
| Dev Server KO | riavvia server |
| Validator crash | isola il validator, continua gli altri test |

### Logging

Log strutturati per ogni operazione importante. Ogni log: `timestamp`, `modulo`, `livello`, `seed`, `Situation`, `Action`, `Outcome`, `durata`. Facilmente filtrabili.

### Performance

Obiettivi: avvio rapido, basso consumo RAM/CPU, nessun processo duplicato, nessun browser orfano, nessun worker inutile. Preferire il **riutilizzo** delle risorse.

### Thread Safety

Ogni modulo indipendente. Nessuno stato mutabile condiviso. Ogni worker termina senza influenzare gli altri.

### API Pubbliche

Esposte e documentate: `avvio test`, `stop test`, `pausa`, `resume`, `caricamento seed`, `caricamento suite`, `stato corrente`, `statistiche`, `progressione`, `report`.

### Integrazione con gli altri moduli

Comunica **esclusivamente tramite interfacce pubbliche**. Mai accedere allo stato interno dei moduli. Ogni componente sostituibile senza modificare il QA Core.

### Definition of Done

Il QA Core è completo quando: coordina correttamente tutti i moduli; esegue suite complete; non lascia processi aperti; produce report affidabili; gestisce recovery automatico; resta stabile in test prolungati; è estendibile senza modifiche invasive.

> Qualsiasi scelta implementativa privilegia **affidabilità, osservabilità, modularità e manutenibilità** rispetto alla sola velocità di sviluppo.

---

## Capitolo 3.3 — Highlight Generator & Scenario Generator

### Obiettivo

L'**Highlight Generator** genera automaticamente gli scenari di test del Live Match Engine. Non crea nuove meccaniche di gioco: costruisce migliaia di **situazioni riproducibili** per verificare sistematicamente il comportamento del motore. È il principale **sostituto del testing manuale**.

### Principi

Deterministico · configurabile · estendibile · riproducibile · indipendente dal gameplay. Ogni highlight generato deve poter essere ricostruito tramite **Seed**.

### Obiettivi

Generare highlight casuali e mirati; riprodurre bug; coprire tutte le Situation, tutte le Action, tutti gli Outcome.

### Tipologie di generazione

| Tipo | Descrizione |
|---|---|
| **Random** | completamente casuale (stress test) |
| **Guided** | guidata da regole (es. `Cross → solo ali → fascia destra → pressione alta → pioggia`) |
| **Exhaustive** | sistematica: `Situation × Action × Outcome × Meteo × Zona × Difficoltà × Tattica` |
| **Regression** | rigenera solo scenari che in passato hanno prodotto FAIL |
| **Targeted** | solo una categoria (solo cross / solo rigori / solo parate / solo dribbling) |

### Seed Engine

Ogni highlight ha un identificatore univoco. Il Seed determina: posizione giocatori, meteo, minuto, pressione, animazioni, IA, telecamera, ordine eventi. Lo stesso Seed → sempre lo stesso highlight.

### Scenario Builder

Ogni scenario (= intero caso di test) è composto da:

```
Situation → Context → Participants → Action → Expected Outcome → Validators → Replay → Report
```

### Parametri configurabili

competizione · squadra · modulo · tattica · livello IA · intensità · meteo · illuminazione · stadio · minuto · punteggio · stamina · morale · forma.

### Copertura

Il framework misura automaticamente la copertura. Es.: `Cross — previsti 250 · eseguiti 250 · PASS 248 · FAIL 2 · coverage 100%`.

### Eliminazione duplicati

Due scenari sono duplicati se verificano **esattamente lo stesso comportamento**. Il sistema massimizza la varietà, evitando scenari equivalenti.

### Priorità

- **Alta:** nuove funzionalità · bug recenti · regressioni.
- **Media:** funzionalità esistenti.
- **Bassa:** stress casuale.

### Catalogo delle Situation

Catalogo centrale; ogni nuova Situation registrata automaticamente con: nome, categoria, validator, animazioni, outcome validi, outcome non validi, seed consigliati.

### Generazione combinatoria

Genera automaticamente tutte le combinazioni compatibili (es. `Cross × Cross alto × Goal × Rain × Hard × seed 54382911 → Generate Test`).

### Vincoli

Mai produrre scenari **impossibili** — le regole calcistiche vanno rispettate (es. `Rigore → centrocampo` NO; `Corner → centrocampo` NO; `Rimessa laterale → centro area` NO).

### Scenario Score

Ogni scenario riceve un punteggio (rarità, complessità, rischio regressione, criticità, storico bug). Gli scenari più importanti vengono eseguiti per primi.

### Evoluzione automatica

Ogni bug corretto → il relativo scenario viene aggiunto automaticamente alla **Regression Suite**. Il framework migliora di continuo.

### Scenario Library

Tutti gli scenari salvati in una libreria consultabile: cercabili, filtrabili, rieseguibili, confrontabili, esportabili.

### Obiettivo finale

Passare da un approccio manuale (esecuzione casuale di partite) a un sistema automatizzato che costruisce e valida migliaia di scenari riproducibili. L'obiettivo **non** è il numero di test, ma **massimizzare la probabilità di individuare regressioni minimizzando il tempo dello sviluppatore**. Ogni nuova funzionalità del motore deve poter diventare automaticamente uno scenario di test permanente.

---

## Capitolo 3.4 — Validator Engine

### Scopo

Il **Validator Engine** determina se un highlight è corretto sul piano **tecnico, logico, narrativo, calcistico e visivo**. Non basta che il codice giri senza errori: l'obiettivo è stabilire se l'highlight **rappresenta realmente la Situation prevista**. Un highlight tecnicamente corretto è comunque **FAIL** se non comunica chiaramente l'azione calcistica (coerente con la filosofia «Every Highlight Must Tell a Story»).

### Obiettivi

Validare automaticamente ogni highlight; individuare regressioni; classificare i problemi per gravità; produrre **score oggettivi**; fornire evidenze per il debugging; ridurre drasticamente le verifiche manuali.

### Principi

Modulare · estendibile · indipendente dal gameplay · deterministico · configurabile. Ogni validator si aggiunge **senza modificare** quelli esistenti.

### Architettura — pipeline di validator indipendenti

Ogni validator analizza **un solo aspetto**.

```
Highlight → Technical → Event → Timeline → Ball → Player → Camera →
Semantic → Football Intelligence → Cinematic → Motion → Score Aggregator → PASS/WARNING/FAIL
```

Ogni validator produce: score, warning, errori, suggerimenti, dati diagnostici. Il risultato finale combina tutti i validator.

| Validator | Responsabilità (sintesi) |
|---|---|
| **Technical** | assenza errori tecnici: eccezioni JS, Three.js/WebGL, timeout, freeze, perdita rendering, mesh invalide, coord NaN, asset mancanti, animazioni corrotte. `CRITICAL`/`FATAL` → fail immediato |
| **Event** | tutti gli eventi obbligatori emessi (es. `ReceiveBall→…→CrossStart→BallKick→CrossCompleted→Header→Goal→Celebrate`). Eventi mancanti → FAIL; inattesi → WARNING/FAIL |
| **Timeline** | sequenza temporale: ordine corretto, durate plausibili, niente salti, niente eventi impossibili (es. `Goal→Cross`, `Header→Cross` vietati) |
| **Ball** | esistenza, visibilità, traiettoria, velocità/accel/decel, collisioni, permanenza in campo, destinazione finale, coerenza con l'azione; la palla raggiunge realmente destinatario/porta/portiere |
| **Player** | orientamento, posizione, velocità, animazione attiva, continuità, piedi a terra, niente teletrasporti/compenetrazioni; protagonista guarda l'azione, compagni/avversari/portiere reagiscono |
| **Camera** | protagonista e palla sempre visibili, momento decisivo inquadrato, no clipping / camera sotto-campo / inquadrature vuote / tagli immotivati |
| **Semantic** ⭐ | **il più importante**: l'highlight racconta davvero la Situation (beat: ricezione→controllo→avanzamento→preparazione→impatto→traiettoria→arrivo in area→reazioni→conclusione→post-highlight). Se manca un passaggio fondamentale → FAIL. **Ogni Situation avrà un Semantic Validator dedicato** |
| **Football Intelligence** | credibilità calcistica (non grafica): il centravanti attacca l'area? i difensori marcano in modo plausibile? il portiere legge la traiettoria? movimenti/tattica coerenti? → *Football Intelligence Score* |
| **Cinematic** | qualità narrativa: azione comprensibile? protagonista evidente? momento decisivo ben mostrato? finale chiaro? post-highlight conclude? → *Cinematic Score* |
| **Motion** | qualità del movimento: fluidità, continuità, naturalezza, ritmo, transizioni, niente scatti → *Motion Score* |

### Score Aggregator

Ogni validator restituisce uno tra: `PASS` · `INFO` · `WARNING` · `MINOR` · `MAJOR` · `CRITICAL` · `FATAL`. Lo Score Aggregator combina tutto. Il **PASS finale NON dipende solo dall'assenza di errori tecnici**: serve la compresenza di correttezza tecnica + logica + coerenza narrativa + credibilità calcistica + qualità visiva.

### Sistema di punteggio

Ogni highlight produce: Technical · Event · Timeline · Ball · Player · Camera · Semantic · Football Intelligence · Cinematic · Motion Score. Il report mostra **sia il dettaglio sia uno score complessivo**.

### Failure Package

Ad ogni FAIL il framework raccoglie automaticamente: Seed, Situation, Action, Outcome, validator coinvolto, motivazione, timeline completa, screenshot, video, log, stato camera/palla/giocatori. Obiettivo: **ogni problema immediatamente riproducibile**.

### Estendibilità

Ogni nuova Situation registra automaticamente: il proprio validator, gli eventi attesi, la timeline, i controlli specifici. Nessuna modifica strutturale per supportare nuove Situation.

### Definition of Done

Completo quando: ogni Situation ha ≥1 Semantic Validator dedicato; tutti i validator sono indipendenti; ogni FAIL ha evidenze sufficienti; gli score sono oggettivi e confrontabili nel tempo; aggiungere Situation richiede solo registrare nuovi validator.

---

## Capitolo 3.5 — Replay Engine & Replay Debugger

### Scopo

Il **Replay Engine** registra integralmente l'esecuzione di ogni highlight. L'obiettivo **non** è produrre un video, ma consentire la **ricostruzione completa** dell'highlight: ogni test deve poter essere analizzato, riprodotto e ispezionato **frame per frame**.

### Obiettivi

Riprodurre qualsiasi highlight; analizzare qualsiasi bug; confrontare due versioni dello stesso highlight; ricostruire la timeline completa; osservare l'evoluzione dello stato del motore.

### Principi

Deterministico · leggero · indipendente dal rendering · esportabile · sincronizzato col Seed Engine.

### Modalità di registrazione (3 livelli)

| Livello | Tipo | Uso |
|---|---|---|
| **1** | Replay video (MP4/WebM) | revisione visiva |
| **2** | Replay logico (sequenza eventi) | es. `ReceiveBall→Run→Cross→Header→Goal→Celebrate` |
| **3** | Replay Debugger (stato completo del motore) | solo debugging |

### Stato registrato (per ogni frame)

- **Tempo:** timestamp, frame, deltaTime
- **Hero:** posizione, rotazione, velocità, animazione, stamina, stato
- **Pallone:** posizione, velocità, accelerazione, rotazione, possessore
- **Giocatori coinvolti:** posizione, orientamento, animazione, stato, velocità
- **Camera:** posizione, target, zoom, modalità, rotazione
- **Eventi:** tutti (es. `AnimationStarted→CrossStarted→BallKicked→Goal→Celebrate`)

### Timeline

Costruita automaticamente (es. `0.00 ReceiveBall · 0.45 ControlBall · 1.20 Run · 2.10 Cross · 3.35 Header · 4.20 Goal · 5.00 Celebrate`), consultabile dalla Dashboard.

### Replay Debugger

Strumento principale di analisi: avanzare frame per frame, tornare indietro, saltare a un evento, fermare, ispezionare lo stato del motore.

### Overlay Debug (abilitabile/disabilitabile)

Hero · animazione · velocità · ball · possessore · camera · validator · evento corrente.

### Sincronizzazione

Replay video, replay logico, timeline, log e validator **perfettamente sincronizzati**: cliccando un evento nella timeline ci si posiziona sul frame corrispondente.

### Snapshot & Confronto

Snapshot = stato completo (motore, camera, validator, palla, giocatori). Usati per **confrontare due versioni** dello stesso highlight (camera/traiettoria/animazione/durata diverse) → primo livello del sistema di **Regression Detection**.

### Failure Replay

Ad ogni FAIL il Replay Engine salva automaticamente: replay, video, timeline, log, snapshot iniziale e finale → bug immediatamente riproducibile.

### Esportazione & Performance

Export: replay proprietario, JSON (stato logico), video, screenshot. La registrazione **non deve compromettere il frame rate** ed è configurabile (completa / solo eventi / solo video / solo FAIL).

### Estendibilità & Definition of Done

Nuovi dati diagnostici aggiungibili senza modificare il formato dei replay esistenti. **DoD:** ogni highlight riproducibile; ogni FAIL genera un replay; timeline navigabile; replay sincronizzato con log/validator; confronto che evidenzia le differenze; individuazione rapida della causa di una regressione.

---

## Capitolo 3.6 — Regression Engine & Regression Gallery

### Scopo

Il **Regression Engine** individua automaticamente le regressioni del Live Match Engine. Una regressione è qualsiasi modifica che **peggiora** il comportamento rispetto a una versione precedente. L'obiettivo non è solo che un test continui a passare, ma determinare se il comportamento è **migliorato, peggiorato o invariato**.

### Filosofia

Ogni modifica va confrontata con una **baseline**, in modo **automatico, riproducibile, oggettivo**. L'utente non deve guardare manualmente centinaia di replay.

### Baseline

Per ogni versione stabile si salva automaticamente: replay, timeline, validator, score, video, screenshot, metriche, log. Ogni nuova esecuzione viene confrontata con essa.

### Tipologie di regressione

| Categoria | Esempi |
|---|---|
| **Tecnica** | nuovi errori JS, crash, timeout, freeze |
| **Logica** | eventi mancanti, ordine sbagliato, timeline incoerente |
| **Visiva** | camera peggiorata, traiettoria diversa, animazioni meno fluide, finale non visibile |
| **Calcistica** | difensori meno reattivi, portiere meno credibile, cross meno realistico, movimenti incoerenti |
| **Prestazionale** | FPS inferiori, RAM/CPU aumentate, caricamenti più lenti |

### Processo di confronto

Per ogni Seed: (1) eseguire baseline → (2) eseguire nuova versione → (3) confrontare → (4) classificare le differenze. Completamente automatico.

Oggetti confrontati: timeline, eventi, traiettoria palla, movimenti giocatori, animazioni, camera, validator, score, durata, performance.

### Livelli di severità

`INFO` · `WARNING` · `MINOR` · `MAJOR` · `CRITICAL` · `FATAL`. **CRITICAL/FATAL** possono bloccare automaticamente la pipeline CI/CD.

### Regression Gallery

Galleria consultabile dalla Dashboard; per ogni regressione: versione precedente → corrente → differenze → motivazione → score → validator coinvolti → replay → video → timeline. Obiettivo: capire **immediatamente cosa è cambiato**.

### Visual & Score Comparison

Confronto sincronizzato di due replay (riproduzione affiancata, sync via Seed, frame-by-frame, confronto timeline/camera/traiettorie). Per gli score: confronto automatico con variazione percentuale (es. `Motion Score 8.4 → 9.1 = +8.3%`).

### Regressioni storiche & integrazione

Storico con: data, commit, Seed, Situation, Action, Outcome, causa, stato (`aperta`/`risolta`/`riaperta`) — evita di correggere più volte lo stesso problema. Ogni regressione è collegata al relativo **Failure Package** (salto diretto a replay/log/screenshot). Dashboard: totali, aperte/risolte, per categoria, per Situation, andamento nel tempo.

### Definition of Done

Confronta ogni esecuzione con una baseline; individua regressioni tecniche/logiche/visive/calcistiche/prestazionali; produce una Regression Gallery navigabile; evidenzia le differenze tra due versioni; consente di individuare rapidamente l'origine; si integra con Replay/Validator/Failure Collector/Dashboard.

---

## Capitolo 3.7 — Failure Collector

### Scopo

Il **Failure Collector** raccoglie automaticamente tutto il necessario per analizzare un problema rilevato. Non si limita a registrare un errore: crea un **pacchetto completo** che permette di capire subito *cosa* è successo, *quando*, *perché* e *come riprodurlo* — senza ripetere manualmente l'highlight.

### Filosofia

Un bug non deve mai andare perso. Ogni errore produce automaticamente tutta la documentazione per la sua analisi; lo sviluppatore non ricostruisce il contesto a mano.

### Attivazione

Validator FAIL · errore `CRITICAL`/`FATAL` · anomalia rilevata dal Replay Engine · interruzione test dal QA Core · soglie superate dal Performance Monitor.

### Failure Package (contenuto)

- **Identificazione:** ID univoco, timestamp, versione motore, configurazione, modalità QA.
- **Seed:** Seed completo, configurazione iniziale, Scenario, Situation, Action, Outcome → riproduzione esatta.
- **Replay:** replay completo + logico, timeline, snapshot iniziale e finale.
- **Video:** completo + clip focalizzata sull'errore.
- **Screenshot:** inizio, frame dell'errore, frame finale (+ intermedi se serve).
- **Timeline:** completa (timestamp, evento, durata, stato validator).
- **Log:** QA Core, Replay, Validator, Performance Monitor, Live Match Engine.
- **Stato camera/palla/giocatori/validator/performance** (FPS, RAM, CPU, memoria browser, n. processi, durata).

### Classificazione & Priorità

Categorie: tecnico · logico · visivo · calcistico · prestazionale · sconosciuto.

| Priorità | Significato |
|---|---|
| **P0** | blocca completamente il motore |
| **P1** | regressione critica |
| **P2** | problema importante |
| **P3** | difetto minore |
| **P4** | problema cosmetico |

### Struttura cartella (standardizzata)

```
Failure_2026_07_01_153020/
├── metadata.json
├── seed.json
├── replay.lmr
├── timeline.json
├── validators.json
├── performance.json
├── logs/
├── screenshots/
├── video/
└── report.html
```

### Report HTML

Generato automaticamente: riepilogo, replay, screenshot, validator, timeline, log, score, performance → comprendere il problema senza aprire decine di file.

### Integrazione · Compressione · Retention · Estendibilità

Si integra con QA Core / Replay / Validator / Regression Engine / Dashboard / Performance Monitor; **non dipende direttamente dal Live Match Engine**. Compressione automatica dei pacchetti meno recenti (senza perdere riproducibilità). Retention configurabile (es. mantieni sempre i FAIL CRITICAL, elimina i WARNING vecchi, comprimi gli inutilizzati). Nuove info diagnostiche aggiungibili senza modificare la struttura.

### Definition of Done

Ogni FAIL genera un Failure Package; contiene tutto il necessario alla riproduzione; replay+Seed+timeline ricostruiscono l'highlight; il report HTML rende il problema immediatamente comprensibile; riduce drasticamente il tempo di debugging; il pacchetto è archiviabile, condivisibile e rieseguibile.

---

## Capitolo 3.8 — Visual QA Dashboard

> Nota terminologica: questo capitolo introduce il termine **LMDP — Live Match Development Platform** come evoluzione/superset di LMQP (la Dashboard è il punto d'accesso unico). Riportato fedelmente dalla spec.

### Scopo

La **Visual QA Dashboard** è il punto d'accesso principale della piattaforma: non un semplice report dei test, ma una **console di controllo** per monitorare, analizzare, confrontare e debuggare il Live Match Engine da un'unica interfaccia. Elimina la consultazione manuale di log, cartelle, replay e report separati.

### Obiettivi & Principi

Monitorare in tempo reale; vedere lo stato del framework; analizzare i Failure Package; confrontare versioni dello stesso highlight; individuare regressioni; consultare statistiche storiche; rieseguire qualsiasi test con un clic. Deve essere **veloce, intuitiva, modulare, reattiva**, consultabile anche durante l'esecuzione.

### Sezioni

| Sezione | Contenuto |
|---|---|
| **Home** | stato QA Core, test in esecuzione/completati, PASS/WARNING/FAIL, regressioni, CPU/RAM, browser/worker attivi — auto-aggiornate |
| **Test Explorer** | tutti gli highlight (ID, Seed, Situation, Action, Outcome, durata, risultato, score) con ricerca/ordinamento/filtri/raggruppamenti |
| **Highlight Detail** | pagina per highlight: replay, video, timeline, validator, screenshot, log, metriche, score |
| **Timeline Viewer** | eventi cronologici (timestamp, nome, durata, validator) con zoom, ricerca, salto al replay, confronto |
| **Replay Viewer** | Replay Engine integrato: play/pausa/frame-by-frame/salto eventi/velocità/overlay, sincronizzato con Timeline e Validator |
| **Visual Comparison** | due replay affiancati sincronizzati via Seed → differenze camera/movimenti/animazioni/palla/timeline |
| **Validator Explorer** | tutti i validator (stato, score, warning, durata, motivazione) filtrabili per validator/gravità/Situation |
| **Regression Center** | regressioni (categoria, gravità, Situation, versione prec./corr., replay comparativo, validator, Failure Package) |
| **Failure Center** | Failure Package (ID, priorità, categoria, Seed, replay, video, screenshot, log, stato) + riesecuzione immediata |
| **Performance Monitor** | FPS/CPU/RAM/GPU, browser/worker, memoria browser, tempo medio test + grafici storici |
| **AI Review** | risultati AI Vision (Motion/Cinematic/Football Intelligence Score, commenti, criticità) accanto ai validator |

### Funzioni trasversali

- **Search Engine** globale e istantaneo (Seed, Situation, Action, Outcome, validator, errore, Failure Package, replay, regressione).
- **Filtri** multipli combinabili (es. `Situation=Cross AND Outcome=Goal AND Validator=FAIL AND Versione=Ultima Build`).
- **Statistiche** aggregate (totali, tempo medio, Situation più problematica, validator più in FAIL, regressioni per versione, andamento nel tempo).
- **Quality Score** globale del motore = stabilità + correttezza + realismo + leggibilità + Football Intelligence + qualità cinematografica + performance, confrontabile tra build.
- **Esportazione** PDF/HTML/CSV/JSON/screenshot/replay/statistiche.
- **Notifiche** automatiche (regressione, fine suite, FAIL CRITICAL, soglie CPU/RAM, fine Stress Test).
- **Personalizzazione** (layout, widget, temi, dashboard salvate).

### Sicurezza

Strumento **di sola consultazione**: non modifica lo stato del Live Match Engine. Operazioni consentite: riesecuzione test, apertura replay, esportazione report, consultazione risultati.

### Performance

Reattiva anche con 100.000+ highlight, migliaia di Failure Package/replay, milioni di eventi → caricamento progressivo, paginazione, caching, indicizzazione, lazy loading.

### Definition of Done

Punto d'accesso unico; qualsiasi highlight consultabile in pochi secondi; integra Replay/Validator/Regression/Failure Collector/AI Review; confronto facile tra build; regressioni e criticità immediatamente individuabili; elimina la consultazione manuale di cartelle/log/file.

---

## Capitolo 3.9 — AI Vision Review Engine

### Scopo

L'**AI Vision Review Engine** è un modulo **opzionale** che analizza automaticamente screenshot e replay degli highlight tramite modelli di visione artificiale. Non sostituisce i validator tradizionali: **simula il giudizio qualitativo di un QA Tester umano**, valutando ciò che una persona percepisce guardando il replay.

### Obiettivi & Principi

Valutare qualità visiva e leggibilità; individuare comportamenti innaturali e anomalie difficili da cogliere coi validator semplici; fornire suggerimenti qualitativi. **Il Validator Engine decide il PASS/FAIL tecnico; l'AI Vision produce una valutazione aggiuntiva di supporto, mai una prova definitiva.**

### Compatibilità (provider-agnostic)

Architettura indipendente dal fornitore: interfaccia generica **"Vision Provider"** per integrare modelli presenti o futuri. L'implementazione iniziale può usare Claude o altro modello disponibile, ma il framework **non deve dipendere** da uno specifico provider.

### Input / Output

- **Input:** replay completi, clip brevi, screenshot, sequenze di frame, metadata dell'highlight, risultato dei validator.
- **Output:** valutazione generale, punti di forza, criticità, punteggi qualitativi, osservazioni, suggerimenti.

### Analisi prodotte

| Analisi | Valuta | Output |
|---|---|---|
| **Leggibilità** | "un osservatore capisce subito quale azione è?" (no → WARNING) | Readability Score |
| **Regia** | inquadratura, tempi/cambi camera, momento decisivo, visibilità palla/protagonista | Camera Score |
| **Fluidità** | continuità, naturalezza, scatti, animazioni, transizioni | Motion Score |
| **Calcistica** | credibilità movimenti, reazioni compagni/difensori/portiere, sviluppo azione | Football Intelligence Score |
| **Narrativa** | inizio / sviluppo / finale / post-highlight (manca uno → WARNING) | Cinematic Score |

### Identificazione della Situation

Il sistema tenta di identificare la Situation **osservando solo il replay** ("quale azione calcistica è?") e la confronta con quella prevista: una discrepanza significativa segnala un problema di **rappresentazione** (≈ Semantic Validator dal punto di vista percettivo).

### Commenti automatici & Punteggi

Riepilogo sintetico, concreto, azionabile (es. *"L'azione è comprensibile, il cross è ben reso, ma il difensore resta troppo statico e la camera arriva in ritardo sul colpo di testa"*). Punteggi minimi: Overall Quality · Camera · Motion · Football Intelligence · Cinematic · Readability — **confrontabili tra build**.

### Integrazione & Limitazioni

Si integra con Replay/Validator/Regression Engine, Dashboard, Failure Collector; le valutazioni AI sono consultabili accanto ai validator tradizionali. **Limitazioni:** dipendono dalla qualità del modello → non sostituiscono i validator tecnici, **non bloccano la CI/CD**, vanno interpretate come supporto qualitativo.

### Estendibilità & Definition of Done

Nuove categorie d'analisi aggiungibili senza modificare l'architettura; integrazione di futuri modelli multimodali con la stessa interfaccia. **DoD:** analizza replay/screenshot, produce valutazioni coerenti, evidenzia criticità difficili da cogliere, identifica problemi di leggibilità/regia, si integra con Dashboard e Failure Collector, aiuta a migliorare la qualità percepita senza sostituire la validazione tecnica.

---

## Capitolo 3.10 — Football Intelligence Knowledge Base

### Scopo

La **Football Intelligence Knowledge Base (KB)** è la base di conoscenza calcistica della piattaforma: descrive il **comportamento atteso** di giocatori, pallone e dinamiche di gioco. **Non contiene codice né algoritmi**, solo regole calcistiche consumate da Validator Engine, AI Vision Review, Highlight Generator, Regression Engine, Dashboard. È la **fonte ufficiale** della logica calcistica del framework.

### Obiettivi & Principi

Definire il comportamento atteso delle Situation; descrivere le responsabilità tattiche dei ruoli; fornire regole ai validator; rendere coerente l'intero framework. Ogni regola: **chiara, verificabile, estendibile, indipendente dal codice** (descrive il comportamento atteso, non l'implementazione).

### Struttura

Situation · Ruoli · Fasi dell'azione · Regole tattiche · Regole comportamentali · Eccezioni.

- **Situation** — per ognuna: obiettivo, contesto, comportamento atteso, eventi obbligatori, varianti accettabili, condizioni di fallimento.
- **Ruoli** — Portiere · Difensore centrale · Terzino · Mediano · Centrocampista · Trequartista · Ala · Seconda punta · Centravanti; per ciascuno: responsabilità, priorità, comportamento per Situation.

**Esempio — Tentativo di cross:** l'ala protegge palla / cerca spazio / prepara il cross; il centravanti attacca l'area (primo o secondo palo) e conclude; i difensori marcano / intercettano / proteggono; il portiere legge la traiettoria / valuta l'uscita / prepara la parata.

### Fasi dell'azione

Ogni Situation è suddivisa in fasi (es. Cross: `Ricezione → Controllo → Progressione → Preparazione → Cross → Traiettoria → Reazione → Conclusione → Post-Highlight`), ciascuna con regole specifiche.

### Regole comportamentali / tattiche / di credibilità

- **Comportamentali:** chi ha la palla guarda la direzione di gioco; gli avversari reagiscono alla perdita di possesso; i compagni cercano linee di passaggio; il portiere segue la palla; il pallone non cambia direzione senza motivo.
- **Tattiche (minimo atteso):** Difesa (copertura/marcatura/scalata/pressione) · Attacco (smarcamento/profondità/sostegno/inserimento) · Transizione (recupero/pressing/ripartenza).
- **Credibilità:** un cross senza attaccanti in area, un portiere immobile su un tiro, un difensore passivo → riducono la credibilità.

### Varianti & Eccezioni

Più rappresentazioni valide per la stessa Situation (cross alto/teso/rasoterra/arretrato) purché rispettino le regole fondamentali. Le **eccezioni** vanno documentate esplicitamente (rimpalli, deviazioni, errori tecnici, condizioni atmosferiche) e **non** interpretate automaticamente come regressioni.

### Utilizzo, Aggiornamento, Versionamento

I validator **consultano la KB**: le regole non vanno duplicate nel codice; ogni modifica alla logica calcistica avviene nella KB. Ogni nuova Situation del motore deve aggiornare contestualmente la KB (vietato introdurre Situation prive di documentazione calcistica). La KB è **versionata**: ogni modifica riporta autore, data, motivazione, impatto sui validator.

### Definition of Done

Descrive tutte le Situation supportate; definisce il comportamento atteso dei ruoli; è la fonte ufficiale della logica calcistica; è usata da Validator/AI Vision/Highlight Generator; consente di valutare la credibilità delle azioni in modo coerente e verificabile.

---

## Capitolo 3.11 — Performance Monitor & Resource Manager

### Scopo

Il **Performance Monitor** misura, registra e analizza il comportamento prestazionale della piattaforma e del Live Match Engine. Non solo FPS: deve garantire che il framework esegua **migliaia di test consecutivi** mantenendo stabile il sistema e prevenendo degradazioni.

### Obiettivi & Principi

Monitoraggio **continuo, automatico, non invasivo, configurabile**, consultabile dalla Dashboard. Individuare memory leak e processi orfani; misurare tempi/CPU/RAM; produrre report storici; impedire che il framework degradi la stabilità del PC. Ogni metrica confrontabile tra build.

### Metriche monitorate

| Ambito | Metriche |
|---|---|
| **Sistema** | CPU, RAM, disco disponibile/usato dai report, temperatura CPU (se disponibile), n. processi |
| **Browser (Chromium)** | memoria, tempo di vita, n. tab, crash, riavvii |
| **Playwright** | n. browser aperti, test eseguiti, timeout, errori, riavvii |
| **Live Match Engine** | FPS medi/minimi, tempo medio rendering, durata media highlight, durata animazioni, eventi elaborati |
| **QA Framework** | validator eseguiti, tempo medio validator, n. replay, Failure Package creati, regressioni |

### Resource Manager

Impedisce la saturazione. **Prima** di ogni test verifica: memoria/CPU disponibili, browser aperti, processi Node/Playwright/Chromium. Al superamento di soglie configurabili: sospende i test, riduce i worker, esegue cleanup, notifica.

### Memory Leak & Zombie Process Detection

- **Leak:** monitora memoria iniziale / corrente / dopo ogni highlight / dopo ogni batch → segnala incrementi anomali persistenti.
- **Zombie:** a fine suite verifica browser/Node/Playwright/Dev Server/worker residui → registrati, chiusi in modo controllato, riportati nel report.

### Cleanup Manager

Eseguito a fine highlight, a fine batch, **in caso di errore**, in caso di interruzione manuale. Operazioni: chiusura browser e processi figli, eliminazione file/screenshot/video temporanei (configurabile), rilascio memoria.

### Stress Test & Soglie

Supporta test di lunga durata (1.000 / 5.000 / 10.000 highlight, esecuzione continua per ore) con registrazione di tutte le metriche. Soglie configurabili (RAM/CPU max, tempo max test, n. max browser/worker, dimensione max Failure Package) → al superamento: avviso o interruzione, secondo configurazione.

### Report, Dashboard, Integrazione

Report a fine suite: tempo totale, highlight eseguiti, FPS medi, RAM iniziale/finale, CPU media, browser creati/riutilizzati, processi chiusi, leak/anomalie. Dashboard: grafici CPU/RAM/FPS, uso browser, stato worker, memoria framework, confronto tra build. Si integra con QA Core/Replay/Failure Collector/Regression/Dashboard; le **anomalie prestazionali possono generare Failure Package dedicati**.

### Definition of Done

Monitora di continuo le risorse; rileva leak e processi orfani; impedisce la saturazione del PC in test prolungati; produce report dettagliati; si integra con Dashboard e Failure Collector; consente il confronto prestazionale oggettivo tra versioni.

---

## Capitolo 3.12 — Plugin & Extension Architecture

### Obiettivo

La piattaforma deve essere **estendibile**: ogni nuova funzionalità si aggiunge **senza modificare il Core Engine**. Il QA Engine è **aperto all'estensione, chiuso alla modifica** del proprio nucleo (open/closed).

### Principio fondamentale

Il Core Engine **non conosce** i singoli plugin: conosce solo l'**interfaccia comune**, il **ciclo di vita** del plugin e il **risultato prodotto**. Tutta la logica specifica è delegata ai plugin.

### Obiettivi

Aggiungere moduli **senza** modificare il Core, ricompilare il framework, introdurre regressioni o toccare i validator esistenti. Ogni plugin è **indipendente** dagli altri.

### Categorie di plugin supportate

| Categoria | Esempi |
|---|---|
| **Validator Plugin** | nuovi LMV, validator per competizione, sperimentali, personalizzati |
| **AI Review Plugin** | Claude Vision, GPT Vision, Gemini, modelli locali, CV dedicata (cambio provider senza toccare la pipeline) |
| **Camera Plugin** | Broadcast, TV, Tactical, Behind Player, Goal Camera, Drone, Cinematic Replay |
| **Replay Plugin** | rallentato, multi-camera, automatico, cinematico |
| **Competition Plugin** | Serie A, Premier, Champions, Mondiale, tornei custom (regole senza modificare il Core) |
| **Physics Plugin** | fisica palla, vento, pioggia, campi pesanti, condizioni climatiche |
| **Animation Plugin** | nuovi dribbling/tiri/controlli/festeggiamenti (usati automaticamente, senza toccare il codice) |
| **Commentary Plugin** | cronaca IT/EN/AI, testuale, telecronaca vocale |
| **Analytics Plugin** | Heatmap, Expected Goals, Player Rating, Possession, Tactical Report, Motion Quality Report |

### Ciclo di vita del plugin

```
Discovery → Registration → Initialization → Validation → Execution → Result Collection → Cleanup → Unload
```

Ogni fase tracciata nei log.

### Isolamento & Failure Handling

Ogni plugin **completamente isolato**: un suo errore non blocca il QA Engine, non interrompe gli altri plugin, non compromette i test (**degrado controllato**). Su errore: il Core continua, il plugin viene isolato, si genera un **Failure Package**, l'errore appare in Dashboard.

### Versioning & Dependency Management

Ogni plugin dichiara: nome, versione, autore, compatibilità, dipendenze, data di rilascio → il QA Engine verifica la compatibilità **prima** del caricamento. I plugin **non dipendono direttamente tra loro**: comunicano solo via **API pubbliche del Core**; **vietate** le dipendenze circolari.

### Security Model

Esecuzione in ambiente controllato (**minimo privilegio**): un plugin non può modificare il Core, alterare altri plugin, toccare direttamente il database o accedere a componenti non autorizzati.

### Performance & Logging

Ogni plugin dichiara tempo medio di init, consumo memoria, tempo medio di esecuzione → monitorati automaticamente. Log strutturati: plugin, versione, operazione, timestamp, durata, esito.

### Plugin Marketplace (futuro)

Architettura predisposta per un repository centralizzato (validator, replay, AI provider, analytics, moduli grafici, test suite) installabili **senza modifiche strutturali** al Core.

### Extensibility Principle & Definition of Done

Ogni nuova funzionalità va implementata **preferibilmente come plugin**; modificare il Core è **l'ultima risorsa** → più stabilità, meno regressioni, migliore manutenibilità. **DoD:** qualsiasi nuova funzionalità aggiungibile come modulo indipendente, senza modificare il Core, mantenendo compatibilità con validator/QA Engine/AI Review/Replay/Dashboard.

> **Relazione con il cap. 3.13:** il 3.12 definisce l'**architettura a plugin** (categorie, ciclo di vita, isolamento, security); il 3.13 ne è il **complemento operativo** (Configuration First, registries, abstraction layer, configuration validation). Vanno letti insieme.

---

## Capitolo 3.13 — Configuration, Plugin System & Extensibility

### Scopo

La piattaforma deve essere **estendibile**: introdurre nuove Situation, validator, moduli o strumenti non deve richiedere modifiche invasive. Evoluzione continua mantenendo stabilità, modularità e semplicità di manutenzione.

### Principi

Ogni componente: indipendente · configurabile · sostituibile · estendibile · documentato. L'architettura privilegia la **composizione** rispetto all'accoppiamento diretto.

### Configuration First

Tutti i comportamenti configurabili vanno definiti **tramite configurazione**, mai hardcoded quando esprimibili come config: timeout, n. worker, browser, modalità QA, soglie prestazionali, livelli di logging, validator abilitati, replay, dashboard, AI Review.

### Plugin System

Ogni modulo registrabile come **plugin** (Validator Plugin, Replay Plugin, Dashboard Widget, Performance Collector, AI Vision Provider, Report Generator), caricato automaticamente all'avvio.

### Registries (registrazione automatica)

| Registry | Ogni voce definisce |
|---|---|
| **Validator** | id univoco, nome, categoria, Situation supportate, priorità, dipendenze, versione — il QA Core **non** conosce i validator staticamente |
| **Situation** | id, descrizione, categoria, validator associati, eventi attesi, timeline prevista, varianti |
| **Event** | nome, origine, payload, momento di emissione, eventi correlati — i validator lavorano senza dipendere dal codice del motore |

### Abstraction Layers

- **AI Provider Abstraction:** interfaccia astratta → provider sostituibile senza toccare il resto, implementazione configurabile.
- **Report Provider:** generazione indipendente dal formato (HTML/JSON/PDF/CSV/futuri), nuovi formati via plugin.
- **Dashboard Widgets:** widget indipendenti aggiungibili/rimovibili/sostituibili/configurabili; layout non vincolato al codice.

### Configuration Validation & Versionamento

All'avvio: rileva configurazioni mancanti, valori non validi, dipendenze non soddisfatte, plugin incompatibili → errori segnalati chiaramente. Ogni configurazione riporta versione, data, autore, compatibilità; il framework rileva configurazioni obsolete.

### Compatibilità & Estendibilità

Nuove funzionalità non rompono le configurazioni esistenti (quando inevitabile → procedure di migrazione documentate). Aggiungere una Situation richiede **solo**: registrare la Situation, registrare i validator, definire i Seed, aggiornare la Knowledge Base. **Nessuna modifica al QA Core.**

### Logging & Definition of Done

Ogni plugin logga: inizializzazione, stato, errori, tempi, versione (logging uniforme). **DoD:** ogni componente configurabile senza toccare il codice; nuovi plugin senza impatti architetturali; validator/Situation/provider registrati automaticamente; config verificata all'avvio; la piattaforma evolve mantenendo compatibilità e modularità.

---

## Stato di implementazione (mappatura sul codice attuale)

> Sezione di raccordo tra spec e realtà del repo, da aggiornare ad ogni incremento LMQP. Onestà documentale (charter): distinguere ciò che esiste da ciò che è da costruire.

| Modulo LMQP | Stato nel repo | Note |
|---|---|---|
| **QA Core** | 🟡 parziale | `tests/visual/validate-situations.mjs` orchestra il gate (≈ Batch Mode + un solo worker, healthcheck/cleanup basilari). Mancano: modalità Single/Stress/Regression/Nightly, state machine esplicita, config esterna, scheduler/resource-manager, recovery automatico |
| **Highlight/Scenario Generator** | 🟡 parziale | la suite analitica genera già **537 combo** (Situation × Action) deterministiche e il gate forza le 179 situations; mancano: generazione exhaustive multi-asse (meteo/zona/difficoltà/tattica), seed-engine completo, scenario score/priorità, dedup, Scenario Library |
| **Validator Engine** | 🟡 parziale | esistenti (in forma frame-congelato/analitica): Technical (gate cattura errori/FATAL), Ball (`computeArc` fisica palla), Camera (regia per-pattern), Player (movements cap), + Score Aggregator analitico (animazione/fisica_palla/sincronizzazione/regia/post_hl/realismo). **Mancano i pilastri della charter:** Event, Timeline, **Semantic** (per-Situation, ⭐), Football Intelligence, Cinematic, Motion |
| **Observable System** | 🟡 parziale | probe `__CPM_FORCE_SIT` / `__CPM_STATE` / `__CPM_PROBE` / `__CPM_FOOTBALL_STATE` |
| **Deterministic Execution** | ✅ | seed `__CPM_RESEED`, gate `determinism`, golden firma stato |
| **Timeline Engine** | 🔴 da costruire | nessuna registrazione cronologica eventi (vedi LMQP-1 "Story Trace") |
| **Event Driven** | 🔴 da costruire | il motore non emette eventi (`BallReceived`/`ShotStarted`/…) |
| **Replay Engine** | 🔴 da costruire | esiste solo lo screenshot del canvas in `out/`; nessuna registrazione stato/eventi per-frame, nessun debugger frame-by-frame, snapshot o confronto. Dipende dal layer Event+Timeline |
| **Failure Collector** | 🔴 da costruire | il gate salva screenshot + `report.json`/`index.html` aggregati in `out/`, ma non un Failure Package per-fail (seed+replay+timeline+video+log+snapshot), né classificazione/priorità/retention. Dipende da Replay+Timeline |
| **Regression Engine** | 🟡 embrionale | esiste solo la `golden` regression (firma stato `{htx,hty,cam,ch,ca}` vs `golden-sigs.json`): confronto baseline binario PASS/FAIL su un sottoinsieme dello stato. Mancano: baseline ricca (replay/score/metriche), 5 categorie di regressione, severità, gallery, visual/score comparison, storico |
| **Performance Monitor / Resource Manager** | 🔴 da costruire | il gate gira mono-worker e Playwright chiude il browser a fine run (cleanup implicito); health-check processi eseguito oggi **manualmente** (`ps`). Mancano: metriche FPS/CPU/RAM raccolte, leak/zombie detection automatica, soglie configurabili, stress test, report prestazionale, grafici |
| **Dashboard (Visual QA / LMDP)** | 🟡 minimale | `tests/visual/report.mjs` → `out/validate/index.html` (report statico per-run con issue/warn/screenshot). Mancano: Home live, Test Explorer/Highlight Detail, Replay/Timeline Viewer, Visual Comparison, Regression/Failure Center, Performance Monitor, AI Review, search/filtri, Quality Score globale, notifiche |
| **AI Vision Review Engine** | 🔴 opzionale | il gate cattura già screenshot del canvas (input pronto), ma nessuna analisi via Vision Provider, nessun Readability/Cinematic/Motion score percettivo, nessuna identificazione autonoma della Situation. Provider-agnostic by design |
| **Plugin & Extension Architecture** (3.12) | 🔴 da costruire | nessuna architettura a plugin (ciclo di vita Discovery→Unload, isolamento, security/min-privilegio, versioning, marketplace). I check del gate sono modulari (`checks/*.mjs`) ma **importati staticamente**; il gioco è un **singolo file globale** senza plugin runtime |
| **Configuration & Plugin System** (3.13) | 🔴 da costruire | Situation = array, non registry con metadati/validator associati; config via env var (`CPM_CHROME`/`PLAYWRIGHT_BROWSERS_PATH`), non file con validazione/versionamento. Mancano: plugin auto-load, Validator/Situation/Event registry, abstraction provider |
| **Football Intelligence KB** | 🟡 implicita | la logica calcistica oggi vive **nel codice** (`deriveIntent` 13 intenti, `decideExecution`, regole in `tests/situations-3d-validation.js`, invariante CINE) e nei testi/tactic delle 179 Situation — non in una KB dichiarativa separata e versionata. Manca: estrazione regole↔codice, comportamento atteso per ruolo/fase, varianti/eccezioni documentate |

**Limite strutturale noto:** il gate cattura **frame congelati** → valida stato/coerenza (Livelli 1-3 parziali) ma **non il movimento né la leggibilità temporale** (Livello 4). Il Timeline/Event layer (LMQP-1) è il prerequisito per colmarlo.
