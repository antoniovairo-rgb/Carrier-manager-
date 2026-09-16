# REAL MATCH ENGINE — la direttiva del PO e dove siamo davvero

> **Questo documento è la DIRETTIVA del PO del 16/09/2026**, consegnata testualmente nella seconda metà
> (sezione «La direttiva, come l'ha scritta il PO»). Sue parole, non riassunte: resta come indicazione
> permanente per ogni lavoro sul motore di partita. La prima metà è la mia **risposta onesta**: dove il
> motore di oggi rispetta la direttiva, dove la tradisce, e con quali numeri lo so.

## 1. La risposta breve alla domanda «stai andando in questa direzione?»

**Sullo scheletro sì, sul cuore no.**

Quello che è già come la direttiva chiede:

| § | quello che chiede | stato |
|---|---|---|
| §20 | una sola fonte di verità, e le statistiche DERIVATE dagli eventi | **fatto**: `motore.tabellino()` conta dove passano tutti gli eventi; la UI non somma più per conto suo (7.913/7.914) |
| §10 | i voti costruiti dagli eventi, non sorteggiati a fine partita | **fatto** (7.918/7.922): `pagelle()` accumula evento per evento, deterministica |
| §15 | statistiche finali derivate dal flusso | **fatto**: 24 voci, misurate contro la partita vera (`npm run tabellino-vero`) |
| §16 | validazione statistica automatica | **in parte**: il banco confronta 24 voci col vero; mancano i controlli di impossibilità (gol senza tiro, completati > tentati) |
| §12 | il 2D per la partita, il 3D per i momenti | **fatto** (7.917): fra un highlight e l'altro c'è il campo dall'alto, il 3D si ferma |
| §6 | niente VAR, replay, autogol | **rispettato** |

Quello che la direttiva chiede e che **oggi il motore non fa**, coi numeri che lo dimostrano
(banco a 11 decisioni/minuto, 30 partite, 16/09):

| § | quello che chiede | oggi | vero | cosa vuol dire |
|---|---|---|---|---|
| §2 | ventidue giocatori realmente attivi | **difesa 4 tocchi in tutta la partita, 2 uomini su 8; attacco 306** | — | i difensori sono decorativi: è esattamente il difetto che il PO ha visto nelle pagelle |
| §3 | possessi come SEQUENZE | passaggi **76,8** | 450 | il motore non costruisce: tocca e lancia |
| §5 | macchina a stati del possesso | **non esiste**: ogni chiamata decide da sé | — | manca il concetto di «questo possesso sta costruendo dal basso» |
| §7 | corner e rimesse DERIVATI | corner **1,93**, rimesse **4,32**, rinvii **1,23** | 4,9 · 22 · 7 | in parte derivati, ma troppo rari perché la palla non esce mai |
| §6 | duelli e spazzate | **spazzate 0,28**, contrasti 2,43, intercetti 2,25 | 17 · 16,5 · 8,5 | il gesto difensivo quasi non esiste |
| §2 | ogni giocatore con propri attributi | **i ventuno hanno solo x, y, squadra, portiere** | — | niente qualità, velocità, aggressività, stamina: non possono sbagliare in modo diverso |
| §8 | xG dal contesto | xG **0,28** per squadra | 1,30 | è per-tiro e sommato (giusto), ma i tiri partono per il **99 % da fuori area** |
| §1/§13 | l'highlight NASCE dal motore | **no**: nasce da 185 schede `SITUATIONS` | — | è la violazione più grave della direttiva, ed è già a piano come **B0** |
| §17 | mille simulazioni | **30** | — | il banco c'è, va solo portato a mille |

**Il verdetto onesto**: il lavoro di oggi ha rimesso in ordine il *contorno* (una sola verità, statistiche
vere, pagelle vere, il 2D che mostra la partita) e ha cominciato a toccare il *cuore* (A9 il tempo del
mondo, A12 v1 l'intercetto), ma **il cuore è ancora un decisore per-tick, non una simulazione di possessi**.
Finché resta così, ogni voce difensiva resterà a un decimo del vero e i difensori resteranno decorativi.

## 2. Perché il motore di oggi produce eventi poco realistici (le tre cause, misurate)

1. **Non esiste il possesso come oggetto.** Il motore ha uno stato (`tenuta`/`volo`/`libero`/`fermo`) ma non
   una *fase* del possesso. Ogni chiamata riparte dalla posizione del pallone e sceglie: conduci, passa,
   tira. Non c'è memoria di «da dove viene questa azione», quindi non ci sono sequenze — e senza sequenze
   non ci sono né i 450 passaggi né la costruzione dal basso.
2. **I ventuno non hanno attributi.** `matchPlayers` porta `{x, y, team, gk}`. Il motore li muove ma non può
   farli sbagliare in modo diverso: un centrale e un trequartista hanno la stessa probabilità di perdere
   palla. Da qui anche le pagelle piatte: senza attributi, l'unica differenza possibile è quanti palloni
   toccano — e i difensori ne toccano quattro.
3. **La palla vive in un terzo di campo.** Misurato: attacco 306 tocchi, centrocampo 78, difesa 4. Il pallone
   non torna mai indietro perché mancano i rinvii dal fondo veri (1,23 contro 7) e la costruzione da dietro.
   Un premio al retropassaggio non basta — provato e **revocato il 16/09**, con la misura appaiata.

## 3. L'architettura che propongo (e che rispetta la direttiva §19: non riscrivere tutto)

Si tiene `src/14-motore-possesso.jsx` come **Match Engine** e gli si aggiunge dentro ciò che manca, in questo
ordine — ogni passo con la sua misura al banco e il suo rosso:

| passo | cosa | metro (oggi → atteso) |
|---|---|---|
| **M1** | **il possesso è un oggetto con una fase**: `RECUPERO → COSTRUZIONE → PROGRESSIONE → ULTIMO TERZO → OCCASIONE → TIRO`, e la fase decide chi può ricevere | passaggi 76,8 → ≥ 250 · tocchi della difesa 4 → ≥ 60 · sequenze da ≥ 4 passaggi 0 → ≥ 20/partita |
| **M2** | **i ventuno hanno attributi** (qualità, passaggio, tiro, velocità, aggressività, difesa, stamina) derivati dalla rosa già esistente, senza campi nuovi nel salvataggio | voti: due compagni dello stesso reparto non più uguali · errori distribuiti per qualità |
| **M3** | **gli eventi diventano conseguenze**: il corner da una deviazione, la rimessa da una palla che esce davvero, il fallo da un duello perso | corner 1,93 → 4,9 · rimesse 4,32 → 22 · spazzate 0,28 → 17 · contrasti 2,43 → 16,5 |
| **M4** | **xG dal contesto** (distanza, angolo, pressione, tipo di assist) e tiri che nascono dentro l'area | xG 0,28 → 1,0-1,6 · tiri dall'area 0,8 % → ~70 % |
| **M5** | **l'highlight nasce dal motore** (B0 del piano): il 3D rappresenta l'evento già deciso, non ne inventa un altro | schede 185 → 12 archetipi · coerenza evento↔scena 1:1 |
| **M6** | **mille simulazioni e il punteggio di realismo** (§16/§17), con i controlli di impossibilità | 30 → 1.000 partite · eventi impossibili = rosso |

**Cosa NON si tocca**: la UI della partita, il 3D, la carriera, i salvataggi. M1-M4 vivono dentro il motore;
M5 tocca il ponte fra motore e highlight; M6 è solo strumentazione.

**Costo onesto**: M1 da solo è il pezzo più grande fatto finora su questo motore — è la riscrittura del
cuore, e va spedito a tappe misurate, non in un colpo. M2 e M3 sono brevi una volta che c'è M1. M5 è il
cantiere B0, già a piano. M6 è mezza giornata di strumento.

---

## La direttiva, come l'ha scritta il PO (16/09/2026)

> Testo integrale, non riassunto. Vale come indicazione permanente per ogni lavoro sul motore di partita.

### REAL MATCH ENGINE — SIMULAZIONE CALCISTICA CREDIBILE

**OBIETTIVO.** Intervenire sul motore che genera gli eventi della partita e rifondarlo dove necessario. Il
risultato NON deve essere una sequenza di eventi casuali collegati tra loro. Deve simulare una vera partita
di calcio, con: 22 giocatori realmente coinvolti; possesso e circolazione della palla; passaggi e costruzione
delle azioni; duelli; recuperi; palle perse; falli; rimesse laterali; corner; calci di punizione;
ammonizioni; rigori; tiri; occasioni da gol; xG; gol; variazione dei voti individuali; andamento tattico e
temporale della partita.

L'EROE è il protagonista della storia, ma NON deve essere l'unica fonte degli eventi. La partita deve
continuare ad avere una propria vita anche quando l'eroe non è coinvolto.

**1. PRINCIPIO FONDAMENTALE.** Separare chiaramente: **A. MATCH SIMULATION ENGINE** — simula l'intera partita
in 2D/logica interna, gestisce tutti i 22 giocatori e produce il vero flusso della partita. **B. HERO
HIGHLIGHT ENGINE** — quando un evento coinvolge direttamente l'eroe o rappresenta un momento particolarmente
importante, lo trasforma in highlight 3D interattivo. Il 3D NON deve simulare tutta la partita: deve
rappresentare fedelmente gli eventi già determinati dal Match Engine. NON generare casualmente nel 3D
un'azione diversa da quella prevista dalla simulazione. Pipeline corretta: MATCH ENGINE → evento partita →
valutazione importanza / coinvolgimento eroe → HERO HIGHLIGHT → rappresentazione 3D interattiva.

**2. I 22 GIOCATORI DEVONO ESSERE REALMENTE ATTIVI.** Non creare 21 giocatori «decorativi» attorno all'eroe.
Ogni giocatore deve avere un proprio stato durante la partita: posizione; ruolo; zona; possesso; stamina;
forma; rating; qualità tecnica; velocità; aggressività; capacità difensiva; capacità di passaggio; tiro;
movimento; probabilità di errore; coinvolgimento nella manovra. I giocatori devono partecipare alla
costruzione degli eventi. NON: `PLAYER_A → passaggio casuale → HERO → tiro`, ma: `PORTIERE → TERZINO →
CENTROCAMPISTA → MEZZALA → TREQUARTISTA → ATTACCANTE → HERO`, oppure `DIFENSORE → INTERCETTAZIONE → MEDIANO →
CAMBIO GIOCO → ESTERNO → CROSS → DUELLO → RINVIO`. Il motore deve essere capace di generare sequenze
multi-giocatore.

**3. POSSESSO E PASSAGGI.** Il numero di passaggi deve essere coerente con una partita reale. NON fissare
semplicemente «ogni minuto = X passaggi». Creare invece possessi composti da sequenze. Un possesso può
essere: costruzione dal basso; possesso sterile; progressione; contropiede; possesso in zona offensiva;
azione laterale; attacco centrale; pressione avversaria; recupero palla; perdita del possesso. Ogni possesso
deve poter terminare con: passaggio riuscito; passaggio sbagliato; intercetto; contrasto; fallo; rimessa;
tiro; corner; perdita palla; uscita dal campo; recupero del portiere. Il motore deve mantenere statistiche
cumulative reali: `passesAttempted`, `passesCompleted`, `possession`, `progressivePasses`, `keyPasses`,
`turnovers`, `recoveries`, `interceptions`, `duels`, `duelsWon`.

**4. NON USARE DISTRIBUZIONI COMPLETAMENTE CASUALI.** Evitare sistemi del tipo `random() < 0.2 → corner`.
Gli eventi devono derivare dal contesto: pressione alta + difensore sotto pressione + passaggio rischioso →
errore/intercetto; possesso sulla fascia + terzino avanzato + attaccante in area → cross; cross + deviazione
difensore → corner; corner + qualità battitore + marcatura + posizione giocatori → conclusione / respinta /
gol / seconda palla. Questo crea causalità.

**5. MODELLO DEL POSSESSO.** Implementare una macchina a stati coerente: `RECOVERY → BUILD_UP → PROGRESSION →
FINAL_THIRD → CHANCE_CREATION → SHOT → GOAL/SAVE/MISS/BLOCK/REBOUND`; oppure `RECOVERY → BUILD_UP → PRESSURE
→ TURNOVER`; oppure `WIDE_ATTACK → CROSS → CLEARANCE → CORNER`. Ogni transizione deve dipendere dalle
caratteristiche dei giocatori e dal contesto.

**6. EVENTI REALISTICI.** Il motore deve supportare almeno: PASS, CARRY, DRIBBLE, TACKLE, INTERCEPTION,
RECOVERY, CLEARANCE, BLOCK, CROSS, THROUGH_BALL, KEY_PASS, SHOT, SHOT_ON_TARGET, SHOT_OFF_TARGET, POST, SAVE,
GOAL, FOUL, YELLOW_CARD, SECOND_YELLOW, RED_CARD, PENALTY_WON, PENALTY, PENALTY_GOAL, PENALTY_MISS, CORNER,
THROW_IN, FREE_KICK, OFFSIDE, GOAL_KICK, KICK_OFF. NON introdurre VAR, replay o autogol se già esclusi dal
design del gioco.

**7. CORNER, RIMESSE, FALLI E PIAZZATI.** Questi eventi NON devono apparire come eventi indipendenti. Il
CORNER deve derivare principalmente da: tiro deviato; cross deviato; intervento difensivo; parata; palla
respinta oltre la linea. La RIMESSA LATERALE deve derivare da un'azione che porta realmente la palla oltre la
linea laterale. Il FALLO deve derivare da: tackle; contrasto; pressione; duello fisico; intervento in
ritardo — e il numero di falli deve dipendere anche da intensità, aggressività, fase della partita,
risultato, stanchezza, zona del campo. Il RIGORE deve essere raro e derivare da un fallo in area: NON
generare rigori semplicemente per raggiungere una statistica target.

**8. EXPECTED GOALS.** L'xG NON deve essere assegnato casualmente al tiro. Calcolare xG in funzione di almeno:
distanza dalla porta; angolo di tiro; posizione; tipo di assist; situazione; piede/testa; pressione
difensiva; numero di difensori; contropiede; rigore; qualità dell'occasione. Tap-in ravvicinato → xG alto;
tiro da 25 metri angolato → xG basso; uno contro uno → xG medio/alto; rigore → xG elevato. Ogni tiro deve
produrre un proprio xG, e l'xG della squadra deve essere la SOMMA degli xG di tutti i tiri: non creare
direttamente il totale.

**9. RISULTATO DEL TIRO.** Deve dipendere da attaccante + posizione + pressione + portiere + qualità tecnica +
tipo di tiro + xG + situazione di gioco. Risultati possibili: GOAL, SAVE, POST, BLOCK, MISS. La probabilità
deve essere coerente con l'xG, senza renderla deterministica.

**10. VOTI DEI CALCIATORI.** I voti NON devono essere generati a fine partita casualmente: devono essere
costruiti progressivamente attraverso gli eventi. Ogni giocatore deve avere un performance score interno
(passaggi riusciti, recuperi, assist, key pass, gol, occasioni create, duelli vinti, intercetti) e penalità
(errori, palle perse, passaggi sbagliati, falli, ammonizioni, occasioni fallite, errori che generano
occasioni, gol subiti con responsabilità). Il voto finale deve emergere dalla prestazione. Due giocatori della
stessa squadra NON devono automaticamente avere voti simili.

**11. L'EROE.** Deve essere parte integrante della simulazione. NON aumentare artificialmente gli eventi solo
perché è l'eroe. Deve ricevere opportunità coerenti con ruolo, posizione, squadra, tattica, qualità, forma,
compagni, avversari, andamento della partita. Essendo un attaccante deve essere particolarmente coinvolto
nelle fasi offensive, ma non deve avere sempre la palla. Deve poter: ricevere; appoggiare; effettuare sponde;
fare movimenti; attaccare la profondità; duellare; dribblare; tirare; creare occasioni; subire fallo;
commettere fallo; essere anticipato; perdere palla; segnare; sbagliare; essere ignorato dai compagni; essere
marcato; creare spazio per altri. La carriera deve risultare credibile anche quando l'eroe gioca una partita
mediocre.

**12. HIGHLIGHTS 3D.** Non trasformare ogni evento in 3D. Selezionare gli eventi significativi, in ordine di
priorità: azione da gol dell'eroe; tiro dell'eroe; grande occasione dell'eroe; assist/key pass dell'eroe;
dribbling significativo; duello importante; fallo subito; evento tatticamente rilevante; azione pericolosa
della squadra; azione pericolosa avversaria. Le azioni extra-eroe possono essere mostrate come eventi
2D/logici e diventare highlight solo quando sono realmente importanti.

**13. IL 3D DEVE RAPPRESENTARE L'EVENTO REALE.** Se il Match Engine determina `PASS A→B, B→HERO, HERO riceve,
HERO dribbla, HERO tira, xG 0.32, SAVE`, il 3D deve rappresentare ESATTAMENTE questa sequenza. NON: Match
Engine = tiro, 3D = inventa dribbling + cross + tiro. **La simulazione è la fonte di verità.**

**14. MATCH CONTEXT.** La probabilità degli eventi deve cambiare durante la partita, considerando almeno:
minuto; risultato; casa/trasferta; stamina; possesso; momentum; pressing; atteggiamento; qualità squadre;
necessità di segnare; gestione del vantaggio; fase iniziale/finale. Squadra sotto 0-1 all'85' → maggiore
rischio offensivo, più giocatori avanti, più transizioni, maggiore possibilità di occasioni, maggiore
esposizione ai contropiedi. Non significa «forzare il gol»: significa modificare il comportamento della
simulazione.

**15. STATISTICHE FINALI.** A fine partita devono essere calcolate dal flusso reale degli eventi: risultato;
gol; assist; possesso; passaggi tentati; passaggi completati; precisione passaggi; tiri; tiri in porta; xG;
corner; falli; ammonizioni; espulsioni; fuorigioco; rimesse; parate; recuperi; intercetti; contrasti; duelli;
occasioni create. Le statistiche NON devono essere generate separatamente dal match engine: devono essere
DERIVATE dagli eventi.

**16. CONTROLLO DI REALISMO.** Creare un sistema di validazione statistica. Dopo una simulazione verificare
automaticamente: numero totale passaggi plausibile; possesso totale = 100%; passaggi completati <= tentati;
tiri in porta <= tiri; xG >= 0; xG coerente con i tiri; corner derivati da eventi validi; rigori derivati da
fallo in area; ammonizioni associate a eventi disciplinari; gol associati a un tiro; assist associati a un
evento precedente coerente; ogni evento ha timestamp valido; nessun giocatore può essere contemporaneamente
in due possessi incompatibili; evento impossibile = FAIL. Creare inoltre un REALISM SCORE interno
esclusivamente diagnostico per il team di sviluppo: NON usarlo per alterare artificialmente la partita
durante l'esecuzione.

**17. TEST MASSIVI.** Non testare soltanto 5-10 partite manualmente. Creare almeno 1.000 simulazioni
automatiche durante lo sviluppo e analizzare le distribuzioni di: passaggi; possesso; tiri; tiri in porta;
xG; corner; falli; ammonizioni; rigori; gol; distribuzione voti; coinvolgimento giocatori; eventi per minuto.
Individuare automaticamente: valori impossibili; valori estremi; pattern ripetitivi; eventi troppo frequenti;
eventi troppo rari; risultati improbabili; partite fotocopia; eccessivo coinvolgimento dell'eroe; giocatori
praticamente inutilizzati.

**18. TEST «OCCHIO DEL PLAYER».** Oltre ai test statistici, analizzare la partita come un giocatore umano. La
partita sembra davvero una partita di calcio? Le azioni hanno una causa? La palla si muove realisticamente
tra i giocatori? I compagni partecipano? Gli avversari reagiscono? Ci sono fasi di possesso? Ci sono momenti
morti? Ci sono accelerazioni improvvise? Le occasioni importanti sono comprensibili? Il risultato sembra
derivare da ciò che è successo? L'eroe sembra realmente un giocatore dentro una squadra? Una squadra può
dominare senza segnare? Una squadra può vincere creando meno occasioni? Una partita può finire 0-0 senza
sembrare vuota? I gol arrivano da azioni credibili?

**19. NON ROMPERE IL RESTO DEL GIOCO.** Prima di modificare il codice: individuare l'attuale Match Engine; il
sistema eventi; le statistiche; i rating; gli Hero Highlights; il rendering 3D; le dipendenze tra questi
sistemi. NON riscrivere indiscriminatamente l'intera applicazione. Riutilizzare ciò che funziona. Separare il
più possibile: MATCH STATE, EVENT GENERATOR, PLAYER STATE, STATISTICS ENGINE, RATING ENGINE, HIGHLIGHT
SELECTOR, 3D PRESENTATION.

**20. PRINCIPIO ARCHITETTURALE FINALE.** Deve esistere UNA SOLA fonte di verità: **MATCH STATE**. Tutto deve
derivare da essa: EVENTS → STATISTICS → PLAYER PERFORMANCE → RATINGS → HERO HIGHLIGHTS → 3D PRESENTATION.
Mai il contrario. Il rendering 3D non deve modificare retroattivamente la partita.

**CONSEGNA RICHIESTA.** Prima di scrivere codice: analizza l'attuale architettura; individua perché il motore
attuale produce eventi poco realistici; elenca i problemi concreti; proponi l'architettura corretta;
identifica i file da modificare; implementa progressivamente; non alterare UI e parti non coinvolte; esegui
test automatici; esegui almeno 1.000 simulazioni; analizza le distribuzioni; correggi i problemi; ripeti i
test.

**NON dichiarare il lavoro completato perché «il codice funziona».** Il criterio di successo è: IL MATCH DEVE
SEMBRARE UNA PARTITA DI CALCIO REALE, NON UN GENERATORE DI EVENTI CASUALI. Il giocatore deve percepire che
dietro ogni highlight dell'eroe esiste una partita completa composta da 22 giocatori che stanno realmente
giocando.
