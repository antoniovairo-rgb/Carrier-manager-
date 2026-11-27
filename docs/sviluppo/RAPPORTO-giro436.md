# Rapporto del giro 436 — la partita delle sonde più veloce (PO-627)

Base: `main` @ f3cf45c (7.999.218). Ramo di consegna: `sviluppo/giro436-ledger-veloce`.
Non toccati: il gioco (`src/`, il file ricomposto), `GAME_VERSION`, `docs/governo/**`, licenze.
Toccati solo gli strumenti di controllo: `event-ledger-test.mjs`, `marcatore-325.mjs`, una riga della MAPPA in `ci-runner.mjs`,
e la sonda nuova `misura-436.mjs`.

## 1. Misura prima

**Sintomo, riprodotto.** `CPM_PARTITE=1 node event-ledger-test.mjs` sulla base: «partita 1 ⚠ non arrivata al fischio», 0/1
partite valide, uscita 2 (CIECO), dopo 257 s.

**Dove va il tempo** (sonda nuova `misura-436.mjs`, una partita, «Ledger1000», campione ogni 2 s):

| banco | minuto raggiunto in 240 s | in `playing` |
|---|---|---|
| 900×900, velocità 1× | 44' | 233 s |
| 900×900, velocità 2× | 46' | 232 s |

La velocità scelta non cambia quasi niente. Il minuto ha 22 sotto-passi da 77 ms nominali (1700/22), ma ne arriva uno ogni
~230 ms: il metronomo `setInterval` parte in ritardo perché il thread principale è occupato.

**Chi lo occupa** (profilo CPU via CDP, 30 s di gioco fluido a 900×900): il **98,3 %** è «(program)», cioè lavoro nativo del
browser: disegno, rasterizzazione e composizione della pagina in software, perché il banco non ha GPU. Il JavaScript del gioco è
sotto l'1 % (`disegna` del campo 2D 0,2 %). La tela WebGL in gioco fluido **non disegna**: 0 chiamate `drawElements/drawArrays`
in 10 s. Quindi nel gioco non c'è nessun difetto: il costo è del banco, e cresce coi pixel:

| viewport | minuti di gioco in 30 s |
|---|---|
| 900×900 | 5 (8'→13') |
| 412×915 | 5 (10'→15') |
| 320×320 | 18 (18'→36'), circa il ritmo nominale 1× (1,7 s/minuto) |

## 2. Correzione alla fonte: le sonde

Visto che la misura non trova difetti nel gioco, `__CPM_NO_G436` non esiste e il gioco non cambia.

**`event-ledger`**
- La partita si gioca a **360×360** e a **2×** (`cpm-match-speed`, la stessa preferenza del comando di velocità in partita).
  Il libro mastro misura eventi e non immagini; la cronaca è funzione pura del minuto (7.489). Misurato: stessa partita a 1× e a 2×,
  **283 eventi in entrambe**, fischio in **155 s** a 1× e **108 s** a 2×. Prima non arrivava al fischio in 240 s.
- **Soglia invariata**: `CPM_TETTO` resta 240 s. `CPM_VW/CPM_VH/CPM_VEL` riportano al banco di prima (900/900/1).
- **«Non giudicato» = rosso**: prima bastava che arrivasse al fischio UNA partita su tre (`!valide`), adesso servono tutte.
- **Rosso visibile**: `npm run event-ledger` gira i due bracci. Il verde ha 3 partite. Il rosso è `__CPM_NOEV`, 1 partita
  (`CPM_PARTITE_ROSSO`): col registro spento il libro mastro è vuoto e la sonda deve dichiararsi cieca. `CPM_BRACCIO` ne gira uno solo.
  `CPM_ROSSO=1` funziona come prima.
- **MAPPA**: `event-ledger` non aveva nessuna riga. Entra nella riga di `src/15-` che esiste già, accanto a `marcatore-325`
  (il libro mastro `cpmEv` vive lì). `npm run mappa-unica` è verde.

**`marcatore-325`**
- La **partita intera** adesso si gioca di default: una su quattro, cioè 2 per braccio con 8 partite. Prima andava chiesta a mano
  (`CPM_INTERE=1 CPM_TETTO=600000`). Si gioca a 360×360 e 2×. Le partite a soli highlight restano sul telefono 412×915, come prima.
- **Tetto invariato**: 300 s. Misurato: l'intera arriva al fischio in **129 s**, 0 discordanze su 3 gol (braccio verde, 4 partite).
- Se non si gioca nessuna partita intera (meno di 4 partite per braccio), il risultato è **non giudicato = rosso**. Il riepilogo
  stampa «intere al fischio x/y». `CPM_INTERE=0` le toglie.

## 3. Esito del giro

`node ci-runner.mjs giro event-ledger marcatore-325` (19 passi: i due guardiani + 17 sentinelle):

ESITO_GIRO

## 4. Dubbi per il PO

**D1 — Il banco delle partite intere: schermo piccolo e 2× (applicata) oppure altro?**
1. **(consigliata, applicata)** Schermo piccolo (360×360) e velocità 2× solo per le partite intere delle sonde logiche. Si
   guadagnano 2,2× o più a tetto invariato e non si tocca il gioco. Il limite è che quelle due sonde non vedono più la partita alla
   misura del telefono. Per l'aspetto ci sono già i guardiani grafici.
2. Solo 2×, a 412×915 (il telefono). Non basta: a 900×900 e 2× si arriva al 46' in 240 s, e a 412×915 il costo per minuto è lo stesso.
3. Un gancio nel gioco che spenga il disegno del campo durante le sonde. È più veloce ancora, ma tocca `src/` per uno strumento e
   allarga la distanza fra banco e partita vera.
4. Alzare i tetti (600 s). È vietato: è la soglia che il PO ha voluto invariata.

**D2 — I corpi (GLB).** Le regole del giro dicono «GLB acceso», ma le due sonde nascono con `__CPM_GLB=false` (sono sonde di
logica: gol, nomi, tabellone) e così le ho lasciate.
1. **(consigliata, applicata)** Lasciarle spente. Misurano il libro mastro e i nomi, che non dipendono dai corpi, e il gioco fluido
   è 2D.
2. Accenderle. Costa di più negli highlight, e sul tetto di 240 s va rimisurato.
3. Un terzo braccio a corpi accesi solo nel treno notturno.

**D3 — Il rosso di `event-ledger` con una partita sola.**
1. **(consigliata, applicata)** Una partita: col registro spento la cecità è per costruzione.
2. Tre partite come il verde: circa 5 minuti in più per giro, senza informazione nuova.
3. Nessun rosso nell'`npm run` (com'era prima), solo a mano.
