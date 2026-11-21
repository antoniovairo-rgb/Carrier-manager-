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
| difesa-220 | ⛔ fermato al tetto dei 30 minuti (rc 124, 1800 s) = non giudicato = ROSSO | non eseguito per intero (vedi nota in fondo) | non stabilito | dove era: enumerazione fatta (verde 1800 azioni · 0 pressioni; rosso 1800 · 1122), braccio verde CHIUSO e buono (4 scene sui semi 7, 99, 1234, 2021 · 0 pressioni · gesti 2 scivolate + 2 affondi), braccio rosso appena iniziato: nessuna delle sue 4 partite era finita quando il tetto ha chiuso il browser |
| gol-eroe-154 | ⛔ fermato al tetto dei 30 minuti (rc 124, 1800 s) = non giudicato = ROSSO | non eseguito per intero (vedi nota in fondo) | non stabilito | dove era: 4 partite su 10 del campione fisso (k1, k2, k3, k4, verde e rosso; mancavano k5, k6, k7, k8, k21, k22), 6-7,5 minuti a partita (338-453 s). Nelle quattro verdi finite registrato = pagella (0+0 · 1+0 · 0+0 · 1+0) e il rigore provocato al 90′ passa al compagno (g154 1→2, 0→1, 0→1, 1→2); il verdetto finale della sonda non è stato emesso |
| grafica-168 | ✅ verde (rc 0, 160 s) | — | — | braccio verde passato; braccio rosso atteso visibile: con `__CPM_NO_G168` la riga del giocatore perde il colore del club in 15/15 casi |
| manovre-150 | ✅ verde (rc 0, 5 s) | — | — | preludio 93,2% (123/132 occasioni), uno-due 25,8%; il rosso `__CPM_NO_P6M` si vede (0 preludi) |

## Conto

- Verdi sulla finale: **7 su 10** — interviste-183, sigle-203, cerimonie-192, convocazione-190, cronaca-nomi-190, grafica-168, manovre-150.
- Instabile: **1** — box-fischio-169 (una corsa caduta, una verde; la stessa caduta c'è sulla base).
- Fermati al tetto dei 30 minuti (= non giudicati = rossi): **2** — difesa-220 e gol-eroe-154.
- Nessun controllo ha rigenerato file in `docs/` o altrove: `git status` pulito dopo ogni corsa.

## I due controlli fermati al tetto

Il tetto di 30 minuti a controllo di questa verifica è **più corto della durata normale** dei due controlli, quindi non potevano finire né sulla finale né sulla base:

- `difesa-220`: in `docs/governo/STABILITA.json` le sue corse verdi complete durano **2128–2330 s** (35–39 minuti); qui a 1800 s aveva chiuso il braccio verde (buono) e iniziato il rosso.
- `gol-eroe-154`: `docs/sviluppo/RAPPORTO-giro265.md` riga 128 lo registra verde in **3909 s** (65 minuti) per 10 partite a braccio; qui a 1800 s era a 4 partite su 10, con un passo (6–7,5 minuti a partita) in linea con quella durata.

Per questo la riesecuzione sulla base `lavoro/198` sotto lo stesso tetto **non è stata fatta**: avrebbe prodotto lo stesso «fermato al tetto» senza dire nulla sull'unione, e il tetto complessivo di circa due ore era già raggiunto. Conseguenze dichiarate:

- **non posso confermare** né che i due controlli siano verdi sulla finale, né che un eventuale rosso nasca dall'unione; gli interruttori `__CPM_NO_G293…G302` non sono stati provati perché nessun rosso è risultato nato dall'unione;
- i dati parziali raccolti sono tutti buoni (difesa-220: braccio verde 0 pressioni su 4 scene; gol-eroe-154: nelle 4 partite verdi registrato = pagella e rigore al 90′ passato al compagno), ma un dato parziale non è un verdetto.

Per chiuderli serve una corsa senza il tetto dei 30 minuti: circa 40 minuti per `difesa-220` e circa 65 per `gol-eroe-154`, uno alla volta.

## box-fischio-169

La caduta (`page.screenshot: Expected options.clip.width to be greater than 0`, `box-fischio-169.mjs` riga 89) è della sonda: scatta la foto con il rettangolo appena misurato prima di ricontrollare che il riquadro sia ancora montato, e se il riquadro è già sparito la larghezza è 0. Si è vista 1 volta su 2 sulla finale (braccio verde) e 1 volta su 1 sulla base (braccio rosso): **non nasce dall'unione**. Nulla è stato corretto.

## Verdetto

**R1 pronto: NO**, per le regole fisse di questa verifica («non giudicato» = rosso): 7 verdi, 1 instabile per una caduta della sonda presente anche sulla base, 2 non giudicati perché il tetto di 30 minuti è sotto la loro durata normale. **Nessun rosso è risultato nato dall'unione**; per i due non giudicati questo resta però non dimostrato finché non girano per intero.
