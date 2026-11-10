# RAPPORTO — giro 139 · il doppio rigore dell'eroe del giro 111 (caso naturale)

Ramo `sviluppo/giro139-rigore` da `lavoro/188` (GAME_VERSION 7.999.188). Decisione PO del 10/11: PO-315 nella 189.
**`src/`, il gioco e `GAME_VERSION` non toccati**: il caso non si è riprodotto, quindi (punto 3 del compito) nessuna correzione,
nessun interruttore `__CPM_NO_G139`, nessun guardiano `rigore-139`. Resta la sonda come strumento. Macchina: prima di ogni braccio
`free -m` ~14,4 GB liberi e `df -h` 29 GB liberi; la macchina non era in sofferenza.

## Il fatto di partenza
Giro 111 (`docs/sviluppo/RAPPORTO-giro111.md`, «Da annotare per il gioco» n.1): partita k7 del salvataggio 190 (nome «… Q190-7»,
seme d'autoplay 7, `__CPM_RIG190_K=1`, velocità di fatto 1x), rigore del motore al 75', `scena_gol` al 77', poi `battuta*` + `tiro*`
di rigore dell'eroe al 78' nel testimone `__CPM_PEN94`. Il documento `docs/governo/RICONCILIAZIONE-136.md` citato nel compito **non
esiste sul ramo** (`lavoro/188`): non l'ho potuto leggere.

## La sonda: `tests/visual/sonda-rigore-139.mjs` (`npm run sonda-rigore-139`)
- Partite di **carriera vere** dal salvataggio `fixtures/save-190-s12-ovr93.json` (come `sonda-rigore-94`), autoplay seedato. Non uso
  `openMatch`: è il percorso del provino, che fischia al 50' (CLAUDE.md, nota 7.494) e non arriverebbe mai al 78'. Il seme di partita
  nasce da avversario+stagione+settimana+NOME, quindi **ogni partita cambia il NOME** nel salvataggio (`CPM_NOMI` o `CPM_TAG-i`); il seme
  d'autoplay è `CPM_SEMI` o l'indice. Prova che le partite sono diverse: punteggi e minuti dei rigori diversi fra le 92 partite; prova che
  il seme conta davvero: le due esecuzioni gemelle «Q190-7» seme 7 hanno dato registrazioni identiche.
- **Il rigore lo concede il motore** (fallo vero in area, `fallo()` in src/14 r.~729): la sonda **non scrive alcuno stato** nel motore.
  `CPM_K` imposta solo `__CPM_RIG190_K` (quanti falli in area diventano rigore; il gioco usa 0,25, il caso del giro 111 girava con 1).
- Registra per partita: `__CPM_PEN94` (rigori, battute, tiri, occasioni d'eroe da rigore, `piazzato_giocato`, `scena_gol`), le voci
  pertinenti di `__CPM_EV()` (è una **funzione**, non un array: la prima stesura della sonda è caduta lì), le fasi da `__CPM_PHASE` col
  minuto del motore e la guardia `noPiaz94` corrente, i contatori del motore `piaz94/piazNo94/rigNo190`.
- **Battuta di rigore dell'eroe** = `piazzato_giocato` entro 6' da un'occasione d'eroe (scena) **oppure** `battuta` kind pen dell'eroe
  calciata dal motore. **Doppio** = due battute dell'eroe entro 10 minuti di cronometro. Uscita sempre 0 (strumento); riassunto
  nell'ultima riga `RIASSUNTO {…}` e, con `CPM_OUT`, in json.
- `CPM_ROSSO=1` accende `__CPM_NO_G139`, che **oggi nel gioco non esiste** (nessuna correzione): è predisposto per un giro futuro.

## Misura

| Braccio | Partite | Velocità | `RIG190_K` | Rigori del motore | Battute dell'eroe | Doppi |
|---|---|---|---|---|---|---|
| nat1 (gioco puro) | 8 | 2x | 0,25 (gioco) | 2 (entrambi avversari) | 0 | 0 |
| k1a | 24 | 2x | 1 | 14 | 7 (6 scena + 1 motore) | 0 |
| r111 (ricostruzione esatta del giro 111: Q190-7 ×2, Q190-13, Q190-21) | 4 | 1x | 1 | **0** | 0 | 0 |
| k1b | 24 | 1x | 1 | 15 | 9 | 0 |
| k1c | 32 | 2x | 1 | 23 | 12 | 0 |
| **Totale** | **92** | | | **54** (29 per la squadra dell'eroe) | **28** (27 in scena, tutte gol; 1 del motore) | **0** |

Tutte le 92 partite giudicate (arrivate a `ceremony`), 0 errori di pagina.

**Probabilità massima compatibile con zero casi** (binomiale, confidenza 95%: p ≤ 1 − 0,05^(1/n)):
- per **battuta di rigore dell'eroe**, n = 28: **p ≤ 10,1%**;
- per **gol di rigore dell'eroe in scena** (la condizione del giro 111), n = 27: **p ≤ 10,5%**.
Il campione **non** esclude un difetto raro (sotto il 10% per rigore); esclude che sia frequente.

### Cosa dice la misura sulla guardia (fatti, non correzioni)
1. **Ritardo rigore → scena: 1 minuto in 27 casi su 27.** Nel giro 111 era 2 (75' → 77'): una condizione che sul codice attuale non è
   mai comparsa.
2. **La guardia copre 3 minuti di cronometro, non 4.** Al `piazzato_giocato` il minuto del motore `S.min` è **sempre un minuto indietro
   sul cronometro** (15/15 letti nelle fasi di k1a+k1b: scena al cronometro m → guardia `S.min < m+3`). Perché la battuta del giro 111 al
   78' sfugga alla guardia (src/14 r.~1151, `S.min < noPiaz94`) lo sfasamento al momento della scena avrebbe dovuto essere di almeno 4
   minuti; nelle 27 scene misurate è 1. **Non posso confermare** quale meccanismo abbia prodotto il caso del giro 111 (registrazione o
   sfasamento più grande), perché sul codice attuale non si riproduce nemmeno con lo stesso nome e lo stesso seme: in r111 la partita
   Q190-7 non ha più alcun rigore (il codice è cambiato da 7.999.181 a 7.999.188).

### Due stranezze viste dalla sonda (non doppi, non indagate, non corrette)
- **k1a-11, 96'**: il motore concede un rigore alla squadra dell'eroe e lo fa **calciare all'eroe senza scena** (`96'rigore(home)
  96'battuta* 96'tiro* 96'gol*`); la cronaca lo racconta come «⚽ RETE! … non sbaglia su assist di …». Probabile effetto del tetto delle
  scene a fine partita; è a 26 minuti dal rigore precedente (70'), quindi non è il doppio cercato.
- **k1a-22, 14'**: rigore del motore per la squadra dell'eroe con `occasione_eroe`, ma la scena registrata in `__CPM_EV` è
  `brain-origine kind:"punizione"` e il rigore **non viene mai calciato** (nessun `piazzato_giocato`, nessuna `battuta`). 1 caso su 28.

## Cosa non è stato fatto (dichiarato)
- Nessuna correzione nel gioco, nessun `__CPM_NO_G139`, nessun guardiano `npm run rigore-139`: il compito lo vieta senza riproduzione.
- Catena di rilascio non eseguita: non ho toccato `src/` né l'HTML (`node tools/check-src.mjs`: «allineato al file in git»).
- Il braccio a gioco puro (`K` 0,25) ha solo 8 partite e nessun rigore dell'eroe: il gioco puro concede pochi rigori alla squadra
  dell'eroe (rigNo190 = 7 contatti in area respinti su 8 partite). La misura sul caso dell'eroe viene quindi dai bracci K=1, che hanno
  la stessa catena (fallo vero → `fermoSet("pen")` → scena → guardia) cambiando solo la frequenza.

## Uso
```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  CPM_K=1 CPM_N=32 CPM_PAR=4 CPM_TAG=x CPM_OUT=/tmp/x.json npm run sonda-rigore-139
```
~4 minuti a partita a 2x (5 a 1x), 4 in parallelo ≈ 8 partite ogni 8-10 minuti su questa macchina: una corsa da 32 va in sottofondo
con attesa in primo piano sul log.
