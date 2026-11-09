# Giro 129 · PO-330 «A sagome» — la folla entra nel gioco come impostori

Ramo `sviluppo/giro129-folla` (base `lavoro/186`). Scelta del PO del 09/11: opzione **A** dello studio del giro 128
(`docs/collaudo-grafico/128/RAPPORTO.md` sul ramo `collaudo/giro128-tifosi`). `GAME_VERSION` non toccata (la sessione madre).

## 1. Cosa è cambiato

- **Le persone non sono più dipinte sulle tele.** `makeCrowdTex` (src/11) disegna ora, **una volta sola**, una gradinata di
  soli sedili (+ ballatoio, box VIP, striscioni ultras, che restano come erano) e restituisce **una sola texture per tela**
  (prima tre: `texLow/texUp/texFull`); la banda di ogni piano si sceglie con le UV in `mkTier`.
- **I tifosi sono impostori istanziati** (`buildFolla129`, src/11): un quadrato per tifoso, un solo draw call, un atlante
  disegnato dal codice (nessuna risorsa esterna) da 32 varianti × 4 pose — adulti, cappellino, sciarpa, bandiera, ombrello,
  bambini, VIP — con braccia giù / su / applauso / mani in testa. Maglia, pelle, capelli e accessorio si tingono per istanza
  (maschera r/g/r+g/b), l'ombreggiatura resta.
- **Chi siede dove è la logica di prima**: le istanze nascono dai posti che `makeCrowdTex` decide già (riempimento per anello
  e per fila, gruppi contigui e blocchi vuoti 7.187, corridoi, spicchio ospiti, VIP, famiglie → bambini, ombrelli con la
  pioggia, sciarpe e bandiere). Gli angoli e la fascia sommitale prendono un posto ogni *k* (passo minimo 0,56 × 0,80 u).
- **Il tifo è nel vertex shader** (gol nostro / loro, applauso su pali e parate, ola dove il settore la permetteva, seduti
  che si alzano): tre uniform aggiornate nel render-loop (src/12), **zero ridisegni e zero caricamenti** in partita.
  Le prime file a busti (cilindro + sfera) non si costruiscono più: sono già persone.
- **Seme deterministico** come prima (`hashStr` del settore e del piano), nessun `Math.random` nuovo.
- **Ritocchi chiesti dallo studio**: sedili meno rosati (`mix(casa, #3c424e, 0,70)·0,82` al posto del 45% di tinta);
  pantaloni in cinque toni che **sfumano nel colore del gradino** (prima barre chiare/scure molto leggibili); proporzioni
  tarate **col CH38 accanto** (foto `proporzioni-ch38-1440x900.jpg`, GLB acceso): prima la testa era il 17% dell'altezza
  e il busto lungo; ora spalle all'82%, anca al 52%, testa ~13%. La sagoma in piedi è ~1,72 u contro 1,8-1,95 del CH38.
- **Conteggio onesto (difetto trovato misurando)**: con la logica di prima un settore al riempimento 0,80 mostrava
  0,65-0,71 dei posti veri. Due perdite: la catena dei gruppi ripartiva vuota a ogni fila e dopo ogni corridoio, e la rampa
  di profondità saturava a 1 sulle prime file. **Solo nel ramo a sagome**: la catena parte dal suo stato stazionario e la
  rampa ha un offset tarato per bisezione (deterministico). Misurato a 0,30 / 0,55 / 0,80 / 0,95: scarto ≤ 0,025.
  La folla di prima (rosso) resta com'era, difetto compreso.

**Interruttore rosso:** `window.__CPM_NO_FOLLA129` → la folla dipinta di prima, identica.
**Manopola di densità (ritirata se il telefono soffre):** `localStorage 'cpm-folla'` = `vera` (default) | `oggi`
(la griglia di prima, ~1/3 dei tifosi), oppure `window.__CPM_FOLLA129_DENS`. Vale dalla partita successiva. Non è nel
salvataggio (nessun campo nuovo).

## 2. Numeri misurati

**Guardiano nuovo `npm run folla`** (`tests/visual/folla-129.mjs`) — due contesti, cadenza di vita reale (tele ogni 110 ms,
tifo animato), finestra di 6 s dopo la costruzione:

| | grande (50k, 85%) verde | grande rosso | campionato (30k, 45%, pioggia) verde | campionato rosso |
|---|---|---|---|---|
| F1 tele ridisegnate | **0** | 18 | **0** | 26 |
| F2 caricamenti di texture | **0** | 22 (1024x512) | **0** | 40 |
| F3 tifosi · occupati/posti · atteso pesato | **19.067** · 0,821 · 0,830 | non contabili | **7.099** · 0,483 · 0,479 | non contabili |
| F3 scarto peggiore di settore | 0,025 (soglia 0,05) | — | 0,020 | — |
| F4 firma su due pagine nuove | identica | — | identica | — |

F5 manopola: `oggi` 6.391 tifosi contro `vera` 19.067. Esito: **verde PASSA · rosso visto (3/3)**.

Sull'affluenza: la MatchdayCard dichiara 42.500/50.000 = 0,850; i settori la redistribuiscono come già faceva il gioco
(curva di casa 0,936, tribune 0,798, settore ospiti dall'`awayFill` 0,796) e il 3D mostra 0,821 dei posti, contro un
atteso pesato di 0,830. La differenza col valore della MatchdayCard viene dal settore ospiti più vuoto, scelta di 7.187,
non dal conteggio.

**Costi, headless (SwiftShader, GLB spento come il giro 128; media gioco/TV/vicino, due pagine nuove per braccio).**
Valgono i confronti fra bracci, non i valori assoluti. File: `misure-360x800.json`, `misure-1440x900.json`.

| | 360x800 prima | 360x800 dopo | 1440x900 prima | 1440x900 dopo |
|---|---|---|---|---|
| fotogramma medio (ms) | 403 / 239 | 378 / 369 | 450 / 473 | 495 / 503 |
| p95 (ms) | 947 / 613 | 726 / 815 | 737 / 816 | 551 / 553 |
| ms CPU in `renderer.render` | 15,0 / 9,6 | 7,4 / 6,9 | 12,0 / 13,5 | 11,6 / 11,9 |
| caricamenti GPU (MB/s) | 4,5 / 5,7 | **0** | 12,3 / 10,9 | **0** |
| triangoli scena (vista gioco) | 31.386 | 49.192 | ~35.000 | ~52.500 |
| draw call (vista gioco) | 282 | 275 | ~400 | ~385 |

Folla a sagome: 18.743 istanze nella scena di misura, 37.486 triangoli, costruzione 40-52 ms, atlante 2048x512
(colore + maschera), memoria stimata atlante + istanze ≈ 13 MB.

## 3. Foto (`foto/`, GLB acceso)

`prima-*` = rosso, `dopo-*` = gioco; camere `ingresso`, `gioco`, `vicino` (+ `dopo-vicino-gol-*` col tifo da gol forzato),
formati `360x800` e `1440x900`, `day` e `night`. `proporzioni-ch38-1440x900.jpg`: cinque sagome spostate dalla sonda sul
prato accanto a un CH38 (quella alta è in piedi, le altre sono sedute e quindi affondate di proposito). La camera `gioco`
segue la scena, quindi fra prima e dopo l'inquadratura non è identica al millimetro.

## 4. Banco sul telefono

`prototipi/folla-128/banco.html` aggiornato: i modi A / A-oggi riprendono i ritocchi (sedili, pantaloni), e c'è una riga
«Nel gioco su questo telefono» che scrive la manopola `cpm-folla` e un collegamento al gioco. Il deploy di Pages
(`.github/workflows/deploy-pages.yml`) ora copia `prototipi/folla-128/banco.html` e `folla-proto.js` nel sito: dopo la
promozione su `main` si apre da **https://antoniovairo-rgb.github.io/Carrier-manager-/prototipi/folla-128/banco.html**.
Non l'ho potuto aprire dal sito da qui (serve la promozione su `main` e il deploy): **non posso confermarlo** finché il
deploy non gira.

## 5. Catena

Un controllo alla volta (`CPM_CI_PAR=0`), `free -m`/`df -h` prima di ognuno: `griglia-mobile` ✓ · `design-system` ✓ ·
`test:logic` ✓ · `save-compat` ✓ (12/0) · `career-critical` ✓ · `folla` ✓ (verde passa, rosso visto 3/3) ·
`scena3d-96` ✓ (solo formato telefono, GLB acceso: 16/16 scene, 0 errori di pagina; PC e tablet non eseguiti per il tetto di tempo).
`griglia-mobile` segnala «NON misurato: prepartita: playMatch → nomatch» (non è un rosso; non ho verificato se c'era già prima).
`griglia-mobile` ha riscritto le sue foto in `docs/collaudo-grafico/g0/`: non le ho committate (artefatti del controllo).

## 6. Cosa resta e limiti

- **Fps sul telefono: non posso confermarlo.** L'headless rende in software e penalizza la trasparenza a soglia degli
  impostori; il p95 migliora, il medio è pari o un po' peggiore, i caricamenti spariscono. Il giudice è il banco e la
  partita sul dispositivo; se soffre, la ritirata è `cpm-folla = oggi` senza nuovo rilascio.
- Tutti guardano esattamente verso il campo (stessa rotazione per settore): da vicino si legge un po' «schierato».
- Lontano, con le mipmap, la soglia d'alfa assottiglia le figure; ho abbassato la soglia a 0,3, non l'ho misurato sul telefono.
- Le figure sono sagome piatte: da molto vicino (camera a bordo campo) restano disegni, non persone 3D.
- Gli angoli e la terza fascia riusano i posti delle curve/dell'anello alto (come le tele di prima): sono doppioni.
- Lo stato «seduto» affonda la sagoma di 0,52 u sotto il gradino: funziona perché il gradino la copre; su un terrapieno
  (stadio «borgo») chi è seduto sembra solo più basso.
- La pulsazione di colore al gol (`homeMats`/`awayMats`) ora tinge i sedili, non la gente.

**Domande aperte per il PO** (non decise qui): densità di default `vera` o `oggi` sul telefono dopo la prova del banco;
se le prime file meritano in futuro figure 3D (opzione C) o se le sagome bastano; se correggere anche nella folla di prima il
conteggio sottostimato (oggi resta com'era perché il rosso deve riportare la folla di prima).
