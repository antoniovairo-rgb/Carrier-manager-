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

