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
- Non ancora nel metro: post-partita, partita (HUD/telecronaca), schermate cinematiche, il telefono vero del PO.
