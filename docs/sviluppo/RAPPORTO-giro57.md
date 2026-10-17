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

**Due scelte nella stessa gara — decisione PO 17/10 «La prima finisce alla seconda» (applicata).** La finestra di una scelta va dal suo
minuto al minuto della scelta successiva; l'ultima fino al fischio. Il fotogramma di chiusura è quello che la scelta successiva registra
**prima** di toccare il motore (`r259.foto`), quindi le finestre sono contigue e disgiunte. `INT259.finestre(L, fFischio, mFischio)` (src/14)
calcola per ogni scelta `{m1, dopo, occ, fino}`; l'occasione dell'eroe conta solo se cade dentro la finestra. La breve dice
«fino al N'» (minuto della scelta successiva) oppure «fino al fischio». Interruttore rosso `window.__CPM_NO_FIN280` (= prima stesura del
giro: tutte al fischio).

Misura (banco A, stesse 96 partite): **17 partite con due scelte** · gol contati da due scelte **rosso 8 → verde 0** · smentite verde 0/85.
Esempio: 69' «3 gol fatti e un gol subito fino al fischio» + 82' «ha pagato: gol fino al fischio» (lo stesso gol detto due volte) →
69' «2 gol fatti e un gol subito fino al 82'» + 82' «ha pagato: gol fino al fischio».
Nota: con le finestre più corte la riga a +5' del rosso NO_ESITO280 risulta smentita 60/85 (prima 64/85): stesso banco, finestre diverse.

## 2. Ordine delle squadre nel «Tabellino della gara» — decisione PO 17/10 «Tabellino come intestazione» (applicata)

Prima: il tabellino mostrava sempre **la tua squadra — avversari** (`latiTabellino10`, valori già attribuiti giusti), mentre l'intestazione
mostra **casa – ospite**: in trasferta l'ordine era opposto. Ora `ordineTabellino280(T, isMatchHome)` (src/15) sceglie solo dove mostrare
i due lati già corretti: casa a sinistra, ospite a destra; in trasferta la colonna dell'eroe è la destra. La squadra dell'eroe è evidenziata
(nome in `TH.primary`, barra di confronto del colore dell'eroe che segue la sua colonna); `data-cpm="tab280"` porta `data-eroe="sx|dx"`.
Interruttore rosso `window.__CPM_NO_ORD280` (eroe sempre a sinistra, = 7.999.171).

Guardiano `tabellino-lati` esteso (parte C): eroe 3-0 nel motore → in casa sx 3 / dx 0, eroe sx; in trasferta sx 0 / dx 3, eroe dx, con
gol, tiri e possesso ognuno sotto la sua squadra. Verde ✅; `CPM_ROSSO_ORD=1` rosso riconosciuto (in trasferta l'eroe torna a sinistra);
`CPM_ROSSO=1` (NO_TAB10) ancora riconosciuto. Nel browser `esito-280` (B, verde) legge il DOM del tabellino e controlla che i gol sotto la
colonna dichiarata dell'eroe siano quelli dell'eroe.

## 3. Guardiano

`tests/visual/esito-280.mjs`, `npm run esito-280`, nella MAPPA di `ci-runner.mjs` sotto `src/14-` e `src/15-` e fra i passi `LENTI`
(~5'30": la parte A dura ~10 s, la B gioca 4 partite). Verde: 0 smentite, ≥30 partite con scelta nel finale, DOM dal fischio. Rosso
riconosciuto: smentite > 0 e DOM con la riga a +5'.

## Verifiche eseguite
- `node tools/check-src.mjs`: identico byte per byte.
- `npm run esito-280`: ✅ (A + B, verde e rosso).
- `npm run test:logic`: 43/43. `schede-259` parte node: ✅. `tabellino-lati` verde ✅, rosso riconosciuto.
- Seconda parte del giro (decisioni PO 17/10): `npm run esito-280` ✅ — A: 0/85 smentite, 17 partite con due scelte, gol contati da due
  scelte verde 0 / rosso `__CPM_NO_FIN280` 8; B: 2/2 riepiloghi dal fischio con finestre «fino al 70'», tabellino nel DOM 2/2 coi gol
  sotto la squadra giusta (partite in trasferta, eroe a destra), rosso 2/2. `tabellino-lati` verde ✅, `CPM_ROSSO_ORD=1` e `CPM_ROSSO=1`
  rossi riconosciuti. `test:logic` 43/43, `schede-259` ✅, `design-system` ✅, `check-src` identico. `tabellino-lati` aggiunto alla MAPPA
  di `ci-runner.mjs` sotto `src/15-`.
- **Non eseguiti** in questo giro: gate 14/14 e catena `mirata`/`notte` (da fare nella sessione di rilascio).
