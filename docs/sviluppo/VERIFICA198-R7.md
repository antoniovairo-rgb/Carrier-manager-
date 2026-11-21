# Verifica della 7.999.198 — parte R7

Base: `prova/198-finale` (6b79812c). Ramo: `sviluppo/verifica198-r7`. Banco: sessione cloud, un controllo alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), 16 GB di memoria, 59 GB liberi su disco all'avvio.
Nessuna correzione: solo misura e rapporto.

## Tabella

| # | Controllo | Origine | Esito sul banco (6b79812c) | Durata | Numeri letti dal registro | Nasce dall'unione? |
|---|---|---|---|---|---|---|
| 1 | gol-eroe-154 | «non concluso» nella R6 (tetto 60 min, 17 partite su 20) | **VERDE** (uscita 0, «✅ gol-eroe-154 verde e rosso»), corsa unica intera (campione fisso k1…k8, k21, k22 × verde/rosso, due partite per volta come da valore predefinito dello script), tetto 110 min | 3839 s (64,0 min) | VERDE: 10/10 partite valide · rigori provocati all'eroe passati al compagno 7/7 · gol eroe fluido 0 · assist eroe fluido 0 · gol eroe in scena 8 · gol eroe registrati per partita 0,80 (fascia 0,2-1,2) · partite con gol dell'eroe 6/10. ROSSO (`__CPM_NO_G154`): 10/10 valide · rigori provocati con l'eroe battitore 7 · gol eroe fluido 3 (k1, k4, k6) · assist fluido 0 · gol registrati per partita 1,10. Nessuna partita riprovata (0 righe «riprovo»); 321-439 s a partita | non applicabile (verde sull'unione: nessuna riesecuzione su `lavoro/198`) |
| 2 | chiusura-99 (seconda corsa sul banco) | rosso su Actions (verde D9, gi42 `#dc2626` contrasto 2,29 < 3), verde sul banco nella R6 | **VERDE** (uscita 0, «✓ chiusura-99 VERDE») | 2078 s (34,6 min) | verde D9: 6/6 gol, mediana 4,74, sotto 3: 0 — gi8 4,61 · gi18 5,91 · gi25 5,07 · **gi42 `#dc2626` locale 21 · quadro 4,74** · gi52 4,61 · gi63 4,55 · verde RIC 5/5 (100%) · rosso D9 (`__CPM_NO_G99D9`): mediana 1,29, 5 sotto 3 (gi42 1,03) · rosso RIC (`__CPM_NO_G99RIC`): 4/5 (seme 1234: servito 8, nominato 9, a 45,2 u) | non applicabile (verde sull'unione) |

## Note su gol-eroe-154

- La corsa è stata eseguita intera e non nelle due metà con `K`: il giudizio dello script ha minimi sul campione
  (partite valide e rigori provocati con l'eroe battitore) e una fascia sulla media dei gol, quindi due metà
  avrebbero dato due giudizi su campioni diversi da quello dichiarato dal controllo.
- Nelle partite k7, k8, k22 il rigore provocato non è toccato all'eroe («eroe fuori dal campo») in entrambi i
  bracci: lo script le conta come valide ma non come testimoni del rigore (7 testimoni su 10 per braccio).
- Il controllo dura 64 minuti sul banco: col tetto di 60 minuti della R6 non poteva concludersi. La R6 stimava
  circa 70 minuti; la misura la conferma nell'ordine di grandezza.

## Note su chiusura-99

- Seconda corsa verde sul banco: con la R6 fanno **due corse verdi su due** sul banco (R6 su 0f0b13d8, R7 su 6b79812c).
- La scena gi42 (`#dc2626`), quella rossa su Actions con «quadro 2,29», misura sul banco «quadro 5,00» nella R6 e
  «quadro 4,74» nella R7: sul banco oscilla di 0,26 fra due corse e resta sopra la soglia 3 con margine.
  Anche le altre scene si muovono fra le due corse (mediana 5,08 → 4,74): la misura «quadro» non è identica
  da una corsa all'altra nemmeno sulla stessa macchina.
- Il rosso di Actions **non è stato riprodotto sul banco**. Non posso confermare la causa della differenza
  (macchina di Actions oppure commit `prova-ci/198-finale` 2d8f68dc): qui non ho eseguito il controllo su quel
  commit né su Actions. Le due corse del banco sono inoltre su due commit diversi dell'unione.

## Verdetto

**Entrambi i controlli sono VERDI sul banco su `prova/198-finale` (6b79812c).**

1. `gol-eroe-154` si conclude **verde** in 64,0 minuti (uscita 0, bracci verde e rosso entrambi giudicati, 20 partite
   valide su 20, nessuna riprovata). Il «non concluso» della R6 era solo il tetto di 60 minuti: il controllo
   richiede circa 64 minuti a due partite per volta. Non essendo rosso, la riesecuzione su `lavoro/198`
   (b3b75b9d) non era dovuta e non è stata fatta: nessun difetto nasce dall'unione per questo controllo.
2. `chiusura-99` è **verde anche alla seconda corsa** sul banco (gi42 a 4,74 contro la soglia 3). Il rosso visto
   su GitHub Actions (gi42 a 2,29) resta **non riprodotto sul banco e senza causa accertata**: il controllo va
   considerato verde sul banco e divergente fra banco e Actions.

### Limiti dichiarati

1. Il rosso di `chiusura-99` su Actions non è stato indagato oltre la seconda corsa richiesta (nessuna corsa sul
   commit 2d8f68dc, nessuna corsa su Actions).
2. `gol-eroe-154` è stato eseguito una sola volta (nessuna seconda corsa di conferma).
3. I registri completi delle due corse stanno nella cartella temporanea della sessione e non sono nel
   repository; i numeri della tabella sono trascritti da lì.
4. Tempo totale di sessione: circa 1 ora e 45 minuti, dentro il tetto di 2,5 ore.

Nessun file di gioco toccato, nessuna foto in `docs/` rigenerata dai controlli (albero pulito dopo ogni corsa),
`GAME_VERSION` invariata.
