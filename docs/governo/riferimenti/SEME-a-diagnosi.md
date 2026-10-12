# SEME (a): stesso salvataggio, stesso seme, esito diverso. Diagnosi

12/10/2026 · solo misura, nessuna modifica a `src/` · sonda `tests/visual/sonda-seme-traccia.mjs` ·
dati grezzi in `/tmp/claude-0/seme/*.json` · comparatori `/tmp/claude-0/seme/cmp*.mjs`

Condizioni: salvataggio `fixtures/save-190-s12-ovr93.json`, `playMatch()`, autoplay
`{seed:2311, policy:'seeded', tickMs:150}`, velocità 1×, GLB spento, `?cpmtest=1`.
Le misure sono state prese sul build in vigore fra le 07:03 e le 07:44. Alle 07:46:44 `src/14` e `src/15`
sono stati modificati da un'altra mano: i numeri di riga qui sotto si riferiscono a `src/` come era alle
07:48. Non so cosa sia cambiato, quindi non posso confermare che le misure valgano anche dopo quella modifica.

## In breve

Il motore del possesso è seedato e, a parità di ingressi, produce sempre la stessa partita: il numero di
sorteggi per minuto (`__CPM_RND14`) è identico fra i due giri finché non diverge un ingresso. A rompere la
riproducibilità sono gli **ingressi** che il live match gli passa, e il primo che diverge è
**`chiedi.riprendi` alla ripresa dopo una scena**. Il punto da cui il motore riparte viene dal **pallone
reso in 3D** e dalla **posizione dell'eroe scritta da timer a orologio da polso**. Entrambi dipendono da
quanto dura in tempo reale la scena e da quanti fotogrammi o battiti di `setInterval` ci stanno dentro.
`Math.random` non seedato contribuisce, ma non è la causa principale: con `Math.random` **costante** le
partite divergono lo stesso.

## 1. Traccia dei due giri e primo punto di divergenza

Giri completi, stesso salvataggio e stesso seme (punteggio finale):

| braccio | giro A | giro B |
|---|---|---|
| base (`s2311`) | 0-0 | 2-0 |
| base, col registratore del motore (`reg`) | 1-1 | 2-0 |
| `Math.random` seedato, mulberry32 (`s2311-rs`) | 1-0 | 3-1 |
| `Math.random` costante 0,4321 (`s2311-rc`) | 1-0 | 2-0 |

**Traccia a stati** (`__CPM_PHASE`/`__CPM_CLOCK`/scena/punteggio, braccio base): identica fino al 20'. Al 21'
il giro A apre una scena e il giro B no. Questo però è già un effetto.

**Registro degli eventi** (`__CPM_EV`, braccio base): voci 0-24 identiche, comprese le due scene del 5'
(«Bordata da centrocampo», esito `intercept`) e dell'8' («Deviazione ravvicinata», esito `foul`). La prima
voce diversa è la n. 25, al **9'**:
`recita motore away ex 69.9/ey 25.9` contro `ex 72.4/ey 1`.

**Ingressi del motore** (registratore `__CPM_REG202`, braccio `reg`). Dal confronto escludo `scenaMuovi`, che
ripristina lo stato del motore nel suo `finally` (src/14:1101-1112), e le chiamate `probEroe`, che
calcolano la percentuale mostrata nell'interfaccia a ogni render. Il primo ingresso divergente è il n. 197,
la ripresa dopo la scena dell'8':

```
A chiedi.riprendi {x:52.940, y:44.0156, lato:away, eroe:{x:68.8434, y:29.6796}}
B chiedi.riprendi {x:52.940, y:43.1326, lato:away, eroe:{x:68.8434, y:29.6985}}
```

La x è identica in entrambi i giri: è il sorteggio seedato `_rr()` di `handleContinue`. Divergono la **y del
pallone** e la **y dell'eroe**. Da quel momento i sorteggi del motore si separano (`__CPM_RND14`: identico
dal minuto 0 all'8, diverso dal 9').

## 2. Causa (file:riga)

Le dipendenze sono in ordine di comparsa. Ogni rimozione è stata verificata con un braccio in pagina, senza
toccare `src/`.

**C1, la principale: il pallone di ripresa è il pallone RESO.**
`handleContinue` (src/15-live-match.jsx:9256) chiama per prima cosa `_allinea781()` (src/15:9246-9254,
chiamata a 9257). Questa funzione copia in `ballTargetRef` la posizione del pallone **mesh** letta dal
renderer (`meshDefRef`). Subito dopo `_bEnd=ballTargetRef.current` (src/15:9376) entra nella y di ripresa
`_ry=_bEnd.y*0.62+…` (src/15:9382). Al battito successivo `ballPosRef` arriva al motore in
`_M.chiedi.riprendi({x:ballPosRef…, y:…, eroe:pPosRef.current})` (src/15:5399).
La posizione della mesh dipende dai fotogrammi resi, cioè da fps e durata reale della scena: in headless si
va da 1 a 7 fps. Prova: con `Math.random` costante e il pressing neutralizzato, quattro giri danno al 9' la
y di ripresa 44,02 · 44,08 · 43,81 · 44,27, e il bersaglio del pallone nella scena difensiva cambia in modo
continuo (hl_intro 70,86/29,28 · 70,89/29,55 · 71,10/29,43).

**C1b: nelle scene difensive il pallone lo scrive anche il pressing a orologio.**
`_tick84` (src/15:3550) gira con `setInterval(_tick84, 550/650/700 ms)` (src/15:3730). Nelle scene difensive
mette il pallone sull'avversario più vicino (`ballTargetRef.current=_bp`, src/15:3727) e muove i ventidue
con un passo smussato. Il numero di battiti dipende dalla durata reale della scena: nella prima scena del
giro `reg` le chiamate `scenaMuovi` sono state 3 contro 2. Lo stato del motore non ne risente, perché
`scenaMuovi` lo ripristina, ma `matchPlayers` e `ballTargetRef` del live sì, e attraverso `_bEnd` arrivano
a C1.

**C2: l'eroe passato a `riprendi` lo scrive la deriva idle a orologio.**
L'effetto «Idle drift» (src/15:8424, `setInterval(…, 500)` a 8431-8487) sposta `pPos` ogni 500 ms reali con
`rng()`, cioè `_cpmRnd()`, cioè `Math.random` (src/05:523/530, riga 8473). Fra la fine della scena e il
battito che chiama `riprendi`, questi passi sono in gara con lo specchio del motore (src/15:4245). Misurato
con `Math.random` costante e C1 spento: al 6' l'eroe vale `{69.47, 30.1266}` (deriva) contro
`{69.42, 29.39}` (specchio).

**C3: il raggruppamento dei sotto-tick in battiti dipende dal tempo reale.**
I sotto-tick del motore girano sul `setInterval` del metronomo (`_SUB898`, `k898Ref`, src/15:4230 e 4267).
Questo intervallo si riavvia a ogni cambio di fase, e il debito di passi (src/15:5423, regole 967 e 202) li
recupera dopo. Il motore riceve la stessa sequenza di passi, ma **in quale battito** il live legge i fatti
(occasione, scena, `riprendi`) cambia. Misurato con C1, C1b e C2 spenti e `Math.random` costante: un
sotto-tick del 17' cade prima della scena in un giro e dopo `riprendi` nell'altro. Al 44' un giro apre la
scena dopo 14 sotto-tick, gli altri dopo 30. Che sia proprio la cadenza del `setInterval` a decidere il
battito è il meccanismo che deduco dal codice: non posso confermarlo con una misura diretta.

**C4: contributo minore, `Math.random` nei punti d'assestamento dell'esito.**
`handleAction` assegna `ballTargetRef` con `rng()` per gol, tiro fuori, assist, occasione, intercetto,
recupero, parata e gol subito (src/15:9097-9104), e con la catena (`rng(-3,3)`/`rng(-8,8)` subito dopo).
Quando C1 non sovrascrive, ad esempio con distanza sotto 1,5 o `__CPM_NO781` acceso, questo valore diventa
`_bEnd` e quindi l'ingresso di `riprendi`.

## 3. Esperimento con Math.random seedato

| braccio | esiti | primo ingresso divergente del motore |
|---|---|---|
| `Math.random` seedato (mulberry32, stesso seme) | 1-0 / 3-1 | non registrato (sonda prima del registratore) |
| `Math.random` costante 0,4321 | 1-0 / 2-0 | non registrato |
| costante + pressing neutralizzato (`fp-rc`) | 3-0 / 0-1 | `riprendi` del 9', y pallone 43,12 contro 44,19 |
| + `__CPM_NO781` (C1 spento), 4 giri | 1-0 · 2-1 · 2-1 · 0-0 | 6' (eroe dalla deriva, C2) e 17'-18' (C3) |
| + deriva idle neutralizzata (C2), 4 giri | **1-0 · 1-0 · 0-0 · 1-0** | 44' e 66' (solo ordine sotto-tick/battito, C3) |

Il braccio seedato **non isola** `Math.random`. Il render loop consuma decine di migliaia di sorteggi in
quantità che dipende dagli fps (45.000-55.000 a partita, diversi a ogni giro), quindi lo stesso seme produce
comunque flussi diversi per il gioco. Il braccio a valore costante invece lo isola, e **diverge lo stesso**.
Conclusione: **la causa è il tempo reale** (C1, C1b, C2, C3). `Math.random` ne amplifica una parte (C2, C4).
Togliendo C1 e C2 il primo punto di divergenza passa dall'**8'-9'** al **44'-66'**, e 3 giri su 4 danno lo
stesso risultato.

## 4. Correzione minima proposta (NON applicata), interruttore rosso `__CPM_NO_SEME`

Principio: **il motore riceve solo ingressi logici e seedati; quello che si vede resta com'è.** Le correzioni
sono quattro, tutte in `src/15-live-match.jsx`, nessuna nel motore.

1. **C1/C1b/C4, punto di ripresa logico.** In `handleContinue`, **prima** di `_allinea781()` (9257), si
   fotografa un punto di ripresa logico: x dal `_rr()` seedato com'è oggi, y da
   `motoreRef.current.stato().palla.y` (il pallone del motore, fermo durante la scena) invece di `_bEnd`.
   Lo si mette in un ref (`ripresaSemeRef`). `_allinea781`, `setBallPos` e `ballTargetRef` restano come
   sono: la resa non cambia. A 5399, `riprendi` prende `x/y` da `ripresaSemeRef` quando
   `!window.__CPM_NO_SEME`.
2. **C2, eroe logico a `riprendi`.** A 5399, `eroe` si prende da `motoreRef.current.stato().eroe` (o dalla
   posizione d'apertura scena salvata dalla continuità, src/15:3432) invece di `pPosRef.current`. In
   alternativa, la deriva idle (8431) non scrive `pPos` quando `MOTORE870` è attivo: lì l'eroe lo guida già
   lo specchio del motore (4245).
3. **C3, battito per conteggio.** Quando il battito apre una scena, si salda **subito** il debito dei
   sotto-tick del minuto corrente (lo stesso ciclo di 5423) prima di `chiedi.scena`, così il minuto della
   scena ha sempre i suoi 22 passi prima della scena e mai dopo.
4. **C4 (facoltativo, se resta rumore).** `rng()` alle righe 9097-9104 e nel blocco catena passa a un
   generatore seedato su `hashStr(scena|hlIdx|minuto|punteggio)`, come già fa `_rr()` a 9378.

Prova del rosso: con `window.__CPM_NO_SEME=1` si torna ai quattro percorsi attuali. Guardiano: la sonda di
questa diagnosi, già pronta. Si giocano N≥4 giri con lo stesso seme (`GIRI=4 node sonda-seme-traccia.mjs`) e
si confrontano registro del motore, `__CPM_RND14` ed esito. **Verde**: ingressi del motore identici (esclusi
`scenaMuovi` e `probEroe` d'interfaccia) ed esiti identici, anche in headless a 1-7 fps. **Rosso**
(`FLAGS=__CPM_NO_SEME`): primo ingresso divergente entro il 15'.
Non ho provato la proposta: è un piano, non una correzione misurata.

## Strumenti

- `tests/visual/sonda-seme-traccia.mjs`, con le variabili `SEME`, `GIRI`, `TAG`, `STOPMIN`,
  `RANDSEED=1|const`, `FIXPRESS=1`, `NOINT=<sottostringhe di setInterval da neutralizzare>` e
  `FLAGS=<interruttori window da accendere>`. Accende `__CPM_REG202` (registro ingressi motore),
  `__CPM_RND14`, `__CPM_TXT487` e `__CPM_PRESS959`.
- Comparatori: `/tmp/claude-0/seme/cmp.mjs` (stati/cronaca/eventi), `cmpreg.mjs` (primo ingresso divergente),
  `cmpall.mjs` (confronto a coppie su N giri).
