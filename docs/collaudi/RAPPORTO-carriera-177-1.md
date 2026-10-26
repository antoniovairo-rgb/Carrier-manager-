# Rapporto collaudo — Carriera intera n.1 (attaccante, scelte normali) — CPM 7.999.177

Telefono 412×915, `?cpmtest=1`, GLB acceso nelle partite dal vivo. Ramo `collaudo/7.999.177-carriera-1`.
Non è stato toccato `src/`, `GAME_VERSION` né `docs/governo/`.

## Riassunto della carriera

| | |
|---|---|
| Giocatore | Luca Ferraro, Italia, attaccante, piede destro |
| Durata | 18 stagioni (S1 Primavera + 17 da professionista), dai 17 ai 34 anni; **ritiro dopo S18**, «Tour d'addio» |
| Club | FC Altoadige Primavera (S1) → FC Altoadige (S2–3) → FC Oostzijde (S4) → FC Frankfurt (S5) → FC Augsburg (S6–7) → FC Submarino (S8–9) → FC Werkstadt (S10–11) → FC Islington (S12–13) → FC Valdenau (S14) → FC Lisboa (S15–16) → FC Valdenau (S17–18) |
| Gol / assist / presenze | **402 gol · 142 assist · 740 presenze** (migliore: S11 con 37 gol) |
| Trofei | 13 (schermata di fine carriera): 3 UCL (S9, S14, S18 — S9 col Submarino, le altre col Valdenau), 6 Coppe nazionali (S9, S11, S12, S15, S16, S18), Coppa delle Nazioni S18 con l'Italia, 3 campionati (Deutsche Liga 2 S11, Deutsche Liga S17 e S18)… più Trofeo d'Oro S18 e 2 MVP, 2 capocannoniere |
| OVR | 64 (S1) → **massimo 90** (S13, 29 anni; resta 90 fino a S15) → 88 a 34 anni |
| Presenze in Nazionale | 23 |
| Patrimonio | 130,3 M€ · Legacy 1000/1000 «Leggenda Assoluta» |
| Ritiro | il flusso funziona: «Chiudi la stagione» → premi → bilancio → «Il giorno dell'addio» → Fine di un'era → Lettera d'addio → «Rivivi la carriera»; dopo ricarica il salvataggio mostra «Carriera conclusa · S.18» con «Rivivi il finale» (foto `ritiro-*`) |
| Volume del collaudo | 1.433 righe di registro settimanale, 205 partite dal vivo registrate (1.238 highlight), 3.944 eventi/finestre, salvataggi per stagione in `dati-carriera-177-1/save-S*.json` |

Dati grezzi: `docs/collaudi/dati-carriera-177-1/` (`registro.jsonl`, `eventi.jsonl`, `highlight.jsonl`, `difetti-grezzi.jsonl`, `ritiro.json`, `stato-ritiro.json`).
Script: `tests/visual/c177-car1-*.mjs` (pilota `c177-car1-driver.mjs`, ritiro `c177-car1-ritiro.mjs`, sonde `…-probe-*.mjs`).

## Difetti verificati

Regola PO applicata: ogni difetto negli highlight vale almeno «medio».

| # | Gravità | Stagione/settimana | Schermata | Cosa succede | Come riprodurlo | Foto |
|---|---|---|---|---|---|---|
| D1 | **ALTA** | tutta la carriera (da S1) | Highlight di passaggio (`hl_choose`/`hl_result`) e tabellino | **Gli assist dell'eroe quasi non nascono mai dagli highlight.** Su 330 highlight di passaggio giocati: **39 riusciti (11,8%)**, 185 persi/intercettati/anticipati, 2 sole «Palla d'oro!», nessun esito riporta la parola «ASSIST». In 76 partite con almeno un passaggio scelto, il tabellino finale ha **13 assist in totale**. Su 205 partite dal vivo solo 15 hanno assist > 0. Conferma la nota del PO (90–95% di fallimento). Totale carriera 142 assist contro 402 gol. | Qualunque partita dal vivo: scegliere in ogni highlight l'opzione di passaggio (Filtrante / Uno-due / Servi X libero / Lancio smarcante / Sponda) e leggere esito e tabellino. Sonda: `tests/visual/c177-car1-probe-assist.mjs <save>` (nella prova: 2 passaggi scelti, 2 intercettati). Conteggio sul file `highlight.jsonl` (`act.t == 'pass'`). | nessuna foto dedicata (il difetto è statistico, sui dati) |
| D2 | MEDIA | S1 W8 min 18 (e ricorrente: 80 casi) | Highlight «Finta e cambio di passo» | L'opzione di **dribbling** «🌀 Finta e cambio di passo» viene giocata dal 3D come **passaggio** (`act.t='pass'`) e nel **63 casi su 80 (79%)** finisce con «Anticipato dall'avversario / Ti portano via il pallone / Intercettato»; riuscita solo 8/80. Esito scritto ≠ azione scelta: S1 W8 min 18 il testo dice «TIRO FUORI DI POCO · Finta e cambio di passo» ma la scelta era un dribbling. | Aprire una partita dal vivo con highlight tipo «Ricevi fra le linee»; scegliere «Finta e cambio di passo»; guardare 3D e banner. Dati: `highlight.jsonl`, campo `scelta` contenente «Finta e cambio». | `D01-a-finta-scelta-S1W8.png`, `D01-b-finta-in-corso-S1W8.png`, `D01-c-finta-esito-tiro-fuori-S1W8.png` |
| D3 | MEDIA | S1 W8 min 2 (visto una volta con foto) | Highlight «Tiro di potenza» → «GRANDE PARATA DEL PORTIERE» | Il banner racconta una parata del portiere, ma nel quadro il portiere non si vede: l'eroe (10 FERRARO) calcia in rovesciata sovrapposto a un difensore (2 ROMANO), palla ai suoi piedi. Testo ≠ 3D. | S1 W8, primo highlight della partita, scegliere «Conclusione potente». | `D02-parata-con-difensore-S1W8.png` |
| D4 | MEDIA (da confermare dal vivo) | tutta la carriera | Highlight, banner d'esito | In **271 highlight su 1.238 (22%)** il banner d'esito catturato è la sola intestazione neutra **«LA GIOCATA» + nome della giocata**, senza esito scritto né voto nei 6 s di campionamento; in 93 di questi casi lo stato 3D è «passaggio intercettato», in 10 «tiro parato», 7 «fuori». Esempio S1 W31 min 3 «🔁 LA GIOCATA · Uno-due con COSTA» → 3D intercettato → cronaca successiva «Giro palla: Sanguinetti (SIC)…». Non riprodotto nella sonda dedicata (7 highlight su save S12W28: banner sempre corretti), quindi **può essere una finestra di caricamento catturata troppo presto**: serve conferma a occhio. | Dati: `highlight.jsonl`, `esitoTxt` contenente «LA GIOCATA». Esempi: S1W31 m3, S1W36 m86, S2W7 m68, S4W29 m67. | (nessuna foto: il banner non è stato fotografato nel momento giusto) |
| D5 | BASSA | S18 (e storia) | Salvataggio/dati `matchHistory` | Le due partite europee (UCL) nel `matchHistory` **non hanno il campo `season`** (né `isHome`): S18 W12 TAT e S18 W34 STA. Qualsiasi conteggio per stagione le perde: sono la causa dei ~435 falsi «gol/assist stagione ≠ somma partite» del pilota (somma 29 invece di 32; con le 2 europee fa 32). Nessun effetto visibile a schermo trovato. | Aprire il salvataggio finale `dati-carriera-177-1/stato-ritiro.json`, `player.matchHistory`, filtrare le voci con `euro:true`. | – |
| D6 | BASSA | S8 W2 | Cruscotto, card carriera | Errore di concordanza: «Prima parte con il FC Augsburg: **1 partite** · 0 gol · 0 assist» (da registrare nel record grezzo, 38 occorrenze della stessa schermata). | Primo cruscotto di S8 dopo il trasferimento (secondo la riga grezza). | – |
| D7 | BASSA (osservazione di design) | S14–S18 | Fine carriera / declino | **Il declino quasi non esiste**: OVR 90 a 29–31 anni, 89 a 32–33, 88 a 34; 32 gol a 34 anni, Trofeo d'Oro e UCL nell'ultima stagione. Il ritiro è imposto da una regola di età («Tour d'addio, l'ultima stagione») e non da un calo del giocatore; non ho potuto osservare la fase di declino fisico. | Leggere `registro.jsonl` (colonne `eta`, `ovr`) dopo S13. | `ritiro-01.png` |
| D8 | BASSA | S18, fine carriera | Schermata «Fine Carriera» | La schermata dice «**17 stagioni**» mentre il titolo del cruscotto e il salvataggio dicono S.18 completata; le 17 sono solo le stagioni da pro, ma i totali (402 gol, 740 presenze) includono i 7 gol e le 33 presenze della Primavera. | Terminare la carriera e leggere «Statistiche Carriera». | `ritiro-03.png` |

## Controlli passati (nessun difetto trovato)

- **Ritiro e fine carriera**: percorso completo, lettera d'addio coerente (17 stagioni, 740 presenze, 402 gol), Legacy 1000/1000, salvataggio ricaricabile con scheda «Carriera conclusa · S.18» e «Rivivi il finale» (`ritiro-reload.png`).
- **Salva e ricarica a ogni stagione** (pilota, S1–S18): uno stato diverso al ricaricamento è stato segnalato 7 volte dal pilota (`cup.club`, `playedMd`, archetipo del compagno). **Non riprodotto** con sonda dedicata su `save-S14W20` e `save-S18W20` (`c177-car1-probe-reload.mjs`: `cup.club` e compagni identici dopo ricarica): da considerare non confermato.
- **Coerenza gol highlight ↔ tabellino**: in 94 partite con tabellino leggibile nessun caso di gol «GOL!» negli highlight maggiore dei gol a tabellino.
- **Convocazione Nazionale (S12 W28, S13 W28, S13 W35)**: il pilota l'aveva segnata come «partita live non parte»; **non confermato**: il tasto «Gioca la partita» porta alla schermata partita (`D-nazionale-convocazione.png`, `D-nazionale-dopo-clic.png`).
- **Schermata «Fine stagione» S18**: il pilota si è fermato perché il tasto finale era «🏁 Il giorno dell'addio →» (ultima stagione); limite del pilota, non del gioco.

## Dati grezzi scartati (strumento, non gioco)

Dei 680 record di `difetti-grezzi.jsonl` non sono difetti del gioco: 132+16 eccezioni del pilota (`__CPM_CAREER` assente / pagina chiusa), 34 «finestra ripetuta 7 volte» (interviste a tre passi con la stessa intestazione), 24 «tasto principale non fa avanzare» S10 W21 (Coppa delle Nazioni, poi proseguito), 22 «schermata ferma» (`proTransition`, `clubPresentation` a tasto singolo, `seasonEnd`), 12 «punteggio finale ≠ registrato» (ordine casa/trasferta o partite di Nazionale confrontate con il solo storico di club), 10 «residuo stile (PO-287)» (è la domanda dell'intervista «Come descrivi il tuo stile di gioco…», legittima), 10 `net::ERR_FAILED` (risorse esterne bloccate in cloud).

## Conteggio

Alti: 1 · Medi: 3 (D2, D3, D4 da confermare) · Bassi: 4 (D5–D8).
