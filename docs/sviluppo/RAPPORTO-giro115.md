# Giro 115 — PO-321 «Sistemiamo anche il video iniziale, la gestione dei provini, il wizard»

Lotto 7.999.184 (uscita Play Store). Ramo `sviluppo/giro115-flussi`, base `lavoro/184` (= `main` = 7.999.183).
Riferimento: collaudo 184 (`origin/collaudo/184-altezza-flussi:docs/collaudo-grafico/184/RAPPORTO.md`).
Sessione figlia: nessuna decisione di prodotto presa; le scelte prudenti sono scritte qui sotto. `GAME_VERSION` **non toccato**.

## Tabella

Misure del guardiano nuovo **`npm run flussi-115`** (`tests/visual/flussi-115.mjs`): «prima» = braccio rosso (tutti gli
interruttori `__CPM_NO_G115_<NN>`, cioè il comportamento della 183), «dopo» = braccio verde. Formati 360x800 · 412x915 · 1440x900;
dove i tre numeri coincidono ne è riportato uno. Esito finale: **verde 54/54 controlli, 17 punti, tutti giudicati · rosso: cade su
tutti i 17 punti (50 controlli rossi, 1 verde: G184-11 a 412, vedi sotto)**.

| punto | misura prima (183) | misura dopo | interruttore | esito |
|---|---|---|---|---|
| G184-10 micro-tutorial | battuta 2,0-2,2 s; istruzioni a schermo 1,4 / 0,8 / 0,3 s | battuta 5,9 s; **5,1 / 3,9 / 2,7 s** (soglia 2,5 s ciascuna) | `__CPM_NO_G115_10` | ✅ |
| G184-11 didascalie (velo) | chiusura a 360: **1,95:1** (bandiera bianca dietro, soglia 3:1) | minimo **10,7:1** a 360, 14,7:1 a 412 | `__CPM_NO_G115_11` | ✅ |
| G184-12 tasto Salta | 77x33 px, `top:14px` | **86x44 px**, `top: calc(14px + env(safe-area-inset-top))` | `__CPM_NO_G115_12` | ✅ |
| G184-13 audio | nessun suono | fischio · tiro · rete · boato · applauso **via `AudioMgr.play`** | `__CPM_NO_G115_13` | ✅ |
| G184-14 fluidità | — | solo annotato (sotto) | — | annotato |
| G184-15 finale | CTA «Comincia dal provino» anche in riascolto; chiusura **13,2 s** dopo la CTA | riascolto: **«Chiudi ✕»**; chiusura **3,5 s** dopo la CTA | `__CPM_NO_G115_15` | ✅ |
| G184-16 corpo su PC | 15 px a 1440 | **23 px** (`clamp()` sulla larghezza) | `__CPM_NO_G115_16` | ✅ |
| G184-17 nome | «Giovanni Pisano. Numero 9.» | il nome del giocatore («Massimiliano Bartolomu. …», gol «GOOOL DI BARTOLOMU!») | `__CPM_NO_G115_17` | ✅ |
| G184-20 terzo provino | offerte in < 3 s, voto decisivo mai visto | riepilogo dei tre provini (avversario, gol, assist, voto, media) + tasto **«Vedi le offerte dei club →»** | `__CPM_NO_G115_20` | ✅ |
| G184-21 cifra nel cerchio | bianco su ambra **1,67:1** | inchiostro scelto dal contrasto (`inkSu945`) **11,48:1** | `__CPM_NO_G115_21` | ✅ |
| G184-22 ritmo del provino 1 | espulsione nostra al 2' + scheda del mister: primo highlight dopo **42-43 s di parete** (5,2 s di gioco fluido, il resto fermo sulla scheda) | nessuna espulsione, primo highlight dopo **7,1 s di gioco fluido** (7-11 s di parete headless) | `__CPM_NO_G115_22` | ✅ |
| G184-23 nomi a fine partita (360) | «SELEZIONE GRANA…», «POLISPORTIVA …» troncati | su due righe, interi | `__CPM_NO_G115_23` | ✅ |
| G184-24 tinte | riquadro VS granata #7a1f2b; cartellino col bordo #bfdbfe (V1) | riquadro sulle superfici `TINTE`; bordo `TH.bdBlue` | `__CPM_NO_G115_24` | ✅ |
| G184-02 altezza pre/post provino | pre 1: 13,4 / 26,4 / 32,7%; post 1: 43 / 50,2 / 50,6%; pre 2: 46,3 / 53 / 53,8% di vuoto | **2,0 / 1,7 / 1,8%** su pre 1, post 1, pre 2 e riepilogo | `__CPM_NO_G115_02` | ✅ |
| G184-25 tutorial d'arrivo | «Salta» **38x34 px**; «Avanti» granata #8e1f33 | «Salta» **56x49 px**; «Avanti» `TINTE.testo` su `TINTE.bg` (tasto principale V2) | `__CPM_NO_G115_25` | ✅ |
| G184-30 nome troncato | 25 caratteri diventano 22 in silenzio | contatore «n/22» e, al limite, «Hai raggiunto il limite: abbrevia il secondo nome se serve» | `__CPM_NO_G115_30` | ✅ |
| G184-31 Invio | Invio avvia i provini | Invio porta il fuoco alla Nazionalità; `enterKeyHint="next"` | `__CPM_NO_G115_31` | ✅ |
| G184-32 tastiera (tocco) | campo a y=732-779 su vista 500 (fuori) | campo a y=381-428 (360) / 496-543 (412): in vista | `__CPM_NO_G115_32` | ✅ |

Foto prima/dopo: `docs/sviluppo/foto-giro115/` (`<schermata>-<formato>-rosso|verde.png`: creazione non fotografata; provino pre 1/2,
post 1, riepilogo, fine partita, intro chiusura, arrivo in carriera).

## Cosa è stato fatto, punto per punto

**Intro (`src/19-app-root.jsx`, `IntroCinematic`)**
- **G184-10** — invece di allungare a mano la coreografia (tiro, gol, festa: tutti tempi collaudati dal PO) la scena ha **un orologio
  di scena** `_el115`: reale fino a 6,3 s, poi **ralenti 0,31x** per 5,5 s reali mentre si leggono le istruzioni, poi di nuovo reale.
  Le clip CH38 rallentano con il corpo (`mixer.update(dt × rate)`), quindi niente piedi che scivolano. Istruzioni ogni 1,2 s.
  *Scelta prudente:* ralenti al posto di «un'istruzione per battuta» perché non sposta nessun tempo già collaudato.
- **G184-11** — velo scuro in alto (gradiente da 0,86 a 0) solo quando c'è una didascalia; `text-wrap: balance` («d'Oro.» non va più a capo da sola).
- **G184-12** — 44 px di altezza minima, corpo 13 px, `top`/`right` con `env(safe-area-inset-*)`.
- **G184-13** — cinque suoni **già nel catalogo di AudioMgr** (`ref.whistle`, `ball.kick`, `ball.net`, `crowd.roar`, `crowd.applause`)
  sull'orologio di scena. Nessun file nuovo. AudioMgr già rispetta il **muto totale** (bus master a 0) e lo **sblocco dopo un gesto**
  (`play` tace finché l'AudioContext non è pronto; il tasto «Rivedi l'intro» chiama `unlock`). Niente musica: la direttiva PO 23/09
  «musica menu da eliminare» vale anche qui (il collaudo proponeva uno «stacco musicale»: non fatto per questo).
- **G184-15** — prop `riascolto` sul montaggio da evento `cpm-replay-intro`: CTA «Chiudi ✕». Chiusura automatica a 19,8 s di scena
  (3,5 s dopo la CTA) in **entrambi** i casi, anche al primo avvio (dove la CTA porta al provino, come prima).
- **G184-16** — `clamp()` sulla larghezza per titolo, sottotitolo (fino a 28 px) e istruzioni; larghezza massima del sottotitolo.
- **G184-17** — prop `nome` (= `player.name` quando esiste: primo avvio dopo la creazione, riascolto con un giocatore caricato);
  senza giocatore resta Giovanni Pisano. Il gol usa il cognome in maiuscolo. «Numero 9» tolto quando c'è il nome vero (il numero di
  maglia non è ancora scelto in quel punto).
- **G184-14** — **solo annotato**: gli fps headless non sono il telefono (lezione 7.475/PO-237). La precarica del GLB **non** è stata
  fatta: l'intro usa già `loadGLB` con la cache `_glbCache` del prefetch al boot, e una precarica in più non è dimostrabile in
  headless; da guardare sul dispositivo del PO.

**Provini (`src/17-menu-creazione-pannelli.jsx` `TrialFlow`, `src/15-live-match.jsx`, `src/14-motore-possesso.jsx`)**
- **G184-20** — dopo il terzo provino la schermata resta: riepilogo dei tre provini e tasto «Vedi le offerte dei club →» (anche Invio).
  Ripresa dopo chiusura: con tre risultati salvati si riapre sul **riepilogo** (prima si sarebbe riaperto sul pre-provino 3).
- **G184-21** — inchiostro dei cerchi scelto da `inkSu945` (pre e post).
- **G184-22** — tre interventi, **nessuno cambia numero o ordine dei sorteggi** (invariante 7.511/7.489):
  1. nel primo provino niente **espulsione** nei primi 15': il rosso diretto consuma lo stesso `rnd()` ed esce dalla stessa `return`,
     solo senza cartellino; un secondo giallo resta giallo (`cfg.calmaRossi`, `_cart913`);
  2. primo minuto di calendario al 4' e niente minuti «seminati» in più sull'apertura della finestra (7.844: è un hash, non un sorteggio);
  3. fino al primo highlight il **cronometro corre a 2x** (la cronaca è funzione pura del minuto, 7.489). Il primo highlight resta un
     **fatto del motore** (decisione PO 7.999.6 «meno scene, tutte vere»): non è stato forzato. Misura: arriva al 9' dopo 7,1 s.
  La causa vera dei 42 s del collaudo era la **scheda del mister sull'espulsione**, che ferma la partita in attesa della scelta.
- **G184-23** — nome delle squadre a fine partita su due righe (`-webkit-line-clamp:2`). ⚠️ È la testata del post-partita di **ogni**
  partita (anche in carriera): cambia solo l'andare a capo, il resto è identico.
- **G184-24** — riquadro VS sulle superfici `TINTE` (come G180-22 sul menu), testi secondari `TINTE.oro`/`TINTE.sec`, cartellino col
  bordo `TH.bdBlue`. *Scelta prudente:* il **colore della squadra** dei provini (granata `#7a1f2b`, stemma e maglia in 3D) è un dato
  della squadra, non del tema: non toccato.
- **G184-02** — «schermata piena»: colonna `min-height:100%`, blocco centrale che cresce e si centra, tasto in fondo; nei provini non
  c'è barra di navigazione, quindi i suoi 80 px di riserva in fondo a `.cpm-scroll` diventano 14 px + safe-area.
- **G184-25** — «Salta» 44x44 minimi anche sotto i 640 px; «Avanti» nel tasto principale V2 (`TINTE.testo` su `TINTE.bg`).

**Creazione (`CreateScreen`)**
- **G184-30** — *scelta prudente:* limite **lasciato a 22** (altre schermate, come la figurina, sono tarate su quel massimo) e reso
  **visibile**: contatore «n/22» e messaggio al limite.
- **G184-31** — Invio porta il fuoco alla Nazionalità (`data-cpm="crea-nazione"`), `enterKeyHint="next"`.
- **G184-32** — al fuoco `scrollIntoView({block:"center"})` dopo 320 ms e di nuovo a ogni ridimensionamento della vista
  (`visualViewport`) finché il campo ha il fuoco.

## Fuori perimetro (non toccato)
Pre-partita, offerte, menu iniziale, Opzioni, finestre della settimana, Coppe (giro 114). Il wizard d'apertura stagione (G184-33)
aspetta una decisione del PO. Annotato e non toccato: la CTA dell'intro è ancora un gradiente rosso cablato (`#b91c1c→#7f1d1d`, non
segnalato dal collaudo).

## Guardiano `flussi-115`
Flusso vero sotto `?cpmtest=1` con seme fisso 4242 e il nome lungo del collaudo: home → creazione → intro in riascolto (GLB **acceso**
per l'intro, direttiva PO 29/07; spento per le partite) → tre provini (primo highlight giocato, poi `__CPM_SALTA297(88)`) → riepilogo
→ offerte → tutorial d'arrivo. Attese a evento (fase della partita, battuta dell'intro dichiarata dal gioco in `__CPM_INTRO115`);
tempi dell'intro sull'orologio dell'intro, tempo del provino sul **tempo di scena dichiarato dal gioco** (`__CPM_SCENA115`, ms di
battiti in `playing`, solo sotto test). «Non giudicato» = rosso; braccio e motivo stampati per ultimi. Il rosso esce 0 solo se cade
su **ogni** punto (un punto che resta verde = controllo cieco).
- **G184-11** si giudica **solo sui formati telefono** (dove il collaudo l'ha misurato): campiona tutta la battuta finale (un
  fotogramma ogni ~0,5 s) e tiene il minimo; a 1440x900 col CH38 headless lo screenshot è troppo lento per campionarla (dichiarato
  nell'uscita). Nel rosso a 412 la bandiera non passa dietro le scritte (8,14:1): il punto cade a 360 (1,95:1).
- Prima stesura bocciata da sé stessa: un fotogramma solo e GLB spento rendevano G184-11 **cieco** nel rosso (12,98:1); corretto lo
  strumento, non la soglia.
- Durata: ~6,5 min per braccio sui tre formati (`npm run flussi-115` = verde poi rosso).

## Catena (in sequenza, una alla volta, `free -m`/`df -h` prima di ciascuna)
| controllo | esito |
|---|---|
| flussi-115 verde | ✅ 54/54 |
| flussi-115 rosso | ✅ atteso rosso su 17/17 punti |
| replay | ✅ PASS (8 highlight) |
| validate-situations | ✅ PASS |
| collaudo-110 | ✅ verde+rosso |
| scorri-113 | ✅ verde+rosso |
| career-critical | ✅ PASS (tutti i passi verdi) |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |
| partita2d-297 | ✅ VERDE |
| highlight-95 | braccio VERDE chiuso: 100 highlight · D4 senza esito 0 · passaggi arrivati 89,3% · gol del compagno = assist 15/15; braccio ROSSO **ancora in corsa** al momento del commit (vedi riga finale) |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte.
