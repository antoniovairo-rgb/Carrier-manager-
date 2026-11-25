# Rapporto giro 366 — PO-649 «i giocatori volano sul campo»

Ramo `sviluppo/giro366-volano`, base `lavoro/201` (d98d8bb6 = 7.999.213 + giro 365). GAME_VERSION non toccata.
Foto del PO: `docs/collaudo-po/208-giocatori-volano.png` (sta su `main`, non sulla base).

## In breve

- **Causa misurata e corretta:** i difensori nella **posa di guardia** (`mx-defend-ready`, l'attesa in difesa della 7.999.32) stavano
  sospesi **0,27 u sopra i corpi fermi** (0,21–0,32) per tutta la scena, con la radice a terra. La clip piega le gambe ma il suo bacino
  è inchiodato alla quota da fermo (due chiavi uguali a 95,3): a scendere non è il corpo, sono i piedi a salire. Con le ombre vere del
  PC l'ombra resta sul prato e il corpo le sta sopra: è la foto del PO.
- **Correzione:** `_aTerra366` in `src/12`: una volta al caricamento, il bacino della clip scende di quanto la suola sta sopra quella
  della posa ferma (`idle`). Nessun costo per fotogramma. Dopo: **0,007 u** (massimo 0,026).
- **Non corretto in questo giro (misurato, serve una decisione):** le scivolate `tackle` e `slide-tackle` hanno lo stesso bacino
  inchiodato e si fanno a mezz'aria; i salti di testa dei compagni sul cross salgono senza la clip del colpo di testa. Vedi «Dubbi».
- **«Scivolano»:** misurato col testimone che c'era già, non cambia con questa correzione e non l'ho toccato (vedi sotto).

## Come ho misurato

Una sorgente sola per corpi e prato: il testimone `window.__CPM_VOLA366` (src/12, sola lettura, solo banco) legge la **suola** =
il vertice più basso della pelle dei piedi delle maglie **davvero disegnate**, con le ossa dell'ultimo fotogramma, contro il prato
a y 0. Corpi GLB accesi, vista da PC 1062×549 (come la foto: ombre vere), di giorno, teatro acceso.

Tre cose che la misura ha corretto strada facendo, tutte mie:

1. **In gioco fluido il 3D non si disegna.** Il campo è quello 2D dall'alto: le ossa restano ferme all'ultimo highlight. La prima
   misura dava numeri identici per centinaia di fotogrammi. Le quote si leggono solo nelle fasi `hl_*`. La foto del PO è quindi
   una scena 3D (lettura o esito), non gioco fluido.
2. **Scene forzate una dietro l'altra lasciano l'eroe a mezz'aria** (0,67 u nella lettura dopo una rovesciata tagliata a metà): è
   la sonda, non il gioco. I numeri qui sotto vengono da partite vere col pilota automatico.
3. **La prima «suola» era −0,09 costante**: leggevo una maglia nascosta di un altro livello di dettaglio. Ora conto solo le maglie
   visibili con tutti gli antenati e solo i vertici pesati sulle ossa del piede.

## Prima / dopo

Stessa partita vera (stesso seme), 7 minuti di parete, corpi × fotogrammi delle scene 3D. Soglia: suola oltre 0,15 u dal prato.
Riferimento: nella posa ferma la suola sta a **−0,09 u** (i corpi poggiano 9 centesimi sotto il piano del prato; è così da prima,
non l'ho toccato).

| Misura | Prima (`__CPM_NO_G366`) | Dopo |
|---|---|---|
| Corpi × fotogrammi con la suola oltre 0,15 u | 406 su 3.580 = **11,3%** | 175 su 3.511 = **5,0%** |
| …fra i corpi fermi o al passo (non portieri) | **19,3%** di 1.190 | **0,8%** di 1.293 |
| …di cui «fermo, radice a terra» (la posa di guardia) | 216 | 5 |
| Clip `mx-defend-ready`: suola sopra la posa ferma, massimo lungo la clip | 0,187 altezze-corpo (≈ 0,33 u) | 0,006 (≈ 0,01 u) |
| Guardiano, corpi disegnati in guardia: suola sopra i corpi fermi (mediana · min · max) | 0,274 · 0,210 · 0,321 u (57 letture, 15 corpi) | 0,007 · −0,005 · 0,026 u (51 letture, 9 corpi) |
| Ombra disegnata: distanza in pianta fra il piede e l'ombra (mediana · massimo) | 0,02 · 0,10 u | 0,02 · 0,13 u |

L'ombra **non era spostata**: in pianta sta sotto il corpo in entrambi i bracci. Si vedeva staccata perché il corpo era in aria.

Misure precedenti, con l'osso dell'avampiede al posto della suola (due partite vere prima della correzione): 15,1% e 16,9% oltre
0,15 u. La serie non è confrontabile con la tabella (strumento diverso), la riporto perché è da lì che è uscita la causa.

### Cosa resta sopra soglia dopo la correzione (175 righe)

| Chi | Righe | Causa misurata | Voluto? |
|---|---|---|---|
| Altri, scivolata (`tackle`, `slide-tackle`, `mx-soccer-tackle*`) | 75 | `tackle` e `slide-tackle` hanno il bacino inchiodato: il punto più basso di **tutto il corpo** sta a 0,35–0,39 altezze-corpo (≈ 0,65 u) per metà clip. Le tre `mx-soccer-tackle*` invece scendono a terra e alzano solo i piedi | le prime due no |
| Portiere, tuffo | 33 | tuffo | sì |
| Eroe, calcio (`mx-strike-foward-jog`) | 20 | il saltello della clip di tiro in corsa (0,15–0,23 u) | da giudicare a occhio |
| Altri, in corsa con la radice alta | 19 | il compagno che stacca sul cross: la radice sale fino a 1,5 u mentre suona la **corsa**, non il colpo di testa | il salto sì, la corsa in aria no |
| Eroe, esultanza (`lift`) | 9 | salto dell'esultanza | sì |
| Eroe, cambio di direzione | 8 | `change-direction`, bacino inchiodato, 0,21–0,36 u | no |
| Altri | 11 | sparse | — |

### «Scivolano» (velocità senza passo)

Il testimone del pattinamento che c'era già (`__CPM_PIEDI`, 7.999.7: piede a terra che scorre oltre 0,5 m/s): **49,4% prima, 53,4%
dopo** dei fotogrammi contati. Non lo considero un peggioramento: dopo la correzione i piedi «a terra» passano da 3.938 a 5.153
(prima chi stava in guardia aveva i piedi in aria e non veniva contato). Due limiti che dichiaro: il suo conteggio «negli
highlight» dà 0 su 0 in questa prova (non classifica le fasi), e il numero assoluto sul banco è in buona parte strumento (giro 22).
**Non posso confermare** con questi numeri quanto pattinamento vede il PO: serve un giro suo.

## File e funzioni toccate (per il treno, il 364 lavora sulle fasce)

- `src/12-three-match-view.jsx`
  - **nuovi**, dopo `_findBone904`: testimone `window.__CPM_VOLA366` (solo `?cpmtest=1`/`__CPM_REC`), `_blob366`, `_suola366`,
    `_alza366`, `_aTerra366`.
  - **una riga cambiata** dentro `_mkGestures`: alla creazione di `av._idleDif` la clip passa da `_aTerra366(_cd,av)`.
  - Nessun'altra funzione toccata: niente `animOne`, niente camere, niente arco del pallone, niente fasce.
- `CARRIER-MANAGER-AV.html` (ricomposto, `check-src` identico).
- `tests/visual/volano-366.mjs` (guardiano, verde + rosso), `tests/visual/misura-366.mjs` (sonda, nessuno la nomina),
  `tests/visual/package.json` (script `volano-366`), `tests/visual/ci-runner.mjs` (guardiano nella riga `src/12-|src/13-` che esiste già).
- `CLAUDE.md` (una riga d'invariante), `docs/collaudo-po/366-guardia-prima.png` e `366-guardia-dopo.png` (corpi accesi, scala 2).
- Non toccati: `GAME_VERSION`, `docs/governo/*` (BACKLOG e ROADMAP stanno su `main`: la voce PO-649 la chiude chi governa).

## Catena

CATENA_DA_COMPILARE

## Dubbi per il PO

**1. Le scivolate a mezz'aria (`tackle`, `slide-tackle`).** 75 righe su 175 del residuo; il corpo intero sta a circa 0,65 u dal prato.
- **A (consigliata): un giro dedicato che le porta a terra col criterio del corpo intero** (il punto più basso del corpo, non il
  piede) e rimisura il contatto piede-pallone. Non l'ho fatto qui perché abbassare il corpo di 0,65 u sposta il piede che tocca il
  pallone e il difensore del giro 343, e il 364 sta lavorando sulle stesse scene.
- B: sostituirle con le tre `mx-soccer-tackle*`, che a terra ci vanno già. Costa una clip in meno di varietà e va rivista la
  finestra del gesto.
- C: lasciarle. Restano la prima causa di corpi in aria dopo questa correzione.

**2. Il compagno che stacca sul cross sale correndo.** La radice arriva a 1,5 u mentre suona la corsa.
- **A (consigliata): montare la clip del colpo di testa per tutta la salita** (stessa regola del giro 342 per l'eroe), in un giro
  suo dopo il 364, che tocca proprio le azioni di fascia.
- B: abbassare il tetto del salto dei compagni (1,5 u è quasi un'altezza-corpo). Più semplice, ma resta una corsa in aria.
- C: lasciarlo. Sono pochi fotogrammi (19 su 3.511), ma si vedono bene perché il corpo è alto.

**3. I corpi poggiano 0,09 u sotto il piano del prato nella posa ferma, 0,05 u sopra in molte clip `mx-`.** Lo scarto fra le due
famiglie è 0,12–0,14 u e non dipende da questo giro.
- **A (consigliata): niente adesso.** Nessuna nota del PO lo segnala e a schermo la scarpa si vede intera; lo tengo come misura.
- B: un giro che porta tutte le clip alla stessa quota di suola (stessa funzione `_aTerra366`, clip per clip, coi salti esclusi).
- C: alzare i corpi fermi di 0,09 u. Tocca la quota di tutto (pallone ai piedi, contatti): lo sconsiglio.

**4. «Scivolano».** Con gli strumenti di oggi non ho un numero affidabile.
- **A (consigliata): un giro di sola misura** che ripara il conteggio per fase del testimone 7.999.7 e dà un numero per le scene 3D,
  poi si decide.
- B: giudizio a occhio del PO sulla prossima versione, ora che i corpi in guardia stanno a terra.
- C: considerarlo chiuso con PO-252. Non lo consiglio: quella voce riguardava l'eroe nella conclusione, non i ventidue.

**5. Da quale versione?** La posa di guardia è entrata con la 7.999.32 (27/09) e la sua clip non ha mai avuto il bacino che scende.
**Non posso confermare** dal repository se nelle versioni fra la 32 e la 207 si vedesse uguale: la storia git di `lavoro/201` è
compressa e non ho rigiocato le versioni vecchie.
- **A (consigliata): non indagare oltre**, la causa è nella clip e non in una versione recente.
- B: rigiocare la 7.999.206 dal tag e misurarla con la stessa sonda (circa mezz'ora).
- C: chiedere al PO quando l'ha notato la prima volta.
