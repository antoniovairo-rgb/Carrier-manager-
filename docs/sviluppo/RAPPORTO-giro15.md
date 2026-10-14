# Rapporto giro 15 — PO-237 (prima partita scattosa) · PO-238 (Crediti nella home)

Ramo `sviluppo/fluidita-crediti-237`, creato da `poc/marioprada-character-system` 7e67cc1 (7.999.165).
`GAME_VERSION` **non** cambiata (istruzione del giro). Zona G (carriera, economia, stagioni) non toccata.
Motore del possesso (src/14) e LiveMatch (src/15) non toccati.

## 1. PO-237 — «La partita, in particolare la prima è un pò scattosa»

### Come ho misurato

Sonda e guardiano nuovi: `tests/visual/prima-partita-237.mjs` (`npm run prima-partita-237`).

- **Una sola pagina**, GLB acceso nel modo di default (CGTrader, `cgtrader-highlight-optimized`, src/12-three-match-view.jsx:218-219).
- La pagina resta **in home per 15 s** (`CPM_ATTESA`) prima del flusso del provino. Serve a emulare un giocatore, che non entra in partita due secondi dopo l'avvio.
- Poi si gioca il **provino 1** (prima partita dopo l'avvio). Lo si lascia finire a velocità 2x e si gioca il **provino 2** (seconda partita, stessa pagina).
- Per ogni partita si misurano **25 s** a partire dalla creazione del renderer della partita.
- Strumenti in pagina:
  - tempi di fotogramma via `requestAnimationFrame`;
  - `PerformanceObserver('longtask')`;
  - attribuzione del tempo sincrono a: parsing GLB (`GLTFLoader.parse` fino alla callback), `SkeletonUtils.clone`, compilazione shader (`compileShader`/`linkProgram`/`getProgramParameter`/`getShaderParameter`), texture (`texImage2D`/`texSubImage2D`/`generateMipmap`), buffer;
  - elenco dei `.glb`/`.png` richiesti nella finestra (Resource Timing).
- Headless gira in software (swiftshader). I valori assoluti non sono quelli del telefono: si confrontano **prima e seconda partita sullo stesso banco**.

⚠️ **Errore di strumento trovato e corretto durante la misura.** All'inizio la finestra partiva dal cambio di fase (`__CPM_PHASE`). Nella seconda partita la scena 3D si costruisce e carica 98 texture **prima** che la fase cambi: l'effetto del componente 3D, che è figlio, gira prima di quello di LiveMatch. Con quella finestra la seconda partita sembrava leggerissima (1 texture grande contro 91) e il confronto era falso.

Ora la finestra parte dalla creazione del renderer della partita. È l'unico renderer con `powerPreference:'high-performance'` (src/12-three-match-view.jsx:395). Le prime conclusioni («le texture costano solo nella prima») sono state **ritirate**.

### Cosa costa davvero di più nella prima partita

Misura con le finestre corrette, prima della correzione (braccio rosso `__CPM_NO_PRE237`, stesso codice):

| | prima partita | seconda partita |
|---|---|---|
| file `.glb` richiesti nella finestra | **22 a 0,5 s dal via** (korward-regular-player + slim/stocky + 19 `regular-anim-*`), poi i corpi CGTrader e le teste | nessuno |
| parsing GLB in partita | **1.549 ms** | 0 ms |
| blocchi lunghi (longtask) | **13** | 10 |
| compilazione shader | 8.494 ms | 8.944 ms |
| caricamento texture | 1.770 ms | 1.714 ms |
| fotogrammi > 250 ms | 16 | 11 |

Prima misura con la finestra di 20 s, senza attesa in home: un blocco da 3,3 s a 12,9 s dal via, **a partita avviata**, coincide con l'arrivo dei corpi CGTrader e delle teste (1.587 ms di texture in quel blocco).

Cosa **non** è un costo della prima partita: shader e caricamento texture in GPU.

- Si pagano a **ogni** partita.
- Il renderer si crea al montaggio e a fine partita si distrugge con `forceContextLoss()` (src/12-three-match-view.jsx:11132). Ogni partita ha quindi un contesto WebGL nuovo.
- Nei giri misurati la seconda partita li paga quanto la prima o di più (shader 7.052–9.173 ms; texture 1.596–2.812 ms).
- Babel non c'entra: traduce il codice al caricamento della pagina, non durante la partita.

### Correzione (solo ciò che è misurato)

**Pre-caricamento all'avvio.** Codice in src/11-ui-kit-highlight.jsx:1459-1486, commento con le misure in testa.

- Parte 2,5 s dopo l'avvio e carica **un file per momento d'ozio** (`requestIdleCallback`).
- Usa le **stesse URL** della partita, così la partita le trova in `_glbCache` (src/11-ui-kit-highlight.jsx:1438).
- In ogni modo GLB: corpo «regular» + slim/stocky + 19 clip. È la stessa lista che la partita carica in src/12-three-match-view.jsx:976 e :1036.
- Nel modo CGTrader di default si aggiungono:
  - lod0/1/2 kit-adapter e i tre file di clip, cioè la lista di src/12-three-match-view.jsx:1642-1645;
  - le 4 teste PNG, decodificate in anticipo con `img.decode()` in `window.__CPM_TESTE237`.
- La partita usa la testa già decodificata se c'è (src/12-three-match-view.jsx:1373), invece di riscaricarla. La testa risulta subito pronta (`_ok232`), quindi l'attesa PO-232 non aspetta la rete.
- Testimone `window.__CPM_PRE237` = `{fatti, tot, fine}`.

**Interruttore rosso:** `window.__CPM_NO_PRE237`, che spegne pre-caricamento e riuso delle teste.

**Provato e ritirato.** Ho provato a «riscaldare» le texture caricandole una volta in un contesto WebGL usa-e-getta. Nessun effetto misurabile: texture in partita 1.870 ms senza contro 1.953 ms con (22 texture scaldate). L'ho tolto: nessun rimedio senza effetto.

### Prima / dopo (stessa sonda, finestra 25 s, 15 s in home)

| | rosso (`__CPM_NO_PRE237`) 1ª / 2ª | **verde** 1ª / 2ª |
|---|---|---|
| file `.glb` richiesti in partita | 22+ / 0 | **0 / 0** |
| parsing GLB in partita | 1.549 / 0 ms | **0 / 0 ms** |
| blocchi lunghi | 13 / 10 | **6 / 5** |
| p95 tempo di fotogramma | 1.266 / 733 ms | 1.783 / 600 ms |
| pre-caricamento all'ingresso | — | 28/28 file in 2,1 s, 4 teste decodificate |

**Esito del guardiano:**

- Verde: «la prima partita non paga più parsing GLB e texture che la seconda non paga».
- Rosso: parsing 1.549 ms contro il tetto di 200 ms → `exit 1`.
- Giudizio della sonda: parsing GLB nella prima partita ≤ 200 ms, texture della prima ≤ 1,6 × seconda + 300 ms.
- Blocco più lungo, somma dei longtask e shader sono stampati come informazione.

### Cosa resta aperto

Lo dichiaro invece di nasconderlo.

1. **Il blocco più grande resta.** È la compilazione degli shader al primo disegno: 4–11 s in headless, molto variabile fra giri, presente in **entrambe** le partite.
   - Non l'ho toccato. Dipende dalla scena esatta (luci, ombre, nebbia, scheletri) e non l'ho saputo replicare fuori dalla partita.
   - Sul telefono Chrome ha una cache dei programmi GPU: quanto costi lì, alla prima e alle successive, **non posso confermarlo** senza una misura sul dispositivo.
2. **Il p95 della prima partita non scende nel verde** (1.783 contro 1.266 ms del rosso). Su pochi fotogrammi headless il p95 è dominato dal blocco shader, che varia da giro a giro. Non lo presento come miglioramento.
3. Il pre-caricamento 6.95.0 già esistente (src/11-ui-kit-highlight.jsx:1450-1458) scarica ancora `footballer.glb` e 11 `anim-*.glb`. Il corpo e le clip della partita sono ora quelli della lista «regular».
   - Non l'ho tolto: è fuori ambito.
   - Va verificato chi usa ancora quei file, ad esempio il CH38 di ripiego.
4. Il pre-caricamento costa tempo di main thread **nella home**, per ~2 s divisi per file nei momenti d'ozio. Va collaudato sul telefono che la home non ne risenta.
5. Verdetto vero: **collaudo PO sul dispositivo** (prima partita dopo l'avvio).

## 2. PO-238 — Crediti nella home

Codice in src/17-menu-creazione-pannelli.jsx:

- `CREDITI238`, cioè dati e fonti, a :120;
- `Crediti238`, il Modal standard del kit (src/11-ui-kit-highlight.jsx:276), a :145;
- la voce «Crediti» in fondo alla `HomeScreen` a :294.

La HomeScreen è la home del gioco, fuori dalla carriera. La voce si apre con un click e si chiude con «Chiudi», con la × o toccando fuori.

Ogni voce ha la sua fonte nel repo. Nessun autore, licenza o URL è scritto a memoria. Il censimento delle fonti l'ha fatto un agente; ho poi riletto di persona le fonti principali:

- src/00-head.html:57-85;
- l'intestazione di assets/dicebear-avatars.min.js;
- tests/character-lab/CLIP_REGISTRY.md:9-10;
- docs/archivio/EXTRA-FIELD-MODELS.md:1-22;
- assets/audio/README.md;
- assets/audio/sfx/crowd/README.md;
- src/09-audio-scout-anagrafiche.jsx:59-64.

| Sezione | Voci (licenza come scritta nella fonte) |
|---|---|
| Modelli 3D e animazioni | CGTrader «Realistic Soccer Player v2 rigged» (Royalty Free License, *da completare*) · Mixamo (royalty free per videogiochi, FAQ Adobe) · Microsoft Rocketbox (MIT) · corpo «Regular Male» (*da completare*) |
| Librerie software | React/ReactDOM 18.2.0 (MIT) · Three.js r128 + GLTFLoader/SkeletonUtils (MIT, autore «mrdoob») · Babel standalone 7.23.6 (MIT, The Babel Team) · DiceBear (MIT, © 2024 Florian Körner) |
| Illustrazioni e immagini | Avataaars — Pablo Stanley («Free for personal and commercial use») · Avatar Illustration System — Micah Lanier (**CC BY 4.0, richiede attribuzione**) · ritratti delle figurine (*da completare*) · icone/grafiche store (generate da tools/) |
| Caratteri | Great Vibes (*da completare*) · Barlow e Barlow Condensed (*da completare*) |
| Suoni | effetti sintetizzati (Web Audio) · Mixkit «stadium joy shouting crowd» 3022 (*da completare*) · Freesound «football crowd 3» 69245 (*da completare*) |

Note sulle licenze delle librerie:

- Le licenze MIT di React, ReactDOM e Babel sono lette dai `package.json` dei pacchetti installati in tests/visual/node_modules.
- Le versioni installate lì sono React/ReactDOM 18.3.1 e Babel 7.29.10, non 18.2.0 e 7.23.6 caricate dal gioco.
- Three.js è installato nella versione esatta 0.128.0.

**Guardiano:** `tests/visual/crediti-238.mjs` (`npm run crediti-238`). Gira a 360 e 412 px e controlla:

- la voce in home;
- l'apertura;
- che sia il Modal standard (testa, titolo «Crediti», piede);
- le 5 sezioni con almeno una voce;
- le voci «fonte da completare» dichiarate;
- l'assenza di scorrimento orizzontale;
- che «Chiudi» chiuda.

Esiti:

- **Verde:** 5 sezioni (4·4·4·2·3 voci), 8 voci da completare, scorrimento orizzontale 0/0 px a entrambe le larghezze.
- **Rosso** (`__CPM_NO_CREDITI238`): «voce Crediti assente nella home» a 360 e a 412 → `exit 1`.

**Foto:**

- docs/sviluppo/foto/giro15-crediti-360.png
- docs/sviluppo/foto/giro15-crediti-360-fondo.png
- docs/sviluppo/foto/giro15-crediti-412.png
- docs/sviluppo/foto/giro15-crediti-412-fondo.png

**Audit copyright:** `node tools/audit-copyright.mjs` → ✅ OK, nessun riferimento al mondo reale.

### Voci da completare, per il PO

1. **CGTrader «Realistic Soccer Player v2 rigged»**: autore/venditore, pagina del prodotto, conferma che il listino sia «Royalty Free» e non «Editorial». Il registro dice «non posso confermarlo» (tests/character-lab/CLIP_REGISTRY.md:9).
2. **Corpo «Regular Male»** (assets/korward-regular-player*.glb, assets/korward-regular-anims/): origine, autore e licenza. Nessun documento del repo le indica (docs/ANIMATION_AUDIT_2026-09-19.md:23 lo descrive soltanto).
3. **Ritratti delle figurine** (assets/portraits/ai, cast-*.jpg): generatore, autore e termini d'uso. docs/FIGURINE-VOLTI.md chiede di verificare la «provenienza e licenza» prima del merge.
4. **Great Vibes**: autore e licenza. Il font è incorporato in src/00-head.html:70-71 senza nota di licenza.
5. **Barlow / Barlow Condensed**: autore e licenza (src/00-head.html:73-85).
6. **Mixkit «stadium joy shouting crowd» (3022)**: autore e licenza. assets/audio/sfx/crowd/README.md dice «royalty-free / CC — verificare».
7. **Freesound «football crowd 3» (69245)**: autore, licenza e indirizzo.
8. **DiceBear**: versione del pacchetto incorporato (assets/dicebear-avatars.min.js non la dichiara).

Altre cose osservate, non messe nei Crediti perché non verificate come usate dal gioco:

- I GLB «hyper-casual-korward-*» («Hyper Casual Cartoon Soccer Player», docs/POC-HYPER-CASUAL-CHARACTER-SYSTEM.md:9) servono solo ai modi di revisione.
- `hero-highlight-portrait-v1.*` e `cgtrader-ajax-shirt-review.png` non sono nominati nel sorgente.
- Capacitor (solo build Android) ha licenze non verificabili: mancano i node_modules della radice.

## 3. Catena `node ci-runner.mjs mirata`

Comando: `cd tests/visual && node ci-runner.mjs mirata`, eseguito sul commit 1873cf4, cioè il build esatto del codice di questo giro.

- Passi: 37. Il confronto è con `main` remoto, quindi entrano anche i frammenti 07 e 18, che il ramo di partenza ha già diversi da `main`.
- Esito: **36/37 verdi**. Il registro è in docs/governo/STABILITA.json.
- Verdi, fra gli altri:
  - `validate-situations` (743 s);
  - `partita-vera`;
  - `career-critical`;
  - `griglia-mobile`, `finestra-230`, `popup-224` (i guardiani della home e delle finestre);
  - `esiti-218`, `cross-218`, `scene-221`, `gk-dive-sync`, `goal-postarc`.

**Rosso: `gk-miss-229`.** Difetto riportato: «alvolo gi6 post: gk_block dalla parte opposta al pallone». Non l'ho riparato: è fuori ambito. Ecco cosa ho misurato prima di attribuirlo.

| build | corse complete | sola scena gi6 «post» (`CPM_SCENE=6:1:alvolo CPM_KINDS=post`) |
|---|---|---|
| base 7e67cc1 (genitore del ramo) | 2 verdi su 2 | 3 verdi su 3 |
| ramo (1873cf4) | 1 rosso nella catena, poi 1 rosso e 1 verde isolati | 3 verdi su 3 |

Cosa dicono le misure:

- Il guardiano gira **col GLB spento** (`window.__CPM_GLB=false`, tests/visual/gk-miss-229.mjs:52). In quel caso:
  - il pre-caricamento non parte (src/11-ui-kit-highlight.jsx:1468);
  - la testa pre-decodificata non si usa, perché vale solo nel ramo CGTrader di src/12-three-match-view.jsx:1373.
- Il codice percorso è quindi lo stesso della base. L'unica differenza è la voce «Crediti» nella home.
- La traiettoria del tiro gi6 «post» cambia a ogni corsa **su entrambi i build**: sul piano del portiere z va da −1,37 a +2,07. Il bersaglio dell'arco usa `Math.random` non seminato (nota 7.514 in CLAUDE.md).
- Il rosso si presenta quando il tiro passa a z negativa vicino al portiere.

Conclusione: il guardiano è **instabile**. Sul ramo l'ho visto rosso 2 volte su 6, sulla base 0 su 5. Che la mia modifica non c'entri **non posso confermarlo** con certezza statistica, ma il codice percorso dal guardiano è identico.

Va giudicato dal team come guardiano instabile. La regola PO del 13/10 dice che si ripara, non si ripete. La riparazione (seminare il bersaglio del tiro nel guardiano o nel gioco) è fuori dall'ambito di questo giro.

**Altri controlli:**

- `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.
- `node tools/audit-copyright.mjs` → OK.
- `prima-partita-237`: verde, e rosso con `__CPM_NO_PRE237`.
- `crediti-238`: verde, e rosso con `__CPM_NO_CREDITI238`.

**File toccati:**

- src/11-ui-kit-highlight.jsx (pre-caricamento);
- src/12-three-match-view.jsx (riuso delle teste, una riga);
- src/17-menu-creazione-pannelli.jsx (Crediti);
- CARRIER-MANAGER-AV.html (ricomposto);
- tests/visual/prima-partita-237.mjs, tests/visual/crediti-238.mjs, tests/visual/package.json (due script npm);
- docs/governo/BACKLOG.md (righe PO-237/238);
- docs/governo/STABILITA.json (registro della catena);
- docs/collaudo-grafico/g0 (foto rigenerate da `griglia-mobile`; la home ora mostra «Crediti»);
- docs/sviluppo/foto/giro15-*;
- questo rapporto.

Non toccati: `GAME_VERSION` e la roadmap. Questo è un ramo di sviluppo, non un rilascio: la riga di roadmap la scrive chi promuove.
