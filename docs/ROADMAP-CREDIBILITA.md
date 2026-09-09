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
`padrone-825`: **palla ai piedi del portatore logico (≤ 3u)** — baseline **15% / 7%** (08/09),
bersaglio ≥ 90%; salti > 8u (50-56) in calo. La 7.813 v1 (impostare `_por526`) è stata revocata:
la colla scatta solo se il pallone è già vicino; la 7.817 cambia il bersaglio dell'inseguitore.

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
4. **S4 — le righe non si perdono.** **Censito (08/09)**: la scheda aperta non c'entra (0/18
   battute rifiutate); la battuta del piano viene **sovrascritta dalla catena** (7.537) nello stesso
   tick — bisezione coi testimoni p1/p2/p3: 6/3/3 e 12/5/5. 7.812 v2: la catena tace per il tick
   della battuta; misura «occasioni con tutte e tre le righe nel diario» 0/6 → atteso 100%. Le righe di piano si accodano dietro la scheda e escono in
   ordine; il vuoto è deciso dal regista, non dal rifiuto. Misura: righe di piano rifiutate = 0;
   occasioni con tutte e tre le righe nel diario = 100% (oggi 1/4); minuti vuoti ≤ 25/89.
5. **S5 — l'occasione è un'azione.** 5-7 battute dal centrocampo con viaggio vero del pallone,
   protagonisti dalle posizioni reali, esiti: fuori / murata / parata / angolo / rimessa (il gol
   resta del microsim); frequenza dall'atteggiamento (S3). Misura: conclusioni da dentro l'area
   ≥ 50% (oggi 1/12); esiti diversi ≥ 4 su 6 partite; 3-5 occasioni a partita quando lo stato lo
   chiede.

Ogni voce: misura rossa prima, rimedio, misura verde, rituali, release sul branch. **Nessuna voce
si spedisce da sola al PO.** Alla fine: playtest n° 4 su quattro partite, e il metro decide.

## Stato al 08/09 sera (build 7.831 sul branch, 7.832 in rituali)

Playtest da player: n°5 **4,6** → n°6 5,2 → n°7 5,3 → n°8 **5,6**. Metro: 8,0.

| causa | stato |
|---|---|
| S1 un solo pallone | aperta (baseline 15%/7% palla ai piedi del portatore) |
| S2 un solo padrone | racconto: chiuso il marcatore (7.830), la libreria non parla sopra un gol (7.822 v3 + 7.832); campo: aperta |
| S3 la squadra sa il punteggio | v1 (7.811) + margine (7.821) + «dominando» con un tiro (7.827); aperta la parte «a 1-0 la squadra smette» |
| S4 le righe non si perdono | chiusa (7.812/7.816); il corner al minuto dopo (7.818 v6) |
| S5 l'occasione è un'azione | prima metà: cinque battute con la costruzione (7.829); aperta la seconda: zona di tiro (#44), varietà delle famiglie |
| copione della partita | chiuso (7.819): il seme di partita in tutti i sorteggi del racconto |

Aperte con causa già letta: **R** (scene dell'eroe: prima sempre fra 8' e 17' da `hlTimes`, poi
scene reattive a `ck+2` che cadono nello stesso minuto di un'altra), **AC** (gol dell'eroe senza
azione prima), **P** («filtrante… attacca lo spazio» senza esito), **ritmo in casa** (>50 minuti
vuoti). Strumenti: `analisi-diario.py` sul testo del playtest; sonde con rosso appaiato; il
diario si legge prima di chiudere il browser (decima lezione).


## Stato al 09/09 mattina (build 7.840 sul branch, dfc2361)

Playtest da player: n°5 4,6 → n°8 5,6 → n°12 5,9 → **n°19 6,2**. Metro: 8,0.

| causa | stato |
|---|---|
| S1 un solo pallone | aperta |
| S2 un solo padrone | racconto: marcatore (7.830/7.835), libreria esclusiva (7.833), **il contropiede è uno solo** (7.839: nome unico, chiusura protetta dai registi successivi); campo: aperta |
| S3 la squadra sa il punteggio | v1 + margine + «dominando»; il turno segue il possesso (7.836 v2); aperta la parte «a 1-0 la squadra smette» |
| S4 le righe non si perdono | chiusa; il corner (7.818 v6) e il contropiede (7.839) non aspettano il dado |
| S5 l'occasione è un'azione | cinque battute (7.829); il gol sulla respinta si dice (7.840); aperte zona di tiro e famiglie |

Chiuse con misura in questo giro: **P** (chiusure 0/2 → 8/11), **E** (2/2 vs 0/2), **AC** (censita:
3/5 → 5/5 leggibili con titolo e scelta nel diario), **AF** (7.842 v3, 04953b6: 1/4 → 0/4, fischio pulito
4/4; playtest n° 22 **6,3**). Strumento: il guardiano conta anche le battute di piano (7.841); la
7.836 v2 sostituiva la libreria con le occasioni, non era una perdita. Aperte: **ritmo** (33-45 minuti
muti nel diario: da verificare con lo schermo), U, R ridimensionata, S1, S5 seconda metà, il titolo
d'intento generico.


## Stato al 09/09 mezzogiorno (build 7.843 sul branch, a87db65)

Playtest: n°19 6,2 → n°22 6,3 → **n°23 6,4**. Metro 8,0. Aree: Causalità 7, Azioni extra-eroe 7,
Interazioni 7, Coerenza 7; Realismo, Credibilità, Varietà, Ritmo, Highlight, Telecronaca, Immersione,
Carriera a 6. Chiuse in questo giro con misura: P, E, AC (censita), AF, Ritmo-palla morta (24 → 4-7
minuti). Strumenti: titolo e scelta della scena nel diario; il guardiano conta le battute di piano;
il diario classifica i minuti muti dallo schermo. Aperte: «fermo» 10' a Vairo, U, S1, S5 seconda
metà, il titolo d'intento generico, e le aree a 6.


## Stato al 09/09 pomeriggio (build 7.845 sul branch, ee6cf1d)

Ritmo: minuti muti 41/45/45/33 (n° 22) → 14/30/30/31 (n° 24); palla morta 24 → 4-9; «fermo» 10 → 0.
Quello che resta muto è per progetto (pausa di lettura, ripresa dopo i gol). Lezione dodicesima
confermata quattro volte (corner, contropiede, palla morta, piazzato/calcio d'inizio): **una macchina
promessa dal testo non deve aspettare il dado**. Aperte: R (prima scena: 14/13/25/13, v2 in misura),
U, S1, S5 seconda metà, il titolo d'intento generico; aree a 6: Realismo, Credibilità, Varietà,
Highlight, Telecronaca, Immersione, Carriera.
