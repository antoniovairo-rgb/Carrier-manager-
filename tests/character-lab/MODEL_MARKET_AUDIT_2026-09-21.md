# Audit candidati modello 3D — 21 settembre 2026

## Requisiti

- calciatore maschile adulto, credibile in una partita;
- rig esportabile FBX/GLB e T/A-pose;
- materiali e UV modificabili per squadre e Hero;
- budget mobile: il modello non deve imporre texture 4K o geometria eccessiva a tutti i 22 giocatori;
- nessun uso di CH38 o Quaternius.

## Candidati verificati

| Candidato | Evidenza tecnica pubblica | Valutazione per Korward |
|---|---|---|
| **Soccer Player — Rigged Low-poly (Hisenberg, gia acquistato)** | [CGTrader](https://www.cgtrader.com/3d-models/character/man/realistic-soccer-player-v2-rigged): 17.891 poligoni, rig, T-pose, FBX/GLB/BLEND/OBJ, UV e PBR; listing verificato CGTrader. | **Miglior base disponibile sotto budget.** E tecnicamente adatto, ma non chiude da solo le varianti viso/capelli ne il budget di 22 player: servono LOD/material batching e una review estetica del volto nel runtime. |
| **Soccer Player Male — Rigged (Fab)** | [Fab](https://www.fab.com/listings/eb4e1807-c899-41d9-9b6e-3ce4d1e782d6): uomo, professionista, rig, T-pose, FBX/GLB/BLEND/OBJ e tag modular/PBR dichiarati. | **Candidato secondario.** La pagina non pubblica triangoli, texture o informazioni sulle varianti anatomiche; non acquistare senza preview e file tecnici. |
| **GoE Realistic Character Creator (DanilGOE)** | [Superhive](https://superhivemarket.com/products/realistic-male--female-character-creator-bundle--rigged--280-blendshapes--arkit-52--blender-add-on): due basi riggate, 140+ shape key per personaggio (viso/corpo/espressioni), Blender source e helper GLB/FBX. La descrizione cita colori per capelli/sopracciglia; non dichiara tagli capelli diversi nel pacchetto base. | **Rifiutato al preview gate.** La preview pubblica mostra pelle e lineamenti troppo lisci, occhi grandi e resa bamboliforme incompatibile con il calciatore adulto realistico richiesto. La licenza commerciale costa $359,99 in promozione; nessun file viene acquistato o testato. || **Daz Game-Ready / Genesis** | [Daz Game-Ready](https://www.daz3d.com/game-ready) dichiara FBX/DUF/GLB e struttura semplificata per alcuni asset; la piattaforma Genesis offre morph, abiti e capelli separati. | **Escluso come base immediata.** La ricerca non individua un calciatore maschile modulare già incluso nei pochi asset GLB; i prodotti capelli/volti sono generalmente DUF dipendenti da Genesis e richiedono licenze interattive/add-on. Senza un package football completo e un GLB verificabile, aggiunge dipendenze invece di risolvere Korward. || **MetaPerson Creator (Avatar SDK)** | [documentazione ufficiale](https://docs.metaperson.avatarsdk.com/js_api/): basi predefinite, volto/corpo/capelli/outfit modificabili, GLB/glTF/FBX, rig umanoide Mixamo e LOD 1/2; la demo pubblica mostra un volto maschile adulto non caricaturale. | **Candidato futuro, non disponibile alla POC.** La guida Three.js ufficiale dichiara che l'export GLB tramite Business Integration richiede piano Pro o superiore e credenziali sviluppatore. Senza quel piano non esiste un GLB legale da auditare; qualità, triangoli, kit e mobile restano non verificati. || **Argentinian Footballer (luis77)** | [CGTrader](https://www.cgtrader.com/3d-models/character/man/argentinian-footballer): $25, rig, quattro animazioni campione, FBX, PBR, 64.892 poligoni/33.093 triangoli e texture 4K. | **Escluso per mobile.** Migliore dettaglio ma texture e poligoni rendono il costo dei 22 giocatori peggiore del modello acquistato. |
| **Lamine Yamal CC-BY** | [Sketchfab](https://sketchfab.com/3d-models/lamine-yamal-model-69084075f1d8454a90570013b00e02cd): gratuito CC-BY, rig dichiarato, 49,1k triangoli. | **Escluso.** Troppo pesante, likeness di un atleta reale e nessuna prova di modularita o rig compatibile. |
| **TurboSquid Football Player Game Ready** | [2208226](https://www.turbosquid.com/3d-models/3d-football-player-game-ready-2208226): 20.404 poligoni dichiarati; [2208090](https://www.turbosquid.com/3d-models/football-player-game-ready-3d-model-2208090): 26.409 poligoni dichiarati. | **Solo benchmark commerciale.** Pagine non consentono di verificare qui prezzo, licenza, skeleton, varianti e dimensioni texture; nessun acquisto o promozione. |
| **Football Soccer Players — Animated & Rigged (Studio Ochi)** | [Sketchfab](https://sketchfab.com/3d-models/football-soccer-players-animated-rigged-14a393bdace245718c8e172c1b31628b): 9,5k triangoli / 4,8k vertici, FBX/OBJ/GLB rest pose, FBX/BLEND con sei animazioni e texture. | **Escluso come modello di partita.** La preview disponibile mostra un look flat-shaded, da folla low-poly: il budget e ottimo ma non soddisfa l'obiettivo di calciatori adulti credibili. Potrebbe servire solo come pubblico, fuori scope. |
| **Football Soccer Players Animated Rigged (3djoenish)** | [CGTrader](https://www.cgtrader.com/3d-models/sports/game/football-soccer-players-animated-rigged): $7, 26.158 poligoni, 20.137 vertici, rig/PBR/UV e 11 texture/animazioni dichiarate; download per formato 748 MB. | **Non promosso.** Il pacchetto promette varietà, ma il peso di distribuzione e il look low-poly della preview non danno un vantaggio provato rispetto alla base Hisenberg; skeleton, materiali per giocatore e texture non sono stati ispezionati nei file. |
| **Soccer Player ROMA rigged (Imperium Design)** | [TurboSquid](https://www.turbosquid.com/3d-models/3d-rigged-soccer-player-model/842871): 6.480 poligoni player, FBX/3ds Max, 20 animazioni, texture corpo/kit 2K e testa 1K. | **Escluso.** Il budget è interessante ma costa $119 ed è dichiarato solo per uso editoriale a causa del brand Roma/Nike: non è utilizzabile per Korward commerciale. |
| **Soccer Players 2018 Rigged Pack ROW (Imperium Design)** | [TurboSquid](https://www.turbosquid.com/3d-models/3d-model-pack-rigged-soccer-player-1293250): 5.574 poligoni, un rig con sei kit/teste/skin combinabili e FBX; texture 2K. | **Escluso.** Tecnicamente è il più vicino a un LOD con varietà, ma costa $299 ed è anch'esso editoriale per le livree federali: non può entrare nel prodotto. |
| **Shinji Kagawa game-ready (2017)** | [3DExport](https://3dexport.com/3d-model-shinji-kagawa-football-player-game-ready-character-171314): 6.291 poligoni, 6.536 vertici, rig e texture 2K; dichiara target mobile. | **Escluso.** Likeness e kit Borussia Dortmund rendono il modello non adatto al prodotto generico; il dato mobile è interessante ma non annulla il rischio legale/estetico. |
| **3DPassion / TurboSquid World Cup 2026** | Esempi [Harry Kane](https://www.turbosquid.com/FullPreview/Index.cfm/ID/2556153) e [Mbappé](https://www.turbosquid.com/FullPreview/2556350): FBX/GLB/Blender dichiarati ma 41–45k poligoni e uso editoriale. | **Escluso.** Sono likeness di atleti reali, fuori budget mobile e non utilizzabili come base generica. |

## Decisione corrente

Il modello Hisenberg acquistato non va scartato: la sua scheda fornisce le caratteristiche tecniche piu equilibrate tra i candidati verificabili. Le anomalie mostrate nelle preview precedenti non dimostrano che la base sia sbagliata: derivavano dalle prove hair/texture e dalla scena di integrazione. La priorita e correggere l'asset derivato e l'integrazione, non comprare un secondo modello senza un vantaggio tecnico provato.

### Misura locale del file destinato al runtime

L'ispezione diretta di `assets/cgtrader-player-runtime-base.glb` rende la decisione verificabile: **34.995 triangoli**, **7 primitive mesh**, **6 materiali/textures** e **68 joint deformanti**. La differenza rispetto ai 11.892 poligoni della scheda deriva dalla triangolazione del modello; non e un dato stimato. La stessa struttura separa busto, testa, arti e scarpe. Pertanto il modello e approvato come **LOD0 Hero / giocatore inquadrato**, mentre l'uso di ventidue copie a pieno dettaglio resta fuori budget fino alla riduzione di aggiornamenti, primitive o materiale. Il source `.blend` conserva 344 ossa totali, ma l'esportazione runtime rimuove i controlli non deformanti e mantiene i 68 joint effettivi.

Un sostituto sara promosso solo se fornisce **insieme**: volto adulto migliore, almeno LOD o triangoli <= modello corrente, FBX/GLB/BLEND, rig ispezionabile, licenza idonea e kit modificabile. Nessun candidato verificato raggiunge oggi tutte queste condizioni.

## Screening aggiuntivo — 21 settembre 2026

Il confronto ha chiarito un punto utile: scendere fino a 9,5k triangoli con il pack Studio Ochi risolve il carico ma porta a una resa visiva incompatibile con l'Hero e con i giocatori inquadrati. Il pack 3djoenish aggiunge undici livree e animazioni, ma non e un LOD controllato della stessa base e impone un download di 748 MB per ogni formato; non e quindi una scorciatoia affidabile per il mobile. La scelta verificata rimane **Hisenberg per Hero e calciatori visibili**, mentre si continua a cercare un vero LOD/crowd adulto che non cambi stile visivo.

| **Human Generator for Blender** | [Sito e documentazione ufficiali](https://humgen3d.com/): oltre 100 regolazioni di viso/corpo, librerie per capelli, barba/baffi maschili, abiti ed espressioni; rig e compatibilità Rigify. Il processing dichiara bake texture, export e LOD. I capelli sono particelle da convertire in haircards per l'export; la [guida haircards](https://help.humgen3d.com/Process/Haircards) avverte che il risultato automatico varia molto e che la barba in haircards e` di bassa qualità. | **Candidato prioritario, non ancora testato.** È il primo tool verificato che offre le varianti richieste (fisionomie, tagli/colori, barba/baffi) e un flusso di LOD/export. Non contiene un calciatore pronto né un kit football verificato; inoltre una build commerciale richiede la [licenza Commercial](https://help.humgen3d.com/FAQ/Human%2BGenerator%2BAsset%2BLicense). Prima di qualunque acquisto serve un sample reale: conversione haircards, audit GLB, rig/clip, kit e benchmark su telefono. |

### Human Generator — pre-screening 22 settembre 2026

Il prezzo ufficiale della licenza **Commercial** è **$128 una tantum per un utente**; è quella che abilita l'uso in software e videogiochi. La [trial](https://humgen3d.com/trial) non richiede carta ma sblocca soltanto il preset maschile `Caucasian 1` e applica un watermark alle texture. L'ispezione della [tavola ufficiale dei preset salvabili](https://help.humgen3d.com/customhuman) mostra più visi maschili adulti e distinguibili; è prova della capacità del workflow, non dell'inclusione di quei volti nella trial. Il candidato supera il pre-screening economico e di varietà, ma resta **non approvato** finché una prova locale non avrà verificato: export GLB, taglia di texture 1K, haircards visivamente credibili, rig/retarget, kit, palla e prestazioni su telefono.

| **Blender Studio — Free Male Base Mesh** | [Pagina ufficiale](https://studio.blender.org/training/realistic-human-research/use-of-base-meshes/): base maschile realistica Blender, 14,9 MB, CC-BY, distribuita per iniziare sculpting. | **Rifiutata come modello pronto.** La fonte non dichiara rig, capelli modulari, abiti da calcio, LOD né export runtime. È un riferimento libero di topologia/anatomia, non una scorciatoia per Korward. |

### Human Generator — budget LOD verificato

La [guida LOD ufficiale](https://help.humgen3d.com/lod) dichiara tre output: circa **25k facce** a risoluzione originale, **18k facce** con volto ridotto e **5k facce** a un quarto della risoluzione. La preview non processata mostra circa **73.488 triangoli**, quindi non è adottabile per tutti i calciatori. Il processing LOD è un passaggio finale: rompe modifiche successive di volto, altezza, età, espressioni e capelli. Il flusso candidabile è dunque: creare la variazione -> fare bake/haircards -> esportare Hero L0 e squadre a LOD ridotto -> testare. I conteggi effettivi dopo capelli e kit restano da misurare su un asset reale.

### Human Generator — compatibilità da provare, non presunta

Il Blender incluso nel progetto è **4.5.14**. Il [repository pubblico](https://github.com/OliverJPost/HumGen3D) dichiara Blender 3.2 come minimo e la release V4 documenta correzioni per Blender 4.0, ma non offre una certificazione per Blender 4.5. Le issue pubbliche includono difetti su haircards e salvataggio dei gruppi vertice delle acconciature custom. Di conseguenza la prova trial deve essere isolata e non può essere sostituita da una promessa commerciale: il candidato resta non acquistabile finché non crea, processa ed esporta un asset valido nell'ambiente effettivo.

### Human Generator — pacchetto trial

Gli URL pubblicati nella guida ufficiale rispondono correttamente: add-on **5.059.083 byte**, contenuto trial **269.224.756 byte**, entrambi ZIP e modificati il 29 ottobre 2025. Il download completo vale dunque circa 274 MB: è sostenibile per il test, ma non è stato avviato perché l'installazione richiede autorizzazione separata.

| **MB-Lab** | [Repository ufficiale](https://github.com/animate1978/MB-Lab) gratuito e basato su Blender: forme viso/corpo, rig e proxy capelli. | **Rifiutato.** Il repository è archiviato dal 21 luglio 2024; la sua release hair dichiara shader assente e mancanza di shape key, mentre issue ufficiali riportano finalizzazione e capelli problematici già in Blender 4.1. Non è responsabile introdurlo nel Blender 4.5.14 della POC. |

### Distinzione licenza Human Generator

Il [codice dell'add-on](https://github.com/OliverJPost/HumGen3D) è GPL-3.0, ma il repository dichiara esplicitamente che modelli e texture arrivano con l'acquisto e sono sottoposti a licenza royalty-free separata. La [licenza asset](https://help.humgen3d.com/license) permette software e videogiochi soltanto con la tier Commercial e soltanto quando gli asset non siano facilmente estraibili dagli utenti. Human Generator è quindi **software open source con libreria commerciale**, non una sorgente di modelli open source.

### Human Generator — asset trial effettivo verificato staticamente

Il contenuto trial non si limita alle immagini: include `hair/head/Short Side Part.blend`. In Blender 4.5.14, aperto con esecuzione automatica disabilitata, il file espone una base `HG_Body` di 50.568 triangoli e due sistemi di capelli a particelle: `ParticleSettings_HairShort` con 1.000 guide e `ps_ponytail_strands_thin.001` con 100 guide. È quindi un taglio maschile reale e non una finta preview, ma non è un asset runtime: manca ancora la conversione in haircards, l’export, il rig verificato, il kit, il test di dribbling e il controllo mobile. La verifica aumenta l’interesse tecnico del candidato, senza cambiarne lo stato: **non adottabile finché non supera un test isolato completo e non è coperto dalla licenza Commercial per videogiochi**.
- **Precisazione verificata:** `Short Side Part.blend` non contiene un’armatura né shape key facciali; l’unica mesh `HG_Body` ha due gruppi vertice (`hair_scalp_full`, `hair_fade_mid`) usati come supporto ai due sistemi particellari. È materiale sorgente per l’add-on, non un personaggio esportabile da provare direttamente con le clip.

## 2026-09-22 — provino dribbling del rig Human Generator trial

- **Fatto verificato:** la base `HG_HUMAN.blend` inclusa nel trial contiene un rig `HG_Rig` di 102 ossa, 79 gruppi pesati sul corpo e 24 shape key correttive. Confrontata con la clip Korward `dribble`, tutte le 21 ossa centrali necessarie (spina, collo/testa, braccia/mani e gambe/piedi) trovano una corrispondenza; nessuna manca.
- **Fatto verificato:** nel provino locale a 42 frame, mani, piedi, gambe e testa restano sempre con coordinate finite. Le mani percorrono `0,4495 m` e `0,2956 m`; i piedi `0,8387 m` e `0,8107 m`, su corpo alto `1,8004 m`. Il report riproducibile è `humgen-trial-dribble-probe.json`.
- **Limite essenziale:** è una copia di rotazione locale su rig sorgente: non include traslazione radice, palla, kit, conversione haircards, export GLB, review visiva o benchmark mobile. La base nuda pesa già 73.488 triangoli contando corpo, occhi e denti: serve LOD reale prima di qualunque test squadra.
- **Decisione:** Human Generator supera il primo gate strutturale del rig e resta il candidato alternativo più concreto per volti/capelli/barba. Non sostituisce il CGTrader finché non passa i gate completi e la licenza Commercial.
- **Budget mobile verificato:** il contenuto trial include 127 texture per `126.006.024` byte non compressi, fra cui mappe viso 4K da `9.880.081` e `7.545.471` byte e mappe denti 2K. Il sorgente Human Generator non può quindi entrare nel runtime tal quale; può restare candidato solo se la pipeline isolata dimostrerà bake e LOD con texture ridotte.

### Hisenberg `Soccer Player Male - Rigged` — confronto 22 settembre 2026

La nuova scheda dello stesso autore del modello acquistato dichiara modello maschile adulto riggato in FBX/GLB/OBJ/BLEND, `11.816` poligoni e `11.457` vertici, texture PBR da 19,1 MB e licenza Royalty Free senza AI a `$14,27`. La preview mostra kit a righe blu/rosse; non dichiara tagli, colori capelli, barba, morph, LOD o compatibilità con le clip. È un possibile NPC a minore dettaglio, ma **non è un upgrade da acquistare**: il LOD1 derivato dal CGTrader attivo è già misurato a 12.243 triangoli con rig validato e texture 1K. Senza file da audit, un passaggio di dribbling e una review visiva, introdurrebbe un secondo stile e un secondo rig senza risolvere le varianti richieste.

### `Male Soccer Player Character Fully Rigged UE project files` — rifiutato alla preview

La scheda CGTrader del 2 settembre 2026 dichiara FBX/BLEND/progetto Unreal, rig facciale e licenza Royalty Free a `$40` in offerta. Tuttavia non dichiara triangoli, LOD, texture o varianti. La preview pubblica mostra un volto troppo semplificato rispetto al realismo adulto richiesto e una divisa con simboli e branding chiaramente riconoscibili; non è una base neutra da rivestire. **Rifiutato senza acquisto**: prezzo elevato, costo mobile ignoto, estetica non approvabile e nessuna prova della compatibilità delle clip.
- **Export runtime verificato:** il `HG_HUMAN.blend` trial esporta in GLB senza l’add-on: 24.048.528 byte, 4 mesh, 73.488 triangoli, 1 skin da 102 joint, 4 materiali, 7 texture e nessuna animazione incorporata. Il report è `humgen-trial-raw-glb-audit.json`.
- **Gate mobile non superato:** la stessa export conserva una texture 4K e più mappe 2K; le immagini sono 16.723.687 byte codificati ma circa `125.829.120` byte RGBA decodificati. La compatibilità del formato è confermata, l’idoneità mobile no: LOD e riduzione texture restano obbligatori.
- **Confronto diretto verificato:** il GLB CGTrader sorgente misura 34.995 triangoli, 14.309.844 byte e circa 83.886.080 byte RGBA decodificati; l’export Human Generator grezzo misura 73.488 triangoli, 24.048.528 byte e circa 125.829.120 byte RGBA. Prima di kit e capelli, Human Generator è quindi +110% triangoli e +50% memoria texture. Decisione invariata: CGTrader resta base runtime, Human Generator è candidato soltanto come generatore di varianti dopo LOD/bake provati.

## 2026-09-22 — Character Creator 5: candidato tecnico, non acquisto proposto

- **Fatti verificati dalle fonti ufficiali:** Character Creator 5 include morph di volto e corpo, sistema capelli e barba, rig/export FBX, generazione LOD e un Game Base da circa 10.000 poligoni. La pipeline dichiara bake/merge dei materiali fino a una sola texture e LOD multipli per personaggi mobile.
- **Licenza:** la policy corrente indica che gli asset esportabili con licenza Standard possono essere usati in giochi e app. La pagina conserva anche una FAQ con formulazione precedente sulle componenti CC: prima di comprare contenuti aggiuntivi serve quindi controllare la licenza specifica di ogni pacchetto capelli, kit o morph.
- **Costo verificato il 22 settembre:** CC5 Standard e' pubblicato a `$299`, Deluxe a `$479`; un kit da calcio e una libreria capigliature non sono inclusi come prova in questo confronto.
- **Decisione:** e' il candidato tecnicamente piu completo trovato per creare molti adulti credibili con LOD, viso, capelli e barba. Non e' proporzionato al budget attuale e non viene acquistato, installato o adottato. Human Generator trial resta il test pratico a costo gia sostenuto; CGTrader resta la base runtime attiva.

## 2026-09-22 — scan concorrenti: nessun sostituto del CGTrader

- **Stylized Soccer Football Player + 30 Haircuts (CGTrader):** dichiara 30 tagli, rig Mixamo/Blender, materiali modificabili e 87.784 poligoni complessivi. Risolve la quantita' ma e' esplicitamente stilizzato e fuori dal requisito di adulti credibili; il budget geometrico non e' adatto alla rosa mobile. **Rifiutato senza acquisto.**
- **Football Player Parker (CGTrader):** dichiara rig Maya/Blender, controlli facciali e texture 1K/2K, ma 105.366 triangoli. Anche escludendo kit e possibili problemi di licenza, il solo Hero e' oltre tre volte il CGTrader sorgente e richiederebbe un nuovo rig/retarget. **Rifiutato senza acquisto.**
- **African Football Soccer Player Male gratuito (CGTrader):** la pagina dichiara un calciatore generico riggato con 15 animazioni FBX; non pubblica triangoli, LOD, materiali PBR, morph o tagli modulari. Resta l'unico candidato gratuito da sottoporre a file-audit se sara' ottenibile con download autenticato, ma non e' un modello alternativo approvato.
- **Esito:** dopo il confronto, nessun pacchetto pronto acquistabile soddisfa contemporaneamente volto adulto, kit neutro, varianti vere e budget mobile meglio della combinazione corrente: CGTrader come runtime e Human Generator come generatore da provare in isolamento.

## 2026-09-22 — Vitruvian CC0: audit reale, non adatto al runtime

- **Fatto verificato:** il repository open-source Vitruvian distribuisce asset CC0 con volto FACS, corpo Mixamo da 52 joint e haircards riggate. E' una fonte legittima da studiare, senza dipendenza da licenze commerciali.
- **Misura reale:** volto 36.696 triangoli, corpo 106.084, capelli 242.720; la composizione minima e' 385.500 triangoli. Sedici texture fino a 2K corrispondono a circa 193 MiB RGBA decodificati.
- **Decisione:** rifiutato come modello Korward. Manca il kit da calcio, testa/capelli sono componenti separati e il budget e' incompatibile con Hero mobile e squadra. Il gate riproducibile e' `VITRUVIAN_CC0_GATE.md`.

## 2026-09-22 — MHR / Character Factory: rig promettente, generazione non eseguibile

- **Fatto verificato:** gli FBX Apache-2.0 MHR includono LOD da 147.274 a 1.186 triangoli. LOD3 ha 9.794 triangoli e 126 ossa; il provino dribbling trova 21/21 ossa e non produce coordinate non finite.
- **Blocco tecnico verificato:** Character Factory richiede GPU NVIDIA con 12 GB VRAM raccomandati e 36,4 GB di pesi. Il PC espone Intel UHD 620 con 1 GB e nessuna GPU NVIDIA; non viene installato nulla.
- **Decisione:** non e' una base pronta: manca un GLB generato con volto/kit/capelli, non include barba/baffi e non e' eseguibile qui. Resta possibile solo su un host GPU idoneo. Gate: `MHR_CHARACTER_FACTORY_GATE.md`.
