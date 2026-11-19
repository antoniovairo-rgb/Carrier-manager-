# Rapporto giro 261 — i due controlli rossi della serata e il salto del braccio (dubbi 1 e 6 del giro 256)

Ramo `sviluppo/giro261-serata-spalle`, partito da `lavoro/197` (commit `c14fa1b`, contiene i giri 240 e 256). Versione 7.999.197,
`GAME_VERSION` non toccato.

**Esito in una riga.** I due rossi **non nascono dal giro 240 né dal 256: nascono tutti e due dal giro 192** (commit `af84d42a`,
PO-406 «spalle −35°→−22°, braccia lungo i fianchi»). Li ho corretti nel gioco senza toccare nessuna soglia; anche il salto del
braccio del dubbio 1 veniva dalla stessa causa ed è sparito con la correzione B, e in più la regola delle spalle ora entra in
rampa nel saluto. `presentazione-142` e `spalle-146` sono verdi (erano i due rossi), il guardiano nuovo `serata-261` è verde e il rosso
`window.__CPM_NO_G261` cade su A, B e C. **Tutte le misure sono del banco di prova, nessuna è del telefono.** Un controllo della consegna è **rosso**: `gigante-212`, per una scena non giudicata che dipende dal risultato di una partita
(instabile anche sulla base; dettagli nella sezione 6). Ci sono dieci dubbi per il PO.

---

## 1. Storia del bisect

### B — `spalle-146` (spalle arretrate, testa avanti nella serata)

Sonda `tests/visual/misura-261.mjs B`: la sola serata, stessa scena e stesso metro di `spalle-146` (tre momenti a 2,5 · 3,7 ·
4,9 s reali dall'apertura), circa 50 s a passo. Verde = nessun corpo con `pro` < 0,008 e nuca mediana dell'eroe ≤ 0,005
(le soglie del giro 146b).

Prima misura sulla base (`c14fa1b`): 13–14 campioni su 21 sotto soglia, nuca 0,007–0,009. E già un indizio: **nello stesso
caricamento `pro` peggiora col passare dei secondi** (primo momento 0,009–0,015, terzo −0,002–0,005).

Ho provato per primo il commit prima dell'unione del giro 240 (`b00f40b`): **rosso anche lì** (16–18 su 21, nuca 0,011). Quindi
né il 240 né il 256. La storia di `lavoro/197` nel contenitore era tagliata a 50 commit: l'ho allungata (`git fetch --deepen`)
fino al commit del giro 146b in cui il guardiano era verde (`026a9f93`), e ho fatto `git bisect run` fra i due:

| commit | cosa | campioni sotto soglia | `pro` minimo | nuca eroe | |
|---|---|---|---|---|---|
| `026a9f93` | giro 146b (verde di partenza) | 0 | 0,0156 | −0,0064 | buono |
| `ae24eacf` | unione giro 183 in lavoro/192 | 0 | 0,0156 | −0,0063 | buono |
| `3606f28a` | unione giro 206 in lavoro/195 | 19 | −0,0045 | 0,0116 | cattivo |
| `88d8c50b` | unione giro 194 in lavoro/194 | 17 | −0,0043 | 0,0119 | cattivo |
| `b567a78a` | governo, 7.999.193 | 0 | 0,0155 | −0,0058 | buono |
| `ebf7618a` | giro 194 | 0 | 0,0157 | −0,0066 | buono |
| `cb2348cf` | unione giro 191 in lavoro/194 | 0 | 0,0157 | −0,0074 | buono |
| `5ed8207c` | giro 192, rapporto | 16 | −0,0044 | 0,0116 | cattivo |
| `af84d42a` | **giro 192 · PO-406 presentazione** | 16 | −0,0036 | 0,0104 | **primo cattivo** |
| `2233fb0b` | giro 192 · PO-404 (il commit prima) | 0 | 0,0156 | −0,0062 | buono |

Registro completo: `docs/sviluppo/giro261/bisect-B-spalle.txt`. Il giro 192 non aveva `spalle-146` fra i suoi controlli.

### A — `presentazione-142` (un corpo della fila fermo più di 1 s)

Qui un bisect automatico **non era possibile**: sulla stessa build il numero del guardiano cambia da corsa a corsa (ho misurato
0,23 · 0,50 · 0,54 · 0,69 sulla base; il giro 256 aveva letto 1,01 e 1,31). Il guardiano guarda una finestra di 4,5 s con 8–13
campioni: fra due campioni passano 0,3–0,5 s di scena, e «fermo» vuol dire meno di 1,5 mm in quel tratto. Con un corpo che si
muove poco il verdetto dipende da dove cadono i campioni.

Ho cambiato strumento (non la soglia): `misura-261.mjs A` è lo stesso campione e lo stesso criterio per **30 s reali**, e accanto
al «fermo» dà la **velocità mediana delle ossa** (mm per secondo di scena), che non dipende dall'intervallo. Due corse per commit:

| commit | cosa | fermo più lungo in 30 s | velocità mediana per corpo (mm/s) |
|---|---|---|---|
| `2233fb0b` | prima del giro 192 | 0,24 · 0,27 s | 19–24 |
| `af84d42a` | **giro 192 · PO-406** | **1,63 · 1,58 s** | **8–10** (uno a 16) |
| `13dbae8` | unione giro 225 | 0,75 · 1,06 s | 8–9 (uno a 15) |
| `a421dd9` | unione giro 240 | 1,16 · 0,93 s | 8–10 (uno a 12) |
| `c14fa1b` | base di questo giro (con 256) | 0,71 · 1,20 s | 8–10 (uno a 13) |

Registro: `docs/sviluppo/giro261/traccia-A-storia.txt`. **La velocità si dimezza al giro 192 e da lì non cambia più**: né il 225,
né il 240, né il 256 la spostano. La differenza 1,01 → 1,31 letta nel giro 256 era della corsa, non del giro. Dal giro 192
`presentazione-142` è verde o rosso a seconda della corsa (nei giri 225 e 240 era uscito verde).

## 2. Le cause (stesso commit, due meccanismi)

Il giro 192 ha aggiunto `_posa192` (spalla a −22° e braccia lungo i fianchi), chiamata a ogni fotogramma **dopo** la regola
delle spalle.

- **A.** `_posa192` scrive omero e avambraccio in una direzione fissa: l'oscillazione delle braccia della «vita» della fila
  (giro 142, «braccia che oscillano appena») veniva cancellata a ogni fotogramma. Restavano solo respiro e spostamento del peso.
- **B.** Nella serata la clip della fila è in pausa, e il mixer non riscrive un osso che non cambia. La regola delle spalle ruota
  la clavicola; poi `_posa192` la ruota ancora; al fotogramma dopo la regola trova una clavicola diversa da quella che aveva
  lasciato e la prende per una posa nuova. Le due correzioni si inseguono: alzare la spalla ruotando la clavicola la allarga, la
  regola la riporta in fascia, e a ogni giro la spalla finisce un po' più indietro. In 5 secondi le teste degli omeri passano da
  +0,016 a −0,004 (in stature) rispetto al torace: è l'arretramento che `spalle-146` vede.
- **C (dubbio 1 del giro 256).** Il salto di 11–14° a 0,09 s dall'inizio del saluto **veniva dallo stesso accumulo di B**, non solo
  dall'ingresso della regola: con la sola correzione B scende da 11,85° a 3,66° di eccesso sui vicini (stesso metro del giro 256).
  In più c'era un gradino che il metro del giro 256 non guarda (scarta i fotogrammi con peso sotto 0,02): al **primo fotogramma**
  del saluto, quando la regola passa per la seconda volta tutta insieme, omero e avambraccio destri si spostano di 6,6–7,8° e
  8,5–9,0°.

## 3. Cosa è cambiato nel gioco (solo `src/16-scene-3d-cerimonie.jsx`)

1. **A — la fila è viva nelle braccia.** La «vita» della fila calcola due onde lente e sfasate, una per braccio (`br261`), e
   `_posa192` le mette nella direzione di omero e avambraccio: pochi centimetri alla mano (circa ±2,5 cm **stimati dalle costanti, non misurati**), diversi per uomo.
   Si spegne mentre l'uomo cammina, come il resto della vita.
2. **B — le spalle non si accumulano più.** (a) Le clavicole entrano nella base che la «vita» riscrive in assoluto a ogni
   fotogramma (`base261`), come già gli omeri. (b) Ordine: la pendenza della spalla di `_posa192` si scrive **prima** della regola
   delle spalle, le braccia dopo. La regola passa per ultima sulla spalla, come dice l'invariante del giro 146.
3. **C — la regola entra ed esce in rampa nel saluto** (`_spalleRampa261`). Nei primi 0,2 s della dissolvenza del saluto (che ne
   dura 0,5) le ossa toccate dalla regola stanno fra la posa prima della regola e quella dopo; poi la regola vale intera come
   prima. Lo stesso in uscita.
4. **C — la cerniera del giro 256 mescola quaternioni unitari.** Con la seconda clip («clap twice hand up») le mie correzioni
   avevano fatto comparire un salto di 13,7° dell'avambraccio destro in un fotogramma all'uscita dal saluto: `_risolvi256`
   mescolava due quaternioni non unitari, e quando il loro prodotto superava 1 la mescola restava ferma sul primo finché il
   peso non arrivava a 1 esatto. Normalizzati prima della mescola: salto sparito.
5. **Rosso `window.__CPM_NO_G261`**: A, B e C come su `lavoro/197`. Per le sole sonde: `__CPM_NO_G261C` (solo la rampa spenta),
   `__CPM_RAMPA261` (un'altra durata della rampa).

La regola delle spalle in `src/12` (`_spalle146`) **non è stata toccata**. Nessuna soglia di nessun guardiano è stata toccata.

## 4. Misure prima e dopo (banco di prova, 360×800; C a 375×812 al rallentatore)

| misura | base `lavoro/197` e rosso `__CPM_NO_G261` | dopo | limite |
|---|---|---|---|
| A · fermo più lungo in 30 s | 0,70–1,22 s (storia: fino a 1,63) | 0 · 0,22 · 0,46 s | ≤ 1 s (giro 142) |
| A · velocità mediana per corpo | 7,5–13 mm/s | 21–30 mm/s | ≥ 15 (nuovo) |
| B · `pro` (spalle davanti al torace), minimo | −0,003 … −0,001 | 0,0167 | ≥ 0,008 (giro 146b) |
| B · campioni sotto soglia | 13–17 su 21 | 0 | 0 |
| B · nuca dell'eroe, mediana | +0,007 … +0,010 | −0,008 | ≤ 0,005 (giro 146b) |
| B · deriva di `pro` in 2,4 s | 0,008–0,013 | 0,0001–0,0014 | ≤ 0,003 (nuovo) |
| B · spalle/anche dell'eroe nella serata | 2,34 | 2,34 | 2,30–2,65 |
| C · primo fotogramma del saluto, omero / avambraccio destro | 6,6° / 8,5° | 0,8–1,4° / 1,6–2,1° | ≤ 4° (nuovo) |
| C · salto nei primi 0,20 s del saluto (dove cadeva il dubbio 1), «clapping hands up» | 7,81° | 2,63° | ≤ 5° (nuovo) |
| C · salto su tutto il saluto, «clapping hands up» | 7,7 · 8,1 · 11,9 · 12,7° | 3,7 · 4,1 · 4,3 · 5,4 · 6,0° | ≤ 15° (giro 256) |
| C · salto su tutto il saluto, «clap twice hand up» | 10,3° (giro 256: 8,8 · 9,0) | 9,2 · 9,6 · 10,7 · 12,5° (**vedi dubbio 9**) | ≤ 15° (giro 256) |

Il guardiano del giro 192 (`cerimonie-192`, punto C) sulla build finale: spalle −23,6° (fascia −26…−18; prima −22), gomiti
167,9° (≥ 155), mano 0,103 davanti alla spalla (≤ 0,15).

## 5. Guardiano nuovo `npm run serata-261`

`tests/visual/serata-261.mjs`, tre misure condivise con la sonda (`misura-261.mjs`), ognuna verde col verde e rossa con
`__CPM_NO_G261`; «non giudicato» è rosso; verde e rosso stampati per ultimi.

- **A** — traccia di 30 s: nessun corpo fermo più di 1 s di scena **e** velocità mediana di ogni corpo ≥ 15 mm/s.
  Il rosso cade sulla velocità (7,5–7,7); sul «fermo» cade solo in alcune corse (0,70 e 1,22 nelle due viste), per il motivo
  detto sopra.
- **B** — `pro` ≥ 0,008 su ogni corpo, nuca mediana dell'eroe ≤ 0,005 (soglie del giro 146b, invariate) e deriva di `pro` fra
  primo e ultimo momento ≤ 0,003.
- **C** — saluto al rallentatore: primo fotogramma del saluto, omero e avambraccio destri ≤ 4°; salto nei primi 0,20 s ≤ 5°;
  su tutto il saluto vale il limite del giro 256 (≤ 15°); il metro dei salti si prova nella stessa corsa (un salto provocato di
  30° viene letto 29,5–29,8°). In una prima stesura giudicavo tutto il saluto con ≤ 7°: l'avevo fissato su due corse (3,7 e
  4,1°) e nelle corse dopo il verde è arrivato a 6,0° per il gradino del braccio sinistro a 2,62 s (dubbio 9), che questo giro
  non ha risolto. Ho spostato il giudizio stretto sulla finestra dove agisce la correzione, invece di tenere una soglia che
  sarebbe caduta a caso.

Le soglie nuove sono state fissate dopo la misura, tranne quella dei primi 0,20 s (5°), scritta prima di leggere il verde
(2,63°) e il rosso (7,81°): una corsa sola per parte. Durata 7 min 40 s. È in `ci-runner.mjs` nella catena `completa` e nella mappa
mirata di `src/16`.

## 6. Controlli eseguiti sulla build finale (commit `f1b2476e`)

Uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco letti prima di ognuno (prime righe di ogni
uscita). `node tools/build-src.mjs` e `node tools/check-src.mjs` (IDENTICO BYTE PER BYTE) dopo ogni modifica a `src/`.
Uscite complete in `docs/sviluppo/giro261/controlli-*.txt`, riepilogo in `controlli.txt`.

| controllo | esito | durata | nota |
|---|---|---|---|
| `serata-261` (nuovo) | **verde**, e il rosso cade su A, B e C | 7 min 38 s | seconda corsa, col giudizio dei salti definitivo; la prima (7 min 31 s) era verde col giudizio precedente |
| `presentazione-142` | **verde**, e il rosso cade | 3 min 3 s | fermo 0 s nella finestra del guardiano (sulla base: 1,01 e 1,31 s) |
| `spalle-146` | **verde**, e i due rossi cadono | 8 min 10 s | serata: `pro` 0,0168 · nuca −0,0073 · spalle/anche 2,34 · coerenza fra le scene 1,03 |
| `presentazione-225` | **verde**, e il rosso si vede | 23 min 44 s | salti: «clapping hands up» 4,1° · «clap twice hand up» 10,72° (limite 15; dubbio 9) |
| `pelle-240` | **verde**, e il rosso si vede | 8 min 1 s | |
| `tpose-196` | **verde**, e il rosso atteso si vede | 34 min 28 s | supera i 20 minuti: è nell'elenco della consegna |
| `gigante-212` | **ROSSO, due corse su due** | 13 min 30 s · 14 min 15 s | nessun corpo fuori misura in nessuna scena giudicata (serata compresa); rosso perché la scena «festa a fine partita» **non è stata giudicata**: la partita di prova non è stata vinta e la festa non è comparsa. Vedi sotto e dubbio 10 |
| `test:logic` | **verde** | 2 s | |
| `save-compat` | **verde** | 9 s | |
| `cerimonie-192` (aggiunto da me) | **verde**, e ogni rosso si vede | 8 min 49 s | giudica `_posa192`, la funzione che ho modificato: spalle −23,6° · gomiti 167,4° · mano 0,10 |

**Il rosso di `gigante-212`.** Lo scenario `festa-vera-tel` gioca una partita vera fino al fischio e misura la festa che ne nasce;
la festa compare solo se la partita è **vinta**. Ho giocato la stessa partita da sola cinque volte (`CPM_SCENARI=festa-vera-tel`
e una sonda che stampa cosa decide la festa): sulla build di questo giro persa · persa · **vinta 5-1 (festa)**; su `lavoro/197`
senza questo giro **vinta (festa, scena verde)** · persa 0-1. Il risultato cambia da corsa a corsa **sulla stessa build**, anche
sulla base: il rosso non dipende dalle modifiche di questo giro, ma resta un rosso e **non l'ho riparato** (lo scenario è del
giro 212, la partita è `src/15`: fuori dall'ambito). Non ho fatto una terza corsa intera. La prova del rosso di `gigante-212`
(il secondo comando dello script) non è partita, perché il primo è uscito rosso. La sonda usata per le cinque partite era
provvisoria e non è nel ramo.

`tpose-196` e `gigante-212` rigenerano foto di altri giri in `docs/sviluppo/giro196/`: le ho rimesse con `git checkout --` e non
sono nel commit.

## 7. Errori miei durante il giro, trovati dalle misure

| cosa ho visto | causa | correzione |
|---|---|---|
| la prima sonda di A (finestra di 4,5 s come il guardiano) non riproduceva il rosso | il numero dipende da dove cadono i campioni | traccia di 30 s e velocità mediana |
| dopo la prima stesura di B l'eroe nella serata aveva spalle/anche 2,447 contro 2,34 delle altre scene (`spalle-146` verde, ma coerenza 1,047 su 1,05) | `_posa192` alzava la spalla **dopo** la regola e così la allargava | la pendenza della spalla prima della regola, le braccia dopo: 2,34, coerenza 1,031 |
| con la prima rampa, un gradino di 3–4° per due fotogrammi dove la rampa finisce e dove ricomincia | i quaternioni che la regola scrive non sono unitari (ossa con scala non uniforme, la lezione del giro 256): mescolarli così com'erano cambiava la posa anche a rampa quasi piena | direzione e norma mescolate a parte: gradino sparito |
| una corsa di `serata-261` partita per sbaglio in sottofondo mentre preparavo i controlli | errore mio nel comando | fermata subito (per numero di processo), nessun controllo le è girato accanto |
| una corsa di `misura-256` fallita all'avvio | mancava `CPM_CHROME` | rilanciata |
| `presentazione-225` verde ma con la seconda clip a 13,62° di salto (limite 15; nel giro 256 era 8,82) | due salti diversi: uno nuovo dell'avambraccio destro (la mescola della cerniera, corretto, punto 4 della sezione 3) e uno del braccio sinistro che c'era già (dubbio 9) | ho fermato i controlli lunghi, corretto il primo e rifatto tutto l'elenco |
| due correzioni provate per il salto del braccio sinistro e **ritirate** perché la misura non cambiava | una condizione nella regola delle spalle (`src/12`, mano fuori portata) e la riscrittura dalla base di avambraccio e mano sinistri | tolte tutte e due: `src/12` è identico a `lavoro/197` |
| un commit (`af006f0d`) col file di gioco non ricostruito | un controllo di sintassi fallito ha saltato la build nella stessa riga di comando | commit successivo `f1b2476e` con la build e `check-src` identico; i controlli finali sono su quello |

Le uscite dei controlli girati sulle due stesure precedenti sono in `docs/sviluppo/giro261/prima-stesura/` (prima della
correzione dell'ordine: documentano il 2,447) e `seconda-stesura/` (prima della mescola unitaria: documentano il 13,62°).
**Non valgono per la build finale.**

## Cosa non è cambiato

`GAME_VERSION`, `SAVE_VERSION`, il salvataggio, `docs/governo/ROADMAP.md`, `docs/RELEASE_HISTORY.md`, la regola delle spalle
(`src/12`), le due clip Rohr, la cerniera del giro 256, le soglie di tutti i guardiani esistenti. Nessun asset nuovo.
Aggiunti: `tests/visual/serata-261.mjs`, `tests/visual/misura-261.mjs`, due voci in `package.json`, due in `ci-runner.mjs`
(`node --check` verde), una riga di invariante in `CLAUDE.md`.

---

## Dubbi per il PO

1. **I due rossi vengono dal giro 192, non dal 240 o dal 256.** La consegna indicava come probabile il 240 o il 256: il bisect dice
   altro (sezione 1). Ne segue che la serata è stata così — spalle che arretrano e fila quasi ferma — in tutte le versioni dal
   giro 192 in poi, comprese le foto dei giri 225, 240 e 256.
2. **La serata cambia aspetto.** Le spalle della fila ora stanno davanti al torace e non si spostano più col tempo; le braccia
   oscillano di circa ±2,5 cm alla mano. È quello che i giri 142 e 146b avevano fissato, ma **non è quello che si è visto sul
   telefono dal giro 192 in poi**. Non ho foto del telefono e non so dire se l'oscillazione lì si nota troppo o troppo poco:
   l'ampiezza è una costante sola (`0.035` / `0.050` in `_posa192`).
3. **La pendenza della spalla è −23,6° invece di −22°.** Con la regola delle spalle che passa per ultima, la spalla si stringe di
   poco e la pendenza cambia di 1,6°. Resta nella fascia del guardiano del giro 192 (−26…−18).
4. **Il rosso `__CPM_NO_G146B` di `spalle-146` nella serata non mostra più la gobba.** Quel rosso (la regola del giro 146
   com'era) cade ancora, ma per le spalle alte negli highlight e in panchina; nella serata, col nuovo ordine, `pro` resta 0,020.
   Il guardiano è verde e i due rossi cadono, quindi non l'ho toccato. La prova del rosso su `pro` e nuca nella serata ora la dà
   `serata-261`.
5. **`presentazione-142` resta com'è.** La sua finestra di 4,5 s è lo strumento che dal giro 192 dava verde o rosso a seconda
   della corsa. Ora il gioco le sta lontano (0 s nella corsa finale, soglia 1 s), ma lo strumento non l'ho cambiato: la misura
   robusta sta in `serata-261`.
6. **C: ho fatto la rampa, ma il salto del dubbio 1 l'ha tolto B.** La rampa toglie un gradino diverso (il primo fotogramma del
   saluto). All'uscita dal saluto e nei due fotogrammi prima dell'ingresso si leggono passi di 10–40°: lì il corpo sta
   camminando a velocità normale mentre il saluto è al rallentatore, quindi è velocità × intervallo e **non l'ho giudicato**.
   `serata-261` misura C solo su «clapping hands up»; «clap twice hand up» è giudicata da `presentazione-225` (blocco D).
7. **Il braccio sinistro del chiamato ha ancora una memoria.** Avambraccio e mano destri vengono riscritti dalla base a ogni
   fotogramma (giro 144); i sinistri no, e tornano al punto di partenza solo attraverso la memoria della regola delle spalle.
   Il salto più grande che resta a saluto in corso (3,7–5,4°, avambraccio sinistro a 2,62 s) sta lì. Non l'ho toccato: è sotto
   i limiti e non era nella consegna.
8. **Controlli non eseguiti.** La mappa mirata di `src/16` in `ci-runner.mjs` elenca circa cento guardiani dell'interfaccia di
   carriera (lo stesso elenco vale per `src/18` e `src/10`) più `highlight-95`: non li ho eseguiti. Ho eseguito l'elenco della
   consegna, il guardiano nuovo e in più `cerimonie-192`, perché giudica proprio la funzione che ho modificato. Il ramo vecchio
   della serata (quello che gira solo col rosso `__CPM_NO_G225`) non ha la correzione dell'ordine.
9. **Con la seconda clip resta un salto del braccio sinistro, e non ne ho trovato la causa.** In «clap twice hand up», a circa
   0,27 s dall'inizio del saluto (peso 0,55), omero e avambraccio sinistri cambiano di 12–15° in un fotogramma: eccesso sui vicini
   9,2 · 9,6 · 12,5° nelle mie corse e 13,62° in una corsa di `presentazione-225` (limite 15°). **C'era già sulla base** (10,3° a
   0,20 s col rosso; 8,8–9,0° nel rapporto del giro 256), ma con le mie correzioni cade più tardi ed è uscito più alto: è più
   vicino al limite di prima e `presentazione-225` potrebbe diventare rosso in qualche corsa. Lo stesso gradino, più piccolo
   (5–7°), c'è con «clapping hands up» a 0,29 s e a 2,62 s. Cosa so: riguarda solo il braccio sinistro; la parte della regola
   delle spalle che sposta la spalla è continua in quel punto (misurata); le due ipotesi che ho provato erano sbagliate.
   Cosa non so: quale passaggio lo produce. Serve un giro dedicato sulla regola delle spalle (`src/12`), con la sua mappa di
   controlli.
10. **`gigante-212` è instabile e in questo giro è rosso.** La sua scena «festa a fine partita» viene giudicata solo se la partita
    di prova finisce con una vittoria, e il risultato di quella partita non è riproducibile (cinque corse, due build: tre perse,
    due vinte). Quando è persa il guardiano dice «non giudicata», cioè rosso. Serve una decisione: riparare lo scenario (per
    esempio provocando la vittoria dalla sonda, come già si fa con le statistiche) è un lavoro sul guardiano del giro 212 e non
    l'ho fatto. Tutte le altre scene di `gigante-212`, compresa la serata, sono state giudicate e sono verdi.

