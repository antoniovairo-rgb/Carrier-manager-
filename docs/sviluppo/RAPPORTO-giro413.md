# Giro 413 — riparazione urgente di `flussi-115` (rosso nuovo del treno del primo avvio)

Base: `lavoro/202` punta `c1efcce1` (7.999.216 + giro 401, PO-672). Ramo: `sviluppo/giro413-flussi`.
Corsa che ha fermato il rilascio: 45874255363 (trenino, parte 03), `flussi-115` «54 controlli · 52 OK · 2 NO».

## I due NO, riprodotti

Riprodotti sulla punta, formato PC del guardiano (1440×900), braccio verde:

| controllo | misura |
|---|---|
| `[pc] G184-02 pre-1` | vuoto 193 px = 21,4% (soglia 12%), ultimo «⚡ INIZIA IL PROVINO» |
| `[pc] G184-02 pre-2` | vuoto 391 px = 43,4% (soglia 12%), ultimo «⚡ INIZIA IL PROVINO» |

Al telefono gli stessi controlli sono verdi (s360 1,4% · s412 1,7%).

## La causa (misurata): non è il giro 401

Sonda nuova `tests/visual/misura-413.mjs`: arriva al pre-provino 1 e misura con lo stesso `ALTEZZA` del guardiano, in più bracci.

| braccio | 1440×900 | 1280×900 | 412×915 |
|---|---|---|---|
| punta (verde) | 193 px = 21,4% | 193 px = 21,4% | 16 px = 1,7% |
| `__CPM_NO_G401` (creazione/provini di prima) | 282 px = 31,3% | 282 px = 31,3% | 16 px = 1,7% |
| `__CPM_NO_G300` (prima del giro 300) | 16 px = 1,8% | — | — |

- Il giro 401 **non** ha creato il vuoto: senza il 401 il vuoto da PC è più grande (31,3%), perché le testate «Passo 2 di 3» allungano il contenuto.
- La causa è la regola PC del **giro 300 (PO-551)** in `src/19`: `@media(min-width:900px){.cpm-provino300{min-height:0}…}` → da PC il tasto
  «Inizia il provino» segue il contenuto e sotto resta il vuoto. Spegnendo quella regola il vuoto torna a 1,8%.
- Perché il rosso è «nuovo»: `flussi-115` non ha una riga nella MAPPA; è partito nel trenino solo perché il giro 401 ha toccato il suo file.
  Il conflitto è sulla base dal giro 300 (7.999.199), mai giudicato prima.

## Perché non ho cambiato il layout

Le due regole sono decisioni del PO e da PC si contraddicono:
- G184-02 (giro 115, collaudo 184): vuoto in fondo ≤ 12%;
- PO-551 (19/11 12:35, «Attaccato al contenuto, solo PC») e «Da PC vale la compattezza» (19/11 12:55, estesa a tutte le schermate da PC),
  già scritta come eccezione in `altezza-114` (`_ecc289`).

Nessun layout soddisfa le due regole senza ingrandire il contenuto da PC: anche col blocco intero centrato in verticale (l'alternativa
che il giro 300 lasciava al PO) il pre-2 resterebbe intorno al 24%. Ancorare il blocco in basso farebbe passare il numero lasciando il vuoto
in alto: è truccare la misura, non l'ho fatto.

## Correzione (solo nel guardiano, soglie invariate)

`tests/visual/flussi-115.mjs`:
1. **`PC413` / `altezza()`**: da PC (≥ 1024 px, braccio verde) e **solo** sul pre-provino (`pre-1`, `pre-2`) il vuoto in fondo si stampa
   e non si giudica (la stessa eccezione di `altezza-114`). Si giudica il criterio PO-551, con la stessa misura di `prepartita-pc-300` B:
   tasto a ≤ 24 px dall'ultimo riquadro **e** tasto intero a schermo. La soglia del 12% resta per il telefono, per i post-provino da PC e
   per tutto il braccio rosso.
2. **Braccio rosso cieco su 22 e 32** (trovato rigiocando: la CI non l'aveva mai visto, perché `npm run flussi-115` esegue il rosso solo
   dopo un verde). Misurato sulla punta: 32 restava verde perché dal giro 401 il nome sta in cima alla creazione e resta in vista con la
   tastiera; 22 restava verde (6' dopo 8,5 s di scena) perché dal 7.879 la scena nasce da un fatto e non più dalla finestra dei minuti.
   Il mondo della 183 ora comprende anche `__CPM_NO_G401` e `__CPM_NO879` (come già `__CPM_NO_G178_*`). Soglie invariate.

Nessun file di gioco (`src/`) toccato, nessun `GAME_VERSION`, nessun file di `docs/governo`.

## Prova

| corsa | esito |
|---|---|
| `flussi-115` verde, prima (solo PC) | 17 controlli · 15 OK · **2 NO** (pre-1 21,4% · pre-2 43,4%) |
| `flussi-115` verde, dopo (s360, s412, pc) | **54 controlli · 54 OK · 0 non giudicati**; pc pre-1: tasto a 8 px, fondo 707/900 · pc pre-2: tasto a 10 px, fondo 509/900 |
| `flussi-115` rosso, prima della correzione 2 | 51 controlli · 44 NO · **cieco su 22, 32** |
| `flussi-115` rosso, dopo | 51 controlli · 49 NO · **cade su tutti i 17 punti** |
| `primo-avvio-401` | verde, rosso bocciato (13 controlli) |
| catena del giro (`node ci-runner.mjs giro flussi-115 primo-avvio-401`) | **19/19 verdi** su 7.999.216 (flussi-115 1630 s, primo-avvio-401 52 s, 17 sentinelle) |

Foto (in `docs/collaudo-po/`):
- `413-pre1-pc1280-punta.png` — PC 1280×900, punta: tasto attaccato, vuoto sotto (la scelta PO-551);
- `413-pre1-412-punta.png` — telefono 412×915, punta: tasto «Inizia il provino» in fondo, vuoto 1,7%;
- `413-pre1-pc1280-senza401.png` — PC senza il giro 401: vuoto più grande (31,3%);
- `413-pre1-pc1440-senza300.png` — PC senza il giro 300: schermata piena, tasto in fondo (1,8%);
- `413-pre2-pc1440-punta.png` — PC pre-provino 2 (vuoto 43,4%, il caso peggiore).

## Per il PO / la sessione madre

- **Scelta da confermare:** da PC vale PO-551 (tasto attaccato, vuoto sotto) e G184-02 non giudica il vuoto del pre-provino. Se il PO preferisce
  la «schermata piena» anche da PC, basta togliere la regola del giro 300 (`__CPM_NO_G300` misurato: 1,8%) e cadrà `prepartita-pc-300` B.
- `flussi-115` non ha una riga nella MAPPA: rientra solo quando qualcuno tocca il suo file. Da valutare una riga (src/17).

## File toccati

- `tests/visual/flussi-115.mjs` — `PC413`, `altezza()` (criterio PO-551 da PC), `INIT` (rosso: `__CPM_NO_G401`, `__CPM_NO879`).
- `tests/visual/misura-413.mjs` — sonda nuova (non guardiano).
- `docs/collaudo-po/413-*.png` — cinque foto.
- `docs/sviluppo/RAPPORTO-giro413.md` — questo rapporto.
