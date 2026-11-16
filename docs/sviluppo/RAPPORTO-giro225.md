# Rapporto giro 225 — PO-489, serata di presentazione 3D

Ramo `sviluppo/giro225-presentazione`, partito da `lavoro/196`. `GAME_VERSION` non toccata (nel sorgente vale `7.999.195`; la
consegna parla di 7.999.196: segnalo la differenza, non la correggo).
Rosso unico: `window.__CPM_NO_G225` (rimette la serata com'era nella 7.999.195, tutti e cinque i punti).
Foto del PO: `docs/sviluppo/giro225/po-195-presentazione.jpg`. Foto prima/dopo: `docs/sviluppo/giro225/prima-*.jpg` e `dopo-*.jpg`
(telefono 375×812 e PC 1280×720). Rapporti letti: giri 192, 196, 200, 206, 212.

**Tutte le misure sono headless (rendering software), sulla stessa macchina, verde contro rosso. Non sono misure del telefono del PO.**
Il collaudo sul telefono resta da fare (vedi «Dubbi per il PO»).

Il PO: «I tifosi non si vedono come nella partita 3D, i colori della pelle e dei capelli non sono coerenti con le relative
figurine. Quando ritornano in fila volano ed il movimento del braccio nel saluto non è naturale».

---

## Strumenti

- `tests/visual/misura-225.mjs` — sonda di misura (foto ai battiti 0, 1 e 3; quota dei piedi e geometria del braccio nel tempo).
- `tests/visual/presentazione-225.mjs` — guardiano nuovo (`npm run presentazione-225`): braccio verde, braccio rosso
  (`__CPM_NO_G225`), braccio «ripiego» (`__CPM_G225_NODRAW`, vedi punto 1). Salvataggio di prova
  `fixtures/save-190-s12-ovr93.json` (FC Merseyside, come nella foto del PO). Ogni numero è letto dalla scena: ossa, materiali,
  raggi, pixel del fotogramma, immagine della figurina nel DOM.
- Nel gioco, solo sotto `?cpmtest=1`: testimone `__CPM_PRES225` e la funzione di sola lettura `misuraBraccio225`.

---

## 1 · Tifosi

**Misura prima.** Sugli spalti della serata c'erano 4.681 tifosi **dipinti** nella tela delle gradinate e nessuna sagoma; in
partita gli spalti hanno la folla a sagome del giro 129 (`buildFolla129`: istanze con le 32 figure × 4 pose, colori del club,
animate dallo shader). La differenza è voluta dal giro 192 (PO-406): sul telefono del PO la serata mostrava le sedute senza
persone, la causa non fu riprodotta e la serata passò alla folla dipinta.

**Correzione** (`src/16`). La serata usa di nuovo **lo stesso costruttore della partita** (stesse figure, stessa densità «vera»,
stessi colori del club): 13.433 sagome nello stadio del Merseyside. Il tick della serata muove lo stesso shader (tempo; applauso
mentre il chiamato saluta). Due aggiunte:

- **Prova di disegno.** Al terzo fotogramma lo strato delle sagome viene disegnato da solo su una tela 64×64 e si contano i pixel
  lasciati. Se sono zero — cioè il caso «sedute senza persone» del giro 192 — lo stadio si ricostruisce con la folla dipinta. Il
  braccio «ripiego» del guardiano simula il caso (`__CPM_G225_NODRAW`): 0 pixel → 4.681 tifosi dipinti, 0 sagome.
- **Resa.** La serata moltiplica le luci (guadagno 2,3 del giro 178) e la partita di notte scurisce gli spalti (giro 206): senza
  correzione le sagome uscivano bruciate (luminanza degli spalti 0,38–0,46 contro 0,32 della partita di notte). Il colore del
  materiale della folla è moltiplicato per 0,5 (`K_FOLLA225`).

**Misura dopo** (luminanza degli spalti per zone, stessa camera fissa «tribuna» del giro 206, stesso salvataggio):

| | sagome in scena | tifosi dipinti | luminanza degli spalti |
|---|---|---|---|
| partita di notte (riferimento) | — | — | 0,319 |
| serata, prima (rosso) | 0 | 4.681 | 0,177 |
| serata, dopo (verde) | 13.433 | 0 | 0,338 (×1,06 della partita) |
| serata, ripiego | 0 | 4.681 | — |

Attenzione: la partita di riferimento del salvataggio di prova è **in trasferta** (altro stadio, tifo di altri colori): il
confronto di luminanza è fra due stadi diversi, per questo la tolleranza del guardiano è larga (±35%).
Foto: `prima-tel-b1.jpg` / `dopo-tel-b1.jpg`, `prima-spalti.jpg` / `dopo-spalti.jpg` / `partita-spalti.jpg`, `ripiego-tel-b1.jpg`.

## 2 · Pelle e capelli

**Misura prima.** Il corpo CGTrader ha **una sola carnagione** (la texture del modello: mediana dei pixel di pelle 208,143,113) e
quattro teste (capelli neri, castani, biondi, ramati). Nella serata i capelli venivano dal seme «club + posto in fila», cioè non
dalla persona chiamata: sui sei chiamati del salvataggio di prova **4 capelli su 6 sbagliati** (es. figurina «rossi», testa bionda;
figurine «neri», teste castane e ramate) e la pelle uguale per tutti.

**Da dove viene la figurina.** `voltoId23('giocatore', nome)` sceglie il ritratto; l'indice (`assets/portraits/ai/indice.json`)
porta per ogni ritratto la classe dei capelli `h` e la classe di carnagione `k`. La classe `k` viene dal testo con cui il ritratto
fu chiesto, non dal ritratto: dentro la stessa classe i visi differiscono molto (deviazione 9–21 livelli per canale; un ritratto
«scura» può essere più chiaro di uno «ambrata»). Per questo ho **misurato la carnagione su ogni ritratto** (mediana dei pixel del
riquadro del viso, x 40–60%, y 36–50%): `tools/ritratti/pelle-225.py` → `tools/ritratti/pelle-225.json` → campo nuovo `p`
dell'indice (`tools/ritratti/indice-volti.mjs` lo aggiunge; gli altri campi dell'indice sono identici a prima, verificato;
l'indice passa da 69 a 82 KB). Nessun asset nuovo: è un dato ricavato dai ritratti già nel repo.

**Correzione** (`src/16`, `src/18`). Ogni posto della fila sa chi lo occupa (`nomi`: i chiamati nell'ordine dei battiti, l'eroe per
ultimo — le stesse chiavi della targhetta). Per ognuno:

- **capelli**: la classe `h` della sua figurina decide la testa (neri→black, castani→brown, biondi→blond, rossi→auburn);
- **pelle**: i materiali di pelle del corpo (braccia, gambe, testa) moltiplicano i soli pixel di pelle (saturi e caldi: calzettoni,
  scarpe, occhi e denti restano) per portare il colore al `p` del ritratto, con una compensazione delle luci della serata
  (`RESA225`): senza compensazione il viso **reso** restava a 11–20 dal viso della figurina anche col colore di base identico,
  perché le luci della serata schiariscono e sbiadiscono.

L'indice dei volti si carica prima dei corpi (attesa massima 4 s; oltre, i corpi restano come prima).

**Misura dopo** (viso della figurina campionato dall'immagine della targhetta; viso reso = mediana dei pixel di pelle del viso nel
fotogramma, a chiamato fermo davanti alla camera; distanza CIE76):

| chiamato | figurina (classe, capelli) | viso figurina | reso prima → distanza | reso dopo → distanza | capelli 3D prima → dopo |
|---|---|---|---|---|---|
| Dylan Gray | 706 (a, neri) | 231,160,112 | 221,169,145 → 16,7 | 232,174,126 → 7,3 | brown → black |
| Rupert Hammond | 162 (c, rossi) | 198,142,119 | 216,164,138 → 8,1 | 214,152,123 → 5,9 | blond → auburn |
| Max Stanley | 299 (o, neri) | 209,140,103 | 217,161,139 → 13,4 | 212,143,101 → 2,7 | brown → black |
| Isaac Hughes | 993 (a, neri) | 197,125,87 | 221,167,144 → 20,0 | 213,135,90 → 6,2 | brown → black |
| Gary Howard | 271 (c, neri) | 217,160,132 | 215,161,137 → 2,7 | 224,173,142 → 5,1 | auburn → black |
| eroe (n. 77) | 9 (c, neri) | 225,172,141 | 215,160,139 → 6,4 | 223,178,145 → 3,8 | black → black |

Soglia del guardiano: viso reso entro **12** dal viso della figurina (dopo: massimo 7,3; prima: massimo 20,0) e **nessuno scarto**
sulla classe dei capelli. Foto: `prima-tel-b2.jpg` / `dopo-tel-b2.jpg`, `prima-tel-b7.jpg` / `dopo-tel-b7.jpg`.

**Limiti dichiarati.** Il corpo CGTrader non ha teste rasate, barbe, capelli lunghi: una figurina rasata resta con la testa dai
capelli corti del colore giusto. La correzione vale **solo per la serata**: in partita i corpi CGTrader hanno ancora tutti la
stessa pelle e i capelli dal seme (vedi Dubbi).

## 3 · «Volano» quando tornano in fila

**Misura prima.** Quota della punta più bassa di ogni corpo per tutta la scena: **2,6 cm, costante** (2,8 l'eroe). I piedi non si
staccano dal prato. Quello che si vede è un'altra cosa: il chiamato **trasla di 4,4 u in avanti in circa 0,9 s e di 4,4 u indietro
a gambe ferme**, senza un passo. Slittamento (spostamento del piede d'appoggio diviso spostamento del corpo): **1,00** — il piede
si muove quanto il corpo.

**Correzione** (`src/16`). Il chiamato **cammina**: clip `walk` già nel pacchetto del corpo
(`assets/cgtrader-review-lod1-kit-adapter.glb`, nessun file nuovo), tenuta in pausa; il tempo della clip lo decide la **distanza
percorsa** (lunghezza del ciclo misurata sulla clip: quanto arretra il piede d'appoggio, 1,9–2,3 u secondo la corporatura), in
avanti e all'indietro; la clip entra ed esce in dissolvenza; a ogni fotogramma il corpo si appoggia (il punto più basso fra punte e
caviglie alla sua quota di riposo); le braccia oscillano opposte alle gambe. Il passo avanti è **un ciclo di cammino** (due passi,
circa 2,1 u invece di 4,4) e il ritorno sono due passi all'indietro, senza voltare le spalle alla tribuna, a braccio già abbassato.

**Misura dopo:**

| | punta più bassa (min…max, 7 corpi) | percorso del chiamato | slittamento |
|---|---|---|---|
| prima (rosso) | 0,026…0,028 | 7,94 u (4,4 avanti) | **1,00** |
| dopo (verde) | −0,002…0,028 | 4,27 u (2,14 avanti) | **0,16** |

Soglie del guardiano: punta più bassa fra −3 e +5 cm per ogni corpo per tutta la scena (è la soglia chiesta: nessun corpo sopra
5 cm; non c'è nessun salto voluto nella scena); slittamento ≤ 0,35. Foto: `prima/dopo-tel-b3-passo.jpg`, `…-ritorno.jpg`.

## 4 · Saluto

**Misura prima** (ossa in spazio mondo, tempo di scena):

- il braccio **scatta**: velocità angolare massima 975 °/s l'omero e 1.060 °/s l'avambraccio (fra il fotogramma «a riposo» e il
  primo del saluto il braccio salta di decine di gradi, e lo stesso alla fine);
- il gomito ruota **fuori dalla sua cerniera** di 46–72° durante il saluto (l'asse della cerniera è misurato sulla clip `running`
  del pacchetto: un gomito piega intorno a un asse solo);
- omero a 126° dalla verticale (36° sopra l'orizzontale), mano 41 cm sopra la spalla.

**Clip.** Nel repo non c'è una clip di saluto. Le clip Rohr (licenza registrata, giro 184) hanno applausi e braccia alzate ma
**sono escluse dal pacchetto di rilascio** per regola (`tools/validate-dist.mjs`: «clip Rohr non collegate fuori dal pacchetto»):
usarle vuol dire cambiare quella regola e aggiungere 1,8 MB al download. Non l'ho fatto: ho corretto la posa (vedi Dubbi).

**Correzione** (`src/16`, `_saluto225`). Il saluto parte dalla posa a riposo già scritta (nessun salto) e ci ritorna; omero di
lato-avanti poco sopra l'orizzontale, avambraccio verticale; il gomito piega **solo intorno alla sua cerniera**; l'ondeggio (1,25
Hz, ±21°) è flesso-estensione del gomito nel piano frontale; palmo verso la tribuna; il polso segue in ritardo di pochi gradi.
Tempi: su in 0,85 s, saluto, giù in 0,85 s, poi i passi indietro.

**Misura dopo:**

| | prima (rosso) | dopo (verde) | limite dichiarato |
|---|---|---|---|
| gomito (angolo interno) | 111–167° | 84–175° | ≥ 40° |
| omero dalla verticale | fino a 126° | fino a 97° | ≤ 150° |
| gomito fuori dalla cerniera, a saluto in corso | **46–72°** | 0–7° | ≤ 25° |
| polso | 10–15° | 7–14° | ≤ 70° |
| mano dal piano mediano del corpo | 28–69 cm | 29–59 cm | ≥ 5 cm (mai oltre il centro) |
| mano e gomito dall'asse del busto | ≥ 28 cm | ≥ 28 cm | ≥ 12 cm (mai dentro il corpo) |
| velocità massima omero / avambraccio | **975 / 1.060 °/s** | 284 / 560 °/s | ≤ 750 °/s |
| mano sopra la spalla (≥ 15 cm) | 2,7 s | 1,7 s | ≥ 1,5 s |

Il braccio non attraversava il corpo nemmeno prima (mano sempre dal suo lato): i difetti misurati erano lo scatto e la rotazione del
gomito fuori asse. Foto: `prima/dopo-tel-b3-saluto.jpg`.

## 5 · Fascia grigia in basso

**Cos'è.** Al battito 0 la camera della panoramica sta a quota 40 e raggio 92, cioè **sopra e dietro la tribuna**: la parte bassa
del quadro guarda il campo **attraverso il tetto della tribuna**, che è semitrasparente (opacità 0,8) — più le travi sotto. Non è
un velo dell'interfaccia. Misura: raggi della camera che vanno al prato e incontrano prima una struttura in quota:
**273 su 654 (telefono), 215 su 581 (PC)**, tutti sul materiale «trasparente 0,8, quota 25».

**Correzione** (`src/16`). La panoramica gira a raggio 72 (il bordo basso del quadro cade sul prato, non sulla tribuna); in più,
coperture e travi si nascondono finché stanno fra la camera e il prato (vale anche per stadi di altre dimensioni).
**Dopo: 0 raggi coperti** su 913 (telefono) e 829 (PC). Foto: `prima/dopo-tel-b0.jpg`, `prima/dopo-pc-b0.jpg`.

---

## Guardiano `presentazione-225`

Verde + rosso + ripiego nello stesso comando; nel rosso devono vedersi tutti e cinque i difetti (A tifo, B pelle e capelli,
C cammino, D saluto, E fascia), altrimenti il guardiano è rosso. «Non giudicato» è rosso. In `ci-runner.mjs` sta una sola volta
nelle catene `completa` e `carriera` (`node --check` verde; nessun doppione nelle catene).

`cerimonie-192` (blocco C): contava i soli tifosi dipinti (≥ 1000). Ora conta i tifosi dei due strati (dipinti + sagome), stessa
soglia; il rosso `__CPM_NO_G192C` è invariato. Il ripiego «folla dipinta» è provato da `presentazione-225`.

## Controlli (uno alla volta, `CPM_CI_PAR=0`)

CONTROLLI_QUI

## File toccati

`src/16-scene-3d-cerimonie.jsx` (tutta la correzione), `src/18-career-app.jsx` (una riga: i nomi della fila alla scena 3D),
`assets/portraits/ai/indice.json` (campo `p`), `tools/ritratti/pelle-225.py`, `tools/ritratti/pelle-225.json`,
`tools/ritratti/indice-volti.mjs`, `tests/visual/presentazione-225.mjs`, `tests/visual/misura-225.mjs`,
`tests/visual/cerimonie-192.mjs`, `tests/visual/ci-runner.mjs`, `tests/visual/package.json`, `CARRIER-MANAGER-AV.html` (ricomposto).

---

## Dubbi per il PO

1. **Telefono.** Nel giro 192 la folla a sagome sul telefono del PO non si vedeva nella serata e la causa non è mai stata trovata;
   non l'ho riprodotta nemmeno io. Ho rimesso le sagome perché la richiesta è «come in partita», con la prova di disegno che
   ripiega sulla folla dipinta. Non posso confermare che sul telefono la prova di disegno riconosca il difetto: lo riconosce se lo
   strato non lascia pixel, che è ciò che mostravano le foto del 192. Se sul telefono si rivedono sedute vuote, la prova non basta.
2. **«Volano».** I piedi non si staccavano dal prato (2,6 cm fissi): ho letto «volano» come «scivolano senza camminare» e ho
   corretto quello. Se il PO intendeva altro, serve un'altra foto o un video.
3. **Passo avanti più corto.** Il chiamato faceva 4,4 u; ora fa un ciclo di cammino (circa 2,1 u, due passi) e torna con due passi
   all'indietro. A passo d'uomo 4,4 u avrebbero richiesto il doppio del tempo, e il guardiano del giro 142 vuole il chiamato di
   nuovo in fila entro 6 s di scena. Se il PO preferisce il passo lungo, o che il giocatore si volti per tornare, è da decidere.
4. **Saluto: posa corretta, non una clip.** Una clip vera (Rohr «clap twice hand up» o «clapping hands up») sarebbe più naturale di
   qualunque posa calcolata, ma le clip Rohr oggi sono fuori dal pacchetto di rilascio per regola. Decisione del PO: tenerle fuori
   (resta la posa di questo giro) o farle entrare (1,8 MB in più, regola di `validate-dist` da cambiare).
5. **Pelle e capelli solo nella serata.** In partita, nell'ingresso, nella premiazione e nella parata i corpi CGTrader hanno ancora
   una sola carnagione e i capelli dal seme del posto, non dalla figurina. Estendere la regola alle altre scene è un lavoro a parte
   (in partita i ventidue hanno nomi e figurine: è fattibile con lo stesso metodo).
6. **Teste.** Il corpo non ha teste rasate, barbe o capelli lunghi: la figurina rasata avrà sempre una testa coi capelli corti.
7. **Carnagione misurata.** Ho aggiunto all'indice dei volti il colore del viso misurato su ogni ritratto, perché la classe scritta
   nell'indice non corrisponde sempre al ritratto. Il volto dell'eroe scelto alla creazione continua a seguire la classe (`k`): non
   l'ho toccato.
8. **Fascia: inquadratura cambiata.** Per togliere la tribuna dal bordo basso la panoramica è più vicina (raggio 72 invece di 92):
   si vede un po' meno stadio. L'alternativa era lasciare la camera dov'era e nascondere solo il tetto: restavano le travi.
9. **Prato della serata.** Misurato di passaggio, non toccato: il prato della serata è più chiaro e meno saturo di quello della
   partita di notte (luminanza 0,56 contro 0,40, saturazione 0,42 contro 0,63).
10. **Versione.** La consegna dice 7.999.196, nel sorgente c'è 7.999.195 (regola fissa: non la tocco).
