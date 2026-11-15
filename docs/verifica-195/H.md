# Verifica 7.999.195 — parte H: `highlight-95`

- **Commit di partenza:** `34a0594580a7404fb93ad095861bc90af96c2cec` (origin/lavoro/195, «lavoro/195: GAME_VERSION 7.999.195»): coincide con 34a05945, `GAME_VERSION` = 7.999.195.
- **Sorgenti:** `node tools/build-src.mjs` → «byte identici a prima»; `node tools/check-src.mjs` → «✓ IDENTICO BYTE PER BYTE — 7538876 byte ricomposti da 21 frammenti», HTML allineato a HEAD.
- **Dipendenze:** `npm ci` in `tests/visual` NON è eseguibile: manca `package-lock.json` (errore EUSAGE). Le ho installate con `npm install --no-package-lock` (12 pacchetti, nessun file del repo modificato). Un primo lancio fatto prima dell'installazione è uscito subito con `ERR_MODULE_NOT_FOUND playwright`: non conta.
- **Comando:** `CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium npm run -s highlight-95` (entrambi i bracci, una sola esecuzione per corsa).
- **Risorse prima della corsa 2:** RAM libera 14442 MB su 16087, disco 29G liberi (27% usato).

## Esiti

| Corsa | Uscita | Braccio verde | Braccio rosso | Rosso visto | Durata |
|---|---|---|---|---|---|
| 1 | 1, **NON VALIDA**: interrotta da me | 100 highlight · difetti 0 · non giudicabili 0 · D4 senza esito 0 | si è fermata all'ultima scena (D4) con «Target page… has been closed»: «rosso: D4 non si vede» | non giudicabile (corsa interrotta) | 90,6 min fino all'interruzione |
| 2 | **0**: «✅ highlight-95 verde (e il rosso si vede)» | **98 highlight · difetti 0 · non giudicabili 0** · D4 senza esito 0 · passaggi 27, arrivati 88,9% · gol del compagno 11 | 110 highlight · difetti 162 · non giudicabili 0 · D4 senza esito 5 | **sì** | 94,8 min (5689 s) |

**Nota sulla corsa 1.** Ho sbagliato a stimare i tempi: credevo che servissero circa 90 minuti per braccio e che il rosso non stesse nel tetto di 2 ore della corsa in sottofondo. Ho quindi chiuso il processo (`kill` sul PID) mentre il rosso stava sulla sua ultima scena. Il «D4 non si vede» e l'uscita 1 vengono da quell'interruzione, non dal gioco. In base alla regola «una corsa interrotta a metà non vale» l'ho rifatta da capo sullo stesso build (corsa 2), e i due bracci insieme sono rimasti sotto le 2 ore.

**Esito della verifica:** VERDE alla prima corsa valida (corsa 2). Non sono servite altre ripetizioni.

## Ultime 40 righe del log (corsa 2)

```
rosso s1 seme 2021 drib fine ended highlight 5 tabellone {"home":1,"away":0}
rosso s1 seme 7 pass fine ended highlight 7 tabellone {"home":1,"away":2}
rosso s1 seme 7 drib fine ended highlight 7 tabellone {"home":1,"away":2}
rosso s5 seme 1234 pass fine ended highlight 1 tabellone {"home":2,"away":1}
rosso s5 seme 1234 drib fine ended highlight 0 tabellone {"home":3,"away":1}
rosso s5 seme 2021 pass fine playing highlight 7 tabellone {"home":1,"away":1}
rosso s5 seme 2021 drib fine hl_result highlight 6 tabellone {"home":1,"away":1}
rosso s5 seme 7 pass fine hl_result highlight 6 tabellone {"home":2,"away":2}
rosso s5 seme 7 drib fine hl_result highlight 7 tabellone {"home":2,"away":2}
rosso s12 seme 1234 pass fine ceremony highlight 6 tabellone {"home":3,"away":1}
rosso s12 seme 1234 drib fine ceremony highlight 6 tabellone {"home":5,"away":1}
rosso s12 seme 2021 pass fine ceremony highlight 7 tabellone {"home":0,"away":0}
rosso s12 seme 2021 drib fine ceremony highlight 7 tabellone {"home":1,"away":2}
rosso s12 seme 7 pass fine ceremony highlight 4 tabellone {"home":1,"away":3}
rosso s12 seme 7 drib fine ceremony highlight 8 tabellone {"home":3,"away":4}
rosso s12 seme 1234 pass (scena senza esito) fine ceremony highlight 6 tabellone {"home":3,"away":1}
  rosso rivelazioni lette da un'altra scena (abbinate per indice): 10
    ~ s1/1234 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s1/1234 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s1/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s5/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s5/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s12/1234 hl3: letta hl2 via riserva+occupata · giusta nessuna
ROSSO highlight 110 · D4 senza esito 5 · passaggi 29 arrivati 79.3% gol compagno 5 assist 4 esiti {"goal/assist":4,"blocked/intercept":6,"saved/intercept":8,"goal/chance":1,"wide/intercept":4,"intercettato/intercept":6} · finte 6 riuscite 16.7% {"null/intercept/overhit":1,"pass/intercept/intercepted":1,"null/intercept/intercepted":3,"null/chance/chance":1} · falli cercati 2 · parate giudicate 7 · non giudicabili (guardia di parete) 0 · difetti 162
  · D3 s1/1234 «🛡️ Scivolata netta»: esito «Muro invalicabile!» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.26,"sl":0.44,"bx":8.2,"ck":7.499999999999981},"rr":null}
  · D3 s1/1234 «↗️ Palla in area»: esito «Non trova lo specchio» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.08,"sl":0.51,"bx":32.1,"ck":11.350000000000026},"rr":null}
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato ma chiave intercept ok=false
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato raccontato perso «Ti portano via il pallone»
  · D1 s1/1234 «🔁 Uno-due con COSTA»: 3D intercetta un passaggio arrivato (intercepted)
  · D3 s1/1234 «🔁 Uno-due con COSTA»: esito «Ti portano via il pallone» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.03,"sl":0.57,"bx":25.9,"ck":15.900000000000091},"rr":null}
  · D3 s1/1234 «✈️ Stacco in corsa potente»: esito «Tiro fuori di poco» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.17,"sl":0.42,"bx":29.6,"ck":25.00000000000022},"rr":null}
  · D3 s1/1234 «⚡ Conclusione di prima»: esito «Il gol sembrava fatto» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.17,"sl":0.42,"bx":28,"ck":29.750000000000288},"rr":null}
  · D3 s1/1234 «🛡️ Scivolata netta»: esito «Muro invalicabile!» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.24,"sl":0.46,"bx":5.1,"ck":7.349999999999982},"rr":null}
  · D3 s1/1234 «↗️ Palla in area»: esito «Non trova lo specchio» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.13,"sl":0.46,"bx":32.1,"ck":11.150000000000023},"rr":null}
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato ma chiave intercept ok=false
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato raccontato perso «Ti portano via il pallone»
  · D1 s1/1234 «🔁 Uno-due con COSTA»: 3D intercetta un passaggio arrivato (intercepted)
  · D3 s1/1234 «🔁 Uno-due con COSTA»: esito «Ti portano via il pallone» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.03,"sl":0.57,"bx":25.9,"ck":15.80000000000009},"rr":null}
✅ highlight-95 verde (e il rosso si vede)
EXIT=0
```
