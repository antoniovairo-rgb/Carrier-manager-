# CATALOGO DELLE AZIONI SALIENTI — il set confezionato

Direttiva PO (28/08 sera): *«le azioni salienti devono essere ben definite e confezionate, non
lasciare nulla al caso. Le azioni devono essere assolutamente credibili. Definisci e disegna già
un set di azioni perfette».*

Correzione PO (28/08 notte): *«12 azioni preconfezionate sono poche, troppa ripetitività».*
Recepita così, su TRE livelli che si moltiplicano:

1. **Più schede**: il set passa da 12 a **30** (qui sotto).
2. **Parametri e varianti dentro ogni scheda**: ogni scheda si gioca su due corsie (sinistra/
   destra, speculari), con attori pescati per ruolo dalla rosa vera e 2-3 varianti di sviluppo
   e di finale. 30 schede × ~2,5 varianti × 2 corsie ≈ **150 sequenze distinte** — tutte
   scritte a mano, nulla al caso.
3. **Memoria anti-ripetizione ANCHE fra le partite**: il registro ricorda le realizzazioni
   recenti (scheda+variante+corsia) e le esclude per le successive 3 partite; la scelta è a
   hash che include il matchday, quindi due partite con lo stesso avversario non si somigliano.

Con ~4-6 salienti a partita e 150 sequenze in rotazione forzata, la stessa realizzazione non
può tornare prima di parecchie partite — ed è un metro, non una speranza (vedi DONE in fondo).

Il motore SCEGLIE una scheda (mai la inventa), la cronaca la rende, gli highlight dell'eroe la
mostrano quando il protagonista è lui. L'implementazione (estensione del piano-gol 7.649)
consuma queste schede.

## Le regole di credibilità (valgono per OGNI azione, sempre)

1. **Continuità**: ogni evento parte dalla conseguenza del precedente — il pallone non appare
   mai: se cambia zona, la riga dichiara il viaggio (lancio, cross, rinvio).
2. **Protagonisti per ruolo**: i nomi vengono dai ruoli veri della rosa (regista, terzino,
   esterno, punta, centrale). Mai un portiere che verticalizza dalla trequarti avversaria.
3. **L'esito si dichiara quando accade**, mai prima; l'enfasi (pausa di lettura, colore) è
   proporzionale al peso.
4. **Tempi**: un evento per battuta di cronaca; un'azione dura 3-6 eventi (≈3-5 minuti di gioco,
   15-30 secondi reali per chi guarda).
5. **Rotazione**: la stessa REALIZZAZIONE (scheda+variante+corsia) mai due volte nella stessa
   partita né nelle 3 successive; la stessa SCHEDA mai due volte nella stessa partita.
6. **Tattica**: i pesi di scelta seguono lo stile (possesso→1/5/17, diretta→3/13/16, fasce→2/14/18,
   contropiede→3/22; difesa bassa avversaria→più palle inattive e tiri da fuori) — FASE 4.
7. **Aggancio al punteggio**: le azioni-GOL si scelgono solo quando il microsim (autorità
   intoccabile del risultato) ordina un gol; le altre nascono dal direttore di partita.
8. **Perimetro**: mai VAR, mai replay, mai autogol.

## Parametri comuni a ogni scheda

- **corsia**: sinistra o destra (sequenza speculare) dove la scheda usa una fascia.
- **attori**: slot per ruolo (`regista`, `mezzala`, `esterno`, `terzino`, `punta`, `centrale`,
  `specialista piazzati`, `capitano`) riempiti dalla formazione vera; lo slot `eroe` si applica
  quando lo stato narrativo lo indica (coinvolgimento, zona).
- **variante di sviluppo** e **variante di finale**: elencate scheda per scheda.
- **ancoraggio**: le schede con palla inattiva partono SOLO da un fischio già raccontato
  dall'arbitro ambientale (continuità, regola 1).

## LE AZIONI — GOL NOSTRI (1-18)

### 1 · «Palleggio e verticale» — gol da manovra centrale
TRIGGER: budget-gol + stile possesso/equilibrato.
1. Il **regista** detta i tempi a centrocampo (giro palla corto, la squadra sale).
2. Verticale del regista per la **mezzala** fra le linee (la difesa si alza).
3. Velo/sponda della **punta** che apre il corridoio.
4. Filtrante della mezzala: la punta attacca la profondità sul limite.
5. **Tiro incrociato rasoterra → GOL** (portiere battuto sul palo lontano, tuffo tardivo).
VARIANTI: (a) chiusura con scavetto; (b) tiro respinto e tap-in del compagno accorso.

### 2 · «Fascia e taglio» — gol da cross
TRIGGER: budget-gol + stile fasce (o difesa avversaria chiusa al centro).
1. Apertura del **regista** sull'**esterno** (cambio gioco dichiarato, la palla VOLA — lancio).
2. L'esterno punta il terzino, **sovrapposizione del terzino** che riceve sull'out.
3. **Cross teso** sul primo palo (o secondo, variante).
4. **Taglio della punta** davanti al marcatore: **incornata/tap-in → GOL**.
VARIANTI: (a) cross basso e piatto al volo; (b) sponda sul secondo palo e girata del compagno.

### 3 · «Ripartenza fulminea» — gol in contropiede
TRIGGER: budget-gol + stile contropiede, o dopo scena di pressione avversaria.
1. **Intercetto del mediano** a centrocampo (palla rubata sull'appoggio avversario).
2. Conduzione in campo aperto dell'**esterno** (la difesa rincula, 2 contro 1).
3. Scarico al limite per la **punta** che arriva a rimorchio.
4. **Piatto all'angolo → GOL** (il portiere esce, battuto sul primo tocco).
VARIANTI: (a) l'esterno finta lo scarico e chiude sul primo palo; (b) tocco sotto sul portiere in uscita.

### 4 · «Palla inattiva chirurgica» — gol da punizione laterale
TRIGGER: budget-gol + fallo appena fischiato sulla trequarti.
1. Fallo sulla trequarti (già raccontato dall'arbitro), palla ferma sul punto.
2. Lo **specialista** disegna la traiettoria: punizione tesa in area.
3. **Sponda di testa del centrale** salito.
4. **Girata del compagno sotto porta → GOL** (mischia risolta in un tocco).
VARIANTI: (a) incornata diretta del centrale; (b) respinta corta e sassata dal limite.

### 5 · «La pressione che paga» — gol da pressing alto
TRIGGER: budget-gol + scena di pressione decisa dal direttore già in corso (continuità!).
1. Pressing alto dichiarato (la scena è già stata annunciata in cronaca).
2. Il **difensore avversario** sbaglia l'uscita sotto pressione (errore indotto, non a caso).
3. **Recupero della punta** a 25 metri dalla porta.
4. Due tocchi: **conclusione sul portiere fuori linea → GOL**.
VARIANTI: (a) scarico immediato alla mezzala che arriva; (b) il portiere respinge, tap-in.

### 6 · «Azione da corner» — gol/traversa da calcio d'angolo
TRIGGER: budget-gol + corner appena conquistato.
1. Corner battuto sul **secondo palo** (traiettoria dichiarata).
2. **Stacco del centrale** sopra il marcatore.
3a. **Incornata → GOL**;  oppure 3b. respinta corta della difesa →
4b. **Seconda palla della mezzala al limite: tiro → GOL** (o traversa piena, se il budget non ordina gol).

### 7 · «L'imbucata del trequartista» — gol di rifinitura centrale
TRIGGER: budget-gol + modulo con trequartista (o mezzala di qualità).
1. Scarico della punta sul **trequartista** che si gira fronte alla porta.
2. Due passi palla al piede: la difesa si schiaccia, nessuno esce.
3. **Imbucata di prima** nel mezzo spazio per l'**esterno** che taglia dentro.
4. **Diagonale sul secondo palo → GOL**.
VARIANTI: (a) l'esterno restituisce di tacco e il trequartista conclude; (b) tocco sotto sull'uscita.

### 8 · «Pull-back dal fondo» — gol dal cross arretrato
TRIGGER: budget-gol + fascia guadagnata (o dopo la 9/«muro» che si concatena).
1. L'**esterno** brucia il terzino sul fondo (uno contro uno dichiarato, corsia parametro).
2. Arrivato sulla linea, **non crossa alto: palla dietro rasoterra** (il pull-back).
3. La difesa è girata verso la porta: la **mezzala** arriva frontale al limite dell'area piccola.
4. **Piatto di prima → GOL** (il portiere copriva il primo palo).
VARIANTI: (a) la punta lascia scorrere per la mezzala (velo dichiarato); (b) primo tentativo murato, il rimpallo resta lì e la mezzala ribadisce.

### 9 · «Sponda e girata» — gol da centravanti vero
TRIGGER: budget-gol + punta fisica (attributi rosa) + palla lunga.
1. Lancio lungo del **centrale** sulla **punta** che protegge spalle alla porta (duello col marcatore).
2. **Sponda di petto** per la **mezzala** che rifinisce di prima.
3. Restituzione nello spazio: la punta si è girata sul lato cieco del marcatore.
4. **Girata sul primo palo → GOL**.
VARIANTI: (a) la punta non restituisce: si gira in un tempo e calcia; (b) sponda per l'inserimento dell'esterno.

### 10 · «Il tiro da fuori» — gol da 25 metri
TRIGGER: budget-gol + difesa avversaria bassa (blocco chiuso, lo dice lo stato tattico).
1. Giro palla paziente davanti al blocco basso (la cronaca dichiara il muro avversario).
2. Scarico all'indietro per la **mezzala** che avanza senza opposizione.
3. Un controllo per sistemarla, la difesa non esce.
4. **Collo pieno dai 25 metri → GOL** sotto l'incrocio (il portiere la vede partire e basta).
VARIANTI: (a) la palla tocca la traversa ed entra (dichiarato); (b) tiro potente centrale ma il portiere è coperto dai corpi.

### 11 · «Uno-due al limite» — gol da triangolazione stretta
TRIGGER: budget-gol + intesa alta fra due attori (lo stato narrativo la può aver costruita).
1. La **punta** viene incontro col marcatore addosso, riceve dalla **mezzala**.
2. **Restituzione di prima** (l'uno) e la mezzala parte alle spalle del mediano avversario.
3. **Tocco di ritorno nello spazio** (il due): il centrale avversario è tagliato fuori.
4. **Uscita del portiere anticipata di punta → GOL**.
VARIANTI: (a) il due è un tacco (solo con intesa alta: raro e memorabile); (b) l'ultimo tocco è dell'eroe se lo stato lo mette nello slot.

### 12 · «Angolo corto» — gol da schema sul corner
TRIGGER: budget-gol + corner + variante schema (rotazione con la 6).
1. Corner battuto **corto** sul compagno a due metri (schema dichiarato).
2. Restituzione al battitore che ora ha l'angolo di cross migliore, il primo uomo è saltato.
3. **Cross teso sul primo palo**, dove il **centrale** attacca in anticipo.
4. **Deviazione sotto misura → GOL** (il portiere non può nulla sul cambio di traiettoria).
VARIANTI: (a) dal corto nasce un tiro a giro sul secondo palo; (b) cross respinto, ribattuta della mezzala.

### 13 · «Punizione diretta» — la parabola sopra la barriera
TRIGGER: budget-gol + fallo dal limite fischiato (arbitro ambientale) + specialista in rosa.
1. Fallo al limite (già raccontato), barriera a quattro, il portiere la sistema.
2. Lo **specialista** e un compagno sulla palla: la cronaca pesa il silenzio dello stadio.
3. **Parabola sopra la barriera → GOL** all'incrocio, il portiere resta a metà tuffo.
VARIANTI: (a) rasoterra sotto la barriera che salta (raro, memorabile); (b) il compagno la tocca di lato e lo specialista calcia in porta di prima.

### 14 · «Contropiede da corner avversario» — ripartenza lungo tutto il campo
TRIGGER: budget-gol + corner AVVERSARIO appena difeso (concatenabile alla 24).
1. Corner avversario spazzato dal **centrale**: la palla arriva all'**esterno** rimasto alto.
2. Campo aperto: 60 metri di conduzione, un solo difensore in recupero (la corsa è raccontata in due battute, col fiato).
3. Dentro l'area, finta sul difensore rientrato.
4. **Piatto sul secondo palo → GOL** — e la panchina va a esultare con lui.
VARIANTI: (a) scarico al compagno che ha accompagnato (2 vs 1); (b) il portiere esce fuori area e viene saltato (tocco sotto no: perimetro credibilità — palla scivolata di lato e appoggio in rete).

### 15 · «Il rinvio sbagliato» — pressing sul portiere avversario
TRIGGER: budget-gol + pressing alto attivo + statistica portiere avversario non eccelsa.
1. Retropassaggio al portiere avversario col nostro pressing dichiarato in corso.
2. La **punta** va a chiudere la linea del passaggio facile (la corsa è raccontata).
3. Il portiere forza il rinvio: **palla addosso alla punta**, il rimpallo resta in area avversaria.
4. La punta la raccoglie defilata e **appoggia nella porta sguarnita → GOL** (esultanza rabbiosa del portiere avversario su se stesso).
VARIANTI: (a) il rimpallo esce per la mezzala che calcia di prima; (b) il portiere respinge il primo tiro ma il tap-in è del compagno.

### 16 · «Lancio del portiere» — transizione lunga in verticale
TRIGGER: budget-gol + stile diretta + presa alta del nostro portiere appena avvenuta.
1. Il **nostro portiere** blocca e rilancia SUBITO con le mani sull'**esterno** (contropiede da presa, tutto dichiarato).
2. L'esterno attacca il mezzo campo vuoto, la difesa avversaria è ancora sbilanciata.
3. Palla dentro per la **punta** che parte al limite del fuorigioco (la bandierina resta giù — detto in cronaca).
4. **Tocco sotto sull'uscita → GOL**.
VARIANTI: (a) conclusione di prima sul cross basso dell'esterno; (b) la punta scarica a rimorchio per la mezzala.

### 17 · «Il palleggio che ipnotizza» — gol al termine di un possesso lungo
TRIGGER: budget-gol + stile possesso + dominio alto nello stato narrativo.
1. La cronaca conta i passaggi (dodici, tredici…): il possesso È il racconto, l'avversario rincorre.
2. Cambio di lato improvviso del **regista** (il quattordicesimo passaggio è un lancio).
3. **Terzino** dentro al campo, palla al limite alla **punta** fra le linee.
4. **Apertura del piatto sul palo lontano → GOL** — il gol del possesso, freddissimo.
VARIANTI: (a) l'ultimo passaggio è un filtrante per l'inserimento della mezzala; (b) conclusione respinta e riciclo immediato: il gol arriva al secondo affondo.

### 18 · «Rigore procurato» — dal dribbling al dischetto
TRIGGER: budget-gol (o grande occasione) + eroe/punta in area.
1. Dribbling in area del **protagonista** (finta dichiarata, il difensore ci casca).
2. **Contatto → RIGORE**: fischio, proteste brevi degli avversari, il pallone sul dischetto,
   TUTTI fuori dall'area (7.657) — solo battitore e portiere.
3. La rincorsa, l'angolo scelto, **esito**: gol (budget) o parata (occasione) — mai dichiarato prima.

## LE AZIONI — SENZA GOL (19-26)

### 19 · «La parata che vale un gol» — saliente difensivo
TRIGGER: direttore, scena di pressione avversaria; nessun gol nel budget.
1. Azione avversaria in fascia (l'ala punta e crossa basso).
2. Conclusione ravvicinata della **punta avversaria**.
3. **PARATA DI RIFLESSO** del nostro portiere (tuffo vero, palla deviata).
4. **Corner concesso** — l'azione CONTINUA nella palla inattiva (catena causale, mai scena morta).

### 20 · «Il palo trema» — grande occasione senza gol
TRIGGER: direttore, scena di sviluppo; nessun gol nel budget.
1. Manovra sul limite, scarico della punta per la **mezzala**.
2. **Sassata dal limite → PALO PIENO** (suono, boato, camera che segue il rimbalzo).
3. La difesa spazza; la cronaca respira sulla paura scampata.
VARIANTI: (a) traversa da punizione dello specialista (ancoraggio: fallo fischiato); (b) palo interno che attraversa la porta e esce — crudele, raro.

### 21 · «Il muro» — recupero difensivo che diventa ripartenza
TRIGGER: direttore, scena difensiva; è l'azione che il PO ha collaudato (SIT recover).
1. Assalto avversario (arrivano in tre, la difesa si schiaccia).
2. **Blocco col corpo del centrale** sulla conclusione (contrasto VISIBILE, gesto vero).
3. La palla sporca esce sul **mediano**: primo passaggio di scarico.
4. **La ripartenza parte** — l'azione si concatena alla 3 (se il budget ordina un gol) o si
   spegne in un fallo tattico avversario (fischio dell'arbitro, continuità col piazzato).

### 22 · «L'occasione divorata» — il gol sbagliato che fa gridare lo stadio
TRIGGER: direttore, scena di sviluppo; nessun gol nel budget; ottimo per lo stato narrativo (un compagno poi incoraggia — aggancio EROE PROTAGONISTA).
1. Azione pulita: cross basso dell'**esterno** per la **punta** sola sul dischetto.
2. Stop e tiro… **ALTO sopra la traversa** da posizione impossibile da sbagliare.
3. Le mani nei capelli, il mister che si gira verso la panchina: la cronaca pesa l'errore senza infierire (o infierendo, se il momento è teso — tono dallo stato).
VARIANTI: (a) tiro strozzato sul fondo; (b) controllo sbagliato sul più bello, il difensore rinviene.

### 23 · «Il miracolo del loro portiere» — l'eroe (o la punta) fermato dal portiere
TRIGGER: direttore + eroe coinvolto preferibilmente; nessun gol nel budget.
1. Azione manovrata che libera il **protagonista** alla conclusione ravvicinata (2-3 beat di costruzione dalla scheda 1/2/7 accorciata).
2. Conclusione angolata, da gol.
3. **Il portiere avversario la toglie dall'incrocio** con la punta delle dita: applausi anche nostri.
4. Dal corner che ne nasce si può concatenare la 6/12 (senza esito gol).
VARIANTI: (a) doppia parata: respinta e riflesso sul tap-in; (b) uscita bassa a valanga sui piedi.

### 24 · «Salvataggio sulla linea» — il quasi-gol subito
TRIGGER: direttore, scena difensiva alta tensione; nessun gol avversario nel budget.
1. Cross avversario che taglia l'area, il nostro portiere è anticipato dall'uscita a vuoto (errore dichiarato, con conseguenza narrativa).
2. Incornata avversaria a porta vuota…
3. **Il terzino appostato sul palo la spazza via dalla linea** (il gesto che vale una parata).
4. Ne nasce il corner avversario — concatenabile alla 14 (ripartenza) o alla 26.
VARIANTI: (a) salvataggio in scivolata sul rasoterra; (b) il pallone rimbalza sul palo interno e il centrale libera.

### 25 · «Bandierina alzata» — il gol avversario che non vale
TRIGGER: direttore, momento di sofferenza; nessun gol avversario nel budget. (Niente VAR: il guardalinee alza SUBITO, il fischio arriva prima dell'esultanza.)
1. Verticale avversaria che taglia la nostra linea, la punta avversaria parte.
2. Palla in rete… ma **la bandierina è già alta**: fuorigioco netto, fischio immediato.
3. Sospiro dello stadio, il nostro centrale si prende la scena richiamando la linea (aggancio EROE PROTAGONISTA: il capitano parla).
VARIANTI: (a) fuorigioco di rientro sull'inserimento; (b) punizione nostra per la carica sul portiere: si riparte.

### 26 · «Mischia furiosa» — il flipper in area che finisce in niente
TRIGGER: direttore, palla inattiva avversaria (corner/punizione già fischiata); nessun gol nel budget.
1. Corner avversario spiovente, **respinta corta di testa** del centrale.
2. Rimessa in mezzo di prima, **rimpallo** nel cuore dell'area (2 battute concitate, ritmo alto).
3. Conclusione ravvicinata **MURATA** dal mediano rientrato.
4. Spazzata definitiva oltre la linea laterale: si respira, rimessa avversaria.
VARIANTI: (a) il flipper termina col portiere che si distende sulla ribattuta; (b) fallo in attacco fischiato nella mischia (l'arbitro chiude lui la scena).

## LE AZIONI — GOL SUBITI (27-30)

### 27 · «L'infilata subita» — gol avversario da errore nostro
TRIGGER: budget-gol avversario. (Un gol subito DEVE avere la sua azione: mai dal nulla.)
1. **Palla persa a centrocampo** (appoggio sbagliato del nostro mediano — errore nominato).
2. Verticale immediata del **regista avversario** (il ribaltamento è dichiarato).
3. **Inserimento della punta avversaria** alle spalle del centrale.
4. **GOL SUBITO** — reazione: il mister urla, la difesa si guarda, il momentum cala.
VARIANTI: (a) da fascia: cross e incornata; (b) tiro da fuori deviato.

### 28 · «Lo standard subito» — gol avversario da palla inattiva
TRIGGER: budget-gol avversario + corner/punizione avversaria offerta dall'arbitro ambientale.
1. Corner avversario (fischio e traiettoria dichiarati).
2. **Stacco vincente del centrale avversario** sul nostro marcatore (duello nominato).
3. **GOL SUBITO** — la cronaca dice CHI ha perso il duello (conseguenza vera, non colpa vaga).

### 29 · «Il contropiede subito» — puniti in transizione
TRIGGER: budget-gol avversario + noi sbilanciati (dominio nostro alto nello stato: il gol beffa).
1. Nostro corner (o assedio) che sfuma: **ripartenza avversaria** dalla loro area.
2. La loro ala brucia il nostro terzino rimasto alto (la corsa a campo aperto è raccontata).
3. Due contro uno sul nostro centrale: scarico al momento giusto.
4. **GOL SUBITO in contropiede** — il classico gol che «non meritavamo di prendere», e la cronaca lo dice.
VARIANTI: (a) conclusione personale dell'ala sul primo palo; (b) il nostro portiere tocca ma non basta.

### 30 · «La prodezza avversaria» — il gol subito senza colpe
TRIGGER: budget-gol avversario + nessun errore da assegnare (alternativa alla 27: non è sempre colpa nostra).
1. Manovra avversaria paziente, noi ben messi (la cronaca lo riconosce).
2. Palla scaricata al **loro numero dieci** a 25 metri, chiuso ogni corridoio.
3. **Conclusione sotto l'incrocio → GOL SUBITO**: niente da rimproverare, solo applausi dei loro tifosi.
4. Reazione: il nostro capitano batte le mani, «si riparte» (aggancio EROE PROTAGONISTA).
VARIANTI: (a) punizione avversaria perfetta (ancoraggio: fallo nostro fischiato); (b) mezza rovesciata sul cross — rara, memorabile.

## Metri d'accettazione del catalogo (F6, il DONE)

- Ogni azione eseguita produce la sua sequenza COMPLETA nel registro eventi (zero eventi
  mancanti, zero fuori ordine) — metro automatico sul registro.
- Zero «apparizioni»: la distanza fra la zona di un evento e quella del successivo è coperta
  da un gesto dichiarato (già misurabile col giudice di fondatezza).
- **Rotazione a tre livelli rispettata** (metro sul registro, anche CROSS-partita):
  stessa scheda mai 2 volte in partita; stessa realizzazione (scheda+variante+corsia) mai
  nella stessa partita né nelle 3 successive; su 10 partite sonda, nessuna realizzazione
  compare più di 2 volte.
- Distribuzione per stile tattico misurata e nel verso giusto (F4).
- Copertura: su 10 partite sonda escono ALMENO 15 schede diverse (il catalogo respira tutto,
  non un sottoinsieme comodo).
- Collaudo PO: le azioni si leggono come «calcio vero» — il giudice finale resta lui.
