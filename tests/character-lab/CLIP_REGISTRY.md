# Registro delle clip — corpi CGTrader dell'eroe

Aperto il 26/09 su mandato PO («colmare i gap dei gesti»). Una riga per clip. Una clip entra nel gioco solo con: retarget (`tools/retarget_cgtrader_clip.py`), cancello anatomico, provino (`tests/visual/provino-clip.html`), riga in `BRAIN_GESTI`/`GESTI`, guardiano e flag rosso `__CPM_NO_*`.

**Licenze — stato:** da verificare prima del primo lotto. Pacchetto CGTrader (corpi + 33 clip) e pacchetto Mixamo (54 clip, dalla cartella Drive del PO, 23/09): per l'uso in un'app pubblicata sul Play Store **non posso confermarlo** finché non trascrivo qui i termini con link. Nessuna clip nuova entra prima di quella verifica.

## Inventario (letto dai file GLB, 26/09)

| File | Clip | In uso oggi | Mai usate |
|---|---|---|---|
| `assets/cgtrader-review-lod{0,1,2}-kit-adapter.glb` | 33 ciascuno | 24 (idle, jog, jog-back, strafe ×2, kick, penalty, header, slide-tackle, tackle, volley, receive, dribble, pass, change-direction, missed-chance, throwin, gk ×7, look-over-shoulder solo in mappa, sit-clap in panchina) | walk, running, jogging, recovery-run, run-look-back, running-to-turn, opening, sit-to-stand |
| `assets/cgtrader-clip-mixamo.glb` (3,0 MB) | 54 | 18 + `kick~m` specchiata (cadute ×3, rovesciata, tackle ×3, portiere ×10) | header-soccerball ×2, kick-soccerball ×2 (solo tabella contatti), kick-up-soccerball, kneeing-soccerball ×2, stall-soccerball ×4, receive-soccerball, strike-foward-jog, soccer-penalty-kick, throw-in, offensive-idle, transition, jog (7 direzioni), goalkeeper-directing ×2, placing-ball ×2, scoop, sidestep ×2, miss |
| — | `celebrate` | **chiamata dal codice ma assente in tutti i pacchetti** → esultanza senza clip sul corpo CGTrader | — |

## Clip in lavorazione

| Nome interno | Voce catalogo | Fonte | Licenza | Strada | Cancello | Provino | Peso | Righe BRAIN_GESTI/GESTI | Guardiano / rosso |
|---|---|---|---|---|---|---|---|---|---|
| (lotto P1-a da aprire) | I1, A1, A5, B2, G1, A7/I3, L4 | pacchetti già nel progetto | da verificare | esistente / specchiata | — | — | — | — | — |
