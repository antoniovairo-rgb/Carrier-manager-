# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Career Player Manager (CPM)** is a single-file browser game. The entire codebase lives in one HTML file.

### Struttura cartelle

```
C:\Users\a.vairo\CMP\
├── CARRIER-MANAGER-AV.html ← FILE DI LAVORO ATTIVO
├── CLAUDE.md
├── CHANGELOG.md
├── versions\              ← archivio storico di tutte le versioni
│   ├── cpm-game.html
│   ├── cpm-game_1.html
│   ├── cpm-game_2.html
│   ├── cpm-game_3.html
│   ├── cpm-game_4.html
│   └── cpm-game_5.html
└── .claude\
    ├── settings.local.json
    └── commands\          ← slash commands: /bump /audit /diff /open /evolve /changelog
```

- **File attivo:** `C:\Users\a.vairo\CMP\CARRIER-MANAGER-AV.html` — modificare sempre questo
- **Archivio:** `C:\Users\a.vairo\CMP\versions\` — storico read-only di riferimento
- Ogni nuova versione: copiare il file attivo in `versions\` prima di modificare

## Running the Game

Open the HTML file directly in a browser — no build step, no server, no dependencies to install. All libraries are loaded from CDN:
- React 18.2.0 (UMD)
- Three.js r128
- Babel standalone 7.23.6 (transpiles JSX in-browser at load time)

Babel transpilation runs client-side on page load, so there is a ~1–2 second startup delay. The spinner overlay (`#ld`) hides automatically via `requestAnimationFrame(window._hide)` after the first render.

## Architecture

The file is structured as a single `<script type="text/babel">` block. There is no module system — everything is in global scope, declared in dependency order.

### Layers (top to bottom in the file) — aggiornato a CPM 3.35.0 (~13 100 righe)

| Lines | Content |
|-------|---------|
| 1–16 | HTML shell, CDN imports, loading spinner |
| 17–48 | Theme constants (`TH`, `TH_DARK`) |
| 49–324 | `AVATARS` data + `AvatarSVG` component |
| 325–606 | `CLUBS` database (65+ clubs, 9 leagues), `U18_CLUBS` derived set, `TeamBadge` |
| 607–709 | `LEAGUE_RECORDS` — all-time scorer data per league (Sprint 51) |
| 710–1219 | `WEEKLY_EVENTS` — weekly narrative events |
| 1220–1605 | `SITUATIONS` — **164 interactive match situations** (Sprint 55) |
| 1606–1615 | `ZONES` — pitch zone definitions |
| 1616–1753 | `BG_MATCH`, `OUTCOME_TX`, `STADIUMS`, formation arrays |
| 1754–1934 | Core helpers: `rng`, `clamp`, `pick`, `baseStats`, `calcOvr`, `succRate`, `generateTransferOffer`, `generateProContracts`, `storage` |
| 1910–1936 | `ARCHETYPES`, `GAME_VERSION` (3.35.0), `SAVE_VERSION` (5) |
| 1937–3729 | Name pool `NAME_BY_NAT`, calendar/roster helpers: `hashStr`, `generateTeamRoster`, `generateSeasonCalendar`, `initStandings`, `updateStandings`, `calcAttendance`, `simulateMatch` |
| 3731–3775 | UI primitives: `Card`, `Btn`, `StatBar`, `OvrRing`, `Notif` |
| 3776–4804 | Three.js utilities: `makeCrowdTex`, `buildStadium` |
| 4805–5180 | `ThreeField` — Three.js React component (full 3D pitch + stadium + players) |
| 5181–5421 | `DPad` — touch/mouse directional pad |
| 5422–6995 | `MatchdayCard`, `FormationView`, `WalkoutOverlay`, `LiveMatch` — match flow |
| 6996–7493 | `ProTransitionScreen` — end-of-U18 career screen |
| 7494–8746 | `HomeScreen`, `CreateScreen`, `OffersScreen`, `TrialFlow` |
| 8836–9142 | `NAT_CLUB_DATA` — 10 national teams for Coppa/Euro/Mondiale (Sprint 52-53) |
| 9143–9205 | `_simCupOtherMatches()` — bracket simulator helper (Sprint 52); `CAREER_MILESTONES` |
| 9206–12953 | `CareerApp` — main career state machine (tabs: dashboard, calendar, standings, training, profile) |
| 12954–13108 | `App` — root router; manages `phase` state |
| 13109 | `ReactDOM.createRoot` mount |

### State Architecture

All mutable game state lives in a single `player` object managed by `useState` in `CareerApp`. It is **autosaved** to `localStorage` on every change via a `useEffect`. Three save slots use keys `cpm-v3`, `cpm-v3-s2`, `cpm-v3-s3`.

The `player` object contains:
- Identity: `name`, `nation`, `avatarId`, `age`, `position`
- Career: `season`, `week`, `weekLived`, `proStatus` (`"u18"` | `"pro"`), `club`, `contract`
- Stats: `stats` (8 attributes: `velocità`, `tecnica`, `fisico`, `mentalità`, `tiro`, `passaggio`, `dribbling`, `posizionamento`), `ovr`, `form`, `morale`, `fatigue`, `coachTrust`, `popularity`, `value`
- Season tracking: `goals`, `assists`, `matches`, `matchHistory[]`
- **Persistent calendar**: `player.calendar[]` — array of `{matchday, week, opponentId, opponentName, isHome, played, result}` generated once per season via `generateSeasonCalendar`
- **Persistent standings**: `player.standings[]` — zero-initialised each season via `initStandings`, updated after each matchday via `updateStandings`
- Lifetime: `totalGoals`, `totalAssists`, `totalMatches`, `history[]`, `log[]`
- **Diario** (Sprint 51): `player.diary[]` — auto-journal `{season, week, type, e, headline, body, color}`; max 80 entries. Types: `first_goal`, `hattrick`, `milestone`, `pallone_oro`, `scarpa_oro`, `record`, `first_national`, `first_national_goal`, `cup_trophy`, `euro_mondiale_trophy`, `contract_renewal`
- **Coppa Nazionale** (Sprint 52): `player.cup{round, bracket[], cupSurvivors[], cupBracketMatches{r16,quarters,semi,final}, active, done}` — full bracket simulation via `_simCupOtherMatches()`
- **Europeo/Mondiale** (Sprint 53): `player.euroMondiale{active, type, season, phase, groupOpponents[], groupMatchIdx, groupPts, groupMatches[], koPhase, koOpponent, koResults[], qualified, champion, eliminated, done}` — triggered week 24 every 4 seasons; `type` alternates Europeo/Mondiale every 8 seasons
- **Contratto** (Sprint 54): contract negotiation via `negoModal` React state + helpers `openNegoModal`, `_evalNego`, `_acceptNegoWage`; 3-step modal (choose/club_counter/rejected)
- **Tutorial** (Sprint 56): `player.tutorialDone` boolean — `false` per nuovi save, `true` per save esistenti (migrazione: `totalMatches>0 || season>1`). Overlay `TutorialOverlay` a 4 step mostrato solo su screen="dashboard" finché non completato o saltato

The local `standings` React state in `CareerApp` must always mirror `player.standings`. They are kept in sync by calling `setStandings(newStandings)` alongside every `setPlayer(p => ({...p, standings: newStandings}))`.

### App Phase Router (`App` component)

`phase` drives which screen is shown: `loading → home → create → trial → offers → career`. The `career` phase mounts `CareerApp` with the loaded `player`. Phase is **not persisted** — on reload, the app always starts at `home` and loads player data from `localStorage`.

### Match Flow (`LiveMatch`)

Phases within a match: `matchday → formations → walkout → playing → hl_move → hl_choose → hl_result → ended`.

- `hl_*` phases are **highlights** — scripted interactive moments drawn from `SITUATIONS` (164 entries as of Sprint 55)
- Between highlights the clock ticks via `setInterval` at 300ms/tick, firing `BG_MATCH` commentary events
- Player position is `{x, y}` in a 0–100 coordinate space; `getZone(x)` maps to zone names; `toThree(gx,gy)` converts to Three.js world coordinates
- Action success probability: `succRate(action, stats, playerX, oppPrestige)` — scales with the relevant stat, player's field position, and opponent prestige
- Match can be entered only if `player.calendar` has an unplayed entry for the current week (`getThisWeekMatchday`)
- `matchContext` prop distinguishes career / cup / national / euroMondiale_group / euroMondiale_ko — used in `onMatchEnd` to route post-match state updates correctly
- **RULE**: ogni competizione è completamente giocabile dall'utente tramite LiveMatch — zero simulazioni forzate
- **Coerenza HL↔azione (CINE-COH, 4.70.0)**: `hlBallState(sit)` deriva lo stato reale del pallone (`set_ground` = set-piece battuto dall'eroe / `aerial` = cross·corner·rimbalzo·rovesciata·stacco·di petto / `feet` = palla al piede). `deriveHL` lo usa: il colpo di testa è emesso SOLO con palla aerea, la volée (`shot_volley`) solo su palla aerea (altrimenti `shot_first_time` per i "di prima" a terra). Invariante: nessun highlight mostra una testa/volée con la palla al piede. Validato da `tests/situations-3d-validation.js` (dimensione **coerenza**: header⇒aerea è un FAIL che blocca la suite con `exit 2`)

### Calendar & Standings Invariants

- `generateSeasonCalendar(playerClub, leagueClubs, seed)` — deterministic, seeded by `season*777 + hashStr(club.id)`; produces ~26–28 matchdays spread across 38 weeks with 1–2 rest weeks between groups of 3
- `initStandings(clubs)` — called at season start; all `played/wins/draws/losses/gf/ga/pts = 0`
- `updateStandings(standings, playerClubId, result)` — called after each played/simulated matchday; simulates the other N-1 team pairs using prestige-weighted random goals
- When advancing past a week that had a scheduled match without playing it, `simulateMatch` auto-resolves it and `updateStandings` is called anyway (preserving standings consistency)

### Club Data Shape

```js
// CLUBS entry (via mkT helper)
{ id, n, a, p, c, c2, nat, lg }
// id: slug  n: full name  a: 3-letter abbr  p: prestige (0-99)
// c: primary colour hex  c2: secondary colour  nat: flag emoji  lg: league name

// U18_CLUBS inherits all fields + adds: isU18:true, name:`${n} U18`, prestige:p-10
```

`getLeagueClubs(player)` returns the correct club pool: `U18_CLUBS` when `proStatus==="u18"`, otherwise clubs matching `player.club.lg`, falling back to nationality, then first 16.

### Name Generation

`generateTeamRoster(club, season)` returns 11 `{name, role}` objects. Names are seeded by `hashStr(club.id + "_" + season)` so they are stable within a season and change each new season. Nationality-matched name pools are in `NAME_BY_NAT` keyed by flag emoji.

### Three.js (`ThreeField`)

The component mounts once (empty `[]` deps). Player position, zone highlight, and camera target are updated via separate `useEffect` hooks that write directly to `sr.current` refs (no re-render). The stadium is built once via `buildStadium`; crowd textures are `THREE.CanvasTexture` generated procedurally by `makeCrowdTex`. The renderer uses `setClearColor(0x050810)` to prevent a gray flash before the first frame.

## Key Patterns

- **No build tool**: edits go directly into the `.html` file. JSX is valid inside `<script type="text/babel">`.
- **Coordinate system**: game logic uses `{x:0–100, y:0–100}`; Three.js world is `{x:-50..+50, z:-30..+30}`.
- **Seeded randomness**: use `hashStr` + arithmetic for anything that must be reproducible across saves. Use `rng()` / `pick()` only for one-off random events.
- **Save compatibility**: increment `SAVE_VERSION` when adding required new fields; add backward-compat migration in the `useEffect(()=>{...},[])` inside `CareerApp` that detects and fills missing `calendar`/`standings`.
- **Versioning**: when making significant changes, copy to `cpm-game_N+1.html` rather than overwriting in place.

## Studio Framework — AAA Game Dev Team

Ogni sessione di lavoro sul codice CPM segue questo framework multi-disciplinare. Il team è composto da 10 specialisti con ruoli fissi. Il workflow è sempre: **Audit → Implement → QA** — nessuna modifica al codice senza prima un audit esplicito.

### Workflow obbligatorio

```
1. AUDIT   — leggi il codice interessato, identifica dipendenze e rischi
2. IMPLEMENT — applica le modifiche minime necessarie, nessuna feature extra
3. QA      — verifica mentale: regressioni? salvataggio? mobile? performance?
```

Prima di ogni modifica: leggere le righe coinvolte, dichiarare le dipendenze note, elencare i rischi. Solo dopo procedere.

### I 10 Agenti

| # | Ruolo | Responsabilità |
|---|-------|---------------|
| 1 | **Game Director** | Visione, priorità sprint, decisioni di design finali |
| 2 | **Lead Engineer** | Architettura React/JS, state machine, save system |
| 3 | **Match Engine Dev** | LiveMatch, PitchCanvas, HL system, BG_MATCH |
| 4 | **3D/Graphics Dev** | ThreeField, buildStadium, makeCrowdTex, DPR scaling |
| 5 | **UI/UX Designer** | Layout mobile-first, theme (`TH`), componenti (`Card`, `Btn`) |
| 6 | **Data Designer** | CLUBS, SITUATIONS, WEEKLY_EVENTS, BG_MATCH, bilanciamento |
| 7 | **AI Systems Dev** | oppTactic, scoutReport, AIDecisionOverlay, call-up logic |
| 8 | **QA Engineer** | Regressioni, compatibilità save, edge case, test mobile |
| 9 | **DevOps** | Git, versioning (`GAME_VERSION`), GitHub Pages deploy |
| 10 | **Product Manager** | Sprint planning, changelog, prioritizzazione backlog utente |

### Regole del team

- **Nessuna modifica senza audit**: leggere prima il codice, poi dichiarare rischi.
- **Aggiornare `CLAUDE.md`** ad ogni sprint: range di linee, nuovi sistemi, campi `player` aggiunti.
- **Bump `GAME_VERSION`** ad ogni push, anche fix minori.
- **Branch workflow**: dopo ogni sprint pushare su dev (`claude/continue-work-y3mh4y`) E su `staging` (ambiente di test). Comando: `git push origin claude/continue-work-y3mh4y && git checkout staging && git merge claude/continue-work-y3mh4y --no-edit && git push origin staging && git checkout claude/continue-work-y3mh4y`.
- **`main` (produzione) solo su autorizzazione esplicita del proprietario** — mai in automatico, mai dopo un singolo sprint senza via esplicito. Quando autorizzato: `git checkout main && git merge claude/continue-work-y3mh4y --no-edit && git push origin main && git checkout claude/continue-work-y3mh4y`.
- **Annunciare sempre** "Pushato su GitHub — CPM x.y.z." dopo ogni `git push`.
- **Zero regressions**: il QA Engineer valida ogni sprint prima del push.
- **Minimalismo**: nessuna astrazione o feature non richiesta esplicitamente.
- **File unico**: tutto in `CARRIER-MANAGER-AV.html` — mai creare file JS separati.

### Sprint format

Ogni sprint ha: obiettivo, lista task numerata, agent assegnato per task, criteri QA.
Esempio: "Sprint N — [titolo]: 1. Fix X (Match Engine Dev) 2. Add Y (Data Designer) QA: verifica Z."

---

## Specifica di Design — Fase 2 "Feature Complete"

Questa sezione definisce i requisiti di design per portare CPM a una prima versione feature-complete, stabile e credibile. Ogni punto è vincolante per i prossimi sprint.

---

### 8. Gestione Intelligente delle Convocazioni e delle Sostituzioni

Il giocatore **non deve essere automaticamente titolare** in ogni partita. L'allenatore prende decisioni realistiche basate su:

**Criteri di selezione:**
- OVR del giocatore vs OVR dei compagni nello stesso ruolo
- Momento di forma (`player.form`)
- Condizione fisica / stanchezza accumulata (`player.fatigue`)
- Fiducia dell'allenatore (`player.coachTrust`)
- Prestazioni recenti (ultimi 3-5 match da `matchHistory`)
- Importanza della partita (campionato vs coppa, derby, big game)
- Stato degli infortuni della rosa
- Presenza di ruoli di emergenza (giocatore schierato fuori ruolo)

**Esiti possibili per il giocatore:**
- `"starter"` — parte titolare
- `"bench"` — parte dalla panchina (può entrare)
- `"not_called"` — non convocato

**Esperienza in panchina:**
- Visione della partita con animazione/progress bar
- Riscaldamento (animazione + dialogo del mister)
- Istruzioni specifiche prima dell'ingresso
- Ingresso in momenti diversi: 46', 60', 70', 80' (influenza minuti giocati e impatto stat)

**Sostituzioni durante la partita:**
- Cambio tattico (cambio modulo/ruolo)
- Cambio per stanchezza (fatigue alta)
- Cambio per scarso rendimento (form bassa nell'HL)
- Cambio per infortunio (evento casuale)
- Gestione del risultato (difendere vantaggio / cercare pareggio)

**Comunicazione allenatore:**
- Le scelte devono essere spiegate tramite dialogo testuale inline
- Nessuna decisione percepita come casuale — motivazione sempre visibile
- Esempi: "Sei in panchina oggi — voglio farti riposare per il derby di giovedì" / "Entri al 60' — tienici in partita"

**Nuovi campi `player` richiesti:**
```js
player.matchStatus    // "starter"|"bench"|"not_called" — calcolato prima di ogni partita
player.minutesPlayed  // minuti giocati nella partita corrente
```

---

### 9. Vita da Calciatore e Modalità Carriera Evoluta

**9.1 Ritiro Precampionato** (settimane -2 / -1 prima dell'inizio stagione):
- Durata variabile (3-7 giorni)
- Sessioni: allenamento atletico · allenamento tecnico · amichevoli
- Guadagno fiducia allenatore durante il ritiro
- Valutazione finale → gerarchie iniziali della stagione

**9.2 Gerarchie di Squadra:**
```
U18 → Primavera → Riserve → Titolari → Leader spogliatoio
```
- Il giocatore sale/scende in base alle prestazioni
- La gerarchia influenza: minutaggio, convocazioni, crescita, rinnovi

**9.3 Rapporti con Staff e Compagni:**
- `coachTrust` (già presente) — fiducia allenatore
- `assistantCoachRel` — rapporto vice-allenatore
- `fitnessCoachRel` — rapporto preparatore atletico
- `teamChemistry` — rapporto compagni (0-100)
- Le relazioni influenzano: minutaggio, crescita in allenamento, offerte di rinnovo

**9.4 Conferenze e Interviste:**
- Interviste post-partita (dopo prestazioni notevoli o sconfitte)
- Conferenze stampa pre-partita importanti
- Scelte di dialogo con opzioni (diplomatico / ambizioso / critico)
- Impatto su: `popularity`, `coachTrust`, `teamChemistry`, rapporti con stampa

**9.5 Mercato e Trasferimenti:**
- `"loan"` — prestito (temporaneo, poi ritorno)
- `"loan_with_option"` — prestito con diritto di riscatto
- `"loan_with_obligation"` — prestito con obbligo
- `"sale"` — cessione definitiva
- Richiesta di trasferimento da parte del giocatore
- Promesse dell'allenatore (tipo: "sarai titolare dal mese prossimo")

**9.6 Infortuni e Recupero:**
- Infortuni con tipologie diverse: muscolare · articolare · frattura · botta
- Tempi recupero: 1-2 settimane (lieve) / 3-5 settimane (medio) / 6-12 settimane (grave)
- Riabilitazione: sessioni specifiche durante il recupero
- Rischio ricaduta (se rientra troppo presto)
- Rientro graduale (riduzione performance per 2-3 settimane post-infortunio)

```js
player.injury = null | {
  type: "muscolare"|"articolare"|"frattura"|"botta",
  severity: "lieve"|"medio"|"grave",
  weeksRemaining: number,
  recoveryPct: 0-100,
  relapse_risk: 0-1
}
```

**9.7 Obiettivi Stagionali:**
- Obiettivi club (già parzialmente presenti come `seasonObjectives`)
- Obiettivi personali: `{type:"goals_personal",target:N}` / `{type:"top_ovr",target:N}`
- Obiettivi allenatore: dichiarati a inizio stagione
- Obiettivi procuratore: suggeriti periodicamente

**9.8 Premi e Riconoscimenti** (da aggiungere al sistema trofei):
- Miglior Giovane della Stagione (età ≤ 23, top OVR crescita)
- Capocannoniere (già presente)
- Squadra dell'Anno (selezionato se top-3 per ruolo in lega)
- Pallone d'Oro (già presente)
- MVP Campionato / MVP Mese

**9.9 Vita Calcistica Dinamica:**
- Notizie di mercato settimanali (altri trasferimenti simulati)
- Risultati altri campionati (già simulati, ma da mostrare in dashboard)
- Record storici aggiornati in real-time
- Rivalità e derby con bonus atmosfera
- Eventi speciali: Clasico, Derby della Madonnina, Derby del Nord

---

### 10. Test di Realismo della Carriera

**Simulazioni richieste per validazione:**
- Almeno 10 stagioni complete
- Profili: campione / promessa / giocatore medio / riserva
- Percorsi con trasferimenti, infortuni, crescita lenta, crescita rapida

**Criteri di validazione:**
- Il giocatore NON diventa titolare troppo facilmente (almeno 2-3 stagioni da riserva)
- La crescita OVR è credibile (da 50 a 85 in 8-10 stagioni, non in 2)
- Le convocazioni sono coerenti con `coachTrust` e form
- Le sostituzioni rispettano il momento della partita
- Le scelte allenatore sono sempre motivate da dati reali

---

### 11. Stabilità, Qualità e Assenza di Regressioni

**Principio cardine:** ogni nuova feature aumenta profondità senza introdurre bug.

**Sistemi da proteggere (invarianti):**
- Sistema carriera (state machine `CareerApp`)
- Partite giocate e simulate (`LiveMatch`, `simulateMatch`)
- Mercato e contratti (`generateTransferOffer`, `generateProContracts`)
- Statistiche (`goals`, `assists`, `matchHistory`)
- Classifiche (`standings`, `updateStandings`)
- Coppe nazionali (`player.cup`)
- Competizioni europee (`player.euro`, `player.euroMondiale`)
- Sistema allenamenti (`_dim`, training loop)
- Progressione giocatore (`calcOvr`, stat growth)
- Salvataggi esistenti (backward-compat migration in `useEffect`)
- Generazione news, cronaca, highlights, IA squadre

**Suite test di non regressione (obbligatoria prima di ogni push):**
1. Babel transpile check (già presente in ogni sprint)
2. Creazione nuova carriera — genera calendario e standings
3. Caricamento save esistente — migrazione campi mancanti
4. Avanzamento 5+ settimane senza crash
5. Partita completa giocata (LiveMatch fino a `ended`)
6. Inizio nuova stagione — promozioni/retrocessioni + euro spots

**Approccio di sviluppo richiesto:**
- Step piccoli e verificabili — mai più di 300 righe per sprint
- Validare ogni modifica prima di procedere
- Correggere immediatamente le regressioni
- Priorità assoluta: stabilità > nuove feature
