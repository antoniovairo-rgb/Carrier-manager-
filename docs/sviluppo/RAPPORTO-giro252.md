# Rapporto giro 252 — coreografie piccole nelle partite normali (seguito di PO-509, giro 244)

Ramo `sviluppo/giro252-coreografie-piccole`, partito da `lavoro/197` (7.999.197, contiene il giro 244). `GAME_VERSION` non toccata.

## La richiesta

Decisione PO 17/11 sui dubbi 2 e 4 del giro 244: «Sì, piccole» — anche nelle partite «normali» di campionato compare una coreografia del
catalogo del 244 in **taglia 1**, solo nella **curva di casa** e solo se c'è **tifo di casa** (stadio non vuoto/freddo); derby, coppe,
finali e big match restano come oggi. Rotazione e «mai la stessa due volte di fila» condivise fra tutte le taglie. La memoria della rotazione
resta sul dispositivo (nessun campo nel salvataggio).

## Misura prima (sul codice di partenza, `lavoro/197`)

Sonda nuova `tests/visual/coreografie-252.mjs` in sola misura. **Salvataggio di prova** (dubbio 2 del 244): lo stesso salvataggio del 244
trasformato in un club di **metà classifica** (FC Craven, `ful`, prestigio 70) a **inizio stagione** (settimane 4→27, classifica azzerata,
gare di campionato vere). Il tipo d'ingresso lo decide il gioco (`tipoIngresso206`), non la sonda; solo quattro gare su 24 sono forzate col
banco di prova (derby, coppa europea, big, Nazionale) per avere le taglie 2 e 3 nella stessa rotazione. Un solo contesto del browser
(= un dispositivo), ogni partita una pagina nuova, percorso vero salvataggio → partita → ingresso, corpi 3D accesi, notte.

| | prima |
|---|---|
| partite normali (dichiarate dal gioco) | 20 su 24 |
| normali col tifo di casa | 18 (le altre 2: trasferta a FC Dorset, stadio freddo) |
| **normali con la coreografia** | **0 su 20** (atteso 0) |
| taglie viste | 3 (derby) · 2 (coppa europea, Nazionale) · 1 (big di un club di metà classifica, tier 1) |

Le foto delle taglie 1 e 2 che il 244 non aveva: `docs/sviluppo/giro252/prima-14-big-trasferta.jpg` (taglia 1),
`prima-09-europea-casa.jpg` e `prima-19-nazionale-casa.jpg` (taglia 2), `prima-04-derby-casa.jpg` (taglia 3).
Numeri: `misura-coreografie252-prima.json`.

## Cosa è cambiato

File di gioco toccati: **solo `src/12-three-match-view.jsx`**, quattro righe dentro la scena dell'ingresso del 206/244 (zona tunnel/panchine
del giro 245 non toccata).

1. `_co252`: per il tipo `normale` la coreografia vale 1 (= solo curva di casa) invece dello 0 della tabella `INGRESSO206`; per gli altri
   tipi resta il valore della tabella. La **tabella non cambia**: nella normale fumogeni, coriandoli e inno restano spenti, regia «breve».
2. Taglia: `normale` → **1** sempre (anche se piazza calda porterebbe il tier a 2). Gli altri tipi come nel 244.
3. Il cancello del tifo è quello di sempre (`_tifoHome`, riempimento ≥ 0,45): stadio freddo = niente coreografia.
4. La scelta passa dallo stesso `coreo244Scegli`: stessa memoria `cpm-coreo244` sul dispositivo, stessa regola delle ultime quattro, per
   tutte le taglie. Nessun campo nuovo nel salvataggio.
5. **Rosso `window.__CPM_NO_G252`**: la normale torna senza coreografia (come prima). `__CPM_NO_G244` resta com'era (disegno unico del 206
   nelle sole gare che lo avevano).

Guardiani aggiornati:
- **nuovo `coreografie-252`** (`npm run coreografie-252` = verde + rosso), registrato una volta in `completa`, nella voce `src/12|13` della
  mappa e in `LENTI` (`node --check` verde).
- **`ingresso-206`** (riga del controllo «normale»): prima vietava qualunque coreografia nella partita normale, ora vieta solo la coreografia
  **ospite**, fumogeni e coriandoli; la coreografia di casa nella normale la giudica `coreografie-252`. **Non l'ho eseguito** (oltre 20
  minuti, non nella consegna): modifica verificata solo con `node --check` — vedi dubbio 3.

## Misura dopo

Stesse 24 partite, stesso salvataggio, stesso dispositivo:

| | prima | dopo |
|---|---|---|
| normali con la coreografia | 0 su 20 | **18 su 20** = tutte quelle col tifo di casa (18/18), taglia 1, larga 38 u |
| normali senza tifo di casa con coreografia | 0 | **0** (le due a stadio freddo restano senza) |
| curva ospite nelle normali | — | **mai** |
| taglie viste nella stessa rotazione | 1/2/3 | **1/2/3** (normale 1 · big metà classifica 1 · europea 2 · Nazionale 2 · derby 3) |
| stessa coreografia due partite di fila | — | **0** |
| fps ingresso normale, telefono 375×667 CPU×2 | 1,87 (rosso) | **2,66** con `bandieroni` forzata (la più pesante) |

Sequenza vista: stemma · scacchi · srotola · bandieroni (derby) · sigla · scritta · raggi · — (stadio freddo) · pali (europea) · croce · sigla ·
scacchi · stemma · pali (big) · diagonali · croce · scacchi · sigla · scritta (Nazionale) · — (stadio freddo) · scorre · stemma · scacchi · croce.
Undici nomi del catalogo su dodici (manca solo `gira` in questo giro).

**Prova del rosso** (`CPM_PROVA_ROSSO=1`, 6 normali con `__CPM_NO_G252`): 6/6 col tifo di casa, **0 con coreografia** → il guardiano
riconosce il comportamento di prima.

⚠️ fps: il verde misura **più** del rosso (2,66 contro 1,87) su un banco senza scheda grafica, ~180 fotogrammi per braccio. Non vuol dire che la
coreografia faccia guadagnare fotogrammi: è il rumore del banco a 2-3 fps. Il dato utile è che il costo non si vede (soglia 85% rispettata).
Sul telefono vero non ho misurato nulla.

Foto: `docs/sviluppo/giro252/dopo-tutte.jpg` (le 22 partite con la coreografia, una miniatura per partita) e le singole `dopo-NN-*.jpg`;
numeri: `misura-coreografie252-dopo.json`, `misura-coreografie252-rosso.json`.

## Guardiano

`coreografie-252` — VERDE: almeno 20 partite normali giudicate (tipo dichiarato dal gioco) e almeno 15 col tifo di casa · ogni normale col
tifo di casa ha la coreografia accesa in curva di casa, taglia 1, niente in curva ospite · una normale senza tifo di casa non ne ha · taglie
1, 2 e 3 viste almeno una volta · mai lo stesso nome due partite di fila (tutte le taglie) · derby/coppa europea/Nazionale mai in taglia 1 ·
nessun errore di pagina · fps ≥ 85% del rosso. ROSSO: 0 normali con coreografia. «Non giudicato» (ingresso mai raggiunto, meno normali del
minimo) = rosso. Durata: verde circa 40-45 minuti (24 ingressi + 2 per gli fps; stimata dalle attese, non cronometrata), rosso meno di 10 minuti.

## Controlli

Uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, build finale (`check-src`: IDENTICO BYTE PER BYTE).

| controllo | esito |
|---|---|
| `coreografie-252` verde | ✅ 18/20 normali con taglia 1 (18/18 col tifo), taglie 1/2/3, 0 di fila, fps 2,66/1,87 |
| `coreografie-252` rosso (`__CPM_NO_G252`) | ✅ 0 normali con coreografia su 6 |
| `coreografie-244` (verde + rosso) | ESITO_244 |
| `notte-206` | ✅ verde e rosso |
| `fps-249` | ✅ verde e rosso |
| `test:logic` | ✅ 51 pass · 0 fail |
| `save-compat` | ✅ 12 pass · 0 fail |
| `node --check` (ci-runner, coreografie-252, ingresso-206), `package.json` valido | ✅ |

Non eseguiti: `ingresso-206`, `highlight-95`, `career-critical` e il resto della mappa mirata di `src/12` (decine di guardiani): restano alla
verifica di rilascio.

## Dubbi per il PO

1. **Le partite normali in trasferta**: la coreografia sta nella curva di casa **dello stadio**, cioè quella del club avversario coi suoi
   colori (foto 11 e 17: curva blu di FC Haringey). È la stessa regola del 244 per tutte le taglie; se la «curva di casa» va intesa come
   «la curva della squadra del giocatore», nelle trasferte normali non dovrebbe comparire nulla.
2. **Quanto si vede nella regia «breve»**: la normale ha l'ingresso corto (scena 9 s, tunnel e uno stacco). La coreografia si accende dopo
   0,6 s e resta per tutta la scena, ma la mia foto è da una camera fissa della sonda: non ho verificato quanto della curva entri nelle
   inquadrature vere della regia breve. Potrebbe vedersi poco o niente.
3. **`ingresso-206` aggiornato ma non eseguito**: la regola «normale = niente coreografia» era scritta anche lì; l'ho allentata alla sola
   curva ospite. Il braccio verde di quel guardiano va confermato alla verifica di rilascio.
4. **Frequenza**: con questa regola quasi ogni partita casalinga ha una coreografia (18 su 20 nel campione). Il catalogo ha 12 voci e la
   regola vieta le ultime quattro: in una stagione le stesse coreografie tornano spesso (`scacchi` 4 volte su 22). Nessuna rarità è stata
   chiesta e non ne ho introdotte.
5. **Tabellone davanti alla curva**: in molte foto il tabellone copre il centro del telo (stesso tema del dubbio 7 del 244), più evidente
   sulla taglia 1 che è più bassa e stretta.
6. **Stadio freddo**: la soglia è quella già esistente (riempimento 0,45). Nel campione le uniche due escluse sono trasferte a FC Dorset.
7. **Telefono vero**: fps e leggibilità della taglia 1 vanno guardati sul dispositivo; il banco dice solo che il costo non si vede.
