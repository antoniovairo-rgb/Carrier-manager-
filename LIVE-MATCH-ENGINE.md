# Live Match Engine — CPM 5.15.0

Documento di architettura del motore di partita di **Career Player Manager**. Riflette il refactoring **Intent → Decision → Simulation → Animation** e lo stato reale del codice (`CARRIER-MANAGER-AV.html`, ~20 410 righe). I numeri di riga sono indicativi (file in evoluzione: verifica con `grep -n`).

> **Nota di onestà.** Questo documento distingue ciò che è **fatto** da ciò che è **parziale** o **da fare**. Il refactoring è avviato e solido nelle fondamenta (Intent/Decision), ma il cuore del render resta in parte animation-driven. Le voci sono marcate ✅ / 🟡 / 🔴.

---

## 1. La pipeline

Il vecchio paradigma era `Situation → animazione` (una situation descriveva già l'esecuzione). Il nuovo flusso:

```
Situation (INTENTO)                      es. "tentativo di tiro"
        ↓  deriveIntent
Intent (sorgente unica)                  shot/cross/dribble/through/onetwo/insertion/...
        ↓  decideExecution(intent, contesto)
Decision (esecuzione + esito + qualità)  es. shot_curled · saved · q=0.41
        ↓  deriveHL + render-loop
Simulation (palla + 22 giocatori)        traiettoria, off-ball AI, timeline
        ↓
Animation (conseguenza)                  swing/arco/post-arco/reazioni
```

L'idea chiave che rende il refactoring **fattibile** senza riscrivere 179 timeline a mano: le situation si classificano in **~13 intenti** e l'esecuzione è **parametrica** sul contesto.

---

## 2. Componenti (con riferimenti di riga)

| Componente | Riga | Ruolo | Stato |
|---|---|---|---|
| `deriveIntent(sit,act)` | 1618 | Classifica la situation in un **intento** dalla struttura/contesto, MAI dalle parole d'esecuzione | ✅ |
| `S(...)` costruttore | 1643 | Ogni situation nasce con `obj.intent = deriveIntent(...)` | ✅ |
| `SITUATIONS` | 1651 | DB delle **179** situation (validate dal gate) | ✅ |
| `deriveBallState(sit)` | ~6685 | **CINE-DECOUPLE B2 (5.18.0):** stato palla da **intent** (strutturale) + override `tactic.bs` — **NIENTE testo** | ✅ |
| `deriveSitCine(sit)` | ~6697 | **CINE-DECOUPLE B2 (5.18.0):** segnali cinematici da **intent** + override `tactic.cn` (baked sulle 52+3 divergenti) — **NIENTE testo** | ✅ |
| `hlBallState(sit)` | ~6709 | **Lettore puro** di `sit.ballState` (fallback: `deriveBallState`) — guardia coerenza aerea | ✅ |
| `deriveHL(sit,act)` | ~6714 | Deriva `type`/`pattern`/`variant` da `sit.cine` + `act.label`/`act.stat`. **NON legge `sit.text`** | ✅ (act.label ancora letto) |
| `updateFootballState` / `__CPM_FOOTBALL_STATE` | ~7460 | **F1 (5.17.0):** Football State osservatore (palla/possessore/forma squadra) nel render-loop, **inerte** (throttle 1/6, try/catch, consumato da nessuno) + probe `?cpmtest=1` | ✅ inerte |
| `buildHLTimeline(hl,o)` | 6760 | Genera la **timeline** di micro-eventi calcistici per pattern | ✅ motore · 🟡 wiring |
| `validateHLTimeline(tl)` | 6840 | Invarianti calcistiche (possesso continuo, no teleport, n° passaggi, testa⇐cross) | ✅ |
| `resolveTimeline(tl)` | 6869 | Risolve la timeline in posizioni concrete per l'executor | ✅ |
| `decideExecution(intent,ctx)` | 6892 | **Decision Engine**: esecuzione + esito + qualità da attributi/pressione/meteo/contesto + casualità seedata | ✅ |
| `intentLabel` / `intentLabelDedup` | 6939 / 6979 | Display: i bottoni mostrano l'**intento/stile**, non l'esecuzione (con dedup anti-duplicati) | ✅ |
| `intentTitle(text,intent,scoreDiff)` | 6955 | Display: l'intro mostra "Tentativo di…" sui titoli esecutivi **o incoerenti col punteggio** | ✅ |
| `stateIncoherent` / `intentIntro` | 6966 / 6972 | Display: rileva titoli/intro che **assumono un punteggio** contrario alla realtà e li neutralizza | ✅ |
| `ThreeMatchView` | 6969 | Render-loop 3D: off-ball AI, executor timeline, `fireConclusion`, post-archi | 🟡 ibrido |
| `LiveMatch` | 8780 | State-machine partita + call-site della decisione | — |

---

## 3. Il modello Situation

```js
// S(text, zones, moveZone, startZone, actions, lockMovement, maxMoves, intro, type, ctx, tactic)
{
  text,        // titolo (alcuni ancora esecutivi → riscritti a DISPLAY da intentTitle)
  zones,       // ["area"|"bordo"|"fascia"|"centrocampo"|"trequarti"]
  startZone,   // {x:[lo,hi], y:[lo,hi]} — dove parte l'eroe (coord di gioco 0..100, x=100 porta avversaria)
  moveZone,    // limiti di movimento del DPad
  actions,     // [ A(label, stat, bon, rew, fail, nrg) ] — la SCELTA tattica del giocatore
  lockMovement,// set-piece (rigore/punizione): spot fisso
  tactic,      // {pressure, support, nearby_def, lanes, box} — contesto per il Decision Engine
  intent,      // l'INTENZIONE (sorgente unica) calcolata da deriveIntent
  ballState,   // ← 5.15.0: stato palla congelato (deriveBallState) — letto da hlBallState
  cine         // ← 5.15.0: segnali cinematici congelati (deriveSitCine) — letti da deriveHL
}
```

### Taxonomy degli intenti (13)

`penalty · freekick · cross · through · dribble · onetwo · insertion · shot · progression · switch · recover · anticipate · intercept`

Regole chiave di `deriveIntent`:
- **cross** = batti il cross *dalla fascia*; **insertion** = attacchi il cross *in area* (distinti).
- gli intenti distintivi (filtrante/dribbling/uno-due) hanno priorità su zona.
- **mai** dedotto da parole d'esecuzione ("teso", "a giro", "rovesciata").

### Distribuzione reale sulle 179 (audit programmatico)

```
shot 39 · cross 25 · progression 23 · recover 22 · insertion 16 · dribble 15
through 12 · onetwo 11 · freekick 8 · switch 3 · penalty 2 · intercept 2 · anticipate 1
```
Tutti e 13 gli intenti usati, nessun collasso su "shot" (22%).

---

## 4. Il Decision Engine (`decideExecution`)

Input: `intent` + `ctx { attrs, pressure, support, fatigue, morale, x, weather, seed }`.
Output: `{ execution, outcome, quality }`.

- **Esecuzione** scelta con pick pesati modulati dal contesto (es. cross → far/near post, teso, rimorchio, profondo).
- **Esito** dipende dalla qualità e dalla pressione (assist/gol/corner/murato/intercettato/fuori…).
- **Qualità** `q ∈ [0,1]` = skill rilevante − pressione·9 − fatica·0.16 + (morale−60)·0.12 + rumore seedato.
- **Seedato** (PRNG deterministico): stessa situazione + stesso stato → stesso esito (niente flicker, gate deterministico); contesti diversi → esiti **vari**.

Validazione (migliaia di contesti): campione forte+libero ~76% positivi vs debole+sotto pressione ~1%; 0 esiti impossibili.

### Come è collegato (call-site in `LiveMatch`)
- Decide la **variante** di tiri / cross / dribbling (non più dalla label).
- Decide il **tipo di esito mancato** (parata/palo/fuori/murato/intercetto) per **ogni** tipo d'azione → `hlOutcomeKind`.
- Decide la **qualità** → la **precisione** della traiettoria di tiro (`hlQuality`): q alta = angolata e pulita, q bassa = centrale e parabile.

---

## 5. Il render-loop (`ThreeMatchView`)

- **Off-ball AI** (motore posizionamento): shape-flow col pallone, pressing, marcatura goal-side, repulsione anti-ammucchiate, + **obiettivi per ruolo** (attaccanti: corse primo/secondo palo/profondità; centrocampisti: linee di passaggio). Sui set-piece pressing/corse sono sospesi: sulle **punizioni** si forma una **barriera** (3 difensori tra palla e porta), sui **rigori** l'area è sgomberata (solo battitore + portiere). 🟡 euristica, non lettura individuale completa.
- **Posizionamento di partenza** (`LiveMatch`): la *continuità* fa scivolare l'eroe dalla posizione precedente **solo se è dentro la startZone**; se è fuori (es. azione in area dopo gioco a centrocampo) parte dallo **spot corretto** (`getStartPos`) → niente azioni "da posizione impossibile". ✅
- **Timeline executor**: sui tiri antepone la **costruzione** dell'azione (ricezione/tocco) prima della conclusione. 🟡 abilitato per i tiri.
- **`fireConclusion`** (refattorizzata in closure richiamabile): esegue la conclusione (swing eroe + arco palla + reazione portiere/difensori). Gli archi sono ancora **pre-autorati per variante** 🟡 (la qualità modula la precisione — Step 3 slice 1).
- **Post-archi**: `in_net` / `hit_post` / `deflect` / `assist_recv → assist_shot` / `cross_goal` / `opp_intercept` / `gk_dive`.
- **Passaggi**: beat di **ricezione** visibile (`assist_recv`, il compagno controlla prima di concludere); il ricevente resta fermo ad accogliere; passaggio **sempre in avanti** (fallito → mira l'avversario che intercetta).

---

## 6. Layer di display (intento, non esecuzione)

- **`intentTitle`** — l'intro dell'highlight mostra "Tentativo di tiro/cross/dribbling/filtrante/…" sui titoli che descrivono un'esecuzione; i titoli di scena ("Solo davanti al portiere") restano. `sit.text` reale **intatto** (deriveHL/gate non toccati).
- **`intentLabel` + `intentLabelDedup`** — i bottoni mostrano un **intento/stile di rischio** ("Attacca il pallone", "Conclusione potente/precisa", "Cerca l'angolo", "di prima", "acrobatica", "scavetto") con **dedup** anti-duplicati. `act.label` reale intatto.
- **`stateIncoherent` + `intentIntro`** — titoli/intro che **assumono un punteggio** ("Sotto 0-2", "Siamo in vantaggio — gestisci", "la rimonta") vengono mostrati come **intento** (o nascosti) quando contraddicono il risultato reale → la narrazione non mente più sul punteggio.

---

## 7. Quality Gate (obbligatorio)

`tests/visual` — Playwright headless, **9 categorie**: `initial-state · orientation · visual · movements · golden · final-state · determinism · post-highlight · data-coherence`. Deve passare **9/9** prima di ogni push.

⚠️ **Limite strutturale:** il gate cattura **frame congelati** → valida stato/coerenza/golden ma **non il movimento**. La resa visiva live (traiettorie, AI, costruzione) è validabile **solo dall'utente**. Per questo le logiche (intent, decisione, timeline) sono validate in node su migliaia di casi, e il 3D dal vivo.

---

## 8. Scorecard vs la direttiva (Intent → Decision → Simulation → Animation)

| # | Punto della direttiva | Stato |
|---|---|---|
| 1 | Situations = solo intenzione | 🟡 `intent` è la sorgente unica; alcuni **testi** ancora esecutivi (riscritti a display) |
| 2 | Esecuzione decisa dal motore | 🟡 fatto per tiri/cross/dribbling + esito per tutti; pass/insertion parziali; manca piede |
| 3 | Eliminare l'"animazione predefinita" | 🔴 il render resta in parte animation-driven (archi pre-autorati) |
| 4 | 22 giocatori sempre attivi | 🟡 obiettivi per ruolo + shape/pressing/marcatura; non lettura individuale completa |
| 5 | Leggere l'azione ogni frame | 🟡 leggono la palla; non valutazione deliberativa (spazi/pericoli/marcature) |
| 6 | Animazione conseguenza della simulazione | 🟡 sui tiri (variante+qualità+esito decisi → poi anima); altri tipi parziali |
| 7 | Highlight racconta una storia | 🟡 costruzione + ricezione; non prep→sviluppo→evento→conseguenza per tutti |
| 8 | Sensazione di vera partita | 🔴 ibrido: simulazione-informato a tratti, animation-driven al cuore |
| 9 | Migrare 179 + test multi-contesto | 🟡 intent su tutte le 179 + Decision Engine validato; migrazione testi e pipeline completa da fare |

---

## 9. Problemi noti / lavoro residuo

| Problema | Natura | Stato |
|---|---|---|
| **Barriera punizioni** — muro a ~9u tra palla e porta | render/positioning | 🟡 barriera fatta; **visibilità portiere** da verificare dal vivo |
| **Testi situation esecutivi/incoerenti** — 35 titoli esecutivi + 3 con punteggio assunto; **risolti a DISPLAY** (`intentTitle`/`stateIncoherent`), ma il **dato** resta tale | dati | 🟡 display ok, dato da migrare |
| **Step 3 completo** — ritiro degli archi pre-autorati verso traiettorie derivate dalla decisione | render | ✅ **completo su tutte le famiglie di conclusione** (F4 tiro 5.24 · F5 cross 5.26 · F6 set-piece 5.27 · F7 testa 5.28): la qualità decisa dal motore plasma pace/precisione/altezza dell'arco. Bounded, seedato, gate-safe. La testa modula SOLO l'arco (variant/aerialità intatte → invariante CINE preservato) |
| ~~**`deriveHL`/`hlBallState` accoppiati al testo**~~ | logica | ✅ **risolto 5.15.0→5.18.0** (CINE-DECOUPLE B1+B2): la derivazione è ora **text-free** (intent strutturale + override `tactic.bs`/`tactic.cn` baked sulle 52+3 divergenti). I TESTI delle situations sono **liberi** di essere riscritti a pura intenzione. (Resta letto `act.label` — scope separato.) |
| **Decision Engine — fattori mancanti** — piede preferito, modulo, alcune tattiche | logica | 🟡 estensione |
| **AI individuale completa** — i 22 leggono la palla ma non valutano spazi/marcature/pericoli per-frame | render | 🔴 lavoro grosso |

### Bug risolti di recente
- **Boomerang** sul tiro mancato (il post-arco `deflect` rimandava la palla verso x=0 = porta dell'eroe) — corretto: resta nel terzo offensivo.
- **Passaggio verso la propria porta** — ora sempre in avanti, mira l'avversario che intercetta; + beat di **ricezione** visibile.
- **Azioni duplicate** — dedup delle etichette intento.
- **Rigore ammucchiato** + **barriera assente** — pressing/corse sospesi sui set-piece e muro sulle punizioni.
- **Azioni da posizione impossibile** — l'eroe parte ora dallo spot corretto della startZone (no scavetto/dribbling-portiere da centrocampo).
- **Titoli che mentono sul punteggio** — neutralizzati quando incoerenti col risultato reale.

---

## 10. Note per chi sviluppa

- **File unico** `CARRIER-MANAGER-AV.html`. Nessun file JS separato per il gioco.
- I motori logici (`deriveIntent`, `decideExecution`, `buildHLTimeline`, `validateHLTimeline`, `resolveTimeline`) sono **puri e node-testabili**: copiali in uno script di scratch + il loader `tests/visual/lib/situations.mjs` per audit/validazioni senza browser.
- Determinismo: tutto ciò che incide su setup/render deve essere **seedato** (hash di situation+azione+stato), mai `Math.random()` non seedato → altrimenti rompe `determinism`/`golden`.
- Display-only: `intentTitle`/`intentLabel` NON devono mutare `sit.text`/`act.label` (li legge `deriveHL` e li estrae il gate).
- Coerenza aerea: la testa/volée solo con palla aerea (`hlBallState`) — invariante FAIL bloccante (`data-coherence`).
