# Rapporto giro 48 — PO-061 «kit di qualità grafica migliore»

Ramo `sviluppo/kit-061-giro48`, base `lavoro/171-base` (7.999.170 + giro 22). Solo grafica: GAME_VERSION e SAVE_VERSION
invariati, nessun tocco a stadi (giro 46), cerimonie (giro 47) o zona G.

## 1. Che cosa vuol dire «kit» qui

Dal repo il significato è univoco: **le maglie dei giocatori 3D** (corpi CGTrader `*-kit-adapter.glb`), non il design system.
- BACKLOG PO-061: «migliore la qualità grafica dei kit?» → release 7.999.25.
- ROADMAP 7.999.23: «numero anche sul pantaloncino e kit migliori» → «provata la trama della texture originale moltiplicata
  sul colore … TOLTA, dichiarato che la qualità del tessuto NON è migliorata».
- ROADMAP 7.999.25: «niente più V sulle maglie a strisce» — strisce, righine e cerchi disegnati dal corpo.

Il codice è in `src/12-three-match-view.jsx` (`_shirtGeoMap`, `_hyperShirtTex`, `_applyHyperKit`), ora racchiuso fra i
marcatori `/*KIT061*/ … /*/KIT061*/` perché il provino lo copi senza riscriverlo.

## 2. Censimento fotografico

Due strumenti nuovi (non guardiani):
- `tests/visual/provino-kit061.mjs` — corpo di gioco lod0/lod1/lod2 vestito col **codice vero** del gioco, 12 kit (tutti i
  9 motivi + 3 tinte unite), davanti e dietro, con la resa del renderer della partita (ACES, esposizione 0,52, sRGB).
  `CPM_VICINO=1` per il primo piano, `CPM_ROSSO=1` per il mondo di prima.
- `tests/visual/censimento-kit061.mjs` — partita vera coi corpi CGTrader (il default), **360 e 412 px**, densità di
  telefono 2,625, motivi forzati su entrambe le squadre con l'aggancio solo-collaudo `__CPM_KITPAT061` (attivo solo sotto
  `cpmtest`). Il gioco fluido è la lavagna 2D, quindi si fotografa un highlight forzato (gi12) e un ritaglio sul campo 3D.

Foto in `docs/sviluppo/foto-giro48/` (`prima-*` = codice di base o `__CPM_NO_KIT061`, `dopo-*` = giro 48).

### Difetti trovati, in ordine di visibilità

| # | Difetto | Dove si vede |
|---|---|---|
| 1 | **5 motivi su 9 disegnati nello spazio della texture**: il 7.999.25 aveva portato sul corpo solo strisce/righine/cerchi. «band» = chiazza nera a pipistrello sulle spalle; «vband» assente sul davanti; «sleeves» maniche invisibili; «halves» a chiazze; «sash» solo frammenti sul fianco | `prima-provino-lod1.jpg`, `prima-provino-vicino.jpg` |
| 2 | **Macchia color pelle** sul petto e sotto la nuca su TUTTE le maglie: il busto del corpo buca la maglia (provato: nascondendo le mesh non-Hyper la macchia sparisce) | `prima-provino-vicino.jpg` |
| 3 | Maglie senza rifinitura: nessun collo né polsino, tinta piatta | tutte le tinte unite |
| 4 | **Calzettoni sempre bianchi con righine beige**, qualunque squadra: sono dipinti nella texture delle gambe del modello e il colore `socks` del kit non arriva (l'adapter non ha il materiale `HyperSocks`) | tutte le foto |

## 3. Correzioni (interruttore rosso `window.__CPM_NO_KIT061`)

1. **Tutti i motivi si disegnano dal corpo** (`_shirtGeoPaint061`): la mappa per-pixel del 7.999.25 ora ricorda anche il
   **lato** del corpo e la distanza dall'asse; metà sinistra/destra, fascia dalla spalla destra al fianco sinistro (che
   prosegue sulla schiena), banda centrale davanti e dietro col fondo nel secondo colore (convenzione dell'icona 2D 7.280),
   fascia sul petto bianca coi filetti neri e anima nel secondo colore, maniche nel secondo colore con confine liscio.
   Bordi sfumati di un pixel come le strisce. Le strisce/cerchi restano del 7.999.25.
2. **Collo e polsini a contrasto** su ogni maglia: il collo segue il profilo della scollatura (la più alta altezza della
   maglia per ogni angolo, davanti e dietro, mai sulle spalle); i polsini sono l'ultimo 10% della manica.
3. **La maglia vince la profondità sulla pelle** (`polygonOffset` −2/−6 sul solo materiale `HyperShirt`; provato e
   scartato sui pantaloncini, che trasparivano sotto l'orlo).
4. **Calzettoni nel colore del club** (`_socksTex061`): misurato sulla texture delle gambe (1024 px) — il calzettone è il
   blocco poco saturo e chiaro sopra la scarpa (che sta sotto l'84% dell'altezza), le righine oro stanno fra il 44% e il 52%
   con blu/verde 0,59 contro 0,79 della pelle. Il calzettone prende il colore `socks` del kit tenendo la luce del disegno
   (parastinco, pieghe), le righine il secondo colore se stacca abbastanza, altrimenti bianco/blu notte; pelle e scarpa
   restano. Prima stesura bocciata dalle foto: la regola dell'oro prendeva anche la pelle (ginocchia macchiate del secondo
   colore) → ristretta alla fascia delle righine.

Costo: maglie senza texture in più (stessa maglia 512 px per squadra, fondo condiviso del 7.999.59); la mappa del corpo era
già cotta per le strisce, ora si cuoce anche per le altre maglie: 27-97 ms per geometria in headless, una volta per partita.
Calzettoni: una texture gambe 512 px per colore e per livello di dettaglio, deduplicata per impronta dell'immagine (le due
gambe arrivano con due copie identiche) — misurate 15 in partita (5 colori × 3 livelli), circa +4 MB netti di scheda
grafica perché la texture originale 1024 px non viene più usata. Da tenere d'occhio sul telefono.

## 4. Misure (guardiano `npm run kit-061`)

Provino di fronte, primo piano, quota del secondo colore fra i pixel della maglia e pixel color pelle nel riquadro del petto:

| Misura | prima (`__CPM_NO_KIT061`) | dopo | soglia |
|---|---|---|---|
| banda verticale, secondo colore sul davanti | 0 | 0,37 | ≥ 0,25 |
| maniche, secondo colore | 0,145 | 0,30 | ≥ 0,22 |
| fascia diagonale, secondo colore | 0,115 | 0,212 | ≥ 0,17 |
| pelle sul petto, 4 tinte unite | 35 · 35 · 38 · 27 | 7 · 7 · 7 · 5 | ≤ 15 |
| pittore dal corpo in partita (band/vband) | mai chiamato | band, vband, solid | entrambi |
| calzettoni tinti in partita | 0 | 5 colori, ~45.700 px di texture ciascuno | ≥2 colori, ≥2000 px |

Verde: `✅ PASS kit-061`. Rosso: `CPM_ROSSO=1 npm run kit-061` → `✅ ROSSO come atteso`.
Agganciato a `package.json` (`kit-061`), alla catena `grafica` di `ci-runner.mjs` e alla MAPPA (`src/12-|src/13-`, insieme a
`strisce-corpo` che condivide la mappa del corpo).

## 5. Catena grafica (rifatta sul build dei calzettoni, commit 9f7ae99)

| Passo | Esito |
|---|---|
| `test:logic` | verde |
| `design-system` | verde («SISTEMA GRAFICO OK») |
| `save-compat` | verde, 12 pass · 0 fail |
| `griglia-mobile` | verde, exit 0, overflow 0 px su tutte le larghezze (gli scatti rigenerati in `docs/collaudo-grafico` NON sono stati committati) |
| `career-critical` | verde su 62adbb2 (9 min 10 s) e su 9f7ae99 (exit 0, zero ❌; una prima corsa a 9f7ae99 era stata solo TAGLIATA dal tetto di 10 minuti della chiamata, rifatta per intero in sottofondo con attesa in primo piano) |
| `kit-061` | verde; rosso riprodotto |
| `strisce-corpo`, `maglie-numero` | verdi (guardiani vicini, stessa funzione) |

Build: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` → identico byte per byte.

## 6. Cosa resta fuori (dichiarato)

- **Residuo lod2**: sul corpo dei giocatori lontani la banda verticale vista di schiena ha una piccola chiazza del colore di
  fondo in basso a sinistra (`dopo-provino-lod2.jpg`). lod0 e lod1 sono puliti. In campo lod2 è alto poche decine di pixel:
  non misurato oltre.
- **Tessuto**: nessuna trama aggiunta (quella del 7.999.23 è stata scartata e non l'ho rimessa); il guadagno di qualità è
  nei motivi giusti, nelle rifiniture e nella macchia tolta, non nella grana.
- Nella fascia sul petto («band») vista di schiena il numero si sovrappone alla fascia: il numero resta sopra e leggibile.
- **Collaudo sul telefono** del PO: necessario, la resa a 360/412 px headless è nelle foto `*-zoom.jpg`.
- Nessuna riga di ROADMAP né bump di versione: li scrive la sessione che integra il rilascio (vincolo del giro).
