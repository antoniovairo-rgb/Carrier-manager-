# Rapporto giro 143 — partita 2D: lo stadio gira al secondo tempo come nel 3D (PO-345)

Ramo `sviluppo/giro143-curve2d` da `sviluppo/giro141-partita2d`. `GAME_VERSION` non toccata, nessun campo nuovo nel salvataggio.

## Decisione PO (PO-345, 10/11)
«Sì, come nel 3D»: al secondo tempo le curve, i cartelloni per settore e lo spicchio ospiti (anche il lampo del gol, `_ospRect297`) si
scambiano. Primavera quasi vuota: confermata, non toccata.

## Misura prima (guardiano `partita2d-141` esteso, braccio `__CPM_NO_G143` = codice del giro 141)
Il riferimento del secondo tempo si calcola **dentro il test**: il settore atteso di un punto è quello del punto simmetrico rispetto al
centro dell'erba esterna, cioè lo stadio ruotato di 180 gradi come fa il 3D (7.732). Il test non usa la logica del gioco.
- Cartelloni col colore del padrone atteso nel secondo tempo: **13/23 e 27/52 al telefono, 14/23 e 27/52 al PC** (52–61%), contro
  23/23 e 52/52 nel primo tempo.
- Settore ospiti (quello del lampo del gol) nella partita vera: **in basso sia al 1T sia al 52'**.

## Correzione (`src/15-live-match.jsx`)
- Il frame della partita 2D è centrato sull'eroe (la squadra dell'eroe attacca sempre verso l'alto o verso destra), come nel 3D.
  Per questo il cambio campo appare come lo stadio che **ruota di 180 gradi** attorno al centro dell'erba esterna: `_settore141` riceve
  `rov`, legge il settore del punto simmetrico e scambia così le curve, la Tribuna Est con la Ovest e lo spicchio ospiti.
  `_spalti141` misura profondità e blocchi nello stadio ruotato, `_ospRect297` restituisce la curva ospiti dietro l'altra porta, e
  i cartelloni, il lampo del gol e il testimone `__CPM_W297` usano tutti la stessa mappa.
- **Una sola fonte del tempo**: in LiveMatch `const _tempo143=clock>=45?2:1` alimenta sia `half` del 3D sia la nuova prop `tempo` del
  Campo2D. Prima la prop `half` era calcolata con la stessa espressione scritta in linea.
- Il ridisegno avviene **una volta al cambio di tempo**: `M.rov143` confrontato nel giro di disegno annulla la tela di servizio solo
  quando il tempo cambia. Il contatore `n143` nel testimone `__CPM_G141` lo verifica.
- Rosso `__CPM_NO_G143`: le curve restano fisse.

## Misura dopo (`npm run partita2d-141`, verde e rossi stampati per ultimi)
- Verde **16/16** misure (2 stadi × casa/trasferta × 2 formati × 2 tempi): cartelloni 23/23 e 52/52 in ogni tempo, densità entro
  6 punti, settore ospiti dichiarato dalla parte giusta.
- Partita vera dal salvataggio Primavera: settore ospiti **in basso al 1T, in alto al 52'** (il minuto è portato da `__CPM_SALTA297`,
  quindi dal cronometro di LiveMatch). Contatore dei ridisegni dello sfondo **1→1→1** (1T, 52', 1,5 s dopo). Il settore spostato
  dimostra che al 52' lo sfondo è stato ridisegnato; il contatore che non sale indica che fra le due letture il Campo2D è stato
  **rimontato** (memoria ripartita da zero). Non l'ho verificato: è un'ipotesi. Ciò che la misura prova è che, dopo il cambio,
  lo sfondo **non si ridisegna per fotogramma** (stesso valore a distanza di 1,5 s). Il caso «stesso montaggio, cambio di tempo,
  esattamente +1» non è stato isolato.
- Rosso141: cade su 16/16 per i cartelloni e su 16/16 per la densità. Rosso143: cade su **8/8 misure del secondo tempo** e sulla
  partita vera, mentre il primo tempo resta verde 8/8.
- Foto prima/dopo in `docs/sviluppo/giro143/` (Primavera in casa, 360×800 e 1440×900, `t1`/`t2`, più la partita vera).

## Catena (un controllo alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima di ognuno)
partita2d-141 ✅ · partita2d-297 ✅ (rosso A/B/C cade) · spalti-109 ✅ 21/21 (rosso 21/21) · partita-v2 ✅ (rosso atteso) ·
**folla ❌ preesistente** · griglia-mobile esce 0 · design-system ✅ · test:logic 43/43 · save-compat 12/12.
- **folla**: rossa su F1 (tele ridisegnate) e F2 (caricamenti di texture). Rigirata sulla base `sviluppo/giro141-partita2d` in un
  worktree separato, cade sugli **stessi** controlli con gli stessi formati (1024×512, 128×128, 256×48). Il resto dell'output è
  identico, salvo il conteggio F1 che oscilla (18↔17, 23↔26). Il 3D non è cambiato: `half` riceve lo stesso valore di prima.
- `griglia-mobile` riscrive gli scatti in `docs/collaudo-grafico/g0`: sono stati ripristinati e non sono committati.

## Domande aperte per il PO
1. **Formulazione della decisione.** Ho seguito «come nel 3D»: lo stadio ruota di 180 gradi, quindi nel secondo tempo la squadra
   dell'eroe attacca verso la curva **ospiti**, come nel 3D dopo il 7.732. La frase «così la curva di casa resta dietro la porta che
   la squadra dell'eroe attacca» descrive invece il primo tempo. Se volevi che la curva di casa restasse sempre dietro la porta
   d'attacco, allora nel 2D non va scambiato niente e la richiesta va rivista.
2. **Spicchio ospiti della tribuna laterale**: ruotando lo stadio passa dalla Tribuna Est alla Ovest, sempre accanto alla curva
   ospiti, come fa la rotazione del 3D. Va bene?
3. **Guardiano `folla` rosso già sulla base** (F1/F2): va aperto un cantiere a parte?
