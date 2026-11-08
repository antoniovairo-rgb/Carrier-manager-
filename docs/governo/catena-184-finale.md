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
| pc-tablet-292 | 0 | 786s |   ✅ il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia nel campo PC-TABLET-292: ✅ VERDE  | 14627 / 29G |
| griglia-mobile | 0 | 222s | → docs/collaudo-grafico/g0/REPORT.md · docs/collaudo-grafico/g0/dati.json · 65 scatti NON misurato: prepartita: playMatch → nomatch  | 14593 / 29G |
| partita-v2 | 0 | 562s |   ✗ CON pc:post: FISCHIO FINALE 1.70:1 (11px) / FC Altoadige Primavera 2.55:1 (15px) / 0–1 2.55:1 (64px) ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato  | 14497 / 29G |
| partita2d-297 | 0 | 194s | ROSSO: A cade · B cade · C cade ✅ partita2d-297 VERDE  | 14573 / 29G |
| validate-situations | 0 | 679s | gate-history → 1 run · stabile (streak 1 run pulite) ✅ PASS  | 14565 / 29G |
| scena3d-96 | 0 | 1714s | scene giudicate 31/31 · rossi per punto {} · errori di pagina 0 ✓ scena3d-96 VERDE  | 14505 / 29G |
| partita-vera | 0 | 506s |   ✅ nomi-veri — 76/76 righe-fatto con un cognome della rosa (rosa 20 nomi) ✅ PARTITA-VERA OK — le bande d'accettazione tengono.  | 14576 / 29G |
| highlight-95 | 0 | 4005s |   · D1 s1/1234 «🔁 Uno-due con LUZI»: passaggio arrivato raccontato perso «Ti portano via il pallone» ✅ highlight-95 verde (e il rosso si vede)  | 14582 / 29G |
| career-critical | 0 | 706s |   ✅ il trofeo si alza una volta sola, e nell'ultima gara → alzate 1 ✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.  | 14565 / 29G |
| build-dist | 0 | 10s | tempo 9.9s ✅ dist offline pronta per il packaging (1.3 Capacitor)  | 14561 / 29G |
| validate-dist | 0 | 3s | flag build store (feature AI off, 1.6): ✅ attivo ✅ DIST OFFLINE FUNZIONANTE  | 14191 / 29G |

## Esito

**22 controlli su 22 verdi al primo giro, nessun rosso da rigiocare.** Rilevazioni:

- `highlight-95` (completo, verde + rosso, 4005 s): braccio VERDE 96 highlight, difetti 0, D4 0. Le righe D3 («il pallone non arriva mai al portiere entro 1,5 s», caso `s1/1234 «✈️ Stacco in corsa potente»`, minimo 11.4) compaiono **solo nel braccio ROSSO** (difetti iniettati apposta; 105 highlight, D1/D3/D4 visibili) e lì sono l'esito atteso. Nessun D3 nel verde. `CPM_D3DIAG` non è supportato da `highlight-95.mjs`.
- `build-dist`: la prima invocazione è fallita (rc=1, MODULE_NOT_FOUND) per un errore mio di percorso relativo (il lanciatore entrava in `tests/visual`); rilanciata con percorso assoluto, rc=0. Stessa cosa per `validate-dist` (rc=1 per lo stesso motivo, poi rc=0). Le righe sopra riportano l'esito buono.
- `flussi-115`: braccio rosso con 50 NO su 51 controlli = atteso (il rosso si vede).
- Nessuna modifica a `src/`, `tests/` o al gioco.
