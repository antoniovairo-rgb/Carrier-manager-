# Rapporto giro 220 — PO-485: `moves-budget` rosso su gi4

Ramo `sviluppo/giro220-moves-budget`, partito da `lavoro/196` (= 7.999.195). `GAME_VERSION` non toccata, `src/` non toccato
(nessuna ricomposizione necessaria), nessun asset nuovo, nessun campo di salvataggio.

## 1. Verdetto

**È il guardiano che misura male, non il gioco.** L'eroe non fa passi da solo: su gi4, prima scena di una pagina appena
aperta, la mesh fa lo **stacco di scena** (teletrasporto voluto, 7.194) dal punto della scena precedente al punto della
scena forzata. Il guardiano leggeva la posizione «prima» **500 ms dopo la forzatura, a orologio**; quando lo stacco atterrava
dopo quei 500 ms, lo contava come passi fatti premendo il tasto.

## 2. Misure

Sonde di prova (in scratchpad, non nel repo), GLB spento, 700×700, `CPM_CHROME=/opt/pw-browsers/chromium`.

**a) Campioni dopo la forzatura di gi4, nessun tasto premuto (7.999.195):**

| tempo dalla forzatura | chiave di scena (`__CPM_G96().sk`) | mesh eroe | punto logico |
|---|---|---|---|
| +200…+1200 ms | `10004` (già la scena nuova) | (81, 26) | (86, 69) |
| ~+1400 ms | `10004` | (81, 26,2) | (86, 69) |
| successivo | `10004` | **(86, 69)** | (86, 69) |

La chiave di scena e il punto logico arrivano subito. La mesh resta ferma perché su una pagina appena aperta i fotogrammi sono
radi; al primo fotogramma che vede la chiave nuova fa un passo normale (0,2 u) e arma lo stacco, che scatta al fotogramma dopo.
Il punto logico **non si muove mai** dopo la forzatura. Mosse a 0 per tutto il tempo.

**b) La stessa scena come seconda scena della pagina** (prima gi12, poi gi4): stacco atterrato entro 153 ms. Il ritardo
c'è solo sulla prima scena di una pagina appena aperta.

**c) La gara del guardiano (forzatura → attesa 500 ms → lettura → lettura 1,5 s dopo), 4–5 pagine nuove per versione:**

| versione | stacco atterrato dopo la lettura dei 500 ms |
|---|---|
| 7.999.195 | 3 su 4 |
| 7.999.129 | 3 su 5 |
| 7.999.128 | 3 su 5 |
| 7.999.100 | 5 su 5 |
| 7.999.50 | 3 su 5 |
| 7.900.0 | 4 su 5 |
| 7.700.0 | 5 su 5 |

**d) Il guardiano vero, senza modifiche, sulle versioni vecchie:** **rosso sulla 7.700.0** («concessi 0, fatti 22,4,
spostamento 56,1») e **verde sulla 7.999.100**. Il file `moves-budget-test.mjs` è identico byte per byte dalla 7.602.0
(commit `8098f4f2`, 26/08, il più vecchio raggiungibile nella storia clonata) alla 7.999.195.

**Da quale versione nasce.** La gara esiste in tutte le versioni misurate, a partire dalla 7.700.0: il rosso non nasce da un
commit del gioco, ma è un difetto del guardiano presente almeno dalla 7.602.0. **Non posso confermare** che sia nato con il
guardiano stesso (7.388.0): quella versione è oltre la storia clonata. L'ampiezza diversa nel tempo (10,8 → 17,3 → 22,4
passi) è solo la distanza fra il punto dell'eroe nella scena d'apertura della pagina e il punto di gi4, che è cambiata fra le
versioni ((69,48) sulla .100/.128, (81,26) sulla .195, (34,48) sulla .700); non indica un difetto che peggiora. Il passaggio
«intermittente → sempre rosso» notato nel giro 213 dalla .154 in poi è coerente con la gara (sulla .195 l'ho vista perdere 3
volte su 4), ma con 4–5 prove per versione non posso dire se dalla .154 la pagina sia diventata davvero più lenta. Le
versioni .153 e .154 non le ho misurate.

## 3. Correzione del guardiano (`tests/visual/moves-budget-test.mjs`)

Soglie invariate (`PASSO` 2,5 · `TOLL` 1,2 · stesse dieci scene · stessa pressione di 5,2 s).

1. **Si aspetta un evento, non un tempo.** Dopo la forzatura il guardiano legge ogni 150 ms e parte solo quando la chiave di
   scena nel 3D è quella nuova (`sk % 10000 == gi` e diversa da prima) **e** la mesh sta entro 0,5 u dal punto logico, due
   letture di fila. Tetto 12 s: oltre, la scena è **non giudicata** e non giudicato = rosso.
2. **Si misura sia la mesh sia il punto logico**; conta il maggiore dei due spostamenti (prima solo la mesh).
3. **Braccio rosso incorporato.** Dopo il verde il guardiano riapre una pagina e ripete le scene provocando il difetto che
   deve vedere: durante la pressione il budget viene ricaricato ogni 300 ms (`__CPM_FILL_MOVES`), cioè l'eroe fa passi veri
   dal ramo tastiera senza che gli siano concessi. Il rosso deve bocciare **tutte** le scene «libere» (quelle in cui nel verde
   l'eroe ha speso l'intero budget; almeno 3), altrimenti il guardiano si dichiara cieco ed esce ≠ 0. Le scene non libere
   (gi96, gi149, gi150: l'eroe è al bordo della zona di movimento verso destra e anche nel verde fa 0–1,6 passi) non possono
   mostrare passi in più e non vengono pretese.
4. `--solo-verde` salta il rosso per iterare; l'uscita lo dichiara e non vale come verde.

Durata: da ~77 s a ~155 s (due bracci).

Nessun rosso `__CPM_NO_G220`: il gioco non è stato corretto (non c'era nulla da correggere).

## 4. Esiti di `moves-budget` (5 corse, registri `docs/sviluppo/giro220/controlli/moves-budget-1..5.txt`)

| corsa | verde | rosso | esito |
|---|---|---|---|
| 1–5 | 10 scene misurate, 0 non giudicate, 0 passi in più | 5 libere (gi12 gi22 gi56 gi118 gi141), 5 bocciate | ✅ PASS 5/5 |

Attesa della scena gi4 (prima della pagina) nel verde: 4,3–5,0 s; le altre scene 0,3–0,6 s. Nel rosso, per esempio,
gi12 «concessi 1, fatti 4,4 (11,0 u)», gi22 «concessi 3, fatti 4,0», gi118 «concessi 1, fatti 2,4».

## 5. Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno)

Registri in `docs/sviluppo/giro220/controlli/`. Gioco identico byte per byte a `lavoro/196` (`git diff lavoro/196 -- src
CARRIER-MANAGER-AV.html` vuoto): `build-src`/`check-src` non necessari.

| controllo | esito | note |
|---|---|---|
| moves-budget ×5 | ✅ verde 5/5, rosso visto 5/5 | §4 |
| test:logic | ✅ | 3 s |
| save-compat | ✅ 12 pass · 0 fail | 11 s |
| hl-94 | ✅ verde | 71 s |
| diagonali-210 | ✅ verde, rosso bocciato su tutti e tre i difetti | 202 s |
| esiti-96 | ❌ → ✅ | prima corsa interrotta dal mio tetto di 590 s (non vale, rifatta); poi **rosso 2 su 2 su D2** (preesistente, gioco identico alla .195); corretto lo strumento (§6); terza corsa **verde**, rosso cade su tutti i punti (740 s) |
| solo-highlight-166 | ✅ verde, rosso cade su 3, 7 e 8 | 700 s |
| career-critical | ✅ PASS | 804 s |
| highlight-95 | ✅ verde (100 highlight, D4 senza esito 0) e il rosso si vede | 5730 s, in sottofondo con attesa in primo piano |

Non eseguite le catene intere (`completa`/`carriera`/`notte`): solo i controlli della consegna. Nessuna foto tracciata di
altri giri risulta modificata (`git status` pulito fuori da `giro220`).

## 6. Secondo strumento con la stessa gara: `esiti-96` D2

Sulla 7.999.195 `esiti-96` è uscito rosso due volte di fila, sempre «gi31: il titolo dell'esitazione porta un'azione non
scelta («»)», titolo **vuoto**. Misurato con una sonda: gi31 da sola mostra il titolo giusto («Fallito · ⏱ Troppo tardi») per
10 s; una scena forzata subito dopo un'altra rimasta in `hl_result` (gi128 → gi138) riproduce la firma: la sonda legge fase ed
esito **della scena precedente** prima che la forzatura arrivi, aspetta 4,5 s, e trova la scena nuova in `hl_choose`, senza
titolo. In `esiti-96` gi31 è la prima scena di D2, subito dopo le scene di D1 che finiscono in `hl_result`.
Correzione (`tests/visual/esiti-96.mjs`, D2): dopo la forzatura si aspetta che l'esito della scena precedente sia azzerato
(`__CPM_OUTCOME == null`, la forzatura fa `setOutcome(null)`; l'esposizione nel gioco gira a ogni render), tetto 8 s → «non
giudicata» = difetto. Nessuna soglia cambiata; dopo la correzione il verde passa e il braccio rosso cade ancora su D2 (6 difetti).

## Dubbi per il PO

1. **`moves-budget` non è in nessuna catena di `ci-runner.mjs`** (grep vuoto): gira solo quando lo si lancia a mano. Non l'ho
   aggiunto: è una decisione sulle catene. Se va aggiunto, ora dura ~2,5 min.
2. **Il rosso provocato copre le scene con passi concessi, non quelle a zero passi.** Su una scena a 0 passi `__CPM_FILL_MOVES`
   ricarica 0, quindi il rosso non prova direttamente il controllo «la scena non concede nessun passo e l'eroe si è spostato».
   Quel controllo è lo stesso codice di prima (non toccato) e scatta sullo stesso spostamento misurato; non l'ho provato con un
   difetto provocato.
3. **Un fotogramma di moto prima dello stacco.** Al primo fotogramma con la scena nuova la mesh dell'eroe fa un passo
   normale (misurato 0,2 u) verso il punto nuovo e solo al fotogramma dopo scatta lo stacco (l'interruttore dello stacco viene
   armato più in basso nello stesso giro di render). Nel gioco vero è coperto dall'intro e vale al massimo circa 0,46 unità di mondo
   (tetto di velocità 9,2 u/s × passo massimo di 0,05 s): non l'ho considerato un difetto e non l'ho toccato.
4. **Prima scena lenta su pagina appena aperta.** Lo stacco di gi4 arriva 4–5 s dopo la forzatura (nella sonda fitta fino a
   2,5–4 s; letture frequenti di `__CPM_STATE` la rallentano). È il banco headless con disegno in software; sul telefono non
   l'ho misurato. Altre sonde che leggono «a orologio» dopo la prima forzatura di una pagina possono avere la stessa gara.
5. **`esiti-96` era fuori dal perimetro dichiarato** (la consegna chiedeva di sistemare `moves-budget`), ma era nella lista
   dei controlli e il rosso era della stessa famiglia (lettura prima che la scena forzata arrivi). L'ho corretto nello
   strumento, non nel gioco (§6). Se il PO preferiva lasciarlo rosso e aprirne una voce a parte, la modifica è un commit solo.
6. **Roadmap.** Non ho scritto una riga in `docs/governo/ROADMAP.md`: il giro non cambia `GAME_VERSION` né il gioco. Se il
   giro va comunque registrato, va deciso dove.
