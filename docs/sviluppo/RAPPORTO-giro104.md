# Rapporto giro 104 — ultime riparazioni mirate della 7.999.178

Ramo `sviluppo/giro104-ultimi` (da `lavoro/178`, 97f145b4: giri 101-103 uniti). `GAME_VERSION` e `docs/governo/*` non toccati
(riparazione mirata dentro la 7.999.178, come i giri 95-103). Sorgenti in `src/`, HTML ricomposto con `node tools/build-src.mjs`,
`node tools/check-src.mjs` allineato (byte per byte).

Fonte: `docs/governo/catena-178-finale.out/.log/-rossi.txt` sul ramo `catena/178-finale` — 128/128 verdi al rigioco, due guardiani
instabili: highlight-95 (rosso 1/2, D3 «Uno-due con LUZI») e chiusura-99 (rosso 2/3, «servito 9 nominato 8 …»). Il runner conserva
solo le ultime tre righe di ogni prova: per entrambi la prima mossa è stata rigiocarli e leggere il codice.

Sintesi: **un difetto del gioco** (highlight-95 D3: la riserva dell'esito agiva sul riquadro di un'altra scena) corretto con rosso
`__CPM_NO_G104A` e guardiano `riserva-104`; **tre difetti dello strumento** (chiusura-99 verde muto, highlight-95 lettura della
rivelazione di un'altra scena sotto carico, runner senza log dei rossi). Per chiusura-99 la parte del verde che è caduta nella catena
**non posso confermarla**: non si è riprodotta in nessuna delle mie corse (sotto).

## 1. highlight-95 D3 — «Uno-due con LUZI: Anticipato dall'avversario rivelato dalla riserva mentre il 3D mostrava ancora la conclusione»

**Misura prima.**
- Rigiocato s1/1234 (politica passaggio e dribbling) sette volte, a CPU normale e rallentata ×4, ×6, ×8 (CDP), più due giri completi
  del verde (18 partite ciascuno, il secondo a CPU ×3): **0 D3 su 243 finestre d'esito registrate** (`CPM_G103DIAG`). Nelle mie corse la
  scena «Uno-due con LUZI» esce sempre «LUZI si fa parare il tiro» (chiave `chance`): l'intercetto della catena è nato da tempi diversi
  del pilota automatico sotto carico; l'intercetto c'è su «Uno-due con MAURO» della stessa partita.
- Occupazione della conclusione: **massimo 2,96 s di scena** su 243 finestre. Il D3 del giro 103 (tetto della riserva) richiede una
  conclusione occupata oltre **8,6 s**: quella strada non spiega il rosso.
- Su 133 scene con la via annotata: **nessuna «riserva + occupata»**; sulle scene senza tiro del compagno l'esito lo rivela sempre il
  renderer (`onOutcomeShown`, 93 «scena + occupata»).
- Lettura del codice (src/15): `revealRiserva95` leggeva **sempre** `outcomeRevealRef.current`, cioè il riquadro della scena in corso
  in quel momento, non quello per cui era stata programmata. Un richiamo della riserva di una scena che arriva dopo la risoluzione della
  successiva (timer in ritardo su un thread carico) trova un riquadro nuovo, con l'orologio di risoluzione (`ckR`) e i tempi (`t0`) della
  scena vecchia: la guardia dei 2,6 s di scena è già passata, la conclusione nuova non è ancora cominciata (non occupata), quindi chiama
  `fireOutcomeReveal('riserva')`. Questa scrive `o.via='riserva'` e, siccome il pavimento `minAt` della scena nuova non è scaduto,
  **rimanda**: alla scadenza l'esito esce col 3D a metà conclusione e il registro dice «riserva + occupata».
- **Riproduzione deterministica.** Gancio di sola prova `__CPM_G104STALE` (attivo solo con `__CPM_REC`): a ogni risoluzione rimanda di
  60 ms il richiamo della riserva della scena precedente (suo riquadro, suo `ckR`). Sulla base (rosso `__CPM_NO_G104A`), s1/1234
  passaggi: **2 D3 su 5 highlight**, con la firma della catena — «Uno-due con MAURO: esito «Anticipato dall'avversario» rivelato dalla
  riserva mentre il 3D mostrava ancora la conclusione», **pallone a 0,0 dall'eroe** (la conclusione non era partita), arco in pre-volo
  (`at` −0,24), `cap` e `rr103` **nulli** (la riserva non ha mai aspettato quella scena: è la firma che distingue questo caso dal tetto
  del giro 103, dove `rr103` è sempre scritto); e «Stacco in corsa potente: Che peccato!» con la stessa firma. Testimone
  `__CPM_G104D` (via dichiarata prima del pavimento): 2.

**Verdetto: difetto del GIOCO** (sotto carico: timer in ritardo; il telefono lento è lo stesso regime). Coerente con la catena (una sola
scena su 105+, solo sotto il carico della catena notte, scena d'intercetto, «via riserva» con la scena occupata). ⚠️ Che la catena sia
caduta proprio per questo **non posso confermarlo al 100%**: la catena non ha stampato la diagnosi (`c103`/`rr103`), e nelle mie corse
naturali (senza gancio) il richiamo altrui non si è visto (`__CPM_G104X` — numeri sotto). È l'unico meccanismo trovato che produce la
firma esatta del messaggio con una conclusione di durata normale.

**Correzione** (src/15). La riserva porta il riquadro per cui è nata (`o0`, passato dai tre punti che la programmano, dal ramo «tiro del
compagno» e dai suoi richiami a 180 ms) e se il riquadro corrente è un altro **non fa nulla**. Il riquadro della scena nuova ha la sua
riserva. Nessun tempo cambiato, nessun ramo nuovo sul percorso normale: quando il riquadro è il suo (sempre, salvo il richiamo tardivo)
il percorso è identico. Rosso **`__CPM_NO_G104A`** = comportamento 7.999.178. Testimoni di sola prova (`__CPM_REC`): `__CPM_G104X`
(richiami su riquadro altrui), `__CPM_G104D` (via dichiarata prima del pavimento).

**Misura dopo** (gancio acceso, s1/1234): **verde 4 richiami altrui intercettati, 0 D3** · **rosso 2 D3** (vedi sopra).
**Guardiano `riserva-104`** (nuovo; `package.json`; `ci-runner.mjs`: catene completa e carriera, MAPPA `src/15-`, fra i LENTI; ~10-15
min): esce ≠0 se il verde ha meno di 3 highlight, se il gancio non ha agito (0 richiami da intercettare: passata cieca), se il verde ha
un D3 «riserva», o se il rosso non ne mostra nessuno.

**Strumento, corretto insieme** (highlight-95). La rivelazione si prendeva come «l'ultima voce del registro `__CPM_REV95` quando la sonda
vede l'esito». Sotto carico (CPU ×3, giro completo): **10 letture su 93 highlight appartenevano a un'altra scena** (soprattutto gol e
assist, che non passano dalla riserva e quindi non scrivono una voce propria: la sonda prendeva quella della scena prima). Ora la
rivelazione si abbina alla scena **per indice** (`hl`, scritto dal gioco sia nel registro sia nel testimone della scena); le letture
che non corrispondono si contano e si stampano. La diagnosi del D3 (`cap`, `c103`, `rr103`) si stampa **sempre**. Soglie invariate.

## 2. chiusura-99 — «seme 2021 scena 22|2 (2) servito 9 nominato 8 a 31.4u; scena 81|6 (6) servito 8 nominato 5 a 39.7u»

**Quale braccio.** Le due righe sono del **braccio ROSSO** (`__CPM_NO_G99RIC`), cioè i difetti attesi. Prova: chiusura-99 esegue verde
(D9, RIC) e poi rosso (D9, RIC); il rosso RIC stampa per ultimo le sue righe «servito/nominato»; se il rosso non si fosse visto o fosse
stato cieco, il guardiano avrebbe stampato «✗ il rosso di RIC non si vede» / «✗ rosso RIC cieco» subito prima della riga finale, e non
c'è. Il solo modo di avere `ROSSO (1)` senza nessuna di quelle righe è un **verde non ok**, il cui `fail++` **non stampava nulla**.
Rigiocato il rosso RIC sul seme 2021: ricade proprio sulla scena **22|2** (servito 6 nominato 8 a 22,2u) e su 5|0. Il motivo vero del
verde nella catena (D9 o RIC) **non è mai stato scritto** e **non posso confermarlo**.

**Misura** (verde, dopo): RIC **51/51** scene servito = nominato in 8 corse (semi 1234 e 2021 ×5, più 7, 99, 555, 31337, 4242, 808), di
cui 3 corse sotto carico pesante (load 11-13, in parallelo con highlight-95); D9 **5/5 corse verdi** (6/6 gol misurati, mediana
5,52-5,59, nessuno sotto 3), di cui 3 sotto carico. Il rosso della catena **non si è riprodotto**.

**Verdetto: STRUMENTO** per la parte dimostrata (verde muto: il runner riportava come «primo rosso» le righe attese del rosso).
Gioco o strumento per la caduta del verde: non determinabile con i dati della catena.

**Correzioni (solo strumento).**
- chiusura-99: ogni parte ritorna il suo **perché**; i giudizi si stampano per ultimi, prima il rosso e poi il verde («✗ verde RIC ROSSO:
  servito = nominato 5/6 · seme … servito … nominato …», «✗ verde D9 ROSSO: gol misurati … mediana … sotto 3: …»), così le tre righe di
  coda dicono il braccio e il motivo. Soglie invariate.
- Testimone B4 (src/12, solo `__CPM_B4REC`): il ricevente si legge solo a **conclusione partita** (`_ccx460`, scritto da
  `fireConclusion`). Con la costruzione R5, `fireConclusion` parte a costruzione finita (src/12 r. ~7667) e nei fotogrammi prima
  `passTargetMesh` è ancora quello della scena precedente (non si azzera al cambio scena): il testimone poteva attribuire alla scena il
  ricevente di un'altra. Misurato: **0 scene** in cui il primo fotogramma di `hl_result` precede la conclusione, in 51 scene col regime
  della sonda (`__CPM_PRESENT=1`) — quindi questa lettura **non è la causa dimostrata** del rosso della catena; resta perché è corretta
  per costruzione. `CPM_B4PRIMO=1` riporta la lettura vecchia (stessi 6/6 per due corse).
- `ci-runner.mjs`: **ogni prova rossa salva il suo log completo** in `tests/visual/out/ci-rossi/<passo>-<ora>.log` e il percorso entra
  nella coda. La prossima volta il «quale braccio, perché» si legge invece di dedurlo.

## Rigiochi finali (build 3f691e2)

| Passo | Esito | Note |
|---|---|---|
| test:logic | ✅ | 43/43 |
| save-compat | ✅ | 12 pass · 0 fail (una prima corsa a macchina carica, prima della correzione, era uscita 0/1; rigiocata subito: 12/12) |
| riserva-104 | ✅ | verde 4 intercettati · 0 D3; rosso 2 D3 |
| riserva-103 | _in corsa_ | |
| chiusura-99 | _in corsa_ | |
| assist-nome-98 | _in corsa_ | |
| highlight-95 (completo) | _in corsa_ | |
| highlight-95 s1/1234 | _in corsa_ | |

## Fuori ambito / punti aperti
1. Il richiamo tardivo della riserva su riquadro altrui **non si è visto in modo naturale** nelle mie corse (testimone `__CPM_G104X`):
   la correzione chiude il meccanismo per costruzione e il guardiano lo prova col gancio; resta da vedere nella prossima catena notte
   se il D3 ricompare (ora con la diagnosi stampata).
2. chiusura-99: la caduta del verde nella catena resta non attribuita (vedi 2). Con il runner nuovo il log completo resterà.
3. `lento-103` è ancora nelle liste delle catene di `ci-runner.mjs` nonostante il giro 103 l'abbia declassato a sonda: non toccato.
4. File di scarto `/h95-full2.log` (688 byte, un mio lancio sbagliato di cartella) nella radice del container: la rimozione è stata
   bloccata dal controllo di sicurezza; non è nel repository.
