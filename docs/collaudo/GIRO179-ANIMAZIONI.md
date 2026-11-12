# Giro 179 — Animazioni 3D con licenza libera per i gesti mancanti (PO-367)

**Solo ricerca.** Nessuna modifica a `src/` né ad `assets/`, nessun file aggiunto al gioco, `GAME_VERSION` non toccata.
Ramo `collaudo/giro179-animazioni`, partito da `lavoro/191`. Licenze lette alla fonte il **12/11/2026**.
Decisione PO di riferimento: «Cerca e proponi» — nulla entra nel gioco senza il sì del PO.

Legenda: **verificato** = letto alla fonte o misurato sui file in questo giro · **stimato** = mio giudizio, da confermare.
Dove non ho potuto confermare scrivo «Non posso confermarlo».

---

## 1. Tabella per il PO

Righe = i sei gesti mancanti della tabella §1 del rapporto 170b (righe 5, 9, 11, 12, 13, 16).
«Sicura» vuol dire: la licenza letta alla fonte permette **uso commerciale** e **file nel repository pubblico** senza dubbi.
Il costo è in giri ed è **sempre una stima**.

| Gesto (riga 170b) | Candidata | Fonte | Licenza in parole semplici | Sicura? | Costo (stima) |
|---|---|---|---|---|---|
| **9 · Tiro di collo distinto dal piatto** | «08_Side_Foot_Kick» (piatto) + «09_Power_Kick» (collo); di riserva «10/11_Penalty_Kick» | Anderson Rohr, *Free mocap pack 05: Soccer* (Gumroad) | Gratis, uso commerciale sì, credito non richiesto; **vietato ridistribuire il pacchetto «as a standalone product»** | **Da verificare** (vedi §3.2: i GLB nel repo pubblico si scaricano da soli) | 1 giro una tantum per lo scheletro UE5 + 1 giro per il gesto |
| 9 · idem | CMU soggetti 10 e 11, «soccer - kick ball» (6 prove, destro, con rincorsa) | CMU Graphics Lab Motion Capture Database | Libera per ogni uso, copia/modifica/ridistribuzione senza permesso; **vietato rivendere i dati**, anche convertiti | **Sì** | 1 giro una tantum (scheletro CMU) + 1-2 giri (dati vecchi, rincorsa da tagliare, tipo di calcio non dichiarato) |
| 9 · idem | `mx-kick-soccerball` e `-2` (già nel repo, oggi solo in tabella contatti) | Mixamo, già in `assets/cgtrader-clip-mixamo.glb` | Già registrata (Mixamo, rischio repo pubblico accettato dal PO il 27/09) | Come oggi | 1 giro (nessun file nuovo) — se a occhio distinguono piatto e collo: Non posso confermarlo |
| **13 · Varietà di esultanze** | «12/13/14_Goal_Celebration_01..03» | Anderson Rohr, pack 05 Soccer | come sopra | **Da verificare** | 1 giro per lo scheletro (in comune con la riga 9) + 1 giro per tre esultanze |
| 13 · idem | «05_Fist_Up_Cheering», «17_Pointing_Up_Cheering», «03_Clapping_Hands_Up» | Anderson Rohr, *Free mocap pack 04: Crowd Reactions* | come sopra (stessa licenza, letta su quella pagina) | **Da verificare** | come sopra; sono gesti da pubblico, adatti come esultanza «sobria» (stima) |
| 13 · idem | emote della *Universal Animation Library* | Quaternius | **CC0**: nessuna condizione | **Sì** | Non posso confermarlo che contenga un'esultanza adatta (la pagina non elenca le clip); 1 giro scheletro + 1 giro |
| **12 · Intercetto e blocco col corpo** | «18_Defending_01», «19_Defending_02» | Anderson Rohr, pack 05 Soccer | come sopra | **Da verificare** | Non posso confermarlo che contengano un blocco: la pagina dà solo il nome. 1 giro dopo la riga 9 |
| 12 · idem | `mx-goalkeeper-body-block` (già nel repo, **mai usata**) | Mixamo, già nel repo | già registrata | Come oggi | 1 giro. Misurato: il bacino scende da 95 a 12 cm e si sposta di 1,4 m di lato = chiusura a terra del portiere; per un difensore è da provare (le mani potrebbero stonare) |
| **5 · Tiro al volo laterale** | **Nessuna candidata con licenza libera trovata** | — | — | — | Strade nel §4 |
| **11 · Colpo di testa in tuffo** | **Nessuna candidata con licenza libera trovata** | — | — | — | Le clip «Soccer Header» CC BY su Sketchfab sono **sconsigliate** (§3.6). `mx-header-soccerball(-2)` nel repo: misurato, bacino fra 80 e 97 cm = colpo **da fermo**, non in tuffo |
| **16 · Controllo di petto** | **Nessuna candidata con licenza libera trovata** | — | — | — | «04-06_Juggling» (pack 05) sono palleggi: se c'è il petto, Non posso confermarlo |

**In sintesi.** Una fonte gratuita copre bene **tiro (piatto/collo)** ed **esultanze** ed è calcistica e moderna
(Anderson Rohr, 60 fps, scheletro UE5 vicino al nostro), ma la sua licenza vieta la ridistribuzione «a sé» e
quindi, con il repository pubblico, è **da verificare** — lo stesso rischio già accettato per CGTrader e Mixamo,
ma su una fonte nuova la decisione è del PO. L'unica fonte **sicura** con calci di calcio è il database CMU,
dati di inizio anni 2000 (stima) con rincorsa e senza pallone. Per **volée laterale, testa in tuffo e controllo di petto** non
ho trovato **nessuna** animazione con licenza libera.

**Anteprime.** Nessuna immagine delle pagine delle fonti è stata salvata: nessuna delle pagine dichiara una
licenza per le proprie immagini (Gumroad, Sketchfab) o la dichiara solo per i dati (CMU). L'unica anteprima
nel repo è un **disegno nostro** fatto dai dati CMU, che la licenza CMU permette di copiare e modificare:
`docs/collaudo/giro179/cmu-calci-provino.png` (§5).

---

## 2. Come sono fatti i corpi oggi (verificato sui file)

Letto con uno script che apre la parte JSON dei GLB (nessuna libreria nuova).

| File | Cosa contiene |
|---|---|
| `assets/cgtrader-review-lod{0,1,2}-kit-adapter.glb` (17,2 / 7,3 / 4,3 MB) | il corpo degli highlight: **1 scheletro, 75 ossa, nomi stile Unreal Mannequin UE4** (`ik_foot_root`, `ik_hand_gun`, `pelvis`, `spine_01..03`, `neck_01`, `head`, `thigh_l`, `calf_l`, `foot_l`, `ball_l`, dita, ossa di torsione) + 33 clip |
| `assets/cgtrader-clip-mixamo.glb` (3,0 MB) | 54 clip Mixamo **già riadattate** sullo scheletro CGTrader, 30 fps (es. `mx-fallen-idle` 1,33 s = 40 chiavi) |
| `assets/cgtrader-clip-po.glb` (654 KB, 6 clip) e `cgtrader-clip-po2.glb` (188 KB, 2 clip) | clip Mixamo portate dal PO, solo animazione (nessun corpo): **~95-110 KB per clip** |
| `assets/korward-regular-player*.glb` + `korward-regular-anims/` | corpo «Regular» (Mixamo): 65 ossa, anche lui con nomi UE (`root`, `pelvis`, `spine_01..03`, `neck_01`, `Head`); una clip = 70-270 KB |

Licenze registrate oggi (da `docs/governo/CREDITI-fonti.md` e `tests/character-lab/CLIP_REGISTRY.md`): corpo e 33
clip **CGTrader** «Royalty Free» (ordine del PO del 20/09); clip **Mixamo** «royalty free … including creating
video games» (FAQ Adobe); per entrambe il registro scrive il **rischio aperto del repository pubblico** («entrambe le
licenze vietano la distribuzione dei file grezzi»), con decisione PO 27/09 «Lascia com'è». Le licenze audio sono
registrate file per file in `assets/audio/LICENZE.json` (autore, pagina, file, licenza, data di lettura, sha256):
è il modello che propongo di usare per ogni clip che entrerà (§6).

**Cosa serve perché una clip nuova sia usabile** (dal registro clip e da `tools/retarget_cgtrader_clip.py`):
1. **Scheletro.** Lo strumento di riadattamento esistente mappa i **nomi Mixamo** (`Hips`, `Spine`, `LeftUpLeg`…)
   sulle ossa CGTrader, con un cancello anatomico (mediana ≤ 10°, massimo ≤ 30°). Una sorgente con nomi
   Mixamo entra così com'è; una sorgente **UE5 Manny** (5 vertebre `spine_01..05`, `neck_01..02`) o **CMU**
   (`lfemur`, `ltibia`, `thorax`…) vuole una tabella di mappatura in più (stima: 1 giro una tantum per scheletro).
2. **Formato.** FBX o BVH in ingresso → Blender (`bpy`) → GLB. ⚠️ In questa sessione `bpy` **non è installato**:
   il riadattamento si fa dove c'è Blender, come nei giri precedenti.
3. **fps.** Le clip nel gioco sono a 30 fps. Anderson Rohr è a 60 fps, CMU a 120 fps: si ricampiona.
4. **Sul posto.** Le clip con rincorsa (CMU, i rigori) vanno ritagliate o portate «in place» (bacino fermo in pianta),
   come fatto per `mx-ruleta`.
5. **Peso.** Misurato sulle clip già convertite: 95-110 KB per clip in GLB solo-animazione. Stima per 6-8 clip
   nuove: **0,6-0,9 MB** in più (i pacchetti sorgente invece pesano molto di più, es. 130 MB il pack 05, ma non
   entrano nel repo).
6. **Il resto del rito** (registro clip): cancello anatomico, provino, riga in `GESTI`/`BRAIN_GESTI`, tabella del
   contatto, guardiano e flag rosso `__CPM_NO_*`.

---

## 3. Le fonti, una per una

### 3.1 CMU Graphics Lab Motion Capture Database — **SICURA**
- URL: <http://mocap.cs.cmu.edu/> · FAQ <http://mocap.cs.cmu.edu/faqs.php> (letti il 12/11 con `curl`; l'HTTPS del sito ha un certificato che il proxy non accetta, ho letto in HTTP).
- Testo letto alla fonte:
  - home: «This dataset of motions is free for all uses.» e «This data is free for use in research projects. You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form.»
  - FAQ: «The motion capture data may be copied, modified, or redistributed without permission.»
  - Attribuzione: **non obbligatoria**; il sito chiede, solo per chi **pubblica risultati**, di citare «The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.» Propongo di metterla comunque nei Crediti (cortesia, costo zero).
  - Divieto: rivendere i dati, anche convertiti. Un gioco che li **include** è esplicitamente permesso; tenerli nel repo pubblico è «redistribuzione» gratuita, permessa dalla FAQ.
- Cosa c'è di calcio (ricerca nel database, verificata): soggetto **10** (prove 1, 2, 3, 5, 6) e soggetto **11** (prova 1), tutte «soccer - kick ball». Ricerche «header», «chest», «celebrat», «cheer», «tackle», «slide», «dive» (in senso calcistico): **nessun risultato utile**.
- Formato: ASF/AMC a **120 fps**, scheletro CMU (31 segmenti). Download senza login (verificato: 6 file AMC + 2 ASF scaricati in scratchpad, **non** nel repo; sha256 in §5).
- Compatibilità: bassa senza lavoro — scheletro diverso, rincorsa, nessun pallone, tipo di calcio (piatto/collo) **non dichiarato**. Dal disegno (§5) sembrano calci di collo con rincorsa: **stima**.
- Rischio: licenza nessuno. Qualità: dati vecchi (sessioni dei primi anni 2000, stima), possibili tremolii.

### 3.2 Anderson Rohr, «Free mocap pack 05: Soccer» (Gumroad) — **DA VERIFICARE**
- URL: <https://andersonrohr.gumroad.com/l/mocap_pack5> (letta il 12/11).
- Testo letto alla fonte, sezione «Licensing»: «This pack can be used for free in both personal and commercial projects. Attribution is not required, but feel free to tag me (…). **You may not redistribute, resell, or repackage this pack as a standalone product.**» Descrizione: «You can use it in your games, cinematics, 3D/VFX, or any other creative work.»
- Dati tecnici (dalla pagina): 21 animazioni, 5 min 55 s, **FBX**, scheletri **Rokoko Default, iClone, Manny (UE5)**, **60 fps**, 130 MB, prezzo «$0+».
- Clip (dalla pagina): 01-03 Dribble · 04-06 Juggling · 07 Throw_In · **08 Side_Foot_Kick · 09 Power_Kick** · 10-11 Penalty_Kick · **12-14 Goal_Celebration** · 15-17 Goalkeeper_Save · **18-19 Defending** · 20 Yellow_Card · 21 Yellow_And_Red_Card.
- Perché «da verificare» e non «sì»: il divieto riguarda la ridistribuzione **del pacchetto come prodotto a sé**. Due clip convertite dentro un GLB del gioco non sono il pacchetto; però, con il repository **pubblico**, quel GLB si scarica da solo da `raw.githubusercontent.com`. Se questo sia «redistribute … as a standalone product»: **Non posso confermarlo**. È lo stesso tipo di rischio già registrato per CGTrader e Mixamo; per una fonte nuova serve la decisione del PO (o una domanda scritta all'autore: decisione del PO, io non ho scritto a nessuno).
- Download: si passa dal carrello Gumroad con prezzo 0 e richiede almeno un indirizzo email al checkout (stima, dal flusso Gumroad); **non l'ho fatto** (regola: niente account né termini a nome del PO). Quindi i file **non li ho visti**: durata reale, piede, qualità sono **Non posso confermarlo**.
- Compatibilità: lo scheletro UE5 Manny ha gli stessi nomi di base del nostro (`pelvis`, `thigh_l`, `calf_l`, `foot_l`, `ball_l`, `clavicle_l`, `upperarm_l`…) ma 5 vertebre e 2 ossa del collo contro 3 e 1: serve la mappatura (stima: 1 giro una tantum, poi vale anche per tutte le altre clip della stessa fonte).
- Anteprime: la pagina ha 3 immagini e 1 video di copertina; nessuna licenza dichiarata per le immagini → **solo link**.

### 3.3 Anderson Rohr, «Free mocap pack 04: Crowd Reactions» — **DA VERIFICARE**
- URL: <https://andersonrohr.gumroad.com/l/mocap_pack4> (letta il 12/11). Stessa sezione «Licensing», parola per parola uguale al pack 05.
- Clip utili come esultanza: 03 Clapping_Hands_Up · 05 Fist_Up_Cheering · 15 Clap_Twice_Hand_Up · 17 Pointing_Up_Cheering. Sono gesti da tifoso: come esultanza del calciatore vanno provate (stima).
- Gli altri pack della stessa serie (01-03, 06-08) non hanno gesti calcistici; i numeri 09-14 non esistono (404).

### 3.4 Quaternius, Universal Animation Library 1 e 2 — **SICURA ma senza calcio**
- URL: <https://quaternius.com/packs/universalanimationlibrary.html>, <https://quaternius.com/packs/universalanimationlibrary2.html> (lette il 12/11).
- Licenza alla fonte: «Free to use in personal, educational and commercial projects. (CC0 License)». La pagina dello store Godot riporta «CC0 1.0 Universal».
- Contenuto: 120+ e 130+ clip su un «universal humanoid rig», FBX/GLB/Blend; categorie: locomozione, sprint, combattimento, parkour, emote. Le parole kick, soccer, header, celebrate, cheer, dive, block **non compaiono** nelle pagine; l'elenco delle clip sta in un visualizzatore che non sono riuscito a leggere. Quindi: **Non posso confermarlo** che ci sia un gesto utile.
- La versione gratuita è il 60-70% del pacchetto; il resto è a pagamento («pay what you want» oltre una soglia).

### 3.5 KinemIQ (aggregatore) — **non proposta**
- URL: <https://kinemiq.app/free-game-animations/> (letta il 12/11). Ridistribuisce Quaternius (CC0), 100STYLE (CC BY 4.0) e ACCAD (CC BY 3.0). **Dal secondo export serve un account**: escluso dalle regole del giro. Calcio: non risulta.

### 3.6 Sketchfab, modelli animati «CC Attribution» — **SCONSIGLIATI**
- Ricerca con l'API pubblica di Sketchfab (senza login) su «soccer animation», «header soccer», «goal celebration», solo modelli scaricabili e animati: **zero risultati CC0**; con CC BY, fra gli altri: «Soccer Header» (001Cool_Beans100, 25/09/2026), «Header trap Soccer» e «Strike Foward soccer animation» (ayoubboulehmi67, 01/2026), «Animation_ Soccer Spin, Soccer Pass» (yifangmen, 2023), «Tyler Bowman Soccer Header Victory» (acharlie2019, 2022).
- Perché sconsigliati: i nomi coincidono con quelli delle clip **Mixamo**, compreso l'errore di battitura «Strike **Foward**» che ritroviamo identico nella nostra `mx-strike-foward-jog` (presa da Mixamo). Chi carica una clip Mixamo non può rilicenziarla in CC BY: la licenza dichiarata su quelle pagine **non è affidabile**. Rischio alto, nessun vantaggio rispetto a scaricarle da Mixamo come già facciamo.

### 3.7 Fonti escluse, con il motivo letto alla fonte
| Fonte | Motivo |
|---|---|
| Bandai Namco Research Motiondataset (<https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset>) | licenza **CC BY-NC 4.0**: non commerciale |
| ACCAD Open Motion Project (<https://accad.osu.edu/research/motion-lab/mocap-system-and-data>) | CC BY 3.0, ma niente calcio (solo calci di arti marziali e corse) |
| Rokoko «12 free sports animations» (<https://rokoko.com/resources/rokoko-mocap-12-free-sports-animations>) | si scarica solo compilando un modulo con email e consenso marketing; elenco clip non pubblicato; nessun testo di licenza sulla ridistribuzione |
| mocapflow «Free-Mocap-Library» (GitHub) | il repo non contiene i file (download dietro pubblicità sul loro sito); la licenza è incoerente (CC0 nel file LICENSE, CC BY 4.0 nel badge); niente calcio nelle categorie; origine dei dati non dichiarata |
| Fab / Unreal Marketplace (pacchetti di esultanze e calcio) | a pagamento; il riassunto della licenza vieta di «redistribute the asset … on a standalone basis» (<https://www.fab.com/eula>, letto il 12/11: è il riassunto, non l'EULA completa) |
| CGTrader, RenderHub, Unity Asset Store (pacchetti calcio) | a pagamento, licenze proprietarie: fuori dal mandato «licenza libera» |

---

## 4. I tre gesti senza candidata libera — strade possibili (per la sessione madre)

Per **volée laterale (5)**, **testa in tuffo (11)** e **controllo di petto (16)** non esiste, fra quanto ho trovato,
un'animazione gratuita con licenza chiara. Le strade, nessuna decisa:

1. **Mixamo dal profilo del PO**, come per «Victory» e «Ruleta»: licenza già registrata, rischio repo pubblico già
   accettato, riadattamento già pronto (nomi Mixamo). Il registro clip elenca già le parole da cercare («Diving
   Header», «Chest Trap», ecc.). Che queste clip esistano su Mixamo con quel nome: **Non posso confermarlo** (il
   catalogo si vede solo con login, che non ho fatto). Costo stimato: 1 giro per gesto dopo il download del PO.
2. **Cattura in proprio** con un sistema open source senza marcatori, per esempio FreeMoCap
   (<https://github.com/freemocap/freemocap>, software **AGPL-3.0**, verificato dal file LICENSE). I movimenti
   registrati sarebbero nostri; che la AGPL del programma non si estenda ai dati prodotti è la lettura comune ma
   **Non posso confermarlo**. Costo stimato alto (3-5 giri: riprese, pulizia, riadattamento).
3. **Codice**: per la volée la 170b dice che metà del difetto è il sollevamento del corpo nel codice; una posa
   procedurale sopra la clip `volley` esistente è una via senza file nuovi (stima 2 giri, come già scritto lì).

---

## 5. Anteprima prodotta in questo giro

`docs/collaudo/giro179/cmu-calci-provino.png` — le 6 prove CMU di calcio, 10 istanti attorno al picco di velocità
del piede, figura a bastoncini vista di lato (rosso = lato destro, blu = sinistro). **Non è il corpo di gioco** e la
vista è approssimata: serve solo a vedere che tipo di calcio è. Disegnato da me dai file originali con
`docs/collaudo/giro179/strumenti/` (`amc_svg.py` + `auto.py` per il disegno, `shot2.cjs` per l'immagine).

Misurato sul disegno/dati: in tutte e 6 le prove calcia il **destro**; durate 3,0-6,7 s con rincorsa; il picco del
piede cade a 1,2-5,0 s dall'inizio.

File sorgente (scaricati in scratchpad, **non** nel repo), sha256:
```
10.asf    d4e604fd582403e9f4bca3382e74dd0cc01e15cd712255e7bd34863b922b6200
11.asf    9ef0d3fbc731fe4baa376d50ab22f3c2c29486aa30eb3d0ec1764654aa879a6f
10_01.amc 4277e748947e8703825f340f94582f48997ca01b308f2447075eab4c42029e84
10_02.amc 68d08f7b47bca54e1fd9ca1739533f8dc973e1200a93c1f4471891a266769d53
10_03.amc ffc0f091c8eeb3392797933e23612540a711a07f9a7a49d62c7d1c6d0128a290
10_05.amc e0d9f9c3fd5856325f4ac3aed71d24886ffad27adeed03887b006dfac49b7c38
10_06.amc f1d5332d88cf419d3edae357886f59eb6345a577da1fc2846a04fb6afcd20e75
11_01.amc 326e635daf89bc8e33511f0b3768d9864da9e51d1bfab1ff97ad01993a5b25fd
```

Misure sulle clip Mixamo **già nel repo** (bacino, traslazione in cm, dai GLB):

| Clip | Durata | Altezza bacino | Spostamento | Lettura |
|---|---|---|---|---|
| `mx-header-soccerball` | 1,93 s | 86-98 cm | < 7 cm | testa da fermo |
| `mx-header-soccerball-2` | 4,20 s | 80-95 cm | < 13 cm | testa da fermo, più lunga |
| `mx-goalkeeper-body-block` (mai usata) | 2,67 s | 12-95 cm | 1,4 m di lato | chiusura a terra |
| `mx-kick-soccerball` / `-2` | 0,60 / 0,53 s | 88-95 cm | < 8 cm | calcio sul posto (sinistro / destro, da `_PIEDE_CLIP31`) |
| `mx-soccer-penalty-kick` | 1,53 s | 89-105 cm | 3,6 m in avanti | rigore con rincorsa |

---

## 6. Se il PO dice sì: come registrare la licenza (proposta)

Sul modello di `assets/audio/LICENZE.json`, un registro `assets/LICENZE-ANIMAZIONI.json` (nome da decidere) con,
per ogni clip: nome interno, file di gioco, fonte (pagina + nome del file sorgente), autore, licenza con la frase
citata, data di lettura, sha256 del file sorgente, trasformazioni (riadattamento, taglio, fps). Più una riga in
`docs/governo/CREDITI-fonti.md` e in `tests/character-lab/CLIP_REGISTRY.md`. Per CMU, la frase di ringraziamento
del §3.1 nei Crediti.

## 7. Scelte che restano alla sessione madre / al PO
1. Anderson Rohr (pack 04/05): accettare il rischio «standalone» col repository pubblico, chiedere per iscritto all'autore, o rinunciare.
2. CMU per il tiro di collo: vale il lavoro di un nuovo scheletro su dati vecchi, o meglio aspettare la decisione sul punto 1?
3. Volée laterale, testa in tuffo, controllo di petto: Mixamo dal profilo del PO, cattura in proprio, o codice.
4. Provare prima, senza file nuovi, le clip Mixamo già nel repo e mai usate (`mx-goalkeeper-body-block` per il blocco, `mx-kick-soccerball(-2)` per il piatto).

## Fonti consultate (12/11/2026)
- <http://mocap.cs.cmu.edu/> · <http://mocap.cs.cmu.edu/faqs.php> · ricerca `search.php` (soccer, kick, head, jump, dive, cheer, celebrat, chest, block, tackle, slide, punch, fall)
- <https://andersonrohr.gumroad.com/l/mocap_pack5> · <https://andersonrohr.gumroad.com/l/mocap_pack4> · pack 1-3, 6-8 (stessa licenza; 9-14 inesistenti)
- <https://quaternius.com/packs/universalanimationlibrary.html> · <https://quaternius.com/packs/universalanimationlibrary2.html> · <https://store.godotengine.org/asset/quaternius/universal-animation-library/>
- <https://kinemiq.app/free-game-animations/>
- API pubblica Sketchfab `api.sketchfab.com/v3/search` e `/v3/models/{uid}`
- <https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset> · <https://accad.osu.edu/research/motion-lab/mocap-system-and-data> · <https://rokoko.com/resources/rokoko-mocap-12-free-sports-animations> · <https://github.com/mocapflow/Free-Mocap-Library-FBX-GLB> · <https://www.fab.com/eula> · <https://github.com/freemocap/freemocap>
- Interni: `docs/collaudo/GIRO170B-GESTI.md` (ramo `collaudo/giro170b-gesti-highlight`), `docs/governo/CREDITI-fonti.md`, `assets/audio/LICENZE.json`, `tests/character-lab/CLIP_REGISTRY.md`, `tools/retarget_cgtrader_clip.py`
