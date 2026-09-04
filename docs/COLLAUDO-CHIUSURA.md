# Collaudo di chiusura — missione «partita vera»

**Versione da collaudare: KE 7.779.0** (controlla in basso a destra nella schermata di test, o nel diario versione).
Servono **tre partite intere**: una di campionato, una di Coppa, una in trasferta.
Per ogni difetto: manda la **nota KE** (il gioco la compone da solo) — se nell'intestazione compare `fps`, quel numero mi serve.

## Cosa guardare, e perché

| # | Cosa | Dove guardare | Release | Cosa dovresti vedere |
|---|---|---|---|---|
| 1 | **Pannello nero dietro la porta** | secondo tempo, quando inquadra la porta | 7.768 | nessuna parete nera: la porta ha una cavità scura, non un muro |
| 2 | **Apertura della scena** | il primo highlight della partita | 7.769 | parte subito viva; nessun blocco di 1-2 secondi |
| 3 | **Pallone durante la lettura** | mentre scegli l'azione | 7.770 | resta ai tuoi piedi; non scivola verso la linea laterale |
| 4 | **Azione da gol: schema** | qualsiasi azione pericolosa | 7.775-7.776 | tre uomini coinvolti, due o tre passaggi, non «passaggio e tiro» |
| 5 | **Gol subito** | quando l'avversario segna | 7.772-7.773 | il pallone **entra** in porta, e il tiro parte da distanza ragionevole |
| 6 | **Dopo un recupero riuscito** | scena difensiva vinta | 7.777 | il pallone finisce a un compagno, non nel nulla |
| 7 | **Pallone in quadro** | tutta la cronaca | 7.766-7.767 | il pallone si vede quasi sempre, anche vicino alla linea laterale |

## Cosa NON ho potuto verificare (dichiarato)

- **Il tuo telefono**: tutte le release dalla 7.768 alla 7.779 sono verificate solo sul banco, che non ha una scheda grafica vera.
- **La CI di GitHub**: due volte rossa con banco verde. Ho spedito due mitigazioni e trovato il meccanismo più probabile (il banco aspettava 9 secondi reali e leggeva posizioni intermedie), ma **non posso leggere il log del run**: l'app GitHub non è connessa per l'organizzazione.
- **Residui misurati e non risolti**: 4 scene difensive su 10 chiudono col pallone lontano dai nostri (poi lo raccoglie la cronaca); il codice «reparto fermo» e «stacco troppo presto» non si riproducono con nessun metro qui.
- **Memoria fra partite** (Fase 5): mai verificata.

## Chiusura

Se dopo le tre partite la coda delle note resta vuota su questi sette punti, dichiaro la missione chiusa a verbale in `docs/FASE3-SCAMBIO.md` e passiamo a quello che decidi tu. Se trovi difetti, li lavoro e ripetiamo il giro.
