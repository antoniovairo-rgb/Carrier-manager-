# Rapporto — giro 203 (versione 7.999.195), PO-460 e PO-464

Ramo `sviluppo/giro203-sigle-clip`, partito da `lavoro/195` (commit `3f605c9`). `GAME_VERSION` non toccato.
Foto prima/dopo in `docs/sviluppo/giro203/`.

| Voce | Cosa | Rosso | Guardiano |
|---|---|---|---|
| PO-460 | sigle e nomi tagliati nella barra in alto della partita | `window.__CPM_NO_G203` | `npm run sigle-203` (nuovo) |
| PO-464 | clip Rohr 3,30 MB oltre il tetto di 3,00 MB | il file di prima | `npm run clip-180` (tetto invariato) |

---

## A) PO-460 — sigle tagliate nella barra della partita

### La foto del PO
`docs/collaudo-po/193-sigle-tagliate-barra.jpg` **non è sul ramo `lavoro/195`**: sta nel commit `89a3375e` (BACKLOG PO-460)
di un altro ramo. L'ho letta da lì senza copiarla. Mostra FC Frankfurt (FFT) contro FC Wolfstadt (WOL), Deutsche Liga:
«FF» a sinistra, «WO» a destra contro lo stemma, e al centro **il tasto ⚠️ degli strumenti di collaudo** (acceso di serie,
`DEVTOOLS_DEFAULT=true`) con i tasti pausa/audio/velocità molto distanziati.

### Perché le misure precedenti non lo vedevano
Col puntatore del PC il centro della barra è largo **126 px** a 375; **col touch** (telefono: `pointer:coarse`) i tasti hanno
l'area di tocco da 44 px e i loro margini, e il centro sale a **211 px** (misurato: 82→293 a 375). Una sonda senza touch
misura una barra che il telefono non mostra. Prima misura (senza touch, sul DOM vero, 259 club): a 375 px al massimo 0,8 px
fuori — «tutto intero». Con touch (`isMobile`+`hasTouch`), stesso caso della foto:

| Vista (touch) | FFT: spazio / testo | WOL: spazio / testo |
|---|---|---|
| 360 | 10 / 19 px | 11 / 22 px |
| 375 | 15 / 19 px (**4 px tagliati**) | 17 / 22 px (**5 px**) |
| 390 | 19 / 19 px | 22 / 22 px |

È la misura del giro 195 («4-5 px a 375») riprodotta.

### Misura prima (braccio rosso del guardiano, 259 club, ognuno a campo normale e invertito = 520 nomi per vista)

| Vista | in sigla | testo fuori dalla casella | max | testo sotto lo stemma | max |
|---|---|---|---|---|---|
| 360×640 touch | 520 | **520** | 11,9 px (FC Swans «SWA») | **231** | 5,7 px (FC Hamburg «HMB») |
| 375×667 touch | 520 | **520** | 9,3 px (FC Wolverhampton «WLV») | **41** | 3,3 px |
| 390×844 touch | 518 | **18** | 1,2 px (FC Werkstadt «WRK») | 0 | — |
| 1366×768 PC | 0 | 0 | — | 0 | — |

Le sigle più larghe sono quelle con W/M (WLV, WRK, WSR, HMB, MRA, MRB) e SWA/TWE.

### Correzione (`src/15` barra, `src/11` NomeSquadra182)
1. **Sotto i 390 px lo stemma va sopra e il nome/sigla sotto, centrato** (stemma 19 px). Il nome non divide più la larghezza
   della striscia con lo stemma, quindi non può finirci sotto, e ha tutto lo spazio della striscia.
2. **Fra 390 e 419 px** la striscia resta in riga ma si compatta: margine interno 8→4 px, spazio 6→4 px, stemma 26→22 px.
3. **Ultima garanzia** (prop `adatta`, solo sulla barra): se anche la sigla non entrasse, il corpo del testo scende fino a
   **12 px**, il minimo della scala tipografica `FS` del gioco («floor 12px»), invece di essere ritagliato. Nelle misure di
   questo giro **non è mai scattata** (corpo ridotto 0 su tutte le viste): è una rete per larghezze o caratteri non misurati.
4. **Le regole 1 e 2 valgono solo col puntatore touch** (`pointer:coarse`). Col mouse il centro è largo ~126 px a 375 e le
   sigle entrano già (misurato: max 0,8 px), quindi PC e finestre strette col mouse restano come prima. Prima stesura senza
   questa condizione: `nomi-190` andava ROSSO a 375 px (vedi Dubbi, punto 9) — corretta restringendo al touch, nomi-190 di
   nuovo VERDE 23/0.

Rosso `window.__CPM_NO_G203`: toglie 1, 2 e 3 (barra come prima).
Varco di prova `window.__CPM_BARRA203(casa, ospiti)` (+ `__CPM_SWAP203` per il campo invertito): **solo sotto `?cpmtest=1`**,
cambia soltanto le squadre mostrate sulla barra.

### Misura dopo

| Vista | in sigla | fuori | sotto lo stemma | corpo ridotto |
|---|---|---|---|---|
| 360×640 touch | 356 | 0 (max 0,3 px) | 0 | 0 |
| 375×667 touch | 255 | 0 (max 0,5 px) | 0 | 0 |
| 390×844 touch | 456 | 0 | 0 | 0 |
| 1366×768 PC | 0 | 0 | 0 | 0 |

Effetto collaterale misurato: a 360 e 375 i nomi interi o abbreviati crescono (in sigla 520→356 e 520→255), perché il nome
ha tutta la larghezza della striscia.

Foto: `barra-<vista>-FFT-WOL-prima/dopo.png` (il caso del PO), `barra-<vista>-larghe-prima/dopo.png` (le due sigle più
larghe), `confronto-375-prima-dopo.png`. La foto «prima» a 375 riproduce esattamente quella del PO («FF», «WO»).

### Guardiano `npm run sigle-203` (≈ 8 min in tre passate)
Sul gioco vero, partita del provino, ogni club del gioco sulla barra (casa e ospiti, campo normale e invertito); telefono
**con touch** a 360/375/390, PC senza touch a 1366. Per ogni nome: px di testo fuori dalla casella (rettangolo vero del testo
con `Range`), px di testo dentro il rettangolo dello stemma (intersezione in due dimensioni), testo = gradino intero della
scala, corpo ≥ 12 px. Tolleranza 0,5 px (la stessa che `NomeSquadra182` usa per decidere se un testo entra).
- verde telefono: **18 ok · 0 ko**; verde PC: **8 ok · 0 ko**;
- rosso (`CPM_ROSSO203=1`): 5 ko, «prova del rosso: il difetto si vede» (esce 0 solo se vede il difetto, 1 se cieco).
- «Non giudicato» = rosso: meno di 250 club, meno del 95% dei nomi misurati o una vista mancante fanno fallire.
- `CPM_VISTE=360,375,390` / `CPM_VISTE=1366` scelgono le viste (la passata unica supera i 10 minuti).

---

## B) PO-464 — clip Rohr sotto i 3,00 MB

### Misura prima
`assets/cgtrader-clip-rohr.glb` = **3.298.744 byte**: JSON 345.944, binario 2.952.772, di cui **rotazioni 2.887.904 (97,8%)**
in float32, traslazioni 48.324, istanti 11.744. 28 clip, 1.439 canali (1.407 rotazioni, 32 traslazioni), tutti LINEAR,
nessun canale costante (soglia 1e-5). `clip-180`: **ROSSO** «peso 3298744 > 3000000».

### Correzione
`tools/rohr-180/quantizza-203.mjs`: le uscite di **rotazione** passano da float32 a **int16 normalizzato** — formato del
glTF 2.0 di base per le rotazioni delle animazioni, letto da three r128 (`GLTFLoader.js` r.3053,
`getNormalizedComponentScale`). Non cambia altro: stesse clip, stessi istanti (stesso numero di chiavi, 30 fps), stessa
interpolazione, traslazioni e scheletro in float32, nessuna chiave tolta. Stesso file, stessa licenza, nessun asset nuovo.
Risultato: **1.878.652 byte (1,88 MB)**, −43%.

### Misura dopo e scarto delle pose
`tools/rohr-180/scarto-203.mjs <prima> <dopo>`: carica i due file col `GLTFLoader` e l'`AnimationMixer` di three r128 e
campiona ogni clip ogni **1/60 s** (le chiavi a 30 fps e i punti a metà, dove lavora l'interpolazione).

| | prima | dopo |
|---|---|---|
| clip | 28 | 28, stessi nomi e ordine |
| ossa | 75 | 75, stessi nomi |
| durate / chiavi / istanti | — | identici su tutte le tracce |
| 30 fps | sì | sì |
| scarto massimo di rotazione locale | — | **0,0034°** |
| scarto massimo di posizione delle ossa nel mondo | — | **0,122 mm** |
| norma dei quaternioni (|q|−1) | — | max 2,7·10⁻⁵ |

534.600 campioni osso×istante. **Soglie dichiarate: 0,05° e 0,5 mm.** Perché: il limite teorico della quantizzazione a 16 bit
è 1/32767 per componente, ≈ 0,0035° per osso; le soglie stanno ~15 volte sopra il limite (margine per la catena delle ossa)
e ~1.000 volte sotto ciò che si può vedere su un corpo alto 1,8 m in un telefono (un pixel a figura intera vale svariati mm).
Lo strumento vede: con `CPM_SOGLIA_DEG=0.001` va rosso.

Prova sul corpo vero (`clip-180-foto`, vertici deformati del corpo CGTrader, prima e dopo, misure in
`giro203/clip-prima|clip-dopo/misure-mesh.json`): compenetrazione col suolo, quota sotto 1 cm e percorso del bacino
**identici su tutte le 28 clip**; cambia solo `t_sotto` in tre clip (throw-in 7,4→7,5 s, clapping-hands-up 0→3,9 s,
clapping-and-agree 3,0→0,1 s) con **profondità identica**: sono pareggi fra istanti con lo stesso valore (le due ultime sono
clip ad anello, dove primo e ultimo fotogramma coincidono). Foto di due clip (rimessa, parata 03, telefono): differiscono nello
0,08% dei pixel (JPEG del renderer software).

### Guardiano `clip-180`
Tetto **3,00 MB invariato**. Modifiche al guardiano:
- legge le rotazioni int16 normalizzate (dequantizzate come fa three) nella prova della chiusura degli anelli;
- **nuovo controllo di formato**: istanti float32, uscite float32 oppure (solo rotazioni) int16 normalizzato;
- nella giunzione degli anelli i quaternioni si normalizzano prima del prodotto. Senza, la norma 1±10⁻⁴ dei valori a 16 bit
  dava ~1° di «anello aperto» falso su 15 clip (acos vicino a 1 è sensibilissimo). Soglie (0,5° · 1 mm) invariate.

Verde: `VERDE clip-180` (1,88 MB). Rosso: col file di prima (`CPM_CLIP180=<file di prima>`) **ROSSO**: «peso 3298744 > 3000000».

---

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima di ognuno)

| Controllo | Esito |
|---|---|
| sigle-203 | verde telefono 18/0 · verde PC 8/0 · rosso visto (5 ko) |
| clip-180 | VERDE; rosso col file di prima |
| clip-180-foto | eseguito prima e dopo, misure identiche (sopra) |
| licenze-184 | verde; prova del rosso «il guardiano vede (4 rossi)» |
| tpose-196 | VERDE sui 4 scenari (0 T-pose, 0 corpi non CGTrader, 0 procedurali); rosso atteso visto. Eseguito scenario per scenario (uno da ~5-10 min) |
| testi-190 | VERDE 14/0 (prima e dopo la restrizione al touch) |
| nomi-190 | VERDE 23/0 dopo la restrizione al touch (prima stesura: ROSSO 21/2, vedi Dubbi 9) |
| griglia-mobile | uscita 0, misura completa 14 schermate × 5 larghezze |
| highlight-95 | «verde (e il rosso si vede)»: verde 108 highlight, D4 0, passaggi arrivati 89,3%, gol del compagno = assist 12/12 (≈ 85 min) |
| career-critical | uscita 0, tutti PASS |
| test:logic | 51 pass · 0 fail |
| save-compat | 12 pass · 0 fail |

Le sonde `clip-180-foto`, `tpose-196` e `griglia-mobile` riscrivono foto di altri giri (`giro180/`, `giro196/`,
`collaudo-grafico/g0/`): le ho rimesse com'erano. La catena è stata spezzata in gruppi per il tetto di 10 minuti a chiamata;
un riavvio del contenitore è avvenuto durante `tpose-196`, il cui registro era già completo (4 verdi + rosso).

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.

---

## Dubbi per il PO

1. **Stemma sopra il nome sotto i 390 px**: è un cambio di aspetto della barra sul telefono piccolo (foto `confronto-375-prima-dopo.png`).
   Alternative possibili non adottate: togliere il tasto ⚠️ dalla riga del centro, ridurre i margini fra le aree di tocco
   (rischio di aree che si sovrappongono), o rimpicciolire la sigla sotto i 12 px. Da confermare.
2. **Soglia 390 px**: a 390 col touch la barra resta in riga e 456 nomi su 520 vanno in sigla; a 360/375 in colonna solo 362/251.
   Portare la colonna fino a 419 px darebbe più nomi interi anche a 390-412, ma cambia l'aspetto su più telefoni. Non deciso.
3. **La larghezza del telefono del PO non la conosco**: la foto è larga 1220 px fisici, il rapporto pixel/CSS non è nella foto.
   Ho misurato le quattro viste richieste; 412 px (la vista di riferimento di `ui-reviewer`) non è nel guardiano.
4. **La foto `193-sigle-tagliate-barra.jpg` non è su `lavoro/195`** (è nel commit `89a3375e` di un altro ramo).
5. Il varco di prova `__CPM_BARRA203` vive nel gioco (solo `?cpmtest=1`) per poter mettere 259 club sulla barra in una sola
   pagina.
6. **sigle-203 non è in `ci-runner.mjs`** (né in `mirata`/`notte`): dove metterlo spetta al PO. Durata ≈ 8 min.
7. Clip Rohr: il formato int16 è glTF di base; il gioco oggi **non carica** il file (resta fuori da `dist/`, decisione 180b).
   Quando lo collegherà, il caricatore è lo stesso già provato qui (three r128). `tools/rohr-180/rifai-184.sh` produce di nuovo
   il file in float32 (>3 MB): dopo un rifacimento va ripassato `quantizza-203.mjs`. Non ho cambiato `rifai-184.sh`.
8. `clip-180-foto` scrive di serie in `docs/sviluppo/giro180/`: l'ho fatto scrivere in `giro203/` e ho rimesso com'erano le
   foto del 180 che aveva sovrascritto.
9. **Scala dei nomi senza un gradino**: per i club senza sigla societaria in testa (es. «Torino Athletic Primavera») la scala è
   intero → «Torino Athletic U19» → sigla, senza «Torino Athletic». `nomi-190` lo pretende quando quel nome entra; finora non
   entrava mai (58 px). Col layout a colonna senza la condizione touch entrava (100 px) e nomi-190 è andato rosso. Non ho
   cambiato la scala (la fissa il caso puro dello stesso nomi-190): da decidere se aggiungere il gradino.
10. I numeri del braccio rosso variano un poco fra due esecuzioni (max fuori a 360: 11,9 / 12,0 px; casi in testa diversi a
   pari misura): l'esito (520/520 fuori a 360 e 375) è stabile.
