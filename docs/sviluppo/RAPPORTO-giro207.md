# Rapporto giro 207 — PO-401 (le diagonali negli highlight dell'eroe)

Ramo `sviluppo/giro207-diagonali`, partito da `lavoro/195`. **Giro di sola misura: `src/` non è stato toccato**
(`node tools/check-src.mjs`: «allineato al file in git»). `GAME_VERSION` non toccata: nel file vale `7.999.194`
(la consegna del giro dice 7.999.195; segnalo la differenza, non la correggo).

Richiesta del PO: «negli highlights eroe anziché poter scegliere solo avanti, indietro, destra e sinistra anche in
diagonale». Questionario: «Prima misura, poi» la proposta. Nessuna decisione presa: le alternative sono nei Dubbi.

Strumento: `tests/visual/misura-207.mjs` (tre parti, `CPM_PARTE=motore|tocco|3d`). Uscite e foto in
`docs/sviluppo/giro207/` (`motore.txt/json`, `tocco.txt/json`, `tocco-mm2.txt`, `3d.txt/json`, `tocco-*.png`, `3d-glb-passo.png`).

---

## 1. Dove nasce oggi la scelta a 4 direzioni

| Anello | Dove | Cosa fa |
|---|---|---|
| Il pad | `src/13-prepartita-formazioni.jsx:28` `DPad` | griglia 3×3: 4 tasti (▲ ◀ ▶ ▼) nelle celle laterali, **le 4 celle d'angolo sono `<div/>` vuoti**, al centro il numero di mosse (versione `v94`). Ogni tasto chiama `onMove(dx,dy)`: ▲ `(+2.5,0)`, ▼ `(−2.5,0)`, ◀ `(0,−2.5)`, ▶ `(0,+2.5)`. `dx` = verso la porta avversaria, `dy` = verso destra. |
| Dove si mostra | `src/15-live-match.jsx:4402` `showDPad` + sei punti di montaggio (12215, **12239** scheda del telefono `v94`, 12265, 12282, 12473 e 12509 PC) | il pad compare se la scena non è bloccata, ha mosse rimaste e non è una conclusione in area (`hideDirCursor`, `src/04:710`; i rigori sì). |
| Quante mosse | `src/04:697` `cappedMM` | dalla pressione della scena: alta 0, media 1, bassa 2, altrimenti `maxMoves` (default 2-3). **96 scene** concedono mosse; nel campione di 40: 23 ne concedono 1, 14 ne concedono 2, 3 ne concedono 3. |
| Dal tocco al passo | `src/15:9713` `handleDPad(dx,dy)` | alza la distanza dal marcatore `defDist` di `_moveGain317(dx,dy)`, sposta `pPos` di `(dx,dy)` dentro la `moveZone` della scena, consuma una mossa, porta la fase a `hl_choose` dopo 200 ms. |
| Tastiera | `src/15:9625-9667` (anello RAF) | frecce e WASD con 400 ms di pausa fra un passo e l'altro. **Legge i tasti in modo indipendente: due frecce insieme danno già un passo diagonale** (`dx` e `dy` entrambi a 2,5). Fa le stesse tre cose di `handleDPad` (7.315/7.317). |
| Il guadagno per direzione | `src/15:9705` `_moveGain317` | `12 + 8·cos(angolo fra la mossa e la direzione «via dal marcatore»)`, fra 3 e 20. Usa la direzione **normalizzata**: funziona già per qualunque angolo, diagonali comprese. |
| Dall'azione al motore | `src/15:1514` `_brainIn82` → `src/14:1784` `probEroe`; `src/15:9823` `xgPunto(px,py)` | il punto dell'eroe `pPos` entra nella probabilità del motore. |
| Dal punto alla scena 3D | `src/15:11547` `<ThreeMatchView playerX={pPos.x} playerY={pPos.y}>` | l'eroe 3D insegue il punto logico; la palla di scena (`hlBallSpot(sit,pPos)`, 15:9388) e i bersagli dei 21 (15:4575-4639: compagni, marcatori, linee) leggono anche `pPos.y`. |
| Il corpo 3D | `src/12:11933-11955` selettore di locomozione 7.518 | dall'angolo fra moto e sguardo: avanti → `run`, dietro (>134,6°) → `jog-back`, di lato → `strafe-left/right`, con 0,22 s di dissolvenza e 0,25 s di permanenza minima. |

## 2. Cosa fa ogni direzione

### 2a. Al motore (40 scene su 96, GLB spento; `motore.txt`)

Misurato con le funzioni **vere** del gioco (`__CPM_MOVEGAIN`, `xgPunto`/`probEroe` del motore). Nelle scene forzate il motore
della partita non nasce (si crea nel gioco fluido): per l'xG la sonda ne crea uno a parte con `creaMotorePossesso({v2:true})`,
la stessa funzione del gioco.

| Direzione | Stacco dal marcatore (media) | min..max | Passo | Δ xG del tiro (media) |
|---|---|---|---|---|
| avanti | 7,6 | 4,0..19,7 | 2,5u | +0,37 punti |
| **avanti-destra** | 7,1 | 4,0..19,9 | 3,5u | +0,48 punti (max +1,33) |
| destra | 9,5 | 4,0..18,7 | 2,5u | +0,09 |
| **indietro-destra** | 13,3 | 4,4..19,8 | 3,5u | −0,24 |
| indietro | 16,4 | 4,3..20,0 | 2,5u | −0,32 |
| **indietro-sinistra** | 16,9 | 4,1..20,0 | 3,5u | −0,39 |
| sinistra | 14,5 | 5,3..20,0 | 2,5u | −0,10 |
| **avanti-sinistra** | 10,7 | 4,2..19,6 | 3,5u | +0,25 |

Letture:
- **Bilanciamento neutro anche a otto**: media delle quattro cardinali 12,0, media delle quattro diagonali 12,0 (la formula
  7.317 è un coseno: su direzioni simmetriche la media resta 12, come dichiarato nel commento del 7.317).
- **Lo stacco non dipende dalla lunghezza del passo**, solo dalla direzione: diagonale «grezza» (2,5+2,5) e «normalizzata»
  (1,77+1,77) danno lo stesso stacco.
- **La lunghezza sì cambia il punto**: la diagonale grezza fa 3,54u (+41%). È quella che oggi fa la tastiera. Conta per
  l'xG del **tiro** (unica famiglia che legge `y`; il passaggio legge solo `x+10` con `y=50`, dribbling/difesa/altro non
  leggono il punto). Effetto piccolo: al massimo 1,33 punti di xG.
- **Leva vera della mossa = lo stacco**: fra direzione migliore e peggiore ballano fino a 16 punti di `defDist`, cioè fino
  a ~4,6 punti percentuali di malus di marcatura (`0,15·Δ/52`). Le diagonali danno valori intermedi: nessuna nuova leva.
- **La zona di movimento non ferma mai un passo singolo** (0/40 in tutte e otto le direzioni).
- **Passi veri da tastiera** (due frecce insieme per 300 ms): 40 diagonali, **36 con x e y spostati e una mossa sola**
  (37 nella prima passata). Delle 4 non riuscite: 1 è la prima scena su pagina appena aperta (nessun passo, mossa non
  consumata: succede in entrambe le passate sulla prima scena; non ho indagato la causa) e **3 sono la corsa fra i due tasti**: il primo tasto arriva in
  un fotogramma, il passo parte cardinale e il secondo cade nei 400 ms di pausa (≈8%). Nessun passo ha consumato due mosse.

### 2b. Al 3D (GLB acceso, 8 scene, 16 passi; `3d.txt`)

Testimone `__CPM_PIEDI_EROE` (src/12, solo prova): per ogni fotogramma dell'eroe angolo moto/sguardo **del corpo** e canale
di locomozione **vero** (`_locoName`).

- La mesh dell'eroe segue la diagonale: Δ ≈ (2,2 ; 2,2) a passo grezzo, contro 2,0-2,3 nei cardinali.
- **Il corpo si gira verso il moto**: angolo medio moto/sguardo 1-39° per passo, senza differenze fra diagonali e cardinali.
- Canali: per lo più `run`; tratti di `strafe` (6 fotogrammi = la permanenza minima) all'inizio dei passi laterali e
  diagonali, `back` a inizio passo quando la scena parte con l'eroe girato. Nessun errore di pagina.
- **Clip**: negli asset ci sono `running`, `jog`, `jog-back`, `strafe-left`, `strafe-right`, `walk`, `dribble`,
  `change-direction`, `running-to-turn`; **nessuna clip diagonale**. Oggi la diagonale si ottiene girando il corpo e
  usando la corsa avanti (o strafe/back per il tratto di rotazione), un canale alla volta. Una vera miscela «avanti+lato»
  (blend a due pesi) sarebbe codice nuovo nel selettore 7.518: oggi il selettore sceglie **un** canale e dissolve l'altro.
- ⚠️ In headless GLB-ON il tempo di scena scorre lento: i canali contati sono pochi fotogrammi per passo (11-29). Bastano per
  dire «quale canale», non per giudicare la resa a occhio (direttiva PO 29/07: la resa si giudica sul dispositivo).

## 3. Comodità sul telefono (`tocco.txt`, `tocco-mm2.txt`, foto `tocco-*.png`)

Misura sui rettangoli del DOM, scheda `v94` del telefono, fase `hl_move`, tocco vero (`touchscreen.tap`) sul tasto ▲.

| Schermo | Tasto | Pad | Fra due tasti (spigolo-spigolo) | Cella d'angolo ↔ tasto cardinale | Tasto «Scegli» più vicino | Margine in basso | Sovrapposizioni |
|---|---|---|---|---|---|---|---|
| 360×640 | 44×44 | 140×140 @ (21,487) | 5,7 px | 4 px | 14 px | 13 px | 0 |
| 375×667 | 44×44 | 140×140 @ (21,514) | 5,7 px | 4 px | 14 px | 13 px | 0 |
| 390×844 | 44×44 | 140×140 @ (15,691) | 5,7 px | 4 px | 14 px | 13 px | 0 |
| PC 1366×768 | 42×42 | 134×134 @ (1007,129) | 5,7 px | 4 px | 5 px («✅ Pronto») | — | 0 |

- **Le quattro celle d'angolo esistono già, 44×44, vuote**: otto tasti stanno nello stesso pad senza ingrandirlo.
  Centri: cardinali a 48 px dal centro, angoli a 67,9 px.
- Con otto tasti la distanza fra un tasto diagonale e i due cardinali vicini scende da **5,7 px (oggi, solo spigoli)** a
  **4 px lato contro lato**: è il punto debole del pad a otto tasti.
- Joystick/settori: un settore da 45° misura 55 px d'arco sul bordo del pad (52,6 sul PC), 27 px a metà raggio.
- Riferimenti di settore (dalla mia conoscenza, **non ricontrollati in rete in questa sessione**): WCAG 2.2 2.5.8 chiede
  almeno 24×24 px CSS, 2.5.5 (livello AAA) 44×44; Apple HIG 44×44 pt; Material 48×48 dp. I 44 px di oggi stanno nella
  soglia Apple/AAA, sotto quella Material.
- **Area sicura**: in headless `env(safe-area-inset-bottom)` vale 0, quindi i 13 px di margine in basso **non dicono**
  cosa succede su un telefono con la barra di sistema: non posso confermarlo senza dispositivo.
- **Scoperta collaterale (non chiesta, non corretta)**: sul telefono, dopo la **prima** mossa la scheda passa alle giocate
  e il pad sparisce anche se la scena concede 2 mosse (`mosse 2→1`, foto `tocco-*-mm2-dopo-mossa.png`). Sul PC invece il
  pad resta accanto alle giocate (`tocco-mm2.txt`, riga PC). Quindi oggi sul telefono la seconda e la terza mossa non sono
  raggiungibili. Va nei Dubbi.
- **Tastiera (PC)**: le diagonali ci sono già, con due frecce o due tasti WASD insieme, ma nessun testo lo dice («Frecce:
  sposta l'eroe») e il passo diagonale è lungo 3,5u invece di 2,5u.

## 4. Guardiani e salvataggi

| Guardiano | Tocca il movimento? | Effetto atteso di un pad a 8 direzioni |
|---|---|---|
| highlight-95, momento-165/165b/173/185/194, gioca-188, solo-highlight-166 | no: il pilota automatico da `hl_move` va dritto a `hl_choose` senza muoversi (`src/15`, `__CPM_AUTOPLAY`) | nessuno, finché il pilota non cambia e `_moveGain317` resta com'è |
| esiti-96 | tocchi veri sulle giocate del pannello (412×915) | sensibile se la scheda cambia altezza o disposizione |
| scena3d-96 | fotogrammi GLB dell'eroe (piedi, testa, inquadratura) | basso: le diagonali già si vedono da tastiera |
| hud-c3, hl-94 | misurano il D-pad (`[data-cpm="dpad"]`, `dpad-mosse`) | **sì**, da rifare insieme al pad |
| moves-budget-test | tiene premuto `d` oltre il budget | da estendere a un accordo di due tasti (il budget oggi tiene: 0 passi doppi su 57) |
| loco-directional-test | selettore 7.518 | invariato se il 3D non cambia |
| design-system, griglia-mobile | raggi/token, griglia dello schermo | sì, se il pad cambia disegno |
| **save-compat** | no | `pPos`, `movesLeft`, `defDist` **non** sono nel salvataggio né nell'istantanea `cpm-match-resume` (src/15:2419): nessun campo nuovo, `SAVE_VERSION` resta 9. Una preferenza «tipo di comando» andrebbe in `localStorage` come `cpm-match-speed`, fuori dal salvataggio |

## 5. Proposta: quattro alternative (nessuna scelta fatta)

**A. Otto tasti nella griglia di oggi.** Le quattro celle d'angolo diventano tasti con lo chevron ruotato di 45°.
- Motore: niente da cambiare (`handleDPad` e `_moveGain317` accettano già qualunque direzione). Da decidere la lunghezza
  del passo diagonale: 3,5u (come la tastiera oggi) o 2,5u normalizzato.
- 3D: niente (le diagonali si vedono già da tastiera).
- Costo: `DPad` in `src/13` (unico componente, sei punti di montaggio invariati). Rischio: 4 px fra tasti vicini → tocchi
  sbagliati; pad più affollato attorno al contatore delle mosse.
- Guardiani: nuovo `diagonali-207` (tocco vero sugli otto tasti a 360/375/390 e PC: direzione del passo, una mossa,
  stacco = `__CPM_MOVEGAIN`, nessuna sovrapposizione), rosso `__CPM_NO_G207`; da rigirare hud-c3, hl-94, esiti-96,
  design-system, griglia-mobile, moves-budget-test. **Stima: 1 giro.**

**B. Croce a otto settori (stesso pad, un'unica superficie).** Il tocco si classifica per angolo dal centro (settori da
45°, zona morta al centro dove resta il numero di mosse); a vista restano quattro frecce più quattro segni d'angolo.
- Motore e 3D come A. Rischio: meno evidente che le diagonali esistano; serve un riscontro (il settore si illumina).
  Vantaggio: niente bordi fra tasti, quindi niente «4 px»; 55 px d'arco per settore sul bordo.
- Guardiani come A, più la classificazione dell'angolo ai confini (22,5°±). **Stima: 1-2 giri.**

**C. Trascinamento / joystick.** Si trascina dal pad (o dall'eroe) e la direzione si quantizza a 8 (o resta libera).
- Motore: niente se quantizzata a 8; con angolo libero `_moveGain317` regge già, ma vanno decisi passo e cadenza.
- 3D: niente a 8; con angolo libero idem.
- Rischio: con 1-3 mosse per scena un gesto continuo è sproporzionato; conflitti col tocco della scheda e del campo; più
  difficile da provare in headless (trascinamenti sintetici). **Stima: 2-3 giri.**

**D. Diagonali solo dove servono.** Per esempio solo le due **in avanti** (sei direzioni), o le otto solo nelle scene di
progressione/dribbling/cross (nel campione: 17+4+8 su 40).
- Costo come A più la regola per scena; rischio: comandi che cambiano da scena a scena (incoerenza). **Stima: 1-2 giri.**

**In aggiunta a qualunque scelta (E, piccola):** sulla tastiera una finestra d'accordo di 60-80 ms prima di fare il passo,
così due frecce premute quasi insieme danno sempre la diagonale (oggi ≈8% esce cardinale); e una riga d'aiuto che dica che
le diagonali si fanno con due frecce. Stima: dentro il giro della scelta principale.

## Dubbi per il PO

1. **Quale alternativa?** La mia raccomandazione è **A (otto tasti nella griglia di oggi) + E**, perché: le celle d'angolo
   44×44 ci sono già e restano vuote, quindi il pad non cresce di un pixel sui tre telefoni misurati; il motore regge già
   le otto direzioni con bilanciamento neutro misurato (12,0 contro 12,0); il 3D le mostra già (misurato da tastiera, GLB
   acceso); costa un giro. Il prezzo da accettare sono i 4 px fra tasti vicini: se si teme il tocco sbagliato, **B** è la
   stessa cosa senza bordi.
2. **Passo diagonale lungo 2,5u (normalizzato) o 3,5u (come la tastiera oggi)?** Raccomando 2,5u: ogni mossa vale la stessa
   distanza in ogni direzione; con 3,5u la diagonale in avanti dà un piccolo vantaggio di xG al tiro (fino a +1,33 punti).
   Se si sceglie 2,5u, cambierebbe anche il passo diagonale della tastiera di oggi.
3. **La seconda mossa sul telefono** (scoperta collaterale): dopo la prima mossa la scheda passa alle giocate e il pad
   sparisce anche con mosse rimaste; sul PC no. È voluto (scheda compatta del #94) o va riaperta? Non l'ho toccato.
4. **Clip diagonali vere** (miscela avanti+lato nel selettore 7.518) servono, o basta il corpo che si gira come oggi? Non
   ci sono asset diagonali; una miscela sarebbe codice nuovo e la resa si giudica solo sul dispositivo.
5. La consegna parla di versione 7.999.195, il file dice 7.999.194: lo segnalo, non lo tocco.

## 6. Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno)

Nulla è cambiato in `src/`: i controlli confermano che la sonda e i documenti non toccano il gioco.

| controllo | esito |
|---|---|
| highlight-95 | **verde per somma di tre parti** (`CPM_SALVA=s1`, `s5`, `s12`; registri in `giro207/controlli/h95-*.log`). La passata intera in un colpo solo è stata **fermata dal tetto di 60 minuti** di un comando in sottofondo, senza esito, e non vale. Somma del verde: 118 highlight, **0 difetti**, D4 0, 0 non giudicabili, passaggi 32 giudicati (pavimento 12) e 29 arrivati su 32 = 90,6% (pavimento 70%), finte 6 (pavimento 4). Rosso: D1-D4 visti in ciascuna parte. ⚠️ Ogni parte da sola esce `❌` **solo** per i pavimenti di copertura, pensati per la passata intera (s1: 2 finte; s5: 8 passaggi, 62,5% arrivati; s12: 11 passaggi, 0 finte). Lo dichiaro: il verde nasce dalla somma, non da un'uscita 0 del guardiano |
| solo-highlight-166 | **verde passa**, rosso cade su 3, 7 e 8 come deve (`sh166.log`). Una prima corsa in primo piano è stata tagliata a 590 s e non vale |
| test:logic | **51/51** (`tl.log`) |
| save-compat | **12 pass · 0 fail** (`sc.log`) |

`src/` non è cambiato: `git diff 99db1c9 HEAD -- src CARRIER-MANAGER-AV.html` (99db1c9 = punta di `origin/lavoro/195`, base del giro) è vuoto. ⚠️ Il ramo **locale** `lavoro/195` del contenitore era un riferimento più vecchio: confrontare con quello dà migliaia di righe che non sono di questo giro.
