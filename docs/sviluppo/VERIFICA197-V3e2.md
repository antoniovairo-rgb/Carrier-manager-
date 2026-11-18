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
| stat-279 | verde (41 s) | — | — | verde | `✅ STAT-279 OK` |
| lessico-218 | verde (2 s) | — | — | verde | `✅ lessico-218 verde (0 su 138 azioni-tiro col lessico di passaggio) e il rosso si vede (138 su 138)` |
| tabellino-228 | verde (388 s) | — | — | verde | `✅ tabellino-228 verde (e il rosso si vede)` |
| intervista-231 | rosso (1873 s) | rosso (1875 s) | rosso (1921 s) — stessi 6 difetti | dichiarato (rosso anche sulla 196) | `· rosso: la partita non e' arrivata al fischio {"fine":"playing",… 53' …}` |
| schede-234 | verde (761 s) | — | — | verde | `✅ VERDE — schede con almeno 3 opzioni, lessico «indicazioni», effetti distinti sul motore, prova del rosso riconosciuta` |
| catalogo-022 | verde (482 s) | — | — | verde | `✅ catalogo-022 verde` |
| schede-246 | rosso (704 s) | rosso (697 s) | rosso (704 s) — **solo 1 difetto su 2** (braccio rosso); il braccio verde sulla 196 è sano | **rosso anche sulla 196, MA il difetto «verde: nessuna scheda comparsa, guardiano cieco» è NATO nella 197** (vedi nota) | `· rosso: il cronometro non corre con la scheda aperta, il difetto non si vede` |
