# Verifica di rilascio 7.999.197 — blocco V3b

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), ramo `sviluppo/verifica197-v3b`.
- Riferimento 196 pubblicata: `origin/main` `3076a1b7`.
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 120 min (`timeout 7200`), un controllo alla volta.
- Preparazione: `npm i` · `node tools/build-src.mjs` (byte identici) · `node tools/check-src.mjs` (allineato a HEAD).
- Nessun file di `src/` o `tests/` modificato.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga / casi rossi |
|---|---|---|---|---|---|
| ingresso-206 | in corsa | — | — | — | — |
| career-critical | da eseguire | — | — | — | — |

## Note e dubbi
