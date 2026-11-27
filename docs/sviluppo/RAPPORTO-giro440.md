# Rapporto giro 440 — PO-686 bis (barba credibile, capelli lunghi raccolti e stempiati)

Ramo `sviluppo/giro440-barba-capelli-bis`, da `sviluppo/giro432-barba-capelli` con **origin/main (7.999.218) unito** (nessun conflitto).
`GAME_VERSION` e `docs/governo` non toccati. Rosso nuovo: `window.__CPM_NO_G440` (= la resa del 432). Temi dei giri 436-439 non toccati.
Vincolo di licenza del 432 rispettato: **nessuna mesh o texture CGTrader modificata**; barba e capelli restano strati nostri
(file nuovi disegnati da `tools/aspetto-440.py`, nessun asset di terzi → nessuna riga in LICENZE).

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, salvataggio `fixtures/save-190-s12-ovr93.json`, ingresso
in campo. Non sono misure del telefono del PO.**

## 1. Perché il 432 era verde con una barba bocciata — cause misurate

Il guardiano 432 giudicava il **tipo** di barba (etichetta presente/assente: 22/22), non la resa. Ho scritto una sonda della RESA
(`tests/visual/misura-440.mjs`) che legge gli **stessi punti del viso** (azimut/elevazione attorno al centro della testa) sul primo piano
3D frontale e sulla figurina, e ho srotolato la texture della testa in azimut/elevazione (sola lettura). Cause trovate:

1. **Punti di riferimento sbagliati di 6-7°.** Il 432 aveva misurato la bocca a −32°; sulla texture srotolata la rima della bocca sta a
   **−39°**, le labbra fra −33 e −44,5, il mento fino a −58. Per questo i baffi finivano sotto il naso e il «pizzetto» (−37,5…−53)
   copriva il labbro inferiore: un rettangolo nero sulla bocca.
2. **Maschera binaria × trama coprente (alfa 0,98) × tinta tarata sui capelli dipinti** → tinta piatta quasi nera, bordo pulito come una
   maschera. Il colore di riferimento era sbagliato: i capelli dipinti della testa (scuri), non la barba della figurina.
3. **Baffi di Connor Quinn**: c'erano, ma 2 mm sotto il naso, scuri su pelle scura e stretti.

## 2. Soglie dichiarate PRIMA, misurando le figurine

Statistiche sui 930 ritratti di giocatori (stesse zone della sonda, mappa figurina tarata su occhi −3° → 0,39, narici −25° → 0,53,
rima della bocca −39° → 0,595 dell'altezza):

| misura | figurine | soglia |
|---|---|---|
| labbra libere (zona della bocca senza pelo scuro) | rasato: mediana 0,91 | **labbra visibili ≥ 0,90** (punti-labbro 3D, presi dalla texture della testa, non coperti dalla barba con alfa ≥ 0,25) |
| colore del nucleo (mento / baffi), dispersione nella stessa classe di capelli e stesso tipo | p90 da 7,5 a 16,4 CIE76 | **contributo della barba ≤ 15 CIE76** (3D con barba − 3D senza, stesso fotogramma, contro figurina mento − pelle) |
| deviazione standard di L* nel nucleo | p10: piena 5,2 · corta 4,5 · pizzetto 4,9 · baffi 6,0 | **≥ p10 del tipo** |
| pendenza dello scurimento lungo le guance (L* per grado, media mobile 5°) | per corpo | **≤ figurina dello stesso corpo + 1,0** (piena e corta) |

Dichiaro due cose: (a) una prima definizione del bordo, l'alfa della barba normalizzata (figurine p90 0,21-0,30 per grado), **non
separava** il 432 dal nuovo (432: 0,13-0,17; nuovo 0,20-0,29, i peli fanno rumore): l'ho tolta dai criteri e l'ho sostituita col
contrasto, che è ciò che si vede; (b) il colore assoluto del nucleo confondeva la barba con l'ombra del naso della testa 3D (Keith Carr:
nucleo 3D 56 contro 71,5 della figurina con o senza baffi), per questo si misura il **contributo** della barba e non il colore assoluto.
La zona dei baffi è stata corretta a −34,5…−31 in sonda e figurine (i peli crescono in giù di ~2°, e anche sulla figurina i baffi
stanno lì).

## 3. Cosa è stato fatto

**Barba** (`src/12`, blocco «giro 440» dopo il 432; tabella unica `assets/aspetto/aspetto-432.json`, v2):
- ogni tipo ha una **mappa di densità** 0..1 sfumata (`barba440-{piena,corta,pizzetto,baffi,baffi-pizzetto,stoppia}.png`, 400×180,
  0,5°/px) costruita sui punti misurati: labbra (ellisse 0,−39, 17×5,8°) **sempre a densità 0** in ogni forma; piena più rada sulle
  guance alte e più folta su mento e mascella, sfumata 10° in salita; baffi che si assottigliano verso gli angoli; pizzetto = mosca sotto
  il labbro + mento arrotondato che segue la curva del mento (non più un rettangolo);
- la trama la disegna il gioco **a peli** (`_texBarba440`): velo sotto (alfa 0,3 × densità) + peli corti orientati come crescono (in giù
  e verso l'esterno, i baffi a ventaglio), più radi e più chiari dove la densità cala; ritagliata dalla densità (bordo morbido, bocca
  pulita); una trama in grigi **per tipo** (4 in partita) condivisa da tutti i corpi, UV solo sul campo del viso (512×256);
- **colore dalla figurina, per giocatore**: `tools/ritratti/barba-440.py` misura su ogni ritratto il colore del nucleo della barba e della
  pelle accanto (688 figurine con barba, campi `bn`/`bp` in `indice.json`, come la pelle del giro 225); il gioco ricava il colore dei
  peli dalla miscela (`_peliDa440`: nucleo = copertura × peli + resto × pelle, copertura per tipo in tabella); materiale opaco (ruvidità 1,
  niente lucido); `barba_tinte` per classe resta come ripiego;
- forme nuove in tabella anche se il manifest dei giocatori non le usa: «stoppia», «baffi e pizzetto».

**Capelli** (le due righe che mancavano; il manifest dei giocatori **non ha** «lunghi sciolti» né altri medi sopra le orecchie oltre ai
«ricci medi» già coperti; «lunghi mossi», «ricci lunghi», «caschetto liscio» esistono solo nello staff, che non scende in campo):
- **«lunghi raccolti» (114 volti)** → calotta a ciocche pettinate all'indietro (`trama440-lisci.png`) + **chignon** dietro in alto
  (az 180°, el +14°), figlio dell'osso della testa: segue la testa;
- **«stempiati e corti» (127 volti)** → come il rasato (fondo color pelle + stoppia) con la stoppia tolta alle tempie (profilo a campana
  fra 12° e 64° di azimut, fino a 12° sopra l'attaccatura). La prima prova (testa del corpo + fondo solo alle tempie) faceva **due bozzi
  color pelle** sopra il volume dei capelli dipinti: scartata dopo la foto.
- Coperti ora **8 tagli su 8** dei giocatori (930/930 volti).

**Tabella prima della partita**: parte appena arriva l'indice dei volti (`src/01`), non più al montaggio della partita.

## 4. Misure (dopo)

`npm run resa-barba-440` (≈ 4 min, verde e rosso nello stesso comando):

| braccio | esito |
|---|---|
| verde, notte | 19/19 corpi con barba entro le soglie · labbra visibili min **1,00** · contributo di colore max **12,6** · varianza min **6,17** |
| verde, giorno | 19/19 · labbra min 1,00 · colore max 13,1 · varianza min 6,2 |
| rosso `__CPM_NO_G440` (resa del 432) | **cade su 15/19**: es. Bailey bocca 0, colore 50,3, varianza 2,33, bordo 9,53 > 4,67+1; Vairo bocca 0,086, colore 41,7 |
| capelli | lunghi raccolti 6/6 con calotta e chignon (forzati dal banco); stempiati 2/2 con tempie scoperte; **0 vertici** di collo/spalle/busto dentro lo chignon (45.114 controllati all'ingresso + 18 campioni in 6 scene hl_*); **0** vertici della testa fuori dagli strati su 50.873 in movimento |

Per corpo (notte): bocca · contributo ΔE · deviazione L* · bordo 3D/figurina
```
Samuelito Vairo   pizzetto 1,00 · 5,5 · 7,5
Sebastian Maxwell piena    1,00 · 9,8 · 11,6 · 6,1/7,8
Isaac Hughes      piena    1,00 · 9,6 · 10,8 · 5,2/7,6
Norman Bailey     piena    1,00 · 5,7 · 8,9  · 4,3/4,7
Keith Thornton    corta    1,00 · 4,0 · 10,8 · 4,2/6,7
Connor Quinn      baffi    1,00 · 12,6 · 6,2
Declan Russell    baffi    1,00 · 11,7 · 9,8
(gli altri 12 in tests/visual/out/g440/resa-barba-440.json sul banco)
```

Altri guardiani dell'area, tutti **verdi** col loro rosso che cade: `barba-capelli-432` (taglio 22/22, barba 22/22, compenetrazione 0 su
80.743 in movimento), `pelle-240`, `aspetto-412`, `attaccatura-414`, `spalle-146`, `memoria-275`, `test:logic` (51/51), `mappa-unica`.
`pelle-scura-433` non è presente su questo ramo dopo l'unione. **Modifica dichiarata a `barba-capelli-432`**: il colore della BARBA non si
confronta più coi capelli dipinti (era proprio il riferimento sbagliato del verdetto «colori troppo scuri»: la rossa di Bailey usciva
marrone); lo giudica `resa-barba-440` contro la figurina. Il criterio sulle calotte resta (9/9 entro 12, minimo 8 strati invariato);
lo «stempiato» è escluso come il rasato (stoppia su pelle).
Non eseguito: la catena `ci-runner giro` con le 17 sentinelle e il gate `validate-situations` (gira coi corpi spenti, dove gli strati
non entrano).

## 5. Peso e caricamento (banco)

| voce | misura |
|---|---|
| file nuovi da scaricare | `assets/aspetto/*440*` **28,6 KB** (7 file, solo se servono) + indice dei volti **+19,3 KB** (94,3 → 113,6 KB) |
| tabella dell'aspetto | **pronta a 0,58 s** dall'apertura (con l'indice) contro **16-17 s** prima (in coda ai GLB, che finiscono a 15,7-16,7 s); due prove per braccio |
| trame della barba | 4 trame 512×256 in grigi (una per tipo) ≈ **0,7 MB** l'una con le mipmap (calcolato), al posto delle 768×512 del 432; disegno **60-86 ms** in tutto |
| chignon | 1 maglia in più per corpo coi «lunghi raccolti» (sfera 18×12) |

Non misurato sul telefono.

## 6. Foto (prima = resa del 432, sopra · dopo, sotto)

`docs/collaudo-po/440-{notte,giorno}-N-*.png` (figurina | corpo in campo | primo piano): 1 Samuelito Vairo (pizzetto), 2 Sebastian
Maxwell (piena), 3 Norman Bailey (rossa piena), 4 Connor Quinn (baffi), 5 Keith Thornton (corta), 6 Keith Carr (stempiato + baffi),
7 Declan Russell e 8 Aaron Lane («lunghi raccolti» **forzati dal banco** con `__CPM_TAGLIO440`: nel salvataggio di prova nessuno ha quel
taglio); `-dietro.png` = di lato e tre quarti da dietro (chignon, tempie); `440-{notte,giorno}-ingresso.png` la fila come la vede il gioco.

Cosa si vede, onestamente: bocca sempre scoperta, peli visibili ai bordi, colori vicini alla figurina (la barba di Bailey ora è rossa);
il pizzetto di Vairo è leggero come in figurina. Difetti che restano: i **baffi** sono ancora più piccoli di quelli in figurina (Quinn,
Russell); la barba piena di Bailey è **più rada** della figurina; i ricci e i lunghi raccolti hanno una calotta liscia nel primo piano;
la **nuca** di stempiati (come già i rasati del 432) mostra a gradini i capelli dipinti sotto il guscio, perché il guscio copre solo dove
la testa pesa ≥ 0,9 sull'osso; nell'inquadratura di gioco le differenze sono piccole (i corpi sono lontani).

## 7. File toccati

`src/12-three-match-view.jsx` (blocco giro 440, UV nel campo per `_strato432`, chignon, stempiato, forzatura del banco), `src/16` (`bn`/`bp`
in `aspettoFigurina225`), `src/01` (tabella con l'indice), `CARRIER-MANAGER-AV.html` ricomposto; `assets/aspetto/aspetto-432.json` +
7 file `*440*`; `assets/portraits/ai/indice.json`; `tools/aspetto-440.py`, `tools/ritratti/barba-440.py` (+ `barba-440.json`),
`tools/ritratti/indice-volti.mjs`, `tools/foto-440.py`; `tests/visual/misura-440.mjs`, `resa-barba-440.mjs`, `foto-440.mjs`,
`misura-432.mjs` (taglio forzato, tagli nativi), `barba-capelli-432.mjs` (colore della barba), `package.json`, `ci-runner.mjs` (riga MAPPA
`src/12-|src/13-`, quella che esiste già); foto `docs/collaudo-po/440-*.png`.

## 8. Dubbi per il PO (la consigliata per prima, già applicata)

**1. Da dove prendere il colore della barba.**
- **(consigliata, applicata)** Dalla figurina di ogni giocatore, misurato una volta offline (`bn`/`bp` nell'indice, +19 KB), con la tinta
  della classe come ripiego.
- Una tinta per classe di capelli (4 colori): più semplice, ma su figurine della stessa classe il mento va da L* 49 a 57 (Hammond/Bailey).
- Il colore dei capelli dipinti della testa (come il 432): è ciò che il PO ha bocciato.

**2. Baffi ancora piccoli e barba piena più rada della figurina.**
- **(consigliata)** Un giro di sola taratura delle mappe (baffi più larghi e alti di 1°, piena +15% di peli), stesse soglie e stesso
  guardiano, con le foto davanti.
- Trame a 1024×512 (più peli visibili nel primo piano, ~4× memoria per le trame).
- Lasciare così.

**3. Nuca a gradini di rasati e stempiati (difetto già del 432).**
- **(consigliata)** Allargare il guscio alla nuca con un peso misto testa/collo e misurare la compenetrazione in movimento (oggi 0 perché
  il guscio sta solo dove la testa pesa ≥ 0,9).
- Stoppia più chiara alla nuca per nascondere il gradino.
- Lasciare così (in campo non si vede).

**4. Capelli lunghi.**
- **(consigliata, applicata)** «Lunghi raccolti» = calotta + chignon in alto dietro, lontano da collo e spalle (0 contatti misurati).
- Codino che scende sulla nuca: più fedele ad alcune figurine, ma tocca collo e spalle nelle scene (andrebbe animato).
- Solo calotta, senza chignon.

**5. Crediti.** Gli asset di `assets/aspetto` sono nostri (generati da `tools/aspetto-432.py` e `tools/aspetto-440.py`).
- **(consigliata)** Una riga «risorse nostre» in `docs/governo/CREDITI-fonti.md` nel prossimo giro di governo (qui non si tocca).
- Nessuna riga.
