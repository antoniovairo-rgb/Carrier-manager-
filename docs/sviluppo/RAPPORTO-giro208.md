# Rapporto giro 208 — maxischermo dei rigori e maglie del pullman (PO-468 · PO-469)

Ramo `sviluppo/giro208-rigori-maglie`, partito da `lavoro/195` (contiene il giro 204). `GAME_VERSION` non toccata, roadmap non toccata
(le aggiorna chi rilascia). Rosso unico del giro: `window.__CPM_NO_G208`. Ogni numero qui sotto è **misurato** con la sonda o il guardiano
indicato; dove non lo è lo scrivo. Foto in `docs/sviluppo/giro208/` (telefono 375×812).

## 0. In breve

| Punto | Prima (rosso `__CPM_NO_G208` = giro 204) | Dopo | Guardiano |
|---|---|---|---|
| PO-468 — maxischermo nella lotteria | punteggio della **partita** («1 - 1») in 21/21 campioni, 0 pixel della scritta «RIGORI» | «RIGORI» + punteggio della **serie** in 21/21 campioni, sei punteggi disegnati 0-0 → 4-1 che seguono la serie, 1.136-1.170 pixel bianchi della scritta dietro il tabellone | `piazzato-204` |
| PO-469 — pantaloncini sul tetto del pullman | luminosità **0,890** (grigio chiaro) | **0,984**, uguale a prima del giro 204 (0,984) | `pullman-204` |
| PO-469 — calzettoni | 0,976 | 0,976 (prima del 204: 0,976) | `pullman-204` |
| PO-469 — maglia | lum 0,843 · sat 0,769 · tono 2,1° | lum 0,843 · sat 0,753 · tono 3,0° (invariata entro la soglia; dentro la soglia del 204) | `pullman-204` |

## 1. PO-468 — il maxischermo dice «RIGORI» e il punteggio della serie

### Misura prima
Sonda `sonda-90-204.mjs` estesa con il testimone nuovo **`__CPM_SB208`** (src/12: cosa ha disegnato il maxischermo — modo «rigori» o
«partita», punteggio, minuto) letto nello stesso istante dello stato vero della serie (`__CPM_SO_STATE`), dall'inizio alla fine della
serie, e coi pixel bianchi nella fascia del maxischermo dietro il tabellone «CALCI DI RIGORE» (tolto per un istante il tabellone DOM, come
il giro 204 fa col giallo del minuto). Partita della sonda: Salernum–Valmora, coppa, finita 1-1.
Col rosso (`__CPM_NO_G208`, cioè il comportamento del giro 204): maxischermo in modo «partita» 34/34 campioni, punteggio «1 - 1»,
0 pixel bianchi della scritta. Foto ritagliata del maxischermo: si legge «1 - 1» proprio dietro il tabellone della serie (foto
`prima-lotteria-telefono.png`).

### Correzione (`__CPM_NO_G208` la spegne)
- **src/15** — la scena 3D riceve, nella lotteria, anche il punteggio della serie: `shootout={kick, serie:{h,a}}`, orientato come
  `scoreHome/scoreAway` del maxischermo (H = la squadra dell'eroe a sinistra se gioca in casa, a destra se in trasferta).
- **src/12** — il maxischermo, se c'è la serie, disegna il punteggio della serie al posto di quello della partita e la scritta
  **«RIGORI»** sotto, nel posto del minuto, **in bianco** (il giallo resta il colore del minuto, così il controllo del giro 204 sul
  «90'» resta giudicabile coi suoi pixel gialli). Si ridisegna quando cambia il punteggio della serie, cioè a ogni tiro (al momento in cui
  il tabellone DOM mostra l'esito). Il minuto resta tolto (giro 204, invariato).
- La scena di **sola visione** del rigore già calciato (giro 204) **non è toccata**: lì non c'è una serie (vedi dubbio 1).

### Misura dopo
`piazzato-204` verde: «RIGORI» 21/21 campioni, punteggi disegnati 0-0 · 1-0 · 2-0 · 3-0 · 3-1 · 4-1, l'ultimo uguale all'ultimo della
serie (4-1), nessun punteggio disegnato che la serie non abbia avuto, minimo 1.136 pixel bianchi su 10 campioni fuori dagli stacchi.
Foto `dopo-lotteria-telefono.png`.

### Inciampo durante la misura (dichiarato)
Alla prima corsa del guardiano il verde è uscito rosso con «0 pixel bianchi»: la sonda fotografava uno campione su tre e uno è caduto
durante lo **stacco nero fra due rigori** (giro 191 B), dove il 3D è coperto. Non era il maxischermo. Correzione della **sonda**, non
della soglia: ora fotografa a ogni campione, segna se lo stacco è vivo (`[data-cpm=stacco191]`) e il bianco si giudica solo fuori dallo
stacco, con almeno 3 campioni. Il controllo del giallo del giro 204 resta un massimo su tutti i campioni (con più campioni è solo più
severo).

## 2. PO-469 — la correzione del colore vale solo per la maglia

### Misura prima
`pullman-204` esteso: oltre al busto (maglia) proietta per ogni corpo un punto a un quarto della coscia (pantaloncini) e a metà del
polpaccio (calzettoni), entrambe le gambe, e legge il pixel (mediana 3×3), 64-66 campioni per parte. Tre bracci sulla stessa parata
(FC Merseyside #dc2626, bianco #f5f5f5):
- prima del giro 204 (`__CPM_NO_G204`): pantaloncini lum **0,984** sat 0,008 · calzettoni 0,976 / 0,012;
- giro 204 (`__CPM_NO_G208`): pantaloncini lum **0,890** sat 0,035 · calzettoni 0,976 / 0,012.
Nel materiale: il colore scritto sui pantaloncini è `2c2c2c` col giro 204 contro `e8e8e8` prima.

### Correzione (src/16, `__CPM_NO_G208` la spegne)
`_kit204` scala in lineare solo il materiale `HyperShirt`; `HyperShorts` e `HyperSocks` non vengono più toccati (come prima del
giro 204). La costante `_KIT204` = 0,5 sulla maglia è invariata.

### Misura dopo
Pantaloncini 0,984 / 0,008 (identici a prima del 204), calzettoni 0,976 / 0,012, maglia lum 0,843 sat 0,753 tono 3,0° (giro 204:
0,843 · 0,769 · 2,1°). Foto `prima-parata-maglie.png` (giro 204), `dopo-parata-maglie.png`, e per confronto
`prima-del-204-parata-maglie.png`.

## 3. Guardiani aggiornati (nessuna soglia abbassata)
- **`piazzato-204`** — aggiunto il braccio della lotteria col rosso `__CPM_NO_G208`. **Soglia dichiarata (verde)**: almeno 10 campioni
  del testimone, tutti in modo «rigori», 0 in modo «partita», 0 punteggi disegnati fuori dalla serie, almeno 3 punteggi diversi
  disegnati, l'ultimo disegnato uguale all'ultimo della serie, almeno 300 pixel bianchi (misurato 1.136-1.170) su almeno 3 campioni fuori
  dagli stacchi. **Rosso**: 0 in modo «rigori», almeno 10 in modo «partita», meno di 100 pixel bianchi (misurato 0). Le verifiche del
  giro 204 (ramo «già calciato», minuto e pixel gialli) sono rimaste come erano.
- **`pullman-204`** — aggiunto il braccio `__CPM_NO_G208`. **Soglia dichiarata (verde)**: pantaloncini e calzettoni entro 0,05 in
  luminosità e saturazione da prima del giro 204 (almeno 12 campioni ciascuno); maglia entro 0,03 in luminosità e saturazione e 3° di
  tono dal giro 204 (e sempre dentro la soglia del 204). **Rosso**: pantaloncini oltre 0,05 in luminosità da prima del 204 (misurato
  0,094 di differenza). Le verifiche M e P del giro 204 sono rimaste come erano.
- `sonda-90-204.mjs`: opzione `rosso208` (`CPM_ROSSO208=1` da riga di comando), testimone `__CPM_SB208`, serie seguita fino alla fine,
  pixel bianchi, campioni sotto lo stacco segnati.
- `ci-runner.mjs` **non toccato**: i due guardiani c'erano già, nella stessa catena e nella stessa mappa (src/12 → entrambi, src/15 →
  piazzato, src/16 → pullman).

## 4. Controlli
Uno alla volta (`CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno, `CPM_CHROME=/opt/pw-browsers/chromium`), sul build finale
(`CARRIER-MANAGER-AV.html` 7.458.596 byte; dopo ogni modifica a `src/` `node tools/build-src.mjs` + `node tools/check-src.mjs`:
IDENTICO BYTE PER BYTE). Le modifiche successive alla prima build sono solo nelle sonde (`tests/visual`).

| controllo | esito |
|---|---|
| piazzato-204 | ✅ ramo «già calciato» verde + rosso visto; lotteria minuto 0/10, 0 px gialli (rosso 204: 10/10, 432 px); maxischermo verde «RIGORI» 21/21 + serie, rosso 208 partita 21/21 |
| pullman-204 | ✅ M verde + rosso 204 + rosso 208 (eseguita a sé, `CPM_SOLO=M`); P due casi verde 0/13 vuoti + 1 stacco, rosso 13/13 (eseguita a sé, `CPM_SOLO=P`) — stesso build, le due metà in due chiamate perché insieme superano i 10 minuti |
| lotteria-191 | ✅ verde PC + tre rossi visti |
| rigore-191 | ✅ verde produzione e banco, rosso visto |
| cerimonie-192 | ✅ punti A,B,C,D, ogni rosso si vede |
| cerimonie | ✅ |
| festa-3d | ✅ |
| riserva2d-205 | ✅ verde 36/36, rosso `__CPM_NO_G205` bocciato |
| tpose-196 | ✅ verde 4 scenari (0 T-pose, 0 corpi non CGTrader, 0 procedurali) + rosso `__CPM_NO_G196` visto — eseguito in sottofondo con attesa in primo piano (supera i 10 minuti) |
| career-critical | ✅ (exit 0; la prima corsa interrotta a 10 minuti non vale, rifatta da capo in sottofondo con attesa in primo piano) |
| test:logic | ✅ 51 pass · 0 fail |
| save-compat | ✅ PASS (exit 0) |

## 5. Dubbi per il PO
1. **Scena di sola visione del rigore già calciato (giro 204).** Lì non c'è una serie, quindi il maxischermo mostra ancora il punteggio
   della **partita** (senza minuto), che in trasparenza si legge dietro il racconto «⚽ CALCIO DI RIGORE». La decisione A parla della
   lotteria e non l'ho estesa. Alternative possibili: «RIGORE» senza punteggio, maxischermo spento, o lasciare così.
2. **«RIGORI» si legge in trasparenza dietro il tabellone DOM** (foto `dopo-lotteria-telefono.png`): ora il numero dietro e quello
   davanti coincidono (la serie), ma la scritta «RIGORI» del maxischermo si vede sotto/dietro il «1 — 0» del tabellone. Se disturba,
   le strade sono lo sfondo opaco del tabellone o spostare la scritta.
3. **La striscia in alto della partita** (fuori dal maxischermo, nel DOM) durante la lotteria mostra ancora «1 - 1» e «90'» (foto).
   Non era nella decisione e non l'ho toccata.
4. **Calzettoni**: sui corpi della parata misurati (CGTrader) non esiste un materiale `HyperSocks` separato — il calzettone sta nella
   texture della gamba — quindi la correzione del 204 non li toccava già (0,976 in tutti e tre i bracci). La parte del codice che li
   escludeva ora è tolta comunque, come chiesto; se un altro corpo avesse `HyperSocks`, torna come prima del 204. Non ho un corpo per
   misurarlo.
5. **«Uguali a prima del giro 204»** è misurato in pixel sullo stesso fotogramma di parata (luce ×4): i pantaloncini bianchi a 0,984
   sono di nuovo **quasi bruciati** come prima del 204 (che è ciò che è stato chiesto). Se si voleva un bianco «non bruciato» serve una
   correzione diversa solo per i pantaloncini.
6. **Lotteria in 2D** (`Riserva2D205`): non c'è maxischermo, non è toccata.
