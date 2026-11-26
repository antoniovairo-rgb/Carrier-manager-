# Rapporto giro 390 — PO-653 «il compagno che riceve il passaggio non è già nella scena»

Base `lavoro/201` (punta `29d758c8`), ramo `sviluppo/giro390-ricevente`. GAME_VERSION e `docs/governo` non toccati.

## Cosa chiedeva il PO
PO-653 (24/11, 7.999.208, senza foto): «quando l'eroe fa un passaggio ad un compagno, in particolare tentativi di assist,
quest'ultimo non è già nella scena!». Parenti: PO-650 («poi interviene magicamente il compagno», giro 364), PO-585 (giro 346).

## Come ho misurato
- **Partite vere**, non scene forzate: il compagno che riceve lo nomina il motore (il «cast» della scena) e sul banco forzato
  il cast non c'è, quindi il punto di ricezione del giro 99 non esiste e il difetto non si vede. Salvataggi veri
  (`save-c177-s1w15`, `save-c177-s5w20`, `save-190-s12-ovr93`) × semi, GLB acceso, costruzione dell'azione e teatro accesi
  (`__CPM_CINE`, `__CPM_PRESENT`), telefono 412 × 915. A ogni scelta la sonda prende un'azione di passaggio/assist (premio
  «assist» o etichetta da passaggio) dopo 1,2 s di lettura.
- **Testimone nuovo `__CPM_W390`** (src/12, solo `cpmtest` + `__CPM_REC390`): un campione per fotogramma negli highlight
  d'attacco, sulla camera **disegnata** (dopo la correzione del quadro, matrici aggiornate: regola del giro 241), piedi e testa
  del ricevente e dell'eroe in coordinate di schermo, tutti i compagni, ottica, stacco nero vivo, scatti di scena, posizione
  logica dell'eroe e punto di ricezione. Il ricevente è il compagno nominato in lettura (`_r99`), dal lancio quello servito
  (`passTargetMesh` dopo `fireConclusion`). Sonda `tests/visual/misura-390.mjs`.
- «Nel quadro» = piedi **e** testa dentro il 92 % del semiquadro orizzontale e il 95 % del verticale.
- L'apertura è il primo fotogramma visibile **dopo** lo stacco nero d'apertura (il primo fotogramma della scena ha ancora l'eroe
  della scena precedente).

## Cause (misurate)
1. **Il punto di ricezione restava ancorato alla scena di prima.** `_r99` (giro 99) si fissa al PRIMO fotogramma della scena,
   quando `P.playerX/Y` sono ancora quelli della scena precedente; un fotogramma dopo arriva la posizione vera e lo scatto di scena
   «staging» porta l'eroe sul suo punto sotto lo stacco nero, ma il ricevente resta sul punto calcolato prima. Misurato
   (testimone, scatti di scena contati): «Uno-due con GÜNTHER» ricevente **1,5 u dietro** l'eroe invece di 12 avanti;
   «Servi SEIFERT libero» eroe da x −3,3 a x 30,1 sotto lo stacco, ricevente rimasto a x 8,7: **21 u dietro l'eroe**, e dopo il
   passaggio corre 18 u per arrivare sul pallone — «e compare dopo». Succede in ogni scena: lo scarto è quello fra la posizione
   della scena precedente e quella nuova.
2. **Il fotogramma disegnato non teneva conto del ricevente.** Il blocco «QUADRO DELL'EROE» (giro 96a) tiene nel quadro l'eroe e,
   sull'esito, il pallone. In lettura la regia guarda fra l'eroe e il pallone della consegna, e il compagno (12 u avanti e 5 di
   lato) finiva oltre il bordo: «Uno-due con MAURO» fuori per tutta l'introduzione (nx 1,31-1,41, 31 % della lettura nel
   quadro); «Filtrante per COSTA» al bordo all'apertura e **fuori nel momento in cui parte il passaggio** (nx 1,09-1,66).

## Correzioni (tutte in `src/12-three-match-view.jsx`, rosso `window.__CPM_NO_G390`)
- **A — l'ancora** (`__CPM_NO_G390A`), dentro `_r99`: il punto si riancora all'eroe a ogni scatto di scena in cui l'eroe è
  cambiato, stesso compagno; il ricevente si sposta con lo scatto, dentro lo stacco nero. Mai durante la lettura: i passi del
  giocatore non lo trascinano.
- **B — il quadro** (`__CPM_NO_G390B`), dentro il blocco «QUADRO DELL'EROE»: il ricevente entra fra i punti del fotogramma
  disegnato DOPO l'eroe, con le regole del pallone: l'ottica si apre per lui solo sotto il tetto che c'è già (62° in verticale),
  la rotazione lo porta dentro l'85 % del semiquadro solo se l'eroe resta dove la sua regola lo vuole. Se non stanno insieme,
  il ricevente non conta. La regia non cambia; la correzione vale per il solo fotogramma disegnato.
- Testimone `__CPM_W390` + contatore degli scatti di scena `_sn390` (lo legge solo il testimone).

Nessun sorteggio aggiunto, motore non toccato (i numeri di partita non cambiano). Il banco forzato non ha il cast: la parte A lì
è inerte, la parte B agisce solo dal lancio di un passaggio.

## Prima / dopo
Guardiano `npm run ricevente-390` (2 partite per braccio, s1 seme 2 e s5 seme 3, bracci in parallelo), corsa finale:

| Misura (scene giudicate) | Rosso `__CPM_NO_G390` | Verde |
|---|---|---|
| Scene con almeno un difetto | **4 su 7** | **0 su 7** |
| Ricevente fuori dal quadro all'apertura | 1 su 7 | 0 su 7 |
| … alla scelta | 1 su 7 | 0 su 7 |
| … quando parte il passaggio | **3 su 7** | 0 su 7 |
| Quota della lettura col ricevente nel quadro (minima) | 0,55 | 1,00 |
| Quota del volo col ricevente nel quadro (mediana · minima) | 0,42 · 0,28 | 1,00 · 0,70 |
| Ricevente meno di 4 u davanti all'eroe all'apertura | 1 su 7 (−1,5 u) | 0 su 7 (minimo 6 u) |
| Eroe fuori dal quadro, lettura + volo (massimo) | 0,17 | 0,16 |

Misure precedenti (sonde separate, stesse partite più s1/3 e s5/2, prima definizione dell'apertura): rosso fuori all'apertura
2 su 9, al lancio 4 su 9, volo mediana 0,61; verde 0 su 9, 0 su 9, volo mediana 1. Il caso «21 u dietro» (Servi SEIFERT)
è uscito in due corse rosse su tre; nella terza il rosso dava 6 u davanti ma il ricevente fuori dal quadro alla scelta e al lancio.

Nel verde l'ottica in lettura resta 46° (mediana): il quadro non si è allargato in lettura sulle scene misurate, è bastata la rotazione.

## Guardiano
`npm run ricevente-390` (riga `src/12|src/13` della MAPPA, mappa-unica verde). Verde: per ogni scena giudicata ricevente nel
quadro all'apertura, alla scelta e al lancio, nel quadro per almeno il 90 % della lettura, almeno 4 u davanti all'eroe
all'apertura; almeno 3 scene giudicate; un errore di pagina è rosso. Rosso: almeno una scena col difetto, altrimenti il guardiano
non distingue ed è rosso. Le scene senza passaggio a un compagno (passaggio intercettato, cross, punizione) sono dichiarate e non
contano. Durata ~10 minuti (due partite per braccio, quattro pagine).

## File toccati
- `src/12-three-match-view.jsx`: `_r99` (riancoraggio), blocco «QUADRO DELL'EROE» (`_R390`, `R390`), testimone `__CPM_W390`,
  contatore `_sn390` accanto a `_doSnap`.
- `CARRIER-MANAGER-AV.html` (ricomposto da `build-src`).
- `tests/visual/misura-390.mjs` (sonda), `tests/visual/ricevente-390.mjs` (guardiano), `tests/visual/package.json` (script),
  `tests/visual/ci-runner.mjs` (riga della MAPPA esistente `src/12|src/13`).
- Non toccati: src/11, src/14, src/15, la parte dei colpi di testa del giro 380, GAME_VERSION, `docs/governo`.

## Guardiani della zona NON girati (li giudica il treno)
La riga `src/12|src/13` intera, in particolare quelli più vicini: `validate-situations` (gate), `camera-241`, `camera-252`,
`scena3d-96` (il blocco del quadro), `hero-framing`/`framing-guard`, `inquadra-273`, `apertura-261`, `chiusura-99`,
`assist-nome-98`, `assist-298`, `esiti-241`, `fasce-364`, `cross-218`, `buildup-sync`, `portatore-286`, `portatore-293`.
Il rischio che vedo: sul banco forzato la parte B agisce sui passaggi dal lancio in poi (il pallone era già un punto del quadro):
`scena3d-96` e `hero-framing` misurano quel blocco.

## Catena
`node ci-runner.mjs giro ricevente-390` (guardiano + 17 sentinelle) sul commit del ramo, versione di gioco 7.999.215:
**18 su 18 verdi** — ricevente-390 737 s · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system ·
tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera ·
gk-dive-sync · schermate-97.

## Dubbi per il PO (la consigliata per prima, già applicata)
1. **Come tenere il ricevente nel quadro.**
   a) *(consigliata, applicata)* correzione del fotogramma disegnato: il ricevente entra nel quadro dopo l'eroe, l'ottica si apre
      solo sotto il tetto che c'è già; la regia non cambia;
   b) spostare il punto di ricezione più al centro dell'inquadratura (12 avanti, 2-3 di lato): più semplice, ma il passaggio
      diventa quasi sempre una verticale dietro l'eroe e perde la linea di passaggio laterale;
   c) regia «eroe e ricevente insieme» per tutta la lettura (come il giro 241 per il pallone): camera più larga, eroe più
      piccolo — taglia già bocciata sul telefono al 7.509.
2. **«Scarico a CRISTIANO libero»: in lettura è in scena il compagno nominato dal motore (#3), il passaggio va a un altro (#9).**
   1 scena su 7, in una scena di seguito («Dribbling riuscito»). Non so dire quale dei due sia Cristiano senza leggere il nome
   nel testimone.
   a) *(consigliata, applicata: non toccato qui)* dichiararlo e chiuderlo in un giro suo, misurando prima chi nomina il testo;
   b) il passaggio serve sempre il compagno che il testo nomina;
   c) il testo prende il nome dal compagno che il 3D mette in scena.
3. **Durante il volo il ricevente può ancora uscire dal quadro** (verde: minima 0,70 del volo, una scena): quando eroe, pallone e
   ricevente non stanno insieme sotto il tetto dell'ottica, il ricevente non conta.
   a) *(consigliata, applicata)* l'eroe resta la prima regola, il pallone la seconda, il ricevente la terza;
   b) alzare il tetto dell'ottica quando parte un passaggio lungo (eroe più piccolo);
   c) dare al ricevente la precedenza sul pallone durante il volo (il pallone può uscire a metà volo).
4. **Uno-due e passaggi intercettati non sono giudicati** (nessun compagno servito): in lettura vale la stessa regola (il
   compagno nominato è nel quadro), ma il guardiano non li conta.
   a) *(consigliata, applicata)* dichiararli e non giudicarli;
   b) giudicarli sulla sola lettura;
   c) provocare l'esito riuscito dalla sonda (gancio di solo collaudo nuovo).

## Errori miei durante la misura (da dire)
- La prima sonda leggeva il vecchio testimone del giro 364 (`hm`, solo centro del corpo) e l'apertura dal primo fotogramma, prima
  dello stacco: due misure su tre del ricevente «all'apertura» erano fatte con l'eroe della scena precedente. Corretto.
- Due volte il braccio rosso non era rosso: prima l'elenco dei flag si svuotava da solo, poi i due bracci in parallelo nello
  stesso processo si scambiavano l'elenco. Le corse con quei difetti le ho buttate; i flag ora viaggiano con la partita.
