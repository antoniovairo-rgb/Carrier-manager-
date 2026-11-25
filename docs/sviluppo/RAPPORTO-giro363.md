# Rapporto giro 363 — `highlight-95` rosso sul treno 45571168039 (blocca la 7.999.211)

Base `lavoro/201` fd6e94e4. Ramo `sviluppo/giro363-highlight95`. GAME_VERSION non toccata. `src/` non toccato.

## 1. Il rosso, per intero (log pubblico, parte 01 di 8, job 139058356775)

```
❌ highlight-95
  · verde: solo 3 finte giudicate (pavimento 4)
❌ highlight-95@verde (2803s, uscita 1)
VERDE highlight 119 · D4 senza esito 0 · passaggi 41 arrivati 90.2% gol compagno 19 assist 19 … · finte 3 riuscite 33.3%
```

Nessun difetto D1..D4 nel verde: l'unico motivo del rosso è il **pavimento delle finte** (3 su 4).
Il pezzo `@rosso` (parte 02) è verde: «il rosso si vede», 2315 s.

## 2. Lo spezzamento del 358 non c'entra: il margine era zero da prima

Ho riletto le finte giudicate dal braccio verde nei treni precedenti (log pubblici delle parti):

| treno | commit | forma del guardiano | finte del verde |
|---|---|---|---|
| 45303186123 | 0cbe6904 | intero | 6 |
| 45339800115 | 07e15e4c | intero | **4** |
| 45406157539 | 09e6de36 | intero | **4** |
| 45479038823 | def67606 | intero (7.999.210 + 354) | **4** |
| 45550618332 | db4da95e | intero (spezzamento appena unito) | **4** |
| 45571168039 | fd6e94e4 | `@verde` | **3** ❌ |

Già a guardiano intero erano quattro corse di fila esattamente sul pavimento. In più, il braccio verde gira
comunque per primo e ogni partita apre un contesto suo (`b.newContext`), con lo stesso seme e lo stesso ordine:
fra «intero» e «`CPM_ARMI=verde`» il codice percorso è identico. Il 3 non è quindi un effetto dello
spezzamento, è il primo giro che è caduto sotto il pavimento.

**Perché così poche.** La «🌀 Finta e cambio di passo» esiste solo nel repertorio delle scene «fra le linee»
(`P6_LINEE`, src/04) e compare solo se il sorteggio delle tre opzioni (`_p6Costruisci`) la pesca. Le scene fra
le linee sono 0-3 per partita: misurato col testimone nuovo sulle nove partite «drib» del verde → 2·2·2 (s1),
1·0·2 (s5), 3·3·1 (s12) = **16 scene**. Il guardiano sperava che in almeno 4 di queste la finta fosse fra le tre.

## 3. Caso: (b) difetto dello strumento

- **Non è un blocco del gioco.** La partita s5/seme 1234, che sul banco resta in `playing` fino al tetto di
  480 s, l'ho seguita per 200 s: il cronometro avanza (7' → 32'), il tabellone si muove (1-0 al 27'), nessun
  `pageerror`. Semplicemente il motore non dà all'eroe nessuna scena, e sul banco una partita gira circa 12 volte
  più lenta del nominale (circa 10 s per minuto). Sul runner la stessa partita finisce regolarmente con 0-3
  highlight (45550618332: 0, 45571168039: 2-3). Era identico sulla 7.999.210 (rapporto 358, §1 e §4).
- **Non è un instabile del runner** da dichiarare: è un margine zero strutturale, che prima o poi cade.

## 4. Correzione: le finte si provocano, non si sperano

`tests/visual/highlight-95.mjs`, nelle sole partite a politica `drib`: la sonda avvolge `window._p6Costruisci`
(funzione globale e scrivibile, verificato sul banco) e moltiplica per 25 il peso della **sola** voce `finta`
con `drb` (quella di `P6_LINEE`). Tutto il resto lo fa il gioco:

- le altre due opzioni e la loro scelta;
- la regola 221 («almeno un'opzione di passaggio»);
- il motore che gioca la finta (`_rew95`, D2);
- il 3D e l'esito.

**Il gioco non cambia.** Le partite `pass` non sono toccate, quindi passaggi, D1 e D3 restano misurati come prima.

- Testimone `__P363`, stampato per partita: `[p363] s/seme drib: sonda avvolta 1 · scene fra le linee N · con la finta offerta M`.
- `CPM_NO_P363=1` riporta la sonda di prima.
- **Nessuna soglia cambiata.** Il pavimento resta 4 finte; «non giudicato» resta rosso.

## 5. Misure sul banco (punta del ramo, a60b9576)

| corsa | esito | finte | note |
|---|---|---|---|
| verde, sole partite `drib` (`CPM_MISURA=1`) | — | **15** (riuscite 40%) | 49 highlight · 0 difetti · finta offerta in 16 scene su 16 |
| `CPM_ARMI=verde` | ✅ «highlight-95 verde» | **13** (riuscite 46,2%) | 91 highlight · passaggi 25 (pav. 12), arrivati 84,0% (pav. 70%) · D4 0 · difetti 0 · non giudicabili 0 |
| `CPM_ARMI=rosso` | ✅ «il rosso si vede» | 16 | D1, D2, D3, D4 tutti visibili (137 difetti attesi) |

I due pezzi girati IN PARALLELO (6 browser su 4 core): ogni partita ha toccato il tetto di 480 s (`fine playing`) e
il verde ha comunque 13 finte. La provocazione regge proprio nella condizione peggiore, quella in cui le
partite si accorciano.

| guardiano intero (`npm run highlight-95`, da solo) | ✅ «verde (e il rosso si vede)», 6.483 s | verde **15** (riuscite 40%) · rosso 16 | verde: 105 highlight · passaggi 34, arrivati 88,2% · D4 0 · difetti 0 · non giudicabili 0. Rosso: D1..D4 visibili |

Catena del giro (`node ci-runner.mjs sentinelle`, girata insieme al guardiano intero): **17/17 verdi**
(mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile ·
render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera · gk-dive-sync ·
schermate-97).

Senza provocazione, sul banco: 3 finte (rapporto 358, stessa misura sulla 7.999.210 e su cfbb7729).

Guardiani della macchina del treno: `treno-tempo-358` ✅ · `trenino-317` ✅ (la scelta del trenino comprende
`highlight-95`, base `v7.999.210`).

## 6. Fuori ambito, dichiarato

- La partita s5/1234 senza scene per l'eroe resta com'è: è un comportamento del motore, non un blocco. La
  durata sul banco (~550 s) l'ha già assorbita il giro 358 con lo spezzamento.
- `DURATE-GUARDIANI.json` non è stato toccato: le partite `drib` provocate hanno la stessa durata (è il
  cronometro della partita a deciderla, non il numero di finte).
