# PLAYTEST CRITICO — la carriera di un ATTACCANTE

> Direttiva PO del 06/09, due messaggi complementari. Questo documento è il **metodo**:
> come si testa, cosa si misura, come si assegna il voto. La sonda che produce i numeri è
> `tests/visual/playtest-802.mjs`.

## 0. Il cambio di metro

Fino a ieri la domanda del collaudo era **«il codice funziona?»**. Da oggi è **«ci credo?»**.

Sono due domande diverse e possono dare risposte opposte: una partita in cui ogni sistema
fa esattamente quello che deve fare può essere, per chi guarda, una sequenza di highlight
senza calcio in mezzo. Un verde tecnico non è un verde di playtest.

Corollari, dalle parole del PO:

- **Non è un manageriale a 360°.** È la carriera di UN attaccante. Tutto ciò che non
  contribuisce a farci vivere la sua giornata è, nel migliore dei casi, arredamento.
- **La partita non è un generatore di highlight.** Devono esistere minuti in cui non succede
  niente, e devono essere credibili anche quelli.
- **L'eroe è protagonista quando la partita lo rende protagonista**, non perché è programmato
  per esserlo. Una partita anonima dell'eroe è un risultato valido, non un difetto.
- **La telecronaca non inventa una partita diversa** da quella simulata, e non ha bisogno di
  enfasi per essere interessante.
- **Niente eventi isolati.** «Se un evento potrebbe essere spostato in qualsiasi minuto della
  partita senza cambiare nulla, probabilmente è troppo scollegato dalla simulazione.»
- **Niente feature nuove per compensare una partita poco credibile.** Se servono meno
  highlight per renderla realistica, si riducono. Il realismo viene prima della spettacolarità.

## 1. Come si testa

Partite **intere**, in regime di gioco (GLB ON, autoplay a semi dichiarati), guardate
dall'inizio alla fine. Non si campionano i momenti belli: si guarda anche il vuoto.

Tre passate, sempre nell'ordine:

1. **Passata da player.** Si guarda la partita e si risponde a una domanda sola: *dopo questa
   partita, ho la sensazione di aver vissuto una giornata della carriera del mio attaccante?*
   Nessun log, nessun DevTools. Si annotano i momenti in cui **si smette di crederci**.
2. **Passata con i numeri.** Si lancia la sonda e si guardano gli indicatori del §2. I numeri
   non sostituiscono la passata da player: servono a dire se ciò che si è visto è la regola o
   l'eccezione, e a rendere ripetibile il giudizio.
3. **Realism Red Team.** Si cercano le **bugie del sistema**, senza difendere il codice: dove
   il gioco mostra una cosa e ne racconta un'altra; dove un evento accade perché «tocca a
   lui»; dove una frase promette un calcio che nel campo non c'è.

Regola di condotta del red team: **non si giustifica un difetto con l'implementazione**. Se
la spiegazione comincia con «è così perché il sistema…», la risposta è comunque *non ci credo*.

## 2. Gli indicatori (cosa misura la sonda)

Ogni indicatore ha un numero, non un'impressione. Fra parentesi la domanda del PO a cui
risponde.

### A. Ritmo e vuoto (*«anche il non accadere nulla deve essere credibile»*)
- `minuti-vuoti` — quanti minuti di partita non producono **nessuna** riga di telecronaca.
- `vuoto-massimo` — il più lungo tratto consecutivo di minuti senza righe.
- `righe/minuto` — densità media, e la sua distribuzione nel tempo (primi 15' vs ultimi 15').
- `intervallo-fra-highlight` — mediana e p90 dei minuti fra due momenti salienti.

**Bugia da cercare:** densità piatta. Se ogni minuto ha lo stesso numero di righe, la partita
non ha respiro: è un metronomo, non un calcio.

### B. Coinvolgimento dell'eroe (*«non rendete l'attaccante un supereroe»*)
- `scene-eroe` — quante scene interattive per partita, e in quali minuti.
- `quota-eroe` — righe che nominano l'eroe / righe totali.
- `vuoto-eroe` — il più lungo tratto di minuti in cui l'eroe non compare mai.
- `dispersione-partite` — varianza del coinvolgimento **fra** partite: devono esistere
  giornate anonime.

**Bugia da cercare:** coinvolgimento costante. Se l'eroe ha sempre lo stesso numero di scene
qualunque partita giochi, non è la partita a renderlo protagonista: è il programma.

### C. Causalità (*«ogni cosa deve avere una causa visibile»*)
- `eventi-agganciati` — quota di eventi la cui riga si spiega con lo stato del minuto
  (possesso, turno, fase, punteggio, pressione).
- `eventi-isolati` — il criterio testuale del PO, reso operativo: un evento è **isolato** se
  tutte e tre le cose sono vere insieme —
  1. non cambia nulla nello stato (non muove possesso, non muove tabellino, non muove punteggio: `muta:1`),
  2. non è preceduto da nulla che lo prepari (nessuna riga collegata nei 2 minuti prima),
  3. non è seguito da nulla che ne discenda (nessuna riga collegata nei 2 minuti dopo).
  Un evento così **potrebbe essere spostato in qualsiasi minuto senza cambiare nulla**: è
  esattamente la definizione del PO.
- `catene-spezzate` — quote della catena MATCH STATE → … → NUOVO STATO che non arrivano in fondo.

### D. Azioni extra-eroe (*«devono avere una funzione narrativa»*)
- `extra/partita` — quante.
- `extra-contestualizzate` — quota di quelle che arrivano in un momento che le giustifica
  (la squadra sta soffrendo / sta dominando / il punteggio le chiede qualcosa), contro quelle
  che arrivano su uno stato neutro.
- `extra-riempitive` — extra che soddisfano il test di isolamento del punto C.

**Bugia da cercare:** l'azione extra-eroe che serve solo a riempire il tempo mentre l'eroe è
fermo. Se non racconta che la squadra soffre o domina, non ha funzione.

### E. Telecronaca (*«non deve inventare una partita diversa»*)
- `voci-distinte` — righe diverse / righe totali.
- `più-ripetuta` — quante volte ricorre la frase più frequente in una partita.
- `enfasi` — quota di righe con marcatori di enfasi (punto esclamativo, superlativi,
  «incredibile», «clamoroso», «pazzesco»…) e confronto con la quota di eventi che
  l'enfasi meriterebbe (gol, occasioni, parate).
- `smentite` — righe che affermano un fatto che lo stato non conferma (già coperto dal metro
  delle righe fondate del 7.760, qui riportato nella scorecard).

**Bugia da cercare:** enfasi superiore alla sostanza. Se il 40% delle righe grida e il 5%
degli eventi lo merita, la telecronaca sta raccontando un'altra partita.

### F. Varietà (*«evitate schemi ripetitivi»*)
- `tipi-di-azione` — distribuzione dei tipi; l'indice di concentrazione (quanto pesa il tipo
  più frequente).
- `sequenze-ripetute` — coppie/terne di tipi che ricorrono identiche.

## 3. La scorecard (1-10)

Dodici aree, come le ha nominate il PO. Si compila **dopo** le tre passate, e ogni voto porta
con sé il numero che lo sostiene: un voto senza numero è un'opinione.

| # | Area | Voto | Numero che lo sostiene |
|---|------|------|------------------------|
| 1 | Realismo della partita | | |
| 2 | Credibilità dell'esperienza da attaccante | | |
| 3 | Causalità | | |
| 4 | Varietà | | |
| 5 | Ritmo | | |
| 6 | Azioni extra-eroe | | |
| 7 | Highlight dell'eroe | | |
| 8 | Telecronaca | | |
| 9 | Interazioni | | |
| 10 | Coerenza fra i sistemi | | |
| 11 | Immersione | | |
| 12 | Sensazione di carriera | | |

Scala: **1-3** non ci credo · **4-5** ci credo a tratti · **6-7** ci credo, con riserve
nominate · **8-9** ci credo · **10** non saprei distinguerlo da una partita vera.

## 4. Severità

- **P0** — rompe la credibilità della partita. Chi guarda smette di crederci **in quel
  momento**: il gioco mostra una cosa e ne racconta un'altra, o succede qualcosa che nel
  calcio non succede.
- **P1** — erode la credibilità nel corso della partita: ripetizioni, enfasi fuori misura,
  eventi isolati, eroe protagonista per programmazione.
- **P2** — infastidisce ma non rompe: varietà povera, ritmo piatto, cosmetica sbagliata.
- **P3** — rifinitura.

## 5. Ordine delle priorità (dal PO, non negoziabile)

1. Credibilità della partita
2. Credibilità dell'esperienza da attaccante
3. Causalità
4. Varietà
5. Qualità degli highlight
6. Continuità narrativa
7. Cosmetica

E la regola che le governa tutte: **non si aggiungono feature per compensare una partita poco
credibile**. Se un rimedio consiste nell'aggiungere qualcosa, va giustificato contro
l'alternativa di **togliere**.

## 6. Cosa questo documento NON è

Non è un gate. La CI resta il guardiano del codice; questo è il guardiano dell'**esperienza**.
Un playtest rosso non blocca una release tecnica: la mette a verbale come debito di
credibilità, con severità e numero, in `docs/FASE3-SCAMBIO.md`.
