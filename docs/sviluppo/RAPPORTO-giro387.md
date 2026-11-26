# Rapporto giro 387 — riparazione di `consegna-103` e `testa-342` (rossi nuovi del treno grande del 26/11)

Base: `lavoro/201` (punta 29d758c8). Ramo: `sviluppo/giro387-riparazione`. Nessun file di gioco toccato, nessuna soglia cambiata,
`GAME_VERSION` e `docs/governo` intatti.

## 1. Il fatto che decide: stesso commit, verde e poi rosso

Il treno grande (corsa 45735203524) ha giudicato il commit 8543a9cc. **Lo stesso commit** era stato giudicato dal trenino del push
(corsa 45728929446, 26/11 00:28) con entrambi i guardiani **verdi**:

| guardiano | trenino del push (8543a9cc) | treno grande (8543a9cc) |
|---|---|---|
| consegna-103 | verde: 2 ingressi, scalino max 2,41 u · rosso: 2 ingressi, 3,79 u, oltre 3u 2 → «il rosso si vede» | rosso blocco 1: **0 ingressi**, salti D11 4 → «rosso non giudicabile» |
| testa-342 | gi6 scatto **9,9** u/s → 11/11 PASS | gi6 scatto **14,55** u/s a −0,58 s → 10/11 FALLITO |

Stessa versione del browser in tutte le corse (Chrome for Testing 159.0.8154.6, chromium v1255). Quindi **non li ha causati il giro 364**:
sono due instabilità. Storico CI (riepiloghi): consegna-103 verde in 9 corse precedenti, testa-342 verde in 7; gi6 nelle corse verdi 9,72-9,9.

## 2. consegna-103 — guardiano con una regola d'arresto incoerente col suo giudizio

**Causa (misurata nel codice del guardiano).** Il braccio rosso si fermava al primo blocco che mostrava un difetto qualsiasi
(`oltre || soOltre || salti`), ma il giudizio pretende almeno un ingresso nella consegna (`R.cg < 1` → «non giudicabile»). Il rosso
`__CPM_NO_G103B` spegne tre protezioni (consegna, sospensione, tiro del compagno): i salti D11 possono uscire dal percorso
`esito:assist_shot` senza che il percorso `ricevente-pass → esito:cross_goal` sia mai uscito. Il percorso non e' seminato (giro 293):
blocco di 8 scene senza ingressi e con salti = arresto + rosso, a caso.

**Banco (prima della riparazione, braccio rosso, 8 scene):** punta 3 ingressi (3,37 · 3,59 · 3,64 u) + 1 salto `esito:assist_shot`;
base prima del 364 (ca852f3) 2 ingressi (3,34 · 3,9 u). Il percorso esiste prima e dopo il 364 con la stessa frequenza.

**Riparazione.** `fermaBlocchi()`: il rosso si ferma solo quando il giudizio lo puo' giudicare (percorso visto **e** difetto visto),
altrimenti gioca un altro blocco (tetto `CPM_GIRI` invariato). Il verde e' invariato. Il guardiano stampa ora lo scrittore di ogni salto
D11 del rosso. `CPM_NO_G387=1` = regola di prima. `node consegna-103.mjs --autoprova` prova la regola sui numeri veri del treno
(notte: regola di prima si ferma, nuova continua; push: nuova si ferma).

**Dopo:** verde 2 blocchi, 5 ingressi, scalino max 2,39 u, 0 salti; rosso 2 ingressi a 4,7 e 3,6 u, 3 salti `esito:cross_goal` →
`✓ consegna-103 VERDE (e il rosso si vede)`.

## 3. testa-342 — un fotogramma della testa sopra soglia, solo in CI e una volta

**Banco:** gi6 da' **10,97 u/s** (a +0,24 s) in 10 corse su 10: punta 29d758c8, base prima del 364 (ca852f3), base prima del 366
(962d13bf^), quattro corse in parallelo, guardiano intero. Il valore e' identico sulle tre basi: il banco non vede nessun effetto
del 364 ne' del 366. Non posso riprodurre il 14,55 della CI (il banco usa un altro Chromium, 1243, e `npx playwright install` qui e' vietato).

**Che cosa e' (dichiarato, non confermato):** il picco della notte cade a −0,58 s, sullo stacco del piede sinistro (−0,56 s), cioe'
probabilmente l'innesto del gesto di testa sulla corsa; 14,55 contro la soglia 14 (+4%). E' il dominio del giro 380 (colpi di testa in
src/12): **non ho toccato il gioco**. La CI non salvava i fotogrammi (`CPM_DUMP` spento), quindi della corsa rossa resta solo il riepilogo.

**Riparazione del guardiano (soglie invariate):**
- in guardiano ogni scena bocciata scrive i suoi fotogrammi in `out/giro342/dump-*.json` (finiscono nell'artifact della parte);
- **riprova dichiarata**: nel braccio verde una scena bocciata su misura si rigioca una volta su pagina nuova; resta bocciata se la
  riprova boccia ancora; se passa e' «INSTABILE» e l'ultima riga lo dice con la misura della prima prova. Il rosso non si riprova.
  `CPM_NO_G387=1` = nessuna riprova.

**Prove:** verde 11/11 PASS · rosso `__CPM_NO_G342` 11 bocciate «rosso col rosso» · pagine rosse giudicate come il verde
(`CPM_ROSSO=__CPM_NO_G342 CPM_GIUDICA_VERDE=1`, gi6/gi108/gi171): la riprova boccia di nuovo tutte e tre → FALLITO, uscita 1
(la riprova non salva un difetto che si ripete).

## 4. File toccati
- `tests/visual/consegna-103.mjs` — regola d'arresto `fermaBlocchi`, `--autoprova`, stampa degli scrittori D11 del rosso.
- `tests/visual/testa-342.mjs` — fotogrammi delle bocciate, riprova dichiarata, `CPM_GIUDICA_VERDE`, riga finale con le instabili.
- `docs/sviluppo/RAPPORTO-giro387.md` — questo rapporto.

## 5. Dubbi per il PO
1. **(consigliata, applicata)** Riprova dichiarata per testa-342 + fotogrammi nell'artifact: se il picco torna, il giro 380 ha i dati per
   capire se e' l'innesto del gesto. Una scena instabile due volte si ripara nel gioco (regola PO 13/10).
2. Nessuna riprova: testa-342 resta com'era e il prossimo picco ferma di nuovo i rilasci; si aspetta che il giro 380 misuri lo stacco.
3. Seminare la scena (passo fisso anche per cio' che oggi va a orologio di parete, una pagina per volta `CPM_PAR=1`): toglierebbe
   l'instabilita' alla radice ma allunga il guardiano (~3×) e non e' provato che la causa sia li'.

Per il blocco dei rilasci: i due rossi non sono difetti nuovi del gioco; la sessione madre decide se metterli in `ROSSI-DICHIARATI`
o aspettare il treno grande successivo con questi guardiani riparati.

## 6. Catena del giro
`node ci-runner.mjs giro consegna-103 testa-342` sul ramo (7.999.215): **19/19 verdi** — consegna-103 926 s, testa-342 478 s, piu' le
17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023,
tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97). Nessun passo instabile.
