# PLAY_STORE_READINESS.md — Studio di prontezza al rilascio su Google Play

> **Fase:** SOLO RICERCA/ANALISI. Nessuna modifica al codice è stata fatta o è proposta come "già decisa".
> **Oggetto:** *Elevora — Football Career Simulator* (`CARRIER-MANAGER-AV.html`, v5.45.2 / SAVE_VERSION 7).
> **Scenario di monetizzazione assunto come base:** **gratuito, senza pubblicità, con donazioni volontarie** (gli obblighi relativi sono trattati di conseguenza).
> **Metodo:** AUDIT sul file reale → opzioni motivate (pro/contro · costo · tempo · rischio · priorità) → roadmap a fasi.

---

## 0. Executive summary

Elevora è un gioco-carriera calcistico **single-file** (HTML + React 18 UMD + Three.js r128 + Babel-standalone che transpila il JSX **in-browser** al load; zero build, dipendenze da CDN). L'audit mostra che **è più vicino allo store di quanto sembri**: è già una **PWA installabile** (manifest, service worker, icone maskable, rebranding "Elevora") e il **de-branding** dei nomi è già avviato con tanto di scanner anti-regressione.

**Decisione del Product Owner:** la **qualità visiva del live match 3D (animazioni + regia/camera) così com'è NON è accettabile per il rilascio** → il suo refactor è il **blocco P0 #1 della Fase 1**: parte per primo, il resto segue.

I blocchi verso lo store sono quindi **un cantiere di qualità + tre cantieri di produzionizzazione**:

0. **🔴 Refactor qualità live match 3D (P0 #1)** — innalzare **animazioni** (oggi rigide/basilari, AI Vision ~40-55) e **regia/camera** (oggi ~50-65) a un livello "accettabile" deciso dal Product Owner. *Perceptual e gate-blind* → validazione via AI Vision + collaudo dal vivo, non dal gate. È l'item a **tempo aperto** e il principale rischio di schedule.
1. **Rimuovere Babel-in-browser** (precompilare il JSX) — oggi l'intero gioco è un unico `<script type="text/babel">` transpilato al volo. È lento all'avvio, fragile e non offline.
2. **Bundlare le dipendenze in locale** (React/Three/Babel non più da CDN) — un'app installata **deve** funzionare offline; oggi non lo fa.
3. **Conformità store** — privacy policy, Data Safety form, content rating, e gestione della **feature AI** (chiamata a `api.anthropic.com` con API key utente). *Senza ads e senza SDK di terzi la conformità è molto più leggera.*

### Semaforo di prontezza

| Area | Stato | Nota sintetica |
|---|---|---|
| **Qualità live match 3D (anim. + regia)** | 🔴 **P0 #1** | **Non accettabile per il rilascio** (decisione PO); perceptual/gate-blind → AI Vision + occhio |
| Packaging / installabilità | 🟢 Avanzato | PWA completa già presente (manifest+SW+icone) |
| Precompilazione JSX (no Babel runtime) | 🔴 Da fare | Tutto il gioco è transpilato in-browser |
| Bundle locale offline (no CDN) | 🔴 Da fare | Tutto remoto; fallback solo CDN→CDN |
| Performance Android entry-level | 🟡 Da misurare | Three r128 + alloc per-frame note |
| Privacy policy + Data Safety | 🔴 Da fare | Obbligatori; leggeri (no ads/SDK); solo la feature AI va gestita |
| Monetizzazione (donazioni) | 🟡 Da impostare | Link donazione esterno; **nessuna ricompensa in-app** (regola Play) |
| Content rating (IARC) | 🟡 Banale ma obbligatorio | Questionario in Console |
| IP / de-branding | 🟡 Avviato | Scanner presente; restano residui (es. "Rossoneri") |
| Save robustezza in WebView | 🟡 Da irrobustire | Rischio eviction localStorage |
| Asset di listing | 🔴 Da preparare | Icona ok (canvas), mancano screenshot/feature graphic/testi |

> **Conclusione operativa:** il **refactor qualità del live match 3D (anim. + regia) è il P0 #1 e parte per primo** (decisione PO). In parallelo/subito dopo, il packaging consigliato è **Capacitor** (offline reale + storage nativo), **dopo** aver risolto precompilazione JSX + bundle locale. *Nota TD:* il refactor 3D è perceptual/gate-blind → non ha un "verde automatico"; il suo completamento dipende dal collaudo dal vivo del Product Owner, ed è l'unico item a tempo aperto del piano (rischio di schedule principale).

---

## 1. Stato di fatto (AUDIT — fonti nel codice)

Fatti accertati leggendo `CARRIER-MANAGER-AV.html` e i doc di repo:

- **Versione:** `GAME_VERSION="5.45.2"`, `SAVE_VERSION=7`. File ~20.700 righe, ~1,6 MB.
- **PWA già presente** (righe 11–58): genera icone 192/512 (`purpose:"any"` + `"maskable"`) via Canvas, costruisce il **manifest come blob**, registra **`sw.js`** (service worker network-first con cache di `CARRIER-MANAGER-AV.html`), gestisce `beforeinstallprompt`/`appinstalled`. `display:"standalone"`, `orientation:"portrait-primary"`, `theme_color:"#2563eb"`. App già denominata **"Elevora: Football Career Simulator"**.
- **Babel in-browser** (riga 114): `<script type="text/babel" data-presets="react">` contiene **l'intero gioco**; transpilato al load da **Babel-standalone 7.23.6**. Lo spinner `#ld` resta finché il primo render non chiama `window._hide` (timeout di sicurezza a 15 s, riga 113).
- **CDN runtime** (righe 61–70): React 18.2.0, ReactDOM 18.2.0, **Three r128** + `GLTFLoader` + `SkeletonUtils`, **Babel-standalone 7.23.6**, (Phaser lazy-load on-demand, riga 71). C'è un **fallback sincrono** `cdnjs → jsdelivr` via `document.write` (righe 62/64/66/70): mitiga il down di *un* CDN ma **non rende l'app offline**.
- **GLB dormiente** (righe 5281–5288): `loadGLB`/`colorCharGLB` esistono ma non sono usati a runtime → niente asset binari pesanti oggi (la grafica è procedurale Three.js).
- **Feature AI** (righe 4269–4310): `callClaudeAPI` fa `fetch("https://api.anthropic.com/v1/messages")` con **API key dell'utente** letta da `localStorage["cpm-api-key"]`, header `anthropic-dangerous-direct-browser-access:"true"`, modello `claude-sonnet-4-6`. È **opzionale** (gated dalla key) e ha un **mock mode**. Usata per tattica avversaria / analisi stampa.
- **Persistenza** (righe ~4200): wrapper `storage` async (`window.storage` nativo se presente, altrimenti `localStorage`), **3 slot**, integrity-check, `migratePlayer` (~79 backfill accretivi, field-presence based).
- **De-branding già avviato:** `CLUBS` usa nomi fittizi ("Torino Athletic", "FC Nerazzurri", "AC Rossoneri", "FC Partenope"…), leghe rinominate ("Lega A", "Premier Division", "Championship"). Esiste **`_auditCopyrightSafety`** (riga ~4585) con blocklist `_CR_BRANDS`/`_CR_PLAYERS` che logga riferimenti reali residui (dev-only, `cpm-debug=1`).
- **Nessun build step** per il gioco (solo `tests/visual/package.json` per il quality gate Playwright).

---

## 2. Packaging — confronto paritario delle 4 opzioni

Obiettivo: trasformare l'app web in un **AAB** (Android App Bundle) pubblicabile. Quattro approcci, analizzati a pari dettaglio.

### 2.A — TWA (Trusted Web Activity) via Bubblewrap

L'app Android è un guscio che apre la **PWA a schermo intero**, senza barra browser, usando Chrome (Custom Tabs) sotto. Bubblewrap (CLI Google) genera il progetto Android e l'AAB a partire dal `manifest.json`.

- **Come funziona da noi:** la PWA esiste già. Serve però che il manifest sia **servito da un URL HTTPS reale** (non un blob runtime) e che il dominio sia verificato via **Digital Asset Links** (`assetlinks.json`). Quindi il gioco deve stare online (es. GitHub Pages già attivo su `main`).
- **Pro:** AAB minuscolo (poche centinaia di KB, è solo il guscio); aggiornamenti dei contenuti **senza ripubblicare** (cambi il sito → l'app si aggiorna); usa il motore Chrome aggiornato dal sistema (WebGL/JS sempre recenti → meno rischi Three r128); zero codice nativo da mantenere; è l'opzione **consigliata da Google** per PWA.
- **Contro:** richiede **online + Digital Asset Links** (serve un dominio stabile e HTTPS); **non è realmente offline** a meno che il service worker non faccia precaching completo (oggi `sw.js` è network-first → primo avvio richiede rete); dipende da Chrome installato sul device (quasi sempre presente, ma su device senza Chrome usa un fallback meno integrato); meno controllo su splash/permessi rispetto a un guscio nativo.
- **Costo/tempo:** **Basso** (1–2 gg) — *dopo* aver risolto manifest-da-URL e precaching SW.
- **Rischio:** **Basso-medio** (dipendenza da hosting + asset links).
- **Verdetto parziale:** miglior rapporto sforzo/risultato **se** accettiamo dipendenza da hosting e completiamo l'offline nel SW.

### 2.B — Capacitor

Wrapper nativo (Ionic) che impacchetta i **file web dentro l'APK/AAB** e li serve da `file://`/`localhost` interno tramite una WebView. Espone API native via plugin.

- **Come funziona da noi:** si copia l'HTML+asset nella cartella `www/`, Capacitor genera il progetto Android. **Tutto è locale** → offline garantito da subito. Plugin per storage nativo, share, ecc.
- **Pro:** **offline reale** out-of-the-box (asset bundle nell'app); **niente dipendenza da CDN o hosting**; accesso a API native (storage robusto via `@capacitor/preferences`, share screenshot, ecc.) → risolve elegantemente il problema **save/eviction**; aggiornamenti dei contenuti comunque possibili via store; ottimo per "file unico" perché copi un solo HTML.
- **Contro:** **AAB più grande** (include i runtime); usa la **WebView di sistema** (Android System WebView / Chrome), generalmente aggiornata ma su device vecchi può essere datata → **qui Three r128 + WebGL contano di più**; ogni update richiede **ripubblicazione** sullo store; introduce una toolchain Node/Gradle (contro la filosofia "no build", ma confinata al packaging, non al gioco).
- **Costo/tempo:** **Medio** (2–4 gg) per setup pulito + plugin storage.
- **Rischio:** **Basso** sul funzionamento; **medio** su performance WebView entry-level.
- **Verdetto parziale:** miglior scelta **se l'offline e la robustezza save sono prioritari** e non vogliamo dipendere da hosting/asset-links.

### 2.C — WebView custom (app nativa scritta a mano)

Un'Activity Android minimale con una `WebView` che carica l'HTML (da asset locali o URL), configurata a mano (`setJavaScriptEnabled`, `setDomStorageEnabled`, ecc.).

- **Pro:** controllo totale (splash, gestione back, permessi, intercept); nessuna dipendenza da framework di terzi.
- **Contro:** **reinventa Capacitor peggio**: bisogna gestire a mano abilitazione DOM storage, WebGL, file access, ciclo di vita, hardware back, console-to-logcat, crash handling; più codice nativo Kotlin/Java da mantenere; nessun ecosistema di plugin; stesso limite WebView-di-sistema di Capacitor. **Massima superficie di bug** per il minor valore aggiunto.
- **Costo/tempo:** **Alto** (1+ settimana) per arrivare allo stesso punto di Capacitor.
- **Rischio:** **Alto** (tanto codice nativo custom, edge case WebView).
- **Verdetto parziale:** **sconsigliato** salvo esigenze native molto specifiche che i plugin Capacitor non coprono — non è il nostro caso.

### 2.D — PWA-only (niente store, install dal browser)

Non si pubblica affatto su Play: l'utente "installa" dal banner Chrome (Add to Home Screen). La PWA attuale **già lo permette**.

- **Pro:** **zero costi/zero burocrazia** (niente account 25$, niente review, niente AAB); aggiornamento istantaneo; nessuna policy store.
- **Contro:** **niente presenza sullo Store** (scoperta, credibilità, recensioni, ranking quasi nulli); install via banner ha attrito alto e basso tasso; non soddisfa l'obiettivo del brief ("esiste sullo store"). *(La donazione esterna funzionerebbe comunque, ma senza visibilità Store.)*
- **Costo/tempo:** **Nullo**.
- **Rischio:** **Nullo** tecnico, ma **non raggiunge l'obiettivo**.
- **Verdetto parziale:** ottimo come **canale parallelo gratuito** (e va tenuto attivo), ma **non sostituisce** la pubblicazione su Play.

### 2.E — Raccomandazione

| Criterio | TWA/Bubblewrap | Capacitor | WebView custom | PWA-only |
|---|---|---|---|---|
| Offline reale | 🟡 (serve SW precache) | 🟢 nativo | 🟢 nativo | 🟡 |
| Dimensione AAB | 🟢 minima | 🟡 media | 🟡 media | — |
| Update senza ripubblicare | 🟢 | 🔴 | 🔴 | 🟢 |
| Robustezza save (storage nativo) | 🔴 (localStorage) | 🟢 (Preferences) | 🟡 | 🔴 |
| Rischio WebView vecchia (Three r128) | 🟢 (Chrome) | 🟡 | 🟡 | 🟢 |
| Sforzo setup | 🟢 basso | 🟡 medio | 🔴 alto | 🟢 nullo |
| Manutenzione nativa | 🟢 nulla | 🟡 bassa | 🔴 alta | 🟢 nulla |
| Sullo Store | 🟢 | 🟢 | 🟢 | 🔴 |

**Raccomandazione motivata:** **Capacitor come scelta primaria** per la v1 store, **TWA come alternativa forte** se in futuro vogliamo update-senza-ripubblicare.

Perché Capacitor batte TWA *per noi*, nonostante TWA sia più leggero:
1. **Offline reale senza lavoro extra** sul service worker — l'app deve girare in metro/aereo dal primo avvio.
2. **Risolve il problema save** (punto 6) con `@capacitor/preferences` (storage nativo non soggetto a eviction), che con TWA resterebbe `localStorage`.
3. **Niente dipendenza da hosting + Digital Asset Links** — un punto di fragilità in meno.
4. Il "costo" filosofico (una toolchain di build) **è confinato al packaging**: il gioco resta un singolo HTML; non violiamo "file unico" nel codice di gioco.

Il prezzo da pagare (update via store, WebView di sistema) è accettabile e gestibile. **TWA resta in tabella** come piano B documentato.

### 2.F — Requisiti Play Console (validi per qualunque opzione A–C)

- **Account Google Play Developer:** **25 $ una tantum** (non annuale), 1 sola volta per l'account. Identità verificata (dal 2023 Google richiede verifica D-U-N-S per account *organizzazione*; per account **personale** servono nome/indirizzo verificati e, per i nuovi account personali, **test chiuso con ≥12 tester per 14 giorni** prima della produzione — vincolo recente da pianificare).
- **Formato:** **AAB obbligatorio** (l'APK non è più accettato per i nuovi upload dal 2021). Bubblewrap/Capacitor producono entrambi AAB.
- **Firma:** **Play App Signing** raccomandato/predefinito — carichi un *upload key*, Google gestisce la *signing key* finale. **Conserva il keystore upload + password** in modo sicuro (se lo perdi, recupero possibile ma macchinoso). Va creato un **keystore** (`.jks`) una tantum.
- **Target API level:** Google impone di **targettizzare un'API level recente**. Regola corrente: i nuovi upload devono targettizzare un livello entro ~1 anno dall'ultima major Android (al 2025: **API 35 / Android 15** per nuove app e aggiornamenti). Va verificato in Console al momento del rilascio: è una **moving target** annuale.
- **Permessi:** dichiarati nel `AndroidManifest`. Per noi servono **pochissimi** (vedi §5): di base **`INTERNET`** (solo se teniamo la feature AI o gli ads); idealmente **nessun permesso sensibile**.

---

## 3. Produzionizzazione (il cuore del lavoro)

### 3.1 — Rimuovere Babel-in-browser (precompilare il JSX)

**Problema:** l'intero gioco è in `<script type="text/babel">` e viene transpilato al load. Costi: **~1–2 s di CPU** all'avvio (peggio su entry-level), **~3 MB di Babel** scaricati/parsati per essere usati una volta, fragilità (se Babel non carica, schermo bianco), e impossibilità di minificare/tree-shakare.

**Opzioni:**

| Opzione | Descrizione | Pro | Contro | Impatto |
|---|---|---|---|---|
| **B1. Pre-transpile offline → script normale** | Una build step *una tantum* (o in CI) gira Babel **sul file** e produce un `<script>` JS già transpilato; l'HTML servito non contiene più `type="text/babel"` né Babel-standalone. | Avvio molto più rapido; −3 MB; niente schermo bianco da Babel; **il sorgente di lavoro resta lo stesso HTML** (la build è un passo di packaging, non cambia il workflow di sviluppo). | Introduce uno **step di build per il packaging** (può girare in CI o in uno script locale). | **Alto beneficio, basso rischio.** Consigliata. |
| **B2. Mantenere Babel ma bundlarlo locale + cache** | Babel resta ma servito da asset locale, transpilazione cachata. | Minimo cambiamento al flusso. | Non elimina il costo CPU all'avvio (il più impattante su entry-level); resta il peso di Babel nell'app. | Mitiga ma non risolve. |
| **B3. Riscrivere senza JSX (React.createElement)** | Eliminare il JSX a mano. | Nessun transpiler. | **Inaccettabile** su ~20k righe; enorme rischio di regressioni. | Scartata. |

**Raccomandazione:** **B1**. Punto chiave per non tradire la filosofia "file unico": il **sorgente di lavoro rimane `CARRIER-MANAGER-AV.html`** con il JSX; la **build di packaging** produce un *artefatto derivato* (es. `elevora.build.html` o gli asset dentro Capacitor) con il JSX già compilato. Lo sviluppo quotidiano non cambia; cambia solo cosa finisce *dentro l'app*. È coerente col fatto che il **quality gate ha già Babel come devDependency** — l'infrastruttura di transpilazione esiste già nel repo.

### 3.2 — Bundle locale di React/Three/Babel/asset (offline)

**Problema:** tutte le librerie sono da CDN. In un'app installata è **inaccettabile**: il primo avvio richiederebbe rete e cadrebbe senza.

**Soluzione:** scaricare le versioni **esatte** (React 18.2.0, ReactDOM 18.2.0, Three 0.128.0 + GLTFLoader + SkeletonUtils, Phaser 3.80.1) come **file locali** dentro l'app, e referenziarle con path relativi invece che URL CDN. Le versioni esatte **sono già fissate** nelle `devDependencies` del gate → riusabili.

- Con **Capacitor** questo è naturale (tutto in `www/`).
- Con **TWA** va fatto via **service worker precache** (oggi `sw.js` è network-first e cacha solo l'HTML → andrebbe esteso a tutti i runtime).
- **Babel** non serve più nel bundle **se** si adotta B1 (precompilazione) → ulteriore −3 MB.

**Impatto:** medio (download + ricablaggio dei tag script, niente logica di gioco toccata). **Rischio:** basso. **Priorità:** alta (blocco offline).

### 3.3 — Avvio rapido & gestione crash

- **Avvio:** con B1+bundle locale l'avvio diventa essenzialmente "parse JS + primo render React" — niente fetch CDN, niente transpilazione. Su entry-level realisticamente **<1 s** vs ~2–4 s attuali.
- **Crash handling (da introdurre, valutazione):** oggi un errore in fase di transpilazione/boot lascia lo spinner (mascherato dopo 15 s). Per lo store conviene: un **error boundary React** + un handler `window.onerror`/`unhandledrejection` che mostri una schermata "qualcosa è andato storto / ricarica / esporta salvataggio" invece di un freeze. Protegge anche i **save** (vedi §6). **Priorità:** media (qualità percepita + recensioni).

---

## 4. Performance su Android entry-level

### 4.1 — Budget realistico

Device target di fascia bassa (es. 2–3 GB RAM, GPU mobile modesta, WebView/Chrome di sistema):

- **Avvio a interattivo:** obiettivo **< 2,5 s** (raggiungibile solo dopo B1 + bundle locale).
- **Frame rate match 3D:** obiettivo **≥ 30 fps stabili** durante un highlight; accettabile dip a 24–25 fps nei picchi (gol, folla animata). I 60 fps non sono realistici né necessari su entry-level.
- **Memoria:** evitare crescita monotona della JS heap tra più partite (no leak) — un crash OOM su device da 2 GB è il rischio peggiore.

### 4.2 — Cosa misurare (il repo ha già gli strumenti)

Il quality gate include un **perf-monitor** (`lib/perf-monitor.mjs`, load-time / JS-heap / frame-timing) — oggi **warn-only** e su rendering software headless (niente GPU). Per lo store serve invece **misura su device reale**:

- **Load time** (boot → primo render) prima/dopo B1+bundle.
- **FPS reale** durante il match su un device entry-level vero (Chrome DevTools remote, o overlay fps in-game dietro flag).
- **JS heap** dopo 5–10 partite consecutive (cerca leak; il debito noto D1/D2 segnala **allocazioni per-frame** nell'off-ball AI e nessuna misura leak completa).
- **Tempo di GC / jank** durante gli highlight (le alloc per-frame su 22 attori, O(N²), sono il sospetto principale di stutter mobile).

### 4.3 — Three.js r128: rischio e verdetto (solo valutazione)

- **Rischio:** r128 è del 2021. In sé **gira ancora bene** su WebGL 1/2 moderni; il rischio non è "r128 non funziona", ma:
  - su **WebView di sistema datata** (device vecchi, scenario Capacitor) certe estensioni WebGL o comportamenti potrebbero differire;
  - r128 è **lontana dall'API attuale** → un futuro upgrade sarà più doloroso quanto più si aspetta.
- **Verdetto:** **NON aggiornare Three ora.** Motivi: (a) il render-loop, le animazioni eroe e l'off-ball AI sono **fortemente accoppiati** a r128 e **gate-blind** (il gate non valida la resa visiva) → un upgrade rischia regressioni invisibili ai test; (b) con **TWA** si usa Chrome aggiornato → r128 non è un collo di bottiglia; (c) la priorità performance reale sono le **alloc per-frame**, non la versione di Three. **Upgrade = progetto a sé, post-lancio**, da fare con collaudo dal vivo, non come prerequisito store.

---

## 5. Conformità Store (obbligatoria)

### 5.1 — Privacy policy (OBBLIGATORIA)

Google richiede una **URL pubblica** di privacy policy per **ogni** app (anche senza raccolta dati, e **sempre** se c'è pubblicità). Va ospitata (es. GitHub Pages) e inserita in Console.

Deve dichiarare, per il nostro caso:
- I **salvataggi** restano **sul dispositivo** (localStorage/storage nativo); nessun account, nessun server proprietario.
- La **feature AI opzionale** invia il testo della richiesta a **Anthropic** (`api.anthropic.com`) **solo se** l'utente inserisce una propria API key → terza parte + finalità.
- **Nessuno SDK pubblicitario** e nessun tracking di terzi (scenario senza ads) → la policy è breve.
- Le **donazioni** avvengono **fuori dall'app** (link a Ko-fi/PayPal/Buy Me a Coffee nel browser): nessun dato di pagamento è gestito dall'app.

### 5.2 — Data Safety form (OBBLIGATORIO, in Console)

Form auto-dichiarativo su *quali dati raccogli/condividi*. Con lo scenario **senza ads**, la risposta tende a **"nessun dato raccolto/condiviso"** (i salvataggi restano sul dispositivo), con **un'unica eccezione**:
- la **feature AI** (se mantenuta) invia testo a terzi → dichiarare o, più pulito, **disabilitarla nella build store** (vedi §5.6) così il form diventa **"nessun dato"**.
- le **donazioni esterne** non sono dati gestiti dall'app → niente da dichiarare lato Data Safety.

### 5.3 — Content rating (IARC, OBBLIGATORIO)

Questionario in Console → genera i rating per regione (PEGI/ESRB/…). Per un gestionale calcistico senza violenza/sesso/gambling reale il rating sarà **basso (PEGI 3 / Everyone)**. Senza ads, alla domanda "l'app contiene pubblicità?" si risponde **no** (rating ancora più pulito). ⚠️ Attenzione: evitare **loot box** o **simulazioni di scommesse**, che alzerebbero il rating.

### 5.4 — Permessi

Minimizzare è un vantaggio competitivo (meno attriti, meno scrutinio):
- **`INTERNET`**: necessario **solo** per la feature AI (e per aprire il link di donazione, ma quello usa il browser di sistema). Se disattiviamo la feature AI nella build store, l'app può essere **totalmente offline senza permessi sensibili**.
- **Nessun** permesso di posizione/contatti/storage esterno/camera è necessario.
- **Niente `AD_ID`**: senza SDK ads non usiamo l'Advertising ID → un blocco di adempimenti in meno.

### 5.5 — GDPR / consenso

**Senza ads e senza tracking, l'onere GDPR è minimo:**
- **niente Consent Management Platform / banner di consenso** (servirebbe solo con SDK pubblicitari) → un intero apparato eliminato.
- Resta solo da menzionare nella privacy policy la **feature AI** (se attiva) e che i **salvataggi restano sul dispositivo**.
- **Designed for Families:** un gestionale PEGI 3 può attrarre minori; senza ads l'ingresso nel programma è più semplice (nessuna rete pubblicitaria da certificare) → opzione da valutare per ampliare il pubblico.

### 5.6 — La feature AI: decisione consigliata

`callClaudeAPI` con `anthropic-dangerous-direct-browser-access` e API key in chiaro in localStorage è **ottima in dev** ma **un peso in produzione store** (complica privacy/Data Safety, espone una key, header "dangerous"). **Raccomandazione:** **disattivarla/compilarla fuori nella build store** (o gating dietro un flag spento di default), così il Data Safety form si semplifica e non si veicola una API key di terzi in un'app pubblica. **Non è una perdita di gameplay** (esiste già il mock mode e la logica locale `generateLocalPressAnalysis`/tattiche simulate).

---

## 6. IP / Legale — audit di chiusura del de-branding

**Stato:** buono ma **non chiuso**. I nomi sono fittizi e c'è `_auditCopyrightSafety` (blocklist di brand/giocatori reali). **Rischi residui** rilevati:

1. **Soprannomi troppo riconoscibili:** "AC **Rossoneri**", "FC **Nerazzurri**", "FC **Partenope**", "FC **Biancoceleste**", "FC **Granata**", "FC **Blucerchiati**" ecc. sono **soprannomi reali notori** di club specifici → pur non essendo marchi denominativi, l'associazione è inequivoca. **Rischio medio** su uno store commerciale.
2. **Colori sociali reali:** le entry usano i **colori esatti** delle squadre reali (rosso/nero per i "Rossoneri", ecc.) → rafforzano l'identificazione. Combinati col soprannome, avvicinano alla "passing off".
3. **Competizioni:** nomi tipo "UCL"/coppe europee vicini ai reali (citato nel brief) — da verificare e neutralizzare ("Coppa dei Campioni Continentale", "Supercoppa Europea", nomi generici).
4. **Stadi/record/nazionali:** la blocklist `_CR_BRANDS` copre stadi (Anfield, Bernabéu…) e va estesa a eventuali record/nazionali con riferimenti reali.
5. **Bandiere/emoji nazionali:** uso di flag emoji per nazioni è generalmente OK (non sono marchi).

**Strategia "safe" raccomandata:**
- **Sostituire i soprannomi-club** con denominazioni **inventate e non mappabili 1:1** (es. niente "Rossoneri"; piuttosto toponimi/fantasia: "Milano City", "Meneghini United" → ancora meglio nomi totalmente inventati).
- **Desaturare l'accoppiata colore+soprannome**: se si tiene il colore, cambiare il soprannome (e viceversa), così nessuna coppia identifica univocamente un club reale.
- **Promuovere `_auditCopyrightSafety` da dev-only a gate CI**: farlo **fallire la build** se trova un match (oggi è solo un `console.warn` dietro `cpm-debug`). Estendere la blocklist con **soprannomi** e **competizioni**, non solo nomi ufficiali.
- **Disclaimer** nella descrizione store e in-app: "Tutti i nomi di club, leghe e giocatori sono di fantasia; ogni riferimento a persone o organizzazioni reali è puramente casuale."
- **Icona/feature graphic:** assicurarsi di non riprodurre loghi/maglie reali (l'icona attuale è un pallone astratto generato a canvas → **OK**).

**Costo/tempo:** **Medio** (1–2 gg per rinominare ~150 club + competizioni + estendere lo scanner). **Rischio se ignorato:** **takedown / sospensione** su segnalazione di un titolare di marchio. **Priorità:** **alta** (è un blocco legale, non estetico).

---

## 7. Save / Robustezza

**Stato:** wrapper `storage` async (window.storage / localStorage), 3 slot, `migratePlayer` robusto (field-presence, ~79 backfill), integrity-check. Buona base. **Rischi in WebView:**

1. **Eviction di `localStorage`:** in WebView/PWA il sistema può **cancellare** lo storage sotto pressione di memoria/spazio → **perdita del salvataggio**. È il rischio #1 per le recensioni negative.
2. **Nessun backup/export utente** evidente: se il save si perde, niente recupero.

**Raccomandazioni:**
- **Storage nativo** (forte argomento pro-Capacitor): `@capacitor/preferences` o filesystem nativo **non è soggetto a eviction** come localStorage. Il wrapper `storage` astrae già la sorgente → si può iniettare un backend nativo **senza toccare la logica di gioco** (basta fornire `window.storage`).
- **Export/Import salvataggio** (anche solo copia-incolla di un JSON, infrastruttura "career card" già presente con `navigator.clipboard`): dà all'utente un backup manuale. Basso costo.
- **Compat versioni:** `migratePlayer` già gestisce l'avanzamento di `SAVE_VERSION`. Per lo store, **mai rimuovere campi** e mantenere la migration accretiva (già la prassi). Aggiungere un **test di apertura di un save vecchio** nel CI (esiste già `save-compat` 12/12) come gate pre-release.

**Priorità:** alta (storage nativo) + media (export).

---

## 8. Monetizzazione — scenario scelto: "gratuito, no ads, donazioni"

L'app è **gratuita e senza pubblicità**; il guadagno arriva da **donazioni volontarie**. È il modello più pulito per privacy/UX, ma anche **quello a resa più bassa** — va detto con onestà.

### 8.1 — La regola Google che decide tutto: ricompensa sì / ricompensa no

> **Punto critico.** Google Play distingue nettamente:
> - **Donazione PURA (nessuna ricompensa in-app):** è ammesso **raccoglierla fuori dall'app** con un **link esterno** (Ko-fi, PayPal, Buy Me a Coffee, Stripe). **Non** serve Google Play Billing.
> - **"Donazione" che dà QUALCOSA in cambio** (sblocco contenuti, badge, modalità, rimozione di qualcosa): per Google è un **acquisto di bene digitale** → **obbligatorio Google Play Billing** + commissione 15/30%.

Quindi la forma di "donazione" cambia completamente gli adempimenti.

### 8.2 — Le due vie

| Via | Come | Resa | Adempimenti | Note |
|---|---|---|---|---|
| **A — Donazione esterna pura** (consigliata per iniziare) | Bottone "Sostieni lo sviluppo" che **apre il browser** su Ko-fi/PayPal/BMC. Nessuna ricompensa in-app. | Bassa, ma **0% commissione Google** (tieni quasi tutto, meno la fee del provider ~3%) | **Minimi:** nessun SDK, nessun Billing, Data Safety "nessun dato". Serve solo `INTERNET` per aprire il link. | Più semplice e veloce da pubblicare. Rischio policy basso **se** non dai nulla in cambio. |
| **B — "Supporter pack" via Play Billing** | IAP una tantum (es. 2,99 €) che dà un **ringraziamento simbolico** (badge "Supporter", tema cosmetico) | Bassa-media (converte meglio di una donazione pura, perché l'utente "riceve") | **Medi:** integrare **Google Play Billing** (first-party, niente SDK ads/tracking → Data Safety resta leggero) + commissione 15% (sotto 1M$/anno) | Tecnicamente è un IAP "travestito" da supporto. Più resa, un po' più di lavoro. |

### 8.3 — Raccomandazione

**Fase 1 (lancio): Via A — donazione esterna pura.** Motivi: zero SDK, zero Billing, Data Safety "nessun dato", primo invio rapidissimo, e nessun rischio di violare la regola sulle ricompense (perché non si dà nulla in cambio). È coerente con un primo rilascio "minimo per esistere sullo store".

**Più avanti (opzionale): Via B — "Supporter pack" via Play Billing**, se i numeri giustificano il lavoro di integrazione Billing. Convive con la donazione esterna.

⚠️ **Aspettativa realistica:** le donazioni rendono **molto poco** (tipicamente una frazione di percento degli utenti dona). Vanno viste come "caffè offerto da chi ama il gioco", non come reddito. Se in futuro servisse monetizzare sul serio, le leve più efficaci restano un **IAP "unlock premium"** o gli **ads** — entrambi tenuti fuori dalla v1 per scelta.

### 8.4 — Implementazione (puramente indicativa, non in questa fase)

- Un **bottone discreto** nel menu/impostazioni o nella schermata fine-carriera ("☕ Sostieni Elevora").
- Apre un **URL esterno** (in Capacitor: `@capacitor/browser` o intent di sistema) → **nessuna logica di pagamento nell'app**.
- **Nessun reward** collegato (per restare nella donazione pura).
- Testo onesto e non insistente (un solo punto d'ingresso, niente pop-up ripetuti).

---

## 9. Asset di listing (da preparare)

| Asset | Requisito Play | Stato | Nota |
|---|---|---|---|
| **Icona app** | 512×512 PNG, 32-bit | 🟡 | C'è già il generatore canvas (pallone astratto) → **esportarlo a 512** e verificare la safe-zone maskable. **IP-safe.** |
| **Feature graphic** | 1024×500 PNG/JPG | 🔴 | Banner di testata store. Da creare (brand "Elevora"). |
| **Screenshot telefono** | min **2**, max 8 (16:9 o 9:16) | 🔴 | Catturare: dashboard carriera, match 3D (highlight), classifica, profilo giocatore. **Senza loghi reali.** |
| **(Opz.) Screenshot tablet** | consigliati | 🔴 | Migliora il ranking su tablet. |
| **(Opz.) Video promo** | URL YouTube | ⚪ | Nice-to-have. |
| **Titolo** | ≤30 caratteri | 🟡 | "Elevora: Football Career" (verificare lunghezza). |
| **Short description** | ≤80 caratteri | 🔴 | Da scrivere. |
| **Full description** | ≤4000 caratteri | 🔴 | Da scrivere + **disclaimer nomi di fantasia**. |
| **Privacy policy URL** | obbligatorio | 🔴 | Da ospitare (vedi §5.1). |

**Costo/tempo:** **Basso-medio** (1–2 gg, soprattutto grafica/testi). **Priorità:** media (necessari per inviare, non bloccanti tecnici).

---

## 10. ROADMAP a fasi

Legenda costo/tempo: **S** ≤½ gg · **M** 1–2 gg · **L** sprint. Priorità: **P0** bloccante · **P1** importante · **P2** rifinitura.

### FASE 1 — "Esiste sullo Store" (blocchi minimi per pubblicare una v1 dignitosa)

| # | Voce | Costo | Rischio | Prio |
|---|---|---|---|---|
| **1.0** | **🔴 REFACTOR QUALITÀ LIVE MATCH 3D — animazioni + regia/camera** (parte per primo; vedi §10.bis) | **L+** (multi-sprint, a tempo aperto) | **Alto** (perceptual/gate-blind) | **P0 #1** |
| 1.1 | **Precompilare il JSX** (B1): build di packaging che elimina Babel-in-browser; sorgente HTML invariato | M | Basso | **P0** |
| 1.2 | **Bundle locale** di React/ReactDOM/Three(+loaders)/Phaser; rimozione dipendenze CDN nell'artefatto app | M | Basso | **P0** |
| 1.3 | **Packaging Capacitor** → AAB (progetto, splash, `INTERNET` se serve) | M | Basso-medio | **P0** |
| 1.4 | **Storage nativo** via wrapper `storage` (anti-eviction) + **export/import** save | M | Basso | **P0** |
| 1.5 | **Chiusura de-branding**: rinomina soprannomi-club + competizioni; `_auditCopyrightSafety` → **gate CI bloccante**; disclaimer | M | Medio | **P0** |
| 1.6 | **Disattivare la feature AI nella build store** (flag off) → Data Safety "nessun dato" | S | Basso | **P0** |
| 1.6b | **Bottone donazione esterna** (link a Ko-fi/PayPal/BMC, **nessun reward in-app**) | S | Basso | **P1** |
| 1.7 | **Privacy policy** ospitata + **Data Safety** + **content rating IARC** | S | Basso | **P0** |
| 1.8 | **Account Play (25$)** + keystore upload + Play App Signing + **target API level** corrente | S | Basso | **P0** |
| 1.9 | **Asset listing minimi**: icona 512, feature graphic, ≥2 screenshot, titolo/descrizioni + disclaimer | M | Basso | **P1** |
| 1.10 | **Error boundary + crash screen** (protegge save e recensioni) | S | Basso | **P1** |
| 1.11 | **Test su device entry-level reale** (avvio, fps match, heap su 5–10 partite) | M | Medio | **P1** |

> **Monetizzazione v1 = donazione esterna pura** (1.6b): nessun ads, nessun Play Billing, Data Safety "nessun dato" → primo invio il più leggero possibile.
> **Nota sul vincolo "nuovo account personale":** se l'account Play è nuovo e personale, pianificare il **test chiuso con ≥12 tester / 14 giorni** prima della produzione (incide sui tempi, non sul lavoro tecnico).

#### §10.bis — Dettaglio del blocco 1.0 (refactor qualità live match 3D)

**Decisione PO:** il live match 3D così com'è **non è accettabile per il rilascio**. Ambito del refactor: **(a) qualità delle animazioni** e **(b) regia/camera**. *Fuori ambito per ora:* lo split architetturale del monolite (manutenibilità) e l'upgrade di Three — restano sul binario interno/post-lancio, salvo emergano come prerequisiti tecnici durante il lavoro.

**Stato di partenza (loro metriche):** AI Vision `animationQuality ~40-55` ("rigide/basilari"), `cameraQuality ~50-65`. `ThreeMatchView` è un render-loop monolitico (~1.960 righe) che ospita `animOne`, le animazioni eroe variant-aware e l'off-ball AI.

**Perché è "L+ a tempo aperto" e non un task chiuso:**
- È **perceptual e gate-blind**: il quality gate cattura frame congelati (stato/coerenza/golden) e **non valida né il movimento né la resa**. Quindi non c'è un "12/12 verde" che certifichi "ora è bello".
- La validazione passa da **AI Vision (2° livello, non bloccante)** + **collaudo dal vivo del Product Owner**. Il criterio di "accettabile" lo fissa il PO.
- Le micro-modifiche al render non sono certificabili come miglioramento in autonomia (provato empiricamente nei loro doc) → serve un **loop iterativo** implementa→guarda→aggiusta.

**Metodo proposto (coerente col charter LMQP e Studio Framework):**
1. **Definire il target di "accettabile"** con il PO: riferimenti video, lista di difetti percepiti (es. transizioni a scatto, T-pose residue, camera che perde palla/eroe), soglia AI Vision minima desiderata. *Senza questo, il blocco non ha condizione di uscita.*
2. **Animazioni:** lavorare a step ≤300 righe (locomozione/blending, wind-up, transizioni, posa) con **golden di stato invariato** come rete anti-regressione + collaudo dal vivo per la resa.
3. **Regia/camera:** framing/tracking/zoom per-pattern, leggibilità azione (hero+palla in campo), validati con AI Vision `cameraQuality` + occhio.
4. **Gate 12/12 + 3 baseline** verdi ad ogni step (lo stato non deve regredire anche se la resa cambia).
5. **Checkpoint di accettazione del PO** a fine di ogni sotto-blocco: è il PO a dichiarare "accettabile".

**Rischio/dipendenze:**
- **Rischio schedule #1 di tutto il piano** (durata guidata dalla qualità percepita, non da una checklist chiudibile).
- **Indipendente dal packaging:** tecnicamente 1.1–1.11 non dipendono da 1.0. Per scelta PO 1.0 ha priorità e parte per primo; se in futuro si volesse comprimere i tempi, il packaging potrebbe avanzare in parallelo senza conflitti.
- **Se durante il lavoro emerge che le animazioni/camera non sono migliorabili senza toccare la struttura del render-loop**, lo split architetturale (Master Plan Fase 3) rientrerebbe come prerequisito → da rivalutare con il PO a quel punto.

### FASE 2 — Monetizzazione & rifinitura

| # | Voce | Costo | Rischio | Prio |
|---|---|---|---|---|
| 2.1 | **(Opzionale) "Supporter pack" via Play Billing** (IAP simbolico) se le donazioni esterne non bastano | M | Basso | P2 |
| 2.2 | **Ottimizzazione performance**: ridurre alloc per-frame off-ball, caccia leak (debito D1/D2) | L | Medio | P1 |
| 2.3 | **TWA in parallelo** (se si vuole update-senza-ripubblicare) + SW precache completo | M | Basso | P2 |
| 2.4 | **Screenshot tablet + video promo + ASO** (titolo/keyword) | M | Basso | P2 |

### FASE 3 — Post-lancio (progetti a sé)

| # | Voce | Costo | Rischio | Prio |
|---|---|---|---|---|
| 3.1 | **Upgrade Three.js** (con collaudo dal vivo, render gate-blind) | L | Alto | P2 |
| 3.2 | **Riattivazione feature AI** server-side proxata (senza key utente in chiaro) se ha valore | L | Medio | P2 |
| 3.3 | **Designed for Families** (se si punta al pubblico minori — più semplice senza ads) | M | Medio | P2 |
| 3.4 | **(Se serve reddito reale) IAP "unlock premium" o ads** — leva tenuta fuori dalla v1 per scelta | M | Medio | P2 |

---

## 11. Rischi trasversali & raccomandazione finale

- **Refactor 3D = rischio di schedule #1 (P0 #1):** è l'unico blocco a **tempo aperto**, perché la sua condizione di uscita è la qualità percepita (decisa dal PO), non una checklist chiudibile. Va inquadrato con un **target esplicito di "accettabile"** all'inizio, altrimenti rischia di non chiudersi mai.
- **Render gate-blind:** il quality gate **non valida la resa visiva** → ogni intervento su animazioni/camera/packaging/performance/Three va **collaudato dal vivo su device reale**, non solo col gate.
- **IP è l'unico rischio "legale" vero:** il de-branding va **chiuso e reso bloccante in CI** prima di pubblicare — è l'unico che può causare una **rimozione** dell'app.
- **Offline + save** sono i due rischi di **recensione negativa** più probabili → la scelta Capacitor li indirizza entrambi.
- **Donazioni = resa bassa ma adempimenti minimi:** la scelta no-ads/donazioni elimina SDK, consenso GDPR e `AD_ID`, e porta il Data Safety a "nessun dato" → primo invio leggerissimo. Il prezzo è un guadagno modesto, accettato consapevolmente.
- **Regola d'oro donazioni:** **niente ricompensa in-app** in cambio della donazione, altrimenti Google obbliga a Play Billing. Donazione = link esterno puro.

**In una riga:** la v1 store è raggiungibile con **Fase 1** (precompila JSX → bundle locale → Capacitor → storage nativo → chiusura de-branding → conformità → bottone donazione esterna), senza ads e senza riscrivere il gioco; il vincolo "file unico" resta intatto perché la build è solo un passo di *packaging*.
