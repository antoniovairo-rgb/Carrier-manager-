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

## 4. Errori di console a 375 px

Sonda: `docs/rilascio/probe-console-375.mjs` (viewport 375×812). Per ogni schermata: errori e avvisi di console, pageerror, scroll orizzontale (`scrollWidth − clientWidth`), estratto di testo visibile **per verificare che la schermata sia davvero quella attesa**. Due varianti: sorgente `CARRIER-MANAGER-AV.html` (quella servita da GitHub Pages) e dist `dist/index.html` (`PROBE_URL=dist/index.html`).

| Schermata | Come | Sorgente (log `console-375.log`) | Dist (log `console-375-dist.log`) |
|---|---|---|---|
| home | percorso | 2 messaggi (vedi sotto) · overflow 0 px | 0 · overflow 0 px |
| dashboard carriera | percorso (CONTINUA) | 0 · 0 px | 0 · 0 px |
| calendario | hook `goTab` (sorgente) · tap (dist) | 0 · 0 px ✅ testo verificato | 0 · click eseguito (contenuto non verificato) |
| classifica | idem | 0 · 0 px ✅ testo verificato | 0 · click eseguito |
| profilo | hook (sorgente) · tap (dist) | 0 · 0 px ✅ testo verificato | ⚠️ **tap «Profilo» NON trovato** (vedi rilievo E) |
| agente | hook · tap | 0 · 0 px ✅ | 0 · click eseguito |
| ufficio | hook · tap | 0 · 0 px ✅ | 0 · click eseguito |
| opzioni | percorso (voce «Opzioni») | 0 · 0 px ✅ testo verificato | 0 · 0 px ✅ |
| intervista | hook `forceInterview` | ❌ **NON verificata**: busta non vista nel testo dopo 2,6 s · vedi rilievo D | NON ESEGUITA su dist |
| post-partita | hook `goScreen('postmatch')` | ❌ **NON verificata**: il testo resta quello della dashboard | NON ESEGUITA su dist |
| partita 3D | `openMatch` (flusso reale, provino) | 2 messaggi · overflow 0 px · testo «PROVINO 1/3» ✅ | NON ESEGUITA su dist (richiede gli hook) |
| partita 2D | non separata | ❓ **Non posso confermarlo**: nel sorgente non ho trovato una modalità 2D distinta dalla 3D nel percorso reale | — |

**Messaggi di console (sorgente): 6 in totale, tutti dal transpiler in-browser Babel** (`src/00-head.html:66-67` carica `@babel/standalone` da CDN; `src/00-head.html:313` `<script type="text/babel">`):
- `warning`: «You are using the in-browser Babel transformer. Be sure to precompile your scripts for production»
- `error`: «[BABEL] Note: The code generator has deoptimised the styling of /Inline Babel script as it exceeds the max of 500KB.»
Frequenza: **2 messaggi per caricamento** della pagina (una coppia warning+error). Sulle 3 aperture della sonda: home (2 coppie in tutto) e partita (1 coppia). ⚠️ **Non posso confermare** perché la coppia compaia due volte sul primo caricamento: non l'ho isolato.
**Dist offline: 0 messaggi** su tutte le schermate raggiunte. Conferma coerente con la build (`build-dist.log`: «Babel-in-browser: rimosso»).

**Overflow orizzontale a 375 px: 0 px su tutte le schermate misurate** (sorgente e dist).

**Copertura del punto 4 — dichiarata:** intervista e post-partita NON verificate a 375 px dalla sonda. Un'altra sonda del repo, `tests/visual/intervista-2d.mjs`, apre l'intervista (sala stampa «scena aperta: SI») con «PASS» e 0 errori di pagina, **ma a 412 px**, non a 375. Il post-partita non è raggiunto da nessuna sonda del repo che io abbia verificato.

## 5. Lista dei BLOCCANTI per la pubblicazione

Gravità: **bloccante** (impedisce la pubblicazione) · **da sistemare** (va corretto prima del rilascio, ma non ferma il sito) · **estetico** · **da verificare** (il rilievo non è confermato). Nessuna correzione è stata fatta: le fa il team.

**A. Riferimenti reali fuori dal gate di copyright — BLOCCANTE (da confermare con il PO).** Il gate dice 0, ma il repo stesso definisce il de-branding bloccante (`src/09-audio-scout-anagrafiche.jsx:916`). La blocklist cerca solo nomi completi (`:915-921`), quindi non copre:
- Derby con nomi di rivalità reali: `src/08-panchina-derby-meteo-cori.jsx:116` «Derby d'Italia», `:117` «Derby di Milano», `:118` «Derby della Capitale», `:120` «Derby del Sole».
- Nomignoli reali di club: `src/02-club-leghe-albo.jsx:27` «FC Nerazzurri», `:28` «AC Rossoneri», `:31` «FC Biancoceleste», `:29` «FC Partenope».
- Slug di club reali usati come ID: `src/02-club-leghe-albo.jsx:27-31`, `:102` (`psg`), `src/05-cronaca-stadi-formazioni.jsx:458-485`.
- **Riproduzione:** `grep -n "Derby d'Italia" src/08-panchina-derby-meteo-cori.jsx`. **Non posso confermare** se questi nomi escono a schermo: va verificato con la sonda sul DOM.

**B. Classifica del salvataggio ereditato non coerente — da sistemare.** Salvataggio `tests/visual/fixtures/save-194-primavera-w38.json`: somma GF 790 ≠ GA 787 su 18 squadre. Non riparata al caricamento; si azzera al rollover. **Causa probabile:** la riconciliazione controlla composizione (id e numero di squadre), non le somme: `src/17-menu-creazione-pannelli.jsx:1804-1811`. **Frequenza:** 3 esecuzioni su 3, stesso valore. **Riproduzione:** `PROBE_SAVE=old PROBE_FIX=save-194-primavera-w38.json node probe-rilascio-3s.mjs`. ⚠️ Origine del fixture non determinata.

**C. Console della sorgente: avviso Babel e nota «deoptimised» a ogni caricamento — da sistemare (se si pubblica la sorgente).** Il sito GitHub Pages serve la sorgente, quindi il rilievo vale per il sito; la dist (store) è pulita. **Riproduzione:** apri `CARRIER-MANAGER-AV.html` a 375 px e leggi la console. Frequenza: 2 messaggi per caricamento. File: `src/00-head.html:66-67`, `:313`.

**D. Intervista e post-partita non verificate a 375 px — da verificare.** Non è un difetto confermato: la sonda non le ha raggiunte. **Riproduzione:** la sonda `probe-console-375.mjs` apre l'intervista via `forceInterview` e non trova la busta («Apri la busta») nel testo; il post-partita via `goScreen('postmatch')` non cambia schermata. Serve un percorso di partita reale fino al fischio finale. ⚠️ Non posso confermare se è un limite della sonda o un difetto: l'intervista si apre in `intervista-2d.mjs` a 412 px.

**E. Scheda «Profilo» non trovata col testo sulla dist — da verificare.** Sulla dist il tap con testo «Profilo» non risponde; sulla sorgente la scheda si apre (via hook). Può essere solo l'etichetta diversa. **Non posso confermarlo** senza l'albero DOM della dist.

**F. Rilievi che NON sono bloccanti (estetico / da tenere d'occhio):**
- Banca 134.943 k€ dopo 3 stagioni dal salvataggio 190: non anomalo per lo stato di partenza (92,3 M€), ma **non posso confermare** che l'economia sia bilanciata (controllo di non-regressione, non di realismo).
- Lo step di `career-sim` si blocca su `proTransition` (transizione U18→pro): difetto dell'harness, non del gioco (la sonda ora sceglie «Accetta →»).

**Riepilogo dei punti:** 1 copyright gate verde (0 hit) · 2 dist offline verde · 3 guardiani verdi e salvataggi nuovo/190 verdi; salvataggio 194 con rilievo B · 4 dist 0 messaggi e 0 px di overflow; sorgente 6 messaggi Babel; intervista e post-partita non verificate · 5 bloccanti: A (da confermare col PO), B, C, D, E.


---

## Giro 2 (7.999.158)

Base: `origin/poc/marioprada-character-system` @ `8b9a9e5`, `GAME_VERSION="7.999.158"` (`CARRIER-MANAGER-AV.html`, `src/07-versione-save-interviste.jsx`). Worktree `/tmp/cpm158`. Build sorgente: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` EXIT 0 (56.520 righe; `build-src-158.log`). Dipendenze `tests/visual`: `npm install` EXIT 0. Browser: `CPM_CHROME=/opt/pw-browsers/chromium`.

**Nota sul sito live.** `origin/main` è a `2adc96a`, con `GAME_VERSION="7.999.156"`: oggi il sito serve la 156. La 158 arriva al sito solo con la promozione su `main` (che fa partire `deploy-pages.yml`). Non è stata fatta: non richiesta.

### Correzioni al giro 1 (dichiarate qui, il testo del giro 1 resta com'era)

- **Rilievo C: la premessa era sbagliata.** Il giro 1 diceva che GitHub Pages serve la sorgente. Non è così: vedi punto 4.
- **Rilievo E: non è un difetto.** La sonda del giro 1 cercava «Profilo» come testo esatto al primo livello. Vedi punto 2.
- **Rilievo B: la causa indicata nel giro 1 non regge.** `src/17-menu-creazione-pannelli.jsx:1804-1811` è la riconciliazione per composizione (righe per id), non calcola somme. Vedi punto 3.

### Punto 5 — ripetizione del giro 1 (copyright, build offline, validate-dist)

| Controllo | Esito | Log |
|---|---|---|
| `node tools/audit-copyright.mjs` | EXIT 0 · «✅ OK — nessun riferimento» | `copyright-158.txt` |
| `node tools/build-dist.mjs` (store) | EXIT 0 · 10,7 s · CDN residue: nessuna | `build-dist-158.log` |
| `node tools/validate-dist.mjs` (store) | EXIT 0 · React montato, home, zero richieste esterne, zero errori | `validate-dist-158.log` |
| `node tools/build-dist.mjs --web` (quella che serve Pages) | EXIT 0 | `build-dist-web-158.log` |
| `node tools/validate-dist.mjs --web` | EXIT 0 · flag store assente, zero errori | `validate-dist-web-158.log` |

**Rilievo A riletto (blocklist):** il gate di copyright passa, ma le stringhe segnalate nel giro 1 sono ancora nei bundle distribuiti: `Derby d'Italia` (dist-web 2 occorrenze, dist 2), `FC Nerazzurri` (1 / 1), `Stadio Sabaudo` (2 / 2), `Stade Phocéen` (2 / 2). Sorgente: `src/08-panchina-derby-meteo-cori.jsx:116` («Derby d'Italia») e `src/02-club-leghe-albo.jsx:27` («FC Nerazzurri»). **Non posso confermare** che compaiano a schermo: non verificato in questo giro. Il rilievo A resta aperto come nel giro 1.

### Punto 1 — intervista e post-partita a 375×812, partita vera fino al fischio

Percorso: fixture `save-190-s12-ovr93.json` (S12 W38), `playMatch()` + `__CPM_AUTOPLAY(true,{seed:2021,policy:'seeded',tickMs:150})`, attesa di `ceremony`/`ended`. Sonda: `probe-partita-375.mjs`. Log: `partita-375-158.log` (ultima esecuzione). Screenshot: `shots-158-375/`.

- **Fischio finale** raggiunto in 177–202 s reali (5 esecuzioni). Nelle 5 esecuzioni il tabellone ha dato punteggi diversi con lo stesso seme (0–0, 1–2, 2–0, 3–4, 1–3). **Non posso confermare la causa** (non indagata: fuori dal mandato). Nota: il log conserva solo l'ultima esecuzione.
- **Premiazione** «PREMIAZIONE CAMPIONI!» → «Salta premiazione →»: overflow 0 px.
- **Post-partita** (dopo «Salta»): tabellino, «IL TUO TABELLINO», «TABELLINO DELLA GARA», xG, possesso. Overflow 0 px. Testo leggibile nello screenshot `02-dopo-click-Salta_premiazione_.png`, nessun testo tagliato.
- **Intervista**: non c'è un pulsante intervista nella post-partita. Dopo «🏟️ Torna alla dashboard» l'intervista compare da sola (senza hook): giornalista, ospiti in sala, tre risposte («Diplomatico», «Ambizioso», «Umile»). A 375 px overflow 0 px, testi interi. Screenshot `21-dashboard-dopo-partita.png`. Il giro 1 non l'aveva raggiunta: usava l'hook `forceInterview`, che in post-partita non apre la finestra; il percorso reale passa dalla dashboard.
- **Patto col mister** (`popup-224.mjs` a 375 px): verde = finestra presente, centrata, chiusa dalla scelta, patto `kept`; rosso = nessuna finestra e verdetto come riquadro in home (atteso). Screenshot `patto-375.png` (prima della chiusura): «IL PATTO COL MISTER — VERDETTO», testo intero. Il testo «41 gol su 0» viene dal guardiano, che forza l'obiettivo a 0: **artefatto del test**, non misurato con obiettivi reali.
- **Console**: sorgente 2 messaggi Babel per caricamento (come nel giro 1). In partita 1 warning `[CPM-GL] contesto grafico perso: la scena verrà ricostruita al ripristino` (`partita-375-158.log`): compare in headless, **non analizzato**. Dist web: 0 messaggi (punto 4).
- **Scroll orizzontale**: 0 px su tutte le schermate misurate (fine partita, post-partita, dashboard, intervista, patto).
- **Osservazione estetica (non bloccante)**: la barra di navigazione ha 7 voci da 53 px che coprono 0–375 px. Misura DOM: `scrollWidth = clientWidth = 48` su ogni voce, quindi nessun taglio dentro i pulsanti, ma «OPZIONI» arriva al bordo destro senza margine (`nav` in `popup-224-shot` log, `patto-shot-158.log`).

### Punto 2 — scheda «Profilo» sulla dist: NON è un difetto

- Etichetta reale: la barra in basso ha la voce **CARRIERA** (il CSS la mette in maiuscolo; `innerText` = «CARRIERA», `textContent` = «Carriera»). Dentro CARRIERA il segmented control ha **«👤 Profilo»** e **«🌍 Nazionale»** (`src/18-career-app.jsx:7162`, `label:"Profilo"` con icona).
- Dopo il percorso CARRIERA → «👤 Profilo» la scheda si apre: compare «STATISTICHE» (in maiuscolo via CSS), sezioni «RECORD DI CARRIERA», «BIOGRAFIA», «STATISTICHE CARRIERA». Overflow 0 px, 0 messaggi console. Screenshot `shots-158-profilo/02-profilo.png`.
- Perché il giro 1 la dava «non trovata»: cercava «Profilo» come testo esatto al primo livello. Sonda corretta: `probe-profilo-dist.mjs`.

### Punto 3 — classifica del salvataggio 194 (GF 790 ≠ GA 787)

**Riprodotto sulla 158** (`probe-3s-194-158.log`, `PROBE_SAVE=old PROBE_FIX=save-194-primavera-w38.json`): `S1W38: GF 790 ≠ GA 787` (ripetuto due volte) e `S1W40: GF 792 ≠ GA 789`. Il giro 1 leggeva «W39»: il passo che sceglie la transizione U18→pro cambia il conteggio delle settimane, da qui la differenza di etichetta. Lo sbilancio è costante a 3 e si azzera a ogni rollover (S2→S3 817=817, S3→S4 787=787, S4→S5 765=765).

**Verifiche sul file (lettura diretta, `save-194-primavera-w38.json`):**
- 18 righe. **Ogni riga è coerente in sé**: V+P+S = giocate, punti = 3V+P, differenza reti = GF−GA.
- La riga dell'eroe (FC Laguna Primavera, id `ven`) **coincide con il suo calendario**: GF 59, GA 10, 33 risultati su 33 coerenti con il segno (`homeScore` nel calendario = gol dell'eroe, non gol di casa: convenzione verificata sui 33 risultati).
- Quindi lo sbilancio di +3 sta in partite **fra squadre diverse dall'eroe**, che il calendario non registra.

**Settimana di origine: non determinabile dal file.** Il file non contiene storia delle settimane e lo sbilancio è già presente al caricamento. **Non posso confermarlo.**

**Causa: IPOTESI (non verificata).** `src/09-audio-scout-anagrafiche.jsx:1433-1441`, ramo «riposo» di `updateStandings`: quando le squadre non ancora accoppiate sono dispari, la squadra di riposo (`byeTeam`) riceve `gf += bG` e `ga += gG` (riga 1438) senza che alcuna controparte registri quei gol. Le partite accoppiate invece sono simmetriche (`src/09-audio-scout-anagrafiche.jsx:1453-1455`: `h.gf+=hG; h.ga+=aG` e `a.gf+=aG; a.ga+=hG`). Ogni riposo sposta quindi GF−GA di `bG−gG`. Il meccanismo è coerente con un +3 netto, ma **non è provato**: mancano i riposi della stagione. Per confermarlo: contare i riposi per stagione in una replay da S1 W1 e controllare GF−GA settimana per settimana (non eseguito: niente correzioni in questo giro).

### Punto 4 — Babel in-browser: quanto pesa e cosa serve il sito

**Come si pubblica (`.github/workflows/deploy-pages.yml`, su push a `main`, verificato anche su `origin/main`):**
- riga 68: la sorgente viene copiata in `_site/`;
- righe 75–76: `index.html` e `CARRIER-MANAGER-AV.html` vengono **sovrascritti** con `dist-web/index.html`, prodotto da `tools/build-dist.mjs --web` (riga 44).

Quindi il sito **già serve la dist precompilata**, sia alla radice sia all'indirizzo storico. La sorgente non è pubblicata. La premessa del giro 1 era errata. Il rilievo C riguarda solo chi apre il file sorgente in locale.

**Misura** (`probe-babel-tempo.mjs`, log `babel-tempo-158.log`, 3 caricamenti ciascuno, contesto nuovo, tempo da navigazione a `#root` popolato):

| Versione | Caricamenti (ms) | Mediana | Messaggi Babel in console |
|---|---|---|---|
| Sorgente `CARRIER-MANAGER-AV.html` | 11.569 · 10.652 · 10.150 | **10.652 ms** | 2 per caricamento (warning + error «deoptimised») |
| Dist web `dist-web/index.html` | 478 · 519 · 530 | **519 ms** | 0 |

Ambiente: headless con librerie locali (`installCdnRoutes`): i valori sono **relativi**, non misurano la rete o un telefono. Il messaggio «deoptimised» dichiara che Babel ha disattivato l'ottimizzazione di stile perché l'input supera i 500 KB: **non ho verificato altro** oltre al tempo misurato.

### Riepilogo dei punti del giro 2

| Punto | Esito |
|---|---|
| 1 · D intervista/post-partita/patto a 375 px | ✅ fischio raggiunto, post-partita e intervista leggibili, overflow 0 px, patto verde e rosso come atteso. Due rilievi estetici/di test (barra al bordo, «41 gol su 0» da obiettivo forzato) |
| 2 · E scheda Profilo | ✅ **non è un difetto**: voce «👤 Profilo» dentro CARRIERA, si apre |
| 3 · B classifica 194 | ✅ riprodotta (790≠787 da S1W38, costante a 3). Settimana non determinabile. Causa **ipotesi** `src/09-audio-scout-anagrafiche.jsx:1433-1441` (riposo a senso unico) |
| 4 · C Babel | ✅ premessa corretta: il sito serve già la dist. Sorgente 10,7 s vs dist-web 0,5 s (mediana, headless) |
| 5 · ripetizione copyright/build/validate | ✅ tutti EXIT 0 su store e web. A: stringhe ancora nei bundle, visibilità non confermata |

**Punti aperti:** A (copyright: blocklist incompleta, stringhe nel bundle); B (causa da confermare con replay dei riposi); esiti diversi con lo stesso seme nella partita (causa non indagata); `[CPM-GL] contesto grafico perso` in headless (non analizzato). Nessuna correzione al gioco. Nessuna promozione su `main`. Nessuna PR.
