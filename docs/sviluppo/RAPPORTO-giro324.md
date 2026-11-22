# Rapporto giro 324 — PO-376 «negli highlight non vedo da molto azioni che partono dalle fasce»

Base `lavoro/201` (7.999.203), ramo `sviluppo/giro324-fasce`. **Nessuna modifica al gioco** (src/ e CARRIER-MANAGER-AV.html
intatti, GAME_VERSION non toccata): solo misure, due sonde e questo rapporto, tutto sotto `docs/` (neutro per il trenino).

## Risposta in breve
**Confermato: l'eroe non parte quasi mai dalla fascia.** Oggi 1 scena su 66 (1,5%) in 12 partite vere; il 28/10 erano 0 su 51.
Non è una regressione rispetto a fine ottobre: è così da quando le scene nascono dal motore (25/09 – 07/10).
La causa è misurata: nel motore l'eroe ha un posto fisso al centro del campo.

## Premessa: i ruoli non esistono
La richiesta era misurare 3-4 ruoli (ala, terzino, centrocampista, punta). Nel gioco di oggi il ruolo dell'eroe è uno solo:
- la creazione scrive sempre `position:"Attaccante"` (src/17, riga 443; il selettore è stato tolto con la 7.999.49);
- il motore crea l'eroe sempre come punta (`rl:"AT"`, src/14 riga 262) con posto fisso `SLOT_EROE={x:60,y:50}` (riga 328),
  qualunque sia il modulo del club; `player.position` non entra nel motore.

Quindi la tabella è per salvataggio (livello dell'eroe), non per ruolo.

## Misura 1 — partite vere (sonda `giro324/misura-324.mjs`)
Flusso vero dal salvataggio, non scene forzate. 3 salvataggi × 4 semi (il seme cambia il nome, quindi la partita), velocità 2×,
pilota «mano» (la sonda sceglie l'opzione). Per ogni scena dell'eroe: tipo d'occasione del motore e posizione logica dell'eroe
all'apertura della scelta.
- **F1** = tipo «fascia» del motore (eroe sulla trequarti a 22 o più dal centro).
- **F2** = eroe largo all'avvio (|y−50| ≥ 22), qualunque tipo.
- **F3** = cross o angolo di un compagno verso l'eroe (l'azione parte dalla fascia, l'eroe è in area).

Riferimento vecchio: commit `49587bcb` del **28/10** (7.999.178, «Giro 98: rapporto completo»). Scelto perché è un commit di fine
ottobre su main con build e rapporto chiusi, e ha già tutti i ganci che la sonda legge (`__CPM_P6`, `__CPM_CURSIT`, `__CPM_PPOS`).

| Salvataggio (ruolo: Attaccante) | Versione | Partite | Scene | F1 tipo fascia | F2 eroe largo | F3 cross/angolo verso l'eroe |
|---|---|---|---|---|---|---|
| s1 · Primavera, OVR 62 | 28/10 | 4 | 18 | 0 | 0 | 3 |
| s1 · Primavera, OVR 62 | oggi | 4 | 17 | 1 | 1 | 0 |
| s5 · professionista, OVR 74 | 28/10 | 4 | 11 | 0 | 0 | 3 |
| s5 · professionista, OVR 74 | oggi | 4 | 24 | 0 | 0 | 2 |
| s12 · professionista, OVR 93 | 28/10 | 4 | 22 | 0 | 0 | 7 |
| s12 · professionista, OVR 93 | oggi | 4 | 25 | 0 | 0 | 4 |
| **Tutte** | **28/10** | **12** | **51** | **0 (0%)** | **0 (0%)** | **13 (25,5%)** |
| **Tutte** | **oggi** | **12** | **66** | **1 (1,5%)** | **1 (1,5%)** | **6 (9,1%)** |

Tipi di scena, oggi: fra le linee 26 · difesa 12 · conclusione 9 · punizione 8 · angolo 4 · spalle 2 · cross 2 · scheda di
catalogo 2 · **fascia 1**. Il 28/10: fra le linee 15 · difesa 9 · cross 9 · conclusione 6 · angolo 4 · punizione 4 · spalle 2 ·
scheda 2 · **fascia 0**. Elenco scena per scena in `giro324/partite-oggi-7.999.203.txt` e `giro324/partite-28ott-7.999.178.txt`.

**Limiti della misura, da leggere prima dei numeri.**
- Il banco era saturo (8 pagine su 4 processori): una partita è durata 11-15 minuti e il tetto di 15 minuti ne ha tagliate 7 su 12
  oggi (fra il 72' e il 90') e 8 su 12 il 28/10 (fra il 68' e il 92'). Le scene fino al taglio sono vere; le ultime mancano.
  Una partita del 28/10 (s5 seme 5) non ha aperto nessuna scena fino al 68'.
- 12 partite per versione sono poche: 0 contro 1 scena di fascia non è una differenza.
- Le partite complete sono 5 (oggi) e 4 (28/10).

## Misura 2 — motore in node (sonda `giro324/misura-324-motore.mjs`)
120 partite del motore vero (24 configurazioni registrate dalla carriera S12 × 5 semi), nessun browser. Per ogni ricezione
dell'eroe oltre metà campo si calcola il tipo d'occasione con la regola del motore.
- Ricezioni dell'eroe oltre metà campo: **53,9 a partita**.
- Tipo **fascia: 0,7%** · fra le linee 36,4% · area o limite 54,6% · costruzione 8,2%.
- Sulla trequarti (2.405 ricezioni), distanza dal centro |y−50|: 0-5 **42,4%** · 5-10 **31,1%** · 10-15 17,0% · 15-20 6,8% ·
  20-25 1,5% · oltre 25 1,3%. La soglia della fascia è 22: il **97%** delle ricezioni sta entro 20.

Limite: le configurazioni registrate sono del 05/10 e non portano il modulo del club (aggiunto al giro 112); il posto dell'eroe
però non dipende dal modulo (`SLOT_EROE` fisso), quindi il risultato vale anche oggi.

## Causa
1. **Posto fisso al centro.** Senza palla il motore manda ogni giocatore a `50 + (posto.y − 50)·ampiezza + (pallone.y − 50)·0,30`
   (src/14 riga 1313). Il posto dell'eroe è y 50: può scostarsi dal centro al massimo di 15 seguendo il pallone. La scena «fascia»
   chiede 22 (riga 886). Ci arriva solo portando palla lui.
2. **La richiesta «fascia» non sposta più l'eroe.** La partita chiede al motore il tipo d'occasione a rotazione, e «fascia» è 2
   richieste su 8 (src/15 riga 5862). Il meccanismo del 23/09 che portava l'eroe largo quando si chiede «fascia» (src/14 righe
   1322-1326) è spento da `!_EG`, cioè da «l'eroe dal gioco» (7.999.6, 25/09, scelta PO «meno scene, tutte vere»). Il commento del
   23/09 riporta la stessa misura di oggi: senza quel meccanismo «nessuna fascia in 9 scene».
3. **Prima era il catalogo.** Finché le scene venivano dal catalogo SITUATIONS, la scheda metteva l'eroe nella sua zona di
   partenza: 23 schede su 191 (12,0%) hanno la zona tutta larga (cross dalla fascia, sovrapposizione, uno contro uno sulla
   fascia, sprint sulla fascia…). Oggi dal catalogo esce circa 1 scena su 30 (2 su 66). Questo spiega il «da molto» del PO.
   Non ho misurato una versione di quell'epoca (la storia del clone parte dal 24/10): il 12% è la quota del catalogo, non una
   misura di partite.

Ho provato a confermare il punto 2 in node riaccendendo il meccanismo col rosso `__CPM_NO_EROEGIOCO`: la prova non è valida
(senza la scena giocata il motore emette 1.200 occasioni a partita) e l'ho tolta dalla sonda. Il punto 2 è quindi letto nel
codice, non misurato.

## Perché non ho corretto
- La quota è coerente col ruolo di oggi: l'eroe è una punta centrale. Farlo partire dalla fascia è una scelta di gioco, non la
  riparazione di un guasto.
- L'unica correzione piccola (riaccendere per la sola «fascia» lo spostamento dell'eroe, col rosso `__CPM_NO_G324`) tocca il
  motore: cambia dove sta l'eroe in 2 finestre su 8, quindi gol, numero di scene e tutte le bande tarate. Il suo effetto non è
  misurato (vedi sopra) e nel tetto del giro non c'era il tempo per guardiano verde/rosso su partite vere più le sentinelle.
- Di conseguenza: nessun guardiano `fasce-324`, nessuna riga nuova nella MAPPA, `ci-runner giro` non eseguito (niente da
  giudicare: il gioco è identico alla base).

## Proposta
Non chiudere PO-376 come «non confermato»: il PO ha ragione. Tre strade, in ordine di costo:
- **A. Lasciare così e chiudere** con la motivazione «l'eroe è una punta centrale: le azioni di fascia gli arrivano come cross
  dei compagni (9% delle scene)».
- **B. Riaccendere lo spostamento per la sola richiesta «fascia»** (una condizione in src/14 riga 1322, rosso `__CPM_NO_G324`,
  guardiano `fasce-324` su partite vere: almeno una scena di fascia ogni N partite). Attesa da verificare: fino a 2 scene su 8
  di tipo fascia. Un giro intero, con le sentinelle e i banchi dei gol.
- **C. Dare all'eroe un posto vero nel modulo** (ala, seconda punta, centravanti) e magari far scegliere il ruolo. È una
  funzione nuova, non una correzione.

## Dubbi per il PO
1. **Quale strada (A, B o C)?** Consiglio B se «partire dalla fascia» deve tornare senza cambiare il ruolo dell'eroe.
2. **I cross dei compagni verso l'eroe sembrano calati**: 9 scene «cross» su 51 il 28/10, 2 su 66 oggi (con gli angoli: 13 → 6).
   Stessi salvataggi e stessi semi, ma poche partite e tagliate a minuti diversi: è un indizio, non una misura. Se interessa,
   serve un giro a parte con più partite e la ricerca del commit che l'ha cambiato (fra 7.999.178 e 7.999.203).
3. **«Fra le linee» è il 39% delle scene** (26 su 66) e nel salvataggio OVR 93 è 14 su 25, quasi sempre nello stesso punto
   (x 73,5-74, y 37-45). Non era la domanda, ma è la ripetitività che si vede giocando.
4. La voce PO-376 nel BACKLOG dice «non confermato»: non l'ho toccata, va aggiornata da chi tiene il governo.

## File
- `docs/sviluppo/giro324/misura-324.mjs` — partite vere (per eseguirla va copiata in `tests/visual/`).
- `docs/sviluppo/giro324/misura-324-motore.mjs` — motore in node (idem).
- `docs/sviluppo/giro324/partite-*.txt` — uscita completa delle due serie.
