# ROADMAP CREDIBILITÀ — «basta pezze» (direttiva PO 07/09, sera)

> *«prima di collaudare un'altra volta, l'ennesima, pretendo che la credibilità sia altissima e che
> anche il test player dia lo stesso giudizio. Stiamo andando da troppo tempo avanti con pezze»*

## Il metro (fissato e dichiarato — non si negozia al ribasso)

Playtest da player (`docs/PLAYTEST-ATTACCANTE.md`) su **4 partite intere, 2 in casa e 2 in
trasferta**, letto come lo legge il giocatore:

- **media ≥ 8,0** sulle 12 aree della scorecard;
- **nessuna area sotto 7**;
- **zero bugie di sistema P0/P1** nei quattro diari: pallone dove il racconto non lo mette;
  fatto contraddetto dal tabellone; riga d'enfasi che ignora punteggio o possesso; nome o squadra
  che non torna; azione annunciata e non mostrata.

Finché il metro non è raggiunto: **nessun «puoi collaudare»**, **`main` fermo alla 7.807**, release
solo sul branch coi rituali verdi. Il PO riceve i report orari e basta.

Ultimo voto: **5,0** (rapporto n° 3, 07/09). Il divario è di tre punti: non lo copre nessuna pezza.

## Le cause (misurate in questi giorni), non i sintomi

| # | causa strutturale | sintomi che genera (note PO) | prova già in mano |
|---|---|---|---|
| S1 | **Il pallone reso ha 15 scrittori e vince l'ultimo** | teletrasporti, flipper, «palla senza padrone», «tiro da centrocampo», gol senza pallone in rete | censimenti 815-820: logico arriva 8/15, reso 0/15 prima della 7.807; 7.807 lo cura **solo nei piani** |
| S2 | **Il padrone del pallone lo elegge il renderer** (7.555/7.526), non la simulazione | l'eroe si prende il pallone dell'occasione altrui; codice 001/002 | traccia 820: padrone «eroe» per tutta l'occasione |
| S3 | **La squadra non sa il punteggio** — né il microsim, né i piani, né l'enfasi | «stiamo dominando» sotto 1-2; «momento da soffrire» nella nostra ripartenza; palla indietro all'88' sotto di uno | passate n°2 e n°3 |
| S4 | **Il ritmo butta righe**: con una scheda aperta `addCom` rifiuta, anche il tiro dell'occasione | occasione = una parata senza tiro (3/4 nel diario); 44 minuti vuoti su 89 | `__CPM_SC681_REF`, `__CPM_REF_PIANO` |
| S5 | **L'occasione extra-eroe non è un'azione**: 3 battute in scatola, esiti solo angolo/rimessa, nasce dove capita | «rare e disegnate male», «non è calcio», «azioni matematiche» | 815: 2,00 a partita, 7/12 da fuori, 3 battute |

Piccole ma certe, in coda: sigla della squadra nelle righe del piano (#55-B, patch pronta);
cognome dell'eroe mai fra i PNG (#54); gesto dell'intercetto/muro mai armato (#52); taglia del
pallone (#53, misura in corso).

## S1+S2 — il disegno che esce dal censimento (07/09 notte)

Il `carrierRef` nullo per metà-due terzi del tempo **non è un buco**: decade per costruzione
(7.642) quando il bersaglio della palla è a più di 12u dal portatore — cioè quando la palla è
**in volo** verso un ricevente. Il portatore torna a esistere all'arrivo (r.5793). La simulazione
quindi conosce tre stati, e il renderer deve **leggerli**, non rieleggere:

| stato logico | come si riconosce | il pallone reso |
|---|---|---|
| **portata** | `carrierRef.i` non nullo | ai piedi di *quel* corpo (mesh), e di nessun altro |
| **in volo** | `carrierRef` nullo e `ballTarget` lontano dal pallone logico | arco dal punto attuale al bersaglio logico (quota e tempo dell'arco; la destinazione è della simulazione) |
| **vagante / ferma** | `carrierRef` nullo e bersaglio vicino, oppure `fermo`/`out` | insegue il pallone logico |

Con questa tabella i quindici scrittori si riducono a tre rami, e le elezioni del renderer
(7.555, `_por526`, colla 7.515) diventano *lettura* di `carrierRef`. È il lavoro di S1 e S2
insieme. La 7.810 (colla dell'eroe sui dati logici) è stata **revocata** (misura cieca); il
taglio vero è la **7.813**: `carrierRef` passa al renderer come ref e `_por526` non si elegge
più — portata = il corpo del carrier, in volo = l'arco, vagante = nessun padrone. Misura
`padrone-825`: accordo 37-43% → ≥ 90%, salti > 8u in calo.

## L'ordine e la misura di ciascuna

1. **S1 — un solo pallone.** Il reso è *sempre* il logico più un inviluppo di volo (l'arco dà
   quota e tempo, non la destinazione). Gli altri 13 scrittori diventano *proposte* che il logico
   accetta o ignora. Misura: scarto reso↔logico su tutta la partita (oggi mediana 25-40u nei
   piani, 64% dei fotogrammi obbedienti fuori) → **p90 ≤ 3u** fuori dagli archi; zero salti > 8u
   in 30 ms (la nota «SALTO del pallone» del PO).
2. **S2 — un solo padrone.** `carrierRef` è la verità; il renderer incolla la palla a *quel* corpo
   e a nessun altro. **Censito (padrone-825, 07/09 notte)**: `carrierRef` è nullo nel 49-69% dei
   campioni ambientali e l'accordo simulazione↔renderer è al 37-40% — quindi S2 ha due metà:
   (a) il portatore logico deve *esistere* sempre quando il pallone non vola e non è fermo
   (src/14, la decadenza a 12u del 7.642 va ripensata); (b) il renderer lo legge e basta
   (7.810 è il primo taglio: la colla dell'eroe sui dati logici). Misura: padrone eletto = carrier logico ≥ 95% dei fotogrammi in fase
   ambientale; «eroe» eletto durante un piano altrui = 0.
3. **S3 — la squadra sa il punteggio.** **Censito (08/09)**: le righe d'enfasi escono da
   `momentumRef` e basta — `src/14` r.5170: `momentum ≥ 80 && rnd < 0.12` → «Stiamo dominando /
   La squadra è in fiamme / Momento magico»; `≤ 20` → «Reggiamo / Sotto pressione / Teniamo
   duro». Né punteggio né minuto: da qui «Stiamo dominando — teniamo alta l'intensità!» all'84'
   sotto 1-2. Il momentum stesso muove di ±25 sui gol e ±4 sui tiri (r.5173-5176). S3 v1: la
   riga d'enfasi si sceglie da una tabella **stato × momentum** (sotto/pari/sopra × inizio/mezzo/
   finale), con frasi che dicono la cosa vera («sotto di uno e spingiamo: serve il gol», «avanti
   e in controllo», «pari, la partita è lì»). S3 v2: lo stesso stato governa la spinta del
   microsim e la frequenza delle occasioni. Un *atteggiamento* per lato (assalto / equilibrio /
   gestione / attesa) derivato da punteggio, minuto, superiorità: governa la spinta del microsim,
   la frequenza delle occasioni, e **seleziona** il vocabolario d'enfasi (niente riga fuori stato).
   Misura: righe d'enfasi incoerenti con lo stato = 0 su 4 partite (oggi 33% delle righe
   d'enfasi); il lato sotto negli ultimi 15' ha più occasioni del lato sopra in ≥ 3 partite su 4.
4. **S4 — le righe non si perdono.** Le righe di piano si accodano dietro la scheda e escono in
   ordine; il vuoto è deciso dal regista, non dal rifiuto. Misura: righe di piano rifiutate = 0;
   occasioni con tutte e tre le righe nel diario = 100% (oggi 1/4); minuti vuoti ≤ 25/89.
5. **S5 — l'occasione è un'azione.** 5-7 battute dal centrocampo con viaggio vero del pallone,
   protagonisti dalle posizioni reali, esiti: fuori / murata / parata / angolo / rimessa (il gol
   resta del microsim); frequenza dall'atteggiamento (S3). Misura: conclusioni da dentro l'area
   ≥ 50% (oggi 1/12); esiti diversi ≥ 4 su 6 partite; 3-5 occasioni a partita quando lo stato lo
   chiede.

Ogni voce: misura rossa prima, rimedio, misura verde, rituali, release sul branch. **Nessuna voce
si spedisce da sola al PO.** Alla fine: playtest n° 4 su quattro partite, e il metro decide.
