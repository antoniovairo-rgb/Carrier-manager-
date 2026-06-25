# CPM — Live Match Engine: documentazione tecnica completa

> Versione gioco **4.87.0** · file unico `CARRIER-MANAGER-AV.html` · estratto dal sorgente reale.
> Riferimenti `file:riga` cliccabili. Il **catalogo delle 179 Situations** (Parte F) è generato
> programmaticamente dal codice (testo, zone, azioni, esiti, tactic, pattern derivati).

---

## A. Architettura generale

Il match è gestito da due componenti React + Three.js nel file unico:

- **`LiveMatch`** (≈ riga 8400+) — la **state machine** del match: gestisce fasi, Situations, scelte
  dell'utente, esiti, punteggio, cronaca. Tutto lo stato vive in `useState`/`useRef` locali.
- **`ThreeMatchView`** ([6709](../CARRIER-MANAGER-AV.html#L6709)) — il **render 3D**: monta una volta scena/stadio/giocatori e
  aggiorna posizioni/camera/animazioni nel render loop (RAF) leggendo i prop via `propsRef` (nessun
  re-render React per frame).

**Modello concettuale:** una partita NON è una simulazione continua multi-agente, ma una **sequenza
di highlight interattivi** (le *Situations*) intervallati da gioco di sottofondo (fase `playing`) con
**cronaca testuale** (`BG_MATCH`). L'utente, nei momenti caldi, sceglie un'azione tra 2–3 opzioni; il
motore ne calcola l'esito (probabilistico) e mostra il post-highlight 3D.

---

## B. State machine — le fasi del match

Flusso (transizioni via `setPhase`):

```
matchday → formations → walkout → playing ⇄ hl_intro → hl_move → hl_choose → hl_result → (handleContinue) → … → ended
```

| Fase | Significato | Note |
|------|-------------|------|
| `matchday` | schermata pre-partita (avversario, calendario) | salta a `playing` nei provini (`context==="trial"`) |
| `formations` | schieramenti delle due squadre | |
| `walkout` | ingresso in campo (carrellata camera lungo la fila) | `isWalk` nel render loop |
| `playing` | gioco di sottofondo: clock che avanza (tick 300ms), cronaca `BG_MATCH`, idle-drift dei giocatori, camera **WIDE** broadcast | a momenti scriptati (`hlTimes`) fa partire un highlight |
| `hl_intro` | introduzione cinematica dell'highlight (establishing shot, ~2.5s, skippabile) | auto-advance → `hl_move`/`hl_choose` (bloccato se `paused`) |
| `hl_move` | l'utente può muovere l'eroe (DPad) entro `moveZone`, per `cappedMM(sit)` mosse | poi → `hl_choose` |
| `hl_choose` | scelta dell'azione tra le opzioni `A(...)` filtrate da `filterSitActions` | rigori: handler dedicato `handleRigore` |
| `hl_result` | post-highlight: esito + arco palla + slow-mo + camera sulla palla | **durata dinamica** `postHighlightDuration` (4.85.0) |
| `ended` | fine match → `handleEnd` calcola rating e chiama `onMatchEnd` | |

`phaseRef` mantiene la fase corrente per il render loop. Il clock (`playing`) si ferma in ogni fase ≠ `playing` o se `paused`.

---

## C. Sistema di coordinate e orientamento del campo

- **Coordinate di gioco:** `{x:0–100, y:0–100}`. `x` = lunghezza campo, `y` = larghezza.
- **Mappatura mondo 3D** ([6719](../CARRIER-MANAGER-AV.html#L6719)): `G2X(gx)=(gx-50)`, `G2Z(gy)=(gy-50)*0.68`.
- **Orientamento:** la squadra di casa (eroe) **difende `gx=0`** e **attacca `gx=100`** (porta avversaria).
  Le destinazioni palla dell'esito confermano: `goal → gx≈97`, `goal_against → gx≈2–12`.
- **Zone** (`ZONES`, [2038](../CARRIER-MANAGER-AV.html#L2038)): `propria 0–20 · difesa 20–38 · centro 38–55 · trequarti 55–72 · bordo 72–84 · area 84–100`.
  `getZone(x)` mappa una x alla zona.

---

## D. Sistema SITUATIONS

### D.1 Costruttori `S` e `A`

```js
// S — una Situation (highlight interattivo)         (riga 1613)
S(text, zones, moveZone, startZone, actions, lock=false, mm=-1, intro="", type="off", ctx=null, tactic=null)
// A — un'azione selezionabile                        (riga 1618)
A(label, stat, bon, rew, fail, nrg)
```

Campi di una Situation:

| Campo | Tipo | Significato |
|-------|------|-------------|
| `text` | string | titolo/prompt mostrato all'utente (con emoji) |
| `zones` | string[] | zone in cui la Situation è ammissibile (la 1ª guida il default) |
| `moveZone` | `{x:[lo,hi],y:[lo,hi]}` | area entro cui l'eroe può muoversi in `hl_move` |
| `startZone` | `{x:[lo,hi],y:[lo,hi]}` | area di spawn dell'eroe (via `getStartPos`, random nella zona) |
| `actions` | `A()[]` | 2–3 azioni selezionabili |
| `lockMovement` | bool | set-piece a palla ferma (rigore/punizione): 0 mosse |
| `maxMoves` | int | mosse inferite se `mm<0`: area→2, bordo→2, altrimenti 3 |
| `type` | `"off"`/`"def"`/`"special"` | classificazione (pesa la selezione + cinematica) |
| `ctx` | `null`/`"losing"`/`"winning"`/`"is_ex_club"` | gating contestuale |
| `tactic` | obj opzionale | metadati tattici data-driven (vedi D.2) |

### D.2 Il campo `tactic` (data-driven)

```js
tactic = { pressure:"none"|"low"|"medium"|"high", support:0-4, nearby_def:0-5, lanes:[...], box?:{att,def,near,far} }
```

Consumato da due funzioni (tutte le 179 Situations sono annotate):

- **`cappedMM(sit)`** ([2081](../CARRIER-MANAGER-AV.html#L2081)) — cap movimenti post-highlight: `lock→0`, `high→0`, `medium→1`, `low→2`, `none→maxMoves`.
- **`filterSitActions(actions,px,sit)`** ([2051](../CARRIER-MANAGER-AV.html#L2051)) — filtra le azioni di **conclusione** (`rew==="goal"`) in base a posizione e tattica:
  - nessun tiro da `px<55`; colpi di testa solo da `px≥72`;
  - **cross/traversone** richiede `lanes` con `overlap_left`/`overlap_right`;
  - **filtrante/imbucata/verticale** (passaggio) richiede `through_ball_lane`;
  - **dribbling** (stat dribbling) richiede `nearby_def≠0`.
  - Safety net: se rimangono <2 azioni, ne ripristina alcune.

### D.3 Selezione contestuale (`selectContextualSituations`, [8237](../CARRIER-MANAGER-AV.html#L8237))

Sceglie `numHL` Situations dal DB con **estrazione pesata seedata** (riproducibile):
- peso base 10; `def` pesa di più con `fisico` alto, `special` con `ovr` alto;
- `off` pesato sulla stat dominante dell'azione (tiro/passaggio/velocità) vs stat del giocatore;
- **score context**: `losing` → +35% alle `off`, −30% alle `def`; `winning` → +20% `def`, −20% `special`;
- **late game** (clock ≥70): +25% alle situazioni `area`/`bordo`;
- `is_ex_club` mostrata solo se l'avversario è davvero una ex squadra del giocatore.

---

## E. Azioni, esiti, probabilità

### E.1 Le 8 statistiche
`velocità · tecnica · fisico · mentalità · tiro · passaggio · dribbling · posizionamento`.

### E.2 Esiti (`rew`/`fail`) — chiavi `OUTCOME_TX` ([2280](../CARRIER-MANAGER-AV.html#L2280))
`goal · assist · miss_easy · miss · intercept · nothing · goal_against · recovery · through · foul · save`.
Ogni chiave ha un pool di frasi di cronaca. La chiave determina anche la **destinazione palla** nel post-highlight:

| Esito | Destinazione palla (gx) | Significato |
|-------|------------------------|-------------|
| `goal` | ~97 | gol |
| `miss`/`miss_easy` | 89–98 | tiro fuori/parato |
| `assist` | 86–95 | assist |
| `intercept`/`through` | 45–72 | palla recuperata/verticalizzata a metà campo |
| `recovery`/`save` | 18–45 | recupero/parata in zona difensiva |
| `goal_against` | 2–12 | gol subito |

### E.3 Probabilità di successo (`succRate`, [2389](../CARRIER-MANAGER-AV.html#L2389))

```
base = (stat/99)*0.52 + 0.09 + bon*0.006 + (playerX-50)/100*0.04
rate = clamp(base − (oppPrestige−55)/180 + arcBonus, 0.05, 0.84)
```
Modulato a runtime in `handleAction` da: pressione difensori (`defDist`), meteo, momentum, fatigue,
bonus tattico del mister, e **adaptive difficulty**. `bon` è il modificatore per-azione (può essere
negativo per gesti difficili, es. rovesciata). `calcXG` ([2401](../CARRIER-MANAGER-AV.html#L2401)) stima l'xG per qualità+posizione.

### E.4 Archetipi giocatore (`ARCHETYPES`, [2639](../CARRIER-MANAGER-AV.html#L2639))
8 archetipi giocabili: `bomber · fantasista · velocista · trequartista · leader · centravanti · enfant(prodige) · tuttocampista`
(+ archetipi "dominatore/contropiede/pressing/fantasioso" per l'AI tattica e 4 stili di cronaca). Ognuno dà bonus su stat specifiche (`ARCHETYPE_STAT_BONUS`).

---

## F. Movimenti

- **DPad** ([5181+]) — input direzionale (touch/tastiera WASD) in `hl_move`; ogni mossa decrementa
  `movesLeft`, con cooldown 400ms, clampata a `moveZone`.
- **Cap mosse** = `cappedMM(sit)` (vedi D.2), pienamente data-driven dalla `tactic.pressure`.
- **Idle drift** (fase `playing`, tick 300ms) — i giocatori derivano verso slot di formazione:
  casa verso `driftTargetsRef`/`FORMATION_HOME`, **avversari tengono la linea** verso `FORMATION_AWAY`
  ([2348](../CARRIER-MANAGER-AV.html#L2348)). Dal 4.85.0 il twitch casuale è ridotto (movimento con scopo, niente corse casuali).
- **Formazioni base:** `FORMATION_HOME`/`FORMATION_AWAY` = 11 slot `[x,y]` ciascuna (GK→DEF→MID→ATT).
- **Posizionamento set-piece** (lockMovement): per rigori/punizioni i giocatori avversari sono disposti
  realisticamente (GK in porta `x=97`, muro, area affollata) nell'effetto di reset highlight.

---

## G. Motore cinematografico: type / pattern / variant (`deriveHL`, [6650](../CARRIER-MANAGER-AV.html#L6650))

Da `(Situation, azione scelta)` deriva una terna che pilota **camera** e **arco palla**.
`hlBallState(sit)` ([6640](../CARRIER-MANAGER-AV.html#L6640)) determina prima se la palla è `feet`/`aerial`/`set_ground`.

**TYPE** (priorità: testo → label → stat → tipo → zona):
`penalty · freekick · cross · header · shot · pass · dribble · tackle · build`

**VARIANT** (livello cinematico):
- cross → `cross_cutback` (a rientrare) · `cross_far_post` (secondo palo) · `cross_low_driven` (basso/teso) · `cross_near_post`
- header → `header_diving` (tuffo) · `header_far_post` · `header_near_post`
- shot → `shot_chip` (pallonetto/cucchiaio) · `shot_one_on_one` (solo davanti) · `shot_volley` (rovesciata/al volo aereo) · `shot_curled` (a giro) · `shot_first_time` (di prima/tap-in) · `shot_power`
- penalty → `penalty_panenka` (cucchiaio)
- dribble → `dribble_inside` (rientro) · `dribble_outside` (sterzata) · `dribble_feint`

**PATTERN** (raggruppamento tattico per la regia):
`PENALTY · SET_PIECE · FAR_POST_CROSS · CUTBACK · NEAR_POST_CROSS · HEADER_ATTACK · ONE_ON_ONE · EDGE_SHOT · DRIBBLE_SHOT · TACKLE · THROUGH_BALL · COMBINATION · BUILDUP`

---

## H. Fisica della palla (archi)

Nel post-highlight la palla segue un arco parabolico `y=0.65+sin(u·π)·h` per durata `dur`, scelti per variant:

| Variant / tipo | altezza `h` | durata `dur` |
|---|---|---|
| `penalty` (normale) | 4.2 | 0.72 |
| `penalty_panenka` | 9.0 | 1.20 |
| `shot_chip` | 8.5 | 1.10 |
| `shot_volley` | 5.2 | 0.66 |
| `shot_curled` | 4.4 | 0.78 (curva al palo lontano) |
| `shot_first_time` | 3.2 | 0.50 |
| `shot_one_on_one` | 2.6 | 0.55 (rasoterra angolato) |

Per gli archi della cronaca di sottofondo: `BALL_ARC_BY_TYPE` ([7061](../CARRIER-MANAGER-AV.html#L7061)) = `shot{h2.8,dur0.52} · cross{h3.2,dur0.68} · save{h1.8,dur0.55} · tackle{h0.4,dur0.35} · pass{h0.9,dur0.48}`.

---

## I. Camera (regia)

Blend continuo **WIDE↔CLOSE** via `camHL` (0=broadcast, 1=ravvicinata), lerp **asimmetrico** dal 4.86.0
(zoom-in `dt·3.2`, zoom-out `dt·1.7` → niente cambi bruschi). Target `camHL` per fase: result 1.0, move/choose 0.82, intro 0.55, playing 0.

- **WIDE** ([7551+]) — camera broadcast dietro la porta di casa, segue il centro azione con parallasse; attack-zoom quando la palla avanza.
- **CLOSE** — stacco ravvicinato; il fuoco scivola dall'eroe alla palla a fine azione (`bf`). Camera **per-pattern**:
  cross (FAR_POST/CUTBACK/NEAR_POST), header (diving rasoterra / near-far alto), shot (chip alta, one-on-one bassa, volley), pass (THROUGH_BALL arretrata, COMBINATION), dribble (bassa e stretta), penalty/freekick (dietro la palla verso la porta).
- **GK tracking:** su tiro/rigore/testa il look-at si sposta verso il portiere.
- **Slow-motion** sull'esito (`slow=0.28→1` in 1.6s), **camera shake** sul gol, camera replay alta laterale.
- Camera position lerp `dt·1.8`, look-target lerp `dt·2.4` → segue la mesh dell'eroe (movimento fluido).

---

## J. Post-highlight (refactor 4.85→4.87)

Catena: scelta azione → `handleAction`/`handleRigore` → calcolo esito → `setOutcome` + `ballTargetRef` → `setPhase("hl_result")`.

- **Durata dinamica** `postHighlightDuration(outcome,action)` ([~2466](../CARRIER-MANAGER-AV.html)) — sostituisce il vecchio `setTimeout(1000)` fisso:
  `goal→3000ms · pallonetto/acrobazie→2700 · miss_easy/goal_against→2400 · assist/miss→2300 · recovery/save/intercept/through→2000`.
  Garantisce che la palla atterri (archi ≤1.2s) e lo slow-mo (1.6s) concluda, + tempo di lettura esito.
- **Overlay** non occludenti: esito in fascia alta (`floatGoal` top 8%), celebrazione gol, con fade.
- **Avanzamento** `handleContinue` — chaining (vedi sotto) → `hl_intro`; altrimenti `playing` o nuovo `hl_intro`; se `nx≥numHL` → `ended`.
- **Continuità posizionale** (4.86.0) — la Situation successiva nasce dalla **posizione finale della palla**
  agganciata (clamp) alla `startZone`, niente teletrasporto (set-piece esclusi).
- **Situation Chaining** (`CHAIN_SITS`) — dopo cross/corner/punizione con assist, può iniettare un highlight
  concatenato (colpo di testa `header` / mischia `mischia` / secondo tempo `second_ball`).

---

## K. Cronaca di sottofondo (`BG_MATCH`, [2091](../CARRIER-MANAGER-AV.html#L2091))

**149 eventi** di commento durante la fase `playing`, con peso `w`, posizione palla `bpos`, pattern di movimento `pd`,
effetti su possesso/statistiche (`poss`, `ms`), e gating contestuale `ctx` (**winning 9 · losing 9 · drawing 6**, oltre ai generici).
Categorie: gol, possesso, attacchi, difesa, set-piece, tattica, finale di gara.

---

## L. Determinismo & test (hook `?cpmtest=1`)

Hook attivi solo con `?cpmtest=1` (zero impatto in produzione): `Math.random` seedato (mulberry32) + `__CPM_RESEED(gi)`,
freeze `__CPM_FROZEN` (dt=0), `__CPM_STATE()`, `__CPM_PROBE()`, `__CPM_FORCE_SIT(gi,choose)`, `__CPM_RESOLVE(k)`,
`__CPM_LOAD_ALL()`, `__CPM_OUTCOME`, `__CPM_MOVES`, `__CPM_RESULT_DUR`.
Il **quality gate** `tests/visual/` (9 categorie: determinism, initial-state, orientation, visual, movements, golden, final-state, post-highlight, data-coherence) valida tutte le 179 Situations ad ogni push/PR (CI GitHub Actions).

---

# Parte F — Catalogo completo delle 179 Situations

> Generato dal sorgente. Per ogni Situation: indice, testo, type/ctx, zone, startZone, moveZone, lock, cap mosse,
> tactic, e ogni azione con `stat · bon · esito✓/✗ · energia` e la terna cinematica **type/pattern/variant** derivata.


_Totale: 179 Situations._

### [0] ⚡ Solo davanti al portiere!
`type=off · zones=[area] · start x[82,92] y[30,70] · move x[80,98] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[central_run]`
> intro: ⚡ Sei solo! Decidi in frazione di secondo.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Tiro angolato | tiro | 10 | goal | miss_easy | 16 | shot/ONE_ON_ONE/shot_one_on_one |
| 🎯 Piazzato basso | tecnica | 4 | goal | miss | 12 | shot/ONE_ON_ONE/shot_one_on_one |
| 🤸 Pallonetto | tecnica | -8 | goal | miss_easy | 10 | shot/ONE_ON_ONE/shot_chip |

### [1] 🤸 Rovesciata spettacolare!
`type=off · zones=[area] · start x[78,88] y[28,72] · move x[76,94] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤸 Rovesciata! | tecnica | -6 | goal | miss | 22 | shot/EDGE_SHOT/shot_volley |
| ✈️ Stacco di testa | fisico | 3 | goal | miss | 15 | header/HEADER_ATTACK/header_near_post |
| 🦵 Tiro di prima | tiro | 2 | goal | miss | 12 | shot/EDGE_SHOT/shot_first_time |

### [2] ⚡ Tap-in! Porta quasi vuota.
`type=off · zones=[area] · start x[86,94] y[33,67] · move x[84,98] y[28,72] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Spingila dentro! | tiro | 18 | goal | miss_easy | 8 | shot/EDGE_SHOT/shot_first_time |
| 🎯 Precisione | tecnica | 12 | goal | miss | 8 | shot/EDGE_SHOT/shot_first_time |
| 🦶 Deviazione di prima | fisico | 8 | goal | miss | 10 | shot/EDGE_SHOT/shot_first_time |

### [3] 🌀 Con palla in area — un difensore tra te e la porta!
`type=off · zones=[area] · start x[82,90] y[26,74] · move x[80,97] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Tiro a giro | tiro | 8 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |
| 🌀 Dribbling portiere | tecnica | 3 | goal | miss_easy | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🎯 Assist retropassaggio | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [4] 🎯 Deviazione ravvicinata!
`type=off · zones=[area] · start x[80,90] y[30,70] · move x[78,96] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Deviazione istintiva | tecnica | 5 | goal | miss | 12 | shot/EDGE_SHOT/shot_first_time |
| 🦶 Deviazione di piede | fisico | 3 | goal | miss | 12 | shot/EDGE_SHOT/shot_first_time |
| 🌀 Prima intenzione | tiro | 0 | goal | miss | 14 | shot/EDGE_SHOT/shot_first_time |

### [5] 🔴 RIGORE! Sul dischetto.
`type=off · zones=[area] · start x[88,89] y[49,51] · move x[88,89] y[48,52] · lock=true · capMosse=0`
`tactic: pressure=none support=0 nearby_def=0 lanes=[]`
> intro: 🤫 Il silenzio dello stadio è assordante. Tutto fermo. Solo tu e il portiere.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Angolato rasoterra | tiro | 10 | goal | miss | 10 | penalty/PENALTY/– |
| 🎯 Cucchiaio | tecnica | -4 | goal | miss_easy | 8 | penalty/PENALTY/penalty_panenka |
| ⚡ Centro-alto | tiro | 5 | goal | miss | 10 | penalty/PENALTY/– |

### [6] 🏳️ Corner! Attacca il secondo palo.
`type=off · zones=[area] · start x[78,88] y[30,70] · move x[76,96] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=3 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco di testa | fisico | 5 | goal | miss | 16 | header/HEADER_ATTACK/header_far_post |
| 🦵 Tiro al volo | tiro | -4 | goal | miss | 14 | shot/EDGE_SHOT/shot_volley |
| 🤝 Sponda per compagno | passaggio | 5 | assist | nothing | 7 | pass/COMBINATION/– |

### [7] ✈️ Cross in area! Attacca il pallone.
`type=off · zones=[area] · start x[76,86] y[28,72] · move x[74,96] y[18,82] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Colpo di testa | fisico | 5 | goal | miss | 15 | header/HEADER_ATTACK/header_near_post |
| 🦵 Tiro di prima | tiro | -2 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |
| 🤸 Tacco | tecnica | -8 | goal | miss | 10 | shot/EDGE_SHOT/shot_power |

### [8] 💥 Tiro dal limite!
`type=off · zones=[bordo,area] · start x[72,82] y[28,72] · move x[70,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Tiro di potenza | tiro | -5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Piazzato angolato | tecnica | 3 | goal | miss | 12 | shot/EDGE_SHOT/shot_curled |
| 🏃 Avanza in area | velocità | 3 | goal | intercept | 16 | shot/EDGE_SHOT/shot_power |

### [9] ⚽ Tiro al volo dal limite!
`type=off · zones=[bordo] · start x[70,82] y[28,72] · move x[68,86] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚽ Volée potente | tiro | -6 | goal | miss | 16 | shot/EDGE_SHOT/shot_volley |
| 🎯 Mezza volée | tecnica | -2 | goal | miss | 14 | shot/EDGE_SHOT/shot_volley |
| 🦵 Controllo e tiro | tecnica | 4 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [10] 🎯 Pallonetto su portiere in uscita!
`type=off · zones=[bordo,area] · start x[74,84] y[30,70] · move x[72,90] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Pallonetto preciso | tecnica | 3 | goal | miss | 10 | shot/ONE_ON_ONE/shot_chip |
| 💥 Tiro di potenza | tiro | -2 | goal | miss | 14 | shot/ONE_ON_ONE/shot_one_on_one |
| 🌀 Dribbling portiere | tecnica | -3 | goal | miss_easy | 18 | dribble/DRIBBLE_SHOT/dribble_feint |

### [11] 💥 Conclusione di collo pieno!
`type=off · zones=[bordo,area] · start x[70,82] y[28,72] · move x[68,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Collo pieno! | tiro | 5 | goal | miss | 15 | shot/EDGE_SHOT/shot_power |
| 🎯 Interno precisione | tecnica | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| 🌀 Finta e tiro | tecnica | 0 | goal | miss | 16 | dribble/DRIBBLE_SHOT/dribble_feint |

### [12] 🦵 Tiro con l'esterno del piede!
`type=off · zones=[bordo,area] · start x[72,84] y[26,74] · move x[70,90] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Esterno a giro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |
| 🎯 Rientra e tira | tecnica | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🤸 Colpo d'esterno | tiro | -3 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [13] 📐 Punizione dal limite — tiro diretto!
`type=off · zones=[trequarti,bordo] · start x[65,67] y[48,52] · move x[64,68] y[46,54] · lock=true · capMosse=0`
`tactic: pressure=none support=1 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Punizione a giro | tiro | 8 | goal | miss | 10 | freekick/SET_PIECE/– |
| 💥 Tiro rasoterra | tiro | 4 | goal | miss | 10 | freekick/SET_PIECE/– |
| ↗️ Palla in area | passaggio | 5 | assist | miss | 8 | freekick/SET_PIECE/– |

### [14] 📐 Punizione dalla fascia sinistra!
`type=off · zones=[trequarti] · start x[61,63] y[9,12] · move x[60,64] y[8,14] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross basso teso | passaggio | 6 | assist | intercept | 8 | freekick/SET_PIECE/– |
| ↗️ Cross alto | passaggio | 4 | assist | miss | 8 | freekick/SET_PIECE/– |
| 🌀 Giocata corta | tecnica | 3 | assist | nothing | 6 | freekick/SET_PIECE/– |

### [15] 📐 Punizione dalla fascia destra!
`type=off · zones=[trequarti] · start x[61,63] y[87,91] · move x[60,64] y[86,92] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross basso teso | passaggio | 6 | assist | intercept | 8 | freekick/SET_PIECE/– |
| ↗️ Cross alto | passaggio | 4 | assist | miss | 8 | freekick/SET_PIECE/– |
| 🌀 Giocata corta | tecnica | 3 | assist | nothing | 6 | freekick/SET_PIECE/– |

### [16] ⚡ Cross dalla fascia sinistra!
`type=off · zones=[bordo,trequarti] · start x[64,80] y[5,22] · move x[62,88] y[3,28] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross teso | passaggio | 6 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_low_driven |
| ↗️ Cross a rientrare | tecnica | 4 | assist | miss | 10 | cross/CUTBACK/cross_cutback |
| 🦵 Tiro a giro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |

### [17] ⚡ Cross dalla fascia destra!
`type=off · zones=[bordo,trequarti] · start x[64,80] y[78,93] · move x[62,88] y[72,97] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross teso | passaggio | 6 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_low_driven |
| ↗️ Cross a rientrare | tecnica | 4 | assist | miss | 10 | cross/CUTBACK/cross_cutback |
| 🦵 Tiro a giro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |

### [18] 🌀 Dribbling! Terzino sul lato sinistro.
`type=off · zones=[trequarti,bordo] · start x[58,76] y[5,26] · move x[55,86] y[3,32] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling netto | tecnica | 5 | assist | nothing | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Sterzata fulminea | velocità | 3 | assist | nothing | 14 | build/BUILDUP/– |
| 💥 Tiro a giro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |

### [19] 🌀 Dribbling! Terzino sul lato destro.
`type=off · zones=[trequarti,bordo] · start x[58,76] y[74,92] · move x[55,86] y[68,97] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling netto | tecnica | 5 | assist | nothing | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Sterzata fulminea | velocità | 3 | assist | nothing | 14 | build/BUILDUP/– |
| 💥 Tiro a giro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |

### [20] 🤼 Duello fisico! Liberati.
`type=off · zones=[bordo,area] · start x[68,84] y[28,72] · move x[65,92] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling netto | tecnica | 5 | goal | nothing | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Scatto puro | velocità | 4 | goal | nothing | 14 | shot/EDGE_SHOT/shot_power |
| ↩️ Dai e vai | passaggio | 3 | assist | intercept | 10 | pass/COMBINATION/– |

### [21] ⚡ Doppio dribbling in velocità!
`type=off · zones=[bordo,area] · start x[70,84] y[26,74] · move x[68,92] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Doppio passo esplosivo | velocità | 7 | goal | intercept | 22 | shot/EDGE_SHOT/shot_power |
| 🌀 Elastico e tiro | tecnica | 3 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Assist a sorpresa | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |

### [22] 🏃 Contropiede! Campo aperto.
`type=off · zones=[trequarti,bordo] · start x[52,65] y[30,70] · move x[50,92] y[20,80] · lock=false · capMosse=3`
`tactic: pressure=none support=1 nearby_def=0 lanes=[central_run,through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Sprint e tiro | velocità | 4 | goal | miss | 22 | shot/EDGE_SHOT/shot_power |
| 🎯 Assist filtrante | passaggio | 5 | assist | intercept | 10 | pass/THROUGH_BALL/– |
| 🌀 Dribbling GK | tecnica | -3 | goal | miss | 16 | dribble/DRIBBLE_SHOT/dribble_feint |

### [23] ⚡ Scatto in profondità!
`type=off · zones=[trequarti] · start x[54,68] y[28,72] · move x[52,84] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=1 nearby_def=0 lanes=[through_ball_lane,central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Scatto e tiro | velocità | 5 | goal | intercept | 20 | shot/EDGE_SHOT/shot_power |
| 🎯 Filtrante per compagno | passaggio | 6 | assist | intercept | 10 | pass/THROUGH_BALL/– |
| 🌀 Dribbling difensore | tecnica | 3 | goal | intercept | 16 | dribble/DRIBBLE_SHOT/dribble_feint |

### [24] 🧠 Ricezione tra le linee!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,82] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Assist filtrante | passaggio | 8 | assist | intercept | 10 | pass/THROUGH_BALL/– |
| ⚡ Accelera verso porta | velocità | 3 | goal | intercept | 18 | build/BUILDUP/– |
| 💥 Tiro dal limite | tiro | -8 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [25] 🎯 Filtrante per il centravanti!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,82] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Filtrante millimetrico | passaggio | 10 | assist | intercept | 10 | pass/THROUGH_BALL/– |
| ↩️ Dai e vai | tecnica | 5 | assist | intercept | 12 | build/BUILDUP/– |
| 💥 Tiro dal limite | tiro | -6 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [26] 💫 Assist di tacco! Giocata geniale.
`type=off · zones=[area,bordo] · start x[74,84] y[30,70] · move x[72,92] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💫 Tacco preciso | tecnica | -3 | assist | intercept | 10 | shot/EDGE_SHOT/shot_power |
| 🦵 Tiro di prima | tiro | 2 | goal | miss | 12 | shot/EDGE_SHOT/shot_first_time |
| 🔄 Doppio passo e tiro | tecnica | 4 | goal | nothing | 16 | shot/EDGE_SHOT/shot_power |

### [27] 🎯 Triangolazione perfetta!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,84] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=3 nearby_def=1 lanes=[central_run,through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Triangolo e tiro | tecnica | 6 | goal | intercept | 14 | shot/EDGE_SHOT/shot_power |
| ↩️ Dai e vai | passaggio | 7 | assist | intercept | 10 | pass/COMBINATION/– |
| 💥 Tiro di prima | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |

### [28] 🎮 Palla a centrocampo. Costruisci.
`type=off · zones=[centro,trequarti] · start x[38,58] y[28,72] · move x[35,65] y[20,80] · lock=false · capMosse=3`
`tactic: pressure=none support=4 nearby_def=0 lanes=[central_run,through_ball_lane,overlap_left,overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Verticale | passaggio | 3 | assist | intercept | 8 | pass/COMBINATION/– |
| 🔄 Cambia campo | passaggio | 5 | assist | intercept | 6 | pass/COMBINATION/– |
| 🏃 Avanza palla al piede | velocità | 2 | goal | intercept | 15 | build/BUILDUP/– |

### [29] ⚡ Palla contesa a centrocampo — pressa e riconquista!
`type=off · zones=[difesa,centro] · start x[22,42] y[28,72] · move x[18,60] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[central_run,through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Lancia il contropiede | velocità | 6 | goal | intercept | 20 | build/BUILDUP/– |
| 🎯 Lancio lungo | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |
| 🌀 Avanza palla al piede | tecnica | 2 | goal | intercept | 16 | build/BUILDUP/– |

### [30] 🌀 Sfida 1v1 a centrocampo!
`type=off · zones=[centro,trequarti] · start x[38,58] y[28,72] · move x[35,68] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling centrale | tecnica | 5 | goal | intercept | 14 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Scatto in velocità | velocità | 4 | goal | intercept | 16 | build/BUILDUP/– |
| ↩️ Triangolo | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [31] 🛡️ Avversario porta palla — sfida in scivolata!
`type=def · zones=[difesa,centro] · start x[25,45] y[30,70] · move x[20,55] y[15,85] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: ⚠️ L'avversario punta la porta! Sei l'ultimo ostacolo prima della difesa.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛡️ Scivolata netta | fisico | 6 | recovery | foul | 16 | tackle/TACKLE/– |
| ✋ Intercetta di piede | tecnica | 4 | recovery | through | 12 | tackle/TACKLE/– |
| 📣 Copri la linea | velocità | 2 | recovery | through | 8 | tackle/TACKLE/– |

### [32] ✋ Anticipa il passaggio filtrante!
`type=def · zones=[centro,difesa] · start x[30,50] y[32,68] · move x[25,58] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=1 lanes=[]`
> intro: 👁️ Vedi il passaggio prima che parta. Anticipalo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✋ Anticipo di posizione | tecnica | 7 | recovery | through | 10 | tackle/TACKLE/– |
| 🏃 Sprint di copertura | velocità | 5 | recovery | through | 14 | tackle/TACKLE/– |
| 💪 Contrasto fisico | fisico | 3 | recovery | foul | 12 | tackle/TACKLE/– |

### [33] 🧱 Muro in area! Blocca il tiro.
`type=def · zones=[propria,difesa] · start x[8,20] y[35,65] · move x[5,25] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=2 lanes=[]`
> intro: 💥 Tiro in arrivo! Buttati sulla traiettoria!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🧱 Blocca con il corpo | fisico | 8 | save | goal_against | 14 | tackle/TACKLE/– |
| ✋ Devia col piede | tecnica | 5 | save | goal_against | 12 | tackle/TACKLE/– |
| 📣 Chiama il portiere | tecnica | 2 | save | goal_against | 6 | tackle/TACKLE/– |

### [34] 🏃 Pressing alto! Ostacola la costruzione.
`type=def · zones=[trequarti,centro] · start x[50,65] y[30,70] · move x[45,72] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`
> intro: 😤 Il portiere ha palla! Pressa, costringilo all'errore!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Pressing aggressivo | velocità | 6 | recovery | through | 18 | tackle/TACKLE/– |
| ✋ Intercetta il retropassaggio | tecnica | 4 | recovery | through | 12 | tackle/TACKLE/– |
| 🌀 Finta e agganci | tecnica | 3 | assist | nothing | 10 | tackle/TACKLE/– |

### [35] ⚡ Contropiede avversario! Torna in difesa.
`type=def · zones=[centro,difesa] · start x[20,40] y[30,70] · move x[15,50] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=3 lanes=[]`
> intro: 🚨 Contropiede! Tre avversari puntano la porta, rientra!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Sprint di rientro | velocità | 8 | recovery | through | 22 | tackle/TACKLE/– |
| 🛡️ Posizione preventiva | fisico | 5 | recovery | through | 14 | tackle/TACKLE/– |
| 📣 Organizza la difesa | tecnica | 3 | recovery | through | 8 | tackle/TACKLE/– |

### [36] 💪 Duello aereo su corner avversario!
`type=def · zones=[propria,difesa] · start x[8,18] y[35,65] · move x[5,22] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=3 lanes=[]`
> intro: 🏳️ Corner avversario! Attacca il pallone in area!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco di testa | fisico | 7 | save | goal_against | 16 | header/HEADER_ATTACK/header_near_post |
| 🤼 Contrasto fisico | fisico | 4 | save | goal_against | 12 | tackle/TACKLE/– |
| 📣 Guida i compagni | tecnica | 5 | save | goal_against | 8 | tackle/TACKLE/– |

### [37] 📐 Schema! Inserimento da centrocampo in area.
`type=off · zones=[trequarti,bordo] · start x[40,52] y[38,62] · move x[38,88] y[28,72] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=0 lanes=[central_run]`
> intro: 📐 Schema di movimento! Parti da centrocampo e taglia verso l'area in diagonale.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Taglio in profondità | velocità | 8 | goal | intercept | 22 | build/BUILDUP/– |
| 🎯 Taglio sul secondo palo | tecnica | 6 | goal | miss | 18 | build/BUILDUP/– |
| ↩️ Dai e vai corto | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [38] 🔄 Dai e vai! Schema rapido in trequarti.
`type=off · zones=[trequarti,bordo] · start x[58,68] y[32,68] · move x[55,85] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[central_run,through_ball_lane]`
> intro: 🔄 Dai e vai! Scarica e rilanciati immediatamente nello spazio.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↩️ Dai e vai preciso | passaggio | 8 | assist | intercept | 12 | pass/COMBINATION/– |
| ⚡ Accelera in profondità | velocità | 6 | goal | intercept | 18 | build/BUILDUP/– |
| 🎯 Tiro di prima | tiro | -2 | goal | miss | 14 | shot/EDGE_SHOT/shot_first_time |

### [39] ⚡ Corsa di inserimento sul cross!
`type=off · zones=[trequarti,bordo] · start x[58,68] y[25,40] · move x[55,90] y[18,82] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=2 lanes=[overlap_left,overlap_right]`
> intro: 🏃 Il cross sta per arrivare! Inserisciti con i tempi giusti per attaccare il pallone.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Colpo di testa | fisico | 7 | goal | miss | 16 | header/HEADER_ATTACK/header_near_post |
| 🦵 Tiro di prima | tiro | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_first_time |
| 🌀 Controllo e tiro | tecnica | 3 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [40] 🌀 Difensore di fronte — come lo superi?
`type=special · zones=[bordo,area] · start x[75,88] y[30,70] · move x[72,95] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[]`
> intro: 🌀 Hai il difensore di fronte. Prova il tunnel per saltarlo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Tunnel perfetto | dribbling | 12 | goal | loose | 22 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Finta e scatto | velocità | 8 | goal | intercept | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🔙 Retropassaggio sicuro | passaggio | 2 | assist | intercept | 8 | pass/COMBINATION/– |

### [41] 🔄 Il cross arriva alto — tentazione assoluta in area!
`type=special · zones=[area] · start x[85,94] y[35,65] · move x[84,97] y[25,75] · lock=true · capMosse=0`
`tactic: pressure=high support=2 nearby_def=3 lanes=[]`
> intro: 🔄 Il cross arriva alto. Tenti la rovesciata? Alta difficoltà, massima gloria!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔄 Rovesciata spettacolare | fisico | 14 | goal | miss | 22 | shot/EDGE_SHOT/shot_volley |
| 🦵 Colpo di testa normale | fisico | 4 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |
| 🔙 Controllo e appoggio | tecnica | 1 | assist | intercept | 6 | shot/EDGE_SHOT/shot_power |

### [42] 🦶 Fascia chiusa — cross difficile, angolo stretto!
`type=special · zones=[trequarti,bordo] · start x[65,78] y[15,40] · move x[60,85] y[10,30] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=2 lanes=[overlap_left]`
> intro: 🦶 Hai spazio sulla fascia. Tenti la rabona per crossare con l'esterno destro?

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦶 Rabona cross | passaggio | 10 | assist | miss | 18 | cross/NEAR_POST_CROSS/cross_near_post |
| ⚡ Cross normale | passaggio | 3 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_near_post |
| 🎯 Tiro a giro | tiro | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |

### [43] 💥 Tiro da 30 metri! Nessuno si aspetta questa scelta.
`type=off · zones=[trequarti,centro] · start x[58,68] y[30,70] · move x[55,72] y[25,75] · lock=false · capMosse=3`
`tactic: pressure=none support=2 nearby_def=0 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Botta col collo pieno | tiro | -12 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 🎯 Destro rasoterra | tiro | -8 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🔄 Serve in area | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [44] ✈️ Cross avversario in area! Allontana!
`type=def · zones=[propria,difesa] · start x[10,20] y[30,70] · move x[8,24] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=3 lanes=[]`
> intro: ✈️ Cross pericoloso in area! Allontana con la testa!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco di testa deciso | fisico | 8 | save | goal_against | 16 | header/HEADER_ATTACK/header_near_post |
| 🛡️ Chiudi di spalla | fisico | 4 | save | goal_against | 12 | tackle/TACKLE/– |
| 📣 Chiama il portiere | tecnica | 2 | save | goal_against | 6 | tackle/TACKLE/– |

### [45] 🧱 Tiro avversario in arrivo sulla linea! Intervieni.
`type=def · zones=[propria] · start x[3,8] y[38,62] · move x[2,10] y[30,70] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=2 lanes=[]`
> intro: 🚨 Il pallone sta per entrare! Sei l'ultimo uomo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🧱 Corpo sulla traiettoria | fisico | 12 | save | goal_against | 20 | tackle/TACKLE/– |
| ✋ Devia col piede | tecnica | 8 | save | goal_against | 16 | tackle/TACKLE/– |
| 😱 Tentativo disperato | fisico | 3 | save | goal_against | 12 | tackle/TACKLE/– |

### [46] ⚡ Sovrapposizione! Il terzino è lanciato in fascia.
`type=off · zones=[trequarti,bordo] · start x[62,78] y[5,15] · move x[58,88] y[5,20] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross al centro | passaggio | 8 | assist | intercept | 12 | cross/NEAR_POST_CROSS/cross_near_post |
| ⚡ Taglio verso l'area | velocità | 5 | goal | intercept | 18 | build/BUILDUP/– |
| ↩️ Appoggio corto | passaggio | 3 | assist | nothing | 6 | pass/COMBINATION/– |

### [47] 🚀 Contropiede 2 contro 1! Supera il difensore!
`type=off · zones=[trequarti,bordo] · start x[55,68] y[35,65] · move x[52,88] y[25,75] · lock=false · capMosse=3`
`tactic: pressure=none support=1 nearby_def=1 lanes=[central_run,through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Assist al compagno | passaggio | 10 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Scatta e tira | velocità | 6 | goal | intercept | 20 | build/BUILDUP/– |
| 🌀 Finta e tiro | tecnica | 4 | goal | miss | 16 | dribble/DRIBBLE_SHOT/dribble_feint |

### [48] 🔄 Rimbalzo in area! Arrivaci per primo.
`type=off · zones=[area] · start x[84,93] y[28,72] · move x[82,97] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Spinta di prima | tiro | 14 | goal | miss_easy | 10 | shot/EDGE_SHOT/shot_first_time |
| ✈️ Di testa | fisico | 8 | goal | miss | 12 | header/HEADER_ATTACK/header_near_post |
| 🌀 Controllo e tiro | tecnica | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [49] ↘️ Cross basso teso! Devia verso la porta.
`type=off · zones=[area,bordo] · start x[76,86] y[18,28] · move x[74,94] y[15,35] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Deviazione al volo | tecnica | 6 | goal | miss | 14 | shot/EDGE_SHOT/shot_volley |
| ↗️ Sponda per compagno | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |
| 💥 Tiro potente | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [50] 📐 Schema corto da corner! Sorpresa tattica.
`type=off · zones=[trequarti,bordo] · start x[60,74] y[86,95] · move x[58,86] y[85,97] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[overlap_right]`
> intro: 📐 Schema! Angolo corto — sorprendi la difesa con il triangolo.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Triangolo e cross | passaggio | 7 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_near_post |
| 💥 Tiro a giro | tiro | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |
| 🌀 Dribbling e cross | tecnica | 5 | assist | nothing | 12 | cross/NEAR_POST_CROSS/cross_near_post |

### [51] 📐 Punizione indiretta a 5 metri dall'area!
`type=off · zones=[trequarti] · start x[63,65] y[46,54] · move x[62,66] y[44,56] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Palla in area per il colpo di testa | passaggio | 8 | assist | intercept | 8 | freekick/SET_PIECE/– |
| 💥 Tiro sotto la barriera | tiro | 6 | goal | miss | 12 | freekick/SET_PIECE/– |
| 🌀 Giocata corta | tecnica | 5 | assist | nothing | 6 | freekick/SET_PIECE/– |

### [52] ✈️ Lancio lungo! Il portiere esce. Attacca la palla!
`type=off · zones=[area,bordo] · start x[76,86] y[35,65] · move x[74,96] y[30,70] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Colpo di testa sulla porta | fisico | 6 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |
| 🌀 Scavalco il portiere | tecnica | 3 | goal | miss_easy | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Pallone al compagno | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [53] 💥 Tiro sul palo — la palla rimbalza in area!
`type=off · zones=[area] · start x[85,95] y[33,67] · move x[83,98] y[28,72] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Prima intenzione! | tiro | 16 | goal | miss_easy | 10 | shot/EDGE_SHOT/shot_first_time |
| ✈️ Di testa al volo | fisico | 10 | goal | miss | 12 | header/HEADER_ATTACK/header_near_post |
| 🤝 Sponda per compagno | passaggio | 6 | assist | intercept | 8 | pass/COMBINATION/– |

### [54] 🏃 Pressing alto in trequarti — portatore avversario sotto pressione!
`type=def · zones=[trequarti] · start x[58,68] y[28,72] · move x[55,72] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`
> intro: 😤 Il portiere avversario ha palla! Pressa immediatamente!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Pressing aggressivo | velocità | 8 | goal | through | 20 | tackle/TACKLE/– |
| ✋ Intercetta il retropassaggio | tecnica | 5 | goal | through | 14 | tackle/TACKLE/– |
| 📣 Copri le linee di passaggio | mentalità | 4 | recovery | through | 10 | tackle/TACKLE/– |

### [55] ✈️ Cross teso dalla fascia — attacca il palo lontano!
`type=off · zones=[area] · start x[78,88] y[22,26] · move x[76,96] y[18,28] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco sul palo lontano | fisico | 7 | goal | miss | 16 | header/HEADER_ATTACK/header_far_post |
| 🦵 Mezza rovesciata | tecnica | -4 | goal | miss | 20 | shot/EDGE_SHOT/shot_volley |
| 🤝 Sponda indietro | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [56] 🎯 Lancio lungo millimetrico! Scatta in profondità.
`type=off · zones=[trequarti,centro] · start x[42,58] y[30,70] · move x[40,72] y[25,75] · lock=false · capMosse=2`
`tactic: pressure=low support=1 nearby_def=0 lanes=[through_ball_lane,central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Scatto perfetto | velocità | 8 | goal | intercept | 22 | build/BUILDUP/– |
| 🎯 Controlla e tira | tecnica | 5 | goal | intercept | 16 | build/BUILDUP/– |
| ↩️ Rimanda al mittente | passaggio | 2 | assist | intercept | 8 | pass/COMBINATION/– |

### [57] ⚡ Velocità contro posizione — 1 vs 1 sulla fascia!
`type=off · zones=[bordo,trequarti] · start x[62,76] y[5,18] · move x[60,88] y[3,22] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Spunto esplosivo | velocità | 8 | assist | intercept | 20 | shot/EDGE_SHOT/shot_power |
| 🌀 Dribbling di tecnica | tecnica | 5 | assist | nothing | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| 💥 Tiro cross teso | tiro | 3 | goal | miss | 13 | cross/NEAR_POST_CROSS/cross_low_driven |

### [58] 🔴 RIGORE! Sul dischetto a 5' dalla fine. Respira. Tira.
`type=off · zones=[area] · start x[86,89] y[47,53] · move x[84,90] y[44,56] · lock=true · capMosse=0`
`tactic: pressure=none support=0 nearby_def=0 lanes=[]`
> intro: ⏱ Cinque minuti alla fine. Il rigore che vale tutto. Respira.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Angolo basso — potenza | tiro | 12 | goal | miss_easy | 10 | penalty/PENALTY/– |
| 🌀 Cucchiaio — glaciale | tecnica | 2 | goal | miss_easy | 20 | penalty/PENALTY/penalty_panenka |
| ⚡ Incrociato rasoterra | velocità | 6 | goal | miss | 14 | penalty/PENALTY/– |

### [59] 🔙 Sotto 0-2. L'attacco cerca il gol della speranza.
`type=off ctx=losing · zones=[trequarti,bordo] · start x[58,72] y[30,70] · move x[55,80] y[25,75] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔥 Prendo in mano la squadra | mentalità | 8 | goal | through | 18 | build/BUILDUP/– |
| ⚡ Scatto in verticale | velocità | 6 | goal | intercept | 16 | build/BUILDUP/– |
| 🎯 Lancio smarcante | passaggio | 5 | assist | intercept | 12 | pass/COMBINATION/– |

### [60] 👥 Doppia marcatura! Due difensori ti raddoppiano.
`type=off · zones=[trequarti] · start x[58,68] y[28,72] · move x[55,70] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling stretto — li elimino entrambi | tecnica | 10 | goal | intercept | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| ↩️ Dai e ricevi — smarca il compagno | passaggio | 7 | assist | intercept | 14 | pass/COMBINATION/– |
| ⚡ Scatto diagonale istantaneo | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |

### [61] 🤝 Sponda e rimorchio in area!
`type=off · zones=[area] · start x[84,94] y[30,70] · move x[82,97] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤝 Sponda corta e tira | tecnica | 6 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🦵 Prima intenzione | tiro | 4 | goal | miss_easy | 12 | shot/EDGE_SHOT/shot_first_time |
| ↩️ Retropassaggio al limite | passaggio | 3 | assist | intercept | 8 | pass/COMBINATION/– |

### [62] 💨 Prima intenzione su cross basso!
`type=off · zones=[area] · start x[82,92] y[28,72] · move x[80,97] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Tiro di prima potente | tiro | 6 | goal | miss | 16 | shot/EDGE_SHOT/shot_first_time |
| 🎯 Deviazione controllata | tecnica | 4 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |
| 🤝 Sponda al compagno | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [63] 🎯 Tiro ad incrociare sul palo lontano!
`type=off · zones=[bordo,area] · start x[78,88] y[25,40] · move x[75,95] y[20,45] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Incrociato sul palo lontano | tiro | 8 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🌀 Finta e interno piede | tecnica | 5 | goal | miss | 13 | dribble/DRIBBLE_SHOT/dribble_inside |
| ↗️ Cross basso sul secondo palo | passaggio | 4 | assist | intercept | 8 | cross/FAR_POST_CROSS/cross_far_post |

### [64] ✈️ Colpo di testa potente da centro area!
`type=off · zones=[area] · start x[80,90] y[33,67] · move x[78,96] y[28,72] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=3 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Testa potente angolato | fisico | 8 | goal | miss | 16 | header/HEADER_ATTACK/header_near_post |
| 🎯 Testa preciso al centro | fisico | 4 | goal | miss | 13 | header/HEADER_ATTACK/header_near_post |
| 🌀 Colpo di testa smorzato per compagno | tecnica | 2 | assist | intercept | 11 | header/HEADER_ATTACK/header_near_post |

### [65] 🛑 Stop di petto e tiro fulmineo!
`type=off · zones=[area,bordo] · start x[78,88] y[28,72] · move x[76,95] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛑 Stop e tiro netto | tecnica | 7 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 💥 Volée immediata | tiro | 4 | goal | miss | 13 | shot/EDGE_SHOT/shot_volley |
| ↩️ Controllo e serve il compagno | passaggio | 3 | assist | intercept | 8 | pass/COMBINATION/– |

### [66] ↘️ Portiere uscito sul lato — il secondo palo è libero!
`type=off · zones=[area] · start x[86,96] y[22,36] · move x[84,98] y[20,40] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↘️ Tocco sotto morbido | passaggio | 8 | assist | intercept | 10 | pass/COMBINATION/– |
| 🦵 Tiro a porta semiaperta | tiro | 5 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| 🌀 Dribbling portiere e appoggia | tecnica | 3 | assist | miss_easy | 16 | dribble/DRIBBLE_SHOT/dribble_feint |

### [67] 🦶 Tiro col mancino a sorpresa!
`type=off · zones=[bordo,area] · start x[76,86] y[28,72] · move x[73,94] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦶 Mancino angolato | tiro | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |
| 🌀 Finta e mancino | tecnica | 3 | goal | miss | 13 | dribble/DRIBBLE_SHOT/dribble_feint |
| ↗️ Cross col mancino | passaggio | 4 | assist | intercept | 8 | cross/NEAR_POST_CROSS/cross_near_post |

### [68] ⚡ Sforbiciata acrobatica!
`type=off · zones=[area] · start x[80,90] y[28,72] · move x[78,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Sforbiciata al volo | fisico | -3 | goal | miss | 22 | shot/EDGE_SHOT/shot_volley |
| 🦵 Tiro di collo | tiro | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Controllo e tira | tecnica | 6 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [69] 🔄 Spalle alla porta — giratone o tacco?
`type=off · zones=[area] · start x[84,93] y[30,70] · move x[82,97] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔄 Tacco in porta | tecnica | -5 | goal | miss_easy | 22 | shot/EDGE_SHOT/shot_power |
| 🔙 Retropassaggio all'accorrente | passaggio | 3 | assist | intercept | 10 | pass/COMBINATION/– |
| 🌀 Giratone e tiro | tecnica | 0 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [70] 🦵 Cucchiaio in area!
`type=off · zones=[area,bordo] · start x[78,88] y[30,70] · move x[76,96] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Cucchiaio rasoterra | tecnica | -2 | goal | miss_easy | 18 | shot/EDGE_SHOT/shot_chip |
| 💥 Tiro diretto | tiro | 4 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| 🎯 Pallonetto morbido | tecnica | 0 | goal | miss | 12 | shot/EDGE_SHOT/shot_chip |

### [71] 🌀 Finta di esterno e tiro interno!
`type=off · zones=[area,bordo] · start x[76,86] y[28,72] · move x[74,95] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Finta e interno | tecnica | 6 | goal | miss | 15 | dribble/DRIBBLE_SHOT/dribble_inside |
| 🦵 Esterno subito | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↗️ Scarica per il compagno | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [72] 💥 Tiro di potenza sul palo corto!
`type=off · zones=[bordo,area] · start x[76,86] y[22,36] · move x[73,94] y[18,42] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Potenza sul palo corto | tiro | 5 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 🎯 Piazzato sul palo lontano | tecnica | 4 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |
| ↗️ Cross sul secondo palo | passaggio | 5 | assist | intercept | 8 | cross/FAR_POST_CROSS/cross_far_post |

### [73] 🤸 Rovesciata in corsa!
`type=off · zones=[area] · start x[82,92] y[30,70] · move x[80,97] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤸 Acrobazia istintiva in porta | tecnica | -8 | goal | miss | 22 | shot/EDGE_SHOT/shot_first_time |
| 🦵 Tiro di collo d'istinto | tiro | 2 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Controllo e conclude | tecnica | 5 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [74] ⚽ Portiere fuori posizione! L'area piccola è scoperta.
`type=off · zones=[area] · start x[86,96] y[33,67] · move x[84,98] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚽ Prima intenzione — dentro! | tiro | 20 | goal | miss_easy | 8 | shot/EDGE_SHOT/shot_first_time |
| 🎯 Piazzata angolata | tecnica | 14 | goal | miss | 10 | shot/EDGE_SHOT/shot_curled |
| 🦶 Spinta di sicurezza | fisico | 10 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [75] 😱 Il portiere lascia sfuggire la palla! Approfitta.
`type=off · zones=[area] · start x[86,96] y[33,67] · move x[84,98] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Prima intenzione subito! | tiro | 16 | goal | miss_easy | 8 | shot/EDGE_SHOT/shot_first_time |
| 🎯 Tocco preciso per il gol | tecnica | 12 | goal | miss | 10 | shot/EDGE_SHOT/shot_power |
| 🌀 Dribbla il portiere e segna | dribbling | 8 | goal | miss | 14 | dribble/DRIBBLE_SHOT/dribble_feint |

### [76] 🏳️ Corner sul primo palo!
`type=off · zones=[area,bordo] · start x[78,88] y[76,88] · move x[76,96] y[75,90] · lock=false · capMosse=0`
`tactic: pressure=high support=3 nearby_def=3 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Tiro di prima all'angolino | tiro | 4 | goal | miss | 16 | shot/EDGE_SHOT/shot_first_time |
| 🔄 Tacco verso compagno | tecnica | -2 | assist | intercept | 12 | shot/EDGE_SHOT/shot_power |
| ✈️ Stacco sul primo palo | fisico | 5 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |

### [77] ⚡ Corner basso teso — devia!
`type=off · zones=[area] · start x[80,90] y[30,70] · move x[78,96] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Deviazione rasoterra | tecnica | 6 | goal | miss | 14 | shot/EDGE_SHOT/shot_first_time |
| 💥 Prima intenzione potente | tiro | 4 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |
| 🤝 Sponda per il compagno | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [78] 📐 Punizione a effetto — curva!
`type=off · zones=[trequarti] · start x[64,70] y[43,57] · move x[62,72] y[40,60] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 📐 Curva a rientrare | tiro | 8 | goal | miss | 12 | freekick/SET_PIECE/– |
| 💥 Tiro piatto rasoterra | tiro | 5 | goal | miss | 11 | freekick/SET_PIECE/– |
| ↗️ Palla sul secondo palo | passaggio | 6 | assist | miss | 8 | freekick/SET_PIECE/– |

### [79] ⚡ Rimessa rapida dal portiere!
`type=off · zones=[difesa,centro] · start x[8,22] y[38,62] · move x[5,30] y[30,70] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Scatto in profondità subito | velocità | 7 | goal | intercept | 18 | build/BUILDUP/– |
| 🎯 Posizionamento smarcato | posizionamento | 5 | goal | intercept | 14 | build/BUILDUP/– |
| 🔄 Schema combinato rapido | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |

### [80] 📐 Angolo sul secondo palo!
`type=off · zones=[area] · start x[78,88] y[22,28] · move x[76,96] y[20,30] · lock=false · capMosse=0`
`tactic: pressure=high support=3 nearby_def=3 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Taglio sul secondo palo | fisico | 7 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 💥 Tiro di prima al volo | tiro | 3 | goal | miss | 14 | shot/EDGE_SHOT/shot_volley |
| 🤝 Sponda verso il centro dell'area | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [81] 📐 Punizione — muro a 9 metri!
`type=off · zones=[trequarti,bordo] · start x[70,75] y[46,54] · move x[68,76] y[44,56] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Botta sopra la barriera | tiro | 6 | goal | miss | 13 | freekick/SET_PIECE/– |
| ↗️ Tocco per il compagno | passaggio | 5 | assist | miss | 8 | freekick/SET_PIECE/– |
| 🎯 Tiro a girare sul palo | tecnica | 2 | goal | miss | 14 | freekick/SET_PIECE/– |

### [82] 🏳️ Angolo corto — triangola!
`type=off · zones=[trequarti,bordo] · start x[62,74] y[89,96] · move x[60,80] y[88,97] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[overlap_right]`
> intro: 📐 Angolo corto! Sorprendi la difesa con il triangolo.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Cross a rientrare | passaggio | 7 | assist | intercept | 10 | cross/CUTBACK/cross_cutback |
| 💥 Tiro a giro verso il palo lontano | tiro | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |
| 🌀 Dribbling e cross in area | tecnica | 4 | assist | nothing | 12 | cross/NEAR_POST_CROSS/cross_near_post |

### [83] ↗️ Schema da rimessa laterale!
`type=off · zones=[trequarti] · start x[58,70] y[3,12] · move x[55,78] y[0,15] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross immediato in area | passaggio | 5 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_near_post |
| ⚡ Scatto sul secondo palo | velocità | 4 | goal | intercept | 16 | build/BUILDUP/– |
| ↩️ Giocata corta con triangolo | tecnica | 6 | assist | nothing | 12 | build/BUILDUP/– |

### [84] 🎯 Cross a rientrare dalla destra!
`type=off · zones=[bordo,trequarti] · start x[66,82] y[74,95] · move x[64,88] y[72,97] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Cross a rientrare perfetto | passaggio | 7 | assist | miss | 11 | cross/CUTBACK/cross_cutback |
| 🦵 Tiro a giro forte sul portiere | tiro | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |
| ↗️ Cross alto sul primo palo | passaggio | 4 | assist | intercept | 8 | cross/NEAR_POST_CROSS/cross_near_post |

### [85] ↘️ Cross rasoterra al centro!
`type=off · zones=[bordo,area] · start x[74,86] y[20,78] · move x[72,94] y[18,82] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↘️ Rasoterra preciso al compagno | passaggio | 8 | assist | intercept | 10 | pass/COMBINATION/– |
| 💥 Tiro diretto in porta | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| 🤸 Deviazione acrobatica col tacco | tecnica | -4 | goal | miss | 16 | shot/EDGE_SHOT/shot_first_time |

### [86] ✈️ Cross al secondo palo — attacca!
`type=off · zones=[area,bordo] · start x[76,88] y[70,88] · move x[74,96] y[65,90] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco sul secondo palo | fisico | 7 | goal | miss | 16 | header/HEADER_ATTACK/header_far_post |
| 🦵 Tiro di prima al volo | tiro | 4 | goal | miss | 14 | shot/EDGE_SHOT/shot_volley |
| 🤝 Sponda verso il centro | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [87] ⚡ Cross di prima senza guardare!
`type=off · zones=[bordo,trequarti] · start x[64,80] y[15,85] · move x[62,88] y[10,90] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Cross cieco di prima | passaggio | 5 | assist | intercept | 13 | cross/NEAR_POST_CROSS/cross_near_post |
| 🎯 Cross a rientrare guardato | passaggio | 7 | assist | miss | 10 | cross/CUTBACK/cross_cutback |
| 🦵 Tiro senza pensarci | tiro | -5 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [88] ⚽ Volée su cross alzato!
`type=off · zones=[area] · start x[80,90] y[28,72] · move x[78,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚽ Volée di collo potente | tiro | 2 | goal | miss | 16 | shot/EDGE_SHOT/shot_volley |
| ✈️ Colpo di testa al volo | fisico | 4 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |
| 🎯 Controllo e tiro fermo | tecnica | 6 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [89] 🌀 Cross d'esterno su cross basso!
`type=off · zones=[bordo,area] · start x[76,86] y[10,24] · move x[74,94] y[8,28] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Esterno a rientrare | passaggio | 5 | assist | intercept | 11 | pass/COMBINATION/– |
| 💥 Tiro dall'angolo stretto | tiro | 2 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ↗️ Cross interno normale | passaggio | 6 | assist | intercept | 8 | cross/NEAR_POST_CROSS/cross_near_post |

### [90] ✈️ Testa su cross dalla trequarti!
`type=off · zones=[area,bordo] · start x[78,88] y[35,65] · move x[76,96] y[30,70] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Testa di potenza | fisico | 6 | goal | miss | 16 | header/HEADER_ATTACK/header_near_post |
| 🎯 Testa piazzata all'angolo | fisico | 4 | goal | miss | 13 | header/HEADER_ATTACK/header_near_post |
| 🌀 Testa smorzata per il compagno | tecnica | 2 | assist | intercept | 10 | header/HEADER_ATTACK/header_near_post |

### [91] ⚡ Cross dal fondo — angolo stretto!
`type=off · zones=[area] · start x[86,96] y[14,24] · move x[84,98] y[12,28] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross sul primo palo | passaggio | 5 | assist | intercept | 12 | cross/NEAR_POST_CROSS/cross_near_post |
| 🦵 Tiro da posizione impossibile | tiro | -8 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| ↘️ Rasoterra rasente il palo | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |

### [92] 🔄 Roulette sul difensore!
`type=off · zones=[bordo,trequarti] · start x[64,78] y[28,72] · move x[62,90] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔄 Roulette di classe | tecnica | 7 | goal | intercept | 20 | shot/EDGE_SHOT/shot_power |
| ⚡ Finta e scatto | velocità | 5 | goal | intercept | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| ↩️ Appoggio sicuro al compagno | passaggio | 2 | assist | intercept | 8 | pass/COMBINATION/– |

### [93] 🌀 Elastico in area!
`type=off · zones=[area,bordo] · start x[78,88] y[28,72] · move x[75,96] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Elastico e tiro netto | dribbling | 4 | goal | intercept | 20 | dribble/DRIBBLE_SHOT/dribble_feint |
| 💥 Tiro diretto senza finte | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↗️ Cross dopo dribbling | passaggio | 4 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_near_post |

### [94] 🦵 Step-over e via!
`type=off · zones=[bordo,trequarti] · start x[62,76] y[28,72] · move x[60,88] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Step-over e scatto | velocità | 6 | goal | intercept | 18 | shot/EDGE_SHOT/shot_power |
| 🌀 Step-over e cross | dribbling | 4 | assist | intercept | 14 | cross/NEAR_POST_CROSS/cross_near_post |
| 💥 Finta e tiro immediato | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [95] 💨 Finta di corpo e scatto!
`type=off · zones=[trequarti,bordo] · start x[60,76] y[28,72] · move x[58,88] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💨 Finta rapida e scatto | velocità | 6 | goal | intercept | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🌀 Finta di corpo e cross | dribbling | 4 | assist | intercept | 14 | cross/NEAR_POST_CROSS/cross_near_post |
| 🎯 Assist dopo la finta | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [96] 🏃 Dribbling sulla linea di fondo!
`type=off · zones=[area] · start x[84,96] y[12,22] · move x[82,98] y[10,25] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↗️ Cross al centro da fondo | passaggio | 6 | assist | intercept | 12 | cross/NEAR_POST_CROSS/cross_near_post |
| 🌀 Scarta il portiere da fondo | dribbling | -2 | goal | miss_easy | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🦵 Tiro da angolo impossibile | tiro | -8 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [97] 🌀 Scarta il portiere in uscita!
`type=off · zones=[area,bordo] · start x[78,88] y[33,67] · move x[76,96] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Scarta col dribbling | dribbling | 4 | goal | miss_easy | 20 | dribble/DRIBBLE_SHOT/dribble_feint |
| 💥 Tiro diretto sul portiere | tiro | -4 | goal | miss | 12 | shot/ONE_ON_ONE/shot_one_on_one |
| ↗️ Assist al compagno libero | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [98] 🌀 Tunnel in area! Passa in mezzo.
`type=off · zones=[area] · start x[82,92] y[30,70] · move x[80,97] y[25,75] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Tunnel e tiro netto | dribbling | 8 | goal | loose | 22 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🦵 Tiro diretto più sicuro | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↩️ Retropassaggio fuori area | passaggio | 2 | assist | intercept | 8 | pass/COMBINATION/– |

### [99] ⚡ Scatto puro — nessuno ti segue!
`type=off · zones=[trequarti,bordo] · start x[58,72] y[28,72] · move x[55,88] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=1 nearby_def=0 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Scatto esplosivo in profondità | velocità | 9 | goal | intercept | 22 | build/BUILDUP/– |
| 🎯 Controllo e conclude | tecnica | 5 | goal | intercept | 16 | build/BUILDUP/– |
| ↗️ Cross al volo in corsa | passaggio | 4 | assist | intercept | 10 | cross/NEAR_POST_CROSS/cross_near_post |

### [100] 🔄 Hocus pocus sulla fascia!
`type=off · zones=[bordo,trequarti] · start x[62,76] y[8,25] · move x[60,88] y[5,30] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔄 Hocus pocus e cross | dribbling | 5 | assist | intercept | 22 | cross/NEAR_POST_CROSS/cross_near_post |
| ⚡ Finta e scatto sulla fascia | velocità | 4 | assist | intercept | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| 💥 Tiro a giro sul portiere | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_curled |

### [101] 🌀 Cambio di direzione a 180°!
`type=off · zones=[bordo,trequarti] · start x[60,74] y[28,72] · move x[58,88] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Virata istantanea e scatto | velocità | 6 | goal | intercept | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Giro e cross | dribbling | 4 | assist | intercept | 14 | cross/NEAR_POST_CROSS/cross_near_post |
| 💥 Tiro dopo la virata | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [102] 🦵 Uno contro uno col terzino in fascia — spazio per il cross!
`type=off · zones=[bordo,trequarti] · start x[62,78] y[72,95] · move x[60,88] y[68,97] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling netto e cross | dribbling | 5 | assist | intercept | 18 | cross/NEAR_POST_CROSS/cross_near_post |
| ⚡ Scatto in velocità | velocità | 4 | assist | intercept | 16 | shot/EDGE_SHOT/shot_power |
| ↗️ Cross immediato senza dribblare | passaggio | 6 | assist | intercept | 8 | cross/NEAR_POST_CROSS/cross_near_post |

### [103] 🤸 Controllo acrobatico e tiro!
`type=off · zones=[area,bordo] · start x[76,88] y[28,72] · move x[74,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤸 Controllo acrobatico e tira | tecnica | 3 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| ✈️ Testa al volo | fisico | 4 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |
| 🦵 Tiro di prima | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |

### [104] 🌀 Dribbling in spazio ristretto!
`type=off · zones=[area,bordo] · start x[78,90] y[28,72] · move x[75,97] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=3 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling stretto e tiro | dribbling | 8 | goal | intercept | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Tiro rapido senza dribblare | tiro | 3 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ↗️ Serve il compagno libero | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |

### [105] 🔄 Cambio gioco rapido 50 metri!
`type=off · zones=[centro,trequarti] · start x[42,60] y[28,72] · move x[40,70] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔄 Lancio lungo di prima | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Avanza e cambia lato | velocità | 3 | goal | intercept | 15 | build/BUILDUP/– |
| 🎯 Passaggio corto e triangolo | tecnica | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [106] 🎯 Chip pass oltre la difesa!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[56,84] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Chip millimetrico | tecnica | 6 | assist | intercept | 13 | build/BUILDUP/– |
| ⚡ Lancio piatto in profondità | passaggio | 4 | assist | intercept | 10 | pass/THROUGH_BALL/– |
| 🌀 Avanza e crea spazio | velocità | 3 | goal | intercept | 16 | build/BUILDUP/– |

### [107] 🕳️ Palla al buco tra i centrali!
`type=off · zones=[trequarti] · start x[58,70] y[30,70] · move x[55,78] y[25,75] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🕳️ Filtrante tra i centrali | passaggio | 9 | assist | intercept | 12 | pass/THROUGH_BALL/– |
| 💥 Tiro dal limite invece | tiro | -5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ⚡ Avanza tu stesso | velocità | 4 | goal | intercept | 16 | build/BUILDUP/– |

### [108] ✈️ Spizzata aerea per il compagno!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[30,70] · move x[55,84] y[25,75] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Spizzata di testa | fisico | 5 | assist | intercept | 11 | header/HEADER_ATTACK/header_near_post |
| 🎯 Colpo di testa mirato | fisico | 3 | assist | miss | 10 | header/HEADER_ATTACK/header_near_post |
| 🔙 Retropassaggio per riorganizzare | passaggio | 2 | assist | intercept | 6 | pass/COMBINATION/– |

### [109] 🎯 Stop e tiro fulmineo!
`type=off · zones=[trequarti,bordo] · start x[62,76] y[30,70] · move x[60,82] y[25,75] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Stop e tiro preciso | tecnica | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 💥 Prima intenzione senza stop | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_first_time |
| ↩️ Controlla e serve | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [110] 🏃 Fai il velo per il compagno!
`type=off · zones=[trequarti,bordo] · start x[60,74] y[28,72] · move x[58,84] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Faccio il velo e attacco | posizionamento | 5 | goal | intercept | 16 | build/BUILDUP/– |
| ↩️ Ricevo dopo il velo | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Scatto oltre il velo | velocità | 4 | goal | intercept | 14 | build/BUILDUP/– |

### [111] ⚡ Assist rasoterra in area piccola!
`type=off · zones=[area] · start x[84,94] y[28,72] · move x[82,98] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Rasoterra preciso per il compagno | passaggio | 9 | assist | intercept | 10 | pass/COMBINATION/– |
| 🦵 Tiro di prima invece | tiro | 5 | goal | miss_easy | 12 | shot/EDGE_SHOT/shot_first_time |
| 🤸 Tacco verso il compagno libero | tecnica | -2 | assist | intercept | 14 | shot/EDGE_SHOT/shot_power |

### [112] 🌀 Penetrazione centrale in dribbling!
`type=off · zones=[trequarti,bordo] · start x[60,72] y[38,62] · move x[58,86] y[35,65] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling centrale e tiro | dribbling | 5 | goal | intercept | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Spunto esplosivo verso porta | velocità | 4 | goal | intercept | 16 | build/BUILDUP/– |
| ↩️ Dai e vai in verticale | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [113] 🎯 Assist di prima al compagno libero!
`type=off · zones=[trequarti,bordo] · start x[60,74] y[28,72] · move x[58,86] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Assist di prima senza guardare | passaggio | 7 | assist | intercept | 12 | pass/COMBINATION/– |
| 💥 Tiro a sorpresa senza assist | tiro | 2 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🌀 Finta e serve dopo la finta | tecnica | 4 | assist | intercept | 10 | dribble/DRIBBLE_SHOT/dribble_feint |

### [114] ↩️ Rimorchio al limite dell'area!
`type=off · zones=[trequarti,bordo] · start x[62,76] y[28,72] · move x[60,84] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ↩️ Rimorchio e tiro | tecnica | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Rimorchio e serve il compagno | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Rimorchio e scatto | velocità | 4 | goal | intercept | 15 | build/BUILDUP/– |

### [115] 🦶 Tacco al limite! Colpo di classe.
`type=off · zones=[bordo,trequarti] · start x[64,76] y[30,70] · move x[62,84] y[25,75] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦶 Tacco in porta | tecnica | -3 | goal | miss | 20 | shot/EDGE_SHOT/shot_power |
| 🦵 Tiro interno piede classico | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↩️ Tacco per il compagno libero | passaggio | 4 | assist | intercept | 10 | pass/COMBINATION/– |

### [116] 💡 Smarcamento improvviso!
`type=off · zones=[trequarti,bordo] · start x[58,72] y[28,72] · move x[55,84] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💡 Finta e scarta il difensore | dribbling | 6 | goal | intercept | 16 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Taglio improvviso diagonale | velocità | 5 | goal | intercept | 14 | build/BUILDUP/– |
| 🎯 Schema concordato coi compagni | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |

### [117] 🎯 Taglio diagonale e tiro!
`type=off · zones=[trequarti,bordo] · start x[60,74] y[28,72] · move x[58,86] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Taglio diagonale e tiro | velocità | 6 | goal | intercept | 18 | shot/EDGE_SHOT/shot_power |
| 🌀 Dribbling dopo il taglio | dribbling | 4 | goal | intercept | 14 | dribble/DRIBBLE_SHOT/dribble_feint |
| ↩️ Appoggio per il compagno | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [118] ⚡ Smistamento rapidissimo a un tocco!
`type=off · zones=[centro,trequarti] · start x[40,56] y[28,72] · move x[38,65] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=3 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Uno-due e smista subito | passaggio | 7 | assist | intercept | 8 | pass/COMBINATION/– |
| 🔄 Cambia lato rapidamente | passaggio | 5 | assist | intercept | 6 | pass/COMBINATION/– |
| 🏃 Avanza col pallone | velocità | 3 | goal | intercept | 14 | build/BUILDUP/– |

### [119] 📏 Cambio di gioco lungo 50 metri!
`type=off · zones=[centro,difesa] · start x[33,52] y[28,72] · move x[30,60] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 📏 Lancio lungo 50m di prima | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |
| 🔄 Cambio campo 30m | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |
| ↩️ Mantieni il possesso sicuro | passaggio | 2 | assist | nothing | 5 | pass/COMBINATION/– |

### [120] 🎯 Verticale filtrante di prima!
`type=off · zones=[centro,trequarti] · start x[40,56] y[28,72] · move x[38,65] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Verticale filtrante di prima | passaggio | 8 | assist | intercept | 11 | pass/THROUGH_BALL/– |
| ⚡ Avanza in profondità tu stesso | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |
| 🌀 Dribbling e avanza | dribbling | 3 | goal | intercept | 13 | dribble/DRIBBLE_SHOT/dribble_feint |

### [121] 🔥 Triangolo veloce 3 contro 2!
`type=off · zones=[trequarti,bordo] · start x[58,72] y[28,72] · move x[55,84] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=3 nearby_def=2 lanes=[central_run,through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔥 Triangolo e vai | tecnica | 7 | goal | intercept | 18 | build/BUILDUP/– |
| ↩️ Dai e vai subito | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Scatto in verticale | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |

### [122] 🌀 Parabola d'esterno — cambio gioco!
`type=off · zones=[centro,difesa] · start x[33,50] y[28,72] · move x[30,58] y[20,80] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Parabola d'esterno 40m | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |
| 📏 Lancio lungo di collo | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |
| ↩️ Passaggio sicuro corto | passaggio | 2 | assist | nothing | 5 | pass/COMBINATION/– |

### [123] 🏃 Ricezione di spalle e giratone!
`type=off · zones=[centro] · start x[42,54] y[32,68] · move x[38,60] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Giratone e avanza | tecnica | 5 | goal | intercept | 14 | build/BUILDUP/– |
| ↩️ Dai e ricevi subito | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |
| 💥 Tiro dal limite dopo giratone | tiro | -6 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [124] 🎯 Lanci lunghi — alzati e controlla!
`type=off · zones=[difesa,centro] · start x[18,38] y[28,72] · move x[15,45] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Colpo di testa e smista | fisico | 5 | assist | intercept | 8 | header/HEADER_ATTACK/header_near_post |
| 🛑 Stop di petto e avanza | tecnica | 4 | goal | intercept | 12 | build/BUILDUP/– |
| ⚡ Scatta e controlla al volo | velocità | 3 | goal | intercept | 14 | build/BUILDUP/– |

### [125] ⚡ Break verticale — lancia la transizione!
`type=off · zones=[centro,trequarti] · start x[42,58] y[28,72] · move x[40,68] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Lancio in profondità immediato | passaggio | 7 | assist | intercept | 11 | pass/THROUGH_BALL/– |
| 🏃 Avanza col pallone di corsa | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |
| 🔄 Smista sul lato libero | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [126] 🧠 Gioco aereo a centrocampo!
`type=off · zones=[centro,trequarti] · start x[40,58] y[28,72] · move x[38,68] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco e indirizza il compagno | fisico | 6 | assist | intercept | 10 | header/HEADER_ATTACK/header_near_post |
| 💪 Stacco difensivo deciso | fisico | 4 | recovery | through | 12 | header/HEADER_ATTACK/header_near_post |
| 🤝 Sponda per il compagno | passaggio | 2 | assist | nothing | 8 | pass/COMBINATION/– |

### [127] 💪 Pressing aggressivo a centrocampo — sfida sul portatore!
`type=def · zones=[centro,trequarti] · start x[42,60] y[28,72] · move x[38,70] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=1 lanes=[]`
> intro: 💪 L'avversario parte in transizione! Bloccalo subito!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💪 Contrasto duro sull'avversario | fisico | 5 | recovery | foul | 16 | tackle/TACKLE/– |
| ✋ Intercetta la traiettoria | tecnica | 4 | recovery | through | 12 | tackle/TACKLE/– |
| 🏃 Sprint di copertura | velocità | 6 | recovery | through | 14 | tackle/TACKLE/– |

### [128] 🛑 Chiusura urgente sull'attaccante!
`type=def · zones=[difesa,propria] · start x[18,38] y[28,72] · move x[15,45] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: 🚨 L'attaccante è solo in campo aperto! Chiudigli la strada!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛑 Chiusura immediata | velocità | 8 | recovery | through | 20 | tackle/TACKLE/– |
| 💪 Contrasto fisico deciso | fisico | 5 | recovery | foul | 16 | tackle/TACKLE/– |
| 📣 Posizionamento strategico | posizionamento | 4 | recovery | through | 12 | tackle/TACKLE/– |

### [129] 🤼 Raddoppio difensivo!
`type=def · zones=[difesa,centro] · start x[22,42] y[28,72] · move x[18,55] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=1 lanes=[]`
> intro: 🤝 Raddoppia sul portatore! Superiamo l'emergenza.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤼 Raddoppio coordinato col compagno | tecnica | 6 | recovery | through | 14 | tackle/TACKLE/– |
| 🏃 Sprint di copertura urgente | velocità | 5 | recovery | through | 16 | tackle/TACKLE/– |
| 📣 Chiamo il compagno a raddoppiare | tecnica | 3 | recovery | nothing | 8 | tackle/TACKLE/– |

### [130] ✋ Intercetto in verticale!
`type=def · zones=[centro,difesa] · start x[26,46] y[28,72] · move x[22,58] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: 👁️ Il passaggio sta per partire! Anticipalo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✋ Anticipo sulla traiettoria | tecnica | 8 | recovery | through | 13 | tackle/TACKLE/– |
| ⚡ Sprint anticipato | velocità | 6 | recovery | through | 16 | tackle/TACKLE/– |
| 💪 Contrasto di spalla | fisico | 4 | recovery | foul | 12 | tackle/TACKLE/– |

### [131] 🛡️ Fallo tattico — ferma il contropiede!
`type=def · zones=[centro,trequarti] · start x[40,58] y[28,72] · move x[38,70] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: 🧠 Meglio un fallo tattico che un gol subito!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛡️ Fallo intelligente in zona | mentalità | 5 | save | foul | 10 | tackle/TACKLE/– |
| ⚡ Recupero in velocità invece | velocità | 6 | recovery | through | 18 | tackle/TACKLE/– |
| 💪 Contrasto pulito senza fallo | fisico | 3 | recovery | foul | 14 | tackle/TACKLE/– |

### [132] 🧱 Blocco del tiro in area!
`type=def · zones=[propria] · start x[7,18] y[30,70] · move x[5,22] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`
> intro: 💥 Tiro in arrivo! Mettiti sulla traiettoria!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🧱 Blocco col corpo sulla traiettoria | fisico | 9 | save | goal_against | 16 | tackle/TACKLE/– |
| ✋ Devia col piede sul palo | tecnica | 5 | save | goal_against | 12 | tackle/TACKLE/– |
| 😱 Tentativo disperato | fisico | 3 | save | goal_against | 10 | tackle/TACKLE/– |

### [133] 🏃 Recupero sulla linea di fondo!
`type=def · zones=[propria] · start x[4,12] y[12,26] · move x[2,15] y[10,30] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[]`
> intro: ⚡ Palla verso il fondo — ultima chance!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Sprint disperato sulla linea | velocità | 7 | save | goal_against | 20 | tackle/TACKLE/– |
| ✋ Intercetto prima del fondo | tecnica | 5 | save | goal_against | 14 | tackle/TACKLE/– |
| 📣 Chiamo il portiere | tecnica | 2 | save | goal_against | 8 | tackle/TACKLE/– |

### [134] ✈️ Sfida aerea su lancio lungo!
`type=def · zones=[propria,difesa] · start x[10,25] y[28,72] · move x[8,30] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`
> intro: ✈️ Lancio lungo in area! Vinci il duello aereo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco dominante | fisico | 8 | save | goal_against | 14 | header/HEADER_ATTACK/header_near_post |
| 💪 Contrasto fisico in volo | fisico | 5 | save | goal_against | 12 | tackle/TACKLE/– |
| 📣 Chiamo il portiere | tecnica | 4 | save | goal_against | 8 | tackle/TACKLE/– |

### [135] 🤝 Copertura del compagno fuori posizione!
`type=def · zones=[difesa,propria] · start x[8,28] y[28,72] · move x[5,35] y[20,80] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: 🤝 Il compagno è fuori posizione! Copri tu!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤝 Copro la sua posizione | posizionamento | 7 | save | through | 12 | tackle/TACKLE/– |
| ⚡ Sprint per coprire lo spazio | velocità | 5 | save | through | 16 | tackle/TACKLE/– |
| 📣 Comunico la situazione | tecnica | 4 | save | through | 8 | tackle/TACKLE/– |

### [136] 🛑 Cross basso in area — intercetta!
`type=def · zones=[propria,difesa] · start x[10,22] y[28,72] · move x[8,28] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`
> intro: ⚠️ Cross basso pericoloso in area! Intercetta prima che arrivi al centro!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛑 Blocca il cross con il corpo | fisico | 6 | save | goal_against | 14 | cross/NEAR_POST_CROSS/cross_near_post |
| ✋ Devia in corner | tecnica | 5 | save | goal_against | 12 | tackle/TACKLE/– |
| 📣 Chiama il portiere | tecnica | 3 | save | goal_against | 8 | tackle/TACKLE/– |

### [137] ⚡ Tackle in corsa — è più veloce!
`type=def · zones=[difesa,centro] · start x[25,44] y[28,72] · move x[22,55] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: 🏃 L'attaccante fugge in velocità! Raggiungerlo?

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Tackle in corsa preciso | fisico | 6 | recovery | foul | 16 | tackle/TACKLE/– |
| 🌀 Indirizza verso il fallo laterale | tecnica | 4 | recovery | through | 12 | tackle/TACKLE/– |
| 🏃 Sprint puro di rientro | velocità | 5 | recovery | through | 14 | tackle/TACKLE/– |

### [138] 📣 Allineati con la difesa — linea alta!
`type=def · zones=[propria,difesa] · start x[8,24] y[28,72] · move x[5,30] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`
> intro: 📣 Linea alta! Allineati con i compagni e non farti sorprendere in offside!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 📣 Allineamento difensivo immediato | mentalità | 6 | save | through | 10 | tackle/TACKLE/– |
| 💪 Contrasto fisico duro | fisico | 4 | save | goal_against | 14 | tackle/TACKLE/– |
| ⚡ Pressing immediato sul portatore | velocità | 5 | recovery | through | 12 | tackle/TACKLE/– |

### [139] 🏃 Pressing coordinato — recupera!
`type=def · zones=[trequarti,centro] · start x[44,62] y[28,72] · move x[40,72] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=2 nearby_def=1 lanes=[]`
> intro: 😤 Pressing alto! Recupera nella loro metà!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Pressing a zona coordinato | velocità | 6 | recovery | through | 16 | tackle/TACKLE/– |
| ✋ Intercetta il passaggio | tecnica | 5 | recovery | through | 12 | tackle/TACKLE/– |
| 💪 Contrasto duro sull'avversario | fisico | 3 | recovery | foul | 14 | tackle/TACKLE/– |

### [140] 🔥 Siamo in vantaggio — gestisci!
`type=off ctx=winning · zones=[trequarti,centro] · start x[42,62] y[28,72] · move x[38,75] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔥 Porta palla nell'angolo | tecnica | 5 | goal | nothing | 12 | build/BUILDUP/– |
| ↩️ Passaggio sicuro laterale | passaggio | 4 | assist | nothing | 6 | pass/COMBINATION/– |
| 💥 Rilancio offensivo in profondità | velocità | 3 | goal | intercept | 14 | build/BUILDUP/– |

### [141] ⏱️ Due minuti alla fine — attacca!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: ⏱️ Mancano 2 minuti! Adesso o mai più!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Tiro dalla distanza! | tiro | -3 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ⚡ Sprint verso la porta | velocità | 6 | goal | intercept | 18 | build/BUILDUP/– |
| 🎯 Assist preciso | passaggio | 5 | assist | intercept | 12 | pass/COMBINATION/– |

### [142] 🌧️ Campo pesante — pioggia torrenziale!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌧️ Tiro rasoterra sul bagnato | tiro | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 💪 Usa il fisico — campo pesante | fisico | 4 | goal | miss | 13 | build/BUILDUP/– |
| 🎯 Passaggio corto e sicuro | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [143] 🏟️ Derby cittadino! Intensità massima.
`type=off · zones=[bordo,trequarti] · start x[60,76] y[28,72] · move x[58,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: 🏟️ È il derby! Sessantamila tifosi. Solo tu e il pallone.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔥 Tiro potente — adrenalina pura | tiro | 4 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 🌀 Dribbling tecnico da campione | dribbling | 3 | goal | miss | 15 | dribble/DRIBBLE_SHOT/dribble_feint |
| 🎯 Assist preciso — vinci il derby | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [144] 💔 Davanti alla tua ex squadra — momento decisivo.
`type=off ctx=is_ex_club · zones=[bordo,area] · start x[72,86] y[28,72] · move x[70,96] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: 💔 È la partita contro la tua ex squadra. Cosa fai?

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Gol dell'ex — silenzio assoluto | tiro | 6 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Assist gelido e decisivo | passaggio | 5 | assist | intercept | 12 | pass/COMBINATION/– |
| ⚡ Scatto senza rimpianti | velocità | 4 | goal | intercept | 16 | shot/EDGE_SHOT/shot_power |

### [145] 🌟 Stadio in delirio! Fai il gol dell'anno.
`type=off · zones=[bordo,area] · start x[74,88] y[28,72] · move x[72,96] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: 🌟 Lo stadio è in delirio! Fai la cosa più difficile!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌟 Gol dell'anno — ci provo! | tiro | 3 | goal | miss | 20 | shot/EDGE_SHOT/shot_power |
| 🎯 Assist decisivo per la vittoria | passaggio | 5 | assist | intercept | 12 | pass/COMBINATION/– |
| ⚡ Gioco sul sicuro | velocità | 4 | goal | intercept | 14 | shot/EDGE_SHOT/shot_power |

### [146] 😤 Siamo in dieci uomini! Difendi.
`type=def · zones=[difesa,centro] · start x[22,42] y[28,72] · move x[18,55] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=1 lanes=[]`
> intro: 😤 Espulsione! Siamo in dieci. Ogni pallone è oro.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 😤 Blocca con tutto il fisico | fisico | 7 | recovery | foul | 14 | tackle/TACKLE/– |
| ⚡ Sprint disperato di copertura | velocità | 6 | recovery | through | 18 | tackle/TACKLE/– |
| 🧠 Intelligenza tattica — posizionati | mentalità | 5 | recovery | nothing | 12 | tackle/TACKLE/– |

### [147] 🎯 Superiorità numerica — sfruttala!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,88] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Sfrutta lo spazio in più | passaggio | 7 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Scatto senza pressione | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |
| 💥 Tiro con fiducia | tiro | 3 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |

### [148] 🏃 Rimessa dal portiere — verticale!
`type=off · zones=[difesa,centro] · start x[12,32] y[30,70] · move x[10,40] y[25,75] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🏃 Scatto in profondità | velocità | 6 | goal | intercept | 16 | build/BUILDUP/– |
| 🎯 Triangolo col portiere | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |
| 🧠 Costruisci con qualità | tecnica | 3 | assist | nothing | 6 | build/BUILDUP/– |

### [149] ⚡ Rimessa laterale rapida — sorpresa!
`type=off · zones=[trequarti,centro] · start x[45,62] y[3,12] · move x[42,72] y[0,15] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Rimessa rapida e scatti | velocità | 6 | goal | intercept | 16 | build/BUILDUP/– |
| ↗️ Rimessa lunga in area | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |
| 🎯 Schema concordato dalla rimessa | tecnica | 6 | assist | nothing | 12 | build/BUILDUP/– |

### [150] 🎭 Guadagna una punizione!
`type=off · zones=[bordo,area] · start x[75,88] y[28,72] · move x[73,96] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling provocatorio — il fallo c'è! | dribbling | 4 | assist | intercept | 12 | freekick/SET_PIECE/– |
| ⚡ Scatto improvviso provocatorio | velocità | 4 | assist | through | 12 | freekick/SET_PIECE/– |
| 💥 Tiro potente invece | tiro | 3 | goal | miss | 14 | freekick/SET_PIECE/– |

### [151] 🔴 Ribattuta libera in area — arrivaci per primo!
`type=off · zones=[area] · start x[86,96] y[33,67] · move x[84,98] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[]`
> intro: 🔴 Il portiere ha parato! La palla rimbalza in area!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Arriva di sprint sulla ribattuta | velocità | 12 | goal | miss_easy | 12 | shot/EDGE_SHOT/shot_power |
| 🦵 Tiro di prima sul rimbalzo | tiro | 8 | goal | miss | 12 | shot/EDGE_SHOT/shot_first_time |
| 🤝 Servi il compagno libero | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |

### [152] 📋 Schema doppio dai e vai!
`type=off · zones=[trequarti,bordo] · start x[58,72] y[28,72] · move x[55,85] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=1 lanes=[]`
> intro: 📋 Schema a tre! Dai, ricevi, dai ancora e arriva in porta.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 📋 Schema a tre — dai, ricevi, tira | passaggio | 9 | goal | intercept | 18 | pass/COMBINATION/– |
| ⚡ Primo triangolo e scatta | velocità | 6 | goal | intercept | 16 | build/BUILDUP/– |
| 🎯 Terzo uomo smarcato | passaggio | 7 | assist | intercept | 12 | pass/COMBINATION/– |

### [153] 💥 Bordata da centrocampo!
`type=off · zones=[trequarti] · start x[57,68] y[32,68] · move x[55,72] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Bordata potente | tiro | -10 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Tiro controllato | tiro | -5 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ↗️ Serve in area per il compagno | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [154] 🌀 Azione individuale — porta il pallone!
`type=off · zones=[trequarti,bordo] · start x[58,74] y[28,72] · move x[55,88] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Dribbling individuale feroce | dribbling | 5 | goal | intercept | 18 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Sprint verso la porta | velocità | 4 | goal | intercept | 16 | build/BUILDUP/– |
| 🎯 Serve un compagno smarcato | passaggio | 5 | assist | intercept | 10 | pass/COMBINATION/– |

### [155] 🧠 Anticipo tattico — leggi il gioco!
`type=off · zones=[centro,trequarti] · start x[40,58] y[28,72] · move x[38,70] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🧠 Anticipi la giocata avversaria | mentalità | 7 | recovery | through | 12 | build/BUILDUP/– |
| ⚡ Sprint anticipato | velocità | 5 | recovery | through | 14 | build/BUILDUP/– |
| ↩️ Posizionamento preventivo | posizionamento | 4 | recovery | nothing | 8 | build/BUILDUP/– |

### [156] 🎯 Lancio millimetrico in profondità!
`type=off · zones=[centro,difesa] · start x[30,50] y[28,72] · move x[28,60] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=0 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Lancio in profondità perfetto | passaggio | 8 | assist | intercept | 12 | pass/THROUGH_BALL/– |
| ⚡ Avanza di corsa e lancia | velocità | 5 | assist | intercept | 10 | build/BUILDUP/– |
| 💥 Tiro lungo dal centrocampo | tiro | -15 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |

### [157] 🛡️ Il tiro è in porta — gettati sulla traiettoria!
`type=def · zones=[propria,difesa] · start x[7,20] y[28,72] · move x[5,25] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[]`
> intro: 💥 Il tiro è in porta! Mettiti sulla traiettoria e para con il corpo!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🤸 Gettati sulla traiettoria | fisico | 8 | save | goal_against | 20 | tackle/TACKLE/– |
| ✋ Devia di piede sul palo | tecnica | 6 | save | goal_against | 14 | tackle/TACKLE/– |
| 📣 Avvisa il portiere | tecnica | 3 | save | goal_against | 8 | tackle/TACKLE/– |

### [158] 🔙 Costruzione dal basso!
`type=off · zones=[propria,difesa] · start x[8,22] y[30,70] · move x[5,30] y[25,75] · lock=false · capMosse=2`
`tactic: pressure=low support=3 nearby_def=0 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔙 Smarcati per ricevere | posizionamento | 5 | assist | intercept | 8 | build/BUILDUP/– |
| ⚡ Scatto per dargli una soluzione | velocità | 4 | assist | intercept | 10 | build/BUILDUP/– |
| 💪 Offri il fisico per la palla lunga | fisico | 3 | assist | intercept | 6 | build/BUILDUP/– |

### [159] ⚽ Taglio sul cross al palo lontano — tempismo!
`type=off · zones=[area,bordo] · start x[78,88] y[33,48] · move x[76,96] y[30,50] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚽ Taglio preciso sul palo lontano | velocità | 7 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| ✈️ Testa in profondità | fisico | 5 | goal | miss | 15 | header/HEADER_ATTACK/header_far_post |
| ↩️ Serve il compagno al centro | passaggio | 4 | assist | intercept | 8 | pass/COMBINATION/– |

### [160] 🌀 Portiere in uscita — scartalo!
`type=off · zones=[area,bordo] · start x[77,88] y[32,68] · move x[75,96] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Tiro immediato prima che esca | tiro | 4 | goal | miss | 14 | shot/ONE_ON_ONE/shot_one_on_one |
| 🌀 Scarta il portiere in uscita | dribbling | 5 | goal | miss_easy | 20 | dribble/DRIBBLE_SHOT/dribble_feint |
| ↗️ Passa al compagno a porta vuota | passaggio | 7 | assist | intercept | 10 | pass/COMBINATION/– |

### [161] 📐 Punizione da posizione defilata!
`type=off · zones=[bordo,trequarti] · start x[72,82] y[12,22] · move x[70,85] y[10,25] · lock=true · capMosse=0`
`tactic: pressure=none support=2 nearby_def=0 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 📐 Punizione a rientrare | tiro | 5 | goal | miss | 13 | freekick/SET_PIECE/– |
| ↗️ Cross sul secondo palo | passaggio | 6 | assist | miss | 8 | freekick/SET_PIECE/– |
| 🎯 Palla sul primo palo | passaggio | 4 | assist | intercept | 8 | freekick/SET_PIECE/– |

### [162] 🎯 Assist d'esterno piede!
`type=off · zones=[trequarti,bordo] · start x[60,74] y[28,72] · move x[58,86] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=2 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Esterno piede preciso | passaggio | 6 | assist | intercept | 12 | pass/COMBINATION/– |
| 💥 Tiro d'esterno a sorpresa | tiro | 2 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🌀 Finta e interno piede | tecnica | 4 | assist | intercept | 10 | dribble/DRIBBLE_SHOT/dribble_inside |

### [163] 💥 Bordata dal limite!
`type=off · zones=[trequarti] · start x[57,68] y[32,68] · move x[55,72] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Collo pieno potente | tiro | -8 | goal | miss | 18 | shot/EDGE_SHOT/shot_power |
| 🎯 Tiro controllato | tiro | -4 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| ↗️ Serve in area per il compagno | passaggio | 5 | assist | intercept | 8 | pass/COMBINATION/– |

### [164] ⚡ Taglio dal lato destro verso il centro!
`type=off · zones=[bordo,area] · start x[76,88] y[62,92] · move x[74,96] y[58,97] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Rientra e tira col sinistro | tecnica | 6 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Cross teso verso il secondo palo | passaggio | 5 | assist | intercept | 10 | cross/FAR_POST_CROSS/cross_far_post |
| 💥 Tiro di collo pieno | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [165] ⚡ Taglio dal lato sinistro verso il centro!
`type=off · zones=[bordo,area] · start x[76,88] y[8,38] · move x[74,96] y[3,42] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Rientra e tira col destro | tecnica | 6 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🎯 Cross teso verso il secondo palo | passaggio | 5 | assist | intercept | 10 | cross/FAR_POST_CROSS/cross_far_post |
| 💥 Tiro di collo pieno | tiro | 2 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [166] 🌀 Slalom in area! Tre difensori da superare.
`type=special · zones=[area] · start x[82,92] y[28,72] · move x[80,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=3 lanes=[]`
> intro: 🌀 Slalom tra i difensori! Salta tutti e vai.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Slalom completato e tiro | dribbling | 8 | goal | miss | 20 | dribble/DRIBBLE_SHOT/dribble_feint |
| ⚡ Scatto tra le gambe | velocità | 4 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 🎯 Assist per il compagno smarcato | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |

### [167] 🦵 Controbalzo improvviso in area!
`type=off · zones=[area,bordo] · start x[76,88] y[28,72] · move x[74,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Controbalzo secco al volo | tiro | 7 | goal | miss | 15 | shot/EDGE_SHOT/shot_volley |
| 🎯 Controllo e tira | tecnica | 5 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↩️ Serve il compagno | passaggio | 3 | assist | intercept | 8 | pass/COMBINATION/– |

### [168] 🛡️ Ultimo uomo! Devi fermare l'avversario.
`type=def · zones=[propria,difesa] · start x[8,22] y[30,70] · move x[5,28] y[20,80] · lock=false · capMosse=0`
`tactic: pressure=high support=0 nearby_def=1 lanes=[]`
> intro: 🚨 Sei l'ultimo! Se passa, è gol sicuro.

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🛡️ Tackle duro — rischio rosso | fisico | 10 | recovery | foul | 16 | tackle/TACKLE/– |
| ⚡ Sprint laterale preventivo | velocità | 7 | recovery | through | 14 | tackle/TACKLE/– |
| 📣 Guida i compagni e copri | mentalità | 5 | recovery | through | 10 | tackle/TACKLE/– |

### [169] 😱 Il portiere è fuori dai pali! Tira da lontano.
`type=off · zones=[trequarti,bordo] · start x[58,70] y[32,68] · move x[55,78] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 💥 Tiro da distanza sul palo lontano | tiro | 5 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 🎯 Pallonetto morbido — gol dell'anno | tecnica | 3 | goal | miss_easy | 14 | build/BUILDUP/– |
| 🎯 Assist per il compagno in area | passaggio | 6 | assist | intercept | 10 | pass/COMBINATION/– |

### [170] 🔥 CI CREDIAMO! La rimonta è iniziata.
`type=special ctx=losing · zones=[bordo,area] · start x[74,88] y[28,72] · move x[72,96] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[]`
> intro: 🔥 La rimonta è viva. Un gol adesso e tutto è possibile!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🔥 Tiro di rabbia — per i tifosi | tiro | 6 | goal | miss | 16 | shot/EDGE_SHOT/shot_power |
| 💥 Potenza esplosiva dal limite | tiro | 2 | goal | miss | 14 | shot/EDGE_SHOT/shot_power |
| 🌟 Assist da campione | passaggio | 7 | assist | intercept | 12 | pass/COMBINATION/– |

### [171] 🏃 Corsa in area — stacca di testa in corsa!
`type=off · zones=[area] · start x[80,92] y[28,72] · move x[78,96] y[22,78] · lock=false · capMosse=0`
`tactic: pressure=high support=1 nearby_def=2 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ✈️ Stacco in corsa potente | fisico | 6 | goal | miss | 16 | header/HEADER_ATTACK/header_diving |
| 🎯 Colpo di testa angolato | fisico | 4 | goal | miss | 14 | header/HEADER_ATTACK/header_near_post |
| 🦵 Lascia passare e tira di piede | tecnica | 3 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |

### [172] ⚡ Ultima linea difensiva da superare — sei in area con spazio!
`type=off · zones=[area] · start x[82,93] y[28,72] · move x[80,97] y[22,78] · lock=false · capMosse=1`
`tactic: pressure=medium support=0 nearby_def=1 lanes=[central_run]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🦵 Tiro sul palo più lontano | tiro | 8 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |
| 🎯 Piazzato nell'angolo basso | tecnica | 6 | goal | miss | 12 | shot/EDGE_SHOT/shot_curled |
| ⚡ Tiro di prima — istinto | velocità | 4 | goal | miss | 15 | shot/EDGE_SHOT/shot_first_time |

### [173] 🎯 Cucchiaio a giro sul palo lontano!
`type=off · zones=[bordo,area] · start x[74,86] y[23,38] · move x[72,92] y[20,42] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Cucchiaio a giro angolato | tecnica | 5 | goal | miss | 14 | shot/EDGE_SHOT/shot_chip |
| 💥 Tiro di collo pieno invece | tiro | 3 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |
| ↗️ Cross sul secondo palo | passaggio | 5 | assist | intercept | 8 | cross/FAR_POST_CROSS/cross_far_post |

### [174] 🧠 Verticalizzazione prima del difensore!
`type=off · zones=[centro,trequarti] · start x[40,58] y[28,72] · move x[38,68] y[22,78] · lock=false · capMosse=2`
`tactic: pressure=low support=2 nearby_def=1 lanes=[through_ball_lane]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🎯 Verticalizzazione precisa | passaggio | 9 | assist | intercept | 10 | pass/COMBINATION/– |
| ⚡ Avanza e tira in corsa | velocità | 5 | goal | intercept | 16 | build/BUILDUP/– |
| 🌀 Finta e supera il pressing | tecnica | 5 | goal | intercept | 14 | dribble/DRIBBLE_SHOT/dribble_feint |

### [175] 🧤 Errore del portiere! Ribattuta in area.
`type=off · zones=[area] · start x[86,96] y[33,67] · move x[84,98] y[28,72] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=2 lanes=[]`
> intro: 😱 Il portiere ha lasciato sfuggire il pallone!

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Arriva in tempo sulla ribattuta | velocità | 10 | goal | miss_easy | 10 | shot/EDGE_SHOT/shot_power |
| 🦵 Tiro immediato sul rimbalzo | tiro | 8 | goal | miss | 12 | shot/EDGE_SHOT/shot_power |
| 🤝 Serve il compagno più vicino | passaggio | 6 | assist | intercept | 8 | pass/COMBINATION/– |

### [176] ⚡ Sprint sulla fascia sinistra — supera il terzino!
`type=off · zones=[fascia,trequarti] · start x[62,76] y[5,22] · move x[60,82] y[2,28] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Sterzata d'esterno verso il fondo | dribbling | 5 | assist | intercept | 12 | dribble/DRIBBLE_SHOT/dribble_outside |
| ↗️ Cross al volo senza dribblare | passaggio | 3 | assist | intercept | 9 | cross/NEAR_POST_CROSS/cross_near_post |
| 💥 Tiro a giro dall'angolo stretto | tiro | 1 | goal | miss | 14 | shot/EDGE_SHOT/shot_curled |

### [177] 🌀 Marca stretta sul lato destro — finta e apri lo spazio!
`type=off · zones=[fascia,trequarti] · start x[62,76] y[74,92] · move x[60,82] y[72,96] · lock=false · capMosse=1`
`tactic: pressure=medium support=1 nearby_def=1 lanes=[overlap_right]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| 🌀 Sterzata esterna e fuga verso il fondo | dribbling | 5 | assist | intercept | 12 | dribble/DRIBBLE_SHOT/dribble_outside |
| ↗️ Cross immediato di prima | passaggio | 3 | assist | intercept | 9 | cross/NEAR_POST_CROSS/cross_near_post |
| 🦵 Tiro verso il palo vicino | tiro | 1 | goal | miss | 13 | shot/EDGE_SHOT/shot_power |

### [178] 🏃 Accelerazione sulla fascia — il recupero avversario è lento!
`type=off · zones=[fascia,trequarti] · start x[58,72] y[7,22] · move x[55,78] y[5,25] · lock=false · capMosse=2`
`tactic: pressure=low support=1 nearby_def=0 lanes=[overlap_left]`

| azione | stat | bon | ✓ | ✗ | nrg | type/pattern/variant |
|---|---|---|---|---|---|---|
| ⚡ Sterzata d'esterno e brucia il terzino | dribbling | 6 | assist | nothing | 14 | dribble/DRIBBLE_SHOT/dribble_outside |
| 🎯 Cross preciso al secondo palo | passaggio | 5 | assist | intercept | 9 | cross/FAR_POST_CROSS/cross_far_post |
| 🎯 Tiro a giro sul palo lontano | tiro | 3 | goal | miss | 15 | shot/EDGE_SHOT/shot_curled |

