# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **⭐ Charter di governo:** `MASTER_PROMPT.md` definisce la **Live Match Quality Platform (LMQP)** — i principi vincolanti (QA First · No Blind Fix · Zero Regression · Determinism First · «Every Highlight Must Tell a Story») e i 4 livelli di qualità. Ogni lavoro sul Live Match Engine vi si conforma. Il *quality gate* (sezione dedicata) è l'attuale implementazione di LMQP.

## Protocollo operativo (sempre attivo)

Queste sei regole valgono a **ogni turno** e per questo stanno qui invece che in una skill (una skill si
carica su richiesta; questa disciplina no). Il playbook esteso di ciascuna sta nella skill indicata.

1. **Pianifica prima di toccare.** Dichiara file, punto d'intervento, cosa cambia e **cosa resta fuori
   ambito**. Nessun refactoring non richiesto. → skill `architect`
2. **Leggi il minimo.** `grep -n` sul simbolo → `Read` con `offset/limit` sul solo intorno. Mai leggere
   interi `CARRIER-MANAGER-AV.html` (33.902 righe), `docs/RELEASE_HISTORY.md` (292 KB), `VALIDATORS.md`
   (100 KB), `LIVE_MATCH_QA_SPEC.md` (56 KB): si cercano. → skill `minimal-context`
3. **Modifica per patch.** `Edit` con ancora univoca, o script con `assert s.count(old)==1`. Mai rigenerare
   un file. Mai un'ancora che è la riga di firma di un componente. → skill `patch-only`
4. **Esegui ed emetti al minimo.** Tool indipendenti in parallelo in un solo messaggio; non ri-leggere ciò
   che hai appena scritto; non ripetere a parole ciò che il tool ha già mostrato; delega a un subagent il
   lavoro che produce molto materiale e poca conclusione. → skill `token-optimizer`
5. **Misura, non indovinare.** *No Blind Fix*: misura la causa → correggi → ri-misura → lascia un guardiano
   permanente. Un difetto che si ripresenta due volte merita sempre una probe nuova. → skill `game-qa`
6. **Non chiudere senza il rituale.** Gate 14/14 · guardiani se l'area li richiede · bump versione · commit ·
   push · promozione su `main`. → skill `production-ready`

### Le 10 Project Skill (`.claude/skills/`)

| Skill | Quando |
|---|---|
| `architect` | prima di ogni modifica: piano, ambito, chokepoint |
| `minimal-context` | quando devi trovare qualcosa nel file da 33.902 righe |
| `token-optimizer` | quando la sessione si allunga o l'output cresce |
| `patch-only` | ogni volta che scrivi nel file di gioco |
| `game-qa` | **router**: ho toccato X → quali suite lancio |
| `auto-regression` | carriera, tornei, economia, migration, salvataggi |
| `performance-analyzer` | render-loop, allocazioni, memoria, mobile |
| `production-ready` | checklist finale prima di push e promozione |
| `realism-reviewer` | «sembra davvero una partita di calcio?» |
| `ui-reviewer` | schermate, mobile, leggibilità, dark mode |

## Project Overview

**Career Player Manager (CPM)** is a single-file browser game — a football *player*-career simulator (you control one footballer from the U18s to a pro career). The entire game lives in one HTML file; the only other code is the visual test harness under `tests/`.

### Struttura repo (Git)

```
Carrier-manager-/
├── CARRIER-MANAGER-AV.html   ← FILE DI LAVORO ATTIVO (~21 700 righe, tutto qui dentro)
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
├── MATCH_ENGINE_REDESIGN.md  ← ⭐ RIPROGETTAZIONE motore+situations (direttiva PO priorità assoluta): analisi W1-W5, blueprint 9 moduli, roadmap R0-R5 (R0 = Live Match Validator PRIMA di toccare il motore)
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
        ├── career-invariants.mjs       ← ⭐ guardiano REGRESSIONE CARRIERA (non-gate, PRIMA di ogni push su carriera): INV leghe/calendario/standings/pro/migration/euroGroupTable/prestito/forma
        ├── stab-nat-trigger-test.mjs   ← ⭐ trigger tornei Nazionali (determinismo/idempotenza) + economia settimanale (STAB-2/7/8)
        ├── career-sim-test.mjs         ← simula N stagioni sugli handler VERI (`__CPM_CAREER`)
        └── package.json               ← script npm del gate + career-invariants/stab-nat-trigger/career-sim + devDependencies dei bundle CDN locali
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

### Layers (top → bottom) — CPM 6.45.0 (~21 800 righe)

> ⚠️ **I numeri di riga qui sotto sono STORICI (era ~19 500 righe) e sono DERIVATI ORMAI di parecchie centinaia di righe** dopo gli sprint 6.9→6.37 (UX/UI overhaul + stabilizzazione carriera). Sono utili solo come *ordine* dei layer: **verifica SEMPRE con `grep -n`** prima di editare attorno a un confine. La versione/size corrente è quella del titolo.

| Linea (storica) | Contenuto |
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
| 2639–2681 | `ARCHETYPES`, `GAME_VERSION`, `SAVE_VERSION` — ⚠️ **i valori si leggono col grep, non qui**: `grep -o 'const \(GAME\|SAVE\)_VERSION=["0-9.]*' CARRIER-MANAGER-AV.html`. Questa riga ha dichiarato 6.45.0 e SAVE 8 mentre il codice era a 7.345 e 9. |
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
>
> ⭐ **DIRETTIVA PO (2026-07-29, dopo il batch 7.244): «i test devono essere SEMPRE fatti con CH38 altrimenti si rischia di prendere cantonate».** Ogni verifica PERCETTIVA (fogli-provini, screenshot di gesti/pose/scene) va fatta **GLB-ON** — le pose procedurali CINE-VAR sono INVISIBILI sotto il CH38, dove parlano solo le CLIP (`_gName`/`_mkGestures`): un'intera classe di 26 bocciature («non si vede il gesto tecnico finale», 7.242→7.244) è nata da verifiche GLB-OFF. Strumenti: `vision-contact-sheets.mjs` con **`VS_GLB=1`** + hook `__CPM_GST` (stato gesto GLB dell'eroe, solo `__CPM_REC`). ⚠️ In headless GLB-ON il tempo-scena scorre a ~1/10-1/30 del reale (cap su aDt a fps bassissimi): i TEMPI non sono giudicabili a occhio — misurare le DURATE delle clip (`loadGLB(...).animations[0].duration`) contro la finestra `actType` (`_T`), come nel fix 7.245.0 (anim-tackle 2.71s vs finestra 1.7s → timeScale 1.75).

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

> ⚠️ **Il gate visivo è CIECO sulla logica di CARRIERA** (forza le situation, non gioca la carriera). Per QUALSIASI push che tocca il layer carriera (avanzamento settimana, classifiche, tornei, economia, mercato, migration, transizione pro) esegui ANCHE i guardiani di regressione carriera introdotti con la stabilizzazione 6.32→6.37 — sono ciò che intercetta la classe di bug che il gate non vede:
> ```bash
> cd tests/visual
> CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node career-invariants.mjs      # INV puri (leghe/calendario/standings/pro/migration/euroGroupTable/prestito/forma)
> CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stab-nat-trigger-test.mjs   # trigger tornei + economia settimanale
> CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node career-sim-test.mjs         # 2 stagioni sugli handler veri
> node tripath-chokepoint-test.mjs                                                         # GUARDIANO TRI-PATH (statico, no browser): i 3 path settimana delegano a OGNI chokepoint (economia/crescita/staff/tornei) → blocca strutturalmente la classe STAB
> ```

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

### Il gate dice dove vanno i suoi minuti (7.343.0)

Ogni run stampa la ripartizione per fase e la scrive in `run-summary.json` (`meta.timings`). Prima di
ottimizzare il gate, **guarda quella tabella**: la prima misura ha spostato l'attenzione da dove tutti la
mettevano (le 191 situations) a dove il tempo andava davvero — 33% speso ad aspettare la palla ferma, con un
criterio irraggiungibile. L'attesa di assestamento è l'helper condiviso **`waitBallSettle`** in
`lib/harness.mjs`: usato sia dal gate sia dal quick-gate, dove il codice era duplicato riga per riga.

## Cronologia delle release → `docs/RELEASE_HISTORY.md`

Le **265 voci** di storia (5.x → 7.x: sintomo → causa misurata → correzione → guardiano) vivevano qui dentro:
**305 KB caricati a ogni turno**, ~76.000 token di storia pagati anche quando la storia non serviva. Ora stanno
in **`docs/RELEASE_HISTORY.md`** e non costano nulla finché non le si cerca:

```bash
grep -n "7.203" docs/RELEASE_HISTORY.md            # cosa è cambiato in una release
grep -n -i "portiere\|boomerang\|falso gol" docs/RELEASE_HISTORY.md   # storia di un difetto
```

**Dove va scritta una release nuova:** in `docs/RELEASE_HISTORY.md` e nel commento di `GAME_VERSION`.
In CLAUDE.md **solo** se cambia il modo di lavorare o introduce un invariante nuovo — e una riga, non un
paragrafo. È così che questo file è arrivato a 343 KB.

**Invariante «un gol dichiarato ha sempre la sua conclusione giocata» (7.460.0):** `npm run goal-postarc` — guardiano NON-gate sul flusso vero; il gate e' cieco (forza le situation). Giudica due classi strutturali (conclusione mai partita · arco atterrato fuori scena senza post-arco) e **dichiara senza giudicare** il residuo «finestra d'esito chiusa con l'arco ancora in volo», che e' una precedenza fra la finestra (`setTimeout`, tempo reale) e la catena cinematica (clock di scena, `dt` tappato a 0.05): a fps bassi — headless **e telefono lento** — il clock di scena avanza meno della meta' del reale. Prova del rosso: `__CPM_NO460` (classi A/B) e `__CPM_NO461` (classe C). **Dal 7.461 la precedenza e' decisa dal PO: comanda la SCENA** — il renderer dichiara ogni fotogramma se build-up/arco/post-arco sono vivi (`cineBusyRef`) e l'auto-avanzamento non chiude finche' non ha finito (tetto 6s; skip manuale libero; spenta sotto il gate). ⚠️ Una sonda che aspetta un tempo FISSO e poi fotografa misura il PROPRIO cronometro, non quello del gioco: aspettare l'uscita da `hl_result`. ⚠️ Misurando la finestra d'esito ricordarsi che `_gk76` (l'attesa concessa al gol) e' SPENTA sotto `?cpmtest=1`: serve `__CPM_REALWAIT`.

**Invariante «il pallone sta nel rettangolo» + come si misura «in rete» (7.478.0):** `npm run outcome-not-goal`
— guardiano NON-gate sul flusso vero e su un percorso forzato (`CPM_FORCE=1`, `CPM_ONLY=50,55` per scene
nominate). ⚠️ Due costanti si confondono e hanno gia' prodotto tre falsi rossi: **`AWAY_GOAL_X`=46 e' la rete
interna, la LINEA DI PORTA e' `_GLX`=48,6**, e «finita in rete» pretende anche i **pali** (|z| ≤ 3,35, la
costante con cui il gioco stesso clampa l'ingresso in rete) — senza la z, ogni cross uscito largo sul fondo
viene condannato. Il lerp della palla logica ha un fondo campo (0..100, `__CPM_NO478D` lo toglie): la palla
era stata misurata a 103,5 logici / 54,2 in mesh, cioe' dentro i cartelloni. **Salto del pallone:**
`npm run ball-jump-census` non misura piu' solo la dimensione — il varco `__CPM_BJ478` **attribuisce** ogni
riassegnazione secca alla sua sorgente e dice se c'e' uno stacco nero vivo; `CPM_BJMIN` abbassa la soglia
per provare che il varco guarda davvero. ⚠️ Un «salto» misurato fra due CAMPIONI dell'anello (59-431 ms a
8-25 fps) non e' un teletrasporto: e' velocita' x intervallo, la trappola del 7.360.

**«Non si vede il gesto tecnico» ha un numero (7.480.0):** `npm run hero-framing` — l'ALTEZZA APPARENTE
dell'eroe nel quadro (testimone `__CPM_FRAME480`: proiezione piedi→testa in spazio normalizzato, frazione
dell'altezza dell'immagine). **E' adimensionale**, quindi headless e telefono dicono lo stesso numero — la
grandezza che mancava a tutta questa famiglia di note. Censimento 191 scene: **mediana 0,057 · 99% sotto
0,15 · 81% sotto 0,08 · eroe fuori dal quadro su 42 scene**. Riferimento: un piano americano da regia
sportiva sta a 0,35-0,60. ⚠️ Prima di accusare l'inquadratura si esclude il confondente del tempo di scena
headless (`CPM_WAIT`): se allargando la finestra il numero non cresce, la camera non e' lenta — non si
avvicina (misurato: 2400→10000 ms, mediana 0,050→0,048).

**Due difetti diversi: «piccolo» e «non inquadrato» (7.482.0).** Si correggono con l'opposto — la distanza
e la MIRA — quindi il censimento li misura separati. La seconda grandezza e' la **quota di fotogrammi
della conclusione con l'eroe fuori dal quadro** (rapporto, quindi confrontabile fra headless e telefono):
oggi **7,8% su 5.281 fotogrammi**, con **9 scene sopra meta'** e due al 100% (gi168 «Tackle duro», gi138
«Allineamento difensivo») — quasi tutte DIFENSIVE. ⚠️ Le due cause sono distinte e si separano contando
gli ingaggi delle reti anti-fuoriquadro (`__CPM_HY478`): se la rete sull'eroe non ingaggia MAI mentre lui
e' fuori (gi33, gi168) e' **spenta** perche' il soggetto e' passato alla palla; se ingaggia e lui resta
fuori lo stesso (gi138, 13 ingaggi) e' **rate-capped** e non lo recupera. ⚠️ La quota varia fra run (11-27
fotogrammi osservati col fps headless): stabile e' quali scene compaiono, non il decimale.
**Per scegliere l'inquadratura** si chiede una TAGLIA, mai un moltiplicatore (lo stesso k dava 0,115 e
0,455 su due scene): `npm run framing-choices` per i provini, `CPM_TARGET=0.30 npm run hero-framing` per
sapere dove finiscono le 191 con quella regia **prima** di adottarla. ⚠️ E la prima prova dice di
aspettare: a taglia 0,30 la mediana arriva a 0,300 e le scene illeggibili crollano da 190 a 1, **ma la
quota fuori quadro sale da 7,8% a 19,3%** e le scene che non mostrano mai l'eroe da 9 a 20 (nessuna
guarita). Stringere senza sistemare la MIRA raddoppia il difetto peggiore: le due decisioni si prendono
insieme. ⚠️ Un'altezza apparente impossibile (gi14: 42,8) si legge «camera troppo vicina, soggetto oltre
il piano camera», non come una misura.

**⚠️ UNA PAGINA STANCA NON E' IL GIOCO (7.483.0) — vale per OGNI sonda di questo repo.** Il censimento
forza 191 conclusioni di fila sulla stessa pagina, e le scene che aveva nominato al 92-100% stanno a
**0-2% su pagina nuova**: cinque «difetti» su nove erano lo strumento. Quando una sonda ripete molte
scene su un solo caricamento, **il confronto fra due bracci regge, i valori assoluti no** — e per
giudicare una singola scena si apre una pagina nuova (`hero-in-frame-test.mjs` lo fa, e il costo e'
qualche minuto). Guardiano della mira: `npm run hero-in-frame` (testimoni gi138 58%→18% · gi133 46%→0%,
prova del rosso `__CPM_NO482`); su un highlight **difensivo** il soggetto della regia non passa piu' al
pallone, perche' li' la storia e' chi ha fatto l'intervento. ⚠️ Restano fuori gi14 (cross) e gi161
(punizione), che sono difetti veri ma non difensivi.

**Test dal vivo:** `tests/visual/live-match-test.mjs` (non-gate, GLB-ON) verifica la coerenza M1 overlay⟺esito su un campione di tiri falliti + screenshot full-page; `tests/visual/glb-gesture-smoke.mjs` per i gesti GLB. Le parti gate-cieche (movimento, camera, cronaca BG live, cerimonia) si collaudano così.

> **Quick-gate (`npm run quick-gate`, ~1.5 min):** gate **leggero** per iterare veloce in sviluppo (`tests/visual/quick-gate.mjs`). Campiona ~26 Situations sui check di stato (`initial-state/orientation/visual/movements/golden`) + `determinism/final-state/timeline/data-coherence`; **salta** i sampler lenti (`motion/ball-motion/post-highlight/perf/ai-vision`). Riusa harness + gli stessi `checks/*.mjs` → zero duplicazione. ⚠️ **NON sostituisce** il gate completo: `validate-situations` (14/14) resta **obbligatorio prima di ogni push**. Usa il quick-gate per il loop di sviluppo, il gate completo come gate di rilascio.

- **`golden`** confronta una **firma di stato** `{htx,hty,cam,ch,ca}` (target logico eroe + camera + conteggi) — **NON** le posizioni off-ball (escluse di proposito). Quindi cambiare il posizionamento off-ball è gate-safe (golden invariato); se cambi l'estetica/setup che tocca la firma, rigenera con `npm run validate-situations:update-golden` e committa.
- **`initial-state`/`orientation`** asseriscono la **posizione dei portieri** (home GK x≤25, away GK x≥75, home<away): muovendo i GK resta entro questi bound (vedi F13, CAP 80/20).
- **`determinism`** verifica che il setup di ogni situation sia riproducibile — evita di far dipendere il *setup/rendering* da `Math.random()` non seedato.
- **`data-coherence`** applica le regole di `tests/situations-3d-validation.js` (l'invariante CINE header⇒aerea è un FAIL con `exit 2`).
- **`timeline`** (LMQP-2/3/5/6) consuma il bus eventi osservabile **`window.__CPM_TIMELINE`** (LMQP-1, vedi sotto) raccolto nella passata force+resolve: verifica il backbone narrativo per-highlight (`HighlightForced → ActionResolved` con intent valido/coerente + outcome key), gli **invarianti CINE sulla decisione live** (LMQP-3: testa/volée⟹aerea, set-piece⟹palla ferma), la **regressione della decisione** vs `decision-baseline.json` (LMQP-5) e la **semantica dell'esito** (LMQP-6: outcome key noto + `ok ⟺ key di successo`, taxonomy goal/assist/save/recovery vs miss/intercept/goal_against/…). Primo gradino del Semantic/Narrative Validator (LMQP-SPEC 3.4).
- Il gate **forza le situation direttamente** (bypassa `handleContinue`/selezione HL): modifiche a ripresa, chaining-trigger, densità BG e selezione HL **non sono coperte** → trattale come a rischio e testale dal vivo.
- **Rete bloccata (cloud):** il runner intercetta le route CDN e serve React/Three/Babel dai `node_modules` locali, così il gate gira anche senza accesso ai CDN.

**AI Vision Review (framework provider-based, `tests/visual/lib/vision/`):** revisore percettivo di **secondo livello** (non blocca MAI la CI). Architettura Open/Closed `VisionProvider`→`VisionReviewEngine`→`ProviderRegistry`; provider **Ollama** (1°, locale + cloud via `OLLAMA_API_KEY`), Anthropic, **OpenAI/Gemini implementati** (BL-19, `analyze()` Chat Completions/generateContent proxy-aware). Runner standalone `npm run ai-vision` (cattura Playwright multi-fase → engine con cache/dedup/retry/fallback/Failure-Package → scoring Quality/Confidence/Severity/Priority/verdict → report HTML+`ai-vision.json`). **Scoring storico (BL-19, `lib/vision/history.mjs`):** ogni run DELIBERATA (non-skipped) appende una riga compatta a `out/vision/ai-vision-history.json` (rolling cap 200) → il report mostra il **TREND** della qualità percettiva tra build (delta vs precedente · best/worst/media · sparkline dependency-free) = benchmark evolutivo (KPI «Confidence Score medio»). **VIDEO CONTINUO (BL-19, `VISION_MODE=video`):** oltre alle 5 fasi statiche, la modalità video cattura un **FILMSTRIP ordinato** di N frame (`captureHighlightSequence`, clamp 3..16, passo `VISION_VIDEO_INTERVAL`ms) della CONCLUSIONE e usa un **prompt MOVIMENTO** dedicato (`context.mode='video'` → `buildPrompt` sceglie il template) che giudica la DINAMICA temporale — fluidità, continuità della traiettoria della palla, tempi esito↔3D, scatti/**teleport** tra frame adiacenti — ciò che i fotogrammi discreti non potevano misurare. Schema JSON invariato → lo scoring resta lo stesso; cache separata frames/video (suffisso `-video` sul promptVersion, immagini già distinte). Default resta `frames` (retro-compat). Config via `tests/visual/.env` (vedi `.env.example`; `.env` è gitignored). Test: `npm run test:vision` (**43** — +7 su video-mode: config/clamp/selezione-prompt/schema; probe browser: 8 frame ordinati 0 artefatti). Il gate riusa lo stesso engine via `lib/ai-vision.mjs` (adattatore) e fa **skip pulito** se il provider è giù. ⚠️ Ollama Cloud (`ollama.com`) può essere bloccato dalla network policy dell'ambiente cloud (403 al proxy) → eseguire in locale o allowlistare l'host.

**`npm run vision-doctor` — perche' l'AI Vision non gira (7.479.0).** Lo skip del gate stampa una riga
sola e non distingue quattro guasti diversi; peggio, uno skip **passa la CI**, quindi il livello percettivo
puo' restare spento per settimane. Il doctor separa quattro anelli — configurazione (provider/modello/URL/
chiave, mai stampata) · host raggiungibile (distingue **connessione rifiutata** = server spento da **negata
dalla rete** = policy, che vogliono mosse opposte: la causa vera sta in `e.cause`, non nel «fetch failed»
di Node) · `healthCheck` del provider (lo stesso su cui il gate decide) · **risposta vera** con un'immagine
di prova, l'unico anello che dimostra che il modello VEDE. Uscita 0 solo a catena completa.
⚠️ In sessione cloud tutte le sorgenti di modelli sono bloccate (misurato: `huggingface.co` e
`registry.ollama.ai` non si connettono, `github.com/releases` 403, `api.anthropic.com` **401 = raggiungibile**):
il livello percettivo si esegue **in locale**. Gratis e open source: `ollama serve` + `ollama pull qwen2.5vl`
(zero configurazione, sono gia' i default), oppure un server OpenAI-compatibile (llama.cpp `llama-server`)
con `OPENAI_BASE_URL` — in quel caso `OPENAI_API_KEY` **deve essere non vuota** anche in locale, il provider
rifiuta prima di chiamare.

**Artefatti del gate (LMQP-7/8/9, in `out/validate/`):** oltre a `index.html`/`report.json`, ogni run produce **`run-summary.json`** (LMQP-7, *Failure Collector* — `lib/failure-collector.mjs`): pacchetto compatto machine-readable con esito globale, per-check pass/issue/warn, `failures[]` normalizzate `{check,gi,msg,situation,intent,shot}`, `coverage`, `baseline` drift, `performance` e un **fingerprint deterministico** (dedup/trend). Il **Performance Monitor** (LMQP-8, `lib/perf-monitor.mjs`) misura load-time/JS-heap/frame-timing col render-loop attivo — **warn-only/informativo** (FPS headless = software-rendered, no GPU → soglie su floor headless-realistici, mai FAIL). Il report HTML include la **LMQP Dashboard** (LMQP-9): griglia degli 12 check, coverage a chip, perf, baseline e tabella failure. Tutti additivi (solo harness → gate-safe). Il CI carica l'intera `out/validate/` come artifact.

> **LMQP-1 — Event + Timeline layer (5.35.0):** primo mattone implementativo della piattaforma LMQP. Bus eventi osservabile nel gioco (`cpmEmit` → ring buffer `MATCH_TL`, probe `window.__CPM_TIMELINE()`/`__CPM_TIMELINE_RESET()`): registra `MatchStart · HighlightForced(intent,zone) · ActionResolved(intent,label,ok,key) · HighlightAdvance`. Opt-in/sicuro (solo push + try/catch → nessun impatto su stato/render, gate-safe). È la sorgente per il check `timeline` (LMQP-2) e per i futuri Replay/Semantic/Narrative validator (`LIVE_MATCH_QA_SPEC.md` 3.4/3.5).

## Key Patterns

- **No build tool:** edit diretti nel `.html`. JSX valido dentro `<script type="text/babel">`.
- **Coordinate:** logica `{x:0–100,y:0–100}`; mondo Three.js `{x:-50..+50, z:-30..+30}`.
- **Random seedato:** usa `hashStr` + aritmetica per tutto ciò che deve essere riproducibile tra save. `rng()`/`pick()` solo per eventi one-off. ⚠️ Mai far dipendere setup/render dal random non seedato (rompe `determinism`/`golden`).
- **Save compat:** incrementa `SAVE_VERSION` aggiungendo campi obbligatori; aggiungi migration backward-compat nel `useEffect(()=>{...},[])` di `CareerApp` che rileva/riempie i campi mancanti (`calendar`/`standings`/nuovi campi). Ultimo bump: **v8** (`bankBalance`/`perkTrainer`/`perkNutrition`, FASE 3.2 5.81.0) — pattern: `if(!('foot' in newP)){newP={...newP,foot:...};changed=true;}`. ⚠️ La stabilizzazione 6.32→6.37 è **additiva/repair** (nessun bump SAVE): la migration di `CareerApp` ora RICONCILIA la classifica (non l'azzera, STAB-12), ripara la lega pro rotta, normalizza la forma sul valore grezzo (STAB-17) e sblocca i tornei Nazionali al rollover (STAB-3).
- **Versioning:** bump `GAME_VERSION` ad ogni push (anche fix minori), con commento sintetico di cosa cambia.
- **File unico:** mai creare file JS separati per il gioco.

## Regole di squadra

Il ciclo **Audit → Implement → QA** e la ripartizione dei ruoli (match engine, 3D, UI, dati, QA, DevOps) sono
ora **le Project Skill** elencate sopra: la tabella dei «10 agenti» che stava qui le duplicava e l'ho rimossa.
Restano le regole che non appartengono a nessuna skill in particolare.

- **Nessuna modifica senza audit.** → `architect`
- **Bump `GAME_VERSION` a ogni push**, con commento italiano che spiega causa, misura e guardiano lasciato.
- **Gate 14/14 verde prima di ogni push** che tocca il file di gioco (+ guardiani carriera se l'area li
  richiede). → `production-ready`
- **`CLAUDE.md` si aggiorna solo** quando cambia il modo di lavorare o nasce un invariante. La cronologia va
  in `docs/RELEASE_HISTORY.md`.
- **Branch workflow.** Sviluppo sul branch di lavoro corrente — oggi **`claude/career-simulator-qa-testing-sddljf`**,
  con push gemello su `claude/career-simulator-qa-testing-f4wj26`. Promozione su `main` (produzione → GitHub
  Pages) **automatica dopo ogni push col gate verde** (direttiva PO del 2026-07-12):
  ```bash
  git fetch origin main -q && git checkout -B main origin/main -q \
    && git merge --ff-only <branch> && git push -q origin main && git checkout <branch> -q
  ```
- **Annunciare sempre** «Pushato su GitHub — CPM x.y.z.» dopo il push.
- **Mai** l'identificativo del modello in commit, PR, commenti di codice o qualunque artefatto del repo.
- **Zero regressions · Minimalismo · File unico.**

---
