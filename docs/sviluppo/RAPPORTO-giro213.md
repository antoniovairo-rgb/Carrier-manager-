# Rapporto giro 213 — PO-475 («Quando tocco un pulsante ci deve essere un'animazione tocco»)

Ramo `sviluppo/giro213-tocco`, partito da `lavoro/195`. `GAME_VERSION` non toccata (nel file vale `7.999.194`; la consegna
parla di 7.999.195: segnalo la differenza, non la correggo).

Decisione PO (questionario 15/11): il tasto **si schiaccia** (si abbassa leggermente) e **si illumina subito**; se ciò che segue
richiede tempo, una **rotellina** sul tasto finché l'azione non parte; tutti i pulsanti, in modo uniforme, anche col mouse.

---

## 1. Lo strumento

`tests/visual/lib/tocco-213.mjs` (usato dalla sonda `misura-213.mjs` e dal guardiano `tocco-213.mjs`). Un tocco **vero**:

- telefono 375×667, `isMobile` + `hasTouch` (verificato `matchMedia('(pointer:coarse)')` = vero): `touchStart` → 80 ms →
  `touchEnd` via CDP (`Input.dispatchTouchEvent`);
- PC 1366×768: mouse giù → 80 ms → su.

Tempo zero = `timeStamp` del `pointerdown`. Un anello `requestAnimationFrame` nella pagina legge ogni fotogramma:
**riscontro** (primo fotogramma in cui l'aspetto del tasto — transform, scale, filter, ombra, sfondo, opacità — differisce
da quello a riposo), **effetto** (predicato dell'azione: testo della pagina cambiato, fase della partita cambiata, tasto
staccato), **rotellina**, **layout** (offset del tasto sul fotogramma premuto), **area di tocco** (i punti a 2 px dai quattro
bordi che *a riposo* colpiscono il tasto, letti con `elementFromPoint` sul fotogramma premuto, con una prova sintetica di
ripiego quando l'effetto arriva nello stesso fotogramma). Event Timing dà l'attesa e il lavoro di ogni evento.

Tre difetti dello **strumento** trovati e corretti prima di fidarmi dei numeri (nessuno era del gioco):
1. l'anello della misura precedente continuava a scrivere nella successiva («layout mosso» fasullo) → un gettone per misura;
2. «layout» e «area» erano letti anche nel fotogramma in cui la schermata stava già cambiando → solo sul fotogramma premuto e
   prima dell'effetto;
3. il riquadro di «Vai al prossimo momento» restava aperto e copriva Simula/Vivi → misure separate su pagine nuove.

Viewport meta del gioco: `width=device-width, … user-scalable=no` → **nessun ritardo di 300 ms** del tocco in Chrome
(misurato: `pointerdown`→`click` = durata del tocco, 86–101 ms con dito tenuto 80 ms).

## 2. La misura «prima» (braccio rosso `__CPM_NO_G213` = gioco com'era)

File: `docs/sviluppo/giro213/misura-prima-tel.json`, `misura-prima-pc.json` (registri in `controlli/`). Telefono, ms dal tocco:

| tasto | riscontro | effetto | lavoro sincrono | note |
|---|---|---|---|---|
| scheda Stagione | 144 | 136 | 21 | riscontro DOPO l'effetto |
| scheda Home | 127 | 110 | 12 | idem |
| Vivi la Settimana | 324 | 130 | 4 | idem |
| Vai al prossimo momento | **nessuno** | 111 | 4 | |
| Vai (conferma corsa) | **nessuno** | 113 | 3 | |
| Simula (prompt) | 207 | 207 | 112 | ritardo >100 senza riscontro |
| Gioca la partita | **nessuno** | 218 | 97 | |
| Vedi le formazioni | **nessuno** | 127 | 0 | |
| Ingresso in campo | **nessuno** | **1508** | 0 (+1,3 s di filo bloccato) | candidato rotellina |
| Salta ingresso | 1294 | **1540** | — | candidato rotellina |
| pad (freccia) | nessuno | 512 | 7 | la mossa smonta il pad |
| giocata highlight | **nessuno** | 896 | 23 | |
| Salta festeggiamenti | **nessuno** | **3869** | 753 | candidato rotellina |
| Avanti (rassegna) | **nessuno** | 133 | 6 | |
| Salta (rassegna) | 123 | 123 | 30 | |
| Scegli (offerte) | **nessuno** | 221 | 98 | |

Tre fatti misurati che spiegano il «a volte sembra che non ho premuto»:

1. **Sul telefono il vecchio `:active` è intermittente.** Stesso tasto, corse diverse: «Vai al prossimo momento» 18 ms in una
   corsa, nessun riscontro in un'altra; Simula/Vivi il contrario. Quando c'è, arriva spesso **dopo** che la schermata è già
   cambiata (schede: riscontro 127–144 ms, effetto 110–136 ms).
2. **Il vecchio `:active` restringe l'area di tocco.** `transform:scale(.97)` rimpicciolisce anche la zona che riceve il tocco:
   sui tasti misurabili i punti a 2 px dal bordo uscivano dal tasto («area ristretta», es. «Vai al prossimo momento» 4/4 punti
   persi, PC «Scegli» e «Salta festeggiamenti»). Prova minima `tests/visual/prova-area-213.mjs`: un tasto scalato al
   `pointerdown` perde il tocco a 3 px dal bordo (**0 clic** su telefono e PC); con un'estensione `::before` il clic arriva (1).
   In più sovrascriveva le `transform` di posizione dei tasti che ne hanno una.
3. **Lavoro sincrono dopo il tocco**: Simula 99–136 ms, Gioca 64–108, Scegli 89–124, Salta festeggiamenti 753–977, e
   «Ingresso in campo»/«Salta ingresso» che montano la scena 3D (1,3–2,5 s di filo principale bloccato): in quel tempo la pagina
   non può ridisegnare nulla, quindi nessun riscontro.

Su PC il `:active` del mouse funziona (riscontro 11–30 ms sui tasti 2D), ma senza rotellina e con l'area ristretta.

**Tasti con ritardo >100 ms senza riscontro (telefono):** Vai al prossimo momento, Vai, Simula, Gioca, Vedi le formazioni,
Ingresso in campo, pad, giocata, Salta festeggiamenti, Avanti (rassegna), Scegli; più le schede e Vivi la Settimana, dove il
riscontro arriva dopo l'effetto. **Candidati alla rotellina (>400 ms):** Ingresso in campo, Salta ingresso, Salta
festeggiamenti, giocata e pad (questi due per l'attesa della pagina 3D, vedi §5).

## 3. La correzione (rosso `window.__CPM_NO_G213`)

Un solo strato a livello di documento, `tocco213` in `src/19-app-root.jsx` (prima di `createRoot`), CSS in `src/00-head.html`:

- **`pointerdown` (cattura)**: il tasto (`button`, `[role=button]`, `.cpm-press`, `[data-tocco213]`, non disabilitato) riceve
  `data-premuto213` nello stesso evento → il fotogramma successivo lo disegna **schiacciato** (`scale: .96`, proprietà che si
  compone con le transform esistenti) e **illuminato** (`filter: brightness(1.16) drop-shadow(...)`), senza transizione
  all'andata. Il layout non si muove (`scale` non tocca il flusso).
- **Area di tocco invariata**: un'estensione invisibile `::before` (o `::after`, quello libero; le schede usano già `::before`)
  con `inset:-2.5%` compensa la scala. Dove non si può (entrambi occupati, `overflow` tagliato, figli assoluti che
  cambierebbero ancoraggio, elemento `inline`) il tasto si **illumina soltanto** (modo «n»).
- **Rilascio**: almeno 120 ms dal tocco e mai prima di 80 ms dal sollevamento (sul telefono il clic colpisce il bersaglio dopo il
  `touchend`: l'estensione deve esserci ancora).
- **Rotellina** (`.cpm-rotella213`, elemento fuori dall'albero React, `position:fixed` sul lato destro del tasto, colore del
  testo del tasto, gira sul compositore): compare se l'azione non è «partita» (nessun cambiamento del documento fuori dallo
  strato) entro **300 ms** dal clic (soglia dichiarata, `ROTELLA213`); sparisce quando l'azione parte (tetto 4 s).
- **Lavoro sincrono → prima si ridisegna**: i tasti con `data-pesante213` (misurati: Simula, Gioca la partita, Gioca solo i
  momenti salienti, Scegli delle offerte, Ingresso in campo, Salta l'ingresso ×2 del pre-partita, Salta ingresso in campo, Salta
  premiazione) mostrano la rotellina **subito** e il loro gestore parte dopo il fotogramma (`requestAnimationFrame` →
  `setTimeout 0` → `el.click()`): il tasto si vede premuto e la rotellina continua a girare anche mentre il lavoro tiene
  occupato il filo principale.
- **Nessun doppio tocco**: un secondo clic vero sullo stesso tasto mentre l'azione del primo non è ancora partita viene
  assorbito.
- **Moto ridotto** (`prefers-reduced-motion`): solo luce, niente scala.
- Il vecchio `button:active{transform:scale(.97)}` e `.cpm-press:active`/`.cpm-int:active` restano solo nel rosso.

Foto (telefono 375, dpr 2), `docs/sviluppo/giro213/`: `prima|dopo-vivi-settimana-{riposo,premuto}.png`,
`prima|dopo-vai-al-momento-*.png`, `prima|dopo-simula-*.png`, `dopo-simula-dopo-il-tocco-450ms.png` (rotellina; per
fotografarla la sonda svuota l'azione e arma il gancio di sola prova `__CPM_FOTO213`, letto solo sotto `?cpmtest=1`).
Strumento: `node tests/visual/foto-213.mjs [--rosso]`.

## 4. La misura «dopo»

File `misura-dopo-tel.json` (corsa verde del guardiano), `misura-dopo-pc.json`. Telefono:

| tasto | riscontro | rotellina | effetto |
|---|---|---|---|
| schede, Vivi, Vai, Vai (conferma), Vedi le formazioni, Avanti/Salta rassegna | **18–33 ms** | — | 98–147 |
| Simula (prompt) | 24 | 108 | 216 |
| Gioca la partita | 25 | 158 | 233 |
| Scegli (offerte) | 33 | 116 | 203 |
| Ingresso in campo | 31 | 132 | 1533 |
| Salta ingresso | 1135 (attesa della pagina 3D, vedi §5) | 1559 | 2046 |
| Salta festeggiamenti | 2604 (idem) | 3432 | 4150 |
| giocata highlight | 334 (idem) | — (azione a <400 ms dal clic) | 1466 |
| pad | — (la mossa smonta il pad nel primo fotogramma: l'effetto è il riscontro) | — | 498 |

Area di tocco: tutti i punti di riposo restano sul tasto premuto, su telefono e PC. Layout: invariato. PC: riscontro 11–18 ms
sui tasti 2D, rotellina 85–102 ms sui tasti pesanti.

## 5. Guardiano `tocco-213` (nuovo)

`npm run tocco-213` — lancia la sonda e giudica, su telefono (17 tasti) e PC (8 tasti), più una corsa col moto ridotto:

- **R1** riscontro (o l'effetto dell'azione) nel **primo fotogramma** dopo l'elaborazione del tocco, entro **50 ms** da essa;
  sulle schermate che elaborano il tocco subito (attesa del `pointerdown` < 30 ms) entro 50 ms dal tocco stesso;
- **R2** luce sempre, scala 0,96 dove lo strato la applica; moto ridotto: luce senza scala;
- **R3** layout invariato e area di tocco invariata;
- **R4** rotellina sui tasti a lavoro sincrono misurato e su ogni azione che parte oltre 400 ms dal clic;
- **R5** doppio tocco rapido su Simula: una sola partita salvata.

Esito (`docs/sviluppo/giro213/controlli/tocco-213.log`): **verde 27/27, rosso bocciato** su 9/9 righe (telefono: nessun
riscontro nel primo fotogramma — 7–11 fotogrammi dopo — e nessuna rotellina; PC: nessuna scala, nessuna rotellina).
Prima corsa: verde 26/27, rosso solo «Salta ingresso» (vedi Dubbi, punto 1, per come è stato trattato).

Inserito in `ci-runner.mjs` nelle catene **completa** e **carriera** (una volta ciascuna) e fra i passi lenti; `node --check`
verde, nessun doppione nelle catene. Durata: ~23 minuti.

## 6. I due rossi preesistenti della consegna

**ingresso-277** — il tasto «Salta ingresso» aveva due attributi `data-cpm` («salta-ingresso» e «salta-ingresso-v2»; Babel tiene
l'ultimo) e la sonda cercava il primo. Ora il tasto ne ha **uno**, `salta-ingresso-v2` (quello che il gioco già rendeva e che
`partita-v2` usa), e la sonda cerca quello. Soglie invariate. Esito: **verde** (salta: uscita 6,2 s dopo il clic a 5,3; corpi
pronti) **e il rosso si vede** (`__CPM_NO_ING277`: durata 38,5 s, velo 13,6 s, nessun pulsante).

**design-system** — `src/15-live-match.jsx` `borderRadius:8` → `RAD.sm`. Esito: **verde** («SISTEMA GRAFICO OK»).

**moves-budget** (solo misura, non corretto: fuori perimetro) — rosso sul ramo e **identico sulla 7.999.194** (`origin/main` =
`adca6f5d`): «gi4: concessi 0 passi, l'Eroe ne ha fatti 17,3 (spostamento 43,3 u)». Cercando il giro d'origine sulla storia di
`main` (ogni prova con il test della stessa versione, registri in `/tmp`, sintesi qui):

| versione | esiti |
|---|---|
| 7.999.193, .177 | rosso (17,3 / 18,6 passi) |
| 7.999.160, .157, .156, .155, .154 | rosso (10,8 passi) |
| 7.999.153 | **verde 1 volta, rosso 3 volte** |
| 7.999.144 | rosso 1, verde 1 |
| 7.999.129 | verde 1, rosso 1 |

Il difetto è **intermittente almeno dalla 7.999.129** e non nasce da un giro recente; da quando lo misuro sulla 7.999.154 in
poi è uscito rosso a ogni prova (campione piccolo: una prova per versione). L'ampiezza sale da 10,8 a 17,3–18,6 passi fra la
7.999.160 e la 7.999.177. **Non posso confermare il giro d'origine**: con un difetto intermittente servirebbero molte ripetute
per versione. La lettura del giro 210 (la mesh dell'eroe che raggiunge il suo punto nella prima scena di una pagina appena
aperta, contata come passi) è coerente con l'intermittenza.

## 7. Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, registri in `docs/sviluppo/giro213/controlli/`)

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** dopo ogni modifica a `src/`.

| controllo | esito |
|---|---|
| tocco-213 | ✅ verde 27/27, rosso bocciato |
| moves-budget | ❌ rosso preesistente, identico sulla 7.999.194 (§6) |
| ingresso-277 | ✅ verde e il rosso si vede |
| design-system | ✅ SISTEMA GRAFICO OK |
| hud-c3 | ✅ uscita 0 |
| griglia-mobile | ✅ uscita 0 (14 schermate × 5 larghezze) |
| typing-shortcuts | ✅ PASS |
| gioca-188 | ✅ 6 ok, 0 ko |
| simula-v2 | ✅ verde, rosso atteso ok |
| rassegna-202 | ✅ verde 9/9, rosso bocciato |
| highlight-95 | ✅ verde (103 highlight, 0 senza esito) e il rosso si vede |
| career-critical | ✅ PASS |
| test:logic | ✅ |
| save-compat | ✅ 12 pass · 0 fail |

La prima passata di `save-compat` e `typing-shortcuts` è fallita perché nella shell mancava `CPM_CHROME` (il modulo
playwright cercava un browser non installato); rilanciati con la variabile: verdi. `rassegna-202` e `highlight-95` sono stati
fermati la prima volta da un mio tetto di 290 s troppo basso e rilanciati interi.
Non eseguite le catene intere (`completa`/`carriera`/`notte`): solo i controlli della consegna.

## Dubbi per il PO

1. **«Entro 50 ms» sulle scene 3D headless.** Sulle schermate 2D il riscontro arriva in 18–33 ms. Nelle scene 3D (ingresso,
   highlight, festa) il banco disegna in software e un fotogramma dura 190–450 ms: il tocco viene elaborato in ritardo e nessun
   riscontro può comparire prima del fotogramma successivo. Lì il guardiano pretende il **primo fotogramma** dopo il tocco
   (la formula «luce entro un fotogramma dal tocco» della decisione) e stampa la durata del fotogramma; dove il fotogramma dura
   ≤ 50 ms resta la soglia dei 50 ms. È una mia interpretazione, non un abbassamento silenzioso: se il PO vuole i 50 ms assoluti
   anche lì, il banco headless non può misurarli e serve una prova sul telefono.
2. **Il ritardo vero nelle scene 3D non è il tasto.** «Salta festeggiamenti»: il tocco ha aspettato 2,6–3,1 s prima di essere
   elaborato (filo principale occupato dalla scena della premiazione); «Salta ingresso» 0,5–1,1 s. Lo strato non può
   accorciarlo; sul telefono vero i numeri saranno diversi (non misurati). Se il PO lo sente sul dispositivo, il cantiere è il
   costo del disegno di quelle scene, non il riscontro.
3. **Variabilità su PC**: «Salta festeggiamenti» dopo: tocco elaborato a 15 ms ma il fotogramma successivo è durato 447 ms
   (prima: 20 ms). Lo strato non lavora nei gestori (0–1 ms misurati): lo attribuisco al disegno 3D della festa, ma con una sola
   corsa per braccio non posso confermarlo.
4. **Doppio tocco.** Il gioco protegge già Simula da solo (anche il rosso salva una partita sola; c'è il controllo `double-tap`
   in career-critical). La guardia dello strato serve al differimento dei tasti pesanti: su PC ha assorbito il secondo clic
   arrivato mentre il primo aspettava il fotogramma (1 assorbito, 1 partita). R5 è quindi una **non-regressione** dello strato,
   non la prova di un difetto preesistente.
5. **La guardia ha una regola semplice**: assorbe il secondo tocco finché il documento non è cambiato (tetto 4 s). Su un tasto
   che non cambia nulla nella pagina (nessuno trovato fra quelli misurati) i tocchi ripetuti entro 4 s verrebbero assorbiti e
   comparirebbe la rotellina. Va bene così?
6. **Tasti disabilitati**: «Simula — prima vivi la settimana» (disabilitato) non dà riscontro né prima né dopo. È la norma per un
   tasto spento; se il PO vuole un segnale anche lì (es. vibrazione della scritta) va deciso.
7. **Pad**: nella fase di movimento la mossa fa cambiare la scena nel primo fotogramma (il pad viene smontato), quindi il
   riscontro è l'azione stessa. Il pad ha anche il suo vecchio riscontro (viola, scala 0,94) quando resta a schermo.
8. **Giocata e pad sul PC** non sono stati trovati dalla sonda in 150 s di partita (layout PC diverso): il guardiano li giudica
   solo sul telefono.
9. **Rotellina**: soglia dichiarata 300 ms; posizione a destra dentro il tasto (al centro se il tasto è più stretto di 90 px),
   colore del testo del tasto. Sono scelte mie, da confermare a occhio sul telefono (foto in `giro213/`).
