# RAPPORTO giro 295 — il portiere: PO-518 · PO-519 · PO-520 · PO-530

Ramo `sviluppo/giro295-portiere`, partito da `lavoro/198` (b3b75b9, 7.999.198; `GAME_VERSION` non toccata).
Rosso unico del giro: `window.__CPM_NO_G295`. Guardiano nuovo: `npm run portiere-295`. Sonda nuova: `tests/visual/misura-295.mjs`.

Tutti i numeri vengono da strumenti eseguiti in questa sessione (headless, 412×915, corpi GLB accesi dove non dico altro, pagina nuova
per partita o per scena). Dove un numero non l'ho misurato lo dico.

**Nota sulla base di confronto.** La consegna indica «origin/main 3076a1b7 (7.999.196)». `3076a1b7` è il commit di rilascio della 196, ma
oggi `origin/main` è più avanti (41b8b61, già 7.999.198: per `src/` è identico a `lavoro/198`). Ho confrontato con `3076a1b7`, in una
copia separata. Su quella copia e su una copia di `lavoro/198` ho aggiunto **solo il testimone** (nessun cambio di comportamento).

## 1. Come ho misurato

`misura-295.mjs`: partite vere dal salvataggio del collaudo 177 (S5 e S1, come `parata-100`), pilota automatico, regime «gioco»
(`__CPM_PRESENT=1` + `__CPM_REALWAIT`: stacco di scena e congelamento di lettura come li vede il giocatore) e `__CPM_CINE=1` (sotto
`?cpmtest=1` il copione del build-up è spento senza questa bandiera: la prima partita, senza, dava «0 fotogrammi di costruzione»).
A ogni scelta la sonda ferma il pilota per 5 s, poi lo riaccende.

Testimone per fotogramma `__CPM_GK229`, esteso (solo con `__CPM_REC229`): `gn` = quante guide (`animOne`) muovono il portiere avversario
nel fotogramma, con i due bersagli; `tl` = build-up acceso; bersaglio dell'arco; post-arco.

Limite dello strumento: con i GLB accesi la pagina fa circa 2 fotogrammi al secondo e il tempo di scena è tappato a 0,05 s per
fotogramma. 5 s di parete in lettura sono 0,4–2,8 s di scena. I passi del motore che spostano il bersaglio del portiere in lettura
vanno invece a tempo di parete (uno ogni ~0,6 s, al più 8): nelle letture misurate sono stati fatti tutti.

## 2. Tabella «196 / 198 rapida prima / dopo» (partite vere)

| | 196 (3076a1b7) | 198 rapida, prima | 198 + giro 295 (dopo) |
|---|---|---|---|
| partite · scene | 2 (S5 semi 7, 2021) · 14 | 4 (S5 e S1, semi 7 e 2021) · 32 | 4 (le stesse della 198 prima) · 27 |
| **PO-518** scene con costruzione in cui il portiere riceve 2 guide nello stesso fotogramma | **6 su 7** (bersagli a 3,0–3,5 u uno dall'altro) | **11 su 13** (3,0–3,7 u) | **0 su 13** |
| **PO-519** letture in cui il portiere si sposta (strada > 0) | **0 su 14** (strada 0 u) | **0 su 35** (strada 0 u; 27 con copione acceso + 8 senza) | **0 su 27** (strada 0 u) |
| PO-519 a fine lettura: distanza fra il portiere fermo e il suo bersaglio | 0,0–1,5 u, sempre fra i pali | 0,0–2,8 u; 1 volta su 19 il bersaglio è fuori dai pali (z −3,81; palo a 3,35) | 0,0–2,7 u; 1 volta su 27 fuori dai pali (non cambiato: nessun blocco aggiunto) |
| **PO-520** tiri con esito palo | 0 | 0 | 0 |
| **PO-530** parate: minimo pallone–portiere in pianta | 2 parate: 0,38 · 0,22 u | 2 parate: **3,0 u** (S5/7, punizione; 3,19 nella stessa partita rigiocata senza copione) · 0,28 u (S1/7) | 2 parate: **0,36 u** (S5/7, la stessa punizione: bersaglio dell'arco portato da x 42 a x 45,45) · 0,16 u (S1/7) |

Le due partite S5/7 «prima» e «dopo» sono la stessa partita (stesso seme, stesse scene): è il confronto più diretto.

**PO-518.** Confermato nel gioco vero, su tutte e due le versioni: in ogni fotogramma della costruzione il ciclo del portiere lo manda
al punto della logica e il copione (voce `GK` della timeline: `GX+1; GY`) a un punto distante 3,0–3,7 u. Le scene con costruzione ma
senza doppia guida (1 su 7, 2 su 13) sono scene in cui il copione non ha fotogrammi col portiere guidato dal ciclo (non ho indagato oltre).

**PO-519.** Nel gioco vero **non succede**: 49 letture su 49, strada 0,00 u, nessuna guida (`gn` 0). Lo tiene fermo il congelamento di
lettura del 5.49.10 (`_readFreeze`), che sul banco è spento: per questo i giri 265 e 271 lo vedevano scivolare. Quello che succede nel
gioco è un'altra cosa: mentre lui è fermo il suo **bersaglio** si sposta (i passi del motore di scena, `scenaMuovi`, al più 8), e al
rilascio della scelta lui ci va: fino a 2,8 u nelle partite misurate, una volta su 19 verso un punto 0,46 u fuori dal palo.
Secondo la decisione («bloccarlo se succede») **non ho aggiunto nessun blocco**. Vedi dubbio 2.

**PO-520.** In 6 partite vere (46 scene) nessun tiro è finito sul palo: nel gioco vero non ho una misura. Il caso si misura solo
provocandolo (§4, braccio 3): col portiere a 4,62 u di lato dal pallone, sulla 198 prima **0 tuffi su 8**, dopo **8 su 8**.

**PO-530.** Confermato nel gioco vero sulla 198: punizione «parata» di S5/7, portiere a x 45 (logico 95), bersaglio dell'arco a x 42:
il pallone muore a (41,8–42; 3,2–3,3) e il portiere, disteso a (45; 3,3), «para» a 3,0–3,2 u di distanza. Sulla 196 le 2 parate
incontrate avevano il bersaglio dell'arco davanti a un portiere più avanzato e non mostrano il difetto: con 2 parate per versione non
posso dire che la 196 ne fosse priva. Le parate nelle partite vere sono poche (1 ogni 2 partite); la misura larga è quella provocata (§4).

## 3. Che cosa ho cambiato nel gioco

Tutto in `src/12-three-match-view.jsx`, tutto dietro `window.__CPM_NO_G295` (con la bandiera torna com'era).

1. **PO-518 — una guida per fotogramma, quella della logica di gioco.** Il ciclo dei portieri segna il fotogramma in cui ha guidato
   il portiere (`_fr295` / `_gd295`); nel copione del build-up la voce `GK` salta il portiere avversario se in quel fotogramma lo ha
   già guidato il ciclo. Il copione resta l'unica guida solo dove il ciclo non lo guida (portiere in tuffo).
2. **PO-519 — nessuna correzione.** La riga del ciclo che legge `_readFreeze` ora ha un ramo rosso: con `__CPM_NO_G295` il
   congelamento di lettura non vale per il portiere (negli highlight). Serve solo a provare che il guardiano vede la scivolata.
   **Tocco di `_readFreeze`** (giro 293): non ne cambio il valore né la definizione; ho aggiunto una condizione `||` sulla sola riga
   del ciclo dei portieri (`else if(!_readFreeze||(…__CPM_NO_G295&&isHL))`). Senza bandiera il comportamento è identico.
3. **PO-520 — sul palo «sul filo» si tuffa sempre.** In `_portata223`, con esito palo, le tre soglie (lato 4,5 · distanza 5,5 ·
   quota 2,6) si allargano di 0,25 u, la stessa fascia che `_ambiguo223` già chiama «sul filo». Fuori e parata non cambiano.
4. **PO-530 — la parata si chiude al portiere.** Tiro, testa, punizione, rigore con esito parata: se il portiere sta **dietro** il
   bersaglio dell'arco (più di 0,3 u), l'arco si allunga sulla stessa retta fino al suo piano (stessa convenzione del giro 258: mani a
   +0,45 u), z tenuta fra i pali, durata scalata sulla corda, mai oltre la linea di porta. Cross «parato»: l'atterraggio (prima
   fissato fra x 40 e 44,5) arriva a non più di 1 u davanti al portiere. I due tagli esistenti (258 e 119), che valgono col portiere
   **davanti** al bersaglio, restano identici.

Solo per le sonde (`?cpmtest=1`): `__CPM_LAT295` (mette il portiere alla distanza di lato chiesta) e `__CPM_PARX295` (fissa in x il
bersaglio dell'arco della parata); testimone `__CPM_PARATA295` (arco allungato: prima/dopo).

Non ho toccato soglie di guardiani esistenti. Non ho toccato `src/15`.

## 4. Il guardiano `portiere-295`

`tests/visual/portiere-295.mjs`, `npm run portiere-295`; aggiunto alla prima riga della mappa di `src/12` in `ci-runner.mjs` (quella usata).
GLB accesi, pagina nuova per scena, `__CPM_PRESENT=1` e `__CPM_CINE=1`. 16 pagine per colore (8 «palo», 8 «parata»), 2 per volta.
Ogni pagina: forza la scena, tiene aperta la scelta, risolve con l'esito chiesto.

| Braccio | Che cosa giudica | Scene | Provocazione |
|---|---|---|---|
| 1 una guida per fotogramma | nei fotogrammi di `hl_result` col build-up acceso nessun fotogramma con 2 guide | tutte le 16 | nessuna |
| 2 nessuna scivolata durante la scelta | dalla provocazione alla fine della lettura (≥ 0,5 s di scena) il portiere non si sposta più di 0,5 u | le 8 «palo» | passati 0,6 s di scena la sonda sposta il suo bersaglio di 5 u di lato (`__CPM_GKAT119`) |
| 3 tuffo sempre sul filo | il gioco scrive la distanza di lato in `__CPM_G223P`; se la pagina è «sul filo» ci vuole un gesto del portiere | le 8 «palo» | portiere a 4,62 u di lato (`__CPM_LAT295`), bersaglio dell'arco a z 3,5 (`__CPM_GK229GEO`) |
| 4 parata chiusa al portiere | dall'armo dell'arco a fine scena il pallone arriva a ≤ 2 u dal corpo del portiere | le 8 «parata» | portiere arretrato a x 97 (`__CPM_GKAT119`), bersaglio dell'arco a x 43,5 (`__CPM_PARX295`) |

Verde = 0 difetti, 0 non giudicate, ≥ 8 giudicate per braccio. Rosso = difetto rivisto in ≥ 6 scene su ≥ 8. «Non giudicato» = rosso.

@@GUARDIANO@@

Perché le provocazioni (tre tentativi prima di arrivarci, tutti misurati):
- braccio 3: con la sola geometria forzata la distanza di lato cambia di 0,1–0,2 u da una corsa all'altra (gi9: 4,70 poi 4,60 con il
  portiere spostato nel verso opposto) e la fascia di 0,25 u si centrava in 2–3 scene su 10. È lo stesso scarto che ha fatto nascere PO-520.
- braccio 2: senza provocazione il rosso si vedeva in 5 scene su 8 (scarto 1,0–12,1 u; nelle altre 3 il bersaglio non si muove: 0,1–0,4 u).
  Inoltre il gioco chiude la scelta col suo timer d'esitazione (9–16 s di parete): una pagina lenta non arriva a 2,1 s di scena.
- braccio 4: nel rosso il bersaglio dell'arco è sorteggiato a ogni corsa (misurato col portiere a x 47: da 40 a 46,9). Senza fissarlo
  il difetto si vedeva in 6 scene su 8, poi 5 su 8, poi 4 su 8 (minimo pallone–portiere da 0,2 a 5,9 u).

## 5. Controlli

Uno alla volta dentro la catena (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), `npm run <nome>` da `tests/visual`.
Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e `node tools/check-src.mjs`.

@@CONTROLLI@@

## 6. File toccati

- `src/12-three-match-view.jsx` — 4 punti di correzione, ramo rosso sul congelamento del portiere, 2 ganci solo-collaudo, testimone;
  `CARRIER-MANAGER-AV.html` ricomposto (`check-src`: frammenti e file coincidono).
- `tests/visual/portiere-295.mjs`, `tests/visual/misura-295.mjs` (nuovi), `tests/visual/package.json` (script), `tests/visual/ci-runner.mjs`
  (una voce nella prima riga di `src/12`).
- `CLAUDE.md` — invariante «il portiere ha una guida sola, e la parata si chiude a lui».

## Dubbi per il PO

1. **PO-518, «Logica di gioco comanda»: la voce `GK` del copione non viene più eseguita mentre il ciclo guida il portiere.** In quasi
   tutti i copioni quella voce lo teneva fermo a (`GX+1`; `GY`), cioè lo tirava verso il centro porta: ora sta sul punto della logica
   (3,0–3,7 u più in là, misurato). Un solo copione lo MUOVE: «uno contro uno» (`ONE_ON_ONE`: uscita a 6 e poi 8 u dalla linea). Le scene
   «uno contro uno» hanno già l'uscita scritta nella logica (`hlGkOut`, dal 7.248), quindi l'uscita resta; ma **non ho misurato una
   scena «uno contro uno»** prima e dopo (non ne sono capitate nelle partite e non sono fra le scene del guardiano).
2. **PO-519: durante la scelta il portiere non scivola, ma il suo bersaglio sì, e al rilascio lui ci va.** Misurato nel gioco vero:
   a fine lettura il bersaglio è a 0–2,8 u da lui; 1 volta su 19 (prima) e 1 su 27 (dopo) è fuori dai pali di 0,46 u. È il motore di
   scena che sposta i ventidue durante la lettura (al più 8 passi). La decisione dice «bloccarlo se succede» durante la scelta: lì non
   succede e non ho bloccato nulla. Se il PO vuole il portiere fermo anche al rilascio, la strada è tenere fisso il suo bersaglio per
   tutta la scena; ma quel bersaglio è proprio la «logica di gioco» di PO-518. È una scelta sua.
3. **PO-519: le letture misurate sono corte in tempo di scena** (0,4–2,8 s: la pagina con i GLB fa ~2 fotogrammi al secondo). Che il
   portiere resti fermo per tutta la lettura lo dice il codice (il congelamento vale finché dura la lettura) e lo confermano 76 letture
   su 76 con strada 0; non ho una lettura misurata di 10 s di scena.
4. **PO-520: il filo si è spostato, non è sparito.** Ora sul palo il portiere ci prova fino a 4,75 u di lato (prima 4,5). Fra 4,5 e 4,75
   si tuffa sempre (8 su 8); a 4,75 c'è un nuovo filo, dove da una corsa all'altra può di nuovo tuffarsi o no. Ogni soglia ha un filo:
   per toglierlo del tutto servirebbe decidere il gesto prima del sorteggio del punto di partenza del tiro.
5. **PO-520: «si tuffa» può essere il riflesso col corpo.** In una scena d'esplorazione (gi10, 4,62 u di lato) il gesto è stato
   `gk_block` (un passo e opposizione col corpo) e non il tuffo: è la regola del giro 223 quando il tuffo taglierebbe la strada al
   pallone. Il guardiano conta «ci prova» (un gesto qualunque). Nelle 8 scene del guardiano il gesto è sempre il tuffo.
6. **PO-520: nessun palo nelle partite vere** (0 su 46 scene prima, 0 su 27 dopo). La misura è solo quella provocata.
7. **PO-530: poche parate nelle partite vere** (2 per versione). Il difetto è confermato in una (3,0 u → 0,36 u dopo); la misura larga
   è quella provocata (8 scene: verde 0,03–0,52 u, rosso 2,2–5,9 u secondo il sorteggio del bersaglio).
8. **PO-530: col portiere sulla linea il pallone della parata ora arriva fino a 0,45 u oltre il suo centro**, cioè a 0,7 u dalla linea
   di porta (portiere a x 47, linea a 48,6). È la stessa convenzione del giro 258 («mani a +0,45 u»). Non ho guardato le foto del gesto:
   la sonda misura distanze, non l'aspetto.
9. **PO-530, cross «parato»:** l'atterraggio ora sta a 1 u dal portiere anche quando lui è sulla linea (prima fra x 40 e 44,5). Misurato
   in una sola scena di cross (gi165: 0,15–0,22 u). Non ho rimisurato le uscite alte del portiere sui cross col portiere avanzato
   (lì la regola non scatta: vale solo se il portiere è più di 1 u dietro l'atterraggio).
10. **Durata dell'arco allungato.** Tiene la velocità del tiro ma mai sotto 18 u/s di scena: la prima stesura dava un arco di 3,3 s su
    gi63 e `gk-dive-sync` l'ha preso (tuffo finito 0,35 s prima). Corretto e rimisurato (0,98 s). 18 u/s l'ho scelto io guardando le
    durate degli archi del gioco (0,5–1,4 s per 15–30 u): se il PO vuole un altro passo è una costante sola.
11. **Il guardiano usa provocazioni** (bersaglio del portiere spostato in lettura, portiere a 4,62 u di lato, bersaglio dell'arco 3,5 u
    davanti al portiere arretrato) e **una ripetizione dichiarata**: la pagina in cui il timer d'esitazione del gioco chiude la scelta
    prima della sonda si rifà una volta. Succede a macchina carica (visto con 4–5 pagine aperte insieme).
12. **La base di confronto.** `3076a1b7` è la 196, ma `origin/main` oggi è già alla 198. Ho confrontato col commit indicato.
13. **Tocco di `_readFreeze`** (lo stesso del giro 293): una condizione in più sulla riga del ciclo dei portieri, attiva solo col
    rosso. Se il giro 293 cambia quella riga, c'è un conflitto di unione da risolvere a mano.
@@DUBBI2@@
