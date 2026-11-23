# Giro 348 — i sette rossi nuovi del treno 45186665202 (7.999.207)

Base: `lavoro/201` punta **8e76ba0f** (treno con 13 vagoni: 331 · 333 · 335 · 336 · 337 · 338 · 344 sulla base fd2b9334, poi 334
ellisse d'attesa · 339 formazioni · 340 albo · 341 fisarmonica/consigliato · 343 difensori e punizioni · 342 colpi di testa).
Confronto: **fd2b9334** (prima dei sei vagoni nuovi) e, per ellisse-334 che lì non esiste, **b4f27b9** (unione del giro 334, prima di
339-343). Banco: sessione cloud, `CPM_CHROME=/opt/pw-browsers/chromium`, ogni guardiano con `npm run`. Il vagone responsabile è
stato isolato coi rossi `__CPM_NO_G3xx` dei giri. Ramo di consegna: `sviluppo/giro348-rossi-207`.

**Esito in una riga:** nessuna regressione del gioco. Quattro guardiani misuravano qualcosa che i giri 336/342/343 hanno cambiato per
decisione del PO, oppure con uno strumento che quel cambio ha reso cieco: sono stati aggiornati senza toccare una soglia. Tre sono
verdi sul banco su entrambi i commit e vanno in `solo_runner`. **Nessuna riga di `src/` cambiata, quindi nessun rosso
`__CPM_NO_G348`:** non c'è una correzione del gioco da spegnere. `GAME_VERSION` non è stato toccato.

| guardiano | punta 8e76ba0f | fd2b9334 | vagone responsabile | causa | correzione |
|---|---|---|---|---|---|
| classifica-259 | **rosso** (rassegna «4°», testata e scheda «3°») | verde | **343** (cambia la partita) su una regola del **336** | PO-609 (giro 336): la rassegna di fine partita mostra la classifica **dopo** la giornata. Il guardiano la confrontava con la classifica di prova **prima** della giornata (3°). Su fd2b9334 era verde per caso: la partita del seme 7300 lasciava l'eroe 3°. Dal 343 la stessa partita finisce diversamente e lo lascia 4° | le due righe della rassegna si confrontano con la classifica **salvata** tornando alla carriera (giornata 11 inclusa), ordinata dal guardiano con la regola dichiarata (punti · differenza · gol fatti · ordine salvato), senza usare la funzione del gioco. Testata e scheda restano contro il 3° (il caso di spareggio). Uguaglianza esatta, non giudicato = rosso. **Verde, rosso `__CPM_NO_G259` ancora visto** (scheda 4 contro testata 3) |
| rifiniture-200 | **rosso** (P2, P3: «riga non trovata», schermata `seasonEnd`) | verde | **343** (con `__CPM_NO_G343` P2/P3 tornano verdi; con `__CPM_NO_G340`, `_G341` o `_G342` restano rossi) | il salvataggio di prova non porta la classifica: la ricostruisce il gioco col motore rapido. Dal 343 (PO-611, punizione fuori area, src/14) la stessa stagione esce diversa: il club è **1°** (era 4°) e il fine stagione si apre con la parata «CAMPIONI!» prima del bilancio. Il guardiano non la superava | il bilancio si raggiunge come lo raggiunge il giocatore: «Continua» finché il bilancio non è a schermo (al massimo 8 volte). **Verde 10/10, rosso `__CPM_NO_G200` 10/10 bocciato** |
| testa-146 | **rosso** (braccio rosso: 3 scene su 3 «null») | verde | **342** (con `__CPM_NO_G342` nel braccio rosso: gi6 4,19 · gi7 3,66 · gi55 3,14 u) | PO-629, correzione 5 del 342: «la clip di testa finita non si ri-arma nella stessa scena». Nel braccio rosso (pallone lontano, 76 e 146 spenti) la clip si chiude prima che l'arco parta e non si rimonta; il testimone `__CPM_P1B2` scrive solo con un gesto montato → nessuna riga del lancio = non giudicato. I tre bracci verdi (146 acceso) non cambiano | il braccio rosso spegne anche il 342: il rosso è «il gioco di prima del 146 e del 342». Bracci verdi col 342 acceso, soglie (≤ 1,0 · ≥ 2,5) invariate. **Verde (0,15-0,81 u), rosso visto (3,15-4,19 u)** |
| passaggi-228 | **rosso** (xG verde/rosso +3,9 % contro ±3 %) | verde (+2,1 %) | **343** (con `__CPM_NO_G343` in entrambi i bracci: +2,1 %) | il 343 cambia la partita dopo ogni punizione che cadeva in area, quindi cambia **quale** campione si estrae. Misurato a N=2000 su tre semi: col 343 +3,9 · +1,8 · +1,0 %, senza +2,1 · +0,9 · +1,8 % — nessuno spostamento sistematico, ma l'xG oscilla di ±1,5 punti attorno al +2 % e il tetto del ±3 % (che, a differenza del controllo sui gol, non ha margine statistico) cade dentro l'oscillazione | N di default 2000 → **6000** (stessi semi: le prime 2000 partite sono le stesse). A N=6000: **+2,0 % col 343, +1,8 % senza**, tutti i controlli verdi. Soglie invariate. Durata del passo ×3 (aggiornata in `DURATE-GUARDIANI.json`: 320 s) |
| gk-miss-229 | verde | verde | — | sul banco la scena che il runner boccia (gi88 volée «wide», pallone a 4,99 u dal portiere) arriva sul portiere 0,13-0,16 s dopo il calcio, sotto il tempo di reazione del guardiano (0,20 s), e non si giudica, su entrambi i commit. Sul runner il tempo è stato sopra 0,20 ed è stata giudicata. **Non posso confermare** se c'entri un vagone: sul banco la scena non si giudica in nessuno dei due | riga `solo_runner` in ROSSI-DICHIARATI |
| difesa-220-giro31 | verde ((B) forti 8 %, 12 scene) | verde | — | il runner ha misurato (B) forti 33 % contro il tetto 15. Sul banco, sui due commit, verde; il rosso del guardiano viola 7 soglie come deve. Causa della differenza col runner **non misurata** | riga `solo_runner` |
| ellisse-334 | verde (da sola: 0 % di 8552 campioni; rosso 19,9 %) | (non esiste) — su b4f27b9: verde (0 % · rosso 21,5 %) | — | il runner ha visto un corpo fermo oltre il 10 % in gi140. Sul banco carico (un altro guardiano GLB in parallelo: 37-54 fotogrammi a scena invece di ~100) il braccio verde esce con tre scene non giudicate: il guardiano è **sensibile ai fotogrammi**. Da solo, verde sulla punta e sul commit del 334 | riga `solo_runner` |

## Decisioni del PO a cui i guardiani sono stati allineati

- **PO-609 (giro 336)** — «la classifica deve essere già aggiornata, non quella della settimana prima»: la rassegna di fine partita
  usa la classifica dopo la giornata (stessa decisione che il giro 344 ha applicato ad anteprima-230 e forma-239).
- **PO-611 (giro 343)** — la punizione si batte fuori dall'area disegnata: cambia la partita simulata dopo quei falli, quindi le
  stagioni ricostruite e i campioni statistici (non è un difetto; i guardiani che dipendevano da un risultato preciso ne dipendevano
  per caso).
- **PO-629 (giro 342)** — la clip di testa finita non si ri-arma nella stessa scena.

Nessuna soglia abbassata: classifica-259 e rifiniture-200 restano uguaglianze esatte (cambia **contro quale stato** si confronta, o
**come** si raggiunge la schermata), testa-146 ha le stesse soglie e il rosso più completo, passaggi-228 misura con un campione tre
volte più grande.

## Da sapere (fuori ambito)

- I tre `solo_runner` nuovi (gk-miss-229, difesa-220-giro31, ellisse-334) sono instabili alla prima volta. Per la regola del 13/10
  («un guardiano instabile due volte si ripara») se tornano rossi al prossimo treno vanno resi stabili: gk-miss-229 ha una scena sul
  confine del tempo di reazione, ellisse-334 dipende dai fotogrammi al secondo.
- Il braccio «info» di testa-146 (76 e 146 spenti, senza il gancio «lontano») stampa «null»: è solo stampato, non giudicato, e lo era
  già dal giro 174 per un'altra ragione.

## Rigiocata dopo le correzioni

Banco, punta del ramo (8e76ba0f + guardiani del giro 348), `npm run` singoli:
classifica-259 **verde** (rassegna 4 = classifica salvata 4 · testata 3 · scheda 3; rosso: scheda 4) · rifiniture-200 **verde 10/10,
rosso 10/10** · testa-146 **verde, rosso visto** · passaggi-228 a N=6000 **verde** · gk-miss-229 **verde** · difesa-220-giro31
**verde** · ellisse-334 **verde** (da sola).

Catena del giro (`node ci-runner.mjs giro testa-146 difesa-220-giro31 gk-miss-229 passaggi-228 classifica-259 ellisse-334
rifiniture-200 testa-342 difesa-343 career-critical`, + 17 sentinelle, 26 passi): **26/26 verdi** (testa-146 426 s · difesa-220-giro31
1641 s · passaggi-228 182 s a N=6000 · ellisse-334 360 s · gk-miss-229 216 s · classifica-259 155 s · rifiniture-200 167 s ·
testa-342 e difesa-343 verdi · career-critical 348 s · le 17 sentinelle verdi, partita-vera compresa). Esito registrato in
`docs/governo/STABILITA.json`. Prova del rosso di passaggi-228 a N=6000 (`CPM_ROSSO=1`): passaggi +0,0 % → **esce 1, come deve**.
