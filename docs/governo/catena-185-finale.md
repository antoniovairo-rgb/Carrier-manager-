# Catena 185-finale — verifica 7.999.185

Build: HEAD 4556ca5 (lavoro/185), GAME_VERSION 7.999.185, check-src allineato. Sessione di sola verifica, nessuna modifica a src/ tests/ gioco.

| controllo | uscita | durata | braccio/motivo | free/df |
|---|---|---|---|---|
| test-logic | 0 | 4s | 43/43 test, 0 falliti | free 15087/16086MB | df avail 29G used 26% |
| save-compat | 0 | 14s | 12 pass · 0 fail | free 15018/16086MB | df avail 29G used 26% |
| replay | 0 | 51s | 8 highlight, replay completi e coerenti | free 14497/16086MB | df avail 29G used 26% |
| twa-120 | 0 | 48s | 12/12 controlli; verde+rosso (rosso __CPM_NO_G120 cade su 4) | free 14686/16086MB | df avail 29G used 26% |
| sw-cache-120 | 0 | 93s | verde: 2ª/3ª apertura offline montano, 0 file persi; rosso: 2ª apertura non monta (atteso) | free 14581/16086MB | df avail 29G used 26% |
| albo-122 | 0 | 162s | verde+rosso: 0 difetti verde, 6 col rosso | free 14150/16086MB | df avail 29G used 26% |
| tabellone-117 | 0 | 331s | verde+rosso: tabellone=motore=elenco, rosso si vede | free 14266/16086MB | df avail 29G used 26% |
| tabellino-228 | 0 | 310s | verde+rosso: tabellino coincide, rosso si vede | free 14449/16086MB | df avail 29G used 26% |
| intro-118 | 0 | 115s | verde (braccio verde) | free 14440/16086MB | df avail 29G used 26% |
| altezza-114 | 0 | 474s | verde+rosso: PASS, rosso 6 schermate fuori regola | free 14419/16086MB | df avail 29G used 26% |
| flussi-115 | 0 | 872s | verde 54/54 su 17 punti; rosso 1/51 OK (atteso rosso, 50 NO) | free 14300/16086MB | df avail 29G used 26% |
| collaudo-110 | 0 | 345s | verde+rosso: OK, G180-33 verde 3/3 rosso n/a | free 14399/16086MB | df avail 29G used 26% |
| scorri-113 | 0 | 170s | verde+rosso: 0 difetti verde, 18 col rosso | free 14378/16086MB | df avail 29G used 26% |
| lineetta-181 | 0 | 185s | verde+rosso: lineetta oro in 3 formati, rosso torna il pallino | free 14306/16086MB | df avail 29G used 26% |
| moduli-112 | 0 | 369s | verde+rosso: 6 misure coerenti, rosso riporta a 4-3-3 | free 14192/16086MB | df avail 29G used 26% |
| formazioni-204 | 0 | 62s | verde+rosso: gap 36/16 verde, rosso 0 | free 14277/16086MB | df avail 29G used 26% |
| pc-tablet-292 | 0 | 794s | VERDE (rosso fa cadere larghezza/tocco/tasti/striscia) | free 14368/16086MB | df avail 29G used 26% |
| griglia-mobile | 0 | 226s | uscita 0; scritti REPORT.md/dati.json, 65 scatti; riga: «NON misurato: prepartita: playMatch → nomatch» (dichiarata, non rossa) | free 14403/16086MB | df avail 29G used 26% |
| partita-v2 | 0 | 578s | verde+rosso: rosso atteso cade (PAL/CON) | free 14282/16086MB | df avail 29G used 26% |
| partita2d-297 | 0 | 192s | VERDE; rosso: A,B,C cadono | free 14405/16086MB | df avail 29G used 26% |
| validate-situations | 0 | 677s | PASS; 14/14 categorie, fingerprint 00001505, 0 failure | free 14361/16086MB | df avail 29G used 26% |
| scena3d-96 | 0 | 1635s | VERDE: 31/31 scene giudicate, rossi per punto {}, errori di pagina 0 | free 14295/16086MB | df avail 29G used 26% |
| partita-vera | 0 | 506s | OK: bande d'accettazione tengono; 1 riga «non giudicabile (campione sotto minimo) tabellone» (0 partite), le altre ✅ | free 14353/16086MB | df avail 29G used 26% |
| highlight-95 | 0 | 3995s | VERDE+ROSSO (verde+rosso, CPM_D3DIAG=1): verde senza alcun D3, D4 0; rosso D4 5, D3 e D1 solo nel braccio rosso (atteso) | free 14345/16086MB | df avail 29G used 26% |
| career-critical | 0 | 668s | PASS (recovery-competition … catena completa; coppa chiusa una volta, trofeo in finale) | free 14327/16086MB | df avail 29G used 26% |
| build-web | 0 | 10s | dist web: React montato, 0 CDN, 0 fallite, flag store assente | free 14336/16086MB | df avail 29G used 26% |
| build-store | 0 | 9s | dist store: React montato, 0 CDN, 0 fallite, flag store attivo | free 13994/16086MB | df avail 29G used 26% |
| audit-copyright | 0 | 11s | OK: nessun riferimento al mondo reale | free 13765/16086MB | df avail 29G used 27% |

## Esito
Nessun rosso: 29/29 controlli con uscita 0, nessun rigioco necessario. Nessun file di src/, tests/ o del gioco modificato.

Note dichiarate (non rossi):
- griglia-mobile: stampa «NON misurato: prepartita: playMatch → nomatch», uscita 0.
- partita-vera: una riga «non giudicabile (campione sotto minimo) tabellone — 0 partite», uscita 0 con «PARTITA-VERA OK».
- highlight-95 (CPM_D3DIAG=1): nel braccio verde nessuna riga D3; le righe D3 (es. s1/1234 «✈️ Stacco in corsa potente») compaiono solo nel braccio rosso, dove il difetto deve vedersi.
- flussi-115: braccio rosso con 50 NO su 51 è l'esito atteso; verde 54/54.
- validate-situations: 191 scene non rilanciate a parte; fingerprint 00001505.
