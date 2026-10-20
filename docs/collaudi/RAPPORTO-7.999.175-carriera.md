# Rapporto di collaudo — CPM 7.999.175 (carriera)

- **Versione collaudata:** 7.999.175 (`GAME_VERSION="7.999.175"` in `CARRIER-MANAGER-AV.html`, verificata con grep)
- **Base:** `origin/main` @ 6ba91d4e · **Ramo di collaudo:** `collaudo/7.999.175-carriera`
- **Ambiente:** Chromium `/opt/pw-browsers/chromium` (`CPM_CHROME`), headless, Playwright da `tests/visual/node_modules` (collegato a `/home/user/cm-169/tests/visual/node_modules`). Foto a 412×915 e 360×915.
- **Perimetro:** sola verifica. Nessun file di prodotto modificato (`CARRIER-MANAGER-AV.html`, `src/`, `tests/` intatti).
- **Dove stanno le prove:** l'output di ogni sonda è in `docs/collaudi/<nome>.txt` (o `.json`); le 46 foto in `docs/collaudi/foto-7.999.175-carriera/`; le sonde nuove sono `docs/collaudi/collaudo-175-foto.mjs`, `collaudo-175-profilo.mjs`, `collaudo-175-intervista-17.mjs`.

## 1. Esito in sintesi

Nessun difetto bloccante. La novità della 175 (stile unico, via l'Enfant, pagella = risultato registrato, curva di difficoltà a uno stile) funziona come dichiarato: creazione senza scelta dello stile e senza casella Enfant a 412 e 360 px; Profilo senza riga Enfant; salvataggi della 174 migrati a Finalizzatore con le statistiche invariate. Tutti i guardiani richiesti sono verdi, e ogni rosso di controllo cade come deve.

Restano due difetti di grafica a 360 px (Bassa), un'incoerenza di testo da confermare a schermo (Media, da decidere) e due osservazioni di parola.

Il dubbio del collaudo 174 sul «1ª» nella riga «Ultime 5» a 412 px è misurato (§3, riga F3): il numero è allineato al filo destro del contenuto, a 2 px dal bordo interno del padding. Non c'è overflow né taglio.

## 2. Tabella di gravità

Scala: **Bloccante** (impedisce la pubblicazione) · **Alta** (funzione rotta visibile) · **Media** (funzione corretta ma con testo o comportamento incoerente) · **Bassa** (cosmetico o di leggibilità) · **Nessuna** (verificato, conforme).

| ID | Gravità | Area | Esito | Prova (file) |
|---|---|---|---|---|
| F1 | Media (dal codice, **da confermare a schermo**) | memoria d'intervista / stampa, eroe ≤19 anni senza tratto Enfant | Il tag «✨ Enfant prodige (N anni)» dipende dall'età (src/09, riga 735-737), non dal tratto: resta in una scelta che la 175 ha tolto. Non l'ho visto a schermo (§4) | `collaudo-175-intervista-17.json`, §3 |
| F2 | Bassa | 360 px, Ufficio, «Staff privato» | «Preparatore atletico · Livello 3/3»: «Livello» e «3/3» vanno a capo su due righe. A 412 px no | `foto-7.999.175-carriera/360-B-enfant174-06-ufficio.png`, `360-B-prova-06-ufficio.png` |
| F3 | Bassa (osservazione, chiude il dubbio 174) | home 412 e 360 px, riga «Ultime 5» | Il «1ª» è allineato al filo destro del contenuto (2 px dal bordo interno del padding, stessa colonna di «Calendario ›»). Nessun overflow (scroll della riga 0). È un numero senza etichetta, staccato dalle V/N/P: leggibilità, non overflow | `collaudo-175-foto.json` (campo `home`), `412-C01-home.png`, `412-C02-prossima-partita.png` |
| F4 | Bassa (osservazione di parola) | provino, passo 1 | «Su rigori e punizioni scegli lo STILE del tiro»: la parola «stile» resta, con un significato diverso dallo stile di gioco rimosso. Possibile confusione, non un errore | `412-A03-provini.png`, `360-A03-provini.png` |
| — | Nessuna | creazione 412 e 360 | Senza griglia stili, senza casella Enfant, senza «Stile di gioco»; eroe creato Finalizzatore, tratto spento, scroll 0 | `collaudo-175-foto.json` (`creazione`), `stile-unico-75.txt` |
| — | Nessuna | migrazione salvataggi | 16 casi su 16 a Finalizzatore, idempotenti, statistiche invariate; salvataggio 174 con regista + Enfant → Finalizzatore, `stilePrima75=regista`, `enfantPrima75=true`, statistiche identiche | `stile-unico-75.txt`, `collaudo-175-foto.json` (`salvataggi`) |
| — | Nessuna | Profilo senza riga Enfant | Verde: nessuna riga Enfant (sonda capace: il rosso la mostra) | `collaudo-175-profilo.json` |
| — | Nessuna | pagella = risultato registrato | Verde su k4, k12, k13; rosso diverge su tutte e tre | `pagella-75.txt`, `pagella-75-k12.txt`, `pagella-75-k13.txt` |
| — | Nessuna | difficoltà PO-156 a uno stile | Verde 20/20 celle, 0 carriere non concluse, 0 pageerror. Rosso 8/20 (il guardiano vede) | `difficolta-156-verde.txt`, `difficolta-156-rosso.txt` |
| — | Nessuna | invarianti di carriera | Verde, 252 club, pageerror 0 | `career-invariants.txt` |
| — | Nessuna | salvataggi, compatibilità | 12 pass · 0 fail | `save-compat.txt` |
| — | Nessuna | due stagioni con rollover | Verde: 162 step, rollover S2→S3 e S3→S4, pageerror 0 | `career-sim.txt` |

## 3. Prova per riga

### Novità della 175

- **Creazione senza stile e senza Enfant (412 e 360 px).** Il bottone «Nuova carriera» apre la creazione: nel DOM non ci sono `data-cpm="scelta-stile"` né `data-cpm="tratto-enfant"`, né il testo «Stile di gioco» o «Enfant». Lo schermo ha la sezione «🗺️ Percorso» e poi il provino. Il calciatore creato è Finalizzatore con tratto spento. Foto: `412-A01`, `412-A02`, `412-A03`, e le stesse a 360 px. Le foto mostrano la pagina intera, senza scroll orizzontale.
- **Profilo senza riga Enfant.** Con il salvataggio 174 (regista + Enfant), il Profilo in build 175 mostra «STILE DI GIOCO: FINALIZZATORE» e nessuna riga Enfant. Con il rosso `__CPM_NO_STILEUNICO75` la stessa sonda mostra «STILE DI GIOCO: REGISTA» e la riga «✨ Enfant Prodige · cresci più in fretta…». Il controllo distingue quindi il vecchio comportamento dal nuovo. Il titolo della card si legge in maiuscolo perché il CSS lo trasforma. Foto: `412-B-enfant174-profilo.png`, `360-B-enfant174-profilo.png`.
- **Migrazione dei salvataggi.** `stile-unico-75` verde: 16 casi (8 vecchi archetipi, 4 stili, e 4 stili con Enfant acceso) portati a Finalizzatore, statistiche e campi invariati, seconda passata senza effetto. Nel giro di collaudo, il salvataggio di prova (centravanti della 174) ha stile Finalizzatore e statistiche identiche prima e dopo; il salvataggio 174 con regista + Enfant ha stile Finalizzatore, `stilePrima75=regista`, `enfantPrima75=true`, statistiche identiche.
- **Pagella = risultato registrato.** `pagella-75` verde su k4, k12, k13: pagella e risultato registrato coincidono (verde: pagella 2 / registrato 2, pagella 2 / registrato 2, pagella 2 / registrato 2). Rosso `__CPM_NO_PAGELLA75`: divergono su tutte e tre (2 contro 1). I gol in gioco fluido sono accreditati all'eroe nel verde (`accreditati 1`). Il k4 è nel file `pagella-75.txt`: il comando è stato interrotto dal mio timeout dopo il k4; k12 e k13 sono in file separati.
- **Curva di difficoltà PO-156 a uno stile.** `difficolta-156` verde: 40 carriere × 2 stagioni, 20/20 celle entro tolleranza, 0 carriere non concluse, 0 pageerror. Il rosso `--rosso` dà 8/20 celle fuori, e il guardiano dichiara «ROSSO VISTO». Il primo giro verde era invalido (uscito con timeout e 19 carriere chiuse dal browser sotto carico) e non è usato: il verdetto è quello del giro rilanciato con `--par=4`.
- **Home 412 px, «1ª» nella riga «Ultime 5» (dubbio 174).** Misura DOM su `collaudo-175-foto.json` (campo `home`), a 412 px: card larga 394,1 px; padding destro 16 px; il «1ª» finisce a 2 px dal bordo interno del padding (campo `primoDaPaddingPx`), e a 18,9 px dal bordo esterno della card. Le cinque badge V/N/P e il «1ª» sono nella stessa riga senza scroll (`scrollRiga 0`). A 360 px: 2 px dal bordo interno, scroll 0. Visivamente il «1ª» è sulla stessa colonna di «Calendario ›». Il dubbio della 174 è dunque vero solo nel senso di allineamento al filo: non è un overflow né un taglio. Foto: `412-C02-prossima-partita.png`, `360-C02-prossima-partita.png`.

### Giro generale (2 stagioni)

- **Due stagioni con rollover:** `career-sim-test` verde, 162 step, rollover S2→S3 (iter 76) e S3→S4 (iter 161), stato finale S4 W1, pageerror 0.
- **Invarianti:** `career-invariants` verde su 252 club.
- **Salvataggi:** `save-compat` 12 pass · 0 fail.
- **Trasferimento:** non provato in questo giro (non c'è un guardiano che lo dichiari). Non lo dichiaro verificato.

### Schermate (46 foto)

Ogni foto è stata aperta e guardata:
- creazione 412 e 360 px (3 + 3): ok;
- salvataggio enfant174 e prova, 412 e 360 px (9 + 9 per larghezza, schede Home, Stagione, Club, Carriera, Agente, Ufficio, Opzioni, più Profilo): ok, con F2 a 360 px nell'Ufficio;
- home 412 e 360 px (C01 e C02, 4 foto): ok; il confetti della festa copre in parte alcune scritte nelle foto di avvio (transitorio, catturato dall'animazione).

### Difetti

- **F1 (memoria «Enfant prodige», da confermare).** Il codice (src/09, riga 735-737) mette «✨ Enfant prodige (N anni)» per età ≤19, quando non ci sono record né Golden Boy. Non dipende dal tratto. Ho provato a vederlo a schermo con un eroe di 17 anni, senza Enfant e senza record (`collaudo-175-intervista-17.mjs`): 25 partite giocate, 160 passi, il testo non è comparso. La schermata stampa (`PressScreen`) non è stata raggiunta con certezza. Quindi: incoerenza dal codice, non confermata a schermo.
- **F2 (Livello a capo a 360 px).** Nel Ufficio, «Preparatore atletico · Livello 3/3» occupa tre righe: «Livello» resta sulla riga del titolo e «3/3» scende sola. A 412 px la riga sta su due. Foto `360-B-enfant174-06-ufficio.png`, `360-B-prova-06-ufficio.png`.
- **F3 (chiusura del dubbio 174).** Vedi §3, ultima voce del punto «Novità». Misurato: 2 px dal filo interno del padding, nessun overflow.
- **F4 (parola «stile» nel provino).** Il testo del provino usa «STILE» per i tiri da fermo, mentre lo stile di gioco non esiste più. È un'osservazione di parola, da decidere con il PO.

## 4. Non verificato

Ciò che non ho potuto confermare. Lo dichiaro qui, non lo do per buono.

- **«✨ Enfant prodige» a schermo (F1).** Non l'ho visto. La sonda ha giocato 25 partite con un eroe di 17 anni senza Enfant, senza record e senza Golden Boy, ma il testo non è comparso nei passi che ho controllato. Serve una partita con la schermata stampa aperta.
- **Partita giocata a mano.** Nessuna partita è stata giocata da un giocatore. Le sonde forzano situazioni o simulano.
- **Trasferimento** nel giro di due stagioni: non provato esplicitamente.
- **Gate visivo 14/14 e guardiani non elencati** (`tripath-chokepoint-test`, `career-critical`, `stab-nat-trigger-test`, `recovery-competition`): non eseguiti in questo giro, perché non richiesti per questa verifica di carriera.
- **Dispositivo reale e Android.** Solo headless Chromium.
- **Foto a occhio.** Tutte le 46 foto sono state aperte, ma la lettura è visiva: nessuna misura dei caratteri oltre a quanto misurato dal DOM.
- **Dataset di Nazionale** e mercato dedicato: non coperti da questo giro.

## 5. Scelte per la sessione principale

Solo F1 richiede una decisione di prodotto (il testo non è un bug del codice, ma una scelta di parola coerente con «via l'Enfant»):

1. **Togliere il tag per età** (consigliata): la riga «Enfant prodige» non esce più, né per età né per tratto. Una riga in meno, nessun dato perso, coerente con la decisione del PO.
2. **Rinominare in «Giovane promessa (N anni)»**: mantiene il messaggio di età senza la parola Enfant. Richiede di aggiornare il testo e una sonda.
3. **Lasciare com'è**: il tag dice l'età, non il tratto. Va dichiarato che la parola «Enfant» resta, con l'effetto di confondere il giocatore che non ha il tratto.

F2 (Livello a capo a 360 px) è una correzione di layout senza scelta di prodotto: ridurre il testo o lasciare «Livello 3/3» su una riga intera.

## 6. Note di metodo

- Il ramo di collaudo è partito da `f6a73df2` (174); l'ho riallineato a `origin/main` 6ba91d4e (175) prima di ogni misura. Nessun commit di prodotto è stato toccato.
- **Difficoltà 156, primo giro invalido:** l'esecuzione è uscita con timeout e 19 carriere su 40 sono finite con «Target page closed». Causa: carico della macchina (load ~20 su 4 core), con una sessione di collaudo parallela (col175-3d) che apriva tre browser. Il rilancio con `--par=4` è verde. Il primo giro non è usato come prova.
- **Pagella 75:** il lancio con tutte e tre le partite ha superato il timeout di 580 s dopo il k4. Le partite k12 e k13 sono state lanciate con `K=12` e `K=13`, come previsto dallo script.
- Le sonde di controllo rosso (`__CPM_NO_*`) confermano che il verde non è cieco: pagella, stile unico e difficoltà hanno tutte un rosso che fa cadere la misura.
- Le foto della festa mostrano il confetti sopra alcuni testi: è animazione transitoria, non un difetto di layout.
- Nessun file di prodotto modificato. Attribuzione del commit: non includo l'identificativo del modello, come da CLAUDE.md, che prevale sul promemoria di attribuzione.
