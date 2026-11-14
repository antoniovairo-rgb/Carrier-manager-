# Giro 193 — Terza tornata di idee: «da tifoso esigente, a tutto campo»

Versione provata: **7.999.193** (file di gioco del ramo `lavoro/194`, commit `7265b37`; la Home mostra «v 7.999.193»).
Solo analisi e proposte: **nessuna modifica a `src/`, a `GAME_VERSION`, ad `assets/` o a `tests/`**. Nessuna catena di controlli.
Ramo di consegna: `collaudo/giro193-idee`.

**Come leggere le fonti.** Ogni affermazione porta un'etichetta:

- **[visto]** = l'ho visto giocando in questa sessione (Chromium senza schermo; telefono 390×844 e PC 1366×768). Le foto sono in `docs/collaudo/giro193/` (`-tel` = telefono, `-pc` = PC); i testi completi delle schermate sono nei registri in `docs/collaudo/giro193/strumenti/log/`.
- **[misurato]** = numero contato in questa sessione sui registri o sul salvataggio.
- **[letto nel codice]** = riga del sorgente. Le righe marcate «mappa» vengono da una ricerca in sola lettura riassunta in `docs/collaudo/giro193/MAPPA-CODICE-ANNI-LUNGHI.md`: non le ho ricontrollate una per una.
- **[ipotesi]** = mia lettura, non verificata.

Dove non ho potuto verificare scrivo «Non posso confermarlo».

**Cosa non ripropongo.** G181-01…22 (la 09 «altri ruoli» è scartata: il giocatore resta attaccante), G189-01…18, le voci PO-376…430 del BACKLOG. Dove una mia osservazione tocca una di queste voci lo scrivo e la lascio come prova in più.

---

## 0. In breve

Ho giocato **cinque stagioni** dello stesso calciatore, dai 29 ai 34 anni, fino al ritiro e alla pagina finale. I giri 181 e 189 non erano mai arrivati qui.

Tre cose da sapere subito:

1. **La fine della carriera c'è ed è curata** (annuncio a 34 anni, giro d'addio con scelte sue, lettera, maglia ritirata, punteggio di eredità). Ma **l'ultima stagione non sa di esserlo** in molti testi, e **l'ultima partita è una partita qualsiasi**.
2. **Dai 29 ai 34 anni la carriera di un campione è la stessa stagione ripetuta**: 21-28 gol, fiducia, morale e popolarità a 100, stesso mister, stesso rinnovo, traguardi tutti già spuntati.
3. **Un rifiuto in una trattativa mi ha lasciato svincolato per una stagione intera** (0 partite a 31 anni, da capocannoniere di sempre e campione in carica), senza che il club richiamasse.

---

## 1. Cosa ho visto

### 1.1 Cosa ho giocato

Punto di partenza: il salvataggio di prova del progetto `tests/visual/fixtures/save-190-s12-ovr93.json` (stagione 12, settimana 38, 28 anni, OVR 93, 431 gol). **Non so** se viene da una carriera giocata o costruita: è lo stesso usato dal giro 181.

| Stagione | Età | Dove | Come | Esito |
|---|---|---|---|---|
| 12 (solo chiusura) | 28 | telefono | galà, parata, bilancio | campione, 49 gol (`02-bilancio-s12-tel.png`, `04-bilancio-s12-01-tel.png`) |
| **13** intera | 29 | telefono | «Vai al prossimo momento» + simulate; 1 partita dal vivo | 3° posto, 28 gol, 44 presenze; fuori ai gironi di coppa europea |
| **14** intera | 30 | PC | come sopra; 1 partita della Nazionale dal vivo | campione, 21 gol; Coppa delle Nazioni |
| 15, primo tentativo | 31 | telefono | simulata | **0 partite: svincolato tutta la stagione** (vedi 1.4) |
| **15** rifatta | 31 | telefono | rinnovo firmato alla settimana 1, poi come sopra | 4° posto, 21 gol, 500° gol in carriera |
| **16** intera | 32 | PC fino alla sett. 21, poi telefono | come sopra; 1 qualificazione mondiale dal vivo | 22 gol; Mondiale mancato |
| 17 | 33 | — | **saltata con lo strumento di prova** (vedi sotto) | 23 gol, 44 presenze |
| **18** intera, d'addio | 34 | telefono | annuncio del ritiro, giro d'addio, ultima partita dal vivo, cerimonia, pagina finale | 3° posto, 21 gol; ritiro a 568 gol e 763 presenze |

In tutto: **5 stagioni intere** (13, 14, 15, 16, 18), **4 partite dal vivo** (coppa europea 0–3 su telefono; Coppa delle Nazioni 1–1 su PC; qualificazione mondiale 0–1 su telefono; ultima di campionato 3–1 su telefono), circa 200 simulate.

**Limiti dichiarati.**
- **La stagione 17 non l'ho giocata.** L'ho saltata con `__CPM_CAREER` (lo strumento di prova del progetto, attivo solo con `?cpmtest=1`), che fa avanzare la carriera con gli stessi gestori del gioco ma senza schermate. Lo script è `strumenti/salta.mjs`. Lo stato a 34 anni è quindi **in parte costruito**.
- Le scelte le ha fatte un pilota semplice: a rotazione fra i tasti, rifiutando le offerte di mercato. **Non posso dire nulla sulla difficoltà vera.** Una conseguenza importante di questo pilota è raccontata al punto 1.4 (lo svincolo): la segnalo come limite, non la nascondo.
- Ho sempre rifiutato i trasferimenti: **non ho visto** cosa succede cambiando club dopo i 30 anni.
- Un solo calciatore, fortissimo (OVR 90-94). **Non ho visto** il veterano medio che perde il posto, né un infortunio.
- Browser senza schermo: tempi, fluidità e audio non sono giudicati. I registri conservano l'inizio di ogni schermata, non tutto il testo: quando dico «non compare» intendo «non compare in ciò che ho registrato».
- Stagione 12 chiusa due volte, stagione 15 giocata due volte, ultime sette settimane della 18 rigiocate una volta per arrivare all'ultima partita dal vivo.

### 1.2 Cosa funziona bene

- **Il giro d'addio.** A 34 anni l'apertura di stagione chiede «È l'ultima stagione?» (`38-ultima-stagione-domanda-tel.png`). Dopo l'annuncio arrivano scelte proprie: il documentario («Che sia un bel finale» o «niente telecamere nello spogliatoio»), il cambio all'85' («Accetto: quell'applauso vale una carriera» o «Voglio i novanta minuti»), il video di saluti con «l'ultimo a parlare è il tuo rivale di sempre» [visto, registro `e2.txt`].
- **«L'esordio del tuo erede»**: «Il club presenta Alex Lawrence, "il nuovo te"… Come lo accogli? Da mentore · Il posto è ancora mio» [visto, `37-apertura-s18-tel.png`].
- **La chiusura della carriera.** «Fine di un'era», lettera d'addio che cita il primo provino, le 11 stagioni e i 348 gol nel club, la moglie e i figli; «Il FC Merseyside RITIRA la maglia numero 8»; poi la pagina con percorso, premi, eredità fuori dal campo, verdetto della stampa, sfida col rivale (`46-addio-01-tel.png`, `47-fine-carriera-tel.png`, `48-fine-carriera-pagina-tel.png`) [visto].
- **Il presidente a fine carriera**: «le leggende non firmano rinnovi — lasciano il segno» [visto, `45-bilancio-addio-tel.png`].
- **Il film della stagione** cambia ogni anno e ricorda fatti veri: l'offerta rifiutata, il duello col nuovo attaccante, «la piazza mormora» dopo tre gare senza gol [visto, stagioni 13, 14, 18].
- **La vita fuori dal campo esiste**: incontro, matrimonio, figli [letto nel codice, `src/18-career-app.jsx` r.2700-2716; nel salvataggio finale `life: genitore, dalla stagione 6`].
- **La Nazionale si gioca davvero**, con i suoi stadi e le sue domande d'intervista (`19-live-nazioni-03-pc.png`, `21-home-dopo-nazioni-pc.png`, `33-live-mondiale-05-tel.png`) [visto].
- **Un traguardo di club**: «300 presenze con FC Merseyside: prima del fischio d'inizio il capitano ti consegna una maglia…» [visto nei registri].

### 1.3 Cosa annoia negli anni lunghi

- **Cinque stagioni quasi uguali** [misurato dal salvataggio finale]: gol 28, 21, 21, 22, 23, 21; presenze 41-44; OVR 94, 94, 93, 92, 91, 90. Fiducia del mister, morale e popolarità fra 93 e 100 dall'inizio alla fine. Stesso mister per sette stagioni. In banca da €92 a €200 milioni, con tutto già comprato (era già così alla stagione 12: giro 181).
- **Il calo c'è ma non cambia niente.** Fra i 31 e i 34 anni: velocità 86→77, fisico 92→82; tecnica, tiro e passaggio fermi [visto: `26-carriera-s15-tel.png` e salvataggio finale]. Il calciatore resta titolare ogni settimana, capocannoniere o quasi, nella squadra dell'anno 17 volte su 18 (`48-fine-carriera-pagina-tel.png`). La Home annuncia archi come «Il corpo comincia a parlare» e «La panchina che non ti aspettavi» [visto], ma la panchina non l'ho mai vista.
- **Traguardi finiti da anni.** A 31 anni, con 502 gol e 635 presenze, la lista dei traguardi è tutta spuntata tranne «OVR 95»: l'ultimo dei gol è «150 gol», delle presenze «200 partite» (`28-carriera-aperta-s15-tel.png`) [visto]. Il 500° gol è arrivato nella stagione 15: nei registri non c'è nessuna schermata che lo festeggi. **Non posso confermare** che non ci sia stata una notifica breve. Nel codice i traguardi di gol si fermano a 150 [letto nel codice, mappa: `src/17` r.1525].
- **Eventi che tornano.** Su 86 eventi settimanali diversi registrati, **23 li ho rivisti in almeno due stagioni e 5 in almeno tre** [misurato su 5 stagioni]. Alcuni sono fatti che nella vita capitano una volta: «Il vecchio massaggiatore va in pensione» (stagione 13 e di nuovo 16); «Si libera la maglia numero 10» (13 e 18). La cena col procuratore («Succede una volta ogni mai») è tornata in quattro stagioni su cinque.
- **Il procuratore dice le stesse cose a 29, a 32 e a 34 anni**: «Abbiamo fatto parecchia strada negli ultimi mesi… Dimmi sinceramente: sei felice qui?», con le stesse quattro risposte [visto, stagioni 13, 16, 18]. A 34 anni: «Sto spingendo il tuo nome nei posti giusti» (`36-home-s18-34anni-tel.png`).
- **Il rinnovo è sempre lo stesso foglio.** Quattro trattative (stagioni 13, 14, 15, 16): ogni volta «Proposta del club €25 mln / anno», tre tasti (accetta, +15%, +30%), durata decisa dal club (1 o 2 anni) (`12-rinnovo-s13-tel.png`) [visto]. Nessuna voce che non sia lo stipendio.
- **La convocazione** [misurato]: su 193 convocazioni, 85 (44%) sono due frasi: «Il mister ha scritto il tuo nome per primo sulla lavagna» (43) e «In settimana in allenamento sei stato il più brillante» (42). È lo stesso tema di G181-02 / PO-380: lo lascio come prova, non lo ripropongo.
- **Il tasto «Vai al prossimo momento»**: fra 12 e 25 pressioni a stagione [misurato sulle stagioni 13, 16, 18]. Nella stagione 14, dalla settimana 21 alla 38, si è fermato a ogni partita. È PO-384: prova in più, non proposta.
- **L'apertura di stagione alla diciottesima volta**: gli stessi 8 passi, il ritiro in 8 pagine, la serata di presentazione in 8 [visto, `e1.txt`]. È G189-13 / PO-425.

### 1.4 Dove ci si perde o non ci si crede

- **Svincolato per una stagione intera, da campione.** Stagione 14, settimana 15: il club apre la trattativa; il mio pilota chiede +30%, il club fa una controfferta, il pilota la rifiuta [visto, `b1.txt`]. Da lì **nessun altro invito a trattare** nei registri della stagione. Il bilancio di fine anno dice «Ultimo anno di contratto — occhio alle offerte». La stagione 15 parte così: «Sei svincolato: senza contratto il club non può schierarti», e va avanti per 38 settimane: **0 partite a 31 anni**, col calciatore campione in carica, miglior marcatore di sempre della lega, fiducia del mister 94/100 (`23-home-svincolato-s15-tel.png`) [visto].
  Cosa non torna in quello stato [visto, `23` e `24-agente-svincolato-tel.png`]:
  - la Home resta quella del club: allenamento, «Fiducia del mister 94/100», la scritta «riserva», eventi di spogliatoio («Il capitano: questo spogliatoio è anche tuo»);
  - il procuratore dice «Non avrei fretta di muovermi»;
  - la scheda Agente mostra «Stipendio attuale €33,1 mln l'anno» accanto a «Contratto scaduto», e il tasto «Richiedi cessione»;
  - l'obiettivo personale resta «Batti il tuo record: 22+ gol».
  Una persona vera avrebbe toccato «Negozia rinnovo» (il tasto c'è, e alla settimana 1 funziona: l'ho provato rifacendo la stagione). **Il difetto non è il blocco: è che il club non richiama e che l'anno da svincolato non è raccontato.** Il giro 94 (D3/D10) aveva già lavorato su «avviso di scadenza, rinnovo anche da svincolato, niente stagione del club da svincolato» [letto in BACKLOG r.785]: quello che ho visto può essere un residuo.
- **«Prima rispondi al rinnovo».** Il tasto del prossimo momento si blocca con questa scritta, senza dire dove (`10-home-s13w32-tel.png`). Il rinnovo sta più in basso nella Home («Negozia rinnovo») e nella scheda Agente [visto]. Lo stesso con «prima trova una squadra» e «prima la Nazionale».
- **Il Mondiale in una riga.** Stagione 16, 32 anni: due qualificazioni nella stessa settimana, poi la notifica «Qualificazioni Mondiale: non qualificati. Prossima volta!» [visto, `d3.txt`]. La scheda Nazionale diceva: Mondiale alla stagione 16, poi Europeo alla 20, Coppe delle Nazioni alla 18 e alla 22 (`29-nazionale-s15-tel.png`). Per un attaccante di 32 anni «la prossima volta» è a 40.
- **L'ultima partita è una partita qualsiasi.** Settimana 38 della stagione d'addio, in casa: la convocazione è la frase di sempre («In settimana in allenamento sei stato il più brillante»), il prepartita non dice nulla, il tasto del prossimo momento non la considera una partita chiave (l'ha simulata), e in 90 minuti giocati dal vivo nessun testo registrato parla di addio (`42-prepartita-ultima-tel.png`, `43-live-ultima-0N-tel.png`, `44-dopo-ultima-tel.png`) [visto]. Il cambio all'85' promesso dal giro d'addio non l'ho visto in questa partita: avevo scelto «Voglio i novanta minuti», quindi **non posso confermare** come appare l'altra strada.
- **L'ultima stagione non sa di esserlo** [visto, `45-bilancio-addio-tel.png`]: nel bilancio d'addio il mister dice «Ricarichiamo le pile e prossima stagione puntiamo più in alto»; il giudizio dice «stai diventando un punto di riferimento assoluto»; in fondo «Contratto attivo · 3 anni rimanenti». Lo stesso bilancio dice «Eliminato · 12 pt nel girone» e, sotto, «Corsa finita agli ottavi di finale».
- **Il verdetto della stampa non ha visto la carriera** [visto, `48-fine-carriera-pagina-tel.png`]: punteggio 968/1000 «Leggenda Assoluta», 4 Trofei d'Oro, 10 volte MVP; i tre giornalisti: «Professionista esemplare: quando contava, c'era quasi sempre», «Una firma affidabile del nostro calcio», «Carriera solida, tanti momenti memorabili». Nella lista dei premi c'è «Giovane dell'Anno» per sei stagioni di fila.
- **Mai capitano.** 11 stagioni nel club, 348 gol, fiducia 100: nel salvataggio finale `isCaptain: false` [misurato]. La regola: superati i requisiti, la fascia arriva con una probabilità del 10% a ogni occasione, e si perde quando cambia l'allenatore [letto nel codice, mappa: `src/18` r.5217-5233 e r.5752]. In nessuna schermata ho trovato scritto quanto manca alla fascia.
- **Compagni senza età.** A 34 anni e 547 gol la serata di presentazione mi presenta ancora «Il Mentore» (un centrocampista) e «Il Rivale Interno» [visto, `e1.txt`]. Alex Mason, che alla stagione 15 era «L'Amico» nello spogliatoio (`27-club-s15-tel.png`), alla 18 è annunciato come nuovo acquisto: «Il club ha preso Alex Mason — un attaccante… vuole il tuo posto» [visto]. I compagni non hanno età e non si ritirano [letto nel codice, mappa: `src/09` r.1241-1255].
- **L'energia si svuota e nessuno fa niente.** Qualificazione mondiale, 32 anni: energia 100% al 1', 20% al 41', **7% al 55'**; resto in campo fino al 90' [misurato, `d2.txt`]. Coppa europea a 29 anni: 24% al 66'. Ultima partita a 34: 20% alla fine. Sotto il 50% le giocate hanno un malus che arriva a −0,6 [letto nel codice, `src/15-live-match.jsx` r.1635]. Chi gioca vede il numero diventare rosso e non ha modo di rispondere. Tre partite: il calo dipende da quante azioni capitano, **non posso dire** che dipenda dall'età.
- **La Coppa delle Nazioni vinta e persa insieme.** Il bilancio della stagione 14 apre con «COPPA DELLE NAZIONI! Con la maglia della tua nazione sul tetto del torneo: da oggi sei leggenda» (`22-bilancio-s14-01-tel.png`); la scheda Nazionale dice «Coppa delle Nazioni S.14 · Eliminati (fase a gironi) · Punti: 10/9» (`29-nazionale-s15-tel.png`) [visto].
- **Piccole cose che stonano** [visto]:
  - «Gol Azzurro» fra i traguardi di un calciatore spagnolo;
  - «La città ti ricorda»: «Rispettato» nel club di 11 stagioni e 348 gol, «Leggenda» in quello di 4 stagioni;
  - la scheda Nazionale dice «la maglia numero 9 è tua», in campo ho l'8 (`33-live-mondiale-05-tel.png`);
  - in Nazionale il testo dell'azione dice «HUGHES esce in ritardo»: Hughes è un compagno di club, i difensori in campo si chiamano Harris e Price (stessa foto). È il tema D1 del giro 170;
  - «vorra'» con l'apostrofo al posto dell'accento, due volte nell'annuncio del ritiro;
  - la sfida «Sempreverde — gioca ancora a 34 anni o oltre» risulta non completata nel salvataggio dopo un'intera stagione giocata a 34 anni;
  - «in rotazione» accanto al nome, a 43 presenze su 43 (già G189-09 / PO-421);
  - su PC la finestra dell'intervista esce dal fondo dello schermo: la terza risposta è tagliata (`21-home-dopo-nazioni-pc.png`).

### 1.5 Cosa un appassionato si aspetta e non trova

| Attesa | Oggi |
|---|---|
| Traguardi «tondi» di una grande carriera (300, 400, 500 gol; 500 presenze; 100 in Nazionale) | Ultimo traguardo: 150 gol, 200 presenze [visto]. 500° gol senza festa nei registri |
| Il Mondiale come cammino | Due partite nella stessa settimana e una notifica [visto] |
| Fascia di capitano della Nazionale, addio alla Nazionale, primati di presenze e gol | Niente: 0 occorrenze [letto nel codice, mappa] |
| Un contratto con qualcosa oltre ai soldi | Solo stipendio; durata decisa dal club [visto] |
| Finire la carriera «a casa», o un'ultima avventura | Ritorno al primo club e campionati «di fine carriera»: 0 occorrenze [letto nel codice, mappa]. Non ho provato il mercato dopo i 30 |
| Gestire le forze dopo i 30 | Nessun comando; l'energia scende fino al 7% [visto] |
| Diventare capitano perché te lo sei meritato | Sorteggio al 10% [letto nel codice, mappa] |
| Compagni che invecchiano, smettono, si ritrovano da avversari | I compagni non hanno età [letto nel codice, mappa] |
| Un «dopo»: cosa fa la leggenda | Tre tasti: riepilogo da copiare, nuova partita con bonus, «gioca come figlio/a» [visto]. L'albo delle carriere è già in programma (PO-382) |
| L'ultima partita come evento | Partita qualsiasi [visto] |

---

## 2. Le proposte (18)

Ogni scheda: cosa ho visto · proposta · cosa cambia per chi gioca · valore · costo stimato in giri (stima mia) · rischio · conflitti con decisioni chiuse o voci aperte.

### A. Gli anni dopo i 30

**G193-01 — Il club ti richiama prima di perderti**
- *Visto:* una controfferta rifiutata alla settimana 15, poi silenzio; stagione dopo da svincolato, 0 partite, con la Home che racconta ancora la vita del club (1.4).
- *Proposta:* (a) se il contratto scade e il calciatore è importante per il club, il presidente richiama almeno due volte: a metà stagione e nelle ultime sei settimane, in una finestra che non si può non vedere; (b) a fine stagione, se il contratto è scaduto, una schermata sola con tre strade: rinnova, ascolta il mercato, fermati un anno; (c) da svincolato la Home cambia volto: niente fiducia del mister, niente eventi di spogliatoio, niente «Richiedi cessione»; al loro posto le telefonate del procuratore e i club che si fanno vivi.
- *Per chi gioca:* non si perde un anno di carriera per una finestra chiusa in fretta, e se succede è una storia, non un vuoto.
- *Valore:* alto. *Costo:* 1 di misura (quante carriere finiscono svincolate, e perché), 1-2 di correzione. *Rischio:* medio: tocca contratti e avanzamento della settimana.
- *Conflitti:* il giro 94 (D3/D10) ha già lavorato su avviso di scadenza e svincolo [BACKLOG r.785]: può essere un residuo, da confermare con la misura. Economia chiusa «per il momento» il 20/10 (PO-157). PO-155 del 20/10: «Svincolato, poi finestre + CT». Vicina a PO-408 (i riquadri delle scelte che «si perdono»).

**G193-02 — Il rinnovo da bandiera**
- *Visto:* quattro rinnovi identici: €25 mln, tre tasti, durata decisa dal club.
- *Proposta:* dai 28 anni, o dalla quinta stagione nello stesso club, la trattativa ha due voci in più a scelta: **durata** (1, 2 o 3 anni: più anni = più sicurezza, meno aumento) e **una promessa** fra due o tre offerte dal club in base alla tua storia (la fascia quando si libera; la maglia ritirata a fine carriera; un posto nel club dopo il ritiro). La promessa torna nei testi e alla fine viene mantenuta o tradita.
- *Per chi gioca:* firmare a 32 anni è una scelta diversa da firmare a 22.
- *Valore:* medio-alto. *Costo:* 2. *Rischio:* medio (le promesse vanno ricordate per anni: campo nuovo nel salvataggio, solo aggiunto).
- *Conflitti:* economia e contratti chiusi «per il momento» il 20/10 (PO-157). La maglia ritirata oggi arriva comunque nel club «bandiera» [visto]: la promessa la renderebbe una conquista dichiarata. Esiste già un momento «Contratto Simbolo» [letto nel codice, mappa: `src/03` r.1291]: va verificato che non si sovrappongano.

**G193-03 — Le energie del veterano**
- *Visto:* energia al 7% al 55', in campo fino al 90'; malus alle giocate sotto il 50%.
- *Proposta:* (a) quando l'energia scende sotto una soglia, il mister fa **una** domanda: «Ce la fai?» — resto (malus pieno, rischio), mi gestisco (meno azioni, più lucide), chiedo il cambio (esco fra gli applausi, voto congelato); (b) dai 31 anni, prima delle partite senza posta, una scelta in più nella finestra che c'è già: «gioco», «un tempo», «riposo»; chi riposa arriva più fresco alla partita che conta.
- *Per chi gioca:* dopo i 30 la carriera si gioca in modo diverso: scegliere quando esserci.
- *Valore:* alto negli anni lunghi. *Costo:* 2-3. *Rischio:* medio-alto: tocca la partita e la regola «stessa partita, stesso risultato».
- *Conflitti:* **tocca** il tetto di 2-3 interazioni col mister (PO-226/234/259): la domanda (a) deve prendere il posto di una di quelle, non aggiungersi. PO-156 (difficoltà per fasi di carriera, «declino») chiusa il 20/10: questa non cambia la curva, dà una leva. Vicina a G189-01 / PO-413 (minimo di azioni): «mi gestisco» non deve scendere sotto quel minimo. La scelta (b) è prima della partita, quindi non tocca PO-414.

**G193-04 — Capitano per merito**
- *Visto e letto:* mai capitano in 11 stagioni; la fascia è un sorteggio al 10%; si perde al cambio di allenatore.
- *Proposta:* nella scheda Club una riga «Fascia: capitano X · vice Y · tu 3°» con ciò che manca a parole («altre 20 presenze», «la fiducia dello spogliatoio»). Superati i requisiti, la fascia arriva alla prima occasione vera (il capitano lascia, si ritira, viene ceduto), senza sorteggio. Con un mister nuovo la fascia resta, salvo crisi di fiducia.
- *Per chi gioca:* un obiettivo da uomo-squadra che si vede avvicinare.
- *Valore:* medio-alto. *Costo:* 2. *Rischio:* basso-medio.
- *Conflitti:* nessuna decisione contraria trovata. Stessa forma di G189-04 / PO-416 (gerarchia dei piazzati nella scheda Club): conviene disegnarle insieme. PO-404 (la coppa passa dal capitano all'eroe): se l'eroe è capitano la scena cambia, come il PO ha già scritto.

**G193-05 — Traguardi fino a 500 gol, col conto alla rovescia**
- *Visto:* traguardi finiti a 150 gol e 200 presenze; 500° gol senza festa nei registri.
- *Proposta:* (a) scala lunga: 200, 300, 400, 500 gol; 300, 500, 700 presenze; 50 gol in Nazionale; 100 gol nello stesso club; 10 stagioni in doppia cifra; (b) in Home, quando mancano 3 gol o 3 presenze a un traguardo tondo, una riga: «A 2 gol dai 500»; (c) la partita in cui può arrivare è «partita chiave» per il tasto del prossimo momento; (d) al traguardo, il pallone firmato dai compagni entra in bacheca.
- *Per chi gioca:* negli anni lunghi c'è sempre un numero tondo all'orizzonte.
- *Valore:* alto per costo basso. *Costo:* 1-2. *Rischio:* basso (dati già presenti nel salvataggio).
- *Conflitti:* nessuno. Diversa da G181-14 / PO-390 (sfide scelte a metà carriera) e da G181-20 (album): qui sono traguardi automatici. Il punto (c) tocca la regola delle partite chiave (PO-364/384): va aggiunta come motivo raro, non come fermata in più a ogni settimana.

**G193-06 — Fatti che capitano una volta, e settimane da trentenne**
- *Misurato:* 23 eventi su 86 rivisti in due o più stagioni; il massaggiatore in pensione due volte; il «confronto» col procuratore identico a 29, 32 e 34 anni. Nel codice: 0 eventi casuali con condizione sull'età, 4 settimanali tutti per chi ha meno di 24 anni [letto nel codice, mappa].
- *Proposta:* (a) una marca «una volta per carriera» o «non prima di N stagioni» sugli eventi che sono fatti unici; (b) il confronto col procuratore in tre versioni per età (ragazzo, uomo maturo, veterano); (c) 25-30 eventi nuovi per chi ha 30 anni o più: il primo allenamento saltato per precauzione, il ragazzo che ti chiede com'era il calcio «ai tuoi tempi», l'ex compagno che ora allena, il figlio alla scuola calcio.
- *Per chi gioca:* la quindicesima stagione non rilegge la quinta.
- *Valore:* alto negli anni lunghi. *Costo:* 2-3 (soprattutto scrittura). *Rischio:* basso.
- *Conflitti:* **tocca** PO-154 (impulsi con memoria e catene), chiusa «per il momento» il 20/10. Stessa famiglia di PO-375 (interviste ripetute) e di G181-16 / PO-395 (il filo del paese): temi diversi, stessa regola di scrittura.

**G193-07 — Compagni con un'età**
- *Visto:* il «Mentore» presentato a un 34enne con 547 gol; l'«Amico» della stagione 15 ripresentato alla 18 come nuovo acquisto rivale.
- *Proposta:* (a) i tre personaggi dello spogliatoio hanno un'età e un tempo: il mentore smette (e ti lascia qualcosa), l'amico viene ceduto e lo ritrovi da avversario, il rivale interno diventa il tuo vice; (b) dai 30 anni i ruoli si rovesciano: il mentore sei tu, di un giovane che cresce, o non cresce, anche per le tue scelte; (c) un personaggio uscito di scena non torna con un altro ruolo.
- *Per chi gioca:* il tempo passa anche per gli altri.
- *Valore:* medio-alto. *Costo:* 2-3. *Rischio:* medio (i nomi nascono da un seme: va fatto senza cambiare le rose delle carriere già iniziate).
- *Conflitti:* PO-379 (i tre compagni «pescati» fuori dalla rosa) è la stessa zona: da fare dopo o insieme. «L'erede» dai 34 anni esiste già [visto]: la parte (b) lo anticipa e gli dà una storia di più stagioni. G181-13 / PO-359 («Il tuo allievo») è vicina ma parte dall'accademia, non dallo spogliatoio.

**G193-08 — L'ultimo contratto: tre strade**
- *Letto:* ritorno al primo club e campionati di fine carriera non esistono nel codice [mappa]; il valore di mercato scende a un quarto dopo i 33 anni [mappa: `src/06` r.102]. Non ho provato il mercato dopo i 30.
- *Proposta:* dai 32 anni, una volta, il procuratore porta tre strade con una storia ciascuna: **da bandiera** (resti, stipendio più basso, ruolo di guida); **a casa** (il primo club, anche in una serie più bassa: riportarlo su è l'obiettivo); **l'ultima avventura** (un club ambizioso di un'altra lega, un anno, un trofeo che ti manca).
- *Per chi gioca:* gli ultimi anni hanno un tema scelto.
- *Valore:* alto per la rigiocabilità. *Costo:* 3. *Rischio:* medio.
- *Conflitti:* economia e mercato chiusi «per il momento» il 20/10 (PO-157). Va disegnata con G193-02 (la promessa nel rinnovo) e con la fase «bandiera» che il gioco ha già [mappa: `src/03` r.1030]. Prima serve vedere cosa offre oggi il mercato a un 32enne: non l'ho verificato.

**G193-09 — Il fisico in chiaro**
- *Visto:* velocità −9 e fisico −10 in tre stagioni; in Home solo il titolo «Il corpo comincia a parlare».
- *Proposta:* dai 30 anni, nel bilancio di fine stagione, una scheda «La tua stagione fisica»: cosa è sceso, cosa tiene, cosa è salito (letture di gioco, freddezza). Solo informazione, con una frase del preparatore. Nessuna scelta nuova.
- *Per chi gioca:* il calo si capisce invece di scoprirlo per caso nella scheda attributi.
- *Valore:* medio-basso. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuno, perché è solo informazione. Se si volesse aggiungere una scelta («cosa proteggo quest'anno») si toccherebbero la vista Allenamento e gli slot settimanali già scartati dal PO: non la propongo.

### B. Nazionale e mondo

**G193-10 — Il Mondiale merita un cammino**
- *Visto:* due qualificazioni nella stessa settimana e «non qualificati. Prossima volta!».
- *Proposta:* (a) nella stagione del torneo le finestre della Nazionale che oggi sono amichevoli diventano il girone di qualificazione, con una piccola classifica nella scheda Nazionale; (b) l'esito è un momento: una schermata con il CT, i giornali e ciò che significa alla tua età («a 32 anni sai che può essere stato l'ultimo treno»); (c) se ti qualifichi, il torneo resta com'è.
- *Per chi gioca:* il Mondiale si aspetta e si conquista lungo la stagione; mancarlo fa male nel modo giusto.
- *Valore:* alto. *Costo:* 3. *Rischio:* medio-alto: tocca calendario e tornei.
- *Conflitti:* **conflitto diretto** con PO-155 (Nazionale per finestre, qualificazioni, CT), chiusa «per il momento» il 20/10 con la nota «qualificazioni del torneo invariate». La parte (b) da sola (il racconto dell'esito) non tocca quella decisione e costa 1.

**G193-11 — La carriera in Nazionale ha i suoi traguardi**
- *Visto e letto:* 40 presenze e 34 gol a fine carriera, mostrati come due numeri; fascia, addio e primati della Nazionale: 0 nel codice [mappa].
- *Proposta:* (a) nella scheda Nazionale la classifica dei marcatori e delle presenze di sempre della tua nazione, con te dentro; (b) la fascia della Nazionale quando sei il più presente fra i convocati; (c) dai 32 anni la scelta «lascio la Nazionale» (meno fatica nel club, un saluto con l'ultima partita) oppure «fino all'ultimo torneo»; (d) «Gol Azzurro» diventa «Gol in Nazionale».
- *Per chi gioca:* la maglia della nazione ha una storia sua, non solo un contatore.
- *Valore:* medio. *Costo:* 2. *Rischio:* basso-medio.
- *Conflitti:* PO-155 chiusa «per il momento» il 20/10: è un'aggiunta sopra, non cambia finestre né convocazioni, ma riapre il tema. I marcatori di sempre vanno inventati: controllo dei nomi obbligatorio (`audit-copyright`).

**G193-12 — L'almanacco: nuovi primati dopo il primato**
- *Visto:* alla stagione 12 «Sei il miglior marcatore di sempre! 432 gol — hai superato … (292)». Da lì in poi non c'è più nessuno davanti. Il gioco conserva l'archivio di 30 stagioni di lega [letto nel codice, mappa: `src/18` r.5756].
- *Proposta:* una pagina «Almanacco» in Carriera: albo d'oro di lega e coppe con i tuoi anni evidenziati; i primati ancora da battere dopo quello dei gol (titoli vinti, gol in coppa europea, stagioni consecutive in gol, capocannoniere più anziano); e un giovane del mondo di gioco che sta inseguendo i **tuoi** primati, con il suo conto.
- *Per chi gioca:* arrivato in cima, vede cosa resta da prendere e chi gli sta arrivando alle spalle.
- *Valore:* medio-alto per gli appassionati. *Costo:* 2. *Rischio:* basso.
- *Conflitti:* nessuno. Diversa da G189-15 / PO-427 (i tuoi numeri divisi per tipo) e da G181-10 (il rivale personale): qui sono i primati del mondo. Il «fenomeno generazionale» ogni 8 stagioni esiste già [mappa: `src/18` r.5634]: può essere lui l'inseguitore.

### C. La fine

**G193-13 — L'ultima stagione sa di esserlo, e l'ultima partita è un evento**
- *Visto:* ultima partita senza un cenno; bilancio d'addio con «prossima stagione puntiamo più in alto», «stai diventando un punto di riferimento», «3 anni rimanenti».
- *Proposta:* (a) ad annuncio fatto, i testi di fine stagione passano alla versione d'addio (mister, giudizio, contratto: «l'ultimo contratto finisce qui»); (b) l'ultima gara in casa è partita chiave: il tasto del prossimo momento si ferma, la convocazione lo dice, il prepartita mostra lo striscione; (c) la fascia per un giorno e, se hai scelto il cambio all'85', l'uscita fra due file di compagni; (d) dopo il fischio, un minuto in campo prima della cerimonia.
- *Per chi gioca:* l'ultima partita di diciotto anni di carriera si ricorda.
- *Valore:* alto per costo basso. *Costo:* 1 per (a)+(b), 1-2 per (c)+(d). *Rischio:* basso per i testi; medio per le scene 3D.
- *Conflitti:* **tocca** le cerimonie, chiuse «per il momento» il 20/10 (PO-002/137), e per (c) le scene 3D (PO-373) e il tetto delle interazioni. La parte (a)+(b) è solo testi e regola delle partite chiave (PO-364/384).

**G193-14 — Un verdetto all'altezza della carriera**
- *Visto:* «Carriera solida», «firma affidabile» a 968 punti su 1000; «Giovane dell'Anno» sei volte.
- *Proposta:* (a) i tre giornalisti scrivono a gradini, legati al punteggio di eredità e ai fatti (trofei d'oro, primati, bandiera o giramondo), con il gradino più alto che non lesina; (b) una prima pagina finale col titolo; (c) il premio al giovane si ferma all'età in cui ha senso, e lo stesso premio ripetuto si mostra come «×6».
- *Per chi gioca:* l'ultima schermata dice la verità sulla carriera che ha giocato.
- *Valore:* medio-alto per costo basso. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuna decisione contraria. Stessa regola di G189-09 / PO-421 (giudizi che non si contraddicono), applicata alla pagina finale. Da fare prima di PO-382 («Le tue leggende») e PO-383 (cartolina), che mostreranno quegli stessi testi.

**G193-15 — Un anno dopo**
- *Visto:* dopo il ritiro: riepilogo da copiare, nuova partita con bonus, «gioca come figlio/a».
- *Proposta:* (a) una pagina «Un anno dopo», costruita dalle scelte della carriera: l'accademia e i suoi ragazzi, la fondazione, il club che ti dà un ruolo se l'avevi promesso (G193-02), il rivale diventato amico, tuo figlio al primo allenamento; (b) facoltativa, una «partita delle leggende» breve e giocabile: i compagni di una vita contro i rivali di una vita, senza posta. Poi i tasti di oggi.
- *Per chi gioca:* la carriera lascia una traccia, e chi sceglie «gioca come figlio/a» parte da una scena, non da un tasto.
- *Valore:* medio. *Costo:* 1-2 per (a), 2 per (b). *Rischio:* basso per (a), medio per (b) (formato di partita nuovo, come G189-14 / PO-426).
- *Conflitti:* cerimonie chiuse il 20/10. Si lega a PO-382 (albo) e a G181-13 (soldi con uno scopo): questa è la scena, quelle sono l'archivio e l'economia. Nel codice esiste un evento «Il Dopo-Carriera» [mappa: `src/03` r.1308]: la pagina può partire da quella scelta.

### D. Orientamento e rifinitura

**G193-16 — Il tasto che blocca dice dove andare**
- *Visto:* «Prima rispondi al rinnovo», «prima trova una squadra», «prima la Nazionale» sotto il tasto, senza un collegamento.
- *Proposta:* la riga del motivo diventa toccabile e porta al punto giusto (apre la trattativa, la scheda Agente, il prepartita della Nazionale). Dove la cosa da fare è una sola, il tasto stesso cambia nome: «Rispondi al rinnovo →».
- *Per chi gioca:* mai fermo a cercare cosa vuole il gioco.
- *Valore:* medio. *Costo:* 1. *Rischio:* basso.
- *Conflitti:* nessuno. Stessa zona di PO-408 (i riquadri delle scelte da portare su), PO-410 e PO-411 (il tasto): da fare nello stesso giro.

**G193-17 — Dieci anni di te**
- *Visto:* la scheda Carriera ha 14-18 righe di linea del tempo e 158 voci di diario (`26-carriera-s15-tel.png`); nessun momento in cui il gioco si ferma e guarda indietro.
- *Proposta:* alla decima e alla quindicesima stagione da professionista, una pagina sola: com'eri (la figurina dell'esordio), i numeri del decennio, chi c'era allora e dov'è adesso (mister, rivale, compagni), le tre partite che il gioco ha già segnato come «dell'anno». Con il tasto per condividerla quando la cartolina esisterà.
- *Per chi gioca:* un respiro a metà del lungo viaggio, e la sensazione che gli anni siano passati davvero.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso (tutti dati già salvati: storico stagioni, storico allenatori, diario).
- *Conflitti:* nessuno. Diversa da G181-18 / PO-383 «Bentornato» (ripresa dopo giorni) e dalla cartolina di fine stagione: questa è una ricorrenza di carriera.

**G193-18 — Rifiniture viste negli anni lunghi**
- *Visto, undici punti:*
  1. Coppa delle Nazioni: «sul tetto del torneo» nel bilancio, «Eliminati (fase a gironi) · Punti 10/9» nella scheda Nazionale;
  2. bilancio di coppa europea: «Eliminato · 12 pt nel girone» e «Corsa finita agli ottavi» insieme;
  3. «Contratto attivo · 3 anni rimanenti» dopo una firma di 2 anni (e dopo l'annuncio del ritiro);
  4. da svincolato: «Stipendio attuale €33,1 mln» e «Richiedi cessione»;
  5. «Gol Azzurro» per un calciatore non italiano;
  6. «La città ti ricorda»: gradi che non tornano con stagioni e gol;
  7. «la maglia numero 9 è tua» e in campo l'8;
  8. sfida «Sempreverde» non completata a 34 anni giocati;
  9. «vorra'» con l'apostrofo;
  10. su PC la finestra dell'intervista tagliata in basso;
  11. «Giovane dell'Anno» ripetuto sei volte nell'elenco finale.
- *Proposta:* un giro solo, con foto prima e dopo.
- *Per chi gioca:* niente che faccia dubitare dei numeri dopo quindici anni di carriera.
- *Valore:* medio. *Costo:* 1-2. *Rischio:* basso.
- *Conflitti:* nessuno. I punti 1-4 sono probabilmente difetti e non idee: **non posso confermare** la causa di nessuno, li ho solo visti. Il 10 è vicino a G189-17 / PO-429.

---

## 3. Le 10 migliori

Ordinate per rapporto valore/costo. I costi sono **stime mie** in giri.

| # | Proposta | Cosa cambia per chi gioca | Valore | Costo | Rischio | Tocca decisioni chiuse? |
|---|---|---|---|---|---|---|
| 1 | **G193-01** Il club ti richiama | Non perdi un anno di carriera per una finestra chiusa in fretta | alto | 2-3 | medio | sì: economia (PO-157); forse residuo del giro 94 |
| 2 | **G193-13** L'ultima stagione e l'ultima partita | L'addio è coerente dall'inizio alla fine, e l'ultima gara si ricorda | alto | 1 (+1-2) | basso | i soli testi no; le scene sì (cerimonie) |
| 3 | **G193-05** Traguardi fino a 500 gol | Sempre un numero tondo davanti, con il conto alla rovescia | alto | 1-2 | basso | no |
| 4 | **G193-14** Verdetto all'altezza | La pagina finale dice la verità sulla carriera | medio-alto | 1 | basso | no |
| 5 | **G193-16** Il tasto che blocca dice dove andare | Mai fermo a cercare il rinnovo | medio | 1 | basso | no (con PO-408/410/411) |
| 6 | **G193-06** Fatti unici e settimane da trentenne | La quindicesima stagione non rilegge la quinta | alto | 2-3 | basso | sì: PO-154 |
| 7 | **G193-04** Capitano per merito | La fascia si vede avvicinare e si conquista | medio-alto | 2 | basso-medio | no trovata |
| 8 | **G193-03** Le energie del veterano | Dopo i 30 scegli quando esserci | alto | 2-3 | medio-alto | sì: tetto interazioni col mister |
| 9 | **G193-18** Rifiniture degli anni lunghi | Numeri e testi che tornano | medio | 1-2 | basso | no |
| 10 | **G193-10** Il Mondiale come cammino | Il torneo più importante si aspetta e si conquista | alto | 3 (1 solo racconto) | medio-alto | **sì, diretto: PO-155** |

Fuori dalle dieci: G193-02 (rinnovo da bandiera), G193-07 (compagni con un'età), G193-08 (ultimo contratto), G193-09 (fisico in chiaro), G193-11 (traguardi in Nazionale), G193-12 (almanacco), G193-15 (un anno dopo), G193-17 (dieci anni di te). Totale stimato se si facesse tutto: 32-42 giri.

### Se ne facessi solo 3

1. **G193-01 — Il club ti richiama prima di perderti.** È l'unica cosa vista che può rovinare una carriera lunga: una stagione intera a guardare, a 31 anni, senza che nessun personaggio del gioco dica una parola. Il mio pilota ha sbagliato; una persona può sbagliare allo stesso modo.
2. **G193-13 — L'ultima stagione sa di esserlo.** Il gioco ha già fatto la parte difficile (annuncio, giro d'addio, lettera, maglia ritirata). Mancano i testi coerenti e l'ultima partita: con un giro si chiude il momento più importante di tutta la carriera.
3. **G193-05 — Traguardi fino a 500 gol.** Costa poco e riempie proprio gli anni in cui tutto il resto è fermo a 100.

---

## 4. Cosa non ho verificato

- **Nessuna prova su un telefono vero.** Tempi, fluidità e audio non sono giudicati.
- **La stagione 17** è stata saltata con lo strumento di prova; lo stato a 34 anni è in parte costruito. Anche il salvataggio di partenza (stagione 12) è un salvataggio di prova di cui non conosco l'origine.
- **Un solo calciatore, molto forte, sempre nello stesso club.** Non ho visto: il veterano che perde il posto, un trasferimento dopo i 30 anni, una retrocessione, un infortunio (nessuno in cinque stagioni nei registri), la carriera oltre i 35 anni, il ritiro dal Profilo a 32 anni, la «nuova partita+» e «gioca come figlio/a».
- **Lo svincolo (G193-01)** nasce da una scelta del pilota (controfferta rifiutata). Non ho misurato quanto spesso capita a una persona, né ho letto tutto il codice del rinnovo: che il club non richiami lo dico da ciò che manca nei registri di una stagione.
- **Il 500° gol**: nessuna festa nei registri, che però conservano solo l'inizio di ogni schermata.
- **Il cambio all'85'** del giro d'addio: non l'ho visto perché avevo scelto l'altra strada.
- **L'energia in partita**: tre partite. Non posso dire se il calo dipenda dall'età.
- **La fascia di capitano**: la regola l'ho letta dalla mappa del codice, non riga per riga; nel gioco ho solo visto che non è mai arrivata.
- **Le righe di codice marcate «mappa»** vengono da una ricerca riassunta, non ricontrollata una per una.
- **Difficoltà e bilanciamento**: il pilota sceglie a rotazione.
- **I conflitti con le decisioni chiuse** li ho cercati per parole chiave in `DECISIONI.md` e `BACKLOG.md` (ramo `origin/poc/marioprada-character-system`) e nei documenti dei giri 181 e 189: una decisione scritta con altre parole può essermi sfuggita.
- **I costi in giri** sono stime mie.

## 5. Fonti e strumenti

- Gioco: `CARRIER-MANAGER-AV.html` del ramo `lavoro/194` (commit `7265b37`), aperto senza `?cpmtest=1`, cioè come lo vede chi gioca. Unica eccezione: il salto della stagione 17.
- 76 foto in `docs/collaudo/giro193/`.
- Strumenti in `docs/collaudo/giro193/strumenti/`: `lib193.mjs` e `gioca.mjs` (ripresi dal giro 189 e adattati: toccano i tasti per testo, fotografano, salvano lo stato fra un passo e l'altro), `salta.mjs` (salto di stagione con lo strumento di prova). Registri in `strumenti/log/` (uno per tratto: `a` = stagione 13, `b` = 14, `c` = 15, `d` = 16, `e` = 18, `f` = fine carriera). Stati intermedi in `strumenti/stati/` (per esempio `c1` = svincolato a fine stagione 15, `e1` = 34 anni prima dell'annuncio, `e4` = vigilia dell'ultima partita, `f1` = ritirato). Solo lettura sul gioco.
- Salvataggio di partenza: `tests/visual/fixtures/save-190-s12-ovr93.json`.
- Codice letto direttamente: `src/15-live-match.jsx` r.1635 (malus dell'energia); `src/18-career-app.jsx` r.1054, r.2700-2716, r.7538 (annuncio del ritiro, vita privata); `src/16-scene-3d-cerimonie.jsx` r.3346 (tasto di nuova stagione). Il resto in `docs/collaudo/giro193/MAPPA-CODICE-ANNI-LUNGHI.md`.
- Governo: `docs/governo/BACKLOG.md` (PO-154, 155, 156, 157, 226, 364, 373, 375, 376-430, e r.785 sul giro 94), `docs/governo/DECISIONI.md` (chiusure del 20/10).
- Giri precedenti: `docs/collaudo/GIRO181-IDEE.md` (ramo `collaudo/giro181-idee`), `docs/collaudo/GIRO189-IDEE.md` (ramo `collaudo/giro189-idee`).
