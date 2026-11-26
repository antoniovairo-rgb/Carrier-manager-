# Rapporto giro 367 — PO-651 «quando l'eroe sbaglia una conclusione la palla esce davvero di tanto»

Ramo `sviluppo/giro367-tiri-fuori`, base `lavoro/201` (ca852f31 = 7.999.215). GAME_VERSION non toccata, `docs/governo` non toccato.
La voce PO-651 non è nel `BACKLOG.md` della base (0 occorrenze): ho lavorato sul testo arrivato con l'incarico.

## In breve

- **Il difetto è vero e in partita è molto più grande che sul banco.** In 6 partite vere (11 tiri fuori dell'eroe) il pallone usciva a
  **6,33 m dal palo di mediana, 10,21 m al massimo**; 8 tiri su 11 oltre i 4 m.
- **Dopo la correzione, nelle stesse 6 partite e sugli stessi 11 tiri: mediana 0,94 m, massimo 5,86 m**; 1 su 11 oltre i 4 m.
- **L'esito non cambia:** stesso numero di conclusioni (28) e di tiri fuori (11) nei due bracci, esito `wide` in ogni fotogramma, nessun
  pallone in porta, tabellone fermo. Lo controlla il guardiano.
- **Tre cause misurate**, tutte in `src/12` (blocco del giro 223 e post-arco). Rosso `window.__CPM_NO_G367`.
- **Residuo dichiarato:** quando il portiere è addosso al tiratore non esiste un punto vicino al palo che rispetti le regole del giro 223:
  3 tiri su 69 sul banco (massimo 5,46 m) e 1 su 11 in partita (5,86 m). Il rimedio giusto è un esito che oggi non esiste — il tiro
  **alto sopra la traversa** — e lo porto come dubbio 1.
- **Un tiro fuori non passa MAI sopra la traversa** (0 su 69 prima, 0 su 69 dopo): oggi «fuori» vuol dire sempre «a lato».

## Come ho misurato

Una sorgente sola: la **mesh del pallone**, fotogramma per fotogramma e in **tempo di scena** (testimone `__CPM_GK229`, già esistente),
contro la **porta letta dalle mesh** della stessa scena (testimone nuovo `__CPM_PORTA367`: pali anteriori a x 48,6, mezza luce 3,66,
traversa 2,44; primo ostacolo dietro la porta: cartellone LED a x 50,23). La porta è costruita 7,32 × 2,44 unità: sul piano della porta
un'unità di scena è un metro. Corpi GLB accesi, un browser nuovo per ogni tiro.

- **Banco** (`misura-367.mjs`): 23 scene × 3 ripetizioni = 69 tiri, esito forzato «fuori» (`wide`, l'unico esito fuori dallo specchio che
  il motore assegna a tiro, testa, punizione e rigore). Famiglie: da fuori, potenza, di prima, uno contro uno, a giro, pallonetto, volée,
  testa, punizione, rigore.
- **Partite vere** (`partite-367.mjs`): salvataggi di collaudo s5, s12, s1 × semi 7 e 2021 = 6 partite per braccio, regime del gioco
  (teatro acceso), il pilota sceglie la conclusione quando la scena la offre, **gli esiti li decide il motore**.
- **Misura:** scarto dal palo quando il pallone arriva sul fondo, e quanto si allontana ancora dopo.

Tre cose che la misura ha corretto strada facendo, tutte mie:

1. Il pallone di un tiro fuori si ferma a x 48,5, **un decimo prima** del piano dei pali: la prima sonda aspettava un attraversamento che
   non avviene mai e dichiarava «non arriva alla linea» su ogni tiro.
2. Sul banco, a 8-25 fotogrammi al secondo, l'arco si chiude un passo prima del bersaglio: misurare sull'ultimo fotogramma dell'arco dava
   fino a 0,8 m di errore. Ora si misura col pallone sul fondo.
3. **Il banco non bastava.** Sul banco il portiere sta sulla linea e la terza causa (la più grave) non si vede: l'ho trovata solo giocando
   partite vere. La prima stesura della correzione migliorava il banco e lasciava le partite com'erano (6,67 m da 9 m).

## Prima — cosa ho trovato

### Partite vere (6 partite, 28 conclusioni dell'eroe, 11 fuori)

| Partita | Tiro | Da | Prima: esce a | Dopo: esce a |
|---|---|---|---|---|
| s5 · 7 | uno contro uno | 9 m | 8,82 m | 1,90 m |
| s5 · 7 | uno contro uno | 12 m | 2,91 m | 0,70 m |
| s5 · 2021 | potenza | 25 m | 5,05 m | 1,08 m |
| s12 · 2021 | potenza | 9 m | 7,33 m | 0,70 m |
| s12 · 2021 | punizione | 21 m | 0,25 m | 0,14 m |
| s12 · 2021 | a giro | 17 m | 4,77 m | 2,75 m |
| s12 · 2021 | potenza | 22 m | 10,21 m | 0,79 m |
| s1 · 7 | testa primo palo | 13 m | 6,33 m | **5,86 m** (residuo) |
| s1 · 7 | uno contro uno | 6 m | 8,12 m (poi fino a 10,75) | 0,95 m |
| s1 · 7 | a giro | 24 m | 2,90 m | 0,94 m |
| s1 · 2021 | testa in tuffo | 14 m | 6,41 m (poi fino a 8,47) | 0,71 m |
| **11 tiri** | | | **mediana 6,33 · 90° 8,82 · massimo 10,21** | **mediana 0,94 · 90° 2,75 · massimo 5,86** |

Entro 1,5 m dal palo: 1 su 11 prima, 8 su 11 dopo. Oltre 4 m: 8 su 11 prima, 1 su 11 dopo.

### Banco (69 tiri provocati) — scarto dal palo in metri: mediana · 90° percentile · massimo

| Famiglia | n | Prima: all'uscita | Prima: dopo l'uscita, fino a | Dopo: all'uscita | Dopo: dopo l'uscita, fino a |
|---|---|---|---|---|---|
| tiro da fuori | 6 | 1,32 · 7,47 · 7,47 | 8,23 | 0,95 · 1,18 · 1,18 | 1,18 |
| tiro di potenza | 6 | 2,09 · 5,32 · 5,32 | 11,68 | 1,56 · 2,31 · 2,31 | 2,31 |
| di prima | 6 | 1,63 · 3,51 · 3,51 | 7,83 | 0,73 · 1,70 · 1,70 | 1,70 |
| uno contro uno | 3 | 2,02 · 2,41 · 2,41 | 2,89 | 0,70 · 1,41 · 1,41 | 1,41 |
| a giro | 9 | 1,60 · 2,00 · 2,00 | 2,03 | 0,70 · 0,81 · 0,81 | 0,81 |
| pallonetto | 6 | 1,46 · 1,49 · 1,49 | 2,87 | 1,70 · 2,06 · 2,06 | 2,06 |
| volée | 6 | 1,54 · 3,92 · 3,92 | 3,92 | 2,31 · 5,46 · 5,46 | 5,46 |
| testa | 9 | 1,79 · 4,17 · 4,17 | 4,17 | 0,87 · 2,20 · 2,20 | 2,20 |
| punizione | 9 | 0,25 · 1,05 · 1,05 | 1,05 | 0,19 · 0,43 · 0,43 | 0,43 |
| rigore | 9 | 0,12 · 0,49 · 0,49 | 0,50 | 0,09 · 0,22 · 0,22 | 0,23 |
| **tutte** | 69 | **0,99 · 2,45 · 7,47** | **11,68** | **0,72 · 1,95 · 5,46** | **5,46** |

Letture oneste di questa tabella:

- Con 3-9 tiri per famiglia il 90° percentile coincide quasi sempre col massimo: le righe per famiglia dicono l'ordine di grandezza, non
  il decimale. Il bersaglio di lato è sorteggiato dal gioco: due censimenti non danno gli stessi numeri.
- **Pallonetto e volée sono peggiorati di mediana** (1,46 → 1,70 e 1,54 → 2,31). Due motivi: la varietà sotto il tetto che ho aggiunto
  alza il minimo (prima quasi tutti a 0,70 m), e nella volée c'è il residuo «portiere addosso» (5,46 m, una rovesciata da 6 m).
- **Dove finisce:** mai nei cartelloni né sugli spalti. In tutte le 138 tracce il pallone non supera x 48,5 (il cartellone è a 50,23) e
  la quota massima in volo è 4,8 m (il pallonetto). Il difetto era **di lato lungo la linea di fondo**, non in profondità.
- **Sopra la traversa: mai**, né prima né dopo.

## Le tre cause e la correzione

Tutte nel dispatcher della conclusione di `ThreeMatchView` (`src/12-three-match-view.jsx`).

1. **Ricerca del punto libero dal portiere (blocco del giro 223, ramo «fuori»).** Partiva dal bersaglio della variante così com'era
   (fino a 13 di lato per giro e secondo palo) e, se quel lato era coperto dal portiere, si allargava **sullo stesso lato** fino a 12
   prima di provare l'altro. Ora il punto di partenza ha un **tetto che cresce con la distanza del tiro** — `1,0 + 0,10 × distanza`,
   fra 1,5 e 4,0 m dal palo — e fra i due lati vince il punto libero più vicino al palo.
2. **Dopo l'uscita il pallone riceveva la respinta di una parata.** Il ramo della 7.514 (riflessione del volo + spazzata della mano del
   portiere) veniva applicato anche all'esito «fuori», dove nessuno tocca il pallone: rimbalzava e scivolava lungo il fondo (uscita a
   5,2 m, fermo a 11,68 m). Ora il pallone finisce la sua linea sul punto deciso al calcio (`_z367`), con un rimbalzo basso.
3. **«Libero dal portiere» falliva su ogni tiro obliquo** — è la causa dominante in partita. `_ok223` chiede che il pallone passi ad almeno
   1,3 u dal punto dove arriva il tuffo che sfiora; ma quel punto sta **per costruzione** a 1,3 u di lato dal pallone, quindi la distanza
   in pianta dalla traiettoria vale 1,3 × il coseno dell'angolo del tiro: sempre meno di 1,3. La condizione passava solo quando il tuffo
   era tagliato dai suoi tetti, cioè col pallone a circa 6 u dal portiere. Sul banco il portiere sta sulla linea e non si nota; in
   partita sta 3-4 u avanti e il bersaglio finiva a 6-10 m dal palo. Nel ramo 367 la stessa condizione si confronta con
   `1,3 × coseno` (meno 2 cm di stima). **Le altre regole del giro 223 non cambiano**: almeno 2,6 u in pianta dal corpo del portiere,
   scarto di lato sopra 1,3 u, mai davanti allo specchio, mai sul filo della portata.

In più, **varietà sotto il tetto**: senza, quasi ogni tiro fuori finiva identico sul minimo del giro 223 (0,70 m dal palo: 3 su 5 nella
prima prova in partita). Lo scarto sale da 0,70 verso il tetto con un numero preso dai decimali del bersaglio già sorteggiato (nessun
sorteggio nuovo), al quadrato perché i più restino vicini al palo, e pesa di più quando la qualità decisa dal motore (`P.hlQuality`) è
bassa.

Una correzione sbagliata che ho fatto e ritirato: preferivo un «fuori vero» lontano a un punto semplicemente libero vicino; su un
pallonetto ha prodotto 7,45 m dove il giro 223 dava 1,45 m (misurato, 2 tiri su 3). Ora, oltre il tetto, il risultato non è mai più largo
di quello del giro 223.

### Riferimento di «distanza credibile» — scelta mia, da confermare

Non ho una fonte verificabile sulla dispersione dei tiri sbagliati nel calcio vero: **il riferimento è una mia scelta geometrica**, non un
dato. L'ho costruito così: un errore d'angolo di 8-12 gradi dà 1,8 m dal palo da 8 m, 3 m da 20 m, 4 m da 30 m. Tetto adottato:
`1,0 + 0,10 × distanza`, mai sotto 1,5 né sopra 4,0 m; dentro il tetto, la gran parte vicino al palo (mediana sotto 1 m) e pochi più
larghi. Il PO può stringerlo o allargarlo cambiando due numeri (dubbio 2).

## Guardiano permanente

`npm run tiri-367` (verde + rosso `__CPM_NO_G367`), nella riga `src/12-|src/13-` della MAPPA che esiste già; `mappa-unica` verde.
Stesso strumento della sonda. Otto scene, una per famiglia di tiro/testa, ciascuna provocata (bersaglio di lato a ±11 dal gancio di solo
collaudo `__CPM_PZ367`) e naturale, più punizione e rigore: 18 tiri nel verde, 8 nel rosso.

- **Verde, per ogni tiro:** (1) esito `wide` in ogni fotogramma, nessun post-arco di rete o di legno, pallone mai in porta, tabellone
  fermo; (2) fuori davvero (mai nello specchio; tiro e testa ad almeno 0,5 m dal palo); (3) scarto entro il tetto + 0,35 m;
  (4) arrivo entro 0,35 m dal bersaglio deciso al calcio e nessuna scivolata oltre 1,2 m.
- **Rosso:** almeno 3 tiri provocati su 8 oltre 4,35 m dal palo e almeno 4 su 8 spinti a più di 0,35 m dal bersaglio. Soglie fissate
  dopo la misura (sempre 4 su 8 oltre 4,35 m in sei corse; 7 su 8 spinti nelle due corse in cui l'ho contato).
- Ultima corsa sul build definitivo: verde 18/18, mediana 0,88 m, massimo 4,07 m, scivolata 0,01 m; rosso mediana 7,33 m, massimo 8,43 m.
- **Limite dichiarato:** le otto scene sono scelte fra quelle in cui un punto libero sotto il tetto esiste. Il caso «portiere addosso» è
  fuori dal campione del guardiano e resta misurato solo dalle sonde.

## Foto prima/dopo

`docs/collaudo-po/367-tiro-potenza-prima.png` / `-dopo.png` · `367-di-prima-prima.png` / `-dopo.png` · `367-a-giro-prima.png` / `-dopo.png`
(corpi accesi, 412 × 915 a densità 2, pallone fermo a fine scena, stesso tiro provocato nei due bracci).

⚠️ Nelle foto il riquadro in basso dice «parata»/«conclusione centrale»: sul banco l'esito «fuori» è forzato sul 3D mentre il testo viene
dall'esito sorteggiato. È un limite del gancio di collaudo (lo stesso di `portiere-223`), non del gioco: in partita testo e 3D arrivano
dallo stesso esito.

## Cosa ho toccato (per l'unione col giro 364, fasce)

| File | Punto | Cosa |
|---|---|---|
| `src/12-three-match-view.jsx` | completamento dell'arco, ramo «PARATA o FUORI» (prima del ramo 7.514) | sul fuori di tiro/testa niente spinta, `_z367` |
| `src/12-three-match-view.jsx` | post-arco `deflect`, una riga prima del blocco 7.533 «il fuori esce dallo specchio» | il pallone converge su `_z367` |
| `src/12-three-match-view.jsx` | blocco del giro 223, ramo `else` del fuori (dopo `_cerca`) | tetto, varietà, `_ok367`/`_fuori367`, scelta del lato, testimone `__CPM_TIRI367` |
| `src/12-three-match-view.jsx` | una riga prima del blocco del giro 223 | gancio di solo collaudo `__CPM_PZ367` |
| `src/12-three-match-view.jsx` | dopo il testimone `__CPM_GK229` | testimone `__CPM_PORTA367` (solo banco) |
| `CARRIER-MANAGER-AV.html` | — | ricomposto (`check-src` identico) |
| `tests/visual/` | `tiri-367.mjs`, `misura-367.mjs`, `partite-367.mjs`, `package.json` (uno script), `ci-runner.mjs` (una voce nella riga src/12) | guardiano e sonde |
| `CLAUDE.md` | un invariante | «un tiro fuori esce di poco e nessuno lo respinge» |

**Non toccati:** i rami del **cross** (`t==="cross"`, esito `out`), gli archi dei passaggi, la camera, il motore del possesso, il portiere
(gesti e tempi), punizione e rigore (misurati: escono a meno di 1,05 m dal palo, non sono il difetto).
Punto d'attenzione per l'unione: il post-arco `deflect` è condiviso col cross fuori del giro 11; la mia riga vale solo per
tiro/testa/punizione/rigore (`_sf83`) e solo se `_z367` è della scena in corso.

### Unione con `lavoro/201` dopo il giro 364 (verificato a secco, senza unire)

Mentre giravo, `lavoro/201` è avanzato a `8543a9c` (unione del giro 364, fasce). Prova a secco con `git merge-tree`:
`src/12-three-match-view.jsx` e `package.json` si uniscono da soli; **due conflitti, entrambi «tenere tutte e due le aggiunte»**:
`CLAUDE.md` (due invarianti nuovi nello stesso punto) e `tests/visual/ci-runner.mjs` (due guardiani nuovi in testa alla stessa riga
`src/12-|src/13-` della MAPPA). `CARRIER-MANAGER-AV.html` va ricomposto con `node tools/build-src.mjs` dopo l'unione, non unito a mano.
La mia catena ha giudicato il build **senza** il giro 364: dopo l'unione vanno rigiocati almeno `tiri-367` e `portiere-223`, perché
tutti e due i giri toccano il dispatcher della conclusione.

## Catena

Tutto sul build definitivo (commit `6381d87`, `check-src` identico byte per byte), eseguito dentro il turno.

**`node ci-runner.mjs giro tiri-367` → 18/18 verdi al primo colpo** (nessun passo riprovato):
`tiri-367` (272 s) · `mappa-unica` · `test:logic` · `save-compat` · `replay` · `migrazione-194` · `design-system` · `tema-unico` ·
`griglia-mobile` · `career-critical` · `battito-264` · `partita-vera` (624 s) · `render-3d-023` · `tunnel-285` · `gk-dive-sync` ·
`home-298` · `schermate-97` · `web-237`.

**Guardiani della partita toccati, uno alla volta:**

| Guardiano | Esito | Nota |
|---|---|---|
| `portiere-223` (verde + rosso) | ✅ 340 s | è il blocco che ho modificato: 14 tiri sbagliati, nessuno attraverso il portiere, tuffi in tempo |
| `gk-miss-229` | ✅ 158 s | |
| `gesture-window` | ✅ 35 s | la respinta 7.514 resta sulla parata |
| `salti-274` (verde + rosso) | ✅ 756 s | |
| `goal-postarc` | ✅ 591 s | |
| `esito-rete-301` (verde + rosso) | ✅ 885 s | |
| `outcome-not-goal` | ✅ 132 s **in modalità forzata** (`CPM_FORCE=1`, 40 scene) | vedi sotto |

**Dichiarato:** `outcome-not-goal` nella modalità di default (flusso vero, fino a 420 giri di partita) non aveva chiuso dopo 30 minuti e
l'ho fermato; non so quanto dura sulla base (non è in `DURATE-GUARDIANI.json`). Ho eseguito la sua modalità forzata, che il guardiano
stesso dichiara adeguata per la domanda «l'arco punta la porta quando l'esito non è un gol?»: PASS, nessun esito non-gol in rete, nessun
pallone fuori dal rettangolo. **Il flusso vero di quel guardiano non è stato giudicato in questo giro**: lo copre il treno.
L'avviso che stampa (gi15, cross: post-arco `cross_goal>deflect`, pallone che non entra) riguarda un cross e non l'ho toccato.

**Non eseguiti perché non toccati:** `camera-241`, `portiere-265`, `portiere-295` (non muovo né la camera né il portiere).

Sottoprodotti della catena rimessi com'erano e non consegnati: `docs/governo/STABILITA.json` e le schermate di
`docs/collaudo-grafico/` rigenerate da `griglia-mobile`.

## Dubbi per il PO

**1. Il residuo «portiere addosso» (1 tiro su 11 in partita, 3 su 69 sul banco: 2,3-5,9 m dal palo da 6-13 m).**
Quando il portiere è a pochi metri dal tiratore, ogni punto vicino al palo passa a meno di 2,6 u da lui: per le regole del giro 223
non è un «fuori» ma una parata mancata.
- **(consigliata) Introdurre il tiro alto sopra la traversa** come secondo modo di sbagliare: è l'errore più naturale da vicino e oggi
  non esiste (0 su 138 tiri misurati). Tocca rete, barriera dello specchio, reazione del portiere e almeno tre guardiani
  (`outcome-not-goal`, `esito-rete-301`, `portiere-223`): è un giro a sé, non un ritocco.
- Lasciare com'è: il caso è raro (≈1 su 10 in partita) e resta sotto i 6 m.
- Abbassare a mano la distanza minima dal portiere (2,6 u) solo in questo caso: stringe il residuo a circa 4 m ma il pallone passa nel
  raggio del tuffo senza che il portiere lo tocchi. Sconsigliata: è il «codice 111» che il giro 223 ha chiuso.

**2. Quanto deve essere largo, al massimo, un tiro sbagliato.** Oggi il tetto è `1,0 + 0,10 × distanza`, fra 1,5 e 4,0 m dal palo.
- **(consigliata) Tenere questo tetto** e giudicarlo al telefono su una decina di partite.
- Più stretto (fra 1,0 e 3,0 m): quasi tutti i tiri fuori «sfiorano il palo»; rischio di monotonia.
- Più largo (fra 2,0 e 6,0 m): torna qualche tiro molto largo da lontano, più varietà ma più vicino alla segnalazione.
- Tetto unico di 3 m a qualunque distanza: più semplice, ma da 8 m tre metri sono un errore di 20 gradi.

**3. «Fuori» oggi vuol dire sempre «a lato», rasoterra o a mezza altezza.** Nessun tiro sbagliato passa sopra la traversa.
- **(consigliata) Deciderlo insieme al dubbio 1**: lo stesso lavoro dà sia il rimedio al residuo sia la varietà alto/a lato.
- Aggiungerlo solo come varietà (una quota dei tiri fuori, es. 1 su 3), senza legarlo al portiere.
- Lasciare solo «a lato»: coerente con cronaca e riquadri di oggi, che non distinguono «alto» da «a lato».

**4. Punizione e rigore fuori escono a 10-40 cm dal palo** (misurato: mediana 0,19 e 0,09 m). Non è il difetto segnalato, ma il pallone
vola verso lo specchio, atterra prima della linea e poi scivola fuori accanto al palo.
- **(consigliata) Aprire una voce di backlog a parte** e misurarla da sola: è un'altra catena (arco che finisce a x 43-46 e assestamento).
- Portarli sotto la regola di tiro e testa (bersaglio già oltre il palo all'armo dell'arco) nel prossimo giro dei tiri.
- Lasciare com'è.

**5. La correzione della terza causa vive solo nel ramo «fuori» del giro 367.** La stessa condizione di `_ok223` è usata anche per il
**palo** (scelta del legno libero dal portiere).
- **(consigliata) Lasciare il palo com'è** finché non c'è una segnalazione: lì il bersaglio è il palo e non si sposta.
- Misurare il palo in partite vere con la stessa sonda e decidere dopo.
- Applicare `_ok367` anche al palo subito: non misurato, sconsigliata.
