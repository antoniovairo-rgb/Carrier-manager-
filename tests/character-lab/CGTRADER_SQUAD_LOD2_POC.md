# Review squadra CGTrader LOD2 — POC

## Scopo

La route `?hyperCharacter=cgtrader-squad-review` è un banco isolato del branch `poc/marioprada-character-system`. Monta il package animato CGTrader LOD2 per i 23 avatar di campo. Non modifica `main`, il match engine, la telecronaca, gli eventi, né `?hyperCharacter=full`.

## Evidenza verificata — 21 settembre 2026

Lo smoke `cgtrader-squad-review-smoke.mjs`, a viewport 412×915, ha registrato:

| Misura | Esito |
| --- | --- |
| Asset | `cgtrader-review-lod2.glb`, HTTP 200 |
| Avatar | 23 CGTrader su 23 |
| Mixer | 23 |
| Clip | 31, incluse idle, jog, dribble, pass, kick e header |
| Errori browser | 0 |
| Triangoli renderer | 100.908 |
| Draw call | 282 |

La review Hero CGTrader ordinaria continua a superare lo smoke; il percorso `?hyperCharacter=full` continua a caricare il package Hyper e supera il relativo smoke.

## Limiti

- Questo è un test di compatibilità e budget render, non una certificazione FPS/frame-time su un telefono reale.
- LOD2 non è promosso per Hero o gesti tecnici: non deve essere scambiato durante contatto palla, passaggio, tiro, cross, tackle o colpo di testa.
- La qualità visiva va controllata in partita e su dispositivo prima di qualsiasi promozione oltre la route POC.
