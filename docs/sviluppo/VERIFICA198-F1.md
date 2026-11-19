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
| 2 | chiusura-99 | ✅ | — | — | **verde** | `✓ chiusura-99 VERDE` (braccio verde: D9 6/6 mediana contrasto 5.75, RIC 5/5 100%; braccio rosso: D9 ROSSO 5 sotto 3, RIC ROSSO 4/5 — come atteso). Durata ~35 min |
| 3 | portiere-265 | ✅ | — | — | **verde** | `✅ portiere-265 VERDE (verde col verde, rosso col rosso): negli highlight il portiere resta sul suo punto, davanti alla linea, fermo al calcio.` (verde 0 difetti su 7 casi; rosso 6 su 7) |
| 4 | ball-owner | ✅ | — | — | **verde** | `✅ baseline F2 misurata su 2481 fotogrammi · 62 movimenti senza padrone da attribuire` (conflitti 145 = 5,8%; coppia inseguitore+addosso assente dall elenco; lanciato senza `CPM_IA_MAX`, come da elenco: è la sola misura di osservazione) |
| 5 | frozen-mate | ✅ | — | — | **verde** | `✅ nessun compagno congelato: il gesto si rilascia sempre` (fotogrammi-orfano 0; GLB montati. Dubbio: il controllo gira solo il braccio verde e non stampa quanti gesti di compagni ha osservato) |
| 6 | aim-latch | ✅ | — | — | **verde** | `✅ il corpo guarda dove calcia (mediana 0 rad)` (13 rilasci, p90 0.11) |
| 7 | difesa-252 | ✅ | — | — | **verde** | `✅ difesa-252 VERDE` (reale: fermi ≥0,8 0/4 · prova 0/3, correzione attiva in 3 · rosso 3/3) |
| 8 | tunnel-285 | ✅ | — | — | **verde** | `VERDE: fra la bocca del tunnel e la linea laterale non c'e' nessuna superficie ferma.` (verde 5 stadi 0 guasti · `ROSSO VISTO` 5/5, non giudicati 0) |
| 9 | zero-288 | ✅ | — | — | **verde** | `zero-288: ✓ (VERDE+ROSSO)` |
| 10 | salienti-246 | ✅ | — | — | **verde** | `VERDE: PASSA` · `ROSSO: CADE (come deve) su ogni percorso` (0 ✗ nel braccio verde; i 38 ✗/«non giudicato» sono tutti nel braccio rosso `__CPM_NO_G246`) |
| 11 | salienti-229 | ✅ | — | — | **verde** | `VERDE: PASSA` · `ROSSO: CADE (come deve): tasto assente fuori dal campionato senza posta, partita KO non apribile a soli salienti` |
| 12 | typing-shortcuts | ✅ | — | — | **verde** | `✅ PASS — chi scrive tiene la tastiera: nessuna scorciatoia gli ruba i tasti` |
| 13 | career-critical | ✅ | — | — | **verde** | `✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.` (ultimo degli 11 passi incatenati con `&&`, uscita 0; nessun ❌/FAIL nel log) |
| 14 | test:logic | ✅ | — | — | **verde** | `# pass 51` · `# fail 0` (con `CPM_CHROME`, in `tests/visual`) |
