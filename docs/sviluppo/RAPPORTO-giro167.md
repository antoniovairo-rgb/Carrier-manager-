# Rapporto giro 167 — strumenti della cronaca della partita di nuovo giudicanti (PO-362)

Ramo `sviluppo/giro167-strumenti-cronaca` da `sviluppo/giro162-scena-strumenti` (`428d86d`, GAME_VERSION 7.999.190 non toccato).
Metodo: un controllo alla volta, `free -m` e `df -h` prima di ognuno (memoria libera sempre sopra 15 GB, disco 26%),
`CPM_CHROME=/opt/pw-browsers/chromium`. Dopo ogni modifica a `src/`: `node tools/build-src.mjs` → `node tools/check-src.mjs`
«IDENTICO BYTE PER BYTE» (ultimo: 7.190.696 byte da 21 frammenti).

Decisione della sessione madre rispettata: **nessuna soglia abbassata, nessun guardiano ritirato.** Tre soglie sono state alzate
(bg-sync 15%→10%, bg-decision 60%→90%, campioni minimi più grandi).

## Tabella

| guardiano | prima (misura) | causa | criterio nuovo | verde | rosso (deve cadere) |
|---|---|---|---|---|---|
| ball-alive | 14,0 s di fermo, **0,0%** in moto | **strumento**: legge il pallone 3D, sospeso in `playing` dal 7.917 | stesso criterio sul pallone del Campo2D | ✅ 1,44 s · 58,0% in moto · 999 coppie | ✅ cade: 2,42 s · 10,8% (sabotaggio «pallone-visto-fermo») |
| trama | cieco (0 passi) | **strumento**: il testimone lo scrive il drift 7.524, spento sotto il motore | stessa rotta sui battiti del motore | ✅ 3,0°/passo · svolte >45° 0,0% · 280 coppie | ✅ cade: 89,2° (sabotaggio «rotta-ballerina») |
| bg-sync | verde ma rosso che non cade (regime `__CPM_NO870`) | **strumento**: giudicava un regime spento | distanza pallone↔fatto della riga | ✅ 4/71 = 5,6% (soglia 10%) | ✅ cade: 30/85 = 35,3% (`__CPM_NO_G151C`) |
| bg-continuity | cieco (0 righe) | **strumento**: legge `bp`, nullo a motore acceso | salto pallone↔punto dichiarato | ✅ 0/111 = 0,0% (soglia 5%) | ✅ cade: 17/124 = 13,7% (`__CPM_NO_G151C`) |
| bg-decision | rosso che non cade (70,0%) | **strumento**: a motore acceso `pd=dec` per costruzione (159/159) | fedeltà del fatto narrato al registro del motore | ✅ 124/126 = 98,4% · varietà 83,3% | ✅ cade: 14/168 = 8,3% (sabotaggio «fatto-inventato») |
| bg-rhythm | rosso 1,01-1,23× | **gioco**: il narratore ha un solo respiro per tutte le fasi | invariato | ✅ **1,44×** (correzione G167) | ✅ cade: 0,95× (`__CPM_NO_G167`) |
| cronaca-motore-167 (nuovo) | 15/272 righe = 5,5% con un fatto di 2' prima | **gioco**: dopo un highlight il narratore racconta i fatti di prima | quota fatti vecchi ≤ 2% | ✅ 0/263 = 0,0% | ✅ cade: 10/268 = 3,7% (`__CPM_NO_G167F`) |

Catena dell'area (motore + partita): vedi §6.

## 1. Le due sonde di misura

- `tests/visual/sonda-cronaca-167.mjs` (strumento, non guardiano): partita vera a motore acceso, campionamento in pagina di pallone
  3D, pallone del motore, stato del possesso, scena, trattenute. È la misura che ha separato il pallone 3D (fermo 57 s, 0,0%) dal
  pallone del motore (62,1% in moto, striscia 2,3 s).
- `tests/visual/lib/cronaca-motore.mjs` (libreria comune dei guardiani riscritti): gioca una partita vera fino al fischio (evento,
  con uscita per stallo 240 s) e raccoglie **alla sorgente**:
  - `ticks`: stato del motore dopo OGNI battito (minuto e sotto-tick), avvolgendo `tick` dell'oggetto motore (`__CPM_MOTORE_OBJ`);
  - `fatti`: i fatti che ogni `tick` restituisce (tipo + uomini), cioè ciò che il narratore riceve;
  - `b2d`: il pallone disegnato dal Campo2D, fotogramma per fotogramma (testimone nuovo `__CPM_B2D167`);
  - `nar`: ogni riga del narratore nell'istante in cui esce, col pallone del motore accanto (testimone nuovo `__CPM_NAR167`).
  I due testimoni sono inerti (solo push, solo se la sonda li definisce).
- **Sabotaggi dal banco** (solo bracci rossi; precedente nel repo: il braccio rosso del guardiano «tema unico» si fa alterando dal
  banco di prova, non rimettendo il vecchio codice): `pallone-visto-fermo`, `rotta-ballerina`, `fatto-inventato` — descritti in testa
  alla libreria. Rompono davvero il comportamento sorvegliato, dal test, senza toccare il gioco. Dove esisteva un interruttore vero del
  gioco che rompe il comportamento, ho usato quello (`__CPM_NO_G151C`, `__CPM_NO_G167`, `__CPM_NO_G167F`).

## 2. Strumento per strumento: criterio vecchio, criterio nuovo, perché non è più permissivo

### ball-alive
- **Misura.** Sul ramo 162 (motore acceso): striscia 14,0 s, 0,0% in moto. Sonda: pallone 3D fermo 57 s, pallone del motore in moto
  62,1%. In `playing` il canvas visibile è il Campo2D (`data-cpm="vista2d"`, 7.917): il 3D resta montato ma sospeso. **Difetto dello
  strumento.** I 10,8-14,5 s dei giri precedenti erano il 3D congelato.
- **Vecchio:** striscia ≤ 2,0 s e % in moto ≥ 25 sul pallone 3D campionato a 120 ms per 4 minuti reali; grazia fermo/out/piazzato 6 s
  e kickoff 10 s da `__CPM_HOLD`; rosso `__CPM_NO511` ritirato dal 7.532.
- **Nuovo:** stesse soglie (2,0 s · 25%), stesse grazie con gli stessi tetti (fermo/rete 6 s, kickoff 10 s) lette dallo stato vero del
  motore a ogni battito, sul pallone del Campo2D (un campione per fotogramma disegnato), due partite intere.
- **Perché non è più permissivo:** soglie e tetti identici; la «scena» dichiarata dal motore non è graziata; il campione copre 2×90'
  invece di ~140 s di gioco; la prova del rosso torna ad esistere.

### trama
- **Misura.** Cieco: `__CPM_TRAMA527` è scritto solo nel drift del 7.524 (ramo `if(!MOTORE870||_inHL77)`), che in `playing` a motore
  acceso non gira. **Difetto dello strumento.**
- **Vecchio:** deviazione ≤ 25°/passo e svolte >45° ≤ 16% sui passi interni della giocata (ng=0), 5 partite, minimo 40 coppie; rosso
  `__CPM_NO527` ≥ 38°.
- **Nuovo:** stesse soglie, stesso minimo, stesse 5 partite, sul pallone del motore a ogni battito; passo interno = due battiti
  consecutivi in tenuta dello stesso portatore, mosso di 0,15-6 unità (come prima); cambio portatore/stato = cambio giocata.
- **Perché non è più permissivo:** soglie e campione identici; i voli sono esclusi apposta (un passaggio è una retta per costruzione:
  contarli gonfierebbe il verde).

### bg-sync
- **Misura (giro 162):** a motore acceso 74/74 righe senza bersaglio; nel regime `__CPM_NO870` il rosso `__CPM_NO485` non cade.
  A motore acceso la riga non comanda il pallone: lo descrive. **Difetto dello strumento** (giudicava un regime che il PO non gioca).
- **Vecchio:** frazione del tragitto `bp` percorsa prima della riga dopo, mediana ≥ 50%, coppie sotto un terzo ≤ 15%, minimo 12, regime
  `__CPM_NO870`, rosso `__CPM_NO485`.
- **Nuovo:** per ogni riga del narratore con il luogo del fatto (tratto from→to del motore) la distanza in metri dal pallone del motore
  all'uscita; fuori sincrono oltre 15 m (la distanza del giro 151); quota ≤ 10%, minimo 40 righe, partita vera.
- **Perché non è più permissivo:** tolleranza 15% → 10%, minimo 12 → 40, regime vero; copre tutte le righe con un luogo (partita2d-151
  giudica solo tiri e cross). Residuo nel verde: 4 righe su 71, tutte cambi di gioco/aperture (il pallone in volo lungo esce dal tratto
  dichiarato) — non è un difetto che ho misurato oltre.

### bg-continuity
- **Misura:** cieco (0 righe), stessa causa di bg-sync. **Difetto dello strumento.**
- **Vecchio:** salto pallone→`bp` oltre mezzo campo (50 u) ≤ 5%, gol esclusi, minimo 12; rosso `__CPM_NO498`.
- **Nuovo:** salto pallone del motore→punto dichiarato dalla riga (`to`, cioè il `bpos` del narratore), stesse unità, stessa soglia
  50 u / 5%, gol esclusi, minimo 40 righe, tre partite intere.
- **Perché non è più permissivo:** soglia identica, minimo più grande, regime vero.

### bg-decision
- **Misura:** a motore acceso 159/159 righe con `pd==dec`: il narratore non porta una famiglia e riceve `pd=_dec499`. Il giudizio
  vecchio è vero per costruzione. **Difetto dello strumento.**
- **Vecchio:** accordo esatto ≥ 60%, varietà ≥ 55%, minimo 15, campione 40, regime `__CPM_NO870`, rosso `__CPM_NO499`.
- **Nuovo (fedeltà):** quota di righe il cui fatto (tipo) è fra i fatti restituiti dal motore nei 3 s prima dell'uscita e il cui uomo
  nominato è quello del fatto; soglia **90%**; varietà ≥ 55%, minimo 15, campione 40 invariati.
- **Perché non è più permissivo:** soglia 60% → 90%, e il giudizio non può essere vero per costruzione (un fatto inventato non sta nel
  registro). Residuo nel verde: 2 righe «calcio d'inizio» al 1', il cui fatto nasce prima che la sonda abbia avvolto il motore.
- Nota sul rosso: il tiro finto si inietta «un battito di decisione su tre», ma dal 7.912 decide ogni sotto-tick, quindi i tiri finti
  sono molti (152 righe): il rosso cade di molto, non di poco.

### bg-rhythm — difetto del GIOCO
- **Misura:** lo strumento gioca già la partita vera e legge fase e minuto dal registro: misurava il comportamento attuale. Rosso
  1,00-1,23× (giro 162: 1,01-1,13×). Causa nel codice: dopo una riga del narratore `bgCoolRef` vale 0 sulle righe minori in ogni fase
  (src/15, `(ev&&ev._motore870)?(_sc681?4:(_imp?1:0))`): la regola di fase del 7.501 vive solo nella cronaca pescata.
- **Correzione** (rosso `__CPM_NO_G167`): in costruzione, dopo una riga, il minuto seguente lo interrompe solo un fatto da area
  (priorità ≥ 7: murato, tiro, parata, palo, gol, rigore); sviluppo e pericolo invariati. Lettura della fase, nessun sorteggio.
- **Criterio, soglia (1,30×), minimo (8 coppie per fase), campione (6 partite) invariati.** Verde 1,44× (costruzione 1,75 contro
  sviluppo 1,22 minuti), rosso 0,95×. Costo misurato: −12% di righe per partita (78-81 → 64-72), quasi tutte righe minori di
  costruzione (coppie di costruzione 51 → 16).

### cronaca-motore-167 — guardiano nuovo, difetto del GIOCO
- **Misura** (4 partite, registro dei fatti di ogni tick): 15 righe su 272 (5,5%) raccontavano un fatto di due minuti prima, sempre a
  cavallo di un highlight (esempio: fatto «fuori» del 3' alle 12,1 s, poi 6,4 s senza battiti per la scena, riga al 5' «Colombo allarga
  troppo: la palla esce»). I fatti del minuto prima della scena restano nel raccoglitore e al primo battito dopo la scena vincono per
  priorità; nel caso misurato il battito dopo la scena non porta nessun fatto fresco.
- **Correzione** (rosso `__CPM_NO_G167F`, src/15 in `narra870`): un fatto più vecchio del minuto precedente (il gol no) scende sotto i
  fatti freschi; se nel battito ci sono solo fatti vecchi la riga non esce, e i loro conti (tiri, falli, angoli — `ms`, che alimentano
  statistiche a schermo e momentum) passano alla prossima riga (`msPend167Ref`), come già fa la regola 151C. Una prima stesura (solo
  declassare, e raccontare come prima se c'erano solo fatti vecchi) **non aveva effetto** (7/133 contro 7/138): ritirata e rifatta.
- **Guardiano:** quota di righe con un fatto di 2' o più ≤ 2%, almeno 80 righe, ogni partita al fischio oltre l'85' (sotto = non
  giudicato = rosso). Soglia fissata dopo la misura: verde 0,0%, rosso 3,7% (margine stretto sul rosso: vedi domande).

## 3. Una correzione tentata e ritirata (No Blind Fix)

La «decisione» `_dec499` concorda con il pallone del motore all'uscita della riga solo nel 54,5-59,8% delle righe (es. intercetto a
x 83 con decisione `midfield`). Ho provato a farla leggere dal pallone del motore invece che da `ballPosRef` (rosso `__CPM_NO_G167D`):
**effetto nullo** (59,5% contro 59,3%), perché la lettura avviene comunque prima del battito del minuto, che recupera fino a 22
sotto-tick. Correzione tolta dal codice; la causa resta aperta (domanda 2).

## 4. Cambiamenti (file e righe)

- `src/15-live-match.jsx` (+ `CARRIER-MANAGER-AV.html` ricostruito):
  - r. ~1097: testimone `__CPM_B2D167` nel Campo2D (inerte);
  - r. ~3421-3445: `narra870` — fatti vecchi declassati e taciuti con conti riportati (`_no167f`, `_vec167`, `_pr167`, `_ms167`), soglia
    del respiro in costruzione (`_sog167`);
  - r. ~3504: conti in attesa aggiunti alla prossima riga; r. ~3527: `msPend167Ref`;
  - r. ~6294 (chiamata del narratore): `costr167`; r. ~8154: testimone `__CPM_NAR167` (inerte); r. ~8214: `bgCoolRef` in costruzione.
- `tests/visual/lib/cronaca-motore.mjs` (nuovo), `tests/visual/sonda-cronaca-167.mjs` (nuovo, strumento).
- Riscritti: `ball-alive-test.mjs`, `trama-test.mjs`, `bg-sync-test.mjs`, `bg-continuity-test.mjs`, `bg-decision-test.mjs`
  (ciascuno con in testa criterio vecchio/nuovo e motivo); `bg-rhythm-test.mjs`: solo il braccio rosso (`__CPM_NO_G167`) e la nota.
- Nuovo guardiano `tests/visual/cronaca-motore-167.mjs`, script npm `cronaca-motore-167`.
- Nessuno dei sette guardiani è nella catena `completa` di `ci-runner.mjs`: non l'ho cambiata (domanda 5).

## 5. Esiti dei guardiani della cronaca (numeri)

Vedi tabella in testa: tutti e sette verdi col verde e rossi col rosso, un controllo alla volta.

## 6. Catena dell'area (motore + partita)

**Controlli richiesti a parte** (build `708dd0d`, uno alla volta):

| controllo | esito | numeri |
|---|---|---|
| highlight-95 (`CPM_D3DIAG=1 node highlight-95.mjs`) | ✅ verde e il rosso si vede | verde 103 highlight · D4 senza esito 0 · passaggi arrivati 93,9% · rosso 114 highlight · D4 senza esito 7 |
| distanze-126 verde (`CPM_TMAX=10^9`) | ✅ | 24/24 partite finite · 55 tiri, max 29 m, 0 oltre 30 · 16 dal limite, max 21,7 · 11 teste, max 14 |
| distanze-126 rosso | non rieseguito | il giro non tocca i rimedi del 126; misurato cadere nel giro 162 |

**Catena `completa`** (`CPM_CI_PAR=0 node ci-runner.mjs completa`, 97 passi, build `708dd0d`):
- una prima corsa (build `97e8101`) l'ho fermata io al passo 11 per correggere i conti dei fatti taciuti (`708dd0d`): non vale;
- la seconda corsa è arrivata a **90 passi su 97** (83 verdi, 7 rossi, 0 instabili) ed è stata **interrotta dal riavvio del container**
  (uptime 0 al rientro) durante `schede-260`. Per la regola del repo una corsa interrotta non vale: i 7 passi mancanti li ho eseguiti a
  parte (sotto) e lo dichiaro come tale.
- Fra i verdi: validate-situations (gate), partita-vera, highlight-95, replay, save-compat, career-critical, test:logic, test:vision,
  typing-shortcuts.
- I 7 rossi, ognuno confrontato con la base `428d86d` (ramo del giro 162) in un worktree separato:

| rosso | messaggio | sulla base 428d86d |
|---|---|---|
| grafica-v2 | classifica: «riga tua non nel colore del club» (6 schermate) | ❌ identico → preesistente |
| parata-100 | «nessuna parata sul ramo cross_goal» (non giudicato), 8 parate | ❌ identico (8 parate, 0 cross_goal, stessi conteggi per seme) → preesistente |
| spazio-296 | distanze oltre 10 px su menu-home/opzioni/post-partita | (vedi sotto) |
| pagella-75 | «nessuna partita con un gol dell'eroe in gioco fluido» (non esercitato) | (vedi sotto) |
| scena-motore-147 | «zona di partenza senza il punto del motore» (una scena al 73' in una corsa, al 52' nell'altra) | (vedi sotto) |
| convocazione-235 | prima-convocazione 412px: verdetto «NO» | (vedi sotto) |
| crediti-254 | voce «Mixkit 3022» assente dalla pagina crediti | (vedi sotto) |

## Domande aperte (per la sessione madre, nessuna decisione presa qui)

1. **Sabotaggi dal banco come bracci rossi** (ball-alive, trama, bg-decision): li ho scelti perché nessun interruttore del gioco rompe
   quei comportamenti senza spegnere tutto il motore (`__CPM_NO870` rende la sonda cieca, non rossa). Vanno bene, o si preferisce un
   interruttore del gioco dedicato?
2. **La decisione/fase è letta un battito prima dei fatti narrati** (accordo col pallone vero 54-60%): rileggerla dopo il battito del
   minuto vuol dire spostare costanti usate da molti sistemi (fase, ritmo, gridi del mister). Da fare in un giro dedicato?
3. **cronaca-motore-167**: margine del rosso stretto (3,7% contro soglia 2%; verde 0,0%). Si vuole un campione più grande (6 partite)?
4. **Fatti vecchi taciuti**: dopo un highlight un tiro avvenuto prima della scena non viene più raccontato (i suoi conti sì). Si
   preferirebbe raccontarlo al passato («prima della scena…»)? È una scelta di testo, quindi del PO.
5. **Catena:** i sette guardiani della cronaca non sono in nessuna catena di `ci-runner`. Entrano nella `completa`?
6. **bg-sync**: le 4 righe fuori sincrono del verde sono tutte cambi di gioco/aperture (pallone in volo lungo fuori dal tratto
   dichiarato). Da indagare come difetto del narratore o del volo?

## Note di processo

- Roadmap non aggiornata: ramo di sviluppo senza bump di versione, non un rilascio.
- Un mio errore all'inizio: un `node -e "import('./ci-runner.mjs')"` per leggerne la lista ha avviato davvero la catena; fermata dopo
  pochi secondi, nessun file toccato (`docs/governo/STABILITA.json` invariato, verificato con `git status`).
- La catena `completa` gira con `CPM_CI_PAR=0`; `free -m`/`df -h` li ho presi all'avvio della catena e prima di ogni controllo fuori
  catena, non fra un passo e l'altro dentro `ci-runner` (che non lo prevede).
