# Verifica di rilascio 7.999.197 — blocco V3b

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), ramo `sviluppo/verifica197-v3b`.
- Riferimento 196 pubblicata: `origin/main` `3076a1b7`.
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 120 min (`timeout 7200`), un controllo alla volta.
- Preparazione: `npm i` · `node tools/build-src.mjs` (byte identici) · `node tools/check-src.mjs` (allineato a HEAD).
- Nessun file di `src/` o `tests/` modificato.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga / casi rossi |
|---|---|---|---|---|---|
| ingresso-206 | verde (rc 0, ~40 min, 11 casi incl. 3 bracci rossi che si vedono) | non necessaria | non necessaria | **verde** | «✅ ingresso-206 verde (regia per tipo, ingresso breve nelle normali, coreografia/fumogeni/coriandoli/inno solo dove previsti, squadra schierata, fps tenuti) e il rosso si vede» |
| career-critical | rosso (rc 1) | rosso (rc 1) | in corsa | — | si ferma al 3° passo `playing-mdref` (i passi dopo non girano): «❌ FAIL — 3 · ✗ (ROSSO) il pre-partita non ha nemmeno aperto la gara: lo scenario non è quello previsto · ✗ (1) il pre-partita non apre la gara: sonda cieca · ✗ (3) REGRESSIONE: dopo un'uscita non si riesce piu' ad aprire la gara». Passati prima: recovery-competition, save-monotonic. Identico nelle due esecuzioni (bottone d'uscita «(non trovato)», riferimento «nessuno»). |

## Note e dubbi
