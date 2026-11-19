# Verifica di rilascio 7.999.198 — blocco F1 (rapida)

Solo verifica: nessuna correzione a gioco o sonde.

- **Build provata:** ramo `prova/198-finale`, commit `086cdba9` (= `lavoro/198` f4051ca0 + giri 286 e 291, entrambi su `src/12`). Il ramo di questo rapporto (`sviluppo/verifica198-f1`) parte da quel commit e aggiunge solo questo file.
  ⚠️ Nel build `GAME_VERSION` vale ancora `7.999.197` (src/07 e CARRIER-MANAGER-AV.html): il bump a 7.999.198 non c'è ancora.
- **Base di confronto:** `f4051ca0` (worktree `../base198`, `node_modules` collegato).
- **Comando:** in `tests/visual`, `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout 2400 npm run -s <nome>`, uno alla volta; `free -m` e `df -h` registrati prima di ogni controllo (nei log).
- **Regola:** rosso / «non giudicato» / oltre tetto → seconda prova; rosso 2/2 → prova sulla base.

| # | Controllo | 1ª | 2ª | Base | Classificazione | Riga di verdetto stampata |
|---|---|---|---|---|---|---|
| 1 | partita-vera | ✅ | — | — | **verde** | `ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute (partite finite 2/2)` (nota: riga info `portatore-stato: campioni 0 · copertura 0%`, solo informativa) |
