# PO-220 — scene difensive in partite vere, GLB acceso (collaudo, sola lettura)

Build GAME_VERSION **7.999.157** · salvataggio `save-190-s12-ovr93.json` · nome partita `Samuelito Vairo k` (k=1..22) · autoplay `seeded` · **GLB acceso** (default CH38, nessun `__CPM_GLB`) · `__CPM_PRESENT=1`.
Sonda: `po220-difesa.mjs`. Dati grezzi: `po220-a.jsonl` (partite 1–12), `po220-b.jsonl` (13–22). Aggregato per scena con i sei fotogrammi campionati: `po220-aggregato.json`.

## Campione
- **22 partite, 22 scene difensive** (`__CPM_CAST219.tipo === 'difesa'`), 0 errori.
- **Ogni partita ha esattamente una scena difensiva.** Nelle 22 partite PO-221 sul salvataggio S12 le difese sono 56 su 512 scene (≈ 0,9 a partita); qui 22 su 22. **Non posso confermare la causa**: può dipendere dal seme (nomi k=1..22), dal fatto che il GLB sia acceso (il tempo di scena rallenta, e questo cambia cosa il gioco accumula), o da un vincolo del generatore. Non l'ho verificato.
- Campionamento: fotogrammi ogni ~120 ms durante `hl_*` (30–50 per scena in headless). Dai fotogrammi estraggo sei punti equispaziati per scena (campo `sei_frame`).

## Domanda del PO: l'eroe arriva sul portatore e fa un gesto vero, o corre e basta?

Distanza eroe–portatore in unità 3D (`__CPM_STATE`, portatore = `port` del cast):

| Misura | Mediana / media | Scene entro 4 u |
|---|---|---|
| All'apertura della scena | media 10,7 · mediana 11,9 | — |
| Minimo durante la scena | media 4,0 | **14 / 22** |
| Al picco del gesto GLB (gw massimo) | mediana ≈ 6,7 | **7 / 22** |

**Lettura.** Nella maggior parte delle scene l'eroe arriva in prossimità del portatore almeno per un fotogramma (14/22), ma **nel momento del gesto è più lontano**: solo 7 scene su 22 hanno il gesto entro 4 u, con mediana ≈ 6,7 u. Il dato non risponde del tutto alla domanda del PO: in molte scene il gesto parte mentre l'eroe è ancora a 6–25 u.

Gesto GLB nel fotogramma di picco (`__CPM_GESTURE().glb.gName`, peso `gw`):
- **Clip presente: 15 / 22** — `kick` 11 · `tackle` 2 · `receive` 1 · `shortPass` 1. Peso di picco 0,36–1,00, in 16 scene ≥ 0,74.
- **Nessuna clip GLB: 7 / 22** (`gName` null) — è il caso più vicino a una «passeggiata» (corsa senza gesto). In queste 7 scene la distanza minima media è 3,8 u, quindi l'eroe ci arriva ma non fa un gesto.
- Confronto: con clip, distanza minima media 4,1 u · senza clip 3,8 u. **La clip non dipende dalla vicinanza.**

Gesto deciso (`__CPM_RES218.defGesto`): **lunge 17 · slide 5**. Nessuna scena «press».

Esiti (`key`): recovery 10 · foul 7 · through 5.

## Due incoerenze da segnalare
1. **Gesto deciso e clip non coincidono in modo leggibile.** Il gesto deciso è `lunge`/`slide`, ma la clip più frequente è `kick`. Non posso confermare dal build quale clip corrisponda a `lunge` o `slide` (non l'ho trovata nelle righe che ho letto): quindi non posso dire se `kick` è la clip della scivolata o un'altra azione. **Non posso confermarlo.**
2. **`receive` e `shortPass` in una scena difensiva** (partite 3 e 4): nomi di clip da passaggio, non da difesa. Va verificato se il GLB ha scelto una clip non difensiva.

## Limiti
- 22 scene sono un campione piccolo: le medie valgono per queste scene, non per tutte le partite.
- Il tempo di scena in headless GLB-acceso rallenta; i tempi assoluti non sono confrontabili con il telefono. Le distanze sono spaziali, quindi reggono meglio.
- La distanza è misurata sulle posizioni 3D (`__CPM_STATE`); per la regola della collaudatrice (`__CPM_OWN`) resta da incrociarla con le mesh, che non ho fatto.
