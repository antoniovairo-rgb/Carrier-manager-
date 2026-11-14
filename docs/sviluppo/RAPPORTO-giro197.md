# Rapporto giro 197 — PO-452: le scelte dell'eroe a schermo sui telefoni bassi

Ramo `sviluppo/giro197-scelte`, partito da `lavoro/195` (commit `dab34a7`). Solo `src/15-live-match.jsx` toccato nel gioco;
`CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`, `tools/check-src.mjs` = IDENTICO BYTE PER BYTE.
`GAME_VERSION` non toccato (nel codice vale `7.999.193`, non `7.999.195` come scritto nella consegna: segnalo la differenza, non l'ho corretta).

## 1. Misura prima della correzione (su `lavoro/195`)

Strumento: `tests/visual/scelte-197.mjs misura` — carriera del collaudo 177 (stagione 5, settimana 20), partita vera senza
toccare nulla, primi due highlight per taglia (stessa partita a ogni taglia: un contrasto difensivo e un'azione «fra le linee»).
Dati grezzi: `docs/sviluppo/giro197/prima/misura-prima.txt` e foto `prima/prima-<taglia>-{mossa,scelte}.png`.

| Taglia | Scheda scelte (px) | Riquadro scelte visibile/contenuto | Terza scelta (top-bottom) | Titolo della mossa | Tempo limite |
|---|---|---|---|---|---|
| 360×640 | 357–639 | 129/168 e 113/168 — **scorre** | 616–668 e 632–684 — **fuori** (28–44 px) | 1 riga, **tagliato** | 6 s / 9 s |
| 375×667 | 373–666 | 141/168 e 146/168 — **scorre** | 631–683 e 626–678 — **fuori** (11–16 px) | 1 riga, **tagliato** | 6 s / 9 s |
| 390×844 | 522–843 | 168/168 — non scorre | 781–833 — dentro | 1 riga, **tagliato** | 6 s / 9 s |
| 412×915 | 614–914 | 168/168 — non scorre | 852–904 — dentro | 1 riga, **tagliato** | 6 s / 9 s |

- Causa letta nel codice: la scheda delle scelte aveva `maxHeight: 44vh` (282 px a 640, 293 a 667); titolo (2 righe), consiglio
  (fino a 2 righe), riga di aiuto, barra «Pressione» e tre righe da 52 px non ci stanno, e la lista (`flex` con `minHeight:0`) si
  restringe e scorre.
- Il titolo nel passo di movimento («🛡️ NITZSCHE ti punta a centrocampo: fermalo!») era su una riga con i puntini **a tutte e
  quattro le taglie**, non solo a 375: accanto c'è la pillola della zona («📍 Centrocampo»).
- Il titolo della scheda delle scelte non era tagliato (già su due righe) in nessuna delle scene misurate.
- **Tempo limite:** durata dell'animazione della barra = 6 s e 9 s nelle due scene; nel codice la formula è
  `defDist>60 ? 9000 : defDist>35 ? 6000 : 4000` ms (`_dl905`). Il caso da 4 s non è capitato nelle scene misurate. Non l'ho cambiato.

## 2. Correzione (rosso `window.__CPM_NO_G197`)

In `src/15-live-match.jsx`, solo nella veste attuale (nessun cambio al ramo `__CPM_NO901` né ai testi delle scelte):

1. **Scheda delle scelte:** tetto `max(44vh, 400px)` invece di `44vh`. Sui telefoni bassi la scheda prende altezza alla scena;
   da 909 px di altezza in su il tetto resta il 44vh di prima. La scheda cresce solo quanto serve al contenuto.
2. **Testo sopra le scelte:** la riga «Scegli prima che il marcatore arrivi» sale nella riga della barra («Pressione · scegli
   prima che il marcatore arrivi»), stesso `data-cpm="aiuto"`. La barra del tempo limite e la sua durata sono invariate.
3. **Scelte più grandi:** righe alte almeno 56 px (erano 52 fisse) che crescono col testo; il nome della scelta va a capo invece
   dei puntini — c'è posto per i testi più lunghi di PO-389.
4. **Titolo della mossa:** va a capo per intero (`data-cpm="titolo-mossa"`); la pillola della zona resta in alto a destra.

## 3. Misura dopo (stesso strumento)

Dati: `docs/sviluppo/giro197/dopo/misura-verde.txt`, `misura-rosso.txt`; foto `dopo/verde-<taglia>-{mossa,scelte}.png`.

| Taglia | Scheda scelte (px) | Riquadro | Scelte | Titolo mossa |
|---|---|---|---|---|
| 360×640 | 326–639 e 311–639 (49–51% dello schermo) | 180/180, non scorre | 3 dentro, 56 px | 2 righe, intero |
| 375×667 | 353–666 e 359–666 | 180/180, non scorre | 3 dentro, 56 px | 2 righe, intero |
| 390×844 | 530–843 e 536–843 | 180/180, non scorre | 3 dentro, 56 px | 2 righe, intero |
| 412×915 | 622–914 (32%) | 180/180, non scorre | 3 dentro, 56 px | 2 righe, intero |

Prezzo: a 360×640 la scena 3D sopra la scheda passa da circa 357 a circa 311–326 px di altezza visibile.

## 4. Guardiano `scelte-197` (nuovo)

`npm run scelte-197` (verde) · `node scelte-197.mjs rosso` (accende `__CPM_NO_G197`, deve vedere il difetto).
Verde: ogni scelta dentro lo schermo e alta ≥ 44 px, il riquadro non scorre, titolo della scheda e titolo della mossa interi su
≤ 2 righe, a tutte e quattro le taglie; una taglia senza scheda o senza passo di movimento misurati = «NON GIUDICATO» = rosso.

- **Verde:** 0 difetti, uscita 0.
- **Rosso:** 12 difetti (riquadro che scorre e terza scelta fuori a 360 e 375, titolo della mossa tagliato a tutte le taglie) —
  identici alla misura «prima».

Aggiunto in `package.json`, nella catena `completa` di `ci-runner.mjs` e nella prima voce `src/15-` della mappa mirata
(una volta sola per catena; `node --check ci-runner.mjs` ok).

## 5. Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima di ciascuno)

| Controllo | Esito |
|---|---|
| scelte-197 | verde 0 difetti · rosso 12 difetti |
| highlight-95 | ✅ verde (e il rosso si vede) — VERDE 98 highlight, D4 0 |
| partita-vera | ✅ 12 bande giudicate e tenute, partite finite 2/2 |
| griglia-mobile | ✅ uscita 0, 14 schermate × 5 larghezze |
| solo-highlight-166 | ✅ verde passa, rosso cade su 3, 7 e 8 |
| momento-194 | ✅ verde, rossi bocciati |
| test:logic | ✅ 51/51 |
| save-compat | ✅ 12 pass · 0 fail |

Nota di metodo: la prima corsa di `highlight-95` (oltre 30 minuti) è stata fermata dal tetto dei comandi in sottofondo e ha chiuso
il browser a metà: **non vale**. È stata rifatta da capo sul build esatto, staccata dalla shell, con attese in primo piano. Le foto
rigenerate da `griglia-mobile` e `momento-194` in `docs/collaudo-grafico/g0/` e `docs/sviluppo/giro194/` non sono state committate
(sono rifotografie, non fanno parte di questo giro).

## 6. Dubbi e limiti (per il PO)

1. **Conflitto con la decisione 7.901 «scheda max 44% dello schermo».** La consegna dice «togli altezza alla scena»: l'ho fatto,
   ma solo sotto 909 px di altezza; a 360×640 la scheda occupa ~51%. Il guardiano `hud-c3` (non nella lista dei controlli, gira a
   412×915) asserisce ≤ 44%: a 412×915 il tetto resta 44vh, quindi **non dovrebbe** cambiare, ma **non l'ho eseguito**.
2. **Copertura del guardiano:** due scene per taglia, sempre le stesse (stesso salvataggio). Titoli o scelte più lunghi di
   queste scene (tre righe di titolo, scelte su due righe, sette opzioni) non sono misurati: con sette opzioni sui telefoni bassi
   la lista torna a scorrere dentro il tetto di 400 px (comportamento voluto dal 7.902, non verificato in questo giro).
3. **Tempo limite da 4 s** (marcatore vicino) non capitato nelle scene misurate.
4. **Il ramo vecchio** (`__CPM_NO_HL94`) del passo di movimento ha ancora il titolo su una riga coi puntini: non toccato (è un
   rosso di un altro giro).
5. Misure headless con `__CPM_GLB=false` e `?cpmtest=1`; nessuna prova su telefono vero.
