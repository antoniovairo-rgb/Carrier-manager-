# Catena 182-finale — verifica 7.999.182

Build: GAME_VERSION 7.999.182, `check-src` allineato (HEAD 2b9f642). Sessione di sola verifica: nessuna modifica a src/, tests/, gioco. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium. free = MB liberi/totali prima del controllo; df = spazio disponibile su /.

| controllo | uscita | durata | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|
| test:logic | 0 | 3s | # todo 0 ⏎ # duration_ms 2732.650691 | 15087/16086 / 29G |
| save-compat | 0 | 11s | === SAVE-COMPAT === 12 pass · 0 fail ⏎ ✅ PASS | 14978/16086 / 29G |
| replay | 0 | 47s | replay scritti → tests/visual/out/validate/replay · 8 highlight ⏎ ✅ PASS — replay completi e coerenti | 14509/16086 / 29G |
| moduli-112 | 0 | 349s | [rosso] tel ata(4-2-3-1) vs fio(3-5-2) a capo 2 · rosa ["4-3-3","4-3-3"] · anteprima ["4-3-3","4-3-3"] · campo {"casa":"4-3-3","ospite":"4-3-3"} · motore {"casa":"4-3-3", ⏎ ✅ moduli-112 · braccio verde: rosa = anteprima = campo = modulo su 6 misure · braccio rosso: il difetto si vede (__CPM_NO_G112 riporta tutti a 4-3-3) | 14640/16086 / 29G |
| collaudo-110 | 0 | 332s | ✅ collaudo-110 OK ⏎ braccio: verde+rosso · motivo: ogni difetto verde col codice nuovo e rosso con il suo interruttore | 14513/16086 / 29G |
| lineetta-181 | 0 | 172s | ✅ verde: lineetta oro in 3 formati ⏎ ✅ rosso: torna il pallino (il guardiano lo vede) | 14618/16086 / 29G |
| spalti-109 | 0 | 369s | ROSSO pc   HAR(#f5f5f5/#1e3a8a) v ACR(#dc2626/#0f0f0f) trib casa  99% (prim  89%) osp   0% altro   1% base 70% / sett.osp osp  16% casa  29% altro  56% / cart casa  57% o ⏎ ✅ rosso: __CPM_NO_G109 cade su 21/21 misure, coppia del PO compresa | 14380/16086 / 29G |
| partita2d-297 | 0 | 176s | ROSSO: A cade · B cade · C cade ⏎ ✅ partita2d-297 VERDE | 14521/16086 / 29G |
| freccia-107 | 0 | 218s | ROSSO: A cade · B cade · C cade ⏎ ✅ freccia-107 VERDE | 14649/16086 / 29G |
| partita-v2 | 0 | 547s | ✗ CON pc:post: FISCHIO FINALE 1.70:1 (11px) / FC Altoadige Primavera 2.55:1 (15px) / 0–1 2.55:1 (64px) ⏎ ROSSO ATTESO OK: col tema di prova a basso contrasto cade PAL su ogni schermata e CON in ogni formato | 14546/16086 / 29G |
| pc-tablet-292 | 0 | 735s | ✅ il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia nel campo ⏎ PC-TABLET-292: ✅ VERDE | 14645/16086 / 29G |
| formazioni-204 | 0 | 56s | {"412x915":{"gap":36,"scorre":false},"412x915-rosso":{"gap":0,"scorre":false},"360x740":{"gap":16,"scorre":false}} ⏎ ✅ formazioni-204 verde (e il rosso si vede) | 14661/16086 / 29G |
| carriera3-94 (CPM_SOLO=D2) | 0 | 119s | ok   D2: nessun errore di pagina () ⏎ VERDE | 14574/16086 / 29G |
| contatto-103 | 1 | 471s | ✗ contatto-103 ROSSO ⏎ · rosso: il difetto non si vede | 14648/16086 / 29G | **ROSSO NON ATTESO — non rigiocato (vedi note)**
| riserva-103 | 0 | 951s | ✓ riserva-103 VERDE (e il rosso si vede) ⏎ ✓ riserva-103 VERDE (e il rosso si vede) | 14611/16086 / 29G |
| portiere-252 | 1 | 589s | verde: KO 0/7 · rosso: KO 0/7 ⏎ ❌ portiere-252 ROSSO — rosso NON VISTO: 0 KO su 7 portieri giudicati (seme 1, 8 scene) | 14661/16086 / 29G |
| validate-situations | 0 | 633s | gate-history → 1 run · stabile (streak 1 run pulite) ⏎ ✅ PASS | 14613/16086 / 29G |
| scena3d-96 | 0 | 1408s | scene giudicate 31/31 · rossi per punto {} · errori di pagina 0 ⏎ ✓ scena3d-96 VERDE | 14555/16086 / 29G |
| partita-vera | 0 | 504s | ✅ nomi-veri — 76/76 righe-fatto con un cognome della rosa (rosa 20 nomi) ⏎ ✅ PARTITA-VERA OK — le bande d'accettazione tengono. | 14642/16086 / 29G |
| highlight-95 | 0 | 3817s | · D1 s1/1234 «🔁 Uno-due con LUZI»: passaggio arrivato raccontato perso «Ti portano via il pallone» ⏎ ✅ highlight-95 verde (e il rosso si vede) | 14649/16086 / 29G |
| collaudo-108 | 0 | 1959s | G180-44  ✗ 6 rilievi  — post-partita s360-rosso: «Il tuo tabellino›» 302x36 (effettivo 302x42) / post-partita s360-rosso: «🔗Le connessioni›» 302x36 (effettivo 302x42) / p ⏎ ROSSO ATTESO OK: ogni difetto torna coi suoi interruttori | 14635/16086 / 29G |
| career-critical | 0 | 619s | ✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale (undici passi) | 14386/16086 / 29G |


## Esito

- Verdi (uscita 0): 20 su 22 — test:logic, save-compat, replay, moduli-112, collaudo-110, lineetta-181, spalti-109, partita2d-297, freccia-107, partita-v2, pc-tablet-292, formazioni-204, carriera3-94 (D2), riserva-103 (951 s, oltre i 15 min come previsto), validate-situations, scena3d-96, partita-vera, highlight-95 (verde + rosso, 3817 s), collaudo-108, career-critical.
- **portiere-252**: uscita 1, «rosso NON VISTO: 0 KO su 7 portieri giudicati (seme 1, 8 scene)» — atteso e dichiarato.
- **contatto-103**: uscita 1 (471 s). Righe finali: «VERDE parate giudicate 2 · difetti 0 · D3 … 0 / ROSSO parate giudicate 2 · difetti 0 · D3 … 0 / ✗ contatto-103 ROSSO / · rosso: il difetto non si vede». Cioè il braccio verde è pulito, ma il braccio rosso non vede il difetto (solo 2 parate giudicate). NON è fra i rossi attesi. **Non l'ho rigiocato** (la consegna prevedeva un rigioco): la catena è finita a 16:39 con il tetto delle 4 ore alle ~16:43 e il controllo ne richiede ~8 min. Esito singolo, non confermato da un secondo giro: da rigiocare.
- Non è stato riparato nulla; src/, tests/ e gioco non toccati. Giro lanciato con CPM_CI_PAR=0, un controllo alla volta.

## Rigioco della sessione madre (07/11 ~17:15 UTC)

- **contatto-103** rigiocato una volta sullo stesso build (lavoro/182, check-src allineato), CPM_CI_PAR=0: uscita **0** — «VERDE parate giudicate 2 · difetti 0 · ROSSO parate giudicate 2 · difetti 1 (D3 s12/7 Uno-due con HOWARD) · ✓ contatto-103 VERDE (e il rosso si vede)». Il rosso del primo giro era instabilità del braccio rosso (2 parate giudicate = il pavimento, margine zero, già segnalato dal giro 111): registrato come PO-319 per la 183.
