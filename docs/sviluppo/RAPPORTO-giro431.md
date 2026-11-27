# Rapporto giro 431 — PO-685 (statura dell'eroe come quella degli altri 21)

Ramo `sviluppo/giro431-statura-eroe`, partito da `sviluppo/giro414-attaccatura` (giro 412 + giro 414) con `origin/main` (7.999.218)
unito prima di partire (un solo conflitto, nella MAPPA di `tests/visual/ci-runner.mjs`: tenute le righe di main con in più le voci
`aspetto-412` e `attaccatura-414` del ramo). `GAME_VERSION` e `docs/governo` non toccati. Temi dei giri 432/433/434 (barba e capelli,
carnagione scura, premiazione) non toccati.
Rosso unico: `window.__CPM_NO_G431`.

Decisione del PO (dubbio 1 del giro 412): **«Stessa regola degli altri»**: statura dichiarata del corpo 3D dell'eroe = statura della
figurina / 100, corporatura dalla figurina.

**Tutte le misure sono del banco (rendering software, headless), corpi GLB accesi, ora congelata (notte), salvataggio
`tests/visual/fixtures/save-190-s12-ovr93.json` (eroe Samuelito Vairo, figurina 179 cm / 74 kg). Non sono misure del telefono del PO.**

## 1. Misura (prima = `__CPM_NO_G431`, dopo = verde)

Come si misura (`npm run statura-eroe-431`, stesso metodo del giro 412): statura sui **vertici disegnati** (maglie deformate dallo
scheletro, dalla suola alla cima, in metri di scena: la traversa è 2,44); dove la posa cambia la cima (highlight, premiazione con la
coppa alzata, parata) si giudica la **scala del corpo per metro dichiarato**, che per lo stesso modello è la stessa regola. Il
riferimento dell'eroe è la sua figurina (`datiFigurina23('giocatore','eroe')` = il campo salvato `player.altezzaCm/pesoKg`, giro 369);
quello degli altri corpi della scena è la statura con cui sono dichiarati. «Rapporto» = (3D / riferimento dell'eroe) diviso la
mediana dello stesso rapporto degli altri: 1 = stessa regola.

| scena | prima: dichiarata · 3D · rapporto | dopo: dichiarata · 3D · rapporto | altri corpi (3D) |
|---|---|---|---|
| ingresso in campo (22 in fila) | 1,934 · **206 cm** · **1,093** | 1,79 · **191 cm** · 1,012 | 177-207 cm (figurine 167-195) |
| highlight (4 scene forzate, 8 campioni) | 1,934 · 206 cm · 1,080 · il più alto | 1,79 · 191-192 cm · 1,000 | 178-205 cm |
| premiazione (coppa alzata: la cima è la mano) | 1,934 · 222 cm · 1,080 · il più alto | 1,79 · 207-208 cm · 1,000 | 174-208 cm |
| serata di presentazione | 1,934 · 218 cm · 1,080 · il più alto | 1,79 · **202 cm** · 1,000 | 202-204 cm (tutti dichiarati 1,8) |
| parata sul pullman | 1,78 (seme a caso, come i compagni) · 232 cm · 0,994 | 1,79 · 234 cm · 1,000 | 226-251 cm |

Corporatura dell'eroe: era già quella della figurina (1,032 contro 74 / (22,4 × 1,79²) = 1,031): la formula del corpo e quella della
figurina avevano la stessa sorgente (giro 369). Resta 1,032 (testimone `alt431.girth`).

Perché l'eroe era alto 206: `_heroAppr.height` (src/12) era il **seme** dell'avatar (1,86 + …×0,16 = 1,86-2,02), cioè la scala dei
semi della figurina (1,82-2,06 → 165-195 cm), mentre dal giro 412 gli altri 21 dichiarano **cm/100**. Stessa formula copiata in tre
punti di src/16 (intervista, serata, gala). Nella parata l'eroe aveva una statura a caso (1,78-1,90) come i compagni.

## 2. Correzione alla fonte

- `src/01-bootstrap-tema-avatar.jsx`: nuova `corpoEroe431(avatarId)`, **unica sorgente** di statura e corporatura del corpo 3D
  dell'eroe: cm e kg dal campo salvato (`__CPM_EROE23`, stesso avatar), altrimenti `fisicoEroe369` (stessa formula); statura = cm/100;
  corporatura = quella del seme se i numeri coincidono, altrimenti kg / (22,4·h²) dentro 0,93-1,08. Con `__CPM_NO_G431` restituisce la
  statura di prima.
- `src/12-three-match-view.jsx`: `_heroAppr` prende statura e corporatura da `corpoEroe431` (partita: ingresso, gioco, highlight,
  premiazione, festa: sono gli stessi ventidue corpi). Testimone `userData.alt431 = {h, girth, eroe}` su ogni corpo della partita e su
  ogni corpo di `corpoCG23` (statura dichiarata).
- `src/16-scene-3d-cerimonie.jsx`: `corpoEroe431` nell'intervista 3D, nella serata (`heroAppr`), nel gala e nella parata (l'eroe
  davanti, i compagni restano a caso: dubbio 3). Nella parata la coppa segue la nuova statura (`_alt192`): `trofeo-376` verde.
- `CARRIER-MANAGER-AV.html` ricomposto (`node tools/build-src.mjs`).
- Intervista 3D e gala con corpi sono spenti per default (`__CPM_NO963`, `__CPM_NO946`): cambiati per coerenza, **non misurati**.

## 3. Guardiano `npm run statura-eroe-431` (verde + rosso nello stesso comando, ~2,5 min)

Per ogni scena (ingresso, highlight, premiazione, serata, parata): testimone dell'eroe = figurina/100 (±0,5 cm); rapporto entro ±3%
della mediana degli altri (la tolleranza del giro 412); in partita corporatura entro 0,01 dalla figurina; all'ingresso suola dell'eroe
entro 2 cm da quella del rosso. Il rosso deve vedersi all'ingresso (rapporto > +3% e testimone diverso dalla figurina).
«Non giudicato» = rosso. Riga MAPPA: `src/12-|src/13-` (quella che esiste già).
Esito (4 corse): verde in tutte; rosso ingresso 1,088-1,093.

## 4. Guardiani dell'inquadratura e dei gesti rigirati

| guardiano | esito |
|---|---|
| `framing-guard` (= `hero-framing` con le soglie) | ✅ mediana 0,100 · fuori quadro 2,7% (col rosso `__CPM_NO_G431`: 0,099 · 1,9%; soglie 0,085 / 10%) |
| `hero-in-frame` | ✅ |
| `camera-241` | ✅ verde col verde, rosso col rosso (675 s) |
| `spalle-146` | ✅ (e i rossi `__CPM_NO_G146`/`__CPM_NO_G146B` cadono) |
| `aspetto-412` | ✅ Spearman 0,997 · 0 fuori ±3% · 0 compenetrate (rosso 0,166 · 13 fuori) |
| `intro-spalle-428` | **non esiste sul ramo** dopo l'unione con main (nessuno script, nessun file): non rigirato |
| `salti-274` | ✅ PASS (0 salti non spiegati) e ROSSO come atteso |
| `testa-tempismo` | ✅ PASS (22 controlli ok) |
| `trofeo-376` (coppa della parata legata alla statura dell'eroe) | ✅ verde e ogni rosso si vede |
| `serata-261` (serata toccata) | ✅ verde e il rosso cade su A, B e C |
| `presentazione-225` (serata) | ✅ verde e il rosso si vede |

Nota sul fuori quadro 2,7% contro 1,9%: il censimento ripete 191 scene sulla stessa pagina (lezione 7.483: il confronto fra bracci
regge, il decimale no); resta molto sotto la soglia. Non l'ho ripetuto per separare rumore e effetto: **non posso confermare** se
lo 0,8% sia dell'eroe più basso.

## 5. Foto

- `docs/collaudo-po/431-confronto-prima-dopo.png`: l'eroe fra i due compagni più vicini nella fila, clonati nella posa del momento e
  affiancati alla stessa distanza, righe a 1,8 · 1,9 · 2,0 m (prima 201 cm sopra i 2,0 m, dopo 182 cm fra Spencer 180 e Russell 187).
  Le due metà sono anche separate: `431-{prima,dopo}-ingresso-vicini.png`.
- `431-{prima,dopo}-{ingresso,highlight,premiazione,serata,parata}.png`: le scene intere al momento della misura.

## 6. Dubbi per il PO (la consigliata per prima, già applicata)

1. **Serata e parata: l'eroe segue la regola, i compagni no.** In serata i compagni sono tutti dichiarati 1,80 (l'eroe ora 1,79:
   stessa altezza a schermo, prima 16 cm più alto); in parata i compagni hanno una statura a caso (1,78-1,90). (a) *Consigliata,
   applicata*: l'eroe con la figurina ovunque, i compagni restano come sono finché non si sceglie il dubbio 4 del giro 412;
   (b) estendere subito la regola della figurina ai compagni nominati di serata e parata (è il dubbio 4 del giro 412, tocca
   `presentazione-225`/`pelle-240`); (c) nelle cerimonie lasciare l'eroe com'era (più alto: scelta di regia) e applicare la regola
   solo in partita.
2. **Eroe molto basso o molto alto.** La figurina dell'eroe va da 170 a 190 cm: un eroe di 170 cm sarà fra i più bassi in campo e
   l'inquadratura lo stringe meno (il censimento è fatto su 179 cm). (a) *Consigliata, applicata*: stessa regola per tutte le stature,
   il guardiano dell'inquadratura resta il giudice; (b) misurare il censimento anche con un eroe di 170 cm prima di spedire
   (~10 min); (c) tenere un minimo di statura 3D per l'eroe (es. 1,78) come scelta di regia.
3. **Corporatura nelle cerimonie.** In partita la corporatura dell'eroe è quella della figurina (1,032); nella serata e nella parata
   i corpi CGTrader sono scalati in modo uniforme (`corpoCG23`), quindi la corporatura non c'è per nessuno. (a) *Consigliata, applicata*:
   lasciare così (nessuno ce l'ha, nessuno è diverso); (b) passare la corporatura a `corpoCG23` per tutti i corpi con figurina;
   (c) solo per l'eroe.
4. **Intervista 3D e gala con corpi** sono spenti per default: li ho portati alla stessa sorgente, ma non li ho misurati.
   (a) *Consigliata*: lasciarli non misurati finché restano spenti; (b) aggiungerli al guardiano se tornano accesi; (c) toglierli.

## 7. Comandi

```bash
cd tests/visual
npm run statura-eroe-431                 # guardiano (verde + rosso)
CPM_MISURA=1 npm run statura-eroe-431    # sonda: tabella per scena + i 22 corpi dell'ingresso, senza giudicare
CPM_FOTO=1 npm run statura-eroe-431      # rifà le foto docs/collaudo-po/431-*.png
```
