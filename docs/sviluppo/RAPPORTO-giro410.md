# Rapporto giro 410 — PO-676: le parate sui tiri centrali

**Base:** `lavoro/202` (7.999.216 + giro 401) · **Ramo di consegna:** `sviluppo/giro410-portiere-centrale`
**Parole del PO (26/11, sulla 7.999.216):** «fare attenzione ai tiri, soprattutto centrali, che in teoria sono parati dal portiere,
sembrano gol perché il portiere si butta prima».
**Rosso unico:** `window.__CPM_NO_G410` · **Guardiano:** `npm run portiere-410` (riga della MAPPA di `src/12-|src/13-`, accanto a `portiere-295`).
`GAME_VERSION` e `docs/governo` non toccati.

## 1. Cosa ho misurato prima di toccare (No Blind Fix)

Strumenti nuovi (solo collaudo):
- testimone `__CPM_GKTL` esteso (solo `__CPM_REC`): **bacino visibile** del corpo GLB del portiere (`vx/vz/vy`) e nome della clip (`cn`).
  Fino a oggi si misurava la posizione *procedurale* del portiere, non dove si vede il corpo.
- gancio `__CPM_SVZ410` (solo `?cpmtest=1`): bersaglio della parata a `dz` u di lato dal portiere, per separare centrali e laterali.
- `__CPM_GKACT.tt410/t410` (solo `?cpmtest=1`): il testo dell'esito dice «tuffo»? tipo di conclusione.
- sonde `tests/visual/misura-410.mjs` (scene forzate, GLB acceso, `__CPM_PRESENT=1` + `__CPM_CINE=1`, pagina nuova per scena) e
  `tests/visual/misura-410-vere.mjs` (partite vere seedate dal salvataggio S5, pilota automatico, chiave di scena per fotogramma).

Definizioni: **contatto** = primo fotogramma col pallone sul piano del portiere, in tempo d'arco (= tempo di scena); **lato** = distanza
di lato del punto di passaggio dal portiere calcolata dal gioco all'armo; la clip del tuffo è in piedi fino a 0,8 s, **in volo 0,8-1,25 s,
a terra da 1,25 s** (misura del 7.855, ricontrollata sulla clip).

### Prima (build di partenza, 18 pagine forzate, 12 tuffi misurati)

| misura | valore |
|---|---|
| tuffi **già a terra al contatto** | **12 su 12** (clip a 1,41-1,50 s, bacino a quota 0,17) |
| stacco prima del contatto | 0,12-0,45 s; a terra 0,04-0,20 s **prima** che arrivi il pallone |
| tuffi su tiri **centrali** | gi90 lato 0 e 0,42 (testo «si distende»), gi165 lato 1,45, gi9 lato 1,81 |
| pallone dal **bacino visibile** al contatto | **2,0-2,1 u** (minimo lungo il volo 2,6-2,7) |
| spinta laterale propria della clip | **1,6-1,8 u** (fino a 3,3 nel braccio rosso del guardiano) oltre il punto deciso dal gioco |

Causa misurata, tre pezzi che si sommano:
1. **la clip sposta il corpo per conto suo**: le clip del tuffo e del riflesso portano il bacino di lato (gk-dive +3,1 m, gk-block +1,4 m,
   nota del 23/09) e il gioco sposta già il corpo verso il pallone (`_diveToZ`): le due spinte si sommano, il corpo finisce 1,6-1,8 u oltre
   il pallone. Da fuori: **il pallone entra dove il portiere era**.
2. **il tuffo arriva giù prima del pallone**: lo scrub della clip (7.855) portava la clip a 1,5 s al contatto, cioè a terra.
3. **centrali trattati come laterali**: soglia del riflesso a 1,2 u; e il testo «si distende» forzava il tuffo anche su un pallone
   addosso al portiere (ramo 119: da meno di 2 u l'arco finisce sul suo corpo).

Dopo la prima correzione è emerso un quarto pezzo, misurato con la cinematica delle clip (`mani.mjs`, mani e bacino in metri):
4. **tutte le clip del riflesso sono parate a terra** (gk-block, body-block-2/-3: bacino a 14-20 cm da 0,8 s): sui palloni a mezz'altezza
   (0,6-1,1) il corpo stava steso **sotto** il pallone. Nel pacchetto Mixamo ci sono due **prese in piedi mai usate**:
   `mx-goalkeeper-catch` (mani 0,56 m a 0,75 s → 0,90 m a 1,28 s) e `mx-goalkeeper-catch-2` (mani 1,38 m a 0,42 s).

## 2. Correzione alla sorgente (tutto in `src/12-three-match-view.jsx`)

| punto | cosa cambia | rosso |
|---|---|---|
| scelta del gesto sulla parata (`oppActType` dopo `_close148`) | tiro parato entro **2,0 u** di lato (portata da fermo: mezzo corpo + braccio + un passo) = riflesso sul corpo, rimirato a ogni fotogramma dal canale `_blk229`; il rigore resta col suo regime (soglia 1,2) | `__CPM_NO_G410` |
| prima del punto di passaggio (`_zp229`) | se il testo dice «tuffo» ma il tiro gli arriva addosso, il pallone passa **2,6 u di lato** (dal lato del tiro, nello specchio): testo, gesto e geometria coerenti. Non sul rigore | `__CPM_NO_G410` |
| `_rad410`, subito dopo `_a.root.position.set` del corpo GLB | per il portiere che reagisce (tuffo o riflesso) lo spostamento laterale del bacino dovuto alla clip si toglie dalla radice: **il corpo visibile sta dove lo mette il gioco** (una guida sola). Quota, braccia e volo restano della clip. Vale anche per i tuffi della cronaca e sul gol subito | `__CPM_NO_G410` |
| scrub del tuffo (7.709/7.855) | il volo del pallone porta la clip a **1,1 s** (in volo, braccia distese) invece di 1,5 (a terra); lo stacco cade al ~66% del volo, la terra **dopo** il pallone | `__CPM_NO_G410` |
| scrub del riflesso (nuovo, accanto a quello del tuffo) | anche il riflesso ha la sua posa chiave **al contatto** (0,95 s, o quella della presa); prima girava sulla vita del gesto e al contatto stava a 1,8-3,3 s | `__CPM_NO_G410` |
| `_scegliGesto23` (variante del riflesso) | col pallone a **0,45 o più** di quota al contatto il riflesso suona una **presa in piedi** (`mx-goalkeeper-catch` sotto 1,05, posa scelta sulla quota; `mx-goalkeeper-catch-2` sopra); sotto resta la parata a terra per lato | `__CPM_NO_G410` |

Esito, arco e bersaglio decisi dal motore non cambiano (tranne lo spostamento di lato del caso «testo tuffo su tiro addosso»). Nessun
sorteggio nuovo. Il gate gira con i corpi spenti: `_rad410`, scrub e scelta della clip non lo toccano.

## 3. Dopo

### Scene forzate — guardiano `portiere-410` (GLB acceso, 24 pagine per braccio, corsa finale)

| braccio | verde (dopo) | rosso `__CPM_NO_G410` (prima) |
|---|---|---|
| **C** «sul tiro centrale resta sulla traiettoria» (lato < 2,0) | **0 difetti su 14**: presa in piedi (`mx-goalkeeper-catch`), bacino a 0,84-0,99, pallone a 0,01-0,75 u dal bacino visibile, clip al contatto 0,77-1,20 | **15 su 15**: tuffo, corpo a terra sotto il pallone, riflesso già oltre la posa (clip 1,7-3,3 s), pallone fino a 3,7 u dal bacino |
| **L** «sul tiro laterale il tuffo parte in tempo» (lato ≥ 2,0) | **0 difetti su 10**: in volo al contatto (clip 1,07-1,15, bacino a 0,86-0,99), stacco 0,14-0,30 s prima, pallone a 0,04-0,34 u dal bacino | **9 su 9**: a terra al contatto (clip 1,49-1,55), pallone a ~2-2,7 u dal bacino |

### Partite vere seedate (S5, semi 7 · 2021 · 31 · 77, pilota automatico, GLB acceso)

Nelle partite vere le parate su un highlight sono poche (0-2 per partita). Misurate:
- (build intermedio, prima del pezzo 4) seme 2021, tiro parato centrale: riflesso, pallone a **0,12 u** dal bacino visibile — ma corpo a terra (bacino 0,15) con il pallone a 0,88
  di quota: è il caso che ha portato al pezzo 4 (presa in piedi), corretto dopo; il guardiano C lo controlla ora su ogni scena.
- seme 2021, colpo di testa parato: tuffo **in volo al contatto** (clip 1,04, bacino a 1,02), pallone a 0,55 u dal bacino.
- tiri fuori (semi 31/77): tuffi in volo al contatto (clip 0,99-1,24), pallone a 0,5-1,85 u dal bacino (sfiora, come vuole il giro 223).

⚠️ **Dichiarato:** le partite vere le ho misurate sui build intermedi (prima della presa in piedi); **sul build finale non le ho
rigiocate** (tempo della consegna rapida). Sonda pronta: `CPM_SEMI=7,2021,31,77 node misura-410-vere.mjs` (e `CPM_FLAG=__CPM_NO_G410`).

⚠️ **Dichiarato:** una prima lettura delle partite vere aveva attribuito a un tiro parato centrale (lato 0,24-1,26) un tuffo armato dal
sito T5 (il tuffo «battuto» sul tiro del compagno, post-arco). Quella sonda associava decisione e gesto per TEMPO e poteva prendere la
decisione di una scena precedente. Rifatta con la chiave di scena su ogni fotogramma: nelle partite rigiocate nessun tiro parato centrale ha
avuto il tuffo; ma le partite non si ripetono identiche nel 3D, quindi **non posso confermare** che quel caso fosse un errore della sonda e
non un tuffo vero. Resta da guardare con più partite (sonda pronta: `misura-410-vere.mjs`).

### Fotogrammi (congelati al contatto, `CPM_FOTO`, telefono 412×915)

In `docs/sviluppo/giro410/`:
- **tiro centrale**: `gi9-dz0-verde.png` (portiere in piedi al centro della porta, pallone alle mani: presa) contro `gi9-dz0.4-rosso.png`
  e `gi165-dz0.4-rosso.png` (riflesso a terra fuori tempo, pallone che gli passa accanto); `gi165-dz0-verde.png`.
- **tiro laterale**: `gi9-dz3-verde.png` / `gi9-dz3-rosso.png`, `gi165-dz3-verde.png` / `gi165-dz3-rosso.png`. Nel rosso di gi9 il portiere
  è steso **fuori dal palo** mentre il pallone va verso la porta: è esattamente «sembra gol».
- ⚠️ Le pagine «verde dz 0,4» sono uscite laterali per misura (lato 2,09-2,17: il bersaglio vero della parata varia fra corse) e non le ho
  tenute come «centrali». ⚠️ La camera della scena segue l'eroe: in qualche fotogramma il portiere è al bordo del quadro.

**Definizione del contatto ristretta (dichiarato):** nelle prime misure il contatto era «pallone a 0,6 u dal piano del portiere»; su gi165
(tiro obliquo, dz 0) a quel punto il pallone era ancora a 1,02 u di lato dal bacino e sul piano a meno. Ora è 0,25 u (sonde e guardiano);
le soglie del guardiano non sono cambiate.

## 4. Catena del giro

`node ci-runner.mjs giro portiere-410 portiere-295 portiere-265 portiere-223 gk-dive-sync tiri-367` (guardiani + 17 sentinelle):

Corsa sul build finale (commit `f0dfd96`, ricomposto identico): **21/22 verdi** —
`portiere-295` ✅ (526 s) · `portiere-265` ✅ · `portiere-223` ✅ · `gk-dive-sync` ✅ · `tiri-367` ✅ · le 17 sentinelle ✅
(`mappa-unica`, `test:logic`, `save-compat`, `replay`, `migrazione-194`, `design-system`, `tema-unico`, `griglia-mobile`, `render-3d-023`,
`tunnel-285`, `home-298`, `web-237`, `career-critical`, `battito-264`, `partita-vera`, `schermate-97`, …).
L'unico rosso era **`portiere-410`, braccio ROSSO L**: «difetto rivisto in 6 scene su 6 giudicate (attese almeno 6 su almeno 8)» — col rosso
una parte delle pagine «dz 3» esce con lato < 2 e finisce nel braccio C; il verde della stessa corsa era pulito (C 0/12, L 0/8) e il rosso C
14/14. Soglie invariate: ho aggiunto **4 pagine laterali** (14 in tutto) e rigiocato il guardiano da solo sullo stesso build:

`npm run portiere-410` → **✅ VERDE (verde col verde, rosso col rosso)**: VERDE C 0 difetti su 14 · VERDE L 0 su 10 · ROSSO C 15 su 15 ·
ROSSO L 9 su 9 · 0 non giudicate.

(le 17 sentinelle non le ho rigiocate: il build non è cambiato, è cambiata solo la lista di pagine del guardiano.)

`mappa-unica`: verde (la riga nuova sta in quella che esiste già per `src/12-|src/13-`).

## 5. File toccati

- `src/12-three-match-view.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`, `check-src` identico):
  `_scegliGesto23` (variante del riflesso), testimone `__CPM_GKTL` (bacino visibile), scelta del gesto sulla parata, punto di passaggio
  (testo «tuffo»), gancio `__CPM_SVZ410`, `__CPM_GKACT.tt410/t410`, `_rad410` (radice laterale), scrub del tuffo (`_landT855`), scrub del riflesso.
- `tests/visual/portiere-410.mjs` (guardiano), `tests/visual/misura-410.mjs`, `tests/visual/misura-410-vere.mjs` (sonde).
- `tests/visual/package.json` (script `portiere-410`), `tests/visual/ci-runner.mjs` (riga della MAPPA `src/12-|src/13-` e `LENTI`).
- `docs/sviluppo/RAPPORTO-giro410.md`, `docs/sviluppo/giro410/*.png`.

## 6. Dubbi per il PO (la consigliata è la prima, ed è già applicata)

**D1 — Fin dove un tiro è «centrale» (si para senza tuffo)?**
1. **2,0 u di lato (≈ 2,2 m: mezzo corpo, braccio, un passo) — applicata.**
2. 1,6 u: più tuffi, anche su palloni a un passo.
3. 2,4 u (la soglia del 7.203): quasi nessun tuffo sui tiri nello specchio vicino al portiere.

**D2 — Il testo dice «si distende / tuffo» ma il tiro gli arriva addosso.**
1. **Il pallone passa 2,6 u di lato, così il tuffo che il testo racconta è vero — applicata.**
2. Il gesto segue la geometria (presa frontale) e il testo resta «si distende»: testo e scena non coincidono.
3. Il motore sceglie un testo da presa sui tiri centrali (tocca i testi degli esiti in `src/15`): da decidere col responsabile dei testi.

**D3 — In che momento del tuffo il pallone arriva al portiere?**
1. **In volo, braccia distese (clip a 1,1 s) — applicata**: tocca terra dopo il pallone.
2. All'inizio del volo (1,0 s): più «reattivo», corpo ancora alto.
3. All'atterraggio (1,25 s): più spettacolare, ma torna vicino al «si butta prima».

**D4 — Il riflesso su un pallone a mezz'altezza.**
1. **Presa in piedi (`mx-goalkeeper-catch` / `-catch-2`, posa sulla quota del pallone) — applicata.**
2. Parata a terra per lato (com'era): corpo steso sotto il pallone.
3. Presa alta (`gk-high-catch`, mani a 2,3 m) anche a mezz'altezza: braccia sopra la testa per un pallone al petto.

**D5 — `_rad410` vale per ogni tuffo del portiere avversario, anche sul gol subito e nella cronaca.**
1. **Sì, ovunque — applicata**: il corpo sta dove lo mette il gioco; sul gol il tuffo «battuto» resta corto come deciso (55%).
2. Solo sulle parate degli highlight.
3. Solo sulle parate centrali.

## 7. Cosa resta fuori

- La camera della scena a volte lascia il portiere al bordo del quadro al contatto (si vede nei fotogrammi): è regia, non portiere.
- Le prese in piedi sono collegate per quota del pallone ma non ancora misurate dal vivo sul telefono: collaudo sul dispositivo consigliato.
