# Catena 184-finale — verifica sul build 7.999.184 (HEAD cc8f53a)

Sessione di sola verifica, nessuna modifica a src/ tests/ gioco. `CPM_CI_PAR=0`, un controllo alla volta. `check-src`: allineato, GAME_VERSION 7.999.184.

| controllo | uscita | durata | braccio / motivo (righe finali) | free (MB, libera) / df (disponibile) |
|---|---|---|---|---|
| test-logic | 0 | 3s | # todo 0 # duration_ms 3433.744554  | 15054 / 29G |
| save-compat | 0 | 14s | === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | 14999 / 29G |
| replay | 0 | 50s | replay scritti → tests/visual/out/validate/replay · 8 highlight ✅ PASS — replay completi e coerenti  | 14604 / 29G |
| tabellone-117 | 0 | 323s | {"percorso":"ripresa","rosso":true,"err":null,"prima":{"score":{"home":1,"away":0},"motore":{"home":1,"away":0},"log":1,"ev":["home"],"t216":null,"r117":null,"min":11},"snap":{"clock":11,"score":{"home":1,"away":0},"g117":false},"rientro":{"score":{"home":1,"a | 14668 / 29G |
| tabellino-228 | 0 | 315s | k4 rosso: tabellino 0-2 (mio-loro), tabellone 1-0, motore 2-0, golLog [{"min":60,"tick":1438,"lato":"home","scena":false,"chi":7},{"min":93,"tick":2628,"lato":"home","scena":false,"chi":9}], fischio [{"min":90,"minVero":93,"causa":"clock"}], tolti228 null, pro | 14619 / 29G |
| altezza-114 | 0 | 517s | ✓ rosso 1440x900: 6 schermate fuori regola col rosso (menu, opzioni, offerte, calendario, passaggio-pro) PASS altezza-114 (vuoto <= 12% o pagina che scorre, tocco >= 44) — bracci verde+rosso  | 14655 / 29G |
| flussi-115 | 0 | 890s | flussi-115 · 51 controlli · 1 OK · 50 NO · 0 non giudicati braccio ROSSO: atteso rosso — cade su tutti i 17 punti (50 controlli rossi)  | 14557 / 29G |
| intro-118 | 0 | 114s | intro-118 VERDE BRACCIO: verde  | 14639 / 29G |
| collaudo-110 | 0 | 349s | ✅ collaudo-110 OK braccio: verde+rosso · motivo: ogni difetto verde col codice nuovo e rosso con il suo interruttore  | 14638 / 29G |
| scorri-113 | 0 | 166s | ✅ rosso: con __CPM_NO_G113 resta in basso (il guardiano lo vede) BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 18 (es. t360 menù Stagione→Home: 590)  | 14561 / 29G |
| lineetta-181 | 0 | 181s | ✅ verde: lineetta oro in 3 formati ✅ rosso: torna il pallino (il guardiano lo vede)  | 14514 / 29G |
| moduli-112 | 0 | 379s | [rosso] tel ata(4-2-3-1) vs fio(3-5-2) a capo 2 · rosa ["4-3-3","4-3-3"] · anteprima ["4-3-3","4-3-3"] · campo {"casa":"4-3-3","ospite":"4-3-3"} · motore {"casa":"4-3-3","ospite":"4-3-3"} · preset undefined / undefined · fuori posto 0 · trama null ✅ m | 14403 / 29G |
| formazioni-204 | 0 | 62s | {"412x915":{"gap":36,"scorre":false},"412x915-rosso":{"gap":0,"scorre":false},"360x740":{"gap":16,"scorre":false}} ✅ formazioni-204 verde (e il rosso si vede)  | 14493 / 29G |

_Parziale/finale generato da /tmp/cat; log completi nella sessione._
