# Rapporto giro 279 — riserva-104: il braccio rosso non mostrava più il difetto D3

Ramo `sviluppo/giro279-riserva104` da `lavoro/197` (7a1397e9). Decisione PO-516 (18/11 14:10): un rosso nato nella 197 si ripara prima dell'uscita.
**Corretta la sonda** (`tests/visual/riserva-104.mjs`, un solo file). **Gioco non toccato**: nessuna riga di `src/`, nessun `GAME_VERSION`, nessuna soglia abbassata, nessun rosso `__CPM_NO_G279` (non serve: non c'è correzione del gioco).

## In breve

- Il gioco è giusto: la protezione del giro 104 lavora (nel verde intercetta i richiami altrui, 0 D3). Era la sonda a essere cieca: il D3 del braccio rosso nasce solo su scene la cui conclusione 3D dura oltre il pavimento dell'esito (passaggio perso, tiro parato, contrasto), e la sonda **aspettava che la partita s1/1234 le producesse per caso**.
- Dal giro 264 (commit **8f029f61**) la stessa partita si svolge diversamente: 5 highlight, quattro passaggi riusciti e una scivolata, nessuna scena adatta → rosso senza D3 → «il guardiano non giudica».
- Ora la sonda **provoca** le scene (regola PO-311): in entrambi i bracci ogni highlight è forzato a fallire con la manopola `CPM_G104FAIL` di `highlight-95` (gancio di sola prova `__CPM_FORCE_OUTCOME`, già esistente dal giro 104). In più ogni braccio deve dimostrare che la provocazione ha agito (almeno 3 scene fallite), altrimenti è passata cieca = rosso. Le altre soglie sono invariate.
- `riserva-104` verde 2 volte di fila, il rosso mostra il difetto; `riserva-103` verde.

## Esiti

| Controllo | 7.999.196 (3076a1b7) | 197 prima | 197 dopo (questo ramo) |
|---|---|---|---|
| `riserva-104` | verifica V3e1: **verde**, 7 highlight, il rosso produce 2 D3 («Contrasto pulito senza fallo», «Punizione a giro») — non rieseguito qui | verifica V3e1 (a81ebb10): **rosso 2/2** (671 s · 673 s), verde 5 highlight · 1 richiamo intercettato · 0 D3; rosso 5 highlight · 33/32 richiami · **0 D3** | **verde 2/2 di fila** (659 s · 681 s). 1ª: verde 7 highlight · 7 scene provocate · 6 intercettati · 0 D3; rosso 6 highlight · 5 provocate · 14 richiami · **2 D3**. 2ª: verde 7 · 7 · 6 · 0 D3; rosso 7 · 6 · 13 · **3 D3** |
| braccio rosso originale (senza provocazione), 1 corsa | — | qui (7a1397e9): 5 highlight, 31 richiami, **0 D3** (riprodotto) | sostituito dalla provocazione |
| `riserva-103` (verde + rosso) | — | verifica V3e1: verde (688 s) | **verde** (686 s), il rosso si vede |
| `test:logic` | — | — | 51/51 |
| `save-compat` | — | — | 12 pass · 0 fail |

«—» = non eseguito in questo giro su quella versione.

`battito-264` e `solo-highlight-166` non eseguiti: `src/15` non è stato toccato. Guardiani della MAPPA mirata: nessuno, perché non è stato toccato alcun file di `src/` (la MAPPA di `ci-runner.mjs` parte dai file `src/`). `tools/build-src.mjs` / `check-src.mjs` non necessari per lo stesso motivo. Non eseguiti, come da consegna: `highlight-95` (come guardiano intero), `ingresso-206`, `career-critical`. ⚠️ `riserva-104` gioca per costruzione una partita di `highlight-95` in sottoprocesso (un salvataggio, un seme, una politica): è il controllo stesso, non il guardiano `highlight-95`.

## Che cosa succede (misurato)

Braccio rosso originale (`__CPM_G104STALE,__CPM_NO_G104A`, s1 / seme 1234 / politica passaggio), una corsa per riga salvo dove indicato:

| Dove | Highlight | Scene giocate | D3 «rivelato dalla riserva» |
|---|---|---|---|
| 197 (7a1397e9) | 5 | Uno-due · Scivolata netta · Palla in area · Filtrante · Servi LUZI libero — tutti riusciti | **0** |
| 197 con `__CPM_NO_G264` acceso | 6 | Uno-due · Contrasto pulito senza fallo · Finta e tiro (parato) · Uno-due · Lancio smarcante (intercettato) · Lancio smarcante | **1** («Lancio smarcante per LUZI», esito «Intercettato») |
| ba99108c (il commit prima di 8f029f61), 1ª corsa | 5 | Uno-due · Contrasto pulito · Finta e tiro · Uno-due · Lancio smarcante | **0** |
| ba99108c, 2ª corsa | 7 | le stesse cinque + Palla in area · Tiro a giro | **3** |
| 197 con scene provocate (`CPM_G104FAIL`), rosso | 7 | sette scene tutte fallite | 1 (corsa di prova), poi 2 e 3 nelle due corse del guardiano |
| 197 con scene provocate, verde | 7 | sette scene tutte fallite | 0 (3 corse su 3), 6 richiami intercettati ogni volta |

Lettura:
1. Col giro 264 spento la partita torna a quella «della 196» (Contrasto pulito, Finta e tiro, Lancio smarcante) e il D3 ricompare: il cambio di svolgimento viene dal battito del minuto del giro 264.
2. Ma anche **prima** del giro 264 il braccio rosso non era affidabile su questa macchina: sullo stesso commit, 0 D3 in una corsa e 3 nell'altra (5 highlight contro 7). La sonda dipendeva dal caso già prima; il giro 264 ha reso il caso sfavorevole in modo stabile (2 su 2 nella verifica, 1 su 1 qui).

## Commit che lo fa nascere

**8f029f61** — «Giro 264: il battito della partita intera si applica per intero prima del successivo (flushSync)», con la riserva scritta sopra.

Come l'ho trovato: non con una bisezione completa. Prove: (a) sulla 197 il rosso `__CPM_NO_G264` riporta le scene di prima e fa ricomparire il D3 (1 corsa); (b) sul commit immediatamente precedente (ba99108c) le scene sono quelle di prima, D3 in 1 corsa su 2. **Non posso confermare** con una corsa sul commit 8f029f61 isolato (non eseguita per il tetto di tempo): l'attribuzione poggia sul suo interruttore.

## Che cosa è cambiato nella sonda

`tests/visual/riserva-104.mjs`:
- `CPM_G104FAIL: '1'` nell'ambiente di entrambi i bracci (provocazione dichiarata nell'intestazione e nell'uscita: «scene provocate (fallite) N»);
- due motivi di rosso nuovi: «solo N scene provocate — la provocazione non ha agito, passata cieca» (pavimento 3, per braccio);
- invariati: highlight ≥ 3 per braccio, verde con almeno 1 richiamo intercettato e 0 D3, rosso con almeno 1 D3.

Il verde con scene tutte fallite è una prova più dura di prima: ogni scena è del tipo che nel rosso produce il D3, e la protezione le tiene tutte (0 D3 su 21 scene in 3 corse).

## Incidenti di esecuzione

- Una corsa di `riserva-104` è stata interrotta dal tetto di 10 minuti che avevo messo io al comando, un'altra dal riavvio del container. Nessuna delle due è contata: i «2 di fila» sono due corse intere consecutive dopo il riavvio.

## Dubbi per il PO

1. **Scene tutte fallite invece della partita vera.** La sonda ora giudica la riserva solo su scene forzate a fallire; non guarda più che cosa fa la riserva sulle scene riuscite della partita vera (quello resta a `highlight-95`, D3). Se il PO vuole che `riserva-104` giudichi anche una partita non forzata, serve un terzo braccio (circa 6 minuti in più).
2. **Il rosso mostra 2-3 D3 su 5-7 scene provocate, non su tutte.** La soglia è rimasta «almeno 1», come prima. Alzarla (per esempio «almeno 2») renderebbe il guardiano più severo ma è una scelta di soglia: non l'ho toccata.
3. **Attribuzione a 8f029f61 non chiusa con una bisezione.** Vedi sopra: se serve la prova sul commit isolato, sono circa 12 minuti (due corse).
4. **Il giro 264 cambia lo svolgimento delle partite di prova** (terzo controllo dopo `salti-274`, e forse `schermate-97`/`schede-246` del giro 277): altri guardiani che aspettano una scena «per caso» da una partita a seme fisso possono essere diventati ciechi allo stesso modo. Non ho cercato quali: fuori dal lotto.
5. **Durata**: `riserva-104` resta sugli 11 minuti (659-681 s), come prima (671-673 s).

Contatto: korward.devteam@gmail.com
