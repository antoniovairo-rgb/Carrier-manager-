# Rapporto giro 430 — PO-692: brano A in schermata iniziale e video intro

Ramo: `sviluppo/giro430-musica-menu` (base `sviluppo/giro429-musica-menu` 6db3c89). GAME_VERSION e `docs/governo` non toccati.
Non toccati: altoparlante e pannello audio (giro 427), scena 3D dell'intro (giro 428).

## 1. Cosa suonava davvero (misurato, senza `?cpmtest`)

Sonda `tests/visual/misura-430.mjs`. Aggancia `AudioBufferSourceNode.start`, `OscillatorNode.start` e `HTMLMediaElement.play`.
Lega ogni buffer al file da cui è stato decodificato (fetch → arrayBuffer → decodeAudioData) e calcola il guadagno effettivo
verso l'uscita (prodotto dei GainNode sul cammino). Le misure coprono:
- il **sito pubblicato** (https://antoniovairo-rgb.github.io/Carrier-manager-/, versione letta nella pagina: **7.999.217**);
- il build locale `dist-web` della base;
- telefono 390×844 e PC 1366×768;
- primo avvio pulito, tocco, «Rivedi intro», avvio successivo con lo stesso profilo.

Esito, **identico** sui quattro casi (sito/locale × telefono/PC):

| Scena | Cosa parte | Volume (guadagno effettivo) |
|---|---|---|
| Home prima del tocco | niente (l'audio non è ancora sbloccato) | — |
| Home dopo il tocco, primo avvio e successivi | **nessun file di musica.** Parte solo un *buffer generato di 2 s in loop*: è il brusio sintetico di `ambienceStart` (src/09: rumore filtrato 90–480 Hz). Ogni 18–36 s, a caso, si aggiunge un applauso o un «ohh» sintetici (`crowdApplause`/`crowdSwell`) | brusio 0,042 · «ohh» fino a 0,069 |
| Video intro (riascolto dalla home) | lo stesso brusio sotto, più i cinque effetti di `_S13`: `fischio-2.ogg`, `calcio-4.ogg`, `rete-1.ogg`, `boato-2.ogg` (4,6 s), applausi | brusio 0,042 · boato 0,81 |
| Video intro del primo avvio (`phase` «cinematic», letto nel codice) | solo i cinque effetti: `scene('cinematic')` ferma musica e brusio | — |

- `HTMLAudioElement.play`: **0 chiamate** in tutte le scene.
- **Service worker**: la pagina è controllata da `sw.js?v=7.999.217` e la cache `korward-7.999.217` (75 voci) contiene anche
  `music/menu/spiaggia-loop.ogg`, ma **non parte mai** (0 avvii). La strategia è network-first e la cache cambia nome a ogni versione:
  una versione in cache non può suonare un brano diverso da quello che la pagina chiede.
- Dati grezzi: `tests/visual/out/misura-430-{telefono,pc}-{sito,locale}.json`. Non committati: `out/` è fra gli artefatti.

**Risposta.** Sulla 7.999.217, in schermata iniziale e nel video intro, **non suonava nessuna musica**. Quello che il PO sente come
«musica» non posso confermarlo con certezza: il dispositivo del PO non l'ho misurato. Il candidato più probabile secondo la misura è
il **brusio sintetico** della home, l'unico suono continuo (un fruscio grave in loop di 2 s, con applausi e «ohh» sintetici a caso),
insieme al boato e agli applausi dell'intro. È un'ipotesi, non una misura.

## 2. Correzione

`src/09` (AudioMgr) e `src/19` (una riga in `App`). HTML ricomposto con `build-src`, `check-src` IDENTICO.

- `music.home` = **brano A** (`music/menu/429-a-orchestra`, 54,0 s, loop dell'autrice). Si carica al primo tocco, come gli altri file.
- Suona in **home · offerte · creazione · provino (fuori dalla partita) · video intro**: sia quello del primo avvio sia il riascolto,
  anche sopra la carriera. Nel codice è una **sola scena musicale**: passando da una schermata all'altra il brano continua e non
  riparte (misurato: la stessa sorgente dalla home all'intro).
- Dissolvenza del giro 161 (`musicStart`/`musicStop`): misurata in entrata 0,018 → 0,164 in 3 s; in uscita metà guadagno a 250 ms,
  sorgente ferma entro 1,9 s.
- Nell'intro la musica sta **sotto** gli effetti, che restano tutti: A a 0,165, boato a 0,81 (~14 dB sotto).
- **Tolto il brusio sintetico** sotto la musica in quelle schermate: è l'unica altra fonte continua misurata (vedi dubbio 1).
- Muto e volume valgono **dal primo suono**: master a 0 dal primo nodo con il muto acceso; con il volume musica a 0,6 il guadagno è
  0,33; con la musica spenta non parte nulla.
- La musica **si ferma** entrando in carriera (`scene('career')`) e in partita (`enterMatch`). Torna in home e, finito un provino,
  sulla schermata dei provini.
- Tolto l'interruttore di prova del giro 429 (`cpm-menu429`, `__CPM_MENU429`, `_menu429`, `__CPM_NO_G429`). B e C restano nei file
  con la loro licenza, ma non si usano. In `LICENZE.json` il campo `evento` delle sei righe adesso lo dice: A = «home, menu e video
  intro», B/C = «nessuno»; il generatore `prepara-429.py` è allineato.
- Testimone `__CPM_MENU429S` (mantenuto, campi `g430`, `intro`, `brusio`). Gancio **solo di collaudo** `window.__CPM_AUDIO430`, letto
  solo sotto `?cpmtest=1`: l'AudioMgr non è più muto per costruzione e il guardiano misura i nodi veri.
- **Rosso `window.__CPM_NO_G430`** = comportamento della 7.999.217: home con il brusio, nessuna musica.

Misura dopo la correzione (build locale, telefono): in home e nell'intro parte **solo** `music/menu/429-a-orchestra.ogg` in loop,
con guadagno 0,165 (volume musica 0,3 × 0,55). Il brusio non parte più.

## 3. Estratti d'ascolto

Le due registrazioni sono l'**uscita vera** della pagina: tutto ciò che arriva all'AudioDestinationNode, copiato su un
MediaStreamDestination. Le ho fatte sul build locale servito come su Pages, senza cpmtest, con la sonda `tests/visual/registra-430.mjs`.

- `docs/collaudo-po/430-ascolto-home.mp3` — 10 s di home dal primo suono: entra la dissolvenza, poi A. Intensità −34,7 LUFS integrati.
- `docs/collaudo-po/430-ascolto-intro.mp3` — 10 s di intro: A sotto, il tiro a ~4 s, il boato da ~5 a ~9,5 s (momentaneo −17/−19 LUFS
  contro −35/−38 della sola musica).

⚠️ In headless la scena dell'intro scorre più lenta che sul telefono (misurato: il boato arriva ~3 s più tardi dell'orologio di scena),
quindi i *tempi* dell'estratto non sono quelli del telefono. I *livelli* sì.

## 4. Guardiano `npm run musica-avvio-430`

È nella riga MAPPA `src/05-|src/09-` (la riga dell'audio, quella di `musica-316` e `musica-menu-429`). Gira sul banco con il gancio
`__CPM_AUDIO430`, telefono 390×844. Controlla sette cose:

1. in home suona solo A, in loop, al volume della musica: nessun altro `music/*`, nessun loop generato, nessun HTMLAudio;
2. c'è la dissolvenza in entrata;
3. il loop non ha scatto: salto fine→inizio ≤ 99° percentile dei passi, misurato sul buffer che suona;
4. nell'intro la stessa sorgente continua sotto fischio, calcio, rete e folla, e non entra nessun'altra musica;
5. la musica si ferma in dissolvenza in carriera e in partita, poi torna;
6. con il muto acceso nessun nodo è udibile;
7. il volume musica a 0,6 è rispettato, e con la musica spenta non parte nulla.

**Verde 7/7** · **il rosso cade** su 1, 2, 3, 4, 5, 7. La 6 resta verde anche col rosso, ed è corretto: il muto era già rispettato.

`musica-menu-429` aggiornato: la sezione C ora verifica che il vecchio `cpm-menu429=B|C` sia ignorato e che, senza nulla, la home suoni
A da sola. Il rosso è `__CPM_NO_G430`.

Corsa del giro: `cd tests/visual && node ci-runner.mjs giro musica-avvio-430 musica-menu-429` → **19/19 verdi** sul build 7.999.217 + giro 430.

## 5. Dubbi per il PO

**Dubbio 1 — il brusio sotto la musica nelle schermate di menu.**
1. **(consigliata, applicata)** Tolto in home, menu e intro mentre suona A. In carriera resta com'è.
2. Rimetterlo sotto A più basso: per esempio −6 dB, cioè guadagno 0,021.
3. Rimetterlo com'era (0,042, con applausi e «ohh» casuali), sotto A.

**Dubbio 2 — dove suona A oltre a home e intro.**
1. **(consigliata, applicata)** Home, offerte, creazione e schermata dei provini (non durante la partita del provino), più l'intro.
   È tutto il «menu» prima della carriera, e il brano non riparte passando da una schermata all'altra.
2. Solo home e intro: creazione e provini in silenzio, come oggi.
3. Home, intro e creazione, ma non provini e offerte.

**Dubbio 3 — volume di A.**
1. **(consigliata, applicata)** Lo stesso della musica di prima: cursore Musica di default 0,3 × 0,55 → circa −35 LUFS in uscita,
   ~14 dB sotto il boato dell'intro.
2. Più presente: ×0,8 invece di ×0,55 (+3,3 dB).
3. Più discreto: ×0,4 (−2,8 dB).

**Dubbio 4 — crediti e precarica offline.**
1. **(consigliata, applicata)** Nessuna riga nei crediti: CC0, e l'autrice scrive «No attribution necessary». Nessuna precarica in
   `sw.js`: dopo il primo ascolto la pagina passa il file al service worker e il brano è in cache come gli altri.
2. Aggiungere «Determined Pursuit — Emma_MA» ai crediti (src/17, `CREDITI238`), come per «The Storm Chasers» nel giro 316.
   È fuori ambito per questo giro: toccherebbe src/17 e la sua riga MAPPA.
3. Spostare A nella sezione `file` del registro e nella precarica di `sw.js`, al posto di `spiaggia-loop`. Nota: `audio-149` è già
   rosso, preesistente, sul tetto di 6 MB (8,03 MB), e A pesa più di spiaggia. È una scelta da governo.

**Dubbio 5 — «la musica che non mi piace».**
Se dopo questo rilascio il PO sente ancora un suono sgradito in home o nell'intro, ci servono due cose per confermare la causa
sul dispositivo vero:
- la versione mostrata nelle Opzioni;
- una registrazione dello schermo con l'audio.

Il banco non vede il telefono.

## Verifiche

- `musica-avvio-430`: verde 7/7, il rosso cade (vedi §4).
- `mappa-unica`: verde.
- Catena del giro (`ci-runner giro`, 19 passi): **19/19 verdi**. musica-avvio-430 232 s · musica-menu-429 17 s · mappa-unica · test:logic ·
  save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 ·
  career-critical · battito-264 · partita-vera 631 s · gk-dive-sync · schermate-97. Nessun passo instabile.
- La riga di `docs/governo/STABILITA.json` scritta dal runner NON è stata committata (docs/governo fuori ambito per questo giro).
