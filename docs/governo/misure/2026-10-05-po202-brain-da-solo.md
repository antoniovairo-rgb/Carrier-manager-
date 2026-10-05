# PO-202 — la vissuta contro il brain da solo (05/10, base 7.999.136)

Direttiva PO 05/10: «il brain deve decidere tutto durante la partita». Prima di cambiare, la misura.

**Metodo.** 24 partite vissute vere dal salvataggio S12 (autoplay, avversari a rotazione, casa/trasferta alternate), con il
registratore `__CPM_REG202` che annota ogni chiamata al motore. In node (`tools/sonde/po202-brain-da-solo.mjs`):
- **V** = la partita vissuta rigiocata dal registro (24/24 identiche al tabellino registrato);
- **B1x** = IL BRAIN DA SOLO: stessa configurazione di ognuna delle 24 partite (giocatori veri, forze, tattiche), senza la leva
  `fin202`, occasioni dell'eroe riconosciute ed eseguite dal motore (`occasioniV2`, come la simulazione rapida), 20 semi per
  partita = 480 partite;
- **B0x** = come B1x senza occasioni dell'eroe.

| braccio | gol (tua squadra – avversari) | tiri | V / N / P | scarto medio | gol dell'eroe | scene / occasioni eroe |
|---|---|---|---|---|---|---|
| V vissuta oggi (24) | 1,63 – 0,67 | 15,3 – 6,9 | 58% / 17% / 25% | +0,96 | 0,88 | 6,6 |
| B1x brain da solo (480) | 1,19 – 0,82 | 10,6 – 9,8 | 45% / 27% / 28% | +0,36 | 0,36 | 6,2 |
| B0x senza eroe (480) | 1,05 – 0,85 | 9,7 – 9,5 | 40% / 30% / 29% | +0,20 | 0,24 | 0 |

**Lettura.**
- Il numero di scene è lo stesso (6,6 contro 6,2): non sono troppe.
- Ogni scena nella vissuta rende circa 2,4 volte quella del brain (0,88 contro 0,36 gol dell'eroe): l'esito viene da `probEroe`,
  che tratta la scena da «buona occasione» (0,10 + 0,8·xG, fino a 0,45), mentre il brain esegue il tiro con la sua fisica
  (l'xG del punto, come per gli altri 21).
- La vissuta ha 4,7 tiri in più per la tua squadra e 2,9 in meno per gli avversari: la scena si aggiunge al motore invece di
  sostituirne un'azione, e durante la scena gli avversari non giocano.
- Le quattro correzioni del 7.999.129-132 (`fin202`, `rip202`, recupero dei tick, 93') abbassano lo scarto ma non lo chiudono.

**Cosa non è misurato.** Le partite sono in autoplay (scelte seedate), non scelte di un giocatore umano. Un salvataggio solo (S12,
eroe OVR 93, squadra forte): per una squadra debole i numeri cambiano.
