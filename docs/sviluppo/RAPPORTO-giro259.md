# Rapporto giro 259 — sorpresa dell'intervista e ordine della classifica

Ramo `sviluppo/giro259-sorpresa-classifica`, partito da `lavoro/197` (`9a5d8a6`, contiene i giri 251 e 253). `GAME_VERSION` non toccata.
Rosso unico dei due interventi: `window.__CPM_NO_G259`.

## A — intervista a sorpresa (dubbio 8 del 253)

**Misura.** Il seme della sorpresa (`intervista183`, `src/07`) era `nome|stagione|settimana|NOME dell'avversario|sorpresa183` e il
nome di collaudo del 166 «Collaudo Sorpresa 7» gioca la settimana 2 della stagione 2 contro il club `kol`. Lo stesso club ha avuto
tre nomi, e il resto modulo 8 (la sorpresa esce a 0) cambia con lui:

| nome di `kol` | da quando | resto per «Collaudo Sorpresa 7» | sorpresa |
|---|---|---|---|
| FC Köln | giro 6 | 1 | no |
| FC Domstadt | giro 248 | 6 | **no** — è il rosso visto nel 253 (che misurò proprio «FC Domstadt») |
| FC Koln | giro 251 (oggi) | 0 | sì |
| `kol` (id) | giro 259 | 3 | no |

Ipotesi della madre confermata: il rinomino accende e spegne la sorpresa sulla stessa partita. Coerente col banco: sulla base di oggi
(nome «FC Koln») il 12b è uscito **verde** (`out/g259-166-base.log`), cioè il rosso del 253 non si riproduce più dopo il giro 251.
Il resto del 166 sulla base era invece rosso sui casi 10 e 11 (vedi «Dubbi», punto 1).

**Correzione (una riga di sostanza).** Il seme usa l'id del club (`md.opponentId`, già passato a `intervista183` da `src/18`); fuori
campionato, dove non c'è una voce di calendario, resta il nome. Rosso `__CPM_NO_G259` = il nome.
Effetto sui salvataggi: **nulla di salvato cambia** (la decisione non è salvata; il catalogo delle domande già fatte resta valido), ma
**le sorprese future cambiano**: per una data partita di campionato la sorpresa può uscire dove prima no e viceversa.
Conseguenze sugli strumenti: col seme sull'id «Collaudo Sorpresa 7» non ha più la sorpresa; il nome di collaudo del 166 diventa
«Collaudo Sorpresa 4» (resto 0 su `kol`, scelto con `sonda-iv187`, che ora calcola sull'id: il gancio `thisWeekMd` espone `oppId`).

**Altri semi che usano il NOME di un club** (stesso rischio a ogni rinomina; non toccati, fuori consegna):
- `src/07` `scegliPost183` — scelta della domanda dell'intervista (`r.opponent`): la voce del risultato non porta l'id.
- `src/15` r.~2176 — `selectContextualSituations`: seme `opponent.n||opponent.id` (il nome PRIMA dell'id) → le scene della partita.
- `src/15` r.~3336 — `sim209`, seme della partita simulata (nome dell'avversario).
- `src/16` r.~3810 — atmosfera della cerimonia di firma (`club.n`).
- `src/18` r.~2341 — `mte` (sull'ultimo `matchHistory.opponent`).
- `src/18` r.~3568 — seme della rivalità (`_rvC.n`).
- `src/18` r.~5077 / ~6103 / ~6123 — nazionali (`opponentName`/`oppName`): sono nomi di nazionali, non di `CLUBS`, quindi cambiano solo
  se si rinominano le nazionali.
Il seme della partita (`bgSimSeedRef`) usa già `opponent.id||opponent.n`: stabile.

## B — un solo ordine della classifica (dubbio 4 del 253)

**Misura prima.** Nel codice c'erano **36** ordinamenti della classifica di lega (oltre ai due del simulatore, che già usano
punti · differenza reti · gol fatti): **14** con gol fatti, **18** con soli punti e differenza reti, **4** con i soli punti; la tabella
principale (scheda Classifica) non ordinava affatto e mostrava l'ordine salvato. Classifica di prova del guardiano: noi e una rivale a
pari punti e pari differenza reti, noi con più gol fatti ma salvati dopo di lei. Sul gioco di prima (braccio rosso):
**2 schermate su 4 danno una posizione diversa** — schermata finale (riga della tabella) 3° · testata della carriera 3° · riga
«Finisci nei primi 4 · X° ora» **4°** · scheda Classifica **4°**.

**Correzione.** `ordinaClassifica259(st, vecchio)` in `src/09` (accanto a `updateStandings`): punti, differenza reti (`gf-ga`), gol
fatti, poi l'ordine salvato (ordinamento stabile = quello della tabella principale). Usata nei 36 siti (`src/07` 2, `src/08` 3, `src/15`
5, `src/17` 3, `src/18` 23) e nella tabella principale. Il secondo argomento è l'ordinamento di prima del sito: serve solo al rosso.
Esenti dichiarati (il guardiano li riconosce): i due ordinamenti del simulatore (`src/09`), le due tabelle dei gironi delle nazionali
(`src/17`, righe costruite sul momento con gli stessi spareggi) e la riparazione della classifica nella migrazione (`src/17`).
Effetto: cambia solo l'ordine fra squadre a pari punti e pari differenza reti nei siti che non guardavano i gol fatti (fra questi
alcuni che decidono qualcosa: obiettivo «primi N», zone europee/retrocessione dei testi, premi a fine stagione già usavano i gol
fatti). Nessun campo di salvataggio nuovo, nessun bump di `SAVE_VERSION`.

## Guardiano nuovo `classifica-259` (`npm run classifica-259`)

Due partite (una per braccio). Giudica: parte statica (nessun ordinamento per punti fuori dalla funzione unica), le quattro posizioni
sulla classifica di prova, e la parte A (60 nomi di collaudo × tre nomi di `kol`: la decisione dell'intervista non cambia col solo nome).
Registrato nelle catene `completa` e `carriera`, nella mappa di `src/05|src/09` e fra i lenti (`ci-runner.mjs`, `node --check` ok).

## Controlli eseguiti (CPM_CI_PAR=0, uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| controllo | esito |
|---|---|
| classifica-259 | ✅ verde: 3·3·3·3, sorprese 8, decisioni diverse 0 · rosso: 3·4·3·4, decisioni diverse 21 su 60 · statico pulito |
| solo-highlight-166 (base `lavoro/197`) | 12b ✓ · **10 e 11 ✗** (preesistente) · rosso cade su 3, 7, 8 come deve |
| solo-highlight-166 (giro 259, 1ª corsa) | 12b: intervista **chiesta in entrambe** («🎲 Sorpresa»), ma domande diverse perché la partita è diversa (10 e 11 ✗) |
| solo-highlight-166 (giro 259, 2ª corsa) | _vedi sotto_ |
| rassegna-232 | _vedi sotto_ |
| stagione-pro-164 | _vedi sotto_ |
| test:logic | _vedi sotto_ |
| save-compat | _vedi sotto_ |

`career-critical` non eseguito (lo esegue la verifica di rilascio). La mappa mirata completa di `src/07/08/09/15/17/18` (decine di
guardiani) non è stata eseguita: solo i controlli della consegna e il nuovo.

## Dubbi per il PO

1. **`solo-highlight-166` casi 10 e 11 instabili, preesistenti** (rossi anche sulla base `lavoro/197`; nel 253 erano verdi): la partita
   intera e quella a soli highlight a volte non sono la stessa partita. Misurato con `sonda-259b` (intera e soli highlight fermate al
   12'): divergenza in **6 corse su 22** fra le build (`b00f40b`, `8664940`, `17bb5ff`, `4ee5070`, `f9cc31c`, giro 259), quindi non
   attribuibile a un'unione. Sempre la stessa scena (passaggio al 4'-5'): «assist» contro «chance» (tiro del compagno parato, deciso da
   `giocaScena` col flusso `rnd` del motore). Causa misurata col testimone `__CPM_RND14`: nelle corse divergenti la partita intera
   consuma **4 estrazioni in meno al 4' e 63 al 5'** prima della scena — il motore ha già cominciato il minuto 5 quando la scena gioca,
   cioè il battito della fisica (22 sotto-passi per minuto, `src/15` r.~5494 e ~5802) ha una precedenza a tempo reale con l'apertura
   della scena. Non corretto: è il cuore del motore (cantieri 7.962 · 202 · 966), fuori da un giro piccolo. Finché resta, anche il 12b
   può cadere di conseguenza (stessa sorpresa, domanda diversa perché i fatti della partita sono diversi).
2. **Semi sul nome** elencati in A: vanno portati sull'id? `selectContextualSituations` (le scene della partita) è il più esposto.
3. **Ordine della classifica nelle decisioni**: alcuni siti cambiati non solo «mostrano» ma decidono (testi di zona europea, obiettivi);
   ora decidono con lo stesso spareggio che si vede. Se qualche regola dovesse usare uno spareggio diverso (es. scontri diretti), oggi
   non esiste in nessun sito.
4. **Coordinamento col giro 239**: tocco `src/07` in due punti di una riga (seme della sorpresa r.~1740, due ordinamenti r.~291/~907).
5. **Roadmap**: non aggiornata da me (giro di sviluppo, nessuna versione spedita): la riga la scrive chi unisce e rilascia.
