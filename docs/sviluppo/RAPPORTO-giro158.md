# Giro 158 — Partite simulate: voto dalla pagella del motore e squadra dell'eroe (PO-360)

Ramo `sviluppo/giro158-simulate`, versione di lavoro 7.999.191 (`GAME_VERSION` non toccata).
Contesto: `docs/collaudo/GIRO156-MISURA-SIMULATE.md`, `docs/collaudo/GIRO157-SIMULATE-SQUADRA.md`. Decisioni PO 11/11.

Il giro ha due commit di lavoro:

- `c1f123e` (sessione madre): voto dalla pagella del motore + «marcatura dell'eroe solo col possesso della sua squadra».
- `2a9f476` (questa sessione, 158b): riletto e misurato il primo. **Il voto resta com'era. La marcatura è stata tolta** e
  sostituita dalla correzione della causa (le occasioni simulate dell'eroe). Motivo e numeri al §2.

## In breve

| | prima | dopo |
|---|---|---|
| Voto simulato, salvataggio Primavera del PO (tasto Simula vero) | 5,88 (n 18, 67% sotto 6) | **6,25** (n 17, 23,5% sotto 6) |
| Voto simulato, salvataggio prima squadra del PO (tasto Simula vero) | 6,27 (n 15, 40% sotto 6) | **6,47** (n 15, 26,7% sotto 6) |
| Scarto dal vivo, Primavera: sul dal vivo misurato al giro 156 (6,60) · sullo storico del PO (6,40) | −0,72 · −0,65 | **−0,35 · −0,15** |
| Scarto dal vivo, prima squadra: sul misurato (7,20) · sullo storico (7,60) | −0,93 · −1,22 | **−0,73 · −1,13** |
| Griglia OVR 55-80, voto medio per gruppo (15 gruppi, 160 partite l'uno) | 5,77-6,59 | **6,17-6,81** |
| Griglia, voti sotto 6 | 22,5-66,9% | **5,0-30,0%** |
| Squadra dell'eroe a forza pari, punti a partita (carriera, 2.000 partite) | 1,17 | **1,37** (fondo classifica 1,37; banda 1,29-1,45) |
| Gol fatti-subiti della squadra dell'eroe | 0,90-1,19 | **1,15-1,18** |
| Gol totali a partita (banda di sim-motore 2,3-3,5) | 2,09 | **2,33** |
| `sim-motore`, banda B (le sue 200 partite) | 1,97 rosso | **2,33 verde** |
| Leonessa contro il suo girone (sonda del giro 157), punti a partita | 1,21-1,29 | **1,45** (fondo classifica 1,61) |

Lo scarto del voto col dal vivo si riduce in tutti e quattro i confronti, ma in prima squadra resta largo (−0,73 sul
misurato). ⚠️ I campioni col tasto Simula sono piccoli (15-19 partite: l'errore standard del voto medio è circa 0,12).

Il voto dal vivo non è stato rimisurato in questo giro: il motore della partita vissuta non è cambiato, quindi valgono
i valori del giro 156 (5 partite col pilota automatico per salvataggio: campione piccolo, ordine di grandezza).

## 1. Voto dell'eroe nelle simulate = pagella del motore (decisione PO «C»)

**Com'è fatto** (`src/10-folla-stadi-ritiro.jsx`, `simulateMatch` r.~956-985 e funzioni `_ga158`, `votoSimEroe` r.~986-994):

1. `simulateMatch` chiede al motore il dettaglio (`dettaglio:true`) e legge la pagella dell'eroe **dalla stessa
   esecuzione** che ha deciso il risultato. Nessuna esecuzione in più.
2. Dalla pagella si toglie la quota che il motore dà ai gol e agli assist dell'eroe (`_ga158`: gol 0,75 · 0,55 · 0,55 ·
   poi 0,30, più 0,05 per il tiro in porta; assist 0,50 poi 0,35 — la scala di `pagelle()`, `src/14` ramo `_v29`).
   Il resto si comprime coi minuti giocati come prima (`6 + (v − 6)·(0,3 + 0,7·quota)`): è la **base** (`base158`).
3. `votoSimEroe(sim, ps)` aggiunge alla base i gol e gli assist **registrati** (quelli di `_pSimStats`, che finiscono
   nel tabellino e nello storico), con la stessa scala. Tetto 9,5 (10 con 4 gol), pavimento 4.
4. I chiamanti (`src/18-career-app.jsx`: lega, coppa, Europeo girone e KO, amichevoli della nazionale, coppa delle
   nazioni, recupero) usano `votoSimEroe` invece di `voto + 0,4·gol + 0,2·assist`.

**Doppio conteggio.** I gol dell'eroe nel motore e i gol registrati sono due sorteggi diversi: senza correzione un gol
poteva valere due volte (pagella + bonus), oppure un gol del motore mai registrato alzava il voto. Misurato sulla griglia
(`sim-voto-156`, 160 partite per gruppo), «C ingenuo» = pagella intera + 0,4/0,2 contro il voto del gioco:

| gruppo | C ingenuo | voto del gioco | gol eroe motore / registrati | gol del motore non registrato · registrato senza gol del motore · entrambi |
|---|---|---|---|---|
| Primavera OVR 55 | 6,49 | 6,33 | 0,11 / 0,06 | 15 · 9 · 1 |
| Primavera OVR 65 | 6,54 | 6,45 | 0,13 / 0,17 | 16 · 26 · 1 |
| Primavera OVR 80 | 6,74 | 6,70 | 0,19 / 0,42 | 14 · 45 · 13 |
| Prima squadra 19 anni OVR 60 | 6,31 | 6,17 | 0,20 / 0,05 | 22 · 4 · 3 |
| Prima squadra 26 anni OVR 80 | 6,71 | 6,63 | 0,19 / 0,38 | 14 · 38 · 10 |

Nelle partite in cui c'è un gol (del motore o registrato) il «C ingenuo» sta sopra il voto del gioco di 0,10-0,47.

Il guardiano verifica che un gol registrato valga **una volta sola** (+0,80 sulla base, 840 casi su 840).

**Griglia OVR** (`sim-voto-156`, fase `funzione`, 160 partite per gruppo; «prima» = braccio `CPM_ROSSO=1`):

| gruppo | prima: voto · sotto 6 | dopo: voto · sotto 6 |
|---|---|---|
| Primavera st.1 OVR 55 (club p25) | 5,77 · 66,9% | 6,33 · 25,0% |
| Primavera st.1 OVR 60 | 5,78 · 66,9% | 6,40 · 23,8% |
| Primavera st.1 OVR 65 | 5,81 · 66,3% | 6,45 · 23,8% |
| Primavera st.1 OVR 70 | 5,83 · 61,9% | 6,48 · 23,1% |
| Primavera st.1 OVR 75 | 6,16 · 46,9% | 6,70 · 15,6% |
| Primavera st.1 OVR 80 | 6,53 · 26,9% | 6,70 · 16,3% |
| Primavera st.1 OVR 62 (club medio p55) | 6,25 · 43,1% | 6,66 · 6,9% |
| Primavera st.1 OVR 70 (club medio p55) | 6,30 · 39,4% | 6,81 · 5,0% |
| Prima squadra 19 anni OVR 60 (p79) | 5,94 · 56,3% | 6,17 · 30,0% |
| Prima squadra 19 anni OVR 65 | 5,96 · 55,6% | 6,21 · 26,3% |
| Prima squadra 19 anni OVR 70 | 5,99 · 52,5% | 6,30 · 23,8% |
| Prima squadra 19 anni OVR 75 | 6,13 · 43,1% | 6,42 · 25,6% |
| Prima squadra 19 anni OVR 80 | 6,51 · 25,6% | 6,58 · 25,6% |
| Prima squadra 26 anni OVR 70 | 5,99 · 53,8% | 6,39 · 25,0% |
| Prima squadra 26 anni OVR 80 | 6,59 · 22,5% | 6,63 · 23,8% |

Col tasto Simula vero (14 settimane dai salvataggi del PO) il voto per esito della squadra è: Primavera V 7,08 · N 6,27 ·
P 5,77; prima squadra V 7,23 · N 6,30 · P 5,73. Prima un pareggio valeva 5,8 e una sconfitta al massimo 5,5.

**Resta aperto.** In prima squadra lo scarto col dal vivo non è chiuso (−0,73 sul misurato). La panchina comprime il
voto verso 6 (quota 0,46-0,65 a 19 anni), e i gol registrati dell'eroe restano quelli di `_pSimStats`, non quelli del
motore: unificarli cambierebbe la distribuzione dei gol in carriera, ed è una decisione di prodotto.

## 2. Squadra dell'eroe simulata (difetto B) e gol della simulata

### 2.1 Rilettura del primo commit: la marcatura non era la causa

Il primo commit faceva marcare l'eroe a uomo solo quando la palla era della sua squadra. Misura (tattiche persona,
1.000 partite, stessi semi):

| braccio | punti/partita | gol fatti-subiti | gol totali |
|---|---|---|---|
| prima del giro | 1,16 | 0,88-1,20 | 2,08 |
| solo marcatura (primo commit) | 1,37 | 1,02-1,06 | 2,08 |

I punti salivano perché gli avversari segnavano meno (−0,14), non perché la squadra dell'eroe segnasse come le altre:
a ogni palla recuperata l'eroe era senza marcatore (tocchi dell'eroe da 221 a 301 a partita, tattica neutra). Con
l'eroe fuori (10 contro 11) gli avversari segnano 1,11: la difesa della squadra dell'eroe non era fuori norma. E i gol
totali restavano 2,08, quindi `sim-motore` restava rosso (1,88 sulle sue 200 partite). L'ho tolta.

### 2.2 La causa: le occasioni simulate dell'eroe non si concludevano

Nel gioco fluido l'eroe non tira (7.999.13: le sue conclusioni nascono dalle occasioni). Nella partita vissuta
l'occasione diventa una scena, e ogni scena è una giocata da gol (`giocaScena`, `src/14` r.~1790: resa del tiro
PO-221, compagno con la grande occasione PO-298). Nella simulazione rapida la stessa occasione la risolveva
`eseguiOccV2` così (70 contro 70, tattica neutra, 600 partite):

| per partita | prima |
|---|---|
| occasioni dell'eroe | 4,8 |
| di cui dribbling (vinto il duello: mezzo passo di conduzione, poi un passaggio qualunque) | 2,33 |
| di cui passaggio (un passaggio qualunque) | 2,15 |
| di cui tiro (con la resa di un tiro qualunque) | 0,33 |
| tiri dell'eroe · gol · assist | 0,67 · 0,17 · 0,12 |

Lo stesso divario è già scritto in `docs/governo/misure/2026-10-05-po202-brain-da-solo.md`: vissuta +0,3 gol sulla
simulata, «sono le scene, dove il giocatore sceglie sempre una giocata da gol».

### 2.3 Correzione (`src/14-motore-possesso.jsx`, solo simulazione rapida)

La scelta del profilo (`sceltaAutoV2`) non cambia. Ogni famiglia si conclude come nella scena, con le costanti di
`giocaScena` (nessuna costante nuova):

- **tiro** (`eseguiOccV2` r.~1030): la resa della scena (`_res158`, la stessa di `giocaScena`).
- **passaggio o cross** (`_assist158` r.~1060): se un compagno è davvero in area (avanzamento ≥ 78, entro 20 dal
  centro: la soglia dei cross del motore) è un assist — probabilità del passaggio di `giocaScena`, e il compagno calcia
  di prima da dove si trova con la grande occasione PO-298. Senza un compagno in area resta il passaggio di prima.
- **dribbling**: vinto il duello, al battito dopo (`decidiTenuta` r.~815) l'eroe tira se è al limite o in area,
  altrimenti gioca come prima.
- `tira` (r.~655) accetta la resa e la pressione dell'occasione; senza questi argomenti la chiamata è quella di prima.

La partita vissuta (`brainLive`) non passa da `eseguiOccV2`: il motore dal vivo non cambia.

Interruttori rossi: `window.__CPM_NO_G158` (tutto il giro: voto e occasioni) e `window.__CPM_NO_G158O` (solo le
occasioni).

**Varianti misurate e scartate** (tattiche persona, 1.000 partite, stessi semi):

| variante | punti | gol fatti-subiti | totale | perché no |
|---|---|---|---|---|
| ogni passaggio = assist, compagno portato davanti alla porta, + seguito del dribbling | 1,62 | 1,50-1,18 | 2,68 | sopra la banda del fondo classifica |
| come sopra più la marcatura del primo commit | 1,84 | 1,67-1,04 | 2,71 | idem |
| assist dopo il dribbling vinto, passaggio qualunque | 1,33 | 1,15-1,19 | 2,33 | `stili-098` rosso: l'Incursore faceva più assist del Regista |
| **scelta: assist solo verso un compagno in area** | **1,38** | **1,16-1,18** | **2,35** | — |

⚠️ La scelta fra le varianti l'ho fatta sulla banda chiesta dal PO (fondo classifica a forza pari). Giocando la scena
alla lettera come dal vivo (ogni passaggio un assist) la squadra dell'eroe finisce sopra la banda: la simulata resta
quindi più avara della partita vissuta, per costruzione.

### 2.4 Misure dopo

Percorso della carriera (`simulateMatch` col motore, avversari con la loro tattica), 70 contro 70, eroe OVR 70,
2.000 partite per braccio (guardiano `sim-g158`):

| | punti/partita | gol fatti-subiti | gol totali |
|---|---|---|---|
| prima (`__CPM_NO_G158`) | 1,17 | 0,90-1,19 | 2,09 |
| dopo | **1,37** | **1,15-1,18** | **2,33** |
| fondo classifica a forza pari (curva di `updateStandings`) | 1,37 (banda 1,29-1,45) | 1,34-1,34 | 2,68 |

Tattica neutra (`__CPM_SIM_MOTORE`, 600 partite): 70 contro 70 da 1,24 (1,01-1,11) a 1,40 (1,19-1,13); 40 contro 40
con eroe OVR 65 (il caso Leonessa) da 1,24 (0,99-1,17) a 1,40 (1,12-1,16). Per partita, dopo: tiri dell'eroe 1,00,
gol 0,24, assist 0,28.

Sonda del giro 157 (`sim-squadra-g157`, Leonessa contro il suo girone, 272 partite): punti a partita 1,45 contro 1,61
del fondo classifica (prima 1,21-1,29); serie del PO «≤ 6 punti in 10» 2,47% contro 0,94% del fondo (prima 7,8-8,2%);
«≤ 2 gol fatti in 10» 0,057% (prima 0,21-0,26%). ⚠️ A forza pari la simulata coincide col fondo classifica; qui la
Leonessa è più forte di gran parte del girone e il fondo classifica premia quel vantaggio più del motore: restano
0,16 punti a partita (errore standard circa 0,08).

`brain-202` (parte A, 120 partite in node sulle configurazioni della vissuta S12, eroe OVR 93): gol dell'eroe in
simulata 0,80 a partita (prima 0,48 secondo il commento del guardiano; obiettivo PO per la vissuta 0,6-0,9).

`sim-motore` B (le sue 200 partite, campione non toccato): gol 2,33, pareggi 23%. ⚠️ Il margine è piccolo: 2,33
contro una soglia di 2,3, e su 200 partite l'errore standard è circa 0,11 (blocchi da 200 misurati su una stesura
intermedia della correzione: 2,16 · 2,27 · 2,58 · 2,48 · 2,17). Su 2.000 partite (`sim-g158` G1d) il valore è 2,33.

### 2.5 Cosa resta sotto il fondo classifica

- **Gol totali.** 2,33 contro 2,68 del fondo classifica. Il motore segna circa 1,1-1,2 gol per squadra anche senza
  l'eroe: è la taratura del motore della partita vissuta, che la consegna chiede di non toccare.
- **L'OVR dell'eroe sposta poco.** A 70 contro 70 e tattica neutra (400 partite, misura presa su una stesura intermedia della correzione) i gol dell'eroe
  vanno da 0,19 (OVR 55) a 0,24 (OVR 93). Era così anche prima (0,14 → 0,16). Non corretto in questo giro.

## 3. Guardiano `npm run sim-g158`

`tests/visual/sim-g158-test.mjs`, verde + rosso (`CPM_ROSSO=1` → `__CPM_NO_G158`, deve uscire 1).

- **G1 squadra**, percorso della carriera, 2.000 partite per braccio: (a) punti nella banda del fondo classifica
  1,29-1,45; (b) almeno +0,08 punti sul braccio di prima; (c) almeno +0,15 gol fatti, e i gol subiti non calano oltre
  0,06 (la correzione sta nei gol fatti, non in un avversario indebolito); (d) gol totali in 2,3-3,5.
- **G2 voto**, griglia OVR, 840 partite: pagella presente 840/840; base = pagella senza gol/assist del motore 840/840;
  un gol registrato = +0,80 una volta sola 840/840; voto medio ≥ 6,15.

| braccio | G1 | G2 | esito |
|---|---|---|---|
| verde | 1,37 punti · 1,15-1,18 · totale 2,33 | media 6,35 | ✅ exit 0 |
| rosso | 1,17 punti · 0,90-1,19 · totale 2,09 | media 5,88, pagella 0/840 | ✅ rosso atteso, exit 1 |

## 4. Catena eseguita

Un controllo alla volta (`CPM_CI_PAR=0`), `free -m` e `df -h` prima di ognuno, `CPM_CHROME=/opt/pw-browsers/chromium`.

Tutti sul build finale (`2a9f476`: `node tools/build-src.mjs`, poi `check-src.mjs` «IDENTICO», allineato a git).

**Richiesti dalla consegna**

| controllo | esito |
|---|---|
| `validate-situations` | ✅ PASS, fingerprint 00001505 (717 s) |
| `partita-vera` | ✅ braccio verde, 12 bande giudicate e tenute, partite finite 2/2 |
| `match-sequence` | ✅ le tre velocità raccontano la stessa partita |
| `replay` | ✅ PASS |
| `sim-motore` | ✅ PASS (B: gol 2,33, pareggi 23%); rosso `__CPM_NO_SIMV2` riconosciuto |
| `simula-v2` | ✅ verde + rosso atteso |
| `sim-squadra-g157` | ✅ verde (identici 6,7%, 1,42 contro 1,16 punti); rosso `__CPM_NO_G157` riconosciuto (corsa sulla stesura intermedia) |
| `sim-g158` | ✅ verde; rosso `__CPM_NO_G158` esce 1 come atteso |
| `possesso` | ✅ exit 0 (sonda di misura) |
| `career-critical` (11 passi) | ✅ PASS |
| `highlight-95` | ✅ verde (102 highlight, 0 senza esito, passaggi arrivati 93,9%) e il rosso si vede (5.877 s) |
| `trama` | ❌ «sonda cieca: coppie insufficienti» — **identico sulla base 7.999.190** |
| `bg-sync` | ❌ «cieco: nessuna coppia misurata» — **identico sulla base** |
| `bg-name-role` | ✅ |
| `bg-continuity` | ❌ «cieco: non abbastanza righe» — **identico sulla base** |
| `bg-decision` | ❌ «cieco: non abbastanza righe» — **identico sulla base** |
| `bg-rhythm` | ❌ separazione 1,08× sotto la soglia 1,3× — **sulla base 1,07×** |

Le cinque sonde rosse (`trama`, `bg-sync`, `bg-continuity`, `bg-decision`, `bg-rhythm`) le ho rieseguite sul commit
`4f9363a` (7.999.190, prima del giro) in una copia di lavoro separata: escono rosse allo stesso modo. Riguardano la
cronaca della partita vissuta, che questo giro non tocca; non sono in nessuna catena di `ci-runner.mjs` né in
`STABILITA.json`. «Non giudicato» resta rosso: sono rossi **preesistenti**, non chiusi da questo giro.

**In più: i guardiani che `ci-runner` associa a `src/14` e usano le occasioni simulate**

| controllo | esito |
|---|---|
| `test:logic` | ✅ |
| `save-compat` | ✅ PASS |
| `passaggi-228` | ✅ (occasioni dell'eroe −2,0%, simulazione rapida identica nei due bracci) |
| `statistiche-228` | ✅ PASS (4.000 partite per braccio) |
| `stili-098` | ✅ (rosso su una stesura intermedia: è il motivo della variante scelta, §2.3) |
| `rigore-79` | ✅ |
| `interazioni-226` | ✅ (1.133 s) |
| `schede-234` | ✅ |
| `schede-259` | ✅ |
| `esito-280` | ✅ |
| `goleade` | ✅ PASS |
| `occasioni-squadra` | ✅ PASS |
| `manovre-150` | ✅ |
| `brain-202` | ✅ verde e il rosso si vede (A: 0,80 contro 0,525) |
| `pagella-75` | ❌ «nessuna partita con un gol dell'eroe in gioco fluido (il caso non è esercitato)» — **identico sulla base 7.999.190** |

**Corse non valide, rifatte.** `pagella-75` la prima volta è stata fermata dal tetto di un'ora del blocco in
sottofondo: rifatta da capo. `highlight-95` la prima volta l'ho fermata io durante il braccio rosso (non sarebbe finito
entro il tetto del blocco; il verde era passato con 97 highlight): rifatta da sola per intero, esito qui sopra.

**Non eseguiti.** Il resto della catena «mirata» di `src/14` (`carriera3-94`, `assist-298`, `assist-nome-98`,
`tabellino-228`, `tabellino-216`, `possesso-209`, `nomi-219`, `difesa-220`, `tempo-138`, `esiti-218`, `cross-218`,
`schede-246`, `esiti-241`, `schede-260`, `esiti-60`): giocano la partita vissuta, che non passa dal codice toccato
(`eseguiOccV2` e i due argomenti nuovi di `tira` valgono solo in simulazione rapida). Non posso confermarli verdi
senza eseguirli. `sim-voto-156` fase `vivo` (voto dal vivo) non rieseguita: valgono i numeri del giro 156.

**Non fatti perché fuori consegna.** `GAME_VERSION`, riga di roadmap, promozione su `main`. `sim-g158`,
`sim-squadra-g157` e `sim-motore` non sono in nessuna catena di `ci-runner.mjs`.

## 5. Aperto per il PO

1. Scarto del voto in prima squadra ancora −0,73 sul dal vivo misurato (panchina e gol registrati a parte).
2. Gol registrati dell'eroe (`_pSimStats`) e gol dell'eroe nel motore restano due sorteggi diversi.
3. Gol totali della simulata 2,33 contro 2,68 del fondo classifica: dipende dalla taratura del motore vissuto.
4. L'OVR dell'eroe sposta poco i suoi gol nel motore.
5. Il fondo classifica e la simulata restano due modelli diversi (Poisson e motore): coincidono a forza pari, non è
   stato misurato tutto l'arco delle differenze di forza oltre al girone della Leonessa.
