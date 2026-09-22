# Gate MakeHuman Hair Editor — 22 settembre 2026

## Origine e scopo

L'asset pack ufficiale [Hair editor](https://static.makehumancommunity.org/assets/assetpacks/haireditor.html) e' distribuito come pacchetto funzionale CC0. Contiene `hair.blend` e `fur.blend` con template a Geometry Nodes; non e' una libreria GLB pronta.

La prova verifica se le template possono essere usate come fonte immediata per le capigliature del calciatore CGTrader, senza introdurre mesh generiche o effetti runtime.

## Ispezione

`hair.blend` contiene quattro template capelli: `basic_short_hair`, `hedgehog`, `back_pigtail` e `straight_hair_to_shoulder`, oltre a barbe, baffi e sopracciglia sperimentali. Il render di origine mostra che **basic short** e **hedgehog** sono le sole due silhouette inizialmente plausibili per un calciatore adulto; le altre due sono code/capelli alle spalle.

Le template sono oggetti Blender `CURVES`, con catene Surface Deform, Geometry Nodes, Curl, Noise, Frizz, Roll e Clump. Entrambe le candidate corte dichiarano:

- superficie: `Human`;
- UV di superficie: `UVMap`;
- nessuna mesh statica, armatura o peso sul rig CGTrader.

## Test di esportazione

E' stato selezionato `basic_short_hair` nel file originale e si e' esportato GLB. Il risultato e' un file da **132 byte**; alla reimportazione contiene **0 oggetti e 0 triangoli**. Il formato `CURVES` Geometry Nodes non e' esportato dal glTF exporter in una mesh mobile utilizzabile.

## Decisione

**RIFIUTATO come libreria immediata.** Le due silhouette corte sono un riferimento visivo migliore delle raccolte di mesh provate finora, ma il pacchetto e' uno strumento Blender sperimentale, ancorato alla topologia MakeHuman e non esportabile direttamente nel runtime Korward.

Per derivarne un asset servirebbe authoring dedicato: trasferimento/ripettinatura delle guide sulla testa CGTrader, conversione controllata in cards/mesh, texture e LOD, pesi a `head.x`, esportazione GLB e review in quattro viste piu' una clip. Non viene eseguito questo passaggio nel runtime e nessun elemento del pacchetto viene promosso.
