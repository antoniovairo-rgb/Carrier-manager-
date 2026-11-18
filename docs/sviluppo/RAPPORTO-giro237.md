# Rapporto giro 237 — PO-502 «versione web già tradotta» e PO-504 B «controlli più veloci»

Ramo `sviluppo/giro237-web-precompilata`, partito da `lavoro/197` (= 7.999.196 pubblicata). `GAME_VERSION` non toccata.
**Nessuna riga di `src/` né di `CARRIER-MANAGER-AV.html` è cambiata**: `node tools/check-src.mjs` → «IDENTICO BYTE PER BYTE»
(7.658.991 byte da 21 frammenti). Il lavoro sta tutto in strumenti: banco di prova, build del sito, workflow di pubblicazione.

---

## 1. PO-502 — la versione web pubblicata è già tradotta (misurato prima di toccare)

**Misura sul sito vero, prima di qualunque modifica** (17/11 mattina, `curl` di
`https://antoniovairo-rgb.github.io/Carrier-manager-/` e `/CARRIER-MANAGER-AV.html`):

- le due pagine sono **identiche** (7.291.017 byte ciascuna) e sono la 7.999.196;
- **nessun** `<script type="text/babel">`, **nessun** caricamento di babel-standalone, **nessuna** CDN: l'unica parola «babel» è
  la riga della pagina licenze (`@babel/standalone/package.json`);
- la pagina pubblicata è **identica byte per byte** a `dist-web/index.html` prodotto qui da `node tools/build-dist.mjs --web`
  sullo stesso commit.

Quindi **il sito pubblicato era già precompilato**: il workflow `deploy-pages.yml` esegue `build-dist.mjs --web` e copia
`dist-web/index.html` su `index.html` e su `CARRIER-MANAGER-AV.html` (passo commentato «[7.999.11]», presente nel workflow almeno
dall'unione di `lavoro/194`, commit `f986f1a`). La premessa del giro 219 («CARRIER-MANAGER-AV.html carica babel-standalone») vale per
il **sorgente nel repository**, e per il **banco di prova**, che serviva proprio quel sorgente — non per il sito.
Il giro 219 lo aveva scritto come «Non posso confermare»: ora è confermato.

Cosa ho aggiunto, visto che la traduzione c'era già ma **nessuno la verificava**:

1. **Guardiano `web-237`** (`tests/visual/web-237.mjs`, `npm run web-237` = verde + rosso). Serve la cartella che il deploy
   pubblica sui **due indirizzi** del sito («/» e «/CARRIER-MANAGER-AV.html»), con **rete esterna bloccata**, e pretende:
   - la pagina **non scarica** Babel (nessuna richiesta `*babel*.js`) e **non lo esegue** (`window.Babel` assente, nessuno
     `script[type="text/babel"]`, nessun «text/babel» nel file);
   - **avvio fino al menu** («Nuova carriera») **sotto 4.000 ms** (soglia dichiarata), mediana di 3 pagine nuove;
   - un **salvataggio esistente** (`fixtures/save-194-primavera-w38.json` scritto in `cpm-v3`, come lo trova il gioco) viene
     caricato: «Continua» → carriera col club del salvataggio, e dopo il caricamento `cpm-v3` è ancora leggibile con la stessa
     stagione e settimana;
   - zero errori di pagina, zero richieste esterne.
   Misurato: **verde** menu 611-643 ms (mediana), salvataggio caricato; **rosso** (`CPM_PROVA_ROSSO=1`, cartella
   `dist-web-babel/`) menu **10.488-11.274 ms**, Babel eseguito su 3 aperture su 3 → il guardiano lo boccia come deve.
   Uscita 0 verde · 1 rosso · 2 non giudicato (= rosso).
2. **Ritirata dichiarata del build**: `node tools/build-dist.mjs --web --babel-browser` produce `dist-web-babel/` (in
   `.gitignore`) con il blocco `text/babel` intatto e babel-standalone in linea, cioè la pagina tradotta nel browser. **Non la
   pubblica nessuno**: serve alla prova del rosso e, se mai servisse, a tornare indietro consapevolmente. `dist-web/` (quella del
   deploy) non viene mai toccata da quell'opzione.
3. **Verifica nel deploy**: `deploy-pages.yml` ha un passo nuovo, dopo la costruzione di `_site`, che (a) rifiuta `index.html` o
   `CARRIER-MANAGER-AV.html` con `type="text/babel"` e (b) esegue `web-237` **sulla cartella `_site` così come va online**
   (`CPM_WEB237_DIR=_site`). Se è rosso il deploy si ferma, come le altre guardie del workflow. Provato in locale su una copia di
   `_site` (verde, menu 566 ms). **Non provato su GitHub**: il workflow gira solo al push su `main`.
4. `web-237` è nel **nucleo** (quindi in ogni `mirata`) e nella **completa** (quindi in `notte`), una volta per catena;
   `node --check ci-runner.mjs` ok, nessun doppione nelle catene.

Indirizzo e salvataggi: il deploy continua a scrivere `index.html` e `CARRIER-MANAGER-AV.html` nello stesso posto (nessun
cambiamento di indirizzo) e la pagina tradotta usa le stesse chiavi (`cpm-v3`…): `web-237` lo verifica a ogni deploy.
Nessuna credenziale, nessun invio a Google, nessun asset nuovo.

---

## 2. PO-504 B — dove va il tempo dei controlli e cosa ho cambiato

### 2.1 La pagina di prova costava ~10 s e 1,1 GB a ogni apertura

Tutti i guardiani (tranne una manciata di strumenti con un server proprio: `run-golden`, `run-force-all`, `audio-14x/16x`…)
aprono il gioco da `startServer` di `lib/harness.mjs`, che serviva **il sorgente**: ogni pagina scaricava babel-standalone
(~3 MB) e traduceva ~4 MB di JSX nel browser. Misura con `misura-pagina-237.mjs` (4 aperture per braccio, alternate, pagine nuove):

| | ms fino al menu (mediana) | memoria JS | Babel chiesto |
|---|---|---|---|
| sorgente, Babel nel browser | **10.740** (9.817-11.634) | **1.142 MB** | sì |
| pagina già tradotta | **644** (592-697) | **13 MB** | no |

La traduzione in node costa **6,8 s una volta per build**.

**Correzione** (`lib/precompila-237.mjs`, agganciata in `startServer`): quando un guardiano chiede `CARRIER-MANAGER-AV.html`, il
server del banco consegna **la stessa pagina col JSX già tradotto** in node, con lo stesso Babel (7.23.6) e lo stesso preset della
build del sito (`presets:['react']`), e senza le due righe che caricano babel-standalone. Cache su disco per **impronta sha256 del
sorgente** (`out/.precompilata-237/`, scrittura atomica, ultime 3 build), quindi tutti i guardiani della stessa build la riusano.
Tutto il resto della pagina è identico (CDN instradate sui node_modules, `?cpmtest=1`, varchi `__CPM_*`).
**Ritirata**: `CPM_BABEL_BROWSER=1` → il banco torna al sorgente tradotto nel browser (è il braccio «prima» della tabella).
Soglie, campioni, scene, scenari e coperture: **nessuno toccato**.

### 2.2 Tabella prima/dopo (31 guardiani, uno alla volta, `CPM_CI_PAR=0`, stessa macchina, 17/11 06:40-22:43)

«Prima» = `CPM_BABEL_BROWSER=1`; «dopo» = pagina tradotta. Ogni riga è **una corsa per braccio** (pilota `tempi-237.mjs`, dati
grezzi in `docs/sviluppo/giro237/tempi.jsonl`). «Pagine» = pagine di gioco aperte dal guardiano (registro `CPM_T237_LOG`).
Il comando del guardiano è quello di `package.json` (verde **e** rosso dove lo script li comprende).

| Guardiano | Prima (Babel nel browser) | Dopo (pagina tradotta) | Δ | Pagine aperte | Esito prima | Esito dopo |
|---|---|---|---|---|---|---|
| highlight-95 | 97′55″ | 94′42″ | -3% | 76 | verde | verde |
| ingresso-206 | 52′00″ | 51′05″ | -2% | 12 | verde | verde |
| scena3d-96 | 32′01″ | 29′46″ | -7% | 20 | verde | verde |
| parata-100 | 31′08″ | 29′54″ | -4% | 20 | verde | ROSSO (1) → riprova verde |
| esiti-218 | 26′58″ | 26′01″ | -4% | 12 | verde | verde |
| tpose-196 | 26′54″ | 26′01″ | -3% | 5 | verde | verde |
| chiusura-99 | 23′46″ | 22′07″ | -7% | 12 | verde | verde |
| dribbling-226 | 19′51″ | 17′40″ | -11% | 34 | verde | verde |
| interazioni-226 | 18′48″ | 17′59″ | -4% | 8 | verde | verde |
| gigante-212 | 17′30″ | 15′50″ | -10% | 11 | verde | verde |
| career-critical | 15′24″ | 8′12″ | **-47%** | 84 | verde | verde |
| intervista-231 | 15′07″ | 14′17″ | -6% | 8 | verde | verde |
| giornale-244 | 14′15″ | 13′39″ | -4% | 8 | ROSSO (1) | ROSSO (1) — identico |
| portiere-223 | 13′35″ | 8′12″ | **-40%** | 56 | verde | verde |
| esiti-96 | 13′33″ | 11′43″ | -14% | 16 | verde | verde |
| solo-highlight-166 | 11′41″ | 10′34″ | -10% | 14 | verde | verde |
| rassegna-232 | 9′55″ | 8′40″ | -13% | 14 | verde | verde |
| tocco3d-219 | 9′44″ | 8′07″ | -17% | 20 | verde | verde |
| salienti-229 | 9′42″ | 2′46″ | -71%* | 10 | ROSSO (1) | verde |
| tocco-213 | 7′20″ | 4′20″ | **-41%** | 36 | ROSSO (1) | verde |
| partita-vera | 6′53″ | 6′29″ | -6% | 4 | verde | verde |
| goal-postarc | 6′23″ | 5′15″ | -18% | 7 | verde | verde |
| voto-79 | 6′21″ | 5′40″ | -11% | 6 | ROSSO (2, «cieco») | ROSSO (2, «cieco») — identico |
| tabellino-228 | 5′12″ | 4′56″ | -5% | 4 | verde | verde |
| notte-206 | 4′48″ | 3′05″ | -36% | 10 | verde | verde |
| gk-dive-sync | 3′35″ | 3′04″ | -14% | 2 | verde | verde |
| schermate-97 | 3′24″ | 2′19″ | -32%* | 35 (prima: 19) | ROSSO (1) | verde |
| licenze-184 | 2′50″ | 1′53″ | -34% | 6 | verde | verde |
| calendario-218 | 1′15″ | 34″ | -55% | 8 | verde | verde |
| save-compat | 11″ | 2″ | -82% | 1 | verde | verde |
| test:logic | 3″ | 3″ | 0% | 0 | verde | verde |
| **Totale** | **508′02″** | **454′55″** | **-10%** | | | |

\* salienti-229 e schermate-97: nel braccio «prima» il guardiano è uscito rosso, quindi la durata non è confrontabile (schermate-97
si è fermato a 19 pagine su 35). Riprove di questi casi in §2.4.

Lettura onesta:

- **Il risparmio è di ~6 s per pagina aperta** (mediana su 24 guardiani verdi in entrambi i bracci; 2,5-15,5 s), meno dei 10 s della
  misura singola perché diversi guardiani aprono 2-3 pagine in parallelo e le traduzioni si sovrapponevano.
- Pesa **molto** sui guardiani che aprono tante pagine brevi (career-critical -47%, portiere-223 -40%, tocco-213 -41%,
  save-compat -82%) e **poco** su quelli lunghi (highlight-95 -3%, ingresso-206 -2%, tpose-196 -3%): lì il tempo **non è Babel**.
- **Dove va il tempo dei lunghi** (dopo la correzione): highlight-95 ≈ 75 s per pagina, tpose-196 ≈ 312 s, ingresso-206 ≈ 255 s.
  È **tempo di gioco e di scena**: partite vere col cronometro di gioco (`MATCH_TICK_MS`), cerimonie d'ingresso intere con CPU ×2
  emulata (`ingresso-206`, `tpose-196`), finestre misurate in **secondi di scena** (`__CPM_SCENET`) che sul disegno software a
  pochi fotogrammi al secondo durano molti secondi di parete. Accorciarlo vuol dire cambiare quanto gioco si guarda o con quale CPU
  emulata, cioè **campioni e coperture**: non l'ho fatto (vedi dubbi).
- **Attese fisse**: nei guardiani lunghi ci sono solo attese brevi dopo il caricamento (`sleep(1200)` + `sleep(1500/2000)`, ~2,7-3,2 s
  per pagina) e attese di lettura dentro le scene (`sleep(600)` in `hl_choose`, cicli da 120-400 ms). Non ho trovato attese fisse
  grandi che non servano a qualcosa: quelle dopo il caricamento lasciano assestare la carriera prima di «Continua»/`playMatch` e
  pesano al massimo ~3 s × pagine (highlight-95: ~4 min su 95). **Non le ho tolte**: il guadagno è piccolo e togliere un'attesa
  senza un evento da aspettare al suo posto è la forma esatta di un controllo instabile (regole PO-311). Le elenco nei dubbi.
- **Pagine riaperte**: il conto è nella colonna «Pagine». Ridurle vorrebbe dire riusare una pagina fra scenari diversi; per le regole
  della casa («una pagina stanca non è il gioco», 7.483) è una scelta che cambia il valore delle misure, quindi non l'ho presa.
- **Traduzione Babel per pagina**: tolta (§2.1). È l'unica leva che non tocca né soglie né campioni.

### 2.3 Il banco funziona sulla pagina tradotta

Sulla pagina tradotta sono **verdi**: `web-237` (verde + rosso), `test:logic`, `save-compat`, `career-critical` (8′12″),
`tocco-213` (verde + rosso `__CPM_NO_G213`), `licenze-184` (verde + prova del rosso), e gli altri 24 guardiani della tabella
con il loro braccio rosso dove lo script lo comprende. Gli unici rossi del «dopo» sono `giornale-244` e `voto-79`, **identici al
«prima»** (stesse righe d'errore: «testata null» e «B rosso senza render dopo l'interruttore»), quindi preesistenti e non
dovuti alla pagina tradotta; `giornale-244` non è in nessuna catena fissa (resta nella MAPPA mirata), `voto-79` è in `completa` — vedi dubbi. `parata-100` è stato rosso una volta sul «dopo» e verde alla riprova.

### 2.4 Riprove dei casi discordanti

Una corsa in più per ogni caso discordante (dati in `docs/sviluppo/giro237/riprove.jsonl`):

| Guardiano | Braccio | 1ª corsa | Riprova | Lettura |
|---|---|---|---|---|
| tocco-213 | prima | ROSSO (riscontro 126 ms > 50 su «offerta») · 7′20″ | verde · 7′03″ | instabile col Babel (1 su 2); dopo: verde 4′20″ |
| salienti-229 | prima | ROSSO (rigori «non giudicato») · 9′42″ | verde · 3′26″ | instabile col Babel (1 su 2); dopo: verde 2′46″ |
| schermate-97 | prima | ROSSO (fotogramma nero a +150 ms, cerimonia) · 3′24″ | verde · 4′52″ | instabile col Babel (1 su 2); dopo: verde 2′19″ |
| parata-100 | dopo | ROSSO (prova s5/7 «Uno-due», minGB 13,3) · 29′54″ | verde · 29′40″ | instabile (1 su 2) |
| parata-100 | prima | verde · 31′08″ | verde · 30′54″ | — |

Con le riprove, il confronto alla pari per i tre instabili è: tocco-213 7′03″ → 4′20″ (-39%), salienti-229 3′26″ → 2′46″ (-19%),
schermate-97 4′52″ → 2′19″ (-52%). `parata-100` è instabile anche sulla pagina tradotta: non è un effetto della traduzione (la
scena che lo fa fallire è la stessa che il braccio rosso boccia), va riparato a parte.

Esecuzione finale di `npm run web-237` (verde + rosso, uscita 0): verde menu 562 ms, salvataggio caricato; rosso menu 10.872 ms,
Babel eseguito → bocciato come deve.

---

## 3. File toccati

- `tests/visual/lib/precompila-237.mjs` (nuovo) · `tests/visual/lib/harness.mjs` (`startServer` consegna la pagina tradotta)
- `tests/visual/web-237.mjs` (nuovo guardiano) · `tests/visual/package.json` (`web-237`) · `tests/visual/ci-runner.mjs`
  (`web-237` nel nucleo e nella completa)
- `tests/visual/misura-pagina-237.mjs`, `tempi-237.mjs`, `tabella-237.mjs` (strumenti di misura, non guardiani)
- `tools/build-dist.mjs` (`--web --babel-browser` → `dist-web-babel/`) · `.gitignore` (`dist-web-babel/`)
- `.github/workflows/deploy-pages.yml` (passo «Verifica del sito — pagina già tradotta (web-237)»)
- `CLAUDE.md` (una riga d'invariante) · `docs/sviluppo/giro237/tempi.jsonl` (dati grezzi)

Foto di altri giri rigenerate dai controlli (`docs/sviluppo/giro196/*`, `giro212/*`…): rimesse con `git checkout --`, non committate.

---

## 4. Dubbi per il PO

1. **PO-502 era già fatto.** Il sito serve la pagina tradotta: verificato sulla 7.999.196 pubblicata (byte per byte uguale alla build `--web`); il passo è nel workflow almeno dall'unione di `lavoro/194`.
   Questo giro aggiunge la **verifica** (guardiano + passo nel deploy) e la ritirata dichiarata, non la traduzione. Se il PO sul
   telefono vede ancora la pausa di Babel, la causa non è il sito di GitHub Pages: andrebbe guardato da dove apre il gioco (copia
   salvata, altro indirizzo, file aperto dal repository). **Non posso confermarlo** da qui.
2. **Il passo nuovo del deploy non è stato eseguito su GitHub** (parte solo al push su `main`). Ha una soglia di 4 s per l'avvio:
   qui sta a 0,6 s, sui runner GitHub non l'ho misurato. Se fosse rosso il deploy si ferma (come le altre guardie): il PO decide se
   preferisce che la soglia del deploy sia diversa da quella del guardiano.
3. **I controlli lunghi restano lunghi**: highlight-95 (95′), ingresso-206 (51′), scena3d-96 (30′), parata-100 (30′),
   esiti-218 (26′), tpose-196 (26′) sono legati al tempo di gioco e di scena sul disegno software. Le leve che restano
   **cambiano coperture o campioni** e quindi sono del PO: (a) meno partite/semi/salvataggi per guardiano (highlight-95 gioca
   19 partite per braccio, 38 in tutto); (b) velocità di partita più alta nel banco (il gioco ha 1×/1,5×/2×); (c) niente CPU ×2
   emulata nelle cerimonie; (d) riuso di una pagina per più scenari. Non ne ho adottata nessuna.
4. **Riprove instabili nel braccio «prima»**: tocco-213, salienti-229 e schermate-97 sono usciti rossi sul verde col sorgente
   tradotto nel browser e verdi sulla pagina tradotta e alla riprova col Babel sono usciti **verdi tutti e tre** (§2.4): instabili 1 su 2, non rotti. È coerente con la pausa di raccolta degli scarti
   di Babel (giro 219: 2,7-3,6 s a CPU ×4) che cade dentro una misura di tempo (tocco-213: riscontro 126 ms > 50), ma con due corse
   per braccio **non lo posso confermare** come causa.
5. **Rossi preesistenti visti di passaggio**: `voto-79` esce «cieco» (codice 2) in entrambi i bracci ed è nella catena `completa`;
   `giornale-244` è rosso in entrambi («testata null») non è in nessuna catena fissa ma resta nella MAPPA della `mirata` (righe di `src/14-`/`src/15-`). `parata-100` è uscito rosso 1 volta su 2 sul
   «dopo» (difetto «prova s5/7 Uno-due, minGB 13,3»): instabile, da riparare secondo la regola «instabile due volte si ripara».
6. **Non misurati** (per tempo: ~40′ per braccio ciascuno, 6 ore in due bracci): `nomi-219`, `difesa-220`, `scene-221`,
   `scena-motore-147`. Dalla regola misurata (~6 s per pagina) il guadagno atteso è piccolo; è una stima, non una misura.
7. **Chromium del banco tenta connessioni a `mtalk.google.com:5228`** (servizio di notifiche di Google, visto dal proxy durante le
   riprove). Non è il gioco né il sito: è il browser di prova con le opzioni di sempre. Non l'ho cambiato (le opzioni di lancio
   toccano tutti i guardiani); lo segnalo per la regola «nessun invio a Google».
8. Il guardiano `web-237` usa un salvataggio di prova esistente in `tests/visual/fixtures/` (`save-194-primavera-w38.json`); quel
   file contiene già un nome di giocatore reale, che non ho copiato altrove.
