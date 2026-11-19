# Verifica di rilascio 7.999.197 — blocco V3a

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached.
- Confronto 196: `origin/main 3076a1b7` (solo se rosso 2 su 2).
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `timeout 7200`, un controllo alla volta.
- Preparazione: `npm i` in tests/visual; `node tools/build-src.mjs` (byte identici); `node tools/check-src.mjs` (allineato a HEAD).
- Già dichiarati (PO-516, non riprovati): difficolta-156, finale-202, voto-79, giornale-244.

| Controllo | Esito 1ª | Esito 2ª | Esito sulla 196 | Classificazione | Ultima riga / casi rossi |
|---|---|---|---|---|---|
| highlight-95 | ROSSO (rc=1, ~116 min, 20:02→21:58 UTC) | ROSSO (rc=1, ~115 min, 21:58→23:53 UTC): verde 2 difetti D4 s12/1234 e s12/2021 «🔁 Uno-due con SPENCER» (953 ms / 970 ms) | in corsa | rosso 2 su 2 (attesa 196) | `❌ highlight-95` · `verde: 2 difetti — D4 s5/2021 «🔁 Uno-due con GÜNTHER»: esito a schermo solo 1188 ms prima della chiusura ‖ D4 s12/1234 «🔁 Uno-due con SPENCER»: esito a schermo solo 773 ms prima della chiusura` |

## Note e dubbi

- 1ª esecuzione: il braccio verde chiude «VERDE highlight 91 … difetti 2» (entrambi D4, esito a schermo troppo breve prima della chiusura, entrambi su «Uno-due»); il braccio rosso trova i suoi difetti come atteso. Il rosso dell'uscita viene solo dai 2 D4 del verde. Log completo: `VERIFICA197-V3a-highlight95-1.log`.
- Nessuna foto rigenerata in docs/ (albero pulito dopo la corsa).
- 2ª esecuzione: di nuovo rossa solo per 2 D4 del braccio verde, sempre «Uno-due» ma su casi diversi dalla 1ª (s5/2021 GÜNTHER e s12/1234 SPENCER nella 1ª; s12/1234 e s12/2021 SPENCER nella 2ª). Log: `VERIFICA197-V3a-highlight95-2.log`. Albero pulito, nessuna foto in docs/.
- Corsa sulla 196 (worktree `../w196` a `3076a1b7`) avviata alle 23:53 UTC e **interrotta dal riavvio del container** (~00:03, uptime 0, nessun processo superstite, log vuoto): non vale, rifatta da capo alle 00:04 UTC.
- Nota: fra 196 e 197 `highlight-95.mjs` non cambia; cambiano 7 file di `tests/visual/lib/` (fra cui `harness.mjs`, `partita-166.mjs`). La corsa sulla 196 usa i file di test della 196 stessa.
- Seconda corsa sulla 196 (00:04 UTC) **interrotta da un secondo riavvio del container** (~00:26, uptime 0, log vuoto): non vale, terzo tentativo alle 00:27 UTC.
