# Benchmark locale CGTrader — LOD misti

Questo benchmark vive solo sul branch locale `poc/marioprada-character-system-local` e non è pubblicato su GitHub Pages.

## Configurazione verificata

| Fascia | Avatar | Asset |
| --- | ---: | --- |
| Hero | 1 | LOD0 |
| Vicini al Hero alla creazione | 7 | LOD1 |
| Restanti | 15 | LOD2 |

Lo smoke mobile-layout (412×915) ha caricato i tre asset con HTTP 200, ha creato 23 mixer e ha conservato 31 clip. Metriche renderer: 157.516 triangoli e 280 draw call, con zero errori browser.

## Selettore locale verificato

Il benchmark ora conserva tre visual compatibili per ciascuno dei 23 avatar (69 in totale), ma rende e aggiorna un solo visual/mixer per giocatore. La fascia attiva viene aggiornata per camera e distanza solo quando l’avatar è in idle o in locomozione lineare. È bloccata durante fade direzionale, dribbling, passaggi, tiri, colpi di testa, contrasti e parate.

Prima dell’innesco di un gesto tecnico, il giocatore viene promosso a LOD0; dal wind-up al recupero il suo scheletro non viene più sostituito. Lo smoke locale verifica inventario 23×3, uno scambio sicuro e il rifiuto esplicito di uno scambio durante un dribbling.

## Gate aperti

Il risultato è un **PASS tecnico locale**, non una promozione. Restano necessari: ripresa di una sequenza tecnica reale sul telefono, controllo visivo che LOD2 non entri mai in primo piano e benchmark di frame time/memoria su dispositivo. Il test reale dell’utente, pari a 11–16 FPS nel percorso corrente, resta quindi FAIL.
