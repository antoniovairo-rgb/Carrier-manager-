# Rapporto giro 342 — PO-629, i colpi di testa

Ramo `sviluppo/giro342-colpi-di-testa` (base `lavoro/201`, fd2b933). GAME_VERSION non toccata.

PO, 22-23/11: «le azioni da colpi testa vanno riviste, non c'è il sincronismo ed il movimento non è naturale» · «era un cross» ·
«ma in generale tutti i colpi di testa non sono ben congeniati».

## 1. Come ho misurato

- **Testimone nuovo** `__CPM_G342W` (src/12, sola lettura, acceso solo da `__CPM_G342_REC`): un record per fotogramma in `hl_result`
  per chi colpisce di testa — tempo di scena, osso della testa, pallone, corpo, bacino, punte dei piedi, clip e suo tempo, scala, peso,
  gesto, arco.
- **Sonda/guardiano** `tests/visual/testa-342.mjs`: GLB acceso (direttiva PO 29/07), teatro acceso (`__CPM_PRESENT` + `__CPM_CINE`),
  una pagina nuova per esecuzione, tempo di scena a passo 1/60 s (`__CPM_DT60`, «al rallentatore») o reale (`--passo=reale`).
- **Censimento**: tutte le 29 azioni di testa delle situazioni (enumerate dal gioco con `deriveHL(...).type==='header'`), ciascuna
  riuscita e fallita = 58 esecuzioni. Tipi: cross 11 azioni, angolo 2, tuffo 1, difensivo 4, sponda 6, rimbalzo 4, lancio 1.
- **Profilo della clip** `header` sul corpo dell'eroe (gancio di collaudo `__CPM_CLIP342`, sonda `misura-clip-342.mjs`).

Grandezze (tutte in tempo di **scena**):

| grandezza | cosa dice | soglia del guardiano (scritta prima della correzione) |
|---|---|---|
| testa-pallone al contatto | distanza osso della testa ↔ pallone nel fotogramma in cui parte l'arco del colpo | ≤ 0,45 u |
| scarto del picco | quando la testa è più alta rispetto al contatto | ≤ ±0,15 s |
| frustata clip ↔ pallone | (tempo della clip al contatto − 0,79 s) / scala: il pallone arriva prima (−) o dopo (+) la frustata della testa nella clip | ≤ ±0,08 s |
| peso del gesto | quanto del corpo è la clip di testa al contatto | ≥ 0,60 |
| scatto della testa | massimo spostamento della testa fra due fotogrammi | ≤ 14 u/s |
| piedi che pattinano | strada in pianta di un piede a terra col gesto di testa montato | ≤ 0,60 u |

«Non giudicato» (testimone vuoto, arco mai partito) vale **rosso**.

## 2. Prima (lavoro/201, fd2b933): 56 esecuzioni giudicate, 56 fuori soglia

| tipo | esec. | testa-pallone med/max | frustata↔pallone med/max (s) | scala clip | scatto testa max | piedi che pattinano max | caduta del corpo max |
|---|---|---|---|---|---|---|---|
| cross | 20 | 0,12 / 0,82 | 0,11 / 0,11 | 2,80× | 35,4 u/s | 1,49 u | 31,7 u/s |
| angolo | 4 | 0,10 / 0,14 | 0,11 / 0,11 | 2,80× | 50,2 | 0,26 | 50,0 |
| tuffo | 2 | 0,83 / 0,86 | 0,07 / 0,08 | 2,80× | 60,2 | 0,48 | 60,2 |
| difensivo | 8 | 0,36 / 0,89 | 0,50 / 0,57 | 1,34× | 28,5 | 1,09 | 27,4 |
| sponda | 12 | 0,16 / 0,42 | 0,11 / 0,11 | 2,80× | 31,4 | 1,39 | 27,7 |
| rimbalzo | 8 | 0,11 / 0,13 | 0,11 / 0,11 | 2,80× | 62,1 | 0,16 | 62,1 |
| lancio | 2 | 0,06 / 0,11 | 0,11 / 0,11 | 2,80× | 16,8 | 0,03 | 6,4 |

gi41 (azione 1, «Colpo di testa normale», scena `special`) non produce il testimone né prima né dopo: **non giudicata** (vedi §6).

Il dato che sembrava buono (testa e pallone a 0,1 u al contatto) era vero ma ingannava: **il pallone toccava la testa nel momento
sbagliato del gesto**. Cause misurate:

1. **La clip di testa correva a 2,80×.** Il pre-stacco (7.999.33) la montava quando `actType` era ancora nullo, e la scala «mostrala
   tutta» (7.356) prendeva la finestra di serie (0,55 s) invece di quella del colpo di testa (1,15 s): 1,542 s di clip in 0,55 s.
2. **Il contatto cadeva nel caricamento, non nella frustata.** Profilo della clip `header`: testa ferma fino a 0,34 s, si carica
   all'indietro (−0,23 u dal bacino a 0,63 s), **frustata in avanti con picco di velocità a 0,79 s**, rientro a 0,94 s. Il pallone
   arrivava a 0,47 s di clip: la frustata avveniva 0,11 s di scena *dopo* che il pallone era già ripartito. Sui difensivi 0,5-0,57 s
   prima (la clip finiva a 0,02 s dal contatto e ripartiva da zero: due colpi di testa per un pallone).
3. **Lo stacco durava 0,16 s**, perché il pre-stacco guardava solo l'ultimo tratto della costruzione, che sui cross è il «controllo»
   di 0,13 s; la salita era un quarto di seno in quel tempo.
4. **La clip finita si ri-armava** (0,38 s dopo il contatto sugli offensivi falliti): un fotogramma senza gesto, poi da capo.
5. **L'esultanza tagliava il colpo di testa**: su 7 gol di testa su 16 la clip di gioia partiva 0,09-0,19 s di scena dopo il contatto,
   a pallone ancora in volo, e il corpo cadeva di colpo dall'apice (35-50 u/s). Il piano dell'esultanza arriva in tempo reale, il
   gesto vive in tempo di scena; sul banco (scena ~10 volte più lenta del reale) la gara si vede sempre. **Sul telefono non posso
   confermarlo**: dipende dai fotogrammi al secondo del dispositivo.
6. **Il tuffo saliva sempre a 0,85** (testa a 2,48 col pallone a 1,64): 0,86 u al contatto.
7. **Secondo palo: torsione di 23° in un fotogramma** (1372°/s), perché il gesto parte già all'apice (u 0,5) e la torsione era
   un valore assoluto `sin(u·π)·0,4`.
8. **Discesa**: mezzo seno su 0,575 s (il corpo «plana») e, dove il gesto veniva spento, caduta secca.

## 3. Correzioni (src/12, tutte dietro `__CPM_NO_G342` = comportamento di prima)

| # | dove | cosa |
|---|---|---|
| 1 | montaggio del gesto | la clip di testa dell'eroe prende **sempre** la finestra del colpo di testa: scala 1,34× |
| 2 | montaggio del gesto | **fase**: col pre-stacco vivo la clip parte da `0,79 − tempo_all'arrivo × scala`, così la frustata cade sul pallone (`_TC342`) |
| 3 | pre-stacco 7.999.33 | finestra sulla coda della costruzione (anche il tratto del volo del cross); **stacco balistico** `H(1−(r/L)²)`, `L=√(2H/g)`: la testa arriva all'apice con il pallone; la clip entra con lo stacco (prima si corre con la corsa: montata 0,59 s prima, i piedi pattinavano 1,3-1,6 u) |
| 4 | posa del colpo di testa | **discesa balistica** nello stesso tempo L; tuffo che resta alla quota del suo stacco (mai sopra il pallone) |
| 5 | rilascio a fine clip | la clip di testa finita **non si ri-arma** nella stessa scena |
| 6 | vita del gesto | **atterrato, si riparte**: se l'eroe si muove (>1,5 u/s) il gesto si chiude all'atterraggio e la corsa rientra in 0,1 s |
| 7 | esultanza | il cronometro dell'esultanza resta a zero finché il colpo di testa (o il suo pre-stacco) è vivo, e non spegne il gesto |
| 8 | secondo palo | la torsione verso il palo lontano gira a velocità umana (≤ 5 rad/s) |
| 9 | costruzione | l'ultimo tratto prima di un colpo di testa porta il pallone alla quota del colpo senza la «gobba» di 0,35 (il pallone non passa sopra la testa per poi scendere sotto) |
| 10 | attesa TESTA146 | al lancio, col pallone già entro 0,9 u, il colpo parte dalla fronte (0,22 u): su gi108 una scrittura non identificata abbassava il pallone di 0,35 u nel fotogramma dell'armo |
| 11 | tuffo | stacco minimo 0,08 (con 0 il corpo non si staccava mai e i piedi pattinavano 1,5-1,7 u sotto la clip) |
| 12 | montaggio e attesa | la fase della clip tiene conto dell'avanzamento del mixer nel fotogramma del montaggio, e fra la fine della costruzione e la partenza del colpo la clip resta sulla frustata (MISURATO al passo 0,05 s: frustata 0,10-0,13 s prima del contatto) |
| 13 | lancio | l'origine del colpo si appoggia dove sarà la fronte nel fotogramma dopo (il primo fotogramma dell'arco scrive il pallone sull'origine mentre l'eroe in volo avanza ancora di 0,17 u a 20 fps) |

Le clip con licenza nel repo le ho profilate tutte e quattro (`header` 1,54 s, `mx-header-soccerball` 1,93 s,
`mx-header-soccerball-2` 4,20 s, `mx-header-stand` 2,40 s): **nessuna ha uno stacco vero né un tuffo** (bacino fermo a 1,02, piedi
che si alzano al massimo di 0,12 u). Resta `header` (frustata più netta: 1,42 u/s contro 1,18 e 1,03), la sola cambiata è la sua
fase. Lo stacco e il volo restano procedurali (`hero.position.y`).

## 4. Dopo (correzioni 1-8): 56 giudicate, 9 fuori soglia (+2 non giudicate)

| tipo | esec. | testa-pallone med/max | frustata↔pallone med/max (s) | scala clip | scatto testa max | piedi che pattinano max | caduta max | fuori soglia |
|---|---|---|---|---|---|---|---|---|
| cross | 22 | 0,14 / 0,35 | 0,04 / 0,04 | 1,34× | 12,5 u/s | 0,15 u | 2,6 u/s | 2 (gi41 non giudicata) |
| angolo | 4 | 0,11 / 0,13 | 0,03 / 0,03 | 1,34× | 11,8 | 0,08 | 2,5 | 0 |
| tuffo | 2 | **0,29** / 0,29 ¹ | 0,03 / 0,03 | 1,34× | 9,7 | 0,10 | 1,5 | 0 ¹ |
| difensivo | 8 | 0,46 / 0,87 | 0,04 / 0,17 | 1,34× | 11,2 | 0,12 | 2,4 | 5 |
| sponda | 12 | 0,15 / 0,43 | 0,03 / 0,04 | 1,34× | 14,3 | 0,15 | 2,5 | 1 |
| rimbalzo | 8 | 0,11 / 0,87 | 0,03 / 0,38 | 1,34× | 10,1 | 0,04 | 2,4 | 1 |
| lancio | 2 | 0,11 / 0,12 | 0,03 / 0,03 | 1,34× | 9,9 | 0,03 | 2,4 | 0 |

¹ il censimento intero è stato preso prima dell'ultima correzione (tuffo a 0,47/0,49); la riga è la rimisura di gi171 riuscita e
fallita dopo la correzione 4 (0,29 e 0,29).

Residui fuori soglia, dichiarati e **non** nel guardiano:
- **difensivi falliti** (gi36, gi44, gi134: 0,84-0,86 u, frustata 0,09-0,17 s prima): è l'esito «l'attaccante vince il duello», il
  pallone non arriva alla testa. Coerente col racconto; la frustata un po' in anticipo resta.
- **gi36 riuscito** (0,87 u): l'arco difensivo parte mentre il pallone sta ancora arrivando (1,35 → 0,87 u negli ultimi 0,04 s);
  gi44 e gi134 riusciti, stessa famiglia, sono a 0,15-0,26 u. Da indagare nell'armo dell'arco difensivo.
- **gi53 «Di testa al volo» (rimbalzo, riuscito)**: niente costruzione aerea, quindi niente pre-stacco; il pallone arriva basso (1,2)
  e di lato, la clip è montata dall'azione e la frustata cade 0,38 s prima.
- **gi108 fallito**: scatto 14,3 u/s contro 14 (una volta su due esecuzioni).
- **gi126 fallito**: 0,46 contro 0,45.

Dopo le correzioni 9-11 (rimisura sulle scene interessate, GLB acceso, passo 1/60): gi108 spizzata 0,30 / 0,32 u (era 0,39-0,47),
gi171 tuffo 0,23 / 0,23 u (piedi 0,11-0,17 u), gi44 difensivo 0,19 / 0,23 u. Il censimento intero (58 esecuzioni, ~35 min) è
stato preso prima delle correzioni 9-13 e non l'ho ripetuto: la tabella qui sopra è quella; le 11 scene del guardiano sono
misurate sul commit finale nel giro (§5, §7).

## 5. Guardiano `npm run testa-342`

Riga della MAPPA esistente per `src/12-|src/13-` (ci-runner.mjs). Undici scene riuscite, almeno una per tipo: gi7 · gi86 · gi90 (cross),
gi6 · gi76 (angolo), gi171 (tuffo), gi44 · gi134 (difensivo), gi108 (sponda), gi48 (rimbalzo), gi52 (lancio).
- **verde**: tutte e undici dentro tutte le soglie; una non giudicata = rosso.
- **rosso** (`CPM_ROSSO=__CPM_NO_G342`): il guardiano è valido solo se almeno 3 scene cadono su misura (le non giudicate non contano).
  Base attesa dalla misura di §2: tutte fuori soglia sulla frustata (0,11 s) e sugli scatti.

Misurato nel giro sul commit finale (814c9e3); colonne: testa-pallone u · frustata↔pallone s · peso · scatto u/s · piedi u.

| scena | tipo | verde | rosso (`__CPM_NO_G342`) |
|---|---|---|---|
| gi6 | angolo | 0,11 · 0,01 · 0,97 · 9,9 · 0,05 | nessuna clip di testa al contatto · peso 0,64 · scatto 50,2 |
| gi7 | cross | 0,12 · 0,01 · 0,97 · 10,0 · 0,04 | frustata −0,11 · scatto 26,8 |
| gi86 | cross | 0,18 · 0,01 · 0,97 · 9,7 · 0,05 | frustata −0,11 · scatto 22,7 |
| gi90 | cross | 0,11 · 0,01 · 0,97 · 10,2 · 0,05 | frustata −0,11 · scatto 22,3 |
| gi76 | angolo | 0,17 · 0,01 · 0,97 · 9,8 · 0,05 | nessuna clip al contatto · scatto 30,8 |
| gi171 | tuffo | 0,22 · 0,01 · 0,92 · 9,6 · 0,18 | testa-pallone 0,85 · scatto 64,8 |
| gi44 | difensivo | 0,20 · 0,00 · 0,96 · 8,1 · 0,12 | frustata −0,57 |
| gi134 | difensivo | 0,21 · 0,00 · 0,96 · 8,1 · 0,12 | frustata −0,57 |
| gi108 | sponda | 0,14 · 0,01 · 0,97 · 11,8 · 0,05 | nessuna clip al contatto · scatto 33,4 |
| gi48 | rimbalzo | 0,09 · 0,01 · 0,97 · 9,8 · 0,09 | frustata −0,11 · scatto 20,8 |
| gi52 | lancio | 0,10 · 0,01 · 0,97 · 9,8 · 0,05 | frustata −0,11 |

**Verde 11/11 dentro le soglie, rosso 11/11 fuori.** Nella prima corsa del giro il guardiano aveva bocciato il verde (tuffo con i piedi
che pattinavano 1,5-1,7 u e gi108 a 0,46 u): da lì le correzioni 9-11.

## 6. Dubbi per il PO

**A. Lo stacco vero.** Nessuna clip del repo salta: lo stacco è il corpo intero sollevato dal codice (0,25-0,9 u, quota del cross)
con la clip «da fermo» sopra. Sincronizzato e balistico, ma le gambe non spingono.
1. **(consigliata)** Tenere così e chiedere una clip di **stacco in corsa** (Mixamo «Header» in salto, o simile con licenza): si
   aggancia con lo stesso `_TC342` misurato sul suo profilo.
2. Aggiungere una piega procedurale di ginocchia nello stacco e nell'atterraggio sopra la clip (rischio: piedi che entrano nel prato).
3. Ridurre lo stacco al minimo (0,25) per tutti: meno «galleggiamento», meno spettacolo.

**B. Il tuffo di testa.** Ora resta basso e il pallone arriva alla testa (0,29 u), ma non c'è un corpo che si allunga in avanti.
1. **(consigliata)** Clip di tuffo di testa vera (con licenza), poi la stessa sincronia.
2. Inclinare in avanti il busto del corpo GLB con una posa additiva (come la guardia del portiere, 7.166).
3. Togliere la variante «tuffo» e lasciare il colpo di testa in corsa.

**C. L'esultanza dopo un gol di testa.** Ora parte quando il colpo di testa è finito (fino a 0,6 s dopo il contatto).
1. **(consigliata)** Così: prima il gesto, poi la festa.
2. Aspettare anche che il pallone sia in rete (più naturale, ma più lungo sulle scene con l'arco lento).
3. Lasciare la partenza immediata di prima (era la gara tempo reale/scena).

**D. Le scene senza costruzione aerea** (rimbalzo gi53, sponde dirette): il colpo di testa si monta all'esito, senza stacco.
1. **(consigliata)** Estendere il pre-stacco all'attesa del pallone (TESTA146), con la stessa fase della clip.
2. Lasciare com'è (frustata in anticipo di 0,38 s su gi53).
3. Togliere il colpo di testa da quelle scene e lasciare la volée.

**F. I telefoni lenti (20 fps).** Al passo di 0,05 s la frustata è a tempo ma il pallone parte a 0,47-0,53 u dalla fronte su 5 scene
su 11 (il corpo in volo avanza di 0,17 u a fotogramma).
1. **(consigliata)** Misura sul telefono del PO con il taccuino (fotogrammi al secondo veri) prima di intervenire.
2. Frenare l'avanzamento orizzontale dell'eroe nei due fotogrammi attorno al contatto.
3. Allargare il guardiano al passo nativo con una soglia propria per i 20 fps (decisione del PO: le soglie non le abbasso io).

**E. gi41** («Colpo di testa normale», scena `special`): non produce il testimone in nessun braccio. Non ho capito perché in questo
giro: da guardare a parte.

## 7. Esecuzioni e tre orologi

- `node ci-runner.mjs giro testa-342 salti-274 gesture-window gk-dive-sync` (+ 17 sentinelle), commit 1057814: **20/20 verdi**.
  Ripetuto sul commit finale 814c9e3 (correzioni 12-13): **20/20 verdi**, con `gesture-window` **instabile** (verde alla seconda
  prova; il primo rosso era «il passaggio corto non scala con la distanza», cioè la famiglia del passaggio, non il colpo di testa:
  vite del colpo di testa 1,19 · 1,19 · 1,19 nella stessa corsa). Nella corsa sul 1057814 era verde alla prima.
- **Passo 1/60 s** (telefono a 60 fps, «al rallentatore» sul banco): è il passo del guardiano. Verde 11/11, rosso 11/11 fuori.
- **Velocità reale** (`--passo=reale`): sul banco il tempo di scena segue quello vero a **3-4 fotogrammi al secondo** (0,26-0,30 s a
  fotogramma, 15-20 fotogrammi per scena). Verde 0/11 e rosso fuori allo stesso modo (gi7 2,38 u, gi86 2,17 u col rosso; 1,1-2,4 u col
  verde): con fotogrammi da 0,3 s il contatto non cade in nessun fotogramma. **A questa cadenza la grandezza non si misura**: non posso
  confermare il comportamento a velocità reale dal banco.
- **Passo nativo** (`--passo=nativo`, morsetto del gioco 0,05 s a fotogramma = telefono a 20 fps): è qui che il banco ha trovato la
  causa 12. Prima della 12: 0/11 dentro (frustata 0,10-0,13 s prima del contatto su tutte). Dopo 12-13: frustata 0,00-0,02 s su tutte,
  **6/11 dentro**; restano fuori sulla sola distanza testa-pallone gi6 0,53 · gi7 0,50 · gi52 0,47 · gi90 0,52 · gi108 0,50 u (soglia
  0,45, non toccata). Residuo dichiarato per i telefoni lenti: il pallone parte mezzo metro davanti alla fronte.
- `data-coherence`: non eseguito — `deriveHL` non è toccato.

## 8. File

- `src/12-three-match-view.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto, check-src identico)
- `tests/visual/testa-342.mjs` (sonda e guardiano), `misura-clip-342.mjs` (profilo delle clip), `leggi-342.cjs` (lettura fotogramma
  per fotogramma di un dump), `costruzione-342.mjs` (tratti della costruzione per scena)
- `tests/visual/package.json` (`testa-342`), `tests/visual/ci-runner.mjs` (riga della MAPPA `src/12-|src/13-`)
- `docs/sviluppo/giro342/`: `censimento-prima.json`, `censimento-dopo.json`, provini `provino-gi7.jpg` (cross), `provino-gi44.jpg`
  (difensivo), `provino-gi171.jpg` (tuffo) — riga in alto prima, riga in basso dopo; colonne −0,45 · −0,25 · −0,10 · 0 · +0,12 · +0,30 s
  dal contatto. ⚠️ A questa inquadratura l'eroe è piccolo: i provini mostrano la scena, la misura sta nei numeri.
