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
| 10 | pressing-143 | **verde** (26s) | — | — | «✅ pressing-143 verde (e il rosso si vede)»: nel verde a 0,5 u la lettura è «spalle»/pressione alta, nel rosso scende a «medium». |
| 11 | difesa-220-giro31 | **verde** (1633s) | — | — | Durata 27 min 13 s, sotto il tetto di 30 minuti. Ultime righe del controllo: «ROSSO viola come atteso: apertura 7.8 u > 3 · apertura 7.8 lontana dalla dichiarata 1.1 · contatto 5.6 u > 3 · (A) 92% > 45 · pallone di nessuno 62% > 25 · ritorno 100% > 25 (12/12) ✅ difesa-220-giro31 VERDE » |
| 12 | esiti-60 | **verde** (107s) | — | — | «✅ esiti-60 verde (A 0/8 · B 0/2) e il rosso si vede (A 5/8 · B 2/2)». |
| 13 | rigorista-257 | **verde** (328s) | — | — | Ultime righe del controllo: «✅ C2 rosso __CPM_NO_G257: al 30' dischetto pen:21 · scene del compagno 0 · eroe battute 0 scene 1 ✅ rigorista-257 verde (e il rosso si vede) » |
| 14 | scelte-197 | **verde** (361s) | — | — | «braccio verde · difetti 0 · ESITO: VERDE» su tutti i formati (fino a 412x915): titoli non tagliati, le tre scelte dentro la scheda, riquadro che non scorre. |
| 15 | riserva2d-205 | **verde** (408s) | — | — | «VERDE: 36/36 ✓». Ultime righe del controllo: «ROSSO __CPM_NO_G205 bocciato: ✓ ✅ riserva2d-205 superato (tutto: verde col verde, rosso col rosso) » |
| 16 | riproduci-175 | **non giudicato = rosso**: fermato al tetto dei 30 minuti (1800 s) | **identico**: fermato al tetto dei 30 minuti (1800 s) | nessuno: non nasce dall'unione (stesso comportamento sulla base) | Il controllo stampa solo alla fine: in tutte e due le corse il registro era vuoto al momento dell'arresto, quindi non si può dire a quale braccio (A statico, B partite, C corpi 3D, rosso) fosse arrivato. Il rapporto del giro 175 dichiara una durata normale di «≈ 27 minuti»: il tetto di 30 minuti di questa verifica è a ridosso della durata propria del controllo. Nessun errore a schermo, nessun file toccato. Dopo l'arresto il processo `node riproduci-175.mjs` restava vivo ed è stato chiuso per numero di processo. Interruttori `__CPM_NO_G293…G302` non provati: la base si comporta allo stesso modo. Seconda corsa non fatta (ogni corsa costa 30 minuti e il tetto della verifica era già superato). |
<!-- fine tabella -->

## Verdetto

**V2c pronto: no**, per una sola voce.

- 15 controlli su 16 verdi su `prova/198-finale` (`0f0b13d8`), ognuno col suo braccio rosso che cade dove il controllo lo prevede.
- `riproduci-175` non è stato giudicato entro il tetto di 30 minuti, né sul finale né sulla base `lavoro/198` (`b3b75b9d`): per la regola «non giudicato = rosso» conta come rosso, ma **non nasce dall'unione**. Serve una corsa senza tetto (o con un tetto sopra i 27 minuti dichiarati dal giro 175) per avere il suo esito vero.
- `accessibilita-234`: rosso solo nel clone a storia tagliata (manca `ea02adf0^`), identico sulla base; verde con la storia completa. Chi lo esegue in una sessione nuova deve prima recuperare la storia (`git fetch --deepen`).
- Nessun rosso nato dall'unione dei giri 293–302. Nessun controllo instabile osservato (nessuno ha richiesto una seconda corsa per un esito alterno).
- Nessuna correzione fatta, nessuna soglia toccata, `GAME_VERSION` non toccata, nessuna foto rigenerata in `docs/` (albero pulito dopo ogni controllo).

Durate misurate: accessibilita-234 103 s · partita-v2 441 s · riserva-104 663 s · partita2d-297 144 s · rigore-79 25 s · tabellino-lati 5 s · lessico-218 2 s · minuti-202 173 s · tempo-138 814 s · pressing-143 26 s · difesa-220-giro31 1633 s · esiti-60 107 s · rigorista-257 328 s · scelte-197 361 s · riserva2d-205 408 s · riproduci-175 oltre 1800 s. La verifica ha superato il tetto di circa 2,5 ore (soprattutto per le due corse da 30 minuti di `riproduci-175`).
