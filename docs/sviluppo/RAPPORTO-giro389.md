# Rapporto giro 389 — PO-671 «il fallo cercato: in area rigore, fuori area punizione»

Base `lavoro/201` (29d758c), ramo `sviluppo/giro389-fallo-cercato`. GAME_VERSION e `docs/governo` non toccati.

## Parole del PO (26/11)
«c'è un highlight dove l'eroe cerca un fallo, se il fallo avviene in area deve esserci un rigore, fuori area una punizione mi
raccomando! oggi non è così».

## Dove nasce il fallo cercato
Il flag `falloCercato` lo mette la factory delle situazioni (src/04, regex sull'etichetta). Le scene che lo offrono:
- **catalogo**: solo la 150 «🎭 Guadagna una punizione!» (zone bordo/area, eroe fra x 73-96 e y 22-78 → spesso DENTRO l'area
  disegnata), azioni 0 «Dribbling provocatorio — il fallo c'è!» e 1 «Scatto improvviso provocatorio»;
- **scene costruite dal motore**: `P6_SPALLE` «Resisti alla carica e cerca il fallo» (spalle alla porta, in area o al limite).

Riuscito, l'esito è `win_freekick` (7.999.38): l'eroe cade (giro 8), il riquadro dice «fallo subito» (giro 41).

## Misura PRIMA (`__CPM_NO_G389` = codice di prima)
- **Scena forzata** (`misura-389.mjs`, scena 150 riuscita con l'eroe a 88/50 e a 75/50, poi flusso sbloccato): il motore riceveva
  la scena e scriveva una sola riga «fallo» **assegnata agli avversari** (`per: away`) nel punto dell'eroe **del motore**
  (69,3/34,4, non dove l'eroe è caduto), poi `riprendi` ripartiva su azione. Nessun rigore, nessuna punizione, dentro o fuori area.
- **Partite vere** (`partite-389.mjs`, 2 partite, occasioni chieste al motore, pilota sul fallo cercato, esiti riusciti):
  **4 falli cercati riusciti → 0 rigori · 0 punizioni per noi · 4 «fallo» della scena assegnati agli avversari · 4 «niente»**.

## Causa
`risolviEroe.eventi` (src/14), ramo `fouled|win_freekick`: (1) `per:H.team===HOME?AWAY:HOME` — la punizione va a chi difende;
(2) il punto è `g[HERO]`, la posizione dell'eroe nel motore, che la scena non aggiorna; (3) l'evento è solo un racconto: nessun
`fermoSet`, e alla chiusura della scena `chiedi.riprendi` azzera comunque `S.fermo` e rimette il pallone in gioco.

## Correzione (alla sorgente, rosso `window.__CPM_NO_G389`)
- **src/14** `falloCercato389(adv,y)` (nuova, pura, accanto a `fuoriArea343`): dentro l'**area disegnata** (`AREA343`, linea
  compresa: avanzamento ≥ 81,8 · |y−50| ≤ 29,95) → rigore; fuori → punizione dal punto (già fuori dall'area disegnata, quindi
  `fuoriArea343` non la sposta). Esposta come `window.__CPM_FALLO389`.
- **src/14** `risolviEroe.eventi`: con `d.punto389` (solo `win_freekick`) niente riga «fallo» per gli avversari; il fallo diventa
  `S.pend389` (tipo, lato dell'eroe, punto della scena, chi l'ha commesso = duellante del cast o avversario più vicino). Il
  cartellino resta quello di prima (7.999.9).
- **src/14** `_fischia389()` (nuova, accanto a `fermoSet`), chiamata a fine `chiedi.riprendi` e in testa a `tick` se nessuna scena
  è aperta: `fermoSet('pen'|'foul', lato dell'eroe, …)`, attesa 6 passi, battitore l'eroe come chiede il ponte verso le scene a palla
  ferma (per il rigore vale la regola del patto dei giri 249/257: senza il premio lo batte un compagno, scena di sola visione).
  Azzera `noPiaz94` (giro 94): quel blocco vale per lo STESSO piazzato già calciato, questo è un fallo nuovo.
  Testimone `window.__CPM_F389` (fasi «deciso»/«fischiato»).
- **src/15** `handleAction`: passa a `risolviEroe.eventi` `punto389 = pPos` solo sul fallo cercato riuscito.
- **src/04** gancio solo-collaudo `__CPM_OFFRI389` (attivo solo con `?cpmtest=1`): ogni scena offensiva costruita dal motore
  offre «cerca il fallo» (in partita vera il caso è raro: provocato, nessun sorteggio in più).
- Simulazione non fischiata (esito fallito): invariata, nessun fermo (giro 98 D3-bis: palla persa).

## Misura DOPO
- Scena forzata: 88/50 → rigore per noi sul dischetto (89/50); 83/50 (fascia grigia) → rigore; 75/50 → punizione per noi a 75/50;
  fallita → nessun fermo.
- Partite vere, stesse due partite: **4 falli cercati riusciti → 1 rigore + 3 punizioni per noi, 0 per gli avversari, 0 niente**.
  Il rigore (fallo a 82,4/20,1, proprio nella fascia grigia) apre la **scena del rigore** al minuto dopo (libro mastro
  `scena src:brain-origine kind:rigore`); le punizioni a 80,3/53,6 · 80,1/43,0 · 74,4/27,2 dal punto del fallo.

## Guardiano
`npm run fallo-389` (`fallo-389-test.mjs`, riga della MAPPA `src/14-`): A regola pura su 8 punti (fascia grigia compresa) · B scena
forzata in area (88/50, 83/50) → rigore · C fuori area (75/50) → punizione dal punto · D fallita → nessun fermo · E partita vera
(seme misurato «Dbg389»: un fallo in area e due fuori). Ogni braccio non giudicato è rosso.
- verde: **PASS** (tutti i controlli dei cinque bracci). Rosso `CPM_RED=1`: **FALLITO (13)** — nessun testimone del punto, «fallo»
  della scena per gli avversari a 69,2/34,5 (punto dell'eroe del motore), in area nessun rigore, fuori nessuna punizione, in partita
  vera il punto non arriva al motore. Mappa-unica verde.
- sonde: `misura-389.mjs` (scena forzata), `partite-389.mjs` (partite vere, `CPM_ROSSO=1` per il prima).

## Consegna rapida
`node ci-runner.mjs giro fallo-389`: **18/18 verdi** (fallo-389 + 17 sentinelle, fra cui partita-vera, career-critical, replay,
save-compat, gk-dive-sync). Il registro `docs/governo/STABILITA.json` e gli screenshot `docs/collaudo-grafico/` scritti dal runner
NON sono stati committati (regola: niente docs/governo).

## File e funzioni toccati
- `src/14-motore-possesso.jsx`: nuova `falloCercato389`, nuovi `no389`/`_fischia389`; `tick` (una riga in testa);
  `chiedi.riprendi` (una riga in coda); `risolviEroe.eventi` ramo `fouled|win_freekick`.
- `src/15-live-match.jsx`: `handleAction`, argomento `punto389` della chiamata a `risolviEroe.eventi`.
- `src/04-situazioni-zone-piazzati.jsx`: `_offri389` (gancio collaudo) e una riga in `_p6Costruisci`.
- `CARRIER-MANAGER-AV.html` ricomposto (build-src, check-src).
- `tests/visual/`: `fallo-389-test.mjs`, `misura-389.mjs`, `partite-389.mjs`, `package.json` (script), `ci-runner.mjs` (riga src/14).

## Guardiani della zona NON girati (li giudica il treno)
`fallo-cercato` (PO-091/7.999.38: caduta e distacco pallone, non toccati), `rigore-191`, `piazzato-204`, `rigorista-249`,
`rigorista-257`, `rigore-79`, `difesa-343` (punizioni fuori dall'area disegnata), `esiti-241`, `esiti-218`, `tabellino-228`,
`scene-190`, `tetto-202`, la catena completa (`validate-situations` ecc.).

## Dubbi per il PO (la consigliata è la prima, GIÀ APPLICATA)
1. **Quale area comanda il fischio del fallo cercato.**
   - **(a) CONSIGLIATA, applicata: l'area DISEGNATA** (≥ 82,1 · |y−50| ≤ 29,65, linea compresa): è quella che il giocatore vede;
     nella fascia grigia il fallo è rigore (misurato in partita vera: 82,4/20,1).
   - (b) la regola del motore (≥ 84 · ≤ 20): nella fascia grigia sarebbe punizione, battuta fuori dall'area (giro 343) — il
     giocatore vede l'eroe steso dentro l'area e niente rigore, cioè la frase del PO.
   - (c) area disegnata, ma per tutti i falli del motore: cambierebbe i rigori a partita (PO-190), fuori ambito.
2. **Il rigore del fallo cercato è sempre fischiato?**
   - **(a) CONSIGLIATA, applicata: sì** — la scena ha già deciso che il fallo c'è; il filtro «un contatto su quattro» di PO-190 vale
     solo per i falli decisi dal motore.
   - (b) passarlo anche lui dal filtro 1 su 4: la scena riuscita direbbe «fallo» e tre volte su quattro non succederebbe nulla.
   - (c) far decidere all'esito della scena una quota di «simulazione»: richiede un esito nuovo, fuori ambito.
3. **Chi batte il rigore.**
   - **(a) CONSIGLIATA, applicata: le regole del patto (giri 249/257)** — con il premio «il rigorista sei tu» l'eroe, altrimenti un
     compagno con la scena di sola visione.
   - (b) sempre l'eroe, perché il fallo l'ha subito lui: scavalca il patto.
   - (c) sempre il rigorista di squadra.
4. **Altri falli subiti in scena (`fouled`, esito fallito di altre scene).** Non toccati: restano la riga «fallo» di prima (anche lì
   `per` è la squadra di chi difende). Opzioni: **(a) consigliata: aprire una voce** e misurare dove nascono prima di toccarli;
   (b) estendere subito la stessa regola; (c) lasciare così.
