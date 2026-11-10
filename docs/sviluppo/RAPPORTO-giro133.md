# Giro 133 · PO-333 — le amichevoli della Nazionale nella card «Prossima» come finale/girone

Ramo `sviluppo/giro133-amichevoli` (da `sviluppo/giro131-prossima`). GAME_VERSION non toccata. Nessun campo nuovo nel salvataggio.

## Difetto (domanda aperta 1 del giro 131)
Con un'amichevole della Nazionale in calendario (ramo `_naz35`, voce `type:"national"` del calendario del club) la card
mostrava la Nazionale contro l'avversario, ma sotto la Nazionale c'era la striscia della forma del CLUB e mancava la riga «Poi:».

**Riprodotto prima della correzione** (build del giro 131, salvataggio di prova `banco-g0`, stagione 12: amichevole Italia-Portogallo
aggiunta in una settimana libera da gare di club, la 19): a 360x800 e 1440x900 la card aveva la forma del club sotto «Italia» e nessuna
riga «Poi» (attesa: «FC Bruzio · sett. 20»). Il fondo era già nel colore della Nazionale (#003399): `me` è la Nazionale dal 7.999.35.
Foto in `docs/sviluppo/foto-giro133/prima/`.

## Correzione (decisione PO 09/11 «Sì, nella 188»)
- `src/18-career-app.jsx`: helper `prossimaClubDopo133(md)` = la prima gara di club non giocata dopo l'amichevole, dal calendario
  (settimana ≥ quella dell'amichevole, esclusi voci Nazionale, voci stantie `_isStaleMd` e coppa chiusa, ordinata per settimana).
- Card: per l'amichevole si riusa la stessa riga «Poi:» del giro 131 (stesso elemento `data-cpm="poi131"`, stesso formato
  «Poi: <club> · sett. N · casa/trasferta») e si toglie la forma sotto la Nazionale, con la stessa condizione del giro 131.
  Nessuna seconda logica di disegno: cambia solo da dove arriva la gara del club (coda Nazionale → `getThisWeekMatchday`;
  amichevole → calendario dopo l'amichevole).
- Interruttore rosso `__CPM_NO_G133` = com'era al giro 131.

## Guardiano: `npm run prossima-131` esteso
- caso nuovo `amichevole` (360x800 e 1440x900);
- sui casi Nazionale due controlli in più: nessuna forma del club (`forma-v2`) e fondo = colore della Nazionale (`NAT_CLUB_DATA`);
- per l'amichevole «Poi» deve portare club e settimana attesi; «non giudicato» (nessuna settimana libera, gara attesa ignota) = rosso;
- terzo braccio `rosso133` (`__CPM_NO_G133`): deve cadere SOLO sul caso amichevole, i casi del giro 131 verdi. Soglie non toccate.

| braccio | esito |
|---|---|
| verde | 10 controlli, 0 rossi → PASSA |
| rosso `__CPM_NO_G131` | 6/10 rossi, primo caso caduto `nc-finale` → CADE COME DEVE |
| rosso `__CPM_NO_G133` | 2/10 rossi, solo `amichevole` (forma presente, «Poi» assente) → CADE COME DEVE |

Foto dopo: `docs/sviluppo/foto-giro133/dopo/` (`*-verde.png` corretto, `*-rosso133.png` com'era).

## Catena
Un controllo alla volta (`CPM_CI_PAR=0`, `free -m` e `df -h` prima di ognuno, `CPM_CHROME=/opt/pw-browsers/chromium`), sul build
finale (`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte).

| controllo | esito |
|---|---|
| prossima-131 (esteso) | verde 10/10 · rosso131 6/10 · rosso133 cade solo sull'amichevole |
| griglia-mobile | uscita 0 (riga «NON misurato: prepartita: playMatch → nomatch» preesistente, come nei giri 25/30/54/58/131). Foto rigenerate ripristinate, non committate |
| design-system | SISTEMA GRAFICO OK |
| career-critical | verde in due gruppi: 7 passi + 4 passi (pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) |
| test:logic | 43 pass · 0 fail |
| save-compat | 12 pass · 0 fail |

GAME_VERSION non toccata (da istruzioni), quindi nessuna riga di roadmap: la scriverà chi unirà il ramo in una versione.

## Domande aperte per il PO
1. Se nella stessa settimana dell'amichevole ci fosse anche una gara di club (nel gioco la convocazione cade nelle soste, quindi
   non l'ho osservato), la card mostra comunque la gara di club, perché `getThisWeekMatchday` serve per prima la voce di club;
   in quel caso «Poi:» non compare. Va bene così?
2. Il comando principale dell'amichevole dice «Gioca vs Portogallo · Nazionale · Amichevole internazionale» e non ripete la gara
   del club che segue (le gare di Coppa Nazioni/Euro hanno «poi: <club> W.N» anche nel comando). Uniformare anche il comando?
