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
| 1 | chiusura-99 | in corsa | | | | |
| 2 | riserva-103 | | | | | |
| 3 | contatto-103 | | | | | |
| 4 | parata-100 | | | | | |

## Note e dubbi
