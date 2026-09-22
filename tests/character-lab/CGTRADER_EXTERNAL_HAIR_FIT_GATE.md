# Gate di compatibilità: capelli/barba esterni su CGTrader

Questo gate impedisce che un asset esterno venga promosso soltanto perché appare bene
nella sua preview commerciale.

## Contratto verificato della base

- Armatura: `rig`
- Osso di aggancio: `head.x`
- Origine testa in bind pose: `[0.00000, 0.01128, 1.56076]` metri
- Bounds della mesh testa: X `-0.16636..0.17226`, Y `-0.12902..0.13404`,
  Z `1.34699..1.75783`
- Mesh volto: `part_00000001.005`, 4.544 vertici, materiale `Material.002`

Il dato riproducibile è in `cgtrader-head-fit-contract.json`, ricavato direttamente
 da `BLENDER+RIG.blend` acquistato.

## Criteri obbligatori

1. L'asset deve essere libero da limitazioni incompatibili con il gioco e includere
   una sorgente Blender, FBX o GLB ispezionabile.
2. Capelli e barba devono essere separati, o separabili, e pesati 100% a `head.x`
   oppure parentati all'osso in modo equivalente.
3. Render in fronte, tre quarti, profilo e retro: nessun passaggio attraverso fronte,
   occhi, orecchie, collo o maglia; nessuna calotta o anello visibile.
4. Il test `dribble` deve mantenere capelli e barba solidali alla testa senza jitter,
   ritardo o clipping durante busto e braccia coordinati.
5. Vanno misurati triangoli, draw call e texture. Per l'Hero l'obiettivo è <=8.000
   triangoli aggiuntivi; oltre 14.000 serve il benchmark mobile reale prima di ogni
   promozione. Gli altri giocatori non ricevono la geometria ad alta densità.
6. Il risultato deve ereditare uno dei quattro colori validati della palette locale:
   nero, castano, biondo o ramato.

Il fallimento di un criterio lascia l'asset in `tests/character-lab` come evidenza e
lo esclude dal renderer di partita.
