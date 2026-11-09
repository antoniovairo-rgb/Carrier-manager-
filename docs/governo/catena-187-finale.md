# Catena 187-finale — verifica sul build 7.999.187 (HEAD c27e506, check-src allineato)

Sessione di sola verifica. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium. Prima dei controlli è servito `npm install` in tests/visual (node_modules assente nel contenitore).

| # | controllo | uscita | durata (s) | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|---|
| 1 | logic | 0 | 2 | # todo 0 # duration_ms 2658.04304  | free=15529/16086MB df=29G libero |
| 2 | save-compat | 0 | 12 | === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | free=15417/16086MB df=29G libero |
| 3 | panchina-127-m360 | 0 | 302 | braccio: verde+rosso · formati 360x800 ✅ panchina-127 verde (e il rosso si vede)  | free=15457/16086MB df=29G libero |
| 4 | panchina-127-tel | 0 | 321 | braccio: verde+rosso · formati 412x915 ✅ panchina-127 verde (e il rosso si vede)  | free=15546/16086MB df=29G libero |
| 5 | panchina-127-pc | 0 | 472 | braccio: verde+rosso · formati 1440x900 ✅ panchina-127 verde (e il rosso si vede)  | free=15555/16086MB df=29G libero |
| 6 | folla | 0 | 162 |   ✓ F5 manopola di densita': 'oggi' 6391 tifosi contro 'vera' 19067 FOLLA: verde PASSA · rosso visto  | free=15554/16086MB df=29G libero |
| 7 | bambini-124 | 0 | 879 | ROSSO (__CPM_NO_G124) rosso-rosso: {"n":44,"errMax":72,"es":[{"i":0,"casa":true,"n":"HyperShirt","exp":[0,188,212],"got":[0,188,212]},{"i":0,"casa":true,"n":"HyperShorts","exp":[24,24,38],"got":[86,86,108]}]} ✅ bambini-124 verde (e il rosso si vede)  | free=15530/16086MB df=29G libero |
| 8 | angolo-117 | 0 | 811 | ROSSO (__CPM_NO_G121H+C+M): 2 casi in area · girati (>35°) 2 ✅ angolo-117 verde (e il rosso si vede)  | free=15545/16086MB df=29G libero |
| 9 | volee-d3-119 | 0 | 252 | VERDE ["angolo-lontano-48-50:0.65","angolo-lontano-70-80:0.68","cross-area-90-54:0.6"] · ROSSO ["angolo-lontano-48-50:5.01","angolo-lontano-70-80:8.05","cross-area-90-54:0.35"] ✅ volee-d3-119 verde (e il rosso si vede)  | free=15537/16086MB df=29G libero |
| 10 | distanze-126 | 1 | 3570 |   partite finite 13/24 · campione minimo: tiri 40, dal limite 8, teste 6 NON GIUDICATO (= ROSSO): campione sotto il minimo — partite finite 13/24  | free=15539/16086MB df=29G libero |
| 11 | tabellone-117 | 0 | 325 | {"percorso":"ripresa","rosso":true,"err":null,"prima":{"score":{"home":1,"away":0},"motore":{"home":1,"away":0},"log":1,"ev":["home"],"t216":null,"r117":null,"min":11},"snap":{"clock":11,"score":{"home":1,"away":0},"g117":false},"rientro":{"score":{"home":1,"away":0},"motore":{"home":0,"away":0},"log":0,"ev":[],"t216":null,"r117 | free=15505/16086MB df=29G libero |
| 12 | tabellino-228 | 0 | 308 | k4 rosso: tabellino 0-4 (mio-loro), tabellone 3-0, motore 4-0, golLog [{"min":52,"tick":1211,"lato":"home","scena":true,"chi":9},{"min":52,"tick":1211,"lato":"home","scena":true,"chi":21},{"min":73,"tick":1693,"lato":"home","scena":false,"chi":6},{"min":93,"tick":2189,"lato":"home","scena":false,"chi":6}], fischio [{"min":90,"mi | free=15522/16086MB df=29G libero |
| 13 | twa-120 | 0 | 45 |   OK  rosso: l'interruttore __CPM_NO_G120 fa cadere modo/AI/rete/Indietro: cadono modo, ai, rete, indietro su 4 twa-120 ✅ VERDE — 12/12 controlli · nessun motivo  | free=15516/16086MB df=29G libero |
| 14 | sw-cache-120 | 0 | 92 | errori JS: nessuno sw-cache-120 [rosso] ✅ — atteso: seconda apertura senza rete che NON monta (comportamento di prima)  | free=15492/16086MB df=29G libero |
| 15 | albo-122 | 0 | 149 | ✅ rosso: con __CPM_NO_G122 il guardiano boccia l'albo di prima BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 6 (es. t360 · riepilogo assente (albo di prima))  | free=15262/16086MB df=29G libero |
| 16 | intro-118 | 0 | 113 | intro-118 VERDE BRACCIO: verde  | free=15320/16086MB df=29G libero |
| 17 | altezza-114 | 0 | 461 | ✓ rosso 1440x900: 6 schermate fuori regola col rosso (menu, opzioni, offerte, calendario, passaggio-pro) PASS altezza-114 (vuoto <= 12% o pagina che scorre, tocco >= 44) — bracci verde+rosso  | free=15511/16086MB df=29G libero |
| 18 | flussi-115 | 0 | 827 | flussi-115 · 51 controlli · 1 OK · 50 NO · 0 non giudicati braccio ROSSO: atteso rosso — cade su tutti i 17 punti (50 controlli rossi)  | free=15501/16086MB df=29G libero |
| 19 | collaudo-110 | 0 | 368 | ✅ collaudo-110 OK braccio: verde+rosso · motivo: ogni difetto verde col codice nuovo e rosso con il suo interruttore  | free=15511/16086MB df=29G libero |
| 20 | scorri-113 | 0 | 175 | ✅ rosso: con __CPM_NO_G113 resta in basso (il guardiano lo vede) BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 18 (es. t360 menù Stagione→Home: 590)  | free=15500/16086MB df=29G libero |
| 21 | moduli-112 | 0 | 382 | [rosso] tel ata(4-2-3-1) vs fio(3-5-2) a capo 2 · rosa ["4-3-3","4-3-3"] · anteprima ["4-3-3","4-3-3"] · campo {"casa":"4-3-3","ospite":"4-3-3"} · motore {"casa":"4-3-3","ospite":"4-3-3"} · preset undefined / undefined · fuori posto 0 · trama null ✅ moduli-112 · braccio verde: rosa = anteprima = campo = modulo su 6 mis | free=15321/16086MB df=29G libero |
| 22 | pc-tablet-292 | 0 | 787 |   ✅ il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia nel campo PC-TABLET-292: ✅ VERDE  | free=15475/16086MB df=29G libero |
| 23 | griglia-mobile | 0 | 213 | → docs/collaudo-grafico/g0/REPORT.md · docs/collaudo-grafico/g0/dati.json · 65 scatti NON misurato: prepartita: playMatch → nomatch  | free=15509/16086MB df=29G libero |
| 24 | partita-v2 | 0 | 552 |   ✗ CON pc:post: FISCHIO FINALE 1.70:1 (11px) / FC Altoadige Primavera 2.55:1 (15px) / 0–1 2.55:1 (64px) ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato  | free=15391/16086MB df=29G libero |
| 25 | partita2d-297 | 0 | 193 | ROSSO: A cade · B cade · C cade ✅ partita2d-297 VERDE  | free=15505/16086MB df=29G libero |
| 26 | validate-situations | 0 | 697 | gate-history → 1 run · stabile (streak 1 run pulite) ✅ PASS  | free=15511/16086MB df=29G libero |
| 27 | scena3d-96-tel | 0 | 543 | scene giudicate 16/16 · rossi per punto {} · errori di pagina 0 ✓ scena3d-96 VERDE  | free=15488/16086MB df=29G libero |
| 28 | scena3d-96-pc | 0 | 871 | scene giudicate 9/9 · rossi per punto {} · errori di pagina 0 ✓ scena3d-96 VERDE  | free=15506/16086MB df=29G libero |
| 29 | scena3d-96-tab | 0 | 298 | scene giudicate 6/6 · rossi per punto {} · errori di pagina 0 ✓ scena3d-96 VERDE  | free=15515/16086MB df=29G libero |

## Esito

_Parziale: verifica in corso._
