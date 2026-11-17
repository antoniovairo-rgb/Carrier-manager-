# Giro 238 — PO-496 «Collegarli nella 197» e PO-501 «Richiamo sì, corsa no» (versione 7.999.197)

Ramo `sviluppo/giro238-patto-rinnovo`, partito da `lavoro/197` (12d8f0d = 7.999.196 pubblicata). `GAME_VERSION` non toccata.
Rosso del giro: `window.__CPM_NO_G238` (spegne entrambe le correzioni). Guardiani nuovi: `patto-238`, `rinnovo-238`
(nelle catene `completa` e `carriera` di `ci-runner.mjs`, una volta ciascuno, e nella mappa mirata di src/14, 15, 17 e 18).
Strumento di misura (non guardiano): `tests/visual/sonda-piazzati-238.mjs`.

---

## PO-501 — dopo un rifiuto il richiamo arriva, la corsa non si ferma

### Misura prima

Guardiano `rinnovo-238` sul gioco della 7.999.196 (= il suo braccio rosso): professionista FC Salento, contratto all'ultimo anno,
rinnovo **rifiutato** in questa stagione (`rinnRif165b`), dalla sett. 15 a fine stagione col solo tasto «Vai al prossimo momento».

| | corse | fermate «rinnovo» | richiami nel salvataggio | finestra vista |
|---|---|---|---|---|
| 7.999.196 (prima) | 22 | **1, alla sett. 33** | n = 2 | sett. 19 e 33 |

Causa (src/18): l'effetto del richiamo del presidente (giro 198) apriva la finestra anche con la corsa in volo, e la corsa ha la
regola «la finestra del richiamo ferma la corsa» con motivo `rinnovo` (r. ~1700). Il rifiuto (regola del 165b) spegneva solo la
fermata della card del rinnovo, non quella della finestra. Nella misura il primo richiamo (sett. 19) non fermava solo perché la
corsa in quel momento era già ferma per altro; nel braccio rosso finale del guardiano si ferma due volte (sett. 19 e 33).

### Correzione (src/18-career-app.jsx)

- Se il rinnovo è già stato rifiutato in questa stagione e la corsa è in volo, il richiamo **arriva subito** (salvataggio
  `richiamo198.n`, riga di registro «Il presidente ti richiama») ma la finestra **aspetta la fine della corsa** (`rich238Ref`,
  aperta da un effetto quando la corsa si ferma per un altro motivo), invece di fermarla col motivo «rinnovo».
- Senza rifiuto non cambia nulla: il richiamo apre la finestra e ferma la corsa come dal giro 198.
- La finestra rimandata non si apre se nel frattempo il contratto è stato firmato, è scaduto o è cambiata stagione.

### Guardiano `rinnovo-238` — verde e rosso

| Braccio | corse | fermate «rinnovo» | richiami (salvataggio, registro) | finestra vista | stagione |
|---|---|---|---|---|---|
| verde | 19 | **0** | n = 2, 2 righe | sett. 20 e 34 (a corsa finita) | W39 |
| rosso `__CPM_NO_G238` | 17 | **2** (sett. 19, 33) | n = 2, 2 righe | sett. 19 e 33 | W39 |

Stabilità: dopo le correzioni del banco, 4 esecuzioni di fila del braccio verde su 4 arrivano a W39 con 0 fermate «rinnovo».

Due correzioni del **banco** (non del gioco) prima di arrivarci, scritte nel guardiano:
1. il banco chiudeva l'offerta di mercato (`dismiss`) e nello stesso istante toccava il primo pulsante del velo, che era
   «controproposta»: il suo aggiornamento trovava l'offerta già nulla e **CareerApp andava in crash** («Qualcosa è andato storto»,
   `TypeError: Cannot read properties of null (reading 'club')`, src/18 r. ~7572). Catturato leggendo il registro errori del gioco
   (`cpm-errlog`), che ora il guardiano legge sempre: un crash è rosso. Ora prima chiude, aspetta, poi tocca il velo rimasto.
2. la finestra «Il mister ti cerca» copre il tasto (che resta acceso, motivo nullo): il banco ora risponde con la prima scelta.

---

## PO-496 — i premi del patto col mister si usano

### Misura prima (sonda-piazzati-238: motore vero, partita vissuta `brainLive`, scene dei piazzati chieste come nel live)

**Il motore dava già all'eroe, senza nessun premio, ogni rigore e le punizioni tirabili dal limite**: l'eroe nel motore ha sempre
il ruolo «AT» più un bonus di 6, quindi vince sempre la scelta del rigorista (4 rigori su 4 in 30 partite, tutti offerti alla
scena); le punizioni tirabili sono sue dalla scelta PO del 7.999.27 («rigore sempre, punizione se da tiro»). Gli angoli no (0 su 103)
e le altre punizioni le batte il compagno più vicino. Quindi «il rigorista sei tu» era vero per tutti, e «i piazzati li batti tu»
era vero solo per quelle dal limite.

### Regola di durata (dichiarata, vedi dubbi)

Un premio vale **nel club in cui è stato promesso** (`premiPatto227[id] = id del club`, giro 227) e **si perde cambiando club**:
un effetto in CareerApp toglie dal salvataggio le voci di un altro club (riga di registro «Nuovo club: i premi del patto col mister
restano dove te li eri guadagnati»), quindi tornando nello stesso club non si riaccendono. La maglia vale anche solo per la stagione
in cui è stata data (giro 227). La fascia da vice tace se il giocatore diventa capitano. In Nazionale e nel provino i premi di club
non valgono. Una sola lettura: `premio238(p,id)` (src/18).

### Collegamenti

| Premio | Dove si vede | Effetto |
|---|---|---|
| rigorista | partita (src/14 `fermoSet`) | l'eroe è il battitore designato dei rigori con priorità esplicita (+100) qualunque sia il resto della squadra. **Oggi non cambia nulla in partita** (lo era già), lo rende una regola; vedi dubbio 1 |
| piazzati | partita (src/14 `fermoSet`) | l'eroe è il battitore designato delle **punizioni della sua squadra dalla trequarti avversaria** (avanzamento ≥ 70: limite e punizioni laterali vicino all'area). Gli angoli no: vedi sotto |
| vice-capitano | profilo (card «La parola del mister · club») + biografia («vice-capitano del …») | solo vista; nessun compagno perde ruoli |
| voce nello spogliatoio | settimana (`weeklyStaffRel`, il chokepoint dei tre percorsi della settimana) + card del profilo | finché la chimica di squadra è sotto 75 la alza di 1 a settimana; sopra resta la sola media del 7.8.22 |
| maglia | già collegata nel giro 227 (`ruoloPromesso94`) | invariato |

Il live (src/15) passa i premi al motore (`cfg.eroe.premi`, da `premiMotore238`), solo nelle partite di club.

**PO-065, numero di piazzati invariato — misurato, ed è ciò che ha deciso la soglia.** Si cambia solo chi batte: `fermoSet` nasce
dove nasceva e non consuma sorteggi in più. Ma spostare l'eroe sul pallone cambia la partita:

| L'eroe con «piazzati» batte… | angoli della squadra | partite |
|---|---|---|
| angoli e tutte le punizioni | 103 → **57** (−45%) | 30 |
| punizioni dalla metà campo avversaria (≥ 50) | 393 → **306** (−22%) | 120 |
| punizioni dalla trequarti (≥ 66) | 393 → 348 (−11%) | 120 |
| **punizioni dalla trequarti (≥ 70) — scelta** | 393 → **387** (−1,5%) | 120 |

Con l'eroe lontano dall'area la squadra crea meno angoli. Con la soglia 70 angoli e piazzati restano quelli (piazzati 1831 → 1891,
+3%). Per questo gli angoli **non** vanno all'eroe e il testo del premio dato è cambiato da «Punizioni e angoli adesso li batti tu»
a «Le punizioni vicino all'area adesso le batti tu» (la frase della promessa del mister, «i piazzati da qui in avanti li batti tu»,
è rimasta).

### Guardiano `patto-238` — verde e rosso

| Parte | Verde | Rosso `__CPM_NO_G238` |
|---|---|---|
| A · motore, punizioni dalla trequarti con l'eroe designato (motore senza scene, 120 partite) | **594/618** (senza premi 103/541) | 103/541 |
| A · partita vissuta, stesse punizioni | 386/514 (le tirabili senza scena le batte un compagno, giro 154) | — |
| A · rigori dell'eroe (occasione di scena) | 13/13 | (uguale: vedi dubbio 1) |
| A · angoli / piazzati con e senza premi | 393 → 387 · 1831 → 1891 (entro il 15%) | — |
| B · partita vera (salvataggio 190) | il motore riceve `{rig,piaz}`; punizioni dalla trequarti non tirabili dell'eroe **5/5** (prova finale 3/3) | premi `null`; **0/1** |
| C · profilo | card con vice, voce, rigori, piazzati; biografia «vice-capitano del» | niente card, biografia senza |
| C · voce | chimica della settimana 60 → **61** | 60 → 60 |
| C · durata | club `{rig,piaz}`, Nazionale `null`, altro club `null`, vice da capitano falso; cambiando club `{}` | voci rimaste |

Nella parte B il rosso ha **un solo campione** (una sola punizione non tirabile dalla trequarti in quella partita): giudicato, ma
sottile. Il rosso della parte A (541 punizioni) è quello che pesa.

---

## Controlli (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** dopo ogni modifica a src/.
`node --check tests/visual/ci-runner.mjs` ok; `patto-238` e `rinnovo-238` una volta in `completa`, una in `carriera`.

| Controllo | Esito | Numeri |
|---|---|---|
| `rinnovo-238` (nuovo) | ✅ verde · rosso `__CPM_NO_G238` bocciato | verde 0 fermate «rinnovo», richiami n=2; rosso fermate sett. 19 e 33 |
| `patto-238` (nuovo) | ✅ verde · rosso `__CPM_NO_G238` bocciato | vedi tabella sopra; parte B questa volta 3/3 (prova precedente 5/5), rosso 0/1 |
| `test:logic` | ✅ | 51 pass · 0 fail |
| `save-compat` | ✅ | 12 pass · 0 fail |
| `tripath-chokepoint` (statico) | ✅ | i tre percorsi della settimana delegano a ogni chokepoint |
| `patto-227` | ✅ verde · rosso `__CPM_NO_G227` bocciato | |
| `momento-165` | ✅ | 33 verdi, 0 rossi |
| `momento-165b` | ✅ | 22 verdi, 0 rossi |
| `momento-173` | ✅ | 20 verdi, 0 rossi |
| `svincolato-198` | ✅ verde · rossi bocciati | A due richiami · B schermata dello svincolato |
| `agente-198` | ✅ verde · rossi bocciati | |
| `rigore-191` | ✅ verde · rosso `__CPM_NO_G191A` bocciato | |
| `piazzato-204` | ✅ verde · rosso bocciato | |
| `gol-eroe-154` | ❌ 1ª prova · RIPROVA | 1ª prova: VERDE 9/10 partite valide, 0 gol e 0 assist dell'eroe in gioco fluido, 9 gol in scena; ROSSO `__CPM_NO_G154` 9/10 valide ma 0 gol fluidi → «il guardiano guarda a vuoto»; k6 non valida (cerimonia) in entrambi i bracci |

Su `gol-eroe-154`: nelle sue partite i premi sono spenti (i salvataggi di prova non hanno `premiPatto227`) e il motore senza premi
si comporta come prima — la sonda dei piazzati lanciata **prima** di toccare src/14 e quella dopo danno gli stessi conteggi sui semi
1-30 (4 rigori, 339 punizioni, 103 angoli). Il rosso che non si vede è il braccio `__CPM_NO_G154`, che ha bisogno di un gol dell'eroe
in gioco fluido: lo stesso guardiano era rosso nella catena completa della 7.999.190 (`STABILITA.json`, 3 prove) e verde nella 191.
Lo segnalo come guardiano instabile (vedi dubbi), non l'ho riparato: fuori dall'ambito del giro.

Foto rigenerate da `svincolato-198`/`agente-198` in `docs/sviluppo/giro198/` rimesse con `git checkout --` e non committate.

**Mappa mirata non eseguita per intero.** Per i file toccati (src/14, 15, 17, 18) la mappa di `ci-runner.mjs` dà **164 passi**,
fra cui highlight-95, ingresso-206, carriera3-94, validate-situations: oltre il tempo di un giro e in parte vietati dalle regole
fisse. Ho eseguito l'elenco della consegna più `gol-eroe-154` (giudica il ripiego del giro 154 su cui poggia il premio dei piazzati)
e il guardiano statico tri-path (`weeklyStaffRel` è un chokepoint). Il resto resta alla verifica di rilascio.

Nota di metodo: una volta ho lanciato `node ci-runner.mjs mirata lavoro/197` pensando che elencasse i passi: li esegue. L'ho fermato
dopo pochi secondi (nessun file cambiato, `STABILITA.json` intatto) e ho calcolato la mappa leggendo il file.

---

## Dubbi per il PO

1. **Il rigorista era già l'eroe per tutti.** Nel motore l'eroe ha sempre il ruolo «AT» + 6 e vince sempre la scelta del battitore
   del rigore (anche se è un difensore): il premio «il rigorista sei tu» oggi non cambia nulla in partita, l'ho reso solo una regola
   esplicita. Perché il premio pesi, senza premio il rigorista dovrebbe essere un compagno — ma vorrebbe dire meno rigori negli
   highlight (PO-065, «tornano i rigori», e la scelta 7.999.27 «rigore sempre»). Non l'ho deciso io. Stessa cosa, in misura minore,
   per le punizioni tirabili dal limite, che sono già dell'eroe.
2. **Gli angoli non vanno all'eroe col premio «piazzati».** Misurato: con l'eroe battitore degli angoli la squadra ne crea il 45% in
   meno (l'eroe esce dall'area), contro PO-065. Il premio dà le punizioni dalla trequarti avversaria; il testo del premio dato è
   cambiato di conseguenza. Se il PO vuole anche gli angoli, va accettato il calo o compensato altrove.
3. **Durata scelta da me**: vale nel club in cui è promesso, si perde cambiando club (anche col prestito: il club del prestito è un
   altro club, e al ritorno il premio non c'è più), non scade a fine stagione (salvo la maglia, già così dal 227). Da confermare.
4. **Vice-capitano**: si vede nel profilo (card e biografia). La Rosa non segna né il capitano né il vice, quindi non l'ho aggiunto
   lì; il compagno con archetipo «capitano» resta capitano. Se diventi capitano il vice sparisce; se poi perdi la fascia, il vice
   torna (il dato resta nel club).
5. **Voce nello spogliatoio = +1 di chimica a settimana sotto 75**: scelta mia fra le grandezze esistenti (chimica e morale). Non
   tocca il morale né il discorso pre-partita (oggi solo del capitano). Il numero è piccolo apposta: la chimica ha già la sua media.
6. **Richiamo rimandato**: dopo un rifiuto la finestra del presidente arriva alla prima fermata della corsa (nel guardiano una
   settimana dopo il richiamo, es. sett. 34 invece di 33). Il richiamo è già nel salvataggio e nel registro alla settimana giusta.
7. **Fragilità trovata dal banco, non corretta (fuori ambito)**: in src/18 r. ~7572 il pulsante «controproposta» dell'offerta di
   mercato aggiorna l'offerta senza controllare che sia ancora aperta; se l'offerta si chiude nello stesso istante, CareerApp va in
   crash. Un giocatore vero difficilmente ci arriva (due tocchi nello stesso fotogramma), ma è una riga da rendere sicura.
8. **«Il mister ti cerca» non spegne il tasto del momento**: la finestra copre il tasto, che resta acceso con motivo nullo (non è
   nell'elenco di `_saltaMotivo163`). Il giocatore la vede e risponde; lo segnalo perché il motivo dice «nulla» mentre il tasto non
   si può toccare.
9. **Mappa mirata da 164 passi** per i quattro file toccati: non eseguita per intero (vedi sopra).
10. **`gol-eroe-154` instabile sul braccio rosso**: il verde è pulito, ma il rosso (`__CPM_NO_G154`) vede un difetto solo se
    l'eroe segna in gioco fluido, cosa che dal giro 13 (l'eroe tira solo nelle sue scene) succede di rado. Era già rosso nella
    completa della 7.999.190. Va riparato (regola «instabile due volte si ripara»), in un giro suo.
