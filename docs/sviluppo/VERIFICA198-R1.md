# Verifica della 7.999.198 — parte R1 (residui)

- Finale sotto esame: `prova/198-finale` (0f0b13d8) · base di confronto: `lavoro/198` (b3b75b9d)
- Ramo di lavoro: `sviluppo/verifica198-r1` · data: 20/11/2026
- Regole: un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti a controllo, nessuna correzione, «non giudicato» = rosso.
- Tutti e dieci i nomi richiesti esistono in `tests/visual/package.json`.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| interviste-183 | ✅ verde (rc 0, 264 s) | — | — | verde 0% domande ripetute, rosso visibile (36,1% in Primavera) |
| sigle-203 | ✅ verde (rc 0, 608 s) | — | — | quattro passate: telefono 18 ok · 0 ko, 1366 px 8 ok · 0 ko; i due bracci rossi (203 e 254) si vedono (5 ko e 1 ko) |
| box-fischio-169 | ⚠️ instabile: corsa 1 ROSSA (rc 1, 66 s — caduta della sonda nel braccio verde: `page.screenshot: Expected options.clip.width to be greater than 0`, riga 89), corsa 2 verde (rc 0, 193 s: 54 giudicati · 0 sotto soglia · 0 non giudicati, voto 12/12, rosso riprodotto 45 sotto soglia) | stessa caduta (rc 1, 166 s): braccio verde PASS 54/0/0 e 12/12, poi la sonda cade nel braccio rosso con lo stesso errore alla riga 89 | non nasce dall’unione (presente sulla base b3b75b9d) | instabilità della sonda, non del gioco: il rettangolo del riquadro misurato ha larghezza 0 e la foto viene chiesta prima del ricontrollo di coerenza; una caduta vale «non giudicato» = rosso. Quando arriva al verdetto il contenuto è verde su entrambi i rami |
| cerimonie-192 | ✅ verde (rc 0, 452 s) | — | — | punti A, B, C, D verdi e ogni rosso si vede (es. A slittamento 0,014 contro 0,322; B volo 0,30 contro 2,96) |
| convocazione-190 | ✅ verde (rc 0, 1 s) | — | — | 13 ok · 0 ko; controllo di sola logica (senza browser); scelta del mister identica al braccio rosso 0/300 differenze, frasi cambiate 300 |
| cronaca-nomi-190 | ✅ verde (rc 0, 516 s) | — | — | due partite intere fino al fischio (92′ e 92′), 125 righe di cronaca, 0 col segnaposto |
| difesa-220 | ⛔ fermato al tetto dei 30 minuti (rc 124, 1800 s) = non giudicato = ROSSO | da eseguire in coda agli altri controlli (vedi riga aggiornata più sotto) | da stabilire | dove era: enumerazione fatta (verde 1800 azioni · 0 pressioni; rosso 1800 · 1122), braccio verde CHIUSO e buono (4 scene sui semi 7, 99, 1234, 2021 · 0 pressioni · gesti 2 scivolate + 2 affondi), braccio rosso appena iniziato: nessuna delle sue 4 partite era finita quando il tetto ha chiuso il browser |
| gol-eroe-154 | ⛔ fermato al tetto dei 30 minuti (rc 124, 1800 s) = non giudicato = ROSSO | non eseguito per intero (vedi nota in fondo) | da stabilire | dove era: 4 partite su 10 del campione fisso (k1, k2, k3, k4, verde e rosso; mancavano k5, k6, k7, k8, k21, k22), 6-7,5 minuti a partita (338-453 s). Nelle quattro verdi finite registrato = pagella (0+0 · 1+0 · 0+0 · 1+0) e il rigore provocato al 90′ passa al compagno (g154 1→2, 0→1, 0→1, 1→2); il verdetto finale della sonda non è stato emesso |

Verdetto: **in corso** (8 controlli su 10).
