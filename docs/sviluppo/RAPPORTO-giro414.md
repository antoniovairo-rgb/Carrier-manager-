# Rapporto giro 414 — PO-678 (fascia bianca all'attaccatura dei capelli)

Ramo `sviluppo/giro414-attaccatura`, partito da `sviluppo/giro412-aspetto-3d` (= `lavoro/202` + giro 412). `GAME_VERSION` e
`docs/governo` non toccati. Rosso unico della correzione: `window.__CPM_NO_G414`.

Parole del PO (26/11): «sulle capigliatura, barba ecc ho visto delle anteprime sballate... strisce bianche senza senso».

**Tutte le misure sono sul banco (rendering software, headless), GLB acceso, ora congelata (notte e giorno), salvataggio
`tests/visual/fixtures/save-190-s12-ovr93.json`, ingresso in campo. Non sono misure del telefono del PO.**

Nelle foto del giro 412 c'erano due cose diverse, e lo sono davvero:

| | cosa | di chi | stato |
|---|---|---|---|
| (a) | fascia bianca frastagliata fra capelli e fronte nei primi piani | **del gioco** (shader della testa, giro 240) | **corretta** |
| (b) | traversa/pali bianchi sopra il viso nelle foto della prova barba | **delle foto** (e, nel gioco, di una scelta voluta del 7.8.11: vedi dubbio 2) | foto rifatte senza la porta |

## 1. Misura (prima di correggere)

Sonda `tests/visual/misura-414.mjs`. Per ognuno dei 22 corpi con nome, tre primi piani del viso (fronte, tre quarti a destra e a
sinistra), gli altri corpi nascosti. Per ogni foto un secondo passaggio di **etichette**: la testa disegnata senza luci con una texture
che vale «capelli» dove le texture della testa nera e bionda differiscono (la calotta, a 1024 px, la regola della maschera del giro 240
senza dilatazione) e «pelle» altrove. Così ogni pixel del primo piano sa se è capelli, pelle o fondo.

- **confine** = pelle entro R px dai capelli (R = 3% del lato del viso a schermo); **interno** = pelle oltre 2R;
- **chiaro** = L* (CIELAB) oltre la mediana di L* della pelle interna + 15;
- **eccesso** = quota di chiari al confine − quota di chiari all'interno (toglie i riflessi veri della fronte e la luce di lato).

Prima (braccio rosso, che ripete esattamente il giro 412), notte: **Connor Quinn (carnagione scura, capelli castani) 18,8% · 17,5% ·
22,3%** di pixel chiari al confine contro 0,2-0,9% all'interno; di giorno 13,3% · 13,2% · 15,0%. Gli altri 21 corpi (carnagioni da
chiara ad ambrata) stanno sotto il 2,3 punti di eccesso: sulla pelle chiara la fascia c'è ma quasi non si distingue dalla pelle.
Oscar Hayes («scura» in figurina, ma tinta a46440, più chiara) 0,9-1,8%.

## 2. Causa (misurata)

Non è la texture: le quattro `HEAD_hair_*.png` non hanno nessun pixel opaco chiaro (media > 200: zero) e i pixel trasparenti sono
neri. È lo **shader della testa** (`_pelle225`, ramo «dec» = maschera + mappa non decodificata + uscita sRGB, cioè la partita):

```
k225 *= m240                                         // la maschera entra nella tinta
diffuse *= mix(1, pelle, k225)                       // pelle tinta per m240
diffuse = mix(capelli_decodificati, diffuse, m240)   // e poi entra di nuovo nel miscuglio
```

La maschera è a 256 px, letta con filtro lineare e mipmap: lungo tutto il bordo della calotta vale fra 0 e 1. Lì il risultato non
sta fra «capelli» e «pelle tinta»: con m usato due volte, la parte pesata da m è pelle **grezza** — né tinta né decodificata — che in
uscita sRGB è il colore più chiaro dei tre. Prova diretta (Connor Quinn, notte, maschera uniforme forzata dal banco): m = 0 → L* 62,1 ·
m = 0,25 → **65,7** · m = 0,5 → 64,4 · m = 0,78 → 55,8 · m = 1 → 37,5. Una curva che sale prima di scendere: la fascia.
Controprove: maschera senza filtro (nearest) 16,1% → 3,7% (resta il gradino); maschera tutta «pelle» 0,7% (ma tinge i capelli).

## 3. Correzione (alla sorgente)

`src/16-scene-3d-cerimonie.jsx`, `_pelle225` (+ `_g414`): nel ramo «dec» la tinta è piena e la maschera decide **una volta sola**
(`mix(capelli decodificati, pelle tinta, m240)`): il bordo diventa un miscuglio monotono fra i due lati. Nuova chiave del programma
(`…DG`) perché verde e rosso non condividano lo shader. Fuori dal ramo «dec» (serata, cerimonie: materiali lineari) nulla cambia.
Rosso `window.__CPM_NO_G414` = composizione del giro 240.

| ora | braccio | eccesso massimo | scatti oltre 5 punti | Connor Quinn (fronte · dx · sx) |
|---|---|---|---|---|
| notte | prima (rosso) | 21,4 | 3 | 18,8 · 17,5 · 22,3 % |
| notte | **dopo** | **2,3** (Isaac Hughes, luce di lato: 5,0% confine / 2,2% interno, uguale nei due bracci) | **0** | 1,4 · 2,0 · 1,9 % |
| giorno | prima (rosso) | 15,2 | 3 | 13,3 · 13,2 · 15,0 % |
| giorno | **dopo** | **2,7** (idem) | **0** | 0,5 · 1,0 · 0,8 % |

Foto: `docs/collaudo-po/414-attaccatura-connor-notte.png` (primo piano prima | dopo), `414-confronto-prima-1..7.png` e
`414-confronto-dopo-1..7.png` (stessi giocatori del giro 412: eroe + 5 dal più basso al più alto + Connor Quinn e Oscar Hayes, notte).

Cosa resta, onestamente: lungo l'attaccatura di Connor Quinn si vede ancora un bordo **frastagliato** un filo più chiaro della fronte
(non più bianco): è il gradino della maschera a 256 px, dove alcuni pixel di pelle fra i capelli radi stanno dentro la maschera e non
prendono la tinta. Non supera la soglia (eccesso ≤ 2 punti), ma a occhio in un primo piano notturno si nota. Dubbio 1.

## 4. Le foto della prova barba (b)

La traversa non stava «davanti alla camera»: i pali della porta sono disegnati con `depthTest:false` e `renderOrder` 21
(`src/11-ui-kit-highlight.jsx`, 7.8.11 e 7.15.0, perché la porta lontana non sparisse dietro lo stadio e restasse davanti ai
cartelloni), cioè **sopra tutto**, anche sopra un corpo che sta davanti alla porta. Il portiere Maxwell, all'ingresso, ha la porta
alle spalle: la traversa gli attraversava il viso. Nelle sonde (`misura-414`, `foto414`) le maglie con `depthTest:false` si nascondono
durante lo scatto e la camera ha il piano vicino appena davanti al corpo. Foto rifatte: `414-prova-barba-piena.png` (Maxwell),
`-baffi.png` (Gray), `-corta.png` (Thornton), con la tinta della pelle conservata sulla testa di prova (nel 412 la copia del materiale
la perdeva). Nel gioco non ho cambiato nulla dei pali: dubbio 2.

## 5. Guardiano

`npm run attaccatura-414` (~80 s, quattro pagine in parallelo: notte e giorno × verde e rosso). Soglia dichiarata prima di scrivere il
guardiano (ma dopo aver visto le misure dei due bracci, lo dico): **nessuno scatto verde con eccesso > 5 punti**, 66/66 scatti
giudicati per ora (uno non giudicato = rosso), e il rosso deve avere almeno uno scatto oltre 5 punti per ora (altrimenti la misura è
cieca → rosso). Esito: verde 0 scatti oltre (massimo 2,3 notte / 2,7 giorno), rosso 3 per ora (massimo 21,4 / 15,2).
Riga MAPPA: `src/16-` (quella che esiste già). `npm run mappa-unica` verde.

### Giro ufficiale e `aspetto-412` (instabile, riparato)

`node ci-runner.mjs giro attaccatura-414 pelle-240 aspetto-412` (attaccatura-414 + pelle-240 + aspetto-412 + 17 sentinelle):
prima corsa 19/20 — tutto verde tranne `aspetto-412`, rosso nel braccio VERDE con «Daniel White 190 cm → 193» fuori dal ±3%.
Misura prima di toccare: 3 corse sulla **base 412** (commit f11ddc3, copia separata) e 3 sul mio ramo, affiancate: base 1 rosso su 3
(193 cm), mio ramo 1 rosso su 3 (192 cm). È un'instabilità del guardiano del giro 412, non della correzione (che cambia solo il colore
della testa). Nelle corse rosse la suola più alta sale da −0,012 a +0,003/+0,009: il corpo è colto in un istante dell'oscillazione
della fila e la statura, letta **una volta sola**, cala di 2-3 cm. Riparazione della misura, soglie invariate (`aspetto-412.mjs`, dopo
`leggiCorpi`): tre letture a 0,8 s, per ogni corpo la statura più alta osservata; i piedi restano giudicati sulla prima lettura come
prima. Dopo: 4 corse su 4 verdi (Spearman 0,994-0,995, 0 fuori ±3%, anche in due corse con la suola a +0,003/+0,009), rosso sempre
visibile (Spearman −0,04…0,15, 11-12 fuori). Catena composta (i 19 passi verdi restano, si rigioca `aspetto-412`): **20/20 verdi**.
Durante la catena `griglia-mobile` e il runner riscrivono `docs/collaudo-grafico/**` e `docs/governo/STABILITA.json`: rimessi come
erano (il giro non tocca `docs/governo`).

## File e funzioni toccati

- `src/16-scene-3d-cerimonie.jsx`: `_g414` (nuova), `_pelle225` (composizione della maschera nel ramo «dec», chiave del programma).
- `CARRIER-MANAGER-AV.html` ricomposto (`node tools/build-src.mjs`).
- `tests/visual/misura-414.mjs` (sonda + `foto414`), `tests/visual/attaccatura-414.mjs` (guardiano), `tests/visual/foto-414.mjs`
  (foto per il PO, non guardiano).
- `tests/visual/aspetto-412.mjs` (giro 412): statura letta in tre momenti, la più alta per corpo (sopra).
- `tests/visual/package.json`: script `attaccatura-414`, `misura-414`. `tests/visual/ci-runner.mjs`: `attaccatura-414` nella riga
  MAPPA `src/16-`.
- `docs/collaudo-po/414-*.png`, questo rapporto.
- Non toccati: `GAME_VERSION`, `docs/governo` (il registro `STABILITA.json` scritto dal runner è stato rimesso com'era), asset e
  licenze, `src/11` (pali della porta).

## Dubbi per il PO (la consigliata per prima, già applicata)

**1. Quanto pulire l'attaccatura.**
- **(consigliata, applicata)** Composizione monotona della maschera: sparisce la fascia bianca, nessun costo, nessun asset nuovo.
- Maschera a 512 px (oggi 256) e bordo sfumato: toglie anche il gradino frastagliato rimasto; costa ~4 volte il calcolo una tantum
  all'avvio (decine di ms sul banco, non misurato sul telefono) e va ritarato `pelle-240`.
- Maschera «di copertura» continua (quanto capello c'è in ogni pixel, dalla differenza fra le texture nera e bionda): la tinta segue
  i capelli radi pixel per pixel; è la più fedele ma tocca il cuore della tinta del giro 240.

**2. I pali della porta sopra i giocatori (nel gioco, non solo nelle foto).** Con `depthTest:false` un giocatore davanti alla porta
(il portiere sulla linea, un attaccante sul secondo palo visto da dietro) ha i pali disegnati sopra il corpo.
- **(consigliata, applicata in questo giro: nulla nel gioco)** Lasciare com'è: è una scelta voluta (7.8.11 «sparita la porta», 7.15.0
  «i pali in primo piano rispetto ai cartelloni») e cambiarla tocca il motore 3D, non questa voce.
- Pali con depth test acceso solo contro i corpi (i corpi disegnati dopo i pali): serve un giro dedicato con guardiano della porta.
- Pali con depth test acceso e fondale/cartelloni dietro la porta spostati: riapre il difetto del 7.8.11, da misurare stadio per stadio.

**3. Carnagione «scura» ancora chiara (dubbio 5 del giro 412).** Connor Quinn (figurina 854a2a) a schermo ha L* ~36-44 sulla pelle
interna: più scuro di prima di questo giro solo al confine, la pelle resta più chiara del ritratto (foto 414-confronto-dopo-5).
- **(consigliata)** Misurarlo col testimone del giro 240 (`pelle-240`, CIE76) sui soli visi «scura» prima di toccare `RESA240`.
- Ritarare `ESP240`/`RESA240` sulle carnagioni scure soltanto.
- Lasciare com'è.
