# Verifica 7.999.196 — parte H (highlight-95)

- **Commit di partenza:** `fda5aa54c6ea84f22b3418033fde9251fb04864e` — «lavoro/196: catene, rimesse portiere-223 e dribbling-226 perse nelle unioni» (ramo `verifica/196-h` creato da qui).
- **check-src:** `✓ IDENTICO BYTE PER BYTE — 7658265 byte ricomposti da 21 frammenti.` (build-src: «byte identici a prima: nessuna modifica nei frammenti»; privacy allineata; HTML allineato a HEAD).
- **Ambiente prima della corsa:** free -m → 16087 MB totali, 15523 disponibili, swap 0 · df -h → 252G, 29G liberi (27% usato).
- **Comando:** `env CPM_CHROME=/opt/pw-browsers/chromium CPM_D3DIAG=1 node highlight-95.mjs` (dalla cartella tests/visual, dopo `npm install --no-package-lock`), una corsa, entrambi i bracci.
- **Durata:** 23:18:11 → 00:52:53 UTC (16→17/11) = **94 min 42 s**.
- **Uscita:** **0** — `✅ highlight-95 verde (e il rosso si vede)`. Corsa unica: verde al primo giro, nessuna ripetizione necessaria.

## Righe finali

```
VERDE highlight 99 · D4 senza esito 0 · passaggi 27 arrivati 88.9% gol compagno 11 assist 11 esiti {"goal/assist":11,"saved/chance":9,"intercettato/intercept":3,"blocked/chance":4} · finte 5 riuscite 40.0% {"null/chance/chance":2,"null/intercept/dispossessed":2,"dribble/intercept/dispossessed":1} · falli cercati 2 · parate giudicate 17 · non giudicabili (guardia di parete) 0 · difetti 0
ROSSO highlight 114 · D4 senza esito 5 · passaggi 31 arrivati 77.4% gol compagno 4 assist 3 esiti {"goal/assist":3,"blocked/intercept":6,"saved/intercept":10,"goal/chance":1,"wide/intercept":4,"intercettato/intercept":7} · finte 7 riuscite 0.0% {"null/intercept/overhit":1,"null/intercept/intercepted":6} · falli cercati 2 · parate giudicate 7 · non giudicabili (guardia di parete) 0 · difetti 176
✅ highlight-95 verde (e il rosso si vede)
```

| braccio | highlight | D4 senza esito | non giudicabili (guardia di parete) | difetti |
|---|---|---|---|---|
| verde | 99 | 0 | 0 | **0** |
| rosso | 114 | 5 | 0 | **176** (il rosso si vede) |

## Ultime 40 righe del registro

```
rosso s1 seme 7 pass fine ended highlight 7 tabellone {"home":1,"away":2}
rosso s1 seme 7 drib fine ended highlight 7 tabellone {"home":1,"away":2}
D3DIAG s5/1234 «🎯 Testa piazzata all'angolo» minGB=5.8 {"tipo":"header","kind":"saved","d3":{"gk":{"x":94.4,"y":49.5},"ball":{"x":78.4,"y":45.5,"h":0.22},"hero":{"x":85.2,"y":45.7},"dHeroOpp":8.63,"gkBall":16.5,"c53":null,"sv":{"k":"3","v":"header_near_post","gx":44.42,"gz":-0.32,"sx":28.4,"sz":-3.06,"tx":45.71,"tz":2.36,"hx":35.21,"hz":-2.96,"aT":0},"p258":{"t":"header","gx":44.42,"prima":45.71,"dopo":44.87,"u":0.95},"p119":null,"gkmin":16.52,"scT":13.75,"gkAct":{"last":"gk_dive","lastTz":2.1},"gkT":{"home":{"x":6.5,"y":49.2},"away":{"x":95,"y":49.2}}},"st":{"act":{"t":null,"aT":1.74,"tgt":{"x":85.2,"y":45.7,"tl":0},"ht":"header","ok":false,"pat":"HEADER_ATTACK","rew":"goal","kind":"saved"},"ball":{"x":78.4,"y":45.5},"hero":{"x":85.2,"y":45.7},"gk":{"x":94.4,"y":49.5}}}
rosso s5 seme 1234 pass fine ended highlight 5 tabellone {"home":2,"away":0}
rosso s5 seme 1234 drib fine ended highlight 2 tabellone {"home":2,"away":0}
rosso s5 seme 2021 pass fine ended highlight 7 tabellone {"home":1,"away":1}
rosso s5 seme 2021 drib fine playing highlight 7 tabellone {"home":1,"away":1}
rosso s5 seme 7 pass fine hl_result highlight 6 tabellone {"home":2,"away":2}
rosso s5 seme 7 drib fine playing highlight 7 tabellone {"home":2,"away":2}
rosso s12 seme 1234 pass fine ceremony highlight 6 tabellone {"home":3,"away":1}
rosso s12 seme 1234 drib fine ceremony highlight 6 tabellone {"home":5,"away":1}
rosso s12 seme 2021 pass fine ceremony highlight 7 tabellone {"home":0,"away":0}
rosso s12 seme 2021 drib fine ceremony highlight 7 tabellone {"home":1,"away":2}
rosso s12 seme 7 pass fine ceremony highlight 4 tabellone {"home":1,"away":3}
rosso s12 seme 7 drib fine ceremony highlight 5 tabellone {"home":0,"away":2}
rosso s12 seme 1234 pass (scena senza esito) fine ceremony highlight 6 tabellone {"home":3,"away":1}
  rosso rivelazioni lette da un'altra scena (abbinate per indice): 8
    ~ s1/1234 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s1/1234 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s1/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s5/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s5/2021 hl4: letta hl3 via riserva+occupata · giusta nessuna
    ~ s12/1234 hl3: letta hl2 via riserva+occupata · giusta nessuna
ROSSO highlight 114 · D4 senza esito 5 · passaggi 31 arrivati 77.4% gol compagno 4 assist 3 esiti {"goal/assist":3,"blocked/intercept":6,"saved/intercept":10,"goal/chance":1,"wide/intercept":4,"intercettato/intercept":7} · finte 7 riuscite 0.0% {"null/intercept/overhit":1,"null/intercept/intercepted":6} · falli cercati 2 · parate giudicate 7 · non giudicabili (guardia di parete) 0 · difetti 176
  · D3 s1/1234 «🛡️ Scivolata netta»: esito «Muro invalicabile!» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.24,"sl":0.46,"bx":5.7,"ck":7.459200000000168},"rr":null}
  · D3 s1/1234 «↗️ Palla in area»: esito «Non trova lo specchio» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.03,"sl":0.55,"bx":32.1,"ck":11.509200000000217},"rr":null}
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato ma chiave intercept ok=false
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato raccontato perso «Ti portano via il pallone»
  · D1 s1/1234 «🔁 Uno-due con COSTA»: 3D intercetta un passaggio arrivato (intercepted)
  · D3 s1/1234 «🔁 Uno-due con COSTA»: esito «Ti portano via il pallone» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.03,"sl":0.57,"bx":25.9,"ck":16.121800000000373},"rr":null}
  · D3 s1/1234 «✈️ Stacco in corsa potente»: esito «Tiro fuori di poco» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.13,"sl":0.46,"bx":29.6,"ck":24.32180000000049},"rr":null}
  · D3 s1/1234 «⚡ Conclusione di prima»: esito «Il gol sembrava fatto» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.08,"sl":0.51,"bx":26.7,"ck":29.22180000000056},"rr":null}
  · D3 s1/1234 «🛡️ Scivolata netta»: esito «Muro invalicabile!» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.19,"sl":0.51,"bx":9.6,"ck":7.764699999999701},"rr":null}
  · D3 s1/1234 «↗️ Palla in area»: esito «Non trova lo specchio» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.08,"sl":0.51,"bx":32.1,"ck":11.664699999999753},"rr":null}
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato ma chiave intercept ok=false
  · D1 s1/1234 «🔁 Uno-due con COSTA»: passaggio arrivato raccontato perso «Ti portano via il pallone»
  · D1 s1/1234 «🔁 Uno-due con COSTA»: 3D intercetta un passaggio arrivato (intercepted)
  · D3 s1/1234 «🔁 Uno-due con COSTA»: esito «Ti portano via il pallone» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione {"cap":null,"c":{"tl":false,"arc":true,"pa":false,"pat":null,"pt":-1,"at":-0.24,"sl":0.37,"bx":25.9,"ck":15.764699999999811},"rr":null}
✅ highlight-95 verde (e il rosso si vede)
EXIT 0
```
