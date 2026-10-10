# Rapporto giro 4 — PO-066 (home) e ingresso in campo

**Stato: PARZIALE.** Nessuna modifica al gioco in questo giro. Misurato, non corretto.

## Ramo
- Lavoro su `origin/sviluppo/haiku-l7-pulizia-l8` @ `d93d709`, già sopra `origin/main` (2adc96a): rebase non necessario.
- Il ramo locale aveva un WIP vecchio (`a9616d4`, base `729fc8e`): salvato in `backup/wip-a9616d4`, il ramo locale ora coincide con il remoto.

## Cosa ho aggiunto
- `tests/visual/po066-home-test.mjs`: sonda che apre la carriera a inizio (sett. 1), metà (19) e fine (36) stagione a 360/375/412 px, fotografa la dashboard e misura card, testo sotto 10 px, overflow orizzontale e sbordamenti della barra di navigazione.
- Foto: `docs/sviluppo/foto/po066/dashboard-{inizio,meta,fine}-{360,375,412}.png`.

## Misure (9 schermate)
| Misura | Esito |
|---|---|
| Testo sotto 10 px | 0 in tutte |
| Overflow orizzontale | 0 in tutte |
| Voci della barra che sbordano | 0 in tutte |
| Card (conteggio) | 8 inizio, 7 metà, 8 fine |

## Cosa ho trovato nelle foto
- Le sovrapposizioni in fondo (AGENTE/UFFICIO) sono il badge **TEST · KE 7.999.156**, che compare con `?cpmtest=1`. Non è un difetto del gioco: non l'ho «corretto».
- Nella card «Prossima partita» i nomi delle squadre si troncano con «…» (es. «FC Modenese Prim...») a 360 px. Difetto reale ma minore, non ancora corretto.
- Il banner rosso «Avvia Stagione» (inizio) e «Vivi la Settimana» (metà/fine) è l'unico riquadro colorato della home. Non so se il PO lo consideri «fuori standard»: **non posso confermarlo** dal backlog, che parla di «Profilo e Nazionale da portare alla card neutra» (scheda Carriera, non la home).

## PO-217 (analisi pre-partita)
- Foto del PO: `docs/governo/foto/po217-analisi-prepartita.jpg` (metà schermo vuota sotto «Entra in campo»).
- Guardiano `po217-scout-test.mjs`: **VERDE** a 360/375/412 (16 px sotto il pulsante; rosso 470–489 px).

## Ingresso in campo (card «Primavera 2» sul terzo inferiore, giocatori minuscoli)
- **Non misurato.** Richiede la schermata di partita con GLB-ON (regola PO: verifiche percettive con CH38). Da fare nel prossimo giro.

## Catena
- Build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` e `check-src.mjs`: **non eseguiti** in questo giro (nessun cambio al sorgente).
- `ci-runner.mjs grafica`: **non eseguita**.

## Cosa resta
1. Decidere con il PO se il banner rosso della home è «fuori standard» (scelta di gusto).
2. Troncamento nomi squadra nella card «Prossima partita» a 360 px.
3. Misurare l'ingresso in campo con GLB-ON.
4. Catena grafica completa prima di qualunque push con modifiche al gioco.
