# Gate trial Human Generator

## Scopo

Verificare **solo** se Human Generator V4.0.28 funziona con Blender 4.5.14 LTS e produce un candidato tecnico esportabile per Korward. Non autorizza l'uso della trial nel gioco, un acquisto, una pubblicazione o una modifica a `main`.

## Isolamento

- Configurazione Blender dedicata: `tests/character-lab/.humgen-trial-config`.
- Output di prova: `tests/character-lab/humgen-trial-output/`.
- Nessuna modifica alla configurazione Blender ordinaria, agli asset runtime, a GitHub Pages o alle route esistenti.
- Non attivare l'updater dell'add-on e non eseguire script provenienti dai file trial oltre alle normali registrazioni dell'add-on necessarie per il suo pannello.

## Input verificati

| File | Origine | Dimensione |
|---|---|---:|
| `HumGen3D_v4_0_28.zip` | URL ufficiale Human Generator | 5.059.083 byte |
| `HG_Trial_Content.hgpack` | URL ufficiale Human Generator | 269.224.756 byte |

La trial sblocca il solo preset maschile `Caucasian 1`; le texture watermark sono accettabili esclusivamente per un audit, mai per un artefatto da distribuire.

## Sequenza di collaudo

1. Installare add-on e content pack nel profilo isolato.
2. Avviare Blender 4.5.14 e verificare che il pannello HumGen si registri senza eccezioni.
3. Creare il preset maschile disponibile in posa neutra.
4. Applicare un'acconciatura inclusa e convertirla in haircards a qualità intermedia.
5. Ridurre le texture a 1K, fare bake ed esportare GLB isolato.
6. Reimportare il GLB in Blender e ispezionare mesh, armature, materiali, texture, triangoli e silhouette del volto/capelli.
7. Solo se i punti precedenti passano: valutare in un secondo step il retarget Mixamo, il kit e il dribbling. Nessun asset trial entra nel renderer prima di una licenza commerciale e di un audit di integrazione separato.

## Pass

- Nessuna eccezione durante installazione, creazione, haircards, bake, export o reimport.
- GLB con geometria e armatura valide; nessuna texture/mesh mancante.
- Capelli leggibili come capelli a distanza Hero senza calotta, filamenti sospesi o artefatti gravi.
- Asset LOD e texture compresi in un budget da misurare, senza promesse basate sulle sole specifiche del venditore.

## Fail

- Add-on non registrabile in Blender 4.5.14.
- Haircards, bake o export non disponibili o con errore.
- Volto/capelli troppo artificiali, materiale difettoso, rig non esportabile o budget non credibile.

Un FAIL chiude il candidato Human Generator senza spesa e lascia CGTrader come base corrente.
