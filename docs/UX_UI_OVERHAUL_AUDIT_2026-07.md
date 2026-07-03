# FASE 0 — Audit UX/UI Completo · Career Player Manager (Elevora)

> Documento generato dallo studio AAA (Lead Product Designer · Senior UX · Senior UI · Design System Architect · Software Architect) come **primo deliverable** dell'overhaul UX/UI.
> Vincolo: solo la **presentazione** cambia (motore/gameplay/dati/salvataggi congelati). Mobile-first, flash-safe, coerenza tema chiaro/scuro. File unico `CARRIER-MANAGER-AV.html`.

## Sintesi esecutiva

### Entry & Onboarding flow (HomeScreen, CreateScreen, OffersScreen, TrialFlow, ProTransitionScreen, TutorialOverlay)
This is the player's very first impression of the product, and it currently reads as a competent admin web-app rather than a premium AAA football title. Two structural problems dominate. First, the entire onboarding is effectively NOT theme-aware: the dark-mode toggle and the Object.assign(TH,…) live only inside CareerApp (l.14715-14717), so every pre-career screen renders with the frozen light TH default and, worse, is peppered with raw light-only hex (#f8fafc, #eff6ff, #bfdbfe, #fef9c3, #fff1f2, #e2e8f0, #fee2e2, rgba(255,255,255,…)) instead of the semantic tokens (bgBlue/bdBlue/txBlue, bgGreen…) that were added to TH_DARK precisely to solve this. A returning dark-mode player who reloads (phase is not persisted → always lands on home) is slammed with a full-white title screen — jarring and off-brand. Second, brand accent is incoherent: the brand primary is granata (#8e1f33) but every 'selected / recommended / info' state across Home, Create, Offers and ProTransition leans on generic blue (#2563eb, #eff6ff, #bfdbfe) — the title screen never asserts the brand color, and Offers even ships two simultaneous 'primary' buttons (weak CTA hierarchy). The HomeScreen itself is a dense list of utility rows with a small static logo and zero atmosphere/hero art. CreateScreen is a long single-scroll form with a native <details> disclosure, 6-avatar pagination, and a 200-item scrolling club picker — dated form UX. TutorialOverlay is the one genuinely modern, theme-correct component. None of this touches game logic; all findings are presentation-only and fixable within the existing design system by routing colors through TH tokens and elevating layout/hierarchy.

### Career Dashboard — "Home" tab (tab==="dashboard") inside CareerApp, l.17104–18442, plus shared header/nav/theme (l.159–182, l.17747–17791, l.21103, l.21226–21264)
This is the single busiest and most dated screen in the game. It is a linear stack of ~18 conditional cards, all rendered at identical visual weight (Card chrome, marginBottom:8, a repeated "fontSize:10 · uppercase · letterSpacing:1.5" micro-label header pattern used ~14 times), with no prioritization tier between a red injury alert and a "Risultati Internazionali" filler list. The 3-second test fails: after the (good) sticky CTA, the user faces a wall of equal-weight lists and 3px progress bars that read like an admin CRUD dashboard, not a AAA sports title. KPIs are just numbers-in-a-row and hairline bars — the existing Sparkline component (l.5535) is never used, there are zero trend/delta indicators, and player value isn't even surfaced. There is heavy redundancy (last-5 form rendered twice; four separate news/list cards; season objectives shown twice at season start; a mini-standings that duplicates the Classifica tab). Theme coherence is broken: some cards use the semantic TH.bgGreen/bdBlue tokens while the *primary* stats card and several prompt cards hardcode raw light hex (or force always-dark gradients), so in dark mode you get light-gray bar tracks and light-green panels, and in light mode you get random dark-navy island cards. This screen needs a hard prioritization pass, consolidation of the news/list cards, a real KPI/hero block, and full tokenization — all presentation-only.

### Stagione container — Calendar / Standings / Coppe tabs (CareerApp)
This area reads as a functional-but-DATED admin dashboard, not a AAA football product. Two systemic problems dominate. (1) Theme incoherence: despite the codebase defining full semantic light/dark token pairs (TH.bgBlue/txBlue, bgAmber/txAmber, etc. at l.168-182), essentially none of the three tabs use them — they hardcode dozens of light-only pastel hex values (#eff6ff, #fef3c7, #f0fdf4, #fee2e2, #ede9fe, #92400e...). In dark mode the flagship league table's user-team highlight, every record/badge chip, the week grid and the cup result rows render as bright light patches floating on the dark card #1e293b — it looks broken. Dark-theme coherence is a stated hard constraint, so this is critical. (2) Massive redundancy: Coppa Nazionale, Coppa Europea and Europeo/Mondiale are each rendered TWO to THREE times (Calendar + Standings + Coppe), each with a slightly different layout, tiny fonts and its own bugs — the dedicated Coppe tab (created 6.8.1 to consolidate) never actually removed the duplicates from Standings/Calendar. Beyond that: the league table is a classic 11-column spreadsheet with 9px color dots instead of crests (while the Calendar right above it uses TeamBadge), the KO "tabellone" is a flat text list not a visual bracket, and readability collapses at fontSize 7-8 which appears throughout. Only the Coppe-tab Euro card (gradient banner) hints at premium polish — and its very existence highlights how flat every sibling card is. High-value, low-risk presentation wins are available since all data/logic is frozen.

### Club / Training / Agente (Economy) tabs — CareerApp (CARRIER-MANAGER-AV.html)
These three tabs read as a functional but DATED admin dashboard, not a AAA football product. The core problems are systemic rather than one-off: (1) a shared visual grammar of ~10px UPPERCASE letter-spaced gray section headers repeated on every card, giving a spreadsheet feel; (2) pervasive HARDCODED light hex literals (#f8fafc, #eff6ff, #fee2e2, #ecfdf5, #e2e8f0, #f5f3ff, etc.) instead of the TH/TH_DARK semantic tokens that already exist (bgBlue/bgGreen/bgAmber…) — so the Agente tab and most Training/Club panels are effectively LIGHT-ONLY and break the required dark-theme coherence; (3) a genuine dead token, TH.cardBg, referenced 3× in the Club contract card but never defined, so those tiles render with no background; (4) weak data visualization — the roster is a flat number/icon/name/role list with no OVR or stat cues, StatBar's red-below-65 thresholds make an ordinary player look alarmingly weak, and money/patrimonio is a bare header number rather than a KPI treatment; (5) inconsistent brand — trophies and the 'isMe' roster highlight use ad-hoc blues/ambers (#f59e0b, rgba(59,130,246)) instead of TH.primary/TH.gold, and money is formatted inconsistently (€ prefix vs k€/M€ suffix). None of this is a logic problem — all fixes are presentation-only and can lean on the existing semantic token set. The bones (card layout, spacing) are fine; the surface needs modernization, a real dark-theme pass, and stronger hierarchy on the hero numbers (patrimonio, prestige, OVR).

### Carriera container — "Profilo" tab (player profile / hero card / stats / career history / trophies / diary) and "Nazionale" tab (national team / tournaments / call-ups)
This area reads as a DATED admin dashboard, not a AAA player-career screen. The Profilo tab is a ~37-card single-column dump (l.19280–20307) whose ordering is essentially inverted vs importance: the player-identity "hero" card (avatar + name + OVR + season stats, l.19979) — the thing that should open the screen like a FIFA/FM player card — sits ~20 cards and ~700 lines DOWN, after biography, role badge, rival, dressing room, press, agent, retire button and even the "Esporta salvataggio" utility. The actual attribute panel (l.20093) is a stack of 4px flat bars with a 3-tier danger-red colour ramp that paints most young players' stats red (looks like an error state), with no radar/hexagon. There is heavy content redundancy (two full trophy cabinets, 4 overlapping career-history/timeline cards, awards scattered across 5 cards, a Nazionale summary that duplicates the whole Nazionale tab). The biggest systemic defect is theme incoherence: a dozen cards hardcode dark gradients with rgba(255,255,255) text (dark islands in light mode), while dozens more hardcode light backgrounds (#f8fafc tiles, #e5e7eb/#e2e8f0 progress tracks, #eff6ff/#dcfce7/#fee2e2 pills) that turn into glaring white boxes in dark mode. Typography relies on repeated 8px labels and one identical fontSize:10 uppercase-muted section header for all 37 cards, flattening hierarchy. The Nazionale tab is cleaner and functional but visually plain (list rows, no premium national-team treatment) and shares the same hardcoded-light-colour dark-mode breakage. All of this is presentation-only and fixable within the frozen-logic constraint.

### Match presentation flow — 2D/UI overlays (MatchdayCard, FormationView, Walkout TV graphic, LiveMatch scoreboard/HUD, hl_choose/hl_result panels, goal cinematics, coach shouts, DPad, PostMatchPress, PressScreen)
The match flow is a tale of two design languages. The 6.5.3 FormationView redesign is genuinely premium broadcast-TV (clip-path VS band, kit-colored light spines, animated pressing meter, dot-matrix formation) and PostMatchPress is a well-committed newsprint look — these read AAA. Everything around them lags a generation behind: MatchdayCard is a flat centered admin card whose stat tiles hardcode a light-only #f8fafc background that breaks in dark mode; the in-match scoreboard is a dense telemetry HUD stacking two thin bars under a fog of 7px labels; the hl_choose/hl_result panels exist as two divergent copies (mobile-overlay vs desktop-panel) with color-coded borders left dangling and unexplained after the probability dots were removed; and the goal moment fires three overlapping GOL texts simultaneously. There is genuinely dead/superseded code (AIDecisionOverlay is defined but never mounted; PressScreen fully duplicates PostMatchPress) and a broken style token (TH.border is undefined in the Ended screen so a stat-card border silently renders nothing). Dark-theme coherence is the single biggest systemic gap: multiple surfaces hardcode #f8fafc/#f1f5f9/#64748b and rgba(0,0,0,0.03) that only work on light. All fixable in presentation, but substantial: unify the two pre-match screens' visual language, tokenize the hardcoded colors, consolidate the duplicated result/press panels, and raise the HUD typographic floor (kill everything at 7px).

### Design System foundations & cross-cutting code health (theme tokens l.159-182, UI primitives l.5510-5550, global CSS l.72-85, cross-file style patterns)
The foundation reads as a competent hobbyist admin-webapp theme, not a AAA game design system. There is a real token seed (a light/dark TH object with primary/success/danger/warning/gold/accent + five semantic bg/bd/tx card triads) and a handful of primitives (Card, Btn, StatBar, OvrRing, Notif, Sparkline), which is better than nothing — but it stops at ~10% of a premium system. The palette is missing the entire domain-semantic layer the brief requires (no victory/draw/loss, morale/energy/form/growth/regression, injury/suspension, record/trophy, info/surface/overlay/divider/secondary) so every match result, stat bar and status chip invents its own hardcoded hex inline — 360 distinct hex literals, 163 raw #fff, 186 rgba(255,255,255,…), 78 rgba(0,0,0,…) that ignore the theme and are dark-mode landmines. There is no type system at all: the global font is literally `sans-serif` (no designed/system-font stack), 37 distinct fontSize values across 1,586 declarations with fontSize:10 alone used 628 times and 7–9px type in 117 places (mobile readability + dated density), and hierarchy is carried almost entirely by weight 700/900 (everything shouts). Spacing/radius/elevation are ad-hoc (16 radius values, 700 padding literals, a single shadow token). Primitives lack states — inline styles mean essentially zero hover/active/focus/selected (8 onMouseEnter, 1 CSS :hover in a 21k-line app), and Btn's transition:all .15s never changes anything on interaction. Component library is ~6 primitives against ~25 needed: no Modal/Drawer/BottomSheet, Tabs, Badge, Avatar, Tooltip, Toast, Progress, Table, Input/Select/Toggle/Checkbox, EmptyState or Skeleton primitives — all built inline and duplicated. Animation is 29 scattered keyframes with no duration/easing scale. This is entirely fixable within a presentation-only remit and is the highest-leverage work in the whole audit: tokenize once and every screen inherits a premium feel.

**Totale findings: 152** — 🔴 9 critical · 🟠 45 high · 🟡 55 medium · 🔵 43 low

## Findings per area

---

## ENTRY & ONBOARDING FLOW (HOMESCREEN, CREATESCREEN, OFFERSSCREEN, TRIALFLOW, PROTRANSITIONSCREEN, TUTORIALOVERLAY)

### HomeScreen (title / save slots) `(12836-12958)`
*First screen a player ever sees: brand title, save-slot management (continue/new/delete), import save. Sets the entire first impression.*

- **🟠 HIGH · [ui] Title screen reads as a utility, not a AAA hero moment** `12875-12889`
  - The masthead (l.12875-12889) is a 78px inline SVG logo + Wordmark size 30 + two 11-12px subtitles ('Football Career Simulator' / 'From prospect to legend'), sitting directly above a dense list of save rows. There is no hero imagery, no stadium/pitch atmosphere, no depth — just white card-on-light-blue. For the product's single most important screen this looks like a settings page, not the front door of a football career game.
  - _Fix:_ Add a contained hero band behind the masthead (CSS gradient using TH.primary→TH.primaryDk with a subtle pitch/hex texture, flash-safe/static), enlarge the wordmark, and give the two taglines a clearer type ramp. Keep it a single self-contained block so it stays light+dark coherent via TH tokens.
- **🟠 HIGH · [dated] Save-slot empty/corrupted/overwrite states hardcode light-only colors** `12894-12945`
  - Empty slot uses background:'rgba(255,255,255,0.4)' + 2px dashed TH.cardBorder (l.12918) — the rgba-white is invisible/incorrect on any dark surface. Corrupted slot hardcodes #fca5a5/#fff1f2/#fee2e2 (l.12894-12899). The 'all full' overwrite card hardcodes #eff6ff/#bfdbfe and per-slot buttons #fee2e2/#dbeafe (l.12929-12940). None route through the TH bgRed/bdRed/txRed or bgBlue tokens that exist for exactly this.
  - _Fix:_ Replace rgba(255,255,255,0.4) with a token (e.g. TH.card at reduced opacity or a dedicated empty-slot token) and swap every hardcoded hex for TH.bgRed/bdRed/txRed and TH.bgBlue/bdBlue/txBlue so slots survive a dark theme.
- **🟠 HIGH · [hierarchy] Brand-new user gets no primary CTA — 'Nuova carriera' is a muted secondary button** `12912-12921`
  - For a first-time player all three slots are empty, and the only action per slot is Btn v='secondary' '⚡ Nuova carriera' (l.12920) — a grey muted button. 'Continua →' on filled slots is v='primary' (l.12912). So the flow inverts emphasis: the returning-player action is bold granata, but the brand-critical 'start your career' action for newcomers is de-emphasized grey. The whole screen can present zero primary-colored CTAs to a new user.
  - _Fix:_ Make the empty-slot 'Nuova carriera' the primary (granata) action when the slot is empty, or elevate the empty state into a single prominent 'Create your player' hero CTA for first-time users.
- **🟡 MEDIUM · [emptystate] Onboarding copy is buried below three dashed empty rows** `12917-12926`
  - The explanatory card ('Crea il tuo calciatore, supera i provini…') only renders when !hasAny and is placed AFTER the slot list (l.12924-12926), so a brand-new player first sees three identical dashed 'Slot N — vuoto' rows and only then the pitch. The empty state is an afterthought rather than the focal point.
  - _Fix:_ For a fully-empty state, promote the intro copy above/into the slot area and collapse the three redundant dashed rows into one inviting create panel.
- **🟡 MEDIUM · [ui] Save-slot card is a cramped 5-element admin row** `12902-12916`
  - Each filled slot (l.12902-12916) packs avatar 46px + name/club/date stack + OvrRing 40px + a vertical column of 'Continua →' and a 🗑️ Elimina button into one flex row with padding 12x14. It's information-dense and functional but visually flat — closer to a CRM list item than a premium 'career card'. The 🗑️ text-button (l.12913) and OvrRing label 'LVL' compete for attention.
  - _Fix:_ Give the slot more vertical breathing room, move destructive delete to an icon-only affordance revealed on hover/long-press, and treat the card as a mini player-card (kit color accent bar from club color, larger OVR) to raise perceived quality.
- **🟡 MEDIUM · [responsive] Sub-44px touch targets on delete and overwrite controls** `12899-12939`
  - Delete trash on a filled slot is padding:'5px' (l.12913); corrupted-slot delete is padding:'6px 12px' (l.12899); overwrite buttons are padding:'6px 10px' fontSize 11 with cryptic labels '⚠️S1'/'+S1' (l.12937-12939). All fall below the ~44px mobile touch-target guideline and the overwrite labels are unreadable shorthand.
  - _Fix:_ Raise interactive controls to min 40-44px hit area and replace '⚠️S1' shorthand with a clearer 'Sovrascrivi slot 1' affordance.
- **🔵 LOW · [navigation] Import save is a low-contrast pill stranded at the very bottom** `12950-12955`
  - '📂 Importa salvataggio (.json)' (l.12950-12954) is a 12px muted bordered label at the page foot. Discoverability is poor and its styling (border TH.cardBorder, bg TH.card) makes it look disabled.
  - _Fix:_ Group import with the other save actions or give it a clearer secondary-button treatment; acceptable to keep low-priority but make it legible.

### CreateScreen (player creation) `(12980-13098)`
*Core onboarding form: avatar, name, nationality, playstyle archetype, dream club, challenge mode → starts the trials.*

- **🟠 HIGH · [ux] Creation is one long scrolling form, not a guided moment** `13007-13094`
  - A single Card (l.3007) crams Identity (200px avatar preview + 6-per-page picker + name + nation) and 'Stile & percorso' (path info card + archetype grid + 200-item dream-club search list maxHeight 220 + a native <details> challenge section + CTA) into a two-column dump. It's a lot of simultaneous decisions with no progressive disclosure — the defining 'create your footballer' beat feels like filling out a registration form.
  - _Fix:_ Keep the data but stage it (avatar+name → style → optional dream/challenge) or at least visually separate the sections into distinct panels with stronger headings; make the 200px avatar the emotional centerpiece.
- **🟠 HIGH · [dated] Native <details>/<summary> disclosure for Challenge mode breaks the design system** `13086-13091`
  - Modalità Sfida uses a raw <details><summary> (l.13086-13091). It renders the browser's default triangle marker and unstyled disclosure behavior — visually and interactionally inconsistent with every other custom-styled control on the screen, and it looks distinctly like a debug/admin affordance.
  - _Fix:_ Replace with a styled collapsible using the app's own button/card idiom (chevron icon, TH tokens) matching the archetype/dream-club styling.
- **🟠 HIGH · [ui] Form inputs and selection states hardcode light-only hex** `12986-13085`
  - The shared input style inp uses background:'#f8fafc' (l.12986); archetype buttons use bg '#eff6ff'/'#f8fafc' and bonus chip '#f0fdf4'/'#bbf7d0' (l.13048,13057); dream-club rows use '#f8fafc'/'#eff6ff' (l.13075); legacy banner uses a one-off purple gradient (l.13085). Every field is locked to light and ignores TH.bgBlue/bgGreen/bgPurple tokens.
  - _Fix:_ Route inp background and all selection/chip backgrounds through TH semantic tokens so the creation screen is theme-coherent.
- **🟡 MEDIUM · [ux] Avatar picker is paginated 6-at-a-time behind ←/→ arrows** `12999-13029`
  - perPage=6 with prev/next arrow buttons (l.12999, 13017-13029) means the player must click through pages to even see all appearances, and the arrows are padding:'4px 12px' (sub-target). For a small avatar set this pagination adds friction to a fun step.
  - _Fix:_ Show all avatars in a single wrap/scroll grid (or a horizontally-scrollable filmstrip) so the whole roster is visible at once; drop the pager.
- **🟡 MEDIUM · [ui] Granata border + blue-tint fill on selected chips is visually incoherent** `13019-13075`
  - Selected avatar/archetype/dream buttons draw a TH.primary (granata #8e1f33) border but fill with '#eff6ff' (blue tint) (l.13019,13048,13075). Granata-on-blue is an accidental two-color selection language that doesn't match either the brand or a clean tonal selection.
  - _Fix:_ Use a single tonal selection built from TH.primary (e.g. a faint granata wash + granata border) so selection reads as one intentional accent.
- **🟡 MEDIUM · [navigation] Dream-club picker is a 200+ row scrolling button list** `13071-13082`
  - The dream club control (l.13071-13082) filters ALL non-U18 CLUBS into a maxHeight:220 vertical scroll of tiny 6px-padded rows. It's powerful but feels like an admin lookup table and buries an optional, emotional choice ('club dei sogni') in a data grid.
  - _Fix:_ Show a short curated set of top clubs as badges with a 'more…' search expansion, keeping the full list behind the search rather than as the default presentation.
- **🔵 LOW · [redundancy] 'Ruolo: Attaccante' stated twice** `13005-13039`
  - The fixed role is announced in the header subtitle (l.13005, 'Ruolo fisso: Attaccante') and again inside the 'Percorso carriera' info card region context; the header line adds little since role is non-editable.
  - _Fix:_ State the fixed role once, ideally as a small badge near the avatar rather than a full subtitle line.

### OffersScreen (post-trial club offers) `(13103-13150)`
*Payoff after the three trials: 2-3 U18 clubs bid for the player; user picks their first club.*

- **🟠 HIGH · [hierarchy] Two simultaneous 'primary' buttons destroy CTA hierarchy** `13137-13141`
  - Each offer's button is v={isSel?'primary':i===0?'primary':'secondary'} (l.13140). Index 0 is always primary AND the selected card is primary, so unless the top offer is also the selected one, the screen shows two bold granata 'Scegli →' buttons at once — the user can't tell which is the recommended action. The selection outline (#2563eb) adds a third competing signal.
  - _Fix:_ Exactly one primary CTA at a time (the selected offer), with the top/recommended offer marked by the '⭐ TOP' badge and a secondary button.
- **🟠 HIGH · [ui] Selection accent is generic blue, not brand granata** `13123-13130`
  - Selected card uses border '#2563eb', bg '#eff6ff', outline '2px solid #2563eb' (l.13130); top-offer border '#bfdbfe' (l.13130). This is the same off-brand blue used elsewhere in onboarding — the reveal moment (first pro-ish offer) should feel branded, not like a form highlight.
  - _Fix:_ Switch selection/emphasis to TH.primary tones (granata) and route the summary tile background '#f8fafc' (l.13123) through a TH token.
- **🟡 MEDIUM · [emptystate] Getting only 2 offers is silent and unexplained** `13105-13124`
  - offers count is perf>50?3:2 (l.13106). A weaker trial performance quietly yields fewer/worse clubs with no messaging tying it to the trial rating shown just above ('Rating medio {avg}'). The player may read the sparse list as a bug rather than a consequence.
  - _Fix:_ Add a one-line contextual note linking offer count/quality to trial performance (presentation-only copy driven by the existing perf value).
- **🔵 LOW · [opportunity] Offer cards under-sell the clubs** `13131-13144`
  - Each offer is a flat row: TeamBadge 44px + name + 'Prestigio {p}' (l.13131-13134). No sense of league level, ambition, or why this club wants you. For the emotional 'a club believes in me' beat it's thin.
  - _Fix:_ Enrich each card with league tier, a short scout-style line, and club color accent to make the choice feel weightier — data already exists on the club object.

### TrialFlow (U18 trial sequence) `(13469-13502)`
*Three-match trial gauntlet framing before offers; pre/post interstitials around the live match.*

- **🟡 MEDIUM · [ux] '[Enter]' keyboard hints shown on touch devices, plus a no-op button** `13500-13501`
  - Post-match copy shows 'Provino N+2/3 in arrivo. [Enter]' and the pre-match CTA embeds '[Enter]' (l.13500-13501) regardless of device — meaningless on mobile. When done, the final button is Btn onClick={()=>{}} label '⏳ Calcolo offerte...' (l.13500): it looks like a success-variant clickable control but does nothing (advance is a 300ms setTimeout), a confusing dead affordance.
  - _Fix:_ Gate '[Enter]' hints behind a desktop check (as other screens do with _dk) and render the terminal state as a non-interactive loading indicator, not a button.
- **🟡 MEDIUM · [ui] Trial interstitials are plain and hardcode light hex** `13499-13501`
  - Pre-match is 3 grey/warning dots (#e2e8f0 inactive, l.13501) + heading + one button; the in-match badge pill uses '#eff6ff'/'#bfdbfe' blue (l.13499). There is no opponent crest or atmosphere — 'Provino vs {opp.n}' is text-only. It reads as a bare wizard step, and the colors won't survive dark theme.
  - _Fix:_ Add the opponent TeamBadge and a bit of matchday framing to the pre-match card, and route the dot/pill colors through TH tokens (bgBlue/bdBlue, success/warning).
- **🔵 LOW · [opportunity] Trial progress lacks stakes/feedback beyond a running goal count** `13500-13501`
  - Between trials the only carried context is 'Hai già segnato N gol' (l.13501). There's no sense of whether the player is impressing scouts or how performance maps to upcoming offers.
  - _Fix:_ Surface a light 'scout impression' meter derived from the existing results ratings to give the gauntlet momentum (presentation of existing data).

### ProTransitionScreen (end of U18 → pro) `(11945-12029)`
*Career fork at end of U18: shows season summary, awards, U18-seasons progress, and 2-3 contract offers to turn pro or stay.*

- **🟠 HIGH · [responsive] Footer hint becomes a stray grid cell on desktop** `12025-12026`
  - The '.cpm-proto' wrapper (opened l.11996, closed l.12026) is display:grid 1fr 1fr at ≥900px (CSS l.21230-21231). The 'Scegli con cura — questa decisione…' hint div (l.12025) sits INSIDE that grid, so on desktop it is placed as a grid item beside the last offer card instead of spanning full width beneath the offers — a genuine layout break at the widescreen breakpoint.
  - _Fix:_ Move the footer hint outside the .cpm-proto grid container (after the closing tag), or give it grid-column:1/-1 so it spans both columns.
- **🟠 HIGH · [ui] Screen is saturated with light-only hardcoded colors** `11967-12016`
  - Status card bg/border #fff1f2/#fecaca or #eff6ff/#bfdbfe (l.11967), forced banner #fee2e2 (l.11980), last-chance #fef9c3 (l.11981), progress track #e2e8f0 (l.11989), offer cards #eff6ff/#fefce8/#fef9c3 (l.11999-12000), and chip backgrounds #dcfce7/#fee2e2/#f3e8ff/#fef9c3 (l.12010-12016). Every surface is locked to light despite TH.bgRed/bgBlue/bgAmber/bgGreen/bgPurple tokens existing.
  - _Fix:_ Replace the hardcoded hex with the matching TH semantic tokens throughout so the pro-transition is dark-coherent.
- **🟡 MEDIUM · [hierarchy] Offer cards are chip-heavy and hard to scan** `12009-12017`
  - Each offer stacks contractType + role/wage/duration line + up to five small pill chips (😄±N, 📈+N, ⚠️ Ultima chance, ⭐ Consigliato, ❌ Non confermato) at fontSize 10 (l.12009-12017). The most important signals (recommended vs non-confirmed) compete with numeric bonus chips, and 10px pills are low-legibility on mobile.
  - _Fix:_ Promote the decisive status ('⭐ Consigliato' / '❌ Non confermato') to a single prominent badge and demote the numeric bonuses to a compact secondary row.
- **🔵 LOW · [ui] Emphasis blue again diverges from brand granata** `11999-12015`
  - 'isMain' offers and the status card use #eff6ff/#bfdbfe blue emphasis (l.11967,12000,12015) while the app brand is granata — same accent-incoherence pattern seen across onboarding.
  - _Fix:_ Use TH.primary-based tones for the 'main/recommended' emphasis to keep the brand accent consistent.

### TutorialOverlay `(14244-14270)`
*4-step onboarding coach-marks shown on the dashboard for new careers (renders inside CareerApp, so TH is live/theme-aware).*

- **🔵 LOW · [ui] Solid and modern — only minor polish available** `14262-14264`
  - Bottom-anchored sheet (alignItems flex-end, padding-bottom 90px) with animated step dots that grow the active pill and mark completed steps in TH.success (l.14256-14260); correctly uses TH.card/primary/text/muted so it is theme-aware. The only weak spot is the 'Salta' control (l.14262): underlined TH.faint text at 12px is low-contrast and easy to miss.
  - _Fix:_ Bump 'Salta' to TH.muted with a slightly larger hit area; otherwise leave as-is — this is the reference-quality component of the flow.

---

## CAREER DASHBOARD — "HOME" TAB (TAB==="DASHBOARD") INSIDE CAREERAPP, L.17104–18442, PLUS SHARED HEADER/NAV/THEME (L.159–182, L.17747–17791, L.21103, L.21226–21264)

### Prompt-card stack (season-start avalanche) `(17815-18312)`
*The conditional prompt cards between the sticky CTA and the main grid — injury, contract, market window, president, suspension, jersey, nations cup, euro/mondiale, objectives, league shift, cup row, news x3, scout, mini-standings.*

- **🔴 CRITICAL · [hierarchy] ~18 cards at identical visual weight — no priority tiering, 3-second test fails** `17815-18312`
  - Every card from l.17816 to l.18312 is a `<Card>` (or dark-gradient card) with `marginBottom:8` and the same header pattern (`fontSize:10,color:TH.muted,textTransform:uppercase,letterSpacing:1.5`). At season start (pro, week 1-3) the stack can simultaneously render: career-stats widget (17816), recent-form strip (17827), ritiro pre-campionato (17843), contract expired (17897), market window (17905), injury (17943), president convocation (17991), jersey pick (18023), nations cup (18041), euro/mondiale (18066), season objectives (18086), league shift (18113), cup row (18139), league news (18168), world results (18184), market news (18207), scout preview (18223), mini standings (18279). A critical red injury alert and a filler 'Risultati Internazionali' list are visually indistinguishable.
  - _Fix:_ Introduce 3 presentation tiers on the same data: (1) ACTION-REQUIRED (injury/contract/president/jersey) — full accent card, top; (2) CONTEXT (next match, objectives, standings) — standard card; (3) AMBIENT (league news, world results, market voices) — collapse into a single tabbed/accordion 'Notizie' card or a smaller muted density. Cap simultaneously-open action cards (e.g. queue jersey after president). Zero logic change — only wrapper styling + a collapse container.
- **🟠 HIGH · [redundancy] Four separate near-identical news/list cards stacked** `18168-18221`
  - 'Notizie della Settimana' (18168), 'Risultati Internazionali' (18184), 'Voci di Mercato' (18207) and the 'Ultime notizie' log (18424) are four cards with the identical structure (uppercase micro-label + list of rows with a leading emoji/color bar). They form a monotonous ~4-screen scroll of the same visual template — the definition of an admin feed, not a game.
  - _Fix:_ Consolidate into ONE 'Notizie' card with internal segmented tabs (Lega / Mondo / Mercato / Diario) or an accordion, keeping each generator's output. Massive vertical-space and monotony win, purely presentational.
- **🟠 HIGH · [redundancy] Season objectives shown twice on the same screen at season start** `17991-18110`
  - The President convocation card lists every objective (l.18002-18006 mapping seasonObjectives with 🎯) and then the dedicated 'Obiettivi Stagione' progress card (l.18086-18110) lists the same objectives again with bars. Weeks 1-3, both are visible back-to-back.
  - _Fix:_ When the president card is active, suppress the standalone objectives card (or vice-versa), or fold the president card's list into a single-line teaser that points at the objectives card.
- **🟡 MEDIUM · [redundancy] Mini-standings duplicates the Stagione→Classifica tab wholesale** `18278-18312`
  - l.18279-18312 renders a mini league table (top 3 + me + relegation) on the dashboard; the exact same standings live in the dedicated Classifica tab. It adds a heavy 5-8 row block to an already overloaded Home.
  - _Fix:_ Reduce to a one-line 'you are Nº X · Ypt · [›]' chip that deep-links to the Classifica tab (same pattern already used for the Coppa row at l.18154), instead of a full table.
- **🟡 MEDIUM · [hierarchy] Loud 'PRIORITÀ' badge on passive info-only cards** `18050-18076`
  - Nations Cup (l.18050) and Euro/Mondiale (l.18076) render a filled `PRIORITÀ` pill, but the code comments explicitly say these are info-only ('Sprint 158: play via main CTA, card is info-only'). A high-contrast PRIORITÀ badge on a card the user cannot act on is misleading emphasis that competes with the real CTA.
  - _Fix:_ Downgrade to a neutral 'Prossimo impegno nazionale' tag, or move the badge onto the sticky CTA which is where the action actually happens.
- **🟡 MEDIUM · [dated] Prompt cards force always-dark gradient backgrounds regardless of theme** `17992-18025`
  - President (l.17992 `linear-gradient(135deg,#1c0d04,#2d1507)`), jersey (l.18025 `#0c1a2e,#0d2140`), suspension (l.18013 `#1f0707,#2d0a0a`) hardcode dark gradients. In LIGHT mode these are dark-navy/brown islands sitting between white cards — jarring and inconsistent; they also ignore the TH.bgAmber/bdAmber semantic tokens the other alert cards use.
  - _Fix:_ Route these through the semantic token set (TH.bgAmber/bgBlue/bgRed + txAmber…) so they invert correctly, or gate the gradient on darkMode. Keeps the 'premium' feel in dark, fixes the light-mode clash.

### Primary stats + KPI block (season card, morale grid, staff) `(18313-18438)`
*The main dash-grid: the green season summary card with stats+form+progress, the 2x2 morale/form/trust/popularity grid, the Staff & Spogliatoio bars, log, and shortcuts card.*

- **🔴 CRITICAL · [opportunity] KPIs are flat numbers + 3px hairline bars — no charts, trends, or the existing Sparkline** `18402-18422`
  - Morale/Forma/Fiducia/Popolarità (l.18405-18411) are four boxes each with a number and a 3px bar. Staff bars are 4px (l.18419). Week progress is 3px (l.18402). There are no delta/trend arrows, no sparklines, no value/market-value KPI at all on Home. A `Sparkline` component exists at l.5535 and is used nowhere here — a direct missed opportunity for OVR/morale/value trend lines that would instantly read as 'sports game' vs 'admin panel'.
  - _Fix:_ Build a hero KPI row: OVR ring + market value + form/morale each with a Sparkline of recent history and a ▲/▼ delta vs last week. Thicken bars to a consistent 6-8px with the value inline. All presentation; the underlying numbers already exist on `player`.
- **🟠 HIGH · [ui] Primary stats card is styled as a green 'success' alert, hardcoded light hex** `18315-18331`
  - The single most important card (season stats) is `<Card border="#bbf7d0" bg="#f0fdf4">` (l.18315) with a green uppercase header (l.18316). Green = success/objective-done everywhere else on this screen, so the hero card reads as an alert. Worse, the raw hex bypasses the TH.bgGreen/bdGreen tokens the other cards use → in dark mode it's a hardcoded pale-green panel with light text-contrast issues.
  - _Fix:_ Make the hero card theme-neutral (TH.card) or use the semantic token; reserve green strictly for completed objectives. Promote it typographically (larger stat numbers, real title) so it reads as the anchor, not an alert.
- **🟠 HIGH · [redundancy] Last-5 match form rendered twice on the same screen** `17827-18337`
  - The 'Forma' V/P/S circle strip at dashboard level (l.17827-17842, 28px circles) and the 'ULTIMI 5' square strip inside the season card (l.18337, 22px squares) show the same last-5 results with two different visual styles a few hundred pixels apart.
  - _Fix:_ Keep one canonical form widget. If both contexts are wanted, at minimum unify the shape/size/colors into one component so it doesn't look like two unrelated features.
- **🟡 MEDIUM · [navigation] Dark-mode toggle + manual Save buried / dated** `17766-18428`
  - The theme toggle is at the very bottom of the dashboard inside a keyboard-shortcuts card (l.18428) — users won't find it. Separately, the header has a manual '💾 Salva' button (l.17766) even though CLAUDE.md states autosave fires on every change; a manual save button with a timestamp is a classic admin-app tell.
  - _Fix:_ Move the theme toggle to the header/nav where settings live. Demote manual save to a passive 'Salvato · hh:mm' status indicator (autosave already runs), removing the button affordance.
- **🟡 MEDIUM · [dated] Hardcoded light bar-tracks and badge backgrounds break dark mode** `18301-18419`
  - Bar tracks use `#e2e8f0` at l.18402, 18409, 18419, 18104; streak/chemistry badges hardcode `#fff7ed/#fff1f2/#f0fdf4` (l.18339-18341); the result badge (l.18353) and mini-standings row highlight `#eff6ff/#fff1f2` (l.18301) are all light-only. In dark mode these render as glaring light patches inside dark cards.
  - _Fix:_ Replace track `#e2e8f0` with a theme token (e.g. `TH.cardBorder` or a new TH.track), and route badge bg/text through the TH.bgGreen/bgRed/bgAmber token pairs already defined at l.168-182.
- **🟡 MEDIUM · [readability] Sub-11px text and cryptic abbreviations** `18260-18420`
  - fontSize:9 on staff effect labels (l.18420), fontSize:8 on the standings gap '···' (l.18298) and nav keycode (l.21103), fontSize:7 on h2h squares (l.18272). Abbreviations 'gj' (l.18306), and 'Force {p}' (l.18260) as a label for prestige is an odd anglicism in an otherwise-Italian UI.
  - _Fix:_ Raise floor to 10-11px for any standalone label; rename 'Force' → 'Prestigio'/'Potenza', 'gj' → 'gio.' or a small clock/played icon with a title tooltip.
- **🔵 LOW · [dead-code] Dead `gs` variable and duplicated last-5 logic in stats IIFE** `18320-18333`
  - l.18320 declares `const gs=player.goalStreak||0;` inside the stats IIFE where it is never used (gs is re-declared and actually used in the following IIFE at l.18334). l.18332-18333 also recompute `last5` that the dashboard-level strip already computed at l.17828.
  - _Fix:_ Remove the dead l.18320 declaration; factor the last-5 computation into one shared const to avoid divergence.

### Sticky CTA & shared header/nav `(17747-17814, 21103-21264)`
*The sticky primary 'Vivi la Settimana / Gioca / Avanza' button, the brand+player header, the bottom nav tabs and sub-nav pills.*

- **🟡 MEDIUM · [redundancy] Primary action duplicated: sticky CTA + hidden 'Azioni singole' details** `18358-18400`
  - The sticky CTA (l.17799 handleContinua) is the primary path. The collapsible 'Azioni singole' <details> (l.18358) inside the season card ALSO exposes 'Vivi la settimana' (l.18363 liveCurrentWeek) and 'Avanza Settimana' (l.18377) — a second, parallel set of the same actions. Two mental models for the same operation.
  - _Fix:_ Keep the sticky CTA as the single primary. Reduce the details block to genuinely secondary/rare actions (Parla col Mister, force-advance) and drop the duplicate 'Vivi la settimana' tile, or make the details clearly 'advanced'.
- **🟡 MEDIUM · [ui] CTA disabled state uses hardcoded light gray** `17800-17800`
  - The sticky CTA disabled background is `#e5e7eb` (l.17800) and disabled boxShadow none — in dark mode this is a light-gray slab. The enabled gradient is fine; only the disabled path ignores theme.
  - _Fix:_ Use a theme token for the disabled fill (e.g. TH.cardBorder / a muted TH.card) so the disabled CTA reads correctly on both themes.
- **🟡 MEDIUM · [responsive] Desktop 2-col grid only wraps the bottom block; all prompt cards stay full-width single-column** `18313-21227`
  - .cpm-dash-grid becomes 2-col at ≥900px (l.21227), but that class only wraps the season/morale/staff/log block (l.18314). The ~15 prompt cards above (17816-18312) are outside it, so on wide desktop they render as narrow full-width single-column bars with large empty right space, wasting the sidebar-nav layout's horizontal room. Also `align-items:start` on the 2-col grid can pair a tall Staff card next to a short shortcuts card awkwardly.
  - _Fix:_ On ≥900px, place the ambient/context prompt cards into a 2-column or right-rail layout so desktop uses its width; keep single-column on mobile. Presentation-only via the grid container.
- **🔵 LOW · [dated] Nav tabs render a monospace '[K]' keycode under every tab label** `21103-21259`
  - Each bottom-nav button prints a third line `[M]/[C]/[S]…` in monospace fontSize:8 (l.21103); it's hidden on mobile via nth-child(3) display:none (l.21249) but shown on the desktop sidebar. A raw keycode caption under a nav label is a developer/admin aesthetic, not AAA.
  - _Fix:_ Drop the visible keycode line (keep the accelerator working via the `title` tooltip already present), or show it only on hover.

---

## STAGIONE CONTAINER — CALENDAR / STANDINGS / COPPE TABS (CAREERAPP)

### Standings (league table + scorers + cup + euro panels) `(18675-19018)`
*Primary competitive-context screen: where the user reads their league position, title/relegation race, top scorers, all-time records and every active cup.*

- **🔴 CRITICAL · [ui] User-team row highlight is a hardcoded light color — nearly invisible/inverted in dark theme and low-contrast in light** `18707, 18710`
  - The flagship league table highlights the user's own row with background:my?"#eff6ff":"transparent" (l.18707) and text color TH.primary (#8e1f33, which is NOT overridden in TH_DARK). On the dark card (#1e293b) this paints one jarring bright-blue band among near-white rows; in light mode #eff6ff on #ffffff is so faint that finding yourself in a 20-row table is hard. The single most important scannability affordance is the weakest visual element.
  - _Fix:_ Replace #eff6ff with the existing semantic token TH.bgBlue (has a proper dark variant #16233b) and use a stronger cue: a left accent bar in TH.primary + bold row. Keep the ★. This is a token swap already modeled elsewhere in the file.
- **🔴 CRITICAL · [readability] Sub-readable font sizes (7-8px) throughout tables and results** `18596, 18538, 18593, 18612`
  - The Euro group table header uses fontSize:7 (l.18596) and body rows fontSize:8-10; result lines, KO chips, legends and archive meta all sit at fontSize:8 (e.g. l.18538/18593/18612/18615/18616). 7-8px is below any legible minimum on mobile, fails accessibility, and is the hallmark of a cramped admin grid rather than a broadcast product.
  - _Fix:_ Establish a floor of 10-11px for data, 12-13px for names. Reduce columns/density instead of shrinking type (see mobile-overflow finding). Never render 7px.
- **🟠 HIGH · [ui] League table is a dated 11-column spreadsheet with color dots instead of crests** `18700-18722, 18708, 18710`
  - The main table (l.18700-18722) is a real <table borderCollapse:collapse> at fontSize:11 with 11 columns ["","#","Club","G","V","P","S","Gf","Gs","Diff","Pts"] and a 9px color dot (t.col||t.c, l.18710) as the only club identity. The Calendar card directly above uses full <TeamBadge> crests (l.18461) — so the app's most-viewed table is visually poorer than the list above it. No crest, no form-guide, no zebra, row separation is only a 3px left zone-bar sized by a spacer div (l.18708). This is peak admin-webapp.
  - _Fix:_ Swap the color dot for TeamBadge size~18; drop or merge low-value columns on mobile (Gf/Gs behind Diff); add subtle zebra via TH.bg alt rows; keep the zone accent bar. Modern football tables (Sofascore/FM) lead with crest + name + form.
- **🟠 HIGH · [redundancy] Cup / Euro / EuroMondiale panels duplicated from the Coppe tab into Standings** `18906-19018`
  - Standings re-renders Coppa Nazionale (l.18906-18928), Coppa Europea/UCL (l.18930-18976) and Europeo/Mondiale (l.18978-19018) — the exact same player.cup / player.euro / player.euroMondiale data that the dedicated Coppe tab already presents far more richly (l.20868+). This bloats the Standings scroll with near-duplicate cards, each with its own tiny layout and V/P/S formatting, and directly contradicts the 6.8.1 consolidation intent.
  - _Fix:_ Remove the cup/euro/euroMondiale cards from Standings (and Calendar) and leave a single compact clickable row that deep-links to the Coppe tab (the goTab('coppe') pattern already exists). Standings should be league + scorers + records only.
- **🟠 HIGH · [ui] Record / archive cards hardcode light pastel backgrounds — break the dark theme wholesale** `18786-18789, 18815, 18882, 18892`
  - The 'Record di Carriera' grid uses fixed light fills with dark text: #fef3c7/#92400e, #eff6ff/#1d4ed8, #f0fdf4/#15803d (l.18786-18789); the Albo d'Oro dominator chips (#fef9c3/#f1f5f9, l.18815), best-finish badge (l.18825), all-time scorers hero (#fef3c7 + border #f59e0b, l.18882) and player rows (#fef9c3, l.18892) do the same. In dark mode these render as bright pastel tiles on the #1e293b card — looks like a rendering bug. The correct tokens (TH.bgAmber/txAmber, TH.bgBlue/txBlue, TH.bgGreen/txGreen) already exist with dark variants and are simply not used.
  - _Fix:_ Replace every hardcoded pastel bg/text pair in these panels with the matching TH.bg*/tx* semantic tokens. Zero logic change, restores dark coherence and unifies the palette.
- **🟡 MEDIUM · [ui] Zone legend is color-only, 8px, and disconnected from the table** `18724-18728`
  - The relegation/European-spot legend (l.18724-18727) is a wrap of fontSize:8 colored text labels (["🏆 Campione","⬆ CL (1-4)"...]) coded purely by color. 8px + color-only fails accessibility (color-blind users can't map), and it sits detached below the table rather than as a swatch key.
  - _Fix:_ Bump to 10px, prepend a solid color swatch chip before each label (shape+color, not color-only), and align swatch colors to the ZONE_COLORS used on the row bars.
- **🟡 MEDIUM · [responsive] 11-column table only survives mobile via horizontal scroll, with no sticky club column** `18699, 18835`
  - The table relies on a parent overflowX:auto (l.18699). On a phone all 11 columns at 11px force horizontal scrolling, and because nothing is sticky, scrolling right to see Pts hides the Club name — you lose track of which row you're on. Nested archive list also uses maxHeight:260 overflowY:auto (l.18835), creating scroll-within-scroll.
  - _Fix:_ On mobile collapse to a compact card/row layout (crest + name + Pts + Diff, secondary stats behind a tap) or make the Club cell position:sticky left. Avoid nested vertical scroll regions on touch.
- **🔵 LOW · [inconsistency] Result-status glyph vocabulary is inconsistent across panels** `18952, 18955, 18666`
  - Win/draw/loss is shown as V/P/S in the Euro results (l.18955/18998) but W/D/L in the calendar week grid (l.18666), and home/away is 🏟️/✈️ in Calendar (l.18464) yet 🏠/✈️ in the Euro standings panel (l.18952). Same concepts, different symbols within one area.
  - _Fix:_ Pick one result token set (V/N/S is already used in Coppe l.20984 — standardize on it) and one home/away icon, apply everywhere.

### Calendar (season fixture list + history + week grid) `(18442-18671)`
*Schedule screen: upcoming fixtures with a Play CTA, played-match history with ratings, embedded cup/euro recaps, and a 38-week season grid.*

- **🔴 CRITICAL · [ui] Every state color in the fixture list and week grid is hardcoded light-only** `18460, 18465-18466, 18661-18663`
  - The current-match row highlight uses background:isCur?"#eff6ff" (l.18460); cup/euro badges hardcode #fef3c7/#92400e and #ede9fe/#7c3aed (l.18465-18466); the 38-cell week grid computes bg from #eff6ff/#f0fdf4/#fefce8/#fff1f2/#f8fafc (l.18661) with matching light-only borders/text (l.18662-18663). None reference TH tokens, so in dark mode the grid becomes a field of bright pastel squares on a dark card and the 'current week' cue is inconsistent with the rest of the UI.
  - _Fix:_ Route all of these through TH.bgBlue/bgGreen/bgAmber/bgRed (+ tx* for text, bd* for borders) which already carry dark variants. The win/draw/loss result colors should come from TH.success/warning/danger, not raw hex.
- **🟠 HIGH · [redundancy] Full Coppa and Euro recap cards embedded in Calendar duplicate Standings and Coppe** `18502-18648`
  - The Calendar tab renders an entire Coppa Nazionale card with full bracket results (l.18502-18563) and a full Euro card with group table + results + KO bracket (l.18564-18648) — a third copy of content that also lives in Standings (l.18906+) and Coppe (l.20868+). The Euro block even re-implements a 9-column group table (grid "16px 1fr 22px×6 28px", l.18595) that the Coppe tab renders differently. Three sources of truth for one dataset, three layouts to maintain.
  - _Fix:_ Calendar should show only the fixture list, history and week grid. Replace the embedded cup/euro cards with one-line 'next cup fixture' entries in the upcoming list (they already appear there via md.type checks) that deep-link to Coppe.
- **🟡 MEDIUM · [hierarchy] Week grid: current week and match markers are weak; 7-8px glyphs** `18652-18668`
  - The 6-col 38-week grid (l.18652-18668) marks scheduled matches with a 7px ⚽ (l.18666) and result with an 8px W/D/L letter. The 'current week' is only a faint #eff6ff fill + primary border — easy to miss, and the ⚽/letter markers are near-invisible at 7-8px. A season grid is a signature FM/EA element and here it reads as a muted spreadsheet.
  - _Fix:_ Enlarge cells, raise marker type to 10px, and give the current week a bold ring + label pill. Consider a form-strip (last-5 W/D/L colored chips) as a stronger, more premium summary.
- **🔵 LOW · [ui] Match-history rating uses raw traffic-light hex thresholds, not tokens** `18521, 18495`
  - The rating number (fontSize:18/900) colors via m.rating>=8?TH.success:...TH.danger (l.18495) which is fine, but the surrounding won/drew/lost dot and score reuse the same and are okay — the inconsistency is that adjacent embedded cup rows use raw #f0fdf4/#fff1f2 (l.18521) for the same V/X semantics. Mixed token vs hex within the same list.
  - _Fix:_ Normalize the V/X pill (l.18521) to TH.bgGreen/bgRed + success/danger to match the history dots.

### Coppe (European cup: group table, KO bracket, hall of fame) `(20868-21086)`
*Dedicated cups hub: national cup bracket, European competition (banner + group table + calendar + KO + winners), international tournament, and career palmares.*

- **🟠 HIGH · [ui] KO 'tabellone' is a flat text list, not a visual bracket, and uses 3-letter codes not crests** `20899-20923`
  - Both the National Cup 'Tabellone completo' (l.20906-20920) and the fallback KO list render each round as a vertical stack of rows 'ABC 2–1 XYZ' using getAbbr() 3-letter codes (l.20913-20915) at fontSize:10. There are no connecting bracket lines, no tree structure, no crests — the defining visual of a knockout cup is reduced to a spreadsheet. This is the single biggest missed opportunity to look AAA.
  - _Fix:_ Render an actual bracket: two facing columns per round with connector lines, winners advancing visually, TeamBadge crests, the user's path highlighted. Even a simple CSS-grid bracket tree would transform perceived quality with zero data changes.
- **🟠 HIGH · [inconsistency] Sibling competition cards get wildly different visual treatment** `20878, 20943, 21053, 21066`
  - The Coppa Europea card has a premium gradient banner header (_ecBg linear-gradient, white title, l.20943-20956) — the only modern element in the whole area. But the National Cup card right above it (l.20878) is a flat white card with a 1px #fde68a border and a 10px uppercase label, and the Europeo/Mondiale card (l.20853) and Palmares (l.21066) are equally flat. Within one screen, one competition looks broadcast-grade and its siblings look like form fieldsets.
  - _Fix:_ Apply the same banner-header treatment (per-competition gradient/crest + status pill) to National Cup, Europeo/Mondiale and Palmares so all competitions share one premium card system.
- **🟠 HIGH · [ui] Hardcoded light-only fills across the Coppe cards break dark theme** `20874, 20882-20884, 20977, 21005, 21057-21060`
  - Status pills and rows hardcode light hex: cup champion #fef3c7/#f59e0b and eliminated #fee2e2 (l.20882-20884), the V/X bar #dcfce7/#fee2e2 (l.20874), player bracket rows #fffbeb (l.20912), group-table qualify rows #f0fdf4 and player row _ecBorder+'44'/#fff7ed (l.20977), calendar result rows #dcfce7/#fffbeb/#fee2e2 (l.21005), Europeo pills #cffafe/#e0f2fe (l.21057-21060), and Palmares row bg TH.bg (the one correct one). In dark mode the pastel pills/rows glow on the dark card.
  - _Fix:_ Swap to TH.bg*/tx*/bd* semantic tokens (bgGreen/bgRed/bgAmber all have dark variants). The status pills should derive from TH.success/danger/warning + their bg tokens.
- **🟡 MEDIUM · [readability] Group table and calendar rows drop to 8px, and combine V/N/S into one cramped cell** `20971-20990, 21008-21009`
  - The Coppe group table header/meta and the 'V N S' combined column render at fontSize:8 (l.20972, 20984, 20990), and the calendar round label + week are 8px (l.21008-21009). The 'row.w+V·row.d+N·row.l+S' string (l.20984) packs three numbers into a 54px cell — hard to parse. This is denser and smaller than even the Standings table.
  - _Fix:_ Raise data to 10-11px, and split or icon-code W/D/L rather than a run-on 'V·N·S' string. Give the table more vertical breathing room; it's a hub screen, not a dense grid.
- **🟡 MEDIUM · [inconsistency] Two different group-table layouts for identical euroGroupTable() data** `18595, 20971`
  - The Calendar tab renders euroGroupTable() as a 9-column grid ('16px 1fr 22px×6 28px', l.18595) showing G/V/P/S/GF/GA/Pt, while the Coppe tab renders the SAME euroGroupTable() as a 5-column grid ('18px 1fr 26px 54px 28px', l.20971) showing Pt / V·N·S / GD. Same source, two column schemas, two densities — users see the standings differently depending on the tab.
  - _Fix:_ Define one Euro group-table component and reuse it in both places (or, per the redundancy fix, only render it in Coppe).
- **🔵 LOW · [ux] Empty/locked states are plain centered emoji cards, not on-brand** `21082-21083`
  - The not-pro and no-active-cup states (l.21082-21083) are a 32px emoji + two gray text lines centered in a white card. Functional but generic; misses a chance to tease the competition art/rewards the user is working toward.
  - _Fix:_ Give locked states a subtle branded background and a concrete unlock hint with the same card system as active competitions.

---

## CLUB / TRAINING / AGENTE (ECONOMY) TABS — CAREERAPP (CARRIER-MANAGER-AV.HTML)

### Club tab (squad / stadium / coach / roster / trophies) `(19021-19251)`
*Overview of the player's club: identity, stadium, contract snapshot, coach relationship, season objectives, full roster, trophy cabinet.*

- **🟠 HIGH · [dead-code] TH.cardBg is undefined — contract stat tiles render with no background** `19097,19102,19106`
  - Lines 19097, 19102, 19106 set background:TH.cardBg on the three Contratto tiles (wage / scadenza / durata). TH.cardBg does NOT exist in the TH or TH_DARK objects (l.159-182 define card, cardBorder, bg — not cardBg). grep confirms 3 uses, 0 definitions. So background resolves to undefined and the tiles are transparent instead of the intended tinted panels — the numbers float on the raw card with no visual container.
  - _Fix:_ Replace TH.cardBg with an existing token: use TH.bg (subtle inset) or the semantic TH.bgBlue/bdBlue pair for a real tinted tile. Same value works in both themes because those tokens are theme-aware.
- **🟠 HIGH · [dated] Roster is a flat admin list with no OVR or stat visualization** `19178-19205`
  - renderRow (l.19178-19187) outputs jersey# (fontSize10 faint) + role emoji + name (fontSize11) + role text (fontSize10 faint), rows gap:2 padding:'4px 6px'. No OVR, no rating, no position color, no age — nothing that reads like a squad screen in a football game. It looks like a CSV dump. Titolari/Panchina split is the only structure.
  - _Fix:_ Add a right-aligned OVR chip per row (reuse the value>=80 green / >=65 amber color logic already in StatBar/OvrRing) and a small position accent bar/dot using role color. Increase row height and name to ~13px. Presentation-only; the roster data already exists in _rosterRaw.
- **🟡 MEDIUM · [responsive] isMe roster highlight uses off-brand blue, and long names have no truncation** `19181-19185`
  - l.19181 highlights the player's own row with background:'rgba(59,130,246,0.1)' (a blue) and l.19184 colors the name TH.primary (maroon #8e1f33) — two different accent identities on the same row. The name cell is flex:1 with no overflow/ellipsis, so a long generated name can push the role label off-screen on narrow mobile.
  - _Fix:_ Use a TH.primary-tinted background (e.g. TH.bgAmber/bgBlue token or primary+'14') so highlight and text share one brand color; add overflow:hidden;textOverflow:ellipsis;whiteSpace:nowrap to the name cell (pattern already used in the Agente rumor list l.19470).
- **🟡 MEDIUM · [redundancy] Coach trust shown three ways in Club AND duplicated in Agente tab** `19114-19143`
  - The Allenatore card (l.19114-19143) renders coachTrust as a number (l.19130), a text label _ctLabel (l.19136) and a progress bar (l.19139) — three encodings of one value. The same trust also appears in the Agente header as 'RAPPORTO MISTER' → trustLabel (l.20399-20400). Cross-tab the user sees the coach relationship 4+ times.
  - _Fix:_ Keep the bar+label in Club (drop the standalone number badge or merge it into the bar), and in Agente reference it as a compact link rather than a re-stated metric. Presentation consolidation only.
- **🟡 MEDIUM · [ui] Trophy counts and stars use hardcoded ambers instead of TH.gold, and prestige is double-encoded** `19066-19071,19216-19238`
  - Bacheca counts use color:'#f59e0b' (l.19218,19228,19238) while the design system defines TH.gold as #b45309 — two different golds. In the header, prestige is shown both as a star row (l.19066) and as a large number in TH.warning (l.19070-19071): redundant encoding of the same 0-99 value, and TH.warning (amber) reads as a caution color for what is a neutral rating.
  - _Fix:_ Route all trophy/prestige gold through TH.gold for one consistent trophy color; keep either the stars OR the number as the primary prestige signal (stars for at-a-glance, number as a small subtitle), and move the prestige number off TH.warning to TH.gold/TH.text so it doesn't read as a warning.
- **🔵 LOW · [dated] Ten near-identical uppercase micro-headers create a spreadsheet rhythm** `19078-19210`
  - Every card header repeats fontSize:10, textTransform:'uppercase', letterSpacing:1.5, color:TH.muted (l.19078, 19095, 19121, 19148, 19191, 19210, …). Combined with fontSize:8 sub-labels (Capienza, Prestige, /settimana) the whole tab is tiny gray caps — the classic admin-panel look, low perceived quality for a premium game.
  - _Fix:_ Introduce one shared SectionHeader style with slightly larger weight and an accent tick/emoji chip, and lift the key values (capacity, wage) to a stronger size. Consistency + hierarchy, no layout change.
- **🔵 LOW · [ui] Progress-bar track hardcoded #e2e8f0 breaks in dark theme** `19138,19165`
  - The coach-trust bar (l.19138) and objective bars (l.19165) hardcode background:'#e2e8f0' for the track. OvrRing (l.5530) does the same. In dark theme (TH_DARK) this stays light-gray, an inconsistent light track on dark cards.
  - _Fix:_ Use TH.cardBorder (already theme-aware) for bar tracks, matching StatBar (l.5527 which correctly uses TH.cardBorder).

### Training tab (attributes + auto-training panel) `(19254-19277 + TrainPanel 14289-14382)`
*Shows the player's 8 attributes with weekly-gain badges and the auto-executed coach training plan (coach message, 3 session chips, fatigue/form/rating chips, completion state).*

- **🟠 HIGH · [readability] StatBar red-below-65 thresholds make a normal footballer look alarming** `5525-5527,19263-19272`
  - StatBar (l.5525-5527) colors value>=80 green, >=65 TH.warning (amber), else TH.danger (RED). A typical player's attributes sit 55-72, so the Attributi card renders mostly RED and amber bars — visually screaming 'weak/bad' for an ordinary or good player. The 4px-tall track (l.5527) is also very thin to read on mobile. This is the primary stat visualization of the game and it reads as an error state.
  - _Fix:_ Rescale to a football-appropriate ramp (e.g. >=85 elite, 70-84 strong, 55-69 neutral/brand color, <55 weak) and reserve red for genuinely poor values; thicken the bar to ~6-7px and add the numeric value inline. Presentation-only; values unchanged.
- **🟡 MEDIUM · [dated] Auto-training panel is a wall of hardcoded pastel pill-chips (light-only)** `14344-14369`
  - TrainPanel's stat/status row (l.14363-14369) is a flex-wrap of ~5 pills each with hardcoded light backgrounds (#fee2e2,#fef3c7,#f0fdf4,#f0f9ff,#fff7ed) and the coach message box uses background:'#f8fafc' (l.14344). None reference TH tokens, so in dark theme these stay light — light chips on a dark card. The rainbow of red/amber/green/blue/orange chips also reads busy and admin-like.
  - _Fix:_ Route chip backgrounds through the theme-aware semantic tokens (TH.bgRed/bgAmber/bgGreen/bgBlue and their bd/tx partners) that already exist for exactly this; consolidate to fewer, calmer chips. Fixes dark theme AND the busy look at once.
- **🔵 LOW · [hierarchy] Weekly-gain legend and +1 badges are near-invisible; no focal point** `19256-19272`
  - The '+1 = guadagnato settimana' legend (l.19259-19261) and the inline +1 badges (l.19269) are fontSize:10 with hardcoded #16a34a/#dcfce7. The Attributi card has no headline OVR or 'what improved this week' summary at the top — the most rewarding info (growth) is the least emphasized.
  - _Fix:_ Add a small OVR + weekly-delta header to the Attributi card and enlarge the +1 gain badges; use TH.success/bgGreen tokens instead of raw #16a34a for dark-theme parity.
- **🔵 LOW · [ui] Session-plan chips depend on optional-chained color with fragile fallback** `14352-14379`
  - Plan chips (l.14357) build borders/bg from t?.col+(done?'88':'44'). For recovery sessions t is a literal with col:'#0284c7'; fine, but the whole visual weight of the panel rests on one hardcoded blue and alpha-hex concatenation, and the 'in corso…' vs '✅ completato' states (l.14370-14379) are plain centered text with little celebration for a core progression loop.
  - _Fix:_ Give the completion state a stronger success treatment (TH.bgGreen card + the gains list styled as chips) so finishing a training week feels rewarding rather than a gray line of text.

### Agente tab (economy / patrimonio / contract / transfers / staff perks) `(20310-20644)`
*The player's agent hub: personal finances (patrimonio + staff perks), agent identity, transfer window actions, market rumors, contract status, transfer/loan state, weekly agent task, and agent speech.*

- **🟠 HIGH · [ui] Entire Agente tab is light-theme-only — dozens of hardcoded light hex, no TH_DARK adaptation** `20407-20628`
  - Almost every panel hardcodes light backgrounds that never adapt: Patrimonio/perk rows via TH.cardBorder only but perk toggle uses raw values; Market window #ecfdf5/#6ee7b7/#f0fdf4 (l.20407-20447); Contract tiles #f8fafc ×4 (l.20484-20498); warning strips #fee2e2/#fff7ed (l.20502); loan card #f5f3ff/#ede9fe (l.20572-20594); cession card #fffbeb/#fef2f2/#fff1f2 (l.20522-20557); task cards #f8fafc (l.20614); offer card #eff6ff (l.20628). In dark theme these render as light boxes on a dark page — a broken, unusable tab. This is the single biggest theme-coherence regression in the area.
  - _Fix:_ Systematically replace the light literals with the theme-aware semantic tokens already defined (bgGreen/bdGreen/txGreen for the market window, bgBlue for contract/offer, bgRed for cession/warnings, bgPurple for loan, bgAmber for pending). They map to correct dark values automatically.
- **🟠 HIGH · [hierarchy] Patrimonio (money) is a bare header number, not a KPI — the economy's headline is underplayed** `20344-20351`
  - The Patrimonio value (l.20348-20349) is just a fontSize:16 number in the top-right of a small card header, with the wage as a fontSize:10 subline (l.20351). For a tab literally about money, the flagship figure has no icon emphasis, no trend/delta, no card of its own — it reads like a minor label. Meanwhile market value (l.20396) is fontSize:15 inside the dark hero, so the two money figures compete without a clear primary.
  - _Fix:_ Promote Patrimonio to a real KPI card: large value (~24-28px), a coin/wallet accent, and a weekly +/- delta (wage in − perks/agent out). Establish one money hierarchy: patrimonio = primary, market value = secondary.
- **🟡 MEDIUM · [dated] Mixed card languages — dark-gradient hero cards next to flat light tiles** `20370-20628`
  - Within one scroll the tab mixes always-dark gradient hero cards (l.20370 #0f172a→#1e293b, l.20379 #0c1a2e→#1a2744) with flat light-gray tiles (#f8fafc contract/task cards) and pastel colored panels (green/purple/red). There is no consistent card system — it looks assembled from different eras. The dark heroes also don't invert in dark theme (they're fine there) while the light tiles do the opposite, so neither theme looks unified.
  - _Fix:_ Pick one card treatment (theme-aware tokens) as the baseline and reserve the dark gradient for a single hero (the agent identity). Convert contract/task/offer cards to the standard Card + semantic tint so the tab reads as one system in both themes.
- **🟡 MEDIUM · [readability] Inconsistent money formatting across the tab** `20349,20351,20360,20396,20486`
  - Patrimonio formats as 'M€'/'k€' suffix (l.20349); market value as '€{valStr}' with € PREFIX and M/k suffix (l.20396); wage as 'k€/sett.' (l.20351,20360); annual wage via _fmtWageY133 helper (l.20486). So the user sees €-prefix and €-suffix, k€ and M€, in adjacent cards — no single currency convention. Comment at l.20318 even notes a prior 10× display bug in this area.
  - _Fix:_ Adopt one money formatter/convention (symbol position + k/M rules) and apply it to patrimonio, market value, wage and clauses uniformly.
- **🔵 LOW · [redundancy] Multiple italic agent-quote blocks and a duplicated market/trust readout** `20399-20400,20628-20639`
  - The tab has two separate italic quote cards — 'Opinione agente' (l.20628-20634) and 'X ti dice' speech (l.20636-20639) — plus the header. 'RAPPORTO MISTER' (l.20399-20400) restates coachTrust already shown fully in the Club coach card. Several near-identical 10px uppercase headers repeat the admin rhythm seen in Club.
  - _Fix:_ Merge the two agent-voice blocks into one contextual line, and drop the duplicated mister readout (or make it a link to Club). Consolidates voice and reduces vertical clutter.
- **🔵 LOW · [ui] Staff perk cards and toggles are visually thin for a monetized feature** `20352-20366`
  - Perk rows (l.20352-20366) are separated only by a 1px borderTop, with description+cost at fontSize:9 and a small ATTIVO/ATTIVA text button (fontSize:10). For features that cost weekly money and change training/recovery, the treatment is minimalist to the point of looking like a settings list, not an investment.
  - _Fix:_ Give each perk a proper card with icon, benefit, cost, and an on/off state that visually reads as 'hired staff' (avatar chip + active glow using TH.bgGreen). Presentation-only.
- **🔵 LOW · [dead-code] Orphan placeholder comment where a card was relocated** `20404`
  - Line 20404 is a lone '{/* Allenatore — ora nel tab Club */}' comment marking where the coach card used to live before it moved to the Club tab (l.19113). It's dead scaffolding left in the render tree.
  - _Fix:_ Remove the orphan comment.

---

## CARRIERA CONTAINER — "PROFILO" TAB (PLAYER PROFILE / HERO CARD / STATS / CAREER HISTORY / TROPHIES / DIARY) AND "NAZIONALE" TAB (NATIONAL TEAM / TOURNAMENTS / CALL-UPS)

### Profilo (tab==="profile") `(19280-20307)`
*The player's home/identity screen: who you are, your rating, career stats, history, trophies, awards, records, diary, relationships, contract, milestones — should read as a premium FIFA/FM player card + trophy cabinet.*

- **🔴 CRITICAL · [hierarchy] Player-identity HERO card is buried ~20 cards deep** `19280-19997`
  - The identity card (AvatarPhoto + name + OVR ring + season-stat grid, l.19979-19997) is the natural hero of a player-career screen, but it renders AFTER: biografia (19286), role badge (19293), career sparklines (19309), record personali (19342), bacheca trofei (19364), storico allenatori (19398), rivale (19433), club dei sogni (19507), spogliatoio (19521), stampa (19559), capitano (19585), città (19599), agente (19622), match del cuore (19640), archetipo (19660), record&premi (19678), corsa ai premi (19738), MVP mese (19795), memoria (19823), diario (19861), U18/pro status, contratto (19914), transfer/prestito/ritiro, AND even 'Esporta salvataggio' (19976). A user opening their profile scrolls past ~20 secondary cards before seeing their own name, face and rating. The screen order is roughly the inverse of information priority.
  - _Fix:_ Reorder the JSX so the identity card (19979) + attributi (20091) render FIRST, immediately followed by the trophy/awards summary, then history, then the long tail (relationships, press, memoria, diario) and finally utilities (export/retire). No data changes — pure JSX reordering within the same array of conditionals.
- **🟠 HIGH · [responsive] Dark-gradient 'island' cards ignore the light/dark theme entirely** `19286-19675`
  - At least 7 cards hardcode a dark gradient background with rgba(255,255,255,x) text regardless of theme: biografia background:'linear-gradient(135deg,#0f172a,#1a1f2e)' + text rgba(255,255,255,0.72) (19286-19288), rivale #1e1b4b/#312e81 (19433), club dei sogni #1e293b/#0f172a (19507), spogliatoio #0c1a2e/#112240 (19521), capitano #064e3b (19585), agente #0c1a2e (19622), archetipo #0f172a/#1e293b (19660). In LIGHT theme these become dark rectangles interspersed with white Card()s — visually incoherent, and they never adapt when the user switches theme.
  - _Fix:_ Route these through the semantic theme tokens (TH.bgBlue/bgPurple/bgGreen + TH.txBlue/txPurple/txGreen, defined l.168-182 with dark variants) or through TH.card, so the cards restyle with the theme instead of being permanent dark islands.
- **🟠 HIGH · [responsive] Hardcoded LIGHT backgrounds break dark theme across the whole tab** `19703-20122`
  - Dozens of surfaces use light-only hex that will render as bright boxes on a dark card: stat tiles background:'#f8fafc' (19917, 19995, 20037), U18 tiles '#dbeafe'/'#fee2e2'/'#dcfce7' + progress track '#e2e8f0' (19888-19898), Corsa-ai-Premi progress track '#e5e7eb' (19733), disciplina tiles '#fefce8'/'#fff1f2' (20100-20104), albo d'oro bg '#fefce8' (20122), award pills '#fef3c7'/'#dbeafe'/'#f0fdf4' (19703-19705), MVP pill '#fef3c7' (19804), diary node boxShadow '0 0 0 3px white' (19869). None respond to TH; in dark mode the game becomes white-box-on-slate.
  - _Fix:_ Replace literal light hex with TH tokens (TH.bg for tile fills, TH.cardBorder for tracks, TH.bgAmber/bgGreen/bgBlue for tinted pills). The token set already has correct dark values — the cards just bypass it.
- **🟠 HIGH · [ui] Attributes shown as thin flat bars with an alarming danger-red ramp — no radar** `20091-20094`
  - The attribute panel (l.20091-20094) renders player.stats via StatBar (l.5525), a 4px-tall bar whose colour is danger-red for value<65, warning for 65-79, success for 80+. A typical U18/young pro has most of 8 attributes in the 50-64 band, so the profile shows a wall of RED bars — reads as failure/validation-error, the opposite of the aspirational tone a career game wants, and nothing like the radar/hexagon FIFA/FM use.
  - _Fix:_ Presentation-only: raise bar height (~6-8px), switch to a neutral-to-brand fill (e.g. TH.primary) with only a subtle accent for elite (>=85) instead of red-for-average, and/or add an SVG radar built from the same 8 player.stats values (reuse the Sparkline SVG approach). Keep StatBar's data untouched.
- **🟠 HIGH · [redundancy] Two separate trophy cabinets render the same player.trophies** `19364-20134`
  - '🏆 Bacheca Trofei' (l.19364-19393, grouped chips on a gold gradient) and '🏆 Albo d'oro' (l.20120-20134, a plain list) both iterate player.trophies and show league/season/club. The user sees their championships twice, in two different visual languages, ~750 lines apart.
  - _Fix:_ Keep one unified trophy cabinet (the richer grouped Bacheca, 19364) and delete the Albo d'oro list (20120), or fold cup/euro/national into the single cabinet. Pure JSX removal, no data change.
- **🟠 HIGH · [redundancy] Four overlapping career-history views + awards scattered across five cards** `19309-20166`
  - Career progression is visualised four times over the same player.history/diary: 'Statistiche Carriera' sparklines (19309), 'Memoria della Carriera' worldMemory list (19823), 'Diario di Carriera' timeline (19861), and 'Timeline Stagioni' (20136). Separately, individual awards live in 'Record Personali' (19342), 'Record & Premi Personali' (19678), 'Corsa ai Premi' (19738), 'MVP del Mese' (19795) and the two trophy cards — six cards covering records/awards with heavy conceptual overlap and no single 'career/achievements' home.
  - _Fix:_ Consolidate: one season-timeline (merge sparkline trend into Timeline Stagioni), one events feed (merge Memoria into Diario), and one Awards/Records section (fold Record Personali + Record & Premi + MVP into a single cabinet; keep Corsa ai Premi as the only forward-looking 'in progress' card). Reordering/merging JSX only.
- **🟡 MEDIUM · [navigation] ~37 stacked cards in one flex column with no sub-navigation or sectioning** `19281-20306`
  - The whole tab is a single <div flexDirection:column gap:12> (19281) holding ~37 conditional Card()s. On mobile this is an extremely long, undifferentiated scroll with no anchors, accordions, or sub-tabs, and every card carries equal visual weight, so finding e.g. the contract or the trophy cabinet means scrolling blind.
  - _Fix:_ Group into 3-4 collapsible sections or an inner segmented control (Identità · Carriera · Trofei/Premi · Relazioni), or at least insert lightweight section dividers/anchors. Presentation-layer grouping around existing cards.
- **🟡 MEDIUM · [hierarchy] Every card uses the identical fontSize:10 uppercase-muted header — flat weight** `19310-20199`
  - All ~30 section labels share one recipe: fontSize:10, textTransform:'uppercase', letterSpacing:1.5, color:TH.muted (e.g. 19310, 19343, 19399, 19560, 19824, 20092, 20138, 20199). A minor card ('La Stampa') looks exactly as important as a major one (trophy cabinet, attributes). Nothing signals a primary vs secondary section.
  - _Fix:_ Introduce 2-3 header tiers (a larger/bolder header for primary sections like Attributi/Trofei/Timeline, the current micro-label for tertiary cards). Type-scale change only.
- **🟡 MEDIUM · [readability] Repeated 8px text below mobile legibility floor** `19385-19491`
  - Numerous labels are fontSize:8: 'GOL CARRIERA' and 'TROFEI' in the rival card (19446,19454,19460), trophy sub-line S.season (19385), award legend (19475,19490-19491), disciplinary/various. 8px is under the ~10-11px practical minimum on phones and reads as cramped/admin-grade.
  - _Fix:_ Raise all 8px labels to >=10px; the layouts have room (these sit under 14-22px numbers). Font-size only.
- **🟡 MEDIUM · [redundancy] 'Espansione Nazionale' card in Profilo duplicates the entire Nazionale tab** `19998-20090`
  - l.19998-20090 renders a full national-team summary (flag header, caps/goals grid, world ranking top-5, current/next tournament, 'Momenti in Nazionale') inside the Profilo tab. This substantially duplicates the dedicated Nazionale tab (20647-20865), including the tournament status and the national-moments feed — the same content maintained in two places, two visual styles.
  - _Fix:_ Reduce the profile version to a compact one-line summary (caps · goals · ranking) that deep-links to the Nazionale tab, and let the Nazionale tab own the full breakdown. JSX slimming only.
- **🟡 MEDIUM · [ui] Hero identity card is underwhelming and mislabels position** `19979-19997`
  - The identity card (19979) is a plain white Card with a 64px circular avatar, a 48px OvrRing, and a 3x3 grid of '#f8fafc' stat tiles — visually an account-profile widget, not a FIFA player card. Worse, the subtitle hardcodes 'Attaccante' (l.19984: `{player.nation} · Attaccante · Età {player.age}`) even though player.position exists and is used elsewhere (l.10684, 19039) — a non-forward player is mislabelled.
  - _Fix:_ Elevate: larger portrait, club-colour accent/kit backdrop (player.club.col is available, used at 19986), position derived from player.position instead of the literal 'Attaccante', and treat OVR as the focal element. Presentation + swap the hardcoded string for player.position.
- **🔵 LOW · [ui] OvrRing: hardcoded light track, 'LVL' label, and emoji-only iconography** `5529-5531`
  - OvrRing (l.5529-5531) uses a conic-gradient track hardcoded '#e2e8f0' (breaks in dark) and labels the rating 'LVL' at fontSize:8, while the rest of the game says 'OVR'. More broadly the tab leans entirely on platform emoji (📖📈🏅🏆🧑‍💼🆚📰) for every section icon — renders inconsistently and reads less premium than a custom icon set.
  - _Fix:_ Token the OvrRing track (TH.cardBorder), relabel 'LVL'→'OVR' for consistency, and consider a small consistent inline-SVG icon set for primary section headers. Presentation-only.
- **🔵 LOW · [ui] Inconsistent card padding and stat-tile scale break the visual rhythm** `19995-20039`
  - Cards mix paddings '12px 14px', '11px 14px', '14px', '10px 14px', '16px 14px' against Card's default '16px 18px' (5511), and stat-tile value sizes vary (identity tiles fontSize:14 at 19995 vs nazionale/other tiles fontSize:20 at 20031/20039). Adjacent cards therefore have different internal margins and number weights, giving a slightly 'assembled over 100 sprints' feel.
  - _Fix:_ Standardise on ~2 padding presets and one stat-tile type scale across the tab. Style-object cleanup only.
- **🔵 LOW · [navigation] Utility actions interleaved into the identity flow** `19952-20304`
  - '📁 Esporta salvataggio' (l.19976) is placed immediately BEFORE the hero identity card, and '📋 Copia Riepilogo Carriera' (20304) plus the retire/confirm flow (19952-19974) sit amid content cards. Save/export/retire are settings-grade actions and shouldn't interrupt the identity/stats reading order.
  - _Fix:_ Move export/copy/retire into a dedicated utilities block at the very bottom (or a settings area). JSX relocation only.

### Nazionale (tab==="nazionale") `(20647-20865)`
*National-team home: identity/prestige, pending call-up, Coppa delle Nazioni + Euro/Mondiale tournament tracking, first-call-up progress, national-moments history.*

- **🟠 HIGH · [responsive] Hardcoded light colours throughout break the dark theme** `20658-20780`
  - The whole tab paints with light-only literals: the reusable result badge `_bar` hardcodes '#dcfce7'/'#fffbeb'/'#fee2e2' fills (20658); Coppa card bg/pills '#eff6ff','#eff6ff0a' (20706,20728); Euro/Mondiale pills '#cffafe','#fee2e2','#dcfce7','#e0f2fe','#fef3c7','#f1f5f9' (20753-20776); qualificazioni 'prossima'/'da giocare' chips '#fef3c7'/'#f1f5f9' (20764). In dark mode these become bright boxes on the slate card. Only the header gradient (`${natCol}20,${TH.card}`, 20662) is theme-aware.
  - _Fix:_ Route badge/pill fills through TH tokens (TH.bgGreen/bgAmber/bgRed/bgBlue and their text tokens) so V/P/S badges and status chips restyle with the theme. The `_bar` helper is the highest-leverage single fix (one function, used everywhere).
- **🟡 MEDIUM · [readability] 8px text and tiny emoji tiles reduce legibility** `20674-20856`
  - National-moments dates use fontSize:8 (20847 'S.week', 20856), and the header stat row emoji are fontSize:10-12 with the label fontSize:10 (20674-20676) — dense and cramped on phones. The status-dot glyphs (●▶○) at fontSize:10 in a 12px-wide box (20764) are near-invisible.
  - _Fix:_ Lift 8px→>=10px and give the timeline/status glyphs a slightly larger, colour-coded chip. Font-size only.
- **🟡 MEDIUM · [redundancy] 'Momenti in Nazionale' and tournament status duplicated with the Profilo tab** `20833-20862`
  - The national-moments feed here (l.20833-20862, filtered via isNationalEvent) and the current/next-tournament block essentially repeat what the Profilo tab's 'Espansione Nazionale' card already shows (19998-20090), including a second 'Momenti in Nazionale' list (20077-20087). Two tabs maintain overlapping national content in different layouts.
  - _Fix:_ Make the Nazionale tab the single owner of tournaments + national moments; collapse the Profilo copy to a summary link (see Profilo finding). JSX consolidation only.
- **🟡 MEDIUM · [ui] National-team screen is a plain functional list — misses AAA opportunity** `20662-20802`
  - Beyond the gradient header (20662), the tab is stacked list rows (fixtures, points, KO results). There's no premium national-team treatment — no cap-milestone timeline, no kit/badge, no visual for the 'Convocato→Titolare→Senatore→Leggenda' status the code already computes at 20680-20681. The rich data (caps, goals/cap, ranking, tournament brackets) is under-presented.
  - _Fix:_ Elevate the header into a national 'card' (flag + status tier as a visible badge/progress, caps milestone rail) and give tournament brackets a small visual bracket rather than text rows. Presentation-only, reusing the existing computed values.
- **🔵 LOW · [responsive] Very dense single-line ternary fixture rows risk wrapping on small phones** `20761-20779`
  - The qualificazioni row (20764) is one giant inline ternary emitting status dot + 'vs opp' + a chip, all in flexed spans with fixed widths; likewise group rows (20772-20779). On 320px with longer opponent names these can wrap awkwardly since the opponent span is `flex:1` with no ellipsis/overflow handling.
  - _Fix:_ Add whiteSpace:'nowrap'+textOverflow:'ellipsis' on the opponent name spans and ensure the trailing chip has flexShrink:0. Style-object only.
- **🔵 LOW · [ui] Fragile alpha-hex-append backgrounds** `20662-20746`
  - Several backgrounds append a 2-char alpha to a 6-digit hex to fake transparency: '#eff6ff0a' (20706), '#ecfeff0a' (20746), `${natCol}0e` (20688), `${natCol}20` (20662). 8-digit hex works in modern engines but is easy to typo (e.g. '0a' is ~4% opacity — nearly invisible, so the intended tint barely shows) and mixes conventions with the rgba() used elsewhere.
  - _Fix:_ Standardise on rgba()/token tints so the intended opacity is explicit and theme-safe. Cosmetic cleanup.
- **🔵 LOW · [ui] Metric shown differs from the Profilo national card (prestige vs ranking)** `20668-20668`
  - This header shows 'Prestige Mondiale: {nd.p}/100' (20668) while the Profilo 'Espansione Nazionale' card headlines 'Ranking Mondiale: #{_myRank}' (20028) for the same nation — two different top-line metrics for the same entity across tabs, which is confusing.
  - _Fix:_ Pick one primary national metric (ranking) and show the other as secondary consistently in both places. Display wording only.

---

## MATCH PRESENTATION FLOW — 2D/UI OVERLAYS (MATCHDAYCARD, FORMATIONVIEW, WALKOUT TV GRAPHIC, LIVEMATCH SCOREBOARD/HUD, HL_CHOOSE/HL_RESULT PANELS, GOAL CINEMATICS, COACH SHOUTS, DPAD, POSTMATCHPRESS, PRESSSCREEN)

### MatchdayCard `(8941-9010)`
*Pre-match hub: competition banner, badges, stadium/attendance/weather/kickoff tiles, scout CTA*

- **🟠 HIGH · [dated] Stat tiles hardcode light-only background — break in dark theme** `8982,8989`
  - l.8989 each stat tile is background:"#f8fafc" (near-white) with border TH.cardBorder. In dark theme the card (TH_DARK.card=#1e293b) hosts four near-white blocks — jarring, off-system, and the away-persona chip at l.8982 (color:#64748b on background:#f1f5f9) is unreadable/inverted on dark.
  - _Fix:_ Replace #f8fafc with TH.bg (or a new TH.tileBg token added to both TH/TH_DARK); route the persona chip through TH.muted/TH.bgBlue tokens so both themes stay coherent.
- **🟠 HIGH · [ui] Flat centered 'VS' layout clashes with the premium FormationView that follows it** `8969-8994`
  - MatchdayCard (badge / 28px TH.faint 'VS' / badge, plain 2x2 tile grid l.8987-8994) is a generic admin card, while the very next screen FormationView (l.9155+) is a full broadcast lower-third with kit-color spines and animated meters. Two consecutive pre-match screens speak completely different design languages — the hub reads dated by comparison.
  - _Fix:_ Restyle MatchdayCard to share FormationView's broadcast vocabulary: dark broadcast panel, kit-color accents, the stadium/attendance/weather/kickoff as a TV lower-third strip rather than a 2x2 admin grid. Reuse the same ACC amber accent and hairline.
- **🟡 MEDIUM · [readability] Crude two-word stadium truncation can mangle names** `8988`
  - l.8988 stadium value is (stadium||'–').split(' ').slice(0,2).join(' ') — a blunt first-two-words cut that turns e.g. 'Stadio Giuseppe Meazza' into 'Stadio Giuseppe' and drops meaningful suffixes.
  - _Fix:_ Use CSS truncation (whiteSpace:nowrap;overflow:hidden;textOverflow:ellipsis) on the tile instead of word-slicing, so the full name shows when space allows and ellipsizes cleanly when not.
- **🔵 LOW · [ui] Non-deterministic weather/time fallback re-randomizes every render** `8944-8945`
  - l.8944-8945 when weatherObj/kickoffHour are absent the code calls pick([...]) at render time, so meteo/orario flicker to new random values on every re-render — the exact class of bug 6.3.3 set out to kill, still latent in the fallback path.
  - _Fix:_ Compute the fallback once (useMemo keyed on match identity) or derive it from the same seeded source LiveMatch uses, so a missing prop still yields a stable value.
- **🔵 LOW · [hierarchy] Redundant league label shown twice** `8961,8970`
  - The competition banner (l.8961) already shows the league/competition in uppercase; l.8970 repeats leagueName again in tiny letterspaced caps right below it. Duplicate labeling weakens hierarchy.
  - _Fix:_ Drop the l.8970 repeat, or demote it to a divider; let the banner own the competition identity.

### FormationView (broadcast pre-match) `(9090-9239)`
*Broadcast lower-third formations, VS band, opponent tactic scout meter*

- **🟡 MEDIUM · [ux] Dev jargon 'Tattica deterministica' leaks to the player** `9226`
  - l.9226 renders the caption 'Tattica deterministica' under the opponent scout meter. 'Deterministic' is engine vocabulary (seeded RNG), meaningless-to-alarming for a player and an admin/debug tell in an otherwise premium panel.
  - _Fix:_ Replace with a diegetic caption ('Report dello scout' / 'Analisi pre-partita') or remove it.
- **🔵 LOW · [ui] Prestige pips are unlabeled — meaning is opaque** `9134-9135,9181,9187`
  - l.9181/9187 render 1-5 dot pips from team.p under each club name (via _pips/_pipRow) with no legend. Players can't tell if dots mean prestige, form, or rank.
  - _Fix:_ Add a tiny caption ('Prestigio') once, or replace pips with a labeled star/tier chip consistent with the scout meter language.
- **🔵 LOW · [readability] Vignette + scanline overlay sits above the CTA row and can mute its contrast** `9157-9159,9229-9234`
  - l.9157-9159 a zIndex:3 scanline+radial-vignette layer covers inset:0 of the whole panel including the bottom CTA area (l.9229). pointerEvents:none keeps it clickable, but the radial darkening at the bottom corners overlaps the 'Salta' ghost button, slightly dimming it.
  - _Fix:_ Constrain the vignette to the hero/formation region (not inset:0), or lower its bottom opacity so the CTA stays at full contrast.
- **🔵 LOW · [opportunity] Panel is dark-committed regardless of theme (acceptable, but note the seam)** `9155`
  - l.9155 background is a fixed dark gradient (#0a0e1a→#0d1528). This is a deliberate single-look broadcast choice and reads well, but for light-theme users it is a dark island abutting light chrome — the transition can feel abrupt.
  - _Fix:_ Keep the dark broadcast look (correct for TV framing) but add a matching dark framing/margin treatment on light theme so the island reads as intentional rather than a stray dark block.

### LiveMatch Scoreboard / HUD `(11322-11377)`
*Top score bar: team badges/scores, clock, possession + momentum bars, pause*

- **🟠 HIGH · [readability] Sub-legible 7px typography floods the HUD** `11346,11358-11359,11365-11366`
  - The centre column uses fontSize:7 for the competition label (l.7px at 11346), possession legend (l.11358-11359), momentum caption (l.11365-11366). 7px is below any legible minimum, unreadable on mobile and a classic dense-admin/telemetry tell — the opposite of clean broadcast scoreboards.
  - _Fix:_ Raise the floor to ~9-10px, cut the number of labels (a single 'POSS 62%' is enough; drop the 'momentum ⚡ ⚡' caption), and rely on iconography + color instead of tiny words.
- **🟡 MEDIUM · [ui] Two stacked thin bars + captions make a cluttered HUD** `11354-11367`
  - Possession (5px) at l.11354 and momentum (4px) at l.11361, each 80px wide with their own 7px legends, are stacked in the score centre. Broadcast scoreboards keep the centre to clock + one meter; this reads as an engineer's debug telemetry stack.
  - _Fix:_ Merge into one primary indicator (possession as the bar, momentum as a subtle color pulse or a single tick marker) and move the secondary metric out of the top bar.
- **🔵 LOW · [redundancy] Score-color winning/losing ternary duplicated four times** `11328,11336,11374`
  - The same (isMatchHome?winning:losing)?'#4ade80':(...)?'#f87171':'#f1f5f9' pattern is inlined for home score (l.11328), away score (l.11374) and again in the clock chip (l.11336), each hardcoding the green/red/neutral hexes.
  - _Fix:_ Extract a scoreColor(side) helper and shared token trio (win/lose/neutral) so the palette is defined once and stays consistent.
- **🔵 LOW · [responsive] Team name clamped to 70px — most names ellipsize immediately** `11327,11373`
  - l.11327/11373 maxWidth:70 on the team name means anything past ~8 chars is cut, so the scoreboard usually shows a truncated club name.
  - _Fix:_ Prefer the 3-letter abbreviation in the tight scoreboard (already available as team.a) and reserve full names for wider layouts.

### hl_choose action buttons (mobile overlay + desktop panel) `(11616-11778)`
*Interactive moment: directional pad + numbered action choices*

- **🟠 HIGH · [ux] Color-coded button borders are now an unexplained signal after dots were removed** `11649-11651,11762-11764`
  - 5.93.0 removed the probability pips (comments at l.11658,11773) but kept the success-rate-derived border color _rc2/_rc (green>70 / amber>50 / red, l.11651,11764). The border hue still encodes odds with zero legend, so players see red/green outlines with no idea what they mean — a weaker, more cryptic affordance than the removed dots.
  - _Fix:_ Either commit to removing the odds signal entirely (neutral borders) or add a one-line legend/label so the color has meaning. Don't ship an unlabeled encoded signal.
- **🟡 MEDIUM · [redundancy] Action buttons are two divergent implementations (mobile vs desktop)** `11654-11659,11767-11774`
  - Mobile buttons (l.11654-11659) and desktop buttons (l.11767-11774) are near-duplicate JSX with different selected-bg opacity (0.65 vs 0.45), different border alpha (88/44 vs 66/33), different padding and different font-weight logic (isSel?700:400 desktop only). Same control, two styles, double maintenance and subtle inconsistency between form factors.
  - _Fix:_ Extract a single ActionButton component parameterized by size/dense so mobile and desktop share one styling source.
- **🟡 MEDIUM · [responsive] Touch targets below the 44px guideline** `11621,11640,11655`
  - Mobile action buttons use padding:'10px' (l.11655) ≈ 38-40px tall; the rigore direction grid uses padding:'9px 4px' (l.11640) making narrow ~34px cells; DPad default size is 40 (l.11621,11636). All under the ~44px recommended tap target, risky mid-action on phones.
  - _Fix:_ Bump interactive rows to min-height 44px and give the rigore grid cells more vertical padding; DPad size 44 on narrow.
- **🔵 LOW · [readability] Action text relies on textShadow over a bright live 3D field** `11632,11655`
  - Mobile overlay scrim is only rgba(5,8,20,0.28) (l.11632) with button bg rgba(0,0,0,0.55); legibility of the 11px labels leans entirely on textShadow over whatever the pitch shows behind. Over bright crowd/sky it can wash out.
  - _Fix:_ Strengthen the scrim behind the action stack (gradient to ~0.55 at the bottom) or give the button column a solid dark plate.

### hl_result reveal panel `(11667-11793)`
*Outcome reveal after an action (overlay on mobile, side panel on desktop)*

- **🟡 MEDIUM · [redundancy] Result panel duplicated with feature drift between mobile and desktop** `11672-11681,11785-11793`
  - Mobile result (l.11672-11681) has the FALLO flag animation, outcome.cause and aiCommentary; desktop result (l.11785-11793) omits the FALLO flag treatment and uses different bg alphas (0.55 vs 0.7). Same semantic outcome, two hand-maintained variants that have already drifted.
  - _Fix:_ Unify into one ResultReveal component (dense prop for the side panel) so the fallo flag, cause line and tones are identical everywhere.
- **🔵 LOW · [ui] Result background colors hardcoded, not tokenized** `11673,11786`
  - Success/fail backgrounds rgba(5,50,20,0.55)/rgba(50,5,5,0.55) (l.11673) and 0.7 variants (l.11786) plus the foul rgba(40,20,0,0.72) are inline magic values, disconnected from TH.bgGreen/bgRed semantic tokens.
  - _Fix:_ Map to the semantic bgGreen/bgRed/bgAmber tokens (or dark-panel equivalents) so result coloring is centrally defined.

### Goal cinematics (floatGoal / goalCinema / crowdChant) `(11506-11525)`
*On-goal overlays: floating GOL text, centre cinema title, crowd chant*

- **🟡 MEDIUM · [hierarchy] Three overlapping GOL texts fire simultaneously on a goal** `11506,11514-11517,11518-11525`
  - On a hero goal, floatGoal '⚽ GOL!' renders top (l.11506, 22px), goalCinema 'GOOOOL!' renders centre (l.11514-11516, 38-52px), and crowdChant also pulses a goal message at the bottom (l.11518-11524). Three redundant goal announcements stack at once — cluttered and amateur next to a clean broadcast lower-third.
  - _Fix:_ Pick one hero moment (goalCinema centre) and demote/suppress the other two on goal (keep floatGoal only for assists/other outcomes; let the crowd chant be audio/particles, not a third text).
- **🔵 LOW · [ui] Heavy double text-glow + stroke reads as early-2010s motion-graphics** `11512,11515`
  - goalCinema uses textShadow '0 0 30px + 0 0 60px' plus WebkitTextStroke 1px and italic (l.11515); pressureCinema similar (l.11512). The double neon glow is a dated video-game-title effect; modern broadcast graphics use crisper type with restrained shadow.
  - _Fix:_ Reduce to a single tighter shadow, drop the stroke or make it subtle, and lean on layout/weight for impact rather than glow.
- **🔵 LOW · [opportunity] Flash-safety is handled well — preserve it when reworking** `9769-9771,11514`
  - Positive note: goal flash is routed through the flashScreen governor (l.9769-9771, 750ms min interval, opacity capped 0.42) and goalShake/goalDrop are one-shot easings — WCAG-conscious. Any goal-overlay rework must keep firing white flashes only via flashScreen, never direct setScreenFlash.
  - _Fix:_ When consolidating the three goal texts, keep the single governed flash and avoid adding new full-screen luminance pulses.

### Walkout TV pre-kickoff graphic `(11448-11505)`
*On-field broadcast card during walkout: standings/competition compare + DIRETTA lower-third*

- **🔵 LOW · [ui] Dense stat table with 9px labels leans admin, not broadcast** `11467-11477`
  - The league compare block (l.11467-11473) is a 6-row Punti/Vittorie/Pareggi/... table with 9px uppercase captions and zebra striping — informative but table-like/spreadsheet-y for a walkout hero moment. The DIRETTA lower-third below (l.11496-11502) is the more modern element.
  - _Fix:_ Trim to 3-4 headline stats (Punti, Forma, Posizione) shown as broadcast tiles rather than a full 6-row table; let the DIRETTA strip carry the TV feel.

### Ended (full-time) screen `(11867-11924)`
*Final whistle: score, stat grid, rating, coach verdict, key events*

- **🟠 HIGH · [dead-code] TH.border is undefined — stat-card borders silently render nothing** `11891`
  - l.11891 uses border:`1px solid ${TH.border}`, but the TH/TH_DARK objects (l.159-182) define cardBorder, not border. TH.border is undefined, so the string becomes '1px solid undefined' and the browser drops the border entirely — the secondary stat cards have no intended border in either theme.
  - _Fix:_ Change to TH.cardBorder (the actual token). Grep the file for other TH.border usages while fixing.
- **🟡 MEDIUM · [dated] Secondary stat cards use light-only rgba(0,0,0,0.03) fill** `11891`
  - l.11891 background:'rgba(0,0,0,0.03)' is a barely-there light-gray wash that vanishes on TH_DARK.card (#1e293b), leaving the four Falli/Corner/Tiri/ Tiro-medio cells as flat borderless text on dark — no card affordance.
  - _Fix:_ Use TH.bg / a semantic tile token that reads in both themes (pair with the TH.border→cardBorder fix so the cells regain their frame).
- **🔵 LOW · [redundancy] Rating computation duplicated three times inline** `11815,11845,11897`
  - The clamp(5.8 + rb*0.115 + resultBias, 4.0, 10.0) rating formula is copy-pasted in the desktop stats panel (l.11815), the mobile compact bar (l.11845) and the Ended screen (l.11897), each re-deriving color thresholds too.
  - _Fix:_ Extract computeMatchRating(mStats, score) + ratingColor(r) helpers; call from all three sites.

### PostMatchPress (rassegna stampa) `(8735-8817)`
*Newspaper post-match: masthead, headline, scoreline, pagella + stat bars, other papers, MOTM, fans*

- **🔵 LOW · [opportunity] Strong committed newsprint look — extend the ambition, mind single-theme** `8753,8776-8792`
  - This is the best surface in the flow: cream+serif masthead, double-rule divider, shimmer loading, pagella with stat bars (l.8753-8813). It commits to a single light newsprint look (correct editorially). Only caveat: it is intentionally theme-agnostic cream, so verify it reads fine when embedded in a dark-theme session shell.
  - _Fix:_ Keep as-is; optionally add a subtle dark 'evening edition' variant only if the surrounding chrome makes the cream sheet feel disconnected. No regression needed.
- **🔵 LOW · [readability] 8px letterspaced section eyebrows push legibility floor** `8779,8795,8806`
  - Section labels PAGELLA/DALLE ALTRE TESTATE/MIGLIORE IN CAMPO run at fontSize 8 with letterSpacing 1-2 (l.8779,8795,8806). In a serif newsprint context 8px caps are on the edge of readable, especially mobile.
  - _Fix:_ Nudge eyebrows to 9-9.5px; the newsprint grid has room.

### PressScreen (archive) `(8819-8921)`
*Legacy press recap: header, headlines, rating, MOTM/flop, tactical note, fans, quotes, trending*

- **🟠 HIGH · [redundancy] Fully duplicates PostMatchPress content model — superseded parallel UI** `8819-8921`
  - PressScreen renders the same domain (headlines, playerRating, motm, fanReactions, quotes, trending) as PostMatchPress but in the old flat Card style. Per project notes PostMatchPress became THE post-match rassegna; PressScreen 'resta per l'archivio', so the app now carries two full press UIs with divergent looks — the archive one drags the perceived quality down whenever reached.
  - _Fix:_ Either retire PressScreen (route archive views to PostMatchPress) or restyle it to the newsprint system so the game never shows two different press aesthetics.
- **🟡 MEDIUM · [dated] Multiple hardcoded light-only backgrounds break dark theme** `8848,8913`
  - Headline rows use background:'#f8fafc' (l.8848) and the trending card uses background:'#f0f9ff' (l.8913); both are near-white and clash on TH_DARK.card. The rest uses TH tokens, so the mix looks half-migrated.
  - _Fix:_ Swap #f8fafc→TH.bg and #f0f9ff→TH.bgBlue so the archive respects both themes.

### AIDecisionOverlay `(8923-8936)`
*Old red-alert opponent-tactic box (pre-FormationView-redesign)*

- **🟡 MEDIUM · [dead-code] Component defined but never mounted — dead code superseded by FormationView scout meter** `8923-8936`
  - AIDecisionOverlay (l.8923) is a red-tinted '🤖 TATTICA AVVERSARIA (AI)' box. Grep shows only the definition, no JSX usage anywhere — the 6.5.3 FormationView scout lower-third replaced it. It ships as dead weight and its '(AI)'/robot styling is exactly the admin/debug aesthetic the redesign moved away from.
  - _Fix:_ Delete the component (presentation-only, no logic). If a fallback is wanted, fold it into FormationView's scout block styling.

### DPad `(8612-8634)`
*Directional touch/mouse pad for moving the player during highlights*

- **🟡 MEDIUM · [responsive] Default 40-42px buttons under the touch-target guideline** `8613,11621,11636`
  - DPad default size is 42 (l.8613) and is instantiated at size 40 in the mobile HL overlays (l.11621,11636), yielding 40px arrow buttons — under the ~44px recommended tap target for a control used repeatedly under time pressure mid-highlight.
  - _Fix:_ Raise the narrow-screen DPad size to 44-48; the arrow glyphs (fontSize 16) scale fine.
- **🔵 LOW · [ui] Plain semi-transparent buttons feel utilitarian vs the broadcast HUD** `8615-8623`
  - Dark DPad buttons are rgba(0,0,0,0.52) with a hairline border and no pressed-state feedback (l.8615-8623) — functional but flat next to the amber-accented broadcast styling elsewhere.
  - _Fix:_ Add a subtle active/pressed state (scale or accent ring) and align the accent with the ACC amber used across the match UI for cohesion.

---

## DESIGN SYSTEM FOUNDATIONS & CROSS-CUTTING CODE HEALTH (THEME TOKENS L.159-182, UI PRIMITIVES L.5510-5550, GLOBAL CSS L.72-85, CROSS-FILE STYLE PATTERNS)

### Color tokens / palette (TH & TH_DARK, l.159-182) `(159-182)`
*The single source of truth for all color across light+dark themes; every screen pulls from here or hardcodes around it.*

- **🔴 CRITICAL · [dated] Entire domain-semantic color layer is missing** `159-182`
  - TH exposes only primary/primaryDk, success/danger/warning, gold, accent, and five card triads (bgBlue/bdBlue/txBlue … bgPurple). The brief's required game semantics have NO tokens: victory/draw/loss, morale, energy, form, growth, regression, injury, suspension, record, trophy, info, plus structural surface/overlay/divider/secondary. Grep for TH.morale/TH.energy/TH.victory/TH.injury/TH.info/TH.surface/TH.divider = 0 hits. Result: a match win, a morale bar, a form arrow, an injury badge and a suspension chip all invent their own inline hex (360 distinct hex literals in the file). Nothing is coherent or themeable.
  - _Fix:_ Extend TH/TH_DARK with the full semantic set: victory (reuse success family), draw (a neutral amber/slate), loss (danger family), morale, energy, form, growth (green), regression (red), injury (orange-red), suspension (deep red/black), record (violet), trophy (gold family), info (blue), plus surface (a second elevation above card), overlay (rgba scrim), divider (lighter than border), secondary. Define once for light and dark. Map existing hardcoded usages to them. Purely additive to the token object.
- **🟠 HIGH · [dark-theme] No overlay/scrim, surface-elevation, or divider tokens → modals & sheets hardcode rgba that breaks in dark** `176-182`
  - There is exactly one surface (card) and one border (cardBorder), one shadow. 25 position:fixed overlays and dozens of modals (weekLiveModal, interviewModal, misterDiscorsoModal, nationsCupModal, coachModal…) therefore hardcode their scrims and panels — rgba(0,0,0,…) appears 78×, rgba(255,255,255,…) 186×. These do not respond to TH, so overlays that look right in light theme are wrong (too weak scrim / white-on-white panels) in dark.
  - _Fix:_ Add TH.overlay (e.g. rgba(0,0,0,.55) light / rgba(0,0,0,.72) dark), TH.surface (elevated panel), TH.surfaceHi, TH.divider. Route every modal/sheet backdrop and elevated panel through them.
- **🟡 MEDIUM · [ui] Only two brand hues; accent (#7c3aed violet) clashes with primary (#8e1f33 maroon) with no bridging tokens** `163-165`
  - primary is a maroon #8e1f33, accent an unrelated violet #7c3aed, gold is actually a brown #b45309 (not a metallic gold), warning #d97706 and gold #b45309 are near-duplicates that read the same on screen. There is no primary-tint/primary-100/primary-weak scale, so tinted backgrounds are improvised per-screen.
  - _Fix:_ Rationalize the ramp: give primary a 3-step tint scale (primaryWeak/primarySoft/primary/primaryDk), make gold a true metallic gradient token distinct from warning, and either drop accent or promote it to a defined secondary with its own tints. Keep hues low-saturation for the premium look already targeted.

### Typography system `(72-85, global)`
*Governs every piece of text — the biggest single driver of 'premium' vs 'admin webapp'.*

- **🔴 CRITICAL · [dated] No font system — global font-family is literally 'sans-serif'** `85`
  - The only font-family declarations in the file are `font-family:sans-serif` on the loader (l.85), a cursive stack for the wordmark, and monospace for .kbd. #root (l.85) sets no font-family, so the whole app renders in the browser default sans (Arial/Roboto/Times-ish depending on OS). No system-font stack, no designed display face, no numeric/tabular font for stats. This alone makes every screen look like an internal tool.
  - _Fix:_ Add a body font stack to #root/body: a modern system stack (-apple-system,'Segoe UI',Roboto,Inter-ish) for UI, plus font-variant-numeric:tabular-nums on all stat/score numbers, and reserve the existing cursive only for the Elevora wordmark. If a custom face is desired, self-host one weight range. Zero logic impact.
- **🔴 CRITICAL · [readability] 37 distinct fontSize values, 1,586 declarations, no scale; 7–9px type used 117×** `global`
  - Distinct fontSize numbers span 7,8,8.5,9,9.5,10,11,12,…,96. fontSize:10 appears 628×, fontSize:11 304×, fontSize:8 68×, fontSize:7 24×, fontSize:9 25×. Sub-10px text (117 occurrences) is below comfortable mobile reading size and screams dense admin table. There is no type scale — sizes are chosen ad-hoc everywhere.
  - _Fix:_ Define a token scale (e.g. xs12/sm13/base14/md16/lg18/xl22/2xl28/display) and map the 37 values onto ~8 steps, raising the 7–9px cluster to a 10–12px floor for body/label text. Presentation-only; can be done token-by-token.
- **🟠 HIGH · [hierarchy] Hierarchy carried by weight, not scale — 700/900 dominate (521 of 696 weight uses)** `global`
  - fontWeight distribution: 700×366, 900×155, 800×117, 600×51, 400×5, 500×2. Almost everything is bold-to-black; regular (400) is used 5 times in the entire app. When everything is heavy, nothing stands out — hierarchy collapses and the UI feels shouty/cheap rather than calm-premium.
  - _Fix:_ Establish a weight scale (400 body, 500 label, 600 emphasis, 700 heading, 800/900 reserved for hero numbers/scores only) and let size+color carry hierarchy. Convert the bulk of 700 body text to 400/500.
- **🔵 LOW · [ui] letterSpacing & lineHeight inconsistent, mixed string/number units** `global`
  - letterSpacing values: 1.5 (125×), 1 (78×), 2 (25×), 1.2, 0.5, .5, .3, .8, .2, 3 — note both '0.5' and '.5' and unitless numbers (React treats a bare number as px, so letterSpacing:1.5 = 1.5px, likely unintended vs em). lineHeight ranges 1,1.1,1.3,1.35,1.4,1.5,1.6,1.65,1.7,1.75 ad-hoc. StatBar/labels lean on heavy uppercase+letterSpacing:1 (the classic dashboard look).
  - _Fix:_ Tokenize tracking (tight/normal/wide) and leading (tight1.2/normal1.5/relaxed1.7), standardize on one unit convention, and reduce the uppercase+wide-tracking label pattern that dates the UI.

### Spacing / radius / elevation `(global)`
*Rhythm and depth — inconsistency here is felt as 'unpolished' even when colors are fine.*

- **🟠 HIGH · [ui] 16 distinct border-radius values, no radius scale** `global`
  - borderRadius numbers: 1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,40 (plus 50%). Card=14, Btn=10, StatBar bar=3, Notif=40. Corners are inconsistent between sibling elements (a Card at 14 containing chips at 8 and bars at 3), which reads as unaligned.
  - _Fix:_ Collapse to a radius scale: sm6 (chips/bars), md10 (buttons/inputs), lg14 (cards), xl20 (sheets), pill (999). Map the 16 values onto these 5 tokens.
- **🟡 MEDIUM · [ui] 700 raw padding literals, no spacing scale** `global`
  - padding declared 700×; commonest strings '12px 14px'(76), '10px 14px'(37), '6px 10px'(25), '10px 12px'(23), '3px 10px'(21), plus dozens of one-offs (5px 3px, 8px 4px, 9px 12px…). gap similarly sprawls (8,6,10,5,4,3,12,2,14,7,9…). No 4/8pt grid enforced.
  - _Fix:_ Adopt a 4pt spacing scale (space1=4…space6=24) and replace the long tail of odd paddings/gaps. Large task but mechanical and presentation-only; start with Card/Btn/list-row.
- **🟡 MEDIUM · [ui] Single elevation token — no depth system** `161`
  - Only TH.shadow exists (one value light, one dark); boxShadow appears 33× but most are one-off custom rgba shadows (e.g. Notif's `0 4px 24px ${color}33`). There is no elevation ladder (raised card vs floating sheet vs modal), so overlays don't feel layered above content — a flat, dated look.
  - _Fix:_ Define elevation tokens (e0 none, e1 card, e2 popover, e3 modal/sheet) for both themes and use them consistently; reserve colored glows for celebratory moments only.

### UI primitives (Card, Btn, StatBar, OvrRing, Notif, Sparkline) `(5510-5550)`
*The reusable building blocks; their gaps force every screen to reinvent UI inline.*

- **🟠 HIGH · [ui] Btn has no interactive states, no sizes, no icon/loading slot; transition:all animates nothing** `5513-5523`
  - Btn (l.5513-5523) defines 7 color variants but: no :hover/:active/:focus-visible feedback (inline styles + only 8 onMouseEnter in the whole app), so buttons are visually inert on desktop; transition:'all .15s' (l.5523) is a perf smell that has nothing to transition since styles never change; no size prop (sm/md/lg) — every non-default size is overridden via style; no leading-icon or loading-spinner slot. success/danger/gold variants hardcode #dcfce7/#bbf7d0/#fee2e2/#fecaca/#f59e0b/#d97706 (l.5518-5521) that do NOT adapt to dark theme.
  - _Fix:_ Add hover/active/focus-visible states (a small onMouse/onFocus style-merge helper or a CSS class), size variants, optional icon+loading props; move the variant colors onto semantic TH tokens so they theme correctly; replace transition:all with transition:'background .15s,transform .1s'.
- **🟠 HIGH · [dark-theme] OvrRing & Btn hardcode track/tint colors that break in dark theme** `5529-5531`
  - OvrRing (l.5529-5531) hardcodes the conic-gradient track `#e2e8f0` — in dark theme (card #1e293b) that light-grey ring track is jarring and the empty portion glows wrong. Btn success/danger variants hardcode pastel light backgrounds. StatBar track uses TH.cardBorder (ok) but the ring does not. .kbd (l.21245) hardcodes #e2e8f0/#475569/#cbd5e1.
  - _Fix:_ Replace #e2e8f0 with a TH.track/TH.divider token; make Btn soft-variant backgrounds derive from semantic token tints per theme.
- **🟡 MEDIUM · [ui] StatBar/OvrRing bake business thresholds (80/65) and 3-color logic into presentation primitives** `5526-5530`
  - Both StatBar (l.5526) and OvrRing (l.5530) hardcode `value>=80?success:value>=65?warning:danger`. This couples a rendering primitive to magic thresholds, duplicates the same rule in two places, and prevents reuse for metrics with different scales (morale, energy, chemistry 0-100 all want different bands). Only 4px bar height + no track label option.
  - _Fix:_ Accept an optional color/threshold or a semantic `tone` prop (form/morale/energy/ovr) that resolves to tokens; default to the current bands. Keep it presentation-only.
- **🟡 MEDIUM · [ui] Card is a bare box — no title/header/footer/interactive/elevation slots** `5510-5511`
  - Card (l.5510-5511) only wraps children with fixed padding 16/18 and radius 14. There is no header/title affordance, no clickable/hoverable variant, no padding-density option, no elevation variant. Consequently every screen re-implements card headers, section labels (SectionLabel exists separately) and clickable rows inline, producing drift.
  - _Fix:_ Extend Card with optional title/subtitle/actions header, `interactive` (hover elevation + cursor), and `pad` density — without changing the default call signature.
- **🔵 LOW · [ui] Notif is the only feedback primitive and hardcodes its surface/scrim** `5533`
  - Notif (l.5533) is a single fixed toast using TH.card + colored border + `${color}33` shadow. There is no toast queue/stack, no variant set (success/error/info), no auto-dismiss animation token. It's the app's only notification component, so richer feedback is done ad-hoc elsewhere.
  - _Fix:_ Generalize into a Toast with tone variants mapped to semantic tokens and a small stack; keep single-toast default behavior.

### Component library coverage `(global)`
*What exists as a reusable primitive vs what is reinvented inline across 21k lines.*

- **🟠 HIGH · [redundancy] ~6 primitives against ~25 needed — Modal/Tabs/Badge/Avatar/Tooltip/Input/Select/Toggle/EmptyState/Skeleton all inline & duplicated** `global`
  - Reusable primitives: Card, Btn, StatBar, OvrRing, Notif, Sparkline (+ SectionLabel, ScoreRow, GT helpers). MISSING as primitives: Modal/Dialog (there are 8+ ad-hoc modal states — weekLiveModal×62, interviewModal, misterDiscorsoModal, nationsCupModal, euroGroupModal, monthlyReviewModal, coachModal, negoModal — each rendered inline with its own backdrop), Drawer/BottomSheet, Tabs (tab switching hand-rolled), Badge/Chip, generic Avatar wrapper, Tooltip, Toast stack, Progress (only StatBar), Timeline, Table, Search, Input/Select/Toggle/Checkbox/Radio (only 4 <input> and 1 <select> in the whole app — most 'inputs' are custom clickable divs), EmptyState, Skeleton (shimmer is hand-rolled in ≥8 spots). MatchCard/PlayerCard/ClubCard/CompetitionCard/StatCard/KPICard are all bespoke per screen.
  - _Fix:_ Extract the highest-frequency duplicated patterns first: a Modal shell (backdrop+panel+close, driving all *Modal states), a Chip/Badge, a StatCard/KPICard, and a Skeleton. Each removes dozens of inline copies and enforces consistency. Presentation-only, incremental.
- **🔵 LOW · [dead-code] Duplicated shimmer/skeleton and scattered inline <style> keyframe blocks** `8752,9156,12425,21212`
  - Skeleton/shimmer logic is duplicated (grep shimmer/skeleton = 8 hits) and keyframes are injected via at least 4 separate inline <style> blocks (l.8752 pmShim/pmUp, l.9156 cpmLt*, l.12425 pulse87, l.21212 global) plus 29 total @keyframes. There is no single animation stylesheet, so the same fade/pulse patterns are re-declared.
  - _Fix:_ Consolidate keyframes into the one global <style> block, add a Skeleton primitive that owns the shimmer keyframe, and remove the per-component style injections.

### Interaction states & animation language `(global)`
*Micro-feedback and motion — a core part of 'feels premium'.*

- **🟠 HIGH · [ux] Near-zero hover/active/focus states across the app (inline-style architecture)** `global`
  - Because everything is inline styles, interactive feedback barely exists: 8 onMouseEnter handlers and exactly 1 CSS `:hover` rule in a 21,345-line app. Buttons, cards, list rows and tabs do not respond to hover on desktop and have no visible focus ring for keyboard/accessibility. This is the strongest 'static admin form' tell.
  - _Fix:_ Introduce a tiny interaction helper (hover/active/focus style-merge on primitives) or a small set of utility CSS classes in the global <style>, and add :focus-visible outlines using a token. Apply to Btn, Card(interactive), tab and list-row patterns.
- **🟡 MEDIUM · [ui] No motion scale — 29 keyframes with ad-hoc durations/easings** `global`
  - Animations exist (spin .8s, barPulse 1.5s, goalShake .55s, logoIn .55s cubic-bezier, confettiFall, fwBurst 1.5s, blackCut, fadeFlash…) but durations (.15s/.5s/.55s/.8s/1.5s) and easings are chosen per-instance with no tokens. transition: appears only 37× total, so most state changes are instant. There's no consistent enter/exit or press feedback language.
  - _Fix:_ Define motion tokens (durationFast120/base200/slow400, easingStandard/emphasized) and a couple of reusable enter/exit keyframes; apply them to modals, toasts and primitives. Respect the existing flash-safe governor.

---

# PIANO DI OVERHAUL

## FASE 1 — Design System (fondamenta, da costruire per prima)

## FASE 1 — Design System Foundation (build FIRST, ship as its own GAME_VERSION bump)

The audit's root cause is that there is **no system**: 360 hex literals, 37 font sizes, 16 radii, 700 raw paddings, `font-family:sans-serif`, one surface + one border + one shadow, StatBar/OvrRing baking business thresholds, and ~1 `:hover` rule in 21k lines. Everything below is **additive** and calibrated so the LIGHT values equal today's rendered values → zero visual regression on day 1 (same pattern already used for the `bgBlue/bgGreen…` "Sprint D" tokens at l.168-172). The win is that every subsequent wave *consumes tokens* instead of inventing hex, and dark theme stops breaking.

### 1. Color tokens — extend `TH` (l.159-173) and `TH_DARK` (l.176-182) in lockstep

**Fix the two undefined-token bugs first (they silently drop styling today):**
- `TH.cardBg` (used l.19097/19102/19106, never defined) → add as alias of new `surface2`.
- `TH.border` (used l.11891, never defined → `1px solid undefined`) → alias of new `divider`.

**Structural surfaces / elevation (the missing dark-theme backbone):**
- `surface2` (inset tiles, bar tracks, stat cells): light `#f4f7fb` / dark `#172033` — replaces the ~40 hardcoded `#f8fafc` fills and `#e2e8f0` tracks.
- `surface3` (modal/sheet panel): light `#ffffff` / dark `#21304a`.
- `divider`: light `#e6edf5` / dark `#2c3a52`.
- `track` (progress/meter track): alias `divider` — kills every hardcoded `#e2e8f0`/`#e5e7eb`.
- `scrim` (backdrop): light `rgba(15,23,42,0.45)` / dark `rgba(0,0,0,0.62)` — replaces 78 ad-hoc `rgba(0,0,0,…)` overlay backdrops.
- Elevation ladder (replaces the single `TH.shadow`): `el1`=current card shadow; `el2` raised = light `0 4px 16px rgba(0,0,0,.10)` / dark `0 4px 16px rgba(0,0,0,.5)`; `el3` modal/sheet = light `0 12px 40px rgba(0,0,0,.18)` / dark `0 12px 48px rgba(0,0,0,.6)`; `el4` toast = `0 6px 24px ${color}33`.

**Brand scale (kills the accidental granata-on-blue selection language across onboarding):**
- Keep `primary #8e1f33`, `primaryDk`. Add `primaryTint` (weak selection bg): light `#f7e9ec` / dark `#2a1620`; `primaryBorder`: light `#e3c3cb` / dark `#4a2530`. Every `#eff6ff`/`#2563eb` selection highlight (Home slots, CreateScreen chips, OffersScreen, standings "my row" l.18707) migrates to these → selections finally read *branded*.
- Real metallic **trophy/gold**: add `goldGrad` `linear-gradient(135deg,#f6c04b,#d4922a)` + `goldText` (=current `#b45309`); disambiguate from `warning #d97706` (today they read identical).

**Domain-semantic game tokens (each `fg` + `bg` + `bd`, both themes) — the entire missing layer:**
- `win`  fg L`#15803d`/D`#4ade80`, bg L`#e7f6ec`/D`#12321f`
- `draw` fg L`#a16207`/D`#fbbf24`, bg L`#fbf3dd`/D`#2c2410`
- `loss` fg L`#b91c1c`/D`#f87171`, bg L`#fbe9e9`/D`#331519`
- `growth` `#16a34a` / `regression` `#dc2626` (delta arrows)
- `energy` fg `#0284c7`; `injury` fg `#dc2626`+bg=loss.bg; `suspension` fg `#ea580c`; `record` fg `#0891b2`; `info` = reuse `bgBlue` triad.
These give one home for V/P/S, morale, form, fatigue, injury, suspension, records — replacing dozens of one-off hexes and unifying the V/P/S vs W/D/L, 🏟️ vs 🏠 glyph drift.

### 2. Typography system (today: none)

- Inject on `#root`/`body` (l.85 currently only `sans-serif` on the loader): `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;` + a `.cpm-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}` utility for all scores/OVR/stats. (Optional, flagged: subset-embed one condensed display woff2 as data-URI for scoreboard/OVR only — weigh against store bundle size; not required for the uplift.)
- **Type scale token `FS`** (retire the 37 ad-hoc sizes): `caption 11, small 12, body 13, bodyLg 15, subhead 17, title 20, h 24, display 32, displayLg 44, hero 64`. **Hard floor 11px** — every `fontSize:7/8/9` (117 occurrences: HUD l.11346/11358, Euro table l.18596, standings l.18538, nav keycode l.21103, stat-tile labels) moves up.
- **Weight token `FW`**: `regular 400, medium 500, semibold 600, bold 700, black 800`. Reassign body copy to 400/500 and reserve 800 for scores/OVR/big numbers only — today 521 of 696 weight uses are 700/900, so hierarchy is flat and shouty.
- Normalize `letterSpacing` (both `.5` and `0.5` strings appear) and `lineHeight` to a 3-step token set.

### 3. Spacing / radius / motion scales

- **`SP` (4pt grid)**: `2,4,6,8,12,16,20,24,32,40` — replaces 700 raw padding literals and the gap sprawl.
- **`RAD`**: `xs 6, sm 8, md 12, lg 16, xl 20, pill 999`. Card 14→**16**, Btn 10→**12**, chips **8**, all bars/pills → **pill**, avatars → pill.
- **`MO` motion**: durations `fast 120, base 200, slow 320, cine 550`; easings `easeStd cubic-bezier(.2,0,0,1)`, `easeOut cubic-bezier(0,0,.2,1)`, `easeIn cubic-bezier(.4,0,1,1)`. Consolidate the 29 scattered `@keyframes` + 4 inline `<style>` blocks (l.8752/9156/12425/21212) into **one injected stylesheet**.

### 4. Interaction layer (today: 8 `onMouseEnter`, 1 `:hover`)

Inject a single global stylesheet with utility classes the inline-style architecture can opt into without refactoring every element:
- `.cpm-int` → `transition: transform var(--mo-fast), box-shadow var(--mo-fast); :hover{transform:translateY(-1px);box-shadow:el2} :active{transform:scale(.98)}`
- `.cpm-focus:focus-visible{outline:2px solid primary;outline-offset:2px}`
- `@media (prefers-reduced-motion:reduce){ .cpm-int{transition:none;transform:none} }`
- Leave the **`flashScreen` governor untouched** (l.9769, 750ms/opacity-cap 0.42) — all goal flashes keep routing through it.

### 5. Primitive refactors + new primitives (the ~6→~25 gap)

**Refactor in place (API-compatible defaults → gate-safe):**
- `Card` (l.5510): add `title`/`header`/`footer` slots, `elevation`, `density`, `tone` (semantic tinted bg via tokens), `interactive` (adds `.cpm-int`). Kills per-screen re-implemented headers.
- `Btn` (l.5513): add `size` (sm/md/lg with min-height 36/44/52 — fixes sub-44px targets), `icon` slot, `loading` spinner; move `success/danger/gold` off hardcoded pastels onto dark-aware tokens; wire real `:hover/:active/:focus-visible`; make the `transition:all` actually meaningful.
- `StatBar` (l.5525): **decouple the 80/65 danger-red threshold** into a `bands`/`tone` prop; add an `attribute` variant with a **non-alarming tonal ramp** (a normal 55-64 player must not render a wall of red); taller track option; token track; `.cpm-num` value.
- `OvrRing` (l.5529): token track (`surface2`, not `#e2e8f0`), `label` prop defaulting to **"OVR"** not "LVL", dark-aware.

**New primitives (each ships once, then adopted per wave):** `Modal`/`Dialog` + `BottomSheet` (single scrim+panel on `scrim`/`surface3`/`el3` — replaces 8+ ad-hoc modal backdrops), `Tabs`, `Badge`/`Chip`, `Meter` (generic 0-100 w/ semantic tone), `MatchBadge` (unified V/P/S), `Avatar` wrapper, `Tooltip`, `Toast`+stack, `Skeleton` (one impl, retire 8 hand-rolled shimmers), `EmptyState`, `SectionHeader`, `KpiTile`/`StatTile`, `DataTable`, `Bracket` (visual KO tree with crests), `CrestRow`.

**Deliverable of FASE 1:** tokens + refactored 4 primitives + new primitive library + interaction stylesheet, with light values pinned to current output. No screen redesigned yet — the foundation only.

## FASE 2 — Ondate di modernizzazione (rilasci incrementali)

_Razionale di sequenziamento:_ FASE 1 (Wave 1) is mandatory first: every dated symptom in the 152 findings — 360 hex literals, danger-red attribute bars, broken dark theme, sub-11px type, two-primary CTAs, granata-on-blue selection, missing hover/focus — traces to the absent token/primitive/interaction system. Building it once, with light values pinned to today's output, makes every later wave a cheap token-swap instead of a per-screen hex hunt, and guarantees the zero-regression + light/dark coherence the constraints demand. Ordering after that follows impact × dated-ness × gate-risk: the CareerApp screens (Waves 2-6) are ALL gate-blind, so they carry the lowest CI risk and can move fast, sequenced by usage frequency and severity — Dashboard first (critical hierarchy failure, most-visited, seen every turn), then Stagione (critical table readability + triplicated cup panels), then Profilo/Nazionale (critical hero-buried + heavy duplication), then Club/Training/Agente (Agente is the worst dark-theme break but a lower-traffic tab). Onboarding is high dated-ness but hit once per career and lightly touched by live-smoke, so it sits at Wave 6 where the primitive library is fully proven. The Match 2D overlays go LAST (Wave 7) precisely because they are the only surface the gate actually renders during its forced-situation captures: doing them after five gate-blind waves means the design system and every new primitive are battle-tested before we touch the one region where visual/motion/timeline/live-smoke checks can react, minimizing the blast radius against the 14/14 requirement. Throughout, golden stays untouched (it asserts logical state, not overlay pixels), the flashScreen governor and all 3D/arcBlock paths are frozen, and each wave is an independent GAME_VERSION bump so any regression is isolatable to one screen group.

### Ondata 1 — Foundation — Design System tokens, primitives & interaction layer `[L]`
**Scope:** FASE 1 in full: extend TH/TH_DARK with structural + semantic + brand-scale tokens, fix the two undefined-token bugs (TH.cardBg, TH.border), install font stack + type/weight/spacing/radius/motion scales, consolidate keyframes into one stylesheet, add the interaction/focus/reduced-motion CSS layer, refactor Card/Btn/StatBar/OvrRing to consume tokens (defaults pinned to current light values), and build the new primitive library (Modal, BottomSheet, Tabs, Badge, Meter, MatchBadge, Avatar, Tooltip, Toast, Skeleton, EmptyState, SectionHeader, KpiTile, DataTable, Bracket, CrestRow).

**Schermate:** global theme (l.159-182), primitives (l.5510-5550), global CSS (l.72-85, l.21212+)

**Interventi chiave:**
- Add ~30 tokens to TH and TH_DARK (surfaces/elevation/scrim/divider, primaryTint/Border, goldGrad, win/draw/loss/growth/energy/injury/suspension/record/info)
- Fix TH.cardBg→surface2 and TH.border→divider (real bugs silently dropping bg/border)
- Set real font-family on #root/body + .cpm-num tabular utility; establish FS/FW/SP/RAD/MO scales
- Refactor Card/Btn/StatBar/OvrRing: token-driven, dark-aware, StatBar/OvrRing threshold decoupled, OvrRing label 'OVR', Btn sizes/states/icon/loading
- Inject single stylesheet: .cpm-int hover/active, .cpm-focus focus-visible, prefers-reduced-motion, consolidated keyframes
- Build new primitive library used by all later waves

**Rischio / gate:** Light-theme values pinned to current output → target zero pixel change. Gate is BLIND to CareerApp but Btn/Card/StatBar/OvrRing render in the match Ended/hl_result panels and MatchdayCard, so this wave is the ONE that can touch match visuals. golden asserts logical state {htx,hty,cam,ch,ca} not overlay pixels → safe; but visual/movements/post-highlight frame checks could shift if any refactored primitive changes a captured pixel — pin values and re-run full 14/14, regenerate golden ONLY if a deliberate state-sig field moved (it should not). Every wave must keep Babel transpile valid (initial-state boots the page).

### Ondata 2 — Career Dashboard (Home tab) — hierarchy, KPIs & shared shell `[L]`
**Scope:** Retier the season-start card avalanche into a priority system (alert > action > info), replace flat numbers/hairline bars with KpiTile + Sparkline/Meter (OVR/morale/value trends), de-duplicate the 4 near-identical news feeds and the twice-rendered objectives/last-5/standings, fix always-dark prompt-card gradients + hardcoded light tracks/badges, rework the sticky CTA disabled state, and clean the shared header/nav (bury/kill manual Save, surface theme toggle, drop the '[K]' monospace keycodes on desktop sidebar).

**Schermate:** dashboard tab (l.17104-18442), shared header/nav (l.17747-17791, l.21103)

**Interventi chiave:**
- Priority tiering: injury/contract/suspension alerts elevated (el2 + semantic tone), info feeds demoted; remove misleading PRIORITÀ pills on info-only cards
- Collapse 4 news/results/market/log cards into one tabbed/segmented feed via Tabs; drop duplicate objectives, duplicate last-5 strip, mini-standings duplication
- KpiTile row with Sparkline trends (OVR/morale/value) replacing 3-4px hairline bars; hero season card off green-'alert' styling
- Migrate all prompt-card dark gradients + #e2e8f0 tracks + #fff7ed/#eff6ff badges to tokens (fixes dark theme)
- Fix cpm-dash-grid so prompt cards use the 2-col desktop width; move theme toggle out of the shortcuts card
- Sweep dead code: unused gs var (l.18320), duplicated last-5 compute

**Rischio / gate:** Gate-blind (dashboard never captured by the 14 checks) → collaudo dal vivo required (light+dark, mobile 320px, season-start avalanche state). Only gate concern: page must still transpile/mount (initial-state). No golden regen expected.

### Ondata 3 — Stagione — Standings, Calendar & Coppe `[L]`
**Scope:** Rebuild the flagship league table (token-driven zebra + user-row highlight in primaryTint, crests via CrestRow, form-guide, sticky club column, raise 7-8px type to floor 11), replace the flat text KO 'tabellone' with the visual Bracket primitive + crests, unify the euroGroupTable into ONE layout, and remove the triplicated Cup/Euro/EuroMondiale panels now duplicated across Calendar+Standings+Coppe (single source, consolidating the 6.8.1 intent). Migrate every hardcoded pastel record/archive tile to semantic tokens.

**Schermate:** Standings (l.18690-19018), Calendar (l.18455-18668), Coppe (l.20860-21090)

**Interventi chiave:**
- League DataTable: primaryTint user-row (fix near-invisible #eff6ff), crests not color dots, zebra, sticky Club col, FS floor 11, swatch legend not color-only
- Visual Bracket primitive replaces 3-letter-code text lists in both cups
- De-duplicate: remove Cup/Euro panels from Standings and Calendar; one euroGroupTable schema shared by tabs
- Migrate #fef3c7/#eff6ff/#dcfce7 records, archive, KO chips, week-grid cells to win/draw/loss/record/token surfaces (dark-safe)
- Unify result glyph vocabulary (V/P/S) and home/away icons across all panels
- Strengthen week-grid current-week + match markers (Badge/MatchBadge, no 7px glyphs)

**Rischio / gate:** Gate-blind → collaudo dal vivo (dark theme is the big win here; test with real season data, 320px horizontal-scroll table). Watch scroll-within-scroll on nested archive lists. No gate check exercises these tabs.

### Ondata 4 — Profilo & Nazionale `[L]`
**Scope:** Promote the player-identity HERO card to the top (it currently renders ~20 cards deep), fix the 'Attaccante' hardcode to use player.position, section the ~37-card single column into anchored/collapsible groups (Identity / Career / Trophies / Records / Contract / Utility), replace the danger-red StatBar wall with the non-alarming attribute Meter (or radar), migrate the 7 dark-'island' gradient cards + dozens of light-only hexes to tokens, and collapse the overlapping career-history/awards/trophy/national duplications into single homes.

**Schermate:** Profilo (l.19281-20320), Nazionale (l.20647-20865)

**Interventi chiave:**
- Reorder: hero identity card first (real PlayerCard, OVR ring 'OVR', position-correct); move Esporta/Copia/retire into a Utility group
- Attribute Meter with positive tonal ramp (no red wall); optional radar treatment
- Section grouping via SectionHeader + Tabs/accordion; kill dual trophy cabinets, 4 overlapping history views, duplicated national card
- Migrate biografia/rivale/spogliatoio/capitano/agente/archetipo dark gradients + #f8fafc/#dbeafe/#fef3c7 tiles to surface/semantic tokens (theme-adaptive)
- Raise all 8px labels to floor 11; align card padding/number scale to tokens
- Nazionale: reconcile prestige-vs-ranking metric mismatch, unify result badge, add status timeline (Convocato→Leggenda already computed)

**Rischio / gate:** Gate-blind → collaudo dal vivo. Largest single-tab surface; verify non-forward player labels, save-export still works, light+dark. No golden impact.

### Ondata 5 — Club, Training & Agente (Economy) `[M]`
**Scope:** Fix the single biggest dark-theme regression (Agente is unusable in dark — dozens of light-only hexes), turn the roster CSV-dump into a squad list with OVR/position color/age, make Patrimonio a real KPI, apply the attribute Meter fix in Training, and normalize currency formatting + the mixed dark-hero/light-tile card languages. Sweep the orphan '(coach moved)' comment and cross-tab coachTrust redundancy.

**Schermate:** Club (l.19060-19240), Training (l.14340-14380, l.19255-19270), Agente (l.20340-20640)

**Interventi chiave:**
- Agente: migrate ALL hardcoded light panels (contract tiles, market window, loan/cession/task/offer cards, warning strips) to tokens → dark theme usable
- Patrimonio as KpiTile (icon + delta); one currency convention across tab
- Roster rows via a PlayerRow with OVR badge, position color, age, ellipsis on long names, primaryTint (not blue) self-highlight
- Training auto-panel pill chips → semantic tokens; StatBar attribute ramp fix; growth (+1) badges use growth token
- De-dup coachTrust encodings; unify trophy golds to goldText/goldGrad; remove orphan comment (l.20404)

**Rischio / gate:** Gate-blind → collaudo dal vivo, dark theme is the acceptance bar. No gate check touches these tabs. No golden impact.

### Ondata 6 — Entry & Onboarding flow `[L]`
**Scope:** Elevate the Home title screen from utility to hero moment, invert the CTA hierarchy so a new user gets a primary 'Nuova carriera', route empty/corrupted/overwrite slot states through tokens, replace the native <details> challenge disclosure and paginated avatar picker with system primitives, give Offers/ProTransition a single primary CTA + branded (not blue) selection, and strip dev-jargon/no-op affordances ('[Enter]' on touch, dead 'Calcolo offerte' button, desktop grid break on ProTransition footer).

**Schermate:** HomeScreen (l.12870-12955), CreateScreen (l.3007-13100), OffersScreen (l.13100-13145), TrialFlow (l.13480-13505), ProTransitionScreen (l.11960-12026), TutorialOverlay (l.14250-14265)

**Interventi chiave:**
- Home: hero masthead treatment, PlayerCard-style save slots, new-user primary CTA, token-driven empty/corrupted/overwrite states, ≥44px delete/overwrite targets, surfaced Import
- Create: progressive-disclosure steps, replace native <details> + arrow-pagination with Tabs/Sheet primitives, token inputs/selection (primaryTint not granata-on-blue), dream-club as searchable list
- Offers/ProTransition: single primary CTA (fix the two-primary bug), branded selection accent, cleaner offer cards; fix ProTransition footer grid-cell break at ≥900px
- Remove [Enter] hints on touch + the no-op 'Calcolo offerte' button; token trial interstitials

**Rischio / gate:** Mostly gate-blind, BUT live-smoke (ARC-1a) boots a REAL game through the provino/trial flow to 'playing' — it renders TrialFlow and may traverse CreateScreen. Keep DOM structure/hooks (__CPM_QUEUE_REACTIVE, button roles, onClick targets) intact; restyle only. Re-run live-smoke specifically. Also transpile/mount (initial-state).

### Ondata 7 — Match presentation 2D overlays (gate-sensitive — LAST) `[L]`
**Scope:** Restyle the scoreboard/HUD (kill 7px telemetry type, reduce to clock + one meter, un-truncate names), unify the divergent mobile/desktop hl_choose & hl_result panels into one primitive set with an explained odds legend, de-clutter the triple simultaneous GOL overlays and dated double-glow type, fix Ended-screen undefined-token borders + light-only fills, retire the dead AIDecisionOverlay and the superseded PressScreen duplicate, and align MatchdayCard to the FormationView broadcast language.

**Schermate:** MatchdayCard (l.8940-8995), LiveMatch HUD (l.11320-11380), hl_choose/hl_result (l.11620-11800), goal cinematics (l.11500-11525), Ended (l.11810-11900), PostMatchPress/PressScreen (l.8750-8920)

**Interventi chiave:**
- HUD: FS floor 11, single momentum meter, token score-color helper (de-dup 4×), name truncation raised
- Unify mobile/desktop hl_choose + hl_result into one component; add a legend for the odds-derived border color OR remove it; ≥44px targets; token result bgs
- Collapse triple GOL overlays to one broadcast lower-third; restrain double text-glow; keep flashScreen governor
- Ended: fix TH.border→divider, rgba(0,0,0,.03)→surface2; de-dup rating formula (3×)
- Delete dead AIDecisionOverlay; fold PressScreen into PostMatchPress language; MatchdayCard token stat tiles + broadcast alignment, kill non-deterministic weather fallback re-random

**Rischio / gate:** HIGHEST gate exposure. These overlays render during the forced-situation passes, so visual, movements, motion, ball-motion, post-highlight, timeline, data-coherence, bg-coherence AND live-smoke all run with them on screen. golden is state-based ({htx,hty,cam,ch,ca}) so overlay restyling is safe IF the gate resolves actions via DOM roles/labels/onClick that must stay intact (hl_choose buttons, __CPM_* hooks). Do NOT touch the arcBlock/computeArc paths or 3D. Full 14/14 + Live Validator required; regenerate golden only if a state-sig field deliberately changes (it should not).

