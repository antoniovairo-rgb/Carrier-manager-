# PRONTEZZA alla pubblicazione (rilascio/consolidamento)

Aggiornato: 2026-10-10. Sessione rilascio CPM. Base: origin/poc/marioprada-character-system (ec8f073).

_Il rapporto cresce punto per punto; ogni voce dichiara misura, file:riga e frequenza._

## 1. Copyright / de-branding — `node tools/audit-copyright.mjs`

**Esito del gate: 0 riferimenti (EXIT 0, «✅ OK»).** Log: `docs/rilascio/copyright-raw.txt`. Build di riferimento: worktree `/tmp/cpm` su `origin/poc/marioprada-character-system` (ec8f073), build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → 56.511 righe.

⚠️ **Il gate passa, ma un controllo indipendente trova riferimenti reali che la blocklist non copre.** La blocklist (`_CR_BRANDS` / `_CR_PLAYERS`, `src/09-audio-scout-anagrafiche.jsx:915-921`) cerca nomi COMPLETI (es. «Juventus», «Bundesliga», «Serie A»). Non cerca slug, nomignoli né nomi di derby. Riferimenti trovati con `grep` (file:riga):

| Tipo | Esempi (file:riga) | Gravità proposta |
|---|---|---|
| Derby con nome di rivalità reale | `src/08-panchina-derby-meteo-cori.jsx:116` «Derby d'Italia» (juve-inter) · `:117` «Derby di Milano» · `:118` «Derby della Capitale» · `:120` «Derby del Sole» | da discutere (BLOCCANTE per un rilascio «de-branded») |
| Slug di club reali come ID interni | `src/02-club-leghe-albo.jsx:27-31` `inter`, `milan`, `napoli`, `lazio` · `:102` `psg` · `src/05-cronaca-stadi-formazioni.jsx:458-485` `juve`, `inter`, `milan`, `roma`, `lazio`, `psg`, `marse`, `bvb`, `bay` | probabile visibile solo se il slug finisce a schermo — **da verificare** |
| Nomignoli reali di club | `src/02-club-leghe-albo.jsx:27` «FC Nerazzurri» · `:28` «AC Rossoneri» · `:31` «FC Biancoceleste» · `:29` «FC Partenope» · `:102` «FC Paris» | da discutere (nomignolo = riferimento riconoscibile) |
| Stadi con nome di città reale | `src/05-cronaca-stadi-formazioni.jsx:458-474` «Stadio Sabaudo», «Stadio Meneghino», «Stadio Vesuvio», «Stadio Capitolino», «Parc Royal», «Stade Phocéen» | estetico/da verificare |
| Commenti con nomi reali | molte righe `src/07-versione-save-interviste.jsx` (es. `:317` «Inter», `:746` nota Serie B) | nessuno (solo commenti, non visibili) |

**Non posso confermare** che i slug e i nomignoli compaiano a schermo: serve la verifica di quali stringhe escono nel DOM (lavoro del team, non fatto qui). Il rapporto non ritocca nulla.

**Frequenza:** conteggio per grep su `src/*.jsx` (righe che contengono uno dei termini): 02=9, 05=5, 07=28, 08=10, 12=94 (slug/testo 3D), 15=50 (inclusi commenti). Il conteggio include commenti: non è il numero di riferimenti visibili.

## 2. Build offline — `node tools/build-dist.mjs` + `node tools/validate-dist.mjs`

- **Build:** `dist/index.html` 5.934 KB da sorgente 6.879 KB · CDN residui: nessuno · Babel-in-browser: rimosso · tempo 9,1 s · EXIT 0. Log: `docs/rilascio/build-dist.log`.
- **Validazione (offline bloccante):** React montato ✅ · home raggiunta (5 bottoni, «Nuova carriera» presente) ✅ · richieste esterne tentate: **nessuna** ✅ · errori console: **nessuno** ✅ · flag store (feature AI off) attivo ✅ · **EXIT 0**. Log: `docs/rilascio/validate-dist.log`.
- Prerequisiti: `npm install` in `tests/visual` (node_modules non presenti nel worktree; eseguito, EXIT 0).

Esito punti 1–2: **verde**. Il punto 1 ha però una riserva di copertura del gate (vedi tabella).

## 3. Regressione su carriere lunghe

Build: worktree `/tmp/cpm` (ec8f073), `tests/visual` con `npm install` EXIT 0. Browser: `CPM_CHROME=/opt/pw-browsers/chromium`.

| Guardiano | Esito | Log |
|---|---|---|
| `career-invariants.mjs` | ✅ EXIT 0 · 252 club · pageerror 0 | `reg-career-invariants.log` |
| `tripath-chokepoint-test.mjs` | ✅ EXIT 0 · i 3 path delegano a tutti i chokepoint | `reg-tripath.log` |
| `stab-nat-trigger-test.mjs` | ✅ EXIT 0 · trigger Nazionali coerente, pageerror 0 | `reg-stab-nat.log` |
| `career-sim-test.mjs` (standard, 2 stagioni) | ✅ EXIT 0 · 154 step · pageerror 0 | `reg-career-sim.log` |

**Sonda nuova per il punto (≥3 stagioni, handler veri, `__CPM_CAREER`):** `docs/rilascio/probe-rilascio-3s.mjs` (copia di lavoro in `tests/visual/`). Parametri: `PROBE_SAVE=new|old`, `PROBE_FIX=<fixture>`. Misura: rollover, invarianti (standings=18, GF=GA, banca≥0, OVR 40–99, settimana monotona), **ricarica** (reload + confronto chiavi del `player` in `localStorage`), pageerror.

| Salvataggio | Stagioni | Errori di pagina | Chiavi prima/dopo reload | Esito | Log |
|---|---|---|---|---|---|
| **Nuovo** (seme in-app, S2 W1) | 3/3 (S2→S5) | 0 | 137 / 137 · persi 0 | ✅ | `reg-3s-new.log` |
| **Vecchio** `save-190-s12-ovr93.json` (S12 W38, OVR 93) | 3/3 (S12→S15) | 0 | 187 / 187 · persi 0 | ✅ | `reg-3s-old190.log` |
| **Vecchio** `save-194-primavera-w38.json` (S1 W38, U18) | 3/3 (S1→S5) | 0 | 146 / 147 · persi 0 · nuovi 1 (`fitnessCoachRel`, migrazione) | ❌ solo per GF≠GA iniziale (vedi rilievo A) | `reg-3s-old.log` |

**Rilievo A — classifica del salvataggio 194 non coerente al caricamento (da sistemare).** Il file fixture ha già la classifica sbilanciata: somma GF **790** ≠ somma GA **787** su 18 squadre (561 partite giocate; verificato con lettura diretta del JSON). Il gioco non la ripara al caricamento: al passo 1 la sonda legge `S1W38: GF 790 ≠ GA 787`, a W39 `792 ≠ 789`. La differenza resta costante a 3 (non cresce a ogni partita): è **ereditata dal salvataggio**, non generata dal gioco. Si azzera al rollover (S2 `GF=GA` su tutti i rollover, es. S2→S3 820=820). Riproduzione: `PROBE_SAVE=old PROBE_FIX=save-194-primavera-w38.json node probe-rilascio-3s.mjs`. Il guardiano `STAB-12` dichiara di RICONCILIARE la classifica in migrazione (`CLAUDE.md`): qui la riconciliazione non avviene. ⚠️ **Non posso confermare** da quale versione derivi lo sbilancio: il file non ha metadati di versione oltre `saveVersion: 9`.

**Rilievo B — «blocco» dello step a fine U18 (NON è un difetto del gioco).** Nel salvataggio 194 lo step ripete `advanced` a W39/40 senza avanzare. Causa misurata: lo schermo è `proTransition` (transizione U18→pro, `ProTransitionScreen`, scelta «Accetta →» / «Resta →»), che lo step dell'harness non gestisce (`__CPM_CAREER.step`, riga ~45291). Il giocatore sceglie l'offerta; la sonda ora la sceglie. Il gioco non si ferma.

**Rilievo C — banca 134.943 k€ dopo 3 stagioni (salvataggio 190).** Non anomalo per il salvataggio: il fixture parte già da `bankBalance` 92.316.631 €, e l'investimento a fine stagione (`investSeason24`, rendimenti da −20% a +30%) spiega la crescita. **Non posso confermare** che l'economia sia bilanciata: il controllo è di non-regressione, non di realismo.

**Frequenza:** rilievo A su 1 run del salvataggio 194 (3 esecuzioni: stesso valore 790/787 e 792/789, quindi deterministico). Salvataggi 190 e nuovo: nessun rilievo in 1 run ciascuno.

Esito punto 3: **verde sui guardiani standard e sul salvataggio nuovo e 190; il salvataggio 194 chiude con il rilievo A da sistemare.**

