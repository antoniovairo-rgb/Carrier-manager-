# Giro 131 · PO-331 — la card «Prossima» e il comando dicono la stessa partita

Ramo `sviluppo/giro131-prossima` (da `lavoro/187`). GAME_VERSION non toccata. Nessun campo nuovo nel salvataggio.

## Difetto
Foto del PO (7.999.186, stagione 14 sett. 21): la card «Prossima» annunciava FC Merseyside-FC Dorset (Premier Division,
19ª giornata), mentre il comando principale nella stessa card diceva «Gioca vs Inghilterra — Coppa Nazioni · Finale».

**Causa letta nel codice:** la card prendeva la gara da `getThisWeekMatchday()` (solo calendario del club), il comando da
`getContinuaState()`, che mette prima la coda della Coppa Nazioni e il torneo Euro/Mondiale (stesso ordine di `handleContinua`).

**Riprodotto prima della correzione** (build della 7.999.187, salvataggio di prova `banco-g0`, stagione 12, coda iniettata):
6 controlli su 8 rossi — in tutti i casi con la Nazionale la card mostrava «FC Lariano - FC Salernum · Lega B · 11ª giornata»
e il comando «Gioca vs Inghilterra / Germania / Spagna». Foto in `docs/sviluppo/foto-giro131/prima/`.

## Correzione (decisione PO 09/11 «Finale in primo piano»)
- `src/18-career-app.jsx`: nuovo helper `prossimaNazionale131()` = UNICA fonte per la prossima gara della Nazionale (Coppa
  Nazioni, qualificazioni / girone / KO di Europeo e Mondiale). `getContinuaState()` ne prende etichetta e sottotitolo
  (testi identici a prima, compresa la correzione 7.700.0 «Finale» / «Partita n/N»); la card ne prende squadra, avversario,
  torneo e turno.
- Card: Nazionale del giocatore contro l'avversario vero (stemmi/colori da `NAT_CLUB_DATA`, come il ramo `_naz35`),
  titolo «Prossima · Coppa Nazioni · Finale» (o «Partita n/N», «Europeo · Girone · Giornata n/N», ecc.), nessuna posizione
  in classifica, e sotto le squadre la riga piccola «Poi: FC … · sett. N · casa/trasferta» con la gara del club.
  Sotto la Nazionale non compare più la striscia della forma del club.
- Se non c'è Nazionale in coda: tutto come prima.
- Interruttore rosso `__CPM_NO_G131` = comportamento di prima.

## Guardiano nuovo: `npm run prossima-131`
Quattro casi (finale Coppa Nazioni · girone Coppa Nazioni · Europeo girone · nessuna Nazionale) × 360x800 e 1440x900.
Per ogni caso: squadre della card = attese, comando che nomina lo stesso avversario, turno concorde fra testata e comando,
riga «Poi» con la gara del club, nessuna posizione di campionato. «Non giudicato» = rosso.

| braccio | esito |
|---|---|
| verde | 8 controlli, 0 rossi → PASSA |
| rosso `__CPM_NO_G131` | 6/8 rossi, primo caso caduto: `nc-finale` → CADE COME DEVE |

Foto dopo: `docs/sviluppo/foto-giro131/dopo/` (`*-verde.png` corretto, `*-rosso.png` com'era).

## Catena
Un controllo alla volta (`CPM_CI_PAR=0`, `free -m` e `df -h` prima di ognuno, `CPM_CHROME=/opt/pw-browsers/chromium`),
sul build finale (`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte).

| controllo | esito |
|---|---|
| prossima-131 | verde 8/8 · rosso 6/8, cade su `nc-finale` |
| griglia-mobile | uscita 0 (la riga «NON misurato: prepartita: playMatch → nomatch» è preesistente, già nei rapporti dei giri 25/30/54/58; `playMatch` dipende solo da `getThisWeekMatchday`, non toccato). Foto rigenerate della griglia ripristinate, non committate |
| design-system | SISTEMA GRAFICO OK |
| career-critical | verde, in due gruppi (la prima corsa unica ha sforato i 10 minuti ed è stata rifatta da capo): 7 passi + 4 passi (pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) |
| test:logic | uscita 0 |
| save-compat | 12 pass · 0 fail |
| altezza-114 | PASS su 360x800, 412x915, 1440x900 (verde + rosso), un formato per chiamata |
| pc-tablet-292 | VERDE con prova del rosso, in due gruppi di formati (pc1366+pc1920 · tabV+tabO+tel): la corsa unica sforava i 10 minuti |

Note: GAME_VERSION non toccata (da istruzioni del giro), quindi nessuna riga di roadmap scritta: la scriverà chi
unirà il ramo in una versione.

## Domande aperte per il PO
1. Le amichevoli della Nazionale (ramo `_naz35`, gara nel calendario del club) mostrano ancora la forma del club sotto la
   Nazionale e non hanno la riga «Poi:». Uniformarle a questo giro? Non l'ho fatto per non uscire dall'ambito.
2. Con la gara della Nazionale in coda ma il giocatore infortunato o con la settimana non ancora vissuta, la card mostra già
   la Nazionale mentre il comando dice «Vivi la settimana» / riabilitazione: è la prossima partita da giocare, ma va bene così?
3. Il colore di fondo della card segue la squadra mostrata (blu per l'Italia): confermare o tenere il colore del club.
