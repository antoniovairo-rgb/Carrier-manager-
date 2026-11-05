# Rapporto giro 104 — ultime riparazioni mirate della 7.999.178

Ramo `sviluppo/giro104-ultimi` (da `lavoro/178`, 97f145b4: giri 101-103 uniti). `GAME_VERSION` e `docs/governo/*` non toccati
(riparazione mirata dentro la 7.999.178, come i giri 95-103). Sorgenti in `src/`, HTML ricomposto con `node tools/build-src.mjs`,
`node tools/check-src.mjs` allineato (byte per byte).

Fonte: `docs/governo/catena-178-finale.out/.log/-rossi.txt` sul ramo `catena/178-finale` — 128/128 verdi al rigioco, due guardiani
instabili: highlight-95 (rosso 1/2, D3 «Uno-due con LUZI») e chiusura-99 (rosso 2/3, «servito 9 nominato 8 …»). Il runner conserva
solo le ultime tre righe di ogni prova: per entrambi la prima mossa è stata rigiocarli e leggere il codice.

Sintesi: **in entrambi i casi la riga riportata dalla catena come «primo rosso» è un difetto ATTESO del braccio ROSSO**, non del verde:
le due sonde stampano il rosso dopo il verde, e il runner conserva solo le ultime tre righe. Il difetto vero del verde (highlight-95
«verde: 1 difetti»; chiusura-99 un `fail++` muto) **non è mai stato scritto** e **non posso confermare quale fosse**. Correzioni dello
strumento: entrambe le sonde ora dichiarano per ultimo il motivo del verde, e il runner salva il log completo di ogni prova rossa.
In più: highlight-95 leggeva sotto carico la rivelazione di un'altra scena (10 su 93) — corretto; e un meccanismo **latente** del gioco
(riserva dell'esito che agisce sul riquadro della scena successiva) dimostrato con un gancio, mai osservato in modo naturale, corretto
con rosso `__CPM_NO_G104A` e guardiano `riserva-104` (scelta prudente spiegata sotto).

## 1. highlight-95 — «D3 s1/1234 «Uno-due con LUZI»: esito «Anticipato dall'avversario» rivelato dalla riserva …»

**Quale braccio.** La coda della catena è `· D3 … LUZI … | ❌ highlight-95 | · verde: 1 difetti`. highlight-95 stampa per ogni braccio
riepilogo e (fino a 14) difetti, **prima il verde e poi il rosso**, poi «❌» e l'elenco dei motivi: la riga D3 che precede «❌» è
l'ultimo difetto stampato dal **rosso** (`__CPM_NO_G95D1..D4`, `__CPM_NO_ASSIST298`). Prova diretta: rigiocato highlight-95 su s1/1234
(build 3f691e2, verde+rosso), il rosso produce **la stessa riga** due volte («D3 s1/1234 «🔁 Uno-due con LUZI»: esito «Anticipato
dall'avversario» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione», `cap` e `rr103` nulli) — e **solo nel rosso**
LUZI viene intercettato: nel verde, in tutte le mie corse (CPU normale, ×3, ×4, ×6, ×8), «Uno-due con LUZI» esce «LUZI si fa parare
il tiro». Il motivo del verde («1 difetti») non è nella coda: **non posso confermare** quale fosse.

**Misura (verde).**
- s1/1234 sette volte (CPU normale e rallentata ×4, ×6, ×8 via CDP) e tre giri completi del verde (18 partite ciascuno; il secondo e il
  terzo a CPU ×3, il terzo a carico 15-20 su 4 core, più pesante della catena): D3 «riserva» **0**; occupazione della conclusione
  **massimo 2,96 s di scena** su 243 finestre (il tetto della riserva è 8,6 s); su 133 scene annotate **nessuna «riserva + occupata»**.
- Unico difetto verde visto in tutte le mie corse: nel terzo giro completo (CPU ×3, carico 15-20) **«D3 s5/1234 «Uno-due con SCHRÖDER»:
  para il portiere ma il pallone non arriva mai al portiere entro 1,5 s dall'esito (minimo 30,8)»**, rivelazione «riserva» su una scena
  col tiro del compagno a 3,0 s di parete. È la classe già descritta dal giro 103 (`lento-103`: dipende dal carico reale, non
  deterministica). È un **candidato** per il «verde: 1 difetti» della catena (carico alto, stesso guardiano), non una prova. Non
  corretto qui: non riprodotto a carico normale, nessuna misura deterministica nel tempo del giro.

**Strumento, corretto.**
- Il verde fallito ora dichiara **quale** difetto (primi due) ed è l'ultima riga: la coda del runner dice braccio e motivo.
- La rivelazione si prendeva come «l'ultima voce del registro `__CPM_REV95` quando la sonda vede l'esito». Sotto carico (CPU ×3, giro
  completo): **10 letture su 93 highlight appartenevano a un'altra scena** (7 su 69 nel giro successivo), soprattutto gol e assist che
  non scrivono una voce propria. Ora si abbina **per indice** (`hl`, scritto dal gioco nel registro e nel testimone della scena); le
  letture discordanti si contano e si stampano. La diagnosi del D3 (`cap`, `c103`, `rr103`) si stampa **sempre**. Soglie invariate.

**Gioco: un meccanismo latente, corretto per costruzione (scelta prudente).** Leggendo il codice per spiegare un «riserva + occupata»
(prima di sapere che la riga era del rosso) ho trovato che `revealRiserva95` (src/15) leggeva **sempre** il riquadro corrente
(`outcomeRevealRef.current`), non quello per cui era stata programmata. Un richiamo della riserva di una scena che arriva dopo la
risoluzione della successiva trova un riquadro nuovo con l'orologio di risoluzione e i tempi della scena vecchia, chiama
`fireOutcomeReveal('riserva')`, che scrive `o.via='riserva'` e rimanda al pavimento `minAt`: alla scadenza l'esito esce col 3D a metà
conclusione.
- *Riproduzione deterministica* con il gancio di sola prova `__CPM_G104STALE` (solo con `__CPM_REC`: a ogni risoluzione rimanda di 60 ms
  il richiamo della riserva della scena precedente). Rosso `__CPM_NO_G104A`, s1/1234: **2 D3 su 5 highlight** («Uno-due con MAURO:
  Anticipato dall'avversario», pallone a 0,0 dall'eroe, arco in pre-volo; «Stacco in corsa potente»). Verde: **4 richiami altrui
  intercettati, 0 D3**.
- *In modo naturale non si è mai visto*: testimone `__CPM_G104X` (richiami su riquadro altrui) **0** nel giro completo a CPU ×3 e carico
  15-20 e in tutte le altre corse dopo la build. Lo dichiaro: è un difetto latente, non la causa della catena.
- *Correzione* (src/15): la riserva porta il riquadro per cui è nata (`o0`, dai tre punti che la programmano, dal ramo «tiro del
  compagno» e dai suoi richiami a 180 ms) e se il riquadro corrente è un altro non fa nulla. Nessun tempo cambiato: quando il riquadro è
  il suo il percorso è identico. L'ho tenuta perché è innocua sul percorso normale e chiude per costruzione una strada che produce
  esattamente il difetto «esito prima del 3D»; se il PO preferisce non spedire un rimedio senza occorrenza naturale, si ritira togliendo
  il blocco `o0` (il rosso `__CPM_NO_G104A` mostra il comportamento di prima).
- *Guardiano* **`riserva-104`** (nuovo; `package.json`; `ci-runner.mjs`: catene completa e carriera, MAPPA `src/15-`, fra i LENTI; ~10-15
  min): esce ≠0 se il verde ha meno di 3 highlight, se il gancio non ha agito (0 richiami da intercettare: passata cieca), se il verde ha
  un D3 «riserva», o se il rosso non ne mostra nessuno. Testimoni di sola prova: `__CPM_G104X`, `__CPM_G104D`.

## 2. chiusura-99 — «seme 2021 scena 22|2 (2) servito 9 nominato 8 a 31.4u; scena 81|6 (6) servito 8 nominato 5 a 39.7u»

**Quale braccio.** Le due righe sono del **braccio ROSSO** (`__CPM_NO_G99RIC`), cioè i difetti attesi. chiusura-99 esegue verde (D9,
RIC) e poi rosso (D9, RIC); il rosso RIC stampa per ultimo le sue righe «servito/nominato»; se il rosso non si fosse visto o fosse stato
cieco, il guardiano avrebbe stampato «✗ il rosso di RIC non si vede» / «✗ rosso RIC cieco» subito prima della riga finale, e non c'è.
Il solo modo di avere `ROSSO (1)` senza nessuna di quelle righe è un **verde non ok**, il cui `fail++` **non stampava nulla**.
Rigiocato il rosso RIC sul seme 2021: ricade proprio sulla scena **22|2** (servito 6 nominato 8 a 22,2u) e su 5|0. Il motivo vero del
verde nella catena (D9 o RIC) **non è mai stato scritto**: **non posso confermarlo**.

**Misura (verde).** RIC **51/51** scene servito = nominato in 8 corse prima dei rigiochi finali (semi 1234 e 2021 ×5, più 7, 99, 555,
31337, 4242, 808), 3 delle quali a carico 11-13 in parallelo con highlight-95; D9 **5/5 corse verdi** (6/6 gol, mediana 5,52-5,59,
nessuno sotto 3), 3 sotto carico. Poi due corse complete del guardiano (sotto). Il rosso della catena **non si è riprodotto**.

**Verdetto: STRUMENTO** per la parte dimostrata (verde muto: il runner riportava come «primo rosso» le righe attese del rosso). Gioco o
strumento per la caduta del verde: non determinabile con i dati della catena.

**Correzioni (solo strumento).**
- chiusura-99: ogni parte ritorna il suo **perché**; i giudizi si stampano per ultimi, prima il rosso e poi il verde («✗ verde RIC ROSSO:
  servito = nominato 5/6 · seme … servito … nominato …», «✗ verde D9 ROSSO: gol misurati … mediana … sotto 3: …»): le tre righe di coda
  dicono braccio e motivo. Soglie invariate.
- Testimone B4 (src/12, solo `__CPM_B4REC`): il ricevente si legge solo a **conclusione partita** (`_ccx460`, scritto da
  `fireConclusion`). Con la costruzione R5, `fireConclusion` parte a costruzione finita (src/12 r. ~7667) e nei fotogrammi prima
  `passTargetMesh` è ancora quello della scena precedente (non si azzera al cambio scena). Misurato: **0 scene** su 51 in cui il primo
  fotogramma di `hl_result` precede la conclusione, nel regime della sonda (`__CPM_PRESENT=1`) — **non è la causa dimostrata** del rosso
  della catena; resta perché è corretta per costruzione. `CPM_B4PRIMO=1` riporta la lettura vecchia (6/6 in due corse, identico).
  Effetto collaterale dichiarato: assist-nome-98 stampa (solo informativo, non giudicato) «3D ricevente = cast» su meno scene (2/4 e
  3/6 nei rigiochi), perché le scene senza conclusione partita non vengono più contate.
- `ci-runner.mjs`: **ogni prova rossa salva il suo log completo** in `tests/visual/out/ci-rossi/<passo>-<ora>.log` e il percorso entra
  nella coda («… | log out/ci-rossi/…»). La prossima volta «quale braccio, perché» si legge invece di dedurlo.

## Rigiochi finali (build 3f691e2; dopo, solo sonde/runner/rapporto)

Macchina carica durante tutti i rigiochi (load 6-20 su 4 core: due-tre rituali in parallelo).

| Passo | Prova 1 | Prova 2 |
|---|---|---|
| test:logic | ✅ 43/43 | — |
| save-compat | ✅ 12 pass · 0 fail | — (una corsa a macchina carica PRIMA della correzione era uscita «0 pass · 1 fail»; rigiocata subito 12/12) |
| riserva-104 | ✅ verde 4 intercettati · 0 D3 · rosso 2 D3 | ✅ verde 4 · 0 D3 (rosso: vedi log) |
| riserva-103 | ✅ A verde 0 in corsa / rosso 2 · B verde 0 / rosso 3 | ✅ A verde 0 / rosso 2 (gi17 «mai rivelato in 160 s» in entrambi i bracci: preesistente, uguale con `__CPM_NO_G104A`; pavimento 2/3) |
| chiusura-99 | ✅ verde D9 6/6 med. 5,59 · RIC 6/6 — rosso D9 1,36 · RIC 3/6 | ✅ verde D9 5,59 · RIC 6/6 — rosso D9 1,50 · RIC 3/6 |
| assist-nome-98 | ✅ verde+rosso (D1 verde 12 assist col nominato, nome 100% · rosso 22,2%) | _in corsa_ |
| highlight-95 s1/1234 | ⚠️ verde 18 highlight **0 difetti**, rosso 40 difetti (pavimenti 12 passaggi / 4 finte non raggiungibili su una sola partita, D2 rosso non visto per lo stesso motivo) | — |
| highlight-95 completo | _in corsa_ | — |

## Fuori ambito / punti aperti
1. highlight-95 «verde: 1 difetti» della catena: non attribuito. Candidato misurato: D3 «pallone mai al portiere» (SCHRÖDER s5/1234,
   minimo 30,8) a CPU ×3 e carico 15-20, classe `lento-103`. Serve la prossima catena col runner nuovo (log completo).
   Il richiamo tardivo della riserva su riquadro altrui non si è visto in modo naturale (`__CPM_G104X` 0).
2. chiusura-99: la caduta del verde nella catena resta non attribuita (vedi 2). Con il runner nuovo il log completo resterà.
3. `lento-103` è ancora nelle liste delle catene di `ci-runner.mjs` nonostante il giro 103 l'abbia declassato a sonda: non toccato.
4. File di scarto `/h95-full2.log` (688 byte, un mio lancio sbagliato di cartella) nella radice del container: la rimozione è stata
   bloccata dal controllo di sicurezza; non è nel repository.
