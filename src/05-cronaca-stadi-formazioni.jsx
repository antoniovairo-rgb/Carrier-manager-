/* ========================================================================
 * KORWARD ELITE — frammento n° 05  (dei 20, numerati da 00 a 19)
 * src/05-cronaca-stadi-formazioni.jsx
 *
 * CRONACA DI SFONDO · OVERLAY · STADI · FORMAZIONI
 *
 * BG_MATCH (originale r.3501), OUTCOME_TX, HL_OVERLAY_POOLS e i pool di tiro sbagliato
 * / palo / traversa, le icone d’overlay, STADIUMS / STADIUM_POOLS / CLUB_STADIUMS /
 * CLUB_STADIUM_STYLE, NATIONS, SAVE_KEY, FORMATION_HOME / FORMATION_AWAY e calcOvr.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 3501-4028   ·   528 righe di 41427
 * La prima riga dopo questa intestazione è la riga 3501 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 3477 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
const BG_MATCH=[
  // Goals (very rare)
  {txt:"⚽ {H} segna! Squadra in vantaggio!",ef:"team_goal",w:0.4,bpos:{x:98,y:50},at:"shot",ms:{shots:1},pd:"attack_goal"},/* [7.120.0 audit] un gol nostro È un tiro nostro *//* [7.525.0 collaudo PO «i gol dove non partecipa l'eroe non sono visibili»] bpos 85→98: il pallone del gol ambientale vola DENTRO lo specchio, non a 15u dalla porta — e' l'origine dei vecchi 003 «goal ma palla lontana». `at:"shot"` esplicito: arco da tiro + reazione GK (canale 439). I gol li forza il microsim, non la pesca pesata: il bpos qui non tocca i pesi di zona 7.486/7.525, ed e' ESENTE dal tetto di spostamento (7.498): il volo fino in rete e' suo di diritto. */
  {txt:"😨 Gol avversario. {A} buca la nostra difesa.",ef:"opp_goal",w:0.4,bpos:{x:2,y:50},at:"shot",ms:{oppShots:1},pd:"opp_goal"},/* [6.86.0] un gol subìto È un tiro avversario *//* [7.525.0] bpos 15→2 e arco da TIRO (prima `pd:"opp_goal"` mappava su 'save': l'arco del gol subito era una parata che atterrava a meta' difesa): la palla entra nella NOSTRA porta, il nostro portiere si tuffa (439, lato x<=30). */
  // Possession
  {txt:"🔵 {H} controlla bene il gioco a centrocampo.",ef:null,w:4,poss:+2,bpos:{x:52,y:50},pd:"midfield"},
  {txt:"🏃 Scambio rapido tra {H} e {H2}. Palla conservata.",ef:null,w:3,poss:+1,bpos:{x:55,y:60},pd:"midfield"},
  {txt:"🔄 {H} cambia gioco sulla fascia opposta.",ef:null,w:3,poss:+1,bpos:{x:60,y:80},pd:"wide_right"},
  {txt:"😤 {A} recupera palla e riparte in contropiede.",ef:null,w:3,poss:-2,bpos:{x:35,y:50},pd:"retreat"},
  {txt:"⚡ Contropiede di {A} sventato in extremis.",ef:null,w:2,poss:-1,bpos:{x:25,y:45},pd:"retreat",momThreshold:[0,50]},
  // Attacks
  {txt:"💥 Tiro da fuori area di {H}, para il portiere.",ef:null,w:3,bpos:{x:78,y:50},ms:{shots:1},pd:"attack"},
  {txt:"🔥 {H} sfiora il vantaggio! Palo!",ef:null,w:2,bpos:{x:90,y:52},ms:{shots:1},pd:"attack_goal",ctx:"drawing"},/* [7.178.0 RC-6] «sfiora il vantaggio» ⇒ solo sul pari */
  {txt:"🎯 Cross di {H} pericoloso, respinto dalla difesa.",ef:null,w:3,bpos:{x:82,y:85},ms:{shots:1},pd:"wide_right"},
  {txt:"⚡ Azione veloce sulla fascia. Corner guadagnato da {H}.",ef:null,w:2.0,bpos:{x:88,y:90},ms:{corners:1},pd:"wide_right",sp:"corner_for"},/* [7.530.0 NO537] `sp` = la riga APRE una giocata piazzata recitata */
  {txt:"💪 Combinazione tra {H} e {H2} in area! Difesa salva.",ef:null,w:2,bpos:{x:85,y:55},ms:{shots:1},pd:"attack_goal"},
  {txt:"🌀 Dribbling netto di {H}! Ottima posizione.",ef:null,w:2,bpos:{x:70,y:65},pd:"attack",momThreshold:[60,100]},
  // Defense
  {txt:"🧤 Grande parata del portiere su {A}!",ef:null,w:2,bpos:{x:8,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🛡️ Tackle in scivolata! {H} recupera palla.",ef:null,w:3,poss:+2,bpos:{x:38,y:48},pd:"midfield",at:"tackle"},
  {txt:"⚠️ Pericolo! {A} entra in area.",ef:null,w:2,bpos:{x:18,y:52},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🚧 Fuorigioco di {A}! Liberazione della difesa.",ef:null,w:3,bpos:{x:22,y:50},pd:"retreat"},
  // Set pieces
  {txt:"🟡 Fallo di {A}. Punizione guadagnata.",ef:null,w:2.0,bpos:{x:60,y:55},ms:{fouls:1},pd:"midfield",sp:"foul_for"},/* [7.532.0] pd attack->midfield: bpos x60 sta sul CONFINE della banda (dec <60 = midfield) e il disaccordo era sistematico (censimento bg-decision) */
  {txt:"🟡 {A} ammonito. Squadra in inferiorità numerica per un possesso.",ef:null,w:2.0,bpos:{x:55,y:50},ms:{fouls:1},pd:"midfield",sp:"foul_for"},
  {txt:"🟡 Fallo al limite dell'area! Punizione interessante per noi.",ef:null,w:1.2,bpos:{x:76,y:52},ms:{fouls:1},pd:"attack",sp:"foul_for"},/* [7.530.0 NO537] il fallo in zona d'attacco esisteva solo a centrocampo: senza, la punizione recitata non aveva mai il tiro in porta */
  {txt:"⚠️ Rigore per noi! Fallo netto su {H} in area!",ef:null,w:0.3,bpos:{x:88,y:50},ms:{fouls:1},pd:"attack_goal",sp:"pen_for"},/* [7.530.0 NO537] rigore AMBIENTALE raro: la recita non segna MAI (i gol sono monopolio del microsim, integrita' del punteggio) — esiti parata/fuori, dichiarato nei libri */
  {txt:"🏳️ Calcio d'angolo per noi. {H} va al traversone.",ef:null,w:2.0,bpos:{x:90,y:95},ms:{corners:1},pd:"attack_goal",at:"cross",sp:"corner_for"},
  {txt:"🏳️ Corner avversario da {A}. Difesa attenta.",ef:null,w:2.0,bpos:{x:8,y:5},ms:{oppShots:1},pd:"defend_goal",sp:"corner_against"},
  /* [7.546.0 — GLI EVENTI FERMI ESISTONO, pezzo 5 della roadmap] CENSITO PRIMA DI TOCCARE (fermi-547.mjs):
     le righe che aprono una giocata piazzata pesavano 11,5 su 381 = 3,0%, cioe' 0,78 a partita — e la
     misura ne ha contate 0,7 su tre partite: modello e strumento concordano. Ma la RECITA FUNZIONA — quando
     una riga `sp` esce, il pallone si ferma 2 volte su 2. Il difetto non e' la messa in scena: e' che le
     righe non escono. Per arrivare a 8 a partita coi soli pesi servirebbe 10,2x su SETTE frasi, e la
     cronaca diventerebbe una filastrocca: la medicina e' quella del 7.532 — ALLARGARE IL REPERTORIO.
     Quattordici voci nuove sui quattro tipi che la recita gia' sa mettere in scena (corner_for,
     corner_against, foul_for, pen_for); la rimessa laterale non ha ancora una recita e arriva dopo. */
  {txt:"\ud83c\udff3\ufe0f Angolo per noi: {H} disegna il traversone sul primo palo, la difesa di {A} libera di testa.",ef:null,w:2.4,bpos:{x:92,y:96},ms:{corners:1},pd:"attack_goal",at:"cross",sp:"corner_for"},
  {txt:"\ud83c\udff3\ufe0f Corner battuto corto fra {H} e {H2}: rientro sul mancino e cross velenoso in mezzo!",ef:null,w:2.2,bpos:{x:90,y:94},ms:{corners:1},pd:"attack_goal",at:"cross",sp:"corner_for"},
  {txt:"\ud83c\udff3\ufe0f {H} va sulla bandierina, tutti in area: pallone sul secondo palo, {H2} non ci arriva per un soffio.",ef:null,w:2.2,bpos:{x:93,y:5},ms:{corners:1},pd:"attack_goal",at:"cross",sp:"corner_for"},
  {txt:"\ud83c\udff3\ufe0f Ancora un angolo: {A} respinge di testa ma la palla resta li', mischia furibonda in area!",ef:null,w:1.8,bpos:{x:91,y:93},ms:{corners:1,shots:1},pd:"attack_goal",sp:"corner_for"},
  {txt:"\ud83c\udff3\ufe0f Terzo corner consecutivo per noi. {A} e' schiacciata sulla linea, si respira aria di gol.",ef:null,w:1.6,bpos:{x:92,y:7},ms:{corners:1},pd:"attack_goal",sp:"corner_for"},
  {txt:"\ud83c\udff3\ufe0f Corner per {A}: tutti in area, il nostro portiere esce coi pugni e allontana.",ef:null,w:2.2,bpos:{x:7,y:95},ms:{oppShots:1},pd:"defend_goal",sp:"corner_against"},
  {txt:"\ud83c\udff3\ufe0f Angolo di {A} sul secondo palo: colpo di testa alto, che sospiro.",ef:null,w:2.0,bpos:{x:6,y:6},ms:{oppShots:1},pd:"defend_goal",sp:"corner_against"},
  {txt:"\ud83c\udff3\ufe0f {A} va corta sul corner e cerca il tiro dal limite: muro della nostra difesa.",ef:null,w:1.8,bpos:{x:9,y:92},ms:{oppShots:1},pd:"defend_goal",sp:"corner_against"},
  {txt:"\ud83d\udfe1 Fallo tattico su {H} lanciato in contropiede: punizione dalla trequarti e ammonizione per {A}.",ef:null,w:2.4,bpos:{x:70,y:52},ms:{fouls:1},pd:"midfield",sp:"foul_for"},
  {txt:"\ud83d\udfe1 Punizione dal vertice dell'area: {H} sistema il pallone, la barriera si compone.",ef:null,w:2.2,bpos:{x:78,y:66},ms:{fouls:1},pd:"attack",sp:"foul_for"},
  {txt:"\ud83d\udfe1 {H} viene steso al limite. Batte lui: sinistro a giro, palla che sfiora l'incrocio!",ef:null,w:1.8,bpos:{x:77,y:48},ms:{fouls:1,shots:1},pd:"attack",sp:"foul_for"},
  {txt:"\ud83d\udfe1 Punizione da posizione defilata: {H} mette in mezzo, la difesa di {A} spazza in angolo.",ef:null,w:2.2,bpos:{x:74,y:88},ms:{fouls:1},pd:"wide_right",sp:"foul_for"},
  {txt:"\ud83d\udfe1 Fallo a centrocampo su {H2}. Si riparte con calma, la squadra ne approfitta per salire.",ef:null,w:2.4,bpos:{x:58,y:44},ms:{fouls:1},pd:"midfield",sp:"foul_for"},
  /* [7.546.0] TRE VOCI IN RIPIEGAMENTO. La prima stesura aveva quattordici voci nuove su attacco,
     centrocampo e la nostra area e NESSUNA su `retreat`: con i pesi alzati, bg-decision e' caduto a 48%
     (soglia 60) con `retreat 0/8` — otto volte la simulazione decide un ripiegamento e nessuna riga sa
     descriverlo. Allargare un repertorio in modo sbilanciato affama le famiglie che non si toccano. */
  {txt:"\ud83d\udfe1 Fallo di {H} per fermare la ripartenza di {A}: punizione per loro a meta' campo, noi ci ricompattiamo.",ef:null,w:2.2,bpos:{x:40,y:50},ms:{fouls:1},pd:"retreat",sp:"foul_for"},
  {txt:"\ud83d\udfe1 Punizione per {A} dalla trequarti difensiva: la barriera si dispone, tutti dietro la linea della palla.",ef:null,w:2.0,bpos:{x:30,y:56},ms:{fouls:1},pd:"retreat",sp:"foul_for"},
  {txt:"\ud83c\udff3\ufe0f Angolo per {A} guadagnato sulla nostra destra: dieci uomini in area, si stringono i denti.",ef:null,w:1.8,bpos:{x:12,y:88},ms:{oppShots:1},pd:"retreat",sp:"corner_against"},
  {txt:"\u26a0\ufe0f Contatto in area su {H2}! L'arbitro indica il dischetto: e' rigore.",ef:null,w:0.4,bpos:{x:87,y:50},ms:{fouls:1},pd:"attack_goal",sp:"pen_for"},
  /* [7.532.0 collaudo PO «troppo concentrato a centrocampo» + «la telecronaca va ampliata»] SEDICI VOCI
     NUOVE NELLE FAMIGLIE SOTTILI: 73 righe su 188 erano `midfield` e la pesca ci ricadeva per massa.
     Battute lunghe, stile FM — la massa nuova diluisce il giro palla senza toccare pesi altrui. */
  {txt:"🎯 {H} punta l'uomo sul lato debole, rientra sul mancino e cerca l'angolo lontano: palla a lato di poco.",ef:null,w:2,bpos:{x:80,y:35},ms:{shots:1},pd:"attack"},
  {txt:"🧠 Che giocata di {H}: tacco a liberare {H2} tra le linee, la difesa di {A} si salva in affanno.",ef:null,w:2,bpos:{x:76,y:55},pd:"attack"},
  {txt:"🔥 {H} accelera palla al piede e ne salta due: serve l'accorrente {H2}, conclusione murata!",ef:null,w:2,bpos:{x:83,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"⚽ Azione avvolgente: dentro-fuori tra {H} e {H2}, il pallone taglia l'area piccola e nessuno arriva sul secondo palo!",ef:null,w:1.6,bpos:{x:92,y:55},ms:{shots:1},pd:"attack_goal"},
  {txt:"💫 {H} si accentra dalla destra e lascia partire un sinistro a giro: il portiere di {A} vola a deviare!",ef:null,w:1.6,bpos:{x:84,y:42},ms:{shots:1},pd:"attack_goal"},
  {txt:"🏃 Sgroppata di {H} sull'out mancino: settanta metri palla al piede, poi il cross e' troppo lungo.",ef:null,w:2,bpos:{x:78,y:12},pd:"wide_right"},
  {txt:"↗ {H} e {H2} dialogano sulla corsia: sovrapposizione e traversone teso, allontana la difesa di {A}.",ef:null,w:2,bpos:{x:80,y:85},pd:"wide_right"},
  {txt:"⚡ {H2} attacca la profondita' sull'esterno: {H} lo pesca col contagiri ma la bandierina dice fuorigioco.",ef:null,w:1.8,bpos:{x:74,y:80},pd:"wide_right"},
  {txt:"🧤 Uscita bassa coraggiosa del nostro portiere sui piedi di {A}: si respira.",ef:null,w:1.8,bpos:{x:6,y:50},pd:"defend_goal"},
  {txt:"🛡️ {H} legge la traiettoria e anticipa {A} di testa al limite dell'area: che chiusura.",ef:null,w:2,bpos:{x:16,y:48},pd:"defend_goal"},
  {txt:"😤 Mischia nella nostra area! Doppia respinta, poi {H} spazza lontano e la squadra sale.",ef:null,w:1.6,bpos:{x:8,y:52},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🏋️ Duello rusticano a meta' campo: {H} esce col pallone tra gli applausi.",ef:null,w:1.8,bpos:{x:44,y:55},poss:+1,pd:"retreat",at:"tackle"},
  {txt:"🧊 {A} prova a scuotersi ma {H} raddoppia in pressione: recupero e ripartenza corta.",ef:null,w:1.8,bpos:{x:38,y:45},poss:+2,pd:"retreat"},
  {txt:"📐 {H} disegna un cambio campo di cinquanta metri: {H2} lo addomestica col petto, che qualita'.",ef:null,w:1.8,bpos:{x:68,y:20},pd:"wide_right"},
  {txt:"🎪 Numero di {H} sulla trequarti: elastico e avversario seduto — lo stadio si accende.",ef:null,w:1.6,bpos:{x:72,y:60},pd:"attack"},
  {txt:"🚀 {H} tenta la botta dai venticinque metri: centrale, il portiere di {A} blocca in due tempi.",ef:null,w:2,bpos:{x:77,y:50},ms:{shots:1},pd:"attack"},
  // Tactical
  {txt:"📢 Il mister urla istruzioni. {H} si sistema.",ef:null,w:2,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔥 {H} spinge forte! Intensità altissima.",ef:null,w:3,bpos:{x:65,y:55},pd:"attack",momThreshold:[60,100]},
  {txt:"😤 L'avversario alza il ritmo. {A} pressa alto.",ef:null,w:2,bpos:{x:40,y:48},pd:"retreat",momThreshold:[0,40]},
  {txt:"📊 Partita equilibrata. {H} cerca gli spazi.",ef:null,w:3,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🏃 {A} si chiude in difesa. Possesso sterile.",ef:null,w:2,bpos:{x:55,y:52},pd:"midfield"},
  {txt:"✨ Grande combinazione sulla fascia tra {H} e {H2}.",ef:null,w:2,bpos:{x:72,y:88},pd:"wide_right"},
  {txt:"🔄 Cambio tattico avversario. {A} pressa di più.",ef:null,w:2,bpos:{x:42,y:50},pd:"retreat",momThreshold:[0,40]},
  // Late game
  {txt:"⏱️ Il tempo stringe. {H} deve sbloccarla!",ef:null,w:4,minClock:70,bpos:{x:65,y:50},pd:"attack"},
  {txt:"🔥 Pressione massima di {H}! Tifosi scatenati.",ef:null,w:3,minClock:75,bpos:{x:75,y:50},pd:"attack"},
  {txt:"💊 Sostituzione avversaria. {A} entra fresco.",ef:null,w:2,minClock:60,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"😓 Le gambe pesano. {H} deve reggere.",ef:null,w:2,minClock:80,bpos:{x:50,y:50},pd:"retreat"},
  // Winning team entries
  {txt:"⏱️ {H} gestisce il pallone. Niente rischi ora.",ef:null,w:3,bpos:{x:52,y:50},pd:"midfield",ctx:"winning"},
  {txt:"😤 {A} si dispera. Il risultato è nero per loro.",ef:null,w:2,bpos:{x:60,y:55},pd:"attack",ctx:"winning"},
  {txt:"🔒 {H} abbassa il baricentro. Palla all'indietro con sicurezza.",ef:null,w:3,bpos:{x:45,y:50},pd:"midfield",ctx:"winning"},
  {txt:"📢 Il mister urla: 'Controllate! Non rischiate nulla.'",ef:null,w:2,bpos:{x:50,y:50},pd:"midfield",ctx:"winning"},
  // Losing team entries
  {txt:"🔥 {H} deve assolutamente segnare. L'assalto è totale.",ef:null,w:3,bpos:{x:75,y:50},pd:"attack",ctx:"losing"},
  {txt:"😨 Il tempo passa e {H} è ancora sotto. Panico visibile.",ef:null,w:2,minClock:65,bpos:{x:70,y:52},pd:"attack",ctx:"losing"},
  {txt:"💥 Tiro disperato di {H} dal limite. Sopra la traversa.",ef:null,w:2,bpos:{x:78,y:50},ms:{shots:1},pd:"attack",ctx:"losing"},
  {txt:"📢 {H} chiede il cambio di ritmo. Serve un gol subito.",ef:null,w:2,bpos:{x:65,y:50},pd:"attack",ctx:"losing"},
  // Drawing entries
  {txt:"⚖️ Partita bloccata. {H} cerca la giocata decisiva.",ef:null,w:3,bpos:{x:60,y:50},pd:"midfield",ctx:"drawing"},
  {txt:"🎯 Schema da calcio piazzato elaborato dalla panchina di {H}.",ef:null,w:2,bpos:{x:65,y:50},ms:{fouls:1},pd:"attack",ctx:"drawing"},
  // Early game (first 30 min)
  {txt:"🌅 Partita appena iniziata. {H} prende le misure.",ef:null,w:2,maxClock:30,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔵 {H} controlla il ritmo nei primi minuti.",ef:null,w:3,maxClock:25,bpos:{x:48,y:50},pd:"midfield"},
  {txt:"📐 Schema studiato questa settimana. {H} prova l'abbrivio.",ef:null,w:2,maxClock:20,bpos:{x:60,y:55},pd:"attack"},
  // Physical duels
  {txt:"💪 Scontro fisico al centro. {H} vince il duello.",ef:null,w:3,poss:+1,bpos:{x:50,y:48},pd:"midfield"},
  {txt:"⚡ {A} guadagna fallo su calcio di punizione dal centro.",ef:null,w:2,bpos:{x:55,y:52},ms:{fouls:1},pd:"midfield"},
  {txt:"🤸 Giocata acrobatica di {H}! La palla resta in gioco.",ef:null,w:2,bpos:{x:72,y:60},pd:"attack"},
  // Goalkeeping
  {txt:"🧤 {H} spedisce un bolide, attento il portiere avversario!",ef:null,w:2,bpos:{x:82,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"🏳️ Corner conquistato da {H} dopo una bella azione.",ef:null,w:2,bpos:{x:89,y:8},ms:{corners:1},pd:"wide_right"},
  {txt:"⚠️ Pericolo sugli sviluppi del corner! {A} libera in extremis.",ef:null,w:2,bpos:{x:12,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🛡️ Grande chiusura difensiva di {H}! Pronto sul secondo palo.",ef:null,w:2,poss:+2,bpos:{x:10,y:45},pd:"defend_goal"},
  // Tactical moments
  {txt:"🔄 {A} sorprende con il cambio di modulo.",ef:null,w:2,bpos:{x:45,y:52},pd:"midfield"},
  {txt:"📊 Possesso dominante di {H}: 68% nel secondo tempo.",ef:null,w:2,minClock:45,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"⚡ Pressing sincrono! {H} ruba palla a metà campo.",ef:null,w:2,poss:+2,bpos:{x:48,y:50},pd:"midfield",at:"tackle"},
  {txt:"🎭 Finta di corpo di {H}: avversario fermo, porta aperta.",ef:null,w:2,bpos:{x:75,y:55},pd:"attack"},
  // Atmospheric
  {txt:"🔥 Lo stadio è una bolgia. I tifosi spingono {H}.",ef:null,w:2,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"📣 Cori assordanti. Il dodicesimo uomo di {H} ci crede.",ef:null,w:2,bpos:{x:55,y:50},pd:"attack"},
  {txt:"😤 Nervi tesi! Scintille tra i giocatori. L'arbitro media.",ef:null,w:2,bpos:{x:50,y:52},ms:{fouls:1},pd:"midfield"},
  // Technical highlights
  {txt:"🌀 Numero tecnico di {H}: tre avversari saltati in cinque metri.",ef:null,w:1,bpos:{x:70,y:65},pd:"attack"},
  {txt:"💥 Traversa colpita da {H}! Sfortuna clamorosa.",ef:null,w:1,bpos:{x:92,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"😲 Autorete sfiorata! {A} libera sulla linea per un soffio.",ef:null,w:1,bpos:{x:8,y:50},ms:{oppShots:1},pd:"defend_goal"},
  // Sub-events — in-match incidents with gameplay effect
  {txt:"🟥 ESPULSIONE! {A} vede il rosso! Siamo in superiorità numerica!",ef:"opp_red",w:0.25,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🚑 Infortunio muscolare per {A}! Il giocatore lascia il campo tra i fischi.",ef:"opp_injury",w:0.40,bpos:{x:55,y:48},pd:"midfield"},
  {txt:"🟥 Fallo da dietro di {A} — arbitro senza esitazioni: rosso diretto!",ef:"opp_red",w:0.20,bpos:{x:38,y:52},pd:"midfield"},
  {txt:"🚑 {A} a terra dopo uno scontro di gioco. Barella in campo.",ef:"opp_injury",w:0.35,bpos:{x:45,y:55},pd:"midfield"},
  // Derby-only BG events
  {txt:"⚔️ DERBY! I tifosi di {H} esplodono. La città è in fiamme!",ef:null,derbyOnly:true,w:3,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔥 Tensione massima al derby: {A} e {H} si affrontano corpo a corpo.",ef:null,derbyOnly:true,w:2,bpos:{x:50,y:50},ms:{fouls:1},pd:"midfield"},
  {txt:"📣 Un coro da brividi in curva. Il derby si sente nell'aria.",ef:null,derbyOnly:true,w:2,bpos:{x:55,y:50},pd:"attack"},
  {txt:"💥 Entrata dura di {A}! Cartellino giallo immediato nel derby.",ef:null,derbyOnly:true,w:2,bpos:{x:48,y:52},ms:{fouls:1},pd:"midfield"},
  {txt:"🏟️ Lo stadio rugge: è il derby, nulla conta di più.",ef:null,derbyOnly:true,w:3,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"⚡ Ritmo forsennato! Nel derby non si fa prigionieri.",ef:null,derbyOnly:true,w:2,bpos:{x:60,y:50},pd:"attack"},
  // Injury time & late-game drama
  {txt:"⏱️ Recupero concesso! L'arbitro mostra il tabellino. Tutto ancora in gioco.",ef:null,w:1,bpos:{x:50,y:50},pd:"midfield"},
  /* [7.470.0] RIGA RIMOSSA — IL VAR E' VIETATO NEL GIOCO. Sta scritto fra i vincoli del PO («Vietati nel
     gioco: VAR, replay, autogol, gestione allenamento») ed era perfino richiamato a r.~2136 come vincolo
     rispettato, mentre una riga di cronaca ambientale lo raccontava a ogni partita con peso 0,8. Nessuna
     sostituzione: la cronaca ha gia' abbastanza voci per quel momento, e aggiungerne una per riempire il
     buco sarebbe stato rimettere il difetto con un altro nome. */
  {txt:"🩹 {P} si tocca la coscia. Due minuti a terra — poi si rialza tra gli applausi.",ef:null,w:1.5,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🟡 Fallo tattico di {A}! Cartellino meritato ma {H} guadagna metà campo.",ef:null,w:2,bpos:{x:40,y:50},ms:{fouls:1},pd:"midfield"},
  {txt:"🔥 {H} preme alla ricerca del pareggio. La difesa avversaria inizia a vacillare.",ef:null,w:2,poss:3,bpos:{x:65,y:50},pd:"attack",ctx:"losing"},/* [7.178.0 RC-6] «ricerca del pareggio» ⇒ solo in svantaggio */
  {txt:"💪 {H} non molla. La squadra ritrova energia dal nulla — si sente nell'aria.",ef:null,w:1.5,poss:2,bpos:{x:55,y:50},pd:"midfield"},
  // Palo / traversa (Sprint 76)
  {txt:"🔩 PALO! {H} ci va vicinissimo — il legno salva il portiere avversario.",ef:null,w:1.5,bpos:{x:93,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"🔩 TRAVERSA! Colpo di testa di {H}, la palla si spegne fuori.",ef:null,w:1.2,bpos:{x:92,y:52},ms:{shots:1},pd:"attack_goal"},
  {txt:"🔩 Palo interno e fuori! {H} non riesce a crederci. Che sfortuna.",ef:null,w:0.9,bpos:{x:94,y:48},ms:{shots:1},pd:"attack_goal"},
  {txt:"🛑 Salvataggio sulla linea! Il tiro di {A} spazzato da un difensore di {H}.",ef:null,w:1.2,bpos:{x:5,y:50},ms:{oppShots:1},pd:"defend_goal"},
  // Rigore fischiato (Sprint 76)
  {txt:"🟡 Rigore per {H}! Fallo netto in area — nessun dubbio per l'arbitro.",ef:null,w:0.8,bpos:{x:92,y:50},ms:{fouls:1},pd:"attack_goal"},
  {txt:"👋 Mani in area di {A}! L'arbitro indica il dischetto — stadio in delirio.",ef:null,w:0.6,bpos:{x:88,y:50},ms:{fouls:1},pd:"attack_goal"},
  // Contropiede (Sprint 76)
  {txt:"⚡ Contropiede fulmineo di {H}! Tre contro due — accelerazione devastante.",ef:null,w:2,poss:3,bpos:{x:70,y:50},pd:"attack"},
  {txt:"🔥 {H} lancia in profondità — {H2} scatta oltre la linea difensiva.",ef:null,w:2.5,bpos:{x:72,y:55},pd:"attack"},
  {txt:"💨 Transizione rapida: {A} perde palla e {H} parte in contropiede 2v1.",ef:null,w:2,poss:2,bpos:{x:60,y:48},pd:"attack"},
  // Pressing coordinato (Sprint 76)
  {txt:"🔴 Pressing alto coordinato di {H}: tre giocatori chiudono il portiere avversario.",ef:null,w:2,poss:3,bpos:{x:15,y:50},pd:"midfield",at:"tackle"},
  {txt:"🎯 Pressing premiato: {H} recupera palla nell'ultimo terzo. Pericoloso!",ef:null,w:2,poss:2,bpos:{x:18,y:52},pd:"midfield",at:"tackle"},
  // Duelli aerei (Sprint 76)
  {txt:"✈️ Duello aereo al centro. {H} vince di testa e serve {H2}.",ef:null,w:2.5,poss:1,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"✈️ Cross dalla destra — stacco potente di {H}! Palla fuori di pochissimo.",ef:null,w:1.5,bpos:{x:90,y:88},ms:{shots:1},pd:"attack_goal",at:"cross"},
  // Intervallo / secondo tempo (Sprint 76)
  {txt:"📊 All'intervallo il mister chiede più pressing. {H} ascolta.",ef:null,w:2,minClock:44,maxClock:46,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔵 Secondo tempo. {H} esce dagli spogliatoi con tutt'altra intensità.",ef:null,w:2,minClock:45,maxClock:51,bpos:{x:50,y:50},pd:"midfield"},
  // Winning (Sprint 76)
  {txt:"🔒 {H} rallenta il gioco con personalità — palla a terra, tempo che passa.",ef:null,w:2.5,bpos:{x:42,y:50},pd:"midfield",ctx:"winning"},
  {txt:"😤 {A} si dispera in attacco. La porta di {H} sembra lontanissima.",ef:null,w:2,bpos:{x:78,y:52},ms:{shots:1},pd:"attack",ctx:"winning"},
  {txt:"⏱️ {H} gestisce con esperienza. Ogni secondo vale oro.",ef:null,w:2,minClock:70,bpos:{x:48,y:50},pd:"midfield",ctx:"winning"},
  {txt:"🧊 Sangue freddo totale. {H} non si fa sorprendere — palla conservata.",ef:null,w:2,bpos:{x:45,y:50},pd:"retreat",ctx:"winning"},
  // Losing (Sprint 76)
  {txt:"🚨 Il mister agita le braccia dalla panchina. Ci vuole il gol adesso.",ef:null,w:2.5,bpos:{x:70,y:50},pd:"attack",ctx:"losing"},
  {txt:"💥 {H} ci prova ancora! Tiro potente — para in tuffo il portiere avversario.",ef:null,w:2,bpos:{x:80,y:50},ms:{shots:1},pd:"attack_goal",ctx:"losing"},
  {txt:"⏱️ Il tempo stringe e {H} è ancora sotto. Ogni secondo brucia.",ef:null,w:2,minClock:70,bpos:{x:72,y:50},pd:"attack",ctx:"losing"},
  {txt:"🔥 Follia offensiva di {H}! Anche il difensore sale in attacco.",ef:null,w:1.5,minClock:80,bpos:{x:78,y:50},pd:"attack_goal",ctx:"losing"},
  // Drawing (Sprint 76)
  {txt:"🎯 Partita da vincere — {H} cerca la giocata decisiva.",ef:null,w:2,bpos:{x:60,y:50},pd:"attack",ctx:"drawing"},
  {txt:"📊 Equilibrio assoluto. La prima disattenzione potrebbe decidere tutto.",ef:null,w:2,minClock:65,bpos:{x:55,y:50},pd:"midfield",ctx:"drawing"},
  {txt:"⚖️ {H} e {A} si equivalgono. Il dettaglio farà la differenza.",ef:null,w:2,bpos:{x:50,y:50},pd:"midfield",ctx:"drawing"},
  // Con protagonista {P} (Sprint 76)
  {txt:"👟 {P} scatta sulla fascia — l'avversario lo segue a fatica.",ef:null,w:1.5,bpos:{x:65,y:85},pd:"wide_right"},
  {txt:"⚡ {P} si gira in un fazzoletto e salta due avversari.",ef:null,w:1.5,bpos:{x:68,y:60},pd:"attack"},
  {txt:"😤 {P} protegge palla col corpo — aspetta il momento giusto per servire.",ef:null,w:1.5,bpos:{x:55,y:52},pd:"midfield"},
  {txt:"🌀 {P} lancia in verticale — la difesa è aperta.",ef:null,w:1.5,bpos:{x:70,y:50},pd:"attack"},
  // Atmosferici extra (Sprint 76)
  {txt:"📣 La curva risponde al gesto del capitano — boato impressionante.",ef:null,w:1.5,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🏟️ Stadio esaurito. L'atmosfera è qualcosa di mai visto.",ef:null,w:1,maxClock:15,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"😓 Le gambe pesano — terza partita in sette giorni, ma si va avanti.",ef:null,w:1.5,minClock:75,bpos:{x:50,y:50},pd:"retreat"},
  {txt:"🩹 {P} si tocca il polpaccio dopo un contrasto. Respira e ricomincia.",ef:null,w:1.5,bpos:{x:50,y:50},pd:"midfield"},
  // Sprint 113 — Enhanced commentary: variety, roles, dedup-friendly
  // Attacks — more specific
  {txt:"🌀 {H} salta il primo uomo e guadagna il fondo. Cross in arrivo.",ef:null,w:2,bpos:{x:84,y:92},pd:"wide_right"},
  {txt:"💥 Conclusione dal limite di {H}! Vola il portiere avversario.",ef:null,w:2,bpos:{x:74,y:52},ms:{shots:1},pd:"attack_goal"},
  {txt:"⚡ Imbucata di {H} per il centravanti — difesa in affanno!",ef:null,w:2,bpos:{x:72,y:55},pd:"attack",at:"pass"},
  {txt:"🎯 {H} triangola e si ritrova in area! Grande combinazione.",ef:null,w:2,bpos:{x:82,y:58},ms:{shots:1},pd:"attack_goal",at:"pass"},
  {txt:"🔥 Azione manovrata di {H}! Tredici passaggi di fila.",ef:null,w:2,bpos:{x:68,y:50},pd:"midfield"},
  {txt:"🌀 Cambio campo a sorpresa — {H2} libero sulla fascia sinistra.",ef:null,w:2,bpos:{x:72,y:12},pd:"wide_right"},
  {txt:"✈️ Lancio lungo per {H}! Controllo e tiro — fuori di poco.",ef:null,w:1.5,bpos:{x:86,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"⚡ {H} entra in area di potenza! Difesa in affanno.",ef:null,w:1.5,bpos:{x:83,y:55},pd:"attack_goal"},
  {txt:"🔩 PALO! Che conclusione di {H} — il legno fa da quarto palo.",ef:null,w:1,bpos:{x:96,y:50},ms:{shots:1},pd:"attack_goal"},
  // Defense — more specific
  {txt:"🛡️ Intercetto di {H} in anticipo! Il contropiede avversario si spegne.",ef:null,w:2,poss:+2,bpos:{x:35,y:50},pd:"midfield",at:"tackle"},
  {txt:"✋ Blocco difensivo! Il tiro di {A} è murato da {H}.",ef:null,w:2,bpos:{x:12,y:50},ms:{oppShots:1},pd:"defend_goal",at:"tackle"},
  {txt:"🧤 Parata sicura! Il portiere di {H} blocca a terra senza problemi.",ef:null,w:2,bpos:{x:5,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"⚠️ Tiro a giro di {A} — para in tuffo il portiere!",ef:null,w:1.5,bpos:{x:8,y:45},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🚩 Fuorigioco millimetrico! {A} libero, ma la bandierina è alzata.",ef:null,w:2,bpos:{x:18,y:50},pd:"retreat"},
  {txt:"🧱 Linea difensiva compatta di {H} — {A} sbatte sul muro.",ef:null,w:2,poss:+1,bpos:{x:25,y:50},pd:"retreat"},
  // Physical duels & midfield
  {txt:"💪 Duello muscolare tra {H} e {A} a centrocampo. Vince {H}.",ef:null,w:2,poss:+1,bpos:{x:48,y:50},pd:"midfield"},
  {txt:"⚡ Pressing alto immediato! {H} recupera palla in zona offensiva.",ef:null,w:2,poss:+2,bpos:{x:20,y:50},pd:"midfield",at:"tackle"},
  {txt:"🔄 Rotazione veloce del pallone — {A} non riesce a organizzarsi.",ef:null,w:2,poss:+2,bpos:{x:60,y:50},pd:"midfield"},
  {txt:"🎯 Combinazione stretta a un tocco tra {H} e {H2}.",ef:null,w:2,bpos:{x:65,y:50},pd:"attack"},
  {txt:"💨 {A} prova la verticalizzazione — {H} legge e anticipa.",ef:null,w:2,poss:+2,bpos:{x:42,y:50},pd:"midfield",at:"tackle"},
  // Late-game
  {txt:"⏱️ Ottantesimo minuto. Il risultato si vede nell'intensità di entrambe le squadre.",ef:null,w:2,minClock:78,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔥 Minuti finali — {H} non si ferma. Fisicamente superiore nel finale.",ef:null,w:2,minClock:82,bpos:{x:68,y:50},pd:"attack"},
  {txt:"⏳ Tre minuti al 90'. Ogni angolo diventa prezioso per guadagnare tempo.",ef:null,w:2,minClock:87,bpos:{x:55,y:50},pd:"midfield"},
  {txt:"💥 Tiro di {H} in piena area di rigore — salva sulla linea un difensore.",ef:null,w:1.5,minClock:75,bpos:{x:90,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"😓 {A} batte l'angolo lentamente. Cerca di spezzare il ritmo.",ef:null,w:1.5,minClock:75,bpos:{x:5,y:8},ms:{oppShots:1},pd:"defend_goal"},
  // Protagonist — role-specific
  {txt:"🌟 {P} taglia in diagonale — l'avversario lo perde di vista.",ef:null,w:1.5,bpos:{x:75,y:65},pd:"attack"},
  {txt:"💪 {P} vince il duello aereo e smista per {H}.",ef:null,w:1.5,bpos:{x:55,y:50},pd:"midfield"},
  {txt:"🧠 {P} abbassa il ritmo e detta i tempi del possesso.",ef:null,w:1.5,bpos:{x:48,y:50},pd:"midfield"},
  {txt:"⚡ {P} innesca il contropiede — intuizione da campione.",ef:null,w:1.5,bpos:{x:60,y:50},pd:"attack"},
  {txt:"👟 {P} vince il contrasto e riparte in velocità.",ef:null,w:1.5,bpos:{x:55,y:50},pd:"midfield",at:"tackle"},
  {txt:"🎯 {P} si posiziona perfettamente — il difensore non può anticiparlo.",ef:null,w:1.5,bpos:{x:70,y:55},pd:"attack"},
  // Atmosphere
  {txt:"📣 Il dodicesimo uomo spinge. La curva non si ferma un secondo.",ef:null,w:1.5,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🏟️ Applausi per una giocata tecnica — anche i tifosi avversari si alzano.",ef:null,w:1,bpos:{x:65,y:55},pd:"attack"},
  {txt:"🎺 La banda in curva suona. Il campo vibra — partita memorabile.",ef:null,w:1,bpos:{x:50,y:50},pd:"midfield"},
  // Score-specific
  {txt:"⚡ {H} amministra con lucidità — cambio di ritmo improvviso. Eccellente.",ef:null,w:2,bpos:{x:52,y:50},pd:"midfield",ctx:"winning"},
  {txt:"🔥 {H} non molla! L'uno-due finale è devastante.",ef:null,w:2,minClock:82,bpos:{x:72,y:50},pd:"attack_goal",ctx:"losing"},
  {txt:"🎯 Tiro di {H} deviato in angolo. Pressione totale.",ef:null,w:2,bpos:{x:88,y:50},ms:{shots:1,corners:1},pd:"attack_goal",ctx:"drawing"},
  // Variety pack (5.39.0) — più cronaca per ridurre la ripetizione (audit: cronaca-audit)
  {txt:"🎩 {H} addomestica un pallone difficile e fa ripartire l'azione.",ef:null,w:2,poss:1,bpos:{x:55,y:50},pd:"midfield"},
  {txt:"🧲 {H2} si smarca tra le linee, {H} lo cerca subito.",ef:null,w:2,bpos:{x:62,y:55},pd:"attack"},
  {txt:"🚀 Verticalizzazione improvvisa di {H}! La difesa di {A} va in affanno.",ef:null,w:2,bpos:{x:70,y:50},pd:"attack",at:"pass",momThreshold:[55,100]},
  {txt:"🧱 La difesa di {H} respinge il forcing di {A}. Tutti dietro la linea.",ef:null,w:2,bpos:{x:25,y:50},pd:"defend_goal",momThreshold:[0,45]},
  {txt:"🌬️ Vento in tribuna: il rinvio del portiere si ferma a metà campo.",ef:null,w:1.5,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"👏 Lo stadio applaude una giocata di {H}. L'atmosfera sale.",ef:null,w:1.5,bpos:{x:58,y:55},pd:"attack"},
  {txt:"🦶 Tunnel di {H} a centrocampo! {A} resta inchiodato sul posto.",ef:null,w:1.5,bpos:{x:52,y:48},pd:"midfield",momThreshold:[55,100]},
  {txt:"⏳ {A} fa melina per spezzare il ritmo. Il pubblico fischia.",ef:null,w:1.5,bpos:{x:45,y:50},pd:"retreat"},
  {txt:"🅰️ Assist mancato per un soffio: {H} pesca {H2} ma la difesa anticipa.",ef:null,w:2,bpos:{x:78,y:60},ms:{shots:1},pd:"attack_goal",at:"pass"},
  {txt:"🧤 Uscita decisa del portiere su {A}. Pericolo sventato.",ef:null,w:2,bpos:{x:10,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🏃 {H} brucia l'avversario sulla corsa e guadagna venti metri.",ef:null,w:2,bpos:{x:66,y:80},pd:"wide_right"},
  {txt:"📐 Punizione dalla trequarti per {H}. Si studia lo schema.",ef:null,w:1.5,bpos:{x:70,y:60},ms:{fouls:1},pd:"attack"},
  // Variety pack 2 (5.39.2, Fase 6) — ancora più varietà di cronaca (anti-ripetizione)
  {txt:"🎯 {H} pennella un filtrante che taglia la difesa in due.",ef:null,w:2,bpos:{x:68,y:52},pd:"attack",at:"pass"},
  {txt:"🛡️ {H} chiude in anticipo e spegne la ripartenza di {A}.",ef:null,w:2,poss:2,bpos:{x:30,y:50},pd:"midfield",at:"tackle"},
  {txt:"🔁 Possesso paziente di {H}: triangoli stretti per aprire lo spazio.",ef:null,w:2,poss:1,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"⚡ Ripartenza fulminea di {H}! Tre passaggi e si è in area.",ef:null,w:2,bpos:{x:74,y:50},pd:"attack",at:"pass",momThreshold:[55,100]},
  {txt:"😬 {A} sfiora il pari: {H} salva sulla linea!",ef:null,w:1.5,bpos:{x:6,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🎪 Numero di {H} in dribbling, lo stadio si alza in piedi.",ef:null,w:1.5,bpos:{x:64,y:58},pd:"attack",momThreshold:[60,100]},
  {txt:"🧊 {H} gestisce con freddezza sotto pressione. Niente fretta.",ef:null,w:1.5,bpos:{x:48,y:50},pd:"midfield"},
  {txt:"📣 Il mister chiede più ampiezza. {H} allarga il gioco.",ef:null,w:1.5,bpos:{x:55,y:75},pd:"wide_right"},
  {txt:"🪤 Fuorigioco scattato bene dalla difesa di {H}. {A} fermato.",ef:null,w:1.5,bpos:{x:28,y:50},pd:"retreat"},
  {txt:"💢 {A} protesta per un contatto in area. L'arbitro lascia correre.",ef:null,w:1.5,bpos:{x:18,y:50},pd:"defend_goal"},
  {txt:"🚀 Conclusione potente di {H} dal limite: il portiere vola e respinge.",ef:null,w:2,bpos:{x:78,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"🤝 Sponda di {H2} per {H} che arriva lanciato. Che intesa!",ef:null,w:2,bpos:{x:80,y:55},ms:{shots:1},pd:"attack_goal"},
  // Variety pack 3 (7.48.0, BL-18) — anti-ripetizione: nuove famiglie di cronaca, tutte lint-coerenti (bg-coherence)
  {txt:"🎨 Esterno a giro di {H} dal vertice dell'area: il portiere ci arriva coi polpastrelli.",ef:null,w:1.5,bpos:{x:82,y:55},ms:{shots:1},pd:"attack_goal"},
  {txt:"🎯 Palla scodellata sul secondo palo da {H} — nessuno ci arriva per un soffio.",ef:null,w:1.5,bpos:{x:86,y:85},pd:"wide_right",at:"cross"},
  {txt:"🛡️ Raddoppio perfetto: {H} e {H2} chiudono l'esterno di {A} in fascia.",ef:null,w:2,poss:2,bpos:{x:32,y:80},pd:"retreat",at:"tackle"},
  {txt:"🧤 Riflesso felino del portiere di {H}: deviazione sulla traversa!",ef:null,w:1.5,bpos:{x:6,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"📏 Trama elaborata di {H}: dieci tocchi e la difesa di {A} si scopre.",ef:null,w:2,poss:1,bpos:{x:58,y:50},pd:"midfield"},
  {txt:"💫 Rabona di {H2} per sorprendere la difesa! Il pubblico mormora.",ef:null,w:1,bpos:{x:70,y:60},pd:"attack",at:"pass"},
  {txt:"⏱️ Il quarto uomo segnala tre minuti extra. Ultimo sforzo.",ef:null,w:1.5,minClock:87,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔄 Ritmi bassi: {H} fa girare palla da un lato all'altro senza affondare.",ef:null,w:2,poss:1,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🧤 Sforbiciata di {A} in area — il portiere si distende e la mette in angolo.",ef:null,w:1,bpos:{x:8,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"👟 {P} chiama palla sul corto e apre di prima per {H2}: gioco fluido.",ef:null,w:1.5,bpos:{x:56,y:55},pd:"midfield"},
  {txt:"🧭 {P} si defila sul lato debole e riceve tra le linee. Posizione intelligente.",ef:null,w:1.5,bpos:{x:66,y:38},pd:"attack"},
  {txt:"⚡ Ripiegamento generoso di {P}: rincorre e strappa palla all'esterno di {A}.",ef:null,w:1.5,poss:1,bpos:{x:35,y:70},pd:"retreat",at:"tackle"},
  {txt:"🥶 {A} congela la partita con falli tattici a ripetizione. Il pubblico rumoreggia.",ef:null,w:1.5,ms:{fouls:1},bpos:{x:45,y:50},pd:"midfield",ctx:"losing"},
  {txt:"🏹 Punizione di {H} sopra la barriera: il portiere la toglie dall'incrocio!",ef:null,w:1,bpos:{x:80,y:50},ms:{shots:1},pd:"attack_goal"},
  {txt:"⚔️ Il derby si accende: mischia furibonda a centrocampo, l'arbitro fatica.",ef:null,derbyOnly:true,w:2,ms:{fouls:1},bpos:{x:50,y:50},pd:"midfield"},
  {txt:"📋 Primi minuti di studio: {H} e {A} si annusano senza scoprirsi.",ef:null,w:2,maxClock:15,bpos:{x:50,y:50},pd:"midfield"},
];
const OUTCOME_TX={
  chance_dribble:["🌀 L'avversario è SALTATO! Campo aperto davanti a te!","⚡ Numero splendido — il difensore è a terra, palla al piede!","🔥 Superato con la finta! La difesa è aperta!","💨 Bruciato in velocità — ora la porta ti guarda!"],
  chance:["🎯 Palla d'oro! Il compagno non riesce a concludere — palla che balla in area!","⚡ Filtrante perfetto! La conclusione è respinta — c'è ancora da giocare!","👁️ Che apertura! Il primo tentativo è murato — palla viva!","🔥 Imbucata splendida — il portiere respinge! Occasione ancora aperta!"],
  goal:["💥 GOOOOOL! Folla in delirio!","⚽ Rete spettacolare!","🔥 Imparabile!","🌟 Fenomenale!","🎯 Destro perfetto — nessuna speranza!","⚡ Un lampo! In gol!","💫 Che capolavoro — gol dell'anno!","🏆 Senza storia — gol splendido!"],
  assist:["🎯 Assist perfetto!","🤝 Passaggio da manuale!","🎯 Visione assoluta!","⚡ Lancio millimetrico — compagno solo!","🌀 Giocata di classe pura!","👁️ Ha visto il taglio prima di tutti."],
  miss_easy:["😱 Porta aperta, fuori!","💔 Errore imperdonabile...","🤦 Gol clamorosamente sprecato!","😬 Incredibile — porta spalancata!"],
  miss:["😬 Tiro fuori!","😔 Para il portiere.","❌ Tiro debole, para comodo.","💨 Sopra la traversa — che rimpianto!","😤 Palo! Fortuna avversaria.","😕 Il portiere vola e devia in corner.","❌ Murato dalla difesa.","😔 Tiro centrale — parata facile."],
  intercept:["❌ Intercettato.","😔 Passaggio impreciso.","✋ La difesa chiude in anticipo.","😤 Palla recuperata dagli avversari."],
  loose:["😖 La palla gli sfugge nel tunnel!","💨 Controllo lungo — il pallone scappa via.","😬 Il tunnel non passa: palla persa.","❌ Perde il pallone sul più bello."],/* [7.113.0 audit massivo · fix D2] i due tunnel (gi «Tunnel perfetto/e tiro netto») usano fail:"loose" ma non c'era un pool → la cronaca ripiegava su «Azione completata.» (esito di SUCCESSO) su un'azione FALLITA */
  nothing:["😐 Situazione non sfruttata.","😑 Scelta sbagliata — momento perso.","💭 Poteva fare molto di più."],
  goal_against:["😨 Gol avversario.","💔 Supera e segna.","😰 Errore difensivo — costoso.","💣 Non ci si crede."],
  recovery:["💪 Pallone recuperato!","🛡️ Grande intervento!","✋ Anticipo perfetto!","🧱 Muro invalicabile!","🔒 Intercetto netto — palla nostra!"],
  through:["😬 L'avversario passa.","❌ Non ce la fai.","😔 Supera la pressione.","💨 Troppo veloce — ti ha saltato."],
  foul:["🟡 Fallo! Sei stato ammonito.","⚠️ Rischio fallo! Punizione concessa.","😤 Cartellino meritato — attento."],
  save:["🧤 SALVATO! Che intervento!","🛡️ Blocchi la conclusione! Grande difesa.","🚨 Para in tuffo — miracoloso!","💪 Muro invalicabile — palla sua!"],
};
// 5.51.0 — SOVRAIMPRESSIONI HIGHLIGHT: messaggio breve "televisivo" SEMPRE coerente con l'azione e l'esito.
//   Categoria derivata da outKey + tipo azione; >50 messaggi totali, scelti via seed → varietà, niente ripetizioni.
const HL_OVERLAY_POOLS={
  chance:["OCCASIONE CREATA!","Palla d'oro!","Che imbucata!","La difesa trema!","Occasione viva!","Palla velenosa in area!"],
  goal:["GOL — {nome}!","RETE!","Finalizzazione perfetta!","Che gol, {nome}!","Imparabile!","Eurogol!","Glaciale sotto porta!","Non perdona!","Freddezza assoluta!","Capolavoro di {nome}!","La mette dentro!","Esecuzione da bomber!"],
  assist:["Assist!","Assist decisivo!","Passaggio vincente!","Grande visione di gioco!","Servito su un piatto!","L'ultimo tocco è suo!","Regia perfetta!","Illuminazione di {nome}!","Che assist!"],
  pass:["Ottimo passaggio","Precisione assoluta","Scambio perfetto","Costruzione dell'azione","Palla filtrante","Verticalizzazione di qualità","Suggerimento illuminante","Gioco pulito"],
  cross:["Cross perfetto","Traversone al bacio","Pennellata in area","Palla messa lì","Suggerimento dalla fascia","Cross teso e velenoso"],
  dribble:["Dribbling vincente!","Salta l'uomo!","Grande giocata!","Numero di classe!","Che finta!","Lo manda al bar!","Accelerazione irresistibile","Tunnel di prima"],
  recovery:["Recupero decisivo","Intercetto perfetto","Palla riconquistata","Letta alla perfezione","Pressing che paga","Riaggressione immediata"],
  tackle:["Contrasto vinto!","Chiusura impeccabile!","Entrata pulita!","Anticipo da campione!","Muro invalicabile!","Spazza via il pericolo"],
  miss:["Occasione mancata","Che peccato!","A un passo dal gol","Tiro fuori di poco","Palo!","Traversa!","Grande parata del portiere","Il portiere dice di no","Murato dalla difesa","Non trova lo specchio","Tentativo respinto","Il gol sembrava fatto","Ci è andato vicinissimo","Conclusione centrale","Sfiora il vantaggio"],
  miss_big:["Gol clamorosamente sprecato!","Porta spalancata, e niente!","Occasione enorme buttata via","Doveva solo spingerla dentro","Errore incredibile sotto porta"],
  pass_fail:["Passaggio intercettato","Letto dalla difesa","Pallone regalato","Ultimo tocco impreciso","Lancio troppo lungo"],
  dribble_fail:["Fermato dall'avversario","Dribbling murato","Palla persa nel dribbling","Difesa attenta","Ci prova ma viene chiuso"],
  def_fail:["Superato dall'avversario","Niente da fare","L'avversario passa","Saltato secco","Beffato dall'attaccante"],
  nothing:["Scelta conservativa","Azione non sfruttata","Si poteva osare di più","Momento sprecato","Gioco sul sicuro"],
  conceded:["Gol subito","Disastro difensivo","Buco in copertura","Lasciato solo l'attaccante","Retroguardia in bambola"],
  foul:["Fallo!","Ammonito","Intervento falloso","Punizione concessa","Entrata in ritardo"],
  save_hero:["Che parata!","Il portiere dice no!","Miracolo tra i pali!","Riflesso felino!","Serranda abbassata!","Risposta da campione!"],
};
// ── M1 · UNIFIED OUTCOME MODEL (coerenza overlay↔3D↔cronaca) ──────────────────
//   Su un tiro FALLITO l'esito granulare (palo/parata/murato/fuori) lo decide UNA
//   sola volta il motore (decideExecution → outKind, in handleAction) e lo consumano
//   TUTTI: il 3D (P.hlOutcomeKind), l'overlay (sotto-pool sotto) e la cronaca (_MISS_TX).
//   Prima ogni sistema pescava a caso dentro un pool "miss" misto → l'overlay poteva
//   dire "PALO!" mentre il 3D mostrava una parata (viola Cap.6.8/GR-048/065). Ora no.
const _MISS_OVL={
  post:["Palo!","Il palo gli dice no","Ci è andato vicinissimo","A un passo dal gol"],
  saved:["Grande parata del portiere","Il portiere dice di no","Tentativo respinto","Conclusione centrale","Il gol sembrava fatto"],
  blocked:["Murato dalla difesa","Tentativo respinto","Conclusione murata"],
  wide:["Tiro fuori di poco","Non trova lo specchio","Che peccato!","Occasione mancata","Sfiora il vantaggio"],
  corner:["Deviata in angolo","Corner conquistato","Respinta in corner","A un passo — è angolo"],
  foul:["Conquista una punizione","Subisce il fallo","Guadagna un calcio piazzato","Steso — punizione"],
  offside:["In fuorigioco!","La bandierina è alzata","Oltre la linea — offside","Fuorigioco di un soffio"],
};
const _MISS_TX={
  post:["😤 Palo! Fortuna avversaria.","😖 Il legno respinge la conclusione.","😤 Palo pieno — che sfortuna."],
  saved:["😔 Para il portiere.","❌ Tiro debole, para comodo.","😔 Tiro centrale — parata facile.","😕 Il portiere devia in corner."],
  blocked:["❌ Murato dalla difesa.","🧱 La difesa mura la conclusione."],
  wide:["😬 Tiro fuori!","💨 Sopra la traversa — che rimpianto!","😔 Non trova lo specchio."],
  corner:["🚩 Deviata in angolo!","🏳️ La conclusione finisce in corner.","🚩 Respinta in corner — si riparte dalla bandierina."],
  foul:["🟢 Fallo subito — punizione per noi!","🎯 Conquista una punizione in zona interessante.","🟢 Steso da un avversario: calcio piazzato."],
  offside:["🚩 Fuorigioco! L assistente alza la bandierina.","🏳️ In posizione irregolare — offside.","🚩 Oltre la linea di un soffio: fuorigioco."],
};
/* [7.217.0 revisione PO «rendere più nitida la parata / traversa / palo»] IL LEGNO COLPITO E QUELLO DETTO.
   Il pool del palo mescolava «Palo!» e «Traversa!» pescando a caso, mentre il 3D mostrava SEMPRE un palo
   laterale: la parola e l'immagine si contraddicevano una volta su due. Dal 7.215.0 la traversa esiste davvero,
   quindi QUALE legno sia lo decide UNA volta `handleAction` (campo `woodwork` dell'outcome, pattern M1) e lo
   consumano insieme 3D, overlay e cronaca. Restano nella stessa FAMIGLIA visiva "post" → l'invariante
   overlay-family ⟺ arc-family verificato dal check `timeline` del gate non cambia. */
const _BAR_OVL=["Traversa!","La traversa gli dice no","Il legno alto respinge","Traversa piena!"];
const _BAR_TX=["😤 Traversa! Il pallone sbatte sotto l'incrocio.","😖 Il legno alto respinge la conclusione.","😤 Traversa piena — e ricade in campo."];
// normalizza l'esito granulare (~30 valori) nelle 4 famiglie visive del "miss"; null → pool piatto legacy
function _missKindNorm(k){
  if(!k)return null;
  if(k==="post")return"post";
  if(k==="corner")return"corner";/* [6.4.1 R2.2] esito offensivo di PRIMA CLASSE: tiro/cross deviato in angolo (prima appiattito in "saved" = parata) */
  if(k==="fouled"||k==="win_freekick"||k==="foul")return"foul";/* [6.4.2 R2.3] fallo SUBITO dall azione dell eroe → punizione a favore (prima → pool piatto) · [6.76.0] anche il "foul" nudo di decideExecution('intercept') */
  if(k==="offside")return"offside";/* [6.4.3 R2.4] filtrante in fuorigioco (prima → pool piatto) */
  if(k==="saved"||k==="save")return"saved";
  if(k==="blocked"||k==="intercepted"||k==="wall_blocked"||k==="dispossessed"||k==="beaten")return"blocked";/* [6.4.3 R2.4] avversario vince il pallone → famiglia "murato/fermato" (prima → pool piatto) */
  if(k==="wide"||k==="out"||k==="overhit"||k==="missed"||k==="deflected_out"||k==="shielded_out"||k==="lost"||k==="stopped")return"wide";
  return null;
}
function _hlOvlCat(outKey,ok,actionLabel){
  const L=(actionLabel||"").toLowerCase();
  const reShot=/tir|conclus|destr|sinistr|girat|vol[eé]|bomba|stoccat|incroci|piattone|pallonett|rasoterra|a giro/;
  const reDrib=/dribbl|salt|punt|fint|elastico|tunnel|serpentin|uno contro uno|1v1|rabona|accelera/;
  const reCross=/cross|traverson|pennell|fendente|mette in mezzo|suggerimento dal/;
  const rePass=/passagg|imbucat|filtrant|lanci|scaric|verticalizz|apertur|servizi|smista|triangol|uno-due|dai e vai|appoggi/;
  const reDef=/tackle|contrast|scivolat|anticip|intercett|recuper|pressing|chiusur|spazz|copertur/;
  if(outKey==="goal")return"goal";
  if(outKey==="assist")return"assist";
  if(outKey==="chance")return"chance";// [5.78.0 SIT-4] occasione creata (palla buona, conclusione da giocare)
  if(outKey==="save")return"save_hero";
  if(outKey==="foul")return"foul";
  if(outKey==="goal_against")return"conceded";
  if(outKey==="recovery")return reDef.test(L)?"tackle":"recovery";
  if(outKey==="miss_easy")return"miss_big";
  if(!ok){
    if(outKey==="intercept")return"pass_fail";
    if(outKey==="through")return reDrib.test(L)?"dribble_fail":"def_fail";
    if(outKey==="nothing")return"nothing";
    return"miss";
  }
  if(reDrib.test(L))return"dribble";
  if(reCross.test(L))return"cross";
  if(rePass.test(L))return"pass";
  if(reShot.test(L))return"miss";
  return"pass";
}
function hlOverlay(outKey,ok,actionLabel,heroFirst,seed,outKind,wood){
  const cat=_hlOvlCat(outKey,ok,actionLabel);
  // M1: sul "miss" usa il sotto-pool coerente con l'esito granulare deciso dal motore (palo/parata/murato/fuori).
  //   [6.76.0 LMV-S1] esteso a TUTTI i fail offensivi con esito granulare noto (fail:"intercept"/"through"/
  //   "miss_easy"): prima un cross deviato in ANGOLO con fail:"intercept" mostrava «Passaggio intercettato»
  //   mentre 3D+box-score raccontavano il corner — il layer M1 era di fatto ristretto a key==="miss".
  const _nk=(cat==="miss"||(!ok&&(cat==="pass_fail"||cat==="def_fail"||cat==="dribble_fail"||cat==="miss_big")))?_missKindNorm(outKind):null;
  const pool=(_nk==="post"&&wood==="bar")?_BAR_OVL:((_nk&&_MISS_OVL[_nk])||HL_OVERLAY_POOLS[cat]||HL_OVERLAY_POOLS.nothing);/* [7.217.0] stessa famiglia, parole del legno REALMENTE colpito */
  const i=(((seed|0)%pool.length)+pool.length)%pool.length;
  const good=["goal","assist","chance","pass","cross","dribble","recovery","tackle","save_hero"];
  // [7.136.0 collaudo PO «ogni messaggio esito azione deve avere la sua iconcina, come la catena, il gol ecc.»]
  //   iconcina per FAMIGLIA d'esito → prefissata al titolo dell'overlay (rende ogni esito riconoscibile a colpo d'occhio).
  const icon=(_nk&&_OVL_FAM_ICON[_nk])||_OVL_CAT_ICON[cat]||"⚽";
  return {text:pool[i].replace(/\{nome\}/g,heroFirst||"").replace(/\s+!/g,"!").trim(),
          tone:good.indexOf(cat)>=0?"good":(cat==="nothing"?"neutral":"bad"), cat, fam:_nk||null, icon};
}
// [7.136.0] mappe iconcina esito — per categoria (cat) e per famiglia granulare del "miss" (fam)
const _OVL_CAT_ICON={goal:"⚽",assist:"🅰️",chance:"✨",pass:"🎯",cross:"↗️",dribble:"🌀",recovery:"🔄",tackle:"🛡️",save_hero:"🧤",miss:"❌",miss_big:"😱",pass_fail:"✂️",dribble_fail:"🚫",def_fail:"⚠️",nothing:"😐",conceded:"🥅",foul:"🟨"};
const _OVL_FAM_ICON={post:"🎯",saved:"🧤",blocked:"🧱",wide:"💨",corner:"🚩",foul:"🟢",offside:"🚩"};
// Sprint 82 — ~100 stadium names across 6 tiers + U18 pool
const STADIUMS=["Stadio Olimpico Giovanile","Arena Primavera","Centro Sportivo Terre Rosse","Stadio Accademia del Borgo","Arena della Gioventù","Campo Sportivo Lambro","Stadio Bertolotti","Arena Giovanile Sismondi","Centro Federale Valdarno","Stadio del Settore Giovanile","Campo dei Tigli","Arena Academy Nord"];// [5.96.0 CR-1] bonifica: via Coverciano/Braglia/Vismara/Galli (riferimenti reali)
const STADIUM_POOLS=[
  {min:88,s:["Stadio Meneghino","Stadio Capitolino","Stadio Sabaudo","Stadio Vesuvio","Albion Stadium","Mersey Stadium","Estadi Blau","Estadio Capital","Stadion der Wand","City Stadium","Northwich Stadium","Parc Royal","Grachten Arena","München Arena","Estadio Coloso","Bridge Stadium","Cannon Stadium","North Stadium","Stade Phocéen","Estádio Azul"]},
  {min:76,s:["Stadio Toscano","Bergamo Stadium","Stadio dell'Arena Vecchia","Stadio Felsineo","Stadio Ligure","Volkswiese Stadion","Power Stadium","Estadio Naranja","Estadio Hispalense","Stade des Verts","Estádio Leonino","Estádio do Grifo","Estádio Norte","Stade Princier","Stadio dei Navigli","Fiandria Stadion","Arena Lviv","Stade de la Cathédrale","Estadio de la Cerámica Vieja","Stade du Littoral"]},
  {min:63,s:["Stadio Monferrato","Stadio Adriatico","Stadio del Palladio","Stadio del Valdarno","Estadio de las Islas","Stade de la Loire","Estadio del Norte Verde","Arena Orobica","Estadio Celeste","Estadio de la Sierra","Stade Gabriel Montpied","Gradski Stadion","Stadion Steiermark","Estadio Andaluz","Stade de la Rivière","Arena della Torre","Stadio delle Dolomiti","Stade de la Champagne","Stadio Scaligero Sud","Estadio del Somontano"]},
  {min:50,s:["Stadio Brumana","Campo Sportivo Comunale","Stadio del Piceno","Campo Crespi","Arena Cimini","Stadio Parmense","Stadio degli Etruschi","Stadio della Ghirlandina","Estadio del Sur","Arena Poltava","Stade des Volcans","Estadio de la Meseta","Stadio della Valle","Campo de la Costa Brava","Arena Kielce","Stadion Górniczy","Stade des Tilleuls","Estadio del Miño","Stadio delle Cave","Arena Cracovia"]},
  {min:35,s:["Stadio Comunale del Melandro","Campo Sportivo del Golfo","Arena Città di Castello","Stadio dell'Elefante B","Campo Sportivo dei Pini","Estadio de la Bahía B","Stade de l'Aveyron","Stadion Wschodni","Arena Lublin","Stadio dello Ionio","Campo San Nicolò","Estadio del Atlántico","Stade des Pyrénées","Arena Czeladź","Stadio dei Due Mari","Campo Sportivo degli Ulivi"]},
  {min:0,s:["Campo Sportivo Parrocchiale","Arena Polivalente","Stadio Civico Nord","Campo Allenamento B","Terreno di Gioco Centrale","Stadio Quartiere","Campo Secondario","Arena Dilettanti","Campo Sportivo Est","Terreno Senza Nome","Stadio Periferia","Campo del Comune"]},
];
const CLUB_STADIUMS={
  // [5.96.0 CR-1/DB-1] chiavi RIALLINEATE agli id attuali di CLUBS (19 chiavi morte rimappate,
  //   collisione "mon" risolta: mon=FC Monaco→Stade Princier, mon2=FC Brianzolo→Brianza Stadium)
  //   + valori bonificati dai riferimenti reali (Kuip/Olympia/Trafford/Amsterdam Arena/Power).
  "juve":"Stadio Sabaudo","inter":"Stadio Meneghino","milan":"Stadio Meneghino","napoli":"Stadio Vesuvio",
  "roma":"Stadio Capitolino","lazio":"Stadio Capitolino","ata":"Bergamo Stadium","fio":"Stadio Toscano",
  "tor":"Stadio Granata","bol":"Stadio Felsineo","udi":"Stadio Friulano",
  "gen":"Stadio Ligure","sam":"Stadio Ligure","par":"Stadio Parmense",
  "mon2":"Brianza Stadium","sas":"Emilia Stadium","lec":"Stadio Salentino",
  "sal":"Stadio Salernum","ver":"Stadio Scaligero","spe":"Stadio Spezzino",
  "cre":"Stadio Cremonese","mcy":"City Stadium","liv":"Mersey Stadium","ars":"Cannon Stadium",
  "che":"Bridge Stadium","mun":"Northwich Stadium","tot":"North Stadium",
  "avl":"Aston Park","new":"Tyne Park","eve":"Merseyside Park","lei":"Midlands Stadium",
  "whu":"East Stadium","wol":"Wanderers Stadium","cry":"Croydon Park",
  "bha":"Sussex Stadium","bur":"Lancashire Stadium","bou":"Dorset Stadium",
  "rma":"Estadio Capital","bar":"Estadi Blau","atm":"Estadio Coloso",
  "sev":"Estadio Hispalense","bet":"Estadio Verdiblanco","val":"Estadio Naranja",
  "vill":"Estadio Amarillo","ath":"Estadio Vasco","rsoc":"Estadio Donostiarra","cel":"Estadio Celeste",
  "bay":"München Arena","bvb":"Goldwald Stadion","rbl":"Leipzig Arena","b04":"Werkstadt Arena",
  "fra":"Frankfurt Arena","s04":"Gelsenkirchen Arena","bsc":"Berlin Arena",
  "psg":"Parc Royal","marse":"Stade Phocéen","lyon":"Lyon Stadium","lille":"Lille Stadium",
  "mon":"Stade Princier","ren":"Rennes Park","nice":"Riviera Stadium","len":"Lens Stadium",
  "ajax":"Grachten Arena","psv":"Brabantia Stadion","feye":"Rotterdam Stadion","az":"Alkmaar Stadion",/* [6.74.0 QA-P0] */
  "ben":"Estádio Lisboa","por":"Estádio Azul","spo":"Estádio Leonino",
  "gal":"Istanbul Stadium","fenk":"Kadıköy Stadyumu","bes":"Kartal Park",
  "club":"Fiandria Stadion","and":"Bruxella Park","gent":"Gent Arena","std":"Stade des Ardennes",/* [6.74.0 QA-P0] */
};
// Sprint C — per-club stadium style: 0=standard 1=modern dark 2=compact bowl 3=traditional
const CLUB_STADIUM_STYLE={
  "juve":1,"tot":1,"mcy":1,"bay":1,"atm":1,"ars":1,"rbl":1,"ben":1,"whu":1,"bha":1,"b04":1,
  "bol":2,"lec":2,"par":2,"bou":2,"az":2,"lei":2,"heer":2,
  "inter":3,"milan":3,"bar":3,"rma":3,"bvb":3,"mun":3,"liv":3,"por":3,"psg":3,"feye":3,
};
function getStadiumStyle(club){
  if(club?.isU18)return 0;
  return CLUB_STADIUM_STYLE[club?.id]||0;
}
function getStadiumName(club){
  // [7.0.1 collaudo PO «lo stadio della Salernitana Primavera non è rispettato»] via il pick(STADIUMS) CASUALE
  //   per gli U18: l'id è ereditato dal club madre → CLUB_STADIUMS risolve lo stadio VERO (es. Stadio Salernum);
  //   id ignoti cadono sul pool seedato (stabile). Il suffisso «· Campo Primavera» lo aggiunge stadiumConfigFor.
  if(club?.lg==="Nazionale")return "Stadio Nazionale"+(club?.n?" — "+club.n:"");// nazionale: stadio nazionale (non un impianto di club)
  if(club?.id&&CLUB_STADIUMS[club.id])return CLUB_STADIUMS[club.id];
  // [7.0.3 collaudo PO «molte squadre hanno lo stadio "Elefante (A,B,C)"»] via il pool CONDIVISO via hash
  //   (16-20 nomi per ~190 club ⇒ decine di squadre con lo stesso «Stadio dell'Elefante B»): il nome deriva
  //   dall'IDENTITÀ del club (toponimo del nome + prefisso della nazione) → unico, stabile e con una logica.
  const _base=(club?.n||club?.name||"Cittadino").replace(/^(FC|AC|AT|CF|SC|AS|US)\s+/,"").replace(/\s+(Primavera|U18)$/,"");
  const _nat=club?.nat||"";
  if(_nat==="🇮🇹")return "Stadio "+_base;
  if(_nat==="🇪🇸")return "Estadio "+_base;
  if(_nat==="🇫🇷")return "Stade "+_base;
  if(_nat==="🇵🇹")return "Estádio "+_base;
  if(_nat==="🇩🇪"||_nat==="🇳🇱"||_nat==="🇧🇪")return _base+" Stadion";
  if(_nat==="🇹🇷")return _base+" Stadyumu";
  return _base+" Stadium";
}
const NATIONS=["Italia","Spagna","Francia","Germania","Inghilterra","Portogallo","Brasile","Argentina","Olanda","Belgio"];
const SAVE_KEY="cpm-v3";
const FORMATION_HOME=[[5,50],[22,15],[22,35],[22,65],[22,85],[40,25],[40,50],[40,75],[60,20],[65,50],[60,80]];
const FORMATION_AWAY=[[95,50],[78,15],[78,35],[78,65],[78,85],[62,25],[62,50],[62,75],[45,20],[40,50],[45,80]];

/* ========================================
   HELPERS
======================================== */
// [5.94.0 ARC-1b] stream RNG interno SEEDABILE (attivo SOLO sotto ?cpmtest=1, mai nella store build):
//   stessa formula mulberry32 e stessa derivazione del seed del vecchio patch globale → a parità di
//   __CPM_RESEED(n) i valori di rng/pick sono IDENTICI (golden invariata sui campi storici).
//   In produzione _cpmTestRand resta null → puro Math.random.
let _cpmTestRand=null;
const _cpmRnd=()=>_cpmTestRand?_cpmTestRand():Math.random();
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD&&/[?&]cpmtest=1\b/.test((window.location&&window.location.search)||"")){
  const _mkTR=(seed)=>{let s0=seed>>>0;return function(){s0=(s0+0x6D2B79F5)|0;var t=Math.imul(s0^(s0>>>15),1|s0);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};};
  _cpmTestRand=_mkTR(0x9e3779b9);
  window.__CPM_RESEED=function(n){_cpmTestRand=_mkTR((0x9e3779b9^Math.imul((n>>>0)+1,0x6D2B79F5))>>>0);};
  if(window.__CPM_RESEED_PENDING!=null){window.__CPM_RESEED(window.__CPM_RESEED_PENDING);try{delete window.__CPM_RESEED_PENDING;}catch(_e){}}
}
const rng=(a,b)=>Math.floor(_cpmRnd()*(b-a+1))+a;
const rngF=(a,b)=>_cpmRnd()*(b-a)+a;// [7.8.28 QA] rng è un generatore di INTERI (b-a+1): chiamato con bound frazionari (jitter wage ±10%) produceva valori FUORI range — rng(-0.1,0.1)→{−0.1,+0.9}: ~17% delle offerte con stipendio ×1.9. rngF è il float uniforme corretto per i jitter frazionari.
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
// Sprint POP — crescita popolarità realistica: rendimenti decrescenti + freno inizio carriera.
// I guadagni positivi vengono attenuati in base a popolarità attuale, partite in carriera e stagione.
// Le penalità (valori <=0) restano piene, così le scelte sbagliate pesano sempre.
function popGain(p,amt){
  if(!amt||amt<=0)return amt||0;
  const cur=p.popularity||20;
  const tm=p.totalMatches||0,seas=p.season||1;
  // freno inizio carriera: ~0.40 alla prima stagione, sale verso 1.0 con esperienza (~5 stagioni / 100+ match)
  const career=Math.min(1,0.40+tm/130+(seas-1)*0.09);
  // rendimenti decrescenti: superare 65/80/90 è progressivamente più difficile — i top sono pochi
  const dim=cur<50?1:cur<65?0.68:cur<80?0.42:cur<90?0.24:0.12;
  return Math.max(1,Math.round(amt*career*dim));
}
const pick=arr=>arr[Math.floor(_cpmRnd()*arr.length)];
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=rng(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
/* [7.489.0] il selettore pesato accetta un GENERATORE INIETTATO: e' il punto in cui la cronaca smette
   di essere irriproducibile. Senza argomento resta il comportamento di prima (nessun altro chiamante
   cambia). */
const wPick=(evts,rnd)=>{const tot=evts.reduce((s,e)=>s+(e.w||1),0);let r=(rnd?rnd():_cpmRnd())*tot;for(const e of evts){r-=(e.w||1);if(r<=0)return e;}return evts[0];};
function baseStats(archetype){
  const b={velocità:rng(55,72),tecnica:rng(54,70),fisico:rng(50,68),mentalità:rng(50,68),tiro:rng(60,74),passaggio:rng(48,65),dribbling:rng(55,72),posizionamento:rng(55,70)};
  const arc=ARCHETYPES.find(a=>a.id===(archetype?.id||archetype));
  if(arc)Object.entries(arc.bonus).forEach(([k,v])=>{if(b[k]!==undefined)b[k]=clamp(b[k]+v,40,90);});
  return Object.fromEntries(Object.entries(b).map(([k,v])=>[k,clamp(v,1,99)]));
}
function calcOvr(s){return Math.min(99,Math.round((s.tiro*2.5+s.tecnica*2+s.velocità*1.5+s.dribbling*1.5+s.posizionamento*1.5+s.mentalità+s.fisico+s.passaggio)/11.5));}
