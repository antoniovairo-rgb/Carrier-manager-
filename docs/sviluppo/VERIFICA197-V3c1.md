# Verifica di rilascio 7.999.197 — blocco V3c1

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto) — `build-src` byte identici, `check-src` allineato a HEAD.
- Riferimento 196 pubblicata: `origin/main 3076a1b7`.
- Modo: ogni controllo una volta, uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), `npm run -s <nome>` in `tests/visual`, tetto 2400 s; `free -m` e `df -h` registrati prima di ogni corsa; foto in `docs/` rimesse con `git checkout --`.
- Nessun file di `src/` o `tests/` modificato. Regola PO-516 applicata.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| solo-highlight-166 | verde (855 s) | — | — | verde | `ROSSO: CADE (come deve) su 3, 7 e 8` (prima: `VERDE: PASSA`) |
| battito-264 | verde (388 s) | — | — | verde | `ROSSO: CADE (come deve): la partita intera diverge dai soli highlight` (prima: `VERDE: PASSA`) |
| spazio-270 | verde (585 s) | — | — | verde | `✅ spazio-270 verde: riga della scelta a SP.box dal riquadro dopo (tel, pc) e col rosso torna oltre 10 px` |
| portiere-223 | verde (389 s) | — | — | verde | `❌ ROSSO (atteso: __CPM_NO_G223) — 11 difetti` = braccio rosso che cade come deve; verdetto del verde: `✅ VERDE — sui tiri sbagliati il pallone non attraversa il portiere…` (rc 0) |
| portiere-252 | verde (758 s) | — | — | verde | `BRACCIO verde+rosso · MOTIVO nessuno` (prima: `✅ portiere-252 VERDE (seme 1; rosso visto: 2 KO …)`) |
| esiti-241 | verde (342 s) | — | — | verde | `BRACCIO verde+rosso+rosso G102 · MOTIVO nessuno` (prima: `✅ esiti-241 verde (riquadro, motore e 3D concordi su chance e fallo cercato) e il rosso si vede`) |
| validate-situations | verde (839 s) | — | — | verde | `✅ PASS` — 14/14, fingerprint `00001505`, 0 failure; `final-state OK` (24 situations, 0/24 al limite), `post-highlight OK` (6 situations, 0 coppie scartate) |
| gigante-212 | verde (1043 s) | — | — | verde | `✅ difetto riprodotto — col rosso __CPM_NO_G212 tornano 3 corpi sopra 2.05 m` (verde: `✅ PASS — 12 scene giudicate, nessun corpo fuori misura…`) |
| parata-100 | oltre tetto di 2 s (rc 124 a 2400 s; il processo figlio ha poi stampato `✅ parata-100 verde · il rosso si vede` a 22:10:46) | oltre tetto di 3 s (rc 124 a 2400 s; poi `✅ parata-100 verde · il rosso si vede` a 22:51:03) | in corsa (tetto 60 min) | oltre tetto | — |
