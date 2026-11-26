# Giro 402 — Sonorità dell'intera partita in LUFS (PO-577)

**Voce:** PO-577 — misurare la sonorità dell'intera partita in LUFS integrati (obiettivo telefoni −18 ±2 LUFS) e i picchi.
⚠️ Sulla base `lavoro/201` (ccbed19) **non trovo** la riga PO-577 in `docs/governo/BACKLOG.md` né il file
`docs/sviluppo/giro297/VALUTAZIONE-SKILL-GAMEDEV.md` (grep su tutto il repo: zero risultati). Ho lavorato sul testo del compito.
**Base:** `lavoro/201` @ ccbed19 · **ramo:** `sviluppo/giro402-lufs` · GAME_VERSION e docs/governo non toccati.
**Guardiano:** `npm run lufs-402` (da `tests/visual`; verde + rosso nello stesso giro, ~5 min 20 s) · **rosso:** `window.__CPM_NO_G402`.

## In breve

| partita vera, seme 402 (2-0) | PRIMA (rosso) | DOPO (verde) | obiettivo |
|---|---|---|---|
| LUFS integrati | **−28,6 … −30,5** (7 corse valide) | **−18,9** | −18 ±2 → [−20, −16] |
| picco vero | −3,8 … −4,4 dBTP | **−1,6 dBTP** | ≤ −1,0 dBTP (soglia dichiarata da me: EBU R128 / piattaforme) |
| breve termine max / mediana | −15,2…−17,6 / −36,8 | −8,5 / −23,9 | — |
| margine letto ↔ effetti (controllo 7 di `audio-172`, ≥ 6 dB) | 8,8 dB (giro 172) | vedi §5 | ≥ 6 dB, soglia non toccata |

## 1. Strumento (punto 1 del compito)

- **Cattura** (`src/09`, `AudioMgr.ensureCtx`): solo con `?cpmtest=1` **e** `window.__CPM_AUDIO402` l'AudioMgr non è muto e un
  `ScriptProcessor` a 4 canali allineati copia i campioni PCM float dell'**ultimo nodo prima dell'uscita** (0-1) e del **bus della
  folla** (2-3, serve solo alla taratura). Niente compressione lossy (il giro 172 registrava in opus). `window.__CPM_CAP402_PULL()`
  consegna a pezzi da ~2 s. Fuori da quella coppia di condizioni non nasce nulla.
  ⚠️ Misurato e corretto durante il giro: un `ChannelSplitter` è «discreto» e a un segnale mono lascia il canale destro a zero
  (rosso sceso a −33,4 LUFS, −3 dB finti). Prima dello splitter c'è un nodo `explicit/speakers` a 2 canali, come l'altoparlante.
- **Misura** (`tests/visual/lib/lufs-402.mjs`, implementata nel test, nessuna libreria): ITU-R BS.1770-4 — pesatura K (coefficienti
  per qualunque frequenza), momentanea 400 ms / passo 100 ms, integrata con soglia assoluta −70 LUFS e relativa −10 LU, breve termine
  3 s (max, mediana, p95, p10), picco di campione e **picco vero** (sovracampionamento ×4, FIR polifase sinc-Kaiser).
- **Controllo incrociato** con `ffmpeg ebur128=peak=true` (`CPM_WAV=1`): seno 1 kHz −20 dBFS → −20,0/−20,0 LUFS e −20,0/−20,0 dBTP;
  rumore a impulsi → −5,7/−5,7 e −0,7/−0,7; partite vere → −30,4/−30,4 · −30,2/−30,2 · −17,8/−17,8 LUFS, picchi uguali al decimale.
- **Partita:** provino vero, nome «Lufs402», pilota automatico seedato (seme 402, `policy:'seeded'`), clock vero; dal via del pilota
  al fischio finale (`__CPM_PHASE()==='ended'`), ~290-308 s reali, 2-0 in tutte le corse.
- **«Non giudicato» = rosso:** contesto audio non `running` o muto, partita non finita, < 60 s catturati, cattura < 90% del tempo di
  partita, letto reale della folla non caricato, errori di pagina. Copertura misurata: 99,9-100% in tutte le corse, anche coi due
  bracci in parallelo.
- **Variabilità dichiarata:** stesso seme, il rosso oscilla fra −28,6 e −30,5 LUFS (una corsa ha un evento forte in più: breve termine
  max −15,2 contro −17,5). È il tempo reale dell'audio, non lo strumento (ffmpeg concorda sempre). Lo considero nelle scelte sotto.

## 2. Causa misurata

La partita è un **letto di folla basso** (mediana breve termine −36,8: scelta del giro 172, letto ≥ 6 dB sotto gli effetti) con
**effetti a punta**: misurati isolati senza correzione, calcio/parata/testa hanno picco −8 dBFS ma sonorità momentanea −27/−29
(**19 dB** fra picco e sonorità), il fischio −15/−16. Conseguenze, tutte misurate con la sonda `misura-402.mjs`:
- guadagno puro +12,4 dB: −18,0 LUFS ma picco **+8,4 dBTP** (clipping);
- guadagno unico +15 sul master + limitatore (prima versione di questo giro): −18,3 LUFS, −1,9 dBTP in partita vera, **ma** `audio-172`
  rosso sul controllo 7 (margine letto/effetti **0,8 dB** contro ≥ 6: il limitatore schiacciava gli effetti) e sul 10 (i suoni di
  menu passavano dal master col guadagno della partita);
- il `DynamicsCompressorNode` di Chromium/WebKit aggiunge da sé un guadagno di compensazione = 0,6 × la riduzione della curva a 0 dBFS
  (misurato +5,7 dB a soglia −10): alzava anche il letto.

## 3. Correzione (punto 2) — `src/09-audio-scout-anagrafiche.jsx`, `AudioMgr`

`_P402={crowd:13,match:20,referee:12,thr:-3,knee:0,ratio:20,att:0.0005,rel:0.01,thr2:-2.5,att2:0.001,rel2:0.2}`
- **Guadagni di bus dichiarati, solo in partita** (`_bg402`, fra `enterMatch` e `exitMatch`, applicati da `applyBus` e alla nascita dei
  bus): folla +13 dB, effetti di gioco +20 dB, arbitro +12 dB. I bus `sfx` (menu) e `music` non cambiano mai.
- **Due limitatori in uscita**, ciascuno seguito da `_comp402` che toglie la compensazione automatica (sotto soglia: trasparenti):
  rapido a −3 dB (attacco 0,5 ms, rilascio 10 ms: taglia il colpo senza abbassarne la coda, così gli effetti restano sopra il letto) e
  di sicurezza a −2,5 dB (rilascio 200 ms: il rapido da solo sforava a +2,4 dBTP).
- Rosso `window.__CPM_NO_G402`: guadagni 1, nessun limitatore = la base. Manopola `window.__CPM_T402` letta **solo** in collaudo 402.

**Taratura** (`tests/visual/misura-402.mjs`): la registrazione del rosso (uscita = somma dei bus, catena lineare) e il suo bus della
folla passano in un `OfflineAudioContext` per la stessa catena (folla × gF, resto × gE, due limitatori, compensazioni); il margine del
giro 172 si stima facendo passare per la stessa catena gli effetti e il letto registrati isolati (il modello riproduce la base: 8,8 dB,
e la prima versione: 1,1 stimati contro 0,8 misurati). Righe principali (I LUFS / TP dBTP / margine stimato):

| catena | I | TP | margine |
|---|---|---|---|
| master +15, limitatore −4 lento | −18,1 | −1,6 | 1,1 |
| folla +14 · effetti +16, rapido −3 + sicurezza −4 | −18,5 | −2,8 | 3,5 |
| folla +12 · effetti +18, rapido −3 + sicurezza −2,5 | −19,0 | −1,7 | 7,5 |
| **folla +13 · effetti +20, rapido −3 + sicurezza −2,5** | **−18,4** | **−1,6** | **7,2** |
| folla +14 · effetti +21, idem | −17,9 | −1,6 | 6,5 |

In partita vera la scelta dà **−18,9 / −1,6** (offline −18,4: l'arbitro a +12 invece di +20 toglie ~0,5 LU; nella taratura il fischio
stava nel «resto»).

## 4. Guardiano (punto 3)

`npm run lufs-402` → `tests/visual/lufs-402.mjs`: due browser in parallelo. Verde: I in [−20, −16] **e** picco vero ≤ −1,0 dBTP; rosso:
deve stare fuori. `CPM_BRACCIO=verde|rosso` per un braccio solo, `CPM_WAV=1` salva i WAV (uscita e bus della folla) e confronta con
ffmpeg. Voce aggiunta nella riga esistente `[/src\/05-|src\/09-/]` della MAPPA (`ci-runner.mjs`); `mappa-unica` verde.

`node ci-runner.mjs giro lufs-402` sul build esatto del ramo (7.999.216): **18/18 verdi** — lufs-402 (323 s), mappa-unica,
test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298,
web-237, career-critical, battito-264, partita-vera (643 s), gk-dive-sync, schermate-97. Nessun passo ripetuto.
Corse del guardiano col progetto finale: verde −18,9 / −1,6 dBTP e, dentro il giro, −19,0 / −1,7 dBTP (308 s catturati); rosso −28,7 / −4,2.

## 5. Non-regressione audio (`audio-172`)

`node audio-172.mjs` (sito `dist-web` con audio vero, stesso codice di questo ramo), due corse:

| controllo | prima versione (master +15) | versione spedita (per bus) |
|---|---|---|
| 7 letto ≥ 6 dB sotto gli effetti | ✗ margine **0,8 dB** | ✓ margine **7,1 dB** (letto −23,8, effetti −16,7; stima offline 7,2) |
| 10 menu: picco in uscita ≤ −18 dBFS | ✗ −5,3 dBFS (la sonda chiude con `hushMatch()` senza `exitMatch()`: i menu prendevano il guadagno del master) | ✓ −20,3 / −21,0 dBFS (il bus `sfx` non ha guadagno) |
| 3, 4, 6, 8, 9, 11, 12, 13 | ✓ | ✓ |
| 2 peso del registro audio < 6 MB | ✗ 8,03 MB | ✗ 8,03 MB — **preesistente**: è statico (file in `assets/audio`), questo ramo non tocca asset |

Il braccio rosso del 172 cade come deve su 3, 4, 6, 7, 8, 9, 10, 11. Quindi `audio-172` resta rosso **solo** per il controllo 2, che
era rosso anche prima di questo giro (segnalo: il registro è cresciuto oltre il tetto del giro 149 in qualche giro precedente).

## 6. File toccati

- `src/09-audio-scout-anagrafiche.jsx` — `AudioMgr`: `_A402`, `_no402`, `_P402`, `_p402`, `_bg402`, `_comp402` (nuovi); `SILENT`
  (eccezione del collaudo 402); `ensureCtx` (bus col guadagno della partita, due limitatori, cattura); `applyBus`;
  `enterMatch`/`exitMatch` (un `applyBus()` ciascuno).
- `CARRIER-MANAGER-AV.html` — ricomposto (`build-src`; `check-src` identico).
- `tests/visual/lib/lufs-402.mjs`, `tests/visual/lufs-402.mjs`, `tests/visual/misura-402.mjs` (nuovi); `tests/visual/package.json`
  (script `lufs-402`); `tests/visual/ci-runner.mjs` (una voce nella riga 05/09 della MAPPA).

## 7. Dubbi per il PO (la prima è la consigliata, già applicata)

1. **(APPLICATA) −18,9 LUFS con guadagni per bus e doppio limitatore, margine del giro 172 tenuto.** Dentro l'obiettivo ma nella metà
   bassa (1,1 LU dal bordo −20): con la variabilità misurata del rosso (~2 LU fra corse) il guardiano può avvicinarsi al bordo.
   Il limitatore rapido taglia fino a ~10 dB sul colpo dei calci: da sentire sul telefono (rischio: colpi «secchi»).
2. **Centrare −18 alzando ancora il letto** (folla +14 · effetti +21): −17,9 offline, ma margine del giro 172 stimato 6,5 dB (al filo
   della soglia 6). Più forte, più fragile sull'altro guardiano.
3. **Correggere alla sorgente i file degli effetti** (calcio, parata, testa: 19 dB fra picco e sonorità) con una normalizzazione/limitazione
   offline dei campioni: meno limitatore in gioco e più margine ovunque, ma è un lavoro sugli asset (e il registro audio è già 8,03 MB
   contro il tetto di 6 del giro 149, controllo 2 di `audio-172` rosso già sulla base).
4. **Limitatore vero in AudioWorklet** (anticipo e picco vero, nessuna compensazione automatica): più preciso del compressore del
   browser (oggi due stadi per tenere il picco), più codice da mantenere.

**Limiti dichiarati:** una sola partita seedata (seme 402); misura dell'uscita digitale WebAudio in Chromium headless — il compressore è
lo stesso codice di Chrome Android e WebKit, ma **su un telefono vero non l'ho verificato**; la resa degli altoparlanti non è misurata.
