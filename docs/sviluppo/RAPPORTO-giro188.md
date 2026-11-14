# Rapporto giro 188 — PO-400 «manca il pulsante Gioca sul pop up» (7.999.193 rapida)

Ramo `sviluppo/giro188-gioca-momento`, partito da `lavoro/193` (b567a78, = 7.999.192). `GAME_VERSION` non toccata.

## Misura prima
Guardiano nuovo `gioca-188` sul caso della foto (FC Merseyside, St. 3 da W28, 3° a 6 punti dalla vetta, telefono 375 px).
Il tasto «Vai al prossimo momento» si ferma a **W34 · «🏆 Sfida alla capolista»** (vs FC Stamford) e il riquadro mostra:
Simula sì, frase «Hai scelto Simula…» sì, **tasto Gioca assente** — identico alla foto del PO.
Foto: `docs/sviluppo/giro188/prima-375.png`.

Causa confermata: `src/18-career-app.jsx` (ciclo del tasto, ~r.1608) chiamava `setSimula302(true)` anche quando
`_chiave165` dichiarava la partita chiave; con `simula302` vero il riquadro (r.~7164-7170) nasconde i tasti Gioca.

## Correzione
`setSimula302(!k || window.__CPM_NO_G188)`: alla fermata per partita chiave il riquadro è quello normale della
settimana (Gioca + Simula + Non ora, con le regole di sempre: convocato/titolare, infortunio, squalifica, e la terza
scelta «solo momenti salienti» solo dove già prevista). Le gare senza posta restano in modalità Simula e il tasto
continua a chiuderle da solo (ramo `if(showMatchPrompt)` invariato). Rosso: `window.__CPM_NO_G188`.

## Dopo
`gioca-188` verde 6/6: fermata «partita chiave» raggiunta (W34 · Sfida alla capolista) · Simula c'è · nessuna frase
«Hai scelto Simula» · «Gioca la partita» c'è · clic → la partita parte (`__CPM_PHASE` = `matchday`) · zero errori.
Rosso (`CPM_ROSSO188=1`): 3 ok, 2 ko, uscita 1. Foto: `dopo-375.png`, `dopo-partita-375.png`.

## Controlli (uno alla volta, CPM_CI_PAR=0, free -m e df -h prima di ognuno)
| controllo | esito |
|---|---|
| gioca-188 | verde 6/0 · rosso 3/2 (cade come deve) |
| momento-185 | verde 25/0 (3 min 29 s) |
| momento-165 | verde 33/0 |
| momento-165b | verde 22/0 |
| momento-173 | VERDE (2 min 15 s) |
| solo-highlight-166 | VERDE: PASSA · il suo rosso cade su 3, 7, 8 (11 min) |
| career-critical | 5 PASS, 0 fail (10 min 36 s) |
| test:logic | 51 pass, 0 fail |
| save-compat | 12 pass, 0 fail |

`gioca-188` aggiunto a `package.json` e a `ci-runner.mjs` (catena carriera, mappa `src/18|16|10`, LENTI; ogni catena
una volta, `node --check` ok). `build-src` + `check-src`: IDENTICO BYTE PER BYTE.

## Dubbi per il PO (nessuna decisione presa)
- Le fermate non-partita (intervista, momento importante, mercato) variano da una corsa all'altra prima della
  partita chiave (W34 in tutti e tre i giri, ma con fermate intermedie diverse): non tocca questa correzione, segnalato.
- Il titolo «Partita chiave · …» della foto non è stato letto dal guardiano dal testo della pagina (cerca ancora la
  riga, trovata vuota): la fermata è giudicata dal registro `__CPM_SALTA153` (motivo «partita chiave»).
- Roadmap non aggiornata da questo ramo: la riga della 7.999.193 spetta alla sessione di rilascio.
