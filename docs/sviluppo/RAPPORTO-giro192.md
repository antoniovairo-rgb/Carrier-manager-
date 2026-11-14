# Rapporto giro 192 — cerimonie 3D (PO-402 · PO-404 · PO-406 · PO-407)

Ramo `sviluppo/giro192-cerimonie`, partito da `lavoro/194` (= 7.999.193). `GAME_VERSION` non toccato.
Foto del PO copiate in `docs/sviluppo/giro192/po/`; foto prima/dopo in `docs/sviluppo/giro192/` (`prima-*`, `dopo-*`,
telefono 375×812 e PC 1440×900). Tutte le misure sono headless con i corpi 3D accesi (`__CPM_GLB=true`).

## 1 · PO-402 «il mister durante la premiazione vola sull'erba, non cammina!» (ricaduta del 7.476.0)

**Misura prima** (sonda `misura-mister-192.mjs`, premiazione di coppa e coppa europea): velocità 3,2 u/s (un uomo alto 1,88 u:
11,5 km/h, passo di corsa), **slittamento** del piede d'appoggio 0,28–0,30 (il piede più fermo si muove col corpo per quasi un
terzo del suo spostamento; camminando dovrebbe stare a ~0), falcata a tempo fisso (7 rad/s) con le gambe tese, e il mister
entrava da 9 u di distanza dalla posizione di fine partita dell'eroe, quindi attraversava il campo per tutta la consegna.

**Perché è tornato / perché il controllo di allora non l'ha visto.** Non risulta una regressione del codice del 7.476: la
correzione di allora (cosce che oscillano mentre il corpo trasla) è ancora lì e funziona come scritta. Il difetto è che quella
correzione non bastava: il provino `ceremony-shot.mjs` del 7.476 misurava solo la velocità e la confrontava con un riferimento
sbagliato («un uomo cammina a ~3 u/s, corre a ~7»: in realtà si cammina a ~1,4), e nessuno misurava i piedi. Non c'era un
guardiano in catena. Le gambe che oscillano a tempo fisso mentre il corpo scorre a velocità da corsa producono esattamente
«vola sull'erba».

**Clip Rohr:** non adatte. Nessuna delle 28 clip di `cgtrader-clip-rohr.glb` è una camminata (`tools/rohr-180/clip-184.txt`), e
sono sullo scheletro CGTrader; il mister è `actor-presenter.glb` (Biped Rocketbox). Nemmeno `anim-walk.glb` (Mixamo/CH38) è
sullo stesso scheletro. Nessun asset nuovo.

**Correzione** (src/12, rosso `__CPM_NO_G192A`): passo da uomo 1,45 u/s; fase della falcata legata alla **distanza percorsa**
(ciclo 1,3 u): appoggio 60% col piede che arretra alla velocità del corpo, oscillazione 40% col ginocchio che si piega, caviglia
che compensa (pianta piatta), bacino che scende quando le gambe si aprono; il mister guarda dove va mentre cammina e torna a
guardare l'eroe da fermo; nella premiazione di squadra entra a pochi passi dal suo posto accanto al palco. I segni delle ossa del
Biped sono calibrati una volta sul corpo (non indovinati).

**Misura dopo:** velocità 1,45 · slittamento **0,014** (era 0,273) · verso 0,2° (era 8,5°). Provino `dopo-mister-filmstrip.jpg`.

## 2 · PO-404 «la coppa all'inizio non deve volare»

**Misura prima** (testimone nuovo `__CPM_G192B`: coppa e mani di eroe e capitano nello stesso fotogramma): la coppa partiva dal
centro del podio e **volava 2,7 u** fino alle mani dell'**eroe** (ultimo 40% del beat `present`), poi al 25% del beat `captain`
**saltava in un fotogramma** (1,35 u) alle mani del capitano, e solo dopo tornava all'eroe col passaggio del giro 47. Volo libero
totale su present+captain: 2,99–3,03 u.

**Correzione** (src/12, rosso `__CPM_NO_G192B`): la coppa aspetta ferma su un **piedistallo** mezzo metro davanti a chi la
ritira (la prima stesura la appoggiava sul bordo del palco: misurato, restava a 1,7 u dalle mani perché la regola del 191 tiene
i corpi fuori dal gradino); il capitano la prende quando le sue mani sono a portata (0,75 u), poi il passaggio capitano→eroe
resta quello del giro 47. **Eroe capitano** (`player.isCaptain`, passato a `ThreeMatchView` come `heroCaptain`): nessun altro
capitano, niente beat `pass`, l'eroe la prende lui dal piedistallo e la tiene fino alla fine; le braccia restano giù finché non
l'ha presa.

**Misura dopo:** volo libero 0,29 u (eroe capitano 0,31), nessun salto oltre 0,17 u fuori dalle mani; rosso 2,99–3,01 u.

## 3 · PO-406 serata di presentazione

**Postura e braccio.** Misura prima (sonda `misura-pres-192.mjs`, tutta la fila): pendenza collo→spalla **−33/−37°** contro
−21° della posa di riferimento (stesso corpo con la clip idle e la stessa correzione di postura); gomiti a **116–140°** con le mani
13–25 cm davanti al corpo. Correzione (src/16, `_posa192`, rosso `__CPM_NO_G192C`), dopo clip, vita e spalle-146: clavicola che
riporta la spalla a −22°, braccio che non saluta lungo il fianco (gomito ~165°), piccole differenze per uomo; il braccio del
saluto (giro 144) non si tocca. Misura dopo: spalle −22°, gomiti 164–171°, mano 6–11 cm davanti alla spalla.

**Tifosi.** Nelle foto del PO (telefono) gli spalti mostrano le **sedute** ma **nessuna persona**. In headless la stessa scena ha
13.433 tifosi della folla a sagome (giro 129), che è un secondo strato (istanze con uno shader proprio): **la causa sul telefono
non l'ho riprodotta e non posso confermarla**. Quello che le foto dimostrano è che sul telefono la tela degli spalti si disegna e lo
strato a istanze no. La serata ora usa la folla **dipinta nella tela** (la via di prima del giro 129, la stessa che disegna le
sedute): 4.681 tifosi dipinti, nessuna istanza. Va confermato sul telefono.

## 4 · PO-407 parata sul pullman

**Colore del pullman.** Misura prima (pixel della fiancata, FC Merseyside #dc2626): saturazione 0,57 contro 0,83 del colore del
club, luminosità 1,0 (bruciata), tono spostato di 18° verso l'arancio. Causa: la parata moltiplica le luci ×4 (`LUCE178.parata`,
tarato sulla luminanza media della scena) e la livrea, la superficie più grande e più illuminata, va oltre il bianco dove ACES la
sbianca. Correzione (src/16, rosso `__CPM_NO_G192D`): la livrea (cassa, fascia bassa, montanti) si scrive già in lineare e scalata
per la luce che riceve. Dopo: saturazione 0,79 (96% del club), tono 4,8°.

**Coppa e braccia.** Prima: l'eroe usava la clip `throwin` (la rimessa laterale) all'apice — mani dietro la testa — e la coppa,
agganciata ai manici senza regola del volto, copriva il viso (0,17 u di viso coperto). Correzione: l'eroe sul tetto usa la **stessa
posa del podio** (`mx-victory` al 45%, misurata nel giro 191) e la **stessa regola di presa**, ora una funzione sola
`presaCoppa192` (src/11) usata dal podio (src/12, comportamento identico) e dalla parata; la coppa della parata ha la proporzione
del podio (0,31× l'eroe invece di 0,40×: a 0,40 per non coprire il viso doveva salire 0,24 sopra le mani). Dopo: viso coperto 0,
mani 0,30 sopra la testa, presa 0,13, gomiti 178°. Provini `prima/dopo-parata-eroe-*.jpg`.

## Guardiano nuovo `npm run cerimonie-192` (un controllo per punto, verde e rosso nella stessa corsa)

| punto | verde | rosso |
|---|---|---|
| A mister | vel 1,45 · slitt 0,014 · verso 0,2° | `__CPM_NO_G192A`: vel 3,2 · slitt 0,273 |
| B coppa | volo 0,29 · salto 0,14 · eroe capitano 0,31 senza passaggio | `__CPM_NO_G192B`: volo 2,99 · salto 1,37 |
| C presentazione | 4.681 tifosi dipinti · spalle −22° · gomiti 166,5° | `__CPM_NO_G192C`: 0 dipinti · −34,4° · 129,9° |
| D parata | sat 0,79/0,83 · tono 4,8° · viso 0 · presa 0,13 | `__CPM_NO_G192D`: sat 0,57 · tono 18,1° · viso 0,17 |

## Peso e fotogrammi al secondo

Sonda `prestazioni-192.mjs`: telefono 375×812, CPU rallentata ×4 (CDP), headless con rendering software; «prima» = i quattro rossi
accesi, «dopo» = verde. Gli fps headless confrontano i due bracci, non sono gli fps del telefono (che non posso misurare da qui).

| scena | fps prima | fps dopo | byte scaricati prima | dopo |
|---|---|---|---|---|
| premiazione di coppa | 5,8 | 5,9 | — | — |
| serata di presentazione | 2,9 | **6,9** | 16.653 KB | 16.535 KB |
| parata | 5,0 | 4,7 | 33.920 KB | 33.920 KB |

La presentazione raddoppia gli fps perché non disegna più le 13.433 istanze della folla a sagome. La parata −0,3 fps è dentro
la variabilità che ho visto fra le corse (non l'ho ripetuta abbastanza per dirlo con certezza); scarica un file in più
(`cgtrader-clip-po.glb`, 638 KB) che nella misura risulta già in cache (stessi byte). Peso del gioco: `CARRIER-MANAGER-AV.html`
7.328.771 → 7.351.411 byte (+22,6 KB, codice e commenti).

## Controlli

Uno alla volta (`CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno, `CPM_CHROME=/opt/pw-browsers/chromium`), dopo ogni
modifica a `src/` `node tools/build-src.mjs` + `node tools/check-src.mjs`.

| controllo | esito |
|---|---|
| cerimonie-192 (A,B,C,D) | ✅ verde, ogni rosso si vede |
| premiazione-palco-191 | ✅ |
| coppa-mani-191 | ✅ (scarto 0,08, faccia 0) |
| posa-sollevamento-191 | ✅ |
| palco-corpi-191 | ✅ |
| presentazione-200 | ✅ |
| cerimonie | ✅ |
| festa-3d | ✅ |
| griglia-mobile | ✅ (14 schermate × 5 larghezze; le foto rigenerate in `docs/collaudo-grafico/g0` non le ho committate) |
| highlight-95 | ESITO_H95 |
| test:logic | ✅ |
| save-compat | ✅ 12 pass · 0 fail |

## Dubbi e cose aperte (per il PO)

- **Tifosi della presentazione:** la causa sul telefono (strato a istanze invisibile) non è riprodotta in headless; la correzione
  lo aggira. Se in partita sul telefono la folla a sagome si vede, la differenza fra le due scene resta da capire.
- **Maglie sul tetto del pullman:** anche le maglie dei corpi in parata risultano più chiare del colore del club (stessa luce ×4);
  non era nella richiesta e non l'ho toccato.
- **Coppa della parata** un po' più piccola (proporzione del podio). Scelta mia per tenere viso libero e mani sui manici.
- Il **piedistallo** della coppa è un elemento nuovo della scena (procedurale, nessun asset): resta in scena vuoto dopo la presa.
- Le misure di fps sono headless (rendering software, CPU ×4): confrontano i due bracci, non sono gli fps del telefono.
