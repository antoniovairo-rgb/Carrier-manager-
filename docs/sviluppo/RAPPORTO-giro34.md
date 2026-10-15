# Rapporto sviluppatrice — giro 34 · `nomi-219` instabile per la seconda volta

Ramo `sviluppo/nomi-219-giro34`, base `lavoro/170` (7.999.170, `8fd95fe`). Non ho toccato `src/` né `CARRIER-MANAGER-AV.html`.

## 1. Cosa ho scoperto prima di misurare

Il rosso del giro 22 (85% su 20, 88% su 17, poi 94,7% su 19, `docs/sviluppo/RAPPORTO-giro22.md` §6 sul ramo
`sviluppo/highlight-252`) **non viene dalla forma del guardiano che è oggi su `lavoro/170`**:

- quel ramo **non contiene** il commit `118d553` (giro 18, «nomi-219 riparato»): `git merge-base --is-ancestor 118d553 origin/sviluppo/highlight-252` → falso;
- la sua copia di `tests/visual/nomi-219.mjs` è la forma **vecchia**: 8 semi `[7, 99, 1234, 2021, 5, 42, 77, 314]`, soglia del verde **90%** su ≥12 nominati, prova del rosso solo «distacco di 20 punti»;
- il giro 22 stesso scrive «stessi 8 semi», cioè ha misurato quella forma.

Su `lavoro/170` il guardiano gira già con la forma del giro 18: 18 semi verdi (101-118) + 9 rossi (101-109), 3 partite alla volta,
soglia del verde **75%** su ≥12, prova del rosso «distacco ≥20 punti **oppure** almeno un nominato oltre 35 u».
Quindi la domanda giusta è: *questa* forma è stabile? L'ho misurata.

## 2. Misura: cinque corse sulla stessa build

Build: `lavoro/170` + due sole aggiunte di collaudo nel guardiano (nessun effetto sulla misura): una riga stampata per seme
(nominati/vicini/lontani) e `CPM_N219_BASE` per spostare i semi. GLB spento, teatro armato, `CPM_N219_PAR=3`, corse **in serie**
(nessun altro carico sulla macchina, 4 core). Rosso = `__CPM_NO_CAST219` + `__CPM_NO_SWAP219` (gli interruttori storici).

| corsa | semi | verde: vicini / nominati | quota verde | lontani verde | rosso: vicini / nominati | quota rosso | lontani rosso (>35 u) | esito | durata |
|---|---|---|---|---|---|---|---|---|---|
| c1 | 101-118 / 101-109 | 30/33 | 90,9% | 1 | 11/22 | 50,0% | 8 | ✅ | 41,8 min |
| c2 | 101-118 / 101-109 | 42/48 | 87,5% | 1 | 15/27 | 55,6% | 8 | ✅ | 41,9 min |
| c4 | 101-118 / 101-109 | 45/45 | 100% | 0 | 9/18 | 50,0% | 7 | ✅ | 41,7 min |
| c3 | 119-136 / 119-127 | 37/39 | 94,9% | 0 | 12/30 | 40,0% | 7 | ✅ | 41,0 min |
| c5 | 137-154 / 137-145 | 25/29 | 86,2% | 2 | 15/25 | 60,0% | 4 | ✅ | 41,7 min |
| **totale** | 90 partite verdi, 45 rosse | **179/194** | **92,3%** | 4 | **62/122** | **50,8%** | 34 | **5/5** | |

Osservazioni:

- **Stessi semi, numeri diversi:** c1, c2 e c4 giocano gli stessi semi e danno 33, 48 e 45 nominati. Le partite sotto autoplay con
  tre pagine in parallelo non si ripetono identiche (lo aveva già visto il giro 18: «la copertura non si ripete fra corse»).
  Per questo la stima di stabilità si fa ricampionando le partite, non fidandosi di una corsa.
- **Verde:** sempre sopra la soglia, con margine 11-25 punti; mai sotto i 29 nominati (pavimento 12).
- **Rosso:** sempre rilevato da **entrambe** le prove (distacco 26-55 punti; 4-8 nominati oltre 35 u). Nel verde ci sono
  occasionalmente 1-2 nominati oltre 35 u (4 su 194, vedi §5): la prova «almeno un lontano» si guarda solo nel braccio rosso, e lì
  non scende mai sotto 4. Da sola non separerebbe (c5 verde ne ha 2): separa insieme al distacco, che non è mai sceso sotto 26 punti.
- Righe per seme di tutte le corse: `docs/sviluppo/dati-giro34-nomi219.txt`.

## 3. Ricampionamento (stima onesta della stabilità)

Strumento nuovo, solo collaudo: `tests/visual/nomi-219-ricampiona.mjs <cartella dei log>`. Estrae a caso con ripetizione le partite
misurate (90 verdi, 45 rosse) e rigioca il giudizio del guardiano su 20 000 corse simulate.

| forma | rossi falsi a corsa | un verde che gioca come il rosso passa |
|---|---|---|
| **vecchia (giro 22): 8 semi, ≥90% su ≥12, rosso solo distacco** | **41,4%** | 0,0% |
| attuale ma con rosso solo «distacco 20» | 2,1-2,4% | 0,0% |
| **attuale (giro 18): 18+9 semi, ≥75% su ≥12, distacco 20 o ≥1 lontano** | **0,1%** | 0,0% |
| 18+9, pavimento alzato a 20 nominati | 0,4% | 0,0% |
| 24+9, pavimento 20 | 0,1% | 0,0% |
| 27+9, pavimento 12 | 0,0% | 0,0% |

Percentili della forma attuale (ricampionati): quota verde **1° pct 79,2% · 5° pct 83,7% · mediana 92,7%** (margine sulla soglia
75%: ~4 punti all'1° percentile, ~9 al 5°); nominati verdi 1° pct 22 (pavimento 12); quota rossa mediana 50,0%, 99° pct 72,7%;
lontani rossi 1° pct **2** (soglia 1).

La forma vecchia esce rossa in ~4 corse su 10 per solo campione: è esattamente quello che ha visto il giro 22 (due rosse su tre).

## 4. Decisione: forma e soglie invariate

Il guardiano su `lavoro/170` **è già riparato** (giro 18) e la misura lo conferma: 5/5 verdi, rosso 5/5 rilevato, rossi falsi
stimati ~0,1% a corsa. Ho valutato le due mosse indicate dal compito:

- **più partite** (24 o 27 semi verdi): portano i rossi falsi da 0,1% a 0,0-0,1% al costo di +9/+14 minuti a corsa. Non vale il
  tempo, e il guadagno non si distingue dal rumore del ricampionamento;
- **pavimento più alto** (20 nominati): *peggiora* (0,4%) perché aggiunge un modo di fallire per campione corto, senza rendere più
  severa la prova.

Quindi non ho cambiato né campione né soglie (*No Blind Fix*: nessuna misura dice che servano). Cambiamenti nel guardiano:

1. una riga per seme con nominati/vicini/lontani (serve a ricampionare le corse future senza rigiocarle);
2. `CPM_N219_BASE` (default 101) per misurare la stessa build su semi diversi — il guardiano in catena usa sempre 101;
3. commento con la misura di questo giro accanto ai semi.

**Tempo d'esecuzione:** prima 41,8 min (c1, identica al giro 18: 42 min) · dopo **invariato** (41,0-41,9 min nelle cinque corse).

## 5. Difetto nel gioco?

Non per l'instabilità: il rosso del giro 22 è spiegato per intero dalla forma vecchia del guardiano sul suo ramo. Verde 92,3% su
194 nominati.

**Residuo dichiarato, non corretto (fuori ambito, `src/` non toccato):** nel verde 4 nominati su 194 (2,1%) stanno oltre 35 u —
36,4 u (seme 109, conclusione), 41,4 u (112, fra-le-linee), 53,3 u e 53,4 u (147 e 154, fra-le-linee, entrambi HAMMOND) — contro
34 su 122 (28%) nel rosso. Sono pochi, ma due arrivano alla stessa distanza dei casi del rosso: è il caso del PO («ci sono A, B, C
ma dice che gliela passa D») che sopravvive in ~1 partita su 20. Non l'ho indagato; proposta: aprire una voce con questi semi.

## 6. Da sapere per chi unisce

- Se `sviluppo/highlight-252` (giro 22) viene unito, deve portarsi la forma del giro 18 del guardiano: il suo ramo non ha toccato
  `nomi-219.mjs`, quindi l'unione con `lavoro/170` la porta da sé. Prima di dichiarare rosso `nomi-219` su un ramo, verificare che
  contenga `118d553`.
- **Non posso confermare** la stabilità sotto il carico della catena (`ci-runner` fa girare i lenti a due a due): le mie corse erano
  da sole. Il margine del 5° percentile (~9 punti) dovrebbe bastare; se il guardiano tornasse rosso in catena, rilanciare
  `nomi-219-ricampiona.mjs` sulle righe per seme di quella corsa per vedere se è campione o carico.
