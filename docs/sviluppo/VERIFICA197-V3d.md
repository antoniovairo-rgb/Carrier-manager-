# Verifica di rilascio 7.999.197 — blocco V3d

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), detached; `build-src` = byte identici, `check-src` = allineato a HEAD.
- Riferimento 196 pubblicata: `origin/main` = `3076a1b7` (worktree `../w196`).
- Modalità: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm run -s <nome>` in `tests/visual`, tetto 2400 s; riprova una volta se rosso/non giudicato.
- Nessun file di `src/` o `tests/` modificato; foto rigenerate in `docs/` rimesse con `git checkout --`.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| coreografie-244 | verde (2201 s) | — | — | verde (braccio rosso caduto come atteso) | ✅ coreografie-244: col rosso torna la coreografia di oggi (un disegno solo per curva e stagione, ferma) |
| presentazione-225 | verde (1331 s) | — | — | verde | ✅ presentazione-225 verde (e il rosso si vede) |
| classifica-194 | rosso (500 s) | rosso (498 s) | in coda | in attesa della 196 | ❌ classifica-194: la giornata 34 non risulta giocata (settimana 38, playMatch true, fase playing) |
| sigle-203 | verde (618 s) | — | — | verde | prova del rosso: il difetto si vede (VERDE 8 ok · 0 ko) |
| tocco-213 | verde (253 s) | — | — | verde | ✓ tocco-213 VERDE |
