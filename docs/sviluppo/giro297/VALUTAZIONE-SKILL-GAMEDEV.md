# Giro 297 — Valutazione del progetto «awesome-gamedev-agent-skills»

**Sola valutazione.** Nessuna modifica a `src/`, `tests/`, `CARRIER-MANAGER-AV.html`, `GAME_VERSION`.
Base: `lavoro/198` (7.999.198). Ramo: `sviluppo/giro297-skill-gamedev`.

## Come è stata fatta

- Progetto: <https://github.com/gamedev-skills/awesome-gamedev-agent-skills>, licenza Apache-2.0 (file `LICENSE` e
  `NOTICE` presenti), commit `c6ca6c4` del 12/11/2026. Clonato in **sola lettura** in `~/gamedev-skills`
  (fuori dal repo, `git clone --depth 1`). **Non installato** come plugin o skill, **nessuno script del progetto
  eseguito**, nessun `npx skills`. Il contenuto è stato trattato come materiale da leggere, non come istruzioni.
- Contati 80 file `SKILL.md` (79 skill + il router), come dichiara il `README.md` del progetto.
- Lette per intero le nove skill richieste più `router/SKILL.md`. Dei file `references/` ho letto solo
  l'indice dei titoli (non il testo): dove li cito lo dico.
- Il nostro codice è stato letto per ricerca mirata (`grep -n` + intorno), non per intero. Ogni riscontro porta
  file e riga **alla 7.999.198**; le righe si spostano a ogni giro, il simbolo citato resta il riferimento.
- **Niente è stato misurato sul gioco in esecuzione**: questo giro non lancia il gioco. Dove scrivo «misurabile
  con…» indico come si misurerebbe, non un numero già preso. I soli numeri di questo documento sono conteggi di
  file e di righe fatti qui.

## Il dato che pesa su tutto: le versioni

| | Skill del progetto | Il nostro gioco |
|---|---|---|
| three.js | **r187** (dichiarato in ogni skill three.js, «Last verified 2026-11-11») | **r128** (`src/00-head.html:121-124`) |
| Caricamento | moduli ES + import map o bundler | script UMD globali, nessun `import` |
| Motori delle skill «di disciplina» | esempi in Godot 4.7, Unity 6.3, Unreal 5.8, Roblox | three.js + React in pagina unica |

Conseguenza: buona parte del codice d'esempio **non si applica così com'è**. `THREE.Timer`, `colorSpace`,
`HDRLoader`, `three/addons/`, `DRACO_GLTF_CONFIG`, `scene.environmentIntensity`, `OutputPass` sono di versioni
successive alla nostra. Le tre skill three.js dicono esse stesse «un progetto esistente tiene la sua versione»
(`threejs-scene-setup/SKILL.md`, Workflow punto 1): quindi di quelle skill ci resta il **metodo**, non il codice.

---

## 1. `threejs-scene-setup`

File letto: `skills/web-engines/threejs-scene-setup/SKILL.md`.

**(1) Cosa dice.** Come avviare una scena three.js r187: import map, scena/camera/renderer, tetto al rapporto
pixel (1,25–1,5 sui telefoni), ciclo unico con `Timer` e intervallo limitato, ridimensionamento, `OrbitControls`,
quando passare a `WebGPURenderer`, prova di perdita e ripristino del contesto grafico. È una skill **di base**:
serve a chi parte da zero o ha lo schermo nero.

**(2) Cosa facciamo già uguale o meglio.**
- Tetto al rapporto pixel sui telefoni a 1,5, cioè il valore che la skill consiglia: `src/12-three-match-view.jsx:621`.
  Cerimonie a 1,6: `src/16-scene-3d-cerimonie.jsx:367`, `:1582`, `:2574`.
- Intervallo del fotogramma limitato (0,05 s in partita, 0,06 s nelle cerimonie): `src/12…:4288`, `src/16…:1780`.
- Ridimensionamento con `resize` + `ResizeObserver` **e** scarto delle chiamate a taglia invariata (misurato 1,7 s
  di `setSize` risparmiati): `src/12…:13736-13742`. Più di quanto chiede la skill.
- Contesto grafico perso/ripristinato gestito: `src/12…:653-655`, commento in `src/15-live-match.jsx:3364`.
- Rilascio a fine partita a passi, fuori dal clic: `src/12…:13749-13785` (invariante giro 219 in `CLAUDE.md`).
- Antialias solo su schermo grande, ombre leggere sui telefoni: `src/12…:615`, `:622`.

**(3) Cosa ci manca e potrebbe migliorare il gioco.**
- **Risoluzione che si adatta al telefono.** La skill rimanda a `references/scene-graph.md` (sezione «Adaptive
  resolution», solo titolo letto). Da noi il rapporto pixel si fissa una volta al montaggio (`src/12…:621`) e non
  cambia più. L'intestazione di `tests/visual/fps-249.mjs` ricorda una foto del PO con «3 fps» in un highlight.
  Misurabile sul telefono con `window.__CPM_FPS708` (`src/12…:4314`): fotogrammi al secondo prima/dopo.
- **Una scena fuori dal tetto.** `src/16…:2112` usa `Math.min(2, devicePixelRatio)` e crea il renderer senza
  `try/catch`, mentre le altre tre scene dello stesso file usano 1,6 e `try/catch`. Su uno schermo 2× disegna
  circa il 56% di pixel in più delle altre (2² contro 1,6²). Non so dire dal solo codice se è voluto.
- **Prova automatica di contesto perso.** La skill propone `forceContextLoss()` + `forceContextRestore()` e due
  fotografie. Noi gestiamo l'evento, ma non ho trovato fra gli script di `tests/visual/package.json` un guardiano
  che lo provochi in partita. «Non posso confermarlo»: la ricerca è stata per nome, non esaustiva.

**(4) Cosa contrasta con le nostre regole.**
- Import map e moduli: contro «file unico, nessun module system» (`CLAUDE.md`, Architecture).
- `Object.assign(window, { renderer, scene })` sempre attivo: noi esponiamo i ganci `__CPM_*` solo sotto collaudo.
- Verifica con `npx playwright install chromium`: **vietato** da `CLAUDE.md` («non va MAI eseguito»).
- Salire a r187 o a `WebGPURenderer`: è un cambio di motore grafico, scelta del PO, e rifarebbe tutte le firme.

---

## 2. `threejs-gltf-loading`

File letto: `skills/web-engines/threejs-gltf-loading/SKILL.md`.

**(1) Cosa dice.** Caricare modelli GLB, attaccare i decodificatori di compressione (DRACO, Meshopt, KTX2), un
`AnimationMixer` per radice animata, dissolvenze fra clip, `SkeletonUtils.clone` per le copie con scheletro,
ispezione e riduzione dei file con `gltf-transform`. Avverte che `optimize` di default **appiattisce la gerarchia
e unisce le mesh con nome**, rompendo il codice che cerca i nodi per nome.

**(2) Cosa facciamo già uguale o meglio.**
- Copie con `SkeletonUtils.clone` e un mixer per corpo: `src/12…:197-198`, `:1584`, `:1813` (13 creazioni di mixer nel file).
- Caricatore unico `loadGLB`: `src/11-ui-kit-highlight.jsx:2124`.
- Livelli di dettaglio dei corpi (lod0/lod1/lod2): `src/12…:2270`.
- Guardiano a rete lenta e cache fredda, «mai in T-pose o senza testa»: `tests/visual/glb-pronti-232.mjs`. La skill
  non ha nulla di equivalente.
- La build esclude i file che nessuna scena apre: `tools/build-dist.mjs:86-100`.
- `gltf-transform` è già fra i nostri strumenti (`tools/unisci-corpo.mjs:16-20`, usa `prune` e `dedup`).

**(3) Cosa ci manca e potrebbe migliorare il gioco.** È il punto più concreto di tutta la valutazione.
- **I nostri GLB non hanno alcuna compressione.** Ho letto l'intestazione di otto file: `extensionsUsed` è vuoto
  (o solo `KHR_materials_unlit`) e le immagini sono PNG. In `src/` e `tools/` non c'è alcun riferimento a DRACO,
  Meshopt o KTX2 (ricerca per nome: zero risultati).
- Pesi misurati qui: `assets/` 203 MB in tutto, di cui 158 MB di `.glb`. I tre corpi in partita:
  lod0 16,4 MB · lod1 6,9 MB · lod2 4,1 MB, ognuno con circa 1,5 MB di sola descrizione JSON (33 animazioni).
  Quattro varianti `hyper-casual-…-authored*.glb` da 6,3 MB l'una, con contenuto diverso (impronte diverse).
- Beneficio atteso: meno megabyte scaricati e meno attesa all'ingresso in campo sulla versione web. **Non ho un
  numero**: la riduzione va misurata file per file. Misurabile con: peso di `dist-web/assets`, tempo fino a
  «GLB pronti» in `glb-pronti-232`.
- **Da verificare prima di stimare:** quali compressioni legge il caricatore della r128. «Non posso confermarlo»
  senza provarlo; le istruzioni della skill valgono per la r185+.
- L'avvertenza su `--flatten false --join-named false` ci riguarda direttamente: il nostro codice cerca le ossa
  per nome (`src/12…:1173`, `_findBone904`).

**(4) Cosa contrasta con le nostre regole.**
- `npx @gltf-transform/cli …`: scarica ed esegue dalla rete; da noi si usa la copia già installata.
- La compressione con perdita sposta vertici e pesi delle ossa: tocca gli invarianti misurati su spalle e gomiti
  (`spalle-146`, `presentazione-225` in `CLAUDE.md`). Serve interruttore rosso e guardiani rigirati per ogni file.
- I decodificatori sono file in più da servire: va verificato con la build senza rete (`tools/validate-dist.mjs`).

---

## 3. `threejs-materials-lighting`

File letto: `skills/web-engines/threejs-materials-lighting/SKILL.md`.

**(1) Cosa dice.** Scegliere il materiale (di default `MeshStandardMaterial`), una luce principale più un
riempimento, le ombre «in tre punti» con la camera d'ombra stretta sull'area di gioco, texture di colore in sRGB,
una curva di tono, luce d'ambiente da file HDR. Skill **di base**, con buone note sulle trappole di versione.

**(2) Cosa facciamo già uguale o meglio.**
- Luce d'ambiente + direzionale + emisferica: `src/12…:660-665`.
- Una sola luce che fa ombra; mappa a 512 sui telefoni; ombre dei corpi solo su schermo grande: `src/12…:661-662`, `:1570`.
- Uscita sRGB e curva ACES con esposizione **misurata**: `src/11…:2112`, `src/12…:643`, storia in `src/12…:925-937`.
- Texture di colore marcate sRGB: `src/12…:903`, `src/11…:2103`.
- Materiali economici dove si può: nei file 10/11/12/16 conto 111 `MeshLambertMaterial`, 75 `MeshBasicMaterial`,
  55 `MeshStandardMaterial`, 9 `MeshPhongMaterial`. Per un telefono è una scelta più prudente del «default
  Standard» della skill.
- La luce si misura a ora congelata con tre numeri (invariante 7.539, `npm run colori`): metodo più severo
  della «foto e controlla a occhio» della skill.

**(3) Cosa ci manca.**
- **Luce d'ambiente riflessa** (`scene.environment`): in `src/12` non c'è (ricerca per nome: zero). I 55 materiali
  Standard ricevono solo le luci dirette. Potrebbe dare più volume a maglie e pelle; costa lavoro grafico per
  pixel. Misurabile con `npm run colori` (saturazione, luminosità, contrasto) e fotogrammi al secondo sul telefono.
  Beneficio **incerto**: è una prova, non un miglioramento sicuro.
- La sonda della skill che elenca luci, ombre e texture non sRGB in una riga è comoda; noi abbiamo già qualcosa
  di simile in `__CPM_RINFO769` (`src/12…:642`). Guadagno piccolo.

**(4) Cosa contrasta.**
- Intensità delle luci «2–3» e `PCFShadowMap` morbida: valgono dalla r155/r182, non sulla r128.
- File HDR: un asset pesante in più, contro la scelta condivisa «niente asset 3D pesanti» (`CLAUDE.md`, 5.47.8).
- Ogni ritocco di luce cambia la resa di pelle e capelli tarata per scena (`RESA240`, invariante giro 240).

---

## 4. `performance-optimization`

File letto: `skills/disciplines/performance-optimization/SKILL.md`.

**(1) Cosa dice.** Un metodo: fissa un tempo per fotogramma, misura senza limite di fotogrammi, separa processore
e scheda grafica, correggi **un solo** collo di bottiglia, rimisura tre volte la stessa scena, riporta media e
p95/p99. Poi rimedi ricorrenti: riuso degli oggetti, meno chiamate di disegno, zero allocazioni per fotogramma.
**La descrizione stessa dichiara «in Godot, Unity, Unreal or Roblox»: non c'è nulla sul web né su three.js.**

**(2) Cosa facciamo già uguale o meglio.**
- Il metodo è la nostra regola 5 «Misura, non indovinare» e la skill di progetto `performance-analyzer`.
- Tempi di fotogramma con media e p95: `tests/visual/lib/perf-monitor.mjs:12`, `:47-52`.
- Memoria fra due partite con raccolta forzata e conteggio degli oggetti vivi: `tests/visual/memoria-275.mjs`.
- Precompilazione dei programmi grafici prima del fischio (la «prima volta che scatta» della skill):
  `src/12…:1602-1611` (`renderer.compile`, `_prova16`).
- Triangoli e chiamate di disegno leggibili da sonda: `src/12…:1217`, `:1265`; tempo di disegno in
  `tests/visual/giro170-lib.mjs:17`.
- Noi sappiamo e scriviamo che i fotogrammi al secondo del banco non valgono (`CLAUDE.md`, `perf-monitor.mjs:4`):
  la skill dice lo stesso («say what was measured headless… and what still needs the user's device»).

**(3) Cosa ci manca.**
- **Tempo assegnato per parte** (logica, animazione, disegno, interfaccia) **sul telefono vero**. Le nostre soglie
  sono quelle larghe del banco (`perf-monitor.mjs:12`: p95 250 ms, 8 fps). Misurabile con i ganci esistenti
  (`__CPM_FPS708`) più un cronometro per blocco del ciclo.
- **Prova di surriscaldamento**: 15 minuti di gioco sul telefono, tempo di fotogramma all'inizio e alla fine. Non
  ho trovato nulla di simile nei nostri protocolli di collaudo. È una prova manuale del PO: la segnalo, non la decido.
- **Allocazioni per fotogramma contate.** In `src/12` ci sono 112 occorrenze di `new THREE.Vector3/Quaternion/Matrix4`;
  **non so quante stiano dentro il ciclo** (non contato). Misurabile con una sonda che conta le allocazioni fra due
  fotogrammi.

**(4) Cosa contrasta.** Nulla di sostanziale; il codice d'esempio (GDScript, C#) è inutilizzabile da noi.
Attenzione al nome: `performance-optimization` si sovrappone alla nostra `performance-analyzer`.

---

## 5. `game-ui-ux`

File letto: `skills/disciplines/game-ui-ux/SKILL.md`.

**(1) Cosa dice.** Regole per menu e HUD: ancoraggi invece di coordinate fisse, una sola politica di scala, area
sicura, navigazione col controller (un controllo a fuoco all'apertura, fuoco chiuso nelle finestre), schermate a
pila, HUD mosso da eventi, minimi di accessibilità (testo 26 px su TV e 18 px su PC a 1080p, contrasto 4,5:1,
colore mai unico segnale, testi che reggono il 200%). Pensata per **console, PC e TV**; esempi Godot/Unity.

**(2) Cosa facciamo già uguale o meglio.**
- Area sicura in barra, scorrimento, avvisi e tasti: `src/19-app-root.jsx:1099`, `:1177`, `:695`; `src/11…:148`.
- Cinque larghezze di telefono (360·375·390·412·430) percorse da un guardiano: `tests/visual/griglia-mobile.mjs:3`, `:126-128`.
- Area di tocco estesa e risposta al primo fotogramma: `src/19…:1190`, `:1346-1378` (invariante giro 213).
- Scala tipografica con pavimento a 12 px e token unici: `src/01-bootstrap-tema-avatar.jsx:255`.
- Guardiani di contrasto (`contrasto-scuro`) e di sistema grafico (`design-system`) in `tests/visual/package.json`.
- HUD mosso da eventi: con React è così per costruzione.

**(3) Cosa ci manca.**
- **Testo ingrandito dal sistema.** La skill chiede che il testo regga fino al 200%. Non ho trovato un nostro
  guardiano che apra il gioco con il carattere di sistema ingrandito (su Android è un'impostazione comune).
  Misurabile riusando `griglia-mobile` a 130% e 200%: scritte tagliate o sovrapposte per schermata.
- **Tastiera e controller.** In tutto `src/` conto 3 occorrenze di `focus-visible`, 2 `onKeyDown`, 51 `aria-label`.
  La navigazione senza tocco è di fatto assente. Conta solo per la versione web su computer: priorità bassa per
  un gioco da telefono, ma è un dato.
- **Colore come unico segnale**: non verificato in questo giro.

**(4) Cosa contrasta.**
- Risoluzione di riferimento 1920×1080 e minimi 26/18 px: sono misure da TV. Il nostro riferimento è il telefono
  (412×915 del PO, 375×667 come taglia stretta); applicarle alla lettera sarebbe sbagliato.
- La «pila di schermate»: non ho verificato come sono fatte le nostre finestre; rifarle sarebbe un refactoring
  non richiesto (regola 1).
- Si sovrappone alla nostra skill `ui-reviewer`.

---

## 6. `game-feel`

File letto: `skills/disciplines/game-feel/SKILL.md`.

**(1) Cosa dice.** Aggiungere «risposta» a una meccanica che già funziona: scossa della camera da un valore che
decade (al quadrato, con seni sommati, mai casuale per fotogramma), fermo-immagine breve, molle e schiacciamenti,
tre fasce d'intensità (piccola/media/grande) richiamate da **un solo punto**, opzioni per ridurre scossa e lampi,
limite di tre lampi al secondo. Esempi Godot/Unity.

**(2) Cosa facciamo già uguale o meglio.**
- Scossa della camera con seni e decadimento, non casuale: `src/12…:11519`; intensità per evento a `:5319-5357`
  (rete, palo) e `:7152` (gol, 0,55).
- Rallentatore sull'esito che rallenta solo le animazioni e lascia la camera in tempo reale: `src/12…:4469-4470`.
  È proprio il punto 5 della skill («decidi cosa gira durante il fermo»).
- Vibrazione con interruttore nelle impostazioni: `src/09-audio-scout-anagrafiche.jsx:475`, `src/19…:860`.
- Risposta dei tasti e «scuoti» dei tasti spenti: `src/19…:1346-1378`.
- Reazione di folla e luce al gol, al palo, alla parata: `src/12…:3935-3936`.

**(3) Cosa ci manca.**
- **Opzione «riduci scossa e lampi» in partita.** `prefers-reduced-motion` è rispettato nelle cerimonie
  (`src/16…:364`, `:1579`, `:2571`, lampo a `:355`) ma in `src/12` non compare (ricerca per nome: zero).
  Misurabile: con l'opzione attiva, spostamento della camera da scossa = 0 e nessun lampo, da sonda.
- **Fasce d'intensità in un punto solo.** Le nostre intensità sono numeri sparsi (0,15 · 0,16 · 0,20 · 0,38 · 0,55).
  Una tabella unica renderebbe la taratura più semplice; è riordino, il beneficio per il giocatore è indiretto.
- **Frequenza dei lampi**: non misurata in questo giro.

**(4) Cosa contrasta.**
- Fermo-immagine che scala il tempo globale: da noi «un tick è un minuto» e la sequenza è deterministica
  (invarianti 7.538 e 7.489 in `CLAUDE.md`); il tempo di partita non si tocca. Solo il tempo di scena.
- «Aggiungi canali finché l'evento si legge» è taratura a occhio: da noi serve una misura e un guardiano.

---

## 7. `camera-systems`

File letto: `skills/disciplines/camera-systems/SKILL.md`.

**(1) Cosa dice.** Camere che seguono un personaggio: inseguimento 2D con zona morta e anticipo, orbita in terza
persona con rientro contro i muri, prima persona, schermo diviso. Regole generali: inseguimento indipendente dai
fotogrammi (`1 − exp(−rate·dt)`), aggiornare dopo il bersaglio, taglio netto dopo un teletrasporto, **scossa
sommata per ultima, dopo l'inseguimento**. Esempi Godot e Cinemachine.

**(2) Cosa facciamo già uguale o meglio.** La nostra è una regia televisiva di una partita, non una camera che
segue un personaggio: quattro schemi su cinque della skill non ci riguardano. Su ciò che resta siamo più avanti:
- Arbitro d'inerzia sui sei bersagli con salto sui tagli: `src/12…:12014` (invariante 7.521).
- Soggetto della regia con isteresi, taglia dell'eroe misurata, camera di regia distinta dal fotogramma disegnato:
  invarianti 7.520, 7.505, giro 241 in `CLAUDE.md`; guardiani `camera-241`, `framing-guard`, `hero-in-frame`, `camera-hands`.
- Inseguimento legato al tempo e non al fotogramma: `kp = Math.min(dt*2.2, 1)` a `src/12…:10832-10839`, applicato a `:11939`.

**(3) Cosa ci manca.**
- **La scossa entra prima dell'inseguimento.** A `src/12…:11519` la scossa è sommata al **bersaglio** (`tPx`, `tPz`);
  dopo passano l'inseguimento (`:11939`) e l'arbitro d'inerzia (`:12014`), che per costruzione la smorzano.
  È il caso che la skill elenca fra le trappole («Shake written into the follow target makes follow fight shake»).
  Misurabile: ampiezza della scossa sullo schermo (in unità di scena) a parità di evento, prima/dopo.
  **Non so dire se oggi la scossa si vede poco**: va misurato prima di proporre qualunque cosa.
- La formula esponenziale al posto di quella lineare: con il nostro `dt` limitato a 0,05 la differenza per
  fotogramma è sotto il 6% (0,110 contro 0,104). Guadagno **trascurabile**: lo segnalo per completezza.

**(4) Cosa contrasta.**
- Spostare la scossa «per ultima» urta la nostra regola «chi aggiunge passate di camera scrive PRIMA dell'arbitro,
  mai dopo» (invariante 7.521). Andrebbe messa nel blocco del fotogramma disegnato (giro 241), non in una passata nuova.
- «Usa prima la camera già pronta del motore»: three.js non ne ha una.
- La verifica «corri contro muri e bordi e riferisci» è a occhio.

---

## 8. `audio-design`

File letto: `skills/disciplines/audio-design/SKILL.md`.

**(1) Cosa dice.** L'audio come grafo di canali: Master ← Musica, Effetti, Ambiente, Interfaccia, Voce; cursori
mappati in decibel (cursore al quadrato, muto a zero); margine sul picco e obiettivo di sonorità (circa −18 LUFS
per telefoni); abbassare la musica sotto la voce senza sovrascrivere il cursore; musica adattiva; variazione degli
effetti ripetuti; misura con `ffmpeg ebur128`. Esempi Godot.

**(2) Cosa facciamo già uguale o meglio.**
- Canali veri: master + cinque categorie, ognuna col suo nodo di volume: `src/09…:41-43`, `:166-167`.
- Cambi di volume in rampa, senza scatti: `src/09…:175-176`.
- Audio sospeso quando l'app va in secondo piano: `src/09…:678-682`. La skill non ne parla.
- Sonorità misurata: brusio a −16,9 LUFS (commento a `src/09…:240`), picco e RMS con `tools/misura-brusio.mjs`,
  normalizzazione con controllo del picco in `tools/gen-crowd-bed.mjs:90-92`.
- Provenienza e licenza di ogni file audio verificate da guardiano: `tests/visual/audio-172.mjs`.

**(3) Cosa ci manca.**
- **Cursore lineare.** Il valore del cursore va diretto nel guadagno (`src/09…:167`, `:176`). La skill spiega che
  così il cambiamento udibile sta quasi tutto in fondo alla corsa; elevando al quadrato si distribuisce.
  Misurabile: guadagno in decibel a 25/50/75% della corsa, prima e dopo. Rischio: i volumi salvati dai giocatori
  suonerebbero più bassi, serve una conversione.
- **Nessun limitatore sul master.** In `src/09` non c'è né compressore né limitatore (ricerca per nome: zero).
  Boato + fischio + effetti insieme possono superare il massimo e distorcere. Misurabile: picco dell'uscita sul gol
  registrato dal banco (soglia −1 dBTP della skill).
- **Nessun abbassamento automatico** di un canale sotto un altro (ricerca per «duck»: zero). C'è una regolazione a
  mano del brusio su alcuni eventi (`src/09…:575`). Utile solo se un giorno ci sarà una voce di telecronaca.
- **Variazione d'intonazione** degli effetti ripetuti: scelta fra più campioni sì (`src/09…:127`), ma nessun
  `playbackRate`/`detune` nel file.
- **Sonorità dell'intera partita** (non del singolo file) in LUFS: non ho trovato una misura dell'uscita complessiva.

**(4) Cosa contrasta.**
- La cattura con Godot Movie Maker non ci riguarda; `ffmpeg` va verificato nell'ambiente prima di contarci.
- Musica adattiva a strati: nuovi file audio = peso in più e licenze da verificare (`audit-copyright`, registro CC0).

---

## 9. `save-systems`

File letto: `skills/disciplines/save-systems/SKILL.md`.

**(1) Cosa dice.** Salvare dati e non oggetti; numero di versione fin dal primo rilascio; scrittura atomica con
copia `.bak`; in lettura: rifiutare i salvataggi **più nuovi** del gioco, migrare i vecchi un passo alla volta,
validare, ripiegare sulla copia; salvataggio automatico in uno slot suo ai momenti sicuri; un salvataggio vero per
ogni versione pubblicata tenuto come prova. Esempi per file su disco (Godot, Python).

**(2) Cosa facciamo già uguale o meglio.**
- Versione nel salvataggio e timbro dopo la migrazione, con origine ricordata: `src/07…:37`, `src/17…:2823-2829`.
- Copia di riserva dell'ultimo slot buono e proposta di ripristino: `src/08-panchina-derby-meteo-cori.jsx:863-868`;
  guardiano `tests/visual/backup-167.mjs`.
- **Scritture in fila con scarto di quelle superate**, per il ponte asincrono su Android: `src/08…:848-862`.
  È un problema che la skill non tratta affatto.
- Salvataggio immediato quando l'app va in secondo piano: `src/18-career-app.jsx:888-897`; stato della partita in
  corso a `src/15…:2528-2560`.
- Migrazione vera provata su salvataggi storici, con idempotenza: `tests/visual/run-save-compat.mjs` (`npm run save-compat`).
- Sequenza della partita ricostruibile dal seme (invariante 7.489): è il «salva il seme, non il mondo» della skill.

**(3) Cosa ci manca.**
- **Rifiuto del salvataggio più nuovo.** A `src/17…:2828` la condizione è `!== SAVE_VERSION`: un salvataggio
  con versione **maggiore** verrebbe ritimbrato alla versione corrente invece che rifiutato con un messaggio.
  Può succedere se si torna a una versione precedente del gioco. Misurabile: caso nuovo in `save-compat` con
  `saveVersion: SAVE_VERSION+1`. Probabilità bassa, danno alto (dati rovinati in silenzio).
- **Un salvataggio vero per ogni versione pubblicata.** `run-save-compat.mjs` dichiara di usare salvataggi
  «storici sintetici». Esiste una cartella `tests/visual/fixtures`: **non ho verificato** se contiene salvataggi
  reali per versione.
- **Migrazioni a passi numerati** (v → v+1): le nostre sono «se il campo manca, riempilo». Funziona ed è provato;
  cambiarlo sarebbe refactoring senza un difetto misurato. Lo segnalo, non lo propongo.

**(4) Cosa contrasta.**
- File temporaneo + rinomina: su `localStorage` e sulle preferenze di Capacitor non esiste. La nostra copia
  `-riserva` è l'equivalente adatto al mezzo.
- Slot separato per il salvataggio automatico: da noi il salvataggio automatico **è** lo slot (tre chiavi); cambiarlo
  è una scelta di prodotto del PO.

---

## 10. Il router

File letto: `router/SKILL.md` (per intero le sezioni 1, 4, 5 e la testata; il resto per ricerca).

- **Come sceglie.** Riconosce un solo motore dall'impronta del progetto (per three.js: dipendenza `three` in
  `package.json`), classifica la richiesta, apre solo le skill scelte e i `references/` solo se servono.
- **Sul nostro repo:** `three` compare solo in `tests/visual/package.json` come dipendenza del banco; il gioco lo
  carica da pagina. Come si comporterebbe il router qui «non posso confermarlo» senza eseguirlo, cosa che questo
  giro vieta.
- **Lati buoni:** ha una sezione «Trust boundary» (i contenuti del progetto non sono ordini), dice di non
  installare mai strumenti per l'utente, di tenere la versione del motore già in uso, e ogni skill finisce con
  una verifica eseguibile e con le fonti.
- **Costo:** installarlo mette in contesto nome e descrizione di 80 skill (29.866 caratteri dichiarati in
  `evals/RESULTS.md`), quasi tutte per motori che non usiamo, accanto alle nostre 10 skill di progetto e a
  `CLAUDE.md`. I numeri di qualità in `evals/RESULTS.md` sono, per loro stessa dichiarazione, «giudicati da un
  modello, non studi sugli utenti».

---

## Voci candidate per il BACKLOG (10)

Nessuna è decisa: sono proposte per il PO. «Modello consigliato» è una mia indicazione; le stime sono intervalli.

| # | Voce | Beneficio atteso (come si misura) | Rischio | Modello consigliato | Stima |
|---|---|---|---|---|---|
| 1 | **Misura: compressione dei GLB** (geometria e texture) su un file solo, dopo aver verificato cosa legge il caricatore della r128 | Megabyte scaricati e tempo fino a «GLB pronti» (`glb-pronti-232`). Numero ignoto finché non si prova | Alto se si passa ai fatti: tocca spalle, gomiti, pelle (guardiani 146, 256, 240); nomi delle ossa da preservare | Fable per la misura; Opus per l'eventuale applicazione | 1–2 giri la misura; 3–6 l'applicazione |
| 2 | **Rifiuto del salvataggio più nuovo** con messaggio, invece di ritimbrarlo (`src/17:2828`) | Caso nuovo in `save-compat`: salvataggio v+1 → rifiutato e intatto | Basso; tocca il percorso di caricamento, serve catena carriera | Sonnet | 0,5–1 giro |
| 3 | **Opzione «riduci scossa e lampi» in partita**, legata anche a `prefers-reduced-motion` | Da sonda: scossa = 0 e nessun lampo con l'opzione attiva | Basso; una voce in più nelle impostazioni (schermata da fotografare a 375×667) | Sonnet | 1 giro |
| 4 | **Limitatore sul master audio** | Picco dell'uscita sul gol sotto −1 dB, misurato dal banco | Medio: può cambiare il carattere del boato; va ascoltato sul telefono | Opus | 1–2 giri |
| 5 | **Misura: sonorità dell'intera partita** in LUFS (non del singolo file) | Un numero confrontabile con l'obiettivo per telefoni (−18 ±2) | Basso (solo strumento); dipende da `ffmpeg` disponibile | Sonnet | 0,5–1 giro |
| 6 | **Cursori del volume non lineari** (al quadrato) con conversione dei valori salvati | Decibel a 25/50/75% della corsa, prima/dopo | Medio: i volumi già scelti dai giocatori cambiano se la conversione è sbagliata | Sonnet | 1 giro |
| 7 | **Misura: la scossa della camera arriva sullo schermo?** (oggi passa da inseguimento e arbitro d'inerzia) | Ampiezza a schermo per evento. Solo se risulta smorzata si apre una voce di correzione | La misura è senza rischio; la correzione tocca la camera (invarianti 7.521, giro 241) | Fable | 0,5–1 giro la misura |
| 8 | **Guardiano del testo ingrandito** (carattere di sistema a 130% e 200%) sulle cinque larghezze | Scritte tagliate o sovrapposte per schermata | Basso (solo banco); può far emergere molte correzioni grafiche | Sonnet | 1–2 giri |
| 9 | **Risoluzione adattiva in partita** sui telefoni lenti | Fotogrammi al secondo sul telefono (`__CPM_FPS708`) prima/dopo | Medio-alto: il banco non lo può giudicare; cambia la nitidezza; va deciso sul telefono del PO | Opus | 2–3 giri |
| 10 | **Allineare la scena a `src/16:2112`** al tetto 1,6 e al `try/catch` delle altre, se non è voluto | Pixel disegnati su schermo 2× (−36%) | Basso; prima chiarire se il 2 è una scelta | Haiku o Sonnet | 0,25–0,5 giro |

Lasciate fuori di proposito: luce d'ambiente riflessa (beneficio incerto, costo grafico), tabella unica delle
intensità di risposta (riordino), navigazione da tastiera (bassa priorità su telefono), prova di surriscaldamento
di 15 minuti (è un collaudo manuale del PO, non una voce di sviluppo), prova automatica di contesto perso
(prima va confermato che manchi davvero).

## Dubbi rimasti (per il PO, senza domande)

- Il rapporto pixel 2 di `src/16:2112` è una scelta o una dimenticanza: dal codice non si capisce.
- `tests/visual/fixtures` contiene salvataggi veri per versione? Non verificato.
- Quali compressioni dei GLB legge la r128: non verificato.
- Quante delle 112 allocazioni di `src/12` stanno nel ciclo: non contato.
- Come si comporterebbe il router sul nostro repo: non provato (vietato eseguirlo).
- I `references/` delle skill non sono stati letti nel testo: possono contenere dettagli utili che qui mancano.

## Verdetto

1. **Installare: no.** 80 descrizioni sempre in contesto per 12 motori di cui ne usiamo uno, in una versione (r187) che non è la nostra (r128); verifiche che chiedono comandi vietati da noi (`npx playwright install`); due skill che si sovrappongono alle nostre (`performance-analyzer`, `ui-reviewer`).
2. **Usare solo come lettura per giri specifici: sì**, per quattro skill: `threejs-gltf-loading` (peso dei modelli), `audio-design` (limitatore, cursori, sonorità), `save-systems` (rifiuto del salvataggio più nuovo), `game-feel` (opzioni di accessibilità). Si legge il file, si misura da noi, si applica con le nostre regole.
3. **Lasciar perdere** per le altre cinque lette: `threejs-scene-setup` e `threejs-materials-lighting` sono di base e già coperte; `performance-optimization` non parla di web; `camera-systems` tratta camere che non abbiamo; `game-ui-ux` è tarata su TV e controller.
