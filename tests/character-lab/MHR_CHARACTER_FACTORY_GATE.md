# Gate MHR / Character Factory — 22 settembre 2026

## Asset e licenza verificati

Gli asset locali `mhr-v1.0.1-assets` riportano licenza Apache-2.0 e includono sette FBX LOD. Character Factory 0.1.2 dichiara anch'esso Apache-2.0; l'output promesso e' un GLB riggato con corpo, kit, capelli e 72 morph facciali. Non e' stato installato o generato alcun personaggio.

## Audit diretto degli FBX MHR

| LOD | Triangoli | Vertici | Ossa | Esito potenziale |
| --- | ---: | ---: | ---: | --- |
| 0 | 147.274 | 73.639 | 126 | non mobile |
| 1 | 36.874 | 18.439 | 126 | oltre il budget Hero attivo |
| 2 | 21.318 | 10.661 | 126 | possibile dettaglio medio |
| 3 | 9.794 | 4.899 | 126 | base mobile promettente |
| 4 | 4.918 | 2.461 | 126 | distante |
| 5 | 1.938 | 971 | 126 | distante |
| 6 | 1.186 | 595 | 126 | lontano |

Il `lod3.fbx` e' alto 1,7367 m. Il provino locale con la clip Korward `dribble` trova tutte le 21 ossa mappate; braccia, polsi, gambe, piedi e testa restano con coordinate finite. Le mani percorrono 0,6601 m e 0,4047 m; i piedi 0,4697 m e 0,3207 m. Questa e' solo una prova strutturale: non include palla, radice, texture, kit, hair, morph, resa visiva o telefono.

## Preflight hardware

Character Factory richiede GPU NVIDIA, raccomanda 12 GB di VRAM e scarica 36,4 GB di pesi alla prima generazione. Il computer disponibile riporta **Intel UHD Graphics 620**, 1 GB `AdapterRAM`, e non espone `nvidia-smi`. Non soddisfa il requisito del generatore; nessun download pesante o installazione viene tentato.

## Decisione

**Non adottabile né testabile localmente come generatore completo.** MHR e' tecnicamente interessante: LOD3 e il mapping del dribbling sono i migliori risultati open-source finora. Ma senza GPU idonea non possiamo produrre il GLB con volto, kit, capelli e morph, e la versione 0.1 non fornisce barba/baffi. Non sostituisce il CGTrader; puo' essere rivalutato solo su un host NVIDIA idoneo con un export generato realmente disponibile.
