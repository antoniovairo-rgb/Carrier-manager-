# Rapporto — giro 198 (build 7.999.195) — PO-456, PO-446, PO-432

Ramo `sviluppo/giro198-agente`, partito da `lavoro/195`. `GAME_VERSION` non toccato (resta «7.999.193» nel codice).
Un solo rosso per il giro: `window.__CPM_NO_G198` (spegne insieme le tre voci). Guardiani nuovi `agente-198` e `svincolato-198`,
sonda di misura `misura-198` (stampa numeri, non giudica). Foto prima/dopo in `docs/sviluppo/giro198/` (375 px, dpr 2).
Tutto il codice di gioco toccato è in `src/18-career-app.jsx`; `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`,
`tools/check-src.mjs` = IDENTICO BYTE PER BYTE.

| Voce | Cosa cambia | Rosso | Guardiano |
|---|---|---|---|
| PO-456 (G195-08) | riquadro «Da fare ora» in cima alla scheda Agente | `__CPM_NO_G198` | `agente-198` A |
| PO-446 (G193-16) | la fermata del tasto momento sul rinnovo dice dove andare e ha il tasto; il motivo sotto il tasto spento si tocca | `__CPM_NO_G198` | `agente-198` B |
| PO-432 (G193-01) | due richiami del presidente; schermata «Sei svincolato»; Home coerente da svincolato | `__CPM_NO_G198` | `svincolato-198` A, B |

---

## 1. Misure prima della correzione

Salvataggio di prova (stagione 3, sett. 20, mercato aperto, contratto all'ultimo anno, procuratore, nessun compito assegnato).
Posizione = bordo alto dell'elemento, in schermi dall'inizio della scheda Agente (`misura-198 agente`, braccio `CPM_FLAG=__CPM_NO_G198`).

| Elemento | 375×667 prima | 375×667 dopo | 390×844 prima | 390×844 dopo |
|---|---:|---:|---:|---:|
| riquadro «Da fare ora» | — | 0,29 | — | 0,23 |
| avviso «⚠️ Contratto in scadenza…» (resta nel riquadro Il tuo contratto) | 2,19 | 2,93 | 1,71 | 2,29 |
| «📋 Negozia rinnovo» | 2,28 | **0,44** | 1,76 | **0,35** |
| «Compito della settimana» | 2,47 | **0,54** | 1,91 | **0,43** |
| «Prepara rinnovo» (compito) | 2,72 | **0,64** | 2,09 | **0,51** |
| «🔍 Fai girare il nome» | 1,54 | **0,91** | 1,19 | **0,72** |

I miei numeri «prima» sono diversi da quelli del giro 195 (2,4 / 2,46 / 2,9): lo stato di prova non è lo stesso (qui il mercato è
aperto e la sua fisarmonica sta sopra). L'ordine di grandezza è lo stesso.

**Tasto del momento (prima, `misura-198 momento`):** corsa partita dalla sett. 27 già vissuta, fermata entrando nella 28 con motivo
`rinnovo`. Il riquadro diceva «📋 Rinnovo · 1 settimana · 0 partite», **nessun tasto, nessuna indicazione di dove andare**; sotto,
il motivo «Prima rispondi al rinnovo» era testo semplice (il tocco sul tasto spento apriva già la trattativa dal giro 173, ma non
era scritto da nessuna parte).

**Svincolato (prima, `misura-198 svincolo` sulla build di partenza):** una stagione intera con contratto all'ultimo anno senza
rinnovare. Nel registro **una sola riga** (sett. 28, «il club è pronto a parlare del rinnovo») e un avviso che scorre; nessuna
finestra. A inizio stagione 4: un avviso che scorre e il salto alla scheda Agente. Home da svincolato (testo letto dal DOM):
testata «Premier Division · St. 4 · Sett. 3/38 · **1° posto**», card dell'eroe «**in rotazione**», prossima partita del club come
fosse la tua, e il riquadro «Contratto scaduto — sei svincolato» **sotto** a sei fisarmoniche (Storia, Progetto del club, Sponsor…).
È coerente con ciò che il giro 193 ha descritto (1.4). Non ho ricostruito la carriera del giro 193, quindi **non posso confermare**
che il suo caso sia proprio un residuo del giro 94; posso dire che il giro 94 aveva lasciato avvisi che scorrono e una card, e
nessuna finestra.

## 2. Cosa ho cambiato

### PO-456 — «Da fare ora» in cima all'Agente
In testa alla scheda Agente (subito sotto il titolo), solo da professionista e solo se c'è qualcosa con una scadenza:
- **contratto**: con la stessa guardia del tasto «Negozia rinnovo» del riquadro Il tuo contratto (ultimo anno entro la sett. 35, o
  contratto scaduto; non in prestito). Testo «📋 Il contratto scade a fine stagione — il rinnovo si tratta fino alla settimana 35 ·
  il compito «Prepara rinnovo» vale +10% sull'offerta» oppure «⛔ Contratto scaduto: sei svincolato». Tasto «📋 Negozia rinnovo»
  (`openNegoModal`, lo stesso).
- **compito della settimana**, se non assegnato: i quattro compiti in una griglia 2×2 (stesso effetto del tocco di sotto). Quando
  il compito è da assegnare la fisarmonica «Compito della settimana» più in basso non si mostra (sarebbe un doppione); quando è
  assegnato torna, con lo stato «✓ Attivo questa settimana».
- **mercato aperto**, se la ricerca della finestra non è fatta: «🔍 Fai girare il nome» (lo stesso gestore, ora estratto in una
  funzione e usato da entrambi i tasti).
Senza nulla in scadenza il riquadro non c'è. Nessuna regola di gioco cambia.

### PO-446 — la fermata porta lì
- Fermata della corsa con motivo `rinnovo`: sotto il riepilogo «Il club aspetta una risposta sul rinnovo: la trovi nella scheda
  Agente, in cima.» e il tasto «📋 Vai al rinnovo →» (da svincolato: «💼 Vai all'Agente →»). Il tasto apre la scheda Agente e porta in
  vista il riquadro «Da fare ora».
- Tasto spento con «Prima rispondi al rinnovo» o «prima trova una squadra»: la riga del motivo è un collegamento («… → vai
  all'Agente», area di tocco ≥ 44 px) che fa lo stesso. Gli altri motivi («prima la Nazionale», «chiudi prima la finestra aperta»,
  «prima avvia la stagione») restano testo: non li ho toccati.

### PO-432 — il club ti richiama
- **Due richiami del presidente** in una finestra (`richiamo198`): il 1° entrando nella sett. 19 («Il tuo contratto con … scade a
  fine stagione. Ti vogliamo qui: parliamone adesso, con calma.»), il 2° dalla sett. 33 («Mancano 6 settimane. Se a fine stagione
  non hai firmato sei svincolato…»). Tasti «📋 Parliamo del rinnovo» (apre la trattativa vera) e «Ci penso». Ognuno una volta per
  stagione (campo additivo `player.richiamo198 = {s, n}`, nessun bump di `SAVE_VERSION`) e una riga nel registro. Valgono anche
  dopo un rifiuto della controfferta (il caso del giro 193).
  **Condizioni:** da professionista, non in prestito, contratto all'ultimo anno, non rinnovato in questa stagione, **e il club
  vuole trattare**: ho usato la stessa soglia con cui `openNegoModal` rifiuta (fiducia < 40, o riserva con fiducia < 52), per non
  far telefonare un presidente che un tocco dopo rifiuta di trattare. *Dubbio per il PO:* la proposta G193-01 dice «se il
  calciatore è importante per il club»; ho preso la soglia che il gioco già usa, non una nuova.
  Il richiamo aperto ferma il tasto «Vai al prossimo momento» (motivo `rinnovo`, quindi con il tasto «Vai al rinnovo →»).
- **Schermata «Sei svincolato»** all'inizio della stagione in cui il contratto risulta scaduto (al posto dell'avviso che scorreva e
  del salto all'Agente): club, perché non giochi («Senza contratto non sei convocato: … gioca le sue partite senza di te, e i tuoi
  numeri restano fermi finché non firmi»), e le due strade che il gioco ha davvero: «📋 Torna a trattare con …» e «💼 Cerca una
  squadra (Agente)», più «Ho capito». La terza strada della proposta G193-01 («fermati un anno») **non l'ho fatta**: sarebbe una
  regola nuova, fuori da PO-432.
- **Home coerente da svincolato:** il riquadro «⛔ Sei svincolato» sale in cima alla Home (sopra il tasto del momento e la prossima
  partita); la testata dice «Svincolato · ultimo club · St. N · Sett. N/38» senza la posizione del club; la card dell'eroe dice
  «svincolato» al posto del ruolo in squadra. Economia (PO-157) non toccata: stipendio, patrimonio e trattativa sono gli stessi.

## 3. Misure dopo (guardiani)

**agente-198** (verde col verde, rossi bocciati):
- 375×667: riquadro a 0,27, «Negozia rinnovo» 0,44-0,51, «Prepara rinnovo» 0,62-0,69 — interi sopra la barra in basso (bordo
  superiore della barra misurato a 556 px); «Fai girare il nome» 0,91-0,98: **è sotto la barra a 375×667**, serve un piccolo
  scorrimento (~0,15 schermi). A 390×844 tutto visibile senza scorrere (barra a 726 px, «Fai girare il nome» 0,72-0,77).
- I tre tasti del riquadro fanno ciò che facevano sotto (compito assegnato e riga che esce; ricerca della finestra consumata;
  trattativa aperta). Senza nulla in scadenza il riquadro non c'è.
- B1: fermata `rinnovo` → «Vai al rinnovo →» → scheda Agente, riquadro in vista. B2: motivo «Prima rispondi al rinnovo → vai
  all'Agente» → stesso arrivo. Rossi: riquadro assente, fermata senza tasto, motivo solo testo.

**svincolato-198** (verde col verde, rossi bocciati):
- A1: richiamo 1 alla sett. 19, «Parliamo del rinnovo» apre la trattativa, alla 20 non torna. A2: richiamo 2 alla sett. 33
  («Mancano 6 settimane»), «Ci penso» chiude e alla 34 non torna. Rinnovato: nessun richiamo. Fiducia 30: nessun richiamo.
- B: stagione 4, schermata «Sei svincolato» con club e due strade; Home: riquadro a 119 px dall'alto contro 338 del tasto del
  momento; testata «Svincolato · ultimo club · St. 4 · Sett. 1/38»; ruolo «svincolato». Dalla Home «Cerca una squadra» porta
  all'Agente con «⛔ Contratto scaduto: sei svincolato» in cima.

**Sonda su una stagione intera** (`misura-198 svincolo`, dopo): richiami a schermo nelle settimane 19 e 33 (con `CPM_DBG=1` si vede
la memoria `richiamo198` passare a n=1 alla 19 e a n=2 alla 33), schermata dello svincolato all'inizio della stagione 4. Nota onesta:
la sonda ha catturato a schermo il solo richiamo della 19 in una corsa; con una prova mirata (sett. 32 → 33) la finestra c'è. Il
guardiano giudica il caso mirato, non la stagione intera.

## 4. Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

Tutti sulla build finale (`check-src` IDENTICO BYTE PER BYTE), memoria libera ~15 GB e disco 29 GB liberi prima di ciascuno.

| Controllo | Esito | Numeri |
|---|---|---|
| agente-198 | ✅ verde, rossi bocciati | A 375 e 390: verdi; 3 tasti del riquadro; senza scadenze niente riquadro; B1 e B2 verdi |
| svincolato-198 | ✅ verde, rossi bocciati | A1, A2, rinnovato, fiducia 30; B schermata + Home |
| momento-194 | ✅ verde | A intervista da sola · B riepilogo senza Ok · C tasto del club, rossi bocciati |
| gioca-188 | ✅ verde | 6 ok, 0 ko |
| momento-185 | ✅ verde | 25 ok, 0 ko |
| interviste-183 | ✅ verde | rosso visibile |
| career-critical | ✅ PASS | tutta la serie (fino a coppa-intera) |
| test:logic | ✅ | 51 test, 51 pass |
| save-compat | ✅ PASS | 12 pass, 0 fail |
| tripath-chokepoint | ✅ PASS | i 3 percorsi delegano a ogni punto condiviso |

Non eseguiti (non richiesti dal giro): gate `validate-situations`, catene `mirata`/`notte` complete.

## 5. Cosa resta fuori / dubbi per il PO

1. A 375×667 «Fai girare il nome» resta sotto la barra in basso: per averlo intero servirebbe stringere ancora il riquadro (per
   esempio i compiti su una riga sola). Non l'ho fatto.
2. Da svincolato la card della prossima partita della Home mostra ancora la gara del club («Prossima · … · 1ª giornata») e la
   fiducia del mister resta a vista: il riquadro in cima spiega che il club gioca senza di te, ma la card non lo ripete. La proposta
   G193-01 (c) toglieva anche fiducia del mister ed eventi di spogliatoio: non l'ho fatto (non sono testi, sono pezzi di Home).
3. Soglia dei richiami: quella del rifiuto di `openNegoModal`, non un «giocatore importante» nuovo (vedi §2).
4. La terza strada «fermati un anno» non esiste nel gioco e non l'ho aggiunta.
5. Nessuna prova su un telefono vero: posizioni misurate in headless a 375×667 e 390×844.
