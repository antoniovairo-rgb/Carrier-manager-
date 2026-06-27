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
├── ROADMAP.md               ← roadmap LMQP a 8 fasi + stato attuale
├── DEVELOPMENT_RULES.md     ← regole di sviluppo (v1.0, cap. 1–20) + mappatura sul repo
├── ACCEPTANCE_CRITERIA.md   ← checklist di accettazione (v1.0, AC-001..160; target 600–1000 controlli)
├── CLAUDE.md
├── CHANGELOG.md
├── LIVE-MATCH-ENGINE.md      ← architettura del motore di partita (pipeline Intent→Decision→Simulation→Animation)
├── docs/                      ← report/roadmap storici del live match
└── tests/
    ├── situations-3d-validation.js   ← regole di validazione SITUATIONS (coerenza HL↔3D) + suite analitica (537 combo)
    └── visual/                        ← QUALITY GATE Playwright (vedi sezione dedicata)
        ├── validate-situations.mjs    ← runner principale del gate (9 categorie)
        ├── golden-sigs.json           ← firme golden screenshot
        ├── checks/  lib/  report.mjs  out/
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

## Architecture

Tutto è in un singolo `<script type="text/babel">`. Nessun module system — global scope, dichiarazioni in ordine di dipendenza.

### Layers (top → bottom) — CPM 5.34.0 (~20 600 righe)

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
| 2639–2681 | `ARCHETYPES`, `GAME_VERSION` (**5.34.0**), `SAVE_VERSION` (**7**) |
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

### SIMULATION-FIRST (5.14.0 → 5.34.0) — pipeline `Intent → Decision → Simulation → Animation`

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

## Quality Gate (tests/visual) — OBBLIGATORIO prima di ogni push

Suite Playwright headless che carica il gioco, forza ogni `SITUATION`, risolve le azioni e valida rendering 3D + stato. **Va eseguita e deve passare 9/9 prima di ogni push.**

```bash
cd tests/visual
# setup una tantum: npm install (Chromium è pre-installato in /opt/pw-browsers nelle sessioni cloud)
CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
npm run validate-situations
```

> **Setup bundle (sessioni cloud con CDN bloccati):** l'harness intercetta le route CDN e serve React/Three/Babel/Phaser dai `node_modules` locali. Le versioni **esatte** che l'HTML fissa sono ora in `devDependencies` (`react`/`react-dom` 18.2.0, `three` 0.128.0, `@babel/standalone` **7.23.6**, `phaser` 3.80.1) → `npm install` configura tutto. ⚠️ Babel **deve** essere 7.x: la 8.x non transpila l'`import` e la pagina non monta.

Le **9 categorie**: `initial-state · orientation · visual · movements · golden · final-state · determinism · post-highlight · data-coherence`. Output atteso: `✅ PASS` con tutte verdi (i `warn` non bloccano).

- **`golden`** confronta una **firma di stato** `{htx,hty,cam,ch,ca}` (target logico eroe + camera + conteggi) — **NON** le posizioni off-ball (escluse di proposito). Quindi cambiare il posizionamento off-ball è gate-safe (golden invariato); se cambi l'estetica/setup che tocca la firma, rigenera con `npm run validate-situations:update-golden` e committa.
- **`initial-state`/`orientation`** asseriscono la **posizione dei portieri** (home GK x≤25, away GK x≥75, home<away): muovendo i GK resta entro questi bound (vedi F13, CAP 80/20).
- **`determinism`** verifica che il setup di ogni situation sia riproducibile — evita di far dipendere il *setup/rendering* da `Math.random()` non seedato.
- **`data-coherence`** applica le regole di `tests/situations-3d-validation.js` (l'invariante CINE header⇒aerea è un FAIL con `exit 2`).
- Il gate **forza le situation direttamente** (bypassa `handleContinue`/selezione HL): modifiche a ripresa, chaining-trigger, densità BG e selezione HL **non sono coperte** → trattale come a rischio e testale dal vivo.
- **Rete bloccata (cloud):** il runner intercetta le route CDN e serve React/Three/Babel dai `node_modules` locali, così il gate gira anche senza accesso ai CDN.

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
3. QA        — gate 9/9 verde + verifica mentale: regressioni? salvataggio? mobile? performance?
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
- **Gate 9/9 verde** prima di ogni push — il QA Engineer valida ogni sprint.
- **Branch workflow:** sviluppo sul branch designato (attuale: `claude/remote-control-6w43ie`), poi merge/push su `staging` (test) e, su autorizzazione, su `main` (produzione/Pages → GitHub Pages via GitHub Actions). Branch storici: `claude/cpm-resume-work-71ntrj`, `claude/continue-work-y3mh4y`.
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
