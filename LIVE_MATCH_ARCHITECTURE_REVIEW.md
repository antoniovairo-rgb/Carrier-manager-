# LIVE MATCH — ARCHITECTURE REVIEW

> **Documento di sola analisi. Nessun file di codice è stato modificato.**
> Revisione architetturale critica del Live Match di *Elevora / Career Player Manager (CPM)*
> v**5.51.0**, file unico `CARRIER-MANAGER-AV.html` (~19.472 righe), alla luce del
> `LIVE_MATCH_MANIFESTO.md` (12 capitoli) e della `docs/LIVE_MATCH_ENGINE_ANALYSIS.md`.
>
> Team: Principal Game Architect · Lead Gameplay Engineer · Senior AI Engineer ·
> Senior Animation Engineer · Technical Director · Lead Game Designer · QA Director.
>
> **Regola Zero applicata a ogni proposta:** *«Questa modifica migliora realmente
> l'esperienza dell'Eroe?»* Se no → scartata (e marcata `REJECT` con motivazione).
> **Identità non negoziabile** preservata integralmente.

---

## 0. Executive Summary

Il Live Match **non ha bisogno di una riscrittura**. La pipeline `Intent → Decision →
Simulation → Animation` è già architetturalmente corretta e, in larga parte, già
disaccoppiata (la cinematica è *text-free* e vincolata da un'invariante testata dal gate).
Il motore copre ~82% del gameplay di un highlight con buona varietà. Riscriverlo violerebbe
la richiesta esplicita («non voglio un motore più grande / più complicato») e introdurrebbe
regressioni su un impianto che oggi è deterministico e validato.

Il gap principale **non è funzionale, è di coerenza e di continuità**. Il manifesto chiede
tre cose che oggi mancano o sono fragili, tutte a monte dell'esperienza dell'Eroe:

1. **Coerenza assoluta tra i sistemi** (Cap. 6, GR-064/065). Oggi esistono **due tassonomie
   di esito parallele e non unificate**: `outKey` (12 valori, guida stato salvato + overlay +
   cronaca) e `decideExecution.outcome` (~30 valori granulari, guida la cinematica 3D). Possono
   **divergere**: l'overlay può annunciare «PALO!» mentre il 3D mostra una parata. È la
   violazione del manifesto **già presente e più visibile**.
2. **Memoria narrativa** (Cap. 5.6, 6.13, 9.7, 9.14, GR-057…063). Oggi **assente**: ogni
   highlight è isolato, la partita è «una successione di clip», non «una storia».
3. **Validazione dell'invariante di coerenza** (Cap. 11). Il gate valida frame congelati e
   non-regressione, non la coerenza *runtime* overlay↔3D↔cronaca né il Freeze (che è
   addirittura **disattivato** sotto gate).

La nostra proposta architetturale ruota attorno a **un solo concetto portante**, l'analogo
software del principio «il pallone è il riferimento assoluto» (Cap. 6.11): **un unico Outcome
Model** prodotto una volta e consumato da *tutti* i sistemi (3D, overlay, cronaca, HUD,
timeline, coro). Questo, più un **Match Memory** additivo e un **layer di asserzioni di
coerenza dev-only**, chiude i tre gap **senza aumentare la complessità del motore** e
riusando i sistemi esistenti.

Respingiamo esplicitamente, con motivazione (Regola Zero + rischio/costo), le parti del
manifesto che porterebbero verso un simulatore tradizionale o un runtime «auto-riparante»:
fisica reale con collisioni, portiere giocabile, linea del fuorigioco reale, e il
«Quality Assurance Engine» runtime con auto-correzione/rigenerazione degli highlight.

**Le 3 milestone ad alto valore / basso rischio** (dettaglio in `LIVE_MATCH_IMPLEMENTATION_PLAN.md`):

| # | Nome | Valore per l'Eroe | Rischio |
|---|------|-------------------|---------|
| **M1** | Unified Outcome Model (coerenza overlay↔3D↔cronaca) | Alto | Basso |
| **M2** | Match Memory (continuità narrativa) | Alto | Basso |
| **M3** | Coherence Assertion Layer (dev-only, estende il gate) | Medio (indiretto: protegge M1/M2) | Molto basso |

---

## 1. Analisi del manifesto — Review critica capitolo per capitolo

> Per ogni capitolo: **Mantieni · Modifica · Elimina · Aggiungi · Semplifica · Rischio
> regressione · Implementabile meglio.** Ogni voce è motivata tecnicamente. La colonna
> «Stato oggi» dice quanto il codice attuale già rispetta il capitolo.

### Cap. 1 — Visione e Filosofia · Stato oggi: **rispettato**
- **Mantieni tutto.** È la costituzione identitaria e coincide con l'`identità non negoziabile`.
  Il codice già la incarna: l'eroe è l'unico controllato (`pPos`, hl_move/hl_choose), il match
  è narrativo (macchina a stati HL, non simulazione continua).
- **Rischio regressione:** nessuno (è filosofia, non implementazione).
- **Nota critica:** §1.7 «La partita è una storia» è oggi la promessa **meno mantenuta** dal
  codice (nessuna memoria). Vedi Cap. 5/9 e M2.

### Cap. 2 — Gameplay e Hero Experience · Stato oggi: **rispettato con un'eccezione**
- **Mantieni:** §2.1–2.14 sono già la spina del gameplay (lettura > riflessi; scelte
  significative; conseguenze). `succRate`/`decideExecution` premiano gli attributi, non i
  riflessi. ✔
- **Modifica/Chiarisci §2.2 (le 11 fasi):** il codice **non attraversa 11 fasi discrete** ma
  9 stati (`matchday…ended`) + catene post-arco. Le «fasi» 8–11 (reazione IA / evoluzione /
  conclusione / collegamento narrativo) sono **implicite** nel render-loop e **non esiste la
  fase 11** (collegamento narrativo). Trattare le 11 fasi come *modello concettuale*, non come
  stati da implementare (implementarli come stati reali romperebbe il gate, che forza le
  situation bypassando `handleContinue`).
- **Rischio regressione ALTO se preso alla lettera:** §2.3 «Il Freeze è sacro / nessun
  difensore anticipa / nessun compagno si smarca». Oggi il Freeze off-ball (`_readFreeze`)
  **esiste** ma: (a) è **disattivato sotto `_CPM_TEST`** → mai validato dal gate; (b) durante
  `hl_move` l'eroe si muove e gli off-ball hanno già fatto snap. Irrigidire il Freeze «totale»
  è a rischio perché tocca il render-loop gate-cieco. → Milestone dedicata a **validare** il
  Freeze prima di estenderlo (M3), non a estenderlo alla cieca.
- **Aggiungi:** §2.13 «Evoluzione della partita» è parzialmente presente (momentum, coach
  orders, densità BG) ma **non memorizzata** tra HL → confluisce in M2.

### Cap. 3 — Motore di Lettura Calcistica · Stato oggi: **in gran parte già implementato**
- **Mantieni:** `decideExecution(intent, ctx)` **È** questo motore: valuta contesto
  (attrs/pressure/fatigue/morale/x/weather/foot/side/seed), produce `quality q∈[0,1]` seedata,
  non mostra la valutazione (§3.8/GR-021 ✔), non decide al posto del giocatore (§3.1 ✔).
- **Semplifica / non aggiungere:** §3.3 elenca ~30 variabili per giocatore (equilibrio,
  postura, direzione dello sguardo, rotazione palla, tempo d'arrivo…). Il motore **non le
  modella** e **non deve**: sono livello-simulatore, costo/rischio alto, valore-Eroe nullo
  (Regola Zero). Il motore ragiona su un sottoinsieme *sufficiente* (attributi + zona +
  pressione + piede) → **mantenere così**. Documentare che §3.3 è *aspirazionale/illustrativo*,
  non una checklist di implementazione.
- **REJECT §3.12 «Adattamento dinamico» come descritto** («il motore deve imparare»,
  «i difensori iniziano ad aspettarsela»): un vero apprendimento in-match è complessità/rischio
  alti su codice off-ball gate-cieco. **Contro-proposta:** una forma *leggera e deterministica*
  di bias (Match Memory → micro-shift di marcatura sul lato/uomo più cercato), opzionale e
  dietro flag. Vedi Cap. 4 e M2-opz.
- **Mantieni §3.13 «nessuna azione scriptata»:** già vero (anche il rigore passa da
  `succRate`+`handleRigore`, il tap-in ha `miss_easy`). ✔

### Cap. 4 — IA Contestuale · Stato oggi: **buono (F2/F3/F10/F11/F13), con 2 lacune**
- **Mantieni:** §4.1 «IA locale, non 22 giocatori simulati» = esattamente l'attuale off-ball
  AI (target logici + pressing dei più vicini + marcatura goal-side + F10 linea di passaggio +
  F11 press&cover + F13 GK). §4.9 «reagisce dopo la scelta» = corretto (gli off-ball si muovono
  all'uscita da hl_choose). ✔
- **Aggiungi §4.11 «Memoria dell'IA»:** oggi **assente** (grep vuoto). Confluisce in M2.
- **REJECT §4.12 «Adattamento» in forma forte** (vedi Cap. 3.12). **Rischio regressione ALTO:**
  l'off-ball **non è nella firma golden** → qualunque modifica al comportamento è *gate-cieca*.
  Un'IA adattiva mal calibrata degrada la leggibilità (contro §4.1/Cap. 1.8). → solo forma
  leggera, opzionale, dietro flag, con collaudo dal vivo obbligatorio.
- **Semplifica §4.10 «Personalità dei giocatori»:** attributi comportamentali per-NPC
  (aggressività, coraggio…) sono nuovo stato + nuovo tuning. Valore-Eroe indiretto, costo alto.
  **Deferire** oltre l'orizzonte di questa review.

### Cap. 5 — Motore Cinematografico, Cronaca e Immersione · Stato oggi: **forte su camera, debole su continuità**
- **Mantieni:** sistema camera (~12 modalità, blend `camHL`, result-framing, GK-tracking,
  bullet-time, replay) è un punto di forza reale. Overlay dinamici v5.51.0 (~90 messaggi/16 cat)
  già buoni. ✔
- **AGGIUNGI (priorità alta) §5.6 «Continuità narrativa»:** «ci riprova dopo il tiro sbagliato»,
  «secondo assist» → **impossibile oggi** (nessuna memoria). Questo è il cuore di M2.
- **CRITICITÀ §5.7 «overlay solo se realmente accaduto»:** parzialmente violato. «GOL — Nome»
  è già gated sul gol reale (v5.51.0 ✔), **ma** la categoria `miss` mescola fuori/palo/parato/
  murato e sceglie a caso, **indipendentemente da cosa mostra il 3D**. → risolto da M1.
- **REJECT §5.11 «Replay cinematografici selettivi» come nuovo lavoro:** il replay esiste
  (ring buffer 150 frame, `REPLAY_DUR`); renderlo «selettivo per grandi giocate» è nice-to-have
  a basso valore-Eroe e tocca camera gate-cieca. Deferire.
- **Elimina come requisito §5.9/§5.10 audio/esultanze audio:** il gioco è **silenzioso per
  scelta** (Play Store, peso mobile). Il manifesto va emendato: «audio» = *feedback testuale/
  visivo*, non sonoro. Non aprire il fronte audio.

### Cap. 6 — Sistema di Coerenza Assoluta · Stato oggi: **il gap #1**
- **Questo è il capitolo più importante e il più violato.** §6.8 (overlay coerenti), §6.11
  (pallone riferimento assoluto), §6.15 (priorità di coerenza) sono **la giustificazione diretta
  di M1**.
- **CRITICITÀ RADICE:** due tassonomie di esito non unificate (`outKey` 12 vs
  `decideExecution.outcome` ~30). §6.11 dice «ogni sistema deve usare la stessa posizione del
  pallone»: per estensione, **ogni sistema deve usare lo stesso ESITO**. Oggi non è così.
- **Mantieni §6.15 (ordine di priorità Gameplay > Eroe > Pallone > … > Regia):** ottima bussola,
  già di fatto rispettata (l'estetica non altera lo stato salvato).
- **REJECT §6.3/§6.14 «Validazione preventiva + fallback automatico runtime»** (il motore
  «corregge automaticamente» e «rigenera l'highlight» prima di mostrarlo). **Motivazione:**
  è il pattern di un motore server-side AAA, non di un file HTML singolo con Babel-in-browser;
  costo/rischio/perf altissimi, e un fallback runtime mal fatto **introduce** incoerenze invece
  di toglierle. **Contro-proposta pragmatica:** spostare la coerenza *a monte* (M1: un solo
  esito → niente da correggere a valle) + asserzioni *dev-only* (M3) che **rilevano** le
  incoerenze in test, non le riscrivono a runtime. Prevenire alla fonte > correggere a valle.

### Cap. 7 — Motore delle Animazioni 3D · Stato oggi: **buono, con incoerenze localizzate**
- **Mantieni:** animazioni eroe variant-aware (~20), crossfade corsa↔idle (`_runB`, risolve il
  T-pose glide), wind-up, invariante `sw=sin(u·π)`. ✔
- **CRITICITÀ localizzate (candidate a milestone di polish, non architetturali):**
  - §7.2/§7.5 «animazione compatibile con la situazione»: **C-05 pallonetto su GK fermo** —
    il chip presuppone il portiere in uscita, ma durante l'HL il GK è sulla linea → animazione
    incoerente con la situazione. Fix localizzato (gating del chip sullo stato GK).
  - §7.6 «no scivolamenti»: la conduzione ball-carry è root-motion via lerp → può leggersi come
    slide ad alta velocità (C-08). Polish di locomozione, gate-cieco.
  - C-04 «tiro a giro»: la curva è resa via Z-target, non Magnus → arco «a spezzata». Cosmetico.
- **REJECT §7.11 «collisioni credibili» in senso fisico** (peso/urto/ragdoll): non esiste
  sistema di collisione reale e **non deve** (B9). Aggiungerlo = simulatore. La repulsione
  anti-ammucchiate attuale è sufficiente per la leggibilità. Regola Zero: non migliora l'Eroe.
- **Semplifica §7.13 «catalogo animazioni dell'Eroe più ricco che cresce nella carriera»:**
  bella idea ma nuovo stato + asset. Deferire; non è un gap di coerenza.

### Cap. 8 — Tactical Engine · Stato oggi: **coperto come posizionamento, non come «modulo dinamico»**
- **Mantieni:** occupazione area su set-piece (B16), shape-flow reparti, F3 smarcamenti su
  spazio, pressing. Copre §8.3/§8.7/§8.8 a livello di *highlight*. ✔
- **REJECT §8.4 «Modulo dinamico» (4-3-3 → 2-3-5 → 4-5-1 in tempo reale):** è simulazione
  tattica continua di 22 giocatori. Il motore è HL-based per identità (Cap. 1.3). Implementarlo
  = cambiare genere. **Contro-proposta:** i *drift preset* (`DRIFT_PRESETS`) già danno l'illusione
  di forma fluida per-highlight; sufficiente per l'Eroe.
- **REJECT §8.14 «Tactical Memory» in forma forte** → forma leggera in M2 (contatori per
  fascia/uomo più cercato), opzionale.
- **Mantieni §8.15 «costruire la situazione attorno all'Eroe senza renderlo onnipotente»:**
  già così (cap `succRate` 0.84; `miss_easy` esiste). ✔

### Cap. 9 — Event Engine · Stato oggi: **scheduling forte, memoria assente**
- **Mantieni:** `selectContextualSituations` (campionamento pesato seedato), `numHL`/`hlTimes`,
  HL reattivi (opp_goal/desperate), chaining (`CHAIN_SITS` + 25% leggero), priorità implicita
  via pesi. Copre §9.3/§9.4/§9.5/§9.10. ✔
- **AGGIUNGI §9.6/§9.7/§9.14 «varietà anti-ripetizione + memoria narrativa + collegamento tra
  highlight»:** oggi c'è dedup BG (ultimi 3) ma **nessuna memoria di HL** (gol/miss/save/lato).
  Cuore di M2. §9.14 «ogni highlight lascia un'eredità» = oggi non vero.
- **Mantieni §9.13 «rarità»:** già emergente (varianti rare: volley/panenka/chip a bassa %).

### Cap. 10 — Hero Engine · Stato oggi: **parziale (carriera solida, in-match memory assente)**
- **Mantieni:** progressione (`calcOvr`), morale/forma/fatigue, momenti speciali
  (`CAREER_MILESTONES`), continuità carriera (save). Copre §10.3/§10.5/§10.12/§10.13. ✔
- **AGGIUNGI §10.9 «linguaggio del corpo per stato»:** esistono `celebT`/`heroPostT`
  (esultanza/testa bassa/pugno) ma non modulati dal contesto (gol al 92' = gol sul 4-0).
  Nice-to-have, basso rischio, ma **non** un gap di coerenza → priorità bassa.
- **REJECT §10.6/§10.11 «personalità calcistica emergente / identità di carriera»** come nuovo
  sistema: alto costo, valore-Eroe a lungo termine ma **fuori dal perimetro «Live Match»** (è
  meta-carriera). Deferire alla roadmap di carriera, non a questa review del motore.

### Cap. 11 — Quality Assurance Engine · Stato oggi: **il gate esiste, la visione runtime no**
- **CRITICA FRONTALE alla visione runtime.** §11.2 «se un elemento è incoerente l'highlight NON
  deve essere eseguito finché non è corretto automaticamente», §11.12 «rigenerare l'highlight»:
  questo è un **anti-pattern** per questo progetto. Un validatore runtime che blocca/rigenera
  introduce: (a) stutter percepibile (blocca il render fino a «correzione»); (b) complessità e
  superficie di bug enorme; (c) **rischio di mascherare** i difetti invece di risolverli a monte.
  Contraddice la richiesta esplicita «non voglio un motore più complicato».
- **Mantieni + estendi il gate esistente (approccio corretto):** il QA di CPM è **offline**
  (Playwright, 12 check, timeline bus, golden, CINE invariant). È la strada giusta. §11.13
  (anti-regressione) e §11.14 (test automatici migliaia di HL) sono **già** il quality gate e il
  `situations-3d-validation.js` (537 combo).
- **AGGIUNGI (M3):** un **Coherence Assertion Layer dev-only** — asserzioni *passive* (solo log
  su `__CPM_TIMELINE` + console, dietro flag `?cpmassert=1`, **no-op in produzione**) che al
  momento della risoluzione HL verificano: overlay-family ⟺ esito 3D, cronaca ⟺ outKey, Freeze
  rispettato. Il check `timeline` del gate le consuma → l'incoerenza diventa un **FAIL di test**,
  non un fix runtime. Questo è §11 *tradotto nell'idioma reale del progetto*.
- **Mantieni §11.16 «modalità debug disattivata in produzione»:** pattern già usato (`_CPM_TEST`,
  `__CPM_GLB`, sezione AI nascosta). Coerente.

### Cap. 12 — Golden Rules · Stato oggi: **quasi tutte già rispettate; 3 violate**
- **Mantieni tutte** come test di accettazione (mappate in `LIVE_MATCH_TEST_PLAN.md`).
- **Violazioni attuali da chiudere:**
  - **GR-048/GR-049…052 / GR-065** (overlay coerente): violata dalla genericità `miss` → **M1**.
  - **GR-057…063** (continuità/memoria): violata (nessuna memoria) → **M2**.
  - **GR-066** (ogni highlight validato): il Freeze e la coerenza overlay↔3D **non sono
    validati** → **M3**.
- **Nota su GR-013** (Freeze: solo micro-animazioni): oggi l'eroe è *libero* in hl_move/hl_choose.
  È una **scelta di design accettabile** (hl_move è la fase di riposizionamento voluta), ma va
  **documentata** come deroga consapevole (vedi `LIVE_MATCH_DECISION_LOG.md` DL-006).

---

## 2. Analisi del motore — Punti di forza, debolezze, rischi

### 2.1 Punti di forza (NON toccare)
1. **Pipeline `Intent→Decision→Simulation→Animation` disaccoppiata.** `deriveIntent` /
   `deriveHL` / `decideExecution` sono funzioni **pure e node-testabili**. È il gioiello:
   permette di evolvere la resa senza toccare la decisione. **Preservare.**
2. **Invariante CINE gate-enforced** (header/volley⟹aerial, set-piece⟹set_ground). Unico
   vincolo cinematico con FAIL bloccante: modello da **replicare** per la coerenza overlay↔3D.
3. **Determinismo seedato** (`hashStr`): save riproducibili, firma golden, `decideExecution`
   LCG. Abilita tutto il QA. **Vincolo da rispettare in ogni milestone.**
4. **LMQP timeline bus** (`cpmEmit` → `__CPM_TIMELINE`): già l'infrastruttura giusta per M3.
5. **Camera & overlay** ricchi e già di buona qualità percettiva.

### 2.2 Punti deboli / colli di bottiglia
| # | Debolezza | Evidenza | Manifesto | Milestone |
|---|-----------|----------|-----------|-----------|
| W1 | **Doppia tassonomia di esito non unificata** → overlay↔3D↔cronaca possono divergere | `outKey`(12) vs `decideExecution.outcome`(~30); `hlOverlay` keyed su outKey+regex label | Cap. 6.8/6.11, GR-048/065 | **M1** |
| W2 | **Nessuna memoria tra highlight** | grep `lastHL/recentHL/hlHistory/…` vuoto | Cap. 5.6/9.7/9.14, GR-057…063 | **M2** |
| W3 | **Freeze non validato + off sotto gate** | `_readFreeze=(!_CPM_TEST&&…)` | Cap. 2.3, GR-009…013/066 | **M3** |
| W4 | **Coerenza runtime non asserita** | gate = frame congelati; nessuna asserzione overlay↔3D | Cap. 11 | **M3** |
| W5 | Chip su GK fermo (C-05) | variante `shot_chip` non gated sullo stato GK | Cap. 7.2/7.5 | Polish P1 |
| W6 | Conduzione ball-carry «slide» (C-08) | root-motion lerp | Cap. 7.6 | Polish P2 (gate-cieco) |
| W7 | `deriveIntent` legge ancora `sit.text` | ultima accoppiata testo→logica | Cap. 3 (determinismo) | Deferita (basso valore-Eroe) |

### 2.3 Codice duplicato / sistemi fragili
- **Fragile:** la coerenza overlay↔3D dipende oggi dal fatto che *due percorsi indipendenti*
  (stato e cinematica) «capitino» sullo stesso significato. Non c'è un contratto → fragile per
  costruzione (W1). M1 lo rende strutturale.
- **Fragile/gate-cieco:** tutto il render-loop off-ball (F2/F3/F10/F11/F13), camera, chaining,
  kickoff, cerimonia, Freeze. Il gate non li copre → ogni modifica va collaudata dal vivo.
  Registrato come rischio trasversale (vedi `LIVE_MATCH_RISK_REGISTER.md` R-01).
- **Duplicazione «buona» tollerata:** il blocco cross-ricevente è deliberatamente **fuori** da
  `arcBlock` (deve restare matematica pura per `computeArc` nell'eval analitico del gate). Non
  toccare: è un vincolo del gate, non un difetto.

### 2.4 Rischi architetturali
- **R-arch-1:** qualunque intervento sul render-loop è **gate-cieco** → regressioni invisibili
  fino al collaudo dal vivo. *Mitigazione:* preferire milestone che toccano **funzioni pure**
  (M1 su `decideExecution`/`hlOverlay`) rispetto al render-loop; per M2/M3 usare la timeline
  come punto di osservazione testabile.
- **R-arch-2:** file unico 19.5k righe, global scope. *Mitigazione:* **modularità logica dentro
  il file** (sezioni nominali, cores puri già isolabili), **mai** file JS separati (vincolo
  CLAUDE.md). Non è un obiettivo di questa review spezzare il file.
- **R-arch-3:** save compat. M1 non tocca lo stato salvato (l'Outcome Model è effimero). M2 usa
  stato **effimero non salvato** (ring in-memory) → **nessun bump `SAVE_VERSION`**. Vincolo di
  progettazione.

---

## 3. Architettura definitiva (evoluzione, non rivoluzione)

Tre componenti additivi. Nessuno rimuove sistemi esistenti; tutti riusano l'infrastruttura.

### 3.1 Unified Outcome Model (M1) — «l'esito è il riferimento assoluto»
**Problema:** `hlOverlay`, `OUTCOME_TX`/cronaca e la catena 3D (`fireConclusion` + catene
post-arco) leggono *sorgenti diverse* dello stesso esito.
**Soluzione:** al momento della risoluzione (`handleAction`), costruire **un solo oggetto**
`resolution = { outKey, granular, ok, heroFirst, actionLabel, hlType, hlVariant, quality, seed }`
dove `granular` è l'esito fine di `decideExecution` (post/save/wide/blocked/…). **Tutti** i
consumatori leggono da lì:
- 3D: la catena post-arco sceglie `in_net / hit_post / deflect / save` da `resolution.granular`
  (già oggi lo fa, ma da un percorso separato → unificare l'input).
- Overlay: `hlOverlay` sceglie la **sotto-categoria** da `resolution.granular`, non a caso
  dentro `miss` (es. `granular==="post"` → pool «palo/traversa»; `==="saved"` → pool «parata»).
- Cronaca: `OUTCOME_TX` idem.
**Proprietà:** nessun nuovo stato salvato, funzione pura, **deterministico**. Elimina W1 alla
radice → non serve alcun «fallback runtime» (Cap. 11 respinto).
**Invariante nuova, gate-enforceable:** `overlayFamily(resolution) ⟺ arcFamily(resolution)`.

### 3.2 Match Memory (M2) — continuità narrativa
**Struttura (effimera, non salvata):** un ring in-memory nel componente `LiveMatch`:
`matchMemory = { lastOutcomes:[…], goals:n, misses:n, saves:n, byFlank:{L,C,R}, mostSoughtMate,
gkHot:bool, lastHeroMiss:clock }`. Aggiornato a ogni risoluzione HL (e da eventi BG rilevanti).
**Consumatori:**
- Cronaca/overlay: sblocca frasi di continuità (§5.6): «ci riprova dopo l'errore di poco fa»,
  «secondo assist», «il portiere è in serata». **Deterministico** (seed HL + stato memoria).
- Event Engine: leggero bias anti-ripetizione già oltre il dedup BG (§9.6).
- (Opzionale, dietro flag) IA off-ball: micro-shift di marcatura sul lato più cercato (§4.12
  forma leggera). **Gate-cieco → dietro flag, collaudo dal vivo.**
**Proprietà:** additivo, nessun `SAVE_VERSION` bump, nessun impatto sul render-loop core.

### 3.3 Coherence Assertion Layer (M3) — Cap. 11 nell'idioma del progetto
**Cosa:** asserzioni *passive* dietro `?cpmassert=1` (no-op in produzione, come `_CPM_TEST`):
al `HighlightTimeline`/`ActionResolved`, verifica overlay-family ⟺ arc-family (M1), cronaca ⟺
outKey, e (quando non `_CPM_TEST`) che il Freeze abbia effettivamente congelato gli off-ball.
Emette su `__CPM_TIMELINE` un record `CoherenceCheck{ok,detail}`.
**Integrazione gate:** il check `timeline` (LMQP-2/3/5/6) consuma i record → **FAIL bloccante**
se incoerente. Così il Freeze e la coerenza overlay↔3D **entrano nel gate** (chiude W3/W4).
**Proprietà:** solo osservazione/log, zero effetto su stato/render → gate-safe by construction.

### 3.4 Cosa NON facciamo (REJECT motivati — dettaglio in DECISION_LOG)
- ❌ Fisica/collisioni reali (Cap. 6.5/7.11) — simulatore, costo/rischio/perf, Regola Zero.
- ❌ Modulo dinamico 22-uomini runtime (Cap. 8.4) — cambia genere.
- ❌ Portiere proprio giocabile / fuorigioco reale / difesa a zona completa — identità (l'Eroe
  è un attaccante) + scope.
- ❌ QA Engine runtime auto-correttivo/rigenerativo (Cap. 11.2/11.12) — anti-pattern per file
  singolo; sostituito da M1 (coerenza a monte) + M3 (asserzioni dev-only).
- ❌ Migrazione `deriveIntent` text-free — mechanical, ~56 override, **valore-Eroe nullo**.
- ❌ Audio/voce (Cap. 5.9) — gioco silenzioso per scelta store.

---

## 4. Priorità

| Priorità | Item | Perché ora | Doc di dettaglio |
|----------|------|-----------|------------------|
| **P0** | **M1 Unified Outcome Model** | Chiude la violazione di coerenza più visibile; funzione pura, basso rischio, gate-estendibile | PLAN §M1 |
| **P0** | **M3 Coherence Assertion Layer** | Rende M1 *verificabile* e porta il Freeze nel gate; solo log, rischio minimo | PLAN §M3 |
| **P1** | **M2 Match Memory** | Realizza «la partita è una storia» (Cap. 1.7/5.6/9); additivo, non salvato | PLAN §M2 |
| **P2** | Polish P1 (chip/GK C-05) | Incoerenza animazione localizzata, fix chirurgico | PLAN §P1 |
| **P3** | Polish P2 (locomozione ball-carry) | Gate-cieco, solo dal vivo, basso valore/coerenza | PLAN §P2 |
| **Defer** | deriveIntent text-free, personalità NPC, esultanze contestuali, replay selettivo | Valore-Eroe marginale o fuori perimetro | — |
| **Reject** | Fisica reale, modulo dinamico, GK giocabile, QA runtime auto-correttivo, audio | Regola Zero / identità / anti-pattern | DECISION_LOG |

**Nota di sequenza:** **M1 e M3 vanno insieme** (M3 senza M1 segnala solo il problema; M1 senza
M3 non è protetto da regressioni future). M2 è indipendente e può seguire.

---

## 5. Conclusione della review

Il Live Match è un motore **sano e con un'identità forte**, non un motore da rifare. Le tre
promesse del manifesto oggi non mantenute — **coerenza assoluta**, **continuità narrativa**,
**validazione dell'invariante** — si chiudono con **tre interventi additivi, deterministici e
in gran parte su codice puro**, senza aumentare la complessità e senza toccare l'identità.
Tutto il resto del manifesto o è **già implementato**, o è **giustamente respinto** perché
porterebbe verso un simulatore tradizionale (esplicitamente vietato) o verso un runtime
complesso (esplicitamente non voluto).

> **Attesa approvazione del proprietario prima di scrivere una sola riga di codice** (Regola
> finale del brief). I documenti operativi (`IMPLEMENTATION_PLAN`, `TEST_PLAN`, `RISK_REGISTER`,
> `DECISION_LOG`) dettagliano milestone, test, rischi e decisioni.
