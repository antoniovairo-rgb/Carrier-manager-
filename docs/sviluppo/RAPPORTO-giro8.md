# Rapporto giro 8 — PO-229 (uno-due su gi38) e verifica di movimento-147 per L7

Ramo: `sviluppo/haiku-l7-pulizia-l8`, ricostruito da `origin/main` 10288c7 (7.999.160) con sopra il giro 7
(cherry-pick di 455dade e 1df4d65; unico conflitto su `docs/governo/STABILITA.json`, risolto tenendo la versione
di main, che è il registro delle catene). `GAME_VERSION` **non** toccata.

## Compito 1 — PO-229, «Dai e vai preciso» (gi38) racconta un assist ma non lo gioca

### Sonda
`tests/visual/po229-gi38-probe.mjs` (`npm run po229-gi38`). **Nel repo non esisteva**: l'ho scritta io.
Forza le scene (`CPM_SIT`, default 38), sceglie l'azione con premio assist, forza il successo e campiona ogni
~60 ms fino all'uscita da `hl_result`: post-arco (`__CPM_ARC.pa`), restituzione (`__CPM_O2`), pallone e padrone
(`__CPM_OWN`). Verdetto: A restituzione partita · B servizio al compagno dopo la restituzione · C conclusione
del compagno · D pallone non fermo ai piedi dell'eroe a fine scena. Su esito `chance` (7.8.10) conclude la
catena, quindi basta A. Esce 1 su rosso, 2 se cieca.

### Misura prima della correzione
Sonda su gi38 (pagina nuova): post-arco **nessuno**, pallone fermo in (61,67) ai piedi dell'eroe per tutta la
scena, padrone eroe a 0,15-0,51 u — il quadro descritto dalla sessione principale.
Registratore per fotogramma (`__CPM_REC_BUF`), primi fotogrammi di `hl_result`:

| fotogramma | arco | ballArcT | durata | pallone |
|---|---|---|---|---|
| 1° (t 23 042 ms) | no | — | — | (0,0) |
| 2° (t 26 516) | **sì**, bersaglio il muro (x 9, 2 u dietro l'eroe) | −0,27 (carica) | 0,31 | ai piedi dell'eroe |
| 3° (t 27 613) e seguenti | **no** | — | — | fermo ai piedi dell'eroe |

L'arco dell'appoggio veniva armato da `fireConclusion` e spento al fotogramma dopo, prima ancora di partire.

### Causa (misurata con testimoni temporanei sui sei punti che spengono l'arco, poi rimossi)
Solo lo **snap di scena** (`src/12-three-match-view.jsx:3558-3560`) scattava due volte: al primo fotogramma per il
cambio di chiave (giusto) e al fotogramma successivo **senza** cambio di chiave. Il secondo `_ballSnap` lo
rialzava il **ri-taglio su staging tardivo** (7.401/7.456, `src/12-three-match-view.jsx` ~6393): nel primo
fotogramma, quando la scena forzata entra già in `hl_result` (headless a 1-7 fps, scena del wizard di
revisione), l'ordine è

1. snap per chiave nuova (r. ~3560);
2. cambio di fase → `fireConclusion` arma l'appoggio al muro (r. ~4670);
3. ri-taglio di staging (r. ~6393): lo stamp di staging è nuovo e il taglio di chiave non è ancora registrato
   (lo calcola r. ~6787, più sotto) → `_ballSnap=true` (testimone `__CPM_RSNP401`: `src:"staging"`);
4. fotogramma dopo: lo snap spegne arco e post-arco → `onetwo_back` non nasce mai.

Non era il prop `hlOneTwo` né il destinatario dell'arco: `hlOneTwo` è vero, e il muro viene trovato
(`__CPM_O2SEL.found=true`).

### Correzione
`src/12-three-match-view.jsx`, solo nel ri-taglio di staging: se siamo in `hl_result` e la conclusione è viva
(arco in volo, build-up o post-arco) il ri-taglio non rialza `_ballSnap`; corpi e camera si ri-tagliano come
prima. La chiave è la stessa, quindi il pallone era già stato agganciato alla scena. Contatore test-only
`__CPM_PO229` (quante volte il pallone è stato risparmiato). **Rosso: `__CPM_NO_PO229`.**

### Misure dopo

| prova | esito |
|---|---|
| sonda gi38, verde, 4 scene (1 in sequenza 38,180,186,121 · 1 sola · 2 in 38,38) | **4/4 verdi**: `onetwo_back → assist_recv → cross_goal` (→ `in_net` in 2 su 4) |
| sonda gi38, rosso `CPM_NO_PO229=1`, 3 corse | **3/3 rosse**: post-arco nessuno, pallone fermo all'eroe |
| `CPM_SIT=38,188,30 node delivery-arrival-test.mjs` | ✅ PASS — gi38 0,4 u · gi188 0,1 u · gi30 0,5 u |
| `npm run goal-postarc` | ✅ PASS — 6 gol su 2 partite, classi A/B/C 0 |

Dichiarato:
- **gi186 in terza posizione** (sequenza 38,180,186,121) arriva a `assist_recv` senza conclusione **in entrambi i
  bracci** (verde e rosso); da sola su pagina nuova è verde (`onetwo_back → assist_recv → cross_goal`). È
  effetto di sequenza/pagina stanca, non di questa correzione. Non indagato oltre.
- **gi180** era rossa prima della correzione in sequenza (stessa firma di gi38: nessun post-arco) e verde dopo;
  nel braccio rosso della corsa in sequenza è risultata verde: dipende da quale scena ha il primo fotogramma
  già in `hl_result`. Il testimone stabile è gi38.
- La conclusione dopo `assist_recv` è `cross_goal` (catena già esistente); non ho toccato la scelta del canale.
- Il difetto richiede che il primo fotogramma della scena sia già `hl_result`: succede nel percorso forzato
  (wizard di revisione, sonde) a fps bassi. **Non posso confermare** che accada anche nel flusso vero di
  partita, dove la scena passa da `hl_intro`.
- La sonda non è in nessuna catena: è uno script npm; la decisione di metterla in catena spetta alla sessione
  principale.

## Compito 2 — L7 e `movimento-147`: la differenza regge?

### Metodo
Due worktree dallo stesso container, stessa `node_modules`, corse **in serie e alternate** (main, L7, main, L7…),
niente altro in esecuzione nel frattempo:
- **main** = `origin/main` 10288c7;
- **L7** = 4605f61 = main + il solo giro 7. Rispetto a main cambiano **solo** `src/18-career-app.jsx` e l'HTML
  ricomposto (4 righe: lo stile della riga stagione·settimana·posto). La correzione PO-229 di questo giro **non**
  è inclusa, per isolare la modifica L7.

Ogni corsa di `movimento-147` gioca 2 partite col braccio verde e 2 col rosso (`__CPM_NO_ATTIVI147`). Passa se:
verde campioni compagni ≥ 100 e fermi ≤ 25 %; rosso campioni ≥ 100 e fermi ≥ 30 %.
Uscite grezze: `docs/sviluppo/movimento-giro8/` (`main-N.out`, `l7-N.out`, `log.txt`).

### Numeri

| corsa | build | verde: campioni comp. | verde: fermi comp./avv. % | rosso: campioni comp. | rosso: fermi comp./avv. % | esito | motivo del rosso |
|---|---|---|---|---|---|---|---|
| 1 | main | 100 | 11,0 / 8,5 | 144 | 33,3 / 39,5 | ✅ | — |
| 1 | L7 | 106 | 14,2 / 14,3 | 117 | 31,6 / **26,1** | ❌ | braccio rosso: avversari fermi < 30 |
| 2 | main | 115 | 3,5 / 2,1 | **87** | **28,7 / 26,4** | ❌ | braccio rosso: campioni e fermi |
| 2 | L7 | 197 | 4,6 / 7,3 | **90** | 30,0 / **28,8** | ❌ | braccio rosso: campioni e fermi |
| 3 | main | **57** | 12,3 / 9,9 | 151 | 30,5 / 32,1 | ❌ | braccio verde: campioni |
| 3 | L7 | **37** | 0 / 0 | **48** | **8,3 / 10,1** | ❌ | entrambi i bracci: campioni (e il rosso non si vede) |
| 4 | main | **47** | 6,4 / 3,8 | **62** | 46,8 / 50,5 | ❌ | entrambi i bracci: campioni |
| 4 | L7 | 108 | 1,9 / 4,3 | **65** | 36,9 / 34,2 | ❌ | braccio rosso: campioni |

**Totale: main 1/4 verde, L7 0/4.** Con il giro 7 (main 1/2, L7 0/3): **main 2/6, L7 0/7**.

### Lettura
- **La differenza non regge come effetto della modifica L7.** Su main il guardiano è rosso 5 volte su 6; i
  rossi delle due build hanno le **stesse** due firme (campioni sotto 100, oppure braccio rosso sotto il 30 %),
  e cadono in entrambi i bracci. Nessuna grandezza misurata si sposta in una direzione con L7: fermi del braccio
  verde main 11,0 / 3,5 / 12,3 / 6,4 contro L7 14,2 / 4,6 / 0 / 1,9; campioni del verde main 100 / 115 / 57 / 47
  contro L7 106 / 197 / 37 / 108. Con 2 verdi su 13 corse in tutto, 2 su 6 contro 0 su 7 non distingue le due
  build (test esatto di Fisher bilaterale, calcolo mio: p ≈ 0,19).
- **Il nesso causale resta non dimostrato e non plausibile dal codice**: la modifica L7 è uno stile CSS
  dell'intestazione della carriera, `movimento-147` misura i giocatori in partita. Non posso confermare l'assenza
  di qualunque effetto indiretto (per esempio sul tempo di montaggio), ma non ho nessuna misura che lo indichi.
- **Il guardiano è instabile su main da solo.** Il conteggio dei campioni varia di un fattore 5 fra corse
  identiche (37-197 nel verde): la soglia «≥ 100 campioni» su due partite a fps headless non è una misura
  ripetibile. È un difetto dello strumento, non una regressione: non ho abbassato la soglia né saltato il
  passo. Suggerimento (non applicato, fuori ambito): fissare la durata osservata in tempo di scena invece del
  numero di campioni, o far giocare partite finché i campioni non bastano.

## Catene

### Grafica — `node ci-runner.mjs grafica` sul ramo (giro 7 + PO-229)
**29/30. NON VERDE.** Log: `docs/sviluppo/grafica-giro8.log`.
- ✅ 28 passi verdi al primo colpo, compresi `griglia-mobile`, `design-system`, `test:logic`, `save-compat`,
  `career-critical`, `l7-schermate` e **`movimento-147`** (verde dentro la catena, questa volta).
- ⚠️ `premiazione-palco-191` instabile (verde alla seconda prova).
- ❌ `coppa-mani-191`, rosso 3 su 3: fallisce il **braccio rosso** del guardiano per pochi campioni (soglia ≥ 10).

Confronto su `coppa-mani-191`, corse alternate nello stesso container:

| corsa | main: campioni verde / rosso | main | ramo: campioni verde / rosso | ramo |
|---|---|---|---|---|
| 1 | 12 / 11 | ✅ | 12 / 6 | ❌ |
| 2 | **0** / 11 | ❌ | 9 / 7 | ❌ |
| 3 | 6 / 7 | ❌ | 4 / 8 | ❌ |
| 4 | 7 / 6 | ❌ | 9 / 10 | ❌ |

Main 1/4, ramo 0/4 (e 0/3 in catena). Le grandezze di merito sono **identiche** sulle due build (scarto 0,05-0,06
nel verde, 0,51 nel rosso, faccia 0): cambia solo quanti campioni si raccolgono, intorno alla soglia. Stessa
classe di `movimento-147`: guardiano a conteggio di campioni, instabile anche su main. La correzione PO-229 agisce
solo dentro `hl_result` con conclusione viva e non tocca la premiazione; non ho una misura che la colleghi.

### Completa — `node ci-runner.mjs completa` sul ramo (giro 7 + PO-229)
**19/20 nel runner; 20/20 contando `scena-motore-147` rieseguito a mano.** Log: `docs/sviluppo/completa-giro8.log`.
- ✅ `test:vision`, `test:logic`, `typing-shortcuts`, **`validate-situations`** (gate), `save-compat`, `replay`,
  `career-critical`, `partita-vera`, `manovre-150`, `popup-224`, `lessico-218`, `fila-227`, `design-system`,
  `gk-dive-sync`, **`goal-postarc`**, `difesa-220`, `scene-221`.
- ⚠️ `esiti-218` instabile: verde alla terza prova (primo rosso: gi2021 «Piazzato nell'angolo basso», tiro fuori
  raccontato come parata).
- ⚠️ `nomi-219` instabile: verde alla seconda prova (primo rosso: compagni nominati vicini 88 % contro ≥ 90 %).
- ❌ `scena-motore-147` in 0 s: **non è una misura**. Lo script carica harness e salvataggio da percorsi assoluti
  `/home/user/cm-poc/tests/visual/…` (`tests/visual/scena-motore-147.mjs:6-7`), che in questo container non
  esistono. Rieseguito a mano con un collegamento simbolico temporaneo `/home/user/cm-poc → repo` (rimosso
  dopo): **✅ verde** — generate 14 su 14 occasioni coperte nel verde, 0 nel rosso `__CPM_NO_P6C`. Log:
  `docs/sviluppo/scena-motore-147-giro8.log`. Lo script non l'ho corretto (fuori ambito): chi lo esegue fuori da
  quella cartella lo vedrà sempre rosso.

Le foto `docs/collaudo-grafico/g0/` sono rigenerate da `griglia-mobile`; `docs/governo/STABILITA.json` porta i
giri di questa sessione.

## Esito

- **Compito 1 (PO-229): fatto.** Causa misurata e corretta, rosso `__CPM_NO_PO229`, sonda nuova verde 4/4 e
  rossa 3/3, `delivery-arrival` (38,188,30) e `goal-postarc` verdi, gate e catena completa verdi. Resta da
  provare sul telefono, e resta non dimostrato che il difetto esista anche nel flusso vero (vedi sopra).
- **Compito 2 (L7 / movimento-147): misurato.** La differenza non regge (main 2/6, L7 0/7, p ≈ 0,19; nessuna
  grandezza si sposta; stesse firme di rosso sulle due build). Dentro la catena grafica di questo giro
  `movimento-147` è verde sulla mia build. La catena grafica resta però **29/30** per `coppa-mani-191`, rosso
  anche su main 3 corse su 4: guardiano instabile della stessa classe (soglia sul numero di campioni).

NON CHIUSO — la catena grafica non è verde (29/30, `coppa-mani-191` rosso 3/3 nel runner, rosso anche su main 3 corse su 4) e la catena completa ha un passo rosso nel runner (`scena-motore-147`, percorso assoluto inesistente nel container, verde solo eseguito a mano); nessun rosso è legato alle mie modifiche, ma non lo posso dichiarare verde.
