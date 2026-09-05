# FASE 3 — IL DISEGNO DELLO SCAMBIO: il pallone segue le decisioni
*(progettato a mente fresca dopo 7.717; il bersaglio è il coseno decisione↔pallone da −0,26 a >0,5)*

## Il principio chirurgico
Non si riscrive il copione: si sostituisce, UNA MACCHINA ALLA VOLTA, il punto in cui la macchina
SCEGLIE dove mandare il pallone — oggi con euristiche proprie, domani chiedendo al decision engine
(`ms.decisione`). Il testo della riga resta (diventa racconto della decisione); il freno 7.498,
il turno 616, la custodia 693 restano intatti.

## Ordine delle macchine (dal costo minore)
1. **CATENA** (rk `catena`, ~3679): già costruisce passaggi passo-passo con un punteggio di
   ricevente (7.615: fw tetto 12, banda 8-18u) — CONVERGENTE per natura col decision engine.
   Scambio: il ricevente del passo = `ms.decisione.rcv` quando `act==='passa'` e il candidato
   è dello stesso lato; fallback all'euristica attuale se l'engine dice `conduci` (la catena
   avanza corta) o non ha linee. Rosso __CPM_NO718. Misura: coseno su accordo-717 (atteso >0,3
   già solo con la catena), righe-catena/partita invariati (banda guardiano manovra-viva ≥10).
2. **LIBRERIA** (rk `libreria`): righe di repertorio con bpos sorteggiato — scambio del bersaglio
   bpos con la destinazione della decisione (rcv o avanzata di conduzione). Più invasivo: la
   libreria è il volume grosso (38/60 righe di manovra).
3. **PIANI 649/695**: le famiglie diventano SELETTORI di racconto per una costruzione decisa
   dall'engine tick per tick (la vera morte del copione). Ultimo, perché tocca la custodia.

## Invarianti da difendere a ogni passo (bande esistenti)
turno-causale ≥90% · manovra-viva ≥10 · custodia mediana ≤12u · gol-con-manovra 100% ·
arrivi custoditi (arrivi-705) · fingerprint 00001505 · career-critical verde.

## Le misure nuove che autorizzano ogni scambio
- coseno decisione↔pallone (accordo-717): sale o non si spedisce.
- profilo passaggi (mediana 8-18u, linee pulite >85%) invariato o migliore.
- filmstrip a occhio su 2 mondi (il racconto resta leggibile).

## Rischi nominati
- La decisione ombra è calcolata sul tick PRIMA della riga (300ms di scarto): per la catena va
  ricalcolata nel punto della scelta, riusando la stessa funzione (estrarla in `decidi715(lato)`
  chiamabile, non copiata).
- Varianza run-su-run del mix (tira 10-36): bande multi-run (3 mondi) prima di dichiarare regressioni.

## Stato al 02/09 (7.718 → 7.727) — misure, non impressioni

| Bisturi | Cosa | Misura | Verdetto |
|---|---|---|---|
| 7.718 | il **primo passo** della catena lo indica `decidi715` (cancelli duri come rete) | adozione 5/6 aperture (poi 1-3 su 2-4 per partita nei banchi successivi) | vivo |
| 7.724 | l'**eroe** è ricevente reale della catena come passo finale (prob. 25% + 8%/punto coinv+intesa) | coinv 0 → 0/4 passi; coinv 3 + intesa 2 → 2/3; rosso → 0 | vivo, ma quasi sempre di scarico finché l'eroe stava fermo |
| 7.726 | l'eroe attacca la profondità col possesso nostro (tetto = linea difensiva del Match State) | eroe-linea max −1u; catena 4/5 passi con eroe davanti 2/5 (rosso 1/4, 0/4) | vivo |
| 7.727 | **tutti i passi** chiedono alla mente, con origine = portatore del passo | adozione k≥1: 0/3 e 1/5 (12,5%); righe 3 vs 3, 4 vs 5 | struttura, non guadagno |
| 7.728 | **passo di conduzione**: «conduci» = il portatore avanza 7u, origine virtuale per il passo dopo (mai ultimo passo, mai pressato, mai oltre x90) | conduzioni 3 e 2 per partita (pressati 1 e 1); catene 5/5 e 5/5 (rosso 6 e 5); righe 7 vs 8, 5 vs 5 | vivo; adozione dei passaggi k≥1 ancora 1/5 → v2: la conduzione non consuma il budget dei passi |
| 7.730 (**REVOCATA**, mai spedita) | la conduzione **fuori dal budget** dei passaggi (fino a due per catena, conduzione in coda tolta) | adozione passaggi k≥1 **0/4 e 0/4** (v1 1/5); catene aperte **3 e 3** (rosso 5 e 5); righe 2 e 4 (rosso 4 e 4); conduzioni 4+4 di cui 2 tolte in coda | peggio su tutte le misure: revocata, codice riportato alla 7.729 |
| 7.730 v3 (**spedita**) | **catena passo per passo**: corpo del passo in `_passoCatena730`, primo passo all'apertura, successivi al sito della riga sui 22 vivi | adozione decisioni k≥1 **2/5 (40%)** vs **1/11 (9%)**; continuazioni lazy 3+3; righe 7 vs 8; eroe 0 vs 1 | vivo; costo: 2/5 e 1/4 catene muoiono dopo il primo passo → prossimo: prima continuazione nel tick d'apertura |
| 7.731 (**REVOCATA**, mai spedita) | la struttura della libreria come **intenti** (verticale/filtrante/cambio/appoggio/conduci) realizzati da `_passoCatena730` sui 22 vivi, testo del modulo coi nomi decisi | 4 partite: **1 piano aperto, 0/2 intenti realizzati**; seme 2: azioni di libreria 1 vs 4, righe 3 vs 12 | revocata: nessun ricevente con geometria dell'intento e linea pulita — il collo è chi si smarca (Fase 4) |

**Perché il 7.727 non entra**: dal portatore avanzato la mente risponde «conduci» (nessuna linea pulita in avanti — criterio corretto), e la catena per costruzione **passa**. Il ripiego all'euristica è la catena che si ostina a passare dove la mente condurrebbe.

**Passo di conduzione (7.728, fatto; v2 «fuori budget» misurata e revocata)** — era il prossimo bisturi: quando la mente dice «conduci», il passo di catena diventa una conduzione (il portatore avanza 6-8u nel verso d'attacco, riga «X porta palla», bersaglio del pallone = il portatore) e al passo dopo si ridecide dalla nuova origine. Misure: quota di passi «conduci» adottati, lunghezza media della catena, righe di catena per partita, e — la vera — quota di passi con linea pulita (blk=0) contro l'euristica. Rosso dedicato. Solo dopo: la libreria (38/60 righe) e i piani.

**Metro del coseno**: resta squalificato (accordo-717: mediane −0,26→0,83 su 8 run). Serve il replay deterministico prima di riproporlo.

**Lezione della 7.730**: liberare la conduzione dal budget non aumenta i passaggi decisi — moltiplica le conduzioni (4 per partita, 3 pressate) e spezza le catene (aperte 5→3). La mente dice «conduci» perché davanti non c'è linea pulita, e portare palla di 7u non la crea: dopo la conduzione la risposta resta «conduci». Il collo di bottiglia è a monte: **chi si smarca** (Fase 4, off-ball dei compagni verso il portatore), non la catena. Prossimo bisturi: un compagno che, quando la mente del portatore dice «conduci», attacca uno spazio libero davanti (bersaglio del deployment), così al passo dopo la linea esiste. Misura: adozione dei passaggi k≥1 e catene aperte, con lo stesso banco.

**Lezione della 7.730 v3**: la mente decide bene quando giudica posizioni vere. Il collo di bottiglia della Fase 3 era l'istantanea, non i cancelli. Da qui la libreria (38/60 righe) può nascere dalla stessa funzione di passo, riga per riga.

**Lezione della 7.731**: un piano di intenti presuppone che davanti ci siano linee da realizzare; oggi non ci sono (è lo stesso «conduci» che la mente ripete). Prima la Fase 4 — i compagni che si smarcano verso il portatore e negli spazi — poi la libreria potrà nascere dalla decisione. Fino ad allora la libreria resta narrazione che segue il pallone (fondatezza 89,7%).

## Fase 4 — primo tentativo (7.733 «chi si smarca», REVOCATO, mai spedito)

**Idea**: quando la mente del portatore dice «conduci», un compagno attacca un punto libero 12u davanti a lui (dritto o sulle diagonali, nessun avversario entro 4u), passo 0,30, per tre minuti.

| Versione | Aggancio | Misura (2 semi, ON vs rosso) | Verdetto |
|---|---|---|---|
| v1 | Match State «conduci» + `carrierRef` | seme 1: 0 elezioni; seme 2: 21 elezioni; adozione k≥1, righe e quota «conduci» invariate (0,20 vs 0,19 · 0,22 vs 0,23) | scollegata dal passo |
| v2 | eletto dal **passo di catena** (carry/stop), 3' di validità | seme 1: 2 elezioni, righe 8 vs 7, adozione 1/4 vs 1/3, quota 0,19 vs 0,20; seme 2: 28 elezioni, tutto identico | nessun effetto |

**Lezione**: un uomo che corre in un punto libero non cambia una decisione presa alla riga, e gli eventi di catena sono 1-8 a partita: campione troppo piccolo per vedere qualcosa. La grandezza da muovere è continua — la **quota di tick di possesso nostro in cui `decidi715` trova un «passa» pulito** (oggi ~0,80, complemento della quota «conduci» 0,19-0,23) — e la leva è **strutturale**: i 21 di corsia stanno fermi in linee che non offrono linee di passaggio; serve un modello di posizionamento in possesso (ampiezza, profondità scaglionata, appoggio dietro il portatore) che agisca su tutto il reparto, non su un eletto. Da misurare col Match State (quota «passa», linee pulite per tick) prima di toccare la catena.

## Fase 4 — la base misurata (sonda `linee-734`, GLB ON, tick di possesso nostro a palla viva, 300 ms)

| Grandezza | Valore (7.732) |
|---|---|
| tick di possesso aperto per partita | 56-65 |
| linee pulite in avanti per tick (compagno avanti ≥2u, raggio 4-40, nessun avversario entro 3,5u dal segmento) | media **0,7**, mediana **0** |
| quota di tick con **almeno una** linea pulita | **0,23-0,25** |
| quota di decisioni «passa» (dove la mente decide) | 0,59-0,65 |

**7.734 (REVOCATA, mai spedita)** — la forma dei reparti (larga/compatta, scivolamento) faceva capo alla percentuale di possesso e non al turno: corretta per lettura, ma la misura non si muove (0,68 vs 0,71 · 0,25 vs 0,23 · 0,65 vs 0,59). La forma non è il collo: lo sono le **corsie fisse** dei 21 (ancore per reparto + scivolamento ball-side), che non producono uomini in avanti con linea libera.

**Il bersaglio della Fase 4**: portare la quota di tick con almeno una linea pulita da 0,25 a ≥0,60 con un modello di posizionamento in possesso (profondità scaglionata a ventaglio davanti al portatore, ampiezza sui due lati, appoggio dietro), misurato con questa sonda prima di toccare qualunque catena. Solo dopo: piani e libreria dalla decisione.

### 7.735 — il ventaglio in possesso (spedita)

Per il lato col turno, mezzali e punte prendono bersagli a ventaglio rispetto al pallone (punte +16/+18u ±22, mezzali +7/+7/−6u ±11), tetto = linea difensiva avversaria −2u, passo 0,20; difesa e lato che difende restano in corsia. Rosso `__CPM_NO735`.

| Seme | quota tick con ≥1 linea (ON vs rosso) | linee/tick | «passa» | tick possesso aperto |
|---|---|---|---|---|
| 1 | **0,40 vs 0,19** | 1,04 vs 0,65 | 0,71 vs 0,67 (n 100/21) | 134 vs 54 |
| 2 | **0,43 vs 0,34** | 1,82 vs 0,95 | 0,64 vs 0,55 (n 95/100) | 146 vs 151 |

Bersaglio 0,60 non ancora raggiunto: prossime tacche su ampiezza/scaglionamento, poi rimisurare l'adozione della catena (k≥1) e i piani.

### 7.736 — la seconda tacca del ventaglio (REVOCATA, mai spedita)

Punte ±26u a +18/+22, mezzali +11/−6/+5u ±14, terzini (corsie 1 e 4) +6u verso il pallone. Rosso `__CPM_NO736` = valori 7.735. Stessa sonda `linee-736` (GLB ON, 300 ms), due semi, ognuno ripetuto due volte.

| Seme · tornata | quota tick con ≥1 linea (ON vs rosso) | linee/tick | «passa» | tick possesso aperto |
|---|---|---|---|---|
| 736 · 1 | 0,33 vs 0,38 | 1,33 vs 1,83 | 0,66 vs 0,78 | 87 vs 64 |
| 736 · 2 | 0,40 vs 0,39 | 1,87 vs 1,79 | 0,78 vs 0,78 | 62 vs 66 |
| 7362 · 1 | 0,43 vs 0,39 | 2,37 vs 2,30 | 0,54 vs 0,50 | 54 vs 56 |
| 7362 · 2 | 0,38 vs 0,41 | 1,96 vs 2,54 | 0,46 vs 0,46 | 56 vs 56 |

Media ON 0,385 vs rosso 0,393: la tacca 2 non batte la tacca 1, quindi si torna alla 7.735 (strangler). Due lezioni a verbale:
- **Il rumore fra ripetizioni dello stesso seme è ±0,07** sulla quota (campionamento a 300 ms su un clock reale, non deterministico). Da oggi una differenza sotto 0,10 su un solo seme non è una misura: servono due semi × due tornate, o un seme lungo.
- Il bersaglio 0,60 non si raggiunge allargando il ventaglio: le linee non sono chiuse dalla larghezza ma dai difensori che rientrano sui bersagli (contesa 706 e ombra 720 hanno la precedenza sul ventaglio, e la difesa avversaria segue la linea `awayDepth`). La prossima tacca deve lavorare sul lato che difende, non su chi attacca.

## Fase 3 — 7.737 «la trama esegue la decisione» (REVOCATA, mai spedita)

Idea: a ogni nuova giocata della trama (possesso ambientale) il ricevente lo sceglie `decidi715` invece della vicinanza (8u) al waypoint sorteggiato. Rosso `__CPM_NO737`, nessuna estrazione nuova. Sonda `trama-737` (GLB ON, 300 ms, tick di possesso nostro a palla viva), due semi.

| Seme | giocate trama | passaggi veri (A4.pass) | palla ai piedi ≤4u (ON vs rosso) | portatore vivo, dist. mediana | fascia centrale ±15u | guadagno x/tick |
|---|---|---|---|---|---|---|
| 737 | 10 | 5 vs 3 | **0,32 vs 0,38** | 55/95 · 15,5u vs 54/88 · 14,8u | 0,94 vs 1,00 | 1,16 vs 1,26 |
| 7372 | 10 | 6 vs 1 | **0,18 vs 0,36** | 60/102 · 14,0u vs 55/98 · 16,5u | 0,88 vs 0,85 | 1,24 vs 1,31 |

Revocata: più passaggi «veri», ma la palla ai piedi cala su entrambi i semi e il guadagno per tick non sale. La lezione che vale più della tacca: **la trama fa 10 giocate a partita**, non è lei a muovere il pallone. Il portatore logico sta a ~15u dalla palla in tutti e quattro i regimi e la palla vive nel terzo centrale del campo (0,85-1,00 dei tick): questi sono i numeri dell'attuale «flusso», e nessuna scelta del ricevente su 10 giocate li sposta. Il bersaglio del pallone lo scrivono le righe della cronaca (`ballTargetRef = ev.bpos`, sito ~r.4657) e le macchine: la decisione va collegata **lì**, dove il comando avviene, non nella trama.

Banco catena-735 (adozione della catena col ventaglio, ON vs rosso NO735, due semi): 2-3 catene a partita in ogni regime, k≥1 decisi 0-1 su 2, righe catena 3. Il ventaglio non muove la catena; con 2 catene a partita l'adozione non è misurabile. La catena si apre solo dal sito della riga ogni ≥6' (protezione del guardiano bg-decision), mentre `decidi715` produce ~27 «passa» a partita che nessuno esegue.

Diagnostica `blocco-737` (seme 737, 57 tick): bloccanti per reparto ospite B 15 · M 40 · F 7; linee pulite verso F 63/104 (0,61, ricevente a −7,6u dalla linea difensiva), verso M 83/104 (0,80, −17u), verso B 86/86. La linea la chiude il centrocampo che difende, non la difesa: la prossima tacca di Fase 4 lavora su come la mediana avversaria scala, non sull'ampiezza del ventaglio.

## Fase 3 — 7.738 «il portatore decide al tick» (SPEDITA, v3)

Censimenti prima di scrivere (GLB ON): `scrittori-738` (24 comandi da riga, 7 giocate trama, 88 «passa» mai eseguiti), `gate-738` (31 righe al sito della riga: 27 di macchina, 0 pure in gioco aperto), `morto-738` a cadenza reale 1700 ms (gioco aperto 0,39 · costruzione 0,37 · palla morta 0,24). Revocate con la misura: v1 al sito della riga (1 riga utile in 66'), v2 col solo portatore-stato (mai scattata: 11-12 tick vivi su 82-85).

v3: nel tick di stato, in gioco aperto, il compagno con la palla ai piedi (≤3,5u) è eletto portatore al tick logico e, con ritmo ≥6 tick, esegue «passa» della mente entro 30u (palla verso i piedi del ricevente, che diventa portatore). Rosso `__CPM_NO738`.

| Seme | palla ai piedi ≤4u (ON vs rosso) | portatore vivo | dist. portatore-palla mediana | x palla mediana | guadagno/tick | passaggi eseguiti |
|---|---|---|---|---|---|---|
| 737 | **0,40 vs 0,32** | **44/85 vs 12/85** | **12,5 vs 26,6u** | 41 vs 32 | 1,01 vs 0,81 | 8 |
| 7372 | **0,35 vs 0,22** | **43/86 vs 12/85** | **6,8 vs 13,5u** | 39 vs 35 | 0,43 vs 0,82 | 6 |

Dichiarato: guadagno per tick misto; fascia centrale ferma (0,87/0,67 vs 0,86/0,61); i passaggi della mente non hanno ancora una riga che li descriva (prossimo passo §12). In autoplay a 300 ms/min il sito vede ~100 tick; a cadenza reale ~5,7× di più.

## Fase 3 — 7.739 «la riga descrive un fatto già avvenuto» (SPEDITA, v3)

Il passaggio eseguito dalla mente (7.738) genera la propria riga di telecronaca dal punto in cui parte (addCom, senza `bpos`, vocabolario della catena, cognomi veri, ritmo ≥4'). v1/v2 al sito della riga di cronaca mai spedite: 30 visite a partita, 25 con una macchina che parla, fatto fresco 1/10 (gate-739). Sonda `fatto-739` (seme 739, 300 ms): ON 4 passaggi → 4 righe-fatto, repertorio 6 (rosso 5), libreria 15, catena 7. Non verificato: la resa a cadenza reale sul telefono (numero di righe-fatto per partita atteso ≥ quello in autoplay perché il tick esegue più passaggi).

## Fase 4 — 7.740 «il ricevente cerca la luce» (REVOCATA) e la base che si è spostata

Bersagli del ventaglio spostati in y (±6/±12u) quando un avversario chiude la linea dal pallone. Sonda `linee-736` con rosso `__CPM_NO740`, due semi:

| Seme | quota tick con ≥1 linea (ON vs rosso) | linee/tick | «passa» | tick possesso aperto |
|---|---|---|---|---|
| 740 | 0,80 vs 0,74 | 4,13 vs 4,03 | 0,91 vs 0,87 | 127 vs 122 |
| 7402 | 0,85 vs 0,89 | 4,27 vs 5,18 | 0,95 vs 0,89 | 131 vs 97 |

Dentro il rumore (±0,07): revocata. **Il numero che conta è il rosso**: prima della 7.738 la quota con ≥1 linea pulita era 0,19-0,43 (base 0,23-0,25, ventaglio 0,40-0,43); ora è 0,74-0,89 e le linee per tick sono 4-5 contro 0,7-1,8. La Fase 4 aveva come bersaglio 0,60: lo ha raggiunto la Fase 3 (7.738), perché il collo non era la forma della squadra ma la palla su erba vuota, lontana da tutti (portatore vivo 12/85, distanza mediana 13-27u). Con la palla ai piedi di un uomo, i compagni scaglionati dal ventaglio 7.735 hanno linee reali. Lezione: misurare la forma prima di dare al pallone un padrone era misurare il vuoto.

## Fase 6 — 7.741 «l'eroe è uno dei ventidue al tick» (SPEDITA, numeri piccoli dichiarati)

Eroe portatore (palla ai piedi ≤3,5u → decide lui) e ricevente con la stessa legge di `decidi715`. Sonda `eroe-741`, due semi, ON vs rosso `__CPM_NO741`: dati 1/1 vs 0/0 · ricevuti 0/0 (cand 0/1) · eroe-palla mediana 21-22u vs 20-30u. Verificato che l'autoplay gira alla cadenza reale (1,7 s/min): il gioco aperto col nostro turno vale 33-48 tick di stato a partita (~30 s reali), il sito decide 2-5 volte. Non batte un vecchio: apre l'eroe al mondo dei 22. Prossimo: ritmo della mente e disponibilità dell'eroe nel flusso.

## Fase 3 — 7.742 «ritmo della mente 6→3 tick» (REVOCATA)

Sonda `passa-738` con rosso `__CPM_NO742` (=6 tick), due semi: eseguiti 3 vs 3 e 3 vs 3; pronti 10 vs 9 e 4 vs 3 (i tick in più decidono «conduci» 7 vs 6); palla ai piedi 0,11 vs 0,12 e 0,08 vs 0,13. Il ritmo non è il collo. Il collo è la **disponibilità**: in queste due partite la palla sta ai piedi di un compagno solo nell'8-13% dei tick aperti (portatore vivo 5/27 e 8/60), contro il 32-40% delle partite del banco 7.738: la varianza fra partite è grande, e va censita prima di un'altra tacca (chi è il più vicino al pallone e a quanto sta).

## Fase 3 — 7.743 «il più vicino va a prendere la palla» (SPEDITA)

Censimento `vuoto-743`: pallone fermo in gioco aperto (spostamento/tick 0), compagno più vicino a 6u (mediana), entro 8u nel 78-81% dei tick. Raccoglitore entro 10u → bersaglio = palla (precedenza su ventaglio e corsie), scade dopo 12 tick; all'arrivo l'elezione 7.738. Rosso `__CPM_NO743`.

| Seme | palla ai piedi (ON vs rosso) | portatore vivo | dist. mediana | eletti | eseguiti | guadagno/tick |
|---|---|---|---|---|---|---|
| 743 | **0,32 vs 0,26** | 34/99 vs 33/99 | 12,8 vs 12,8u | 11 vs 6 | 5 vs 5 | 1,34 vs 1,34 |
| 7432 | **0,50 vs 0,27** | **81/113 vs 32/100** | **5,7 vs 15,2u** | 12 vs 7 | 7 vs 5 | 0,67 vs 1,35 |

Dichiarato: il guadagno per tick cala sul secondo seme (la palla con un padrone che cammina avanza meno di una palla che vola verso un punto). Prossima tacca: «conduci» eseguito.

## Fase 3 — 7.744 «conduci eseguito» (REVOCATA)

Il portatore avanza 7u quando la mente dice «conduci» e non è pressato. Sonda `passa-738` con rosso `__CPM_NO744`, due semi: «conduci» deciso 2 e 3 volte a partita, **sempre col portatore pressato (<5u)**: eseguiti 0, pressati 2 e 3; ON identico al rosso sul primo seme. La mente dice «conduci» solo quando non ha linee, cioè sotto pressione: lì la conduzione è una perdita e l'azione giusta (scarico protetto, contesa 706) è materia delle Fasi 5/7, non di questa tacca.

## Fase 6 — 7.745 «l'eroe si offre a distanza di ricezione» (REVOCATA)

Bersaglio dell'eroe nel flusso (7.726) con y che scivola verso la palla e x ≤ pallone+16u. Sonda `eroe-741` con rosso `__CPM_NO745`, due semi: eroe-palla mediana 19,3 vs 18,1u e 19,7 vs 20,4u; candidato 8 vs 6 e 9 vs 8; ricevuti 0 vs 0 e 1 vs 0; dati 1 vs 1. Nessun effetto: revocata. Dato utile: con la 7.743 l'eroe è già candidato 6-9 volte a partita e perde il confronto col miglior compagno (stessa legge).

## Fase 6 — 7.746 «l'intesa pesa» (REVOCATA)

Bonus fino a +8 (2 per unità di coinv+intesa) sul punteggio dell'eroe come ricevente. Sonda `eroe-741` con rosso `__CPM_NO746`, due semi: bonus **0 in tutte e quattro le partite** (coinv e intesa restano a zero in autoplay: l'eroe non riceve, quindi non matura intesa, quindi non riceve). Ricevuti 0 vs 0 su entrambi i semi, candidato 3 vs 3 e 3 vs 4. Effetto nullo per costruzione: revocata. Lezione: la memoria narrativa in gioco aperto è vuota finché l'eroe non entra nelle scene; il coinvolgimento in gioco aperto va seminato dalle scene (Fase 5), non dal tick.

## Fase 7 — censimento del vincolo adv≥48 (sonda `occ-747`, due semi)

Tick aperti con threat ≥58: 12 e 2 (3 e 1 minuti distinti); **con adv<48: 0 e 0**. Il vincolo di compatibilità del 7.714 non perde alcuna finestra reale: non è un problema da risolvere. Il sito delle occasioni fa 87 giri a partita: out 40-42, contropiede 15-18, costruzione del gol 9, kickoff 6, finestre aperte 5-6. Le palle morte occupano quasi metà dei giri: è la palla morta (24-33% dei tick), non il vincolo, a comprimere il pericolo.

## Fase 10 — 7.747 il guardiano della mente (SPEDITA)

Tre bande in `partita-vera-guardian.mjs`: mente-esegue (≥1/partita), riga-descrive (≥1/partita), raccoglitore (≥2/partita). ON: 6 · 6 · 16 su due partite. Rosso `CPM_ROSSO=__CPM_NO738`: 0 · 0 · 0, tre bande violate, il resto verde.

## Fase 5 — 7.748 «la zona è reale» (SPEDITA)

Difetto trovato misurando: le conseguenze di scheda applicavano solo marcatura e intesa (zona/coinv/fiducia mai). Fix: zona 1 dal 17' su due semi vs 0 nel rosso. Effetto sul campo: bersaglio dell'eroe in fascia lato palla; |y-50| 5u → 9-10,5u (base interna piccola), zonaVista 4/partita; mi_eco1 esce solo con zonaVista≥3. Dichiarato debole sul campo, netto in memoria.

## Fase 5/6 — 7.749 «l'intesa pesa» (SPEDITA, rifacimento misurato della 7.746)

Censimento `memoria-749` nel regime corretto delle scelte: coinv 8, intesa 2-5, fiducia 2-4, 5 schede/5 scelte a partita (la 7.746 era stata misurata nel regime senza scelte: bonus 0). Bonus fino a +8 sul punteggio dell'eroe come ricevente. Sonda `int-749`, due semi, ON vs rosso `__CPM_NO749`: ricevuti 2 vs 0 e 2 vs 1; candidato 6 vs 7 e 6 vs 4; eseguiti 8 vs 8. Dichiarato: numeri piccoli, distanza eroe-palla invariata.

## Fase 8 — censimento della festa del gol (sonda `celeb-750`, GLB ON, due semi)

Strumento temporaneo su `fireGoalCeleb` (da dove parte: rete rilevata dal renderer / fallback a orologio 5200 ms). Un solo gol dell'eroe in due partite: la festa è partita dalla rilevazione in rete dopo 3,9 s; il fallback non è mai scattato. Con n=1 non c'è un difetto da correggere in headless; il caso «fallback prima della rete» resta possibile solo su telefoni lenti con GLB ON e va collaudato lì (non verificato). Strumento rimosso, nessuna release.

## Fase 10 — stabilità delle bande della mente su 4 partite

`CPM_PARTITE_G=4 node partita-vera-guardian.mjs`: mente-esegue 12 (banda 4), riga-descrive 12 (banda 4), raccoglitore 33 (banda 8); tutte le altre bande verdi (manovra-viva 136, gol-con-manovra 9/10, custodia 5,7u). Margine ≥3× sotto il misurato: le bande non sono sul filo.

## Fase 9 — censimento «righe fondate» sulla 7.749 (fondate-558, semi 7300/7337)

Fondate 88,2% e 71,0% (soglie dichiarate ≥90%); smentite 13/114 = 11,4% (≤5%). Per famiglia: zona 62/63, tiro 12/12, possesso 3/3, **destinazione 38/51**. Le 13 smentite sono tutte destinazioni: righe di recita (contropiede, difesa, manovra) che dichiarano un punto a 17-71u e trovano il pallone altrove. Il freno 30u non c'entra (le recite ne sono esenti dal 7.655): dopo il 7.738/7.743 il pallone segue un UOMO (portatore, raccoglitore, ricevente della mente) e il punto della riga perde. È la stessa fonte di verità che la missione chiede: la riga deve dichiarare l'uomo, non il punto. Riguarda le macchine di recita a punto fisso (counter, manovra-gol, ponte): materia di Fase 2 (i piani come uomini), non di una tacca. Nessuna release.

## Fase 2 — 7.750 «il contropiede è un uomo che corre» (SPEDITA, vince di misura)

Corridore eletto all'armamento, schieramento che lo manda avanti 5u/tick, palla che lo segue (7.642), righe finali sull'uomo. Fondate-558 appaiato (7300/7337) ON vs rosso `__CPM_NO750`: fondate 78,1/75,0 vs 75,0/71,9; smentite 12,5% vs 14,2%; destinazioni 30/43 vs 28/44; custodia invariata. Dichiarato: +3,1 punti su entrambi i semi, dentro il rumore fra tornate; spedita per direzione concorde e coerenza (una sola autorità sul pallone).

## Fase 2 — manovra-gol (piano 649): letta, nessuna tacca

Il piano-gol nomina già l'uomo di ogni passo (`chi`) e lo porta sul punto dichiarato: è uomo+punto, coerente col 7.750. Le sue smentite nel censimento (es. 18' attack_goal: riga a (78,84), pallone a (94,50)) sono conflitti di MINUTO col gol del microsim (la palla è già in porta quando la riga del passo esce), non punto-contro-uomo. Resta il ponte (scorta alla scena), che è a punto per natura (la scena nasce in un punto). Chiuso il giro «le recite dichiarano l'uomo»: contropiede fatto (7.750), manovra-gol già conforme, ponte per natura a punto.

## Fase 9 — nota sul piano-gol (non spedita)

Le due smentite «attack_goal 18'» sono passi del piano-gol (famiglia fascia) che chiedono 28u laterali in due tick a 4u/tick: il gol parte col tetto dei tick (passi+4) prima che il pallone arrivi al punto dichiarato. Rimedio possibile: punti di passo a portata (fascia 30/70 invece di 22/78) o velocità del passo; n=2 su due partite, sotto la soglia per una misura. A verbale, non spedita.

## Collaudo PO 03/09 (sulla 7.719) → 7.751

Rilievi: striscioni accavallati, nessun cambio campo, azioni pericolose confusionarie, tiri da distanza siderale. Il collaudo era sulla 7.719 (`main` prima della promozione): il cambio campo è la 7.732, ora su main con la 7.750. **7.751**: (a) i due drappi ultras della tribuna lunga erano piani da 30u con centri a ±12u, sovrapposti di 6u (scritta del secondo tagliata): larghezza parametrica, 23u, spazio 1u, verificato con scatto GLB ON del provino («SELEZIONE GRANATA» intero); (b) cinque situazioni di tiro nascevano a x 58-68 (32-42u = 34-44 m dalla porta) con testi «30 metri»/«al limite»: partenza a x 68-78 (62-72 per il portiere fuori dai pali). Aperto: «azioni pericolose confusionarie», da ricollaudare sulla 7.750+ con partita e minuto.

## Fase 5 — 7.752 «la fiducia pesa sull'esito» (in rituale)

`fiducia` entra nel tasso di riuscita di handleAction: +2 punti per unità, fra −6 e +8, con riga nel feedback causale. Sonda `fid-752` (regime corretto, GLB ON, seme 752): fiducia finale 2, azioni 2, modificatore 0 sulla prima (prima della scheda) e +0,04 sulla seconda. Meccanismo verificato; l'effetto sugli esiti è per costruzione (le prove del gate girano con fiducia 0).

## Fase 9 — 7.753 «fascia del piano-gol a portata» (REVOCATA)

Fascia del piano-gol da y 22/78 a 30/70. Fondate-558 appaiato (7300/7337) ON vs rosso `__CPM_NO753`: fondate 68,8/79,4 vs 68,8/78,1; smentite 17/123 vs 17/121; le tre smentite «attack_goal» (18', 67', 79') sono identiche nei due regimi. La riga del 18' dichiara (78,7 · 83,9): non è il piano-gol (la sua fascia con jitter arriva a 82), è un altro scrittore, da censire. Nessun effetto: revocata.

Nota sul censimento fondate: le due righe del 18' chiedevano 2-6u di spostamento (il pallone era lì quando sono uscite) e la finestra 18'-19' del giudice vede poi il pallone in rete (94,50): sono righe vere all'emissione, «smentite» dal gol che segue nella stessa finestra. È un limite del metro, non un difetto del gioco; le soglie 90%/5% vanno rilette al netto dei gol nella finestra.

## Fase 2 — 7.754 «il renderer esegue il portatore dello stato» (in rituale)

Il portatore-stato viaggia in allPlayers (`_carr754`); nell'elezione del padrone della palla-mesh (7.555) vince lui se sta entro 14u dal punto logico, la vicinanza decide solo quando lo stato tace. Sonda `por-754` (GLB ON, seme 754), ON vs rosso `__CPM_NO754`: elezione dallo stato 279 fotogrammi, dalla vicinanza 1378; distanza palla-mesh↔portatore-stato mediana 5,7u vs 6,5u; entro 4u 0,46 vs 0,38. Secondo seme in corsa.
Secondo seme (7542): mediana 9,3u vs 5,5u, entro 4u 0,23 vs 0,41 — contrario al primo. Misura mista su due semi: **7.754 REVOCATA**. Lezione: la palla-mesh ha altri scrittori (arrivi 7.526, «detto» 7.556, colla dell'eroe) e imporre il portatore-stato per 14u tira la palla verso un uomo che la mesh non ha ancora raggiunto. Il renderer come puro esecutore va fatto sugli arrivi (chi riceve nel logico riceve nella mesh), non sull'elezione a distanza.

## Fase 10 — 7.755 banda «nomi-veri» (SPEDITA)

Il guardiano legge la rosa dei 22 per partita e chiede che ogni riga-fatto contenga un cognome della rosa: 7/7 su due partite (rosa 19 nomi). Non giudicabile sotto 2 righe-fatto.

## Fase 2 — arrivi del renderer: letti, nessuna tacca

L'arco ambientale (7.526) consegna già la palla-mesh all'uomo NOMINATO dalla riga (7.546, `_ba.rcv`) e il passatore nominato è il portatore del fotogramma in cui l'arco parte (7.556). I passaggi della mente (7.738) puntano la posizione del ricevente: la vicinanza alla destinazione elegge lui. Il renderer esegue già gli arrivi dello stato; quello che non deve fare è eleggere a distanza (7.754, revocata).

## Fase 10 — 7.756 banda «tabellone» (SPEDITA)

Gol del libro mastro per lato = punteggio finale del Match State: 1-2 vs 1-2 su due partite. Non giudicabile senza il punteggio di ogni partita.

## Fase 2 — 7.757 «il piano-gol nasce dalla mente» (REVOCATA)

I tre uomini della manovra-gol scelti dallo stato (portatore) e dalla mente (decidi715 a catena) invece del sorteggio. Testimoni: 4 piani, a dallo stato 4/4, b dalla mente 3/4, c 3/4. Fondate-558 appaiato (7300/7337) ON vs rosso `__CPM_NO757`: fondate 75,7/71,9 vs 81,3/82,4; smentite 14,0% vs 9,8%; destinazioni 32/50 vs 34/45. PEGGIO: gli uomini della mente stanno lontani dai punti fissi della famiglia, e la riga che li nomina sul punto è più spesso smentita. Revocata. Lezione: uomini dalla mente e punti di famiglia non si combinano; il piano va rifatto per intero (uomini E punti dal campo), non a metà.

## Collaudo PO 03/09 18:01 «pannello nero dietro la porta» → 7.758

Cartellone centrale dietro la porta nero senza scritta (Coppa, GLB ON, scena ASSIST). Firma 7.535: texture non allocata = mesh nera. Non riproducibile in headless (0 texture nere su 99). Rimedio: cartelloni e drappi consegnati alla GPU a metà lato senza mipmap. `__CPM_DECOR` ON vs rosso: 25,5 MB vs 30,7 MB (−17%), 11 cartelloni 1024×160 → 512×80. Residuo censito: 8 texture 1024×512 (16 MB), 2 LED 2048×128. Da confermare sul telefono.
Residuo censito: le 8 texture 1024×512 sono i teli della folla (src/10 `quality.texWMobile:1024, texH:512`), 16 MB sul telefono, con mipmap. Prossima tacca di memoria possibile: `texH` 512→384 (−4 MB) o mipmap limitate; da fare solo se il PO conferma che il pannello nero persiste dopo la 7.758.

## 7.759 — il gol subito nella scena difensiva non entrava nel libro mastro (trovato dal guardiano a 4 partite)

Banda «tabellone» su 4 partite: raccontati 2-4, punteggio 2-5. Dei cinque scrittori del punteggio, `goal_against` (scena difensiva dell'eroe) era l'unico senza `cpmEv("goal")`. Corretto. Misura: guardiano a 4 partite dopo il fix (sotto).
Dopo il fix, guardiano a 4 partite: tabellone gol raccontati 2-5 = punteggio 2-5; le altre bande verdi (mente 16, righe-fatto 14, raccoglitori 51, nomi-veri 14/14, gol-con-manovra 4/7).

## Regressione — salti della palla-mesh dopo la custodia a uomo (ball-jump-census sulla 7.759)

8 salti su 1941 fotogrammi, tutti dentro lo stacco nero (0 visibili): 5 consegne (7,2-17,9u), 3 avvicinamenti (6,2-23,9u). Copertura 7 scene su un minimo di 13: il censimento non giudica, ma non c'è un salto visibile. Nessuna regressione osservata; non verificato a copertura piena.

## 7.760 — metro fondate affinato: un gol nella finestra non è una smentita

fondate-558 legge ora i minuti dei gol dal libro mastro: una destinazione non centrata con un gol nella finestra va in un conto a parte. Corsa sui semi 7300/7337: destinazioni con gol nella finestra **0**, quindi le smentite del 18' (pallone a 94,50) non sono gol ma esiti di scena dell'eroe (tiro parato/fuori: la palla vola alla linea di porta). Fondate 78,8/71,9, smentite 14,2%. Il metro va esteso agli esiti di scena nella finestra: prossimo passo.

## 7.761 — ogni esito di scena nel libro mastro (cpmEv «esito») + metro fondate esteso

Prima stesura errata (evento solo nel ramo goal_against) fermata e corretta: l'evento si scrive prima delle statistiche, per ogni esito. Fondate-558 sui semi 7300/7337: fondate 71,9/74,2, smentite 14,0%; destinazioni con gol o esito nella finestra: **0**. Le smentite residue non sono tiri né gol: sono derive (un altro scrittore sposta il pallone dopo la riga). Il metro resta più onesto; la percentuale non cambia. Non regredisce nulla.

## Fase 10 — 7.762 banda «esiti-registrati» (SPEDITA)

≥2 esiti di scena per partita nel libro mastro: 7 su 2 partite. Undici bande nel guardiano.

## Fase 10 — stabilità delle 11 bande su 4 partite (7.762)

mente 16 · righe-fatto 14 · raccoglitori 52 · esiti 14 · tabellone 2-5 = 2-5 · nomi-veri 14/14 · gol-con-manovra 4/7 · custodia 6,1u · manovra-viva 121 · arbitro 51 · turno-causale 96%. Tutte verdi, margine ≥1,75× sotto il misurato sulle bande della mente.

## 7.763 — metro fondate: cambio di turno nella finestra a parte

fondate-558 conta ora a parte le destinazioni con un cambio di turno dopo la riga: **0** casi (come gol ed esiti). Fondate 88,2/75,0, smentite 12/128 = 9,4%. Le smentite residue sono derive pure: un altro scrittore sposta il pallone senza gol, tiro né recupero. Il metro è completo; resta il fatto.

## Revisione da spettatore delle «azioni pericolose» (seme 764, 16 fotogrammi GLB ON)

Due costruzioni del gol (28' e 72') fotografate a 8 scatti l'una. Nessun caos di giocatori: campo ordinato, scheda del mister sovrapposta, 5-11 giocatori in quadro. Scatti notevoli: 38'-39' con la tribuna a metà schermo e i giocatori in una striscia lontana (azione sulla linea opposta, camera di cronaca a quota 20); 83' con il pallone solo in un prato vuoto. Sonda camera su 2 semi: elevazione mediana 26°, tratti sotto 12° = 0,2% e 1,6% del tempo. **Il caos di giocatori non c'è; il difetto sta nell'inquadratura del pallone** (sotto).

## 7.766 — il pallone resta nel quadro (SPEDITA dopo prova del rosso)

Sonda strutturale (ballchk, 0'-30'): pallone fuori quadro 44/120 campioni; fotogramma 11': sette giocatori in corsa e la didascalia del passaggio, pallone fuori a sinistra. Geometria: cronaca a z 38 quota 20 con sguardo a 0,30·bz → sulla linea vicina (gy>85, angoli) il pallone cade 40° sotto il centro (il quadro ne regge 23); saliente (7.695) a z 27 con lo sguardo tappato a ±18 → pallone alle spalle (20/20 campioni «dietro» al 14'); nella ripresa (7.732) lo sguardo torna alla formula pesata sull'eroe e il pallone resta fuori per 13-15 minuti (71'→84' seme 764, 59'→74' seme 765).
Rimedio (rosso `__CPM_NO766`): lo sguardo scende verso il pallone oltre z 14 e non lo lascia mai a più di 6 unità sull'asse lungo; la saliente arretra e sale con il pallone oltre z 12.
Misura appaiata (quadro-766.mjs, GLB ON, cadenza reale, ~565 campioni a partita):

| seme | in quadro ON | in quadro rosso | fascia vicina ON/rosso | tratto max ON/rosso |
|---|---|---|---|---|
| 764 | 85,9% | 66,0% | 59% / 8% | 24 / 72 |
| 765 | 77,5% | 75,9% | 75% / 55% | 24 / 60 |

Pooled: 81,7% vs 70,9%; fascia vicina 62% vs 21%. **Non provato**: la mano saliente in zona centrale (43% vs 48%, n 69/116) — dichiarato. Residuo aperto: tratti di 10-24 campioni in x nella ripresa (79'→83' seme 764), da guardare col lerp dello sguardo. Lezione di metodo: la sonda camera con `__CPM_REC` acceso senza drenare il buffer rallenta la partita di 5× (30 min reali, fermo 89%): misure a cadenza reale solo senza REC.

## 7.767 — i margini del quadro seguono la distanza (SPEDITA dopo prova del rosso)

Residuo del 7.766 tracciato con la sonda lag-767 (seme 764, 654 campioni): 105 fuori quadro, 99 con palla LENTA (<12 u/s) e sguardo 10-12 unità lontano dal pallone per minuti. Non era il fotogramma (fps headless 46-56, mediana 50,6): hook test-only `__CPM_CAMT767` (bersagli della regia prima del liscio) → il bersaglio del 7.766 era RAGGIUNTO (look z 25,6 = bersaglio) ma il pallone stava a ndc y −1,06 (un soffio sotto) e a ndc x 1,29: la tolleranza fissa di 6 unità in x è più larga del semiquadro sull'angolo vicino (3,8 unità a z 32,6). Rimedio: coefficiente z 0,85→1,0; margine x = 0,14·(38−z) fra 1,5 e 6.

| seme | in quadro 7.767 | rosso | fascia vicina | tratto max |
|---|---|---|---|---|
| 764 | 88,5% | 78,1% | 83% / 35% | 27 / 52 |
| 765 | 87,7% | 77,2% | 70% / 38% | 21 / 40 |

Residuo dichiarato: tratti di 15-27 campioni nella ripresa (79'→84') con palla veloce (30 u/s): transitori del liscio (kl 0,12 a fotogramma), non del bersaglio. Non provato: la mano saliente in zona centrale (20-42% ON vs 56-57% rosso, n 20-61: il regime saliente con pallone vicino viene riclassificato come cronaca perché la camera sale sopra quota 12, quindi le due colonne non contano le stesse scene).

## 7.767 — la mano saliente misurata per regime VERO (flag salienteOn dal hook __CPM_CAMT767)

| seme | totale ON / rosso | saliente vicina (gy>85) | saliente centrale |
|---|---|---|---|
| 764 | 89,8% / 71,3% | 89% (n35) / 20% (n20) | 20% (n25) / 28% (n40) |
| 765 | 91,5% / 74,7% | — / — | 64% (n64) / 65% (n78) |

La mano saliente è provata dove agisce (pallone vicino: 89% vs 20%) e neutra dove non agisce (centrale: differenze dentro il rumore). **Difetto residuo, indipendente dal 7.766**: il regime saliente in zona centrale perde il pallone di lato (20-65% in quadro in entrambe le colonne). Prossima misura: tracciare, a 50 ms, il flag salienteOn e i bersagli durante le finestre salienti (ipotesi: il flag oscilla e la camera resta a metà strada fra cronaca e saliente, come visto a quota 12,85 nella sonda lag-767).

## 7.768 — il pannello nero dietro la porta: REVOCA della diagnosi 7.758 e rimedio vero

Il PO lo ha rivisto sulla 7.767 (63', FC Mers-FC Sociedad). Non è una texture non allocata (diagnosi 7.758, **revocata**): è il fondale scuro dei pali (7.8.26, piano 11,9×3,2 a 0x090c11) a UNA faccia con normale +x. Dal campo si vede solo dietro la porta a −x; alla ripresa lo stadio ruota (7.732) e quella porta finisce davanti all'eroe: muro nero nel SOLO secondo tempo — entrambi gli screenshot del PO sono del secondo tempo (86' e 63'). Prova con la vernice (`__CPM_FONDALE768='paint'`): mesh in quadro → 4049 pixel rossi; nel primo tempo la porta d'attacco non ha alcun fondale (faccia culled). Rimedio 7.768 (rosso `__CPM_NO768`): DoubleSide, 8,5×2,9, opacità 0,35, depthWrite off. Misura: luminanza nel riquadro del fondale con la porta in quadro 101 (ON) vs ~107 senza fondale (rosso, primo tempo) vs ~9 col muro; quasi neri 0%. NON verificato: la riproduzione headless del muro nel secondo tempo (le scene forzate al 48' non inquadrano la porta). Lezione: il 7.758 ha ridotto le texture (utile) con una spiegazione falsa; la prova con la vernice andava fatta subito.

## Note KE del PO sulla 7.767 (63' #156, 41' #107): teletrasporti, 001, 006, 011 — indagine

- Teletrasporti (SALTO 37,6u/21 ms «testa», 6,2u/20 ms): NON riprodotti in headless. 24 scene forzate (8 gi × k 0-2, GLB ON, pallone a 40 ms per 14 s): 0 salti ≥6u fuori dagli stacchi; il censimento in autoplay (1724 fotogrammi) 0 visibili. Lo scrittore «testa» è la colla della conduzione (src/12 ~5053) che incolla il pallone al portatore del beat: salta se il fotogramma precedente era lontano nel tempo.
- 001 all'apertura: riprodotto sulla PRIMA scena dal gioco vivo (gi156: eroe e pallone fermi 2,5 s nella posa del gioco, posa dichiarata a 17u; da scena a scena invece 0u a 600 ms). Causa a monte misurata con il contatore rAF e il profilo CPU: **compilazione shader sincrona** all'apertura (programmi 13→20; triangoli 12k→1,09M; texture 25→211; 50-66% del CPU dei primi 4 s in getShaderInfoLog/getProgramInfoLog; 0-1 fotogrammi nei primi 1,5-2,5 s). Il salto del pallone è la ripresa del disegno dopo lo stallo.
- Il headless disegna le scene a 3-4 fps (SwiftShader, 1,09M triangoli): le misure a tempo nelle scene sono sospette; quelle di gioco aperto (12-14k triangoli) no.

## 7.769 — gli shader si compilano prima del fischio (SPEDITA dopo prova del rosso)

Rimedio (rosso `__CPM_NO769`): `renderer.compile(scene,camera)` all'aggancio dei CH38 e «pronto» dichiarato dopo; `checkShaderErrors` off in produzione (dichiarato: gli errori shader non vanno più in console).

| | ON | rosso |
|---|---|---|
| programmi shader al fischio | 23 | 13 |
| CPU in compilazione, prima scena 0-4 s | 0,0% | 49,8% |
| fotogrammi nei primi 2 s della prima scena viva (gi156) | 8 | 4 |
| pronto (GLB_READY) dall'avvio pagina | 18,8 s | 13,3 s |

NON verificato: l'effetto sul telefono (la compilazione su GPU mobile è più lenta: il beneficio atteso è maggiore, non misurato); la deriva del pallone dopo la consegna in lettura (3,9u → 22u in 2 s in entrambe le colonne) resta aperta e misurata. Aperto: il budget di 1,09 milioni di triangoli per fotogramma nelle scene (22 modelli da ~45k) — sul telefono è il candidato «non fluido» successivo; serve il numero di fps del PO (7.708) nelle note KE.

## 7.770 — il fermo della cronaca non comanda dentro la scena (SPEDITA dopo prova del rosso)

Sonda deriva-770 (GLB ON, scene dal gioco vivo #156/#47/#107, varco del pallone a 0,4u/fotogramma): dopo la consegna in lettura il pallone si allontanava dalla posa dell'eroe a ~7 u/s fino alla linea laterale (50,98); scrittore nominato: **fermo (17)**. Causa: il fermo del gioco aperto (rimessa/fallo) ha un TTL in tick, il tick non gira nelle scene, `P.fermo` resta armato e lo scrittore trascina il pallone al punto della rimessa a 55 u/s dentro l'highlight. Rimedio (rosso `__CPM_NO770`): il fermo vale solo in `playing`.

| scena | palla→posa eroe a 1/2/3/4,5/6 s — ON | rosso | scrittori ≥0,4u (ON / rosso) |
|---|---|---|---|
| #156 | 0/0/0/0/0 | 3/13,6/17,6/25,5/37,5 | scena 1 / fermo 10 |
| #47 | 0/0/0/0/0 | 7,8/11,7/19,6/31,3/39,1 | scena 1 / fermo 10 |
| #107 | 0/0/0/0/0 | 7,7/15,4/23,2/34,7/46,2 | scena 1 / fermo 12 |

È la spiegazione più diretta del «001» e del «SALTO» delle note KE del PO: sul telefono a 60 fps il trascinamento a 55 u/s dura mezzo secondo. NON verificato sul telefono.

## Stabilità dopo 7.769/7.770 — guardiano a 4 partite

11 bande verdi: turno-causale 96% · manovra-viva 121 · arbitro 51 · custodia 6,1u · gol-con-manovra 4/8 · mente-esegue 16 · righe-fatto 14 · raccoglitori 50 · esiti 15 · tabellone 3-5 = 3-5 · nomi-veri 14/14. Nessuna regressione misurata. Nota strumentale: in headless il contesto delle note KE porta gli fps (18 in gioco, 17 in scena, GLB ON); nelle note del PO il campo manca → sul suo telefono `__CPM_FPS708` risulta assente: NON spiegato, resta aperto (senza quel numero il budget di 1,09M triangoli non si può giudicare).

## 7.771 — gli fps nella nota KE, sempre (strumentazione)

Le note del PO dal telefono (7.719→7.767) non portano il campo fps che il 7.708.1 stampa quando `__CPM_FPS708` esiste; in headless c'è (18). Causa sul telefono NON spiegata. Rete: contatore rAF indipendente in LiveMatch (`__CPM_FPS771`), la nota usa il primo dei due. Misura headless: cancellato `__CPM_FPS708`, la nota porta comunque 17 fps. Nessun comportamento di gioco cambia. Serve al giudizio sul budget di 1,09M triangoli nelle scene.

## 7.772 — il gol subito entra in porta (SPEDITA dopo prova del rosso) + una mano REVOCATA

Collaudo PO 04/09 07:28 (gol di Russell 88'). Sonde golsub2/3/4-772 (GLB ON, 10 scene difensive con esito `goal_against` forzato): viaggio continuo (salto massimo fra campioni 1-2u anche col rosso: nessun teletrasporto), arco che finisce a gx 1,8-2,1 (davanti alla linea 1,4), canale `in_net_own` mai acceso (0/10). Causa: a fine arco il ramo difensivo dichiara `in_net_own`, poi il post-arco dei FALLIMENTI (parata/palo/fuori dal tipo del motore) lo sovrascrive con `deflect`. Rimedio (rosso `__CPM_NO772`): sul gol subito quel blocco non ha voce.

| | ON | rosso |
|---|---|---|
| canale in_net_own acceso | 6/10 | 0/10 |
| pallone oltre la linea nella finestra | 3/10 | 0/10 |
| salto massimo fra campioni (mediana) | 1,6u | 1,6u |

Limiti: il clock di scena headless vale ~0,1 s per secondo reale (misurato: SCENET 0,74 dopo 8,2 s), quindi la convergenza in rete non finisce nella finestra della sonda; sul telefono è più rapida. **Revocata** la prima mano (bersaglio logico a gx 2-12 posticipato a rete certificata): misura identica al rosso — il salto che cercava non esisteva. **Aperto**: tiro da 13-38u (mediana ~24; gi33 fino a 50) — l'avversario dovrebbe avanzare prima del tiro; 4 scene senza canale (gi132/138 arco non concluso nella finestra; gi136/157 non spiegate); «stacco troppo presto»: la finestra del result aspetta il renderer fino a 6 s (7.461), non riprodotto in headless. NON verificato sul telefono.

## 7.773 — sul gol subito l'avversario avanza prima di tirare (SPEDITA dopo prova del rosso)

Sonda avanzata-773 (10 scene difensive con gol subito, GLB ON, origine del tiro dal punto di partenza dell'arco `_arcSrc382`). Il portatore avversario più vicino raggiunge il pallone, lo porta a 19u, poi tira; tuffo del portiere armato al tiro.

| | ON | rosso |
|---|---|---|
| origine del tiro (mediana / max) | 13,2u / 18,7u | 22u / 29,5u |
| tiri oltre 22u | 0/10 | 4/10 |
| canale in_net_own | 9/10 | 9/10 |
| oltre la linea nella finestra | 7/10 | 4/10 |

Due stesure intermedie corrette dalla misura: (1) la palla saltava sul portatore (salto 15,8u) → prima lo raggiunge; (2) «arrivato» senza palla ai piedi → il tiro partiva dal punto d'apertura (t 1,63 s, has:false): arrivo = palla ai piedi E 19u. Residuo: gi33 (apertura a 37u) viene ricollocata a 12u dentro lo stacco nero dallo scrittore «scena», identico col rosso. NON verificato sul telefono.

### 7.773 — correzione dopo il gate rosso: tetto in tempo reale

Il gate final-state è andato rosso (#136: palla a gx 50 a fine finestra): a 6 fps il clock di scena vale un decimo e l'attesa del portatore non finiva. Tetto aggiunto: 1,6 s reali (oltre ai 4 s di scena). Gate verde (fingerprint 00001505). Conseguenza misurata: in headless GLB ON (4 fps) l'avanzata non si esercita più (0,14 s di scena, origine = rosso); a cadenza reale (GLB OFF, misura supplementare): gi36 45→32u, gi44 22→18u, gi45 25→18u, gi136 23→21u (rosso: invariate 44/31/19/26); massima 32 vs 44,4; oltre 22u 1/10 vs 3/10; canale in rete 9/10 in entrambe; «oltre la linea nella finestra» 4/10 vs 8/10 nel regime a clock lento (artefatto dichiarato, da verificare sul telefono). Sul telefono a ≥30 fps il tetto vale 12,8u di conduzione.

## 7.774 REVOCATA — «la scena non si stacca finché il pallone non è in rete»

Ipotesi: sul gol subito il post-arco `in_net_own` si spegne a 1,9 s di scena mentre il pallone entra fra 1,3 e 5,0 s, quindi il cancello del 7.461 (che guarda solo timeline/arco/post-arco) lascerebbe chiudere con la palla fuori — la lettura naturale di «il pallone credo non sia manco entrato · staccata troppo presto». Aggiunto al cineBusy un campo `viaggio` (gol subito annunciato e pallone non oltre la linea) e letto dal cancello.
**Smentita dalla misura.** Registrando cosa vede il cancello a ogni valutazione: quando valuta, il pallone è già a x −49,1 (la linea è −48,6), in tutte le scene e in entrambi i regimi. Appaiata con CPU rallentata 6× (il regime del telefono): gol visti prima dello stacco 6/6 ON e 6/6 rosso, tempi d'ingresso 2,3-4,9 s in entrambi. Zero differenza: la mano non ha niente da correggere qui. Revocata anche la strumentazione diagnostica aggiunta al cineBusy (gira a ogni fotogramma).
Resta aperto il fatto del PO: se lo stacco anticipato esiste sul suo telefono, non è questo il meccanismo. Prossima pista dichiarata: il gol subito visto in partita vera (non scena forzata), dove la finestra del result convive con la cronaca.

## 7.775 — il terzo uomo (SPEDITA dopo prova del rosso)

Collaudo PO 04/09: «le azioni pericolose non sono azioni di calcio vero con schemi, passaggi sensati, giocate». Censimento di 40 scene con l'esecutore cinematico acceso (il regime del gioco vero, non del gate): **beat mediani 3, passaggi mediani 1, uomini mediani 2, e 0 scene su 40 con tre uomini**. Lo schema più frequente è «passaggio, conduzione, tiro» fra le stesse due persone.
Due mani. La prima: nel costruttore, scarico e ritorno su un terzo compagno nei due schemi più frequenti (tiro dal limite, costruzione), sempre **a valle** del primo passaggio — a monte sposterebbe l'origine del pallone rispetto a dove la simulazione l'ha messo, cioè il salto chiuso col 7.770. La seconda, trovata dalla misura: il supporto dichiarato dalla situation **non arrivava** al costruttore, perché il prop non esisteva e il campo veniva cercato in `ctx` (nullo) invece che in `tactic`. Prima della correzione la mano era invisibile: acceso e rosso identici.

| metro (14 scene con supporto dichiarato) | 7.775 | rosso |
|---|---|---|
| uomini che toccano il pallone (mediana) | 3 | 2 |
| passaggi per scena (mediana) | 3 | 1 |
| scene con tre uomini | 9/14 | 0/14 |
| scene con almeno due passaggi | 10/14 | 3/14 |

Invarianti del backbone (possesso continuo, niente teletrasporti della palla, colpo di testa solo su palla aerea): 31 test node verdi. Lezione: una mano che non morde va cercata nel filo prima che nel numero — il ramo era giusto, il dato non arrivava.

## 7.776 — il terzo uomo in tutti gli schemi (SPEDITA dopo prova del rosso)

Estensione del 7.775 a dai-e-vai (triangolo), filtrante (appoggio e ritorno prima dell'apertura), colpo di testa (il cross nasce da uno scarico) e cross (scambio in fascia). Sui cross il primo tentativo usava il rifinitore e la giocata restava a due uomini: misurato, corretto usando il compagno che non rifinisce.

| metro (19 scene con supporto dichiarato) | 7.776 | rosso |
|---|---|---|
| scene con tre uomini | 19/19 | 0/19 |
| scene con almeno due passaggi | 19/19 | 5/19 |
| passaggi per scena (mediana) | 3 | 1 |
| beat per scena (mediana) | 5 | 3 |

Durata della costruzione: da 1,25-1,98 s a 1,73-2,58 s per schema, dentro la finestra dell'esito (il cancello 7.461 tiene aperta la scena finché la costruzione vive). Invarianti del backbone verdi.

## Censimenti dopo il terzo uomo (7.776)

**Costo misurato del terzo uomo (custodia in scena).** 13 scene con costruzione e supporto, 454 campioni: distanza fra pallone e nostro più vicino con mediana 1,4u in entrambi i regimi; campioni oltre 4u 32% con il terzo uomo contro 23% col rosso, p90 8,0u contro 7,0u, massimo 20,8 contro 22,0. È il costo dei passaggi in più: durante un volo il pallone è lontano da tutti, come nel calcio. La custodia non peggiora dove conta (mediana identica, nessun pallone orfano).

**Codice 006 «reparto fermo»: NON riprodotto.** Due metri, entrambi negativi. Nei tre secondi dell'esito si spostano 9/9 compagni e 10/10 avversari, spostamento medio dei nostri 13,1u (18 scene). Durante la LETTURA, che è la fase in cui il PO guarda il campo mentre decide, si muovono 9/9 compagni in 14 scene su 14, con spostamento massimo per campione 2,3-3,1u ogni 220 ms (circa 10 u/s: corsa vera). Zero scene con nessuno fermo o con due soli in movimento. Il fatto del PO resta a verbale: se esiste sul suo telefono, non è «nessuno si muove» ma verosimilmente il movimento reso a scatti sotto i 20 fps, che è la pista già aperta col budget di 1,09 milioni di triangoli.

## 7.777 — la respinta riuscita cerca un compagno (SPEDITA dopo prova del rosso)

Censimento degli esiti difensivi RIUSCITI (18 scene × 2 azioni = 36 casi): il pallone finiva ai piedi di un nostro 8 volte su 36, lo raccoglieva un avversario 6, restava di nessuno 22. Causa: fra gli esiti riusciti la respinta corta — la più pesata quando si difende in area — ha `seekMate:null` e spinge la palla avanti di 11 unità con apertura laterale casuale, mentre intercetto, contrasto vinto e ripartenza un compagno lo cercano già.

| metro (36 esiti difensivi riusciti) | 7.777 | rosso |
|---|---|---|
| ripartenza nostra | 13 | 8 |
| la raccoglie l'avversario | 5 | 6 |
| palla di nessuno | 18 | 22 |
| distanza mediana dal nostro più vicino | 8,1u | 9,6u |

**Residuo dichiarato**: metà dei casi resta «palla di nessuno», il pallone si ferma a mezza strada dal compagno. Non risolto qui. Prima stesura **revocata**: agiva sul punto-palla LOGICO (`ballTargetRef` su recovery/save) e la misura l'ha smentita subito (5 ripartenze contro 6 del rosso) — nella scena comanda il descrittore 3D, non il bersaglio logico. Sul fallimento la respinta resta cieca; la spazzata lunga non si tocca.

### 7.777 — il residuo, misurato meglio (correzione del verbale)

Il «18/36 palla di nessuno» era misurato a un istante fisso (2,6 s dopo l'esito) e sopravvalutava il difetto. Tracciando la traiettoria a 150 ms su 10 scene difensive riuscite: **il pallone arriva a un nostro in 10/10** (distanza minima mediana 0,9u) e **ci resta a fine scena in 7/10** (distanza finale mediana 1,3u). Nei 3 casi restanti riparte e si allontana (16,4 · 15,5 · 4,4u) dopo essere stato raggiunto. Il residuo vero è quello: non «la respinta non arriva a nessuno», ma «in tre casi su dieci il pallone lascia di nuovo il compagno entro tre secondi».

## 7.778 — la CI di GitHub e il banco locale devono vedere la stessa cosa

Il PO ha mostrato il job `validate` **rosso** sul push della 7.777 (main ccd264a, 16m 6s, exit 1) mentre il rituale locale era **verde a 0 failure** con la stessa suite. Verificato: il workflow esegue esattamente i passi di `npm run ci` (impulsi-contesto, test:vision, test:logic, typing-shortcuts, validate-situations, save-compat, replay, partita-vera) e ognuno passa qui — save-compat rilanciato a parte: 12 pass, 0 fail. Il log del run non è leggibile da questa sessione (l'API GitHub risponde 403: l'app non è connessa per l'organizzazione), quindi **quale categoria sia rossa resta non verificato**.
Ipotesi più probabile, e mitigata: la mano del 7.777 sceglie il compagno leggendo le posizioni **rese** dei mesh, che dipendono dal frame-rate; su un runner più lento un gate deterministico diverge. Qui la mano viene spenta sotto il gate (stessa regola già scritta per il costruttore cinematico nel 7.381) e resta accesa nel gioco vero. Per costruzione il gate torna al comportamento della 7.776, che su GitHub era verde.
Seconda ipotesi **non mitigata e dichiarata**: `npm install` sul runner prende l'ultima versione di Playwright e quindi un Chromium diverso dal binario del banco; le firme dHash del golden possono divergere per pixel di rendering. Se il prossimo push resta rosso, questa è la pista da aprire — e serve il log, cioè l'accesso GitHub.

## Stabilità dopo 7.775-7.778 — guardiano a 4 partite

11 bande verdi, identiche al giro precedente: turno-causale 96% · manovra-viva 121 · arbitro 51 · custodia 6,1u · gol-con-manovra 4/8 · mente-esegue 16 · righe-fatto 14 · raccoglitori 52 · esiti 14 · tabellone 3-5 = 3-5 · nomi-veri 14/14. Il terzo uomo e la respinta che cerca un compagno non muovono nessuna banda: nessuna regressione misurata sulla partita intera.

## Banco (NESSUN numero di versione) — l'attesa dell'assestamento si scala sul frame-rate

⚠️ **Correzione del PO**: questa sezione era intitolata «7.779» ed e' un errore di registro. Tocca solo
`tests/visual/lib/harness.mjs`: il gioco non cambia di una riga e `GAME_VERSION` resta **7.778.0**. Un numero
di versione si assegna a cio' che il PO puo' collaudare; un lavoro sul banco non lo e'. La checklist di
chiusura, che era stata scritta «collauda la 7.779», e' stata corretta a 7.778.0.

Trovato il meccanismo che rende il quality gate sensibile alla macchina, e mitigato. `waitBallSettle` aspetta al massimo **9 secondi reali** che il pallone si assesti, mentre la scena avanza sul clock di scena, che a frame-rate basso scorre molto più lentamente. Quando il tetto scatta, il check legge una posizione **intermedia** e la giudica sbagliata: «esito goal_against ma palla a metà campo» — la forma esatta dell'issue vista in locale sulla 7.773. Sul banco 2-3 campioni su 24 finivano già «al limite»; su un runner più lento ne finiscono di più, ed è la spiegazione più semplice di due CI rosse (7.719 e 7.777) con banco verde.
Rimedio: il tetto si scala sul frame-rate osservato (a 60 fps resta 9 s, a 12 fps diventa 22,5 s). Cambia solo quanto il banco aspetta: nessun bersaglio, nessuna soglia di giudizio, nessuna riga di gioco.

| | prima | dopo |
|---|---|---|
| campioni «al limite» | 2-3 / 24 | **0 / 24** |
| esito del gate | 0 failure | 0 failure |
| fingerprint | 00001505 | 00001505 |

La firma non si muove: il determinismo resta intatto, sparisce il margine di fragilità. **NON verificato**: che il rosso della CI fosse questo — il log del run non è leggibile da questa sessione (API GitHub 403).

### 7.777 — il residuo, misura definitiva (e correzione della correzione)

Terza passata, con finestra di 8 secondi e campioni filtrati sulla fase (solo dentro `hl_result`): **il pallone arriva a un nostro in 8 scene su 10** (distanza minima mediana 0,4u) e **a fine scena è ancora suo in 6 su 10** (finale mediana 0,7u). Nelle 4 restanti finisce a 4,7 · 15,7 · 16,6 · 21u; due di queste (gi134, gi138) non lo raggiungono mai (minima 3,2 e 10,7u).
Le due misure precedenti erano entrambe imprecise per ragioni opposte: la prima leggeva un istante fisso a 2,6 s (sottostima: 18/36 «di nessuno»), la seconda usava una finestra di 3 s che tagliava le scene con volo d'ingresso lungo (sovrastima: 10/10). Il varco del pallone ha chiarito perché: in quelle scene lo scrittore attivo era ancora `buildup-volo`, cioè il cross in arrivo che l'eroe deve difendere — la scena non era all'esito, era ancora all'ingresso.
**Residuo aperto e non risolto**: 4 scene su 10 chiudono con il pallone lontano dai nostri. Non lo inseguo ora: alla ripresa della cronaca il raccoglitore (7.743) lo prende comunque, quindi l'effetto visibile dura un istante. Costo/beneficio dichiarato, non nascosto.

## Banda «azione a tre uomini» nel guardiano — VALUTATA E NON PRESA

Per proteggere il lavoro del 7.775-7.776 da regressioni future servirebbe una banda nel guardiano. Misurato prima di deciderlo, su una partita intera in autoplay nel regime del gioco vero (costruttore acceso): **2 costruzioni osservate, entrambe a tre uomini, 3 passaggi mediani**. Nel regime del banco (`?cpmtest=1` senza opt-in) le costruzioni sono **0**: il costruttore è spento per scelta dal 7.381, ed è ciò che tiene le firme golden stabili.
Quindi una banda sul terzo uomo obbligherebbe ad accendere il costruttore dentro il guardiano, cioè a cambiare il regime in cui girano **tutte** le altre undici bande, che sono tarate su misure fatte a costruttore spento. Il costo (rifare la taratura di undici bande) supera il beneficio (proteggere due costruzioni per partita). **Non presa.** Il lavoro resta protetto dai test node sugli invarianti del backbone (31 verdi) e dalla misura appaiata a verbale.

## Collaudo PO 04/09 sulla 7.778 — «codice 011, palla congelata»: DIFETTO MISURATO, due rimedi REVOCATI

Il PO ha collaudato la 7.778 (S.11 W.12 vs FC Bergamo) e ha segnalato **due volte** il codice 011 su un **assist riuscito**: 12' (SIT #23, filtrante) e 69' (SIT #187, apertura a scavalcare). Più: codice 010 «pattinata», codice 000 «gesto scoordinato» e **«gol da centrocampo assurdo»** (31', SIT #122).

**Il difetto esiste, ed è misurato.** Tracciando il pallone a 80 ms nelle scene segnalate:

| scena | tempo fermo | tratto fermo più lungo | palla a >4u da TUTTI i nostri | dove finisce |
|---|---|---|---|---|
| gi23 [through] | 48-55% | 1,17 s | 58-61% | (99,55) — linea di fondo |
| gi187 [switch] | 35-38% | 1,44 s | 51-68% | 10-15u da tutti |
| gi122 [switch] | 22-25% | 0,75 s | 38-57% | 0,7-4,9u |

Un pallone fermo 1,4 secondi consecutivi a tredici unità da chiunque, a esito concluso, è esattamente «palla congelata».

**Due rimedi provati e revocati, entrambi perché la mano non si attiva mai.**
1. *Il ricevente dell'assist corre verso il pallone invece che verso un punto fisso davanti.* Sembrava la causa: quel driver punta a `_runToX`, dodici unità più avanti, deciso quando il passaggio parte. Un contatore in pagina ha detto che in queste scene **quel driver non gira mai** (`passTargetMesh` assente). Acceso e rosso: 58/51/57% contro 59/49/61%.
2. *Un raccoglitore di scena* (gemello del 7.743 della cronaca): se a esito concluso il pallone è fermo da mezzo secondo a più di quattro unità da tutti, il più vicino ci va. Anche questa **non si attiva mai**: le sue guardie (`!ballArcActive && hlPostArcT<0 && !tlOn`) non sono mai tutte vere nella finestra misurata.

**Prossima pista, dichiarata**: strumentare i tre flag (arco, post-arco, timeline) negli ultimi due secondi della scena e scoprire quale resta vivo. Finché non so *quale stato* tiene occupata la fine della scena, ogni rimedio è un colpo al buio — e due colpi al buio sono già stati sparati e revocati.

### Codice 011 — LA CAUSA: dentro la scena il punto-palla logico non si muove, e il pallone reso va per conto suo

Strumentati i tre flag a ogni fotogramma (`__CPM_FLAG780ON`, test-only) sulle due scene segnalate dal PO, con esito forzato RIUSCITO come nelle sue note:

- il tratto fermo più lungo cade **mentre l'arco è dichiarato attivo**: 49 fotogrammi (1,8 s di scena) in gi187, 15 in gi23, con il pallone immobile;
- il caricamento del gesto per un passaggio dura **0,27 s**, non 1,8: non è il wind-up;
- **il punto-palla LOGICO è fermo nel 100% dei campioni** di tutta la scena (57,55 in gi187, 55,35 in gi23), mentre il pallone reso si allontana fino a **38 e 48 unità**, con distanza mediana 9,2 e 17,3.

Il meccanismo: su un passaggio (`pass`) il pallone reso non segue il bersaglio dell'arco — quel percorso è riservato ai tiri — ma insegue il punto logico, che durante l'esito **non viene aggiornato**. Quando l'arco non comanda, il pallone resta fermo dov'è: è il codice 011. E siccome la cronaca riparte dal punto logico, la palla può anche «tornare indietro» a fine scena.

Questo tocca la direttiva madre («la simulazione è la source of truth»): qui le due realtà divergono di 9-17 unità mediane dentro la scena. **Prossimo lavoro, con misura appaiata**: far convergere il punto logico e il pallone reso durante l'esito — e la banda naturale è proprio la distanza mesh↔logico, che oggi vale 9,2 e 17,3 unità mediane. Non spedito stanotte: il rimedio tocca il confine fra le due autorità e va misurato prima di essere scritto.

## 7.781 — una sola realtà per il pallone a fine scena (codice 011)

Rimedio alla causa trovata: alla chiusura della scena il punto-palla logico viene riportato **sul pallone reso**, che è quello che il giocatore ha appena visto (il ponte `meshDef` ora espone anche la palla). Così la cronaca riparte da dove sta il pallone e non da dove la macchina credeva che fosse — ed è anche la forma del vecchio codice 012, «il pallone torna indietro». Non tocca la resa: nessun fotogramma cambia, cambia solo ciò che la simulazione crede.
Misura appaiata in partita vera (autoplay, seme 764), rosso `__CPM_NO781`: distanza reso↔logico alla chiusura della scena **7,9 unità contro 49,1**, mano attiva 2 volte su 2 scene chiuse contro 0. Campione piccolo (2 scene in una partita): dichiarato.

## 7.782 — le presenze in nazionale: una convocazione per stagione era un tetto strutturale

Collaudo PO 04/09 23:56: «assurdo solo 6 presenze in nazionale con una carriera del genere». Samuelito Vairo, Spagna, OVR 92, 350 gol e 164 assist in 438 presenze, dieci stagioni, **primo nella lista del CT per la maglia numero 9** — e sei presenze, mentre i tre NPC dietro di lui ne hanno 15, 16 e 17.
Causa: `seasonOpen = stagione corrente > ultima stagione con nazionale`. Appena il giocatore vestiva la maglia la porta si chiudeva fino alla stagione dopo: il tetto strutturale era **una presenza a stagione**. Gli NPC della stessa schermata vengono da un'altra formula (`caps = max(2, base/3 − 14 + 2i)`): le due scale non si sono mai parlate.
Rimedio: fino a quattro finestre per stagione, contate sulla storia vera (`natHistory` della stagione corrente); il gate meritocratico — livello della nazionale, OVR, rendimento, continuità, reputazione — resta identico. Cambia il tetto, non il merito.

| misura (replica dichiarata della formula, 10 stagioni, Spagna, OVR 70→92) | presenze |
|---|---|
| regola vecchia (una per stagione) | **6** |
| regola nuova (fino a quattro) | **24** |

La replica restituisce **esattamente il numero che il PO vede** (6): è la conferma che la diagnosi coglie il caso reale e non un modello di comodo. Ventiquattro presenze in dieci stagioni restano sotto un fuoriclasse vero, ma allineano il giocatore ai suoi pari in lista. Rosso `__CPM_NO782`.

## 7.783 — le presenze in nazionale le decide il valore, non un tetto

Il PO, dopo il 7.782: «secondo te 6 presenze sono giuste a 27 anni con una carriera del genere?». No — e nemmeno ventiquattro. La bacheca che ha mandato: sette campionati, quattro coppe, tre coppe europee, due Trofei d'Oro, sei Giovane dell'Anno, 44 gol in una stagione, OVR 92, Coppa delle Nazioni vinta con la Spagna. Il 7.782 aveva sostituito un tetto stretto con uno largo: restava un tetto.
Provato prima il tetto fisso a otto: **fuoriclasse e comprimario finivano allo stesso numero, 48 e 48** su dieci stagioni, perché la probabilità di chiamata satura al massimo per entrambi. Il tetto tornava a essere il vincolo, e il merito spariva. Ora le finestre per stagione valgono `2 + idoneità/6`, fra due e otto: chi sta appena sopra la soglia ne gioca due, chi domina le gioca tutte.

| profilo (replica dichiarata, 10 stagioni) | oggi | 7.783 |
|---|---|---|
| fuoriclasse OVR 92, 1,1 gol a partita | 6 | **42** |
| buon titolare OVR 86 | 6 | **34** |
| appena sopra la soglia OVR 82 | 6 | **24** |

Allineata anche la scala degli avversari nella lista del CT (da 13-17 a 29-36 presenze): le due scale non si erano mai parlate, e dopo il 7.782 il confronto sarebbe stato falso al contrario — il giocatore molto sopra, gli altri fermi. Rossi `__CPM_NO782` e `__CPM_NO783N`.
**Dichiarato**: 42 presenze a 27 anni restano sotto un fuoriclasse reale (60-90). È una scelta di prudenza sul bilanciamento — ogni convocazione è una partita in più con fatica e rischio infortunio — e si alza in una riga se il PO la vuole più alta.

## 7.784.0 — Chi consegna il pallone non sta tirando

**Collaudo PO 05/09**, 4 note KE dalla 7.782 (S.11 W.13 vs FC Hammers). Tre dicono la stessa cosa:
SIT #92 «Roulette» («ero solo confusione»), SIT #26 «Assist di tacco» e SIT #111 «Assist rasoterra»,
entrambe taggate `[shot]`, con l'appunto «il tacco è una giocata straordinaria non un tiro in porta
qualunque, non ha senso proprio l'intent».

**Causa** (in `deriveHL`, src/11): il gesto si sceglie dalla `stat` dell'azione, e le stat senza ramo
proprio — `tecnica`, `velocità`, `fisico` — cadono nel ripiego di ZONA: in area o al bordo → `shot`.
Da `type` discende poi la lente `_di` con cui il Decision Engine sceglie l'esito (src/14 r.6275), e la
lente-tiro non ha «assist» fra i suoi esiti (goal/saved/blocked/post/wide): il fallimento di un tacco
veniva raccontato come una **parata del portiere** su un pallone mai indirizzato al portiere.

**Regola**: se l'esito dichiarato è un `assist`, il pallone va a un compagno → il gesto è una consegna.
Fuori testa e punizione (hanno già le loro varianti di consegna). Aggiunte due parole al pattern del
passaggio: `scavalc` → THROUGH_BALL, `sventagliat` → SWITCH.

**Misura** appaiata su 573 coppie situation×azione, rosso `__CPM_NO784`:

| | rosso | verde |
|---|---|---|
| esiti assist resi come conclusione | 28 | 19 |
| di cui famiglia «tiro» | **9** | **0** |

Le 9: gi26, gi41, gi57, gi76, gi102, gi111, gi123, gi150, gi156 — confermate indipendentemente dal
gate `backbone-regression`, che ha elencato esattamente quelle nove e nessun'altra.

**RESIDUO DICHIARATO**: 6 colpi di testa con esito assist («testa smorzata per il compagno»,
«spizzata») mirano ancora al palo e prendono ancora la lente-tiro. Manca una variante di smistamento
di testa: non c'è in questa release.

### Lo strumento, nella stessa release

Il gate è andato rosso su gi136 («esito goal_against ma palla @gx=59,5»). Non era il rimedio — gi136
non ha un solo esito `assist`, la regola lì non può scattare. Era la **misura**: forzando il
fallimento sei volte il pallone finisce SEMPRE nella nostra porta (gx 0,9) in 4-7 secondi, e nei primi
DUE SECONDI resta immobile a gx 49 perché dal 7.773 l'avversario prima lo raggiunge. L'attesa «palla a
regime» si accontentava di 700 ms di quiete e fotografava lo stato finale dentro quella pausa.

**REVOCATA** una prima guardia sull'osservabilità dell'arco (`__CPM_ARC`): quel campo è scritto una
volta e mai ripulito (`on:true` per sempre) → 24 attese su 24 al tetto, gate da 580 a 1050 secondi.
Verde per il motivo sbagliato.

Taratura tenuta: quiete 2,6 s (> della pausa misurata 2,0-2,5 s), mai prima di 3 s dalla risoluzione.
Risultato: **0/24 al tetto**, assestamento reale medio **7097 ms** contro i 3000 dichiarati prima,
gate 677 s (+17%), fingerprint 00001505, 0 failure. Stessa classe di errore sospettata per il rosso
della CI di GitHub sulla 7.777 — **NON verificato** che fosse quello.

career-critical EXIT 0 · CI EXIT 0 · PARTITA-VERA OK. NON verificato sul telefono.

## 7.785.0 — Il racconto non cancella il fatto

**Collaudo PO 05/09**: «da quando c'è il nuovo motore le partite finiscono quasi sempre con pochi gol e
le azioni pericolose extra eroe sono rare ed imbarazzanti».

### La misura, e una misura scartata

Primo censimento **SCARTATO**: 4 partite intere davano 0,75 gol/partita e zero gol ambientali, ma
cambiando SOLO il nome dell'eroe — che semina il sorteggio di club e avversario — le stesse partite
finivano 3-2 e 1-2. Non misurava il gioco, misurava *un mondo*.

Rifatto su otto mondi: **1,13 gol/partita** contro i 2,6-2,8 del calcio vero, 1 gol non-eroe su 8
partite. Il micro-simulatore ISOLATO è invece sano (0,73 casa + 1,13 fuori, gara pari, N=800;
determinismo verde): produce ~2 gol/partita, ed `ev=2` in sei partite su sei. Non è il dado, è la
consegna.

### La catena, punto per punto

Registro sui punti di uscita (`__CPM_GOL785`, sotto `__CPM_REC`):

```
nato 2 → costruzione avviata 2 → conclusa col gol 2 → al cancello 2 → DIVENTA la riga 2 → mangiato 2
```

**Sei gol su sei** mangiati all'ultimo passo dalla sequenza di libreria (7.666), che prende l'evento e
lo riscrive con `ef:null`. Il tabellone perdeva il gol, la cronaca ci metteva sopra un giro palla.
Stessi minuti in tutti i mondi: 58/59 e 83/85 — perché la libreria si apre solo se non c'è una
costruzione in corso, e la costruzione **si chiude nello stesso tick in cui consegna il gol**.

### Il rimedio, e la sua prima stesura corretta

Gerarchia già scritta al 7.695: il gol è un FATTO del microsim, la libreria è RACCONTO.

**v1 CORRETTA PRIMA DI PARTIRE**: chiudeva la porta alla libreria sul tick del gol. Guardiano appaiato:
righe di libreria 40 col rosso, **0** col verde. Il registro del cancello (`__CPM_LIBGATE785`, stesso
mondo e seme del guardiano) ha spiegato perché: su 25 tentativi la costruzione ne blocca 16 e la recita
5-7, e le uniche finestre rimaste erano proprio i tick del gol. Aperture 5 col rosso, 0 col verde. La
cura era peggiore.

**v2**: la sequenza non perde il TURNO, perde solo la RIGA — parte dal timer, la sua prima riga esce
1,3 s dopo come tutte le altre.

### Misure

Appaiata su 4 partite per lato, stessi mondi e semi, rosso `__CPM_NO785`:

| | rosso | verde |
|---|---|---|
| gol del microsim nati | 8 | 8 |
| **accreditati a tabellone** | **1** | **8** |
| mangiati dalla libreria | 7 | 0 |
| tabellone | 3-0 · 0-0 · 1-0 · 1-0 | 2-2 · 1-2 · 2-2 · 2-2 |
| gol totali a partita | 1,25 | 3,75 |

Guardiano sulla v2, tre run: gol del microsim 7/7, 6/6 accreditati, 0 mangiati; manovra-viva 63 e 45
righe (libreria 46 e 32) contro le 35 della 7.784 e le 40 del rosso; tabellone raccontato = segnato.

**DICHIARATO**: 3,75 gol/partita è SOPRA la banda del calcio vero. La parte ambientale è quella
progettata (2/partita contro baseline 1,86); l'eccesso è l'eroe, che nell'autoplay converte ~2 scene su
2 — una resa che un giocatore vero non ha. Da riguardare con partite giocate a mano.

Nuova banda **`gol-del-simulatore`**: se un gol del micro-simulatore viene mangiato, il rituale va
rosso. Verificata: va rossa col rosso (8 nati, 2 accreditati, 6 mangiati).

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 13/13 bande.
NON verificato sul telefono.

## 7.786.0 — Lo smistamento di testa non mira al palo

Chiude il **residuo dichiarato del 7.784**. Quella release aveva tolto dalla famiglia «tiro» le consegne
rese come conclusione, lasciando fuori i colpi di testa: sei azioni con esito ASSIST («testa smorzata
per il compagno», «spizzata di testa», «colpo di testa e smista», «stacco e indirizza il compagno»)
prendevano comunque una delle tre varianti d'attacco, tutte col bersaglio dell'arco su `AWAY_GOAL_X`
(la porta avversaria, src/12 r.3058-3060) e la lente-tiro per l'esito, che non ha «assist» fra i suoi
esiti possibili. Il gesto era giusto — si incorna davvero — il **destinatario** no.

Quarta variante `header_flick`: la clip resta quella del colpo di testa; cambiano il bersaglio (il
compagno più avanzato davanti, raggio corto perché una spizzata è un tocco) e la lente d'esito
(`onetwo` invece di tiro).

### Misura appaiata sulle sei scene, rosso `__CPM_NO786`

| | rosso | verde |
|---|---|---|
| bersaglio entro 8u dalla porta avversaria | 4/6 | **1/6** |
| distanza mediana dalla porta | 3,1u | **37,3u** |
| bersaglio su un compagno vero | 0/6 | 4/6 |

L'unico caso verde ancora vicino alla porta è corretto: è una spizzata per un compagno **dentro l'area
piccola**.

### Tre errori miei, a verbale

1. **Misura letta nell'istante sbagliato**: leggendo il bersaglio dell'arco da fuori a 1,4 s dalla
   risoluzione si prende il SECONDO arco (il compagno che conclude, verso la porta). Verde e rosso
   davano lo stesso numero, x=42 in tutti e sei. Il bersaglio va registrato quando viene deciso.
2. **Una sola passata di ricerca**: col filtro stretto l'uomo si trovava in 3 casi su 6, e negli altri
   il pallone finiva sul ripiego cieco «+7 in avanti» — lo stesso difetto che il 7.464 aveva già chiuso
   sul passaggio. Seconda passata più larga: 4/6.
3. **Tre giri di gate rosso** per la stessa lezione: `ball is not defined`, poi `G2X is not defined`,
   poi `sr is not defined`. Il gate estrae `computeArc` e la fa girare ISOLATA — dentro quell'estrazione
   niente dello scope esterno esiste, e un ramo nuovo va scritto come se ogni simbolo che non è un
   parametro potesse mancare.

**RESIDUO DICHIARATO**: in 2 casi su 6 nessun compagno passa nemmeno il filtro largo e resta il tocco
corto in avanti — non è più un tiro, ma non è ancora un uomo.

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 13/13 bande.
NON verificato sul telefono.

## Censimento (nessuna release) — quanto converte l'eroe, sulla 7.786

Il 7.785 lasciava dichiarato: «3,75 gol a partita è SOPRA la banda del calcio vero; la parte ambientale
è quella progettata, l'eccesso è l'eroe che nell'autoplay converte due scene su due». **Misurato, ed
era in parte una paura mia.** Sei partite intere fino all'89', sei mondi diversi, sulla 7.786:

```
1-2 · 1-2 · 0-2 · 1-2 · 1-2 · 1-2      →  17 gol / 6 partite = 2,83 a partita
```

**2,83 è dentro la banda del calcio vero** (2,6-2,8), non sopra.

| | misura |
|---|---|
| scene risolte per partita | 3,83 |
| gol dell'eroe per scena | 2/23 = **9%** (riferimento: un attaccante vero 12-18%) |
| scene che diventano un gol della squadra (gol o assist) | 5/23 = 22% |
| gol ambientali per partita | 2,00 (baseline bgMicroTick 1,86) |

Esiti delle 23 scene: intercept fallita 7 · miss fallita 4 · assist 3 · save 3 · chance 2 · goal 2 ·
through fallita 1 · recovery 1.

**Dove sbagliavo**: il 3,75 veniva da un campione di QUATTRO mondi sulla versione precedente. Non
attribuisco la differenza alla 7.786 (tocca sei azioni di testa, non il punteggio): è campione e
versione insieme. Il numero da tenere è quello di adesso, su sei mondi.

**Resta non verificato**: la resa con partite giocate A MANO. Il banco sceglie con una politica
seedata; un giocatore vero sceglie diversamente, e la percentuale può cambiare in entrambe le
direzioni. È l'unico numero che il collaudo del PO può dare e il banco no.

## Strumento (nessuna release di gioco) — `codici-787.mjs`: il censimento dei codici del PO

La coda delle note del PO parla per codici, e il gioco ha già il rilevatore che li accende
(`draftBugNote`, esposto come `__CPM_DRAFTNOTE`: lo stesso che scrive le righe che il PO incolla). Ciò
che mancava era un modo di farlo girare su un campione decente.

`sguardo-696` lo fa su scene VERE ma aspetta che la partita gliele porti: **misurato oggi, 2 scene
utili in 25 minuti**, tutte dallo stesso mondo. Su due scene non si giudica niente. Il nuovo strumento
forza le scene una per una nello stesso regime del gioco vero, e il campione sale a 39.

### Il limite del banco, finalmente con un numero

| regime | campioni per scena | codici accesi |
|---|---|---|
| GLB ON | 16-19 (≈2,3 Hz) | **0/12** |
| GLB OFF | 26-69 (≈7 Hz) | **4/39** |
| telefono del PO | ~420 per una scena da 7 s (60 Hz) | quelli che segnala |

**Triplicando i campioni compaiono codici che prima erano invisibili.** È la ragione per cui i miei
censimenti tornano da mesi con «non riprodotto»: non è una difesa del codice, è un limite dello
strumento, e i detector che vivono sul singolo fotogramma (007 camera, 014 flipper, 011 congelata) a
2,3 Hz non possono accendersi per costruzione. Lezione già scritta al 7.598 e al 7.665; qui ha un
numero.

### Cosa si accende davvero sulla 7.786 (39 scene, GLB OFF)

- **codice 001 «apertura scena»** — 2/39: all'apertura il pallone non è ai piedi di nessuno dei nostri
  (compagno più vicino **3,6u** e **4,0u**, eroe ≥4,6u, per 9-10 campioni). La soglia del rilevatore è
  3,5u su almeno il 75% dei campioni fra 0,75 s e 2,4 s dall'inizio.
- **codice 007 «camera trema»** — 2/39: **1,5 e 1,7 inversioni di direzione al secondo**, passo massimo
  1,84 e 2,21 unità.
- 003, 004, 006, 011, 012, 014, SALTO, uscita dal campo: **0/39**.
- 000 «secondo gesto sull'eroe»: 0 scene con due montaggi (contatore in gioco `__CPM_G000`, GLB ON;
  con GLB OFF il contatore non si accende affatto perché senza modelli non esistono clip — 28 scene
  aperte, zero registrazioni).

**NON verificato**: che questi siano gli stessi episodi che il PO vede. A 7 Hz il banco vede la coda
della distribuzione, non il corpo.

## Censimento (nessuna release) — codice 001 nella fase in cui il PO sceglie

Il primo censimento con `codici-787` diceva 001 acceso 1-2 volte su 39. **Ma la finestra del rilevatore
cadeva nel posto sbagliato**: la sonda risolveva l'azione dopo mezzo secondo, quindi i campioni fra
0,75 s e 2,4 s stavano DENTRO la cinematica, dove un pallone in volo è legittimamente lontano da tutti.
Il PO il 001 lo vede mentre SCEGLIE. Rifatto su quella fase (`hl_choose`, sei secondi, scena non
risolta), 32 scene, GLB OFF.

### Prima passata: un numero catastrofico e falso

custodia mediana 7,5u · 27 scene su 32 col pallone «abbandonato». **Sbagliato**: `md`, il testimone del
gioco, **esclude l'eroe per costruzione** (src/12 r.1902 salta `pp.mesh===hero`). Misurando solo quello,
una palla ai piedi del protagonista risultava abbandonata.

### Misura corretta, con l'eroe dentro

| | prima passata | corretta |
|---|---|---|
| custodia mediana fra le scene | 7,5u | **0u** |
| distanza mediana dell'eroe dal pallone | — | **0u** |
| scene col pallone oltre 3,5u da tutti per ≥75% dei campioni | 27/32 | **3/32** |

E le tre superstiti — gi132 «Blocco del tiro in area», gi138 «Allineati con la difesa», gi168 «Ultimo
uomo» — sono tutte `type:"def"`: in una scena difensiva il pallone ce l'ha l'avversario, e che i nostri
siano lontani è calcio giusto. **Il rilevatore vero esclude già le scene difensive dal 001**
(`!_isDefSc`).

**Verdetto: zero casi veri di codice 001 su 32 scene nella fase interattiva.** Non riprodotto.

**NON verificato**: il banco campiona a ~7 Hz, il telefono a 60. Il fenomeno che il PO vede può vivere
fra i miei campioni. Questo censimento dice che non è la NORMA, non che non esista.

**Terza volta oggi che lo strumento sbaglia prima del codice** (dopo l'attesa «palla a regime» del
7.784 e l'arco letto a 1,4 s del 7.786). La regola che ne esce: prima di credere a un numero, chiedersi
CHE COSA misura il testimone — e chi esclude.

## 7.787.0 — Il metro con l'aritmetica del telefono, e un'ipotesi vecchia che cade

Rilascio di **solo strumento**: una riga di gioco, test-only.

### Il gancio che era documentato ma non esisteva

`sguardo-696` scriveva da release: *«con `__CPM_DT60` il tempo di SCENA avanza di 1/60 per fotogramma
renderizzato: stessa aritmetica del telefono»*. Nel codice **quel gancio non c'era**, e la sonda lo
teneva spento con `const DT60 = false`. Uno strumento che si documenta e non si scrive è peggio di uno
che manca, perché si crede di averlo.

### L'ipotesi del 7.598 cade

Il 7.598 sosteneva: a dt piccolo le reti di legalità della camera non chiudono in una passata, si
riarmano ogni fotogramma e duellano con la morbidezza — quindi sul telefono il tremore è **peggio**.

**Prima lettura, sbagliata**: 0,14 inversioni/s col dt del telefono contro 0,63 col dt del banco.
Sembrava un miglioramento ed era solo un **cambio di unità** — con `DT60` un secondo d'orologio
contiene molto meno gioco, quindi «al secondo» misura due cose diverse.

**Unità onesta: inversioni PER FOTOGRAMMA** (che è anche quella in cui l'ipotesi è formulata).

| | dt del banco | dt del telefono |
|---|---|---|
| mediana | 0,035 | **0,008** |
| p90 | 0,097 | 0,031 |
| massimo | 0,109 | 0,096 |
| fps d'orologio | 18,5 | 9,2 |

Con l'aritmetica del telefono la camera è **quattro volte più calma nel caso tipico e uguale nel caso
peggiore**. L'ipotesi non è sostenuta, e il codice 007 che il banco vede (2-4 scene su 48 sopra soglia)
è quindi con ogni probabilità un artefatto del dt grande del banco.

**NESSUNA TARATURA DELLA CAMERA in questa release.** Una misura che smentisce non autorizza un rimedio,
e la 7.598 era già stata revocata per aver tarato al buio.

### Censimento nella stessa passata (48 scene, GLB OFF)

001 · 003 · 004 · 006 · 011 · 012 · 014 · SALTO · uscita dal campo: **tutti 0/48**.

**NON verificato**: che il 007 del PO sia lo stesso fenomeno. Il suo telefono ha GLB ON, carico diverso
e 60 fps veri; qui il regime col dt del telefono gira a 9,2 fps d'orologio.

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 13/13 bande.

## Censimento (nessuna release) — «l'azione viene staccata troppo presto»: non riprodotto, con un margine sottile

Collaudo PO 04/09: *«gol subito… il pallone credo non sia manco entrato. L'azione pericolosa viene
staccata troppo presto»*. **Aritmetica sospetta**, da due misure già fatte: il cancello che tiene aperta
la scena ha un tetto di **6000 ms reali** (src/14 r.7012, `_att461<6000`), e la taratura dell'attesa del
banco (7.784) ha misurato che dopo la risoluzione il pallone si assesta in **7097 ms in media**. Sette
secondi per arrivare, sei di scena: sembrava la spiegazione.

Misurato sulle scene difensive col fallimento forzato (regime del gioco vero, `__CPM_REALWAIT`):

| scena | il pallone taglia la linea a |
|---|---|
| gi44 | 2194 ms |
| gi157 | 3533 ms |
| gi133 | 3720 ms |
| gi136 | 5472 ms |

**4 gol subiti su 4: il pallone entra sempre, e sempre sotto il tetto.** Mediana 3720 ms, massimo
5472 ms contro 6000 ms di tetto. **Ipotesi non sostenuta**: i 7097 ms della taratura misuravano
l'assestamento COMPLETO del pallone (fino alla quiete), non il momento in cui taglia la linea.

**MARGINE DICHIARATO**: il caso peggiore sta a **528 ms dal tetto**. Il banco gira a 18 fotogrammi al
secondo con GLB OFF; su un telefono più lento, o in una scena più lunga di queste, quel margine si
mangia. **Non alzo il tetto**: non ho una misura che mostri il taglio accadere, e alzarlo su un sospetto
è esattamente ciò per cui ho già revocato la 7.598. Se il PO rivede l'episodio sulla 7.787, il numero da
guardare è quanto dura la scena prima dello stacco.

**NON verificato**: il regime del PO (GLB ON, 60 fps, carico del telefono).

## Collaudo PO sulla 7.787 — il cross atterra dove non c'è nessuno (aperto, causa non trovata)

**Due note nuove**, entrambe su scene di CROSS, entrambe con esito riuscito:
- 84' SIT #17 «Cross dalla fascia destra!» → «Cross teso» → chance riuscita · codice 000
- 55' SIT #87 «Cross di prima senza guardare!» → «Cross cieco di prima» → chance riuscita · codice 000 +
  **bozza automatica: «codice 001 MISURATO — compagno più vicino 9.9u, eroe ≥41.2u per 74 campioni»**

**Il PO mi smentisce, e ha ragione.** Poche ore fa avevo chiuso il codice 001 come «non riprodotto, 0
casi su 32», con la riserva che il banco campiona a 7 Hz e il telefono a 60. La riserva si è avverata:
il mio censimento saltava a passo 6 e **non ha mai aperto né gi17 né gi87**. Un campione regolare non è
un campione rappresentativo.

Che l'eroe stia a 41u è calcio giusto: ha crossato dalla fascia e resta lì. Il numero che non torna è
l'altro — **9,9u dal compagno più vicino su un'azione dichiarata riuscita**.

### Misura: 24 scene di cross, esito forzato a riuscito

| | |
|---|---|
| cross in cui nessun compagno arriva entro 3,5u | **10/24** |
| distanza minima, mediana | 3,2u |
| p90 | 9,1u |
| massimo (gi84) | 23,7u |
| gi87, la scena del PO | **21,2u** — peggio dei 9,9 che ha visto lui |

Tutti esiti riusciti: chance, assist, goal. La simulazione dice che un compagno ha avuto l'occasione, e
sul campo non c'è nessuno.

### REVOCATO — un rimedio che curava un ramo che non gira

Avevo agganciato il bersaglio del cross al compagno più vicino al punto geometrico (src/12, blocco
d'arco). **Misura appaiata: 12/24 contro 10/24, p90 14,9u contro 9,1 — PEGGIO.** E il contatore ha detto
perché: quel blocco d'arco è stato eseguito **una volta su otto** scene di cross forzate. Con
l'esecutore cinematico acceso — il regime del gioco vero — è la TIMELINE a muovere il pallone lungo il
cross, e quell'arco quasi non gira. Stavo curando un ramo che il PO non vede quasi mai: **la terza volta
in questa serie** (i due rimedi già revocati sul codice 011 erano lo stesso errore).

### Dove NON è la causa

Nella timeline il beat del cross **manda già il rifinitore sul punto** (`mv(fin, tgt[0], tgt[1], true)`,
src/11 r.1848). Sulla carta è corretto. Quindi fra «la timeline manda l'uomo sul punto» e «il pallone
atterra a 21 unità da chiunque» c'è un anello che non ho ancora trovato.

**APERTO, con i numeri e senza rimedio.** Non spedisco un secondo tentativo al buio: il primo era già
uno.

### Cross — secondo rimedio, revocato anch'esso. La lezione è sul metro

Avevo esteso al `cross` la rimappatura del ricevente che il 7.414 aveva scritto per il `through`: il
rendez-vous del 7.395 piega il bersaglio del volo verso il compagno **mappato**, e `mapCineActors`
assegna MATE1 al compagno più vicino all'**eroe** — che su un cross sta sulla fascia, non in area. Il
ragionamento regge, il precedente pure.

**Quello che non regge è la prova.** Quattro passate sulla stessa domanda, stesso codice: **10, 12, 9 e
6** cross su 24 «senza nessuno entro 3,5u». La sonda non era ripetibile perché ogni scena forzata
partiva dallo stato lasciato dalla precedente. Aggiunto `__CPM_RESEED(gi)` come fa il gate da sempre:

| | ripetibilità |
|---|---|
| quantili (mediana, p90, max) | **stabili** — 1,9/2,0 · 7,5/8,2 · 14,5/14,4 su passate ripetute |
| conteggio sopra soglia | **ballerino** — da 6 a 11, perché mezze scene stanno proprio intorno a 3,5u |

**Il conteggio era la metrica sbagliata**, ed è quello su cui avevo letto il «miglioramento».

Confronto onesto, due passate per lato con la sonda aggiustata:

| | mediana | p90 | max |
|---|---|---|---|
| verde | 1,9 · 2,0 | 7,5 · 8,2 | 14,5 · 14,4 |
| rosso | 1,7 · 1,9 | 8,4 · 8,6 | 14,5 · 14,4 |

Si sovrappongono. **Il rimedio non parte** — anche se l'ipotesi mi convince: convincere non è misurare.

Il difetto resta **APERTO e documentato**. Per deciderlo serve un metro che risolva differenze di questa
taglia, e questo non ci arriva.

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 13/13 bande.

## Collaudo PO sulla 7.787 (secondo giro) — il codice 001 È RIPRODOTTO. La mia chiusura era sbagliata

Tre note nuove, due con i numeri della bozza automatica:
- 14' SIT #68 «Sforbiciata acrobatica!» → miss · **«compagno più vicino 17.9u, eroe ≥48.9u per 77
  campioni»** + «sforbiciata scoordinata»
- 41' SIT #113 «Assist di prima al compagno libero!» → assist riuscita · codice 000
- 59' SIT #163 «Bordata dal limite!» → «Serve in area» → assist riuscita · **«Segna con il corpo al
  contrario»**

### Riprodotto, e con il suo numero

Traccia sulla SIT #68 (fase interattiva, scena non risolta):

```
0,0s   tutti 12,8u   eroe 16,5u
0,2s   tutti 28,7u   eroe 49,0u      ← il PO ha misurato ≥48,9u
0,8s   tutti  0,0u   eroe  0,0u
```

All'apertura c'è un **transitorio**: il pallone è già nella posizione della nuova scena e i giocatori ci
scivolano sopra. Su otto scene misurate col bit della maschera di taglio:

| scena | eroe | stacco |
|---|---|---|
| gi68 | 49,0u | sotto lo stacco |
| gi87 | 52,5u | sotto lo stacco |
| gi113 | 16,8u | sotto lo stacco |
| **gi17** | **29,2u** | **a scena scoperta** |
| **gi163** | **6,9u** | **a scena scoperta** |

Su 39 scene: **22 hanno almeno un fotogramma A SCENA SCOPERTA in cui nessuno sta entro 3,5 unità dal
pallone**, fino a 63,1u (gi40) e 57,7u (gi50).

### Perché avevo chiuso «non riprodotto», due volte

1. **Campione a passo fisso**: gi17, gi87, gi68 non cadono su un multiplo di 5 o 6, e non li ho mai
   aperti. Un campione regolare non è un campione rappresentativo.
2. **Metrica sbagliata**: guardavo la MEDIANA sull'intera fase interattiva, ed è 0u perché il transitorio
   dura un decimo o due. **Breve non vuol dire invisibile.** La metrica giusta è «esiste un fotogramma
   scoperto senza nessuno sul pallone».

### Una pista, con la sua riserva

Lo snap di scena esiste già (`_hlSnap`). Il testimone che il 7.456 ha costruito apposta
(`__CPM_STG456`) dice che su **39 cambi di staging su 39** i bersagli cambiano in massa (17-19 giocatori
su 19 oltre 8u dal proprio, il più lontano 21-76u, mediana 39,8u) **senza un taglio armato** — che è
esattamente ciò che quella nota chiama il difetto: «i ventidue restano dove sono e ci vanno a piedi».

**RISERVA DICHIARATA**: quei cambi arrivano a ~2,5 s dal taglio, mentre il transitorio che ho misurato
sta a 0-0,3 s. **Sono due eventi diversi**, e il secondo potrebbe essere il rilascio del fermo off-ball,
cioè per progetto. Non ho ancora un quadro pulito, e oggi ho già revocato due rimedi partiti da un
ragionamento che sembrava solido: **nessun rimedio qui**.

**APERTO**, con i numeri, e con il verdetto di stamattina esplicitamente ritirato.

### Il regime della sonda spegneva lo snap — sesta lezione di strumento della giornata

`_asIfPlay = (window.__CPM_PRESENT===1) || !_CPM_TEST` (src/12 r.4480). Le mie sonde girano con
`?cpmtest=1` e **senza** `__CPM_PRESENT`: quindi `_asIfPlay` era falso, e con lui erano spenti **lo snap
di scena, il ri-snap del 7.401 e il fermo di lettura**. Nella mia sonda i giocatori non snappavano mai.
Il contatore l'ha detto senza appello: **ri-snap scattati 0 su 39**.

`sguardo-696` metteva quel flag apposta; io non l'ho copiato.

### Misura corretta, nel regime del gioco

| | sonda sbagliata | regime del gioco |
|---|---|---|
| ri-snap del 7.401 scattati | 0/39 | **39/39** |
| scene aperte senza un fotogramma sotto lo stacco | 28/39 | **4/39** |
| picco a scena scoperta (primo mezzo secondo), mediana | 5,5u | **0,0u** |
| p90 | 36,6u | **23,9u** |
| massimo | 63,7u | **27,7u** |
| scene col picco scoperto oltre 3,5u | 22/39 | **11/39** |

**Metà di quello che avevo misurato era il banco.** Le altre **11 su 39 sono vere**: c'è un momento, nel
primo mezzo secondo, senza stacco, in cui nessuno sta entro 3,5 unità dal pallone — fino a 27,7u. Il
difetto che il PO chiama codice 001 **esiste**, con questa taglia e non con quella che avevo scritto un
paragrafo fa.

**Cosa resta da capire**: il ri-snap scatta 39/39 ma arriva a 1-2,5 s dal taglio, mentre il picco
scoperto sta nel primo mezzo secondo. Fra il taglio e il ri-snap c'è una finestra in cui il mondo si
vede mentre si sistema.

**Nessun rimedio**: oggi ne ho revocati due, e ho appena invalidato una misura mia. Prima il metro.

## 7.788.0 — La voce del mister: sotto il racconto, più grande, e senza ripetersi

Domanda del PO in collaudo, con fotografia al 69' di FC Mer 3-0 FC Gri: *«le indicazioni del mister sono
collegate con le azioni? le farei comparire subito sotto la telecronaca e più grandi. Se sono scollegate
vanno collegate altrimenti non servono a niente e devono essere davvero indicazioni utili e non
ripetitive»*.

### 1. Sono collegate — e non solo sulla carta

`selectCoachOrder(minuto, punteggio, momentum, stanchezza)` sceglie fra tredici ordini, e l'ordine muove
davvero bonus tattico, possesso, momentum e linee di squadra. Le grida brevi seguono la fase reale
(costruzione/sviluppo/pericolo, turno, possesso). Su tre partite intere la sequenza lo mostra da sola:

```
43'  0-1   «Un gol e torniamo in gioco»
61'  0-2   «Tutti avanti. Il pareggio non serve»
86'  1-2   «Cinque minuti. Tutti in attacco. Non tornare — vai!»
86'  3-2   «Chiudi gli spazi. Un gol subito adesso è un disastro»
```

Nella fotografia del PO (3-0 al 69') l'ordine era `consolida`: coerente.

### 2. Sotto il racconto, e più grande

Il riquadro viveva nella colonna in fondo — il 7.536 ce l'aveva messo per non farlo accavallare con la
cronaca. Ma da quando il racconto sale al centro (7.661) la colonna resta giù e **il legame si spezza a
vista**, anche quando c'è. Ora la panchina segue il racconto: stesso blocco, subito sotto, corpo da
**12,5 a 15**, e sparisce dalla colonna per non comparire due volte. Nel sottopancia durante l'azione
pericolosa resta fuori: lì lo spazio è una riga sola (7.695). Rosso `__CPM_NO788B`.

### 3. Non ripetitive

| | prima | dopo |
|---|---|---|
| voci diverse | **54%** (30/56) | **70%** (39/56) |
| la più ripetuta | **6 volte** | **3 volte** |

Due cause, entrambe strutturali:
- **ogni ordine aveva UNA sola frase**: la decisione giusta si ripresenta spesso (il punteggio resta
  quello) e con una frase sola il mister sembra un disco. Ora ogni ordine ha un ventaglio scelto col
  seme del minuto — la DECISIONE non cambia di una virgola, cambiano le parole.
- **i serbatoi delle grida erano piccoli**: 7-8 frasi per famiglia contro **tredici estrazioni a
  partita** (il 72% di ciò che il mister dice sono grida brevi). La ripetizione era aritmetica. Le
  famiglie raddoppiano, e le frasi nuove **nominano la situazione** invece di essere un verbo: «occhio
  al taglio dietro», «il terzino è alto: attaccalo», «seconda palla, siate pronti».

Rosso `__CPM_NO788C`.

**Un errore mio, a verbale**: spostando il riquadro gli avevo tolto l'etichetta stabile `data-cpm`, e la
sonda ha contato **zero voci su due partite intere** mentre il gioco le scriveva. È la lezione già
scritta nel 7.681 — «senza etichetta, per misurare servono selettori sullo stile». Rimessa.

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 13/13 bande.
NON verificato sul telefono.
