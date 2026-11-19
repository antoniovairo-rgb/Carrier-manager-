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
| 2 | riserva-103 | | | | | |
| 3 | contatto-103 | | | | | |
| 4 | parata-100 | | | | | |

## Note e dubbi
- chiusura-99: lanciato in primo piano, passato in sottofondo dallo strumento dopo 600 s; esito atteso con un ciclo d'attesa in primo piano sul file d'uscita. Durata 06:37:26 → 07:13:12, dentro il tetto di 40 min. Nessuna foto rigenerata in docs/ (git status pulito).
