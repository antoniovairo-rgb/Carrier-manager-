# Giro 3 · Lettura dei rapporti delle altre sessioni (punto 4)

Sola lettura: nessun file del gioco modificato. Ogni voce indica il ramo da cui viene il rapporto, la **build** che il rapporto dichiara, e il file. Le build NON sono tutte la 7.999.158: il confronto è dichiarato voce per voce.

Base di confronto: `origin/main` = **7.999.158** (`GAME_VERSION="7.999.158"`, `CARRIER-MANAGER-AV.html`, commit `1a819fb6`). Verifica: `git show origin/main:CARRIER-MANAGER-AV.html | grep -o 'GAME_VERSION="[0-9.]*"'` (da CLAUDE.md: il valore si legge col grep).

## A. Collaudo partite vere — ramo `origin/collaudo/partite-vere`

| Rapporto | Build dichiarata | Esito dichiarato | File |
|---|---|---|---|
| PO-221 su 158, 60 partite | **7.999.158** (verificata nel rapporto) | 60/60 al fischio · scene media **6,68**, mediana 7 (obiettivo 5–7: dentro) · **gol 0,50** (obiettivo 0,6–0,9: **sotto**) · assist 0,25 · punizioni >1 a partita: 0 su 60 | `docs/collaudi-partite/PO221-158-60partite.md` |
| PO-221 su 157, 60 partite | 7.999.157 | scene media 8,53 (fuori obiettivo) · gol 0,62 · assist 0,27 | `docs/collaudi-partite/PO221-60partite.md` |
| PO-220 difesa, GLB acceso | 7.999.157 | 22 partite, 22 scene difensive · distanza eroe–portatore al gesto: mediana ≈ 6,7 u, **7/22** entro 4 u · 7/22 senza clip GLB · dichiarato «Non posso confermare» la causa dell'unica scena difensiva per partita | `docs/collaudi-partite/PO220-difesa.md` |

Lettura: sulla 158 le scene sono nel range PO; il **gol dell'eroe è sotto il range** (0,50 contro 0,6–0,9). Nota: la roadmap di governo su `main` (`docs/governo/ROADMAP.md`, riga della 7.999.158, 11/10) dichiara gol 0,62 su 16 partite e scene 6,94: sono **due misure diverse** su campioni diversi (16 contro 60 partite), e il rapporto a 60 partite non le commenta. Il rapporto PO-220 (157) risponde alla domanda del PO («l'eroe arriva sul portatore e fa un gesto vero?») con: nel gesto la distanza mediana è ≈ 6,7 u e solo 7 scene su 22 hanno il gesto entro 4 u; la causa del resto non è misurata nel rapporto.

## B. Sessione collaudatrice — ramo `origin/collaudo/sessione-collaudatrice`

| Rapporto | Build dichiarata | Esito dichiarato | File |
|---|---|---|---|
| PO-224 · finestre della home (spogliatoio, patto) | **7.999.158** | 92 settimane × 3 formati (360/375/412 px): finestra «Lo spogliatoio» chiusa col **puntatore** 0/3 in tutti e tre i formati, col **clic JS** 3/3 · in 90/92 settimane un altro overlay fisso (dialogo del procuratore «IL CONFRONTO», `data-cpm="confronto23"`) copre la finestra · patto e verdetto **non osservati** in due stagioni | `docs/collaudi/PO224-finestre.md` |
| PO-225 · grafica TV pre-partita | **7.999.158** | opacità a 0 s/2 s/4 s/4,5 s/4,9 s/6 s: verde 1 → 0,623 → 0 · rosso (`__CPM_NO_TV225=1`) resta 1 · **GLB: flag armato, caricamento CH38 non verificato** | `docs/collaudi/PO225-ingresso.md` |
| Riepilogo collaudo giro 2 (zone S e T, Q sospesa) | **zona S 729fc8e · zona T 2adc96a** (commit dichiarati nel riepilogo; la versione di gioco non è dichiarata nel riepilogo) | zona S «festa» NON chiusa (seme perde 1–3; festa raggiunta con GLB acceso in 6 fotogrammi) · zona T PO-220 NON chiusa (distanza eroe–portatore mediana 4,25 u; nessun `press` su 10 scene) · zona T PO-221 NON chiusa (12 partite × 2 run: scene mediana 9,0, gol 1,00) · **non ripetibilità: stesso seme, scene identiche in 0 su 12 casi** (scarto medio 2,4, «causa non verificata») | `docs/collaudi/RIEPILOGO-giro2.md` |

Lettura: il verdetto di governo su PO-224 è **PARZIALE** (messaggio del commit `1a819fb6` su `origin/main`: «Verdetti PO-221 FATTO, PO-224 PARZIALE, PO-225 FATTO (7.999.158)»; il dettaglio della finestra è in `docs/governo/governo.html`, non riletto in questo giro). Il dato di 0/3 col puntatore è la prova concreta del motivo. PO-225 è verificato sull'opacità per istante d'animazione, non sul fotogramma reale (il rapporto lo dichiara).

## C. Sviluppo — ramo `origin/sviluppo/haiku-l7-pulizia-l8`

| Rapporto | Build dichiarata | Esito dichiarato | File |
|---|---|---|---|
| PO-066 · home (giro 4) | **7.999.156** (badge test «KE 7.999.156») | testo sotto 10 px 0 · overflow orizzontale 0 · voci barra che sbordano 0 · **nome squadra troncato «…» nella card «Prossima partita» a 360 px** (difetto minore, non corretto) · banner rosso «Avvia Stagione» / «Vivi la Settimana»: decisione di gusto, non confermata dal backlog | `docs/sviluppo/RAPPORTO-giro4.md` |
| PO-224 · censimento riquadri home | **7.999.156** | impulsi NON come riquadro in home (solo nella finestra); U18 non chiude la stagione col solo passo (sonda ferma alla settimana 39, pulsante reale non verificato) | `docs/sviluppo/PO224-censimento-home.md` |
| Ingresso in campo (card «Primavera 2» sul terzo inferiore) | 7.999.156 | **non misurato** (richiede GLB-ON) | `docs/sviluppo/RAPPORTO-giro4.md` |

## D. Rami più vecchi (letti solo per la traccia; build non attuali)

- `origin/codex/2026-10-*` contengono soprattutto immagini `docs/collaudo-grafico/`. Non sono usati per gli esiti di questo rapporto.
- `origin/rilascio/consolidamento` è il ramo di questa sessione.

## E. Cosa non posso confermare da questa lettura

- Nessun rapporto dichiara la build **7.999.158 + GLB acceso + 5 partite** sul problema del contesto grafico: la voce corrispondente è nel punto 2 di questo giro.
- Il dato «gol 0,50» (158) e «gol 0,62» (roadmap) non si conciliano senza rileggere i due set di dati: **non posso confermare** quale sia rappresentativo.
- Gli esiti di PO-224 col clic JS (3/3) dimostrano che l'handler funziona, non che l'utente lo possa raggiungere: lo dice il rapporto stesso.
