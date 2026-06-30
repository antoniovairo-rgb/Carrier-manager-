# LIVE MATCH ENGINE — ANALISI TECNICA COMPLETA

> **Documento di sola documentazione.** Nessun file di codice è stato modificato per produrlo. Non contiene correzioni di bug né proposte di implementazione: descrive **esclusivamente il comportamento attuale** del motore Live Match di *Elevora / Career Player Manager (CPM)*, versione **5.51.0**, file unico `CARRIER-MANAGER-AV.html`.
>
> Scopo: fornire la **documentazione definitiva di tutte le situazioni di gioco** del motore, come base per una successiva revisione completa.

**Indice**

1. [Metodologia e perimetro](#0-metodologia-e-perimetro)
2. [Architettura del motore (panoramica)](#a-architettura-del-motore)
3. [Cataloghi di riferimento globali](#b-cataloghi-di-riferimento-globali)
   - B1 Sistema di coordinate · B2 Zone · B3 Stati della palla · B4 Tassonomia intent · B5 hlType/variant/pattern · B6 Tassonomia esiti (outKey) · B7 Libreria animazioni · B8 Sistema camera · B9 Collisioni/fisica · B10 IA off-ball · B11 Sistema archi palla · B12 Sovraimpressioni/HUD/cronaca · B13 Momentum · B14 Crowd chants · B15 BG_MATCH · B16 Set-piece positioning · B17 Scheduling/trigger · B18 succRate & decideExecution
4. [Catalogo delle situazioni di gioco](#c-catalogo-delle-situazioni-di-gioco) — 50 situazioni, ciascuna con i 20 capitoli richiesti
5. [Matrice finale](#d-matrice-finale)
6. [Copertura del motore](#e-copertura-del-motore)

---

## 0. Metodologia e perimetro

### 0.1 Cosa intende il motore per «situazione»

Il Live Match non è una simulazione fisica continua: è una **macchina a stati** che alterna **gioco di sfondo** (cronaca + movimento off-ball) e **highlight interattivi** (momenti decisionali pescati da un database di 179 situazioni scriptate). Una «situazione di gioco» nel senso di questo documento è una **classe canonica di evento** (es. `ATTACK_SHOT_ONE_ON_ONE`, `DEFENSIVE_HEADER`, `SET_PIECE_PENALTY`), derivata dalla combinazione di tre assi che il motore calcola realmente:

```
intent (13 valori)  ×  hlType/variant (9 tipi, ~18 varianti)  ×  ballState (3) / outcome-family
```

Le **179 situazioni scriptate** (`SITUATIONS`) sono le *istanze testuali* di queste classi canoniche. Documentare le 50 classi canoniche (più gli stati strutturali: walkout, kickoff, sub-entrance, cerimonia, cronaca BG) copre il 100% dei comportamenti del motore senza ripetere 179 voci quasi identiche. La **§D Matrice finale** elenca tutte le classi canoniche; la **§B5/§C** mappa ognuna sui dati reali.

### 0.2 Fonti

Tutte le righe citate si riferiscono al file di lavoro `CARRIER-MANAGER-AV.html` (~19.500 righe). I numeri di riga sono indicativi (il file evolve): verificare sempre con `grep -n`. I sottosistemi documentati:

| Sottosistema | Funzione/simbolo chiave | Righe (indicative) |
|---|---|---|
| Database situazioni | `SITUATIONS`, `S()`, `A()` | 1729–2146 |
| Classificazione intento | `deriveIntent` | 1693–1718 |
| Stato palla / cinematica | `deriveBallState`, `hlBallState`, `deriveHL`, `deriveSitCine` | 5508–5596 |
| Motore decisionale | `decideExecution` | 5747–5803 |
| Probabilità | `succRate`, `adaptiveDifficulty`, `calcXG` | 2598–2639 |
| Esiti / risoluzione | `handleAction`, `handleRigore`, `OUTCOME_TX` | 2435–2447, 9350–9499 |
| Sovraimpressioni | `HL_OVERLAY_POOLS`, `hlOverlay` | 2450–2501 |
| Cronaca di sfondo | `BG_MATCH`, BG tick | 2220–2434, 9104–9224 |
| Componente 3D | `ThreeMatchView` (`animOne`, `fireConclusion`, camera, IA off-ball) | 5865–7584 |
| Flusso partita | `LiveMatch` (fasi, scheduling, HUD, overlay) | 8262–10316 |
| Zone | `ZONES`, `getZone` | 2148–2156 |

### 0.3 Convenzioni di questo documento

Ogni situazione del **§C** è documentata con i **20 capitoli** richiesti (1 Identificativo → 20 Matrice). Per evitare 50× ripetizioni dei dettagli condivisi (animazioni, camera, collisioni, IA), i capitoli rimandano ai **Cataloghi di riferimento §B** e aggiungono solo le specificità della situazione. Il **§B** è quindi parte integrante della documentazione di ogni situazione.

---

## A. Architettura del motore

### A.1 Pipeline `Intent → Decision → Simulation → Animation`

Il motore segue una direttiva «simulation-first»: la cinematica è **conseguenza** della simulazione, non scriptata.

```
SITUATIONS[i] (dato scriptato)
   │  deriveIntent(sit)          → intent  ∈ 13   (congelato al build)
   │  deriveBallState(sit)       → ballState ∈ {feet, aerial, set_ground}
   │  deriveSitCine(sit)         → cine {penalty,freekick,oneOnOne,fpCross,fpHeader,tapIn}
   ▼
[scelta azione utente: action ∈ sit.actions, filtrate da filterSitActions]
   │  deriveHL(sit, action)      → {hlType, hlVariant, hlPattern}   (text-free)
   │  succRate(...) + modificatori → rate → ok (bernoulli)
   │  key = ok ? action.rew : action.fail   → outKey ∈ 12
   ▼
[ThreeMatchView render-loop]
   │  fireConclusion(hlType,variant,quality) → arco palla + actType (animazione eroe)
   │  decideExecution(intent,ctx)            → quality q∈[0,1] (plasma arco/precisione)
   │  off-ball AI (F2/F3/F10/F11/F13)        → movimento 21 giocatori
   ▼
[overlay/cronaca]  hlOverlay(outKey,...) + OUTCOME_TX + fireGoalCeleb + crowdChant
```

**Invariante CINE (gate-enforced):** la derivazione cinematica (`deriveHL`/`hlBallState`) **non legge `sit.text`** a runtime; usa intento strutturale + override `tactic.bs`/`tactic.cn` bakati. Conseguenza: testa/volée solo con `ballState==="aerial"`; set-piece solo con `set_ground`. Violazioni → FAIL del quality gate (`data-coherence`).
**Eccezione nota:** `deriveIntent` **legge ancora `sit.text`** (regex) → l'intento NON è text-free (migrazione bloccata: servirebbero ~56 override `tactic.it`).

### A.2 Macchina a stati delle fasi (`LiveMatch`)

```
matchday → formations → walkout → playing ⇄ [hl_intro → hl_move → hl_choose → hl_result] → ended
```

| Fase | Descrizione | Durata/uscita |
|---|---|---|
| `matchday` | Schermata pre-gara (avversario, scout, meteo) | utente: «Continua»→formations / «Salta»→playing |
| `formations` | Schieramenti + tattica avversaria | «Continua»→walkout / «Salta»→playing |
| `walkout` | Ingresso in campo 3D dal tunnel | `onWalkoutDone` (3D, `WALK_DUR=6.2s`) → playing |
| `playing` | Gioco di sfondo: clock `setInterval(300ms)`, cronaca BG, momentum, possesso | clock≥`hlTimes[i]`→hl_intro · clock≥90→ended |
| `hl_intro` | Presentazione highlight (titolo intento + intro) | 2.5s o tap → hl_move/hl_choose |
| `hl_move` | Riposizionamento eroe (DPad, budget `maxMoves`) | move o barra-pressione esaurita (~8s) → hl_choose |
| `hl_choose` | Menu azioni (2–3 scelte, `filterSitActions`) | `handleAction` o auto-tackle timeout → hl_result |
| `hl_result` | Esito + cinematica + sovraimpressione | `postHighlightDuration` o Enter → prossimo HL / playing / ended |
| `ended` | Fischio finale | `handleEnd` → `onMatchEnd` (esce dal componente) |

La pausa (Esc/P) congela tutto durante `playing`/`hl_*`. Ogni `setInterval` ha guardia `if(...||paused)return`.

### A.3 Stato continuo

Durante `playing` lo stato è **distribuito**:
- `pPos {x,y}` (0–100) — posizione logica eroe; `clock` (0–90); `score {home,away}`; `possession` (20–80); `momentum` (0–100, 50=equilibrio); `energy` (0–100); `mStats {goals,assists,rb,xg}`; `mxStats {shots,oppShots,fouls,corners}`.
- `matchPlayers` — 22 giocatori (posizioni logiche), aggiornati da drift formazione e eventi BG.
- Nel 3D: `sr.current` (ref, niente re-render) tiene posizioni mesh, archi palla, timer animazioni. Il render-loop gira su `requestAnimationFrame`.

---

## B. Cataloghi di riferimento globali

> Questi cataloghi sono richiamati dai 20 capitoli di ogni situazione (§C). Costituiscono il *vocabolario* del motore.

### B1 — Sistema di coordinate

Tre spazi coesistono:

| Spazio | Range | Uso |
|---|---|---|
| **Logico** `{x,y}` | x 0–100 (0 = propria porta, 100 = porta avversaria), y 0–100 (0 = fascia sinistra, 100 = destra) | tutta la logica di gioco, zone, posizioni, `pPos` |
| **Mondo Three.js** `{x,y,z}` | x −50..+50 (lunghezza), y altezza, z −34..+34 (larghezza) | rendering 3D |
| **Normalizzato** | x/100, y/100 (0–1) | derivabile; non usato direttamente nel codice |

**Trasformazioni** (in `ThreeMatchView`):
- `G2X = gx => (gx-50)*1.0` → x logico 0–100 in x mondo −50..+50.
- `G2Z = gy => (gy-50)*0.68` → y logico 0–100 in z mondo −34..+34 (scala 0.68).
- Inverse: `x = wx+50`, `y = wz/0.68+50`.
- Porte: `AWAY_GOAL_X = 46`, `HOME_GOAL_X = −46` (x mondo interno rete; piani rete a ±51). **La squadra di casa (eroe) attacca verso +x.**
- Campo: piano `104×68`; linee logiche a ±50 x / ±34 z.

### B2 — Zone del campo (`ZONES`, `getZone(x)`)

`getZone(x)` mappa la sola x logica (le zone sono **bande verticali**):

| Chiave | Etichetta | x logico | x mondo (G2X) | Terzo |
|---|---|---|---|---|
| `propria` | Difesa propria | [0, 20) | −50..−30 | difensivo |
| `difesa` | Centrocampo basso | [20, 38) | −30..−12 | difensivo |
| `centro` | Centrocampo | [38, 55) | −12..+5 | centrale |
| `trequarti` | Trequarti | [55, 72) | +5..+22 | offensivo |
| `bordo` | Bordo area | [72, 84) | +22..+34 | offensivo |
| `area` | Area avversaria | [84, 100) | +34..+50 | offensivo |

**Corridoi (lanes)** — non sono in `ZONES` ma nel campo `tactic.lanes` e nella y logica:
- Corridoio **sinistro** ≈ y∈[0,33]; **centrale** ≈ y∈[33,67]; **destro** ≈ y∈[67,100].
- `fascia` appare in `zones[]`/intent come flag di gioco largo (y<22 o y>78) ma **`getZone` non la restituisce mai**.
- Lane enum osservati: `central_run`, `through_ball_lane`, `overlap_left`, `overlap_right`, `wide`.

**Riferimenti d'area:** Area di rigore ≈ x≥84 (zona `area`); Limite area ≈ x∈[72,84] (zona `bordo`); Dischetto rigore ≈ x∈[88,89], y∈[48,52]; Bandierina/corner ≈ angoli (x≈100, y≈0 o 100); Cerchio di centrocampo ≈ x=50, y=50.
**Zone ring 3D** (`HL_ZONE_3D`): `area{x:38,z:0} · bordo{x:26} · trequarti{x:12} · centro{x:0} · difesa{x:-20} · propria{x:-38} · fascia{x:28,z:16}` (coord. mondo del ring evidenziatore, oggi reso invisibile ma posizionato).

### B3 — Stati della palla (`deriveBallState`)

Tre categorie **congelate al build** (no parsing testo a runtime):

| Stato | Quando | Conteggio (179 sit.) | Giocate ammesse |
|---|---|---|---|
| `feet` | default (palla al piede / rasoterra) | 122 | tiro, passaggio, dribbling, contrasto, controllo |
| `aerial` | `intent ∈ {insertion, cross}` **oppure** override `tactic.bs:"aerial"` | 48 | colpo di testa, volée, rovesciata, sponda aerea |
| `set_ground` | `(intent ∈ {penalty,freekick}) && lockMovement` **oppure** `tactic.bs:"set_ground"` | 9 | palla inattiva (rigore/punizione battuta) |

Override espliciti: 52 situazioni + 3 chain portano `tactic.bs`. **Invariante CINE:** header/volley ⟹ `aerial`; set-piece ⟹ `set_ground` (FAIL del gate se violato).
Stati fisici aggiuntivi della palla emergono a runtime nel render-loop (non come categoria ma come fase d'arco): **a terra** (rest y=0.65), **rasoterra** (arco h<1), **rimbalzante** (`deflect`/`post_rebound` con gravità+restituzione), **alta/lob** (arco h>3), **parabolica** (tutti gli archi `y=0.65+sin(u·π)·h`), **respinta** (`deflect`), **rimpallo** (`post_rebound`, restituzione −0.22/−0.30), **deviazione** (`hit_post`/`deflect`), **retropassaggio** (drift `retreat`/`defend_goal`), **palla inattiva** (`set_ground`).

### B4 — Tassonomia intento (`deriveIntent`) — 13 valori

Ordine di risoluzione (prima corrispondenza vince): `tactic.it` override → `penalty`(/rigore/) → `freekick`(/unizione/) → def{`anticipate`/`intercept`/`recover`} → `switch` → `through` → `onetwo` → `dribble` → `cross` → area{`insertion`|`shot`} → bordo→`shot` → `progression` → fallback per stat → default `shot`.

| Intento | Significato | n. situazioni |
|---|---|---|
| `shot` | conclusione da area/bordo | 38 |
| `progression` | conduzione/avanzamento da centrocampo/trequarti | 24 |
| `cross` | gioco sulla fascia / traversone | 24 |
| `recover` | recupero difensivo generico | 22 |
| `insertion` | inserimento aereo in area (su cross/corner/mischia) | 16 |
| `dribble` | salto dell'uomo | 15 |
| `through` | imbucata / filtrante / verticalizzazione | 12 |
| `onetwo` | uno-due / dai-e-vai / triangolo / scarico | 11 |
| `freekick` | punizione | 8 |
| `switch` | cambio gioco / allarga | 3 |
| `penalty` | rigore | 2 |
| `anticipate` | anticipo difensivo | 2 |
| `intercept` | intercetto difensivo | 2 |

### B5 — hlType / hlVariant / hlPattern (`deriveHL`) — text-free

**hlType (9)** — `shot · header · dribble · pass · penalty · freekick · cross · build · tackle`. Distribuzione per azione (537 azioni totali): `shot 184 · pass 97 · tackle 74 · build 43 · dribble 41 · cross 38 · header 30 · freekick 24 · penalty 6`.

**hlVariant (~18)** per type:
- **shot** → `shot_power`(default,113) · `shot_curled`(18) · `shot_first_time`(29) · `shot_volley`(13) · `shot_chip`(6) · `shot_one_on_one`(5)
- **cross** → `cross_near_post`(24) · `cross_far_post`(6) · `cross_cutback`(5) · `cross_low_driven`(3)
- **header** → `header_near_post`(25) · `header_far_post`(4) · `header_diving`(1)
- **dribble** → `dribble_feint`(35) · `dribble_inside`(3) · `dribble_outside`(3)
- **penalty** → `penalty_panenka`(2) · `null`(power, default)
- **pass / build / freekick / tackle** → `null` (242 azioni senza variante)

**hlPattern (15)** — `PENALTY · SET_PIECE · FAR_POST_CROSS · CUTBACK · NEAR_POST_CROSS · HEADER_ATTACK · ONE_ON_ONE · BALL_CARRY · DRIBBLE_SHOT · EDGE_SHOT · TACKLE · THROUGH_BALL · SWITCH · COMBINATION · BUILDUP`. Distribuzione: `EDGE_SHOT 157 · COMBINATION 87 · TACKLE 74 · DRIBBLE_SHOT 49 · BUILDUP 43 · NEAR_POST_CROSS 27 · SET_PIECE 24 · BALL_CARRY 12 · THROUGH_BALL 9 · ONE_ON_ONE 7 · FAR_POST_CROSS 6 · PENALTY 6 · CUTBACK 5 · SWITCH 1`.

`buildHLTimeline(hl,o)` consuma il pattern per scriptare i «beat» del build-up (kind ∈ `pass|give|carry|through|cross|shot|header|loose|dribble`; attori `HERO|MATE1|DEF1|GK|OPP`).

### B6 — Tassonomia esiti (`outKey` = `ok ? action.rew : action.fail`)

**Chiavi `rew` (successo, 4):** `goal`(278) · `assist`(181) · `recovery`(45) · `save`(33).
**Chiavi `fail` (fallimento, 8):** `intercept`(213) · `miss`(193) · `through`(38) · `nothing`(28) · `goal_against`(28) · `miss_easy`(24) · `foul`(11) · `loose`(2).

| outKey | Famiglia | Effetto stato | Narrazione (`OUTCOME_TX`) |
|---|---|---|---|
| `goal` | successo-gol | goals++, rb+5, score.home+1, evento `player_goal` | 8 frasi gol |
| `assist` | successo-assist | assists++, rb+3, score.home+1, evento `player_assist`, può innescare CHAIN | 6 frasi assist |
| `recovery` | successo-difensivo | rb+1, possession+1 | 5 frasi recupero |
| `save` | successo-difensivo | rb+1 (blocco/parata di corpo) | 4 frasi parata |
| `miss` | fallimento-tiro | — | 8 frasi (fuori/parato/palo/traversa/murato) |
| `miss_easy` | fallimento-gol-clamoroso | rb−2, flash rosso, evento `miss` | 4 frasi |
| `intercept` | fallimento-passaggio | turnover | 4 frasi |
| `through` | fallimento-dribbling/difesa | superato | 4 frasi |
| `goal_against` | fallimento-difensivo | rb−3, score.away+1, evento `opp_goal` | 4 frasi |
| `foul` | fallimento-difensivo | fallo/ammonizione | 3 frasi |
| `nothing` | neutro | momento perso | 3 frasi |
| `loose` | palla vagante | (raro, 2 occorrenze) | — |

Il motore decisionale `decideExecution` produce esiti **più granulari** (saved/blocked/post/wide/corner/offside/overhit/beat_man/fouled/dispossessed/ball_won/…) usati per plasmare la cinematica (non per lo stato salvato). Vedi §B18.

### B7 — Libreria animazioni 3D

**B7.1 Locomozione `animOne(mesh,tx,tz,dt,k,bx,bz)`** (root-motion via lerp, no IK skeletale):
- Eroe: lerp diretto `pos += (target−pos)*k*0.55` (volutamente «pesante»). Off-ball: target committato + modello velocità con inerzia (τ≈0.55s smoothing, τ≈0.5s accel). Mesh GLB: posizione lerp, arti animati dalla clip GLB (`_glbDriven`).
- **Crossfade corsa↔idle `_runB`**: `_runTgt=clamp((sp−0.12)/0.7,0,1)`, `_runB += (_runTgt−_runB)·min(dt·7,1)` (τ≈0.14s). Sostituisce la vecchia soglia dura `sp>0.4` (T-pose glide).
- Andatura: `_ph += sp·dt·2.6`; gambe controfase `amp=min(sp·0.11,0.72)·rb`; braccia opposte `armAmp=min(sp·0.13,0.85)·rb`; bob `|sin|·min(sp·0.024,0.18)`; lean avanti 0.02→0.15·rb; idle-sway `sin·0.048·(1−rb)` (svanisce in corsa). Facing verso il movimento (turn-rate `min((d>0.5?6:3)·dt,1)`), torso-lag clamp ±0.45.
- Variante walkout `animWalk`: cammino dal tunnel allo slot, faccia verso camera (−π/2) da fermo. `WALK_DUR=6.2s`, `SUB_DUR=4.2s`.

**B7.2 Animazioni eroe variant-aware (CINE-VAR)** — innescate da `actType` (=hlType) in `fireConclusion`. Timing `_T`: header 0.75 · penalty 0.70 · tackle 0.6 · cross 0.65 · else 0.55s. `u=min(actT/_T,1)`, **invariante `sw=sin(u·π)`** (i valori scalati per `sw` si auto-azzerano a u=1; solo gli assoluti richiedono cleanup esplicito). `actT += aDt` (delta rallentato in bullet-time sul risultato).

| Type/variant | Gamba calciante `_lR.x` | Altre membra / corpo |
|---|---|---|
| `shot_power` | −2.8·sw | plant lL 0.7·sw, braccia aL 1.1/aR −0.5, torso.y 0.25·sw (follow-through) |
| `shot_curled` | −2.6·sw | yaw `sin(u·π)·0.45`, torso.y 0.4·sw |
| `shot_chip` | −1.6·sw | y 0.38·sw, torso lean-back −0.35·sw (back-hop) |
| `shot_volley` | −3.2·sw | salto a forbice y 1.5·sw, torso.y 0.5·sw |
| `shot_first_time` | −2.0·sw | nessun caricamento, torso.y 0.12·sw |
| `shot_one_on_one` | −2.4·sw | y 0.1·sw, torso.y 0.2·sw |
| `cross_*` | −1.5…−2.4·sw | yaw `sin(u·π)·0.35…0.85` (cutback corpo girato) |
| `penalty` (def) | −3.2·sin(_ku·π) | rincorsa caricata, y 0.2·sw, torso.y 0.3·sw (`_ku` rampa windup) |
| `penalty_panenka` | −1.6·sin(_ku·π) | delicato, y 0.1·sw |
| `freekick` | −2.5·sw | braccia aL 1.4·sw/aR −0.7·sw, y 0.15·sw |
| `header_near_post` | — | salto y 2.2·sw, `_hd.x` 0.7·sw, braccia −2.0·sw |
| `header_far_post` | — | salto y 2.5·sw, yaw `sin(u·π)·0.4` |
| `header_diving` | — | tuffo y 0.85·sw, torso.x 0.45·sw |
| `tackle` (success) | 2.4·sw | rotation.z 1.4·sw, y −0.35·sw (scivolata decisa) |
| `tackle` (fail) | 1.5·sw | z 0.8·sw, yaw `sin(u·2π)·0.28` (sbilanciato) |
| `dribble_feint` | — | z `sin(u·3π)·0.35`, yaw `sin(u·2π)·0.28` (doppia oscillazione) |
| `dribble_inside/outside` | — | z ±0.5/0.42, yaw ±0.45/0.38 |
| `pass` | 0.5·sw | braccio aL −1.8·sw, yaw `sin(u·π)·0.32` |
| `build` | 0.3·sw | passaggio corto neutro, yaw `sin(u·π)·0.2` |

**Wind-up (Sprint B):** per shot/cross/penalty/freekick, mentre `u<0.22`: `_lR.x += (0.22−u)/0.22·0.7` (caricamento all'indietro additivo, auto-fade a u=0.22).
**Post-reazioni eroe:** `celebT` (esultanza 2.4s: salto + braccia su), `heroPostT` (`miss`=testa bassa 1.6s / `fist`=pugno al cielo).

**B7.3 Reazioni avversario `oppActType`** (durata `_OT`: gk_dive 0.90 · opp_tackle 0.85 · else 0.55):
- `gk_dive`: tuffo smoothstep verso `_diveToZ`, y `sin·1.15`, rotation.z `±_ext·1.7` (corpo orizzontale), braccia tese −2.7·_ext. Reach: `_saveReach=9` se esito parata, `6` se gol (cade corto).
- `opp_tackle` (scivolata): slide verso `_slideToX/Z`, y −0.30·sw, gambe distese.
- `opp_stumble` (inciampo), `opp_spin` (giravolta `rotation.y += aDt·(u<0.5?9:3)`), `opp_intercept` (si china + braccia tese).
- `_wallJumpT` (3 avversari saltano sulla punizione, y `sin·1.5`).

**B7.4 Portiere:** posa pronta sovrascritta ogni frame (gambe/braccia divaricate); apertura angolo in gioco aperto (F13, CAP away x∈[80,94], home x∈[6,20]); `gkSaveCelebT` (rialzata post-parata), `concededT` (disperazione gol subìto). GK morfologia scalata (alto/largo). GK pool 7 colori distinti dai kit.

**B7.5 GLB:** modello reale `footballer.glb` (CH38 Mixamo) per tutti i 22 + arbitro; clip `anim-idle/jog/kick/penalty/header/tackle/volley/gk-dive/gk-catch/gk-block.glb`; `actType`→clip con crossfade locomozione. Fallback automatico al procedurale se il GLB non carica (il quality gate gira GLB-OFF).

### B8 — Sistema camera

Camera unica `PerspectiveCamera(56)`. Blend continuo tra inquadratura **WIDE broadcast** e **CLOSE highlight** via `camHL` (target: result 1.0 · move/choose 0.82 · intro 0.55 · playing 0). Easing asimmetrico (zoom-in `dt·3.2`, zoom-out `dt·1.7`).
- **WALK**: alterna ogni 4.4s dolly ravvicinato e panoramica aerea.
- **WIDE**: posizione laterale `wPx≈−74+attacco·16 + ax·0.14 + drift sin`, segue il baricentro azione (`ax = ball·(0.6+0.30·bf) + hero·(...)`).
- **CLOSE**: `cPx≈fX−13`, `cPy≈8−bf·2.2`, segue eroe/palla; overrides per hlType: penalty/freekick (bassa dietro palla), header (diving bassa / post alta), cross (side-tracking per pattern), shot (chip alta, one-on-one bassa, volée alzata), dribble (tight bassa), pass (through arretrata+alta).
- **GK tracking**: su shot/penalty/header il lookAt si fonde 35% verso il portiere.
- **Result framing**: su tiro/rigore/testa/cross a esito, la camera inquadra porta+GK (`cPx=clamp(gx−32,…)`).
- **Replay**: camera alta laterale che segue la palla (dopo `resultT≥3.2 & repCount≥25`, `REPLAY_DUR=2.6s`, ring buffer 150 frame).
- **Sub-entry**: camera bassa vicino panchina/eroe.
- **Shake `shakePow`**: `+sin(now·24)·pow·0.7` su x e z, decadimento `·(1−dt·6)`. Valori: gol 0.55, in_net 0.20, in_net_high 0.15, hit_post 0.38.
- **Slow-motion (bullet-time):** sul risultato `actT/ballArc` rallentano `0.28 + 0.72·min(resultT/1.6,1)`.
- **Cut/stacco:** non c'è un simbolo `cutFx` nel 3D; gli stacchi sono il blend `camHL` + `cutFx` DOM (transizione nera 360/560ms) lato `LiveMatch`.

### B9 — Collisioni / fisica

- **Repulsione anti-ammucchiate (PASS 2):** bolla personale `_RB=6.5` unità; repulsione pairwise tra non-portieri; l'eroe respinge i compagni a senso unico (×1.2); offset finale `clamp(±5.5)` applicato **solo sul target del lerp** → puramente visivo, lo stato di gioco non cambia. Deterministico (no RNG).
- **Esclusività controllo mesh:** durante una reazione (`oppActType`), il mesh controllato è escluso dal loop off-ball (niente «parata scoordinata»). Ricevente passaggio (`passTargetMesh`/`_rcvT`) e corridori falliti (`_failRunT`) saltano il movimento off-ball. I portieri saltano la repulsione (loop separato). Il portatore avversario è «pinnato» alla palla durante gli HL difensivi (`_tackleCarrier`).
- **Hitbox/contatti:** non esiste un sistema di collisione fisica reale (capsule/raycast). I «contatti» sono **eventi scriptati**: il tackle è una reazione `oppActType`, l'intercetto è il difensore più vicino al punto-linea, la parata è il GK che raggiunge `ballArcTgtZ` entro `_saveReach`. La palla ha solo rotazione visiva derivata dal movimento (`rotation.z -= _bvx·_rotF`).
- **Push/body:** nessun ragdoll; i corpi non si compenetrano grazie alla repulsione, ma non c'è risposta d'urto.

### B10 — IA off-ball (render-loop `ThreeMatchView`)

Opera su target logici `_tg[]` (0–100), offset visivi sul lerp (stato intatto, deterministico). Passi:
- **PASS 1** (target per-giocatore): GK F13 (apertura angolo, CAP gate); shape-flow per reparto (`_lineShift`); **F2** shift possesso-aware (`±_posMag·0.6`, ATT/MID/DEF scalato); **pressing** dei più vicini alla palla (`((24−db)/24)·1.5·_pm`, mult superiorità numerica); **F3** target per ruolo su possesso+spazio (`_openAt` = distanza dall'avversario più vicino → smarcamenti verso lo spazio libero); micro-variazione deterministica per-giocatore.
- **Pre-azione (preActionT):** corse coordinate per pattern — CROSS/HEADER/CUTBACK (corse in area su canali distinti primo/secondo palo/dischetto), SHOT/ONE_ON_ONE (split verticale), COMBINATION/THROUGH/pass (corse verticali su canali + deviazione nello spazio libero); gli avversari stringono sull'eroe.
- **PASS 1b** marcatura goal-side (DEF inseguono il MID/ATT avversario più vicino, posizione goal-side).
- **PASS 1c (F10):** un difensore chiude la **linea di passaggio più pericolosa** (`mx=bGX·0.42+thX·0.58`).
- **PASS 1d (F11):** press + cover — il *secondo* difensore più vicino prende copertura (raddoppio goal-side, no doppio tuffo sulla palla) nell'ultimo terzo.
- **PASS 2:** repulsione (vedi B9).
- **Set-piece:** muro punizione (4 DEF compatti a ~9u verso il palo vicino), attaccanti per la respinta. **Tutti i passi sono sospesi/limitati sui set-piece.**

> ⚠️ Le posizioni off-ball **non** sono nella firma golden del gate → modificarle è gate-safe ma **non validato**; la resa va collaudata dal vivo.

### B11 — Sistema archi palla

`BALL_ARC_BY_TYPE` (per cronaca BG): `shot{h:2.8,dur:0.52} · cross{h:3.2,dur:0.68} · save{h:1.8,dur:0.55} · tackle{h:0.4,dur:0.35} · pass{h:0.9,dur:0.48}`.
Arco parabolico: `ball.y = 0.65 + sin(u·π)·h` (rest y=0.65). `fireConclusion` imposta h/dur/target per hlType; **la qualità `q` (decideExecution, seedata) plasma pace/precisione/altezza** (es. q alta → arco più teso/preciso). Target sempre verso +x (porta avversaria).

**Catene post-arco** (a `u≥1`): successo tiro/rigore/punizione/testa → `in_net` (o `in_net_high` per chip/volée); cross → `cross_goal`; pass → `assist_recv` → `assist_shot`/`cross_goal`; dribble/build con `rew==="goal"` → `in_net`; fallimento → `heroPostType="miss"` + `hit_post`(palo, → `post_rebound`) / `deflect`(parato/fuori/murato) / save. **Net bulge** (gonfiamento rete) su `in_net`, chiama `onGoalInNet` → `fireGoalCeleb`. **Guardia difensiva:** se `hlDef`, la palla è forzata in una zona sicura di rinvio (mai verso le porte).

### B12 — Sovraimpressioni / HUD / cronaca

**HUD (scoreboard):** blocchi casa/ospite (badge, nome, punteggio colorato per esito), centro (pallino live, clock pill, meteo, pausa), etichetta competizione, barra possesso (0–100, colori squadre), barra momentum, menu azioni (`filterSitActions`, success-rate colorato), griglia stat (gol/assist/energia/tiri/rating/zona/falli/corner/xG), pannello cronaca 📻 (ultimi 16 `coms`).

**Overlay (z-order crescente):**
| Overlay | Innesco | Resa |
|---|---|---|
| `floatGoal` | ogni esito | top 8%, fs22, `floatUp` 1.4s |
| `goalCinema` | gol/assist (via `fireGoalCeleb`) | «GOOOOL!»/«ASSIST!» fs52 + nome eroe («GOL — Nome» / «Assist di Nome»), `goalDrop` 2.6s + shake |
| `pressureCinema` | momentum ≥85 / ≤15 | «⚡ DOMINIO!» / «🔴 PRESSIONE!» |
| pressure border | momentum ≤25 / ≥75 | bordo animato rosso / colore-casa |
| `crowdChant` | eventi BG | bottom 8%, `chantPulse` 2.8s |
| `screenFlash` | gol (bianco)/miss/conceded (rosso) | flash a tutto schermo |
| `cutFx` | esito | transizione nera 360/560ms |
| result banner | `outcome` | overlay headline (`hlOverlay`) + ✅/❌ azione + narrazione `OUTCOME_TX` + commento AI |
| subEvent banner | cambio tattico | top 12% |
| bench overlay | `onBench` | watching→warmup→entering |
| ceremony | `ended` + titleStakes + vittoria | cerimonia trofeo 3D + banner |

**Sovraimpressioni dinamiche `hlOverlay`** (v5.51.0): ~90 messaggi in 16 categorie (`goal/assist/pass/cross/dribble/recovery/tackle/miss/miss_big/pass_fail/dribble_fail/def_fail/nothing/conceded/foul/save_hero`), scelti da `outKey`+tipo azione (5 regex su `actionLabel`), seedati per varietà. «GOL — Nome» solo su gol reale dell'eroe; assist ha overlay dedicato.

**Cronaca:** `addCom(txt,col,clock)` accoda alla lista `coms`; testi da `OUTCOME_TX` (esiti HL) e `BG_MATCH` (sfondo). Nessun audio/voce (gioco silenzioso); «commento» = testo HUD.

### B13 — Momentum

`momentum` 0–100 (50=equilibrio). Variazioni: azione HL ±10 (+streak·4, cap streak 5); rigore ±15/+20/−10; eventi BG (team_goal +25, opp_goal −25, shot +4, oppShot −4, opp_red +20, opp_injury +8); ordini allenatore (`mom` delta); deriva verso 50 (·0.08 ogni 8 tick); reset a metà tempo (`m+(50−m)·0.5+diff·5`). Soglie: ≥85→«DOMINIO», ≤15→«PRESSIONE»; ≤25/≥75→bordo pressione; estremi (≥80/≤20)→cronaca dedicata (12%). Effetti: densità BG (`_bgProb=0.18+|mom−50|/50·0.12`), auto-contestualizzazione cori, barra HUD.

### B14 — Crowd chants

`CROWD_CHANTS` (base IT, 15 chiavi: goal/near_miss/save/pressure/foul/home/half/danger/comeback/winning/losing/away_goal/urgenza/derby/boo) + `CROWD_CHANTS_LG` (per lega) + `CROWD_CHANTS_NAT` (per nazionale). `chantFor(type,dur=2800)` auto-contestualizza `home`→derby/winning/comeback e `losing`→`boo` (se away−home≥2 & momentum<25). Token `[CLUB]`. Innesco nel BG tick: goal 3800ms, danger 2400, near_miss 2000 (45%), foul 1800 (50%), half 2000 (45'), away_goal 2200 (grigio). Nessun audio: i cori sono **testo overlay**.

### B15 — BG_MATCH (cronaca di sfondo)

~170 voci. Shape: `{txt, ef, w, bpos:{x,y}, pd, poss?, ms?, ctx?, momThreshold?, minClock?, maxClock?, derbyOnly?}`.
- `txt` con token `{H}{H2}{A}{P}{DERBY}` (sostituiti da rosa). `ef ∈ {team_goal, opp_goal, opp_red, opp_injury, null}`. `w` peso 0.2–4. `bpos` target palla logico. `pd` preset direzione → `DRIFT_PRESETS` (drift formazione) + `BG_ARC_MAP` (tipo arco: attack_goal/attack→shot, wide_right→cross, opp_goal/defend_goal→save, retreat→tackle, midfield→pass).
- **Tick generazione** (300ms, sospeso in hl_*): densità `_bgProb` momentum-aware; filtro eligibilità (clock/derby/ctx/momThreshold + dedup ultimi 3 + esclusione `{P}` se in panchina); bias tattico ×1.8 sulle voci che matchano il drift attivo; `wPick` pesato. Effetti applicati: gol/cartellino/infortunio, possesso, ball/pPos, mxStats, swing momentum; colore commento via `ATE3_ARCCOL`, ritardo all'apice arco via `ATE3_ARCMS`.

### B16 — Set-piece positioning

In `hl_intro`/`hl_move` per situazioni `lockMovement`. Classificazione: `isPenalty` (text «RIGORE»), `isFlankFK` (y<22 o y>78), `isAreaPlay` (zona area), direct FK.
- **Difesa (away):** GK `{x:97,y:50}`; rigore → sgombra area; corner/flank → impacchetta area (array `bx/by` di 10 slot); **punizione diretta → muro di 4 a x:70** (`wx/wy`).
- **Attacco (home):** GK `{x:4,y:50}`; rigore → sgombra; flank → corridori in area + supporto largo; areaPlay → attaccanti che affollano l'area (clamp x≥82); direct FK → attaccanti in area + copertura a centrocampo.
- **Rigore GK dive:** `gkDiveRef` pre-calcolato da `[tl,tc,tr,bl,br,bc]` con pesi `[18,8,18,22,12,22]` (angoli favoriti), letto da `handleRigore` (parata se `dir===gkDir`).
Il muro/area è rispecchiato nel render-loop 3D (B10).

### B17 — Scheduling / trigger

- **`numHL`** (n. highlight, base 2): `+2/+1` per match weight ≥8/≥5; `+1/−1` per prestige avversario ≥78/≤40; `+1/−1` per form ≥82/<55; `−1` per fatigue >75; clamp `[2, trial?3:7]`; cap duro 8 con HL reattivi.
- **`hlTimes[i] = 8 + step·i + rng(0,…)`**, `step=floor(82/n)`. Chain → sentinella 9999.
- **Selezione situazione** (`selectContextualSituations`): campionamento pesato seedato senza rimpiazzo (seed = `season·1000+week·13+hashStr(opp)`). Pesi per `type`/`stat`/`scoreCtx`/`clockCtx`/`ctx`.
- **HL reattivi:** opp_goal → coda HL a `nx+rng(4,8)`; early-desperate (60', sotto di 1); desperate (72', sotto di ≥2).
- **Ordini allenatore:** clock 28/63/75/85 (`COACH_ORDERS`, 14 ordini con bonus/poss/mom/drift); coach shout ogni ≥6' (34%); sub event 65–70' (38%).
- **Chaining** (`CHAIN_SITS`): dopo assist riuscito su cross/corner/punizione (regex su text), inietta header/mischia/second_ball nella sequenza. Path leggero alternativo: 25% dopo qualunque successo → re-entra in hl_intro «⚡ CATENA!».
- **Eventi timeline (LMQP):** `cpmEmit` di `MatchStart · HighlightForced · ActionResolved · HighlightAdvance · HighlightTimeline` (bus osservabile per il gate).

### B18 — `succRate` & `decideExecution`

**`succRate(action, stats, playerX, oppPrestige=65, archetypeId)`** → intero 0–100:
```
sv   = stats[action.stat]||60
base = (sv/99)*0.52 + 0.09 + (action.bon||0)*0.006 + (playerX-50)/100*0.04
diffPenalty = max(0,(oppPrestige-55)/180)
arcBonus    = ARCHETYPE_STAT_BONUS[archetypeId]?.[action.stat] || 0
return round(clamp(base - diffPenalty + arcBonus, 0.05, 0.84) * 100)
```
Fattori: skill (52% su /99), +9% flat, difficoltà azione (`bon` 0.6%/pt), posizione campo (±4%), prestige avversario, bonus archetipo. **Cap 0.84**. (Il piede `foot` NON entra in `succRate`; agisce in `decideExecution` e in `fkPenalty`.)

**Modificatori in `handleAction`:** `rate = max(0.05, succRate/100 − defPenalty − weatherPenalty + momentumBonus − fatiguePenalty + tacticMod − fkPenalty)`; `ok = random() < clamp(rate/adapt + jitter±3%, 0.05, 0.84)`.
- `defPenalty` 0.15/0.08/0 per distanza difensore <25/<50.
- `weatherPenalty` da `weather.ef` (pass/tiro/spd).
- `momentumBonus` ±5% agli estremi; `fatiguePenalty` fino −10%; `fkPenalty` 0.45(gol)/0.18(assist) sulle punizioni.
- `adaptiveDifficulty` 0.85–1.35 (divisore: più difficile quando l'eroe rende — gpg/ovr/morale).

**`decideExecution(intent, ctx)`** (puro, seedato LCG) → `{intent, execution, outcome, quality}`. Per ogni intento: blend skill → `q=qOf(skill − pressure·9 − fatigue·0.16 + (morale−60)·0.12 + jitter)`; poi `wpick` su esecuzioni e su esiti granulari. **Piede debole (F8):** `weakFlank = side && foot && side!==foot` → riduce q e bias al taglio interno. Tabella esiti granulari per intento in §B6/report (es. shot: `goal q·3.4 / saved 1.4+(1−q)·1.6 / blocked pressure·1.3 / post 0.5+… / wide (1−q)·2.2+wind`). `calcXG` per le occasioni.

---

## C. Catalogo delle situazioni di gioco

> 50 situazioni canoniche, ciascuna con i 20 capitoli. I capitoli condivisi rimandano a §B (Animazione 3D→B7, Camera→B8, Collisioni→B9, IA→B10) e aggiungono le specificità. Le righe «Esempio sit.» citano un'istanza reale tra le 179.

---

### C-01 · ATTACK_SHOT_EDGE

**1. Identificativo** — ID `ATTACK_SHOT_EDGE` · Nome «Tiro dal limite» · Categoria ATTACK · Sottocategoria FINISHING/EDGE_SHOT.
**2. Descrizione** — Conclusione dalla trequarti/bordo area con palla al piede. Si attiva quando `intent==="shot"` e `zones[0]∈{bordo}` (o `trequarti` con azione di tiro). Variabili: `stats.tiro/tecnica`, `pPos.x`, `oppPrestige`, `momentum`, meteo. Stati precedenti: `progression`/`onetwo`/recupero che porta palla al limite. Esempio sit.: situazioni `["bordo"]` con azioni tiro (pattern `EDGE_SHOT`, 157 azioni).
**3. Zona** — X logico 72–84 (mondo +22..+34); Y 25–75 (corridoio centrale prevalente). Terzo offensivo. Limite area. Fuori area di rigore. Ring zona `bordo{x:26}`.
**4. Posizionamento tattico** — **Eroe**: al limite, orientato alla porta (+x). **Punta/seconda punta**: inserimenti verticali (F3 ATT canali 28/50/72). **Trequartista/ali**: larghi per scarico. **Mediani**: appoggio dietro (`supX=bGX−9`). **Difensori avversari**: schermo davanti area + GK sulla linea (away x∈[80,94]). Distanze: repulsione `_RB=6.5`.
**5. Stato palla** — `feet` (al piede/rasoterra); su esito diventa parabolica (arco h≈2.8–4.8).
**6. Tipo di giocata** — Tiro (controllo orientato → tiro). Possibili: tiro di potenza/piazzato/a giro.
**7. Compatibilità palla** — ☑ entrambe ma **prevalentemente palla a terra** (`feet`); il tiro al volo richiede `aerial` (→ C-06). Motivo: invariante CINE.
**8. Animazione 3D** — `actType="shot"`, variante per label (B7.2): `shot_power`(−2.8·sw, follow-through), `shot_curled`(yaw 0.45), `shot_chip`(back-hop). Durata `_T=0.55s`. Wind-up `u<0.22`. Blend: crossfade da locomozione. Root-motion lerp. Compatibili: celebT (gol), heroPostT miss. Incompatibili: header/volley (richiedono aerial).
**9. Trigger** — `intent==="shot"` da bordo. Probabilità esito via `succRate`(tiro) + modificatori. Skill `tiro/tecnica`; morale/stanchezza/momentum/meteo come §B18; piede forte/debole via decideExecution; minuto/risultato via scoreCtx (losing → off ×1.35).
**10. Decision Tree** — `IF intent=shot & zone=bordo → hlType=shot`; `SWITCH label`: /pallonett/→chip, /giro|piazzat/→curled, /prima|tap-in/→first_time, else power. `IF ok → arco in_net; ELSE → miss → deflect/hit_post`. Fallback: zona→shot.
**11. Possibili esiti** — Goal · Parata (`miss`→deflect/save) · Fuori (`wide`) · Palo (`post`→post_rebound) · Traversa (`post`) · Murato (`blocked`) · Corner · Respinta · Deviazione · `miss_easy` (occasione clamorosa).
**12. Cronaca** — `OUTCOME_TX.goal/miss/miss_easy`; overlay `hlOverlay` cat goal/miss/miss_big; HUD shots++, xG. Highlight: result framing porta+GK. Audio: nessuno.
**13. Hero Mode** — Eroe **protagonista** (riceve il controllo: hl_move + hl_choose). Mai spettatore.
**14. Telecamera** — CLOSE con override shot (chip alta / one-on-one bassa); GK tracking 35%; **result framing porta+GK**; bullet-time + shake 0.20 su in_net; replay se gol.
**15. Collisioni** — Nessun contatto fisico sul tiro; GK raggiunge `ballArcTgtZ` entro `_saveReach` (6 su gol, 9 su parata). Repulsione compagni/avversari attiva.
**16. IA** — Pre-azione SHOT/ONE_ON_ONE (split verticale attaccanti); avversari stringono sull'eroe; GK sulla linea durante HL.
**17. Errori logici potenziali** — Tiro «da distanza siderale» se le azioni-gol non filtrate (mitigato da `filterSitActions` distanza); arco palla deciso dalla qualità ma off-ball non validato dal gate; possibile incoerenza overlay/3D (overlay «palo» mentre 3D mostra parata, perché outKey `miss` è generico).
**18. Realismo** — **7/10**. Buona varietà di varianti tiro e camera; penalizza l'assenza di fisica reale e la genericità dell'esito `miss`.
**19. Priorità futura** — Criticità **Media**. Impatto: gameplay alto, telecronaca medio, immersione alto, animazioni alto, Hero alto.
**20. Matrice** — vedi §D riga C-01.

---

### C-02 · ATTACK_SHOT_ONE_ON_ONE

**1.** ID `ATTACK_SHOT_ONE_ON_ONE` · «Solo davanti al portiere» · ATTACK · FINISHING/ONE_ON_ONE.
**2.** Eroe in area, solo contro il portiere. Attiva: `intent==="shot"`, zona `area`, `cn.oneOnOne:true` (override `tactic.cn`). Variabili: `tiro/tecnica`, freddezza (mentalità). Stato precedente: imbucata/through riuscita, contropiede. Esempio sit. (riga ~1731): `"⚡ Solo davanti al portiere!"`, `["area"]`, azioni Tiro angolato/Piazzato basso/Pallonetto, `cn:{oneOnOne:true}`.
**3.** X 80–98 (mondo +30..+48), Y 25–75; area di rigore; terzo offensivo; corridoio centrale.
**4.** **Eroe** dentro l'area, faccia alla porta. **GK** esce a stringere l'angolo (F13 in gioco aperto; durante HL sulla linea). Difensori in recupero alle spalle. Compagni inserimento secondario.
**5.** `feet`.
**6.** Tiro (angolato/piazzato/pallonetto = chip).
**7.** ☑ palla a terra (`feet`).
**8.** `shot_one_on_one`(−2.4·sw, y 0.1) o `shot_chip` per pallonetto; `_T=0.55s`; camera bassa.
**9.** `cn.oneOnOne`. Probabilità alta (q·3.4 gol). Skill tiro; pressione bassa (solo); fkPenalty assente.
**10.** `IF cn.oneOnOne → variant=shot_one_on_one`; `IF label /pallonett|cucchiaio/ → shot_chip`. Esito wpick `goal q·3.4 / saved 1.4+(1−q)·1.6 / post / wide`.
**11.** Goal · Parata (GK in uscita) · Fuori · Palo · `miss_easy` (porta aperta sbagliata).
**12.** `OUTCOME_TX.goal/miss/miss_easy`; overlay goal/miss_big; crowd `near_miss`.
**13.** Eroe **protagonista**.
**14.** CLOSE bassa one-on-one; GK tracking; result framing; shake gol.
**15.** GK uscita/tuffo; nessun contatto.
**16.** Pre-azione: attaccanti split; GK pronto.
**17.** Possibile «murato dalla difesa» incoerente (avversario non in area in 1v1); pallonetto su GK fermo può sembrare irreale.
**18.** **8/10** — situazione iconica, alta spettacolarità, camera dedicata.
**19.** Criticità **Bassa** (funziona bene). Impatto gameplay/immersione alto.
**20.** §D C-02.

---

### C-03 · ATTACK_SHOT_POWER

**1.** ID `ATTACK_SHOT_POWER` · «Conclusione di potenza» · ATTACK · FINISHING/POWER (variante default).
**2.** Tiro potente da area/bordo, default quando nessuna variante specifica matcha. `hlVariant="shot_power"` (113 azioni, la più comune). Variabili: `tiro` dominante.
**3.** X 72–98; area o bordo; terzo offensivo; centrale.
**4.** Come C-01/C-02 secondo zona.
**5.** `feet`.
**6.** Tiro di potenza (bomba/stoccata/destro-sinistro forte).
**7.** ☑ palla a terra.
**8.** `shot_power`: gamba −2.8·sw, plant 0.7·sw, follow-through torso 0.25·sw, `_T=0.55s`, wind-up. Arco h 4.8 dur 0.85 (più alto/lungo).
**9.** Default shot. `succRate(tiro)`; `bon` spesso alto.
**10.** Fallback di tutti gli shot non-variant. Esito wpick shot.
**11.** Goal · Parata · Fuori · Palo/Traversa · Murato · Corner · `miss_easy`.
**12.** Come C-01.
**13.** Protagonista.
**14.** CLOSE shot; result framing; shake 0.20.
**15.** GK reach; repulsione.
**16.** Come C-01.
**17.** Tiro potente da posizione defilata può risultare poco credibile; arco alto (h 4.8) a volte sopra la traversa anche con q alta.
**18.** **7/10**.
**19.** Criticità **Media**. Impatto animazioni alto.
**20.** §D C-03.

---

### C-04 · ATTACK_SHOT_CURLED

**1.** ID `ATTACK_SHOT_CURLED` · «Tiro a giro» · ATTACK · FINISHING/CURLED.
**2.** Tiro a giro/piazzato verso l'angolo. `hlVariant="shot_curled"` (label /giro|piazzat|angolat/, 18 azioni).
**3.** X 72–95; bordo/area; spesso da posizione angolata (Y 15–35 o 65–85).
**4.** Eroe defilato che rientra sul piede forte; GK sul palo; difensori in chiusura.
**5.** `feet`.
**6.** Tiro a giro (effetto).
**7.** ☑ palla a terra.
**8.** `shot_curled`: gamba −2.6·sw, **yaw corpo `sin(u·π)·0.45`** (rotazione per l'effetto), torso.y 0.4·sw. Arco h 4.4 dur 0.78, Z curvata `−_side·(6+rand·5)`.
**9.** Label /giro|piazzat/. Skill `tecnica` rilevante (curled q da tiro·0.7+tecnica·0.3).
**10.** `IF label /giro|piazzat|angolat/ → shot_curled`. Esito shot wpick.
**11.** Goal (angolino) · Parata in tuffo · Fuori (troppo effetto) · Palo.
**12.** Come C-01; overlay «Non perdona!»/«Glaciale».
**13.** Protagonista.
**14.** CLOSE; la curva dell'arco è enfatizzata dalla Z curvata; result framing.
**15.** GK tuffo verso il palo lontano.
**16.** Come C-01; ali/punte attaccano i pali per la respinta.
**17.** L'effetto (yaw) è solo del corpo, la palla curva via Z target ma non con vera fisica Magnus → curva «a spezzata» possibile.
**18.** **7/10** — bella resa estetica.
**19.** Criticità **Bassa**.
**20.** §D C-04.

---

### C-05 · ATTACK_SHOT_CHIP

**1.** ID `ATTACK_SHOT_CHIP` · «Pallonetto / cucchiaio» · ATTACK · FINISHING/CHIP.
**2.** Scavetto sopra il portiere in uscita. `hlVariant="shot_chip"` (label /pallonett|cucchiaio|scavin/, 6 azioni). Tipico in one-on-one con GK avanzato.
**3.** X 80–96; area; centrale.
**4.** Eroe vicino area; **GK in uscita** (presupposto narrativo); difensori arretrati.
**5.** `feet`.
**6.** Pallonetto (lob/chip).
**7.** ☑ palla a terra → traiettoria lob alta.
**8.** `shot_chip`: gamba −1.6·sw (tocco morbido), **back-hop** y 0.38·sw, torso lean-back −0.35·sw. **Arco molto alto h 8.5 dur 1.10** (h NON scalato da q). Post-arc `in_net_high`.
**9.** Label /pallonett|cucchiaio/. `bon` spesso negativo (rischio). exec `shot_chip 0.6+(gkOut?2:0)`.
**10.** `IF label /pallonett|cucchiaio|scavin/ → shot_chip → arco h 8.5 → in_net_high`.
**11.** Goal (scavetto) · Parato (GK arretra) · Fuori alto · `miss_easy`.
**12.** Overlay goal «Capolavoro!»; crowd boato.
**13.** Protagonista.
**14.** CLOSE chip **alta** (override camera per chip); segue la parabola; in_net_high shake 0.15.
**15.** GK indietreggia; nessun contatto.
**16.** Come one-on-one.
**17.** Se il GK NON è realmente in uscita (durante HL sta sulla linea), il pallonetto su GK fermo è **incoerente** (esce dalla logica del cucchiaio). Arco h 8.5 fisso può sembrare esagerato.
**18.** **6/10** — alto rischio di incoerenza GK-fermo.
**19.** Criticità **Media** (coerenza GK). Impatto immersione medio.
**20.** §D C-05.

---

### C-06 · ATTACK_SHOT_VOLLEY

**1.** ID `ATTACK_SHOT_VOLLEY` · «Tiro al volo / rovesciata» · ATTACK · FINISHING/VOLLEY.
**2.** Conclusione al volo su palla aerea (cross/rimbalzo/sponda). `hlVariant="shot_volley"` (label /rovesciat|sforbiciat/ OR `ballState==="aerial"` & /al volo|volée/, 13 azioni). **Richiede `ballState==="aerial"`** (invariante CINE).
**3.** X 80–96; area; centrale; secondo palo possibile.
**4.** Eroe in area su palla alta; cross-provider sulla fascia; GK sulla linea; difensori a contrasto aereo.
**5.** **`aerial`** (palla alta/cross/rimbalzo).
**6.** Volée / rovesciata / semirovesciata.
**7.** ☑ **solo palla aerea**. Motivo: la volée con palla al piede è vietata dall'invariante CINE (FAIL gate).
**8.** `shot_volley`: **salto a forbice y 1.5·sw**, gamba −3.2·sw, plant −1.6·sw, torso.y 0.5·sw, `_T=0.55s`. Arco h 5.2 dur 0.66. GLB clip `volley`.
**9.** `ballState aerial` + label volo/rovesciata. Skill `tiro`; `bon` molto negativo (acrobatico).
**10.** `IF ballState=aerial & label /volo|rovesciat/ → shot_volley`. Altrimenti shot normale.
**11.** Goal (spettacolare) · Parata · Fuori · `miss_easy` (acrobazia sbagliata).
**12.** `postHighlightDuration` acrobatico 2700ms; overlay «Capolavoro!»; crowd delirio.
**13.** Protagonista.
**14.** CLOSE «volée raised»; bullet-time enfatizzato; replay probabile.
**15.** Contrasto aereo (nessun ragdoll); GK reach.
**16.** Cross-provider + inserimento; difensori a uomo in area.
**17.** Se la palla NON è realmente aerea al momento (timing arco) la forbice «a vuoto» è possibile; rovesciata con palla bassa = vietata (ok).
**18.** **8/10** — massima spettacolarità quando coerente.
**19.** Criticità **Bassa**. Impatto spettacolarità/Hero altissimo.
**20.** §D C-06.

---

### C-07 · ATTACK_SHOT_FIRST_TIME (TAP-IN)

**1.** ID `ATTACK_SHOT_FIRST_TIME` · «Tiro di prima / tap-in» · ATTACK · FINISHING/FIRST_TIME.
**2.** Conclusione di prima intenzione o ribadita sotto porta. `hlVariant="shot_first_time"` (label /prima|deviazion|istintiv|tap-in|controbalz/ o `cn.tapIn`, 29 azioni). Stati precedenti: respinta GK, mischia, rimbalzo.
**3.** X 84–98; area piccola; centrale.
**4.** Eroe sul secondo palo/dischetto; GK appena impegnato; difensori in recupero.
**5.** `feet` (o `aerial` se da cross — allora →C-11/12).
**6.** Tap-in / tiro di prima / deviazione ravvicinata.
**7.** ☑ entrambe (di prima sia su palla rasoterra sia bassa).
**8.** `shot_first_time`: gamba −2.0·sw, **niente wind-up** (istantaneo), torso 0.12·sw, `_T=0.55`. Arco basso h 3.2 dur 0.50 (rapido).
**9.** label/`cn.tapIn`. exec `shot_first_time 1.5+(pressure≥2?1.2:0)`. Alta % conversione (ravvicinato).
**10.** `IF label /prima|tap-in/ OR cn.tapIn → shot_first_time`.
**11.** Goal (tap-in) · Parata d'istinto · `miss_easy` (la sbaglia a porta vuota) · Murato.
**12.** Overlay goal/miss_big «Doveva solo spingerla dentro»; `postHighlightDuration` miss_easy 2400ms.
**13.** Protagonista.
**14.** CLOSE ravvicinata; shake; replay su gol.
**15.** Ravvicinato: GK già a terra; nessun contatto.
**16.** Inserimento al secondo palo (F3); compagni in mischia.
**17.** `miss_easy` a porta spalancata può apparire troppo frequente; sincronia con la respinta precedente non garantita (HL isolato).
**18.** **7/10**.
**19.** Criticità **Bassa**.
**20.** §D C-07.

---

### C-08 · ATTACK_DRIBBLE_SHOT (BALL CARRY → CONCLUSIONE)

**1.** ID `ATTACK_DRIBBLE_SHOT` · «Conduzione e tiro» · ATTACK · FINISHING/BALL_CARRY.
**2.** L'eroe conduce palla e conclude (pattern `BALL_CARRY`/`DRIBBLE_SHOT`). Regola 5.43.0: un `build` ball-carry con `rew==="goal"` è promosso a `shot`. Stati precedenti: progression/dribble.
**3.** X 60–95 (parte da trequarti, arriva al limite/area); centrale.
**4.** Eroe in conduzione; difensori che chiudono (press+cover F11); compagni in appoggio/inserimento.
**5.** `feet`.
**6.** Controllo orientato + conduzione + tiro.
**7.** ☑ palla a terra.
**8.** Locomozione (corsa con palla) → `actType="shot"`. Camera CLOSE che segue. Possibile timeline build-up (kind `carry`→`shot`) con beat interpolati prima della conclusione.
**9.** `rew==="goal"` + label carry. Skill velocità+tiro.
**10.** `IF hlType=build & isCarry & rew=goal → promote shot (BALL_CARRY)`. `buildHLTimeline` scripta i beat.
**11.** Goal · Parata · Fuori · Dispossessed (perde palla in conduzione) · Fallo subìto.
**12.** Cronaca progressiva (beat); overlay goal/dribble.
**13.** Protagonista.
**14.** CLOSE che segue la corsa; result framing alla conclusione.
**15.** Press+cover (F11): doppio difensore goal-side; possibile `opp_tackle` se fallisce.
**16.** F11 raddoppio; compagni inserimento; avversari stringono.
**17.** «Controllo e tiro da distanza siderale» se non filtrato; la conduzione è root-motion (può sembrare scivolata se velocità alta).
**18.** **7/10**.
**19.** Criticità **Media**.
**20.** §D C-08.

---

### C-09 · ATTACK_INSERTION_BOX

**1.** ID `ATTACK_INSERTION_BOX` · «Inserimento in area» · ATTACK · INSERTION.
**2.** Inserimento aereo in area su cross/corner/mischia. `intent==="insertion"` (zona area + keyword aeree o `tactic.box`). `ballState="aerial"`. 16 situazioni.
**3.** X 84–100; area di rigore; primo/secondo palo/dischetto.
**4.** **Eroe** attacca lo spazio in area (canale 8 primo palo / 9 dischetto / 10 secondo palo). Cross-provider sulla fascia. GK sulla linea. Difensori a uomo (`tactic.box.def`).
**5.** `aerial`.
**6.** Colpo di testa / volée / sponda / tap-in aereo.
**7.** ☑ solo palla aerea.
**8.** `header_*` o `shot_volley` secondo label. Salto y 2.2–2.5·sw. Pre-azione: **corse coordinate in area** (CROSS box runs B10).
**9.** `intent insertion` (aerial). Skill `fisico/posizionamento` (header), `tiro` (volée).
**10.** `IF zone=area & (aerial keywords|box) → insertion`; `deriveHL`: label testa→header, volo→volley.
**11.** Goal di testa/volo · Parata · Fuori · Murato · `miss_easy` · Corner.
**12.** Overlay goal/insertion; crowd.
**13.** Protagonista (riceve palla in area).
**14.** CLOSE header/volley; result framing.
**15.** Contrasto aereo a uomo; nessun ragdoll.
**16.** **Pre-azione CROSS box runs**: ATT su canali distinti, MID rimorchio al limite; difensori marcano goal-side.
**17.** Se il cross-provider non c'è (HL isolato) la palla «appare» aerea senza origine chiara; timing salto vs arco non sempre allineato.
**18.** **7/10**.
**19.** Criticità **Media**. Impatto immersione/animazioni alto.
**20.** §D C-09.

---

### C-10 · ATTACK_REBOUND_SECOND_BALL (MISCHIA)

**1.** ID `ATTACK_REBOUND_SECOND_BALL` · «Seconda palla / mischia» · ATTACK · FINISHING/REBOUND. (Situazione di **chaining**, `CHAIN_SITS`.)
**2.** Caos in area dopo respinta/cross: l'eroe ribadisce. Iniettata da `handleContinue` dopo un assist su cross/corner (regex). 3 varianti: `header` (secondo palo), `mischia` (caos `feet`), `second_ball` (rimbalzo `aerial`).
**3.** X 84–100; area piccola; centrale.
**4.** Eroe sul pallone vagante; mischia di corpi (nearby_def 2–3); GK fuori posizione.
**5.** `mischia`→`feet`; `second_ball`/`header`→`aerial`.
**6.** Spingila dentro / di prima / di testa / al volo.
**7.** ☑ entrambe secondo variante (mischia=terra, second_ball/header=aerea).
**8.** `shot_first_time`/`header_*`/`shot_volley`. Camera ravvicinata.
**9.** **Trigger di chaining** (non scheduling normale): `ok & rew==="assist"` su cross + 1 (non già pendente). `hlTimes` sentinella 9999.
**10.** `IF assist su cross → pick([CHAIN.header, .mischia, .second_ball]) → inject hl_intro «⚡ CATENA!»`.
**11.** Goal · Parata · Murato · `miss` · (raramente) recupero avversario.
**12.** Float «⚡ CATENA!»; overlay goal; crowd.
**13.** Protagonista.
**14.** CLOSE caotica; shake.
**15.** Mischia: molti corpi, repulsione fitta; nessun contatto reale.
**16.** Affollamento area (box runs); difensori a uomo.
**17.** **Non coperto dal gate** (il gate forza le situation, salta `handleContinue`/chaining) → a rischio; possibile doppia iniezione se la regola di pending fallisce.
**18.** **7/10** — aggiunge realismo «seconda palla».
**19.** Criticità **Media** (gate-cieco). Impatto immersione alto.
**20.** §D C-10.

---

### C-11 · ATTACK_HEADER_NEAR_POST

**1.** ID `ATTACK_HEADER_NEAR_POST` · «Incornata sul primo palo» · ATTACK · AERIAL/HEADER.
**2.** Colpo di testa sul primo palo su cross. `hlType="header"`, `hlVariant="header_near_post"` (default header, 25 azioni). `ballState="aerial"`.
**3.** X 84–96; primo palo (Y verso il lato del cross); area.
**4.** Eroe anticipa sul primo palo; cross dalla fascia; marcatore a contatto; GK sul palo.
**5.** `aerial`.
**6.** Colpo di testa (incornata/stacco).
**7.** ☑ **solo aerea** (header⟹aerial, FAIL gate altrimenti).
**8.** `header_near_post`: salto y 2.2·sw, `_hd.x` 0.7·sw, braccia −2.0·sw, `_T=0.75s`. Arco h 3.2 dur 0.65. GLB clip `header`.
**9.** label /testa|incornata|stacco/ + aerial. Skill `fisico·0.4+posizionamento·0.35+tiro·0.25`.
**10.** `IF label testa & aerial → header; variant default near_post`.
**11.** Goal di testa · Parata · Fuori · Murato.
**12.** Overlay goal/insertion; crowd.
**13.** Protagonista.
**14.** CLOSE header (post alta `cPy≥7,cLy=3.8`).
**15.** Stacco aereo a contatto col marcatore (no ragdoll).
**16.** Inserimento primo palo (canale 8); cross-provider.
**17.** Timing salto vs arrivo cross non sempre sincronizzato; marcatore può «attraversare» l'eroe (no collisione).
**18.** **7/10**.
**19.** Criticità **Media**.
**20.** §D C-11.

---

### C-12 · ATTACK_HEADER_FAR_POST

**1.** ID `ATTACK_HEADER_FAR_POST` · «Stacco sul secondo palo» · ATTACK · AERIAL/HEADER.
**2.** Testa sul secondo palo (cross profondo). `header_far_post` (label /secondo palo|palo lontano|profond/ o `cn.fpHeader`, 4 azioni).
**3.** X 84–96; secondo palo (Y lato opposto al cross); area.
**4.** Eroe arriva di rimessa sul secondo palo (smarcato); GK sul primo; cross teso/profondo.
**5.** `aerial`.
**6.** Colpo di testa in tuffo/stacco al secondo palo.
**7.** ☑ solo aerea.
**8.** `header_far_post`: salto y 2.5·sw (più alto), **yaw `sin(u·π)·0.4`** (gira verso il palo lontano). Arco cross `cross_far_post` h 4.2 dur 0.90, Z `−_side·(11+rand·7)`.
**9.** `cn.fpHeader` o label secondo palo.
**10.** `IF label /secondo palo|profond/ OR cn.fpHeader → header_far_post`.
**11.** Goal (palo lontano) · Parata · Fuori.
**12.** Overlay goal «Capolavoro»; crowd.
**13.** Protagonista.
**14.** CLOSE side-tracking (FAR_POST_CROSS camera).
**15.** Stacco isolato (smarcato); no contatto.
**16.** Corsa al secondo palo (canale 10).
**17.** Cross «al bacio» sul secondo palo dipende da q; con q bassa la palla cade al centro (smarcamento a vuoto).
**18.** **7/10**.
**19.** Criticità **Bassa**.
**20.** §D C-12.

---

### C-13 · ATTACK_HEADER_DIVING

**1.** ID `ATTACK_HEADER_DIVING` · «Tuffo di testa» · ATTACK · AERIAL/HEADER.
**2.** Colpo di testa in tuffo (palla bassa/in corsa). `header_diving` (label /tuffo|piombo|in corsa/, 1 azione — raro).
**3.** X 86–96; area; centrale ravvicinato.
**4.** Eroe si tuffa di testa; cross basso/teso; difensori e GK ravvicinati.
**5.** `aerial` (palla bassa ma di testa).
**6.** Tuffo di testa.
**7.** ☑ solo aerea.
**8.** `header_diving`: tuffo y 0.85·sw (basso), `_hd.x` 1.2·sw, **torso.x 0.45·sw** (corpo orizzontale), braccia −2.8·sw.
**9.** label /tuffo|piombo/. Raro.
**10.** `IF label /tuffo|piombo|in corsa/ → header_diving`.
**11.** Goal in tuffo · Parata ravvicinata · Murato.
**12.** Overlay goal; crowd delirio.
**13.** Protagonista.
**14.** CLOSE bassa diving (`cPy=3.2,cLy=0.8`).
**15.** Tuffo tra i corpi; no ragdoll.
**16.** Cross basso teso; inserimento ravvicinato.
**17.** Tuffo con palla non realmente bassa = incoerente; rarissimo (1 azione) → poco testato.
**18.** **6/10** (raro, poco rifinito).
**19.** Criticità **Bassa** (frequenza minima).
**20.** §D C-13.

---

### C-14 · WIDE_CROSS_NEAR_POST

**1.** ID `WIDE_CROSS_NEAR_POST` · «Cross sul primo palo» · WIDE · CROSS (default).
**2.** Traversone dalla fascia verso il primo palo. `hlType="cross"`, `hlVariant="cross_near_post"` (default, 24 azioni), pattern `NEAR_POST_CROSS`. `intent="cross"` (fascia/overlap lanes). Stati precedenti: progression sulla fascia, overlap.
**3.** X 62–88 (origine fascia), Y 3–28 (sinistra) o 72–97 (destra). Corridoio laterale. Fascia. Terzo offensivo.
**4.** **Eroe** sull'esterno (overlap_left/right). **Punte** attaccano i pali (canali 8/9/10). **Trequartista** al limite per la respinta. **Terzino** in sovrapposizione. **Difensori** marcano in area; GK sul primo palo.
**5.** `aerial` (cross⟹aerial).
**6.** Cross (teso/a rientrare).
**7.** ☑ palla aerea (il cross genera palla alta in area). Il «cross» parte dal piede ma **lo stato risultante è aerial** per gli inserimenti.
**8.** `actType="cross"`, `cross_near_post`: gamba −2.2·sw, yaw 0.55, `_T=0.65s`. Arco h 3.8 dur 0.85 verso primo palo. **Receiver retarget** (palla 60% verso miglior ricevente avanzato in area entro 24u).
**9.** `intent cross`. Skill `passaggio·0.55+tecnica·0.45`; **piede debole (F8)**: cross di piede debole sulla fascia opposta → q ridotta + bias taglio interno.
**10.** `IF zone=fascia|overlap → cross`; `SWITCH label`: /rientr/→cutback, /secondo palo/→far_post, /basso|teso/→low_driven, else near_post.
**11.** Assist (compagno segna) · Goal diretto (raro) · Intercettato · Murato · Corner · Fuori (cross lungo).
**12.** Overlay assist/cross «Cross perfetto»; su assist→**CHAIN** possibile (second ball); crowd.
**13.** Eroe **protagonista** del cross; il gol lo fa il compagno (eroe assist-man) → eroe **coinvolto indirettamente** nella fase di finalizzazione.
**14.** CLOSE side-tracking NEAR_POST; segue il cross.
**15.** Contrasto aereo in area sui riceventi; no ragdoll.
**16.** **Pre-azione CROSS box runs** (B10): ATT canali distinti, MID rimorchio; difensori goal-side.
**17.** «Assist, ma a chi?» se i riceventi mal posizionati (mitigato 5.49.24 box runs + receiver più avanzato); cross di piede debole può risultare innaturale.
**18.** **7/10**.
**19.** Criticità **Media**. Impatto immersione/animazioni alto.
**20.** §D C-14.

---

### C-15 · WIDE_CROSS_FAR_POST

**1.** ID `WIDE_CROSS_FAR_POST` · «Cross sul secondo palo» · WIDE · CROSS/FAR_POST.
**2.** Traversone profondo sul secondo palo. `cross_far_post` (label /secondo palo|palo lontano|profond/ o `cn.fpCross`, 6 azioni), pattern `FAR_POST_CROSS`.
**3.** X 62–88 fascia; arrivo Y lato opposto; area.
**4.** Eroe cross dalla fascia; punta che taglia sul secondo palo (canale 10); GK sul primo (battuto in profondità).
**5.** `aerial`.
**6.** Cross profondo lobbato.
**7.** ☑ aerea.
**8.** `cross_far_post`: gamba −2.2·sw, yaw 0.55. **Arco h 4.2 dur 0.90** (lungo/alto), Z `−_side·(11+rand·7)`. q plasma Z·(0.62+q·0.38) e durata.
**9.** `cn.fpCross` o label profond.
**10.** `IF label /secondo palo|profond/ OR cn.fpCross → cross_far_post (FAR_POST_CROSS)`.
**11.** Assist (testa/volo secondo palo) · Goal · Intercettato · Fuori · Corner.
**12.** Overlay assist «Grande visione»; CHAIN possibile.
**13.** Eroe assist-man (protagonista del cross).
**14.** CLOSE side-tracking FAR_POST.
**15.** Stacco al secondo palo; no contatto.
**16.** Corsa al secondo palo (canale 10), difensore goal-side.
**17.** Con q bassa il cross cade al centro → smarcamento al secondo palo a vuoto.
**18.** **7/10**.
**19.** Criticità **Bassa**.
**20.** §D C-15.

---

### C-16 · WIDE_CROSS_CUTBACK

**1.** ID `WIDE_CROSS_CUTBACK` · «Cross a rientrare / rasoterra dal fondo» · WIDE · CROSS/CUTBACK.
**2.** Palla rasoterra all'indietro dal fondo (cutback) verso il limite. `cross_cutback` (label /rientr|a rientrare/, 5 azioni), pattern `CUTBACK`.
**3.** X 78–95 (fondo), arrivo verso il dischetto/limite; area.
**4.** Eroe arriva sul fondo; ricevente al limite (rimorchio MID `bx−11`); GK coperto sul palo.
**5.** `aerial` per classificazione, ma **traiettoria bassa** (arco h 2.0 dur 0.70). Target `30+rand·7` (indietro verso il limite).
**6.** Cross a rientrare / cutback rasoterra.
**7.** ☑ classificato aerial ma giocata bassa (h 2.0). Coerenza: il cutback è semi-aereo/rasoterra.
**8.** `cross_cutback`: gamba −1.5·sw, **corpo girato yaw −0.85** (gioca all'indietro). Arco basso h 2.0.
**9.** label /rientr/. exec `cross_cutback 1+(x>78?2.5:0)`.
**10.** `IF label /rientr|a rientrare/ → cross_cutback (CUTBACK)`.
**11.** Assist (rimorchio al limite) · Goal · Intercettato · Murato.
**12.** Overlay assist «Suggerimento dalla fascia».
**13.** Eroe assist-man dal fondo.
**14.** CLOSE CUTBACK (guarda il ricevente al limite).
**15.** Ricevente al limite; no contatto.
**16.** MID rimorchio al limite (cutback/seconda palla).
**17.** Il cutback classificato `aerial` ma reso basso può confondere l'invariante (mitigato da h basso); il ricevente al limite dev'essere posizionato (F3 MID).
**18.** **7/10** — giocata realistica e apprezzata.
**19.** Criticità **Bassa**.
**20.** §D C-16.

---

### C-17 · WIDE_CROSS_LOW_DRIVEN

**1.** ID `WIDE_CROSS_LOW_DRIVEN` · «Cross teso rasoterra» · WIDE · CROSS/LOW_DRIVEN.
**2.** Traversone basso e teso in mezzo. `cross_low_driven` (label /basso|teso|raso/, 3 azioni).
**3.** X 62–88 fascia; arrivo Y centro area; area.
**4.** Eroe cross teso; attaccanti in scivolata/tap-in; difensori in chiusura bassa.
**5.** `aerial` (cross) ma traiettoria tesa h 2.2 dur 0.78.
**6.** Cross teso rasoterra / fendente.
**7.** ☑ aerea (bassa).
**8.** `cross_low_driven`: gamba −2.4·sw, yaw 0.35. Arco h 2.2 (teso), target `−13+rand·6`.
**9.** label /basso|teso|raso/. `wet?−0.6` (bagnato sfavorisce). 
**10.** `IF label /basso|teso|raso/ → cross_low_driven`.
**11.** Assist (tap-in) · Goal · Intercettato · Murato.
**12.** Overlay assist «Cross teso e velenoso».
**13.** Eroe assist-man.
**14.** CLOSE NEAR_POST-like.
**15.** Tap-in ravvicinato; no contatto.
**16.** Attaccanti sul primo palo per la deviazione.
**17.** Cross teso che attraversa l'area senza ricevente chiaro se box runs non allineati.
**18.** **7/10**.
**19.** Criticità **Bassa**.
**20.** §D C-17.

---

### C-18 · WIDE_SWITCH_PLAY

**1.** ID `WIDE_SWITCH_PLAY` · «Cambio gioco» · WIDE/MIDFIELD · SWITCH.
**2.** Ribaltamento del fronte / apertura sull'altra fascia. `intent="switch"` (label /cambio gioco|allarga|apri il gioco|ribalta/, 3 situazioni). Pattern `SWITCH` su pass.
**3.** X 38–72 (centro/trequarti), Y da un lato all'altro; corridoio largo.
**4.** Eroe in regia; compagno largo sull'altra fascia (ricevente); avversari scalano.
**5.** `feet`.
**6.** Lancione / passaggio lungo diagonale (apertura).
**7.** ☑ palla a terra/aerea bassa (lancio diagonale lobbato h 2.4).
**8.** `pass` SWITCH: passaggio diagonale lobbato; receiver largo `_wm` (compagno largo ma avanzato); `_aL.x=−1.8·sw`.
**9.** label switch keywords. Skill `passaggio·0.7+mentalità·0.3`.
**10.** `IF label /cambio|allarga|ribalt/ → intent switch → pass SWITCH`.
**11.** Assist (apertura per il taglio) · Chance creata · Intercettato · Overhit (lungo).
**12.** Overlay pass «Verticalizzazione/apertura».
**13.** Eroe protagonista (regista).
**14.** CLOSE pass (arretrata + alta per vedere il fronte).
**15.** Ricevente largo; no contatto.
**16.** Compagno largo avanzato (`_scw` largo+alto x); avversari scalano.
**17.** Solo 3 situazioni → poco rappresentato; il «cambio gioco» con palla bassa può non rendere l'idea della distanza.
**18.** **6/10** (sottorappresentato).
**19.** Criticità **Bassa**.
**20.** §D C-18.

---

### C-19 · MIDFIELD_BUILDUP

**1.** ID `MIDFIELD_BUILDUP` · «Costruzione dal basso» · MIDFIELD · BUILDUP.
**2.** Gioco di costruzione a centrocampo. `hlType="build"` (pattern `BUILDUP`, 43 azioni), `intent="progression"`/`onetwo`. Stati precedenti: recupero, retropassaggio, rimessa GK.
**3.** X 38–72 (centro/trequarti); corridoio centrale; terzo centrale.
**4.** Eroe in regia; mediani in appoggio (triangolo); difensori che alzano la linea (DEF `bGX−26`); avversari in pressing/schermo.
**5.** `feet`.
**6.** Passaggio corto / scarico / controllo orientato.
**7.** ☑ palla a terra.
**8.** `build`: passaggio corto neutro, `_aL.x=−0.9·sw`, yaw 0.2, `_T=0.55`. Arco basso h 0.9 dur 0.38.
**9.** default (no keyword forte). Skill `tecnica·0.5+mentalità·0.5`.
**10.** Fallback `deriveHL`: zona centro/no keyword → `build` (BUILDUP). Esito wpick `retain q·3 / lost (1−q)·2 / progress q·1.5`.
**11.** Avanzamento (progress) · Mantenimento (retain) · Palla persa (lost) · Intercettato.
**12.** Cronaca BG di costruzione; overlay pass «Costruzione dell'azione».
**13.** Eroe protagonista (regia).
**14.** WIDE/CLOSE pass COMBINATION.
**15.** Pressing avversario (F2/press); no contatto.
**16.** Appoggi a triangolo (F3 MID); avversari pressano i più vicini.
**17.** Poco «highlight» (azione di servizio); rischio ripetitività; può sembrare statico.
**18.** **6/10** (funzionale, poco spettacolare).
**19.** Criticità **Bassa**. Impatto ritmo medio.
**20.** §D C-19.

---

### C-20 · MIDFIELD_PROGRESSION_CARRY

**1.** ID `MIDFIELD_PROGRESSION_CARRY` · «Conduzione in avanti» · MIDFIELD · PROGRESSION.
**2.** L'eroe avanza palla al piede dal centrocampo. `intent="progression"` (24 situazioni; keyword avanza/conduzione/riparti/contropiede).
**3.** X 38–72→avanti; centrale; terzo centrale→offensivo.
**4.** Eroe in conduzione; punte che allungano (F3 ATT corsa profonda); difensori che arretrano (`ownGoalX+18`).
**5.** `feet`.
**6.** Conduzione / controllo orientato / progressione.
**7.** ☑ palla a terra.
**8.** Locomozione (corsa con palla, `_glbDriven`/run cycle). exec `carry_drive 2+velocità·0.03 / burst / cut_inside`.
**9.** keyword progression. Skill `velocità·0.5+fisico·0.25+dribbling·0.25`.
**10.** `IF zone centro/trequarti OR keyword avanza/contropiede → progression`. Esito `advance q·3.4 / win_freekick / stopped / lost`.
**11.** Avanzamento · Punizione conquistata · Fermato · Palla persa.
**12.** Overlay progression/dribble; cronaca BG.
**13.** Eroe protagonista.
**14.** CLOSE che segue la corsa.
**15.** Pressing/contrasto possibile (opp_tackle se lost); no ragdoll.
**16.** Punte allungano; difensori arretrano compatti.
**17.** Conduzione root-motion può «scivolare»; se velocità alta sembra pattinare.
**18.** **6/10**.
**19.** Criticità **Media**. Impatto ritmo/transizioni alto.
**20.** §D C-20.

---

### C-21 · MIDFIELD_THROUGH_BALL

**1.** ID `MIDFIELD_THROUGH_BALL` · «Imbucata / filtrante» · MIDFIELD · THROUGH_BALL.
**2.** Passaggio filtrante in profondità per il taglio. `intent="through"` (12 sit.; keyword filtrante/imbucata/verticale/profondità/lancio), pattern `THROUGH_BALL`.
**3.** X 50–80 (origine), arrivo in profondità (area); corridoio `through_ball_lane`.
**4.** Eroe rifinitore; punta in profondità (taglio); difesa che tiene la linea (fuorigioco).
**5.** `feet`.
**6.** Passaggio filtrante / lancio in profondità.
**7.** ☑ palla a terra (filtrante rasoterra) o aerea bassa (lancio).
**8.** `pass` THROUGH: scatto del ricevente + palla giocata sulla corsa (`_ptX+12·(0.65+q·0.6)`, q plasma profondità+pace). Convergenza palla↔ricevente.
**9.** keyword through + lane. Skill `passaggio·0.7+mentalità·0.3`.
**10.** `IF label /filtrant|imbucat|profond/ → pass THROUGH_BALL`. Esito `assist q·3.4 / chance / intercepted / offside 0.8+0.8 / overhit`.
**11.** Assist · Chance · Intercettato · **Fuorigioco** (offside) · Overhit (lungo).
**12.** Overlay assist/pass «Palla filtrante»; CHAIN no (non da cross).
**13.** Eroe protagonista (assist-man).
**14.** CLOSE pass THROUGH (arretrata + alta per vedere il taglio).
**15.** Linea difensiva (fuorigioco logico); ricevente scatta.
**16.** Compagno verticale (corsa F3); difesa tiene la linea.
**17.** Fuorigioco solo come outcome probabilistico (no linea reale tracciata) → può sembrare arbitrario; sincronia scatto-palla dipende da q.
**18.** **7/10** — giocata chiave ben modellata (convergenza palla-corsa).
**19.** Criticità **Media**. Impatto Hero/immersione alto.
**20.** §D C-21.

---

### C-22 · MIDFIELD_ONE_TWO

**1.** ID `MIDFIELD_ONE_TWO` · «Uno-due / dai e vai» · MIDFIELD · COMBINATION.
**2.** Combinazione stretta con un compagno. `intent="onetwo"` (11 sit.; keyword uno-due/dai e vai/triangolo/scarico), pattern `COMBINATION`.
**3.** X 50–80; centrale; trequarti.
**4.** Eroe + compagno d'appoggio (muro); avversari pressano.
**5.** `feet`.
**6.** Passaggio corto + scatto (give-and-go) / scarico.
**7.** ☑ palla a terra.
**8.** `pass` COMBINATION: `give_and_go`/`wall_pass`; ricevente che restituisce e l'eroe scatta.
**9.** keyword onetwo. Skill passaggio.
**10.** `IF label /uno-?due|dai e vai|triangol|scarico/ → onetwo (COMBINATION)`. Esito assist/chance/intercepted.
**11.** Assist · Chance · Intercettato · Palla persa.
**12.** Overlay pass/assist «Scambio perfetto».
**13.** Eroe protagonista (parte e riceve).
**14.** CLOSE pass COMBINATION.
**15.** Pressing; ricevente d'appoggio.
**16.** Compagno muro (appoggio); F3.
**17.** Il «ritorno» del compagno (give-and-go) è scriptato (passTargetMesh/_rcvT); se il compagno è mal posizionato il dai-e-vai non si legge.
**18.** **7/10**.
**19.** Criticità **Bassa**.
**20.** §D C-22.

---

### C-23 · COUNTER_ATTACK_TRANSITION

**1.** ID `COUNTER_ATTACK_TRANSITION` · «Contropiede» · TRANSITION · COUNTER_ATTACK.
**2.** Ripartenza veloce dopo recupero. Non è un `intent` dedicato: emerge da `progression`/`through` con keyword «contropiede/riparti» e dal **drift `attack`/`attack_goal`** + HL reattivi. Stati precedenti: `recovery`/`intercept` riusciti, gol subìto (reattivo).
**3.** X da propria metà → area avversaria; centrale; tutti i terzi (transizione).
**4.** Eroe lancia/conduce in transizione; punte in campo aperto; difensori avversari in inferiorità (rientro).
**5.** `feet`.
**6.** Conduzione veloce + imbucata + conclusione (catena progression→through→shot).
**7.** ☑ palla a terra.
**8.** Locomozione veloce (burst) + pass/shot; camera che segue il ribaltamento; possibile timeline build-up.
**9.** Recupero riuscito o gol subìto (HL reattivo `nx+rng(4,8)`); drift `attack`. Momentum alto favorisce.
**10.** `IF recovery/intercept ok → drift attack → next HL progression`; `IF opp_goal → reactive HL`.
**11.** Goal in contropiede · Assist · Chance · Palla persa · Fallo tattico subìto.
**12.** Cronaca «riparte in contropiede»; overlay; crowd urgenza.
**13.** Eroe protagonista.
**14.** WIDE→CLOSE che segue la transizione (attack-zoom).
**15.** Difensori in recupero (press+cover F11) in inferiorità.
**16.** Drift formazione `attack`; difesa avversaria arretra/rientra; superiorità numerica favorisce pressing.
**17.** Non c'è una vera «fase transizione» nello state-machine (è composizione di HL) → il contropiede può spezzarsi tra HL isolati; la superiorità numerica non sempre rappresentata.
**18.** **6/10** (manca continuità transizione).
**19.** Criticità **Media**. Impatto ritmo/spettacolarità alto.
**20.** §D C-23.

---

### C-24 · DRIBBLE_FEINT

**1.** ID `DRIBBLE_FEINT` · «Finta / salto dell'uomo» · ATTACK · DRIBBLE (default).
**2.** Dribbling con finta. `hlType="dribble"`, `hlVariant="dribble_feint"` (default, 35 azioni). `intent="dribble"` (richiede `nearby_def!==0`, altrimenti azioni dribble filtrate).
**3.** X 55–90; trequarti/area; qualsiasi corridoio.
**4.** Eroe contro 1 avversario; compagni in appoggio/inserimento; spazio alle spalle del difensore.
**5.** `feet`.
**6.** Dribbling (finta/elastico/tunnel).
**7.** ☑ palla a terra.
**8.** `dribble_feint`: **doppia oscillazione** z `sin(u·3π)·0.35`, yaw `sin(u·2π)·0.28`. Avversario reazione `opp_stumble` (successo) o controlla (fail).
**9.** `nearby_def!==0` + intent dribble. Skill `dribbling·0.6+velocità·0.25+tecnica·0.15`.
**10.** `IF stat=dribbling & !tiro OR keyword dribbl → dribble; variant default feint`. Esito `beat_man q·3.6 / fouled / dispossessed / shielded_out`.
**11.** Salta l'uomo (beat_man) · Fallo subìto (fouled) · Palla persa (dispossessed) · Palla protetta in out (shielded_out).
**12.** Overlay dribble «Salta l'uomo!»/dribble_fail; crowd «ooh».
**13.** Eroe protagonista.
**14.** CLOSE tight bassa dribble (`cPy=4.6`).
**15.** Avversario reagisce (`opp_stumble`/`opp_spin`); su fail `opp_tackle`; no ragdoll.
**16.** Avversario stringe (pre-azione); compagni inserimento.
**17.** Se `nearby_def` non garantito il dribbling «a vuoto»; l'avversario può «attraversare» l'eroe (no collisione).
**18.** **7/10**.
**19.** Criticità **Media**. Impatto Hero/spettacolarità alto.
**20.** §D C-24.

---

### C-25 · DRIBBLE_INSIDE

**1.** ID `DRIBBLE_INSIDE` · «Rientro sul piede forte» · ATTACK · DRIBBLE/INSIDE.
**2.** Dribbling con taglio interno. `dribble_inside` (label /rientr|interno/, 3 azioni). Tipico dell'ala che rientra.
**3.** X 60–88, da fascia verso il centro; trequarti/area.
**4.** Eroe sull'esterno che rientra; difensore esterno; spazio interno per il tiro.
**5.** `feet`.
**6.** Dribbling in rientro (taglio interno).
**7.** ☑ palla a terra.
**8.** `dribble_inside`: z `sin(u·3π)·0.5`, **yaw 0.45** (gira verso il centro), `_lR.x=sin(u·2π)·0.8`.
**9.** label /rientr|interno/. F8: bias al taglio interno col piede debole sulla fascia opposta.
**10.** `IF label /rientr|interno/ → dribble_inside`.
**11.** Salta l'uomo (e tira) · Fallo · Palla persa.
**12.** Overlay dribble «Numero di classe».
**13.** Eroe protagonista.
**14.** CLOSE tight.
**15.** Avversario esterno reagisce.
**16.** Difensore stringe; spazio interno.
**17.** Solo 3 azioni; il taglio interno verso il tiro non sempre concatenato a una conclusione.
**18.** **6/10** (sottorappresentato).
**19.** Criticità **Bassa**.
**20.** §D C-25.

---

### C-26 · DRIBBLE_OUTSIDE

**1.** ID `DRIBBLE_OUTSIDE` · «Sterzata esterna» · ATTACK · DRIBBLE/OUTSIDE.
**2.** Dribbling con uscita esterna. `dribble_outside` (label /sterzat|esterno/, 3 azioni). Per andare sul fondo.
**3.** X 60–90 verso il fondo/fascia; trequarti.
**4.** Eroe punta e va sul fondo; difensore interno; spazio esterno per il cross.
**5.** `feet`.
**6.** Dribbling in uscita esterna (poi cross/fondo).
**7.** ☑ palla a terra.
**8.** `dribble_outside`: z `sin(u·3π)·(−0.42)`, **yaw −0.38** (gira fuori), `_lL.x=sin(u·2π)·0.7`.
**9.** label /sterzat|esterno/.
**10.** `IF label /sterzat|esterno/ → dribble_outside`.
**11.** Salta l'uomo (e crossa) · Fallo · Palla persa in out.
**12.** Overlay dribble «Accelerazione irresistibile».
**13.** Eroe protagonista.
**14.** CLOSE tight.
**15.** Difensore interno reagisce.
**16.** Spazio esterno; punte in area per il cross successivo.
**17.** Solo 3 azioni; l'uscita esterna raramente concatenata al cross effettivo.
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-26.

---

### C-27 · DEFENSE_TACKLE_SLIDE

**1.** ID `DEFENSE_TACKLE_SLIDE` · «Contrasto in scivolata» · DEFENSE · TACKLE.
**2.** L'eroe contrasta l'avversario che porta palla. `sit.type==="def"`, `intent="recover"`, `hlType="tackle"` (74 azioni), pattern `TACKLE`. Attiva quando l'avversario punta la porta e l'eroe è l'ultimo ostacolo. `rew="recovery"`, `fail="foul"`/`through`.
**3.** X 20–55 (propria metà/centro); qualsiasi corridoio; terzo difensivo/centrale.
**4.** **Eroe** in contrasto; **portatore avversario** (`_tackleCarrier` pinnato alla palla); compagni in copertura; difesa goal-side.
**5.** `feet`.
**6.** Scivolata / contrasto / intercetto di piede.
**7.** ☑ palla a terra.
**8.** `tackle` success: rotation.z 1.4·sw, y −0.35·sw, gamba 2.4·sw (scivolata decisa); fail: z 0.8·sw, yaw `sin(u·2π)·0.28` (sbilanciato). `_T=0.6s`. Arco palla basso (recupero).
**9.** `sit.type=def`. Skill `fisico/tecnica/velocità`. **Auto-tackle timeout** se l'utente non sceglie (delay 9000/6000/4000ms per distanza difensore).
**10.** `IF type=def → tackle`; `IF ok → recovery (palla recuperata); ELSE → foul (ammonizione) / through (saltato)`.
**11.** Contrasto vinto (recovery) · Fallo (foul→ammonizione) · Saltato (through) · Deviato in out.
**12.** Overlay tackle/def_fail «Contrasto vinto!»/«Superato»; `OUTCOME_TX.recovery/foul/through`.
**13.** Eroe protagonista (difende).
**14.** CLOSE tackle (`cPy=4.0−bf`).
**15.** Reazione avversario `opp_stumble`/`opp_tackle`; il portatore è pinnato; no ragdoll.
**16.** Marcatura goal-side (PASS 1b); copertura compagni; press+cover (F11).
**17.** «La palla respinta fino alla porta avversaria» (storica incongruenza, mitigata da guardia difensiva `hlDef` che forza rinvio in zona sicura); l'avversario può attraversare l'eroe.
**18.** **7/10** (dopo fix guardia difensiva).
**19.** Criticità **Media**. Impatto immersione/animazioni alto.
**20.** §D C-27.

---

### C-28 · DEFENSE_INTERCEPT

**1.** ID `DEFENSE_INTERCEPT` · «Intercetto» · DEFENSE · INTERCEPT.
**2.** L'eroe legge e intercetta un passaggio avversario. `sit.type="def"` + keyword /intercett/ → `intent="intercept"` (2 sit.). `rew="recovery"`.
**3.** X 20–55; corridoio di passaggio avversario; terzo difensivo/centrale.
**4.** Eroe sulla linea di passaggio; avversario passatore + ricevente; copertura.
**5.** `feet` (palla rasoterra in transito).
**6.** Intercetto di piede / lettura.
**7.** ☑ palla a terra (passaggio in transito).
**8.** `tackle`/`opp_intercept`-style: l'eroe si china + tende (intercetto). Arco palla deviato.
**9.** keyword intercett. Skill `posizionamento·0.55+mentalità·0.25+velocità·0.2`.
**10.** `IF type=def & /intercett/ → intercept`. Esito `ball_won q·3.6 / foul / missed / deflected_out`.
**11.** Intercetto riuscito (recovery) · Mancato (missed) · Fallo · Deviato in out.
**12.** Overlay recovery «Intercetto perfetto»; possession+1.
**13.** Eroe protagonista.
**14.** CLOSE tackle/intercept.
**15.** Lettura linea passaggio (F10); no contatto col passatore.
**16.** F10 (chiude la linea di passaggio più pericolosa); copertura.
**17.** Solo 2 situazioni; «intercetto a centrocampo poco fluido, sembra si tuffi» (storica nota — lo slide non sempre vicino alla palla).
**18.** **6/10**.
**19.** Criticità **Media** (fluidità intercetto). Impatto immersione medio.
**20.** §D C-28.

---

### C-29 · DEFENSE_ANTICIPATE

**1.** ID `DEFENSE_ANTICIPATE` · «Anticipo» · DEFENSE · ANTICIPATE.
**2.** L'eroe anticipa l'attaccante sul tempo. `sit.type="def"` + keyword /anticip/ → `intent="anticipate"` (2 sit.). `rew="recovery"`.
**3.** X 20–55; davanti all'attaccante; terzo difensivo/centrale.
**4.** Eroe anticipa; attaccante che aspetta palla; copertura.
**5.** `feet`/`aerial` (anticipo aereo possibile).
**6.** Anticipo (di testa o di piede) / lettura tempo.
**7.** ☑ entrambe (anticipo aereo se palla alta).
**8.** `tackle`/`header` secondo ballState; step-in. exec `step_in 2+posizionamento·0.03`.
**9.** keyword anticip. Skill posizionamento.
**10.** `IF type=def & /anticip/ → anticipate`. Esito ball_won/foul/missed.
**11.** Anticipo riuscito (recovery) · Fallo · Mancato.
**12.** Overlay recovery «Letta alla perfezione».
**13.** Eroe protagonista.
**14.** CLOSE.
**15.** Anticipo sul tempo (no contatto se pulito).
**16.** Marcatura goal-side; lettura.
**17.** Solo 2 situazioni; differenza visiva tra anticipo/intercetto/recover poco marcata (stessa animazione tackle).
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-29.

---

### C-30 · DEFENSE_RECOVER_GENERIC

**1.** ID `DEFENSE_RECOVER_GENERIC` · «Recupero difensivo» · DEFENSE · RECOVER.
**2.** Recupero palla generico (rincorsa, pressione, chiusura). `sit.type="def"` default → `intent="recover"` (22 sit., il grosso della difesa). `rew="recovery"`, `fail="through"`.
**3.** X 5–55; tutta la metà campo difensiva; terzo difensivo/centrale.
**4.** Eroe in chiusura/rincorsa; avversario in possesso; reparto compatto (`ownGoalX+dir·18`).
**5.** `feet`.
**6.** Contrasto / scivolata / chiusura / pressing / copertura.
**7.** ☑ palla a terra.
**8.** `tackle` (default def). Slide/step. Locomozione di rincorsa.
**9.** default def. Skill `fisico` (peso nei pesi di selezione def: 13/9/6 per fisico).
**10.** `IF type=def & no anticip/intercett → recover`. Esito ball_won/foul/missed/deflected_out.
**11.** Recupero (recovery) · Saltato (through) · Fallo · Deviato in out.
**12.** Overlay recovery/tackle/def_fail «Chiusura impeccabile»/«Superato dall'avversario».
**13.** Eroe protagonista.
**14.** CLOSE tackle.
**15.** Contrasto/chiusura; reazione avversario.
**16.** Reparto compatto (F2 retreat), pressing dei più vicini, copertura (F11).
**17.** Animazione tackle generica per tutti i recuperi → poca varietà; «scivola ma nemmeno vicino al pallone» (fluidità).
**18.** **6/10**.
**19.** Criticità **Media** (varietà/fluidità). Impatto immersione medio.
**20.** §D C-30.

---

### C-31 · DEFENSE_BLOCK_SHOT (MURO IN AREA)

**1.** ID `DEFENSE_BLOCK_SHOT` · «Muro sul tiro / blocco in area» · DEFENSE · GOALKEEPER-ADJACENT/BLOCK.
**2.** L'eroe si oppone a un tiro avversario in area (blocco di corpo/piede sulla linea). `sit.type="def"`, zone `["propria"]`/`["propria","difesa"]`, `rew="save"`, `fail="goal_against"` (~11 sit., 33 azioni save). Stati precedenti: cross/tiro avversario imminente.
**3.** X 5–25 (propria area); centrale; terzo difensivo; area propria.
**4.** **Eroe** sulla traiettoria del tiro; tiratore avversario; portiere proprio (NPC) alle spalle; difensori in copertura (nearby_def 2).
**5.** `feet` (blocco rasoterra) o `aerial` (deviazione alta).
**6.** Blocco di corpo / deviazione di piede / chiusura sul tiro.
**7.** ☑ entrambe.
**8.** `tackle`/blocco; corpo sulla traiettoria. Arco palla deviato (deflect) in zona sicura.
**9.** `rew=save`. Skill `fisico`. «Il tiro è in arrivo, buttati sulla traiettoria».
**10.** `IF rew=save → blocco; IF ok → save (palla respinta); ELSE → goal_against (gol subìto)`.
**11.** Blocco/parata (save) · **Gol subìto** (goal_against) · Deviazione in corner · Murato.
**12.** Overlay save_hero «Murato dalla difesa»/conceded «Disastro difensivo»; `OUTCOME_TX.save/goal_against`; screenFlash rosso su goal_against.
**13.** Eroe protagonista (difende la porta, NON è il portiere).
**14.** CLOSE difensiva; su goal_against framing porta propria.
**15.** Corpo sulla traiettoria; deviazione palla; no ragdoll.
**16.** Copertura difensiva; il portiere proprio resta in porta (NPC).
**17.** L'eroe outfield che «para» col corpo è un'astrazione (rew=save); il portiere proprio non interagisce; possibile sovrapposizione di ruoli.
**18.** **6/10** (astrazione del ruolo).
**19.** Criticità **Media**. Impatto immersione medio.
**20.** §D C-31.

---

### C-32 · DEFENSE_AERIAL_CLEARANCE

**1.** ID `DEFENSE_AERIAL_CLEARANCE` · «Respinta aerea / spazzata di testa» · DEFENSE · AERIAL.
**2.** L'eroe respinge di testa un cross/pallone alto in area propria. `sit.type="def"` con `ballState="aerial"`, `rew="save"`/`recovery`.
**3.** X 5–30 (propria area); centrale; area propria.
**4.** Eroe stacca per spazzare; attaccante avversario in marcatura; cross dalla fascia avversaria.
**5.** `aerial`.
**6.** Colpo di testa difensivo / spazzata aerea.
**7.** ☑ solo aerea.
**8.** `header` difensivo (salto, spazzata); arco palla allontanato in zona sicura.
**9.** `ballState aerial` + def. Skill `fisico/posizionamento`.
**10.** `IF type=def & aerial → header difensivo`. Esito save/recovery o goal_against (anticipato dall'attaccante).
**11.** Spazzata (save/recovery) · Gol subìto di testa (goal_against) · Deviazione in corner.
**12.** Overlay save_hero/recovery «Spazza via il pericolo».
**13.** Eroe protagonista.
**14.** CLOSE header difensivo.
**15.** Stacco aereo a contrasto col marcatore.
**16.** Marcatura in area; difesa goal-side.
**17.** Rara; l'attaccante avversario può «vincere» lo stacco senza animazione di contrasto chiara.
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-32.

---

### C-33 · DEFENSE_LAST_MAN_COVER

**1.** ID `DEFENSE_LAST_MAN_COVER` · «Ultimo uomo / copertura» · DEFENSE · COVER (IA F10/F11).
**2.** Non è un HL interattivo dell'eroe ma un **comportamento IA strutturale**: nell'ultimo terzo un secondo difensore copre (press+cover F11) e un altro chiude la linea (F10). Si attiva quando il portatore (avversario o eroe) è nell'ultimo terzo.
**3.** X >66 (home) / <34 (away); area/bordo; corridoio centrale.
**4.** **Difensore 1** pressa il portatore; **Difensore 2** (secondo più vicino entro 22u) copre goal-side (`covX=bGX·0.5+goalX·0.5`); **F10** un terzo chiude la linea più pericolosa.
**5.** `feet`.
**6.** Pressing + copertura (raddoppio) + chiusura linea passaggio.
**7.** ☑ palla a terra.
**8.** Locomozione IA (no animazione eroe dedicata; movimento off-ball).
**9.** Portatore nell'ultimo terzo. Deterministico, bounded.
**10.** `IF carrier in final third → 2nd-nearest DEF cover (F11) + F10 lane close`.
**11.** Raddoppio riuscito (palla persa dal portatore) · Superato (1-2 stretto) · Fallo tattico.
**12.** Nessun overlay dedicato (è movimento di sfondo); influenza l'esito dell'HL del portatore.
**13.** Eroe **spettatore/IA**: se è l'eroe a difendere, riceve il controllo (→C-27); altrimenti è un compagno IA.
**14.** Camera segue il portatore (non la copertura).
**15.** Repulsione tra i due difensori (no doppio tuffo); esclusività mesh.
**16.** **F10** (chiude linea passaggio) + **F11** (press+cover goal-side). Deterministici, sospesi sui set-piece.
**17.** **Non validato dal gate** (off-ball); le AI deliberative interagiscono e vanno collaudate dal vivo; possibili buchi se due difensori scelgono lo stesso bersaglio.
**18.** **7/10** (aggiunge realismo tattico).
**19.** Criticità **Media** (gate-cieco). Impatto immersione/realismo alto.
**20.** §D C-33.

---

### C-34 · SET_PIECE_PENALTY

**1.** ID `SET_PIECE_PENALTY` · «Rigore» · SET_PIECE · PENALTY.
**2.** Calcio di rigore dell'eroe. `intent="penalty"` (text /rigore/), `ballState="set_ground"`, `lockMovement=true` (`maxMoves=0`). 2 situazioni. Mini-gioco dedicato (`handleRigore`).
**3.** X 88–89, Y 48–52 (dischetto); area di rigore; centrale.
**4.** **Eroe** sul dischetto; **GK** sulla linea (porta a x=97); difensori+attaccanti fuori area (sgomberata, `tx=82+(i%3)·5`).
**5.** `set_ground` (palla inattiva).
**6.** Rigore (angolato rasoterra / centro-alto / cucchiaio).
**7.** ☑ palla inattiva (a terra ferma).
**8.** `penalty` default: rincorsa caricata, gamba −3.2·sin(_ku·π) (`_ku` rampa windup), `_T=0.70s`. Arco h 4.2 dur 0.72. GLB clip `penalty`. GK `gk_dive`.
**9.** `intent penalty`. **`handleRigore`**: `saved = (dir===gkDir)`; se non parato `ok = random()<(isCorner?0.88:0.55)`. fkPenalty NON applicato (path separato). Skill `tiro·0.5+mentalità·0.5`.
**10.** `IF text /RIGORE/ → penalty mini-game`. `IF dir===gkDive → saved; ELSE IF random<0.88(corner)/0.55(centro) → goal; ELSE miss`.
**11.** Goal · Parato (GK indovina lato) · Fuori/Palo (miss) · (no fallo).
**12.** Float/cinema gol; momentum +20 gol / −15 parato / −10 fuori; crowd silenzio→boato; intro «Il silenzio dello stadio è assordante».
**13.** Eroe protagonista (UI griglia 6 direzioni tl/tc/tr/bl/bc/br).
**14.** CLOSE bassa dietro la palla (`cPx=clamp(bx−18,…),cPy=6.5`); GK tracking; shake gol.
**15.** GK `gk_dive` verso `gkDir`; nessun contatto.
**16.** Tutti fuori area (sgombero); GK sceglie lato pre-calcolato (pesi angoli favoriti).
**17.** Il GK sceglie il lato a priori (`gkDiveRef`), l'utente «indovina» contro: meccanica a morra cinese (parata se stesso lato) → realismo limitato; nessun rigore «sbagliato per il GK fermo».
**18.** **7/10** (mini-gioco chiaro e teso).
**19.** Criticità **Bassa**. Impatto Hero/tensione alto.
**20.** §D C-34.

---

### C-35 · SET_PIECE_PENALTY_PANENKA

**1.** ID `SET_PIECE_PENALTY_PANENKA` · «Rigore a cucchiaio» · SET_PIECE · PENALTY/PANENKA.
**2.** Variante del rigore col cucchiaio. `penalty_panenka` (label /cucchiaio|pallonett/, 2 azioni).
**3.** Come C-34 (dischetto).
**4.** Come C-34.
**5.** `set_ground`.
**6.** Cucchiaio centrale (panenka).
**7.** ☑ palla inattiva.
**8.** `penalty_panenka`: gamba −1.6·sin(_ku·π) (tocco delicato), y 0.1·sw, torso 0.12·sw. **Arco h 9.0 dur 1.20** (lob altissimo, non scalato).
**9.** label cucchiaio. exec `pen_panenka 0.5+tecnica·0.02+(pressure≤1?0.6:0)` (favorito a bassa pressione).
**10.** `IF penalty & label /cucchiaio|pallonett/ → penalty_panenka`.
**11.** Goal (cucchiaio se GK si tuffa) · Parato (GK resta centrale) · Fuori.
**12.** Overlay goal «Glaciale»; crowd delirio o derisione.
**13.** Eroe protagonista.
**14.** CLOSE dietro palla; segue il lob.
**15.** GK tuffo (se va sull'angolo il cucchiaio paga).
**16.** Come C-34.
**17.** Se il GK NON si tuffa (resta centrale) il cucchiaio è regalato → coerenza con `handleRigore` (panenka = centro `bc`, parato se gkDir=bc).
**18.** **6/10** (alto rischio cucchiaio-su-GK-centrale).
**19.** Criticità **Bassa**.
**20.** §D C-35.

---

### C-36 · SET_PIECE_FREEKICK_DIRECT

**1.** ID `SET_PIECE_FREEKICK_DIRECT` · «Punizione diretta» · SET_PIECE · FREEKICK.
**2.** Punizione dal limite verso la porta. `intent="freekick"` (text /unizione/), `ballState="set_ground"`. 8 situazioni. Pattern `SET_PIECE`.
**3.** X 70–84 (limite area), Y centrale; bordo; barriera a x:70.
**4.** **Eroe** sulla palla; **barriera di 4 avversari** a x:70 (`wx/wy`); GK sul palo coperto; attaccanti in area per la respinta; difensori che marcano.
**5.** `set_ground`.
**6.** Punizione (a giro sopra la barriera / potente / piazzata).
**7.** ☑ palla inattiva.
**8.** `freekick`: gamba −2.5·sw, braccia 1.4·sw, `_T` default. Arco h 3.2 dur 0.80 (q plasma). 3 avversari della barriera saltano (`_wallJumpT`, y sin·1.5).
**9.** `intent freekick`. **fkPenalty applicato** (0.45 se rew=goal → punizioni difficili da segnare). Skill `tiro·0.5+tecnica·0.5`.
**10.** `IF text /punizione/ → freekick`. Esito `goal q·3.0 / saved / wall_blocked 1.2+pressure·0.6 / wide`.
**11.** Goal (a giro) · Parata · **Murata dalla barriera** (wall_blocked) · Fuori · Corner.
**12.** Overlay goal/miss «Murato»; crowd.
**13.** Eroe protagonista (battitore).
**14.** CLOSE bassa dietro palla (penalty/freekick override); GK tracking; result framing.
**15.** Barriera salta; palla può essere murata; no contatto.
**16.** Muro di 4 compatto a ~9u verso il palo vicino (B16); attaccanti per la respinta; difensori a uomo.
**17.** La barriera a x:70 vs arco h 3.2 — la palla può «attraversare» la barriera se l'arco è teso (no collisione reale); fkPenalty rende il gol raro (realistico ma frustrante).
**18.** **7/10**.
**19.** Criticità **Media**. Impatto immersione/animazioni alto.
**20.** §D C-36.

---

### C-37 · SET_PIECE_FREEKICK_FLANK

**1.** ID `SET_PIECE_FREEKICK_FLANK` · «Punizione laterale (cross)» · SET_PIECE · FREEKICK/CROSS.
**2.** Punizione dalla fascia battuta come cross in area. `intent="freekick"` ma `isFlankFK` (y<22 o y>78) → arrangiamento da corner/cross. Battuta come cross verso l'area.
**3.** X 55–80, Y <22 o >78 (laterale); fascia; arrangiamento area.
**4.** Eroe batte dalla fascia; corridoi in area (`bx/by` 10 slot home); GK in area; difensori impacchettati.
**5.** `set_ground` → cross `aerial` in volo.
**6.** Cross su punizione (verso primo/secondo palo).
**7.** ☑ palla inattiva battuta → aerea in area.
**8.** `cross`/`freekick` battuta + inserimenti (box runs); GLB clip `kick`.
**9.** `freekick` + flank. **Trigger CHAIN possibile** (assist su punizione → second ball).
**10.** `IF freekick & (y<22|y>78) → flank arrangement (box)`.
**11.** Assist (testa in area) · Goal diretto (raro) · Intercettato · Corner · Respinta.
**12.** Overlay assist; CHAIN; crowd.
**13.** Eroe assist-man (battitore).
**14.** CLOSE cross side-tracking; result framing.
**15.** Mischia aerea in area; no ragdoll.
**16.** Impacchettamento area (B16); box runs; marcatura.
**17.** Sovrapposizione con corner (stesso arrangiamento); riceventi in area da posizionare.
**18.** **7/10**.
**19.** Criticità **Media**.
**20.** §D C-37.

---

### C-38 · SET_PIECE_CORNER

**1.** ID `SET_PIECE_CORNER` · «Calcio d'angolo» · SET_PIECE · CORNER.
**2.** Corner battuto in area. Classificato come `insertion`/`cross` con keyword /corner|calcio d'angolo/, `ballState="aerial"`. Arrangiamento area come flank FK.
**3.** X ~95–100, Y ~0 o 100 (bandierina); arrivo in area; primo/secondo palo/dischetto.
**4.** Eroe in area (insertion) o battitore; corridoi su pali (canali 8/9/10); GK in area; difensori a uomo + zona.
**5.** `aerial`.
**6.** Cross da corner + colpo di testa / volée / sponda.
**7.** ☑ palla aerea.
**8.** `cross` battuta + `header`/`volley` inserimento; box runs coordinati.
**9.** keyword corner. Insertion (aerial). CHAIN possibile.
**10.** `IF zone=area & /corner/ → insertion (aerial)`.
**11.** Goal di testa · Assist · Parata · Respinta · Murato · Nuovo corner.
**12.** Overlay goal/insertion; crowd.
**13.** Eroe protagonista (in area) o assist-man (battitore).
**14.** CLOSE header; result framing.
**15.** Mischia aerea fitta; repulsione; no ragdoll.
**16.** Affollamento area (box runs); marcatura a uomo+zona.
**17.** Origine bandierina non sempre resa; mischia molto affollata (repulsione fitta può «vibrare»).
**18.** **7/10**.
**19.** Criticità **Media**. Impatto immersione alto.
**20.** §D C-38.

---

### C-39 · SET_PIECE_DEFEND (DIFESA SU PUNIZIONE/CORNER)

**1.** ID `SET_PIECE_DEFEND` · «Difesa su palla inattiva» · DEFENSE/SET_PIECE · WALL/MARKING.
**2.** Comportamento IA difensivo quando l'avversario batte una punizione/corner: muro + marcature. Strutturale (off-ball), non HL interattivo (salvo HL difensivo `save`/`recovery` in area propria).
**3.** X area propria (5–25), barriera a `ball+9`; corridoio centrale; area propria.
**4.** **Muro di 4** difensori compatti a ~9u sulla linea palla→porta (verso il palo vicino, y-spaziati ~1.5u); resto marca in area (mai dietro la palla); GK sulla linea.
**5.** `set_ground` (avversaria) → `aerial` su cross.
**6.** Muro / marcatura a uomo / spazzata.
**7.** ☑ entrambe (muro su diretta, spazzata aerea su cross).
**8.** Posa muro (off-ball); 3 saltano sul tiro (`_wallJumpT`); eventuale header difensivo.
**9.** Set-piece avversario. Deterministico (off-ball passi sospesi tranne wall arrangement).
**10.** `IF freekick avversaria & defending → wall(4)+marking`.
**11.** Respinta del muro · Spazzata · Gol subìto · Corner concesso.
**12.** Nessun overlay (sfondo); se l'eroe difende in area → C-31/C-32.
**13.** Eroe spettatore/IA (o protagonista se difende l'azione → C-31).
**14.** Camera sul battitore avversario; result framing porta propria su gol.
**15.** Muro compatto (repulsione regolata); salto coordinato.
**16.** Muro 4 + marcatura goal-side; GK sulla linea.
**17.** **Gate non copre** ripresa/chaining set-piece difensivi; il muro può non allinearsi perfettamente alla traiettoria.
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-39.

---

### C-40 · GK_SAVE_DIVE (parata del portiere avversario)

**1.** ID `GK_SAVE_DIVE` · «Parata del portiere» · GOALKEEPER · SAVE (IA, motore-controllata).
**2.** Il portiere avversario si tuffa sul tiro/colpo di testa dell'eroe. Non è un HL interattivo (l'eroe non controlla il GK avversario): è la **reazione `oppActType="gk_dive"`** in `fireConclusion` su shot/penalty/header/cross quando `!hlDef`. Determina l'esito visivo `save`/`goal`.
**3.** Porta avversaria (x≈94–97 mondo/area); centrale-laterale; linea di porta.
**4.** **GK avversario** sulla linea che si tuffa verso `_diveToZ`; eroe tiratore in area; difensori dietro.
**5.** Palla in arrivo (arco verso porta).
**6.** Parata / respinta / deviazione / uscita.
**7.** ☑ entrambe (parata bassa o aerea).
**8.** `gk_dive` (`_OT=0.90s`): smoothstep verso `_diveToZ`, y `sin·1.15`, rotation.z `±_ext·1.7` (corpo orizzontale), braccia tese −2.7·_ext. **Reach: `_saveReach=9` su esito parata (ci arriva), `6` su gol (cade corto)** → il tuffo è coerente con l'esito. GLB clip `dive`. Post-parata `gkSaveCelebT` (rialzata, braccia su 1.1s).
**9.** Innescato dall'esito dell'HL eroe (key=miss/save) o da `P.hlOutcomeKind`. `oppDiveDir = ballArcTgtZ≥gk.z?1:-1`. CAP entro i bound porta.
**10.** `IF hero shot/header/penalty & !hlDef → gk_dive; reach = (outcome saved)?9:6; diveToZ=clamp(ballArcTgtZ,±reach)`.
**11.** Parata (save) · Respinta in corner · Deviazione · Gol subìto dal GK (l'eroe segna) · Presa.
**12.** Overlay (lato eroe) miss «Grande parata del portiere»/«Il portiere dice di no»; crowd `save`.
**13.** Eroe **coinvolto indirettamente** (è lui che tira; il GK è IA). Eroe protagonista del tiro, spettatore della parata.
**14.** CLOSE result framing porta+GK; GK tracking 35%; bullet-time.
**15.** Nessun contatto; il GK raggiunge la palla solo se `save`.
**16.** GK posizionato sulla linea durante l'HL; apertura angolo solo in gioco aperto (C-41).
**17.** Su gol il GK «cade corto» (reach 6) — coerente; ma se l'arco è molto angolato il tuffo può sembrare in ritardo; la presa pulita non è distinta dalla respinta.
**18.** **8/10** (reach coerente con esito = punto forte).
**19.** Criticità **Bassa**. Impatto immersione/spettacolarità alto.
**20.** §D C-40.

---

### C-41 · GK_POSITIONING (apertura angolo)

**1.** ID `GK_POSITIONING` · «Portiere stringe l'angolo» · GOALKEEPER · POSITIONING (IA F13).
**2.** In **gioco aperto** (`!isHL && !setPiece`) il portiere che difende esce sulla palla per stringere l'angolo. Strutturale (off-ball), bounded.
**3.** Porta difendente; `_goalX = away?94:6`; **CAP away x∈[80,94], home x∈[6,20]**, y 38–62.
**4.** **GK** che avanza `_step=_adv·_ctr·4.5` verso la palla (entro i bound del gate).
**5.** N/A (gioco di sfondo).
**6.** Posizionamento / uscita.
**7.** N/A.
**8.** Locomozione/posa pronta (gambe/braccia divaricate); niente tuffo finché non c'è conclusione.
**9.** Solo in gioco aperto; durante gli HL il GK resta sulla linea (item 6). Deterministico.
**10.** `IF open play → gx = clamp(goalX ∓ step, bounds)`.
**11.** N/A (preparatorio; sfocia in C-40 su tiro).
**12.** Nessun overlay.
**13.** Eroe non coinvolto (GK avversario IA).
**14.** Camera broadcast (non segue il GK).
**15.** GK escluso dalla repulsione (loop separato).
**16.** F13 (angolo); rispetta i bound asseriti dal gate (initial-state/orientation).
**17.** L'uscita è limitata ai bound (mai oltre x 80/20) → coerente col gate ma il GK non esce mai «alto» davvero; nessuna uscita sui cross.
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-41.

---

### C-42 · KICKOFF_RESTART (ripartenza dal centro)

**1.** ID `KICKOFF_RESTART` · «Si riparte dal centro» · STRUCTURAL · RESTART.
**2.** Dopo un gol dell'eroe, `handleContinue` instrada a una ripartenza dal centrocampo invece di una nuova fase. Riusa i sistemi testati (palla a centro + preset drift `midfield`).
**3.** X=50, Y=50 (cerchio di centrocampo); centrale; terzo centrale.
**4.** Palla a centrocampo; formazioni che si ricompattano (`DRIFT_PRESETS.midfield`); eroe al centro.
**5.** `feet` (palla ferma al centro → in gioco).
**6.** Calcio d'inizio / ripartenza.
**7.** ☑ palla a terra.
**8.** Snap palla a centro (`ballTargetRef={x:50,y:50}`); drift midfield; nessuna animazione dedicata.
**9.** `wasGoal` (`outKey==="goal"`) in `handleContinue`.
**10.** `IF outKey=goal → ball+drift center → float «⚽ Si riparte dal centro» → playing`.
**11.** N/A (ripristina il gioco di sfondo).
**12.** Float «⚽ Si riparte dal centro».
**13.** Eroe spettatore (transizione).
**14.** Camera torna WIDE broadcast.
**15.** Repulsione ricompatta le formazioni.
**16.** Drift `midfield` (ricompattamento).
**17.** **Gate non copre** (forza le situation, salta `handleContinue`) → ripresa a rischio; lo snap può sembrare un teletrasporto della palla.
**18.** **6/10**.
**19.** Criticità **Bassa**.
**20.** §D C-42.

---

### C-43 · WALKOUT_ENTRANCE (ingresso in campo)

**1.** ID `WALKOUT_ENTRANCE` · «Ingresso dal tunnel» · STRUCTURAL · PRE_MATCH.
**2.** Le squadre entrano in campo dal tunnel prima del fischio d'inizio. Fase `walkout` (dopo formations, salvo «Salta»→playing).
**3.** Centrocampo/tunnel; tutto il campo (schieramento).
**4.** 22 giocatori camminano dal tunnel agli slot; eroe verso la sua posizione; arbitro.
**5.** N/A.
**6.** Cammino (walkout).
**7.** N/A.
**8.** **`animWalk`** (`WALK_DUR=6.2s`): attesa nel tunnel (`_wDelay`), poi cammino allo slot `_wx/_wz` a `·k·0.85`, faccia alla camera (−π/2) da fermo. `onWalkoutDone` → playing.
**9.** Fase `walkout`; `benchStart`→`onBench` dopo.
**10.** `IF phase=walkout → animWalk → onWalkoutDone → playing` (o «Salta»→playing).
**11.** N/A.
**12.** `WalkoutOverlay` (grafica TV pre-gara, confronto standings `_tvHome/_tvAway`).
**13.** Eroe spettatore (cammina con la squadra).
**14.** Camera WALK (alterna dolly ravvicinato e panoramica aerea ogni 4.4s).
**15.** Repulsione attiva.
**16.** Slot di formazione (schieramento iniziale).
**17.** Se «Salta» l'ingresso 3D non si vede (richiesta utente: skip salta l'ingresso); il bench-entrance si vede solo via benchPhase.
**18.** **7/10** (atmosfera TV).
**19.** Criticità **Bassa**. Impatto immersione/telecronaca alto.
**20.** §D C-43.

---

### C-44 · SUB_ENTRANCE (ingresso dalla panchina)

**1.** ID `SUB_ENTRANCE` · «Ingresso a gara in corso» · STRUCTURAL · SUBSTITUTION.
**2.** L'eroe entra dalla panchina a partita in corso (se `benchStart`). Sequenza panchina: watching → warmup → entering.
**3.** Bordo campo (touchline `(-6,0,-35.5)` mondo) → posizione in campo.
**4.** Eroe cammina dalla linea laterale alla posizione; compagni in campo.
**5.** N/A.
**6.** Cammino d'ingresso (`SUB_DUR=4.2s`).
**7.** N/A.
**8.** Cammino dalla touchline alla posizione; si gira verso la panchina all'inizio. Camera sub-entry bassa vicino panchina/eroe.
**9.** `benchStart` + `entryMinute`; pool messaggi `_BENCH_OBS/_WARMUP/_ENTRY`.
**10.** `IF benchStart → onBench (watching→warmup→entering) → entrance 3D`.
**11.** N/A.
**12.** Bench overlay (watching/warmup/entering); subEvent banner.
**13.** Eroe protagonista (entra in scena).
**14.** Camera sub-entry (bassa, segue l'eroe dalla panchina).
**15.** Repulsione.
**16.** L'eroe raggiunge il proprio slot.
**17.** «L'ingresso 3D dalla panchina non si vede post-Salta» (richiesta utente affrontata: bench sub-entrance via benchPhase→entering).
**18.** **7/10**.
**19.** Criticità **Bassa**. Impatto Hero/immersione alto.
**20.** §D C-44.

---

### C-45 · TROPHY_CEREMONY_3D (cerimonia trofeo)

**1.** ID `TROPHY_CEREMONY_3D` · «Premiazione sul campo» · STRUCTURAL · CELEBRATION.
**2.** Alla fine della partita che assegna un titolo (`titleStakes` + vittoria), parte la premiazione 3D sul campo: alzata trofeo + coriandoli + fuochi + festeggiamenti. Si attiva a `phase==="ended"` con `score.home>score.away` e `titleStakes` non nullo.
**3.** Centrocampo/area; tutto il campo; cerimonia.
**4.** **Eroe** alza il trofeo (braccia su, saltelli); compagni (idx 1–10) festeggiano (braccia su + hop); trofeo dorato sopra l'eroe.
**5.** N/A.
**6.** Esultanza / alzata trofeo.
**7.** N/A.
**8.** `P.ceremony` → `trophyGrp.visible`; eroe braccia −2.5, hop `|sin(t·3)|·0.22`, trofeo `y=1.9+_liftU·1.5+_hop` ruota +aDt·1.3, emissive pulse; coriandoli multicolore (HSL); **fuochi d'artificio** (60 pts, burst radiale ogni 0.45–0.95s, gravità −5.5).
**9.** `ended` + `titleStakes` (finale Coppa/Europa/Mondiale/Coppa Nazioni o clinch matematico campionato) + vittoria.
**10.** `IF ended & titleStakes & home>away → ceremony (3D) + banner 2D`.
**11.** N/A (celebrazione).
**12.** Banner granata «TITOLO VINTO!»/«CAMPIONI!»; cerimonia 2D + 3D.
**13.** Eroe protagonista assoluto.
**14.** Camera sul campo (cerimonia); nessun shake.
**15.** N/A (festeggiamento, no contatti).
**16.** Compagni festeggiano (no IA tattica).
**17.** **Gate-cieco** (non raggiunge ended con titolo); `titleStakes` calcolato pre-partita può non coprire ogni clinch.
**18.** **8/10** (forte payoff emotivo).
**19.** Criticità **Bassa**. Impatto Hero/immersione altissimo.
**20.** §D C-45.

---

### C-46 · BG_CHRONICLE (cronaca di sfondo)

**1.** ID `BG_CHRONICLE` · «Evento di cronaca» · BACKGROUND · COMMENTARY.
**2.** Tra un highlight e l'altro, durante `playing`, il motore emette eventi di cronaca dal database `BG_MATCH` (~170 voci) con possesso, momentum, ball drift, e occasionalmente gol/cartellini/infortuni. Densità `_bgProb=0.18+|mom−50|/50·0.12`.
**3.** `bpos` (target palla logico per evento); tutto il campo; secondo il `pd` (drift).
**4.** Off-ball: drift formazione per `pd` (`DRIFT_PRESETS`); l'eroe deriva verso lo slot di ruolo.
**5.** Arco palla per `BG_ARC_MAP[pd]` (shot/cross/save/tackle/pass).
**6.** Varie (passaggio, tiro fuori HL, recupero — tutte narrate, non interattive).
**7.** ☑ entrambe (secondo l'arco BG).
**8.** Arco palla BG (`BALL_ARC_BY_TYPE`); nessuna animazione eroe dedicata (locomozione off-ball).
**9.** Tick 300ms, `_bgProb`; filtro clock/derby/ctx/momThreshold + dedup ultimi 3; bias tattico ×1.8.
**10.** `IF playing & !hl & random<_bgProb → wPick(BG_MATCH eligible) → apply ef/poss/bpos/ms/momentum`.
**11.** Gol di sfondo (team_goal/opp_goal) · Cartellino rosso avversario · Infortunio avversario · Tiro/parata narrati · Possesso/momentum swing · Corner/fallo (stat).
**12.** Testo cronaca (token `{H}{H2}{A}{P}{DERBY}`), colore per arco (`ATE3_ARCCOL`), ritardo all'apice (`ATE3_ARCMS`); crowd chants su gol/danger/near_miss/foul.
**13.** Eroe spettatore (salvo `{P}` che lo nomina; escluso se in panchina).
**14.** Camera WIDE broadcast che segue il baricentro azione.
**15.** Repulsione/drift; nessun contatto scriptato (eventi narrati).
**16.** Drift formazione (`DRIFT_PRESETS`); F2/F3 off-ball.
**17.** «Messaggi in sovraimpressione senza senso» (storica: penalty/coach fuori contesto — mitigato sanitizzando i pool e rendendo i sub-event context-aware); i gol di sfondo accadono senza HL giocabile (l'utente non li vive).
**18.** **6/10** (cronaca viva ma a volte scollegata).
**19.** Criticità **Media**. Impatto telecronaca/ritmo alto.
**20.** §D C-46.

---

### C-47 · REACTIVE_DESPERATE_HL (highlight reattivo)

**1.** ID `REACTIVE_DESPERATE_HL` · «Assalto finale / reazione» · TRANSITION · REACTIVE.
**2.** Highlight extra iniettati dal contesto: dopo un gol subìto (coda `nx+rng(4,8)`), o quando si è sotto nel finale (early-desperate 60' sotto di 1; desperate 72' sotto di ≥2). Spingono `numHL` fino al cap 8.
**3.** Tutto il campo (transizione/assalto offensivo); spesso area avversaria.
**4.** Squadra sbilanciata in avanti (drift `attack`/`attack_goal`); difesa avversaria che si chiude.
**5.** `feet`/`aerial` secondo la situazione pescata.
**6.** Qualsiasi giocata offensiva (assalto).
**7.** ☑ entrambe.
**8.** Secondo la situazione pescata (shot/cross/header…).
**9.** opp_goal (coda reattiva) o stato risultato+minuto. Momentum coach orders (assalto_85 +22).
**10.** `IF opp_goal → queue HL nx+rng(4,8)`; `IF 72' & sotto≥2 → desperate HL`; `IF 60' & sotto1 → early-desperate`.
**11.** Gol della speranza · Occasione · Palla persa in ripartenza · Gol in contropiede subìto.
**12.** Cronaca urgenza; crowd `urgenza`/`comeback`; overlay.
**13.** Eroe protagonista (assalto).
**14.** WIDE→CLOSE attack-zoom.
**15.** Difesa avversaria chiusa; press+cover.
**16.** Drift `attack`; sbilanciamento offensivo; difesa avversaria compatta.
**17.** Lo sbilanciamento offensivo non sempre reso (formazioni); i gol reattivi possono accumularsi se la coda non è limitata.
**18.** **6/10**.
**19.** Criticità **Media**. Impatto ritmo/drammaticità alto.
**20.** §D C-47.

---

### C-48 · CHAIN_HEADER (secondo palo su catena)

**1.** ID `CHAIN_HEADER` · «Colpo di testa sul secondo palo (catena)» · ATTACK/CHAIN · AERIAL.
**2.** Variante header di `CHAIN_SITS` iniettata dopo un assist su cross: `"✈️ Cross in area! Attacca il secondo palo."` con `cn:{fpCross,fpHeader}`. Vedi C-10 per il meccanismo di chaining.
**3.** Area, secondo palo; centrale-laterale.
**4.** Eroe sul secondo palo (smarcato); cross dalla catena; GK sul primo; difensori (nearby_def 3).
**5.** `aerial` (cn fpCross).
**6.** Colpo di testa al secondo palo / tiro di prima / sponda per compagno.
**7.** ☑ solo aerea.
**8.** `header_far_post` (cn.fpHeader). Vedi C-12.
**9.** Chaining (`CHAIN_SITS.header`); regex assist su cross.
**10.** `IF assist su cross → pick CHAIN.header → hl_intro «CATENA»`.
**11.** Goal di testa · Parata · Fuori · Sponda assist (rew assist).
**12.** Float «CATENA!»; overlay goal/assist.
**13.** Eroe protagonista.
**14.** CLOSE header FAR_POST.
**15.** Stacco al secondo palo; mischia.
**16.** Box runs (secondo palo); marcatura.
**17.** **Gate-cieco** (chaining); doppia iniezione se la guardia pending fallisce.
**18.** **7/10**.
**19.** Criticità **Media** (gate-cieco).
**20.** §D C-48.

---

### C-49 · HALFTIME_RESET (intervallo)

**1.** ID `HALFTIME_RESET` · «Intervallo» · STRUCTURAL · HALFTIME.
**2.** A `clock===45` il motore emette una riga di scommento riassuntivo e riavvicina il momentum a 50 (reset streak). Non interrompe le fasi (resta `playing`).
**3.** N/A (evento di stato).
**4.** N/A.
**5.** N/A.
**6.** N/A.
**7.** N/A.
**8.** Nessuna animazione (evento logico).
**9.** `clock===45`.
**10.** `IF clock=45 → summary line + momentum=m+(50−m)·0.5+diff·5 + streak reset + chant half`.
**11.** N/A (riequilibrio).
**12.** Riga cronaca riassuntiva; crowd `half`.
**13.** Eroe spettatore.
**14.** WIDE.
**15.** N/A.
**16.** N/A.
**17.** Non c'è una vera pausa/animazione d'intervallo (solo logica); l'utente non «vive» l'intervallo.
**18.** **5/10** (puramente logico).
**19.** Criticità **Bassa**.
**20.** §D C-49.

---

### C-50 · REPLAY_SEQUENCE (replay post-gol)

**1.** ID `REPLAY_SEQUENCE` · «Replay» · STRUCTURAL · REPLAY.
**2.** Dopo un gol, una breve sequenza di replay rigioca l'azione da camera alta laterale (ring buffer di frame). Si attiva quando `resultT≥3.2` e `repCount≥25` (frame catturati).
**3.** Camera alta laterale che segue la palla; zona del gol.
**4.** Posizioni rigiocate dal ring buffer (`REP_CAP=150` frame).
**5.** Stato palla rigiocato.
**6.** N/A (rigioca l'azione precedente).
**7.** N/A.
**8.** `driveReplay` rigioca i frame catturati; locomozione legacy (`_applyFrame`); `REPLAY_DUR=2.6s`.
**9.** Post-gol; `resultT≥3.2 & repCount≥25`.
**10.** `IF post-goal & frames≥25 → driveReplay (REPLAY_DUR 2.6s)`.
**11.** N/A (ripetizione).
**12.** Nessun overlay testuale dedicato (regia replay).
**13.** Eroe protagonista (rivede il proprio gol).
**14.** **Replay camera** (alta laterale `tPy=30, tPz=rbz·0.45+32` che segue la palla).
**15.** Rigioca le collisioni/posizioni catturate.
**16.** N/A (riproduzione).
**17.** Il replay usa il cycle locomozione legacy (hard-threshold) → può differire dalla resa live; ring buffer limitato (150 frame).
**18.** **6/10**.
**19.** Criticità **Bassa**. Impatto telecronaca medio.
**20.** §D C-50.

---

## D. Matrice finale

Legenda: **Palla** F=feet, A=aerial, S=set_ground, –=n/a · **Hero** P=protagonista, A=assist-man/indiretto, S=spettatore/IA · **Realismo** voto 1–10 · **Criticità/Priorità** A=Alta M=Media B=Bassa.

| ID | Nome | Zona (x log.) | Coord. mondo | Palla | Animazione | Ruolo principale | Highlight (hlType) | Telecamera | Real. | Critic. | Prio. | Hero |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C-01 | Tiro dal limite | bordo 72–84 | +22..+34 | F | shot_power/curled/chip | Punta/Trequartista | shot | CLOSE+result | 7 | M | M | P |
| C-02 | Solo dav. al portiere | area 80–98 | +30..+48 | F | shot_one_on_one | Punta | shot | CLOSE bassa | 8 | B | B | P |
| C-03 | Tiro di potenza | area/bordo 72–98 | +22..+48 | F | shot_power | Punta | shot | CLOSE+result | 7 | M | M | P |
| C-04 | Tiro a giro | bordo/area 72–95 | +22..+45 | F | shot_curled | Ala/Trequartista | shot | CLOSE | 7 | B | B | P |
| C-05 | Pallonetto/cucchiaio | area 80–96 | +30..+46 | F | shot_chip | Punta | shot | CLOSE alta | 6 | M | M | P |
| C-06 | Volée/rovesciata | area 80–96 | +30..+46 | A | shot_volley | Punta | shot | CLOSE raised+replay | 8 | B | A | P |
| C-07 | Tap-in/di prima | area 84–98 | +34..+48 | F | shot_first_time | Punta | shot | CLOSE ravvicinata | 7 | B | B | P |
| C-08 | Conduzione e tiro | trequarti→area 60–95 | +10..+45 | F | locomozione→shot | Punta/Trequartista | build→shot | CLOSE follow | 7 | M | M | P |
| C-09 | Inserimento in area | area 84–100 | +34..+50 | A | header/volley | Punta | header/shot | CLOSE+result | 7 | M | M | P |
| C-10 | Seconda palla/mischia | area 84–100 | +34..+50 | F/A | first_time/header | Punta | shot/header | CLOSE caotica | 7 | M | M | P |
| C-11 | Testa primo palo | area 84–96 | +34..+46 | A | header_near_post | Punta | header | CLOSE post alta | 7 | M | M | P |
| C-12 | Testa secondo palo | area 84–96 | +34..+46 | A | header_far_post | Punta | header | CLOSE far-post | 7 | B | B | P |
| C-13 | Tuffo di testa | area 86–96 | +36..+46 | A | header_diving | Punta | header | CLOSE bassa | 6 | B | B | P |
| C-14 | Cross primo palo | fascia 62–88 | +12..+38 | A | cross_near_post | Ala/Terzino | cross | CLOSE near-post | 7 | M | M | A |
| C-15 | Cross secondo palo | fascia 62–88 | +12..+38 | A | cross_far_post | Ala | cross | CLOSE far-post | 7 | B | B | A |
| C-16 | Cross a rientrare | fondo 78–95 | +28..+45 | A(basso) | cross_cutback | Ala | cross | CLOSE cutback | 7 | B | B | A |
| C-17 | Cross teso rasoterra | fascia 62–88 | +12..+38 | A(basso) | cross_low_driven | Ala | cross | CLOSE near | 7 | B | B | A |
| C-18 | Cambio gioco | centro 38–72 | −12..+22 | F | pass (switch) | Regista | pass | CLOSE arretrata | 6 | B | B | P |
| C-19 | Costruzione dal basso | centro 38–72 | −12..+22 | F | build | Mediano/Regista | build | WIDE/CLOSE | 6 | B | B | P |
| C-20 | Conduzione in avanti | centro→avanti 38–72 | −12..+22 | F | locomozione | Mezzala | progression | CLOSE follow | 6 | M | M | P |
| C-21 | Imbucata/filtrante | trequarti 50–80 | 0..+30 | F | pass through | Trequartista | pass | CLOSE through | 7 | M | M | P |
| C-22 | Uno-due/dai e vai | trequarti 50–80 | 0..+30 | F | pass combination | Mezzala | pass | CLOSE combination | 7 | B | B | P |
| C-23 | Contropiede | tutto il campo | −50..+50 | F | locomozione veloce | Punta/Mezzala | progression→shot | WIDE→CLOSE | 6 | M | M | P |
| C-24 | Finta/salto uomo | trequarti/area 55–90 | +5..+40 | F | dribble_feint | Ala/Trequartista | dribble | CLOSE tight | 7 | M | M | P |
| C-25 | Rientro interno | fascia→centro 60–88 | +10..+38 | F | dribble_inside | Ala | dribble | CLOSE tight | 6 | B | B | P |
| C-26 | Sterzata esterna | trequarti 60–90 | +10..+40 | F | dribble_outside | Ala | dribble | CLOSE tight | 6 | B | B | P |
| C-27 | Contrasto scivolata | propria/centro 20–55 | −30..+5 | F | tackle | Difensore/Eroe | tackle | CLOSE tackle | 7 | M | M | P |
| C-28 | Intercetto | propria/centro 20–55 | −30..+5 | F | intercept | Difensore | tackle | CLOSE | 6 | M | M | P |
| C-29 | Anticipo | propria/centro 20–55 | −30..+5 | F/A | tackle/header | Difensore | tackle | CLOSE | 6 | B | B | P |
| C-30 | Recupero difensivo | propria metà 5–55 | −50..+5 | F | tackle | Difensore | tackle | CLOSE | 6 | M | M | P |
| C-31 | Muro sul tiro | propria area 5–25 | −50..−30 | F/A | blocco/tackle | Difensore/Eroe | tackle | CLOSE difensiva | 6 | M | M | P |
| C-32 | Respinta aerea | propria area 5–30 | −50..−20 | A | header difensivo | Difensore | header | CLOSE | 6 | B | B | P |
| C-33 | Ultimo uomo/copertura | ultimo terzo | ±terzo | F | locomozione IA | Difensore IA | – | follow portatore | 7 | M | M | S |
| C-34 | Rigore | dischetto 88–89 | +38..+39 | S | penalty | Punta/Eroe | penalty | CLOSE dietro palla | 7 | B | B | P |
| C-35 | Rigore cucchiaio | dischetto 88–89 | +38..+39 | S | penalty_panenka | Punta | penalty | CLOSE | 6 | B | B | P |
| C-36 | Punizione diretta | bordo 70–84 | +20..+34 | S | freekick | Specialista | freekick | CLOSE dietro palla | 7 | M | M | P |
| C-37 | Punizione laterale | fascia 55–80 | +5..+30 | S→A | cross/freekick | Specialista | cross | CLOSE side | 7 | M | M | A |
| C-38 | Corner | bandierina→area | angolo→+area | A | cross+header | Battitore/Punta | cross/header | CLOSE header | 7 | M | M | P/A |
| C-39 | Difesa su inattiva | propria area 5–25 | −50..−30 | S/A | muro/marcatura | Difesa IA | – | sul battitore | 6 | B | B | S |
| C-40 | Parata del portiere | porta avv. | +44..+50 | A/F | gk_dive | GK avversario IA | – | result GK | 8 | B | B | A |
| C-41 | Portiere stringe angolo | porta difend. | ±44..50 | – | posa/locomozione | GK IA | – | broadcast | 6 | B | B | S |
| C-42 | Ripartenza dal centro | centro 50/50 | 0,0 | F | snap+drift | – | – | WIDE | 6 | B | B | S |
| C-43 | Ingresso dal tunnel | centro/tunnel | tutto | – | animWalk | tutti | – | WALK | 7 | B | B | S |
| C-44 | Ingresso da panchina | bordo→campo | touchline | – | cammino sub | Eroe | – | sub-entry | 7 | B | B | P |
| C-45 | Cerimonia trofeo | campo | centro/area | – | trophy lift+FX | Eroe+squadra | – | cerimonia | 8 | B | B | P |
| C-46 | Cronaca di sfondo | bpos vario | tutto | F/A | arco BG | – | – | WIDE broadcast | 6 | M | M | S |
| C-47 | Highlight reattivo | tutto il campo | −50..+50 | F/A | varia | Punta/Eroe | varia | WIDE→CLOSE | 6 | M | M | P |
| C-48 | Catena: testa 2° palo | area | +34..+50 | A | header_far_post | Punta | header | CLOSE far-post | 7 | M | M | P |
| C-49 | Intervallo | – | – | – | – | – | – | WIDE | 5 | B | B | S |
| C-50 | Replay post-gol | zona gol | +area | – | driveReplay | Eroe | – | replay alta | 6 | B | B | P |

---

## E. Copertura del motore

### E.1 Conteggi

| Metrica | Valore | Note |
|---|---|---|
| **Situazioni canoniche censite** | **50** | §C (10 attacco-tiro, 3 testa, 5 fascia, 5 centrocampo+transizione, 3 dribbling, 7 difesa, 6 set-piece, 2 portiere, 9 strutturali/speciali) |
| Situazioni scriptate sottostanti | **179** | `SITUATIONS` (off 147 · def 26 · special 5/6) + 3 `CHAIN_SITS` |
| Azioni totali (scelte) | **537** | 3 per situazione, filtrate a ≥2 da `filterSitActions` |
| Intenti (`deriveIntent`) | **13** | penalty·freekick·recover·anticipate·intercept·cross·through·onetwo·dribble·insertion·shot·progression·switch |
| Tipi highlight (`hlType`) | **9** | shot·header·dribble·pass·penalty·freekick·cross·build·tackle |
| Varianti highlight (`hlVariant`) | **~18** | 6 shot · 4 cross · 3 header · 3 dribble · 1 penalty · null per pass/build/freekick/tackle |
| Pattern (`hlPattern`) | **15** | EDGE_SHOT·COMBINATION·TACKLE·DRIBBLE_SHOT·BUILDUP·NEAR/FAR_POST_CROSS·CUTBACK·HEADER_ATTACK·ONE_ON_ONE·BALL_CARRY·THROUGH_BALL·SWITCH·SET_PIECE·PENALTY |
| **Animazioni eroe (variant-aware)** | **~20** | 6 shot + 4 cross + 3 header + 3 dribble + 2 penalty + freekick + pass + build (+ celebT, heroPostT miss/fist, wind-up additivo) |
| Animazioni avversario/GK | **6** | gk_dive, opp_tackle, opp_stumble, opp_spin, opp_intercept, wall_jump (+ gkSaveCeleb, conceded ready-stance) |
| Animazioni di sistema | **4** | animOne (locomozione), animWalk (walkout), sub-entrance, driveReplay |
| Clip GLB | **11** | footballer + idle/jog/kick/penalty/header/tackle/volley/gk-dive/gk-catch/gk-block |
| **Transizioni** (fasi + post-arco + catene + camera) | **~30** | 9 transizioni di fase + ~10 catene post-arco (in_net/in_net_high/hit_post/post_rebound/cross_goal/assist_recv/assist_shot/deflect) + chaining + kickoff + reattive + camera-blend |
| **Stati della palla** | **3 categorici** (feet/aerial/set_ground) **+ ~10 fisici a runtime** | a terra·rasoterra·rimbalzante·alta/lob·parabolica·respinta·rimpallo·deviazione·retropassaggio·inattiva |
| **Telecamere** | **~12 modalità** | WIDE broadcast · CLOSE highlight · WALK (dolly+panoramica) · result-framing · GK-tracking · replay · sub-entry · per-hlType overrides (penalty/freekick/header/tackle/cross/shot/pass/dribble) + shake + bullet-time |
| **Trigger** | **~25** | scheduling (numHL, hlTimes), selezione contestuale, ctx-match, auto-tackle timeout, coach orders (28/63/75/85), sub event, BG `_bgProb`, eventi BG (gol/rosso/infortunio), HL reattivi (opp_goal/desperate/early-desperate), chaining (CHAIN + 25% leggero), kickoff, halftime, replay, ceremony, meteo, derby/big-game, momentum thresholds |
| **Decision tree** | **~15 principali** | deriveIntent (13 rami) · deriveHL type/variant/pattern (3 alberi) · filterSitActions · succRate+modificatori · decideExecution (per-intento exec+outcome wpick) · handleRigore · handleContinue (kickoff/chain/montage) · BG eligibility · off-ball PASS 1/1b/1c/1d/2 · camera blend · chant auto-context |
| Esiti (`outKey`) | **12** | goal·assist·recovery·save (succ.) + miss·miss_easy·intercept·through·goal_against·foul·nothing·loose (fall.) |
| Esiti granulari (`decideExecution`) | **~30** | saved·blocked·post·wide·corner·offside·overhit·beat_man·fouled·dispossessed·ball_won·win_freekick·stopped·lost·advance·chance·deflected_out·missed·retain·progress·shielded_out… |
| Sovraimpressioni (`HL_OVERLAY_POOLS`) | **~90 messaggi / 16 categorie** | + OUTCOME_TX (11 chiavi, ~52 frasi) + BG_MATCH (~170) + CROWD_CHANTS (15 chiavi × base/LG/NAT) |
| Momentum / contesto | momentum 0–100, possession 20–80, 14 COACH_ORDERS, 7 DRIFT_PRESETS | — |

### E.2 Copertura percentuale stimata del gameplay

| Area | Copertura | Motivazione |
|---|---|---|
| **Fase offensiva** (tiro/dribbling/cross/passaggio/inserimento) | **~95%** | tutte le famiglie offensive con esecuzione decisa dal motore (F4–F12); mancano: pressing offensivo coordinato continuo, vere combinazioni a 3+ tocchi |
| **Fase difensiva** (contrasto/intercetto/anticipo/recupero/muro) | **~80%** | coperta come HL + IA F10/F11/F13; manca: linea del fuorigioco reale, copertura a zona completa, ruolo portiere giocabile |
| **Palle inattive** (rigore/punizione/corner) | **~85%** | rigore (mini-gioco), punizione diretta/laterale, corner; manca: rimessa laterale/dal fondo giocabile, batti-e-corri su corner corto |
| **Transizioni** (contropiede/ripartenze) | **~60%** | esistono come composizione di HL + drift, ma non come fase continua dedicata |
| **Portiere** | **~40%** | GK avversario IA (tuffo coerente) + apertura angolo; il portiere proprio è NPC passivo e non giocabile |
| **Regia/telecronaca** (camera/cronaca/overlay) | **~90%** | sistema camera ricco, cronaca BG + sovraimpressioni dinamiche v5.51.0; manca audio/voce |
| **Strutturale** (walkout/sub/kickoff/cerimonia/replay) | **~85%** | tutti presenti; replay usa cycle legacy; intervallo solo logico |
| **COPERTURA COMPLESSIVA STIMATA** | **~82%** | Il motore copre l'intero arco di un highlight offensivo e la maggior parte del difensivo con buona varietà cinematica; le lacune principali sono: continuità delle transizioni, ruolo portiere, fuorigioco/zone reali, e la validazione automatica (il gate cattura frame congelati, non il movimento dal vivo né le traiettorie — gran parte di §C va collaudata dal vivo). |

### E.3 Note di validazione

- Il **quality gate** (Playwright, 12 check) valida **stato/coerenza/golden su frame congelati**, NON il movimento dal vivo né le traiettorie. Sono **gate-ciechi** (da collaudare dal vivo): tutte le animazioni eroe (C-01…C-39), le IA off-ball (C-33, F10/F11/F13), la camera, il chaining (C-10/C-48), la ripresa/kickoff (C-42), la cerimonia (C-45), il replay (C-50), le sovraimpressioni (C-46).
- Le **posizioni off-ball NON sono nella firma golden** → modificarle è gate-safe ma non verificato.
- L'invariante **CINE** (testa/volée⟹aerea, set-piece⟹palla ferma) è l'unico vincolo cinematico **gate-enforced** (FAIL bloccante).

---

*Fine documento. Generato come analisi di sola lettura del motore Live Match CPM 5.51.0; nessun file di codice modificato.*
