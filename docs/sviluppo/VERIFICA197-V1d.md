# Verifica di rilascio 7.999.197 — blocco V1d

Solo verifica: nessuna correzione a gioco o sonde.

- **Build 197:** `lavoro/197` al commit `e7528fe8` (eseguito in detached, poi questo ramo nasce lì: solo il rapporto in più).
- **Base 196:** worktree `../w196` su `3076a1b7` («Rilascio 7.999.196»), `node_modules` collegato con symlink a quello della 197.
- **Comando:** `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout <tetto> npm run -s <nome>` in `tests/visual`; tetto 2400 s (1–10), 3600 s (11–13).
- **Macchina:** sessione cloud, 16 GB RAM, `free -m` e `df -h` registrati in testa a ogni log.
- Regola: rosso / «non giudicato» / oltre tetto → seconda prova; rosso 2/2 → una prova sulla 196.

| # | Controllo | 1ª | 2ª | 196 | Classificazione | Riga di verdetto stampata |
|---|---|---|---|---|---|---|
| 1 | partita-vera | verde (601 s) | — | — | **verde** | `ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute (partite finite 2/2)` |
| 2 | conduci-242 | verde (82 s) | — | — | **verde** | `✅ conduci-242 verde (riga, riquadro e portiere dicono il tiro) e il rosso si vede` |
| 3 | ingresso-camminata-245 | verde (219 s) | — | — | **verde** | `✅ ingresso-camminata-245 verde (camminata, tutti al posto, clip di camminata) e il rosso si vede` |
| 4 | difesa-252 | verde (223 s) | — | — | **verde** | `✅ difesa-252 VERDE` |
| 5 | apertura-261 | verde (171 s) | — | — | **verde** | `✅ PASS apertura-261 (prima immagine sull'eroe 4/4, scarto max 0u, aperture vuote 0)` |
| 6 | spot-266 | verde (69 s) | — | — | **verde** | `✅ spot-266 verde (e il rosso si vede)` |
