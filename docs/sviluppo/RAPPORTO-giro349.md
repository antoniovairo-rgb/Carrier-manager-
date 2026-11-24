# Giro 349 — i tre rossi nuovi del treno 45255159673 (7.999.207)

Base: `lavoro/201` punta **f3f4bb82** (treno della 7.999.207: 13 vagoni + il giro 348). Confronto: **fd2b9334** (prima dei sei
vagoni 334-343) e, per `cerimonie`, anche **v7.999.203** e **5dc07803** (commit del rapporto del giro 301). Banco: sessione cloud,
`CPM_CHROME=/opt/pw-browsers/chromium`, ogni guardiano con `npm run`, ogni commit in un worktree a parte. Ramo di consegna:
`sviluppo/giro349-rossi-207b`. `GAME_VERSION` non toccato.

**Esito in una riga:** nessuna regressione dei vagoni. Due guardiani avevano un difetto di strumento che il runner ha fatto venire
fuori (cerimonie leggeva l'apertura nel fotogramma sbagliato e apriva una premiazione sopra l'altra; esiti-241 sperava di trovare la
scena da giudicare invece di provocarla): corretti, con un testimone e un gancio di collaudo nel gioco, senza toccare una soglia. Il
terzo (esiti-96 D12) è verde stabile sul banco e va in `solo_runner`.

| guardiano | punta f3f4bb82 | base fd2b9334 | vagone responsabile | causa | correzione |
|---|---|---|---|---|---|
| cerimonie (11) | **rosso** 5/22 | **rosso** 5/22 (anche su v7.999.203 e 5dc07803) | **nessuno** (rosso sul banco da prima dei vagoni; sul runner verde fino al treno 45186665202) | la probe leggeva i compagni «subito dopo» l'apertura. Dalla premiazione di squadra (POC 24/09, giro 47: per la Nazionale `present>captain>pass>fest>lift`) eroe e compagni passano al palco pochi fotogrammi dopo lo stacco, e lì la foto di gruppo sta a 5,9-7,2 u (misurato: 2,6 · 5,9 · 5,9 · 6,0 · 6,2 · 7,0 · 7,0 · 7,1 · 7,2 …): la probe coglieva l'anello o il palco a seconda dei fotogrammi. In più la sezione apriva la Nazionale **sopra** la cerimonia di campionato ancora in corso, quindi la posizione d'apertura (`_cerHx0`) restava quella vecchia (misurato col testimone: 0/22) | **gioco** (src/12, solo collaudo): testimone `__CPM_CER349` scritto nel fotogramma dello stacco, subito dopo l'anello (7.443); rosso `__CPM_NO_G349` = niente anello (il gioco di prima del 7.443). **Guardiano:** chiude la cerimonia precedente con Invio (come già fa il suo primo ciclo) e legge il testimone; soglie invariate (6,5 u · ≥ 6). **Verde 9/22, rosso `CPM_ROSSO=__CPM_NO_G349` 0/22 bocciato** |
| esiti-241 | verde (1 pagina scartata «assist») | verde (1 pagina scartata «assist») | **nessuno**: la causa è il PO-298 (giro 93/298) | la parte B giudica la consegna riuscita che resta in area («chance»). Dal PO-298 il tiro del compagno vale la «grande occasione» (0,28-0,6) e la consegna esce spesso «assist» (il compagno segna): sul banco 1 pagina su 4 per braccio, sul runner tre di fila su gi16 (verde) e gi14 (rosso G102) = non giudicato | **gioco** (src/14 `giocaScena`, solo collaudo): gancio `__CPM_COMPAGNO_SBAGLIA349` — il tiro del compagno si sorteggia come sempre (stessi sorteggi) e, se è gol, diventa parata. **Guardiano:** le pagine della parte B lo accendono: la scena si provoca, la ripetizione su pagina nuova resta come rete. **Verde 0/3 contraddizioni (tutte giudicate alla prima pagina), rosso 3/3, rosso G102 2/2** |
| esiti-96 (D12) | verde (catena intera + 3 passate solo D12: 6/6 giudicate, 0 difetti; rosso 6/6 visto) | — (non necessaria: verde sulla punta) | — | sul runner gi48 «Rimbalzo in area» e gi159 «Taglio sul palo lontano» senza scheda d'esito nella colonna destra 700 ms dopo la rivelazione; nel treno precedente lo stesso guardiano era verde sul runner. **Non posso confermare** la causa: sul banco non si riproduce | riga `solo_runner` in ROSSI-DICHIARATI. Nota per il prossimo: il controllo aspetta 700 ms fissi dopo la rivelazione (contro la regola «si attende un evento»): se torna rosso va reso un'attesa d'evento |

## Perché i rossi `__CPM_NO_G331…G348` non sono serviti

Per cerimonie il rosso c'è identico (5/22) su fd2b9334, su v7.999.203 e sul commit del giro 301: nessun vagone del treno lo ha
prodotto, quindi spegnere i giri non poteva isolare niente. Per esiti-241 ed esiti-96 la punta è verde sul banco: non c'era un rosso
da attribuire. I sospetti della consegna (339 formazioni, 336 prepartita, 342 testa, 343 difesa/piazzati) non sono stati scagionati
né accusati da una misura: semplicemente non c'è un rosso sul banco che dipenda da loro.

## Decisioni del PO a cui i guardiani sono stati allineati

- **POC 24/09 + giro 47 (PO-002/PO-150)** — premiazione di squadra con palco: la Nazionale non apre più con `burst>hug` (il caso per
  cui la (11) era stata scritta nel 7.443) ma col palco. L'invariante «la festa parte addosso all'eroe» si misura nel fotogramma dello
  stacco, dove l'anello esiste ancora; la foto di gruppo sul palco (5,9-7,2 u) non è un difetto.
- **PO-298 (giro 93/298)** — il gol del compagno deciso dal motore non si converte in «occasione». La scena «chance» va provocata.

Nessuna soglia abbassata.

## Rigiocata dopo le correzioni

Banco, punta del ramo: cerimonie **verde 9/22**, rosso **0/22** · esiti-241 **verde, rosso e rosso G102 visti** · esiti-96 **verde**
(prima della correzione: è solo `solo_runner`).

Catena del giro (`node ci-runner.mjs giro cerimonie esiti-96 esiti-241 cerimonie-192 testa-342 difesa-343 career-critical`, + 17
sentinelle, 23 passi): **23/23 verdi** — cerimonie 40 s · esiti-241 326 s · cerimonie-192 456 s · testa-342 694 s · difesa-343 256 s ·
esiti-96 816 s · career-critical 370 s · le 17 sentinelle verdi, partita-vera compresa (618 s). Esito registrato in
`docs/governo/STABILITA.json`. (Il runner stampa «su 7.999.206»: è la `GAME_VERSION` del file, non toccata.)

## Da sapere (fuori ambito)

- `ROSSI-DICHIARATI.json` è cambiato solo sul ramo: il rilascio lo legge da **main**. Non l'ho portato su main io (è un push sul ramo
  di produzione, che non mi è stato chiesto); se il PO vuole che il prossimo treno conti esiti-96 come «noto del runner» la riga va
  copiata su main come nel giro 348.
- I due ganci nuovi sono di solo collaudo: `__CPM_CER349` si scrive solo sotto `?cpmtest=1`, `__CPM_COMPAGNO_SBAGLIA349` lo accende
  soltanto la sonda. In gioco non cambia niente (catena del giro verde, partita-vera compresa).
