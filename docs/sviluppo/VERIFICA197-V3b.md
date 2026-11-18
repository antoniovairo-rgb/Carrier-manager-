# Verifica di rilascio 7.999.197 — blocco V3b

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), ramo `sviluppo/verifica197-v3b`.
- Riferimento 196 pubblicata: `origin/main` `3076a1b7`.
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 120 min (`timeout 7200`), un controllo alla volta.
- Preparazione: `npm i` · `node tools/build-src.mjs` (byte identici) · `node tools/check-src.mjs` (allineato a HEAD).
- Nessun file di `src/` o `tests/` modificato.

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga / casi rossi |
|---|---|---|---|---|---|
| ingresso-206 | verde (rc 0, ~40 min, 11 casi incl. 3 bracci rossi che si vedono) | non necessaria | non necessaria | **verde** | «✅ ingresso-206 verde (regia per tipo, ingresso breve nelle normali, coreografia/fumogeni/coriandoli/inno solo dove previsti, squadra schierata, fps tenuti) e il rosso si vede» |
| career-critical | rosso (rc 1) | rosso (rc 1) | **verde** (rc 0, tutti gli 11 passi, compreso `playing-mdref`: «✅ CICLO DI VITA DEL RIFERIMENTO OK») | **NATO nella 197** — blocca l'uscita | si ferma al 3° passo `playing-mdref` (i passi dopo non girano): «❌ FAIL — 3 · ✗ (ROSSO) il pre-partita non ha nemmeno aperto la gara: lo scenario non è quello previsto · ✗ (1) il pre-partita non apre la gara: sonda cieca · ✗ (3) REGRESSIONE: dopo un'uscita non si riesce piu' ad aprire la gara». Passati prima: recovery-competition, save-monotonic. Identico nelle due esecuzioni (bottone d'uscita «(non trovato)», riferimento «nessuno»). |

## Note e dubbi

- **career-critical — NATO nella 197.** Sulla 197 il passo `playing-mdref` (`tests/visual/playing-mdref-test.mjs`) è rosso 2 su 2 con lo stesso testo; sulla 196 (`3076a1b7`, worktree `../w196`, stesso modo, tetto 150 min) è verde e la catena arriva in fondo («✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.», rc 0). Poiché `career-critical` è una catena con `&&`, sulla 197 i passi dopo `playing-mdref` (double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) **non sono stati eseguiti**: il loro esito sulla 197 resta ignoto (scelta: non li ho lanciati a parte perché fuori dall'elenco esatto).
- Indizio (sola osservazione, nessuna diagnosi né correzione): sulla 196 la sonda trova il riferimento «md11» nel pre-partita ed esce col bottone «Torna alla home»; sulla 197 il riferimento nel pre-partita è «nessuno» e il bottone d'uscita è «(non trovato)», cioè la sonda non arriva al pre-partita atteso («lo scenario non è quello previsto»). Fra 196 e 197 `src/13-prepartita-formazioni.jsx` è cambiato nei giri 243 (tasto «Gioca solo i momenti salienti»), 257 e 262; il testo «Torna alla home» esiste ancora nel sorgente 197. Da stabilire se il difetto è del gioco o della sonda: **è una scelta da fare fuori da questo blocco**.
- ingresso-206: verde alla prima, nessuna riprova.
- Nessuna foto rigenerata in `docs/` (git status pulito su entrambi gli alberi).
