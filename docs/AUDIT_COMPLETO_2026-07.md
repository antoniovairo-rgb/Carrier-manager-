# AUDIT COMPLETO DEL PROGETTO — Revisione Tecnica e Game Design
**Career Player Manager (Elevora) · versione auditata 5.74.0 · 2026-07-02**

> **Metodo.** Audit in sola lettura (nessun file di gioco modificato) condotto da 6 analisi specialistiche parallele — Situations/Azioni, Motore di partita, IA/3D, UI/UX, Carriera/Bilanciamento, Architettura/Bug — con verifica incrociata manuale delle affermazioni più gravi direttamente sul sorgente. Baseline QA: quality gate completo eseguito in apertura d'audit → **13/13 verde, fingerprint 00001505, 0 failure** (con 109 warn su `movements`, perf headless 6.8fps / heap 69.9MB / load 6455ms).
>
> **Nota sulle righe.** I riferimenti `r.XXXX` sono verificati sul file a 20.137 righe di questa revisione. La mappa in CLAUDE.md è sfasata di ~300–600 righe (es. `SITUATIONS` reale: r.1783–2200; `initStandings` reale: r.5057).

---

## TESI CENTRALE DELL'AUDIT

Il progetto ha **due anime di qualità molto diversa**:

- **L'infrastruttura è da team serio**: pipeline Intent→Decision→Simulation ben isolata e seedata (`decideExecution`, `resolveDefensiveOutcome`), gate a 13 check con timeline semantica e baseline di regressione, migrazioni save v1→v7 capillari, autosave con gestione quota, error boundary con export di backup, build offline per lo store con validatore, coerenza CINE difesa da invarianti.
- **Il cuore del gameplay non la usa.** L'esito di OGNI azione del giocatore è un singolo `Math.random()` non seedato (r.9926) contro una percentuale in cui le 3 opzioni differiscono in media di 3,1 punti; il Decision Engine seedato viene interrogato solo DOPO, e solo per scegliere il *flavor* del fallimento. La partita attorno all'eroe non è simulata: l'avversario segna quasi solo quando l'eroe fallisce un highlight difensivo, i compagni praticamente mai (~1 gol BG ogni 20 partite), `oppGoalProb` è dead code (r.2721). Momentum e possesso sono strumentazione senza attuatori.

**La conseguenza:** il gioco È divertente nei primi atti (arco U18→pro genuino, presentazione 3D sopra la media, regia/cronaca curate) ma è "un teatro costruito attorno all'eroe", non una simulazione — e ogni sistema costruito sopra (bilanciamento, highlights, IA, carriera) eredita questa fondazione. La buona notizia: **i motori giusti esistono già nel codice e sono spenti**. Gran parte del lavoro non è costruire, è **collegare**.

---

# 1. CRITICITÀ BLOCCANTI

### BLK-1 · Soft-lock della partita: ReferenceError `_sctx76` congela il clock ✅ *verificato manualmente*
- **Descrizione:** quando l'avversario segna dalla cronaca BG prima del 75', viene accodato un highlight reattivo (r.9684). Al tick in cui la coda viene processata, r.9577 usa `_sctx76`, che però è dichiarata `const` **dentro il callback di `setClock`** a r.9655 — scope diverso e successivo. Alla r.9577 l'identificatore non esiste → **ReferenceError ad ogni tick**, l'eccezione abortisce il callback prima di `setClock`: il clock si congela, la coda non si svuota, **la partita resta bloccata per sempre in `playing`** (il MatchErrorBoundary non cattura errori fuori dal render).
- **Gravità:** Bloccante · **Impatto:** partita persa, utente costretto a ricaricare. Mascherato solo dalla rarità del trigger (~2–3% delle partite, per colpa di MOT-1 che rende rarissimi i gol BG). Gate-cieco (il gate non esercita il tick `playing`).
- **Causa tecnica:** variabile fuori scope, r.9577 vs r.9655.
- **Soluzione:** calcolare il contesto inline a r.9576: `const _sc=scoreRef.current; const scoreCtx=_sc.home>_sc.away?"winning":_sc.home<_sc.away?"losing":"drawing";`
- **Complessità:** S (1 riga) · **Rischio regressione:** nullo.

### BLK-2 · L'esito delle azioni non è simulato: dribbling (e tutto il resto) è un coin-flip + testo ✅ *verificato manualmente*
- **Descrizione:** il sospetto del proprietario è **fondato e più ampio del dribbling**. Catena verificata: scelta azione → r.9926 `ok=Math.random()<clamp((rate/adapt)+(Math.random()-.5)*.06,0.05,0.84)` — un singolo lancio di moneta non seedato. Non esiste duello 1v1: gli avversari **non hanno attributi** (`generateTeamRoster` r.4875 genera solo `{name,role}`); la "distanza difensore" è un timer astratto partito random a 80–100 (r.9326), non la posizione del marcatore 3D; le posizioni reali dei 22 (Football State) non entrano mai nella risoluzione. `decideExecution('dribble')` — che ha la struttura giusta (dribbling 60% + velocità 25% + tecnica 15%, esiti `beat_man/fouled/dispossessed`) — è invocato solo su fallimento già deciso, per il flavor. Un dribbling `rew:"goal"` riuscito è **direttamente un gol** (saltare l'uomo e concludere collassati in un roll).
- **Gravità:** Bloccante (di design, rispetto al charter Simulation-First — non un crash).
- **Impatto:** dribbling, passaggi e tiri sono meccanicamente indistinguibili: cambia la stat letta e l'animazione. La stat `dribbling` è usata da 24/537 azioni; `mentalità` da 7, `posizionamento` da 6.
- **Causa tecnica:** doppio motore probabilistico — `succRate` (non seedato, governa) vs `decideExecution` (seedato, decorativo); r.9924–9945.
- **Soluzione:** fare di `decideExecution` l'**unica** sorgente d'esito (seed già costruito a r.9940); `succRate` resta come display %. Per il dribbling: micro-duello a 2 fasi (superamento vs pressure/difensore sintetico derivato da prestige+ruolo+seed, poi decisione successiva con px avanzato).
- **Complessità:** M–L · **Rischio regressione:** alto sul bilanciamento percepito → serve baseline analitica node prima/dopo + nuovo `decision-baseline.json`. È **il** fix architetturale che sblocca quasi tutto il resto.

### BLK-3 · Play Store: requisiti di packaging non ancora dimostrati (procedurale)
- **Descrizione:** Play richiede target API level recente (API 35); la roadmap è ferma a "1.3 Capacitor → AAB". `capacitor.config.json` è sano, ma versioni Capacitor/Gradle non fissate = requisito non dimostrato. In più il bundle store contiene hook di test/cheat raggiungibili (BLK non tecnico ma da chiudere prima della submission — vedi ARC-5).
- **Gravità:** Bloccante procedurale per il rilascio (non per il gioco).
- **Soluzione:** completare 1.3 con versioni pinnate + strip degli hook di test nella dist. **Complessità:** M · **Rischio:** basso.

---

# 2. PROBLEMI GRAVI (Alta)

### MOT-1 · Non esiste una simulazione della partita attorno all'eroe ✅ *verificato manualmente*
- **Descrizione:** gol dell'eroe → highlight; gol subìto → quasi solo se l'eroe fallisce un HL difensivo con `fail:"goal_against"` (28 azioni su 537); gol di compagni/avversari dalla cronaca → 2 voci con peso 0.4 su un pool di ~328 (r.2276–2277) ⇒ ~0,024 gol/squadra/partita, **un gol BG ogni ~20 partite**. `oppGoalProb(oppPrestige,playerOvr)` — la funzione pensata per legare forza avversaria e gol — è **dead code** (r.2721, mai chiamata). Il marcatore del `team_goal` è `homeRoster[Math.floor(Math.random()*10)]` (r.9668): nessuna azione a monte.
- **Impatto:** win-rate live 85–95% **indipendente dall'avversario** (unico effetto della forza avversaria: `diffPenalty` max −24% in succRate); giocando dalla panchina il punteggio resta 0-0 per un'ora; risultati live ≈1,4–2,0 gol totali (calcio reale ~2,7); "il club dell'eroe vince il campionato quasi a prescindere".
- **Causa:** roll fisso su timer, cieco a prestige/OVR/momentum/possesso (r.9663–9684).
- **Soluzione:** micro-simulatore di sfondo per-segmento con λ Poisson da prestige/OVR/momentum (la matematica esiste già in `simulateMatch`, seedarla), che generi occasioni→tiri→gol per entrambe le squadre e **alimenti** le voci BG (testo scelto dall'esito, non viceversa). Riattivare `oppGoalProb`.
- **Complessità:** M · **Rischio:** medio (tick BG gate-cieco → test analitico node sulla distribuzione risultati + collaudo dal vivo). **È il moltiplicatore di tutto.**

### SIT-1 · La selezione delle situations avviene PRIMA del calcio d'inizio, non dalla partita
- **Descrizione:** `selectContextualSituations` (r.8595) è chiamata **una sola volta** nell'inizializzatore di `useState` (r.8813) con `scoreCtx="drawing"` e `clock=0`; i pesi dipendono dalle stat del giocatore, non dallo stato della partita. I momenti degli HL sono tempi pre-generati quasi equispaziati 8'–84' (r.8805). Possesso, momentum, tattica, meteo e posizione palla della cronaca **non influenzano né quale situation esce né quando**. Uniche eccezioni: 3 iniezioni score-driven (60' sotto di 1, 72' sotto di 2, coda reattiva — che è rotta, BLK-1).
- **Impatto:** "Contropiede! Campo aperto" col 75% di possesso; scene estratte da un mazzo, non generate dalla partita. È esattamente la lamentela del proprietario («situations che raccontano una storia diversa»).
- **Soluzione:** selezione **lazy per-highlight** al trigger, con contesto vivo (possesso→bias off/def, momentum→zona, ball-side cronaca→startZone, drift tattico→intent). L'infrastruttura c'è già (l'estrattore accetta scoreCtx/clock; `possessionRef`/`momentumRef` esistono).
- **Complessità:** M · **Rischio:** medio-alto (selezione HL dichiaratamente gate-cieca → collaudo dal vivo).

### SIT-2 · 36 situations si presentano con 2 sole azioni; 15 in modo strutturale (dead data)
- **Descrizione:** nel DB tutte le 179 situations hanno 3 azioni; è `filterSitActions` (r.2215–2254) a rimuoverle a runtime (azioni-gol soppresse sotto soglia di distanza, aeree senza palla aerea, fallback `.slice(-2)`). **36/179 partono con 2 opzioni**; **15 restano a 2 qualunque cosa faccia il giocatore** (elenco completo in appendice A); 9 hanno azioni-gol che il filtro rimuove SEMPRE = contenuto morto pagato in authoring.
- **Impatto:** scelta povera proprio dove il gioco chiede "costruzione" (centrocampo/verticalizzazioni). Conferma la segnalazione del proprietario.
- **Soluzione:** data-fix delle 15 strutturali (sostituire l'azione-gol impossibile con passaggio/conduzione con reward legale); in generale, **rimpiazzare** (non solo filtrare) l'azione rimossa con un'alternativa dal pool dell'intent.
- **Complessità:** S (data-fix) / M (rimpiazzo dinamico) · **Rischio:** basso/medio (filterSitActions è coperto dal gate).

### SIT-3 · Le 3 opzioni sono in gran parte cosmetiche: spread medio 3,1 punti, 68 azioni dominate
- **Descrizione:** in `succRate` (r.2682) il `bon` autoriale pesa ±12 punti max ma in pratica le triple hanno spread medio **3,1pp** (172/179 ≤8pp); il movimento vale ±2pp; **53/179 situations hanno la stessa reward su tutte e 3 le azioni**; **68/537 azioni sono strettamente dominate** (stessa reward, prob. più bassa, energia maggiore — es. la Rovesciata vs Tiro di prima) e la giocata spettacolare **non rende nulla in più** (r.9969: `rb+=5` per ogni gol, indipendente dall'azione). Risk/reward invertito.
- **Impatto:** giocatore ottimale = sempre l'opzione col bon più alto; la varietà autoriale delle 537 azioni collassa su un archetipo di scelta.
- **Soluzione:** payoff differenziato (gol spettacolare → +popularity/+morale/+rating extra; opzione sicura → conserva possesso ma meno xG); allargare la forbice (es. `bon*0.012`).
- **Complessità:** S (payoff) / M (ribilanciamento) · **Rischio:** basso-medio.

### SIT-4 · Assist riuscito = gol automatico del compagno, sempre
- **Descrizione:** `key==="assist"` → `setScore(+1)` incondizionato (r.9969). Non esiste "occasione creata ma sprecata". `decideExecution('through')` prevede proprio gli esiti `chance`/`offside`/`overhit` — **tutti inutilizzati**. Il ricevente 3D reale esiste (r.7236–7253) ma è scelto DOPO la decisione, per l'animazione.
- **Impatto:** conversione irrealistica dei passaggi chiave; la geometria (linee di passaggio, F10 dell'AI) non conta nulla meccanicamente.
- **Soluzione:** consumare l'outcome del DE: `assist`→gol; `chance`→**chain automatica** su una CHAIN_SIT di finalizzazione (il chaining esiste già!); `offside/intercepted`→fallimenti differenziati. Il fix più a buon mercato dell'audit: riusa due sistemi esistenti.
- **Complessità:** M · **Rischio:** medio (cambia la conversione attesa → ribilanciare `bon`).

### BIL-1 · Crescita OVR ~3× troppo veloce e SENZA declino: OVR 90 alla stagione 5
- **Descrizione (matematica verificata):** si parte a OVR ~62–67 (non 50); il piano training automatico punta sempre le 2 stat più deboli → si resta sul gradino alto della curva `_dim` → +9/10 OVR a stagione sotto quota 65, +4 a quota 80. Traiettoria: S1 ~73 → S3 ~84 → S5 ~90 → S8 ~94 → 96–99 a fine carriera. Il decadimento d'età toglie **max ~1,3 stat/stagione a 35+** mentre il training ne aggiunge ~12: **l'OVR non scende MAI**; un 38enne si allena come un 17enne (r.13330 senza modificatore d'età).
- **Impatto:** la parabola discendente — metà dell'arco narrativo di un career sim — non esiste; le gerarchie/panchina (che ESISTONO e sono ben progettate, vedi BIL-5) evaporano in 1–2 stagioni scavalcate dalla curva di potenza; i `LEAGUE_RECORDS` si sfondano in 1–2 stagioni.
- **Soluzione:** moltiplicatore d'età su `_dim`/`_mult` (×1.0 fino a 26, ×0.6 a 28–30, ×0.25 a 31–33, ×0.05 a 34+) + decay settimanale dai 31. ⚠️ il codice training è **duplicato** (r.13330 e r.15112): cambiare ENTRAMBI.
- **Complessità:** S · **Rischio:** basso (fuori gate; validare con `runCPMTest50`, da estendere al training che oggi non simula).

### BIL-2 · L'adaptive difficulty cancella la sensazione di crescita (e il morale alto PENALIZZA)
- **Descrizione:** `adaptiveDifficulty` (r.2702) **divide** il rate fino a ÷1,35 (+0.12 se ovr>80, +0.18 se gpg>1.2, **+0.05 se morale>85**). Conto verificato: giocatore stat 90 prolifico → 43,3% di successo; giocatore stat 65 mediocre → 43,2%. **Identici.** Cinque stagioni di grinding = zero potenza percepita.
- **Impatto:** il tradimento peggiore possibile del contratto di progressione di un career game.
- **Soluzione:** rubber-banding SOLO su gpg (anti-farm), mai su OVR; rimuovere il malus morale; il vantaggio OVR deve restare netto (+8/10pp a 90).
- **Complessità:** S · **Rischio:** basso.

### BIL-3 · Form e morale non toccano la partita giocata; i soldi non esistono
- **Descrizione:** nel roll d'azione (r.9912–9926) entrano fatica (max −10%), momentum (±5%), meteo, tattica — **né `form` né `morale`**. Il morale entra solo nel ctx del DE (flavor estetico). Il loop "gioco male→morale giù→gioco peggio" non esiste in campo. Parallelamente `contract.wage` (curve credibili, 60k→20M€/anno) **non viene mai accumulato**: nessun balance, nessuna spesa; l'agente si ingaggia gratis e dà +15% per sempre (no-brainer). `player.value` non è mai ricalcolato dall'OVR e ha un **bug di display ×10** (r.19137 `valK=valRaw*10000` → "€8.0M" dove il profilo dice "0.8M€").
- **Soluzione:** ±4% da form e ±2% da morale nel rate (con floor anti-spirale); `player.bankBalance` + 3–4 sink veri (personal trainer→mult training, nutrizionista→−fatica, agente che COSTA il 10%); `value=f(ovr,age,form,popularity)` settimanale + fix display.
- **Complessità:** S (form/morale) + M (economia, richiede SAVE_VERSION 8) · **Rischio:** basso/medio.

### BIL-4 · Il training non è un sistema di gioco: si esegue da solo
- **Descrizione:** dal Sprint 140 il piano è deciso dal mister, si auto-esegue al mount del pannello (r.13294) e — se non apri il tab — viene comunque eseguito identico all'avanzamento settimana (r.15093). Il recovery è auto-inserito sopra fatica 65. Il giocatore non decide **nulla** della propria crescita; gli infortuni da training non esistono (contraddicendo il tutorial che li promette).
- **Impatto:** zero agency, zero build-crafting, ogni carriera converge a stat piatte.
- **Soluzione:** scelta manuale del focus settimanale (3 slot con suggerimento del mister; auto come fallback), rischio infortunio se ci si allena oltre fatica 75, allenare stat favored = più resa/più fatica.
- **Complessità:** M · **Rischio:** basso.

### BIL-5 · Esiste una sola carriera (attaccante) e nessuna vera sconfitta
- **Descrizione:** `position:"Attaccante"` è **hardcoded** alla creazione (r.12015); 3/179 situations difensive "vere", zero da portiere; i rami Portiere/Difensore a r.15405 sono codice morto. Le sconfitte sistemiche sono indolori: la retrocessione non tocca contratto né crescita; il licenziamento/svincolo forzato non esiste (il club non rifiuta MAI il rinnovo); l'infortunio max 12 settimane senza conseguenze permanenti. **Nessuna condizione di game-over o setback strutturale in 20+ stagioni.** Nota: contrariamente a CLAUDE.md, `calcCoachDecision`/panchina/gerarchie **sono implementate e ben progettate** (r.4177–4249) — ma `not_called` richiede trust<12 (quasi irraggiungibile) e in coppa/nazionale si è sempre titolari.
- **Impatto:** la seconda run è la prima con un altro nome; la carriera è un ascensore che sale sempre.
- **Soluzione (a corto raggio):** dichiarare il gioco "simulatore di attaccante" e togliere il campo fantasma; differenziare gli archetipi via situations offerte (trequartista→più HL di passaggio, velocista→più 1v1); rifiuto rinnovo se trust<40/riserva → svincolo con offerte da club minori; retrocessione→taglio stipendio/lista cessioni. Ruoli veri = progetto L (mesi), da decidere come direzione prodotto.
- **Complessità:** S/M (corto raggio) / L (ruoli) · **Rischio:** medio.

### IA-1 · "Reverse boomerang": ogni fallimento non-tiro trascina la palla nell'area avversaria
- **Descrizione:** su fallimento (non-def, non-palo) si attiva sempre `hlPostArcType="deflect"` (r.7070) il cui handler tira la palla verso `AWAY_GOAL_X-7` (r.7138) — pensato per i tiri, applicato anche a passaggi intercettati/dribbling persi a centrocampo: la palla intercettata a x≈50 plana da sola fino all'area avversaria per ~2,5s. Il contrario di "possesso all'avversario".
- **Soluzione:** nel ramo deflect, se l'intent non è shot-family, assestare la palla sul punto d'intercetto o sull'interceptor. **Complessità:** S · **Rischio:** basso (gate-cieco).

### IA-2 · "Fuori", "corner" e "gol subito" non hanno realizzazione 3D
- **Descrizione:** (a) sui tiri fuori la palla arriva allo specchio e **rimbalza indietro in campo senza contatto**, col GK che si tuffa comunque (trigger incondizionato r.7303) — l'overlay dice FUORI, il 3D mostra una parata fantasma; M1/M3 validano la *famiglia* d'arco, non la geometria → passa il gate per costruzione; (b) l'esito `corner` è normalizzato a "saved" (r.2544), l'angolo non si batte mai; (c) su `goal_against` il punteggio sale e la cronaca lo racconta, ma **nessuna palla entra nella porta di casa** (il ramo `P.hlDef` non ha post-arco per il fail) — l'evento più drammatico di un HL difensivo è visivamente un dribbling innocuo. La palla, in fase offensiva, **non esce mai dal campo**.
- **Soluzione:** target oltre la linea per wide/out (niente tuffo o tuffo a vuoto), palla alla bandierina per corner, ramo `hlDef && goal_against` → arco verso HOME_GOAL + tuffo GK casa + in_net speculare (oggi hard-coded su AWAY_GOAL).
- **Complessità:** M · **Rischio:** medio (fireConclusion, collaudo dal vivo).

### IA-3 · Reparto portieri a metà: GK di casa inerte, clip catch/block morte, tuffi sui cross
- **Descrizione:** solo `awayGkMesh` riceve gesti/tuffo; il **GK di casa non si tuffa mai**. `anim-gk-catch.glb`/`anim-gk-block.glb` sono caricate e mai usate (r.8016: `_gkWant` solo 'dive'). Il tuffo scatta anche sui cross (r.7303). Le uscite F13 sono disattivate durante gli HL → nei 1v1 il portiere resta piantato sulla linea (F13 vive solo nel BG dove non lo guarda nessuno). Punti a favore: direzione tuffo coerente col lato del tiro, portata legata all'esito M1, bound del gate rispettati.
- **Soluzione:** catch per cross verso il GK, block per 1v1, ramo dive per il GK di casa, F13 ridotto nei pattern 1v1. **Complessità:** M · **Rischio:** medio (bound orientation/initial-state da rispettare).

### UX-1 · Il bug del "cursore direzionale" confermato: lo skip da `playing` bypassa il routing ✅
- **Descrizione:** il DPad è per design un pad di **movimento** (sui rigori c'è la griglia `RIGORE_ARROWS`), ma: (a) lo skip "0" da `playing` (r.10231) salta a `hl_move` SENZA il routing di r.9325–9328 (`maxMoves===0→hl_choose`, reset movesLeft/pressure/defDist) → un HL in area o un rigore entra in `hl_move` col **DPad visibile e `movesLeft` residuo dell'HL precedente** — il percorso che riproduce esattamente la segnalazione del proprietario; (b) il tap-skip di `hl_intro` (r.10569) duplica la logica e diverge: usa `maxMoves` grezzo invece di `cappedMM()` (ignora il cap da pressure: chi tocca ottiene più mosse di chi aspetta) e non resetta `defDist`; (c) 4 punti di mount con guardie incoerenti + su mobile il pad resta visibile **spento a opacity 0.3** con handler no-op ("pad fantasma").
- **Soluzione:** un'unica `startHL()` condivisa (timeout/keydown/tap) + condizione unica `showDPad(sit,movesLeft)` per i 4 mount + rimozione del ghost. Etichetta "MUOVITI" sul pad per non farlo leggere come mirino.
- **Complessità:** S · **Rischio:** basso (path gate-cieco → collaudo dal vivo).

### UX-2 · Il loop decisionale è illeggibile: probabilità invisibili, fallimenti che non insegnano
- **Descrizione:** (a) `succRate` è calcolata per ogni azione ma **mai mostrata**: codifica solo il colore del bordo ad alpha 0x33 — indistinguibile su mobile. Il cuore del gameplay (scelta rischio/rendimento) è al buio; (b) `hl_result` mostra ✅/❌+flavor ma il motore SA il perché (pressione, fatica, piede debole, quality) e non lo dice mai; (c) il tutorial (5 step) copre solo la shell: **zero onboarding del match** (DPad, mosse, pressione, colori azioni, griglia rigori).
- **Soluzione:** % o pallini ●●●○ sui bottoni (o fasce "Sicura/Rischiosa" se il numero rompe l'immersione — decisione PO); una riga causale nel result ("Difensore addosso: −15%", "Piede debole"); 3 micro-tooltip one-shot nel primo HL.
- **Complessità:** S+M · **Rischio:** basso.

### ARC-1 · Il gate certifica un gioco strumentato, non quello reale
- **Descrizione:** sotto `?cpmtest=1` il gioco **sostituisce `Math.random` globale** con PRNG seedato (r.148–152) → il check `determinism` è tautologico (verifica che un PRNG seedato sia seedato); le situations sono forzate (selezione/chaining/transizioni MAI esercitate), GLB OFF, `dt=0`. Il "golden" è una firma di 5 campi logici, robusta ma debolissima come oracolo (un bug che rompe tutte le posizioni off-ball passa al 100%). **La parte di gioco che l'utente percepisce come "il gioco" (movimento, transizioni, GLB, selezione HL) è collaudo manuale.** BLK-1 è la prova vivente del blind spot.
- **Soluzione:** (a) promuovere `live-match-test.mjs` a gate bloccante ridotto (1 partita reale end-to-end GLB-ON); (b) sostituire il patch globale di Math.random con iniezione di RNG nei punti legittimi; (c) estendere la firma golden con hash delle posizioni off-ball a t=0.
- **Complessità:** M · **Rischio:** basso (solo harness).

---

# 3. PROBLEMI MEDI

| ID | Problema | Causa (riga) | Soluzione | C | Rischio |
|----|----------|--------------|-----------|---|---------|
| MOT-2 | Momentum leva ±5% max, possesso **zero effetti** meccanici (solo visuale/testi): due widget HUD che non muovono la partita | r.9918, 8989–8993 | collegare alle λ del micro-sim (MOT-1) + momentumBonus ±10–12%, possesso derivato dagli eventi | M | medio |
| MOT-3 | Classifica internamente incoerente: l'avversario reale non riceve il risultato (rigioca un'altra partita); somma gf≠ga di lega; 3 motori risultato paralleli | r.5074–5077 | risultato speculare all'avversario + pairing dal calendario | S/M | basso |
| MOT-4 | Logica dell'intervallo quasi morta: riassunto/reset 45' scattano solo se un evento BG esce ESATTAMENTE al tick 45 (~25% delle partite) | r.9740–9746 dentro `if(Math.random()<_bgProb)` | check `nx===45` dedicato fuori dal roll | S | basso |
| MOT-5 | Cronaca che può mentire: voci senza `ctx` che assumono uno stato ("deve sbloccarla!" sul 3-0, "possesso 68%" vs HUD 42%); fallback wPick ignora ctx; `opp_red` non rimuove nessuno e può ripetersi | r.2310, 2342, 9665, 9685 | ctx sulle voci implicite; fallback che mantiene ctx; stato oppRedCount con effetto | S/M | basso |
| MOT-6 | Statistiche di fine partita false: i tiri dell'eroe negli HL **non contano come tiri** (solo le voci BG incrementano `shots`) — 3 gol con "2 tiri totali" | r.9721 | incrementare in handleAction per gli intent di conclusione | S | nullo |
| MOT-7 | Ritmo rigido: HL quasi equispaziati 8'–84', stessa struttura ogni partita; match reale in 1,5–3 min senza cesura al 45' | r.8805–8811 | distribuzione a fasi modulata dal momentum + micro-pausa scenica al 45' | S/M | basso |
| SIT-5 | Contestualizzazione narrativa: 4/179 situations con `ctx`; nessun campo minClock/maxClock (esiste per BG_MATCH!); "RIGORE a 5' dalla fine" può uscire al 12'; "Sotto 0-2" esce sullo 0-1; su mismatch l'HL è **perso, non sostituito** | r.1936, 1939, 9623–9625 | campi minClock/maxClock/scoreDiff (pattern BG rodato) + ripescaggio invece di skip | S–M | basso |
| SIT-6 | La difficoltà tattica dichiarata non entra nel roll: "Doppia marcatura" facile quanto "Nessuno ti segue" (pressure/nearby_def toccano solo mosse e flavor); paradosso: pressure high→0 mosse→scelta immediata→defDist ~90→penalità 0 | r.2259, 9326, 9924 | defPenalty da `tactic.nearby_def`+pressure | S | basso |
| SIT-7 | Chaining povero e fragile: 3 catene tutte uguali (finalizzazione in area), trigger regex sul TESTO, la "guardia di profondità" promessa nel commento **non esiste** (può ri-triggerare se stessa); il 25% "⚡CATENA!" entra nella prossima scena pre-schedulata qualsiasi (anche difensiva dopo un attacco riuscito) | r.8716–8732, 10064–10068, 10157 | `_chainDepth` + pool chain per famiglia + CATENA coerente con l'esito | S/M | basso |
| SIT-8 | `deriveIntent` text-driven misclassifica (es. "pressa e riconquista"→intent `onetwo`); 3 situations su zona "fascia" **inesistente** in ZONES | r.1735–1760, 2194–2198 | completare migrazione a `tactic.it` esplicito; normalizzare "fascia" | M | basso |
| IA-4 | Freeze "statue": 21 giocatori immobili per TUTTA la lettura (senza limite: anche 30s), poi pop collettivo allo sblocco perché l'intervallo logico continua a driftare i target | r.7654–7661, 9362–9420 | micro-idle ambientale + congelare anche l'intervallo logico + cutFx d'ingresso | S | basso |
| IA-5 | Geometria delle conclusioni `Math.random()` puro: endpoint di tiri/cross/rigori, lato dello switch, velocità deflect — tutto non seedato (~15 siti in fireConclusion); due run identiche = film diversi; Replay Engine LMQP impossibile | r.7173–7272, 7062–7072 | PRNG seedato `hashStr(sit+act+hlIdx)` (pattern DE) | S | basso |
| IA-6 | Fisica palla: durata arco fissa per tipo → lanci lunghi a ~317 km/h; nel BG la palla parte/arriva senza che nessuno la tocchi; l'ingresso in `hl_intro` da `playing` non ha cut (palla che plana verso lo spot HL) | r.6889, 9799–9823 | durata ∝ distanza + aggancio kick/ricezione ai giocatori logici + cutFx | M | medio |
| IA-7 | Off-ball anchor non calcistiche: durante gli HL gli avversari sono un **anello trigonometrico** attorno all'eroe (`cos(ai*1.4)*spread`) e i compagni sempre DIETRO; il render-loop corregge ma parte da ancore sbagliate | r.9396–9408 | slot funzione di (palla, porta, ruolo) | M | medio (gate campiona) |
| IA-8 | Cross-assist senza finalizzatore: su `cross_goal` la palla si "auto-incorna" (nessuna mesh esegue il colpo di testa, a differenza del pass che ha `_rcvT`) | r.7112–7116 | header gesture sul ricevente del blend | S/M | basso |
| BIL-6 | Mercato sempre aperto se in lista cessioni (`transferListed` bypassa le finestre, 28%/settimana tutto l'anno, accettabile subito) | r.14990 | lista = più probabilità SOLO in finestra | S | basso |
| BIL-7 | Trasferimento a metà stagione: Coppa/Europa spariscono dal calendario ma restano `active:true` (competizioni zombie in UI) | r.15694–15748 | chiusura esplicita cup/euro in acceptTransfer | S | basso |
| BIL-8 | Rinnovo senza rischio (il club non rifiuta mai, `_evalNego` accetta sempre ask≤base); fatica/infortuni auto-gestiti (recovery auto sopra 65) | r.15400, 15662, 13313 | rifiuto rinnovo condizionato + recovery manuale | M | medio |
| BIL-9 | Eventi settimanali senza scelte: ~110 voci ben scritte ma TUTTE `ef` automatici; le decisioni vive sono pochi dialoghi; `WEEKLY_RANDOM_EVENTS` è un pool di 10 | r.969–1094, 14999 | convertire i 20 eventi top in bivi con trade-off | M | basso |
| UX-3 | Attese forzate: `hl_result` NON skippabile su mobile (solo timeout 2–3,4s; desktop ha Enter) ≈ 25s morti/partita; il tap "Pronto" obbligato anche senza movimento (tastiera ha già la scorciatoia 1-3 da hl_move, il touch no) | r.10250–10256, 10698 | tap-to-continue con guardia 800ms + azione diretta da hl_move | S/M | basso |
| UX-4 | HUD: momentum (label 7px alpha 0.22) ridondante col possesso adiacente senza legenda; su mobile la barra energia/rating sparisce durante gli HL — proprio quando serve per pesare un'azione fisica | r.10406–10408, 10861 | consolidare in un indicatore + energia visibile in hl_choose | S | basso |
| ARC-2 | Updater `setPlayer` impuri (setTimeout/Math.random/altri setState dentro gli updater) → StrictMode/concurrent precluse per sempre; doppio stato `standings` sincronizzato a mano per convenzione | r.15041–15088, 9969 | pulizia updater + derivare standings da player.standings | M | medio |
| ARC-3 | Leak: timer non ripuliti in LiveMatch (goalCinema/celeb/chants senza cleanup su unmount) + disposal Three.js incompleto (CanvasTexture folla 2048×512, texture tabellone/bandiere, InstancedMesh, materiali GLB MAI disposed) → VRAM che cresce tra le partite | r.9021–10059, 8078–8085 | tracciare i timeout + scene.traverse con dispose nel cleanup | S+M | basso/medio |
| ARC-4 | Robustezza boot: `localStorage` a module-scope non guardato (r.4531) → **schermo vuoto** con storage disabilitato; `new WebGLRenderer` fuori da try/catch, nessun handler context-lost; nessun flush del save su `pagehide` (swipe-away = ultimi 600ms persi) | r.4531, 6349, 13851 | safeLS helper + try/catch con fallback "match simulato" + flush su visibilitychange | S | basso |
| ARC-5 | Hook di test/cheat nel bundle store: `?sit=N`, `__CPM_FORCE_OUTCOME`, reseed di Math.random via query, `runCPMTest50` — superficie di manipolazione + peso morto | r.148–152, 9927, 20063–20074 | strip nella build-dist con ancore dedicate | M | medio |
| ARC-6 | Determinismo violato nel cuore delle classifiche: `updateStandings`/`simulateMatch` usano Math.random (shuffle r.5077, poissonGoals r.5220) mentre `seededRng`/`seededPoissonGoals` **esistono già** e sono usati per le altre leghe: la lega del giocatore è l'unica non riproducibile | r.5077, 5220, 5240 | passare seededRng(hashStr(clubId)+season·k+week) | S | basso |

---

# 4. PROBLEMI MINORI (Bassa)

| ID | Problema | Riga | Fix | C |
|----|----------|------|-----|---|
| MIN-1 | cpmadapt ombreggia anche la difesa DELL'EROE (byFlank traccia l'eroe ma lo shift si applica a chiunque difenda) | r.7627 | `&& !t.hm` | S |
| MIN-2 | Seed di `_outKind` senza clock/score → due miss identici nella stessa partita = stesso outKind (varietà ridotta) | r.9940 | salare il seed | S |
| MIN-3 | Palla "compagno che imposta" nel BG è un punto immaginario, non una mesh reale | r.9816–9819 | agganciare la mesh home più vicina | S |
| MIN-4 | `fkPenalty` via regex sul testo `/punizion/i` invece che su intent | r.9923 | intent==="freekick" | S |
| MIN-5 | Pesi selezione con catena if/else-if (sit con tiro+passaggio pesa solo sul tiro); peso `def` legato al fisico del GIOCATORE (non documentato) | r.8613–8637 | pesi additivi + documentare | S |
| MIN-6 | Coro post-gol legge `score` stale dalla closure | r.9737 | scoreRef | S |
| MIN-7 | `matchEvents` col trucco min+1 può spingere eventi oltre il 90'; recupero solo testuale | r.9969 | clamp 90+recupero reale | S |
| MIN-8 | Enfant Prodige "crescita x2" NON implementata (promessa falsa alla creazione) | r.2939 | mult ×1.3 se age<23 o correggere il testo | S |
| MIN-9 | Prima stagione pro senza Coppa Nazionale (ProTransition non inizializza `cup`) | r.15594 | init newCup nel ramo | S |
| MIN-10 | KO europei schedulabili oltre W38 se le safety net scattano tardi (torneo risolto solo dal reset stagionale) | r.14839, 14314 | clamp a 37 | S |
| MIN-11 | Drift morale assente (resta a 15 per mesi anche vincendo tutto) vs form che regredisce a 65 | r.15075 | drift 5%/settimana verso 60 | S |
| MIN-12 | Cap velocità documentato 15–20 u/s ma reale 8 u/s (doc disallineata); lerp esponenziale eroe senza cap (~70 u/s su re-target lontano) | r.6943 | cap sull'eroe + fix doc | S |
| MIN-13 | GLTFLoader/SkeletonUtils senza fallback CDN (React/Three/Babel ce l'hanno) | r.67–68 | fallback jsdelivr→cdnjs | S |
| MIN-14 | Spinner timeout 15s senza messaggio d'errore (CDN giù = body vuoto muto) | r.117 | messaggio "controlla la connessione" | S |
| MIN-15 | build-dist ancorata a stringhe magiche (commento '5.39.1 (BL-01)') | tools/build-dist.mjs:30–49 | ancore dedicate DIST:CDN-START | S |
| MIN-16 | Troncamento silenzioso calendario >18 club (latente, mitigato dal cap in getLeagueClubs) | r.4913, 2734 | log esplicito | S |
| MIN-17 | ~100 label sotto i 10px (24× fontSize:7); bottoni DPad 40px < 44/48px touch standard | r.10654+ | ≥48px su narrow, label critiche ≥10px | S/M |
| MIN-18 | Mix ita/eng ("Calendar, Standings e Profile" nel tutorial!, "auto / Enter →", "mov") | r.13243+ | pass di localizzazione | S |
| MIN-19 | Emoji-density da chat nella cronaca (ogni voce BG apre con emoji) vs registro broadcast del charter | r.2276+ | tenerle solo su eventi cardine ⚠️ testi lintati da bg-coherence | M |

---

# 5. BUG INDIVIDUATI

**Confermati (verificati sul codice, deterministici):**

| ID | Bug | Riga | Gravità |
|----|-----|------|---------|
| BUG-1 | Soft-lock `_sctx76` fuori scope → clock congelato (=BLK-1) ✅ verificato a mano | 9577 vs 9655 | **Bloccante** |
| BUG-2 | U18: fine stagione a `weekVal>=38` con early-return PRIMA dell'auto-sim → l'ultima giornata di week 38 sparisce (il pro usa `>38`) ✅ verificato a mano | 14714 vs 14740 | Alta |
| BUG-3 | Timer non ripuliti in LiveMatch → setState post-unmount (goalCinema, celeb, chants senza cleanup) | 9021–10059, 9138–9146 | Alta |
| BUG-4 | Disposal Three.js incompleto → accumulo VRAM tra le partite | 8078–8085 | Alta |
| BUG-5 | Boot crash con storage disabilitato (localStorage a module scope) ✅ verificato a mano | 4531 | Media |
| BUG-6 | `updateStandings`/`simulateMatch` non deterministici (violazione regola CLAUDE.md; l'infrastruttura seedata esiste ed è usata SOLO per le altre leghe) | 5077, 5220 | Alta |
| BUG-7 | Il check `determinism` del gate è tautologico (Math.random patchato globalmente sotto ?cpmtest=1) | 148–152 | Alta (meta) |
| BUG-8 | `oppGoalProb` dead code ✅ verificato a mano | 2721 | Alta (sintomo di MOT-1) |
| BUG-9 | Skip "0" da playing bypassa il routing HL (DPad/movesLeft stantii — la segnalazione del proprietario) | 10231 | Alta |
| BUG-10 | Tap-skip di hl_intro ignora `cappedMM` (chi tocca ottiene più mosse) e non resetta defDist | 10569 | Media |
| BUG-11 | `player.value` mostrato ×10 diverso in due schermate (agente "€8.0M" vs profilo "0.8M€") | 19137 vs 18819 | Media |
| BUG-12 | Sit. `ctx:"losing"` "Sotto 0-2" esce anche sullo 0-1; HL con ctx-mismatch perso e non sostituito | 1939, 9625 | Media |
| BUG-13 | 3 situations su zona "fascia" inesistente in ZONES | 2194–2198 | Bassa |
| BUG-14 | Chain header può ri-triggerare se stessa (guardia di profondità dichiarata nel commento ma non implementata) | 10064 | Bassa |
| BUG-15 | `opp_red` non rimuove giocatori e può ripetersi (doppia espulsione con 11 in campo) | 9685 | Bassa |
| BUG-16 | Coro post-gol legge score stale dalla closure | 9737 | Bassa |
| BUG-17 | WebGLRenderer senza try/catch né handler context-lost | 6349 | Media |
| BUG-18 | Intervallo (riassunto+reset 45') scatta solo nel ~25% delle partite (annidato nel roll BG) | 9740–9746 | Media |

**Potenziali (probabili, da confermare a runtime):** GLB all-or-nothing (`Promise.all` su 11 file, un fail = tutto procedurale in silenzio, r.6489); ~32 catch silenziosi senza contatore; auto-tackle su timeout costruisce un outcome senza `outKey` (esito fantasma per il layer LMQP, r.10266); rigore interattivo `Math.random()<0.55|0.88` hardcoded senza stat/DE/eventi timeline (r.10089–10126); KO europei oltre W38.

**Non-bug notevoli (verificati sani):** caccia ai NaN negativa (denominatori difesi ovunque); migrazioni save v1→v7 complete (~60 campi); autosave debounced con quota gestita; `calcOvr` divide per 11.5 con pesi che sommano 12 → OVR +4,3%: probabile tuning intenzionale, da **documentare** perché chiunque lo "corregga" sposta l'intero balance.

---

# 6. DEBITO TECNICO

1. **Doppio motore probabilistico** succRate (governa, non seedato) vs decideExecution (decorativo, seedato) con mappa di conversione manuale `_neg` — il debito n.1, radice di BLK-2/SIT-3/SIT-4. [Alta]
2. **Testo come API**: deriveIntent regex su sit.text (misclassifica), trigger chain regex sul testo, fkPenalty regex `/punizion/i` — i testi non sono liberi, ogni riscrittura è a rischio. [Alta]
3. **8 famiglie di logica duplicata con drift già in atto**: formula prestige→λ in 4 copie; poissonGoals/seededPoissonGoals gemelle divergenti; tie-break KO in ~6 copie (una già con costante diversa: 0.5 vs 0.55); training gain duplicato (r.13330/15112); entry matchHistory inline 8×; log prepend 15×; voce calendario coppa 7×; aging duplicato. [Media]
4. **46 globali `window`** come colla LiveMatch↔ThreeMatchView↔gate, contratto implicito. Consolidare in `window.__CPM={}` popolato in un punto. [Media]
5. **Cap di crescita array incoerenti**: matchHistory/log/diary cappati ovunque, ma `history` cappata in 1 sito su 3, `worldMemory` in 1 su 4, offerHistory/achievements mai — serve `capPush(arr,item,n)`. [Bassa]
6. **Mappa CLAUDE.md stale** (~300–600 righe di sfasamento) + claim non più veri ("matchStatus non implementato" — lo è; "avvio 1–2s" — transpile misurato 4,7s/280MB heap su desktop). Generarla via script. [Media]
7. **Re-render monolitico**: ogni setPlayer ri-renderizza ~6.400 righe di JSX; nessun memo sui tab. Accettabile oggi, misura jank su fascia bassa prima di investirci. [Bassa]
8. **Codice morto**: oppGoalProb, rami Portiere/Difensore, clip GK catch/block caricate e mai usate, azioni-gol strutturalmente filtrate in 9 situations. [Media — è la mappa dei "sistemi già pronti da accendere"]

---

# 7. MIGLIORIE GAMEPLAY

1. **Un solo motore d'esito** (BLK-2 + SIT-3 + SIT-4): decideExecution decide, succRate mostra. Sblocca: dribbling a duello, passaggi con esito `chance`→chain di finalizzazione, rigore con stat vere. *Impatto: trasforma la natura del gioco.* [M–L]
2. **Payoff del rischio**: giocata spettacolare riuscita → +popularity/+morale/+rating; safe → conserva possesso. Elimina le 68 azioni dominate. [S]
3. **Training con agency** (BIL-4): focus settimanale manuale + trade-off fatica/infortunio reale. [M]
4. **Form/morale nel rate** (±4%/±2%) + adaptive SOLO su gpg: la crescita torna percepibile (BIL-2/3). [S]
5. **Economia con sink** (bankBalance + spese con effetti; l'agente costa). [M, SAVE_VERSION 8]
6. **Sconfitte vere**: rifiuto rinnovo → svincolo; retrocessione con conseguenze contrattuali; panchina che morde più a lungo (automatica una volta rallentata la crescita). [M]
7. **Terzo slot sempre vivo**: mai meno di 3 azioni (SIT-2). [S/M]

# 8. MIGLIORIE MOTORE DI GIOCO

1. **Micro-simulatore di sfondo** (MOT-1): λ Poisson per-segmento da prestige/OVR/momentum per entrambe le squadre; le voci BG diventano il racconto di eventi simulati. Il singolo intervento a più alto ROI del progetto. [M]
2. **Momentum/possesso attuati** (MOT-2): collegati alle λ e alla probabilità di HL reattivi. [M, dipende da 1]
3. **Classifica coerente** (MOT-3): risultato speculare all'avversario + pairing dal calendario + seedare tutto (BUG-6). [S/M]
4. **Intervallo reale** (MOT-4) + ritmo a fasi (MOT-7) + recupero oltre il 90'. [S/M]
5. **Statistiche match vere** (MOT-6): tiri/xG che contano gli HL. [S]
6. **Espulsione con effetti** (MOT-5): oppRedCount → λ ridotte + mesh rimossa. [M]

# 9. MIGLIORIE HIGHLIGHTS

1. **Realizzazione 3D degli esiti mancanti** (IA-2): fuori oltre la linea (senza tuffo), corner alla bandierina, gol subito nella porta di casa con tuffo del GK di casa. "Every Highlight Must Tell a Story" oggi non vale per il 30% degli esiti. [M]
2. **Fine del reverse-boomerang** (IA-1): la palla persa va all'interceptor, non in area avversaria. [S]
3. **Cross con finalizzatore** (IA-8): il ricevente colpisce davvero di testa. [S/M]
4. **Geometria seedata** (IA-5): stessa decisione = stessa scena → replay possibile (LMQP 3.5). [S]
5. **Aggancio cronaca↔palla nel BG** (IA-6): kick/ricezione su mesh reali, durata arco ∝ distanza. [M]
6. **Chain per famiglia** (SIT-7): recovery→ripartenza, dribble→conclusione, respinta→secondo tiro; "CATENA!" coerente con l'esito. [S/M]

# 10. MIGLIORIE SITUATIONS

1. **Selezione lazy contestuale** (SIT-1): pescare al trigger con possesso/momentum/zona/tattica vivi. [M]
2. **Vincoli narrativi** (SIT-5): minClock/maxClock/scoreDiff sulle entry (pattern BG_MATCH già rodato) + ripescaggio su mismatch invece di perdere l'HL. [S–M]
3. **Data-fix delle 15 strutturali a 2 azioni** (SIT-2, elenco in appendice A). [S — quick win immediato]
4. **Pressione che pesa** (SIT-6): defPenalty da nearby_def. [S]
5. **Migrazione intent text-free** (SIT-8): `tactic.it` esplicito sulle 179 + zona "fascia" normalizzata. [M]
6. **Riequilibrio del mix**: 83% off / 14% def / 3% special e reward 52% goal — arricchire def/transizione/opzioni non-goal per varietà e per gli archetipi non-bomber. [M]

# 11. MIGLIORIE IA

1. **Ancore calcistiche** (IA-7): slot difensivi goal-side funzione di palla/porta/ruolo al posto dell'anello trigonometrico; compagni anche AVANTI la linea della palla. [M]
2. **Reparto portieri completo** (IA-3): GK di casa vivo, catch/block usate, niente tuffi sui cross, F13 nei 1v1. [M]
3. **Difensori con attributi sintetici** (da prestige+ruolo+seed, zero save impact) → input veri per i duelli di BLK-2. [M]
4. **Freeze di lettura ambientale** (IA-4): micro-sway + logica congelata + cut d'ingresso. [S]
5. **cpmadapt solo sulla squadra avversaria** (MIN-1). [S]
6. **Perf render-loop**: throttle updateFootballState a 1/3 frame, pool per _tg, mixer GLB a 30Hz per i lontani, dispose completo (BUG-4). [M]

# 12. MIGLIORIE UI/UX

1. **`startHL()` unica + `showDPad()` unica** (UX-1/BUG-9/BUG-10): chiude il bug segnalato dal proprietario e il pad fantasma. [S]
2. **Probabilità visibili** (UX-2a): % o pallini sui bottoni azione (decisione PO sul formato). [S]
3. **Feedback causale** (UX-2b): "Difensore addosso −15%", "Piede debole" nel result — il motore lo sa già. [M]
4. **hl_result skippabile su mobile** + azione diretta da hl_move col touch (parità con la tastiera). [S/M]
5. **Onboarding del match** (UX-2c): 3 micro-tooltip nel primo HL. [M]
6. **HUD consolidato** (UX-4): momentum+possesso in un indicatore leggibile; energia visibile durante la scelta. [S]
7. **Pass tipografico mobile** (MIN-17) + localizzazione completa (MIN-18). [S/M]

# 13. MIGLIORIE ARCHITETTURALI

1. **RNG iniettato** ovunque conti (esito azione, standings, geometria conclusioni) → `determinism` del gate torna significativo (BUG-6/7, IA-5). [M]
2. **Gate potenziato** (ARC-1): live-match-test bloccante, golden esteso alle posizioni off-ball t=0, smoke-test del tick playing (avrebbe preso BLK-1). [M]
3. **Igiene timer/GPU** (BUG-3/4) + robustezza boot (BUG-5/17, flush su pagehide). [S+M]
4. **De-duplicazione** (debito §6.3): helper unici per λ, tie-break, capPush, entry matchHistory. [M]
5. **Namespace `window.__CPM`** unico + strip hook di test nella dist (ARC-5). [M]
6. **Dist come canale di default anche per Pages** (transpile 4,7s eliminato per gli utenti web) + mappa CLAUDE.md generata via script. [S/M]

---

# 14. OPPORTUNITÀ DI INNOVAZIONE

1. **"La partita che ti guarda"** — il micro-sim (MOT-1) + selezione lazy (SIT-1) abilitano il vero unicum: highlights *conseguenza* dello stato (assedio→mischie in area; 0-0 teso al 85'→palla che scotta). Nessun career-sim mobile lo fa davvero.
2. **Match memory → narrativa di stagione**: matchMem (5.54) è il seme; estenderlo a memoria di carriera (il portiere che ti ha parato 3 rigori, il difensore tuo spauracchio, il derby dove hai sbagliato all'ultimo) = storie emergenti, costo dati minimo.
3. **Archetipi come playstyle** (BIL-5): distribuzioni di situations diverse per archetipo = 8 run realmente diverse SENZA costruire i ruoli. La via più economica alla rigiocabilità.
4. **Il rischio come firma**: payoff differenziato (SIT-3) + popolarità/brand → il giocatore "spettacolare" e quello "concreto" diventano carriere diverse (sponsor, cori, stampa già esistono come sistemi).
5. **Sistemi già pronti da accendere** (a costo ~zero): esiti `chance/offside/beat_man/fouled` del DE; clip GK catch/block; oppGoalProb; `seededRng` per la lega; CHAIN_SITS estensibile; hlDefTraj come modello per tutti gli esiti. Il codice morto È la roadmap.
6. **Replay/telemetria LMQP**: con la geometria seedata (IA-5) il Replay Engine della spec 3.5 diventa fattibile — e con esso il "condividi il gol" social, feature da store.

---

# 15. PRIORITÀ DEGLI INTERVENTI (dal più urgente)

| # | Intervento | ID | C | Perché ora |
|---|-----------|-----|---|-----------|
| 1 | Fix soft-lock `_sctx76` | BLK-1 | S | 1 riga, partite perse oggi |
| 2 | Fix U18 week 38 + skip-0 routing + tap-skip cappedMM | BUG-2/9/10 | S | bug utente-visibili, fix chirurgici |
| 3 | Igiene: timer leak, dispose Three, boot storage/WebGL, flush pagehide | BUG-3/4/5/17 | S/M | stabilità mobile pre-store |
| 4 | Data-fix 15 situations a 2 azioni + zona "fascia" + ctx "Sotto 0-2" | SIT-2/BUG-12/13 | S | quick win sulla lamentela del PO |
| 5 | DPad: startHL()+showDPad() unificate | UX-1 | S | chiude la segnalazione del PO |
| 6 | Determinismo classifiche + risultato speculare avversario | BUG-6/MOT-3 | S/M | integrità dati carriera |
| 7 | **Micro-simulatore di sfondo** + momentum/possesso attuati + intervallo reale | MOT-1/2/4 | M | il moltiplicatore: rende vera la partita |
| 8 | **Motore d'esito unificato** (DE decide; dribbling a duello; assist→chance; rigore con stat) | BLK-2/SIT-3/4 | M–L | il cuore Simulation-First |
| 9 | Selezione lazy + vincoli minClock/scoreDiff | SIT-1/5 | M | situations figlie della partita |
| 10 | Crescita/età + adaptive fix + form/morale nel rate | BIL-1/2/3a | S | il contratto di progressione |
| 11 | Esiti 3D mancanti (fuori/corner/gol subito) + reverse boomerang + GK casa | IA-1/2/3 | M | coerenza percepita del 3D |
| 12 | Probabilità visibili + feedback causale + result skippabile + onboarding match | UX-2/3 | S/M | leggibilità del loop centrale |
| 13 | Gate potenziato (live-test bloccante, RNG iniettato, golden off-ball) | ARC-1 | M | prima dei refactor grossi 7–9 |
| 14 | Economia (bankBalance+sink) + sconfitte vere + eventi a bivi | BIL-3b/8/9 | M | profondità carriera, SAVE v8 |
| 15 | Training con agency | BIL-4 | M | agency (decisione PO sul design) |
| 16 | Archetipi→playstyle + de-dup + namespace + strip hook store | BIL-5/§6 | M | rigiocabilità + igiene |

**Nota di sequenza:** il punto 13 (gate potenziato) andrebbe idealmente PRIMA dei punti 7–9, che sono i refactor più profondi e oggi gate-ciechi: costruire la rete prima di camminare sul filo.

# 16. ROADMAP TECNICA CONSIGLIATA

- **Fase 0 — "Pronto soccorso"** (1 sprint): priorità 1–5. Solo fix S, rischio ~nullo, tutti verificabili. Bump versione unico.
- **Fase 1 — "Fondamenta oneste"** (1–2 sprint): priorità 6 + 13. Determinismo reale + gate che vede il gioco vero. Prerequisito dichiarato delle fasi successive.
- **Fase 2 — "La partita diventa vera"** (2–3 sprint): priorità 7 → 8 → 9, in quest'ordine (il micro-sim dà il contesto che la selezione lazy consuma; il motore unificato si appoggia a entrambi). Ogni slice con baseline analitica node prima/dopo + collaudo dal vivo del PO.
- **Fase 3 — "La carriera ha un peso"** (2 sprint): priorità 10 + 14 + 15. SAVE_VERSION 8 una sola volta, con tutte le migrazioni insieme.
- **Fase 4 — "Il colpo d'occhio"** (1–2 sprint): priorità 11 + 12 + perf render-loop. Tutto gate-cieco → sessioni di collaudo dal vivo dedicate.
- **Fase 5 — "Store"**: BLK-3 (Capacitor pinnato, strip hook, dist su Pages), audit-copyright, test su device di fascia bassa.

Regole trasversali: mai più di una fase in volo; gate 13/13 + live-match-test ad ogni push; baseline statistica (distribuzione risultati, G+A eroe, win-rate) misurata PRIMA di toccare le probabilità e ri-misurata dopo.

---

# VOTI PER MACRO-AREA

| Area | Voto | Motivazione sintetica |
|------|------|----------------------|
| **Gameplay** | **4,5/10** | Il loop momento-per-momento è leggibile e ha urgenza (pressure timer, scelte numerate), l'arco U18→pro funziona. Ma le scelte sono cosmetiche (spread 3,1pp, 68 azioni dominate), il dribbling non è simulato, il training si gioca da solo, il rischio non paga e non si può perdere: è *funzionale*, non ancora *divertente in profondità*. |
| **Motore di gioco** | **5,5/10** | State machine solida, regia/presentazione di livello, HL dinamici deterministici, layering LMQP serio. Ma la simulazione attorno all'eroe non esiste (MOT-1), un bug bloccante latente nel path meno testato (BLK-1), due motori probabilistici paralleli, statistiche match false, intervallo morto. |
| **IA** | **4/10** | Fondamenta deliberative genuine (goal-side, chiusura linee, press+cover, riceventi reali dei passaggi) ma su ancore coreografiche non calcistiche (anello trigonometrico, compagni solo dietro), freeze-statua che domina la percezione, reparto portieri mezzo vuoto, avversari senza attributi. |
| **Highlights** | **5/10** | La coerenza CINE (palla aerea⇒testa, M1 overlay⟺arco, invarianti da gate) è un lavoro raro e vero. Ma il 30% degli esiti non ha realizzazione fisica (fuori/corner/gol subito), il fallimento produce il reverse-boomerang, la geometria è un dado non seedato e la selezione non nasce dalla partita. |
| **Situations** | **5/10** | 179 entry curate, annotazione tattica completa, data-hygiene rara. Come sistema: pescate prima del kickoff, 4/179 contestualizzate, 36 con 2 scelte (15 strutturali), mismatch che brucia l'highlight. Un mazzo ben scritto pescato quasi a caso. |
| **UI/UX** | **5/10** | Ossatura sopra la media (scoreboard, scorciatoie, pausa) ma il loop centrale è illeggibile: probabilità invisibili, fallimenti che non spiegano, attese non skippabili su mobile, pad fantasma, due path di skip divergenti, match senza onboarding. |
| **Architettura** | **6/10** | Single-file governato con disciplina vera (charter, build offline, migrazioni, error boundary) e pipeline DE ben isolata. Ma la disciplina scricchiola (mappa stale, 46 globali, 8 duplicazioni con drift, hook di test in produzione) e il costo d'avvio web è 3–5× il dichiarato. |
| **Realismo** | **3,5/10** | Le partite *simulate* (Poisson calibrate) sono più realistiche di quelle *giocate* — il contrario di ciò che un match engine dovrebbe fare. Win-rate 85–95% indipendente dall'avversario, avversari senza attributi, palla che non esce mai dal campo, classifica che non registra il risultato dell'avversario reale. I 3,5 punti li salvano DE/resolveDefensiveOutcome e le λ di lega. |
| **Immersione** | **6/10** | 3D, cronaca contestuale, mister che urla, pubblico reattivo CROWD 2.0, match-memory: atmosfera reale sopra le aspettative. La erodono: statue durante la scelta, palla disincarnata nel BG, emoji-feed, inglese sparso, micro-testi da debug, gol subiti mai mostrati. |
| **Bilanciamento** | **4/10** | Curve stipendi, credibility filter del mercato, gate nazionale e coach-decision sono da professionisti. Ma i tre assi portanti sono rotti: crescita 3× senza declino, adaptive che azzera il valore delle stat, form/morale/possesso/valore che sono scenografia. Metà dei numeri mostrati non corrisponde a forze reali. |

**Giudizio complessivo: 4,9/10 — con un potenziale a 7,5+ raggiungibile in gran parte COLLEGANDO sistemi già scritti.** Il progetto non ha bisogno di più contenuto: ha bisogno che il contenuto esistente (Decision Engine, Football State, chaining, esiti `chance`, clip GK, oppGoalProb, seededRng) venga messo al comando. Prima di stadi dinamici, nuove competizioni o nuove modalità, le fondamenta elencate nelle Fasi 0–2 sono la condizione perché qualsiasi feature futura poggi su una partita vera.

---

## APPENDICE A — Le 15 situations strutturalmente a 2 azioni
*(il DB ne ha 3 ovunque; la riduzione avviene in `filterSitActions` r.2215–2254 e nessun movimento consentito da `cappedMM` le recupera)*

| # | Riga | Situation | Causa |
|---|------|-----------|-------|
| 28 | 1856 | 🎮 Palla a centrocampo. Costruisci. | "Avanza palla al piede" rew:goal mai px≥66 |
| 29 | 1858 | ⚡ Palla contesa a centrocampo — pressa e riconquista! | idem |
| 30 | 1860 | 🌀 Sfida 1v1 a centrocampo! | pressure medium: 1 mossa non basta |
| 37 | 1876 | 📐 Schema! Inserimento da centrocampo in area. | reach 62 < 66 |
| 39 | 1880 | ⚡ Corsa di inserimento sul cross! | testa richiede px≥73, reach 71 |
| 51 | 1915 | 📐 Punizione indiretta a 5 metri dall'area! | lock: tiro a px 64 < 66 |
| 60 | 1942 | 👥 Doppia marcatura! | pressure high: 0 mosse, px 63 |
| 79 | 1986 | ⚡ Rimessa rapida dal portiere! | 2 azioni-goal a px 30 |
| 118 | 2072 | ⚡ Smistamento rapidissimo a un tocco! | goal-action irraggiungibile |
| 120 | 2076 | 🎯 Verticale filtrante di prima! | idem |
| 123 | 2082 | 🏃 Ricezione di spalle e giratone! | tiro dal limite da px 48 |
| 124 | 2084 | 🎯 Lanci lunghi — alzati e controlla! | al volo richiede px≥73 da px 28 |
| 148 | 2136 | 🏃 Rimessa dal portiere — verticale! | goal-action da px 22 |
| 156 | 2152 | 🎯 Lancio millimetrico in profondità! | tiro dal centrocampo auto-censurato |
| 174 | 2190 | 🧠 Verticalizzazione prima del difensore! | reach 65 < 66 |

**Altre 21 a 2 azioni allo spawn (recuperabili muovendosi al bordo della moveZone):** #22, #23, #38, #43, #47, #56, #59, #83, #99, #105, #107, #116, #121, #125, #140, #149, #152, #153, #163, #169, #178.

## APPENDICE B — Censimento SITUATIONS
179 situations · 537 azioni (3 ciascuna nel DB) · 3 CHAIN_SITS · 2–7 HL/partita.
**Type:** off 148 (83%) · def 26 (14%) · special 5 (3%). **Zona[0]:** trequarti 53 · area 50 · bordo 33 · centro 18 · propria 12 · difesa 10 · "fascia" 3 (inesistente). **Intent:** shot 38 · cross 24 · progression 24 · recover 22 · insertion 16 · dribble 15 · through 12 · onetwo 11 · freekick 8 · switch 3 · penalty 2 · anticipate 2 · intercept 2. **BallState:** feet 122 · aerial 48 · set_ground 9 · offBall 2. **Reward:** goal 278 (52%) · assist 181 · recovery 45 · save 33. **Fail:** intercept 213 · miss 193 · through 38 · nothing 28 · goal_against 28 · miss_easy 24 · foul 11 · loose 2. **Stat richieste:** passaggio 133 · tecnica 123 · tiro 107 · velocità 79 · fisico 58 · dribbling 24 · mentalità 7 · posizionamento 6. **ctx:** null 175/179.

## APPENDICE C — Baseline QA di questo audit
Gate 13/13 verde su 5.74.0 · fingerprint 00001505 · 0 failure · 109 warn su movements · perf headless: 6.8fps (avg 146ms, p95 217ms) · heap 69.9MB · load 6455ms · ai-vision skip (Ollama non raggiungibile in ambiente cloud).
