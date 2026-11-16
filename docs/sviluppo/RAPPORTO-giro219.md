# Rapporto giro 219 — PO-484 («a volte l'evento post tocco è un po' ritardato e sembra che non ho premuto»)

Ramo `sviluppo/giro219-tocco3d`, partito da `lavoro/196`. `GAME_VERSION` non toccata (nel file vale `7.999.195`; la consegna
parla di 7.999.196: segnalo la differenza, non la correggo). Rosso unico del giro: `window.__CPM_NO_G219`.

Punto di partenza: `RAPPORTO-giro213.md`, dubbi 1-3 — nelle scene 3D il tocco aspettava il filo principale: «Salta festeggiamenti»
2,6-3,1 s prima di essere elaborato, «Salta ingresso» 0,5-1,1 s.

---

## 1. Lo strumento

`tests/visual/profilo-219.mjs` (`npm run profilo-219`), sonda che non giudica. Percorso vero (carriera → «Gioca la partita» →
ingresso → partita → cerimonia provocata con `__CPM_FORCE_CEREMONY`), **corpi 3D accesi**, notte, attesa dei corpi come in
produzione (`__CPM_T196ON`). Una **pagina nuova per scena**. Per ogni scena:

- **fotogrammi**: intervalli fra `requestAnimationFrame` (mediana, p90, massimo);
- **compiti lunghi** (>50 ms, `PerformanceObserver 'longtask'`): quanti, durata totale, il più lungo;
- **profilo CPU** (CDP `Profiler`, un campione ogni millisecondo): tempo per categoria (riposo · nativo · disegno three · ossa e
  animazioni · gioco · React · GC), e **per ogni compito lungo ≥150 ms che cosa c'era dentro** (orologi sincronizzati con una
  funzione-marca);
- **contatori GL** (programmi compilati, texture caricate per dimensione, chiamate di disegno), **programmi shader nuovi** nati
  durante la scena, memoria JS all'inizio e alla fine;
- **il tocco su «Salta»** (strumento del giro 213) e **il profilo del salto** (che cosa gira fra il tocco e la scena chiusa).

Banchi: telefono emulato 375×667 (`isMobile`+`hasTouch`, dpr 2, tocco vero via CDP, **CPU ×4**) e PC 1366×768 senza freno.
`tests/visual/alloc-219.mjs`: profilo delle **allocazioni** dal clic su «Gioca» alla fine dell'ingresso (chi produce la memoria che
il GC deve poi raccogliere).

Quattro difetti **dello strumento** trovati e corretti prima di fidarmi dei numeri (nessuno era del gioco):

1. **Gli scarti di Babel.** La pagina di prova traduce il JSX nel browser e lascia ~1,1 GB di scarti (memoria JS a 1.165-1.484 MB
   prima ancora di aprire la partita, 350-450 dopo la raccolta). La loro raccolta — **una pausa unica di 2,7-3,6 s a CPU ×4** —
   cadeva dentro una scena a caso e sembrava un difetto del gioco. Ora la sonda forza la raccolta prima di misurare. Il gioco
   costruito per il negozio non ha Babel (JSX precompilato). **Non posso confermare** se la versione web aperta dal telefono paga
   la stessa pausa: va misurato sul dispositivo (vedi Dubbi, 2).
2. **L'attesa dei corpi.** Senza `__CPM_T196ON` la pagina di prova non mostra il velo «i giocatori si preparano…» che in produzione
   copre la costruzione dei 66 corpi: i primi numeri dell'ingresso misuravano un blocco di 5,7 s che il giocatore non vede a scena
   aperta. Ora l'ingresso si misura da quando si **vede**.
3. **La cerimonia provocata troppo presto** (corpi ancora in costruzione) finiva dentro lo stesso blocco: ora si aspetta la partita a
   regime.
4. **Il freno CPU** si mette a scena aperta, non durante il caricamento.

## 2. La misura «prima» (braccio rosso `__CPM_NO_G219` = gioco com'era)

File: `docs/sviluppo/giro219/profilo-prima-tel.json`, `profilo-prima-pc.json`.

### 2.1 Dove va il tempo del filo principale

| scena (telefono ×4) | fotogramma med / p90 | compiti lunghi (n · totale · max) | riposo | nativo | disegno three | ossa+anim. | gioco | GC |
|---|---|---|---|---|---|---|---|---|
| ingresso | 717 / 2350 ms | 29 · 3,1 s · 212 ms | 20% | 35% | 17% | 5% | 20% | 2% |
| highlight | 400 / 3500 ms | 26 · 2,9 s · 573 ms | 15% | 42% | 11% | 6% | 19% | 5% |
| festa | 1033 / 2500 ms | 18 · 3,7 s · **1865 ms** | 13% | 35% | 9% | 2% | **35%** | 4% |
| premiazione | 1133 / 3167 ms | 21 · 3,7 s · **1846 ms** | 22% | 29% | 9% | 1% | **34%** | 3% |

| scena (PC) | fotogramma med / p90 | compiti lunghi | riposo | nativo | disegno three | gioco |
|---|---|---|---|---|---|---|
| ingresso | 1233 / 1667 ms | 2 · 0,1 s · 58 ms | **79%** | 9% | 4% | 6% |
| highlight | 550 / 683 ms | 0 | **72%** | 13% | 4% | 8% |
| festa | 600 / 2417 ms | 4 · 2,6 s · **2394 ms** | 32% | 13% | 4% | **46%** |
| premiazione | 850 / 2550 ms | 3 · 2,7 s · **2559 ms** | 29% | 13% | 5% | **49%** |

React non supera mai il 2%. «Nativo» è il lavoro del browser fuori dal JavaScript (comandi alla scheda grafica, composizione).

**Fatto 1 — sul banco il fotogramma lo fa la scheda grafica software, non il JavaScript.** Su PC in ingresso e highlight il filo
principale è a riposo per il 72-79% del tempo eppure un fotogramma dura 0,55-1,2 s: il disegno (SwiftShader, senza GPU) è il collo.
Conseguenza misurata passo per passo (traccia con gli istanti di tocco, clic, fotogrammi): **quando arriva un tocco ci sono fino a
due fotogrammi 3D già in volo**, e il primo fotogramma che può mostrare il tasto premuto arriva 1,0-1,4 s dopo, qualunque cosa faccia
il gioco. Sul telefono vero questo tempo è la durata reale di un fotogramma (non misurata qui).

**Fatto 2 — che cosa c'era dentro i compiti lunghi** (profilo, telefono ×4):

| dove | compito | che cosa |
|---|---|---|
| festa e premiazione, primi secondi | 0,5-1,8 s | **compilazione shader a scena aperta** (`getProgramParameter`): due programmi che usa solo il **mister** della cerimonia (`actor-presenter.glb`, colori per vertice), scaricato, letto (250-650 ms) e compilato **dopo** l'inizio della scena |
| festa, premiazione, highlight, ogni 5 s | 168 ms (fino a 1,2-1,8 s quando trova i programmi del mister) | **ricompilazione periodica** `renderer.compile` del caricatore lento, anche quando nulla è cambiato |
| tutte le scene, 4 volte al secondo | dentro la voce «gioco», che sul telefono pesava il 19-35% del filo principale (dopo: 5-10%) | il **caricatore lento delle texture** attraversava l'intera scena elencando tutte le proprietà di ogni materiale |
| montaggio dei corpi (sotto il velo) | 3,1-4,5 s **per due** (PC, senza freno) | il **fotogramma di prova** compilava i programmi con la codifica d'uscita sbagliata (lineare, lo schermo è sRGB): **28 programmi su 58** avevano la codifica lineare; con la correzione i programmi in scena scendono a 33 (**25 in meno**). La durata del fotogramma di prova dopo la correzione non l'ho rimisurata |
| clic su «Salta» (festa, premiazione) | **1,0-1,3 s** (telefono) · **1,7-2,5 s** (PC) | lo **smontaggio della scena dentro il clic**: `forceContextLoss` 0,8-1,1 s (telefono) / 1,6-2,4 s (PC) + rilascio di geometrie/materiali |

**Fatto 3 — le allocazioni** (`alloc-219`, dal clic su «Gioca» alla fine dell'ingresso, 1.281 MB campionati): **417 MB** dal
caricatore lento delle texture (un vettore per oggetto e l'elenco delle proprietà di ogni materiale, quattro volte al secondo),
190 MB dalla mappa delle maglie (una volta, sotto il velo), 82 MB dalle chiavi della ricompilazione periodica.

### 2.2 Il tocco su «Salta» (ms dal tocco; strumento del giro 213)

| scena | banco | tocco elaborato dopo | riscontro | rotellina | scena chiusa |
|---|---|---|---|---|---|
| ingresso | telefono | 1395 | 1519 | 4003 | **5699** |
| festa | telefono | 633 | 724 | — | **3265** |
| premiazione | telefono | 1437 | 2123 | 3255 | **4295** |
| ingresso | PC | — | 1398 | 1398 | **3822** |
| festa | PC | 25 | 49 | 555 | **2254** |
| premiazione | PC | 25 | 875 | 875 | **3343** |

Differenza telefono/PC: su PC il tocco è elaborato in 25-45 ms (il filo principale è libero) e tutto il ritardo è nei fotogrammi e
nello smontaggio; sul telefono emulato il tocco aspetta 0,6-1,7 s prima ancora di arrivare alla pagina.

## 3. Le correzioni (rosso `window.__CPM_NO_G219`)

Nulla di visibile è stato tolto: notte, ingressi, coreografie, guardalinee, mister, fuochi restano come sono.

1. **Il tocco passa prima del disegno 3D** (`src/19` strato del tocco + `src/12` ciclo della partita). Al `pointerdown` su un tasto lo
   strato dichiara `window.__CPM_TOCCO219`; il ciclo 3D **cede un fotogramma** — e tutti i fotogrammi finché l'azione non è partita,
   sui tasti a lavoro misurato (`data-pesante213`: «Salta») — cioè non lavora e non disegna: il fotogramma porta a schermo solo il
   tasto premuto, la rotellina e la schermata nuova. Il limite è in **fotogrammi**, non in tempo (la prima stesura aveva un limite di
   450/900 ms: sul banco, dove un fotogramma dura più di un secondo, non cedeva mai — misurato e corretto). In più, dove il browser lo
   offre (`navigator.scheduling.isInputPending`), il ciclo cede se un tocco è già in coda all'inizio del fotogramma o subito prima del
   disegno (al massimo due volte di fila). Escluso il pad: lì la risposta al tocco **è** la scena.
2. **Lo smontaggio della scena esce dal clic.** Al clic su «Salta» si fermano ciclo e caricatore e si stacca la tela; i tre lavori
   pesanti (rilascio della scena · rilascio dei modelli in cache · perdita del contesto grafico) partono dopo, **uno per volta**, e
   aspettano se c'è un tocco in corso. Se una partita nuova si monta prima, li chiude lei come prima cosa.
3. **Il fotogramma che chiude l'ingresso non si disegna**: «Salta ingresso» cambia fase subito, senza aspettare un disegno della scena
   che sta per sparire.
4. **Il mister della cerimonia si prepara prima**: `actor-presenter.glb` parte coi corpi al montaggio, una copia nascosta entra in
   scena e viene compilata (e le sue texture caricate) **sotto il velo dell'attesa**; il fotogramma di prova la aspetta al massimo
   2,5 s. Festa e premiazione non compilano più nulla a scena aperta.
5. **Il fotogramma di prova usa la codifica dello schermo** (sRGB): i programmi shader in scena passano da 53-63 a 28-35.
6. **Il caricatore lento delle texture non alloca più**: legge solo le caselle di un materiale che possono contenere una texture
   (verificato sulla scena vera, vedi §6 `caselle-219`), e la **ricompilazione ogni 5 s parte solo se la firma dei materiali in scena
   è cambiata**. Durante un tocco salta il giro.
7. **Un buco dello strato del giro 213, trovato misurando**: nelle scene lente il tasto veniva premuto e **rilasciato a tempo (120 ms)
   prima che un fotogramma lo disegnasse** — si vedeva solo la rotellina. Ora il rilascio aspetta che il tasto premuto sia stato
   disegnato almeno una volta (con un numero per pressione: due pressioni dentro lo stesso fotogramma lento non si disturbano).

## 4. La misura «dopo»

File: `profilo-dopo-tel.json`, `profilo-dopo-pc.json` (stessa sonda, versione finale del ramo).

### 4.1 Filo principale

| scena (telefono ×4) | compiti lunghi prima → dopo (n · totale · max) | tempo bloccato prima → dopo | «gioco» prima → dopo | riposo prima → dopo | programmi shader in scena |
|---|---|---|---|---|---|
| ingresso | 29 · 3,1 s · 212 ms → **9 · 1,5 s · 239 ms** | 20,8% → **13,0%** | 20% → 6% | 20% → 34% | 58 → 33 |
| highlight | 26 · 2,9 s · 573 ms → **14 · 1,7 s · 263 ms** | 19,2% → **13,3%** | 19% → 10% | 15% → 23% | 58 → 34 |
| festa | 18 · 3,7 s · 1865 ms → **5 · 0,8 s · 366 ms** | 34,6% → **7,1%** | 35% → 6% | 13% → 39% | 57 (+2 a scena aperta) → 33 (+0) |
| premiazione | 21 · 3,7 s · 1846 ms → **4 · 0,8 s · 340 ms** | 31,3% → **7,3%** | 34% → 5% | 22% → 40% | 58 (+2) → 33 (+0) |

| scena (PC) | compiti lunghi prima → dopo | tempo bloccato prima → dopo |
|---|---|---|
| ingresso | 2 · 0,1 s · 58 ms → 0 | 0,3% → 0% |
| highlight | 0 → 1 · 67 ms | 0% → 0,4% |
| festa | 4 · 2,6 s · 2394 ms → **2 · 0,16 s · 94 ms** | 42,1% → **1,1%** |
| premiazione | 3 · 2,7 s · 2559 ms → **2 · 0,13 s · 77 ms** | 45,2% → **0,6%** |

La durata del fotogramma sul banco **non cambia** (telefono 350-2200 ms, PC 600-1250 ms prima e dopo): la fa la scheda grafica
software, e nulla di ciò che si disegna è stato tolto. Quello che cambia è quanto il filo principale resta libero di rispondere.

### 4.2 Il tocco su «Salta» (ms dal tocco, una corsa per riga; le ripetute sono nel §5)

| scena | banco | scena chiusa prima → dopo |
|---|---|---|
| festa | PC | 2254 → **562** |
| premiazione | PC | 3343 → **630** |
| ingresso | PC | 3822 → 2857 |
| festa | telefono | 3265 → **2318** |
| premiazione | telefono | 4295 → **2178** |
| ingresso | telefono | 5699 → 4385 |

Dentro il salto: lo smontaggio (prima 1,0-1,3 s sul telefono e 1,7-2,5 s su PC **dentro il clic**) ora parte ~0,35 s dopo la
chiusura, in due compiti da 0,18 e 0,36-0,38 s (telefono ×4): la perdita del contesto è scesa da 0,8-1,1 s a 0,36-0,37 s perché non
ha più un fotogramma 3D da aspettare.

Sull'**ingresso** il guadagno di tempo è piccolo e dentro il rumore del banco (vedi §5 e Dubbi, 1): lì il clic non smonta nulla e il
tempo è quello dei fotogrammi già in volo.

Effetto collaterale misurato: `tocco-213` (stesso guardiano, stesse soglie) è passato da ~23 minuti (rapporto 213) a 8. Non ho
isolato quale delle correzioni lo spiega: lo riporto come osservazione, non come risultato.

## 5. Guardiano `tocco3d-219` (nuovo)

`npm run tocco3d-219` — percorso vero, corpi 3D accesi; telefono (2 corse per scena, **tutte** devono passare) e PC (1 corsa); poi
il braccio rosso. Per ingresso, premiazione e festa, un tocco vero su «Salta»:

- **G1** riscontro del giro 213 (tasto illuminato/schiacciato) nel **primo fotogramma** dopo l'elaborazione del tocco, e rotellina;
- **G2** dal tocco alla scena chiusa ≤ tetto dichiarato: telefono **6,0 s** (ingresso) · **5,0 s** (premiazione, festa); PC **4,0 s** ·
  **3,0 s**;
- **G3** nessun compito del filo principale più lungo di **600 ms** (telefono) / **250 ms** (PC) fra il tocco e la scena chiusa;
- **G4** dal clic **elaborato** alla scena chiusa ≤ **900 ms** (cerimonie, telefono) · **1,8 s** (cerimonie, PC) · ingresso: tetto
  largo (3,0 s telefono, 4,0 s PC);
- **G5** nessun errore di pagina, la scena si chiude, lo smontaggio rimandato arriva in fondo;
- **G6** «i tasti passano prima del disegno»: fra il clic elaborato e la scena chiusa **zero** chiamate di disegno 3D (contate sui
  prototipi WebGL) e il ciclo ha ceduto almeno un fotogramma.

Esito (`docs/sviluppo/giro219/controlli/tocco3d-219.txt` e `tocco3d-219-finale.json`, 10 minuti, corsa sulla versione definitiva):
**verde 9/9, rosso bocciato 6/6.**

| scena · banco | verde: scena chiusa (dal tocco) | verde: dal clic | verde: compito più lungo | rosso: scena chiusa | rosso: dal clic | rosso: compito più lungo | rosso: disegni fra clic e chiusura |
|---|---|---|---|---|---|---|---|
| ingresso · telefono | 2775 · 2138 | 657 · 673 | 237 · 159 | 4631 | 1537 | 176 | 1042 |
| premiazione · telefono | 2517 · 2027 | 516 · 372 | 174 · 211 | 3749 | 1530 | **1003** | 273 |
| festa · telefono | 1091 · 1774 | 275 · 413 | 136 · 220 | 2866 | 1328 | **755** | 190 |
| ingresso · PC | 914 | 830 | 0 | 2689 | 2575 | 53 | 1835 |
| premiazione · PC | 621 | 490 | 0 | 2939 | 2821 | **1706** | 450 |
| festa · PC | 485 | 379 | 0 | 2987 | 2878 | **1703** | 289 |

Nel verde i disegni 3D fra clic e scena chiusa sono **0** in tutte le nove misure; il riscontro è sempre nel primo fotogramma.

**Che cosa separa davvero i due bracci** (lo dichiaro, perché non è il tempo totale):

- nelle **cerimonie** separano G3 e G4 (più G6): lo smontaggio dentro il clic è un compito da 0,7-2,9 s nel rosso, contro al più
  0,25 s nel verde (fra tutte le corse del giro: 38 misure verdi, 24 rosse);
- nell'**ingresso**, dove il clic non smonta nulla, separa **solo G6**. Il tempo lì è quello dei fotogrammi già in volo: sul telefono
  dal clic 646-1484 ms nel verde (10 misure) contro 1513-1591 nel rosso (5); su PC 830-2709 (7 misure) contro 1232-2663 (5), cioè
  **sovrapposti**.
  Avevo messo una soglia a 1250 ms sul telefono fissata su 4 campioni: alla 7ª misura verde (1484) ha dato un falso rosso. L'ho
  tolta come separatore e messa a tetto largo, e ho aggiunto G6, che è deterministico. Lo scrivo qui perché è una soglia che ho
  cambiato dentro il giro, prima di consegnare.
- **G2** (il tempo massimo dichiarato) è un tetto, non un separatore: sul banco il rosso può starci sotto (rosso festa telefono
  2887 < 5000).

Inserito in `ci-runner.mjs` nelle catene **completa** e **carriera** (una volta ciascuna) e fra i passi lenti; `node --check` verde.

## 6. Controlli (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco letti prima di ognuno)

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** dopo ogni modifica a `src/`.

| controllo | esito | durata |
|---|---|---|
| tocco3d-219 (nuovo) | ✅ verde 9/9, rosso bocciato 6/6 (due corse intere sul guardiano definitivo: entrambe verdi) | 10 min |
| tocco-213 | ✅ verde, rosso bocciato come deve | 8 min |
| fps-249 | ✅ verde e il rosso si vede | 1 min |
| festa-3d | ✅ PASS («Salta» porta alla card, 0 errori di pagina) | 2 min |
| cerimonie | ✅ PASS («il mister c'è sempre») | 1 min |
| cerimonie-192 | ✅ verde, ogni rosso si vede (punti A, B, C, D) | 11 min |
| ingresso-206 | ✅ verde (11 ingressi) e il rosso si vede | 51 min |
| notte-206 | ✅ uscita 0 | 5 min |
| gigante-212 | ✅ verde e il rosso si vede (3 corpi sopra 2,05 m col rosso) | 18 min |
| tpose-196 | ✅ verde (4 scenari) e il rosso si vede | 28 min |
| highlight-95 | ✅ verde (98 highlight, 0 difetti, 0 senza esito) e il rosso si vede | 95 min |
| career-critical | ✅ PASS | 13 min |
| test:logic | ✅ | 3 s |
| save-compat | ✅ 12 pass · 0 fail | 12 s |
| *in più:* caselle-219 (nuova verifica) | ✅ 975-996 materiali, 404-405 texture, **0 fuori dalle caselle** lette dal caricatore, 0 non caricate | 1 min |
| *in più:* memoria-275 (ho toccato lo smontaggio) | ✅ PASS (scene 1 · renderer 2→2 · heap dopo GC 368 MB) | 8 min |

Due corse **non valide**, rifatte intere: `ingresso-206` e `highlight-95` sono stati tagliati la prima volta dal **mio** tetto di 50
minuti nello script di corsa (uscita 124; nel registro di highlight-95 il taglio aveva prodotto un falso «❌ rosso: D1-D4 non si
vede», perché il browser era stato chiuso a metà del braccio rosso). Rilanciati col tetto a 110 minuti: verdi entrambi.

La prima corsa ufficiale di `tocco3d-219` è stata **rossa** (verde 8/9: ingresso telefono, 1484 ms dal clic contro la soglia 1250):
vedi §5, è la soglia che ho tolto come separatore. La corsa valida è la successiva, sul guardiano definitivo.

Foto di altri giri rigenerate dai controlli (9 in `giro196/`, 17 in `giro212/`): rimesse com'erano prima del commit. Due le ho
guardate prima di ripristinarle (premiazione e ingresso su PC, scattate col codice di questo giro): mister, coppa, squadra,
coriandoli e tappeto sono al loro posto.

Dopo i controlli ho corretto **solo il testo di un commento** in `src/12` (un numero: «28 doppioni» → «28 con la codifica lineare,
33 programmi dopo»): ricostruito, IDENTICO BYTE PER BYTE, traspilazione verificata, e `tocco3d-219` rieseguito intero sulla versione
definitiva (è la corsa riportata al §5). Gli altri controlli sono stati eseguiti sulla versione precedente a quel commento.

Non eseguite le catene intere (`completa`/`carriera`/`notte`): solo i controlli della consegna e i due in più.

## Dubbi per il PO

1. **Il banco non è il telefono, e qui pesa più del solito.** Sul banco un fotogramma 3D dura 0,35-2,2 s perché lo disegna il
   processore; quando arriva un tocco ci sono fino a due fotogrammi già in volo e il tasto premuto non può comparire prima. Questo
   tempo non l'ho ridotto e non posso ridurlo senza togliere cose dal disegno. Sul telefono vero un fotogramma dura molto meno, ma
   **non posso confermare quanto**: nessuna misura sul dispositivo. Quello che ho misurato e ridotto è il lavoro del filo principale
   (compiti lunghi, smontaggio dentro il clic, compilazioni a scena aperta), che sul telefono esiste comunque. Se dopo questo giro il
   ritardo si sente ancora sul dispositivo, il cantiere è il costo del disegno delle scene (dubbio 2 del giro 213, ancora aperto).
2. **La pausa da ~3 s della pagina di prova.** La raccolta degli scarti di Babel (2,7-3,6 s a CPU ×4) l'ho tolta dalla misura perché
   il gioco costruito per il negozio non ha Babel. Se il PO gioca la versione web (che traduce il JSX nel browser), quella pausa
   potrebbe esserci davvero, una volta, nei primi minuti: non posso confermarlo dal banco.
3. **Il mister si scarica a ogni partita** (3,4 MB, poi in cache), anche se la partita non finisce con una festa. È il prezzo per non
   scaricarlo e compilarlo a cerimonia aperta. Va bene, o si preferisce prepararlo solo quando la festa diventa probabile (ad esempio
   dal 75' in vantaggio)?
4. **La scena si ferma per un fotogramma a ogni tocco su un tasto** (su un telefono a 30 fotogrammi al secondo: 33 ms), e resta ferma
   finché l'azione non parte sui tasti «Salta». Il pad è escluso. Sul banco non si vede differenza a occhio; sul telefono va guardato.
5. **Lo smontaggio rimandato può cadere sulla schermata di fine gara**: parte ~0,35 s dopo «Salta» e cede il passo a un tocco in
   corso, ma una volta partito l'ultimo passo (perdita del contesto: 0,36-0,37 s a CPU ×4) non si interrompe. Un tocco che arriva in
   quel mezzo secondo aspetta.
6. **Ingresso: il guadagno di tempo non è dimostrato sul banco.** Sul telefono emulato dal clic alla scena chiusa 646-1484 ms nel
   verde (10 misure) contro 1513-1591 nel rosso (5); su PC 830-2709 contro 1232-2663, cioè sovrapposti. Il guardiano lì separa i bracci
   solo col conteggio dei disegni fra clic e chiusura (0 contro 1038-1767), non col tempo.
7. **La costruzione dei corpi sotto il velo d'attesa resta un blocco unico** (`_replaceIntroLineupWithHyper`: 4,6-5,9 s a CPU ×4 per i
   66 corpi, più i fotogrammi di prova). Sotto il velo «Salta ingresso» non è toccabile (il velo sta sopra), quindi non ritarda un
   tocco; ma l'animazione dell'attesa non avanza in quel tempo. Spezzarla fra i fotogrammi è un lavoro a parte: non l'ho fatto.
8. **`isInputPending` non è mai scattato sul banco** (testimone a 0 in tutte le corse): la seconda mano della precedenza (cedere il
   fotogramma se un tocco è già in coda) è scritta ma non provata. Non fa danni; non posso dire che aiuti.
9. **Highlight**: non ha un tasto «Salta», quindi niente misura del tocco; solo il profilo (compiti lunghi 26 → 14 sul telefono). La
   precedenza vale anche lì (scelta della giocata), e `highlight-95` è verde.
10. **Le altre scene 3D** (interviste, presentazione, parata, gala, intro) hanno cicli propri e non leggono la precedenza del tocco:
    fuori dalla consegna, non toccate.
11. **Soglie del guardiano fissate su poche misure** (una ventina verdi e una decina rosse per le cerimonie sul telefono, una
    dozzina e una decina su PC). I margini misurati: compito lungo nelle cerimonie verde ≤ 243 ms / rosso ≥ 736 (soglia 600, telefono), verde 0 / rosso ≥ 1434
    (soglia 250, PC); dal clic nelle cerimonie verde ≤ 608 / rosso ≥ 1072 (soglia 900, telefono), verde ≤ 1104 / rosso ≥ 2002
    (soglia 1800, PC). Se il guardiano si mostra instabile nelle catene, va riparato, non ripetuto.
12. **Rotellina su «Salta» già nel giro 213**: resta. Il riscontro arriva sempre nel primo fotogramma dopo il tocco, ma quel
    fotogramma sul banco è a 0,5-2,5 s dal tocco (vedi 1): i «50 ms» del dubbio 1 del giro 213 restano non misurabili qui.
13. `CLAUDE.md`: ho aggiunto una riga di invariante («il tocco passa prima del disegno 3D»). `GAME_VERSION`, roadmap e storia delle
    release non toccate.
