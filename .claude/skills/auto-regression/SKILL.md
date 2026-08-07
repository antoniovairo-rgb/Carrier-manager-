---
name: auto-regression
description: "Non-regressione degli stati PERSISTENTI di Korward Elite, dove il gate 14/14 e' cieco: da usare quando tocchi avanzamento settimana, calendario, classifiche, tornei, economia, mercato, prestito o migration — lancia i 4 guardiani carriera, verifica la compat dei salvataggi e insegna a scrivere una probe con save sintetico."
---

# auto-regression — cio' che sopravvive al reload

Il gate visivo forza le situations: non gioca MAI la carriera. Tutta la classe di bug
«stato salvato corrotto» (classifica a 35 giornate, gara riproposta, torneo zombie,
stipendio mai accreditato) passa indenne dal gate 14/14. Questa skill copre quel buco.

## Quando si attiva

Il diff tocca uno di questi: `doAdvanceWeek` · `simulateAndAdvance` · `onMatchEnd` (career) ·
`doStartNewSeason` · `updateStandings` · `generateSeasonCalendar` · `migratePlayer` ·
`generateTransferOffer` · `weeklyEconomyFields` / `weeklyGrowthFields` / `weeklyStaffRel` ·
qualunque campo nuovo di `player` o bump di `SAVE_VERSION`.
Se hai toccato solo il 3D/UI: non serve, vai a `game-qa` per la suite giusta.

## Procedura

1. **Chokepoint unico prima di tutto** (regola e tabella dei chokepoint esistenti: `architect`).
   `tripath-chokepoint-test.mjs` e' statico (no browser, ~1s) → lanciarlo per PRIMO: e' lui che
   verifica che i 3 path settimanali deleghino davvero allo stesso helper.
2. **I 4 guardiani** (sotto). Girano su Chromium: ~4-6 min in totale.
3. **Se hai aggiunto un campo a `player`**: migration additiva + `npm run save-compat`.
4. **Se hai corretto un bug di stato**: scrivi la probe permanente che lo riproduce (§ save sintetici),
   verificala in NEGATIVO (deve fallire sul codice pre-fix, con `git stash`), poi committala.

## Comandi

```bash
cd /home/user/Carrier-manager-/tests/visual
node tripath-chokepoint-test.mjs   # statico, 1s — lancialo per primo
CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node career-invariants.mjs
CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stab-nat-trigger-test.mjs
CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node career-sim-test.mjs
npm run save-compat        # solo se hai toccato campi player / SAVE_VERSION / migration
```
Alias npm equivalenti: `career-invariants` · `stab-nat-trigger` · `career-sim` · `tripath-chokepoint`.
Probe mirate gia' esistenti da rilanciare se pertinenti: `dup-fixture-test.mjs` (gara riproposta),
`cup-zombie-test.mjs` / `euro-ko-zombie-test.mjs` (torneo che non si chiude),
`save-stamp-test.mjs` (timbro migration), `sim-balance-test.mjs` (equilibrio simulazione).

## Cosa asserisce ciascun guardiano

- **`tripath-chokepoint-test.mjs`** — statico sul sorgente. Per ognuno dei 3 path
  (`simulateAndAdvance`, `onMatchEnd=result=>`, `doAdvanceWeek`) verifica la presenza dei 4
  chokepoint: `weeklyEconomyFields` (stipendio/costi), `weeklyGrowthFields` (crescita/declino),
  `weeklyStaffRel` (relazioni), `natTournamentPatch`/`applyNatTournamentTrigger` (tornei).
  Se aggiungi un 4° path o rinomini un helper, aggiorna `PATHS`/`REQUIRED` nel file.
- **`career-invariants.mjs`** — invarianti puri sui globali veri: `INV-LEAGUE`/`INV-GLC` (nessuna
  lega >18 club, pool ≥4), `INV-CAL` (≤34 giornate, **zero fixture duplicate**, nessun avversario
  consecutivo o entro 5 giornate, casa/trasferta bilanciate ±2), `INV-STD` (initStandings azzerata
  e della dimensione del pool), `INV-PRO` (transizione U18→pro atterra in una lega senior valida),
  `INV-MIG` (save rotto riparato **e migrazione idempotente**), `INV-MIG-RECON` (la migration
  RICONCILIA la classifica in corso, non l'azzera), `INV-MIG-FORM` (form 0/150 normalizzata, 60
  intatta), `INV-NAT`, `INV-EGT` (euroGroupTable legge `hs`/`as` ed e' deterministica),
  `INV-LOAN` (nessuna offerta mentre sei in prestito, ma le offerte esistono senza prestito),
  `INV-CALHEAL` (zero collisioni di settimana lega↔lega dopo l'heal).
- **`stab-nat-trigger-test.mjs`** — il trigger dei tornei Nazionali e' **deterministico e
  idempotente** (rieseguirlo non ri-arma nulla) + l'economia settimanale accredita una volta sola,
  gated sul pro.
- **`career-sim-test.mjs`** — simula ~2 stagioni sugli handler VERI via `__CPM_CAREER`: settimane
  monotone, rollover di stagione, classifica 18 righe con **ΣGF = ΣGA**, banca ≥0, OVR in range,
  **0 pageerror**. E' l'unico che esercita la carriera end-to-end.

## Invarianti duri (se uno salta, e' un bug di stato, non di feel)

- **Double round-robin**: lega a N squadre ⇒ ogni club a `2*(N-1)` gare, mai una in piu'.
  La guardia vive nel chokepoint unico `updateStandings`. Un save gia' a 35 resta tale fino al rollover.
- **Nessuna gara duplicata**: mai due volte lo stesso avversario con la stessa sede nello storico
  di lega; il ritorno a sede invertita e' legittimo.
- **Calendario ⟺ classifica**: le gare marcate `played` devono combaciare coi `played` delle righe.
- **Tornei mai zombie**: coppa/girone europeo/nazionali devono chiudersi su OGNI path che li risolve
  (live, simula, auto-sim, avanza), non solo in `doAdvanceWeek`.
- **Prestito/pro**: in prestito niente offerte ne' rinnovi; il contratto del club madre si ripristina
  al rientro; lo svincolato non ha stipendio.
- **ΣGF = ΣGA** sull'intera classifica, sempre.

## Compatibilita' salvataggi

`SAVE_VERSION` corrente **9** (`grep -n "SAVE_VERSION=" CARRIER-MANAGER-AV.html` — non fidarti di
questa riga). Regole:
- **Campo opzionale/lazy** (derivabile o con default sensato) ⇒ **nessun bump**: backfill per
  presenza nel `useEffect` di mount di `CareerApp`, pattern `if(!('campo' in newP)){newP={...newP,campo:…};changed=true;}`.
- **Campo obbligatorio** ⇒ bump `SAVE_VERSION` + migration additiva. Mai rimuovere o rinominare
  un campo esistente: i save in giro lo contengono.
- La migration **timbra** il save alla versione corrente a valle di tutte le riparazioni e scrive
  `migratedFrom` (origine, una volta sola) → abilita migrazioni versioned `if(saveVersion<N)`.
  Verifica con `save-stamp-test.mjs`.
- La migration deve essere **idempotente**: rieseguirla su un save gia' migrato non cambia nulla
  (asserito da `INV-MIG`) e non deve MAI azzerare la stagione in corso (`INV-MIG-RECON`).
- `npm run save-compat` chiama la migration REALE (`window.__CPM_MIGRATE`) su save storici sintetici
  e controlla backfill dei campi obbligatori, rinomine di lega, flag legacy, idempotenza, null-safety.

## Scrivere un guardiano con save sintetico

Schema: `addInitScript` che scrive `localStorage['cpm-v3']` → `goto(...?cpmtest=1)` →
`waitForFunction(() => window.__CPM_CAREER)` → agisci sugli handler veri → rileggi l'autosave.
Copia lo scheletro da `career-sim-test.mjs` o `onda4-test.mjs`; usa `startServer`/`launchBrowser`/
`installCdnRoutes` da `lib/harness.mjs` e registra `page.on('pageerror', …)`.

## Errori gia' commessi

- **Avversario inventato nel save sintetico**: se non appartiene al pool REALE della lega, il repair
  del calendario lo ri-punta e la probe misura tutt'altro (il bug non e' piu' quello che credi).
- **`club.lg` divergente dal DB**: il repair del calendario usa la lega del DB, il reconcile delle
  standings usa `club.lg` — se divergono l'avversario di calendario non e' nel pool delle standings
  e la scena e' incoerente. Esempio noto: `sal` = «Lega B».
- **Calendario vuoto**: la migration lo rigenera e ti piazza una gara nella settimana corrente,
  rompendo lo scenario. Metti la voce in un'altra settimana invece di lasciare l'array vuoto.
- **Leggere l'autosave subito dopo il boot**: puo' precedere il flush. Sempre `waitForFunction`
  sul predicato NUOVO (per lo stamp: attendi la versione nuova, non quella del save originale).
- **Pattern boot→leggi→reboot**: per scenari che dipendono da calendario+classifica coerenti,
  primo boot per leggere il calendario migrato, poi reboot col calendario verbatim.
- **Determinismo provato con un reload**: il service worker della prima load bypassa le route CDN.
  Prova il determinismo con un **boot ripetuto** (context nuovo, `serviceWorkers:'block'`).
- **`migratePlayer` e' TOP-LEVEL**: le const di `CareerApp` (pool nazioni, ecc.) li' non esistono →
  ReferenceError silenziato dalla guardia del mount. Inlinea i dati che ti servono.
- **Fix in un solo path**: il 90% dei bug di stato nasce cosi'. Prima del gate, `tripath`.
- Il gate 14/14 resta obbligatorio prima del push comunque; regole di promozione in `production-ready`.
