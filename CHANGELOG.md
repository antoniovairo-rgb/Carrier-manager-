# CHANGELOG — Career Player Manager

---

## v4 — cpm-game_4.html
**Data:** 2026-06-09
**Linee:** 2398 (+299 rispetto a v3)

### Aggiunto
- **Sistema calendario stagionale** (`generateSeasonCalendar`) — partite schedulate in modo deterministico e seeded, persistite in `player.calendar[]`
- **Classifiche persistenti** (`initStandings`, `updateStandings`) — zero ad inizio stagione, aggiornate dopo ogni giornata; salvate in `player.standings[]`
- **Simulazione automatica** (`simulateMatch`) — partite della settimana non giocate vengono auto-risolte all'avanzamento
- **Roster seeded per nazionalità** (`generateTeamRoster`, `hashStr`, `seededShuffle`) — 11 giocatori con nomi realistici stabili per stagione, pool per IT/EN/ES/DE/FR/PT/NL/BE/TR
- **Presenze realistiche** (`calcAttendance`) — U18: 150–900, Pro per fascia di prestigio, Trial: 80–320
- **Scorciatoie tastiera** globali in CareerApp — `Enter`=gioca, `0`=avanza settimana, `Space`=conferma, `Esc`=indietro
- **"Prossime partite"** nel tab Calendario — lista upcoming dal `player.calendar`
- **Barra hint tastiera** sopra la nav bottom
- **"Nuova Carriera"** sempre visibile in HomeScreen anche con slot occupati
- Prop `league` in `MatchdayCard` — mostra il campionato corretto invece di "Serie A Primavera U18" hardcoded
- Prop `homeRoster`/`awayRoster` in `FormationView` — entrambe le squadre con nomi e ruoli reali

### Corretto
- **BUG 1** — "Nuova carriera" non sempre accessibile
- **BUG 2** — Salvataggio/caricamento ora persiste calendario e classifiche
- **BUG 3** — Formazioni mostrano entrambe le squadre con nomi reali e ruoli
- **BUG 4** — Flusso settimanale calendar-driven: solo le settimane con partita abilitano il match button
- **BUG 5** — Scorciatoie tastiera funzionanti (Enter/Space/Esc/0)
- **BUG 7** — Presenze realistiche per contesto (U18, trial, pro per prestigio)
- **BUG 8** — Roster variati e persistenti, seeded per club+stagione
- **BUG 9** — Stagione 2: classifiche resettate a zero, nuovo calendario generato
- **BUG 10** — Classifiche simulate consistentemente ad ogni giornata
- **BUG 11** — UI blocca il gioco della partita in settimane senza match schedulato
- **BUG 12** — Trasferimento/prestito aggiorna campionato, calendario e classifiche
- **BUG 14** — `renderer.setClearColor(0x050810)` + render frame iniziale: nessun flash grigio
- `onProChoose` — genera calendario + classifiche per la nuova stagione pro
- `acceptTransfer` — rigenera standings/calendar per il nuovo campionato
- `doAdvanceWeek` (nuovo anno) — reset completo: `standings`, `calendar`, `matchHistory`, stats stagione
- `App.onChoose` — genera calendario e classifiche al momento della scelta del club U18

### Modificato
- `FormationView` — accetta `homeRoster`/`awayRoster` invece di usare nomi hardcoded
- `MatchdayCard` — prop `league` opzionale
- `LiveMatch` — attendance via `calcAttendance`, roster via `generateTeamRoster`
- `CareerApp.standings` — inizializzato da `init.standings` (persistente), non più da `generateStandings` (random)
- `doAdvanceWeek` — logica nuova stagione con reset completo e generazione calendar
- Bottom nav — padding aumentato a 100px, hint tastiera sopra i tab

---

## v3 — cpm-game_3.html
**Data:** 2026-06-08
**Linee:** 2099

### Rispetto a v2
- Refactoring tema chiaro (`TH` token)
- Avatar SVG con 12 varianti
- Database club europei (65+ squadre, 9 campionati)
- `SITUATIONS` con zone, `moveZone`, `startZone`
- Sistema `WEEKLY_EVENTS` pesato (`wPick`)
- 3 slot di salvataggio (`SLOT_KEYS`)
- `generateTransferOffer`, `generateProContracts`
- `buildStadium` con varianti per prestigio e stile
- `ThreeField` con 22 giocatori + arbitro
- `WalkoutOverlay` animato
- `ProTransitionScreen` con limite 2 stagioni U18
- Layout responsive (breakpoint 560/900/1280px)
- `SAVE_VERSION=4`

---

## v0–v2 — cpm-game.html, cpm-game_1.html, cpm-game_2.html
**Linee:** ~2080–2098

Versioni di sviluppo iniziale. Base del gioco con match 3D, sistema highlights, classifica randomica, salvataggio single-slot.
