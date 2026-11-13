# RAPPORTO — giro 185 · PO-384 «Vai al prossimo momento si blocca nella corsa al titolo»

Ramo `sviluppo/giro185-corsa-titolo`, partito da `lavoro/192` (cfd047a, GAME_VERSION 7.999.192, **non toccata**).

## 1. Cosa succedeva (causa misurata)

Nella regola `posta165` (src/08) il ramo «corsa al titolo» (da W28, fra le prime 4, a ≤ 9 punti dalla vetta) e il ramo «lotta
salvezza» (da W25, fra le ultime 3) davano posta a **ogni** partita del periodo. Il tasto si fermava a ogni settimana con il
riquadro della partita aperto; finché quel riquadro resta aperto il tasto è spento con «chiudi prima la finestra aperta», e il
riepilogo diceva «0 settimane · 0 partite» perché la corsa si era fermata subito. È la foto del PO.

Misura col braccio rosso `__CPM_NO_G185` (= regola del giro 165), classifica ferma sul calendario vero: **9 partite di lega su 9**
fra W28 e W38 con posta, in tutti e tre i casi (3° posto, capolista, penultimo). La causa ipotizzata è confermata.

⚠️ Dichiaro l'ordine: ho scritto la correzione prima della misura; il «prima» è misurato sul braccio rosso, che ripristina il
comportamento del giro 165 nello stesso codice.

## 2. La correzione (src/08, `decisiva185` + `_g185`)

Durante la corsa al titolo e la lotta salvezza ha posta solo:

| | Corsa al titolo | Lotta salvezza |
|---|---|---|
| (a) scontro diretto | avversario fra le prime 4 | avversario fra le ultime 4 |
| (b) ultime giornate | ≤ 3 gare di lega da giocare (contate sul calendario, questa compresa) | idem |
| (c) verdetto possibile | primo con L punti sul secondo e L+3 > 3(R−1): **«Il titolo si può vincere»**; a G punti dalla vetta e G+3 > 3(R−1): **«Il titolo si può perdere»** | a G punti dalla quartultima (prima salva) e G+3 > 3(R−1): **«Si può retrocedere»** |

R = gare di lega rimaste, questa compresa. **«O quasi»**: basta lo scenario migliore per il verdetto (vinci tu e l'altra perde, o
viceversa), senza pretendere anche i risultati delle altre partite. Motivo: con la regola esatta il tasto potrebbe saltare proprio
la partita in cui il verdetto arriva; con questa ci si ferma al più una giornata prima.

Le altre partite di quei periodi **non si fermano più per «corsa al titolo»/«lotta salvezza»** ma passano per le regole
successive, invariate: finale di stagione (W37+), sfida alle prime tre, rivale, scontro diretto in classifica. Le fermate che
vengono prima (coppe, Nazionale, derby, ex club, rientro da infortunio, traguardi, contratto in bilico, rinnovo, scelte di storia,
offerte) sono invariate. **La lotta salvezza aveva lo stesso difetto (9/9) e ha la stessa logica.**

Rosso: `window.__CPM_NO_G185` = regola del giro 165.

## 3. Prima / dopo (FC Merseyside, Premier Division, 18 squadre, W28→fine stagione)

Il calendario ha 9 gare di lega fra W28 e W38 (W28 e W35 senza campionato; a W35 c'è la Nazionale).

**Regola sul calendario, classifica tenuta ferma** (`momento-185` sezione 1):

| Classifica | Prima (rosso) | Dopo (verde) | Fermate dopo |
|---|---|---|---|
| Foto: 3°, −6 dalla vetta | 9 su 9 | **4 su 9** | W34 rivale · W36, W37, W38 ultime giornate |
| Capolista, +4 sul secondo | 9 su 9 | **4 su 9** | W34 rivale · W36, W37, W38 ultime giornate |
| Salvezza: penultimo | 9 su 9 | **5 su 9** | W33 scontro diretto · W34 rivale · W36 ultime giornate · W37 scontro diretto · W38 ultime giornate |

**Corsa vera del tasto** (sezione 2, la classifica cambia con i risultati simulati):

| Classifica | | Corse del tasto | Tocchi | Fermate «partita chiave» | Partite fatte dal tasto |
|---|---|---|---|---|---|
| Foto (3°) | prima | 13 | 39 | 7 | 3 |
| | dopo | **9** | **28** | **4** | **6** |
| Capolista | prima | 14 | 43 | 10 | 0 |
| | dopo | **9** | **28** | **5** | **5** |
| Salvezza | prima | 14 | 43 | 10 | 0 |
| | dopo | **12** | **37** | **7** | **3** |

Le fermate «partita chiave» rimaste dopo (perché):
- Foto: W34 Sfida alla capolista · W35 Nazionale · W37, W38 ultime giornate.
- Capolista: W34 rivale · W35 Nazionale · W36, W37, W38 ultime giornate.
- Salvezza: W32, W33 scontro diretto · W34 rivale · W35 Nazionale · W36 ultime giornate · W37, W38 Finale di stagione (la squadra
  era uscita dalle ultime 3 a forza di risultati: è finita 14ª).

Le altre fermate (scelte di storia, momenti importanti, mercato, interviste) variano da un giro all'altro: dipendono dagli eventi
della settimana e non dalla regola. Le corse totali vanno lette con questo margine.

## 4. Controlli (uno alla volta, CPM_CI_PAR=0)

| Controllo | Esito |
|---|---|
| `momento-185` (nuovo) verde | **25 ok, 0 ko** |
| `momento-185` rosso (`CPM_ROSSO185=1`) | **esce 1** (8 ok, 17 ko) |
| `momento-165` | verde 33/33 |
| `momento-165b` | verde 22/22 |
| `momento-173` | verde 20/20 |
| `solo-highlight-166` | **ROSSO** (4: casi 12, 3, 7, 8) — **identico sul commit di partenza cfd047a** (rilanciato là: stesse 4 bocciature, stessi testi). Non viene da questo giro; non l'ho toccato. |
| `career-critical` | PASS |
| `test:logic` | 51 pass, 0 fail |
| `save-compat` | 12 pass, 0 fail |
| `tripath-chokepoint` | PASS |
| `build-src` + `check-src` | IDENTICO BYTE PER BYTE |

`momento-185` è in `package.json` e in `ci-runner.mjs` (catena `carriera`, mappe `src/18|16|10` e `src/0[0-8]`, passi lenti),
una volta per catena; `node --check` verde.

## 5. Dubbi e cose da sapere (non decise)

1. **`posta165` non serve solo al tasto.** Le stesse partite che ora sono «senza posta» cambiano anche: l'intervista dopo la
   partita (giro 183, esce solo dopo una partita con posta), il bottone «soli highlight» (giri 166/173, c'è solo senza posta) e
   l'etichetta della partita in home. Ho cambiato la regola una volta sola perché tasto, bottone e home dicano la stessa cosa; se
   il PO vuole la regola nuova solo per il tasto, si sposta in `_chiave165` (src/18). `interviste-183` **non** l'ho girato (fuori
   dalla lista).
2. **Scontro diretto in classifica.** Nel periodo vale ancora la regola generale «posizioni vicine (≤ 2), ≤ 3 punti, da W8»: una
   partita del 3° contro il 5° a pari punti si ferma ancora, anche se il 5° non è fra le prime 4. Non l'ho ristretta (è una delle
   «altre fermate»).
3. **Quante retrocedono.** La regola vecchia considera la salvezza sulle ultime 3; la nuova prende come «prima salva» la
   quartultima. Non ho verificato quante squadre retrocedano davvero in ogni lega.
4. **W36 della foto nella corsa vera.** Sulla classifica ferma W36 è «ultime giornate»; nella corsa vera la fermata a W36 non
   compare in nessuno dei due bracci (nemmeno nel rosso, che si fermerebbe a ogni partita): o la squadra era uscita per un
   momento dalla corsa (> 9 punti o fuori dalle prime 4), o la partita è passata da un altro percorso del banco. Non posso
   confermarlo senza un'altra misura.
5. **Il rivale** compare a W34 anche se il salvataggio di prova parte con `rival: null`: lo assegna il gioco.
6. **ci-runner.mjs** ha due voci della MAPPA doppie (`src/18|16|10` righe 31 e 33, `src/0[0-8]` righe 43 e 44); `MAPPA.find`
   prende solo la prima, quindi le seconde non servono. Preesistente: segnalo, non tocco.
7. **Roadmap**: nessuna versione spedita (GAME_VERSION non toccata), quindi nessuna riga di registro.
