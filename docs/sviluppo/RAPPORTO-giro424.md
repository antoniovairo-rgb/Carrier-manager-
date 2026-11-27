# Rapporto giro 424 — PO-653 «il compagno che riceve non è già nella scena»

**Voce PO (7.999.208, senza foto):** «quando l'eroe fa un passaggio ad un compagno, in particolare tentativi di assist,
quest'ultimo non è già nella scena!»

Ramo `sviluppo/giro424-ricevente`, base `main`. GAME_VERSION e `docs/governo` non toccati (rilascio automatico del vagone).

## 1. Misura prima (No Blind Fix)

Strumento: il testimone `__CPM_F364` (src/12, giro 364). Registra ogni fotogramma dalle mesh e dalla camera DISEGNATA: tutti i
compagni, se sono nel quadro, chi è il ricevente (`passTargetMesh` / `crossRcvMesh`). Tutte le misure con GLB acceso,
teatro acceso (`__CPM_PRESENT` + `__CPM_CINE`) e vista telefono 412×915.

- `misura-424.mjs` (catalogo): ogni azione di passaggio o assist dell'eroe, 2,5 s di lettura, scelta, esito riuscito. Misura chi
  riceve, dove stava nell'ultimo fotogramma di `hl_choose`, se era nel quadro, per quale quota della lettura e quanto corre fra la
  scelta e l'armo del passaggio.
- `misura-424-vere.mjs` (partite vere): salvataggi s1/s5/s12, scene del motore col loro cast. A ogni scelta con un'azione di
  passaggio la sonda lascia leggere 1,5 s e la sceglie.

| Misura (prima della correzione) | Valore |
|---|---|
| Catalogo, azioni 0-30: ricevente fuori dal quadro a fine lettura | **8 / 27** (a 20-30 u dall'eroe: gi14, gi15, gi17, gi19, gi27) |
| Catalogo, azioni 0-30: corsa oltre 6 u dopo la scelta | 6 / 27 (gi23 13,6 u · gi27 14,7 u) |
| Catalogo, azioni 30-90 (braccio rosso = codice di prima) | **23 / 57** fuori dal quadro, 11 / 57 corsa > 6 u |
| Partite vere (3 partite, 7 scene con ricevente) | **2 / 7** fuori dal quadro (s12 28' «Uno-due con SPENCER» a 22,5 u · 69' «Servi RUSSELL libero» a 16,3 u) |

## 2. Cause misurate (tre, nell'ordine in cui sono emerse)

1. **Senza il cast del motore il ricevente non esisteva prima della scelta.** Si sceglieva solo al lancio (`fireConclusion`, ramo
   `pass`), fra chi stava davanti entro 34 u. Quindi poteva essere chiunque, anche a 30 u e fuori dal quadro. Due rami di ripiego
   (scarico e tacco, src/12 `_rmA712` / `_rmB711`) ne sceglievano un altro ancora.
2. **Il punto di ricezione del giro 99 cadeva fuori dal quadro del telefono.** Il punto era 12 avanti e 9 di lato (5,4 u), e 14
   di lato (8,4 u) vicino alla porta. La camera di lettura sta circa 25 u dietro l'eroe; sul telefono, all'altezza dell'eroe, vede
   circa ±6 u di lato. Esempio misurato: gi3, compagno a 9,5 u di lato, fuori.
3. **Il punto restava ancorato a dove la scena si apriva (`P.playerX/Y`), non a dove sta l'eroe.** Il teatro sposta l'eroe durante
   l'apertura. Misurato fotogramma per fotogramma al 69' di s12: l'eroe passa da (12,−17) a (31,3) a 0,3 s di scena. Il compagno
   restava sul punto vecchio e poi correva a 1,5 u ogni 0,25 s, fuori dal quadro per tutta la lettura.

## 3. Correzione (src/12, src/15) — rosso `window.__CPM_NO_G424`

- **src/15:** nuovo prop `hlPass424`. Vale vero se la scena non è difensiva e ha almeno un'azione con premio `assist` o
  un'etichetta di passaggio.
- **src/12, `_r99` (giro 99):** nelle scene con `hlPass424`:
  - se il motore non ha nominato un ricevente, lo si sceglie **all'apertura**: il compagno di movimento più vicino al punto di
    ricezione, mai il battitore;
  - il punto sta dentro il quadro: 10 avanti e 6 di y (4,1 u); vicino alla porta 6 avanti e 8 di y (5,4 u);
  - in tutta la lettura (`hl_intro`, `hl_move`, `hl_choose`) il punto si ricalcola dalla posizione **disegnata** dell'eroe.
- **Ricollocazione:** in `hl_intro`, se il compagno è a più di 3 u dal suo punto mentre c'è uno stacco nero vivo (`_CUT471`, lo
  stesso stacco che sposta l'eroe), viene messo sul punto in quello stacco. Non lo si vede teletrasportarsi.
- **`_ric424`:** il ramo `pass` (quando il cast manca o è scartato) e i due rami di ripiego servono il ricevente scelto
  all'apertura, se sta davanti a chi passa.
- **Testimoni di sola prova (`cpmtest`):** `__CPM_R424` (ricevente e punto per scena) e il campo `r4` in `__CPM_F364`.

## 4. Misura dopo

| Misura | Prima | Dopo |
|---|---|---|
| Guardiano, 10 scene del catalogo: ricevente fuori dal quadro a fine lettura | 5 / 10 (braccio rosso) | **0 / 10** |
| Guardiano: quota della lettura col ricevente nel quadro | da 0 a 1 | 1 in 10 scene su 10 |
| Partite vere s1/s5/s12 (7 scene con ricevente): fuori dal quadro | 2 / 7 | **0 / 7** |
| Partite vere: corsa oltre 6 u dopo la scelta | 0 / 7 | 0 / 7 |

Foto (fine lettura, GLB acceso, telefono): `docs/collaudo-po/424-gi49-prima.png` / `424-gi49-dopo.png`, e `424-gi76-prima.png` /
`424-gi76-dopo.png`. Su gi49 «Sponda per compagno»: prima, il ricevente (9 Colombo) non c'è nel quadro; dopo, è davanti
all'eroe, verso la porta, già prima della scelta.

## 5. Guardiano

`npm run ricevente-424` (`tests/visual/ricevente-424.mjs`), nella riga MAPPA `src/12-|src/13-` di `ci-runner.mjs`, accanto a
`fasce-364`.

- Dieci azioni del catalogo: sette che prima della correzione avevano il ricevente fuori dal quadro (gi37/2, gi40/2, gi49/1,
  gi61/2, gi62/2, gi69/1, gi76/1) e tre già buone (gi3/2, gi21/2, gi28/0).
- **Verde, ogni scena:** il ricevente è un compagno; è nel quadro a fine lettura e per almeno il 60% della lettura; sta entro
  22 u dall'eroe.
- **Rosso (`__CPM_NO_G424`):** almeno 3 scene fuori dal quadro. Una scena non giudicata è rossa; servono almeno 8 scene giudicate.
- **Esito:** verde 10/10, rosso visto 5/10.

Giro: `node ci-runner.mjs giro ricevente-424` (guardiano + 17 sentinelle) su 7.999.217: **18/18 verdi**, nessun passo ripetuto. Le
schermate di `docs/collaudo-grafico` e il file di `docs/governo` che le sentinelle riscrivono sono stati riportati com'erano (non sono
parte della consegna).

## 6. Fuori ambito, visto misurando (non corretto)

- **«🌀 Giocata corta» nelle punizioni (gi14/2, gi15/2).** L'etichetta promette un passaggio corto, ma il 3D gioca un piazzato
  (`hlType` `freekick`) con un arco verso l'area e un colpo di testa (`crossRcvMesh`). È un difetto diverso, «etichetta contro
  gesto»; l'ho tolto dal guardiano.
- **Cross (gi16, gi17, gi46, gi63, gi67, gi72, gi82, gi87).** Il ricevente del cross è fuori dal quadro in diversi casi del
  braccio rosso. È il tema del giro 364 (PO-650, `_g364`), qui non toccato.
- **Retropassaggi** («Retropassaggio sicuro / al limite / all'accorrente»). Il 3D gioca ogni passaggio in avanti (vincolo PO
  7.475): ora il ricevente sta 10 u davanti all'eroe anche quando l'etichetta dice «retro».
- **Compagni parcheggiati a (47; 32,3)**, fuori dal campo vicino alla bandierina (#9 in gi6, gi76, gi77 col codice di prima).
  Causa non indagata.

## 7. Dubbi per il PO (la prima opzione è la consigliata ed è quella applicata)

**D1. Dove deve stare il compagno che riceve, prima della scelta?**
1. *(applicata)* 10 u davanti all'eroe e 4 u verso il centro: sempre nel quadro del telefono, ma vicino.
2. Lasciare il punto del giro 99 (12 avanti, 5,4 di lato) e allargare la camera di lettura quando c'è un passaggio: passaggio
   più lungo, ma si cambia la regia (già bocciata «zoom troppo stretto / troppo largo» in passato).
3. Mettere il compagno dove lo vuole la tattica e far entrare nel quadro solo il suo marcatore e la linea di passaggio
   (indicatore a schermo): niente spostamenti, ma serve un segno grafico nuovo.

**D2. Il compagno può essere ricollocato durante lo stacco nero d'apertura?**
1. *(applicata)* Sì, solo dentro lo stacco nero che sposta già l'eroe e solo se è a più di 3 u dal suo punto.
2. No: corre sempre col moto normale (più «vero», ma nel caso misurato resta fuori dal quadro per tutta la lettura).
3. Sì, ma con una dissolvenza breve dedicata (più costosa da collaudare).

**D3. Nei «retropassaggi» il compagno deve stare dietro l'eroe?**
1. *(applicata, invariata)* No: il 3D continua a giocare il passaggio in avanti (vincolo PO 7.475) e il compagno sta davanti.
2. Sì: il punto di ricezione va dietro l'eroe quando l'etichetta dice «retro», e si toglie il vincolo «mai indietro» solo per
   quelle azioni.
3. Rinominare le azioni «retro…» in passaggi in avanti, così testo e gesto coincidono.

**D4. «Giocata corta» nelle punizioni (fuori ambito, sezione 6)?**
1. *(consigliata, non applicata qui)* Un giro dedicato: la «giocata corta» diventa un passaggio corto a un compagno vicino.
2. Rinominare l'azione in «Palla in area» (il gesto che il 3D fa già).
3. Lasciarla com'è.

## 8. Cosa non ho potuto verificare

- **Il dispositivo del PO.** Il quadro è misurato sulla camera disegnata in headless (412×915); la larghezza vista su un
  telefono diverso può cambiare.
- **Le partite vere sono poche:** 3 partite, 7 scene con ricevente. Il campione del catalogo è più largo (87 azioni misurate
  prima, 10 nel guardiano).
