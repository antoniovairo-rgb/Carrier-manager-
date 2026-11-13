# Rapporto giro 154b — chiusura della catena del giro 154 (PO-357, gol dell'eroe solo negli highlight)

Ramo `sviluppo/giro154b-gol-eroe` da `sviluppo/giro154-gol-eroe` (`51023e0`). **Nessuna modifica al gioco** in questo giro:
`src/` e `CARRIER-MANAGER-AV.html` sono quelli del commit `b60a61f` (`node tools/check-src.mjs`: allineato). Base di confronto:
`lavoro/189` = `0d4915e`, in un worktree a parte (`git worktree add` dalla radice), con i `node_modules` del ramo collegati.

Metodo: un controllo alla volta, `free -m` e `df -h` prima di ognuno (memoria libera sempre sopra 12,6 GB, disco 28%),
`CPM_CHROME=/opt/pw-browsers/chromium`. I controlli lunghi sono partiti in sottofondo dentro il turno e ho atteso il loro esito
in primo piano a blocchi sotto i dieci minuti. Nessun processo fermato a mano.

## Tabella

| controllo | esito | motivo |
|---|---|---|
| distanze-126 (s1 seme 8, il caso rosso del giro 154) | ⚠️ **difetto preesistente, non corretto** | vedi §1: sulla base lo stesso tiro sta a 30,7 m |
| rigore-139 (adattato nel giro 154) | ✅ verde e il rosso cade | verde giudicato con 3 battute dell'eroe (minimo 3), 0 doppi; rosso `__CPM_NO_G139`: doppio 90' motore + 91' scena |
| bg-decision | ❌ CIECO, **identico sulla base** | 0 righe utili (minimo 15) sia sul ramo sia su `lavoro/189`: preesistente |
| bg-sync | ❌ CIECO, **identico sulla base** (riconferma) | base: 21 righe in 40 s, 0 coppie giudicabili, come nel giro 154 |
| partita-vera | ✅ verde | 12 bande su 12, partite finite 2/2 |
| highlight-95 completo (`CPM_D3DIAG=1`) | ✅ verde e il rosso si vede | verde 101 highlight, D4 senza esito 0; rosso 115 highlight con D1/D3/D4 |
| gol-eroe-154 | ✅ verde e il rosso cade | verde 10/10: 0 gol e 0 assist fluidi, 0,40 gol a partita (fascia 0,2-1,2); rosso 10/10: 2 gol fluidi, 2 assist fluidi |
| validate-situations | ✅ 14/14 | impronta 00001505, 0 failure |
| test:logic | ✅ | 43/43 nell'ultimo riepilogo |
| save-compat | ✅ | 12 pass · 0 fail |
| career-critical (11 passi) | ✅ | recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera: tutti uscita 0 |

**Lo stato della catena:** tutto verde tranne tre punti, tutti preesistenti e misurati sulla base: distanze-126 (un difetto della
scena), bg-decision e bg-sync (strumenti ciechi). **Il rimedio 154 non ne causa nessuno.** Questi tre punti restano rossi:
nessuno è stato reso verde in questo giro.

## 1. distanze-126: il tiro a 30,6 m non nasce dal rimedio 154

Ho rigiocato la partita s1 seme 8 (`CPM_SALVA=s1 CPM_SEMI=8 CPM_PAR=1 node distanze-126.mjs`) in tre bracci:

| braccio | scene | hl 2 | hl 3 | tiri oltre 30 m |
|---|---|---|---|---|
| ramo (rimedio acceso) | 6 | «spalle alla porta» → Proteggi palla e scarica, **30,7 m** | «spalle alla porta» → **Girata secca e tiro, 30,5 m** | **1** |
| ramo + `__CPM_NO_G154` | 8 | «spalle alla porta» → Proteggi palla e scarica, 30,8 m | «Ricevi fra le linee» → Uno-due, 25,4 m | 0 |
| base `lavoro/189` | 8 | «spalle alla porta» → Proteggi palla e scarica, 30,8 m | «Ricevi fra le linee» → Uno-due, 25,4 m | 0 |

Il braccio rosso e la base giocano **la stessa partita** (stesse scene, stesse distanze al decimo). Col rimedio acceso la partita
diverge dopo la hl 2: la scena «spalle alla porta» si ripresenta alla hl 3 e l'autoplay seedato sceglie la girata. Nei bracci senza
rimedio la scena compare **già alla hl 2, alla stessa distanza (30,8 m)**, ma l'autoplay sceglie lo scarico e il guardiano non la vede,
perché giudica solo i tiri.

**Prova sulla base.** La sonda `tests/visual/sonda-girata-154b.mjs` (strumento nuovo, non guardiano) gioca la stessa partita con
l'autoplay in modalità `mano`. Ripete le scelte registrate alle hl 0-1 (Tiro da fuori, Punizione a giro) e alla scena «spalle alla
porta» sceglie «Girata secca e tiro». Il contatto si legge da `__CPM_CONT121`, come in distanze-126. Sulla base `lavoro/189`:

```
hl 0 | Fra le linee, BIANCHI esce in ritardo! | Tiro da fuori        | shot     | 25.6 m
hl 1 | Punizione a 22 metri                    | Punizione a giro     | freekick | 23.0 m
hl 2 | BIANCHI ti è addosso: spalle alla porta! | Girata secca e tiro  | shot     | 30.7 m
```

**Conclusione.** Il superamento è preesistente. La scena «spalle alla porta» (`scenaDalMotoreSpalle`, `src/04`) nasce dove il motore
vede l'occasione, qui a ~29 unità dalla porta, e offre due tiri (girata, tiro di potenza) da quel punto. Il rimedio 154 non tocca
le scene: cambia il flusso della partita, quindi quali scene nascono e quando, e qui ha reso visibile la combinazione. Come chiesto,
**non l'ho corretto**. Lo riporto:
- difetto: la scena «spalle alla porta» può proporre un tiro oltre 30 m (misurato 30,5-30,7 m);
- testimone: s1 seme 8, hl 2 sulla base / hl 3 sul ramo;
- distanze-126 resta **rosso** sul ramo finché la scena non viene corretta, oppure finché il PO non decide altrimenti.

Nota: il campione di una partita sola non permette di dire quanto spesso capiti. La catena del giro 154 (24 partite, 155 contatti)
lo ha visto una volta.

## 2. rigore-139: ora giudicabile, verde e rosso

L'adattamento del giro 154 (`sonda-rigore-139.mjs` accende `__CPM_NO_G154` in entrambi i bracci, così l'invariante del giro 139
resta misurato nella condizione in cui era nato) basta a renderlo giudicabile. Non è servito provocare altro dalla sonda e le
soglie sono invariate. Esito:
- verde: k1c-2 (rigore 89', scena 90' gol), k1d-11 testimone (rigore 89', occasione 90', scena 91'), k1d-7 (rigore 79', scena 80'
  gol), k1a-6 (nessun rigore) → 3 battute dell'eroe (minimo 3), testimone col rigore offerto dall'89', **0 doppi**, 0 errori di pagina;
- rosso (`__CPM_NO_G139`, testimone k1d-11): 90' battuta del motore + 91' scena gol → **doppio visto**.

⚠️ Il verde è giudicato **esattamente sul minimo** (3 su 3). I rigori del motore a 31' e 36' di k1c-2 li ha battuti un compagno
(non l'eroe), quindi non contano. Se in futuro un cambio di flusso ne togliesse uno, il guardiano tornerebbe «non giudicato»
(= rosso): non è fragilità dello strumento, è un margine stretto.

## 3. bg-decision e bg-sync: ciechi anche sulla base

- bg-decision (3 partite): **0 righe utili su minimo 15**, uscita 2, sul ramo **e** sulla base `lavoro/189`. Preesistente. Non ho
  misurato perché il filtro (`dec && pd && !ef && !rec`) lasci zero righe: **causa non misurata**.
- bg-sync sulla base: 21 righe di cronaca in 40 s, 0 coppie giudicabili, uscita 2: identico alla misura del giro 154.

## 4. File toccati

- `docs/sviluppo/RAPPORTO-giro154b.md` (questo).
- `tests/visual/sonda-girata-154b.mjs`: la sonda del §1 (strumento; `CPM_ROOT` la fa girare su un altro worktree).

## Domande aperte (al PO, nessuna decisione presa qui)

1. **Scena «spalle alla porta» oltre 30 m** (§1): correggerla in un giro dedicato? Le strade possibili (non provate) sono: non
   offrire i tiri oltre una distanza, oppure non far nascere la scena così lontano.
2. **bg-decision / bg-sync ciechi sulla base**: sono strumenti da riparare in un giro a parte. Fino ad allora restano rossi in ogni
   catena.
3. Restano aperte le domande del giro 154 (§6 di `RAPPORTO-giro154.md`).

## Note di processo

- Roadmap non aggiornata: ramo di sviluppo senza bump di versione, non un rilascio (come il giro 154).
- Worktree della base in `/home/user/base189`, fuori dal repo: va rimosso con `git worktree remove` dalla radice.
