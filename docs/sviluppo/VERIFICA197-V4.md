# Verifica di rilascio 7.999.197 — blocco V4

**Solo verifica**: nessuna correzione a gioco o sonde.

## Build verificata
- base `64270c6b` (lavoro/197) + unione di PROVA `--no-ff` di `origin/sviluppo/giro282-highlight95` → commit `18299b3` (nessun conflitto; non pubblicata su lavoro/197).
- `node tools/build-src.mjs`: «byte identici a prima» · `node tools/check-src.mjs`: «IDENTICO BYTE PER BYTE» e «allineato al file in git (HEAD)».
- `tests/visual`: `npm ci` fallito, `npm install` riuscito (12 pacchetti).
- Comando: `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout <tetto> npm run -s <nome>` da `tests/visual`.

## Esiti

| # | Controllo | 1ª | 2ª | 196 | Classificazione | Riga di verdetto stampata |
|---|---|---|---|---|---|---|
| 1 | chiusura-99 | VERDE (exit 0, 35'46") | — | — | **verde** | `✓ chiusura-99 VERDE` (bracci verdi D9 5.00 · RIC 5/5; rossi D9 1.45 · RIC 4/5 come atteso) |
| 2 | riserva-103 | VERDE (exit 0, 11'22") | — | — | **verde** | `✓ riserva-103 VERDE (e il rosso si vede)` (verde 3/3 giudicate, 0 prima dei 2,6 s; rosso 3/3, 3 prima) |
| 3 | contatto-103 | VERDE (exit 0, 13'26") | — | — | **verde** | `✓ contatto-103 VERDE (e il rosso si vede: 3 D3 su 4 parate; verde 4 parate, 0 difetti)` · `BRACCIO verde+rosso · MOTIVO nessuno` |
| 4 | parata-100 | VERDE (exit 0, 48'06") | — | — | **verde** | `✅ parata-100 verde · il rosso si vede` (VERDE parate 10 · cross_goal 3 · non giudicabili 0 · difetti 0; ROSSO difetti 3) |

## Note e dubbi
- chiusura-99: lanciato in primo piano, passato in sottofondo dallo strumento dopo 600 s; esito atteso con un ciclo d'attesa in primo piano sul file d'uscita. Durata 06:37:26 → 07:13:12, dentro il tetto di 40 min. Nessuna foto rigenerata in docs/ (git status pulito).
- riserva-103: 07:13:36 → 07:24:58, eseguito in sottofondo con attesa in primo piano sul file d'esito. Nessuna foto rigenerata in docs/.
- contatto-103: 07:25:12 → 07:38:38. Le righe «D3 … il pallone non arriva mai al portiere» nel registro appartengono al braccio ROSSO (atteso). Nessuna foto rigenerata in docs/.
- parata-100: 07:38:51 → 08:26:57, dentro il tetto di 60 min. Il braccio verde ha stampato «copertura insufficiente: secondo giro 1» e ha fatto un secondo giro interno della sonda prima del verdetto: è il comportamento della sonda, non una ripetizione decisa da me; il verdetto finale resta verde con 0 non giudicabili.

## Conclusione
Quattro su quattro **verdi alla prima esecuzione** sulla build di prova (lavoro/197 `64270c6b` + giro282 → `18299b3`). Nessuna seconda esecuzione, nessuna prova sulla 196, nessuna prova con `__CPM_NO_G282`: non c'era nessun rosso da classificare.

Dubbi dichiarati:
- `npm ci` in tests/visual è fallito (ho visto solo la riga finale del registro npm, non la causa); `npm install` ha installato 12 pacchetti. Le versioni effettive non le ho confrontate una per una con quelle fissate nel CLAUDE.md (React 18.2.0, three 0.128.0, Babel 7.23.6).
- Il ramo `sviluppo/verifica197-v4` contiene l'unione di prova: non va unito.
