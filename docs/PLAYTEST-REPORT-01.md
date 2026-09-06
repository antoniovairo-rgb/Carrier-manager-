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
