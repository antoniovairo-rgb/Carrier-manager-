# Rapporto giro 20 — PO-238 brusio di folla («Sostituiscilo») · PO-241 attesa dei corpi

Ramo `sviluppo/brusio-238`, creato da `lavoro/167` e0abe8f (7.999.167). `GAME_VERSION` **non** cambiata (istruzione del giro).
Zona G (carriera, economia, stagioni, offerte, Nazionale, Ufficio) non toccata. Nessun push su `main`.

Fonti lette: `CLAUDE.md`; `docs/governo/CREDITI-fonti.md` e la voce «14/10 sera — brusio di folla» di `docs/governo/DECISIONI.md`.
⚠️ Nessuna delle due è su `lavoro/167`: `CREDITI-fonti.md` è su `main` (commit 06dd711e), la decisione «Sostituiscilo» è sul ramo
`poc/marioprada-character-system` (commit b7c17a6a, DECISIONI.md riga 329). Ho portato `CREDITI-fonti.md` su questo ramo (copia da
`main`, con la riga del brusio aggiornata). La voce di DECISIONI non l'ho ricopiata: sta già su quel ramo e duplicarla creerebbe un
conflitto all'integrazione.

## 1. PO-238 — il brusio di folla

### Misura PRIMA (vecchio file)

Strumento nuovo: `tools/misura-brusio.mjs <file>` (decodifica con ffmpeg, stessa strada per mp3 e wav).

`assets/audio/sfx/crowd/freesound_community-football-crowd-3-69245.mp3`:

| | valore |
|---|---|
| durata del loop | 39,29 s · stereo · 24 kHz |
| picco · RMS (mono) | 0,137 (-17,3 dBFS) · 0,0172 (-35,3 dBFS) |
| loudness integrato EBU R128 | -34,1 LUFS |
| silenzio in testa / in coda | **43,8 ms** / 0,3 ms |
| livello nei 20 ms a cavallo del giunto, rispetto alla mediana delle finestre da 20 ms | **-46,8 dB** (minimo -70,3 dB) |
| centroide spettrale | 914 Hz |

Il silenzio in testa è il ritardo dell'encoder mp3: con `src.loop=true` (src/09-audio-scout-anagrafiche.jsx, `_startRealBed`) il
brusio si **interrompeva per ~44 ms ogni 39 s**. Era un difetto del vecchio file in più rispetto alla licenza.

### Il file nuovo: generato da noi

`tools/gen-crowd-bed.mjs` → `assets/audio/sfx/crowd/brusio-folla-korward.wav`. Nessun campione di terzi: solo numeri pseudo-casuali
con seme fisso (mulberry32), quindi il file è riproducibile byte per byte (due generazioni → stesso md5 `043ad0bd…`). Procedimento:

1. **corpo** — rumore costruito in frequenza: forma rosa, passa-alto 220 Hz, rigonfiamento attorno a 950 Hz, passa-basso 2,8 kHz
   (la distanza), fasi casuali, FFT inversa su 2^19 campioni;
2. **chiacchiericcio** — 2600 grani vocali sintetici (fondamentale 95-270 Hz, formanti di a/e/o/u/i, inviluppo di Hann) sovrapposti,
   filtrati come il corpo più un passa-alto a 260 Hz;
3. **ondate** — 12 «ooh» lontani più forti;
4. **respiro** — modulazione lenta del livello con 2, 5 e 11 cicli interi nel loop.

Tutto è **circolare**: la FFT inversa produce un segnale periodico, i grani sono scritti modulo la lunghezza, le modulazioni hanno
cicli interi. Il loop non ha giunto per costruzione. Formato WAV PCM 16 bit mono 22050 Hz, 23,78 s, 1 MB (mp3 escluso apposta: il
suo ritardo d'encoder è proprio il buco misurato sopra).

Il colore è stato tarato sul vecchio per bande d'ottava (due iterazioni): prima versione centroide 464 Hz (troppo cupa), finale 820 Hz.

### Misura DOPO

| | vecchio mp3 | nuovo wav |
|---|---|---|
| durata del loop | 39,29 s | 23,78 s |
| picco · RMS | -17,3 · -35,3 dBFS | -5,7 · -20,0 dBFS |
| loudness integrato (stereo, R128) | -34,1 LUFS | -16,9 LUFS |
| silenzio in testa | 43,8 ms | 0 ms |
| livello nei 20 ms del giunto vs mediana | -46,8 dB | **+1,0 dB** (minimo vicino -0,8 dB) |
| salto fra l'ultimo e il primo campione / 99,9° percentile dei salti del file | — (il file parte dal silenzio) | 0,62× (sotto un salto ordinario: nessun clic) |
| energia per ottava (dB sul totale) 250/500/1k/2k/4k/8k | -14/-5/-3/-9/-20/-36 | -7/-5/-4/-10/-19/-29 |

**Guadagno ritarato**: `_bedGain` (src/09-audio-scout-anagrafiche.jsx, riga di `const _bedGain`) moltiplicato per **0,138** =
10^(-17,2/20), la differenza di loudness: in partita il brusio esce alla stessa sonorità di prima. Picco in uscita a momentum
massimo 0,52 × 0,55 = 0,29 (prima 0,55): nessun rischio di saturazione.

### Cosa è cambiato

- `src/09-audio-scout-anagrafiche.jsx`: `URL_SFX['crowd.bed']` punta al nuovo file; interruttore rosso `window.__CPM_NO_BRUSIO238`
  (il brusio non si carica → suona il synth di riserva già esistente in `crowdStart`); hook di prova `window.__CPM_BRUSIO238()` (file
  in uso, buffer decodificato, durata); `_bedGain` ×0,138.
- `src/17-menu-creazione-pannelli.jsx`: la voce dei Crediti diventa «Brusio di folla — Generato per il gioco da rumore filtrato e voci
  sintetiche, nessun campione di terzi (tools/gen-crowd-bed.mjs). Licenza: Realizzato per Korward Elite». La voce «fonte da
  completare» del brusio sparisce (ne restano 7, che non riguardano questo giro).
- Il vecchio mp3 è **cancellato** dal repo (`git rm`). Cartelle di build: `dist/`, `dist-web/`, `android/` sono in `.gitignore` e
  nessuna è presente qui; `tools/build-dist.mjs` copia `assets/` intero, quindi alla prossima build il file non c'è più.
  Restano menzioni **storiche** del vecchio nome solo in `docs/` (rapporto giro 15, CREDITI-fonti che ne racconta la sostituzione),
  in `reports/codex/2026-09-28-fluidita-3d.json` e nella copia d'archivio `tests/character-lab/recovery/…compacted-before-recovery.html`:
  non sono il gioco e non le ho toccate.
- `assets/audio/sfx/crowd/README.md`: nuova riga, procedimento e tabella delle misure.
- `docs/governo/CREDITI-fonti.md`: riga del brusio riscritta (autore: noi; licenza: nostra; fonte: lo script).
- Build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO**.

### Guardiano `brusio-238` (`npm run brusio-238`)

1. statico: il vecchio file non è in `assets/`, il gioco e `src/` non contengono `football-crowd` né `69245`, il gioco registra il file nuovo;
2. percorso vero (pagina **senza** `?cpmtest`, dove l'audio è vivo): un click sblocca l'audio come farebbe il giocatore, e il **gioco
   stesso** scarica e decodifica il brusio;
3. la sonda ridecodifica il file nella pagina e misura il giunto (tetto ±3 dB);
4. la finestra Crediti nomina il «Brusio di folla» e non contiene il vecchio nome.

Esito: **verde** — file nuovo decodificato dal gioco in 305 ms, durata 23,777 s, giunto +1,06 dB.
**Rosso** (`CPM_ROSSO=__CPM_NO_BRUSIO238`): nessun file in uso, nulla decodificato in 15 s → uscita 1. `crediti-238` resta verde.
Aggiunto a `package.json`, alla catena `completa` e alla mappa della `mirata` (src/09 e src/17).

### Come riascoltarlo (PO)

Il collaudo vero è l'orecchio, sul telefono:
1. **il file da solo**: <https://github.com/antoniovairo-rgb/Carrier-manager-/raw/sviluppo/brusio-238/assets/audio/sfx/crowd/brusio-folla-korward.wav>
   (si scarica e si apre col lettore del telefono; dura 23,8 s);
2. **in partita**: la versione del ramo va pubblicata (oggi non è su `main`). Una volta pubblicata: avviare una partita qualsiasi,
   toccare lo schermo (l'audio parte al primo tocco), ascoltare **almeno 30 s** di gioco fluido per passare il punto di loop (a 23,8 s)
   e dire se si sente un ritorno o un clic. Volume del brusio: Impostazioni → audio → «folla».
3. **confronto col synth di riserva** (da computer): aprire il gioco, nella console scrivere `window.__CPM_NO_BRUSIO238=1` **prima del
   primo tocco**, poi avviare la partita. Il vecchio mp3 non è più ascoltabile dal gioco: per confrontarlo serve la versione 7.999.167.

Cose che chiedo al PO di giudicare: il colore (più «stadio lontano» o più «sala piena»?), il livello rispetto al vecchio, e se le ondate
si riconoscono come ripetute dopo qualche giro. Ognuna si ritocca nello script e si rigenera.

## 2. PO-241 — attesa dei corpi prima dell'highlight

### Dove sta l'attesa

`src/15-live-match.jsx`, effetto PO-232 (cerca `attesa dei corpi prima di aprire una scena dell'eroe`): in `playing` il cronometro
resta fermo finché `window.__CPM_CORPI232()` (src/12-three-match-view.jsx, `_corpi232`) non dichiara i corpi pronti, tetto 8 s; nel
frattempo compariva «⏳ Caricamento giocatori…». La prontezza aspetta, in ordine: il corpo «regular» con le sue 19 clip
(`ch38`, `Promise.all` di 22 file in src/12), il montaggio CGTrader (`cgtrader`), la compilazione (`compila`), le teste (`testa`),
le clip in moto (`clip`).

### Misura PRIMA

Sonda nuova `tests/visual/attesa-241.mjs`: provino vero, GLB acceso, contesto nuovo (cache fredda), service worker bloccato, rete lenta
**come nella sonda di PO-232** (ogni `.glb` 2-6 s; teste 2-6 s o 20 s), un tempo «sui menu» prima del provino. Campiona ogni 200 ms
fase, cronometro e `__CPM_CORPI232()`: attesa = tempo in `playing` coi corpi non pronti, ripartito per motivo.

- **Il tempo sui menu si conta da quando il pre-caricamento è partito** (`__CPM_PRE237`): la prima versione lo contava dal «load» e in
  headless Babel trascrive il gioco per ~10 s dopo il load, tempo che sul telefono (build precompilata) non esiste. Errore di
  strumento trovato e corretto prima del confronto.
- Con tutto pre-caricato (60 s di menu) l'attesa è **0 ms** e la prima scena arriva a 3,2 s: l'attesa dipende interamente dai file
  non ancora arrivati. Con rete senza ritardo e 0 s di menu: 6,7-7,8 s (montaggio CGTrader + compilazione).
- Causa: il pre-caricamento al boot di PO-237 (src/11-ui-kit-highlight.jsx, blocco `PRE-CARICAMENTO DEI CORPI`) scaricava **un file
  alla volta**: dopo 15 s di menu era a **4 file su 28**, e la partita doveva riscaricare il resto (richieste viste a +1-5 s dall'apertura).

### Correzione

(a) **caricamento anticipato**: il pre-caricamento tiene **6 file in volo** insieme (il tetto per host di Chrome in HTTP/1.1), stesse URL
e sempre nei momenti d'ozio. Le 19 clip del corpo «regular» sono file piccoli (3,9 MB in tutto), cioè dominati dalla latenza: è lì che
il parallelismo rende. I CGTrader (32,7 MB) restano limitati dalla banda. Primo tentativo a 4 in volo: pre-caricamento 4→13/28 ma attesa
invariata (16,2 s), perché il corpo «regular» non era ancora completo; a 6: 20/28 e il motivo `ch38` sparisce o si dimezza.

(b) **niente scritta tecnica**: il riquadro (`data-cpm="attesa241"`, al centro del campo, che durante l'attesa è fermo) ruota ogni 3,2 s
schede con **soli dati veri**, costruite da `schedeAttesa241` (sopra `function LiveMatch`): punteggio e possesso se il cronometro è già
partito; altrimenti nome/età/valutazione dell'eroe, il suo attributo più alto, il piede preferito, gol/assist/presenze della stagione (se
ne ha), il portiere della propria squadra, centravanti e portiere avversari (gli stessi `homeRoster`/`awayRoster` della cronaca). Una
scheda senza il suo dato non compare. Foto: `tests/visual/out/attesa-241/riquadro-verde-1.png` (la prima posizione, in alto, copriva la
barra delle statistiche: spostata sul campo dopo la foto).

Rosso `window.__CPM_NO_ATTESA241`: un file alla volta **e** la vecchia scritta.

### Misura DOPO (rete 2-6 s per file, teste comprese; 15 s di menu; 4 partite per braccio)

| | rosso (com'era) | verde |
|---|---|---|
| pre-caricamento a fine menu | 4/28 | 20/28 |
| attesa dei corpi, ms | 17 766 · 16 350 · 15 677 · 17 214 | 5 668 · 10 546 · 10 941 · 10 830 |
| **mediana** | **17,2 s** | **10,8 s** (-37%) |
| di cui `ch38` (corpo regular non ancora arrivato) | 9,9-10,7 s | 0-5,8 s |
| prima scena dall'apertura | 19,9-23,6 s | 9,5-18,4 s |
| «Caricamento giocatori…» visto | 4/4 | 0/4 |

⚠️ Limiti dichiarati:
- I tempi sono headless (rendering software): compilazione e montaggio CGTrader (~3,5-5 s + ~1,5-2 s) sono lavoro per partita che qui
  **non** ho anticipato (contesto WebGL nuovo a ogni partita; anticiparlo vuol dire montare la vista 3D prima del fischio — fuori
  ambito). Restano coperti dalle schede.
- Misurato solo sul **provino** (che entra direttamente in `playing`). In carriera la partita passa da presentazione, formazioni e
  ingresso in campo prima del fischio: più tempo per il pre-caricamento. Non l'ho misurato.
- Col caso peggiore di PO-232 (teste a 20 s) l'attesa può restare dominata dalle teste: osservato una volta 20,6 s con 10,2 s di
  `testa` (1 partita su 2). Le teste partivano già in parallelo all'avvio: questo giro non le cambia.
- Il modello di rete della sonda (ritardo fisso per file, banda illimitata) favorisce il parallelismo per costruzione; su un telefono
  vero il guadagno sulle clip piccole è reale, sui file grandi no.

### Guardiano `attesa-241` (`npm run attesa-241` = `node attesa-241.mjs --guardiano`)

2 partite, 15 s di menu, rete 2-6 s. Giudica: mai «Caricamento giocatori», un contenuto nel riquadro se l'attesa supera 1 s, la prima
scena raggiunta, pre-caricamento a fine menu ≥ 12 file (rosso 4, verde 20 — dipende dal modello di rete, non dalla CPU del runner).
Il tempo d'attesa assoluto è **stampato ma non giudicato** di default (`CPM_ATTESA_MAX` per accenderlo): dipende dalla CPU e i runner CI
sono più lenti. Verde: attese 5 499 / 10 362 ms. Rosso (`CPM_ROSSO=__CPM_NO_ATTESA241`): vecchia scritta 2/2 e pre-caricamento 4/28 →
uscita 1. Aggiunto alla `completa` e alla mappa della `mirata` (src/11, src/15, src/17).

## 3. Catena `mirata`

`cd tests/visual && node ci-runner.mjs mirata` sul ramo (base di confronto: `main` remoto): file toccati
rispetto a `main` src/07, 09, 11, 12, 14, 15, 17 (07/12/14 vengono da `lavoro/167`, non da questo giro) → **44 passi**.

**Esito: 44/44 verdi** («catena mirata su 7.999.167: 44/44 verdi»), circa 5 ore, registrato in `docs/governo/STABILITA.json`.

- Guardiani nuovi dentro la catena: `brusio-238` ✅ 13 s · `attesa-241` ✅ 93 s · `crediti-238` ✅ 26 s.
- `validate-situations` ✅ 720 s · `partita-vera` ✅ 512 s · `career-critical` ✅ 729 s · `save-compat` ✅ · `design-system` ✅ ·
  `griglia-mobile` ✅.
- ⚠️ **`gk-miss-229` instabile**: rosso alla prima prova («girata giP6S post: tuffo su un pallone largo, passa a 6,76u, esce a 6,5u
  dal centro»), verde alla seconda. È il comportamento del portiere, che questo giro non tocca; per la decisione PO 13/10 («un guardiano
  instabile due volte si ripara») va tenuto d'occhio: qui è la prima volta che lo vedo.
- `nomi-219` ha impiegato 4300 s (storico 3250-3430 s): più lento perché i passi lenti girano a due a due, non rosso.
- Le foto di `docs/collaudo-grafico/g0/` rigenerate da `griglia-mobile` differivano solo per l'orario mostrato in testata: ripristinate,
  non committate.

## File toccati

`src/09-audio-scout-anagrafiche.jsx` · `src/11-ui-kit-highlight.jsx` · `src/15-live-match.jsx` · `src/17-menu-creazione-pannelli.jsx` ·
`CARRIER-MANAGER-AV.html` (ricomposto) · `assets/audio/sfx/crowd/` (nuovo wav, mp3 cancellato, README) · `tools/gen-crowd-bed.mjs` ·
`tools/misura-brusio.mjs` · `tests/visual/brusio-238.mjs` · `tests/visual/attesa-241.mjs` · `tests/visual/package.json` ·
`tests/visual/ci-runner.mjs` · `docs/governo/CREDITI-fonti.md` · questo rapporto.
