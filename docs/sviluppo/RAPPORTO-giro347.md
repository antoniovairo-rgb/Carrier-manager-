# Giro 347 — Taratura dei gol del motore della simulazione (PO-599)

Ramo `sviluppo/giro347-gol-motore`, partito da `lavoro/201` (fd2b933). `GAME_VERSION` non toccato (rilascio automatico del vagone).

Domanda del PO (21/11, dubbio 1 del giro 310): «Tarare i gol del motore». Il motore della simulazione rapida segnava 2,2-2,4 gol a
partita contro i 3,22 della Bundesliga 2023/24 (985 gol in 306 partite, fonte citata nel rapporto del giro 309:
[Wikipedia, 2023–24 Bundesliga](https://en.wikipedia.org/wiki/2023%E2%80%9324_Bundesliga)); `sim-motore` era rosso di un soffio
(2,29 contro la soglia 2,3) e dichiarato in `docs/governo/ROSSI-DICHIARATI.json` fino a questa taratura. Bersaglio PO: 2,6-2,9.

---

## In breve

1. **Una sola manopola, solo nella simulazione rapida.** In `esitoTiroV2` (`src/14-motore-possesso.jsx`) ogni tiro su azione vale
   `GOL347_K = 1,25` volte il suo xG quando il motore e' acceso con `cfg.gol347`, che passa **solo** `simulaPartitaMotore`. Rigore
   (0,76) e punizione diretta (≤0,06) restano il loro xG. Gestione del vantaggio (giro 19/98) e debito dell'eroe (7.999.36) restano a
   valle, invariati. La partita vissuta (live e «solo momenti salienti») non riceve `gol347` e non cambia.
2. **Gol: 2,33 → 2,80 a partita** su 17.136 partite (14 leghe × 1.224), tutte le leghe fra 2,68 e 3,08.
3. **Il rosso `window.__CPM_NO_G347` e' la taratura di oggi bit per bit**: le 17.136 partite del braccio rosso, misurate dopo la
   modifica, sono identiche (stesso JSON) a quelle misurate sul codice di partenza. Nessun sorteggio aggiunto.
4. **`sim-motore` e' verde** (200 partite a pari forza 70-70: gol 2,89, pareggi 24%) con la sua soglia **invariata** 2,3-3,5.
   La soglia NON era dichiarata provvisoria: e' la banda del banco del prototipo (4.337 partite vere, football-data.co.uk, commento
   nel guardiano), quindi il guardiano non l'ho toccato. Tolto da `ROSSI-DICHIARATI.json` (verde 3 volte su 3 su semi fissi: vedi §5).
5. **Guardiano nuovo `npm run gol-347`** (riga `src/14` della MAPPA), verde col verde, rosso con `CPM_NO_G347=1`.

---

## 1. Dove e cosa

| file | cosa |
|---|---|
| `src/14-motore-possesso.jsx` | `const GOL347_K=1.25` accanto a `TAL202_K`; in `esitoTiroV2`, dopo il talento dell'eroe e prima della resa delle scene, `xg*=GOL347_K` se `cfg.gol347` e non rigore/punizione, rosso `__CPM_NO_G347`, `__CPM_GOL347_K` solo per tarare; `simulaPartitaMotore` passa `gol347:true` |
| `CARRIER-MANAGER-AV.html` | ricomposto con `tools/build-src.mjs` (check-src identico) |
| `tests/visual/gol-347-test.mjs` + script `gol-347` | guardiano (sotto) |
| `tests/visual/ci-runner.mjs` | `gol-347` nella riga `src/14` della MAPPA (mappa-unica verde) |
| `tests/visual/misura-347.mjs` · `misura-347-analisi.mjs` | sonde di misura (uscite in `tests/visual/out/misura-347/`, non versionate) |
| `docs/governo/ROSSI-DICHIARATI.json` | tolta la voce `sim-motore` |

**Fuori ambito (non toccato):** partita vissuta, Poisson delle altre partite della lega (`updateStandings`), voto simulato, gol e assist
dell'eroe del tabellino (`_pSimStats`, sorteggio a parte), infortuni (`simInjuryRoll` dipende da seme, fatica e quota di minuti, non dal
risultato: `src/18-career-app.jsx` r.2303), cartellini (stessa esecuzione, nessun legame col fattore).

**Perche' un fattore sull'xG e non piu' tiri.** Moltiplicare la pericolosita' di ogni tiro per lo stesso numero lascia invariato il
rapporto fra le xG delle due squadre (la forza relativa entra gia' in `xgV2` con `exp(forzaXg·vantaggio)` e nel numero dei tiri, che non
cambia: 22,6 → 22,5 a partita) e non consuma numeri casuali in piu'. Lo xG del tabellino sale con i gol (2,33 → 2,79): il motore segna
quanto il suo xG, come prima.

## 2. Misura prima / dopo

Sonda `misura-347.mjs`: per ogni lega con 18 club, ogni club fa da squadra dell'eroe per 2 stagioni col calendario vero
(`legaDopoTrasferimento212`) e i semi del gioco (`standingsSeed(club,stagione,settimana)+giornata·31+1`), percorso Simula
(`simulateMatch(…,{motore:true})`), OVR dell'eroe = prestigio del club (fra 50 e 90). «Prima» = codice di partenza; «dopo» = braccio
verde. Cartellini di squadra dalla stessa esecuzione. 1.224 partite per lega, 17.136 in tutto per braccio.

### 2a. Per lega

| lega | partite | gol prima | gol dopo | pareggi | vittorie della squadra di casa | punti a partita: forte / debole (scarto ≥10) |
|---|---|---|---|---|---|---|
| **tutte** | 17136 | 2,33 | **2,80** | 24,6% → 20,4% | 44,3% → 46,9% | 2,05 / 0,73 → 2,10 / 0,71 |
| Lega A | 1224 | 2,28 | **2,71** | 23,9% → 19,3% | 43,8% → 47,6% | 2,10 / 0,68 → 2,16 / 0,67 |
| Premier Division | 1224 | 2,44 | **2,94** | 23,7% → 19,9% | 43,4% → 44,6% | 2,08 / 0,69 → 2,10 / 0,72 |
| Liga Ibérica | 1224 | 2,32 | **2,75** | 23,1% → 19,0% | 43,9% → 46,8% | 2,14 / 0,66 → 2,17 / 0,66 |
| Deutsche Liga | 1224 | 2,34 | **2,78** | 22,3% → 20,4% | 45,2% → 46,4% | 2,03 / 0,77 → 2,03 / 0,76 |
| Ligue Nationale | 1224 | 2,29 | **2,73** | 23,4% → 19,0% | 45,8% → 48,5% | 1,96 / 0,82 → 2,11 / 0,71 |
| Liga Lusitana | 1224 | 2,33 | **2,76** | 23,1% → 19,0% | 43,8% → 46,4% | 2,15 / 0,63 → 2,28 / 0,55 |
| Liga Oranje | 1224 | 2,32 | **2,79** | 22,5% → 18,4% | 44,3% → 48,4% | 2,17 / 0,62 → 2,19 / 0,65 |
| Liga Belga | 1224 | 2,52 | **3,08** | 25,2% → 20,1% | 44,0% → 47,0% | 2,00 / 0,76 → 2,04 / 0,77 |
| Liga Anatolica | 1224 | 2,29 | **2,74** | 23,5% → 19,0% | 43,7% → 48,3% | 1,97 / 0,82 → 2,07 / 0,78 |
| Lega B | 1224 | 2,24 | **2,74** | 28,8% → 22,9% | 41,4% → 45,3% | 1,72 / 0,96 → 1,89 / 0,89 |
| Championship | 1224 | 2,36 | **2,87** | 27,5% → 23,0% | 46,3% → 47,9% | 2,25 / 0,38 → 1,88 / 0,75 |
| Deutsche Liga 2 | 1224 | 2,39 | **2,86** | 25,7% → 21,0% | 45,3% → 48,6% | 1,82 / 0,93 → 1,82 / 0,95 |
| Ligue Nationale 2 | 1224 | 2,29 | **2,68** | 25,3% → 23,3% | 43,0% → 42,9% | 1,95 / 0,84 → 2,05 / 0,80 |
| Liga Ibérica 2 | 1224 | 2,26 | **2,74** | 26,5% → 20,8% | 45,8% → 48,1% | 2,01 / 0,71 → 1,97 / 0,84 |

⚠️ La colonna «forte / debole» per lega poggia su poche partite nelle leghe strette (Championship: prestigi da 46 a 56, quasi nessuna
coppia con scarto ≥10): lo spostamento 2,25/0,38 → 1,88/0,75 e' rumore di campione, il dato da leggere e' quello di «tutte» e §2c.

### 2b. Distribuzione dei punteggi (tutte le leghe, orientamento ignorato)

| punteggio | prima | dopo |
|---|---|---|
| 0-0 | 9,6% | 5,7% |
| 1-0 / 0-1 | 21,7% | 16,7% |
| 1-1 | 11,0% | 9,6% |
| 2-0 / 0-2 | 14,9% | 12,9% |
| 2-1 / 1-2 | 12,8% | 13,6% |
| 2-2 | 3,4% | 4,1% |
| 3-0 / 0-3 | 10,1% | 11,1% |
| 3-1 / 1-3 | 6,2% | 8,2% |
| 5 gol o piu' | 7,9% | 14,4% |
| punteggi distinti · entropia | 27 · 3,32 bit | 31 · 3,59 bit |

Non ho confrontato questa distribuzione con una fonte verificata di distribuzione dei punteggi reali: non posso confermare quanto sia
vicina al calcio vero. Il solo riferimento esterno usato e' la media di 3,22 gol della Bundesliga 2023/24.

### 2c. Forza relativa: la piu' forte, per scarto di prestigio (V / N / P, %)

| scarto | prima | dopo | partite |
|---|---|---|---|
| 0-4 | 39,8 / 26,4 / 33,8 | 43,3 / 21,3 / 35,4 | 5.824 |
| 5-9 | 46,6 / 25,7 / 27,7 | 48,7 / 22,2 / 29,1 | 4.672 |
| 10-19 | 56,2 / 23,8 / 20,1 | 59,4 / 19,5 / 21,1 | 4.168 |
| 20+ | 69,6 / 18,9 / 11,5 | 73,1 / 15,3 / 11,6 | 2.200 |
| pendenza differenza reti / differenza di prestigio | 0,053 | 0,063 | |

L'ordine delle forze resta lo stesso in ogni fascia e la sconfitta della piu' forte resta quasi ferma (+0 / +1,6 punti): i pareggi in
meno diventano soprattutto vittorie della forte. E' l'effetto atteso di piu' gol con lo stesso rapporto di pericolosita' (con piu' gol
pesa meno il caso); la pendenza sale del 19%, meno dei gol (+20%).

### 2d. Strisce (giro 309), stampo (giro 310), cartellini, casa

| misura | prima | dopo |
|---|---|---|
| striscia di sconfitte piu' lunga per stagione (media) | 3,35 | 3,59 |
| stagioni con ≥5 sconfitte di fila | 20,4% | 23,6% |
| stagioni con ≥8 sconfitte di fila | 1,8% | 3,2% |
| P(sconfitta \| sconfitta prima) contro P(sconfitta) | 0,405 contro 0,384 | 0,423 contro 0,408 |
| punteggi distinti per stagione (stampo del giro 310) | 13,9 | 15,8 |
| striscia di punteggio identico (media per stagione) | 2,17 | 2,02 |
| gialli a partita: squadra dell'eroe / avversario | 2,09 / 2,22 | 2,09 / 2,23 |
| rossi a partita: squadra / avversario | 0,085 / 0,098 | 0,083 / 0,103 |
| gialli dell'eroe a partita · rossi dell'eroe | 0,117 · 0,0083 | 0,117 · 0,0078 |
| vittorie in casa / pareggi / vittorie in trasferta | 44,3 / 24,6 / 31,1% | 46,9 / 20,4 / 32,7% |

- **Nessun effetto a cascata**: lo scarto fra P(S|S) e P(S) passa da 0,021 a 0,015.
- Le strisce di sconfitte si allungano un po' perche' con meno pareggi ci sono piu' sconfitte (P(S) 0,384 → 0,408), non per una
  dipendenza fra partite. Le stagioni con 8 di fila passano da 1,8% a 3,2% (dentro il 3,1-3,8% del riferimento Poisson del giro 309).
- Lo stampo resta vario (piu' punteggi distinti, strisce di punteggio identico piu' corte).
- Cartellini: invariati entro il rumore.
- Infortuni: invariati per costruzione (vedi §1); `bilancio-310` (braccio D) lo giudica nel rituale.

## 3. Guardiano `npm run gol-347`

`tests/visual/gol-347-test.mjs`, pagina senza grafica, 840 partite a semi fissi (60 per lega su 14 leghe), ~1 minuto:

| braccio | cosa giudica | esito |
|---|---|---|
| A verde | gol 2,6-2,9 · pareggi 18-34% (banda di sim-motore) · punti della forte di 10+ > punti della debole + 0,9 | gol 2,72 · pareggi 22,0% · 2,00 contro 0,79 ✅ |
| B | stesso seme = stessa partita; `__CPM_GOL347_K=1` = rosso bit per bit (l'unica differenza e' il fattore) | true · true ✅ |
| C | rosso `window.__CPM_NO_G347` nella stessa pagina: gol < 2,5 | 2,28 ✅ |
| D (statico) | `gol347:true` acceso in un punto solo di `src/14`, nessun altro frammento lo cita | 1 · nessuno ✅ |
| `CPM_NO_G347=1` | il verde nasce spento: il guardiano DEVE uscire rosso | ❌ «A: gol 2,28 fuori da 2,6-2,9», uscita 1 ✅ |

## 4. Rituale

`node ci-runner.mjs giro sim-motore gol-347 bilancio-310 career-critical match-sequence replay career-sim` (+ 17 sentinelle):

**22/22 verdi** sul build del ramo (`GAME_VERSION` 7.999.206, invariata), nessun passo riprovato:

| passo | esito | passo | esito |
|---|---|---|---|
| sim-motore | ✅ 19 s | gol-347 | ✅ 194 s |
| bilancio-310 (A stampo · B forza unica · C yo-yo · D infortuni · E gialli · F voto) | ✅ 90 s | career-critical | ✅ 325 s |
| match-sequence | ✅ 979 s | replay | ✅ 74 s |
| career-sim | ✅ 31 s | partita-vera (partita vissuta: invariata) | ✅ 684 s |
| 14 sentinelle restanti (mappa-unica, test:logic, save-compat, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, battito-264, gk-dive-sync, schermate-97) | ✅ | | |

Registro in `docs/governo/STABILITA.json` (scritto da `ci-runner.mjs`). Inoltre: `tools/check-src.mjs` (ricomposto = frammenti) e
`npm run mappa-unica` verdi.

## 5. `sim-motore` e i rossi dichiarati

- Soglia 2,3-3,5 **non provvisoria** (banda del banco del prototipo): invariata.
- Verde in tre esecuzioni (due a mano, una nel rituale), sempre 2,89 gol e 24% pareggi: le 200 partite hanno semi fissi, quindi il
  risultato e' deterministico e il verde e' stabile per costruzione finche' il motore non cambia.
- Voce tolta da `docs/governo/ROSSI-DICHIARATI.json`. ⚠️ Dal giro 338 quel file si legge **da main**: la voce sparisce davvero quando
  il vagone arriva su main.

## 6. Dubbi per il PO

**Dubbio 1 — La partita vissuta segna ancora come prima.** Il giro 309 aveva misurato il motore coi parametri del live a 2,40 gol;
ora la simulazione rapida e' a 2,80. Simulare o giocare la stessa partita non da' piu' gli stessi gol attesi (le squadre sono le stesse,
la pericolosita' no).
- **A (consigliata): misurare prima la partita vissuta su partite vere** (sonda `partita-vera` / statistiche-228 su 40 partite) e, se
  resta sotto 2,6, estendere lo stesso fattore anche lì in un giro dedicato: tocca guardiani lunghi (statistiche, gol dell'eroe 0,6-0,9,
  debito 36) che vanno rigiocati.
- B: lasciare la vissuta com'e': il giocatore vede partite più «chiuse» di quelle che simula.
- C: estendere subito il fattore alla vissuta senza misura dedicata (sconsigliata: *No Blind Fix*).

**Dubbio 2 — Bersaglio: 2,80 sta in 2,6-2,9, ma due leghe escono dalla banda (Premier 2,94 · Liga Belga 3,08).**
- **A (consigliata): tenere 1,25** — la banda del PO e' sulla media, e la differenza fra leghe c'era gia' prima (Belga 2,52 contro 2,28).
- B: scendere a 1,22 (misurato 1,20 → ~2,65 su Lega A/Lega B): media ~2,72, Belga ~3,0.
- C: fattore per lega (piu' preciso, ma una tabella da mantenere e da giustificare con fonti per lega che oggi non ho).

**Dubbio 3 — Meno pareggi (24,6% → 20,4%) e piu' goleade (≥5 gol 7,9% → 14,4%).** Effetto diretto di piu' gol. Non ho una fonte
verificata sulla quota di pareggi o di partite da 5+ gol nei campionati veri: non posso confermare se 20% e 14% siano realistici.
- **A (consigliata): accettare** e far verificare il dato con una fonte (es. football-data.co.uk, stagioni 2023/24) prima di
  toccare altro.
- B: alzare i gol solo fino a 2,6 (fattore ~1,15) per perdere meno pareggi.
- C: ritoccare la gestione del vantaggio (gradini 0,45/0,30/0,20) per frenare le goleade — tocca anche la partita vissuta.
