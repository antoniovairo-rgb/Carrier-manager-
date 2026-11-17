# Rapporto giro 233 — PO-453 «primo avvio leggero»

Ramo `sviluppo/giro233-avvio-leggero`, partito da `lavoro/197` (= 7.999.196 pubblicata). `GAME_VERSION` non toccata.
Data: 17/11/2026. Tutti i numeri vengono dal banco di prova di questa sessione (Chromium senza scheda grafica, telefono
emulato 375×667); dove un numero non è misurato lo dico.

## In breve

- **Prima:** 2,5 s dopo la comparsa del menu partivano da sole **33 richieste per 49,5 MB** di modelli e capelli, senza
  alcun tocco del giocatore.
- **Dopo:** restando sul menu si scaricano **0 modelli**. Fino al menu + 12 s passano 2,6 MB sul filo (la pagina).
- I modelli si chiedono **quando il giocatore entra in gioco** (schermata di creazione, ingresso in carriera, apertura della
  partita), con una **striscia d'avanzamento in cima allo schermo**; se una scena 3D si apre prima che siano arrivati, la
  copre una **schermata d'attesa con la percentuale**.
- **Telefono:** il file del livello più pesante (16,4 MB) non si scarica; la prima partita chiede **23,3 MB** invece di 52,9.
  Su schermo grande 39,6 MB.
- **Capelli:** da PNG a WebP, **9,91 → 0,85 MB**, ritaglio identico pixel per pixel.
- Guardiano nuovo `avvio-233`: verde col verde, rosso col rosso `window.__CPM_NO_G233`.

## 1 · Misura prima di correggere

Strumento: `tests/visual/misura-233.mjs` (nuovo). Legge la rete dal protocollo del browser: indirizzo, byte del file, byte
sul filo, istante, tappa, chi ha fatto la richiesta. Il server di prova comprime i testi (gzip) come fa di solito un sito
statico; **che il sito vero comprima allo stesso modo non posso confermarlo** (stessa riserva del giro 195).

### 1.1 Rete dal primo avvio al menu (rete libera, telefono 375×667)

| | Prima (7.999.196) | Dopo |
|---|---|---|
| Menu visibile dopo | 8,6–9,2 s | 8,6–9,8 s |
| Richieste fino a menu + 12 s | 35 | 2 |
| Byte sul filo | 52,12 MB | 2,61 MB |
| Byte di file | 56,87 MB | 7,37 MB |
| di cui modelli e capelli | 33 richieste, 49,51 MB | 0 |

Composizione dei 49,5 MB di prima (partivano a +11,2 s dalla navigazione, cioè 2,5 s dopo il menu):

| Cosa | File | MB | Chi lo chiedeva |
|---|---|---|---|
| Corpi CGTrader lod0 + lod1 + lod2 | 3 | 27,46 (16,38 + 6,95 + 4,13) | precaricamento all'avvio (PO-237), `src/11` |
| Capelli (4 PNG 2048×2048) | 4 | 9,91 | idem |
| Corpo «regular» + slim + stocky | 3 | 6,28 | idem |
| Clip CGTrader (mixamo, po, po2) | 3 | 3,70 | idem |
| Clip «regular» | 20 | 2,14 | idem |

Il PO nel giro 195 aveva misurato 61 richieste per 52,6 MB: nel mio conto i modelli sono 49,5 MB in 33 richieste; il resto
(pagina, icone, audio dopo il primo tocco) dipende da dove si ferma la finestra. Non ho rifatto la sua misura identica.

### 1.2 Carriera e prima partita 3D (rete libera, salvataggio da professionista)

| Tappa | Prima | Dopo (telefono) | Dopo (PC 1366×768) |
|---|---|---|---|
| Menu, in ozio | 49,53 MB | 0,02 MB (una figurina) | — |
| Ingresso in carriera + apertura partita | 3,43 MB (mister 3,31 + una clip) | 23,25 MB in 32 file | 39,63 MB in 33 file |
| Totale modelli fino alla prima scena | 52,9 MB | 23,3 MB | 39,6 MB |

Dopo, su telefono: corpo «regular» 2,09 · clip «regular» 2,22 · capelli 0,85 · CGTrader lod1 + lod2 11,08 · clip CGTrader
3,70 · mister 3,31. Al primo tocco partono anche 68 file audio per 3,60 MB (giro 149): non li ho toccati.

### 1.3 «I tre livelli di dettaglio servono tutti?» — misurato

Partita vera col pilota automatico, 146 campioni (uno al secondo) di `__CPM_CGTRADER_LOD_AUDIT`:

| Livello | Corpi accesi (media, massimo) | Dove serve |
|---|---|---|
| lod0 (34.995 triangoli, immagini 2048 px, 16,38 MB) | 1,0 · 1 | solo l'eroe |
| lod1 (12.244 triangoli, immagini 1024 px, 6,95 MB) | 0,0 · 0 | in gioco mai; serve ai vicini nell'ingresso in campo, al video iniziale, a presentazione e parata |
| lod2 (4.190 triangoli, immagini 512 px, 4,13 MB) | 22,0 · 22 | tutti gli altri |

Scambi di livello durante la partita: 0. Composizione dei file: nel lod0 **12,28 MB su 16,38 sono immagini PNG**; ciascuno
dei tre file ripete le stesse 33 clip (1,35 MB) e 1,5 MB di descrizione.
Risposta: **in partita ne bastano due**. Su telefono l'eroe è alto 0,07–0,18 dell'immagine (100–240 pixel veri su 1334 a
densità 2): le immagini da 2048 px del lod0 non hanno pixel su cui mostrarsi. Le due foto a confronto sono in
`docs/sviluppo/giro233/lod-alto.png` e `lod-leggero.png`; a occhio non vedo differenza sull'eroe, **ma è un giudizio mio su
due foto, non una misura**: la differenza pixel per pixel fra le due (14,6/255) misura la regia, che non è ferma, e non il
livello — l'ho tolta dalla sonda.

### 1.4 Telefono emulato su 4G lento (1,6 Mbit/s, 150 ms, processore ×4 — i numeri del giro 195)

Primo avvio senza salvataggi, una corsa per braccio. ⚠️ Fatta su una build intermedia di questo giro (prima che la schermata
di creazione chiedesse anche i corpi del provino): il «dopo» definitivo non l'ho rimisurato su 4G lento.

| | Prima | Dopo |
|---|---|---|
| Menu visibile dopo | 46,9 s | 50,4 s |
| Video iniziale: corpi veri | mai arrivati nella finestra osservata | 47 s dopo il tocco, con la schermata d'attesa |
| Provino: corpi pronti | non pronti 208 s dopo il tocco | 88,7 s dopo il tocco (sotto il tetto di 120 s) |

- **Il tempo al menu non migliora** (47–50 s, una corsa sola: la differenza fra i due non la considero significativa). È il
  costo della pagina (7,3 MB, 2,6 compressi) e della sua traduzione nel browser col processore ×4; il precaricamento partiva
  dopo il menu e non lo rallentava. Il giro 195 riportava 10,5 s: non so spiegare la differenza (può essere una build
  diversa, per esempio quella precompilata). **Non posso confermarlo.**
- Nel «prima», dopo 208 s la schermata d'attesa non c'era più e i corpi non erano pronti: è compatibile con l'avviso
  «Riprova / Simula», ma non l'ho verificato in quella corsa.

## 2 · Cosa ho cambiato

Tutto dietro `window.__CPM_NO_G233` (rosso = comportamento della 7.999.196).

1. **Niente modelli all'apertura del menu** (`src/11`): il precaricamento all'avvio è spento. Una funzione sola,
   `prepara233(gruppo)`, chiede i modelli con le stesse URL delle scene, sei alla volta:
   - schermata di creazione → corpo del video iniziale (se non ancora visto) e corpi del provino;
   - ingresso in carriera → corpi della partita;
   - schermata del provino e apertura della partita → di nuovo, se non sono già in volo (copre anche «Riprova»).
2. **Avanzamento visibile**: striscia alta 18 px in cima allo schermo, «Scarico i giocatori 3D · NN%», che non prende i
   tocchi; la percentuale non torna mai indietro. Sparisce quando una schermata d'attesa la sostituisce.
3. **Nessuna scena 3D senza corpi**:
   - video iniziale (`src/19`): finché il corpo manca la scena resta al secondo zero sotto la schermata d'attesa, «Salta»
     resta toccabile; i fantocci di ripiego non compaiono più. Se il file fallisce o passano 120 s il video si chiude da
     solo;
   - partita (`src/15`): la schermata d'attesa del giro 196 ora compare nello stesso fotogramma in cui il campo entra in
     vista anche quando si entra in gioco senza l'ingresso in campo (ripresa dopo il background). Il guardiano aveva
     misurato 1 campione col campo in vista e i corpi non pronti;
   - presentazione e parata (`src/16`): schermata d'attesa sopra la scena finché il corpo non c'è.
4. **Livello adatto al dispositivo** (`src/11`, `src/12`): su un dispositivo leggero — lato corto dello schermo ≤ 500 px,
   oppure ≤ 4 GB dichiarati dal browser, oppure «risparmio dati» — il file lod0 non si scarica e l'eroe usa il lod1. Sugli
   altri schermi resta tutto com'era.
5. **Capelli in WebP** (`tools/capelli-233.py`, `assets/hair-colors/webp/`): qualità 90, alfa senza perdita. Verificato
   dallo strumento: alfa identico, differenza media di colore 1,07–1,22 su 255. Stesso disegno, stessa licenza: annotato in
   `docs/governo/CREDITI-fonti.md`. Nessun asset nuovo.
6. **Varianti slim e stocky del corpo «regular»** (4,2 MB): non si scaricano più nel modo CGTrader, dove quel corpo non si
   vede mai (giro 196).

Effetto collaterale misurato: memoria JavaScript in partita su telefono 369 → 313 MB (363 → 310 nella seconda sonda).

Non ho toccato: pacchetto Android (`tools/build-dist.mjs` copia la cartella dei capelli intera, quindi i WebP entrano da
soli, +0,85 MB; i PNG restano), service worker, audio, i file GLB.

## 3 · Guardiano `avvio-233`

`npm run avvio-233` (verde, poi `CPM_PROVA_ROSSO=1`). «Non giudicato» = rosso. Inserito una volta sola nelle catene
`completa` e `carriera` e nelle righe di mappa di `src/12`, `src/15`, `src/1[17]`, `src/18|16|10` (`node --check` pulito,
nessun doppione).

| Misura | Soglia dichiarata | Verde | Rosso `__CPM_NO_G233` |
|---|---|---|---|
| (1) byte sul filo fino a menu + 12 s | ≤ 3,5 MB | 2,61 | 52,12 |
| (1) byte di file | ≤ 8,5 MB | 7,37 | 56,87 |
| (1) modelli chiesti senza toccare nulla | 0 | 0 | 33 richieste, 49,51 MB |
| (2) creazione: striscia d'avanzamento | visibile | 8/8 campioni | 0/8 |
| (2) video iniziale: fantocci | mai | mai | comparsi |
| (2) video iniziale: corpo mancante ⇒ scena coperta | 0 scoperti | 0 su 66 | 104 su 104 |
| (2) percentuale dell'attesa | sale | 2 → 99 | mai vista |
| (3) modelli chiesti restando sul menu | 0 | 0 | 31 |
| (3) campo in vista senza corpi pronti | 0 campioni | 0 su 12 (telefono e PC) | 1 su 13 |
| (3) corpi CGTrader coi capelli | 23, 0 senza | 23, 0 senza | 23, 0 senza |
| (3) telefono: file lod0 | non scaricato | no | scaricato |
| (3) telefono: modelli della partita | ≤ 26 MB | 23,25 | — |
| (3) PC: file lod0 | scaricato | sì | — |

Le soglie stanno sopra il misurato di circa un terzo (3,5 contro 2,6) perché la pagina cresce a ogni giro; il rosso è
venti volte oltre.

## 4 · Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito | Nota |
|---|---|---|
| `avvio-233` verde | verde | build finale |
| `avvio-233` rosso | bocciato, come deve | build finale |
| `licenze-184` verde + prova del rosso | verde · 4/4 rossi visti | build finale (ricostruisce `dist/` e `dist-web/`) |
| `tpose-196` verde, 4 scenari | verde: 0 T-pose, 0 corpi non CGTrader | sulla build **prima** degli ultimi due ritocchi (striscia, «Salta») |
| `tpose-196` verde, 1 scenario | verde | build finale |
| `tpose-196` rosso | rosso atteso visto | build finale |
| `avviso3d-209` | verde 36/36, rosso bocciato | build finale |
| `riserva2d-205` | verde 36/36, rosso bocciato | build finale |
| `ingresso-206` | verde, e il rosso si vede | build finale (circa 50 minuti) |
| `test:logic` · `save-compat` | verde · 12/12 | build finale |
| `tema-unico` · `typing-shortcuts` · `design-system` | verdi | nucleo della mirata |
| `attesa-241` | verde | **guardiano modificato**, vedi dubbio 8 |
| `prima-partita-237` | verde (parsing in partita 164 ms, tetto 200) | **guardiano modificato**, vedi dubbio 8 |
| `intro-292` · `via-ch38-171` · `cerimonie-192` · `scena3d-96` | verdi | mappa della mia parte |
| `presentazione-225` | **rosso alla prima prova, verde alla seconda** | vedi dubbio 9 |

`node tools/check-src.mjs`: IDENTICO BYTE PER BYTE dopo ogni build.

**Non eseguiti.** La mappa mirata per i sei frammenti toccati (`src/11`, `12`, `15`, `16`, `17`, `19`) dà **246 passi**
(elenco in `tests/visual/out/mirata-233.txt`, non committato): `src/19` porta con sé l'intera catena completa. Ho eseguito
i 9 della consegna, il nucleo rapido e i guardiani più vicini al cambio (tabella sopra); **gli altri, fra cui
`career-critical`, `highlight-95`, `validate-situations`, `partita-vera`, non sono stati eseguiti** e restano alla verifica
di rilascio. Non eseguiti nemmeno `tools/validate-dist.mjs`, `glb-pronti-232` e
`tests/character-lab/cgtrader-mixed-lod-benchmark-smoke.mjs` (in questi ultimi due ho solo allargato a `.webp` il filtro
dei capelli).

Incidente da dichiarare: ho lanciato `node ci-runner.mjs mirata lavoro/197` credendo che stampasse soltanto l'elenco; invece
esegue la catena. L'ho fermata dopo circa due minuti; aveva rigenerato due foto del giro 199, rimesse con `git checkout --`.
Lo stesso ho fatto con le foto del giro 196 rigenerate da `tpose-196`. Nessuna è stata committata.

## 5 · Dubbi per il PO

1. **Quando chiedere i modelli.** La voce dice «quando servono». Ho scelto «quando il giocatore entra in gioco»
   (creazione, ingresso in carriera), non «solo all'apertura della partita». Motivo misurato: chiedendoli solo
   all'apertura, la prima partita di ogni sessione aspettava circa 10 s al banco dal tocco ai corpi pronti (contro 1,2 s
   di prima), cioè tornava il difetto di PO-237 e PO-241. Il prezzo: chi apre la carriera solo per guardare scarica
   comunque 23 MB (telefono), in modo visibile. L'alternativa è una riga in meno in `src/18`.
2. **Regola del «dispositivo leggero»** (≤ 500 px, ≤ 4 GB, risparmio dati): l'ho scritta io. Su quei dispositivi l'eroe
   ha un terzo dei triangoli e immagini a metà lato. Va guardata su un telefono vero: le foto del banco non bastano.
   Non c'è un comando nelle Opzioni per forzare il livello pieno.
3. **Schermi grandi:** scaricano ancora tutti e tre i livelli (39,6 MB), anche se in gioco il lod1 non si accende mai.
   Toglierlo cambierebbe i vicini nell'ingresso in campo: non l'ho fatto.
4. **Video iniziale che non si carica:** se il corpo fallisce o passano 120 s il video si chiude da solo e si va al
   provino (si rivede dal menu). Prima comparivano i fantocci dopo 5,5 s. È una scelta mia fra due mali.
5. **Testo e posto dell'avanzamento:** «Scarico i giocatori 3D · NN%» in una striscia in cima; la schermata d'attesa
   riusa «Caricamento dei giocatori» del giro 196. In PO-241 la scritta «caricamento giocatori» non era piaciuta.
6. **I PNG dei capelli restano** nel repo e nel pacchetto (9,9 MB): servono al braccio rosso. Toglierli dal pacchetto
   Android è una modifica al pacchetto che non ho fatto. Senza WebP (browser molto vecchi) non c'è ripiego sul PNG.
7. **Tempo al menu su rete lenta: non migliorato** (47–50 s al banco). Dipende dal peso della pagina, non dai modelli.
8. **Ho cambiato due guardiani esistenti.** `attesa-241` e `prima-partita-237` misuravano il precaricamento durante la
   sosta sulla home, che questa voce spegne: ora la sosta è sulla schermata di creazione. Verdi così; il loro significato
   è cambiato e va approvato.
9. **`presentazione-225` instabile** (rosso «il tifo non si anima», poi verde). Ipotesi **non verificata**: ora i corpi
   della presentazione si caricano quando la scena si apre, e il blocco può cadere dentro i 700 ms in cui il guardiano
   controlla che il tifo si muova. Non ho misurato quanto fosse instabile prima.
10. **Risparmi visti e non fatti** (servirebbe riesportare gli asset): le 33 clip e la descrizione ripetute in ogni file
    di livello (circa 2,9 MB a file); le immagini PNG dentro i GLB (12,3 MB nel solo lod0); il corpo «regular» con le sue
    clip (4,3 MB), che nel modo CGTrader non si vede mai.
11. **Sito vero:** compressione dei testi e comportamento della cache fra una sessione e l'altra (il service worker va
    prima in rete) non li ho potuti misurare da qui.

## 6 · File

- Gioco: `src/11`, `src/12`, `src/15`, `src/16`, `src/17`, `src/18`, `src/19` → `CARRIER-MANAGER-AV.html`.
- Asset: `assets/hair-colors/webp/HEAD_hair_{brown,black,blond,auburn}.webp` (conversione di formato).
- Strumenti: `tools/capelli-233.py`.
- Prove: `tests/visual/avvio-233.mjs` (guardiano), `misura-233.mjs` e `lod-foto-233.mjs` (sonde), `ci-runner.mjs`,
  `package.json`; adeguati `attesa-241.mjs`, `prima-partita-237.mjs`, `glb-pronti-232.mjs`,
  `tests/character-lab/cgtrader-mixed-lod-benchmark-smoke.mjs`.
- Documenti: questo rapporto, `docs/governo/CREDITI-fonti.md`, foto in `docs/sviluppo/giro233/`.
