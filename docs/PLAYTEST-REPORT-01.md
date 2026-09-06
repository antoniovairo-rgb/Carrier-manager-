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
