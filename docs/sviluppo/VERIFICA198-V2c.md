# Verifica della 7.999.198 — parte V2c

- Ramo provato: `prova/198-finale` (`0f0b13d8` = `lavoro/198` + giri 293–296, 298, 299, 300, 301, 302).
- Base di confronto per i rossi: `lavoro/198` (`b3b75b9d`), in una copia di lavoro separata.
- Ramo di lavoro: `sviluppo/verifica198-v2c`. Nessuna correzione al gioco: solo esecuzione e rapporto.
- Modo: un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 30 minuti per controllo.
- Tutti e 16 i nomi chiesti esistono in `tests/visual/package.json`.

| # | controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|---|
| 1 | accessibilita-234 | **verde** (103 s) con la storia git completa; rosso (113 s) nel clone con la storia tagliata | rosso identico nel clone tagliato (111 s) | nessuno: non nasce dall'unione | L'unico motivo del rosso era «sulla base prima del giro 234 (ea02adf0^): non giudicato (git)» — `fatal: invalid object name 'ea02adf0^'`: il clone della sessione era a storia tagliata. Braccio verde e braccio rosso `__CPM_NO_G234` (24 motivi) erano già a posto. Dopo `git fetch --deepen` (nessuna modifica al codice) il commit c'è e il controllo è verde: «bocciata (5 motivi)». È lo stesso rosso visto dal giro 298. |
| 2 | partita-v2 | **verde** (441 s, braccio verde + braccio rosso) | — | — | «partita-v2 VERDE: 3 formati x 5 schermate · contrasto minimo 4.93:1»; braccio rosso «ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato». |
| 3 | riserva-104 | **verde** (663 s) | — | — | Verde: highlight 7 · scene provocate 6 · richiami altrui intercettati 6 · D3 riserva 0. Braccio rosso: richiami altrui 12 · D3 riserva 3 (bocciato come atteso). |
| 4 | partita2d-297 | **verde** (144 s, verde + braccio rosso) | — | — | Telefono e PC 1366x768 verdi (nero fuori campo 0,1%, testata non specchiata nel 2° tempo, tribuna accesa al gol); braccio rosso «A cade · B cade · C cade». |
| 5 | rigore-79 | **verde** (25 s) | — | — | Verde: 51 rigori della squadra dell'eroe → 0 schede «rigore per loro»; 11 rigori avversari a partita aperta → 11 schede. Rosso `__CPM_NO_RIG79`: 28 schede sui rigori dell'eroe (bocciato come atteso). |
| 6 | tabellino-lati | **verde** (5s) | — | — | Ultime righe del controllo: «C · intestazione casa—ospite, eroe 3-0: in casa {"sx":[3,6,58],"dx":[0,2,42],"eroe":"sx"} · in trasferta {"sx":[0,2,42],"dx":[3,6,58],"eroe":"dx"} ✅ PASS tabellino-lati » |
| 7 | lessico-218 | **verde** (2s) | — | — | Ultime righe del controllo: «rosso {"n":138,"pas":138,"es":["🦵 Tiro angolato","🤸 Pallonetto","🦵 Tiro di prima","🦵 Tiro a giro","🌀 Dribbling portiere e tiro"],"cn":12,"cd":12} ✅ lessico-218 verde (0 su 138 azioni-tiro col lessico di passaggio) e il rosso si vede (138 su 138) » |
| 8 | minuti-202 | **verde** (173s) | — | — | Ultime righe del controllo: «rosso tentativo 1 {"scene":3,"recuperati":0,"residuo":0,"aperto":0,"tentativi":1,"s":27} ✅ minuti-202 verde (e il rosso si vede) » |
| 9 | tempo-138 | **verde** (814s) | — | — | Ultime righe del controllo: «rosso {"fase":"ceremony","pagato":190,"residuo":26,"aperto":242} ✅ tempo-138 verde (e il rosso si vede) » |
| 10 | pressing-143 | **verde** (26s) | — | — | Ultime righe del controllo: «rosso {"lett":[{"d":0.5,"conclusione":{"p":"medium","k":"conclusione"},"fra-le-linee":{"p":"medium","k":"fra-le-linee"},"cross":{"p":"medium","k":"cross"}},{"d":2,"conclusione":{"p":"high","k":"conclusione"},"fra-le-linee":{"p":"high","k":"fra-le-linee"},"cross":{"p":"high","k":"cross"}},{"d":4,"conclusione":{"p":"high","k":"conclusione"},"fra-le-linee":{"p":"high","k":"fra-le-linee"},"cross":{"p":"high","k":"cross"}» |
| 11 | difesa-220-giro31 | **verde** (1633s) | — | — | Ultime righe del controllo: «ROSSO viola come atteso: apertura 7.8 u > 3 · apertura 7.8 lontana dalla dichiarata 1.1 · contatto 5.6 u > 3 · (A) 92% > 45 · pallone di nessuno 62% > 25 · ritorno 100% > 25 (12/12) ✅ difesa-220-giro31 VERDE » |
<!-- fine tabella -->

## Verdetto

In corso.
