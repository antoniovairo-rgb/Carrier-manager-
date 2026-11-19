# Verifica di rilascio 7.999.198 — blocco F2 (highlight-95)

**Esito: VERDE al primo tentativo — classificazione: verde.**

## Cosa è stato verificato
- Build: ramo `prova/198-finale`, commit `086cdba9` (giri 286 e 291 in src/12: portatore fermo nella lettura, verso dell'eroe dopo un recupero).
- Comando, da `tests/visual`: `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout 7800 npm run -s highlight-95`.
- Una sola corsa valida: partenza 19/11/2026 13:11:32 UTC, fine 15:05 UTC (~1 h 54 min), uscita 0. Nessun riavvio del contenitore durante la corsa (`uptime` a fine corsa: 2 h 01 min).
- Nessuna riprova e nessuna corsa sulla base `lavoro/198` (f4051ca0): non necessarie, perché la prima corsa è verde.
- Nessun file in `docs/` rigenerato dalla corsa (`git status` pulito prima del rapporto).

## Righe stampate
```
VERDE highlight 96 · D4 senza esito 0 · passaggi 28 arrivati 89.3% gol compagno 13 assist 13 esiti {"goal/assist":13,"saved/chance":8,"intercettato/intercept":3,"blocked/chance":4} · finte 5 riuscite 40.0% {"dribble/chance/chance":2,"dribble/intercept/dispossessed":3} · falli cercati 1 · parate giudicate 18 · non giudicabili (guardia di parete) 0 · difetti 0
ROSSO highlight 106 · D4 senza esito 5 · passaggi 29 arrivati 82.8% gol compagno 4 assist 3 esiti {"goal/assist":3,"blocked/intercept":6,"saved/intercept":10,"goal/chance":1,"wide/intercept":4,"intercettato/intercept":5} · finte 6 riuscite 0.0% {"pass/intercept/overhit":1,"pass/intercept/intercepted":5} · falli cercati 2 · parate giudicate 6 · non giudicabili (guardia di parete) 0 · difetti 165
✅ highlight-95 verde (e il rosso si vede)
```

Il braccio rosso mostra 165 difetti (D1/D3 su uno-due, scivolata, palla in area, conclusioni): è la prova che il guardiano vede il difetto quando il rimedio è spento, come atteso.

## Note e dubbi
- Prima della corsa valida c'è stato un avvio a vuoto (13:11:10): `tests/visual/node_modules` mancava (`ERR_MODULE_NOT_FOUND: playwright`). Risolto con `npm install` (12 pacchetti, nessuna modifica ai file tracciati); quell'avvio non ha eseguito alcun controllo e non conta come tentativo.
- Nel braccio verde il gioco riporta alcune «rivelazioni lette da un'altra scena (abbinate per indice)» (es. `s1/7 hl2: letta hl1 via chiusura`): sono righe informative dello strumento, non difetti contati (difetti verde = 0).
- Una sola corsa verde non esclude l'instabilità: il verdetto vale per questa corsa su questo build.
