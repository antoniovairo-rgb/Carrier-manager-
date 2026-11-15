# Rapporto giro 204 — piazzati e cerimonie (PO-450 · PO-451)

Ramo `sviluppo/giro204-piazzati-cerimonie`, partito da `lavoro/195` (contiene la 7.999.194). `GAME_VERSION` non toccata, roadmap non
toccata (le aggiorna chi rilascia). Rosso unico del giro: `window.__CPM_NO_G204`. Ogni numero qui sotto è **misurato** con la sonda o il
guardiano indicato; dove non lo è lo scrivo. Foto prima/dopo in `docs/sviluppo/giro204/` (telefono 375×812).

## 0. In breve

| Punto | Prima (rosso `__CPM_NO_G204`) | Dopo | Guardiano |
|---|---|---|---|
| PO-450 A — rigore già calciato dal motore | scena negata, calcio **mai visto** | scena di sola visione: stesso battitore, stesso esito, nessuna scelta, nessun secondo calcio | `piazzato-204` |
| PO-450 — «90'» dietro il punteggio della lotteria | minuto disegnato 10/10 campioni, **462-464 pixel gialli** nel rettangolo del tabellone | 0/10, **0 pixel** | `piazzato-204` |
| PO-451 — maglie sul tetto del pullman | luminosità **1,00** (bruciata), saturazione 0,459 (0,56× il club), tono +20,5° | luminosità **0,851** (club 0,863), saturazione 0,752 (0,91×), tono 2,6° | `pullman-204` |
| PO-451 — piedistallo vuoto dopo la presa | visibile vuoto in **13/13** fotogrammi dopo la presa (entrambi i casi) | **0/13**, uscito sotto uno stacco | `pullman-204` |

## 1. PO-450 — la scena «di sola visione» del rigore già calciato

### Come si provoca il ramo (prima non esercitato da nessun guardiano)
Nel gioco il ponte del giro 191 (`ponte191`, src/14) tiene il rigore sul dischetto finché la scena non si apre, quindi il caso «il motore
ha già calciato» non si presenta da solo (giro 191: mai nelle partite del lotto). Strumento di prova nuovo **`__CPM_PROVA_GIACALCIATO204`**
(src/14): spegne solo il ponte, lasciando acceso tutto il resto del giro 191. Sulla partita del giro 191 (`sonda-rigore-139`, «r187d-11»,
seme 12, K=1, produzione — il rigore fuori scena lo batte un compagno) il motore calcia al 59' (HOWARD, **parato**) e al 60' la scena
programmata trova il dischetto vuoto: il ramo `scena_negata191` si esercita (1 rigore negato).

### Misura prima
Rosso `__CPM_NO_G204` sullo stesso ramo: `59' rigore · 59' occasione_eroe* · 60' scena_negata191 · 60' battuta · 60' tiro` — un calcio
(bene) ma **nessuna scena**: il giocatore non vede nulla. Foto `prima-visione-telefono.png` (in gioco fluido c'è il campo dall'alto).

### Correzione (`__CPM_NO_G204` la spegne)
- **src/14** — `S._ultTiro191` porta anche il **nome** di chi ha calciato e la **destinazione** del tiro.
- **src/15** — nel ramo «già calciato» del rigore si apre `vis204` per 4,2 s: cronometro fermo (il battito non gira, come in una scena),
  taglio d'apertura e di chiusura (`setCutFx`), racconto in alto «⚽ CALCIO DI RIGORE · 59'» → «HOWARD sul dischetto…» → esito
  («GOOOL!/PARATO!/FUORI!/PALO!»). **Nessun pulsante**: la fase resta `playing`, la scheda del piazzato non si apre, `handleSetPiece` non
  gira (niente secondo calcio, niente gol in più: il gol, se c'è, l'ha già contato il motore). Durante la visione il campo dall'alto
  (7.917) cede il posto al 3D — **causa misurata del primo tentativo fallito**: il 3D in `playing` è sospeso (`__CPM_SOSP917`) e il
  testimone non scattava mai.
- **src/12** — il 3D rifà **quel** calcio con la resa già collaudata della lotteria (`P.shootout`, un solo rigore): battitore compagno
  (o eroe se nel motore ha calciato l'eroe), portiere sulla linea, tuffo, pallone verso il lato del motore (`to.y`), esito del motore
  (`goal`→in rete, `saved/blocked`→respinto, `wide`→fuori, `post`→**palo**, aggiunto: |z| 3,35). Camera della lotteria (dietro il
  rigorista, 7.999.58) presa di colpo e tenuta: in gioco fluido le passate della regia normale la portavano via (foto del primo tentativo:
  inquadratura laterale, portiere fuori quadro).
- Aggancio di sola prova `__CPM_VIS204_FORCE(esito)` (solo `?cpmtest=1`) per fotografare i quattro esiti.

### Misura dopo
`piazzato-204` verde: `60' HOWARD saved -> scena sì «PARATO!» · 3D compagno, pallone (47,3; 0,39; 2,28) · battute 1 · scene giocate 0`.
Con l'aggancio, i quattro esiti nel 3D: parato x 47,3 · gol x 48,8 · fuori |z| 5,1 · palo |z| 3,35. Foto `dopo-visione-rincorsa-telefono.png`
e `dopo-visione-esito-telefono.png` (corpi CH38 accesi).

### Lotteria: il «90'» dietro il punteggio
**Misura (sonda nuova `sonda-90-204.mjs`)**: nel DOM l'unico «90'» è nel tabellone in alto. Il «90'» in trasparenza è il **maxischermo 3D**
dello stadio dietro la porta (`_sbDraw`, src/12): dalla camera del rigorista cade esattamente dietro il «0 — 0» del tabellone «CALCI DI
RIGORE», che ha uno sfondo sfumato trasparente. Correzione (src/12): durante la lotteria il maxischermo non disegna il minuto.
Misura: testimone `__CPM_SB204` (ultimo minuto disegnato) e pixel del giallo del minuto nel rettangolo del tabellone, tolto per un istante
il tabellone DOM: rosso 10/10 campioni col minuto, 462-464 pixel; verde 0/10, 0 pixel. Foto `prima/dopo-lotteria-telefono.png`.

## 2. PO-451 — pullman e piedistallo

### Maglie sul tetto
**Misura prima** (`pullman-204` M: parata FC Merseyside #dc2626, corpi CGTrader, pixel al centro del busto — ossa spine_02/03 proiettate,
mediana 3×3 — 32-33 campioni su 5 scatti): luminosità **1,00**, saturazione **0,459** (club 0,827), tono **+20,5°** verso l'arancio. Stessa
causa della livrea del giro 192: la luce ×4 della parata (`LUCE178.parata`).
**Correzione** (src/16): il colore del kit (maglia, pantaloncini, calzettoni) si scrive in lineare e scalato (`_KIT204`), come la livrea.
Taratura misurata: k 0,2 → lum 0,40 · 0,25 → 0,48 · 0,3 (il valore della livrea) → 0,57 · 0,4 → 0,72 · **0,5 → 0,835-0,851** · 0,6 → 0,93
· 0,7 → 0,996 · 0,85 → 1,0. Scelto **0,5**: luminosità entro 0,03 dal club. La saturazione non supera 0,754 per nessun k (l'ombreggiatura
del corpo), cioè 0,91× il club.
**Soglia dichiarata** (verde): saturazione ≥ 0,85× quella del club, tono entro 12°, luminosità entro 0,15 da quella del club.
**Dopo**: luminosità 0,851 · saturazione 0,752 · tono 2,6°. Foto `prima/dopo-parata-maglie.png`.

### Piedistallo della coppa
**Misura prima** (testimone nuovo `__CPM_PED204`, src/12, per fotogramma: beat, presa completa, piedistallo visibile, stacco): dopo la
presa il piedistallo resta visibile vuoto in 13/13 fotogrammi misurati dei beat successivi, sia col capitano compagno (beat `pass`) sia con
l'eroe capitano (beat `lift`).
**Scelta e perché**: al primo beat dopo la presa (captain→pass, oppure present→lift se il capitano è l'eroe) la regia fa uno **stacco
breve** (0,3 s di nero, come fra un rigore e l'altro della lotteria) e **sotto lo stacco** il piedistallo esce di scena — come in tv, dove
il tavolo del trofeo lo portano via fuori inquadratura. Scartato il farlo sparire a vista (un oggetto che svanisce davanti alla camera) e
il farlo sprofondare/svanire (non c'è un meccanismo credibile su un prato). Se al cambio di beat la presa non è completa, il piedistallo
resta (la coppa è ancora lì).
**Dopo**: 0/13 fotogrammi col piedistallo vuoto, 1 stacco, in entrambi i casi; prima della presa la coppa aspetta sul piedistallo (40-81
fotogrammi). Foto `prima/dopo-piedistallo-*.png`.

## 3. Guardiani nuovi
- **`npm run piazzato-204`** — (1) ramo «già calciato» provocato con lo strumento di prova: almeno un rigore negato (altrimenti NON
  GIUDICATO = rosso), per ciascuno scena di sola visione in `playing`, esito scritto uguale al motore, 3D con lo stesso battitore e il
  pallone dove dice l'esito, una sola battuta del motore, nessuna scena giocata; rosso `__CPM_NO_G204`: nessuna visione. (2) Lotteria:
  verde 0 minuti disegnati e 0 pixel gialli; rosso ≥1 minuto e ≥100 pixel.
- **`npm run pullman-204`** — M (maglie, soglia sopra, verde e rosso) e P (piedistallo, due casi, verde e rosso). Usa l'aggancio già
  esistente `__CPM_CER_HOLD` (giro 77): in headless la premiazione si chiudeva a orologio di parete (17,5 s) prima che il tempo di scena
  arrivasse al beat dopo la presa — misurato: fase `ended` con la scena ancora in `captain`.
- `ci-runner.mjs`: entrambi in catena completa, fra i LENTI e nella mappa (src/12 → entrambi; src/14 → piazzato; src/15 → piazzato;
  src/16 → pullman). `node --check` verde.
- `sonda-rigore-139.mjs`: opzioni `CPM_PROVA204`, `CPM_ROSSO204`, e raccoglie testimoni e racconto della visione.

## 4. Controlli
CONTROLLI_QUI

## 5. Dubbi per il PO
1. **Solo il rigore.** La scena di sola visione copre il rigore. La **punizione** già calciata dal motore resta negata come nel giro 191
   (niente doppio calcio, ma non si vede): la resa della lotteria è un rigore dal dischetto e non va bene per una punizione. Da decidere
   se serve anche lì (servirebbe una scena di punizione non interattiva col battitore del motore).
2. **Il battitore nel 3D è «un compagno»**, non il corpo esatto del giocatore nominato dal motore: la resa della lotteria sceglie il primo
   compagno di movimento della fila. Il nome giusto è nel racconto («HOWARD sul dischetto…»); il numero di maglia sul corpo può non
   corrispondere.
3. **Il gol di rigore già calciato** è nel tabellone già prima che la visione lo mostri (il motore lo conta quando calcia, un battito prima).
   Non l'ho cambiato: toccherebbe il conteggio dei gol del motore.
4. **Dietro il racconto della visione e dietro il tabellone della lotteria** il maxischermo mostra ancora il **punteggio** della partita
   («0 - 0»), che in trasparenza si legge dietro la scritta in alto (foto `dopo-visione-*`). Ho tolto solo il minuto, come richiesto.
   Alternative: maxischermo con «RIGORI»/punteggio della serie, oppure sfondo del tabellone opaco.
5. **Piedistallo — altre strade sensate**: (a) lasciarlo (nelle premiazioni vere spesso il piedistallo resta sul palco); (b) un addetto
   o il mister lo porta via (serve un'animazione di trasporto); (c) la coppa consegnata a mano da una figura (il mister che c'è già) senza
   piedistallo. Ho scelto lo stacco perché non mostra nulla di impossibile e costa poco; lo stacco è un nero di 0,3 s nel mezzo della
   premiazione, da vedere sul telefono se disturba.
6. **«Come in campo»** per le maglie è misurato contro il **colore del club** (esadecimale), non contro un fotogramma della partita:
   non ho misurato il colore reso delle maglie in partita.
7. La scena di sola visione dura 4,2 s a orologio di parete; in headless il 3D arriva all'esito a 3,4-3,8 s (fotogrammi radi). Su un
   telefono molto lento il pallone potrebbe non arrivare in porta prima della chiusura: non misurato sul dispositivo.
