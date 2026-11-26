# Rapporto giro 407 — PO-673 «la presentazione alla nuova squadra è troppo nascosta»

**Base:** `lavoro/202` (7.999.216 + giro 401). **Ramo:** `sviluppo/giro407-presentazione`. GAME_VERSION e `docs/governo` non toccati.

## Il difetto, misurato (prima)

Sonda `tests/visual/misura-407.mjs`, salvataggio di prova `fixtures/save-190-s12-ovr93.json` con `presentedClub` azzerato
(= appena firmato con il club, FC Merseyside). Le posizioni sono in px dall'alto della pagina, con lo scorrimento a zero.

| Vista | Settimana | Card «Presentazione» | Tasto «Vai in sala stampa» | Statistiche (figurina forma/morale) | Visibile senza scorrere? |
|---|---|---|---|---|---|
| 412×915 | W3 (senza partita) | 1097–1273 | 1219–1264 | 804 | **no** |
| 412×915 | W38 (con partita) | 1595–1770 | 1717–1762 | 1302 | **no** |
| 1280×900 | W3 | 953–1119 | 1066–1111 | 745 | **no** |
| 1280×900 | W38 | 1412–1578 | 1524–1569 | 1203 | **no** |

Il tasto principale diceva «⚡ Vivi la settimana» e faceva vivere la settimana **senza passare dalla presentazione**.
La sala stampa si apriva da sola solo premendo «Gioca» il giorno della partita (PO-214, 7.999.135).

**Cosa compete per la cima della Home:** il blocco «⚡ Da decidere» (giri 199/335: saga di mercato, shooting, riconquista,
allenamento, rinnovo, sponsor), «Sei svincolato» (giro 198), il tasto principale `avanza23`, il riquadro della prossima
partita `prossima-v2` (con lo stesso tasto), il tasto «Vai al prossimo momento» (`salta163`). Il wizard d'apertura stagione
non compete: per l'invariante 7.491 vive solo nel wizard, che si apre dal tasto principale alla W1.

## La correzione (applicata la scelta consigliata)

- **La card è la PRIMA voce di «Da decidere»**, in cima alla Home sopra il tasto principale e le statistiche. È la stessa
  card, con lo stesso tasto e lo stesso stato (`_presCard407`, una funzione sola, usata in entrambi i posti).
- **Il tasto principale dice «🎙️ Vai in sala stampa — Presentazione a … · poi si gioca»** e apre la stessa sala stampa
  prima di vivere la settimana o di aprire la partita. Dopo la presentazione torna «Vivi la settimana» / «Gioca».
  Eccezioni: il tasto Simula segue il suo percorso; alla W1 con l'apertura di stagione da fare comanda il wizard
  (invariante 7.491); con il vecchio percorso `__CPM_NO_PRES214` non cambia nulla.
- Nessun SAVE bump (si legge `presentedClub`, come prima). Rosso `window.__CPM_NO_G407` = posto e tasto di prima.

## Dopo

| Vista | Settimana | Card | Tasto | Statistiche | Nella vista? |
|---|---|---|---|---|---|
| 412×915 | W3 | 147–322 | 268–313 | 1019 | **sì** |
| 412×915 | W38 | 147–322 | 268–313 | 1484 | **sì** |
| 1280×900 | W3 | 153–319 | 266–310 | 951 | **sì** |

Foto: `docs/collaudo-po/407-prima-412x915-w3.png`, `407-prima-412x915-w38.png`, `407-prima-1280x900-w3.png` e i tre
`407-dopo-*` corrispondenti.

## Guardiano

`npm run presentazione-407` (riga `src/18-` della MAPPA, accanto a `home-335`). Verde: card prima voce di «Da decidere»,
card e tasto dentro la vista a 412×915 (il tasto anche a 1280×900), sopra le statistiche; il tasto principale dice
«sala stampa» e premuto apre la presentazione (non la settimana); dopo la risposta `presentedClub` = club, la card sparisce
e il tasto torna «Vivi la settimana». Rosso `__CPM_NO_G407`: card sotto le statistiche e fuori vista, tasto che porta alla
settimana. «Non giudicato» = rosso. Esito: **verde, e il rosso si vede**. `mappa-unica`: verde.
Giro `node ci-runner.mjs giro presentazione-407`: vedi l'esito in fondo.

## File toccati

- `src/18-career-app.jsx`: `_pres407` (nuova, prima di `handleContinua`), `handleContinua` (apre la sala stampa),
  `_g407` + `_presCard407` (nuove, accanto a `presentazioneView`), `getContinuaState` (etichetta), `_sc199.presentazione` +
  `_sc199ok` (prima chiave), vecchio blocco della card della dashboard (solo col rosso).
- `CARRIER-MANAGER-AV.html` (ricomposto con `tools/build-src.mjs`).
- `tests/visual/presentazione-407.mjs` (guardiano), `tests/visual/misura-407.mjs` (sonda), `tests/visual/package.json`
  (script), `tests/visual/ci-runner.mjs` (riga della MAPPA `src/18-`).
- `docs/collaudo-po/407-*.png` (6 foto), questo rapporto.

## Dubbi per il PO (la prima è quella applicata)

1. **(applicata, consigliata)** Card in cima a «Da decidere» **e** tasto principale che porta in sala stampa: la
   presentazione non si può più saltare né con il tasto principale né scorrendo.
2. Solo la card in cima, il tasto principale invariato: più libertà, ma si può ancora vivere la settimana senza presentarsi
   (resta solo il passaggio obbligato del PO-214 al «Gioca»).
3. Una finestra (popup `pop224`) all'arrivo nella Home: impossibile da non vedere, ma una finestra in più — il PO aveva
   scelto per le scelte in sospeso «in cima, nessuna finestra in più» (giro 199).
4. Farla passare dal wizard d'apertura come passo: funziona solo a inizio stagione, non per chi arriva a mercato in corso.

Da guardare col PO: il Simula della Home salta il tasto principale; se si simula la partita con la presentazione da fare,
la presentazione resta in cima alla Home per la settimana dopo (comportamento già del PO-214, non cambiato).

## Esito del giro

`node ci-runner.mjs giro presentazione-407` sul build del commit 6f52cd3: **18/18 verdi** — presentazione-407 (67 s),
mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023,
tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera (586 s), gk-dive-sync, schermate-97.
Nessuna ripetizione. Il resto della riga `src/18-` della MAPPA lo gira il treno.
