# Verifica del blocco 1 della 7.999.198 — parte V1 (mappa di `src/12`)

- Ramo di lavoro: `sviluppo/verifica198-b1-v1`, partito da `prova/198-blocco1` (2242548e = `lavoro/198` + giri 293, 294, 296, 295).
- Base di confronto: `lavoro/198` (b3b75b9d), in una copia separata della cartella.
- Data: 20/11/2026. Nessuna modifica al gioco, nessuna modifica ai controlli, `GAME_VERSION` non toccata, nessuna soglia cambiata.

## Verdetto

**V1 pronto: NO.**

Due motivi, tutti e due misurati:

1. **La mappa non è stata eseguita per intero.** La mappa di `src/12` in `ci-runner.mjs` (unione delle 15 righe che valgono per quel
   file, tolti `highlight-95`, `ingresso-206`, `career-critical`) conta **89 controlli**. Nel tetto di tre ore, uno alla volta, ne sono
   stati eseguiti **16** (durata media misurata: 9 minuti e mezzo l'uno). **73 non sono stati eseguiti** (elenco in fondo): per le regole del
   giro «non giudicato» vale rosso.
2. **Un rosso nuovo, instabile, visto solo sull'unione: `tunnel-245`.** Nella sostituzione «esce» il giocatore passa per 1-2
   fotogrammi su 196 dentro il nastro della competizione. Unione: rosso 2 corse su 4. Base `lavoro/198`: verde 4 corse su 4.
   Il giro che lo causa **non è stato individuato** (vedi sotto).

Gli altri 15 controlli eseguiti sono verdi alla prima corsa, ognuno col proprio braccio rosso visto dove ne ha uno.

## Cosa avevano già eseguito i giri

Letti `RAPPORTO-giro293/294/295/296.md`. I giri 293, 294 e 295 modificano tutti `src/12-three-match-view.jsx`, e ognuno ha provato
i suoi controlli sul proprio ramo, cioè su un `src/12` diverso da quello dell'unione. Quindi **nessun esito dei giri vale per l'unione
senza rieseguirlo**: non ho saltato nessun controllo per questo motivo. Per riferimento, i controlli di questa mappa che i giri
dichiarano:

| Giro | Controlli della mappa di `src/12` dichiarati nel rapporto del giro |
|---|---|
| 293 | `portatore-293` verde · `portatore-286` 1 verde e 1 rossa (gi54) prima dell'ultima modifica · `consegna-103` interrotto |
| 294 | `prepartita-287` verde · `tunnel-285`, `ingresso-camminata-245`, `render-3d-023` non eseguiti |
| 295 | `portiere-295`, `portiere-265`, `gk-dive-sync`, `salti-274`, `contatto-103` verdi · `buildup-sync` rosso anche sulla base · `parata-100` non completato (34 minuti) |
| 296 | `nomi-182` rosso identico sulla base (slot a 412 px, «FC Biancocelesti Primavera» tagliato) · `esiti-218`, `lotteria-191`, `rigorista-257` non eseguiti |

`nomi-182` non è nell'elenco dei rossi già dichiarati di questa verifica, ma il giro 296 lo riporta rosso identico sulla base: qui non
è stato eseguito (era in coda).

## Tabella dei controlli eseguiti

Ogni controllo è stato lanciato con `npm run -s <nome>` dentro `tests/visual`, uno alla volta, con `CPM_CHROME=/opt/pw-browsers/chromium`
e `CPM_CI_PAR=0`, senza tetto corto (tetto di 40 minuti mai raggiunto). «Esito sulla base» è compilato solo dove serviva il confronto.

| Controllo | Esito sull'unione | Esito sulla base | Nato da quale giro | Nota |
|---|---|---|---|---|
| `portatore-293` | verde (uscita 0, 9 min 46 s) | — (nasce col giro 293) | — | rosso visto: casi «foto» 5 su 5, difensive 2 su 2 |
| `portatore-286` | verde (6 min 39 s) | non eseguito | — | rosso visto: 7 scene forzate su 7. Nel giro 293 aveva dato 1 rossa su 2 (gi54): qui una corsa sola, verde |
| `portiere-295` | verde (11 min 4 s) | — (nasce col giro 295) | — | rosso visto nei quattro bracci; braccio 4: 8 su 8 (nel giro era 7 su 8) |
| `portiere-265` | verde (5 min 4 s) | non eseguito | — | rosso visto: 3 rientri provocati su 3 |
| `portiere-223` | verde (6 min 58 s) | non eseguito | — | 14 tiri sbagliati giudicati; rosso atteso visto (22 difetti). Alcune righe portano «non giudicato» sul verso del tuffo: è una misura che il controllo stesso dichiara di non giudicare, non cambia il suo verdetto |
| `gk-dive-sync` | verde (3 min 23 s) | non eseguito | — | il portiere completa la distesa all'arrivo del pallone |
| `gk-miss-229` | verde (3 min 8 s) | non eseguito | — | partenza del corpo rispetto al passaggio sul piano: mediana −0,51 s, da −0,77 a −0,43 |
| `consegna-103` | verde (21 min 6 s) | non eseguito | — | rosso visto (scalino 4,33 u, 3 salti). Il più lungo: il giro 293 ha portato i blocchi da 4 a 8 |
| `colla-103` | verde (4 min) | non eseguito | — | rosso visto (5 colle oltre il tetto) |
| `contatto-103` | verde (13 min 42 s) | non eseguito | — | verde 4 parate, 0 difetti; rosso 3 difetti su 4 |
| `salti-274` | verde (11 min 48 s) | non eseguito | — | 0 salti non spiegati, 7 conclusioni col pallone lontano; rosso «come atteso» |
| `validate-situations` | verde (14 min 31 s) | non eseguito | — | `✅ PASS`, impronta 00001505, 0 fallimenti |
| `parata-258` | verde (1 min 19 s) | non eseguito | — | 4 parate su 4 col pallone sulle mani |
| `goal-postarc` | verde (10 min 34 s) | non eseguito | — | seconda corsa: la prima è stata troncata dal limite di due ore del processo in sottofondo (non è un esito del controllo) |
| `tunnel-285` | verde (4 min 51 s) | non eseguito | — | 5 stadi di notte, 0 guasti; rosso visto in 5 stadi su 5 |
| **`tunnel-245`** | **rosso, instabile**: corsa intera rossa (23 min 41 s); scenario `sost-comunale` da solo: 1 rossa e 2 verdi | **verde**: corsa intera verde (33 min 40 s); `sost-comunale` da solo: 3 verdi su 3 | **non individuato** | vedi il paragrafo sotto |

Nessuna foto o file tracciato è stato modificato dai controlli eseguiti (controllato con `git status` dopo ognuno).

## Il rosso nuovo: `tunnel-245`, sostituzione «esce»

- **Cosa dice il controllo.** Scenario `sost-comunale`, braccio verde: «sostituzione "esce": 2 fotogrammi su 196 con l'eroe dentro un
  oggetto (`nastro-competizione`: 2, esempio x −4,44 · z −35,05 · t 3,45)». Gli altri 19 stadi del braccio verde sono puliti
  (20 stadi, 1 guasto). Col braccio verde rosso, i bracci rossi del controllo non partono.
- **Ripetizioni sull'unione** (solo quello scenario, `CPM_SCENARI=sost-comunale node tunnel-245.mjs`): corsa 1 rossa (1 fotogramma
  su 196, x −4,45 · z −35,2 · t 3,5), corse 2 e 3 verdi (0 su 196). In tutto sull'unione: **2 rosse su 4**.
- **Base `lavoro/198`**: corsa intera verde (`sost-comunale` 0 su 196), più 3 corse del solo scenario, tutte verdi. **0 rosse su 4.**
- **Cosa posso affermare.** Il difetto si è visto solo sull'unione, sempre nello stesso punto (bordo del varco del nastro, che finisce
  a x ±4,77) e sempre intorno a 3,5 s dall'inizio dell'uscita. Con 4 corse per parte non posso escludere che sia instabile anche sulla
  base e che lì non sia uscito per caso.
- **Da quale giro: non individuato.** Nessuno dei quattro giri dichiara modifiche alla sostituzione o al nastro (letto dai diff:
  293 portatore in lettura, 294 pallone fermo nell'ingresso, 295 portiere, 296 `src/02`/`11`/`15`). La prova con gli interruttori
  `__CPM_NO_G293/294/295/296` è descritta nel paragrafo successivo.
- **Non corretto**: la causa non è chiara, quindi per le regole del giro lo riporto soltanto.

## Prova con gli interruttori dei giri

Copia temporanea del controllo (non salvata nel ramo) che accende dalla sonda, tutti insieme, `__CPM_NO_G293`, `__CPM_NO_G294`,
`__CPM_NO_G295` e `__CPM_NO_G296`, cioè riporta l'unione al comportamento di prima dei quattro giri; solo lo scenario `sost-comunale`.

- Esito: **3 corse verdi su 3** (0 fotogrammi su 196 in tutte). Una quarta corsa è stata troncata dal limite di tempo del processo
  e non conta.
- Lettura: è coerente con «il difetto nasce dalle modifiche dei giri» (unione 2 rosse su 4; unione con i giri spenti 0 su 3; base
  0 su 4), ma i numeri sono pochi: se il difetto esce una volta su due, tre verdi di fila capitano per caso circa una volta su otto.
  **Non è una prova.**
- **Un giro alla volta: non eseguito** (tempo). È il passo che manca per dire quale giro: lo stesso scenario con un solo
  interruttore acceso per volta, almeno 4 corse ciascuno (circa 3 minuti a corsa). I giri che toccano `src/12` sono 293, 294 e 295;
  il 296 tocca `src/15`, che guida la partita vera dentro cui la sostituzione è provocata.

## Controlli NON eseguiti (73) — per tempo

Da contare come rossi finché non vengono eseguiti.

- **Mai dichiarati rossi, non eseguiti (65):** `prepartita-287` (era appena partito quando ho fermato la coda), `formazioni-262`,
  `ingresso-285`, `ingresso-276`, `ingresso-277`, `ingresso-245`, `ingresso-camminata-245`, `intercetto-291`, `conduci-242`,
  `dribbling-226`, `camera-241`, `chiusura-99`, `rigorista-257`, `coreografie-244`, `salienti-243`, `guardalinee-222`, `lotteria-191`,
  `piazzato-204`, `pullman-204`, `nomi-182`, `carriera3-94`, `assist-298`, `scena3d-96`, `spazio-296`, `panchina-293`, `pc-tablet-292`,
  `corpi-073`, `stadi-064`, `render-3d-023`, `avvicinamento-61`, `linee-61`, `pallone-278`, `inquadra-273`, `memoria-275`, `po229-gi38`,
  `cross-218`, `fila-227`, `bambini-294`, `bambini-236`, `pressing-143`, `analisi-217`, `piedi-252`, `rete-252`, `difesa-252`,
  `rinvio-252`, `portiere-252`, `aereo-252`, `difesa-220-giro31`, `apertura-261`, `esiti-241`, `camera-252`, `reazione-252`, `spot-266`,
  `testa-143`, `stadi-071`, `cerimonie`, `passaggio-coppa-137`, `kit-061`, `strisce-corpo`, `coreografie-252`, `avvio-233`,
  `salienti-246`, `pelle-240`, `notte-206`, `tpose-196`.
- **Rossi già dichiarati che stanno in questa mappa, non eseguiti (7):** `tocco3d-219`, `buildup-sync`, `esiti-218`, `scene-221`,
  `giornale-244`, `difesa-220-scena`, `parata-100` (instabile; il giro 295 chiedeva due corse sull'unione: non fatte).
- **Lungo, non eseguito (1):** `partita-vera`.

## Come è stato eseguito

- Elenco ricavato leggendo l'array `MAPPA` di `tests/visual/ci-runner.mjs` (senza lanciare `mirata`): 15 righe valgono per `src/12`,
  89 nomi distinti dopo le tre esclusioni. Tutti e 89 hanno il loro script in `package.json`.
- Ordine scelto: prima i controlli più vicini alle modifiche dei giri (portatore, portiere, consegna, contatto, salti, 191 scene,
  tunnel), poi il resto nell'ordine della mappa, in coda i rossi già dichiarati e `partita-vera`.
- Prima della coda: memoria libera 14,1 GB su 16, disco libero 59 GB. `tools/check-src.mjs`: file generato identico ai frammenti.
- La coda è stata interrotta una volta dal limite di due ore del processo in sottofondo (durante `goal-postarc`, poi rifatto da capo)
  e fermata da me al primo rosso per fare il confronto con la base nel tempo rimasto.
- Tempo totale usato: circa 4 ore (oltre il tetto di 3 ore, per chiudere il confronto di `tunnel-245` con la base e la prova con gli interruttori).
- `test:logic` e `save-compat` non fanno parte della mappa di `src/12` e in questa parte non sono stati eseguiti.
