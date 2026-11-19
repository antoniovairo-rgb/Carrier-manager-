# Verifica di rilascio 7.999.197 — blocco V3f

- Build verificato: `lavoro/197` a **2ba9c7cc** (detached, mai spostato). Confronto: 7.999.196 pubblicata = `origin/main` **3076a1b7**.
- Preparazione: `npm i` in `tests/visual` · `node tools/build-src.mjs` (byte identici, 21 frammenti, 67.312 righe) · `node tools/check-src.mjs` (verde: allineato a HEAD).
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>` in `tests/visual`, `timeout 2400`; `free -m` e `df -h` registrati prima di ogni corsa.
- Regola PO-516: rosso già sulla 196 = dichiarato; rosso nato nella 197 = blocca.

| Controllo | Esito 1ª | Esito 2ª | Esito sulla 196 | Classificazione | Ultima riga del controllo |
|---|---|---|---|---|---|
| partita2d-297 | verde (rc 0, ~2 min) | — | — | verde | `✅ partita2d-297 VERDE` |
| colori-286 | verde (rc 0, ~16 min) | — | — | verde | `✅ PASS colori-286 (verde, e il rosso si vede)` |
| cori-291 | verde (rc 0, <1 min) | — | — | verde | `CORI-291: ✅ VERDE` |
| rigore-79 | verde (rc 0, <1 min) | — | — | verde | `✅ rigore-79 verde: «rigore per loro» solo sui rigori degli avversari; il rosso __CPM_NO_RIG79 la riapre sui rigori dell'eroe` |
