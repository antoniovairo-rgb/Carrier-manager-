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

---

## 7.789 — REVOCATA. «Le azioni pericolose extra eroe sono rarissime»: non sono rare, non esistono

*(nessun bump di versione: non cambia una virgola di ciò che il PO vede. Si committano la diagnosi e
lo strumento che la regge.)*

Nota PO: «le azioni pericolose extra eroe continuano ad essere azioni "matematiche" e non di calcio
vero, devono essere super credibili e **sono anche rarissime**. A volte la telecronaca scritta racconta
azioni importanti ma non si vedono».

### La misura, prima di ogni ipotesi

Tre partite intere, `__CPM_OCC695` letto a fine partita:

| | P1 | P2 | P3 |
|---|---|---|---|
| occasioni **armate in 3D** | **0** | **0** | **0** |

Non rarissime: **inesistenti**. Il registro è `null`, cioè il ramo che arma l'occasione non è stato
imboccato nemmeno una volta in 270 minuti di gioco. La telecronaca però le racconta — da qui il «si
raccontano ma non si vedono» del PO: è lo stesso difetto visto dal salotto.

### Perché: la premessa del cancello si contraddice da sola

Il cancello vuole **due cose nello stesso istante**:

1. **palcoscenico libero** — niente costruzione in corso, niente contropiede, niente scena dell'eroe,
   pallone in gioco, non è un calcio d'inizio;
2. **minaccia ≥ 58** in quel tick.

Nessuna delle due è sbagliata da sola. La minaccia c'è: su **1533 campioni** mediana 25, p75 33, p90 43,
p95 52, p99 68 — la soglia 58 è il **p97**, severa ma raggiunta **8 · 29 · 20 volte per partita**. E il
cancello si apre: passa tutte le sue condizioni di scena **6 · 2 · 3 volte** per partita (su 85 giri ne
blocca 41 col pallone fuori gioco, 9-35 per un contropiede in corso, 4-12 per un calcio d'inizio).

Il difetto è la **congiunzione**. Agli istanti in cui il cancello arriva davvero (5-9 per partita) la
minaccia ha **mediana 25 e non supera 58 nemmeno una volta**. Il motivo è strutturale, non una taratura
storta: **un momento libero è una pausa, e in una pausa il pericolo non c'è per definizione**. Pericolo
massimo e campo libero sono incompatibili per costruzione. Il pericolo sale mentre la scena è occupata;
quando la scena si libera il pericolo è già sceso.

### Tre rimedi provati, tre revocati

| # | rimedio | misura | esito |
|---|---|---|---|
| 1 | memoria del picco a 3' | «picco ricordato **0**» in 3 partite su 3 | **REVOCATO** — difetto mio: il registratore stava **dentro** il cancello e vedeva solo gli istanti affamati |
| 2 | registratore dove la minaccia vive + finestra 8' | apre **1 volta in 5 partite** | **REVOCATO** — il cancello arriva quasi solo nel primo tempo (9', 13', 18', 31') e il primo picco è al 32' |
| 3 | seconda porta a soglia 45 per la scena libera | **0** | **REVOCATO** — lì la minaccia sta a 25, 45 è irraggiungibile quanto 58 |

Nessuna taratura salva la premessa. **Serve un'altra premessa**: l'occasione dovrebbe **creare** il
pericolo partendo dalla pausa — come fa una diretta televisiva quando stacca su un'azione che *nasce* —
invece di aspettare un pericolo che in quel momento non può esistere. È un **cambio di progetto**, non
un ritocco, e non si spedisce di soppiatto dentro una release di taratura.

### Un errore mio che è costato un'ora, a verbale

Il contatore `__CPM_OCC695G` conta ancora il **dado** che il 7.714 ha sostituito con la minaccia:
diceva «ok 7» per una regola **che non esiste più**, e mi ha mandato a cercare il difetto dalla parte
sbagliata. Sostituito da `__CPM_APRI789`, che conta la condizione **vera** pezzo per pezzo
(`qui/adv/thr/apre/piano`, più i vettori `advV`/`thrV` e il picco `pk`). Lezione: *uno strumento che
misura una regola morta è peggio di nessuno strumento.*

### Cosa resta committato

- `_apri714` **identico a prima** (`_advO695>=48 && _thr714>=58`);
- la strumentazione `__CPM_APRI789` e il testimone `thrPicco789` (sola lettura, dietro `__CPM_REC`);
- le sonde `tests/visual/occ-789.mjs` e `tests/visual/thr-789.mjs`, ripetibili;
- questo verbale.

**Task #40 aperto**: «l'occasione extra-eroe deve nascere dalla pausa, non aspettare il picco».

---

## 7.790 — L'occasione pericolosa NASCE dalla pausa: la premessa è il POTENZIALE, non il PERICOLO

Questa è la conclusione del 7.789, con il rimedio che le tre tarature non erano riuscite a trovare.

### Prima: la ritrattazione

Nel 7.789 avevo scritto «occasioni armate ZERO, ZERO e ZERO — non rarissime, **inesistenti**». Era
un'estrapolazione da **tre soli mondi**. Su altri tre lo stesso codice arma **1, 1, 0**. La misura onesta
su sei mondi è **0,17 a partita**. «Rarissime» era la parola giusta, la mia era troppo grossa.

### La scomposizione che ha aperto la strada

La minaccia agli istanti di pausa vale mediana 25 e non serve. Ma non tutte le sue parti dicono la
stessa cosa:

| componente | peso | mediana in pausa | che cosa descrive |
|---|---|---|---|
| zona | 30% | **0,02** | dove sta la palla ADESSO |
| porta | 25% | **0,00** | dove sta la palla ADESSO |
| spinta | 15% | **0,00** (anche p90 e max) | avanzamento di UN SOLO tick |
| lib | 15% | **1,00** | quanti attaccanti sono liberi |
| sup | 10% | **0,50** | superiorità numerica |
| noPress | 5% | **0,67** | assenza di pressing |

**Il 70% del punteggio è spento proprio dove il cancello guarda.** `spinta` in particolare è zero per
costruzione: in una pausa il pallone non avanza, quindi la sua derivata è nulla — 0,00 in tutti e 23 gli
istanti, mediana, p90 e massimo.

Il 30% che vive dice un'altra cosa: non «c'è pericolo» ma «**da qui può nascerne uno**». Ed è la domanda
giusta, perché **il pericolo lo costruisce il piano dell'occasione**, che porta la palla in area beat
dopo beat. Chiedere il pericolo *prima* era chiederlo due volte, e la prima volta era impossibile.

### Il rimedio

**PREMESSA = 45% attaccanti liberi + 30% superiorità + 25% assenza di pressing** (0-100). Sui 23 arrivi:
mediana 70, p25 53, p75 92. Soglia **75**. Resta in **OR** il picco di minaccia ≥ 58, che è la porta di
sempre: due condizioni per due momenti diversi — «sta già succedendo» e «può cominciare adesso».
Intatti `adv>=48`, il cooldown di otto minuti, e la regola che un'occasione **cede sempre il passo** a un
gol del microsim. Rosso `__CPM_NO790`.

### La misura appaiata — sei mondi identici, verde contro rosso

| | verde | rosso |
|---|---|---|
| **occasioni MOSTRATE in 3D** | **2,00** a partita (12 totali) | **0,17** (1 totale) |
| parate mostrate | 2,00 | 0,17 |
| righe che raccontano un fatto pericoloso | 4,33 | 3,67 |
| **rapporto raccontate / mostrate** | **2,2 a 1** | **22 a 1** |
| gol accreditati | 4,00 | 3,67 |

Il numero che risponde alla seconda metà della nota del PO («a volte la telecronaca racconta azioni
importanti ma non si vedono») è l'ultimo rapporto: da **22 racconti per ogni azione mostrata** a **2,2**.

**Dichiarato e NON verificato**: i gol a partita passano da 3,67 a 4,00 — due gol di differenza su 24 in
sei mondi. Il piano dell'occasione muove giocatori e pallone, e da lì possesso e momentum, che il
microsim legge: una deriva è possibile. Con sei partite non è distinguibile dal rumore, e non l'ho
misurata su un campione che possa deciderlo. Il guardiano dice che nulla viene *mangiato*
(8 gol nati, 8 accreditati, 0 mangiati) e che il tabellone combacia col racconto (6-4 = 6-4).

career-critical EXIT 0 · CI EXIT 0 · fingerprint 00001505 · 0 failure · 191 situazioni · guardiano 12/12.
NON verificato sul telefono.

---

## 7.791 — La freccetta televisiva guarda dalla parte giusta anche in trasferta

Collaudo PO 05/09, con fotografia al 69': «la direzione della freccetta televisiva è sbagliata, la
squadra dell'eroe attaccava dall'altro lato».

### Le due «case» — terza volta che questa trappola si presenta

Nel gioco convivono **due nozioni di casa**, ed è la stessa collisione del 7.52.2 (lato-mesh) e del
7.278 (festa in trasferta):

| | chi è «casa» | dove attacca |
|---|---|---|
| **frame 3D** | sempre la squadra dell'**eroe** (src/14 r.775: «l'eroe è sempre reso home nel 3D») | verso x alte, **sempre** |
| **campo** | `homeTeamObj` (r.7286): in trasferta **l'avversario** | — |

La capsula del verso leggeva la seconda mentre **descriveva la prima**. Il commento del 7.697 se n'era
convinto in buona fede — «nel motore la casa attacca sempre a destra, quindi la mappa non mente» — ed è
vero per il motore e falso per la capsula, che prende i **nomi** dall'altra nozione. La stessa
convenzione eroe-centrica governa `score.h`, che è sempre il punteggio dell'eroe: lo usa `_lead38` per
decidere se il mister lo risparmia.

### Misura, su carriera vera (sonda `verso-791`)

| | capsula | simulazione (linee difensive) | |
|---|---|---|---|
| **casa** prima | CEL › ‹ VER | home x=20,2 · away x=73,8 → a destra attacca CEL | coincide |
| **trasferta** prima | **PER › ‹ CEL** | home x=20,3 · away x=79,2 → a destra attacca **CEL** | **diverge** |
| **trasferta** dopo | **CEL › ‹ PER** | idem | coincide |
| casa dopo | CEL › ‹ VER | idem | coincide |

Rosso `__CPM_NO791`.

### La seconda metà della nota: NON RIPRODOTTA

«Dopo la sostituzione dell'eroe continuavano le interazioni interattive.» Due misure, entrambe a zero:

1. **Sostituzione vera** (carriera, stanchezza 70 → uscita al 66-67'), con la risposta automatica
   **spenta nell'istante dell'uscita** — da lì una scena interattiva resterebbe bloccata e sarebbe
   impossibile non vederla: **0 scene** dopo l'uscita su 3 partite (45-106 campioni ciascuna), contro
   **51 viste prima**.
2. **Leva d'uscita tirata DENTRO una scena**, per aprire la porta della catena (r.6884/6934, che
   rientrano in `hl_intro` senza chiedere se l'eroe sia in campo): **0 ingressi in scena nuovi** in
   4 partite su 4. Si conclude solo la scena **già in volo**, che era partita con l'eroe in campo.

**Due errori miei in questa misura, a verbale.** Il primo strumento usava la leva dentro il *provino*,
che non è contesto «career» e dove una sostituzione non può avvenire per costruzione — e leggeva la fase
dallo stato del 3D invece che da `__CPM_PHASE()`, con il cronometro fermo: 200 campioni tutti «playing»
e mai il 90'. **Un verde da uno strumento fermo non è un verde.** Il secondo contava i **campioni** in
fase di scena invece delle **scene**: 4 partite su 4 «rosse» con 28 voci, che erano 6-8 letture della
stessa schermata di esito. Una scena che finisce non è una scena che comincia.

Serve al PO dire **in quale situazione** l'ha visto (dopo un'espulsione? in Coppa? subito dopo quale
azione?) — con quello si torna a cercare.

---

## 7.792 — L'occasione nasce da dove sono gli uomini, e le parole seguono il campo

Seconda metà della nota del PO: «le azioni pericolose extra eroe continuano ad essere azioni
**"matematiche" e non di calcio vero**, devono essere super credibili». Il 7.790 aveva risolto la
rarità; questa è la credibilità.

### La misura che inchioda

Battuta d'**apertura** di ogni occasione (il passaggio), sei partite:

| | prima | dopo |
|---|---|---|
| distanza fra chi RICEVE e dove atterra il pallone — mediana | **37 u** | **7,5 u** |
| massimo | 74,4 u | **8,4 u** |
| casi oltre 12 u (il portatore **decade**, palla senza padrone) | **11 / 12** | **0 / 9** |

Le 12 u non sono una soglia inventata: è quella del 7.642 (`src/14` r.5384), oltre la quale il portatore
viene azzerato. Il passaggio atterrava dove non c'era nessuno, e la palla proseguiva **sola**. È quello
che si vede e si chiama «matematica».

### Due cause, entrambe nel piano

1. il protagonista si sceglieva a **sorteggio cieco** fra tutti i giocatori di movimento
   (`_mpO[hash % length]`), senza guardare né dove fosse né che ruolo avesse;
2. il pallone andava su **coordinate in scatola** — 84, poi 93, poi 96 — mentre l'uomo più avanzato del
   lato, misurato, sta ad avanzamento mediano **57,6**. L'area la chiedeva il testo, non il campo.

In più il commento del 7.693 — «l'uomo che il testo NOMINA si porta sul punto d'arrivo» — descriveva un
blocco **vuoto**: quel codice non è mai esistito.

### Il rimedio: si inverte l'ordine

Prima si guarda **chi c'è e dove**, poi si scrive. Il ricevente è uno dei tre più avanzati; il pallone
gli arriva **addosso** (4-8 unità davanti, nello spazio, come un passaggio vero); la conclusione parte da
lì e vola in porta — che il pallone lasci il tiratore è calcio, non teletrasporto; il portiere resta
l'unico a stare sulla linea. Le **parole** si scelgono dopo, dalla zona da cui si tira davvero: in area
«a due passi», sul limite «dal limite», più lontano «da fuori». Rosso `__CPM_NO792`.

**Un errore mio nella misura, corretto prima di spedire**: contavo anche la battuta del TIRO come
difetto. Ma lì il pallone *deve* lasciare il piede — misurando la distanza uomo-pallone dopo un tiro,
contavo come errore proprio ciò che deve succedere. Il verdetto sta sulla sola apertura.

**Tolti i metri dalle frasi**: si tira ad avanzamento mediano 63, molto più lontano dei «venticinque
metri» che la prima stesura annunciava. Una cifra sbagliata è una bugia in più, e il punto della release
è togliere le bugie.

### Dichiarato e NON risolto

- **La squadra non sale**: il più avanzato sta ad avanzamento mediano 56, quindi **6 conclusioni su 9
  partono da fuori area**. L'occasione ora è onesta ma **meno pericolosa** di quanto il vecchio testo
  fingesse. Il passo successivo è far salire i ventidue quando l'occasione si arma — un cambiamento del
  **movimento**, non del racconto.
- **Occasioni armate 1,5 a partita** contro le 2,0 della 7.790: il piano manda il pallone altrove, e lo
  stato che apre il cancello cambia di conseguenza. Restano **nove volte** le 0,17 di partenza.

---

## 7.793 — REVOCATA. La salita della squadra non sopravvive al tick, e il numero che «migliorava» era una mia finzione

*(nessun bump: `_apri714`, il piano e le parole restano quelli della 7.792. Si committa la diagnosi.)*

**Il tentativo**: far salire di nove unità i tre uomini più avanzati nell'istante in cui l'occasione si
arma — lo stesso device della catena del 7.537 (+7u) — e calcolare il piano sulle posizioni **previste**,
così che la zona del tiro e le parole nascessero da dove gli uomini sarebbero stati.

| | 7.792 | 7.793 (tentativo) | dopo la revoca |
|---|---|---|---|
| zona del tiro, avanzamento mediano | 63 | **72** | 63 |
| «dal limite» / «da fuori» | 2 / 6 | **8 / 2** | 2 / 8 |
| **apertura: distanza dal ricevente, mediana** | **7,5 u** | **14,3 u** | **6,1 u** |
| apertura oltre 12 u | **0 / 9** | **10 / 11** | **0 / 11** |

Le prime due righe dicevano «funziona». La terza dice perché era falso: **l'uomo non si era mosso**. Alla
battuta d'apertura il nominato si misura ancora ad avanzamento 54-56, dov'era prima della salita, e la
distanza in più è **esattamente** le nove unità che avevo aggiunto al bersaglio. La scrittura una-tantum
delle posizioni non sopravvive al tick successivo — il sistema di movimento riporta indietro i giocatori
— e la salita esisteva solo nella mia previsione. Il **72 non era dove si tirava: era dove avevo deciso
io che si sarebbe tirato.** Avevo reintrodotto di soppiatto lo stesso difetto che il 7.792 aveva appena
tolto: le parole davanti al campo.

**Conseguenze a verbale**, oltre la revoca:
1. far salire la squadra non si fa scrivendo una posizione, si fa agendo sul **sistema di movimento**;
2. la stessa domanda ora pende sullo **staging della catena del 7.537**, che usa lo stesso device (+7u) e
   **non è mai stato misurato**: se anche lì la scrittura non regge, quel commento descrive un effetto
   che non c'è.

---

## 7.794 — Il pallone è in proporzione e poggia sull'erba

Collaudo PO 06/09, con due fotografie: «il pallone è troppo grande e sproporzionato». Vero, e si misura.

| | prima | dopo | un pallone vero |
|---|---|---|---|
| diametro / altezza di un uomo (2,22 u) | **31,7 %** | **19,8 %** | 12,2 % (22 cm su 180) |
| quanto galleggia sopra l'erba | **0,30 u** (≈ 24 cm) | **0** | 0 |

Era **2,6 volte** troppo grande: un pallone da spiaggia. E non era solo grande, **galleggiava**: la
convenzione «terra» del pallone era la quota 0,65 scritta a mano in una ventina di punti, mentre l'erba
sta a y=0 e il raggio effettivo era 0,35.

**Non è una scoperta nuova.** Il 7.609, sistemando il palleggio, l'aveva già messo a verbale: «*che la
convenzione 0,65 faccia levitare un pallone di raggio 0,32 è un altro discorso, storico e ovunque: non
si tocca qui di passaggio*». Il discorso è questo, e il momento è adesso che il PO l'ha visto.

Geometria 0,32 → 0,20 (alone 0,46 → 0,29, stessa proporzione) e quota di terra 0,65 → 0,22 in tutti i
punti. Gli archi non cambiano forma: in ogni formula 0,65 era il riferimento di terra e compare sempre
in differenza (`quota − 0,65`), quindi spostando il riferimento l'altezza **sopra il terreno** resta
identica. Rosso `__CPM_NO794`.

### Un errore mio, col gate rosso a testimoniarlo

La prima stesura definiva una costante `_BY794` a livello di modulo. **Gate rosso, 12 rilievi**
`_BY794 is not defined`. È la lezione già scritta nel 7.786: la suite analitica **estrae** la funzione
dell'arco dal sorgente e la fa girare **isolata**, dove nessun simbolo di modulo esiste. E due *guardie
di consistenza* controllano che la formula del motore contenga **letteralmente** la quota di terra —
apposta perché il modello analitico non possa scollarsi dal motore senza che nessuno se ne accorga.
Qui il letterale non è pigrizia: è il modo in cui questo progetto tiene onesto il proprio specchio.
Aggiornati insieme motore, specchio analitico e le due guardie.

### Dichiarato

- **19,8 % è ancora 1,6 volte la proporzione vera**, ed è una scelta: a questa distanza di camera un
  pallone in proporzione esatta misura una manciata di pixel sul telefono (è il motivo per cui il 3DV-1
  gli aveva messo un alone). Se il PO lo vuole più piccolo è **un numero solo**.
- **Nelle riprese ravvicinate** la scala scende a 0,53, quindi lì il pallone resterà ~0,11 sopra l'erba:
  un decimo di prima. Legare la quota alla scala viva è il passo dopo, e va misurato a parte.

---

## 7.795 — «Ping pong ripetuto»: RIPRODOTTO, e il rimedio REVOCATO

*(nessun bump: la revoca lascia il comportamento della 7.794. Si committano la diagnosi e la sonda.)*

Nota PO sulla 7.792 (S.11 W.17, 33', SIT #67): «ha mostrato un **ping pong ripetuto**, un tiro da
distanza enorme… insomma non è calcio ma una sequenza di bug».

### Il difetto è riprodotto — ma ho sbagliato bersaglio due volte

| dove ho cercato | esito |
|---|---|
| dentro le scene dell'eroe (pallone reso) | **0 / 8** |
| nel flusso, ma sul punto-palla **logico** | **0 / 8** |
| nel flusso, sul pallone **RESO**, 5 s dopo ogni parata | **5 / 10** — mediana **3** inversioni, max 4 |

I primi due zeri non erano verdi: erano **strumenti puntati sulla cosa sbagliata**. Il PO guarda il
pallone **reso**, e il codice 011 aveva già misurato che il reso e il logico divergono di 9-17 unità.
*Uno zero sul pallone sbagliato non è un verde.*

Le ampiezze delle inversioni — 2,0 · 2,4 · 3,1 · 4,6 · 5,5 unità — sono **la distanza fra due corpi
vicini**, ed è la firma del difetto.

### L'ipotesi, e perché è caduta

Il pallone reso è **incollato al portatore eletto** (`ball.position = portatore + 0,9`), e l'elezione
sceglie per vicinanza al punto **logico**, che si muove a ogni tick: quando il vincitore cambia, il
pallone **salta da un corpo all'altro**. Dopo una parata il pallone è morto per regolamento (lo dichiara
già il 7.702), e un pallone morto non ha padrone → ho **sospeso l'elezione** durante il fischio.

| | verde | rosso |
|---|---|---|
| episodi di ping pong | **4 / 8** | 3 / 8 |
| inversioni, mediana | 3 | 2 |

**Nessun miglioramento, semmai il contrario** — e comunque dentro il rumore. **REVOCATO.** La causa
probabile del fallimento: il pallone resta morto solo per i quattro tick della transizione (~1,2 s)
mentre il ping pong si distende su cinque secondi; quando l'elezione riparte, riparte anche il salto.
Il rimedio vero è **l'anagrafe del possesso** — il redesign A2 che il 7.617 ha già messo a verbale —
non una porta chiusa per un secondo.

**Resta lo strumento**, che è la cosa di valore: `tests/visual/pingpong2-795.mjs` riproduce la nota del
PO in modo ripetibile, sul pallone giusto, con un verdetto in inversioni.

---

## 7.796 — CENSIMENTO: il blocco squadra non lo governa il bersaglio, lo governa il PASSO

*(nessun bump: sola strumentazione. È il risultato che vale di questa tornata.)*

Il 7.703 aveva provato ad alzare del 37% il termine che tira gli slot verso il pallone e **non aveva
mosso niente** — «la manopola non è collegata al volante» — chiedendo a verbale il censimento di **chi
governa davvero** il bersaglio di ogni giocatore. Eccolo, su **1919 campioni giocatore-tick**:

| passo `k` | quota | per colmare il 90% della distanza |
|---|---|---|
| **0,03** | **31,0 %** | 76 tick ≈ **42 s di gioco** |
| **0,04** | **28,1 %** | 56 tick ≈ **31 s di gioco** |
| 0,92 | 29,7 % | 1 tick |
| 0,35 | 7,9 % | 5 tick ≈ 2,9 s |
| 0,55 / 0,50 | 3,3 % | 3 tick |

**Distanza dal bersaglio: media 23,9 u · mediana 22,7 · p75 35,6 · p90 49 · max 82,8.**

Per **sei campioni su dieci** un corpo insegue un punto a ventitré unità guadagnandone il tre-quattro
per cento a tick: **non ci arriva mai**, e nel frattempo il pallone si è già spostato. Il bersaglio è
cosmetico. La leva è il passo — ed è la spiegazione del mistero che il 7.703 aveva lasciato aperto.

## 7.797 — REVOCATA: la squadra sale davvero, ma il prezzo è il difetto che il 7.792 aveva tolto

Usando la leva giusta: l'occasione si apre con una **salita** (i tre più avanzati, bersaglio nell'ultimo
quarto, passo 0,35 — 2,9 s per arrivarci) e il piano nasce **due tick dopo**, sulle posizioni
**raggiunte** — non previste, che era l'errore del 7.793.

| | 7.792 | 7.797 |
|---|---|---|
| il più avanzato, avanzamento **reale** | 56 | **66,4** |
| occasioni a partita | 1,5 | **2,0** |
| zona di tiro | 63 | 67,8 |
| **aperture oltre soglia** | **0 / 11** | **4 / 12** |

La leva funziona. **Il prezzo no**: le aperture che atterrano dove il ricevente non c'è tornano da zero
a quattro su dodici — è **esattamente la firma della «matematica»** che il 7.792 aveva appena cancellato.
Un guadagno di credibilità pagato con la ricomparsa del difetto peggiore non è un guadagno.

**Due errori miei, entrambi misurati e corretti in corsa**: bruciavo il cooldown a ogni salita anche
fallita (aperte 2, perse 2, **armate 0** — zero occasioni in sei partite) e annullavo la salita per un
semplice fermo di gioco. Corretti: aperte 2, **armate 2**, perse 0. Poi ho ipotizzato che il ricevente
«scappasse» perché continuava a correre e ho fermato la spinta all'armamento: **4 su 12 contro 3 su 12**,
nessun effetto — l'ipotesi era sbagliata, e la causa vera resta da trovare (la popolazione è **bimodale**:
otto aperture buone attorno a 6-8 u e quattro pessime attorno a 25-33 u).

---

## 7.798 — Se il pallone parte, qualcuno l'ha colpito

Codice 000 «gesto scoordinato», segnalato dal PO **quattro volte**: SIT #178 «Sterzata d'esterno e brucia
il terzino», #113 «Assist di prima senza guardare», #17 «Cross teso», #87 «Cross cieco di prima».

### La misura

| | prima | dopo |
|---|---|---|
| azioni che finiscono in **rete o assist** mentre il gesto **non tocca il pallone** | **91 / 573 (15,9 %)** | **0** |
| — di cui gol | 51 | 0 |
| — di cui assist | 40 | 0 |

**Una azione su sei.** «Finta e tiro» che segna **senza calciare**. «Dribbling portiere» che segna senza
calciare. «Scatto e servi il compagno» che serve senza calciare. Tutte di famiglia `dribble` (38) o
`build` (53). Col rosso `__CPM_NO798` acceso tornano 91.

### La causa

Il vocabolario dei gesti ha **sei voci in tutto** — kick, volley, header, penalty, dribble, tackle — e
per un'azione che ne richiederebbe **due** (la finta **e poi** il tiro) ne viene resa **una sola**: la
prima, cioè quella che il pallone non lo manda via.

La regola nuova è quella del 7.784 applicata dall'altro lato: il 7.784 impediva che una **consegna**
fosse resa come conclusione; questa impedisce che una **conclusione** (o una consegna) sia resa come una
**conduzione**. Il gesto segue l'esito dichiarato, che è quello che il pallone fa davvero.

### Un errore mio, prima di trovare la forma giusta

Avevo inventato **un lessico mio** di «gesti senza calciata» e contato le etichette che lo usavano:
**14 casi, e nessuna delle quattro segnalate dal PO**. Solo guardando **esattamente quelle quattro** il
difetto si è mostrato per quello che è — e il criterio giusto non aveva bisogno di lessici: *se il
pallone parte, qualcuno deve averlo colpito*.

### Le due baseline, e come sono state rigenerate

Il gate è andato rosso due volte, ed è il suo mestiere. **backbone-regression**: 73 scene, 91 azioni —
verificato a macchina che **tutte e 91** fossero della forma `dribble/build → shot/pass`, zero
cambiamenti di altra natura, e il 91 combacia col numero misurato dalla sonda. **timeline**: DRIFT=5 su
24 nella `decision-baseline`, e le cinque righe cambiano **solo il gesto** — `intent` e stato del
pallone restano identici. Solo dopo averlo verificato le baseline sono state rigenerate.

### Dichiarato e non risolto

La **finta che precede non si vede comunque**, perché la clip resta una sola: renderne due in sequenza è
un lavoro sul vocabolario dei gesti, non su questa riga.

---

## 7.799 — REVOCATA per mancanza di un metro, non per una misura contraria

*(nessun bump: resta il comportamento della 7.798. Si committano strumento e diagnosi.)*

Nota PO (7.787, SIT #153 «Bordata da centrocampo» → goal): «**codice 111 — portiere fuori tempo**».

### L'osservazione c'è, ed è netta

In **tutti** i tuffi che sono riuscito a fotografare — cinque, su più passate — il tuffo si arma a
**0,58-0,62 s su un volo di 0,57-0,60 s**: rapporto istante/durata ≈ **1,03**. Il portiere si muove
**quando il pallone è già arrivato**. Non è «tardi»: è «dopo».

**La causa è leggibile**: il ramo del 7.652 voleva un portiere *battuto* — giusto — ma l'ha legato alla
**posizione** del pallone («ultime quattordici unità»), e una soglia di posizione su una traiettoria che
finisce in porta scatta per forza alla fine. Un portiere battuto vero **parte quando parte il tiro** e ci
arriva tardi: è l'allungo a essere corto, non la partenza a essere in ritardo.

### Perché si revoca

Il rimedio provato — armare il tuffo sul **tempo** (tre decimi dalla partenza dell'arco) invece che sulla
posizione — alla ri-misura **non ha spostato niente**. A quel punto ho guardato il **metro** invece del
rimedio:

| passata | tuffi osservati |
|---|---|
| 1ª | **4** |
| 2ª | 3 |
| 3ª | **0** |
| 4ª | **0** |
| 5ª | 1 |

Codice quasi identico, campione portato fino a **settantadue azioni forzate**. Un metro che oscilla così
non può promuovere né bocciare un rimedio — è la stessa lezione del 7.617 sul metro del portatore.

### Due errori miei, entrambi a verbale

1. La prima stesura strumentava **uno solo** dei **nove** siti che armano il tuffo, e contava zero: uno
   zero che diceva qualcosa sulla sonda e niente sul gioco.
2. Aggiungendo tre campi al testimone (stato dell'arco e post-arco) il conteggio è andato a **zero due
   volte di fila** — non perché il gioco fosse cambiato, ma perché **il testimone taceva**.

**Resta la strumentazione su tutti e nove i siti.** Chi riprende il punto parte da un'osservazione
precisa e da uno strumento che va prima reso ripetibile.

---

## 7.800 — Il portiere non ha tempo di reazione. E una ritrattazione

*(nessun bump: diagnosi e metro. Il rimedio è il passo dopo.)*

### Ritrattazione della diagnosi del 7.799

Avevo scritto che il portiere «si tuffa **quando il pallone è già arrivato**», rapporto istante/durata
**1,03**. **Era un artefatto della mia sonda**: registravo il tempo dell'arco senza chiedere se un arco
fosse davvero **in corso**, e un tuffo armato ad arco già finito si portava dietro la **durata vecchia**
col tempo azzerato — finendo nel mucchio come se fosse partito alla fine. Chiesto `ballArcActive`, quei
campioni spariscono e **il quadro si ribalta**.

### La misura vera

Quattro partite intere, **39 tuffi con un arco effettivamente in corso**:

| | valore |
|---|---|
| istante del tuffo — mediana, p25, p75, **max** | **0,00 s** |
| durata del volo — mediana | 0,52 s |
| tuffi partiti a pallone già arrivato | **0 / 39** |

Il portiere parte **nello stesso istante in cui parte il pallone**, senza un decimo di reazione. Su un
tiro corto quasi non si nota; su una **bordata da centrocampo** si butta subito e poi resta a terra
mentre la palla vola per mezzo secondo. È quello che il PO ha visto. **Non è in ritardo: è in anticipo,
di tutto il tempo di volo.**

### Il metro ora regge — e anche qui avevo sbagliato criterio

Giudicavo la sonda dal **conteggio** dei tuffi, che oscilla per forza (10-25 a partita) perché dipende da
quanti tiri ci sono in quella partita. Il metro giusto è la **quota**, che è una frazione:

| | Oa | Ob | Oc | Pa | spread |
|---|---|---|---|---|---|
| tuffi | 25 | 13 | 12 | 10 | — |
| **quota fuori tempo** | 0 % | 0 % | 0 % | 0 % | **0 punti** |

Con una frazione a spread zero un rimedio si può giudicare; col conteggio no.

### Il rimedio, per chi riprende

Serve un **tempo di reazione** (due-tre decimi) fra la partenza del pallone e l'inizio del tuffo, e va
messo **dove il tuffo nasce**: i tuffi arrivano da **quattro rami diversi**, quindi non basta toccarne
uno — è l'errore che ho già fatto due volte su questo punto.

---

## 7.801 — Il portiere ha un tempo di reazione (parziale, dichiarato)

**Nota PO** (7.787, SIT #153, 50', «Bordata potente» → goal): *codice 111 — portiere fuori tempo*.

### La misura di partenza

Quattro partite intere, GLB ON, regime del gioco. Filtrando **solo** i tuffi che nascono mentre un
arco è davvero in corso (`ballArcActive`), il campione è di **39 tuffi**, e l'istante del tuffo
rispetto alla partenza del pallone è:

| | mediana | p25 | p75 | **max** |
|---|---|---|---|---|
| istante del tuffo | 0,00 s | 0,00 s | 0,00 s | **0,00 s** |
| durata del volo | 0,52 s | — | — | — |

**Trentanove su trentanove partivano a zero**, massimo compreso. Il portiere non era in ritardo: era in
**anticipo di tutto il tempo di volo**. Su un tiro corto quasi non si nota; su una bordata da
centrocampo si buttava a terra nell'istante del tiro e ci restava mentre la palla volava mezzo secondo.

### Il rimedio, in un punto solo

I nove siti che **armano** `oppActType="gk_dive"` restano intatti: la decisione del portiere è nel
momento giusto, è il **corpo** che deve aspettare. Il ritardo sta dove il tempo dell'azione avanza
(`oppActT+=aDt`, src/12): se il tuffo nasce con un arco appena partito (`ballArcT<0.10`) si arma
un'attesa di **0,25 s**; finché scorre, il tempo dell'azione non avanza e il corpo non parte.
Non c'è alcun `return`: camera, pallone e rendering continuano — la prima stesura usava un `return`
dentro la funzione di fotogramma e avrebbe saltato tutto il resto.

Rosso: `__CPM_NO800`.

### La misura dopo

| | prima | dopo |
|---|---|---|
| tuffi con un'attesa | **0 / 39 (0 %)** | **50 / 96 (52 %)** |
| attesa mediana | — | **0,3 s** |

Per mondo: 34 % · 42 % · 92 % · 100 %.

**PARZIALE E DICHIARATO.** L'attesa si applica solo ai tuffi che nascono **mentre il pallone vola**.
Quelli armati senza un volo in corso — su palla non in volo, dove non esiste un «istante del tiro» a
cui agganciarsi — restano da fare. Il 52 % è quella frazione, non un rimedio a metà strada.

### Due ritrattazioni

1. **«Il portiere si tuffa a pallone già arrivato» (rapporto 1,03) era un artefatto della sonda.** La
   sonda registrava il tempo dell'arco senza chiedere se un arco fosse **in corso**: i tuffi armati ad
   arco finito portavano la durata vecchia con il tempo azzerato, e il rapporto usciva ≈1. Il difetto
   vero è l'opposto di come l'avevo scritto.
2. **Giudicavo la sonda dal conteggio dei tuffi**, che oscilla fra 10 e 25 a partita perché dipende da
   quanti tiri ci sono. Il metro è la **quota**.

### Rituali

`career-critical` EXIT 0 · `npm run ci` **fingerprint 00001505 · 0 failure** · save-compat 12/0 ·
replay 8/8 · logic 33/33 · partita-vera OK (tabellone 7-4 = 7-4, gol del microsim 8 nati / 8 accreditati).

---

## 7.802 — Il regista unico: DUE tentativi, DUE revoche, e un banco che non regge

**Direttiva PO 06/09**: «i momenti dell'eroe non devono essere preconfezionati, ma basarsi
sull'andamento della partita ed altri aspetti» · «il regista in partita degli eventi deve essere
UNO SOLO».

### Prima, una correzione a verbale

Nel rapporto di playtest avevo scritto che il momento dell'highlight «non ha una sola lettura del
Match State». **È falso**, e il PO ha chiesto conto della frase. Le letture ci sono: tre agganci
reattivi possono inserire un momento fuori calendario — gol subito (`nx+4…8`), sotto di uno **al
60' esatto**, disperata **al 72' esatto**. Il quadro giusto: *il calendario è la spina dorsale, i
tre agganci sono l'eccezione, e due dei tre sono a loro volta orari.*

### Il rimedio, e le sue due morti

Il calendario resta il **budget** (quanti momenti: la carriera non si tocca); il **minuto** lo
sceglie un solo punto, dentro una finestra di ±6' attorno alla tacca, quando l'andamento è forte
— tre voci su cinque fra turno, inerzia, possesso, pallone oltre il 58, e il bisogno di chi è
sotto nell'ultimo terzo. Rosso `__CPM_NO803`.

| misura appaiata, 4 partite, stessi semi | v1 ON | v2 ON | ROSSO |
|---|---|---|---|
| momenti totali | 12 | 12 | 12 / **11** |
| aperti dall'**andamento** | 3/12 | **1/12** | 0 |
| aperti a **scadenza** | 9/12 | 11/12 | — |
| **andamento forte all'apertura** | **3/12** | **1/12** | **5/11 · 4/11** |

**v1 revocata**: nove momenti su dodici scadono, e la qualità del momento *peggiora* rispetto
all'orologio (3/12 contro 5/12). **v2 revocata**: peggio ancora, 1/12.

### Il censimento che assolve la partita

355 minuti su 4 partite intere:

| andamento | quota |
|---|---|
| turno nostro | 40 % |
| inerzia ≥ 55 | 39 % |
| pallone oltre il 58 | 42 % |
| possesso ≥ 52 | 19 % |
| **≥ 3 voci su 5** | **13 %** (47/355) |

Pallone x: mediana 50,1 · **p75 79,6 · p90 92**. La squadra in area ci arriva. Con il 13 % dei
minuti forti, una finestra di tredici minuti dovrebbe contenerne uno **quattro volte su cinque**:
il regista lo trovava una volta su quattro (v1) e una su dodici (v2). **Non mancano le occasioni.**

### E il difetto vero: IL BANCO NON È RIPETIBILE

Due passate del regime **ROSSO** — stesso codice, stessi semi, stessi nomi — hanno dato risultati
diversi: `Gallo` 4 momenti `[15,66,67,86]` alla prima, 3 momenti `[15,66,86]` alla seconda; totale
12 contro 11. Il rosso deve essere identico a se stesso: se non lo è, **ogni confronto fine a
n=4 è rumore**, e le due revoche qui sopra potrebbero aver buttato via un rimedio buono o salvato
un rimedio cattivo — non lo so, ed è il punto.

Causa probabile: gli agganci reattivi dipendono dal punteggio, il punteggio dal microsim, e il
numero di tick di motore per minuto di gioco dipende dai timer reali sotto carico. Non l'ho
verificato.

**Conclusione**: il regista si ferma qui. **Prima si rende ripetibile il banco**, poi si torna
sul rimedio — perché tarare contro un banco che oscilla è esattamente il modo di convincersi di
aver risolto qualcosa. Il codice del regista è stato tolto: in `src/14` resta solo lo strumento
`__CPM_CRO802` (le righe di telecronaca col loro minuto), che è sola lettura.

---

## 7.802 — Il regista è UNO SOLO, e guarda la partita (dopo tre revoche)

**Direttiva PO 06/09**: «i momenti dell'eroe non devono essere preconfezionati, ma basarsi
sull'andamento della partita ed altri aspetti» · «il regista in partita degli eventi deve essere
UNO SOLO».

### La misura che condanna il calendario

16 partite, regime rosso (`__CPM_NO803`, cioè il comportamento di sempre):

| | rosso |
|---|---|
| prima scena | **sempre il 15'** — ampiezza 0' su 16 partite |
| ultima scena | 84-86' |
| fase forte della partita al momento dell'apertura | **8 su 86 — il 9%** |
| distanza minima fra due momenti | **1'** (coppie 64-65, 65-66, 79-80) |

Il 9% coincide col censimento dell'andamento: **l'orologio e il caso sono indistinguibili**.

### Il rimedio

Il calendario resta il **budget** — quanti momenti l'eroe ha in quella partita non cambia, e con
esso la carriera. Il **minuto** lo sceglie un solo punto, che legge l'andamento **in relativo**:
memoria degli ultimi dieci minuti, si apre sul **picco** di quella finestra. Così «forte» vuol
dire *forte per questa partita*, e anche una gara bloccata ha i suoi momenti migliori. Passo
minimo di otto minuti (niente raffiche) e tabella di marcia distribuita sulla partita.

| ON contro rosso, 16 partite per regime, stessi semi | v4 | rosso |
|---|---|---|
| momenti aperti dall'**andamento** | **68/76** | 0/86 |
| momenti aperti dall'**orologio** | 0 | 86/86 |
| **fase forte all'apertura** (controllo indipendente) | **23/76 — 30 %** | 8/86 — 9 % |
| ampiezza della prima scena | **17'** | **0'** |
| distanza minima fra momenti | **8'** | 1' |
| momenti totali | **76** | 86 |

Il 30 % contro 9 % è il numero che regge il rimedio, perché **non dipende dall'etichetta che dà
il regista a se stesso**: è la domanda indipendente «al momento in cui la scena si è aperta, la
partita era davvero in una fase forte?». Tre volte e mezzo meglio del calendario.

**PREZZO DICHIARATO: 76 momenti contro 86, il 12 % in meno.** È il costo di aspettare che la
partita offra il momento invece di prenderlo a orario, ed è coerente con la regola del PO — «se
servono meno highlight per rendere la partita più realistica, riduceteli». `career-critical`
**PASS**: la carriera non si muove.

### Tre versioni revocate prima di questa

- **v1** — una scadenza per ogni tacca: i ritardi si sommavano e si scaricavano in raffica
  (`[21,85,86,87,88,89]`), con due partite su sedici a **un solo momento**. 3/12 dall'andamento,
  e qualità *peggiore* dell'orologio (3/12 contro 5/12).
- **v2** — memoria del minuto invece dell'istante: **1/12**. Peggio.
- **v3** — soglia assoluta e recupero di coda: un **metronomo**, `[64,72,80,88]` identico in
  **12 partite su 16**, con l'eroe senza un momento per la prima ora in 13 su 16.

### Il registratore della decisione, che ha spiegato tutto

Minuti 9-56, quattro partite: cancello aperto 45/48, passo 48/48, eroe in panca 0/48, budget
finito 0/48 — e **andamento ≥ 3 voci: 0 su 48** in tre partite su quattro. Il regista era
coerente: non apriva perché non c'era niente da aprire.

**Il 9 % di minuti forti è quasi tutto dopo il 56'**, e il possesso **non supera mai 53** su 336
minuti (mediana 44): la voce «possesso ≥ 52» era spenta nel 91 % dei casi. La soglia assoluta era
tarata su una partita che non esiste. Da qui il passaggio al criterio relativo.

### Correzione a verbale

Avevo scritto che il momento dell'highlight «non ha una sola lettura del Match State». **È
falso**: tre agganci reattivi esistono (gol subito, 60', 72'). Il quadro giusto è che il
calendario è la spina dorsale e due dei tre agganci sono a loro volta orari.

### Aperto

- **La prima scena cade al 12' in 15 partite su 16.** Ho tolto l'orologio dal resto della gara,
  non dall'apertura.
- I due agganci reattivi a minuto fisso (60', 72') non sono stati toccati.
- Una partita su sedici scende a 2 momenti, sotto la banda del rosso.

### Rituali

`career-critical` **PASS** · `npm run ci` **fingerprint 00001505 · 0 failure** · guardiano
partita-vera 13 bande verdi (tabellone 4-4 = 4-4, gol del microsim 7 nati / 7 accreditati).

---

## 7.803 — «La palla non entra in porta»: difetto confermato, DUE rimedi revocati, causa spostata

**Nota PO (06/09, due volte in due partite diverse)**: *«azione pericolosa extra eroe e gol ma la
palla non entra in porta!»*

### La misura del prima — il difetto è peggio di come lo raccontava il codice

Sei partite, quattordici gol, pallone **reso**, campo 0-100 con le porte a 0 e 100:

| | valore |
|---|---|
| gol in cui il pallone raggiunge la linea | **0 su 14** |
| massimo avvicinamento **assoluto** | **94** |
| mediana | **80,8** |

Non è «si ferma a quattro metri dalla linea»: su metà dei gol il pallone **non è nemmeno
nell'ultimo terzo** quando il tabellone si muove, e due gol dell'eroe l'avevano a **26** e **46**.

### I due rimedi, e perché sono stati revocati

**Pezzo 1** — la battuta che segna puntava a 92-94; un taglio duro `clamp(x,4,96)` in tre punti
l'avrebbe fermata comunque. Ora punta a 101 con la y fra i pali, e il taglio si apre **solo** per
la battuta marcata `rete`. → **1 gol su 13**, mediana 92.

**Pezzo 2** — la ritenuta dell'arrivo considera il pallone «arrivato» entro **otto unità** dal
bersaglio: col bersaglio a 101 il piano si chiudeva a **93**, che è esattamente la mediana
misurata. Per la sola battuta `rete`: soglia a 2 unità, attesa 3 tick. → **2 gol su 16**,
mediana 84,5.

**REVOCATI ENTRAMBI.** Le tre mediane — 80,8 · 92 · 84,5 — non sono una progressione ma rumore su
un banco che è stocastico per costruzione (misurato: la stessa partita finisce 6-2 o 5-2). Un
rimedio che non si distingue dal caso non si spedisce.

### Quello che la misura ha insegnato, e vale più del rimedio

La colonna della provenienza:

```
Db 76'  home [highlight]         30,8
Dc 75'  home [highlight]         62
De 11'  home [highlight]         94
Dc 67'  away [scena-difensiva]  100,6   ✅ l'unico che entra
```

**I gol dell'eroe (`highlight`) non passano dal piano-gol**: due ore spese su una strada che quei
gol non percorrono. E l'unico gol col pallone davvero in rete arriva da una **terza** via,
`scena-difensiva`, sistemata nel 7.759 per tutt'altro motivo — e quella funziona.

**LA CAUSA VERA È PIÙ A MONTE: esistono almeno tre strade per segnare, e ognuna tratta il pallone
a modo suo.** Una lo porta in rete, le altre due no. È lo stesso difetto strutturale del regista
degli eventi (7.802) — più macchine che decidono la stessa cosa — applicato al gol. Il rimedio non
è una coordinata: è **un solo punto in cui un gol mette il pallone in rete**, qualunque strada
l'abbia generato. Non l'ho scritto: lo lascio come bersaglio dichiarato, con la misura pronta
(`tests/visual/rete-808.mjs`) e il numero da battere — **0 su 14**.

---

## 7.803 (seguito) — LA SCOPERTA: il pallone che il gioco calcola e il pallone che il player vede sono DUE OGGETTI DIVERSI

Terzo rimedio sul difetto «la palla non entra in porta», e la diagnosi che ne è uscita vale più
di tutti e tre i tentativi.

### Il terzo rimedio: un punto solo che mette il pallone in rete

Censimento: un gol viene accreditato in **cinque punti** (`highlight`, `microsim`, `cronaca`,
`setpiece`, `scena-difensiva`) e ognuno tratta il pallone a modo suo. Rimedio: **una** funzione,
chiamata dai quattro siti che non lo portavano in porta, che mette il pallone nella rete di chi
subisce e ce lo tiene per un secondo (il pallone ha **undici altri scrittori**).

Misura: **0 gol su 15** col pallone reso in rete. Mediana *peggiorata* a 67,3.

### La diagnosi che spiega tutto

| gol | pallone **logico** | pallone **reso** |
|---|---|---|
| 16' | **−1** (in rete, per 900 ms) | **62,9** — immobile |
| 49' | **101** (in rete) | **93,2** |
| 59' | **−1** | **26,6** |
| 84' | **−1** | **71,0** |

Il punto unico **è stato chiamato tutte le volte** (6 su 6) e il pallone **logico entra davvero in
porta e ci resta**. Il pallone **reso non si muove di un centimetro**.

**SONO DUE OGGETTI DIVERSI.** La telecronaca, i piani e i gol muovono la palla LOGICA; quella RESA
segue regole sue — è incollata al portatore o all'arco, e finché uno dei due è attivo vince contro
tutto il resto (`src/12`: `ball.position.x` ha almeno quattro scrittori, e il prop `ballX` è solo
uno di essi).

### Cosa spiega, tutto insieme

- **«Gol ma la palla non entra in porta»** (nota PO, due volte): il gol muove la palla che non si vede.
- **Codice 011 «palla congelata»** (task #31), che avevo già misurato dall'altro lato: *«il punto-palla
  logico è fermo al 100 % e il reso diverge di 9-17u, max 48u»*. È **lo stesso difetto** visto in
  specchio.
- Probabilmente il **«pallone sparato da lontanissimo»**: il reso parte da dove sta lui, non da dove
  l'azione dice.

### Verdetto

**Rimedio revocato** (non produce nulla di visibile: è la regola). **Diagnosi acquisita**, ed è il
bersaglio vero: *finché il pallone reso non obbedisce a chi racconta la partita, ogni cura sulle
coordinate è lavoro su un oggetto che il giocatore non guarda.*

Tre rimedi revocati su questo difetto in una notte — battuta che punta in rete, arrivo stretto,
punto unico — e tutti e tre curavano la palla sbagliata.

### Il censimento che chiude la diagnosi: QUINDICI scrittori, UNO ascolta la simulazione

`src/12`, tutte le assegnazioni di `ball.position.x`:

| chi scrive il pallone reso | siti |
|---|---|
| **il pallone LOGICO** (`P.ballX` — quello che telecronaca, piani e gol muovono) | **1** (r. 2145) |
| incollato a un giocatore / all'eroe / al ricevente del cross | 5 |
| l'arco di volo | 1 |
| bersagli di sistemi vari (670, 383, 546, 52) | 5 |
| replay, spinta post-highlight, palla ferma | 3 |
| **TOTALE** | **15** |

**Quattordici voci contro una, e vince l'ultima che scrive.** Il gol mette il pallone in rete
(misurato: logico a −1/101 per 900 ms) e un fotogramma dopo il portatore o l'arco lo riportano
dov'erano loro.

Non è un difetto localizzato: **non esiste una gerarchia**. Il pallone non ha un padrone che
decida chi comanda in quale momento, e la simulazione — che per la direttiva madre è la SOURCE OF
TRUTH — è in fondo alla fila.

**Il bersaglio, dichiarato**: una gerarchia esplicita del pallone reso, in cui ciò che la partita
afferma (un gol, una palla ferma, un esito) batte ciò che la scena sta animando. Non è una
taratura: è la stessa forma dei due difetti strutturali già trovati oggi — *più macchine che
decidono la stessa cosa*, dopo il regista degli eventi (7.802) e le cinque strade del gol.

### Quanto obbedisce il pallone reso? 64 %, e metà delle disobbedienze è legittima

Testimone a fine fotogramma (`__CPM_PADRONE`, sola lettura sotto `__CPM_REC`): confronta il
pallone reso con `G2X(P.ballX)` — cioè con quello che la partita afferma — e, quando divergono,
legge la **firma che ogni scrittore lascia già** in `sr.current._bj0.src`.

| una partita intera, 1028 fotogrammi | |
|---|---|
| il reso **segue** il logico (entro 2u) | **654 — 64 %** |
| non lo segue | **374 — 36 %** · scarto medio 6,4u · **max 79,2u** |
| di cui **arco di volo** | 54 % — **legittimo**: una palla in volo deve seguire la sua traiettoria |
| di cui **senza firma** | 46 % — **non attribuito**, il registro `_bj0` non è compilato lì |

**Il 36 % non è tutto difetto**: metà è il volo, che è calcio. Il difetto certo resta quello
isolato prima, più stretto e più grave di una percentuale: **quando la partita AFFERMA un gol, il
pallone logico entra in rete e ci resta 900 ms, e quello reso non si muove** — 6 gol su 6.

**Lezione sugli strumenti, la sesta della giornata**: la prima stesura del testimone inventava un
campo `_carrier` che non esiste e dava **0 % al portatore**, mettendo i suoi casi nel mucchio
«altro». *Uno zero netto su un sistema che si sa attivo è sempre lo strumento, non il gioco* —
riconosciuto in un minuto, non dopo una release.

### Il bersaglio per la prossima sessione

Una **gerarchia del pallone**: quando la partita *afferma* un fatto (un gol, una palla ferma, un
esito), quel fatto batte ciò che la scena sta *animando*. Non è una taratura ed è rischiosa —
l'arco vince il 54 % delle volte **a ragione**, e toglierglielo male trasformerebbe il pallone in
un teletrasporto. Serve la misura appaiata, che c'è già (`rete-808.mjs`, due numeri: entra **e**
ci resta ≥ 0,5 s; numero da battere **0 su 14**).

---

## 7.803 — IL PALLONE ENTRA IN RETE: la partita afferma, il pallone obbedisce

**Nota PO, due volte in due partite**: *«azione pericolosa extra eroe e gol ma la palla non entra
in porta!»*

### Il rimedio

Non si mette il guinzaglio ai quattordici scrittori — **l'arco di volo vince il 54 % delle volte e
ha ragione**. Si usa la loro stessa regola: *vince l'ultimo che scrive*. Un solo blocco scrive
**dopo tutti**, subito prima del disegno, e **solo mentre la partita afferma un fatto**: oggi una
finestra di 1,4 s aperta quando un gol viene accreditato, dai quattro siti che lo accreditano.
Fuori da quella finestra non tocca niente.

| | prima | dopo |
|---|---|---|
| gol col pallone in rete | **0 / 14** | **12 / 12** |
| e ci resta abbastanza da vedersi (≥ 0,5 s) | 0 | **12 / 12** |
| permanenza | — | **0,96 – 2,40 s** |

Vale su tutte le provenienze: `highlight` (eroe), `microsim` (ambientali), nostri e loro.

### Ritrattazione a verbale

**Due rimedi buttati poche ore prima erano probabilmente buoni.** La sonda misurava gli **undici
secondi PRIMA** del gol, e il pallone entra in rete **DOPO**: settimo strumento sbagliato della
sessione, e il primo che ha fatto **scartare una cura che funzionava** invece di spedirne una
inutile.

### Aperto e dichiarato

1. **L'azione non porta il pallone verso la porta.** Nella colonna «prima» restano 48,8 · 55,6 ·
   58,9 · 68: il tabellone si muove con la palla a metà campo. Il pallone ora *finisce* in rete e
   si vede; *come ci arriva* è ancora il racconto di una cosa e il campo di un'altra.
2. **Il difetto strutturale dei quindici scrittori NON è risolto**: qui se ne prende il caso più
   visibile, con una regola che vale solo mentre la partita afferma un fatto.

### Rituali

`career-critical` EXIT 0 · `npm run ci` **fingerprint 00001505 · 0 failure** · guardiano
partita-vera 13 bande verdi, comprese le due a rischio: `gol-con-manovra` 8/9 e `custodia` 7,1u.

---

## 7.804 — Il pallone non si teletrasporta: regressione della 7.803, corretta

**Nota PO al PRIMO collaudo della 7.803**: *«da azione pericolosa il pallone è andato in rete 2
volte consecutive SENZA SENSO ed il tiro è partito da centrocampo»*.

Ha ragione, ed è un difetto **introdotto da me**. La 7.803 metteva il pallone in rete **qualunque
fosse la sua posizione**, e la misura della 7.803 stessa lo diceva già (colonna «prima»: 48,8 ·
55,6 · 58,9 · 68). Ho curato «la palla non entra» e creato «la palla entra dal nulla».

### Il rimedio

L'affermazione vale **solo se il pallone è già nell'ultimo terzo** dalla parte giusta
(avanzamento ≥ 70). Se il gol arriva con la palla lontana non si sposta niente: **un pallone che
non entra è meno assurdo di un pallone che appare in porta**. La decisione si prende una volta per
affermazione, non a ogni fotogramma.

**Errore mio prima di azzeccarlo**: il primo cancello leggeva il pallone **LOGICO** in `src/14` —
che il piano ha già portato a 92-94 — e non gattava niente. È la **terza volta nella stessa
sessione** che confondo il pallone logico con quello reso: cioè esattamente il difetto che stavo
curando. Spostato in `src/12`, dove il pallone reso esiste.

| | 7.803 | **7.804** |
|---|---|---|
| gol **da lontano** teletrasportati in rete | **4/4** | **0/5** |
| gol con l'azione **già in zona** che entrano | — | **6/8** |
| gol in rete in totale | 12/12 | 6/13 |

**BARATTO DICHIARATO**: si vedono **meno** gol finire in rete, ma **nessuno appare dal nulla**. I
sette che non entrano sono quelli in cui il pallone non è davvero vicino alla porta — e quello è
**l'altro difetto, ancora aperto**: l'azione non porta il pallone verso la porta.

### Rituali

`career-critical` EXIT 0 · `npm run ci` **fingerprint 00001505 · 0 failure** · guardiano 13 bande
verdi, `gol-con-manovra` **10/10**.

---

## 7.805 — Il pallone sparisce con la telecronaca testuale · niente autogol apparente

### (1) Direttiva PO 07/09: «nascondi il pallone durante la telecronaca testuale»

È un rimedio **sottrattivo**, e il più onesto trovato finora. Durante la telecronaca il pallone
reso non sa raccontare ciò che il testo afferma — obbedisce alla simulazione nel **64 %** dei
fotogrammi, si teletrasporta, e il PO l'ha visto come *«un flipper»* e come *«cross nella terra di
nessuno»*. Invece di aggiungere sistemi per farlo quadrare, **si smette di mostrarlo quando non lo
sappiamo raccontare**.

Il 7.660 nascondeva già i 22 durante il testo ma teneva **esplicitamente** il pallone: è quella
decisione a essere rovesciata.

| | ON | ROSSO |
|---|---|---|
| telecronaca testuale (deve sparire) | **2 %** | 100 % |
| highlight (deve vedersi) | **100 %** | 100 % |
| azione saliente (deve vedersi) | **100 %** | 100 % |

Il 2 % residuo sono le transizioni di fase, ~1,5 s a partita.

**Errore intercettato dalla misura**: la prima stesura scriveva solo il ramo che NASCONDE e non
quello che RIMETTE — il pallone spariva anche negli highlight (**0 fotogrammi su 392**), cioè la
scena dell'eroe rotta per nascondere una palla. L'ha preso il terzo criterio dichiarato prima di
guardare i numeri.

### (2) Niente autogol apparente

Nota PO al collaudo della 7.804: *«il secondo gol da azione pericolosa SEMBRAVA UN AUTOGOL, il
difensore si è portato il pallone nella propria porta»*. Sul gol **subito** l'affermazione portava
il pallone nella **nostra** rete, e il cancello del 7.804 la fa scattare solo quando la palla è
già dentro la nostra area — dove stanno i nostri difensori. L'affermazione vale ora **solo per i
gol che facciamo noi**. Meno copertura, nessun autogol apparente: **il §20 non si negozia**.

### LEZIONE A VERBALE — la strumentazione non è gratis

La CI è stata **rossa due volte su due** (`gol-del-simulatore`, un gol mangiato) mentre:

| | esito |
|---|---|
| guardiano da solo, 7.805 | verde **3/3** |
| CI intera, 7.805 **con** i contatori | rossa **2/2** |
| CI intera, 7.804 di controllo | verde |
| CI intera, 7.805 **senza** i contatori | **verde** |

La causa erano **due contatori diagnostici** lasciati accesi a ogni fotogramma. Il banco è
sensibile ai tempi (misurato: la stessa partita finisce 6-2 o 5-2) e quel peso bastava a far
sparire un gol dal tabellone.

**Una sonda può cambiare la partita che sta misurando.** Per un giorno intero avevo creduto che
l'unico pericolo fosse che mentisse. I contatori diagnostici si tolgono appena hanno risposto.

### Rituali

`career-critical` PASS · `npm run ci` **fingerprint 00001505 · 0 failure** · guardiano
partita-vera 13 bande verdi (`gol-del-simulatore` 7 nati / 7 accreditati / 0 mangiati).

---

## Censimento 815 — «le azioni pericolose extra eroe sono rare e disegnate male» (nota PO 07/09)

Nello stesso messaggio il PO ha **chiuso la valutazione sulla telecamera**: *«va bene che la camera
si muove»*. La camera resta **libera**; non si blocca a centrocampo. A verbale, e non si riapre.

Resta il bersaglio nuovo, in due metà. Prima di toccare qualunque cosa, il censimento —
`tests/visual/disegno-815.mjs`, sei partite, banco tarato, GLB ON, sola lettura.

Il piano dell'occasione (`_pianoOcc695`) ha **tre battute** — apertura, tiro, parata — e ognuna
**dichiara** un punto d'arrivo del pallone. La domanda del censimento è una sola: *il pallone che
il giocatore guarda ci arriva?*

### RARE — il numero vero è 2,00, non 0,83

| | |
|---|---|
| occasioni extra-eroe a partita | **2,00** (12 aperture in 6 partite) |
| battute che arrivano al tiro | **12/12 (100%)** |
| battute che arrivano alla parata | **12/12 (100%)** |

Il 2,00 corregge lo 0,83 di una misura precedente presa su un banco diverso. E il 100/100 chiude
una **falsa pista**: le tre battute escono **tutte**, sempre. L'azione pericolosa non muore a metà.

### DISEGNATE MALE — il pallone non ci va. Mai.

| battuta | il pallone RESO arriva (≤6u) | distanza minima mediana | p90 | max |
|---|---|---|---|---|
| apertura | **1/12** | 11,7u | 26,2u | 31,1u |
| tiro | **1/12** | **37,6u** | 49,0u | 55,0u |
| parata | **1/12** | **40,7u** | 51,6u | 59,8u |

Quaranta unità su un campo lungo cento: mentre la telecronaca scrive *«conclusione secca dal
vertice dell'area»* e poi *«ci arriva in tuffo e la devia in angolo»*, **il pallone è a
centrocampo**. Non è un'impressione, sono le parole del PO una per una:

- *«ha detto la telecronaca che c'è stata una parata ma il motore non ha mostrato l'azione»*
- *«azione pericolosa finta, ha fatto vedere azione insignificante a centrocampo»*
- *«il tiro è partito da centrocampo»* · *«il pallone va dove gli pare»*

Sono tutte **la stessa cosa**, e questa è la misura che la nomina. Il punto #50 («annunciata e non
mostrata») non è un difetto a parte: è questo.

### E si tira da lontano

| zona da cui parte la conclusione (avanzamento dichiarato) | |
|---|---|
| area (≥82) | **1/12** |
| limite (70-82) | 4/12 |
| **lontano (<70)** | **7/12** |

Mediana 64. Conferma il punto #44 («la squadra non sale») dal lato del racconto: sette conclusioni
su dodici nascono fuori, e il piano le manda comunque a finire sulla linea di porta.

### La domanda che decide il rimedio

Restano due colpevoli, e sono due rimedi diversi:

1. il pallone **logico** non ci va → il difetto è nel piano o nel moto della palla;
2. il logico ci va e il **reso** non lo segue → è la gerarchia dei **15 scrittori** (punto #31).

`tests/visual/duello-816.mjs` li guarda nello stesso istante e nomina lo scrittore che vince il
fotogramma (nuovo accessore `__CPM_WS`, sola lettura, test-only). **Nessun rimedio prima della
risposta.**

## Censimento 816 — la risposta: **il racconto ha ragione, il campo non lo segue**

`tests/visual/duello-816.mjs`, stesse sei partite, i due palloni guardati **nello stesso istante**.

| battuta | il pallone **LOGICO** arriva (≤6u) | mediana | il pallone **RESO** arriva | mediana | scarto reso↔logico (mediana / max) |
|---|---|---|---|---|---|
| apertura | 2/15 | 9,7u | 1/15 | 13,4u | 25,2u / 35,2u |
| tiro | **9/15** | **4,6u** | **0/15** | **39,7u** | **39,7u / 51,7u** |
| parata | **8/15** | **5,7u** | **0/15** | **44,5u** | **44,6u / 62,1u** |

**Il piano non è il colpevole.** Il pallone logico — quello che telecronaca, piani e microsim
affermano — al tiro e alla parata **ci arriva davvero**, con mediane di quattro e sei unità. È il
pallone **reso**, l'unico che il giocatore guarda, a restare quaranta-quarantacinque unità
indietro: **zero su quindici**, due volte di fila.

Non è quindi il caso di riscrivere il piano dell'occasione, né di aggiungergli battute, né di
spostare i bersagli. **Il disegno c'è già e non viene mostrato.** È lo stesso difetto strutturale
del punto #31 — quindici scrittori sul pallone reso e vince l'ultimo — nella sua forma peggiore:
non uno scarto di qualche unità, ma **mezza lunghezza di campo**, esattamente nei tre secondi in
cui il gioco dichiara di essere pericoloso.

E dice chi vince il fotogramma:

| scrittore | fotogrammi | quota |
|---|---|---|
| **#2 — l'arco della cronaca** | 1147 | **91%** |
| #17 — il fermo | 63 | 5% |
| #3 — l'inseguitore | 37 | 3% |
| #4 — il portatore | 13 | 1% |

Novantun per cento a **un solo scrittore**, e non è quello che segue il racconto (#1, «scena»).
Il censimento 817 (`tests/visual/arco-817.mjs`) chiede all'arco dove sta andando.

## Censimenti 817/818 — l'arco della cronaca: **buttato via**

`arco-817.mjs` (tre partite, 39 battute) guarda l'arco da dentro; `registro-818.mjs` elenca
riga per riga che cosa arriva al renderer e che cosa viene accettato.

| battuta | fotogrammi con un arco in volo | bersaglio dell'arco vs punto della battuta (mediana) | l'arco punta la battuta (≤6u) | archi **buttati** nella finestra |
|---|---|---|---|---|
| apertura | 98% | 31,0u | 1/13 | 14 |
| tiro | 98% | **40,7u** | **0/13** | **26** (= 2 per battuta, sempre) |
| parata | 70% | 34,4u | 1/13 | 11 |

E il dettaglio che chiude il caso: dentro una stessa occasione **il bersaglio dell'arco non cambia
mai** — 54, 54, 54 mentre le battute dichiarano 36 → 6 → 4; 57, 57, 57 mentre dichiarano
72 → 93 → 96. Il registro lo mostra riga per riga:

```
+ 75.7s  pass -> x 44    vivo 0  presa 1
+ 77.6s  pass -> x 6.6   vivo 1  presa 0   ← l'apertura dell'occasione: BUTTATA
+ 79.7s  pass -> x 4     vivo 1  presa 0   ← il tiro: BUTTATO
+ 83.1s  save -> x 2     vivo 0  presa 1
```

### La riga

`src/12-three-match-view.jsx`, sito ATE-2: `if(_ba.t!==prevBgT){ prevBgT=_ba.t; … if(_arc&&!ballArcActive){…} }`.
Il timbro `prevBgT` viene consumato **prima** del controllo sull'arco in volo: la riga che arriva
mentre un arco vola viene **scartata e mai più ritentata**. Per partita: **21-27 archi buttati**
(pass 56% accettati, save 50%). Il pallone resta dove l'arco *vecchio* l'ha lasciato, e la
cronaca va avanti da sola.

### Il banco stira gli archi — dichiarato

Gli archi durano 0,35-0,68 s di scena, ma il registro li vede «vivi» dopo 1,6-4 s reali. Il dt
per fotogramma è morsettato a 50 ms (r.1923); a ~6-8 fps col GLB il tempo di scena avanza a un
terzo del reale e un arco da mezzo secondo ne dura due. **Sul banco lo scarto è più frequente che
sul telefono a 30-60 fps** — ma la regola che butta l'arco è la stessa, le righe di un'occasione
arrivano a raffica, e il PO lo vede sul suo telefono: il difetto non è del banco, il banco lo
amplifica. Il fps del banco viene stampato da ogni sonda da qui in poi.

## 7.806 — l'arco nuovo sostituisce quello in volo

Un sito solo, `if(_arc&&!ballArcActive)` → `if(_arc&&(!ballArcActive||_sost806))`. Con
`ballArcT=0` la sorgente viene ricatturata sul pallone com'è **adesso** (r.~2188), e il volo
riparte da lì verso il punto nuovo: un passaggio seguito da un tiro, che è calcio. Rosso
`__CPM_NO806`. Testimone `__CPM_SOST806` (archi sostituiti, ~3/min, non per fotogramma).

### Prima misura della 7.806 (banco a ~6 fps): **non batte** — e il banco spiega perché

| | baseline (816) | 7.806 verde |
|---|---|---|
| reso arriva al tiro (≤6u) | 0/15 · mediana 39,7u | **1/12 · mediana 30,9u** |
| reso arriva alla parata | 0/15 · mediana 44,5u | **2/12 · mediana 27,1u** |
| archi buttati / sostituiti a partita | 21-27 buttati | 17-24 sostituiti |

Meglio di dieci unità, ma lontano dal bersaglio dichiarato (≥ il logico, 9/15). Con la
sostituzione l'arco è in volo nel **98%** dei fotogrammi: un arco parte, non finisce, ne parte un
altro. Il conto: il banco headless col GLB gira a **~6 fps** e il dt per fotogramma è morsettato a
**50 ms** (r.1923) → la scena avanza a un terzo del reale; le righe di cronaca vanno a tempo reale
(1,7 s a minuto) e arrivano quindi ogni ~0,5 s di **scena**, cioè prima che un arco da 0,48 s
finisca. **Sul banco nessun arco arriva mai a destinazione.** Sul telefono del PO (~30 fps: «10u
in 30 ms» nella sua nota KE) il morsetto non morde e ogni arco finisce prima della riga dopo.

**Il banco misurava un'altra partita.** Non annulla la causa (l'arco buttato è una regola, vale a
ogni fps) ma annulla il *numero*: la baseline 0/15 è in parte un artefatto. Gancio test-only
`__CPM_DTREAL` (banco 819): la scena avanza del tempo reale trascorso, tetto 0,3 s. Baseline e
7.806 si rimisurano **tutte e due** con questo banco; il vecchio numero non si confronta col nuovo.

### Trovato leggendo, da misurare dopo: **il tiro dell'occasione vola come un passaggio**

`src/14` r.4379: ogni battuta del piano esce con `at:"pass"` — anche il tiro e anche la parata.
L'arco di cronaca prende il tipo da `ev.at` (r.5137), quindi il tiro dell'occasione vola con
`pass` (altezza 0,9, 0,48 s) e non con `shot` (2,8, 0,52 s); e il sito ATE-2 arma il tuffo del
portiere solo su `shot`/`save` con bersaglio in area — dalle battute **non parte mai**: il portiere
dell'occasione vive solo del segnale 7.695. Candidato 7.807, *dopo* il verdetto sulla 7.806: la
battuta dichiara il proprio tipo (apertura→pass, tiro→shot, parata→save). Non si tocca adesso.

### 7.806 — **REVOCATA** con la coppia a tempo reale

| banco a tempo reale (`__CPM_DTREAL`) | rosso | 7.806 verde |
|---|---|---|
| reso arriva al tiro (≤6u) | 2/12 · mediana 23,4u | 0/6 · 20,6u |
| reso arriva alla parata | 3/11 · 11,2u | 2/6 · 10,4u |
| archi sostituiti in sei partite | 0 | **1** |
| arco in volo (quota fotogrammi) | 61% | 61% |

Col tempo del telefono gli archi si sovrappongono **una volta in sei partite**. I 21-27 «buttati»
a partita erano il banco a 6 fps, non il gioco. La misura non distingue la 7.806 dal nulla: revocata,
resta disponibile solo a richiesta (`__CPM_SI806`) per dispositivi sotto i 10 fps. `GAME_VERSION`
torna a 7.805.0 (produzione); il numero 7.806 è bruciato.

**Lezione a verbale (la settima sugli strumenti)**: un banco che rallenta i fotogrammi ma non la
partita misura un gioco diverso. La baseline 0/15 era per metà un artefatto; la metà vera è questa:
**al tiro il reso sta a 23u dal punto dichiarato mentre il logico ci arriva (6/12, mediana 4,2u)**.
Con la sostituzione fuori causa, la domanda torna a dove punta l'arco — `arco-817` col banco a
tempo reale.

## Censimento 817 a tempo reale — **l'arco punta la battuta; il pallone non ci resta**

| battuta | arco in volo | bersaglio dell'arco vs punto della battuta (mediana) | punta la battuta (≤6u) | buttati |
|---|---|---|---|---|
| apertura | 78% | 5,9u | 3/5 | 1 |
| tiro | 69% | **3,7u** | 3/5 | 1 |
| parata | 68% | 15,6u | 2/5 | 0 |

Col tempo del telefono l'arco della cronaca vola **dove la battuta dice** (al tiro, 3,7u). Eppure
il reso resta lontano: `Da 10'` bersaglio dell'arco a 2,2u, reso a **32,4u**; `Da 76'` arco a 3,7u,
reso a **22,3u**. L'arco arriva e poi qualcun altro riporta via il pallone: negli stessi giri gli
scrittori non-arco sono l'**inseguitore** (#3, 17-27%) e il **portatore** (#4, 5-15%) — la palla
incollata a un corpo che non è ancora arrivato. Prossima misura: la traccia fotogramma per
fotogramma di UNA occasione (reso, logico, scrittore, arco, corpo del portatore).

## Traccia 820 — **l'eroe si prende il pallone dell'azione extra-eroe**

`traccia-820.mjs`, due partite a tempo reale, ogni battuta d'occasione campionata per 3 s
(reso · logico · scrittore · arco → x · padrone eletto · corpo del portatore).

Occasione **nostra**, `Da 53'-55'` (battute → 72,2 · 92,7 · 96):

```
  ms   reso   logico  scrittore  arco     padrone
 1849  58.31  83.12   addosso    →63.4    eroe
 2016  58.31  83.12   addosso    →63.4    eroe
  …    (identico per tutta la battuta del tiro)
 2041  62.78  91.49   addosso    →69.8    eroe
```

Il **padrone eletto è l'eroe** (`_pad555 === 'eroe'`) per tutta la finestra, lo scrittore è
**«addosso»** (7.497: palla incollata all'eroe), il reso resta a 58-62 mentre il logico — col
compagno nominato dal piano — va a 83 e poi a 91. L'anagrafe del possesso del renderer (elezione
7.555: prima il portatore-mesh `_por526`, che si aggiorna solo a fine arco, poi la colla dell'eroe)
non legge `carrierRef` del piano, e la colla vince.

Occasione **avversaria**, `Da 29'` (battuta → 5,5): padrone «portatore», corpo a 66,8 → 35 → 33,6;
reso fermo a 66 mentre il logico scende a 25 e l'arco va a 4.

È la stessa diagnosi del 7.617 («elezione ancorata al logico, handoff solo a fine arco»), vista
dal punto in cui fa più male. **Avvertenza sul banco**: i valori restano identici per ~700 ms anche
a «fps ~17» — i fotogrammi sono radi e le *dinamiche* dell'arco qui non sono leggibili; la
diagnosi sopra è di **stato** (chi è eletto, dove sta il corpo), e regge.

### 7.807 — durante un piano vivo, il pallone reso insegue il logico e scrive per ultimo

Stesso principio del 7.803 (l'affermazione scrive per ultima), ma senza snap e senza cancello:
finché `pendingGoalRef.current.piano` è vivo in fase ambientale, a fine fotogramma il pallone reso
insegue `(P.ballX, P.ballY)` con un inseguimento continuo (95% in ~0,4 s) — sopra la colla
dell'eroe, l'inseguitore, gli archi stantii. La quota resta dell'arco. Rosso `__CPM_NO807`.

### 7.807 — misura appaiata a tempo reale: **parità col logico**

| `duello-816` + `__CPM_DTREAL` | rosso | **7.807 verde** | logico (tetto per costruzione) |
|---|---|---|---|
| reso arriva al tiro (≤6u) | 2/12 · mediana 23,4u | **8/15 · 4,9u** | 8/15 · 4,8u |
| reso arriva alla parata | 3/11 · 11,2u | **9/15 · 5,2u** | 8/15 · 5,7u |
| apertura | 5/12 · 6,8u | 3/15 · 9,4u | 3/15 · 8,7u |

Il pallone che il giocatore guarda arriva **dove la telecronaca dice**, esattamente quanto ci
arriva la simulazione: non può fare di più, perché il logico è il tetto. Al tiro da 2/12 a 8/15;
alla parata da 3/11 a 9/15. Lo «scarto reso-logico» stampato dalla sonda è il **massimo** nella
finestra (l'istante del salto del logico, 65% per tick, prima che il reso lo raggiunga in 0,4 s):
non è una media e non contraddice la parità.

Quello che la 7.807 **non** cambia, e resta aperto: la qualità del disegno (il tiro vola come un
passaggio, `at:"pass"` su tutte e tre le battute — candidato 7.808), la zona di tiro (7/12 da
fuori, #44), la rarità (2,00 a partita). La 7.807 fa una cosa sola: **il campo smette di smentire
il racconto**.

### Rituali 7.807

`career-critical` **PASS** · `npm run ci` **fingerprint 00001505 · 0 failure** · guardiano
partita-vera OK (`gol-del-simulatore` 8 nati / 8 accreditati / 0 mangiati). In produzione.

## 7.808 — la battuta dichiara il proprio tipo, e il portiere reagisce una volta, al tiro

**Rosso misurato** (`quota-821`, 4 partite a tempo reale, 24 battute): al tiro dell'occasione il
pallone sale a quota **1,05** (mediana e p90) — l'altezza di un passaggio (`pass` 0,9; `shot` 2,8) —
perché tutte e tre le battute escono con `at:"pass"` (src/14 r.4379). Tuffi del portiere dal sito
ATE-2 (`T8`, quello che reagisce **al tiro**): **0 su 8**. Il portiere vive del solo segnale 7.695
(`T9`) alla battuta della parata: 8/8, cioè 1,7 s dopo che il tiro è partito.

Due cose in un'unità sola, perché la prima senza la seconda peggiora #49:
1. `at` per battuta: apertura→`pass`, tiro (`ms`)→`shot`, parata (`gk`)→`save`. L'arco vola da
   tiro e ATE-2 arma il tuffo nell'istante in cui il pallone parte (+ reazione 7.800).
2. Il segnale 7.695 **tace** se un tuffo da tiro è partito negli ultimi 2,5 s (`_t8At808`):
   altrimenti la battuta della parata armerebbe un **secondo** tuffo — il «doppio gesto
   scoordinato» del PO.

Rosso `__CPM_NO808`. Misura: quota al tiro 1,05 → ≥2,5; tuffi per **occasione** esattamente uno
(indici distinti di `__CPM_GK799`), con `T8` al tiro.

### Regressione della 7.805 trovata dal PO sulla 7.807: «il pallone adesso è troppo piccolo»

`src/12` r.~7454: la 7.805 spegneva l'**alone** del pallone insieme al pallone in cronaca testuale
(`if(_viaBall) ballHalo.visible=false`) e **non lo riaccendeva mai**. Dal primo minuto di cronaca in
poi, il pallone negli highlight era senza alone: più piccolo. Nessuna sonda lo guardava — la
`nascondi-814` misurava il pallone, non l'alone. Corretta nel treno 7.808 (`ballHalo.visible=!_viaBall`),
testimone `__CPM_VIS665.alone`, misura `alone-822` (highlight acceso ~100%, cronaca spento ~100%),
rosso appaiato `__CPM_NO808H` che riproduce il comportamento della 7.805.

Le altre due note della stessa consegna: «la difesa mura la conclusione ma non si vede» (esito
`intercept` su cross, punto #52, da censire) e «le azioni salienti extra eroe continuano ad essere
rare e non credibili» — sulla 7.807, che ha reso il pallone fedele al racconto ma non ha toccato
il disegno (7.808 in misura) né la rarità.

### Censimento #52 — «la difesa mura la conclusione ma non si vede» (cross → `intercept`)

Letto, non ancora misurato. In `src/12` i gesti avversari che vengono **armati** sono quattro:
`gk_dive` (9 siti), `opp_tackle` (3), `gk_catch` (2), `gk_block` (1). Il gesto `opp_intercept`
**esiste solo come animazione** (r.5513) e **nessun sito lo arma mai**: codice morto. La variante
d'esito `blocked` (r.2583, assegnata anche a `intercepted`) **non ha consumatori**. E il ramo delle
perdite (r.2979) esclude per costruzione `P.hlType!=="cross"`. Quindi: quando la difesa intercetta
un cross, l'esito lo dice e nessun corpo lo fa. Non è un cancello troppo stretto: il gesto di chi
mura o intercetta **non c'è**. Punto #52, dopo il treno 7.808.

### 7.808 — seconda e terza stesura, e una diagnosi sbagliata dichiarata

| `quota-821` (4 partite, tempo reale) | rosso | v1 | v2 (parata tace 2,5 s) |
|---|---|---|---|
| quota max al tiro (mediana) | 1,05 | 2,0 | **2,94** |
| tuffi per occasione: esattamente uno | — | 8/13 | 4/13 |
| tuffi per occasione: due o più | — | 5/13 | **8/13** |
| T8 (ATE-2) al tiro / T9 (7.695) | 0 / 8 | 7 / 10 | 9 / 11 |

Il tiro vola da tiro. Ma il portiere si tuffa **due volte** più spesso di prima: la finestra di
2,5 s è più corta della distanza fra la riga del tiro e quella della parata, che arrivano a
cadenza del lettore delle schede, non del tick. **v3**: otto secondi, un'occasione intera. In misura.

**L'alone non era la causa del «pallone troppo piccolo».** Coppia `alone-822`: verde 100% acceso
negli highlight, rosso `NO808H` (il comportamento della 7.805) **99%**. La diagnosi era sbagliata:
qualcosa riaccende l'alone comunque. Il ripristino resta perché innocuo, ma la regressione **non è
corretta** e la causa va cercata altrove (scala base del pallone `_bBase534`, r.3069). Dichiarato.

### 7.808 v3 — il portiere reagisce una volta

| `quota-821` | rosso | v2 (2,5 s) | **v3 (8 s)** |
|---|---|---|---|
| quota max al tiro (mediana · p90) | 1,05 · 1,05 | 2,94 · 2,94 | **2,0 · 2,94** |
| tuffi per occasione: esattamente uno | — | 4/13 | **6/6** |
| tuffi per occasione: due o più | — | 8/13 | **0/6** |
| chi reagisce | T9 8/8 | T8 9 · T9 11 | T8 3 · T9 3 |

Sei occasioni sole (il banco è sceso a 3-6 fps in tre partite su quattro): campione piccolo,
dichiarato. Ma il verso è netto e appaiato: da otto doppi tuffi su tredici a zero su sei. Quando il
tiro arma il tuffo (T8, bersaglio in area) il segnale della parata tace; quando non lo arma (tiro
da fuori, bersaglio sotto il 70), resta il segnale 7.695 (T9): **una reazione per occasione, o al
tiro o alla parata, mai due**.

### #53 misurato — «il pallone adesso è troppo piccolo» è vero: 6,1 px → 2,6 px

`taglia-824`: stessa scena forzata (SIT #101, cross, fase `hl_result`), stesso seme, sei
campioni, raggio del pallone letto dallo screenshot attorno alla sua proiezione ndc:

| build | raggio mediano | campioni |
|---|---|---|
| 7.805 (worktree `971d59f`) | **6,1 px** | 6,1 · 6,1 · 5,9 · 6,5 · 7,5 · 4,5 |
| corrente (7.808 v3) | **2,6 px** | 0 · 1,5 · 2,6 · 2,9 · 2,8 · 0 |

Meno della metà, e due volte su sei il pallone non c'è. Regressione vera fra la 7.805 e oggi.
Non è l'alone (coppia 822). Candidati: l'inseguimento 7.807 (solo in `playing`, in teoria), il
ripristino dell'alone nel treno 7.808 (un alone acceso davanti al pallone lo può coprire),
gli accessori. Bisezione: stessa sonda sulla 7.807 (`75092dc`), in coda.

---

## Treno 7.809 / 7.810 — le prime due voci della roadmap «basta pezze» (sul branch, `main` fermo)

### 7.809 — le righe del piano dicono di chi sono (#55-B)

I due costruttori di piano (`_pianoGol649` r.3344, `_pianoOcc695` r.3383) formattavano i nomi
senza sigla, mentre ogni altra riga scrive «Pellegrini (GRA)». Con i cognomi condivisi fra le due
rose (stesso pool nazionale mescolato con seme del club) la costruzione **avversaria** si leggeva
come un attacco **nostro** che finiva nel gol loro (diario n°3, 15'→20'). Ora attaccante con la
sigla del lato del piano, portiere con quella opposta. Rosso `__CPM_NO809`. Misura `sigla-826`:
battute di piano con sigla / totale — rosso atteso 0%, verde atteso 100%.

### 7.810 — S2 (v1): la colla dell'eroe si decide sui dati della simulazione

La regola 7.515 (r.2260) incollava il pallone all'eroe se il pallone **reso** stava entro 3,2u
dall'eroe **reso** in corsa: due oggetti che la simulazione non governa. Traccia 820: durante
l'occasione nostra il padrone eletto era l'eroe per tutta la finestra, col pallone reso fermo a
centrocampo. Ora la distanza è fra pallone **logico** (`P.ballX/Y`) ed eroe **logico**
(`P.playerX/Y`): la colla scatta solo se la simulazione dice che sono insieme; il verso di corsa
resta della mesh. Rosso `__CPM_NO810`. Misura `padrone-825` (rosso = censimento sul build 7.808,
in corso): accordo simulazione↔renderer sul padrone, quota di fotogrammi con l'eroe eletto,
scarto reso↔logico, salti > 8u.

Non è ancora S2 completo (il portatore-mesh `_por526` resta eletto a fine arco): è il primo taglio,
quello che toglie all'eroe il pallone degli altri.

### Censimento S2 (rosso, build 7.808) — `padrone-825`, due partite, fase ambientale

| | Pa | Pb |
|---|---|---|
| simulazione e renderer d'accordo sul padrone | **37%** | **40%** |
| la simulazione dice «nessuno» (`carrierRef` nullo) | **~69%** dei campioni | ~49% |
| il renderer elegge l'eroe | 0% | 3% |
| scarto reso↔logico (mediana · p90 · max) | 2,7 · 17 · 62u | 4,1 · 16,8 · 44u |
| **salti > 8u fra due campioni ≤ 110 ms** | **45** | **45** |
| `__CPM_PADRONE`: fotogrammi fuori > 2u | 40% | 43% |

Due cose nuove e grosse, entrambe a monte del renderer:

1. **La simulazione non sa chi ha la palla per metà-due terzi del tempo.** `carrierRef` (7.641,
   «il portatore è uno stato») è nullo nel 49-69% dei campioni ambientali: il renderer allora
   *inventa* un padrone (portatore-mesh 6-21%, «fermo» 22-26%). S2 non è solo «il renderer non
   legge la simulazione»: è che **la simulazione spesso non ha niente da dire**. Il taglio 7.810
   (colla dell'eroe sui dati logici) cura il caso dell'occasione; S2 completo richiede che il
   portatore logico esista sempre quando il pallone non vola e non è fermo.
2. **Quarantacinque salti > 8u a partita**: un teletrasporto ogni due minuti, in entrambe le
   partite. È il numero di S1 da battere; lo scarto mediano (2,7-4,1u) è buono, sono le code.

L'eroe eletto sull'intera fase ambientale è raro (0-3%): il danno della colla è concentrato nelle
occasioni (traccia 820: 100% della finestra). La misura giusta della 7.810 è quindi «eroe eletto
**dentro un piano**», aggiunta alla sonda prima del verde.

### Bisezione #53 — il pallone piccolo l'ho fatto io, nel treno 7.808

| build | raggio del pallone (SIT #101, `hl_result`) |
|---|---|
| 7.805 | 6,1-6,3 px |
| **7.807 (in produzione)** | **6,3 px** |
| 7.808 v3 (branch) | **2,3-2,6 px** |

La 7.807 è identica alla 7.805: la nota del PO «adesso è troppo piccolo» **non è riprodotta** da
questo metro sulla versione che lui usa — dichiarato, resta aperta con un'altra ipotesi da cercare
(scena diversa, camera). Il pallone piccolo che misuro è del treno 7.808: l'alone riacceso «per
correttezza» negli highlight è una sfera semitrasparente davanti al pallone che, con la camera
vicina, ne spegne il nucleo. La 7.805 lo teneva spento per un errore che *aiutava*. Rimedio
(7.810): alone solo in fase ambientale, mai negli highlight; misura `taglia-824` ≥ 6 px, in corsa.
Lezione: «correggere» un comportamento senza misurarlo prima è una pezza al contrario.

### 7.809 — misura appaiata: **42/42 (100%)** contro **0/33 (0%)**

`sigla-826`, tre partite, tutte le battute di piano (occasione e gol): con sigla **42/42** nel
verde, **0/33** nel rosso `NO809`. Esempio: *«🎯 Palla di Santis (POL) per Spada (POL), che se la
sistema da fuori.»* — prima *«Palla di Vallone per Spada»*. La costruzione dice di chi è.

### #53 — anche l'alone-solo-in-ambientale non riporta il pallone: 0 px

`taglia-824` sul build 7.810 (alone spento negli highlight): raggio mediano **0 px** (0 · 0 · 0 ·
1,7 · 2,4 · 0), contro 6,3 px della 7.807 nello stesso giro. **L'alone non c'entra**, seconda
volta. Qualcosa nel treno 7.808→7.810 fa sparire il pallone dallo screenshot in `hl_result` pur
con `onScreen` vero. Sonda v2 con diagnostica per campione (quota, visibilità, ndc) e ordine
invertito, in coda dopo i rituali. Finché non è capito, **il treno non si promuove** anche se
sigla e rituali sono verdi: un pallone che sparisce negli highlight è P0.

### #53, terza ipotesi — e stavolta letta nel diff, non indovinata

`git diff 75092dc -- src/12` filtrato sulle righe di codice che toccano il pallone: **tre** cambi
in tutto. Uno è la regola della colla dell'eroe sui dati logici (7.810), e **non era limitata alla
fase ambientale**: nella scena dell'eroe (`hl_*`) il punto-palla logico è fermo per costruzione
(#31, «palla congelata») e spesso coincide con l'eroe → distanza ≈ 0 → colla vera per tutta la
scena → pallone dentro il corpo → **0 px** nello screenshot con `onScreen` vero. Coerente con
i numeri: 7.807 (senza) 6,3 px; 7.808 v3 (alone in hl) 2,3 px; 7.810 (colla logica in hl) 0 px.
Rimedio v2: la regola logica vale solo in `playing`; negli highlight resta quella sulle mesh.
Misura: `taglia-824` v2 (corrente per primo, diagnostica per campione) ≥ 6 px, dopo la catena.

### 7.810 — la misura appaiata è **cieca** sui semi Pa/Pb

`padrone-825`, due partite (semi 9150/9481), «eroe eletto dentro un piano»: verde **0/387 e 0/275**,
rosso `NO810` **0/323 e 0/278**. Zero uguale zero: su questi semi la colla dell'eroe dentro un
piano non si presenta mai, e la misura non può distinguere. Il fenomeno era stato visto nella
traccia 820 sul seme 8150 (Da 53'-55', 100% della finestra). Non si spedisce una cosa che la
misura non vede: la coppia si rifà **sui semi della traccia** (Da 8150, Dc 9384), in coda dopo la
taglia v2 e i rituali. Sul resto la 7.810 non muove nulla (accordo 40-43% vs 31-39%, salti 34-50
vs 38-43: banda di rumore, come atteso da una regola che vale solo vicino all'eroe).

Rituali sul build 7.810 (prima della colla limitata a `playing`): career PASS · CI 00001505 ·
0 failure · gol-del-simulatore 8/8/0. Si rifanno sul build v2.

### #53 — **RITRATTAZIONE**: non c'era nessuna regressione di taglia. Era la sonda.

`taglia-824` v2, ordine invertito (corrente per primo, poi 7.807), stessa scena:

| gamba | build | raggio mediano | i campioni |
|---|---|---|---|
| **prima** | corrente (7.810 v2) | **6,3 px** | ndc che avanza: −0,39 → 0,17 |
| **seconda** | 7.807 | **1,3 px** | ndc **identico per 4 campioni** (0,37, 0,14): scena ferma |

Nella prima misura la 7.805 era prima (6,1) e il corrente secondo (2,6); nella bisezione la 7.807
era prima (6,3) e il corrente secondo (2,3); qui il corrente è primo (6,3) e la 7.807 seconda (1,3).
**Decide l'ordine, non il build**: la seconda gamba nello stesso browser rende una scena che non
avanza (la scena forzata resta al primo fotogramma) e il pallone «piccolo» è un pallone fermo in
un'altra posa. Quindi: la bisezione di stanotte è **invalida**; «il pallone piccolo l'ho fatto io»
è **falso**; l'alone in hl e la colla logica in hl **non** sono cause di taglia (la colla limitata
a `playing` resta perché corretta per un'altra ragione: #31, punto-palla fermo nella scena). La
nota del PO sulla 7.807 resta **non riprodotta**, senza colpevoli inventati.

**Nona lezione sugli strumenti**: due build nello stesso browser non sono confrontabili — un
browser per gamba (v3), e prima di credere a una differenza fra build si inverte l'ordine.

### Rituali sul build 7.810 v2 — **CI rossa**: `gol-del-simulatore` 8 nati / 7 accreditati / 1 mangiato

Il build v2 differisce dal v1 (CI verde: 8/8/0) per una sola condizione nel ramo della colla
dell'eroe, che vale solo negli highlight. Una causa improbabile — ma la 7.805 ha insegnato che un
peso invisibile può mangiare un gol, e la banda gira su due partite di un banco stocastico. Si
ripete la CI **da sola** a cascata finita; se è rossa due volte, la modifica si toglie e si
rimisura. Finché la CI non è verde, il treno 7.809/7.810 **non si committa**.

### 7.810 — **REVOCATA**: la misura non la vede, su otto partite

`padrone-825` «eroe eletto dentro un piano», verde contro rosso `NO810`:

| semi | verde | rosso |
|---|---|---|
| Pa / Pb | 0/387 · 0/275 | 0/323 · 0/278 |
| Da / Dc (quelli della traccia 820) | 0/332 · 0/379 | 0/283 · 0/258 |

Zero uguale zero anche sui semi in cui la traccia aveva visto la colla per tutta un'occasione:
il banco è stocastico e il fenomeno non torna a comando. Una regola che nessun numero distingue
non si spedisce — e sul build v2 la CI era rossa (1 gol mangiato). La 7.810 resta a richiesta
(`__CPM_SI810`); il rimedio vero è la riscrittura S1+S2 (tre stati letti dalla simulazione).
Anche l'«alone solo in ambientale» torna indietro: nasceva da una regressione che non esisteva.
Il treno si riduce alla **7.809** (sigla nelle righe del piano, 42/42 vs 0/33) più gli strumenti;
build, taglia v3 e rituali in coda dopo il censimento delle righe perse.

### Censimento S4 (`rifiuti-827`, tre partite) — **le righe non si perdono per la scheda aperta**

| | |
|---|---|
| righe rifiutate da `addCom` per scheda aperta | **3 su 217** proposte (1%) |
| di cui righe di PIANO | **0 su 18** battute |
| occasioni con tutte e tre le righe nel diario (`__CPM_CRO802`) | **0 su 6** |

L'ipotesi «la scheda aperta mangia il tiro dell'occasione» è **falsa**: nessuna battuta viene
rifiutata. Eppure nessuna occasione arriva intera nel diario. Quindi le battute prendono un'altra
strada rispetto ad `addCom` — candidata: la **sottopancia** della scena saliente (7.695, `_sot695`:
«la cronaca in sottopancia, accesa solo dentro la scena saliente»), che il diario non registra
ma il giocatore vede in 3D. Da verificare leggendo il canale; se è così, il difetto C del rapporto
n°3 è in parte del **diario**, e in parte del gioco (la parata che invece compare nel feed).

Letto subito dopo: la sottopancia (7.695) è solo uno **stile** dello stesso `coms[0]` — le righe
passano comunque da `addCom`, quindi il diario dovrebbe vederle. Il «0/6 complete» resta
inspiegato: o il testo cambia fra il piano e `addCom`, o il confronto della sonda sbaglia.
Diagnostica `dump-828` (battute e righe del diario nei minuti attorno, da leggere a occhio) in
coda dopo il treno 7.809. Finché non è letta, il punto C del rapporto n°3 **non ha una causa**.

### #53 — taglia v3 (un browser per gamba): **6,3 px = 6,3 px**

| gamba | build | raggio mediano |
|---|---|---|
| prima (browser proprio) | corrente (7.809) | **6,3 px** (6,1 · 6,0 · 6,3 · 6,7 · 8,6 · 4,6) |
| seconda (browser proprio) | 7.807 | **6,3 px** (0 · 6,3 · 5,9 · 6,4 · 8,2 · 4,3) |

Nessuna differenza fra i build. Il pallone negli highlight ha la stessa taglia dalla 7.805 a oggi.
La nota del PO «il pallone adesso è troppo piccolo» resta **non riprodotta** con questo metro
(stessa scena, stessa camera): se torna, servono partita, minuto e fase. Chiuso senza colpevoli.

### 7.809 committata sul branch (`89dfba0`) · `main` resta `75092dc` (7.807)

Rituali: career PASS · CI 00001505 · 0 failure · gol-del-simulatore 7/7/0. Non si promuove:
il metro «basta pezze» non è raggiunto.

## 7.811 — S3 v1: l'enfasi legge lo stato (sul branch)

`src/14` r.5170: le due famiglie d'enfasi («Stiamo dominando…» con momentum ≥ 80, «Reggiamo…»
con ≤ 20) uscivano dal solo momentum. Ora la frase viene da una tabella **stato × momentum**
(sotto / pari / sopra, con la variante del finale dall'80') e dice la cosa vera: sotto e in
spinta → «serve il gol»; pari e in spinta → «serve il gol che sblocca»; avanti e in spinta →
«teniamo alta l'intensità»; sotto e schiacciati → «così non si recupera»; avanti e sotto assedio →
«si difende il risultato». Stessa porta seedata (`_rndM<0.12`), stessa cadenza. Rosso `__CPM_NO811S`.
Misura `enfasi-829` (4 partite): righe d'enfasi **incoerenti** col tabellone (rosso: la bugia del
rapporto n°3 «teniamo alta l'intensità» sotto 1-2) → atteso 0 nel verde; righe **mute** sullo
stato → scendono. In coda dopo la diagnostica S4.

### S4 — **la causa vera** (`dump-828`, letta a occhio): la battuta viene sostituita

| minuto | il piano (battuta consumata) | quello che il diario mostra |
|---|---|---|
| 18' | 📈 Spada (POL) serve Santis (POL) al limite della trequarti. | ⚡ Filtrante di Neri — Colombo attacca lo spazio! |
| 53' | 🎯 Palla di Spada (POL) per Santis (POL)… | 🏃 Luca porta palla e guadagna metri… |
| 54' | 💥 Santis (POL) non ci pensa due volte: bordata da fuori! | ⚙️ Luca appoggia in avanti per Spada, la manovra sale. |
| 72' | 📈 Spada (POL) serve Santis (POL)… | 🔁 Vallone scarica su Spada e la squadra riprende posizione. |

Le battute del tiro e della parata di solito passano; l'**apertura** quasi mai, e a volte nemmeno
il tiro. Il piano ha già consumato la battuta (`step++`, il pallone si muove sul punto dichiarato),
ma la riga che esce è di **un'altra voce** nello stesso tick (riga-fatto 7.739, conduzione,
scarico). Non è il diario: è il gioco che racconta una cosa e ne mostra un'altra — ed è la
sorgente di «azione insignificante a centrocampo» e di «parata senza tiro». Due scrittori della
stessa riga, e la battuta perde. Rimedio S4 v1: quando una battuta di piano è uscita in questo
tick, nessun'altra voce scrive; misura `rifiuti-827` «occasioni complete nel diario» 0/6 → 6/6.

Letti i sovrascrittori di `ev` a valle della battuta (r.4380-5270) senza guardia sul piano: la
**sequenza della libreria** (7.666/7.683, r.4730 e r.4786 — la stessa classe del 7.785, che la
fermò sul gol ma non sulle battute) e la **scheda d'interazione** (7.669, r.4575, che azzera anche
`bpos`). Le righe viste nel dump («Filtrante di Neri…», «Luca porta palla…», «Luca appoggia…»)
sono tutte di libreria. Patch 7.812 pronta (`patch-S4.py`, rosso `__CPM_NO812`, testimone
`__CPM_SALVA812`): la battuta passa, la sequenza aspetta un tick come sul gol. Si applica dopo il
commit della 7.811; misura `rifiuti-827` «occasioni complete» 0/6 → 6/6.

### 7.811 — la misura sul diario è **cieca** (1 riga in 4 partite), si misura la tabella

`enfasi-829`: righe d'enfasi di r.5170 in quattro partite, rosso **1**, verde **1** (la porta
seedata `<0,12` con momentum ≥ 80 / ≤ 20 scatta di rado). Zero uguale zero, come per la 7.810 —
ma qui la cosa da misurare è una **tabella**, e una tabella si misura tutta: la selezione è ora
una funzione pura (`_frasi811(sd, finale, alto)`, esposta come `__CPM_ENFASI811` sotto test) e
`tabella-830` la interroga su 20 stati (sotto di 1-2 / pari / sopra di 1-2 × inizio/finale ×
alto/basso) contando le frasi che contraddicono il tabellone. Rosso atteso > 0 (le terne
originali dicono «teniamo alta l'intensità» anche sotto di due); verde atteso **0**. In coda.

### 7.811 — la tabella misurata: **16/60 → 2/42**, e le due sono la sonda

`tabella-830`, 20 stati (sotto di 1-2 / pari / sopra di 1-2 × inizio/finale × alto/basso):

| | frasi incoerenti col tabellone |
|---|---|
| rosso `NO811S` (le terne originali) | **16/60** — «Stiamo dominando — teniamo alta l'intensità!», «in fiamme», «Momento magico» anche sotto di due |
| verde 7.811 | **2/42** — entrambe «Sotto nel finale e **tutti avanti**: serve il gol» |

Le due residue sono coerenti (*tutti avanti* = tutta la squadra in attacco) e cadono nella regex
della sonda che legge «avanti» come «in vantaggio»: si cambia la frase, non il metro («tutta la
squadra in attacco»). Verde atteso 0/42, in coda.

**CI rossa una volta sul build 811b** (`gol-del-simulatore` 8/7/1) dopo un verde sullo stesso
codice a meno del refactor in funzione pura; la banda gira su due partite di un banco stocastico.
Si ripete da sola; rossa due volte = si indaga prima di committare.

### 7.811 — tabella verde con la frase corretta: **0/42** (rosso 16/60)

`tabella-830`, 20 stati: nessuna frase d'enfasi contraddice più il tabellone. CI ripetuta in corsa.

### 7.811 committata sul branch · `main` resta 7.807

CI ripetuta da sola: fingerprint 00001505 · 0 failure · gol-del-simulatore 8/8/0. Il rosso di 811b
era stocastico (stesso codice a meno del refactor in funzione pura).

## 7.812 — S4 v1: la battuta del piano non si sostituisce (sul branch)

Patch applicata (`__CPM_NO812`, testimone `__CPM_SALVA812`): la sequenza della libreria
(r.4730 e r.4786) e la scheda d'interazione (r.4575) non coprono più una riga di piano nello
stesso tick — aspettano il tick dopo, come la libreria già faceva sul gol dal 7.785. Misura
`rifiuti-827`: occasioni con tutte e tre le righe nel diario, rosso atteso ~0/6, verde atteso 6/6.
In coda con i rituali.

### 7.812 v1 — **non muove la misura**: occasioni complete nel diario 0/9 (rosso 0/5)

`rifiuti-827`, tre partite per regime: rosso `NO812` 0/5, verde 0/9. La guardia su libreria
(r.4730/4786) e scheda (r.4575) non basta — o non scatta mai (testimone `__CPM_SALVA812`
aggiunto alla sonda) o la battuta viene sostituita **altrove**. Prima di revocare o rifare:
censimento degli scrittori di `ev.txt`/`evTxt` a valle di r.4380, e il conto della guardia.

### 7.812 v1 — **REVOCATA**, e il testimone all'emissione dice dove guardare

`rifiuti-827` col testimone `__CPM_EMIT812` (due partite): battute consumate dal piano **9 e 6**,
battute arrivate al punto d'emissione **6 e 5**, testo cambiato all'emissione **0**, guardia
7.812 scattata **0** volte. Quindi: quando la battuta arriva all'emissione esce **col suo testo**;
il problema è che **una battuta su tre non ci arriva** — consumata (step++, pallone mosso), ma la
riga del tick non viene emessa. Libreria e scheda non c'entrano: le tre guardie tornano indietro.
Da cercare: il punto fra la battuta (r.4380) e l'emissione (r.5317) dove la riga del tick si
perde, o la battuta consumata in un tick che non passa dal sito della riga.

### S4 — la bisezione coi testimoni: **è la catena**

Tre testimoni lungo il tick (`p1` dopo il blocco della battuta, `p2` prima della libreria, `p3`
prima del testo d'uscita), due partite: battute vive a p1/p2/p3 = **6/3/3** e **12/5/5**. La
battuta muore **fra p1 e p2**, in una su due-tre. In mezzo c'è il blocco della **catena** (7.537),
che scrive `ev` anche con un piano vivo: `_recKind546` vale «manovra-gol» (non «scena») e con il
gol pendente la catena «è il racconto» (7.537 v4) — così l'apertura dell'occasione usciva come
«Filtrante di Neri — Colombo attacca lo spazio!», cioè una riga di catena. Libreria e scheda non
c'entravano (guardie mai scattate): v1 revocata. **7.812 v2**: se la riga del tick è una battuta
di piano, la catena tace per quel tick. Rosso `__CPM_NO812`, testimone `__CPM_SALVA812`. Misura
`rifiuti-827` rosso/verde e rituali in corsa.

### 7.812 v2 — **8/11 (73%)** contro 0/24 — e un rosso che non era rosso

`rifiuti-827` sul build v2: «occasioni con tutte e tre le righe nel diario» **3/5 e 5/6** (guardia
scattata 9-18 volte a partita, battute vive a p1/p2/p3 = 10/10/10). Il confronto appaiato è con le
quattro corse precedenti a codice identico meno la guardia: **0/6, 0/9, 0/5, 0/4 → 8/11**.
Ma la corsa etichettata «rosso» era un secondo verde: la sonda **ignorava `CPM_ROSSO`**
(decima lezione: il rosso va verificato leggendo il testimone — la guardia «scattata 10 volte»
nel rosso lo diceva). Sonda corretta.

Il residuo (3/11): la battuta arriva all'emissione (p3 = battute) ma esce nel **timer
dell'arco** (240-340 ms dopo, r.5317) e lì una scheda aperta la rifiuta senza che il testimone
`REF_PIANO` — che sta sul ramo sincrono — lo veda. **v3**: la battuta di piano esce subito, come
il gol. Rosso vero e verde in coda, poi rituali.

### 7.812 v3 — coppia pulita: **0/5 → 5/5 (100%)**

| `rifiuti-827`, tre partite per regime | rosso vero `NO812` | **verde 7.812 v3** |
|---|---|---|
| occasioni con tutte e tre le righe nel diario | **0/5** | **5/5** |
| battute vive a p1/p2/p3 | 6/3/3 · 19/8/8 · 7/4/4 | 16/16/16 · 13/13/13 · 7/7/7 |
| guardia (catena tace) scattata | 0 | 16 · 11 · 7 |
| testo cambiato all'emissione | 0 | 0 |

Ogni battuta di piano arriva all'uscita col proprio testo, e il diario le ha tutte e tre.
Il punto C del rapporto n°3 («parata senza tiro») ha un rimedio misurato. Rituali: career PASS,
CI in corsa; commit sul branch al verde. (Il container si è riavviato alle ~06:1x: catena
persa e rilanciata alle 06:20, nessun dato perso oltre la corsa.)

### 7.812 committata sul branch (`41f9f54`) · playtest n° 4 in corsa

Rituali sul build v3: career PASS · CI 00001505 · 0 failure · gol-del-simulatore 7/7/0. `main`
resta alla 7.807. Subito dopo, sul build del branch, il **playtest n° 4** come vuole il metro:
quattro partite intere, due in casa e due in trasferta (`passata-player` con `CPM_AWAY`), lette
come le legge il giocatore. Intanto nel sorgente (non ricostruito) entra la **7.813** — S2 v2: il
renderer legge `carrierRef` (patch pronta da ieri), misura `padrone-825`.

## Dal playtest n° 4 — le bugie H e J, censite

**H — chi colpisce non è chi segna.** `src/14` r.4831-5254: per i gol **nostri** `_evName170` resta
nullo e il nome del rigo del gol esce da `_pickN` (rosa a sorteggio); il piano del gol nomina il
suo protagonista battuta per battuta (`_pe649.chi`) e nessuno lo passa al rigo. Per i gol loro
c'è già `_oppScorer` (r.4857). **7.814**: la battuta ricorda il protagonista (`lastChi814`), la
chiusura del piano che rilascia il gol lo consegna al rigo (`lastGoalChiRef814`), e il rigo firma
lui. Rosso `__CPM_NO814`, testimone `__CPM_NOME814{gol, conPiano, firmati}`. Misura: gol nostri con
piano firmati dal protagonista dell'ultima battuta — rosso 0, verde = conPiano.

**J — il corner annunciato non si batte.** La chiusura dell'occasione (r.3874) arma `outRef`
(`kind:'corner', ttl:4`) e `fermoRef`; la riga «🚩 Calcio d'angolo per…» la scrive la macchina
dell'interruzione (r.4266) al passo 1, sotto condizioni (`!_recHij545`, `!pendingGoalRef`,
`!mute632`, `ttl`). Nel diario del n° 4 dopo tre parate «in angolo» nessun corner. Misura aggiunta
alla sonda: corner annunciato dalla parata → riga di corner entro 4' (baseline da leggere).

### 7.813 v1 — **REVOCATA**: accordo 34/33% → 36/36%, salti 38/49 → 32/47

Impostare `_por526` dal `carrierRef` non basta: la colla del portatore (7.523) scatta solo se il
pallone reso è **già** entro 3,2u da quel corpo — e non ci sta, che è il difetto. Il renderer
deve *portare* il pallone ai piedi del portatore logico, non solo sapere chi è. Resta a richiesta
(`__CPM_SI813`). La misura giusta di S2 è ora nella sonda: **«quando la simulazione dice chi porta
la palla, il pallone reso sta ai suoi piedi (≤ 3u)?»** — baseline da leggere, bersaglio ≥ 90%.
Il taglio vero (S1+S2, tre stati nel blocco del pallone di src/12) è il prossimo lavoro
strutturale, dopo la 7.814.

### Treno 7.814 — letture intermedie, e due cose nuove

`rifiuti-827` sul build 7.814 (tre partite per regime):

| | rosso `NO814` | verde |
|---|---|---|
| **[J]** corner annunciato dalla parata → corner battuto entro 4' | **0/5** | **0/3** |
| battute di piano rifiutate dalla scheda aperta | **6/24 (25%)** | **5/20 (25%)** |
| occasioni con tutte e tre le righe | 5/8 | 4/7 |
| **[H]** testimone `__CPM_NOME814` | *mai scritto* | *mai scritto* |

Tre fatti. (1) **J è confermata al 100%**: nessun corner annunciato viene battuto; testimoni
`__CPM_J814{armati, corner, righe}` aggiunti (palla morta armata dall'occasione → riga «Calcio
d'angolo»). (2) Con la battuta che esce subito (7.812 v3) la scheda aperta la rifiuta **in modo
sincrono nel 25% dei casi**: il 5/5 di stanotte era fortuna; **7.816** (S4 v2): la battuta
rifiutata si accoda e esce alla chiusura della scheda, in ordine, al massimo tre. (3) Il testimone
di H non è mai stato scritto in sei partite: o nessun gol nostro è passato dal rigo ambientale, o
il sito non è raggiunto — contatore esteso ai gol loro per distinguere. Rituali 7.814 (career
PASS) in corsa; il treno 7.816 (build con J2, H2, coda) in coda dopo la baseline S2.

## Baseline S2 vera — «quando la simulazione dice chi porta la palla, il pallone sta ai suoi piedi?»

`padrone-825` con l'accessore `car` (il corpo del portatore logico, letto dalla mesh), due partite:

| | Pa | Pb |
|---|---|---|
| pallone reso entro 3u dal corpo del portatore logico | **87/596 (15%)** | **63/856 (7%)** |
| distanza mediana · p90 | 10,8u · 42u | 11,8u · 36u |
| salti > 8u | 50 | 56 |

**Sette-quindici volte su cento.** Quando il gioco sa chi ha la palla, il pallone che il giocatore
vede è a dieci-dodici unità da lui, e una volta su dieci a quaranta. È il numero di «la palla non ha
un possessore» (codice 001, quattro note del PO) e di «azioni matematiche». Bersaglio: **≥ 90%**.
Rimedio pronto (**7.817**, S2 v2): l'inseguitore punta il corpo del portatore logico invece del
punto-palla, così la colla 7.523 lo trova e lo tiene. Si applica dopo il treno 7.816.

### 7.814 + 7.816 committate sul branch

`rifiuti-827` (tre partite per regime): battute di piano rifiutate dalla scheda aperta rosso 2/21
→ verde 2/12, ma nel verde le rifiutate **escono alla chiusura della scheda**: occasioni con tutte
e tre le righe **6/7 → 4/4** (con la corsa precedente: 5/5). Rituali: career PASS · CI 00001505 ·
0 failure · 7/7/0. **J** resta confermata (corner annunciato → battuto 0/6; testimoni: palle morte
armate 7, corner 6, righe di corner uscite 3 — quindi la riga *può* uscire, ma non nei minuti
attorno alla parata): rimedio dopo la 7.817. **H**: il testimone non ha visto gol nostri al rigo
ambientale in sei partite — diagnostica col registro dei gol nel treno 7.817. `main` resta 7.807.

### 7.817 v1 — **REVOCATA**: 20%/14% → 30%/11%, un terzo del bersaglio

`padrone-825`, «palla ai piedi del portatore logico (≤ 3u)»: rosso `NO817` **20% / 14%** (mediana
10,8 / 13,9u), verde **30% / 11%** (6,8 / 10,9u). Un effetto vero in una partita, nullo nell'altra,
e comunque a un terzo del bersaglio (≥ 90%). Cambiare il bersaglio dell'inseguitore non basta finché
l'inseguitore è uno dei quindici scrittori e vince solo quando gli altri tacciono. Resta a richiesta
(`__CPM_SI817`). Il prossimo passo su S1+S2 non è una taratura: è la riscrittura a tre stati del
blocco del pallone di `src/12` (portata / in volo / vagante), col resto degli scrittori ridotti a
proposte.

**H, diagnostica**: in sei partite di sonda **tutti i gol nostri sono highlight** (registro:
`home/highlight`), i gol del microsim sono solo loro — il rigo ambientale del gol nostro non passa
mai da lì, e la 7.814 non è misurabile su questi nomi. Si misura con i nomi del playtest (Moretti:
57' `home/microsim`). **J**: 0/3 anche con finestra 8'. Le righe di corner che escono (3 su 7 palle
morte) non sono quelle dell'occasione: la palla morta armata alla chiusura non produce la sua riga.

## 7.818 — il corner annunciato si batte (J), in misura

La palla morta armata alla chiusura dell'occasione (r.3874) ha `ttl:4` che scala **a ogni riga
sorteggiata** (r.4347), e la riga del fischio (r.4278) chiede `!_recHij545`: nei cinque secondi in
cui la scena saliente resta aperta dopo l'occasione (7.692) un'altra recita tiene la mano, quattro
righe passano e il corner muore muto (testimone `__CPM_OUTDIE632.ttl`). Le tre righe di corner
viste (su sette palle morte) non erano dell'occasione. **7.818**: la palla morta dell'occasione è
il seguito che il testo ha promesso — ttl 8, e passa anche sopra una recita. Rosso `__CPM_NO818`.
Misura `rifiuti-827` sui nomi del playtest (Moretti, Vairo — dove i gol nostri passano dal rigo
ambientale, così si misura anche H): corner annunciato → battuto entro 8', rosso 0/9 finora, verde
atteso ≥ 90%. In coda dopo i rituali della 7.817 (revocata).

### 7.818 v1 — l'ipotesi del ttl era **sbagliata**: 0/4, e nessuna palla morta muore di ttl

`rifiuti-827` sui nomi del playtest: rosso `NO818` corner annunciato → battuto **0/5**, verde
**0/4**; palle morte armate dall'occasione 6 (corner 4) nel verde, righe di corner uscite **0**,
**morte di ttl 0** (il ttl scende di 3-9 righe e non arriva mai a zero). Quindi la palla morta
dell'occasione resta armata e viva, la riga del fischio viene valutata su quelle 3-9 righe e
**declina ogni volta**: né il ttl né la recita in corso (che il 7.818 scavalca). Un'altra
condizione della riga del fischio (r.4278) è falsa per lei: testimone `__CPM_J818` (tick per tick:
recita, tipo, kickoff, piano pendente, piazzato, `ef`, ttl) in coda dopo il playtest n° 5.
7.818 v1 resta nel sorgente ma **non si dichiara**: la misura non la vede.

**H (7.814) misurata dove si può**: Moretti, un gol nostro dal rigo ambientale con piano →
**firmato dal protagonista dell'ultima battuta 1/1**, in entrambi i regimi (la 7.814 è già nel
build). Il meccanismo è provato; il campione è di uno.

## 7.819 — il racconto è della partita, non del minuto (bugia M del playtest n° 5)

Otto diari su otto (n° 4 + n° 5) avevano la **stessa prima occasione al 9'**: «X serve Y al limite
della trequarti» → «prova a sorprendere il portiere da lontanissimo» → «ci arriva in tuffo e la
devia in angolo». Causa letta nel codice: **dodici sorteggi del racconto** erano seminati con
`hashStr("…|"+nx+"|…")`, cioè dal minuto e basta — piano dell'occasione (r.3416), piano del gol
(r.3375), racconto della palla morta (r.4287), catena (r.3706), righe rx/lx/sx (r.3559-3680), dado
dell'eroe (r.3627), cv (r.4559), int/int2 (r.5072), catena hl (r.7212). Il seme di partita
(`bgSimSeedRef`) entra in tutti e dodici tramite `_sm819()`. Rosso `__CPM_NO819`.

**Misura appaiata `copione-831`** (4 partite, 4 nomi, 2 casa 2 fuori, stesso banco):

| | rosso NO819 | **7.819** |
|---|:---:|:---:|
| righe identiche allo stesso minuto in ≥ 2 partite | 9 | **4** |
| righe con la stessa struttura allo stesso minuto | 12 | **5** |
| minuto della prima occasione extra-eroe | 9, 9, 9, 9 | **53, 38, 9, 14** |
| minuti distinti | 1/4 | **4/4** |

Il minuto è cambiato senza toccare il cancello: la catena e le righe seminate dalla partita
spostano dove sta la palla nei primi minuti, e il cancello (che apre dal 7') trova il primo tick
libero in un posto diverso. **Residuo fisso, a verbale**: 1' «La manovra si accende: X guadagna
metri fra le linee» (4/4, apertura del calcio d'inizio, r.4508), 6' «fallo, punizione per X» (3/4),
65' «Cambio in campo: si passa alla gestione del vantaggio» (2/4: la consegna del mister a minuto
fisso, r.2936 — in Galli cade fra il cross e l'incornata avversaria). Sono tre sorgenti a orario,
non a stato: prossimo giro.

### 7.818 v2 — la palla morta viveva 4 tick; ora 10, e **ancora 0/4**: la riga nasce e si perde dopo

Il testimone `__CPM_J818` era vuoto su Moretti (1 corner armato): nessuna riga sorteggiata trovava
viva la palla morta. Letto il perché: il budget **per tick** del 7.632 (r.5530) la spegneva dopo
**quattro** tick (il commento diceva «dieci»), e i cinque secondi della scena saliente ne bruciano
tre senza righe. **v2**: dieci tick per la palla morta dell'occasione. Misura `rifiuti-827` sui nomi
del playtest (Moretti, Vairo, Rb): rosso 0/5, verde **0/4**. Ma il testimone ora parla: 5 tick con
la palla morta viva a passo 0 e **tutte le condizioni del fischio vere** (`rec 0, ko 0, pg 0, sp 0,
ttl 8`), righe di corner **nate** 1-3 a partita (contatore `J814.righe`) — e nessuna nel diario
entro 8'. Quindi la riga nasce e si perde **a valle**, come le battute di piano prima della 7.812:
il timer dell'arco (r.5392) e la scheda aperta. **v3** (nel build 7.824, in misura): la riga della
palla morta dell'occasione (`ev._out818`) non passa dal timer dell'arco e con una scheda aperta si
accoda come una battuta di piano (7.816); testimone `__CPM_J818E` (p1/p2/p3/arco/diretta) per
dire dove muore se muore ancora. Ipotesi dichiarata due volte sbagliata (ttl a righe, budget a
tick): la terza è la prima con un testimone che vede la riga dopo la nascita.

## 7.820-7.824 — le bugie del n° 5 che si leggono nel codice, in misura sul build 7.824

- **7.820 (N)** — il gol dell'eroe ha la riga del gol: «⚽ X segna su assist di Y! 1-0.» subito
  dopo la frase d'esito (r.6874, `_comFn15`). Rosso `__CPM_NO820`.
- **7.821 (V)** — la riga del gol guarda il margine: «Squadra in vantaggio!» solo sul primo gol di
  vantaggio; poi «Raddoppio», «Partita in mano: 3-0» (r.5327). Rosso `__CPM_NO821`.
- **7.822 (W, U)** — la libreria delle azioni si apre solo con la palla nostra (`possTurnRef`) e a
  tre minuti dall'ultimo gol, mai sul tick del gol (r.4787): la 7.785 v2 la apriva sul gol e il
  compositore non guardava il turno. Rosso `__CPM_NO822`. Misura `regia-833`: aperture per partita
  (banda: non sotto 2), entro 2' da un gol, con la palla loro.
- **7.823 (S, K)** — {GKH}/{GKA} risolti sul portiere in campo; `_pickN` non pesca il portiere per
  le righe di movimento; «rinvio dal fondo per {GK}»; i template «il portiere di {A}» → «{GKA}».
  Rosso `__CPM_NO823`. Misura `ruoli-834`.
- **7.824 (T)** — nella libreria i segnaposto si assegnano per riga nell'ordine dei ruoli ({H},
  {H2}, {H3}); il terzo uomo è risolto in tutti e due i percorsi (tick e righe programmate). Rosso
  `__CPM_NO824`. Misura `ruoli-834` [T]: righe con lo stesso cognome due volte.

### 7.822 v1 REVOCATA — la libreria muore di fame (aperture 3/2/2/… → 0/1/0/0)

`regia-833`, 4 partite: col rosso la libreria apre 3/2/2 azioni a partita, **3 su 7 sul tick di un
gol** e **3 su 7 con la palla avversaria** (le bugie W e U, misurate). Col verde v1 (turno nostro +
tre minuti dal gol) apre **0/1/0/0**: la banda dichiarata (non sotto 2) è rotta, come la 7.785 v1.
Le finestre libere del vecchio cancello cadono quasi tutte col turno avversario o sul tick del gol.
**v2** (build 7.824): resta solo la condizione del gol — mai sul tick del gol, mai nei tre minuti
dopo. Censimento aggiunto al cancello (`__CPM_LIBGATE785.ok822/b822p/b822g/b822t`) per contare
quante finestre cadono per turno, per gol vicino, per tick del gol. `__CPM_SI822T` riaccende il
turno per la misura. La U resta aperta nella parte «raccontare la manovra loro dal lato loro».

### Decima lezione sugli strumenti — J era zero per costruzione

`rifiuti-827` leggeva il diario **dopo** `ctx.close()`: l'`evaluate` falliva, il `catch` restituiva
`[]`, e «corner battuto entro 8'» era **0 qualunque cosa facesse il gioco**. I tre zeri della 7.818
(0/9, 0/4, 0/6) erano lo stesso zero della sonda. Le ipotesi v1 (ttl a righe) e v2 (budget a tick)
restano smentite dai testimoni; la v3 (timer dell'arco, coda della scheda) e la v4 (i tre scrittori
di `ev` — contropiede, catena, ponte — non sostituiscono la riga della palla morta; J3 dice che la
riga nasceva e alla libreria non c'era più) sono nel build 7.824 e si misurano ora con la sonda
corretta, rosso e verde. Il diario del playtest n° 5 (lettore separato, letto prima della chiusura)
resta la prova che sul build aea0d01 il corner non usciva.

### 7.823/7.824 — la prima misura è cieca sui diari corti

`ruoli-834` senza tempo reale produce diari da 17-45 righe: rinvii dal fondo 0-1, «con le mani» 0.
La misura vera è sul playtest n° 6 (diari da 40-90 righe) con `analisi-diario.py`; baseline n° 5
dal testo: rinvio dal fondo battuto da un uomo di movimento **6/6**, portiere in contropiede 1/1,
«con le mani» detto di un'ala 1/1, cognome doppio in una riga 2, gol dell'eroe con la riga del gol
**0/5**, «Squadra in vantaggio!» col margine già > 1 **3/4**. Trovato e corretto prima del n° 6:
{GKH} leggeva le maglie in campo e scriveva «FONTANA (GRA)» — ora legge la rosa.

## Dopo il n° 6 — build 7.825 in catena (misure + playtest n° 7 + rituali)

- **7.818 v4 misurata con la sonda corretta**: corner annunciato → battuto **2/3** (verde) contro
  **0/5** (rosso NO818). Ladri visti dal testimone: il ponte 1 (ora guardato). Nel diario del n° 6 il
  corner esce **5/5 ma 7 minuti dopo** la parata: non era più la riga, era il **piano** che restava
  aperto 4-7 tick dopo l'ultima battuta (aspettava l'arrivo del pallone o il tetto +4). **v5**: con
  esito dichiarato il piano si chiude al tick dopo la parata (r.3895, `_chiusa818`). Misura: ritardo
  parata→corner in minuti (`rifiuti-827`).
- **7.822 v2 revocata** (0/0/0/0 aperture: il censimento del cancello dice che le finestre libere sono
  0-2 a partita e che 5 aperture su 8 nascevano sul tick del gol). **v3 — la porta differita**: il tick
  del gol non apre ma prenota; la libreria si apre al primo tick libero dopo il calcio d'inizio
  (entro 6', senza aspettare il raffreddamento). Misura `regia-833` rosso/verde.
- **7.825 (Y)** — l'assist lo fa uno dell'undici: `_matePool` dalla rosa in campo, non da
  `player.teammates` («assist di Landi», «di Giordano»: non giocavano). Rosso `__CPM_NO825`.
- **7.826 (AA)** — il compagno delle schede non è il portiere (Fontana ×3). Rosso `__CPM_NO826`.
- **7.827 (AB)** — «Stiamo dominando» pretende un tiro nostro negli ultimi 12' in cronaca; altrimenti
  «tanto possesso e nessun tiro». Rosso `__CPM_NO827`.
- **7.828 (Z)** — il duplice fischio chiude l'occasione aperta e la sua palla morta; il cancello non
  arma occasioni dal 42' al 46'. Rosso `__CPM_NO828`.
- **Q, testimone**: `__CPM_NOME814.det` registra minuto, indice e nome trovato a ogni gol nostro
  con piano; la passata lo stampa. Nel bench dei rifiuti la firma passava (1/1), nel diario del
  player no (1/4): si guarda dove si perde prima di toccare.
- 7.826-7.828 sono nel sorgente ma **non nel build 7.825** in catena: entrano nel build successivo con
  la loro misura (playtest n° 8, `analisi-diario.py`).

## Build 7.825 — rituali verdi; playtest n° 7 letto; build 7.830 in catena

Rituali del 7.825: career PASS, CI fingerprint 00001505, 0 failure. Non committato: nel frattempo il
sorgente è andato avanti (7.826-7.830), si committa il 7.830 coi suoi rituali.

- **7.822 v3 REVOCATA dalla misura** (`regia-833`: aperture 0/0/0 col verde contro 1/1/2/5 col rosso —
  la prenotazione non trova mai un tick libero: nel censimento del cancello «liberi» è 0 in tre
  partite su quattro, e 5 aperture su 8 nascevano sul tick del gol). Tre versioni, tre revoche: **il
  cancello non è la strada**, la libreria compete per gli stessi ~25 slot di riga a partita con le
  costruzioni (pg 6-14) e le recite (rec 4-11). Nel playtest n° 7 la libreria si è riaperta in 2
  partite ma **intrecciata** al piano dell'occasione (due manovre nello stesso minuto).
- **7.829 — S5, l'occasione è un'azione** (sorgente, build 7.830): il piano dell'occasione ha **cinque
  battute** — due di costruzione (un uomo di mezzo, poi chi apre; pallone addosso al nominato come
  nel 7.792) più apertura/tiro/parata — e il cancello dell'occasione non si arma sopra un'azione
  della libreria ancora in recita. Rosso `__CPM_NO829`. Misura: battute per occasione 3,0 → 5,0
  (`rifiuti-827`), righe per partita, e le manovre intrecciate nel diario.
- **7.830 — il marcatore è uno solo**: la 7.814 calcolava il nome giusto (testimone `NOME814.det`:
  5/5) e l'handler del 7.170 (badge/float del gol) lo sovrascriveva un rigo dopo con un sorteggio
  dalla rosa (4/5 nel n° 7). Ora `_tmScorer` è il protagonista dell'ultima battuta quando c'è un
  piano; maiuscole dalla rosa. Rosso `__CPM_NO830`. Misura sul testo: chi conclude = chi segna.
- **J, +7 minuti**: v5 senza effetto (ritardi 7,1,8 nel bench; 7 su 8 nel diario). Testimone
  `__CPM_J818T` (battuta / chiusura / armamento / riga, col minuto) nel build 7.830.

## Build 7.830 — playtest n° 8: 5,6

- **7.830 (Q) misurata**: chi conclude è chi segna **5/5** (n° 7: 1/5). **7.828 (Z)**: 0 occasioni a
  cavallo dell'intervallo. **7.826 (AA)**: 0 portieri come «compagno». **7.825 (Y)**: 2/2.
- **7.829 (S5)**: battute per occasione 3,0 → **5,0** (`rifiuti-827`, 4/4 complete nel diario); nessuna
  manovra intrecciata nel n° 8. La libreria (v3) apre 2/1/0/2 volte, **0 sul tick del gol**; resta la
  U (3/5 con la palla loro: racconta dal nostro lato) — lavoro sui beat, a verbale.
- **J, la causa vera al quinto tentativo**: linea temporale `J818T` — battute 9'-14', chiusura e
  armamento al 15', riga al 21', in tutti i casi +6/+7. Fra armamento e riga c'era il **dado della
  cronaca** (`_draw541`/`_bgProb`, r.4174): decide se in quel tick esce una riga, e le battute di
  piano lo scavalcano da sempre (`_forza541`), la palla morta promessa no. **v6** (sorgente, build
  7.831): `_forzaOut818` — la palla morta dell'occasione a passo 0 forza il tick. Misura: ritardo
  parata→corner (oggi 7, bersaglio ≤ 1).
- Rituali del 7.830 in coda; si committa il 7.831 (v6) coi suoi rituali.

### 7.818 v6 — il corner si batte al minuto dopo: ritardo 7 → **1** (5/5), J 5/6

`rifiuti-827` sul build 7.831, linea temporale: `close@15F arm@15 riga@15` (era `riga@21`). Ritardo
parata→corner **[1,1,1,1,1]** minuti (v5: [7,1,8]); corner annunciato → battuto **5/6** (il sesto è
l'occasione del 41'-44' chiusa dal duplice fischio, 7.828, che non arma la palla morta: corretto).
Sei versioni, quattro ipotesi smentite (ttl a righe, budget a tick, riga persa a valle, chiusura del
piano) e una sonda cieca: la causa era il dado della cronaca. Rosso `NO818` in coda per il confronto.
Rosso appaiato NO818 sullo stesso build: corner battuto **0/8**, ritardi [] — contro **5/6** e
[1,1,1,1,1] col verde. La 7.818 (v2+v3+v4+v5+v6) si dichiara: J chiusa.

## 7.831 sul branch (81e9c48) · 7.832 — la libreria parla solo con la palla nostra (U)

Build 7.831 committato e spinto sul branch coi rituali verdi (career PASS, CI 00001505, 0
failure); `main` resta fermo alla 7.807 come da direttiva. **7.832**: il turno torna nel cancello
della libreria (v1 lo aveva insieme al gol e affamava; ora l'occasione ha la sua costruzione, 7.829,
e la libreria è marginale). `regia-833`: rosso NO822T aperture 0/1/0/0, verde **1/1/0/1** — la
libreria non muore più di fame per il turno (la fame è strutturale: pg 10-30 e rec 5-15 su 22-40
tentativi); **W 0/3, U 0/3** col verde (rosso: U 0/1, campione di uno). Si dichiara per costruzione:
i beat sono scritti dal nostro lato e con la palla loro non escono più. Rituali 7.832 in coda.

### 7.832 REVOCATA — e un commit sbagliato, corretto

La CI del 7.832 era **rossa**: guardiano `partita-vera`, banda `manovra-viva` **1 riga di manovra su
2 partite (catena 1 + libreria 0), banda 10**. Col turno nel cancello la libreria non apre nel
mondo del guardiano; la 7.831 (senza) passava. Ho letto «fingerprint 00001505 · 0 failure» del
validate e ho committato e spinto (76fd9ac) scrivendo «rituali verdi» **prima di leggere `ci
exit=1`**. Errore mio, di lettura: il commit è stato **revertito** sul branch, il build torna al
7.831. Undicesima lezione sugli strumenti: si legge l'exit della CI, non il fingerprint di un suo
passo. U resta aperta: la strada è la libreria dal lato giusto (beat con {A}/{A2}), non un cancello.

## Censimento R — da dove nascono le scene dell'eroe (`scene-835`, build 7.831.1 testimoni)

Testimone `cpmEv("scena",{min,src})` su tutti gli ingressi in scena. Quattro partite (banco senza
tempo reale, quindi meno scene del playtest): **calendario-tick 11, secondo-tempo 2, catena 2,
reattiva 3**. I «due esiti nello stesso minuto» sono **2 su 4 partite e tutti e due sono catene
chance → gol** (`secondo-tempo`, la stessa azione): coerenti, non contraddizioni. La prima scena
cade fra il 10' e il 18' in tutte le partite: è il 7.803 («la prima scena presto», `_apertoDa803`
≤ 12' e passo d'attesa), una scelta di design, non un copione — resta a verbale come cosa che il
player può notare (sempre entro il quarto d'ora). Le scene reattive a `ck+2` (dopo un gol o un
cambio di momentum) sono 3 su 18. Il caso del n° 6 (Galli 12': corner → intercept fallito → gol
nello stesso minuto) non si è ripresentato nel banco: resta aperto con un campione di uno. **R si
ridimensiona**: nessun rimedio, testimone e sonda restano.

## Playtest n° 9 (build 7.831.1): 5,5 — AD e AE, un solo padrone sul racconto

- **7.833 (AE)** — la libreria ha il microfono o non ce l'ha: (a) finché l'azione della libreria è
  in recita il tick non sorteggia righe ordinarie (restano gol del microsim, battute di piano, palla
  morta); (b) se nasce qualcosa di vero (costruzione, contropiede, palla morta, calcio d'inizio,
  scena) l'azione si tronca (testimone `__CPM_LIB833T`). Rosso `__CPM_NO833`.
- **7.834 (AD)** — la scena dell'eroe non si apre con un piano aperto (occasione o costruzione
  del gol): aspetta il tick dopo la chiusura (`_apre803`). Rosso `__CPM_NO834`.
- K: tre template del contropiede/corner/rigore con «il portiere di {A}» → {GKA}. AA: il compagno
  dell'assist non è mai il portiere («assist di Fontana»).
- Misura sul testo (`analisi-diario.py`, baseline n° 9): **[AD] tiri di battuta senza esito 2**,
  **[AE] azioni di libreria intrecciate 7** (Galli 6). Bersaglio: 0 e ≤ 1. Playtest n° 10 e rituali
  del 7.834 in catena.

### 7.834 — playtest n° 10 5,7 (AD 2 → 0, AE 7 → 0), ma CI rossa: 7.833 v2

Rituali del 7.834: career PASS, **CI exit 1** — guardiano `manovra-viva` **4 righe di manovra su 2
partite (catena 1 + libreria 3), banda 10**. Letto l'exit, non il fingerprint: niente commit. La
regola (b) della 7.833 troncava l'azione della libreria anche per contropiede, palla morta e calcio
d'inizio; ma quelli nascono solo da righe sorteggiate, che la regola (a) già tace durante la recita
— il troncamento serviva solo per un piano aperto e per la scena dell'eroe. **v2**: si tronca solo
per quelli. Misura: il guardiano da solo (`partita-vera`), poi i rituali interi prima del commit.

### 7.833 v2 + 7.834 + 7.835 sul branch (0c956f9)

Guardiano da solo con la v2: `manovra-viva` **17** righe (catena 1 + libreria 16), banda 10.
Rituali interi: career PASS, **CI exit 0**. Il build sotto rituali conteneva anche la **7.835**
(il gol LORO firmato dal protagonista dell'ultima battuta del loro piano; rosso `__CPM_NO835`),
entrata nel sorgente prima della ricostruzione: committata con la sua misura in coda (playtest
n° 11, «chi conclude è chi segna» sui gol subiti). Nota di metodo: lo script di commit che toglie
un'eccedenza dal sorgente si è fermato sul primo controllo (l'HTML CONTENEVA l'eccedenza) e non
ha committato nulla: verificato con `git log` prima di rimettere e committare a mano.

## Censimento 836 — «in casa la squadra non tira»: il turno non segue la simulazione

`finestre-836` (finestre libere del cancello dell'occasione, 4 partite): Vairo **turno nostro 1 su
10** (adv mediano 20), turno loro 9 (4 con adv ≥ 48); Moretti 5/8 nostro; Galli 3/7; Conti 3/6.
`poss-836` (stato della partita minuto per minuto): il microsim dà possesso **50%** (Vairo) e
**62-74%** (Conti), ma il turno del racconto è loro per **60 e 62 minuti su 89**. Il turno si scrive
solo in modo causale (interruzioni, esiti, costruzioni): i loro eventi lo portano da loro, i nostri
non nascono perché alle finestre libere la palla è in mano loro — un cerchio. La simulazione dice
una cosa e il racconto un'altra: è S2/S3.

**7.836 — il turno segue il possesso della simulazione**: nei tick quieti (nessun piano, recita,
palla morta, scena) il turno si riallinea al possesso del microsim con un sorteggio seminato (~una
volta ogni 5 minuti, `_rndTick`). Rosso `__CPM_NO836`. Misura appaiata in corso: minuti col turno
nostro contro possesso del microsim (bersaglio ±10 punti), occasioni nostre alle finestre libere
(Vairo 1/10 → ≥ 3/10), poi playtest n° 12 (tiri nostri in casa: Vairo 0 in 89' per tre volte).

### 7.836 v1 misurata: poco effetto → v2 (controllo, non dado)

Minuti col turno nostro su 89, rosso → verde v1: Vairo **22 → 23** (possesso microsim 51-75%),
Moretti 42 → 47, Galli 27 → 42, Conti 37 → 38 (possesso 49-66%). Finestre libere nostre: Vairo
1/10 → 3/7 (adv ≥ 48: 0 → 2). Due partite su quattro dentro i ±10 punti: non basta. Il dado al 20%
nei tick quieti sposta poco perché i tick quieti sono pochi e le scritture causali riportano il
turno da loro. **v2**: storia del turno negli ultimi 15', nei tick quieti se la quota nostra sta
sotto il possesso del microsim di più di 10 punti il turno passa a noi, se sta sopra di più di 10
passa a loro. Stessa misura, in corso.

### 7.836 v2 misurata: il turno si avvicina alla simulazione, non ancora dentro i ±10 ovunque

Minuti col turno nostro su 89 (rosso → v1 → **v2**; possesso microsim in coda): Vairo 22 → 23 →
**34** (51-62%), Moretti 42 → 47 → **39** (49-69%), Galli 27 → 42 → **42** (44-48%), Conti 37 → 38
→ **45** (49-72%). Dentro i ±10 punti: Galli e Conti (2/4); Vairo e Moretti restano sotto di 15-20.
Finestre libere di Vairo: turno nostro 1/10 → **4/10**, con adv ≥ 48 **0 → 3**, occasioni armate
2 → **4**. Il controllo agisce solo nei tick quieti, che sono pochi: il resto lo scrivono gli
eventi. Misura che conta per il player: tiri nostri in casa nel diario (playtest n° 12), poi i
rituali. Si dichiara quello che c'è, non quello che manca.

### 7.836 v2 sul branch (69640c1) — playtest n° 12: 5,9

Rituali: career PASS, CI exit 0, `manovra-viva` 10 righe (banda 10: al limite, dichiarato).
Playtest n° 12: Vairo in casa **0 → 3 tiri nostri**, minuti muti 53 → 38, 1-0 con tre occasioni e
il gol dell'eroe subito dopo un corner nostro; media 5,7 → **5,9**. Nuova AF (l'azione della
libreria continua oltre il duplice fischio) → **7.837** nel sorgente (il fischio tronca anche la
libreria), non nel build committato.

### 7.837 v1 — CI rossa (manovra-viva 6 su banda 10), AF ancora 1 → v2 in misura

Rituali del 7.837 v1: career PASS, **CI exit 1**: `manovra-viva` **6 righe su 2 partite (catena 2 +
libreria 4)**, banda 10. Il playtest n° 13 dice anche che v1 non chiudeva AF: l'azione della
libreria nasceva **sul tick stesso del 45'**, dopo il troncamento. **v2**: la libreria non si apre
sul 45' né durante la ripresa (`kickRef`, `kickoffRef`). Nota di banda: la libreria oggi compete
con le occasioni a cinque battute (7.829) per gli stessi slot di riga — 17, 10, 6 righe nelle ultime
tre corse del guardiano. Se la v2 resta sotto 10, la scelta è fra tenere AF aperta (una riga su
quattro partite) e rivedere la banda a verbale; non si tocca la banda di nascosto.

### 7.837 REVOCATA (v1 e v2): il guardiano dice 6 in tutti e due i casi

`partita-vera` sul build v2: `manovra-viva` **6 righe (catena 2 + libreria 4)**, identico alla v1 —
il mondo del guardiano è seminato, e troncare/non aprire la libreria attorno al 45' gli costa 4
righe rispetto al 7.836 (10). La banda è 10 e non si tocca di nascosto. Sorgente e HTML riportati al
7.836 v2 committato (69640c1). **AF resta aperta** e dichiarata: un'azione di libreria che
prosegue oltre il duplice fischio in una partita su quattro. La strada giusta non è un altro
cancello: è dare alla libreria uno slot suo (S5, la libreria come corpo dell'occasione) così che la
banda non dipenda dai cancelli.


### 7.838 (strumento, AC): il diario legge quello che il player legge

Il gol dell'eroe «senza un'azione prima» era in parte un artefatto del diario: la scena mostra
titolo, introduzione e poi la SCELTA del player, e il diario registrava solo l'esito. Ora sotto
`__CPM_REC` entrano nel diario `▶ titolo — intro` (hl_intro) e `▶ scelta: … → esito` (risoluzione),
non contate come righe di cronaca. Censimento n° 14: 3 gol su 5 con un'azione prima leggibile; i due
«no» sono la scena aperta sopra un contropiede loro (→ 7.839) e il titolo d'intento generico
(«Tentativo di cross») che si legge solo con la scelta.

### 7.840 (E): il gol sulla respinta si dice

«La conclusione è respinta — c'è ancora da giocare!» → «Destro perfetto — nessuna speranza!» era la
catena chance→gol raccontata con una frase da primo tiro. Se la scena è un secondo tempo
(mischia/rimbalzo/sponda) il gol nomina la respinta. Misura: gol di catena che nominano la respinta
**2/2** (n° 15) contro **0/2** (n° 14, rosso `__CPM_NO840`).

### 7.839 (P): il contropiede è un'azione promessa — cinque versioni, tutte misurate

Rosso (n° 14): annunci 2, chiusure entro 3' 0/2, nome del corridore diverso fra annuncio e volo.
- **v1** (riga in volo e chiusura scavalcano il dado; nome cotto; scena non sopra il contropiede;
  fallo tattico non muto): volo 3/4 col nome coerente, chiusure **0/4**.
- **v2** (il fallo tattico è la palla morta promessa, passa dal cancello del 7.818 v6): chiusure
  ancora **0/4**. Traccia `ct839`: il corridore si ferma a x=44 e non arriva mai a 24 → il contropiede
  durava 9 minuti e la chiusura veniva sovrascritta dal ponte verso la scena.
- **v3** (tre battute; ponte e annuncio-scena non sovrascrivono): chiusure **4/7**, nomi 7/7. Restano
  la catena (r.4595) che sovrascrive nello stesso tick e l'annuncio sotto il piano del gol.
- **v4** (la chiusura resta viva fino al tick dopo; si spegne in testa al tick successivo): n° 18
  chiusure 2/2 ma un annuncio sostituito dalla scheda d'interazione (7.669).
- **v5** (la scheda non sovrascrive l'annuncio): rituali e playtest n° 19 in corso.

Lezione dodicesima: nel tick ci sono nove registi in fila e ognuno guarda solo le macchine
«vive» all'inizio; una macchina che si chiude nel tick lascia la sua riga scoperta ai registi dopo.
La chiusura differita di un tick è il rimedio minimo; la strada di fondo resta «il regista è uno».


### 7.840 sul branch (dfc2361) — e una rettifica sul guardiano

Playtest n° 19: chiusure del contropiede 2/2 (somma v3-v5: **8/11**, rosso 0/2), nomi 11/11, media
**6,2**. Career PASS. **CI exit=1** su `manovra-viva`: 5 righe su 2 partite, banda 10. Misura pulita,
mondo seminato, stesse condizioni, ognuna ripetuta: build 7.840 v5 **5/5**, rosso `__CPM_NO839` **5**,
rosso `__CPM_NO839,__CPM_NO840` **6**, e la **baseline committata 69640c1 (7.836 v2) 6/6**. La banda
è rossa sulla baseline stessa: la modifica non la muove. Il build è sul branch con questo stato
dichiarato nel messaggio di commit, non come «rituali verdi».

**Rettifica**: la 7.837 era stata revocata per «manovra-viva 6 contro 10 del 7.836 v2». Oggi il
7.836 v2 misura 6 nelle stesse condizioni: quel 10 era un campione preso in condizioni diverse
(le righe della libreria escono da timer a 1,3 s e il conteggio dipende dal carico della macchina),
e il confronto non valeva. La revoca della 7.837 resta per l'altra ragione (v1 non chiudeva AF; v2
mai misurata al playtest): AF è aperta e la 7.837 v2 torna candidata, da misurare al playtest.

**Strumento da rifare (prossimo passo)**: il guardiano confronta un numero assoluto con una banda
fissa in un mondo che cambia a ogni testo modificato; deve diventare **comparativo**: stesso mondo,
build corrente contro baseline committata, con il rosso appaiato, e giudicare la differenza.


### 7.841 (strumento): il guardiano conta tutte le macchine che raccontano una manovra

Lo strumento non deriva: la 0c956f9 misura **17** anche oggi (identico al 08/09). Il calo è reale e
nasce con la **7.836 v2**: 69640c1 → catena 2 + libreria 4; build 7.840 con `__CPM_NO836` → libreria
**10** (con 7.836 accesa: 4). Il turno che segue il possesso dà più finestre alle occasioni a cinque
battute (7.695/7.829) e la libreria perde i suoi slot: è una **sostituzione**, la stessa letta dal 7.684
quando la libreria sostituì la catena — e verso l'alto, perché le battute del piano hanno protagonisti
dalle posizioni reali e un esito. Il guardiano ora conta anche le battute di piano (`rk manovra-gol`),
banda invariata (5 a partita): build 7.840 → **37** (catena 1 + libreria 4 + battute 32), verde.
La 7.837 era stata revocata attribuendo alla 7.837 un calo che era della 7.836 v2: rettificato; AF
resta aperta e la 7.837 v2 candidata.


### CI verde sul build 7.840 (dfc2361) col guardiano 7.841; 7.842 (AF) in misura

`ci exit=0`, career PASS. `manovra-viva` **42** (catena 2 + libreria 8 + battute di piano 32) su banda
10. Nota onesta: la libreria in due passate sullo stesso build ha dato 4 e 8 righe — il conteggio delle
righe da timer (1,3 s) oscilla fra una passata e l'altra; le battute di piano (32 e 32) no.

**7.842 (AF)**: il duplice fischio tronca anche l'azione della libreria (i timer trovano `libAzRef`
nullo) e il cancello non apre dal 44' al 46'. Rosso `__CPM_NO842`. Misura: azioni di libreria oltre
il 45' nelle 4 partite (rosso n° 12-19: 1 su 4, Vairo 45'-47'); playtest n° 20 in corso, poi
career e CI.


### 7.842 v3 sul branch (04953b6): AF chiusa

Tre versioni sugli stessi semi. v1: AF 0/4 (rosso 1/4) ma attorno al fischio una riga ordinaria dopo
il fischio e un contropiede che attraversa l'intervallo con «Lombardi lancia Lombardi». v2: il fischio
spegne anche il contropiede, pausa del dado di due tick, nome del corridore dal risolutore ({H2} lo
esclude): AF 0/4, ma la riga ordinaria slitta al 46' e un contropiede si arma al 44'. v3: pausa di tre
tick, nessun contropiede armato al 44'-45': **fischio pulito 4/4**, contropiedi 2/2, AF 0/4. Career
PASS, CI exit 0 (manovra-viva 37). Playtest n° 22: media **6,3**. Residuo: un tiro di battuta al 44'
senza esito per il fischio (1 caso su 4 partite), dichiarato.

Prossima area: **Ritmo** (5). Nel diario 33-45 minuti senza righe; le pause lunghe (≥ 4') sono nei
primi minuti (2'-7' in 3 partite su 4) e nei 4-5' dopo un gol del microsim. Prima di rimediare, si
guarda lo SCHERMO in quei minuti: se c'è la festa del gol o il calcio d'inizio, il diario sovrastima il
silenzio e lo strumento va corretto; se non c'è niente, è ritmo.


### 7.843 (RITMO): la palla morta dura quanto dura — causa letta con lo schermo

Strumento 7.843: un testimone per tick dice che cosa c'è sullo schermo (calcio d'inizio, ripresa,
scena, palla morta, fermo, piazzato, pausa del dado, piano, contropiede, libreria) e il diario
classifica ogni minuto muto. Moretti in casa (build 7.842): 44 minuti muti = **24 di palla morta** + 9 di
pausa del dado dopo i gol + 11 di calcio d'inizio/ripresa + **0 di vuoto vero**. Interruzioni 15, di
cui 11 falli a 5', 9', 14', 18', 22', 26'…, ognuna 3-4 tick (5-7 s reali) e per lo più muta (tetto
7.632 v7). Il fermo a 4 tick (7.566) serviva a far ARRIVARE la mesh sul punto: su un fallo la palla è
già lì.

Quattro versioni sullo stesso seme (minuti di palla morta su Moretti, rosso **41**):
- v1: durata per tipo nel `ttl` (fallo 2, rimessa/rinvio 3, corner 4), p fallo 0,55 → 0,30: **39** —
  il `ttl` non era la durata: le rimesse si prendevano i tick liberati (falli 10 → 3, rimesse 2 → 7).
- v2: raffreddamento di tre minuti fra un fischio e l'altro, rimessa/rinvio 2: ancora run di 3-9
  minuti — la durata vera è il **budget per tick `tk632`** (4, 10 per il corner dell'occasione), non il
  ttl per riga.
- v3: il budget per tick legge la durata per tipo: **27**; restano i run lunghi delle palle morte
  armate dagli altri due siti (la riga che dichiara l'interruzione, 7.559; il corner dell'occasione
  con budget 10 la cui battuta aspettava il dado: Moretti 17'-24').
- v4: durata per tipo e raffreddamento anche nel sito 7.559; la battuta del corner dell'occasione
  (step 2) passa dal cancello forzato come il fischio: **14** minuti di palla morta, 7 interruzioni.
Rosso `__CPM_NO843`. Playtest n° 23 + career + CI in corso. Banda del guardiano `arbitro-esiste`
(≥ 6 interruzioni su 2 partite) da leggere.


### 7.843 v4 sul branch (a87db65): Ritmo 5 → 6

Playtest n° 23: minuti muti 41/45/45/33 → **34/31/28/31**, palla morta 4-7 a partita (era 24), righe
lette 76-91. Career PASS, CI exit 0 (manovra-viva 50, arbitro-esiste 22 su 2 partite). Media **6,4**.
Quello che resta muto è per progetto (pausa di lettura dopo ogni riga, ripresa dopo ogni gol) più
dieci minuti di «fermo» senza palla morta a Vairo, da leggere.


### 7.845 (RITMO, «fermo») e 7.844 (R, la prima scena al 13'): cause lette con lo schermo

**Fermo**: a Vairo (n° 23) dieci minuti classificati «fermo» senza palla morta. Sonda per minuto:
47'-53', una punizione armata al 47' con il calcio d'inizio della ripresa a 2 e il dado in pausa — il
piazzato e il calcio d'inizio avanzano solo su una riga sorteggiata (tetto reale del piazzato 30 s =
17 minuti di gioco). Stessa malattia del corner dell'occasione (7.818 v6), del contropiede (7.839) e
della palla morta: la macchina promessa non deve aspettare il dado. 7.845: piazzato (senza calcio
d'inizio e senza piano aperto) e calcio d'inizio passano dal cancello forzato. Vairo: fermo 10 → 4
minuti, tutti con la loro riga (33'-34' e 53'-54'). Rosso `__CPM_NO845`.

**Prima scena al 13'**: n° 23, tutte e quattro le partite (n° 19: 19/10/30/10). Il calendario delle
scene parte all'8' per tutti (7.500: 8 + passo×i, non seminato) e il «picco» dell'andamento (7.803) si
misurava su una storia lunga un minuto: al primo minuto utile era già vero. 7.844: il picco vuole
almeno sei minuti di storia e l'apertura della finestra è seminata per partita (0-5 minuti in più).
Vairo 13' → 14'. Rosso `__CPM_NO844`. Playtest n° 24 + career + CI in corso.


### 7.846 sul branch (9f1ed5d): la libreria senza timer lascia il microfono; 7.844 v2 chiude R

Moretti n° 25, 36'-44': nove minuti senza una riga con la libreria «in recita». Causa: l'azione si era
aperta a ridosso della scena del 32'; il cambio di fase ha cancellato i suoi timer, l'indice non è
mai avanzato, la regola (a) del 7.833 ha taciuto il tick fino al fischio. Rimedio: oltre 9 s reali
l'azione è morta e si chiude (una vive 1,3 s × 5 righe). n° 26: Moretti 28 → 16 minuti muti, silenzio
più lungo 9' → 4', «libreria muta» 7 → 0 nelle quattro partite. Nel guardiano la libreria torna da 0
a 4 righe. 7.844 v2: prima scena 13/13/13/13 → 21/24/25/14. Career PASS, CI exit 0.

Tredicesima lezione: una macchina «in recita» deve avere un orologio suo; se dipende da timer che
altri possono cancellare, chi la interroga deve poterla dichiarare morta.


### 7.847 (S5: il filtrante in area) misurata, e la causa vera sotto: il nominato non corre

Rosso (n° 27): tiri di piano da dentro l'area 3/13. 7.847: una volta su due, se il ricevente sta oltre
avanzamento 64, l'apertura è un filtrante con punto d'arrivo in area e la battuta del tiro aspetta il
tiratore sul pallone (≤ 5u, tre tick). n° 28: filtranti 3 (testo e zona giusti), da dentro l'area
3/12 — non sposta il conto perché Galli e Conti non hanno mai un ricevente oltre 64. La misura nuova
dice la cosa che conta: **alla battuta del tiro il tiratore non è mai sul pallone, 0/12, a 10-26u**,
filtrante o no. Traccia `att847` su Vairo: al filtrante del 9' il nominato corre 25u ma verso y=23
mentre il pallone va a (84,44); nell'occasione avversaria il nominato sta a x=44 per tre battute.
Causa nel movimento (r.5845): l'eletto è il più vicino al pallone a ogni tick e solo lui ha il passo
0,55 — il nominato dal piano perde la corsa al primo tick. È il 7.797 letto dall'altra parte
(«l'uomo non si era mosso»). → **7.848**: finché la custodia del piano è viva, il portatore è il
nominato e il suo bersaglio è il punto d'arrivo della battuta. Misura: tiratore sul pallone alla
battuta del tiro (rosso 0/12). Rosso `__CPM_NO848`.


### 7.848 v5 sul branch (6f8a284): il nominato dal piano corre sul punto d'arrivo

Rosso n° 28: alla battuta del tiro il tiratore a 10-26u dal pallone, 0/12. Traccia tick per tick
(`run848`) e quattro cause tolte una per volta, ognuna con la sua misura:
1. il portatore scritto dalla battuta veniva riscritto a ogni tick dall'elezione d'arrivo (r.6014) →
   il nominato si legge dal piano (`lastChi814`);
2. il blocco del movimento gira un tick su tre (r.5815): un passo di 0,55 ogni tre minuti, 7u in
   quattro tick → sotto custodia del piano il blocco gira a ogni tick;
3. la seconda autorità sulle posizioni (le corsie, `velRef`, r.2589) tirava il nominato a y=5 mentre il
   pallone andava a y=20 → le corsie cedono il nominato finché la custodia è viva;
4. l'attesa del tiro misurava la distanza dal pallone in volo: il tiro partiva a x 76 con «da due
   passi» → uomo E pallone sul punto d'arrivo (≤ 5u, tre tick).
Traccia finale su Vairo: tiratore a 2,3u dal pallone, tiro da x 81. Playtest n° 29: sul pallone
**6/14** (entro 8u 10/14), da dentro l'area 2/14. Career PASS, CI exit 0 (custodia mediana 4,7u).
v6 in misura: ogni tiro aspetta (non solo il filtrante), filtrante da avanzamento 58.

Quattordicesima lezione: sulle posizioni ci sono due autorità (il blocco a passo `k` e le corsie a
velocità) e una terza che elegge il portatore a ogni tick; un nominato dal testo corre solo se tutte
e tre glielo lasciano fare. Le revoche 7.793 e 7.797 avevano incontrato lo stesso muro senza vederlo.


### 7.848 v6 sul branch (7f06d46): S5 al metro

Ogni tiro di piano aspetta uomo e pallone sul punto d'arrivo (prima solo il filtrante); filtrante in
area da avanzamento 58. n° 30: tiri da dentro l'area **6/12 = 50 %** (rosso 3/13; roadmap S5 ≥ 50 %),
tiratore sul pallone **6/12 ≤ 5u, 9/12 ≤ 9u** (rosso 0/12). Career PASS, CI exit 0. Scorecard 6,4,
Realismo 6 → 7. Residuo dichiarato: tre tiri con il tiratore a 11-16u, l'attesa scade dopo tre tick
col pallone non ancora arrivato.

## 7.850 — il portatore è dove la simulazione lo mette (S2 v3), dal collaudo da telefono

Il collaudo da telefono n°1 (5,3) ha misurato il pallone reso ai piedi del padrone della simulazione
al 6-17 % (banda ≥ 60). Censimento sul campo (sonde `padroni`/`ritardo`, Vairo casa, 150 s):

| termine | mediana |
|---|---|
| pallone reso ↔ corpo del portatore della simulazione | 11,8u (≤ 3u nel 9 %) |
| pallone reso ↔ corpo PIÙ VICINO di chiunque | 1,5u (≤ 3u nel 66 %) |
| pallone reso ↔ pallone logico | 1-2u |
| corpo del portatore ↔ suo punto logico | **11,8u** = offset visivo 8,2u + inseguimento 6,3u |
| colla `portatore` del renderer su un corpo diverso da `carrierRef` | 274 campioni contro 41 |

Cioè: il pallone reso sta ai piedi di *qualcuno* due volte su tre, ma non dell'uomo che la simulazione
nomina, perché il corpo di quell'uomo è disegnato a 12u dal suo punto logico: 8u di offset voluto del
blocco «forma del reparto / pressing» (la nota 7.592 lo aveva misurato e lasciato come decisione di
prodotto) e 6u di inseguimento a 5 u/s. La decisione la prende la direttiva («la simulazione è la
source of truth»): per l'uomo sul pallone l'occhio deve vedere ciò che la simulazione decide.

Quattro tagli, uno per volta, ciascuno con la sua traccia:
- **v1** (src/12): il portatore (`carrierRef.i`) ha per bersaglio il suo punto logico, senza offset;
  in `animOne` niente bersaglio commesso, punta 13 u/s, accelerazione ×2,5; `_por526` segue
  `carrierRef` (la 7.813 v1, che da sola non bastava). Coppia ≤ 3u: Vairo 7 % → 25 %, Moretti
  24 % → 39 %. La traccia della tenuta: il corpo chiude da 17 a 8,6u, poi il punto logico salta di
  13-20u (il passo k 0,55 una volta ogni tre tick).
- **v2** (src/14): l'inseguitore del pallone fa il suo passo a ogni tick, gli altri venti al passo di
  prima. Vairo 28 %, Moretti 18 %: non si muove.
- **v3**: la simulazione dichiara l'inseguitore (`chaserRef850` = `_cI553`) e anche quel corpo va sul
  punto logico (chi sta per ricevere deve già esserci: il portatore cambia 9-11 volte al minuto).
  Vairo 33 %, Moretti 17 %.
- **v4**: la traccia per fotogramma (`__CPM_TR850`) mostra la velocità voluta a 2-4 u/s con 13
  disponibili: il freno per girarsi (7.241) e il limite di sterzata scattano a ogni spostamento del
  bersaglio. Per il portatore e l'inseguitore, niente freno. **Vairo 48 %, Moretti 34 %**; corpo del
  portatore ↔ suo punto logico 11,8 → 6,7u; inseguimento 8,2 → 4,5u.
- **v5 — REVOCATA**: passo lineare min(d, 15u) per l'inseguitore nella simulazione: Vairo 42 %,
  Moretti 41 %, pallone logico ↔ portatore logico 5,9/5,2 → 6,8/8,7u. Non batte la misura.

Residuo, misurato: il pallone LOGICO sta a 5-6u dal portatore LOGICO (≤ 3u nel 25 %). Non è la
corsa: è l'etichetta. `carrierRef` resta sull'uomo finché il pallone non è oltre 12u (7.642), quindi
un passaggio corto lascia «portatore» chi non ce l'ha più, e l'elezione cambia solo se il pallone
arriva entro 2,5u da qualcuno. È lo stato «in volo» della roadmap S1+S2: il prossimo taglio (7.851),
sul lato simulazione, con i consumatori del portatore (righe, custodia, coda delle proposte) da
censire prima.

Misura finale sulla sonda da telefono (pallone reso ai piedi del padrone della simulazione, ≤ 3u):

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| rosso `NO850` (stessa build) | 13 % | — | 5 % | — |
| n°1 (7.849) | 15 % | 17 % | 7 % | 6 % |
| **7.850** | **32 %** | **34 %** | **23 %** | **14 %** |
| a palla a terra, 7.850 | 37 % | 44 % | 31 % | 21 % |
| distanza reso↔padrone, mediana (rosso → 7.850) | 11,3 → 8,4u | 11,1 → 7,5u | 11,6 → 8,4u | 10,3 → 8,2u |
| salti > 8u (rosso → 7.850) | 54 → 43 | 52 → 64 | 49 → 44 | 49 → 54 |

Ogni partita batte il suo rosso; la banda (≥ 60 %) resta lontana e i salti non si muovono. Career
PASS, CI exit 0 (manovra-viva 59, gol del simulatore 7/7). **Sul branch, parziale**: il residuo è
l'etichetta del portatore (7.851). fps del banco 14-17: dichiarato, non è il telefono.

## 7.851 — l'etichetta del portatore cade quando il pallone lascia l'uomo (stato «in volo»)

Censimento sulla 7.850: il pallone LOGICO sta a 5-6u dal portatore LOGICO (≤ 3u nel 25 %). Non è la
corsa: è l'etichetta. La decadenza 7.642 guarda il BERSAGLIO (> 12u), quindi un passaggio corto
lascia «portatore» chi non ce l'ha più, finché l'arrivo non elegge un altro entro 2,5u; se il
pallone atterra dove non c'è nessuno, l'etichetta resta sul vecchio per tick — e il renderer, che
ora la legge (7.850), incolla il pallone a un corpo che non lo ha.

Lettori dell'etichetta censiti in `src/14` (11): il passatore 7.738 (r.2759-2810, che al passaggio
la sposta già sul ricevente), la decadenza 7.642, la scelta dell'inseguitore 7.848, il moto col
waypoint della trama (r.5971, entro 8u dal bersaglio), la sosta d'arrivo `holdArr` (r.6037), il
corridoio 7.642 (r.6396), tre testimoni. Tutti tollerano il nullo (guardie `carrierRef.current&&`).

7.851: nel blocco del movimento, subito dopo la decadenza a 12u, l'etichetta cade quando il pallone
logico è a più di 6u dall'uomo (oltre un tocco di conduzione) E il bersaglio non è ai suoi piedi
(> 4u). Rosso `__CPM_NO851`. Coppia (`padroni`, 150 s):

| | Vairo rosso | Vairo 7.851 | Moretti rosso | Moretti 7.851 |
|---|---|---|---|---|
| pallone reso ai piedi del portatore (≤ 3u) | 41 % | **48 %** | 39 % | **44 %** |
| distanza reso ↔ corpo del portatore, mediana | 5,0u | 3,7u | 7,7u | 4,0u |
| corpo più vicino di chiunque ≤ 3u (non condizionato all'etichetta) | 61 % | 61 % | 56 % | 55 % |

Il numero non condizionato non cambia: l'etichetta non sparisce per far bella figura, la sonda da
telefono ora stampa anche la quota di campioni con un padrone dichiarato.

### 7.851 — **REVOCATA** sulla sonda da telefono

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| rosso `NO851` | 31 % | — | 19 % | — |
| 7.851 | 25 % | 29 % | 28 % | 22 % |
| 7.850 (passata precedente) | 32 % | 34 % | 23 % | 14 % |

Le due partite col rosso vanno in direzioni opposte (−6 e +9) e le altre due stanno dentro il
rumore fra passate (±6, misurato oggi sulla stessa build). Il guadagno del censimento (+7/+5) non
regge sul metro. Resta a richiesta (`__CPM_SI851`), sorgente a 7.850. La diagnosi resta: dopo un
passaggio corto l'etichetta è stantia; il rimedio da provare è nell'ELEZIONE d'arrivo (chi riceve
entro 2,5u — oggi se il pallone atterra dove non c'è nessuno l'etichetta non passa), non nella
caduta dell'etichetta. Lezione: una coppia su 150 s di due partite non basta quando il rumore fra
passate è ±6; il metro è la sonda da telefono su quattro partite, e quella decide.

## #74 — il gol del compagno: misura con la sonda `gol74` (09/09 notte)

Per ogni riga di gol, 5 s a 100 ms: pallone reso e logico, porta e pallone in quadro (`__CPM_INQ74`
proietta un punto del campo nella camera). Conti fuori (4-0) e Moretti casa (3-0), build 7.850:

| gol | fase | pallone reso x alla riga → +5 s | logico x | porta in quadro | pallone in quadro |
|---|---|---|---|---|---|
| Conti 23' Ferrari | playing | 100,6 → 81 | 95 → 78 | 66 % (da 0,0 s) | 78 % |
| Conti 23' Conti (scena) | hl_result | 99 → 43 | 78 → 47 | 38 % | 100 % |
| Conti 54' Scotti | playing | 85 → 97,8 | 93 → 97,8 | 78 % (da 0,6 s) | 82 % |
| Conti 75' Bruno | playing | 90 → 88,5 | 95 → 83 | 10 % (da 0,8 s) | 88 % |
| Moretti 26' Moretti | playing | 100,6 → 34 | 50 → 31 | 20 % | 78 % |
| Moretti 36' (scena) | hl_result | 99 → 49 | 72 → 55 | 38 % | 84 % |
| Moretti 40' Moretti (assist Neri) | playing | 54 → 38 | 55 → 38 | **0 % (mai)** | 88 % |
| Moretti 54' Neri | playing | 100,6 → 84 | 93 → 80 | 34 % (da 0,5 s) | 78 % |

Letture. (a) La camera NON è il difetto: segue il pallone reso (`bx` = mesh del pallone) e il
pallone è in quadro nel 78-100 % dei 5 s. (b) Il piano del gol porta il pallone LOGICO a x 93-95
prima della riga (Ferrari, Scotti, Bruno, Neri): l'azione c'è nei numeri. (c) Il pallone RESO alla
riga sta o già in rete (100,6: l'affermazione 7.811 lo ha portato lì in 1,4 s dal bordo dell'area,
il «tiro da centrocampo» del #48) o al bordo dell'area (85-90) e in un caso non entra mai (Bruno:
90 → 88). Nei fotogrammi la palla è sull'arco dell'area con gli uomini attorno (7.850), ma **non c'è
il tiro**: nessun corpo calcia, il portiere non si muove, la rete arriva per affermazione. (d) Due
gol dell'eroe in fase ambientale col pallone a centrocampo: Moretti 26' (logico 50 → 31) e 40'
(54 → 38, porta mai in quadro) — il «rigo ambientale» del gol dell'eroe (H) non passa dal piano
né dall'affermazione.

Strada (7.852, domani): il gol del microsim è l'ULTIMA BATTUTA di un'occasione — un tiro da un corpo
sul pallone (attesa 847: uomo e pallone sul punto), arco fino alla rete, portiere che si muove —
e l'affermazione 7.811 diventa il caso di riserva, non la regola; il gol ambientale dell'eroe
passa dallo stesso piano. Misura: `gol74` su 4 partite, «porta in quadro alla riga» ≥ 8/9 e
«pallone reso in rete entro 1,5 s da un corpo entro 3u» ≥ 8/9.

## 7.852 — il gol è un tiro che entra, non un'affermazione

L'ultima battuta del piano del gol (`_pianoGol649`, tre famiglie) mandava il pallone a x 92-94:
davanti alla porta, non dentro. La rete arrivava per lock (7.811, 1,4 s dal bordo dell'area) senza
tiro. Ora la battuta col tiro ha per bersaglio la rete (x 100,6, y fra i pali): `rete:1` esenta il
bersaglio dal morsetto 4-96 (r.4524, r.4544), non nomina nessuno da mandare in porta (7.848) e
lascia il portatore nullo (il pallone vola). L'arco è quello del tiro (7.808), parte da dove uomo
e pallone si sono trovati (attesa 847), il tuffo del portiere si arma sul tiro in area (ATE-2).
Rosso `__CPM_NO852`. Sonda `gol74`, gol del microsim in fase ambientale:

| | rosso `NO852` (Conti) | 7.852 (Conti + Moretti) |
|---|---|---|
| pallone reso in rete (100,6) alla riga | 0/3 (88,6 · 84,5 · 90,3; uno arriva a 97,8 dopo 0,6 s) | **4/4** |
| porta in quadro nei 5 s | 70 · 78 · 24 % | 74 · 80 · 54 · 92 % |
| porta in quadro alla riga (0,0 s) | 0/3 | 3/4 |

Rettifica sui «gol dell'eroe col pallone a centrocampo» (Moretti 26', 40'): non sono gol in fase
ambientale. La riga «⚽ Moretti segna su assist di …» esce 140 ms dopo l'esito della scena (r.7073,
`fxTimeout` 140) quando la scena è già chiusa e la ripresa ha riportato il pallone logico al centro
(50): la sonda la legge in `playing` col pallone a 50 → 21, ma il fatto visivo — tiro e rete — sta
nella scena (`hl_result`, pallone reso a 99). Non serve una 7.853: al più la riga potrebbe uscire
dentro la scena, e si valuta col telefono.

Telefono (4 partite, 7.852): pallone ai piedi del padrone 38 / 34 / 19 / 40 % (7.850: 32 / 34 / 23 /
14): nessuna regressione. Career PASS, CI exit 0 (manovra-viva 67, gol del simulatore 7/7).
**Sul branch.** Prossima misura: la sonda da telefono con i fotogrammi dei gol letti a occhio (è il
metro del PO), e `gol74` su quattro partite.

## 7.853 — il portiere sul gol: **REVOCATA** con la coppia

Sonda `gol74` estesa (posizione del portiere avversario alla riga e a +5 s, tuffi nel testimone
`__CPM_GK799`). Sulla 7.852, gol del microsim: portiere a 8,8-10,2u dalla porta alla riga, tuffi
nella finestra 0 in 3 gol su 4; nelle scene dell'eroe sta a 3,4-3,6u. Rimedio provato: la battuta
della rete arma il tuffo col segnale del piano (`gkSave695`) e il portiere sta sulla linea (97,5)
col pallone in area.

| gol del microsim | rosso `NO853` | 7.853 |
|---|---|---|
| portiere alla riga (u dalla porta) | 9,3 · 10,1 · 11,0 | 9,1 · 8,1 · 10,3 · 7,9 |
| tuffi nella finestra di 5 s | 1 · 0 · 1 | 0 · 0 · 0 · 0 |

Non batte la misura. Perché, a verbale: il segnale del piano è bloccato dalla guardia 7.808 (un
tuffo T8 armato al tiro negli 8 s precedenti — e il T8 parte al tiro, cioè PRIMA della riga, fuori
dalla finestra che conto); la posizione non si muove perché la distanza che misuro include la y
(il portiere sta fra 38 e 62) e il bersaglio visivo passa comunque dagli offset e dall'inseguimento.
Resta a richiesta (`__CPM_SI853`), sorgente a 7.852. Prima di riprovare: misura la sola x dalla
linea e conta i tuffi da 1 s prima della riga; poi decidi se il difetto è la posa (portiere fuori
quadro) o il tuffo (che nei fotogrammi c'è in 2 gol su 5).

Misura rifatta sulla 7.852 (x dalla linea, tuffi contati dal TIRO), Conti fuori e Moretti casa, gol
del microsim: portiere a **9,0 · 10,1 · 9,3 · 10,5u dalla linea** (y entro 3u dal centro), tuffi dal
tiro **2 · 2 · 2 · 2** (T8, al tiro). Quindi il tuffo C'È — il portiere si tuffa a 9-10u davanti alla
sua linea mentre il pallone vola a 100,6, dieci unità dietro di lui: nei fotogrammi è «a terra» quando
la camera lo tiene, «assente» quando resta fuori dal quadro largo. Il difetto è la POSA, non il tuffo:
la regola d'uscita del portiere (src/12 r.4405: bersaglio 94 meno un passo fino a 4,5) lo tiene a
x 90-93, e la 7.853 col bersaglio 97,5 meno lo stesso passo lo portava a 93 (misurato 9,1-8,1u: dentro
il rumore). v2 da provare: col pallone in area bersaglio 99 e passo zero; metro «x dalla linea alla
riga ≤ 4u» sui gol del microsim (oggi 9-10,5u), tuffi dal tiro invariati (2).

## 7.853 v2/v3 — il portiere sta sulla linea quando il pallone avanza

v2: col pallone in area (x ≥ 84) il bersaglio del portiere è 99 e il passo d'uscita è zero. Coppia
(gol del microsim, x dalla linea alla riga): verde 9,3 · 2,4 · 3,7 · 8,4u, rosso 9,6 · 10,1 · 9,9u —
sulla linea in 2 gol su 4, negli altri due ci arriva 5 s dopo (il piano ci mette 1-2 s dall'area
alla rete, il portiere a 7-10 u/s no). **v3**: il rientro parte dalla trequarti (x ≥ 72).

| gol del microsim | rosso `NO853` | 7.853 v3 |
|---|---|---|
| portiere alla riga, x dalla linea | 9,0 · 10,1 · 9,2u | **2,2 · 3,0 · 2,0 · 3,5u** |
| tuffi dal tiro | 2 · 2 · 4 | 2 · 2 · 0 · 2 |

4/4 entro 4u contro 0/3; il tuffo resta quello del tiro (T8). Rosso `__CPM_NO853`. Telefono
(4 partite): padrone 32 / 29 / 11 / 20 % (Galli 11 % è fuori dalla banda delle passate, 19-34 %:
dichiarato come oscillazione da verificare, la 7.853 non tocca il pallone). Career PASS. CI: **rossa
una volta** sul guardiano `gol-del-simulatore` (7 nati, 6 accreditati, 1 mangiato prima del
tabellone), **verde alla ripetizione** del solo guardiano (7/7, manovra-viva 46): dichiarato, non
spiegato — il «mangiato» è una sostituzione di riga, non una parata, e la 7.853 non tocca le righe.
**Sul branch.** Ai fotogrammi (+1,2 s): il portiere è in quadro sulla linea in 3 gol su 4 (n° 2: 2 su
5) ma **in piedi** mentre il pallone gli passa accanto in 3 su 3: il tuffo T8 parte al tiro e finisce
prima che il pallone arrivi. Prossimo (7.854): il tuffo con tempo di reazione e arrivo sul pallone.

Sonda v4 (foto a +0,5 s), Conti fuori sulla 7.853 v3: al 55' (Lombardi) a +0,5 s il portiere è in
piedi sulla linea col pallone già dentro la porta ai suoi piedi, nessun tuffo (conti-f29-54-gol+0.5s);
al 23' e al 75' a +0,5 s il pallone è ancora fuori dall'area (incornate con l'attesa scaduta). Quindi
il «tuffo dal tiro 2» contato da `gol74` non è il tuffo su QUESTO tiro: il testimone conta tutti i
tag. 7.854, prima la misura: al lancio dell'arco della battuta `rete` registrare se il sito T8 arma il
tuffo e, se no, quale cancello lo ferma (`oppActType` occupato, `_t8At808`, tipo d'arco).

## 7.854 — il gol aspetta che il pallone sia in rete

Misura al lancio dell'arco della rete (testimone `__CPM_RETE854`, Conti fuori): il sito T8 arma il
tuffo **3/3** (`oppActType` libero, ultimo T8 14-21 s prima). Ma la traccia del tuffo (`__CPM_DIVE854`)
mostra il pallone reso che torna INDIETRO durante il tuffo: 90,7 → 85,4 e 85,3 → 78,8 in 1 s. Causa:
il piano si chiudeva appena emessa la battuta della rete — il pallone a 93 stava già entro gli 8u
dell'arrivo (7.693) — quindi gol, riga e ripresa partivano nello stesso tick e il pallone veniva
richiamato al centro mentre l'arco volava. Il portiere «fermo col pallone ai piedi» del n° 3 era
questo: il pallone tornava dal tuffo.

7.854: per la battuta della rete l'arrivo vale entro 2u (v1) e l'attesa d'arrivo riparte da zero
(v2: `att693` era del piano intero, e una battuta precedente già attesa chiudeva il gol al lancio —
traccia v1: ancora 90,6 → 85,1 in un caso su tre). Traccia v2 (Conti): pallone durante il tuffo
**90,4 → 97,5 e 90,6 → 97,7** (in avanti, 2/2; prima 2/3 all'indietro). Rosso `__CPM_NO854`.
Telefono n° 4 (4 partite, foto a +0,5 s): il pallone è sulla linea o sul palo in **5/5** gol del
piano (n° 3: 3/4 «già in rete ai piedi»), il portiere in quadro 5/5 ma in PIEDI 5/5 — la 7.854 ha
tolto il richiamo del pallone, non ha reso visibile il tuffo (rz 0,01: il corpo non si piega in GLB).
Padrone 16/28/34/33 %, finali 1-0, 3-0, 1-2, 5-2; scheda 5,3 (due aree rigiudicate dai fotogrammi:
il gol dell'eroe annunciato prima del pallone 3/5, il testo smentito 5/5). Career PASS; CI exit 0 (validate 0 failure, guardiano manovra-viva 63 su banda 10, gol del simulatore 7/7).
Verdetto: si tiene — batte la sua misura (traccia in avanti 2/2 contro 2/3 indietro) e non peggiora
il telefono. Prossimo: il tuffo che si vede.

## 7.855 — il tuffo si vede: il volo porta il portiere a terra, non già rialzato

Telefono n° 4: nei 5 gol del piano il pallone è sulla linea e il portiere è in quadro, ma IN PIEDI 5/5.
La traccia procedurale (rz 0,01) non diceva niente: in GLB il corpo lo muove la clip, e il testimone
giusto è `__CPM_GKTL` (nome della clip, peso, tempo). Letto sui tuffi delle reti (Conti fuori):
la clip `dive` è montata (peso 1) e il suo tempo all'ultimo fotogramma dell'arco è **3,31 s su 3,38**.
Poi la clip stessa, decodificata dal GLB (`anim-gk-dive.glb`, canale Hips, 82 chiavi): in piedi fino
a 0,8 s, in volo 0,8-1,25, A TERRA da 1,25 a 2,3 s (y 0,16, asse del busto rovesciato), si rialza
2,3-2,9, di nuovo in piedi da 2,9 s. Lo scrub 7.709 mappava il volo del pallone [0,1] sull'intera
clip: quando la palla è sulla linea il portiere si è già rialzato. La distesa passava a metà volo
(0,25 s) — invisibile a 15 fps, figurarsi a 2-8 con la sonda.

7.855: il volo scrubba [0 → 1,5 s] (disteso all'arrivo); all'arrivo la clip riparte in tempo reale
da 1,5 s e fa da sola la terra (fino a 2,3) e il rialzarsi (fino a 2,9); `_diveDur` si allunga di
conseguenza e la clip finita non si rimonta (`_fin855`). Rosso `__CPM_NO855`. Testimone `__CPM_HOLD855`.
Prima misura con dt reale e due sonde in parallelo (2-3 fps, 1-2 fotogrammi per arco): tempo della
clip all'ultimo fotogramma d'arco 0,92 (verde) contro 2,07 (rosso) — coerente, ma troppo pochi
fotogrammi per contare la tenuta. Misura a dt fisso (v1, Conti fuori, tre tenute registrate): la prima tenuta arriva con la clip a
1,5 s e resta a terra (1,5 → 2,15 in 0,65 s), ma nella seconda la clip TORNA INDIETRO (2,2 → 0,87):
al gol cambia la chiave della scena, il latch dell'estensione riparte da 0 e lo scrub riportava il
portiere in piedi a metà tenuta. v2: i marcatori dell'arrivo si azzerano solo al tuffo nuovo e, una
volta arrivato, lo scrub non si riprende più il corpo. Misura v2 (dt fisso, Conti): 4 tenute, 4 con la clip a terra, ma 2 con la clip che TORNA INDIETRO
(3,3 → 0,2): la clip finita veniva rilasciata (r.8252) e rimontata da zero il fotogramma dopo. v3: il
marcatore di fine (`_fin855`) scatta a 0,35 s dalla fine, prima del rilascio naturale.
Misura v3 (dt fisso, Conti fuori + Vairo casa): **10 tenute, 9 con la clip a terra (1,5-2,3 s), 0
fotogrammi con la clip che torna indietro**; la clip corre da 1,5 a 3,05 s in ~1,55 s di tenuta, e il
portiere si rialza da solo. Rosso (GKTL prima della 7.855): clip a 3,31 s all'ultimo fotogramma
dell'arco in 4 tuffi su 4, tenuta 0. v4: sulla battuta della RETE l'arco muore alla chiusura del gol (7.854: pallone entro 2u) PRIMA
dell'arrivo, e il tuffo a metà distesa si spegneva lì (u≥1 con `_diveDur` corto): il portiere tornava
in piedi in 0,2 s — telefono n° 5 (v3): Galli 69' e Moretti 55' ancora in piedi a +0,5 s. Ora il tuffo
GLB resta vivo finché il blocco GLB non registra l'arrivo (arco morto con estensione ≥0,5 = arrivato)
e allunga `_diveDur`. Misura v4 (dt fisso, Conti): 5 tenute, 5 a terra, 0 rewind — ma senza archi
della rete in quel mondo: la verifica sul gol è affidata alle foto del telefono n° 5 bis.

## 7.856 — le parole del tiro le decide il campo all'emissione, non il piano alla nascita

Telefono n° 4: «da due passi, tutto solo davanti alla porta!» smentito 4/4 (pallone al limite o
fuori area, quattro-cinque maglie intorno; in `conti-f02` l'HUD stesso dice «Trequarti»), «a tu per
tu col portiere» 1/1. Causa (src/14 r.~3545): la frase nasceva col piano dal punto d'arrivo
PROGETTATO (`_pxB` 84-88 → zona «area»), mentre la battuta esce quando l'attesa 847 è soddisfatta o
SCADUTA — anche col tiratore a 60-70 e la difesa addosso. E «tutto solo» non era mai verificato.

7.856: all'emissione della battuta del tiro (r.~4537) si rilegge la geometria vera: avanzamento del
tiratore (≥84 area, ≥70 limite, altrimenti lontano), avversario di movimento più vicino (≥4u = «tutto
solo», altrimenti «si avventa sul pallone in area» / «fra le maglie della difesa»), portiere entro 12u
(«a tu per tu»). Rosso `__CPM_NO856`. Testimone `__CPM_GEO856` in entrambi i bracci (la frase del
piano e quella emessa, con la geometria): Vairo casa frasi smentite **2/5 (piano) → 0/5 (campo)**,
Conti fuori 0/1 → 0/1. **Telefono n° 5 (4 partite, sonda v6):** frasi del tiro di piano smentite
dal campo — come le voleva il piano **5/13**, emesse **0/13** (Vairo 2/5 → 0/5, Moretti 1/4 → 0/4,
Galli 1/3 → 0/3, Conti 1/1 → 0/1). Tutte e cinque erano «da due passi, tutto solo» con avanzamento
80,7-83,1 e un avversario a 3,3-5,1u: ora «si gira sul limite» / «dal vertice dell'area».
Nota: le occasioni non sono riproducibili fra due corse (stesso seme, mondi diversi per i tempi reali),
per questo il testimone registra entrambe le frasi nella stessa corsa.

## 7.857 — **REVOCATA**: l'auto-avanzamento aspetta il pallone in rete (il gol dell'eroe annunciato prima del pallone)

Telefono n° 4: la riga «segna … 5-2» con la scena ancora aperta e il pallone ai piedi di un
difensore (`conti-f51`), «1-0» col pallone sulla linea ai piedi del portiere (`vairo-f18`): 3/5 gol
dell'eroe. Sonda `rigagol` (righe di gol contro punteggio logico, HUD e pallone reso, 50 ms) su Conti
fuori: i gol del PIANO entrano col pallone a 98-100 alla riga (3/3, rete a −0,2…+0,6 s); i gol di
SCENA hanno il pallone a 92-96 alla riga e la rete arriva **+1,4 / +1,8 s** dopo (2/2 in due corse).
Testimone `__CPM_INNET857` (chi chiama `fireGoalCeleb`, e dov'è il pallone reso): non il renderer
(`net`), non il tetto (`timer`), ma `handleContinue` — l'auto-avanzamento 7.461, che aspetta il
renderer «occupato» (linea, arco, parata) ma non il gol pendente: con l'arco finito e il pallone in
inseguimento dell'affermazione 7.811 (che lo porta a 100,6 in ~1,4 s) il renderer si dichiara libero
e la scena avanza: riga, tabellone e HUD escono col pallone a 92-96.
7.857: l'auto-avanzamento aspetta anche il gol pendente (`goalCelebRef` non ancora sparato), con lo
stesso tetto di 6 s; il tocco manuale resta libero. Rosso `__CPM_NO857`.
**Misura con `__CPM_REALWAIT` (lezione 17ª), Conti fuori, coppia:** verde — gol di scena 2/2 dichiarati
dal renderer (`net`) col pallone a 99,15, riga col pallone a 99,2, HUD −0,17 s; rosso NO857 — gol di
scena 1/1 dichiarato dal renderer col pallone a 99,15, riga a 99,2, HUD −0,11 s. Identici: la 7.857
non batte la misura. **Revocata**, sorgente riportato al 7.856.0 (resta il testimone `__CPM_INNET857`).
Il difetto vero era il banco: senza REALWAIT l'auto-avanzamento non aspetta e il gol viene dichiarato
col pallone a 80-96. La scheda n° 4 va letta con questa riserva sull'area 7 e sull'area 10.

**Lezione 17ª (strumenti), 10/09 01:25.** Il banco apre il gioco con `?cpmtest=1`, e sotto quel
cancello l'auto-avanzamento delle scene (7.461) NON aspetta il renderer (`_on` falso): la scena avanza
appena scaduto il respiro, e `handleContinue` dichiara il gol col pallone dov'è (misurato: 79,9 / 92,5
/ 96,3). Sul telefono vero `_on` è vero. Il flag `__CPM_REALWAIT` (7.460) esiste apposta e la sonda
telefono non lo accendeva: la «riga prima del pallone» del n° 4 è in parte un artefatto del banco.
Sonda v6: `__CPM_REALWAIT` acceso; la 7.857 (l'attesa del gol pendente nell'auto-avanzamento) si
misura con REALWAIT in entrambi i bracci (`__CPM_NO857` rosso) — se il rosso non mostra la riga prima
del pallone, la 7.857 si revoca.

## 7.858 — il tetto del gol di scena aspetta che il renderer abbia finito

Telefono n° 5: «Galli segna 1-0» con HUD 0-0, portiere già a terra e pallone a metà area
(`galli-f09`); «3-2» con HUD 2-2 (`conti-f36`); «5-2» col pallone a centrocampo (`conti-f51`). La
7.857 era stata revocata perché non era l'auto-avanzamento. Testimone `__CPM_INNET857` con scena e
scelta, quattro eroi (sonda v6, REALWAIT): **4 gol di scena su 5 li dichiara il TETTO dei 5,2 s**
(`fxTimeout(fireGoalCeleb, 5200)`, 6.5.1) col pallone reso a **59 / 68 / 87 / 96** — «Tiro interno
piede classico», «Spingila dentro!», «Tiro al volo», «Testa preciso al centro» — e la rete vera arriva
0,5 / 2,7 / 0,5 / 1,1 s DOPO, o mai (Conti 27': pallone a 79 a +1 s, scena tagliata dalla ripresa).
Un solo gol (Conti 82', «Tiro di prima sul rimbalzo») lo dichiara il renderer col pallone a 99,15.
Il tetto era stato alzato da 3,2 a 5,2 s per la costruzione R5; oggi costruzione più arco durano di più.
7.858: il tetto aspetta finché il renderer si dichiara occupato (timeline, arco, parata — lo stesso
segnale dell'auto-avanzamento 7.461), con un tetto duro a 9 s. Rosso `__CPM_NO858`. Misura: gol di
scena dichiarati col pallone alla linea (reso ≥98,5) — **verde 7/8** su 8 partite (Vairo, Galli ×3,
Conti, Moretti: `net` a 99,15 in 6, tetto a 103 in 1; l'unico fuori è un ASSIST «Avanza in profondità
e servi», tetto a 87) contro **rosso 2/6** (7.856 e NO858: tetto a 59 / 68 / 87 / 96 in 4). Si tiene.
Residuo dichiarato: sulle scene di assist il tiro del compagno non tiene occupato il renderer (1/2).
Nota di strumento: la sonda a scene forzate (`__CPM_FORCE_SIT`) non misura questa cosa — in forced
mode la fase non è `hl_result` e il flag «occupato» è spento: verde = rosso per costruzione.

**Lezione 18ª (strumenti), 10/09 04:20.** Le foto del telefono a +0,5/+1 s dal gol dell'eroe mostravano
«il pallone a metà area» e «l'HUD non aggiornato»; la sonda della riga del gol diceva il contrario.
Misurato nello stesso istante della foto (sonda v7: pallone reso, fase, punteggio, cifre dell'HUD nel
DOM): pallone a 99,15 → 100,6, HUD nel DOM già 3-2 / 5-2. Il «pallone a metà area» era il marcatore
d'anteprima della scena successiva (pallina con linea di traiettoria, il pallone vero è nascosto in
cronaca testuale, 7.805); l'HUD «vecchio» era il compositor del banco a 2-8 fps che dipinge il DOM con
0,3-0,5 s di ritardo. Regola: una foto del banco vale solo con il numero letto nello stesso istante.

## 7.859 — **REVOCATA**: il pallone atterrato lo raccoglie chi gli sta vicino (S1, l'elezione d'arrivo)

Censimento padroni (sonda `padroni`, Vairo casa e Galli fuori, 150 s ciascuna): il pallone LOGICO sta
a più di 3u dal suo padrone dichiarato nel **74-76 %** dei campioni (mediana 5,2-6,8u); quando il reso
è lontano dal padrone, il corpo più vicino sta a **mediana 2,9u**, cioè appena fuori dal raggio
d'elezione di 2,5u; scrittore del pallone in quei campioni: «nessuno» 189/215 e 125/139. Per progetto
il passaggio atterra «davanti al ricevente, nello spazio, mai più di sei passi»: il ricevente c'è, ma
finché non entra nei 2,5u l'etichetta resta al vecchio portatore (fino a 12u, 7.642) o a nessuno. La
7.851 (caduta dell'etichetta) era già stata revocata e il suo verbale indicava la strada: l'ELEZIONE.
7.859: quando il pallone è arrivato al bersaglio (entro 2u), l'elezione allarga il raggio a 5u e la
sosta d'arrivo (7.642 v4) porta il pallone sui piedi dell'eletto; in volo il raggio resta 2,5u.
Rosso `__CPM_NO859`. Misura (telefono, padrone ≤3u e campioni con padrone, Vairo casa e Galli fuori
in coppia; baseline n° 6: 33 / 35 / 11 / 27 %): **verde Vairo 7 % (rosso 17), Galli 20 % (rosso 12)** —
direzioni opposte, dentro il rumore fra passate (lezione 16ª), e un segnale in più contro: in volo
50-51 % del tempo contro 42-48 (rosso, stesse condizioni di carico) e 36 (n° 6): con l'eletto a 5u la
sosta d'arrivo manda il pallone sui suoi piedi e il pallone viaggia di più, non di meno. Mediana
reso↔padrone 15,8u a Vairo contro 9,2. **Revocata**, sorgente riportato al 7.858.0. La diagnosi resta
(corpo più vicino a mediana 2,9u dal pallone atterrato, scrittore «nessuno»); il rimedio non è
l'elezione né la caduta dell'etichetta: è il punto d'arrivo del passaggio, che per progetto sta
«davanti al ricevente fino a sei passi» — va misurato quanto davanti, e portato ai piedi.

## 7.860 — **REVOCATA**: il passaggio ambientale segue il ricevente

Idea: il waypoint della trama si aggancia al compagno più vicino (8u) ma scrive la sua posizione di
quel tick; il pallone arriva dove lui STAVA. Qui il bersaglio si aggiornava a ogni tick sulla posizione
attuale del ricevente (entro 12u). Coppia sul telefono, stesso carico (due partite in parallelo):
**verde Vairo 5 % (rosso 26), Galli 11 % (rosso 5)**. Direzioni opposte. Revocata, sorgente al 7.858.0.

**Lezione 19ª (strumenti), 10/09 05:20.** La metrica «pallone reso ai piedi del padrone ≤3u» NON è
riproducibile fra corse identiche: stesso build, stesso seme, stesso carico → 5 / 17 / 26 % a Vairo,
5 / 11 / 12 / 20 % a Galli; e con due partite in parallelo il tempo «in volo» sale dal 36 % al 43-54 %,
abbassando tutto. Con questo rumore nessun rimedio S1 (7.851, 7.859, 7.860) può essere giudicato, in
nessuna direzione. Prima di un altro rimedio S1 serve un banco RIPRODUCIBILE per il possesso: dt
fisso, una partita per volta, e la metrica calcolata sulla SIMULAZIONE (pallone logico ↔ padrone
logico) e non sul reso, che dipende dai fotogrammi. La diagnosi (corpo più vicino a 2,9u dal pallone
atterrato, scrittore «nessuno») resta l'unica cosa misurata con margine.

**Banco S1 riproducibile (05:45).** Sonda `padroni` (simulazione: pallone LOGICO ↔ portatore LOGICO),
una partita per volta, 400 s, Vairo casa, tre ripetizioni identiche: ≤3u **19 / 24 / 19 %**, mediana
6,3 / 5,3 / 6,5u, reso↔corpo del portatore ≤3u 24 / 24 / 27 %. Rumore ±3 punti, contro i ±10-20 del
telefono. È il metro per S1: un rimedio deve portare la banda sopra il rumore in tre ripetizioni. La
7.860 resta a richiesta (`__CPM_SI860`) e viene rimisurata qui.
**7.860 sul banco S1 (06:05), tre ripetizioni con `__CPM_SI860`:** pallone logico ↔ portatore logico
≤3u **21 / 25 / 22 %** contro **19 / 24 / 19** di base (+2, dentro il rumore); reso ↔ corpo del portatore
≤3u **32 / 30 / 32 %** contro **24 / 24 / 27** (+6 in 3/3, sopra il rumore). Il passaggio sull'uomo
avvicina il pallone RESO al corpo, non il pallone LOGICO al padrone: il metro dichiarato non lo batte.
Resta a richiesta (`__CPM_SI860`, non spedito). Il fatto nuovo è il banco: tre ripetizioni a ±3.

## 7.861 — la giocata è un uomo, non un punto (S1, la trama)

Misurato con `giri861` (Vairo, 120 s reali = 61 minuti di gioco): il mover del pallone logico gira
UNA volta per minuto (61 giri); la trama ha prodotto 4 waypoint, **0 agganci** a un compagno entro
8u e **0 passaggi**; le righe di cronaca hanno consegnato il pallone 6 volte (11 senza uomo). Il
pallone ambientale va su erba vuota per costruzione e i corpi lo inseguono: è la radice del «pallone
logico a più di 3u dal padrone nel 74-76 %». Con `arrivo861` (400 s): 88 tick registrati, ricevente
della trama dichiarato in 0.
7.861: se il waypoint geometrico non ha nessun compagno entro 8u, la giocata sceglie l'uomo (il
compagno di movimento più vicino al waypoint fra quelli davanti al pallone, o il più vicino entro
25u) e il waypoint diventa la sua posizione; l'aggancio (8u) e la sosta di ricezione (7.639) fanno il
resto. Rosso `__CPM_NO861`. Misura sul banco S1 (padroni, Vairo, 400 s, tre ripetizioni; base
19 / 24 / 19 % logico, 24 / 24 / 27 reso):
- trama: waypoint **12 / 10 / 11**, agganci a un uomo **12 / 10 / 11** (100 %, contro 0/4), passaggi
  **7 / 8 / 8** (contro 0), di cui «sull'uomo» 7 / 8 / 10;
- pallone logico ↔ padrone logico ≤3u **18 / 38 / 28 %** (media 28 contro 20,7: +7, ma la prima
  ripetizione sta dentro la banda di base — non è 3/3);
- pallone reso ↔ corpo del padrone ≤3u **32 / 40 / 48 %** (contro 24 / 24 / 27: 3/3 sopra il massimo
  di base, +15 in media); mediana 6,5 / 4,9 / 3,4u contro 7,1 / 7,2 / 7,7.
Si tiene: il meccanismo è misurato senza ambiguità (0 → 100 % di giocate su un uomo) e il reso batte
la base in tutte e tre le ripetizioni; il logico migliora in media ma non in 3/3, dichiarato.
CI exit 0 (validate 0 failure; guardiano manovra-viva 64 su banda 10, con la libreria tornata a 8;
gol del simulatore 7/7). Career: la prima corsa è caduta per timeout di navigazione (6 guardiani
verdi, il settimo non ha caricato la pagina), ripetuta da sola: **PASS** (exit 0). Telefono n° 7
(4 partite, sonda v7): padrone ≤3u 25 / 22 / 44 / 30 % (n° 6: 33 / 35 / 11 / 27; metrica rumorosa,
lezione 19ª — il numero che regge è il banco S1), frasi del tiro smentite 5/9 → 0/9, finali 2-0, 3-0,
1-1, 4-0. Gol di scena: pallone alla riga 99,15 / 99,02 / 99,15 (3), ma sugli ASSIST 88,1 e 93,5 (2):
il residuo dichiarato in 7.858 resta.

**7.860 sopra la 7.861, banco S1 (07:55), tre ripetizioni con `__CPM_SI860`:** pallone logico ↔ padrone
logico ≤3u **36 / 40 / 49 %** contro **18 / 38 / 28** della 7.861 sola (media 42 contro 28: +14; il minimo
36 sta sotto il massimo di base 38, quindi non è 3/3 sopra la banda); reso ≤3u 43 / 47 / 40 contro
32 / 40 / 48 (+3, rumore); mediana logica 4,3 / 4,0 / 3,1u contro 6,1 / 4,0 / 5,9. Con i passaggi
sull'uomo, seguire il ricevente mentre il pallone viaggia sposta finalmente il LOGICO. Prima di
promuoverla: due ripetizioni in più della base (in corsa).

## 7.862 — il pallone ha una taglia minima sullo schermo

Nota PO 10/09 07:45: «il pallone secondo me è troppo piccolo, sproporzionato». Terza volta (7.794
lo aveva portato da 0,32 a 0,20 di raggio; la nota sulla 7.807 aveva riacceso l'alone, 7.808).
Misurato con la sonda `taglia862` (Vairo casa, 100 s di gioco, 257 fotogrammi, testimone che proietta
il raggio a schermo): diametro del pallone **mediana 5,9 px, p10 4, p90 6,8; sotto i 7 px nel 91 %**
dei fotogrammi; l'eroe è alto 26 px alla mediana (rapporto 4,4: in proporzione il pallone è già
grande, in assoluto è un puntino a 412×915). La scala 7.534 dipende solo dalla camera (1,10 in campo
largo, 0,53 in scena), non dalla distanza. 7.862: dopo la scala della scena il raggio si proietta a
schermo e, se il diametro sta sotto 11 px (1,2 % del quadro), il pallone si ingrandisce quanto basta;
in scena stretta non scatta. Rosso `__CPM_NO862`. Verde: ingrandito in 256/257 fotogrammi di campo
largo. Foto dal telefono (Vairo casa, sonda v7, 7.862 in pagina): f32-min74 pallone **12 × 12 px** in campo largo, f25-min63 nucleo chiaro 9 × 8 px accanto a un giocatore di 50 px in camera vicina (l'orlo in ombra non passa la soglia del bianco: il diametro proiettato è 11); prima della 7.862 (Moretti casa, f13-min24) 8 px accanto a giocatori di 90 px. Nel f36-min86 il pallone non è nel quadro (campo vuoto, un solo pixel chiaro): non è un caso di floor mancato. È Chromium a 412×915, non l'Android del PO: la taglia in millimetri sul suo schermo resta da confermare da lui.

## 7.863 — il passaggio segue il ricevente (era la 7.860, promossa sul banco S1)

Le due ripetizioni in più della base 7.861 (padroni, Vairo, 400 s): logico ≤3u **33 / 24 %** (base a cinque ripetizioni 18 / 38 / 28 / 33 / 24, media 28,2, max 38) contro **36 / 40 / 49 %** con la 7.860 accesa (media 41,7, min 36). Il minimo del rimedio sta sotto il massimo di base in 1 ripetizione su 5 (38): non è «3/3 sopra la banda» in senso stretto, ma la media sale di +13,5 (quattro volte e mezzo il rumore ±3) e il reso non peggiora (43 / 47 / 40 contro 32-48). Promossa come 7.863: il bersaglio del pallone logico in volo è la posizione ATTUALE del ricevente eletto dalla trama (stessa condizione della 7.860: playing, nessun gol pendente, 0,8 < distanza < 12u). Rosso `__CPM_NO863`; `__CPM_SI860` rimosso. Rituali sulla 7.863.0: career **PASS** (exit 0), CI **exit 0** (validate 0 failure; manovra-viva 61 su banda 10; gol del simulatore 7/7).

## 7.864 — il tetto del gol di scena corre sull'orologio di scena (lezione 20ª)

Residuo dichiarato nella 7.858: i gol di scena con ASSIST annunciati col pallone a 88-93. Testimone
nuovo `__CPM_TICK858` (ogni 180 ms del tetto: flag occupato tl/arc/pa, fase post-arco, `hlPostArcT`,
pallone reso) su tre corse × 4 eroi, 12 gol di scena: **3 dichiarati dal tetto** con il pallone a
94-95 (Moretti 16', Conti 11' e 61', tutti `assist_recv`), 9 dalla rete a 99,15. Nei tre casi il tetto
dei 9 s è scattato con la scena ANCORA occupata: `hlPostArcT` avanzava di 0,30 s ogni ~0,75 s di parete,
cioè il renderer girava a ~1,3 fps e il dt (cap 0,3 s sotto `__CPM_DTREAL`) faceva correre la scena a
0,4× del reale. Nove secondi di parete erano quattro di scena: meno di arco (1,2 s) + controllo (0,55)
+ tiro (0,8) + rete (0,5) sommati al rallentatore d'apertura.
**Lezione 20ª — il banco dichiara i suoi fps, e non sono quelli del PO.** Sonda `fps` (Vairo, 90 s
reali per configurazione): con i GLB 11,8 fps al 7' che scendono a 2,0 al 40' (con o senza testimoni,
con o senza screencast: 11→2 in tutte e tre); senza GLB 10-13 stabili. Le schede del telefono n° 6-7
dichiaravano 11-18 fps «senza sonda» e 2-9 «con la sonda». Il PO gioca con i GLB a ~30 fps: sul suo
telefono parete e scena coincidono, sul banco no. Ogni tetto di parete dentro una scena va letto come
un tetto di SCENA: il metro sbagliato fa vedere «palla congelata» dove c'è un banco lento.
7.864: il tetto conta i secondi di scena (`ck` nel flag occupato = somma dei dt del renderer) dalla
programmazione, con una guardia dura di parete a 30 s. A 30 fps identico a oggi. Rosso `__CPM_NO864`.
Misura appaiata (tetto858b, 4 eroi verde + 4 rosso `__CPM_NO864`, stesso banco): gol di scena dichiarati
dal tetto col pallone sotto 99 — rosso **2/5** (Galli 30' a 90, 44' a 88,8: 3/12 nelle tre corse di prima,
5/17 in tutto), verde **0/4** (4/4 dalla rete a 99,15); altre 4 partite verdi: **0/6** (6/6 dalla rete). In tutto: rosso 5/17
dichiarati dal tetto col pallone a 88-95, verde 0/10. Rituali sulla 7.864.0: career **PASS**, CI **exit 0**.
**Aperto (censimento fps):** il calo 11 → 2 fps in 40' con i GLB è una crescita nel tempo, non un
costo fisso: da misurare cosa cresce (mixer, clip, testimoni non c'entrano: senza REC scende uguale).
Se succede anche sull'Android del PO, il secondo tempo diventa una sequenza di diapositive. Non
verificato sul suo telefono.

## 7.865 — il pallone torna in campo fuori dalle azioni salienti (direttiva PO 10/09)

PO: «solo il pallone, ma la posizione deve essere realmente credibile in base alla telecronaca».
Metro nuovo, sonda `geo865`: per ogni riga di cronaca con un LUOGO dichiarato (area / limite, fuori
area, trequarti, centrocampo, fondo, portiere, corner; il lato si legge dalla sigla «(GRA)/(POL)» e dal
lato dell'eroe nel Match State) il pallone RESO deve stare nella banda di campo promessa. Base (4
partite, 7.864, pallone ancora nascosto ma posizionato):

| partita | righe con luogo | nella banda alla riga | a +1 s | a +2,5 s |
|---|---|---|---|---|
| Vairo casa | 23 | 13 | 21 | 16 |
| Moretti casa | 23 | 15 | 17 | 16 |
| Conti fuori | 7 | 2 | 2 | 4 |
| Galli fuori | 16 | 10 | 9 | 12 |
| **totale** | **69** | **40 (58 %)** | **49 (71 %)** | **48 (70 %)** |

Due classi di «no»: (a) il RESO arriva un secondo dopo la riga (8', 33', 51', 62': 52-61 → 69-75 → 81-90
mentre la riga dice «in area / al limite»); (b) il LOGICO non sta dove la frase dice («Scotti riceve a
centrocampo» con la palla a 84,7; «Bianchi muove verso la nostra trequarti» a 93,6; «Toti ci arriva in
tuffo» a 83,6; «arriva sul pallone in area» a 63,6). La (b) è la stessa radice della 7.792 (coordinate
del piano in scatola). 7.865 riaccende il pallone (rosso `__CPM_NO865`) e dichiara questi numeri; la
credibilità si alza con la misura successiva sulla classe (b).

**Censimento fps chiuso (11:20).** Sonda `fpsdecay` (Vairo, GLB, partita intera, ogni 15 s: fps, chiamate,
triangoli, texture, geometrie, programmi, heap): non è una deriva. I fps stanno a 2-6 quando i triangoli
sono **1,09 milioni** (i ventidue GLB in quadro: scene e occasioni) e a 10-13 quando sono 5-13 mila (campo
senza corpi, telecronaca testuale). Heap stabile 155-180 MB, programmi 23 fissi; le geometrie salgono
404 → 598 in una partita (qualcosa alloca ~200 geometrie, non pesa sui fps: aperto minore). Il «calo nel
tempo» della sonda `fps` era la frazione di tempo con i corpi in quadro. Costo vero da dichiarare al PO:
i ventidue GLB pesano 1,09 M triangoli, ~50 mila a testa; sul suo Android è il carico delle scene.

**7.865 dal telefono (11:55, sonda v7, Vairo casa + Galli fuori).** Fotogrammi «gioco» in fase playing: 14,
con il pallone in quadro **14/14** e campo vuoto **0/16** (n° 7: 6/24). Nei fotogrammi di telecronaca
testuale (47' cambio campo, 58' e 50' consegna del mister, 61' ripresa) si vede solo il pallone sul prato,
come chiesto. Padrone ≤3u 23 / 24 % (n° 7: 25-44, metrica rumorosa), salti 45 / 55, fps 12 / 11 senza
sonda. Career **PASS**, CI **exit 0** (manovra-viva 68, gol del simulatore 7/7).

## 7.866 — la frase che nomina un luogo si sceglie dal pallone (classe b della geografia)

Le 7 righe su 69 mai nella banda in 2,5 s (base 7.865) hanno due sorgenti scritte: l'apertura del piano
avversario «riceve / imposta dal centrocampo» porta la coordinata dell'UOMO (avanzamento +3, misurato
84,7), e la frase di ponte «muove il pallone verso la nostra trequarti» esce anche con la palla a 93,6.
7.866: le due battute di centrocampo restano ammesse solo se la coordinata sta a 32-68 (altrimenti
frasi senza luogo), la frase del ponte solo con la palla non oltre x 58. Rosso `__CPM_NO866`. Metro:
righe con luogo mai nella banda (base 7/69), pallone nella banda a +1 s (49/69) — appaiato 4 verde + 4
rosso (stesso banco, mondi diversi):

| | righe con luogo | mai nella banda | alla riga | a +1 s |
|---|---|---|---|---|
| base 7.865 | 69 | 7 (10 %) | 40 (58 %) | 49 (71 %) |
| rosso `__CPM_NO866` | 56 | 5 (9 %) | 31 (55 %) | 41 (73 %) |
| **verde 7.866** | 70 | **2 (3 %)** | 42 (60 %) | **56 (80 %)** |

Delle 2 «mai» del verde una è un errore della sonda (corner avversario letto col lato del nostro
difensore nominato) e una è al bordo della banda (44,9 contro 42). Nel rosso ricompare «verso la nostra
trequarti» con la palla a 62. Campioni piccoli e mondi diversi: lo dichiaro; il meccanismo è diretto
(le due frasi non possono più uscire nel posto sbagliato). Fatto nuovo dal rosso: al 48' «palla sul
cerchio, si ricomincia» col pallone RESO a 92-98 e il logico a 50 — dopo il gol il pallone reso resta
in rete mentre la cronaca riparte dal centro. Con la 7.865 questo ora si vede: prossima misura.
Rituali sulla 7.866.0: career **PASS**, CI **exit 0** (manovra-viva 67, gol del simulatore 6/6). Le altre «no» della base (parata a 83,6, «arriva sul pallone in area» a 63 → 81, corner
in rimbalzo) sono il ritardo di arrivo (classe a), dichiarato e non toccato.

## 7.867 — quando nessuno scrive il pallone reso, insegue il logico (S1, il reso)

Misura delle riprese dal centro sulla 7.866 (geo865 v2, 4 partite): 4/4 in banda alla riga; sommando la
corsa rossa di prima, 8/9 (il caso fuori: pallone reso in rete a 92-98 per 2,5 s dopo un gol, logico a 50).
La stessa corsa mostra la famiglia intera: «rinvio dal fondo per Toti» reso 84 e logico 92, corner reso
80 e logico 95, «rinvio per Fontana» reso 20,7 e logico 7 — fuori da un piano il pallone reso resta dove
l'ultimo scrittore l'ha lasciato (censimento del telefono: scrittore «nessuno» in 294 campioni). 7.867
v2: fuori dalle scene, senza arco in volo e senza azione saliente, se il reso dista più di 12u dal logico
lo insegue (95 % in 0,37 s, isteresi a 3u), e sempre durante la ripartenza recitata del calcio d'inizio
(`kickoff` passato al renderer). Rosso `__CPM_NO867`. Metro: banco S1 `padroni` (Vairo, 400 s, ×3 verde
e ×3 rosso): pallone reso ai piedi del padrone logico ≤3u e reso↔logico; poi geografia su 4 partite e
telefono n° 8. In corsa.

**7.867 REVOCATA (14:05).** Banco S1 (padroni, Vairo, 400 s, tre coppie verde/rosso `__CPM_NO867`):

| | reso ai piedi del padrone logico ≤3u | reso vicino a chiunque ≤3u | logico ↔ padrone logico ≤3u |
|---|---|---|---|
| verde 7.867 | 29 / 35 / 34 % | 49 / 60 / 57 % | 27 / 29 / 25 % |
| rosso | 45 / 48 / 41 % | 52 / 61 / 53 % | 24 / 25 / 27 % |

Peggio in 3/3 sul metro dichiarato. Geografia su 4 partite invariata (mai nella banda 3/62, +1 s 79 %).
Lettura: il pallone logico sta a più di 3u dal suo padrone nel 71-75 % dei campioni; inseguirlo toglie il
reso dai piedi dell'uomo a cui il renderer l'aveva incollato e lo porta sull'erba vuota dove sta il
logico. Il rimedio va sul logico (S1), non sul reso. Sorgente riportato alla 7.866 (blocco 7.807 intatto,
`kickoff` non passato al renderer), commento di revoca nel codice.
**Fatto da verificare subito:** il logico ≤3u dal padrone qui è 24-29 % in sei corse, contro 36 / 40 / 49
misurati per la 7.863 (allora a richiesta `__CPM_SI860` sulla 7.861). Se la promozione della 7.863 non
fosse attiva nel build, sarebbe una regressione silenziosa: controllo del codice e rimisura sul banco.

## 7.868 — un pallone, un padrone: il possesso ambientale come sequenza di passaggi (S1, la struttura)

Direttiva PO 10/09 14:20: «rivedi la struttura se lo ritieni opportuno», dopo la mia lettura («netto
miglioramento no: 5,3 → 5,8 in un giorno e mezzo; S1 non si sposta con le pezze»). La diagnosi era già
a verbale nella 7.850 v2: «il possesso deve diventare una sequenza di passaggi discreti fra uomini
nominati, invece di un bersaglio che scivola». Punto di partenza misurato sulla 7.866 (banco S1, sei
corse): pallone logico ai piedi del padrone ≤3u 18-29 %, campioni a terra senza padrone 43 %.
Tre stati nel mover del pallone logico, fuori da scene e macchine (piano, contropiede, palla morta,
calcio d'inizio): **tenuta** (padrone del lato entro 3,5u: il pallone sta sui suoi piedi e cammina con
lui), **volo** (padrone lontano = ricevente eletto: il pallone gli va incontro a 7u per tick, ~17 u/s,
sulla posizione attuale), **libero** (nessun padrone del lato: un uomo entro 3,5u lo prende, altrimenti
vola all'uomo del lato più vicino al bersaglio — la proposta di una riga diventa un passaggio a un uomo).
Rosso `__CPM_NO868`. Testimone `__CPM_POSS868` (tenuta/volo/libero/elezioni/voli-a-uomo).
Metro: banco S1 ×3 verde/rosso (≤3u ≥ 60 %, senza padrone ≤ 15 %), poi geografia, guardiani CI
(manovra-viva, ball-motion), telefono n° 9. Rischi dichiarati: ritmo delle righe di manovra, arrivi
del piano (7.847 attende l'uomo e il pallone), salti del reso sul telefono.

**Dubbio 7.863 chiuso (14:45).** Coppia sul banco S1 (padroni, Vairo, 400 s): verde 25 / 20 % contro rosso
`__CPM_NO863` 18 / 37 %; il contatore dice che la 7.863 scatta **4 volte in 400 s** (la condizione «portatore =
ricevente» vale solo nel volo di un passaggio agganciato, e i passaggi sono 3-6 per corsa). Le 36 / 40 / 49
di ieri erano tre mondi fortunati: il rumore del banco è ±8, non ±3 come avevo scritto (lezione 21ª: la
banda di rumore si stima su sei corse, non su tre). La 7.863 resta (non nuoce), ma è superata dalla 7.868.

**7.868 v1 sul banco (15:40), tre coppie verde/rosso `__CPM_NO868`:** logico ≤3u verde 32 / 18 / 29 % contro
rosso 32 / 23 / 17; campioni a terra senza padrone verde 32 / 31 / 25 % contro rosso 48 / 40 / 52. Il
testimone dice perché la tenuta non domina: sui ~50 tick ambientali di una corsa, tenuta 11-16, volo
20-27, libero 12-20. Il tick di palla è 1,7 s (MATCH_TICK_MS, non i 420 ms di un commento vecchio): a 7u
per tick un passaggio da 20u vola tre tick, e la tenuta resta un quarto del tempo. v2: 24u per tick
(14 u/s, un passaggio vero) — il volo dura un tick, la tenuta dovrebbe salire a due terzi. Tre corse verdi
in corsa.

**7.868 v2 sul banco (16:05), tre corse verdi:** logico ≤3u 25 / 32 / 33 %, senza padrone 39 / 35 / 21 %,
stati tenuta 7 / 12 / 11, volo 26 / 19 / 22, libero 17 / 13 / 15. La velocità del volo non era la causa.
La traccia tick per tick (testimone `trace`) mostra due cose strutturali: (1) i tick ambientali sono
~26 su 130 in 220 s — il resto è piano, scene, palla morta: il metro campiona soprattutto il PIANO, che
la v1/v2 escludevano; (2) in tenuta il pallone sta sui piedi del padrone del render PRECEDENTE: gli
updater di React girano al render in ordine di coda e il pallone leggeva lo specchio vecchio dei
ventidue — un tick di ritardo per costruzione, 2-5u dietro l'uomo che cammina (m 50-53 della traccia:
pallone 36 → 33,4 → 30,1 con l'uomo a 33 → 30,1 → 29,2). v3: lo specchio dei ventidue si scrive nel loro
updater (fresco per il pallone nello stesso render) e la 7.868 vale anche nel piano quando il passo
nomina un uomo (portatore = chi, non la battuta della rete). Tre corse verdi in corsa.

**7.868 v3 sul banco (16:35), tre corse verdi:** logico ≤3u 39 / 38 / 22 %, senza padrone 38 / 50 / 38 %,
tenuta 12 / 8 / 16, volo 31 / 28 / 28. Le posizioni fresche alzano il ≤3u di ~8 punti ma il volo resta
il doppio della tenuta. La traccia dice perché: il portatore cambia quasi a ogni tick (16, 11, 11, 8, 2,
8, 7, 17, 20, 17…). Ogni waypoint è la posizione di un uomo (7.861), quell'uomo diventa portatore (7.641)
e il bersaglio i suoi piedi (7.642): il waypoint è «raggiunto» nello stesso tick e la trama ne sorteggia
un altro — un passaggio a ogni tick. La sosta di ricezione (7.639, 2 tick) frenava la marcia, non la
scelta della giocata. v4: finché la sosta è viva la giocata resta la stessa (tenuta 2 tick, poi il
passaggio). Atteso: tenuta ≈ 2/3 dei tick ambientali. Tre corse verdi in corsa.

**7.868 v4 sul banco (17:00), tre corse verdi:** logico ≤3u **41 / 36 / 40 %** (base 18-29), senza padrone
40 / 33 / 46 %, tenuta 14 / 18 / 11, volo 28 / 31 / 32. La traccia conferma che a fine tick il pallone sta
sempre sul padrone fresco; il «volo» è il tick in cui il passaggio è dichiarato (portatore = ricevente,
pallone ancora sul passatore). La sosta a 2 conta anche quel tick: resta UN tick di tenuta per passaggio,
da cui il 40 %. v5: sosta a 3 tick (due di tenuta vera). Tre corse in corsa.

**7.868 v5 sul banco (17:25):** ≤3u 40 / 39 / 27 %, tenuta 13-14 contro volo 30-35: la sosta a 3 non sposta
nulla. Traccia classificata (v2 del testimone: portatore precedente, distanza al tick, piano): su 48 tick
ambientali tenuta 15, volo per passaggio di trama 7, per passo del piano 9, per stesso uomo mosso oltre
3,5u 5, per **altro cambio di portatore 12**. Il colpevole dei 12 è l'elezione d'arrivo (7.642 v4): a ogni
tick elegge l'uomo più vicino al pallone, e coi compagni stretti attorno al portatore (7.544) un vicino a
2u gli soffia la palla dai piedi — un tocco laterale a ogni tick, contato come volo. v6: se il portatore
attuale è del lato e sta entro 3,5u, resta lui; la palla cambia uomo solo con un passaggio o un cambio di
possesso. Atteso: tenuta 27/48 ≈ 56 %. Tre corse in corsa.

**7.868 v6 sul banco (17:50, container riavviato a metà catena):** ≤3u 38 % (corsa 1), 64 % su una corsa corta
(447 campioni); tenuta 12, volo 32, libero 13. Tenere il portatore nell'elezione non basta: la traccia
classificata della v6 dice tenuta 12, «altro cambio» 12, «stesso uomo lontano» 6, e gli esempi mostrano
le RIGHE: al 60'-61' il pallone va a 17,7 (proposta di una riga) mentre il portatore resta a 44, e il tick
dopo torna in volo verso di lui (ping-pong 44 → 17,7 → 44); al 2' e al 51' la riga cambia portatore e
mette il pallone altrove. v7: (a) in tenuta, una proposta a più di 6u dal portatore diventa un passaggio
all'uomo del lato più vicino al bersaglio (entro 14u), che diventa il ricevente; (b) un pallone messo a
più di 12u dal portatore, con un altro uomo del lato già ai piedi (≤3,5u), è di quell'uomo. Contatori
`passoRiga` e `presa`. Tre corse in coda dopo la v6.

**7.868 v6 (terza corsa) e v7 (18:20).** v6 corsa 3: ≤3u 33 %, tenuta 21, volo 33, libero 17. v7 (proposta di
riga = passaggio all'uomo; pallone lontano = di chi ce l'ha ai piedi): **24 / 24 / 23 %** — peggio in 3/3 della
v4/v6 (36-41). REVOCATA nel codice (commento), contatori lasciati nel testimone.
**Decisione (18:25).** Dopo sette versioni il banco dice: la struttura tenuta/volo/libero + posizioni fresche
+ sosta che tiene la giocata + elezione che tiene il portatore vale **+10-15 punti** (36-41 contro base
18-29, 3/3 sopra il massimo di base nella v4) e non arriva ai 60 dichiarati. La traccia dice perché: i tick
ambientali governati dal mover sono un terzo del gioco vivo; il resto sono passi del piano (un uomo
nuovo a ogni passo), righe che mettono il pallone in un punto e cambiano portatore, scene. Il pallone ha
29 scrittori (audit FASE 1) e la struttura ne governa uno. Spedisco la 7.868 nella versione migliore
(v6 senza v7) se rituali, geografia e telefono reggono, e dichiaro al PO che il 60 chiede il passo
successivo: TUTTI gli scrittori del pallone passano dallo stato di possesso (era la «macchina a stati»
archiviata il 28/08). Catena: banco ×2 di conferma, career, CI, geografia ×4, telefono n° 9.

## Rituale mirato (direttiva PO 10/09 18:40: «ottimizza il rituale, altrimenti sono ore sprecate»)

Misurato sulle corse di oggi: `career-critical` 11-12 min, `ci` completa 22 min — 34 min a rilascio, più
banco e telefono. Da ora il rituale si sceglie in base a COSA tocca il rilascio (tabella in
`tests/visual/package.json`):

| rilascio tocca | rituale | cosa gira | stima |
|---|---|---|---|
| partita live / renderer (src/12, src/14, src/05 cronaca) | `npm run ci:live` | test:logic + validate-situations (scene e guardiani) + partita-vera (manovra-viva, gol del simulatore) | ~20 min (misurato: validate-situations 745 s, di cui situations 364 s e final-state 212 s) |
| il mover del pallone o i flussi seedati | `npm run ci:live:mover` | come sopra + replay (determinismo) | ~18 min |
| carriera, salvataggi, calendario, coppe (src/07-11) | `npm run ci:carriera` | test:logic + save-compat + career-critical | ~14 min |
| allineamento notturno di produzione | `npm run career-critical` + `npm run ci` | tutto, una volta al giorno | ~34 min |

Saltati nel rituale live: impulsi-contesto, typing-shortcuts, save-compat, replay (se non c'entra il
mover), career-critical. Il banco S1 (padroni, 400 s) resta la misura di S1; la geografia e il telefono
si lanciano solo quando il rilascio tocca ciò che misurano (telefono: solo per la scheda, 4 partite).
La routine notturna fa il rituale completo prima di allineare `main`: se lì esce rosso, non allinea e
lo verbalizza. Rischio dichiarato: un rosso di carriera causato da un rilascio live si vede la notte,
non il giorno stesso.

**7.868 finale sul banco e rituali (19:05).** Due corse di conferma: ≤3u **33 / 32 %** (le sette versioni: 23-41;
base 18-29); senza padrone 350 / 274 su ~860 a terra (41 / 32 %). Career **PASS**, CI **exit 0** (validate 0 failure,
ball-motion OK, manovra-viva 55 su banda 10, gol del simulatore 7/7). Spedita con il divario dichiarato:
+10-15 punti sul metro, non i 60. Geografia ×4 e telefono n° 9 in corsa.

**7.868 (v6) su geografia e telefono n° 9 (20:40).** Geografia ×4: righe con luogo 73, nella banda alla riga
44 (60 %), a +1 s 53 (73 %), in uno dei tre istanti **62 (85 %)** — sulla 7.866 era 97 %: in tenuta il pallone
ignorava il bersaglio proposto dalla riga e restava sui piedi del portatore, quindi «X apre per Y al
limite» non si vedeva più. Telefono n° 9: pallone reso ai piedi del padrone 35 / 24 / 33 / 27 % (n° 8:
36 / 34 / 41 / 34), salti 43-54, scarto p90 15-22u. Sul telefono la struttura non si vede (metrica
rumorosa ±10 e reso governato da altri scrittori), e la geografia peggiora. Non regge il patto «nessuna
regressione su un metro spedito»: v8 = v6 + il solo ramo (a) della v7 (la proposta della riga diventa
un passaggio all'uomo più vicino al bersaglio). Banco ×3 e geografia ×4 in corsa; se non regge su
entrambi, la 7.868 va revocata PRIMA dell'allineamento notturno (01:00 UTC).

**7.868 REVOCATA (20:30).** v8 (proposta di riga = passaggio, senza «presa»): banco ≤3u **29 / 25 / 34 %** (v6
33-41, base 18-29), geografia in uno dei tre istanti 54/59 = **92 %** (v6 85, base 97). Nessuna delle otto
versioni regge su entrambi i metri: la v6 alza il banco e abbassa la geografia, la v8 fa il contrario.
Sorgente riportato alla 7.866 (src/14 e src/07 di f6e6a6d), build IDENTICO, `ci:live` in corsa; stanotte in
produzione va la 7.866. Restano a verbale, per il passo successivo: (1) il pallone leggeva le posizioni dei
ventidue del render precedente (un tick di ritardo per costruzione) — rimedio isolabile, da misurare da
solo; (2) ogni waypoint della trama è un uomo e diventa subito portatore: passaggio a ogni tick, mai
conduzione; (3) i tick governati dal mover sono un terzo del gioco vivo, il resto lo scrivono piano, righe
e scene. Lezione 22ª: un cambio strutturale su UN solo scrittore sposta il pallone da un metro all'altro;
serve lo stato di possesso unico per tutti gli scrittori, e va misurato su banco E geografia insieme.

## 7.870 — IL MOTORE DEL POSSESSO (carta bianca del PO, 10/09 sera) — CANTIERE APERTO, branch `claude/motore-possesso`

**Direttiva.** «Hai carta bianca, puoi anche ricominciare da zero ed eseguire una vera ristrutturazione!» ·
«L'obiettivo e' rilasciare un gioco CREDIBILE, DIVERTENTE, IMMERSIVO, REALISTICO».

**Diagnosi dopo la lettura completa del tick vivo (3.600 righe).** Il gioco ambientale nasceva dal TESTO:
prima si pescava una riga di telecronaca, poi pallone e ventidue venivano trascinati verso cio' che la riga
diceva. Ventinove scrittori del pallone logico, tredici macchine narrative in concorrenza (piano del gol,
occasione, catena, libreria, ponte, contropiede, interruzioni, calcio d'inizio, scene, mente del portatore,
righe-fatto, mister, interazioni). La 7.868 (stato di possesso ambientale) ha vinto il banco e perso la
geografia perche' era la trentesima mano sullo stesso pallone.

**La ristrutturazione: prima la simulazione, poi le parole.**
1. `src/14-motore-possesso.jsx` — il motore: JavaScript puro, deterministico (seme), senza React. Uno
   stato solo (tenuta · volo · libero · fermo · rete · kickoff · scena), i ventidue con un posto di modulo
   e un compito rispetto alla palla (inseguitore, copertura, appoggi, ricevente, battitore), decisioni
   del portatore (controllo, conduzione, passaggio con ricevente scelto per avanzamento/marcatura/corsia,
   cross, tiro con esito da `decideExecution`, perdita, fallo), palla morta con battitore che cammina al
   punto, calcio d'inizio, rete. EMETTE FATTI con nomi e luoghi (passaggio, ricezione, conduzione, cross,
   tiro, parata, palo, murato, fuori, gol, contrasto, intercetto, recupero, fallo, rigore, rimessa,
   corner, rinvio, battuta, centro, calcio d'inizio, spazzata, presa). Il microsim resta la fonte del
   punteggio: il gol decretato e' una RICHIESTA (`chiedi.gol`) e il motore costruisce l'azione fino alla
   rete; senza decreto non si segna mai. Richieste: `turno` (quota di possesso della simulazione),
   `verso` (ponte alla scena), `atteggiamento` (7.849), `eroe` (panchina), `scena`/`riprendi`.
   Test node `tests/visual/test/logic/motore-possesso.test.mjs` (8): determinismo, palla ai piedi in
   tenuta 100 %, passi umani, decreto sempre segnato entro 16 tick, mai gol senza decreto, misure
   credibili, nomi e luoghi, scena/ripresa, eroe in panchina.
2. `src/15-live-match.jsx` (rinumerato: 14→15 … 19→20). Sotto `MOTORE870` (rosso `__CPM_NO870`): un solo
   passo del motore per tick, specchi dei vecchi ref (ballPos/ballTarget/carrier/chaser/fermo/kick/
   kickoff/turno/pendingGoal) perche' scene, guardiani e sonde continuino a leggere; il NARRATORE
   `narra870` sceglie il fatto piu' importante del tick e lo racconta nello stesso formato delle righe
   BG_MATCH (nomi, sigle, luogo dal punto vero, arco 3D dal volo vero, tabellino, momentum). Spente sotto
   il motore: piano/occasione/catena/contropiede/ponte, dirottatori delle righe, libreria, interruzioni
   da riga e da tick, schieramento a preset, elezione d'arrivo, vecchio mover, mente del portatore
   (7.738/7.739). Restano: scene dell'eroe, interazioni 7.669, mister, meteo, cori, sostituzioni,
   microsim, duplice fischio.
3. Guardiano `partita-vera` (manovra-viva): le righe del narratore con fatto passaggio/cross/conduzione/
   tiro contano come manovra.

**Banco in node (16 partite da 92 tick):** tenuta 53 %, volo 27 %, fermo 7 %, rete 4 %, kickoff 5 %;
padrone<=3u in tenuta 100 %; per partita passaggi 18,9 · conduzioni 9,3 · tiri 5,1 · falli 1,7 ·
palle morte ~3; decreti 36/36 segnati (attesa media 6,3 tick).

**Prima partita headless (7.870, Chromium 412×915):** 0 errori, tick fino all'89', 32 righe del narratore,
turni causali (contrasto/intercetto), pallone reso ai piedi del padrone 55 % (scheda n°9: 24-35), reso
sul corpo piu' vicino 72 %. Geografia 12/17 (7.866: 97 %): la riga del passaggio usciva al lancio e il
pallone arrivava un tick dopo → i passaggi rasoterra ora si raccontano all'arrivo (fatto «ricezione» col
passatore); lanci, cambi di gioco, cross e tiri restano al lancio con l'arco. Misura in corso.

**Cosa NON e' ancora fatto (dichiarato):** cadenza della cronaca (0,7 fatti al minuto: righe ~35 contro
76-91 del vecchio sistema — ora anche le ricezioni parlano), il reso 3D del volo (arco vs lerp),
scheda da telefono, rituale `ci:live`, i vecchi blocchi sono SPENTI ma non ancora rimossi (si tolgono
quando il motore batte la scheda, per tenere il rosso appaiato).

### 7.870 — verbale della sera (10/09, 21:00-23:20): misure sul branch del motore

- Gate `validate-situations` 14/14 verde col motore acceso (191 scene, 0 failure); `test:logic` 41/41 (8 del motore).
- Guardiano `partita-vera`: le quattro bande della Fase 3 (mente-esegue, riga-descrive, raccoglitore,
  arbitro-esiste) misuravano le macchine spente per costruzione; ora, col motore acceso (righe rk
  `motore`), si giudicano sui fatti equivalenti (passaggi/ricezioni/cross · fatti gia' avvenuti ·
  recuperi/contrasti/intercetti · fischi e battute), soglie invariate. Trovato e corretto un difetto
  latente del guardiano: il cognome dell'eroe si calcolava e non entrava nella rosa (banda nomi-veri
  rossa su «Pv accelera in conduzione»). Bande verdi nell'ultima corsa: turno-causale 100 %, manovra-viva
  26-28 (banda 10), gol-con-manovra 7/8, tabellone 5-3 = 5-3, gol del simulatore 7 nati · 6 accreditati
  (uno decretato oltre l'88': da qui il tetto duro a 9 tick e l'urgenza dal 90').
- Scheda da telefono n° 10: padrone ai piedi 58 / 69 / 42 / 41-44 %, e 57 % nella stessa partita senza
  GLB (15 fps contro 6): l'artefatto degli fps vale 13-16 punti. Media 6,3 (n° 9: 5,5).
- Geografia della riga 14/17 (7.866: 97 %): i passaggi rasoterra si raccontano all'arrivo; il lessico
  dei luoghi e' quello che il metro legge («dal limite», «in area», «trequarti», «centrocampo»).
- Prossimi passi, nell'ordine: (1) cadenza della cronaca (0,9 fatti al minuto; 40-70 righe contro
  70-110); (2) tiri per partita (2-5); (3) resa del volo (arco 3D contro inseguimento: salti 16-39);
  (4) `ci:carriera` e rituale completo; (5) rimozione delle macchine spente quando il motore batte la
  scheda; (6) un provino sull'Android del PO per chiudere la questione fps.
- 00:24 (11/09): `ci:live` completo sulla build af8b51a del motore: exit 0 in 1238 s — `test:logic` 41/41,
  gate 14/14 (191 scene, 0 failure), guardiano `partita-vera` tutte le bande verdi (manovra 25,
  interruzioni 7, gol del simulatore 7 nati · 6 accreditati · 0 mangiati, nomi veri 45/45, tabellone
  coerente). Il branch e' verde ai rituali mirati; restano `ci:carriera` e il rituale completo prima
  di proporlo per `main`, e la scheda da telefono e' a 6,3 contro il metro 8.

## 7.871 — il passaggio rasoterra si dice al lancio E all'arrivo (cadenza della cronaca, passo 1 delle consegne)

- Metro: righe per partita e minuti muti (banco node `banco-narr.mjs`: il narratore `narra870` estratto
  da src/15 e fatto girare sui fatti del motore, 16 partite; poi la scheda da telefono).
- Rosso appaiato (7.870, stesso banco, stessi semi): 62 righe a partita (57-67), minuti muti 32 %,
  0,95 fatti per tick. Dove tace: 85 tick di palla ferma senza fatto, 68 «controllo» e 41 conduzioni
  scartati dal dado dei fatti minori (40 %), 115 tick di volo dei passaggi rasoterra (raccontati solo
  all'arrivo dalla 7.870, per la geografia), 51 di calcio d'inizio e 37 di rete senza fatto.
- Prova del dado (solo misura, non spedita): dado 60→80: 67 righe / 28 %; dado tolto: 71 / 22 %, ma
  a prezzo di «alza la testa» un minuto si' e uno no. Scartata: righe di riempimento, non fatti.
- Rimedio: il passaggio rasoterra (corto, verticale, filtrante, appoggio) torna a dirsi AL LANCIO ma
  senza luogo («Rossi verticalizza per Bianchi»: il pallone e' in volo, un luogo sarebbe una bugia per
  il metro geo865) e all'arrivo parla chi riceve, col luogo («Bianchi la riceve sulla trequarti»). Due
  righe per un passaggio, come in una telecronaca vera; priorita' del lancio 3 (non entra col respiro
  dopo un fatto importante), dado dei minori invariato al 40 %.
- Misura (banco node, 16 partite): 71 righe a partita (66-78), minuti muti 23 %, silenzio massimo 4'.
  Residuo strutturale: palla ferma in attesa della battuta (~5 tick a partita), calcio d'inizio (~3),
  rete (~2): sono le pause del calcio, non del narratore.
- Rituali: `test:logic` 41/41, JSX ok, IDENTICO 1. Browser (smoke870 / partita-vera / scheda): in coda,
  dopo il rituale notturno di produzione (non si sovrappongono due Chromium).

## 7.872 — il gol decretato si costruisce fino all'area (passo 2 delle consegne: i tiri; e «tiro da lontanissimo» #45/#48)

- Trovato col banco `tiri-zona.mjs` (32 partite in node, un decreto ogni ~38 tick): dei tiri nati da un
  decreto del microsim, 68 su 130 partivano da «dietro» (propria meta' campo) e 13 da centrocampo — cioe'
  81 su 130 erano il «tiro da lontanissimo, non e' calcio» che il PO segnala dal 7.792. Causa: dopo cinque
  tick di decreto il padrone tirava da dove stava, e al tetto (nove tick) il piu' vicino al pallone tirava
  da qualunque punto del campo.
- Rimedio nel motore: col decreto pendente chi ha la palla fuori dalla trequarti LANCIA il compagno piu'
  avanzato (sicuro dal terzo tick) o porta palla; il tiro parte dal limite o dall'area, dalla trequarti
  solo dopo cinque tick. Al tetto, se il pallone e' dietro, prima il lancio in avanti e il tiro al tick
  dopo da dove arriva (il tetto aspetta il volo). Le punte del lato decretato salgono al limite
  (adv 80-84) cosi' il lancio ha un bersaglio.
- Misura appaiata (stesso banco, stessi semi): tiri col decreto da dietro/centrocampo 81/130 → 0/63;
  zone dei tiri decretati ora limite 41 · trequarti 20 · area 2. Decreti segnati 26/29 (prima 31/34: i
  tre mancanti sono decreti nati oltre l'88' in entrambi i casi), attesa media 5,3 tick (prima 6,4),
  massima 11 (tetto del test 16). Tiri a partita 4,9 (prima 6,6: erano gonfiati dai tiri da dietro).
- Rituali: `test:logic` 41/41, IDENTICO 1. Browser (smoke870 / partita-vera / scheda) in coda insieme
  alla 7.871, dopo il rituale notturno di produzione. Residuo dichiarato: l'area resta rara in tenuta
  (28 tick su 1230 nel banco): i tiri liberi partono per lo piu' dal limite (59) e dalla trequarti (23).

## 7.873 — le punte salgono al limite quando la squadra ha il pallone (l'area come luogo del gioco)

- Misura (banco `tiri-zona.mjs`, 32 partite): in tenuta il pallone stava in area 28 tick su 1230 e i
  tiri dall'area erano 13 su 136; i cross in gioco aperto 2 in 32 partite. Causa: la spinta in avanti
  dei ventidue in possesso e' tagliata a 14 u dallo slot, e le punte partono da 55: non arrivano mai a
  78, dove il cross e il filtrante trovano un bersaglio.
- Rimedio (solo il coefficiente delle punte in `muoviTutti`): spinta 0,55 con tetto 26 u per gli AT in
  possesso (gli altri restano 0,35 / 14).
- Misura appaiata: area in tenuta 28 → 39 tick, tiri dall'area 13 → 20 su 136, cross in gioco aperto
  2 → 9 (32 partite), passo massimo 11,3 → 9,0 u. Effetto modesto e dichiarato tale: il prossimo
  gradino e' la scelta del ricevente vicino all'area (filtrante 1 su 16 partite).
- Rituali: `test:logic` 41/41, IDENTICO 1. Browser in coda con 7.871-7.872.

## 7.874 — i ruoli dal campo (le regole per ruolo del motore erano lettera morta in browser)

- Trovato cercando il rosso appaiato della 7.873: il live match passa al motore i ventidue di
  `matchPlayers`, che non portano `rl`; nel banco node invece i ruoli ci sono. Quindi ogni regola per
  ruolo (punte al limite 7.873, punte del lato decretato in area 7.872, difensori che non salgono,
  battitore del rigore) valeva nel banco e non nel gioco. Anche il banco `tiri-zona` usava
  `Math.random` per i decreti: reso deterministico (LCG) prima di rimisurare, perche' 28 → 39 della
  7.873 era in parte rumore.
- Rimedio: se i giocatori arrivano senza ruolo, il motore lo legge dalla posizione di partenza (per
  squadra: i quattro piu' arretrati DF, i tre seguenti MF, gli altri AT).
- Misura appaiata, banco deterministico, 48 partite, ventidue SENZA ruolo come in browser:
  7.873 → area in tenuta 54 tick, tiri dall'area 16 su 220, tiri decretati dall'area 8;
  7.874 → area 70, tiri dall'area 33 su 216, decretati dall'area 16. Identico al banco con i ruoli
  (7.873 con ruoli: 70 / 33 / 16): la 7.874 fa in browser cio' che la 7.873 prometteva.
  Con la 7.872 senza ruolo comparivano ancora 3 tiri decretati da centrocampo su 215; con 7.874: 0.
- Rituali: `test:logic` 42/42, IDENTICO 1. Browser in coda (guardiano + scheda) dopo il bisect
  dell'arbitro-esiste.

## 7.875 — l'arbitro esiste: la partita si ferma (banda arbitro-esiste rossa dalla 7.872)

- Diagnosi, non taratura. Il guardiano segnava `arbitro-esiste` rosso sulla 7.872/7.873/7.874 (1-4
  interruzioni su banda 6 in due partite) e verde sulla 7.870/7.871 (6-7). Bisect in browser su quattro
  build + contatori nuovi nel motore (tick con decreto/turno/verso pendenti, stampati dal guardiano per
  partita): la causa NON era la 7.872. Il motore fischiava 3,1 volte a partita (una ogni 28 minuti di
  gioco) e la banda cadeva a caso da una parte o dall'altra del confine. In browser il microsim decreta
  3-4 gol a partita e il decreto occupa 24 tick su 85: in quel quarto di partita non si fischiava per
  costruzione (7.870: la punizione allungava l'attesa oltre il tetto).
- Rimedio nella simulazione: (a) il fallo c'e' anche col gol decretato, a meta' probabilita' e solo
  finche' il tetto ha margine (t<=3): la punizione fa parte della costruzione, non la sospende;
  (b) probabilita' di fallo 0,17/0,06 → 0,26/0,10 (una partita vera ne ha ~25, qui restano ~5);
  (c) il contrasto vicino alla linea manda il pallone fuori piu' spesso.
- Misura appaiata (banco deterministico, 48 partite, regime del browser DEC 0,06):
  interruzioni a partita 3,13 → 5,02; falli 2,46 → 4,60; battute raccontabili 3,00 → 4,94.
  Guardrail: gol decretati segnati 101/108 (94 %), attesa media 6,7 tick, MASSIMA 14 (tetto del test 16,
  prima 16: il margine e' migliorato, non peggiorato); fermo 15 % dei tick; padrone ai piedi 100 %.
- Test nuovo: «almeno 3 interruzioni a partita» su 8 semi. `test:logic` 43/43, IDENTICO 1.
- APERTO, trovato qui e non ancora affrontato: IL CAMPO E' STRETTO. Il pallone sta nel corridoio
  y 27-74 per il 95 % del tempo, oltre |y-50|>=30 solo il 3 %, oltre 38 mai; i ventidue p5-p95 = 22-79.
  Percio' le rimesse laterali sono ZERO in 48 partite (nel calcio vero sono ~40 a partita) e i cross in
  gioco aperto 0,33. Prossimo passo del cantiere.

## 7.876 — il campo e' largo quanto il campo (la squadra trasla, non collassa sul pallone)

- Misura del rosso (banco deterministico, 24 partite, regime del browser): il pallone stava nel
  corridoio y 27-74 per il 95 % del tempo, oltre |y-50|>=30 solo il 3 %, oltre 38 MAI; i ventidue
  p5-p95 = 22-79. Rimesse laterali: 0 in 48 partite (nel calcio vero ~40 a partita). Causa: in
  `muoviTutti` ogni giocatore puntava `sl.y+(by-sl.y)*0,22`, cioe' era tirato verso la y DEL PALLONE —
  che parte da 50 e non esce mai: un ciclo che stringe il gioco su se stesso. La conduzione aggiungeva
  un rientro verso il centro a ogni tocco.
- Rimedio: il blocco TRASLA verso il pallone mantenendo la forma (`sl.y+(by-50)*0,30`), le corsie
  restano; chi conduce sulla fascia dal 60 di avanzamento non rientra per abitudine e punta il fondo
  (rientra solo dall'86 in poi).
- Misura appaiata: pallone oltre |y-50|>=30 dal 3 % al 10 % (p5-p95 20-80), ventidue dal 6 % al 22 %
  (p5-p95 15-86). Guardrail: zero salti sopra 12u in 48 partite (nel rosso ce n'era uno da 26,9u, un
  difetto raro e preesistente della sistemazione del corner: dichiarato, non affrontato qui);
  gol decretati segnati 192/206 (93 %) contro 190/208 (91 %), attesa media 7,0 e massima 16 contro
  6,8 e 15 (tetto del test 16); interruzioni 5,02 → 4,83 a partita; `test:logic` 43/43, IDENTICO 1.
- APERTO e dichiarato: le rimesse laterali restano ~0,02 a partita. Il campo ora si usa piu' largo ma
  il pallone non esce quasi mai: il prossimo gradino e' il pallone che varca davvero la linea.
- Guardiano sulla 7.875 (due corse, stesso mondo): `arbitro-esiste` 8 e 7 interruzioni su banda 6,
  exit 0 entrambe — la banda rossa da tre release e' chiusa con misura ripetuta.

## 7.877 — un solo scrittore dei ventidue (la macchina delle corsie era rimasta accesa sotto il motore)

- Strumento nuovo: `chi-lagga.mjs` (sonda browser, 170 s, ~830 campioni) che separa TRE verita' sullo
  stesso istante: dove il MOTORE mette padrone e pallone, dove li ha React (`matchPlayers`, `ballPos`),
  dove sta la MESH 3D. Serviva perche' la scheda da telefono diceva «pallone ai piedi del padrone
  45-54 %» mentre il motore lo garantisce per costruzione, e nessuno sapeva quale strato mentiva.
- Diagnosi: il motore tiene il pallone ai piedi del padrone nel 100 % dei campioni in tenuta (0,5u
  sempre), ma lo STESSO uomo dentro `matchPlayers` stava a 10,5u di mediana (p90 20,2, max 32,2) da
  dove il motore lo mette. Causa: la 7.870 aveva spento la macchina dei movimenti dentro il tick, ma
  le CORSIE — un `useEffect` a parte, a 550 ms, attivo in `phase==='playing'` — erano rimaste accese e
  riscrivevano le posizioni fra un tick e l'altro. Due scrittori, due verita': esattamente cio' che la
  ristrutturazione doveva togliere.
- Rimedio: quell'effetto si ferma quando guida il motore (rosso `__CPM_NO877` per la coppia).
- Misura appaiata, stessa sonda, stesso mondo (seme 4242, GLB spento):
  · React `matchPlayers`↔pallone del motore: mediana 11,5 → 0,5u, <=3u dal 18 % al 90 %;
  · scarto React↔motore sullo stesso uomo: mediana 11,5 → 0,0u (p90 24,0 → 0,1);
  · mesh 3D↔pallone del motore: mediana 5,4 → 2,4u, <=3u dal 32 % al 54 %;
  · `ballPos`↔pallone del motore: 0 prima e dopo (quello strato era gia' sano).
- IDENTICO 1, JSX ok. Guardiano e scheda da telefono in corsa.

### 7.877 — le misure in browser (11/09 07:05)

- Guardiano `partita-vera`, exit 0: `custodia` mediana 0,5u su 50 campioni (era 6-7u: e' la stessa
  causa, un solo scrittore), `arbitro-esiste` 7, tutte le altre bande verdi.
- Scheda da telefono (Chromium 412×915, GLB acceso, tick reale — NON un Android vero), coppia
  rosso/verde 7.874 → 7.877 sulle stesse due partite:

  | misura | Vairo casa | Galli fuori | banda |
  |---|---|---|---|
  | pallone ai piedi del padrone (<=3u) | 45 % → **68 %** | 54 % → **77 %** | >= 60 % |
  | …di cui a palla a terra | 50 % → **76 %** | 59 % → **85 %** | >= 75 % |
  | distanza reso<->padrone, mediana | 5,3 → **1,1** u | 5,6 → **1,0** u | <= 3u |
  | scarto reso<->logico, mediana / p90 | 1,2/13,8 → 2,2/15,1 u | 1,3/18,1 → 0,7/11,9 u | p90 <= 8u |
  | salti del pallone | 8 → 7 su ~1900 | 21 → 13 su ~1900 | 0 |

  Le due bande che erano rosse da quattro schede (padrone ai piedi, palla a terra) sono verdi in
  entrambe le partite. Restano rossi il p90 dello scarto reso<->logico (15,1 e 11,9 contro 8) e i salti
  del pallone: sono lo strato 3D, non la simulazione.
- Non verificato: i fotogrammi al secondo sono 15 (le sonde girano in coda: il telefono del PO sta
  intorno ai 30) e l'Android vero resta fuori. Lo smoke di questa tornata e' uscito con un solo
  campione (partita non avviata dopo due sonde da 15 minuti): va ripetuto, non conta come misura.

### 7.877 — RITUALE COMPLETO VERDE sul branch del motore (11/09 07:39)

Primo rituale completo sul branch `claude/motore-possesso` (passo 5 delle consegne):
`career-critical` exit 0 in 524 s · `npm run ci` exit 0 in 1191 s. Dentro: gate 14/14 (3 run pulite
di fila), `test:logic` 43/43, live-smoke OK, e il guardiano `partita-vera` con TUTTE le bande verdi —
turno-causale 100 %, manovra-viva 24 (banda 10), arbitro-esiste 12 (banda 6), custodia 0,8u,
gol-del-simulatore 7 nati · 5 accreditati · 0 mangiati, nomi-veri 51/51, tabellone coerente.
Il branch e' tecnicamente proponibile per la produzione. Non lo propongo: il cancello scritto dal PO
e' la SCHEDA da telefono (media 8 su 12 aree, nessuna area sotto 7), e su questa build non e' ancora
stata rifatta. E' la prossima misura.

## Misura (non una release): l'ipotesi «e' il volo» sull'area 11 e' SMENTITA

Le consegne indicavano come causa dello scarto reso<->logico la durata dell'arco 3D (80 u/s contro un
volo vero di 1,2-1,6 s). La misura dice altro. Sonda `volo-scarto.mjs` (170 s, 833 campioni), scarto fra
la MESH del pallone e la palla del motore, spezzato per stato del motore:

| stato | campioni | mediana | p90 | max | <= 3u |
|---|---|---|---|---|---|
| tenuta | 420 | 4,0u | 16,3u | 35,8u | 40 % |
| volo | 154 | 3,3u | 17,6u | 31,0u | 49 % |
| fermo | 242 | 0,4u | 26,6u | 49,8u | 67 % |
| kickoff | 8 | 8,8u | 26,4u | — | 38 % |

Lo scarto NON e' concentrato nel volo: e' distribuito su tutti gli stati, ed e' peggiore in TENUTA —
dove la palla logica sta incollata ai piedi del padrone per costruzione (0,5u sempre, misurato). Quindi
il colpevole non e' la durata dell'arco ma l'INSEGUIMENTO della mesh: il pallone reso non tiene il passo
di una palla che si muove col portatore. Il prossimo cantiere parte da qui, non dall'arco; il primo passo
e' attribuire chi scrive la mesh sotto il motore (testimone `_ws524`, `npm run ball-owner`).

## Area 11 «Immersione»: la catena e' attribuita per intero (misura, nessuna release)

Sonda nuova `corpo-lag.mjs` (160 s, 350 campioni in tenuta, GLB acceso). Quattro distanze sullo stesso
istante, dal motore fino ai pixel:

| anello | mediana | p90 |
|---|---|---|
| D — logico React <-> motore | **0,0u** | 0,1u |
| E — bersaglio commesso del corpo <-> logico | **0,9u** | 16,6u |
| F — corpo <-> il suo stesso bersaglio | **4,0u** | 13,3u |
| C — pallone reso <-> corpo del portatore | **1,2u** | 15,1u |
| A — pallone reso <-> pallone del motore | **3,7u** | 18,7u |

Si legge cosi': la simulazione e' esatta (D=0), il corpo e' PUNTATO nel posto giusto (E≈1u), il pallone
e' incollato al corpo (C≈1u) — e tutto lo scostamento sta in F, il corpo che non raggiunge il proprio
bersaglio. Velocita' del corpo: mediana 0,5 u/s con un tetto di 8 u/s.

⚠️ Questo filo era gia' stato aperto e chiuso una volta (nota lunga in `src/12-three-match-view.jsx`,
~riga 1744): allora il ritardo si divideva in **stadio 1 = 2,27 m** (bersaglio commesso indietro) e
**stadio 2 = 3,96 m** (corpo indietro sul bersaglio), e la conclusione fu che l'integrazione e' esatta e
che quei due stadi sono VOLUTI — sono la rampa d'arrivo, il limitatore di sterzata, il freno per girarsi:
«la resa e' fatta per discostarsi dal modello; non e' deriva… se si vuole che l'occhio veda cio' che la
simulazione decide, quel numero va SCELTO, non corretto di nascosto».
La novita' di oggi: col motore lo **stadio 1 e' sparito** (2,27 m → 0,9u), perche' il bersaglio ora e'
la posizione della simulazione e non piu' il risultato di quattro macchine che si contendevano i corpi.
Resta solo lo stadio 2, ~4u, e con esso l'area 11 a 5.

**Non lo taro di mia iniziativa**: e' la decisione di prodotto che quella nota chiedeva di non prendere
di nascosto. Tre strade, con il loro prezzo:
1. lasciare com'e': il movimento resta morbido, l'area 11 resta a 5 e la media della scheda si ferma
   intorno a 6,8-7;
2. dimezzare lo stadio 2 solo per il PORTATORE (chi ha la palla arriva dove dice la simulazione, gli
   altri restano morbidi): l'occhio segue il pallone, quindi e' li' che il ritardo si vede — costo
   atteso, un portatore leggermente piu' «scattante» degli altri;
3. dimezzarlo per tutti: massima fedelta' alla simulazione, rischio di movimento robotico — e' esattamente
   cio' che le note del 7.518-7.594 avevano tolto apposta.
Raccomando la 2, misurata con la coppia rosso/verde su F, sulla scheda da telefono e sul check `motion`
del gate (che giudica proprio il movimento).

## 7.878 — la fascia e' uno sbocco e il pallone puo' uscire (area 4 «Varieta'» della scheda)

- Rosso misurato: **rimesse laterali 0,02 a partita** (nel calcio vero ~40), cross in gioco aperto 0,3.
  Due cause: (a) il premio all'uomo largo in `scegliRicevente` valeva 4 punti su un punteggio dove una
  marcatura ne toglie 14 — non decideva niente; (b) l'uscita del pallone scattava solo con il bersaglio
  oltre |y-50|>=34, dove il gioco non arriva quasi mai.
- Rimedio, tre pezzi nella simulazione: il premio alla fascia conta (6-9 punti, +5 se chi ha la palla e'
  pressato: lo scarico sull'ala e' la giocata del calcio quando il centro e' chiuso); la probabilita' che
  un passaggio finisca fuori CRESCE con la vicinanza del bersaglio alla linea invece di essere una soglia;
  la spazzata difensiva finisce in rimessa laterale una volta su cinque.
- Misura appaiata (banco deterministico, 48 partite, regime del browser):
  rimesse laterali **0,02 → 0,85** a partita · palloni fuori 0,35 → 0,81 · interruzioni totali 4,71 → 5,29.
  Guardrail: tenuta 50 % → 48 %, fermo 14 % → 15 % (la banda della scheda e' «palla morta + fermo <= 15
  minuti»: qui si resta dentro, ma il margine e' sottile e va riguardato sulla scheda), passo massimo 9,1u,
  padrone ai piedi 100 %, attesa del decreto massima 15 tick (tetto del test 16), decreti segnati 89 %
  contro 91-93 % — differenza dentro il rumore fra due catene di sorteggi diverse, DICHIARATA non risolta.
- ⚠️ Onesta' sul numero: 0,85 rimesse a partita restano lontanissime dalle ~40 vere, e non e' un difetto
  da tarare via. In questo motore **un tick e' un minuto**: la partita ha ~85 decisioni, non 1300 eventi.
  Quaranta rimesse vorrebbero dire meta' partita a palla ferma. Il bersaglio giusto qui e' «ogni tanto il
  pallone esce e si vede», non la statistica reale.
- `test:logic` 43/43, IDENTICO 1. Guardiano in corsa.

### 7.878 — la conferma in browser (11/09 11:10)

Guardiano `partita-vera`: exit 0, tutte le bande verdi, `arbitro-esiste` 9. Scheda da telefono su Galli
fuori (la partita che sulla 7.877 aveva il margine peggiore sulla palla morta):

| misura | 7.877 | 7.878 | banda |
|---|---|---|---|
| palla morta + fermo | 20' | **13'** | <= 15' |
| righe di cronaca | 81 | 76 | 70-110 |
| pallone ai piedi del padrone | 77 % | 70 % | >= 60 % |
| …di cui a palla a terra | 85 % | 74 % | >= 75 % |

Il timore era che le interruzioni in piu' sfondassero la banda della palla morta: e' successo il
contrario (20' → 13'), perche' una rimessa dura un tick mentre il possesso che girava a vuoto ne durava
molti. Le due misure in calo (padrone 77 → 70, a terra 85 → 74, quest'ultima appena sotto banda) sono
di UNA partita e stanno dentro lo scarto fra partite gia' visto nella scheda n° 11 (63-77 %): dichiarate,
non spiegate. Vanno riguardate alla prossima scheda a quattro partite.

⚠️ Intoppo di metodo, a verbale: la prima catena di misura della 7.878 e' MORTA a meta' (nessun processo,
nessun marcatore) perche' lanciata senza staccarla dalla sessione. Rilanciata con `setsid`. Una misura
che non finisce non e' un rosso: e' una misura che non c'e'.

## REVOCATA PRIMA DI SCRIVERLA: la 7.879 (ritardo del portatore). Era il mio strumento, non il gioco

Il PO aveva scelto la strada 2 («dimezzare lo stadio 2 solo per chi ha la palla»). Prima di toccare le
costanti ho rifatto la misura e ho trovato numeri quattro volte migliori senza aver cambiato niente del
movimento. Prova decisiva: **la stessa sonda, sulla stessa build, due volte — a macchina libera e con sei
processi a mangiare la CPU**, registrando i fotogrammi al secondo:

| misura | senza carico (15,1 fps) | con carico (9,4 fps) |
|---|---|---|
| pallone reso <-> pallone del motore | **1,8u** | 6,2u |
| corpo del portatore <-> suo logico | **3,1u** | 5,9u |
| corpo <-> suo bersaglio (stadio 2) | **0,9u** | 2,4u |
| portatore marcato dal motore | 69 % | 50 % |

Il ritardo segue il CARICO, non il codice. I 4,0u di stamattina erano stati misurati mentre girava la
catena della scheda: strumento sotto carico, non gioco lento. E il trattamento speciale del portatore
(bersaglio non smussato, accelerazione x2,5, scatto a 13 u/s) esiste gia', ARRIVA (marcato nel 69 % dei
campioni) e funziona: lo stadio 2 col flag e' 0,9u.
**Non implemento la 7.879**: sarebbe una taratura contro un numero gonfiato dalle mie condizioni di
misura, cioe' esattamente la classe di errori che questo repo ha gia' pagato tre volte (7.483 «una pagina
stanca non e' il gioco», 7.594 «il campione condizionato», 7.502 «velocita' x intervallo»).

**Regola nuova per ogni sonda percettiva**: una misura sul RESO (pallone, corpi, camera) vale solo se la
sonda gira DA SOLA e dichiara i propri fotogrammi al secondo; sotto i ~12 fps il numero e' dello
strumento. Le quattro partite della scheda n° 11 girarono in catena, una alla volta, a 15-17 fps — gli
stessi fps della corsa libera qui sopra: quella scheda RESTA VALIDA.

Cosa resta davvero dell'area 11, con i numeri buoni: non il ritardo a regime (0,9-1,8u), ma le ESCURSIONI
— scarto reso<->logico p90 12-22u contro una banda di 8 — e i salti del pallone (7-39 a partita). Sono
eventi rari e grossi, quasi certamente negli archi e nei cambi di scena, non nel passo normale. Il
prossimo cantiere dell'area 11 parte da li'.

## Area 11 «Immersione»: il laboratorio non la sa misurare. Tre ipotesi cadute in fila

Tre colonne reggevano il voto 5. Tutte e tre sono cadute sotto misura, e nessuna era il gioco:

1. **Il ritardo del corpo** — 4,0u a macchina carica (9,4 fps), **0,9u a macchina libera** (15,1 fps).
   Era il mio strumento. Il rimedio approvato dal PO e' stato REVOCATO prima di scriverlo.
2. **La durata dell'arco** — misurata: 640 ms per 14,5u, cioe' **22,8 u/s**, che per un passaggio e' la
   velocita' giusta (un pallone rasoterra fa 20-25 m/s). Non c'e' niente da rallentare.
3. **I salti del pallone** (7-39 a partita nella scheda) — con la sonda che campiona a 60 ms dentro la
   pagina: **ZERO salti in 200 s di gioco fluido**. La soglia della scheda («>8u in <=110 ms») corrisponde
   a 72 u/s: e' velocita' x intervallo, la stessa trappola del 7.360 e del 7.502. Il censimento degli
   stacchi lo conferma dall'altro lato: i 3 salti che trova stanno TUTTI dentro uno stacco nero, cioe'
   non si vedono.

E il numero che resta, lo scarto reso<->logico, **scala con i fotogrammi al secondo**:

| fps della corsa | mediana | p90 |
|---|---|---|
| 9,4 (macchina carica) | 6,2u | 16,1u |
| 14,8 | 2,3u | 21,9u |
| 24,9 (macchina libera) | **0,7u** | 18,6u |

Il telefono del PO sta a ~30 fps. **Conclusione: da questo laboratorio l'area 11 non e' misurabile in
modo onesto**, perche' ogni sua grandezza dipende da quanto e' carica la macchina che misura. Non la
taro, non la spedisco e non la conto come difetto del gioco: resta APERTA e dichiarata, e il suo voto
va dato sull'Android del PO o con un protocollo che fissi gli fps.
⚠️ Conseguenza sulla scheda: la voce «salti del pallone» va tolta o ridefinita (contare solo i salti
SENZA stacco nero e a passo di campionamento fisso), altrimenti continua a produrre un rosso che non
esiste. Lo faccio prima della prossima scheda.

Il lavoro si sposta dove le misure NON dipendono dagli fps: area 4 (conteggi di eventi) e area 7 (gli
highlight dell'eroe dal motore).

## 7.879 — la scena dell'eroe nasce da un FATTO del motore, non da un minuto (area 7 della scheda)

- Rosso misurato in browser (sonda nuova `scena-salto.mjs`, due corse): **0 scene su 4 si aprivano con
  l'eroe che aveva il pallone**; all'apertura il mondo saltava — l'eroe fino a 10,1u, il pallone fino a
  23,7u in una delle quattro. La scena veniva appiccicata sopra la partita invece di nascerne.
- Rimedio, la prima fetta della seconda fase delle consegne: quando si apre la finestra della scena il
  live match CHIEDE al motore di servire l'eroe (`chiedi.scenaEroe`); il motore lo sceglie come ricevente
  con le sue regole (premio 26 nella scelta del ricevente) e, quando l'eroe ha il pallone oltre meta'
  campo, emette `occasione_eroe {tipo, zona, pressione, compagni liberi}`. La scena si apre SU QUEL
  FATTO. Rete di sicurezza: se dopo 14 minuti il pallone all'eroe non e' arrivato, la scena si apre
  comunque col vecchio cancello — un highlight non si perde mai. Rosso `__CPM_NO879`.
- Misura nel banco node (40 partite, richieste ogni 18 minuti): **110 richieste servite su 157 (70 %)**,
  attesa mediana 7 tick, p90 19, tetto 25. Tipi: fra-le-linee 78 · costruzione 18 · conclusione 11 ·
  spalle 3. Guardrail invariati: interruzioni 5,29 a partita, decreti segnati 89 %, attesa del decreto
  massima 15. `test:logic` 43/43, IDENTICO 1, JSX ok.
- In corsa: la coppia in browser sulla stessa sonda (scene aperte con l'eroe che ha il pallone) e il
  guardiano `partita-vera`.

### 7.879 — la misura in browser (11/09 13:20)

| misura (sonda `scena-salto.mjs`, stesso mondo) | 7.878 | **7.879** |
|---|---|---|
| scene aperte con l'eroe che HA il pallone | 0/4 | **2/2** |
| salto del PALLONE all'apertura | fino a 23,7u | **0,0u** |
| salto dell'EROE all'apertura | 1,1-10,1u | 6,3-21,7u |

Guardiano `partita-vera`: exit 0, tutte le bande verdi.
La scena ora NASCE dal fatto: l'eroe ha il pallone davvero, e il pallone non si sposta piu' di un
centimetro all'apertura. **Resta il salto dell'EROE**, ed e' la seconda meta' del lavoro: la scena lo
mette ancora dove dice la `startZone` pre-autorata della situazione, invece di partire da dove il motore
lo ha portato. E' il prossimo passo (7.880).

## 7.880 — la situazione si sceglie DOVE STA L'EROE (seconda meta' dell'area 7)

- Rosso misurato sulla 7.879: il pallone non salta piu' all'apertura della scena (0u), ma l'EROE si',
  fino a 21,7u. Causa: la scena lo CLAMPA dentro la `startZone` pre-autorata della situazione pescata dal
  calendario e, se quella zona sta dietro di lui, lui torna indietro.
- Rimedio: il fatto del motore (`occasione_eroe`) porta con se' la sua ZONA, e fra i candidati si sceglie
  la situazione che si gioca dove l'eroe e' gia' (area→area/bordo, limite→bordo/area,
  trequarti→trequarti/fascia, centro→centro/trequarti), escludendo le difensive quando lui ha il pallone.
  Il repertorio autorato resta intatto: cambia soltanto QUALE si sceglie. Rosso `__CPM_NO880`.
- Misura attesa: salto dell'eroe all'apertura 6,3-21,7u → pochi passi. In corsa su due partite piu' il
  guardiano. `test:logic` 43/43, IDENTICO 1, JSX ok.

### 7.880 v2 — non basta la zona, serve la corsia

Coppia rosso/verde sulla 7.880 v1 (stesso mondo, stesso seme): scene aperte con l'eroe che ha il
pallone **0/2 (rosso) contro 2/2 (verde)** — il trigger della 7.879 e' confermato in modo appaiato. Ma il
salto dell'EROE resta: mediana 21,5u nel rosso contro 15,6u nel verde, e nel caso peggiore la x non si
muoveva (59,7 → 60,2) mentre la y lo portava da 45,6 a 30: e' la CORSIA, non la zona.
v2: fra i candidati (16 invece di 8) si preferisce quello la cui `startZone` CONTIENE gia' il punto dove
il motore ha messo l'eroe — nessun clamp, lui resta dov'e'. La zona resta il ripiego.
⚠️ Il gancio di misura `__CPM_SET_NUMHL` non ha alzato le scene osservate (restano 2 per corsa): il
numero si decide al fischio d'inizio e la chiamata arriva dopo. Da sistemare se servira' piu' campione.

### 7.880 v2 — la misura (11/09 14:35): l'area 7 e' chiusa al metro

Tre partite (Vairo casa, Moretti casa, Conti fuori), sei scene osservate, contro il rosso appaiato
(`__CPM_NO879`+`__CPM_NO880`) nello stesso mondo:

| misura | rosso | **verde 7.880 v2** |
|---|---|---|
| scene aperte con l'eroe che HA il pallone | 0/2 | **6/6** |
| salto dell'EROE all'apertura, mediana | 21,5u | **4,5u** (max 7,5) |
| salto del PALLONE all'apertura | fino a 23,7u | **0,0u** |

I sei salti dell'eroe: 0,5 · 0,5 · 4,0 · 5,0 · 7,1 · 7,5. Sono passi, non teletrasporti: la scena ora
comincia dove la partita l'aveva lasciata. Guardiano `partita-vera` exit 0, tutte le bande verdi.

### 7.880 — RITUALE COMPLETO VERDE (11/09 15:05)

`career-critical` exit 0 in 531 s · `npm run ci` exit 0 in 1226 s. Gate stabile (4 run pulite di fila),
replay completi e coerenti, guardiano `partita-vera` verde. Il branch del motore regge il rituale
completo anche con la scena dell'eroe nata dal fatto. Scheda n° 12 (quattro partite) in corsa.

## 7.881 — la rimessa si batte subito (il prezzo della 7.878, dalla scheda n° 12)

- Rosso dalla scheda n° 12: minuti a gioco fermo **19-21 contro un tetto di 15**, in 3 partite su 4. E'
  il prezzo della 7.878 (rimesse laterali 0,02 → 0,85): piu' interruzioni, piu' minuti a palla ferma.
  L'errore e' mio: il margine sottile era gia' scritto nel verbale della 7.878 e l'ho spedita lo stesso.
- Rimedio: non si tolgono le rimesse — il pallone DEVE uscire, e' calcio — si accorcia la pausa. Rimessa
  laterale e rinvio dal fondo si battono in **un tick** invece di due; angolo e rigore restano a tre,
  perche' li' la squadra si schiera davvero.
- Misura nel banco (48 partite): fermo 15 % → 14 % dei tick, interruzioni 5,29 → 5,27 a partita (le
  rimesse NON si perdono), decreti segnati **89 % → 94 %**, attesa massima 15 tick. `test:logic` 43/43,
  IDENTICO 1. Due partite in browser in corsa per il minutaggio vero.

### 7.881 v2 — anche la punizione lontana si batte in fretta

Prima misura in browser della v1: Galli **21' → 14'** di palla ferma (in banda), ma **Vairo resta a 20'**
— identico. Letto il perche': a Vairo la palla ferma non e' fatta di rimesse ma di PUNIZIONI, che
costavano due tick ciascuna. Nel calcio vero si riparte subito e la barriera si forma solo vicino
all'area: ora la punizione oltre i 30 metri dalla porta si batte in un tick, sotto restano due.
Banco (48 partite): fermo **14 % → 12 %** dei tick, interruzioni 5,27 → 5,40 (non se ne perde nessuna),
decreti segnati 92 %, attesa massima 15. `test:logic` 43/43, IDENTICO 1. Vairo e Conti in misura.

### 7.881 v2 — la misura in browser (11/09 18:36)

| minuti per stato | scheda n° 12 (7.880) | **7.881 v2** |
|---|---|---|
| Vairo casa: fermo + calcio d'inizio | 18 + 2 = **20'** | 5 + 2 = **7'** |
| Conti fuori: fermo + calcio d'inizio | 10 + 9 = **19'** | 8 + 10 = **18'** |

Vairo rientra largamente in banda (7' contro un tetto di 15). Conti resta a 18, ma leggendo la
ripartizione il suo tempo fermo NON e' palla morta: e' **calcio d'inizio 10' + ripresa 6'**, cioe' i
riavvii dopo i gol — quella partita ne ha tanti. Un gol ferma il gioco anche nel calcio vero, e i due
tick di rete piu' due di ripartenza sono ~90 secondi reali: sono giusti, non sono un difetto. Il residuo
di Conti quindi si dichiara e non si tara.
Guardiano `partita-vera` exit 0, tutte le bande verdi. Righe di cronaca 73 e 88 (banda 70-110), pallone
ai piedi 77 % e 61 %.

- 11/09 01:31 UTC (routine notturna): Produzione allineata a 0df1e49 (7.866.0) il 11/09, rituale completo verde
  (`career-critical` exit 0 in 512 s, `npm run ci` exit 0 in 1176 s sull'HEAD del branch QA, working tree pulito,
  IDENTICO 1). Fast-forward 75092dc → 0df1e49. Non verificato: l'Android del PO (Chromium 412×915 in
  headless); la CI di GitHub su main non e' leggibile da questa sessione.

## RILASCIO IN PRODUZIONE 11/09 sera — 7.866.0 → 7.881.0 (il motore del possesso)

**Richiesta del PO:** «rilascia in prod appena puoi».

**Che cosa va in produzione.** 41 commit, dalla 7.866.0 alla **7.881.0**: la ristrutturazione avviata con
la carta bianca del 10/09 sera. Il gioco ambientale non nasce piu' dal testo: `src/14-motore-possesso.jsx`
simula il possesso (uno stato solo: tenuta · volo · libero · fermo · rete · kickoff · scena) e il narratore
`narra870` racconta i fatti che la simulazione emette. Il microsim resta la fonte del punteggio: il gol
decretato e' una richiesta e il motore costruisce l'azione fino alla rete.

**Misure con cui e' stata verificata** (Chromium headless 412x915, quattro partite per voce):
- 7.872 tiri da dietro/centrocampo col decreto 81/130 -> 0/63 · 7.873/7.874 tiri dall'area 13 -> 33
- 7.875 interruzioni 3,13 -> 5,02 a partita (l'arbitro esiste) · 7.876 ventidue oltre |y-50|>=30 dal 6 al 22 %
- 7.877 padrone col pallone ai piedi 45/54 % -> 68/77 %, palla a terra 50/59 % -> 76/85 %
- 7.878 rimesse laterali 0,02 -> 0,85 a partita (area 4, Varieta')
- 7.879/7.880 v2 scene aperte con l'eroe che ha il pallone 0/2 -> 6/6, salto dell'eroe 21,5u -> 4,5u
  mediana, salto del pallone 23,7u -> 0 (area 7, Highlight: 6 -> 8 nella scheda n° 12)
- 7.881 v2 palla morta su Vairo 20' -> 7' contro un tetto di 15' (area 5, Ritmo)

**Rituali sull'HEAD rilasciato** (build IDENTICO 1, working tree pulito, HEAD 549d172):
`npm run career-critical` **exit 0 in 514 s** · `npm run ci` **exit 0 in 1192 s** (gate
`validate-situations` 14/14, `test:logic` 43/43, guardiano `partita-vera` tutte le bande verdi).
Il rituale era stato lanciato una prima volta alle 18:37 ed e' morto alle 19:24 col riavvio del
container, non per un rosso: rilanciato alle 19:28 e portato a termine. La fusione col branch QA
(549d172, ed454fe) e' stata committata a rituale gia' partito ma tocca **solo questo documento**:
zero righe su `src/` e su `CARRIER-MANAGER-AV.html`, quindi non cambia cio' che i test hanno letto.

**Perche' e' servita una fusione e non un fast-forward.** Il branch QA portava un commit che il branch
del motore non aveva (la riga dell'allineamento notturno delle 01:31); la base comune era 0df1e49.
Fusione con conflitto in coda al documento, risolto tenendo entrambi i testi in ordine cronologico.

**Cosa NON e' verificato, e va detto:**
- **L'Android del PO.** Tutto quanto sopra e' Chromium headless 412x915 a 9-25 fps, non il telefono
  del PO a ~30 fps. Nessuna di queste misure e' una promessa su come si vede li'.
- **La CI di GitHub su main**: non e' leggibile da questa sessione.
- **Il metro del PO non e' raggiunto.** La scheda da telefono n° 12 (build 7.880) fa **media 6,9**
  su 12 aree, con il Ritmo a 6. Il metro per dire «puoi collaudare» e' media >= 8 con nessuna area
  sotto 7: **non ci siamo**. Questo rilascio mette in produzione un gioco migliore di quello di
  stamattina, non un gioco pronto al collaudo.
- La 7.881 v2 ha rimesso il Ritmo in banda **nel browser**, ma la scheda n° 13 che lo conferma
  ancora non esiste.

**Regola nuova a verbale (lezione 23ª).** Una misura sul reso vale solo se la sonda gira DA SOLA e
dichiara i propri fotogrammi al secondo: sotto ~12 fps il numero e' dello strumento, non del gioco.
E' cosi' che e' caduta la 7.879 «ritardo del portatore», approvata dal PO e **revocata prima di
scriverla**: 0,9u a macchina libera contro 2,4u sotto carico.


### Area 11, seconda correzione della sera (11/09, 21:05): la riga «scarto reso<->logico» non misura un ritardo

Dopo aver scartato l'ipotesi del tappo del dt, ho costruito la sonda `ritardo-frame.mjs`: campiona DENTRO
la pagina a ogni fotogramma renderizzato (da Node il giro costa ~60 ms e a 16 fps se ne perde meta') e
voleva esprimere il ritardo in FOTOGRAMMI, un numero che non dipende dalla macchina.

La prima stesura ha dato «ritardo mediano 1,00 fotogrammi», che sembrava il numero cercato. **Era falso**:
il denominatore era la velocita' logica calcolata fra due fotogrammi consecutivi, e il pallone logico non
si muove a ogni fotogramma. Corretto il denominatore (velocita' fra due posizioni logiche DISTINTE), la
velocita' e' risultata 0,08 u/s — cioe' assurda. A quel punto invece di aggiustare ancora la formula ho
stampato i campioni grezzi.

**Quello che si vede (Vairo, seme 4242, 120 s di gioco, 1.452 fotogrammi in `playing`):**

| t (ms) | pallone RESO | pallone LOGICO |
|---|---|---|
| 59.707 → 60.253 | 52,86 · 54,03 (fermo) | 52,63 · 54,41 (fermo) |
| 60.315 | 52,86 · 54,02 | **54,43 · 54,41** (salta) |
| 60.808 | 59,26 · 65,40 | 54,43 · 54,41 |
| 61.501 | 57,35 · 56,54 | 54,43 · 54,41 |
| 62.365 | 55,47 · 55,29 | 54,43 · 54,41 |

**Posizioni logiche DISTINTE: 30 in 1.452 fotogrammi** (una ogni ~4 secondi), con un salto singolo massimo
di 36,28u. Il pallone reso intanto percorre continuamente escursioni di 5-11u.

**Conseguenza sullo strumento, non sul gioco.** `lx/ly` di `__CPM_WS` e' `props.ballX/ballY`, e quella
prop si aggiorna 30 volte in due minuti mentre il pallone reso si muove a ogni fotogramma. La distanza
fra i due NON e' quindi «di quanto il rendering e' indietro»: e' la somma di due cose diverse — il
rendering che insegue, e una prop logica che per secondi interi non e' stata riscritta. **La riga
«scarto reso<->logico, p90 <= 8u» della scheda da telefono sta misurando anche la seconda, e per questo
p90 12-28u convive con una mediana di 0,7-2,0u.**

Non scrivo nessun rimedio contro questo: e' la terza ipotesi della giornata sull'area 11 e le prime due
sono cadute. Quello che ho guadagnato e' che so dove guardare: prima di tornare a votare l'area 11 va
stabilito QUALE punto-palla logico e' la verita' (la prop React, o lo stato del motore letto da
`stato()`), e la sonda va ancorata a quello. Finche' non e' fatto, la riga «scarto» della scheda resta
nei numeri ma **non deve entrare nel voto**, esattamente come i salti.

#### Verifica della nota qui sopra (21:30) — e una rettifica alla nota stessa

La nota precedente diceva «una prop logica che per secondi interi non e' stata riscritta», che suona come
un difetto. **Ho verificato prima di lasciarla in piedi, e la formulazione era sbagliata.**

Sospetto legittimo: nella sonda `__CPM_MS()` non restituiva il minuto, quindi potevo aver misurato una
partita che non stava girando — e allora le «30 posizioni logiche» sarebbero state un artefatto mio.
Sonda di controllo (`rf-ck.mjs`, 120 s, un campione ogni 10 s):

| t | fase | righe di cronaca | pallone logico | pallone reso |
|---|---|---|---|---|
| +10 s | playing | 7 | 41,44 · 79,93 | 41,44 |
| +40 s | playing | 25 | 37,96 · 77,63 | 38,06 |
| +70 s | playing | 31 | 60,80 · 47,62 | 62,30 |
| +100 s | playing | 41 | 50,00 · 50,00 | 50,05 |
| +120 s | playing | 52 | 32,71 · 59,26 | 32,71 |

La partita gira (righe 7 -> 52 in 120 s) e il pallone logico si sposta in lungo e in largo. `__CPM_MS()`
esiste ed e' una funzione: e' il campo `min` che in questa sonda non c'e', un dettaglio dello strumento,
non della partita.

**La rettifica.** Le 30-37 posizioni logiche distinte in 120-150 s NON sono una prop stantia: sono
**una posizione per minuto simulato**, che e' esattamente la cadenza del motore (un tick = un minuto).
Fra due punti logici il pallone reso percorre un'intera azione, e lo fa a ogni fotogramma.

**Conseguenza, che e' piu' forte di quella di prima.** La riga «scarto reso<->logico, p90 <= 8u» confronta
un pallone disegnato con continuita' contro un punto logico che esiste una volta al minuto: il p90 di
12-28u non e' un ritardo di rendering ne' un difetto, e' **la distanza che il pallone copre dentro un
minuto simulato**. La banda «<= 8u» non ha mai avuto un fondamento. La riga resta nei numeri come
diagnostica, **non entra nel voto**, e la banda va riscritta o tolta.

Restano quindi da rifondare, prima di poter rivotare l'area 11, tutte e tre le sue colonne: lo scarto
(questa nota), i salti (misurano velocita' x intervallo di campionamento) e il ritardo del corpo (misura
il carico della macchina). Nessun rimedio scritto: quattro ipotesi in un giorno, quattro cadute, zero
tarature contro numeri non fondati.

### Area 11 — il primo strumento che regge (11/09, 23:35): «il pallone reso passa dal punto dichiarato?»

Smontate le tre colonne vecchie (scarto, salti, ritardo del corpo), la domanda che resta e' quella che
l'occhio del PO fa davvero: **il pallone che vedo passa dal punto in cui la simulazione dice che sta?**
Per ogni punto logico (uno per minuto simulato) si prende la distanza MINIMA della traiettoria resa in
quella finestra. Sonda `passa-dal-punto.mjs`, campionamento dentro la pagina a ogni fotogramma.

**v1 (minimo sui VERTICI campionati) — bocciata, e il rosso l'ha bocciata:**

| corsa | fps | fotogr./punto | punti | <= 3u | p90 | max |
|---|---|---|---|---|---|---|
| verde Vairo | 16 | 50 | 48 | 98 % | 0,4u | 9,4u |
| verde Galli | 12 | 29 | 50 | 82 % | 7,7u | 39,2u |
| **ROSSO `__CPM_NO870`** | 9 | **3** | 87 | **82 %** | 4,4u | 23,4u |

Rosso 82 % = verde Galli 82 %: **non discriminava**. L'ordine dei risultati seguiva i fotogrammi per
punto (50 -> 98 %, 29 -> 82 %, 3 -> 82 %), cioe' lo strumento, non la build.

**v2: la distanza si prende dalla SPEZZATA della traiettoria, non dai vertici** (punto-segmento). Due
corse a densita' diversa vedono allora lo stesso percorso.

| corsa | fps | fotogr./punto | punti | <= 3u | p90 | max |
|---|---|---|---|---|---|---|
| verde Vairo, macchina libera | 15 | 52 | 44 | **100 %** (44/44) | 0,0u | 1,5u |
| **verde Vairo SOTTO CARICO** (6 processi) | **8** | 30 | 45 | **98 %** (44/45) | 0,1u | 12,7u |
| **ROSSO `__CPM_NO870`** (motore spento) | 6 | 3 | 90 | **81 %** (73/90) | 5,2u | 25,7u |

**Verde 98-100 % contro rosso 81 %, e il verde regge il dimezzamento degli fps** (15 -> 8 fps: 100 % ->
98 %, p90 0,0 -> 0,1u). E' il primo metro dell'area 11 che separa una build buona da una cattiva senza
misurare la macchina.

**Quello che NON e' ancora provato, e va detto.** Il rosso gira a 3 fotogrammi per punto contro i 30-52
del verde: il controllo sul carico copre un fattore 2 di fps, non un fattore 10 di densita'. La
separazione 98/81 e' credibile ma non e' ancora al riparo da quel residuo. Serve un rosso che giri
DENSO quanto il verde prima di poter votare l'area 11 con questo numero.

Vale anche la nota di metodo della serata: il container di questa sessione si e' riavviato due volte
(19:24 e 22:52) uccidendo due catene lunghe. Da qui in avanti le misure si lanciano **una corsa alla
volta**, mai in catena da mezz'ora.

#### RITRATTAZIONE (23:55): anche la v2 e' confusa dalla densita'. Lo strumento non separa.

Mezz'ora fa ho scritto qui sopra «il primo metro dell'area 11 che separa una build buona da una cattiva»,
dichiarando come non provato il solo residuo di densita' (rosso a 3 fotogrammi per punto contro 30-52 del
verde). **Quel residuo non era un dettaglio: era tutta la separazione.**

Controllo, sugli STESSI fotogrammi grezzi del verde, tenendone 1 su N (i punti logici restano tutti; cambia
solo quanti fotogrammi resi li testimoniano):

| 1 fotogramma su | fotogr./punto | punti | <= 3u | p90 | max |
|---|---|---|---|---|---|
| 1 | 53 | 44 | **98 %** | 0,4u | 3,4u |
| 2 | 27 | 44 | 98 % | 0,6u | 3,4u |
| 4 | 14 | 44 | 95 % | 0,6u | 11,0u |
| 8 | 7 | 44 | 93 % | 0,6u | 11,0u |
| 16 | 4 | 44 | 91 % | 0,7u | 31,6u |
| 24 | **3** | 44 | **86 %** | 3,6u | 31,6u |
| 32 | 3 | 44 | **77 %** | 5,8u | 31,6u |

Il VERDE, diradato alla densita' del rosso, fa 86 % e 77 %: l'81 % del rosso ci sta in mezzo. **A densita'
pari verde e rosso non si distinguono.** La separazione 98/81 che avevo verbalizzato era la differenza fra
53 fotogrammi per punto e 3, non fra motore acceso e motore spento. Il controllo sul carico (verde a 8 fps
al 98 %) non bastava, perche' quel verde aveva comunque 30 fotogrammi per punto.

**La misura e' quindi revocata come discriminante.** Non entra nel voto dell'area 11 e non ci si tara
niente sopra. Quello che resta vero e' solo il numero del verde a piena densita', che e' comunque un fatto:
la traiettoria resa passa dai punti dichiarati con p90 0,4u e max 3,4u su 44 punti — ma senza un rosso
altrettanto denso non so dire se sia merito della build.

**Il vincolo strutturale, adesso chiaro.** Il rosso `__CPM_NO870` non PUO' essere denso: col motore spento
il gioco scrive il pallone logico il doppio delle volte (90 punti contro 44) e gira a 6 fps invece di 15,
quindi 3 fotogrammi per finestra sono il suo massimo. Un confronto verde/rosso su questa grandezza e'
impossibile per costruzione. Serve un rosso che tenga il motore acceso (stessa cadenza dei punti, stessi
fps) e rompa solo l'inseguimento del pallone reso: finche' non esiste, l'area 11 resta senza voto.

Sesta ipotesi della giornata sull'area 11, sesta caduta. Zero tarature scritte.

- 12/09 01:45 UTC (routine notturna): **Produzione allineata a 5f3313e (7.882.0)**, rituale completo verde
  sull'HEAD promosso (`career-critical` exit 0 in 561 s, `npm run ci` exit 0 in 1264 s, working tree
  pulito, IDENTICO 1, gate 191 Situations su gameVersion 7.882.0, guardiano `partita-vera` verde).
  Fast-forward 179c3db → 5f3313e su `main` e sul branch QA. Porta in produzione la 7.882 (la seconda voce
  ricorda cosa ha detto: frasi diverse 69 → 94 %, la piu' ripetuta 4x → 2x, misura appaiata `__CPM_NO882`)
  e i verbali di misura della notte, fra cui la ritrattazione dello strumento dell'area 11.
  NON verificato: l'Android del PO (tutto e' Chromium 412x915 headless a 12-23 fps); la CI di GitHub su
  main non e' leggibile da questa sessione. Il metro del PO NON e' raggiunto: scheda n° 13 media 7,1
  contro un cancello di 8 con nessuna area sotto 7 (l'area 11 resta a 5 e senza strumento valido).

## 7.883 REVOCATA (12/09 02:15) — riempire l'area toglie gli uomini dalla fascia

**Il difetto, misurato al banco (16 partite da 92 tick, `cross-banco.mjs`):** il cross in gioco aperto
esce **0,38 volte a partita** (10 cross totali, 4 da corner). La causa NON e' la probabilita' del cross:
la condizione che il motore richiede (portatore ad avanzamento >= 72 e largo) ricorre **2,81 volte a
partita**, ma in **27 casi su 45 (60 %)** non c'e' un solo compagno che soddisfi la condizione di
ricevente (avanzamento >= 78 dentro il corridoio centrale) — e questo benche' il compagno piu' avanzato
stia in media ad avanzamento **82,6**. 45 x 40 % x 0,55 = 10 cross su 16 partite: l'aritmetica del
difetto chiude esattamente sulla misura, quindi il censimento e' giusto.

La causa e' la traslazione della 7.876: il blocco si sposta verso la y della palla, quindi quando il
pallone va largo la squadra lo SEGUE sulla fascia invece di attaccare i pali.

**Il rimedio scritto (7.883):** palla avanzata e larga -> le punte e le mezzali attaccano primo palo,
secondo palo e dischetto. Nessuna probabilita' toccata: solo il movimento.

**Il rimedio peggiora la sua stessa misura, misura appaiata al banco:**

| | cross in gioco aperto | la condizione ricorre | riceventi 0 |
|---|---|---|---|
| rosso `__CPM_NO883` | **0,50** a partita | 3,31 a partita | 24/53 (45 %) |
| verde 7.883 | **0,19** a partita | **1,88** a partita | 14/30 (47 %) |

Mandando punte e mezzali dentro l'area si **svuota la fascia**: il portatore si trova largo e avanzato
molto meno spesso (la condizione del cross scende da 3,31 a 1,88) e i cross calano. Ho spostato in area
proprio gli uomini che avrebbero crossato. Sorgente riportato allo stato della 7.882.

**Quello che resta, e vale per il prossimo tentativo:** chi attacca l'area non puo' essere chi tiene la
fascia. Il riempimento deve venire dal LATO OPPOSTO (il quinto e la punta lontana dal pallone) e dalle
mezzali, lasciando intatto chi sta sul lato della palla. E la misura giusta e' la coppia «quante volte la
condizione ricorre» + «quante volte c'e' un ricevente», non il solo conteggio dei cross.

## 7.883 v2 SUL BRANCH — l'area la riempie chi sta dal lato opposto al pallone

### Prima: la revoca della v1 era sbagliata, e lo era per colpa del mio strumento

Un'ora fa ho revocato la 7.883 v1 scrivendo che «riempire l'area toglie gli uomini dalla fascia», con
tanto di tabella (rosso 0,50 · verde 0,19). **Quei numeri erano rumore.** La sonda `cross-banco.mjs`
sorteggiava i gol decretati con `Math.random()`: due corse **dello stesso identico codice** davano 0,50
e 0,19 cross in gioco aperto. Me ne sono accorto perche' il ROSSO — che e' la build di base — e' passato
da 0,50 a 0,19 fra due misure.

Sonda resa ripetibile (generatore con seme fisso; verificato: due corse, numeri identici) e portata a 48
partite. **Rimisurato tutto:**

| build | cross in gioco aperto | la condizione ricorre | occasioni SENZA ricevente |
|---|---|---|---|
| rosso `__CPM_NO883` (base) | 0,31 a partita | 3,15 a partita | 88/151 = **58 %** |
| v1 (area riempita da entrambi i lati) | 0,35 | 3,21 | 75/154 = **49 %** |
| **v2 (solo dal lato opposto)** | **0,48** | 3,19 | 66/153 = **43 %** |

La v1 **non svuotava un bel niente** (la condizione resta 3,21 contro 3,15) e non peggiorava i cross.
La revoca era sbagliata e la sua spiegazione — quella della fascia svuotata — era un racconto costruito
su due cifre casuali. A verbale come lezione 24ª: **una misura appaiata non vale nulla se il rosso e il
verde non vedono lo stesso mondo**; prima di leggere due colonne, si fa girare la stessa colonna due
volte.

### Il rimedio spedito (v2)

Palla avanzata (avanzamento >= 70) e larga (|y-50| >= 20): le punte e le mezzali che partono **dal lato
opposto al pallone** attaccano il secondo palo e il dischetto; chi sta sul lato della palla non si muove.
Nessuna probabilita' toccata: e' solo movimento, e il lato del cross resta popolato.

Risultato: **cross in gioco aperto 0,31 -> 0,48 a partita (+55 %)** con la condizione del cross intatta
(3,15 -> 3,19) e le occasioni senza nessuno in area **58 % -> 43 %**.

**Dichiarato, non risolto:** 0,48 a partita resta lontanissimo da una partita vera (una quindicina). Il
collo di bottiglia che resta e' a monte — la condizione stessa ricorre solo 3,2 volte a partita, cioe'
il portatore arriva di rado sul fondo. E' la nota aperta «la squadra non sale», e non si chiude con il
movimento in area. `test:logic` verde, build IDENTICO 1; guardiano e rituali ancora da girare.

- 12/09 04:25 UTC: **Produzione allineata a 8fdb8b6 (7.883.0)**, rituale completo verde sull'HEAD promosso
  (`career-critical` exit 0 in 556 s, `npm run ci` exit 0 in 1253 s, gate 191 Situations su gameVersion
  7.883.0, guardiano `partita-vera` verde, working tree pulito, IDENTICO 1). Fast-forward 5f3313e →
  8fdb8b6 su `main` e sul branch QA, mai force. Porta la 7.883 v2 (l'area la riempie chi sta dal lato
  opposto al pallone: cross in gioco aperto 0,31 → 0,48 a partita, occasioni senza ricevente 58 → 43 %)
  e la correzione della revoca sbagliata della v1, che poggiava su una sonda non ripetibile.
  NON verificato: l'Android del PO; la CI di GitHub su main. Metro del PO non raggiunto (scheda n° 13
  media 7,1 contro 8); la 7.883 non e' ancora passata da una scheda da telefono.

## 7.884 SUL BRANCH — il tiro guarda l'angolo (e la squadra arriva sul fondo)

**La nota aperta «la squadra non sale» chiusa con i numeri, e la causa non e' la posizione: e' la
decisione.** Sonda `sale-banco.mjs` (48 partite, ripetibile): che cosa fa il portatore, banda per banda
di avanzamento.

| banda | decisioni | i rami |
|---|---|---|
| 60-69 | 542 | controllo 35 % · passa 18 % · **conduci 16 %** · tiro 5 % |
| 70-79 | 304 | controllo 25 % · **tiroGol 20 % + tiro 15 % = 35 % TIRI** · conduci 10 % |
| 80-89 | 102 | controllo 28 % · tiroGol 19 % · tiro 13 % · conduci 7 % |
| 90+ | **11** | fallo 36 % · tiro 18 % · controllo 18 % |

Appena il portatore supera avanzamento 70, **un terzo delle sue decisioni e' un tiro** e la conduzione
crolla. Oltre 90 ci arriva **11 volte in 48 partite**. La squadra non e' che non sale: SMETTE DI SALIRE
perche' tira.

**E la ragione sta in una riga:** `pTiro = area 0,85 · limite 0,45 · trequarti 0,12` e' un sorteggio
piatto per zona che **non guarda dove si e'**. Un esterno a y=20, con la porta di taglio, tira comunque
45 volte su 100. E' lo stesso difetto che il PO chiama «tiro da distanza enorme» e «6 conclusioni su 9
da fuori area».

**Il rimedio: si aggiunge la grandezza che mancava, non si abbassa una costante.** Fuori dall'area, la
probabilita' di tirare scende con la larghezza: dentro il corridoio centrale (|y-50| <= 12) nulla cambia,
poi cala fino a un dodicesimo sul fondo. Dal fondo non si tira: si mette in mezzo o si rientra.

**Misure appaiate (rosso `__CPM_NO884`, 48 partite, sonde ripetibili):**

| | rosso | verde 7.884 |
|---|---|---|
| decisioni a 70-79 che sono tiri | **35 %** | **23 %** |
| decisioni a 90+ (in 48 partite) | **11** | **22** |
| cross in gioco aperto | 0,48 a partita | **0,81** |
| la condizione del cross ricorre | 3,19 a partita | **4,08** |
| decreti segnati | 92 % | **94 %** (attesa mediana 7 tick in entrambi) |

Il decreto non regredisce: il tabellone resta della simulazione.

**Due errori dello strumento, intercettati stanotte e a verbale.** (1) `banco-motore.mjs` IGNORA la
variabile del rosso (passa `window` come `undefined`): i «rossi» che avevo letto da li' erano verdi.
(2) Anche quella sonda usa `Math.random()` e non e' ripetibile (16, 10, 18, 14 decreti fra corse
identiche): l'allarme «decreti all'82 %» che ne avevo tratto non valeva nulla. Le misure qui sopra
vengono tutte da sonde con seme fisso, verificate ripetibili.

**Non ancora verificato:** guardiano, rituali e scheda da telefono sulla 7.884.
