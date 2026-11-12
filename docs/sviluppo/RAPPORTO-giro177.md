# Rapporto giro 177 — prova pilota sui gesti negli highlight: il rigore (PO-367)

Ramo `sviluppo/giro177-rigore-pilota`, partito da `lavoro/191`. `GAME_VERSION` non toccata, roadmap e registro di stabilità non toccati (li aggiorna chi rilascia). Interruttore rosso: `window.__CPM_NO_G177 = true` (riporta il comportamento di prima). Guardiano: `npm run gesto-177`.

Ogni numero è **misurato** col banco del giro 170b (corpi 3D accesi, tempo virtuale: un fotogramma = 1/60 s di scena, ossa lette a ogni fotogramma), salvo dove scrivo **stima**. Formato: mediana (minimo…massimo).

---

## 1. Tabella per il PO

| Gesto | Cosa si misura | Prima | Dopo | Esito |
|---|---|---|---|---|
| **Rigore** (12 prove prima, 12 dopo: 3 scene × 4 semi) | Quando parte il pallone rispetto al calcio | il pallone parte **0,18 s prima** del calcio (11 fotogrammi, 12 su 12) | il pallone parte **nel fotogramma del calcio**: 0 (0…2) fotogrammi | **Migliorato** |
| | Distanza fra il piede che calcia e il pallone, nel momento in cui il pallone parte | **112 cm** (109…114) | **15 cm** (14,9…15,6); 12 cm guardando dall'alto | **Migliorato** (vedi nota 1) |
| | Piede d'appoggio: quanto scivola sul prato | 16 cm per fotogramma | 2 cm per fotogramma | **Migliorato** |
| | Piede d'appoggio: quanto sta sollevato | punta a 54 cm dal punto più basso | punta a 17 cm | **Migliorato**, resta un residuo (nota 2) |
| | Corsa d'avvicinamento | scivolata di 2,6 m in 0,2 s, slegata dai passi | i passi dell'animazione, 1,6 m, piede a terra fermo | **Migliorato** |
| | Scatti di posa durante rincorsa e calcio | nessuno | nessuno | Uguale |
| | Pallone fermo sul dischetto fino al calcio | sì (0 cm) | sì (0 cm) | Uguale |
| **Punizione** (12 prove prima, 6 dopo) | tutte le grandezze | — | **invariata** | La stessa leva **non si applica** con l'animazione di oggi (§3) |
| **Punizione, versione di prova** (spenta di serie, 6 prove) | Distanza piede–pallone alla partenza | 83 cm | **14 cm** | Solo se il PO sceglie di cambiare animazione (§3, domanda 1) |
| | Piede d'appoggio che scivola | 8 cm per fotogramma | 1 cm per fotogramma | |
| | Pallone fermo fino al calcio | **no**: si sposta di 39 cm (fino a 1,9 m nel caricamento) | sì (0 cm) | |
| **Passaggio corto** (24 prove prima, 12 dopo) | tutte le grandezze | — | **invariato** | La leva **non si applica** così com'è (§3) |

**In una frase:** sul rigore foto e numeri migliorano davvero (tavole in `docs/sviluppo/giro177/`). Su punizione e passaggio corto la stessa correzione **non vale**, e ho misurato il perché: il difetto che il giro 170b aveva letto lì («il pallone parte prima della gamba») non è quello vero.

**Nota 1 — «meno di 15 cm».** La misura in 3D è 15,3 cm in mediana: sul filo della soglia, non sotto in tutte le prove. A 16 m/s il piede percorre 27 cm fra un fotogramma e il successivo: nel fotogramma in cui il pallone parte il piede non può stare, in pianta, a meglio di ±14 cm dal punto voluto, e nell'animazione la punta passa 9 cm sotto il centro del pallone. Il massimo geometrico è circa 17 cm in 3D. Il pallone del gioco ha raggio 22 cm: a 15 cm dal centro la punta è **dentro** il pallone. Il guardiano giudica ≤ 20 cm in 3D e ≤ 15 cm in pianta.

**Nota 2 — piede d'appoggio.** Ho tolto il saltello che sollevava il corpo (fino a 22 cm). Resta che l'animazione del rigore tiene i piedi circa 13 cm più in alto della posa d'attesa (il bacino resta a quota fissa). Non l'ho corretto: è una proprietà di come l'animazione è montata sul corpo, e toccarla riguarda tutti i gesti (domanda 4).

---

## 2. Il rigore: cosa non andava e cosa ho cambiato

### 2.1 Misura «prima» (rifatta, 12 esecuzioni: gi5 az.0, gi58 az.0, gi5 az.1 «cucchiaio», semi 1-4)

Conferma il 170b: picco del piede 11 fotogrammi (183 ms) dopo la partenza del pallone, 12 su 12; distanza minima piede-pallone 100 cm (97…104) nella definizione del 170b.

### 2.2 Le tre cause, lette nel codice (`src/12-three-match-view.jsx`)

1. **Tempo.** Il pallone aspettava un tempo fisso per famiglia (`GESTURE_WIN.pre` = 0,24 s). Il calcio dell'animazione `penalty` cade a 0,35 s (di scena, alla velocità a cui viene riprodotta).
2. **Posizione.** La rincorsa era una curva scritta a mano (da 3,2 a 0,62 unità in 0,22 s), slegata dai passi dell'animazione. Il corpo veniva fermato con il pallone accanto al piede **sinistro** (taratura rimasta dalla vecchia animazione, che calciava di sinistro), mentre `penalty` calcia di **destro**: da qui il metro di distanza.
3. **Quota.** Il saltello pensato per il vecchio corpo disegnato a codice (`hero.position.y = 0,2 × seno`) sollevava anche il corpo 3D.

### 2.3 La correzione (una leva sola, tre usi)

Il gioco ricava un **profilo** dall'animazione stessa, una volta per corpo (`_g177Prof`): su una copia dello scheletro legge le due punte dei piedi in circa 70 istanti. Dal profilo escono:

- **il momento del contatto** (picco di velocità del piede che calcia; la tabella esistente `CONTATTO_CLIP` dava 0,54 della durata, la lettura fine dà 0,50 e si usa solo se sta entro ±0,08 dalla tabella);
- **quanto avanza il corpo** perché il piede a terra resti fermo (invece della curva a mano);
- **dove deve stare il corpo** perché la punta, al contatto, sia sul pallone.

Usi: (a) il caricamento del pallone dura quanto manca al contatto, e a ogni fotogramma il pallone resta fermo finché l'animazione non passa quel punto (tetto di sicurezza 1,5 s: mai un pallone inchiodato); (b) l'eroe aspetta già nel punto di partenza della rincorsa e avanza con i passi dell'animazione; (c) il saltello è spento sul corpo 3D.

Tutto dietro `__CPM_NO_G177`. Con i corpi 3D spenti (è il caso del gate e di quasi tutti i guardiani) il codice nuovo non entra: comportamento identico a prima.

**Un dettaglio trovato per strada.** Quando parte la battuta il corpo si gira verso l'angolo scelto (fino a 10°). Legando la posizione al piede, quel giro spostava il corpo di 40 cm in un fotogramma (misurato alla prima stesura: 49,6 cm). Ora lo scarto si scioglie lungo il primo 60% della rincorsa, in proporzione alla strada fatta: salto al via 4-7 cm per fotogramma (col rosso 13-14, che è la vecchia scivolata).

### 2.4 Cosa cambia per chi guarda

- Il pallone parte 0,11 s (di scena) più tardi di prima: è il tempo in cui la gamba arriva.
- La rincorsa è più corta (1,6 m contro 2,6) e si vede fatta di passi.
- L'eroe aspetta un po' spostato a sinistra del pallone (rincorsa in diagonale, come un destro).

### 2.5 Fuori ambito, dichiarato

- **Serie dei rigori** a fine partita: ha una sua macchina separata (`P.shootout`), non toccata e non misurata.
- **Mancino**: vedi §6.
- **Rilascio del gesto**: a fine animazione il busto gira di 19° in un fotogramma (prima 16°). C'era già; ora cade 0,3 s dopo il calcio invece di 0,75 s, perché il calcio è più avanti nell'animazione. Non l'ho toccato (è la stessa famiglia di difetto della finta, riga 4 della tabella 170b).

---

## 3. Punizione e passaggio corto: la stessa leva non vale, e perché

Ho applicato la stessa correzione a tutti e due, misurato, e **tolto**.

**Cosa ho trovato.** Per le due animazioni corte `kick` (punizione) e `pass` (passaggio), la tabella dei contatti indica il 90% e il 96% della durata. Sul corpo di gioco quel punto è il **rientro** della gamba, non il calcio: la gamba va avanti, raggiunge la massima estensione a circa il 60% e poi torna indietro più veloce di come è andata. Il banco del 170b cercava il picco di velocità senza guardare il verso, e ha preso il rientro.

Con una misura che conta solo la velocità **nel verso in cui parte il pallone** (aggiunta in `lib/gesto-177.mjs`, colonna «spinta»):

| Gesto | Picco di velocità (170b) | Picco della **spinta in avanti** | Lettura corretta |
|---|---|---|---|
| Rigore | +11 fotogrammi | +12 fotogrammi | il pallone parte **prima** del calcio: difetto vero, corretto |
| Punizione | +18 fotogrammi | **−8** fotogrammi (−8…−7), 12 su 12 | il pallone parte **0,13 s dopo** la spinta, a gamba distesa |
| Passaggio corto | +16 fotogrammi | **−8** fotogrammi in mediana | idem |

Quindi su punizione e passaggio corto il pallone **non** parte prima della gamba: parte poco dopo. Legare la partenza al punto della tabella la sposterebbe a gamba già rientrata: l'ho visto sulle prove (la distanza piede-pallone scendeva a 14 cm, ma il piede stava tornando indietro) e l'ho tolto.

**I difetti veri della punizione** (misurati, restano):
- l'animazione è un tocco da fermo: spinta a 3,6 m/s per un pallone che parte a 20 m/s;
- durante il caricamento il pallone **non resta fermo**: viene tirato indietro verso l'eroe (fino a 1,9 m) e la battuta parte da 37-40 cm dal punto;
- l'eroe scivola 2,6 m con i piedi che scorrono 8 cm per fotogramma, perché l'animazione non ha passi;
- il piede d'appoggio è sollevato (saltello, come nel rigore).

**I difetti veri del passaggio corto:** al momento della partenza il piede è a 108 cm dal pallone in mediana (45…251), cioè il pallone non è sul piede; la sincronia è il meno.

**Punizione: una versione di prova, spenta.** Per dare al PO un numero e non solo un parere, ho collegato la leva del rigore all'animazione di tiro in corsa già usata per tiri, cross e lanci («Strike Forward Jog»). Si accende solo con `window.__CPM_SI_PUN177 = true`; di serie è spenta e la punizione è identica a prima (rimisurata: tabella in `giro177/dati/tabelle.md`).

| Punizione (gi13 az.0, gi78 az.0, gi13 az.2 «palla in area») | Oggi (3 prove) | Versione di prova (6 prove, 2 semi) |
|---|---|---|
| Distanza piede–punto di battuta alla partenza | 83 cm (81…83) | **14 cm** (13…14) |
| Picco del piede − partenza | +19 fotogrammi (ma è il rientro) | +4 fotogrammi (come il tiro di oggi) |
| Velocità del piede | 5,7 m/s | 15 m/s |
| Piede d'appoggio: scorrimento | 8 cm per fotogramma | 1 cm per fotogramma |
| Pallone spostato prima della partenza | 39 cm | 0 cm |
| Spostamento massimo del corpo per fotogramma | 8,2 cm | 4,8 cm |

Tavole: `giro177/punizione-prova-{telefono,pc}.jpg` e le due sequenze. Nella riga «prima», al momento in cui il pallone parte, si vede la gamba già distesa in alto oltre il pallone: è il difetto vero descritto sopra. Questa versione **non ha un guardiano**: è una misura, non una consegna. Non so come si comporta con la barriera, col portiere e nelle punizioni «corte»: non provato.

---

## 4. Il guardiano `gesto-177`

`npm run gesto-177` (circa 7 minuti). Banco del 170b copiato nel ramo (`gesti-170b*.mjs`, `lib/gesti-170b.mjs`), misura in `lib/gesto-177.mjs` con le definizioni scritte in testa al file.

- **Verde** (gioco com'è): 3 scene × 2 semi = 6 esecuzioni, tutte valide (una non valida = non giudicato = rosso). Ognuna deve rispettare: sincronia entro ±2 fotogrammi; contatto ≤ 20 cm in 3D e ≤ 15 cm in pianta; caviglia d'appoggio ≤ 20 cm sopra la quota d'attesa e scorrimento ≤ 3 cm per fotogramma; pallone fermo (≤ 15 cm); nessuno scatto (al via: salto ≤ 12 cm e giro ≤ 8°; fino a 20 fotogrammi dopo la partenza: giro ≤ 12° per fotogramma).
- **Rosso** (`__CPM_NO_G177`): 3 esecuzioni, deve ridare il difetto in tutte (≥ 6 fotogrammi **e** ≥ 60 cm), altrimenti «rosso non visto» = rosso.

Ultimo giro sul build consegnato: **verde pulito 6 su 6, rosso visto 3 su 3**.

| | Verde (6) | Rosso (3) |
|---|---|---|
| Sincronia (fotogrammi) | 0 (0…0) | 11 (11…11) |
| Contatto 3D / in pianta (cm) | 15,0 (14,5…15,4) / 11,6 | 109 (106…111) / 109 |
| Caviglia d'appoggio sopra l'attesa (cm) | +16 (11,8…16,2) | +48 (36…51) |
| Scorrimento dell'appoggio (cm per fotogramma) | 2,0 (2,0…2,2) | 16,1 (15,5…16,1) |
| Salto al via (cm) / giro al via | 4,0…6,6 / 1,6…3,5° | 13,2…13,9 / 1,8…1,9° |

**Due soglie fissate dopo la misura, lo dichiaro:** la caviglia (avevo scritto 8 cm prima di misurare; il verde dà 12-16, il rosso 36-51: ho messo 20 e spiegato il residuo in nota 2) e il contatto (≤ 20 cm in 3D invece dei 15 chiesti, per la ragione della nota 1). Se la sessione madre vuole 15 cm secchi in 3D, oggi il guardiano sarebbe rosso su circa metà delle esecuzioni (domanda 3).

Il guardiano **non è agganciato a `ci-runner.mjs`**: non l'ho toccato (domanda 6).

---

## 5. Controlli eseguiti (uno alla volta)

Tutti sul build consegnato (commit `ef8fd2e` per `src/` e il file di gioco; i commit successivi toccano solo prove e documenti). `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**. Memoria e disco letti prima di ogni controllo (15 GB liberi, 28 GB di disco: mai sotto).

| Controllo | Esito | Nota |
|---|---|---|
| `gesto-177` (nuovo) | ✅ verde 6/6, rosso visto 3/3 | §4 |
| `rigore-79` | ✅ | |
| `rigore-139` | ❌ **già rosso sul ramo di partenza** | «non giudicato»: la partita testimone `k1d-11` ha il rigore al 55' e non più dall'89'. Rifatto su `lavoro/191` pulito: stesso esito, stessa riga. Gira a corpi 3D spenti: il codice di questo giro non entra. |
| `rincorsa-144` | ✅ | |
| `doppio-gesto-148` | ❌ **già rosso sul ramo di partenza** | «verde assist: finta=true cambio=false». Rifatto su `lavoro/191` pulito: stesso esito, stesse due righe. |
| `gesti-copertura-96` | ✅ | |
| `scena-motore-147` | ❌ **già rosso sul ramo di partenza** | «zona di partenza senza il punto del motore» (scene «fra le linee»). Rifatto su `lavoro/191` pulito: stesso motivo. Riguarda i generatori delle scene, non il 3D. |
| `highlight-95` (`CPM_D3DIAG=1`) | ✅ verde, e il rosso si vede | 93 minuti |
| `partita-vera` | ✅ 12 bande su 12, partite finite 2/2 | |
| `spalle-146` | ✅ (e i due rossi cadono) | non toccato |
| `gesture-window` | ✅ | |
| `piede-preferito` | ✅ | |
| `scena3d-96`, scene dei rigori (gi5 e gi58, riesce e parata, telefono e PC) | ✅ 8 su 8 | è il controllo che guarda se il portiere si tuffa prima del calcio (D4): col caricamento più lungo resta fermo fino al calcio |
| `gk-dive-sync` | ✅ | riflesso del portiere non toccato |
| `goal-postarc` | ✅ classi A, B, C a zero | |
| `validate-situations` (gate) | ✅ PASS, impronta `00001505`, 0 fallimenti | |
| `scena3d-96`, formato telefono intero | ✅ 16 scene giudicate su 16, 0 errori di pagina | gli altri tre formati non eseguiti |

**Catena mirata di `src/12` (`node ci-runner.mjs mirata origin/lavoro/191`, `CPM_CI_PAR=0`): NON completata** (la sessione era già oltre le sette ore; i giri 148 e 152 si erano dati un tetto di quattro). Sono 68 passi; in sequenza pura, dalle durate nel registro di stabilità, servono più di 10 ore (41 passi con durata nota fanno 6,1 ore, altri 27 non hanno durata registrata e fra questi ci sono le partite vere: `chiusura-99` da sola 23 minuti). L'ho avviata, ha dato **7 verdi su 7** (`test:logic`, `save-compat`, `design-system`, `tema-unico`, `typing-shortcuts`, `career-critical`, `chiusura-99`) e l'ho fermata durante `parata-100` (in corso da 50 minuti: quella corsa non vale). Al suo posto ho eseguito a mano i passi della catena più vicini a ciò che ho toccato (le righe sopra da `scena3d-96` in giù).

**Passi della catena mirata non eseguiti (56):** `parata-100`, `consegna-103`, `colla-103`, `contatto-103`, `carriera3-94`, `assist-298`, `spazio-296`, `panchina-293`, `pc-tablet-292`, `ingresso-285`, `corpi-073`, `ingresso-276`, `stadi-064`, `render-3d-023`, `avvicinamento-61`, `linee-61`, `pallone-278`, `ingresso-277`, `inquadra-273`, `salti-274`, `memoria-275`, `buildup-sync`, `po229-gi38`, `gk-miss-229`, `esiti-218`, `cross-218`, `scene-221`, `fila-227`, `bambini-294`, `bambini-236`, `pressing-143`, `conduci-242`, `ingresso-245`, `giornale-244`, `difesa-220-scena`, `ingresso-camminata-245`, `analisi-217`, `piedi-252`, `rete-252`, `difesa-252`, `rinvio-252`, `portiere-252`, `aereo-252`, `difesa-220-giro31`, `apertura-261`, `parata-258`, `esiti-241`, `camera-252`, `reazione-252`, `spot-266`, `testa-143`, `stadi-071`, `cerimonie`, `passaggio-coppa-137`, `kit-061`, `strisce-corpo`; in più `scena3d-96` è stato eseguito solo sul telefono (16 scene) e sulle scene dei rigori del PC, non nei formati PC intero, tablet verticale e tablet orizzontale. **Prima di promuovere vanno eseguiti.** Il registro `docs/governo/STABILITA.json` non è stato modificato (la catena lo scrive solo alla fine).

Cosa riduce il rischio sui passi non eseguiti, senza sostituirli: il codice nuovo entra **solo** a corpi 3D accesi, nelle scene di rigore dell'eroe; con i corpi spenti (gate e gran parte dei guardiani) non viene eseguito.

---

## 6. Cosa non ho potuto confermare

- **Telefono vero.** Tutto è misurato sulla macchina di prova, a tempo virtuale (un fotogramma = 1/60 s). Su un telefono che va a 30 fotogrammi al secondo il piede percorre 54 cm fra due fotogrammi: la sincronia resta legata al contatto per costruzione, ma la distanza nel fotogramma di partenza può arrivare a ±27 cm in pianta. Non misurato.
- **Partita vera.** Le prove sono scene forzate (gi5, gi58), come nel 170b. Il rigore in partita vera passa dallo stesso codice, ma non l'ho rimisurato lì con le ossa: `rigore-139` (che gioca partite con rigori veri) gira a corpi 3D spenti.
- **Mancino.** Provato con l'interruttore di sonda `__CPM_FORCE_PIEDE31 = 'L'` (animazione specchiata `penalty~m`), 3 esecuzioni, solo braccio verde: sincronia 0 (0…2) fotogrammi, contatto 15,0 cm (14,6…15,1), scorrimento 2,0 cm per fotogramma. Dati in `giro177/dati/rigore-mancino.json`. La misura «caviglia sopra l'attesa» lì non è affidabile (in attesa l'eroe tiene un piede sollevato, e per il mancino è proprio quello d'appoggio): per questo il guardiano resta sul destro.
- **Serie dei rigori** di fine partita: non toccata, non misurata.
- **Rigore sbagliato / parato:** le prove sono tutte con esito «gol». Il gesto dell'eroe non dipende dall'esito, ma non l'ho misurato sugli esiti falliti.
- **Peso sul telefono.** Il profilo si calcola una volta per corpo, la prima volta che l'eroe va sul dischetto (una copia dello scheletro e circa 70 letture dell'animazione). Non ho misurato quanto costa su un telefono lento; cade durante l'attesa, non durante il calcio.
- **Il residuo dei 13 cm** sotto i piedi (nota 2): l'ho dedotto confrontando le quote delle ossa fra attesa e animazione; non so dire quanto si veda a occhio alla distanza di camera del gioco (nelle tavole il piede d'appoggio appare a terra).
- **Quanto spesso si vede un rigore dell'eroe** in una stagione: non misurato in questo giro.

---

## 7. Quanto può portare la stessa tecnica sugli altri gesti (stima)

La tecnica ha tre pezzi separabili: **(T)** partenza del pallone legata al contatto dell'animazione; **(P)** posizione del corpo ricavata dai piedi dell'animazione; **(S)** saltello a codice spento sul corpo 3D. Il profilo è generico: funziona su qualunque animazione che abbia un contatto dichiarato.

| Gesto | Cosa porta | Fiducia | Costo (stima) | Perché |
|---|---|---|---|---|
| **Pallonetto** | Alto | Alta | mezzo giro | Il 170b non aveva confermato la causa del «corpo sollevato 16-37 cm». L'ho trovata nel codice: è lo stesso saltello del rigore (`hero.position.y = 0,38 × seno` per `shot_chip`). Basta **(S)**. Da misurare, non l'ho fatto. |
| **Tiro** (piede d'appoggio 12-26 cm sopra il prato) | Medio | Media | compreso sopra | Stessa famiglia: sollevamenti a codice nelle varianti di tiro. Da misurare variante per variante. |
| **Punizione** | Alto | Alta (misurato in prova, §3) | mezzo giro per finirla (barriera, portiere, foto, guardiano) | Serve la scelta del PO sull'animazione. |
| **Cross** (piede a 19-86 cm dal pallone) | Medio | Media | 1 giro | I tempi sono già buoni. **(P)** si applica se il punto del pallone al contatto è noto; oggi il pallone viene «agganciato» al piede, quindi va deciso chi comanda. |
| **Passaggio corto** | Medio per volta, ma è 1 azione su 4 | Media | 1 giro | Non è un piazzato: il pallone non ha un punto fisso. Serve prima correggere la tabella dei contatti (spinta al 40% circa, non al 96%) e l'aggancio pallone-piede che su quella tabella si regola. Tocca un giro già spedito (143). |
| **Tuffo del portiere** | Alto se riesce | Bassa | 2 giri | Il principio è lo stesso (leggere dall'animazione dove arrivano le mani e quando, e mettere il corpo di conseguenza), ma il portiere ha già tre macchine sue (traslazione, riflesso 148, presa) che non ho toccato né misurato. È il gesto dove la stima è più incerta. |
| **Lancio lungo** | Nullo | — | — | Il difetto è un altro: in 5 prove su 6 il gesto non viene montato. La tecnica non lo tocca. |
| **Finta** | Nullo | — | — | Il difetto è lo scatto in uscita dall'animazione (mezzo giro in un fotogramma). Stessa famiglia del rilascio del rigore (§2.5), tecnica diversa. |

**Lettura d'insieme (stima):** la tecnica rende molto dove c'è un pallone fermo e un'animazione con la sua rincorsa (rigore, punizione) e dove il difetto è il saltello (pallonetto, tiro). Rende poco o nulla dove il difetto è il montaggio del gesto o la sua uscita. Il risultato del rigore **non** si può moltiplicare per il numero dei gesti.

**Una cosa utile per i prossimi giri:** la misura della «spinta» (velocità nel verso del pallone) andrebbe usata al posto del picco di velocità semplice. Con quella, due delle tre righe «codice» del 170b cambiano diagnosi.

---

## 8. Domande per la sessione madre

1. **Punizione:** adottare il tiro in corsa al posto del tocco da fermo (oggi dietro `__CPM_SI_PUN177`, numeri al §3)? Se sì serve un mezzo giro per barriera, portiere, foto e guardiano.
2. **Tabella dei contatti** (`CONTATTO_CLIP`) per `kick` e `pass`: indica il rientro della gamba. Correggerla tocca l'aggancio pallone-piede del giro 143. Giro dedicato?
3. **Soglia del contatto:** 15,3 cm in 3D (12 in pianta). Va bene la definizione del guardiano (≤ 20 in 3D, ≤ 15 in pianta) o si vuole 15 secco in 3D? Nel secondo caso serve spostare il contatto 1-2 fotogrammi dopo il picco (la punta sale verso il centro del pallone), pagando sulla sincronia.
4. **Piedi 13 cm più alti** nell'animazione del rigore rispetto all'attesa: abbassare il corpo durante il gesto? Riguarda come sono montate tutte le animazioni.
5. **Serie dei rigori:** estendere la correzione alla macchina dei rigori di fine partita?
6. **`ci-runner.mjs`:** `gesto-177` va aggiunto alla mappa di `src/12`. Non l'ho fatto per non toccare il file; segnalo che nella `MAPPA` le voci `src/14`, `src/15`, `src/05|09`, `src/1[17]`, `src/18|16|10` compaiono due volte (vale la prima).
7. **Guardiani rossi già sul ramo di partenza** (§5: `rigore-139`, `doppio-gesto-148`, `scena-motore-147`): chi li prende in carico? E **la catena mirata**: i 56 passi non eseguiti vanno girati prima di promuovere (in sequenza pura sono più di 10 ore: si possono far girare a due a due?).
8. **Rilascio del gesto** (busto che gira di 16-19° in un fotogramma a fine animazione): è la stessa famiglia della finta; un giro unico?

---

## 9. File di questo giro

| File | Cosa contiene |
|---|---|
| `src/12-three-match-view.jsx` | la correzione (cercare «giro 177»): `_g177Prof`, `_g177Pre`, attesa dell'arco, posizione nel blocco dei piazzati, saltello |
| `tests/visual/gesto-177.mjs` | guardiano (verde + rosso); con `CPM_SOLO`, `CPM_FLAGS`, `CPM_CASI` fa da banco |
| `tests/visual/lib/gesto-177.mjs` | definizioni e misura; scena con l'attesa registrata |
| `tests/visual/gesto-177-foto.mjs` | fotogrammi prima/dopo |
| `tests/visual/gesto-177-tabella.mjs` | tabelle dai file grezzi del banco |
| `tests/visual/gesti-170b*.mjs`, `lib/gesti-170b.mjs` | banco del 170b, copiato dal ramo di collaudo |
| `docs/sviluppo/giro177/rigore-telefono.jpg`, `rigore-pc.jpg` | prima · contatto · dopo, nei due bracci, scala 2 |
| `docs/sviluppo/giro177/rigore-sequenza-{prima,dopo}-{telefono,pc}.jpg` | 10 fotogrammi attorno al contatto |
| `docs/sviluppo/giro177/dati/` | tabelle complete, ogni esecuzione prima e dopo, esiti del guardiano, punizione di prova |
