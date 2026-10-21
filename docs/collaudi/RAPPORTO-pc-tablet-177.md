# Rapporto di collaudo PO-292 — «Il gioco è completamente fruibile da PC e Tablet?»

Versione provata: **7.999.177** (ramo `main`, commit `78384a44`). Ramo di lavoro: `collaudo/7.999.177-pc-tablet`.
Il gioco non è stato toccato (nessun file in `src/`): questo rapporto, le foto e gli script sono gli unici file aggiunti.

## 1. Esito in breve

| Formato | Giudizio |
|---|---|
| PC 1366×768 (mouse + tastiera) | **usabile con difetti** |
| PC 1920×1080 (mouse + tastiera) | **usabile con difetti** |
| Tablet 768×1024 verticale (tocco) | **usabile con difetti** |
| Tablet 1024×768 orizzontale (tocco) | **usabile con difetti** |

- Nessun difetto **alto**: in tutti e quattro i formati si arriva dalla home alla carriera, si gioca una partita intera con più highlight 3D dell'eroe, si salva e si ricarica, senza errori di pagina, senza pagine bianche, senza scorrimento orizzontale.
- **7 difetti medi** (D1–D7) e **8 bassi** (D8–D15). Cinque dei sette medi (D1, D2, D3, D4, D6) sono **negli highlight dell'eroe** e, per la regola del PO, **bloccano il rilascio**. D7 è nella schermata di esito dell'highlight (idem). D5 è medio solo sul tablet orizzontale perché restringe anche il canvas 3D.
- Il giudizio «usabile con difetti» vale per «si può giocare tutto»; non significa «rilasciabile»: finché D1–D7 restano aperti la regola del PO sugli highlight è violata.

Scala di gravità usata: **alta** = impedisce di usare una funzione; **media** = peggiora in modo netto l'uso o, per regola PO, è un difetto negli highlight dell'eroe; **bassa** = rifinitura o disagio lieve.

## 2. Come è stato provato (e cosa NON è provato)

- Chromium headless (`/opt/pw-browsers/chromium`), WebGL software (SwiftShader), librerie dalle copie locali del banco (la rete è chiusa). Gioco: `CARRIER-MANAGER-AV.html?cpmtest=1`, un browser alla volta.
- PC: `viewport` 1366×768 e 1920×1080, mouse reale e tastiera reale (Tab, Invio, Spazio, Esc, 0–3, M C S R G U, frecce).
- Tablet: 768×1024 e 1024×768 con `hasTouch:true` e `isMobile:true`; tutte le azioni sono **tocchi** (`touchscreen.tap`, `locator.tap`), mai clic.
- Percorso per ogni formato: home → Crediti → creazione calciatore (con le due fisarmoniche aperte) → 3 provini giocati interi → offerte → inizio carriera (schede di benvenuto) ·  salvataggio di prova `save-190-s12-ovr93.json`: conferma «Eliminare il salvataggio?», Continua, 7 schede (Home, Stagione, Club, Carriera, Agente, Ufficio, Opzioni) con **tutte** le fisarmoniche aperte e scorse in alto/metà/fondo, pop-up impulso della settimana, conferma «Avanzare alla W.39?», salvataggio e ricarica · salvataggio `save-194-primavera-w38.json`: tasto «Gioca vs…», conferma «Gioca la partita», conferenza stampa, discorso del mister, pre-partita, formazioni, ingresso in campo, partita intera (2D + highlight 3D con movimento, scelta, esito), festa, fischio finale, post-partita, ritorno alla Home.
- Misure automatiche a ogni schermata (`tests/visual/c177-pctab-lib.mjs`): scorrimento orizzontale, elementi oltre il bordo, testi < 10 px, zone di tocco < 40 px (solo elementi interattivi più esterni), canvas (css contro buffer), pagina bianca, `pageerror` e `console.error`.
- Limiti dichiarati: non sono dispositivi veri (niente dito reale, niente iOS/Safari, niente GPU reale, niente barre di sistema); il frame-rate del 3D software è basso, quindi tempi e fluidità **non** sono valutati. Gli highlight sono stati scelti dallo script (a rotazione fra le opzioni), non «giocati bene».
- Strumenti di collaudo del gioco usati (solo `?cpmtest=1`): `__CPM_FROZEN` per fermare il frame mentre si fotografa; `__CPM_CAREER.apriImpulso('wi_docufilm')` per **aprire** il pop-up dell'impulso (poi chiuso con tocco/Esc come un giocatore); `__CPM_CAREER.dismiss()` per ripulire dialoghi prima di «Salva»; `__CPM_CAREER.playMatch()` solo nello script delle colonne (c177-pctab-5). La partita vera parte sempre dal pulsante della Home.
- Ricarica: il Service Worker del gioco fa uscire le richieste CDN dal banco (senza rete la pagina resta bianca dopo F5). È un limite del banco, non del gioco: nei contesti del collaudo il SW è bloccato (`serviceWorkers:'block'`) e la ricarica funziona su tutti e quattro i formati con lo stesso salvataggio (nome, stagione, settimana, OVR identici).

## 3. Tabella dei difetti

Formati: **PC-1366**, **PC-1920**, **TAB-V** (768×1024), **TAB-O** (1024×768). Le foto sono in `docs/collaudi/foto-pc-tablet-177/`; le misure grezze in `docs/collaudi/dati-pc-tablet-177/*.json`.

| ID | Gravità | Formato | Schermata | Cosa succede | Come riprodurlo | Foto |
|---|---|---|---|---|---|---|
| D1 | **media** (highlight: blocca) | TAB-V, TAB-O | Partita, tutte le fasi, compresi gli highlight | I comandi in alto della partita sono sotto i 40 px: **pausa ⏸ 14×33**, **velocità 1×/1,5×/2× 22×19**, **⚠️ 22×33**. Il tasto velocità è alto 19 px: nel codice è dichiarato «44 px di larghezza, 30 utili in altezza», misurati 22×19. Con il dito è facile sbagliare tasto (pausa/velocità/appunti sono a pochi px l'uno dall'altro) | Tablet, tocco: Nuova carriera → provino, oppure Continua → «Gioca vs…» → «Gioca la partita». Quando parte la partita misurare i pulsanti accanto al cronometro (`c177-pctab-3-partita.mjs`, campo `m.tocco` delle foto `partita-hl*`) | F22, F21 |
| D2 | **media** (highlight: blocca) | TAB-V, TAB-O | Highlight, fase «scelta» e fase «movimento» | I pulsanti di scelta sono alti **36–37 px** (larghi 263–275) e **«✅ Pronto [0]» è alto 28 px**: sotto i 40 px proprio dove si decide l'azione dell'eroe. (Il D-pad è 42×42: ok.) Su PC col mouse la cosa non pesa | Tablet, tocco: in un highlight con movimento toccare Pronto, poi toccare una scelta; misurare i bottoni (`partita-hl*-scelta`, `partita-hl*-move`: es. TAB-V 269×37, 263×36, Pronto 259×28; TAB-O 275×37, 270×36, Pronto 266×28) | F21, F22 |
| D3 | **media** (highlight: blocca) | TAB-V, TAB-O | Highlight, ingresso in campo, festa (canvas 3D) | Il canvas 3D è stretto e alto (TAB-V **458×879**, TAB-O **467×623**; su PC-1366 è 650×623) e l'inquadratura taglia la scena ai lati. Nell'highlight «Palla buona al limite dell'area» (69') l'eroe è a ~25 px dal bordo destro in entrambi i tablet; su TAB-V **la porta resta fuori dal quadro**, su TAB-O è appena visibile in alto a sinistra: la scelta «Conclusione potente» si fa senza vedere dove si tira. Nell'ingresso il logo del cerchio di centrocampo è tagliato a destra (TAB-V); nella festa il volto di un compagno è tagliato al bordo (TAB-O). I canvas **non sono deformati** (rapporto buffer = rapporto css): è l'inquadratura a non adattarsi | Tablet: partita da «Gioca vs…», attendere l'highlight del 69' (stesso salvataggio) o l'ingresso in campo e la festa; confrontare con PC-1366 | F23, F24, F25, F26 |
| D4 | **media** (highlight: blocca) | PC-1920 | Partita 2D e highlight 3D | Su 1920×1080 la partita sta in una colonna da **1100 px** (margini 520 a sinistra e 300 a destra); il canvas 3D è **681×935** (verticale) e il campo 2D è un rettangolo verticale di circa 395×610 con pedine da ~16 px. L'eroe nell'highlight è alto ~50 px su 935 e metà del quadro è erba vuota; il pannello a destra è quasi vuoto. Spazio sprecato evidente | PC 1920×1080: «Gioca vs…» → partita; guardare la fase 2D e un highlight | F18, F19 |
| D5 | **media** su TAB-O (restringe il canvas); bassa su PC | PC-1366, PC-1920, TAB-O | Creazione, offerte, pre-partita, formazioni, ingresso, partita di carriera | Le schermate **senza barra laterale** restano spostate a destra del margine di 220 px che la barra laterale occupa nelle altre: colonna non centrata. Margini sinistra/destra misurati (c177-pctab-5): PC-1366 creazione **302/56**, pre-partita e partita **268/48**; PC-1920 creazione **579/333**, pre-partita e partita **520/300**; TAB-O creazione **273/27**, pre-partita e partita **244/24** (sul tablet orizzontale 244 px di 1024 sono vuoti e il canvas 3D scende a 467 px). Nei provini la partita è invece centrata (133/133 a 1366): incoerenza fra provino e carriera | Con qualunque formato PC o TAB-O: Home → Nuova carriera (creazione), oppure Gioca vs… → pre-partita/formazioni/partita; misurare sinistra/destra del contenitore | F02, F03, F15, F16, F17 |
| D6 | **media** (highlight: blocca) | PC-1920 (stesso codice su PC-1366, non rivisto lì) | Highlight con scelte non numerate (rigori e punizioni) | Le scelte numerate rispondono ai tasti 1–3. Nei **rigori e nelle punizioni** le opzioni non portano numero e **i tasti 1–3 non scelgono nulla**; con Tab il fuoco arriva sulla 2ª opzione (anello visibile) ma **Invio non la attiva** (la fase resta `hl_choose` dopo 1,5 s): la tastiera da sola non basta, serve il mouse. | PC: in un rigore o in una punizione (in PC-1920 è comparso al 26') premere 3; poi Tab Tab Invio. Non è deterministico: l'highlight dipende dalla partita. Script: `c177-pctab-3-partita.mjs` (campi `tastoInutile`, `tabEnter` in `partita-pc1920.json`) | F20 |
| D7 | **media** (esito highlight: blocca) | PC-1366 | Esito dell'highlight (2D) | La barra **Statistiche / Pagelle ▴** sta **sopra il campo 2D** (fascia y 513–548 su un campo che va da 237 a 660) e copre le pedine che ci passano sotto; il timbro **«MURATO DALLA DIFESA»** copre la riga TIRI / IN PORTA delle statistiche (numeri illeggibili) | PC 1366×768: in un provino o partita, attendere l'esito di un'azione «murata» | F28 |
| D8 | bassa | PC-1366, PC-1920 | Crediti e Opzioni | **Esc non chiude** la finestra Crediti (la × resta a schermo) né Opzioni (ancora aperta dopo Esc; chiude solo la ✕ 38×38). Esc invece chiude impulso della settimana e conferma «Gioca la partita» | PC: Home → Crediti → Esc; carriera → Opzioni → Esc | F04, F08 |
| D9 | bassa | PC-1366, PC-1920 | Schede della carriera (tastiera) | Il suggerimento della scheda **Club è «[S]»** ma `S` **salva**: non apre Club; **Ufficio** annuncia **«[U]»** ma `U` non fa nulla; le **frecce ←/→** si fermano su Agente (Ufficio e Opzioni non si raggiungono con le frecce). M, C, R, G e le frecce fino ad Agente funzionano | PC: carriera → premere S, poi U, poi → ripetuto da Home (`carriera-pc*.json`, riga `tastiera-schede`) | — |
| D10 | bassa | TAB-V, TAB-O | Schermate fuori dagli highlight | Altre zone di tocco < 40 px: ✕ dei Crediti **18×31**; «Salta» del benvenuto **38×34**; «Salva · ora» **90×23**; «Calendario ›» **71×16**; strisce «Sostieni il progetto» e «Idee e feedback» **26 px**; titoli delle fisarmoniche **28–36 px** (42 sezioni aperte nelle schede); «Salta ingresso →» **131×36**, «Salta festeggiamenti →» **170×36**; linguette Statistiche/Pagelle **193–198×25** e ▴ **34×27**; «🗑 Elimina» **110×28**; «Licenzia il procuratore» **157×24** | Tablet, tocco: vedere i `m.tocco` di ogni foto in `dati-pc-tablet-177/*.json` | F05, F09, F22 |
| D11 | bassa | tutti | Partita 2D / esito | Nella fase 2D il pannello di destra è quasi vuoto (PC-1366 ≈ 415×620, TAB-V ≈ 280×880, TAB-O ≈ 288×620): colonna sprecata mentre il campo è piccolo | Qualunque formato: guardare la partita in fase 2D | F27, F28 |
| D12 | bassa | PC-1920 | Schede della carriera e Opzioni | Le pagine si allargano a **1566 px** (Opzioni a **1850 px**): righe con il nome a sinistra e il valore a 1500 px di distanza, slider da 1850 px. Troppo larghe per leggere | PC 1920: Club → Piazzamenti; Opzioni | F07, F08 |
| D13 | bassa | PC-1366, TAB-O | Pop-up: impulso, conferma avanzamento | Il banner fisso **«Vivi la Settimana»** e la striscia «Sostieni il progetto / Idee e feedback» restano **sopra lo scuro** del pop-up (colori pieni mentre il resto è oscurato) | Carriera → Home, scorrere un poco, aprire l'impulso o premere `0`/«Vivi la Settimana» | F10, F11, F14 |
| D14 | bassa | TAB-V, TAB-O | Highlight | Sul tablet restano i suggerimenti da tastiera: «Muoviti (WASD) per cambiare le opzioni d'azione» e «✅ Pronto **[0]**» | Tablet: qualunque highlight con movimento | F21, F22 |
| D15 | bassa | TAB-V, TAB-O, PC-1366 | Intestazione della partita nel 2° tempo | Dal 2° tempo l'intestazione mette la squadra dell'eroe a sinistra («FC Laguna 1 – 0 FC Altoadige») mentre il tabellone dello stadio resta «ALT 0 – 1 LAG»: i due non hanno lo stesso ordine. Da confermare con il PO se voluto (cambio di campo) | Qualunque partita: confrontare intestazione e tabellone dopo l'intervallo | F29 |

## 4. Giudizio per formato, con le prove

### PC 1366×768 — usabile con difetti
- Percorso completo eseguito con mouse e tastiera: creazione, 3 provini interi, offerte, schede di benvenuto, 7 schede, pop-up, partita di carriera (pre-partita → formazioni → ingresso → 2D → 4 highlight con movimento/scelta/esito → festa → post-partita), salvataggio e ricarica (stessi dati). 0 `pageerror`, 0 scorrimento orizzontale, 0 testi < 10 px (`dati-pc-tablet-177/*-pc1366.json`).
- Tastiera: Invio/Spazio passano pre-partita, formazioni, intro dell'highlight, esito, festa; `0` conferma il movimento; 1–3 scelgono le scelte numerate; Tab ha l'anello di fuoco visibile.
- Difetti: D5 (colonna sbilanciata, 268/48), D7, D8, D9, D11, D13, D15. D6 (tastiera nelle scelte non numerate) è stato osservato su PC-1920; il codice è lo stesso, ma su PC-1366 in questa corsa non è comparso un rigore/punizione da provare.

### PC 1920×1080 — usabile con difetti
- Stesso percorso completo, 4 highlight con scelta (di cui un rigore), ricarica corretta, 0 errori.
- Difetti: **D4** (partita e highlight in 1100 px, canvas 681×935, eroe ~50 px), D5 (520/300), D6 (rigore da tastiera), D8, D9, D11, D12.

### Tablet 768×1024 verticale — usabile con difetti
- Tutto con il **tocco**: creazione, 3 provini (3–4 highlight ciascuno), offerte, benvenuto, 7 schede (barra inferiore da 49 px: i tab si toccano bene), impulso, conferma partita, conferenza stampa, discorso del mister, pre-partita, formazioni, ingresso, partita intera con **5 highlight 3D** (movimento col D-pad e Pronto, scelta, esito), festa, post-partita fino a «Torna alla dashboard» (a fondo pagina), salvataggio e ricarica. 0 errori, nessuno scorrimento orizzontale, canvas non deformati.
- Difetti: **D1, D2, D3** (canvas 458×879, porta fuori quadro), D10, D11, D13, D14.

### Tablet 1024×768 orizzontale — usabile con difetti
- Stesso percorso a tocco: partita intera con **5 highlight 3D**, tutte le schede, ricarica corretta, 0 errori.
- Difetti: **D1, D2, D3** (canvas 467×623, eroe al bordo), **D5** (244 px vuoti a sinistra, 24 a destra), D10, D11, D13, D14, D15.

## 5. Cosa è stato controllato e non ha dato difetti

- Nessuno scorrimento orizzontale in 411 schermate misurate (97–105 per formato); nessun elemento oltre il bordo; nessun testo < 10 px nelle schermate di gioco (testo minimo 11 px; le uniche scritte da 3–6 px sono nell'illustrazione decorativa della sala stampa e nella miniatura della figurina).
- Nessuna pagina bianca; nessun `pageerror` (i soli `console.error` visti erano le richieste CDN del Service Worker in ricarica, artefatto del banco, vedi §2).
- Canvas 3D e 2D: buffer e dimensioni CSS con lo stesso rapporto in ogni schermata: nessuna deformazione.
- Barra di navigazione: a tocco i tab della carriera sono ≥ 85×49; l'ultima riga di ogni scheda arriva sopra la barra (nessun contenuto coperto a fondo pagina).
- Conferme e pop-up: «Eliminare il salvataggio?» (Annulla/Elimina), «Avanzare alla W.39?» (Annulla/Conferma 174×59), impulso della settimana (pulsanti 424×54), «Gioca la partita» (424×54), conferenza stampa e discorso del mister: raggiungibili e usabili a tocco e a mouse.
- Il tasto velocità cambia 1× → 1,5× → 2× a tocco e a clic; Esc chiude la conferma di partita e l'impulso.

## 6. File e come rieseguire

- Rapporto: `docs/collaudi/RAPPORTO-pc-tablet-177.md` · foto (30 PNG): `docs/collaudi/foto-pc-tablet-177/` · misure: `docs/collaudi/dati-pc-tablet-177/`.
- Script: `tests/visual/c177-pctab-lib.mjs` (libreria: formati, misure, pilota di partita a input reali), `c177-pctab-1-crea.mjs` (home, Crediti, creazione, 3 provini, offerte, inizio carriera), `c177-pctab-2-carriera.mjs` (schede, fisarmoniche, pop-up, salva/ricarica), `c177-pctab-3-partita.mjs` (partita intera con highlight), `c177-pctab-4-tastiera.mjs` (Tab/fuoco su PC), `c177-pctab-5-layout.mjs` (margini delle colonne e canvas).
- Esecuzione (dalla cartella `tests/visual`, con `tests/visual/node_modules` collegato): `export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers; C177_FMT=pc1366,pc1920,tabV,tabO node c177-pctab-3-partita.mjs` (stesso schema per gli altri; `C177_FMT` sceglie i formati).
- Le foto di ogni passo vanno in una cartella temporanea (`C177_SHOTS`); in `docs/` sono state copiate solo le 30 citate.
- Nota sui dati: `crea-pc1366.json` viene da una corsa precedente alle schede di benvenuto (identica per il resto); i file `crea-*` e `partita-*` accumulano le misure dei formati già eseguiti nello stesso processo.
