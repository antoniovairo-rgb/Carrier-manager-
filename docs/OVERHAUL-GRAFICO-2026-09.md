# OVERHAUL GRAFICO / UX — direttiva PO 13/09/2026

**Perimetro: PRESENTAZIONE SOLTANTO.** Il motore (simulazione, probabilita', eventi,
esiti, eroe, IA, calendario, classifica, mercato, carriera, economia, salvataggi) e'
SOURCE OF TRUTH e **non si tocca in questo task**. Se trovo un difetto di motore lo
scrivo in §13 «ISSUES MATCH ENGINE — NON MODIFICATI» e non lo correggo.

Build di partenza: `main` = `539efe6`, **GAME_VERSION 7.888.0**.
Regola di lavoro invariata: si modificano SOLO i frammenti `src/`, poi
`node tools/build-src.mjs` e `node tools/check-src.mjs | grep -c IDENTICO` (=1).

---

## 1. ANALISI INIZIALE (FASE 1) — misurata, non stimata

### 1.1 Il perimetro
| Frammento | righe | contenuto |
|---|---:|---|
| `18-career-app.jsx` | 10867 | Home/Stagione/Club/Carriera/Agente + navigazione + post-partita |
| `15-live-match.jsx` | 9476 | HUD partita, telecronaca, highlight, interazioni |
| `12-three-match-view.jsx` | 8736 | scena 3D, camera, luci, campo, stadio, giocatori |
| `17-menu-creazione-pannelli.jsx` | 2575 | Home fuori carriera, creazione, offerte, provino, fine carriera |
| `16-scene-3d-cerimonie.jsx` | 2505 | cerimonie, gala, premi |
| `11-ui-kit-highlight.jsx` | 2216 | **UI kit: 22 primitive** |
| `13-prepartita-formazioni.jsx` | 1340 | prepartita, formazioni |
| `19-app-root.jsx` | 994 | root, impostazioni, intro |
| `theme.js` | 155 | design token (documento) |

### 1.2 Il design system esiste sulla carta, non nel codice
`src/theme.js` definisce palette, spacing, radius, tipografia, motion.
Le scale sono presenti nel build (`SP`, `RAD`, `FS`, `FW`, `MO`). **L'adozione e' ~3 %:**

| | da scala | literal inline | adozione |
|---|---:|---:|---:|
| font-size | `FS.*` **67** | `fontSize:<n>` **1936** | **3,3 %** |
| radius | `RAD.*` **71** | `borderRadius:<n>` **477** | **13,0 %** |
| spacing | `SP.*` **21** | `padding` **872** + `gap` **477** | **1,5 %** |
| peso | `FW.*` **111** | `fontWeight:<n>` **840** | **11,7 %** |
| motion | `MO.*` **30** | — | — |
| colore | `TH.*` **2278** | **3122** literal esadecimali, **574 distinti** | 42 % |

Il colore e' l'unica dimensione mezza tokenizzata. **574 tinte distinte** contro una
palette dichiarata di ~40: e' la causa diretta dell'incoerenza fra schermate.

### 1.3 L'UI kit e' costruito e quasi tutto inutilizzato
| primitiva | usi | | primitiva | usi |
|---|---:|---|---|---:|
| `Card` | **240** | | `KpiTile` | **0** |
| `Btn` | **149** | | `Modal` | **0** |
| `Badge` | 8 | | `BottomSheet` | **0** |
| `MatchBadge` | 4 | | `Tabs` | **0** |
| `Sparkline` | 3 | | `DataTable` | **0** |
| `StatBar`/`OvrRing`/`Meter`/`SectionHeader` | 2 ciascuna | | `Toast`/`Skeleton`/`Tooltip`/`EmptyState`/`Bracket` | **0** |

Contro **2363** `<div style={{…}}>` scritti a mano. Dieci primitive su ventidue hanno
**zero** consumatori: modali, tabelle, tab, bottom-sheet e stati vuoti sono
reinventati inline ogni volta. E' questa la ragione per cui «ogni schermata sembra
progettata separatamente».

### 1.4 Tipografia
- **36 dimensioni di carattere distinte**.
- `fontSize:10` da solo compare **664** volte — e' il corpo di fatto dell'app.
- **187** dichiarazioni a **7, 8 o 9 px**: sotto la soglia di leggibilita' su telefono.
- La gerarchia e' portata dal peso (840 `fontWeight` inline), non dalla scala: tutto grida.

### 1.5 Tema scuro
**270** `#fff` grezzi, **321** `rgba(255,255,255,…)`, **166** `rgba(0,0,0,…)` fuori dal tema.
Ogni occorrenza e' un'isola che non commuta col tema.

### 1.6 Stati e microinterazioni
**6** `onMouseEnter` in tutta l'app, **4** regole `:hover`, **5** `:focus`.
Non esiste uno stato premuto/attivo/disabilitato coerente: il feedback al tocco e' quasi assente.

### 1.7 Mobile
Il viewport e' corretto (`width=device-width, viewport-fit=cover`), `safe-area` usata **14** volte,
**29** `@media`. Ma il layout e' governato da **46** `position:'fixed'` e da misure in px:
l'overflow va misurato a 360/375/390/412/430, non dedotto.

### 1.8 Partita 3D
Camera: **4** `camera.position.set`, **2** `lookAt`, e tre soli nomi di inquadratura
nel codice (`wide` 4 · `goal` 13 · `hero` 2). **7** luci, **13** flag d'ombra,
tone mapping presente, `setPixelRatio` una sola volta.
La regia esiste ma e' povera di stati: non c'e' un piano «azione», ne' un piano
«occasione pericolosa», ne' un ritorno graduale dopo il gol.

### 1.9 Quello che NON ho rifatto
`docs/UX_UI_OVERHAUL_AUDIT_2026-07.md` contiene gia' un audit completo di
**152 finding** (9 critici · 45 alti · 55 medi · 43 bassi) scritto sulla 7.72.2.
Ho **riverificato le sue cifre sulla 7.888**: reggono tutte (font-size distinti
37→36, `fontSize:10` 628→664, esadecimali distinti 360→574, primitive mancanti
ora costruite ma non adottate). L'audit di luglio resta valido: questo piano lo
usa come elenco dei difetti e aggiunge il metro e l'ordine di esecuzione.

---

## 2. IL METRO (prima di toccare un pixel)

Vale la regola di sempre: **misura → rimedio → ri-misura**, e nessun «e' migliorato»
senza numero. Le grandezze che governano questo task:

| # | grandezza | come si misura | valore oggi |
|---|---|---|---:|
| M1 | adozione delle scale | grep `FS/RAD/SP/FW` vs literal | **3,3 % / 13,0 % / 1,5 % / 11,7 %** |
| M2 | tinte distinte | `#rrggbb` distinti in `src/` | **574** |
| M3 | testo sotto i 10 px | `fontSize:7|8|9` | **187** |
| M4 | isole fuori tema | `#fff` + `rgba(255,255,255` + `rgba(0,0,0` | **757** |
| M5 | overflow su telefono | scatto a 360/375/390/412/430, `scrollWidth>clientWidth` | **da misurare (G0)** |
| M6 | contrasto | rapporto testo/fondo per ogni coppia resa | **da misurare (G0)** |
| M7 | primitive a zero consumatori | conteggio usi | **10 su 22** |
| M8 | fluidita' | fps della scena 3D al banco, invariato | non peggiorare |

M5 e M6 non esistono ancora: **il primo lavoro e' costruire lo strumento**, non la grafica.

---

## 3. PIANO DI INTERVENTO — ordine proposto

Ogni voce e' spedibile da sola, con rituale verde e misura appaiata.
Nessuna voce tocca il motore.

### G0 — Lo strumento (prima di tutto)
Sonda che apre il gioco in Chromium a **cinque larghezze** (360/375/390/412/430),
percorre tutte le schermate e per ognuna riporta: overflow orizzontale, elementi
fuori dallo schermo, testo sotto i 10 px reso, coppie testo/fondo sotto contrasto
4,5:1, e uno scatto. Output: una tabella per schermata, ripetibile a seme fisso.
**Senza questo, M5 e M6 restano opinioni.**
*Dichiaro sempre che e' Chromium 412×915, non l'Android del PO.*

### G1 — Fondamenta: il design system diventa vero
1. **Palette**: ridurre le 574 tinte alla palette semantica di `theme.js`, per aree.
2. **Tipografia**: portare le 36 dimensioni sulla scala `FS` e **azzerare i 187 testi sotto i 10 px**.
3. **Superfici**: radius e spacing sulla scala; ombre ai 3 livelli.
4. **Tema**: chiudere le 757 isole fuori tema.
Misura: M1 ≥ 80 %, M2 ≤ 60, M3 = 0, M4 ≤ 50.

### G2 — Le primitive tornano in uso
Adottare `Modal`, `BottomSheet`, `Tabs`, `DataTable`, `KpiTile`, `EmptyState`,
`Toast` dove oggi ci sono div a mano; aggiungere stati (premuto, attivo, disabilitato,
focus) alle primitive, non alle singole schermate. Misura: M7 da 10 a ≤ 2.

### G3 — Gerarchia schermata per schermata (fuori dal campo)
Ordine per peso: **Home/Dashboard** → **Prepartita** → **Fine partita** →
**Profilo/Carriera** → **Stagione (classifica/calendario)** → **Agente** → **Club** →
**Impostazioni** → **Navigazione**. Per ognuna: livelli di card, un solo CTA primario,
rumore ridotto, numeri importanti leggibili. Misura: scatti G0 prima/dopo + la scheda del telefono.

### G4 — Dentro il campo: HUD, telecronaca, highlight
HUD con gerarchia 1 risultato · 2 minuto · 3 squadre · 4 azione · 5 eroe; telecronaca
che non copre il campo; highlight con SETUP → AZIONE → CONCLUSIONE → CONSEGUENZA
(il feedback **dopo** che l'azione e' leggibile). Solo presentazione: gli eventi restano quelli del motore.

### G5 — Regia 3D
Piani veri: ampio in gioco, seguito in azione, concentrato sull'occasione, valorizzato
sul tiro, momento breve dopo il gol, ritorno morbido. Nessuno zoom estremo, mai perdere
pallone o eroe. Misura: il pallone e l'eroe dentro il quadro, contato sugli scatti.

### G6 — Campo, stadio, folla, pallone
Proporzioni della folla, ripetizione delle texture, profondita', leggibilita' del
pallone e del campo. Vincolo duro: **non peggiorare gli fps** (M8).

### G7 — Transizioni e microinterazioni
Fade/slide brevi fra schermate; feedback al tocco; celebrazione misurata su gol,
assist, record. Regola: **mai rallentare**.

---

## 4. COSA NON FARO'
- Nessuna modifica a `src/14-motore-possesso.jsx` e a nessuna logica di gioco.
- Nessun cambio di evento, esito, probabilita', salvataggio.
- Nessun ridisegno «perche' bello»: se una schermata e' piena, si semplifica.
- Nessun «puoi collaudare» finche' la scheda dal telefono non batte il metro concordato.

## 5. STATO
- 13/09 — FASE 1 chiusa (questo documento).
- 14/09 — **G0 chiuso**: `tests/visual/griglia-mobile.mjs`, tarata 13/13, ripetibile (due corse byte-identiche), tema chiaro e scuro (`CPM_TEMA=scuro`), cinque colonne (overflow, fuori schermo, testo <10 px, contrasto WCAG, bottoni pieni di marca). Base 7.888: overflow 0, testo <10 px 463/2760, contrasto 917/2291 (chiaro) e 1000/2291 (scuro).
- 14/09 — **G1 chiuso a metro** (ramo `grafica/overhaul-2026-09`): chiaro contrasto **917 → 61**, testo <10 px **463 → 29**; scuro contrasto **1000 → 61**; overflow 0 → 0 a 360/375/390/412/430. Sette passi misurati uno alla volta: G1.1 grigi del testo (917 → 174) · G1.2 semantici pieni non piu' usati come testo (→ 63) · G1.4 pavimento 10 px (463 → 29) · G1.5 fondi tinti sui token (scuro 1000 → 981) · G1.6 color-scheme + brandText/accentText (→ 658) · G1.7 faint del tema scuro (→ 61).
- 14/09 — **G3.1**: la Home ha una card principale, «Prossima partita» (f0c3f4c), nessuna regressione. **G3.2**: una sola azione primaria per vista — tre primari di navigazione a `outline`; bottoni pieni di marca in Home 8 → 7 (piccolo, dichiarato: i restanti sono le decisioni dei «momenti» che si accumulano).
- 14/09 — **Palette A** scelta dal PO («la A», verde «assolutamente no»): base avorio `#f5f3ef` al posto dell'azzurrino, granata invariato, testi invariati, tema scuro invariato. Misura in corso con la G3.2.
- Direttiva PO 14/09: «spingi ancora di piu' sulla qualita' grafica». Prossimo: **G3.3 «un momento alla volta»** — la Home ha 52 blocchi condizionali di primo livello; i «momenti» con decisione (sponsor, vita privata, procuratore, patto col mister...) si accumulano tutti aperti, ognuno col suo bottone pieno. Proposta: il primo momento aperto, gli altri in una riga «altri N momenti» che si apre al tocco; metro = bottoni pieni di marca in Home → 2 (CTA + un momento), senza nascondere nessuna decisione (restano raggiungibili).
- 17/09 — **Il censimento del reso**: la griglia mobile conta, schermata per schermata, quanti valori DIVERSI arrivano davvero all'occhio (tinte di testo, fondi, corpi, raggi). Non e' un guardiano e non ha soglia: e' il TABELLONE dell'overhaul. Il conto degli esadecimali nel sorgente (`tavolozza.mjs`, 522 tinte) e' cieco — un colore scritto dieci volte e mai reso vale zero. Foto di partenza a 412 px: Dashboard 13 tinte / 14 corpi / 8 raggi · Classifica 15 / 7 / 6 · Club 11 / 10 / 7 · **Carriera · Profilo 16 / 10 / 11, la peggiore**.
- 17/09 — **Il provino della direzione** (`docs/collaudo-grafico/proposta-schermate/`, metro `tests/visual/provino-schermate.mjs`): tre schermate statiche a 412 px con i dati veri del gioco, per far giudicare la direzione PRIMA di toccare `src/`. v1 bocciata dal metro prima che dal PO (86 nodi sotto soglia, 31 testi sotto il pavimento). v2 approvata dal PO («mi piace») con tre leve: **un carattere vero incorporato** (Barlow + Barlow Condensed), **il colore del club che guida la pagina** (i DUE colori di `mkT`), **la classifica su una riga sola con tutte e otto le colonne e il nome del club per intero** (coi numerali condensati le otto colonne costano 168 px invece di 224). Misura del provino: 5 tinte · 6 corpi (11 · 12,5 · 14 · 16 · 19 · 26) · 3 raggi (3 · 6 · 50%), IDENTICI sulle tre schermate.
- 17/09 — **G8.1 · il carattere, nel gioco**: sei tagli latini di Barlow/Barlow Condensed incorporati in base64 in `src/00-head.html` (131 KB di woff2, +176 KB sul file, 6,28 → 6,46 MB). `src/19-app-root.jsx` dichiarava gia' `fontFamily:"'Barlow',…"` sulla radice ma Barlow non era incorporato da nessuna parte: quella riga cadeva in silenzio sul ripiego di sistema, e da qui in poi dice la verita'. Misurato a 360/412/430 prima e dopo: **overflow 0 → 0, fuori schermo 0 → 0, testo sotto il pavimento 8/2785 → 8/2785, contrasto sotto soglia 62/2313 → 62/2313, bottoni pieni di marca 5 → 5**. Nessun guardiano si muove. NON VERIFICATO: l'effetto dei 176 KB sul tempo di avvio dell'Android del PO.
- 17/09 — **G8.2 · la testata dell'eroe**. Fondo PIATTO col colore del club al posto della sfumatura che finiva in `#0b1220`; il **secondo** colore del club (`mkT(...,c,c2)`, nei dati e mai mostrato) come filo da 3 px; le tre misure fuori dalla fascia, su una striscia chiara. Difetto trovato e chiuso, che il metro NON poteva vedere: la griglia mobile esclude dal contrasto ogni nodo su fondo a gradiente, e sotto quel velo **82 club su 252** avevano il bianco sotto 4,5:1, il peggiore **1,09:1** (Torino Athletic `#f5f5f5`, bianco su bianco). Sonda nuova `tests/visual/inchiostro-club.mjs`, statica, senza browser. Con `inkSu945` (bianco o `#0f172a`, quello che vince): **0 club sotto soglia, peggiore 4,83:1**. La stessa sonda ha bocciato due cose gia' scritte: **nessun velo regge sul testo** (all'80 % cadono 96 club; l'unica opacita' buona e' 1,00 — la gerarchia viene da corpo e peso) e **nemmeno il fondo di un chip** (da 0,06 a 0,30 restano club sotto soglia), percio' il bottone «Salva» e' invertito. Misura a 360/412/430: overflow 0 → 0, fuori 0 → 0, pavimento 8/2785 → 8/2769, bottoni di marca 5 → 5, e i nodi **misurabili** per contrasto **2.313 → 2.473 (+160)** con i nodi sotto soglia fermi a **62**: i 160 che prima nessuno poteva controllare passano tutti.
- 17/09 — **Quanto sono lunghe le schermate** (direttiva PO «se una schermata e' troppo lunga valuta se mettere degli accordion»). La prima stesura del metro leggeva `document.scrollHeight` e rispondeva **915 px su tutte e tredici**, cioe' esattamente l'altezza dello schermo: numero impossibile, e infatti falso — il gioco non scorre sul documento ma dentro `div.cpm-scroll`. Seconda correzione: escluso ogni scorritore che non occupi almeno meta' schermo, perche' la Creazione rispondeva 11.576 px ed era la lista dei 200 club dentro un riquadro da 220 px. Numeri veri a 412 px, in schermate da 915: **Carriera · Profilo 3.394 (3,71)** · **Dashboard 2.704 (2,96)** · **Club 2.341 (2,56)** · Classifica 2.039 (2,23) · Creazione 1.749 (1,91) · Calendario 1.655 (1,81) · Agente 1.598 (1,75) · Nazionale 1.187 (1,30) · le altre cinque 915 (1,00).
- 17/09 — **Quello che G8.2 NON fa, e che avevo scritto prima di misurarlo**: non accorcia la schermata. La Dashboard passa da 2.704 a 2.700 px, **quattro pixel**. Le tre misure non sono sparite, si sono spostate. Per accorciare davvero servono le sezioni richiudibili, ed e' il passo dopo (**G8.3**), da fare dove il numero lo chiede: Profilo, Dashboard, Club.
- 21/09 — **IL METRO ERA CIECO SULL'ARCHIVIO.** Il salvataggio cablato nella griglia mobile non aveva **né trofei né storico allenatori**: due delle sezioni più lunghe del Profilo non venivano proprio rese. Con una carriera vuota di archivio una sezione richiudibile sembra non servire a niente — e non è vero, è il banco che non vede. Aggiunti al salvataggio 3 trofei e 3 allenatori (realistici per un professionista alla S.4). **Tutti i numeri di altezza e di nodi di testo citati prima del 21/09 sono stati misurati senza queste due voci e non si confrontano con quelli di dopo.**
- 21/09 — **G8.3 · le sezioni richiudibili** (direttiva PO «se una schermata è troppo lunga valuta se mettere degli accordion»). Componente `Fisarmonica` nel kit (`src/11-ui-kit-highlight.jsx`), applicato alle tre sezioni d'archivio del Profilo: Record personali, Bacheca trofei, Storico allenatori. Regole: si chiude ciò che si **consulta**, mai ciò che si **usa**; il cappello dice sempre **quante** voci contiene, così chiuso non mente; la scelta resta (`safeLS` per id); è un `<button>` con `aria-expanded`. Misurato a 412 px **sullo stesso salvataggio arricchito**, prima → dopo: **Carriera · Profilo 4.005 → 3.575 px, cioè 4,38 → 3,91 schermate (−430 px, mezza schermata)**; testo sotto il pavimento 8/2860 → 8/2783; overflow 0 → 0; fuori schermo 0 → 0.
- 21/09 — **Il −4 nel contrasto NON è una correzione.** I nodi sotto soglia passano da 66/2534 a 62/2487, ma quei quattro stanno dentro la Bacheca trofei, che adesso nasce chiusa: non sono stati risolti, hanno smesso di essere disegnati. Restano un difetto vero appena il giocatore apre la sezione — la card dei trofei ha testo chiaro su una sfumatura ambra. Da sistemare come difetto a sé.
- 21/09 — **CORREZIONE a G8.3**: i quattro nodi di contrasto spariti **non erano nella Bacheca trofei**, erano le sigle `CT` dello Storico allenatori (`TH.success` #16a34a su bianco, 3,30:1). La sostanza non cambia — erano nascosti, non risolti — ma la collocazione sì, e con essa il posto dove va la correzione vera.
- 21/09 — **G8.4 · `legCol944` era morta in tutto il gioco.** Quella funzione alza una tinta finché non si legge, ma aveva la guardia `if(!TH.dk) return col`: **solo nel tema scuro**. Dalla **7.947** il gioco ha **un tema solo, chiaro** (interruttore tolto su richiesta del PO, e all'avvio chi aveva acceso lo scuro viene riportato indietro): da quel momento quella guardia ha reso `legCol944` un **no-op in ogni schermata spedita**, in tutti i suoi 14 punti d'uso. Ora delega a `semTesto945`, che sposta la tinta **verso il fondo opposto in tutte e due le direzioni** (più scura su fondo chiaro, più chiara su fondo scuro) finché non arriva a 4,5:1, conservando la tonalità: il verde resta verde, l'ambra resta ambra. Misurato a 412 px sullo stesso salvataggio: **contrasto sotto soglia 62/2487 → 49/2487 (−13 nodi)**; overflow 0 → 0, fuori schermo 0 → 0, pavimento 8/2783 invariato, bottoni pieni di marca 5 → 5. Il rosso `__CPM_NO944` resta e spegne tutto; il nuovo ha il suo, `__CPM_NO945S`.
- 21/09 — **La manopola `CPM_TEMA=scuro` non comanda più niente, e la sonda ora lo grida.** Due corse, una chiara e una «scura», davano lo stesso identico `49/2487`: chi confronta quei due numeri crede di aver misurato due temi. La griglia ora controlla il tema **reso** e lo dichiara a schermo e nell'intestazione del rapporto. Anche qui il primo controllo era sbagliato — leggeva `backgroundColor` della radice, che è trasparente perché sopra c'è una sfumatura, e prendeva il chiaro per scuro: si legge il **colore del testo**, che nei due temi è opposto.
- 21/09 — **G8.5 · il Club scende sotto le due schermate.** Tre sezioni d'archivio richiuse (Allenatore · Rosa · Bacheca del club): **2.337 → 1.527 px, cioè 2,55 → 1,67 schermate (−810 px)**.
- 21/09 — **UN METRO CHE NON GUARDA DENTRO PREMIA CHI NASCONDE.** Chiudendo Rosa e Bacheca i nodi sotto soglia di contrasto sono scesi da 49 a 17 — e **ventinove di quelli spariti erano difetti veri, non risolti**. Se ogni fisarmonica nuova fa scendere il numero, il numero smette di misurare la grafica e comincia a misurare quanto si nasconde. Rimedio: `__CPM_FIS_APERTE` (griglia mobile: `CPM_FIS=aperte`) fa nascere aperte tutte le sezioni, così la misura vede ciò che il giocatore vede quando apre.
- 21/09 — **I ventinove difetti veri, corretti alla sorgente.** Erano tre punti che non passavano da `legCol944`: il **voto della rosa** (`#d97706` su bianco, 3,19:1, 22 nodi), la **pillola del ruolo** (bianco su tinta piena, `#ffffff` su `#16a34a`, 3,30:1, 5 nodi) e la **fiducia dell'allenatore**. Il voto e la fiducia ora passano da `legCol944`; la pillola prende l'inchiostro da `inkSu945` (scelto per contrasto sulla tinta del ruolo). La **barra** della fiducia resta la tinta piena: non è testo. Misurato **con tutte le fisarmoniche aperte**, prima → dopo: **contrasto sotto soglia 49/2487 → 21/2545**, e il **Club passa a 0 su 236**.
- Non ancora nel metro: post-partita, partita (HUD/telecronaca), schermate cinematiche, il telefono vero del PO.
