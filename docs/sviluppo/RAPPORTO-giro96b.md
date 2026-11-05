# RAPPORTO giro 96b — esiti degli highlight, comandi della partita, aperti del giro 97

Ramo `sviluppo/giro96b-esiti` (da `sviluppo/giro95-highlight`, 7.999.178 + giro 95). `GAME_VERSION` e `docs/governo/` non toccati.
`src/12-three-match-view.jsx` **non toccato** (nemmeno per D14: la correzione è tutta in `src/15`).
Regola PO applicata: ogni difetto negli highlight vale almeno «medio» e blocca il rilascio.

File di gioco toccati: `src/04-situazioni-zone-piazzati.jsx` (B15, dati), `src/09-audio-scout-anagrafiche.jsx` (D3),
`src/15-live-match.jsx` (D1, D2, D6, D7, D12, D14, D15, politica d'autoplay «mano» solo per sonde). Guardiano nuovo
`tests/visual/esiti-96.mjs`; guardiani corretti `carriera3-94.mjs` e `home-066.mjs`.

## A — Collaudo carriera 177 n.2 (PO-300)

### D1 ALTA — il tocco rapido sulla scelta si perdeva
- **Misura prima.** Sonda sul flusso vero (salvataggio c177 S1, tocco col mouse a 200-500 ms dall'apertura): un tocco a
  231 ms cade su un tasto `disabled` con opacità 0,45 — si vede, sembra toccabile, ma non fa niente; nessun `ActionResolved`.
  Sulle scene forzate (braccio rosso di `esiti-96`): **10 tocchi persi su 40** (tutti a ~200 ms).
- **Causa.** Le righe del pannello nascono disarmate (7.926, 250 ms dal 7.956) ma restavano a schermo, semitrasparenti e
  `disabled`. Il tocco cadeva nel vuoto; dopo 9-16 s scattava l'auto-anticipo (`useEffect` «Auto-tackle»), che risolve con
  l'azione «peggiore» senza emettere `ActionResolved`: da qui «risultato di un'altra azione» (es. «Anticipa sul primo
  controllo» → «Fallito · Scivolata netta»). I testi di D2 sono esattamente quelli dell'auto-anticipo.
- **Correzione** (`src/15`, righe del pannello). Finché non sono armate le righe **non si vedono e non prendono il dito**
  (`visibility:hidden` + `pointer-events:none`, poi la stessa dissolvenza): la protezione del 7.926 resta (il dito del D-pad
  che ricade non sceglie niente), ogni tasto visibile registra il tocco. Opzione scelta fra le due della richiesta («registra»
  oppure «non sembra toccabile») perché non riapre il difetto che il 7.926 aveva chiuso. Rosso `__CPM_NO_G96B_D1`.
- **Misura dopo.** `esiti-96` verde: **38/38** tocchi su scelta visibile registrati con la scelta giusta (tocco subito alla
  comparsa del pannello, 200-500 ms); rosso: 10 persi su 40.
- Nota: «Cerca l'angolo» → risolto «Tiro a giro» **non** è D1: è voluto (l'eroe sceglie l'intento, `intentLabel`; il motore
  decide l'esecuzione). Il guardiano confronta con `intentLabel`.

### D2 MEDIA — esitazione su scena difensiva raccontata come attacco
- **Misura prima.** Rosso di `esiti-96`: 3 scene difensive lasciate scadere → 6 difetti (testo «il marcatore intercetta»/
  «recupera palla», chiave `intercept`, titolo con il nome di un'azione mai scelta).
- **Causa.** L'auto-anticipo aveva un solo repertorio, d'attacco, e mostrava `worst.label` nel titolo.
- **Correzione.** Su scena `type:"def"` l'esitazione è «il portatore ti salta» (chiave `through`, `outKind:"beaten"`, la stessa
  del fallimento di una chiusura); il titolo dice «⏱ Troppo tardi» (anche nella pillola «in corso» e su PC); evento di
  timeline `ActionTimeout` (prima l'esitazione non lasciava traccia). Rosso `__CPM_NO_G96B_D2`.
- **Misura dopo.** Verde 3/3 scene difensive senza difetti.

### D3 MEDIA — gol del rivale: gala 10, bilancio 8
- **Misura prima.** Salvataggio del collaudo `cp-s2w39gala`: rivale Phil Dupont, archiviati 10 gol con OVR 61; dopo la
  chiusura l'OVR è 63. Il conto (`rivalSeasonGoals`) ha l'OVR nel seme: ricalcolato con 61 → 10, con 63 → **8**.
- **Causa.** Chiusa la stagione (`seasonClosedAt`), le schermate che ricalcolavano usavano il seme col nuovo OVR.
- **Correzione** (`src/09`). A stagione chiusa `rivalSeasonGoals` legge la riga dell'albo del rivale per quella stagione:
  una sola fonte per gala, cruscotto e albo. Rosso `__CPM_NO_G96B_D3`.
- **Misura dopo.** Gala prima/dopo la chiusura, cruscotto prima/dopo, albo: 10/10/10/10/10 (rosso: 10/10/10/8/8).

### B15 → MEDIA — «Contrasto pulito senza fallo» che finisce in fallo
- **Misura prima.** Dati: le due voci (situazione «Meglio un fallo tattico» e `P6_DIFESA`) avevano `fail:"foul"`; rosso:
  3/3 esiti falliti forzati → «😤 Cartellino meritato».
- **Scelta** (la più coerente con le altre scelte difensive): fra le opzioni difensive il fallo è il rischio della
  **scivolata** e del **fallo tattico**; chiusura, anticipo e raddoppio falliscono con `through` (l'avversario passa).
  Il contrasto «senza fallo» è la scelta prudente: il suo rischio è essere saltati, non l'ammonizione. Ora `fail:"through"`.
  Rosso `__CPM_NO_G96B_B15` (ripristina il fallo in `handleAction`).
- **Misura dopo.** Verde: dati 2/2 senza `foul`, 3/3 esiti forzati falliti → «l'avversario passa».

## B — Collaudo grafico 178 (PO-299)

### D6 MEDIA — il riquadro d'esito copre piedi e pallone
- **Misura prima.** 30 scene forzate (412×915), 8 campioni durante la finestra d'esito: in **11/30** piedi o pallone sotto
  il bordo del riquadro (rosso di `esiti-96`: 4-7 scene col criterio piedi ≥2/8 o pallone ≥3/8). Riquadro mediano 179 px
  (20% dello schermo, non 40vh: 40vh è solo il tetto). L'eroe sta nel quarto basso del quadro (piedi a 755-805 px).
- **Correzione** (`src/15`, la camera di `src/12` non si tocca). Quando il riquadro compare, la vista 3D sale di **18vh**
  (`transform` sul canvas, stessa dissolvenza del riquadro): un tilt di regia; esce dal quadro un pezzo di cielo/tribuna (che
  D8 già segnala in eccesso). Nessun ridimensionamento del canvas. 14vh lasciava 1-2 scene su 30 al limite; 18vh: 0/30
  in tre giri. Foto controllata: nessuna banda scura sotto il riquadro. Rosso `__CPM_NO_G96B_D6`.
- **Misura dopo.** Verde 0/29-30 scene coperte (quattro giri).

### D7 MEDIA — titolo del riquadro troncato
- **Misura prima.** 5/30 titoli troncati con «…» (es. «Azione non sfruttata · ⚡ Sterzata d'esterno, brucia il terzi…»).
- **Correzione.** Il titolo va a capo (`white-space:normal`, `overflow-wrap:anywhere`), anche nella pillola «in corso».
  Rosso `__CPM_NO_G96B_D7`. **Dopo:** 0/29.

### D12 MEDIA — su PC l'esito è una striscia
- **Correzione.** Su PC l'esito diventa una scheda che occupa lo spazio libero della colonna destra (`flex:1`): titolo da 20 px
  che va a capo, azione, frase, causa, gol/assist e un «Continua» da 46 px (prima su PC non c'era un tasto: «auto →»).
  Rosso `__CPM_NO_G96B_D12` = la striscia. **Dopo:** 6/6 scene con scheda ≥40% della colonna, titolo ≥18 px, Continua ≥40 px;
  rosso 5/5 difetti.

### D15 MEDIA — comandi della partita sotto i 40 px sul telefono
- **Misura prima** (elementFromPoint, telefono a tocco): Salta ingresso 61×36 · ⏸ 13×27 · velocità 22×20 · ⚠️ 22×34 ·
  Salta festeggiamenti 61×36 (61 = tetto della misura in larghezza).
- **Correzione.** Metodo del giro 97 (`::after` da 42 px, disegno invariato) con una classe **locale** `cpm-t40m` in uno
  `<style>` della partita (per non entrare in conflitto con `.cpm-t40` del ramo giro 97); z-index 1 sull'area allargata (la
  riga sotto, posizionata, rubava il tocco); pausa/velocità/⚠️ distanziati di 10-22 px perché le aree non si rubino il dito.
  Rosso `__CPM_NO_G96B_D15`. **Dopo:** 61×42 · 42×42 · 41×42 · 42×42 · 61×42.

## C — Aperti del giro 97

### D14 MEDIA — nero al fischio finale
- **Misura.** Il nero **non l'ho riprodotto** in headless (come il giro 97). L'indizio sì: entrando in cerimonia da `playing`
  la «striscia» delle statistiche (38 px) sotto la vista spariva e il canvas passava 775 → 813 px (811 → 849 su touch):
  `setSize` svuota il disegno fino al fotogramma successivo, e il primo fotogramma della cerimonia è il più pesante.
- **Correzione** (`src/15`, nessun intervento in `src/12`). In cerimonia la striscia resta com'era nella fase precedente
  (visibile se si arriva dal gioco, nascosta se da un highlight): il canvas non cambia misura. Rosso `__CPM_NO_G96B_D14`.
  **Dopo:** 811 → 811 px (rosso 811 → 849). **Non posso confermare** che fosse la causa della foto: va guardato sul telefono.

### Cerimonia chiusa in ~0,2 s nel flusso vero
- **Misura.** Partite vere fino al fischio (salvataggio `save-194-primavera-w38`, autoplay, senza `__CPM_CER_HOLD`): due
  vittorie con festa (semi 11 e 23) → cerimonia **10,5 s e 9,8 s** (timer 9,5 s della festa leggera). Non riprodotto:
  la classifico come effetto del banco del giro 97, non del gioco. Nessuna modifica.

### carriera3-94 rosso su D2 — difetto del guardiano
- La partita k13 del salvataggio 190 oggi non contiene **alcun** rigore (registro `__CPM_PEN94` vuoto): il guardiano
  dipendeva da un solo seme e il motore è cambiato. Correzione: aggancio di collaudo esistente `__CPM_RIG190_K=1` (ogni fallo
  in area è rigore, solo sotto `cpmtest`) e fino a tre partite (k7, k13, k21). Giudizio invariato. Verde: k7 rigore al 67'
  segnato in scena, 0 doppi su 1.
- **Punto aperto:** il braccio rosso `CPM_ROSSO=D2` non cade più (k3: 2 rigori, 0 doppi; k7 0 doppi): il ricalcio
  dipendeva da un tempismo raro (scena aperta dopo i 40 passi d'attesa del motore) che oggi non si riproduce. Ho anche
  corretto il guardiano perché un rosso «cieco» non conti come rosso (prima: «FALLITO (rosso D2: atteso)» anche a partita
  senza rigori) — ora esce 3 con «ROSSO NON DIMOSTRATO».

### home-066 rosso — difetto del guardiano
- Da svincolato il gioco porta **di proposito** alla scheda Procuratore 900 ms dopo l'avvio (giro 94, D3); il guardiano
  misurava quella scheda con la regola della home (A1 «fisarmonica col cappello delle schede»), che lì è giusta.
  Correzione: si torna alla dashboard prima del censimento. Soglie invariate. Verde: 113 riquadri, 0 fuori standard
  (pro-svincolato: 20 riquadri della home); rosso `CPM_ROSSO=1`: 24 fuori standard.

## Guardiano nuovo `esiti-96`
In `package.json`, nelle catene `carriera` e `completa`, nei passi lenti e nella MAPPA (src/15, src/05|09, src/04).
Punti: D1, D2, D3, B15, D6, D7, D12, D15, D14.

Verde: 0 difetti su D1 (38/38 tocchi registrati), D2 (3 scene), D3, B15 (5 prove), D6/D7 (29 scene), D12 (6 scene), D15 (5 comandi), D14. Rosso (`__CPM_NO_G96B_*`): cadono tutti e nove (D1 10 tocchi persi su 40, D2 6, D3 1, B15 3, D6 4, D7 5, D12 5, D15 5, D14 811→849 px).

## Gol e assist dell'eroe (PO-156 / PO-190)

Strumento `quota-190-vivo` (salvataggio S12, 8 partite vere, semi K=1..8). Prima (base 145110f): gol eroe 0,75 a partita, assist 0,38, quota 31,6% dei gol di squadra. Dopo: gol 0,75, assist 0,50, quota 28,6%. Sotto il 50% di PO-190 in entrambi; l'autoplay non passa dalle modifiche (chiama `handleAction` direttamente), la differenza sugli assist è rumore.

## Guardiani esistenti

- Verdi: test:logic, save-compat, design-system, typing-shortcuts, career-critical, griglia-mobile, lessico-218, scene-221, home-066 (corretto), carriera3-94 D2 (corretto).
- esiti-218: rosso per copertura (11 scene contro il minimo di 12, 0 contraddizioni); identico sulla base (5+6 scene): preesistente.
- highlight-95 e assist-298: braccio verde senza difetti (75 e 16 scene), ma oltre il tetto di 25 minuti; in highlight-95 il browser è morto sulle partite S12. Bracci rossi incompleti.
- **Non eseguiti** (sessione interrotta): pagella-75, voto-79, tabellino-228, pc-tablet-292, partita-vera, validate-situations (da girare per primo: B15 cambia una chiave d'esito), difficolta-156, catalogo-022, esiti-60, esito-280, nomi-219, cross-218 e il resto della MAPPA; carriera3-94 completo (solo D2 eseguito).

## Punti aperti
- D14: correzione dell'indizio, nero non riprodotto: collaudo sul telefono.
- carriera3-94 D2: il braccio rosso non dimostra più il difetto sul motore attuale (vedi sopra).
- D6: la vista che sale di 18vh è una scelta di regia fatta senza toccare la camera; il PO la giudichi sul telefono (la
  correzione «vera» è nella camera, D8, cantiere 96a).
- D15: spaziatura fra pausa, velocità e ⚠️ leggermente aumentata sul telefono a tocco (unica differenza visibile).
