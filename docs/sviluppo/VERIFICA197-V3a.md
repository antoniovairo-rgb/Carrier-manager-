# Verifica di rilascio 7.999.197 — blocco V3a

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached.
- Confronto 196: `origin/main 3076a1b7` (solo se rosso 2 su 2).
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `timeout 7200`, un controllo alla volta.
- Preparazione: `npm i` in tests/visual; `node tools/build-src.mjs` (byte identici); `node tools/check-src.mjs` (allineato a HEAD).
- Già dichiarati (PO-516, non riprovati): difficolta-156, finale-202, voto-79, giornale-244.

| Controllo | Esito 1ª | Esito 2ª | Esito sulla 196 | Classificazione | Ultima riga / casi rossi |
|---|---|---|---|---|---|
| highlight-95 | in corsa (avvio 1ª esecuzione) | — | — | — | — |

## Note e dubbi
