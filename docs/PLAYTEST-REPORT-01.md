# PLAYTEST CRITICO — rapporto n° 1

*Metodo: `docs/PLAYTEST-ATTACCANTE.md`. Sonda: `tests/visual/playtest-802.mjs`.
Base: 4 partite intere, GLB ON, regime del gioco, versione 7.801.*

---

## Il ritrovamento principale (P0 sulla priorità n° 2)

> «L'eroe è protagonista quando la partita lo rende protagonista, non perché è programmato
> per esserlo.» — direttiva PO, 06/09

**I momenti dell'eroe non nascono dalla partita: sono un calendario, calcolato prima del calcio
d'inizio.**

`src/14-live-match.jsx` r.471: al montaggio della partita si costruisce `hlTimes`, cioè
l'elenco dei minuti in cui l'eroe avrà i suoi momenti —

```
step = round((84 − 8) / (n − 1))
minuto_i = min(86, 8 + step·i + jitter)        jitter ∈ [0, 10)
```

e il dispatch (r.2980) si limita a `nx >= hlTimes[hlIdx]`. Il **cosa** succede è contestuale
(dal 5.79 la scheda si sceglie col punteggio, il minuto, il momentum e il possesso vivi).

### CORREZIONE — avevo scritto «non c'è una sola lettura del Match State». È falso.

Il PO ha chiesto conto di questa frase e aveva ragione. Le letture ci sono: **tre agganci
reattivi** possono inserire un highlight fuori calendario.

| aggancio | condizione | minuto in cui cade |
|---|---|---|
| gol subito (r.4731) | subiamo un gol prima del 75' | `nx + 4…8` |
| sotto di uno (r.2926) | **al 60' esatto**, `away − home == 1` | 63…67 |
| disperata (r.2941) | **al 72' esatto**, `away − home ≥ 2` | 76…80 |

Quindi il quadro giusto è: **il calendario è la spina dorsale, i tre agganci sono l'eccezione**.
E due dei tre sono a loro volta preconfezionati — scattano a **un minuto fisso** (60 e 72) con
una **soglia fissa di punteggio**, e depositano l'highlight in una finestra fissa. Il terzo, il
gol subito, è l'unico davvero guidato da un fatto della partita.

**Il difetto resta, ma va nominato correttamente**: non «nessuna lettura dello stato», bensì
*l'andamento della partita non decide QUANDO l'eroe ha il suo momento* — lo decide un orario,
salvo tre eccezioni, due delle quali sono a loro volta orari.

**La firma nei numeri**, quattro partite su quattro:

| | prima scena | ultima scena | tutte |
|---|---|---|---|
| Rossi | 13' | 84' | 13, 84 |
| Bianchi | 12' | 86' | 12, 30, 38, 86 |
| Verdi | 11' | 86' | 11, 11, 86 |
| Neri | 17' | 86' | 17, 50, 77, 86 |

La prima scena cade **sempre fra l'11' e il 17'**, l'ultima **sempre fra l'84' e l'86'**. Non è
una coincidenza dei semi: è la formula, `8 + jitter` e il tetto all'86'.

È esattamente la definizione di evento isolato che il PO ha dato — *«se un evento potrebbe
essere spostato in qualsiasi minuto senza cambiare nulla, è troppo scollegato dalla
simulazione»* — applicata al momento più importante del gioco: **l'highlight dell'eroe**.
Solo che qui è il contrario: non potrebbe essere spostato, perché il minuto è già deciso, e la
partita non ha voce in capitolo.

---

## Gli altri rilievi, in ordine di severità

### P1 — La partita si spegne nel finale

Righe di telecronaca nei primi 15' contro gli ultimi 15', quattro partite su quattro:

| Rossi | Bianchi | Verdi | Neri |
|---|---|---|---|
| 6 → 1 | 12 → 6 | 6 → 0 | 16 → 2 |

Il racconto cala del 60-100% nell'ultimo quarto d'ora. Nel calcio è il tratto in cui succede di
più. Una partita (Verdi) chiude con **zero** righe negli ultimi quindici minuti.

### P1 — Enfasi superiore alla sostanza

| | righe con enfasi | eventi che la meritano |
|---|---|---|
| Rossi | 4 (24 %) | 5 |
| Bianchi | 8 (20 %) | 7 |
| Verdi | 8 (28 %) | 4 |
| Neri | **22 (34 %)** | 6 |

Su Neri, ventidue righe gridano e sei eventi lo meritano. La telecronaca **racconta una partita
più bella di quella simulata** — che è la bugia del sistema nominata dal PO.

### P1 — Un evento su cinque è isolato

**51 righe su 227 (22 %)** non affermano niente, non hanno nulla che le prepari nei due minuti
prima e nulla che ne discenda nei due minuti dopo. *(Sovrastima nota: il minuto 1 risulta isolato
in 4 partite su 4, ma è la sigla di apertura — al netto, ≈20 %.)*

### P2 — Il vuoto più lungo è identico in tre partite su quattro

**19 minuti** in Rossi, Bianchi e Verdi; 13 in Neri. Un valore ripetuto tre volte su quattro
semi diversi non è casuale: c'è una struttura fissa dietro, da identificare.

---

## Quello che invece regge

- **Varietà della telecronaca: ottima.** Voci distinte 94-100 %, la frase più ripetuta esce
  **1-2 volte** in tutta la partita. Il lavoro del 7.788 tiene.
- **Il vuoto esiste ed è ampio.** 55-84 % dei minuti non produce una riga: la partita *ha* i
  suoi tratti in cui non succede niente, che è ciò che il PO chiede.
- **La densità non è piatta.** 0,19 · 0,33 · 0,45 · 0,73 righe/minuto: le quattro partite
  respirano in modo diverso l'una dall'altra.
- **Varietà dei tipi d'azione: 11-13 tipi**, il più frequente pesa il 20-33 %.

---

## Scorecard n° 1

| # | Area | Voto | Il numero che lo sostiene |
|---|------|:----:|---------------------------|
| 3 | Causalità | **4** | 22 % di eventi isolati; il momento dell'highlight non legge il Match State |
| 4 | Varietà | **8** | 11-13 tipi, il più frequente 20-33 %; voci distinte 94-100 % |
| 5 | Ritmo | **5** | vuoto 55-84 % (bene) ma finale che si spegne 4/4, e vuoto max identico 3/4 |
| 6 | Azioni extra-eroe | **n/d** | misura non valida in questa passata (vedi sotto) |
| 7 | Highlight dell'eroe | **3** | prima scena 11-17' e ultima 84-86' in 4 partite su 4: è un calendario |
| 8 | Telecronaca | **6** | ripetitività ottima (1-2×), ma enfasi 20-34 % contro 4-7 eventi che la meritano |

**1, 2, 11, 12 — non assegnate.** Realismo della partita, credibilità da attaccante, immersione
e sensazione di carriera non si misurano da una sonda: le assegna la passata da player, che non
ho ancora fatto. Non metto un voto dove non ho guardato.

**9, 10 — non assegnate.** Interazioni e coerenza fra i sistemi richiedono una sonda che ancora
non esiste.

---

## Una misura sbagliata, dichiarata

La sezione D (azioni extra-eroe) di questa passata **non vale**. La sonda leggeva `shots` e
`oppShots` dal Match State: quei campi **non esistono** — avrebbe restituito zero per sempre,
cioè «nessuno domina mai». È lo zero silenzioso in cui sono già cascato due volte. I campi veri
sono `momentum`, `pressione.addosso`, `poss`, `superiorita`; la sonda è stata corretta e la
misura va rifatta. Il numero che la passata ha stampato — «contestualizzate 22 %» — è da
buttare, non da citare.

---

# RETTIFICA E RAPPORTO n° 2 (06/09, sera)

## Il banco mentiva: quattro rilievi del rapporto n° 1 sono da buttare

Le sonde giravano a `tickMs=300` — dieci volte più veloci del reale — **senza scalare le attese**.
Le schede di scelta arrivano ogni ~10 minuti di gioco, cioè ~30 s veri, **meno dei 35 s** del tempo
di lettura: nessuna scadeva, `addCom` rifiutava ogni riga, e mancava l'88 % della telecronaca del
secondo tempo.

Stesso codice, banco tarato (`__CPM_SCMS681` in scala):

| | rapporto n° 1 (banco rotto) | rapporto n° 2 (banco tarato) |
|---|---|---|
| minuti vuoti | 55-84 % | **24-34 %** |
| vuoto più lungo | 13-19' | **6' in 6 partite su 6** |
| densità righe/minuto | 0,19-0,73 | **0,96-1,17** |
| primi 15' → ultimi 15' | 6→1 · 16→2 | **15→14 · 15→15 · 15→13** |
| voci distinte | 94-100 % | **86-89 %** |
| frase più ripetuta | 1-2× | **4×** |
| extra-eroe per partita | 2,25 | **0,83** |

**RITIRATO il P1 «la partita si spegne nel finale»**: è falso, i due quarti d'ora sono identici.
**REGOLA DEL BANCO, a verbale**: *chi accelera il gioco deve accelerare anche le attese*, altrimenti
misura una partita che non esiste. Scritta dentro le sonde.

## Cosa dicono i numeri veri

- **Il ritmo è un metronomo (P1).** Densità in banda 0,96-1,17; **15 righe nei primi 15 minuti in 5
  partite su 6**; vuoto massimo **6' in 6 su 6**. Sei partite con punteggi diversi e lo stesso ritmo.
- **Enfasi tripla (P1).** 33 % delle righe con marcatori d'enfasi contro **4 eventi** che la meritano.
- **Eventi isolati 85/376 (23 %) (P1).** Col campione buono il numero non migliora.
- **Prima scena dell'eroe al 12' in 6 partite su 6**, scene 2-3 (spread 1): nessuna giornata anonima.
  È il residuo dichiarato spedendo la 7.802.
- **Azioni extra-eroe 0,83 a partita**: poche, ma tutte in un momento che le giustifica.

## LA PASSATA DA PLAYER (eroe «Ferrari», seme 4242, finale 1-2)

### Ci credo: la storia dell'eroe

```
34'  il centrale gli si presenta al primo pallone: una spallata e due parole
36'  Ferrari non batte ciglio: il centrale aspetta una reazione che non arriva
44'  va a prendersi la palla venti metri più indietro
56'  dice due parole al gruppo: da lì in poi lo cercano di più
64'  si sposta dall'altra parte: l'ombra resta a marcare uno spazio vuoto
66'  quando la palla arriva dall'altra parte, Ferrari è solo → GOL
66'  «Si riscatta dopo l'occasione fallita di poco fa!»
69'  il difensore spinge il pallone con rabbia e gli dice qualcosa
71'  Ferrari non lo guarda nemmeno
```

Marcatura → nessuna reazione → si abbassa → si smarca → segna → il duello si chiude. **È una
giornata di carriera, e me la ricorderei.**

### Non ci credo: la storia della squadra

| minuto | cosa rompe |
|---|---|
| **88'** | sotto 1-2, tre minuti alla fine: «Scotti abbassa il baricentro. **Palla all'indietro con sicurezza**» |
| **87'** | «La squadra è in fiamme, il pubblico è in piedi!» mentre sei sotto e loro perdono tempo |
| **19'** | «Incornata di Bianchi **a botta sicura**!» → non succede niente. Quattro battute che promettono e non consegnano |
| **36'-49'** | tredici minuti di «la manovra sale», «baricentro alto», «si sale verso l'area»: otto righe che non arrivano da nessuna parte |
| 13'·30'·33'·36' | la stessa frase del commentatore quattro volte, tre in sei minuti |
| **10'** | «prova a sorprendere il portiere **da lontanissimo**»: il rilievo del PO è scritto nella libreria |

## Scorecard n° 2 — completa

| # | Area | Voto | Il numero o il fatto che lo sostiene |
|---|------|:----:|--------------------------------------|
| 1 | Realismo della partita | **5** | la squadra gioca uguale a 0-0 e a 1-2; palla indietro «con sicurezza» all'88' sotto di uno |
| 2 | Credibilità da attaccante | **7** | la catena marcatura→movimento→gol è causale e leggibile |
| 3 | Causalità | **4** | eventi isolati 23 %; costruzioni che non sfociano |
| 4 | Varietà | **6** | 11-13 tipi, ma la frase più ripetuta esce 4× |
| 5 | Ritmo | **4** | metronomo: densità 0,96-1,17, vuoto max 6' in 6/6, 15 righe nei primi 15' in 5/6 |
| 6 | Azioni extra-eroe | **6** | 0,83 a partita, 100 % contestualizzate: poche ma giustificate |
| 7 | Highlight dell'eroe | **6** | il *quando* ora emerge (7.802: 30 % contro 9 %), ma la prima scena è al 12' in 6/6 |
| 8 | Telecronaca | **5** | enfasi 33 % contro 4 eventi che la meritano |
| 9 | Interazioni | **7** | il filo 34'→71' con il difensore è la cosa migliore vista |
| 10 | Coerenza fra i sistemi | **5** | il racconto afferma stati che il tabellone smentisce |
| 11 | Immersione | **5** | rotta dalle ripetizioni e dall'enfasi che ignora il punteggio |
| 12 | Sensazione di carriera | **6** | la giornata dell'eroe ha una forma; la partita intorno è intercambiabile |

## La priorità che ne esce

**La squadra non reagisce al risultato.** È a monte del ritmo, dell'enfasi e degli eventi isolati:
finché il racconto della squadra è lo stesso sotto di due o avanti di due, ogni altra cura è
cosmetica. È il prossimo bersaglio.

---

# Rapporto n° 3 — passata da player sulla 7.807 (07/09, sera)

Due partite intere lette come le legge il giocatore (`passata-player.mjs`, GLB ON, banco tarato):
**Ferrari / seme 4242 → 1-2** (91 righe, 26 minuti su 89 senza niente, silenzio massimo 6') e
**Rossi / seme 9191 → 1-1** (68 righe, **44 minuti su 89 senza niente**, silenzio massimo 5').
Richiesta del PO: *«Dai un voto alla credibilità delle partite! Deve essere altissima!»*. Il voto
lo danno le partite, non la richiesta.

## Le bugie del sistema trovate leggendo (nuove)

| # | la riga | perché non ci credo |
|---|---|---|
| A | 53' *«Ferrari scarica su Ferrari»* · 55' *«Giro palla: Ferrari per Ferrari»* · 44' *«Spada appoggia su Spada e SCATTA»* | **un giocatore passa a sé stesso**. Cognomi dei PNG che coincidono con l'eroe o fra loro (Colombo GRA e POL, Spada GRA e POL, Leone, Bianchi): la rosa non evita i doppioni |
| B | 15' *«L'avversario avanza compatto»* → 16'-19' *«Colombo apre… Leone affonda… Cross di Leone: Bianchi stacca… Incornata di Bianchi a botta sicura!»* → 20' *«Gol avversario»* | le righe della costruzione **non portano la squadra**: con i cognomi condivisi si legge come un NOSTRO attacco che finisce in un gol LORO |
| C | 16' e 70' (Rossi), 56' (Ferrari): *«Toti ci arriva in tuffo…»* / *«respinge coi pugni»* **da sola** | l'occasione extra-eroe compare come **una parata senza il tiro** in 3 casi su 4: annunciata dall'ultima riga e basta (da verificare se è il banco delle schede o il gioco) |
| D | 84' sotto 1-2: *«Stiamo dominando — teniamo alta l'intensità!»* · 33' e 36' durante la NOSTRA ripartenza: *«Momento da soffrire»* (5 volte in una partita) | l'enfasi non guarda né il punteggio né chi ha la palla |
| E | 76': *«La conclusione è respinta — c'è ancora da giocare!»* e subito *«Rete spettacolare!»* | la catena chance→gol si racconta come una contraddizione |
| F | *«si sale verso l'area di Vallone (POL)»* (Vallone è la loro punta) · *«il portiere di Bianchi (POL)»* | l'area e il portiere prendono il nome di un giocatore di movimento |
| G | 14'-15' *«L'angolo si apre: conclusione sul palo lontano.» «Fuori di un niente.»* dopo il gol · 45' *«Tocco di ritorno di prima»* dopo il duplice fischio · 20' *«Bruno rifiuta il rilancio lungo»* subito dopo il gol subito | frammenti senza contesto, spostabili in qualunque minuto: **eventi isolati** |

Quello che invece **regge** e va tenuto: il filo del compagno giovane (46'→48'), il mister che
reagisce all'1-1 (79' *«ci sono venti minuti. Rossi, tu resta alto»*) e il cambio *«gestione del
vantaggio»* (65'): sono le uniche righe in cui la partita **sa che punteggio c'è**.

## Scorecard n° 3

| # | Area | n°2 | **n°3** | Il fatto che lo sostiene |
|---|------|:---:|:---:|---|
| 1 | Realismo della partita | 5 | **5** | a 1-2 sotto, negli ultimi 12' due righe di gioco e «stiamo dominando»; nell'altra, ultimi 10' a 1-1: un fallo |
| 2 | Credibilità da attaccante | 7 | **6** | la prima scena è al 12' anche stavolta; 76' chance→gol raccontata come contraddizione (E) |
| 3 | Causalità | 4 | **4** | frammenti isolati (G); parata senza tiro (C) |
| 4 | Varietà | 6 | **5** | «Momento da soffrire» ×5, «Gol avversario. X buca la nostra difesa» ×3, «brucia il centrocampo» ×2 |
| 5 | Ritmo | 4 | **4** | 26 e 44 minuti vuoti su 89; blocchi da 5-6 minuti |
| 6 | Azioni extra-eroe | 6 | **4** | il 3D ora segue il racconto (7.807), ma il racconto mostra solo la parata (C), tira «da lontanissimo», e le righe intorno passano a sé stesse (A) |
| 7 | Highlight dell'eroe | 6 | **6** | 5 scene in una partita, 2 nell'altra; il *quando* emerge |
| 8 | Telecronaca | 5 | **4** | D + F + A: tre modi diversi di dire il falso |
| 9 | Interazioni | 7 | **7** | mister e compagno giovane: le righe migliori della partita |
| 10 | Coerenza fra i sistemi | 5 | **4** | B: la costruzione avversaria si legge come nostra |
| 11 | Immersione | 5 | **5** | rotta ogni volta che un cognome è doppio |
| 12 | Sensazione di carriera | 6 | **6** | la giornata dell'eroe ha forma; la partita intorno no |

**Media: 5,0 su 10** (n°2: 5,5). Non è salita: la 7.807 ha corretto il 3D dell'occasione, ma la
lettura da player ha trovato bugie di **testo** che nella n°2 non avevo pesato (A, B, F) — e un
voto che non scende quando trovi bugie nuove non sarebbe un voto.

## Che cosa alza il voto, in ordine

1. **Nomi**: nessun cognome doppio nella stessa partita, mai il cognome dell'eroe fra i PNG (A). È
   un difetto da generatore di rose, piccolo e a effetto immediato su 8, 10, 11.
2. **La costruzione dice di chi è** (B): ogni riga di piano porta la squadra come le altre.
3. **L'occasione ha tutte le sue righe** (C): prima verificare sul banco, poi sul gioco.
4. **L'enfasi legge il punteggio e il possesso** (D) — a monte del ritmo (5) e della telecronaca (8).
5. Il tiro «da lontanissimo» (#44) e la rarità: dopo, non prima.

### Rettifica su A, letta nel codice subito dopo

I cognomi dei due eroi delle passate («Ferrari», «Rossi») stanno nel pool comune dei PNG: il
«Ferrari scarica su Ferrari» è in parte un artefatto della sonda, che sceglie nomi da quel pool.
Sul telefono del PO l'eroe ha il suo nome. Resta vero e da correggere: (a) il generatore non esclude
il cognome dell'eroe dai PNG; (b) i doppioni **fra le due squadre** (Colombo GRA e POL, Spada GRA
e POL) sono realistici nel calcio ma diventano una bugia quando le righe del piano **non portano
la squadra** — quindi il rimedio è B, e A si riduce a una riga nel generatore. Il voto non cambia:
B da sola vale la confusione del 16'-20'.

---

# Rapporto n° 4 — playtest sul build del branch (7.812, 08/09 mattina)

Quattro passate, ma **due partite distinte** (Vairo e Moretti) giocate due volte: `CPM_SEME` e
`CPM_AWAY` della sonda **non cambiano la partita** (il seme di partita nasce da nome+avversario+
stagione+settimana; il provino in trasferta non è entrato). Difetto della sonda, da correggere
prima del n° 5. Righe **40-62** (n° 3: 68-91), minuti vuoti **49-58 su 89**: bisezione banco/gioco
in coda (la passata girava col tempo reale del banco acceso).

| | Vairo casa | Moretti casa | Vairo «fuori» | Moretti «fuori» |
|---|---|---|---|---|
| righe / minuti vuoti | 40 / 58 | 62 / 49 | 41 / 56 | 53 / 51 |
| scene dell'eroe | 17', 28' | 17', 26' | 17', 28' | 17', 26' |
| gol · finale | 28' · 1-0 | 57' · 1-0 | 28' · 1-0 | 58' · 1-0 |

## Bugie nuove trovate leggendo

| | la riga | perché non ci credo |
|---|---|---|
| H | 56' *«Incornata di Pellegrini (GRA) a botta sicura!»* → 57' *«Colombo (GRA) segna!»* | chi colpisce di testa non è chi segna: il piano nomina uno, il microsim accredita un altro |
| I | 62' *«Luca verticalizza per Santoro: la difesa si allunga!»* **due volte** allo stesso minuto | riga doppia |
| J | 11', 67', 82' *«…la devia in angolo: che parata!»* e poi **nessun corner** | l'esito annunciato non ha seguito |
| K | 88' *«Riflesso felino del portiere di Pellegrini (GRA)»* | il portiere prende il nome di un giocatore di movimento (F del n° 3, ancora lì) |
| L | tre occasioni avversarie **identiche** in una partita («prova a sorprendere il portiere da lontanissimo» ×2, «Fontana ci arriva in tuffo» ×3) | il piano ha una sola forma |

Quello che le release hanno **davvero** cambiato, e si legge: occasioni intere (9'→11', 65'→67',
80'→82') con la squadra scritta; costruzione del gol intera (53'→57'); «Momento da soffrire» solo
mentre attaccano loro; «gestione del vantaggio» al 65'; nessuna riga d'enfasi contro il tabellone.

## Scorecard n° 4

| # | Area | n°3 | **n°4** | Il fatto |
|---|------|:---:|:---:|---|
| 1 | Realismo della partita | 5 | **5** | gestione del vantaggio ✔; avanti 1-0 la squadra non attacca più dal 28' |
| 2 | Credibilità da attaccante | 6 | **6** | 2 scene a 17' e 26'-28' in tutte e quattro, poi un'ora senza l'eroe |
| 3 | Causalità | 4 | **5** | occasioni e gol interi ✔; H (chi colpisce ≠ chi segna) |
| 4 | Varietà | 5 | **4** | L; «rinvio dal fondo» ×3 |
| 5 | Ritmo | 4 | **3** *(provv.)* | 49-58 minuti vuoti; bisezione banco/gioco in coda |
| 6 | Azioni extra-eroe | 4 | **5** | intere e firmate ✔; identiche, da fuori, corner mai battuto (J) |
| 7 | Highlight dell'eroe | 6 | **5** | due per partita, tutte prima del 30' |
| 8 | Telecronaca | 4 | **5** | enfasi coerente ✔; K, I |
| 9 | Interazioni | 7 | **7** | mister, coppia, il difensore dopo il gol |
| 10 | Coerenza fra i sistemi | 4 | **5** | sigla ✔; H |
| 11 | Immersione | 5 | **5** | |
| 12 | Sensazione di carriera | 6 | **6** | |

**Media: 5,1** (n° 3: 5,0). Le bugie misurate sono sparite dal diario; il voto non sale perché
le cause che pesano — l'ora muta, l'eroe che sparisce dopo il 30', la squadra che a 1-0 smette,
l'occasione con una forma sola — sono S1/S2, S3 v2 e S5, non ancora toccate. Il metro (≥ 8,0) è
lontano tre punti, come ieri.

### Rettifica n° 4 — il ritmo: né il banco né il build

Bisezione sulla stessa partita del n° 3 (Ferrari/4242) col build corrente: **96 righe / 26 vuoti /
5 scene** senza tempo reale, **93 / 27 / 5** con — identica al n° 3 (91 / 26 / 5). Le 40-62 righe
del n° 4 sono **le partite di Vairo e Moretti**: il gioco produce partite da 96 righe e 5 scene e
partite da 40 righe, 2 scene e 58 minuti muti. Il voto del ritmo non è una regressione (torna
**4**, come nel n° 3) ma lo *spread* fra partite è esso stesso il difetto: una partita su due è
muta per un'ora. **Media n° 4 corretta: 5,2.** Per il n° 5: quattro **nomi** diversi (il seme di
partita nasce dal nome), non quattro semi.

---

# Rapporto n° 5 — playtest sul build del branch (aea0d01 + 7.818 v1 in sorgente, 08/09 mezzogiorno)

Quattro **partite distinte** stavolta (quattro nomi: Vairo, Moretti in casa; Galli, Conti fuori),
lette da player, riga per riga. Il banco è lo stesso del n° 4.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 40 / 58 | 53 / 49 | 78 / 39 | 90 / 34 |
| scene dell'eroe | 17', 28' | 17', 26' | 12', 27', 74', 88' | 17', 30' |
| gol · finale | 28' · 1-0 | 57' · 1-0 | 12', 27', 57', 67', 88' · 3-2 | 17', 24', 53', 75' · 4-0 |

## La bugia più grossa, vista solo perché le partite erano quattro

| | la riga | perché non ci credo |
|---|---|---|
| **M** | 9' *«Spada (POL) serve Santis (POL) al limite della trequarti.»* · 10' *«Santis (POL) prova a sorprendere il portiere da lontanissimo!»* · 11' *«Fontana (GRA) ci arriva in tuffo e la devia in angolo: che parata!»* — **identiche, allo stesso minuto, in 8 diari su 8** (n° 4 + n° 5, casa e fuori; in Galli cambiano solo i cognomi) | la prima occasione di ogni partita è **la stessa**. Il player che gioca la quarta partita la riconosce alla seconda riga e da lì non crede più a niente. Causa letta nel codice: il piano dell'occasione è seminato con `hashStr("o695|"+nx+"|"+k)`, cioè **dal minuto e basta**; il seme di partita (`bgSimSeedRef`) non entra. Censimento: **12 sorteggi** in src/14 seminati solo dal minuto (piano occasione r.3416, piano gol r.3375, racconto della palla morta r.4287, catena r.3706, `rx/lx/sx` r.3559-3680, `eroe724` r.3627, `cv` r.4559, `int/int2` r.5072, catena hl r.7212). Anche il minuto è fisso: il cancello (r.3740) apre dal 7' con la premessa quasi sempre vera, e l'occasione si arma al primo tick libero, cioè al 9'. Stessa famiglia: *«Cambio in campo: si passa alla gestione del vantaggio»* al **65'** in tutte le partite in vantaggio (in Galli cade fra il cross e l'incornata avversaria) |

## Le altre bugie nuove

| | la riga | perché non ci credo |
|---|---|---|
| N | Vairo 28' *«Ha visto il taglio prima di tutti.»* → assist → GOL · Conti 17' *«Passaggio da manuale!»* → GOL | **il gol dell'eroe non ha la riga del gol**: nessuno dice chi ha segnato. Al 29' *«Spada esce dal mucchio dell'esultanza»* è l'unico indizio |
| Q | Conti 22'-24' *«Cross di Spada: Bruno stacca!» «Incornata di Bruno!» «Ferrari segna!» «…dove Pecoraro è salito»* · 74'-76' *«Conclusione secca di Scotti» «Ferrari segna!» «Corner battuto corto…» «…dove Lombardi ha attaccato»* · Moretti 55'-57' Pellegrini/Colombo/Neri | **tre o quattro nomi per un gol**: il piano nomina uno, il microsim ne accredita un altro, la libreria del gol ne racconta un terzo con un'azione diversa (corner corto dopo un tiro dal limite). La 7.814 (H) copre solo il caso in cui il piano è vivo |
| R | Galli 12' *«Respinta in corner»* → *«Si riscatta dopo l'occasione fallita di poco fa!»* → *«Destro perfetto»* → scena **intercept fallito · goal RIUSCITO** nello stesso minuto · 88' *«il portiere respinge! Occasione ancora aperta!»* + *«Tripletta!»* | l'eroe fallisce un intercetto e segna di destro nello stesso minuto, dopo un corner nostro; «si riscatta» da un'occasione che era di Ferrari. Tre gol dell'eroe in trasferta **senza un'azione prima** («Doppietta personale!» esce dal nulla al 27'): il momento preconfezionato che il PO non vuole |
| S | Galli 21' *«Toti (POL) riparte in campo aperto»* (Toti è il loro portiere) · 67' *«Lombardi blocca e rilancia con le mani»* (Lombardi è un'ala) · *«rinvio dal fondo per Spada / Pellegrini / Leone / Colombo»* (mai il portiere) | **i ruoli non contano**: il portiere fa il contropiede, l'ala para con le mani, il rinvio dal fondo lo batte chiunque (K del n° 4, ancora lì) |
| T | *«Triangolo veloce Pecoraro-Pecoraro-Bruno»* · *«Lombardi appoggia su Lombardi e SCATTA»* · *«spazzato di testa da Neri: la palla esce su Neri»* · Spada e Colombo in **tutte e due** le rose | A del n° 3, ancora lì: il pool dei cognomi è condiviso e ammette il doppione |
| U | Galli 57' gol LORO raccontato con *«Corner avversario spazzato di testa da Neri: la palla esce su Neri, rimasto alto»* · 67' gol LORO con *«Lombardi blocca e rilancia con le mani: niente pausa»* | la storia del gol è scritta **dal lato sbagliato**: racconta il nostro contropiede per un gol subito |
| V | Conti 24' 2-0, 53' 3-0, 75' 4-0: *«Squadra in vantaggio!»* | la riga del gol non guarda il punteggio (la 7.811 ha corretto l'enfasi, non questa) |
| W | Galli 68'-71': due contropiedi intrecciati (Lombardi ×4, Neri, Fontana, Bruno) che finiscono con un tiro dai venticinque metri **e** un due contro due · Conti 25'-27': *«PALO!»* + *«Stacco a due… respinta corta… tiro pulito dal limite… respinge coi pugni»* · 54'-56' e 58'-61' (Moretti): il racconto del gol **prosegue per 3-4 minuti dopo il gol** | **due registi**: la libreria del gol continua a recitare dopo il fatto, mentre un altro sistema apre un'azione nuova. «Gol della squadra: Bruno esce dal mucchio dell'esultanza» arriva al 57' per un gol del 53' |
| P | *«Filtrante di X — Y attacca lo spazio!»* ×3 (Moretti), ×4 (Conti), mai un esito | riga isolata, sempre la stessa |

Ancora lì dal n° 4: **J** (corner annunciato mai battuto: 11', 67', 82' · 11', 81' · 11', 71' · 11', 44' → **0 su 9**), **L** (occasioni identiche), K.

## Scorecard n° 5

| # | Area | n°4 | **n°5** | Il fatto |
|---|------|:---:|:---:|---|
| 1 | Realismo della partita | 5 | **5** | in casa 1-0 e la squadra smette al 28' (Vairo: una sola azione nostra in 89'); fuori 4-0 con «Squadra in vantaggio» sul 4-0 (V); le manovre intere di Conti (19'-24', 50'-53', 71'-75') sono le righe migliori mai lette |
| 2 | Credibilità da attaccante | 6 | **5** | scene al 17' e 26'-30' in tre partite su quattro, poi un'ora senza l'eroe; la tripletta di Galli esce dal nulla (R) |
| 3 | Causalità | 5 | **4** | N, Q, U, W: il gol non ha un autore, la storia continua dopo il fatto |
| 4 | Varietà | 4 | **3** | M: la stessa occasione al 9' in otto partite; L; P |
| 5 | Ritmo | 4 | **4** | 34-58 minuti vuoti; lo spread fra partite (40 righe contro 90) resta |
| 6 | Azioni extra-eroe | 5 | **4** | intere e firmate ✔, ma sempre la stessa, sempre da fuori, e il corner non si batte (J 0/9) |
| 7 | Highlight dell'eroe | 5 | **5** | due per partita prima del 30'; Galli quattro, ma tre gol senza azione |
| 8 | Telecronaca | 5 | **4** | S, T, V, K: ruoli e punteggio ignorati, cognomi doppi |
| 9 | Interazioni | 7 | **7** | mister che prepara il cambio, il centrale al primo pallone, l'intesa con Scotti: si crede; «esce dal mucchio dell'esultanza» 4' dopo il gol no |
| 10 | Coerenza fra i sistemi | 5 | **4** | Q, U, W: piano, microsim e libreria raccontano tre gol diversi |
| 11 | Immersione | 5 | **4** | rotta alla quarta partita dal copione del 9' (M) |
| 12 | Sensazione di carriera | 6 | **6** | |

**Media: 4,6** (n° 4: 5,2). Non è una regressione del build: il n° 4 aveva due partite giocate due
volte e il copione fisso non poteva vedersi; con quattro partite vere si vede, e pesa su quattro
aree. Il metro (≥ 8,0, nessuna area < 7) è a tre punti e mezzo.

## Che cosa alza il voto, in ordine

1. **M** — il seme di partita in tutti i sorteggi del racconto (12 siti), e il minuto dell'occasione
   che nasce dallo stato della partita, non dal cooldown. Misura: righe identiche allo stesso minuto
   fra 4 partite (oggi 3 righe × 8/8) → 0; minuto della prima occasione (oggi 9' × 8) → distribuito.
2. **W + Q + U** — un regista solo per il gol: chi tira è chi segna, la storia finisce col gol, e la
   storia è del lato che segna (S2 della roadmap, versante racconto).
3. **N** — la riga del gol dell'eroe.
4. **S + T + K** — ruoli veri nelle frasi (il rinvio dal fondo lo batte il portiere, nessun portiere
   in contropiede) e pool dei cognomi senza doppioni.
5. **J** — diagnostica in corso (testimone J818).
