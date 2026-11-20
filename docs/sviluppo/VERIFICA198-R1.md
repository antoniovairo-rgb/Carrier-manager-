# Verifica della 7.999.198 — parte R1 (residui)

- Finale sotto esame: `prova/198-finale` (0f0b13d8) · base di confronto: `lavoro/198` (b3b75b9d)
- Ramo di lavoro: `sviluppo/verifica198-r1` · data: 20/11/2026
- Regole: un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti a controllo, nessuna correzione, «non giudicato» = rosso.
- Tutti e dieci i nomi richiesti esistono in `tests/visual/package.json`.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| interviste-183 | ✅ verde (rc 0, 264 s) | — | — | verde 0% domande ripetute, rosso visibile (36,1% in Primavera) |
| sigle-203 | ✅ verde (rc 0, 608 s) | — | — | quattro passate: telefono 18 ok · 0 ko, 1366 px 8 ok · 0 ko; i due bracci rossi (203 e 254) si vedono (5 ko e 1 ko) |

Verdetto: **in corso** (2 controlli su 10).
