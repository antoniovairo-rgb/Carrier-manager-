# Gate Vitruvian CC0 — 22 settembre 2026

## Provenienza e licenza

Sorgente temporaneo sottoposto ad audit: [VitruvianGodot](https://github.com/ibrews/VitruvianGodot). Il `NOTICE.md` del repository dichiara testa, morph FACS e texture **CC0**; il codice e gli shader sono MIT. Nessun file del candidato e' stato copiato nel repository Korward, caricato nel runtime o pubblicato.

## Misura diretta dei GLB distribuiti

| Componente | Triangoli | File | Skin / animazioni | Osservazione |
| --- | ---: | ---: | --- | --- |
| Volto | 36.696 | 10.189.832 byte | nessuna skin, nessuna animazione | FACS e occhi separati; richiede collegamento al corpo |
| Corpo + abiti civili | 106.084 | 6.879.364 byte | 52 joint Mixamo, 6 clip | rig anatomico promettente, ma oltre il budget Hero |
| Capelli riggati | 242.720 | 37.694.332 byte | 6 joint, nessuna clip | haircards con catena fisica, ma sproporzionati |
| **Combinazione minima** | **385.500** | **54.763.528 byte** | componenti separati | nessun kit da calcio |

Le sedici texture esterne sono soprattutto 2K. La loro stima RGBA decodificata e' `202.375.168` byte, circa **193 MiB**, senza texture per un eventuale kit.

## Gate Korward

- **Volto adulto e FACS:** promettente, ma non ancora provato nel nostro runtime.
- **Capelli:** tecnicamente haircards e non fili geometrici; il solo asset distribuito e' pero' 242.720 triangoli e non e' utilizzabile per mobile.
- **Rig/animazione:** il corpo ha un rig Mixamo da 52 joint e sei clip; non contiene il dribbling Korward, non e' stato retargettato e non e' una prova di sincronismo palla.
- **Kit e varianti:** abiti civili soltanto; nessun kit da calcio, barba o libreria di tagli effettivamente pronta.
- **Mobile:** fallisce il gate raw per geometria e texture prima di ogni integrazione.

## Decisione

**Rifiutato come sostituto runtime.** Per usarlo servirebbe ricostruire da zero il kit, ridurre drasticamente corpo/capelli/texture, unire o collegare testa e corpo e rifare il retarget delle clip. Il costo tecnico e' maggiore della soluzione attiva. Resta una fonte CC0 interessante per l'architettura di volto/FACS, non un modello da adottare nella POC.
