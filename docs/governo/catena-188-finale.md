# Catena 188-finale — verifica sul build 7.999.188 (HEAD 04a62ae, check-src allineato)

Sessione di sola verifica. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium. `festa-57` non eseguito (rosso noto, PO-336). Un rosso è rigiocato una volta (righe «ripetizione»).

| # | controllo | uscita | durata (s) | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|---|
| 1 | logic | 0 | 4 | # skipped 0 # todo 0 # duration_ms 3251.583536  | free=14007/16086MB df=29G libero |
| 2 | save-compat | 0 | 14 |  === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | free=13817/16086MB df=29G libero |
| 3 | prossima-131 | 0 | 199 |   ROSSO (__CPM_NO_G131): 6/10 rossi, primo caso caduto: nc-finale → CADE COME DEVE   ROSSO (__CPM_NO_G133): 2/10 rossi, casi caduti: amichevole → CADE COME DEVE (solo l'amichevole, casi del giro 131 verdi)   ROSSO (__CPM_NO_G134A): 2/10 rossi, casi caduti: amichevole → CADE COME DEVE (solo il  | free=13632/16086MB df=29G libero |
| 4 | privacy-134 | 0 | 61 |     MOTIVO: s360: nessuna finestra della privacy dentro la pagina (chiudi)     MOTIVO: pc: si apre FUORI dall'app (nuove schede 1, window.open 1: https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html)     MOTIVO: pc: nessuna finestra della privacy dentro la pagina (chiudi)  | free=13619/16086MB df=29G libero |
| 5 | premiazione-132 | 0 | 233 | ROSSO [cg] (__CPM_NO_G132) cade, come deve — int: mani 0.46 (mx-victory-jump) · compagni max 151° / cup: mani 0.46 (mx-victory-jump) · compagni max 146° / league: mani 0.46 (mx-victory-jump) · compagni max 151° ROSSO [regular] (__CPM_NO_G132) cade, come deve — int: mani -0.42 (throwin) ·  | free=13299/16086MB df=29G libero |
| 6 | posa-sollevamento-191 | 0 | 86 | VERDE: {"campione":true,"clipT":0.45,"piedi":0.17,"mani":2.1} ROSSO (__CPM_NO_POSA191): {"campione":true,"clipT":0.34,"piedi":0.17,"mani":2.1} ✅ posa-sollevamento-191 verde (e il rosso si vede)  | free=13593/16086MB df=29G libero |
| 7 | premiazione-palco-191 | 0 | 68 | VERDE: {"campioni":25,"inVolo":0,"esempio":null,"sulCorpo":17} ROSSO (__CPM_NO_PALCO191): {"campioni":24,"inVolo":5,"esempio":{"y":1.05,"sotto":0},"sulCorpo":18} ✅ premiazione-palco-191 verde (e il rosso si vede)  | free=13611/16086MB df=29G libero |
| 8 | panchina-127-m360 | 0 | 314 | ROSSO 360x800 casa: 132 fotogrammi · camera dentro/dietro tribuna 35 · gradoni dal retro 41 · eroe inquadrato 1 · camera inizio [-33.54,4.76,-59.84] meta' [-12.94,4.67,-39.33] dir [0.792,-0.2,0.577] · locale tribuna [33.5,4.8,2.1,126,28,36.7] · errori 0 braccio: verde+rosso · formati 360x800  | free=13444/16086MB df=29G libero |
| 9 | panchina-127-tel | 0 | 326 | ROSSO 412x915 casa: 112 fotogrammi · camera dentro/dietro tribuna 44 · gradoni dal retro 52 · eroe inquadrato 1 · camera inizio [-15.86,4.76,-44.54] meta' [-13.62,4.65,-39.83] dir [0.797,-0.202,0.569] · locale tribuna [15.9,4.8,-13.2,126,28,36.7] · errori 0 braccio: verde+rosso · formati 412x | free=13626/16086MB df=29G libero |
| 10 | panchina-127-pc | 0 | 440 | ROSSO 1440x900 casa: 102 fotogrammi · camera dentro/dietro tribuna 11 · gradoni dal retro 21 · eroe inquadrato 1 · camera inizio [-15.34,4.56,-44.07] meta' [27.03,4.34,-9.22] dir [0.725,-0.283,0.627] · locale tribuna [15.3,4.6,-13.7,126,28,36.7] · errori 0 braccio: verde+rosso · formati 1440x | free=13601/16086MB df=29G libero |
| 11 | folla | 0 | 164 |   ✓ F5 manopola di densita': 'oggi' 6391 tifosi contro 'vera' 19067  FOLLA: verde PASSA · rosso visto  | free=13600/16086MB df=29G libero |

## Stato parziale

- Controlli: 11 eseguiti, 11 verdi, 0 rossi.
