# Rapporto giro 77 — guardiani instabili e chiavi doppie

Base: `main` 7.999.174 (`f6a73df`). Ramo: `sviluppo/instabili-giro77`. GAME_VERSION non toccata, nessun merge su main.
Ambiente: sessione cloud a 4 CPU, `CPM_CHROME=/opt/pw-browsers/chromium`. **Il container è stato riavviato due volte
durante il giro** (processi uccisi a metà corsa): le corse interrotte non sono contate.

## Esito in breve

| guardiano | natura dell'instabilità | correzione | verifica |
|---|---|---|---|
| nazionale-155 | strumento (passo dato su una chiusura React vecchia) | sonda: attesa della ri-registrazione | 5/5 verdi · rossi `fin` e `sv` visibili |
| tempo-138 | strumento (il rosso spegneva il seme → partita del rosso non riproducibile) | rosso senza `__CPM_NO_SEME` | 5/5 verdi, rosso identico 5 su 5 (308/242) |
| apertura-261 | strumento (passo atteso dell'arco calcolato sul dt sbagliato) | passo atteso sul tempo d'arco che la posizione riflette + testimone | 5/5 verdi · rossi `__CPM_SALTO274` e `__CPM_NO_APERTURA261` visibili |
| nomi-219 | strumento (crash di Node, non una misura) | errore di un seme rigiocato una volta | vedi sezione |
| difesa-220-giro31 | strumento + campione piccolo (fps 1,4-3,4 sotto carico) | **non corretto** — punto aperto | riprodotto 1/1 |
| piedi-252 | **gioco sul filo della soglia** | **non corretto** — punto aperto | 2 verdi, 1 rossa su 3 |
| difesa-220-scena | non indagato in questo giro | — | — |

## nazionale-155

**Causa (misurata).** `window.__CPM_CAREER` si registra in un `useEffect` (src/18-career-app.jsx ~r.1391), cioè dopo il
commit. La sonda chiamava `step()` ogni 140 ms: sotto carico un passo partiva prima che il render del passo precedente
(e quello dell'effetto della finestra, che aggiunge l'amichevole al calendario) fosse arrivato, e decideva su una chiusura
vecchia: «settimana 18 senza gara → `doAdvanceWeek`» mentre lo stato vero era già alla 19 con l'amichevole. L'aggiornamento
funzionale saltava la 19; l'amichevole restava `19?` (mai giocata) e, pendente, bloccava le finestre 28 e 35 (`pend`).
Traccia passo-passo (sonda in scratch): nella corsa rossa compare `advanced@18 → lived@20[9,19?]`, nella verde
`simulated@19[9,19?] → advanced@19 → lived@20[9,19]`.
Riproduzione: 1 rossa su 5 da sola (presenze 1, finestre `9F+ 19F+ 28F- 35F-`); **3 rosse su 4** con quattro stagioni in
parallelo.

**Correzione (strumento, `tests/visual/nazionale-155.mjs`).** Dopo ogni passo la sonda aspetta che `__CPM_CAREER` sia
stato ri-registrato e resti fermo 250 ms (nessun render in coda), con tetto. Nessun cambio di soglia.

**Verifica.** Quattro stagioni in parallelo (stesso carico della riproduzione): 4/4 con 4 presenze. `nazionale-155`
5 corse di fila: **5/5 VERDE**. Rossi: `CPM_ROSSO=fin` → «il CT decide in 0 finestre», 1 presenza, FALLITO (atteso);
`CPM_ROSSO=sv` → «da svincolato passate 4, presenze 4», FALLITO (atteso).
⚠️ Queste corse sono state fatte prima della ricomposizione dell'HTML con la rimozione delle chiavi doppie (cambio neutro,
vedi sotto).

**Nota di gioco (non corretta, punto aperto 3).** Un'amichevole rimasta non giocata in una settimana passata blocca per
sempre le convocazioni successive (`pend`). Nel gioco vero la corsa sopra non si presenta (i bottoni usano chiusure
committate), ma lo stato bloccato non ha via d'uscita.

## tempo-138

**Causa (misurata).** Il braccio rosso accendeva anche `__CPM_NO_SEME` (aggiunto al 7.999.162). Senza SEME-a la ripresa
dopo ogni scena riceve eroe e pallone **resi dal 3D a tempo reale** (src/15-live-match.jsx, chiamata
`_M.chiedi.riprendi(...)` con `pPosRef`/`ballPosRef`), quindi la partita del rosso cambiava a ogni giro. Stessa build, stesso
seme, sonda `tempo-138.mjs` invariata:

| corsa | verde (aperto/pagato/residuo) | rosso (aperto/pagato/residuo) | esito |
|---|---|---|---|
| 1 | 132/132/0 | 264/250/14 | verde |
| 2 | 132/132/0 | 132/132/0 | **rosso cieco** |
| 3 | 132/132/0 | 154/154/0 | **rosso cieco** |
| 4 | 132/132/0 | 198/198/0 | **rosso cieco** |

Il verde (seme acceso) è identico 4 su 4. Il rosso con 6-9 scene paga tutto a 4 passi per battito: il difetto non si vede.
Col seme acceso il rosso è riproducibile: tre corse indipendenti con `__CPM_NO_TEMPO138,__CPM_NO_P6,__CPM_NO_INT226` →
308 aperti / 242 pagati, minuti delle scene identici (`2 5 19 22 40 43 49 54 57 59 62 69 71 73`); il tetto di 66 si vede
(66 passi persi). Il commento del 7.999.162 («il seme da solo copre il difetto») oggi non è più vero: misurato.
Contatore `__CPM_PASSI959`: 22 passi a ogni minuto in entrambe le corse confrontate (la divergenza non viene dai passi).

**Correzione (strumento, `tests/visual/tempo-138.mjs`).** Il rosso non spegne più `__CPM_NO_SEME`. Soglie invariate.

**Verifica (build finale del ramo).** 5 corse di fila, la quarta con piedi-252 in parallelo: **5/5 «✅ tempo-138 verde (e il
rosso si vede)»**; verde 132/132/0 e rosso 308 aperti / 242 pagati / 0 residuo in tutte e cinque (il rosso si vede dal
pagato < aperto: 66 passi tagliati dal vecchio tetto).

## apertura-261

**Causa (misurata).** Il criterio dei «salti non spiegati dalla velocità» confronta lo spostamento del pallone in un
fotogramma con `lunghezza × dt / durata` usando il `dt` **del fotogramma corrente**. Ma il render-loop scrive il pallone
sull'arco (src/12-three-match-view.jsx ~r.3872) **prima** di `ballArcT += aDt` (~r.4150): lo spostamento del fotogramma k
è il passo di tempo del fotogramma k-1. Con fotogrammi irregolari un passo normale sembrava un teletrasporto. Col testimone
nuovo (`aT0`, `prima`):
- «6,8 u in 0,014 s» = 34,8 u × 0,197 s (dt del fotogramma prima) / 1,01 s = 6,8 u;
- «8,8 u in 0,096 s»: fotogramma prima T 0,125→0,404 (dt 0,279) con 2,99 u; = 22,1 × 0,279 / 0,70 = 8,8 u;
- «7,4 u in 0,087 s»: fotogramma prima T −0,004→0,185 col pallone fermo (u bloccato a 0); = 31,4 × 0,185 / 0,79 = 7,35 u.

Per questo era rosso a **fps alti e irregolari** (macchina scarica: 3 rosse su 3 sul ramo, e la base `main` passava al filo:
7,6 u contro soglia 7,6) e verde a fps bassi (catena carica: la tolleranza 2× copriva).

**Correzione.**
- Strumento (`tests/visual/apertura-261.mjs`): passo atteso = lunghezza × |u(T a inizio fotogramma) − u(T a inizio del
  precedente)|, u = clamp(T/durata); per l'atterraggio (arco già spento) la velocità usa il maggiore fra dt corrente e
  precedente. Senza testimone resta il calcolo vecchio. Tolleranza invariata (2× +1 u).
- Testimone (src/12, sola lettura, solo dentro il blocco `_bj0` acceso sotto `__CPM_REC`/test): `aT0` (tempo d'arco a inizio
  fotogramma) e `sr.current._bjPrev477` (chi ha scritto il pallone e a che tempo d'arco nel fotogramma precedente), copiati
  nei record di `__CPM_BJ478`.

**Verifica.** 5 corse di fila a macchina scarica: **5/5 PASS**, teletrasporti 0 in tutte (salti scoperti 1, 1, 0, 3, 2).
Rosso `__CPM_SALTO274`: «✅ ROSSO come atteso», 8 teletrasporti contati (25,5 u in 0,051 s ecc.). Rosso
`__CPM_NO_APERTURA261`: «✅ ROSSO come atteso: prima immagine fuori 4/4, scarti oltre 3 u 1».

## nomi-219

**Causa.** Nella catena 174 il primo tentativo è finito con un **crash di Node** (ultima riga «Node.js v22.22.0», 5118 s per
due prove): non una misura. Nei tre lavoratori paralleli ogni `await` (attese da 20-90 s) era senza protezione; una sola
eccezione faceva rigettare il `Promise.all` e cadere il processo. Non ho potuto rivedere la riga esatta (il registro della
catena tiene solo le ultime tre righe): **Non posso confermare quale attesa sia scaduta**.

**Correzione (strumento, `tests/visual/nomi-219.mjs`).** Per ogni seme: errore stampato, conteggi parziali del seme tolti,
seme rigiocato una volta; se cade di nuovo resta fuori dal campione e viene dichiarato. Attesa di `__CPM_CAREER` 20 → 60 s.
Giudizio e soglie invariati (≥ 12 nominati, 75%, rosso con distacco 20 punti o un nominato oltre 35 u).

## difesa-220-giro31 (non corretto)

Riprodotto alla prima corsa (con altro carico sulla macchina): «VERDE VIOLA: (B) forti 20% > 15» (2 scene su 10).
Misurato sulle scene registrate: il 3D girava a **1,4-3,4 fotogrammi al secondo**; con `__CPM_DTREAL` il tempo di scena è
tappato a 0,3 s per fotogramma, mentre la finestra d'esito si chiude a tempo reale. 9 scene verdi su 10 sono state giudicate
prima dei 2 s dal contatto (fra 0,97 e 1,97 s di scena dopo il contatto). Le due «(B) forti»: V-k33-s2 (giudicata a 1,28 s,
pallone a 0,5 u dal loro e 0,6 u dal nostro: conteso) e V-k34-s1 (esito «battuto» giudicato a 1,39 s col pallone ancora sul
piede dell'eroe). Con ~10 scene la soglia del 15% ammette una sola scena: due casi contesi bastano a fare rosso.
In catena il guardiano non è fra i LENTI, quindi gira da solo (2 browser): lì gli fps sono più alti di questa riproduzione.
**Non posso confermare** il tasso di rosso in quelle condizioni: non ho misure.

## piedi-252 (non corretto)

Tre corse complete a macchina scarica: verde 0,330 ✅ · **0,417 ❌** · 0,365 ✅ (rosso 0,506 · 0,455 · 0,529); una quarta con tempo-138 in parallelo: verde 0,350 ✅ (testa 0,410, cross 0,350), rosso 0,585.
Il verdetto è il terzo valore su quattro (`mediana` prende l'elemento [2]), cioè quasi sempre il maggiore fra testa e cross
(tiro 0,17-0,28 e passaggio 0,23-0,26 stanno sempre sotto). Valori del braccio verde: testa 0,330 · 0,419 · 0,375; cross
0,400 · 0,417 · 0,365. Sommando i fotogrammi delle tre corse: **testa 98/262 = 0,374, cross 102/259 = 0,394** contro soglia
0,40 (con la quarta: testa 132/345 = 0,383, cross 130/339 = 0,383). Il rosso della seconda corsa (0,455) cade anche sul margine (verde + 0,08 = 0,497).
Conclusione: la dispersione per scena (~85 fotogrammi, ±0,05) è dello strumento, ma il valore vero sta sul filo della soglia;
più ripetizioni stringono la stima senza portarla sotto. Senza abbassare la soglia, serve una correzione del gioco
(appoggio del piede, già indicata nel rapporto del giro 76).

## Chiavi oggetto doppie

Trovate con un analizzatore sintattico su tutti i `src/*.jsx` (Babel, `ObjectExpression` con chiavi non calcolate):
esattamente le tre segnalate.

| file | chiave | prima | vinceva | correzione |
|---|---|---|---|---|
| src/12-three-match-view.jsx | `ball` (oggetto di `__CPM_STATE`) | r.2937 `{x,z}` di mondo · r.2945 `{x,y,worldY,onScreen,ndc,heldBy}` | la seconda | il valore vincente messo nella posizione della prima chiave, seconda tolta (ordine delle chiavi invariato) |
| src/12-three-match-view.jsx | `lR` (`__CPM_VOLLEY`) | r.8375 due volte, espressione identica | identiche | tolta la seconda |
| src/18-career-app.jsx | `setOffer` (`__CPM_CAREER`) | r.1431 e r.1493, corpo identico | identici | tolta la seconda, commento conservato sulla prima |

In JS con chiavi doppie vince l'ultimo valore ma la chiave resta nella posizione della prima: le correzioni conservano
valore e ordine. Dopo la modifica l'analizzatore non trova più chiavi doppie.

## Build

`node tools/build-src.mjs` + `node tools/check-src.mjs`: «IDENTICO BYTE PER BYTE».

## Punti aperti per la sessione madre

1. **piedi-252**: il gioco sta a ~0,39 contro 0,40 (misure sopra). Decidere fra correzione del piede d'appoggio (giro dedicato)
   o altra scelta; io non ho toccato soglia né statistica.
2. **difesa-220-giro31**: la misura «(B) forti» dipende dagli fps (finestra d'esito a tempo reale, scena a tempo di scena) e
   da un campione di ~10 scene contro una soglia del 15%. Opzioni da decidere: giudicare (B) solo dopo un tempo minimo di
   scena dal contatto, allargare il campione (più partite), oppure far contare la finestra d'esito in tempo di scena anche
   per i contrasti (cambio di gioco, come il 7.999.160 per i tiri). Non ho scelto.
3. **Amichevole pendente**: una nazionale non giocata in una settimana passata blocca per sempre le convocazioni (vedi
   nazionale-155). Nel gioco vero non l'ho riprodotta; da valutare una bonifica.
4. **difesa-220-scena**: non indagato (tempo consumato dai due riavvii del container).
5. Verifiche ancora parziali al momento della stesura: vedi la sezione «Stato delle verifiche» in fondo, aggiornata a ogni
   commit.
6. MAPPA dei file toccati (src/12, src/18) non eseguita per intero: 95 guardiani, ore di corsa, incompatibili con i riavvii.

## Stato delle verifiche

- nazionale-155: 5/5 verdi + 2 rossi visibili — **fatto**.
- apertura-261: 5/5 verdi + 2 rossi visibili — **fatto**.
- tempo-138: 5/5 verdi, rosso visibile 5/5 — **fatto**.
- nomi-219: in corso.
