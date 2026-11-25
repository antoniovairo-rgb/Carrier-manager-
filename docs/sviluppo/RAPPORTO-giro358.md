# Giro 358 — il treno annullato per tempo da un guardiano solo

Ramo `sviluppo/giro358-treno-tempo`, base `lavoro/201` cfbb7729 (7.999.210 + vagone 355). Giro notturno: niente domande, le scelte e i loro motivi sono scritti qui. GAME_VERSION non toccato, `src/` non toccato.

## 1. Cosa è successo (misurato)

Corsa **45509361966**: treno su `lavoro/201` cfbb7729, trenino da 8 parti. Tempi dall'API dei job:

| parte | inizio job | passo «Guardiani» | fine | esito |
|---|---|---|---|---|
| 02…08 (13-20 guardiani, ~57 min) | 23:23:15 | 43-59 min | 00:07 → 00:23 | success |
| **01 (1 guardiano: `highlight-95`, ~100 min)** | 23:23:15 | **partito alle 23:24:48 e mai finito** | 01:28:15 | **cancelled** |

- La fine del job arriva a 120 min + 5 dal suo inizio, cioè `timeout-minutes: 120` più i 5 minuti di annullo di GitHub.
- Il bilancio della parte (`CPM_TRENO_BILANCIO_S` 6.600 s) contava dall'inizio del passo, quindi scadeva alle 01:14:48. A quel punto il guardiano doveva fermarsi come «tetto». Alle 01:23:15 il passo era ancora vivo, 8 min e 27 s dopo.
- Il Riepilogo ha girato (01:28) e ha dichiarato la parte mancante, quindi `highlight-95` non giudicato. La «Decisione» del rilascio ha concluso «non rilascio». Il treno non ha mentito, ma la 7.999.211 è ferma.
- **Il log del job non c'è più (BlobNotFound). Non posso quindi confermare perché il fermo al bilancio non abbia chiuso il passo.** Sul banco il fermo funziona. Con `CPM_TRENO_BILANCIO_S=90`, `esegui highlight-95` si chiude in 91 s come «tetto». Il guardiano nuovo riproduce **un** meccanismo che basta a spiegarlo: un nipote fuori dal gruppo di processi che tiene aperta l'uscita fa aspettare `close` per sempre. Sulla base, la parte di prova si chiude solo quando muore il nipote: 153 s con un nipote da 150. Che sul runner sia andata così non posso confermarlo.

### Durata di `highlight-95` nelle corse precedenti

La storia viene dai `riepilogo-totale` di 18 corse riuscite fra il 21 e il 24/11, tutte lette. `highlight-95` è verde in tutte:

- **mediana 5.658 s**, minimo 4.470 s, **massimo 6.016 s** (corsa 45010544455);
- dal 22/11 sera sta da solo nella «parte 01» (11 corse): mediana 5.790 s, massimo 5.875 s, job da 74 a 98 min;
- nella 45509361966 ha superato i 6.600 s. È il primo valore oltre il bilancio, ed è dentro la variabilità di un guardiano che gioca 38 partite col tetto di 480 s di parete per partita.

### Banco (questa sessione, 4 cpu, un braccio alla volta)

| commit | braccio | durata | esito |
|---|---|---|---|
| cfbb7729 (punta) | verde | **2.868 s** | ❌ «solo 3 finte giudicate (pavimento 4)», vedi §4 |
| cfbb7729 (punta) | verde, ripetuto da solo | **2.840 s** | ❌ uguale (115 highlight, stessi esiti) |
| cfbb7729 (punta) | rosso | **2.735 s** | ✅ «il rosso si vede» |
| 926d409e (7.999.210) | verde | **2.884 s** | ✅ (4 finte, 112 highlight) |

Sulla punta i due bracci sommano 5.603 s, nell'ordine delle corse sul runner (mediana 5.658). Sul banco il runner non è più lento.

### Il vagone 355 può averlo rallentato?

No, per tre ragioni:

1. Il vagone 355 cambia solo i testi di «La tua storia» (src/18, capitolo del rivale), più `storia-355.mjs` e una riga della MAPPA. `highlight-95` carica tre salvataggi e gioca partite: quei testi non sono sul suo percorso.
2. La partita più lenta, s5/seme 1234, fa la stessa cosa sui due commit, isolata e con un solo braccio: **546 s sulla punta, 555 s sulla 7.999.210**. In entrambi resta in `playing` senza highlight fino al tetto di parete.
3. Il braccio verde dura 2.884 s sulla 7.999.210 e 2.868 / 2.840 s sulla punta: nessun rallentamento.

## 2. Cosa ho scelto e perché

Le tre strade proposte non si escludono. Ho preso la prima come rimedio e la terza come rete.

1. **Spezzare `highlight-95` in pezzi: è il rimedio.** Il guardiano giudica già i due bracci in modo indipendente (`CPM_ARMI=verde` applica le regole del verde, `CPM_ARMI=rosso` pretende D1..D4) e stampa «braccio verde/rosso non eseguito». Il piano (`ci-treno-308.mjs`, `PEZZI_358`) lo mette nella matrice come `highlight-95@verde` e `highlight-95@rosso`, in due parti diverse. `esegui` lancia lo stesso script npm con le variabili del pezzo. `riunisci` ricompone i pezzi (`piega358`) prima di classificare, così rossi dichiarati, scelta del trenino e rilascio vedono il nome vero.
   - È verde solo se tutti e due i pezzi sono verdi.
   - Un pezzo rosso lo fa rosso.
   - Un pezzo mancante, fermato o ignoto lo fa non giudicato.
   - **Nessuna soglia è cambiata.**
   - Sul trenino di cfbb7729 il piano nuovo dà 8 parti da ~63-64 min, contro una parte da ~100 min e sette da ~57.
   - Ho scartato l'alternativa di alzare il tetto di tempo della parte lunga: avrebbe allungato il treno di un'ora e lasciato in piedi la fragilità.
2. **Scadenza del job, la rete.** Il bilancio non contava checkout, npm, Chromium e caricamento. Ora il workflow scrive `CPM_JOB_T0` (passo «Inizio del job», prima del checkout) e `CPM_JOB_TIMEOUT_MIN` (120, uguale a `timeout-minutes`). Il guardiano si ferma alla prima delle due scadenze, sempre con 8 min di margine sul timeout del job.
3. **Arresto robusto.** Al tetto la parte manda TERM, poi KILL dopo 15 s. Dopo altri 30 s chiude comunque il guardiano come «tetto». Su `exit` concede 10 s per svuotare l'uscita e non aspetta più solo `close`.
4. **Riepilogo progressivo.** `riepilogo.json` viene scritto prima di ogni guardiano e poi ogni minuto: il guardiano in corso risulta «tetto», i successivi «non partiti». Il passo dei guardiani ha un suo `timeout-minutes: 113`. Se muore lo stesso, il caricamento (`if: always()`) porta comunque il riepilogo della parte: niente più «parte mancante» muta, il guardiano risulta non giudicato e dichiarato. **Non giudicato resta rosso: il rilascio resta fermo.**
5. **DURATE-GUARDIANI.json.** `highlight-95.s` passa da 6.016 a 6.600 (runner [4940, 6016, 6600]). Ho aggiunto `pezzi` {verde 3.385, rosso 3.228}: è la misura del banco × 1,18, cioè il rapporto 6.600 / 5.603, il caso peggiore misurato. `banco358` registra le misure grezze, `nota358` le fonti.

## 3. Guardiano `npm run treno-tempo-358` (statico, ~3 min, nella riga della MAPPA della macchina del treno)

| controllo | verde | rosso `CPM_NO_G358=1` (piano e workflow di cfbb7729) |
|---|---|---|
| A. highlight-95 in due pezzi, parti diverse, ogni parte ≤ 4.200 s, ogni guardiano lungo di DURATE spezzato | ✅ (3.402 / 3.528 s) | ❌ (6.016 s in una parte) |
| B. nipote che tiene l'uscita: la parte si chiude entro bilancio + 70 s, esito «tetto» | ✅ | ❌ 153 s, finché vive il nipote |
| C. scadenza del job prima del bilancio | ✅ | ❌ non si ferma |
| D. passo ucciso da fuori: il riepilogo esiste già | ✅ | ❌ |
| E. ricomposizione: verdi → verde · mancante → non giudicato · rosso → rosso, nessun «@» nell'esito | ✅ | ❌ |
| F. workflow: timeout del job = CPM_JOB_TIMEOUT_MIN, T0 prima del checkout, timeout del passo ≤ job − 5, caricamento sempre | ✅ | ❌ (3 su 4) |

Verde: uscita 0. Rosso: 13 controlli rossi, uscita 1. Il guardiano finto è lo script npm `finto-358`. Le copie della base vengono cancellate alla fine.

### Guardiani della macchina del treno rigirati sulla punta del ramo

`mappa-unica` ✅ · `via-poc-338` ✅ · `deploy-326` ✅ · `notte-333` ✅ · `trenino-317` ✅ · `rilascio-312` ✅ · `treno-330` ✅ · `treno-tempo-358` ✅ (e rosso col rosso).

`trenino-317` e `rilascio-312` erano usciti rossi al primo giro sia sul ramo sia sulla base, per cause d'ambiente della sessione: `origin/main` assente e clone corto («Could not read 234aa9f…»). Dopo `git fetch` di main e `--unshallow` sono verdi tutti e due. Dettagli dell'ultimo giro al §5.

## 4. Fuori ambito, dichiarato

- **`highlight-95` braccio verde rosso sul banco**: «solo 3 finte giudicate (pavimento 4)». Le due partite s5/seme 1234 (pass e drib) restano in `playing` senza highlight fino al tetto di 480 s. Succede **identico sulla 7.999.210**, quindi esiste già prima del vagone 355. Sul runner il guardiano è verde in 18 corse su 18: oggi è un rosso **del banco**. Non l'ho riparato: chiede di toccare il gioco o il guardiano, cioè `src/` o le soglie, e non era il compito. Da aprire come voce di backlog.
- **ROADMAP**: questo giro non spedisce una versione (GAME_VERSION la fa il rilascio automatico del vagone). Il titolo dell'unione fa da nota. Non ho toccato `docs/governo/ROADMAP.md`, che vive su main.
- La causa esatta del passo rimasto vivo sul runner dopo il bilancio non è confermabile senza log (vedi §1).

## 5. Il verde/rosso di highlight-95 fra punta e 7.999.210 non viene dal vagone 355

Sulle tre corse intere del braccio verde (punta ×2, 210 ×1), **18 partite su 19 sono identiche**: stessi highlight e stesso tabellone. Cambia solo s12 / seme 7 / politica dribbling:

| corsa | s12/7/drib |
|---|---|
| punta, intera (×2) | 7 highlight, 1-1, nessuna finta |
| 210, intera | 4 highlight, 2-0, con una «Finta e cambio di passo» |
| punta, isolata | **4 highlight, 2-0, con la finta** |
| 210, isolata | **7 highlight, 1-1, nessuna finta** |

La partita ha due esiti e li dà **su tutti e due i commit**: dipende da come gira la corsa, non dal codice. Le altre partite portano 3 finte, e il pavimento è 4. Il braccio verde passa sul banco se e solo se quella partita prende l'esito «con la finta». È un guardiano al limite del suo pavimento sul banco, non una regressione del vagone 355, e la soglia non l'ho toccata. Sul runner è verde in 18 corse su 18. Da aprire come voce di backlog insieme al blocco di s5/1234 (§4): «highlight-95 sul banco: s5/1234 senza highlight, s12/7/drib a due esiti; finte a 3+1 contro un pavimento di 4».

## 6. Misure finali

- Guardiani della macchina del treno sulla punta del ramo, dopo l'aggiornamento delle durate: `trenino-317` ✅ · `mappa-unica` ✅ · `rilascio-312` ✅. Più quelli del §3: `via-poc-338`, `deploy-326`, `notte-333`, `treno-330`, `treno-tempo-358` (verde ✅, rosso ❌ come atteso).
- `highlight-95`: il giro non tocca né il gioco né il guardiano, quindi il suo esito è quello del §1 e del §5. Il braccio rosso è verde. Il braccio verde sul banco è al limite: rosso sulla punta, verde sulla 210, per la partita a due esiti.
- Piano del trenino ricalcolato su cfbb7729 col ramo nuovo: 8 parti da ~63-64 min, `highlight-95@verde` nella parte 01 e `highlight-95@rosso` nella 02 (prima: una parte da ~100 min col guardiano intero).
- Atteso alla prossima corsa: nessuna parte oltre i ~64 min stimati. Se un pezzo sfora comunque, la sua parte consegna il riepilogo con il pezzo «tetto», cioè non giudicato, e la corsa non viene annullata.
