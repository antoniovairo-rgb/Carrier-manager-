# Asset gate — Soccer Player CGTrader

**Data:** 20 settembre 2026  
**Origine:** pacchetto acquistato dall'utente, archiviato in `assets/source/cgtrader-soccer-player/`  
**Stato:** `PASS CON VINCOLI` — usare la sorgente Blender; non usare direttamente il GLB consegnato.

## File verificati

| File | Risultato |
| --- | --- |
| `BLENDER+RIG.blend` | 118,4 MB; aperto in Blender 4.5.14 con auto-esecuzione disabilitata |
| `CHARACTER.glb` | 13,6 MB; importato in Blender |
| FBX, OBJ, texture e componenti separati | presenti nel pacchetto Drive: testa, mani, gambe, maglia e pantaloncini |

## Dati misurati

| Criterio | Misura | Esito |
| --- | ---: | --- |
| Rig nella sorgente Blender | 344 ossa, 68 deformanti | PASS tecnico |
| Geometria del calciatore | 34.995 triangoli, 20.547 vertici, 6 materiali | PASS per Hero; richiede LOD/throttling per tutti i 22 giocatori |
| Kit | mesh/materiali separati nel sorgente | PASS per la costruzione di kit ereditati dai club |
| Texture nel GLB | 5 texture integrate, 2048×2048 | PASS funzionale; ottimizzare per la partita mobile |
| Animazioni consegnate | nessuna action nel `.blend` | DA COSTRUIRE/RETARGETTARE |
| Shape key facciali | nessuna | DA MIGLIORARE per reazioni ed espressioni |
| GLB consegnato | nessuna armatura o action dopo importazione | FAIL come file runtime diretto |
| GLB riggato riesportato | 14,6 MB; 68 ossa dopo reimportazione e mesh ancora pesate | PASS come base runtime da completare |
| Preview dal GLB reale | volto adulto, proporzioni credibili, maglia/pantaloncini/calzettoni completi e righe verticali tessute | PASS visivo preliminare |

## Decisione tecnica

Il modello è una base visiva e di rig migliore del pacchetto precedente: proporzioni adulte, kit completo e componenti separati. Il file runtime sarà però un GLB riggato riesportato dalla sorgente Blender, non `CHARACTER.glb` consegnato. La riesportazione tecnica è stata verificata reimportando `assets/cgtrader-player-runtime-base.glb`: conserva le sette mesh pesate e riduce lo scheletro da 344 controlli a 68 ossa runtime.

Prima dell'integrazione occorre: creare LOD mobile, costruire le varianti di capelli/volto e retargettare le clip del gioco con sincronismo palla verificato. Il modello ha una sola testa senza shape key facciali e nessuna capigliatura modulare inclusa: questo è il primo gap artistico da colmare nella sorgente Blender.

## Aggiornamento 22 settembre 2026 — inventario completo del pacchetto CGTrader

- **Fatti verificati:** fra i file inclusi ci sono componenti separati per testa, mani, gambe, maglia e pantaloncini. `HEAD.glb` e' una sola mesh da `9.083` triangoli, con una sola texture `HEAD`; non contiene teste alternative, morph o tagli separati. `HANDS.glb` contiene solo due mesh mani per `5.076` triangoli.
- **File Earring:** l'FBX aggiuntivo e' un solo mesh da `50.000` triangoli, con mappe base/metallic/normal/roughness 4K; e' un accessorio distinto, non capelli, e supera da solo il budget Hero. Non viene integrato.
- **Decisione:** tutti i componenti utili del pacchetto sono stati controllati. Non esistono varianti nascoste di volto, barba o capelli da promuovere; la base CGTrader resta valida per rig e kit, mentre la varietà richiede un'altra pipeline verificata.
