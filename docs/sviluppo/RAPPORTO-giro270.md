# Rapporto giro 270 — controlli rossi di base: post partita, coppa, infortuni

Base `lavoro/197` (7.999.197 in preparazione, `GAME_VERSION` non toccata) · ramo `sviluppo/giro270-postpartita-coppa`.
Decisione PO 18/11 08:20: «Riparali tutti, in parallelo». Lotto 197 chiuso: solo questi cinque controlli.
Confronto con la 7.999.196 pubblicata: `origin/main` 3076a1b7 (worktree a parte, stessi file di prova: i cinque controlli non sono
cambiati dalla 195). Controlli uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`.

## Esito in breve

**Nessuno dei cinque rossi e' nato nella 197.** Quattro sono controlli rimasti indietro (due rispetto a decisioni gia' prese, due
rispetto alle regole PO-311 sui controlli instabili); uno nasconde anche un difetto vero del gioco, gia' presente nella 196, che ho
corretto con rosso `window.__CPM_NO_G270`.

| controllo | prima su 196 | prima su 197 | dopo (197 + giro 270) | causa | cosa ho cambiato |
|---|---|---|---|---|---|
| coppa-prestito-245 | **rosso** («il turno di coppa non viene giocato avanzando», voce `played:true` senza risultato) | rosso, identico | **verde 2/2**, rosso `__CPM_NO_COPPA_PRESTITO` visto in entrambe | controllo indietro rispetto a D17 del giro 155 (nato nella 195) | banco |
| infortunio-263 | verde 1/1 (fortuna: instabile, vedi sotto) | rosso 3/3 (3 controlli falliti: braccio «non convocato», settimana non avanzata) | **verde 2/2**, rosso `CPM_ROSSO=1` visto (9 bracci caduti) | controllo instabile: lettura del salvataggio a tempo fisso (giro 201, nato nella 195) | banco |
| partita-v2 | **rosso** («manca il tasto finale» in tel, tablet e PC) | rosso, identico | **verde 2/2** (3 formati × 5 schermate), rosso col tema di prova visto | controllo indietro rispetto a PO-385 (post partita a schede, giro 200, nato nella 195) | banco |
| partita-rigiocata-194 | **rosso** (verde e rosso fermi in `playing`: «strada playing») | rosso, identico | **verde 2/2**, rosso `__CPM_NO_CONF194` visto (ora con la riapertura dopo il fischio: SI) | tetto di parete di 400 s su una partita che sul banco dura molto di piu' | banco (lib/fischio-270) |
| spazio-296 | **rosso** (tel: 14 px accanto a «🧠 La tua scelta al 90'»; PC: «niente fischio») | rosso, identico | **verde 2/2** (44 schermate), rossi `__CPM_NO_SPAZIO296` (39/42) e `__CPM_NO_G174_SPAZIO` visti | tetto di parete di 420 s + **difetto vero del gioco** (14 px scritti a mano) | banco + **gioco** (src/15) |
| spazio-270 (nuovo) | — | — | **verde 2/2** (7 px tel e PC), rosso `__CPM_NO_G270` 14 px in tel e PC | guardiano della correzione | nuovo |

## 1. coppa-prestito-245

- **Misura.** Sonda passo per passo (registro `playedMd` e calendario a ogni `step()`): al passo 0 il registro contiene gia' `990, 992,
  993`; alla settimana 29 la bonifica 7.418 ritira «giornata 993 vs FC Bergamo risultava già giocata» e marca la voce `played:true,
  healed418:true` senza risultato. La 993 e' la semifinale che il salvataggio S12 aveva GIA' giocato: il banco la toglieva dal registro
  ma la lasciava nel calendario come voce giocata, e dal giro 155 (D17, bassi di PO-337 accettati dal PO il 10/11) il registro ricopia
  ogni voce giocata del calendario (stessa regola del caricamento). Con `__CPM_NO_G155_D17` acceso il controllo torna verde su 197:
  la causa e' quella.
- **Quando e' nato.** `__CPM_NO_G155_D17` entra con l'unione `6b0ee486` (lavoro/195). Verde su 7.999.170-173 (STABILITA.json), rosso
  su 196 e 197.
- **Correzione (banco).** Il banco toglie dal calendario anche le voci di coppa del turno ricreato o successivi (stato impossibile in
  gioco: un turno gia' giocato e da giocare insieme). Gioco invariato, soglie invariate.

## 2. infortunio-263

- **Misura.** Il braccio «non convocato» da solo passa; ripetuto 10 volte su 197 cade 1-3 volte. Testimone su `localStorage` ogni 50 ms:
  lo stato del gioco e' gia' alla settimana nuova dopo ~10 ms, il salvataggio arriva a **~650 ms** (debounce 600 ms) oppure a **~1080 ms**
  quando ~0,5 s dopo la simulazione si apre l'impulso della settimana e la copia delle finestre aperte (`scelte201`, giro 201) cambia
  `player` e riarma il debounce. Il banco leggeva il salvataggio dopo **900 ms fissi**. Frequenza del secondo cambio: **3 su 10 sulla 196**,
  5 su 22 sulla 197 (stesso codice di `scelte201`, identico byte per byte fra 196 e 197).
- **Correzione (banco).** PROCESSO.md, regole PO-311 punto 4 («si aspetta un evento… salvataggio alla settimana attesa»): dopo l'azione
  il banco aspetta che il salvataggio coincida con lo stato (settimana, fatica, infortunio, partite), tetto 10 s; se non arriva legge
  comunque e resta rosso. Soglie invariate.

## 3. partita-v2

- **Misura.** Su 196 e 197 il post partita mostra la scheda 1 di 4 con «Salta» e «Avanti ›»; il tasto finale (`post-continua-v2`) esiste
  solo sulla scheda 4 (giro 200, PO-385 «Schede una dopo l'altra», decisione PO 13/11). Il controllo (tappa 3, PO-302) lo cercava sulla
  scheda 1: rosso in ogni formato (la mappa del 263 riportava solo la prima riga, PC).
- **Correzione (banco).** Due schermate: `post` = scheda 1 (testata sul fondo V2, risultato grande in carattere TV e #f4f1ea, «Avanti ›»
  chiaro ≥ 44 px, «Salta» ≥ 44 px) e `postfine` = ultima scheda raggiunta premendo Avanti (tasto finale chiaro ≥ 44 px, piede sul fondo
  V2). Il braccio rosso (tema di prova a basso contrasto) deve far cadere PAL su ogni schermata, ora anche su `postfine`: caduto.

## 4. partita-rigiocata-194 e spazio-296 «niente fischio»

- **Misura (sonda `tests/visual/probe-fischio-270.mjs`).** Salvataggio save-194, autoplay. I fotogrammi non sono affamati (mediana ~95 ms),
  ma il minuto di gioco e' fatto di `_SUB898` sotto-battiti da `MATCH_TICK_MS/_SUB898` ms (`setInterval`, src/15 ~5453 e ~9686) e sul
  banco ogni sotto-battito aspetta un fotogramma: **un minuto costa 4-12 s invece di 1,7**, e rallenta col passare della partita.

  | build | minuto raggiunto in 150 s | intervallo mediano fra due minuti | p90 fotogramma |
  |---|---|---|---|
  | 7.999.190 | 34' | 4,0 s | 216 ms |
  | 7.999.196 | (partita intera: 56' a 519 s) | — | — |
  | lavoro/197 | 24' | 6,5 s | 344 ms |

  Con il tetto di 400 s (partita-rigiocata-194) e 420 s (spazio-296) il fischio non arrivava. Misurato anche sulla 196: partita-rigiocata-194
  rossa con verde e rosso fermi in `playing`; spazio-296 «pc post-partita (niente fischio)».
- **Correzione (banco).** `tests/visual/lib/fischio-270.mjs` (regola PO-311 punto 3, tempo di scena e non di parete): la partita vera gioca
  fino al 10', poi l'orologio va all'85' col varco di collaudo `__CPM_SALTA297` (lo stesso di partita-v2) tenendo il punteggio, e si aspetta
  il fischio NATURALE (`ended`/`ceremony`). L'attesa si ferma solo se l'orologio resta fermo 120 s in gioco fluido (rosso vero) o al tetto
  di sicurezza di 15 minuti. Misurato: fischio in 62-98 s. partita-rigiocata-194 pretende ora anche che il fischio sia arrivato (prima la
  riapertura poteva risultare «no» a partita mai finita).
- ⚠️ **Dipende dal fischio finale e dal battito del minuto.** Il giro 264 (in corso) cambia il battito del motore: dopo la sua unione
  vanno rifatti questi due controlli e la sonda `probe-fischio-270` (dice minuto, intervallo fra minuti e fotogrammi).

## 5. spazio-296 sul telefono — difetto del gioco

- **Misura.** spazio-296 su 196 (e nella mappa del 263 su 197, prova 1): «tel post-partita: 1 distanze oltre 10 (14 div «🧠 La tua scelta
  al 90'»)». Il riquadro `riep259` (src/15, PO-259) aveva `margin:"0 0 14px"` scritto a mano; la regola PO-296 (giro 91) vuole SP.box fra
  riquadri fratelli.
- **Correzione (gioco).** `margin-bottom` = `_sb(14)` (SP.box, 7 px; con `__CPM_NO_SPAZIO296` torna 14 come gli altri riquadri del giro 91);
  rosso del giro `window.__CPM_NO_G270` = 14 px. `node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE.
- **Guardiano nuovo `spazio-270`** (`npm run spazio-270`, ~10 min; in `completa`, `grafica` e nella MAPPA di src/15). Col salto all'85'
  spazio-296 non vede piu' la scheda del mister, quindi la si provoca: partita di carriera (save-194), salto all'80' sull'1-1 (momento
  «pari dopo il 75'» di INT259), autoplay che risponde, post partita aperto sulla scheda 2, distanza fra il fondo di `riep259` e il riquadro
  dopo («Il tuo tabellino»). Verde: 6-10 px in tel 412 e PC 1440 (misurato 7). Rosso `__CPM_NO_G270`: > 10 in entrambi (misurato 14).
  «Non giudicato» (niente fischio, niente riga della scelta) = rosso.

## Controlli eseguiti (uno alla volta)

| controllo | esito |
|---|---|
| coppa-prestito-245 | verde 2/2 (rosso visto in entrambe) |
| infortunio-263 | verde 2/2 · rosso `CPM_ROSSO=1` visto |
| partita-v2 | verde 2/2 · rosso `CPM_PROVA_ROSSO=1` visto |
| partita-rigiocata-194 | verde 2/2 (braccio rosso dentro la stessa corsa, visto 2/2) |
| spazio-296 (`npm run`, verde + 2 rossi) | verde 2/2 |
| spazio-270 (nuovo) | verde 2/2 (rosso dentro la stessa corsa, visto 2/2) |
| mappa mirata di src/15 + test:logic + save-compat | vedi sotto |

MAPPA_PLACEHOLDER

## Dubbi per il PO

1. **La partita sul banco e' sempre piu' lenta.** Misurato: un minuto di gioco costa 4 s sulla 190 e 6,5 s sulla 197 (fotogramma p90 216 →
   344 ms), e dentro la stessa partita rallenta (da ~2 s a ~12 s fra due minuti). Sul telefono il fotogramma e' molto piu' corto e il
   minuto resta vicino a 1,7 s, ma un telefono lento paga lo stesso meccanismo (22 sotto-battiti che aspettano un fotogramma). Non l'ho
   toccato: e' il battito del motore, che il giro 264 sta cambiando. Se il PO vuole, il rallentamento dentro la partita merita una misura
   a parte (sospetto, non verificato: qualcosa cresce durante la partita).
2. **Il salto all'85' nei due controlli.** partita-rigiocata-194 e spazio-296 non giocano piu' 90 minuti veri: 10' veri, poi l'85'. Per
   quello che giudicano (conferenza dopo il fischio, spazi del post partita) basta, ma il post partita misurato e' quello di una partita
   «corta» (meno eventi). Se il PO preferisce la partita intera, il controllo deve poter durare 15-20 minuti per braccio.
3. **Altri controlli con lo stesso tetto di parete.** `schede-259` ha `TETTO=420000` sulla partita intera con lo stesso schema; non era nella
   lista e non l'ho toccato (lo vedra' la mappa se rosso).
4. **infortunio-263 verde sulla 196 per caso.** La verifica di rilascio della 196 poteva vederlo verde o rosso: con la correzione e' stabile.
5. **coppa-prestito-245 e le giornate di campionato dopo il prestito.** Nella sonda, dopo il prestito ogni giornata di lega del club nuovo
   veniva «bonificata come gia' giocata» e recuperata «senza di te». Nel banco e' dovuto al salvataggio S12 riportato indietro dalla
   settimana 37 alla 24 (numeri di giornata gia' nel registro). Non ho verificato se in una carriera vera un prestito a meta' stagione
   possa trovare numeri di giornata del club nuovo gia' nel registro del vecchio club: non posso confermarlo, va misurato a parte.
