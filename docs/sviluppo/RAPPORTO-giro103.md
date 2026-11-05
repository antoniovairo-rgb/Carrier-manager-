# Rapporto giro 103 — tronco 1 della catena notte 178: quattro rossi

Ramo `sviluppo/giro103-tronco1` (da `lavoro/178`, 4a4ff494: 7.999.178 con i giri 90-100). `GAME_VERSION` e `docs/governo/*`
non toccati (riparazione mirata dentro la 7.999.178, come i giri 95-100). Sorgenti in `src/`, HTML ricomposto con
`node tools/build-src.mjs`, `node tools/check-src.mjs` allineato (byte per byte).

Fonte dei rossi: `docs/governo/catena-178-t1.out` e `.log` sul ramo `catena/178-t1` (riga di sintesi per passo; il log completo dei
passi non c'è, quindi per ogni rosso la prima mossa è stata rigiocarlo).

Sintesi: **tre difetti del gioco** — highlight-95 D3 (riserva/chiusura dell'esito a fotogrammi lenti) e due cause di scena3d-96 D11
(consegna in area dal passaggio raccolto; colla di conduzione dopo il volo) — e **tre difetti dello strumento** (chiusura-99 crash,
parata-100 rosso cieco, scena3d-96 D13 dipendente dai fotogrammi). Ogni correzione del gioco ha il suo interruttore rosso
(`__CPM_NO_G103A/B/C`) e un guardiano verde/rosso (`riserva-103`, `consegna-103`, `colla-103`).

## 1. highlight-95 D3 — «Tiro a giro», esito rivelato dalla riserva col 3D ancora sulla conclusione

**Misura prima.**
- Rigiocato tre volte sulla base 178 (con un testimone di sola prova aggiunto al registro `__CPM_REV95`: stato `cineBusy` e orologio di
  scena al momento della rivelazione): s1/1234 (11 highlight), s1+s5 × 3 semi × 2 politiche (67 highlight), s1+s5 con un
  registratore di scena per fotogramma (55 scene). **Il difetto non si è ripresentato (0 su 133)**; nel flusso vero la conclusione
  resta occupata al massimo **2,96 s di scena** (mediana ~1,4 s). Scene «non giudicabili» per la guardia di parete: 13 su 67.
- Lettura del codice (src/15, `revealRiserva95`): la riserva parte **2,6 s di PARETE** dopo la risoluzione e da lì aspetta il renderer
  fino a **6 s DI SCENA**. Con il `dt` tappato a 0,05 s (src/12), sotto i 20 fps la scena avanza più lenta della parete: i 2,6 s di
  parete valgono pochi decimi di scena e il tetto effettivo dalla risoluzione scende da **8,6 s** (30 fps) verso **6,3 s**. Stesso
  schema nella chiusura della finestra d'esito (`_avanza461`, «via chiusura»): finestra `dur` in parete, tetto 6 s di scena da lì.
- La sonda forzata `occupata-103.mjs` (tiri forzati) mostra conclusioni brevi (≤ 2 s di scena): le scene forzate non hanno la
  costruzione lunga del flusso vero, quindi non riproducono D3 da sole.
- **Riproduzione deterministica** (`riserva-103.mjs`): conclusione dichiarata occupata per 8 s di scena (`__CPM_BUSY103`, solo sonde),
  esito ammesso solo dalla riserva (`__CPM_G103SOLORISERVA`), CPU rallentata ×2 via CDP. Sulla base: esito a **6,56-7,11 s di scena,
  a conclusione in corsa**, 3 scene su 3 (scena trascorsa nei primi 2,6 s di parete: 0,61-1,04 s).

**Verdetto: difetto del GIOCO** (a fotogrammi lenti: headless carico e telefono sotto i 20 fps). Vale «almeno medio» e blocca il
rilascio.

**Correzione** (src/15). Riserva e chiusura aspettano anche il tetto contato **dalla risoluzione / dall'ingresso in `hl_result`**, in
secondi di scena (8,6 s = 2,6 + 6 per la riserva; `dur` + 6 s per la chiusura). Si aspetta finché vale il vecchio tetto **oppure** il
nuovo: l'attesa non è mai più corta di prima, e a 20+ fps (parete = scena) il percorso è identico. Guardie di parete invariate (30 s).
Rosso **`__CPM_NO_G103A`** = comportamento 7.999.178. Sotto il gate (`?cpmtest=1` senza `__CPM_CINE`/`__CPM_REALWAIT`) il ramo non è
attivo: percorso del gate invariato.

**Misura dopo** (`riserva-103`, CPU ×2): **verde 3/3 esiti a conclusione finita** (8,07-8,09 s di scena, via chiusura); **rosso 3/3 a
conclusione in corsa** (7,00-7,11 s). Guardiano `riserva-103` (nuovo, in `package.json` e in `ci-runner.mjs`: catene completa e
carriera, MAPPA `src/15-`, tra i LENTI; ~8 min). Esce ≠0 se il verde ha meno di 2 scene giudicate o una a conclusione in corsa, se il
rosso non è abbastanza lento da giudicare (scena nei primi 2,6 s > 2,0) o se il difetto non si vede su tutte le scene giudicate.

**Seconda causa, trovata dai rigiochi finali** (build cf32237): highlight-95 verde rosso **due volte su due** su ROTH s5/2021 «Uno-due»
(«il portiere dice no a ROTH», minimo portiere-pallone **47,0** e **33,6**; HOWARD s12/7 **35,7** una volta), mentre nelle mie corse a
carico normale la stessa scena dava 3,4-3,5 **con le correzioni accese e spente**. Erano scene che prima uscivano «non giudicabili»
(guardia di parete: 8 su 17 nel giro 100, 13 su 67 qui) e che `__CPM_PARETE103` rende giudicabili. **Riprodotto in modo deterministico**
rallentando la CPU di Chromium ×6 (CDP, `CPM_CPU=6`): l'esito arriva dalla riserva a **2,8 s di parete col pallone ancora ai piedi
dell'eroe** (palla-eroe 0,0) e la scena si chiude a 4,2 s — stesso esito con lo strumento vecchio e con quello nuovo. A fotogrammi
lentissimi, dopo 2,6 s di parete il renderer non ha ancora **cominciato** la conclusione: «non occupata» veniva letto come «finita».
*Correzione* (src/15, stesso rosso `__CPM_NO_G103A`): la riserva aspetta anche i suoi **2,6 s di scena** dalla risoluzione e, sulle
scene col tiro del compagno (`waitPA`, dove l'esito **è** il 3D), che la conclusione sia **almeno cominciata** (contatore `nb` di
fotogrammi occupati scritto dal renderer, tetto 8,6 s di scena); la chiusura della finestra idem (`dur`, e `dur`+6 s se `waitPA` non
è cominciata). A 20+ fps i tempi minimi sono già trascorsi quando la riserva parte: percorso invariato.
*Misura dopo* (CPU ×6, s5/2021, passaggi): ROTH «Uno-due» **3,6** · «Servi ROTH libero» **3,2** (prima 16,0 a pallone fermo, e non
giudicata). *Guardiano* **`lento-103`**: highlight-95 a CPU ×6 su s5/2021, verde (0 difetti, ≥ 2 parate giudicate) e rosso
`__CPM_NO_G103A` (deve comparire un D3 «pallone mai al portiere»).
*Strumento* (stessa famiglia, corretto insieme): in highlight-95 e parata-100 la finestra «entro 1,5 s dall'esito» era di **parete**;
ora è di **scena** (`__CPM_SCENET`), identica a 20+ fps. «Si fa parare il tiro» non rientrava nell'espressione delle parate (`parat`)
e la scena non veniva giudicata: aggiunto `parar`. Soglia (6) e finestra (1,5 s) invariate.

**Terza causa, trovata dai rigiochi finali** (build 2e4fe12): l'unico difetto verde residuo di highlight-95, in entrambe le corse, è
**HOWARD s12/7 «Uno-due»**, «para il portiere su HOWARD» col pallone a **6,0** e **6,9** dal portiere. La stessa scena dava **5,8** con
le correzioni A/B/C spente e **6,1** accese: è sul filo della soglia 6 indipendentemente da esse (prima finiva «non giudicabile»). In
src/12 il tiro del compagno parato convergeva sul portiere in x a 3,2/s ma in z solo a 2,2/s, e la respinta partiva a u 0,72 dovunque
fosse il pallone: col portiere spostato di lato restavano 5-6 unità. *Correzione*: z converge come x e la respinta aspetta il
contatto (entro 2,5 dal portiere) o la fine del volo (u 1); il tuffo parte a 0,72 come prima. Rosso **`__CPM_NO_G103D`**.
*Misura*: HOWARD **verde 2,6 · rosso 6,2**; nella stessa partita «Sponda di prima per HOWARD» 2,3 e «Scarica su SPENCER» 1,9.
*Guardiano* **`contatto-103`** (highlight-95 su s12/7, verde contro `__CPM_NO_G103D`).

**Un guardiano declassato.** `lento-103` (highlight-95 a CPU ×6 sul flusso vero) **non è deterministico**: lo stesso braccio senza le
correzioni dà minimo portiere-pallone **33,6 a load 15-19** e **3,5 a load 9** — il difetto dipende dal carico reale della macchina,
non solo dal rallentamento della CPU. Nella corsa finale 1 il suo rosso non si è visto. Resta come **sonda** di collaudo, **fuori dalle
catene**; la prova del rosso di `__CPM_NO_G103A` è tutta in `riserva-103`, che ora ha **due casi**: A «conclusione lunga» (occupata
subito; verde esito a conclusione finita 8,05 s di scena · rosso in corsa 6,68-6,78) e B «conclusione non ancora cominciata» (gancio
`__CPM_BUSY103DA`: la conclusione comincia dopo 3 s di scena; si giudica il minimo di 2,6 s di scena dalla risoluzione — verde
2,61-2,66 · rosso 1,36-1,98). Entrambi i casi: verde 0 difetti, rosso visto su tutte le scene giudicate.

Ganci di sola prova aggiunti (attivi solo con `__CPM_REC`/`_CPM_TEST`): `__CPM_PARETE103` (allunga la guardia di parete di riserva e
chiusura perché la misura conti i secondi di scena anche a macchina carica), `__CPM_G103SOLORISERVA`, `__CPM_BUSY103`, campi `c103`/
`rr103` nel testimone `__CPM_REV95`. highlight-95 e parata-100 armano `__CPM_PARETE103` (meno scene «non giudicabili»).

## 2. parata-100 — «rosso: il difetto non si vede (2 parate)»

**Misura.** Nella catena il braccio rosso aveva 2 parate, **entrambe «non giudicabili»** (riserva fermata dalla guardia di parete,
30 s: macchina carica) → zero giudicate → «il difetto non si vede». Non era un rosso cieco per costruzione ma per copertura.
**Verdetto: STRUMENTO.**

**Correzione** (solo sonda). (a) `__CPM_PARETE103=150000`: la riserva conta i suoi 6 s di scena anche a pochi fps, quindi le parate
restano giudicabili; (b) se un braccio resta senza la scena da giudicare (verde: meno di 3 parate del compagno o nessuna sul ramo
`cross_goal`; rosso: nessuna parata giudicabile) si rigiocano le stesse partite, al massimo due volte, **dichiarandolo**. Soglie
invariate (minGB > 6 = difetto; pavimenti 3 e `cross_goal`).

**Misura dopo** (build 178 + gancio): verde 4/4 parate al portiere (1 su `cross_goal`), **non giudicabili 0**; rosso 2 parate, **2
difetti visti** (SEIFERT minGB 46,3 · ROTH 11,7). ✅

## 3. chiusura-99 — crash di Node («} | | Node.js v22.23.4»)

**Misura.** Rigiocata sulla base: crash riprodotto alla prima corsa, nel braccio rosso D9:
`page.evaluate: TypeError: Cannot read properties of null (reading 'style')` (riga 78). Il sovrimpresso «GOOOOL!» viene smontato dal
timer del gioco (`setGoalCinema(null)` a 2,6 s di parete) mentre la sonda scatta le tre fotografie A/B/C: sotto carico l'elemento
sparisce fra una foto e l'altra. Seconda prova a conferma: con il solo try/catch, **27 tentativi** falliti per la stessa eccezione e
D9 cieco (3/6). Inoltre (punto aperto del giro 100) la scritta veniva fotografata dove la trovava l'attesa: oltre l'80% di `goalDrop`
sfuma e cresce (scala 1,05) → maschera 3.500 px invece di ~2.400 e contrasto col quadro 2,7.
**Verdetto: STRUMENTO.**

**Correzione** (solo sonda): si fotografa una **copia statica** del sovrimpresso (non appartiene a React, resta finché la sonda la
toglie; l'originale si nasconde); l'animazione è fissata al **65% di `goalDrop`** (opacità 1, scala 1) con il quadro 3D congelato
(`__CPM_FROZEN`) per le tre foto; la maschera è legata ai **soli pixel di riempimento** (B toglie solo `-webkit-text-fill-color`, e in A
il pixel deve avere il colore della lettera); le eccezioni di Playwright diventano tentativi falliti (con messaggio stampato) e la
partita vera di RIC si riprova una volta. Soglie invariate (mediana ≥ 4,5, nessun gol sotto 3).

**Misura dopo**: D9 verde **6/6, mediana 5,59, minimo 4,42**, maschera **1.685 px costante** (1.411 su gi18); D9 rosso **6/6 misurati,
mediana 1,45, 6 sotto 3** (si vede); RIC verde 6/6 (100%), RIC rosso 2/6.

## 4. scena3d-96 — «rossi per punto {"D11":1}»

**Misura prima** (due corse sulla base 178 con dump dei fotogrammi, 31/31 scene giudicate ciascuna, macchina carica — load 10-14):
D11 **non riprodotto** (0 salti in 62 scene); massimo legittimo 2,79 u in un fotogramma. Il messaggio D11 non diceva chi aveva
scritto il pallone: ora riporta **scrittore, scrittore del fotogramma precedente, fase e posizione**. Con questa attribuzione, nelle
corse successive il salto è comparso due volte, da **due cause diverse**, entrambe del **gioco** e preesistenti sulla 178:

**4a. Consegna in area dal passaggio raccolto** — `pc-gi18-riesce`, **3,9 u in 0,050 s**, scrittore `esito:cross_goal` subito dopo
`ricevente-pass`, pallone a x 23,6. Sul percorso «arrival-gate» (`assist_recv → cross_goal`) il pallone è a terra, ma la consegna
partiva dalla quota di un cross (0,22 + sin(0,25π)·3 ≈ 2,3): scalino di ~2 u in un fotogramma a qualunque fps, più la partenza
orizzontale 3,8 × distanza (62 u/s da x 23,6), oltre la «velocità da pallone» del giro 96a (48 u/s).
*Correzione* (src/12): lo scarto di quota sfuma lungo la consegna (schema `_y100` del giro 100) e la partenza orizzontale è tappata a
48 u/s. Rosso **`__CPM_NO_G103B`**.
*Guardiano* `consegna-103`: gi18 «riesce» su PC a blocchi di 4 scene finché ogni braccio ha visto il percorso (esce in ~1 scena su 3:
posizioni del ricevente non seminate). Misurato (build 79c47be): **verde 3 ingressi, scalino massimo 2,34 u, 0 salti** · **rosso 2
ingressi, 4,68 u, 3 salti D11**.

**4b. Colla di conduzione dopo il volo** — `pc-gi64-parata`, **3,5 u in 0,050 s**, scrittori **`buildup-volo+testa`** nello stesso
fotogramma: è il residuo già dichiarato dal 7.515. Al passaggio volo→conduzione il volo (tappato a 48 u/s dal giro 96a) è indietro sul
piano e la colla recuperava tutto il ritardo in un fotogramma, a qualunque fps.
*Correzione* (src/12): solo se il pallone è fra **1,5 e 6 u** dalla sua posizione d'inizio fotogramma, lo raggiunge a 48 u/s (2-3
fotogrammi), poi colla esatta; oltre 6 u (riposizionamento, apertura di scena) colla secca come prima. Non è l'easing revocato nel
7.387 (sempre attivo, 0,2 s): sotto 1,5 u la colla resta istantanea. Rosso **`__CPM_NO_G103C`**.
*Guardiano* `colla-103`: il caso è raro nel flusso (1 scena su ~31; in 5 scene di rosso non si è visto), quindi è reso deterministico
col gancio di sola prova `__CPM_G103LAG=3` (al primo fotogramma di colla il pallone si finge 3 u indietro) e il testimone
`__CPM_G103C`. Misurato: **verde 3 colle, passo massimo 2,40 u = tetto 48·0,05** · **rosso 3 colle, 3,00 u**. Non-regressione:
`ball-owner` (CPM_IA_MAX=120) **verde, 0 ≤ 120**, baseline F2 su 1.489 fotogrammi.

**4a-bis. Altri due scrittori della stessa famiglia** (trovati dalle corse successive, con l'attribuzione): `tel-gi18-riesce` **3,7 u**
`ricevente-cross+esito:cross_goal` (la sospensione sull'incornata incollava il pallone alla testa del compagno appena entro 3,2 u) e,
nel verde di `consegna-103`, `pc-gi18` **3,1 u** `esito:assist_shot` (il tiro del compagno insegue il bersaglio con 3,2 × distanza:
~50 u/s più la salita). Stesso rimedio, stesso rosso `__CPM_NO_G103B`: passo del fotogramma sotto 48 u/s dalla posizione d'inizio
fotogramma (oltre 6 u è un riposizionamento e resta com'era). **Censimento per scrittore dopo** (24 scene, pc + telefono, dump):
nessuno scrittore oltre **2,71 u** per fotogramma (`buildup-volo` 2,71 · `esito:cross_goal` 2,43 · `ricevente-cross+esito:cross_goal`
2,19 · `arco` 1,91 · `buildup-volo+testa` 1,72 · `esito:assist_shot` 1,68). `consegna-103` dopo: **verde** 3 ingressi, 2,40 u, 0 salti ·
**rosso** 4,81 u, 5 salti D11; ora gira anche sul telefono e conta i fotogrammi della sospensione.

**4c. D13 (pc-walkout) — STRUMENTO.** Rosso in entrambe le corse a macchina carica: 0,84 (88 letture) e 0,81 (72) — non nella catena.
La sonda smetteva di guardare l'ingresso a **150 s di parete o 400 letture**: a fotogrammi lenti vedeva solo l'inizio (il tappeto che
si allinea dopo uno stacco), a fotogrammi veloci si fermava a 6-7 s di scena; la fine dell'ingresso la decide `walkT` (scena). Ora si
guarda fino alla fine vera (rete 600 s; «non finito» = non giudicabile, rosso) e il testimone porta la copertura in secondi di scena.
Soglia 0,9 invariata. Prima misura dopo: tel-walkout finito, 10,4 s di scena, 210 letture, 0,93.

**4d. D2/D3 «eroe fuori quadro» su PC — preesistente, non corretto.** Visto 4 volte, sempre su PC e a macchina carica, anche sulla
**base 178**: base pc-gi31 0,338 e pc-gi18 0,216; build pc-gi31 0,091; più, a load 20, pc-gi15 D8 taglia 0,057 e D3 pallone fuori quadro
a fine scena (che a carico moderato tornano verdi 4 su 4, sia su base sia su build: taglia 0,161-0,166). Nel dump di pc-gi31 l'eroe
proiettato esce di molto dal quadro (piedi a (-10,7; -27,3), testa dietro il piano camera) per ~1,15 s di scena. Coerente con il
difetto noto «camera in tempo di scena sotto i 20 fps» (CLAUDE.md, 7.708: il riscalo della camera è stato revocato dal PO). È una
decisione di prodotto già presa: **non lo tocco** e lo segnalo; scena3d-96 lo può mostrare a macchina molto carica.

**Gate** (src/12 toccato): validate-situations sul build con le correzioni B e C — prima corsa **rossa su `final-state` gi136**
(«goal_against» con pallone a x 63,3), seconda corsa **PASS 00001505, 0 failure**; base 178 nello stesso momento PASS 00001505. In
isolamento gi136 esce «save» in 3 ripetizioni su base e su build (l'esito dipende dalla sequenza del generatore seminato del gate, che
consuma numeri per fotogramma). `final-state` ha già una storia di rossi intermittenti non riproducibili (gi152, 7.980-7.988). Il gate
è nei rigiochi finali, due volte.

## 5. Rigiochi finali

(in corso — numeri sotto)

## Punti aperti
