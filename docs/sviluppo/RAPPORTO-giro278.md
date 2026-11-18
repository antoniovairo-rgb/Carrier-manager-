# Rapporto giro 278 — `analisi-217` (B1 «Entra in campo») nella 197

Ramo `sviluppo/giro278-analisi` da `lavoro/197` (2ba9c7cc). Lotto 197 chiuso: toccato solo questo controllo.
Decisione PO 18/11 14:10 (PO-516): un rosso nato nella 197 si ripara prima dell'uscita.

## Esito

| | 7.999.196 (origin/main 3076a1b7) | 197 prima (2ba9c7cc) | 197 dopo (3ea55f37) |
|---|---|---|---|
| `analisi-217` verde | VERDE (dalla verifica V1b) | **ROSSO 2 su 2** (verifica V1b) e ROSSO 1 su 1 nella sonda di questo giro | **VERDE 2 su 2** |
| B1 a 412×915 | top 827 · bottom 875 · ultimo blocco | `null` | top 827 · bottom 875 · ultimo blocco |
| B1 a 360×780 | trovato (V1b) | `null` | top 692 · bottom 740 · ultimo blocco |
| braccio rosso `CPM_ROSSO=1` (`__CPM_NO_PRE217`) | — | — | **ROSSO** (V1 493/339 px, G1, M1) |
| `test:logic` | — | — | 51 pass · 0 fail |
| `save-compat` | — | — | 12 pass · 0 fail |

`src/` non toccato: niente `build-src`/`check-src`, niente guardiani della mappa, niente `GAME_VERSION`.
Le foto e i `misure-*.json` rigenerati in `docs/sviluppo/foto/analisi217/` sono stati rimessi con `git checkout --`.

## Causa (misurata)

Sonda temporanea sullo stesso percorso del guardiano (carriera U18 → pre-partita → «Analisi dell'avversario»), che stampa
i tasti del contenitore `[data-cpm=analisi217]`:

| braccio | `innerText` | `textContent` | `textTransform` | `/Entra in campo/` su innerText | esito guardiano |
|---|---|---|---|---|---|
| 197 così com'è | «ENTRA IN CAMPO» | «Entra in campo» | `uppercase` | false | ROSSO (B1 `null`, 2 taglie) |
| 197 con `__CPM_NO_G235` | «Entra in campo» | «Entra in campo» | `none` | true | VERDE |

L'ipotesi della verifica V1b è confermata: il tasto c'è, è l'ultimo blocco ed è in vista; la ricerca del controllo era
sensibile alle maiuscole e leggeva il testo **reso** (`innerText` applica `textTransform`).

**Commit che lo fa nascere:** `5fe24f5e` (giro 235, PO-457/458), che introduce `stileTasto235`
(`src/11-ui-kit-highlight.jsx:95`, `textTransform:"uppercase"`) e lo applica a `Btn v="primary"` (`:112`). Non è in
`origin/main`, quindi il rosso è nato nella 197.

**Decisione già presa:** PO-458 (G195-11+12+13, un solo stile per il tasto principale, regola scritta da PO-411:
«pieno nel colore del club, carattere TV maiuscolo»), realizzata dal giro 235 (`docs/sviluppo/RAPPORTO-giro235.md`,
sezione «PO-458 — tasto principale»). Nota: la consegna cita PO-457; la voce del tasto in maiuscolo è PO-458 (PO-457 è il Profilo in gruppi).

## Correzione

`tests/visual/analisi-217.mjs`: `/Entra in campo/.test(b.innerText)` → `/Entra in campo/i.test(b.textContent)`, con
commento che cita il giro 235/PO-458. Nessuna soglia toccata; le altre misure leggono `innerText` solo per le etichette dei
messaggi.

## Altre sonde che confrontano `innerText` di tasti in modo sensibile alle maiuscole (NON corrette, fuori lotto)

Ricerca con regex in `tests/visual/*.mjs` (esclusi `archivio/`, `out/`, `node_modules/`): regex senza flag `i`, con lettere
minuscole, applicate a `innerText` di un tasto.

| file:riga | confronto | in `package.json` | rischio |
|---|---|---|---|
| `po217-scout-test.mjs:39` | `/Entra in campo/.test(b.innerText)` | no (sonda storica del giro 30) | stesso difetto; ha il ripiego `c.lastElementChild`, quindi non cade ma può misurare il blocco sbagliato |
| `misura-233.mjs:60` | `/Salta/.test(b.innerText)` (tasto «Salta» dell'intro) | sì (`misura-233`) | se «Salta» è un tasto primario in maiuscolo, `salta` resta falso |
| `home-066.mjs:61` | `/^(Chiudi\|Più tardi\|Ho capito\|Continua\|OK\|Ok)$/` su `innerText` dei tasti nei dialoghi | sì (`home-066`) | un tasto primario in maiuscolo («CONTINUA», «HO CAPITO») non viene chiuso dalla sonda |

Non ho misurato se queste tre siano oggi rosse: solo la ricerca statica.

## Dubbi per il PO

1. **Le tre sonde qui sopra** (soprattutto `misura-233` e `home-066`, che sono nel `package.json`): vanno adeguate allo
   stesso modo nella 198? Non le ho toccate perché fuori dal lotto 197.
2. **Il braccio rosso di `analisi-217` non esercita B1 da solo:** `__CPM_NO_PRE217` riporta la schermata vecchia e il
   guardiano cade per V1/G1/M1, mentre B1 resta trovato (top 851 · bottom 899 a 412). È così dalla nascita del guardiano
   (giro 30); un rosso dedicato a B1 (tasto spostato sopra o fuori schermo) sarebbe una modifica del gioco, fuori lotto.
3. La consegna cita PO-457 per i tasti in maiuscolo: dal rapporto del giro 235 la voce è **PO-458** (PO-457 è il Profilo).
   Ho citato PO-458 in DECISIONI.md; da confermare.
