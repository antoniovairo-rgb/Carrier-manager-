# Rapporto sviluppatrice — giro 10 · PO-226 interazioni in partita

Ramo `sviluppo/interazioni-226`, partito da `poc/marioprada-character-system` a e385bea6 (7.999.161 + documenti).
Decisione PO 12/10 sera «Sì, avvia il piano» (`docs/governo/DECISIONI.md`, voci «11/10 sera — PO-226» e «12/10 sera»).
Rapporto della collaudatrice letto: `docs/collaudi/PO226-interazioni.md` sul ramo `collaudo/sessione-collaudatrice`.

Riferimenti di riga: sorgente **dopo** la modifica, salvo dove indicato «base».

## 1. Censimento — le interazioni in partita oggi (base 7.999.161)

| Interazione | Dove (base) | Quando nasce | Effetto vero |
|---|---|---|---|
| **Ordini del mister** 28' · 63' · 75' · 85' | `src/15-live-match.jsx:4288-4370` (base); ordini `src/13-prepartita-formazioni.jsx:1336` `COACH_ORDERS`, scelta `:1368` `selectCoachOrder` | **Orologio**: soglie di minuto fisse (`ck>=28`, `ck>=63`, `ck>=75`, `ck>=85` solo se scarto ≤1). Il contenuto dipende da punteggio, momento, fatica | Su **scene e cronaca**, non sul motore src/14: `tacticBonusRef` (bonus delle azioni dell'eroe), `setPossession`, `setMomentum` (che alimentano la λ del microsim dei gol), `driftTargetsRef` (deriva della formazione). Nessuna scelta del giocatore. Il motore src/14 non riceveva niente |
| **Reazione del mister al gol subito** | `src/15-live-match.jsx:6795-6803` | Fatto: gol avversario | Come sopra (bonus + deriva), nessuna scelta. **Invariata** |
| **Grida del mister** | `COACH_SHOUTS` `src/13:1393`, `pickCoachShout` `src/13:1422`, chiamata `src/15:4761` | Minuto, punteggio, momento, possesso, stile; anti-ripetizione | Solo testo nel riquadro panchina (`addCoach`). **Invariate** |
| **Schede INTX669** (mister · compagni · avversari · eroe, fra cui «Il compagno · Hamilton» della foto PO) | Elenco `src/15:172` (`INTX669`); selezione `src/15:5871-5935`; emissione `src/15:6470-6501`; scelta `scegli681` `src/15:2936`; pop-up `PopScelta919` `src/15:994`; timer 35 s → opzione 0 `src/15:3063` | **Orologio + sorteggio**: finestra 18'-88', apertura 18'+rnd·12, tetto 4 (5 con evento), distanza 10' (5 con evento), pesca `_rndM` fra le eleggibili. Misura collaudatrice: 4,1 schede a partita (4-5), 1-2 scelte, 23/23 scattate per timer | Indiretto: contatori narrativi `marcatura · intesa · coinv · fiducia · zona` (`scegli681`, `src/15:2943-2947`), letti dalle scene dell'eroe. Nessuna scrittura sul motore src/14 |
| **Sostituzione in uscita** | `subOffAtRef` `src/15:1405`, uscita dovuta `src/15:4490` | Fatica d'ingresso ≥60 → minuto 56-80 (deterministico); gestione +2 dopo il 78' (seedato) | L'eroe esce (`subbedOff`). Nessuna scelta. **Invariata** |
| **Cambio della squadra 65'-70'** | `src/15:4350` | Orologio + `_rndTick` seedato (38%) | Testo + energia/momento. **Invariato** (non è una scelta) |
| **Panchina** (partenza dalla panchina) | Minuto d'ingresso `src/08-panchina-derby-meteo-cori.jsx:222` (`Math.random`, livello carriera); riscaldamento `src/15:1387` base (`Math.random`); progressione `src/15:1768` | Decisione del mister prima della partita | Nessuna scelta in partita; le schede INTX669 erano bloccate in panchina (`src/15:5819` base, `__CPM_NO_PANCA64`). **Non esisteva** una scelta del panchinaro (confermato: la collaudatrice non l'aveva trovata) |
| **Atteggiamento del motore** (non è un'interazione: è la leva che mancava) | `src/15:5449` → `chiedi.atteggiamento` `src/14:1156` → `att` `src/14:620` → solo `pTiro` `src/14:714` | Dal punteggio, ogni minuto | Misurato: il ramo di tiro principale del motore v2 (`tiroV2`, `src/14:754-756`) **non leggeva nessun atteggiamento**; l'atteggiamento toccava solo il ramo minore `pTiro` |

## 2. Cosa cambia (primo passo del piano)

Interruttore rosso **`__CPM_NO_INT226`**: con la bandierina accesa torna tutto il sistema vecchio (schede INTX669 a orologio, ordini a minuto fisso, riscaldamento da `Math.random`, motore che ignora la scelta).

**Parte pura nel motore** — `src/14-motore-possesso.jsx:43-79` `INT226` (leggibile anche dal banco Node):
- `FATTI`, in ordine di precedenza: `panca_sotto` (in panchina, squadra sotto, dal 20'), `panca_pari` (in panchina, pari dal 46'), `misura_85` (+1 dall'85'), `sotto_70` (sotto dal 70'), `pari_75` (pari dal 75'), `avanti_2` (+2 dal 60'), `eroe_stanco` (energia dell'eroe ≤55 dal 55'), `eroe_marcato` (≥2 duelli persi dall'eroe, esiti decisi da `decideExecution`, dal 25').
- `scegli(c)`: **tetto 3** a partita, **8'** fra due schede (5' per `misura_85`), ogni fatto una volta, una sola scheda di panchina, mai oltre l'88'. Nessun sorteggio: funzione pura dello stato.
- `att(id, idx)`: effetto della scelta (0 = «seguo l'ordine», 1 = «faccio di testa mia»).
- `ingresso(base, idx, seme, mn)`: «resto concentrato» lascia il minuto del mister; «chiedo di entrare» lo anticipa di 4-10' col seme, mai prima di due minuti da adesso. `riscaldamento(base, seme)`: 5-14' prima, col seme.
- Leva nel motore: `chiedi.ordine226(lato, v)` `src/14:1157` (separata da `atteggiamento`, che il live riscrive ogni minuto); fattore `_f226` `src/14:619` = `max(0,2; 1 + 0,9·v)` applicato a **`pTiro`** (`src/14:714`) **e alla conclusione v2 `pS`** (`src/14:756`).

**Live match** — `src/15-live-match.jsx`:
- `SCHEDE226` `:154-171`: una scheda per fatto, due opzioni, la prima è la neutra del timer. Stessa forma delle INTX669 → stesso binario (cronaca → `PopScelta919` → `scegli681`), nessuna UI nuova.
- Selezione `:5854-5869`: al posto del sorteggio INTX669 (che con `_on226` non gira più, `:5871`). Stessi cancelli di sicurezza (mai dentro un highlight, sopra un gol in costruzione, una recita o l'azione saliente); la panchina è ammessa solo per le schede `panca_*`.
- Scelta → motore `:2949-2966`: «seguo» = `ordine226` col valore del fatto **più** gli effetti dell'ordine di sempre (`COACH_ORDERS[...]`: bonus, possesso, momento, deriva); «di testa mia» = solo il suo valore. Panchina: ricalcolo del minuto d'ingresso (`benchMinRef226` `:1408`, stato `benchMinute`), con seme di partita + nome.
- Ordini a minuto fisso spenti nel sistema nuovo `:4324-4389` (`_no226o`).
- Riscaldamento col seme `:1410`.
- Testimone `window.__CPM_INT226` (`schede` con fatto, minuto, punteggio, energia, duelli; `scelte` con valore mandato al motore e minuti d'ingresso prima/dopo) `:6500`, `:2957-2964`. Aggancio di collaudo `__CPM_INT226_IDX` (solo `?cpmtest=1`) `:3063`: fa scegliere al timer anche l'opzione 1.

**Non toccati, di proposito:** grida del mister, reazione al gol subito, cambio 65'-70', sostituzione in uscita, intervallo; `src/08` (minuto d'ingresso deciso dal mister prima della partita, livello carriera — resta `Math.random`, dichiarato); zona G (carriera/classifica) intatta.

**Scelte mie, annotate:**
- I valori di `att` e K=0,9 sono di progetto, non vengono da una fonte. K=0,6 (prima stesura) dava +9,2% di tiri sulle schede d'attacco, sotto la soglia del 10% che mi ero dato; con K=0,9 → +12,2%.
- Con le schede INTX669 spente, i contatori narrativi (`marcatura`, `intesa`, `fiducia`, `zona`, `coinv`) non vengono più scritti dalle schede: le scene che li leggono tornano al loro valore neutro. È la riduzione chiesta dal piano; va guardata dal PO in partita.
- `eroe_marcato` usa i duelli persi dall'eroe (esiti del Decision Engine), perché il motore src/14 non espone una marcatura a uomo come fatto.

## 3. Numeri prima/dopo

**Schede a partita (partite vere di carriera, `save-194-primavera-w38`, autoplay seedato):**

| | schede | a orologio | con fatto del motore | ordini a minuto fisso |
|---|---|---|---|---|
| Prima (collaudatrice, 15 partite base 7.999.159) | 4,1 (4-5) | tutte | 0 | 4 per partita (28'/63'/75'/85') |
| Rosso `__CPM_NO_INT226` (guardiano, 2 partite) | 4 · 4 | 4 · 4 | 0 · 0 | attivi |
| Dopo (guardiano, 2 partite) | 2 · 3 | 0 · 0 | 2/2 · 3/3 | spenti |

Dettaglio verde: p0 3-2 → 55' `eroe_stanco`, 63' `avanti_2` (scelte «seguo», motore att226 −0,25 poi −0,45, letto dal motore = dichiarato); p1 1-1 → 55' `eroe_stanco`, 75' `pari_75`, 85' `sotto_70` (scelte «di testa mia», +0,15 / −0,15 / −0,2, letto dal motore = dichiarato).

**Effetto sul motore (banco Node, 24 configurazioni vere S12 × 13 semi = 312 partite per braccio, stessi semi):**

| braccio | schede/partita | max | gol casa/partita | tiri/min dopo scheda d'attacco | gol/min att. | tiri/min dopo scheda di difesa | gol/min dif. |
|---|---|---|---|---|---|---|---|
| seguo | 1,17 | 3 | 1,263 | 0,1510 | 0,0159 | 0,1438 | 0,0147 |
| di testa mia | 1,13 | 3 | 1,244 | 0,1346 | 0,0127 | 0,1796 | 0,0167 |
| rosso, seguo | 1,13 | 3 | 1,253 | 0,1397 | 0,0136 | 0,1669 | 0,0167 |
| rosso, di testa mia | 1,13 | 3 | 1,253 | 0,1397 | 0,0136 | 0,1669 | 0,0167 |

- «seguo» contro «di testa mia»: **tiri +12,2% / gol +25,2%** dopo le schede d'attacco (175), **tiri −19,9% / gol −12,0%** dopo quelle di difesa (137).
- Rosso: **0,0% / 0,0%** (i due bracci sono identici: la scelta non arriva al motore).
- Gol medi a partita invariati (1,26 / 1,24 contro 1,25 del rosso): la taratura del banco non si sposta.
- Prima stesura (solo `pTiro`, K=0,6): +1,6% / −2,6% di tiri — è la misura che ha trovato il ramo `tiroV2` sordo all'atteggiamento.
- Limite: il banco gioca le schede sul punteggio (energia e duelli non esistono in Node), quindi `eroe_stanco` ed `eroe_marcato` non sono nel campione Node; nel live le misura la parte C.

**Panchina (banco Node, 400 casi):** 400/400 corretti — «resto concentrato» = minuto del mister; «chiedo di entrare» anticipa in media **6,7'** (4-10', mai prima di +2' da adesso); deterministico 400/400. **Non verificato in una partita vera con partenza dalla panchina**: il percorso di collaudo `__CPM_FORCE_BENCH` non porta `benchStart` (la collaudatrice ha trovato `bench:false`), e non ho trovato nel tempo del giro un salvataggio che faccia partire l'eroe dalla panchina. Lo dichiaro come aperto.

## 4. Sonde ed esiti

Guardiano nuovo `tests/visual/interazioni-226.mjs` (`npm run interazioni-226`, aggiunto anche a `ci-runner.mjs` per `src/14` e `src/15` e fra i passi lenti):
- (A) banco motore 312×4 → **verde** (soglie: ±10% di tiri; rosso |scarto| < 3%).
- (B) panchina 400 casi → **verde**.
- (C) 2 partite vere verdi + 2 rosse → **verde**; rosso riconosciuto (0 schede nuove, 4 a orologio per partita).
- Esito: `✅ VERDE — interazioni nate dai fatti del motore, effetto misurato, prova del rosso riconosciuta`.

**Non regressione, base (e385bea6) prima di toccare:**

| sonda | base |
|---|---|
| partita-vera | ✅ OK |
| intervista-231 | ✅ verde, rosso visibile |
| esiti-218 | ❌ **già rosso sulla base**: verde 0 contraddizioni ma 8 scene contro il minimo di 12 (`esiti-218.mjs:44`); rosso 5 contraddizioni |
| tabellino-228 | ❌ **già rosso sulla base**: il braccio rosso coincide (2-0 = 2-0), come in `STABILITA` (commit 087f6f0b «tabellino-228 braccio rosso») |

**Dopo — catena `node ci-runner.mjs mirata e385bea6`** (26 passi: nucleo + guardiani di src/07, 14, 15):

Risultato: **25/26 verdi** (`docs/governo/STABILITA.json` aggiornato dal runner).

| passo | esito | nota |
|---|---|---|
| test:logic · save-compat · design-system · typing-shortcuts · classifica-102 | ✅ | nucleo |
| partita-rigiocata-194 · tabellino-216 · possesso-209 · brain-202 | ✅ | |
| lessico-218 · validate-situations · minuti-202 · ripresa-202 · recupero-202 · finale-202 · tetto-202 | ✅ | |
| career-critical · difesa-220 · scene-221 | ✅ | |
| **partita-vera** | ✅ | come sulla base |
| **intervista-231** | ✅ | come sulla base |
| **tabellino-228** | ✅ | sulla base era ❌ (braccio rosso coincidente): qui verde, non lo attribuisco al mio cambio |
| **esiti-218** | ⚠️ verde alla 2ª prova (10 scene, 0 contraddizioni) | sulla base ❌ (8 scene < 12): soglia delle scene al margine |
| nomi-219 | ⚠️ verde alla 2ª prova (1ª: vicini 89% < 90%) | **anche sulla base ❌** (vicini 86% < 90%), rilanciato a parte |
| **tempo-138** | ❌ | vedi sotto |

**tempo-138 — braccio rosso che non si vede.** Il verde è sempre verde (debito residuo 0 al fischio). È il **rosso** (`__CPM_NO_TEMPO138`) che deve lasciare debito: sulla base lo lascia **2 volte su 2** (residuo 18 e 14), sul ramo **1 volta su 5** (residuo 0, 0 nei due tentativi della catena; 0, 0, **2** in tre giri a parte). La stessa partita seedata cambia molto fra un giro e l'altro (debito aperto 132-352), quindi è un rosso al margine. Ho aggiunto `__CPM_NO_INT226` al braccio rosso del guardiano (`tests/visual/tempo-138.mjs`), perché il suo rosso era tarato sul calendario delle pause delle vecchie schede: con quel cambio il rosso si è visto 1 volta su 3. Col rosso `__CPM_NO_INT226` acceso il codice del ramo segue gli stessi percorsi della base (selezione, ordini, timer, riscaldamento, fattore del motore = 1) e non ho trovato un percorso che spieghi la differenza: **non posso confermare** se è solo instabilità o un effetto indiretto. Il verde (il difetto che il guardiano protegge) non è toccato.

## 5. Integrazione

Nel corso del giro `origin/poc/marioprada-character-system` è avanzata (7.999.162 seme + PO-232, PO-230). Prova di fusione in una copia separata: `src/14` e `src/15` si fondono **senza conflitti**; conflitti solo banali in `src/07` (due commenti di `GAME_VERSION` adiacenti), `tests/visual/package.json` (`seme-a` e `interazioni-226` sulla stessa riga) e nell'HTML generato (si ricompone con `CPM_FORZA_BUILD=1 node tools/build-src.mjs`). Non ho fuso: il compito fissava la base 7.999.161 e le misure valgono su quella.

## 6. Aperti

- Partita vera con partenza dalla panchina: la scheda `panca_*` e il nuovo minuto d'ingresso sono provati in Node, non in una partita vera (vedi §3).
- I contatori narrativi delle vecchie schede restano a zero nel sistema nuovo: da guardare dal vivo.
- I valori di `att` e K sono una scelta di progetto: il PO può chiedere più o meno peso.
- `tempo-138`: braccio rosso visto 1 volta su 5 sul ramo contro 2 su 2 sulla base (§4), causa non trovata.

STATO: NON CHIUSO — il sistema nuovo è fatto e il suo guardiano è verde con la prova del rosso, ma la catena mirata è 25/26 (tempo-138: il braccio rosso si vede 1 volta su 5 sul ramo contro 2 su 2 sulla base, causa non trovata) e la scelta della panchina è provata solo al banco Node, non in una partita vera partita dalla panchina.
