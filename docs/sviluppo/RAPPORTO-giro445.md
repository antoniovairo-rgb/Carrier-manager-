# Rapporto giro 445 — stempiati e lunghi raccolti (seguito del 440, verdetto PO «non vanno»)

Ramo `sviluppo/giro445-stempiati-lunghi`, da `sviluppo/giro440-barba-capelli-bis` con **origin/main unito** (un conflitto in
`tests/visual/ci-runner.mjs`, riga MAPPA di `src/12-|src/13-`: tenute le voci di entrambi i lati, `mappa-unica` verde).
`GAME_VERSION` e `docs/governo` non toccati. Baffi non toccati (sono del giro 444). Rosso nuovo: `window.__CPM_NO_G445` (= la resa del 440).
Vincolo di licenza rispettato: **nessuna mesh o texture CGTrader modificata**. Tutto è strato nostro, costruito a runtime sulla rete
radiale del 432 (sola lettura della testa); l'unico dato nuovo è il colore dei capelli misurato sulle nostre figurine.

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, salvataggio `fixtures/save-190-s12-ovr93.json`, ingresso
in campo. Non sono misure del telefono del PO.**

## 1. Cause misurate dei due difetti

- **Stempiato = calotta liscia color pelle.** Nel 440 lo stempiato era il rasato del 432 (fondo color pelle + stoppia) con la stoppia
  tolta alle tempie: non c'era nessun capello, per costruzione.
- **Nuca a gradini.** Il guscio del 432/440 è figlio rigido dell'osso `head` e copre solo le celle dove la testa pesa ≥ 0,9 su
  quell'osso. Sulla nuca (elevazione −13…−44°) ci sono **269 celle di capelli dipinti** con peso < 0,9 (testa da 680 vertici; 235 sulla
  testa fine dell'eroe): lì i capelli dipinti restavano scoperti, a scalini di una cella. Misura del rosso (440): **2.900-6.000 pixel di
  capelli dipinti visibili da dietro** per corpo.
- **Lunghi raccolti = caschetto, coda invisibile.** Calotta sopra tutti i capelli dipinti con bordo netto e attaccatura bassa e dritta
  (frangia), chignon a 14° di elevazione: da davanti non sporge mai (**0%** della testa in tutti e 9 i corpi del rosso) e i capelli
  dipinti si vedono anche davanti (**241-347 pixel**).

## 2. Soglie dichiarate PRIMA di misurare (guardiano `capelli-445`)

| misura | soglia |
|---|---|
| COPERTURA: pixel di capelli dipinti visibili (render a colori d'identità), 5 viste: davanti, due lati, tre quarti da dietro, dietro | **0** in ogni vista |
| CAPELLI VERI: capelli nostri (alfa ≥ 0,5) sulla testa vista da dietro (chignon escluso) | **≥ 60%** |
| STEMPIATURA (stempiati): tempie (|az| 28-46°, da 2 a 8° sopra l'attaccatura dipinta) scoperte · centro (|az| ≤ 8°, da 3 a 10° sopra) coperto | **≥ 60% · ≥ 50%** |
| SFUMATURA dell'attaccatura davanti (alfa da 0,1 a 0,9) | **fra 3 e 12 gradi** (mediana) |
| COLORE: (capelli − pelle) nel render vero di lato contro (capelli − pelle) della figurina | **CIE76 ≤ 15** (come il «contributo» della barba nel 440: la differenza toglie la luce della scena) |
| CODA (lunghi raccolti): chignon sulla testa | **≥ 4%** di lato, tre quarti, dietro · **≥ 1%** davanti |
| COMPENETRAZIONE: ingresso + 5 pose di sforzo della testa (±35° avanti/indietro, ±45° di lato, una mista) + 6 scene `hl_*` forzate | **0** vertici della testa fuori dal guscio (tolleranza 0,5 mm) · **0** vertici di collo/spalle/busto nello chignon |

Un corpo non giudicato = rosso. Il rosso `__CPM_NO_G445` deve cadere su almeno metà dei corpi.

**Tre correzioni dello STRUMENTO, dichiarate** (nessuna soglia cambiata):
1. *Sfumatura*: la prima definizione la misurava lungo la sola elevazione; sulla «M» obliqua delle tempie dava 20° per pura geometria.
   Ora è la larghezza **perpendicolare al bordo** (0,8 / |gradiente|). Soglie invariate 3-12°.
2. *Copertura*: la maschera dei capelli dipinti del giro 240 ha puntini staccati, uno nella piega dell'orecchio (misurato: lo vedevo
   come «capelli dipinti» dentro l'orecchio). Si contano solo le isole della maschera ≥ 2% dei suoi pixel di capelli (le due calotte).
3. *Rosso del movimento*: la prima versione era «guscio rigido sull'osso head anche sulla nuca». Col margine della nuca (sotto) anche
   quello resta a 0 nelle pose misurate, quindi **non provava lo strumento** e non dimostra che i pesi misti servano. L'ho sostituito
   con un rosso dello strumento: guscio 1 mm sotto l'inviluppo, che deve risultare fuori. Lo dico chiaro: **il guardiano non dimostra
   che la maglia con scheletro sia meglio di una rigida con 6 mm di margine sulla nuca**; dimostra che con lo scheletro la nuca è coperta
   e non compenetra nelle pose misurate.

## 3. Cosa è stato fatto (`src/12`, blocco «giro 445» prima di `aspetto432`)

- **Guscio con scheletro** (`_guscio445`): i vertici stanno nello spazio della maglia della testa e prendono i **pesi del triangolo
  colpito** dal raggio della rete 432 (miscela baricentrica dei tre vertici, primi quattro ossi): sulla nuca il peso è misto testa/collo
  (dubbio 3 del 440). È una `SkinnedMesh` legata allo stesso scheletro, figlia della maglia della testa. Copre **tutti** i capelli
  dipinti (nessun taglio a peso ≥ 0,9), una cella oltre; colonna duplicata dietro (niente cucitura); un vertice di polo per spicchio.
- **Fondo color pelle** sotto: il materiale tinto della testa, con le UV della **pelle vera più vicina** (propagazione sulla griglia
  dalle celle senza capelli), alfa piena sui capelli dipinti che sfuma sull'anello esterno (colore di vertice con alfa).
- **Capelli** sopra: trama disegnata dal gioco a ciocche (16.000 corte per lo stempiato, orientate dal vortice; 7.000 lunghe e curve
  per i raccolti, tirate verso lo chignon), **attaccatura sfumata** da un campo di distanza dal bordo (gradi), tempie arretrate per lo
  stempiato (campana 10-64°, fino a 22°), attaccatura alzata e arrotondata per i raccolti (4° al centro, 11° ai lati).
- **Colore dalla figurina**: nuovo `tools/ritratti/capelli-445.py` misura il colore mediano dei pixel di capelli su sommità e lati di
  ogni ritratto (930/930), campo `hc` in `indice.json` (+13 KB, 113,6 → 126,6 KB), letto da `aspettoFigurina225`; tinta della classe
  come ripiego. Per gli stempiati il colore è la miscela capelli corti + cuoio capelluto, come appare in figurina.
- **Chignon alto** (`_chignon445`, a 50° di elevazione, figlio rigido dell'osso `head`): crocchia con trama a ciocche che girano,
  attacco a tronco di cono, elastico scuro. Più volume dei capelli verso lo chignon (fino a +6 mm).
- **Margine della nuca**: dove la testa pesa poco sull'osso il guscio ha fino a 6 mm in più (misurato: 1 vertice fuori di 1,8 / 2,5 /
  1,3 mm nelle pose di sforzo, al gradino nuca/collo az −129°, el −49°).
- Correzioni misurate lungo la strada (ognuna con la sua prova nelle foto o nel render d'identità): buco di una cella senza raggio
  (riempita dai vicini in una **copia** della rete: la rete è condivisa coi gusci 432/440), «bretella» color pelle dalla nuca alla spalla
  (un vicino che aveva colpito la spalla alzava il vertice: ignorato se > 2 cm più fuori), labbro del bordo che lasciava vedere sotto
  vicino all'orecchio (vertice di chiusura appena sotto la pelle), punta dell'orecchio che bucava il guscio (sull'orecchio che sporge il
  guscio passa SOTTO, al raggio massimo del cranio della stessa elevazione, solo fondo pelle: l'orecchio resta del corpo e la piega
  elica/tempia è coperta), riga scura al centro della fronte (UV del fondo che saltavano fra le due metà della trama del viso), macchia di fondo in
  cima (mipmap al polo), testa «originale» vista da `pelle-240` (il clone del fondo portava `base225`).
- **Tabella**: `v445` dentro le calotte `stempiato` e `lunghi-raccolti` di `assets/aspetto/aspetto-432.json`. Le righe `tagli` non le
  ho toccate: se il giro 444 le spegne, **si riaccendono con la sola riga del taglio** (`"stempiati e corti": "stempiato"`,
  `"lunghi raccolti": "lunghi-raccolti"`).
- **Solo banco** (`?cpmtest=1`): `window.__CPM_FIG445 = {nome: numero}` dà a un corpo taglio e colore dei capelli di una figurina del
  manifest (per fotografare un altro stempiato e un altro lungo veri).

## 4. Misure (dopo)

`npm run capelli-445` sul build finale (≈ 8 min; verde notte, verde giorno, rosso, movimento):

| braccio | esito |
|---|---|
| verde notte | **9/9** corpi entro le soglie: capelli dipinti visibili **0** in tutte le 45 viste · capelli da dietro min **0,81** · stempiati tempie 1,00 e centro 0,96 · sfumatura 3,6° · ΔE max **10,6** · coda min davanti **0,046** / lato 0,077 / tre quarti 0,112 / dietro 0,127 |
| verde giorno | **9/9**, stessi valori (ΔE max 10,8) |
| rosso `__CPM_NO_G445` (resa del 440) | **cade su 9/9**: da dietro 2.873-5.963 pixel di capelli dipinti; lunghi davanti 244-376 pixel e coda davanti 0 |
| movimento | **0** vertici della testa fuori su 78.712 (ingresso + 5 pose di sforzo + 18 campioni in 6 scene `hl_*`) · **0** vertici del corpo nello chignon su 267.720 |
| rosso dello strumento `__CPM_NO_G445M` | 9.552 vertici fuori su 84.536 (max 7,4 mm): la misura vede |

Corpi: stempiati Keith Carr e Noah Marshall (veri del salvataggio), Rupert Hammond (taglio forzato), Jackson Burke (figurina **29** del
manifest, stempiato neri); lunghi raccolti Declan Russell, Aaron Lane, Oscar Hayes, Samuelito Vairo (eroe, testa fine) forzati, Gary
Howard (figurina **200** del manifest, lunghi raccolti biondi).

**Margine dichiarato**: la sfumatura sta a 3,6° contro una soglia di 3°: è vicina al bordo.

**Limite della misura del colore, dichiarato**: il riferimento della figurina è lo stesso `hc` che usa il gioco. La misura prova che il
gioco rende `hc` (ΔE ≤ 10,8), **non** che `hc` sia il colore giusto. Sugli stempiati radi `hc` è la miscela capelli + cuoio capelluto:
la figurina 29 («neri», Jackson Burke) misura `9b6b4f`, un castano chiaro caldo, e in foto si vede (dubbio 6).

Altri guardiani dell'area, **sul build finale** (catena in sequenza, ciascuno con verde e rosso):

| guardiano | esito |
|---|---|
| `capelli-445` | **verde** (sopra) |
| `pelle-240` | **verde** (rosso a una corsa precedente perché il clone del fondo si dichiarava «testa»: corretto, causa sopra) |
| `barba-capelli-432` | verde |
| `aspetto-412` | verde in 3 corse su 4 in questa sessione; una rossa sulla **suola** (piedi: −0,057 contro tolleranza 2 cm), poi verde 2 su 2 sul build finale. Il guardiano stesso documenta la lettura della suola col piede alzato nella fila; il 445 non tocca piedi né corpo. **Instabile**, da riparare (regola PO 13/10) |
| `attaccatura-414` | verde |
| `resa-barba-440`, parte capelli (`CPM_SOLO=capelli`) | verde: lunghi raccolti con calotta e chignon, stempiati con le tempie scoperte, 0 compenetrazioni |
| `resa-barba-440`, parte barba | **ROSSO, non per il 445**: Connor Quinn (baffi) varianza 5,96 < 6,0 di notte. **Stesso rosso sul commit prima del 445** (440 + main unito, worktree a parte): 5,99 di notte e **3,93** di giorno. Nasce con l'unione di main o è instabile; riguarda i baffi, area del giro 444 |
| `spalle-146` | verde alla seconda corsa (penultimo build: le ossa non cambiano col 445); la prima aveva **un** campione «spalle protratte 0,041 > 0,035» su un compagno in highlight: **instabile, 1 corsa su 2** |
| `test:logic`, `mappa-unica` | verdi |

Non eseguiti: la catena `ci-runner giro` con le 17 sentinelle e il gate `validate-situations` (gira coi corpi spenti, dove gli strati
non entrano).

## 5. Peso (banco)

| voce | misura |
|---|---|
| dati | `indice.json` **+13 KB** (campo `hc`) · nessun file immagine nuovo (trame disegnate dal gioco) |
| trame | 5 (capelli per tipo e per testa + chignon): **8,2 MB** con le mipmap · disegno **71 ms** in tutto |
| geometrie | 8 condivise (2 tagli × 2 teste × fondo/capelli): ~**6.800 triangoli per guscio**, ~13.500 per corpo (la testa ne ha ~1.300) |

Non misurato sul telefono. Il numero di triangoli è il punto debole (dubbio 3).

## 6. Foto

`docs/collaudo-po/445-{notte,giorno}-N-*-viste.png`: per ogni giocatore PRIMA (resa del 440) sopra e DOPO sotto, figurina + davanti,
di lato, tre quarti da dietro, da dietro. `445-{notte,giorno}-N-*.png` (senza «viste»): figurina | corpo in campo | primo piano, per
chi ha la figurina propria. N: 1 Keith Carr, 2 Noah Marshall (stempiati veri), 3 Jackson Burke (stempiato della figurina 29),
4 Declan Russell (lunghi raccolti forzato dal banco, come nel 440), 5 Gary Howard (lunghi raccolti della figurina 200).

Cosa si vede, onestamente:
- **dietro, di lato, tre quarti**: capelli veri del colore della figurina, nuca coperta senza gradini, chignon visibile;
- **stempiato davanti**: tempie scoperte a «M», capelli corti al centro; la pelle delle tempie è il fondo (pelle vera vicina) e ha ancora
  qualche chiazza di luce diversa dalla fronte;
- **raccolti davanti**: non più caschetto (attaccatura alzata, chignon sopra la sommità), ma il bordo dell'attaccatura alzata mostra
  chiazze color pelle a gradino: è il difetto più visibile che resta;
- **bordo basso della nuca**: la sfumatura sul collo è ancora un po' a gradini di cella nel primo piano;
- il primo piano «corpo in campo» di notte è nel tunnel: le sfaccettature di luce sul viso sono della testa, anche nel prima.

## 7. File toccati

`src/12-three-match-view.jsx` (blocco giro 445; nella rete 432 solo l'aggiunta di triangolo e baricentriche per cella, `tv`/`tb`;
padre delle maglie con scheletro), `src/16` (`hc` in `aspettoFigurina225`), `CARRIER-MANAGER-AV.html` ricomposto;
`assets/aspetto/aspetto-432.json` (`v445`, `nota_445`); `assets/portraits/ai/indice.json`; `tools/ritratti/capelli-445.py`
(+ `capelli-445.json`), `tools/ritratti/indice-volti.mjs`, `tools/foto-445.py`; `tests/visual/capelli-445.mjs` (guardiano),
`misura-445.mjs`, `foto-445.mjs`, `package.json`, `ci-runner.mjs` (riga MAPPA `src/12-|src/13-`, quella che esiste già); foto
`docs/collaudo-po/445-*.png`.

## 8. Dubbi per il PO (la consigliata per prima, già applicata dove dice «applicata»)

**1. Lunghi raccolti: chignon o coda?**
- **(consigliata, applicata)** Chignon alto (50°), si vede da tutte e quattro le viste, anche da davanti sopra la sommità; 0 contatti
  con collo e spalle misurati, anche nelle pose di sforzo.
- Coda che scende sulla nuca (come la figurina 200): più fedele, ma tocca collo e spalle nei colpi di testa e andrebbe animata.
- Chignon basso sulla nuca: più sobrio, ma da davanti non si vede più (era il difetto del 440).

**2. L'attaccatura davanti dei raccolti (chiazze color pelle sul bordo).**
- **(consigliata)** Un giro di sola taratura dell'attaccatura: alzarla meno (2-6°) e allargare la sfumatura a 5-6°, stesse soglie e
  stesso guardiano, foto davanti come prova.
- Nessuna attaccatura alzata (bordo dei capelli dipinti, solo sfumato): niente chiazze, ma torna più vicino alla frangia.
- Lasciare così.

**3. Peso dei gusci (~13.500 triangoli per corpo con questi tagli).**
- **(consigliata)** Sulla testa da 680 vertici (tutti tranne l'eroe) una cella su due come il 432 (un quarto dei triangoli),
  ri-misurando compenetrazione e copertura col guardiano; profilo sul telefono.
- Lasciare così (in una partita ~1 giocatore su 4 ha uno di questi tagli: 241 figurine su 930).
- Gusci con scheletro solo sulla nuca e rigidi sul resto.

**4. Stessa soluzione per i rasati** (la loro nuca ha gli stessi gradini, difetto del 432).
- **(consigliata)** Portare il rasato sul guscio con scheletro del 445 in un giro dedicato, col suo braccio nel guardiano.
- Lasciare il rasato com'è.

**6. Il colore dei capelli degli stempiati radi.**
- **(consigliata)** Per gli stempiati misurare `hc` solo sui pixel più scuri dei capelli (es. il quartile scuro sui lati, dove i capelli
  sono più fitti) e controllarlo contro la classe del manifest («neri» non può uscire castano chiaro): un giro di sola taratura dei dati.
- Usare la tinta della classe per gli stempiati e `hc` per gli altri.
- Lasciare così (è il colore «a colpo d'occhio» della figurina, capelli e cuoio insieme).

**5. Il rosso di `resa-barba-440` (Connor Quinn, varianza dei baffi).**
- **(consigliata)** Lo guarda il giro 444 (baffi): è già rosso prima del 445.
- Dichiararlo in `ROSSI-DICHIARATI` (decisione di governo, non mia).
