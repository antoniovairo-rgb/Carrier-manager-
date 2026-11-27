# Rapporto giro 432 — PO-686 (barba e capelli dalla figurina; dubbi 2 e 3 del giro 412)

Ramo `sviluppo/giro432-barba-capelli`, partito da `sviluppo/giro414-attaccatura` (giri 412 + 414) con **origin/main (7.999.218) unito**
(un conflitto in `tests/visual/ci-runner.mjs`, righe MAPPA `src/12-|src/13-` e `src/16-`: tenute le voci di main e quelle del 412/414).
`GAME_VERSION` e `docs/governo` non toccati. Rosso unico: `window.__CPM_NO_G432`. Temi dei giri paralleli (431 statura dell'eroe,
433 carnagione scura, 434 premiazione) non toccati.

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, ora congelata, salvataggio
`tests/visual/fixtures/save-190-s12-ovr93.json`, ingresso in campo. Non sono misure del telefono del PO.**

## 0. Licenza CGTrader (passo obbligatorio) — esito: NON VERIFICABILE per questo prodotto → asset CGTrader NON modificati

- Nel repo: `docs/governo/CREDITI-fonti.md` dichiara «Royalty Free (standard) — dichiarata dal PO» (ordine #17876008); il testo della
  licenza non è nel repo. `tests/character-lab/CLIP_REGISTRY.md` riga 9 cita i Termini CGTrader e dice già: «che il listino di quel
  prodotto sia Royalty Free e non Editorial: non posso confermarlo».
- Alla fonte (letta il 27/11/2026): i **Termini CGTrader**, sezione 21A «Royalty Free License», punto 21A.4, concedono di «modify, create
  derivative works of» il prodotto **solo** se usato come «Incorporated Product» (non estraibile dall'applicazione); 21A.3 chiede misure
  ragionevoli perché l'utente finale non acceda al prodotto. Una licenza «Custom» sulla pagina del prodotto può cambiare queste regole (20.2, 23A).
- La **pagina del prodotto** (`cgtrader.com/3d-models/character/man/realistic-soccer-player-v2-rigged`) non ha risposto (HTTP 202,
  pagina vuota): **non posso confermare** né il tipo di licenza di quel prodotto né l'assenza di condizioni «Custom».
- Decisione applicata (come da incarico): **nessuna modifica a mesh o texture CGTrader**. Barba e calotte sono **geometria e texture
  nostre**, figlie dell'osso `head`. La forma della testa si **misura** a runtime (distanza della superficie esterna lungo 96×64
  direzioni, per sapere dove appoggiare il guscio): nessun vertice o pixel CGTrader viene copiato in un file nostro, nulla di CGTrader
  viene salvato o distribuito modificato. Il fondo del «rasato» usa il materiale della testa già tinto dal giro 240 (stessa operazione
  a runtime di oggi, nessun file nuovo).
- File nuovi, tutti nostri: `assets/aspetto/*.png` disegnati da `tools/aspetto-432.py` (forme e rumore con seme fisso, nessuna immagine
  di partenza) e `assets/aspetto/aspetto-432.json`. Nessun asset di terzi: nessuna riga di licenza da aggiungere. La riga nei Crediti
  («risorse nostre») resta da decidere al PO: `docs/governo` non si tocca in questo giro.

## 1. Misura PRIMA (No Blind Fix) — 22 corpi, metodo delle etichette del giro 414

Sonda `tests/visual/misura-432.mjs`: tre primi piani per corpo (fronte, ¾ destra e sinistra) e un secondo passaggio di etichette:
capelli dipinti (rosso) · pelle (verde) · calotta 432 (giallo) · barba 432 (magenta), gli strati etichettati con la loro alfa (≥ 0,25).
Taglio 3D = calotta se le sue etichette sono ≥ 60% dei capelli visibili, altrimenti «corto» (la forma unica del corpo); barba 3D = tipo
se ≥ 0,1% del viso. Colore = L\*a\*b\* medio degli strati contro i capelli dipinti dello stesso corpo nel braccio rosso (che dal giro 240
sono della classe di colore della figurina), CIE76.

| | taglio (sui 20 coperti dalla tabella) | barba (22) | colore |
|---|---|---|---|
| **prima** (rosso `__CPM_NO_G432`) | **7/20** (solo chi in figurina ha «corti») | **3/22** (solo i tre «rasato») | 22/22 per classe (giro 240) |
| **dopo**, notte | **20/20** | **22/22** | 18 strati giudicati, massimo **7,4** (soglia 12) |
| **dopo**, giorno | **20/20** | **22/22** | massimo **7,4** |

Tabella per corpo (dopo, notte; `out/g432/misura-432-night.json` sul banco):

| giocatore | capelli figurina | → 3D | barba figurina | → 3D |
|---|---|---|---|---|
| Samuelito Vairo (eroe) | neri rasati a zero | rasato | pizzetto | pizzetto |
| Sebastian Maxwell | neri ricci corti | ricci | barba piena curata | piena |
| Isaac Hughes | neri afro corti | afro | barba piena curata | piena |
| Donald Wright | castani ricci corti | ricci | rasato | — |
| Dylan Gray | neri rasati a zero | rasato | baffi sottili | baffi |
| Norman Bailey | rossi ricci medi | ricci medi | barba piena curata | piena |
| Keith Thornton | neri corti mossi | corto (testa del corpo) | barba corta | corta |
| Declan Russell | castani corti lisci | corto | baffi sottili | baffi |
| Gary Howard | neri ricci corti | ricci | baffi sottili | baffi |
| Rupert Hammond | rossi corti lisci | corto | barba piena curata | piena |
| Carter Spencer | neri afro corti | afro | barba corta | corta |
| Keith Carr | castani stempiati e corti | **non coperto** (corto) | baffi sottili | baffi |
| Stuart Ross | rossi corti mossi | corto | barba corta | corta |
| Reece Pearce | castani ricci corti | ricci | barba piena curata | piena |
| Noah Marshall | castani stempiati e corti | **non coperto** (corto) | barba piena curata | piena |
| Trevor Smith | biondi rasati a zero | rasato | barba piena curata | piena |
| Connor Quinn | castani afro corti | afro | baffi sottili | baffi |
| Aaron Lane | castani corti mossi | corto | baffi sottili | baffi |
| Jasper Mitchell | rossi corti mossi | corto | rasato | — |
| Oscar Hayes | castani ricci medi | ricci medi | barba piena curata | piena |
| Jackson Burke | castani corti mossi | corto | rasato | — |
| Daniel White | biondi rasati a zero | rasato | barba piena curata | piena |

Sui 930 volti di giocatore del manifest: tagli coperti da uno strato o dalla testa del corpo 6 su 8 (rasati a zero 116, corti lisci 101,
corti mossi 120, ricci corti 132, ricci medi 117, afro corti 101 = **687/930**); non coperti «stempiati e corti» (127) e «lunghi raccolti»
(114), che restano con la testa del corpo. Barbe: tutte e 5 le parole (+2 varianti) hanno una riga.

## 2. Cosa è stato fatto

**Tabella unica** `assets/aspetto/aspetto-432.json` (2,7 KB): dalle parole del manifest (`tagli`, `barbe`) alla calotta e alla barba,
con i parametri di ogni calotta (spessore, rilievo dei ricci, trama, dilatazione), il file della maschera di ogni barba, il campo
azimut/elevazione delle maschere, la zona delle orecchie esclusa e le **tinte per classe** di capelli (tarate, vedi sotto).
**Un taglio o una barba nuovi = una riga qui + un file in `assets/aspetto`**, senza toccare il codice. L'indice dei ritratti
(`tools/ritratti/indice-volti.mjs` → `indice.json`) porta ora taglio e barba di ogni volto (dizionari `dt`/`db`, +12,5 KB) e
`aspettoFigurina225` li restituisce (`t`, `b`).

**Codice** (`src/12-three-match-view.jsx`, blocco «giro 432» prima di `ThreeMatchView`; chiamata in `_applyCgtraderNativeHair`, dopo la
pelle del giro 240; rilascio allo smontaggio accanto a `_rilascia276`):
1. `_rete432`: una volta per geometria della testa (cioè per LOD), dal centro della testa 96×64 raggi; per ognuno la superficie più
   esterna, l'UV del punto (→ maschera dei capelli dipinti del giro 240) e il peso dell'osso `head`. Misurato: fronte ad azimut 0,
   attaccatura a +35°, capelli dipinti spessi ~1,3 cm, punta del naso −21°, bocca −32°, mento −46…−55°.
2. `_strato432`: guscio sopra l'inviluppo massimo (+ spessore, + rilievo per i ricci), solo dove la copertura è > 0, solo su vertici
   pesati ≥ 0,9 sull'osso `head` (la nuca e il collo restano fuori: lì la testa si piega rispetto all'osso). Sul LOD lontano una cella su
   due. Geometria in coordinate dell'osso → rigida con la testa.
3. Calotte: **rasato** (fondo color pelle preso dal materiale tinto della testa + stoppia semitrasparente del colore dei capelli),
   **ricci**, **ricci medi**, **afro** (gusci di 4-14 mm con rilievo e trama a ricci); **corto** = la testa del corpo (nessuno strato).
   Barbe: **piena, corta, pizzetto, baffi** (maschere nostre nel campo −100…100° × −75…15°).
4. Colore = tinta della classe di capelli della figurina (tabella `tinte`), tarata sul banco perché calotta e barba piena stiano vicino
   ai capelli dipinti della stessa classe: prima della taratura rossi e biondi erano a 26-45 CIE76 (troppo chiari e saturi), dopo ≤ 7,4.
   La trama della barba piena è coprente (con alfa 0,78 la pelle traspariva e la barba nera usciva a 12,3).

## 3. Regola del giro 414 e compenetrazione

- **Attaccatura** (stesso calcolo del 414 con «capelli» = dipinti ∪ calotta ∪ barba): eccesso massimo **2,1 punti notte · 1,7 giorno**,
  nessuno scatto oltre 5 (66/66 giudicati per ora).
- **Compenetrazione**: ogni vertice della testa, deformato dallo scheletro nel fotogramma, riportato nella rete; «fuori» se sta sotto uno
  strato coperto più lontano dal centro dello strato (tolleranza 0,5 mm). Ingresso: **0 su 8.587** vertici sotto gli strati (20 corpi).
  **In movimento** (8 scene forzate × 4 campioni nelle fasi `hl_*`): **0 su 63.502**. Per costruzione: guscio sull'osso `head`, solo dove
  la testa pesa ≥ 0,9 su quell'osso, raggio ≥ massimo dei vicini + spessore.

## 4. Peso per il telefono (misurato sul banco, non sul telefono)

| voce | misura |
|---|---|
| da scaricare | `assets/aspetto` **62 KB** (9 file, scaricati solo se servono) + indice dei ritratti **+12,5 KB** (81,8 → 94,3 KB) |
| calcolo al caricamento | rete radiale **14-78 ms** in tutto (3 geometrie della testa, una per LOD, condivise da tutti i corpi), texture **12-26 ms** |
| triangoli | **42.728** in tutto sui 3 LOD (68.314 prima della riduzione del LOD lontano); a schermo ne è acceso un LOD per corpo |
| disegni | +1 per corpo con calotta, +1 con barba, +1 per il fondo del rasato: con la rosa misurata **36** in più per 22 corpi |
| memoria grafica | **8 texture** (una per tipo, condivise fra i LOD e fra i corpi; erano 16 prima di condividerle) da 768×512: ~2 MB l'una con le mipmap, **~17 MB** al massimo (calcolato, non misurato sul telefono) |
| memoria della partita smontata | `memoria-275` verde (texture, geometrie e materiali degli strati rilasciati allo smontaggio con `_rilascia432`) |

⚠️ Sul banco la tabella arriva 12-18 s dopo la richiesta perché viaggia in coda ai GLB (7-17 MB): gli strati compaiono quando arriva,
il gioco non la aspetta. La richiesta parte al montaggio della partita (`_tab432` in testa a `ThreeMatchView`).

## 5. Foto (prima sopra, dopo sotto)

`docs/collaudo-po/432-notte-{1..6}-*.png` e `432-giorno-{1..6}-*.png` (figurina | corpo | primo piano): eroe (rasato + pizzetto),
Maxwell (ricci + piena), Bailey (ricci medi rossi + piena), Trevor Smith (rasato biondo + piena), Thornton (corto + barba corta),
Connor Quinn (afro + baffi). `432-notte-ingresso.png`, `432-giorno-ingresso.png`: la fila come la mostra il gioco, prima | dopo.

Cosa si vede, onestamente: ricci e barba piena sono convincenti; il rasato sui capelli neri si legge come capelli rasati. Restano
difetti visibili nei primi piani: il **pizzetto** è squadrato; il **bordo alto della barba** sulle guance è netto; il **rasato biondo**
sembra ancora una calotta chiara (il guscio sta sopra il volume dei capelli dipinti, ~1,3 cm, che non si può togliere senza toccare la
mesh); i **baffi** su carnagione scura (Connor Quinn) quasi non si vedono; i ricci neri non mostrano la trama. Nell'inquadratura
dell'ingresso le differenze non si vedono (i corpi sono troppo piccoli).

## 6. Guardiano e verifiche

`npm run barba-capelli-432` (~2,5 min, verde e rosso nello stesso comando; riga MAPPA `src/12-|src/13-`, quella che esiste già):
A ingresso, notte — ≥ 20 corpi, 66/66 scatti, taglio 100% e barba 100% come la tabella, colore ≤ 12 CIE76 (la soglia di `pelle-240`),
attaccatura nessuno scatto > 5 punti, 0 vertici fuori; il rosso deve mostrare il difetto (taglio o barba sotto il 50%), altrimenti è
cieco → rosso. B movimento — 0 vertici fuori su ≥ 5 scene e ≥ 20 campioni. Esito: **VERDE** (dati sopra); rosso: taglio 7/20, barba 3/22.
Le soglie sono state scritte dopo aver visto le misure dei due bracci (lo dichiaro); una volta (barba nera 12,3) il guardiano è uscito
rosso e ho corretto la trama, non la soglia.

| guardiano | esito |
|---|---|
| `barba-capelli-432` | verde (+ rosso visto) |
| `pelle-240` | verde (e il rosso si vede) |
| `aspetto-412` | verde (Spearman 0,991, 0 fuori ±3%, 0 compenetrate) |
| `attaccatura-414` | verde dopo **riparazione dello strumento** (sotto) |
| `spalle-146` | verde (i rossi cadono) |
| `memoria-275` | verde |
| `mappa-unica`, `test:logic` | verdi |

**Riparazione di `misura-414` (strumento, soglie invariate):** con le calotte accese l'attaccatura dipinta è coperta e la sonda 414
trovava 31-32 scatti su 66 senza capelli dipinti visibili, **in entrambi i bracci** (non giudicato = rosso, e il suo rosso diventava
cieco). La sonda giudica lo shader della testa, che questo giro non tocca: ora gira con gli strati spenti (`__CPM_NO_G432`) in entrambi
i bracci (`CPM_CON_G432=1` li riaccende). Dopo: 66/66 per ora, verde ≤ 2,9 punti, rosso 16,0/11,9 punti. L'attaccatura con gli strati
la giudica `barba-capelli-432` con lo stesso metodo.

Non eseguito in questo giro: la catena `node ci-runner.mjs giro …` con le 17 sentinelle (ho girato i guardiani dell'area uno per uno);
il gate `validate-situations` gira coi corpi spenti, dove gli strati non entrano. Non verificato: telefono del PO; le altre scene 3D
(serata, cerimonie, parata) **non** hanno gli strati.

## File toccati

- `src/12-three-match-view.jsx` (blocco giro 432 + due chiamate), `src/16-scene-3d-cerimonie.jsx` (`aspettoFigurina225`: `t`, `b`),
  `CARRIER-MANAGER-AV.html` ricomposto.
- `assets/aspetto/` (nuova: tabella + 4 maschere + 4 trame), `assets/portraits/ai/indice.json`, `tools/ritratti/indice-volti.mjs`,
  `tools/aspetto-432.py`, `tools/foto-432.py`.
- `tests/visual/misura-432.mjs`, `barba-capelli-432.mjs`, `foto-432.mjs`, `misura-414.mjs` (riparazione), `package.json`
  (`barba-capelli-432`, `misura-432`), `ci-runner.mjs` (riga MAPPA + unione di main).
- `docs/collaudo-po/432-*.png`, questo rapporto.

## Dubbi per il PO (la consigliata per prima, già applicata)

**1. Come fare barba e capelli.**
- **(consigliata, applicata)** Strati nostri sull'osso della testa + tabella unica: nessun asset CGTrader modificato, 62 KB, una riga e
  un file per un taglio o una barba nuovi.
- Dipingere barba e tagli nella texture della testa CGTrader: più pulito nei primi piani, ma modifica un asset con licenza non
  verificabile per questo prodotto, e costa fino a +147 MB di memoria grafica (giro 412).
- Comprare un pacchetto di capelli/barbe pronto (es. quello visto in `POC_STORICO.md`): resa migliore, licenza da leggere voce per voce
  prima, peso da misurare.

**2. Rifinitura della resa (difetti del § 5).**
- **(consigliata)** Un giro di disegno sulle maschere e sulle trame (pizzetto arrotondato, bordo della barba sfumato in salita, baffi
  più spessi sulle carnagioni scure, ricci neri con riflessi), stesse regole e stesso guardiano.
- Maschere a 256 px e trame più grandi (più dettaglio, ~4× la memoria grafica delle trame).
- Lasciare così.

**3. Tagli non coperti e altre scene.**
- **(consigliata)** Due righe e due file nuovi: «stempiati e corti» (calotta che lascia scoperte le tempie) e «lunghi raccolti»
  (calotta + codino), poi gli strati anche in serata/cerimonie/parata (`figurina240` ha già nome e figurina).
- Solo le altre scene, i tagli restano alla testa del corpo.
- Nessuna delle due.

**4. Memoria grafica sul telefono (~17 MB al massimo per le trame, calcolato).**
- **(consigliata)** Misurarla sul telefono del PO in una partita vera prima di ridurla.
- Texture degli strati a 384×256 (~4 MB in tutto, trama meno nitida).
- Lasciare così.

**5. Crediti.** Gli asset di `assets/aspetto` sono nostri (generati da `tools/aspetto-432.py`).
- **(consigliata)** Una riga «risorse nostre» in `docs/governo/CREDITI-fonti.md` nel prossimo giro di governo (qui non si tocca).
- Nessuna riga (non è un asset di terzi).
