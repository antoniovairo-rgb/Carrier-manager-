# Rapporto — giro 151 (PO-353 scie della partita 2D · PO-354 cronaca di zona)

Ramo `sviluppo/giro151-scie2d` da `lavoro/189` (0d4915e). Sorgenti toccati: `src/15-live-match.jsx` (Campo2D e `narra870`),
ricomposto con `tools/build-src.mjs` e verificato con `tools/check-src.mjs` (identico byte per byte). Nessun campo nuovo nel
salvataggio, `GAME_VERSION` non toccata, nessun `Math.random` nuovo.

Segnalazione: foto `docs/collaudo-po/188-partita2d-scie.png` (ramo `origin/poc/marioprada-character-system`), partita 2D su PC.

## PO-353 — la scia del pallone

**Cosa disegnava il Campo2D prima.** Due cose distinte:
1. una scia di **18 fotogrammi** (non di tempo): 0,3 s a 60 fps, quasi 2 s a 10 fps; si disegnava **sempre**, anche col
   pallone al piede di un giocatore; spessore fino a `r*0,52`;
2. col pallone in volo, una **linea tratteggiata** dal pallone al bersaglio del passaggio, attraverso mezzo campo.

**Misura prima** (sonda `partita2d-151`, braccio `__CPM_NO_G151S`, 4 partite vere a 2x, autoplay seminato; le età sono in
TEMPO DI SCENA, cioè la somma dei `dt` del disegno, tappati a 0,1 s):

| formato | età scia p50 / p95 / max | fotogrammi con scia e pallone NON in volo | tratteggiata (fotogrammi · max) | scie insieme |
|---|---|---|---|---|
| 360×800 | 0,64–0,67 / 1,70 / 1,70 s | 237 e 253 | 217–328 · 208–242 px | 2 |
| 1440×900 | 0,93–1,02 / 1,65–1,70 / 1,70 s | 178 e 203 | 155–291 · 448–483 px | 2 |

**Correzione (decisione PO-353, una regola).** I punti della scia portano il tempo di scena e vivono `SCIA151 = 0,35 s`; si
raccolgono solo con il pallone in volo (`poss.stato === "volo"`) e fuori dal volo la scia si svuota; spessore massimo `r*0,22`
(1,5 px al telefono, 2,5 px su PC). Un riaggancio della vista (salto oltre 22 punti, la stessa soglia con cui il pallino salta di
colpo) fa ripartire la scia: un salto non è un tragitto. La tratteggiata non si disegna più; il **cerchietto sul bersaglio resta**
(vedi domande aperte). Rosso `__CPM_NO_G151S` = la scia di prima, tratteggiata compresa.

**Misura dopo** (stessa sonda, stesse partite):

| formato | età scia p50 / p95 / max | scia col pallone non in volo | tratteggiata | scie insieme | lunghezza p50 / p95 / max |
|---|---|---|---|---|---|
| 360×800 | 0,10–0,20 / 0,34 / 0,35 s | 0 | 0 | 1 | 0 / 77–147 / 131–175 px |
| 1440×900 | 0,10–0,13 / 0,32–0,33 / 0,35 s | 0 | 0 | 1 | 36–87 / 118–373 / 119–521 px |

⚠️ **Le lunghezze in pixel sono gonfiate dallo strumento.** In headless il Campo2D gira a **3–9 fps** (misurato: 3,1 fps a
1440×900): ogni fotogramma vale 0,1 s di scena ma 0,2–0,3 s reali, e il pallone fra due fotogrammi fa molta più strada. Su un
dispositivo a 60 fps tempo di scena e tempo reale coincidono e la scia è lunga quanto il pallone percorre in 0,35 s. Non è
stata misurata su un dispositivo vero.

Foto (fotogramma in volo, stessa partita): `docs/sviluppo/giro151/prima-*.png` (tratteggiata dal pallone al cerchietto) e
`dopo-*.png` (solo il cerchietto). Le foto cadono su un momento coperto dal cartello «ASSIST!»: la differenza si vede ma la scia
corta, in un solo fotogramma headless, è poco leggibile — vale il numero, non la foto.

## PO-354 — «Tedesco (SIC) a tu per tu col portiere, conclude di prima!» col pallone a centrocampo

**Da dove viene la riga.** È di `narra870` (la sigla «(SIC)» è sua): al battito del minuto narra il fatto più importante fra
quelli dei **22 sotto-tick** del minuto. Il tiro può essere avvenuto fino a un minuto prima del battito (1,7 s a 1x).

**Misura prima** (braccio `__CPM_NO_G151C`, 4 partite intere): per ogni riga di zona si misura, nell'istante in cui esce, la
distanza in metri fra il pallone del motore e il tragitto del fatto (`from→to` del motore). Lontano = oltre 15 m.
**37 righe su 76 = 49%** (prima corsa di misura: 24/53, 45%). Esempi: tiro da (87,71) verso la porta, pallone già a (64,68) in
un altro volo; tiro dal limite e pallone già sulla bandierina (99,98) per l'angolo; tiro e pallone al cerchio di centrocampo
per il calcio d'inizio. Nel pallone reso il fatto era stato nella zona **0,4–0,8 s prima** (a 2x; a 1x il doppio): la riga
diceva al presente un'azione che il campo aveva già chiuso — il caso «non più», non «non ancora».
Le righe del ramo a tabella (`BG_MATCH`, `geo856`) non escono in queste partite e non sono misurate.

**Correzione (una regola, lettura pura dello stato del motore).** In `narra870`, un **tiro o un cross** il cui tragitto sta a più
di 15 m dal pallone del motore AL BATTITO scende in coda (priorità 0,5): la riga racconta ciò che il campo mostra ora. La
statistica del tiro (`ms.shots`/`oppShots`) passa alla riga scelta, così tiri, momentum e tabellino non perdono il conto, e la
riga non viene saltata dal raffreddamento quando porta un tiro. Se nel minuto non c'è altro da dire resta la riga di prima.
Rosso `__CPM_NO_G151C`.
⚠️ Il tiro trasportato si attribuisce alla squadra del tiratore (`chi.team`); prima la riga del tiro usava il possesso al
battito, che per un tiro già chiuso può essere passato all'altra squadra.

**Misura dopo:** **0 righe su 39** col pallone del motore lontano.

⚠️ **Cosa si giudica e perché.** Il guardiano giudica il pallone del MOTORE quando la riga esce, perché il Campo2D lo disegna
nel fotogramma successivo (richiamo di 62 ms, riaggancio oltre 22 punti). Il pallone RESO del primo fotogramma dopo la riga è
dichiarato accanto ma non giudicato: in headless fra due fotogrammi il motore compie fino a 8 sotto-tick e il pallone reso «salta»
di 30–74 unità (misurato, `sonda` del giro poi rimossa) — misura lo scheduler della sonda, non il gioco.

## Guardiano `npm run partita2d-151`

Partite vere (provino, autoplay seminato, 2x) a 360×800 e 1440×900, due nomi per formato, fino al fischio (115 s).
- **S**: età massima della scia < 0,5 s (parola del PO) · nessun fotogramma con scia e pallone non in volo · nessuna tratteggiata
  · almeno 20 fotogrammi in volo con la scia, altrimenti «non giudicato» = rosso.
- **C**: righe di zona (tiro, cross) col pallone del motore oltre 15 m ≤ **10%**, su almeno 8 righe (sotto = rosso). Soglia
  fissata dopo la misura (verde 0%, rosso 45–49%).
- Rossi: `__CPM_NO_G151S` deve far cadere S su ogni partita; `__CPM_NO_G151C` deve far cadere C. Verde e rossi stampati per ultimi.
- ⚠️ La prima corsa a 75 s è uscita «non giudicato» su 1440×900 (17 fotogrammi di scia < 20, a 3 fps): non si è abbassato il
  pavimento, si è allungata l'osservazione fino al fischio.

Esito finale: ✅ verde (S in 4/4, C 0/39) · ✅ rosso S 4/4 · ✅ rosso C 37/76 = 49%.

## Catena (un controllo alla volta, `free -m`/`df -h` prima di ognuno)

| controllo | esito |
|---|---|
| partita2d-151 | ✅ verde + due rossi cadono |
| partita2d-141 | ✅ 16 misure + partita vera; rossi 141/143 cadono |
| partita2d-297 | ✅ verde; rossi A/B/C cadono |
| spalti-109 | ✅ verde; rosso 21/21 |
| bg-sync | ❌ **CIECO** (21 righe, 0 coppie) — **identico sulla base 0d4915e**: preesistente |
| bg-continuity | ❌ **CIECO** (0 righe confrontabili) — **identico sulla base 0d4915e**: preesistente |
| bg-decision | ❌ **CIECO** (0 righe utili) — **identico sulla base 0d4915e**: preesistente |
| match-sequence | ✅ 1x contro 2x 81/81 = 100%, fischio 4/4 |
| partita-vera | ✅ 12 bande tenute, 2/2 partite finite |
| test:logic | ✅ 43/43 |
| save-compat | ✅ 12/12 |

I tre `bg-*` misurano la cronaca a tabella (`__CPM_BGSYNC` e affini), che col motore del possesso attivo non scrive più: non
possono dire nulla su questo giro, né in un verso né nell'altro. Non sono stati riparati (fuori ambito).

Il container è stato riavviato una volta a metà catena (bg-continuity interrotto): la corsa interrotta non è stata contata e
il controllo è stato rifatto da capo.

## Domande aperte per il PO

1. **Il cerchietto sul bersaglio del passaggio** resta (non è una scia, ma segna dove va la palla). Lo si vuole ancora?
2. **Lunghezza della scia.** La regola decisa è di TEMPO (0,35 s). Su un PC a 60 fps, un lancio lungo a 2x la rende di
   circa 20 unità di campo; se la si vuole corta anche nello spazio serve un tetto in raggi del pallino. Non misurato su
   dispositivo.
3. **Il tiro che non si racconta.** Con la correzione un tiro già chiuso al battito non ha la sua riga (resta nella statistica):
   si preferisce questo, oppure una riga al passato del tipo «Tiro di X, poi …»? La seconda resterebbe comunque una riga di
   zona col pallone altrove.
4. **Guardiani `bg-sync`, `bg-continuity`, `bg-decision` ciechi** sulla base: si riparano (misurando le righe di `narra870`) o
   si ritirano dalla catena?
