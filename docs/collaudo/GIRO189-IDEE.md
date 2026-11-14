# Giro 189 — Seconda tornata di idee e migliorie per Korward Elite

Versione provata: **7.999.192** (file di gioco del ramo `lavoro/193`, commit `b567a78`; la Home mostra «v 7.999.192»).
Solo analisi e proposte: **nessuna modifica a `src/`, a `GAME_VERSION`, ad `assets/` o a `tests/`**. Nessuna catena di controlli.
Ramo di consegna: `collaudo/giro189-idee`.

**Come leggere le fonti.** Ogni affermazione porta un'etichetta:

- **[visto]** = l'ho visto giocando in questa sessione (Chromium senza schermo; telefono 390×844 e PC 1366×768). La foto citata è in `docs/collaudo/giro189/` (`-tel` = telefono, `-pc` = PC).
- **[misurato]** = numero preso in questa sessione (conteggi sui testi delle schermate, secondi di orologio).
- **[letto nel codice]** = riga del sorgente o documento del repo, citato per nome.
- **[ipotesi]** = mia lettura, non verificata.

Dove non ho potuto verificare scrivo «Non posso confermarlo».

**Cosa non ripropongo.** Le 22 proposte del giro 181 (G181-01…22, comprese la 09 «altri ruoli» scartata dal PO e la 21 «sfida del giorno» non scelta) e le voci già in BACKLOG: PO-367, PO-373, PO-376, PO-380…395, PO-401, PO-402, PO-403. Dove una mia osservazione tocca una di queste voci lo scrivo e la lascio come prova in più, non come proposta.

---

## 0. Per il PO: le 10 migliori

Ordinate per rapporto valore/costo. I costi sono **stime mie** in giri.

| # | Proposta | Cosa cambia per chi gioca | Valore | Costo | Rischio | Tocca decisioni chiuse? |
|---|---|---|---|---|---|---|
| 1 | **G189-06** Offerte dei provini stabili e spiegate | Le offerte non cambiano più riaprendo l'app; capisci perché hai avuto quei club e cosa ti promette ognuno | alto (primi 15 minuti) | 1-2 | basso | in parte: provini chiusi con PO-321 |
| 2 | **G189-01** Mai una partita da una sola azione | Se scegli «Gioca», tocchi il pallone almeno 4 volte; oggi può capitare 1 volta in 90 minuti | alto | 2 | medio | no (PO-221 fissa l'obiettivo 5-7) |
| 3 | **G189-09** Giudizi che non si contraddicono | Mister, barre e schede dicono la stessa cosa su come stai andando | alto | 2 | basso-medio | no; si lega a PO-391 |
| 4 | **G189-08** Il campionato parte da zero | Alla 1ª giornata niente «16ª in classifica» o «scontro al vertice»: c'è il pronostico della vigilia | medio | 1 | basso | sfiora la regola delle partite chiave (PO-364/384) |
| 5 | **G189-05** Nomi senza equivoci | Mai lo stesso cognome nelle due squadre, mai «TESTA addosso», stadi con un nome solo | medio | 1-2 | medio | no |
| 6 | **G189-03** Il passaggio che conta | Il filtrante buono vale anche se il compagno sbaglia: lo vedi in pagella e nei numeri | medio-alto | 1-2 | basso | no (PO-221 resta com'è) |
| 7 | **G189-11** Il galà visto dalla platea | Se non hai vinto nulla: una schermata sola, con «quanto ti è mancato» | medio | 1 | basso | sì: cerimonie chiuse il 20/10; da fare insieme a PO-388 |
| 8 | **G189-13** Apertura di stagione in due velocità | Dalla seconda stagione puoi leggere il riassunto e fare solo le scelte vere | medio | 1-2 | basso | no trovata |
| 9 | **G189-18** Rifiniture per Google Play viste giocando | Sei piccoli difetti che un giocatore nuovo nota subito | medio (store) | 1 | basso | no |
| 10 | **G189-02** «Alla prossima occasione» | Un tasto per saltare i minuti in cui non ti arriva il pallone | medio | 1-2 | basso-medio | sì: velocità fissate a 1×, 1,5×, 2× |

### Se ne facessi solo 3

1. **G189-06 — Offerte dei provini stabili e spiegate.** È il primo momento in cui il gioco dà un verdetto. Oggi il verdetto cambia riaprendo l'app e contraddice quello che la schermata prima ha appena detto («Prestazione da predestinato!» seguita da due club fra i più deboli). Su Google Play i primi 15 minuti decidono se uno resta.
2. **G189-01 — Mai una partita da una sola azione.** Chi sceglie «Gioca» invece di «Simula» vuole giocare. Ho giocato una partita di campionato con una sola azione mia in 90 minuti, e alla fine il mister mi ha detto «Sii più decisivo».
3. **G189-09 — Giudizi che non si contraddicono.** Nella stessa schermata: fiducia del mister 93/100 e «Non sei ancora quello che cerco, ti aspetta più panchina». Chi gioca non sa più a cosa credere, e smette di leggere.

---

## 1. Cosa ho visto

### 1.1 Cosa ho giocato

| Cosa | Dove | Come | Esito |
|---|---|---|---|
| Creazione del calciatore («Dario Ferrante») | telefono | da zero | foto `03-crea-tel.png` |
| 3 provini dal vivo (più altri 3 di prova, uno a 1× per i tempi) | telefono | a 2× | 0 gol 1 assist 7,0 · 0 gol 1 assist 7,0 · 2 gol 7,8 → totale 2 gol, 2 assist, voto 7,3 (`11-dopo-provini-tel.png`) |
| Offerte | telefono | aperte quattro volte di fila | sempre 2 club di Primavera 2, ogni volta diversi (vedi 1.4) |
| **Stagione 1 — Primavera** (FC Cremona Primavera, Primavera 2) | telefono | sett. 1-6 «Simula» dalla Home; sett. 7 **dal vivo**; sett. 8-37 con «Vai al prossimo momento importante» e simulate; sett. 38 **dal vivo** | 5° posto · 34 presenze · 8 gol · 5 assist · OVR 66→68 |
| Fine Primavera e firma | telefono | una schermata | primo contratto con FC Cremona, Lega B (`31-chiusura-st1-00-tel.png`) |
| **Stagione 2 — professionista** (FC Cremona, Lega B) | PC | apertura completa (ritiro, presidente, mercato, conferenza, maglia, presentazione); sett. 1-38 con «Vai al prossimo momento» e simulate | 15° su 18 · 36 presenze · 7 gol · 2 assist · OVR 68→71 · Coppa: fuori ai quarti |
| Una partita di Lega B dal vivo (3ª giornata) | PC | a 2×, su una copia del salvataggio | 3–0, 7 azioni mie, 1 assist, voto 7,2 (`61-live-pro-02-pc.png`, `62-dopo-live-pro-pc.png`) |
| Galà, premi, bilancio della stagione 2 | PC | tutte le buste, poi anche «Salta il galà» | nessun premio mio (`45-chiusura-st2-06-pc.png`, `46-premi-st2-pc.png`, `47-bilancio-st2-pc.png`) |
| Schede Stagione, Club, Carriera, Agente, Ufficio | telefono | col salvataggio da professionista | foto da `50-home-pro-tel.png` a `56-figurina-carriera-tel.png` |

In tutto: 9 partite giocate dal vivo (6 provini, di cui 3 validi per la carriera; 2 di Primavera; 1 di Lega B), circa 70 simulate, 2 stagioni chiuse.

**Limiti dichiarati.**
- Le azioni le ha scelte un pilota semplice (a rotazione fra i tasti): **non posso dire nulla sulla difficoltà vera**.
- Browser senza schermo: tempi e fluidità non sono quelli di un telefono. Non ho ascoltato l'audio.
- Sul tasto «Vai al prossimo momento»: il mio pilota fra una pressione e l'altra toccava anche «Vivi la settimana», quindi **non posso confermare** quante settimane salta davvero per volta.
- Non ho giocato Nazionale, coppe europee, infortuni, fine carriera.
- Una stagione sola per tipo: i numeri sono esempi, non medie.

### 1.2 Cosa funziona bene

- **La partita si vede bene su tutti e due i formati.** Campo 2D con cronaca e pagelle vive (`08-prov1-01-tel.png`), azione in 3D con le tre scelte sotto (`28-ultima-02-tel.png`), tabellone e pubblico coi colori del club su PC (`61-live-pro-02-pc.png`) [visto].
- **La serata di presentazione ti dà tre facce da ricordare**: «il rivale interno», «il mentore», «l'amico» [visto]. Tornano poi nella scheda Club con una barra di legame (`52-club-tel.png`).
- **Il bilancio di fine stagione è ricco**: film della stagione, obiettivi, rivale, movimenti di lega, parole del presidente (`47-bilancio-st2-pc.png`) [visto].
- **Il gioco non perde la partita se chiudi l'app**: alla riapertura «Risultato recuperato: la partita era finita quando l'app si è chiusa — esito salvato» [visto, 2 volte].
- **Il tasto «Vai al prossimo momento» spiega prima cosa farà**: «4 partite simulate, poi Sfida alla capolista contro FC Pugliese Primavera (sett. 14)», e al ritorno riassume le scelte fatte da solo [visto, `27-fine-primavera-tel.png`].
- **I provini si riprendono**: chiusa l'app dopo il terzo provino, alla riapertura ero alle offerte [visto].

### 1.3 Cosa annoia

- **Una partita dal vivo può avere una sola azione tua.** 7ª giornata di Primavera, giocata a 2× in 101 secondi: l'unica azione mia è stata un contrasto al 47'. Poi all'82' la domanda del mister, e basta. Dopo la partita: «Abbiamo vinto ma mi aspetto di più da te. Sii più decisivo.» [misurato, `23-dopo-partita-tel.png`]. Nelle altre due partite di campionato dal vivo le azioni sono state 7 e 7; nei tre provini validi 19 in tutto. L'obiettivo scritto in PO-221 è 5-7 a partita [letto in BACKLOG].
- **Lunghi minuti senza toccare palla.** Primo provino a 1×: dal 21' al 76' nessuna azione mia, 92 secondi di orologio a guardare [misurato]. Nella 7ª di Primavera: dall'1' al 47' e dal 47' all'82'.
- **Il galà quando non vinci niente.** Stagione 2: 5 premi, 19 tocchi per aprire tutte le buste, e 5 volte la riga «Non eri in corsa per questo premio» (`45-chiusura-st2-06-pc.png`) [misurato]. Il podio dell'MVP è lo stesso del capocannoniere, con gli stessi 18-19-19 gol (già notato dal giro 181).
- **L'apertura della stagione da professionista è lunga.** Circa 30 tocchi prima della prima partita: 6 passi, di cui il ritiro sono circa 9 pagine di «Avanti →» e la presentazione altre 6 o più [misurato]. Nel ritiro le tre amichevoli sono solo raccontate: «FC Cremona 1-1 Selezione Alpe Chiara. Il tuo voto: 7.1» [visto].
- **Il passaggio buono non paga.** Ultima di Primavera: 3 passaggi riusciti su 3 e tre volte il compagno sbaglia («la difesa chiude SERRA sul tiro», «SERRA spreca», «RIZZI si fa parare il tiro») [misurato su una partita]. Il giro 181 aveva visto 5 su 5. Nei provini e in Lega B due assist veri: non è sempre così. Campione piccolo.
- **Frasi che tornano uguali.** Il mentore racconta «quella volta che perse la finale» alla settimana 5 e di nuovo alla 12 [visto]. Dopo due vittorie diverse (0–1 in Primavera, 3–0 in Lega B) la rassegna ha le stesse quattro righe: «Blocco difensivo impeccabile. Il contropiede ha fatto la differenza», «Solidità premia…», «VITTORIA FONDAMENTALE!», «Tattica vincente…» [visto, `23-dopo-partita-tel.png` e `62-dopo-live-pro-pc.png`]. Lo segnalo come prova per PO-385 e PO-375, non come proposta.

### 1.4 Dove ci si perde o non ci si crede

- **Le offerte dei provini cambiano se riapri l'app.** Stessi provini (2 gol, 2 assist, 7,3), quattro aperture: FC Bruzio + FC Empolese (`12-offerte-tel.png`), poi FC Lariano + FC Salernum, poi FC Cremona + FC Modenese [visto]. Motivo: la lista è ordinata con `Math.random()` a ogni apertura [letto nel codice, `src/17-menu-creazione-pannelli.jsx` r.568].
- **Il verdetto dei provini non torna con le offerte.** La schermata dice «Prestazione da predestinato!» e «Bella prova, gli scout ti hanno notato»; le offerte sono 2, tutte di Primavera 2, prestigio fra 23 e 38 su 100. La regola è un punteggio `gol×2 + voto medio×5`: sopra 50 hai 3 offerte dai club migliori, sotto 50 hai 2 offerte **dai club più deboli** [letto nel codice, stessa riga]. Con voto 7,3 servono 7 gol in tre provini per passare la soglia. Niente di questo è detto a chi gioca.
- **La classifica esiste prima che si giochi.** Settimana 1, zero partite: «8° posto», l'avversario è «16ª in classifica» con l'avviso «⚠️ Avversario in zona retrocessione» (`14-home-primavera-tel.png`, `17-home-sett1-tel.png`). In Lega B, sempre alla 1ª giornata: «2ª in classifica» contro «3ª in classifica · ⚔️ Scontro al vertice» [visto].
- **Giudizi che si smentiscono a vicenda** [visto]:
  - fine stagione 2: «Fiducia del mister 93/100» e, due righe sotto, «L'esame del nuovo mister: media 6.4, non abbastanza. Ti aspetta più panchina» (`44-pro-fine-campionato-pc.png`);
  - la riga del profilo dice «in rotazione» a un giocatore con 36 presenze su 36, e «Primavera» nella prima settimana da professionista (`40-home-pro-pc.png`);
  - bilancio: 2 obiettivi falliti su 3 («Segna 13 gol: 7/13», «Finisci nei primi 12: 15°») e subito sotto «+8 morale · 10 fiducia» (`47-bilancio-st2-pc.png`);
  - il tasto del momento si ferma su «⚽ Partita chiave · 🏆 Sfida alla capolista» e la partita mostrata è contro la 17ª «in zona retrocessione» (`27-fine-primavera-tel.png`);
  - alla 2ª settimana da professionista, dopo 1 partita, il procuratore: «Abbiamo fatto parecchia strada negli ultimi mesi» (`42-procuratore-sett2-pc.png`).
- **Numeri poco credibili per un ragazzo.** Valore di mercato: €800 mila alla settimana 1, €3,8 milioni alla settimana 10, dopo 8 partite e 2 gol in Primavera 2; l'obiettivo del procuratore per l'intera stagione era «da €800 mila a €1,1 mln» [visto]. Settimana 19: offerta ufficiale da un club di prima divisione estera (prestigio 70), da titolare, €455 mila l'anno, a un 17enne con 3 gol in 17 partite (`25-offerta-sett19-tel.png`). Questa offerta è già nota: giro 153 §1.4, da sostituire con l'idea 2 di PO-356 [letto in `PRIMAVERA-153.md`]. Popolarità 59→94 su 100 nella prima stagione di Lega B chiusa al 15° posto (tema già in PO-391).
- **Stessi cognomi nelle due squadre.** 7ª di Primavera: LONGO e RIZZI giocano sia nel Salernum sia nel Cremona (`21-formazioni-tel.png`). Ultima di Primavera: «ANTONELLI ti marca stretto», e Antonelli è anche un mio compagno. In Lega B un difensore si chiama Testa: «🎯 Palla in area, TESTA addosso!» [visto].
- **Lo stadio cambia nome.** Stessa partita, schermata prima della gara aperta due volte: «Campo Sportivo Lambro», poi «Arena Academy Nord» [visto nei testi; foto `19-prepartita-tel.png` per la prima].
- **Il calciatore cambia corpo.** Alla creazione la figurina dice «187 cm · 80 kg» (`03-crea-tel.png`); in carriera la stessa figurina dice «170 cm · 63 kg» (`56-figurina-carriera-tel.png`). Il piede («Piede sinistro») compare solo nella scheda di fine Primavera: non l'ho scelto e non l'avevo mai visto prima [visto].
- **Nell'azione non vedi il compagno di cui si parla.** «Uno-due con SERRA… SERRA taglia alle spalle della difesa»: nell'inquadratura su telefono ci sono solo io, un difensore e il portiere (`28-ultima-02-tel.png`). Il testo dice «MONTI esce in ritardo», il cartellino sul difensore dice «ANTONELLI» [visto]. È lo stesso tema del difetto D1 del giro 170: lo confermo e non lo ripropongo.
- **La Primavera finisce senza un saluto.** Una schermata sola con le opzioni di contratto, poi sei in Lega B. La figurina in quella scheda è vuota (`31-chiusura-st1-00-tel.png`) [visto]. Per il professionista ci sono galà, premi, bilancio, film della stagione.
- **Finestre che non tornano.** Ho chiuso l'app due volte con una finestra aperta (una scelta della settimana; l'offerta ufficiale della settimana 19). Alla riapertura la finestra non c'era più [visto]. **Non posso confermare** se la scelta sia stata applicata da sola, rimandata o persa.
- **Tasti e testi dell'apertura fuori posto** [visto]: dopo la serata di presentazione il tasto grande della Home dice ancora «🏁 AVVIA STAGIONE — ritiro, raduno e presentazioni» (`17-home-sett1-tel.png`); la finestra dice «riprendi quando vuoi col tasto Avanza», ma un tasto con quel nome non c'è; nella griglia del numero di maglia (65-82 numeri) il tasto «Conferma» sta sotto, fuori schermo.

### 1.5 Cosa un appassionato si aspetta e non trova

| Attesa | Oggi |
|---|---|
| Chi batte rigori e punizioni lo decide una gerarchia | A 17 anni, nuovo arrivato, le punizioni dal limite sono mie in ogni partita in cui capitano: provini (72', 85'), ultima di Primavera, 3ª giornata di Lega B [visto]. Non so se esista una regola: nessuna voce trovata in BACKLOG o DECISIONI («rigorista»: 0 risultati) |
| Giocare un'amichevole estiva | Solo raccontate nel ritiro [visto] |
| Numeri da bar: gol di testa, di sinistro, su punizione; contro chi segni di più | Nella scheda Carriera ci sono gol, assist, presenze, valore, record, «match del cuore» (`53-carriera-tel.png`). Non ho trovato i gol divisi per tipo o per avversario [visto; ricerca nel codice senza risultati: **non posso confermare** che non esistano altrove] |
| Scegliere piede e statura | Assegnati; statura incoerente fra due schermate [visto] |
| Un pronostico prima che il campionato cominci | C'è una classifica già ordinata alla 1ª giornata [visto] |
| Sapere a quanto eri dal premio | «Non eri in corsa per questo premio», senza altro [visto] |

### 1.6 Rifinitura per Google Play: cose viste, già note altrove

Le riporto perché le ho incontrate; **non** sono proposte nuove.
- Il tasto ⚠️ accanto alla pausa apre il **taccuino di collaudo** («codice 007 · camera traballa…») anche a chi gioca: è acceso di serie (`DEVTOOLS_DEFAULT=true`, `src/08-panchina-derby-meteo-cori.jsx` r.978) [letto nel codice; visto nel primo provino]. È già segnato come DT-08 nella mappa di gioco.
- Il tasto «☕ Sostieni il progetto»: il PO ha deciso «Tenere» il 07/11 accettando il rischio [letto in DECISIONI]. Non lo tocco.
- Testi: «fallo di un giocatore su un giocatore» c'è ancora [visto]: è G181-01/PO-380.
- Morale a 100 alla settimana 6, fiducia a 95 alla settimana 3 da professionista [visto]: è PO-391.

---

## 2. Le proposte (18)

Ogni scheda: cosa ho visto · proposta · cosa cambia per chi gioca · valore · costo stimato in giri · rischio · conflitti con decisioni chiuse o voci aperte.

### A. In partita

**G189-01 — Mai una partita da una sola azione**
- *Visto:* 7ª di Primavera dal vivo: 1 azione mia in 90 minuti, e il mister che chiede di essere «più decisivo» [misurato]. Altre partite: 6-7.
- *Proposta:* quando chi gioca sceglie «Gioca», la partita garantisce almeno 4 azioni dell'eroe. Prima si misura quante partite oggi stanno sotto 4 (per categoria e per ruolo in squadra); poi si alza il minimo senza toccare la media.
- *Per chi gioca:* scegliere «Gioca» vuol dire sempre giocare.
- *Valore:* alto. *Costo:* 2 (1 di misura, 1 di correzione). *Rischio:* medio: tocca il motore della partita e la regola «stessa partita, stesso risultato».
- *Conflitti:* nessuna decisione contraria. PO-221 (FATTO) fissa l'obiettivo a 5-7 azioni di media: la proposta aggiunge un minimo, non cambia la media. Da tenere d'occhio il tetto per non allungare la partita.

**G189-02 — «Alla prossima occasione»**
- *Visto:* 92 secondi a 1× senza un'azione mia (dal 21' al 76') [misurato].
- *Proposta:* accanto alla velocità, un tasto che fa correre la partita fino alla prossima azione dell'eroe, a un gol o a una domanda del mister. Chi vuole guardare la cronaca non lo tocca.
- *Per chi gioca:* una partita dal vivo dura quanto le sue azioni; sul telefono, in piedi sull'autobus, è la differenza fra finirla e chiuderla.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso-medio (la cronaca corre troppo per essere letta: è voluto, ma va detto).
- *Conflitti:* **tocca** la scelta delle tre velocità 1×, 1,5×, 2× (regola scritta in CLAUDE.md, 7.489). Il risultato non cambia, perché la partita è la stessa a ogni velocità. Decide il PO.

**G189-03 — Il passaggio che conta**
- *Visto:* 3 passaggi riusciti su 3 sprecati dal compagno in una partita; il voto dopo ognuno è rimasto fra 5,9 e 6,2 [misurato].
- *Proposta, in due parti:* (a) il passaggio riuscito che porta al tiro diventa una voce propria, «occasione creata», in pagella, nel tabellino e nei numeri di carriera, con un peso sul voto anche se il compagno sbaglia; (b) misurare su molte partite quante volte il compagno segna dopo un passaggio riuscito, e portare il dato al PO prima di toccarlo.
- *Per chi gioca:* passare torna a essere una scelta sensata, non un tiro buttato via.
- *Valore:* medio-alto. *Costo:* 1 per (a), 1 per (b). *Rischio:* basso per (a).
- *Conflitti:* PO-221 ha già misurato 0,15 assist a partita e resta com'è; (a) non cambia nessuna probabilità. La parte (b) è solo misura.

**G189-04 — Chi batte rigori e punizioni**
- *Visto:* punizioni dal limite all'eroe diciassettenne in quattro partite su nove giocate [visto].
- *Proposta:* nella scheda Club compare «Calci piazzati: 1° Serra · 2° tu». Si sale con la fiducia del mister e con i piazzati riusciti. Finché non sei il primo, sui piazzati hai un ruolo diverso (sponda, ribattuta, barriera da saltare); quando lo diventi, è un traguardo che il gioco festeggia.
- *Per chi gioca:* un obiettivo da calciatore vero, che si conquista in campo.
- *Valore:* medio. *Costo:* 2-3. *Rischio:* medio.
- *Conflitti:* **da pesare con PO-065** («più angoli e punizioni, tornano i rigori»): il numero di scene sui piazzati non deve scendere, cambia solo il ruolo dell'eroe all'inizio. Servono scene nuove: si lega a PO-373 (scene 3D) e PO-367 (gesti). Nessuna voce su «rigorista» trovata.

**G189-05 — Nomi senza equivoci**
- *Visto:* LONGO e RIZZI in tutte e due le squadre; ANTONELLI avversario e compagno; «TESTA addosso!»; stadio con due nomi per la stessa partita.
- *Proposta:* (a) nelle due formazioni della stessa partita nessun cognome ripetuto; (b) fuori dalla lista dei cognomi quelli che sono parole del calcio (Testa, e gli altri che una ricerca troverà); (c) il nome dello stadio viene dal club e resta quello.
- *Per chi gioca:* quando la cronaca dice «Rizzi» sai di chi parla.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* medio: i nomi nascono da un seme; cambiando la regola i nomi delle carriere già iniziate possono cambiare. Va fatto solo sulla partita che si apre, senza toccare i salvataggi.
- *Conflitti:* nessuno. Precedente utile: PO-215 ha già tolto gli omonimi fra gli allenatori.

### B. Il primo quarto d'ora

**G189-06 — Offerte dei provini stabili e spiegate**
- *Visto e letto nel codice:* offerte diverse a ogni riapertura; soglia nascosta che dà i club più deboli a chi sta sotto; «Prestazione da predestinato!» smentita dalle offerte.
- *Proposta:* (a) le offerte nascono dal nome e dai risultati dei provini, quindi sono sempre le stesse; (b) la schermata dice in una riga perché: «2 gol e voto 7,3: ti hanno cercato club di Primavera 2. Per la Primavera 1 serviva di più sotto porta»; (c) ogni offerta mostra cosa promette, come già fa la scheda di fine Primavera (ruolo, mister, stadio, crescita); (d) i titoli dopo ogni provino usano la stessa misura delle offerte.
- *Per chi gioca:* il primo verdetto del gioco è onesto e si capisce; riaprire l'app non è un trucco per cambiare club.
- *Valore:* alto. *Costo:* 1 per (a)+(d), 1 per (b)+(c). *Rischio:* basso.
- *Conflitti:* i provini sono stati rifatti e chiusi con PO-321 (08/11): riapre in piccolo. La parte (a) attua la regola «niente sorteggi non seminati».

**G189-07 — Un calciatore coerente, e un po' più tuo**
- *Visto:* 187 cm · 80 kg alla creazione, 170 cm · 63 kg in carriera; piede sinistro mai mostrato né scelto.
- *Proposta:* (a) una sola statura e un solo peso in tutte le schermate; (b) alla creazione si vede e si sceglie il piede preferito; (c) facoltativo: tre stature fra cui scegliere, solo d'aspetto.
- *Per chi gioca:* il calciatore è lo stesso dalla prima all'ultima schermata, e il piede è una cosa sua.
- *Valore:* medio-basso. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* il PO ha scartato «archetipi e stili». Il piede oggi entra già nei calcoli della partita [letto in CLAUDE.md, «piede preferito F8»]: farlo scegliere è una piccola leva di gioco. Se il PO non la vuole, restano (a) e il solo mostrare il piede.

**G189-08 — Il campionato parte da zero**
- *Visto:* posizioni, «zona retrocessione» e «scontro al vertice» alla 1ª giornata.
- *Proposta:* fino alla 3ª giornata la Home mostra il pronostico della vigilia («fra le favorite», «da metà classifica», «neopromossa») e il piazzamento dell'anno prima. Le etichette «scontro al vertice», «zona retrocessione», «sfida alla capolista» compaiono solo dalla 5ª giornata.
- *Per chi gioca:* la prima schermata della stagione non dice una cosa che non può essere vera.
- *Valore:* medio. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* le stesse etichette decidono dove si ferma il tasto «prossimo momento» (PO-364, PO-384): alla settimana 3 mi ha annunciato una «Sfida alla capolista». La regola va cambiata in un posto solo, e va detto al PO che a inizio stagione il tasto si fermerà meno.

### C. La carriera negli anni

**G189-09 — Giudizi che non si contraddicono**
- *Visto:* i cinque casi del punto 1.4.
- *Proposta:* un giro di verifica su tutti i testi che danno un giudizio (mister dopo la partita, verifica trimestrale, esame del nuovo mister, bilancio, procuratore, riga del profilo). Ognuno deve leggere lo stesso stato: «titolare», «in bilico», «riserva». E deve sapere poche cose in più: quante azioni hai avuto, da quante settimane sei al club.
- *Per chi gioca:* se il mister dice «panchina», la barra non dice 93.
- *Valore:* alto: la fiducia nei testi è ciò che tiene in piedi un gioco fatto di testi. *Costo:* 2. *Rischio:* basso-medio.
- *Conflitti:* nessuno. Va fatto insieme a PO-391 (fiducia e popolarità a gradini), che ridisegna la stessa barra.

**G189-10 — La Primavera saluta**
- *Visto:* fine Primavera in una schermata, con la figurina vuota.
- *Proposta:* tre schede prima delle offerte: il giudizio del mister della Primavera sull'anno; che fine fanno il rivale interno, il mentore e l'amico presentati a inizio stagione; la foto di squadra con la tua figurina. Poi le offerte come oggi.
- *Per chi gioca:* il primo anno ha una fine, e i tre compagni conosciuti alla presentazione non spariscono nel nulla.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso.
- *Conflitti:* **tocca** le cerimonie, chiuse «per il momento» il 20/10 (PO-002/137). Non tocca le idee di PO-356 (chiamate in prima squadra, salto a gennaio, obiettivi, tornei): viene dopo di loro.

**G189-11 — Il galà visto dalla platea**
- *Visto:* 19 tocchi e 5 volte «Non eri in corsa».
- *Proposta:* se non sei candidato a nessun premio, il galà è una schermata sola coi premiati. Sotto ogni premio a cui potevi arrivare, una riga: «Giovane dell'anno: 10 gol e 5 assist. Tu 7 e 2». La distanza più piccola diventa un obiettivo personale della stagione dopo.
- *Per chi gioca:* una serata in cui non vinci dura dieci secondi e ti lascia un bersaglio.
- *Valore:* medio. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* **tocca** le cerimonie chiuse il 20/10. PO-388 (galà con la sorpresa, dal giro 181) è già in programma: conviene farle nello stesso giro. Gli obiettivi personali esistono già («Batti il tuo record: 9+ gol») [visto].

**G189-12 — Un valore di mercato credibile da ragazzo**
- *Visto:* da €800 mila a €3,8 milioni in 9 settimane di Primavera 2; obiettivo annuale del procuratore superato di tre volte a ottobre.
- *Proposta:* in Primavera il valore cresce entro un tetto legato a categoria ed età; l'obiettivo del procuratore si calcola sullo stesso tetto, così resta un obiettivo fino a maggio.
- *Per chi gioca:* i numeri del primo anno sembrano quelli di un ragazzo, e il salto vero arriva con la firma da professionista.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* medio: il valore entra in stipendi e offerte, va rimisurato.
- *Conflitti:* **tocca** l'economia, chiusa «per il momento» il 20/10 (PO-157). L'offerta estera della settimana 19 è già trattata dal progetto Primavera (PO-356, idea 2): non la ripropongo.

**G189-13 — Apertura di stagione in due velocità**
- *Visto:* circa 30 tocchi prima della prima partita da professionista.
- *Proposta:* dalla seconda stagione da professionista, all'avvio due tasti: «Vivi l'apertura» (come oggi) e «Riassunto»: una schermata con ritiro, mercato e obiettivi, più le sole scelte vere (come vivi il ritiro, tono della conferenza, numero di maglia). In più: il tasto della Home cambia nome a apertura finita; via il riferimento al «tasto Avanza»; «Conferma» sempre visibile nella griglia dei numeri.
- *Per chi gioca:* alla quinta stagione non devi rileggere nove pagine di ritiro.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso.
- *Conflitti:* nessuna decisione trovata sull'apertura di stagione (il PO ha escluso questo percorso dal rifacimento del 07/11, senza decidere altro). Resta valida la regola «le scelte d'apertura vivono solo nel percorso guidato» (7.491).

**G189-14 — Un'amichevole del ritiro da giocare**
- *Visto:* tre amichevoli raccontate in tre righe.
- *Proposta:* una delle tre, a scelta, si può giocare in forma breve (un tempo, 3-4 azioni). Conta per le gerarchie del mister che il ritiro già annuncia. Chi non vuole va avanti come oggi.
- *Per chi gioca:* il primo pallone della stagione lo tocchi tu, con la maglia e il numero nuovi.
- *Valore:* medio. *Costo:* 2. *Rischio:* medio (una partita breve è un formato nuovo).
- *Conflitti:* il testo del ritiro dice che è voluto così («La società organizza, il mister decide… a te resta come vivi questo ritiro»). **Non ho trovato** la decisione scritta: da chiedere al PO. A favore: la regola del progetto «ogni competizione è giocabile» [letto in CLAUDE.md].

**G189-15 — I numeri da bar**
- *Visto:* la scheda Carriera non mostra i gol per tipo né per avversario.
- *Proposta:* in Carriera › Statistiche: gol di destro, di sinistro, di testa, su punizione, su rigore; minuti preferiti; «la tua vittima» (il club a cui hai segnato di più) e «la tua bestia nera». Si contano da quando la funzione esce; le carriere già iniziate partono da zero e la scheda lo dice.
- *Per chi gioca:* le cose che un tifoso racconta di un attaccante.
- *Valore:* medio (alto per gli appassionati). *Costo:* 2. *Rischio:* basso; campo nuovo nel salvataggio, solo aggiunto.
- *Conflitti:* nessuno. Diverso da G181-20 (album da completare): qui sono contatori, non una collezione. Possono condividere i dati.

### D. Solidità e uscita su Google Play

**G189-16 — Nessuna scelta si perde se chiudi l'app**
- *Visto:* due finestre (una scelta della settimana, un'offerta ufficiale) non riapparse dopo la chiusura. Non posso confermare che fine abbiano fatto.
- *Proposta:* prima un giro di misura: chiudere l'app su ogni tipo di finestra e vedere cosa succede. Poi la regola: una finestra con una scelta, se chiusa a metà, torna alla riapertura; un'offerta resta nella scheda Agente fino alla scadenza.
- *Per chi gioca:* su Android l'app in secondo piano può essere chiusa dal sistema; un'offerta sparita è una recensione negativa [ipotesi].
- *Valore:* medio-alto se la perdita è confermata. *Costo:* 1 di misura, 1-2 di correzione. *Rischio:* medio (tocca il salvataggio).
- *Conflitti:* nessuno. Vicina a PO-167 parte B (salvataggi) e a PO-224 (impulsi come finestre).

**G189-17 — La partita su PC usa tutto lo schermo**
- *Visto:* su PC la colonna di destra è quasi vuota durante l'esito (`61-live-pro-02-pc.png`); in basso ci sono «RATING», «ENERG.» e «WASD»; sul telefono le stesse voci sono icone.
- *Proposta:* nella colonna di destra, quando non c'è una scelta: cronaca recente e pagelle vive, che sul telefono ci sono già. Etichette in italiano («voto», «energia»).
- *Per chi gioca:* su PC la partita dà le stesse informazioni che dà sul telefono.
- *Valore:* basso-medio (il PC non è Google Play). *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuno trovato. Le parole inglesi rientrano nello spirito di PO-380.

**G189-18 — Rifiniture per Google Play viste giocando**
- *Visto, sei punti piccoli:*
  1. figurina vuota nella scheda di fine Primavera (`31-chiusura-st1-00-tel.png`);
  2. «⚽ Tuo punizione al 72'» nei momenti chiave del terzo provino;
  3. «Il 0-0 riflette…» e «Il FC Cremona» nella rassegna;
  4. «Sconosciuto» sopra il tuo nome nel «Duello della stagione» (`46-premi-st2-pc.png`);
  5. coro «FC CREMONA CAMPIONI! 🏆» sullo 0–0 alla 7ª giornata, con la squadra nona;
  6. «Under 18», «U18» e «Primavera» usati per la stessa cosa nella stessa scheda.
- *Proposta:* un giro solo che li chiude tutti, con una foto prima e dopo per ognuno.
- *Per chi gioca:* niente che faccia pensare a un gioco non finito.
- *Valore:* medio per lo store. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuno. Stessa famiglia di PO-380 (testi) ma punti diversi; il 6 si lega a PO-396 («Primavera» → «U19» quando non entra): va deciso un nome solo.

---

## 3. Quadro d'insieme

| Codice | Gruppo | Valore | Costo (giri, stima) | Rischio | Tocca un tema chiuso o una voce aperta |
|---|---|---|---|---|---|
| G189-01 Minimo di azioni | partita | alto | 2 | medio | no (PO-221 come riferimento) |
| G189-02 Prossima occasione | partita | medio | 1-2 | basso-medio | sì: le tre velocità |
| G189-03 Passaggio che conta | partita | medio-alto | 1-2 | basso | no |
| G189-04 Calci piazzati | partita | medio | 2-3 | medio | da pesare con PO-065 |
| G189-05 Nomi senza equivoci | partita | medio | 1-2 | medio | no |
| G189-06 Offerte dei provini | primo impatto | alto | 1-2 | basso | in parte: PO-321 |
| G189-07 Calciatore coerente | primo impatto | medio-basso | 1 | basso | piede: decide il PO |
| G189-08 Campionato da zero | primo impatto | medio | 1 | basso | sfiora PO-364/384 |
| G189-09 Giudizi coerenti | carriera | alto | 2 | basso-medio | no; insieme a PO-391 |
| G189-10 La Primavera saluta | carriera | medio | 1-2 | basso | sì: cerimonie |
| G189-11 Galà dalla platea | carriera | medio | 1 | basso | sì: cerimonie; insieme a PO-388 |
| G189-12 Valore credibile | carriera | medio | 1-2 | medio | sì: economia |
| G189-13 Apertura in due velocità | carriera | medio | 1-2 | basso | no trovata |
| G189-14 Amichevole del ritiro | carriera | medio | 2 | medio | da chiedere al PO |
| G189-15 Numeri da bar | carriera | medio | 2 | basso | no |
| G189-16 Nessuna scelta persa | solidità | medio-alto (se confermata) | 2-3 | medio | no |
| G189-17 Partita su PC | presentazione | basso-medio | 1 | basso | no |
| G189-18 Rifiniture Play | store | medio | 1 | basso | il punto 6 con PO-396 |

Totale stimato se si facesse tutto: 25-33 giri.

## 4. Cosa non ho verificato

- Nessuna prova su un telefono vero. Tempi, fluidità e audio non sono giudicati.
- Difficoltà e bilanciamento: il pilota sceglieva a rotazione.
- Il numero di azioni per partita (G189-01) viene da 9 partite: serve la misura larga prima di toccare.
- I passaggi sprecati (G189-03): una partita mia più le cinque del giro 181. Non è una media.
- Le finestre non riapparse (G189-16): viste due volte, causa non accertata.
- Quante settimane salta «Vai al prossimo momento»: non misurato (vedi limiti).
- I costi in giri sono stime mie.
- I conflitti con le decisioni chiuse li ho cercati per parole chiave in `DECISIONI.md` e `BACKLOG.md` e nel documento del giro 181: una decisione scritta con altre parole può essermi sfuggita.

## 5. Fonti e strumenti

- Gioco: `CARRIER-MANAGER-AV.html` del ramo `lavoro/193` (commit `b567a78`), aperto senza `?cpmtest=1`, cioè come lo vede chi gioca.
- 87 foto in `docs/collaudo/giro189/`.
- Strumenti in `docs/collaudo/giro189/strumenti/`: `lib189.mjs` e `gioca.mjs` (toccano i tasti per testo, fotografano, salvano lo stato fra un passo e l'altro), più i salvataggi intermedi in `strumenti/stati/` (per esempio `c11` = primo giorno da professionista, `d5` = fine stagione 2). Solo lettura sul gioco.
- Codice letto: `src/17-menu-creazione-pannelli.jsx` r.564-570 (offerte dei provini); `src/08-panchina-derby-meteo-cori.jsx` r.978-979 (strumenti di collaudo); `src/15-live-match.jsx` r.11168 (tasto ⚠️).
- Governo: `docs/governo/BACKLOG.md` (PO-065, 221, 321, 356, 364, 373, 376, 380-403), `docs/governo/DECISIONI.md` (07/11 donazione; 20/10 chiusure), `docs/governo/MAPPA_GIOCO.md` (DT-08).
- Giri precedenti: `docs/collaudo/GIRO181-IDEE.md` (ramo `collaudo/giro181-idee`), `docs/progetto/PRIMAVERA-153.md` (ramo `progetto/giro153-primavera`, §1.4 e §1.5).
