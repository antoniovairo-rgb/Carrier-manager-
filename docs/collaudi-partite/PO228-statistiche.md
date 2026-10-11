# PO-228 — Le statistiche di partita sono coerenti? (collaudo, sola lettura)

Collaudatrice 2 · base: `main` 7.999.159 (commit 995835f2) · gioco non modificato · tutto il materiale in `docs/collaudi-partite/`.

## 1. Cosa è stato fatto

- **22 partite vere** giocate fino al fischio finale (`FISCHIO FINALE` letto nel DOM e fase `ceremony` in 22/22; fine a minuto 90 verificata in `ev_fine` su k1 e k4). Salvataggio di partenza: `tests/visual/fixtures/save-190-s12-ovr93.json`. Nome del giocatore diverso per partita (`PO228-k`), autoplay seedato, `__CPM_PRESENT=1` (stessa flow di PO-221, `po221-partite.mjs`).
- **Letto il tabellino come lo vede il giocatore**: blocco «TABELLINO DELLA GARA» della schermata post-partita, nel DOM. Le due squadre sono affiancate, con la colonna sinistra sempre FC Merseyside (squadra del giocatore).
- **Dati grezzi**: `po228-partite.jsonl` (21 partite, k2–k22, con testo grezzo del blocco), `po228-k1.jsonl` (k1, primo giro: il parser dei nomi squadra era sfasato, le statistiche sono corrette), `po228-lotto.log`.
- **Sonda**: `po228-partite.mjs` (la partita vera), `po228-analisi.mjs` (aggregazione e controlli), `po228-diag.mjs` (diagnostica iniziale). **Aggregato**: `po228-aggregato.json`.
- **Due rigiocate di k4** per il caso discordante (sezione 4): `po228-k4-rigiocata.jsonl`, `po228-k4-eventi.json`, `po228-k4-tiri.json`.

## 2. Tabella per voce (22 partite)

Colonna «casa» = FC Merseyside (squadra del giocatore). Colonna «trasferta» = FC Tyneside. Il totale è somma delle due squadre. Statistiche calcolate dai valori visibili nel DOM, non dal codice.

| Voce | Casa: media / mediana / min / max | Trasferta: media / mediana / min / max | Totale: media / mediana / min / max |
|---|---|---|---|
| Gol | 2,00 / 2 / 0 / 5 | 0,95 / 1 / 0 / 4 | 2,95 / 3 / 1 / 7 |
| Possesso (%) | 53,6 / 53 / 48 / 60 | 46,4 / 47 / 40 / 52 | 100 (per costruzione) |
| Tiri | 13,0 / 13,5 / 6 / 18 | 8,7 / 8,5 / 4 / 15 | 21,7 / 21 / 16 / 33 |
| Tiri in porta | 5,3 / 5 / 2 / 11 | 2,8 / 2,5 / 1 / 5 | 8,1 / 8 / 4 / 15 |
| Gol attesi (xG) | 1,20 / 1,18 / 0,21 / 3,09 | 0,76 / 0,73 / 0,20 / 1,44 | 1,96 / 1,89 / 0,97 / 3,29 |
| Azioni dalle fasce | 20,1 / 20,5 / 3 / 39 | 19,8 / 18,5 / 11 / 35 | 39,8 / 38,5 / 23 / 74 |
| Cross | 22,1 / 21 / 6 / 37 | 15,6 / 15 / 3 / 32 | 37,6 / 36,5 / 16 / 57 |
| Dribbling riusciti (%) | 60,6 / 62,5 / 38 / 82 | 32,7 / 38 / 0 / 75 | n/d (tentativi non mostrati) |
| Passaggi | 207,8 / 205,5 / 182 / 244 | 197,9 / 199 / 163 / 227 | 405,7 / 409,5 / 354 / 443 |
| Precisione passaggi (%) | 84,1 / 84 / 78 / 93 | 83,2 / 83 / 76 / 90 | n/d (solo percentuale mostrata) |
| Recuperi | 24,2 / 23,5 / 17 / 37 | 25,6 / 23,5 / 17 / 42 | 49,8 / 49,5 / 35 / 74 |
| Parate | 1,8 / 2 / 0 / 5 | 3,2 / 3 / 0 / 7 | 5,0 / 5 / 1 / 8 |
| Calci d'angolo | 3,9 / 4 / 0 / 10 | 3,2 / 3 / 0 / 8 | 7,1 / 7,5 / 2 / 14 |
| Falli | 10,6 / 10 / 5 / 16 | 9,6 / 9 / 6 / 15 | 20,2 / 20 / 14 / 31 |
| Ammonizioni | 2,4 / 2,5 / 0 / 5 | 1,9 / 2 / 0 / 4 | 4,3 / 4,5 / 2 / 7 |
| Espulsioni | 0 / 0 / 0 / 0 | 0,09 / 0 / 0 / 1 | 0,09 / 0 / 0 / 1 |
| Rimesse laterali | 13,7 / 13,5 / 7 / 27 | 12,3 / 12,5 / 6 / 19 | 26,0 / 26 / 15 / 44 |

**Voci a zero in tutte le partite:** «Espulsioni» per la squadra di casa (0 in 22/22). Non c'è nessuna voce a zero in tutte le partite per l'intero tabellino.

**Voci mancanti nel tabellino a schermo** (presenti nel motore, non mostrate al giocatore): `Fuorigioco` (contatore in `CARRIER-MANAGER-AV.html:25497`, nessuna riga in `righeTabellino23`, 27833–27852), `Contrasti` (sommati dentro «Recuperi», 27846), `Dribbling tentati` (solo la percentuale riusciti, 27843), `Passaggi riusciti` come numero (solo la percentuale, 27845).

## 3. Controlli di coerenza interna (22 partite)

| Controllo | Esito |
|---|---|
| Possesso casa + trasferta = 100 | 22/22 ✅ |
| Tiri in porta ≤ tiri | 22/22 ✅ |
| Cross ≤ passaggi | 22/22 ✅ |
| Gol del tabellino = punteggio finale (tabellone) | **21/22** — eccezione: k4 (sezione 4) ❌ |
| Squadra del giocatore in casa (colonna sinistra = `club.n` del salvataggio) | 22/22 — **in casa in tutte** ⚠️ (vedi 5) |

## 4. Il caso k4: tabellino 1–0, tabellone 0–0 (riprodotto)

- **Riprodotto in 3 esecuzioni** (partita k4 nel lotto + due rigiocate con lo stesso nome): tabellino `Gol 1–0`, tabellone `0–0`, passaggi 225/217 identici → il caso è deterministico. Il tabellone letto con `__CPM_SCORE` e nel titolo della schermata coincide (`0–0`).
- **Il registro degli eventi di partita non ha nessun `goal`** (`po228-k4-eventi.json`: 298 eventi, con `recita`, `chronicle`, `turn`, `candidate`, `scena`, `esito`, `fine`; zero `goal`). Le cinque scene di highlight si chiudono tutte con `intercept` o `recovery` (`esito`, nessun `goal`).
- **Dove nasce il gol nel tabellino**: nel motore, `S.tab[l].gol++` in `CARRIER-MANAGER-AV.html:25492` (evento `gol` del motore, emesso in `arrivoTiro` riga 26157 `ev("gol",…)`) o in `registra` riga 26514 (`case 'gol': A.gol++`). Il punteggio vivo invece si aggiorna in `setScore` alle righe 33479 (`team_goal`) e 33480 (`opp_goal`), e il registro `cpmEv('goal')` è emesso nelle stesse righe.
- **Non posso confermare quale percorso abbia prodotto la rete**: il registro non lo mostra e non ho strumenti per osservare lo stato interno del motore (`S`) senza modificare il gioco. Quello che è verificato: **il motore ha un gol registrato che il punteggio e il registro della cronaca non hanno accreditato**.
- Effetto sul giocatore: il tabellino dice «1» dove il tabellone dice «0». Frequenza nel lotto: **1 partita su 22** (4,5%).

## 5. Limiti della prova (da leggere prima di concludere)

1. **Le 22 partite sono la stessa gara di calendario**: avversario FC Tyneside, giocatore in casa, in tutte. Il nome cambia solo il seme (`po221` / `po228`): variano l'andamento e i numeri, non la partita. Un campione «di partite diverse» richiede avversari e luoghi diversi: non l'ho fatto.
2. **Ordine delle colonne**: il titolo della schermata mette la trasferta a sinistra (`score.away`) e la casa a destra, in 22/22; il tabellino mette la casa a sinistra (`latiTabellino10`, riga 26897: `mine = T.home` sempre). Non è un errore di conteggio ma il giocatore vede due ordini diversi per lo stesso punteggio. Non so dire se è voluto.
3. **Il tabellino a 86'** (foto del PO: circa 430 passaggi e 43 cross) **non è stato misurato**: ho letto il tabellino finale. Il totale finale del lotto è 405,7 passaggi (mediana 409,5) e 37,6 cross (mediana 36,5). **Non posso confermare** che la foto del PO fosse il totale delle due squadre o una sola squadra, né la stessa schermata.
4. **Il lotto è su una CPU**: 22 partite in sequenza, circa 295 s ciascuna.
5. **Il valore di riferimento reale non è in questo rapporto**: la sessione principale lo aggiunge con le sue fonti (come da incarico).

## 6. Come viene calcolata ogni voce (dal codice)

Tutte le voci vengono da **un solo oggetto** (`S.tab`, per squadra), costruito dagli eventi del motore (`ev()` riga 25551 → `_conta914` riga 25481) e dagli highlight (`registra` riga 26495). La schermata in partita (righe 27910, 27990) e il tabellino di fine gara (righe 38096–38099) leggono `motoreRef.current.tabellino()`. Quindi la **stessa sorgente** nei due punti.

| Voce | Come viene calcolata | File:riga |
|---|---|---|
| Gol | contatore evento `gol` del motore; + `registra` su esito gol degli highlight | 25492, 26514 |
| Possesso (%) | accumulo `_dt` a ogni tick in `tenuta`/`volo`; **normalizzato** sulla somma dei due possessi, non sul tempo di partita | 26391; 26484–26488 |
| Tiri | contatore evento `tiro` | 25490; 26511 |
| Tiri in porta | `tiro` con esito `goal` o `saved` (altrimenti legno/murato/fuori) | 25491; 26512 |
| xG | somma dell'`xg` dell'evento se presente, altrimenti **stima** da zona e pressione (`_XG914`, base 0,03–0,34 × 0,72–1,35, tetto 0,9) | 25480, 25490; 26511 |
| Azioni dalle fasce | conteggio **a fronte** (edge): ricezione/conduzione nel corridoio y<22 o y>78 con avanzamento ≥66 partendo da fuori | 25489 |
| Cross | evento `cross`: +1 `passaggi` e +1 `cross`; `passOk` solo se `!V2` | 25486 |
| Dribbling riusciti (%) | tentativi: conduzione con pressione <3 (probabilistico) **e** evento `dribbling` (sempre); riusciti: `dribblingOk` solo sull'evento `dribbling`. Percentuale = riusciti/tentati, mostrata come `dr()` | 26082 (tentativo solo se `press<3`); 26130; 27843 |
| Passaggi | evento `passaggio` (+1; `passOk` se non `fuori`) e cross (+1) | 25485–25486; 26516 |
| Precisione passaggi (%) | `passOk/passaggi` arrotondato | 27845 |
| Recuperi | `contrasti` (evento `contrasto`/`recupero`) + `intercetti` | 25502, 25509; 27846 |
| Parate | evento `parata` (contatore della squadra avversaria) | 25500; 26512 |
| Calci d'angolo | evento `corner` | 25493; 26519 |
| Falli | evento `fallo`, **escluso** se `daFuorigioco` (una punizione per fuorigioco non è fallo) | 25494; 26517 |
| Ammonizioni / Espulsioni | eventi `ammonizione` / `espulsione` | 25498–25499 |
| Rimesse laterali | evento `rimessa` | 25496 |
| Fuorigioco | evento `fuorigioco`, **contato ma non mostrato** | 25497 (assente da 27833–27852) |

**Filtro delle righe a zero:** le righe a 0 vengono nascoste solo quando la somma delle due squadre è 0 (27853 per il pannello in partita; 38114 per il tabellino di fine gara). Nel DOM però «Espulsioni 0–0» compare in 19 partite su 21 del lotto (k2–k22), quindi il filtro per questa voce non si comporta come descritto: lo dichiaro come osservazione, non ne spiego la ragione.

## 7. Verdetto

Le statistiche sono **internamente coerenti** su 22 partite: possesso a 100, tiri in porta ≤ tiri, cross ≤ passaggi, e tabellino = tabellone in 21 partite su 22. Restano aperti: il gol del motore non accreditato in k4 (causa non identificata), la mancanza di varietà di avversario e luogo nel campione, l'ordine diverso delle colonne tra titolo e tabellino, e la voce «Fuorigioco» contata ma mai mostrata. Il confronto con la realtà del calcio non è in questo rapporto.

**CHIUSO / NON CHIUSO:** **NON CHIUSO** — motivo: la causa del gol k4 (tabellino ≠ tabellone) non è identificata e serve strumentare il motore (`S.tab`/`setScore`) in una sessione con permesso di modifica; il campione non varia avversario né luogo; e il riferimento reale spetta alla sessione principale.
