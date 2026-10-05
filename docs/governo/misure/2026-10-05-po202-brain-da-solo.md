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

## Seguito 05/10 — 7.999.137, il brain decide la scena (24 partite vere per ogni passo)

Decisione PO: «talento nel brain» (un solo parametro nel motore). Passi misurati, ciascuno su 24 partite vere S12 rigiocate dal registro
(24/24 identiche), strumenti in `tools/sonde/` (`po202-brain-da-solo.mjs`, `intento137.mjs`, `abl137.mjs`, `fermo137.mjs`, `cal137.mjs`).

| passo | gol (tua – avv.) | tiri | V / N / P | gol eroe (pagelle) | gol eroe dalle scene | scene |
|---|---|---|---|---|---|---|
| 7.999.136 (riferimento) | 1,63 – 0,67 | 15,3 – 6,9 | 58% / 17% / 25% | 0,88 | — | 6,6 |
| scena giocata dal motore, K=3, scene dalle occasioni naturali | 2,21 – 1,00 | 16,0 – 7,5 | 63% / 29% / 8% | 1,67 | 1,38 | 8,5 |
| K=1 | 1,71 – 0,83 | 15,4 – 7,1 | 63% / 17% / 21% | 0,96 | 0,75 | 8,5 |
| K=1 + ripresa dell'avversario dopo tiro fuori/parato/pallone perso (7.999.137) | 1,50 – 0,63 | 15,7 – 6,5 | 58% / 25% / 17% | 0,67 | 0,46 | 8,0 |
| brain da solo, K=1 (120 partite) | 1,29 – 0,84 | 10,2 – 9,9 | 48% / 23% / 29% | 0,42 | — | 6,4 |

Cosa è cambiato nel gioco:
- **Talento nel brain** (`TAL202_K`, `esitoTiroV2`): i tiri dell'eroe valgono 1+K·(OVR−60)/40 volte (K=1 → ×1,8 a OVR 93). Tarato sulla
  vissuta, dove il giocatore tira a ogni occasione: K=3 (tarato sulla simulata) dava 1,38 gol dalle scene.
- **La scena la gioca il motore** (`giocaScena`): tiro e assist decisi da `esitoTiroV2` dal punto in cui il motore ha visto l'occasione,
  con difensori, portiere, talento e gestione del vantaggio; punizione dall'origine = punizione diretta (xG ≤ 0,06), cross/angolo = testa.
- **Le scene nascono dalle occasioni naturali del motore** (la regola della simulazione rapida): la richiesta di scena non dà più
  bonus all'eroe (+26 ricevente, +30 cross) e non apre più la scena dopo 14 minuti.
- Ritirati `fin202` e il debito di xG delle scene. Restano: il motore che gioca il minuto della scena (decisione PO 04/10), il recupero
  (c'è anche nella simulata), la ripresa dell'avversario dopo tiro fuori/parato o pallone perso (regola del calcio; spenta per errore in
  un passo intermedio, misurato: il pallone restava alla tua squadra 2,8 volte a partita dopo un tiro sbagliato).

**Aperto (passo successivo).** Gli avversari tirano 6,5 volte contro le 9,9 del brain da solo. Ablazione sul registro: le richieste di
«origine» (cross/angolo/punizione verso l'eroe che diventano scena mentre nel motore l'azione prosegue) tolgono circa 2 tiri, il motore
fermo durante la scena (6,8 minuti a partita, recuperati dopo) altri 2. I tiri in più della tua squadra (15,7 contro 10,2) sono le scene:
nella vissuta ogni scena offre un tiro o un assist, il motore da solo tira solo quando conviene.

## 7.999.138 — fermo sull'occasione e tempo restituito (decisione PO «correggi entrambe»)
| passo | gol (tua – avv.) | tiri | V / N / P | gol eroe dalle scene | minuti di motore giocati |
|---|---|---|---|---|---|
| 7.999.137 | 1,50 – 0,63 | 15,7 – 6,5 | 58% / 25% / 17% | 0,46 | 84,5 |
| 7.999.138 | 1,58 – 0,92 | 13,9 – 9,7 | 54% / 21% / 25% | 0,83 | 87,4 |
| brain da solo | 1,29 – 0,84 | 10,2 – 9,9 | 48% / 23% / 29% | — | 94 |

Gli avversari tornano al livello del brain da solo (tiri 9,7 contro 9,9, gol 0,92 contro 0,84). La tua squadra resta sopra di +0,3 gol: sono le
scene, dove il giocatore sceglie sempre una giocata da gol. Il «la scena dura e il resto del campo gioca» non è stato fatto alla lettera:
sarebbero state due azioni contemporanee (gli avversari che attaccano mentre il pallone è dell'eroe in scena); il tempo si restituisce dopo.

## Controllo con squadra debole (7.999.138)
Stessa sonda, forze 72 contro 88 (`__CPM_FORZA19`) ed eroe OVR 75 (statistiche ×0,8), 24 partite vere contro 120 del brain da solo.

| | gol (tua – avv.) | tiri | V / N / P | gol eroe |
|---|---|---|---|---|
| vissuta 7.999.138 | 0,88 – 1,67 | 9,8 – 15,5 | 17% / 21% / 63% | 0,33 |
| brain da solo | 0,43 – 1,79 | 5,1 – 17,3 | 9% / 20% / 71% | 0,21 |

Come con la squadra forte: gli avversari sono vicini al brain da solo, la tua squadra guadagna circa +0,3/+0,45 gol dalle scene, dove il
giocatore sceglie la giocata. Questo scarto è la scelta del giocatore, non una correzione: nessuna leva compensa più nulla nella vissuta.
