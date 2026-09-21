# Review squadra CGTrader LOD2 — POC

## Scopo

La route `?hyperCharacter=cgtrader-lod2-benchmark` è un banco isolato del branch `poc/marioprada-character-system`. Monta il package animato CGTrader LOD2 per i 23 avatar di campo. Non modifica `main`, il match engine, la telecronaca, gli eventi, né `?hyperCharacter=full`.

## Evidenza verificata — 21 settembre 2026

Lo smoke `cgtrader-lod2-benchmark-smoke.mjs`, a viewport 412×915, ha registrato:

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

## Gate visivo interattivo

La verifica in browser del 21 settembre ha misurato 30–40 FPS nel monitor della partita, ma ha mostrato artefatti geometrici evidenti su gambe e maglia quando la camera arriva vicino al giocatore. Per questo la route è stata rinominata `?hyperCharacter=cgtrader-lod2-benchmark`: è esclusivamente un banco di budget e compatibilità, non una preview approvata.

**Verdetto:** FAIL LOD2 per primi piani e gesti tecnici. Il modello base CGTrader resta candidato; il LOD2 può essere rivalutato solo per giocatori lontani o fuori camera, dietro un selettore LOD che mantenga LOD0/LOD1 nelle zone vicine.
