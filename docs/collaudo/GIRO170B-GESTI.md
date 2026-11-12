# Giro 170b — I gesti dei giocatori negli highlight 3D (PO-367)

**Solo misura e proposte.** Nessuna modifica a `src/`, `GAME_VERSION` non toccata. Ramo `collaudo/giro170b-gesti-highlight`, partito da `lavoro/191` (build ricomposta: «IDENTICO BYTE PER BYTE»). Questo rapporto guarda **solo i gesti** negli highlight; le scene 3D in generale sono del giro 170.

Ogni numero è marcato **misurato** (banco di questo giro, con file dati) oppure **stimato**. Dove non ho potuto confermare, lo scrivo.

---

## 1. Tabella per il PO

«Codice» = si migliora lavorando sul programma. «Animazione» = manca o è debole il movimento registrato (serve un file nuovo). Il costo è in giri di lavoro ed è una **stima**.

| # | Gesto | Cosa non va (misurato) | Codice o animazione | Impatto | Costo (stima) |
|---|---|---|---|---|---|
| 1 | **Rigore** | Il pallone parte 0,18 s **prima** del calcio; il piede che calcia non arriva mai a meno di 1 metro dal pallone. 6 prove su 6. | **Codice** (l'animazione c'è ed è buona) | Alto: momento più guardato, camera ferma | 1 giro |
| 2 | **Punizione** | Il pallone parte 0,32 s prima del piede; il calcio è un «tocchetto» (6 m/s contro i 16 del tiro) mentre il pallone vola a 20 m/s. 6 su 6. | **Entrambi**: tempi nel codice; animazione corta (0,46 s, senza rincorsa) | Alto | 1 giro (riusando la rincorsa del tiro) |
| 3 | **Passaggio corto** | Il pallone parte 0,27 s prima del movimento della gamba. 10 su 12. | **Codice** (tempi) | Medio per volta, ma è 1 azione su 4 | compreso nel giro del n. 1 |
| 4 | **Finta / cambio di direzione** | A fine finta il corpo fa un **mezzo giro in un solo fotogramma** (da 25° a 177°). 16 prove su 16 in cui c'è la finta. | **Codice** (uscita dall'animazione) | Alto: è uno scatto che si vede | 1 giro |
| 5 | **Tiro al volo** | Il corpo viene **sollevato da terra** di 46-184 cm per portare un calcio «da terra» all'altezza del pallone; in 4 su 6 non c'è un vero gesto al volo. | **Entrambi**: manca un'animazione di tiro al volo laterale; il sollevamento è nel codice | Alto, ma raro (1,6% delle azioni) | 2 giri + animazione nuova |
| 6 | **Pallonetto** | Corpo sollevato di 16-37 cm, piede d'appoggio a 42-55 cm dal prato (si vede l'ombra staccata). 4 su 4. | **Codice** (la causa esatta non l'ho confermata) | Medio, raro (1%) | 1 giro |
| 7 | **Parata / tuffo** | Il tuffo parte sempre (8 su 8), ma le mani arrivano al pallone in 1 prova su 8; in 4 su 8 nessuna parte del portiere arriva a meno di 2,2 metri. | **Codice** (dove si tuffa rispetto al pallone); animazioni: 2 tuffi soli (sinistra/destra) | Alto | 2 giri |
| 8 | **Lancio lungo** | In 5 prove su 6 il pallone parte **senza gesto**, con l'eroe a 1,3-3,5 m. Però nella ripresa fotografica e in partita vera il gesto c'era: montaggio **instabile**. | **Codice** | Medio | 1 giro (prima capire quando succede) |
| 9 | **Tiro (collo, piatto, a giro, di prima)** | Sincronia buona (pallone e piede entro 0,03-0,05 s). Ma è **sempre la stessa animazione**: piatto e collo non si distinguono. Piede d'appoggio 12-26 cm sopra il prato al contatto. | **Animazione** per la varietà; codice a posto sui tempi | Medio: è il 43% delle azioni | animazioni nuove + 1 giro |
| 10 | **Cross** | Tempi buoni. Il piede passa a 19-86 cm dal pallone (metà delle volte oltre 42 cm); in 7 prove su 16 il pallone attraversa il busto. | **Codice** | Medio | 1 giro |
| 11 | **Colpo di testa** | Contatto buono (testa-pallone 5-8 cm). Una sola animazione per tutti i tipi (primo palo, secondo palo, spizzata, tuffo). | **Animazione** (manca il colpo di testa in tuffo) | Medio | animazione nuova + 1 giro |
| 12 | **Contrasto / scivolata** | Scivolata: 4 animazioni, bene; ma in 4 prove su 4 il corpo gira di 29-171° in un fotogramma. «Intercetto» e «blocco col corpo» mostrano un **calcio**. Pressione e richiami: nessun gesto. In partita vera, 3 contrasti su 3 senza alcun gesto. | **Entrambi** | Medio | 2 giri + animazioni |
| 13 | **Esultanza** | Parte in 55 esiti riusciti su 61; i 6 senza sono azioni riuscite che non sono gol (stacco difensivo, punizione-cross, spizzata). 3 animazioni. Già sorvegliata (152). Qualità non rimisurata qui. | **Animazione** per la varietà | Medio | animazioni nuove |
| 14 | **Disappunto** | Parte sempre (14 su 14). Ingresso un po' brusco. | **Codice**, lieve | Basso | mezzo giro |
| 15 | **Fallo cercato (caduta)** | Le animazioni di caduta ci sono e partono (2 su 2), con scatto all'ingresso. | **Codice**, lieve | Basso | mezzo giro |
| 16 | **Controllo palla** | Non misurato: nelle 131 prove e nelle 3 partite l'eroe non l'ha mai eseguito. Manca il controllo di petto. | **Animazione** | Non posso confermarlo | — |
| 17 | **Rinvio del portiere** | Non misurato in questo giro (non è un gesto dell'eroe). Esiste un guardiano sulla velocità del pallone. | — | — | — |

**Prova pilota proposta: il rigore** (dettaglio al §6). È il gesto più guardato, il limite è tutto nel codice, l'animazione è buona: quindi misura in modo pulito quanto porta un giro. La stessa leva dovrebbe muovere anche punizione e passaggio corto, che si rimisurano gratis nello stesso giro (stima, non promessa).

---

## 2. Come ho misurato

**Strumento nuovo, solo in `tests/visual/`** (nessun guardiano toccato, nessun gancio nuovo nel gioco):

- `lib/gesti-170b.mjs` + `gesti-170b.mjs`: scene forzate dal censimento (`tests/character-lab/CENSIMENTO_SCENE.json`), corpi 3D accesi, stesso percorso del banco PO-248/252 (scena-esca → scena → esito forzato → risoluzione).
- **Tempo virtuale.** L'orologio della pagina è quello finto di Playwright e ogni fotogramma del gioco vale 1/60 s di scena (flag già esistente `__CPM_DT60`). La risoluzione di ogni tempo è quindi **16,7 ms**, e non dipende dalla lentezza della macchina di prova.
- **Le ossa.** Il gioco non espone lo scheletro. La sonda aggancia, nella sua pagina, la funzione di Three che aggiorna la scena e legge a ogni fotogramma 17 articolazioni dell'eroe, 11 del portiere avversario, il bacino degli altri corpi e il pallone. Non scrive nulla nello stato del gioco.
- **La partenza del pallone** è presa dal testimone del gioco `__CPM_CONT121` (il fotogramma in cui l'arco parte).
- `gesti-170b-analisi.mjs` (definizioni in testa al file), `gesti-170b-tabelle.mjs`, `gesti-170b-foto.mjs` (fotogrammi chiave), `gesti-170b-partite.mjs` (partite vere).

**Quanto ho misurato:** 131 esecuzioni valide (66 scene × 2 semi; il terzo seme non è stato fatto per tempo), 0 errori di pagina; 15 tavole di fotogrammi; 3 partite intere; 8 parate rimisurate con il portiere indicato dal gioco (`__CPM_GKTL`).

**Limiti, da tenere presenti:**

1. **Scene forzate, non partita vera.** Le 131 prove usano la forzatura di collaudo. Le 3 partite vere servono da controllo, ma sono poche e sulla stessa giornata di calendario.
2. **I due semi danno numeri quasi identici**: i tempi dei gesti sono deterministici, il seme muove solo il bersaglio. La ripetibilità è alta, la varietà di situazioni no.
3. **Il lancio lungo ha dato due esiti diversi** fra banco e ripresa fotografica (stessa scena e seme, passo d'orologio diverso). È l'unico caso trovato; lo segnalo perché dice che almeno quel gesto dipende dal ritmo dei fotogrammi.
4. **Fotogrammi dentro lo «stacco vivo».** Il segnale `__CPM_CUTLIVE` risulta acceso per 0,5-1 s dopo la scelta, ma nelle tavole l'immagine in quei fotogrammi si vede (vedi rigore, «prima»). Gli scatti di posa li ho contati solo fuori da quel segnale: possono essere sottostimati.
5. **La soglia «scatto di posa > 12 cm/fotogramma²» si è rivelata troppo bassa**: la superano anche i calci puliti. Come misura robusta degli scatti uso il **giro del busto in un fotogramma**.
6. **Scala.** 1 unità del gioco ≈ 1,1 m (corpo riportato a 1,80 m, come fa `__CPM_PIEDI`). Il pallone nel gioco ha raggio 0,20 unità (≈ 22 cm), cioè il doppio di uno vero: una distanza piede-centro pallone sotto ~25-30 cm è un tocco.
7. **Telefono vero non provato.** Le tavole «telefono» sono a 412×915, scala 2, sulla macchina di prova.

---

## 3. Inventario dei gesti

### 3.1 Da dove nascono

Il corpo in campo è quello **CGTrader** (scheletro con ossa `pelvis`, `foot_l`, `ball_l`: letto dalla sonda). Le animazioni sono in tre gruppi di file in `assets/`:

- `cgtrader-review-lod{0,1,2}-kit-adapter.glb`: 33 clip nel pacchetto del corpo (letto dai file). Durate utili: `kick` 0,46 s · `pass` 0,46 s · `penalty` 1,21 s · `header` 1,54 s · `volley` 2,21 s · `slide-tackle` 1,42 s · `tackle` 2,21 s · `dribble` 1,38 s · `change-direction` 1,75 s · `receive` 4,00 s · `gk-dive` 3,38 s.
- `cgtrader-clip-mixamo.glb`: 54 clip (fra cui `mx-strike-foward-jog` 1,30 s, 3 scivolate, 10 del portiere, `mx-scissor-kick`, cadute).
- `cgtrader-clip-po.glb` (6) e `cgtrader-clip-po2.glb` (2): esultanze, disappunto, ruleta, attesa in difesa, testa da fermo, controllo di coscia.

I file `assets/anim-*.glb` e `footballer*.glb` **non risultano usati dai gesti degli highlight** (ricerca nel codice: `anim-kick/pass/header.glb` compaiono in una sola riga di `src/12`; `footballer.glb` solo per la panchina).

Nel codice (`src/12-three-match-view.jsx`):

- **Tabella dei gesti** `GESTI` (r. 3352) e `gestoDi`: famiglia + variante → clip + profilo del volo. Colonne presenti: solo `clip` e `prof`. Le colonne «contatto, velocità, piede» sono dichiarate future nel commento e **non esistono**.
- **Finestre del gesto** `GESTURE_WIN` (r. 3285): vita, approccio, clip, caricamento (`pre`) per famiglia.
- **Varianti a sorteggio** `_VAR23` (r. 1462), scelte con `_scegliGesto23` (r. 126) per hash, mai a caso.
- **Tabella del contatto** `CONTATTO_CLIP` (r. 122): in che punto della clip il piede tocca.
- **Gesti degli altri corpi**: `BRAIN_GESTI` (r. 3326) e il canale `_mateFx`.
- **Gesti promessi dal testo ma senza clip**: `GESTI_PROMESSI` in `src/04` (elastico, tunnel, sombrero, rabona, tacco, petto, coscia, velo, comando).
- **Esultanza**: piani in `src/11` (`CELEBRATIONS`, 8 piani, `pickCelebration`), piano costruito in `src/15`, clip `lift` in `src/12`. In `src/16` le clip compaiono solo nel galà.

Correzioni di posa fatte a mano sopra le clip (quelle che un intervento rischia di disfare): spalle `_spalle146` (r. 241) e versione vecchia `_spalle146a`; postura `_corrPostura23`; piedi a terra in cerimonia e sul disappunto (`_piedi77`, giro 073); cadenza del passo; tiro in corsa `_tiro34Prep`; mira del corpo `_mira20`/`_tgt517`; pallone agganciato al piede nella finestra di contatto (r. 5154-5206); attesa del colpo di testa (76/146); riflesso del portiere (148); braccia al cielo solo da fermo (152). **Non ho trovato una correzione dei piedi di tipo «pianta il piede d'appoggio»** sopra le clip: le correzioni dei piedi sono solo di quota e di cadenza.

### 3.2 Gesto per gesto: clip, varietà, frequenza, guardiani

Frequenza «a catalogo» = quota delle 573 azioni dell'eroe nel censimento (**misurato** sul file). Varietà = clip diverse viste nel banco (**misurato**, tabella T4) e previste dal codice.

| Gesto | Clip che suona davvero (misurato) | Clip diverse | Quota a catalogo | Guardiani che lo sorvegliano |
|---|---|---|---|---|
| Tiro di collo | `mx-strike-foward-jog` | 1 (+ specchiata per il mancino) | 25,7% | `rincorsa-144`, `piede-preferito`, `aim-latch`, `gesto-vocabolario`, `gesti-copertura-96` |
| Tiro piatto / a giro | la stessa | 1 | 4,7% | come sopra |
| Tiro di prima | la stessa | 1 | 6,3% | come sopra |
| Tiro al volo | `mx-strike-foward-jog` (4 su 6), `mx-scissor-kick` solo su «rovesciata» (2 su 6) | 2 | 1,6% | `rincorsa-144`, `rovesciata-spalle`, `aerial-contact` |
| Pallonetto | `mx-strike-foward-jog` | 1 | 1,0% | `rincorsa-144` |
| Colpo di testa | `header` | 1 | 5,1% | `testa-146`, `testa-143`, `testa-tempismo`, `testa-76`, `testa-vera-63`, `testa-motore-143` (dichiarato rosso), `gesture-window` |
| Rigore | `penalty` | 1 (+ specchiata) | 1,0% | `piede-preferito`, `gesture-window` (solo il caricamento) |
| Punizione | `kick~m` | 1 (+ specchiata) | 3,7% | nessuno specifico |
| Passaggio corto | `pass~m` | 1 (+ specchiata) | 24,1% | `piede-preferito`, `gesture-window` |
| Passaggio lungo | `mx-strike-foward-jog` quando parte | 1 | 2,8% | `rincorsa-144` |
| Cross | `mx-strike-foward-jog`; il rasoterra arretrato usa `pass~m` | 2 | 7,0% | `piede-cross-p1b2`, `rincorsa-144`, `doppio-gesto-148` |
| Dribbling / finta | `change-direction`, `dribble`, `mx-ruleta` solo se il testo la promette | 3 | 2,1% (più le finte dentro tiri e cross) | `doppio-gesto-148` |
| Controllo palla | `receive`, `mx-receive-thigh` | 2 | non è un'azione a catalogo | nessuno specifico |
| Contrasto | scivolata: `mx-soccer-tackle` ×3 + base; affondo: `kick~m`; pressione e richiamo: nessuna | 4 + 1 | 15,0% | `def-far-gesture`, `corpi-073`, `gesti-scena-p1b` (altri corpi) |
| Parata / tuffo | `gk-dive` (sinistra) e `mx-goalkeeper-diving-save-2` (destra); respinte ×3; prese ×3 | 2 tuffi | in ogni tiro parato | `gk-dive-sync` (tempi, **a corpi 3D spenti**), `gesti-scena-p1b`, `doppio-gesto-148` |
| Rinvio | `gk-goal-kick`, `mx-goalkeeper-drop-kick`, lanci con le mani ×3 | 2 + 3 | fuori dagli highlight dell'eroe | `rinvio-252` (velocità del pallone) |
| Esultanza | `mx-victory-jump`, `mx-fist-pump`, `mx-victory` | 3 clip, 8 piani | dopo ogni gol | `esultanza-braccia`, `esultanza-152` |
| Disappunto | `mx-disappunto` (eroe), `missed-chance` (altri) | 1 | dopo ogni tiro fuori o parato | `corpi-073`; `disappunto-test` citato nel registro clip |
| Fallo cercato | `mx-soccer-trip`, `mx-fallen-idle`, `mx-standing-up` | 1 sequenza | raro | nessuno specifico |
| Postura in ogni gesto | — | — | — | `spalle-146`, `tpose-56`, `frozen-mate` |

Catene: in `guardiani` girano `gesti-copertura-96`, `esultanza-braccia`, `piede-preferito`, `testa-tempismo`; in `grafica` `gesti-scena-p1b`, `piede-cross-p1b2`, `rincorsa-144`, `doppio-gesto-148`, `testa-146`, `movimento-147`; in `completa`/`notte` `testa-143`, `gk-dive-sync`, `corpi-073`. Gli altri non compaiono in `ci-runner.mjs`.

**Cosa nessun guardiano misura oggi** (ed è ciò che ha misurato questo giro): l'istante del contatto piede-pallone per rigore, punizione e passaggio; il giro a scatto del corpo; la quota del corpo sul prato durante il gesto; la distanza mano-pallone del portiere a corpi accesi.

### 3.3 Quante volte per partita e per stagione

**Misurato**, 3 partite intere (salvataggio di collaudo S12, autoplay): **16 highlight dell'eroe, cioè 4, 7 e 5** (media 5,3 a partita). Per famiglia: tiro 8, punizione 3, contrasto 3, lancio lungo 1, rigore 1. Clip viste: tiro `mx-strike-foward-jog` in 7 tiri su 8 (la volée fallita non ha montato alcun calcio), punizione `kick~m` 3 su 3, lancio lungo `mx-strike-foward-jog` 1 su 1, rigore `penalty` 1 su 1, **contrasto: nessuna clip in 3 su 3** (tutti e tre falliti). Dati in `giro170b/dati/partite.json`.

Avvertenza: le tre partite condividono la giornata di calendario e i primi highlight si somigliano; il campione è piccolo. **Non posso confermare** che la media di 5,3 valga per tutta la stagione.

**Stimato** per stagione: con 5 highlight a partita e 30-40 partite (campionato di 26-28 giornate secondo `CLAUDE.md`, più coppe: il numero di partite di coppa non l'ho verificato) si arriva a **150-210 highlight a stagione**. Applicando le quote a catalogo: tiro con la stessa animazione ≈ 60-80 volte, passaggio corto ≈ 35-50, contrasti ≈ 22-32, cross ≈ 10-15, punizione ≈ 5-8, rigore ≈ 2 (senza contare le serie di rigori). Le quote a catalogo non sono le probabilità di partita (dipendono dal ruolo e dal sorteggio delle scene): è una stima larga.

---

## 4. Le misure

Tabelle generate da `gesti-170b-tabelle.mjs` (copia in `giro170b/dati/tabelle.md`; ogni singola esecuzione in `giro170b/dati/analisi.json`). Formato: **mediana (minimo…massimo)**. Tempi negativi = prima della partenza del pallone.

### T1 — Sincronia gesto ↔ pallone

| Gesto | Esec. | Clip alla partenza | Distanza minima arto–pallone, cm | …quando, ms | Picco di velocità dell'arto, ms dalla partenza | Velocità arto, m/s | Velocità pallone, m/s | Corpo–pallone alla partenza, cm | Senza gesto |
|---|---|---|---|---|---|---|---|---|---|
| tiro di collo | 6 | strike ×6 | 17 (10…23) | −33 (−33…−33) | +33 (33…50) | 15,8 | 15,5 | 71 | 0 |
| tiro piatto / a giro | 8 | strike ×8 | 29 (18…58) | −17 (−500…150) | +50 (33…67) | 15,6 | 14,1 | 101 | 0 |
| tiro di prima | 4 | strike ×4 | 16 (14…17) | −17 (−33…−17) | +50 (33…50) | 15,9 | 21,4 | 64 | 0 |
| tiro al volo | 6 | strike ×4, rovesciata ×2 | 52 (26…57) | −17 (−83…400) | +50 (33…233) | 14,0 | 18,8 | 97 | 0 |
| pallonetto | 4 | strike ×4 | 51 (26…59) | −17 (−50…−17) | +67 (33…67) | 15,7 | 31,7 | 83 | 0 |
| colpo di testa | 11 | header ×10 | 7 (5…58) | −33 (−217…33) | −33 (−467…−33) | 3,6 | 5,4 | 18 | 0 |
| **rigore** | 6 | penalty ×6 | **101 (97…103)** | −83 | **+183 (183…183)** | 16,1 | 23,1 | 86 | 0 |
| **punizione** | 6 | kick~m ×6 | 25 (20…28) | +50 (−167…50) | **+317 (300…317)** | **6,0** | 20,4 | 47 | 0 |
| **passaggio corto** | 12 | pass~m ×10 | 36 (14…64) | −117 (−500…233) | **+267 (−500…333)** | **5,2** | 12,0 | 52 | 1 |
| **passaggio lungo** | 6 | nessuna ×5, strike ×1 | 72 (33…76) | −500 | +83 (−50…500) | 16,0 | 10,3 | **306 (128…353)** | **5** |
| cross | 16 | strike ×14, pass~m ×2 | 42 (19…86) | −17 (−250…217) | +33 (33…333) | 15,7 | 10,4 | 76 | 0 |

Lettura:

- **Tiro**: il pallone parte 1-3 fotogrammi dopo il passaggio del piede e 2-3 prima del picco di velocità. È sotto la soglia di percezione: **sincronia buona**. Nel tiro di collo il piede sfiora il pallone (17 cm dal centro, raggio 22).
- **Rigore, punizione, passaggio corto**: il pallone parte molto prima del gesto (tavole `rigore.jpg`, `pass-corto.jpg`, `punizione.jpg`: al «contatto» l'eroe è fermo sui due piedi, 0,2 s dopo il pallone è già lontano e la gamba si muove a vuoto). Causa letta nel codice: il tempo di caricamento del pallone è una **costante per famiglia** (`GESTURE_WIN.pre`: rigore 0,24 s, punizione 0,24, passaggio 0,27; r. 3285 e armo dell'arco a r. 5990), mentre il punto di contatto della clip sta più avanti (`CONTATTO_CLIP`, r. 122: rigore al 54% della clip, `kick` al 90%, `pass` al 96%). Conto: rigore 0,54 × 1,21 s / 1,73 (velocità di riproduzione) = 0,38 s contro 0,24 → 0,14 s di anticipo; punizione 0,90 × 0,46 = 0,41 contro 0,24 → 0,17; passaggio 0,96 × 0,46 = 0,44 contro 0,27 → 0,17. Le misure (0,18 · 0,32 · 0,27 s sul picco di velocità) vanno nello stesso verso. Solo il tiro in corsa calcola il caricamento dalla clip (`_tiro34Arma`), ed è infatti l'unico a tempo.
- **Rigore, in più**: il piede che calcia (il destro) passa a ~1 m dal pallone. L'eroe corre ancora quando il pallone parte (piede d'appoggio che scorre 21 cm per fotogramma, T2) e quando la gamba parte il corpo ha già superato il dischetto.
- **Punizione e passaggio**: la gamba va a 5-6 m/s. Per un passaggio corto è plausibile; per una punizione che fa partire il pallone a 20 m/s no.
- **Lancio lungo**: in 5 su 6 nessuna clip e pallone che parte a 1,3-3,5 m dal corpo (`db` del testimone del gioco, `act` vuoto). Nella ripresa fotografica della stessa scena la clip c'era (`pass-lungo.jpg`) e in partita vera 1 su 1. **Non posso confermare quanto spesso accada al giocatore.**
- **Cross**: tempi come il tiro; la distanza del piede è più larga e variabile.

### T2 — Piedi, quota del corpo, compenetrazioni

| Gesto | Esec. | Piede d'appoggio: scorrimento, cm per fotogramma | Punta del piede d'appoggio, cm dal suolo | Bacino sopra la quota normale, cm | Pallone nel tronco (esec.) | Pallone in coscia/stinco (esec.) | Altro corpo a < 45 cm (esec.) |
|---|---|---|---|---|---|---|---|
| tiro di collo | 6 | 1,5 (1,3…1,6) | 15 (12…26) | −5 | 0 | 2 | 0 |
| tiro piatto / a giro | 8 | 1,8 (1,1…3,0) | 21 (12…24) | −1 | 0 | 0 | 2 |
| tiro di prima | 4 | 1,5 (1,3…1,6) | 15 (13…15) | −5 | 0 | 1 | 0 |
| **tiro al volo** | 6 | 3,1 (1,7…6,2) | **76 (69…282)** | **+55 (46…184)** | 0 | 0 | 1 |
| **pallonetto** | 4 | 1,8 (1,0…1,8) | **55 (42…55)** | **+37 (16…37)** | 0 | 0 | 0 |
| **rigore** | 6 | **20,9 (20,2…21,1)** | 45 (34…47) | +21 | 0 | 0 | 0 |
| punizione | 6 | 8,2 (7,9…8,2) | 27 (26…28) | +16 | 0 | 0 | 0 |
| passaggio corto | 12 | 3,4 (0,8…5,6) | 9 (3…34) | 0 | 0 | 3 | 0 |
| passaggio lungo | 6 | 15,9 (1,5…26,4) | 14 (4…56) | 0 | 0 | 0 | 0 |
| **cross** | 16 | 1,7 (1,4…5,0) | 12 (8…15) | −5 | **7** | 2 | 0 |
| dribbling | 10 | 24,5 (3,9…25,1) | 13 (5…42) | 0 | 0 | 0 | 2 |
| contrasto | 14 | 1,3 (0,3…16,0) | 8 (0…130) | 0 | 0 | 1 | 1 |

Il piede d'appoggio è il piede che non calcia, da 0,10 s prima a 0,05 s dopo la partenza. Per il colpo di testa la riga non ha senso (si salta) e l'ho tolta.

Lettura:

- **Scivolamento del piede d'appoggio nel tiro e nel cross: 1,5-1,8 cm per fotogramma** (≈ 1 m/s), 14-18 cm in tutto sulla finestra. Si vede poco, ma un piede piantato dovrebbe stare a zero. Rigore, passaggio lungo e dribbling hanno valori alti perché l'eroe sta ancora correndo: lì non è pattinamento, è il difetto di tempi già detto.
- **Piede d'appoggio 12-26 cm sopra il prato al contatto del tiro**, col bacino alla quota normale. È costante in tutte le prove di tiro. Può essere l'animazione stessa (saltello) o l'effetto della rimozione della radice dalla clip: **non posso confermare la causa** senza aprire la clip.
- **Tiro al volo e pallonetto: il corpo intero è sollevato** (bacino +16…+184 cm). Nelle tavole `pallonetto.jpg` e `tiro-volo.jpg` l'ombra è staccata dai piedi. Il tiro normale usa la stessa clip senza questo sollevamento, quindi qui la causa è nel codice.
- **Cross: in 7 esecuzioni su 16 il centro del pallone passa dentro il busto.** Non ho isolato in quale momento (prima o dopo il calcio).
- **Corpo-corpo**: 6 esecuzioni su 131 con un altro bacino a meno di 45 cm. Nella tavola `tiro-collo.jpg` (telefono, «contatto») l'eroe è coperto da due avversari sovrapposti.

### T3 — Orientamento e scatti di posa

| Gesto | Esec. | Petto ↔ direzione vera del pallone, gradi | Corpo ↔ bersaglio secondo il gioco, gradi | Giro massimo del busto in un fotogramma, gradi | Esecuzioni con giro > 20° |
|---|---|---|---|---|---|
| tiro di collo | 6 | 3 (1…8) | 18 (10…24) | 17 (5…176) | 2 |
| tiro piatto / a giro | 8 | 26 (4…71) | 17 (10…27) | 17 (9…20) | 1 |
| tiro di prima | 4 | 21 (3…25) | 18 (14…24) | 10 (5…10) | 0 |
| **tiro al volo** | 6 | **114 (6…175)** | **128 (1…155)** | 12 (3…21) | 1 |
| pallonetto | 4 | 6 (5…8) | 12 (10…13) | 14 (7…14) | 0 |
| colpo di testa | 11 | 31 (4…42) | 39 (1…59) | 13 (6…17) | 0 |
| rigore | 6 | 31 (20…38) | 10 (1…16) | 16 (6…16) | 0 |
| punizione | 6 | 24 (3…25) | 4 (3…7) | 2 (1…3) | 0 |
| passaggio corto | 12 | 6 (1…34) | 6 (0…28) | 7 (2…18) | 0 |
| passaggio lungo | 6 | 14 (0…19) | 5 (0…22) | 18 (12…20) | 1 |
| cross | 16 | 14 (2…67) | 3 (0…78) | 15 (6…153) | 4 |
| **dribbling** | 10 | n.g. | n.g. | **39 (16…160)** | **6** |
| contrasto | 14 | n.g. | n.g. | 14 (3…171) | 4 |

Lettura:

- **Orientamento**: tiro di collo, pallonetto e passaggi sono rivolti al bersaglio (3-14°). Il **tiro al volo** è girato di oltre 110° rispetto a dove va il pallone in 4 esecuzioni su 6. Rigore e punizione: 24-31° fra petto e direzione del pallone, mentre il gioco dichiara 4-10° alla radice del corpo: il busto dell'animazione è ruotato rispetto alla radice.
- **Il mezzo giro della finta.** In **16 esecuzioni su 16** in cui suona `change-direction` (dribbling, «dribbling e tiro», «dribbling e cross») il busto gira di almeno 25° in un fotogramma; in 9 su 16 di almeno 90°, fino a 177°. Succede mentre il peso della clip sta scendendo (0,15-0,62), cioè **all'uscita** dalla finta. L'animazione dura 1,75 s e gira il corpo senza che la radice lo sappia: quando la clip sfuma, la posa torna di colpo all'orientamento della radice. Elenco completo in `giro170b/dati/tabelle.md` (T5).
- **Scivolata**: giro di 29-171° in un fotogramma in 4 esecuzioni su 4 (tre clip diverse), vicino alla partenza del pallone.
- La colonna «scatto di posa» resta nei dati ma non la uso per i giudizi (limite 5 del §2).

### Portiere (8 parate rimisurate, `giro170b/dati/portiere.json`)

| Misura | Valore |
|---|---|
| Tuffo montato | 8 su 8 (`dive`) |
| Mano più vicina al pallone | 14 · 69 · 92 · 125 · 242 · 249 · 334 · 378 cm |
| Articolazione qualsiasi più vicina al pallone (11 lette) | 14 · 27 · 61 · 78 · 218 · 249 · 310 · 310 cm |
| Spostamento laterale del bacino dopo il tiro | da 3,3 a 7,9 m |

In 1 parata su 8 la mano arriva al pallone; in 4 su 8 nessuna parte del portiere arriva a meno di 2,2 m, eppure il pallone viene «parato». Nella tavola `parata.jpg` il portiere è a terra mentre il pallone passa ad altezza testa due metri più in là. Avvertenze: esito **forzato** («parato»), e il portiere è visibile alla sonda solo in parte dei fotogrammi (50-141 su ~160). Il guardiano `gk-dive-sync` misura i tempi del tuffo ma gira a corpi 3D spenti; la distanza mano-pallone a corpi accesi non è sorvegliata. **Non posso confermare** la stessa proporzione in partita vera.

### Varietà (T4, sintesi)

Tutti i tiri (collo, piatto, a giro, di prima, pallonetto, 4 volée su 6) suonano **la stessa clip**. In una stagione stimata di 60-80 tiri dell'eroe, il giocatore vede lo stesso movimento 60-80 volte. Colpo di testa: 1 clip per 4 varianti. Scivolata: 3 clip viste (su 4 previste). Esultanza: 2 clip viste (su 3). Finta: 1.

---

## 5. Giudizio per gesto: codice, animazione, proposta, rischio, priorità

Costi in giri: **stime**. Priorità = impatto diviso costo.

| Gesto | CODICE (tempi, sfumature, piedi, orientamento, scelta della clip) | ANIMAZIONE (c'è? è buona?) | Proposta concreta | Rischio di disfare correzioni recenti | Costo | Priorità |
|---|---|---|---|---|---|---|
| Rigore | Tempi sbagliati (caricamento costante) e posizione dell'eroe rispetto al dischetto | C'è ed è buona (rincorsa, 16 m/s) | Caricamento calcolato dal punto di contatto della clip; eroe piazzato perché il piede passi sul dischetto | Basso: tocca `GESTURE_WIN.pre` e l'armo dell'arco; sorvegliare `gesture-window`, `piede-preferito`, `spalle-146` | 1 giro | **1** |
| Punizione | Stesso errore di tempi | Debole: `kick` 0,46 s, nessuna rincorsa, 6 m/s | Stessa leva del rigore **più** riuso della clip di tiro in corsa (come fatto per cross e lancio nel giro 144) | Basso-medio: `rincorsa-144` va esteso, non cambiato | 1 giro | **2** |
| Passaggio corto | Stesso errore di tempi | Adeguata per un tocco corto | Stessa leva del rigore | Basso; attenzione al «passaggio che vola in porta» (regole già scritte) e a `gesture-window` (soglia sul caricamento del passaggio ≥ 0,25: resta rispettata) | compreso | **2** |
| Finta / cambio di direzione | Uscita dalla clip: l'orientamento non viene passato alla radice | C'è 1 clip; mancano elastico, tunnel, doppio passo veri | All'uscita, portare la rotazione finale della clip sulla radice (o sfumare l'orientamento in 0,2 s) | Medio: tocca il doppio gesto 148 e la mira 517; `doppio-gesto-148`, `aim-latch` da rigiocare | 1 giro | **2** |
| Parata / tuffo | Bersaglio del tuffo non legato a dove passa il pallone (misura a corpi accesi) | 2 tuffi (uno per lato), nessuna distinzione alto/basso | Prima un guardiano a corpi accesi sulla distanza mano-pallone; poi scegliere quota e portata del tuffo dal punto d'arrivo | **Alto**: zona del portiere 148, 465, 229; `gk-dive-sync`, `gesti-scena-p1b`, `doppio-gesto-148` | 2 giri | 3 |
| Pallonetto | Corpo sollevato (causa non confermata) | Usa la clip del tiro: accettabile | Trovare chi alza il corpo e toglierlo; il pallonetto resta distinto dal profilo del volo | Basso-medio: zona del tiro caricato 34 e rincorsa 144 | 1 giro | 3 |
| Lancio lungo | Montaggio del gesto instabile | Riusa la clip di tiro: accettabile | Giro di sola misura in partita vera (quante volte parte senza gesto), poi correzione | Medio: rincorsa 144 | 1 giro | 3 |
| Cross | Distanza piede-pallone larga; pallone nel busto in 7 su 16 | Riusa la clip di tiro; rasoterra con `pass` | Stringere l'aggancio del pallone al piede (soglia di `piede-cross-p1b2` oggi a 0,8 unità ≈ 87 cm: molto larga) | Medio: P1-b2 | 1 giro | 3 |
| Tiro al volo | Il corpo viene alzato per raggiungere il pallone; orientamento sbagliato | **Manca** una volée laterale; `volley` (2,21 s) è esclusa dal codice salvo «rovesciata» | Animazione nuova di tiro al volo; nel frattempo non sollevare il corpo | Medio: rovesciata 19/69, volée 62 | 2 giri + file | 4 |
| Tiro (collo, piatto, a giro, di prima) | Tempi a posto. Piede d'appoggio alto 12-26 cm e scorrimento 1,5 cm/fotogramma: da capire se clip o codice | **Manca la varietà**: 1 clip per 4 tipi. Le clip Mixamo di calcio sono state revocate perché toccavano peggio (nota in `_VAR23`) | Animazioni nuove di piatto e di giro, provate col banco di questo giro prima di entrare; a parte, correzione che pianta il piede d'appoggio | Medio-alto: è il gesto più visto e più corretto (34, 144, piede 31, specchio 23) | 1 giro per clip + 1 per il piede | 4 |
| Colpo di testa | Contatto buono | 1 clip; in tuffo assente; `mx-header-stand` sospesa, `mx-header-soccerball` ×2 mai usate | Provare le clip già in casa col banco (contatto testa-pallone); tuffo da cercare | Alto: zona più corretta del gioco (76, 143, 146, 126) | 1-2 giri | 4 |
| Contrasto | Giro a scatto nella scivolata; nessun gesto per pressione, richiamo, corsa di copertura; in partita vera 3 su 3 senza gesto | Scivolata bene (4); **mancano** contrasto in piedi, blocco col corpo, intercetto (oggi un calcio) | Stessa correzione d'uscita della finta; capire perché in partita non monta; animazioni di blocco e intercetto | Medio: corpi 073, difesa 252 | 2 giri + file | 4 |
| Esultanza | Sorvegliata; nel banco parte in 55 esiti riusciti su 61; i 6 senza non sono gol (stacco difensivo ×2, punizione-cross ×2, spizzata, testa sul secondo palo) | 3 clip; mancano scivolata sulle ginocchia, corsa verso la curva (elenco nel registro clip) | Solo animazioni nuove, passando da `_spalle146` e dal guardiano 152 | Medio: esultanza 152, spalle 146 | 1 giro per lotto di clip | 5 |
| Disappunto, caduta | Ingresso brusco | Ci sono | Sfumatura d'ingresso più lunga | Basso: `corpi-073` (stacco) | mezzo giro | 5 |
| Controllo palla | Non misurato | Manca il petto; coscia presente | Prima misurare dove l'eroe controlla davvero | — | — | — |

Regola valida per tutte le animazioni nuove: entrano solo dopo il passaggio dal banco di questo giro (contatto, quota, orientamento) e da `_spalle146`, come chiede l'invariante «spalle uguali in ogni scena».

Licenze: il registro `tests/character-lab/CLIP_REGISTRY.md` riporta la decisione del PO sui file CGTrader e Mixamo. Non l'ho riverificata.

---

## 6. Prova pilota: il rigore

**Perché questo gesto.** È il momento con più attenzione (camera ferma, tutti guardano il piede). Il limite è **tutto nel codice**: l'animazione `penalty` ha rincorsa e una gamba a 16 m/s, uguale al tiro. Quindi il risultato del giro non è sporcato da un'animazione debole, e dice in modo pulito quanto rende un giro di lavoro sul codice. La stessa correzione dovrebbe migliorare anche punizione e passaggio corto: si rimisurano nello stesso giro come effetto collaterale (**stima**). Alternativa se si preferisce la frequenza all'impatto: il passaggio corto (24% delle azioni, stesso difetto).

**Misure «prima», già pronte** (6 esecuzioni: gi5 az.0, gi58 az.0, gi5 az.1 «cucchiaio», 2 semi; tavola `giro170b/rigore.jpg`):

| Grandezza | Prima (misurato) | Riferimento: il tiro oggi | Soglia proposta per il guardiano |
|---|---|---|---|
| Picco di velocità del piede calciante rispetto alla partenza del pallone | **+183 ms** (6 su 6) | +33…+67 ms | **fra −50 e +67 ms** |
| Distanza minima piede calciante–centro pallone in ±0,10 s dalla partenza | **101 cm** (97…103) | 10…58 cm | **≤ 40 cm** |
| Scorrimento del piede d'appoggio in [−0,10 s, +0,05 s] | **20,9 cm per fotogramma** | 1,5 | **≤ 3 cm per fotogramma** |
| Pallone fermo sul dischetto fino alla partenza (per non «barare» spostando il pallone sul piede) | fermo (misurato: 0 cm) | — | **spostamento ≤ 15 cm prima della partenza** |
| Petto ↔ direzione del pallone | 31° (20…38) | 3…26° | solo dichiarato, non giudicato |

**Guardiano proposto** (`rigore-170b`): 2 scene × 2 semi + il cucchiaio, corpi accesi, tempo virtuale (strumento di questo giro, già scritto). Verde: tutte e quattro le soglie su almeno 5 esecuzioni. Braccio rosso: l'interruttore della correzione spento deve ridare +183 ms e ~100 cm. «Non giudicato» = rosso.

**Cosa si tocca (stima, da pianificare nella sessione madre):** il caricamento del pallone in `GESTURE_WIN`/armo dell'arco (calcolarlo dal contatto della clip, come fa già `_tiro34Arma` per il tiro) e la posizione dell'eroe rispetto al dischetto. Da rigiocare: `gesture-window`, `piede-preferito`, `spalle-146`, più il gate.

**Rischi:** la serie di rigori usa lo stesso gesto (non provata qui); il rigore mancino usa la clip specchiata (non provata: l'eroe di prova è destro); la finestra d'esito non deve chiudersi prima del calcio (regola «comanda la scena»).

**Cosa si saprà alla fine del giro pilota:** di quanto si muovono le tre grandezze su rigore, punizione e passaggio corto con un solo giro di codice. È il numero che il PO ha chiesto per decidere quanti giri dedicare ai gesti.

---

## 7. Cosa non ho potuto confermare

- La frequenza reale per stagione (3 partite, stessa giornata).
- Se il lancio lungo senza gesto capita al giocatore, e quanto spesso.
- La causa del piede d'appoggio alto nel tiro (clip o codice) e del corpo sollevato nel pallonetto.
- Le parate in partita vera (qui esito forzato) e la quota dei fotogrammi in cui il portiere non era leggibile.
- Il momento in cui il pallone attraversa il busto nel cross.
- Tutto ciò che riguarda il telefono vero, il mancino, la serie di rigori, il controllo palla, il rinvio.
- La qualità dell'esultanza (già sorvegliata dai guardiani 152 e braccia: non rimisurata).
- Il terzo seme del banco (non eseguito).

---

## 8. File di questo giro

| File | Cosa contiene |
|---|---|
| `docs/collaudo/giro170b/*.jpg` | 15 tavole: prima · contatto · dopo, telefono e PC, scala 2 |
| `docs/collaudo/giro170b/dati/analisi.json` | tutte le misure, esecuzione per esecuzione |
| `docs/collaudo/giro170b/dati/tabelle.md` | le tabelle T1-T5 complete |
| `docs/collaudo/giro170b/dati/partite.json` | le 3 partite vere, azione per azione con le clip |
| `docs/collaudo/giro170b/dati/portiere.json` | le 8 parate |
| `tests/visual/lib/gesti-170b.mjs`, `gesti-170b.mjs` | banco a tempo virtuale |
| `tests/visual/gesti-170b-analisi.mjs`, `-tabelle.mjs`, `-foto.mjs`, `-partite.mjs` | analisi, tabelle, tavole, partite |

Per rifare le misure, da `tests/visual` con `CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`: `node gesti-170b.mjs [gesto]` (circa 40 s a esecuzione, ripartibile), poi `node gesti-170b-analisi.mjs` e `node gesti-170b-tabelle.mjs`. I file grezzi stanno in `tests/visual/out/giro170b/raw/` (non versionati).
