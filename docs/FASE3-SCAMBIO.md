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
