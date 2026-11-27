# Rapporto giro 437 — i gol dell'eroe, voce per voce (PO-628)

Ramo `sviluppo/giro437-gol-eroe-coerenza`, partito da `main` (= 7.999.218). `GAME_VERSION` e `docs/governo` non toccati.

## La voce

Decisione PO nel questionario del 22/11 (dubbio 4 del giro 325): sui gol dell'eroe in scena si fa lo stesso confronto voce
per voce che `marcatore-325` fa già sui gol ambientali, allargando quel guardiano. Si confrontano la riga «X segna su assist
di Y», la pagella e i momenti chiave. Sull'assist nell'avviso del gol: «Lascia così» (non toccato).

## Misura prima di correggere

Sonda `tests/visual/misura-437.mjs`: partite vere a soli highlight, corpi accesi (GLB), autoplay a seme fisso, nomi diversi =
partite diverse. Per ogni partita legge la cronaca alla sorgente (`__CPM_CRO802`), i momenti chiave a schermo, le pagelle del
motore (`__CPM_MOTORE_OBJ().pagelle()`).

Base (= 7.999.218), 16 partite: **7 gol dell'eroe** (3 «su assist di») e **13 assist dell'eroe**.

| caso | casi | discordanti | cosa non tornava |
|---|---|---|---|
| A — gol dell'eroe «su assist di Y» | 3 | **3 su 3** | riga e momenti chiave nominano Y (Pellegrini, Ferrari, Lombardi); il motore scrive il gol con `assist:null`, quindi Y non ha l'assist in pagella né nel tabellino |
| B — assist dell'eroe | 13 | **3 su 13** | la riga dice «Pellegrini segna» (o Colombo, Bruno) e la pagella dà quel gol a un altro compagno |
| gol dell'eroe senza assist | 4 | 0 | — |

Esempi misurati sulla base:

- 20' «⚽ Eroe122 segna su assist di Pellegrini! 1-1.» · momento chiave «Tuo gol al 20' (assist di Pellegrini)» · pagella:
  Pellegrini senza assist.
- 20' «⚽ Pellegrini segna su assist di Eroe105! 1-0.» · momento chiave «Assist per Pellegrini» · pagella: Colombo 2 gol,
  Pellegrini nessuno.

## Dove i nomi si separavano

`src/15-live-match.jsx`, `handleAction`, e `src/14-motore-possesso.jsx`, `risolviEroe.eventi`:

1. **A**: per il gol dell'eroe il gioco sceglie l'assistman con un sorteggio a seme sulla rosa (66% dei gol, `_assistBy`) e lo
   scrive in riga e momento chiave; il motore, che conta pagella e tabellino, scriveva sempre `assist:null`.
2. **B**: per l'assist dell'eroe, quando il cast della scena non ha un ricevente, il gioco sceglie il compagno con lo stesso
   sorteggio (`_assistTo`); il motore faceva segnare il compagno più vicino all'eroe. Due persone diverse.

## Correzione (alla fonte, rosso `window.__CPM_NO_G437`)

- Il gioco passa al motore il nome che ha scelto (`nome437`). Il motore lo cerca fra i compagni **in campo**: se c'è, è lui
  (assist sul gol dell'eroe, marcatore sull'assist); se non c'è (il sorteggio pesca dalla rosa, non dal campo), resta il
  compagno più vicino. Nessun `rnd()` nuovo nel motore: la partita non si sposta.
- Subito dopo, il gioco **rilegge dal fatto del motore** chi ha segnato e chi ha servito, e da lì scrivono riga, momento
  chiave e collegamenti dell'assist (`assistLinks`). Una sola fonte: il fatto che conta pagella e tabellino.
- Due testimoni solo-collaudo: `__CPM_G437` (il fatto del motore sul gol/assist dell'eroe, in entrambi i bracci) e
  `__CPM_MOM437` (ogni momento chiave alla sorgente, dentro `pushMatchEvent`).

## Guardiano: `marcatore-325` allargato

Oltre ai gol ambientali, per ogni gol/assist dell'eroe in scena: riga, momento chiave, fatto del motore e, a fine partita,
pagella. Discordanza = riga e momento chiave con marcatore o assist diversi (o uno dei due assente) · il motore con un altro
marcatore o assist · in pagella chi la riga fa segnare/servire ha meno gol/assist di quelli raccontati in scena. Senza
copertura (almeno 6 gol/assist dell'eroe, di cui 1 «su assist di»): non giudicato = rosso. Corpi accesi. Il braccio rosso arma
`__CPM_NO_G325` e `__CPM_NO_G437` e le due famiglie si giudicano ognuna da sé.

Partite per braccio da 8 a 16 (con 8 i gol dell'eroe erano 4-5 per braccio, sotto la copertura), due pagine insieme
(`CPM_PAR325`). Riga `src/15` della MAPPA invariata; aggiunto `marcatore-325` anche alla riga `src/14`, perché la correzione
tocca il motore.

| braccio | partite al fischio | gol ambientali · discordanze | eroe in scena · discordanze |
|---|---|---|---|
| verde | 16/16 | 28 · **0** | 6 gol (1 su assist) + 4 assist · **0** |
| rosso `__CPM_NO_G325`+`__CPM_NO_G437` | 16/16 | 28 · **25** | 6 gol (1 su assist) + 4 assist · **4** |

Discordanze del rosso sull'eroe: 47' «Bruno segna» contro motore FERRARI (e Bruno senza gol in pagella) · 61' «segna su assist
di Scotti» contro motore senza assist (e Scotti senza assist in pagella). Durata: ~23 minuti per i due bracci.

## Controlli

Tutti sul ricomposto di questo ramo (`node tools/build-src.mjs` + `node tools/check-src.mjs`: 21 frammenti, differisce da HEAD
solo per la modifica del giro), `CPM_CHROME=/opt/pw-browsers/chromium`.

| controllo | esito |
|---|---|
| `npm run marcatore-325` (due bracci, 16 partite ciascuno, corpi accesi) | **verde** (esito nella tabella sopra) |
| `node ci-runner.mjs giro marcatore-325` | **18/18 verdi** (marcatore-325 1328 s · mappa-unica · test:logic · save-compat · replay 54 s · migrazione-194 · design-system · tema-unico · griglia-mobile 206 s · render-3d-023 · tunnel-285 214 s · home-298 · web-237 · career-critical 329 s · battito-264 391 s · partita-vera 599 s · gk-dive-sync 182 s · schermate-97) |
| `npm run mappa-unica` (dopo l'aggiunta alla riga `src/14`) | verde |
| guardiani vicini (`assist-nome-98`, `gol-eroe-154`, `pagella-75`, `assist-298`) | VICINI |

Le foto di `docs/collaudo-grafico/` rigenerate dalle sentinelle e `docs/governo/STABILITA.json` scritto dal runner sono
state rimesse com'erano (`docs/governo` non si tocca in questo giro).

## Limiti dichiarati

- I gol dell'eroe su **piazzato** (rigore, punizione: percorso `setpiece` del libro mastro, 1 per braccio) non passano da
  `risolviEroe.eventi` e non hanno la riga «X segna»: sono contati, non confrontati.
- Nel ramo «passaggio» del motore un `goal` con ricevente dal cast fa segnare il ricevente con l'assist dell'eroe, mentre il
  gioco dice «Tuo gol». In 32 partite non è mai comparso; se compare, il guardiano lo vede come discordanza (rosso).
- Un assist dell'eroe nel recupero, a partita finita entro 140 ms, può restare senza riga «X segna» (visto una volta su 16
  partite della sonda, 92'): il guardiano lo dichiara non giudicato.
- La copertura dei gol «su assist di» è sottile: 1 per braccio sulle 16 partite del guardiano (3 sulle 16 della sonda).
- Nel giro del guardiano i risultati dei due bracci coincidono in 16 partite su 16: la correzione non sposta la partita. In una
  corsa di prova con i due bracci in due processi paralleli (banco più carico) una partita su 8 era diversa (2-1 contro 1-1);
  non l'ho attribuita con una misura.

## Dubbi per il PO

1. **Chi è l'assistman del gol dell'eroe** (applicata): lo sceglie il gioco col sorteggio di sempre, il motore lo prende se è
   in campo, altrimenti è il compagno più vicino; da lì tutte le voci. Alternative:
   - (b) l'assistman lo sceglie solo il motore (compagno più vicino o ultimo passatore), senza sorteggio sulla rosa;
   - (c) il sorteggio pesca solo fra i compagni in campo (oggi può nominare un panchinaro, che poi viene sostituito).
2. **Copertura del guardiano** (applicata: 16 partite per braccio, ~23 minuti). Alternative: (b) 24 partite per avere almeno
   2-3 gol «su assist di» per braccio (~35 minuti); (c) una scena provocata che garantisce un gol dell'eroe con assist, accanto
   alle partite vere.
3. **Gol dell'eroe su piazzato** (applicato: solo contati). Alternative: (b) dargli la sua riga «X segna» e metterlo a
   confronto; (c) lasciarli fuori in modo dichiarato anche dal conteggio.
4. **Il ramo «passaggio» con `goal`** (applicato: lasciato com'è, il guardiano lo vede se compare). Alternative: (b) farlo
   segnare all'eroe anche nel motore; (c) cambiare la riga del gioco in «X segna su assist dell'eroe».
