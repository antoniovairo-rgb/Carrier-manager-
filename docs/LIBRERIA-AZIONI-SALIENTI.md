# LIBRERIA DELLE AZIONI SALIENTI — grammatica a moduli, branching, contesto

Direttiva PO (29/08, REQUISITO CRITICO): *«NON una piccola lista di template riciclati…
se dopo 3-4 partite il giocatore riconosce gli stessi schemi, il sistema ha FALLITO»*.
Requisiti: NUMEROSE + BEN PROGETTATE + CAUSALI + CONTESTUALI + VARIABILI + CONSEQUENZIALI +
NON RIPETITIVE.

Questo documento SOSTITUISCE l'impianto «catalogo di schede chiuse» (le 30 schede di
`CATALOGO-AZIONI-SALIENTI.md` non muoiono: diventano le **sequenze firmate**, il livello raro
della libreria — vedi §7). Il cuore del sistema diventa una **grammatica componibile**:
l'azione non è un template pescato, è una FRASE costruita con moduli calcistici scritti a mano,
concatenati da regole di continuità e chiusa da un esito a branching. È l'attuazione della
FASE 2 (event grammar) della roadmap, portata al livello che il PO chiede.

## 1 · L'anatomia di un'azione (la frase calcistica)

Ogni azione saliente è: **SITUAZIONE → SVILUPPO (1-3 moduli) → SNODO → FINALIZZAZIONE → ESITO
→ CONSEGUENZA**.

- **SITUAZIONE (innesco)**: da dove nasce — sempre dalla cronaca in corso, mai dal nulla
  (scena del direttore, palla inattiva fischiata, errore, recupero).
- **SVILUPPO**: 1-3 moduli concatenati (una triangolazione, un cambio gioco, una conduzione…).
- **SNODO**: il momento di tensione in cui c'è una DECISIONE con alternative vere (l'eroe può
  tirare o servire; l'esterno può crossare o rientrare) — la scelta dipende da contesto e
  branching, non è cablata.
- **FINALIZZAZIONE**: il gesto che chiude (tiro, cross+attacco area, dribbling in area…).
- **ESITO**: a branching (§4) — mai dichiarato prima, deciso dal budget del microsim quando
  c'è un gol in palio, dal contesto altrimenti.
- **CONSEGUENZA**: ogni esito lascia una traccia che la cronaca raccoglie (corner da giocare,
  contropiede avversario, punizione conquistata, fiducia/rapporti aggiornati).

Vincolo di qualità BY CONSTRUCTION: due moduli si concatenano SOLO se compatibili per **zona**
(dove finisce l'uno inizia l'altro — o il viaggio è dichiarato), **possesso** e **attori**
(chi ha la palla alla fine del modulo è chi apre il successivo). Il «pallone che passa di mano
senza motivo» è grammaticalmente impossibile, non solo sconsigliato.

## 2 · L'inventario dei moduli (tutti scritti a mano, beat per beat)

Ogni modulo è una mini-scheda: 1-3 beat di cronaca, ruoli, zona IN → zona OUT, condizioni
d'uso, ganci per l'eroe. Le categorie sono quelle chieste dal PO. Inventario iniziale:
**57 moduli** (elenco; ogni modulo avrà la sua scheda completa prima del codice).

**COSTRUZIONE (8)** — C1 costruzione dal basso a tre · C2 uscita dalla pressione (il palleggio
sotto pressing che libera) · C3 possesso prolungato (la cronaca conta i passaggi) · C4 cambio
gioco lungo · C5 combinazione centrale di prima · C6 sviluppo laterale terzino-esterno ·
C7 retropassaggio e nuova costruzione (il pubblico mugugna, la squadra ricomincia) ·
C8 salita del centrale palla al piede.

**ATTACCO CENTRALE (8)** — A1 triangolazione stretta · A2 uno-due e via · A3 filtrante fra le
linee · A4 verticalizzazione del regista · A5 inserimento della mezzala · A6 combinazione
centrocampista-attaccante (sponda e restituzione) · A7 palla nello spazio dietro la linea ·
A8 attacco della profondità a due (velo incluso).

**FASCE (8)** — F1 sovrapposizione classica · F2 uno contro uno dell'esterno · F3 doppia
combinazione sull'out (dai-e-vai col terzino) · F4 cross basso teso · F5 cross alto sul
secondo palo · F6 pull-back arretrato · F7 cambio fascia e attacco del lato debole ·
F8 conduzione interna a rientrare (il mancino sulla fascia destra).

**TRANSIZIONI (7)** — T1 contropiede lungo campo · T2 recupero alto (pressing che strappa palla)
· T3 ripartenza dopo intercetto del mediano · T4 transizione dopo corner difeso · T5 punizione
del contropiede dopo palla persa NOSTRA (subita) · T6 attacco dello spazio ai lati del centrale
saltato · T7 rilancio immediato del portiere dopo la presa.

**DUELLI (8)** — D1 dribbling riuscito · D2 dribbling fermato · D3 contrasto vinto/perso ·
D4 duello fisico spalla a spalla in corsa · D5 duello aereo · D6 protezione palla sotto
pressione · D7 fallo subito (punizione conquistata) · D8 fallo commesso (punizione contro,
ammonizione se il contesto la pesa). Ogni duello aggiorna il registro rivalità (aggancio
EROE PROTAGONISTA).

**FINALIZZAZIONE (10)** — Z1 tiro dalla distanza · Z2 tiro dopo combinazione · Z3 tiro di
prima sul cross · Z4 conclusione dopo dribbling · Z5 colpo di testa · Z6 tiro ravvicinato
d'istinto · Z7 conclusione respinta → seconda palla viva · Z8 legno (palo/traversa) ·
Z9 grande parata · Z10 gol (con la famiglia di celebrazioni contestuali). NB: Z7-Z10 sono
anche ESITI dei branch (§4): un'azione può attraversarli.

**PALLE INATTIVE (8)** — P1 punizione diretta · P2 punizione indiretta con schema · P3 schema
da punizione laterale · P4 corner corto · P5 corner sul secondo palo · P6 corner arretrato per
il tiro dal limite · P7 mischia · P8 rigore (staging 7.657: area vuota, solo battitore e
portiere). Ancoraggio obbligatorio: partono SOLO da un fischio già raccontato.

**EROE — ganci di ruolo (11)**: non moduli a parte ma SLOT che ogni modulo dichiara:
protagonista · creatore · finalizzatore · assist-man · recuperatore · uomo-ripartenza ·
uomo-duello · autore dell'errore · uomo della reazione · decisivo in fase difensiva ·
decisivo in fase offensiva. Lo stato narrativo decide quando l'eroe occupa lo slot; l'errore
e la reazione sono slot come gli altri (l'eroe non è sempre in copertina, e quando sbaglia
la partita se lo ricorda).

## 3 · Le condizioni d'uso (il contesto comanda)

Ogni modulo dichiara le sue precondizioni sui campi dello stato (quelli della proposta
EROE PROTAGONISTA §1): minuto · risultato · zona · possesso · modulo tattico · stile · fase
della partita · situazione tattica (blocco basso? pressing?) · stato squadra (morale, dominio)
· stato eroe · eventi recenti · avversari coinvolti · duelli/rivalità attive. Esempi normativi:

- C3 (possesso prolungato) esce solo con dominio ≥ +1 e mai sotto di due gol al 85';
- T1 (contropiede lungo) richiede noi bassi e avversario sbilanciato (scena di pressione loro);
- Z1 (tiro da fuori) pesa ×3 contro blocco basso dichiarato, ×0 se l'area è aperta;
- D8 (fallo commesso) pesa di più se il duello con quell'avversario è già teso;
- P4 (corner corto) solo se lo stile prevede palleggio, e mai due volte di fila.

La stessa struttura è appropriata in un contesto e fuori luogo in un altro: il selettore
DEVE rifiutare moduli fuori contesto anche a costo di un'azione più semplice.

## 4 · Branching: la stessa struttura non finisce mai uguale

Ogni FINALIZZAZIONE dichiara la sua **tabella di esiti** con pesi contestuali. Esempi:

- **cross in area** (F4/F5) → colpo di testa a rete · respinta del centrale → seconda palla ·
  tiro al volo · deviazione in corner · fallo in attacco · uscita del portiere ·
  contropiede avversario dalla respinta · GOL;
- **dribbling dell'eroe** (D1/D2) → supera e prosegue · fermato dal contrasto · fallo
  conquistato (→ P1/P3) · palla persa (→ T5 contropiede subito) · superiorità creata e
  scarico al compagno · raddoppio avversario e cambio soluzione (lo snodo decide);
- **tiro** (Z1-Z6) → gol · parata semplice · GRANDE parata (→ corner) · legno (→ seconda
  palla o rinvio) · murato (→ mischia o ripartenza) · fuori (con la misura del quasi).

Regole dure: il GOL entra nella tabella SOLO se il budget del microsim lo ordina (autorità
intoccabile); gli altri esiti si pesano sul contesto; l'esito non è MAI annunciato prima
(regola di credibilità 3); ogni esito nomina la sua CONSEGUENZA e la cronaca la raccoglie
(l'azione non si chiude in un applauso generico).

## 5 · Anti-ripetizione sulla STRUTTURA (non sulle frasi)

La **struttura** di un'azione è la sua firma: `categoria + sequenza di moduli + zona + esito`
(es. `T2→A4→D1→Z4|dx|parata`). Il registro memorizza per ogni azione eseguita: categoria,
struttura, partecipanti, zona, esito, modalità (variante), minuto, partita. Regole:

1. stessa STRUTTURA mai due volte nella stessa partita;
2. penalità decrescente sulle strutture usate nelle ultime 3 partite (peso ×0,15 / ×0,4 / ×0,7);
3. penalità sul PREFISSO (stessi primi due moduli) entro la stessa partita: anche l'attacco
   della frase deve variare, non solo la coda;
4. bonus alle categorie meno usate di recente (il selettore spinge la varietà, non la subisce);
5. il registro persiste nel save (quando possibile, come chiede il PO): il déjà-vu si combatte
   sulla carriera, non solo sui 90 minuti.

## 6 · Comune, raro, eccezionale (la distribuzione realistica)

Ogni struttura eredita una **classe di frequenza** dal suo modulo più raro:

- **COMUNI** (~60% delle salienti): costruzioni, sviluppi, duelli ordinari, tiri — il tessuto.
- **MENO FREQUENTI** (~30%): schemi su palla inattiva, pull-back, cambi gioco che pagano.
- **RARE** (max 1-2 a partita): legni, doppie parate, ripartenze lungo campo, le sequenze
  firmate del catalogo (§7).
- **ECCEZIONALI** (max 1, non ogni partita, legate a condizioni speciali): punizione perfetta,
  gol del portiere avversario battuto dal pressing, la prodezza avversaria senza colpe,
  la rovesciata (solo col gesto già collaudato e col piede verso la porta).

Non tutto è spettacolare: la rarità è ciò che dà valore ai momenti veri. Il selettore ha
tetti per classe, non solo pesi.

## 7 · Le sequenze firmate (il catalogo esistente trova il suo posto)

Le 30 schede di `CATALOGO-AZIONI-SALIENTI.md` restano come **frasi d'autore già composte**:
strutture curate a mano che il selettore tratta come strutture di classe rara/meno frequente,
soggette alle stesse regole di contesto e anti-ripetizione. La libreria a moduli genera il
tessuto; le firmate sono i pezzi pregiati che ogni tanto lo attraversano.

## 8 · Integrazione nella partita (mai mini-scene scollegate)

Flusso obbligato: cronaca normale → scena del direttore (possesso/sviluppo) → situazione
interessante (l'innesco È una riga di cronaca già emessa) → azione saliente → esito →
CONSEGUENZA raccontata → ritorno alla cronaca. Contratti:

- se l'azione conquista una punizione, la PROSSIMA situazione è quella punizione (P1-P3);
- se l'eroe perde palla e nasce il contropiede, la cronaca racconta il contropiede (T5) e
  il suo esito — la colpa ha un seguito, non svanisce;
- se l'eroe serve l'assist, il rapporto con quel compagno cambia (stato narrativo) e le
  combinazioni fra i due pesano di più nel resto della partita;
- l'highlight 3D dell'eroe si aggancia allo SNODO o alla FINALIZZAZIONE della sua azione,
  ereditando zona, avversario e contesto (mai un HL fuori dal racconto).

## 9 · Quanta varietà genera (il conto, da verificare col metro)

57 moduli, catene di 2-5 moduli sotto regole di compatibilità: MISURATO con
`tools/enumera-strutture.mjs` sulle schede complete (MODULI-AZIONI-SALIENTI.md): **418
sequenze valide, 587 con le corsie speculari**; varianti e branch moltiplicano le
realizzazioni in migliaia.
Con ~5 salienti a partita, l'anti-ripetizione strutturale (§5) e i tetti di classe (§6),
il criterio del PO — *«quante azioni realmente diverse prima che il giocatore riconosca i
pattern?»* — si misura così:

## 10 · Metri d'accettazione (il DONE della libreria)

- **Metro déjà-vu (il criterio del PO)**: su 4 partite consecutive sonda, ZERO strutture
  ripetute; su 10 partite, nessuna struttura più di 2 volte e nessun prefisso dominante
  (>20% delle azioni).
- **Copertura**: su 10 partite, tutte le 7 categorie escono; almeno il 60% dei moduli usato
  almeno una volta.
- **Causalità**: 100% delle azioni con catena zona/possesso/attori continua (validatore di
  grammatica automatico, gira nel gate); zero «apparizioni» (giudice di fondatezza).
- **Branching vivo**: la stessa struttura eseguita più volte su 10 partite mostra esiti
  diversi (metro sul registro: nessuna struttura con esito costante se eseguita ≥3 volte).
- **Conseguenze**: 100% degli esiti con conseguenza dichiarata e raccolta dalla cronaca
  entro 2 battute (metro sul registro eventi).
- **Contesto**: campionario — per ogni azione, le precondizioni del primo modulo erano vere
  al minuto d'innesco.
- **Distribuzione**: classi di frequenza rispettate (comuni 50-70%, rare ≤2/partita,
  eccezionali ≤1 e non in partite consecutive).
- **Autorità del punteggio**: gol SOLO da budget microsim (invariante, già a guardiano).
- Collaudo PO: due partite consecutive devono sembrargli DIVERSE — il giudice finale resta lui.

## 11 · Ordine di consegna

1. **L1** — schede complete dei 57 moduli (beat, zone, condizioni, branch) in questo documento
   → passaggio del PO;
2. **L2** — motore di composizione (grammatica + validatore di continuità) con registro
   `__CPM_LIB` e metri, DIETRO flag: la partita non cambia finché i metri non sono verdi;
3. **L3** — selettore contestuale + anti-ripetizione strutturale + classi di frequenza;
4. **L4** — branching degli esiti + conseguenze raccolte dalla cronaca;
5. **L5** — accensione al posto del piano-gol attuale (che ne diventa un caso), sequenze
   firmate incluse; rituale + guardiano estesi;
6. **L6** — aggancio EROE PROTAGONISTA (slot, duelli, rapporti) secondo la proposta già
   consegnata.
