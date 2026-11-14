# Rapporto — giro 201 (build 7.999.195) — PO-418, PO-428

Ramo `sviluppo/giro201-salvataggi`, partito da `lavoro/195` (contiene i giri 198 Agente/svincolato e 199 Home: i loro guardiani
`agente-198`, `svincolato-198`, `home-199` sono verdi sul build finale). `GAME_VERSION` non toccato (resta «7.999.193» nel codice),
`SAVE_VERSION` non toccato (resta 9). Un solo rosso per il giro: `window.__CPM_NO_G201` (spegne insieme le due voci).
Guardiani nuovi `provini-201` e `scelte-201`. Foto in `docs/sviluppo/giro201/` (375×667, dpr 2). Codice di gioco toccato:
`src/17-menu-creazione-pannelli.jsx` (offerte) e `src/18-career-app.jsx` (scelte); `CARRIER-MANAGER-AV.html` ricomposto con
`tools/build-src.mjs`, `tools/check-src.mjs` = IDENTICO BYTE PER BYTE.

| Voce | Cosa cambia | Rosso | Guardiano |
|---|---|---|---|
| PO-418 (G189-06) | offerte dei provini uguali a ogni riapertura; una riga dice perché arrivano | `__CPM_NO_G201` | `provini-201` |
| PO-428 (G189-16) | le finestre con una scelta tornano dopo la chiusura dell'app; «Ci penso» lascia l'offerta in Agente fino alla scadenza | `__CPM_NO_G201` | `scelte-201` |

---

## 1. PO-418 — Offerte dei provini

### Misura prima
Letto nel codice (`OffersScreen`, src/17): le offerte si ordinavano per `prestigio + (Math.random()−0,5)·30`. La schermata offerte
riparte dalla busta `cpm-trial-prog` a ogni riapertura, quindi il sorteggio si rifaceva. Misurato con `provini-201` sul braccio
rosso (= codice di prima), stessi provini, quattro aperture:

| Provini | Apertura 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 2 gol, voto 7,3 | Cesenate · Empolese | Lariano · Cremona | Altoadige · Salernum | Cittadino · Bruzio |
| 8 gol, voto 8,5 | Valmora · Torino Ath. · Vellamare | Valmora · Vellamare · Dorvelli | Torino Ath. · Dorvelli · Vellamare | Dorvelli · Valmora · Capitale |

Nessuna riga spiegava la regola, che esisteva già ma era nascosta: punteggio = gol×2 + voto medio×5; oltre 50 tre offerte dai club
più forti, altrimenti due dai meno forti (`prima-offerte-*.png`).

### Correzione
- Il rumore del sorteggio è seminato da nome, nazione e risultati dei tre provini (`seededRng(hashStr(...))`): stessi provini =
  stesse offerte. **La regola non cambia** (stessa soglia, stesso rumore ±15, stesso numero di offerte).
- Sotto la riga del riepilogo, una riga dice il perché, con i numeri veri. Esempi misurati:
  - «2 gol e voto medio 7,3: per gli osservatori fanno 40,5 punti (gol ×2 + voto ×5). Per le tre offerte dei club più forti
    servivano più di 50 punti: te ne mancavano 10, cioè circa 5 gol in più. Ti cercano due club della fascia più bassa (Primavera 2).»
  - «8 gol e voto medio 8,5: per gli osservatori fanno 58,5 punti (gol ×2 + voto ×5), oltre la soglia di 50. Ti cercano tre club
    fra i più forti (Primavera 1).»

### Misura dopo (`provini-201`, verde)
Quattro aperture uguali in entrambi i casi (Bruzio · Cesenate; Valmora · Dorvelli · Torino Athletic), motivo presente e coerente,
zero errori. Rosso bocciato (offerte diverse a ogni apertura, nessun motivo). Foto `dopo-offerte-sotto-375.png`, `dopo-offerte-sopra-375.png`.

### Fuori ambito (dichiarato)
- Le parti (c) e (d) della proposta G189-06 **non** le ho fatte: cosa promette ogni offerta (ruolo, mister, stadio, crescita) e i
  titoli dopo ogni provino con la stessa misura delle offerte («Prestazione da predestinato!» dipende ancora dal voto del singolo
  provino). Con PO-321 (chiuso l'08/11, giro 115) non c'è conflitto: quel giro non aveva toccato la scelta delle offerte.
- «circa N gol in più» è il conto a voto invariato (ogni gol vale 2 punti).

## 2. PO-428 — Nessuna scelta si perde chiudendo l'app

### Misura prima (`scelte-201`, braccio rosso = codice di prima)
Metodo: salvataggio sintetico, scelta aperta come la apre il gioco (handler veri, o il varco di collaudo già esistente in
`__CPM_CAREER`), attesa 1,5 s (l'autosave ha un ritardo di 600 ms), **ricaricamento della pagina senza rispondere**, «CONTINUA»,
e si guarda se la scelta è di nuovo a schermo. Log completo: `docs/sviluppo/giro201/misura-prima-scelte.txt`.

| Scelta | Prima | Dopo | Perché si perdeva |
|---|---|---|---|
| Saga di mercato, episodio 2 (risposta ai media) | torna | torna | riquadro derivato dal salvataggio (`transferSaga`) |
| Saga, episodio 3 → «Ascolta l'offerta» | **persa** | torna | la saga si azzera al tocco, l'offerta vive solo nello stato di React |
| Offerta di trasferimento diretta | **persa** | torna | solo stato di React |
| Richiamo del presidente (giro 198) | **persa** | torna | `richiamo198` segnato «mostrato» nel salvataggio all'apertura |
| Trattativa del rinnovo | **persa** | torna | solo stato di React |
| Schermata «Sei svincolato» (giro 198) | **persa** | torna | `svincWarn94` segnato all'apertura |
| Impulso della settimana | **persa** | torna | solo stato di React (la settimana è già «vissuta») |
| Spogliatoio | **persa** | torna | idem |
| Intervista | **persa** | torna | solo stato di React |
| Verifica trimestrale del mister | **persa** | torna | `lastMonthlyReview` segnato all'apertura |
| Momento di carriera | **persa** | torna | solo stato di React |
| Primo incontro col procuratore | **persa** | torna | solo stato di React (aperto dal giocatore, ma è una scelta) |
| Patto col mister (verdetto) | torna | torna | riquadro derivato (`coachPact`) |
| «Da decidere» della Home (giro 199, campo d'allenamento) | torna | torna | riquadro derivato |
| Convocazione in Nazionale | torna* | torna* | *la lobby non torna, ma la partita resta in calendario e la Home la ripropone: non c'è una scelta da perdere |
| Offerta lasciata «in Agente» | — (non esisteva) | torna, fino alla scadenza | vedi sotto |

**4 su 15 tornavano prima, 15 su 15 dopo** (più l'offerta in Agente). Non misurati: il colloquio proattivo del mister
(`coachModal`, nessun varco per aprirlo a comando: è nella copia salvata ma il guardiano non lo prova), il discorso del mister
prima della partita (legato all'avvio della partita, non l'ho incluso), le scelte dentro la partita e l'apertura di stagione
(già derivate dal salvataggio, giro 7.491: non misurate qui).

### Correzione
- **Copia delle finestre aperte** in `player.scelte201 = {s, w, m:{tipo:dati}}` (campo additivo, nessun bump di `SAVE_VERSION`).
  Si aggiorna quando una delle dieci finestre (offerta, richiamo, svincolato, rinnovo, settimana/impulso/spogliatoio, intervista,
  verifica, momento, procuratore, mister) si apre o si chiude; si svuota quando sono tutte chiuse. Al montaggio della carriera, se
  stagione e settimana sono le stesse, le finestre si riaprono identiche. Il momento di carriera contiene funzioni e si salva per
  `id`; una finestra con dati non serializzabili non si salva (nessuna delle misurate lo è).
- **Offerta in Agente**: nella finestra dell'offerta c'è un tasto in più, «⏳ Ci penso · resta in Agente fino alla sett. N». L'offerta
  va in `player.offerta201 {o, s, scad}` (additivo) e nella scheda Agente compare il riquadro «Offerta in attesa di risposta» (club,
  tipo, stipendio, durata, «scade alla settimana N (ancora K settimane)») con «💼 Rivedi l'offerta», che riapre la stessa finestra.
  Passata la scadenza l'offerta decade: riga nel registro «⌛ L'offerta di … è scaduta…» e un avviso. Finché un'offerta è in attesa
  non ne arrivano altre (stessa guardia di `!transferOffer`, nei quattro punti dove nasce un'offerta).
  **Scadenza scelta da me (dubbio per il PO):** fine della finestra di mercato in cui è arrivata (settimana 5 d'estate, 23
  d'inverno); fuori finestra, la settimana dopo. Il gioco prima non aveva scadenze per le offerte.

### Misura dopo (`scelte-201`, verde)
- A: 15/15 aperte e di nuovo a schermo dopo il ricaricamento, zero errori (foto `aperta-*`, `dopo-ricarica-*`; rosso `prima-ricarica-*`).
- B: «Ci penso» → dopo il ricaricamento il riquadro in Agente dice «FC Stamford · trasferimento definitivo 14.000€ a settimana · 3
  anni · scade alla settimana 23 (ancora 3 settimane)»; «Rivedi» riapre la finestra; alla settimana 24 il riquadro non c'è e la riga
  di scadenza è nel registro (`dopo-offerta-in-agente-375.png`).
- C: la scelta riaperta si risponde (impulso con la prima scelta, offerta con «Rifiuta») e dopo un altro ricaricamento **non torna**;
  la copia salvata è vuota. Niente finestre fantasma.
- Rosso bocciato: 4/15 tornano, nessun «Ci penso».

## 3. Controlli (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

Tutti sul build finale (check-src IDENTICO BYTE PER BYTE); memoria libera ~14 GB e disco 29 GB liberi prima di ciascuno.

| Controllo | Esito | Numeri |
|---|---|---|
| provini-201 | ✅ verde, rosso bocciato | 2 casi × 4 aperture uguali, motivo coerente |
| scelte-201 | ✅ verde, rosso bocciato | A 15/15 (rosso 4/15) · B · C (la parte C è stata aggiunta dopo e girata da sola, verde) |
| agente-198 | ✅ verde | rossi bocciati |
| svincolato-198 | ✅ verde | rossi bocciati |
| home-199 | ✅ verde | rossi bocciati |
| momento-194 | ✅ verde | rossi bocciati |
| interviste-183 | ✅ verde | rosso visibile |
| test:logic | ✅ | 51 test, 51 pass |
| save-compat | ✅ PASS | 12 pass, 0 fail |
| career-critical | ✅ PASS | tutta la serie (fino alla Coppa intera) |
| tripath-chokepoint | ✅ PASS | i 3 percorsi delegano a ogni punto condiviso |

Guardiani aggiunti alle catene di `ci-runner.mjs` (completa, carriera, mappa di src/18, lenti); `node --check` verde.
Non eseguiti (non richiesti dal giro): gate `validate-situations`, catene `mirata`/`notte`.
Nota onesta: lanciando un controllo statico ho importato per sbaglio `ci-runner.mjs`, che è partito da solo; l'ho fermato dopo
pochi secondi (nessun processo superstite, nessun file del repo cambiato).

## 4. Dubbi per il PO

1. Scadenza dell'offerta in Agente: fine finestra di mercato (5 / 23), fuori finestra la settimana dopo. Scelta mia.
2. Le finestre si riaprono solo se alla riapertura stagione e settimana sono le stesse; se nel frattempo la settimana è avanzata
   (non dovrebbe succedere: le finestre bloccano l'avanzamento) la copia si scarta.
3. Il tasto «Ci penso» è una scelta nuova nella finestra dell'offerta (prima c'erano solo Accetta, Rifiuta e la controproposta).
4. PO-418 (c) e (d) non fatte (vedi §1).
5. Nessuna prova su un telefono vero: misure in headless a 375×667. Il ricaricamento della pagina simula la chiusura; un'uccisione
   dell'app entro 600 ms dall'apertura della finestra può ancora perderla (ritardo dell'autosave, già noto).
