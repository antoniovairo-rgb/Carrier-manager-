# Post Match Journal / Ecosistema Quotidiani — Groundwork (design + contenuti)

> Materiale preparatorio generato per la feature **Post Match Journal dinamico** (rassegna
> stampa post-partita che racconta partita + stagione + carriera). NON ancora integrato nel
> gioco. Regola cardine del PO: **SOLO informazioni reali e verificabili** dal database della
> carriera — mai inventare statistiche/record/classifiche/numeri. Meglio un articolo più corto
> ma corretto. Da riprendere quando si costruisce la schermata **Post Match** (anche nell'ambito
> dell'UX/UI overhaul).

## Pipeline (tutte funzioni pure, deterministiche dove possibile)
`analyzeMatchFacts(player, match, ctx) → F` → `buildPressEdition(F, player) → report` → `PostMatchPress` render.
- `analyzeMatchFacts` interroga SOLO lo stato reale. Ogni campo è un valore reale o `null`/`false`/omesso. Mai inventa.
- `buildPressEdition`: accende le storyline il cui `test(F)` è vero → ordina per priorità → sceglie lead + secondarie → sceglie testata (tier per reputazione/competizione) → sceglie variante layout/tono → assembla il report (superset del contratto legacy).
- Contratto legacy da mantenere: `report.{papers, headlines, paperColors, motm, fanReactions, trending, playerRating, flop, tacticalNote, quotes, memoriaTag, isLocal}`. Nuovi: `report.{facts, stories, badges, paperMeta, standingsSnap, formSnap, cover}`.
- Call site attuale (`generatePressAnalysis`, ~15416 nel sorgente): passare `player` + `ctx={opponentId,isHome,matchContext}`. Il wrapper AS-IS resta (l'IA può sovrascrivere solo headlines/quotes/trending).

## `F` — schema fatti verificati (i nomi dei campi = chiavi placeholder `{name}` nelle varianti)
- **MATCH**: won,drew,lost(bool); hs,as(gol squadra-eroe & avversario); margin; cleanSheet; goals,assists,rating; opp(nome); oppAbbr; compName; compTier('league'|'cup'|'euro'|'national'); compPrestige; isDerby; derbyName; isBig; isFinal; isHome; hasStats; shots,oppShots,fouls,corners,possession.
- **CARRIERA**: season,week,matchday; seasonPhase('early'|'mid'|'runin'|'climax'); ageYears; clubName; clubPrestige.
- **LEGA** (se `inLeague`): pos; N; pts; isLeader; gapFirst; gapUCL; gapEurope; gapReleg; zone('champion'|'ucl'|'uel'|'uecl'|'mid'|'releg'); isBestAttack; isBestDefense; attackRank; defenseRank; teamGF; teamGA.
- **MARCATORI**: scorerRank(1-based|null); isCapocannoniere; goalsFromScorerLead. **⚠️ NON esiste una classifica assist → non citarla MAI.**
- **SERIE/FORMA**: winStreak; unbeatenStreak; lossStreak; cleanSheetStreak; goalStreak; bestGoalStreak; newBestGoalStreak; avgRating; recentForm('WWDLW').
- **RECORD/TRAGUARDI (questa gara)**: brace; hatTrick; poker; newSeasonGoalsRecord; newSeasonAssistsRecord; firstCareerGoal; firstNationalGoal; milestoneTxt; careerGoals; careerAssists; careerApps; seasonGoals; seasonAssists; leagueRecBeaten; leagueRecNear; leagueRecGoals; bestMatchOfSeason.
- **COPPE/TROFEI**: trophyWon('league'|'cup'|'euro'|'national'|'nationsCup'|null); trophyName; qualified; qualTo; eliminated; phaseReached; advancedRound.
- **CURIOSITÀ**: firstWinVsOpp; firstMeetingVsOpp; h2hW,h2hD,h2hL; biggestWinOfSeason; scoredVsBigger.
- **MEDIA**: reputation(0-100); mediaInterest(0-100).

## Modello-dati REALE (data dictionary — sintesi «cosa è vero»)
- **`match`/`lastMatch`** (costruito UNA volta a ~11124): esattamente 19 campi. `homeScore`=gol squadra-eroe, `awayScore`=avversario (prospettiva-giocatore, NON sede). `homeRoster` ha nomi **reali** (utile per MVP). `rating`/`shots`/`possession` sono euristiche del gioco (ok citarle come «voto/stima»).
- **NON derivabili → non asserire mai**: minuti giocati, rimonta, minuti dei gol, gol al 90'+, possesso avversario.
- **`player.standings`**: posizione/punti/gap/zone REALI (solo lega dell'eroe). Le ALTRE squadre non hanno storico → niente loro «forma/striscia».
- **Marcatori**: `generateLeagueScorers(player)` = la classifica marcatori del gioco (rank citabile come «Nº in classifica marcatori»). **Nessuna classifica assist.**
- **Record/traguardi**: veri via `player.totalGoals/Assists/Matches`, `player.records` (best precedenti), `CAREER_MILESTONES`, `LEAGUE_RECORDS`, hat-trick (lm.goals≥3), primo gol (career/nazionale).
- **Competizioni**: `player.cup` (round/results/champion), `player.euro` (UCL/UEL/UECL: phase/groupResults/koResults/qualified/champion), `player.euroMondiale` (nazionale), `seasonObjectives`, `calendar`. Derby: `isDerby(club.id, oppId)` (serve l'id avversario, risolvibile al call site).
- **`player.diary`** (cap 80) = il feed più ricco e veritiero di «cosa è appena successo» (gol/record/trofei), con headline/body pronti.

## Copyright
Nomi testate SOLO in un array dati tipo `NEWSPAPERS` (l'audit `tools/audit-copyright.mjs` scansiona quell'array). Tutti i literal degli headline devono restare di fantasia (i literal nei componenti sono ciechi all'audit → verifica manuale). Vietati brand reali (`_CR_BRANDS`: Gazzetta, Tuttosport, Corriere dello Sport, Sky Sport, Champions League, Golden Boy, FIFA, UEFA…). Usare nomi di competizione di fantasia (Elevora Champions Cup, ecc.). I 14 giornali in `newsroom-content.json` sono già di fantasia e copyright-safe.

## Storyline & formatter (data-driven, estendibile)
Record storyline: `{ id, cat, prio(1=top..8), test:F=>bool, badge, tones:[...], variants:[…] }`.
- Formatter senza eval: `fmt(str,F)=>str.replace(/\{(\w+)\}/g,(_,k)=>F[k]??'')`.
- **I `test` (predicati) vanno riscritti/vagliati a mano** in fase di integrazione — NON eseguire alla cieca `testExpr` generati (rischio transpile). In `newsroom-content.json` ogni storyline porta un `testExpr` come *suggerimento*.
- Priorità (spec PO): 1 titoli/trofei · 2 qualificazioni · 3 record storici · 4 classifica · 5 record personali · 6 individuali · 7 serie · 8 curiosità.

## Testate (tier → selezione)
local (inizio carriera/gare minori) → regional (Serie B feel) → national (massima serie) → international (notti europee/finali/record). **COVER speciale** quando: trofeo vinto · pallone/scarpa d'oro (premi) · tripletta+ · record importante · promozione/retrocessione · finale vinta.

## Contenuti generati → `newsroom-content.json`
- **14 testate** (4 tier, personalità epico/tecnico/statistico/emozionale/sensazionalistico/equilibrato/tattico/giovanile, colori, font web-safe, tagline).
- **69 storyline** su 7 categorie (championship/streaks/attack-defense/player-individual/records-milestones/competitions/derby-curios) con **~1542 varianti** italiane, con `{placeholder}` da `F`.
- **8 copertine** speciali + **baseline** (win/draw/loss) + **fanReactions** + **quotes** (allenatore/giocatore).

## Prossimi passi d'integrazione (V1)
1. `analyzeMatchFacts(player, match, ctx)` — puro, solo dati reali (keystone «always real»).
2. Import `NEWSPAPERS` v2 dalle 14 testate + `selectNewspaper(F, player)` per tier.
3. `PRESS_STORYLINES` = catalogo da `newsroom-content.json` con predicati **vagliati a mano**.
4. `buildPressEdition(F, player)` → report (superset del contratto legacy).
5. Upgrade render `PostMatchPress`: layout variabili per testata/tono, stat box, badge record, snapshot classifica/forma, top/flop, MVP, **modalità COVER** per eventi eccezionali.
6. QA: transpile + gate 14/14 + `audit-copyright` 0 hit + screenshot standalone di più edizioni (testate/storyline/cover diverse) + verifica «nessun dato inventato» (ogni fatto tracciabile).
