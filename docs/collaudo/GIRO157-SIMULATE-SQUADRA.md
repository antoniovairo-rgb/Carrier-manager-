# Giro 157 — Risultati di squadra nelle partite simulate (PO-360)

**Segnalazione.** Primavera 2, stagione 1, FC Leonessa Primavera (forza 35), eroe attaccante OVR 65, 17 anni.
Dieci partite consecutive col tasto Simula: 1 vittoria, 3 pareggi, 6 sconfitte, **2 gol fatti in 10 partite**.
In classifica la squadra passa da -1 a -13 dalla vetta. Parole del PO: «è troppo severo da simulazione».

**In breve.** Ci sono **due difetti**, e la serie del PO non è soltanto sfortuna.

- **A (corretto in questo giro).** Il motore porta ogni forza sotto 40 a 40. In Primavera 2 tutti i club
  stanno fra 20 e 38, quindi ogni partita simulata dell'eroe diventava 40 contro 40: la forza delle squadre
  non contava più. Lo provano gli stessi semi: contro la stessa avversaria a forza 25 o a forza 38 il
  risultato è identico nel **100%** delle partite.
- **B (misurato, NON corretto: tocca regole del motore decise dal PO).** A parità di forza, nella simulata la
  squadra dell'eroe rende meno di una squadra qualunque: **~1,2 punti a partita contro ~1,4** (atteso a forza
  pari). Contro lo stesso girone il fondo classifica dà alla Leonessa **1,57-1,61 punti a partita**, la
  simulata **1,21-1,29**.
- **Gol.** La simulata segna poco: 1,0 gol fatti a partita per la Leonessa, contro l'1,5 del fondo classifica.

## 1. Come si calcolano i tre percorsi (letto dal codice)

| Percorso | Funzione | Forza usata |
|---|---|---|
| (a) Simula dell'utente | `simulateMatch(...,{motore:true})` `src/10-folla-stadi-ritiro.jsx:921` → `simulaPartitaMotore` `src/14-motore-possesso.jsx:1801` → `creaMotorePossesso` | `forzaH=clamp(clubP+_fz156,30,99)`, `forzaA=oppP`, poi **pavimento a 40** in `src/14-motore-possesso.jsx:257` |
| (b) Partite delle altre squadre | `updateStandings` `src/09-audio-scout-anagrafiche.jsx:1500`: Poisson con λH=1,42+0,95·diff, λA=1,26−0,82·diff, diff=(hP−aP)/34 | `clamp(p,30,99)`, **nessun pavimento a 40** |
| (c) Partita giocata dal vivo | `LiveMatch` con il motore del possesso | **non misurata** in questo giro (serve giocare gli highlight) |

Le verifiche chieste dalla consegna:

- **clubP è la forza vera del club Primavera.** Il club scelto viene da `ALL_U18_CLUBS` (`src/17` r.~557),
  e la scelta `onChoose` (`src/19-app-root.jsx:946`) lo salva così com'è. In Primavera 2 vale `p − 15` del
  club di Lega B (`src/02-club-leghe-albo.jsx:299`): per la Leonessa fa 50 − 15 = **35**, cioè la 5ª forza
  del girone (le 18 forze vanno da 23 a 38). Non è il valore della prima squadra e non è un default.
- **`_fz156` non è mai negativo.** È `clamp((ovr−70)·1,0,15)·quota` (`src/10` r.~946): con OVR 65 vale 0, e
  per un ragazzo in panchina vale 0.
- **Casa e trasferta sono giuste, e non c'è inversione.** `forzaH` è sempre la squadra dell'eroe, per scelta
  dichiarata («"home" nel motore è sempre la squadra dell'eroe; lo stadio dice chi gioca davvero in casa»,
  `src/14` r.~1800). Il vantaggio di campo segue `stadio` (`vantDi`, `src/14` r.272). `homeScore` è sempre
  il numero di gol dell'eroe, e `updateStandings` lo legge così (`pt.gf+=playerResult.homeScore`). Misurato a
  40 contro 40: in casa 1,44 punti a partita, in trasferta 0,94.

## 2. Misure

Le sonde girano headless sulla pagina vera, con `window.__CPM_simMatch`, `__CPM_SIM_MOTORE` e
`__CPM_MOTORE_CREA`. Le partite di fondo usano la vera `updateStandings`.

### 2.1 Il pavimento a 40 (difetto A)

Stessa avversaria (FC Empolese Primavera, quindi stessa persona e stessa tattica), stessi 120 semi; cambia
solo la forza, 25 contro 38:

| braccio | risultati identici | punti a partita contro la 25 / contro la 38 |
|---|---|---|
| prima (`__CPM_NO_G157`) | **100%** | 1,18 / 1,18 |
| dopo | **5%** | 1,31 / 1,09 |

Prima, la sensibilità del motore alla forza c'era, ma solo sopra 40. A 45 contro 40 la squadra dell'eroe fa
1,46 punti a partita, contro 1,15 a 40 contro 40 (600 partite).

### 2.2 Leonessa contro il suo girone (17 avversarie, casa e trasferta, semi fissi)

| | punti/partita | gol fatti-subiti | V / N |
|---|---|---|---|
| simulata, prima (8 semi, n=272) | 1,29 | 0,99-1,10 | 33% / 31% |
| simulata, dopo (8 semi, n=272) | 1,21 | 1,00-1,19 | 32% / 24% |
| simulata, dopo (12 semi, n=408) | 1,23 | 1,01-1,20 | 33% / 24% |
| **fondo classifica, stesse coppie** (n=272) | **1,61** | 1,50-1,22 | 46% / 25% |

Fasce del girone dopo la correzione (8 semi): contro le 6 più deboli (23-29) 1,40 punti a partita; contro le 6
più forti (34-38) 0,81. Nel fondo classifica le stesse fasce danno 1,79 e 1,55. Lo scarto fra le fasce è
**rumoroso**: con 12 semi esce 0,40 invece di 0,59, perché l'errore standard è circa 0,15 punti a partita.
Per questo il guardiano non giudica su questo numero.

⚠️ **La correzione A, da sola, non alza i punti della Leonessa.** Adesso la squadra batte di più le deboli,
ma perde di più con le forti. Inoltre le squadre sotto 30 sono già portate a 30 anche nel fondo classifica,
quindi il vantaggio reale della Leonessa sul girone resta piccolo. A rende la simulata coerente con le forze,
ma non chiude la differenza col fondo classifica: quella differenza è B.

### 2.3 La squadra dell'eroe a parità di forza (difetto B)

`__CPM_SIM_MOTORE`, forza 40 contro 40, metà in casa e metà fuori:

| variante | n | punti/partita | gol fatti-subiti | possesso |
|---|---|---|---|---|
| eroe in campo, OVR 65 (percorso vero) | 600 | 1,15 | 0,95-1,18 | — |
| idem, altri semi | 400 | 1,26 | 1,07-1,11 | 46,3% |
| eroe fuori (10 contro 11) | 600 | 1,25 | 0,87-1,00 | — |
| eroe con OVR 40 (uguale ai compagni) | 200 | — | 1,08-1,26 | 43,9% |
| `__CPM_NO_TIRO14` (l'eroe tira anche fuori dalle sue scene) | 400 | **1,44** | 1,12-1,05 | 46,3% |
| `__CPM_NO_EROEGIOCO` (eroe senza regole speciali) | 400 | 1,76 | 1,55-0,97 | 37,7% |

A forza pari, una squadra senza vantaggi fa circa 1,37-1,40 punti a partita: è il valore medio fra casa e
trasferta con circa il 28% di pareggi.

Da qui seguono tre fatti:

1. Con l'eroe in campo, la squadra subisce più di quanto segna. Ha il 44% del possesso, fa 356 passaggi
   contro 456 e tenta 14,4 dribbling contro 3,2 (riusciti 6,8). L'eroe è un collettore di palloni che
   dribbla e li perde (`src/14` r.~967-978: conduzione +0,08 per l'eroe).
2. La regola **«l'eroe tira solo nelle sue scene»** (7.999.13, `_eroeNonTira14`, `src/14` r.252) nel live
   ha senso, perché quelle scene sono gli highlight. Nella simulata le scene si risolvono da sole
   (`occasioniV2`), ma solo ogni 12' e solo con palla all'eroe oltre la trequarti (`_occV2Pronta`, r.~989).
   Spegnere le occasioni cambia poco (1,27 → 1,22); spegnere la regola porta la squadra a 1,44.
3. Quanto pesa: circa **−0,2 punti a partita** a forza pari e circa −0,35 / −0,4 rispetto al fondo
   classifica. In 10 partite fanno **2-4 punti**.

**Perché non lo correggo.** Le leve sono regole del motore misurate e decise col PO: 7.999.13 (scene
dell'eroe e tetto), 7.999.15 (ritmo delle occasioni), PO-221 (gap delle occasioni) e la conduzione
dell'eroe. Sono condivise con la partita vissuta. Toccarle è una decisione di prodotto e del motore, e la
consegna lo esclude. Resta aperto (vedi §5).

### 2.4 Gol: la simulata segna poco

`npm run sim-motore` (preesistente) è **rosso sulla banda B**: 1,97 gol a partita a 70 contro 70, fuori dalla
banda 2,3-3,5. Il numero è **identico con e senza la correzione di questo giro** (1,97 in entrambe le corse):
il rosso non viene da qui. Il fondo classifica fa circa 2,7 gol a partita. Meno gol vuol dire più partite
decise da un episodio, e la forza conta meno.

### 2.5 Quanto è probabile la serie del PO

Calcolo con la distribuzione misurata nella sonda, contro tutto il girone, supponendo partite indipendenti.
Non conosco il calendario esatto delle 10 giornate del PO, quindi uso la media sul girone.

| | ≤ 6 punti in 10 | ≤ 2 gol fatti in 10 |
|---|---|---|
| simulata, prima | 4,85% | 0,26% |
| simulata, dopo A | 7,77-8,17% | 0,21-0,26% |
| fondo classifica (la stessa forza) | 0,94-1,20% | 0,006-0,007% |

**Lettura.** Con il comportamento del fondo classifica, una serie come quella del PO capita circa 1 volta
su 100 per i punti e quasi mai per i gol. Con la simulata attuale capita circa 1 volta su 12-20 per i punti.
I **2 gol in 10 partite** restano rari anche nella simulata (circa 0,2-0,3%): sono sfortuna **sopra** a un
motore che già segna poco (§2.4) e che penalizza la squadra dell'eroe (§2.3). Non posso confermare di più
senza il salvataggio del PO: avversari, semi e se l'eroe fosse titolare.

## 3. Correzione (difetto A)

`src/14-motore-possesso.jsx`, in `simulaPartitaMotore` (solo simulazione rapida: il live non passa di qui).
Se la più debole delle due forze è sotto 40, **entrambe** salgono della stessa quantità, quanto basta a
portarla a 40. Il motore confronta le squadre solo per **differenza** (`vantDi`), quindi la differenza resta
quella vera e non si aggiunge nessun bonus a nessuno. Con due forze già da 40 in su il comportamento è
identico a prima. Interruttore rosso: `window.__CPM_NO_G157` riporta il pavimento che appiattisce.

Non toccato, e dichiarato:
- il **live** usa lo stesso pavimento (`creaMotorePossesso` r.257): in Primavera 2 anche la partita giocata
  vede 40 contro 40;
- il clamp a 30 di `simulateMatch` e del fondo classifica (le squadre da 23 a 29 valgono 30 in entrambi i
  percorsi, quindi è simmetrico);
- voto dell'eroe e card «Ultime notizie» (sono del giro 156).

## 4. Guardiano

`npm run sim-squadra-g157` (`tests/visual/sim-squadra-g157-test.mjs`).

- **G1 (giudicato).** Stessa avversaria a forza 25 e 38, sugli stessi 120 semi: risultati identici ≤ 60%, e
  più punti contro quella da 25.
  - verde: **5%** identici, 1,31 contro 1,09 punti a partita;
  - rosso (`CPM_ROSSO=1` → `__CPM_NO_G157`): **100%** identici, 1,18 contro 1,18 → esce con codice 1.
- **Dichiarati, non giudicati:** girone per fasce, simulata contro fondo classifica (il residuo B) e
  probabilità della serie del PO.
- Un primo controllo «gol fatti contro le deboli > contro le forti» è stato tolto: era verde anche nel
  braccio rosso.

## 5. Aperto per il PO (decisioni, non mie)

1. **B:** la squadra dell'eroe simulata vale circa −0,2 punti a partita rispetto a una squadra qualunque
   della stessa forza. Le leve misurate sono il tiro solo nelle scene (`__CPM_NO_TIRO14`: +0,18), il ritmo
   delle occasioni nella simulata e la conduzione e il dribbling dell'eroe.
2. **Gol nella simulata** sotto la banda di `sim-motore` (1,97 contro 2,3-3,5), preesistente.
3. **Pavimento a 40 nel live** per Primavera 2 e per le leghe con club sotto 40.

## 6. Controlli eseguiti (uno alla volta, `free -m` e `df -h` prima di ognuno)

| controllo | esito |
|---|---|
| `node tools/build-src.mjs` + `check-src.mjs` | allineato dopo la build |
| `sim-squadra-g157` | verde; rosso con `__CPM_NO_G157` |
| `sim-motore` | **rosso preesistente** (B: 1,97 gol), identico senza la modifica |
| `simula-v2` | verde |
| `test:logic` | verde |
| `save-compat` | 12/12 verde |
| `typing-shortcuts` | verde |
| `career-critical` (11 passi) | verde: i primi 8 in una corsa; `cup-final-replay` interrotto dal tetto di tempo della chiamata, poi rifatto da solo verde, come `coppa-nazioni` e `coppa-intera` |
| `validate-situations` | vedi esito nel commit |

Non eseguiti: la catena «mirata» per `src/14` (25 guardiani del motore vissuto) e `partita-vera`. La
modifica non tocca `creaMotorePossesso` né il live, e con forze da 40 in su è identica a prima.
