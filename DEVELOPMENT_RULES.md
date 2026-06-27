# DEVELOPMENT_RULES.md

**Live Match Development Platform — Development Rules**

Version 1.0

> Si conforma a `MASTER_PROMPT.md` (charter LMQP). Documento vivo, organizzato per capitoli.

---

## 1. Introduzione

### Scopo del documento

Definisce le regole operative vincolanti per qualsiasi attività di sviluppo del Live Match Engine. Vincolanti per: sviluppatori · sistemi AI · Claude Code · strumenti di automazione · pipeline CI/CD · framework di testing.

> Qualsiasi modifica che non rispetti queste regole è da considerare **incompleta**.

### Ambito

Gameplay · Live Match Engine · Highlight Engine · Replay Engine · Animation System · Camera System · Football Intelligence · Match Simulation · Database · Rendering · UI del Live Match · Performance · Testing · QA · Build Pipeline.

### Obiettivo

L'obiettivo non è produrre codice, ma **aumentare continuamente la qualità del simulatore**. Ogni modifica deve essere **misurabile**, **verificabile**, **reversibile**.

---

## 2. Development Philosophy

Il Live Match Engine va sviluppato come un **simulatore**, non come un normale software. Ogni modifica si valuta su quattro criteri:

- **Qualità tecnica** — codice leggibile, modulare, estendibile, testabile, documentato.
- **Qualità calcistica** — ogni modifica aumenta la credibilità calcistica; una soluzione tecnicamente corretta ma **irrealistica** è errata.
- **Qualità visiva** — ogni highlight: naturale, fluido, comprensibile, cinematografico.
- **Qualità narrativa** — ogni highlight racconta una storia: *cosa* succede, *perché*, *quale esito*.

---

## 3. Core Principles

- **Football First** — la logica calcistica ha sempre priorità; mai sacrificare il realismo per semplificare il codice.
- **Situation First** — ogni highlight nasce da una Situation, mai dall'Outcome. Ordine: `Situation → Decisione → Animazione → Outcome`.
- **Intent Before Animation** — prima l'intenzione, poi l'animazione. Mai il contrario.
- **No Random Behaviour** — vietati i movimenti casuali; ogni movimento ha una motivazione calcistica.
- **Every Player Reacts** — ogni evento produce una reazione: `Passaggio → movimento compagni → pressione difensori → movimento portiere → aggiornamento camera`.
- **No Dead Players** — vietati giocatori immobili, NPC passivi, spettatori dell'azione: tutti partecipano attivamente.

---

## 4. Code Quality Rules

Privilegiare la **manutenibilità**. Vietati: duplicazione di logica · hardcoded values · magic numbers · workaround permanenti · patch temporanee. Ogni funzione ha **una** responsabilità precisa.

- **Naming convention** — i nomi descrivono lo scopo: `generateHighlight()` non `run()`; `evaluateSituation()` non `check()`.
- **Modularity** — ogni componente indipendente (Football Intelligence non conosce Replay Engine; Replay Engine non conosce QA Engine); comunicazione solo via interfacce pubbliche.
- **Single Responsibility** — ogni classe/funzione/modulo ha **un solo motivo per cambiare**.
- **Reuse Before Rewrite** — prima di creare nuovo codice, verificare l'esistenza di componenti riutilizzabili. La duplicazione è vietata.

---

## 5. Regression Policy

> La regola **più importante** del progetto.

Ogni modifica deve preservare **integralmente** il comportamento corretto esistente. È vietato correggere un bug introducendone di nuovi.

**Mandatory Regression Testing** — ogni modifica esegue automaticamente: unit · integration · replay · validator · regression suite · visual regression · animation regression · performance regression. Qualsiasi **FAIL blocca** il completamento.

**Regression Priority:**

| Livello | Esempi |
|---|---|
| **P0** | crash · corruzione dati · build KO |
| **P1** | highlight errati · Football Intelligence compromessa · replay incoerente |
| **P2** | problemi grafici · animazioni · camera · UI |
| **P3** | problemi minori · messaggi · tooltip · refactoring |

**Regression Rule** — non è consentito dichiarare *"bug corretto"* senza **dimostrare** che nessun altro comportamento sia peggiorato. La prova deve essere prodotta **automaticamente** dal framework.

---

## 6. Root Cause Analysis

È vietato correggere un **sintomo**. Prima della soluzione, individuare: origine · dipendenze · effetti collaterali · possibili regressioni. Ogni fix risolve la **causa primaria**.

- **Temporary Fixes** — consentiti solo se documentati, isolati, pianificati per la rimozione. Non possono diventare permanenti.
- **Bug Documentation** — ogni bug descrive: problema osservato · comportamento atteso · causa · soluzione · validator coinvolti · test utilizzati · esito finale.

### Definition of Done (cap. 1–6)

Soddisfatti quando qualsiasi sviluppatore o agente AI comprende che ogni modifica al Live Match Engine deve essere **guidata dalla logica calcistica**, realizzata secondo **principi di qualità del software** e **dimostrata con test automatici**, senza introdurre regressioni o compromessi tecnici.

---

## 7. Autonomous Development Rules

Claude Code opera come **Senior Software Engineer autonomo**: completa le attività **senza conferme intermedie**, salvo operazioni potenzialmente **distruttive o irreversibili**. Obiettivo: minimizzare l'interazione durante il ciclo di sviluppo.

**Autonomia operativa** — analizzare il problema → individuare la root cause → implementare → compilare → eseguire tutti i test → verificare regressioni → produrre un report finale. La richiesta continua di autorizzazioni interrompe il flusso e va evitata quando possibile.

**Decision making** — con più soluzioni plausibili, scegliere quella che minimizza il rischio di regressioni, migliora qualità e manutenibilità, mantiene la coerenza architetturale.

---

## 8. Preventive Authorizations

Per tutta la sessione si considerano **preventivamente autorizzate** tutte le operazioni **non distruttive** per implementazione/compilazione/testing/validazione.

Autorizzati: PowerShell · Bash · CMD · **Git** · Node.js · npm · pnpm · yarn · vite · webpack · TypeScript · eslint · prettier · Playwright · Chromium · Chrome Headless · Claude Preview · build · test · log · screenshot · registrazione video · profiling · benchmark. Nessuna conferma per singolo comando.

**Richiedono conferma esclusivamente:** cancellazione definitiva di dati · modifiche irreversibili · reset repository · **force push** · eliminazione database · operazioni esterne al progetto.

> ⚠️ **Conflitto noto con `MASTER_PROMPT.md` (Parte 2):** la charter elenca `git push`/`git merge`/`git rebase` tra le operazioni che richiedono **approvazione esplicita**; questo cap. 8 autorizza "Git" preventivamente e richiede conferma solo per *force push*/reset. **In attesa di riconciliazione dal proprietario** (vedi nota in fondo). Fino ad allora: per prudenza i push restano subordinati al via libera.

---

## 9. Automatic Build Policy

Dopo qualsiasi modifica al **codice** è obbligatorio eseguire automaticamente:

```
Build → Lint → Type Check → Compilation → Smoke Test → Regression Test → Visual Test → Performance Test → Report Finale
```

Vietato considerare conclusa una modifica senza l'intera pipeline. **Build failure** → interruzione immediata del ciclo; nessun test su build non valide.

---

## 10. Mandatory Visual Testing

Ogni modifica al Live Match Engine va verificata **visivamente** (non basta il successo dei test logici). Da validare: movimenti · animazioni · telecamera · pallone · replay · post-highlight · sincronizzazione.

- **Browser standard:** Chromium; se disponibile, **Claude Preview** come verifica grafica aggiuntiva.
- **Visual Evidence:** ogni sessione produce e archivia automaticamente screenshot · video · replay · log.

---

## 11. Playwright Rules

Framework ufficiale e2e. Usato per: avviare il gioco · simulare input · navigare la UI · lanciare partite · eseguire highlight · raccogliere screenshot · esportare video.

- **Best practices:** test deterministici, ripetibili, indipendenti, paralleli quando possibile. **Vietati i timeout arbitrari** → attese basate sullo **stato** dell'applicazione.
- **Browser lifecycle:** ogni browser aperto va chiuso automaticamente; vietato lasciare istanze Chromium in esecuzione.

---

## 12. Claude Preview Rules

Quando disponibile, **Claude Preview** è il **secondo livello** di verifica: qualità grafica/cinematografica, anomalie visive, confronto fra highlight. Integra Playwright, **non lo sostituisce**.

**AI Visual Review** — valuta fluidità · leggibilità · coerenza · sincronizzazione · realismo · qualità delle animazioni; i risultati vanno nel report finale.

### Definition of Done (cap. 7–12)

Soddisfatti quando Claude Code sviluppa una modifica in completa autonomia, usa automaticamente gli strumenti di build/testing autorizzati, valida il comportamento tramite Playwright e Claude Preview e produce evidenze oggettive della qualità senza interventi manuali dell'utente.

---

## Nota — riconciliazione policy Git (da decidere dal proprietario)

`MASTER_PROMPT.md` (Parte 2) e questo documento (cap. 8) **divergono** sull'autorizzazione a `git push`/`merge`/`rebase`:
- **Charter (MASTER_PROMPT Parte 2):** richiedono approvazione esplicita.
- **DEVELOPMENT_RULES cap. 8:** "Git" preventivamente autorizzato; conferma solo per *force push*/reset/irreversibili.

**Default prudenziale attuale:** i push restano subordinati al via libera del proprietario finché la divergenza non è risolta. Per autorizzare i push in autonomia (mantenendo la conferma solo su force-push/reset), aggiornare la Politica Git di `MASTER_PROMPT.md`.

---

## Stato attuale (mappatura onesta sul repo)

| Regola | Stato |
|---|---|
| Football/Situation/Intent First | 🟢 rispettato — pipeline `Intent → Decision → Simulation → Animation` (vedi `LIVE-MATCH-ENGINE.md`) |
| No Random Behaviour / Determinism | 🟢 tutto seedato; gate `determinism`; `Math.random()` non seedato vietato su setup/render |
| Every Player Reacts / No Dead Players | 🟡 AI off-ball viva (F2/F3) + deliberativa (F10/F11/F13), ma **non validata dal vivo** dal gate |
| Code Quality (no duplicazione/magic numbers) | 🟡 file unico ~20.6k righe; refactoring incrementale |
| Regression Policy / Mandatory Regression Testing | 🟡 esiste il gate 9/9 (stato/coerenza/golden) ma **mancano** replay/animation/performance regression e la maggior parte dei test automatici elencati |
| Regression Rule (prova automatica) | 🔴 la "prova che nulla è peggiorato" è oggi parziale (golden + analitica), non un Regression Engine completo (vedi `LIVE_MATCH_QA_SPEC.md` cap. 3.6) |
| Root Cause / No Blind Fix | 🟢 pratica adottata (audit prima di ogni modifica) |
