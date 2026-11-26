# Rapporto giro 401 — PO-672 «Migliora il wizard per i nuovi player, la intro e la schermata iniziale di nuova carriera»

Ramo `sviluppo/giro401-primo-avvio`, base `lavoro/201` (7.999.216). GAME_VERSION, SAVE_VERSION e `docs/governo` non toccati.
Nessuna regola di carriera cambiata, nessun campo nuovo nel salvataggio. Tutto dietro il rosso `window.__CPM_NO_G401` (= percorso di prima).

## In breve

Il primo avvio ora è **un percorso in tre passi numerati**, scritti uguali su ogni schermata:
**1 Crea il calciatore · 2 I provini · 3 Scegli il club**.

- **Home senza salvataggi**: sotto «Nuova carriera» il riquadro generico («Crea il tuo calciatore, supera i provini e costruisci…»)
  diventa **«Come si inizia»** con i tre passi numerati e una riga ciascuno. Il marchio è annunciato come titolo ai lettori di schermo.
- **Creazione del calciatore**: «Passo 1 di 3» con la riga dei tre passi e «Scrivi il tuo nome e scegli l'aspetto: tutto il resto è
  facoltativo»; il **nome sta in cima** (prima della figurina: era il campo obbligatorio ed era a metà pagina); **«Inizia i provini →»
  in una barra fissa in fondo**, sempre a schermo, con sotto «Scrivi il tuo nome per iniziare» / «Passo 2: tre provini davanti agli
  osservatori». Tolto il riquadro «Percorso carriera» (lo dicono i passi).
- **Provino**: «Passo 2 di 3 · I provini» in testa, sotto «Provino N di 3» (prima «Il provino · passo N di 3» si confondeva coi passi del percorso).
- **Offerte**: «Passo 3 di 3 · Scegli il club» al posto del logo.
- **Intro**: già aveva «Salta» (49 px, in alto a destra) — misurato, nulla da cambiare.

## Misure (guardiano `primo-avvio-401`, localStorage vuoto, corpi 3D accesi, senza `?cpmtest=1`)

| | 412×915 prima | 412×915 dopo | 1280×900 prima | 1280×900 dopo |
|---|---|---|---|---|
| «Inizia i provini» nella creazione | **1217-1277 px, fuori schermo** (bisogna scorrere tutta la pagina) | 817-877 px, sempre a schermo | 435-495 | 791-862 (barra fissa) |
| Passi numerati «Passo N di 3» | nessuno | creazione · provino · offerte | nessuno | idem |
| Titolo leggibile per schermata | manca su home e provino | tutte | idem | tutte |
| Home spiega provini e club | no | sì | no | sì |
| Testi tagliati | 0 | 0 | 0 | 0 |
| Tocchi fuori partita fino alla home di carriera | 11 | 11 | 11 | 11 |
| Secondi fino alla home di carriera (sul banco) | 12,9-22 | 12,1-20,5 | 14 | 13,2-13,9 |

- I **tocchi** non cambiano (nome, «Inizia i provini», «Salta», 3 × «Inizia il provino», 2 × «Vai al provino», «Vedi le offerte», «Scegli»):
  il guadagno è che il tasto non va più cercato. Ridurli vuol dire togliere un passo (vedi i dubbi).
- I **secondi** al telefono dipendono dallo scaricamento dei corpi 3D sul banco (la pillola «Scarico i giocatori 3D» è nella foto): fra due
  giri variano di diversi secondi, non sono un effetto della patch. Le tre partite del provino **non sono giocate** dal guardiano (i tre
  risultati si scrivono come li scrive il gioco e si riapre l'app): i loro tocchi e minuti non sono contati, ed è dichiarato.

## Foto (docs/collaudo-po)

`401-prima-<passo>-<larghezza>.png` (col rosso `__CPM_NO_G401`, = percorso di prima) e `401-dopo-<passo>-<larghezza>.png`, per
`1-home · 2-crea · 3-intro · 4-provino · 5-offerte · 6-carriera`, a 412 e 1280.

## Guardiano

`npm run primo-avvio-401` (`tests/visual/primo-avvio-401.mjs`), riga della MAPPA `src/1[17]` in `ci-runner.mjs` (mappa-unica verde).
Per ogni schermata: titolo, azione principale **dentro la vista senza scorrere**, non coperta e alta almeno 44 px, nessun testo tagliato
(ellissi o oltre il bordo destro), «Passo N di 3» su creazione/provino/offerte, «Salta» visibile nell'intro, home che nomina provini e
club, zero errori di pagina. Verde 0 controlli falliti a 412 e 1280; rosso bocciato con 13 controlli (home senza titolo, tasto della
creazione fuori schermo, passi mancanti). Un braccio mancante = non giudicato = rosso.

## File e funzioni toccati

- `src/17-menu-creazione-pannelli.jsx`: nuovi `_g401`, `PASSI401`, `Passi401`; `HomeScreen` (titolo del marchio, riquadro «Come si
  inizia»); `CreateScreen` (`_nome401` spostato in cima, barra fissa `crea401-barra`, riserva in fondo allo scorrimento ridotta come nei
  provini, via «Percorso carriera»); `TrialFlow` (testata del provino); `OffersScreen` (testata).
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` IDENTICO).
- `tests/visual/primo-avvio-401.mjs` (nuovo), `package.json` (script), `ci-runner.mjs` (riga della MAPPA).
- `tests/visual/flussi-115.mjs`, `tests/visual/c184-provini.mjs`: riconoscono anche «PROVINO N DI 3» (cercavano solo «IL PROVINO · PASSO N»).

## Guardiani girati / NON girati

Girati verdi: `primo-avvio-401` (verde + rosso), `crea-home-295`, `stile-unico-75`, `neutro-287`, `mappa-unica`, catena
`node ci-runner.mjs giro primo-avvio-401` (esito sotto).
NON girati (li giudica il treno): il resto della riga `src/1[17]` — fra cui `spazio-296`, `schermate-97`, `pc-tablet-292`, `piccoli-85`,
`griglia-mobile`, `design-system`, `accessibilita-234`, `salienti-246`, `salienti-253`, `avvio-233`, `patto-238`, `grafica-v2`, `tema-unico`
— e `flussi-115` / `c184-provini` (solo ritoccati nel riconoscimento del testo, non rigiocati). Rischi da guardare: `spazio-296` e
`design-system` misurano spaziature/raggi e il riquadro nuovo usa solo token (`SP`, `FS`, `FW`, `TH`, `TINTE`), nessun raggio a mano.

## Dubbi per il PO (la consigliata è già applicata)

1. **Tasto della creazione** — (a, APPLICATA) barra fissa in fondo, sempre a schermo; (b) creazione a schede (nome → aspetto → facoltativi)
   con «Avanti»: più ordinata ma +2 tocchi; (c) lasciare il tasto in fondo alla pagina con un richiamo «scorri» accanto al nome.
2. **I tre provini** — (a, APPLICATA) restano tre, numerati come «Passo 2»; (b) al primo avvio un solo provino giocato e due simulati
   (−2 partite, −6 tocchi, ma tocca la regola delle offerte: serve una decisione); (c) un tasto «Simula il provino» accanto a «Inizia il provino».
3. **Intro** — (a, APPLICATA) com'è: parte dopo la creazione, una volta per dispositivo, «Salta» sempre in alto a destra; (b) spostarla
   prima della home al primissimo avvio; (c) accorciarla a metà per chi non la salta.
4. **Doppio titolo nella creazione** — oggi «Nuova carriera · chi sei / Crea il tuo calciatore» e sotto «Passo 1 di 3 · Crea il calciatore».
   (a, APPLICATA) li tengo entrambi (il primo è il titolo V2 comune a tutte le schermate); (b) togliere l'occhiello; (c) fondere i due in uno.

## Esito della catena del giro

`node ci-runner.mjs giro primo-avvio-401` sulla build del ramo: **18/18 verdi** (primo-avvio-401 51 s, mappa-unica, test:logic,
save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile 188 s, render-3d-023, tunnel-285, home-298, web-237,
career-critical 317 s, battito-264, partita-vera 630 s, gk-dive-sync, schermate-97). Nessun passo instabile. I file che la catena
riscrive (`docs/governo/STABILITA.json`, foto di `docs/collaudo-grafico`) sono stati rimessi come in base: non li tocca il giro.
