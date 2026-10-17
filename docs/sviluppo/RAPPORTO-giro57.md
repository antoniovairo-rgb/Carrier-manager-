# Rapporto giro 57 — PO-280 «Esito non vero, hanno pareggiato!»

Ramo `sviluppo/esito-scelta-280-giro57` da `lavoro/172-base` (7.999.171). Nessun bump di `GAME_VERSION` sul ramo (lo fa l'unione di rilascio).

## 1. L'esito della scelta nel riepilogo

**Dove nasce.** La riga «🧠 La tua scelta al N': «…» → …» è il riquadro `data-cpm="riep259"` della schermata di fine gara
(`src/15-live-match.jsx`, vicino a `Sez210 id="post-tabellino"`). Mostrava `r.breve`, cioè la riga breve del **racconto detto 5' dopo la
scelta** (`INT259.racconta`, chiamato nel tick con `nx>=_R.m0+INT259.ATTESA`, `ATTESA=5`). Vera per la finestra 82'→87', mai
ricalcolata al fischio: il pareggio arrivato dopo l'87' la smentiva. «nessun tiro concesso» viene da `INT259.racconta`, ramo
`o.tipo==='palla'&&tL<=1` (`src/14-motore-possesso.jsx`).

**Misura prima della correzione** (banco del motore vero, `npm run esito-280`, parte A: 24 configurazioni S12 × 4 semi = 96 partite,
68 con scelta, **57 con scelta nel finale ≥70'**, 85 scelte):

| | riga smentita dai fatti scelta→fischio |
|---|---|
| prima (riga a +5', rosso `__CPM_NO_ESITO280`) | **64/85** (nel finale **40/59**) |
| dopo (`INT259.finale`) | **0/85** (nel finale 0/59) |

Classi delle 64 smentite: numero dichiarato diverso dalla finestra intera 34 · gol fatti o subiti dopo, non detti 26 · «ha pagato» con un
gol subito dopo 4. Esempio del banco identico al caso del PO: 82' «Teniamo palla nella loro metà», a +5' «un solo tiro concesso», al
fischio 2 tiri concessi.

Nel browser (parte B, partite vere di carriera con autoplay, 2 per braccio): rosso p0 finita 0-2 con riepilogo «un solo tiro concesso» /
«concessi 2 tiri» (il caso del PO); verde stessa partita «ci hanno puniti: gol subito fino al fischio». Verde 2/2 righe calcolate al
fischio, rosso 2/2 con la riga a +5'.

**Correzione.** `INT259.finale(r)` (src/14): lo stesso `racconta` (stessa regola, nessun sorteggio) sulla finestra **minuto della scelta →
fischio** (fotogramma `INT259.foto` col punteggio finale, minuto `max(90, clock)`); se nella finestra hanno segnato entrambe, la riga li
dice tutti e due; la breve porta «fino al fischio» e perde il «in N'» che valeva per i 5'. Il riepilogo usa `INT259.finale`. Testimone
`window.__CPM_ESITO280`. **Non cambia** il comportamento approvato delle interazioni col mister: la riga di cronaca e la voce del mister
a +5' restano identiche (racconti a +5' incoerenti coi loro 5': 0), cambia solo il testo dell'esito nel riepilogo.

Interruttore rosso: `window.__CPM_NO_ESITO280` (= 7.999.171). `INT259.smentito(r, esito)` è il giudice del guardiano.

**Scelta da confermare col PO:** la finestra va al fischio per tutte le scelte, come chiesto. Con due scelte nella stessa gara le due
finestre si sovrappongono (in p1 entrambe dicono «ha pagato: gol fino al fischio» per lo stesso gol). Alternativa possibile: chiudere la
finestra della prima scelta al minuto della seconda. Non applicata.

## 2. Ordine delle squadre nel «Tabellino della gara»

Non è un difetto di attribuzione. L'intestazione mostra **casa – ospite** (`homeTeamObj`, punteggio `isMatchHome?score.home:score.away`);
il tabellino mostra **la tua squadra — avversari** (`latiTabellino10`: nel motore «home» è sempre la squadra dell'eroe, correzione
7.999.10). Nella foto l'eroe è il FC Merseyside in trasferta: tabellino «FC Merseyside — FC Haringey», coerente.
Misura: `tabellino-lati` verde (squadra dell'eroe 3-0 nel motore → 3-0 in casa e 3-0 in trasferta) e rosso `CPM_ROSSO=1` riconosciuto
(in trasferta 0-3). Nessuna modifica. Resta una scelta di presentazione per il PO (stesso ordine dell'intestazione o «tua squadra»
sempre a sinistra), non una correzione.

## 3. Guardiano

`tests/visual/esito-280.mjs`, `npm run esito-280`, nella MAPPA di `ci-runner.mjs` sotto `src/14-` e `src/15-` e fra i passi `LENTI`
(~5'30": la parte A dura ~10 s, la B gioca 4 partite). Verde: 0 smentite, ≥30 partite con scelta nel finale, DOM dal fischio. Rosso
riconosciuto: smentite > 0 e DOM con la riga a +5'.

## Verifiche eseguite
- `node tools/check-src.mjs`: identico byte per byte.
- `npm run esito-280`: ✅ (A + B, verde e rosso).
- `npm run test:logic`: 43/43. `schede-259` parte node: ✅. `tabellino-lati` verde ✅, rosso riconosciuto.
- **Non eseguiti** in questo giro: gate 14/14 e catena `mirata`/`notte` (da fare nella sessione di rilascio).
