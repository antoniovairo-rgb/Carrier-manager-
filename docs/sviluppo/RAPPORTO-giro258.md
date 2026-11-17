# Rapporto giro 258 — nomi nel calendario e dati delle sonde (versione 7.999.197)

Ramo `sviluppo/giro258-nomi-calendario`, partito da `lavoro/197` a `c58c5a9` (contiene i giri 251 e 254). Origine:
`RAPPORTO-giro254.md` dubbio 1, `RAPPORTO-giro251.md` dubbi 8 e 11. `GAME_VERSION` non toccato.

## A) La riga «▶ vs <avversario>» del calendario passa dalla scala dei nomi

**Misura sulla base** (nomi definitivi del 251, 375 px, sonda `tests/visual/sonda-cal-258.mjs`): `nomi-182` sulla base è
**verde** (27 ok), ma solo perché nella settimana corrente del suo percorso c'è un avversario corto. Provando nella riga
corrente (quella col ▶ e il tasto «Gioca», casella di testo 184,3 px) tutti i 288 nomi di squadra, a testo semplice:
**4 nomi non ci stanno** — FC Sampierdarena Primavera 204,3 · FC Salernum 1919 Primavera 196,1 · FC Biancocelesti Primavera
194,3 · FC Catanzarese Primavera 187,5 px. Nella riga normale (senza tasto, 283 px) nessuno.

**Correzione** (`src/18-career-app.jsx`, riga del calendario `riga-cal-v2`): il prefisso «▶ vs» resta un testo fisso, il nome
dell'avversario è un `NomeSquadra182` (`data-cpm="cal-avv-258"`, scala intero → U19 → corto → sigla, testo = `md.opponentName`
come prima). Rosso **`window.__CPM_NO_G258`** = la riga di testo semplice di prima.

**Guardiano** `nomi-182`, nuovo passo **3b** (375 px): club della Lega A Primavera dal nome più corto, poi con l'aggancio di
prova `patch` la gara della settimana corrente prende l'avversario col nome più lungo del calendario. Lo script npm ora
esegue anche il braccio rosso (`CPM_ROSSO258=1`, deve uscire 1).

| braccio | riga corrente | esito |
|---|---|---|
| verde | «FC Sampierdarena Primavera» → «FC Sampierdarena U19» (livello 1), 132,5/132,5 px | VERDE 28 ok · 0 ko |
| rosso `__CPM_NO_G258` | «▶ vs FC Sampierdarena Primavera» testo semplice, censimento: tagliato 182 > 165 px | ROSSO 26 ok · 2 ko (uscita 1) |

Nel verde, «tutti i club» sul punto `cal-avv-258`: 375 px 291 interi / 4 dizionario / 1 sigla; 412 px e oltre tutti interi.

**Altre righe di testo semplice con nomi di squadra** (ricerca statica in `src/11`–`src/19` di testi con `ellipsis` o
`nowrap`+`overflow:hidden` che contengono un nome): oltre al calendario le sole trovate sono bracci rossi di giri precedenti
(`src/18` calendario europeo del 218, riquadro europeo `__CPM_NO_EURO24`) o righe che mostrano la sigla (`t.a||t.n`). Rassegna
stampa e messaggi vanno a capo (frasi intere), non tagliano. Non corrette: vedi dubbio 2 per i riquadri a due righe.

## B) Controlli dei nomi

Tutti eseguiti uno alla volta, prima e dopo, sulla build del ramo:

| controllo | esito | note |
|---|---|---|
| nomi-182 (+ rosso 258) | VERDE / rosso visto | 4 min ciascuno |
| nomi-190 | VERDE 23 ok | 58 s |
| nomi-211 | VERDE 22 ok | 282 s |
| nomi-248 (+ rosso) | VERDE 20 ok | 107 s |
| nomi-251 (+ rosso) | VERDE 24 ok | 119 s |
| cronaca-nomi-190 | VERDE (92' e 93' al fischio, 132 righe, 0 segnaposti) | >10 min, girato in sottofondo dentro il turno |
| sigle-203 (4 passate) | VERDE 18 ok · VERDE 8 ok · rosso 203 visto · rosso 254 visto | |
| calendario-218 | VERDE | |
| interviste-211 (+ rosso 222) | VERDE 41 ok · rosso 34/7 | prima e dopo l'aggiornamento dei dati |
| indice-163 | VERDE | prima e dopo l'aggiornamento dei dati |
| test:logic | 51/51 | |
| save-compat | 12 pass · 0 fail | |
| calendario-247 (MAPPA `src/18`) | VERDE e rosso visto | dopo il ritocco del localizzatore, vedi sotto |
| momenti-v2 (MAPPA `src/18`) | VERDE, contrasto minimo 4,83:1; rosso atteso | 468 s |
| avversario-106 (MAPPA `src/18`) | uscita 0 | |

**Dati delle sonde aggiornati** (solo dati, nessuna soglia): `indice-163` club `milan` «FC Milano Sempione (Primavera)»/MSE →
«FC Rossoneri (Primavera)»/RSN; `interviste-211` e `interviste-211-foto` avversario «FC Isar»/ISR → «FC Munchen»/MUC. Entrambi
erano già verdi con i nomi vecchi (dati inventati: id `g1` per l'avversario, id `milan` per il club).

**`calendario-247`** era diventato rosso per la correzione A: trovava la riga cercando «vs Portogallo» in un solo elemento.
Ora, se c'è `cal-avv-258`, misura il troncamento sull'elemento del nome e prende la riga da `riga-cal-v2`; senza il 258 resta la
ricerca di prima. Stesse condizioni di verde e di rosso.

**Lasciati come sono**: i nomi vecchi in `nomi-182`/`nomi-190`/`nomi-211` sono stringhe date alla funzione pura della scala
(es. «Torino Athletic Primavera», che `nomi-211` usa di proposito come club inventato); `nomi-251` li usa per provare la
migrazione; in `calendario-218` «FC Parigi Ovest» è in un commento.

## Dubbi per il PO

1. **La riga del calendario mostra «FC Sampierdarena U19» invece di «… Primavera»** a 375 px quando l'avversario della
   settimana ha uno dei 4 nomi più lunghi: è la scala unica (secondo gradino). A 412 px resta intero.
2. **Riquadri a due righe con nomi lunghi, non corretti**: il podio dei premi (`Podio23`, `src/16`) scrive sotto la figurina
   testi misti come «N assist · club» o il club, in colonne strette con taglio a 2 righe. Misura fuori pagina (12 px, a capo):
   in una colonna di 95 px «FC Sampierdarena Primavera» va su 3 righe; a 80 px anche FC Biancocelesti/Catanzarese Primavera, e
   «Wolverhampton» è più largo della colonna. **Non posso confermare** la larghezza vera della colonna a 375 px: non ho aperto la
   schermata dei premi. La scheda avversario prima della partita (`src/18`, 120 px, due righe) non taglia nessun nome.
3. **Prefisso e nome sono due elementi**: `innerText` della riga ora dà «▶ vs» e il nome separati da un a capo (lo spazio è un
   `nbsp`). Ho trovato una sola sonda che leggeva quella riga come testo (`calendario-247`, sistemata); altre sonde fuori elenco
   potrebbero farlo.
4. **Sonde con nomi di oggi fuori dall'elenco della consegna**, non toccate: «FC Salernum» (senza 1919) è ancora dato in circa
   80 sonde (la maggior parte in `tests/visual/archivio/`, poi `griglia-mobile`, `home-colori-106`, `rigori-58`, `parata-test`…),
   «Torino Athletic» in `classifica-94`, `prestito-91`, `momento-194`…, «FC Milano Sempione» in `salta-163`, `momento-165`,
   `momento-165b`, `stagione-pro-164`, e nelle fixture di salvataggio (lì servono anche alla migrazione). Da valutare nella
   verifica di rilascio.
5. **Controlli della MAPPA per `src/18` non eseguiti**: 87 guardiani; ho eseguito quelli della consegna più `calendario-247`,
   `momenti-v2`, `avversario-106` (quelli che guardano la riga del calendario). `griglia-mobile`, `design-system` e gli altri
   restano alla verifica di rilascio.
6. **`cronaca-nomi-190` dura più di 10 minuti**: il primo tentativo in primo piano è stato interrotto dal tetto di 590 s (non
   vale); quello buono è girato in sottofondo dentro il turno. Nel file di registro, dopo «VERDE», è rimasto un frammento
   «…ICATO (rosso)» che credo venga dalla corsa interrotta che scriveva sullo stesso file: **non posso confermarlo**.
7. **Coordinamento col giro 235** (testate e schede): ho toccato solo la riga «vs …» del calendario in `src/18`; possibile
   conflitto solo se il 235 tocca la stessa riga.
8. **Roadmap non aggiornata**: giro su ramo di sviluppo, nessuna versione spedita.
