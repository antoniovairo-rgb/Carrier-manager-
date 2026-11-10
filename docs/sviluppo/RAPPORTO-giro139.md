# RAPPORTO — giro 139 · il doppio rigore dell'eroe del giro 111 (caso naturale)

Ramo `sviluppo/giro139-rigore` da `lavoro/188` (GAME_VERSION 7.999.188). Decisione PO del 10/11: PO-315 nella 189.
**`GAME_VERSION` non toccato.** Il caso **si è riprodotto** alla partita 124 (quarto braccio): causa misurata, correzione in
`src/14` con rosso `__CPM_NO_G139`, guardiano nuovo `npm run rigore-139`. Macchina: prima di ogni braccio
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
| k1d | 32 | 2x | 1 | 17 | 9 | **1 (k1d-11)** |
| **Totale** | **124** | | | **71** (38 per la squadra dell'eroe) | **37** (35 in scena, tutte gol; 2 del motore) | **1** |

Tutte le 124 partite giudicate (arrivate a `ceremony`), 0 errori di pagina. **Frequenza misurata: 1 doppio su 37 battute di rigore
dell'eroe (2,7%)**, 1 su 124 partite; sulle prime 92 partite (28 battute) zero casi, limite superiore al 95% 10,1%.

## Il doppio riprodotto: k1d-11 (nome «… k1d-11», seme d'autoplay 12, `RIG190_K=1`, 2x)
Rigiocata due volte da sola: **2 su 2 identiche** (stesso registro). Sequenza (`__CPM_PEN94` + `__CPM_EV`):
`89' rigore(home)` → `90' occasione_eroe*` → al battito del 90' `scena brain-origine kind:rigore` (inserita) **e** nello stesso battito
`90' battuta* tiro*` del motore («k1d-11 calcia il rigore!») → `91'` scena del rigore, `piazzato_giocato` con fermo `nullo:volo`
(il motore l'aveva già calciato), `scena_gol` → `92' gol*` del motore («insacca su assist di …»). **Un rigore, due battute, due gol;
punteggio 2-0.**

**Causa (spia lato sonda su `tick()` del motore, `CPM_SPIA=1`, nessun ramo nel gioco).** Al battito del 90' il rigore aveva **21 passi
d'attesa su 40** e la scena **non ancora accettata** (`_acc94`=0): il tetto dei 40 passi non c'entra. `_piaz27` (src/14 r.~1140) è
uscito per la sua prima condizione: `S.richieste.piazzati` era **spenta**, perché il live chiama `origini(…, piaz)` con `nx<=89`
(src/15 r.~5202) a ogni battito, **prima** del passo del motore. Il rigore offerto all'89' quindi: al 90' il live inserisce la scena e
chiama `attendiPiazzato` (che trova il fermo già vuoto), ma il motore — vedendo la richiesta spenta — ha già fatto calciare l'eroe.
La guardia `noPiaz94` non poteva fermarlo: nasce solo quando la scena calcia (`piazzatoGiocato`), cioè dopo.

**Correzione (src/14, `_piaz27`).** La richiesta spenta vale per le offerte **nuove**; un rigore/punizione **già offerto** (`f._o27`)
segue la sua attesa (40 passi, 400 se la scena è accettata) e poi, se la scena non arriva, lo calcia il motore come prima. Nessun
`Math.random`, nessun generatore nuovo: è una condizione. Rosso `__CPM_NO_G139` (torna il codice di prima).
Prova sulla testimone: **verde** `89' rigore · 90' occasione_eroe* · 91' piazzato_giocato[pen:43,tolto]` (una battuta, in scena; il
motore cede il pallone al portiere) · **rosso** `90' battuta* tiro* · 91' piazzato_giocato[nullo:volo] · scena_gol · 92' gol*` (doppio).

**Il caso del giro 111 (75' → 77' → 78') NON è dimostrato essere lo stesso meccanismo**: lì il rigore era al 75', lontano dal
taglio dell'89'. Sul codice attuale non si riproduce (vedi r111) e **non posso confermarne la causa**; il guardiano copre il
meccanismo misurato qui, e la sonda resta per cercare l'altro.

### Cosa dice la misura sulla guardia (fatti, non correzioni)
1. **Ritardo rigore → scena: 1 minuto in 35 casi su 35.** Nel giro 111 era 2 (75' → 77'): una condizione che sul codice attuale non è
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
