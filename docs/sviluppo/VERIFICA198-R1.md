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

Verdetto: **in corso** (3 controlli su 10).
