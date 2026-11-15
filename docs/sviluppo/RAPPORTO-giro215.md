# Rapporto giro 215 — PO-478 «Simula a partita iniziata continua dal parziale»

Ramo `sviluppo/giro215-simula-parziale`, partito da `lavoro/195` (39ada80, contiene il giro 209). `GAME_VERSION` non toccata (regola
fissa). Rosso unico: `window.__CPM_NO_G215` (= comportamento del 209: partita rigiocata da capo). Guardiano nuovo: `npm run simula-215`.

Decisione del PO (15/11): se il 3D smette di caricare a partita iniziata, «Simula» deve continuare la partita col motore dal minuto e
dal punteggio raggiunti, tenendo gol, cartellini, cambi, statistiche e presenze già accaduti; nessun doppio conteggio, salvataggio
coerente; la presenza dalla panchina (benchStart) contata come nel percorso normale; il provino simulabile resta.

## 1. Come si provoca l'avviso a metà gara

Sonda `tests/visual/simula-215.mjs`, percorso vero (stesso salvataggio del 209: professionista, Coppa in settimana, telefono 375×667,
`__CPM_CAREER.playMatch`, pilota seedato). I file CGTrader arrivano, la partita parte in 3D. A metà gara la sonda provoca la caduta:
- **titolare** (seme 2153): dopo almeno un gol e una scena dell'eroe, dal 20';
- **panchina** (seme 2152, fatica 79 → il mister lo lascia fuori): al 30', prima dell'ingresso.

Provocazione: i file CGTrader vengono abortiti e lo stato del caricatore diventa quello che il gioco scrive quando il pacchetto non
arriva (`__CPM_HYPER_CASUAL_STATUS='fallback:…'`, src/12, `.catch` del caricamento CGTrader). Il controllo di prontezza del 196 lo
legge a ogni battito di `playing` e apre l'avviso «fallito». ⚠️ Il primo tentativo rimontava la scena col segnale della perdita del
contesto grafico (`cpm-gl-restored`): **0 richieste CGTrader**, il pacchetto è già in memoria e la scena rimontata è subito pronta,
quindi quel percorso da solo non produce l'avviso. Ciò che il gioco non produce si provoca dalla sonda (PROCESSO.md).

## 2. Misura prima (build di `lavoro/195`)

| caso | all'avviso | dopo «Simula» (oggi) |
|---|---|---|
| titolare | 20', **0-1**, 2 scene dell'eroe giocate, voto 5,6, eroe 0 gol | Coppa «Quarti di Finale (sim): **1–2**», voce `simulated:true`, eroe **1 gol**, voto **7,1**: un'altra partita giocata da capo |
| panchina | 30', **0-2**, eroe in panchina (`_buildEndResult`: «bench», 22') | voce `simulated:true`, 0-2, **senza `matchStatus` né `minutesPlayed`**: la panchina sparisce dalla voce |

In entrambi: matchHistory +1, Coppa +1, settimana +1, presenze +1, nessun doppio conteggio (il percorso del 209 non chiamava mai
`onMatchEnd` dal vivo). Il «finale ≥ parziale» del titolare (1-2 contro 0-1) è **per caso**: è un'altra partita (eroe che segna in una
partita in cui non aveva segnato, voto diverso). Per questo il guardiano non si ferma a quel confronto (vedi §4).

**Difetto trovato misurando, non chiesto:** sotto l'avviso a metà gara **il cronometro correva** (20,20,20,21,21,21,21,22 in 4 s): la
partita andava avanti da sola mentre il giocatore doveva decidere. Causa (src/15, `_chk196`): quando il caricamento fallisce si chiama
`_vai2D196`, che per il giocatore apre l'avviso invece del 2D, ma la funzione rispondeva comunque `'2d'`; il controllo dei corpi del
battito leggeva «2D» e toglieva la trattenuta `corpiHold232`. All'ingresso (giro 209) non si vedeva perché lì il cronometro non è
ancora partito.

## 3. Correzione (src/14, src/15 — rosso `__CPM_NO_G215`)

**src/14 (motore)** — il motore espone la sua configurazione (`_cfg`) nei due `return`. Nient'altro.

**src/15 (LiveMatch)**
- `_simula209` chiama prima `_continua215()`: se la partita è iniziata (minuto 1-89, fase `playing`/`hl_*`, motore presente) la si
  prosegue; altrimenti (avviso all'ingresso, minuto 0) resta il percorso del 209 (`onSimula209` → `simulateAndAdvance`, o nel provino
  il risultato del motore).
- `_continua215`: lo **stesso motore** della partita passa alla simulazione rapida (`cfg.brainLive` spento, `occasioniV2` acceso: le
  occasioni dell'eroe le risolve il motore come in `simulaPartitaMotore`, perché le scene non si possono giocare senza 3D; la scena
  eventualmente dichiarata e la richiesta di scena si azzerano) e gioca i minuti che mancano: 22 passi al minuto, l'intervallo se non
  c'è ancora stato (`halfFiredRef`, stessa ripresa dal centro del gioco), recupero fino al 93' come la simulazione rapida.
  - eroe in panchina: entra al suo minuto (`chiedi.eroe(true)`, lo stesso del battito);
  - punteggio: per ciascuna squadra il più alto fra tabellone e tabellino del motore all'avviso (un gol già deciso ma non ancora
    narrato non si perde, e non si conta due volte) più i gol del motore nei minuti simulati; stessa regola per gol e assist dell'eroe
    (pagella del motore); gialli e rosso dell'eroe si sommano a quelli già presi (due gialli = espulso); tiri delle due squadre
    aggiunti alle statistiche;
  - i gol in coda (narrazione non ancora partita) escono dalla coda: contati sopra, non si narrano più e il fischio 228 non li toglie;
  - momenti chiave del post-partita: gol (e cartellini dell'eroe) dei minuti simulati con gli stessi testi del gioco fluido, più una
    riga di cronaca «⏩ La partita prosegue simulata dal N': finisce X-Y.»;
  - fischio: `_goEndOrCeremony` (sidecar `cpm-pending-mr`, tabellino 228, testimone 216) ma **dritto al post-partita**: rigori e feste
    sono scene 3D. Il pareggio di un turno KO lo risolve la carriera con lo stesso seme (`koShootoutWin`), come quando la presentazione
    3D dei rigori non c'è. La funzione si chiama dal render corrente (`goEnd215Ref`) dopo `flushSync`, così il sidecar porta le
    statistiche appena scritte;
  - risultato: quello del **percorso normale** (rassegna → `_buildEndResult` → `onMatchEnd`), quindi presenze e minuti come una
    partita vissuta (dalla panchina «bench» e `90 - minuto d'ingresso`). Nessun campo nuovo nel salvataggio.
- `_chk196`: aperto l'avviso (non il 2D) risponde `'avviso'` → la trattenuta resta e il cronometro è fermo sotto l'avviso.
- Testimoni solo collaudo: `__CPM_S215` (minuto, parziale, tabellino del motore prima/dopo, finale, eroe) e `__CPM_LM215` (panchina,
  minuto d'ingresso, sotto `?cpmtest=1`).

## 4. Guardiano `simula-215`

Verde, per titolare e panchina: cronometro fermo sotto l'avviso (8 campioni in 4 s); avviso a metà gara (minuto > 0); Simula premuto
una volta, carriera a schermo; punteggio finale ≥ parziale per ciascuna squadra; **la partita prosegue dal minuto e dal punteggio
dell'avviso e la voce registrata è il suo finale** (testimone del gioco + voce di carriera; è il controllo che separa dal rosso, dove
«finale ≥ parziale» può capitare per caso); gol/assist/gialli dell'eroe ≥ quelli già presi; una sola voce (matchHistory +1, Coppa +1,
gara giocata, gol di carriera = prima + gol della voce, presenze +1); panchina: voce «bench» con `90 - minuto d'ingresso`; nessuna
ripresa; dopo 8 s e dopo il ricaricamento stesso salvataggio e nessuna partita riaperta; 0 errori.
Rosso (`__CPM_NO_G215`, titolare): deve essere bocciato. «Non giudicato» = rosso.

Esito (`giro215/guardiano.txt`): **verde 21/21 · rosso bocciato** (cronometro 20→22 sotto l'avviso; nessun testimone, voce 1-2
`simulated:true` di una partita rigiocata).

| caso (ultima corsa) | avviso | dopo Simula |
|---|---|---|
| titolare | 20', 0-1, eroe 0 gol | prosegue dal 20': 1-2, eroe 1 assist, voto 6,5, starter 90' |
| panchina | 30', 0-2, eroe in panchina, ingresso al 55' | prosegue dal 30': l'eroe entra al 55', 0-2, voce «bench» 35' |

Registrato in `package.json` e in `ci-runner.mjs`: catene **completa** e **carriera** (una volta sola ciascuna, verificato contando le
voci senza commenti), mappa di `src/15` e lenti; `node --check` ok.

## 5. Controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno, `CPM_CHROME=/opt/pw-browsers/chromium`)

| controllo | esito |
|---|---|
| simula-215 | verde 21/21, rosso bocciato |
| avviso3d-209 | verde 36/36, rosso bocciato |
| simula-v2 | verde, rosso atteso visto |
| gioca-188 | verde 6 ok, 0 ko (una prima chiamata senza `CPM_CHROME` non è partita: non è un esito) |
| rassegna-202 | verde 9/9, rosso bocciato |
| solo-highlight-166 | verde: «VERDE: PASSA», rosso cade su 3, 7 e 8 (oltre i 10 minuti: rilanciata da capo in sottofondo con attesa sul registro; la prima corsa fermata dal tetto non vale) |
| career-critical | verde: 14 passi, 0 ❌ (in sottofondo con attesa sul registro) |
| test:logic | 51/51 |
| save-compat | 12 pass · 0 fail |

## Dubbi per il PO (non decisi)

1. **I minuti simulati non hanno scene**: le occasioni dell'eroe in quei minuti le risolve il motore con la scelta più probabile dal
   profilo (come la simulazione rapida), non il giocatore. Era l'unica strada senza 3D; se il PO vuole altro (per esempio scene a
   scelta testuale), va deciso.
2. **La voce di carriera non dice che una parte è simulata**: esce dal percorso normale, senza `simulated:true` (che vale «nessuna
   fatica» in alcuni rami della carriera: qui la fatica si paga come per una partita vissuta). C'è solo la riga di cronaca «⏩ La
   partita prosegue simulata dal N'». Se il PO vuole un segno nella voce o nel riepilogo, va deciso.
3. **Turno KO pareggiato**: i rigori 3D non si mostrano; li decide la carriera con lo stesso seme. Il post-partita mostra il pareggio e
   l'esito dei rigori arriva con l'avviso della Coppa. Nessuna presentazione 2D dei rigori in questo caso (esiste quella del 205 per il
   ripiego 2D, spento dal 209).
4. **Sostituzione dell'eroe nei minuti simulati**: se l'eroe era titolare resta in campo fino al 90' (nessun cambio simulato); i cambi
   già avvenuti dal vivo restano. Le feste/cerimonie di fine partita (titolo, big win) non si mostrano.
5. **Il finale varia fra due corse dallo stesso punto**: dallo stesso avviso (20', 0-1) ho visto 0-3, 1-3, 1-2. La prosecuzione è
   deterministica, ma lo stato del motore al 20' non lo è in headless (i sotto-passi per minuto dipendono dall'orologio, cosa già nota
   nel codice: testimone `__CPM_PASSI959`). Il guardiano giudica regole, non un risultato fisso.
6. **Minuto d'ingresso dalla panchina**: cambia a ogni partita (61, 73, 55 nelle mie corse) perché `calcCoachDecision` nel prompt usa
   un sorteggio non seedato (codice preesistente). Non l'ho toccato.
7. **Provocazione della sonda**: lo stato «caricamento fallito» è scritto dalla sonda, non da una rete vera che cade a metà gara: nel
   gioco il pacchetto CGTrader caricato resta in memoria e un rimontaggio non lo richiede (0 richieste misurate), quindi non so dire
   quanto spesso il caso reale capiti sul telefono. Riguarda anche il tetto «lento» (120 s) a metà gara, che non ho provocato.
8. **Cronometro sotto l'avviso**: la correzione di `_chk196` vale anche per il tetto «lento» e per l'avviso all'ingresso (lì non
   cambiava nulla di visibile, avviso3d-209 verde). È sotto lo stesso rosso `__CPM_NO_G215`.
9. Non ho aggiunto la riga in `docs/governo/ROADMAP.md`: il giro non ha numero di versione (`GAME_VERSION` fuori perimetro) e non è
   promosso su `main` (come nel 209).
