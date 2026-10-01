# Prompt per Codex — Collaudo camera: codice 007 «la camera salta» (PO-144)

Il PO ha segnato più volte il codice 007 «la CAMERA salta: passo di 2,5 unità … a 4,2 s». Il team **non lo riproduce** in headless: fuori dagli stacchi neri la camera va a 46-48 u/s (massimo misurato su gioco sano: 65 u/s), e i passi oltre 2,5u che si vedono nel banco sono fotogrammi headless lunghi 70-220 ms. Inoltre la 7.999.79 aveva notato numeri **identici** su due scene diverse (#171 e #126). Serve una misura su un Chrome vero con GPU a 60 fps, come il tuo collaudo «fluidità 3D» del 28/09 (D3D11).

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION`; deve essere ≥ 7.999.93, che contiene il testimone).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-collaudo-camera-007`. Non toccare `src/`, `tools/`, altri test, `main`.

## Strumenti nel gioco (solo collaudo, con `?cpmtest=1`)
- `window.__CPM_CAMSTEP93ON = 1` prima del caricamento: ogni fotogramma in cui la camera si sposta di oltre 2,5u finisce in `window.__CPM_CAMSTEP93` con `{t, st (passo in u), dtr (durata reale del fotogramma in ms), dt, ph (fase), snap, sc, cut (stacco nero attivo)}`.
- `window.__CPM_CUTLIVE()`: vero se uno stacco nero è in corso (un salto coperto dal nero è voluto).
- `window.__CPM_FPS708`: frame rate medio misurato dal gioco.
- `window.__CPM_DRAFTNOTE`: la bozza del taccuino (la riga 007 nasce da lì: passo ≥ 2,5u **e** velocità ≥ 150 u/s).

## Casi
1. Scene **171** e **126** (le due con numeri identici), poi **2, 24, 33, 38, 64, 90, 134, 152**: azione 0, esiti `success` e `fail`, **3 ripetizioni** (pagina nuova ogni volta) → 60 casi.
2. Per ogni caso, dall'avvio della scena alla fine dell'esito: tutti i record di `__CPM_CAMSTEP93`, FPS medio, e la bozza `__CPM_DRAFTNOTE` alla fine.
3. Una **partita vera** in autoplay (`__CPM_AUTOPLAY(true)`) di almeno 3 highlight, raccogliendo le bozze di ogni scena.

## Domande
- Con fps ≥ 50, compare mai un passo ≥ 2,5u con velocità ≥ 150 u/s **fuori** da uno stacco nero (`cut:false`)? In quale scena, fase e istante dall'inizio scena?
- La bozza 007 «salta» compare? Se sì, i numeri (passo, istante) sono uguali fra scene diverse? (sarebbe il segno di uno strumento, non della camera)
- Se trovi un salto vero: video o sequenza di 5 foto a cavallo del salto, e il comando per riprodurlo.

## Rapporto
`reports/codex/2026-10-01-collaudo-camera-007.md`: tabella per scena (casi, fps medio, passi > 2,5u fuori stacco, velocità massima fuori stacco, righe 007 nella bozza); verdetto **riprodotto / non riprodotto / non misurabile**. Grezzo in `tests/codex/collaudo-camera-007.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
