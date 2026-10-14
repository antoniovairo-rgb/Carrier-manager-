# Collaudo approfondito della release 7.999.166 (ramo `main`)

Collaudatrice, 14/10/2026 sera, su decisione PO del 14/10 («Collaudo approfondito dopo ogni release!»).
Oggetto: `main` a `aad7548` (`GAME_VERSION` 7.999.166). Il gioco non è stato toccato: su questo ramo (`collaudo/release-166`) ci sono solo sonde, dati e foto.
Tutto è misurato in headless (Chromium, GLB acceso, 412×915, velocità 2×): dove serve il telefono lo dico.

## Tabella riassuntiva

| # | Voce | Gravità | Riproducibile | Nuova o già nota |
|---|---|---|---|---|
| V1 | **PO-239 verificata**: il chip sopra la scena mostra solo «NN fps». **2.867 letture** durante le scene in 15 partite: 0 con «CGTrader» o «corpi» (10 letture con chip assente, all'apertura) | — (verde) | sì | PO-239 |
| V2 | **PO-240 verificata**: «Sfiora il vantaggio» **mai** a schermo durante le scene (81 scene, testo della pagina letto a ogni giro); nelle liste del riquadro di fine scena non resta nessun'altra frase che dipende dal punteggio | — (verde) | sì | PO-240 |
| V3 | **PO-229 giro 12, portiere sui tiri non riusciti**: 0 tuffi dal lato sbagliato su **30** conclusioni con gesto del portiere (23 parate: 16 lato giusto, 7 centrali; 7 tiri fuori: 4 lato giusto, 3 centrali). **Nessun tiro al palo** nelle partite vere: la correzione del giro 12 (lato del palo) **non è stata esercitata** dal flusso vero | — (verde, con limite) | sì | PO-229 |
| K1 | **PO-207 visto**: dopo un gol nato **dentro una scena** il gioco fluido riparte senza rimessa dal centro in **3 casi su 4** giudicabili (2,8–5,3 s di gioco senza «kickoff» né pallone a (50,50)) | media | sì | già nota, **PO-207** (deroga PO, giro 18) |
| K2 | **Nessuna intervista dopo le partite della Nazionale: 0 su 6** (amichevole, 3 gare di girone e finale della Coppa delle Nazioni, più la replica della finale). Dopo le partite di club **9 su 9** | media | sì | già nota, **PO-243** |
| K3 | «🏃 Conduci palla al piede e tira»: **parata senza gesto del portiere** (giro A, Coppa delle Nazioni, 3') e, caso nuovo, **tiro fuori con il pallone che parte all'indietro** (x 33→28 per 0,42 s) e poi rotola sul fondo a 1,3 u dal portiere fermo (giro B, Lega A, 27'). Entrambe le scene «Conduci» viste sono anomale (2 su 2) | alta (famiglia) | sì per la parata (anche nei collaudi 164/165); il tiro fuori visto 1 volta | già nota, **PO-242** (il tiro fuori è un caso nuovo della stessa voce) |
| K4 | **Ingresso in campo: la squadra ospite arriva dalla linea opposta**: da z +36 a z −27 in ~2,6 s (la squadra di casa da −33,8 a −28,1). I bambini ci sono per entrambe le squadre: 11+11 in **15 partite su 15**, a 0,72 u dal loro calciatore | media | sì | già nota, **PO-245** |
| K5 | «Caricamento giocatori…» in **15 partite su 15**, una volta, per **7,5–8,1 s** (tetto 8 s); in 14 casi in gioco fluido prima della prima scena, in 1 durante l'ingresso | media | sì (headless) | già nota, **PO-241 / PO-232** |
| K6 | **Fluidità**: la prima partita dopo l'avvio pesa di più. Compiti lunghi della prima contro la seconda: **+49%** (giro B), **+22%** (C), **+46%** (A); il compito più lungo è nella prima partita (10,7–12,5 s contro 7,7–8,6 s); il **57–80%** del tempo dei compiti lunghi cade fra prepartita e ingresso | media (da misurare sul telefono) | sì (headless) | già nota, **PO-237** |
| K7 | Giornale di fine partita: «**FASE A ELIMINAZIONE**» sull'amichevole e su una gara di **girone** della Coppa delle Nazioni (Spagna–Olanda, 3ª giornata); «G. 9» / «G. 5» è la settimana | bassa | sì | già nota, **PO-244** |
| K8 | **Eroe «Non convocato»** → «Simula e avanza la settimana» → nel salvataggio la gara gli dà **presenza, gol e voto** (S13 sett. 2: 1 gol, voto 7,7; giro B sett. 11: 1 gol, voto 7,2) e la home conta «2 Partite · 1 Gol» | media | **sì, 2 su 2** | già nota, **PO-222** (zona G ferma): qui anche gol e voto, non solo la presenza |
| K9 | Calendario, riquadro della coppa troncato «**Ottavi di F…**» a 412 px | bassa | sì (foto) | famiglia **PO-247** («Nazional…» troncato) |
| K10 | Scheda del mister con 2 opzioni e la parola «ordine» («Seguo l'ordine / Faccio di testa mia») | — | sì | già nota, **PO-234** (la 166 non la tocca) |
| N1 | Riquadro di una **punizione crossata** («↗️ Palla in area», dal limite, 26 m): «⚡ **Filtrante perfetto!** La conclusione è respinta — c'è ancora da giocare!». Un cross da punizione chiamato «filtrante» | bassa | 1 caso visto, in finale di Coppa delle Nazioni (27') | **nuova**, famiglia PO-218 (lessico degli esiti) |
| N2 | Festa del trofeo «CAMPIONI! · Spagna · Coppa delle Nazioni»: pulsante **verde** «🎉 Festeggia», mentre il pulsante primario del kit è rosso scuro («Avanti», «Continua», «Apri la busta») | bassa / da decidere | sì (2 finali su 2) | **nuova**, stessa famiglia di PO-235 (pulsante verde fuori standard) |
| N3 | Una scheda del mister (55', «eroe stanco») risulta **generata dal motore ma senza scelta** e la sonda non l'ha mai vista a schermo; nella prima corsa della stessa partita era stata mostrata e scelta regolarmente | da verificare | **no** (1 su 31 schede) | possibile caso di **PO-246**, non confermato |

**Senza difetti nelle cose misurate:** tabellone = tabellino del motore in **15 partite su 15**; gol dell'eroe col pallone in rete nel 3D **5 su 5**; corpi delle scene: 0 non CGTrader, 0 T-pose, 0 teste mancanti (75 scene col testimone); classifica coerente in **15 controlli settimanali** (gol fatti = gol subiti, giocate = V+N+P, punti = 3V+N, vittorie totali = sconfitte totali); giornate di lega 1–34 senza doppioni; 0 codici ≥ 990 a schermo (PO-233 tiene anche sulla 166); finestre: **69** registrate, 0 fuori schermo, 0 testo tagliato, raggio 20 px su settimana/intervista/mister; schede del mister 1–3 a partita, 30 scelte arrivate al motore; **0 errori di pagina**.

## Come ho giocato

- **Sonda** `tests/visual/collaudo-166-partite.mjs`: è quella del collaudo 165 (che viene dalla 164), con le aggiunte 166 — il chip `[data-cpm=fps907]` e il testo della pagina letti a ogni giro dentro le scene (PO-239, PO-240), i fotogrammi del portiere `__CPM_GK229` di ogni scena non riuscita salvati in `gk229.jsonl` (PO-229), e con `CPM_TRACCIA=1` il testo a schermo e il punteggio a ogni giro nelle scene. Una pagina, carriera continua, GLB acceso, 412×915, 2×. Clicca i pulsanti visibili come un giocatore; in campo le scelte dell'eroe le fa il pilota seedato del gioco (`__CPM_AUTOPLAY`), le schede del mister le chiude la sonda col primo pulsante dopo 1,2 s.
- **Verso del portiere** `tests/visual/collaudo-166-gk-lato.mjs`: applica ai fotogrammi salvati la funzione `analizza()` copiata **tale e quale** da `gk-miss-229.mjs` (stesse soglie). Per le parate, dove il pallone non attraversa il piano del portiere e quel criterio dice sempre «non giudicabile», ho confrontato il verso del gesto col punto di minimo avvicinamento (`zPiano`), con lo stesso margine di 0,8 u.
- **Ingresso** `tests/visual/collaudo-166-ingresso.mjs` (= 165), letture ogni 150 ms.
- **Leve dichiarate:** panchina (prima della 3ª partita dei giri A e B si abbassano fiducia/forma/fatica, decide il gioco; poi si rimettono i valori originali). Effetto: in entrambi i giri il gioco ha prima detto «Non convocato» per una settimana (simulata dalla sonda, da lì K8) e poi ha messo l'eroe in panchina la settimana dopo. **Coppa delle Nazioni** aperta con la leva della collega 164 prima della 5ª partita del giro A. L'amichevole del giro B è arrivata da sola (salvataggio di partenza del collaudo 165). Offerte di trasferimento rifiutate (giri A, C, D).
- Tutti i giri sono girati **da soli** sulla macchina: la fluidità è confrontabile dentro ogni giro.

| Giro | Partenza | Partite |
|---|---|---|
| B | S13 sett. 9, AC Dorvelli (`dati/partenza-b-amichevole.json`) | amichevole Spagna–Portogallo 1-2 · Lega A 0-3 · Lega A 0-0 **dalla panchina** (entrato al 75') |
| C | S13 sett. 9, FC Merseyside (`dati/partenza-c-coppa.json`) | **Coppa Nazionale** ottavi 3-0 · Premier 2-5 |
| A | `fixtures/save-190-s12-ovr93.json`, S12 sett. 38 | Premier 34ª (ultima S12) · fine stagione (premiazione, galà, ritiro) · S13 1ª · (2ª non convocato) · 3ª **dalla panchina** · 4ª · **Coppa delle Nazioni** girone ×3 (Francia 4-1, Portogallo 3-1, Olanda 0-2) |
| D | fine giro A (`dati/partenza-d-finale.json`) | **finale Coppa delle Nazioni** con la Germania 2-0 · Premier 0-0 |
| D2 | stessa partenza di D | replica della finale con la traccia del testo (4-0) |

In tutto **15 partite complete**: campionato (Premier, Lega A), panchina (2), Coppa Nazionale (1), Nazionale (5: amichevole, 3 di girone, finale) più la replica della finale; **81 scene dell'eroe**. Carriera: S12 sett. 38 → S13 sett. 5 nel giro A, S13 sett. 9 → 13 nel B: **in tutto 15 settimane controllate**.

## Le tre novità della 7.999.166

### V1 — PO-239: il chip mostra solo gli fps

- In tutte le 15 partite il chip sopra la scena dice «NN fps» (foto `b-p1-scena1-apertura.jpg` «25 fps», `b-p1-scena1-esito.jpg` «11 fps»). Mai «CGTrader» né «corpi» in 2.867 letture. Nel codice: `src/15-live-match.jsx:10233`, la scritta vecchia esce solo con `__CPM_NO_HUD239`.
- ⚠️ In headless il numero è basso (1–25 fps): è il rendering software, non un difetto.

### V2 — PO-240: «Sfiora il vantaggio» non c'è più nel riquadro

- 0 comparse in 81 scene (testo intero della pagina, letto a ogni giro in `hl_*`). Nel codice la frase è filtrata dalle liste `miss` e `wide` (`src/05-cronaca-stadi-formazioni.jsx:337` e `:358`).
- Ho riletto tutte le liste del riquadro di fine scena (`src/05-cronaca-stadi-formazioni.jsx:329-365`): non resta nessun'altra frase che parli di vantaggio, pareggio, rimonta o raddoppio.
- Nota di documentazione (non un difetto del gioco): il commento del 7.999.166 dice che la frase «resta solo nella cronaca col contesto pari (riga BG `ctx:"drawing"`)», ma nel codice non trovo nessuna riga di cronaca con quel testo (`grep -i "sfiora il vantaggio" src/` trova solo le due liste filtrate e il commento di versione). In pratica la frase oggi non esce da nessuna parte.

### V3 — PO-229 giro 12: il portiere sui tiri non riusciti

- 62 scene non riuscite salvate (`dati/*/gk229.jsonl`), 30 con un gesto del portiere (le altre sono soprattutto intercetti, contrasti e tiri murati, dove il portiere non c'entra). Verso del gesto contro il punto in cui il pallone gli passa più vicino: **0 dal lato sbagliato**.

  | Esito | Con gesto | Lato giusto | Centrale (non giudicabile) | Lato sbagliato |
  |---|---|---|---|---|
  | parata | 23 | 16 | 7 | 0 |
  | tiro fuori | 7 | 4 | 3 | 0 |

- Il criterio `lato` del guardiano, applicato anche alle parate (che il guardiano non giudica), dà «sbagliato» in un solo caso: B1, «💥 Botta sopra la barriera», 12', un `gk_block` che sposta il portiere di 0,32 u (z 1,20 → 0,88) su un pallone che gli arriva a z 1,33. È un pallone centrale: non lo conto come difetto.

- Il gesto del portiere parte sempre **prima** che il pallone passi dal suo piano (ritardo da −0,21 a −1,02 s di scena): nessun «fuori tempo» nel senso del guardiano.
- **Limite:** nessun tiro al palo nelle 15 partite, quindi la correzione specifica del giro 12 (lato del palo a pochi fotogrammi) dal flusso vero non l'ho vista. Il guardiano `gk-miss-229` la prova a scena forzata; io non l'ho rieseguito.
- Tiri fuori **senza gesto** con il pallone «a portata» (≤ 4,5 u): due. Uno è K3 («Conduci palla al piede e tira», a 1,3 u). L'altro (D1, «🎯 Piazzato nell'angolo basso», 38') passa a 4,52 u ed esce a z 6,4, cioè largo di 3 u dal palo: sta sul bordo della soglia e non lo conto.

## Difetti già noti, rivisti sulla 166

### K1 — PO-207: la ripartenza dopo un gol nato in scena

Sonda: pallone del motore campionato in pagina ogni 100 ms per 10 s dopo ogni aumento del punteggio (`ripartenze` in `dati/*/partite.jsonl`).

| Partita | Minuto | Gioco fluido dopo la scena | «kickoff» o pallone a (50,50) |
|---|---|---|---|
| B1 Spagna–Portogallo (amichevole) | 3' | 2,8 s, motore da (45,55) «tenuta» | **no** |
| A3 FC Craven–FC Merseyside (panchina) | 82' | 4,7 s | **no** |
| A6 Spagna–Portogallo (Coppa delle Nazioni) | 74' | 5,3 s | **no** |
| C2 FC Manchester–FC Merseyside | 48' | 0,8 s: il motore rifà volo → «rete» (101,49) → «kickoff» (50,50) | sì |
| A5 / A6 | 19' / 94' | 0,8 s / fischio finale | non giudicabili |

Coerente con la diagnosi della catena (`ripartenza-207`, regressione di SEME-a). Come chiesto, solo conferma.

### K2 — PO-243: nessuna intervista dopo la Nazionale

0 su 6 (B1 amichevole, A5–A7 girone, D1 finale, D2 replica della finale); dopo il fischio della finale compare la festa «CAMPIONI!» e poi la home, senza intervista. Club: 9 su 9 (Premier, Lega A, Coppa Nazionale, panchina), tutte post partita (`ctx` win/loss/draw col punteggio della gara). L'intervista «SETTIMANALE» che compare a inizio giro A è un'altra cosa (foto `a-finestra-1-intervista231.jpg`).

### K3 — PO-242: «Conduci palla al piede e tira»

- **Parata senza gesto** (A7, Spagna–Olanda, 3'): riquadro «Il gol sembrava fatto» (famiglia parata), `__CPM_GK229` senza nessun gesto del portiere. Chiave interna `intercept` con famiglia `saved`.
- **Caso nuovo, tiro fuori** (B2, AC Dorvelli–FC Felsineo, 27', riquadro «Tiro fuori di poco»): i fotogrammi del portiere mostrano l'arco del tiro che va **all'indietro**, x 33,0 → 28,2 in 0,42 s di scena, poi il pallone riappare a x 36,2 / 44,9 / 47,5 e finisce sul fondo a z −3,5 (fuori dal palo), rasoterra (y 0,22); passa a **1,3 u** dal portiere, che resta fermo (nessun gesto). Chiave interna `intercept`, famiglia `wide`, eventi del motore `tiro:fuori`. Dati: `dati/b/gk229.jsonl`, scena 10. **Non ho la foto** (la sonda fotografa le prime 3 scene di ogni partita, questa era la 4ª).
- La stessa coppia «chiave `intercept` / famiglia `saved`» c'è anche su «🌀 Finta e tiro» (3 scene), ma lì il portiere fa il gesto e il riquadro è coerente: la chiave è interna, non la vedo a schermo.

### K4 — PO-245: ingresso, ospiti dalla linea opposta

Misura fitta (`dati/ingresso-fitto.json`, amichevole Spagna–Portogallo): primo ospite z 18,3 → 5,5 → −3,7 → −12,7 → −20 → −27,2 fra 20,8 e 23,4 s; primo di casa −33,8 → −28,1 nello stesso tempo. Bambini 11+11 visibili, tutti a 0,72 u. Il difetto è quello del collaudo 165, invariato.

### K5 — PO-241 / PO-232: «Caricamento giocatori…»

15 partite su 15, una sola volta, 7,5–8,1 s (lettura ogni ~0,5 s). Nella A4 è comparso durante l'**ingresso** (8,1 s) invece che prima della prima scena.

### K6 — PO-237: fluidità, prima partita contro seconda

Headless, rendering software: valgono i confronti dentro lo stesso giro, non i valori assoluti.

| Partita | Compiti lunghi, somma | di cui prepartita + ingresso | Più lungo | In gioco fluido | Apertura scene |
|---|---|---|---|---|---|
| B1 amichevole (**prima**) | **47,0 s** | 37,5 s (80%) | 12,5 s | 2,0 s | 4,7 s |
| B2 Lega A | 31,5 s | 20,8 s (66%) | 8,4 s | 2,7 s | 3,7 s |
| C1 Coppa Nazionale (**prima**) | **38,5 s** | 25,7 s (67%) | 10,7 s | 2,3 s | 6,1 s |
| C2 Premier | 31,5 s | 19,8 s (63%) | 8,6 s | 2,4 s | 5,5 s |
| A1 Premier (**prima**) | **52,0 s** | 30,4 s (58%) | 11,4 s | 1,7 s | 8,5 s |
| A2 Premier | 35,6 s | 21,4 s (60%) | 7,7 s | 2,5 s | 7,4 s |
| D1 finale (**prima**) | 34,4 s | 22,3 s (65%) | 8,6 s | 2,2 s | 6,8 s |

- Prima contro seconda: +49% (B), +22% (C), +46% (A). Nel giro D la seconda (D2, uscita al 65') è più corta e non la confronto.
- I fotogrammi oltre 1 s non seguono la stessa regola (le partite dalla panchina ne hanno di più): non li uso per dire «più scattosa».

### K7 — PO-244: «FASE A ELIMINAZIONE»

Foto `b-p1-fine.jpg`: «NAZIONALE · FASE A ELIMINAZIONE · FISCHIO FINALE», amichevole Spagna–Portogallo, «Stag. 13 · G. 9». A7 (Spagna–Olanda, terza gara del **girone**): «COPPA DELLE NAZIONI · FASE A ELIMINAZIONE», «G. 5». Il tabellino della Nazionale torna coi tiri in porta (Spagna 2 in porta e 1 gol → 1 parata del Portogallo; Portogallo 2 in porta e 2 gol → 0 parate della Spagna).

### K8 — PO-222: il «Non convocato» che segna

- Giro A, S13 sett. 2: finestra «Non convocato — Il tecnico ha preferito altri», pulsanti «Simula e avanza la settimana / Non ora»; la sonda simula. Nel salvataggio: `{week:2, opponent:"FC Foxshire", 4-0, goals:1, rating:7.7, simulated:true}`. In home alla settimana 3: «Vittoria 4–0 in casa vs FC Foxshire (simulata) · 1 gol · voto 7,7» e «2 Partite · 1 Gol» (foto `a-settimana-13-3.jpg`).
- Giro B, S13 sett. 11: stesso percorso, `{week:11, FC Parmense, 2-0, goals:1, rating:7.2, simulated:true}`.
- La settimana l'ho fatta simulare io (la sonda), ma «Non convocato» e il risultato della simulazione li decide il gioco. PO-222 è in zona G, ferma: lo riporto come conferma con misura.

### K9 — «Ottavi di F…»

Foto `c-calendario-13-9.jpg`: nel riquadro «Prossime partite» l'etichetta della Coppa Nazionale «Ottavi di Finale» è troncata in «Ottavi di F…» a 412 px. Stessa famiglia di «Nazional…» (PO-247).

## Rilievi nuovi

### N1 — «Filtrante perfetto» su una punizione crossata (bassa)

Finale della Coppa delle Nazioni (replica D2), 27': «📐 Punizione dal limite, 26 metri: tocca a te!», giocata «↗️ Palla in area» (cross da punizione, `freekick_cross_high`). Riquadro: «OCCASIONE CREATA! · ↗️ Palla in area / ⚡ **Filtrante perfetto!** La conclusione è respinta — c'è ancora da giocare!» (foto `d2-p1-traccia-2.jpg`). Il seguito è giusto: catena «Mischia in area» → «Controllo e tiro» → gol di Vairo. È solo il lessico: un cross da punizione non è un filtrante. Visto una volta; la stessa giocata nella prima corsa (D1) ha dato lo stesso esito «OCCASIONE CREATA!», ma lì non ho il testo intero.

### N2 — Pulsante verde nella festa del trofeo (bassa, da decidere)

Foto `d-finestra-2-anon.jpg`: «CAMPIONI! · Spagna · Coppa delle Nazioni · Stagione 13», pulsante verde «🎉 Festeggia». È una festa e può essere voluto; lo segnalo perché PO-235 ha chiamato «fuori standard» un altro pulsante verde («Gioca la Partita» della convocazione).

### N3 — Una scheda del mister senza scelta (da verificare)

Replica della finale (D2): il motore registra due schede (`__CPM_INT226.schede`: 55' «eroe_stanco», 63' «avanti_2») ma una sola scelta (63'). La sonda guarda le finestre a ogni giro (circa ogni secondo, cioè un minuto di gioco a 2×) e ha visto la scheda del mister **solo al 62'**. Nella prima corsa della stessa partita (D1) la scheda del 55' è stata mostrata e scelta. **Non riprodotto**: 1 su 31 schede. Se fosse vero, sarebbe un caso di PO-246 (scelta che non arriva al motore).

## Correzioni dei miei strumenti (falsi allarmi, dichiarati)

- **Classifica «V+N+P ≠ giocate» in 18 squadre su 18**: la sonda cercava i campi `w/d/l`, il gioco usa `wins/draws/losses`. Rifatto il conto sui quattro salvataggi di fine giro: tutto coerente.
- **«Tre partite contro FC Nottingham»** nel giro A: erano le tre gare di girone della Coppa delle Nazioni; la sonda legge la partita della settimana di campionato.
- **«Pallone in rete ma riquadro “Occasione creata”»** nella finale: la sonda aveva fuso due scene di una **catena**; la traccia del testo (D2) mostra che il gol è della scena successiva.
- **Tabellone invertito nel secondo tempo**: dal 45' la barra in alto si specchia di proposito (`src/15-live-match.jsx:10025`, `_swap893`: nomi **e** numeri girano insieme con `flex-direction: row-reverse`). Il testo letto dal DOM resta nell'ordine originale, quindi chi legge `innerText` vede il punteggio rovesciato mentre a schermo è coerente. Trappola da ricordare per le prossime sonde.
- **Pallone all'apertura** (codice 001): la sonda legge chi ha il pallone in `hl_intro`, sotto il cartello iniziale e prima che la scena sia allestita (in 18 scene su 81 il più vicino è a più di 5 u). Con questa lettura **non posso giudicarlo**.

## Cosa non ho potuto verificare

- **Il telefono.** Fluidità, «Caricamento giocatori…», l'ingresso visto dal giocatore e i tempi delle scene vanno confermati sul dispositivo (in headless con GLB le scene girano a 1–25 fps).
- **Il portiere sui tiri al palo** (correzione del giro 12): nessun palo nelle partite vere.
- **Il pallone all'apertura delle scene** (vedi sopra).
- **La schermata «Convocazione Nazionale» (PO-235)**: in questi giri non l'ho fotografata.
- **La replica della finale non è identica alla prima corsa** (D1 2-0, D2 4-0): il pilota delle scelte gira a tempo e le schede del mister le chiude la sonda, quindi due corse della stessa partita non sono la stessa partita. Non lo considero un difetto del gioco.

## File

- Sonde: `tests/visual/collaudo-166-partite.mjs` (dalla 165, con chip, frasi del riquadro, fotogrammi del portiere e `CPM_TRACCIA`), `tests/visual/collaudo-166-gk-lato.mjs` (verso del portiere, funzione di `gk-miss-229.mjs`), `tests/visual/lib/collaudo166.mjs` (= libreria 165), `tests/visual/collaudo-166-ingresso.mjs`, `collaudo-166-calendario.mjs`, `collaudo-166-ripartenza-tick.mjs` (dalla 165, non rieseguite tranne l'ingresso).
- Uso tipico (da `tests/visual`, con `CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`):
  `CPM_TAG=a CPM_NPARTITE=7 CPM_BENCH_AT=3 CPM_NAT_AT=5 CPM_RIFIUTA=1 node collaudo-166-partite.mjs` ·
  `CPM_TAG=b CPM_NPARTITE=3 CPM_BENCH_AT=3 CPM_NAT_AT=99 CPM_SAVE=../../docs/collaudi/release-166/dati/partenza-b-amichevole.json node collaudo-166-partite.mjs` ·
  `CPM_TRACCIA=1 CPM_TAG=d2 CPM_NPARTITE=1 CPM_SAVE=../../docs/collaudi/release-166/dati/partenza-d-finale.json node collaudo-166-partite.mjs` ·
  `node collaudo-166-gk-lato.mjs a b c d d2`
- Dati in `docs/collaudi/release-166/dati/<giro>/` (`partite.jsonl`, `settimane.jsonl`, `finestre.jsonl`, `interviste.jsonl`, `gk229.jsonl`, `non-convocato.jsonl`, `traccia.jsonl` per D2, salvataggi di fine giro) e `dati/ingresso-fitto.json`; foto in `docs/collaudi/release-166/` (prefisso = giro).
