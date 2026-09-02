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
