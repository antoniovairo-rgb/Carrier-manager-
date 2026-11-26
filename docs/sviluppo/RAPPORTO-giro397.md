# Rapporto giro 397 — PO-537: `parata-100` instabile due volte, riparato

Base `lavoro/201` (5ec4ea0) · ramo `sviluppo/giro397-parata` · build 7.999.215 (GAME_VERSION non toccata).

## Verdetto

**Difetto dello STRUMENTO, non del gioco.** `src/` non è toccato; nessun rosso `__CPM_NO_G397` (serve solo per un
difetto del gioco, e qui non ce n'è). Il braccio rosso resta quello di sempre, `__CPM_NO_G100D3`.

## Dove oscillava e perché (misurato)

1. **I due rossi storici sono la stessa partita, tagliata dentro la scena.** Giro 237: «prova s5/7 «Uno-due», minGB 13,3».
   Giro 271 (`docs/sviluppo/giro271/parata100-corsa1.txt`): «prova s5/7 «Uno-due con WENDEL», minGB 16,0», partita chiusa
   «fine hl_result», cioè dal tetto di **480 s reali** mentre la scena era ancora aperta. Nella corsa 2 dello stesso giro la
   stessa scena di WENDEL, non tagliata, misura **minGB 1,9** (`parata100-corsa2.txt`).
2. **Prova provocata del taglio** (gancio solo-misura `CPM_TAGLIA_PARATA=1`: la partita si ferma dentro una parata, prima che
   l'esito sia rivelato), s5/2021, scena «Uno-due con GÜNTHER», 3 partite per braccio, pagina nuova per partita:

   | strumento | minGB | esito rivelato | giudizio di prima |
   |---|---|---|---|
   | taglio di prima (`CPM_TAGLIO_VECCHIO=1`) | **38,7 · 35,0 · 39,1** | mai | 3 falsi difetti (> 6) |
   | taglio nuovo | **2,5 · 1,6 · 1,6** | sempre | 3 parate giuste |

   Il pallone è lontano dal portiere solo perché la misura finisce prima che il compagno tiri: non è il gioco.
3. Perché solo a volte: il pilota gioca in tempo reale, la stessa partita (stesso salvataggio, stesso seme) dà scene diverse
   da una corsa all'altra, e a macchina carica (catena con due passi lenti in parallelo) la partita non arriva al fischio entro
   480 s; se il tetto cade dentro una parata il guardiano boccia. Sulla macchina di oggi le partite arrivano al fischio («fine
   ended») e il caso non si presenta da solo: per questo si è provocato.

## Correzione (solo `tests/visual/parata-100.mjs`)

- `gioca()`: il tetto di parete (`CPM_TETTO`, 480 s come prima) **non taglia più una scena**: se scade in `hl_*` si aspetta
  l'**evento** dell'uscita dalla scena (fase non più `hl_*`), guardia 180 s. La riga di fine dichiara «(tetto)».
- Una scena è giudicabile solo se **completa** (esito rivelato e scena chiusa). Una parata incompleta è «non giudicata» → il
  guardiano è **rosso** («N parate in scene incomplete, non giudicate»), mai più conteggiata come difetto né come verde; non
  conta per la copertura.
- Riga per scena (`CPM_RIGHE=1`): `cop` (secondi di scena fra l'ultimo fotogramma e la fine della finestra) e `ULTIMA(fine …)`.
- Copertura: le ripetizioni rigiocano le partite di partenza (prima il secondo giro rigiocava anche le ripetute del primo: 4
  partite invece di 2).
- Ganci solo-misura: `CPM_TAGLIO_VECCHIO=1` (taglio di prima), `CPM_TAGLIA_PARATA=1` (tetto provocato dentro una parata).
- Soglie invariate (minGB > 6, pavimento 3 parate del compagno, ramo `cross_goal`). Riga della MAPPA invariata.

## Corse dichiarate (dopo)

| corsa | esito | dettaglio |
|---|---|---|
| misura verde «prova» s5/7 + s5/2021, con 2 ripetizioni per copertura | verde | 6 parate (4 del compagno), `cross_goal` 4, difetti 0, partite tutte «fine ended» |
| `node ci-runner.mjs giro parata-100` | **18/18 verdi alla prima** | parata-100 2265 s, nessuna riprova; sentinelle tutte verdi |
| `parata-100` intero (verde + rosso), seconda corsa | **verde · il rosso si vede** (uscita 0) | verde: 6 parate (4 del compagno, minGB 1,6-2,7), `cross_goal` 3, incomplete 0, difetti 0, 8 partite tutte «fine ended»; rosso: difetti 2 (provocate gi16 minGB 14,3 · gi42 8,9) |

N = 2 corse intere verdi dichiarate (catena + seconda corsa), il rosso `__CPM_NO_G100D3` vede ancora il difetto in entrambe
(la catena registra solo l'esito). Limite dichiarato: oggi le partite arrivano al fischio prima del tetto, quindi il taglio
naturale non si è ripresentato; la causa è dimostrata solo col taglio **provocato** (tabella sopra), non sul caso storico
rigiocato.

## File e funzioni toccati

- `tests/visual/parata-100.mjs`: costante `TETTO`; `gioca()` (attesa dell'uscita dalla scena, `taglio`, campi `cop`/`ultima`/`inc`);
  conteggio `T.inc` e verdetto finale; `_cieco` (esclude le incomplete); base delle ripetizioni.
- `docs/sviluppo/RAPPORTO-giro397.md` (questo).
- Nient'altro: niente `src/`, niente `GAME_VERSION`, niente `docs/governo`.

## Dubbi per il PO

1. **Che cosa fare se il tetto scade dentro una parata** — (a, **consigliata, applicata**) aspettare la fine della scena
   (evento) e poi chiudere: la parata si giudica intera; (b) scartare la scena tagliata come «non giudicata» senza aspettarla:
   corsa più corta, ma a macchina carica diventa rosso per «non giudicata» e resta instabile; (c) togliere il tetto e aspettare
   sempre il fischio: nessun taglio, ma una partita bloccata tiene ferma la catena fino al tetto del runner.
2. **Il tetto di 480 s reali** — (a, **consigliata, applicata**) lasciarlo com'è: ora taglia solo fra due scene e le parate già
   giocate restano giudicate; (b) misurarlo in minuti di gioco (`__CPM_SCORE`/orologio della partita) invece che in secondi di
   parete; (c) alzarlo a 600 s.
3. **La stessa partita non è riproducibile** (il pilota gioca in tempo reale): (a, **consigliata, applicata**) tenere le
   ripetizioni dichiarate per la copertura, che ora rigiocano solo le partite di partenza; (b) passare il pilota a tempo di
   scena per avere le stesse scene a ogni corsa (lavoro sul pilota, fuori dal lotto); (c) aggiungere scene provocate per il tiro
   del compagno sul passaggio, come quelle del cross del giro 174, e ridurre le partite vere.
