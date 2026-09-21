# Benchmark locale CGTrader — LOD misti

Questo benchmark vive solo sul branch locale `poc/marioprada-character-system-local` e non è pubblicato su GitHub Pages.

## Configurazione verificata

| Fascia | Avatar | Asset |
| --- | ---: | --- |
| Hero | 1 | LOD0 |
| Vicini al Hero alla creazione | 7 | LOD1 |
| Restanti | 15 | LOD2 |

Lo smoke mobile-layout (412×915) ha caricato i tre asset con HTTP 200, ha creato 23 mixer e ha conservato 31 clip. Metriche renderer: 157.516 triangoli e 280 draw call, con zero errori browser.

## Gate aperti

L’assegnazione è calcolata alla creazione del roster. Non è ancora un selettore dinamico: non reagisce a camera, distanza o gesto tecnico. Per questo non è pubblicabile e non dimostra la resa di LOD2 nei primi piani. Il test reale sul telefono dell’utente, pari a 11–16 FPS nel percorso corrente, resta FAIL.
