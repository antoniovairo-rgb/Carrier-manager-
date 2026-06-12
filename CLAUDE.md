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

### Layers (top to bottom in the file)

| Lines | Content |
|-------|---------|
| 1–16 | HTML shell, CDN imports, loading spinner |
| 17–32 | Theme constants (`TH`) |
| 37–88 | `AVATARS` data + `AvatarSVG` component |
| 90–177 | `CLUBS` database (65+ clubs across 9 leagues), `U18_CLUBS` derived set |
| 179–194 | `TeamBadge` SVG component |
| 196–378 | Game data: `WEEKLY_EVENTS`, `SITUATIONS`, `ZONES`, `BG_MATCH`, `OUTCOME_TX`, `STADIUMS`, formation arrays |
| 380–491 | Core helpers: `rng`, `clamp`, `pick`, `shuffle`, `wPick`, `baseStats`, `calcOvr`, `succRate`, `generateStandings`, `getLeagueClubs`, `generateTransferOffer`, `generateProContracts`, `storage` |
| 492–598 | Name pool data + calendar/roster helpers: `hashStr`, `generateTeamRoster`, `seededShuffle`, `generateSeasonCalendar`, `initStandings`, `updateStandings`, `calcAttendance`, `simulateMatch` |
| 600–627 | UI primitives: `Card`, `Btn`, `StatBar`, `OvrRing`, `Notif` |
| 628–803 | Three.js utilities: `makeCrowdTex`, `buildStadium` |
| 808–953 | `ThreeField` — Three.js React component (full 3D pitch + stadium + players) |
| 955–980 | `DPad` — touch/mouse directional pad |
| 982–1420 | `MatchdayCard`, `FormationView`, `WalkoutOverlay`, `LiveMatch` — match flow |
| 1421–1495 | `ProTransitionScreen` — end-of-U18 career screen |
| 1497–1660 | `HomeScreen`, `CreateScreen`, `OffersScreen` — meta screens |
| 1661–1674 | `TrialFlow` — manages the 3-trial sequence |
| 1676–2292 | `CareerApp` — main career state machine (tabs: dashboard, calendar, standings, training, profile) |
| 2294–2391 | `App` — root router; manages `phase` state |
| 2393–2397 | `ReactDOM.createRoot` mount |

### State Architecture

All mutable game state lives in a single `player` object managed by `useState` in `CareerApp`. It is **autosaved** to `localStorage` on every change via a `useEffect`. Three save slots use keys `cpm-v3`, `cpm-v3-s2`, `cpm-v3-s3`.

The `player` object contains:
- Identity: `name`, `nation`, `avatarId`, `age`, `position`
- Career: `season`, `week`, `weekLived`, `proStatus` (`"u18"` | `"pro"`), `club`, `contract`
- Stats: `stats` (8 attributes), `ovr`, `form`, `morale`, `fatigue`, `coachTrust`, `popularity`, `value`
- Season tracking: `goals`, `assists`, `matches`, `matchHistory[]`
- **Persistent calendar**: `player.calendar[]` — array of `{matchday, week, opponentId, opponentName, isHome, played, result}` generated once per season via `generateSeasonCalendar`
- **Persistent standings**: `player.standings[]` — zero-initialised each season via `initStandings`, updated after each matchday via `updateStandings`
- Lifetime: `totalGoals`, `totalAssists`, `totalMatches`, `history[]`, `log[]`

The local `standings` React state in `CareerApp` must always mirror `player.standings`. They are kept in sync by calling `setStandings(newStandings)` alongside every `setPlayer(p => ({...p, standings: newStandings}))`.

### App Phase Router (`App` component)

`phase` drives which screen is shown: `loading → home → create → trial → offers → career`. The `career` phase mounts `CareerApp` with the loaded `player`. Phase is **not persisted** — on reload, the app always starts at `home` and loads player data from `localStorage`.

### Match Flow (`LiveMatch`)

Phases within a match: `matchday → formations → walkout → playing → hl_move → hl_choose → hl_result → ended`.

- `hl_*` phases are **highlights** — scripted interactive moments drawn from `SITUATIONS`
- Between highlights the clock ticks via `setInterval` at 300ms/tick, firing `BG_MATCH` commentary events
- Player position is `{x, y}` in a 0–100 coordinate space; `getZone(x)` maps to zone names; `toThree(gx,gy)` converts to Three.js world coordinates
- Action success probability: `succRate(action, stats, playerX, oppPrestige)` — scales with the relevant stat, player's field position, and opponent prestige
- Match can be entered only if `player.calendar` has an unplayed entry for the current week (`getThisWeekMatchday`)

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
- **Bump `GAME_VERSION`** ad ogni push, anche fix minori.
- **Annunciare sempre** "Pushato su GitHub — CPM x.y.z." dopo ogni `git push`.
- **Zero regressions**: il QA Engineer valida ogni sprint prima del push.
- **Minimalismo**: nessuna astrazione o feature non richiesta esplicitamente.
- **File unico**: tutto in `CARRIER-MANAGER-AV.html` — mai creare file JS separati.

### Sprint format

Ogni sprint ha: obiettivo, lista task numerata, agent assegnato per task, criteri QA.
Esempio: "Sprint N — [titolo]: 1. Fix X (Match Engine Dev) 2. Add Y (Data Designer) QA: verifica Z."
