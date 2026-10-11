# PO-221 — 60 partite vere (collaudo, sola lettura)

Sessione collaudatrice partite vere · build `poc/marioprada-character-system` (GAME_VERSION **7.999.157**, verificata in `CARRIER-MANAGER-AV.html`).
Salvataggio: `tests/visual/fixtures/save-190-s12-ovr93.json`, nome diverso per partita (`Samuelito Vairo k`, k=1..60), autoplay `seeded`, GLB spento (`__CPM_GLB=false`), `__CPM_PRESENT=1`, `__CPM_REC=true`.
Sonda: `po221-partite.mjs` (questa cartella). Dati grezzi: `po221-a/b/c.jsonl` (una riga per partita). Aggregato: `po221-aggregato.json`.

## Esito del giro
- **60/60 partite completate**, 0 errori, tutte in fase `ceremony` (fine partita).
- Tempo reale: circa 270–330 s per partita con quattro processi in parallelo.

## Scene dell'eroe per partita (`__CPM_CAST219`, 1 voce = 1 scena)
| Indicatore | Valore | Obiettivo PO |
|---|---|---|
| Media | **8,53** | 5–7 |
| Mediana | **9** | — |
| Minimo / massimo | 3 / 15 | — |

Distribuzione (scene → partite): 3→1 · 5→4 · 6→4 · 7→9 · 8→10 · 9→14 · 10→10 · 11→3 · 12→4 · 15→1.
**La media sta sopra l'obiettivo 5–7.** Non è un problema di un solo valore anomalo: la mediana è 9.

## Gol e assist dell'eroe (`__CPM_RES218`, esito `ok && key`)
- **Gol a partita: media 0,62** (mediana 0). Distribuzione: 0 gol 37 partite · 1 gol 12 · 2 gol 8 · 3 gol 3. Obiettivo PO 0,6–0,9: **dentro, al limite basso**.
- **Assist a partita: media 0,27** (0 assist 47 partite · 1 assist 10 · 2 assist 3). Nel messaggio del PO non c'è un obiettivo numerico per gli assist: riporto solo il dato.

Esiti grezzi (tutti i `key`, 60 partite): miss 251 · intercept 134 · goal 37 · recovery 22 · through 18 · foul 16 · assist 16 · chance 8 · miss_easy 2.

## Punizioni
- **89 punizioni in 60 partite: 1,48 a partita.**
- Distinzione per etichetta dell'esito (`__CPM_RES218.label`):
  - **Palla in area** (passaggio/cross in area): **33**
  - Dirette (tiro): **56** = Botta sopra la barriera 16 · Punizione a giro 17 · Tiro rasoterra 14 · Curva a rientrare 9
- **Per percorso** (registro `__CPM_EV`, evento `scena`, `src`): tutte le 89 punizioni vengono da `motore-occasione`. Il registro `scena` conta 705 voci in totale: `motore-occasione` 512, `brain137` 79, `brain-origine` 76, `reattiva` 26, `secondo-tempo` 6, `catena-motore` 6. Le 512 `motore-occasione` hanno lo stesso numero delle 512 voci di `__CPM_CAST219` (non ho verificato voce per voce che siano le stesse scene).

## Tipi di scena (`__CPM_CAST219.tipo`, 512 voci = 8,53 × 60)
fra-le-linee 134 · conclusione 112 · cross 53 · difesa 56 · punizione 89 · spalle 41 · rigore 14 · angolo 13.

## Lettura
1. **Scene: sopra l'obiettivo.** Media 8,5 contro 5–7. Il dato è misurato su 60 partite, non è rumore di un campione di 6.
2. **Gol: nel range basso.** 0,62 contro 0,6–0,9. Con 37 partite su 60 a zero gol, il valore medio dipende dalle partite con più reti.
3. **Assist: 0,27 a partita.** Dato riportato, senza un obiettivo fissato dal PO.
4. **Punizioni: 1,48 a partita**, più della metà dirette. Tutte passano dal motore dell'occasione.

## Limiti
- Il numero di scene e di esiti dipende dal seme (avversario+stagione+settimana+nome): i 60 nomi danno 60 partite diverse, ma sono tutte del medesimo salvataggio S12.
- Il valore «percorso» viene dal registro `__CPM_EV` (`src`), che registra solo le scene di cui il motore tiene traccia: non è una misura dell'intero flusso di partita.
- Non posso confermare che il numero di scene corrisponda a quello della partita reale: misuro il gioco in modalità autoplay con `__CPM_REC=true`.

## Riferimenti nel build
- `__CPM_CAST219`: `CARRIER-MANAGER-AV.html:31416` (push del cast all'apertura della scena)
- `__CPM_RES218`: `CARRIER-MANAGER-AV.html:35624` (push dell'esito)
- Registro `scena`/`goal`: `CARRIER-MANAGER-AV.html:31415`, `28908`
