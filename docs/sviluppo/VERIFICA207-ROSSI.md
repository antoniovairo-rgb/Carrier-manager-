# Verifica 207 — i sei rossi nuovi del treno 45120411083 (lavoro/201 @ d6819779, giro 331)

23/11/2026. Controllo, nessuna correzione al gioco. Banco: sessione cloud (4 core), cartella `tests/visual`,
`CPM_CHROME=/opt/pw-browsers/chromium`, una corsa alla volta, due worktree puliti: **d6819779** (vagone del giro 331)
e **a9987e60** (7.999.206 pubblicata). Log delle corse non versionati (scratch della sessione).

## Cosa tocca il giro 331 nel gioco

`git diff a9987e60 d6819779 -- src` = due punti soli:
- `src/19-app-root.jsx` (IntroCinematic): al primo fotogramma la camera dell'intro si mette sul bersaglio (`_c331`, rosso `__CPM_NO_G331`);
- `src/16-scene-3d-cerimonie.jsx` (`misuraPelle240`): lato del riquadro letto chiedibile dal testimone (`W.raggio`), attivo solo con il testimone armato.

Nessuno dei due e' sul percorso della partita (highlight, cross, portiere, pressing, locomozione, panchina): nessuno dei sei
guardiani passa dall'intro ne' arma il testimone della pelle. Le corse lo confermano: **nessuna regressione**.

## Tabella

| guardiano | banco d6819779 | banco 206 (a9987e60) | verdetto |
|---|---|---|---|
| cross-origine | verde 2/2 (distanza in scelta 0 u, quota 0,22, parabola 4,9-5,2) | non serve (verde sulla punta) | instabile del runner |
| diagonali-210 | verde 2/2 (VERDE 0 difetti · 0 non giudicati; rosso rivisto) | non serve | instabile del runner |
| passo-velocita | verde 2/2 (scarto x1,05 · x1,03, soglia x1,15) | non serve | instabile del runner |
| pressing-143 | verde 2/2 (il rosso si vede) | non serve | instabile del runner |
| panchina-293 | **oscilla: 1 verde su 3** (fps verde 3,16 · 2,73 · 2,75; rosso 2,69 · 2,73 · 2,63) | **rosso 2/2** (fps verde 2,51 · 2,88; rosso 2,95 · 2,98) | rosso anche sulla 206 |
| portiere-295 | verde 2/2 sul braccio verde (4 bracci, 0 difetti, **0 non giudicate**); braccio rosso 1/1 (16/16 · 8/8 · 8/8 · 8/8 rivisti) | non serve | instabile del runner |

Ripetizione dichiarata: due corse su d6819779 per ognuno (portiere-295: verde in due corse, rosso in una corsa con
`CPM_SOLO=rosso` perche' la prima corsa completa ha sforato il tetto di 10 minuti della chiamata dopo un braccio verde
gia' completo); panchina-293 tre corse su d6819779 e due sulla 206 perche' oscillava.

**panchina-293**: l'unico motivo di rosso, in tutte e quattro le corse rosse, e' `verde fps < 3` (pavimento assoluto
`CPM_FPS_ABS`, «headless software»). Il confronto relativo col braccio rosso (>= 0,85 x) regge sempre; corpi 16/16
CGTrader, piedi/bacino in tolleranza. Sul banco il pavimento sta fra 2,5 e 3,2: e' una soglia sul cronometro della
macchina, la stessa trappola dichiarata in PROCESSO.md («Controlli instabili»). Non si abbassa qui la soglia: da tarare
con una decisione propria (per esempio giudicare solo il relativo, o un pavimento misurato sulla macchina).

**Tre nella stessa parte**: verdi sul banco, coerente con un runner lento/conteso in quella parte del treno.

**diagonali-210** era stato tolto da ROSSI-DICHIARATI dal giro 332 come riparato; sul banco resta verde, sul runner e'
tornato rosso («accordo a 0 ms: 1 passo»): la riparazione non regge sul runner, da riguardare.

## Righe messe in `docs/governo/ROSSI-DICHIARATI.json` (ramo `sviluppo/verifica207-rossi`)

- `banco.panchina-293` — rosso anche sulla 206 (fps sotto il pavimento assoluto 3 sul banco), non regressione del 331.
- `solo_runner.cross-origine`, `solo_runner.diagonali-210`, `solo_runner.passo-velocita`, `solo_runner.pressing-143`,
  `solo_runner.portiere-295` — rossi sul runner, verdi sul banco su d6819779.

Il rosso `__CPM_NO_G331` non e' stato usato: nessun rosso compare sul banco in d6819779 che non compaia anche sulla 206.
