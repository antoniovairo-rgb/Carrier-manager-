# Rapporto giro 100 — parata del tiro del compagno, fine scena di gi16

Ramo `sviluppo/giro100-parata` (da `lavoro/178`, c0074b74: 7.999.178 con i giri 90-99 uniti). `GAME_VERSION` e `docs/governo/*`
non toccati.

## 1. highlight-95 D3 — «il portiere dice no» col pallone che non arriva al portiere
- **Sonda** `tests/visual/parata-100.mjs`: partite vere dal salvataggio S5 del collaudo 177, pilota «re» sui passaggi, pagina nuova per
  partita, due regimi («gioco» = `__CPM_PRESENT=1` + `__CPM_REALWAIT`, come il giocatore; «prova» = solo `__CPM_REALWAIT`, come
  highlight-95). Un registratore nella pagina (requestAnimationFrame) annota per ogni fotogramma di `hl_result` la distanza
  portiere-pallone (`__CPM_GKB95`), il post-arco (`__CPM_ARC.pa`), l'esito rivelato e l'indice del testimone `__CPM_RES218`.
- **Misura prima** (highlight-95 ridotto, s5 semi 7 e 2021, e la sonda): riprodotto **SEIFERT** (s5/7, «Servi SEIFERT libero»,
  «Assist da gol — il portiere dice no a SEIFERT»), minimo portiere-pallone **22,7** (highlight-95) e **19,8** (sonda, regime prova).
  Nel regime gioco la stessa scena era sana (1,4).
- **Causa** (traccia dei post-archi): nel regime prova il compagno riceve lontano dalla porta (x mondo < 22), quindi
  `assist_recv → cross_goal`. In src/12 il ramo `cross_goal` con esito «occasione» rimbalzava **subito** (`deflect`) dal punto in cui
  stava il pallone, a 20-30 dal portiere, senza consegna, senza incornata e senza tuffo. Il riquadro però diceva parata. Nel regime gioco
  il ricevente del cast è già portato davanti all'eroe (giro 99 RIC), quindi si passa per `assist_shot`, che dal giro 95 va sul portiere.
  ROTH (s5/2021) gira su `assist_shot` e nelle corse di questo giro è sempre entro 2,8-3,6: il 3,2-3,6 visto nel giro 98 era sotto la
  soglia 6, e il caso «Palla in area» non si è ripresentato.
- **Correzione** (src/12): su «occasione» il ramo `cross_goal` gioca consegna in area e incornata del terzo uomo come sul gol. Al
  colpo di testa, invece di `in_net`, passa ad `assist_shot`, che porta il pallone sul portiere, fa tuffo e respinta dalle sue mani, e
  gestisce fuori/palo/murato come ha deciso il motore. Il volo dopo la testata parte dalla quota della testa (`_y100`), non da terra.
  Rosso `__CPM_NO_G100D3` = comportamento precedente.
- **Misura dopo** (parata-100, PAR 2): **verde 4/4 parate col pallone al portiere** (SEIFERT gioco 1,4 · SEIFERT prova **1,6**, ora
  `assist_recv>cross_goal>assist_shot>deflect` · ROTH 2,8 e 3,5); **rosso** SEIFERT prova **22,4** (`cross_goal>deflect`).
- **Guardiano** `parata-100` (verde + rosso nello stesso giro; esce ≠0 se il verde ha meno di 3 parate del compagno, se non ha
  guardato il ramo `cross_goal`, o se il rosso non si vede). In `ci-runner.mjs`: catene carriera e completa, MAPPA `src/12-|13-` e
  `src/15-`, tra i LENTI; in `package.json`. Durata ~14 min.
  ⚠️ Con tre pagine in parallelo la riserva dell'esito scatta per la guardia di parete (30 s): le parate diventano non giudicabili
  (4 su 6 nella prima corsa). Si usano due pagine.

## 2. scena3d-96 — tel gi16 «eroe figurina a fine scena» 0,059
- **Misura** (registro dei fotogrammi `CPM_G96_DUMP`): gi16 è un cross. Dopo il cross la camera lascia l'eroe e segue il pallone in
  area (camera x 32 → 12), e l'altezza apparente dell'eroe scende da 0,18 a **0,07**. Lì resta costante fino alla chiusura vera
  (misurato fino a 14 s di scena: 0,07, poi 0,09). La sonda chiudeva a **5,0 s di scena**, cioè **sulla rampa**, e la durata della
  rampa cambia coi fotogrammi headless: camera sull'eroe per 1,2 s di scena in una corsa e 1,8 s in un'altra, a parità di scena.
  Stessa scena: 0,081 · 0,081 · 0,101 · 0,081 (pagina nuova) · 0,066 · 0,087 (dopo gi3/gi13/gi63, la posizione della lista intera) ·
  0,059 nel giro 99.
- **Verdetto: variabilità dello strumento**, non difetto di regia. A camera assestata l'eroe sta sopra la soglia (0,07 > 0,06).
  Gioco non toccato.
- **Correzione dello strumento**: la scena si osserva fino a **7,0 s di scena** (`CPM_G96_DS`, prima 5,0 fisso), quindi la
  «fine scena» cade a camera assestata. Soglia 0,06 invariata.
- ⚠️ Da sapere: 0,07 è vicino alla soglia. Nel gioco vero la scena può chiudersi durante la rampa (finestra d'esito), e lì l'eroe sta
  fra 0,18 e 0,07: sopra la soglia, ma piccolo. Il giudizio sulla regia del finale dei cross resta al telefono del PO.

## 3. Guardiani (uno alla volta, build del giro 100, tutti sullo stesso build)
| Guardiano | Esito | Durata | Note |
|---|---|---|---|
| parata-100 (nuovo) | ✅ verde + rosso | ~14 min | verde 4/4 parate al portiere (1 sul ramo cross_goal), rosso SEIFERT 22,4 |
| scena3d-96 corsa 1 | ✅ verde | 1509 s | tel gi16 0,072 |
| scena3d-96 corsa 2 | ✅ verde | 1507 s | tel gi16 0,082 |
| scena3d-96 corsa 3 | ✅ verde | 1511 s | tel gi16 0,072 |
| chiusura-99 (D9 + RIC, verde e rosso) | ❌ **1 rosso, strumento** | 1348 s | RIC verde 6/6 (100%), rosso 2/6; D9 rosso si vede (mediana 1,32). **D9 verde**: gi52 col verde forzato, min 2,7 (quadro), mediana 5,83. Rigiocato il solo D9 verde: ✅ 6/6, mediana 4,96, min 3,05 (160 s). Vedi punti aperti n.1 |
| highlight-95 (verde e rosso) | ✅ verde + rosso | 3943 s | verde 118 highlight, **0 difetti**, 9 parate giudicate (8 non giudicabili per la guardia di parete, sotto il 30%); rosso: tutti e quattro i D si vedono. Nessun tetto da alzare: `ci-runner.mjs` non ne ha, il «tetto» del giro 99 era il limite della chiamata della sessione |
| assist-nome-98 (verde e rosso) | ✅ verde + rosso | 3102 s | verde: nome coerente 100% su 11, 3D ricevente = cast 7/11 (regime di prova); rosso 25% |
| assist-298 | ✅ verde + rosso | 1873 s | |
| esiti-96 | ✅ PASS | 742 s | D1, D2, D3, B15, D6, D7, D12, D15, D14 verdi e rossi |
| validate-situations (gate, src/12 toccato) | ✅ PASS | 656 s | fingerprint 00001505, 0 failure |

## Punti aperti
1. **chiusura-99 D9 verde instabile (strumento, da riparare prima della catena se si ripresenta)**. Nelle tre corse viste i valori
   bassi compaiono solo quando la maschera delle lettere è grande: 3.564-3.927 px contro 2.200-2.700. Allora il contrasto locale scende a
   ~10 (contro ~21) e il «quadro» a 2,7-3,3 (contro 4,8-6,9). La maschera (pixel dove A e B differiscono) a volte prende anche contorno
   e alone, che sul campo chiaro alzano il fondo. Il gioco non è toccato: il D9 è DOM di src/15 e questo giro non lo modifica.
   Soglia non toccata. Decisione prudente: non correggo lo strumento in questo giro (visto rosso una volta sola, regola «due volte si
   ripara») e lo segnalo. Se la catena della 178 lo rivede rosso, la riparazione è legare la maschera alle sole lettere (pixel di
   riempimento di A contro B a colore pieno) e non al contorno.
2. **parata-100 vede il ramo cross_goal solo nel regime di prova** (seme 7, SEIFERT). Nel regime del giocatore il ricevente è già
   portato davanti all'eroe (giro 99) e il ramo si percorre di rado: la correzione vale comunque, perché è nel 3D e non nel regime.
3. **Fine scena dei cross**: a camera assestata l'eroe sta a 0,07-0,08 al telefono, sopra la soglia di 0,06 ma vicino. Il giudizio
   sulla regia (camera che segue il pallone in area) resta al telefono del PO.
4. «Palla in area» (s5/7, 6,8 nel giro 98) non si è ripresentato in nessuna corsa di questo giro, né in highlight-95 (0 difetti) né
   in parata-100: non posso confermare se fosse lo stesso ramo `cross_goal`.
