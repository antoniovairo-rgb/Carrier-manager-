# Verifica della 7.999.198 — parte R7

Base: `prova/198-finale` (6b79812c). Ramo: `sviluppo/verifica198-r7`. Banco: sessione cloud, un controllo alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), 16 GB di memoria, 59 GB liberi su disco all'avvio.
Nessuna correzione: solo misura e rapporto.

## Tabella

| # | Controllo | Origine | Esito sul banco (6b79812c) | Durata | Numeri letti dal registro | Nasce dall'unione? |
|---|---|---|---|---|---|---|
| 1 | gol-eroe-154 | «non concluso» nella R6 (tetto 60 min, 17 partite su 20) | **VERDE** (uscita 0, «✅ gol-eroe-154 verde e rosso»), corsa unica intera (campione fisso k1…k8, k21, k22 × verde/rosso, due partite per volta come da valore predefinito dello script), tetto 110 min | 3839 s (64,0 min) | VERDE: 10/10 partite valide · rigori provocati all'eroe passati al compagno 7/7 · gol eroe fluido 0 · assist eroe fluido 0 · gol eroe in scena 8 · gol eroe registrati per partita 0,80 (fascia 0,2-1,2) · partite con gol dell'eroe 6/10. ROSSO (`__CPM_NO_G154`): 10/10 valide · rigori provocati con l'eroe battitore 7 · gol eroe fluido 3 (k1, k4, k6) · assist fluido 0 · gol registrati per partita 1,10. Nessuna partita riprovata (0 righe «riprovo»); 321-439 s a partita | non applicabile (verde sull'unione: nessuna riesecuzione su `lavoro/198`) |
| 2 | chiusura-99 (seconda corsa) | rosso su Actions (D9, gi42 contrasto 2,29 < 3), verde sul banco nella R6 | in corsa | — | — | — |

## Note su gol-eroe-154

- La corsa è stata eseguita intera e non nelle due metà con `K`: il giudizio dello script ha minimi sul campione
  (partite valide e rigori provocati con l'eroe battitore) e una fascia sulla media dei gol, quindi due metà
  avrebbero dato due giudizi su campioni diversi da quello dichiarato dal controllo.
- Nelle partite k7, k8, k22 il rigore provocato non è toccato all'eroe («eroe fuori dal campo») in entrambi i
  bracci: lo script le conta come valide ma non come testimoni del rigore (7 testimoni su 10 per braccio).
- Il controllo dura 64 minuti sul banco: col tetto di 60 minuti della R6 non poteva concludersi. La R6 stimava
  circa 70 minuti; la misura la conferma nell'ordine di grandezza.
