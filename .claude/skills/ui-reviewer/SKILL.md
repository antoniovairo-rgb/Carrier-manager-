---
name: ui-reviewer
description: "Interfaccia di Korward Elite col vincolo TELEFONO (412x915): da usare quando tocchi schermate, card, modali, nav, tab o colori di CareerApp — scroll orizzontale, safe-area, strisce che coprono l'ultima card, token TH/FS/FW/RAD invece di colori cablati, dark mode, primitive riusabili, verifica per screenshot perche' il gate e' cieco."
---

# ui-reviewer — la schermata deve funzionare su un telefono

## Quando si attiva
Modifiche a schermate/card/modali/nav/tab/liste/testi/colori di `CareerApp`, `HomeScreen`,
`CreateScreen`, `OffersScreen`, `TrialFlow`, `FormationView`, `MatchdayCard`, overlay e wizard.
Non copre il 3D in campo (→ `realism-reviewer`) ne' quale suite lanciare (→ `game-qa`).
Il gate 14/14 **non vede nulla di tutto questo**: qui l'unica prova e' uno screenshot in-game.

## I sei vincoli, in ordine di danno
1. **412x915 e' il dispositivo vero.** Sotto `min-width:900px` la nav e' la barra in basso
   (`.cpm-nav-tabs`), sopra diventa sidebar (`.cpm-scroll` padding-left 244px). Ogni layout va
   pensato per la colonna stretta, il desktop e' il caso facile.
2. **La pagina non scorre mai in orizzontale.** Tabelle, righe di chip, tabelloni e liste larghe
   scorrono dentro il PROPRIO contenitore (`overflowX:"auto"` + `WebkitOverflowScrolling:"touch"`,
   pattern gia' in uso ai wrapper delle tabelle) e i figli hanno `minWidth:0`.
3. **Safe-area e strisce fisse.** Il fondo pagina si paga con
   `calc(80px + env(safe-area-inset-bottom,0px))`; le strisce ☕/💡 sopra la nav coprono l'ultima
   card e per questo esiste `hideStrips` (si nascondono a fine scroll). Se aggiungi contenuto in
   coda, verifica che l'ULTIMA card sia raggiungibile e cliccabile.
4. **Colori solo dai token.** `TH` (~318, e' un `let`: il dark lo shadowa), `TH_DARK` (~353),
   `FS` (376), `FW` (377), `RAD` (379). Un colore
   cablato e' un pannello invisibile in dark mode: 14 pannelli `#f8fafc` erano illeggibili prima del
   6.45. Il file ha ~2700 esadecimali: molti sono legittimi (colori sociali dei club, palette 3D,
   accenti di brand) — il divieto vale su **sfondi e testo delle superfici UI**, che devono venire
   da `TH.card/surface2/bg/text/muted/faint/cardBorder`.
5. **Prima riusare, poi disegnare.** Esistono gia' `Card`, `Btn`, `StatBar`, `OvrRing`, `Modal`,
   `TeamBadge`, `JerseyIcon` e i wrapper scroll di tabelle/tab. Cercali prima di inventare un box:
   `grep -nE "^(const|function) (Card|Btn|StatBar|OvrRing|Sparkline|Badge|MatchBadge|Meter|KpiTile|Modal|BottomSheet|Tabs|DataTable|TeamBadge|JerseyIcon)[=(]" CARRIER-MANAGER-AV.html`
   ⚠️ le due forme convivono: `Card`/`Btn`/`StatBar`/`OvrRing` sono `const`, tutte le altre sono
   `function`; il foglio dal basso si chiama **`BottomSheet`**, non `Sheet`.
   Un componente nuovo si giustifica solo se nessuna primitiva lo copre.
6. **Il testo deve entrare.** Nomi di competizione, brand dei cartelloni, tagline: su canvas si
   riduce il font finche' entra (`measureText` + shrink, vedi `_fit` ~9990); in DOM si usa
   `minWidth:0` + ellissi o una riga di riepilogo piu' corta. Il nome piu' lungo del pool e' il
   caso di prova, non quello medio.

Regola a parte: **gli hint da tastiera solo dove c'e' una tastiera** —
`!window.matchMedia('(hover: none)').matches` (~20967). Niente `[Enter]`, `[Esc]`, `premi 1/2/3`
sul telefono.

## Procedura
1. **Audit prima dell'edit.** `grep -n` il testo visibile o il nome del componente, leggi solo
   l'intorno. Dichiara: quale schermata, quale primitiva riusi, quali token, cosa NON cambia.
2. **Misura lo stato attuale con uno screenshot**, non a memoria: scegli la probe piu' vicina fra
   quelle esistenti e clonala (vedi Comandi). Regole del save sintetico (coerenza col database,
   altrimenti la migration ripara e misuri un'altra schermata): `auto-regression`.
3. **Applica la modifica** (→ `patch-only`).
4. **Rimisura**: stesso screenshot chiaro **e** scuro, 412x915. Confronta prima/dopo.
5. **Non-regressione**: gate 14/14 (transpile + il resto del gioco) e, se hai toccato anche dati
   persistenti, i guardiani carriera (→ `auto-regression`).

## Comandi
```bash
cd /home/user/Carrier-manager-/tests/visual
export CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers

# probe da clonare: save sintetico -> boot -> screenshot (scegli la piu' vicina)
node darkmode-shot.mjs          # dark mode: usa localStorage 'cpm-dark'='1'
node prestige-display-test.mjs  # pre-partita / FormationView, misura un valore a schermo
node home-navbar-shot.mjs       # nav e home
node postmatch-news-shot.mjs    # post-partita
ls *shot*.mjs *test*.mjs        # ~240 script: cerca prima, non riscrivere

# gate obbligatorio prima del push, anche per una modifica di sola UI: comando in `game-qa`
```
Scheletro di una probe UI nuova (dall'harness): `startServer` → `launchBrowser` →
`page.newPage({viewport:{width:412,height:915}})` → `installCdnRoutes` →
`addInitScript` che scrive `localStorage['cpm-v3']` e `window.__CPM_GLB=false` →
`goto(...?cpmtest=1)` → attesa di `#root` popolato → click "Continua" → `page.screenshot`.
Aggancia sempre `page.on('pageerror')`: zero errori e' parte del verdetto.

## Criteri di uscita
- Screenshot 412x915 **chiaro e scuro** allegati o descritti, prima/dopo, 0 `pageerror`.
- Nessun scroll orizzontale della pagina (`document.scrollingElement.scrollWidth <= clientWidth`).
- Ultima card della schermata visibile e cliccabile con le strisce presenti.
- Nessun colore cablato nuovo su superfici/testo; tipografia da `FS`/`FW`, raggi da `RAD`.
- Nessun hint da tastiera su touch; nessuna primitiva duplicata.
- Gate 14/14 verde con fingerprint invariato.

## Errori gia' commessi
- **Giudicare la UI dal gate.** Il gate carica il gioco e forza le situations: se una card e'
  invisibile in dark mode o l'ultima riga sta sotto la nav, passa lo stesso. Serve lo screenshot.
- **Colori pastello cablati.** `#f8fafc` su 14 pannelli = pannelli bianchi su testo bianco in dark.
  Stesso rischio ogni volta che si copia-incolla un box da un'altra schermata.
- **Provare solo su desktop largo.** Sopra i 900 px la nav e' sidebar e c'e' spazio: il difetto
  compare esattamente nella colonna stretta che il PO usa.
- **Dimenticare la safe-area.** Su iPhone la barra di sistema mangia l'ultimo bottone; il padding
  di coda va sempre in `calc(... + env(safe-area-inset-bottom,0px))`.
- **Testo tarato sul caso medio.** Cartelloni e nomi competizione sforavano perche' il font era
  fisso: si misura col nome PIU' LUNGO del pool, e si riduce con `measureText`.
- **Scroll orizzontale nascosto.** Una riga di chip senza contenitore proprio fa scorrere l'intera
  pagina: il difetto si vede solo trascinando, mai in uno screenshot statico — vai a controllare
  `scrollWidth` nella probe.
- **Save sintetico incoerente**: la migration ricostruisce calendario/classifica e stai guardando
  un'altra schermata — trappole dei save sintetici in `auto-regression`.
- **Toccare il file mentre gira il gate**, o editare senza aver letto `GAME_VERSION`: `patch-only`.
- **Riscrivere una probe che esiste.** Prima `ls tests/visual/*shot*.mjs`: la schermata che ti
  serve ha quasi sempre gia' il suo script.
