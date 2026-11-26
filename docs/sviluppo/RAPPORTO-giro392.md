# Giro 392 — controlli lunghi (PO-528)

Base `lavoro/201` @ `29d758c8`. Ramo `sviluppo/giro392-controlli-lunghi`. Giro di CONTROLLI: il gioco non cambia
(nessun file in `src/`, nessun `GAME_VERSION`).

## 1. I dieci controlli più lunghi

Fonte: riepilogo del treno grande di stanotte (corsa 45735203524, 26/11, runner GitHub), confrontato con
`docs/governo/DURATE-GUARDIANI.json` (`s`).

| # | controllo | treno 26/11 (s) | `s` in DURATE | velocità scritta | CPU lenta |
|---|---|---|---|---|---|
| 1 | highlight-95 | 5.099 | 6.600 | '2' (2×) | solo con `CPM_CPU` |
| 2 | assist-nome-98 | 3.055 (rosso noto D7) | 2.964 | **'4' → 1×** | no |
| 3 | gol-eroe-154 | 2.915 | 3.600 | **'4' → 1×** | no |
| 4 | parata-100 | 2.525 | 2.040 | '2' (2×) | no |
| 5 | nomi-219 | 2.495 | 2.910 | **'4' → 1×** | no |
| 6 | ingresso-206 | 2.435 | 3.067 | — (cerimonia) | ×2 su 8 scene su 11 |
| 7 | coreografie-244 | 2.414 | 2.295 | — (cerimonia) | ×2 nel braccio degli fps |
| 8 | difesa-220 | 2.101 | 2.330 | **'4' → 1×** | no |
| 9 | tunnel-245 | 1.871 | 1.260 | — | no (tre esecuzioni dello script) |
| 10 | assist-298 | 1.856 | 1.826 | **'4' → 1×** | no |

**Scoperta che ha deciso la leva.** Il gioco accetta solo `MATCH_SPEEDS = [1, 1.5, 2]` (`src/15-live-match.jsx`,
`readMatchSpeed`): una preferenza fuori lista viene **riscritta a 1**. Cinque dei dieci (e altri 58 script di
`tests/visual`) scrivono `cpm-match-speed = '4'` credendo di giocare a 4×: misurato sul gioco vero, dopo l'apertura
la preferenza vale `"1"`. Giocavano a velocità normale.

## 2. Leva → minuti → rischio

| leva | dove regge (dei 10) | risparmio misurato | minuti a treno (stima dichiarata) | rischio |
|---|---|---|---|---|
| **velocità 2× nel banco** (`'4'`→`'2'`) | assist-nome-98, nomi-219, difesa-220, assist-298 (gol-eroe-154 escluso, §3) | stessa partita vera S12: **338→281 s** (seme 1234) e **297→263 s** (seme 2021), −14% medio; k6 di gol-eroe-154 523→282 s | ~0,14 × 9.507 s ≈ **22 min** di macchina | **basso**: stessa partita (9 e 7 scene identiche, stesso risultato); le finestre d'esito degli highlight non dipendono dalla velocità (7.484) |
| niente CPU lenta nelle cerimonie | ingresso-206, coreografie-244 | ingresso-206 scena «big»: **69→55 s** (−20%) | ~0,2 × 8/11 × 2.435 + coreografie ≈ **10-12 min** | **medio**: toglie il freno alla misura «fps del verde ≥ 85% del rosso al telefono», l'unica ragione della CPU ×2 |
| riuso di una pagina per più scenari | highlight-95, tunnel-245, ingresso-206 | non misurato (costo di apertura pagina ~15-30 s a scenario, stima) | pochi minuti | **alto**: «una pagina stanca non è il gioco» (7.483) — falsa i valori assoluti su cui giudicano questi controlli |
| meno partite/semi | tutti quelli a partite | lineare (es. nomi-219 27→18 partite = −33%) | il più grande sulla carta | **alto**: i pavimenti di copertura sono già sul filo (esiti-218 «12 scene sul filo», gol-eroe-154 «minimo 4 partite valide»): meno semi = più «non giudicato» |

**Scelta: velocità 2×.** Miglior rapporto minuti/rischio, e non è una scorciatoia: corregge un valore che non
faceva ciò che dichiarava. Le altre tre leve non sono applicate.

## 3. Verde resta verde, rosso resta rosso (banco, 26/11, velocità '2')

| controllo | esito a 2× | confronto con la notte (1×) | durata banco |
|---|---|---|---|
| nomi-219 | ✅ verde (vicini 94% su 98), rosso visto (66% su 38) | notte: verde, rosso visto | 4.077 s |
| assist-298 | ✅ verde (27 scene, 0 difetti), rosso visto (18 difetti) | notte: verde, rosso visto | 2.558 s |
| difesa-220 | ✅ verde (slide×3 + lunge), rosso visto (slide×3 + press) | notte: **stessi gesti** in entrambi i bracci | 2.814 s |
| assist-nome-98 | ❌ solo D7 (verde B · verde D7 · rosso D7) | notte: **gli stessi tre**, già in ROSSI-DICHIARATI; partite (A, D1/D4) verdi, rosso visto | 3.817 s |
| gol-eroe-154 | ❌ **escluso dalla leva** | k7 verde «misura non valida» sul banco **anche a 1×** (k6+k7: 746 s a '4', 673 s a '2'); notte sul runner 10/10 valide | — |

⚠️ Le durate del banco sono prese con due controlli alla volta su 4 CPU (come `ci-runner`) e **non sono
confrontabili** con quelle del runner: il risparmio vero è quello dell'A/B sulla stessa partita (§2). Per questo
in `DURATE-GUARDIANI.json` ho scritto le misure nel campo `giro392` di ogni voce **senza abbassare `s`**: un valore
troppo basso lascia non giudicati i guardiani dietro nella stessa parte (è successo al giro 358). Lo aggiorna la
prossima misura del treno.

## 4. File toccati

- `tests/visual/assist-nome-98.mjs`, `nomi-219.mjs`, `difesa-220.mjs`, `assist-298.mjs` — una riga ciascuno:
  `localStorage.setItem('cpm-match-speed', '4')` → `'2'` (con commento).
- `tests/visual/controlli-lunghi-392.mjs` — guardiano nuovo, statico (~1 s): esegue in node il `readMatchSpeed` vero
  di src/15 (premessa: `'4'`→1, `'2'`→2), controlla che i 4 controlli scrivano solo velocità che il gioco tiene e che
  abbiano la durata `giro392`; prova del rosso nello stesso giro (`CPM_NO_G392=1` = controlli della base `29d758c8`,
  deve uscire rosso per «scrive 4»). Censimento informativo degli altri 58 script.
- `tests/visual/package.json` — script `controlli-lunghi-392`.
- `tests/visual/ci-runner.mjs` — `controlli-lunghi-392` nella riga della MAPPA di `src/15-` (esisteva già;
  `mappa-unica` verde).
- `docs/governo/DURATE-GUARDIANI.json` — campo `giro392` su assist-nome-98, nomi-219, difesa-220, assist-298,
  gol-eroe-154 e nota in testa.

Fuori ambito: `src/`, GAME_VERSION, gli altri 58 script con `'4'`, le altre tre leve.

## 5. Dubbi per il PO

**D1 — Gli altri 58 script che scrivono `'4'` (giocano a 1×).** Fra questi chiusura-99, esiti-218, carriera3-94.
1. **(consigliata, GIÀ APPLICATA)** Solo i controlli verificati uno per uno verde+rosso a 2×; gli altri restano a
   `'4'` e il guardiano li elenca. Un giro successivo li passa a lotti, ognuno con la sua prova.
2. Passarli tutti a `'2'` in un colpo e lasciare il giudizio al treno grande.
3. Lasciare tutto com'è e scrivere `'1'` dove c'è `'4'`, per onestà del valore, senza guadagno di tempo.

**D2 — gol-eroe-154.** Sul banco k7 verde non dà una misura valida né a 1× né a 2× (sul runner sì).
1. **(consigliata, GIÀ APPLICATA)** Fuori dalla leva finché k7 non è capito: un giro dedicato misura perché il
   registro gol manca a fine partita sul banco.
2. Passarlo a 2× e far decidere al treno (sul runner era 10/10 valide).
3. Sostituire k7 con un altro seme: è un cambio di campione, quindi una decisione del PO, non del giro.

**D3 — `s` in DURATE-GUARDIANI.json.**
1. **(consigliata, GIÀ APPLICATA)** `s` invariato, misure nel campo `giro392`; lo abbassa la prossima corsa del treno.
2. Abbassare subito `s` del 14% (rapporto A/B).
3. Usare le durate del banco come `s` (più alte: sovrastimano, parti più corte del necessario).

**D4 — CPU lenta nelle cerimonie (seconda leva, ~10-12 min).**
1. **(consigliata)** Non ora: la CPU ×2 è la sola cosa che rende «da telefono» la misura degli fps di
   ingresso-206/coreografie-244; va decisa insieme a PO-517.
2. Toglierla e tenere il confronto verde/rosso degli fps a CPU piena.
3. Spostare la misura fps in un controllo a parte, notturno, e togliere la CPU ×2 dal resto.

## 6. Rituale

`node ci-runner.mjs giro controlli-lunghi-392` sul banco (26/11, versione 7.999.215): **18/18 verdi** —
controlli-lunghi-392, mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico,
griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync,
schermate-97. Il guardiano: verde + rosso (`CPM_NO_G392=1` esce 1 su «scrive cpm-match-speed = 4» per 4/4).
`STABILITA.json` e le foto di `docs/collaudo-grafico` scritte dal runner sono state ripristinate (docs/governo non si
tocca in questo giro, salvo DURATE-GUARDIANI.json). Gli altri guardiani li giudica il treno.
