# Rapporto giro 415 — PO-679 «il compagno ha segnato calciando come se fosse spalla alla porta»

Ramo: `sviluppo/giro415-finalizzatore` (base `main` = 7.999.217). `GAME_VERSION` e `docs/governo` non toccati.

## La nota del PO

Taccuino [KE 7.999.216] S.2 W.22 · 4' · vs FC Munchen (1-0) · scena [cross] «Sei sulla fascia, KNAPP ti chiude!» ·
azione «Cross a rientrare» → assist riuscito. PO: «il compagno ha segnato calciando come se fosse spalla alla porta»
(codice 000). Bozza automatica: codice 007, la camera salta di 7,2 u fra due fotogrammi (623 u/s) a 4,0 s, intervallo 88 ms.

## Misura (No Blind Fix)

Sonda nuova `tests/visual/misura-415.mjs`: 12 scene costruite dal motore (`scenaDalMotoreFascia`, la stessa famiglia della
scena del PO) che offrono «Cross a rientrare», due lati, due pressioni, 12 semi; GLB acceso, teatro acceso
(`__CPM_PRESENT` + `__CPM_CINE`), pagina nuova ogni 5 scene, esito forzato gol.

**Come si misura l'orientamento.** Testimone nuovo `__CPM_FIN415` (src/12, solo collaudo): in ogni fotogramma del gesto di
conclusione del compagno registra l'angolo fra il davanti del **corpo disegnato** (perpendicolare alla linea delle spalle e
delle anche dello scheletro GLB) e la direzione della porta, insieme alla rotazione della mesh logica.
Taratura fatta prima di misurare: su 23 corpi fermi o in corsa il davanti calcolato dalle ossa coincide con la rotazione
della radice del corpo GLB entro circa 10°.

| | corpo al contatto (gradi dalla porta) | massimo nel gesto | mesh logica | salti di camera |
|---|---|---|---|---|
| **prima** (7.999.217) | 100–178°, mediana 167°, **12/12 oltre 90°** | fino a 179° | 1° | 0/12 |
| **dopo** | **3–8°** | massimo 15° | 1° | 0/12 |
| **rosso** `__CPM_NO_G415` | 85–173°, 11/12 oltre 90° | fino a 179° | 1° | 0/12 |

In tutte le 36 esecuzioni l'esito è gol col pallone in rete.

## Causa

- Il giro 7.673 gira verso la porta la **mesh logica** di chi conclude (`_versoPorta673`), ma il **corpo GLB disegnato non
  eredita quella rotazione**: si gira solo col proprio movimento (ramo `_gsp` nel ciclo dei corpi, src/12).
- Sul cross arretrato il pallone **torna indietro** dal fondo (bersaglio a x 30–37): chi lo attacca lo insegue, cioè corre
  verso la propria metà campo, e il corpo disegnato punta lì.
- La mira del gesto (latch 7.517/7.636) scatta solo se c'è un arco vivo quando si monta la clip. Qui il pallone parte in
  post-arco (`in_net`) senza arco vivo, quindi la mira non scatta e il calcio esce col corpo girato.
- Inoltre il pallone riparte **nel primo fotogramma** del gesto: per questo il corpo deve guardare la porta **prima** del contatto.
  Girarlo durante il gesto non basta.

## Correzione (alla sorgente)

`src/12-three-match-view.jsx` (e `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`):

1. `_versoPorta673`: lascia sulla mesh la mira verso la porta (`_porta415 = {sk, y}`), perché la legga anche il corpo GLB.
2. Ciclo dei corpi GLB, prima del ramo della mira 7.517: nuovo `_fin415`. Vale per chi attacca il cross nella scena
   dell'eroe, dalla seconda metà del volo (`crossRcvMesh`, `hl_result`, non difensivo, progresso dell'arco ≥ 0,35), e per
   chi ha chiesto un gesto di conclusione verso la porta nella scena corrente.
   - **Prima del gesto** il corpo si gira verso la porta (rotazione smorzata `dt*9`, niente scatti). Il ramo «guarda dove
     corri» resta spento per lui: la locomozione direzionale 7.518 sceglie da sola corsa all'indietro o laterale.
   - **Nel gesto** la mira 7.517 è la porta.
3. Testimone `__CPM_FIN415` (solo con la variabile armata), con la proiezione a schermo del finalizzatore per le foto.
4. Rosso `window.__CPM_NO_G415`: comportamento di prima.

Fuori ambito: la clip del calcio, la rotazione della mesh logica, il portiere, il punto di caduta del cross.

## Camera (codice 007 della bozza)

Il salto **non si riproduce** sul banco: 0 su 36 esecuzioni, con la regola di `misura-364`/`fasce-364` (passo > 40·dt + 2 u
di scena). Il passo massimo misurato è 0,8–1,07 u (16–21 u/s di scena), fra 2,2 e 3,9 s. **Non posso confermare** la
causa del 7,2 u in 88 ms del telefono, per due motivi:

- 88 ms è un fotogramma perso (circa 11 fps);
- i 623 u/s della bozza vengono quasi certamente da un'altra coppia di fotogrammi, perché 7,2 u in 88 ms fanno 82 u/s. Il
  taccuino prende passo massimo e velocità massima da coppie diverse (`src/10`, `_cMax`/`_cVel`).

Nessuna correzione alla cieca. Il guardiano però **giudica** la camera su ogni scena: un salto fa diventare rosso il verde.

## Guardiano

`npm run finalizzatore-415` (`tests/visual/finalizzatore-415.mjs`), messo nella riga della MAPPA che già esisteva
(`src/12-|src/13-`); `mappa-unica` è verde. Le soglie sono state scritte **prima** di applicare la correzione.

- **Verde**, per ogni scena:
  - corpo a non più di 35° dalla porta al contatto e mai oltre 60° nel gesto;
  - nessun salto di camera fuori dallo stacco;
  - gol col pallone in rete.
- **Rosso** (`__CPM_NO_G415`): almeno il 75% delle scene col corpo oltre 90° al contatto.
- Una scena non giudicata conta come rosso; servono almeno 8 scene giudicate per braccio.

## Foto (GLB acceso, scena ferma con `__CPM_FROZEN` nel fotogramma del calcio)

«Prima» è il braccio rosso, che riproduce il comportamento misurato sulla 7.999.217.

- `docs/collaudo-po/415-prima-destra.png` · `415-prima-destra-zoom.png` — fascia destra, il finalizzatore calcia girato
  verso la camera e la propria metà campo.
- `docs/collaudo-po/415-dopo-destra.png` · `415-dopo-destra-zoom.png` — stesso istante, corpo verso la porta.
- `docs/collaudo-po/415-prima-sinistra*.png` · `415-dopo-sinistra*.png` — fascia sinistra.

Strumento: `tests/visual/foto-415.mjs`.

## File toccati

- `src/12-three-match-view.jsx`: `_versoPorta673` (+1 riga), ciclo dei corpi GLB (blocco `_fin415` prima del ramo
  della mira 7.517, condizione `!_fin415` sul ramo «guarda dove corri»), testimone `__CPM_FIN415` nella selezione delle clip.
- `CARRIER-MANAGER-AV.html`: ricomposto.
- `tests/visual/misura-415.mjs` (sonda), `tests/visual/finalizzatore-415.mjs` (guardiano), `tests/visual/foto-415.mjs` (foto).
- `tests/visual/package.json` (script `finalizzatore-415`), `tests/visual/ci-runner.mjs` (riga della MAPPA `src/12-|src/13-`).
- `docs/collaudo-po/415-*.png`, questo rapporto.

## Esiti dei rituali

Vedi la sezione «Rituali» in fondo.

## Dubbi per il PO

**1. Come arriva sul pallone chi conclude il cross a rientrare.**
- **(A) CONSIGLIATA, GIÀ APPLICATA:** dalla seconda metà del volo il corpo guarda la porta e, se deve andare incontro al
  pallone che torna indietro, lo fa con la corsa all'indietro o laterale. Al contatto è già girato.
- (B) Il corpo si gira solo nell'istante del calcio. Costa poco, ma la rotazione si vedrebbe come un colpo di frusta (fino a
  170° in un fotogramma) e il pallone parte comunque prima.
- (C) Cambiare la corsa: il compagno aspetta fermo al limite dell'area invece di inseguire il pallone. È più realistico come
  movimento, ma tocca la consegna del cross (giri 364/7.335) e richiede un giro a parte.

**2. Il pallone parte nel primo fotogramma della clip di calcio**, mentre il piede tocca il pallone più avanti nella clip.
È un difetto distinto, misurato qui ma non corretto.
- (A) CONSIGLIATA: aprire una voce a parte e far partire il pallone al contatto della clip, sulla colonna `contactAt` della
  tabella GESTI.
- (B) Lasciarlo così.
- (C) Accorciare l'inizio della clip del compagno.

**3. Il salto di camera della bozza (codice 007).**
- (A) CONSIGLIATA: non correggere alla cieca. Il guardiano lo sorveglia; se ritorna sul telefono, serve il registro della
  scena con i tempi dei fotogrammi, perché 88 ms indicano un fotogramma perso.
- (B) Correggere il taccuino perché misuri passo e velocità sulla stessa coppia di fotogrammi. Riguarda la `src/10` ed è
  fuori dall'ambito di questo giro.
- (C) Allargare la misura alle partite vere (`misura-364-vere`).

## Rituali

- `node tools/build-src.mjs` + `node tools/check-src.mjs`: ricomposto, privacy coerente.
- `npm run mappa-unica`: verde col verde, rosso con la mappa vecchia.
- `node ci-runner.mjs giro finalizzatore-415`: **catena giro su 7.999.217, 18/18 verdi** (finalizzatore-415 verde + rosso
  in 443 s, più le 17 sentinelle: mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico,
  griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync,
  schermate-97).
- Guardiani di camera e di cross già esistenti: vedi sotto (aggiunti dopo la consegna rapida).
