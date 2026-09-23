# Roadmap POC — Korward Elite · personaggi CGTrader e motore unico

**Aggiornata:** 23/09 18:43 (ora di Roma) · **Ramo:** `poc/marioprada-character-system` · **`main`/GitHub Pages:** intatti (`2b04fb5`)
**Preview del POC:** https://korward-poc-cgtrader.netlify.app · **Storico completo con tutte le misure:** [POC_STORICO.md](POC_STORICO.md)
**Stato stimato:** 68% · **Fase:** highlight guidati dal motore unico («brain») — direttiva PO 23/09

## Dove siamo

| Cantiere | Stato | Cosa manca |
| --- | --- | --- |
| Personaggi CGTrader (modello, LOD, kit) | ✅ **default degli highlight** (CH38 0 corpi) · nel banco: kit corretto nei file, portiere LOD1 nella presa, 64,6k triangoli | prova sul telefono |
| Gesti negli highlight | ✅ presa, dribbling, passaggio, tiro misurati · eroe taglia 0,18 · **tuffo e respinta del portiere CGTrader montati** | parata del brain non ancora vista in scena |
| **Brain → scena (B0)** | ✅ scene nate dal motore **26 su 26** (6 partite) | la «catena» ora eredita l'evento del brain, ma non è mai comparsa: **non misurata** |
| **Brain → attori (B4)** | 🟡 ricevente **3 su 5** · difensore **4 su 6** · portiere 6 su 6 (mediane 0 u) | ricevente di cross e consegne · 2 difensori ancora scelti dal 3D |
| **Brain muove i 22 in scena (B3)** | ✅ scene offensive: 26 passi del brain, 0 del vecchio · determinismo 100% | piazzati e scene difensive ancora al vecchio scrittore |
| **Esito deciso dal brain (B2)** | ✅ **10 su 10** esiti col dado del brain (rosso 0/13) · eventi veri col cast · tabellone = motore | il 3D non legge ancora quegli eventi |
| **Gesti in scena dal brain** | ✅ coerenza 83-97% (base 36%) · **gesti nuovi**: reazione al tiro sbagliato, portiere in attesa, rilancio, contrasto in piedi/scivolata · CGTrader: coerenza e copertura 84% | rilancio non ancora visto · tiro del compagno |
| **3D dal brain (B3)** | 🟡 il **gol va dove lo decide il brain**: scarto alla linea 0,07-0,39 (rosso 2,8-9,1) | parata non verificata · palo/fuori/murato ancora geometrici · gesti in scena |
| Tabellino = motore | ✅ gol del compagno e gol «persi» corretti | |
| **Figurine** | ✅ **1000 volti nel gioco**: figurina Korward 5:7, volto dell'eroe scelto e salvato, volti stabili per tutti, una faccia per persona in scena | telefono · volti femminili assenti nel catalogo (giornaliste senza volto) |
| Telefono | ❌ non provato | FPS (misure passate 11-16), kit, gesti |

## Piano (carta bianca del PO sulle situazioni, 23/09)
1. ✅ Il brain apre la scena, con tipo di occasione e cast.
2. ✅ **Il brain risolve la scelta dell'eroe**: dado dentro il motore (stessa probabilità di oggi), catena di eventi con gli attori veri, tabellino aggiornato dal motore (addio ponte `registra`).
3. 🟡 Il 3D mostra solo quegli eventi (coerenza 97%, copertura 58%): gesti per indice, esito e attori dal brain.
4. 🟡 Scena coerente con l'occasione del brain: **9/9** (rosso 4/8); tipi più vari (spalle + fra le linee). Mancano conclusione e fascia. Opzioni: già 3 per scheda.
5. ✅ Il seguito della catena lo decide il brain (dado del motore, fatto `seguito`).
6. 🟡 **CH38 via**: highlight già CGTrader senza parametri (0 corpi CH38). Mancano cerimonie, ritratto 3D dei menu e il download dei file CH38.
7. 🟡 **Clip nuove, contro la ripetizione**: 54 clip Mixamo dalla cartella Drive del PO riadattate (cancello 54/54), in gioco come varianti di tuffo (lato scelto dalla palla), respinta, presa alta, rinvio, lancio, portiere in attesa, scivolata. Tiro: varianti revocate (contatto peggiore). Prossimi: contatto misurato per testa/controllo/rigore/rimessa/rovesciata, tiro specchiato (destro), nuovi gesti (sgambetto, palleggio, portiere che dirige), CMU.

## Da decidere o guardare tu
- **Catene:** tenute come valore aggiunto; il seguito ora lo sceglie il brain. Se preferisci spegnerle, è un interruttore.
- Testo «Para in tuffo» mentre il gesto è una presa alta.
- Dopo un gol la regia si allarga di colpo (camera a ~44 u): anche in produzione.
- La lavagna 2D non si specchia nel secondo tempo, la barra sì.
- Diritti dei ritratti AI: non verificabili da me.

## Registro (ultimo in alto, una riga per passo)
| Ora | Passo | Numero |
| --- | --- | --- |
| 23/09 18:43 | Tiro specchiato (destro) calcolato al caricamento dalla clip storica: variante del tiro senza toccare la sincronia | autoverifica piedi 5 mm · piede-palla 0,34 m (storico 0,21-0,45) · rosso __CPM_NO_SPECCHIO23 |
| 23/09 18:33 | Clip Mixamo del PO (Drive): 54 riadattate su CGTrader in un file unico (3,0 MB); varianti per portiere e contrasti; lato del tuffo dalla palla | cancello anatomico 54/54 · tuffo dal lato giusto 3/3 (rosso 2/3) · varianti del tiro REVOCATE (piede-palla 0,83 m contro 0,21-0,45) · career-critical verde |
| 23/09 17:45 | Anteprima Netlify: la pagina principale è il gioco, niente reindirizzamenti (pretty URL spenti) | / e /CARRIER-MANAGER-AV.html 200, identici al build + solo lo script HUD di Netlify (184 byte) |
| 23/09 17:43 | CH38 sparisce dagli highlight: CGTrader è il default senza parametri (rosso __CPM_NO_CGDEFAULT / ?hyperCharacter=off) | corpi CH38 disegnati 0/5 (rosso 39/39); career-critical verde; restano CH38 in cerimonie, ritratto 3D menu e download di footballer/korward-regular |
| 23/09 17:28 | B3: il brain muove i 22 nelle scene offensive (funzione pura della scena) | determinismo 100% (v1 36%) · ammucchiata 0,9 contro 0,71 |
| 23/09 16:39 | Gesti evoluti dichiarati dal brain: rammarico, portiere in attesa, rilancio, contrasto in piedi/scivolata | CGTrader: coerenza e copertura 16/19 (84%) |
| 23/09 16:31 | Punto 4: l'eroe si posiziona per l'occasione chiesta (parziale) | spalle ottenuta 2/2; conclusione/fascia ancora no |
| 23/09 16:06 | Guardiani del motore rigiocati: match-sequence (tetto 110 s), event-ledger (2 partite) | sequenza identica 100% fra le velocità · gol libro mastro = tabellone 2/2 |
| 23/09 15:33 | Punto 5: il seguito della catena lo sceglie il brain | sorteggio libero → dado del motore; «Mischia in area» registrata |
| 23/09 15:30 | Punto 4: scheda coerente con l'occasione del brain, tipo di occasione chiesto al brain | coerenti 9/9 (rosso 4/8); tipi: spalle 4 · fra le linee 5 |
| 23/09 15:08 | Punto 3, secondo giro: difensore del brain primo pressore, clip tackle sull'intervento | coerenza 83-97% su 3 campioni; murato 0/2 → 2/2 |
| 23/09 14:41 | Punto 3: eventi del brain secondo il gesto scelto; attori della scena dal cast | gesti in scena nominati dal brain 5/14 → 32/33 |
| 23/09 13:53 | Preview Netlify aggiornata (figurine, tuffo, brain) | file online identici al repo |
| 23/09 13:52 | Figurine collegate: indice leggero, assegnazione stabile, scelta del volto, regola di scena | 7-9 ritratti scaricati a sessione; eroe stabile; 0 collisioni col volto dell'eroe |
| 23/09 13:27 | Tuffo e respinta riadattati sullo scheletro CGTrader (Blender nel container) | cancello anatomico 3,1°/2,7° · tuffo in scena 96-100 fotogrammi, rosso 0 |
| 23/09 13:09 | B3: bersaglio del tiro dichiarato dal brain (non più `Math.random`) | scarto 0,07-0,39 contro 2,8-9,1 |
| 23/09 12:59 | B2: il brain tira il dado della scelta ed emette la catena di eventi (addio ponte) | esiti dal brain 0/13 → 10/10; tabellone = motore |
| 23/09 12:40 | B0: la catena eredita l'evento del brain · 6 partite di verifica | 26/26 scene dal brain; catena non osservata |
| 23/09 12:13 | B4: difensore della scena dal brain (4 punti del 3D) | 0/5 → 4/6, mediana 15,9 → 0 u (rosso 2/6, 12,9 u) |
| 23/09 | Roadmap divisa: questa pagina corta + storico | 1.696 righe → storico |
| 23/09 | B4: cast della scena dichiarato dal brain, passaggio al suo ricevente | ricevente 0/4 → 3/5 (rosso 1/2) |
| 23/09 | B0: «si continua» passa dal brain | scene dal brain 6/8 (rosso) → 8/8 |
| 23/09 | B0: base misurata (sonda corretta) | 5 su 7 |
| 23/09 | Impianto brain→3D (coda eventi, tabella gesti) | nessun effetto visibile: 3D sospeso nel gioco vivo |
| 23/09 | Preview Netlify aggiornata e verificata | file identici al repo |
| 23/09 | Materiali CGTrader corretti nei file GLB | trasparenti 35/35 → 0/35 |
| 23/09 | Portiere LOD1 nella presa | +8.002 triangoli, presa invariata |
| 23/09 | Taglia eroe 0,18 (solo review CGTrader) | gesto 0,08-0,11 contro 0,07-0,09 |
| 23/09 | Tabellino coerente col motore | 2-1 contro 2-2 → 2-2 = 2-2 |
