# RAPPORTO giro 265 — riparazione di `portiere-223` («tuffo su un pallone largo»)

Ramo `sviluppo/giro265-portiere-largo`, partito da `lavoro/197` (91ba72d, contiene il giro 241). Versione di riferimento 7.999.197
(`GAME_VERSION` non toccata). Rosso unico del giro: `window.__CPM_NO_G265`. Guardiano nuovo: `npm run portiere-265`.

Tutti i numeri vengono da strumenti eseguiti in questa sessione (headless, viewport 412×915, 13-21 fotogrammi al secondo reali,
pagina nuova per ogni tiro). Dove un numero non l'ho misurato lo dico.

## 1. Che cosa ho misurato prima di correggere

**`portiere-223` sulla base, 3 corse del braccio verde:** verde, verde, verde (175-180 s l'una). Il giro 241 aveva misurato rosso,
rosso, verde e 2 rossi su 2: il controllo è **instabile**, non rosso fisso. Tre corse non bastano a vederlo.

**Sonda sulle sole gi86 e gi62** (stesso `portiere-223`, `CPM_SCENE` con le due azioni ripetute 10 volte, esito fuori e palo =
40 tiri sulla base): **4 difetti**, tutti «gi86 fuori: tuffo su un pallone largo (passa a 7,35-7,98 u, esce a 8,3-8,4 u)».
In quei 4 tiri — e in un quinto, gi62 palo — al momento del tiro il portiere stava a **x 49,04-49,20**: la linea di porta è a
48,6, quindi era **dentro la rete**. Negli altri 35 stava dove ci si aspetta (x 47,05-47,28).

**Perché è lì.** Ho esteso il testimone per fotogramma `__CPM_GK229` (solo prova) con: bersaglio del portiere, bersaglio
«commesso» (la media mobile che il motore di movimento insegue), velocità, e se c'è stato lo stacco di scena. Su gi86 fuori:

| Base, gi86 fuori, pagina nuova per tiro | 8 tiri | altri 4 tiri |
|---|---|---|
| portiere a più di 1,5 u dal suo punto prima del calcio | 5 | 3 |
| portiere oltre la linea di porta al calcio | 4 | 0 |
| tuffo | 3 | 0 |
| distanza massima dal suo punto | fino a 5,63 u | fino a 3,97 u |

La traccia per fotogramma dice che cosa succede, sempre uguale:

1. il banco apre la partita, aspetta 0,8 s e **forza** la scena. In quel momento il portiere è in viaggio verso il punto della
   scena con cui la partita si era aperta (bersaglio a x 39, lui a x 46,2-46,6 che corre a 3-4 u/s);
2. sul banco lo **stacco di scena è spento** (`_asIfPlay`, 7.345: sotto `?cpmtest=1` il taglio che rimette i corpi a posto non
   scatta — campo `stacco0` in ogni fotogramma). Nel gioco vero scatta sempre;
3. il bersaglio nuovo è a x 47, ma il bersaglio **commesso** resta a x 40,3-41,8 e ci mette circa 0,6 s a tornare. Il portiere
   lo insegue fino a x 43,4;
4. poi torna col modello dei giocatori di movimento (accelerazione limitata, sterzata limitata): fa un **giro largo** (fino a
   z −5,9, cioè 4-5,6 u dal suo punto) e arriva lanciato a x 49,2, che è il bordo del campo, non la linea di porta;
5. lì il calcolo «a portata» del giro 223 lo trova **dietro** il punto d'arrivo del tiro (48,5), misura 3,4-4,2 u e lo fa tuffare.
   Il guardiano, che guarda il pallone fino a 1,2 u dalla linea, lo vede passare a 7,3-8 u: «tuffo su un pallone largo».

**Con lo stacco di scena attivo** (`CPM_PRESENT=1`, cioè come nel gioco): 12 tiri (gi86 e gi62, fuori), portiere oltre la linea
**0**, a più di 1,5 u dal suo punto **0**, tuffi **0**. Il portiere viene rimesso sul punto all'apertura della scena.

Quindi: il rosso nasce da una condizione che il **banco** crea (scena forzata senza stacco, con i corpi in viaggio). Non ho una
misura che lo mostri nel gioco vero. Quello che il banco ha messo in luce però è vero in ogni caso: se il punto del portiere
cambia mentre lui è lanciato, il portiere fa un giro largo e può finire dentro la porta; e il calcolo «a portata» e il guardiano
guardavano due pezzi diversi della stessa traiettoria.

**Bisezione sui commit: non fatta.** Ho trovato la causa leggendo i fotogrammi, senza cercare il commit. Non posso confermare
quale giro (241, 245, 255, 264 o un altro) abbia reso il difetto visibile: essendo instabile, una bisezione chiede molte
ripetizioni per commit (ore di macchina).

## 2. Che cosa ho cambiato nel gioco

Tutto in `src/12-three-match-view.jsx`, tutto dietro `window.__CPM_NO_G265` (con la bandiera torna com'era).

1. **Negli highlight il portiere sta sul suo punto.** Quando lo muove la sua guida (il ciclo dei portieri), negli highlight:
   il bersaglio commesso è il bersaglio (niente ritardo, come già per il portatore di palla dal 7.850); si gira sul posto invece
   di fare la curva; si ferma 0,4 u davanti alla linea di porta. Fuori dagli highlight (gioco fluido) non cambia nulla.
2. **«A portata» conta il pallone fino a 1,2 u dalla linea di porta**, lo stesso tratto che misura `portiere-223`. Prima contava
   anche l'ultimo pezzo fino al palo.

Il punto 2 è il **secondo tentativo**. Dopo il solo punto 1 `portiere-223` ha dato verde, rosso, rosso su un caso nuovo:
«gi17 tiro a giro, esito palo: tuffo su un pallone largo (5,87 e 6,19 u)». Misurato su 6 tiri: col punto 1 il portiere in 2 tiri
su 6 si fermava a (47,57; −0,45) invece che a (47,2; −1,5), e da lì il palo risultava «a portata» per pochi centimetri (4,11 u di
lato contro la soglia 4,5). Sulla base lo stesso caso era già sul filo: **4,54 e 4,59 u** in due corse su tre. Il tiro a giro
arriva sul palo in diagonale: negli ultimi 0,9 u scende da z 5,0-5,9 a 3,66, ed è solo quel tratto a entrare nei 4,5 u.

Due cose ho corretto nel secondo tentativo: la regola del punto 1 vale solo per la guida del portiere (nel primo tentativo
restava attiva anche quando, nello stesso fotogramma, lo chiama il copione del build-up — vedi dubbio 3), e il punto 2.

Non ho toccato soglie, né nel gioco né in `portiere-223`.

## 3. Misure dopo la correzione

| | Base | Dopo |
|---|---|---|
| gi86 fuori, 8 tiri: portiere a più di 1,5 u dal suo punto prima del calcio | 5 | 0 (massimo 1,07 u) |
| gi86 fuori, 8 tiri: portiere oltre la linea al calcio | 4 | 0 (x massima 47,18) |
| gi17, gi86, gi62 con palo e fuori (16 tiri): tuffi | — | 0 |
| distanza di lato calcolata dal gioco su quei 16 tiri (soglia «a portata» 4,5) | 4,11-5,34 (gi17 palo) · 5,19-6,11 (gi62, gi86) | 7,1-10,8 |
| `portiere-223` braccio verde, 3 corse di fila | verde ×3 qui; rosso 2 su 3 e 2 su 2 nel giro 241 | **verde ×3** (177, 173, 182 s) |
| `portiere-223` nelle 3 corse: tiri giudicati · con un gesto · a portata | — | 14 · 3 · 3 in tutte e tre |

Nelle tre corse verdi i tiri senza tuffo (33) hanno distanza di lato minima 4,52 u e quelli col tuffo (9) massima 3,89 u.
Il caso più vicino alla soglia è gi1 «Rovesciata», esito palo: **4,52 e 4,54 u** in due corse su tre. Lì il guardiano non può
dare «tuffo su un pallone largo» perché il pallone esce a 3,3 u dal centro (serve oltre 5,35), ma il gesto del portiere su
quell'azione può cambiare da una corsa all'altra (dubbio 4).

## 4. Il guardiano `portiere-265`

`tests/visual/portiere-265.mjs`, `npm run portiere-265` (276 s, due bracci). Aggiunto alla mappa mirata di `src/12`.

Il difetto spontaneo dipende da dove si trova il portiere quando la scena viene forzata (col rosso: 5 su 8, 3 su 4, 2 su 8).
Un rosso così non vale: il guardiano lo **provoca**.

- **Rientro provocato** (3 per braccio, gi86, nessun tiro). Nella fase di scelta la sonda sposta il bersaglio del portiere a
  10 u dal suo punto e, appena lui è in corsa (oltre 4 u/s), lo riporta sul punto. È l'inversione a corpo lanciato che il banco
  produce a tratti. Da fermo il difetto non nasce (misurato: 0 su 3 anche col rosso). Nei 2,5 s di scena dopo:
  «giro largo» (più di 1 u di lato dalla retta verso il punto), «in porta» (x oltre 48,6), «non torna» (alla fine a più di 1 u
  o ancora in movimento).
- **Tiro spontaneo** (4 per braccio: gi86 fuori ×2, gi86 palo, gi62 fuori): «in porta» prima del calcio, «in corsa» al calcio.
- Un caso senza i fotogrammi che servono è non giudicato = rosso.

| | verde | rosso `__CPM_NO_G265` |
|---|---|---|
| scarto di lato nel rientro | 0,01-0,09 u | 3,9-4,45 u |
| dopo 2,5 s | 0,08-0,44 u dal punto, fermo | 3,3-4,6 u, a 6-7 u/s |
| frenata dopo l'inversione (stampata, non giudicata) | 1,5-1,7 u | 2,9-4,3 u |
| esito | 0 difetti su 7 | 3 rientri su 3 con difetto |

Eseguito 2 volte intero con questi criteri: stessi esiti.

## 5. Controlli

Eseguiti uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), memoria libera 15,1-15,5 GB, disco 29 GB.
Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e `node tools/check-src.mjs`.

| Controllo | Esito | Durata | Ultima riga |
|---|---|---|---|
| `portiere-223` braccio verde, 3 corse di fila | ✅ verde ×3 | 177 · 173 · 182 s | «VERDE — sui tiri sbagliati il pallone non attraversa il portiere…» (14 tiri giudicati, 3 con gesto, 3 a portata, in tutte e tre) |
| `portiere-223` braccio rosso (`__CPM_NO_G223`) | ✅ rosso visto | 177 s | «ROSSO (atteso: __CPM_NO_G223) — 13 difetti» |
| `portiere-265` (nuovo, verde + rosso `__CPM_NO_G265`) | ✅ verde | 276 s | «portiere-265 VERDE (verde col verde, rosso col rosso)» — 0 difetti su 7 · 3 rientri provocati su 3 con difetto |
| `parata-100`, 2 corse | ✅ verde ×2 | 1790 · 1788 s | «parata-100 verde · il rosso si vede» (verde: parate 7 e 6, difetti 0; rosso: difetti 2 e 1) |
| `camera-241` | ✅ verde | 732 s | «camera-241 VERDE (verde col verde, rosso col rosso)» — 22/22, rosso in 5 testimoni su 8 |
| `dribbling-226` | ✅ verde | 731 s | «dribbling-226 VERDE (verde col verde, rosso col rosso)» — rosso in 7 esecuzioni su 12 |
| `gol-eroe-154` | ✅ verde | 3909 s | «gol-eroe-154 verde e rosso» — 10/10 partite valide per braccio |
| `test:logic` | ✅ verde | 2 s | 51 prove, nessuna fallita |
| `save-compat` | ✅ verde | 1 s | «SAVE-COMPAT 12 pass · 0 fail · PASS» |
| `design-system` (nucleo) | ✅ verde | <1 s | «SISTEMA GRAFICO OK» |
| `tema-unico` (nucleo) | ✅ verde | 18 s | «ROSSO ATTESO OK…» |
| `typing-shortcuts` (nucleo) | ✅ verde | 13 s | «PASS — chi scrive tiene la tastiera…» |
| `web-237` (nucleo) | ✅ verde | 47 s | «PROVA DEL ROSSO RIUSCITA…» |
| `gk-miss-229` (mappa `src/12`) | ✅ verde | 171 s | «VERDE — sui tiri sbagliati il portiere si muove verso il pallone prima che lo superi, e guarda uscire quelli lontani» |
| `gk-dive-sync` (mappa) | ✅ verde | 154 s | «PASS — quando il portiere completa la distesa, la completa all'arrivo della palla» |
| `parata-258` (mappa) | ✅ verde | 74 s | «PASS parata-258 (4/4 parate con il pallone sulle mani)» |
| `rete-252` (mappa) | ✅ verde | 270 s | «rete-252 VERDE» |
| `rinvio-252` (mappa) | ✅ verde | 221 s | «rinvio-252 VERDE» |
| `goal-postarc` (mappa) | ✅ verde | 358 s | «PASS — ogni gol dichiarato ha la sua conclusione giocata e la palla arriva in porta» |
| `esiti-241` (mappa), 2 corse | ⚠️ **instabile**: rosso, verde | 343 · 356 s | 1ª: «rosso G102: 0 consegne in area col portiere in tuffo su 2 (attese >= 1)» · 2ª: «esiti-241 verde … e il rosso si vede» (2/2). Sulla base, 1 corsa: verde (2/2) |
| `validate-situations` (mappa), 2 corse | ⚠️ **instabile**: rosso, verde | 840 · 952 s | 1ª: 13 categorie su 14, «post-highlight — gi0: salto camera 41,9 > 30» · 2ª: «PASS», 14 su 14. Sulla base, 1 corsa: PASS |
| `portiere-252` (mappa) | ❌ **rosso** | 517 s | «portiere-252 ROSSO — rosso NON VISTO: 0 KO su 5 portieri giudicati». Il braccio verde è pulito (0 KO su 5). **Sulla base il solo braccio rosso dà lo stesso: 0 KO su 4 giudicati** (304 s) |

**Tre esiti non verdi, misurati anche sulla base (copia separata di `lavoro/197`, 91ba72d, senza le mie modifiche):**

- **`portiere-252` è rosso, e lo è anche sulla base.** Il suo braccio verde è pulito; è il braccio rosso (`__CPM_NO_GK252`) che non
  produce il difetto atteso, col mio build (0 KO su 5) e sulla base (0 KO su 4). Il guardiano stesso si dichiara «intermittente».
  Non l'ho riparato: è fuori dalla consegna (dubbio 9). Non dichiaro verde questo controllo.
- **`esiti-241`: rosso, poi verde.** Il rosso era il suo braccio `__CPM_NO_G102` che non vedeva il tuffo (0 su 2); alla riprova 2 su 2.
  Il guardiano annota già questo comportamento sotto carico. Sulla base: verde in 1 corsa. Due corse non bastano a dire se la mia
  correzione lo rende più frequente (dubbio 10).
- **`validate-situations`: rosso, poi verde.** `post-highlight`, salto di camera su gi0; `CLAUDE.md` lo descrive come tremolante.
  Sulla base: verde in 1 corsa. Stesso limite: una corsa per parte (dubbio 10).

Una prima corsa di `gol-eroe-154` è stata **interrotta** a 8 partite su 10 dal tetto di due ore del gruppo in sottofondo: non
vale, l'ho rifatta da capo (è quella in tabella). Una corsa di `portiere-252` sulla base è stata tagliata dal tetto di dieci
minuti a due scene dalla fine: non vale, ho rifatto il solo braccio rosso. Durante le misure sulla base il contenitore è stato
riavviato: nessun file perso, misura rifatta.

**Non eseguiti.** La riga della mappa mirata per `src/12` elenca 76 guardiani. Ne ho eseguiti 12 (quelli del portiere, il gate
e i tre della consegna che ci stanno dentro: `portiere-223`, `parata-100`, `dribbling-226`). **Non ho eseguito gli altri 64**:
`rigorista-257`, `formazioni-262`, `tunnel-245`, `coreografie-244`, `salienti-243`, `guardalinee-222`, `tocco3d-219`,
`lotteria-191`, `piazzato-204`, `pullman-204`, `nomi-182`, `chiusura-99`, `consegna-103`, `colla-103`, `contatto-103`,
`carriera3-94`, `assist-298`, `scena3d-96`, `spazio-296`, `panchina-293`, `pc-tablet-292`, `ingresso-285`, `corpi-073`,
`ingresso-276`, `stadi-064`, `render-3d-023`, `avvicinamento-61`, `linee-61`, `pallone-278`, `ingresso-277`, `inquadra-273`,
`salti-274`, `memoria-275`, `buildup-sync`, `po229-gi38`, `esiti-218`, `cross-218`, `scene-221`, `fila-227`, `bambini-294`,
`partita-vera`, `bambini-236`, `pressing-143`, `conduci-242`, `ingresso-245`, `giornale-244`, `difesa-220-scena`,
`ingresso-camminata-245`, `analisi-217`, `piedi-252`, `difesa-252`, `aereo-252`, `difesa-220-giro31`, `apertura-261`,
`camera-252`, `reazione-252`, `spot-266`, `testa-143`, `stadi-071`, `cerimonie`, `passaggio-coppa-137`,
`kit-061`, `strisce-corpo`. I controlli già fatti hanno preso circa 4 ore e mezza di macchina; il resto va alla verifica di
rilascio. Fuori per regola: `highlight-95`, `ingresso-206`, `career-critical`.

Nessuna foto di altri giri rigenerata in `docs/`; `docs/governo/STABILITA.json`, scritto da un avvio di `ci-runner.mjs`, è stato
rimesso com'era e non è nei commit.

## 6. File toccati

- `src/12-three-match-view.jsx` — correzione (4 punti) e testimone esteso; `CARRIER-MANAGER-AV.html` ricomposto.
- `tests/visual/portiere-265.mjs` (nuovo), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs` (una voce nella
  riga di `src/12`).
- `CLAUDE.md` — invariante «negli highlight il portiere sta sul suo punto».
- `tests/visual/portiere-223.mjs` **non toccato**.

## Dubbi per il PO

1. **Il difetto misurato nasce sul banco, non l'ho visto nel gioco.** Con lo stacco di scena attivo (come gioca il giocatore)
   il portiere è al suo posto 12 volte su 12. La correzione rende il portiere corretto anche senza stacco, ma non posso
   dire che il giocatore abbia mai visto questo tuffo. Alternativa che non ho scelto io: far armare a `portiere-223` lo stacco
   di scena (`__CPM_PRESENT=1`), così misura il gioco com'è giocato. Cambierebbe le condizioni del guardiano, non una soglia.
2. **Nella fase di scelta il punto del portiere scivola verso il pallone.** Misurato su gi86 tenendo aperta la scelta: in 2,4 s
   il bersaglio del portiere passa da z 4,8 a z 11,7 (il palo è a 3,35) e lui lo segue a 7 u/s. Sul banco il congelamento di
   lettura è spento; nel gioco vero non l'ho misurato. Se succede anche lì, chi ci pensa qualche secondo vede il portiere
   uscire dai pali. Non l'ho toccato.
3. **Durante la costruzione dell'azione il portiere ha due guide.** Il suo ciclo lo manda al punto logico (per esempio 47; −2),
   il copione del build-up nello stesso fotogramma lo manda a (48; 0). Lui resta in mezzo, e dove si ferma dipende dalla corsa.
   Esisteva già; l'ho lasciato com'era. Va deciso quale delle due comanda.
4. **gi1 «Rovesciata», esito palo, è sul filo della soglia «a portata»** (4,52-4,54 u contro 4,5): il portiere a volte ci
   proverà e a volte no. Sul tiro fuori il gioco sceglie già un bersaglio lontano dal bordo; sul palo il bersaglio è il palo e
   non si può spostare. Non è un rosso del guardiano; è una decisione di gioco se sul palo «sul filo» il portiere debba
   tuffarsi sempre o mai.
5. **«A portata» ora ignora l'ultimo tratto prima del palo.** Su un tiro diagonale che prende il palo il portiere non si
   tuffa più se il pallone gli resta lontano fino a 1,2 u dalla linea. Misurato su gi17 e gi86 (pallone a 5,4-9,5 u): lì
   guardare è giusto. Non ho censito tutte le azioni con esito palo (il censimento del giro 223 ne contava 86 fra palo e fuori).
6. **Il punto del portiere cambia da una corsa all'altra** sulla stessa azione (z −2,99 · −2,04 · −1,63 · −0,88 su gi86): viene
   dalla posizione logica dei ventidue, che ha un sorteggio. È il motivo per cui lo stesso tiro dà distanze diverse.
7. **`tests/visual/ci-runner.mjs` ha righe doppie nella mappa mirata**: 12 righe per `src/12`/`src/13`, e vale solo la prima.
   La regola dice «ogni catena una sola volta». Non le ho sistemate: scegliere quale delle 12 è quella giusta è una decisione.
   Ho aggiunto `portiere-265` alla prima, che è quella usata.
8. **Bisezione non fatta** (vedi §1): non so quale giro ha reso visibile il difetto.
9. **`portiere-252` è rosso anche sulla base**: il suo braccio rosso non vede più il difetto (0 KO su 4 sulla base, 0 su 5 col mio
   build). Va riparato in un giro suo (decisione PO 13/10).
10. **`esiti-241` e `validate-situations` sono usciti una volta rossi e una verdi** sul mio build, verdi nell'unica corsa sulla
    base. Con una corsa per parte non posso dire se la correzione li rende più instabili o se è il loro tremolio di sempre.
11. **64 guardiani della mappa di `src/12` non eseguiti** (elenco al §5).
