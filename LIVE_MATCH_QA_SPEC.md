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

## Stato di implementazione (mappatura sul codice attuale)

> Sezione di raccordo tra spec e realtà del repo, da aggiornare ad ogni incremento LMQP. Onestà documentale (charter): distinguere ciò che esiste da ciò che è da costruire.

| Modulo LMQP | Stato nel repo | Note |
|---|---|---|
| **QA Core** | 🟡 parziale | `tests/visual/validate-situations.mjs` orchestra il gate (9 categorie) |
| **Validator Engine** | 🟡 parziale | `tests/visual/checks/*.mjs` + `tests/situations-3d-validation.js` (suite analitica) |
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
