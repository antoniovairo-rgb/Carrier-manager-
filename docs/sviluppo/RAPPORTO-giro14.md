# Rapporto giro 14 — PO-234 · PO-235 · PO-236

Ramo `sviluppo/schede-convocazione-234`, base `poc/marioprada-character-system` 7.999.165 (`3675077`). Nessun bump di `GAME_VERSION`.
Zona G (carriera/classifica, `src/18`) **non toccata**. Verifiche percettive dell'ingresso in campo con i corpi accesi (GLB).

## PO-234 — «Segui indicazioni, non ordine e dai almeno 3 opzioni!»

**Prima (misurato).** Le 8 schede di `SCHEDE226` avevano 2 opzioni; 6 su 8 dicevano «Seguo l'ordine» (foto del PO
`docs/governo/foto/po234-scheda-mister.jpg`). Banco Node (`schede-234`, parte B, gli stessi 312 semi del giro 10) sulle due
opzioni di allora: dopo le schede d'attacco «seguo» 0,1510 tiri/min contro 0,1346 di «di testa mia» (+12,2%), dopo quelle di
difesa 0,1438 contro 0,1796 (−19,9%) — gli stessi numeri del rapporto del giro 10.

**Cosa cambia.**
- `src/15-live-match.jsx:154` `SCHEDE226`: ogni scheda ha **3 opzioni**. La prima resta la neutra del timer, ora «Seguo le
  indicazioni»; la seconda «Faccio di testa mia»; la terza è una via di mezzo con un testo suo («Rifiato col pallone»,
  «Teniamo palla nella loro metà», «Spingo, ma restiamo corti», «Ci provo, ma solo sulle palle giuste», «Gestisco, ma resto
  pericoloso», «Mi abbasso a prendere palla»; in panchina «Mi scaldo da solo»). Nessuna parola «ordine/ordini» nei testi,
  nelle etichette e negli esiti (in `misura_85` e `eroe_marcato` anche il testo della scheda dice «indicazioni»).
- `src/14-motore-possesso.jsx:56-63` `INT226.FATTI[].att` ha tre valori; `:75` `INT226.att` legge l'indice 0/1/2.
  `:80` `INT226.ingresso`: la terza opzione della panchina anticipa l'ingresso di 1-3' (col seme), la seconda di 4-10' come prima.
  I valori della terza opzione sono **di progetto**, non da una fonte (come K=0,9 del giro 10).
- `src/15-live-match.jsx:183` `schedaVista234`: la scheda come la vede il giocatore; col rosso torna quella di prima.
- Restano nel codice due identificativi interni (`ordine:'consolida'`, `ordine:1`): chiavi di `COACH_ORDERS`, mai mostrate.

**Dopo (banco Node, 312 partite per braccio, stessi semi).**

| opzione | tiri/min dopo scheda d'attacco | gol/min | tiri/min dopo scheda di difesa | gol/min |
|---|---|---|---|---|
| 0 «Seguo le indicazioni» | 0,1510 | 0,0159 | 0,1438 | 0,0147 |
| 1 «Faccio di testa mia» | 0,1346 | 0,0127 | 0,1796 | 0,0167 |
| 2 via di mezzo | 0,1453 | 0,0153 | 0,1637 | 0,0163 |
| senza effetto | 0,1397 | 0,0136 | 0,1669 | 0,0167 |
| rosso `__CPM_NO_234`, opzione 2 | 0,1397 | 0,0136 | 0,1669 | 0,0167 |

Tre effetti distinti e ordinati come gli atteggiamenti dichiarati: in attacco 1 < 2 < 0 con separazione minima **3,9%**
(2 contro 0), in difesa 0 < 2 < 1 con separazione minima **9,7%**. Le opzioni 0 e 1 danno esattamente i numeri di prima: la
taratura del giro 10 non si sposta. Panchina: 400/400 casi con tre minuti d'ingresso coerenti, deterministico 400/400.
Limite dichiarato: come al giro 10, il banco Node non apre `eroe_stanco` ed `eroe_marcato` (energia e duelli non esistono lì);
la soglia del 3% sull'attacco è vicina, ma il banco è deterministico (stessi semi → stessi numeri).

**Partita vera (browser).** La prima scheda del mister uscita è `eroe_stanco` al 66': **3 bottoni**, nessuna «ordine», il
timer sceglie la terza opzione e il motore riceve att −0,05 (= dichiarato). Rosso: 2 bottoni, «Seguo l'ordine».
Foto dopo: `docs/sviluppo/foto-giro14/po234-dopo.png` (prima: la foto del PO).

**Guardiano** `tests/visual/schede-234.mjs` (`npm run schede-234`): (A) testi, (B) banco per opzione + panchina, (C) partita
vera. Rosso `__CPM_NO_234`, riconosciuto in tutte e tre le parti. Esito: ✅ VERDE. Aggiunto a `ci-runner.mjs` per `src/14` e
`src/15` e fra i passi lenti. `interazioni-226` resta com'era (le opzioni 0/1 non sono cambiate).

## PO-235 — «Schermata fuori standard» (Convocazione Nazionale)

**Prima (misurato, `convocazione-235` col rosso).** `src/17-menu-creazione-pannelli.jsx` `NationalCallupScreen` era fatta a mano:
fondo a gradiente fatto a mano dal colore della nazionale al nero, titolo «Nazionale Spagna» bianco a **1,11:1** misurato sul
fondo chiaro del tema (la sonda non sa calcolare il contrasto sopra un gradiente: lo conta a parte, 1 per schermata), card
bianche sul nero, bottone **verde** (non primario) alto 47 px con l'emoji dello stadio.

**Cosa cambia.** `src/17-menu-creazione-pannelli.jsx:664` nuova `NationalCallupScreen` come il pre-partita del kit
(`src/18`, `data-cpm="partita23"`): occhiello maiuscolo `FS.caption`/`FW.bold`/`TH.muted`, tre `Card` del kit (apertura con
bandiera, titolo, «Presenza n. 15 · Amichevole internazionale» e la maglia piccola; prossima partita; bonus), token
TH/FS/FW/SP/RAD, una sola azione piena: `Btn v="primary" size="lg" fw` «Gioca la partita». La prima convocazione è una `Card`
`tone="warn"`. La versione di prima resta in `:723` `_NationalCallupScreenOld235`, servita dal rosso `__CPM_NO_235`.

**Dopo** (360 e 412 px, Spagna-Portogallo e prima convocazione Italia): bottone primario h48 · 3 card del kit · 0 gradienti ·
0 testi sotto contrasto · nessuno scorrimento orizzontale. Verificata anche sul **percorso vero** (playMatch con la voce di
calendario della Nazionale → schermata → «Gioca la partita» → partita), dentro `bambini-236`.
Foto: prima `foto-giro14/po235-prima-412.png`, dopo `po235-dopo-412.png`, `po235-dopo-prima-convocazione-360.png`,
`po235-dopo-percorso-vero.png`.

**Guardiano** `tests/visual/convocazione-235.mjs` (`npm run convocazione-235`), rosso `__CPM_NO_235` bocciato su tutte e 4 le
combinazioni. Esito: ✅ VERDE. `design-system`: ✅ OK. Aggiunto a `ci-runner.mjs` per `src/11`/`src/17`.

## PO-236 — «Non ci sono i bambini accompagnati dalla squadra avversaria»

**Misura prima di correggere.** Sonda sul percorso vero, corpi accesi, ingresso Spagna-Portogallo.
1. Posizioni: tutti e 22 i bambini esistono, visibili, a 0,7u dal loro calciatore, per entrambe le squadre — la fila non era il
   difetto (codice della fila PO-227 `src/12-three-match-view.jsx:5925-5944` corretto).
2. Foto con i bambini nascosti (scala ~0) nello stesso istante: in campo restano **2 calciatori**
   (`foto-giro14/po236-prima-senza-bambini.png`). Le figure della foto del PO erano quasi tutte **bambini**, che indossano la
   divisa avversaria: una fila di bambini «Portogallo» senza calciatori e una di bambini «Spagna» con due calciatori.
3. Causa: `src/12-three-match-view.jsx:10298-10318`, il «roster cinematografico» (attivo con i corpi CGTrader ottimizzati, il
   default) tiene disegnati solo eroe, un portiere e i 3 più vicini al pallone. È pensato per gli highlight, ma girava anche
   nell'ingresso in campo. I bambini sono una lista separata (`_mascots`) e restavano tutti.

**Contesti (testimone `__CPM_CGTRADER_CINEMA_ROSTER.ingresso236`, quota = bambini col loro calciatore disegnato):**

| contesto | prima (rosso) casa | prima ospiti | calciatori disegnati prima (casa/ospiti) | dopo casa | dopo ospiti | disegnati dopo |
|---|---|---|---|---|---|---|
| club (Premier, giornata 34) | 0,09 | 0,27 | 1,0 / 3,0 | 1,00 | 1,00 | 11 / 11 |
| Nazionale (Spagna-Portogallo) | 0,10 | 0,27 | 1,0 / 3,0 | 1,00 | 1,00 | 11 / 11 |
| coppa (Ottavi) | 0,09 | 0,27 | 1,0 / 3,0 | 1,00 | 1,00 | 11 / 11 |

Il difetto **non era solo della Nazionale**: era identico in tutti e tre i contesti. Lo dico perché il PO l'ha visto in
Nazionale e la richiesta parlava di «solo una squadra».

**Correzione.** `src/12-three-match-view.jsx:10309-10310`: con la partita in `walkout` il roster tiene disegnati tutti i corpi
(rosso `__CPM_NO_236` = comportamento di prima). Fuori dall'ingresso il roster resta com'era. Costo: per i ~10 s della
cerimonia si disegnano 22 corpi invece di 4 (i 22 bambini erano già disegnati); non misurato su telefono — da guardare al
collaudo. Foto: prima `foto-giro14/po236-prima.png`, dopo `po236-dopo.png` (stesso momento: squadre schierate).

**Fuori ambito, segnalato:** i bambini indossano la divisa della squadra avversaria a quella del calciatore che accompagnano
(`src/12-three-match-view.jsx:2168-2174`, «com'è sempre stato»). Con le coppie visibili si legge come scelta; se il PO li vuole
con la divisa della propria squadra è una decisione sua.

**Guardiano** `tests/visual/bambini-236.mjs` (`npm run bambini-236`, `CPM_CTX=club,nazionale,coppa`): verde se in ogni contesto
almeno il 90% dei bambini di **ciascuna** squadra ha accanto il suo calciatore disegnato; rosso riconosciuto in tutti e tre.
Esito: ✅ VERDE. Aggiunto a `ci-runner.mjs` per `src/12`/`src/13` e fra i passi lenti. `fila-227` resta in catena.

## Build

`CPM_FORZA_BUILD=1 node tools/build-src.mjs` → 21 frammenti; `node tools/check-src.mjs` → ✓ identico byte per byte.

## Catena `node ci-runner.mjs mirata`

Sul commit `6039839`, `CPM_CI_LOG=… node ci-runner.mjs mirata` (base = main remoto 7.999.164; file toccati rispetto a main:
`src/07`, `src/12`, `src/14`, `src/15`, `src/17`, `src/18` — `src/07` e `src/18` vengono dalla base 7.999.165, non da questo giro)
→ **54 passi, «✅ catena mirata su 7.999.165: 54/54 verdi»**, eseguita dentro il turno con attese in primo piano.

- Fra i verdi i tre guardiani nuovi: `schede-234` (699 s), `convocazione-235` (144 s), `bambini-236` (1426 s); e `fila-227`,
  `interazioni-226`, `design-system`, `griglia-mobile`, `validate-situations`, `partita-vera`, `career-critical`.
- ⚠️ `nomi-219` **instabile**: rosso alla prima prova («vicini 84% su 25 nominati, servono >=90%»), verde alla seconda. Era già
  instabile prima di questo giro (ROADMAP, 7.999.161: «tempo-138 e nomi-219 instabili, verdi alla prova 2 e 3»). Non posso
  escludere che le partite con l'autoplay seminato cambino traiettoria ora che le schede hanno tre opzioni: non l'ho misurato.
  Per la regola PO 13/10 («un guardiano instabile due volte si ripara») va riparato, fuori dall'ambito di questo giro.

STATO: FATTO sul ramo — tre richieste misurate prima e dopo, tre guardiani verdi con la prova del rosso, catena mirata 54/54
(una instabile, preesistente). Non promosso su `main` (non era nel compito). Da guardare sul telefono: costo dei 22 corpi
nell'ingresso (PO-236) e la scheda a tre bottoni in partita (PO-234).
