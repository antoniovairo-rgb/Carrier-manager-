# Giro 350 — i due rossi nuovi del treno 45339800115 (7.999.208)

Base: `lavoro/201` punta **07e15e4c** (treno della 7.999.208: vagoni 345 fasce, 346 tiro e movimenti, 347 gol del motore sopra la
7.999.207). Confronto: tag **v7.999.207** (prima dei tre vagoni). Banco: sessione cloud, `CPM_CHROME=/opt/pw-browsers/chromium`,
ogni guardiano con `npm run`, la base in un worktree a parte. Ramo di consegna: `sviluppo/giro350-rossi-208`. `GAME_VERSION` non
toccato.

**Esito in una riga:** nessuna regressione dei vagoni. I due rossi sono strumenti che misuravano il tempo, non il gioco: le unioni
intermedie (946f7bf, 256a14f) non sono servite, perché lo stesso difetto si vede già su v7.999.207, prima dei tre vagoni.

| guardiano | punta 07e15e4c | v7.999.207 | vagone responsabile | causa | correzione |
|---|---|---|---|---|---|
| tiro-346 (B, identità «senza passi») | verde 109/109 sul banco, e **due pagine verdi una contro l'altra: 1 e 4 diversi su 109** | (il guardiano non esiste) stessa misura: due pagine verdi **4 e 0 diversi su 109** | **nessuno** | l'identità confrontava il gol atteso da fermo di DUE pagine (braccio verde e braccio rosso). La partita aperta da `openMatch` avanza in tempo reale fra l'apertura e il conto (1,5 s di attesa + caricamento): i difensori del motore non sono nello stesso posto nelle due pagine e il gol atteso di qualche tiro cambia. Sul runner, più lento, basta una scena: «1 diversi su 109» | **guardiano** (`movimenti-346.mjs`): l'identità si misura nella stessa pagina e sullo stesso stato — il conto così com'è, poi lo stesso conto col rosso `__CPM_NO_G346B` acceso per un istante, senza tick in mezzo; `tiro-346.mjs` confronta quei due. Soglia invariata (zero differenze su almeno 50). Banco: **109 uguali su 109**, rosso del braccio B visto (0 tiri su 1090 cambiano col rosso) |
| solo-highlight-166 (controllo 10, runner) | controllo 10 **verde 4 passate su 4** (voci identiche, risultato identico) | verde | **nessuno** | sul runner una voce su 245 del libro mastro diversa fra soli highlight e partita intera: voce 150, riga di cronaca con il pallone a y **49,2 contro 49,1** (campo `bax/bay`, sola strumentazione, letto da `ballPosRef`); risultato 4-1 identico, tabellino/interviste/durata verdi. **Non posso confermare la causa**: sul banco non si riproduce. Ipotesi non misurata: `ballPosRef` si allinea allo stato React in un effetto (`useEffect`, src/15 r. 2861) e una lettura nel battito prima dell'effetto dipende dal carico della macchina | riga `solo_runner` in ROSSI-DICHIARATI |
| solo-highlight-166 (12b, banco) | **rosso 3/3** «partita non chiusa» | finisce allo stesso modo | **nessuno** | sul banco la partita intera «Collaudo Sorpresa 4» chiude al 93' dopo **425 s** reali (punta) e **422 s** (v7.999.207), con gli stessi eventi, lo stesso 3-0 e la fine «clock»: oltre il tetto d'ATTESA della sonda (420 s). Sul runner la stessa partita sta sotto i 210 s (12b verde nel treno) | **guardiano**: tetto d'attesa della partita 420 → 600 s. Non è una soglia di qualità: una partita che non chiude resta «non giudicato» = rosso |

## Cosa ho misurato, in ordine

1. `CPM_SOLO=B node tiro-346.mjs` sulla punta: verde, 109 uguali su 109. Il rosso del runner non si riproduce.
2. Tre banchi verdi di fila (`banco({stati:0})`, nessun rosso): fra loro 1 e 4 gol attesi diversi su 109 → il confronto fra pagine non
   è un'identità. Stessa sonda su v7.999.207: 4 e 0 → il difetto c'è da prima del giro 346 (là `mov` non esisteva).
3. Log della parte 25 (job 138260805069): controllo 10 rosso per una sola voce (sopra). I controlli 11, 12, 12b e 13 erano verdi.
4. `npm run solo-highlight-166` sulla punta da sola, tre volte: controllo 10 verde tutte e tre; 12b rosso tutte e tre («partita
   non chiusa»). Con punta e base in parallelo: punta 12b rosso, base verde.
5. Sonda sulla sola partita intera «Collaudo Sorpresa 4» con tetto 900 s, punta e base: finiscono **entrambe** (425 s · 422 s),
   stessi ultimi eventi, stessa fine. Il 12b del banco era il tetto.

## Decisioni del PO toccate

Nessuna: nessun guardiano allineato a una decisione, nessuna soglia abbassata. Le due correzioni sono di strumento (stesso stato
per un'identità; tetto d'attesa e non di qualità).

## Rigiocata dopo le correzioni

Banco, punta del ramo (056ca50f): tiro-346 **verde** (B: 109 uguali su 109, rosso del braccio B visto) · solo-highlight-166
**verde** (controllo 10: 245/245 voci, 4-1 identico; 12b chiuso in entrambe le partite; rosso: cade su 3, 7 e 8).

Catena del giro (`node ci-runner.mjs giro tiro-346 solo-highlight-166 fasce-345 gol-347 esiti-241 partita-vera career-critical`,
+ sentinelle, 22 passi): **22/22 verdi** — tiro-346 524 s · fasce-345 115 s · gol-347 248 s · esiti-241 358 s ·
solo-highlight-166 1078 s · partita-vera 750 s · career-critical 353 s · le sentinelle tutte verdi. Esito registrato in
`docs/governo/STABILITA.json`. (Il runner stampa «su 7.999.207»: è la `GAME_VERSION` del file, non toccata.) Le foto che la
sentinella grafica rigenera in `docs/collaudo-grafico/g0` non sono state committate.

## Da sapere (fuori ambito)

- `ROSSI-DICHIARATI.json` è cambiato solo sul ramo: il rilascio lo legge da **main**. Le due righe `solo_runner` (tiro-346,
  solo-highlight-166) servono solo se il prossimo treno li rivede rossi sul runner; tiro-346 dopo la correzione dovrebbe essere verde
  anche lì, e la sua riga si può togliere al primo treno verde. Non le ho portate su main (push sul ramo di produzione non chiesto).
- Il controllo 10 di solo-highlight-166 resta l'unico punto senza causa misurata. Se torna rosso sul runner, il passo successivo è
  una sonda che registri `ballPosRef` e lo stato `ballPos` nello stesso battito (CPM_G166_DUMP salva già le due sequenze).
