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

---

# Rapporto n° 6 — playtest sul build 7.824 (08/09 pomeriggio)

Build: 7.818 v4, 7.819-7.824, 7.822 **v2** (che affama la libreria: 0 azioni a partita, vedi
verbale). Stessi quattro nomi del n° 5.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 43 / 57 | 46 / 57 | 57 / 52 | 73 / 40 |
| scene dell'eroe | 18', 26' | 22', 31' | 12', 45', 88' | 10', 18', 65' |
| gol · finale | — · 0-0 | 22', 57' · 2-0 | 12', 58', 68' · 2-1 | 10', 18', 24', 53', 75' · 4-1 |

## Le bugie del n° 5, misurate sul testo (`analisi-diario.py`)

| bugia | n° 5 | **n° 6** |
|---|:---:|:---:|
| M — righe identiche allo stesso minuto fra le 4 partite (3 sono legittime: intro, duplice fischio ×2) | 11 | **6** |
| M — la prima occasione al 9' | 3/4 | 1/4 (Moretti: stessa forma, nomi e varianti diverse) |
| J — corner annunciato → corner battuto | 0/9 | **5/5**, ma **7 minuti dopo** (55'→62', 11'→18', 77'→84', 35'→42', 76'→83') |
| N — gol dell'eroe con la riga del gol | 0/5 | **4/4** |
| V — «Squadra in vantaggio!» col margine già > 1 | 3/4 | **0/0** («Raddoppio», «Partita in mano: 3-0») |
| S — rinvio dal fondo battuto da un uomo di movimento | 6/6 | **0/3** |
| S — portiere in contropiede · ala «con le mani» | 1/1 · 1/1 | **0/1 · 0/0** |
| T — lo stesso cognome due volte in una riga | 2 | **0** (l'unico caso è «Vince Pecoraro», legittimo) |
| W — la libreria continua dopo il gol | 3 casi | **0** (ma la libreria non apre più: v2 revocata) |
| U — manovra nostra sopra un gol loro | 2 | **0** |

## Le bugie che restano, e le nuove

| | la riga | perché non ci credo |
|---|---|---|
| **Q** | Moretti 56' *«Conclusione secca di Pellegrini»* → 57' *«Colombo segna!»* · Galli 57' *«Incornata di Bruno»* → *«Colombo segna!»* · Conti 74' *«Incornata di Bruno»* → *«Ferrari segna!»* (24' *Ferrari stacca → Ferrari segna* ✔) | chi conclude non è chi segna in **3 gol su 4** con piano: la 7.814 non firma. Testimone di dettaglio aggiunto (`NOME814.det`) per il n° 7 |
| **R** | Galli 12' *corner → intercept fallito → «Galli segna su assist di Giordano»* nello stesso minuto · 45' *«Para il portiere» · miss · duplice fischio* | scene dell'eroe contraddittorie nello stesso minuto; e le scene cadono sempre fra il 10' e il 22' e fra il 26' e il 31' (calendario fisso `hlTimes`) |
| **Y** | *«Conti segna su assist di Landi»*, *«Galli segna su assist di Giordano»*: Landi e Giordano **non sono in campo** · 28' *«Moretti corre ad abbracciare Scotti: il gol è di tutti e due»* dopo l'assist di Landi | i compagni dell'assist vengono dalla rosa di carriera, non dall'undici → **7.825** (build successivo) |
| **Z** | Conti 44'-46': apertura, *duplice fischio*, tiro, parata — l'occasione **a cavallo dell'intervallo** · Galli 45' scena dell'eroe e intervallo nello stesso minuto | il fischio dell'intervallo non ferma le macchine |
| **AA** | *«Fontana allarga le braccia e lo chiama»*, *«Fontana esce dal mucchio dell'esultanza»* (Fontana è il portiere) ×3 | il «compagno» delle interazioni è pescato anche fra i portieri |
| **AB** | Vairo 89' *«Stiamo dominando nel finale — serve il colpo che sblocca!»* sullo 0-0 dopo 57 minuti muti e zero tiri nostri | l'enfasi guarda il momentum, non i fatti |
| **AC** | Conti 10' e 18': *«GOOOOOL! Folla in delirio!»* dal nulla, due volte in otto minuti | il gol dell'eroe senza un'azione prima (già in R del n° 5) |
| P | *«Filtrante di X — Y attacca lo spazio!»* ×2-3 a partita, mai un esito | ancora lì |
| ritmo | 57 / 57 / 52 / 40 minuti vuoti | peggio del n° 5 (58/49/39/34): la libreria spenta dalla v2 toglieva 2-3 azioni a partita |

## Scorecard n° 6

| # | Area | n°5 | **n°6** | Il fatto |
|---|------|:---:|:---:|---|
| 1 | Realismo della partita | 5 | **5** | Vairo 0-0 con 57' muti e zero tiri nostri; Conti 4-1 con due gol dell'eroe dal nulla; i corner e i tabelloni ora tornano |
| 2 | Credibilità da attaccante | 5 | **5** | scene sempre negli stessi quarti d'ora; AC; R |
| 3 | Causalità | 4 | **5** | N ✔, W ✔, corner battuto ✔ ma 7' dopo; Q 3/4 |
| 4 | Varietà | 3 | **5** | copione del 9' rotto (M 11→6); occasioni «dal limite», «presa sicura», «respinge coi pugni» |
| 5 | Ritmo | 4 | **3** | 40-57 minuti vuoti, libreria a zero |
| 6 | Azioni extra-eroe | 4 | **5** | firmate, variate, con l'esito; il corner arriva tardi |
| 7 | Highlight dell'eroe | 5 | **5** | |
| 8 | Telecronaca | 4 | **6** | S/T/V ✔; AB; AA |
| 9 | Interazioni | 7 | **7** | mister e capitano ✔; il portiere come compagno (AA) |
| 10 | Coerenza fra i sistemi | 4 | **5** | Q, Y, Z |
| 11 | Immersione | 4 | **5** | |
| 12 | Sensazione di carriera | 6 | **6** | |

**Media: 5,2** (n° 5: 4,6; n° 4: 5,2). Sette bugie chiuse e misurate; il voto torna dov'era perché
il ritmo è sceso (libreria spenta, v2 revocata → v3 «porta differita» nel build successivo) e
perché Q, R e le scene a calendario fisso pesano su quattro aree. Il metro (8,0) resta a tre punti.

## Che cosa alza il voto, in ordine

1. **Ritmo**: 7.822 v3 (la libreria prenota e apre dopo il gol) e, strutturale, S5 (l'occasione è
   un'azione: la libreria e il piano dell'occasione sono la stessa cosa).
2. **Q**: perché la 7.814 non firma nel banco del player (testimone di dettaglio nel n° 7).
3. **R + calendario fisso delle scene**: i minuti delle scene dell'eroe nascono da `hlTimes`
   (8-17' e poi ogni ~step), non dalla partita; e due scene nello stesso minuto si contraddicono.
4. **Z, AA, Y, AB**: intervallo che ferma le macchine; niente portieri fra i «compagni»; assist
   dall'undici (7.825, già nel sorgente); enfasi sui fatti.

---

# Rapporto n° 7 — build 7.825 (08/09, tardo pomeriggio) — misura di v3/v5/7.825, non un voto nuovo

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 44 / 56 | 46 / 57 | 62 / 46 | 78 / 40 |
| scene dell'eroe | 18', 26' | 22', 31' | 12', 20', 61', 77' | 10', 18' |
| gol · finale | 18', 26' · 2-0 | 22', 57' · 2-0 | 57', 67', 77' · 2-1 | 18', 24', 53', 75' · 4-0 |

- **Q, causa trovata col testimone**: la 7.814 calcolava il nome giusto in **5 gol su 5** («Pellegrini»,
  «Pecoraro», «Ferrari», «Lombardi», «Bruno») e la riga ne stampava un altro in 4 su 5. Il
  sovrascrittore è l'handler del 7.170 (badge/float del gol), che un rigo dopo pescava un marcatore a
  sorteggio dalla rosa e lo assegnava anche al testo. **7.830** (sorgente): chi ha fatto l'ultima
  battuta segna, ovunque; maiuscole dalla rosa.
- **Y chiusa (7.825)**: «Lombardi segna su assist di Vairo», «Moretti segna su assist di Ferrari»:
  tutti in campo (4/4).
- **J, v5 senza effetto**: il corner arriva ancora **7 minuti** dopo la parata, in 8 casi su 8
  (34'→41', 55'→62', 70'→78', 11'→18', 77'→84', 32'→40'…). Non è il ttl, non è il budget, non è la
  riga persa, non è la chiusura del piano: per 6-7 tick la sezione delle righe non vede la palla morta.
  Testimone di linea temporale `__CPM_J818T` (battuta / chiusura / armamento / riga) nel sorgente.
- **7.822 v3 (porta differita)**: la libreria si è riaperta in 2 partite su 4, ma **intrecciata
  all'occasione** (Galli 13'-17': «Stacco a due… Incornata schiacciata… Salvataggio sulla linea!» in
  mezzo a «Ferrari scarica su Pecoraro… Conclusione secca… Presa sicura di Toti»; Conti 12'-17' lo
  stesso). Due registi nello stesso minuto: il cancello dell'occasione non guardava la libreria in
  recita. **7.829** (sorgente): l'occasione porta la sua costruzione (5 battute, un regista) e non si
  arma sopra un'azione della libreria in corso.
- Z (Conti 44'-46' a cavallo dell'intervallo) e AA («Fontana allarga le braccia») ancora lì: 7.826 e
  7.828 sono nel sorgente, non in questo build.
- Ritmo: 40-57 minuti vuoti, come il n° 6.

**Voto n° 7: 5,3** (n° 6: 5,2): +Y, +Q diagnosticata ma non ancora corretta nel build, ritmo uguale.
Il metro resta a 8,0.


---

# Rapporto n° 8 — build 7.830 (08/09 sera)

Build: 7.818 v5+testimone, 7.822 v3, 7.825-7.830 (assist dall'undici, compagno non portiere, «dominando» con un
tiro, intervallo che ferma le macchine, occasione con la costruzione, il marcatore è uno solo).

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 45 / 55 | 49 / 51 | 60 / 46 | 66 / 39 |
| scene dell'eroe | 18,26 | 10,26 | 12,55,88 | 10,18 |
| finale | 0-0 | 1-0 | 2-1 | 4-0 |

## Misurato sul testo (`analisi-diario.py`), n° 7 → n° 8

| bugia | n° 7 | **n° 8** |
|---|:---:|:---:|
| Q — chi conclude è chi segna (gol con piano) | 1/5 | **5/5** («Pellegrini segna!», «Bruno segna!», Ferrari/Lombardi/Bruno) |
| Y — assist da uno dell'undici | 4/4 | 2/2 |
| Z — occasione a cavallo dell'intervallo | 1 | **0** |
| AA — il portiere come «compagno» | 1 | **0** («Neri allarga le braccia») |
| S/T/V/N (portiere, cognomi doppi, margine, riga del gol) | 0 errori | 0 errori |
| J — corner battuto dopo la parata | +7' | ancora +7/+9' (v6 non in questo build) |
| occasione extra-eroe: battute | 3 | **5** (costruzione + apertura + tiro + parata) |
| libreria: aperture per partita · sul tick del gol · palla loro | 0-2 · 0 · 3/5 | 2/1/0/2 · **0** · 3/5 |
| righe identiche allo stesso minuto (3 legittime) | 8 | 9 |

## Scorecard n° 8

| # | Area | n°7 | **n°8** | Il fatto |
|---|------|:---:|:---:|---|
| 1 | Realismo della partita | 5 | **5** | Vairo 0-0 con 50+ minuti muti; Conti 4-0 |
| 2 | Credibilità da attaccante | 5 | **5** | scene a 10'-26' in tre partite su quattro (calendario fisso, R) |
| 3 | Causalità | 5 | **6** | Q, Y, Z chiuse; il corner ancora tardi |
| 4 | Varietà | 5 | **5** | |
| 5 | Ritmo | 3 | **4** | fuori 39-46 minuti vuoti, in casa ancora oltre 50 |
| 6 | Azioni extra-eroe | 5 | **6** | cinque battute, con la costruzione; nessuna manovra intrecciata |
| 7 | Highlight dell'eroe | 5 | **5** | |
| 8 | Telecronaca | 6 | **6** | |
| 9 | Interazioni | 7 | **7** | |
| 10 | Coerenza fra i sistemi | 5 | **6** | un marcatore solo; libreria mai sul gol |
| 11 | Immersione | 5 | **6** | |
| 12 | Sensazione di carriera | 6 | **6** | |

**Media: 5,6** (n° 7: 5,3; n° 5: 4,6). Il metro (8,0) è a due punti e mezzo. Le cause che pesano:
il ritmo in casa (S1/S2/S5 ancora aperte: la squadra a 1-0 smette), il calendario fisso delle scene
dell'eroe (R), la libreria che parla solo dal nostro lato (U), il corner in ritardo (v6 nel build
successivo).

---

# Rapporto n° 9 — build 7.831.1 (08/09 sera tardi)

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 48 / 53 | 55 / 50 | 72 / 44 | 63 / 43 |
| scene dell'eroe | 18', 26' | 10', 54' | 12', 30', 61', 77' | 10', 18', 65' |
| finale | 0-0 | 2-0 | 2-1 | 4-1 |

Misurato sul testo: corner 57'→**58'** (1/1, era +7'); chi conclude è chi segna **4/4**; rinvio dal
fondo 1/6 sbagliato (Toti nel diario di Moretti: il rinvio LORO, «Toti (POL)» è il loro portiere —
falso positivo dell'analisi, che conosce solo il nostro); cognomi doppi 0; margine 0/1.

## Bugie nuove (viste bene per la prima volta)

| | la riga | perché non ci credo |
|---|---|---|
| **AD** | Galli 11' *«Pecoraro serve Colombo al limite»* → 12' *«Murato dalla difesa»* (scena dell'eroe) → 13' *«Colombo prova da lontanissimo»* · Conti 17' *«Scotti si gira sul limite e lascia partire il destro!»* → 18' *«Palla d'oro! Il compagno non riesce a concludere… Conti segna! 2-0»* | **la scena dell'eroe si apre sopra un'occasione in corso** e la spezza: il tiro di Scotti non ha esito, la parata non c'è, il gol dell'eroe arriva nello stesso minuto |
| **AE** | Galli 37'-44': *«Fontana rifiuta il rilancio… Lombardi si abbassa…»* (libreria) + *«Ripartiamo in verticale… Tre tocchi e via… due contro due»* (contropiede) + *«Sovrapposizione di Lombardi… Parabola sul secondo palo… Il marcatore la respinge»* (libreria) · Moretti 13'-15' e Galli 82'-85': righe di libreria alternate a *fallo*, *rimessa laterale*, *giro palla* | **le righe programmate della libreria (una ogni 1,3 s) non si fermano** per falli, rimesse, contropiedi o scene: tre narratori nello stesso minuto |
| K | *«il portiere di De Santis (POL) devia in tuffo!»* | il template del contropiede (r.4479) non era passato a {GKA} |
| AA | *«Galli segna su assist di Fontana!»* | il compagno dell'assist (7.825, dall'undici) può essere il portiere |

## Scorecard n° 9

| # | Area | n°8 | **n°9** |
|---|------|:---:|:---:|
| 1 Realismo | 5 | **5** |
| 2 Credibilità da attaccante | 5 | **5** |
| 3 Causalità | 6 | **6** |
| 4 Varietà | 5 | **5** |
| 5 Ritmo | 4 | **4** |
| 6 Azioni extra-eroe | 6 | **6** |
| 7 Highlight dell'eroe | 5 | **5** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 6 | **5** (AD, AE) |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 5,5** (n° 8: 5,6). AD e AE sono S2 sul racconto — un solo padrone: rimedi 7.833 con
misura sul testo (occasioni spezzate da una scena, azioni di libreria con righe estranee in mezzo).


---

# Rapporto n° 10 — build 7.834 (08/09 notte)

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 50 / 53 | 59 / 47 | 63 / 44 | 72 / 42 |
| scene dell'eroe | 18', 26' | 22', 31' | 30', 60', 69', 78' | 10', 33', 64' |
| finale | 0-0 | 3-0 | 3-1 | 4-1 |

Misurato sul testo, n° 9 → n° 10: **[AD] tiri di battuta senza esito 2 → 0** · **[AE] azioni di
libreria intrecciate 7 → 0** · chi conclude è chi segna 5/5 · corner al minuto dopo 4/4 · «portiere
di X» 0 · assist dal portiere 0 · «dominando» sullo 0-0 muto → «Comandiamo il gioco senza pungere»
(Vairo 89').

## Che cosa resta, letto nei diari

| | la riga | perché non ci credo |
|---|---|---|
| **Q-loro** | Conti 41'-44' *«Santis ruba il tempo… Marchetti conduce e scarica su Santoro… Santoro calcia di prima»* → *«Gol avversario. Spada buca la nostra difesa»* | il marcatore del gol LORO è ancora a sorteggio: la 7.814/7.830 firma solo i nostri |
| AC | Galli 69' *«Imparabile! Galli segna! 2-1»* · Conti 10' | il gol dell'eroe senza un'azione prima |
| E (n° 3) | Galli 78' *«Filtrante perfetto! La conclusione è respinta — c'è ancora da giocare!»* + *«Destro perfetto — nessuna speranza!»* | la catena chance → gol si racconta come contraddizione |
| P | *«Palla persa alta! X riparte in campo aperto — che pericolo!»* ×5, mai un seguito | riga isolata |
| ritmo | 53 / 47 / 44 / 42 | in casa a 0-0 la squadra non tira mai (Vairo: zero conclusioni nostre in 89') |

## Scorecard n° 10

| # | Area | n°9 | **n°10** |
|---|------|:---:|:---:|
| 1 Realismo | 5 | **5** |
| 2 Credibilità da attaccante | 5 | **5** |
| 3 Causalità | 6 | **6** |
| 4 Varietà | 5 | **6** (occasioni «da due passi», «a tu per tu», «dal limite», «da fuori», presa/pugni/tuffo) |
| 5 Ritmo | 4 | **4** |
| 6 Azioni extra-eroe | 6 | **7** (cinque battute, esito, corner, un regista solo) |
| 7 Highlight dell'eroe | 5 | **5** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 5 | **6** (AD/AE a zero; Q-loro) |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 5,7** (n° 9: 5,5; n° 5: 4,6). Il metro (8,0) è a 2,3 punti. Prossimi, in ordine: Q-loro,
il ritmo in casa (la squadra a 0-0 non tira: S3 v2 / S5), AC, E, P.

---

# Rapporto n° 11 — build 0c956f9 (7.833 v2, 7.834, 7.835) — 08/09 notte

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 44 / 53 | 59 / 47 | 65 / 41 | 65 / 44 |
| scene dell'eroe | 18', 30', 61' (tutte fallite) | 22', 31' | 30', 60', 69', 78' | 10', 33', 81' |
| finale | 0-1 | 3-0 | 2-1 | 4-1 |

Misurato sul testo: **Q-loro 2/2** («Incornata di Spada» → «Spada buca», «Conclusione secca di
Luca» → «Luca buca»; n° 10: 0/1) · [AD] tiri di battuta senza esito **0** · [AE] azioni di
libreria intrecciate **0** (con la v2 del troncamento) · chi conclude è chi segna 4/4 · corner
al minuto dopo · «Comandiamo il gioco senza pungere» sul 3-0 muto di Conti (53').

Vairo: 0-1 in casa con tre scene dell'eroe fallite (intercept, gol subito, «nothing») e nessun
tiro nostro in 89 minuti — il ritmo in casa è il difetto che resta, e non è di racconto.

**Media: 5,7** (uguale al n° 10; Q-loro chiusa, nessuna area cambia di un punto intero).

---

# Rapporto n° 12 — build 7.836 v2 (il turno segue il possesso della simulazione) — 09/09 notte

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 73 / **38** | 64 / 46 | 52 / 50 | 80 / 33 |
| scene dell'eroe | 19', 32' | 10', 31' | 30', 60', 69', 86' | 10', 29' |
| finale | **1-0** | 2-0 | 2-1 | 4-0 |

Vairo in casa, per la prima volta in quattro playtest: **tre occasioni nostre** (13'-18', 26'-31',
57'-62': bordata da fuori, destro dal limite, destro dal limite), due corner nostri, il gol
dell'eroe al 32' subito dopo il corner del 31'; minuti muti 53 → **38**. Tiri nostri nel diario:
Vairo 0 → 3, Moretti 2, Galli 2, Conti 7.

Misurato sul testo: [AD] 1 · [AE] 2 (Moretti; la v2 del troncamento lascia passare qualcosa) ·
chi conclude è chi segna 5/5 · corner al minuto dopo · portiere/cognomi 0 errori.

Nuova: **AF** — Vairo 45'-47' *«Corner avversario spazzato di testa… Campo aperto, tre contro due…
Cross rasoterra… Uscita bassa del portiere»* dopo il duplice fischio: l'azione della libreria non
si ferma all'intervallo (7.828 fermava solo l'occasione). → 7.837 (sorgente).

## Scorecard n° 12

| # | Area | n°11 | **n°12** |
|---|------|:---:|:---:|
| 1 Realismo | 5 | **6** (in casa la squadra tira; 1-0 con tre occasioni) |
| 2 Credibilità da attaccante | 5 | **5** |
| 3 Causalità | 6 | **6** |
| 4 Varietà | 6 | **6** |
| 5 Ritmo | 4 | **5** (38 / 46 / 50 / 33) |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 5 | **5** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 6 | **6** (AF) |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 5,9** (n° 11: 5,7). Rituali del 7.836 v2 in corso.


---

# Rapporto n° 13 — build 7.837 (09/09 notte)

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 74 / 37 | 63 / 47 | 51 / 51 | 81 / 36 |
| scene dell'eroe | 19,32 | 10,31 | 30,60,69,87 | 10,55,63,82 |
| finale | 1-0 | 2-0 | 2-1 | 4-2 |
| tiri nostri nel diario | 3 | 2 | 2 | 4 |

Misurato sul testo: [AD] 0 · [AE] 3 (Moretti 2, Conti 1) · **AF ancora 1**: Vairo 45'-47' la stessa
azione di libreria dopo il duplice fischio — la 7.837 troncava al fischio, ma l'azione **nasceva sul
tick stesso del 45'**, dopo il troncamento. → 7.837 v2 (sorgente): la libreria non si apre sul 45'
né durante la ripresa. In casa la squadra continua a tirare (Vairo 3, Moretti 2).

**Media: 5,9** (uguale al n° 12: nessuna area cambia di un punto intero).


---

# Rapporto n° 14 — build 7.838 (strumento: il titolo della scena nel diario) — 09/09 notte

Stesso gioco del 7.836 v2; cambia lo strumento: il diario stampa il titolo e l'introduzione della
scena dell'eroe (quello che il player legge nell'intro, `▶ …`). Serve a rispondere ad AC («il gol
dell'eroe senza un'azione prima»): era in parte un artefatto del diario.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 73 / 38 | 63 / 47 | 54 / 50 | 81 / 33 |
| finale | 1-0 | 2-0 | 3-1 | 4-0 |

## Che cosa legge il player prima di ogni gol dell'eroe (5 gol)

| gol | prima | titolo della scena | giudizio |
|---|---|---|---|
| Vairo 32' | 31' «Calcio d'angolo per Scotti» | «⚽ Portiere fuori posizione! L'area piccola è scoperta.» | ci credo |
| Moretti 31' | 30' «Palla persa alta! De Santis (POL) riparte in campo aperto» | «⚡ Tentativo di tiro» | **no**: loro ripartono e un attimo dopo segno io, con un titolo generico |
| Galli 69' | 65' gol di Spada, poi niente | «↗️ Tentativo di cross» → «Galli segna! 2-1» | **no**: un cross che diventa gol dell'eroe, senza catena |
| Galli 87' | «Cambio di gioco lungo 50 metri!» → chance → «Mischia in area!» | catena a due tempi | ci credo |
| Conti 10' | «Bordata da centrocampo!» → chance → «Mischia in area!» | catena a due tempi | ci credo (il titolo «bordata» promette un tiro e invece è una chance: da vedere) |

AC si ridimensiona: 3 gol su 5 hanno un'azione prima leggibile. Restano due difetti veri: (a) la
scena che si apre sopra un contropiede avversario in corsa (Moretti 30'-31') → 7.839; (b) il
titolo d'intento generico («Tentativo di cross» → gol) che non dice che cosa ha fatto l'eroe: il
diario non registrava la SCELTA del player → strumento (7.838 v2: «▶ scelta: … → esito»).

**P misurato sul n° 14 (rosso della 7.839)**: annunci di contropiede 2 (Moretti 30', Galli 16'),
risoluzioni entro 3' **0/2**; Galli 16' «Colombo riparte» → 21' «Campo aperto per Bianchi» (nome
diverso). **E**: gol di catena dopo respinta 2 (Galli 87', Conti 10'), righe che nominano la respinta 0/2.

**Media: 5,9** (non cambia: stesso gioco del n° 12).


---

# Rapporto n° 15 — build 7.840 (7.839 P + 7.840 E + la scelta nel diario) — 09/09 notte

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 73 / 38 | 59 / 48 | 77 / 38 | 71 / 42 |
| finale | 1-0 | 2-0 | 2-2 | 4-1 |

**E (gol di catena che nomina la respinta)**: 2/2 (Galli 35', Conti 10': «Mischia in area!» → «Secondo
tempo dell'azione: conclusione secca, gol!»); rosso n° 14: 0/2. Conti 77' la catena fallisce e resta
onesta («La conclusione è respinta» → «Mischia» → «miss»).

**P (contropiede)**: annunci 4 (Moretti 30' Luca, 44' Lombardi nostro, 82' Colombo; Galli 16' Colombo).
Riga in volo entro 2': 3/4 col NOME COERENTE (n° 14: Colombo → Bianchi). **Risoluzione: 0/4** — la
causa è nel codice: il fallo tattico chiude il contropiede con p 0,30 al tick (0,7⁹ = 4% arriva in
fondo) e la riga del fischio aspettava il dado con ttl 4 → il contropiede muore muto. → 7.839 v2: il
fischio che spegne una ripartenza annunciata passa dal cancello della palla morta promessa (7.818 v6) e
nomina il corridore.

**AC con la scelta nel diario**: i due «no» del n° 14 ora si leggono: Galli 45' «Tentativo di
inserimento in area» → «scelta: Testa piazzata all'angolo → goal» → «Galli segna!» (ci credo);
Moretti 30' «Luca riparte in campo aperto» → 32' «Campo aperto per Luca» → 40' scena (la 7.839 non
apre la scena sopra il contropiede: la scena slitta di 9').

**Media: 5,9** — nessuna area cambia di un punto intero finché P non chiude (Ritmo/Causalità).


---

# Rapporto n° 16 e n° 17 — 7.839 v2 e v3 (P) — 09/09 notte

**n° 16 (v2: il fallo tattico è la palla morta promessa)**: chiusure ancora **0/4**. Traccia
`ct839` su Galli: il corridore si ferma a x=44 (il blocco non sale oltre, #44) e non arriva mai al
fondo; il contropiede durava **9 minuti** (16' annuncio, 18' volo, 23' secondo volo, 25' chiusura) e
al nono tick la riga di chiusura veniva **sovrascritta dal ponte** verso la scena, che vede
`counterRef` già nullo nello stesso tick («Gli avversari guadagnano metri» al posto della chiusura).

**n° 17 (v3: tre battute, ponte e annuncio non sovrascrivono)**: annunci 7, chiusure entro 3'
**4/7** — Moretti 30' Luca → 32' volo → 33' «sciupa la ripartenza: rimessa dal fondo»; Moretti 82' Luca
→ 83' «Fallo tattico su Luca: la ripartenza muore lì»; Galli 16' Colombo → 18' → 19' «tiro dal
limite, il portiere respinge coi pugni»; Conti nessun contropiede. Aperti: Moretti 46' «Recupero
altissimo» sul tick dell'intervallo; Galli 66' una chiusura nostra subito dopo il gol di Spada senza
annuncio (armata sotto il piano del gol); Galli 71' Luca → 74' «Giro palla» della **catena** al posto
della chiusura (stesso difetto del ponte: `!counterRef` nello stesso tick). → v4: la chiusura resta
viva fino al tick dopo.

Nomi coerenti in tutte le righe di contropiede: 7/7 (rosso n° 14: Colombo → Bianchi).


---

# Rapporto n° 18 e n° 19 — 7.839 v4 e v5 (P) — 09/09 mattina

**n° 18 (v4: la chiusura resta viva fino al tick dopo)**: contropiedi 2, chiusure entro 3' **2/2**
(Moretti 27' volo → 28' «sciupa la ripartenza»; Galli 16' → 18' → 19'). Un annuncio (Moretti 25')
sostituito dalla scheda d'interazione «Gol della squadra: Spada esce dal mucchio…» → v5.

**n° 19 (v5: la scheda non sovrascrive l'annuncio)**: contropiedi 2, chiusure **2/2** con annuncio,
volo e chiusura tutti presenti e con lo stesso nome: Galli 29' «Santoro riparte» → 31' «Ripartenza
fulminea di Santoro» → 32' «Ripartenza di Santoro: tiro dal limite, il portiere respinge coi pugni»;
Conti 44' «Recupero altissimo di Bruno» → 47' «La ripartenza sfuma: Marchetti raddoppia su Bruno».
Somma v3-v5: chiusure **8/11**, nomi coerenti 11/11; rosso 0/2.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti (n° 19) | 74 / 37 | 67 / 42 | 66 / 44 | 79 / 35 |
| finale | 1-0 | 3-0 | 2-1 | 4-0 |

## Scorecard n° 19

| # | Area | n°12 | **n°19** |
|---|------|:---:|:---:|
| 1 Realismo | 6 | **6** |
| 2 Credibilità da attaccante | 5 | **6** (titolo, scelta ed esito si leggono in fila; il gol sulla respinta si dice) |
| 3 Causalità | 6 | **7** (il contropiede annunciato si chiude 8/11; la scena non si apre sopra) |
| 4 Varietà | 6 | **6** |
| 5 Ritmo | 5 | **5** (37 / 42 / 44 / 35) |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 5 | **6** (AC letta: 3/5 → 5/5 con la scelta nel diario) |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 6 | **6** (AF resta) |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 6,2** (n° 12-13: 5,9). Metro 8,0. Aperte: ritmo (35-44 minuti muti), AF, U, S1, S5 seconda
metà, e la scena che segna dal titolo generico («Tentativo di cross» → gol di testa: la scelta lo
spiega, il titolo no).


---

# Rapporto n° 20 — 7.842 (AF: il duplice fischio ferma anche la libreria) — 09/09 mattina

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 72 / 38 | 86 / 30 | 67 / 42 | 73 / 36 |
| finale | 1-0 | 2-0 | 3-2 | 4-0 |

**AF**: azioni di libreria oltre il duplice fischio **0/4** (rosso n° 12-19: 1/4, Vairo 45'-47').
Contropiedi: 4 annunci, chiusure 4/4 (Moretti 25'→28', Galli 16'→19', Galli 42' → fischio, Conti 44'
→ 46'-47').

Due cose nuove attorno al 45': Vairo 45' «De Santis sfiora il pari: Pellegrini salva sulla linea!»
subito **dopo** il duplice fischio (una riga ordinaria del dado nello stesso tick del fischio); Conti
44' «Recupero altissimo di Lombardi» → 45' fischio → 46' «Ripartiamo in verticale: **Lombardi lancia
Lombardi**» → 47' chiusura: il contropiede attraversa l'intervallo e il nome cotto nel testo fa
coincidere {H} e {H2}. → 7.842 v2: il fischio spegne anche il contropiede e mette in pausa il dado per
due tick; il nome del corridore passa dal risolutore dei segnaposto (così {H2} lo esclude).

Media invariata (6,2): AF era un difetto di coerenza in 1 partita su 4, e le due righe nuove attorno al
fischio lo sostituiscono finché la v2 non è misurata.


---

# Rapporto n° 21 — 7.842 v2 — 09/09 mattina

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 72 / 37 | 62 / 45 | 67 / 43 | 77 / 37 |
| finale | 1-0 | 1-0 | 3-2 | 4-0 |

AF **0/4**. Contropiedi: Moretti 30'→33' e Galli 16'→19', 42'→43'→44' chiusi prima del fischio (3/3
con annuncio, volo e chiusura); nessun «Lombardi lancia Lombardi». Restano attorno al fischio: Vairo
la riga ordinaria si è spostata dal 45' al **46'** («Vallone sfiora il pari» sul calcio d'inizio della
ripresa: la pausa di due tick ne copriva uno), e Conti 44' «Recupero altissimo di Bruno» seguito dal
fischio. → v3: pausa di tre tick e nessun contropiede armato al 44'-45'.


---

# Rapporto n° 22 — 7.842 v3 — 09/09 mattina

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti vuoti | 71 / 41 | 62 / 45 | 59 / 45 | 81 / 33 |
| finale | 1-0 | 1-0 | 2-1 | 4-0 |

**AF 0/4** (rosso 1/4). Attorno al 45' tutto fermo: Vairo riparte al 47' con l'uscita dal basso
del portiere («Fontana rifiuta il rilancio lungo e apre corto»), Galli 46' il discorso del mister,
Moretti e Conti il fischio e basta. Contropiedi 2/2 chiusi (Moretti 30'→33', Galli 16'→19'), nessuno
armato al 44'. Residuo dichiarato: Conti 44' «Ferrari lascia partire il destro!» e al 45' il fischio —
l'occasione armata al 40' arriva al tiro sul minuto del fischio e resta senza esito (1 caso).

## Scorecard n° 22

| # | Area | n°19 | **n°22** |
|---|------|:---:|:---:|
| 1 Realismo | 6 | **6** |
| 2 Credibilità da attaccante | 6 | **6** |
| 3 Causalità | 7 | **7** |
| 4 Varietà | 6 | **6** |
| 5 Ritmo | 5 | **5** (41 / 45 / 45 / 33) |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 6 | **6** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 6 | **7** (AF 0/4; il fischio ferma libreria, contropiede e dado) |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 6,3** (n° 19: 6,2). Metro 8,0. La prossima area è il **Ritmo** (5): 33-45 minuti senza
niente nel diario, con le pause lunghe nei primi minuti e dopo i gol del microsim.


---

# Rapporto n° 23 — 7.843 v4 (la palla morta dura quanto dura) — 09/09 mattina

Strumento 7.843: ogni minuto muto del diario è classificato da quello che c'era sullo schermo.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti muti (n° 22) | 71 / 41 | 62 / 45 | 59 / 45 | 81 / 33 |
| righe / minuti muti (**n° 23**) | 83 / **34** | 76 / **31** | 85 / **28** | 91 / **31** |
| di cui palla morta | 4 | 7 | 6 | 5 |
| di cui pausa di lettura dopo una riga | 18 | 15 | 9 | 7 |
| di cui ripresa dopo un gol / calcio d'inizio | 2 | 8 | 10 | 19 |
| di cui fermo | 10 | 0 | 3 | 0 |
| vuoto vero | 0 | 1 | 0 | 0 |
| finale | 0-0 | 1-0 | 2-1 | 4-2 |

Palla morta: da 24 minuti (Moretti, n° 22) a 4-7. Le righe lette salgono (71-91 contro 59-81). Quello
che resta muto è **per progetto**: la pausa di lettura dopo ogni riga (2-5 tick, 7 dopo un gol o una
scheda: una riga ogni ~3,5 s nelle fasi quiete) e la ripresa dopo ogni gol (3 tick; Conti con sei gol
ne ha 19). «Fermo» 10 a Vairo: il gioco fermo senza palla morta (piazzato o scena), da guardare.
Il seme cambia le partite (Vairo 0-0, Conti 4-2): non è la 7.843, è il mondo che diverge.

## Scorecard n° 23

| # | Area | n°22 | **n°23** |
|---|------|:---:|:---:|
| 1 Realismo | 6 | **6** |
| 2 Credibilità da attaccante | 6 | **6** |
| 3 Causalità | 7 | **7** |
| 4 Varietà | 6 | **6** |
| 5 Ritmo | 5 | **6** (34 / 31 / 28 / 31; palla morta 4-7; nessun fallo ogni 4') |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 6 | **6** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 7 | **7** |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 6,3** (n° 22: 6,3; scritto 6,4 per un errore di arrotondamento, la somma dei dodici voti fa 76). Metro 8,0.


---

# Rapporto n° 24 — 7.845 (piazzato e calcio d'inizio non aspettano il dado) + 7.844 (prima scena) — 09/09

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti muti (n° 23) | 83 / 34 | 76 / 31 | 85 / 28 | 91 / 31 |
| righe / minuti muti (**n° 24**) | 113 / **14** | 79 / 30 | 81 / 30 | 84 / 31 |
| di cui palla morta | 5 | 8 | 9 | 5 |
| di cui pausa di lettura | 8 | 17 | 15 | 13 |
| di cui ripresa / calcio d'inizio | 1 | 5 | 6 | 13 |
| di cui fermo | **0** (era 10) | 0 | 0 | 0 |
| prima scena dell'eroe | 14' | 13' | 25' | 13' |
| finale | 0-0 | 1-0 | 2-1 | 3-2 |

**7.845**: il «fermo» senza palla morta sparisce (Vairo 10 → 0; la punizione del 47' che aspettava sei
minuti ora si batte al minuto dopo). Vairo passa a 14 minuti muti e 113 righe (22 sono del secondo
commentatore, nessuna ripetizione anomala). **7.844**: prima scena 13/13/13/13 → **14/13/25/13**: due
partite restano al 13' — l'offset seminato vale 0 per due semi su quattro. Non chiuso: si misura ancora.


---

# Rapporto n° 25 — 7.845 v2 (7.844 v2: finestra della prima scena seminata 0-9') — 09/09

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti muti | 110 / 14 | 92 / 28 | 93 / 32 | 89 / 33 |
| prima scena dell'eroe | 21' | 24' | 21' | 13' |
| finale | 2-0 | 1-0 | 4-2 | 4-2 |

**7.844 v2**: prima scena 13/13/13/13 (n° 23) → 14/13/25/13 (v1) → **21/24/21/13**: non è più un
copione, ma due partite cadono allo stesso minuto e Conti resta al 13'. La finestra seminata sposta
l'apertura, il picco dell'andamento decide il minuto: si dichiara parziale e si misura ancora.

**Nuova, dallo strumento schermo**: Moretti 36'-44', **nove minuti senza una riga** con la libreria
«in recita». L'azione si era aperta a ridosso della scena del 32'; il cambio di fase ha cancellato i
suoi timer, l'indice non è mai avanzato e la regola (a) del 7.833 ha taciuto il tick fino al duplice
fischio. → **7.846**: oltre 9 s reali l'azione è morta e lascia il microfono (un'azione vive 1,3 s ×
5 righe). Galli: «vuoto» 3 minuti, da guardare.

## Scorecard n° 25

| # | Area | n°23 | **n°25** |
|---|------|:---:|:---:|
| 1 Realismo | 6 | **6** |
| 2 Credibilità da attaccante | 6 | **6** |
| 3 Causalità | 7 | **7** |
| 4 Varietà | 6 | **6** |
| 5 Ritmo | 6 | **6** (14 / 28 / 32 / 33; ma nove minuti muti a Moretti 36'-44' → 7.846) |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 6 | **6** (prima scena 21/24/21/13) |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 7 | **7** |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 6,3.** Metro 8,0.


---

# Rapporto n° 26 — 7.846 (l'azione della libreria senza timer lascia il microfono) — 09/09

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| righe / minuti muti (n° 25) | 110 / 14 | 92 / 28 | 93 / 32 | 89 / 33 |
| righe / minuti muti (**n° 26**) | 88 / 27 | 112 / **16** | 92 / 27 | 93 / 26 |
| silenzio più lungo | 6' | 4' (era **9'**) | 5' | 6' |
| minuti con la libreria «in recita» e muta | 0 | 0 (era 7) | 0 | 0 |
| prima scena dell'eroe | 21' | 24' | 25' | 14' |
| finale | 1-0 | 2-0 | 2-1 | 4-0 |

**7.846**: i nove minuti muti di Moretti (36'-44', libreria senza timer) spariscono: silenzio più
lungo 4', nessun minuto «libreria» muto nelle quattro partite. Career PASS; CI in corso.
**7.844 v2**: prima scena **21/24/25/14**, quattro minuti diversi (n° 23: 13/13/13/13). Il mondo
diverge (Vairo 1-0 con la scena del 59', Moretti 112 righe): non è la 7.846, è il seme.


---

# Rapporto n° 27 — build 7.846, rosso di S5 (la zona di tiro) — 09/09 pomeriggio

Misura nuova nel diario: da dove partono i tiri di piano (avanzamento del tiratore alla battuta) e
quanto dista il nominato dal punto d'arrivo dell'apertura (la battuta prima del tiro).

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano | 5 | 4 | 3 | 1 |
| da dentro l'area (≥ 82) | 2 | 1 | 0 | 0 |
| dal limite (70-82) | 1 | 1 | 0 | 1 |
| da fuori (< 70) | 2 | 2 | 3 | 0 |
| minuti muti | 24 | 25 | 35 | 34 |
| finale | 2-0 | 1-0 | 3-1 | 3-2 |

**Da dentro l'area 3/13 (23 %)**, roadmap S5: ≥ 50 %. Il testo è onesto (la zona segue dove sta il
ricevente), il campo no: il più avanzato sta ad avanzamento 56-70 e il punto d'arrivo gli sta 4-8
passi davanti. La salita del blocco è stata provata due volte e revocata (7.793, 7.797). → 7.847: il
filtrante in area, una volta su due quando il ricevente sta oltre 64; la battuta del tiro aspetta
che il tiratore sia sul pallone (≤ 5u, fino a tre tick). Rosso `__CPM_NO847`.


---

# Rapporto n° 28 — 7.847 (il filtrante in area) — 09/09 pomeriggio

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano | 3 | 4 | 4 | 1 |
| da dentro l'area (≥ 82) | 2 | 1 | 0 | 0 |
| filtranti in area | 2 (9', 36') | 1 (9') | 0 | 0 |
| tiratore sul pallone alla battuta (≤ 5u) | **0/3** (15,2 · 14,9 · 15,0) | **0/4** (11,9 · 14,7 · 26,3 · 16,7) | **0/4** (13,5 · 15,8 · 10,5 · 22,1) | **0/1** (19,2) |
| minuti muti | 34 | 29 | 34 | 34 |
| finale | 1-0 | 2-0 | 3-1 | 3-2 |

Da dentro l'area **3/12** (rosso 3/13): il filtrante esce (3 volte, testo e zona giusti) ma non
sposta il conto, perché scatta solo con un ricevente oltre avanzamento 64, e Galli e Conti non ce
l'hanno mai. La misura nuova dice di più: **alla battuta del tiro il tiratore non è mai sul pallone**
(0/12, distanza 10-26u), filtrante o no, e i tre tick d'attesa non lo avvicinano. È la stessa cosa che
il 7.797 aveva trovato («l'uomo non si era mosso»): non è il piano, è il sistema di movimento che non
porta il nominato sul pallone. Prima di un'altra versione, si legge la traccia dell'attesa
(`__CPM_ATT847`: la distanza tick per tick).


---

# Rapporto n° 29 — 7.848 v5 (il nominato dal piano corre sul punto d'arrivo) — 09/09 pomeriggio

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano | 4 | 5 | 4 | 1 |
| da dentro l'area (≥ 82) | 1 | 1 | 0 | 0 |
| tiratore sul pallone alla battuta (≤ 5u) | 2/4 (2,4 · 6,7 · 3,3 · 7,6) | 2/5 (9,5 · 8,2 · 2,7 · 4,2 · 19,2) | 2/4 (24,8 · 0,3 · 5,8 · 3,8) | 0/1 (18,6) |
| minuti muti | 28 | 30 | 31 | 35 |
| finale | 0-0 | 2-0 | 3-1 | 4-2 |

Tiratore sul pallone **6/14** (rosso n° 28: 0/12), entro 8u 10/14. Cause lette con la traccia, in
ordine: (1) il portatore dal piano si perdeva nell'elezione per vicinanza a ogni tick → letto dal
piano; (2) il blocco del movimento gira un tick su tre → a ogni tick sotto custodia; (3) le corsie
(`velRef`) tiravano il nominato a y=5 mentre il pallone andava a y=20 → le corsie cedono il nominato;
(4) l'attesa misurava la distanza dal pallone in volo → uomo e pallone sul punto d'arrivo. Restano i
tiri senza attesa (solo il filtrante la aveva) a 19-25u e l'area 2/14: → v6, ogni tiro aspetta,
filtrante da avanzamento 58.


---

# Rapporto n° 30 — 7.848 v6 (ogni tiro aspetta uomo e pallone sul punto; filtrante da 58) — 09/09

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano | 4 | 4 | 1 | 3 |
| da dentro l'area (≥ 82) | 2 | 3 | 0 | 1 |
| tiratore sul pallone (≤ 5u) | 3/4 (4,6 · 8,6 · 2,0 · 4,5) | 2/4 (1,2 · 6,0 · 4,7 · 11,0) | 0/1 (16,3) | 1/3 (13,9 · 8,2 · 2,0) |
| minuti muti | 33 | 28 | 43 | 29 |
| finale | 0-0 | 1-0 | 2-1 | 4-0 |

Da dentro l'area **6/12 = 50 %** (rosso n° 27: 3/13 = 23 %; roadmap S5: ≥ 50 %). Tiratore sul pallone
**6/12 ≤ 5u, 9/12 ≤ 9u** (rosso: 0/12, 10-26u). Restano tre tiri con il tiratore a 11-16u: l'attesa
scade dopo tre tick e il pallone non è ancora arrivato sul punto. Galli: un solo tiro di piano e 43
minuti muti (il seme cambia le partite: 4-0 di Conti, 0-0 di Vairo). Rituali in corso.

## Scorecard n° 30

| # | Area | n°25 | **n°30** |
|---|------|:---:|:---:|
| 1 Realismo | 6 | **7** (tiri da dentro l'area 6/12; tiratore sul pallone 6/12, entro 9u 9/12) |
| 2 Credibilità da attaccante | 6 | **6** |
| 3 Causalità | 7 | **7** |
| 4 Varietà | 6 | **6** (Galli: un solo tiro di piano) |
| 5 Ritmo | 6 | **6** (33 / 28 / 43 / 29) |
| 6 Azioni extra-eroe | 7 | **7** |
| 7 Highlight dell'eroe | 6 | **6** |
| 8 Telecronaca | 6 | **6** |
| 9 Interazioni | 7 | **7** |
| 10 Coerenza fra i sistemi | 7 | **7** |
| 11 Immersione | 6 | **6** |
| 12 Carriera | 6 | **6** |

**Media: 6,4** (somma 77). Metro 8,0.


---

# Rapporto n° 31 — 7.849 (S3 v2: l'atteggiamento governa la frequenza delle occasioni) — 09/09 sera

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano / da dentro l'area | 4 / 3 | 5 / 1 | 1 / 0 | 3 / 0 |
| tiratore sul pallone (≤ 5u) | 3/4 | 2/5 | 0/1 | 1/3 |
| tiri dal 75' (nostri · loro) | 1 · 0 | 0 · 1 | 0 · 0 | 1 · 0 |
| minuti muti | 32 | 33 | 43 | 32 |
| finale | 0-0 | 1-1 | 1-1 | 4-0 |

Tiri dal 75': da 0 in tre partite su quattro (n° 30) a 3 in totale. La misura «il lato sotto tira più
del lato sopra negli ultimi 15'» non è giudicabile: 0-0, 1-1, 1-1 e nessuno sotto. **Parziale, non
revocata**: prima di una v2 serve il censimento delle finestre libere dal 75' (quante e cosa le occupa).

## Scorecard n° 31

Uguale al n° 30 in tutte le aree: **media 6,4** (somma 77).


---

# Playtest DA TELEFONO n° 1 — 7.849 — 09/09 notte (direttiva PO 09/09 sera: «come se lo facesse da telefono e con grande sguardo critico»)

Strumento: `tests/visual/collaudo-telefono.mjs` v2 (Chromium 412×915 portrait, DPR 2, campo 3D acceso,
tick reale; cattura continua via CDP screencast, età del fotogramma salvato mediana 0,2-0,6 s, max 1,1 s).
Quattro partite col seme 4242: Vairo e Moretti in casa, Galli e Conti fuori. I fotogrammi citati stanno in
`docs/collaudo-telefono/n01/` (nome = partita, fotogramma, minuto DELLO SCHERMO, cosa mostra); le quattro
schede complete nella stessa cartella. **Dichiarato:** è Chromium con GL software, non l'Android del PO:
i fotogrammi al secondo (17-22) e i salti possono essere diversi sul telefono vero. Il diario del testo
(playtest n° 31, 6,4) resta di appoggio: questa scheda giudica quello che lo schermo MOSTRA.

## Le misure del campo (le stesse con e senza foto: Vairo senza foto 9 % / 11,1u / 54 salti)

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori | banda |
|---|---|---|---|---|---|
| pallone reso ai piedi del padrone della simulazione (≤ 3u) | 15 % | 17 % | 7 % | 6 % | ≥ 60 % |
| …a palla a terra (arco spento) | 20 % | 19 % | 10 % | 8 % | ≥ 75 % |
| distanza reso↔padrone, mediana / p90 (u) | 14,9 / 33,1 | 11,1 / 24,4 | 10,8 / 19,0 | 10,3 / 27,4 | mediana ≤ 3 |
| scarto pallone reso↔logico, mediana / p90 (u) | 2,6 / 17,1 | 1,4 / 14,6 | 2,0 / 13,5 | 1,2 / 12,3 | p90 ≤ 8 |
| salti del pallone (> 8u in ≤ 110 ms) | 51 | 52 | 49 | 49 | 0 fuori dagli stacchi |
| tagli di camera | 6 | 6 | 6 | 12 | informativo |
| fotogrammi al secondo senza sonda | 20 | 20 | 22 | 17 | ≥ 30 |
| minuti: gioco · palla morta · ripresa · fermo | 62 · 19 · 3 · 1 | 57 · 20 · 8 · 0 | 58 · 12 · 13 · 1 | 58 · 8 · 18 · 1 | morta+fermo ≤ 15 |
| righe di cronaca | 77 | 83 | 75 | 90 | 70-110 |
| finale | 2-0 | 1-0 | 2-1 | 4-0 | |

Chi scrive il pallone quando è a terra e lontano dal padrone della simulazione: `portatore` 125-243
campioni a partita, `nessuno` 137-218. Cioè: il renderer ha incollato il pallone a un portatore SUO
(`_por526`) che non è quello di `carrierRef` — la stessa causa scritta nel verbale della 7.813 v1
revocata («il renderer deve PORTARE il pallone ai piedi del portatore logico, non solo sapere chi è»).
Il pallone reso segue il pallone logico (scarto mediano 1,2-2,6u): è il pallone LOGICO a stare a
10-15u da chi la simulazione dice che ce l'ha, e a saltare una volta ogni 3 secondi.

## Quello che i fotogrammi mostrano (e non mostrano)

**Gol.** Dieci gol in quattro partite, nove fotografati (il gol di Vallone per il POL a Galli 57' è sfuggito al filtro della sonda v2, corretto: non giudicato); **sette su nove non sono sul campo** nel fotogramma della riga:
- Vairo 27' «Colombo segna su assist di Vairo» dopo «Dribbling portiere e appoggia»: centrocampo, tre
  giocatori, pallone al cerchio (vairo-f13). La scena si era APERTA su un campo vuoto, senza un giocatore
  né il pallone (vairo-f10).
- Moretti 54' «Neri segna! Squadra in vantaggio!»: quattro avversari che camminano su una metà campo
  vuota, nessun rossoblù, nessun pallone, camera «Trequarti» (moretti-f26).
- Galli 38' «Ferrari segna su assist di Galli» con «Parabola d'esterno 40 m»: centrocampo, pallone
  invisibile (galli-f13). Galli 65' «Spada segna!»: campo VUOTO, solo un segnalino (galli-f22).
- Conti 24' «Ferrari segna! Raddoppio»: arco dell'area, nessun pallone, nessuno che salta (conti-f14);
  54' «Lombardi segna! 3-0»: centrocampo, giocatori che camminano (conti-f24); 75' «Bruno segna! 4-0»
  con «Cross teso di Lombardi: Bruno stacca sul secondo palo»: pallone A TERRA sull'arco dell'area, porta
  fuori quadro (conti-f32).
- Mostrati: Vairo 41' (area inquadrata, mischia; pallone difficile da vedere, vairo-f22) e Conti 15'
  (porta inquadrata, tre difensori sul secondo palo, **portiere assente**, conti-f08).
La camera sta nella zona dell'eroe (etichetta «Trequarti» / «Bordo area» / «Centrocampo» in basso a
destra) e il gol del compagno accade fuori quadro. Con la scena dell'eroe la porta si vede; con
l'occasione extra-eroe no, 0/5.

**Tiri «da due passi, tutto solo davanti alla porta!»** — 3 su 3 controllati mostrano il pallone lontano
da tutti e la porta fuori quadro: Vairo 10' (pallone al fondo fra quattro giocatori, camera a 40 m,
vairo-f02), Vairo 37' (pallone sulla linea laterale, un giocatore solo in primo piano, vairo-f16), Galli
12' (pallone da solo a metà area, quattro avversari e nessun compagno, galli-f03). Vairo 41' «mischia in
area»: pallone FUORI area a 10-15u dal gruppo di otto nell'area piccola (vairo-f19).

**Scene dell'eroe.** Credibile: Moretti 39' «Acrobazia istintiva in porta» — eroe sul pallone, difensore
in scivolata, portiere sulla linea, porta in quadro (moretti-f20). Non credibili: Moretti 28'
«Conclusione murata … murato dalla difesa» con un solo giocatore in quadro e nessun difensore
(moretti-f13); Vairo 27' «Dribbling portiere» risolto a centrocampo (vairo-f12/f13); Vairo 27' scena aperta
su un campo vuoto (vairo-f10). Su sei scene guardate, una convince.

**Campo vuoto.** Vairo 27' (vairo-f10), Galli 49' «Rimessa dal centro per loro» col cerchio vuoto
(galli-f17), Galli 64' (galli-f22). Lo stato «ripresa» (calcio d'inizio dopo un gol) dura 13' a Galli e
18' a Conti: dopo ogni gol la partita resta in calcio d'inizio per minuti.

**Telecronaca sullo schermo.** Il riquadro della battuta resta per 2-3 minuti mentre il campo va avanti
(Vairo 37'-38' f15-f17 «Filtrante di Pecoraro…», 80'-81' f32-f34 «Pecoraro verticalizza per Ferrari…»;
Moretti 35'-37' f15-f17 Cascioli «Qui la differenza la fa il tempo dell'inserimento» tre volte). Frasi
ripetute nella stessa partita: «da due passi, tutto solo davanti alla porta!» 3× (Vairo 10', 37', 60'),
«Traversone dalla bandierina: mischia in area!» 3× (Vairo 41', 64', 84'), «Toti respinge coi pugni, poi la
difesa spazza in angolo» 3×. Galli: «Spada (POL)» al 50' e «Spada (GRA)» al 63' — lo stesso cognome nelle
due squadre.

**Cosa regge.** Le interazioni: leggibili, coerenti col tabellone, una alla volta (Vairo 43' il mister
dopo il gol, 68' il cambio, 86' «gioco ruvido»; Conti 41' «Intesa a memoria»). Il tabellone: «Squadra in
vantaggio» a 0-0→1-0 e 1-1→2-1, «Raddoppio», «Partita in mano: 3-0» tutti giusti; cercata una frase
contro il punteggio, non trovata. La barra della carriera in basso (gol, assist, energia, voto 5,8→6,8 e
5,8→7,1) aggiornata e leggibile; i nomi dei club nell'HUD sono troncati («Selezione …», «Polisporti…»).

## Scorecard DA TELEFONO n° 1

| # | Area | n°31 (diario) | **telefono n°1** | fotogramma / minuto che motiva il voto (< 7) · cosa si è cercato (≥ 7) |
|---|------|:---:|:---:|---|
| 1 Realismo | 7 | **4** | pallone ai piedi del padrone 6-17 % (banda 60), 49-52 salti a partita; moretti-f26 54', galli-f22 64' |
| 2 Credibilità da attaccante | 6 | **4** | 7 gol su 9 fotografati fuori quadro; «da due passi» 3/3 con la porta fuori quadro (vairo-f02, vairo-f16, galli-f03) |
| 3 Causalità | 7 | **6** | la catena c'è nel riquadro (battuta → tiro → portiere), ma il campo non la porta: conti-f32 73' pallone a terra su «cross teso» |
| 4 Varietà | 6 | **5** | tre «da due passi» e tre «mischia in area» nella stessa partita (Vairo) |
| 5 Ritmo | 6 | **5** | palla morta 19-20' in casa (banda 15); «ripresa» 13' Galli, 18' Conti; campo vuoto galli-f17 49' |
| 6 Azioni extra-eroe | 7 | **5** | esistono nel testo (5 gol dei compagni) e 0/5 sul campo (moretti-f26, conti-f14/f24/f32, galli-f22) |
| 7 Highlight dell'eroe | 6 | **5** | 1 scena credibile su 6 (moretti-f20 sì; moretti-f13, vairo-f10, vairo-f13 no) |
| 8 Telecronaca | 6 | **5** | riquadro fermo 2-3' (vairo f15-f17, f32-f34); «Spada» in entrambe le squadre (Galli 50'/63') |
| 9 Interazioni | 7 | **7** | cercata una scelta illeggibile o contro il punteggio in 6 interazioni: nessuna |
| 10 Coerenza fra i sistemi | 7 | **7** | cercata una frase contro il tabellone in 10 gol e 4 finali: nessuna |
| 11 Immersione | 6 | **5** | 17-22 fps senza sonda (banda 30, Chromium GL software), un salto del pallone ogni 3 s, schermo nero al 45' (vairo-f23) |
| 12 Carriera | 6 | **6** | barra in basso viva e giusta; nomi dei club troncati nell'HUD a 412 px |

**Media DA TELEFONO: 5,3** (somma 64). Metro 8,0, nessuna area sotto 7: **nove aree sotto 7**.
Il diario diceva 6,4: la differenza (1,1) è il campo, che il diario non guardava. **Nessun «puoi
collaudare».**

## Bugie P1 (lo schermo smentisce il testo)

1. **Il gol del compagno non è sul campo** (7 su 9 fotografati): la camera resta nella zona dell'eroe.
2. **«Da due passi, tutto solo davanti alla porta» col pallone lontano da tutti e la porta fuori quadro** (3/3).
3. **Scena dell'eroe risolta in un altro posto** (Vairo 27' a centrocampo; Moretti 28' senza difensori).
4. **Campo vuoto** in tre fotogrammi (Vairo 27', Galli 49', Galli 64').

## Cosa dice questa scheda sulla strada

Le S1-S5 della roadmap erano giuste, ma il metro del diario ha promosso S5 («tiratore sul pallone 6/12»)
guardando le coordinate logiche: sullo schermo il pallone reso sta a 10-15u dal portatore della
simulazione per metà del tempo, e la porta non è in quadro quando succede la cosa che il testo racconta.
Le due cause strutturali che i fotogrammi mostrano: (a) **due portatori** — il renderer incolla il
pallone a `_por526`, la simulazione lo dà a `carrierRef` (S1+S2, verbale 7.813); (b) **la camera non va
dove va la palla** quando l'azione non è dell'eroe (regia). Nessuna delle due si cura con una frase o un
cancello. Prossima misura: la stessa sonda, stesse quattro partite, «gol sul campo» ≥ 8/9 e «pallone ai
piedi del padrone» ≥ 60 %.


---

# Rapporto n° 32 — 7.852 (diario di appoggio, 09/09 tarda sera)

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori |
|---|---|---|---|---|
| tiri di piano / da dentro l'area | 2 / 1 | 5 / 2 | 3 / 2 | 3 / 2 |
| tiratore sul pallone (≤ 5u) | 1/2 [15,7] | 4/5 | 2/3 [14,2] | 2/3 [8,7] |
| tiri dal 75' (nostri · loro) | 1 · 1 | 0 · 0 | 0 · 1 | 0 · 1 |
| minuti muti | 37 (pausa-dado 30) | 28 | 32 | 28 |
| finale | 0-0 | 2-0 | 3-1 | 4-0 |

Tiratore sul pallone **9/13** (n° 30: 6/12), da dentro l'area **7/13** (6/12). Restano due tiri con
il tiratore a 14-16u: l'attesa 847 scade dopo tre tick col pallone non arrivato (Conti 21'
«Incornata di Ferrari» col pallone a centrocampo, letto anche sul telefono). Vairo: 30 minuti di
«pausa-dado» su 37 muti. Il voto resta quello del telefono (n°1 5,3; n°2 da fare sui fotogrammi
della 7.852, con la seconda foto a +1,2 s sui gol).


---

# Playtest DA TELEFONO n° 2 — 7.852 — 09/09 notte

Sonda v3 (screencast, età per fotogramma, seconda foto a +1,2 s sui gol). Fotogrammi citati in
`docs/collaudo-telefono/n02/`. Dichiarato: Chromium a 412×915 con GL software (13-16 fps), non
l'Android del PO.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori | banda |
|---|---|---|---|---|---|
| pallone reso ai piedi del padrone (≤ 3u) | 33 % | 31 % | 34 % | 31 % | ≥ 60 % |
| campioni con un padrone dichiarato | 45 % | 39 % | 21 % | 40 % | informativo |
| salti > 8u | 46 | 59 | 47 | 48 | 0 |
| minuti: palla morta · ripresa | 17 · 3 | 15 · 7 | 14 · 12 | 10 · 13 | ≤ 15 |
| finale | 0-0 | 3-0 | 2-1 | 4-0 | |

**I gol, a +1,2 s dalla riga (la novità della 7.852).** Conti 23' Ferrari: porta in quadro, pallone
sul palo, portiere a terra dopo il tuffo, due difensori (conti-f12) — **ci credo**. Galli 68'
Pecoraro: pallone dentro la porta in alto a sinistra, portiere a terra (galli-f29) — **ci credo**.
Conti 55' Lombardi: pallone oltre la linea, tre difensori dietro, **portiere assente** (conti-f26).
Moretti 55' Neri: pallone sul palo, portiere in piedi a 8u che guarda (moretti-f28). Conti 75'
Bruno: ancora il cross, pallone sulla fascia, porta fuori quadro (conti-f32): è l'attesa 847
scaduta col pallone non arrivato (Conti 21' «Incornata» col pallone a centrocampo, come nel diario
n° 32). Su 5 gol del microsim: 2 credibili, 2 a metà (rete sì, portiere no), 1 no. Nel n° 1 erano
0 su 5.

**«Da due passi, tutto solo davanti alla porta!»** ancora falso 3/3: Conti 43' (conti-f20) tre uomini
attorno al pallone sul bordo dell'area e porta fuori quadro; Galli 33' (galli-f10) idem; Vairo 10'.
Il tiratore adesso è SUL pallone (7.850), ma il testo dice una cosa che la geometria smentisce.

**Campo.** I corpi stanno attorno al pallone (7.850): niente più campo vuoto alla riga del gol
(nel n° 1: Vairo 27', Galli 49' e 64'). Il pallone ai piedi del padrone resta a un terzo (banda 60).
La riga «⚽ Palla al centro e arbitro pronto» è entrata nel filtro dei gol della sonda (Vairo 48'):
difetto dello strumento, non del gioco.

## Scorecard DA TELEFONO n° 2

| # | Area | n°1 | **n°2** | motivo (< 7) · cosa si è cercato (≥ 7) |
|---|------|:---:|:---:|---|
| 1 Realismo | 4 | **5** | padrone 31-34 % (banda 60), 46-59 salti; i corpi ora stanno attorno al pallone |
| 2 Credibilità da attaccante | 4 | **5** | gol credibili 2/5, a metà 2/5 (portiere assente o fermo), 1 no; «da due passi» falso 3/3 |
| 3 Causalità | 6 | **6** | il piano finisce in rete (conti-f12, galli-f29); l'incornata con l'attesa scaduta no (conti-f32) |
| 4 Varietà | 5 | **5** | «da due passi» al 10'-11' in 4 partite su 4, stessa frase |
| 5 Ritmo | 5 | **5** | ripresa 12-13' fuori casa; palla morta 17' Vairo; pausa-dado 30' (diario) |
| 6 Azioni extra-eroe | 5 | **6** | 4 gol su 5 con il tiro che entra a +1,2 s; il portiere c'è in 2 su 5 |
| 7 Highlight dell'eroe | 5 | **5** | non rigiudicato: stesse scene del n° 1 (una credibile su sei) |
| 8 Telecronaca | 5 | **5** | «tutto solo davanti alla porta» con tre uomini attorno |
| 9 Interazioni | 7 | **7** | cercata una scelta contro il punteggio: nessuna |
| 10 Coerenza fra i sistemi | 7 | **7** | cercata una frase contro il tabellone in 10 gol: nessuna |
| 11 Immersione | 5 | **5** | 13-16 fps sul banco, un salto ogni 3 s |
| 12 Carriera | 6 | **6** | barra viva; nomi dei club troncati |

**Media DA TELEFONO: 5,6** (somma 67; n° 1: 5,3). Metro 8,0, nessuna area sotto 7: **nove aree
sotto 7**. Nessun «puoi collaudare». Prossimi, in ordine: il portiere sul gol (assente o fermo in
2 su 5); l'attesa 847 scaduta (l'incornata parte col pallone a centrocampo); il testo «tutto solo /
da due passi» che deve leggere la geometria; la banda 60 del padrone.


---

# Playtest DA TELEFONO n° 3 — 7.853 v3 — 10/09 notte

Sonda v3. Fotogrammi in `docs/collaudo-telefono/n03/`. Dichiarato: Chromium 412×915, GL software.

| | Vairo casa | Moretti casa | Galli fuori | Conti fuori | banda |
|---|---|---|---|---|---|
| pallone ai piedi del padrone (≤ 3u) | 32 % | 29 % | 11 % | 20 % | ≥ 60 % |
| salti > 8u | 43 | 58 | 56 | 47 | 0 |
| finale | 0-0 | 3-0 | 2-2 | 4-0 | |

**I gol a +1,2 s.** Il portiere è in quadro, sulla linea, in 3 gol su 4 (Conti 55' conti-f25,
Conti 75' conti-f35, Moretti 55' moretti-f28) — nel n° 2 era assente o a 10u in 3 su 5 — ma in
tutti e tre è **in piedi** e il pallone gli passa accanto: il tuffo parte al tiro e finisce prima
che il pallone arrivi. Conti 23' (conti-f12): a +1,2 s il pallone è ancora fuori dall'area, porta
fuori quadro (incornata con l'attesa scaduta). Credibili: 0 su 4 pieni, 3 a metà, 1 no. Nel n° 2:
2 pieni, 2 a metà, 1 no. Il portiere in quadro è un passo avanti; il portiere fermo è il prossimo.

**Testo contro geometria**, ancora: «Scotti da due passi, tutto solo davanti alla porta» con quattro
uomini attorno e porta fuori quadro (Vairo 57', vairo-f21); «Ferrari a tu per tu col portiere» con
tre difensori a 2u e il portiere fuori quadro (Conti 66', conti-f28).

## Scorecard DA TELEFONO n° 3

| # | Area | n°2 | **n°3** | motivo |
|---|------|:---:|:---:|---|
| 1 Realismo | 5 | **5** | padrone 11-32 %, salti 43-58 |
| 2 Credibilità da attaccante | 5 | **5** | gol: 3 a metà (portiere in quadro ma fermo), 1 no; testo falso 2/2 |
| 3 Causalità | 6 | **6** | il piano finisce in rete; l'incornata con l'attesa scaduta no |
| 4 Varietà | 5 | **5** | «da due passi» al 10'-11' in 4 partite su 4 |
| 5 Ritmo | 5 | **5** | ripresa 14' a Conti; palla morta 8-17 |
| 6 Azioni extra-eroe | 6 | **6** | il tiro entra, il portiere c'è (fermo) |
| 7 Highlight dell'eroe | 5 | **5** | non rigiudicato |
| 8 Telecronaca | 5 | **5** | «tutto solo», «a tu per tu» smentiti dal campo |
| 9 Interazioni | 7 | **7** | nessuna contro il punteggio |
| 10 Coerenza fra i sistemi | 7 | **7** | nessuna frase contro il tabellone |
| 11 Immersione | 5 | **5** | 13-16 fps, un salto ogni 3 s |
| 12 Carriera | 6 | **6** | barra viva |

**Media DA TELEFONO: 5,6** (somma 67, come il n° 2). Nove aree sotto 7. Nessun «puoi collaudare».
Prossimi: 7.854 il tuffo che arriva sul pallone (tempo di reazione, non al tiro); l'attesa 847
scaduta; il testo che legge la geometria («tutto solo» solo se nessun avversario entro 4u).

## Scorecard DA TELEFONO n° 4 — build 7.854 (branch)

Chromium 412×915 portrait, campo 3D acceso, tick reale, seme 4242, screencast CDP (età mediana del
fotogramma 188 / 456 / 231 / 429 ms, max 1,0-1,6 s — dichiarato: ogni foto è al più un secondo
indietro). NON è l'Android del PO. Schede e fotogrammi citati in `docs/collaudo-telefono/n04/`.

Le misure del campo (le stesse del n° 3, stessa sonda v4):

| partita | padrone ≤3u | a terra | mediana / p90 | salti | fps | stati (min) | finale |
|---|:---:|:---:|:---:|:---:|:---:|---|:---:|
| Vairo casa | 16 % | 25 % | 10,0 / 24,8 | 56 | 15 | gioco 68 · morta 14 · ripresa 3 | 1-0 |
| Moretti casa | 28 % | 37 % | 8,9 / 22,9 | 57 | 18 | gioco 58 · morta 17 · fermo 2 · ripresa 8 | 3-0 |
| Galli fuori | 34 % | 45 % | 5,5 / 25,8 | 43 | 16 | gioco 57 · morta 12 · ripresa 12 | 1-2 |
| Conti fuori | 33 % | 43 % | 7,6 / 22,0 | 48 | 14 | gioco 56 · morta 8 · ripresa 15 | 5-2 |

Quello che i fotogrammi mostrano, gol per gol (foto a +0,5 s dalla riga):

- **Gol del piano (5):** il pallone è SULLA LINEA o sul palo in 5/5 — Conti 24' (`conti-f12`), Spada
  61' (`conti-f31`), Bruno 76' (`conti-f42`), Neri 55' (`moretti-f30`), Pecoraro 68' (`galli-f29`).
  Il portiere è in quadro 5/5 e in PIEDI 5/5: 4 volte sulla linea col pallone ai piedi, 1 volta
  (Spada 61') a ~10u fuori dalla porta mentre il pallone è sul palo. La 7.854 ha fermato il richiamo
  del pallone durante il tuffo (traccia in avanti 2/2), ma sul telefono il tuffo NON SI VEDE: il corpo
  del portiere non si piega (rz 0,01 nella traccia — il tuffo procedurale non gira il GLB).
- **Gol dell'eroe (5):** la riga «segna … 1-0» PRECEDE il pallone in rete e il tabellone in 3/5.
  Vairo 42' (`vairo-f18`, età 15 ms): riga «1-0», HUD e tabellone 0-0, pallone sulla linea ai piedi
  del portiere in piedi. Conti 62' (`conti-f35`): «Testa preciso al centro → 3-2», l'eroe sta DENTRO
  la porta sotto la traversa col pallone ai piedi, il portiere sdraiato, HUD 2-2 anche a +1 s.
  Ferrari 86' (`conti-f51`, età 5 ms): «Ferrari segna su assist di Conti! 5-2» mentre la scena
  «Sterzata fulminea» è ancora aperta, il pallone è ai piedi di un DIFENSORE e l'HUD dice 4-2.
  Moretti 25' (`moretti-f14`): pallone a centrocampo, HUD 0-0 a +1 s. Moretti 33' (`moretti-f20`):
  la camera inquadra l'area vuota e le tribune, pallone fuori quadro.
- **Gol subiti (2):** Galli 85' (`galli-f37`) campo vuoto e «Non ci si crede»; Conti 40' pallone a
  centrocampo. Nessun pallone nella nostra rete (7.805, §20): coerente con la regola, ma non si vede.

Il testo contro il campo (P1, «lo schermo smentisce il testo»):

| minuto | riga | fotogramma | cosa si vede |
|---|---|---|---|
| Vairo 12' | «Ferrari da due passi, tutto solo davanti alla porta!» | `vairo-f02` (787 ms) | pallone al limite dell'area, cinque maglie gialle intorno, HUD «Trequarti» |
| Moretti 10' | «Pecoraro da due passi, tutto solo…» | `moretti-f02` (851 ms) | pallone FUORI area, un difensore a 2u |
| Galli 11' | «Pecoraro da due passi, tutto solo…» | `galli-f03` (604 ms) | pallone sull'arco dell'area, difensore addosso |
| Conti 11' | «Pecoraro da due passi, tutto solo…» | `conti-f02` (29 ms) | porta fuori quadro, cinque uomini, l'HUD in basso dice «Trequarti» |
| Vairo 86' | «Scotti a tu per tu col portiere, calcia di prima!» | `vairo-f37` (77 ms) | bordo area, porta fuori quadro, tre compagni e un avversario a 3u |

Cinque su cinque. È la stessa riga, allo stesso minuto (10'-12'), per la quinta scheda di fila.

| # | Area | n°3 | **n°4** | motivo (fotogramma e minuto) |
|---|------|:---:|:---:|---|
| 1 Realismo | 5 | **5** | padrone 16-34 %, un salto ogni 3 s |
| 2 Credibilità da attaccante | 5 | **5** | pallone sulla linea 5/5 ma portiere in piedi 5/5; «da due passi» falso 4/4 |
| 3 Causalità | 6 | **6** | il piano finisce in rete col pallone che arriva (7.854); l'eroe segna prima del pallone 3/5 |
| 4 Varietà | 5 | **5** | «da due passi» al 10'-12' in 4/4, quinta volta |
| 5 Ritmo | 5 | **5** | ripresa 12'/15' fuori casa; Moretti palla morta+fermo 19 > 15 |
| 6 Azioni extra-eroe | 6 | **6** | il tiro entra, il portiere c'è, non si tuffa |
| 7 Highlight dell'eroe | 5 | **4** | rigiudicato: `vairo-f18`, `conti-f35`, `conti-f51` — riga prima del pallone, eroe dentro la porta |
| 8 Telecronaca | 5 | **4** | 5/5 smentiti dal campo, e in `conti-f02` dall'HUD stesso («Trequarti») |
| 9 Interazioni | 7 | **7** | nessuna contro il punteggio |
| 10 Coerenza fra i sistemi | 7 | **6** | riga «1-0» con HUD 0-0 per >1 s (`vairo-f18` 15 ms, `conti-f35`, `conti-f51`) |
| 11 Immersione | 5 | **5** | 14-18 fps, età dei fotogrammi fino a 1,6 s |
| 12 Carriera | 6 | **6** | barra viva |

**Media DA TELEFONO: 5,3** (somma 64; n° 3 era 5,6). Il calo non è una regressione della 7.854
(i gol del piano stanno in rete 5/5 come nel n° 3): sono due aree giudicate per la prima volta dai
fotogrammi (7 e 10) e una scesa perché il conteggio è 5/5 (8). Dieci aree sotto 7. Nessun «puoi
collaudare».

Prossimi, in ordine: (a) il tuffo che si vede — il corpo del portiere non si piega (clip GLB o
rotazione procedurale, rz 0,01); (b) la riga del gol dell'eroe DOPO il pallone in rete, come già
fa il piano (7.852/7.854) — oggi «segna … 5-2» esce con la scena aperta e il pallone al difensore;
(c) il testo che legge la geometria: «da due passi» solo entro 8u dalla porta, «tutto solo» solo
senza avversari entro 4u, «a tu per tu» solo col portiere come unico uomo davanti; (d) la banda 60
del padrone.

## Scorecard DA TELEFONO n° 5 — build 7.856 (branch: 7.855 v4 + 7.856; 7.857 revocata)

Chromium 412×915 portrait, campo 3D acceso, tick reale, seme 4242, screencast CDP, **sonda v6**
(`__CPM_REALWAIT` acceso: senza, il banco avanzava le scene senza aspettare il renderer — lezione 17ª;
nuova riga «frasi del tiro di piano smentite dal campo»). Età mediana dei fotogrammi 173 / 247 / 395 /
373 ms, max 1,0-1,3 s. NON è l'Android del PO. Schede e fotogrammi in `docs/collaudo-telefono/n05/`
(Moretti e Conti: la prima corsa sulla 7.855 v3 è conservata come `-v3.md`; le foto dei gol sono della
corsa bis sulla v4, stesso mondo per Conti: 5-2 con gli stessi marcatori).

| partita | padrone ≤3u | salti | fps | stati (min) | frasi del tiro smentite (piano → emesse) | finale |
|---|:---:|:---:|:---:|---|:---:|:---:|
| Vairo casa | 36 % | 39 | 15 | gioco 67 · morta 15 · ripresa 3 | 2/5 → 0/5 | 0-0 |
| Moretti casa | 23 % | 63 | 17 | gioco 60 · morta 14 · fermo 2 · ripresa 7 | 1/4 → 0/4 | 3-0 |
| Galli fuori | 19 % | 53 | 16 | gioco 57 · morta 12 · ripresa 11 · inizio 6 | 1/3 → 0/3 | 2-1 |
| Conti fuori | 21 % | 48 | 13 | gioco 56 · morta 8 · ripresa 15 · inizio 4 | 1/1 → 0/1 | 5-2 |

Quello che i fotogrammi mostrano:

- **Gol del piano, il tuffo si vede (7.855 v4).** Conti 24' (`conti-f13`, età 108 ms): portiere A TERRA
  sul palo, pallone accanto. Spada 61' (`conti-f31`, età 11 ms): portiere disteso in area, pallone sul
  palo; a +1 s (`conti-f32`, età 17 ms) si sta rialzando col badge «GOL — SPADA». Bruno 76' (`conti-f44`):
  carponi sul palo col pallone. **3/3 a terra** contro 5/5 in piedi del n° 4. Sulla v3 (prima corsa) erano
  ancora in piedi (`galli-f34`, `moretti-f31`): l'arco della rete muore alla chiusura del gol e spegneva
  il tuffo a metà — corretto in v4.
- **Le parole del tiro (7.856).** «Da due passi, tutto solo davanti alla porta!» voluto dal piano 5 volte
  su 13 tiri, sempre con avanzamento 80,7-83,1 e un avversario a 3,3-5,1u; emesso 0/13: al suo posto
  «si gira sul limite» / «dal vertice dell'area» (`vairo-f02`). Nessuna frase smentita dal campo nelle
  quattro partite.
- **Gol dell'eroe: la riga precede ancora il pallone, per un'altra causa.** Galli 20' (`galli-f09`, età
  137 ms): «Galli segna 1-0», portiere a terra, HUD e tabellone 0-0, pallone a metà area. Conti 62'
  (`conti-f36`): «3-2», HUD 2-2, pallone non in rete. Conti 86' (`conti-f51`): «5-2», HUD 4-2, pallone a
  centrocampo con la scena ancora aperta. Con la sonda della riga del gol: su Galli il gol è dichiarato
  dal TETTO dei 5,2 s col pallone reso a 72 (la scena «Controllo e tira» non porta il pallone in porta:
  codice 011, palla congelata, #31), mentre su Conti/Moretti «assist»/«testa» lo dichiara il renderer col
  pallone a 99,15. Non è più l'auto-avanzamento (7.857 revocata): è la coreografia di alcune scene.

| # | Area | n°4 | **n°5** | motivo (fotogramma e minuto) |
|---|------|:---:|:---:|---|
| 1 Realismo | 5 | **5** | padrone 19-36 %, un salto ogni 2-3 s |
| 2 Credibilità da attaccante | 5 | **6** | gol del piano: portiere a terra 3/3 (`conti-f13/f31/f44`); frasi false 0/13 |
| 3 Causalità | 6 | **6** | il piano finisce in rete col tuffo; l'eroe segna prima del pallone 3/4 |
| 4 Varietà | 5 | **5** | prima occasione al 10'-12' in 4/4 (ora «si gira sul limite», stesso minuto) |
| 5 Ritmo | 5 | **5** | Vairo 0-0 con palla morta 15; ripresa 11'-15' fuori casa |
| 6 Azioni extra-eroe | 6 | **7** | tiro, tuffo, terra, rialzata: si legge (`conti-f31` → `conti-f32`) |
| 7 Highlight dell'eroe | 4 | **4** | `galli-f09`, `conti-f36`, `conti-f51`: riga e HUD prima del pallone, pallone fermo a 72 |
| 8 Telecronaca | 4 | **6** | 0/13 smentite sul tiro; restano le righe del gol dell'eroe |
| 9 Interazioni | 7 | **7** | nessuna contro il punteggio |
| 10 Coerenza fra i sistemi | 6 | **6** | HUD 0-0 col portiere già a terra (`galli-f09`) |
| 11 Immersione | 5 | **5** | 13-17 fps, età dei fotogrammi fino a 1,3 s |
| 12 Carriera | 6 | **6** | barra viva |

**Media DA TELEFONO: 5,7** (somma 68; n° 4 era 5,3). Otto aree sotto 7. Nessun «puoi collaudare».

Prossimi, in ordine: (a) la scena dell'eroe che non porta il pallone in porta (codice 011, #31: il
tetto dei 5,2 s dichiara il gol col pallone a 72 — misurare quali scene, poi far volare il pallone
prima di dichiarare); (b) la banda 60 del padrone (19-36 %); (c) la prima occasione sempre al 10'-12'.

## Scorecard DA TELEFONO n° 6 — build 7.858 (branch)

Chromium 412×915 portrait, campo 3D acceso, tick reale, seme 4242, screencast CDP, sonda v6. Età
mediana dei fotogrammi 336 / 203 / 266 / 346 ms, max 0,9-1,1 s. NON è l'Android del PO. Schede e
fotogrammi in `docs/collaudo-telefono/n06/`.

| partita | padrone ≤3u | salti | fps | stati (min) | frasi del tiro smentite (piano → emesse) | finale |
|---|:---:|:---:|:---:|---|:---:|:---:|
| Vairo casa | 33 % | — | — | — | 1/4 → 0/4 | 1-0 |
| Moretti casa | 35 % | — | — | — | 1/3 → 0/3 | 1-0 |
| Galli fuori | 11 % | 54 | 17 | gioco 56 · morta 13 · ripresa 11 · inizio 6 | 2/3 → 0/3 | 2-1 |
| Conti fuori | 27 % | 51 | 15 | gioco 56 · morta 8 · ripresa 15 · inizio 4 | 1/1 → 0/1 | 5-2 |

Quello che i fotogrammi mostrano:

- **Gol del piano (7.855 v4 confermata):** Moretti 57' portiere a terra sul palo a +0,5 s
  (`moretti-f27`, età 308 ms) e in ginocchio a +1 s (`moretti-f28`, età 38 ms); Galli 69' carponi col
  pallone sulla linea a +1 s (`galli-f37`); Bruno 76' accovacciato sulla linea (`conti-f44`, età 125
  ms). Il tuffo, la terra e la rialzata si leggono.
- **Gol dell'eroe: la riga precede ancora il pallone in 3 su 4, nonostante la 7.858.** Vairo 51'
  (assist «Filtrante tra i centrali»): riga «1-0», HUD e tabellone 0-0, pallone sulla linea ai piedi
  del portiere in piedi, scena aperta (`vairo-f20`, età 296 ms). Galli 29' (dribbling): a +1 s HUD 0-0,
  portiere a terra, pallone a metà area (`galli-f14`, età 311 ms). Conti 86' («Tiro controllato»): a
  +1 s HUD 4-2 col pallone a metà area (`conti-f52`, età 210 ms). Conti 62' (testa): HUD 2-2 con eroe
  e pallone dentro la porta (`conti-f36`, età 98 ms). La sonda della riga del gol dice 7/8 col pallone
  alla linea dopo la 7.858; i fotogrammi dicono 1/4. **La discrepanza non è risolta**: la sonda legge
  il pallone reso nell'istante della riga «segna», la foto arriva 0,5-1 s dopo e mostra il pallone
  lontano dalla porta. Prossima misura: nella stessa corsa, foto e posizione del pallone nello stesso
  istante, per scena (dribbling, assist, tiro controllato, testa).
- **Le parole del tiro (7.856 confermata):** smentite 5/11 come le voleva il piano, 0/11 emesse.

| # | Area | n°5 | **n°6** | motivo (fotogramma e minuto) |
|---|------|:---:|:---:|---|
| 1 Realismo | 5 | **5** | padrone 11-35 %, un salto ogni 2-3 s |
| 2 Credibilità da attaccante | 6 | **6** | portiere a terra sui gol del piano (`moretti-f27`, `galli-f37`, `conti-f44`); frasi false 0/11 |
| 3 Causalità | 6 | **6** | il piano finisce in rete col tuffo; l'eroe «segna» prima del pallone 3/4 |
| 4 Varietà | 5 | **5** | prima occasione al 10'-12' in 4/4 |
| 5 Ritmo | 5 | **5** | ripresa 11'-15' fuori casa; due 1-0 in casa con pochi tiri |
| 6 Azioni extra-eroe | 7 | **7** | tiro, tuffo, terra, rialzata |
| 7 Highlight dell'eroe | 4 | **4** | `vairo-f20`, `galli-f14`, `conti-f52`: riga e HUD prima del pallone |
| 8 Telecronaca | 6 | **6** | 0/11 smentite sul tiro; le righe del gol dell'eroe restano in anticipo |
| 9 Interazioni | 7 | **7** | nessuna contro il punteggio |
| 10 Coerenza fra i sistemi | 6 | **6** | HUD 0-0 col portiere a terra (`galli-f14`) |
| 11 Immersione | 5 | **5** | 15-17 fps, età dei fotogrammi fino a 1,1 s |
| 12 Carriera | 6 | **6** | barra viva |

**Media DA TELEFONO: 5,7** (somma 68, come il n° 5). Otto aree sotto 7. Nessun «puoi collaudare».
Prossimi: la discrepanza sonda/foto sul gol dell'eroe (misura nello stesso istante, per scena); la
banda 60 del padrone (11-35 %); la prima occasione al 10'-12'.
