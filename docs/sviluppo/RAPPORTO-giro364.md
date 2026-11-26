# Rapporto giro 364 — PO-650 «le azioni sulle fasce sono terribili e confusionarie» (priorità alta del PO, 25/11 16:15)

Base `lavoro/201` (punta `c9b63364`), ramo `sviluppo/giro364-fasce`. GAME_VERSION non toccata.
File del gioco toccati: `src/04` (zona di movimento della scena di fascia), `src/11` (sequenza del cross e del rientro),
`src/12` (rifinitore, volo, pallone in lettura, camera), più il ricomposto `CARRIER-MANAGER-AV.html`.
`src/14` (motore) e `src/15` (partita) non sono toccati: l'allargamento dell'eroe del giro 345 resta com'è.

## Risposta in breve
Nelle scene di fascia l'eroe ora resta sulla fascia fino al cross, il cross è lungo e cade in area su un compagno che ci arriva
di corsa, il compagno si vede per tutto il volo e la camera è molto più ferma. Misurato sulle stesse 6 partite vere (GLB acceso,
costruzione dell'azione e teatro accesi, 11 scene di fascia giudicate, tutte cross dell'eroe; la colonna «dopo» è l'ultima corsa,
fatta sul build definitivo a catena chiusa — registri in `docs/sviluppo/giro364/partite-vere-prima.txt` e `partite-vere-dopo.txt`):

| Difetto | Prima | Dopo |
|---|---|---|
| Eroe al centro al momento del cross (\|z\| sotto 12) | **9 su 11** (z mediana 8,6 · minimo 6,2) | **0 su 11** (z mediana 21,3 · minimo 20,6) |
| Accentramento dell'eroe fra la scelta e il cross | mediana **+7,4 u** verso il centro | mediana **−4,5 u** (si allarga) |
| Lunghezza del cross | mediana **6,7 u** (da 0,9 a 19,6) | mediana **24,1 u** (da 19,8 a 28,5) |
| Cross che cade fuori area | 3 su 11 | 0 su 11 |
| Compagno a più di 2 u dal pallone all'arrivo | **6 su 11** (mediana 2,6 u, massimo 3,5) | **0 su 11** (mediana 0,8 u, massimo 1,3) |
| Compagno nel quadro per meno di metà del volo | 3 su 11 | 0 su 11 |
| Strada della camera nella lettura, fuori dallo stacco nero | mediana **14,4 u**, massimo 22,5 (velocità massima mediana 47 u/s) | mediana **0,3 u**, massimo 5,3 (velocità massima mediana 1 u/s) |
| Strada della camera durante l'esito | mediana **51 u**, massimo 75 (velocità massima fino a 75 u/s) | mediana **12,6 u**, massimo 17,9 (velocità massima fino a 22 u/s) |
| Salto del pallone fuori dallo stacco | 0 su 11 in questa corsa (1 su 7 in una corsa scartata; 2-3 su 11 in due corse intermedie) | 0 su 11 |
| Esito «occasione» col pallone in rete | 0 su 10 | 0 su 10 |

Sul banco (guardiano `fasce-364`, scene costruite dal motore in 3 punti di fascia, 14 cross per braccio):

| Misura | Rosso `__CPM_NO_G364` | Verde |
|---|---|---|
| Cross bocciati | **14 su 14** | **0 su 14** |
| z dell'eroe al contatto (mediana) | 12,7 | 22,9 |
| Accentramento mediano | +8,4 u | −1,8 u |
| Lunghezza mediana del cross | 8,5 u | 23,5 u |
| «Rientra e tira»: z al tiro | 20,9 (tira dalla linea laterale) | 8,8 (rientra davvero) |
| Bordo interno della zona di movimento della scena di fascia | 10 dal centro | 20 dal centro |
| Sequenza pura, 288 cross da largo: eroe più stretto di dov'era | 288 | 0 |

Foto per il PO (GLB acceso, telefono 412 × 915 a densità 2; riga sopra PRIMA, riga sotto DOPO; la scelta · il cross parte · l'arrivo):
`docs/collaudo-po/364-cross-secondo-palo.png`, `364-cross-basso-teso-sinistra.png`, `364-sterzata-esterna-e-cross.png`,
`364-rientra-e-tira.png`.

## Come ho misurato
- **Testimone** `__CPM_F364` (src/12, solo prova, acceso da `__CPM_REC364`): un campione per fotogramma negli highlight, tutto dalle
  mesh nello stesso fotogramma (una sorgente sola): eroe, pallone con lo scrittore del fotogramma, camera disegnata e sguardo, arco e
  bersaglio, i due riceventi con la posizione nel quadro, i compagni, stacco nero vivo.
- **Banco** `tests/visual/misura-364.mjs`: scene costruite dal motore (`scenaDalMotoreFascia`) in 4 punti di fascia × semi, ogni
  azione, esiti gol / occasione / fallito; pagina nuova ogni 6 scene; si passa dall'introduzione vera.
- **Partite vere** `tests/visual/misura-364-vere.mjs`: salvataggi veri × semi, la partita chiede sempre la scena «fascia»
  (`__CPM_TIPO_OCC`, gancio di solo collaudo che esisteva già), la sonda sceglie un cross. Le due corse (prima e dopo) servono da
  una **copia congelata** del gioco, così il lavoro in corso non cambia il file sotto le partite.
- **Motore in node** (300 partite): dove stanno i compagni quando il motore apre una scena di fascia.

Due errori miei durante la misura, da dire: (1) la prima corsa «prima» sulle partite vere girava **senza la costruzione dell'azione**
(sotto `?cpmtest=1` è spenta se non si arma `__CPM_CINE`): mostrava accentramento zero e l'ho buttata; (2) una versione intermedia
spostava la camera a mano all'apertura e aveva un errore di ordine delle dichiarazioni: il testimone restava senza fotogrammi nella
lettura. Il guardiano ora tratta un errore di pagina come «non giudicato» (rosso).

## Cause (misurate)
1. **L'eroe si accentrava per costruzione.** Nella sequenza del cross (`buildHLTimeline`, src/11) la variabile `side` punta verso il
   CENTRO (vale −1 con y ≥ 50): «sy+side·11» e «sy+side·12» portavano l'eroe 12 unità dentro il campo prima del cross. Banco:
   accentramento 8,4-8,5 u in **ogni** scena di cross (z 23,1 → 14,7; 19 → 10,6). Partite vere: da z 13-20 a z 6-13. È la bozza
   del PO («al contatto l'eroe sta a z −0,4» · «a z −6,9»): la zona di movimento arrivava a 10 dal centro e da lì la sequenza
   toglieva altri 12.
2. **Il cross non mirava un uomo.** Bersaglio sorteggiato, poi tirato per il 60 % verso il compagno più vicino *dov'era*, poi
   stretto verso il centro dalla regola di qualità: cross lunghi anche 0,9-4,4 u con 3 di quota. Il compagno ci andava scivolando
   a 3,4 al secondo e non arrivava (1,4-6,3 u dal pallone all'arrivo sul banco); il pallone ripartiva con un secondo volo verso un
   punto fisso e poi restava parcheggiato ad aspettarlo. È «il passaggio è freezato per qualche istante poi interviene magicamente
   il compagno».
3. **In area non entrava nessuno.** La mappa degli attori dà «compagno 1» e «compagno 2» ai due più vicini all'EROE: sul cross
   venivano richiamati accanto a lui sulla fascia. Nel motore, all'apertura di una scena di fascia, non c'è nessun compagno in
   area in **128 aperture su 154** (banco node, 300 partite): il più avanzato sta a x 73,9 (mediana), 8 unità fuori dall'area.
   Inoltre un attore della sequenza veniva guidato due volte nello stesso fotogramma (esecutore e ciclo ordinario), e il compagno
   nominato dal motore veniva tirato sul suo «punto di ricezione» del giro 99, 12 u davanti all'eroe.
4. **La camera restava di fianco all'eroe** e inseguiva: il quadro verticale è largo 21 gradi, l'area e chi la attacca erano fuori
   quadro fino all'arrivo del pallone; nell'esito la camera faceva 51 u di strada (mediana).
5. **«Rientra e tira» non rientrava**: lo scatto finale andava di 2 unità verso l'ESTERNO; tiro da z 19-23, a 18-28 u dalla porta.
6. **Salto del pallone in lettura** («SALTO di 10,2 u in 17 ms, scrittore: inseguitore»): quando lo scatto di scena mette il pallone
   sul punto del commit vecchio (indagine aperta del 7.400), l'inseguitore lo porta verso l'eroe a ~32 u/s e, al passaggio a
   movimento o scelta, un'assegnazione secca gli fa fare d'un colpo quello che manca: 6-26 u in un fotogramma fuori dallo stacco.
   Visto in 1 scena su 7 e in 2-3 su 11 secondo la corsa (è una corsa fra due commit, quindi non si ripete uguale).

## Correzioni (rosso `window.__CPM_NO_G364`; un interruttore per braccio)
- **A — l'eroe resta largo** (`__CPM_NO_G364A`, src/11 e src/04). Da largo (18 o più dal centro) la sequenza del cross è nuova:
  l'eroe corre LUNGO la fascia e si allarga fino a 32-42 dal centro (l'area disegnata è larga 29,65), poi crossa; niente scambio
  corto prima del cross (conduzione, uno contro uno, cross). La zona di movimento della scena di fascia ha il bordo interno a 20
  dal centro.
- **B — il cross cade sul rifinitore che arriva** (`__CPM_NO_G364B`, src/12). Il rifinitore è il compagno nominato dal motore
  («X attacca l'area») se può arrivarci, altrimenti il più vicino al suo palo; un secondo uomo attacca l'altro palo, due marcatori
  li seguono, il terzino chiude sull'eroe. Tutti partono da dove sono e corrono mentre l'eroe conduce; chi è attore ha una guida
  sola. Il punto di caduta è quello della variante (primo palo, secondo palo, a rimorchio), accorciato verso il rifinitore se non
  ci arriva nel tempo di volo; durata dal percorso vero a 22 u/s, quota dalla lunghezza (cross teso basso). Il rifinitore scatta
  quanto serve per esserci. All'arrivo colpisce subito (testa se il pallone arriva alto, piede se basso): niente secondo volo e
  niente attesa. Sull'esito «occasione» ci prova e il pallone gli sfugge (prima restava fermo a guardarlo cadere).
- **C — il pallone in lettura non si teletrasporta** (`__CPM_NO_G364C`, src/12). A fine fotogramma, nelle fasi di lettura e fuori
  dallo stacco nero, il pallone non fa più di un passo da pallone (48 u/s): quello che manca lo percorre nei fotogrammi dopo.
  Solo nel gioco vero o col teatro acceso (sul banco ordinario le scene forzate restano identiche).
- **D — la camera** (`__CPM_NO_G364D`, src/12). Nelle scene con zona «fascia» la lettura nasce 14 u dietro l'eroe verso il centro
  dell'area (sotto lo stacco d'apertura); nel cross largo la regia «eroe e pallone insieme» del giro 241 vale per tutta la scena,
  col perno sul punto del cross e l'asse verso il punto di caduta: la camera arriva prima dell'eroe e non gira quando il pallone
  parte.
- **R — «Rientra e tira» rientra** (`__CPM_NO_G364R`, src/11): da largo taglia fino a 11 dal centro prima del tiro.

Nessun sorteggio aggiunto. Il motore non è toccato: i numeri di partita non cambiano.

### Camera: il residuo e la sua correzione
In una corsa intermedia una scena su 11 aveva ancora 29 u di camera a vista nell'introduzione: le posizioni vere della scena erano
arrivate un fotogramma dopo l'apertura e lo scatto di scena era già stato consumato sul punto vecchio. Ora la regola usa il punto
LOGICO dell'eroe e, la prima volta che vale per la scena, richiede lo scatto di scena col meccanismo che c'è già (immediato sotto
lo stacco ancora vivo). Nella corsa finale sulle partite vere: massimo 5,3 u in lettura su 11 scene.

## Cosa NON ho riprodotto (lo dico chiaramente)
- **«Camera che salta di 7,2 u fra due fotogrammi (9 ms)»**: 0 su 11 prima, 0 su 11 dopo, 0 sul banco. In headless a 8-25
  fotogrammi al secondo un salto da 9 ms non si può vedere (regola nota del codice 007): il giudice resta il telefono del PO.
  Quello che ho misurato e ridotto è la strada e la velocità della camera (tabella sopra).
- **«Esito occasione ma pallone in rete»**: 0 su 10 prima e 0 su 10 dopo sulle partite vere, 0 sul banco con l'esito forzato a
  «occasione». Il guardiano lo controlla (occasione = pallone fuori dalla rete). Non posso confermare che la bozza vedesse un caso
  vero: non l'ho mai visto accadere.
- **Compagno visibile PRIMA della scelta** (PO-653, in coda): la camera di lettura nuova NON aumenta i compagni in area nel quadro
  alla scelta sulle partite vere: sommati sulle 11 scene sono 18 prima e 14 dopo (in area, all'apertura, spesso non c'è ancora
  nessuno: ci entrano durante la corsa dell'eroe). Il guardiano lo dichiara e non lo giudica. Il compagno ora si vede per tutto il
  volo, non prima della scelta.

## Guardiano
`npm run fasce-364` (verde poi rosso), nella riga `src/12|src/13` della mappa (mappa-unica verde).
- (A) node: 288 cross da largo sulla sequenza pura, 48 «Rientra e tira», sequenze valide.
- (B) browser, GLB acceso, teatro acceso: zona di movimento, 14 cross su scene del motore in 3 punti di fascia (gol e occasione),
  un «Rientra e tira». Soglie: z al contatto ≥ 18 · accentramento ≤ 2 u · cross ≥ 15 u in area · ricevente entro 3 u all'arrivo e
  nel quadro per almeno il 60 % del volo · pallone mai fermo oltre 0,5 s prima dell'esito · nessun salto di pallone o camera fuori
  dallo stacco · occasione = fuori dalla rete, gol = in rete. Senza fotogrammi, senza arco o con un errore di pagina = non
  giudicato = rosso.
- Soglie fissate dopo la misura e non abbassate: la prima corsa del verde bocciava 2 cross su 14 (secondo palo da sinistra,
  ricevente a 3,9-4,1 u); la causa era la regola di qualità che stringeva il bersaglio dopo il mio calcolo, più il passo lento
  del rifinitore. Corretta la causa: 1,3-1,4 u.

## Catena
Catena definitiva sul build finale (commit `068dce6e` del ramo), registro in `docs/sviluppo/giro364/catena.txt`:
`node ci-runner.mjs giro fasce-364 validate-situations scena3d-96 salti-274 goal-postarc cross-218 camera-252 buildup-sync
apertura-261 portatore-286 ball-owner camera-241 difesa-343 esiti-241 avvicinamento-61` + 17 sentinelle = 32 passi.

**31 verdi su 32.**

| Passo | Esito |
|---|---|
| fasce-364 (verde + rosso) | verde (513 s) |
| validate-situations (gate, 14 categorie) | verde (816 s) — firma golden invariata |
| scena3d-96 · salti-274 · goal-postarc · cross-218 | verdi (1066 · 680 · 619 · 169 s) |
| camera-241 · camera-252 · apertura-261 | verdi (572 · 178 · 190 s) |
| portatore-286 · ball-owner · difesa-343 · esiti-241 · avvicinamento-61 | verdi (317 · 734 · 208 · 267 · 89 s) |
| 17 sentinelle (mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, career-critical, battito-264, partita-vera, render-3d-023, tunnel-285, gk-dive-sync, home-298, schermate-97, web-237) | tutte verdi |
| **buildup-sync** | **rosso** — rosso dichiarato, identico alla base (vedi sotto) |

**buildup-sync (rosso, non di questo giro).** È già in `ROSSI-DICHIARATI.json` su main («rosso sul banco 3/3 anche sulla 7.999.200»).
L'ho rimisurato sulle 4 scene uscite rosse (`CPM_SCENE=40,79,83,91`): **base** (punta `c9b63364`, senza questo giro) 3 scene
fallite (gi40 8,3 u · gi83 25,6 u · gi91 7,4 u), **giro** 2 scene fallite (gi40 8,9 u · gi79 45,4 u). Stesso difetto (salto del
pallone all'ingresso della costruzione), scene diverse da una corsa all'altra.

**portatore-286 (instabile, non di questo giro).** Verde al primo colpo nella catena definitiva; nei due avvii precedenti era
uscito «verde alla prova 2» sempre sulla scena gi54 difensiva. Misurato con esecuzioni alternate su quella scena: **base** 2
difetti su 16, **giro** 2 su 16 (il difetto compare quando il pallone si aggancia all'avversario 19 invece del 15: 0,5-0,7 u di
va e vieni). È già fra i rossi dichiarati («già rosso nel treno della 7.999.200»). Per la regola «un guardiano instabile due volte
si ripara» va riparato in un giro suo: è il dubbio 7.

**Storia degli avvii (quattro), da dire.**
1. Primo avvio fermato da me dopo 10 minuti per chiudere il residuo della camera (1 scena su 11).
2. Secondo avvio: `outcome-not-goal` dentro la catena è andato oltre un'ora. Misurato a parte: raccoglie 2 azioni in 4-4,5 minuti
   sia sulla base sia sul giro (è lento di suo: 14 azioni ≈ 30 minuti e più). L'ho tolto dalla catena ed eseguito a parte (sotto).
   Nello stesso avvio **rosso vero mio**: `apertura-261` — lo sguardo che scrivevo prima dello scatto di scena stava 5 u davanti
   all'eroe e a fine fotogramma risultava spostato di 3,6-3,9 u (tetto 3). Corretto (sguardo sull'eroe): 1,2 u.
3. Terzo avvio: **rosso vero mio** nel gate, `data-coherence` 10 problemi («computeArc ha lanciato: sr is not defined»): avevo
   messo il calcolo del rifinitore dentro il blocco d'arco che la suite valuta come matematica pura (la trappola è scritta in
   CLAUDE.md). Spostato fuori, dove sta già l'aggancio del ricevente: la suite analitica torna a 0 FAIL.
4. Quarto avvio: la catena definitiva qui sopra.

**outcome-not-goal** (a parte, flusso vero, 14 azioni non-gol): in corso al momento della prima consegna (la sonda impiega oltre 30 minuti); a parte, su 2 azioni raccolte per build, base e giro danno lo stesso esito («ciò che il gioco dichiara e ciò che il campo mostra dicono la stessa cosa»). L'esito completo segue in un commit a parte.

## Limiti
- Le partite vere misurano cross dell'eroe dalla scena del motore (11 scene, 10 con esito «occasione» e 1 gol); le schede del
  catalogo con cross da largo passano dalla stessa sequenza ma le ho coperte solo coi guardiani esistenti (cross-218, esiti-241,
  scena3d-96, il gate).
- Le foto sono del build definitivo, su scene forzate dal banco: lì i compagni partono da dove li ha lasciati la partita di
  provino (spesso già in area), nelle partite vere partono più indietro e corrono di più.
- Headless a 8-25 fotogrammi al secondo: i tempi di scena sono giusti, quelli percepiti no. Il giudizio su fluidità e camera resta
  al telefono del PO.

## Dubbi per il PO (la consigliata per prima)
1. **Esito «occasione» sul cross: cosa deve fare il compagno arrivato sul pallone?**
   a) *(consigliata)* ci prova (testa o piede) e il pallone gli sfugge e balla in area, come dicono riquadro e cronaca — è com'è ora;
   b) colpisce e il portiere para: più spettacolare, ma riquadro e cronaca del cross oggi dicono «il compagno non riesce a
      concludere», andrebbero cambiati insieme;
   c) un difensore anticipa di testa e libera: serve un gesto difensivo nuovo e un testo nuovo.
2. **Camera di lettura delle scene di fascia (dietro l'eroe, verso l'area).**
   a) *(consigliata)* tenerla: la camera non gira più alla scelta (0,1 u contro 14,4 in lettura, 13,5 contro 51 nell'esito);
   b) lettura come prima e camera nuova solo dalla scelta: torna il giro di camera a inizio azione;
   c) camera più alta e larga su tutta l'area: l'eroe diventa più piccolo (taglia già bocciata sul telefono al 7.509).
3. **Quanto può accentrarsi il giocatore nella scena di fascia** (oggi il bordo interno è a 20 dal centro).
   a) *(consigliata)* così: la scena resta «di fascia» e il testo dice il vero;
   b) solo corsia (bordo a 26): l'eroe quasi non si può spostare verso l'interno;
   c) libero come prima: ma allora da dentro il campo le opzioni dovrebbero diventare quelle «fra le linee» (lavoro a parte).
4. **«Rientra e tira»** (ora taglia fino a 11 dal centro, tiro da 12-15 u).
   a) *(consigliata)* così; b) rientro più corto e tiro a giro dal vertice dell'area (15-18 dal centro); c) togliere l'opzione
   dalla scena di fascia e lasciare solo i cross.
5. **Compagni in area all'apertura.** Nel motore, quando l'eroe è largo, in area non c'è nessuno 128 volte su 154.
   a) *(consigliata)* lasciare il motore com'è: ora entrano in area mentre l'eroe corre, e si vedono;
   b) farli attaccare l'area già nel MOTORE quando l'eroe si allarga: cambia la simulazione (gol, tiri), giro a parte col suo banco;
   c) mostrare l'inserimento già nella lettura, prima della scelta: è PO-653, già in coda.
6. **Salto di camera e «occasione in rete» non riprodotti.**
   a) *(consigliata)* chiudere questa parte col guardiano e aspettare il collaudo sul telefono: se il taccuino li riporta ancora
      sulla versione nuova, la bozza dirà scena e istante;
   b) una sonda dedicata che gira sul telefono del PO (registrazione dei fotogrammi a 60 al secondo);
   c) un giro dedicato alla camera sulle sole scene di fascia con ripresa video.
7. **Due guardiani già rossi o instabili sulla base, visti in catena** (`buildup-sync`: salto del pallone all'ingresso della
   costruzione, 3 scene su 4 sulla base; `portatore-286`: gi54 difensiva, 2 difetti su 16 sulla base). Sono entrambi fra i rossi
   dichiarati.
   a) *(consigliata)* un giro dedicato per ciascuno, con la sua sonda (per `portatore-286` il punto di partenza è misurato: il
      difetto compare quando il pallone si aggancia all'avversario 19 invece del 15);
   b) lasciarli fra i rossi dichiarati fino alla pubblicazione;
   c) un giro unico «pallone all'ingresso della scena» che li prende insieme all'indagine aperta del 7.400 (scatto di scena sul
      commit vecchio), che è la stessa famiglia del salto in lettura corretto qui col braccio C.
