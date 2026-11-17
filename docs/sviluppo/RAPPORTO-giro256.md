# Rapporto giro 256 — il saluto della serata alterna le due clip Rohr (seguito di PO-499)

Ramo `sviluppo/giro256-saluto-alterna`, partito da `lavoro/197` (commit `ee276bc`, contiene il giro 240).
Decisione del PO da cui parte il giro (17/11): **«Alternarle»** — nella serata di presentazione una volta «clapping hands up»
(la clip di oggi) e una volta «clap twice hand up» (due battiti e braccia in alto); per le clip vere i limiti di velocità e
ampiezza del braccio non si applicano, restano quelli che vedono difetti veri.

**Esito in una riga.** L'alternanza c'è ed è misurata (prima serata «clapping hands up», serata dopo «clap twice hand up»,
terza di nuovo la prima; riaprire la stessa serata non cambia clip). La clip nuova usciva dalla cerniera del gomito
(limite che il PO ha tenuto): l'ho corretta nel gioco senza spostare nessuna articolazione. Il guardiano `presentazione-225`
è verde e il rosso si vede. **Tutte le misure sono del banco di prova, nessuna è del telefono.** Due controlli della consegna sono **rossi**
(`presentazione-142` e `spalle-146`): lo sono anche su `lavoro/197` senza questo giro, e non li ho corretti. Ci sono sei dubbi
per il PO.

---

## 1. Misura prima (le due clip nella serata, com'erano su `lavoro/197`)

Sonda `tests/visual/misura-240.mjs` (clip forzata dalla sonda), chiamato del battito 3, telefono 375×812, tempo di scena.

| misura | «clapping hands up» | «clap twice hand up» (grezza) | limite del giro 225 |
|---|---|---|---|
| gomito destro, angolo interno | 104,4–155,2° | 86,7–156,1° | ≥ 40° |
| omero dalla verticale, massimo | 61,2° | 119,6° | ≤ 150° |
| gomito destro fuori dalla cerniera, a saluto in corso | 0–9,3° | 17,3–**39,5°** | ≤ 25° |
| polso, massimo | 62,3° | **71,4°** | ≤ 70° |
| velocità omero / avambraccio (finestra 0,10 s) | 197 / 370 °/s | 304 / 389 °/s | ≤ 350 / ≤ 530 |
| palmi, distanza minima | 0,124 | 0,120 | ≥ 0,08 |
| mani e gomiti dal busto, minimo | 0,237 | 0,208 | ≥ 0,12 |
| mani e gomiti dalla testa, minimo | 0,287 | 0,261 | ≥ 0,15 |
| mani sopra le spalle, massimo | 0,096 | 0,388 | — |

Due cose rispetto al rapporto del giro 240 (che dava tre limiti superati):

- **La velocità oggi sta dentro i limiti** (304 / 389 contro 397 / 570 del giro 240): la differenza è la rampa di 0,5 s
  introdotta alla fine di quel giro, che allora non c'era nella misura della clip di ripiego.
- **Il gomito fuori dalla cerniera resta** (39,5° contro 25°), ed è un limite che la decisione del PO tiene.
  L'ho misurato anche in modo geometrico e per tutti e due i lati (scarto dell'avambraccio dal piano della cerniera, rispetto
  alla posa di riferimento): **fino a 54° a sinistra e 39° a destra**. «Clapping hands up» sta a 12,6° e 8,1°.

Quindi con i limiti dichiarati dal PO la clip nuova, così com'è nel file, sarebbe stata rossa sulla cerniera.

## 2. Cosa è cambiato nel gioco (`src/16-scene-3d-cerimonie.jsx`)

1. **Alternanza** (`saluto256Scegli`). Una clip per serata. Memoria sul dispositivo, chiave propria `cpm-saluto256`, una voce
   per giocatore (al massimo sei), come la rotazione delle coreografie del giro 244. **Nessun campo nel salvataggio.**
   La prima serata di sempre usa «clapping hands up». Riaprire la stessa serata (stesso club, stessa stagione) ridà la stessa
   clip. Se la memoria del dispositivo non si legge, la scelta viene dalla chiave della serata: è stabile ma non garantisce
   l'alternanza stretta. Se la clip scelta mancasse dal file, si usa l'altra.
2. **Cerniera del gomito per la clip nuova** (`_risolvi256`). La clip mette sull'osso dell'avambraccio una rotazione che in un
   braccio vero è della spalla. Dopo la clip e dopo la regola delle spalle: l'omero ruota intorno al proprio asse finché il
   piano della cerniera contiene l'avambraccio; l'avambraccio diventa flessione pura; mano e ossa di torsione tengono
   l'orientamento che la clip ha dato loro. **Spalla, gomito, polso e dita non si spostano**: cambia solo come gira la pelle
   intorno al braccio. Vale per i due lati (la calibrazione della cerniera del giro 225 ora esiste anche per il sinistro).
   Si applica **solo** a «clap twice hand up»: «clapping hands up» sta nei limiti e non è stata toccata.
3. **Rosso `window.__CPM_NO_G256`**: sempre «clapping hands up», nessuna memoria scritta, nessuna risoluzione della cerniera.
4. Solo per le sonde (sotto `?cpmtest=1`): `orient256` (sola lettura) e `__CPM_LENTO256` (il saluto al rallentatore).

Tre errori miei durante il giro, trovati dalle misure e corretti prima dei controlli finali:

| cosa ho visto | causa | correzione |
|---|---|---|
| avambraccio ruotato di ~150° sul proprio asse a 2,16 s | sceglievo il ramo sbagliato della soluzione quando il braccio era più disteso della posa di riferimento | il verso della flessione si conta dal braccio disteso |
| omero che ruotava a braccio fermo | il mixer non riscrive un osso la cui traccia non è cambiata, e il primo passaggio della regola delle spalle lavorava sulla posa già risolta | la risoluzione si disfa in testa al fotogramma, prima di ogni altra posa |
| «scatto» di ~19° a fotogramma a braccio fermo, solo a sinistra | era il metro: il quaternione di mondo di un osso con scala non uniforme non è unitario | normalizzato nella misura e nella risoluzione |

## 3. Limiti che valgono per la clip nuova (dichiarazione chiesta dalla consegna)

Sono scritti accanto alle costanti in `tests/visual/presentazione-225.mjs` e valgono uguali per le due clip nei bracci
`verde256` / `rosso256`.

**Restano (vedono un difetto vero):**

| limite | valore | «clapping hands up» | «clap twice hand up» |
|---|---|---|---|
| gomito destro, angolo interno | ≥ 40° | 104,3° | 86,7° |
| gomito destro fuori dalla cerniera, a saluto in corso (rotazione) | ≤ 25° | 9,4° | 0° (grezza 38,2°) |
| avambraccio fuori dal piano della cerniera, per lato (geometrico) | ≤ 25° | 12,6° / 8,1° | 1,2° / 1,3° (grezza 53,3° / 36,9°) |
| palmi, distanza minima (le mani non si compenetrano) | ≥ 0,08 | 0,124 | 0,136 |
| mano destra dal suo lato del corpo | ≥ 0,02 | 0,035 | 0,060 |
| mani e gomiti dall'asse del busto | ≥ 0,12 | 0,237 | 0,208 |
| mani e gomiti dalla testa | ≥ 0,15 | 0,286 | 0,258 |
| salto fra un fotogramma e l'altro, al rallentatore (vedi sotto) | ≤ 15° più dei vicini | 7,5° | 8,8° |
| velocità nelle **rampe** (tratto calcolato: 0,5 s di dissolvenza dalla posa a riposo e ritorno) | ≤ 350 / ≤ 530 °/s | 194 / 378 | 304 / 393 |

**Non si applicano alla clip a peso pieno (decisione del PO: ampiezza e velocità):**

| limite del giro 225 | valore | «clap twice hand up» misurata |
|---|---|---|
| polso | ≤ 70° | 69,5–73,7° a seconda della corsa |
| omero dalla verticale | ≤ 150° | 120–122° (dentro comunque) |
| velocità omero / avambraccio a clip piena | ≤ 350 / ≤ 530 °/s | 276 / 267 (dentro comunque) |

In pratica **l'unico limite del giro 225 che la clip nuova supera e che non viene più giudicato è il polso**, di 0–4°.

**Il gesto di ciascuna clip** (perché il guardiano veda che la clip è quella giusta): «clapping hands up» come nel giro 240
(mani all'altezza delle spalle o sopra ≥ 1,5 s, ≥ 4 battiti: misurato 2,12 s e 8 battiti); «clap twice hand up» almeno
2 battiti e tutte e due le mani ad almeno 0,25 sopra le spalle per ≥ 0,35 s (misurato 2–3 battiti, 0,62–0,64 s, mani fino
a 0,385).

Nel braccio `verde` storico del guardiano (serata nuova su un dispositivo nuovo, quindi «clapping hands up») i limiti del
giro 240 sono rimasti tutti, invariati.

### Come si misurano i salti, e perché ho cambiato metro a metà giro

La prima stesura misurava a velocità normale «un passo molto più veloce dei vicini». Sul banco la scena gira a circa
17 fotogrammi al secondo: quel numero era velocità × intervallo e cambiava da corsa a corsa sullo stesso movimento
(117, 134, 150, 160, 249 °/s). Avevo fissato il limite a 240 su quattro corse e la quinta è uscita rossa a 249.
**Non ho alzato la soglia: ho cambiato strumento.** La sonda ora rallenta il solo saluto (`__CPM_LENTO256`, un ottavo del
passo di scena, circa 7 millesimi di secondo di saluto per fotogramma): un movimento continuo fa passi piccoli e simili ai
vicini, un salto resta della stessa ampiezza. Il metro si prova nella stessa corsa: un salto provocato di 30° viene letto
28,8–29,7°; se non lo vedesse il guardiano sarebbe «non giudicato», cioè rosso.

Il limite di 15° **non** è «nessun salto»: vedi il dubbio 1.

## 4. Guardiano `presentazione-225`, blocco D — cosa giudica in più

Due bracci nuovi nello stesso comando (`npm run presentazione-225`), `verde256` e `rosso256`:

- **verde256** — quattro serate di fila sullo stesso dispositivo (stagioni 12, 13, 13 riaperta, 14):
  prima = «clapping hands up», seconda = «clap twice hand up», riaperta = uguale alla seconda, terza = di nuovo la prima;
  la scelta sta in `cpm-saluto256` e non nei tre salvataggi; la clip nuova ha la risoluzione della cerniera attiva;
  le due clip dentro i limiti della sezione 3.
- **rosso256** (`__CPM_NO_G256`) — due serate di fila danno tutte e due «clapping hands up» (l'alternanza non si vede);
  forzando la clip nuova la risoluzione non c'è e il difetto della cerniera si vede con lo stesso metro
  (38,2° di rotazione, 53,3° / 36,9° dal piano).

Ultima corsa sulla build finale: **verde, 24 minuti** (17:53:55 → 18:17:54). Uscita completa in
`docs/sviluppo/giro256/controlli-presentazione-225.txt`. Prima del giro durava 13 minuti: i bracci nuovi ne aggiungono 11
(due saluti al rallentatore, circa due minuti l'uno).

Strumenti nuovi: `tests/visual/misura-256.mjs` (sonda, una clip alla volta; `--rosso`, `--lento`, `--foto`) e
`tests/visual/lib/saluto-256.mjs` (le misure condivise fra sonda e guardiano). Nessuna voce nuova in `ci-runner.mjs`:
il guardiano è lo stesso, già nelle catene.

## 5. Controlli eseguiti

Uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco letti prima di ognuno
(registro in `docs/sviluppo/giro256/controlli.txt`). `node tools/build-src.mjs` e `node tools/check-src.mjs` dopo ogni
modifica a `src/`.

| controllo | esito sulla build finale | durata | nota |
|---|---|---|---|
| `presentazione-225` (aggiornato, blocco D) | **verde**, e il rosso si vede | 24 min | prima due corse rosse **mie**: metro degli scatti a velocità normale (249 > 240) e poi soglia dei salti messa a 5° prima di misurare (misurato 7,5–11,3°) |
| `pelle-240` | **verde**, e il rosso si vede | 7 min 37 s | |
| `test:logic` | **verde** | 3 s | |
| `save-compat` | **verde** (12 su 12) | 9 s | |
| `tpose-196` | TPOSE_ESITO | TPOSE_DURATA | TPOSE_NOTA |
| `presentazione-142` | **ROSSO** | 2 min 56 s | «fermo per 1,31 s di scena > 1». **Rosso anche su `lavoro/197` senza questo giro** («fermo per 1,01 s > 1», 2 min 45 s) |
| `spalle-146` | **ROSSO** | 7 min 48 s | serata: «spalle arretrate dietro il torace» su 16 corpi e «testa davanti alle spalle (nuca 0,008 > 0,005)». **Rosso anche su `lavoro/197` senza questo giro**, con gli stessi due rilievi (18 corpi, nuca 0,009) più uno negli highlight |

**I due rossi non li ho corretti.** Per non supporre li ho rieseguiti su una copia pulita di `lavoro/197` (commit `ee276bc`):
sono rossi anche lì, con gli stessi rilievi, quindi non nascono dall'alternanza. Sono fuori dall'ambito di questo giro e
toccano regole condivise (la vita dei corpi in fila del giro 142, la regola delle spalle del giro 146). Uscite complete in
`docs/sviluppo/giro256/` (`controlli-*.txt`, `base197-*.txt`). Vedi il dubbio 6.

Non ho eseguito `highlight-95`, `ingresso-206`, `career-critical` né la mappa mirata di `src/16` (regola PO-504 A: fuori
dalla consegna; l'elenco della mappa non l'ho nemmeno aperto, perché `node ci-runner.mjs mirata` esegue invece di elencare
— errore già dichiarato nel giro 240).

## 6. Foto (`docs/sviluppo/giro256/`)

- `clapping-hands-up-applauso.jpg` — prima serata, applauso a mani all'altezza del viso.
- `clap-twice-battito.jpg` — serata dopo, uno dei due battiti.
- `clap-twice-braccia-in-alto.jpg` — serata dopo, braccia in alto.
- `clap-twice-discesa.jpg` — serata dopo, le mani tornano insieme prima di scendere.
- `clap-twice-grezza-braccia-in-alto.jpg` — la stessa posa prima della risoluzione della cerniera, per confronto.

Alla distanza della camera della serata la differenza fra «grezza» e «risolta» non si vede a occhio: le ossa stanno nello
stesso posto. Il difetto era nei numeri, non nella foto.

## Cosa non è cambiato

`GAME_VERSION`, `SAVE_VERSION`, il salvataggio, `docs/governo/ROADMAP.md`, `docs/RELEASE_HISTORY.md`, `ci-runner.mjs`,
la regola delle spalle, la clip «clapping hands up», la finestra Crediti del gioco (il testo «Applauso dei giocatori nella
serata di presentazione» vale per tutte e due). Nessun asset nuovo: le due clip stanno nello stesso file
`assets/cgtrader-clip-rohr.glb`, già nel pacchetto dal giro 240. Ho aggiunto una nota in `docs/governo/CREDITI-fonti.md` e
in `tests/character-lab/CLIP_REGISTRY.md`, e una riga di invariante in `CLAUDE.md`.

Coordinamento col giro 255 (schieramento, `src/11`–`12`): questo giro tocca solo `src/16`, i guardiani e i documenti.

---

## Dubbi per il PO

1. **Un salto del braccio che esiste già oggi.** Al rallentatore, a inizio saluto (circa 0,09 s, braccia appena partite),
   l'omero e l'avambraccio sinistri cambiano orientamento di **11–14° in un solo fotogramma** (cioè 7,5–11,3° più dei
   fotogrammi vicini, che è il numero che il guardiano giudica). C'è con la clip di oggi («clapping hands up» 7,5 · 7,9 ·
   11,3° in tre corse), con la clip nuova (8,8 · 9,0°) e con la clip nuova grezza (9,9°): non nasce
   dall'alternanza. Spegnendo la regola delle spalle del giro 146b (`__CPM_NO_G146`) scende a 4,1°: viene da lì, nel momento
   in cui la regola comincia a tenere ferme le mani. Non ho toccato quella regola (vale per tutte le scene 3D e ha il suo
   guardiano). Il limite dei salti del guardiano è 15°, sopra questo valore: vede ciò che si aggiunge, **non** questo salto.
   Non so dire se sul telefono si vede. Se il PO lo vuole chiuso, è un giro sulla regola delle spalle.
2. **La cerniera: ho corretto invece di esentare.** La decisione tiene il limite «gomito fuori dalla cerniera» e la clip
   nuova lo superava (39,5° contro 25°). Ho scelto di rimettere la rotazione sull'omero nel gioco. L'alternativa era
   dichiarare rossa la clip. Se il PO preferisce la clip esattamente com'è nel file, basta togliere il nome da `_CER256`,
   ma il limite della cerniera diventa rosso.
3. **Quanto si vede della clip nuova.** Del saluto si usano i primi 2,4 s più la discesa (come nel giro 240, perché il
   chiamato torni in fila entro i 6 s). Della clip nuova entrano: salita delle braccia, due battiti, braccia in alto
   (0,6 s), poi le mani tornano insieme mentre scendono. Il conteggio dei battiti del guardiano dà 2 o 3 a seconda della
   corsa, per quest'ultimo avvicinamento.
4. **Chi alterna.** L'alternanza è per giocatore e per dispositivo: una carriera nuova con lo stesso nome continua
   l'alternanza della precedente; cambiando telefono o cancellando i dati del gioco si riparte da «clapping hands up».
   Tutti i chiamati della stessa serata fanno la stessa clip.
5. **Telefono.** Nessuna misura è del telefono. Da guardare lì: la serata della stagione dopo (braccia in alto), e l'inizio
   del saluto in tutte e due (dubbio 1).
6. **Due guardiani della serata rossi già su `lavoro/197`.** `presentazione-142`: un corpo della fila resta fermo più di 1 s
   di scena (1,01 s sulla base, 1,31 s sul mio ramo: una corsa per parte, non so dire se la differenza è del giro o della
   corsa). `spalle-146`: nella serata le spalle risultano arretrate e la testa avanti rispetto alle soglie del giro 146b.
   Il giro 240 non aveva `spalle-146` fra i suoi controlli, quindi non so da quale giro siano rossi. Serve una decisione su
   chi li ripara; io non ho abbassato soglie né toccato quelle regole.
