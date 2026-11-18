# Verifica di rilascio 7.999.197 — blocco V3e2

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached; ramo del rapporto `sviluppo/verifica197-v3e2`.
- Riferimento 196 pubblicata: `origin/main` `3076a1b7` (worktree separato, usato solo per i rossi 2 su 2).
- Preparazione: `npm i` in tests/visual · `node tools/build-src.mjs` (byte identici) · `node tools/check-src.mjs` (allineato a HEAD).
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>`, tetto `timeout 2400`; `free -m` e `df -h` registrati prima di ogni corsa; foto rigenerate in docs/ rimesse con `git checkout --`.
- Nessun file di `src/` o `tests/` modificato. Nessuna correzione.

## Esiti

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| tabellino-lati | verde (12 s) | — | — | verde | `✅ PASS tabellino-lati` |
