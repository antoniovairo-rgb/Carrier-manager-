# Rapporto giro 442 — riparazione del treno 7.999.220

Base `lavoro/204` (b14d8ad: main 7.999.219 + giri 422, 423, 424, 425, 431 con 412 e 414, 433). Ramo `sviluppo/giro442-riparazione-220`.
Treno di riferimento: corsa 46082124679 (28 parti), letta con `gh run view 46082124679 --log`.
`GAME_VERSION`, `docs/governo` (anche `DURATE-GUARDIANI.json`) e licenze **invariati**. GLB acceso in tutte le misure.

Toccati: un ramo **solo collaudo** del gioco (`src/12`, provocazione del giro 422, rosso `window.__CPM_NO_G442`) e cinque sonde/guardiani in
`tests/visual/` (`prestacco-422.mjs`, `esultanza-420.mjs`, `fila-227.mjs`, `consegna-103.mjs`, `testa-342.mjs` solo per lo strumento di misura)
più una fixture e lo script npm `prestacco-422`.

| Rosso del treno | Causa misurata | Dove si corregge | Verdetto |
|---|---|---|---|
| `prestacco-422` (gi48 a1 PROVA, dCont 0,91 > 0,45) | gara fra l'attesa TESTA146 e la **provocazione di collaudo** del 422 | `src/12`, ramo solo `cpmtest` | misura instabile, nessun difetto del gioco vero |
| `esultanza-420` («rosso dei testi … (0: )») | il rosso confronta con `origin/main`, che dalla 7.999.219 ha già i testi nuovi | guardiano | misura scaduta |
| `fila-227` (fermi 97 < 100) | il guardiano smette di contare a 90 s di parete con l'ingresso non finito | guardiano | misura instabile (tempo fisso) |
| `consegna-103` al tetto (6600 s) + 10 non partiti | dal giro 424 gi18 non produce più il percorso: 8 blocchi a vuoto per braccio | guardiano | percorso scomparso (effetto voluto del 424) |

## 1. `prestacco-422` — gara della provocazione, non del gioco

**Misura.** Sul banco, passo 1/60 (stesse regole del guardiano):

| Condizione | Scene PROVA fuori misura |
|---|---|
| treno 46082124679 | 1 su 3 (gi48 a1, dCont 0,91) |
| banco, processore normale | 0 su 3 (gi48 dCont 0,06) |
| banco, processore ×4 via CDP (`CPM_CPU442=4`, nuovo, solo misura in `testa-342.mjs`) | 1 su 3 (gi108 a0, dCont 1,16) |
| banco ×4 senza correzione (`__CPM_NO_G442`), tre passate | 0 su 9: la gara è rara (circa 1 scena su 10-15) |

**Causa (dal dump fotogramma per fotogramma di gi108, `CPM_DUMP=1`).** Col processore lento il gesto di testa si monta tardi, con il pallone
**già alla testa** (0,49 u, fotogramma 103). In quel fotogramma l'attesa TESTA146 della scena si arma senza volo 274 (pallone entro 4 u) e
si rilascia subito. Nel fotogramma dopo la provocazione `__CPM_TESTA422_PROVA` sposta il pallone a 6 u: l'attesa non riparte, l'arco resta a
u=0 mentre il pallone torna verso la testa, e il colpo parte con il pallone ancora a 1,16 u. Lo stato «pallone a 6 u senza volo» lo crea solo
la provocazione: nel gioco vero, se il pallone è già alla testa, il colpo parte da lì (le due scene naturali restano dentro in tutte le passate).
L'unione con il 431 (statura) non spiega il rosso: sulla stessa base, con la statura nuova, le scene naturali e quelle PROVA senza gara
arrivano a 0,04-0,16 u dalla testa; il rosso compare solo quando il pallone viene spostato dopo che l'attesa si è armata.

**Correzione (`src/12`, dentro il ramo `_prova422()`, quindi solo `cpmtest`).** Quando la provocazione sposta il pallone, se l'attesa della
stessa scena si è già armata, riparte (`S._w146k=null`): la provocazione gioca il caso per cui esiste (pallone lontano → volo 274 → attesa).
Rosso `window.__CPM_NO_G442`.

**Provocazione della gara (nuova, solo collaudo).** Il rosso a caso non basta a un guardiano: `__CPM_PROVA442_TARDI` arma e rilascia l'attesa
un fotogramma prima della provocazione, come nel caso misurato. Il guardiano gioca due scene TARDI (gi108 a0, gi48 a1).

**Dopo.** `npm run prestacco-422` (ora tre bracci):

| Braccio | Esito |
|---|---|
| verde | **7/7** dentro (TARDI gi48 0,08 u · gi108 0,16 u, attesa 0,43 s) |
| rosso `__CPM_NO_G422` | 3/3 PROVA fuori misura (invariato) |
| rosso `__CPM_NO_G442` (gira solo le TARDI) | **2/2** fuori misura (contatto a 6,0 u, attesa 0,24 s = solo il caricamento) |

Con il processore ×4 e la correzione: PROVA **9 su 9** dentro in tre passate.
**Visto misurando, fuori ambito:** con processore ×4 la scena **naturale** gi53 a1 è uscita una volta su tre passate con peso della clip
0,26 e «nessuna clip di testa al contatto» (picco a −0,34 s). Nel treno non è mai successo (×4 è più lento del runner); non l'ho corretta
(dubbio D2).

## 2. `esultanza-420` — il rosso dei testi confrontava con `origin/main`

**Misura.** Stessa scansione del guardiano, su tre basi:

| Base | Testi colpevoli trovati |
|---|---|
| `49769faf` (genitore di fb3c71f, commit del giro 420) | **2** (`15-live-match.jsx:315` «panchina avversaria molto meno», `:349` «sotto la curva: i compagni») |
| `origin/main` (7.999.219, col giro 420 dentro) | 0 |
| `HEAD` | 0 |

Ipotesi della consegna **confermata**: il braccio verde 3D era verde (0 corse sotto la curva avversaria) e il rosso 3D si vedeva (5); cadeva solo
il rosso dei testi, perché la sua base mobile ha raggiunto il codice corretto.

**Correzione (guardiano).** Base fissa `49769faf`; se il commit non c'è (clone corto) si leggono le due righe di allora da
`fixtures/testi-esultanza-420-49769faf.txt`. `CPM_BASE` resta per chi vuole un'altra base.

## 3. `fila-227` — tempo fisso di 90 s

**Misura.**

| Corsa | n letture | fermi | quota |
|---|---|---|---|
| treno 46082124679 (verde / rosso) | 5632 / 5698 | 97 / 122 | 0 / 1 |
| treni precedenti 45920908452 e 45898863971 (verde) | 7106 · 7062 | 2718 · 2675 | 0 |
| banco, base e main, processore normale e ×4 | 7040 | 1272 | 0 |
| banco, base, ×8, guardiano nuovo | 7040 (ingresso di 114,6 s) | 1272 | 0 |
| **banco, main, ×8, guardiano vecchio** | **4576 / 4400** | **26 / 26** | 0 / 1 → **rosso** |

Base e main danno numeri identici: il conto **non dipende** dal 412 né dal 431. Il guardiano leggeva il contatore dopo al massimo 90 s di parete;
quando l'ingresso dura di più (runner lento) la lettura è parziale, e i bambini si fermano in fila solo alla fine: i «fermi» crollano.

**Correzione (guardiano).** Si aspetta la **fine dell'ingresso** (evento), tetto 300 s; la sonda stampa `finito` e `durWalk`; un ingresso non
finito è non giudicato = rosso. Soglie invariate (≥100 fermi, quota ≤0,10 nel verde, ≥0,80 nel rosso).

## 4. `consegna-103` e i 10 non partiti della parte 21

**Misura.** Nel treno: 8 blocchi del verde e 3 del rosso, 9-10 minuti ciascuno, **0 ingressi nella consegna in 88 scene**; il guardiano ha
consumato il bilancio della parte (6600 s) e i dieci guardiani dopo di lui non sono partiti. Treni precedenti: 2 ingressi al primo blocco,
956-1433 s in tutto (stima in `DURATE-GUARDIANI.json`: 1260 s).

Sul banco, gi18 «riesce» su PC, fotogramma per fotogramma (scrittori del pallone `ws`):

| | main 7.999.219 | lavoro/204 |
|---|---|---|
| scene con il percorso `ricevente-pass → esito:cross_goal` | **2 su 3** | **0 su 6** |
| pallone alla ricezione | x 21,9 → `cross_goal` | x 25,3-26,0 → `assist_shot` |

La porta d'arrivo (`src/12`, «assist_recv») sceglie `cross_goal` solo se il pallone è a x < 22 o il pattern è SWITCH. Dal giro 424 il ricevente
sta 10 u davanti all'eroe misurato sulla posizione disegnata, quindi raccoglie più avanti: è l'effetto voluto del 424, non un difetto. Il percorso
che il guardiano sorvegliava non esce più da gi18, e il guardiano girava a vuoto.

**Censimento delle scene SWITCH** (banco, base, PC + telefono): gi105 · 119 · 122 · 181 · 182 · 187 · 188 producono il percorso **15 volte su 15**.

**Correzione (guardiano).** Al posto di gi18 quattro passaggi SWITCH riusciti (gi105, gi119, gi122, gi188), a rotazione nei blocchi
(`CPM_SCENE103` per cambiarli). Soglie invariate (scalino 3 u, pavimento 2 ingressi). Sul banco: rosso `__CPM_NO_G103B` visto al **primo blocco**
(6 ingressi, 5 oltre 3 u, scalino massimo 5,03 u, 9 salti D11). Esito completo del verde nel giro (sezione 5).

**Visto misurando, fuori ambito:** `tel-gi181-riesce` ha segnato un salto D11 di 3,0 u in 0,05 s, scrittore `esito:in_net` dopo
`ricevente-cross+esito:cross_goal` (incornata che entra in rete). Per questo gi181 non è fra le scene del guardiano (dubbio D4).

## 5. Esito del giro

`cd tests/visual && node ci-runner.mjs giro prestacco-422 esultanza-420 fila-227 consegna-103` (guardiani + 17 sentinelle):

**21/21 verdi** su 7.999.219 + questo ramo, nessun passo ripetuto. Ciascun guardiano esegue verde e rosso nello stesso comando:

| Passo | Durata sul banco |
|---|---|
| `prestacco-422` (verde 7/7 · rosso 422 3/3 · rosso 442 2/2) | 370 s |
| `esultanza-420` (verde 3D 0 corse sotto la curva altrui · rosso 3D visibile · rosso dei testi 2 su `49769faf`) | 321 s |
| `fila-227` (ingresso finito in entrambi i bracci, verde quota 0 · rosso quota 1) | 320 s |
| `consegna-103` (verde e rosso, un blocco ciascuno) | **907 s** (nel treno: oltre 6600 s, al tetto) |
| 17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97) | tutte verdi |

Le schermate di `docs/collaudo-grafico` e `docs/governo/STABILITA.json`, che le sentinelle riscrivono, sono state riportate com'erano
(non fanno parte della consegna).

## 6. Proposta per `DURATE-GUARDIANI.json` (non toccato)

- `consegna-103`: un blocco per braccio invece di 2-8 → sul banco circa 10 minuti per braccio; la stima di 1260 s va bene.
- `prestacco-422`: da 2 a 3 bracci e 2 scene in più nel verde → circa +60% (dal treno 156 s → stima **250 s**).
- `fila-227`: il tetto passa da 90 a 300 s per braccio solo se l'ingresso è lento; su un runner lento la durata sale fino a circa **+60 s** sui
  312-392 s di oggi.

## 7. Dubbi per il PO (la prima opzione è la consigliata ed è quella applicata)

**D1. `consegna-103`: il percorso di gi18 non esiste più dopo il giro 424.**
1. *(applicata)* Il guardiano gioca quattro passaggi SWITCH che producono il percorso ogni volta.
2. Rimettere gi18 provocando la ricezione a x < 22 con un gancio solo collaudo: stessa scena di prima, ma serve un gancio nuovo nel gioco.
3. Chiedersi se la regola «x < 22 → `cross_goal`» abbia ancora senso col ricevente del 424 (un giro di motore, non di riparazione).

**D2. Colpo di testa naturale con processore molto lento (gi53 a1, peso della clip 0,26 a ×4).**
1. *(consigliata, non applicata)* Un giro dedicato che misuri sul telefono lento se la clip del colpo di testa arriva tardi.
2. Aggiungere al guardiano una scena naturale a processore ×4 (rischio di rossi instabili finché il punto 1 non è chiuso).
3. Lasciare com'è: nel treno non è mai uscito.

**D3. `prestacco-422`: il rosso del 442 usa una provocazione (`__CPM_PROVA442_TARDI`), non la gara vera.**
1. *(applicata)* Provocazione deterministica: stesso ordine dei fatti misurato, rosso certo ogni volta.
2. Rosso statistico col processore ×4 ripetuto N volte (costoso: la gara esce circa 1 volta su 10-15).
3. Nessun rosso per il 442 (vietato dalle regole del giro).

**D4. Salto D11 di 3,0 u su `tel-gi181` (incornata in rete dopo la consegna).**
1. *(consigliata, non applicata)* Giro dedicato col censimento delle scene SWITCH a telefono.
2. Mettere gi181 nel guardiano `consegna-103` subito (oggi lo farebbe rosso).
3. Lasciare com'è.

## 8. Cosa non ho potuto verificare

- I numeri di CI dopo la correzione: lo dirà il prossimo treno.
- Che il runner di GitHub abbia davvero un ingresso più lungo di 90 s: l'ho dedotto dal conto delle letture (5632 contro 7040) e riprodotto
  sul banco col processore ×8, non misurato sul runner.
