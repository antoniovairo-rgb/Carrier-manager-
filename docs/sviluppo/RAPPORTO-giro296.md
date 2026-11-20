# Rapporto giro 296 — rigori di coppa: cerimonia, nome corto, ripartenza dopo il rigore del compagno

Ramo `sviluppo/giro296-rigori-coppa` da `lavoro/198` (b3b75b9d, 7.999.198). `GAME_VERSION` non toccato.
Decisioni PO del 18/11 20:30: PO-534, PO-535, PO-536. Confronto con la 7.999.196 pubblicata (3076a1b7).
Rosso unico delle correzioni: `window.__CPM_NO_G296`. Guardiano nuovo: `npm run rigori-296`.

## Tabella «196 / 198 prima / dopo»

| Cosa | 7.999.196 (3076a1b7) | 198 prima (b3b75b9d) | 198 dopo (questo ramo) |
|---|---|---|---|
| **PO-534** durata della cerimonia della coppa dopo i rigori, PC in trasferta, orologio della pagina | 17,7 s senza carico · 18,3 s col carico di foto della sonda | 19,6 s col carico | 19,3 s e 19,9 s (B4, due corse), la chiude il timer |
| stessa cerimonia: quando la SONDA la vede cominciare | 8,1 s dopo l'inizio vero (col carico) | 7,1 s dopo (col carico) | non più usato: la durata si legge dal testimone del gioco |
| cerimonia in casa / in trasferta, PC / telefono | non misurato | non misurato | 18,1 – 20,2 s nelle quattro corse (B1–B4, due giri), sempre «timer» |
| **PO-535** striscia in alto a 375×667 (finestra stretta, mouse), in cerimonia, eroe in trasferta | non misurato qui (il giro 272 dice «SLR SLR» su 196 e 197) | stemma «SLR» + nome «SLR» (sigla doppia) | stemma «SLR» + nome «Salernum» |
| stessa striscia, telefono col tocco | non misurato | «FC Salernum 1919» intero (la casella è larga 113–121 px) | invariato: intero |
| **PO-536** dopo il rigore segnato da un compagno: giocatori nella metà sbagliata alla battuta / passi di palla ferma | non misurato (il braccio non esisteva) | 5 e 7 fuori · 2 passi (2 corse) | 0 fuori · 11 passi; col rosso 7 fuori · 2 passi |
| ripresa dal centro con la palla a chi ha subito | — | sì (già giusta) | sì |

## PO-534 — chi chiude la cerimonia

**Nessuno la chiude prima: la cerimonia dura quanto deve.** Non ho corretto niente nel gioco.

- Ho messo un testimone provvisorio su ogni cambio di fase (con la pila delle chiamate). Su PC in trasferta la fase passa a `ended` dal timer della cerimonia (`ceremonyEndRef`, 17,5 s), 19,4 s dopo l'inizio. Nessun altro punto del codice la chiude.
- Ho poi misurato con un registro **dentro la pagina** (cambi di fase ogni 25 ms, orologio della pagina), sulla 196 e sulla 198: 17,7 – 19,6 s.
- I «2–6 s» del giro 272 erano dell'orologio della sonda. La sonda-214 fa foto a coppie durante la serie; con lo stesso carico la mia sonda ha visto la cerimonia 7,1 s (198) e 8,1 s (196) dopo che era cominciata. Alla sonda-214 restavano quindi pochi secondi di cerimonia da vedere. **Non ho rifatto la misura con la sonda-214 vera**: il ritardo che riporto è quello della mia sonda con un carico simile, non il suo.
- Nel gioco ho aggiunto solo un testimone senza effetti, `__CPM_CER296`: inizio, durata prevista, fine, chi chiude («timer», «salta», «altro»).
- Guardiano, parte B: durata ≥ 17.000 ms, fase dopo `ended`, la chiude il «timer», in casa e in trasferta, su PC (1366×768) e su telefono (375×667). **Rosso della durata provocato dalla sonda** (non c'è una correzione da spegnere): la sonda preme Invio 3 s dopo l'inizio, cioè la strada vera del «Salta»; la durata scende a 3,9 s, chiude «salta», e il giudizio cade.

Durata giudicata: quella del testimone (parte dallo stesso istante del timer). Il registro della pagina la conferma da fuori (stessa fine entro 1 s) ma vede l'inizio 0,4–2,0 s dopo, perché il primo fotogramma della cerimonia è pesante: la sua durata (17,97–18,48 s) è più corta di quella vera e non la uso come soglia.

## PO-535 — nome corto

- Tabella `CLUB_CORTI_296` in `src/02`, accanto alla tabella dei nomi (`CLUB_NOMI_251`). Regola: il nome senza la sigla societaria in testa (FC Granata → Granata) se è di 10 caratteri o meno; altrimenti la riga della tabella. 252 club: tutti con un nome corto, al massimo 10 caratteri, tutti diversi fra loro.
- Il nome corto è un gradino nuovo della scala `NomeSquadra182`, **subito prima della sigla**: intero → abbreviato → senza «FC» → nome corto → sigla. Nella striscia della partita (prop `adatta`) il nome corto prova anche a stringere il corpo fino a 12 px prima di cedere alla sigla.
- Vale anche per le Primavera/U19 (stesso nome corto del club) e per i club dei salvataggi (si cerca per nome).
- Le Nazionali non hanno un nome corto: la loro scala resta quella di prima.

**I 30 nomi corti scritti a mano (gli altri 222 sono il nome senza «FC»):**

| Club | Nome corto | | Club | Nome corto |
|---|---|---|---|---|
| FC Biancocelesti | Celesti | | FC Rotterdam Spangen | Spangen |
| FC Sampierdarena | Sampierd. | | FC Rotterdam Kralingen | Kralingen |
| Manchester Rovers | Rovers | | FC Bruxelles Sud | Brux. Sud |
| FC Wolverhampton | Wolverh. | | FC Sint-Truiden | St-Truiden |
| FC Ría de Vigo | Ría Vigo | | FC Anversa Sud | Anversa S. |
| FC Madrid Este | Madrid E. | | FC Istanbul Ovest | Ist. Ovest |
| FC Niederrhein | Niederrh. | | FC Catanzarese | Catanzar. |
| FC Berlin Köpenick | Köpenick | | FC Salernum 1919 | Salernum |
| FC Paris Île-de-France | Paris IdF | | FC Sheffield South | Sheffield |
| FC Montpellier | Montpell. | | FC West Bromwich | West Brom. |
| FC Lisboa Norte | Lisboa N. | | FC Hamburg Hafen | Hafen |
| FC Lisboa Ovest | Lisboa O. | | FC Braunschweig | Braunschw. |
| FC Vimaranense | Vimaran. | | FC Valenciennes | Valencien. |
| FC Vila do Conde | Vila Conde | | FC València Nord | Val. Nord |
| FC Foz do Douro | Foz Douro | | FC Famalicense | Famalic. |

**Posti stretti che ora usano il nome corto**: tutti quelli che passano da `NomeSquadra182`, 21 punti. Non ho trovato altri punti del gioco che ripiegano a mano sulla sigla (l'unico, `_nomeBarra108`, vive solo col rosso `__CPM_NO_G182_NOMI`).

- `src/15` partita, 6 punti: striscia in alto (casa e ospiti), barra della partita di prima (casa e ospiti), cartello dell'ingresso in campo (due nomi);
- `src/13` pre-partita e formazioni, 6 punti (righe 200, 1048, 1070, 1072, 1122, 1128);
- `src/17` menu e creazione, 3 punti (righe 324, 538, 763);
- `src/18` carriera, 6 punti (righe 9620, 9756 riga del Calendario, 9900, 12091, 12844 e 12846 calendario delle coppe europee).

Ho guardato sullo schermo solo la striscia in alto della partita. Gli altri 15 punti li ho elencati dal codice, non fotografati.

Il tabellone «CALCI DI RIGORE» resta con le sigle (scelta del giro 216): non l'ho toccato.

## PO-536 — ripartenza dopo il rigore del compagno

- Il controllo che copriva la ripartenza dopo il rigore dell'eroe è `ripartenza-piazzato-27.mjs` (`npm run ripartenza-piazzato`). Braccio nuovo **`compagno`**: stessa richiesta di rigore, senza premio rigorista; il ponte nega il dischetto all'eroe (`ponte257` = 1) e calcia il compagno scelto dal motore. Stesse soglie del rigore dell'eroe: ripresa dal centro con la palla a chi ha subito, al massimo 2 giocatori nella metà sbagliata, almeno 8 passi di palla ferma.
- **Il braccio nuovo era rosso** (2 corse): 5 e 7 giocatori nella metà sbagliata, battuta dopo 2 passi. È lo stesso difetto che il giro 27 aveva tolto per il rigore dell'eroe; la regola stretta del giro 35 schiera solo dopo il gol dell'eroe in scena.
- **Correzione** (`src/15`, accanto alla regola del giro 35): i ventidue si schierano anche quando il gol della squadra dell'eroe arriva da un rigore calciato da un compagno (ultimo tiro del motore: rigore, non dell'eroe, negli ultimi 3 minuti). Dopo: 0 fuori, 11 passi. Col rosso `__CPM_NO_G296`: 7 fuori, 2 passi.
- Il rigore del compagno al 9' è parato (4 corse su 4), quindi il braccio chiede il rigore dall'11' e cambia minuto a ogni tentativo. Dal terzo tentativo la sonda provoca il gol (regola PO-311); nelle corse fatte non è servito: gol vero di SPENCER all'11'.

## File toccati

- `src/02-club-leghe-albo.jsx`: tabella e funzione del nome corto.
- `src/11-ui-kit-highlight.jsx`: gradino nuovo nella scala dei nomi.
- `src/15-live-match.jsx`: testimone della cerimonia; schieramento dopo il rigore del compagno.
- `tests/visual/`: `rigori-296.mjs` (nuovo), `sonda-296.mjs` (nuova), `ripartenza-piazzato-27.mjs` (braccio «compagno»), `ci-runner.mjs` e `package.json` (guardiano nella mappa di src/15, src/11, src/02 e nella catena completa).
- `CLAUDE.md`: una riga di invariante.

**Giro 294 (cerimonie):** ho toccato in `src/15` l'effetto che apre e chiude la fase `ceremony` (righe del timer `ceremonyEndRef`) e `skipCeremony`, solo per scrivere il testimone. Non ho toccato `src/16`. Se il 294 modifica le stesse righe, l'unione va guardata a mano.

## Controlli

Eseguiti a mano, uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), sul build di questo ramo. `node tools/build-src.mjs` e `node tools/check-src.mjs`: IDENTICO.

| Controllo | Esito | Note |
|---|---|---|
| **rigori-296** (nuovo, intero: A + B + C) | **verde**, rossi visti | 17 minuti. B1–B4: 18,1 · 18,6 · 20,2 · 19,3 s, sempre «timer». B5 (rosso `__CPM_NO_G296`): «SLR» + «SLR» in cerimonia. B6 (Invio a 3 s): 3,9 s, «salta». C: verde 0 fuori · 11 passi, rosso 7 fuori · 2 passi. Una corsa precedente delle parti A + B era uscita rossa per un criterio sbagliato del guardiano (vedi sotto) |
| ripartenza-piazzato, solo braccio «compagno» | verde, rosso visto | 2 corse dopo la correzione |
| test:logic | verde | 51 pass · 0 fail |
| save-compat | verde | 12 pass · 0 fail |
| battito-264 | verde, rosso visto | 7 minuti |
| solo-highlight-166 | verde, rosso visto (3, 7 e 8) | 14 minuti |
| sigle-203 | verde, rossi visti | 11 minuti; è il controllo della striscia a 360/375/390/1366 |
| nomi-182 | **rosso, identico sulla base 198** | «412px carriera · slot-club-182 · FC Biancocelesti Primavera (tagliato, 142>76 px)», 27 ok · 1 ko sia su questo ramo sia su `lavoro/198` b3b75b9d senza le mie modifiche. Non nasce da questo giro; non l'ho riparato |
| tabellone-214 | verde, rossi visti | 9 minuti; copre striscia e tabellone durante la lotteria (A, B, D verdi; C ed E rossi) |
| barra-221 | verde | 3,5 minuti |
| ripartenza-piazzato intero (rigore e punizione dell'eroe + compagno) | verde, rossi visti | 6,5 minuti: i due bracci dell'eroe restano verdi dopo la correzione |
| finale-202 · esiti-218 (rossi già dichiarati) | **non eseguiti** | erano in coda, il tempo del giro è finito prima |
| lotteria-191 · rigore-191 · rigori-190 · ripartenza-235 · ripartenza-207 · nomi-211 · nomi-248 · nomi-251 · nomi-190 · rigorista-249 · rigorista-257 | **non eseguiti** | erano in coda; `ripartenza-235` è stato interrotto appena partito |

**Correzione al guardiano prima del primo verde.** La prima corsa di A dava rosso su «FC Pau»: nome corto «Pau» uguale alla sigla «PAU». Il nome è di tre lettere, quindi il criterio «diverso dalla sigla» era sbagliato per lui: ora segnala solo un nome corto uguale alla sigla quando il nome del club è più lungo. Nella stessa occasione ho spostato la soglia dei 17 s dalla durata del registro della pagina a quella del testimone (spiegato in PO-534): la soglia non è cambiata.

**Non eseguiti.** La mappa di `ci-runner.mjs` dà 73 guardiani per `src/15`, 38 per `src/11` e 33 per `src/02` (circa 120 diversi). Nel tempo del giro ne ho eseguiti quelli della tabella. Tutti gli altri **non sono stati eseguiti**, compresi `highlight-95`, `ingresso-206` e `career-critical` (esclusi dalle regole del giro). L'elenco completo si legge dalle prime righe di `src/15`, `src/1[17]` e `src/0[0-8]` della mappa.

## Dubbi per il PO

0. **Controlli della coppa e dei rigori non eseguiti.** Il giro chiedeva anche `finale-202`, `esiti-218` e gli altri guardiani di coppa e rigori della mappa: ho eseguito `tabellone-214`, `sigle-203`, `barra-221`, `ripartenza-piazzato`, `battito-264`, `solo-highlight-166`; gli altri no (elenco nella tabella dei controlli). Vanno eseguiti prima di unire.

1. **I 30 nomi corti li ho scelti io.** Sono nella tabella qui sopra. Per cambiarne uno basta scrivere «<club> → <nome corto>» (massimo 10 caratteri). I più discutibili: «Celesti» per FC Biancocelesti, «Hafen» per FC Hamburg Hafen, «Sheffield» per FC Sheffield South, «Rovers» per Manchester Rovers.
2. **Sul telefono col tocco, durante la partita, resta la sigla sotto lo stemma.** A 375 px la casella del nome è larga 48 px (scelta del giro 203): «Salernum» a 12 px ci può stare, i nomi corti da 9–10 lettere no, e lì resta la sigla sotto lo stemma con la stessa sigla. Durante i rigori e in cerimonia il problema non c'è (casella da 113–121 px, nome intero). Va bene così o in partita serve altro (per esempio nascondere le lettere dentro lo stemma quando sotto c'è la sigla)?
3. **Rigore segnato dagli avversari.** Ho schierato i ventidue solo dopo il rigore del compagno, come chiesto. Dopo un rigore segnato dagli avversari la regola del giro 35 resta quella di prima (nessuno schieramento): non l'ho misurato. Lo estendo?
4. **PO-534 senza correzione.** La cerimonia dura 17,7–20,2 s su 196 e 198; il difetto era della sonda. Resta da guardare dal vivo solo se sul telefono vero succede altro: dal banco non lo vedo.
5. **Nazionali senza nome corto.** La decisione parla di club. Le Nazionali hanno già la loro scala («Sel. …»). Serve anche per loro?
6. **nomi-182 rosso già sulla base.** Lo slot di salvataggio a 412 px mostra «FC Biancocelesti Primavera» tagliato (142 px in 76). È uguale su `lavoro/198` senza le mie modifiche. Non l'ho riparato perché è fuori dal giro: serve un giro dedicato?
