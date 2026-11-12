# Giro 178 — Intro sul telefono e un solo sviluppo del colore (PO-367, difetti D3 e D6 del giro 170)

Ramo `sviluppo/giro178-intro-colore`, partito da `lavoro/191` (commit `13fa539`). `GAME_VERSION` non toccata.
Riferimenti: `docs/collaudo/GIRO170-SCENE-3D.md` (ramo `collaudo/giro170-scene-3d`), righe 3 e 6 della tabella §1, D3, D6, piano §6 giro 3, §7.
Etichette: **[MISURATO]** numero prodotto in questo giro · **[LETTO]** letto nel codice · **[STIMA]** valutazione non verificata · **[NON CONFERMATO]**.

---

## 1. In una riga per il PO

| Difetto | Prima | Dopo |
|---|---|---|
| D3 — intro sul telefono: eroe fuori dal quadro | 57 fotogrammi su 104 (375×812) e 73 su 112 (412×915) con meno del 90% del corpo nel quadro; nell'esultanza e nella chiusura l'eroe **non c'è** | **0 su 90** e **0 su 101**; PC 8/93 → 7/85 (invariato per costruzione) |
| D3 — bandiere grigie | granata/crema/oro, spente in grigio dalla nebbia e dalla catena colore | nel colore del club dell'intro, ΔE 0,0 dal campione dello stesso esadecimale |
| D3 — tifo a quadratini | 2 nuvole di punti (900 + 520 quadratini) | 12 file di tifosi a sagome (atlante del giro 147) nei colori del club, che saltano e alzano le braccia dopo il gol |
| D6 — stesso club, colori diversi | stesso esadecimale reso con ΔE 5–19 dalla partita (presentazione/parata ~11, galà fino a 19, intro fino a 17) | **ΔE 0,0** in tutte le scene e per tutti e 4 i club (soglia dichiarata 2,0) |

Foto: `docs/sviluppo/giro178/` (prima-* / dopo-*) e fogli in `docs/sviluppo/giro178/fogli/`.

---

## 2. Soglie dichiarate PRIMA di correggere

Scritte nell'intestazione di `tests/visual/scene-178.mjs` prima della prima misura, mai abbassate:

- **S1** ΔE2000(campione piatto della scena, campione piatto della partita) ≤ **2,0** per ogni club e ogni scena fuori partita.
- **S2** intro: ΔE2000(bandiere a schermo, campione piatto dell'intro dello stesso esadecimale) ≤ **6,0**, con almeno 200 pixel di bandiera.
- **S3** intro: in **ogni** fotogramma disegnato con l'eroe visibile, ≥ 90% delle ossa dell'eroe e la testa dentro il quadro (375×812 e 412×915); su PC la quota non deve peggiorare di oltre 2 punti rispetto a prima.
- **S4** intro: zero nuvole di punti del tifo (Points con più di 300 vertici: i coriandoli, 140, non sono tifo) e almeno una folla a sagome.
- «Non giudicato» (scena non misurata, nessun fotogramma, nessun pixel, nessun riferimento) = rosso.

---

## 3. Metodo e limiti

**Strumento** [`tests/visual/lib/colore178.mjs`]: avvolge `THREE.WebGLRenderer` prima che il gioco lo usi (come il contatore del giro 170) e, dentro **un solo compito JavaScript** (il gioco non va fermato, le posizioni non cambiano):
1. ridisegna il fotogramma e ne legge i pixel (`readPixels` subito dopo il disegno);
2. ridisegna una **maschera** (maglie del club = rosso, bandiere/sciarpe/folla del colore del club = verde, resto nero, niente nebbia) → i pixel veri sotto la maschera, erosa di 2 px;
3. aggiunge davanti alla camera due **campioni** dello stesso esadecimale, creati come li crea quella scena (fuori partita `THREE.Color(hex)`, come `corpoCG23`/intro/galà; in partita texture sRGB, come le maglie) — **piatto** (MeshBasic) e **illuminato** (MeshStandard ruvido). Il campione piatto misura soltanto lo «sviluppo» (uscita, tonemapping, esposizione, conversione dei materiali): è la grandezza di D6, indipendente dalla luce della scena.

**Formati**: telefono 375×812 e 412×915 a scala 2, PC 1440×900. Corpi veri accesi (`__CPM_GLB=true`), teatro attivo (`__CPM_PRESENT=1`). Una pagina nuova per scena e club (lezione 7.483).

**Limiti dichiarati**
1. **Una prima versione della sonda era sbagliata** e l'ho corretta prima di prendere i numeri di questo rapporto: il campione era opaco, e nel galà i coni di luce additivi del palco (trasparenti, disegnati dopo gli opachi) ci passavano sopra, gonfiando il ΔE. Ora i campioni si disegnano nel passaggio trasparente, per ultimi. La misura «prima» è stata **rifatta per intero sull'HTML originale** (`git show HEAD:CARRIER-MANAGER-AV.html`) con la sonda corretta.
2. **La maglia in partita non viene letta dalla maschera** (riconosciuta in 1 caso su 4): le maglie della partita sono texture con motivo e il riconoscimento per esadecimale fallisce. Il riferimento di D6 è il campione, che usa lo stesso percorso texture-sRGB delle maglie; le colonne «maglia» sono informative.
3. **La folla della partita** (shader con colori per istanza) non è riconoscibile dalla maschera: non misurata.
4. Il galà non ha giocatori né colori di club in scena: lì si misura solo il campione.
5. Le misure della luminanza media variano fra due corse della stessa scena (galà, codice identico: 0,248 e 0,281, cioè ±6%): differenze sotto il 10% non sono separabili dal rumore.
6. Fluidità e resa sul telefono vero: **NON CONFERMATO** (rendering software, 1-12 fps).

Comandi (da `tests/visual`, `CPM_CHROME=/opt/pw-browsers/chromium`):
```bash
CPM_FASE=prima CPM_SCENE=presentazione,parata,gala,intro node scene-178.mjs   # misura + foto (le scene si accumulano nel file della fase)
CPM_FASE=prima CPM_CLUBS=saturo CPM_SCENE=partita node scene-178.mjs           # riferimento partita (lungo)
npm run scene-178                                                              # guardiano: verde + prova del rosso
```

---

## 4. Misure [MISURATO]

### 4.1 Lo sviluppo del colore (D6): campione piatto, ΔE2000 dalla partita

Tabelle complete: `docs/sviluppo/giro178/tabella-prima.md`, `tabella-dopo.md`, dati grezzi `misure-prima.json`, `misure-dopo.json`.

| Scena | catena prima (tone/esposizione/uscita) | chiaro #facc15 | scuro #1e3a5f | saturo #dc2626 | bianco #f5f5f5 | dopo (tutti) |
|---|---|---|---|---|---|---|
| Presentazione | nessuna / 1 / lineare | 10,9 | 11,3 | 10,3 | 11,6 | **0,0** |
| Parata | nessuna / 1 / lineare | 10,9 | 11,3 | 10,3 | 11,6 | **0,0** |
| Galà | ACES / 1,12 / lineare | 5,8 | 19,1 | 13,2 | 1,3 | **0,0** |
| Intro | ACES / 1,05 / lineare | 5,0 | 17,1 | 11,4 | 0,3 | **0,0** |
| Partita (riferimento) | ACES / 0,52 / sRGB | — | — | — | — | — |

Esempio del difetto in RGB, stesso #dc2626: partita 177,0,17 · presentazione e parata 220,38,38 (l'esadecimale crudo) · galà 220,63,57 · intro 215,57,52.

Pixel veri (informativi): nella parata prima la maglia gialla usciva a 255,255,48 e la fiancata del pullman a 255,255,34 (bruciate, «giallo piatto» del giro 170); nella presentazione il prato era il verde lime saturo.

### 4.2 Luminanza media della scena (non giudicata, regola dichiarata: non più scura del 10%)

| Scena | prima | dopo | rapporto | guadagno di luce |
|---|---|---|---|---|
| Presentazione | 0,607 | 0,565 | 0,93 | 2,3 |
| Parata | 0,368 | 0,328 | 0,89 | 4,0 |
| Galà | 0,281 | 0,263 | 0,94 | 2,2 |
| Intro | 0,170 | 0,163 | 0,96 | 1,0 |

La parata resta all'89%, cioè dentro il rumore di misura (§3 punto 5). Taratura: tre corse (guadagni 1 · 1,9 · 2,5/3,2), interpolazione.

### 4.3 Intro sul telefono (D3): fotogrammi con l'eroe fuori dal quadro

| Formato | prima | dopo |
|---|---|---|
| 375×812 | 57 / 104 | **0 / 90** |
| 412×915 | 73 / 112 | **0 / 101** |
| 1440×900 | 8 / 93 | 7 / 85 |

Al primo giro della correzione restavano 3 fotogrammi su ~100 fuori fra 10,96 e 11,56 s (lo scatto verso la curva dopo il gol, camera in ritardo): corretti con lo sguardo sull'eroe dal gol in poi e un inseguimento più rapido (§5.2 e).
Bandiere: prima **0 pixel** riconosciuti nell'esultanza (troppo piccole e spente); dopo ~3.000 pixel per club, ΔE 0,0 dal campione. Tifo: prima 2 nuvole di punti, dopo 0 e 12 file a sagome.

---

## 5. Cosa è cambiato

### 5.1 D6 — una sola funzione di resa (`src/11`, accanto a `loadGLB`)

`sviluppoColore178(renderer, scene, {luce, nome})`, chiamata da intro (`src/19`), presentazione, parata e galà (`src/16`) subito dopo la creazione della scena:
- **renderer**: uscita sRGB, ACES, esposizione `SVIL178.expo` = 0,52 (lo stesso numero della partita, `src/12`);
- **materiali**: ogni colore/emissivo scritto come esadecimale si porta in lineare una volta (riconosce i colori riscritti più tardi e li riconverte); le texture-colore su canvas/immagine si dichiarano sRGB; i colori per vertice (coriandoli) idem. I fattori dei GLB **non** si toccano (sono già lineari): `loadGLB` li marca alla nascita (`userData._g178`), e un clone ritinto si riconosce perché il suo colore non è più quello del file. I materiali con shader modificato (la folla a sagome del giro 147, colori per istanza) restano come in partita: convertirne la texture sbiancava il pubblico della presentazione (visto nelle foto della prima stesura, corretto);
- **luce**: guadagno per scena `LUCE178` applicato solo durante il disegno (`scene.onBeforeRender/onAfterRender`), così vale anche per i corpi che arrivano dopo e per le luci animate.

Rosso **`__CPM_NO_G178_COLORE`**: la funzione non fa nulla, ogni scena torna alla sua catena. La funzione **non sceglie colori**: le scelte dei giri 168/171 restano intatte.
Non toccati: il renderer della partita (`src/12`), l'intervista 3D (non montata, solo col rosso `__CPM_NO963`), il visore giocatore di `src/01` (codice morto).

### 5.2 D3 — intro (`src/19`), rosso **`__CPM_NO_G178_INTRO`**

Solo in verticale (aspetto < 0,62); il PC non cambia:
- (a) ottica allargata come al galà (giro 47) fino al campo orizzontale di un'inquadratura 0,62, tetto 72° (375×812 → ~64°);
- (b) nelle tappe che seguono l'eroe lo sguardo va su di lui (al massimo 1,2 unità oltre), non 5 unità oltre;
- (c) apertura: lo sguardo si mescola verso l'eroe;
- (d) tiro e gol: la camera-gol di PC lascia l'eroe alle spalle; in verticale la camera sta sul prolungamento porta→eroe (4,6 dietro, 2,4 sopra);
- (e) dal gol all'arrivo sotto la curva lo sguardo insegue l'eroe più svelto.

Sempre (anche PC): bandiere e sciarpe nel colore del club dell'intro e senza nebbia; i due strati di punti diventano file di tifosi a sagome disegnate con l'atlante della folla del giro 147 (`_folla129Atlas`), tinte coi colori del club; dopo il gol posa a braccia alzate e salto.

---

## 6. Guardiani e catena

Tutti eseguiti uno alla volta (`CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno) sul build finale (`check-src`: IDENTICO BYTE PER BYTE).

| Guardiano | Esito |
|---|---|
| **scene-178** (nuovo) | verde col verde (S1 ΔE 0,0 su 4 club × 4 scene, S2 bandiere ΔE 0,0, S3 0 fotogrammi fuori a 375 e 412, PC 7/85, S4 0 punti · 12 file a sagome); **rosso col rosso** (21 rossi con `__CPM_NO_G178_COLORE` + `__CPM_NO_G178_INTRO`) |
| intro-292 | verde (e rosso atteso) |
| presentazione-200 | verde (e il rosso si vede) |
| premiazione-palco-191 | verde (e il rosso si vede) |
| cerimonie | PASS |
| stadi-071 | verde (e il rosso si vede) |
| kit-061 | PASS |
| tema-unico | verde (e rosso atteso) |
| colori-286 | uscita 0 |
| intro-118 | verde |
| spalle-146 | verde (e i rossi cadono) |
| **flussi-115** | prima corsa: braccio verde 54/54, **braccio rosso CIECO su G184-11**. Causa: il rosso toglie il velo dietro le didascalie dell'intro per mostrare che il contrasto cade (prima c'era la bandiera bianca dietro); con la nuova regia verticale dietro le scritte c'è scena scura e senza velo il contrasto regge. Correzione nella sonda, non nelle soglie: il braccio rosso riproduce la 183 accendendo anche i due rossi del giro 178. Seconda corsa: verde 54/54, rosso su tutti i 17 punti |
| griglia-mobile | uscita 0 (14 schermate × 5 larghezze); le foto che riscrive in `docs/collaudo-grafico/` sono state ripristinate, non fanno parte del lavoro |
| design-system | SISTEMA GRAFICO OK |
| career-critical | PASS |
| test:logic | uscita 0 |
| save-compat | 12 pass · 0 fail |

Non eseguiti: il gate completo e `partita-vera`. Il renderer della partita (`src/12`) non è stato toccato; l'unica riga condivisa con la partita è la marcatura `userData._g178` dentro `loadGLB` (`src/11`), che nessun codice della partita legge. Sceglie la sessione madre se serve la catena completa (direttiva PO 22/09: nel dubbio si sceglie la completa — qui la funzione di caricamento GLB è condivisa, e lo segnalo).

---

## 7. Domande per la sessione madre

1. **Quale club nell'intro rivista da Home/Profilo?** Il primo passaggio avviene dopo la creazione, quando il giocatore non ha ancora un club: l'intro usa il suo club fittizio (maglia granata/bianca dell'eroe). Ho tenuto questo club anche nel «Rivedi l'intro». Si vuole che, rivista con un club vero, l'intro prenda i colori del club del giocatore (eroe, bandiere, tifo)? È una scelta di colore, non l'ho fatta.
2. **Luminosità delle scene fuori partita.** La regola che mi sono dato (non più scure del 10%) lascia la scena un po' più morbida e meno satura di prima (nessun colore bruciato, prato non più lime). La presentazione con guadagno 2,5 sembrava già lattiginosa, per questo mi sono fermato a 2,3. Il giudizio vero è sul telefono del PO: i guadagni stanno in una riga (`LUCE178`, `src/11`).
3. **Pubblico della presentazione più chiaro di prima.** Ora è trattato come in partita (dove lo stesso pubblico, con gli stessi colori per istanza, passa per l'uscita sRGB senza conversione e risulta anch'esso più chiaro). Se lo si vuole più saturo, va corretto **in tutte e due** le scene (`buildFolla129`), non qui: tocca la partita e il gate.
4. **Parata: il tetto del pullman rosso con guadagno 4,0 tende all'arancio chiaro sotto la luce diretta** (la faccia frontale è rossa). È luce, non sviluppo; nelle foto prima il pullman era piatto e bruciato. Da guardare sul telefono.
5. **PC dell'intro**: restano 7 fotogrammi su 85 con l'eroe parzialmente fuori (camera-gol di PC e prima tappa). Il compito diceva «PC invariato» e l'ho lasciato; se si vuole, lo stesso rimedio (d) vale anche per PC.
6. **Apertura dell'intro**: il giro 170 proponeva di «alzare l'orizzonte» (superficie scura in basso a sinistra, fuori dal prato). Non l'ho fatto: l'eroe ora è nel quadro anche lì, la superficie resta.
