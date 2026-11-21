# Rapporto del giro 307 — la sonda `tunnel-304` usciva «non giudicato»

- Ramo: `sviluppo/giro307-tunnel304`, partito da `prova/198-finale` (6b79812c).
- Data: 21/11/2026. `GAME_VERSION` non toccata. **Nessuna modifica al gioco (`src/`)**. Nessuna soglia abbassata (due alzate).
- File toccati: `tests/visual/misura-304.mjs` (la sonda/guardiano) e questo rapporto.

## In breve

1. **La causa è misurata, ed è della sonda.** Le uscite «che si fermano prima» (z minima −26…−32) non sono uscite lente: sono uscite
   che **la partita vera interrompe a metà**. Il tempo dell'uscita si ferma a 1,45–4,05 s su una durata di 4,0–5,2 s. La sonda
   riprovava solo le uscite interrotte entro i primi 40 fotogrammi; quelle interrotte dopo (42–81 fotogrammi) le teneva, non
   arrivavano alla fascia degli oggetti e non venivano giudicate. Con 4 partenze ne restavano 1 o 2: da qui «non giudicato».
2. **Riparazione**: un'uscita è «intera» solo se il suo tempo arriva alla durata della variante; se non lo è si riprova (fino a 4
   volte per partenza). Partenze portate da 4 a 8. Tolto l'ingresso forzato fra un'uscita e l'altra (non serviva e consumava la
   partita). Soglie alzate: minimo 4 uscite giudicate (erano 2); nel braccio rosso almeno 2 uscite dentro un oggetto (era 1).
3. **Esito**: `tunnel-304` verde col verde e rosso col rosso **4 corse su 4**, ogni volta con 6 uscite giudicate.

## La misura della causa

Sonda lanciata fuori dal guardiano, col 304 spento, 8 partenze, traccia intera (file di lavoro, non nel repo):

| Partenza (x · z), variante | Fotogrammi | Tempo finale / durata | z minima | Esito |
|---|---|---|---|---|
| −40 · −20, var. 0 | 92 | 4,6 / 4,6 | −36,76 | intera, 11 fotogrammi dentro `striscia-led` |
| −30 · −25, var. 0 | 92 | 4,6 / 4,6 | −36,74 | intera, 9 dentro `striscia-led` |
| −25 · −28, var. 0 | **42** | **2,1** / 4,6 | −29,99 | **interrotta** |
| −20 · −30, var. 0 | 92 | 4,6 / 4,6 | −36,51 | intera, 0 dentro oggetti (partenza scartata: non provoca il difetto) |
| −30 · −20, var. 3 | **64** | **3,2** / 5,2 | −28,64 | **interrotta** |
| −25 · −25, var. 1 | 80 | 4,0 / 4,0 | −36,77 | intera, 8 dentro `striscia-led` |
| 15 · −30, var. 3 | **45** | **2,25** / 5,2 | −31,34 | **interrotta** |
| 18 · −25, var. 3 | 104 | 5,2 / 5,2 | −36,52 | intera, 4 dentro `nastro-competizione` |

- Il passo del tempo fra due fotogrammi è 0,05 s in tutte le tracce: l'eroe non «rallenta», la camminata viene troncata.
- Le uscite interrotte finiscono con la partita in gioco fluido (`playing`); quelle intere finiscono dentro un highlight
  (`hl_move` / `hl_choose`). **Non ho cercato nel gioco che cosa azzera l'uscita** (vedi «Dubbi per il PO», punto 2).
- Seconda cosa misurata: fra un'uscita e l'altra la sonda rimetteva l'eroe in campo con un ingresso forzato. Ogni uscita costava
  così circa 90 s reali e alla sesta la partita era già alla premiazione (fase `ceremony`, eroe fermo). L'ingresso non serve: il
  gancio `__CPM_DA304` rimette già l'eroe visibile nel punto scelto. Senza, un'uscita intera costa circa 10–15 s.

## Che cosa è cambiato nella sonda (`tests/visual/misura-304.mjs`)

| | Prima (giro 304) | Dopo (giro 307) |
|---|---|---|
| Partenze provocate | 4 | **8**: −40·−20 (v0) · −30·−25 (v0) · −25·−28 (v0) · −30·−20 (v3) · −25·−25 (v1) · 18·−25 (v3) · −35·−10 (v1) · −38·−22 (v0) |
| Uscita da riprovare | meno di 40 fotogrammi, 3 tentativi | **tempo finale sotto la durata della variante** (margine 0,1 s), 4 tentativi |
| Uscita giudicata | ≥ 40 fotogrammi e z minima ≤ −33,7 | **intera** e ≥ 40 fotogrammi e z minima ≤ −33,7 (soglia di z invariata) |
| Minimo di uscite giudicate | 2 | **4** |
| Braccio rosso «visto» | ≥ 1 uscita dentro un oggetto | **≥ 2** |
| Fra due uscite | ingresso forzato (~90 s) | niente (lo fa `__CPM_DA304`) |
| Prima di lanciare un'uscita | — | attesa di un highlight, al massimo 40 s, poi si prova comunque |
| A partita finita | continuava (uscite con l'eroe fermo) | si ferma e lo dichiara |
| Riga «ESITO» | — | conta anche le interruzioni e dice se la partita è finita |

La partenza 15·−30 (v3) del giro 304 è stata sostituita da 18·−25 (v3): la prima dava 1 solo fotogramma su 104 dentro un oggetto,
la seconda 4. La partenza −20·−30 non è nella lista perché col 304 spento non tocca nulla.

## Prima / dopo

| Misura | Prima | Dopo |
|---|---|---|
| `tunnel-304` nella verifica F1 (dal rapporto `VERIFICA198-F1.md`, non rieseguito qui sul codice vecchio) | «non giudicato» 2 corse su 2 | — |
| `tunnel-304`, braccio verde, 4 corse di fila | — | **verde 4 su 4**: 6 uscite giudicate, 0 con l'eroe dentro un oggetto, in ognuna |
| `tunnel-304`, braccio rosso (`__CPM_NO_G304`), 4 corse di fila | — | **rosso visto 4 su 4**: 6 uscite giudicate, 6 con l'eroe dentro un oggetto, in ognuna |
| Interruzioni della partita per corsa | non contate | 4 in ogni corsa (tutte riprovate con successo al 2° tentativo, tranne l'ultima a partita finita) |
| Durata | F1: corse chiuse rosse in 323 s e 704 s | 7 min 7 s – 7 min 21 s per braccio |
| `tunnel-245` (braccio verde intero) | verde 2 su 2 nella F1 | **verde 1 su 1**, 20 stadi, 0 guasti |

Oggetti toccati nel braccio rosso (uguali nelle corse): `striscia-led`, `tunnel-parete`, `nastro-competizione`.

In ogni corsa la settima partenza (−35·−10) cade a partita finita e non è giudicata, l'ottava non viene provata: le uscite
giudicate sono 6 su 8, contro un minimo di 4.

### Come sono state fatte le 4 corse

I due bracci sono stati lanciati uno alla volta con gli stessi comandi dello script `tunnel-304`
(`CPM_GUARDIANO=1 node misura-304.mjs`, poi con `CPM_PROVA_ROSSO=1`), **non** con `npm run tunnel-304` in un colpo solo, perché
i due bracci insieme durano circa 14 minuti e una chiamata della sessione ne regge 10. Ordine: rosso, verde, rosso, verde, rosso,
verde, rosso, verde. Una quinta corsa verde, fatta **prima** di aggiungere l'attesa dell'highlight, è uscita verde con gli stessi
numeri: non la conto fra le 4.

### `tunnel-245`

Braccio verde intero (`node tunnel-245.mjs`), una corsa sul codice finale: **verde**, 20 stadi, 0 guasti, 21 min 25 s.
Sostituzioni: `sost-comunale` entra 0/168 · esce 0/196; `sost-inglese` entra 0/194 · esce 0/103; `sost-borgo` entra 0/168 · esce 0/217.
I due bracci rossi non sono stati eseguiti.

## Cosa non è stato fatto

- **Bracci rossi di `tunnel-245`** (`CPM_PROVA_ROSSO=1` e `=255`): non eseguiti (solo il braccio verde, una volta).
- **`npm run tunnel-304` come comando unico**: non eseguito (vedi sopra).
- **La causa dell'interruzione dentro il gioco**: non cercata.
- **Tempo**: circa 2 ore e mezza, oltre il tetto di 1,5 ore. Otto bracci da 7 minuti più `tunnel-245` non stanno in un'ora e mezza
  insieme alla ricerca della causa.

## Dubbi per il PO

1. **La partita finisce prima dell'ottava partenza.** Ogni corsa giudica 6 partenze su 8 perché la partita vera arriva al fischio
   finale dopo circa 7 minuti reali. Il margine sul minimo (4) c'è, ma su una macchina molto più lenta le uscite giudicate
   potrebbero scendere. Non l'ho potuto misurare (ho una macchina sola). Se succede, il rimedio è nella sonda: aprire una seconda
   partita per le partenze rimaste.
2. **Perché la partita interrompe un'uscita forzata.** Misurato: succede quando la partita è in gioco fluido. Non so quale riga del
   gioco azzeri l'uscita. Le uscite della sonda sono forzate dal banco (`__CPM_FORCE_SUBEXIT`), quindi **non posso confermare** né
   escludere che una sostituzione vera del giocatore possa essere troncata allo stesso modo. Se lo fosse, l'eroe sparirebbe a metà
   camminata. Meriterebbe una misura a parte su una sostituzione vera; in questo giro `src/` non andava toccato e non l'ho guardato.
3. **Le interruzioni sono identiche a ogni corsa** (stesse 4 partenze, tempi vicini). La partita di prova è la stessa ogni volta,
   quindi 4 corse uguali dicono che la sonda è ripetibile su questa partita, non che lo sia su qualunque partita.
4. **Soglie alzate senza chiedere** (4 giudicate invece di 2; 2 uscite rosse invece di 1). Rendono il guardiano più severo; se
   preferisci i valori di prima basta cambiare `MIN` e `MINR` nell'ultima parte del file.
5. Restano aperti i dubbi 2, 3 e 5 del rapporto del giro 304 (eroe che scorre lungo la linea, eroe nascosto prima di arrivare in
   panchina, stessa geometria nell'ingresso): questo giro non li tocca.
