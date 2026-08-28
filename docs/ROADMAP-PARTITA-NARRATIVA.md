# ROADMAP — PARTITA NARRATIVA CREDIBILE

Direttiva PO (28/08): la «partita vera» come simulazione completa è una missione FALLITA e va
abbandonata. Il nuovo obiettivo: il giocatore VIVE la partita attraverso CRONACA TESTUALE →
AZIONI SALIENTI → HIGHLIGHTS DELL'EROE. Criterio di successo: *«leggendo la cronaca e vedendo
gli highlights dell'eroe, il giocatore crede di aver appena vissuto una vera partita»*.

## Perché la vecchia direzione è fallita (i numeri, non le impressioni)

Le ultime 48 ore l'hanno dimostrato quantitativamente:
- **Il budget dei tick non basta per simulare E raccontare**: una partita ha ~86-90 tick di
  cronaca; con le costruzioni dei gol serializzate se ne andavano 34-50, col kickoff 6-19, col
  contropiede fino a 26 — misurato `ok:3-8` tick liberi su 86 (TICKBLK): l'arbitro e il
  repertorio morivano di fame. Tre rossi del guardiano in 24h, ognuno curato in un punto
  riapriva una falla altrove (fischi 3<6 → tetto corto → gol scritti a 41-57u dalla porta).
- **Il pallone «fisico» ambientale è conteso da 31 scrittori** (censimento a 5 letture,
  §DECISIONE in SPRINT-PARTITA-VERA.md): ogni nuova mano (portatore, sosta, coda consegne,
  ballLag) aggiungeva coerenza in un punto e attrito in due.
- **La convergenza era asintotica**: 30+ release di tarature (passi, tetti, corridoi, fasce)
  con metriche in banda e percezione del PO invariata («non è calcio»).

## Cosa si SALVA (il fallimento non è tutto da buttare)

| Pezzo | Dove | Ruolo nel nuovo motore |
|---|---|---|
| `setTurn616` writer unico del possesso con causa | src/14 r.~1145 | il possesso come stato NARRATIVO — resta il fondamento |
| Le «macchine» (arbitro/piazzati/catena/contropiede/kickoff/ponte) | src/14, sito righe | embrioni di sequenze: diventano PRODUZIONI della grammatica |
| `pendingGoal` «azione a esito noto» | src/14 r.~2440 | il pattern giusto (sequenza verso un esito), liberato dalla geometria |
| Microsim = autorità del PUNTEGGIO | src/11 `bgMicroTick` | INTOCCABILE (carriera/salvataggi): i suoi gol diventano scene obbligate |
| Guardiano + metri + rituale 8 passi + testimoni `__CPM_*` | tests/visual | l'accettazione automatica resta e si ESTENDE alle bande narrative |
| Anagrafe: nomi veri sui 21 + ruoli `rl` (7.641) | src/14 r.~366 | i protagonisti degli eventi |
| Giudice «fondate» (riga che dichiara un fatto ≠ fatto avvenuto) | sonda fondate-558 | diventa banda di FASE 5 |
| Lezioni misurate | diario 7.5xx-7.6xx | cadenza righe ~1/5-8' di gioco; repertorio poss 27:2; 107 righe mute; ecc. |

## Cosa si ABBANDONA

- La fisica ambientale come fonte di verità del racconto: ballTarget conteso, ballLag, marce a
  u/tick, elezione geometrica del portatore, tetti/passi/corridoi come leva del realismo.
- Il 3D ambientale resta come SFONDO plausibile (22 sagome in movimento) ma NON comanda e NON
  vincola più la cronaca; nessuna nuova vite di taratura su di esso.
- Il wip «7.647 tetto dinamico» (mai committato): revertito il 28/08 alla ricezione della
  direttiva.

## LE FASI

### FASE 0 — Audit e chiusura dell'approccio fallito (0,5 g — in gran parte GIÀ FATTA)
- Attività: censimento di ciò che il nuovo motore consuma/sostituisce (fatto: §DECISIONE + le
  misure di questa sessione); baseline numerica del registro MATCH_EV su 3 realizzazioni
  (fatta: metro golback644b); revert del wip (fatto); NIENTE rimozioni distruttive — il flusso
  attuale resta vivo finché il nuovo non lo sostituisce pezzo per pezzo, con i rossi `NO*`.
- DONE quando: questa roadmap è nel repo; baseline archiviata; repo pulito su release verde.

### FASE 1 — Modello narrativo della partita (1 g)
- Un DIRETTORE DI PARTITA (pacing): stato narrativo {fase: quiete/costruzione/pressione/
  transizione/attacco/palla-inattiva/reazione, possesso, ritmo, momentum} che decide la
  prossima SCENA (1-4 minuti) in base a contesto, tattiche e agli obblighi del microsim (un
  gol rollato al minuto X = scena d'attacco obbligata che si chiude a X). Le fasi TRANQUILLE
  sono cittadine di prima classe: il direttore le programma, non le subisce.
- DONE quando: registro `__CPM_SCENE` su 90': sequenza di scene leggibile e sensata (campione
  validato a mano), quiete presente in banda dichiarata, gol del microsim tutti onorati al
  loro minuto ±2, guardiano attuale ancora verde.

### FASE 2 — EVENT GRAMMAR e catene causali (2 g) — IL CUORE
- La grammatica: produzioni (stile BNF) sugli eventi del calcio. Ogni evento porta
  {situazione, protagonista (nome VERO dal roster/21), coinvolti, zona ASTRATTA (terzo ×
  corsia — mai coordinate fini), gesto, esito, conseguenza, link al successivo}. Ogni scena
  della FASE 1 si espande in una catena: `recupero → verticalizzazione → contropiede → cross
  → respinta → tiro` è UNA produzione, non un sorteggio di righe.
- Le macchine esistenti rifluiscono come produzioni (l'arbitro produce `fallo → punizione`,
  i piazzati `corner → mischia → tiro`, la catena le combinazioni).
- Determinismo: solo hashStr/flussi seedati (replay-safe, invariante 7.511 conservato).
- DONE quando: 90' generano 80-120 eventi concatenati; metro «causalità»: il 100% degli eventi
  non iniziali ha il predecessore dichiarato (zero orfani); 10 catene estratte a caso e
  validate a mano; il pallone nel registro non «appare» mai (zona evento N+1 raggiungibile
  dalla zona evento N o giustificata dal gesto — lancio, cross, rinvio).

### FASE 3 — Varietà delle situazioni calcistiche (1 g, parallelizzabile con F4)
- Tutte le famiglie della lista PO come produzioni: passaggi corti, appoggi, retropassaggi,
  triangolazioni, cambi gioco, filtranti, verticalizzazioni, cross, conduzioni, dribbling,
  contrasti, intercetti, recuperi, errori, deviazioni, respinte, duelli aerei, tiri, parate,
  falli, punizioni, corner, rigori, rimesse, contropiedi, seconde palle, mischie.
- Pesi CONTESTUALI (per fase narrativa), mai distribuzione piatta.
- DONE quando: metro distribuzione su 90' × 3 realizzazioni: bande realistiche dichiarate e
  rispettate (falli 18-30, corner 6-12, rimesse 14-26, tiri totali 8-22, …), zero famiglie
  mute, quota di eventi «respiro» misurata in banda.

### FASE 4 — Tattiche percepibili (0,5-1 g, parallelizzabile con F3)
- Modulo/stile → pesi delle produzioni: possesso→combinazioni e circolazione; diretta→
  verticalizzazioni e palle lunghe; fasce→sovrapposizioni e cross; contropiede→transizioni;
  difesa bassa→ripartenze concesse. I 4 pomelli TRAMA_ID esistenti si riusano.
- DONE quando: misura appaiata — stessa partita, stili opposti → le distribuzioni di famiglie
  differiscono nel verso giusto e in modo statisticamente netto (dichiarato il metro prima).

### FASE 5 — Cronaca testuale (1,5 g)
- INVERSIONE DEL COMANDO: le righe RENDONO gli eventi (template con slot: protagonista, zona,
  gesto, esito) — oggi la pesca comanda il campo, domani la grammatica comanda la pesca. Le
  223 righe si riscrivono/mappano come render; le 107 «mute» o diventano render di eventi
  respiro o muoiono. Ritmo di LETTURA (righe per minuto reale) con enfasi sugli importanti;
  campionamento: non ogni passaggio, MAI un fatto non avvenuto.
- DONE quando: fondatezza 100% (giudice fondate: zero righe smentite); ritmo in banda; varietà
  (niente ripetizioni ravvicinate); il feed di una partita intera letto da cima a fondo regge
  come racconto (collaudo a campione).

### FASE 6 — Sistema di azioni salienti (0,5-1 g)
- Il direttore marca le scene con punteggio d'importanza; la lista PO (gol, assist, grande
  occasione, tiro pericoloso, parata importante, palo/traversa, dribbling decisivo, passaggio
  decisivo, recupero importante, fallo importante, punizione pericolosa, rigore, corner
  pericoloso, grande giocata dell'eroe) definisce le classi.
- DONE quando: 6-12 salienti per 90', tutti riferiti a eventi realmente generati; ogni gol è
  saliente CON la sua catena alle spalle; il feed «momenti chiave» li mostra coerenti.

### FASE 7 — Highlights dell'eroe (2 g)
- Gli HL dell'eroe consumano la SEQUENZA saliente: se la cronaca dice «riceve → dribbla →
  segna», la scena 3D mostra ricezione, dribbling, tiro — mappa evento→gesto sul canale MP-0
  esistente (l'uomo giusto calcia già). Il calendario HL cede il posto ai salienti dell'eroe
  (+ ritmo di regia). L'ambiente 3D è sfondo: nessuna pretesa di simulazione.
- Le note storiche del collaudo PO (007 camera, 113 doppio gesto del portiere, marcatore
  girato, 001 apertura) diventano il COLLAUDO di questa fase, sulla scena eroe.
- DONE quando: metro coerenza cronaca↔scena su 20 HL (gesto mostrato = gesto dichiarato,
  protagonista giusto, esito giusto); zero 007 su 20 scene; leggibilità (taglia di produzione
  ≥0,15); reveal mai prima del gesto.

### FASE 8 — Stabilità e rifinitura (1 g)
- Guardiano ESTESO: bande su causalità (F2), distribuzioni (F3), fondatezza (F5), salienti
  (F6), coerenza HL (F7) — le vecchie bande restano finché sensate, mai allentate per un
  rosso. Pulizia dei flag `NO*` morti e del codice sostituito (solo quando il nuovo è verde
  da 2+ release).
- DONE quando: rituale esteso verde su 3 semi; nessun testimone orfano.

### FASE 9 — Test completi di partite (1 g)
- Tre partite intere «da spettatore» (il collaudo R6): cronaca letta per intero, salienti
  guardati, HL eroe guardati; 3 realizzazioni × 2 semi; rituale completo + carriera; collaudo
  PO dal telefono sulla build candidata.
- DONE quando: il PO dichiara il criterio di successo raggiunto o apre note NUOVE (non
  ripetizioni delle vecchie classi).

## Dipendenze e parallelismo

```
F0 → F1 → F2 → { F3 ∥ F4 } → F5 → F6 → F7 → F8 → F9
                 (F5 può partire in overlap su F2 stabile; F3/F4 con agenti in parallelo)
```

## Stima e tappe di collaudo

- Totale: ~9-11 giorni → dentro la deadline (~10/09) con margine di rifinitura.
- **Prima build collaudabile per il PO: dopo FASE 5 (~1-2/09)** — cronaca nuova completa su
  motore narrativo, HL ancora vecchi. Seconda build: dopo FASE 7 (~5-6/09).
- Ogni release intermedia: piccola, rituale completo, rosso di prova, misura appaiata,
  annuncio «Pushato — CPM x.y.z» + notifica.

## Regole invariate (di perimetro e di metodo)

- Il microsim resta l'autorità del punteggio: ZERO REGRESSIONI su carriera, salvataggi,
  classifiche, mercato.
- MAI: VAR, replay, autogol, gestione dell'allenamento — nemmeno nelle evoluzioni future.
- Numeri, non impressioni; ogni rimedio col suo rosso e la sua misura; dichiarare sempre il
  non-verificato; nessuna deviazione dalla strategia senza discuterla e motivarla col PO.
