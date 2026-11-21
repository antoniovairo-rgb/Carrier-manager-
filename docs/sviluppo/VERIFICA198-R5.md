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
| coreografie-244 | **non finito in 30 minuti = rosso** (fermato a 1800 s, rc 124) | **non finito in 30 minuti = rosso**, identico (fermato a 1800 s, rc 124) | nessuno: non nasce dall'unione | Sul finale e sulla base si ferma nello stesso punto: le 30 partite del braccio verde finite (30/30 con coreografia, 14 distinte su 8 richieste, 0 uguali di fila, 4 che si muovono su 3 richieste — numeri e firme identici nei due rami), poi la misura degli fps: braccio «verde» misurato (2,32 fps sul finale, 2,36 sulla base, 350 fotogrammi), braccio «rosso» degli fps ancora in corso allo scadere. Sulla base le 30 partite più la riapertura hanno preso 26 minuti (tempi segnati riga per riga); sul finale lo stesso passo. La seconda metà del controllo (`CPM_PROVA_ROSSO=1`, 8 partite) non è mai partita in nessuno dei due. La riga «❌ fps non misurati» stampata dopo il taglio è effetto del mio arresto, non un giudizio del guardiano. Il file del guardiano è identico nei due rami. Non ho cercato il giro (`__CPM_NO_G293…G302`) perché la base si comporta allo stesso modo. |
| memoria-275 | **verde** (rc 0, 459 s) | non eseguito (verde) | — | Scene 1 · renderer 2→2 · corpi animati 869→883 · memoria dopo la pulizia 194 MB · errori di pagina 0. Prima di togliere gli agganci di collaudo la seconda apertura tiene due scene (300 MB): è la misura dichiarata dal guardiano, che giudica dopo averli tolti. |
| rigorista-257 | **verde** (rc 0, 309 s) | non eseguito (verde) | — | Tutti i punti A1–A3, B1–B3, C1–C2 verdi col verde e rossi col rosso (`__CPM_NO_G257`, `__CPM_NO_G262`). |
| parata-258 | **verde** (rc 0, 80 s) | non eseguito (verde) | — | 4/4 parate col pallone sulle mani, pallone dietro il portiere 0. |

## Verdetto

**Dieci controlli su undici verdi sul finale; nessun rosso nato dall'unione.**

- **Verdi (rc 0, lasciati finire):** portiere-252, guardalinee-222, pc-tablet-292, scena3d-96,
  passaggio-coppa-137, piedi-252 (due corse), ingresso-camminata-245, memoria-275, rigorista-257, parata-258.
- **Rosso per tempo:** coreografie-244 non finisce in 30 minuti. Succede uguale sulla base `lavoro/198`
  (`b3b75b9d`), con gli stessi numeri: non dipende dai giri 293–302. Il guardiano non ha emesso un suo
  giudizio in nessuno dei due rami; tutte le misure che ha fatto in tempo a stampare stanno dentro le sue soglie.
- **Instabili:** nessuno ha dato esiti diversi fra due corse. L'unica seconda corsa fatta è piedi-252, per i
  margini stretti (verde in entrambe).

### Rispetto alla corsa 44830113928 di GitHub Actions (parti 8 e 12 fallite)

Non posso confermare quale guardiano sia caduto là: non ho letto i registri di quella corsa e non so quali
controlli stiano nelle parti 8 e 12. Quello che il banco dice, fra questi undici:

1. **coreografie-244** è l'unico che qui non arriva in fondo; da solo occupa oltre 30 minuti. Se in quella
   corsa una parte ha un tetto di tempo, è il primo candidato. È un'ipotesi, non una misura.
2. **piedi-252** passa con margini di 0,001–0,03 sul braccio rosso e 0,014–0,029 sul verde: su una macchina
   più lenta può cadere. Anche questa è un'ipotesi.
3. Gli altri nove non hanno mostrato né rossi né margini stretti.

### Cose da sapere

- **portiere-252** dichiara «non giudicate» 3 scene su 11 per braccio (tiri a bruciapelo, sotto 0,2 s) e
  resta verde per regola sua. Con la regola «non giudicato = rosso» letta alla lettera andrebbe discusso;
  qui riporto l'esito del guardiano senza rigiudicarlo.
- **scena3d-96** dura 23 minuti: sta sotto il tetto di 30 ma non di molto.
- guardalinee-222 ha rigenerato dieci foto di `docs/sviluppo/giro222/`: rimesse con `git restore`.
- Nessuna correzione fatta, nessuna soglia toccata, `GAME_VERSION` non toccato.
- Banco: 16 GB di memoria (oltre 13 GB liberi a ogni avvio), 58–59 GB di disco liberi, un controllo alla
  volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`. Durata complessiva circa 2 ore e mezza.
