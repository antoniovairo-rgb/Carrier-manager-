# Rapporto giro 320 — PO-619 «nome di fantasia nell'intro»

Base `lavoro/201` (7.999.201), ramo `sviluppo/giro320-nome-intro`. GAME_VERSION non toccata.

## Cosa cambia
- **src/09**: costante unica `EROE_INTRO_320` = {nome «Gabriel Ferreyro», cognome «FERREYRO»}; «giovanni pisano» entra in
  `_CR_FULLNAMES` (le coppie nome+cognome bloccate: generazione delle rose + audit). L'audit `_auditCopyright` controlla ora anche
  il nome dell'eroe dell'intro (coppie bloccate e parole di `_CR_PLAYERS`).
- **src/19** (intro): didascalia «Gabriel Ferreyro. Numero 9. Una carriera vera, una settimana alla volta.»; cognome di ripiego
  `FERREYRO` (didascalia «⚽ GOOOL DI FERREYRO!»). Con un nome del giocatore salvato l'intro usa quello, come prima.
- **src/17**: suggerimento del campo Nome «Es. Gabriel Ferreyro».
- **tests/visual**: commento di `scene-178.mjs` e quattro sonde d'archivio (nome dell'eroe nei salvataggi di prova, «FERREYRO JR»).
- Non toccati: il club «FC Pisano» e gli aggettivi dei club (src/12). «Pisano» NON va in `_CR_PLAYERS`: la pulizia dei
  salvataggi (`pulisciNomiReali190`) rinominerebbe anche le stringhe del club.
- Rosso `window.__CPM_NO_G320` = testi della 7.999.201 (Giovanni Pisano / PISANO).

## Misure
- `node tools/audit-copyright.mjs`: **verde, 0 hit**. Con `CPM_AUDIT_FLAG=__CPM_NO_G320`: **rosso, 1 hit**
  (`INTRO-EROE: "Giovanni Pisano"`, uscita 2).
- `build-src` + `check-src`: IDENTICO byte per byte.
- Foto (`tests/visual/foto-320.mjs`, deviceScaleFactor 2, 360x800 tocco e 1440x900): `docs/sviluppo/giro320/`.
  Didascalia e «GOOOL DI FERREYRO!» interi nella vista (360: x 37..323), nessun taglio. Col rosso escono i testi vecchi.
  Nota: nell'intro la maglia dell'eroe porta **solo il numero 9** (texture del giro 7.32.7), nessun cognome sulla schiena:
  il cognome compare nella didascalia del gol. Il numero 9 è invariato.
- `node ci-runner.mjs giro intro-292 scene-178` (guardiani + sentinelle): **18/19**.
  Unico rosso `scene-178` («intro tel/tel412: S3 4/15x fotogrammi con l'eroe fuori», nei primi 0,7 s dell'apertura), ripetuto
  3 volte. **Preesistente**: identico sulla base `lavoro/201` intatta (4/121 e 4/140). Questo giro cambia solo testi, non la scena 3D.
  Da aprire come rosso a parte (o da dichiarare), non riparato qui.
- Foto `docs/collaudo-grafico/g0/*` rigenerate da un controllo: rimesse con `git restore`.
