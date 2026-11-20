# Rapporto giro 293 — PO-562 «gunther continua a muoversi avanti ed indietro prima della mia scelta»

Ramo `sviluppo/giro293-portatore`, partito da `lavoro/198` (b3b75b9). Versione in lavorazione 7.999.198 normale.
`GAME_VERSION` non toccata. File di gioco toccato: solo `src/12-three-match-view.jsx` (più il file ricomposto).

## In breve

- Il difetto è **vero, misurato e riprodotto nel flusso vero**: partita «Nunez», 44', scena «Cross di COLOMBO: attacca il pallone».
  Il compagno crossatore col pallone fa **62 inversioni in 7 s di scena (8,8 al secondo, 1,4 u, 59 u di strada)** per tutta la lettura.
- È il ritorno di PO-545 per un caso che il giro 286 non copriva: il giro 286 fermava il battitore **dentro** l'attesa di lettura,
  ma quando il motore nomina il crossatore anche «ricevente» del cast, quel corpo **esce** dall'attesa di lettura e ha due scrittori.
- Trovata **una** causa dell'instabilità di `portatore-286` (sul banco il pallone saltava fra due avversari, 17-19 u) e tolta; ne resta
  una seconda (gi54) che **non** ho tolto: `portatore-286` non è ancora stabile.
- Corretto con rosso `window.__CPM_NO_G293`, guardiano nuovo `npm run portatore-293` (verde 0 difetti su 14 scene, rosso 7 su 7).
- Dopo la correzione, **stessa partita e stesso minuto**: 0 inversioni, corpo fermo sul pallone.
- **Non ho completato tutto ciò che era chiesto**: vedi «Cosa non ho fatto» (le cinque corse di `consegna-103` e parte dei controlli in più).
- La foto `docs/collaudo-po/198-portatore-avanti-indietro.png` **non è nel ramo** `lavoro/198`: ho lavorato sulla descrizione.

## Come ho misurato

Sonda nuova `tests/visual/misura-293.mjs` (`npm run misura-293`, sola lettura):

- modelli GLB accesi, stacco di scena attivo (`__CPM_PRESENT=1`), pagina nuova (una ogni 12 scene nella scansione, una per scena nelle misure nominate);
- un campione per **fotogramma** con il **tempo di scena**, posizione di **tutti** i corpi, dell'eroe e del pallone;
- per ogni scena: chi è il portatore (il corpo più spesso più vicino al pallone dopo i primi 0,6 s), di che squadra, le sue inversioni
  avanti/indietro (isteresi 0,12 u per asse) per secondo di scena, le inversioni del pallone, e se il portatore è dentro l'attesa di
  lettura (testimone `__CPM_G286W`) o guidato da altro;
- due modi: scene forzate, e **flusso vero su più highlight per partita** (nessun pilota durante la lettura; il pilota sceglie solo dopo la misura).

Misure fatte:

| Misura | Scene | Esito |
|---|---|---|
| Scansione scene forzate (una su tre, 56 scene giudicate prima del tetto di tempo) | 56 | portatore eroe in 44, avversario in 11, compagno in 1; un solo difetto: **gi129** |
| gi129 su pagina nuova | 3 | difetto 3 volte su 3 (pallone 14-20 inversioni, 17-19 u) |
| Scene di `portatore-286` su pagina nuova (31, 36, 44, 54 due volte; 6, 37, 50) | 11 | **gi44 col difetto 2 volte su 2**; le altre pulite |
| Flusso vero, primo highlight di 6 partite | 6 | sempre l'eroe sul pallone, 0 inversioni |
| Flusso vero, 2 partite, 10 highlight | 10 | **1 col difetto: «Cross di COLOMBO» (il caso della foto)** |

## Cause misurate

| # | Chi | Meccanismo | Numero misurato (prima) |
|---|---|---|---|
| 1 | **Compagno crossatore col pallone** (origine del motore sulla fascia o dalla bandierina: è il caso della foto) | Il motore lo nomina anche «ricevente» del cast. Il punto di ricezione del giro 99 (`_r99`, 12 u davanti all'eroe) lo muove con `animOne` e lo toglie dall'attesa di lettura; appena è oltre 1,5 u dal pallone la colla del battitore (7.405) lo rimette sul pallone. Un fotogramma via, uno indietro. | flusso vero «Nunez» 44': 62 inversioni in 7,05 s (8,8/s), escursione 1,4 u, strada 59 u. Provocato nelle scene forzate: 8,6-9,9/s, 1,35-1,84 u |
| 2 | **Avversario col pallone** nelle scene difensive senza nessun avversario entro 6 u dal pallone logico — **misurato solo sul banco di prova** (vedi «Stabilità») | La regola del 7.999.89 sganciava il portatore a **ogni** fotogramma e riagganciava il più vicino. Con due avversari a distanza simile il più vicino cambia con il «va e vieni» dell'attesa attiva (chi non ha il pallone si muove, chi lo ha sta fermo), e il pallone salta dall'uno all'altro. | gi129: 14-34 inversioni del pallone in 6 s, salti di 17-19 u. gi44: 26 inversioni del pallone, 16,7 u |

La causa 2 è **l'instabilità di `portatore-286`**: gi44 è una delle sue sette scene forzate, e il salto dipende dalle posizioni di
partenza e dalla fase dell'attesa (che usa l'orologio), quindi non esce a ogni corsa.

Ipotesi **verificate e scartate** per il caso della foto: passo del D-pad (la scena misurata è `intro+choose`, nessun passo), tempo di
lettura che riparte (il timer non c'entra: il corpo non è nell'attesa di lettura), pallone che oscilla (0 inversioni del pallone).
L'eroe col pallone non ha il difetto: 0 inversioni in tutte le scene forzate e in tutti gli highlight del flusso vero.

## Correzione (`src/12-three-match-view.jsx`, rosso `window.__CPM_NO_G293`)

1. **Il battitore messo in scena non ha un punto di ricezione** durante la lettura (`_bt293`): se il corpo è il battitore di questa
   scena (`stagedSpot.taker` + `_taker402`) il canale `_r99` non lo prende. Entra così nell'attesa di lettura, dove il giro 286 lo tiene
   fermo sul pallone. Dopo la scelta (esito) nulla cambia.
2. **Il portatore difensivo agganciato resta**: oltre 6 u dal pallone logico si cambia portatore solo se un altro avversario è più
   vicino di almeno 3 u (più dell'escursione dell'attesa attiva, 2 u). Prima si sganciava e riagganciava a ogni fotogramma. Nel primo
   mezzo secondo di scena (l'apertura) il riaggancio resta libero come prima.
3. Testimoni per le sonde nei due bracci (`__CPM_G293W`: conflitto del battitore, portatore lontano) e un varco **solo del banco di
   prova** (`__CPM_RIC293='batt'`, letto solo con `?cpmtest=1`) che dichiara «il ricevente del cast è il battitore»: le scene forzate
   non hanno il cast del motore, quindi il caso della foto va provocato.

`node tools/build-src.mjs` e `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

## Tabella «196 / 198 rapida prima / dopo»

Stesso strumento (`misura-293`), GLB acceso, tempo di scena. «198 rapida prima» = `lavoro/198` (b3b75b9) senza la correzione.

| Caso | 7.999.196 | 198 rapida prima | Dopo (giro 293) |
|---|---|---|---|
| Flusso vero, «Nunez» 44', «Cross di COLOMBO»: compagno crossatore col pallone | **non misurato** (vedi «Cosa non ho fatto») | 62 inversioni in 7,05 s (8,8/s), escursione 1,4 u, strada 59 u, fuori dall'attesa di lettura | **0 inversioni**, escursione 0 u, strada 0 u, dentro l'attesa di lettura (fermo) |
| Scene forzate col battitore nominato ricevente (gi6, gi76, gi77, gi50, gi37), provocate | non misurabile (il varco di prova nasce in questo giro) | 4,8-9,9 inversioni/s, 1,35-1,84 u (braccio rosso, 3 corse) | 0 inversioni, 0 u (braccio verde, 3 corse) |
| gi129, scena difensiva (banco di prova) | non misurato | pallone 14-34 inversioni in 6 s, salti di 17-19 u (4 volte su 4) | 0 cambi di padrone (6 corse) |
| gi44, scena difensiva (banco di prova) | non misurato | pallone 26 inversioni, 16,7 u (2 volte su 2 a 5 s; a 4 s una su due) | 0 cambi di padrone (6 corse) |
| gi54, scena difensiva (banco di prova) | non misurato | un cambio di portatore a scena avviata in una corsa su tre | **resta**: un cambio di portatore in una corsa su quattro (0,67 u) |
| Eroe sul pallone (scene forzate e flusso vero) | 0 inversioni (dal rapporto del giro 286, non rimisurato) | 0 inversioni (44 scene + 15 highlight) | 0 inversioni (5 scene del guardiano + 3 highlight) |

Il rapporto del giro 286 dice che sulla 196 le scene del battitore davano gli stessi numeri della 198: quel dato è suo, io non l'ho rimisurato.

## Guardiano nuovo `npm run portatore-293`

14 scene di famiglie diverse, una pagina nuova per scena, GLB acceso, tempo di scena:
5 «foto» (battitore nominato ricevente: gi6, gi76, gi77 angolo-inserimento; gi50 angolo-cross; gi37 consegna del compagno),
4 difensive (gi129, gi44, gi31 recupero; gi130 intercetto), 5 con l'eroe sul pallone (gi1 tiro, gi18 dribbling, gi16 cross, gi27 uno-due, gi13 punizione).

Giudica: inversioni del portatore oltre 1 al secondo di scena, escursione oltre 0,5 u (le **stesse soglie** di `portatore-286`), e
il pallone che cambia padrone con un salto oltre 3 u. «Non giudicato» = rosso; nei casi «foto» è rosso anche se il portatore non è un
compagno o se il testimone del conflitto è a zero.

| Braccio | Esito misurato |
|---|---|
| Verde | **0 difetti su 14 scene**; inversioni 0, escursione 0 u, cambi di padrone 0 in tutte (3 corse complete del braccio verde, tutte pulite) |
| Rosso `__CPM_NO_G293` | casi «foto» col difetto **5 su 5** (8,7-9,3 inversioni al secondo, 1,38-1,84 u); scene difensive col pallone che cambia padrone **2 su 2** (gi129: 3 cambi; gi44: 11 cambi, alla seconda corsa) |

Ripetizione dichiarata: gi129 e gi44 girano 6,5 s di scena; nel verde 2 corse per scena tutte pulite, nel rosso fino a 3 corse per
scena e ci si ferma alla prima col difetto (il salto non esce a ogni corsa: misurato 7 su 7 in 6 s, 1 su 2 in 4 s).

Il guardiano è nella **prima riga** della mappa di `src/12` in `ci-runner.mjs`. Ci ho messo anche `portatore-286`, che stava solo
nella seconda riga: la mirata legge solo la prima (`MAPPA.find`), quindi non lo eseguiva.

## Stabilità di `portatore-286` e `consegna-103`

**`portatore-286`: non l'ho reso stabile. Una causa tolta, una trovata e non tolta.**

- Corse fatte dopo la prima correzione: **2**. Corsa 1 verde (verde 0 su 9, rosso 7 su 7, 337 s). Corsa 2 **rossa**: nel braccio
  verde gi54 «si sposta (0,99 u fra due inversioni)».
- Causa tolta: gi44 (il pallone che salta fra due avversari). Dopo la correzione gi44 è pulita in 6 corse su 6.
- Causa trovata e **non** tolta: in gi54 il primo aggancio del portatore avviene quando i corpi non hanno ancora preso posto, e a
  circa 2 s di scena il pallone passa al portatore giusto, che scatta di 0,7-1 u sulla sua base. Capita una corsa su tre o quattro
  (dipende dalle posizioni di partenza, non seminate). Ho provato a lasciare libero il riaggancio nel primo mezzo secondo di scena:
  **non basta** (1 difetto in 4 corse di gi54 dopo la modifica). Dopo quest'ultima modifica `portatore-286` intero **non è stato rieseguito**.
- Soglie di `portatore-286` non toccate.

⚠️ Sul banco di prova (`?cpmtest=1`) il portatore difensivo **non** è quello fissato dal cast del motore (`_c31` è spento col banco):
il salto fra avversari e il cambio di gi54 passano dal ramo di riserva. Nel gioco vero, nelle scene difensive il portatore è fissato
una volta per scena. Quindi la causa 2 spiega l'instabilità del guardiano; **non ho una misura che la mostri nel flusso vero**.

**`consegna-103`: una corsa sola, interrotta; nessuna delle cinque corse richieste.**

- Braccio verde: pulito (16 scene, 3 ingressi nella consegna, scalino massimo 2,02 u, 0 salti). Braccio rosso: 1 blocco (8 scene,
  0 ingressi, 1 salto D11), poi l'ho fermata io: ogni blocco di 8 scene dura circa 9 minuti.
- Il mio codice non tocca il suo percorso (cambia solo le fasi prima della scelta; `consegna-103` giudica l'esito).
- Misura utile: il percorso esce in **3 scene su 24**, non «una su tre» come scritto nel guardiano. Con 4 blocchi il verde resta
  sotto il pavimento di 2 ingressi circa una corsa su tredici (conto mio sulla frequenza misurata, campione piccolo), e il rosso si
  fermava a 2 ingressi anche senza aver visto lo scalino. **Ipotesi, non provata**: l'instabilità vista nella verifica (1 rosso su 3)
  è di questo tipo. Non avevo il registro della corsa rossa.
- Modifica fatta, soglie invariate: fino a 8 blocchi invece di 4; il rosso continua finché il difetto si vede. **Non verificata**
  con una corsa completa.

## Controlli eseguiti

Uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `CPM_CI_PAR=0`.

| Controllo | Esito | Su quale codice |
|---|---|---|
| `portatore-293` (nuovo) | **verde**: verde 0 su 14, rosso 5 su 5 «foto» + 2 su 2 difensive | codice finale |
| `portatore-293`, due corse precedenti | corsa 1 rossa per il **mio** criterio del braccio rosso (le difensive non uscivano in 4 s: ho dichiarato la ripetizione); corsa 2 verde | prima dell'ultima modifica |
| `test:logic` | verde, 51 pass, 0 fail | codice finale |
| `save-compat` | verde, 12 pass, 0 fail | codice finale |
| `tools/check-src.mjs` | IDENTICO BYTE PER BYTE | codice finale |
| `portatore-286` | 1 verde, 1 rossa (gi54) | prima dell'ultima modifica |
| `consegna-103` | interrotta (verde pulito, rosso non concluso) | prima dell'ultima modifica |
| Flusso vero «Nunez», 4 highlight | caso della foto: 62 → 0 inversioni | prima dell'ultima modifica (che tocca solo le scene difensive) |

## Cosa non ho fatto

Il tetto di circa 3 ore è stato superato di poco; questo è rimasto fuori.

- **Cinque corse verdi di fila di `portatore-286`**: fatte 2, una rossa. Non stabile (sopra).
- **Cinque corse verdi di fila di `consegna-103`**: nessuna completa.
- **Controlli in più richiesti, nessuno eseguito**: `frozen-mate`, `aim-latch`, `ball-attended`, `gesture-window`, `salti-274`,
  `intercetto-291`, `contatto-103`.
- **Guardiani della mappa di `src/12`**: la prima riga ne elenca 78; ho eseguito solo `portatore-293` e `portatore-286`. Non eseguiti,
  fra gli altri: `colla-103`, `corpi-073`, `spot-266`, `difesa-220-scena`, `difesa-220-giro31`, `apertura-261`, `avvicinamento-61`,
  `validate-situations`, `partita-vera`. I più vicini al codice toccato sono `difesa-220-*` (portatore difensivo), `spot-266` e
  `corpi-073` (battitore), `assist-nome-98`/`assist-298` (ricevente nominato): **vanno eseguiti prima di unire il ramo**.
- **Confronto sulla 7.999.196**: non misurato.
- **«12 scene incluse quelle del flusso vero» nel guardiano**: il guardiano usa 14 scene forzate; il caso della foto è provocato col
  varco di prova. Il flusso vero l'ho misurato a mano con `misura-293` (una partita prima, la stessa dopo), non sta nel guardiano
  perché costa 5 minuti a partita e il caso esce in un highlight su dieci.
- `GAME_VERSION`, roadmap, promozione su `main`: non toccati (non richiesti in questo giro).

## Dubbi per il PO

1. **La foto non è nel ramo.** `docs/collaudo-po/198-portatore-avanti-indietro.png` non esiste in `lavoro/198`. Il caso che ho
   riprodotto corrisponde alla descrizione (compagno col pallone fuori area, eroe e un avversario davanti), ma non ho potuto
   confrontarlo con l'immagine. Se la scena della foto non era un cross dalla fascia, il difetto potrebbe avere un'altra strada ancora.
2. **Il crossatore è nominato «ricevente» dal motore.** La correzione ferma il corpo, ma il cast resta così: nella scena «Cross di
   COLOMBO» il compagno che il motore indica come ricevente è lo stesso che crossa. Non ho toccato il motore (`src/15`): è una scelta
   di contenuto, non di movimento.
3. **Chi sta vicino al pallone ma non lo ha continua a muoversi.** È la decisione del 06/10 («al massimo il 30% fermi prima
   dell'azione»): compagni e avversari entro 6 u dal pallone fanno 1,1-1,6 inversioni al secondo con 0,15-0,22 u di escursione. Non
   l'ho toccato. Se «avanti e indietro» nella nota riguardava anche loro, serve una decisione.
4. **Pallone che oscilla ai piedi dell'eroe fermo** in alcune scene di dribbling (gi96, gi102, gi150: 7-9 inversioni del pallone,
   circa 1,2 u, corpo fermo). Fuori dall'ambito del giro, non indagato.
5. **`consegna-103` costa 30-40 minuti a corsa** (9 minuti per blocco di 8 scene). Cinque corse di fila sono 3 ore circa: come
   controllo di stabilità ripetuto non sta in un giro da 3 ore.
