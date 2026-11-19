# Rapporto giro 255 — seguito di PO-510: schieramento al centro, via la panca bassa

Ramo `sviluppo/giro255-schieramento-centro` (da `lavoro/197`, che contiene il giro 245). Versione di gioco non toccata (7.999.197).

Decisioni PO 17/11 sui dubbi del giro 245 (`docs/sviluppo/RAPPORTO-giro245.md`):
1. «Sì, al centro» — dopo l'uscita dal tunnel a metà campo le due file si schierano a cavallo della metà campo.
2. «Sì, toglila» — via la panca bassa con pensilina di vetro di `buildStadium`; resta la panchina vera coi panchinari.

Più due verifiche chieste dalla consegna: guardalinee (dubbio 5) e sostituzioni (dubbio 6, con una sonda).

## 1. Misura prima di correggere

Strumento: `tests/visual/tunnel-245.mjs` (esteso in questo giro), percorso vero salvataggio → partita → ingresso in campo, una pagina
nuova per stadio, **ingresso intero** (`CPM_TUTTO=1`). Testimone inerte nuovo `__CPM_G255W` (src/12, armato solo dalla sonda): posti
di schieramento delle due file, corpi arrivati al posto, x media dei 23 corpi, coppie di corpi a meno di 0,5 fra i centri, corpi nel
quadro della camera del gioco e loro altezza apparente; durante una sostituzione, l'eroe contro le scatole degli oggetti fermi
etichettati `ost245`. Il testimone è stato aggiunto e committato **prima** delle correzioni (commit `38aacfe`): la colonna «prima» è il
gioco com'era, non il braccio rosso. Dati grezzi: `docs/sviluppo/giro255/misura-tunnel-prima.json` e `misura-tunnel-dopo.json`.

Cosa ho trovato sul gioco di prima (17 stadi: i 14 template in «derby» di notte, Nazionale di giorno, partita normale di giorno,
stadio piccolo):

- **Schieramento a sinistra in tutti e 17**: fila della squadra dell'eroe a x −15, ospiti a x −7, x media dei 23 corpi schierati −11,0.
- **Panca bassa presente in tutti e 17**: 4 oggetti per stadio (due panche x −18,5..−9,5 e 9,5..18,5, z −35,4..−33,8, più le due
  pensiline di vetro).
- **Sostituzioni (dubbio 6): l'eroe attraversava un oggetto.** A x −6 il subentrante aspettava **dentro la striscia LED** del perimetro
  (segmento x −8,86..−4,77, z −34,4): 88 fotogrammi su 150 (comunale), 44 su 95 (inglese), 82 su 175 (borgo). In uscita: 9 su 152
  (comunale), 39 su 94 (inglese: striscia LED 28, cartellone LED 21), 0 su 176 (borgo). La frase del rapporto 245 «chi esce non
  attraversa più un pannello» non era stata misurata e non reggeva: il varco della striscia LED è x −4,77..4,77, la linea d'attesa era fuori.
- Corpi dentro oggetti durante l'ingresso: 0 in tutti e 17 (il giro 245 regge). Coppie di corpi a meno di 0,5: 0 (minimo 0,72; 0,67 nel piccolo).
- Camera a squadre schierate: la carrellata «schierati» tiene nel quadro al minimo 12 corpi su 23, alti in media 0,07 del quadro
  (lo schermo è verticale: la camera scorre lungo la fila, non la tiene tutta); nell'inno (Nazionale) al minimo 8, alti 0,10.

| Stadio | Tipologia | File casa / ospiti (x) prima → dopo | x media dei 23 schierati | Oggetti della panca bassa | Fotogrammi con corpi dentro oggetti | Coppie di corpi < 0,5 (distanza minima) | Camera sulla fila: fotogrammi buoni (minimo corpi, altezza) | Durata coreografia (s) |
|---|---|---|---|---|---|---|---|---|
| provincia | provincia | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 388 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.03 → 23.17 |
| comunale | comunale | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 386 → 0 su 390 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.15 |
| storico_it | storico_it | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 387 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.01 → 23.15 |
| moderno_it | moderno_it | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 389 → 0 su 387 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.13 |
| inglese | inglese | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 386 → 0 su 387 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.17 |
| tedesco | tedesco | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 386 → 0 su 389 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.14 |
| spagnolo | spagnolo | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 387 → 0 su 390 | 0 (min 0.72) → 0 (min 0.7) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.16 |
| francese | francese | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 388 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.02 → 23.13 |
| olandese | olandese | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 387 → 0 su 385 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24 → 23.16 |
| sudamericano | sudamericano | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 386 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.02 → 23.17 |
| borgo | borgo | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 386 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.02 → 23.14 |
| catino | catino | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 384 → 0 su 386 | 0 (min 0.72) → 0 (min 0.71) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.01 → 23.16 |
| mattoni | mattoni | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 388 → 0 su 389 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.01 → 23.15 |
| arena | arena | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 387 → 0 su 386 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.04 → 23.15 |
| nazionale | inglese | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 531 → 0 su 529 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 54/54 (min 8, alt 0.077) | 31.02 → 30.13 |
| normale-giorno | inglese | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 188 → 0 su 188 | 0 (min 0.72) → 0 (min 0.72) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.05 → 23.16 |
| piccolo | provincia | -15 / -7 → -4 / 4 | -11 → 0 | 4 → 0 | 0 su 329 → 0 su 328 | 0 (min 0.67) → 0 (min 0.63) | (min 12, alt 0.07) → 15/15 (min 12, alt 0.07) | 24.01 → 23.15 |

Nota sulla colonna della camera: nella misura «prima» la sonda contava «buono» un fotogramma con almeno 20 corpi su 23 (soglia
provvisoria, mai raggiunta né prima né dopo); la soglia è stata fissata **dopo** la misura a copertura piena sui minimi misurati
(11 nella carrellata, 8 nell'inno). Per questo della colonna «prima» riporto solo minimo e altezza. Nella misura «prima» della Nazionale
la foto dall'alto cadeva prima dell'inno e quei fotogrammi non sono stati giudicati (15 giudicati, solo carrellata); nella misura «dopo» 54.

Sostituzioni (ingresso e uscita dell'eroe forzati dal banco, due varianti per verso):

| Scenario | Prima: entra (fotogrammi dentro un oggetto / totale) | Prima: esce | Dopo: entra | Dopo: esce | Dopo: linea d'attesa → ultimo punto dell'uscita |
|---|---|---|---|---|---|
| sost-comunale | 88/150 {"striscia-led":88} | 9/152 {"striscia-led":9} | 0/132 | 0/127 | [-3.9,-34.4] → [-3.9,-36.15] |
| sost-inglese | 44/95 {"striscia-led":44} | 39/94 {"striscia-led":28,"cartellone-led":21} | 0/175 | 0/97 | [-3.9,-34.4] → [-3.61,-33.78] |
| sost-borgo | 82/175 {"striscia-led":82} | 0/176 {} | 0/163 | 0/162 | [-3.9,-34.4] → [-3.88,-36.18] |

Nella misura «dopo» di `sost-inglese` l'uscita si è fermata a z −33,78 (97 fotogrammi: la partita ha interrotto la camminata prima dei
cartelloni). Per questo la sonda ora **riprova** finché, per ogni verso, due camminate attraversano davvero la fascia dei cartelloni
(fino a 5 tentativi; nessuna = «non giudicato» = rosso). Nel giro del guardiano sul build finale: `sost-comunale` entra 0/219, esce
0/212 fino a (−3,88 · −36,17); `sost-inglese` entra 0/186, esce 0/174 fino a (−3,94 · −36,25); `sost-borgo` entra 0/179, esce 0/168
fino a (−3,86 · −36,24).

## 2. Cosa è cambiato (rosso `window.__CPM_NO_G255` = schieramento a sinistra, panca bassa, sostituto a x −6, come prima)

| Dove | Prima | Ora |
|---|---|---|
| `src/12`, posti di schieramento (`_placeRow`) | fila dell'eroe a x −15, ospiti a x −7 | fila dell'eroe a **x −4**, ospiti a **x +4** (stessa distanza di 8 fra le file, stessi posti in z da −10 a +10) |
| `src/12`, camera della carrellata finale («schierati») | posizione x −33, sguardo a x −11 | posizione x −22, sguardo a x 0 (spostata degli stessi 11: inquadratura sulla fila identica) |
| `src/12`, camera dell'inno | posizione x −27, sguardo a x −11 | posizione x −16, sguardo a x 0 |
| `src/11` `buildStadium`, panca bassa + pensilina di vetro (x ±14, z −34,6) | costruita in ogni stadio | **non si costruisce più**; resta la panchina vera di src/12 (z −38,5), una per squadra ai lati del tunnel |
| `src/12`, sostituzioni: linea d'attesa e punto d'uscita | x −6 (dentro la striscia LED) | **x −3,9**: dentro il varco della striscia (±4,77) e fuori dalla parete del tunnel (x −3,08) |
| `src/12`, sostituzioni: strada fra campo e linea d'attesa | linea retta, da qualunque punto del campo | passa da un punto sul prato davanti al varco (x −3,9, z −33,6), poi dritta: il tratto fra striscia e cartelloni è sempre dentro il varco |

Seguono lo schieramento senza modifiche, perché sono legati ai corpi e non a una coordinata: i bambini/mascotte (stanno a 0,72 dal
loro giocatore), la camera che accompagna la testa della fila, l'orbita (guarda il baricentro dei corpi), la durata dell'ingresso
(calcolata sulla strada: 24,0 s → 23,2 s di coreografia; Nazionale 31,0 → 30,1). Non toccati: camera sulla bocca del tunnel
(resta dal lato x negativo), tappeto col logo a centrocampo, arbitro (a centrocampo), guardalinee (aspetta a x 7,5 come nel giro
245), coreografie, tabellone, panchina vera, area tecnica. Nessun asset nuovo, nessun campo nel salvataggio, `GAME_VERSION` non toccata.

«Cerimonie e saluti»: nel codice dell'ingresso (src/12) non ho trovato una scena di saluto fra le squadre né altre coordinate legate
allo schieramento oltre a quelle elencate; le cerimonie di fine partita (premiazione, festa) hanno posizioni proprie e non le ho
toccate. Il saluto della serata (src/16) è del giro 256: src/16 non è stato toccato da questo giro.

## 3. Guardalinee (dubbio 5) e sostituzioni (dubbio 6)

- **Guardalinee**: `guardalinee-222` verde sul build finale, col rosso `__CPM_NO_G222` riprodotto (6 verdetti rossi). In più, in
  `tunnel-245` la voce «corpi addosso a una figura ferma» (arbitro, guardalinee, mister, panchinari) è 0 in tutti e 17 gli stadi
  sull'ingresso intero, col nuovo schieramento. Non ho cambiato nulla del guardalinee.
- **Sostituzioni**: misurate con la sonda (sezione 1). Il difetto c'era ed è corretto; ora è un controllo del guardiano.

## 4. Guardiano

`npm run tunnel-245` (aggiornato, stesso nome: nessuna voce nuova in `ci-runner.mjs`, `node --check` verde) =
braccio verde su 20 scenari (17 stadi + 3 di sostituzioni) + braccio rosso 245 su 3 stadi + **braccio rosso 255** su 3 scenari
(`comunale`, `nazionale`, `sost-comunale`). In più rispetto al giro 245, verde quando:

- i posti di schieramento hanno x media entro ±1, una fila per parte (tutti e 17 gli stadi);
- negli stadi a ingresso intero (`comunale` derby notte, `nazionale` con inno, `normale-giorno`): la x media dei 23 corpi arrivati è
  entro ±1 · zero fotogrammi con due corpi a meno di 0,5 · la camera del gioco a squadre schierate tiene nel quadro almeno 11 corpi su
  23 nella carrellata e almeno 8 nell'inno nel 90% dei fotogrammi, con altezza apparente media di almeno 0,06;
- nessun oggetto `panca-stadio` / `pensilina-stadio` (tutti e 17);
- sostituzioni: zero fotogrammi con l'eroe dentro un oggetto fermo, in ingresso e in uscita.

«Non giudicato» = rosso: posti non dichiarati, meno di 5 fotogrammi a squadre schierate, meno di 5 di camera (per la Nazionale anche
meno di 5 durante l'inno), meno di 10 fotogrammi di sostituzione per verso o nessuna camminata che attraversi la fascia dei cartelloni.

Soglie della camera: sono i minimi misurati sul gioco di prima (12 e 8), con un corpo di margine sulla carrellata; fissate dopo la
misura a copertura piena. Limite dichiarato: questa soglia dice che la camera guarda la fila come la guardava prima, **non** che
l'inquadratura sia bella sul telefono.

Braccio rosso 255 sul build finale: schieramento fuori centro visto in 2/2 (x medio −11,00), panca bassa in 2/2 (4 oggetti), eroe
dentro la striscia LED nelle sostituzioni in 1/1 (entra 114/210, esce 6/201).

## 5. Foto (`docs/sviluppo/giro255/`)

Per ognuno dei 17 stadi, prima e dopo, corpi procedurali (servono a misurare le posizioni):
`<prima|dopo>-<stadio>-camera.jpg` (camera sulla bocca del tunnel a 2,4 s di scena), `-alto.jpg` (dall'alto sulla bocca),
`-schierati.jpg` (**camera del gioco** al primo fotogramma con tutti arrivati), `-schierati-alto.jpg` (camera fissa di prova dal lato
opposto, centrata a x −4 in entrambe le serie: si vedono file, metà campo, tunnel e panchine). Per la Nazionale anche `dopo-nazionale-inno.jpg`.
Con i **corpi 3D accesi**: `dopo-inglese-glb-*`, `dopo-nazionale-glb-*` (compreso `-inno`) e, come «prima», `rosso-inglese-glb-*` e
`rosso-nazionale-glb-*` (sono il braccio rosso `__CPM_NO_G255` sul build nuovo, non il gioco di prima).

## 6. Controlli eseguiti (uno alla volta, sul build finale del ramo, commit del gioco `374c8e3`)

| Controllo | Esito | Nota |
|---|---|---|
| `npm run tunnel-245` (verde 20 scenari + rosso 245 + rosso 255) | verde, 0 guasti · rosso 245 visto 3/3 · rosso 255 visto | 38 min |
| `notte-206` | verde, «il rosso si vede» | 5 min |
| `guardalinee-222` (verde + rosso) | verde, difetto riprodotto col rosso | 5 min |
| `gigante-212` (verde + rosso) | verde, difetto riprodotto col rosso | 18 min |
| `tpose-196` (verde + rosso) | verde, rosso atteso visto | 25 min |
| `coreografie-244` (verde + rosso) | verde (12 coreografie distinte su 30 partite), rosso visto | 49 min |
| `ingresso-206` (eccezione della consegna: tocco l'ingresso; è anche il guardiano dell'inno) | verde, 11 scenari, «il rosso si vede» | 50 min |
| `test:logic` | verde | |
| `save-compat` | verde, 12 pass · 0 fail | |
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | IDENTICO BYTE PER BYTE dopo ogni modifica a `src/` | |
| `node --check tests/visual/ci-runner.mjs` | verde (file non modificato) | |

«Guardiano dell'inno»: in `ci-runner.mjs` non c'è una voce dedicata; l'inno è giudicato da `ingresso-206` (regia «inno» e sua durata)
e, da questo giro, da `tunnel-245` nello scenario `nazionale` (camera sulla fila durante l'inno).

Foto di altri giri rigenerate dai controlli (`docs/sviluppo/giro222`, `giro196`, `giro212`): rimesse con `git checkout --`, non committate.

**Non eseguiti** (regola PO-504 A): gli altri guardiani della mappa mirata di `src/12` e `src/11` (fra cui `validate-situations`,
`partita-vera`, `career-critical`, `highlight-95`, `ingresso-285/277/276/245`, `ingresso-camminata-245`, `bambini-294`, `bambini-236`,
`fila-227`, `stadi-071`, `panchina-293`, `scena3d-96`): restano alla verifica di rilascio. Fra questi, quelli che guardano la stessa
scena e che lo spostamento di 11 unità potrebbe toccare sono `ingresso-276` (calciatori nel quadro durante l'orbita), `scena3d-96`
(tappeto col logo visto dalla camera) e `bambini-294`: non posso confermare il loro esito.

**Un errore mio da dichiarare**: per vedere la mappa mirata ho lanciato `node ci-runner.mjs mirata lavoro/197`, che non elenca soltanto
ma avvia la catena. L'ho fermata dopo meno di due minuti; in quel tempo girava in parallelo alla misura «dopo» del primo stadio
(`provincia`). I numeri di `provincia` sono uguali a quelli degli altri 16 stadi e lo stadio è stato rimisurato nel giro del guardiano
(verde); `docs/governo/STABILITA.json` non risulta modificato.

## 7. Dubbi per il PO

1. **Le due file stanno sul tappeto col logo.** Il tappeto di centrocampo ha raggio 11: con le file a x −4 e +4 tutti e 22 (e i
   bambini) ci stanno sopra, e l'arbitro resta a centrocampo fra le due file (prima solo la fila ospite toccava il tappeto). Si vede
   in `dopo-*-schierati.jpg`. Non ho spostato né tappeto né arbitro: va deciso se va bene così.
2. **«Come in tv» l'ho letto come «stesse due file, spostate al centro».** Le file restano perpendicolari alla linea laterale, una per
   parte della metà campo, tutte rivolte verso la porta di sinistra (verso la camera). In tv di solito le squadre stanno su una riga
   sola parallela alla tribuna, ai lati della terna: sarebbe uno schieramento diverso (e una camera diversa), non l'ho fatto.
3. **Camera sul telefono da guardare.** Carrellata finale e inno sono spostati degli stessi 11 delle file, quindi la fila è inquadrata
   come prima (stessi corpi nel quadro, stessa altezza), ma lo sfondo è cambiato: prima la camera stava a x −33/−27, ora a x −22/−16.
   Dall'headless non posso confermare che sul dispositivo piaccia. Lo stesso vale per la camera sulla bocca del tunnel (dubbio 2 del
   giro 245), che ho lasciato dal lato x negativo: ora la fila dell'eroe le passa davanti più larga (`dopo-comunale-camera.jpg`).
4. **Sostituzioni: il sostituto ora aspetta ed esce davanti al tunnel** (x −3,9), non più davanti alla panchina di casa (x −6). È il
   solo punto in cui non c'è né striscia LED né parete del tunnel. L'alternativa — lasciarlo a x −6 e spegnere un altro segmento della
   striscia LED — cambia l'aspetto del bordo campo: non l'ho scelta io. Chi esce scompare a z −36,2 accanto alla parete del tunnel,
   come prima scompariva davanti alla panchina.
5. **La sonda delle sostituzioni forza ingresso e uscita dal banco** nel punto in cui si trova l'eroe in quel momento: non copre ogni
   punto di partenza del campo. La strada a due tratti è costruita perché il passaggio fra i cartelloni sia dritto da qualunque punto,
   ma l'ho misurata solo sui casi capitati (3 stadi, 2–5 camminate per verso).
6. **Sostituzione «inglese» nella misura di prima**: in un caso l'eroe forzato in ingresso è rimasto fermo sulla linea d'attesa per
   tutti i 95 fotogrammi (prima delle mie modifiche). Non l'ho indagato: può essere la partita che in quel momento teneva l'eroe
   altrove (fase di highlight). Lo segnalo perché non so dire se sul gioco vero capita.
7. **Durata dell'ingresso**: la coreografia si accorcia di circa 0,9 s (strada più corta dal tunnel al centro). La durata di scena
   dichiarata per tipo di partita non l'ho toccata.
8. **Giro 256 (src/16)** lavora in parallelo: questo giro non tocca src/16; all'unione mi aspetto conflitti solo sul file composto
   `CARRIER-MANAGER-AV.html` (si rigenera con `tools/build-src.mjs`).
