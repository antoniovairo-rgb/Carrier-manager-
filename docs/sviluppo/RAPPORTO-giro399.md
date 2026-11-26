# Rapporto giro 399 — salvataggio di una versione più nuova (PO-573)

Ramo: `sviluppo/giro399-salvataggio-nuovo` (base `lavoro/201`, 5ec4ea0). GAME_VERSION e `docs/governo` non toccati.

## Il difetto, misurato (prima)

Salvataggio sintetico «Futuro Prova» con `saveVersion` 10 (busta e giocatore) e un campo che questa versione non
conosce (`campoFuturo399`), messo a turno negli slot 1, 2 e 3. Misura col caso 6 di `save-compat`, sul codice di
`lavoro/201` senza correzione:

| caso | carriera aperta | messaggio | versione su disco dopo 6 s |
|---|---|---|---|
| slot 1 · Continua | sì | no (solo un avviso di 3,5 s) | **9/9** (era 10/10) |
| slot 2 · Continua | sì | no | **9/9** |
| slot 3 · Continua | sì | no | **9/9** |
| slot 1 · auto-ripresa | sì | **nessuno** | **9/9** |
| slot 3 · auto-ripresa | sì | **nessuno** | **9/9** |

5 su 5: il salvataggio veniva aperto, la migrazione (src/17) lo ritimbrava a 9 e l'autosalvataggio lo riscriveva.
Con l'auto-ripresa (riapertura dell'app) non compariva nemmeno l'avviso. Anche la migrazione da sola, chiamata su un
giocatore con `saveVersion` 99, restituiva 9.

## La correzione (dopo)

| caso | carriera aperta | messaggio | disco |
|---|---|---|---|
| slot 1/2/3 · Continua | no | sì | **identico byte per byte** (10/10) |
| slot 1/3 · auto-ripresa | no | sì | **identico byte per byte** (10/10) |
| slot 2 · v8 · Continua | sì | — | migrato 8 → 9, `migratedFrom` 8 (come prima) |
| slot 1 · v8 · auto-ripresa | sì | — | migrato 8 → 9, `migratedFrom` 8 (come prima) |

Braccio rosso (`window.__CPM_NO_G399` = comportamento di prima): 5 casi su 5 mostrano di nuovo il difetto (9/9,
carriera aperta, nessun messaggio); i vecchi migrano uguale. `save-compat`: 15 pass · 0 fail.

## File e funzioni toccati

- `src/07-versione-save-interviste.jsx` — accanto a `SAVE_VERSION`: `versioneSalvataggio399(d)` (la più alta fra
  busta e giocatore) e `troppoNuovo399(d)` (con il rosso `__CPM_NO_G399`).
- `src/17-menu-creazione-pannelli.jsx` — `migratePlayer`: il timbro finale non porta mai la versione all'indietro.
- `src/19-app-root.jsx` — `App`: stato `nuovo399`; `loadSave` (Continua) e auto-ripresa rifiutano senza aprire;
  `importSave` non importa un file più nuovo e il ripristino da backup salta gli slot più nuovi; finestra
  `Modal cpm="nuovo-399"` sulla Home (primitive `Modal`/`Btn` e token `TH`/`FS`/`FW`/`SP`: grafica unica).
- `CARRIER-MANAGER-AV.html` — ricomposto con `tools/build-src.mjs`.
- `tests/visual/run-save-compat.mjs` — caso 6 (verde + rosso, 7 casi giudicati, «non giudicato» = rosso) e
  controllo della migrazione pura.
- `tests/visual/ci-runner.mjs` — `save-compat` aggiunto alle righe della MAPPA già esistenti di `src/1[17]` e
  `src/19` (prima girava solo come sentinella). `npm run mappa-unica` verde.
- `tests/visual/foto-399.mjs` — sonda delle foto (non è un guardiano).

## Foto del messaggio

- 375 px: `docs/sviluppo/giro399/messaggio-375.png`
- PC (1366 px): `docs/sviluppo/giro399/messaggio-pc.png`

Testo: «Salvataggio di una versione più nuova — Il salvataggio 2 è stato creato con una versione più nuova del gioco.
Questa versione non lo può aprire. **La tua carriera è al sicuro: non abbiamo cambiato niente.** Aggiorna il gioco
per riprenderla.» Tasto «Ho capito».

## Dubbi per il PO

**1. Come si presenta il rifiuto**
- **(consigliata, GIÀ APPLICATA) Finestra con «Ho capito»** sulla Home, a ogni tentativo di apertura (Continua e
  riapertura dell'app). Lo slot resta nella lista, intatto.
- Solo l'avviso breve in alto (3,5 s), come prima ma senza aprire: si perde facilmente, soprattutto alla riapertura.
- Finestra + etichetta fissa «versione più nuova» sulla scheda dello slot (tocca anche `HomeScreen`/`listSlots`:
  più file e più guardiani grafici).

**2. Il puntatore di auto-ripresa (`cpm-active`)**
- **(consigliata, GIÀ APPLICATA) Lasciarlo com'è**: chi torna alla versione nuova riprende la carriera dritto.
  Costo: finché resta sulla versione vecchia, a ogni riapertura rivede la finestra.
- Azzerarlo al primo rifiuto: niente finestra ripetuta, ma chi torna alla versione nuova riparte dalla Home.
- Azzerarlo solo dopo «Ho capito».

**3. Sovrascrittura volontaria dello slot** (nuova carriera o importazione sopra uno slot più nuovo)
- **(consigliata, GIÀ APPLICATA) Lasciarla al giocatore**: «Elimina» e «Nuova carriera» funzionano come prima; solo
  l'importazione di un FILE più nuovo è rifiutata.
- Bloccare in `storage.save` ogni scrittura sopra uno slot più nuovo (difesa totale, ma il giocatore non può più
  liberare lo slot senza eliminarlo).
- Chiedere una conferma in più prima di sovrascriverlo.

## Verifiche

- `npm run save-compat`: verde (caso 6 verde + rosso).
- `npm run mappa-unica`: verde.
- `node ci-runner.mjs giro save-compat` (guardiano + sentinelle, `save-compat` è anche sentinella): **17/17 verdi**
  (save-compat 112 s · mappa-unica · test:logic · replay · migrazione-194 · design-system · tema-unico · griglia-mobile ·
  render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera 691 s · gk-dive-sync ·
  schermate-97). Gli altri guardiani della MAPPA li giudica il treno.
