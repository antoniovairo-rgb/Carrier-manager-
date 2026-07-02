# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **⭐ Charter di governo:** `MASTER_PROMPT.md` definisce la **Live Match Quality Platform (LMQP)** — i principi vincolanti (QA First · No Blind Fix · Zero Regression · Determinism First · «Every Highlight Must Tell a Story») e i 4 livelli di qualità. Ogni lavoro sul Live Match Engine vi si conforma. Il *quality gate* (sezione dedicata) è l'attuale implementazione di LMQP.

## Project Overview

**Career Player Manager (CPM)** is a single-file browser game — a football *player*-career simulator (you control one footballer from the U18s to a pro career). The entire game lives in one HTML file; the only other code is the visual test harness under `tests/`.

### Struttura repo (Git)

```
Carrier-manager-/
├── CARRIER-MANAGER-AV.html   ← FILE DI LAVORO ATTIVO (~20 600 righe, tutto qui dentro)
├── MASTER_PROMPT.md         ← ⭐ CHARTER DI GOVERNO: Live Match Quality Platform (LMQP) — vincolante
├── LIVE_MATCH_QA_SPEC.md    ← spec tecnica LMQP (architettura 3.1–3.13 + mappatura sul codice)
├── VALIDATORS.md            ← standard universale + catalogo validator LMV-001..030 (cap. 1, COMPLETO)
├── ROADMAP.md               ← product roadmap LMQP (v1.0 COMPLETO: vision, pillar, SO/KPI, Phase 1–5, M1–M5, sez. 1–13)
├── DEVELOPMENT_RULES.md     ← regole di sviluppo (v1.0, cap. 1–20) + mappatura sul repo
├── ACCEPTANCE_CRITERIA.md   ← checklist di accettazione (v1.0, AC-001..200; target 600–1000 controlli)
├── AI_VISION_REVIEW.md      ← spec AI Vision Review (v1.0, cap. 1–23 COMPLETO; dettaglio del cap. 3.9 della spec)
├── CLAUDE.md
├── CHANGELOG.md
├── LIVE-MATCH-ENGINE.md      ← architettura del motore di partita (pipeline Intent→Decision→Simulation→Animation)
├── docs/                      ← report/roadmap storici del live match
└── tests/
    ├── situations-3d-validation.js   ← regole di validazione SITUATIONS (coerenza HL↔3D) + suite analitica (537 combo)
    └── visual/                        ← QUALITY GATE Playwright (vedi sezione dedicata)
        ├── validate-situations.mjs    ← runner principale del gate (14 categorie)
        ├── golden-sigs.json           ← firme golden (stato) · decision-baseline.json (regressione decisione, LMQP-5)
        ├── checks/                     ← 13 check (… timeline.mjs = LMQP-2/3/5/6 · live-smoke.mjs = ARC-1a)
        ├── lib/                        ← harness + failure-collector.mjs (LMQP-7) + perf-monitor.mjs (LMQP-8)
        ├── report.mjs                  ← report HTML + run-summary.json + LMQP Dashboard (LMQP-9)
        ├── out/                        ← artefatti generati (report.json · run-summary.json · index.html · shots/)
        └── package.json               ← script npm del gate + devDependencies dei bundle CDN locali
```

- **File attivo:** `CARRIER-MANAGER-AV.html` — modificare SEMPRE questo, mai creare file JS separati.
- **Remote:** `antoniovairo-rgb/Carrier-manager-` (GitHub). GitHub Pages serve da `main`.
- Il vecchio archivio `versions\` su disco Windows non è in questo repo; il versioning storico vive nei commit Git e in `CHANGELOG.md`.

## Running the Game

Open `CARRIER-MANAGER-AV.html` directly in a browser — no build step, no server, no install. Tutte le librerie sono da CDN:
- React 18.2.0 (UMD)
- Three.js r128
- Babel standalone (transpila il JSX in-browser al load)

Babel gira client-side al caricamento → ~1–2 s di avvio. Lo spinner (`#ld`) si nasconde via `requestAnimationFrame(window._hide)` dopo il primo render.

> ⚠️ In ambienti con CDN bloccati (es. sessioni cloud con network policy restrittiva) la pagina non carica direttamente: il gate Playwright intercetta le route e serve i bundle dei `node_modules` locali (vedi sezione Quality Gate).

### Build di packaging (Play Store, roadmap 1.1+1.2)

Per il rilascio store serve un artefatto **offline** (niente CDN, niente Babel-in-browser). `node tools/build-dist.mjs` produce `dist/index.html` self-contained:
- **1.1** precompila il JSX offline (`@babel/standalone`, preset react) → niente Babel a runtime;
- **1.2** inlina React/ReactDOM/Three/GLTFLoader/SkeletonUtils dai `node_modules` locali → niente CDN; copia `assets/` + `sw.js`.

Il **sorgente `CARRIER-MANAGER-AV.html` resta INVARIATO** (dev workflow e gate immutati): la build lo legge soltanto. Validazione: `node tools/validate-dist.mjs` serve la dist **bloccando ogni richiesta esterna** e verifica mount React + home + zero CDN + zero errori (prova che è davvero offline). `dist/` è gitignored (riproducibile). Prossimo passo roadmap: **1.3 Capacitor → AAB**.

**Gate de-branding/copyright (roadmap 1.5, BLOCCANTE prima del rilascio store):** `node tools/audit-copyright.mjs` carica il gioco ed esegue `window._auditCopyright()` (scan club/leghe/competizioni/record/nomi contro le blocklist `_CR_BRANDS`/`_CR_PLAYERS`); esce ≠0 se trova riferimenti al mondo reale. Va eseguito e deve dare **0 hit** prima di pubblicare.

## Architecture

Tutto è in un singolo `<script type="text/babel">`. Nessun module system — global scope, dichiarazioni in ordine di dipendenza.

### Layers (top → bottom) — CPM 5.57.0 (~19 500 righe)

| Linea | Contenuto |
|-------|-----------|
| 1–151 | HTML shell, CDN imports, loading spinner, theme constants (`TH`, `TH_DARK`) |
| 152–427 | `AVATARS` + `AvatarSVG` |
| 428–698 | `CLUBS` database (9 leghe), `TeamBadge` |
| 699–712 | `U18_CLUBS` / `U18_CLUBS_P2` (set derivati Lega A / Lega B) |
| 713–851 | `LEAGUE_RECORDS` — record marcatori all-time per lega |
| 852–1618 | `WEEKLY_EVENTS` — eventi narrativi settimanali |
| 1619–2037 | `SITUATIONS` — situazioni di match interattive (**179** validate dal gate) |
| 2038–2090 | `ZONES` — zone del campo |
| 2091–2352 | `BG_MATCH` — cronaca di background (con `momThreshold`, `ctx`, `pd`, pesi `w`) |
| 2353–2638 | Helpers core: `rng`, `clamp`, `pick`, `baseStats`, `calcOvr` (2377), `succRate` (2389), `generateTransferOffer` (2507), `generateProContracts` (2567), `storage` |
| 2639–2681 | `ARCHETYPES`, `GAME_VERSION` (**5.57.0**), `SAVE_VERSION` (**8**) |
| 2682–4531 | `NAME_BY_NAT` (4502) + calendario/roster: `hashStr` (4532), `generateTeamRoster` (4533), `generateSeasonCalendar` (4554), `initStandings` (4715), `updateStandings` (4719), `simulateMatch` (4824) |
| 4860–4904 | UI primitives: `Card`, `Btn`, `StatBar`, `OvrRing`, `Notif` |
| 4905–6708 | Three.js: `makeCrowdTex` (4905), `buildStadium` (5027) |
| 6640–6708 | `hlBallState` (6640), `deriveHL` (6650) — derivazione cinematica HL (vedi CINE) |
| 6709–7727 | **`ThreeMatchView`** — componente React Three.js del match (campo 3D + stadio + 22 giocatori + animazioni). È qui che vivono il render-loop, `animOne`, le animazioni eroe variant-aware, l'off-ball positioning |
| 7728–7968 | `DPad` — pad direzionale touch/mouse |
| 7969–8370 | `MatchdayCard` (7969), `FormationView` (8108), `WalkoutOverlay` (8175) |
| 8371–8441 | `CHAIN_SITS` — situazioni di "secondo tempo" per il chaining |
| 8442–10305 | **`LiveMatch`** — flusso partita completo (state machine, `handleAction`, `handleContinue`, render-loop driver, tick BG) |
| 10306–11196 | `ProTransitionScreen` — schermata fine carriera U18 |
| 11197–12609 | `HomeScreen` (11197), `CreateScreen` (11341), `OffersScreen` (11464), `TrialFlow` (12517) |
| 12610–13080 | `NAT_CLUB_DATA` — nazionali per Coppa/Euro/Mondiale |
| 13081–13372 | `CAREER_MILESTONES` (13081), `TutorialOverlay` (13244) |
| 13373–19793 | **`CareerApp`** — state machine principale della carriera (tabs: dashboard, calendar, standings, training, profile) |
| 19794–19956 | `App` — root router (`phase` state) + `ReactDOM.createRoot` mount |

> I range sono indicativi: il file è grande e in evoluzione. Verifica sempre con `grep -n` prima di editare attorno a un confine.

### State Architecture

Tutto lo stato di gioco vive in un singolo oggetto `player` gestito da `useState` in `CareerApp`. **Autosave** su `localStorage` ad ogni change via `useEffect`. Tre slot: chiavi `cpm-v3`, `cpm-v3-s2`, `cpm-v3-s3`.

Campi principali di `player`:
- **Identità:** `name`, `nation`, `avatarId`, `age`, `position`, `foot` (`"R"`|`"L"` — piede preferito, ~22% mancini, deterministico da nome+nazione; usato dal Decision Engine, vedi F8)
- **Carriera:** `season`, `week`, `weekLived`, `proStatus` (`"u18"`|`"pro"`), `club`, `contract`
- **Stats:** `stats` (8 attributi: `velocità`, `tecnica`, `fisico`, `mentalità`, `tiro`, `passaggio`, `dribbling`, `posizionamento`), `ovr`, `form`, `morale`, `fatigue`, `coachTrust`, `popularity`, `value`
- **Stagione:** `goals`, `assists`, `matches`, `matchHistory[]`
- **Calendario persistente:** `player.calendar[]` — `{matchday,week,opponentId,opponentName,isHome,played,result}`, generato una volta per stagione da `generateSeasonCalendar`
- **Classifica persistente:** `player.standings[]` — azzerata ogni stagione da `initStandings`, aggiornata da `updateStandings`
- **Lifetime:** `totalGoals`, `totalAssists`, `totalMatches`, `history[]`, `log[]`
- **Diario:** `player.diary[]` (max 80) — auto-journal degli eventi salienti
- **Coppa Nazionale:** `player.cup{...}` — bracket completo simulabile
- **Europeo/Mondiale:** `player.euroMondiale{...}` — triggered week 24 ogni 4 stagioni; `type` alterna Europeo/Mondiale ogni 8
- **Obiettivi:** `player.seasonObjectives` — obiettivi club della stagione
- **Infortuni:** `player.injury` (`null` | `{type,severity,weeksRemaining,...}`) — sistema infortuni/recupero
- **Relazioni staff:** `assistantCoachRel`, `fitnessCoachRel`, `teamChemistry` (parziali — vedi nota implementazione)
- **Tutorial:** `player.tutorialDone` — overlay 4-step su dashboard finché non completato/saltato

> **Nota implementazione vs Design Spec:** la sezione "Specifica di Design — Fase 2" più sotto è la *roadmap/direttiva* del proprietario, non lo stato attuale. Implementati e solidi: carriera, partite (live+sim), mercato/contratti, classifiche, Coppa, Euro/Mondiale, training, diario, obiettivi club, tutorial, infortuni (parziale), relazioni staff (parziale). NON ancora implementati (restano roadmap): `matchStatus`/`minutesPlayed` (panchina/convocazioni intelligenti), ritiro precampionato, gerarchie di squadra, obiettivi personali/procuratore, conferenze stampa. Non documentare come "fatto" ciò che non lo è.

`standings` (React state locale in `CareerApp`) deve sempre rispecchiare `player.standings`: chiama `setStandings(newStandings)` accanto ad ogni `setPlayer(p=>({...p, standings:newStandings}))`.

### App Phase Router (`App`)

`phase` guida lo screen: `loading → home → create → trial → offers → career`. Il `career` monta `CareerApp` col player caricato. `phase` **non è persistito** — al reload si riparte da `home` e si carica il player da `localStorage`.

### Match Flow (`LiveMatch`)

Fasi interne: `matchday → formations → walkout → playing → hl_intro → hl_move → hl_choose → hl_result → ended`.

- Le fasi `hl_*` sono **highlights** — momenti interattivi scriptati pescati da `SITUATIONS`.
- Tra un HL e l'altro il clock avanza via `setInterval` (300ms/tick) emettendo cronaca `BG_MATCH`.
- Posizione giocatore `{x,y}` in spazio 0–100; `getZone(x)` mappa le zone; `toThree(gx,gy)` converte in coordinate Three.js.
- Probabilità azione: `succRate(action, stats, playerX, oppPrestige, archetypeId)`.
- `matchContext` distingue career / cup / national / euroMondiale_group / euroMondiale_ko — usato in `onMatchEnd` per il routing post-partita.
- **REGOLA:** ogni competizione è giocabile dall'utente via `LiveMatch` — zero simulazioni forzate.
- `handleAction` risolve la scelta (setta `outcome={text,ok,actionLabel,outKey}`); `handleContinue` avanza all'HL successivo o al background.

### NEXT-GEN LIVE MATCH (4.88.0 → 4.91.0)

Macro fase di rifinitura del match 3D in 4 sprint. Tutti gli interventi sono **visivi/render-loop**, fuori dal path che modifica lo stato salvato.

- **Sprint A — off-ball positioning (4.88.0):** i 22 giocatori si muovono come blocchi reattivi nel render-loop di `ThreeMatchView` — shape-flow dei reparti col pallone, pressing, marcatura goal-side, e **repulsione anti-ammucchiate** (offset sul target del lerp, deterministico). Puramente visivo.
- **Sprint B — locomozione (4.89.0):** `animOne` usa un **crossfade continuo corsa↔idle** via `mesh._runB` (easing accel/decel) al posto della vecchia soglia dura `sp>0.4` che causava "T-pose glide" e snap. Ampiezze gambe/braccia, bob e lean scalano su `rb` (0=fermo→1=corsa); idle-sway svanisce in corsa. Posa a riposo invariata (golden stabili). + **wind-up eroe**: caricamento all'indietro della gamba calciante prima dello swing (shot/cross/penalty/freekick), additivo e auto-azzerante.
- **Sprint C — ripresa (4.90.0):** dopo un gol dell'eroe `handleContinue` instrada a una **ripartenza dal centro** (palla a centrocampo + preset drift `midfield`), riusando i sistemi già testati invece di introdurre una nuova fase nello state-machine (che il gate non coprirebbe).
- **Sprint D — ritmo (4.91.0):** la **densità della cronaca BG scala col momentum** (`_bgProb=0.18+|mom-50|/50*0.12` → 18% in equilibrio, ~30% nei picchi) + **chaining robusto** (regex case-insensitive ampia su palle messe in area + guardia di profondità).

### SIMULATION-FIRST (5.14.0 → 5.37.0) — pipeline `Intent → Decision → Simulation → Animation`

Macro-direttiva: smontare l'accoppiamento *Situation → animazione pre-autorata* perché la cinematica sia **conseguenza della simulazione**, non scriptata. Dettaglio architetturale completo in **`LIVE-MATCH-ENGINE.md`** (tabella componenti + scorecard). I tre pilastri logici (tutti node-testabili, puri):
- **`deriveIntent(sit,act)`** (~1619) — classifica la situation in un **intento** (13 tipi). ⚠️ legge ancora `sit.text` → l'intento NON è ancora text-free (vedi sotto).
- **`decideExecution(intent,ctx)`** (~6918) — **Decision Engine**: da intento + contesto (`attrs/pressure/fatigue/morale/x/weather/foot/side/seed`) decide **esecuzione + esito + qualità** `q∈[0,1]`, seedato/deterministico.
- **`updateFootballState()`** (~7465) — **Football State**: stato continuo (palla/possessore/forma squadra) derivato dalle posizioni reali nel render-loop; sorgente di verità per AI off-ball.

**CINE-DECOUPLE (5.14→5.18):** `deriveHL`/`hlBallState` non leggono più `sit.text` a runtime — la derivazione cinematica è **text-free** (intent strutturale + override `tactic.bs`/`tactic.cn` bakati). I testi delle situations sono liberi *rispetto alla cinematica*, **ma non rispetto all'intento** (deriveIntent li legge ancora — migrazione testi bloccata: servirebbero ~56 override su `deriveIntent`).

**Football State F0–F3 (5.16→5.20):** F1 osservatore inerte → F2 l'AI off-ball legge il **possesso** → F3 target per-giocatore su **possesso+spazio** (smarcamenti, marcatura goal-side, micro-variazione).

**Traiettoria = conseguenza della DECISIONE (F4–F7, F12):** la qualità decisa dal motore (`P.hlQuality`, seedata) plasma pace/precisione/altezza dell'**arco** in `ThreeMatchView`, ritirando gli archi pre-autorati. Coperti: **tiro** (F4), **cross** (F5), **rigore+punizione** (F6), **testa** (F7), **volée aerea/insertion** (F12). Per testa/volée si legge **SOLO la qualità** (variant e stato-palla aereo intatti → invariante CINE preservato).

**Decision Engine — esecuzione completa (F8, F9):** **piede preferito** (F8: `player.foot`, cross/tiro di piede debole sulla fascia opposta → qualità ridotta + bias al taglio interno) e **passaggio** (F9: through/onetwo → profondità scatto + pace, convergenza palla↔ricevente intatta). Esecuzione decisa dal motore ora **completa** su tutte le famiglie offensive.

**AI DELIBERATIVA (F10, F11, F13) — §5, in corso:** nuovi pass nell'off-ball AI di `ThreeMatchView`: **F10** un difensore chiude la *linea di passaggio più pericolosa*; **F11** *press + cover* (raddoppio goal-side) sul portatore nell'ultimo terzo; **F13** il *portiere stringe l'angolo* uscendo verso la palla (CAP entro i bound GK asseriti dal gate). Tutti deterministici, bounded, sospesi sui set-piece.

> ⚠️ **Il gate NON valida il movimento né le traiettorie dal vivo** (cattura frame congelati: stato/coerenza/golden). Le slice F4→F13 sono validate solo per non-regressione + logicamente in node; la resa va **collaudata dal vivo** (specie le AI off-ball F10/F11/F13, che interagiscono). Le posizioni off-ball **non** sono nella firma golden → cambiarle è gate-safe ma cieco.

### Coerenza cinematica HL↔azione (CINE)

- **`hlBallState(sit)`** deriva lo stato reale del pallone: `set_ground` (set-piece battuto dall'eroe) / `aerial` (cross·corner·rimbalzo·rovesciata·stacco·di petto) / `feet` (palla al piede). `deriveHL` lo usa: testa SOLO con palla aerea, volée (`shot_volley`) solo su palla aerea. Invariante: nessun HL mostra testa/volée con palla al piede. Validato dal gate (dimensione **data-coherence**, FAIL bloccante).
- **Animazioni variant-aware (CINE-VAR):** ogni `hlVariant` ha un'animazione eroe fisicamente distinta in `ThreeMatchView`. Invariante `sw=sin(u·π)`: i valori scaled-by-sw si azzerano da soli a u=1; solo gli assegnamenti assoluti richiedono cleanup esplicito a u≥1. Varianti per shot/cross/penalty/header/tackle/dribble/pass/build.
- **`HL_ZONE_COL`** — palette zone-ring per hlType (shot=arancio, penalty=rosso, cross/freekick=ciano, tackle/header=oro, pass=verde-lime, dribble=viola, build=ardesia).
- **Completamento azioni:** `passTargetMesh` + `_rcvT` (compagno che riceve e tira), post-arc `assist_shot`/`cross_goal`/`in_net`/`deflect`/`hit_post`, `gkSaveMesh`/`gk_dive`, intercetti.

### Calendar & Standings Invariants

- `generateSeasonCalendar(playerClub, leagueClubs, seed)` — deterministico, seed `season*777 + hashStr(club.id)`; ~26–28 giornate su 38 settimane con pause.
- `initStandings(clubs)` — a inizio stagione, tutto a 0.
- `updateStandings(standings, playerClubId, result, prestigeShifts)` — dopo ogni giornata, simula le altre coppie con gol pesati per prestige.
- Avanzando oltre una settimana con match non giocato, `simulateMatch` lo auto-risolve e `updateStandings` è comunque chiamata (consistenza).

### Club Data Shape

```js
// CLUBS entry (via helper mkT)
{ id, n, a, p, c, c2, nat, lg }
// id slug · n nome · a abbr 3 lettere · p prestige 0-99 · c/c2 colori · nat flag · lg lega
// U18_CLUBS eredita tutto + isU18:true, name:`${n} U18`, prestige:p-10
```

`getLeagueClubs(player)` ritorna il pool corretto: `U18_CLUBS` se `proStatus==="u18"`, altrimenti i club della lega di `player.club.lg`, con fallback su nazionalità e poi primi 16.

### Three.js (`ThreeMatchView`)

Monta una volta (deps `[]`). Posizione giocatori, zone-highlight e camera-target sono aggiornati via ref (`sr.current`), niente re-render. Lo stadio è costruito una volta da `buildStadium`; le texture folla sono `THREE.CanvasTexture` procedurali da `makeCrowdTex`. `setClearColor(0x050810)` per evitare il flash grigio pre-primo-frame. Il render-loop ospita `animOne` (locomozione di tutti i mesh), le animazioni eroe variant-aware e l'off-ball positioning.

### Calciatori GLB (CH38) — visual & movimento (5.46–5.47)

Dal 5.46 i 22 calciatori sono modelli **GLB reali** (Mixamo CH38) di **DEFAULT** (`window.__CPM_GLB`, `?glb=0`/`localStorage 'cpm-glb'` per spegnere; fallback automatico al procedurale se il GLB non carica). Asset in `assets/` (`footballer.glb` + clip `anim-*.glb` di locomozione, gesti eroe e parate GK). Il modello procedurale (`mkP`) resta come **rete di sicurezza** (nascosto quando il GLB è attivo, ma guida ancora logica/posizione → `_glbDriven`).

- **Gesti (`_mkGestures`):** mappa di clip one-shot (`LoopOnce`+`clampWhenFinished`, peso 0 a riposo) su eroe (kick/penalty/header/tackle/volley da `actType`) e portiere avversario (dive/catch/block da `oppActType`), in crossfade con la locomozione. La traslazione del tuffo GK resta procedurale; il GLB sovrappone gli arti.
- **Step A — Kit (`buildKit`/`resolveKitConflict`):** le mesh CH38 sono **separate** (`Ch38_Shirt/Shorts/Socks/Body/Shoes/Hair`) ma condividono un materiale → ora tinte **per-mesh** (maglia/pantaloncini/calzettoni/scarpe a tinta unita, floor emissivo ~14%). Contrasto garantito tra squadre (maglia away alternativa) + portieri distinti. Pelle/capelli mantengono la texture.
- **Step B — Varietà/identità (`appearanceFromSeed`/`_mix32`):** aspetto deterministico per giocatore (altezza/corporatura/pelle/capelli/calvizie). NPC da `hashStr(club+slot)` → persistente per costruzione (zero save extra); protagonista da `AVATARS[avatarId]` (mai casuale). Limite CH38: volto/occhi/barba non variabili (bakati). Mixer ad avalanche per evitare bucket collassati su seed adiacenti.
- **Step D — Animazione:** blend GLB idle↔corsa da velocità **smussata** (EMA) + crossfade; `run.timeScale` scala con la velocità (anti foot-slide).
- **Step C — Movimento (`animOne`):** off-ball con **bersaglio commesso smussato** (EMA τ≈0.22s) + **modello a velocità con inerzia** (accel/decel, momentum, cap 20 u/s) invece del lerp posizionale verso un target ricalcolato ad ogni frame → niente più zig-zag/micro-correzioni. **Eroe CRISP** (`mesh._isHero`, lerp diretto). Deterministico → firma golden/`determinism` invariata (usa il target *logico* eroe, non le posizioni off-ball). *Il feel dell'inerzia + momentum fisico completo restano da rifinire dal vivo col PO.*

> ⚠️ Tutto il lavoro GLB (kit/varietà/animazione/movimento) vive nel render-loop: il gate gira **GLB OFF** (valida la logica deterministica; `animOne` è comunque esercitato per il movimento) → la **resa** dei kit/varietà/gesti si valida coi frame flag-on (`__CPM_GLB=true`, vedi `tests/visual/glb-*.mjs`) + collaudo dal vivo.

### Motore partita — coerenza / mister / cross / atmosfera (5.47.5–5.47.8)

- **Coerenza cronaca↔highlight (5.47.5):** entrando in `hl_intro` si azzera `bgAction` (React) e si annulla l'arco BG ancora in volo (render-loop) → l'highlight parte sempre dal SUO stato-palla pulito (niente "palla a terra" residua sopra un colpo di testa). ⚠️ Gate-cieco: il gate forza le situation e salta la transizione `playing→hl_intro`.
- **Comunicazioni mister (5.47.6):** `COACH_SHOUTS` + `pickCoachShout` — grida BREVI da bordo campo categorizzate (difensiva/offensiva/possesso/finale) selezionate da minuto+punteggio+tattica(drift)+possesso+momentum, anti-ripetizione, mai durante un HL, bias per stile allenatore. Affiancano gli ordini strategici `COACH_ORDERS` (28/63/75/85').
- **Cross tattico (5.47.7, 1° cut):** corse coordinate in area pattern-aware nel pre-azione (ATT li=8→primo palo, li=10→secondo palo, li=9→dischetto; CEN→rimorchio) + il cross MIRA al miglior ricevente in area (blend 60/40, fallback se vuota). ⚠️ Il blocco-ricevente sta **FUORI dall'`arcBlock`** che la suite `data-coherence` estrae (deve restare matematica pura di traiettoria) — come il ramo `pass`; metterlo dentro rompe `computeArc` (G2X/sr non disponibili nell'eval analitico).
- **Atmosfera (5.47.8):** pubblico reattivo a palo/parata (`crowdOhT`, pulse neutrale ~1.6s) + tensione crescente ≥80' (`_atmoExc`). Procedurale, nessun asset. *Scelta condivisa: niente import di asset 3D pesanti (peso mobile/Play Store) → stadio procedurale rifinito proceduralmente.*

### Movimento, transizioni & avvio highlight (5.47.9–5.47.13)

- **Movimenti più lenti (5.47.9):** ritarati i parametri di `animOne` (cap 20→15 u/s, accel/decel più progressive, eroe ×0.8) + stride GLB più calmo. **Gate:** soglia `alive` del check `motion` ricalibrata 1.0→0.7u + finestra 1000→1300ms (gioco più lento ⇒ misura su finestra più ampia; un giocatore >0.7u/finestra è chiaramente vivo).
- **Bug highlight difensivo (5.47.10):** la sit. "Pressing alto in trequarti" (1803, `type:def`) aveva `rew:"goal"` → palla in porta avversaria. Corretto `rew→recovery` (era l'unica difensiva con `goal`).
- **Parate (5.47.10):** portata del tuffo GK dipende dall'esito (parata → ±9 si distende; gol/fuori → ±6, parata mancata convincente).
- **Transizioni/montaggio = fix "boomerang" (5.47.11):** a fine HL non-gol `handleContinue` non resettava il target palla → scivolava indietro verso l'eroe. Ora: punto di ripresa coerente con l'esito + SNAP palla+formazione + stacco `setCutFx` → regia TV.
- **Avvio highlight = freeze di lettura (5.47.12):** in `hl_choose` i 21 off-ball fermi ~0.9s (`_chooseT`), poi si muovono; eroe libero. **Disattivato sotto `?cpmtest=1`** (`_CPM_TEST`): è presentazione, il gate valida l'AI off-ball che il freeze solo ritarda.
- **Uniformità CH38 — arbitro (5.47.13):** l'arbitro usa lo stesso GLB CH38 (`_mkA` su `refMesh`). Panchina/pubblico restano procedurali per **vincolo performance mobile**.

> ⚠️ Transizioni (`handleContinue`), freeze d'avvio e arbitro GLB **non coperti dal gate** (forza le situation / gira GLB OFF) → collaudo dal vivo; il gate garantisce transpile + non-regressione.

## Quality Gate (tests/visual) — OBBLIGATORIO prima di ogni push

Suite Playwright headless che carica il gioco, forza ogni `SITUATION`, risolve le azioni e valida rendering 3D + stato. **Va eseguita e deve passare 14/14 prima di ogni push.**

```bash
cd tests/visual
# setup una tantum: npm install (Chromium è pre-installato in /opt/pw-browsers nelle sessioni cloud)
CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
npm run validate-situations
```

> **Setup bundle (sessioni cloud con CDN bloccati):** l'harness intercetta le route CDN e serve React/Three/Babel/Phaser dai `node_modules` locali. Le versioni **esatte** che l'HTML fissa sono ora in `devDependencies` (`react`/`react-dom` 18.2.0, `three` 0.128.0, `@babel/standalone` **7.23.6**, `phaser` 3.80.1) → `npm install` configura tutto. ⚠️ Babel **deve** essere 7.x: la 8.x non transpila l'`import` e la pagina non monta.

Le **14 categorie**: `initial-state · orientation · visual · movements · golden · final-state · determinism · post-highlight · data-coherence · timeline · motion · ball-motion · bg-coherence · live-smoke`. Output atteso: `✅ PASS` con tutte verdi (i `warn` non bloccano).

> **`live-smoke` (5.76.0, ARC-1a):** 14° check BLOCCANTE — partita REALE non forzata su pagina pulita (provino → `playing` col clock vero): verifica che il clock avanzi, che la coda degli HL reattivi venga processata (hook `__CPM_QUEUE_REACTIVE`/`__CPM_NUMHL`) e che non ci siano pageerror. È il primo check che ESEGUE il tick di `playing` (dove viveva il soft-lock BLK-1) invece di bypassarlo col force-sit.

### COERENZA & NARRAZIONE (M1–M3, 5.52→5.57) — dal Live Match Manifesto

Sprint di coerenza guidati da `LIVE_MATCH_MANIFESTO.md` + review in `LIVE_MATCH_ARCHITECTURE_REVIEW.md` (piano/test/rischi/decisioni nei doc `LIVE_MATCH_*`). Tutti additivi, deterministici, **nessun bump `SAVE_VERSION`**.

- **M1 · Unified Outcome Model (5.52.0):** su un tiro fallito l'esito granulare (palo/parata/murato/fuori) è deciso **una sola volta** in `handleAction` (`decideExecution`, stesso ctx/seed del render) e salvato in `outcome.outKind`; lo consumano **3D + overlay (`_MISS_OVL`/`hlOverlay`) + cronaca (`_MISS_TX`)**. Fine della divergenza «overlay dice PALO, 3D mostra parata». Invariante di fatto: **overlay-family ⟺ arc-family**.
- **M3 · Coherence Assertion Layer (5.53.0):** `handleAction` emette `cpmEmit("CoherenceCheck",…)`; il check `timeline` del gate **FALLISCE** se overlay-family ≠ arc-family. Cap. 11 del Manifesto tradotto nell'idioma offline (niente validatore runtime auto-correttivo).
- **M2 · Match Memory (5.54.0):** `matchMemRef` (effimero, non salvato) → continuità narrativa nella cronaca: «Si riscatta dopo l'errore», «Doppietta/Tripletta», «Secondo assist», «Il portiere è in serata». Solo eventi realmente accaduti, deterministica.
- **Polish (5.55.0):** P1 niente pallonetto (`shot_chip`) su GK fermo — `gkOut` onesto (peso chip alzato solo in 1v1) + rimappa il chip auto-scelto fuori contesto (flag `?cpmchip=0`); P2 anti foot-slide — la cadenza del passo GLB sale con la velocità reale (flag `?cpmcarry=0`, GLB-only).
- **Logo 3D (5.56.0):** la stella (board competizione + tappeto a centrocampo) è sostituita dal **badge del logo** (`_cvLogoBadge`) e la scritta ELEVORA dal **wordmark** (`_cvWordmark` = elev corsivo + pallone-o + ra), helper canvas che replicano `LogoMark`/`Wordmark`/`BallO`.
- **Cronaca BG coerente (5.57.0):** campo opzionale **`at`** nelle voci `BG_MATCH` → decide label+arco **indipendentemente** da `pd` (che resta per la forma squadra); 18 voci corrette. Nuovo **13° check `bg-coherence`** (lint statico testo↔azione, `window.__CPM_BG`). Timing: il testo BG appare all'**apice esatto** dell'arco (`ATE3_TYPEMS[arco]/2`).
- **cpmadapt — IA off-ball adattiva (5.58.0→5.59.0):** la difesa «si aspetta» lo schema ripetuto e reagisce verso la fascia più attaccata dall'Eroe (Cap. 4.12). `matchMem.byFlank` traccia la fascia (da `pPosRef.current.y` — live). Due effetti: (b) **shading** della linea (`adaptShift` deterministico, **bounded ±6u**) + (c) **pre-copertura**: quando il pattern è marcato (`adaptStr>0.3`), UN difensore pre-occupa il canale preferito (punto goal-side sulla fascia calda, `adaptHotY`). Solo la squadra che difende (mai GK), sospeso sui set-piece. Default ON, **`?cpmadapt=0`** lo spegne. Gate-cieco → feel da collaudare dal vivo; test direzionale `tests/visual/adapt-test.mjs` (linea difensiva +1.99u dx / −1.3u sx, net ~1.5u moderato dalla marcatura reale = realistico).

- **CROWD 2.0 — revisione completa pubblico/stadio (5.74.0):** sistema PARAMETRICO del pubblico secondo il charter proprietario (§1-§11). **`CROWD_CFG`** (~5165, §11: fill per contesto, mix settori, cadenze, capienze — zero valori magici nella logica) + **`computeCrowdContext()`** puro/seedato (`window.__CPM_crowdCtx`) = **unica sorgente** per spettatori (MatchdayCard) e spalti 3D. `makeCrowdTex` v2 (§1): canvas 2048×512 (1024 mobile), colonne ∝ larghezza reale del settore (fine sfocatura da stiramento), LOD in-texture (file frontali grandi/dettagliate → anello alto piccolo/fitto), seduti/in piedi, barbe/calvizie/famiglie/VIP, **sedili del club nei posti vuoti** (affluenza leggibile), applausi desincronizzati, ola solo a stadio caldo (fill≥0.5). `buildStadium`: **2 anelli inclinati** ~33°/42° via il muro piatto (⚠️ tetto a pensilina ARRETRATA: lo sbalzo in avanti copriva l'anello basso dalla camera alta; ⚠️ FIX storico: rotazioni tribune di fondo INVERTITE — fronte verso l'esterno, invisibile coi vecchi box a 6 facce) + **LOD1: prime file di busti InstancedMesh** (≤64/settore, 8 draw call, bob solo nei burst). Distribuzione §5: Curva Sud (x=+, lato tabellone) SOLO casa/ultras+striscioni · Curva Nord (x=-) SOLO ospiti (riempita da `awayFill`: derby piena, provino vuota) · Est casa+famiglie+**spicchio ospiti** (colonne canvas-left = lato Nord) · Ovest famiglie+**box VIP**. Scenografia 3DV-TIFO (bandiere/striscioni/sciarpe in `ThreeMatchView`) **gated dal contesto** (`_tifoHome`/`_tifoAway`: fill≥0.45; fila bandiere extra a intensity≥0.9; tribune SOLO colori casa). **Provini §8:** sempre giorno + meteo sereno/nuvoloso forzati in `LiveMatch`, spalti ~2-3%, zero coreografie. Perf §10: redraw **adattivo** (sparse 420ms / calmo 170 / caldo 110 / burst 33-50 — prima sempre ~33ms), round-robin 1 texture/frame invariato. Hook di collaudo `window.__CPM_CROWD_OVERRIDE`. Test: `tests/visual/crowd-context-test.mjs` (range fill + determinismo) · `crowd-visual-test.mjs` (screenshot derby/campionato/provino) · `crowd-tex-dump.mjs` (dump 2D canvas). Gate-cieco sul rendering → collaudo dal vivo.

- **FASE 2.1 — Micro-simulatore di sfondo (5.77.0, MOT-1/2/4):** la partita attorno all'eroe è simulata. **`bgMicroTick`** (~6311, puro/seedato, esposto su window per i test): per ogni minuto di clock ogni squadra ha una probabilità di GOL da prestigio/momentum/possesso/OVR; seed per (avversario, stagione, settimana). Nel tick di `playing` il sim decide i gol e FORZA la voce di cronaca della famiglia giusta (testo ← esito); il roll ambientale non può più muovere il punteggio (voci `team_goal`/`opp_goal` escluse dal pool; `oppGoalProb` dead-code rimossa). Momentum ora ±10% sul rate (attuatore, MOT-2) e λ del sim mosse da momentum/possesso. Intervallo REALE garantito al 45' (MOT-4, fuori dal roll BG). Baseline: `tests/visual/bg-microsim-test.mjs` (range calcistici + monotonia + determinismo). ⚠️ Feel del punteggio gate-cieco → collaudo dal vivo.

- **FASE 2.2 — Motore d'esito unificato, 1° scaglione (5.78.0, F10/SIT-4/F3/BUG-14):** roll d'esito dell'azione SEEDATO (stessa curva, esito riproducibile — era l'unico Math.random() nudo del loop di gameplay); l'**assist non è più gol garantito**: sui passaggi through/onetwo `decideExecution` decide tra `assist` e **`chance`** (nuovo outcome key, taxonomy timeline aggiornata) → chain di "secondo tempo" sempre iniettata e in 3D il tocco del ricevente RIMBALZA (deflect via `hlOutcomeKind`), niente rete; il **rigore legge le stat** via `decideExecution('penalty')` (angolo scelto = minigame, qualità = motore) ed emette ActionResolved + evento partita; guardia `_chainDepth` reale sul chaining (una catena non può incatenarne un'altra). ⚠️ Conversione G+A attesa in calo (voluto): collaudo dal vivo del feel.

- **FASE 2.3 — Selezione lazy contestuale (5.79.0, SIT-1/5):** la situation di ogni highlight si sceglie **al trigger** col contesto vivo (punteggio/minuto/momentum/possesso come pesi attuatori) invece che tutta al kickoff con ctx neutro. `selectContextualSituations` ha FILTRI DURI: ctx losing/winning coerente, finestre `tactic.minClock/maxClock` (campo nuovo opzionale), niente ripetizioni in-match (`exclude`). Rimosso lo skip su ctx-mismatch che bruciava l'highlight. Sit incatenate (`_chainDepth`) intoccate; extra reattivi/60'/72' su seed deterministici. Trigger lazy esercitato da `live-smoke`; distribuzione percepita gate-cieca → collaudo dal vivo.

- **FASE 3.1 — Le curve contano (5.80.0, BIL-1/2/3a/10 + MIN-8/11 + BUG-11):** la carriera ha una PARABOLA: `trainAgeMult` (×1.0 ≤26 → ×0.06 a 34+) + damper `TRAIN_BASE_EFF=0.40` su entrambi i blocchi training (duplicati: TrainPanel ~13500 + auto-training ~15300) + declino settimanale dai 31 → picco ~90-92 a 29-31 invece di 99 a 22 (simulazione 60 run). `adaptiveDifficulty` solo anti-farm (gpg): via i malus su OVR/morale che azzeravano la crescita percepita. Form ±4% e morale ±2.5% nel roll d'azione; drift morale verso 60; Enfant ×1.35 reale; `calcMarketValue(ovr,età,forma,pop)` settimanale con smoothing 70/30 + fix display ×10 tab agente. ⚠️ Tutto gate-cieco (carriera) → collaudo su run lunga; `runCPMTest50` non simula il training (noto).

- **FASE 3.2 — I soldi esistono (5.81.0, BIL-3b/8a, SAVE_VERSION 8):** `player.bankBalance` accumula lo stipendio (solo pro); l'agente COSTA il 10% del wage; staff personale con effetti reali (`perkTrainer` ×1.10 training · `perkNutrition` recupero 6→8) e sospensione automatica a fondi finiti; pannello 💰 Patrimonio nel tab agente; retrocessione → wage −25% alla nuova stagione. **SAVE_VERSION 8** con migrazione (bankBalance/perkTrainer/perkNutrition), save-compat 12/12. Campi `player` nuovi: `bankBalance`, `perkTrainer`, `perkNutrition`.

- **FASE 3.3 — Conseguenze (5.82.0, BIL-8) + TRAINING AUTO (5.86.0, direttiva PO):** il **rinnovo si può perdere** (`openNegoModal` → step `refused` con trust<40 o riserva+trust<52: svincolo reale, GIOCA bloccato finché non firmi altrove). Il training è **AUTOMATICO by design**: la scelta manuale del focus (BIL-4, 5.82.0) è stata provata e RIMOSSA su direttiva del proprietario («funzionalità noiosa») — piano deciso da mister/preparatori, auto-esecuzione al mount + fallback all'avanzamento; restano curve d'età, perk e moltiplicatori. ⚠️ NON re-introdurre la scelta del training senza direttiva esplicita del PO. Flussi carriera gate-ciechi → collaudo dal vivo.

- **FASE 4.1 — Esiti 3D onesti (5.83.0, IA-1/2/3):** fix reverse-boomerang (pull del deflect verso il terzo offensivo SOLO per conclusioni/cross: il pallone perso a centrocampo si assesta sull'intercetto); i tiri **fuori** superano la linea di fondo (niente rimbalzo-fantasma, niente tuffo del GK sui tiri wide/out); reparto portieri completo: **gk_catch** (uscita in presa sul cross parato — clip GLB `anim-gk-catch` finora mai usata, gesto procedurale nuovo), tuffo sul cross spostato al **2° tocco** (incornata in `cross_goal`), e il **GK di casa si tuffa sul gol subito** (`toOwnGoal`). Tutto render-loop, gate-cieco sulla resa → collaudo dal vivo; bound GK del gate rispettati (tuffo = solo z).

- **FASE 4.2 — Il loop si legge (5.84.0, UX-2/3 — chiude la Fase 4):** probabilità VISIBILI (pallini ●●●○ a 4 fasce sui bottoni azione, mobile+desktop); feedback CAUSALE nell'hl_result (fattore dominante: pressione/fatica/forma/meteo/momentum — `outcome.cause`); result SKIPPABILE su mobile (tap + guardia 800ms, `resultShownRef`); chip energia ⚡ in hl_choose; micro-onboarding nei primi 5 HL del device (contatore `safeLS('cpm-hl-tips')`). Raffinato IA-1: assestamento sull'intercetto solo per outKind di perdita possesso (i "miss" ambigui tengono il pull storico, coerente col check final-state). UI-only → collaudo dal vivo.

- **FASE 5.1 — Store hardening (5.85.0, ARC-5):** tutti gli ingressi del test-mode (`_SIT_TEST`, `_CPM_TEST`, reseed di Math.random, probe/hook 3D, `runCPMTest50`/`cpmDebugSimulate`) sono SPENTI sotto `window.__CPM_STORE_BUILD` (iniettato nell'`<head>` della dist) — web e gate invariati. Filiera store verificata in sessione: build-dist ✅ · validate-dist offline ✅ · audit-copyright 0 hit ✅. **BLK-3:** l'AAB va compilato in locale (niente Android SDK in cloud): `npx cap add android && npx cap sync && gradle bundleRelease`.

- **Collaudo PO — triplo fix (5.92.0):** (1) **tifosi in proporzione**: `makeCrowdTex` accetta `spec.rowsMul` e `buildStadium` deriva le file per settore dall'altezza REALE della tribuna (`_rowsFor92`: curva mono-anello ~1.6×, scala con `hMul`) → figure più piccole/fitte sulle curve giganti; (2) **suspense sull'esito**: `resultReveal` state + `outcome.revealMs` (gol/assist/chance 1250ms · conclusioni 1100 · resto 850 · rigore 1000) — prima gioca il 3D, poi overlay+cronaca+flash appaiono INSIEME (strip «⏳ azione…» nell'attesa; tap-guard shiftato di revealMs; auto-advance compensa SOLO metà reveal con cap 950ms — durata result sempre <4000ms, guardia UX del check post-highlight); (3) **varietà per club nello stesso template**: jitter deterministico in `stadiumConfigFor` (standH ±10%, dist ±8%, `roofTone` ×3, `wallTone` cemento caldo/freddo, angoli closed→curve per 1/3 dei club) consumato da `buildStadium`, + pool Deutsche Liga = tedesco/tedesco/moderno_it/comunale. Verifica: 10 club tedeschi → 10 firme visive uniche; screenshot per template OK. ⚠️ Suspense e proporzioni percepite = collaudo dal vivo.

- **STADI DINAMICI — S1 fondamenta (5.87.0):** design in **`docs/STADIUM_SYSTEM_DESIGN.md`** (approvato dal PO: 3 slice · MAI pista d'atletica · trasferta invertita in S3 · evoluzione automatica). S1 = strato dati: `STADIUM_TEMPLATES` (10 preset) + `STADIUM_LG_TPL` (14 leghe→template) + **`stadiumConfigFor(club,evo)`** puro/seedato (capienza stabile per club dalle bande PO, nome stabile, evoluzione derivata, override data-driven `club.stadium{...}`) → alimenta `computeCrowdContext` (prima la capienza cambiava a ogni partita). Zero cambi visivi in S1. Test: `tests/visual/stadium-config-test.mjs`. **S2 (5.88.0) — assemblatore:** `buildStadium` consuma il config → 10 template visibilmente diversi con gli stessi componenti (anelli 1-3, curva-muro tedesca, asimmetria sudamericana, tetti per settore, 4 stili di torri, recinzioni, LED, insegna nome, 2° schermo, dugout; via il perimetro arancio da pista). Fallback legacy esatto senza `tpl`. Hook collaudo `__CPM_STADIUM_TPL_FORCE`; screenshot per template: `stadium-visual-test.mjs` → `out/stadiums/`. ⚠️ NON spostare il tabellone dal lato Sud (definisce la Curva Sud del charter pubblico). **S3 (5.89.0) — atmosfera/evoluzione:** trasferta invertita verificata (già garantita da `homeTeamObj`/`hClub` = padrone di casa reale); `atmo` per club (0.75–1.22, template caldi +0.10) scala l'intensità del tifo; config calcolato in `LiveMatch` con `clubPrestigeShifts` (evoluzione automatica pluriennale) e passato via `crowdCtx.stadiumTpl`; diario «Il club amplia lo stadio» alla promozione. SISTEMA STADI COMPLETO (S1+S2+S3).

- **BIL-9 — Eventi a bivi (5.91.0):** gli impulsi interattivi (`WEEKLY_IMPULSES`, pool 36→48) escono anche nelle settimane di partita (~25%); le scelte muovono soldi veri (`ef.bank`→`bankBalance`) e chimica (`ef.chem`); +12 dilemmi con trade-off reali. + **5.90.0**: hotfix curva bianca (arg spurio in addStand), palla TRA I PALI in in_net (conv. z prima della linea), pad-scudo disabilitato a mosse esaurite (l'unmount faceva partire azioni da sole), duello dribbling (uomo saltato → chain `dopo_dribbling`), FORCE_SIT riazzera situations (chain splice → falsi FAIL timeline, visto anche in CI).

- **AUDIT COMPLETO + FASE 0 «Pronto soccorso» (5.75.0):** audit totale del progetto in **`docs/AUDIT_COMPLETO_2026-07.md`** (16 sezioni, ~60 findings, 18 bug confermati, voti per macro-area, roadmap Fasi 0–5 — **è la mappa di lavoro delle prossime fasi**). La Fase 0 chiude i fix chirurgici: **BLK-1** soft-lock `_sctx76` (variabile fuori scope nel tick → ReferenceError = clock congelato al primo HL reattivo); **BUG-2** U18 season-end `>=38`→`>38` (l'ultima giornata non giocata spariva); **UX-1/BUG-9/10** `startHL()` unico punto d'ingresso nell'highlight (lo skip «0» da `playing` bypassava il routing → DPad/mosse stantie — era il bug «cursore fuori contesto» segnalato dal PO; il tap-skip ignorava `cappedMM` e non resettava `defDist`) + `showDPad()` condizione unica sui 4 mount + rimosso il pad fantasma; **BUG-3** `fxTimeout`/`fxTimersRef` + cleanup su unmount di LiveMatch; **BUG-4** dispose profondo Three.js a fine partita (texture canvas + geometrie procedurali; geometrie GLB condivise con `_glbCache` ESCLUSE di proposito); **BUG-5/17** `safeLS` (localStorage sempre guardato, il boot non muore più con storage disabilitato) + try/catch su `WebGLRenderer` con fallback leggibile + **flush del save su `pagehide`/`visibilitychange`**; **SIT-2** data-fix delle 15 Situations con azione-gol strutturalmente irraggiungibile (sostituite con assist/recovery a **stat invariata** → intent stabili, o label riclassificata: punizione «Bordata» → classe tiro da fuori ≥62); **BUG-12** «Sotto 0-2»→«Sotto nel punteggio»; **BUG-13** `ZONES.fascia` documentata (zona autoriale trigger `cross` in deriveIntent/deriveHL, range `[-1,-1]` → `getZone` invariato). ⚠️ Le parti gate-cieche (skip tastiera, tap-skip, fallback WebGL, flush) vanno collaudate dal vivo.

- **Highlight difensivi — esito realistico e VARIO (5.65.0):** un intervento difensivo non ha più come default il rinvio lungo di 70-80m verso la porta avversaria (effetto «ping-pong»). Nuovo motore puro/deterministico **`resolveDefensiveOutcome(ctx)`** (accanto a `decideExecution`, ~5901): dato `{success,x,y,pressure,attrs,foot,seed}` sceglie in modo PESATO uno tra ~10 esiti — `intercept_keep`/`tackle_win` (possesso al piede), `pass_start` (avvio dal basso), `counter` (ripartenza), `short_clear`, `safe_clear` (spazzata lunga), `throw_in`, `corner_conceded`, `loose_second`, `beaten` — ognuno con un **descrittore di traiettoria** (`dx/wide/side/seekMate/toTouch/toGoalLine/arcH/arcDur`). La spazzata lunga è **eccezionale** (peso basso; sale solo sotto forte pressione/scarsa compostezza; va LARGA sulla fascia; capata a **x≤68** → mai verso la porta avversaria). Deciso UNA volta in `handleAction` (M1: seed stabile → coerenza 3D/overlay/cronaca), passato come prop **`hlDefTraj`**; il **post-guard universale** in `ThreeMatchView` (`if(P.hlDef&&ballArcActive)`) lo mappa su posizioni VIVE (`seekMate` aggancia un compagno reale per passaggio/contropiede) e il **post-arco difensivo è ISOLATO** dalla macchina gol/parata (mai palla in rete avversaria, mai parata sulla propria porta). `hlDef` ora copre OGNI intervento difensivo (`type:"def"` **o** contrasto risolto che non vale gol/assist), non più solo `type:"def"`. Cronaca coerente per rimessa/angolo/ripartenza/spazzata. Gate 13/13 verde (fingerprint invariato — traiettoria gate-cieca). Test: `tests/visual/defensive-outcome-test.mjs` (distribuzione: 10 esiti, spazzata 11% globale → 3.8% bassa / 23% alta pressione) + `tests/visual/defensive-live-test.mjs` (dal vivo: palla difensiva sempre x<75, spread ~19u).

**Test dal vivo:** `tests/visual/live-match-test.mjs` (non-gate, GLB-ON) verifica la coerenza M1 overlay⟺esito su un campione di tiri falliti + screenshot full-page; `tests/visual/glb-gesture-smoke.mjs` per i gesti GLB. Le parti gate-cieche (movimento, camera, cronaca BG live, cerimonia) si collaudano così.

> **Quick-gate (`npm run quick-gate`, ~1.5 min):** gate **leggero** per iterare veloce in sviluppo (`tests/visual/quick-gate.mjs`). Campiona ~26 Situations sui check di stato (`initial-state/orientation/visual/movements/golden`) + `determinism/final-state/timeline/data-coherence`; **salta** i sampler lenti (`motion/ball-motion/post-highlight/perf/ai-vision`). Riusa harness + gli stessi `checks/*.mjs` → zero duplicazione. ⚠️ **NON sostituisce** il gate completo: `validate-situations` (14/14) resta **obbligatorio prima di ogni push**. Usa il quick-gate per il loop di sviluppo, il gate completo come gate di rilascio.

- **`golden`** confronta una **firma di stato** `{htx,hty,cam,ch,ca}` (target logico eroe + camera + conteggi) — **NON** le posizioni off-ball (escluse di proposito). Quindi cambiare il posizionamento off-ball è gate-safe (golden invariato); se cambi l'estetica/setup che tocca la firma, rigenera con `npm run validate-situations:update-golden` e committa.
- **`initial-state`/`orientation`** asseriscono la **posizione dei portieri** (home GK x≤25, away GK x≥75, home<away): muovendo i GK resta entro questi bound (vedi F13, CAP 80/20).
- **`determinism`** verifica che il setup di ogni situation sia riproducibile — evita di far dipendere il *setup/rendering* da `Math.random()` non seedato.
- **`data-coherence`** applica le regole di `tests/situations-3d-validation.js` (l'invariante CINE header⇒aerea è un FAIL con `exit 2`).
- **`timeline`** (LMQP-2/3/5/6) consuma il bus eventi osservabile **`window.__CPM_TIMELINE`** (LMQP-1, vedi sotto) raccolto nella passata force+resolve: verifica il backbone narrativo per-highlight (`HighlightForced → ActionResolved` con intent valido/coerente + outcome key), gli **invarianti CINE sulla decisione live** (LMQP-3: testa/volée⟹aerea, set-piece⟹palla ferma), la **regressione della decisione** vs `decision-baseline.json` (LMQP-5) e la **semantica dell'esito** (LMQP-6: outcome key noto + `ok ⟺ key di successo`, taxonomy goal/assist/save/recovery vs miss/intercept/goal_against/…). Primo gradino del Semantic/Narrative Validator (LMQP-SPEC 3.4).
- Il gate **forza le situation direttamente** (bypassa `handleContinue`/selezione HL): modifiche a ripresa, chaining-trigger, densità BG e selezione HL **non sono coperte** → trattale come a rischio e testale dal vivo.
- **Rete bloccata (cloud):** il runner intercetta le route CDN e serve React/Three/Babel dai `node_modules` locali, così il gate gira anche senza accesso ai CDN.

**AI Vision Review (framework provider-based, `tests/visual/lib/vision/`):** revisore percettivo di **secondo livello** (non blocca MAI la CI). Architettura Open/Closed `VisionProvider`→`VisionReviewEngine`→`ProviderRegistry`; provider **Ollama** (1°, locale + cloud via `OLLAMA_API_KEY`), Anthropic, OpenAI/Gemini predisposti. Runner standalone `npm run ai-vision` (cattura Playwright multi-fase → engine con cache/dedup/retry/fallback/Failure-Package → scoring Quality/Confidence/Severity/Priority/verdict → report HTML+`ai-vision.json`). Config via `tests/visual/.env` (vedi `.env.example`; `.env` è gitignored). Test: `npm run test:vision` (28). Il gate riusa lo stesso engine via `lib/ai-vision.mjs` (adattatore) e fa **skip pulito** se il provider è giù. ⚠️ Ollama Cloud (`ollama.com`) può essere bloccato dalla network policy dell'ambiente cloud (403 al proxy) → eseguire in locale o allowlistare l'host.

**Artefatti del gate (LMQP-7/8/9, in `out/validate/`):** oltre a `index.html`/`report.json`, ogni run produce **`run-summary.json`** (LMQP-7, *Failure Collector* — `lib/failure-collector.mjs`): pacchetto compatto machine-readable con esito globale, per-check pass/issue/warn, `failures[]` normalizzate `{check,gi,msg,situation,intent,shot}`, `coverage`, `baseline` drift, `performance` e un **fingerprint deterministico** (dedup/trend). Il **Performance Monitor** (LMQP-8, `lib/perf-monitor.mjs`) misura load-time/JS-heap/frame-timing col render-loop attivo — **warn-only/informativo** (FPS headless = software-rendered, no GPU → soglie su floor headless-realistici, mai FAIL). Il report HTML include la **LMQP Dashboard** (LMQP-9): griglia degli 12 check, coverage a chip, perf, baseline e tabella failure. Tutti additivi (solo harness → gate-safe). Il CI carica l'intera `out/validate/` come artifact.

> **LMQP-1 — Event + Timeline layer (5.35.0):** primo mattone implementativo della piattaforma LMQP. Bus eventi osservabile nel gioco (`cpmEmit` → ring buffer `MATCH_TL`, probe `window.__CPM_TIMELINE()`/`__CPM_TIMELINE_RESET()`): registra `MatchStart · HighlightForced(intent,zone) · ActionResolved(intent,label,ok,key) · HighlightAdvance`. Opt-in/sicuro (solo push + try/catch → nessun impatto su stato/render, gate-safe). È la sorgente per il check `timeline` (LMQP-2) e per i futuri Replay/Semantic/Narrative validator (`LIVE_MATCH_QA_SPEC.md` 3.4/3.5).

## Key Patterns

- **No build tool:** edit diretti nel `.html`. JSX valido dentro `<script type="text/babel">`.
- **Coordinate:** logica `{x:0–100,y:0–100}`; mondo Three.js `{x:-50..+50, z:-30..+30}`.
- **Random seedato:** usa `hashStr` + aritmetica per tutto ciò che deve essere riproducibile tra save. `rng()`/`pick()` solo per eventi one-off. ⚠️ Mai far dipendere setup/render dal random non seedato (rompe `determinism`/`golden`).
- **Save compat:** incrementa `SAVE_VERSION` aggiungendo campi obbligatori; aggiungi migration backward-compat nel `useEffect(()=>{...},[])` di `CareerApp` che rileva/riempie i campi mancanti (`calendar`/`standings`/nuovi campi). Ultimo bump: **v7** (campo `foot`, F8 5.29) — pattern: `if(!('foot' in newP)){newP={...newP,foot:...};changed=true;}`.
- **Versioning:** bump `GAME_VERSION` ad ogni push (anche fix minori), con commento sintetico di cosa cambia.
- **File unico:** mai creare file JS separati per il gioco.

## Studio Framework — AAA Game Dev Team

Ogni sessione di lavoro segue questo framework multi-disciplinare. Workflow sempre: **Audit → Implement → QA** — nessuna modifica senza prima un audit esplicito.

### Workflow obbligatorio

```
1. AUDIT     — leggi il codice interessato, identifica dipendenze e rischi
2. IMPLEMENT — applica le modifiche minime necessarie, nessuna feature extra
3. QA        — gate 14/14 verde + verifica mentale: regressioni? salvataggio? mobile? performance?
```

Prima di ogni modifica: leggere le righe coinvolte, dichiarare le dipendenze note, elencare i rischi. Solo dopo procedere.

### I 10 Agenti

| # | Ruolo | Responsabilità |
|---|-------|---------------|
| 1 | **Game Director** | Visione, priorità sprint, decisioni di design finali |
| 2 | **Lead Engineer** | Architettura React/JS, state machine, save system |
| 3 | **Match Engine Dev** | `LiveMatch`, HL system, `BG_MATCH`, chaining |
| 4 | **3D/Graphics Dev** | `ThreeMatchView`, `buildStadium`, `makeCrowdTex`, `animOne`, CINE |
| 5 | **UI/UX Designer** | Layout mobile-first, theme (`TH`), componenti (`Card`, `Btn`) |
| 6 | **Data Designer** | `CLUBS`, `SITUATIONS`, `WEEKLY_EVENTS`, `BG_MATCH`, bilanciamento |
| 7 | **AI Systems Dev** | oppTactic, scoutReport, momentum, call-up logic |
| 8 | **QA Engineer** | Gate visivo, regressioni, compat save, edge case, mobile |
| 9 | **DevOps** | Git, versioning (`GAME_VERSION`), deploy GitHub Pages |
| 10 | **Product Manager** | Sprint planning, changelog, backlog utente |

### Regole del team

- **Nessuna modifica senza audit.**
- **Aggiornare `CLAUDE.md`** ad ogni sprint significativo (range linee, nuovi sistemi, campi `player`).
- **Bump `GAME_VERSION`** ad ogni push.
- **Gate 14/14 verde** prima di ogni push — il QA Engineer valida ogni sprint.
- **Branch workflow:** sviluppo sul branch di lavoro corrente (attuale: `claude/play-store-readiness-audit-vjn2xz`), poi promozione su `main` (produzione/Pages → GitHub Pages) SOLO dopo gate 14/14 verde: `git fetch origin main && git checkout -B main origin/main && git merge --ff-only <branch> && git push origin main && git checkout <branch>`. Branch storici: `claude/play-store-readiness-audit-waq8cb`, `claude/ai-vision-first-run`, `claude/cpm-resume-work-71ntrj`, `claude/continue-work-y3mh4y`.
  - **`main` solo su autorizzazione esplicita del proprietario** — mai in automatico dopo un singolo sprint senza via libero.
- **Annunciare sempre** "Pushato su GitHub — CPM x.y.z." dopo ogni `git push`.
- **Zero regressions · Minimalismo · File unico.**

### Sprint format

Ogni sprint ha: obiettivo, lista task numerata, agent assegnato per task, criteri QA (gate compreso).

---

## Specifica di Design — Fase 2 "Feature Complete" (ROADMAP / direttiva)

> Questa sezione è la **roadmap** vincolante per i prossimi sprint, NON lo stato attuale. Vedi la nota in *State Architecture* per cosa è già implementato.

### 8. Gestione Intelligente delle Convocazioni e delle Sostituzioni

Il giocatore **non deve essere automaticamente titolare**. L'allenatore decide su: OVR vs compagni di ruolo, `form`, `fatigue`, `coachTrust`, prestazioni recenti (`matchHistory`), importanza partita, infortuni rosa, ruoli d'emergenza.

Esiti: `"starter"` | `"bench"` | `"not_called"`. Esperienza panchina (visione + riscaldamento + istruzioni + ingresso a 46'/60'/70'/80'). Sostituzioni in-match (tattica/stanchezza/rendimento/infortunio/gestione risultato). Comunicazione allenatore sempre motivata, mai percepita casuale.

Nuovi campi richiesti:
```js
player.matchStatus    // "starter"|"bench"|"not_called"
player.minutesPlayed  // minuti giocati nella partita corrente
```

### 9. Vita da Calciatore e Carriera Evoluta

- **9.1 Ritiro precampionato** (settimane -2/-1): allenamenti, amichevoli, guadagno fiducia, gerarchie iniziali.
- **9.2 Gerarchie:** `U18 → Primavera → Riserve → Titolari → Leader spogliatoio` — influenza minutaggio, convocazioni, crescita, rinnovi.
- **9.3 Rapporti staff/compagni:** `coachTrust` (presente), `assistantCoachRel`, `fitnessCoachRel`, `teamChemistry` (0-100).
- **9.4 Conferenze/interviste:** scelte di dialogo (diplomatico/ambizioso/critico) → impatto su `popularity`, `coachTrust`, `teamChemistry`, stampa.
- **9.5 Mercato:** `loan` / `loan_with_option` / `loan_with_obligation` / `sale`, richieste di trasferimento, promesse allenatore.
- **9.6 Infortuni e recupero:**
```js
player.injury = null | {
  type:"muscolare"|"articolare"|"frattura"|"botta",
  severity:"lieve"|"medio"|"grave",
  weeksRemaining:number, recoveryPct:0-100, relapse_risk:0-1
}
```
Tempi 1-2 / 3-5 / 6-12 settimane, riabilitazione, rischio ricaduta, rientro graduale.
- **9.7 Obiettivi stagionali:** club (`seasonObjectives`, presente), personali (`{type:"goals_personal",target:N}`), allenatore, procuratore.
- **9.8 Premi:** Miglior Giovane, Capocannoniere (presente), Squadra dell'Anno, Pallone d'Oro (presente), MVP.
- **9.9 Vita dinamica:** notizie mercato settimanali, risultati altri campionati in dashboard, record real-time, rivalità/derby (Clasico, Derby della Madonnina, ecc.).

### 10. Test di Realismo della Carriera

Simulare ≥10 stagioni complete su profili campione/promessa/medio/riserva. Criteri: niente titolare troppo facile (2-3 stagioni da riserva), crescita OVR credibile (50→85 in 8-10 stagioni), convocazioni coerenti con `coachTrust`/form, sostituzioni coerenti col momento, scelte allenatore sempre motivate.

### 11. Stabilità, Qualità e Assenza di Regressioni

**Principio cardine: stabilità > nuove feature.** Ogni feature aumenta la profondità senza introdurre bug.

**Invarianti da proteggere:** state machine `CareerApp`, partite (`LiveMatch`/`simulateMatch`), mercato/contratti, statistiche, classifiche, Coppa, Euro/Mondiale, training, progressione (`calcOvr`), save backward-compat, generazione news/cronaca/highlights/IA.

**Suite di non-regressione (oltre al gate visivo):**
1. Babel transpile check (implicito: se il gate carica il gioco, transpila)
2. Nuova carriera → genera calendario + standings
3. Caricamento save esistente → migrazione campi mancanti
4. Avanzamento 5+ settimane senza crash
5. Partita completa giocata (`LiveMatch` fino a `ended`)
6. Inizio nuova stagione → promozioni/retrocessioni + spot europei

**Approccio:** step piccoli e verificabili (≤300 righe/sprint), validare ogni modifica col gate, correggere subito le regressioni. Priorità assoluta: **stabilità > feature**.
