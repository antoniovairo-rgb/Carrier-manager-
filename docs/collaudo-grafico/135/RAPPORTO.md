# Giro 135 — perché `distanze-126` è uscito «13/24 partite finite» sulla 7.999.187

Ramo `collaudo/giro135-distanze` (da `lavoro/187`, build 7.999.187 `c27e506`). Braccio 186 = `origin/main` (7.999.186) in un worktree a parte. `CPM_CHROME=/opt/pw-browsers/chromium`, un controllo alla volta, `free`/`df` scritti in testa a ogni log (memoria libera 13,3-15,5 GB su 16, disco 28-29 GB liberi in tutte le misure). Nessun file in `src/` toccato, `GAME_VERSION` invariato.

## 1. Come decideva la sonda

`tests/visual/distanze-126.mjs` (prima di questo giro): dopo l'avvio dell'autoplay cicla ogni 100 ms finché `__CPM_PHASE()` vale `ended`/`ceremony` **oppure** finché `Date.now()-t0 < TMAX`, con `TMAX = 420000` ms **di parete fissi** (`CPM_TMAX`). Gioca 24 partite (3 salvataggi × 8 semi) con **3 pagine in parallelo** (`CPM_PAR=3`). Una partita tagliata dal tetto conta come non finita; sotto 2/3 finite il verdetto è NON GIUDICATO = ROSSO.

## 2. Misure (sonda nuova `tests/visual/distanze-126-tempi.mjs`: stessa apertura del guardiano, senza tetto, fps contati con `requestAnimationFrame`)

**Una pagina sola (salvataggio s1, semi 1 e 2)** — log `tempi-isolati.log`:

| braccio | s per partita | fps medi |
|---|---|---|
| 187 | 116,2 · 130,8 | 9,19 · 10,91 |
| 187 `__CPM_NO_FOLLA129` | 116,3 · 127,9 | 9,87 · 11,72 |
| 187 densità `oggi` | 115,1 · 129,7 | 9,46 · 11,53 |
| 186 | 116,0 · 128,4 | 9,99 · 11,89 |

Da sola la folla costa ~0,7-1 fps (−7/−8%) e **nessun secondo** di partita: tutte lontanissime dai 420 s.

**Tre pagine insieme, come nel guardiano (s1 + s5 + s12, semi 1 e 2)** — log `p187a/b`, `p187nf/nfb`, `p187og/ogb`, `p186a/b`:

| braccio | s5: s per partita | s12: s per partita | `hl_result`: s (fps) su s5/s12 |
|---|---|---|---|
| 187 | 319,3 · 335,8 | 319,2 · 342,4 | 210-231 s (2,8-3,5 fps) |
| 187 `__CPM_NO_FOLLA129` | 186,8 · 192,1 | 195,1 · 203,3 | 82-97 s (7,0-8,0 fps) |
| 187 densità `oggi` | 226,8 · 235,0 | 229,6 · 242,8 | 123-137 s (4,7-6,0 fps) |
| 186 | 183,7 · 190,6 | 197,7 · 205,3 | 81-97 s (7,0-7,8 fps) |

s1 (stadio della Primavera) resta 146-196 s in tutti i bracci. La fase `playing` dura ~80-89 s in **tutti** i bracci (gira sul metronomo a tempo reale); tutta la differenza sta in `hl_result`, che aspetta 6 s **di scena** (`__CPM_PARETE103=150000` concesso dalla sonda) e quindi si allunga quando gli fps calano.

## 3. Conclusione

1. **È la folla a rallentare, ma solo sotto carico.** Con tre pagine sulla stessa CPU la folla a sagome (`vera`) porta la scena dell'highlight da ~7,5 a ~3 fps negli stadi grandi (s5/s12) e la partita da ~190-205 s a ~320-342 s (**+130-140 s, ~+70%**). `__CPM_NO_FOLLA129` riporta i numeri a quelli della 186; `oggi` sta a metà (~230-243 s). Da sola, una pagina perde solo il 7-8% di fps.
2. **Il rosso però è dello strumento.** Il tetto fisso di 420 s di parete misura il cronometro della sonda, non la partita: a 320-342 s per partita misurati e con le code della corsa piena (fino a 3570 s complessivi) metà delle partite superava il tetto e veniva dichiarata «non finita», benché nessuna fosse bloccata.
3. **Sul gioco (non corretto qui, proposta per il PO):** sotto carico la folla `vera` toglie più di metà degli fps alla scena negli stadi grandi. Su un telefono lento il rischio è lo stesso: highlight che durano di più in tempo reale. La manopola `cpm-folla=oggi` esiste già; se ne valuta la resa sul dispositivo, oppure si riduce il costo della folla per fotogramma. Decisione del PO.

## 4. Riparazione della sonda (applicata)

`distanze-126.mjs`: la partita si attende fino all'**evento di fine** (`ended`/`ceremony`). Si abbandona solo per **stallo** (fase, minuto `__CPM_CLOCK` e scena corrente fermi per `CPM_STALLO`, def. 240 s, più dei 150 s della guardia di scena) o a un tetto di sicurezza `CPM_TMAX` di 1500 s. Ogni riga per-partita stampa ora come si è chiusa (`fine`/`stallo`/`tetto`/`pagina`) e quanti secondi è durata. Campione minimo (40/8/6, 2/3 finite) e soglie (30/22/16,5 m) **invariati**.

## 5. `distanze-126` completo sulla 187 con la sonda riparata

Prima corsa interrotta dal riavvio del contenitore dopo 9 partite (9 su 9 chiuse con `fine`, 169-345 s; log `distanze-126-corsa1-interrotta.log`): **non vale**, rifatta da capo.

Seconda corsa, da capo sul build `653eb88` (= 7.999.187 + sonda riparata), log `distanze-126-187-completa.log`: **uscita 0 in 3422 s · partite finite 24/24, tutte chiuse con `fine` (nessuno stallo, nessun tetto) · VERDE**. Durata per partita 162-513 s; **6 partite su 24 sono durate più di 420 s** (s5 semi 3/4/5/6, s12 semi 1/2: 426-513 s) — con il tetto di prima sarebbero state dichiarate «non finite». Campione: tiri 59 (max 29 m, 0 oltre 30) · dal limite 17 (max 20,9 m, 0 oltre 22) · teste 11 (max 14 m, 0 oltre 16,5), tutti sopra il minimo 40/8/6.
