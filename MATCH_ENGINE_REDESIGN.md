# MATCH ENGINE REDESIGN — Riprogettazione del motore e delle Situations

**Versione 1.0 · CPM 6.2.1 · Direttiva PO «PRIORITÀ ASSOLUTA» · FASE 1 (Analisi) COMPLETA**

> Charter di riferimento: `MASTER_PROMPT.md` (LMQP — QA First · No Blind Fix · Zero Regression · Determinism First · «Every Highlight Must Tell a Story», 4 livelli di qualità). Questo documento è il risultato della FASE 1 richiesta dalla direttiva: analisi completa PRIMA di scrivere una riga di codice. I numeri di riga si riferiscono a CPM 6.2.1 (~21.000 righe) e vanno riverificati con `grep -n` prima di ogni edit.

---

## 0. Verdetto esecutivo

**Lo scheletro giusto esiste già.** La pipeline `Intent → Decision → Simulation → Animation` (5.14→5.37), il bus eventi LMQP, il Decision Engine seedato, il Football State e il gate a 14 check sono fondamenta reali e vanno TENUTE. La riprogettazione NON è una riscrittura da zero: è il completamento chirurgico di 5 rotture strutturali che oggi impediscono al motore di garantire qualità automatica a tutte le situations:

| # | Rottura strutturale | Sintomo percepito dal giocatore |
|---|--------------------|--------------------------------|
| **W1** | **Il testo è un'API.** `deriveIntent`, chaining, rigore, posizionamento e GK leggono `sit.text` con regex | Situations fragili, correzioni una-per-una, nuovi testi rompono comportamenti |
| **W2** | **Doppio motore d'esito.** `succRate` decide il *se* (ok/fail), `decideExecution` solo il *colore* del fallimento; geometria viva mai letta; rigore fuori flusso | Esiti che sembrano casuali, scelte cosmetiche, «il difensore non c'entra» |
| **W3** | **9 sistemi muovono la palla** con 3 fisiche incompatibili e 7 handoff senza continuità di velocità; baseline archi ancora `Math.random()` | Lanci irreali, cambi direzione improvvisi, teletrasporti, «la palla non racconta l'azione» |
| **W4** | **Movimento senza ancore tattiche.** Ruoli index-based senza home-position, nessuna collisione (solo bias sui target), freeze-statua, 2 modelli di moto (eroe lerp vs off-ball inerzia), snap mascherati da cut | Ammucchiate, attraversamenti, statue durante la scelta, scatti di massa a freeze rilasciato |
| **W5** | **La validazione non vede il gioco vivo.** Il gate forza le situations (salta selezione/chaining/handleContinue), campiona 6-13 gi su finestre 1-2s, niente metriche cinematiche per-tratto | I bug percepiti dal PO (boomerang, statue, ping-pong) passano il gate al 100% |

**Ordine d'attacco: W5 per primo.** Il charter LMQP impone QA First: prima si costruisce lo strumento che VEDE i problemi su migliaia di highlight live (e la baseline «prima»), poi si opera su esito, palla e movimento misurando ogni slice contro la baseline. Senza W5, i fix su W2-W4 restano collaudo manuale — esattamente ciò che la direttiva vieta.

---

## 1. Fotografia dell'architettura attuale (chi fa cosa oggi)

I 9 moduli richiesti dalla direttiva, mappati sul codice esistente:

| Modulo richiesto | Oggi vive in | Stato |
|---|---|---|
| **Situation Engine** | factory `S(...)` r.1838 + `SITUATIONS` r.1860-2277 (179) + `CHAIN_SITS` r.9174 + `selectContextualSituations` r.9035 + setup posizionale r.9639-9804 | 🟡 selezione quasi-config; setup scriptato pilotato dal TESTO; 4 campi derivati già congelati alla costruzione (`intent/ballState/cine/offBall`) |
| **Decision Engine** | `decideExecution(intent,ctx)` r.6422-6478 — puro, seedato, qualità `q` da skill−pressione−fatica+morale | ✅ solido ma SOTTOUSATO: decide solo colore dei fallimenti + qualità |
| **Tactical Engine** | frammenti: `tactic.*` nelle situations, `oppTactic`, shape-flow/pressing nel render-loop, `cpmadapt`, `matchMem.byFlank` | 🔴 non esiste come modulo: niente home-position, niente zone di competenza, ruoli da indice |
| **Player Movement Engine** | `animOne` r.7301-7348 (off-ball: EMA target + velocità/inerzia; eroe: lerp diretto) + AI off-ball r.7832-8042 (F2/F3/F10/F11/F13, repulsione, marcatura) | 🟡 inerzia c'è solo off-ball; repulsione sui TARGET, non collisioni; freeze = statua sui procedurali |
| **Ball Physics Engine** | NON esiste: 9 scrittori (ball 2D r.10324, bridge 3D r.7403, arcBlock r.7547-7714, post-archi r.7453-7524, arco BG r.7772, hlDefTraj r.7664, pin tackle, replay, cosmetica) | 🔴 il buco più grande — vedi §4 |
| **Outcome Engine** | `succRate` r.2778 + modificatori in `handleAction` r.10437-10453 + roll seedato r.10463 + `decideExecution` r.10481 + `resolveDefensiveOutcome` r.6491-6549 + `bgMicroTick` r.6606 | 🟡 doppio binario; esiti offensivi di prima classe (corner/fallo/rimessa) appiattiti da `_missKindNorm`; punteggio a doppia sorgente |
| **Highlight Engine** | fasi `hl_*` in `LiveMatch`, `startHL` r.9814, `deriveHL` r.6210, `buildHLTimeline`/`validateHLTimeline`/`resolveTimeline` r.~6340-6420 (wiring solo tiri) | 🟡 prep→sviluppo→conclusione esiste solo per i tiri |
| **Animation Engine** | `ThreeMatchView`: gesti eroe variant-aware, gesti GK, mixer GLB, `fireConclusion` | ✅ maturo; consumerà la Ball Physics invece degli archi pre-autorati |
| **Validation Engine** | gate 14 check + hook `__CPM_*` + `replay.mjs` + failure-collector + decision-baseline | 🟡 sonde e packaging pronti; manca il driver LIVE su larga scala e le metriche cinematiche |

---

## 2. Situations → pure configurazioni (W1)

### 2.1 Dove oggi il dato veicola comportamento (evidenze)

1. `deriveIntent` parsa `sit.text` con ~10 regex (r.1813, 1819-1832). Solo 1 situation dichiara l'intento (`tactic.it`, r.1816).
2. Il chaining sceglie la catena per regex sul testo (r.10638) e su flag runtime (`_chanceDrb`/`_chance78`).
3. `rew`/`fail` delle azioni SONO l'esito (`key=ok?action.rew:action.fail`, r.10466) — non descrizioni.
4. Setup posizionale: array di coordinate inline ramificati da `text.includes("RIGORE")` (r.9660), `lockMovement`, zona (r.9655-9783).
5. Override cinematici bakati: 41 `tactic.bs`, 17 `tactic.cn`, 1 `tactic.it`, 3 zone autoriali `fascia` con range fittizio `[-1,-1]` (r.2286).
6. `revealMs`/particelle da regex sul label (r.10537); GK-dive da testo (r.9797); `isPenaltySit` regex (r.2348).

### 2.2 Schema bersaglio (dichiarativo)

```js
{
  // — GEOMETRIA (già config oggi) —
  zones, startZone, moveZone, maxMoves, lockMovement,
  // — DICHIARATIVO (nuovo: oggi derivato dal testo) —
  intent,        // dichiarato o bakato UNA volta, MAI più regex a runtime
  ballState,     // già congelato alla costruzione (r.1842) — diventa l'unica sorgente
  setup,         // preset parametrico di schieramento: "openplay"|"box"|"setpiece_central"|"setpiece_flank"|"counter"|"defense" (+ parametri)
  chainOn,       // {assist:"header|mischia|second_ball", dribble:"dopo_dribbling"} — niente regex
  // — SCELTE DEL GIOCATORE —
  actions: [{ label, stat, risk }],   // risk sostituisce rew/fail: il RISULTATO lo decide l'Outcome Engine
  // — SOLO PRESENTAZIONE —
  text, intro, ctx    // liberi: NESSUN sistema li legge più
}
```

**Strategia di migrazione — zero lavoro manuale sulle 179**: come già fatto per `ballState`/`cine` (5.15), i campi nuovi si BAKANO una volta con uno script node che riusa le regex attuali come *generatore offline* (deriveIntent di oggi → campo `intent` scritto nel dato; la classificazione del setup dai rami attuali r.9655-9783; `chainOn` dalle regex r.10638). Il motore a runtime legge SOLO i campi. Le regex muoiono nel gioco e sopravvivono solo nello script di bake + un validator che segnala i campi mancanti su situations future. Ogni nuova situation dichiara i campi o eredita i default per zona/intent → **eredita automaticamente il comportamento del motore**.

### 2.3 Il setup posizionale diventa un generatore

I ~150 righe di array inline (r.9655-9783) diventano `layoutFor(setup, zones, intent, seed)`: un generatore parametrico che produce gli spot dei 21 da preset + ruoli tattici (§5) + rumore seedato. I 10 casi `lockMovement` e i 3 `fascia` diventano preset espliciti (`setpiece_*`, `flank_cross`). Golden: cambierà la firma di setup di alcune situations → rigenerazione DELIBERATA con confronto visivo prima/dopo.

---

## 3. Outcome Engine unico (W2)

### 3.1 Il flusso bersaglio

```
azione scelta (intent + risk + stat)
   ↓
ctx VIVO:  pressure = f(difensori REALI entro r, angolo, GK out)  ← Football State, non scalari autoriali
           + attrs, fatigue, morale, foot, weather, x/y reali, momentum, adaptStr
   ↓
decideExecution(intent, ctx)  →  UNICA sorgente: esecuzione + esito granulare + qualità q
   ↓
outcome di PRIMA CLASSE:  goal | saved | post | wide | blocked→corner | fouled→(punizione/RIGORE)
                          | offside | intercept | throw_in | corner_conceded | loose(rimpallo→chain)
   ↓
ledger unico eventi-partita (gol eroe + bgMicroTick + box-score corners/fouls DAL flusso, non dal caso)
```

- **`succRate` resta come display** (% mostrata/fasce colore) e viene ricalibrata per riflettere la curva vera del motore — la promessa al giocatore e l'esito provengono dalla stessa matematica.
- **Geometria viva nel roll**: `pressure` non più scalare autoriale 0-5 ma derivata dai difensori reali (`__CPM_FOOTBALL_STATE` già traccia possessor/nearBall/superiority, r.7357-7379) + `defDist` reale del marcatore più vicino, con il metadato `tactic.nearby_def` come *prior* del layout, non come verità.
- **Esiti offensivi di prima classe**: oggi `decideExecution` GIÀ genera `corner`, `fouled`, `win_freekick`, `offside`, `deflected_out` (r.6439-6459) ma `_missKindNorm` li appiattisce in 4 famiglie (r.2622-2628). Vanno promossi: famiglia propria in overlay/cronaca, realizzazione fisica propria (§4), contatori box-score collegati (oggi `corners/fouls` arrivano SOLO dagli eventi ambientali BG), e `fouled` in zona → punizione/RIGORE guadagnato = nuovo highlight in catena.
- **Rigore e punizione nel flusso**: `handleRigore` (r.10660-10706) rientra nel percorso `handleAction` → `_outKind`/CoherenceCheck/matchMem (l'angolo scelto resta il minigame; l'esito passa dal motore — già impostato in 5.78, va completato).
- **Rimpallo (`loose`)** come esito neutro che genera catena `second_ball` con possesso conteso — il chaining smette di essere solo narrativo.
- **Regression**: `decision-baseline.json` va esteso da 24 a 179 chiavi + baseline STATISTICA (distribuzione esiti per intent×pressione su N=10k contesti node) confrontata prima/dopo ogni slice.

---

## 4. Ball Physics Engine unificato (W3)

### 4.1 Il problema (misurato)

9 scrittori di `ball.position`/`ballPos`, 3 fisiche (lerp 2D, parabola cinematica `sin(u·π)·H`, gravità vera solo in `deflect`/`post_rebound`), 7 handoff che azzerano la continuità (2D→3D doppio smoothing r.10324/7403; arco che parte da dove si trova la palla «ora» r.7547; post-archi che resettano timer e riscrivono x r.7453-7524; teleport ai reset r.10733/10760). Le baseline degli archi usano `Math.random()` NON seedato (r.7561, 7571-7576, 7588-7590, 7601-7606): la qualità decisa dal motore MODULA una traiettoria che nasce casuale.

### 4.2 Il modello bersaglio

**Un solo stato** `BALL = { pos(x,y,z), vel(x,y,z), spin, mode }` con `mode ∈ {carried, passed, struck, loose, dead}` integrato nel render-loop:

- `carried`: attaccata al portatore con offset di conduzione e inerzia (il carry di `hl_move` smette di essere un lerp-follow).
- `struck/passed`: il calcio imposta una **velocità iniziale** `v0` derivata da `decideExecution` (qualità→precisione dell'angolo, potenza→|v0|, tipo→altezza/spin) — DETERMINISTICA dal seed della decisione. La parabola diventa integrazione (`vel.y -= g·dt`), il punto d'arrivo è CONSEGUENZA, non input. Gli archi «pre-autorati» diventano tabelle di v0 per famiglia.
- `loose`: rimbalzi con restituzione (già esiste in deflect: si generalizza), attrito al suolo, contendibile (alimenta `second_ball`).
- `dead`: palla ferma su spot (rigore, punizione, angolo, rimessa, kickoff) — i set-piece e le rimesse diventano STATI FISICI con ri-avvio, non testo.
- **Nessun teleport**: i reset (kickoff, ripresa post-HL) diventano transizioni `dead → passed` (un giocatore la porta/passa) oppure cut di regia DICHIARATI (il cut c'è già: `setCutFx` — legittimo per il montaggio TV, ma la palla riparte da uno stato coerente, mai «scivola» né salta a metà inquadratura).
- Il **2D logico** (`ballPos` per zone/cronaca) diventa PROIEZIONE dello stato 3D, non un secondo sistema con proprio smoothing.

### 4.3 Compatibilità

L'arcBlock che la suite `data-coherence` estrae come matematica pura va sostituito in blocco con l'integratore + un'API pura equivalente (`computeStrike(decision) → v0`) che la suite possa continuare a estrarre e testare analiticamente. Invariante CINE (aerea⇒testa/volée) resta asserito su `mode`+`z`.

---

## 5. Tactical + Movement Engine (W4)

### 5.1 Tactical Engine (nuovo modulo, dati + funzioni pure)

Per ognuno dei 22: `{ role, homePos(x,y), zone(x0,x1,y0,y1), duties }` derivati da modulo/formazione (oggi i ruoli sono `i%11` — r.6831). Il target di ogni giocatore diventa:

```
target = homePos ⊕ shift(palla, possesso, linea)   // l'ancora tattica PRIMA della palla
         ⊕ duty(pressing | marcatura | copertura | corsa)  // i pass deliberativi F3/F10/F11/F13 ESISTENTI
         ⊕ repulsione + collision-avoidance
```

I pass deliberativi attuali (goal-side r.7981, chiusura linea r.7988, press+cover r.8006, GK r.7874, cpmadapt r.8020) si RIUSANO: cambia l'ancora (home-position invece dell'offset dalla palla). Ampiezza/profondità/linea difensiva diventano proprietà della formazione, non emergenti dal caso.

### 5.2 Movement Engine

- **Un solo modello di moto per tutti** (eroe compreso): bersaglio commesso (EMA) → velocità con accel/decel/cap → integrazione. L'eroe mantiene la reattività alzando accel/cap, non con un lerp diverso (r.7305 → unificato con r.7306-7314).
- **Separazione vera**: la repulsione si applica anche alle POSIZIONI (soft-collision a raggio corto ~1.2u oltre al bias sui target) → niente compenetrazioni; il cambio direzione passa dal turn-rate cap già esistente (r.7325).
- **Freeze vivo**: durante `hl_choose` i 21 non si congelano più a `continue` (r.8057): entrano in modalità `idle-active` — micro-passi di assestamento (≤0.6u), cambi di peso, testa che segue la palla (già esiste `_hd`), il marcatore resta orientato goal-side, gli smarcati «chiedono» il pallone. Budget: stessi calcoli di `animOne`, target congelati con micro-oscillazione seedata → deterministico e gate-safe (il freeze è già disattivato sotto `?cpmtest=1`, e le posizioni off-ball sono fuori dalla golden).
- **Rilascio graduale**: a fine freeze i target si sbloccano con ramp (0.4s) → mai più «partenza in massa».
- **Snap censiti** (r.8056, 8079, 10760): quelli dentro un cut di regia restano (dichiarati); quelli a camera aperta diventano transizioni fisiche.

---

## 6. Highlight Engine — ogni azione racconta una storia

`buildHLTimeline`/`validateHLTimeline`/`resolveTimeline` (già scritti, wiring solo sui tiri) diventano il backbone di TUTTE le famiglie: ogni highlight = `preparazione (ricezione/portata/schema) → sviluppo (movimento+scelta) → conclusione (strike/duello) → conseguenza (esito fisico di prima classe + reazioni + eventuale catena)`. La timeline è validabile in node (già lo è) e viene emessa sul bus `__CPM_TIMELINE` beat-per-beat → il Validation Engine la confronta con ciò che il 3D ha davvero mostrato (esito⟺traiettoria, §7).

---

## 7. Validation Engine — il moltiplicatore (W5, SI COSTRUISCE PER PRIMO)

### 7.1 Cosa esiste già (riusabile al 100%)

Sonde per-frame (`__CPM_STATE` = palla+22 in coordinate di gioco), bus eventi (`__CPM_TIMELINE`), registratore replay (`lib/replay.mjs`, arco choose→resolve con maxBallJump), screenshot (`canvasShot`), packaging FAIL (`failure-collector` → `run-summary.json` con fingerprint), baseline regressione decisione, live-smoke (unico check che gira il clock reale).

### 7.2 Cosa si costruisce (LMQP-10: **Live Match Validator**)

1. **Driver AUTOPLAY** (`__CPM_AUTOPLAY`, hook test-only): gioca la partita VERA — selezione contestuale, chaining, `handleContinue`, coda reattiva, clock — scegliendo azioni con policy parametrica (greedy/random/worst-case seedate). Niente force-sit: esercita ESATTAMENTE il path del giocatore.
2. **Recorder in-page ad alta frequenza**: campionamento rAF-driven DENTRO la pagina (non round-trip Playwright): per frame `{t, ball(x,y,z), 22×(x,y), fase, eventi}` su ring-buffer, scaricato a fine highlight. Su software-GL i ~5-10fps del headless bastano perché il campione è per-frame reale, non per-poll.
3. **Metriche cinematiche per highlight** (soglie da baseline percentile, non hard-coded):
   - teleport: max Δpos per frame (palla e giocatori, TUTTI, non 6 gi);
   - velocità palla per TRATTO (per-segmento, non solo net) + accelerazioni impossibili;
   - compenetrazioni: coppie sotto 0.5u per più di N frame;
   - occupazione spazi: larghezza/profondità/spaziatura per reparto (run-metrics già calcola la parte statica);
   - fluidità: jerk medio dei 22, «statue» (giocatori fermi >2s con palla viva vicina);
   - **coerenza esito⟺traiettoria**: `key=goal` ⟹ la palla attraversa la linea in porta; `corner` ⟹ esce oltre la linea di fondo deviata; `throw_in` ⟹ esce sul lato; overlay-family ⟺ arc-family (estende M3);
   - sincronia animazione⟺contatto (gesto del calcio entro ±150ms dal cambio di velocità della palla).
4. **Mass runner**: N partite autoplay complete (seed diversi) + sweep delle 179 in contesto live → migliaia di highlight per run notturno; modalità PR = campione ridotto (~10 min).
5. **Report per situation**: `PASS / WARNING / FAIL` con causa, coordinate, replay JSON, screenshot del frame incriminato, log del bus, e **proposta di correzione** generata dalla regola violata (es. «teleport palla 18u al frame 412: handoff post-arco deflect→loose, vedi §4.2»).
6. **Regression**: ogni run produce `live-baseline.json` (distribuzioni percentili per metrica×intent); il run successivo FALLISCE su peggioramenti oltre soglia. Le baseline «prima» si scattano PRIMA di toccare il motore.
7. **Performance**: il perf-monitor esistente entra nel report live (fps/p95/heap per fase) con confronto baseline — il vincolo «nessun rallentamento» diventa misurato.

Il gate attuale (14 check) RESTA con il suo ruolo (stato/coerenza/golden/regressione rapida). Il Live Match Validator è il livello sopra: più lento, girato per release e su richiesta.

---

## 8. Roadmap operativa

Ogni fase è shippabile, gate-verde, con baseline prima/dopo e collaudo PO sui punti percepibili. Mai più di una fase in volo (regola audit).

| Fase | Contenuto | Rottura | Misura di successo |
|---|---|---|---|
| **R0** | **Live Match Validator** (driver autoplay + recorder + metriche + report + baseline «prima») | W5 | migliaia di HL live misurati; report PASS/WARN/FAIL funzionante; baseline scattata |
| **R1** OK | **Situations→config**: bake `intent/chainOn/setup` dichiarativi, `layoutFor` parametrico, morte delle regex runtime su text/label | W1 | zero letture di `sit.text` fuori dal display; nuova situation di prova eredita tutto senza codice |
| **R2** | **Outcome Engine unico**: decideExecution unica sorgente, pressure geometrica dal Football State, esiti prima classe (corner/fallo/rimessa/rimpallo/offside), rigore-punizione nel flusso, ledger punteggio unico | W2 | baseline statistica esiti sana (node 10k); CoherenceCheck esteso a TUTTI gli esiti; win-rate sensibile all'avversario |
| **R3** | **Ball Physics Engine**: stato unico {pos,vel,spin,mode}, strike deterministici da decisione, handoff continui, set-piece/rimesse come palla ferma, kickoff senza teleport | W3 | metrica teleport-palla ≈ 0 fuori dai cut; velocità per tratto continua; data-coherence sostituita con `computeStrike` |
| **R4** | **Tactical+Movement 2.0**: home-position/zone per ruolo, modello di moto unico, soft-collision, freeze vivo, rilascio graduale | W4 | statue = 0; compenetrazioni ≈ 0; occupazione spazi nei percentili; collaudo PO sul feel |
| **R5** | **Highlight narrativo completo**: timeline prep→sviluppo→conclusione→conseguenza su tutte le famiglie + catene fisiche (second ball, fallo→set-piece) | — | validator: 100% highlight con backbone completo; «Every Highlight Must Tell a Story» misurato |

Dipendenze: R1 e R2 possono parzialmente sovrapporsi dopo R0; R3 richiede R2 (l'esito genera v0); R4 è parallelo a R3; R5 chiude.

---

## 9. Vincoli non negoziabili

- **Zero regressioni**: gate 14/14 prima di ogni push + Live Validator baseline dopo R0; `decision-baseline` e golden rigenerati SOLO deliberatamente con diff documentato.
- **Save-compat**: nessun campo `player` nuovo in tutto il programma (il motore è stateless rispetto al save) → nessun bump `SAVE_VERSION`.
- **Determinism First**: ogni nuova sorgente di casualità è seedata (i `Math.random()` residui negli archi vengono ELIMINATI da R3, non aggiunti altrove).
- **Performance**: budget misurato dal validator (fps/p95/heap per fase, confronto baseline); il recorder e le metriche vivono solo sotto `?cpmtest=1`/`!__CPM_STORE_BUILD`.
- **File unico** per il gioco; il validator vive in `tests/visual/`.
- **Minimalismo**: si riusa tutto ciò che è sano (Decision Engine, pass deliberativi, timeline engine, replay, failure-collector); si riscrive solo ciò che è rotto alla radice (esito doppio, palla multi-sistema, ancore tattiche).

---

*FASE 1 completa. R0 (Live Match Validator) operativo e calibrato. R1 (situations->config) CHIUSO: nessuna lettura runtime di testo branchia il comportamento. Prossimo: **R2 — Outcome Engine unico**.*
