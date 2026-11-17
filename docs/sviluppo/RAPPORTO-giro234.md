# Rapporto giro 234 — leggibilità, accessibilità, rifiniture a 375 px (7.999.197)

Voci: **PO-393** (G181-22, opzioni di lettura e primo impatto per Google Play), **PO-455** (G195-04+05+07), **PO-459** (G195-15+06).
Ramo `sviluppo/giro234-accessibilita`, partito da `lavoro/197` (= 7.999.196 pubblicata). `GAME_VERSION` non toccato (resta 7.999.196:
la versione la scrive il rilascio).

Fonti lette: `docs/collaudo/GIRO195-USABILITA.md` (ramo `collaudo/giro195-usabilita`), `docs/collaudo/GIRO181-IDEE.md` (G181-22,
ramo `collaudo/giro181-idee`), `docs/governo/BACKLOG.md` e `DECISIONI.md` (ramo `poc/marioprada-character-system`).

## Come ho misurato

- **Sonda `tests/visual/misura-234.mjs`** (nuova, riusa la misura del giro 195 portata nel ramo: `giro195-schermate.mjs`). Gioco vero
  (`?cpmtest=1`), carriera di prova del giro 195 (`fixtures/save-c177-s5w20.json`), telefono con tocco a **360 / 375 / 412** e PC a
  **1366** senza tocco. Misura: zoom (gesto a due dita vero), Classifica col testo ×1,3 (simulato e con l'interruttore), Opzioni,
  albero di accessibilità di Chromium (CDP `Accessibility.getFullAXTree`), finestre, Club, Coppe, pausa in partita, manifest.
- **Foto**: `docs/sviluppo/foto-giro234/prima/` (build 7.999.196) e `docs/sviluppo/foto-giro234/dopo/` (questo ramo), per ogni
  larghezza: `classifica-*`, `classifica-x13sim-*` (corpi ×1,3 simulati come nel giro 195), `classifica-testogrande-*` (solo dopo:
  l'interruttore prima non c'era), `club-*`, `coppe-*`, `opzioni-*`, `pausa-*` (solo telefono). La pausa «prima» è il braccio rosso
  (`prima/pausa-375-braccio-rosso.png`), che rimette il comportamento di prima.
- **Una scoperta di metodo che cambia la correzione.** Il pizzico simulato con `Input.synthesizePinchGesture` e sorgente «touch» non
  ingrandisce mai in headless (scala 1 anche a zoom libero); il gesto a due dita vero (`Input.dispatchTouchEvent`, due punti che si
  allontanano) sì: **scala 5** a zoom libero, **1** con `user-scalable=no`. Con lo stesso gesto ho provato tre modi di bloccare lo zoom
  *a pagina già aperta*: cambiare il `content` del meta → **5** (non blocca), ricreare il meta → **5** (non blocca),
  `touch-action: pan-x pan-y` → **1** (blocca). Quindi il blocco in partita è fatto con `touch-action`, non col meta.

## Prima → dopo (numeri misurati)

| Punto | Prima (7.999.196) | Dopo (ramo) |
|---|---|---|
| Zoom con due dita nelle schede (360/375/412/1366) | scala 1 / 1 / 1 / 1 (meta `maximum-scale=1, user-scalable=no`) | **5 / 5 / 5 / 4** |
| Zoom con due dita in partita (provino, fase di gioco, 360/375/412) | 1 | **1** (`touch-action: pan-x pan-y` sulla pagina finché la partita è montata) |
| Classifica, corpi ×1,3 simulati: celle «Pt» fuori dal bordo | 360: **19/19** · 375: **19/19** · 412: 0 | 360: **0/37** · 375: **0/19** · 412: 0 |
| Etichette «Classifica / Calendario» col testo ×1,3 | tagliate di 5-12 px (360 e 375), 3 px a 412 | 0 tagliate (l'icona va sopra la parola) |
| «Testo grande» acceso (interruttore vero), corpo minimo / celle Pt fuori / testi tagliati a 360 e 375 | interruttore assente | **16 px / 0 / 0** |
| Cursori audio in Opzioni, altezza area di tocco | **18 px** (×5) | **49 px** (×5) |
| Comandi audio in Opzioni con nome per i lettori di schermo | **0 su 12** (5 cursori senza nome, 7 interruttori «button» senza nome) | **12 su 12** (5 `slider` «Volume …», 7 `switch` con stato) |
| Opzioni come finestra | nessun `dialog` | `dialog` modale «⚙️ Opzioni» |
| Finestra della settimana / della partita (`apriSettimana`, `apriPartita`) | 0 `dialog` | `dialog` modale (ogni `ModalPannello` del kit) |
| Titoli per scheda (Home/Classifica/Calendario/Coppe/Club/Profilo/Agente/Ufficio) | 0/1/1/1/0/0/1/1 | 1/2/2/2/1/1/2/2 |
| Voce di menu attiva dichiarata | 0 su 8 schede | 8 su 8 (`aria-current="page"` nella barra, `aria-selected` nelle sotto-schede) |
| Versione in Opzioni | no | «Versione 7.999.196» in fondo alle Opzioni |
| Pausa sul telefono | «Premi P o tocca per riprendere» | «Tocca per riprendere» (con mouse resta la frase con P) |
| Club a 375: larghezza delle righe progetto/curva/staff | colonna di **149 px** su 362 | blocco di **326 px** su 362 |
| Manifest web / TWA / meta `theme-color` | web `#8e1f33`/`#3d0f1b`, TWA `#0d0f14`, meta `#8e1f33`; descrizioni in inglese | tutti **`#0d0f14`**; descrizione in italiano + `"lang": "it"` nei due manifest |
| Coppe, testi su sfumatura (caso peggiore) | UCL 5,17 · UEL 5,18 · UECL 5,70 :1 | invariato (già sopra 4,5:1) |

## Cosa ho cambiato (frammenti `src/`, poi `node tools/build-src.mjs` + `check-src` IDENTICO)

- `src/00-head.html` — meta viewport senza `maximum-scale`/`user-scalable=no`; `theme-color` `#0d0f14`; piccolo script che: col rosso
  rimette il meta bloccato, altrimenti accende `cpm-g234`, legge «Riduci animazioni» (`cpm-riduci234`) e fa rispondere `matchMedia`
  «reduce» quando è scelto; espone `__CPM_VP234.blocca()` per la partita. CSS: `touch-action` in partita, cursori `min-height:44px`,
  regola «riduci animazioni», classe `.cpm-sr` (testo solo per lettori di schermo).
- `src/01-bootstrap-tema-avatar.jsx` — `_g234` (rosso `__CPM_NO_G234`), `testoGrande234`/`applicaTesto234` (corpi del tema ×1,3, anche
  dal vivo), `_tastiera234`, `_pt234` (cella Pt appiccicata a destra).
- `src/11-ui-kit-highlight.jsx` — `Tabs`: `tablist`/`tab`/`aria-selected`, etichetta che va a capo invece di tagliarsi;
  `ModalPannello`: `role="dialog"`, `aria-modal`, nome dal titolo, tasto × con nome «Chiudi».
- `src/15-live-match.jsx` — blocco dello zoom al montaggio della partita, sblocco allo smontaggio; testo della pausa.
- `src/18-career-app.jsx` — titolo invisibile per scheda; `aria-current` nella barra; colonna Pt appiccicata; riquadro del Club con le
  righe di dettaglio a tutta larghezza; striscia «Sostieni / Idee» che va a capo col testo grande.
- `src/19-app-root.jsx` — Opzioni: `dialog` con titolo, nomi e ruoli dei 12 comandi, riquadro **👓 Lettura** con «Testo grande» e
  «Riduci animazioni», versione in fondo; l'app si ridisegna quando cambia il testo grande.
- `manifest.webmanifest`, `twa/manifest-twa.webmanifest` — colori e descrizione (la frase è la «Descrizione breve» di `STORE_LISTING.md`).

Le due scelte di lettura stanno nel browser (`localStorage` `cpm-testo-grande`, `cpm-riduci-anim`), **non nel salvataggio**: nessun
SAVE bump.

## Guardiano nuovo: `npm run accessibilita-234`

Verde + rosso `window.__CPM_NO_G234`; «non giudicato» = rosso; verde e rosso stampati per ultimi. Giudica Z (zoom in carriera > 1,5,
in partita ≤ 1,05 con `touch-action`), G (testo grande a 360 e 375: Pt dentro, niente tagli, niente scorrimento orizzontale, corpo ≥
15,5), R (riduci animazioni applicato), C (cursori ≥ 44 px), N (titoli, voce attiva, finestre, 12 comandi con nome, interruttore
«Testo grande»), V (versione), P (pausa), K (Club), E (Coppe ≥ 4,5:1 nelle tre coppe), M (manifest, statico, con la prova del rosso
sui file di `lavoro/197` presi da git). Registrato una volta in `completa`, `carriera` e nella MAPPA di `src/0[0-8]`, `src/1[17]`,
`src/15`, `src/18|16|10` (`node --check ci-runner.mjs` verde).

Esito (due passate, la seconda con la prova R aggiunta):
`VERDE ✓ {"zoomCarriera":5,"titoli":"1/2/2/2/1/1/2/2","coppeUCL":5.17,"coppeUEL":5.18,"coppeUECL":5.7,"club":"326/362","cursori":"49/49/49/49/49","comandiAudio":"12/12","tg360":"pt 37/37 · corpo 16","tg375":"pt 19/19 · corpo 16","zoomPartita":1,"pausa":"Tocca per riprendere"}`
`ROSSO __CPM_NO_G234 ✓ bocciato (19 motivi)`; manifest oggi ✓, sulla base `lavoro/197` bocciato (5 motivi).

## Controlli eseguiti

Uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), sul build di questo ramo; memoria libera ~15 GB, disco 28 GB:

| Controllo | Esito | Tempo |
|---|---|---|
| `accessibilita-234` (nuovo) | ✓ VERDE, rosso bocciato (19 motivi) — due passate | ~6 min |
| `design-system` | ✓ SISTEMA GRAFICO OK | <1 s |
| `griglia-mobile` | ✓ uscita 0, 14 schermate × 5 larghezze | 244 s |
| `tema-unico` | ✓ VERDE, rosso atteso OK | 52 s |
| `home-199` | ✓ VERDE | 253 s |
| `rosa-228` | ✓ VERDE (rosso bocciato) | 50 s |
| `calendario-218` | ✓ VERDE | 70 s |
| `tocco-213` | ✓ VERDE (rosso bocciato) | 412 s |
| `test:logic` | ✓ 51 pass · 0 fail | 3 s |
| `save-compat` | ✓ 12 pass · 0 fail | 10 s |

`griglia-mobile` e `home-199` hanno riscritto foto di altri giri (`docs/collaudo-grafico/g0/`, `docs/sviluppo/giro199/`): rimesse con
`git checkout --`, non committate. Dopo ogni modifica a `src/`: `node tools/build-src.mjs` + `node tools/check-src.mjs` → «IDENTICO
BYTE PER BYTE».

## Cosa NON ho fatto (e perché)

- **PO-393 parte 2 — «più tempo per scegliere»**: non fatta. G181-22 stessa dice che tocca la decisione «nessun selettore di difficoltà,
  né ora né in futuro»; non decido io.
- **PO-393 parte 3 — tutorial a comparsa al posto delle 6 pagine**: non fatta (costo 2 secondo G181-22, riapre PO-321).
- **Versione tolta dalla testata**: non fatta. La versione è stata **aggiunta** in Opzioni, ma resta anche in testata, perché lì l'ha
  messa la decisione PO del 17/10 («Spostarlo nella testata», PO-269) e la tengono i guardiani `chip-269` e `badge-255`. Vedi dubbi.
- **Coppe**: nessuna modifica, perché misurato già leggibile (caso peggiore 5,17:1 su UCL; il 2,4-2,8:1 del giro 195 è precedente alla
  correzione del giro 218, PO-483). Il guardiano lo tiene comunque.
- **Testo grande** agisce sui corpi del tema (`FS`, oltre 2.300 usi); i circa 50 corpi scritti a mano in px non crescono. A 1366 il
  corpo minimo col testo grande è 14 px (uno di quelli). Classifica ed etichette sono verificate solo a 360 e 375.
- **Finestre senza titolo** (la finestra della settimana, quella della partita) sono annunciate come «Finestra»: il ruolo e la
  modalità ci sono, il nome specifico no.
- **Annunci dei cambiamenti** (`aria-live`, segnalati dal giro 195): non fatti, non erano nella voce.
- **Meta `description` dell'HTML** resta in inglese: la voce chiedeva la descrizione nel manifest.
- **MAPPA mirata**: per i file toccati (`src/00, 01, 11, 15, 18, 19`) la mappa dà **229 passi**, e `src/19` porta con sé l'intera
  catena completa. Come da regola PO-504 A ho eseguito solo il mio guardiano e i controlli della consegna; gli altri (fra cui
  highlight-95, ingresso-206, career-critical, chip-269, badge-255) restano alla verifica di rilascio.
- **Nessuna prova su telefono vero né con TalkBack vero**: tutto è Chromium headless con emulazione mobile e albero di accessibilità.

## Dubbi per il PO

1. **Versione in testata**: G195-15 diceva «fuori dalla testata (per esempio in Opzioni)», PO-459 dice «versione in Opzioni». L'ho
   aggiunta in Opzioni e lasciata in testata (decisione 17/10). Va tolta dalla testata? Se sì, cambiano anche `chip-269` e `badge-255`.
2. **Colore dell'app**: ho uniformato a `#0d0f14` (il fondo del tema unico, già usato da app Android, TWA e `colors.xml`) sia il
   manifest web sia il meta `theme-color` della pagina. Sul sito la barra del browser passa da bordeaux `#8e1f33` a quasi nero. Era
   questo il colore voluto, o il bordeaux del marchio per tutti?
3. **Descrizione**: ho usato la «Descrizione breve» di `STORE_LISTING.md` («Vivi la carriera di un calciatore: dalle giovanili ai
   grandi stadi. Decidi tu.»). Va bene la stessa frase dello store?
4. **Testo grande ×1,3**: è il fattore della voce (130%). Su schermi da 360 le schede si allungano; la Classifica scorre di lato con la
   colonna dei punti ferma. Va bene ×1,3 o preferisce un gradino più piccolo?
5. **Zoom in partita**: se si entra in partita già ingranditi, l'ingrandimento resta (si può solo impedire di ingrandire ancora, non
   riportare a 1 da codice: misurato che cambiare il meta a pagina aperta non agisce). Accettabile?
6. **Riduci animazioni** spegne le animazioni dei menu e i punti 3D che già rispettavano la preferenza di sistema; non tocca il
   movimento della partita 3D. È l'ambito giusto?
7. **Più tempo per scegliere** (PO-393 parte 2): da fare come aiuto di lettura, nonostante la regola «nessun selettore di difficoltà»?
