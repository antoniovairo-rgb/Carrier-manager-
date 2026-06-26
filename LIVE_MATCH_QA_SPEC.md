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
| **Replay Engine** | 🔴 da costruire | — |
| **Failure Collector** | 🔴 da costruire | il gate salva screenshot in `out/`, ma non un bundle riproducibile per-fail |
| **Performance Monitor** | 🔴 da costruire | — |
| **Dashboard** | 🟡 minimale | `tests/visual/report.mjs` → `out/validate/index.html` |
| **AI Vision Layer** | 🔴 opzionale | — |

**Limite strutturale noto:** il gate cattura **frame congelati** → valida stato/coerenza (Livelli 1-3 parziali) ma **non il movimento né la leggibilità temporale** (Livello 4). Il Timeline/Event layer (LMQP-1) è il prerequisito per colmarlo.
