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
| pc-tablet-292 | in corso | — | — | — |
| scena3d-96 | da eseguire | — | — | — |
| passaggio-coppa-137 | da eseguire | — | — | — |
| piedi-252 | da eseguire | — | — | — |
| ingresso-camminata-245 | da eseguire | — | — | — |
| coreografie-244 | da eseguire | — | — | — |
| memoria-275 | da eseguire | — | — | — |
| rigorista-257 | da eseguire | — | — | — |
| parata-258 | da eseguire | — | — | — |

## Verdetto

In corso: nessun verdetto finché la tabella non è completa.
