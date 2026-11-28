# Rapporto giro 446 — perché il censimento dei salti giocava 3 scene in 15 minuti (PO-643)

Ramo `sviluppo/giro446-censimento-salti` (da `main`, 7.999.219). Toccato **solo** `tests/visual/ball-jump-census.mjs`.
Gioco, `GAME_VERSION`, `docs/governo/*` e soglie **non toccati**. Nessun rosso `window.__CPM_NO_G446` nel gioco: il difetto
non era del gioco (vedi sotto). Il rosso è della sonda: `CPM_NO_G446=1`.

## 1. Dove andava il tempo (misura prima)
Traccia delle fasi (`__CPM_PHASE`, una lettura per giro) sulla sonda vera, budget ridotto a 420 s, GLB spento come allora:
- 5 scene nei primi 128 s, poi **dal 220 s al 435 s sette attese da 30 s di fila, tutte in `hl_move`**, stessa partita: la
  partita era inchiodata. È la firma della CI (`3/26 scene su 1 partite`, STABILITA del 23/11).
- La lettura della fase costa 1-90 ms, lo snapshot del testimone ~250 ms: non sono loro.

## 2. Causa
`hl_move` passa da solo a `hl_choose` grazie al timer di pressione (8 s, src/15). Quel timer **non parte** sulle scene a
movimento bloccato (`lockMovement` / `maxMoves===0`: rigori e punizioni, «no pressure on penalty/free kick»): lì il gioco
aspetta il giocatore, che preme «Tira» o il tasto 0. La sonda aspettava solo `hl_choose` e non faceva mai la parte del
giocatore: **il primo piazzato fermava il censimento per il resto del budget**. Non è un difetto del gioco: è il tempo di
lettura del piazzato, voluto (in partita vera il pulsante c'è).

Seconda causa, di ritmo: sul banco il cronometro gira a **~4 s reali per minuto di gioco** (contro 1,7 nominali, timer contesi
in headless; misurato con `__CPM_CLOCK`), quindi una partita intera dura ~6 minuti e dà 7-8 scene. A 1x in 15 minuti ne
stanno 19 al massimo, mai 26.

## 3. Correzione (solo sonda)
1. Se la fase resta `hl_move` oltre il timer di pressione (9 s di parete), la sonda preme **0**: lo stesso tasto del
   giocatore, lo stesso `setPhase("hl_choose")`. Le scene con pressione passano da sole come prima (8 s).
2. **GLB acceso** di default (direttiva PO 29/07). Prima era spento. `CPM_GLB=0` lo rispegne.
3. **Velocità 2x** (`cpm-match-speed`, la manopola del giocatore). Muove solo `playing`: finestre d'esito invariate (7.484),
   sequenza della partita identica a ogni velocità (7.489). `CPM_SPEED=1` torna a 1x.
4. La riga di copertura dichiara anche: piazzati portati alla scelta col tasto 0, attese di 30 s senza scena, velocità, GLB.

Soglie invariate: bersaglio 26, minimo 13, budget 900 s, cieco = uscita 2.

## 4. Misure dopo
| Braccio | Copertura | Partite | Tasto 0 | Esito |
|---|---|---|---|---|
| prima (CI 23/11) | 3/26 | 1 | — | ❌ uscita 2 |
| correzione 1, GLB spento, 1x | 19/26 | 3 | 2 | ✅ |
| **correzione 1+2+3, GLB acceso, 2x** | **23/26** | **4** | **3** | **✅** (0/27 salti scoperti, tutti dentro lo stacco) |
| rosso `CPM_NO_G446=1`, GLB acceso, 2x | 5/26 | 1 | 0 | ❌ uscita 2 (inchiodata in `hl_move`) |

Giro ufficiale `node ci-runner.mjs giro ball-jump-census`: vedi sezione 6. (Il ci-runner scrive `docs/governo/STABILITA.json`:
quella scrittura **non** è nel commit, per la regola del giro; l'esito è riportato qui.)

## 5. Dubbi per il PO
**D1 — «copertura piena» = 26/26?** Oggi arriva a 23/26 (sopra il minimo 13, verde). Il bersaglio 26 non si tocca.
1. **(consigliata, applicata)** Tenere bersaglio 26 e minimo 13: il verde vale col minimo, la riga dice quanto manca.
2. Alzare il budget a 20 minuti (non è una soglia di giudizio ma allunga il treno di ~5 minuti) per arrivare a 26.
3. Nel gioco fluido premere «salta» (tasto 0 in `playing`, il percorso del giocatore) per arrivare prima alla scena: 26 in
   meno tempo, ma la scena parte da un pallone che non ha finito il suo gioco fluido, cioè misura aperture diverse da quelle
   del gioco vero. Sconsigliata.

**D2 — premere 0 sul piazzato.**
1. **(consigliata, applicata)** Solo dopo 9 s fermi in `hl_move` (oltre il timer di pressione): tocca solo i piazzati.
2. Premere 0 subito in ogni `hl_move`: ~8 s risparmiati a scena, ma si taglia la fase di lettura che il censimento guarda.
3. Usare l'autoplay del gioco (`__CPM_AUTOPLAY`), che sceglie sul battito di pressione: più fedele, ma cambia anche le
   scelte (oggi la sonda risolve sempre l'azione 0) e quindi non si confronta con le passate precedenti.

**D3 — velocità e GLB.**
1. **(consigliata, applicata)** GLB acceso + 2x: rispetta la direttiva CH38 e recupera il tempo che il GLB costa.
2. GLB acceso + 1x: più vicino al gioco di default, ma la copertura scende (stima dalla misura a GLB spento: ≤19).
3. GLB spento + 2x: più scene, ma contro la direttiva 29/07.

## 6. Giro ufficiale
`node ci-runner.mjs giro ball-jump-census` su 7.999.219 (questo ramo): **18/18 verdi**, `ball-jump-census` verde in 926 s
alla prima prova (nessun rilancio), 17 sentinelle verdi (partita-vera 632 s, career-critical 338 s, battito-264 375 s, ...).
`docs/governo/STABILITA.json` e le schermate di `docs/collaudo-grafico/g0` rigenerate dalle sentinelle sono state ripristinate
e non sono nel commit.

⚠️ La copertura varia fra le corse (timer contesi): 19, 23 scene nelle due corse verdi misurate qui. Stabile è la causa (una
partita sola inchiodata su un piazzato nel braccio rosso, 3-5 scene), non il numero esatto.
