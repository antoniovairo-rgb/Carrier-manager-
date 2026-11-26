# Giro 386 — i rossi della 197 «già rossi nella 196» (PO-516)

Base: `lavoro/201` @ 29d758c8. Ramo: `sviluppo/giro386-rossi-197`. GAME_VERSION e `docs/governo` non toccati.
Voce: PO-516 (BACKLOG; DECISIONI 18/11 14:10; ROADMAP 7.999.197) — «Già rossi nella 196 → 198».

## 1. Da dove si parte (prima di toccare)

Fonti controllate: `docs/governo/STABILITA.json`, `ROSSI-DICHIARATI.json` (su main), e il **treno grande di stanotte**
(corsa 45735203524, 26/11, 384 guardiani, 31/31 parti, artifact `riepilogo-totale`).

| guardiano | treno grande 26/11 | ROSSI-DICHIARATI | banco (questo giro, punta 29d758c8) |
|---|---|---|---|
| tabellone-214 | ✅ 402 s | — | ✅ verde, rossi C (`__CPM_NO_G214`) ed E (`__CPM_NO_G216`) visti |
| ripartenza-235 | ✅ 270 s | — | ✅ verde, rosso `__CPM_NO_RIP235` visto (anche ripartenza-piazzato-27) |
| lotteria-191 | ✅ 232 s | — | ✅ verde, tre rossi B/C/D visti |
| squalifica-222 (instabile) | ✅ 61 s | — | ✅ verde 1/1 · `CPM_ROSSO=1` rosso (9 controlli falliti) |
| stadi-071 (instabile) | ✅ 86 s | — | ❌ **3 rossi su 5** con la lettura di prima |
| rassegna-200 | 🟧 rosso noto (13/14) | «rosso identico alla base» | ❌ scheda 2 a 1,35 schermi (tetto 1,3) |
| finale-202 | 🟧 rosso noto | «già rosso nel treno della 7.999.200» | ❌ «ancora della simulazione non trovata» |

Quattro dei sette erano già chiusi (giri 272/273 per tabellone-214, ripartenza-235, squalifica-222; lotteria-191 verde nel
treno): li chiudo con la prova del banco qui sopra, senza toccarli.

## 2. Esiti prima / dopo

| guardiano | prima | dopo | causa | dove |
|---|---|---|---|---|
| finale-202 | ❌ cieco (non misurava) | ✅ verde · rosso `CPM_ROSSO=1`/`CPM_NO_G386=1` bocciato | **guardiano cieco**, due strati (sotto) | `tests/visual/finale-202.mjs` |
| rassegna-200 | ❌ scheda 2 1,35 | ✅ braccio A: scheda 2 **1,27** (2 corse: 1,29 → 1,27 dopo il secondo ritocco) · rosso `__CPM_NO_G200` bocciato · rosso del giro `CPM_NO_G386=1` bocciato (1,35) | **difetto del gioco** (scheda troppo lunga su 375×667) | `src/15-live-match.jsx` (connessioni nella rassegna) + `tests/visual/rassegna-200.mjs` (braccio del giro) |
| stadi-071 | ❌ 3/5 | ✅ 3/3 | **guardiano**: misura in un istante a caso di una scena che si muove | `tests/visual/stadi-071.mjs` |
| tabellone-214, ripartenza-235, lotteria-191, squalifica-222 | ✅ | ✅ (non toccati) | già chiusi | — |

### finale-202 — guardiano cieco (non difetto del gioco)

1. L'ancora `forza:{home:+o.forzaH||65,away:+o.forzaA||65},` non esiste più dal **giro 157** (PO-360: le forze passano corrette,
   `_fH157/_fA157`). Il guardiano usciva rosso alla prima riga, senza misurare niente. Ancora nuova, stesse soglie.
2. Riparata l'ancora, la leva misurava **+2,8%** di gol subiti (soglia +12%). Causa misurata: il guardiano inietta la leva della
   partita **vissuta** (`cfg.fin202`) dentro `simulaPartitaMotore`, che dal **giro 347** accende `gol347` — fattore della **sola
   simulazione rapida**, che la partita vissuta non ha mai. Stessi semi, `gol347:false`: senza leva 1,35 gol subiti, con leva 1,733
   (**+28%**), gol fatti 1,40 → 1,05 → verde. Il guardiano ora ricostruisce il contesto della vissuta (`gol347:false`) e si dichiara
   «non giudicato» se l'ancora sparisce.
3. Braccio rosso esplicito: `CPM_ROSSO=1` (o `CPM_NO_G386=1`) toglie la leva anche al secondo braccio → bracci identici → rosso.

### rassegna-200 — difetto del gioco, corretto alla sorgente

Scheda 2 «Voto e giocate» a 375×667 con gol e assist: tabellino · **connessioni** (due riquadri impilati) · tabellino in numeri ·
pagella · mister = 900 px CSS contro 867 di tetto. Rimedio (giro 386, rosso `__CPM_NO_G386`): quando ci sono **entrambe** le
connessioni le due righe stanno **affiancate** (griglia a due colonne, come «in numeri»); nella colonna stretta l'icona passa sulla
riga dei nomi, così l'etichetta («Assist serviti a», «Gol su assist di») non va a capo. Stesso testo, stesso ordine, nessun
contenuto tolto (il controllo «106/106 righe della pagina unica» resta verde). Con una sola connessione tutto com'era.

### stadi-071 — instabile, causa misurata

La vista TV non ha un costo fisso: a camera fissata, nella stessa pagina, i draw call vanno da **186 a 352** in 4 s (borgo, 10
letture ogni 400 ms) e la scena non resta mai ferma 1,8 s entro 25 s. Il guardiano leggeva **una volta** a 1,8 s, quindi confrontava
due istanti a caso (tedesco fra 268 e 337 draw call in cinque corse; rossi su catino, mattoni, arena secondo la corsa).
Ora ogni stadio si legge 20 volte (6 s) e si confronta il **picco** del nuovo col **picco** degli stadi di oggi (+8%, invariato):
la statistica più severa per il nuovo. 3/3 verdi, margine minimo ~10% sotto il tetto. `CPM_NO_G386=1` = lettura singola di prima.
Il rosso del guardiano (`__CPM_NO_STADI246`) resta visto in tutte le corse.

## 3. Cosa NON ho fatto / limiti del banco

- **rassegna-200 braccio B** (partita intera a velocità 2) su questo banco **sfora il tetto di parete di 420 s** in tutte e tre le
  corse; nel treno era verde. Sonda temporanea: la partita finisce in 648 s (92', 4–1), di cui 587 s in `playing` = **6,4 s reali
  per minuto di gioco** (nominale a 2×: ~0,85 s). B non dipende dalla mia modifica (rassegna a fine partita); lo giudica il treno.
- Il verdetto completo di rassegna-200 sul banco resta quindi rosso per B (11/14 con B a 3 ✗); A (soli highlight) 10/10 verde.

## 4. File e funzioni toccati

- `src/15-live-match.jsx` — rassegna di fine partita, blocco «Le connessioni» (`_row` con 5° parametro `_st386`, `_due386`).
  `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs` (check-src: allineato).
- `tests/visual/finale-202.mjs` — ancora, contesto vissuta, braccio rosso.
- `tests/visual/rassegna-200.mjs` — braccio rosso del giro `CPM_NO_G386=1` (solo A).
- `tests/visual/stadi-071.mjs` — `costruisci()`: 20 letture, picco.

## 5. Dubbi per il PO (consigliata per prima, GIÀ APPLICATA)

**D1 — finale-202 guarda una leva spenta.** La leva `fin202` nella partita vera è spenta dal 7.999.137 (brain acceso:
`fin202: brain137() ? null : …`); vive solo col rosso `__CPM_NO_BRAIN137`. Il guardiano protegge quindi un ramo di ritirata.
1. *(applicata)* Tenerlo, riparato, come guardiano del ramo di ritirata: costa 1 s e dice se la ritirata funziona ancora.
2. Ritirarlo dalla mappa insieme alla leva (togliere `fin202` dal motore): meno codice, ma la ritirata del 137 non è più provata.
3. Riscriverlo per misurare la partita vissuta col brain acceso (sbilanciamento reale): è un guardiano nuovo, non questo.

**D2 — scheda 2 della rassegna lunga col contenuto pieno.**
1. *(applicata)* Connessioni affiancate quando sono due (−54 px, nessun testo tolto).
2. Spostare il commento del mister nella scheda 3 (giornali): più margine, ma cambia la lettura decisa nel giro 200.
3. Chiudere di default «Il tuo tabellino in numeri»: margine ampio, ma nasconde numeri chiesti dal PO.

**D3 — partita intera lenta sul banco (6,4 s per minuto a 2×).**
1. *(applicata)* Lasciare il giudizio di rassegna-200 B al treno, dove passa, e dichiararlo qui.
2. Portare il tetto di B sul tempo di scena (minuto di gioco raggiunto) invece che sulla parete, come chiede PROCESSO «Controlli
   instabili»: tocca `lib/partita-166.mjs`, usato da molti guardiani → giro dedicato.
3. Indagare se il metronomo della partita è affamato dal disegno 3D sul banco (giro di misura dedicato).

## 6. Sentinelle

`node ci-runner.mjs giro finale-202 stadi-071` sul commit 8f3ead80 (build con la patch): **19/19 verdi** — finale-202 7 s,
stadi-071 154 s, mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile,
render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97.
rassegna-200 non è nel giro del runner perché il suo braccio B sfora il tetto di parete su questo banco (sezione 3): A, R e il rosso
del giro sono verdi/visti a mano; il verdetto intero lo dà il treno. `STABILITA.json` scritto dal runner è stato riportato com'era
(nessuna modifica a `docs/governo`).
