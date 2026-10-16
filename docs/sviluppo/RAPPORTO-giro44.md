# Rapporto giro 44 — PO-246 · PO-226 · PO-260 (interazioni in partita)

Ramo `sviluppo/interazioni-226-giro44`, base `lavoro/171-base` (7.999.170 + giro 22, contiene il giro 28 PO-259).
`GAME_VERSION` e `SAVE_VERSION` **non** cambiate. Zona G non toccata. Toccati: `src/15-live-match.jsx`, `src/14-motore-possesso.jsx`,
i guardiani `schede-246` (riparato), `schede-259` (due controlli in più), il guardiano nuovo `schede-260`, e quattro strumenti
(`misura-226`, `analizza-226`, `promessa-226`, `sonda-246-stallo`).

Condizioni di tutte le misure in partita: salvataggio `fixtures/save-194-primavera-w38.json`, partita vera di carriera (`playMatch`),
pilota automatico seedato, velocità 4, GLB spento, `?cpmtest=1`, headless. Ogni build misurata è stata congelata in una copia di lavoro
separata (`git worktree`), perché ricomporre il file mentre una misura gira la contamina (mi è successo una volta: misura buttata e rifatta).

## In breve

| | esito |
|---|---|
| **PO-246** `schede-246` rosso | **strumento**, non gioco: stallo che esiste solo nella sonda. Riparato → **verde**, rosso riconosciuto. In più trovato e corretto un **difetto vero** dello stesso ticket: una seconda scheda sovrascriveva quella in attesa (la prima scelta non arrivava al motore). |
| **PO-226** domanda del PO | risposta misurata su **20 + 20 partite** (sotto). Due cose non tornavano con PO-259 e sono corrette: un premio scritto **falso** e la promessa di «la risolvo io» **non mantenuta** in partita vera. |
| **PO-260** scheda sopra highlight/cerimonia | riprodotto (rosso: 13 campioni sopra la cerimonia, 29 sopra un highlight) e corretto → 0 campioni in 40 partite + guardiano. |

Interruttori rossi nuovi: `__CPM_NO_SOSP246` · `__CPM_NO_POP260` · `__CPM_NO_PREMIO44` · `__CPM_NO_PROM44`.

## 1) PO-246 — perché `schede-246` era rosso

**Misura** (`sonda-246-stallo.mjs`, stesso percorso del guardiano): il braccio «giocatore» si ferma al **55'** con la scheda a schermo,
timer di scadenza armati 1 / scaduti 0, e non riparte più. Il guardiano allora dichiarava «partita non finita» e «nessuna scheda
comparsa» (le contava solo alla chiusura, che non arrivava).

**Causa** (strumento): il braccio «giocatore» ferma il cronometro con la scheda aperta (`__CPM_SCFREEZE_TEST`, come una persona). Ma
dal giro 18 (`__CPM_NO_ORD18`), **sotto pilota automatico**, la scelta automatica non la prende più il timer reale: la prende il
battito del cronometro. Cronometro fermo → nessun battito; timer reale → esce subito perché c'è il pilota. Stallo. Il gioco vero
(senza pilota) usa il timer reale e non ha questo stallo.

**Prova**: stessa sonda con `__CPM_NO_ORD18` → partita finita al 90', 2/2 scelte arrivate al motore.

**Riparazione del guardiano**: i bracci giocatore e rosso armano `__CPM_NO_ORD18` (il timer reale sceglie, come per una persona); il
guardiano custodisce ora il **sistema vivo** (PO-259, `__CPM_S259`; `CPM_226=1` lo riporta sulle schede 226); il braccio «pilota» non
si gioca più di default; la soglia del rosso è «oltre la tolleranza del verde» (verde 0 minuti a scheda aperta, rosso 3-4).
Esiti: **verde** sulla build finale (scheda al 70', 0 minuti a scheda aperta, 1/1 al motore) · rosso `__CPM_NO682F` riconosciuto
(cronometro corso 70'→74' con la scheda aperta).

**Il difetto vero trovato strada facendo** (rosso `__CPM_NO_SOSP246`). Facendo durare a lungo una scheda (scelta lenta del pilota),
`schede-260` ha misurato **2 schede aperte, 1 sola arrivata al motore** («Prova Neri 3» e, col rosso, «Prova Greco 8»). Causa: con una
scheda in attesa la cronaca rifiuta la riga nuova (regola 7.686), ma il riferimento della scheda in attesa (`intxPendRef681`) veniva
**sovrascritto** dalla seconda: la prima scelta spariva, e i pulsanti a schermo (testo della prima) avrebbero applicato le opzioni della
seconda. Ora finché una scheda aspetta risposta non ne nasce un'altra (sistema 259 e, sotto rosso, 226). In gioco vero il cronometro è
fermo con la scheda aperta, quindi il caso richiede che il tempo scorra comunque (pilota, o una scheda sospesa durante un highlight):
**non posso confermare** quanto spesso capitasse a un giocatore vero; con il pilota capitava (è il quadro del collaudo 165: scheda a
schermo 22 minuti e scelta mai arrivata). I 22 minuti stessi tornano coi numeri: 35 s di timer ÷ 1,7 s per minuto = 21 minuti di
gioco col pilota del giro 18.

## 2) PO-226 — la risposta alla domanda del PO, misurata

> «Le interazioni durante la partita (ordini del mister, sostituzione, scelte da panchinaro) hanno risvolti sulla partita? Quante a
> partita? Sono correlate all'andamento?»

Due censimenti da 20 partite (stessi 20 nomi, quindi stessi semi): **base 171** (prima di questo giro) e **giro 44** (build finale).
Dati: `docs/sviluppo/dati-giro44/misura-*.json` e `analisi-*.txt`. Strumento: `misura-226.mjs` + `analizza-226.mjs`.
La scelta della scheda alterna l'opzione 1/2/3 (i%3) e la prende il pilota dopo 1,5 s.

### Quante e quali

| | base 171 | giro 44 |
|---|---|---|
| schede del mister a partita | **1,05** (21 in 20) | **1,25** (25 in 20) |
| partite con 0 / 1 / 2 schede | 4 / 11 / 5 | 2 / 11 / 7 |
| massimo a partita | 2 | 2 |
| highlight giocati dall'eroe a partita | 5,55 | 5,90 |
| schede senza posta (scarto ≥ 2) | 0 | 0 |

- Per fatto (giro 44): pari nel finale 8 · sotto di uno dal 70' 5 · avanti di uno nel finale 5 · fiato corto 4 · espulsione nostra 2 ·
  **rigore contro 1** (60') — il primo rigore contro visto in partita vera da quando esiste la regola (il giro 28 non l'aveva mai visto).
- **Sostituzione**: non è un'interazione. L'uscita dell'eroe la decide il gioco (fatica pre-gara o gestione del risultato, `_subDue38`),
  senza scelta del giocatore. Le **scelte da panchinaro** esistono (scheda `panca`, dal 50' con la squadra sotto di uno o in pari), ma in
  queste 40 partite l'eroe era sempre titolare: **non misurate in partita vera**; la regola è provata a banco (`schede-259` parte A).
- La differenza 1,05 → 1,25 **non** la attribuisco alle modifiche: le partite divergono già prima di ogni scheda (stessa causa del rosso
  di `seme-a`, vedi sotto), quindi i due bracci non giocano esattamente le stesse partite. Esempio: p5 0-2 senza schede nella base, 1-0
  con «pari al 75'» nel giro 44.

### Quando

- Minuto: minimo 13' · mediana 75' · massimo 83' (entrambi i censimenti; mai dopo l'84', per regola).
- Scarto al momento della scheda (giro 44): pari 10 · sotto di uno 8 · sopra di uno 7.
- ⚠️ **Il minuto è prevedibile per le schede di punteggio**: «pari nel finale» esce al **75' in 6 casi su 8** (gli altri 76' e 77'),
  «sotto di uno» al 70' in 3 su 5, «avanti di uno» all'82'-83' in 5 su 5. Il pari c'era già e la scheda nasce al primo minuto ammesso.
  È il momento chiesto dal PO, ma è un orologio. **Proposta, da decidere dal PO** (non applicata): farla nascere su un fatto del finale
  (un tiro pericoloso loro o un'occasione nostra dopo il 75'), con una rete di sicurezza qualche minuto dopo.

### Correlazione con l'andamento

- Partite **in bilico al 75'** (scarto ≤ 1): 18, **tutte** con almeno una scheda. Partite **chiuse al 75'** (scarto ≥ 2): 2, **nessuna**
  scheda (base: 16/16 e 0/4). Le schede seguono l'andamento per costruzione (regola PO-259).
- Dopo la scheda lo scarto finale è cambiato in **12 schede su 25** (base 9/21): metà delle volte la partita si muove ancora dopo la scelta.

### I risvolti sul motore

**La scelta cambia un dato del motore in 25 scelte su 25** (voglia di tirare, pressing, linea, gioco diretto, attesa della prossima
occasione dell'eroe: lettura prima/dopo, non dichiarazione). Il racconto dopo ~5' esce 25/25 e corrisponde ai fatti del motore 25/25.

Quanto pesa, misurato bene: il **banco controfattuale** di `schede-259` (192 partite per braccio, **stessi semi**, i 15' dopo la scheda,
contro la stessa partita senza scelta):

| profilo | premio misurato | rischio misurato | gol fatti / subiti ogni 100' (senza scelta: 2,04 / 1,12) |
|---|---|---|---|
| «spingiamo» | tiri nostri **+28,9%** | pericolo dei loro tiri (xG subito) **+72,5%** | 2,48 / 1,46 |
| «teniamo palla» | tiri subiti **−22,1%** | tiri nostri **−8,0%** | 1,75 / 0,63 |
| «la risolvo io» | prossima occasione dell'eroe **3,3'** dopo la scelta (senza: 7,1'), occasioni 130 contro 110 | tiri della squadra **−9,1%** | 2,09 / 0,83 |

In partita vera (finestre di 5', poche e rumorose, quindi **indicative**, non prove): «spingiamo» 0,71 tiri nostri ogni 5' contro 0,56 di
riferimento; «teniamo palla» 0,44 tiri loro contro 0,61; «la risolvo io» vedi sotto.

**L'occasione dell'eroe** (in partita vera è l'highlight): minuti dalla scelta al prossimo highlight dell'eroe.

| profilo | base 171 | giro 44 |
|---|---|---|
| «la risolvo io» | **1 su 6** arrivati (12') | **4 su 9** arrivati (mediana **3'**) |
| «spingiamo» | 4 su 8 (mediana 8') | 4 su 7 (8') |
| «teniamo palla» | 3 su 7 (7') | 4 su 9 (9') |

### Cosa non tornava con PO-259 e cosa ho corretto

**a) Un premio scritto falso** (rosso `__CPM_NO_PREMIO44`). La scheda «fiato corto» prometteva, sotto «Stringo i denti e pressing»,
«più tiri, **palloni recuperati alti**». Al banco, con il profilo «spingiamo», i palloni recuperati **calano** (23,9 contro 27,4 ogni
100'). Ora il premio dice «più tiri verso la porta». `schede-259` parte B controlla ogni premio scritto che parla di recuperi o di tiri
contro il banco: verde 0 smentiti, rosso 1 («eroe_stanco»).

**b) «La risolvo io» non manteneva la promessa** (rosso `__CPM_NO_PROM44`). Premio scritto: «la prossima palla buona arriva a te,
prima». In partita vera, base 171: prossimo highlight dell'eroe 1 volta su 6, occasione dell'eroe nel motore **0 su 6** nei 5' del
racconto. Due cause, misurate con una sonda minuto per minuto:
1. la finestra della scena dell'eroe nella partita vissuta restava chiusa (attesa minima fra due scene, budget di scene già speso):
   ora, per 8 minuti dopo la scelta, la finestra si apre senza attesa e, se il budget è speso, si aggiunge **una** scena — sempre dentro il
   **tetto PO di 7** (`_tetto7`, PO-221);
2. anche con la finestra aperta (sonda «Prova Ricci 11»: richiesta di scena attiva dal 60' al 92') il motore non creava l'occasione,
   perché l'occasione nasce solo quando l'eroe ha palla nell'ultimo terzo e i compagni non gliela davano: la scelta accorciava soltanto
   l'attesa fra due occasioni. Ora, finché l'occasione promessa non arriva, nel punteggio del passaggio l'eroe vale di più (`K259.cerca`
   = 14): è il prezzo già scritto sulla scheda («tutto passa da te: i compagni tirano meno»).
Esito: 1/6 → **4/9** in partita vera; al banco, stessi semi, occasioni dell'eroe **130 contro 117** senza la leva (attesa 3,3' contro
3,7'), custodito da `schede-259` parte B (rosso riconosciuto: 117 contro 117).
**Limite onesto**: quando la squadra non porta mai palla all'eroe la promessa resta vuota — «Prova Greco 8», in dieci dal 13', un solo
highlight in tutta la partita, nessuna occasione dopo le due scelte. Lo strumento `promessa-226` (6 partite, opzione sempre «eroe»)
separa poco verde e rosso (3/6 contro 2/6) e le partite divergono fra due giri: per questo **non** è un guardiano di catena; il
guardiano deterministico della leva è nel banco di `schede-259`.

## 3) PO-260 — la scheda non si apre sopra highlight e cerimonia

**Riprodotto** con `schede-260` (pilota che sceglie dopo ~36 minuti di gioco, così la scheda resta in sospeso attraverso highlight e
fischio): col rosso `__CPM_NO_POP260` la scheda è a schermo **29 campioni dentro un highlight** (hl_intro/choose/result al 71') e
**13 campioni sopra la cerimonia** finale, la stessa foto del collaudo 169.

**Correzione**: la scheda si mostra solo in `playing`; durante un highlight resta in sospeso, nascosta, e torna a schermo alla ripresa;
se la partita va in cerimonia o al fischio con una scheda ancora aperta, si chiude con la scelta neutra dichiarata «scelta da sola»
(stessa via del timer), così la scelta arriva comunque al motore.

**Esiti**: `schede-260` verde (0 campioni fuori dal gioco, 2 partite, scelte al motore = schede aperte, 1 chiusa al fischio per partita)
e rosso riconosciuto. Nei due censimenti da 20 partite: **0** campioni a schermo fuori dal gioco fluido.
⚠️ In gioco vero, senza pilota, il cronometro è fermo con la scheda aperta: il caso richiede un highlight già avviato o il fischio con
una scheda appena nata. **Non posso confermare** con quale frequenza capitasse a un giocatore vero; il rimedio copre tutti i percorsi.

## Esiti dei guardiani

Tutti eseguiti dentro il turno sulla **build finale** (copia di lavoro al commit `2778708`, file di gioco identico al commit consegnato;
dopo quel commit sono cambiati solo file di test). Log in `docs/sviluppo/dati-giro44/catena/`.

ESITI_CATENA

`node tools/check-src.mjs`: file ricomposto identico byte per byte ai frammenti.

## Cosa resta aperto

- **`seme-a` rosso, preesistente**: rosso identico anche sulla base 171 (stesso primo ingresso divergente #486 al 17', `chiedi.riprendi`
  con la posizione vista dell'eroe che differisce di 1-2 unità), prima di qualunque scheda. Non è di questo giro; è la stessa causa per
  cui due partite con lo stesso seme divergono (vedi anche `match-sequence` nel rapporto del giro 28). Va aperta una voce a parte.
- **Minuto prevedibile** delle schede di punteggio (75' per il pari 6 volte su 8): proposta sopra, **decisione del PO**.
- **Promessa dell'eroe** vuota quando la squadra non gli porta palla (in dieci, squadra bassa).
- **Scelte da panchinaro e rigore contro**: un solo rigore contro in 40 partite, nessuna partita da panchinaro: misure scarse.
- Il caso del censimento giro 44 «p14» ha **9** ingressi in highlight: 8 prima della scheda del 60' (fra cui due allo stesso minuto, una
  catena) e uno al 61'. Il ramo nuovo rispetta `_tetto7()`, che non conta rigori e catene; dal censimento **non posso confermare** quanti
  di quei 9 il contatore del tetto abbia contato.
- Le misure in partita sono headless col pilota: scelte automatiche, mai di una persona. Il «quanto si sente» va collaudato dal PO.
