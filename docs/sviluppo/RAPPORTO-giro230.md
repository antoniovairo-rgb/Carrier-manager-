# Rapporto giro 230 — PO-490 (seguito del giro 224): anteprima della prossima partita, solo bilancio V/N/P

Ramo `sviluppo/giro230-anteprima-bilancio`, partito da `lavoro/196` (commit 844ac1c, contiene il giro 224). `GAME_VERSION` non toccata
(resta 7.999.195 nel codice).

## Il problema (dubbio 3 del giro 224)

Nella rassegna di fine partita, scheda 4, «Prossima partita», la riga «Forma» dell'avversario (`data-cpm="anteprima224-forma"`) mostrava
cinque caselle prese da `_tvTeamStat` (`src/15-live-match.jsx`, ~11225): per una squadra che non è la tua, il gioco **non salva** la
sequenza dei risultati, quindi le cinque caselle erano il bilancio V/N/P della classifica **rimescolato con un seme** (club + stagione),
non le ultime cinque vere. Misurato nel braccio rosso di questo giro: avversario FC Friburgo, bilancio 3V 2N 5P, striscia «P N V P P».

## Decisione PO applicata (16/11 15:00, «Solo bilancio V/N/P»)

- `src/15-live-match.jsx`: nuova `_g230x()` accanto a `_g224x()`; la riga `anteprima224-forma` si disegna solo se `_g230x()` è falso,
  cioè **solo nel rosso** `window.__CPM_NO_G230`. Nient'altro cambia.
- Il **bilancio vero** era già nell'anteprima, nella riga `anteprima224-pos`: «Classifica 12° · 11 pt · 3V 2N 5P». Non l'ho spostato né
  ridisegnato.
- La **forma della TUA squadra** nell'anteprima non c'era (l'anteprima mostra solo l'avversario): non c'era niente da tenere.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** (7.570.498 byte, 21 frammenti).

**Fuori ambito, non toccata:** la grafica TV pre-partita (`src/15` ~11223 `_tvTeamStat` e la sua resa «Forma · ultime 5» ~12015). Lì,
per l'avversario, vale lo stesso difetto: le cinque caselle sono il bilancio rimescolato, non le ultime cinque (vedi Dubbi).

## Guardiani

- **Nuovo `anteprima-230`** (`tests/visual/anteprima-230.mjs`, script npm `anteprima-230`): partita da professionista dal prompt vero
  (lib partita-166, soli highlight, pilota 7304), classifica a 18 dal banco, scheda 4 a 375×667. Verde: nessuna `anteprima224-forma` e
  il testo di `anteprima224-pos` **contiene** posizione · punti · V/N/P dell'avversario calcolati dalla classifica salvata (stesso
  ordinamento punti → differenza reti → gol fatti). Rosso `__CPM_NO_G230`: torna la striscia → deve essere bocciato. «Non giudicato»
  (partita non finita, scheda o bilancio non trovati, avversario non in classifica) = rosso.
- **`rassegna-224` aggiornato**: nella condizione della scheda 4 `d.forma` è diventato `!d.forma` (prima pretendeva la striscia).
- `ci-runner.mjs`: `anteprima-230` una sola volta in `completa`, `carriera`, nelle due mappe di `src/15-` e in `LENTI`; controllato con
  `node --check` e con uno scorrimento delle liste (nessun doppione).

## Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima)

| Controllo | Esito |
|---|---|
| anteprima-230 | **verde 3/3 · rosso bocciato** — verde: «Classifica 12° · 11 pt · 3V 2N 5P» = atteso «12° · 11 pt · 3V 2N 5P», striscia assente; rosso: stesso bilancio, striscia PRESENTE «P N V P P» |
| rassegna-224 | **verde 10/10 · rosso `__CPM_NO_G224` bocciato** (scheda 4 a 375×667: 1,15 schermi, piena 1,12 — era 1,16 nel rapporto 224, una riga in meno) |
| rassegna-202 | **verde 9/9 · rosso bocciato** |
| rassegna-200 | **verde 14/14 · rosso bocciato** |
| test:logic | **51/51** |
| save-compat | **12 pass · 0 fail** |

Le foto rigenerate da rassegna-200/202/224 in `docs/sviluppo/giro200|202|224/` sono state rimesse con `git checkout --` e non committate.

## Incidente di sessione (dichiarato)

Controllando la sintassi di `ci-runner.mjs` l'ho anche **importato** con `node -e "import(...)"`: l'import lo esegue e ha avviato una
catena. L'ho fermata dopo meno di due minuti; nessun processo superstite (verificato con `ps`), nessun file modificato oltre ai miei
(`git status`), `docs/governo/STABILITA.json` intatto. Va considerata nulla.

## Dubbi per il PO

1. **Grafica TV pre-partita** (fuori ambito): la riga «Forma · ultime 5» dell'avversario ha lo stesso difetto (bilancio rimescolato,
   non sequenza vera). Per la tua squadra invece usa le tue ultime cinque di campionato vere da `matchHistory`. Da decidere se applicare
   anche lì «solo bilancio V/N/P» per l'avversario.
2. Il bilancio resta nella riga «Classifica» insieme a posizione e punti («12° · 11 pt · 3V 2N 5P»); non l'ho reso più evidente perché
   era già presente e leggibile. Se lo vuoi in una riga sua («Bilancio 3V 2N 5P»), è un ritocco a parte.
3. La riga di classifica compare solo se l'avversario ha già giocato (gare > 0) ed è nella classifica del tuo campionato: in coppa,
   nazionale o alla prima giornata l'anteprima mostra solo «In casa/In trasferta contro …». Comportamento del giro 224, invariato.
4. Roadmap non aggiornata: questo è un giro su ramo senza cambio di versione; la riga va scritta al rilascio che lo includerà.
