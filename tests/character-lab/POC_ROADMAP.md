# Roadmap POC — Korward Elite · personaggi CGTrader e motore unico

**Aggiornata:** 23/09 13:53 (ora di Roma) · **Ramo:** `poc/marioprada-character-system` · **`main`/GitHub Pages:** intatti (`2b04fb5`)
**Preview del POC:** https://korward-poc-cgtrader.netlify.app · **Storico completo con tutte le misure:** [POC_STORICO.md](POC_STORICO.md)
**Stato stimato:** 68% · **Fase:** highlight guidati dal motore unico («brain») — direttiva PO 23/09

## Dove siamo

| Cantiere | Stato | Cosa manca |
| --- | --- | --- |
| Personaggi CGTrader (modello, LOD, kit) | ✅ nel banco: kit corretto nei file, portiere LOD1 nella presa, 64,6k triangoli | prova sul telefono |
| Gesti negli highlight | ✅ presa, dribbling, passaggio, tiro misurati · eroe taglia 0,18 · **tuffo e respinta del portiere CGTrader montati** | parata del brain non ancora vista in scena |
| **Brain → scena (B0)** | ✅ scene nate dal motore **26 su 26** (6 partite) | la «catena» ora eredita l'evento del brain, ma non è mai comparsa: **non misurata** |
| **Brain → attori (B4)** | 🟡 ricevente **3 su 5** · difensore **4 su 6** · portiere 6 su 6 (mediane 0 u) | ricevente di cross e consegne · 2 difensori ancora scelti dal 3D |
| Brain muove i 22 in scena (B3) | ⏳ da fare | |
| **Esito deciso dal brain (B2)** | ✅ **10 su 10** esiti col dado del brain (rosso 0/13) · eventi veri col cast · tabellone = motore | il 3D non legge ancora quegli eventi |
| Gesti collegati al brain | 🟡 impianto pronto (tabella unica evento→gesto) | si accende con B3 |
| **3D dal brain (B3)** | 🟡 il **gol va dove lo decide il brain**: scarto alla linea 0,07-0,39 (rosso 2,8-9,1) | parata non verificata · palo/fuori/murato ancora geometrici · gesti in scena |
| Tabellino = motore | ✅ gol del compagno e gol «persi» corretti | |
| **Figurine** | ✅ **1000 volti nel gioco**: figurina Korward 5:7, volto dell'eroe scelto e salvato, volti stabili per tutti, una faccia per persona in scena | telefono · volti femminili assenti nel catalogo (giornaliste senza volto) |
| Telefono | ❌ non provato | FPS (misure passate 11-16), kit, gesti |

## Piano (carta bianca del PO sulle situazioni, 23/09)
1. ✅ Il brain apre la scena, con tipo di occasione e cast.
2. ✅ **Il brain risolve la scelta dell'eroe**: dado dentro il motore (stessa probabilità di oggi), catena di eventi con gli attori veri, tabellino aggiornato dal motore (addio ponte `registra`).
3. ▶️ Il 3D mostra solo quegli eventi: gesti per indice, esito e attori dal brain.
4. Archetipi al posto delle 185 schede: opzioni (≤3) dal tipo di occasione; i testi restano racconto.
5. Catene sostituite dal seguito deciso dal brain.

## Da decidere o guardare tu
- **Catene** (seguito della stessa azione): rare (0 in 6 partite) e non un ostacolo, ma oggi il seguito è pescato a caso fra 3 schede, non deciso dal brain. **Proposta:** tenerle finché in B2 il seguito nasce da un evento del brain (ricezione in area, respinta, seconda palla), poi togliere le schede. In alternativa: spegnerle subito (un interruttore).
- Testo «Para in tuffo» mentre il gesto è una presa alta.
- Dopo un gol la regia si allarga di colpo (camera a ~44 u): anche in produzione.
- La lavagna 2D non si specchia nel secondo tempo, la barra sì.
- Diritti dei ritratti AI: non verificabili da me.

## Registro (ultimo in alto, una riga per passo)
| Ora | Passo | Numero |
| --- | --- | --- |
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
