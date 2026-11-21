# Verifica 201 — i due rossi nuovi del treno della 201

**Domanda.** Nel treno della 201 (corsa 44947424529, `lavoro/201` = `86a7d74d`) sono rossi `buildup-sync` e
`momento-173`, che nel treno della 7.999.200 (corsa 44926206097, `de4ab612`) erano verdi. Sono regressioni
della 201?

**Banco.** Sessione cloud, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `npm install` in
`tests/visual`. La 200 e' un `git worktree` su `de4ab612`. Ogni guardiano lanciato col suo comando npm
(`npm run buildup-sync` = `node buildup-sync-test.mjs`, `npm run momento-173` = `node momento-173.mjs`),
3 volte per commit. Le corse sono andate a coppie in parallelo (una della 201 e una della 200 insieme, cosi'
il carico pesa uguale sui due bracci), salvo la prima di `buildup-sync` sulla 201, che e' andata da sola.
Nessun file in `docs/` e' stato rigenerato (`git status` pulito dopo le corse). `src/` e `GAME_VERSION`
non sono stati toccati.

**Cosa cambia fra i due commit nel gioco:** solo il giro 314 (`soloCasa314` in `buildStadium` src/11 e la
voce passata dalla serata in src/16, 10 righe in piu' e 4 in meno); il giro 312 tocca solo strumenti e workflow.
La voce `soloCasa314` la passa solo la serata di presentazione: la partita chiama `buildStadium` senza.

## Esiti

### `buildup-sync`

| Corsa | Commit | Uscita | Build-up osservati | Salto mediano (max) | Scene rosse |
|---|---|---|---|---|---|
| 1 | 201 `86a7d74d` | 2 (rosso) | 37 | 0,9u (44,5u) | gi24 gi79 gi91 gi92 (4) |
| 2 | 201 `86a7d74d` | 2 (rosso) | 37 | 1,0u (34,6u) | gi24 gi40 gi84 (3) |
| 3 | 201 `86a7d74d` | 2 (rosso) | 37 | 1,0u (50,4u) | gi24 gi40 gi79 gi84 (4) |
| 1 | 200 `de4ab612` | 2 (rosso) | 37 | 0,9u (52,0u) | gi24 gi40 gi79 gi83 gi84 gi92 (6) |
| 2 | 200 `de4ab612` | 2 (rosso) | 37 | 0,9u (33,9u) | gi24 gi40 gi84 gi92 gi96 (5) |
| 3 | 200 `de4ab612` | 2 (rosso) | 37 | 0,9u (34,6u) | gi40 gi83 gi84 gi91 (4) |

Quasi tutti i rossi sono dello stesso tipo: «salto del pallone di 23-52u in 40-100 ms al passaggio di beat
INGRESSO→carry». In una sola scena (gi24, 201 corsa 1) il rosso e' «in conduzione si muove solo la palla»
(rapporto 0,00).

### `momento-173`

| Corsa | 201 `86a7d74d` | 200 `de4ab612` |
|---|---|---|
| 1 | VERDE (20 verdi, 0 rossi) | VERDE (20/0) |
| 2 | VERDE (20/0) | VERDE (20/0) |
| 3 | VERDE (20/0) | VERDE (20/0) |

## Conclusioni

**`buildup-sync` — NON e' una regressione della 201.** Sul banco e' rosso 3 volte su 3 **anche sulla 200**
(`de4ab612`), con lo stesso tipo di difetto e le stesse scene (gi24, gi40, gi79, gi83, gi84, gi91, gi92
compaiono su tutti e due i commit), e la 200 ha in media piu' scene rosse della 201 (5,0 contro 3,7). Non
rientra in nessuna delle tre classi esattamente: e' un **rosso già presente sul banco su entrambi i commit**.
Quali scene escono rosse cambia da una corsa all'altra, quindi la misura e' instabile nel dettaglio ma rossa
nell'esito. Il verde del treno della 200 non si riproduce qui: va letto come una corsa fortunata del runner,
non come uno stato verde della 200. Visto che la 200 e' rossa anche lei, non ho fatto la prova col rosso
`__CPM_NO_G314` ne' quella sul commit `6fb97521`: non c'e' una differenza da attribuire a un vagone. Va
messo fra i rossi già noti (`ROSSI-DICHIARATI.json`) o riparato in un giro suo. Questa verifica non lo
corregge.

**`momento-173` — classe (c), rosso solo sul runner.** Verde 6 volte su 6 sul banco (3 sulla 201 e 3
sulla 200, sempre 20 verdi e 0 rossi), in ~100 s a corsa. Il rosso del treno della 201 non si riproduce sul
banco. Non posso confermare la causa del rosso sul runner, perche' non ho letto il log di quella corsa.
Il guardiano dipende dal tempo (sezione 4: un gol nel gioco veloce, circa 2 s col minuto fermo), quindi un
runner piu' lento e piu' conteso e' un'ipotesi plausibile, ma non l'ho verificata.

**Per il rilascio della 201:** nessuno dei due rossi viene dai vagoni 312/314, secondo queste misure del banco.
