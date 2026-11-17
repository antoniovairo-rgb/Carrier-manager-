# Rapporto giro 245 — PO-510 «tunnel a metà campo, niente cartellone d'intralcio»

Ramo `sviluppo/giro245-tunnel-centro` (da `lavoro/197`, unita di nuovo a metà giro). Versione di gioco non toccata.

Nota del PO (foto `docs/collaudo-po/196-tunnel-cartellone-intralcio.jpg`, ramo `poc/marioprada-character-system`):
«Il cartellone pubblicitario all'uscita del tunnel è di intralcio. Il tunnel dovrebbe essere proprio a metà campo tra le due panchine».

## 1. Misura prima di correggere

Strumento: `tests/visual/tunnel-245.mjs` (nuovo), percorso vero salvataggio → partita → ingresso in campo, una pagina nuova per
stadio. Il testimone inerte `__CPM_G245W` (src/12) scrive a ogni fotogramma dell'ingresso i corpi che camminano (22 + bambini)
contro le scatole degli oggetti fermi etichettati (`userData.ost245`) e la bocca del tunnel proiettata in camera.
17 stadi: i 14 template (tipo «derby», notte), Nazionale di giorno, partita normale di giorno, stadio piccolo (1.500 posti).
Dati grezzi: `docs/sviluppo/giro245/misura-tunnel-prima.json` e `misura-tunnel-dopo.json`.

Cosa ho trovato sul gioco di prima (fonte: `misura-tunnel-prima.json`, tutto l'ingresso, 186–528 fotogrammi per stadio):

- **Bocca del tunnel a x −22 in tutti e 17 gli stadi**, cioè all'estremità della panchina di casa (la panchina va da x −20,5 a −7,5).
  Le panchine erano già simmetriche rispetto a metà campo (centri a x −14 e +14): era la bocca a essere fuori posto.
- **In ogni stadio da 53 a 146 fotogrammi con almeno un corpo dentro un oggetto.** Gli oggetti attraversati sono quattro, non uno:
  1. il **cartellone LED** di bordo campo (src/12, pannello da x −19,15 a −6,05, z −34,86) — è la striscia rossa scura della foto del PO;
  2. la **striscia LED** del perimetro (src/12, z −34,4, alta 0,77): era continua, senza nessun varco — ~300 corpi-fotogramma per ingresso;
  3. la **panca bassa** di casa costruita da `buildStadium` (src/11, x −18,5..−9,5, z −35,4..−33,8) — il blocco grigio in primo piano nella foto;
  4. le **pareti/i pilastri del tunnel** stesso: i bambini camminano a 0,72 di lato dal giocatore e la bocca era larga 5,2.
- Corpi addosso a figure ferme (mister, vice, panchinari, terna): 0 fotogrammi.
- Camera dell'ingresso: la bocca era inquadrata in 30–32 fotogrammi su 30–32 fra 1,5 e 3,0 s di scena (la camera non era il difetto).

| Stadio | Tipologia | Bocca prima → dopo | Stile, lunghezza | Fotogrammi con corpi dentro oggetti — prima (corpi-fotogramma per oggetto) | dopo | Camera sulla bocca prima → dopo |
|---|---|---|---|---|---|---|
| provincia | provincia | −22 → 0 | telescopico, 0,98 | 125 su 390 (parete tunnel 69, cartellone LED 66, striscia LED 303, panca 27) | 0 su 147 | 32/32 → 32/32 |
| comunale | comunale | −22 → 0 | telescopico, 6,6 | 127 su 392 (parete 72, cartellone LED 66, striscia 320, panca 28) | 0 su 145 | 31/31 → 30/30 |
| storico_it | storico_it | −22 → 0 | telescopico, 10,84 | 124 su 387 (parete 58, cartellone LED 66, striscia 309, panca 29) | 0 su 146 | 30/30 → 32/32 |
| moderno_it | moderno_it | −22 → 0 | telescopico, 9,4 | 124 su 388 (parete 70, cartellone LED 63, striscia 311, panca 27) | 0 su 147 | 31/31 → 31/31 |
| inglese | inglese | −22 → 0 | cemento, 0,2 | 138 su 389 (pilastro 153, cartellone LED 66, striscia 319, panca 30) | 0 su 146 | 32/32 → 32/32 |
| tedesco | tedesco | −22 → 0 | telescopico, 9,4 | 122 su 386 (parete 59, cartellone LED 65, striscia 308, panca 29) | 0 su 144 | 31/31 → 30/30 |
| spagnolo | spagnolo | −22 → 0 | telescopico, 12,6 | 124 su 387 (parete 70, cartellone LED 65, striscia 315, panca 30) | 0 su 145 | 31/31 → 31/31 |
| francese | francese | −22 → 0 | telescopico, 10,84 | 124 su 389 (parete 60, cartellone LED 65, striscia 312, panca 31) | 0 su 147 | 31/31 → 31/31 |
| olandese | olandese | −22 → 0 | telescopico, 2,1 | 127 su 388 (parete 60, cartellone LED 66, striscia 316, panca 28) | 0 su 147 | 32/32 → 32/32 |
| sudamericano | sudamericano | −22 → 0 | telescopico, 12,6 | 124 su 386 (parete 70, cartellone LED 66, striscia 310, panca 29) | 0 su 146 | 31/31 → 32/32 |
| borgo | borgo | −22 → 0 | pensilina, 0,1 | 142 su 389 (pilastro 162, cartellone LED 65, striscia 313, panca 31) | 0 su 147 | 31/31 → 30/30 |
| catino | catino | −22 → 0 | telescopico, 0,6 | 125 su 388 (pilastro 18, parete 70, cartellone LED 65, striscia 308, panca 28) | 0 su 147 | 32/32 → 31/31 |
| mattoni | mattoni | −22 → 0 | telescopico, 3 | 125 su 389 (parete 69, cartellone LED 66, striscia 312, panca 29) | 0 su 147 | 32/32 → 31/31 |
| arena | arena | −22 → 0 | vetro, 9,4 | 127 su 389 (parete 61, cartellone LED 68, striscia 314, panca 29) | 0 su 146 | 32/32 → 31/31 |
| nazionale (giorno) | inglese | −22 → 0 | telescopico, 2,46 | 146 su 528 (parete 70, cartellone LED 70, striscia 355, panca 45) | 0 su 170 | 32/32 → 31/31 |
| normale (giorno) | inglese | −22 → 0 | telescopico, 2,46 | 53 su 186 (parete 40, cartellone LED 24, striscia 126) | 0 su 69 | 32/32 → 32/32 |
| piccolo (1.500 posti) | provincia | −22 → 0 | telescopico, 0,98 | 84 su 325 (parete 51, cartellone LED 45, striscia 212, panca 5) | 0 su 126 | 31/31 → 31/31 |

Nota sul confronto: la colonna «prima» copre tutto l'ingresso (`CPM_TFINE=0`), la colonna «dopo» è il giro del guardiano, che chiude
ogni stadio a 9 s di scena (la strada dalla bocca alla linea laterale si percorre nei primi secondi; nella misura «prima» l'ultimo
fotogramma con un corpo dentro un oggetto cade fra 3,16 e 8,0 s secondo lo stadio, 7,0 s nei 14 template). Sul «dopo» ho anche misurato **tutto l'ingresso** su quattro stadi
(comunale 386 fotogrammi, inglese 386, borgo 389, nazionale 525): 0 corpi dentro oggetti in tutti e quattro.

## 2. Cosa è cambiato (rosso `window.__CPM_NO_G245` = la disposizione di prima)

| Dove | Prima | Ora |
|---|---|---|
| `src/11` `buildStadium`, bocca del tunnel (tutte le tipologie: portale in cemento, pensilina del borgo, telescopico, tubo di vetro dell'arena) | x −22, larga 5,2 | **x 0**, larga 6,0 |
| `src/11`, pannelli di `buildStadium` sul lato panchine (z −35,2) | mancavano quelli a x −22 e −33 | manca solo quello centrale (x −4,5..4,5); gli altri due tornano |
| `src/12`, cartelloni LED di bordo campo (z −34,8) | mancava il pannello a x −25,2 | manca il pannello centrale (x −6,55..6,55); quello a x −25,2 torna |
| `src/12`, striscia LED del perimetro (z −34,4) | continua | spenti i due segmenti centrali (varco misurato x −4,77..4,77) |
| `src/12`, partenza delle due file | x −23,6 (casa) e −20,4 (ospiti) | x −1,3 (casa, a sinistra guardando dal campo) e +1,3 (ospiti) |
| `src/12`, guardalinee del lato panchine durante l'ingresso | fermo a (0, −34): con la bocca a metà campo la prima fila gli passava a 0,68 (misurato) | aspetta a x 7,5; al fischio torna a seguire l'azione |
| `src/12`, camera dell'ingresso sulla bocca | a x bocca +8,5, sguardo a x bocca +0,5 | a x bocca −8,5, sguardo a x bocca −0,5 (lo schieramento è a x −15 e −7: da lì le file vengono incontro alla camera invece di dare le spalle) |

Non toccati: le panchine (già a ±14, simmetriche rispetto alla nuova bocca), i posti dei panchinari, mister e vice, l'area tecnica e la
linea d'attesa delle sostituzioni (x −6, fra bocca e panchina di casa), lo schieramento (file a x −15 e −7), l'inno, le cerimonie,
la panchina che esulta. Nessun asset nuovo, nessun campo nel salvataggio.

Oggetti fermi davanti alla bocca dopo la correzione (fonte: `misura-tunnel-dopo.json`, comunale): fra x −4,77 e +4,77 non c'è nessun
oggetto etichettato e la ricerca generica di oggetti non etichettati nel varco dà lista vuota in tutti e 17 gli stadi.

## 3. Foto prima/dopo (`docs/sviluppo/giro245/`)

Per ogni stadio: `prima-<stadio>-camera.jpg` / `dopo-<stadio>-camera.jpg` (camera dell'ingresso a 2,4 s di scena) e
`prima-<stadio>-alto.jpg` / `dopo-<stadio>-alto.jpg` (dall'alto, camera fissa di prova centrata sulla bocca, a 3,4 s di scena).
Corpi procedurali nelle 17 serie (servono a misurare le posizioni). Con i **corpi 3D accesi**: `prima-inglese-glb-*`, `prima-borgo-glb-*`,
`dopo-inglese-glb-*`, `dopo-borgo-glb-*`, `dopo-nazionale-glb-*`.

## 4. Guardiano nuovo

`npm run tunnel-245` = braccio verde su 17 stadi + braccio rosso su 3 (`comunale`, `borgo`, `arena`). Registrato una volta in
`ci-runner.mjs` nelle catene `completa` e `carriera`, nella mappa di `src/12-|13-` e di `src/1[17]-`, e fra i lenti (`node --check` verde).

Verde quando, in ogni stadio: bocca a |x| ≤ 1 · panchine simmetriche rispetto alla bocca entro 0,5 (casa a sinistra, ospiti a destra) ·
zero fotogrammi con un corpo dentro un oggetto o addosso a una figura ferma · nessun oggetto non etichettato nel varco · la camera
dell'ingresso inquadra la bocca in almeno il 90% dei fotogrammi fra 1,5 e 3,0 s di scena. «Non giudicato» (ingresso non visto, meno
di 30 fotogrammi, meno di 12 corpi usciti, meno di 5 fotogrammi di camera) = rosso.

## 5. Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, sul build dell'unione con `lavoro/197`)

| Controllo | Esito | Nota |
|---|---|---|
| `tunnel-245` braccio verde | verde, 17 stadi, 0 guasti | 13 min 31 s |
| `tunnel-245` braccio rosso (`__CPM_NO_G245`) | rosso visto: bocca fuori centro 3/3, corpi dentro oggetti 3/3 (121–138 fotogrammi) | 2 min 16 s |
| `test:logic` | verde | |
| `save-compat` | verde | |
| `notte-206` | verde | 4 min |
| `tpose-196` (verde + rosso) | verde | 20 min |
| `gigante-212` (verde + rosso) | verde, «difetto riprodotto» col rosso | 15 min |
| `panchina-293` (il guardiano della panchina presente in `ci-runner`) | verde | 4 min |
| `ingresso-206` (eccezione della consegna: tocco l'ingresso) | verde, «il rosso si vede» | 41 min, 11 scenari |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | fatti dopo ogni modifica a `src/` | |
| `node --check ci-runner.mjs` | verde | |

**Non eseguiti**: gli altri guardiani della mappa mirata di `src/12` e `src/11` (circa cento voci, fra cui `validate-situations`,
`partita-vera`, `career-critical`, `highlight-95`): ho eseguito i controlli elencati nella consegna e il guardiano nuovo. Restano alla
verifica di rilascio. In particolare non ho eseguito `guardalinee-222`, `ingresso-285`, `ingresso-277`, `ingresso-276`, `ingresso-245`,
`ingresso-camminata-245`, `bambini-294`, `bambini-236`, `fila-227`, `stadi-071`, che toccano la stessa scena.

## 6. Dubbi per il PO

1. **Lo schieramento resta dov'era** (due file a x −15 e −7, cioè a sinistra della metà campo). Con la bocca a metà campo le squadre
   escono al centro e vanno a schierarsi a sinistra. Spostare lo schieramento a cavallo della metà campo cambierebbe anche inno,
   carrellata e orbita: non l'ho deciso io.
2. **La camera dell'ingresso è passata dall'altro lato della bocca** (da destra a sinistra guardando dal campo), per vedere le file
   venire incontro. Non posso confermare dall'headless che sul telefono l'inquadratura piaccia: va guardata sul dispositivo.
3. **«Casa a sinistra»**: la panchina a sinistra (x −14) è quella della squadra dell'eroe, anche quando l'eroe gioca in trasferta
   (convenzione già esistente nel codice, non toccata). Lo stesso vale per la fila che esce a sinistra.
4. **Due panchine per lato**: `buildStadium` (src/11) costruisce una panca bassa con pensilina di vetro a z −34,6, davanti ai cartelloni,
   e src/12 costruisce la panchina vera con i panchinari a z −38,5. Nella foto del PO si vedono entrambe (blocco grigio in primo piano
   e panchina con la pensilina dietro). Non sono più sul percorso, ma la panca bassa resta a cavallo dei cartelloni: non l'ho tolta.
5. **Guardalinee**: durante l'ingresso aspetta a x 7,5 e al fischio rientra verso metà campo col suo passo. `guardalinee-222` non è
   stato eseguito in questo giro.
6. **Sostituzioni**: la linea d'attesa (x −6, z −34,4) e il punto d'uscita (x −6, z −36,2) non sono cambiati; ora cadono dentro il
   varco del cartellone LED centrale (x −6,55..6,55), quindi chi esce non attraversa più un pannello. Non l'ho misurato con una sonda.
7. **Giro 244 (coreografie)**: lavora sulla stessa zona di src/12; ho unito `lavoro/197` una volta a metà giro (conflitto solo in
   `ci-runner.mjs`, risolto tenendo la versione della madre e reinserendo `tunnel-245`). Il ramo 244 non era ancora in `lavoro/197`.
