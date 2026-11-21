# Verifica della 7.999.198 — parte R5

- **Codice sotto prova:** `prova/198-finale` (`0f0b13d8`), ramo di lavoro `sviluppo/verifica198-r5`.
- **Base di confronto:** `lavoro/198` (`b3b75b9d`), usata solo per i rossi.
- **Motivo:** su GitHub Actions (corsa 44830113928, stesso codice) le parti 8 e 12 di 16 sono fallite senza
  che si sappia quale guardiano. Qui i controlli girano sul banco, uno alla volta (`CPM_CI_PAR=0`,
  `CPM_CHROME=/opt/pw-browsers/chromium`), ciascuno fino in fondo (tetto 30 minuti).
- **Regole:** nessuna correzione, nessuna soglia toccata, «non giudicato» = rosso. `avvio-233` saltato
  (già verde nella V4).

## Tabella

| controllo | esito su finale | esito sulla base | nato da quale giro | nota |
|---|---|---|---|---|
| portiere-252 | **verde** (rc 0, 845 s; verde KO 0/11, rosso KO 2/11) | non eseguito (verde) | — | Il guardiano dichiara «n.g. (bruciapelo < 0,2 s)» 3 scene su 11 per braccio (gi16, gi1, gi1@88,86) e resta verde: è una sua esclusione scritta, non l'ho rigiudicata. |
| guardalinee-222 | **verde** (rc 0, 414 s; 4 verdetti verdi, col rosso `__CPM_NO_G222` 6 verdetti rossi) | non eseguito (verde) | — | Verde col verde e rosso col rosso. |
| pc-tablet-292 | **verde** (rc 0, 686 s) | non eseguito (verde) | — | Cinque misure verdi (PC 1366 e 1920, tablet nei due versi, telefono identico con e senza interruttori); il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia. |
| scena3d-96 | **verde** (rc 0, 1403 s; scene giudicate 31/31, errori di pagina 0) | non eseguito (verde) | — | Telefono, PC, tablet nei due versi; ingresso in campo verde su telefono e PC. Il controllo più lungo finora (23 minuti). |
| passaggio-coppa-137 | **verde** (rc 0, 130 s) | non eseguito (verde) | — | Verde col verde; i tre rossi (capitano che alza, passaggio, festa) si vedono tutti. |
| piedi-252 | **verde** in due corse (rc 0; 212 s e 217 s) | non eseguito (verde) | — | Margini stretti: mediana verde 0,386 e 0,371 contro il tetto 0,4; mediana rossa 0,467 e 0,482 contro il minimo «verde + 0,08» (0,466 e 0,451). Alla prima corsa il braccio rosso passa per 0,001: su una macchina più lenta è un candidato a cadere. Seconda corsa fatta per questo. |
| ingresso-camminata-245 | **verde** (rc 0, 238 s) | non eseguito (verde) | — | Verde: 11+11 al posto, velocità massima 2,21, clip di camminata letta. Il rosso si vede (velocità massima 6,52, nessuna clip di camminata). |
| coreografie-244 | **non finito in 30 minuti = rosso** (fermato a 1800 s, rc 124) | in corso | da stabilire | Dove era: le 30 partite del braccio verde erano finite (30/30 con coreografia, 14 distinte su 8 richieste, 0 uguali di fila, 4 che si muovono su 3 richieste) e stava misurando gli fps: braccio «verde» misurato (2,32 fps su 350 fotogrammi), braccio «rosso» degli fps ancora in corso. La seconda metà del controllo (`CPM_PROVA_ROSSO=1`, 8 partite) non è mai partita. La riga «❌ fps non misurati» stampata dopo il taglio è effetto del mio arresto, non un giudizio del guardiano. |
| memoria-275 | **verde** (rc 0, 459 s) | non eseguito (verde) | — | Scene 1 · renderer 2→2 · corpi animati 869→883 · memoria dopo la pulizia 194 MB · errori di pagina 0. Prima di togliere gli agganci di collaudo la seconda apertura tiene due scene (300 MB): è la misura dichiarata dal guardiano, che giudica dopo averli tolti. |
| rigorista-257 | **verde** (rc 0, 309 s) | non eseguito (verde) | — | Tutti i punti A1–A3, B1–B3, C1–C2 verdi col verde e rossi col rosso (`__CPM_NO_G257`, `__CPM_NO_G262`). |
| parata-258 | **verde** (rc 0, 80 s) | non eseguito (verde) | — | 4/4 parate col pallone sulle mani, pallone dietro il portiere 0. |

## Verdetto

In corso: nessun verdetto finché la tabella non è completa.
