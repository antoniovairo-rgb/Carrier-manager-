# Rapporto di collaudo 3D — CPM 7.999.170

Ramo `collaudo/release-7.999.170-3d` · base `main` @ `12f46bd` (7.999.170) · data 16/10/2026.
Collaudo **solo di misura**: nessun file di `src/` né `CARRIER-MANAGER-AV.html` è stato toccato. Aggiunti solo strumenti in `tests/visual/collaudo-170-*.mjs`, dati e foto in `docs/collaudi/`.

## 1. Come ho misurato (e i limiti, detti subito)

- **7 partite vere complete** (p0–p6), tutte fino al fischio (90'/91'), dal salvataggio `save-190-s12-ovr93.json` (giornata 34 di 34), **GLB acceso** (`__CPM_GLB=true`; `__CPM_GLB_READY=true` e nessun `__CPM_GLB_FAIL` in tutte), **`__CPM_PRESENT=1`**, **pagina nuova per ogni partita**, nome diverso per ognuna (il seme nasce da avversario+stagione+settimana+nome), percorso utente vero «Vedi le formazioni» → «Ingresso in campo» → partita. Chromium headless 412×915, software-GL, velocità 2×, pilota automatico seeded.
- Strumenti: `collaudo-170-3d.mjs` (partita intera), `collaudo-170-ingresso.mjs` (ingresso con foto a istanti di *scena*), `collaudo-170-piazzato.mjs` (gol su rigore/punizione dell'eroe, GLB acceso), `collaudo-170-festa.mjs` (festa trofeo, GLB acceso), `collaudo-170-riepilogo.mjs` (lettura dei dati). Dati in `docs/collaudi/dati-170-3d/`, foto in `docs/collaudi/foto-release-170-3d/`.
- **Limiti che pesano sui giudizi:**
  1. Headless software-GL non è il telefono: il tempo-scena scorre a ~0,19× del reale in ingresso (38 s di scena = ~200 s reali, fotogrammi p50 233 ms). I numeri adimensionali (rapporti, quote di fotogrammi) valgono più dei tempi.
  2. Gira con `?cpmtest=1`; il freeze di lettura 5.47.12 è spento. L'ingresso è invece quello vero (`__CPM_WALKTEST74`).
  3. **Il pilota automatico non risponde alle schede del mister**: tutto ciò che riguarda quanto una scheda *resta aperta* (R01) è una misura con scheda non risposta. Dove conta lo dico.
  4. In `playing` il campo è la mappa 2D tattica; il 3D vale solo dentro gli `hl_*`. Le foto di ripartenza in `playing` sono quindi 2D.
  5. 1–2 fotogrammi per highlight **non provano il movimento**.
  6. Le 7 partite partono tutte da giornata 34/34: la cerimonia finale è quella del titolo («CAMPIONI!!» anche su pareggio o sconfitta) — non la giudico difetto, è l'effetto del salvataggio scelto.
  7. **p0 non ha dati d'ingresso** (hook `__CPM_WALK245` non armato nella prima stesura dello strumento): per l'ingresso valgono p1–p6 + la sonda dedicata.
- Zero `pageerror` in 7 partite e nelle 4 sonde. **Scritte tecniche (fps, `__CPM*`, undefined, NaN…) nel DOM: 0 occorrenze** a ogni polling (~350 ms) in tutte le fasi.

### Le partite

| # | Nome | Finale (casa–ospiti, come da `__CPM_SCORE`) | Gol | Highlight | Schede mister (min) | Tempo reale |
|---|---|---|---|---|---|---|
| p0 | Bruno Alvisi | 3–0 | 3 | 9 | 0 | 430 s |
| p1 | Carlo Benelli | 1–1 | 2 | 7 | 1 (75') | 337 s |
| p2 | Dino Cerri | 1–1 | 2 | 12 | 1 (47', rigore contro) | 340 s |
| p3 | Enzo Fabbri | 0–2 | 2 | 7 | 1 (67', fiato corto) | 326 s |
| p4 | Fabio Gentili | 2–0 | 2 | 8 | 0 | 326 s |
| p5 | Giorgio Landi | 1–0 | 1 | 5 | 1 (82', +1 di vantaggio) | 323 s |
| p6 | Hugo Manzi | 1–1 | 2 | 9 | 1 (70', sotto di un gol) | 338 s |

Totale: 14 gol, 57 highlight (inquadratura misurata su 57), 5 schede.

## 2. Tabella di gravità

| ID | Gravità | Rilievo | Evidenza |
|---|---|---|---|
| R01 | **ALTA** | **PO-260 non chiuso**: la scheda del mister resta aperta sopra gli highlight e sopra la cerimonia («Salta premiazione»). Su 5 schede: **5/5 attraversano almeno un highlight o il fischio**, **4/5 sono ancora aperte nella cerimonia**; p2 e p6 restano sopra 4 highlight. Con scheda aperta il cronometro **continua a correre** (p3: 70'→86' in 21 s; p2: 48'→90' in 62 s). *Caveat: autoplay non risponde.* | §3.3 · foto `R01-*` |
| R02 | MEDIA | **Eroe piccolo** nell'inquadratura degli highlight: altezza apparente mediana **0,057**, 0 highlight su 57 ≥ 0,15, max 0,111. Fuori quadro nel 18,5% dei fotogrammi; 11/57 highlight con ≥ 50% dei fotogrammi fuori | §3.2 · foto `R02-*` |
| R03 | MEDIA | **PO-237 non azzerato**: la prima partita resta un poco più scattosa (p50 133 vs 117 ms; fotogrammi >250 ms 41 vs 29). Divario molto ridotto rispetto alla 169 (1,14× contro 1,6×), ma è **una sola coppia di finestre** | §3.7 · `dati-170-3d/prima237.txt` |
| R04 | BASSA | **Ingresso**: i primi ~12 s di scena su 38 (32%) inquadrano solo stadio e cerchio centrale, senza calciatori; le squadre entrano in quadro a ~16 s | §3.5 · foto `R04-*` |
| R05 | BASSA | **Pallone**: 12 salti secchi non coperti da stacco nero su 55 registrati (169: 34 su 110); 11 sono voli d'arco, **1 non-arco**: p0 min 23, scena, **19,4 u** (hl_intro, sk 5). Registro troncato a 60/partita | §3.4 · foto `R05-*` |
| R06 | BASSA | **PO-261 (prima apertura vuota)**: ridotto — eroe sempre fuori nel primo highlight in 1 partita su 7 (p4: 4/4 fotogrammi; ma la foto mostra l'eroe a bordo quadro, non prato vuoto). 169: 5 su 10 | §3.1 · foto `R06-*` |

Nessun rilievo **bloccante**.

## 3. Esito per punto del compito

### 3.1 Highlight dell'eroe — apertura, posizione, pallone (R06, bassa; R02 media)

Testimone `__CPM_FRAME480`, 57 highlight, 751 fotogrammi. **Primo highlight** (fuori/fotogrammi): p0 1/8 · p1 2/11 · p2 0/10 · p3 1/9 · **p4 4/4** · p5 2/7 · p6 1/12. Nella 169 erano 5 partite su 10 con 10–14 fotogrammi su 12–15 fuori; ora 1 su 7, e nel caso p4 la foto (`R02-eroe-piccolo-p4-m9-a/b.jpg`) mostra l'eroe a destra, parzialmente in quadro, con avversari davanti. Nelle foto dei primi highlight di p0 e p5 (`R06-*`) l'eroe c'è, con cartellino nome, il pallone ai piedi o in arrivo. **Migliorato; PO-261 resta noto** ma non l'ho riprodotto come prato vuoto in nessuna foto.
Posizione dell'eroe a inizio scena (codice 002) e pallone ai piedi (001): nelle foto degli highlight il pallone è dove la scheda lo dice (tiro rasoterra, cross sul secondo palo, uno-due) in tutti i fotogrammi esaminati. **Non posso confermare** il sincronismo di movimento (2 fotogrammi per highlight).
Esiti coerenti col 3D: tabellone = ledger gol in tutte e 7 le partite; 14 gol, per sorgente nel libro mastro (`__CPM_EV`): 7 highlight, 6 cronaca, 1 set-piece. **Non posso confermare** esito narrato↔3D a occhio per ogni scena.

### 3.2 Eroe piccolo (R02, MEDIA)

Altezza apparente nell'ultimo fotogramma utile: **mediana 0,057** (169: 0,059), min 0,032, max 0,111, **nessun** highlight ≥ 0,15. Fuori quadro **139/751 = 18,5%** dei fotogrammi (169: 26,8%); highlight con ≥ 50% fuori **11/57 = 19%** (169: 20/65 = 31%). Pallone fuori quadro 191/751 = 25,4% (169: 24,7%). Quindi: **la mira è migliorata, la taglia no**. Riferimento CLAUDE.md (7.509): mediana 0,140 — il mio valore resta ~2,4× più basso; come per la 169, **non posso dire se sia regressione o differenza di strumento** (partite vere in headless, camera non a regime). Foto `R02-eroe-piccolo-*`.

### 3.3 Schede del mister — PO-259 / PO-260 (R01, ALTA)

**PO-259 (poche):** 5 schede in 7 partite, **max 1 a partita** (0,71 a partita; il rapporto giro 28 dichiara 0,90 contro 2,25 della 169). Nessuna scheda sui 3–0 (p0) e 2–0 (p4). Minuti: 47' (rigore contro, 0–1), 67' (fiato corto, 0–1), 70' (sotto di un gol), 75' (pari), 82' (+1 di vantaggio, quest'ultimo non è nell'elenco dei «momenti» del guardiano `schede-259`; non ho verificato se la regola lo preveda altrove). **Migliorato nettamente.**
**PO-260 (mai sopra un highlight o la cerimonia):** **non rispettato nella mia misura.** Cronologia (tempi reali di pagina, `docs/collaudi/dati-170-3d/p*.json` → `misterEp`/`mister`):
- p1: aperta 76', resta fino al fischio → **sopra la cerimonia** (`R01-…-cerimonia-p1-m75.jpg`: «CAMPIONI!!» con la scheda del 75' sopra «Salta premiazione»).
- p2: aperta all'inizio di `hl_intro` (rigore contro, 48'), resta **62 s** attraversando 4 highlight (48', 52', 58', 66') e la cerimonia (`R01-…-sopra-highlight-p2-m48.jpg`).
- p3: aperta in `playing` 70', attraversa un highlight (86') e si chiude prima del fischio (cerimonia pulita: `OK-cerimonia-senza-scheda-p3.jpg`).
- p5: aperta 82', attraversa `hl_intro/hl_result` (87') e la cerimonia.
- p6: vista per la prima volta in `hl_result` (75'), attraversa 4 highlight (75', 85', 87', 91') e la cerimonia (`R01-…-sopra-highlight-p6-m70.jpg`).
**Caveat onesto:** l'autoplay non risponde, quindi la scheda resta aperta più di quanto farebbe un giocatore che sceglie. Ma il rilievo non dipende dalla risposta: (a) in p2 e p6 la scheda **si apre già dentro/accanto a un highlight**; (b) la scheda **non si chiude** all'inizio di un highlight né al passaggio a `ceremony`; (c) con la scheda aperta il tempo di gioco prosegue. Il pilota in PO-226 «sceglie al battito», ma qui non ha scelto (non lo spiego). **Non posso confermare la causa nel codice**: non ho letto `src/` per questo rilievo.

### 3.4 Pallone (R05, BASSA)

0 campioni di highlight fuori dal rettangolo [-1,101] sui campioni letti. Salti `__CPM_BJ478` (≥ 6 u, registro max 60 per partita): 55 registrati, 43 coperti da stacco nero, **12 scoperti**: p0 `scena` 19,4 u (min 23, foto `R05-salto-pallone-scena-p0-m23-19u.jpg`: la scena è in `hl_intro` con la scheda scurita, il salto non si vede in una foto) + 4 archi (7–15 u), p1 2 archi, p3 2 archi, p5 3 archi (7–17,8 u). Attenzione alla trappola 7.360/7.478: fra due campioni può essere velocità × intervallo; qui il varco attribuisce la riassegnazione, ma **non so quanto si veda a 60 fps**. «Palla di nessuno» (>15 u da ogni calciatore in apertura): **0 casi** su 7 partite (169: 26 episodi, ma lo strumento allora sovrastimava con GLB).

### 3.5 Ingresso in campo — PO-245, bambini PO-236 (OK; R04 bassa)

- **Passo di camminata:** velocità massima di ogni squadra **1,82 u/s** (stessa per entrambe, in p1–p6; soglia del guardiano ≤ 2,3; passo della 169 fino a ~6,5 u/s), tutti al posto a fine ingresso (**0 calciatori a >1 u**), clip `walk` **100%** delle 16.830–16.874 letture, cadenza 0,86 (fra 0,7 e 1,8: niente piedi che pattinano).
- **Ingresso più lungo:** durata di scena **38,1 s** (`__CPM_WALKDUR245`). In headless equivalgono a ~200 s reali (0,19×): **su telefono non posso confermare il tempo percepito**.
- **Bambini per entrambe le squadre:** sonda dedicata **22 mascotte = 11 casa + 11 ospiti**; `bambini-236.mjs` (club, braccio verde): casa **1881/1881**, ospiti **1881/1881** con il loro calciatore disegnato. *Il guardiano è poi caduto con «Target page closed» nel braccio successivo (rosso, probabilmente il mio timeout di 290 s): il verde è completo, la prova del rosso in questo giro no.* Foto `OK-ingresso-scena-28s-bambini-e-squadre.jpg`: squadre in cammino con i bambini accanto, entrambe le divise (rossa e bianconera). Contesti Nazionale/Coppa non testati.
- **R04:** la scena d'apertura (volo di camera sul cerchio, stadio, tribune) non mostra calciatori fino a ~16 s di scena su 38 (`R04-ingresso-scena-04s/12s-senza-calciatori.jpg`). Come per la 169 non lo giudico difetto grave: è il volo d'apertura, ma ora che l'ingresso è più lungo pesa il 32% invece di meno.

### 3.6 Ripartenza dal centro dopo ogni gol (OK)

`__CPM_KO207`: **13 gol su 14** con la partita in corso hanno la ripartenza a **(50,50)** (`fine:'kickoff'`) dalla squadra che ha subito. Il 14° (p6, 91') è oltre il 90': la partita finisce, come in 169 (R06 di allora). **Novità della 170 — dopo rigore/punizione dell'eroe:** `collaudo-170-piazzato.mjs` (GLB acceso, scena vera con piazzato forzato dal motore): rigore al 14' → battuta dopo **11 passi** di palla ferma, **0 calciatori nella metà sbagliata**, palla (50,50), lato ospiti; punizione al 17' idem (`hold` 11, `fuori` 0). Il guardiano esistente `ripartenza-piazzato-27.mjs` conferma (verde e rosso). Foto: `OK-ripartenza-dopo-rigore-eroe-*.jpg`, `OK-ripartenza-dopo-punizione-eroe-*.jpg` (2D in `playing`: mostra le due squadre schierate nelle proprie metà). **Non posso confermare** a occhio il calcio d'inizio in 3D (in `playing` il campo è 2D).

### 3.7 Fluidità prima contro seconda partita — PO-237 (R03, MEDIA)

`prima-partita-237.mjs` (stessa pagina, GLB acceso, finestra 45 s, software-GL):

| | 1ª | 2ª | 169 (1ª / 2ª) |
|---|---|---|---|
| fotogrammi in 45 s | 158 | 173 | 142 / 288 |
| p50 / p95 | 133 / 700 ms | 117 / 583 ms | 133 / 500 · 83 / 200 |
| fotogrammi >250 ms | **41** | **29** | 39 / 8 |
| blocco più lungo | 7,7 s | 11,1 s | 12,5 s / 10,7 s |
| shader | 4,8 s | 8,2 s | 9,1 / 7,8 s |
| parsing GLB in partita | 4 ms | 0 | 0 / 0 |
Guardiano **verde**. Il divario p50 passa da 1,6× a 1,14× e il blocco più lungo della prima è ora *minore* della seconda: **migliorato**, ma con una sola coppia di finestre e la seconda stavolta più lenta della 169 (rumore del banco: non lo escludo). Il blocco dominante resta la compilazione shader. **Su telefono non posso confermarlo.**

### 3.8 Festa del trofeo — PO-251 (OK)

`collaudo-170-festa.mjs` (GLB acceso, festa aperta col varco `festa251` per Nazionale, campionato e coppa): in tutte e tre il pulsante «🎉 Festeggia» ha lo **sfondo oro** `linear-gradient(135deg, #ffe08a, #f5c542 45%, #c98a1a)`, testo scuro, niente verde (`rgb(52,211,153)`); rosso `__CPM_NO_ORO251` riconosciuto (la Nazionale torna verde). Foto `OK-festa-oro-nazionale/campionato/coppa.jpg`. Non ho giocato un trofeo vero: la festa è aperta col varco di collaudo.

### 3.9 Portiere

`gk-dive-sync-test.mjs` (GLB spento): **PASS**, anticipo della distesa mediano −0,05 s, peggiore −0,10 s. **GLB acceso in partita: non posso confermarlo.** `__CPM_DIVE465` dà 22–40 campioni a partita ma **un solo campione con distesa > 0,5** su 7 partite (p2: 3): nessun tuffo disteso campionato, come in 169. Serve ancora una sonda dedicata GLB-ON con camera sul portiere.

## 4. Confronto con la 169

| Punto | 169 | 170 | Esito |
|---|---|---|---|
| Primo highlight, eroe sempre fuori | 5 partite su 10 | 1 su 7 (e in foto c'è) | **migliorato** |
| Eroe fuori quadro (fotogrammi) | 26,8% | 18,5% | migliorato |
| Altezza apparente mediana | 0,059 | 0,057 | **invariato** (R02) |
| Schede del mister a partita | 2,25 (dato giro 28) | 0,71 | **migliorato** |
| Scheda sopra highlight/cerimonia | sì (R03) | **sì** (R01) | **non risolto** |
| Salti pallone scoperti | 34 su 110 (7 non-arco) | 12 su 55 (1 non-arco) | migliorato |
| «Palla di nessuno» | 26 episodi (limite superiore) | 0 | migliorato |
| Ripartenza dopo il gol | 21/21 | 13/13 in corso + piazzato 2/2 | OK |
| Passo d'ingresso | fino a ~6,5 u/s | 1,82 u/s, clip `walk` 100% | **migliorato** |
| Bambini per squadra | 1199/1199 casa e ospiti | 22 mascotte 11+11; 1881/1881 | OK |
| PO-237 p50 1ª vs 2ª | 133 vs 83 | 133 vs 117 | migliorato (1 misura) |
| Scritte tecniche | 0 | 0 | OK |
| pageerror | 0 | 0 | OK |

## 5. Cosa NON ho potuto confermare

1. Sincronismo pallone-corpo e coerenza esito↔3D scena per scena (movimento).
2. Tuffo, lato e tempo del portiere con GLB acceso.
3. Tempo percepito dell'ingresso e fluidità su GPU reale (headless a 0,19×).
4. Quanto R01 dipenda dall'autoplay che non risponde: va riprovato con un giocatore vero (basta una partita a mano: se la scheda, scelta o no, resta sopra l'highlight).
5. Il tempo-scena della ripartenza dopo piazzato a occhio in 3D (in `playing` il campo è 2D).
6. Contesti Nazionale e Coppa per ingresso e bambini; prova del rosso di `bambini-236` in questo giro.
7. Cause nel codice: non ho letto `src/` per nessun rilievo.

## 6. File

- Rapporto: `docs/collaudi/RAPPORTO-release-7.999.170-3d.md`
- Foto: `docs/collaudi/foto-release-170-3d/` (JPEG; prefisso `R0x-` = rilievo, `OK-` = prova positiva)
- Dati: `docs/collaudi/dati-170-3d/` (`p0..p6.json`, `prima237.txt`, `gkdive.txt`, `bambini.txt`)
- Strumenti: `tests/visual/collaudo-170-3d.mjs` (`CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers CPM_IDX=<0..9> node collaudo-170-3d.mjs`, una partita alla volta), `collaudo-170-ingresso.mjs`, `collaudo-170-piazzato.mjs`, `collaudo-170-festa.mjs`, `collaudo-170-riepilogo.mjs` (legge `out/collaudo-170/p<N>.json`).
