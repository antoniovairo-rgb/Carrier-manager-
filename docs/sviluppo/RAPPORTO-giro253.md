# Rapporto giro 253 — seguito PO-508: momenti salienti anche dalla panchina, `salienti-229` stabile, impaginazione del provino

Versione di riferimento 7.999.197 (GAME_VERSION non toccata, come da regole). Ramo `sviluppo/giro253-salienti-panchina`, partito da
`lavoro/197` (commit `b00f40b`, che contiene il giro 246).

## A. «Sì, anche dalla panchina» (decisione PO 17/11)

### Misura prima (codice di `b00f40b`)

- Il tasto della pre-partita (`MatchdayCard`, `onSolo243`, `src/15`) era escluso con `!benchStart`.
- In panchina gli highlight non si giocano: lo slot di una scena che cade mentre il giocatore è in panchina viene «bruciato»
  (`src/15`, `onBenchRef.current` → `setHlIdx(hi=>hi+1)`), quindi la partita a soli salienti scorre da sola in cronaca veloce fino
  all'ingresso senza bisogno di altro.
- **Il difetto da evitare**: l'ingresso è una sequenza di 4,6 s reali (`benchPhase` «entering» → timer → `setOnBench(false)`), mentre la
  cronaca veloce (`_lotto166`) avanza fino a ~66 battiti ogni 16 ms. Senza un fermo, durante la sostituzione il cronometro corre via:
  misurato col rosso, il minuto letto mentre il giocatore è ancora in panchina arriva **oltre il 35'** previsto (vedi il percorso A' del
  guardiano).
- Il minuto d'ingresso nel gioco vero è sempre fra il 46' e l'82' (`src/08`, `coachDecision`), e le scelte della panchina (INT226
  «chiedo di entrare», INT259) lo **anticipano** soltanto: «non entra mai» non è raggiungibile da un giocatore oggi. L'ho comunque
  coperto, come chiesto, e lo provoco dalla sonda.

### Correzione (`src/15-live-match.jsx`, rosso `window.__CPM_NO_G253`)

- Il tasto «Gioca solo i momenti salienti» c'è anche partendo dalla panchina: stessa etichetta, stessa nota, stessa fila di tasti
  (misurato: identica a quella di una gara da titolare).
- La cronaca veloce **si ferma al minuto d'ingresso** finché il giocatore non è entrato (controllo prima di ogni battito del lotto, sullo
  stesso `clockRef` e sullo stesso minuto che usa la panchina, compreso il gancio di collaudo `__CPM_BENCH_MIN`).
- Durante la sostituzione il velo dei salienti si toglie: si vede l'ingresso in campo; poi tornano velo e soli highlight.
- In panchina il velo dice «Sei in panchina: la partita scorre veloce fino al tuo ingresso».
- Se la partita finisce senza ingresso: riquadro in testa alla schermata finale (`data-cpm="salienti-253-mai"`) «**Non sei entrato in
  campo.** Il mister non ti ha fatto entrare: la partita è scorsa tutta in cronaca veloce, senza momenti salienti da giocare.», e la riga
  dei minuti dice «Non entrato · 0' giocati» (prima della correzione, sulla stessa schermata, diceva «Entrato al 60' · 30' giocati»:
  trovato con la prova fotografica).

## D. Impaginazione del provino (dubbio 2 del 246)

Misura prima, con foto a 412×915: nota e tasto «Gioca solo i momenti salienti» a **0 px** dai bordi (a 360 e 375: 6 px); nelle formazioni
«Ingresso in campo» e «Salta l'ingresso» a 0 px e **tagliati in basso** da un contenitore. Causa: il contenitore del provino (`src/17`)
toglieva sempre padding e scorrimento a `.cpm-scroll` e non aveva la classe `cpm-match-wrap` che LiveMatch apre nelle fasi DOM (lo
stesso meccanismo che la carriera usa dal 7.184.3).

Correzione (rosso `__CPM_NO_G253`): `src/17` mette `cpm-match-wrap` sul contenitore e lascia a LiveMatch scorrimento e fondo (azzera solo
i lati e l'alto, come la carriera); `src/15` dà al provino 16 px di margine laterale nella pre-partita e nelle formazioni. Misurato dopo:
16 px a 412, 22 px a 360 e 375 (6 px vengono da un contenitore esterno), tasti interi.

## B. `salienti-229` instabile — due cause, entrambe nello strumento

Censimento: 2 cicli di corse ripetute col dump (`CPM_G229_DUMP`) e la sonda nuova `misura-253b` (rifà l'ottavo europeo del 229 con una
spia dentro la pagina).

1. **Il carattere diverso, catturato** (corsa 2 del primo ciclo e corsa 3 del secondo): non è nella partita. È la riga degli obiettivi di
   stagione della schermata finale: «✅ Finisci nei primi 6 · **6° ora**» contro «🎯 … · **7° ora**». Con la classifica in memoria
   aggiunta alla cattura: nelle corse rosse uno dei due bracci aveva **due giornate di lega giocate** (noi a 6 punti, +2 = due vittorie
   1-0, somma dei punti 54) contro una (3 punti, somma 27). Un ottavo europeo non tocca la lega: la giornata in più viene dal salvataggio
   sintetico preparato dalla sonda prima della partita. La passeggiata di `apriCarriera166` (cerca la settimana con una gara di lega)
   leggeva la gara **220 ms dopo** aver cambiato settimana — un'attesa a tempo fisso (regola 4 di PROCESSO.md). Riparazione: attende che
   lo stato dica davvero «settimana w» (condizione, tetto 4 s) e registra la passeggiata; `salienti-229` ora porta la settimana dei due
   bracci nel giudizio (diverse = non giudicato). **Il meccanismo esatto per cui la vecchia passeggiata finiva su una giornata in più non
   l'ho dimostrato**: dopo la riparazione la giornata in più non è più ricomparsa (10 corse del 229 = 20 pagine con la classifica registrata:
   somma dei punti sempre 27, cioè una giornata, settimana 2 in entrambi i bracci). Ma **anche prima** della riparazione la sonda
   `misura-253b` non l'aveva riprodotta in 16 corse giudicate: quindi la riparazione è coerente con la causa, non la dimostra. Vedi
   dubbio 3.
2. **La partita «non arrivata al fischio» (non giudicata)**, catturata con la spia in 3 corse su 13: il gancio dei rigori
   (`__CPM_SO_FORCE`, chiude 1-1 alla prima scena) veniva chiamato da Node dopo aver letto `hl_intro`. Quando la pagina era occupata
   (montaggio della scena) il fischio forzato e il timer di 2,5 s dell'introduzione scadevano insieme: il fischio metteva `shootout` in
   coda, il timer scriveva `hl_move` dopo e vinceva; la scena proseguiva fino a `playing` e la guardia di unicità della fine (`fine977`)
   impediva il fischio dei 90' → partita appesa 400 s. È un effetto del gancio (un giocatore non può fischiare la fine durante
   l'introduzione di una scena), quindi riparato nello strumento (regola 7: mai un ramo speciale nel gioco): `gioca166` installa nella
   pagina un osservatore che conta le scene e chiama il gancio **nello stesso istante** in cui legge `hl_intro`, dentro
   `ReactDOM.flushSync` (il fischio si applica subito e la pulizia dell'effetto dell'intro annulla il suo timer); registra anche la fase
   subito dopo. Misurato dopo: 8 corse su 8 con `dopo: "shootout"`, comprese due con introduzione lunga (2,2 e 2,8 s) che prima si
   appendevano.

Nessuna soglia toccata. Esito: **10 corse verdi consecutive** (5 sul build precedente + 5 sul build finale), rosso `__CPM_NO_G229` cade.

## C. «Gara della settimana già giocata» (dubbio 6 del 246)

Sonda `misura-253c` (apre il salvataggio sintetico e guarda la gara della settimana trovata a 0, 1 e 4 s, con i segni lasciati da chi
l'ha marcata: `simulated`, `recupero103`, `healed418`): **0 casi su 10 aperture** (sempre settimana 2, gara da giocare, classifica
identica). Nel gioco le due reti che segnano «giocata» una gara rimasta indietro sono il recupero delle giornate mancate (7.999.103, solo
settimane già passate) e la bonifica delle voci stantie (7.418.0, voci già registrate come giocate): un giocatore vero ci arriva solo
saltando davvero una settimana, ed è il comportamento voluto. Non ho trovato una strada del gioco che marchi giocata la gara della
settimana corrente subito dopo l'apertura. Conclusione: lo attribuisco alla sonda (stessa passeggiata a 220 ms fissi del punto B.1), ora
riparata; **non posso confermarlo** con una riproduzione. `salienti-246` continua a usare la gara nuova (matchday 996) come prima.

## Guardiano `salienti-253` (nuovo)

`tests/visual/salienti-253.mjs`, `npm run salienti-253`; in `ci-runner.mjs` una volta nelle catene `completa` e `carriera`, fra i lenti,
nella mappa di `src/15` e di `src/1[17]` (`node --check` verde). Gioca, non legge il sorgente.

| Parte | Verde | Rosso `__CPM_NO_G253` |
|---|---|---|
| A panchina, ingresso al 35' (`__CPM_CD229`, `__CPM_BENCH_MIN=35`): T tasto/nota/stessa fila · I formazioni e ingresso · P in panchina velo, 0 scene, ≤ 400 ms reali per minuto · E in panchina il minuto non supera mai il 35' (misurato dentro la pagina) e poi entra · H dopo l'ingresso ≥ 1 scena, ≤ 400 ms/minuto, fischio, gara registrata | ✓ tutte (174 ms/minuto in panchina, 0 scene, minuto massimo in panchina 35', poi 7 scene, 157 ms/minuto, fischio al 93', registrata) | cade su T (pre-partita raggiunta: giudicato) |
| A' (solo rosso) stessa partita a soli salienti accesa dal gancio `__CPM_SOLO166`, senza il fermo | — | il minuto in panchina arriva a **91'**: senza il fermo il giocatore non entra prima del fischio → cade su E |
| B panchina senza ingresso (`__CPM_BENCH_MIN=95`, schede INT226/INT259 spente: il «mai» lo provoca la sonda) | ✓ (fischio al 92', nessun ingresso, 0 scene, 99 ms/minuto, messaggio e «Non entrato», registrata) | cade su T |
| D provino a 360/375/412: margini ≥ 16 px, «Ingresso in campo» e «Salta l'ingresso» interi (rettangolo non tagliato da nessun contenitore) | ✓ a 360/375/412 (16 px a 412, 22 px a 360 e 375, tasti interi) | cade a tutte e tre le larghezze (0 o 6 px) |

Prima stesura, due difetti dello **strumento** trovati e riparati (nessuna soglia toccata): (1) B entrava al 72' perché una scelta della
panchina riscriveva il minuto di collaudo → schede spente in B; (2) E leggeva il minuto da Node 120 ms dopo l'ingresso, quando la cronaca
veloce era già ripartita (35' o 37' a seconda del caso: velocità × intervallo) → E si giudica dentro la pagina sulla proprietà vera
(«in panchina il minuto non supera l'ingresso»), con la prova del rosso A'.

Prova fotografica (telefono 412×915, non nel repository): schermata finale «Non sei entrato in campo» e velo in panchina in
`/tmp/claude-0/-home-user-Carrier-manager-/b833094e-094e-5dd0-8a5d-230a5d345ec7/scratchpad/foto253/`; pre-partita e formazioni del
provino prima/dopo a 360/375/412 nella stessa cartella del giro (`pre-*.png`, `form-*.png`, `r/`).

## Controlli aggiornati (giudicavano la regola di prima)

- `salienti-246`: «dalla panchina il tasto non c'è» → «c'è nella pre-partita e solo lì» (decisione 17/11).
- `salienti-243`: idem nel verde; nel rosso `__CPM_NO_G243` il tasto non esiste e quindi non c'è nemmeno dalla panchina.
- `lib/partita-166.mjs`: passeggiata su condizione e registrata (`passi`), rigori forzati dentro la pagina, classifica in memoria
  nell'esito di `gioca166`. `salienti-229`: settimana dei due bracci nel giudizio C.

## Controlli (build finale)

| Controllo | Esito |
|---|---|
| salienti-253 (verde + rosso) | VERDE PASSA · ROSSO CADE su ogni parte (A, A', B, D a tre larghezze) |
| salienti-246 (verde + rosso) | VERDE PASSA (13/13 percorsi + panchina col tasto) · ROSSO CADE su ogni percorso (17 min) |
| salienti-243 (verde + rosso) | VERDE PASSA · ROSSO CADE (i ✗ stampati sono del rosso) |
| salienti-229 | **5 verdi consecutive sul build finale** (~200 s l'una, voci 45/45, finale 1880/1880 car., settimana 2/2) + 5 verdi consecutive sul build precedente; rosso `__CPM_NO_G229` CADE |
| solo-highlight-166 | ROSSO `__CPM_NO_G166` CADE su 3, 7, 8 come deve · **VERDE NON PASSA sul solo 12b** («intervista a sorpresa chiesta in entrambe»: decisione «nessuna posta», 0 interviste nei due modi). **Preesistente**: identico sul file di gioco di `lavoro/197` (`b00f40b`). Vedi dubbio 8 |
| barra-221 | VERDE (difetti 0, non giudicati 0) · rossi `__CPM_NO_G221` e `__CPM_NO_G229` bocciati come devono |
| test:logic | 51 pass · 0 fail |
| save-compat | 12 pass · 0 fail |
| build-src / check-src | IDENTICO BYTE PER BYTE (7.726.306 byte) |

## Dubbi per il PO

1. **«Non entra mai» non è raggiungibile oggi**: l'ingresso dalla panchina cade sempre fra il 46' e l'82' e le scelte lo anticipano
   soltanto. Messaggio e riga «Non entrato» ci sono, provati col gancio di collaudo; se in futuro il mister potrà non far entrare il
   giocatore, la parte B del guardiano è già pronta.
2. **Durante la sostituzione** ho tolto il velo dei salienti per far vedere l'ingresso in campo (circa 4,6 s), coerente con «vedere sempre
   l'ingresso» del 246. Se si preferisce che la sostituzione resti dietro il velo, è una riga.
3. **`salienti-229`, giornata in più**: catturata due volte e spiegata (classifica del salvataggio sintetico con una giornata di lega in
   più, non la partita), sparita dopo aver tolto l'attesa a tempo fisso della sonda; il passaggio esatto che la produceva non l'ho
   riprodotto a comando. Se ricomparisse, il dump ora contiene passeggiata, settimana e classifica di entrambi i bracci.
4. **Ordinamenti della classifica**: cercando il carattere ho visto che la riga «Finisci nei primi N · X° ora» della schermata finale
   ordina per punti e differenza reti senza i gol fatti, mentre la tabella della stessa schermata li usa; e nel codice ci sono ~20
   ordinamenti della classifica con spareggi diversi. Con classifiche a pari punti, pari differenza reti, la posizione detta può
   cambiare fra due schermate. Non corretto (fuori ambito, nessun caso del PO).
5. **Il riquadro «RISCALDAMENTO»** in panchina si basa sul minuto d'ingresso previsto: col gancio `__CPM_BENCH_MIN=95` compare al 50'-70'
   anche se il giocatore non entrerà. Solo collaudo (in partita vera l'ingresso c'è sempre), segnalato per completezza.
6. **Impaginazione della carriera**: corretta solo nel provino, come chiesto. Non ho misurato se pre-partita e formazioni della carriera
   a 412 px abbiano lo stesso margine a 0 (la carriera azzera anch'essa i lati di `.cpm-scroll` in partita).
7. **Mappa mirata**: ho eseguito i controlli della consegna; la mappa mirata completa di `src/15` e `src/17` (decine di guardiani) non è
   stata eseguita. Per errore mio due esecuzioni dell'esecutore sono partite e le ho fermate subito: la prima (catena di default, un paio
   di minuti, in parallelo a una corsa del censimento del 229 — quella corsa l'ho usata solo per catturare il carattere, non per la
   stabilità), la seconda (`mirata`, fermata dopo 4 passi verdi: test:logic, save-compat, design-system, tema-unico). Nessuna delle due ha
   scritto `STABILITA.json` né altri file.
8. **`solo-highlight-166`, caso 12b rosso anche sulla base**: il nome «Collaudo Sorpresa 7» era stato scelto (giro 187) perché la sua
   intervista a sorpresa uscisse; oggi, sulla stessa settimana (2) e lo stesso avversario (FC Domstadt, misurati con la passeggiata
   vecchia e quella nuova), la sorpresa non esce più (il seme è nome|stagione|settimana|avversario, `src/07` r.~1740). Qualcosa fra il
   giro 246 (dove era verde) e `lavoro/197` ha cambiato uno dei quattro ingredienti al momento dell'intervista. Non indagato oltre: è
   fuori dalla consegna. Il controllo è rosso, quindi la mappa mirata di `src/15` lo vedrà rosso finché non si sceglie un nome nuovo
   (sonda `sonda-iv187`) o si trova cosa è cambiato.
