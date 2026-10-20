/* ========================================================================
 * KORWARD ELITE — frammento n° 07  (dei 21, numerati da 00 a 20)
 * src/07-versione-save-interviste.jsx
 *
 * VERSIONE · SALVATAGGIO · EUROPEI · INTERVISTE
 *
 * GAME_VERSION e il diario di versione, SAVE_VERSION e la migrazione dei salvataggi,
 * l’ordine/etichette dei turni europei, EVENT_SCOPE, DONATION_URL, APP_ENV e la
 * tabella INTERVIEW_QS con i toni di risposta.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 4858-6380   ·   1523 righe di 41427
 * La prima riga dopo questa intestazione è la riga 4858 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 4834 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* [7.999.53 collaudo PO «nel diario c'e' solo l'ultima stagione»] Il diario teneva le ULTIME 80 voci: con decine di voci a stagione
   (strisce, serie in gol, verifiche) dopo pochi mesi le stagioni vecchie sparivano. Ora il tetto e' 400 e, quando lo si supera,
   si sfoltiscono PRIMA le voci minori delle stagioni vecchie (oltre la precedente); trofei, premi, record, esordi e addii restano. */
const DIARY_CAP=400;
/* [7.999.54 censimento riquadri] i ricordi della carriera (worldMemory) erano tagliati a 40: le prime stagioni sparivano. */
const WORLD_MEM_CAP=200;
const _DIARY_MINORI=new Set(["milestone","story","vita","cup","euro_group","euro","euro_mondiale","mvp_mese","int","pledge","persgoal","national","league"]);
function capDiary(a){try{if(!Array.isArray(a)||a.length<=DIARY_CAP)return a;
  const cur=a.reduce((m,e)=>Math.max(m,(e&&e.season)|0),0);
  let r=a.filter(e=>!e||((e.season|0)>=cur-1)||!_DIARY_MINORI.has(e.type));
  return r.length>DIARY_CAP?r.slice(-DIARY_CAP):r;}catch(_e){return Array.isArray(a)?a.slice(-DIARY_CAP):a;}}
const GAME_VERSION="7.999.176";/* [7.999.176] Fase di stabilita. Giro 77: guardiani instabili riparati nello strumento (nazionale-155, tempo-138, apertura-261, nomi-219 robusto ai crash) e chiavi oggetto doppie tolte. Giro 79 dai collaudi 175: scheda del mister «Rigore per loro» solo sui rigori avversari (__CPM_NO_RIG79, rigore-79), voto delle testate = voto della pagella (__CPM_NO_VOTO79), via la memoria «Enfant prodige» senza tratto (__CPM_NO_ENFANT79), «Livello N/3» dell Ufficio su una riga a 360 px (__CPM_NO_LIV79), guardiano 284f non cieco. */ /* prec.: *//* [7.999.175] Decisioni PO 19/10 sera su PO-098/PO-190: giro 75 stile unico Finalizzatore per tutti (via la scelta dello stile e il tratto Enfant, migrazione additiva dei salvataggi, rosso __CPM_NO_STILEUNICO75) e pagella = risultato registrato per i gol dell eroe; giro 78 curva di difficolta PO-156 ritarata sul solo Finalizzatore (difficolta-156 a uno stile, 20/20 x2). */ /* prec.: *//* [7.999.174] Blocco B (19/10): giri 62 salvataggi ed errori (PO-167, PO-168 gestore errori), 65 Nazionale per finestre e CT (PO-155), 66+71 impulsi con memoria, seguiti spenti al trasferimento (PO-154, PO-224), 67+69 stili dell eroe e curva di difficolta per fase (PO-098, PO-156), 70 acquisti e investimenti concreti (PO-281, PO-157), 72 correzioni dai collaudi 172/173 (fra le linee, pallone PO-278, barra 360, PO-171), 73 taccuino 173 (PO-282 tappeto, PO-283 stacco, PO-284 battitore d angolo), 76 cadenza dello scatto CGTrader guidata dalla fase del passo (piedi-252, soglia 0,40). Non entrano: giro 74 (quota PO-190, chiusa dal PO), giro 75 stile unico e via l Enfant (7.999.175). */ /* prec.: *//* [7.999.173] Blocco A (19/10): giri 60 esiti e gesti (PO-218, PO-143 stacco difensivo), 61 regia highlight (avvicinamento, eroe in quadro «fra le linee», PO-252), 63 prestazioni e pulizia (PO-180, PO-023 guardiano render, PO-171 ritratto CH38 morto, PO-072 DT-01 su src/07), 64 grafica (PO-276 campi vuoti, PO-071 tipologia e cartelloni, palco PO-002/137), 68 schermate (PO-066, PO-267, mappa PO-205). */ /* prec.: *//* [7.999.172] Lotto L1-bis (18/10): giri 50 guardiani PO-271 e testa-76, 51 rinnovo/badge/testi (PO-268/269/270/272), 52 schede del finale (PO-226 spenta per decisione), 53 highlight PO-273/274/275, 54 ingresso dal tunnel PO-277, 55 pallone PO-278, 56 statistiche PO-279, 57 esito della scelta PO-280, 58 pallino 2D/pillola/walkout-fermi-197, 35 ritaratura passaggi. */ /* prec.: *//* [7.999.171] Mega rilascio del 16/10 (decisione PO: chiusura di L1 + stadi e grafica correlata). Giro 22: PO-252 sei difetti degli highlight (piedi, pallone in rete, difesa, rinvio, portiere, cross aereo). Giro 31: PO-220 chiusure difensive (contatto 5,1→1,8 u, non-arrivo 88%→9%). Giro 34: nomi-219 misurato stabile. Giro 36: PO-262 determinismo (punto di partenza seedato nelle scene a movimento bloccato, match-sequence 3/3 verde). Giri 33+37 (eccezione zona G): PO-222 squalificato/non convocato senza presenza su Simula, PO-223 resa dell investimento legata a puntata e scelta, PO-263/264/265. Giro 39: PO-171 via il CH38 dal caricamento (−4,08 MB a ogni avvio). Giro 40: PO-261 prima apertura, PO-258 portiere sulla punizione. Giro 41: esiti PO-218/240/250. Giro 42: PO-252 residui. Giro 43: PO-143 cross, PO-266 cronaca. Giro 44: PO-226/246/260 schede del mister mai sopra highlight e cerimonia, schede-246 riparato. Giro 45: PO-022/068 motore unico e gesti. Giro 46: PO-071 tipologie di stadio, pubblico, cartelloni, ingresso. Giro 47: PO-137/002 cerimonie, il capitano passa la coppa. Giro 48: PO-061 maglie 3D. Unione: PO-267 Crediti senza «Non posso confermarlo». Rapporti docs/sviluppo/RAPPORTO-giro22,31,33,34,36,37,39..48.md. Non entra: giro 35 (ripartenza ristretta e passaggi, non consegnato). */ /* storia: /* [7.999.170] Decisione PO 15/10 «Subito senza il 22». Giro 23: PO-245 ingresso a passo di camminata (ingresso-camminata-245), coppa e prestito (coppa-prestito-245, eccezione zona G), PO-247 avviso premi dopo l intervista (toast-intervista-247), PO-251 oro da festa (festa-oro-251). Giro 24: PO-253 «Il confronto» del procuratore nella finestra standard (procuratore-253). Giro 25/25b: PO-254 Crediti col pulsante del kit in home e le fonti di CREDITI-fonti.md (crediti-254). Giro 26: PO-255 badge d avvio solo «v x.y.z», PO-256 toast mai sopra un Modal aperto (badge-255, toast-256). Giro 27: taccuino 169 (PO-207 ripartenza dal centro dopo rigore e punizione, PO-257 provocazione che libera la scena). Giro 28: PO-259 schede del mister «poche ma decisive» (schede-259). Giro 29 (L3): copia di riserva automatica degli slot e avviso se il salvataggio fallisce (backup-167). Giro 30: PO-217 analisi pre-partita nel giornale, PO-066 riquadri della home. Rapporti docs/sviluppo/RAPPORTO-giro23..30.md. */ /* storia: /* [7.999.169] Contiene la 7.999.168 mai pubblicata (PO-249: niente scritta fps al giocatore, guardiano fps-249) e i giri 16-20. Giro 16: PO-228 ritaratura delle statistiche di partita e PO-220 chiusure difensive (difesa-220-scena). Giro 17: PO-022 scene generate dal motore, PO-068 gesti, PO-123/143 (catalogo-022, pressing-143). Giro 18: PO-207 ripartenza dal centro dopo il gol nato in scena (ripartenza-207 verde, niente piu' deroga), nomi-219 riparato, PO-226 scelta della scheda al battito sotto autoplay. Giro 19: PO-242 riquadro coerente su «Conduci palla al piede e tira», PO-243 intervista dopo la Nazionale, PO-244 giornale, PO-245 ingresso, PO-246 scheda del mister, PO-247 minori. Giro 20: PO-238 brusio di folla generato da noi (fonte certa), PO-241 attesa dei corpi senza «Caricamento giocatori». Rapporti docs/sviluppo/RAPPORTO-giro16..20.md. */ /* storia: /* [7.999.167] Integrati i giri 13, 14, 15 sopra la 7.999.166. (1) Giro 13, bloccante c / CL194, decisione PO 14/10 «Sì, ripara i salvataggi» (eccezione zona G solo per questo difetto): la classifica sbilanciata dal difetto CL194 si rimette in pari al caricamento (guardiano migrazione-194, rosso __CPM_NO_MIG194). (2) Giro 14: PO-234 schede in partita con tre indicazioni e lessico «indicazioni» (schede-234); PO-235 convocazione della Nazionale nel kit (convocazione-235); PO-236 bambini dell ingresso per entrambe le squadre (bambini-236). (3) Giro 15: PO-237 pre-caricamento dei corpi per la prima partita (prima-partita-237); PO-238 Crediti nella home (crediti-238; fonti da completare dal PO). Rapporti docs/sviluppo/RAPPORTO-giro13/14/15.md. */ /* storia: /* [7.999.166] (1) PO-229 giro 12: il lato del portiere sul tiro al palo si decide dal passaggio vero del pallone anche a pochi fotogrammi (gk-miss-229 braccio palo a CPU lenta; rosso __CPM_NO_GK229L). (2) PO-239: il riquadrino sopra la scena mostra solo gli fps, non più «CGTrader · N corpi» (rosso __CPM_NO_HUD239). (3) PO-240: «Sfiora il vantaggio» non esce più fra le frasi del riquadro di fine scena, che non conosce il punteggio (taccuino PO: sul 3-0); resta nella cronaca col contesto «pari» (rosso __CPM_NO_VANT240). */ /* storia: /* [7.999.165 PO-233, foto PO 14/10] Calendario · Prossime partite: la partita della Nazionale mostrava «1489ª giornata» (codice interno 1470 + settimana 19); ora mostra la competizione («Amichevole Internazionale»). Guardiano giornata-233, rosso __CPM_NO_GIORN233. */ /* storia: /* [7.999.164, giro 11 sviluppatrice, sottoinsieme 17/10] (1) PO-218 caso cross: riquadro, motore e 3D dicono lo stesso esito sul cross sbagliato (8 azioni-cross col lessico del tiro, presa del portiere registrata come intercetto, cross fuori misura come spazzata, cross da punizione come tiro dell eroe, pallone «fuori» che si assestava in area): guardiano cross-218 verde 0/40, 0/200, x 46,8; rosso __CPM_NO_CROSS218 24, 95/200, x 39,0. (2) PO-209/PO-211: l intervista post partita mostra il club con cui si e' giocato, non quello di partenza dopo un cambio di squadra; guardiano testata-209, rosso __CPM_NO_TESTA209. Rapporto docs/sviluppo/RAPPORTO-giro11.md. */ /* storia: /* [7.999.163, decisione PO 13/10 pomeriggio «integrala la PO-226»] PO-226 primo passo (voce qui sotto) sopra la 7.999.162. Guardiano tempo-138: il braccio rosso spegne anche il seme e le interazioni nuove, che coprono il difetto (verde 2/2 sulla 162). */ /* storia: /* [7.999.162 PO-229 — voce aggiunta, stesso numero] IL PORTIERE SUI TIRI SBAGLIATI. Taccuino PO 13/10 (7.999.160): «Volée di collo potente» e «Girata secca e tiro» finite fuori → «codice 111 — portiere fuori tempo», «il portiere non si tuffa nel momento giusto». MISURATO in tempo di scena (sonda nuova gk-miss-229, testimone __CPM_GK229, pagina fresca per scena, volée/tiro al volo/girata, esiti fuori e palo): sul tiro FUORI il portiere restava FERMO 5 volte su 5 anche con il pallone che gli passava a 0,2-2,9u e a quota 0,2-2,5 (l'arco del tiro fuori muore davanti alla porta e solo dopo il pallone scivola oltre il palo); sul PALO il tuffo partiva al calcio e arrivava disteso all'arrivo, ma corto (55% della distanza). Ora (src/12, fireConclusion) sul tiro che esce di poco (arco entro 1,5u dal palo) o che gli passa a portata (entro 4,5u sul suo piano) il portiere reagisce verso il punto in cui il pallone attraversa il suo piano: tuffo all'80% della distanza, oppure riflesso col corpo (gk_block) se il pallone gli arriva addosso (entro 1,2u); sul tiro largo lo guarda uscire. La distesa resta sincronizzata all'arco (7.465): il corpo parte al calcio (+0,05/+0,10 s). Dopo, GLB spento: 10 reazioni su 10, il corpo parte da 0,26 a 0,59 s di scena PRIMA che il pallone lo superi (mediana 0,44); GLB acceso (volee, girata, tiro al volo): 6 su 6, mediana 0,47 s prima. Il rosso finale resta rosso (3 portieri fermi su 7 scene giudicabili; i tiri a bruciapelo, pallone sul portiere entro 0,20 s dal calcio, non si giudicano). Un tuffo armato a pallone gia' passato su un tiro sbagliato si annulla (contatore __CPM_GK229TARDI, mai visto scattare nelle misure). Rosso __CPM_NO_GK229M. [v2, rosso del coordinatore sulla build combinata: «alvolo gi6 post: gk_block dalla parte opposta al pallone», 2 corse su 2] il riflesso col corpo partiva al caricamento verso la z stimata con l'arco lineare e lo scatto di 0,19 s si chiudeva prima del calcio; l'arco non e' lineare e sui palloni vicini la stima sbagliava lato. Ora quel riflesso aspetta il calcio e rimira a ogni fotogramma il punto di passaggio estrapolando la velocita' vera del pallone. Sonda: il verso si giudica solo sui tiri che arrivano da davanti al portiere (sui tiri dal fondo il pallone passa da entrambi i lati: dichiarato non giudicabile). Misurato: gk-miss-229 verde 2 volte di fila su pagina fresca (partenza del corpo mediana 0,34 e 0,54 s prima del passaggio), gk-dive-sync PASS (anticipo mediano -0,05 s), goal-postarc PASS. Codice 007 (camera che salta): un passo isolato di 5,0-5,3u a 170-250 u/s di scena su girata e volée gi88 (2 scene su 40), fuori dagli stacchi; causa non attribuita con una misura: annotato, non toccato. *//* [7.999.162] (1) Bloccante a (seme, sviluppatrice giro 9): Bloccante a (SEME-a): stesso salvataggio e stesso seme davano partite diverse, perche' al motore del possesso arrivavano valori del tempo reale. Ora alla ripresa dopo una scena riceve un punto logico (x seedata, corsia ereditata dal SUO pallone, eroe fotografato a chiusura scena; nelle scene senza highlight l'eroe del motore), il debito di sotto-tick del minuto si paga prima delle richieste del battito, il sotto-tick porta il minuto dell'ultimo battito e un riavvio del metronomo in gioco fluido non butta piu' i fatti del motore in coda. Misurato S12, semi 2311/4242/777: primo ingresso divergente fra il 6' e il 38' prima, nessuno dopo. Guardiano seme-a (rosso __CPM_NO_SEME). Guardiano seme-a, rosso __CPM_NO_SEME. (2) PO-232 («gli highlights devono partire sempre con i GLB on di CGTrader caricati totalmente, mai in T-Pose o senza testa»): la scena dell eroe parte solo coi corpi pronti (CH38 agganciato, corpi CGTrader montati e compilati, teste caricate, clip attiva), cronometro fermo fino a 8 s con «Caricamento giocatori…»; la testa CGTrader cambia texture solo a immagine caricata (prima spariva per tutto il download). Guardiano glb-pronti-232 con rete lenta: verde 0/6 scene non pronte, rosso __CPM_NO_GLB232 4/6. (3) PO-230, decisione PO 13/10 «la finestra standard e' il Modal del gioco» (foto PO sulla 7.999.160: «La tua storia» in finestra col titolo della fisarmonica, la freccia e «LA TUA STORIA» ripetuto dentro): le card della home che passano da _pop224 si smontano e si ridisegnano DENTRO il Modal (ModalPannello + cardInFinestra230): un solo titolo nella testa, niente fisarmonica ne' freccia, niente occhiello ripetuto, pulsanti nel piede. Collaudo 161: intervista con la cornice standard (anche il foglio dal basso), scelta in partita via finestraStd(TH_DARK), elenco premi del Galà a capo invece che tagliato. Guardiano finestra-230 esteso (patto e procuratore), rosso __CPM_NO_MOD230. (4) Bloccante c della prontezza, permesso PO 13/10 «Si', solo per questo difetto» (zona G, CL194): la partita di campionato giocata DAL VIVO passava a updateStandings il NOME dell'avversario (src/18 onMatchEnd, opponentId:result.opponentId||result.opponent; il risultato dal vivo non porta l'id) e sul salvataggio 194 il nome «FC Altoadige Primavera» non coincide con la riga «FC Altoadige»: l'avversario non riceveva il risultato speculare e giocava il riposo contro nessuno (src/09 updateStandings, ramo byeTeam), la somma GF−GS di lega cresceva. Misurato sulla 34a giornata dal vivo (3-1): prima Altoadige 35-55 contro 36-57 ricostruito, GF−GS di lega 3→4; ora 36-57 = ricostruito, 3→3. Si usa l'id della giornata servita. Solo partite future: lo sbilancio +3 gia' nel file resta (nessuna migrazione, tocca dati del giocatore). Rosso __CPM_NO_CL194, guardiano classifica-194. */ /* storia: /* [7.999.161 PO-229] (1) Lo strappo del pallone alla consegna build-up→conclusione: la guardia 7.394 (pallone gia' al piede = consegna avvenuta) valeva solo per la conduzione; ora anche per il DRIBBLING. buildup-sync su gi21: rosso __CPM_NO_DRB229 3,9/4,3u dribble→CONSEGNA, verde 0. (2) PO-224: le finestre aspettano anche l intervista settimanale (a 360 px «La tua storia» finiva sotto «Zona Mista», collaudatrice giro 8); rosso __CPM_NO_IV224, popup-224 verde. (3) Copyright, decisione PO 12/10 «rinomina tutti gli evocativi»: 17 nomi di stadio con simboli o soprannomi di club reali o nomi di stadi veri (Sabaudo, Meneghino, Capitolino, Vesuvio, Phocéen, Blau, der Wand, Cannon, Bridge, Leonino, Kadıköy, Kartal, Princier, Adriatico, Gabriel Montpied, Arena Lviv, Cerámica Vieja) rinominati e aggiunti alla lista del controllo (prova del rosso: Sabaudo segnalato). (4) PO-230: cornice standard unica (finestraStd, dal Modal) per impulsi, momento di carriera, tutorial e scelta in partita; guardiano finestra-230, rosso __CPM_NO_FIN230. (5) PO-231, decisione PO 12/10 «Sempre, dopo ogni partita»: l intervista post partita esce dopo ogni gara (prima 18% da pro dopo una gara normale, 4% in Primavera: «questa volta non e' uscita» non era un guasto). Guardiano intervista-231, rosso __CPM_NO_IV231. (6) PO-228 caso k4 (tabellino 1-0, tabellone 0-0): un gol del motore nato dopo il fischio (minuto 96) entrava nel tabellino e non nel tabellone; al fischio i gol ancora in coda escono dal tabellino e il motore smette di contarli. Guardiano tabellino-228: verde coincide, rosso __CPM_NO_TAB228 scarto di 1 gol. (7) PO-229 gi38 (sviluppatrice, giro 8): il ri-taglio di staging non spegne piu' l uno-due gia' partito (sonda po229-gi38-probe verde 4/4, rosso __CPM_NO_PO229 3/3). (8) L7: la riga stagione·settimana·posto della carriera non va a capo a 360-412 px. (9) PO-229 build-up (PO: «test di qualità/verità degli highlights eroe»): il pallone non salta piu' al cambio di beat (lucchetto del gol della scena precedente, blocchi post-arco 87/92/93 attivi durante la costruzione, _int10 non azzerato, colla di conduzione) e chi lo porta lo accompagna; buildup-sync da rosso 9/36 a verde, rosso __CPM_NO_BU229. */ /* storia: /* [7.999.160 PO-224 e copyright] (1) «Il mondo fuori» e «Il conto delle parole» in finestra in primo piano (_pop224); in finestra la fisarmonica parte aperta (un tocco solo, rosso __CPM_NO_POPAP224). (2) Nomi reali fra i rivali rinominati (Kylian, Bukayo, Erling, Vinicius, Pedri, Saka, Bellingham) e aggiunti alla lista del controllo copyright, che ora scansiona anche RIVAL_FIRST/RIVAL_LAST (prova del rosso: «Kylian» trovato). (3) «Sostieni il gioco» diventa «Sostieni il progetto». (5) PO-229: sul gol la finestra d esito aspetta la conclusione in TEMPO DI SCENA (6 s di scena, tetto 30 s reali): a 4-7 fps il gol era dichiarato con la palla ferma a x 24-40 (goal-postarc 4/6 classe C → 0/8; rosso __CPM_NO_CK229 1/4). Sonde riparate: gk-dive-sync (anticipo in tempo di scena, parata forzata, tuffo finito prima dell arrivo giudicato: verde mediana -0,07 s, rosso __CPM_NO465 3/4), goal-postarc/outcome-not-goal/delivery-arrival (__CPM_ACTSO: __CPM_ACTS era ridefinito con le sole etichette), salto automatico di hl_move; gk-dive-sync e goal-postarc in catena. (6) PO-227: nella fila dell ingresso i bambini corrono da fermi solo se il loro giocatore cammina (peso della corsa dalla velocita smussata, era fisso a 1): fila-227 verde 0/4110 letture da fermi con corsa, rosso __CPM_NO_FILA227 4132/4132. (4) PO-218: «Conduci palla al piede e tira» fallita si racconta da tiro, non da dribbling (collaudatrice 2: murato raccontato «Palla persa nel dribbling»); guardiano lessico-218 esteso, verde 0/12 rosso 12/12 (__CPM_NO_C70TIRO). */ /* storia: /* [7.999.159 PO-218 e PO-221] (1) Fuorigioco contro intercetto: con la chiave intercept il racconto segue il motore (rosso __CPM_NO_FG218). (2) Un tiro fermato si racconta da tiro, non da passaggio: 138 azioni-tiro su 138 avevano il lessico di passaggio; guardiano lessico-218, rosso __CPM_NO_LEX218. (3) Resa dei tiri delle scene 1,4 → 1,8 (gol dell'eroe 0,50 su 60 partite, sotto 0,6-0,9). (4) La punizione aperta da una scena normale conta nel tetto «1 a partita». (5) PO-224: finestre anche per La tua storia, scelte narrative, esonero e procuratore; la finestra aspetta sotto un dialogo bloccante (popup-224). (6) Copyright (sviluppatrice, giro 6): 14 derby e 16 club con nome reale rinominati, migration dei nomi salvati, blocklist allargata. (7) PO-220: slancio difensivo 5,2 → 7,5u, degrado a pressing oltre 8u (rosso __CPM_NO_PUSH220). *//* [7.999.158 PO-221 parte 2, PO-224, PO-225, decisioni PO 10-11/10] (1) La punizione respinta dal tetto «1 a partita» non diventa piu' l'occasione corrente (prima la scena successiva si apriva comunque come punizione: 27 su 16 partite contro 14 dal ramo col tetto). Rosso __CPM_NO_PZTOT221. (2) I riquadri della home che chiedono una scelta (patto col mister, spogliatoio) compaiono come finestra, uno alla volta; guardiano popup-224, rosso __CPM_NO_POP224. (3) La grafica TV pre-partita esce in dissolvenza dopo 4 s dell'ingresso in campo; rosso __CPM_NO_TV225. (4) Tetto di 7 scene a partita, rigori esclusi (decisione PO 11/10); rosso __CPM_NO_TETTO7. Contiene la 7.999.157 (non promossa da sola: scene-221 rosso a 9,0 scene). *//* [7.999.157 PO-221 assist + PO-154 varco di collaudo, decisioni PO 10/10] (1) Dopo il passaggio riuscito di un assist il compagno conclude in posizione da gol (almeno 88 di avanzamento, quasi centrale) invece che 10 piu' avanti dell'eroe: misurato su 7.999.156 il compagno segnava 2 volte su 34 e gli assist erano 0,08 a partita. Rosso __CPM_NO_POS221. (2) Varco di solo collaudo __CPM_CAREER.apriImpulso(id): apre il pop-up di un impulso preciso del catalogo con le sue scelte vere, per misurare le 221 scelte (PO-154). Non cambia il gioco; zona G ferma. Rosso __CPM_NO_APRIIMP157. */
/* [giro 63 PO-072 DT-01] Le note di versione 7.4xx-7.999.x che stavano qui (433 righe di soli commenti, 799 KB) sono in docs/archivio/note-versione-src07.md. */
const SAVE_VERSION=9;// v9 [7.6.0 FASE 2]: clubEvo (evoluzione pluriennale del club: fanbase/stadiumTier/budget/seasonsTop-Low) — migration retro-compatibile. v8 [5.81.0 BIL-3b]: bankBalance (stipendio accumulato, €) + perkTrainer/perkNutrition (staff personale) — migration retro-compatibile. v7: player.foot
// 5.67.0 — TABELLONE realistico del torneo per NAZIONALI (Europeo/Mondiale): dopo il girone la fase a
//   eliminazione segue Ottavi → Quarti → Semifinale → Finale (prima saltava dritta alla semifinale).
//   Ordine + etichette condivisi tra il gestore d'esito e la UI così round/label restano coerenti.
const EM_KO_ORDER=["r16","quarti","semi","final"];
const EM_KO_LABEL={r16:"Ottavi",quarti:"Quarti",semi:"Semifinale",final:"Finale"};
// 5.71.0 — COERENZA DATASET: mappa canonica evento(diary/worldMemory type)→CONTESTO. Sorgente unica di verità.
//   Ogni schermata SPECIFICA di un contesto (Nazionale, ecc.) filtra per scope invece di elencare i type a mano
//   → niente contaminazione (es. la Coppa Nazionale, evento di CLUB, non compare più tra i momenti in Nazionale)
//   e default sicuro: un nuovo type non mappato NON finisce mai in una schermata di contesto sbagliato.
//   Le viste "carriera intera" (diario completo, hall of fame) restano volutamente senza filtro.
const EVENT_SCOPE={
  // CLUB / LEGA / COPPA NAZIONALE / derby — dominio del CLUB (mai nella schermata Nazionale)
  first_goal:"club", hattrick:"club", milestone:"club", mvp_mese:"club", cup_trophy:"club",
  record_club:"club", derby_win:"club", ex_club:"club",
  league_top_scorer:"league", league_mvp:"league", team_of_year:"league", record:"league",
  pallone_oro:"award", scarpa_oro:"award",
  // NAZIONALE / INTERNAZIONALE — SOLO questi nella schermata Nazionale
  first_national:"national", first_national_goal:"national", national_debut:"national", national_goal:"national",
  euro_mondiale:"international", euro_mondiale_trophy:"international", nations_cup:"international",
  career_moment:"generic",
};
const _NATIONAL_SCOPES=new Set(["national","international"]);
function isNationalEvent(type){return _NATIONAL_SCOPES.has(EVENT_SCOPE[type]);}// true solo per eventi di NAZIONALE/torneo internazionale
// Roadmap Play Store 1.6b — DONAZIONE ESTERNA PURA: link a un provider esterno (Ko-fi/PayPal/Buy Me a Coffee),
//   aperto nel browser di sistema. NESSUNA ricompensa in-app → resta fuori da Google Play Billing (regola Play) e
//   il Data Safety resta "nessun dato". Imposta l'URL del tuo provider; se VUOTO il bottone NON appare (ship-safe).
const DONATION_URL="https://paypal.me/elevoraCPM";// link donazione esterna (PayPal); "" per nasconderlo
const openDonation=()=>{try{if(!DONATION_URL)return;window.open(DONATION_URL,"_blank","noopener,noreferrer");}catch(e){}};
// #6: indirizzo feedback OFFUSCATO (non in chiaro nel sorgente) — ricomposto a runtime dai char-code → niente scraping banale
const _feedbackTo=()=>String.fromCharCode(107,111,114,119,97,114,100,46,100,101,118,116,101,97,109,64,103,109,97,105,108,46,99,111,109);/* [21/09 · direttiva PO: «la mail delle idee non deve essere inviata piu' alla mia mail, ma a korward.devteam@gmail.com»] La casella personale del PO esce dal gioco. Resta l'offuscamento in codici di carattere: e' li' perche' un indirizzo scritto in chiaro dentro una pagina pubblica viene raccolto dai raccoglitori di spam, e la casella nuova merita la stessa protezione della vecchia. */
const openFeedback=()=>{try{const to=_feedbackTo();const s=encodeURIComponent("💡 Idee & Feedback — Korward Elite");
  const b=encodeURIComponent("Ciao! Ecco la mia idea / il mio feedback per Korward Elite:\n\n\n— (scrivi qui) —\n\nGrazie!");
  window.open("mailto:"+to+"?subject="+s+"&body="+b,"_blank");}catch(e){}};
// Sprint ENV — ambiente rilevato automaticamente dal runtime (non gestito manualmente).
// PRODUCTION = deploy GitHub Pages (*.github.io). Tutto il resto (staging githack, locale, localhost) = TEST.
const APP_ENV=(()=>{try{const h=(location.hostname||"").toLowerCase();if(h.endsWith("github.io"))return"PRODUCTION";return"TEST";}catch(e){return"TEST";}})();
// Sprint 15 — Interview system with consequences (200+ questions)
// [7.8.11 collaudo tester] UNICA sorgente per le etichette del tono di risposta: prima il BOTTONE (Sprint 120)
//   mappava umile→"🎯 Critico" mentre il FEEDBACK post-scelta mappava umile→"🙏 Umile" (stesso tono, due nomi
//   diversi → «scelgo "critico" ma mi scrive "umile"»). Un solo dizionario usato da entrambi i punti di render.
const IV_TONE_LBL={diplomatico:"🤝 Diplomatico",diretto:"🔥 Ambizioso",umile:"🙏 Umile"};
const IV_TONE_COL={diplomatico:"#2563eb",diretto:"#f97316",umile:"#7c3aed"};
/* [7.994.0 INTERVISTA «scarna» - scelte PO: contesto partita, conseguenze visibili, sala viva, domanda di rilancio]
   IL RILANCIO: il giornalista incalza sulla risposta appena data. Una sola domanda in piu', scelta dal TONO della
   prima risposta (incalza chi e' stato ambizioso, apre chi e' stato umile, stana chi e' stato diplomatico), in modo
   deterministico dal testo della prima domanda: stessa intervista, stesso rilancio. Effetti piu' piccoli della
   prima risposta (e' un seguito, non una seconda intervista). «No comment» esiste e costa: popolarita' -2, il
   giornalista se lo ricorda (fiducia -3), il mister apprezza la riservatezza (+1).
   LA PRIMA PAGINA: dopo la seconda risposta, il titolo di domani della testata del giornalista. Il titolo dipende
   dal tono della PRIMA risposta e dal risultato; gli effetti si mostrano solo ORA, a scelta fatta (direttiva PO
   6.5.4: l'esito non deve condizionare la risposta). */
IV_TONE_LBL.nocomment="🤐 No comment";IV_TONE_COL.nocomment="#64748b";
const IV_NOCOMMENT24={tone:"nocomment",txt:"Su questo preferisco non rispondere.",ef:{p:-2,t:1}};
const RILANCIO24={
  diretto:[
    {q:"Non hai paura di esporti. Il tuo allenatore apprezza questa franchezza?",a:[
      {tone:"diretto",txt:"Me l'ha chiesto lui: vuole giocatori che ci mettono la faccia.",ef:{m:2,p:2,t:-1}},
      {tone:"diplomatico",txt:"Ne parliamo spesso. Il rapporto è sincero, in tutte e due le direzioni.",ef:{m:1,p:1,t:2}},
      {tone:"umile",txt:"Spero di sì. Se esagero, sarà lui il primo a dirmelo.",ef:{m:1,p:0,t:2}}]},
    {q:"Detto così sembra una sfida ai prossimi avversari. È un messaggio per loro?",a:[
      {tone:"diretto",txt:"È un messaggio per tutti: noi ci siamo.",ef:{m:2,p:3,t:-1}},
      {tone:"diplomatico",txt:"Nessun messaggio: rispetto per tutti, paura di nessuno.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"No, è un messaggio per me stesso. Devo alzare il livello.",ef:{m:1,p:1,t:1}}]},
    {q:"Se dovessi dare un voto alla tua partita di oggi, quale sarebbe?",a:[
      {tone:"diretto",txt:"Più alto di quello che mi darete voi, come sempre.",ef:{m:2,p:2,t:-1}},
      {tone:"diplomatico",txt:"Il voto lo lascio a voi. Io guardo cosa migliorare.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Sufficiente, niente di più. Posso fare meglio.",ef:{m:1,p:0,t:2}}]},
    {q:"Parole forti. Se la prossima va male, te ne assumi la responsabilità?",a:[
      {tone:"diretto",txt:"Sì. Chi parla poi risponde in campo, e io ci sono.",ef:{m:2,p:3,t:-1}},
      {tone:"diplomatico",txt:"La responsabilità è del gruppo, e io ne faccio parte.",ef:{m:1,p:1,t:2}},
      {tone:"umile",txt:"Ho detto quello che penso. Ma adesso conta il lavoro, non le parole.",ef:{m:1,p:1,t:1}}]},
    {q:"Qualcuno nello spogliatoio potrebbe leggerla come una frecciata. Lo era?",a:[
      {tone:"diretto",txt:"Era uno stimolo. Chi vuole vincere lo prende così.",ef:{m:1,p:2,t:-2}},
      {tone:"diplomatico",txt:"No, parlavo di me prima che degli altri.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Se qualcuno l'ha presa male, glielo chiarisco di persona.",ef:{m:1,p:1,t:2}}]}],
  umile:[
    {q:"Parli sempre del gruppo. Ma tu, singolarmente, dove vuoi arrivare?",a:[
      {tone:"diretto",txt:"In alto. Molto in alto. Ma un passo alla volta.",ef:{m:2,p:2,t:0}},
      {tone:"diplomatico",txt:"Dove mi porta il lavoro di ogni giorno.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Voglio diventare un giocatore su cui i compagni possono contare sempre.",ef:{m:1,p:1,t:2}}]},
    {q:"I tifosi però ti considerano già un leader. Come vivi questa responsabilità?",a:[
      {tone:"diretto",txt:"Bene. Mi piace averla, e mi piace portarla.",ef:{m:2,p:2,t:0}},
      {tone:"diplomatico",txt:"Con serenità: la squadra ha tanti leader.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Con gratitudine. E con la voglia di non deluderli.",ef:{m:1,p:1,t:1}}]},
    {q:"C'è un compagno che ti sta aiutando più degli altri in questo periodo?",a:[
      {tone:"diretto",txt:"Più di uno, ma i nomi li tengo per lo spogliatoio.",ef:{m:1,p:1,t:1}},
      {tone:"diplomatico",txt:"Tutti, davvero. Il gruppo è la nostra forza.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"I più esperti: ascoltarli mi fa crescere ogni settimana.",ef:{m:1,p:0,t:2}}]},
    {q:"Sei sempre molto misurato. C'è qualcosa che ti fa arrabbiare davvero?",a:[
      {tone:"diretto",txt:"Perdere. Lo odio, e si vede in allenamento.",ef:{m:2,p:2,t:0}},
      {tone:"diplomatico",txt:"Le cose che non dipendono da me le lascio fuori dal campo.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Più che altro me la prendo con me stesso quando sbaglio.",ef:{m:1,p:1,t:1}}]},
    {q:"Tanta modestia: non temi che ti considerino poco ambizioso?",a:[
      {tone:"diretto",txt:"Le ambizioni le tengo per me, poi le faccio vedere.",ef:{m:2,p:2,t:0}},
      {tone:"diplomatico",txt:"Ambizione e rispetto possono stare insieme.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Preferisco che parlino i fatti, anche se ci mettono di più.",ef:{m:1,p:0,t:2}}]}],
  diplomatico:[
    {q:"Sei molto prudente con le parole. Cosa ti ha insegnato questa prudenza?",a:[
      {tone:"diretto",txt:"Che i fatti fanno più rumore delle frasi fatte.",ef:{m:1,p:2,t:0}},
      {tone:"diplomatico",txt:"A pensare prima di parlare, come in campo prima di passare.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Ad ascoltare. Chi ascolta impara più in fretta.",ef:{m:1,p:0,t:2}}]},
    {q:"Una risposta più personale: cosa ti è piaciuto di te oggi?",a:[
      {tone:"diretto",txt:"La personalità. Ho chiesto la palla anche nei momenti difficili.",ef:{m:2,p:2,t:0}},
      {tone:"diplomatico",txt:"La continuità: ho fatto le cose semplici per novanta minuti.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"L'impegno. Il resto va ancora migliorato.",ef:{m:1,p:0,t:2}}]},
    {q:"E la classifica? Ci pensi, o davvero guardi solo alla prossima partita?",a:[
      {tone:"diretto",txt:"Ci penso eccome: siamo qui per vincere qualcosa.",ef:{m:2,p:2,t:-1}},
      {tone:"diplomatico",txt:"La guardo, ma la classifica si fa una partita alla volta.",ef:{m:1,p:1,t:1}},
      {tone:"umile",txt:"Poco. Se penso troppo avanti, sbaglio la prossima.",ef:{m:1,p:0,t:2}}]},
    {q:"Risposta da manuale. Ma tu, personalmente, cosa ne pensi?",a:[
      {tone:"diretto",txt:"Personalmente? Che possiamo fare molto di più.",ef:{m:1,p:2,t:-1}},
      {tone:"diplomatico",txt:"Penso esattamente quello che ho detto.",ef:{m:0,p:0,t:1}},
      {tone:"umile",txt:"Che io per primo devo dare di più.",ef:{m:1,p:1,t:1}}]},
    {q:"Allora te lo chiedo diversamente: cosa cambieresti da domani?",a:[
      {tone:"diretto",txt:"L'intensità. Nelle ultime partite ce n'è stata poca.",ef:{m:1,p:2,t:-1}},
      {tone:"diplomatico",txt:"Poco: la strada è giusta, serve continuità.",ef:{m:1,p:0,t:1}},
      {tone:"umile",txt:"Il mio contributo in fase di non possesso.",ef:{m:1,p:1,t:2}}]}]};
function hashIv24(s){let h=0;s=String(s||"");for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
function rilancio24(tone,seed){const L=RILANCIO24[tone]||RILANCIO24.diplomatico;const r=L[hashIv24(seed)%L.length];return {q:r.q,a:[...r.a,IV_NOCOMMENT24]};}
const PRIMA24={
  win:{diretto:"{nome}: «Non ci fermiamo qui»",diplomatico:"{nome} divide i meriti: «Vittoria di tutti»",umile:"{nome} vola basso dopo il successo sul {opp}"},
  loss:{diretto:"{nome} non ci sta: «Serve di più da tutti»",diplomatico:"{nome}: «Si riparte insieme»",umile:"{nome} si prende le colpe del ko col {opp}"},
  draw:{diretto:"{nome}: «Un pari che non ci basta»",diplomatico:"{nome}: «Un punto da non buttare»",umile:"{nome}: «Dobbiamo crescere ancora»"},
  altro:{diretto:"{nome} alza la voce",diplomatico:"{nome} misura le parole",umile:"{nome}: «Testa bassa e lavorare»"},
  /* [7.999.135 PO-214] la prima pagina della presentazione al club nuovo */
  presentazione:{diretto:"{nome} si presenta: «Sono qui per vincere»",diplomatico:"{nome}: «Ripagherò la fiducia, un passo alla volta»",umile:"{nome} si presenta in punta di piedi"}};
/* [7.999.135 PO-214] il rilancio della presentazione: domande da primo giorno, non da dopo-partita */
const RIL_PRES214=[
  {q:"Il mister ti ha già detto dove ti vede in campo?",a:[
    {tone:"diretto",txt:"Dove serve, ma sono venuto per giocare titolare.",ef:{m:1,p:1,t:-1}},
    {tone:"diplomatico",txt:"Decide lui: io mi faccio trovare pronto.",ef:{m:1,p:0,t:1}},
    {tone:"umile",txt:"Ovunque: l'importante è dare una mano.",ef:{m:1,p:0,t:2}}]},
  {q:"Cosa dici ai tifosi che ti vedranno per la prima volta domenica?",a:[
    {tone:"diretto",txt:"Di venire allo stadio: ci divertiremo.",ef:{m:1,p:2,t:0}},
    {tone:"diplomatico",txt:"Di sostenerci anche nei momenti difficili.",ef:{m:1,p:1,t:1}},
    {tone:"umile",txt:"Che darò tutto, ogni minuto in campo.",ef:{m:1,p:1,t:1}}]}];
function rilPres214(tone,seed){const r=RIL_PRES214[hashIv24(seed)%RIL_PRES214.length];return {q:r.q,a:[...r.a,IV_NOCOMMENT24]};}
function primaPagina24(tone1,tone2,ctx,nome,opp){const G=PRIMA24[ctx]||PRIMA24.altro;const cog=String(nome||"").trim().split(/\s+/).pop()||"Il campione";
  const t=(G[tone1]||G.diplomatico).replace(/\{nome\}/g,cog).replace(/\{opp\}/g,opp||"l'avversario");
  const sotto=tone2==="nocomment"?"E sul resto, bocca cucita: «Preferisco non rispondere».":tone2==="diretto"?"Poi rilancia: nessun passo indietro.":tone2==="umile"?"E chiude con un messaggio allo spogliatoio.":"Parole pesate, nessuna polemica.";
  return {titolo:t,sotto};}

/* [7.999.77 collaudo PO «Assolutamente falso, non e' la prima vittoria casalinga» — 3-0 IN TRASFERTA]
   «Prima vittoria stagionale casalinga» (pack 3) non aveva condizione e usciva su qualunque vittoria;
   la gemella «Prima vittoria in casa stagionale» ce l'aveva ma leggeva matchHistory, che il luogo NON
   lo registra (nessuna delle sei scritture porta isHome) → «prima» sempre vera. Regola unica: partita
   in CASA e nessun'altra gara di questa stagione giocata in casa e vinta, letta dal CALENDARIO (che il
   luogo e il risultato li ha). Rosso: __CPM_NO_CASA77. */
const _primaCasa77=(p,i)=>{if(!(i&&i.isHome===true))return false;
  if(typeof window!=="undefined"&&window.__CPM_NO_CASA77)return true;
  try{const wk=p.week||1,sn=p.season||1;
    if((p.calendar||[]).some(m=>m&&m.played&&m.isHome&&m.result&&m.result.won&&(m.week||0)!==wk))return false;
    if((p.matchHistory||[]).some(m=>m&&m.isHome===true&&m.won&&(m.season||1)===sn&&(m.week||0)!==wk))return false;
    return true;}catch(e){return false;}};

const INTERVIEW_QS=[
// === POST VITTORIA ===
{ctx:["win"],q:"Grande prestazione oggi! Come descrivi la tua partita?",a:[
  {tone:"diplomatico",txt:"Ho fatto il mio lavoro. Ma il merito è di tutto il gruppo, siamo stati perfetti.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"Ero in serata di grazia. Quando sono così, la squadra ne beneficia. Sono in forma.",ef:{m:9,p:8,t:-4}},
  {tone:"umile",txt:"Potevo fare qualcosa di meglio in alcune fasi, ma il risultato è quello che conta.",ef:{m:3,p:3,t:8}},
]},
{ctx:["win"],q:"Tre punti importanti. Come ti senti adesso?",a:[
  {tone:"diplomatico",txt:"Felice per i compagni. Questo successo è di tutti, staff compreso.",ef:{m:6,p:3,t:5}},
  {tone:"diretto",txt:"Fantastico. Sono in un momento eccezionale e voglio continuare così.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"Contento, ma già con la testa alla prossima partita. Non ci fermiamo.",ef:{m:4,p:4,t:9}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1),/* [7.161.0 super-test A1] mai «il suo gol» con 0 gol */q:"Il tuo gol è stato decisivo. Cosa hai pensato al momento del tiro?",a:[
  {tone:"diplomatico",txt:"Ho pensato solo alla squadra. Segnare è bello ma la vittoria è collettiva.",ef:{m:6,p:5,t:5}},
  {tone:"diretto",txt:"Sapevo di segnare. Ho scelto l'angolo e ho eseguito. Tecnica pura.",ef:{m:11,p:9,t:-5}},
  {tone:"umile",txt:"Istinto. Mi fido del lavoro settimanale in allenamento, poi arriva il gol.",ef:{m:4,p:4,t:8}},
]},
{ctx:["win"],q:"Avete dominato {opp}. È stata la vostra miglior prestazione stagionale?",a:[
  {tone:"diplomatico",txt:"Sì, ma preferisco non fasciarsi la testa. Ogni partita è una storia a sé.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"Direi di sì. Siamo stati superiori in ogni zona del campo. Io in testa.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"Non so, non mi piace fare classifiche. Abbiamo fatto bene oggi, basta.",ef:{m:4,p:3,t:8}},
]},
{ctx:["win"],q:"La vittoria con {opp} vi avvicina agli obiettivi stagionali?",a:[
  {tone:"diplomatico",txt:"Ogni vittoria conta. Dobbiamo continuare con questo spirito settimana dopo settimana.",ef:{m:5,p:3,t:5}},
  {tone:"diretto",txt:"Assolutamente sì. Con me in forma, i traguardi sono alla portata.",ef:{m:9,p:7,t:-5}},
  {tone:"umile",txt:"Un passo alla volta. Siamo sulla strada giusta, ma c'è ancora molto lavoro.",ef:{m:4,p:3,t:7}},
]},
{ctx:["win"],q:"Cosa diresti ai tifosi dopo questa vittoria?",a:[
  {tone:"diplomatico",txt:"Grazie per il vostro supporto costante. Daremo tutto per voi fino alla fine.",ef:{m:5,p:9,t:4}},
  {tone:"diretto",txt:"Sono qui per vincere e li accontenteremo. Continuate a sostenerci.",ef:{m:8,p:9,t:-2}},
  {tone:"umile",txt:"I tifosi meritano queste gioie. Lavoriamo per loro ogni singolo giorno.",ef:{m:4,p:8,t:5}},
]},
{ctx:["win"],cond:(p,i)=>!!(i&&i.isHome===false),q:"Tre punti in trasferta sono oro. Come avete gestito la pressione?",a:[
  {tone:"diplomatico",txt:"Compatti e concentrati. Il mister ci aveva preparati benissimo per questo.",ef:{m:5,p:4,t:8}},
  {tone:"diretto",txt:"Io non sento la pressione. Anzi, mi carica. Oggi si è visto chiaramente.",ef:{m:10,p:7,t:-3}},
  {tone:"umile",txt:"Abbiamo sofferto ma abbiamo tenuto duro. Ogni vittoria in trasferta è speciale.",ef:{m:4,p:4,t:7}},
]},
{ctx:["win"],q:"Il mister sembra molto soddisfatto di te. Cosa ti ha detto nello spogliatoio?",a:[
  {tone:"diplomatico",txt:"Ha lodato il collettivo. Siamo contenti di aver risposto alle sue aspettative.",ef:{m:5,p:3,t:10}},
  {tone:"diretto",txt:"Mi ha detto che ero il migliore. Ormai è una cosa che sento spesso ultimamente.",ef:{m:9,p:6,t:-6}},
  {tone:"umile",txt:"Ha detto che dobbiamo restare umili. Ha ragione, ovviamente. Seguiamo il mister.",ef:{m:4,p:3,t:10}},
]},
{ctx:["win"],q:"Stai attraversando un gran momento di forma. Come lo spieghi?",a:[/* [7.120.0 audit narrativa] era «terzo man of the match di fila» — striscia MOTM non tracciata → asserzione non garantita, genericizzata */
  {tone:"diplomatico",txt:"Mi sento bene fisicamente e mentalmente. E la squadra mi mette nelle condizioni.",ef:{m:7,p:6,t:5}},
  {tone:"diretto",txt:"Sono entrato in un tunnel di prestazioni. Sono il migliore della rosa, punto.",ef:{m:12,p:10,t:-7}},
  {tone:"umile",txt:"I numeri sono lusinghieri ma conta solo la squadra. È un lavoro di tutti.",ef:{m:5,p:5,t:9}},
]},
{ctx:["win"],q:"Come ti senti quando il pubblico canta il tuo nome?",a:[
  {tone:"diplomatico",txt:"È una sensazione meravigliosa. Ti dà energia pura. Lo dedico a tutto il gruppo.",ef:{m:7,p:9,t:3}},
  {tone:"diretto",txt:"Me lo aspettavo. Quando giochi così, la gente ti ama. È il frutto del lavoro.",ef:{m:10,p:8,t:-3}},
  {tone:"umile",txt:"Emozionante. Ma preferisco che cantino il nome della squadra, non il mio.",ef:{m:5,p:7,t:6}},
]},
{ctx:["win"],q:"Rimontare nel finale è diventata la vostra specialità. Segreto?",a:[
  {tone:"diplomatico",txt:"Carattere e lavoro. Il mister ci ha instillato questa mentalità vincente.",ef:{m:6,p:5,t:7}},
  {tone:"diretto",txt:"Non molliamo perché abbiamo la qualità per ribaltare ogni partita. Io in primis.",ef:{m:9,p:7,t:-4}},
  {tone:"umile",txt:"Non è un segreto, è passione vera. Ci crediamo fino all'ultimo respiro.",ef:{m:5,p:5,t:8}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=2),/* [7.161.0 A1] */q:"Doppietta oggi. È il tuo momento migliore in questa maglia?",a:[
  {tone:"diplomatico",txt:"Ogni gol è speciale ma conta il risultato. Sono felice per come stiamo girando.",ef:{m:7,p:6,t:5}},
  {tone:"diretto",txt:"Sì, sono al top della forma. Quando mi trovano in area è quasi sempre gol.",ef:{m:12,p:10,t:-5}},
  {tone:"umile",txt:"Felice, certo. Ma preferisco parlare della squadra. Senza di loro non segno.",ef:{m:5,p:5,t:9}},
]},
{ctx:["win"],q:"Il tecnico ti ha schierato in una posizione diversa. Come ti sei trovato?",a:[
  {tone:"diplomatico",txt:"Il mister sa cosa fa. Mi ha chiesto di aiutare lì e l'ho fatto con piacere.",ef:{m:4,p:3,t:10}},
  {tone:"diretto",txt:"Sono adattabile ma il mio ruolo naturale è diverso. Preferisco giocare nel mio.",ef:{m:6,p:3,t:-6}},
  {tone:"umile",txt:"Devo migliorare in quella posizione. È una sfida utile per crescere.",ef:{m:3,p:3,t:8}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.awayScore||0)===0),/* [7.161.0 A1] clean sheet VERO (awayScore = gol subiti, lato eroe) */q:"Avete tenuto la porta inviolata. Come giudichi la fase difensiva di squadra?",a:[
  {tone:"diplomatico",txt:"Siamo stati compatti. Difendere tutti insieme è la nostra forza.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"Ottima prova difensiva. Io ho contribuito anche in fase di non possesso.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Grande lavoro di tutta la squadra. Il portiere è stato straordinario.",ef:{m:4,p:4,t:8}},
]},
{ctx:["win"],cond:(p,i)=>_primaCasa77(p,i),/* [7.161.0 A1] «prima» solo se è davvero la PRIMA casalinga vinta */q:"Prima vittoria in casa stagionale. Cosa significa per il gruppo?",a:[
  {tone:"diplomatico",txt:"Significa tanto. Il nostro pubblico merita queste emozioni. Andiamo avanti.",ef:{m:6,p:7,t:5}},
  {tone:"diretto",txt:"Era dovuta. Qui dobbiamo vincere sempre. Il nostro campo è un fortino.",ef:{m:9,p:7,t:-3}},
  {tone:"umile",txt:"Un sollievo per tutti. Ci tenevamo molto. I tifosi ci hanno spinto loro.",ef:{m:5,p:6,t:6}},
]},
{ctx:["win"],q:"La squadra ha subito molte critiche questa settimana. È questa la risposta?",a:[
  {tone:"diplomatico",txt:"Rispondiamo sempre in campo. Le critiche fanno parte del calcio, le accettiamo.",ef:{m:6,p:5,t:6}},
  {tone:"diretto",txt:"Esatto. Chi ha parlato male di noi si ricreda. Il campo non mente mai.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"Non leggo le critiche. Mi concentro sul lavoro. Oggi è andato bene.",ef:{m:5,p:4,t:7}},
]},
{ctx:["win"],cond:p=>{if(LEAGUE_PAIRS.some(([u,l])=>l===p.club?.lg))return false;/* [6.97.0] niente zona europea in 2ª divisione */try{const st=[...(p.standings||[])].sort((x,y)=>y.pts-x.pts||(y.gd||0)-(x.gd||0));const i=st.findIndex(t=>t.id===(p.club?.id)||t.n===(p.club?.n));return i>=0&&i<=8;}catch(e){return false;}}/* [7.161.0 M5] «vi porta in zona europea» solo se sei DAVVERO a ridosso (top 9 reale) */,q:"Vittoria che vi porta in zona europea. Ci credete davvero?",a:[
  {tone:"diplomatico",txt:"Ci lavoriamo ogni giorno. Sarebbe un risultato enorme per tutto il club.",ef:{m:7,p:5,t:6}},
  {tone:"diretto",txt:"Non ci poniamo limiti. Siamo forti e possiamo arrivare in Europa.",ef:{m:11,p:8,t:-4}},
  {tone:"umile",txt:"È prematuro parlarne. Pensiamo partita per partita. Prima la prossima.",ef:{m:4,p:4,t:8}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.assists||0)>=1),/* [7.161.0 A1] */q:"Il tuo assist è stato di altissima qualità. L'avevi preparato?",a:[
  {tone:"diplomatico",txt:"Lavoro molto sugli assist in allenamento. Sapevo che il compagno era lì.",ef:{m:5,p:5,t:6}},
  {tone:"diretto",txt:"Visione di gioco naturale. Vedo il campo diversamente dagli altri.",ef:{m:9,p:7,t:-4}},
  {tone:"umile",txt:"No, è stato istintivo. Il merito è del compagno che ha finalizzato benissimo.",ef:{m:3,p:4,t:8}},
]},
{ctx:["win"],cond:(p,v)=>{try{const mr=v&&v.matchResult;if(!mr)return false;const oc=CLUBS.find(c=>c.n===mr.opponent);return !!(oc&&typeof isDerby==="function"&&isDerby(p.club?.id,oc.id));}catch(e){return false;}},/* [7.161.0 A1] solo su derby REALE (pattern 7.8.5) */q:"Vittoria in derby! Cosa provi in questo momento?",a:[
  {tone:"diplomatico",txt:"Emozione unica. Il derby è sempre speciale per tutti, per i tifosi soprattutto.",ef:{m:8,p:10,t:5}},
  {tone:"diretto",txt:"È il risultato più bello. I derby li voglio vincere tutti, nessun rispetto per loro.",ef:{m:13,p:10,t:-5}},
  {tone:"umile",txt:"Orgoglioso. Ma già pensiamo alla prossima. Questo va dedicato ai tifosi.",ef:{m:7,p:9,t:6}},
]},
{ctx:["win"],q:"Il tuo percorso di crescita è evidente. Ti senti un giocatore diverso?",a:[
  {tone:"diplomatico",txt:"Lavoro ogni giorno per migliorare. Il club e il mister mi hanno fatto crescere.",ef:{m:6,p:5,t:7}},
  {tone:"diretto",txt:"Sì, sono più completo. Ho capito cosa serve per stare ad alto livello e ce la metto.",ef:{m:9,p:7,t:-3}},
  {tone:"umile",txt:"Spero di essere cresciuto. Ma c'è sempre molto da imparare da chi ha più esperienza.",ef:{m:4,p:4,t:9}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1),/* [7.161.0 A1] il rigore non è tracciato nel risultato → domanda riformulata senza asserire il fatto */q:"Nei momenti che pesano tu ci sei sempre. Come gestisci la pressione, anche dal dischetto?",a:[
  {tone:"diplomatico",txt:"Prendo il pallone, mi concentro e tiro. La squadra mi dà fiducia e io ricambio.",ef:{m:6,p:5,t:6}},
  {tone:"diretto",txt:"Non sento pressione sui rigori. Ho una tecnica solida e lo so. Segno quasi sempre.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"Ho lavorato molto sui rigori in allenamento. Oggi ho avuto fortuna anche.",ef:{m:4,p:4,t:7}},
]},
{ctx:["win"],q:"Il capitano ha elogiato il tuo atteggiamento. Come accogli queste parole?",a:[
  {tone:"diplomatico",txt:"Mi fa molto piacere. Cerco di dare sempre l'esempio, dentro e fuori dal campo.",ef:{m:6,p:5,t:8}},
  {tone:"diretto",txt:"È la conferma che il mio livello è riconosciuto anche dai leader dello spogliatoio.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Mi rende orgoglioso. Il capitano è un esempio per tutti. Spero di meritarlo.",ef:{m:5,p:4,t:10}},
]},
{ctx:["win"],q:"Come ti prepari mentalmente per le partite importanti?",a:[
  {tone:"diplomatico",txt:"Visualizzo le situazioni di gioco. Arrivo concentrato e pronto con la squadra.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"Non ho bisogno di preparativi speciali. Sono sempre pronto. Mentalmente sono forte.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Parlo con il mister, rivedo gli schemi, mi riposo bene. Il lavoro è la chiave.",ef:{m:4,p:4,t:8}},
]},
{ctx:["win"],q:"Vittoria convincente contro {opp}. Il morale nello spogliatoio è alle stelle?",a:[
  {tone:"diplomatico",txt:"C'è grande entusiasmo. Ma rimaniamo coi piedi per terra. Siamo concentrati.",ef:{m:7,p:5,t:6}},
  {tone:"diretto",txt:"Altissimo. Quando vinciamo così bene tutti capiscono il nostro potenziale.",ef:{m:11,p:8,t:-3}},
  {tone:"umile",txt:"Felici ma senza esagerare. Il mister ci chiede di restare focalizzati sul lavoro.",ef:{m:5,p:4,t:9}},
]},
{ctx:["win"],q:"Bella vittoria. Qual è stato il momento chiave della partita?",a:[
  {tone:"diplomatico",txt:"Il gol del vantaggio. Ha cambiato le dinamiche e ci ha dato fiducia collettiva.",ef:{m:5,p:4,t:5}},
  {tone:"diretto",txt:"Quando sono entrato in partita ho cambiato l'inerzia. Era evidente a tutti.",ef:{m:9,p:7,t:-5}},
  {tone:"umile",txt:"La difesa solida nel primo tempo ci ha dato la base per vincere. Merito dei difensori.",ef:{m:4,p:4,t:7}},
]},
// === POST SCONFITTA ===
{ctx:["loss"],q:"Sconfitta pesante oggi. Cosa è andato storto secondo te?",a:[
  {tone:"diplomatico",txt:"Non abbiamo giocato come sappiamo. Dobbiamo lavorare e tornare più forti.",ef:{m:-2,p:1,t:5}},
  {tone:"diretto",txt:"Qualcuno non era all'altezza oggi. Io ho fatto la mia parte, gli altri no.",ef:{m:3,p:-4,t:-9}},
  {tone:"umile",txt:"Ho sbagliato anch'io. È una sconfitta da cui dobbiamo imparare tutti quanti.",ef:{m:-3,p:2,t:7}},
]},
{ctx:["loss"],q:"Come tieni alta la testa dopo una sconfitta del genere?",a:[
  {tone:"diplomatico",txt:"Guardo avanti. Nel calcio si vince e si perde. L'importante è la reazione.",ef:{m:0,p:2,t:5}},
  {tone:"diretto",txt:"Non mi abbatto. Sono abituato a cadere e rialzarmi. Sono mentalmente forte.",ef:{m:4,p:3,t:-3}},
  {tone:"umile",txt:"È difficile. Ma il mister sa come tirarci su. Siamo un gruppo unito.",ef:{m:-1,p:2,t:7}},
]},
{ctx:["loss"],q:"Il mister è visibilmente deluso. Cosa ti aspetti di sentire nello spogliatoio?",a:[
  {tone:"diplomatico",txt:"Parole dirette e oneste. Ne abbiamo bisogno. Lo accetteremo e reagiremo.",ef:{m:-1,p:1,t:8}},
  {tone:"diretto",txt:"Che ci dica cosa non ha funzionato tatticamente. Non è tutta colpa nostra.",ef:{m:2,p:0,t:-7}},
  {tone:"umile",txt:"Meritava di meglio. Siamo dispiaciuti per lui e per i tifosi. Ci scusiamo.",ef:{m:-2,p:2,t:8}},
]},
{ctx:["loss"],q:"Avete sprecato troppe occasioni. Come te lo spieghi?",a:[
  {tone:"diplomatico",txt:"Mancanza di lucidità sotto porta. Ci lavoriamo in allenamento. Succede.",ef:{m:-1,p:1,t:4}},
  {tone:"diretto",txt:"Sì, ho sbagliato un gol facile. Mi dispiace. Ma era una giornata storta per tutti.",ef:{m:-2,p:0,t:3}},
  {tone:"umile",txt:"Dobbiamo essere più concreti. Il mister ci chiede efficacia. Non l'abbiamo avuta.",ef:{m:-2,p:1,t:6}},
]},
{ctx:["loss"],q:"Questa sconfitta complica i vostri piani stagionali?",a:[
  {tone:"diplomatico",txt:"È una battuta d'arresto. Ma la stagione è lunga e possiamo recuperare.",ef:{m:-1,p:1,t:4}},
  {tone:"diretto",txt:"No, non cambia i nostri obiettivi. Abbiamo le qualità per rimontare.",ef:{m:3,p:3,t:-3}},
  {tone:"umile",txt:"Forse sì. Dobbiamo essere onesti con noi stessi e correggere gli errori.",ef:{m:-2,p:1,t:6}},
]},
{ctx:["loss"],q:"Come rispondi a chi dice che la squadra ha un problema mentale?",a:[
  {tone:"diplomatico",txt:"Capisco la frustrazione. Ma siamo un gruppo serio e risponderemo sul campo.",ef:{m:-1,p:2,t:4}},
  {tone:"diretto",txt:"Nonsense. Abbiamo carattere. Chi dice così non conosce il nostro lavoro.",ef:{m:4,p:1,t:-5}},
  {tone:"umile",txt:"Forse c'è qualcosa da migliorare mentalmente. Lo riconosco e ci lavoreremo.",ef:{m:-2,p:2,t:7}},
]},
{ctx:["loss"],q:"Il pubblico ha fischiato. Come ti senti in questo momento?",a:[
  {tone:"diplomatico",txt:"Li capisco. Anche noi siamo delusi. Dobbiamo dare loro ragioni per sostenere.",ef:{m:-3,p:1,t:4}},
  {tone:"diretto",txt:"Fischiate pure. Vi daremo soddisfazione. Questo ci deve fare arrabbiare.",ef:{m:2,p:-3,t:-4}},
  {tone:"umile",txt:"Male. Ma è giusto che si facciano sentire. Dobbiamo meritarli meglio.",ef:{m:-3,p:0,t:5}},
]},
{ctx:["loss"],q:"Come spieghi il calo nel secondo tempo?",a:[
  {tone:"diplomatico",txt:"Abbiamo abbassato l'intensità. Non doveva succedere. Peccato.",ef:{m:-1,p:1,t:4}},
  {tone:"diretto",txt:"Fisicamente eravamo stanchi. Ma anche tatticamente potevamo fare meglio.",ef:{m:1,p:1,t:-2}},
  {tone:"umile",txt:"È un difetto su cui stiamo lavorando. Il mister ce lo dice in settimana.",ef:{m:-1,p:1,t:7}},
]},
{ctx:["loss"],q:"Sconfitta contro {opp}. Ti aspettavi un avversario così in forma?",a:[
  {tone:"diplomatico",txt:"Hanno giocato bene, dobbiamo riconoscerlo. Ma potevamo fare di più.",ef:{m:-1,p:2,t:4}},
  {tone:"diretto",txt:"Hanno avuto fortuna. Se giochiamo cento volte vinciamo noi ottanta.",ef:{m:3,p:-2,t:-5}},
  {tone:"umile",txt:"Erano superiori oggi. Meritavano la vittoria. Noi dobbiamo crescere.",ef:{m:-2,p:2,t:6}},
]},
{ctx:["loss"],cond:(p)=>{try{const h=(p.matchHistory||[]).slice(-2);return h.length>=2&&h.every(m=>m&&m.won===false&&!m.drew);}catch(e){return false;}},/* [7.161.0 A1] questa è la 3ª: le 2 precedenti devono essere sconfitte VERE */q:"Tre sconfitte consecutive. Siete in crisi?",a:[
  {tone:"diplomatico",txt:"Non parlerei di crisi. Striscia negativa sì, ma ci sono le qualità per uscirne.",ef:{m:-2,p:1,t:4}},
  {tone:"diretto",txt:"No, siamo in difficoltà. Ma ho visto squadre peggiori di noi uscirne. Usciremo.",ef:{m:2,p:2,t:-3}},
  {tone:"umile",txt:"È un momento difficile. Dobbiamo restare uniti e lavorare ancora di più.",ef:{m:-3,p:1,t:7}},
]},
{ctx:["loss"],q:"Il tuo errore ha influenzato il risultato. Come la vivi?",a:[
  {tone:"diplomatico",txt:"Sono il primo a fare autocritica. Rimedierò in settimana e nella prossima gara.",ef:{m:-4,p:0,t:7}},
  {tone:"diretto",txt:"Sì, ho sbagliato. Ma la squadra avrebbe potuto coprire. Non era solo colpa mia.",ef:{m:0,p:-2,t:-6}},
  {tone:"umile",txt:"Me ne assumo la responsabilità. Ho deluso i compagni e i tifosi. Mi dispiace.",ef:{m:-5,p:0,t:8}},
]},
{ctx:["loss"],cond:(p,i)=>!!(i&&i.isHome===true),q:"Sconfitta in casa. Come si perde davanti al proprio pubblico?",a:[
  {tone:"diplomatico",txt:"Con la testa bassa e la promessa di fare meglio. Non è accettabile subire così.",ef:{m:-3,p:1,t:5}},
  {tone:"diretto",txt:"Non doveva succedere. Siamo delusi quanto i tifosi. Reagiremo con i fatti.",ef:{m:-1,p:2,t:-2}},
  {tone:"umile",txt:"Male. Dobbiamo chiedere scusa ai tifosi. Loro meritano di più da noi.",ef:{m:-3,p:2,t:6}},
]},
{ctx:["loss"],cond:(p,i)=>!!(i&&i.isHome===false),q:"Sconfitta in trasferta. Cosa è mancato lontano da casa?",a:[/* [7.1.3] variante trasferta speculare (venue-aware) */
  {tone:"diplomatico",txt:"Un campo difficile. Ci è mancata un po' di lucidità nei momenti chiave.",ef:{m:-2,p:1,t:5}},
  {tone:"diretto",txt:"In trasferta serve più cinismo. Oggi non l'abbiamo avuto, punto.",ef:{m:-1,p:2,t:-2}},
  {tone:"umile",txt:"Fuori casa paghiamo ogni errore. Dobbiamo crescere in personalità.",ef:{m:-2,p:1,t:6}},
]},
{ctx:["loss"],q:"Come rialzarsi mentalmente per la prossima partita?",a:[
  {tone:"diplomatico",txt:"Analisi degli errori, lavoro in settimana e ripartire con la giusta mentalità.",ef:{m:1,p:1,t:5}},
  {tone:"diretto",txt:"Non ci vuole molto per me. Sono un professionista. Mi ricarico subito.",ef:{m:3,p:2,t:-2}},
  {tone:"umile",txt:"È difficile ma necessario. Il gruppo deve restare unito. Senza alibi.",ef:{m:0,p:2,t:7}},
]},
{ctx:["loss"],cond:(p,v)=>{try{const mr=v&&v.matchResult;if(!mr)return false;const oc=CLUBS.find(c=>c.n===mr.opponent);return !!(oc&&typeof isDerby==="function"&&isDerby(p.club?.id,oc.id));}catch(e){return false;}},/* [7.161.0 A1] */q:"Sconfitta in derby. Quanto fa male?",a:[
  {tone:"diplomatico",txt:"Moltissimo. Il derby è speciale e perderlo fa soffrire. Ma è calcio.",ef:{m:-5,p:1,t:4}},
  {tone:"diretto",txt:"Una vergogna. Non accettabile. Dobbiamo vendicarla la prossima volta.",ef:{m:-3,p:-2,t:-5}},
  {tone:"umile",txt:"Fa malissimo. I tifosi non meritavano questo. Ce ne assumiamo la responsabilità.",ef:{m:-5,p:1,t:7}},
]},
{ctx:["loss"],q:"Come giudichi la prestazione dei singoli in questa sconfitta?",a:[
  {tone:"diplomatico",txt:"Non è corretto fare nomi. Vinciamo e perdiamo insieme, sempre.",ef:{m:-1,p:2,t:7}},
  {tone:"diretto",txt:"Qualcuno sotto la sufficienza, è evidente. Io ho dato il massimo comunque.",ef:{m:2,p:-2,t:-8}},
  {tone:"umile",txt:"Siamo stati tutti insufficienti, io compreso. Nessuno può dirsi soddisfatto.",ef:{m:-2,p:1,t:7}},
]},
{ctx:["loss"],q:"Il mister ha difeso la squadra in conferenza. Ti senti supportato?",a:[
  {tone:"diplomatico",txt:"Il mister è fantastico. Sa quando difendere e quando criticare. Lo rispettiamo.",ef:{m:3,p:2,t:9}},
  {tone:"diretto",txt:"Fa parte del suo lavoro. Ma la squadra deve dimostrar sul campo, non con le parole.",ef:{m:2,p:2,t:-2}},
  {tone:"umile",txt:"È un gesto enorme. Non meritavamo questa difesa. Dobbiamo ripagarla.",ef:{m:2,p:3,t:9}},
]},
{ctx:["loss"],q:"Ti senti al sicuro nel posto in formazione dopo questa prestazione?",a:[
  {tone:"diplomatico",txt:"Spetta al mister decidere. Mi allenerò al massimo e aspetto le sue scelte.",ef:{m:-1,p:0,t:7}},
  {tone:"diretto",txt:"Sì, mi sento titolare. Una partita non cambia il valore che ho dimostrato.",ef:{m:3,p:2,t:-5}},
  {tone:"umile",txt:"Non lo so. Dipende da me. Devo lavorare più duramente per riconquistare la fiducia.",ef:{m:-2,p:1,t:8}},
]},
{ctx:["loss"],q:"Ci sono tensioni nello spogliatoio?",a:[
  {tone:"diplomatico",txt:"No, siamo un gruppo unito. Discussioni sane ci sono, ma è tutto normale.",ef:{m:1,p:1,t:5}},
  {tone:"diretto",txt:"Alcune cose non funzionano. Meglio risolverle internamente però.",ef:{m:2,p:-3,t:-6}},
  {tone:"umile",txt:"Quando si perde la frustrazione è normale. Ma restiamo uniti, siamo una squadra.",ef:{m:0,p:1,t:6}},
]},
{ctx:["loss"],q:"Il vostro reparto offensivo è stato poco incisivo. Cosa ne pensi?",a:[
  {tone:"diplomatico",txt:"Vero. Dobbiamo essere più efficaci. Ci lavoreremo in allenamento questa settimana.",ef:{m:-1,p:1,t:5}},
  {tone:"diretto",txt:"Non abbiamo avuto i palloni giusti. Il centrocampo ci ha serviti male oggi.",ef:{m:2,p:-2,t:-6}},
  {tone:"umile",txt:"Siamo stati imprecisi. Ho sbagliato anch'io. Dobbiamo fare meglio tutti.",ef:{m:-2,p:1,t:6}},
]},
{ctx:["loss"],q:"Come ti senti rispetto all'inizio della stagione?",a:[
  {tone:"diplomatico",txt:"Deluso rispetto alle aspettative, ma è normale avere momenti difficili. Reagiremo.",ef:{m:-1,p:1,t:4}},
  {tone:"diretto",txt:"Sto bene. Sono in forma. Il problema è altrove. Non è colpa mia se non vinciamo.",ef:{m:3,p:-3,t:-7}},
  {tone:"umile",txt:"Devo migliorare alcune cose. Sto lavorando per essere più utile alla squadra.",ef:{m:-1,p:1,t:7}},
]},
// === PAREGGIO ===
{ctx:["draw"],q:"Un punto guadagnato o due persi? Come vedi questo pareggio?",a:[
  {tone:"diplomatico",txt:"Dipende dall'ottica. Abbiamo lottato e un punto contro {opp} ha un suo valore.",ef:{m:2,p:2,t:4}},
  {tone:"diretto",txt:"Due punti persi, punto. Dovevamo vincere. Avevamo le occasioni per farlo.",ef:{m:3,p:2,t:-3}},
  {tone:"umile",txt:"Senza esagerare in un senso o nell'altro. Potevamo fare meglio nel finale.",ef:{m:1,p:2,t:5}},
]},
{ctx:["draw"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1),/* [7.161.0 A1] «il gol del pari» = un TUO gol in un pareggio */q:"Il gol del pari nel finale ha cambiato l'umore. Come stai?",a:[
  {tone:"diplomatico",txt:"Sollievo misto a rammarico. Avremmo meritato di più ma il punto vale.",ef:{m:1,p:2,t:3}},
  {tone:"diretto",txt:"Male. Abbiamo perso due punti nell'ultimo minuto. Non è accettabile.",ef:{m:-1,p:1,t:-2}},
  {tone:"umile",txt:"Ci sta nel calcio. Dobbiamo migliorare la gestione del vantaggio.",ef:{m:0,p:1,t:5}},
]},
{ctx:["draw"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.homeScore||0)===0&&(v.matchResult.awayScore||0)===0),/* [7.161.0 A1] solo su 0-0 REALE (non ogni pareggio) */q:"0-0 oggi. Come spieghi la mancanza di gol?",a:[
  {tone:"diplomatico",txt:"Loro hanno difeso benissimo. Noi abbiamo creato ma mancava precisione.",ef:{m:0,p:1,t:4}},
  {tone:"diretto",txt:"Siamo stati bloccati. Il loro schema difensivo era difficile da superare.",ef:{m:1,p:1,t:-1}},
  {tone:"umile",txt:"Dovevo essere più pericoloso. Occasioni le ho avute. Ho sbagliato la mira.",ef:{m:-1,p:1,t:6}},
]},
{ctx:["draw"],cond:(p,i)=>!!(i&&i.isHome===true),q:"Pareggio in casa contro {opp}. Risposta alla stampa che vi criticava?",a:[
  {tone:"diplomatico",txt:"Non rispondiamo alla stampa. Lavoriamo e i risultati arriveranno.",ef:{m:2,p:2,t:5}},
  {tone:"diretto",txt:"Non basta. Volevamo vincere. Le critiche si rispondono solo con tre punti.",ef:{m:3,p:2,t:-2}},
  {tone:"umile",txt:"Il punto è giusto forse. Dobbiamo essere più incisivi nelle prossime gare.",ef:{m:1,p:2,t:6}},
]},
{ctx:["draw"],cond:(p,i)=>!!(i&&i.isHome===false),q:"Un punto in trasferta contro {opp}. Lo tieni stretto?",a:[/* [7.1.3] variante trasferta speculare (venue-aware) */
  {tone:"diplomatico",txt:"Fuori casa un punto ha sempre il suo valore. Muoviamo la classifica.",ef:{m:2,p:2,t:5}},
  {tone:"diretto",txt:"Volevamo di più anche qui. Ma in trasferta non si torna mai a mani vuote per caso.",ef:{m:3,p:2,t:-2}},
  {tone:"umile",txt:"Un punto onesto su un campo tosto. Ci teniamo il pari e ripartiamo.",ef:{m:1,p:2,t:6}},
]},
{ctx:["draw"],cond:(p,v)=>!(v&&v.matchResult&&v.matchResult.context&&v.matchResult.context!=="career"),/* [7.164.0 deferito M5] domanda a tema CLASSIFICA: mai dopo una gara di coppa/Europa/nazionale */q:"Pareggio che permette di mantenere la posizione in classifica. Sei soddisfatto?",a:[
  {tone:"diplomatico",txt:"Relativamente sì. Punti preziosi. Ma dobbiamo mirare a vincere ogni gara.",ef:{m:2,p:2,t:4}},
  {tone:"diretto",txt:"No, non sono soddisfatto. Siamo forti per stare lassù con più distacco.",ef:{m:4,p:3,t:-3}},
  {tone:"umile",txt:"Un punto è un punto. Il campionato è lungo. Continuiamo a lavorare.",ef:{m:2,p:2,t:5}},
]},
{ctx:["draw"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1),/* [7.161.0 A1] */q:"Hai segnato ma la squadra non ha vinto. Questo come ti condiziona?",a:[
  {tone:"diplomatico",txt:"Il gol personale conta poco se non vinciamo. Sono deluso per il risultato.",ef:{m:0,p:3,t:4}},
  {tone:"diretto",txt:"Ho fatto la mia parte. Almeno il mio contributo c'è stato. Gli altri dovevano chiuderla.",ef:{m:4,p:2,t:-7}},
  {tone:"umile",txt:"Amarezza. Il gol è niente senza la vittoria. Dobbiamo essere più coesi.",ef:{m:-1,p:2,t:6}},
]},
// === SETTIMANALE / GENERALE ===
{ctx:["weekly"],y:1,q:"Come stanno andando gli allenamenti questa settimana?",a:[
  {tone:"diplomatico",txt:"Molto bene. Il gruppo è motivato e il lavoro si vede sul campo.",ef:{m:3,p:2,t:5}},
  {tone:"diretto",txt:"Io mi sto allenando al massimo. Voglio essere pronto per la prossima gara.",ef:{m:5,p:3,t:-2}},
  {tone:"umile",txt:"Sempre con impegno. Non ho mai la sensazione di fare abbastanza.",ef:{m:2,p:2,t:7}},
]},
{ctx:["weekly"],y:1,q:"Come descrivi il tuo rapporto con i tifosi di {club}?",a:[
  {tone:"diplomatico",txt:"Straordinario. Il loro supporto è fondamentale. Li rispetto enormemente.",ef:{m:3,p:7,t:2}},
  {tone:"diretto",txt:"Ottimo quando gioco bene. E intendo continuare a giocare bene per loro.",ef:{m:5,p:6,t:-1}},
  {tone:"umile",txt:"Mi fanno sentire amato. Spero di non deluderli mai. Darò sempre il massimo.",ef:{m:3,p:8,t:3}},
]},
{ctx:["weekly"],y:1,q:"Qual è il tuo obiettivo personale per questa stagione?",a:[
  {tone:"diplomatico",txt:"Aiutare la squadra a raggiungere i suoi obiettivi. Il collettivo prima di tutto.",ef:{m:4,p:4,t:7}},
  {tone:"diretto",txt:"Raggiungere i miei massimi statistici. Gol, assist, prestazioni. Voglio eccellere.",ef:{m:7,p:6,t:-4}},
  {tone:"umile",txt:"Migliorare rispetto alla scorsa stagione. Ogni anno devo fare un passo avanti.",ef:{m:3,p:4,t:7}},
]},
{ctx:["weekly"],cond:_brandOk453/* [7.454.0] non ci sono voci di mercato su un ragazzo della Primavera */,q:"Ci sono voci di mercato sul tuo conto. Come rispondi?",a:[
  {tone:"diplomatico",txt:"Sono concentrato su {club}. Non mi interessano le voci. Il mercato è lontano.",ef:{m:2,p:3,t:6}},
  {tone:"diretto",txt:"L'interesse mi fa piacere. Significa che sto facendo bene. Ma ora penso a qui.",ef:{m:6,p:7,t:-5}},
  {tone:"umile",txt:"Non ne so nulla. Faccio il mio lavoro e lascio che siano gli altri a decidere.",ef:{m:2,p:3,t:5}},
]},
{ctx:["weekly"],cond:_statusOk453/* [7.454.0] la domanda da' per scontato uno status */,q:"Come gestisci la pressione di essere un giocatore importante?",a:[
  {tone:"diplomatico",txt:"Con preparazione e routine. Cerco di non pensare alla pressione ma al gioco.",ef:{m:4,p:3,t:5}},
  {tone:"diretto",txt:"La pressione mi piace. Mi dà energia. Sono fatto per i momenti importanti.",ef:{m:7,p:5,t:-3}},
  {tone:"umile",txt:"Non sempre è facile. Ma ho buone persone intorno a me che mi aiutano.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],y:1,q:"Chi è stato il tuo idolo calcistico da bambino?",a:[
  {tone:"diplomatico",txt:"Molti campioni mi hanno ispirato. Ma ogni giocatore deve trovare la propria strada.",ef:{m:4,p:5,t:3}},
  {tone:"diretto",txt:"Non avevo idoli. Volevo essere meglio di tutti. Me stesso è il mio unico modello.",ef:{m:6,p:4,t:-4}},
  {tone:"umile",txt:"Ho amato i grandi campioni del passato. Mi ricordano quanto strada c'è ancora da fare.",ef:{m:3,p:5,t:4}},
]},
{ctx:["weekly"],cond:p=>(p.proStatus||"u18")==="pro"&&(p.nationalCaps||0)===0&&(p.ovr||60)>=72&&(p.age||20)<=30,/* [7.199.0 collaudo PO «ci ho già giocato e vinto in Nazionale, a 34 anni: domanda fuori luogo»] la 6.97.0 chiedeva un profilo CREDIBILE ma ammetteva esplicitamente chi ha già le presenze (caps>0): la domanda aspirazionale «è un suo obiettivo?» finiva così a un veterano che la Nazionale l'ha già vinta. È l'opposto: si fa solo a chi NON è ancora mai stato convocato, ha il profilo per esserlo ed è in età da esordio */q:"Pensi mai alla Nazionale? È un tuo obiettivo?",a:[
  {tone:"diplomatico",txt:"Ogni calciatore sogna la Nazionale. Ma ci si arriva solo con le prestazioni in club.",ef:{m:4,p:5,t:4}},
  {tone:"diretto",txt:"Sì, voglio la Nazionale. Ne ho le qualità. Serve solo continuità e visibilità.",ef:{m:7,p:6,t:-3}},
  {tone:"umile",txt:"Sarebbe un onore enorme. Non ci penso troppo: lavoro e vedo cosa arriva.",ef:{m:3,p:5,t:5}},
]},
{ctx:["weekly"],y:1,q:"Come mantieni il fisico durante la stagione?",a:[
  {tone:"diplomatico",txt:"Alimentazione, recupero e lavoro con lo staff medico. È un impegno quotidiano.",ef:{m:3,p:3,t:5}},
  {tone:"diretto",txt:"Sono disciplinato. Il corpo è il mio strumento. Lo curo meglio di qualsiasi cosa.",ef:{m:5,p:4,t:-2}},
  {tone:"umile",txt:"Cerco di ascoltare il corpo e seguire i consigli dello staff. Non sempre facile.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],q:"Qual è la partita più bella che hai giocato in carriera finora?",a:[
  {tone:"diplomatico",txt:"Ogni partita ha la sua storia. Ma quelle con i compagni migliori sono le più belle.",ef:{m:5,p:5,t:4}},
  {tone:"diretto",txt:"Le ho avute diverse. Ma la mia carriera è ancora in costruzione. Il meglio viene.",ef:{m:6,p:5,t:-2}},
  {tone:"umile",txt:"Non so. Forse quella in cui ho capito di poter giocare ad alto livello. È stata speciale.",ef:{m:4,p:5,t:5}},
]},
{ctx:["weekly"],y:1,q:"Come ti trovi a {club}? Ti trovi bene ambientalmente?",a:[
  {tone:"diplomatico",txt:"Benissimo. Il club è organizzato, i compagni fantastici. Mi sento a casa.",ef:{m:6,p:6,t:7}},
  {tone:"diretto",txt:"Bene. Mi hanno dato fiducia e io li sto ripagando con le prestazioni.",ef:{m:7,p:5,t:-1}},
  {tone:"umile",txt:"Molto bene. Ogni giorno imparo qualcosa di nuovo. Sono grato di essere qui.",ef:{m:5,p:6,t:7}},
]},
{ctx:["weekly"],y:1,q:"Cosa fai per staccare mentalmente dal calcio?",a:[
  {tone:"diplomatico",txt:"Famiglia, musica, qualche hobby. È importante ricaricarsi per dare il massimo.",ef:{m:5,p:4,t:3}},
  {tone:"diretto",txt:"Il calcio è la mia vita. Non sento il bisogno di staccare. È la mia passione.",ef:{m:6,p:4,t:-2}},
  {tone:"umile",txt:"Leggo, mi rilasso con la famiglia. Il cervello deve riposare come il corpo.",ef:{m:4,p:4,t:4}},
]},
{ctx:["weekly"],q:"Quale campionato consideri il più difficile in Europa?",a:[
  {tone:"diplomatico",txt:"Ogni campionato ha la sua specificità. Quello in cui gioco è sempre il più difficile.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"La Premier Division fisicamente, la Lega A tatticamente. Ma io posso giocare ovunque.",ef:{m:5,p:4,t:-2}},
  {tone:"umile",txt:"Tutti sono difficili ad alto livello. Non mi permetto di fare classifiche.",ef:{m:2,p:3,t:5}},
]},
{ctx:["weekly"],y:1,q:"Come descrivi il tuo stile di gioco ai tifosi che non ti conoscono?",a:[
  {tone:"diplomatico",txt:"Sono un giocatore di squadra che cerca di fare la differenza nei momenti che contano.",ef:{m:4,p:5,t:5}},
  {tone:"diretto",txt:"Tecnica, velocità, gol. Chi mi guarda una volta capisce cosa sono.",ef:{m:7,p:6,t:-3}},
  {tone:"umile",txt:"Un lavoratore. Non il più fantasioso, ma cerco di essere utile in ogni situazione.",ef:{m:3,p:4,t:7}},
]},
{ctx:["weekly"],q:"Cosa pensi delle critiche ricevute dalla stampa questa settimana?",a:[
  {tone:"diplomatico",txt:"Fanno parte del gioco. Prendo quelle costruttive e ignoro il resto. Avanti.",ef:{m:3,p:2,t:4}},
  {tone:"diretto",txt:"La stampa spesso non capisce il calcio. Guardo i risultati, non i giornali.",ef:{m:5,p:-2,t:-3}},
  {tone:"umile",txt:"Alcune critiche erano giuste. Me le porto in campo per migliorare.",ef:{m:1,p:2,t:6}},
]},
{ctx:["weekly"],y:1,q:"Come sta il gruppo dopo il periodo recente?",a:[
  {tone:"diplomatico",txt:"Bene. Siamo uniti e lavoriamo con determinazione. Il morale c'è.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"Qualcuno è giù ma io sono carico. Provo a trascinare anche gli altri.",ef:{m:6,p:4,t:-2}},
  {tone:"umile",txt:"Ci sono alti e bassi normali. L'importante è non mollare mai come gruppo.",ef:{m:4,p:3,t:6}},
]},
{ctx:["weekly"],y:1,q:"Hai un rituale pre-partita? Ce lo racconti.",a:[
  {tone:"diplomatico",txt:"Preferisco tenerlo privato. Ogni rituale è personale. Mi aiuta a concentrarmi.",ef:{m:3,p:4,t:3}},
  {tone:"diretto",txt:"Mi carico con la musica e visualizzo i momenti chiave. Arrivo sempre pronto.",ef:{m:5,p:5,t:-1}},
  {tone:"umile",txt:"Prego e penso alla famiglia. Mi dà la pace giusta per entrare in campo.",ef:{m:4,p:5,t:4}},
]},
{ctx:["weekly"],q:"Qual è il giocatore avversario che ti ha impressionato di più quest'anno?",a:[
  {tone:"diplomatico",txt:"Ci sono tanti campioni in questa lega. Ogni settimana affronti qualità altissima.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Nessuno mi ha impressionato al punto da sentirmi inferiore. Sono competitivo.",ef:{m:6,p:3,t:-4}},
  {tone:"umile",txt:"Diversi. Mi piace imparare dagli avversari forti. Ogni sfida è una lezione.",ef:{m:3,p:4,t:5}},
]},
{ctx:["weekly"],q:"Come vedi la tua evoluzione tattica nell'ultimo anno?",a:[
  {tone:"diplomatico",txt:"Migliorata. Il mister e lo staff mi hanno aiutato a capire meglio il gioco.",ef:{m:4,p:3,t:7}},
  {tone:"diretto",txt:"Molto. Sono più completo e versatile. Posso giocare in più ruoli con efficacia.",ef:{m:7,p:5,t:-2}},
  {tone:"umile",txt:"Ci lavoro ogni giorno. C'è ancora molto da imparare ma sento i progressi.",ef:{m:3,p:3,t:8}},
]},
{ctx:["weekly"],q:"Sogni di vincere un trofeo importante con {club}?",a:[
  {tone:"diplomatico",txt:"Certo. Ogni giocatore vuole vincere. Lavoriamo per questo obiettivo insieme.",ef:{m:6,p:5,t:6}},
  {tone:"diretto",txt:"Non sogno, programmo. Darò tutto per portare un trofeo qui. Lo voglio.",ef:{m:8,p:6,t:-2}},
  {tone:"umile",txt:"Sarebbe bellissimo. Ma ci vuole il contributo di tutti, non solo il mio.",ef:{m:5,p:5,t:7}},
]},
{ctx:["weekly"],q:"Come gestisci le aspettative dei tifosi quando sono molto alte?",a:[
  {tone:"diplomatico",txt:"Con rispetto. Le loro aspettative mi motivano e cerco di non deluderle.",ef:{m:4,p:6,t:4}},
  {tone:"diretto",txt:"Le aspettative alte sono il mio pane. Sono un giocatore che ama le grandi sfide.",ef:{m:7,p:6,t:-3}},
  {tone:"umile",txt:"Cerco di non pensarci troppo. Me ne faccio una responsabilità sana, non un peso.",ef:{m:3,p:5,t:5}},
]},
{ctx:["weekly"],y:1,q:"Cosa significa per te indossare questa maglia?",a:[
  {tone:"diplomatico",txt:"È un onore e una responsabilità. Rappresento il club e i suoi tifosi ogni giorno.",ef:{m:5,p:7,t:6}},
  {tone:"diretto",txt:"Molto. E voglio che questa maglia significhi qualcosa di ancora più grande grazie a me.",ef:{m:7,p:7,t:-2}},
  {tone:"umile",txt:"È un privilegio. Non lo do mai per scontato. Ogni partita potrebbe essere l'ultima.",ef:{m:5,p:7,t:6}},
]},
{ctx:["weekly"],cond:_statusOk453/* [7.454.0] un punto di riferimento lo si diventa */,q:"Parliamo di leadership. Ti senti un punto di riferimento nello spogliatoio?",a:[
  {tone:"diplomatico",txt:"Cerco di esserlo. Con l'esempio prima di tutto. Le parole vengono dopo.",ef:{m:5,p:5,t:7}},
  {tone:"diretto",txt:"Sì. I compagni mi cercano nei momenti difficili. Questo mi inorgoglisce.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Non so. Cerco di fare il mio lavoro bene e sperare che sia d'ispirazione.",ef:{m:4,p:4,t:8}},
]},
{ctx:["weekly"],q:"Il calcio giovanile ti ha preparato bene per il professionismo?",a:[
  {tone:"diplomatico",txt:"Sì, tantissimo. I sacrifici fatti da giovane sono la base di tutto quello che sono.",ef:{m:4,p:4,t:5}},
  {tone:"diretto",txt:"In parte. Il salto è enorme. Ma avevo le qualità per farcela e ce l'ho fatta.",ef:{m:6,p:4,t:-2}},
  {tone:"umile",txt:"Mi ha dato le basi. Poi ogni giorno imparo qualcosa di nuovo dai professionisti.",ef:{m:3,p:4,t:7}},
]},
{ctx:["weekly"],y:1,q:"Come definiresti la tua stagione finora in una parola?",a:[
  {tone:"diplomatico",txt:"'Crescita'. Ogni settimana mi sento più parte di questo gruppo fantastico.",ef:{m:5,p:4,t:6}},
  {tone:"diretto",txt:"'Dominante'. Quando sono in campo faccio la differenza. I numeri lo provano.",ef:{m:9,p:7,t:-5}},
  {tone:"umile",txt:"'Lavoro'. Non mi accontento mai. C'è sempre un aspetto da migliorare.",ef:{m:3,p:3,t:9}},
]},
{ctx:["weekly"],y:1,q:"Qual è la più grande qualità del vostro allenatore?",a:[
  {tone:"diplomatico",txt:"Sa motivare il gruppo e ha una chiarezza tattica invidiabile. Lo rispettiamo molto.",ef:{m:4,p:3,t:10}},
  {tone:"diretto",txt:"Capisce i giocatori forti e li valorizza. Con me ha fatto un ottimo lavoro.",ef:{m:6,p:4,t:2}},
  {tone:"umile",txt:"La sua pazienza con noi. Sa aspettare i risultati del suo lavoro. È un maestro.",ef:{m:3,p:3,t:10}},
]},
{ctx:["weekly"],y:1,q:"C'è un compagno che ti ha sorpreso positivamente quest'anno?",a:[
  {tone:"diplomatico",txt:"Diversi. Il livello della rosa è più alto di quello che si dice dall'esterno.",ef:{m:4,p:3,t:5}},
  {tone:"diretto",txt:"Qualcuno si è avvicinato al mio livello. È una bella competizione interna.",ef:{m:6,p:3,t:-4}},
  {tone:"umile",txt:"Sì. Ho imparato molto da alcuni compagni. Il calcio è scambio continuo.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],q:"Come descrivi il campionato in cui giochi quest'anno?",a:[
  {tone:"diplomatico",txt:"Molto competitivo. Non ci sono partite facili. Ogni gara richiede il massimo.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Di alto livello. E io sono tra i più forti. I risultati lo confermano.",ef:{m:7,p:5,t:-4}},
  {tone:"umile",txt:"Tosto. Mi ha costretto a crescere più velocemente. È stata una grande scuola.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],q:"Hai un messaggio per i giovani che vogliono diventare calciatori professionisti?",a:[
  {tone:"diplomatico",txt:"Lavorate, siate pazienti e non mollate mai. Il talento da solo non basta.",ef:{m:5,p:7,t:4}},
  {tone:"diretto",txt:"Siate ambiziosi. Sognate in grande e lavorate come nessun altro. Io l'ho fatto.",ef:{m:7,p:8,t:-2}},
  {tone:"umile",txt:"Io ho ancora tanto da imparare: ascoltate chi vi allena e restate umili.",ef:{m:4,p:7,t:5}},
]},
{ctx:["weekly"],q:"Come ti prepari psicologicamente per i momenti ad alta pressione in partita?",a:[
  {tone:"diplomatico",txt:"Con la routine e la fiducia nel lavoro fatto. Quando arrivo lì sono pronto.",ef:{m:4,p:3,t:5}},
  {tone:"diretto",txt:"Non mi preparo: sono già pronto. La pressione mi esalta, non mi blocca.",ef:{m:8,p:5,t:-3}},
  {tone:"umile",txt:"Cerco la calma. Respiro, penso al gesto tecnico. Niente di più.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],q:"Parliamo di social media. Come gestisci la tua presenza online?",a:[
  {tone:"diplomatico",txt:"Con cura. Voglio dare un'immagine professionale. Il campo rimane la mia priorità.",ef:{m:3,p:5,t:3}},
  {tone:"diretto",txt:"Sono diretto anche lì. Mi esprimo liberamente. I miei follower lo apprezzano.",ef:{m:5,p:7,t:-4}},
  {tone:"umile",txt:"Con parsimonia. Preferisco che parlino le mie prestazioni, non i miei post.",ef:{m:2,p:4,t:5}},
]},
// === CONTRATTO ===
{ctx:["contract"],q:"Il tuo contratto scade tra poco. Hai già parlato con il club?",a:[
  {tone:"diplomatico",txt:"Ci sono dialoghi in corso. Sono fiducioso che si troverà un accordo positivo.",ef:{m:3,p:3,t:5,v:0.10}},
  {tone:"diretto",txt:"Voglio restare ma a condizioni adeguate al mio valore. Sono realista.",ef:{m:5,p:4,t:-4,v:0.15}},
  {tone:"umile",txt:"Sono felice qui. Se il club vorrà ancora me, sarò orgoglioso di rinnovare.",ef:{m:3,p:4,t:7,v:0.05}},
]},
{ctx:["contract"],q:"Ci sono offerte da altri club. Come stai gestendo la situazione?",a:[
  {tone:"diplomatico",txt:"La mia priorità è {club}. Le trattative le lascio gestire al mio agente.",ef:{m:2,p:3,t:6,v:0.10}},
  {tone:"diretto",txt:"Le offerte ci sono e sono significative. Valuterò tutto prima di decidere.",ef:{m:5,p:5,t:-6,v:0.20}},
  {tone:"umile",txt:"Non mi distraggo. Penso solo al campo. Il futuro si vedrà a tempo debito.",ef:{m:2,p:3,t:5,v:0.05}},
]},
{ctx:["contract"],q:"Soldi o ambizione? Cosa pesa di più nella scelta del club?",a:[
  {tone:"diplomatico",txt:"L'equilibrio tra i due. Un progetto ambizioso in un ambiente sano. Conta tutto.",ef:{m:4,p:4,t:5,v:0.05}},
  {tone:"diretto",txt:"Voglio entrambi. Merito un ingaggio top E un club che vinca. Non devo scegliere.",ef:{m:6,p:5,t:-4,v:0.15}},
  {tone:"umile",txt:"Il progetto sportivo. I soldi vengono con le prestazioni. Prima la crescita.",ef:{m:4,p:5,t:7,v:0.05}},
]},
{ctx:["contract"],q:"Senti di dover guadagnare di più rispetto ad ora?",a:[
  {tone:"diplomatico",txt:"Il mercato parla da solo. Se le prestazioni lo giustificano, è legittimo.",ef:{m:3,p:2,t:2,v:0.10}},
  {tone:"diretto",txt:"Assolutamente sì. Il mio rendimento merita un contratto ai vertici della rosa.",ef:{m:5,p:3,t:-5,v:0.20}},
  {tone:"umile",txt:"Non è la mia priorità. Voglio solo giocare bene e vincere. Il resto viene da sé.",ef:{m:3,p:3,t:7}},
]},
{ctx:["contract"],q:"Resterai al club anche in caso di retrocessione o cambierai aria?",a:[
  {tone:"diplomatico",txt:"È uno scenario che non voglio considerare. L'obiettivo è restare in alto.",ef:{m:1,p:2,t:4}},
  {tone:"diretto",txt:"Dipende dal progetto. Non posso permettermi di giocare a certi livelli per il mio sviluppo.",ef:{m:3,p:1,t:-5,v:0.10}},
  {tone:"umile",txt:"Sono leale. Se il club crede in me, ci sarò anche nei momenti difficili.",ef:{m:2,p:4,t:9}},
]},
{ctx:["contract"],q:"La fedeltà al club conta ancora nel calcio moderno?",a:[
  {tone:"diplomatico",txt:"Conta eccome. I tifosi apprezzano chi resta nei momenti difficili. È un valore.",ef:{m:4,p:6,t:5}},
  {tone:"diretto",txt:"Il calcio è un lavoro. La fedeltà deve essere reciproca. Non solo del giocatore.",ef:{m:5,p:3,t:-3,v:0.10}},
  {tone:"umile",txt:"Per me conta molto. Ho un debito di riconoscenza con chi mi ha dato fiducia.",ef:{m:4,p:6,t:8}},
]},
// === INIZIO STAGIONE ===
{ctx:["season_start"],q:"Quali sono le tue ambizioni per questa nuova stagione?",a:[
  {tone:"diplomatico",txt:"Contribuire al massimo agli obiettivi della squadra. Ogni anno voglio fare meglio.",ef:{m:6,p:4,t:6,f:3}},
  {tone:"diretto",txt:"Più gol, più assist, più trofei. Ho una fame enorme. Questa sarà la mia stagione.",ef:{m:9,p:7,t:-3,f:4}},
  {tone:"umile",txt:"Crescere come giocatore e aiutare la squadra. Obiettivi ambiziosi ma realistici.",ef:{m:4,p:4,t:8,f:3}},
]},
{ctx:["season_start"],q:"Come ti sei trovato in preparazione? Ti senti pronto?",a:[
  {tone:"diplomatico",txt:"Preparazione intensa e produttiva. Il gruppo ha lavorato benissimo. Siamo pronti.",ef:{m:5,p:3,t:6,f:4}},
  {tone:"diretto",txt:"Fisicamente sono al top. Non vedo l'ora di iniziare. Ho una fame di gol impressionante.",ef:{m:8,p:5,t:-2,f:5}},
  {tone:"umile",txt:"Mi sono impegnato molto. Non so se sono pronto al 100%, ma darò tutto.",ef:{m:3,p:3,t:8,f:3}},
]},
{ctx:["season_start"],q:"Ci sono nuovi arrivi in rosa. Come li accogli?",a:[
  {tone:"diplomatico",txt:"Con grande apertura. Più qualità abbiamo, meglio è per tutti.",ef:{m:4,p:3,t:6}},
  {tone:"diretto",txt:"Concorrenza benvenuta. Sono sicuro di restare tra i migliori. Stimola.",ef:{m:6,p:4,t:-3}},
  {tone:"umile",txt:"Con piacere. Imparare dai nuovi arrivati è sempre un'opportunità.",ef:{m:3,p:3,t:7}},
]},
{ctx:["season_start"],q:"Quali obiettivi collettivi ha la squadra per questa stagione?",a:[
  {tone:"diplomatico",txt:"Il mister è chiaro: lottare per le prime posizioni. E ci crediamo davvero.",ef:{m:5,p:4,t:7}},
  {tone:"diretto",txt:"Vogliamo vincere qualcosa di importante. Abbiamo la rosa per farlo.",ef:{m:8,p:6,t:-2}},
  {tone:"umile",txt:"Migliorare rispetto all'anno scorso e lottare. Poi vedremo dove arriviamo.",ef:{m:4,p:4,t:7}},
]},
// === FINE STAGIONE ===
{ctx:["season_end"],q:"Come valuti la tua stagione in modo onesto?",a:[
  {tone:"diplomatico",txt:"Con luci e ombre come ogni stagione. Ma sono soddisfatto della crescita.",ef:{m:4,p:4,t:5}},
  {tone:"diretto",txt:"Ottima personalmente. I miei numeri parlano chiaro. Sono tra i migliori.",ef:{m:8,p:7,t:-4}},
  {tone:"umile",txt:"Ho dato il massimo. Potevo fare meglio in alcuni momenti. C'è ancora da lavorare.",ef:{m:3,p:3,t:8}},
]},
{ctx:["season_end"],q:"Cosa porterai con te di questa stagione?",a:[
  {tone:"diplomatico",txt:"L'esperienza e la crescita. Ogni stagione lascia qualcosa di prezioso.",ef:{m:5,p:4,t:5}},
  {tone:"diretto",txt:"I gol, gli assist e la conferma che sono tra i migliori a questo livello.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Le lezioni apprese. Ogni errore mi ha reso più forte. Non buttare via niente.",ef:{m:4,p:4,t:7}},
]},
{ctx:["season_end"],q:"Che obiettivo ti poni per la prossima stagione?",a:[
  {tone:"diplomatico",txt:"Alzare ulteriormente il livello. Personale e collettivo. Ogni anno +1.",ef:{m:6,p:4,t:6,f:3}},
  {tone:"diretto",txt:"Dominare. Voglio essere il migliore della lega. L'anno prossimo sarà il mio.",ef:{m:10,p:7,t:-4,f:4}},
  {tone:"umile",txt:"Lavorare sulle debolezze emerse quest'anno. Voglio essere più completo.",ef:{m:4,p:4,t:8,f:3}},
]},
{ctx:["season_end"],q:"La stagione finisce. Cosa dirai ai tifosi?",a:[
  {tone:"diplomatico",txt:"Grazie per ogni singolo momento. Senza di voi questo viaggio sarebbe vuoto.",ef:{m:5,p:9,t:5}},
  {tone:"diretto",txt:"Abbiamo dato tutto. La prossima stagione sarà ancora meglio. Restate con noi.",ef:{m:7,p:8,t:-1}},
  {tone:"umile",txt:"Scuse per i momenti negativi e grazie per quelli positivi. Vi siamo grati.",ef:{m:4,p:9,t:5}},
]},
// === GIOVANE ===
{ctx:["youth","u18"],q:"Sei giovane e già titolare. Come gestisci questa responsabilità?",a:[
  {tone:"diplomatico",txt:"Con umiltà e rispetto. Ascolto i più esperti e cerco di imparare ogni giorno.",ef:{m:4,p:5,t:8}},
  {tone:"diretto",txt:"La gestisco bene perché sono pronto. L'età non conta, contano le prestazioni.",ef:{m:7,p:6,t:-4}},
  {tone:"umile",txt:"Non è facile. Cerco di non sentire il peso e di giocare con la testa libera.",ef:{m:3,p:4,t:8}},
]},
{ctx:["youth","u18"],q:"Cosa ti distingue dai coetanei con cui hai giocato?",a:[
  {tone:"diplomatico",txt:"Forse la dedizione. Ho sempre sacrificato molto per il calcio.",ef:{m:4,p:4,t:6}},
  {tone:"diretto",txt:"La qualità tecnica e la mentalità vincente. Non mi accontento mai.",ef:{m:8,p:6,t:-4}},
  {tone:"umile",txt:"Non lo so. Forse la fortuna di avere le persone giuste intorno.",ef:{m:3,p:4,t:7}},
]},
{ctx:["youth"],q:"Sei una delle promesse più seguite del campionato. Come ti senti?",a:[
  {tone:"diplomatico",txt:"Onorato ma concentrato. Le etichette non mi interessano, mi interessa giocare bene.",ef:{m:5,p:6,t:5}},
  {tone:"diretto",txt:"È solo l'inizio. Diventerò uno dei migliori del mondo, non solo una promessa.",ef:{m:9,p:7,t:-4}},
  {tone:"umile",txt:"Cerco di non pensarci. Ogni settimana mi alleno come se dovessi guadagnarmi tutto.",ef:{m:4,p:5,t:8}},
]},
{ctx:["youth"],q:"I veterani della squadra ti hanno dato consigli preziosi?",a:[
  {tone:"diplomatico",txt:"Tantissimi. Ho molto da imparare da loro. È un privilegio giocare insieme.",ef:{m:4,p:4,t:8}},
  {tone:"diretto",txt:"Qualcuno sì. Ma ho anche qualcosa da insegnare io. Non sono solo un allievo.",ef:{m:6,p:4,t:-4}},
  {tone:"umile",txt:"Ogni giorno imparo da loro. Cerco di assorbire tutto come una spugna.",ef:{m:3,p:4,t:9}},
]},
// === VETERANO ===
{ctx:["veteran"],q:"Quanti anni ancora ti vedi giocare ad alto livello?",a:[
  {tone:"diplomatico",txt:"Non lo so. Finché il corpo regge e la testa vuole. Non mi pongo limiti.",ef:{m:5,p:5,t:4}},
  {tone:"diretto",txt:"Ancora molti. Mi curo benissimo. Sono più forte di molti giovani che conosco.",ef:{m:8,p:5,t:-3}},
  {tone:"umile",txt:"Anno dopo anno. Non programmo troppo. Ascolto il corpo e il cuore.",ef:{m:4,p:5,t:5}},
]},
{ctx:["veteran"],q:"Cosa diresti a te stesso di vent'anni fa?",a:[
  {tone:"diplomatico",txt:"Di godersi ogni momento. La carriera passa in fretta. Ogni partita è un dono.",ef:{m:6,p:6,t:4}},
  {tone:"diretto",txt:"Che avevo tutte le qualità per arrivare ancora più in alto. Forse ho fatto meno del potenziale.",ef:{m:4,p:4,t:-1}},
  {tone:"umile",txt:"Di essere ancora più umile e paziente. I frutti del lavoro arrivano sempre.",ef:{m:5,p:6,t:6}},
]},
{ctx:["veteran"],q:"Il calcio è cambiato da quando hai iniziato?",a:[
  {tone:"diplomatico",txt:"Molto. Più veloce, più fisico, più tattico. Ma i fondamentali restano gli stessi.",ef:{m:4,p:5,t:4}},
  {tone:"diretto",txt:"Sì, ma mi sono adattato. I migliori si adattano sempre. Io sono ancora qui.",ef:{m:7,p:5,t:-3}},
  {tone:"umile",txt:"Enormemente. Ogni generazione ha la sua mentalità. Cerco di capire e adattarmi.",ef:{m:4,p:5,t:5}},
]},
{ctx:["veteran"],q:"Come trasmetti la tua esperienza ai più giovani della rosa?",a:[
  {tone:"diplomatico",txt:"Con l'esempio prima di tutto. Le parole contano meno di ciò che fai in campo.",ef:{m:5,p:5,t:7}},
  {tone:"diretto",txt:"Dico loro cosa non fare. Ho fatto molti errori, meglio che non li ripetano.",ef:{m:6,p:5,t:2}},
  {tone:"umile",txt:"Condivido la mia esperienza con chi vuole ascoltare. Non impongo nulla.",ef:{m:4,p:5,t:8}},
]},
// === BUONA FORMA ===
{ctx:["good_form","win"],q:"Sei nel momento di forma migliore della stagione. Qual è il segreto?",a:[
  {tone:"diplomatico",txt:"Lavoro, riposo e un ambiente positivo. La squadra mi supporta alla grande.",ef:{m:6,p:5,t:6,f:3}},
  {tone:"diretto",txt:"Finalmente esprimo tutto il mio potenziale. Era solo questione di tempo.",ef:{m:10,p:8,t:-4,f:4}},
  {tone:"umile",txt:"Mi sento bene e cerco di trasformarlo in gioco. Non voglio sprecare questo momento.",ef:{m:5,p:5,t:7,f:3}},
]},
{ctx:["good_form"],q:"Come mantieni questa continuità di rendimento?",a:[
  {tone:"diplomatico",txt:"Routine, concentrazione e umiltà. Ogni partita come se fosse la prima.",ef:{m:5,p:4,t:6,f:2}},
  {tone:"diretto",txt:"Sono un professionista serio. La continuità è il frutto del mio lavoro costante.",ef:{m:8,p:6,t:-3,f:3}},
  {tone:"umile",txt:"Non so quanto durerà. Cerco di non pensarci e di godermi ogni momento.",ef:{m:4,p:4,t:7,f:2}},
]},
{ctx:["good_form"],q:"Con questo rendimento, ti senti pronto per un palcoscenico più grande?",a:[
  {tone:"diplomatico",txt:"Mi concentro su {club}. Se arriva qualcosa di importante, ci penserò a tempo debito.",ef:{m:5,p:5,t:5,v:0.10}},
  {tone:"diretto",txt:"Assolutamente. Sono pronto per qualsiasi sfida. Questo è il mio livello naturale.",ef:{m:9,p:8,t:-5,v:0.20}},
  {tone:"umile",txt:"Ogni giorno sono qui. Non so cosa mi riserva il futuro. Penso a oggi.",ef:{m:3,p:4,t:6,v:0.05}},
]},
// === FORMA BASSA ===
{ctx:["bad_form","loss"],q:"Stai attraversando un periodo di forma non brillante. Come spieghi il calo?",a:[
  {tone:"diplomatico",txt:"Ogni giocatore ha momenti difficili. Sto lavorando per ritrovare la condizione.",ef:{m:-1,p:1,t:5}},
  {tone:"diretto",txt:"Non è un calo di forma, è un momento. Tornerò ai miei livelli presto. Ne sono sicuro.",ef:{m:3,p:2,t:-4}},
  {tone:"umile",txt:"Non lo so esattamente. Analizzo insieme al mister. Sto lavorando per migliorare.",ef:{m:-1,p:1,t:7}},
]},
{ctx:["bad_form"],q:"Come stai lavorando per ritrovare il tuo miglior livello?",a:[
  {tone:"diplomatico",txt:"Con il mister e lo staff tecnico. Analizzo gli errori e lavoro sulle lacune.",ef:{m:1,p:2,t:7}},
  {tone:"diretto",txt:"Da solo, intensamente. Non ho bisogno che mi dicano cosa fare. Lo so.",ef:{m:3,p:2,t:-5}},
  {tone:"umile",txt:"Ascoltando il mister e facendo il doppio del lavoro. Non mi arrendere mai.",ef:{m:1,p:2,t:8}},
]},
{ctx:["bad_form"],q:"Le critiche dei media ti aiutano o ti disturbano in questo momento?",a:[
  {tone:"diplomatico",txt:"Cerco di prendere il costruttivo e ignorare il resto. Non è sempre facile.",ef:{m:0,p:1,t:4}},
  {tone:"diretto",txt:"Non leggo i giornali. Le critiche le sento solo dal mister. Gli altri non contano.",ef:{m:3,p:-1,t:-2}},
  {tone:"umile",txt:"Le accetto. Quando non rendo devo aspettarmi le critiche. Fa parte del lavoro.",ef:{m:-1,p:2,t:6}},
]},
// === MORALE BASSO ===
{ctx:["low_morale"],q:"Sembra un periodo difficile per te. Come stai mentalmente?",a:[
  {tone:"diplomatico",txt:"Ho momenti difficili come tutti. Ma il lavoro è la terapia migliore.",ef:{m:2,p:2,t:5}},
  {tone:"diretto",txt:"Non sono al massimo, ma questo mi fa arrabbiare nel senso buono. Reagisco.",ef:{m:4,p:2,t:-3}},
  {tone:"umile",txt:"Non è un periodo semplice. Ma so che passerà. Mi fido del processo.",ef:{m:2,p:2,t:6}},
]},
{ctx:["low_morale"],q:"Come trovi motivazione nei momenti difficili della carriera?",a:[
  {tone:"diplomatico",txt:"Penso alla famiglia, ai tifosi, ai compagni. Non si può mollare quando gli altri contano su di te.",ef:{m:3,p:4,t:5}},
  {tone:"diretto",txt:"La motivazione non mi manca mai. Sono un guerriero. I momenti difficili mi irrobustiscono.",ef:{m:5,p:3,t:-3}},
  {tone:"umile",txt:"Torno alle origini. Perché ho iniziato. Quella passione infantile non finisce mai.",ef:{m:4,p:4,t:6}},
]},
// === ALTA POPOLARITÀ ===
{ctx:["high_popularity"],q:"Sei diventato un idolo per i tifosi. Come vivi questa fama?",a:[
  {tone:"diplomatico",txt:"Con responsabilità. Essere amato dai tifosi è un privilegio, non un diritto.",ef:{m:5,p:8,t:4}},
  {tone:"diretto",txt:"È meritato. Lavoro duro per dare emozioni. Sono contento che lo riconoscano.",ef:{m:7,p:8,t:-3}},
  {tone:"umile",txt:"Mi imbarazza un po'. Cerco di essere degno di questa fiducia ogni partita.",ef:{m:4,p:9,t:5}},
]},
{ctx:["high_popularity"],q:"Ricevi molti messaggi dai tifosi. Cosa ti scrivono più spesso?",a:[
  {tone:"diplomatico",txt:"Parole di supporto e affetto. Mi danno energia straordinaria. Li ringrazierò sempre.",ef:{m:6,p:7,t:3}},
  {tone:"diretto",txt:"Mi ringraziano per le emozioni. È il motivo per cui gioco a calcio.",ef:{m:7,p:7,t:-1}},
  {tone:"umile",txt:"Messaggi bellissimi che mi commuovono. Sono loro l'energia di cui ho bisogno.",ef:{m:5,p:8,t:4}},
]},
// === FIDUCIA ALLENATORE ALTA ===
{ctx:["high_trust"],q:"Il mister si fida ciecamente di te. Come ricambi questa fiducia?",a:[
  {tone:"diplomatico",txt:"Con il lavoro, la dedizione e il rispetto per le sue scelte tattiche.",ef:{m:5,p:4,t:9}},
  {tone:"diretto",txt:"Con le prestazioni. È il miglior modo per ricambiare. E lo faccio ogni domenica.",ef:{m:8,p:5,t:2}},
  {tone:"umile",txt:"Non do mai per scontata la sua fiducia. Ogni giorno cerco di meritarla.",ef:{m:4,p:4,t:10}},
]},
// === FIDUCIA ALLENATORE BASSA ===
{ctx:["low_trust"],q:"Sembra che il mister ti preferisca altri. Come ti senti?",a:[
  {tone:"diplomatico",txt:"Rispetto le sue scelte. Quando gioco devo fare capire che merito il posto.",ef:{m:-2,p:1,t:4}},
  {tone:"diretto",txt:"Non sono d'accordo con le sue scelte. Ho le qualità per giocare titolare sempre.",ef:{m:2,p:-1,t:-8}},
  {tone:"umile",txt:"Devo meritare di più la sua fiducia. Lavoro per conquistarmela partita dopo partita.",ef:{m:-1,p:1,t:7}},
]},
{ctx:["low_trust"],q:"Come gestisci il fatto di non essere sempre titolare?",a:[
  {tone:"diplomatico",txt:"Con professionalità. Mi tengo pronto. Quando entro voglio fare la differenza.",ef:{m:-1,p:2,t:5}},
  {tone:"diretto",txt:"Male, sinceramente. Merito più spazio. Dirò al mister quello che penso.",ef:{m:2,p:-1,t:-7}},
  {tone:"umile",txt:"Con la testa bassa. Lavoro in silenzio e aspetto il mio momento. Arriverà.",ef:{m:-1,p:2,t:8}},
]},
// === TOP SCORER ===
{ctx:["top_scorer","win"],cond:(p,v)=>{try{if(v&&v.matchResult&&v.matchResult.context&&v.matchResult.context!=="career")return false;if(typeof generateLeagueScorers!=="function")return true;const sc=generateLeagueScorers(p);return !!(sc&&sc.length&&sc[0]&&sc[0].isPlayer);}catch(e){return false;}},/* [7.164.0 deferito M5] «capocannoniere AL MOMENTO» solo se sei DAVVERO 1° nella classifica marcatori di lega (e la gara era di campionato) */q:"Capocannoniere del campionato al momento. Ci punti davvero?",a:[
  {tone:"diplomatico",txt:"Non ci penso. Preferisco che la squadra vinca. I gol arrivano di conseguenza.",ef:{m:5,p:5,t:6}},
  {tone:"diretto",txt:"Certo. Voglio essere il migliore realizzatore. È un riconoscimento che merito.",ef:{m:9,p:8,t:-4}},
  {tone:"umile",txt:"Non è una priorità. Se arriva in modo naturale, ben venga. Prima il collettivo.",ef:{m:4,p:5,t:7}},
]},
// === PRO STATUS ===
{ctx:["pro"],q:"Come vivi la transizione dal calcio giovanile al professionismo?",a:[
  {tone:"diplomatico",txt:"È stata la sfida più bella. L'intensità è diversa ma mi sono adattato.",ef:{m:4,p:4,t:5}},
  {tone:"diretto",txt:"La aspettavo da sempre. Ero pronto. Il salto è grande ma io sono più grande.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Imparando ogni giorno. Il professionismo ti insegna molto in poco tempo.",ef:{m:3,p:4,t:8}},
]},
// === WIN - extra ===
{ctx:["win","good_form"],q:"Con questa forma smagliante, il mercato estivo si scalda. Ne sei consapevole?",a:[
  {tone:"diplomatico",txt:"Non ne so nulla. Sono concentrato su {club} e sulla stagione. Il resto non esiste.",ef:{m:4,p:5,t:6,v:0.10}},
  {tone:"diretto",txt:"L'interesse è logico quando giochi così. Ma ora sono qui e voglio vincere qualcosa.",ef:{m:7,p:7,t:-4,v:0.20}},
  {tone:"umile",txt:"Penso solo al prossimo allenamento. Il mercato è lontano. Ora c'è solo {club}.",ef:{m:3,p:4,t:7,v:0.05}},
]},
// === LOSS - extra ===
{ctx:["loss","bad_form"],q:"Sconfitta e forma calante. È il momento più difficile della tua stagione?",a:[
  {tone:"diplomatico",txt:"Sì, è un momento difficile. Ma sono professionista. Rialzo la testa e lavoro.",ef:{m:-2,p:1,t:5}},
  {tone:"diretto",txt:"Ho passato di peggio. Non si tratta di forma ma di un momento. Tornerò forte.",ef:{m:2,p:2,t:-3}},
  {tone:"umile",txt:"Forse sì. Ma nei momenti difficili si capisce il carattere. Non mi arrendo.",ef:{m:-1,p:2,t:7}},
]},
// === WEEKLY - extra ===
{ctx:["weekly"],y:1,q:"Preferisci giocare a casa o in trasferta?",a:[
  {tone:"diplomatico",txt:"A casa l'energia dei tifosi è speciale. Ma so vincere anche fuori. Dipende.",ef:{m:3,p:4,t:3}},
  {tone:"diretto",txt:"Mi esalto in trasferta. Il silenzio ostile mi motiva ancora di più.",ef:{m:6,p:4,t:-2}},
  {tone:"umile",txt:"Dove gioco, gioco al meglio. L'importante è essere utile in qualsiasi situazione.",ef:{m:3,p:3,t:5}},
]},
{ctx:["weekly"],q:"C'è qualcosa che cambieresti del calcio moderno?",a:[
  {tone:"diplomatico",txt:"Più rispetto per i valori originali del gioco. Ma il calcio evolve e dobbiamo stare al passo.",ef:{m:3,p:4,t:3}},
  {tone:"diretto",txt:"Meno teatranti e più giocatori veri. Il calcio deve tornare ad essere sport.",ef:{m:5,p:5,t:-2}},
  {tone:"umile",txt:"Non mi permetto di giudicare. Sono piccolo davanti alla storia del calcio.",ef:{m:2,p:3,t:5}},
]},
{ctx:["weekly"],q:"Cosa ti ha sorpreso di più del calcio professionistico rispetto al calcio giovanile?",a:[
  {tone:"diplomatico",txt:"La intensità mentale. Non è solo fisico. Ogni giorno è una sfida psicologica.",ef:{m:3,p:3,t:5}},
  {tone:"diretto",txt:"Quanto sia diverso in realtà. Molti non reggono il salto. Io l'ho fatto.",ef:{m:6,p:4,t:-3}},
  {tone:"umile",txt:"La professionalità di tutti. Anche il più piccolo dettaglio conta enormemente.",ef:{m:3,p:3,t:7}},
]},
{ctx:["weekly"],y:1,q:"Che musica ascolti per caricarti prima delle partite?",a:[
  {tone:"diplomatico",txt:"Dipende dall'umore. A volte ritmo, a volte calma. L'importante è entrare nel giusto stato.",ef:{m:4,p:5,t:3}},
  {tone:"diretto",txt:"Roba che pompa l'adrenalina. Entro in campo come una macchina da guerra.",ef:{m:6,p:5,t:-2}},
  {tone:"umile",txt:"Qualcosa che mi riporta alle origini. Mi ricorda perché amo questo sport.",ef:{m:4,p:5,t:4}},
]},
// === EXTRA WIN ===
{ctx:["win"],q:"Vittoria dopo una settimana di polemiche. Come ti senti ora?",a:[
  {tone:"diplomatico",txt:"Il campo è l'unica risposta vera. Felice di aver dimostrato il nostro valore.",ef:{m:7,p:6,t:5}},
  {tone:"diretto",txt:"Esatto. Chi ha detto che non siamo forti può ricredersi. Noi parliamo con i fatti.",ef:{m:10,p:7,t:-4}},
  {tone:"umile",txt:"Sono contento ma non mi sento in debito con nessuno. Si lavora e basta.",ef:{m:5,p:5,t:7}},
]},
{ctx:["win"],q:"Questa vittoria rafforza la tua posizione in squadra?",a:[
  {tone:"diplomatico",txt:"Non penso in questi termini. Lavoro per la squadra, non per me stesso.",ef:{m:4,p:3,t:8}},
  {tone:"diretto",txt:"Dimostro ogni partita chi sono. Chi aveva dubbi adesso ha le risposte.",ef:{m:9,p:6,t:-5}},
  {tone:"umile",txt:"Spero di aver contribuito. Il posto si guadagna ogni giorno, non con una sola gara.",ef:{m:4,p:4,t:9}},
]},
{ctx:["win"],q:"Il vostro mister ha esaltato la tua duttilità tattica. Ti sorprende?",a:[
  {tone:"diplomatico",txt:"Il mister sa esaltare le caratteristiche di ogni giocatore. Lo ringrazio.",ef:{m:5,p:4,t:10}},
  {tone:"diretto",txt:"Sono un giocatore completo. Posso fare più cose bene. Non mi sorprende.",ef:{m:8,p:5,t:-2}},
  {tone:"umile",txt:"Mi impegno a migliorare su tutto. Il mister mi vede lavorare ogni giorno.",ef:{m:4,p:4,t:9}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.assists||0)>=3),/* [7.161.0 A1] numero preciso ⇒ dev'essere vero */q:"Tre assist oggi, il massimo stagionale. È la tua partita migliore?",a:[
  {tone:"diplomatico",txt:"Una buona giornata. Ma ho ancora margini di miglioramento importanti.",ef:{m:6,p:6,t:6}},
  {tone:"diretto",txt:"Forse sì. Ero ovunque. Visione, tecnica, timing. Tutto è andato alla perfezione.",ef:{m:11,p:9,t:-4}},
  {tone:"umile",txt:"I compagni hanno finalizzato benissimo. Il merito è condiviso, non solo mio.",ef:{m:5,p:6,t:8}},
]},
{ctx:["win"],q:"Come descriveresti l'atmosfera nello spogliatoio dopo questa vittoria?",a:[
  {tone:"diplomatico",txt:"Gioiosa e unita. È bello vincere insieme. Questo gruppo ha un'anima forte.",ef:{m:7,p:6,t:6}},
  {tone:"diretto",txt:"Carica. Quando vinciamo così tutti capiscono che possiamo fare grandi cose.",ef:{m:10,p:7,t:-2}},
  {tone:"umile",txt:"Felice e tranquilla. Non esageriamo mai. Il mister ci tiene coi piedi per terra.",ef:{m:5,p:5,t:9}},
]},
{ctx:["win"],q:"Prima della partita eri nervoso o tranquillo?",a:[
  {tone:"diplomatico",txt:"Un po' teso come sempre prima di una partita importante. È normale.",ef:{m:4,p:3,t:4}},
  {tone:"diretto",txt:"Carico e concentrato. Il nervosismo non mi appartiene. Mi preparo e vado.",ef:{m:8,p:5,t:-2}},
  {tone:"umile",txt:"Nervoso sì. Mi aiuta a restare concentrato. Poi il fischio iniziale azzera tutto.",ef:{m:4,p:4,t:5}},
]},
// === EXTRA LOSS ===
{ctx:["loss"],q:"Sconfitta netta. Il tecnico ha detto che ci si aspettava di più. Come rispondi?",a:[
  {tone:"diplomatico",txt:"Ha ragione. Non siamo stati all'altezza. Dobbiamo fare meglio tutti.",ef:{m:-1,p:1,t:7}},
  {tone:"diretto",txt:"Ha ragione sul risultato, ma non sulle cause. Non è così semplice.",ef:{m:2,p:-1,t:-6}},
  {tone:"umile",txt:"Accetto la critica. Ripartirò da zero mentalmente e darò il massimo in settimana.",ef:{m:-2,p:1,t:8}},
]},
{ctx:["loss"],q:"L'avversario ha sfruttato una vostra debolezza nota. Come si risolve?",a:[
  {tone:"diplomatico",txt:"Ci lavoriamo in allenamento. Il mister ha già identificato le soluzioni.",ef:{m:0,p:1,t:7}},
  {tone:"diretto",txt:"Non è solo una debolezza nostra. L'avversario è stato bravo ma anche fortunato.",ef:{m:2,p:-1,t:-4}},
  {tone:"umile",txt:"Lo riconosco. Devo migliorare anch'io in quella fase. Lo chiedo al mister.",ef:{m:-1,p:1,t:8}},
]},
{ctx:["loss"],cond:(p,v)=>{if(!v||!v.matchResult)return false;const _d=((v.matchResult.homeScore||0)-(v.matchResult.awayScore||0))*((v.isHome===false)?-1:1);return _d===-1;},/* [7.178.0 RC-9] «beffa nel recupero» ⇒ almeno sconfitta di MISURA (0-3 nel primo tempo non è una beffa al 93) */q:"Un gol subito nel recupero. Quanto fa male?",a:[
  {tone:"diplomatico",txt:"Moltissimo. Ma fa parte del calcio. Ci consoliamo col lavoro in settimana.",ef:{m:-4,p:1,t:4}},
  {tone:"diretto",txt:"Una beffa enorme. Avevamo meritato almeno il pareggio. Non è giusto.",ef:{m:-2,p:0,t:-3}},
  {tone:"umile",txt:"Fa malissimo. Ma dobbiamo imparare a gestire meglio la pressione finale.",ef:{m:-3,p:1,t:6}},
]},
{ctx:["loss"],cond:(p,v)=>{try{if(v&&v.matchResult&&v.matchResult.context&&v.matchResult.context!=="career")return false;const st=[...(p.standings||[])].sort((a,b)=>b.pts-a.pts||(b.gd||0)-(a.gd||0));const i=st.findIndex(t=>t.id===(p.club?.id)||t.n===(p.club?.n));return i>=0&&st.length>6&&i>=st.length-6;}catch(e){return false;}},/* [7.161.0 A1] solo se la classifica REALE è nella zona bassa (ultime 6) e la gara era di campionato */q:"La zona retrocessione si avvicina. Preoccupato?",a:[
  {tone:"diplomatico",txt:"Monitoriamo la classifica ma restiamo concentrati sul lavoro. Non siamo in panico.",ef:{m:-1,p:1,t:5}},
  {tone:"diretto",txt:"Non retrocederemo. Abbiamo la qualità per uscirne. Ho fiducia in questo gruppo.",ef:{m:3,p:2,t:-3}},
  {tone:"umile",txt:"È un campanello d'allarme. Dobbiamo prendere la situazione più seriamente.",ef:{m:-2,p:1,t:7}},
]},
{ctx:["loss"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.redCard||v.matchResult.sentOff)),/* [7.161.0 A1] espulsione VERA (redCard/sentOff dal vivo) */q:"Espulsione in partita che ha complicato tutto. Come giudichi l'episodio?",a:[
  {tone:"diplomatico",txt:"Non ho niente da dire sul direttore di gara. Ci penserà il club nelle sedi opportune.",ef:{m:-1,p:1,t:4}},
  {tone:"diretto",txt:"Espulsione assurda. Non era fallo. Il risultato è falsato. Lo dico chiaramente.",ef:{m:2,p:-2,t:-6}},
  {tone:"umile",txt:"Prendo il cartellino e lo squadrone subisce. Devo essere più intelligente in campo.",ef:{m:-3,p:0,t:5}},
]},
{ctx:["loss"],cond:(p,v)=>!!(v&&v.isHome===false&&v.matchResult&&((v.matchResult.awayScore||0)-(v.matchResult.homeScore||0))>=2),/* [7.161.0 A1] trasferta VERA + scarto ≥2 (la classe del collaudo 7.1.3 sfuggita alla bonifica) */q:"Sconfitta pesante fuori casa. Si può parlare di resa?",a:[
  {tone:"diplomatico",txt:"No, mai. Abbiamo lottato fino alla fine. Non ci rassegniamo mai.",ef:{m:1,p:2,t:5}},
  {tone:"diretto",txt:"Assolutamente no. Ho dato tutto. Non può chiamarsi resa il mio atteggiamento.",ef:{m:3,p:2,t:-3}},
  {tone:"umile",txt:"È stata una giornata difficile. Ma non molliamo mai. Reazione immediata.",ef:{m:0,p:2,t:6}},
]},
// === EXTRA DRAW ===
{ctx:["draw"],q:"Pareggio utile o sprecato? Come ti senti?",a:[
  {tone:"diplomatico",txt:"Dipende dal contesto della stagione. Oggi direi utile, ma potevamo fare meglio.",ef:{m:2,p:2,t:4}},
  {tone:"diretto",txt:"Sprecato. Avevamo il vantaggio e lo abbiamo perso. Non è accettabile.",ef:{m:0,p:1,t:-3}},
  {tone:"umile",txt:"Sono deluso ma non abbattuto. Era una partita difficile e abbiamo tenuto.",ef:{m:1,p:2,t:5}},
]},
{ctx:["draw"],cond:(p,v)=>!(v&&v.matchResult&&v.matchResult.context&&v.matchResult.context!=="career"),/* [7.164.0 deferito M5] domanda a tema CLASSIFICA: mai dopo una gara di coppa/Europa/nazionale */q:"Il pareggio in questo momento è un risultato positivo per la classifica?",a:[
  {tone:"diplomatico",txt:"In questo momento della stagione può essere utile. Mantiene la posizione.",ef:{m:2,p:2,t:4}},
  {tone:"diretto",txt:"No. Vogliamo sempre vincere. Un punto non basta per i nostri obiettivi.",ef:{m:3,p:2,t:-3}},
  {tone:"umile",txt:"Un punto è comunque importante. Ma dobbiamo ambire a di più nel lungo periodo.",ef:{m:2,p:2,t:5}},
]},
// === EXTRA SETTIMANALE ===
{ctx:["weekly"],q:"Come gestisci le aspettative dei media sulla tua carriera?",a:[
  {tone:"diplomatico",txt:"Con distacco professionale. Leggo poco e lavoro molto. È la mia strategia.",ef:{m:3,p:2,t:4}},
  {tone:"diretto",txt:"Non me ne occupo. Sono io il giudice del mio lavoro, non i giornalisti.",ef:{m:5,p:-1,t:-3}},
  {tone:"umile",txt:"Cerco di prendere spunto dal feedback. Alcune osservazioni sono utili.",ef:{m:2,p:2,t:5}},
]},
{ctx:["weekly"],q:"Hai mai pensato di giocare in un altro campionato estero?",a:[
  {tone:"diplomatico",txt:"Ogni calciatore ci pensa. Ma ora sono concentrato qui e sto bene.",ef:{m:3,p:4,t:4,v:0.05}},
  {tone:"diretto",txt:"Ci penserei volentieri. Le mie qualità si adattano a qualsiasi campionato.",ef:{m:5,p:5,t:-4,v:0.15}},
  {tone:"umile",txt:"Non lo so. Prima devo dimostrare tutto qui. Il resto è futuro.",ef:{m:2,p:3,t:5}},
]},
{ctx:["weekly"],cond:p=>(p.nationalCaps||0)>0||(((p.ovr||60)>=76)&&!LEAGUE_PAIRS.some(([u,l])=>l===p.club?.lg)),/* [6.97.0] pertinente solo con caps o profilo da nazionale */q:"Cosa pensi del sistema delle convocazioni in Nazionale?",a:[
  {tone:"diplomatico",txt:"Il ct ha la sua visione e la rispetto. Lavoro per convincerlo con le prestazioni.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Merito più spazio. I miei numeri lo dimostrano. Spero vengano notati prima o poi.",ef:{m:5,p:4,t:-4}},
  {tone:"umile",txt:"Non mi permetto di commentare. Il ct sa cosa fa. Resto concentrato sul club.",ef:{m:2,p:3,t:6}},
]},
{ctx:["weekly"],y:1,q:"Qual è la vostra tattica favorita come squadra?",a:[
  {tone:"diplomatico",txt:"Quella che il mister decide. Siamo flessibili e ci adattiamo all'avversario.",ef:{m:3,p:2,t:7}},
  {tone:"diretto",txt:"Giocare in avanti, pressare alto. Quando attacchiamo siamo devastanti.",ef:{m:6,p:4,t:-3}},
  {tone:"umile",txt:"Quella che massimizza le qualità di tutti. Non esiste una tattica perfetta.",ef:{m:3,p:3,t:6}},
]},
{ctx:["weekly"],cond:p=>!p.isCaptain,/* [7.256.0 screenshot PO «il capitano è l'eroe stesso!»] la domanda presuppone un capitano TERZO: con la fascia al braccio (onore 7.5.0) non ha senso — pertinenza 6.97.0 */q:"Come ti rapporti con il capitano della squadra?",a:[
  {tone:"diplomatico",txt:"Ottimamente. È un punto di riferimento per tutti. Rispetto la sua esperienza.",ef:{m:4,p:3,t:7}},
  {tone:"diretto",txt:"Bene. Siamo due leader diversi ma complementari nello spogliatoio.",ef:{m:6,p:4,t:-2}},
  {tone:"umile",txt:"Con grande rispetto. Cerco di imparare da lui ogni giorno. È un esempio.",ef:{m:3,p:3,t:8}},
]},
{ctx:["weekly"],y:1,q:"Qual è stata la vostra settimana di allenamento più dura questa stagione?",a:[
  {tone:"diplomatico",txt:"Ce ne sono state diverse. Il mister alza sempre il livello per prepararci meglio.",ef:{m:3,p:2,t:6}},
  {tone:"diretto",txt:"Quella pre-stagione. Ma io amo i carichi pesanti. Mi forgia mentalmente.",ef:{m:5,p:3,t:-1}},
  {tone:"umile",txt:"Non saprei. Ogni settimana è dura. Cerco di dare il massimo in ogni seduta.",ef:{m:3,p:3,t:7}},
]},
{ctx:["weekly"],q:"Come mantieni l'equilibrio tra vita privata e calcio?",a:[
  {tone:"diplomatico",txt:"Con la famiglia e il riposo. Staccare è fondamentale per ritornare al 100%.",ef:{m:5,p:4,t:3}},
  {tone:"diretto",txt:"Il calcio è al primo posto. La vita privata si adatta. È la mia scelta.",ef:{m:6,p:3,t:-2}},
  {tone:"umile",txt:"Non è sempre facile. Ma ho persone accanto che mi aiutano a stare bene.",ef:{m:4,p:4,t:4}},
]},
{ctx:["weekly"],y:1,q:"Guardi il calcio anche da tifoso o per te è solo lavoro?",a:[
  {tone:"diplomatico",txt:"Sono sempre un tifoso. Amo il calcio come lo amavo da bambino. Non cambia.",ef:{m:5,p:6,t:3}},
  {tone:"diretto",txt:"Guardo soprattutto per studiare gli avversari. Ma l'amore per il calcio c'è.",ef:{m:5,p:4,t:-1}},
  {tone:"umile",txt:"Quando posso mi siedo e guardo come un tifoso vero. Mi ricorda perché gioco.",ef:{m:4,p:6,t:4}},
]},
{ctx:["weekly"],y:1,q:"C'è qualcosa che vorresti migliorare nel vostro gioco collettivo?",a:[
  {tone:"diplomatico",txt:"Sempre qualcosa. Il mister individua le aree e noi lavoriamo per migliorarle.",ef:{m:3,p:2,t:7}},
  {tone:"diretto",txt:"La concretezza sotto porta. Creiamo tanto ma convertiamo poco. Dobbiamo migliorare.",ef:{m:4,p:3,t:-2}},
  {tone:"umile",txt:"Molte cose. La perfezione non esiste nel calcio. Ogni giorno miglioriamo.",ef:{m:3,p:3,t:7}},
]},
{ctx:["weekly"],y:1,q:"Chi è il compagno più importante per il tuo gioco?",a:[
  {tone:"diplomatico",txt:"Tutti lo sono a modo loro. Ogni ruolo del campo è fondamentale per il collettivo.",ef:{m:4,p:4,t:6}},
  {tone:"diretto",txt:"Quelli che capiscono i miei movimenti. Non tutti lo fanno ma ci sono.",ef:{m:6,p:3,t:-4}},
  {tone:"umile",txt:"Chi mi crea gli spazi. Ma è un lavoro collettivo. Non un solo compagno.",ef:{m:3,p:4,t:6}},
]},
{ctx:["weekly"],y:1,q:"Parli spesso con il tecnico durante la settimana?",a:[
  {tone:"diplomatico",txt:"Sì, c'è dialogo costante. È fondamentale per capire cosa si aspetta da me.",ef:{m:4,p:3,t:9}},
  {tone:"diretto",txt:"Quando serve. Non ho bisogno di conferme continue. So cosa devo fare.",ef:{m:6,p:3,t:-3}},
  {tone:"umile",txt:"Cerco di farlo il più possibile. Il suo feedback è prezioso per migliorare.",ef:{m:3,p:3,t:10}},
]},
{ctx:["weekly"],y:1,q:"Cosa significa per te giocare davanti al tuo pubblico?",a:[
  {tone:"diplomatico",txt:"Un'emozione speciale ogni volta. L'energia del pubblico cambia tutto.",ef:{m:5,p:8,t:4}},
  {tone:"diretto",txt:"Mi responsabilizza. Davanti a loro devo dare sempre di più. E lo faccio.",ef:{m:7,p:7,t:-1}},
  {tone:"umile",txt:"Mi emoziono ancora ogni volta. È un privilegio enorme. Non lo do per scontato.",ef:{m:5,p:8,t:4}},
]},
// === EXTRA CONTRACT ===
{ctx:["contract"],q:"Come definiresti il rapporto con il club in questo momento?",a:[
  {tone:"diplomatico",txt:"Professionale e rispettoso. Ci confrontiamo e valutiamo il futuro insieme.",ef:{m:4,p:3,t:7,v:0.05}},
  {tone:"diretto",txt:"Ci sono cose da chiarire. Voglio le garanzie giuste per restare motivato.",ef:{m:4,p:2,t:-4,v:0.10}},
  {tone:"umile",txt:"Buono. Mi hanno dato fiducia. Spero di ripagarla al meglio fino alla fine.",ef:{m:3,p:3,t:8}},
]},
{ctx:["contract"],q:"Se arrivasse un'offerta importante all'estero, cosa faresti?",a:[
  {tone:"diplomatico",txt:"Valuterei insieme al mio entourage. Non si può escludere nulla a priori.",ef:{m:3,p:4,t:3,v:0.10}},
  {tone:"diretto",txt:"La prenderei in seria considerazione. Un giocatore deve pensare anche al proprio sviluppo.",ef:{m:5,p:5,t:-6,v:0.20}},
  {tone:"umile",txt:"Prima di tutto parlerei con il club. La lealtà è importante per me.",ef:{m:3,p:4,t:7,v:0.05}},
]},
// === EXTRA VETERAN ===
{ctx:["veteran"],q:"Hai mai pensato di allenare dopo il ritiro?",a:[
  {tone:"diplomatico",txt:"È un'idea che mi stuzzica. Ma prima finisco la carriera da giocatore. C'è ancora tanto.",ef:{m:4,p:4,t:3}},
  {tone:"diretto",txt:"Forse sì. Ma come allenatore voglio il massimo. Solo squadre top.",ef:{m:5,p:4,t:-2}},
  {tone:"umile",txt:"Non lo so ancora. Prima voglio godere di ogni momento che mi resta da giocatore.",ef:{m:4,p:5,t:4}},
]},
{ctx:["veteran"],q:"C'è un giovane della rosa che potrebbe diventare un grande campione?",a:[
  {tone:"diplomatico",txt:"Ho visto talenti enormi in allenamento. Preferisco non fare nomi per non caricarli.",ef:{m:4,p:5,t:5}},
  {tone:"diretto",txt:"Qualcuno sì. Ma il talento da solo non basta. Dipende da loro quanto ci credono.",ef:{m:5,p:4,t:-2}},
  {tone:"umile",txt:"Diversi. Mi piace vedere i giovani crescere. Cerco di aiutarli quando posso.",ef:{m:4,p:5,t:6}},
]},
// === EXTRA YOUTH ===
{ctx:["youth"],q:"Com'è gestire i social media quando sei così giovane e popolare?",a:[
  {tone:"diplomatico",txt:"Con attenzione e consapevolezza. I social sono una responsabilità importante.",ef:{m:3,p:6,t:3}},
  {tone:"diretto",txt:"Benissimo. Mi piace condividere il mio percorso. Ho tanti fan giovani.",ef:{m:5,p:8,t:-2}},
  {tone:"umile",txt:"Con parsimonia. Preferisco che il campo parli per me. Non sono un influencer.",ef:{m:2,p:5,t:5}},
]},
{ctx:["youth"],q:"Come gestisci la pressione di essere una giovane promessa?",a:[
  {tone:"diplomatico",txt:"Con la routine e il supporto delle persone care. Non mi lascio travolgere.",ef:{m:4,p:4,t:5}},
  {tone:"diretto",txt:"Non mi pesa. Sono abituato alle aspettative. Le trasformo in carburante.",ef:{m:7,p:5,t:-3}},
  {tone:"umile",txt:"Non è sempre facile. Ma so che il lavoro e la pazienza pagano sempre.",ef:{m:3,p:4,t:7}},
]},
// === EXTRA FORM/MORALE ===
{ctx:["high_morale","win"],q:"Il morale è alle stelle. In che modo si traduce in campo?",a:[
  {tone:"diplomatico",txt:"In sicurezza e coraggio nelle scelte. Il morale alto aiuta il gioco.",ef:{m:7,p:5,t:5,f:3}},
  {tone:"diretto",txt:"Quando sono felice e motivato sono inarrestabile. Lo si vede dai risultati.",ef:{m:10,p:7,t:-3,f:4}},
  {tone:"umile",txt:"Gioco più libero. La leggerezza mentale è sottovalutata nel calcio moderno.",ef:{m:6,p:5,t:6,f:3}},
]},
{ctx:["low_morale","loss"],q:"Il periodo è complicato anche a livello personale. Come stai?",a:[
  {tone:"diplomatico",txt:"Ho i miei momenti come tutti. Ma il lavoro mi tiene ancorato alla realtà.",ef:{m:1,p:1,t:5}},
  {tone:"diretto",txt:"Non mi vedrete mai cedere. Le difficoltà mi rendono più forte. Sempre.",ef:{m:3,p:2,t:-2}},
  {tone:"umile",txt:"Non è un periodo facile, lo ammetto. Ma ho un supporto straordinario intorno.",ef:{m:2,p:2,t:6}},
]},
{ctx:["bad_form","loss"],q:"Non stai rendendo al tuo solito livello. Hai parlato con il mister?",a:[
  {tone:"diplomatico",txt:"Sì, abbiamo un dialogo aperto. Stiamo lavorando insieme per trovare la soluzione.",ef:{m:1,p:1,t:8}},
  {tone:"diretto",txt:"Non ne ho bisogno. So io come recuperare. È solo una questione di tempo.",ef:{m:3,p:1,t:-6}},
  {tone:"umile",txt:"Sì, e sono grato della sua pazienza. Lo ripagherò con le prestazioni.",ef:{m:1,p:2,t:9}},
]},
// === EXTRA PRO / SEASON ===
{ctx:["pro","season_start"],q:"Nuova stagione, nuovi obiettivi. Cosa prometti ai tifosi?",a:[
  {tone:"diplomatico",txt:"Impegno totale, sacrificio e la migliore versione di me stesso in campo.",ef:{m:6,p:8,t:6,f:3}},
  {tone:"diretto",txt:"Prometto gol, vittorie e grandi prestazioni. Questa sarà la mia stagione.",ef:{m:9,p:9,t:-3,f:4}},
  {tone:"umile",txt:"Di dare tutto ogni domenica. Non prometto titoli ma garantisco il massimo impegno.",ef:{m:5,p:8,t:7,f:3}},
]},
{ctx:["season_end","pro"],q:"Stagione finita. Hai raggiunto il tuo massimo quest'anno?",a:[
  {tone:"diplomatico",txt:"Mi sono avvicinato. Ma credo di avere ancora margini di crescita importanti.",ef:{m:5,p:5,t:5}},
  {tone:"diretto",txt:"Tra i miei migliori anni, sì. I dati lo confermano. Sono cresciuto tantissimo.",ef:{m:9,p:7,t:-3}},
  {tone:"umile",txt:"Non lo so. Forse no. Mi piace pensare che il meglio deve ancora venire.",ef:{m:4,p:5,t:7}},
]},
{ctx:["weekly"],q:"Come descrivi il tuo percorso da quando sei arrivato in questo club?",a:[
  {tone:"diplomatico",txt:"Un percorso di crescita costante. Il club e i compagni mi hanno aiutato molto.",ef:{m:5,p:5,t:7}},
  {tone:"diretto",txt:"Ho dimostrato il mio valore passo dopo passo. Ora sono un punto di riferimento.",ef:{m:8,p:6,t:-3}},
  {tone:"umile",txt:"Un cammino bellissimo, non sempre facile. Ogni ostacolo mi ha reso più forte.",ef:{m:4,p:5,t:8}},
]},
{ctx:["weekly"],q:"Cosa ti manca ancora per raggiungere la perfezione calcistica?",a:[
  {tone:"diplomatico",txt:"Non esiste la perfezione. Ma lavoro ogni giorno per avvicinarmi il più possibile.",ef:{m:4,p:3,t:6}},
  {tone:"diretto",txt:"Poco. Sono già ad un livello molto alto. La continuità è l'ultimo passo.",ef:{m:9,p:6,t:-4}},
  {tone:"umile",txt:"Molte cose. La mentalità, la tecnica in certi dettagli. Il calcio non finisce mai di insegnare.",ef:{m:3,p:3,t:8}},
]},
{ctx:["win"],q:"Spesso calciatori giovani come te faticano a gestire i momenti di gloria. Come ci riesci?",a:[
  {tone:"diplomatico",txt:"Con il supporto dello staff e della famiglia. Non sono solo in questo percorso.",ef:{m:5,p:5,t:6}},
  {tone:"diretto",txt:"Non è un problema per me. Sono fatto per stare sotto i riflettori. Mi riesce naturale.",ef:{m:9,p:8,t:-4}},
  {tone:"umile",txt:"Cercando di restare me stesso. Quando smetti di lavorare sodo, perdi tutto.",ef:{m:4,p:5,t:8}},
]},
{ctx:["loss"],q:"Sconfitta che poteva essere evitata. Rimpianti?",a:[
  {tone:"diplomatico",txt:"Sempre qualcuno nei momenti difficili. Ma guardo avanti. Impariamo e andiamo.",ef:{m:-1,p:2,t:5}},
  {tone:"diretto",txt:"Sì, ho sbagliato una chance clamorosa. Me lo porterò dentro tutta la settimana.",ef:{m:-3,p:1,t:2}},
  {tone:"umile",txt:"Tanti. Ma i rimpianti non cambiano il risultato. Lavoriamo per non ripeterli.",ef:{m:-2,p:2,t:7}},
]},
{ctx:["weekly"],q:"Come si affronta il peso delle aspettative in un grande club?",a:[
  {tone:"diplomatico",txt:"Con serietà e umiltà. Le aspettative alte significano che ti considerano forte.",ef:{m:4,p:4,t:5}},
  {tone:"diretto",txt:"Bene. Adoro la pressione. Mi dà la spinta per dare il meglio ogni settimana.",ef:{m:7,p:5,t:-3}},
  {tone:"umile",txt:"Non sempre è facile. Ma il lavoro quotidiano è l'unica risposta alle aspettative.",ef:{m:3,p:4,t:7}},
]},
// === EXTRA PACK 3 (34 domande per raggiungere 200+) ===
{ctx:["win"],cond:(p,i)=>_primaCasa77(p,i),q:"Prima vittoria stagionale casalinga. Che sollievo?",a:[
  {tone:"diplomatico",txt:"Un grande sollievo per tutti. Sapevamo che sarebbe arrivata con il lavoro.",ef:{m:6,p:7,t:5}},
  {tone:"diretto",txt:"Ci aspettavamo solo questo. Siamo troppo forti per restare a lungo senza vincere.",ef:{m:9,p:7,t:-3}},
  {tone:"umile",txt:"Importantissima. Ci dà energia per la settimana. Ringrazio i tifosi per il supporto.",ef:{m:5,p:8,t:6}},
]},
{ctx:["win"],q:"Il vostro reparto avanzato è stato devastante oggi. Che feeling in campo?",a:[
  {tone:"diplomatico",txt:"Ci muovevamo in sincronia. Settimane di lavoro tattico che porta i frutti.",ef:{m:6,p:5,t:6}},
  {tone:"diretto",txt:"Inarrestabili. Quando siamo così in forma non ci ferma nessuno. Semplice.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"Feeling ottimo. Ma dipende da tutto il collettivo, non solo dall'attacco.",ef:{m:5,p:5,t:8}},
]},
{ctx:["win"],q:"Come spieghi la vostra solidità difensiva quest'anno?",a:[
  {tone:"diplomatico",txt:"Lavoro collettivo e schemi ben appresi. Difendiamo tutti, attaccanti compresi.",ef:{m:5,p:4,t:7}},
  {tone:"diretto",txt:"Difensori forti più un pressing alto micidiale. Io contribuisco dalla cima.",ef:{m:7,p:5,t:-2}},
  {tone:"umile",txt:"Il mister ha costruito un sistema difensivo eccellente. I difensori fanno miracoli.",ef:{m:4,p:4,t:8}},
]},
{ctx:["loss"],q:"Avete perso punti pesanti in questa gara. Come te lo spieghi?",a:[/* [7.120.0 audit narrativa] era «seconda volta di fila in casa» — sede+striscia non garantite dal ctx:loss → genericizzata */
  {tone:"diplomatico",txt:"Dobbiamo analizzare bene cosa non va. Non si possono perdere punti così.",ef:{m:-2,p:0,t:5}},
  {tone:"diretto",txt:"Non è solo colpa mia. C'è qualcosa che non funziona nel sistema. Va affrontato.",ef:{m:1,p:-2,t:-6}},
  {tone:"umile",txt:"Errori individuali e collettivi. Ne prendiamo atto e lavoriamo per uscirne.",ef:{m:-2,p:1,t:7}},
]},
{ctx:["loss"],q:"Primo tempo orribile. Come si rientra in campo così diversi nel secondo?",a:[
  {tone:"diplomatico",txt:"Le parole del mister all'intervallo. Sa sempre cosa dire nei momenti difficili.",ef:{m:0,p:2,t:9}},
  {tone:"diretto",txt:"Sono stato io a caricare i compagni. Leader si diventa in questi momenti.",ef:{m:4,p:3,t:-3}},
  {tone:"umile",txt:"Ci siamo parlati onestamente. Il gruppo ha risposto. Purtroppo non è bastato.",ef:{m:-1,p:2,t:6}},
]},
{ctx:["draw"],q:"Il mister sembra deluso del pareggio. Condividi la sua delusione?",a:[
  {tone:"diplomatico",txt:"Lo capisco. Volevamo di più. Ma facciamo fronte comune e guardiamo avanti.",ef:{m:0,p:2,t:7}},
  {tone:"diretto",txt:"Un po' sì. Ma si è battuto contro un avversario ostico. Non era semplice.",ef:{m:2,p:2,t:-2}},
  {tone:"umile",txt:"Completamente. Non era il risultato che volevamo. Avremmo dovuto fare di più.",ef:{m:-1,p:2,t:8}},
]},
{ctx:["weekly"],y:1,q:"Qual è il consiglio più prezioso che ti ha dato il tuo allenatore?",a:[
  {tone:"diplomatico",txt:"Di non smettere mai di imparare, anche dai più giovani. Saggio.",ef:{m:4,p:4,t:8}},
  {tone:"diretto",txt:"Di credere in me stesso senza limiti. Ha visto qualcosa in me che valorizza.",ef:{m:7,p:5,t:2}},
  {tone:"umile",txt:"Di restare umile nei momenti di gloria. Non lo dimentico mai.",ef:{m:4,p:4,t:9}},
]},
{ctx:["weekly"],q:"Come descrivi il rapporto con i tifosi avversari quando giochi fuori casa?",a:[
  {tone:"diplomatico",txt:"Rispetto e concentrazione. Ogni stadio ha la sua atmosfera. Mi adatto.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Mi motivano. Più fischiano, più voglio fare gol. È la benzina migliore.",ef:{m:7,p:4,t:-2}},
  {tone:"umile",txt:"I tifosi fanno parte del gioco. Cerco solo di rispettare il loro stadio.",ef:{m:3,p:3,t:5}},
]},
{ctx:["weekly"],q:"Hai mai visto qualcuno del club come un mentore nella tua carriera?",a:[
  {tone:"diplomatico",txt:"Ho avuto la fortuna di incontrare persone meravigliose. Non le dimenticherò mai.",ef:{m:5,p:5,t:7}},
  {tone:"diretto",txt:"Mi sono costruito da solo. Ma qualcuno ha creduto in me quando era difficile.",ef:{m:6,p:4,t:-1}},
  {tone:"umile",txt:"Sì, diversi. Il calcio è fatto di relazioni. Sono grato a chi mi ha guidato.",ef:{m:4,p:5,t:7}},
]},
{ctx:["weekly"],q:"Come gestisci le critiche dei tifosi sui social dopo una brutta prestazione?",a:[
  {tone:"diplomatico",txt:"Cerco di non leggere. Ma quando lo faccio prendo il costruttivo con spirito aperto.",ef:{m:2,p:2,t:3}},
  {tone:"diretto",txt:"Non le guardo. Chi critica non capisce quanto sia difficile giocare ad alto livello.",ef:{m:4,p:-2,t:-3}},
  {tone:"umile",txt:"Alcune critiche fanno male ma sono utili. Mi ricordano che devo fare meglio.",ef:{m:1,p:1,t:5}},
]},
{ctx:["weekly"],y:1,q:"Qual è la cosa che nessuno sa di te come giocatore?",a:[
  {tone:"diplomatico",txt:"Quanto lavoro fuori dal campo. La gente vede i 90 minuti, non le ore dietro.",ef:{m:5,p:6,t:5}},
  {tone:"diretto",txt:"Quanto studio l'avversario prima di ogni partita. Sono molto più preparato di quanto sembri.",ef:{m:7,p:5,t:-2}},
  {tone:"umile",txt:"Quante volte mi sono sentito inadeguato. La facciata è solo una parte della storia.",ef:{m:4,p:6,t:5}},
]},
{ctx:["season_start"],q:"La rosa è stata rinnovata. Ti senti favorito per un posto da titolare?",a:[
  {tone:"diplomatico",txt:"Sarà il mister a decidere. Mi allenerò al massimo per convincerlo.",ef:{m:4,p:3,t:7}},
  {tone:"diretto",txt:"Assolutamente sì. Ho qualità che pochi altri hanno. Il posto è mio.",ef:{m:8,p:5,t:-5}},
  {tone:"umile",txt:"Non do nulla per scontato. La competizione è sana. Devo guadagnarmelo ogni giorno.",ef:{m:3,p:3,t:8}},
]},
{ctx:["season_start"],q:"Cosa hai imparato dalla stagione scorsa che applicherai quest'anno?",a:[
  {tone:"diplomatico",txt:"Gestire meglio le energie nei momenti chiave. Continuità è la parola d'ordine.",ef:{m:5,p:4,t:6,f:2}},
  {tone:"diretto",txt:"Che posso fare ancora meglio. Non mi sono ancora espresso al 100%. Ora voglio.",ef:{m:8,p:5,t:-2,f:3}},
  {tone:"umile",txt:"A chiedere più aiuto quando ne ho bisogno. La squadra è la mia forza.",ef:{m:4,p:4,t:8,f:2}},
]},
{ctx:["season_end"],q:"Uno sguardo all'indietro: il momento più bello della stagione?",a:[
  {tone:"diplomatico",txt:"Il momento in cui ho visto la squadra combattere unita. Più di qualsiasi gol.",ef:{m:6,p:6,t:6}},
  {tone:"diretto",txt:"Il mio gol migliore. Quello che ha cambiato la partita più importante. Indimenticabile.",ef:{m:9,p:8,t:-3}},
  {tone:"umile",txt:"Quando un compagno mi ha ringraziato per averlo aiutato. Piccolo ma significativo.",ef:{m:5,p:6,t:8}},
]},
{ctx:["season_end"],q:"Il momento più doloroso di questa stagione?",a:[
  {tone:"diplomatico",txt:"Preferirei dimenticarlo. Ma fa parte del percorso. Ogni esperienza insegna.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Una sconfitta pesante che ancora brucio. Ma mi ha reso più forte per il futuro.",ef:{m:4,p:4,t:-2}},
  {tone:"umile",txt:"Quando ho deluso la squadra in un momento cruciale. Non lo dimenticherò.",ef:{m:2,p:3,t:6}},
]},
{ctx:["high_trust","win"],q:"Il mister ti schiera sempre. Come mantieni alta la concentrazione?",a:[
  {tone:"diplomatico",txt:"Trattando ogni allenamento come una partita. Non abbassi mai il livello.",ef:{m:5,p:4,t:8}},
  {tone:"diretto",txt:"Sono un professionista serio. La concentrazione è una mia caratteristica base.",ef:{m:8,p:5,t:-2}},
  {tone:"umile",txt:"Non è facile. Ma la fiducia del mister è una responsabilità che prendo seriamente.",ef:{m:4,p:4,t:9}},
]},
{ctx:["low_trust","weekly"],q:"Il mister ha detto che si aspetta di più da te. Come rispondi?",a:[
  {tone:"diplomatico",txt:"Accetto la sfida. Lavoro per dargli quello che si aspetta e di più.",ef:{m:1,p:2,t:7}},
  {tone:"diretto",txt:"Ha torto. Sto facendo il massimo possibile con le opportunità che mi dà.",ef:{m:3,p:1,t:-9}},
  {tone:"umile",txt:"Ha ragione. Non sono ancora al mio livello massimo. Me ne assumo la responsabilità.",ef:{m:0,p:2,t:9}},
]},
{ctx:["weekly","pro"],q:"Com'è la vita del calciatore professionista lontana dai riflettori?",a:[
  {tone:"diplomatico",txt:"Fatta di routine, sacrifici e lavoro. Ma è ciò che amo. Non cambierei nulla.",ef:{m:4,p:5,t:4}},
  {tone:"diretto",txt:"Impegnativa ma gratificante. Chi vuole fare questo mestiere deve accettarlo.",ef:{m:5,p:4,t:-1}},
  {tone:"umile",txt:"Molti momenti solitari, di fatica. Ma la passione copre tutto il resto.",ef:{m:4,p:5,t:5}},
]},
{ctx:["win","top_scorer"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1),/* [7.164.0 M5] «un altro gol» ⇒ hai segnato OGGI */q:"Un altro gol per te. Quanto è importante la testa in questi momenti?",a:[
  {tone:"diplomatico",txt:"Fondamentale. Il gol nasce nella mente prima che nei piedi. Ci lavoro.",ef:{m:6,p:6,t:5,f:2}},
  {tone:"diretto",txt:"Quando sono in zona gol non penso. Agisco d'istinto. È il mio superpotere.",ef:{m:10,p:8,t:-4,f:3}},
  {tone:"umile",txt:"La testa è tutto. Sto imparando a gestire la pressione sotto porta. Miglioro.",ef:{m:4,p:5,t:7,f:2}},
]},
{ctx:["weekly"],q:"Come definiresti il calcio italiano rispetto agli altri campionati?",a:[
  {tone:"diplomatico",txt:"Tattico, duro e appassionante. Ha caratteristiche uniche che lo rendono speciale.",ef:{m:3,p:4,t:3}},
  {tone:"diretto",txt:"Il più tattico del mondo. Chi sa giocare qui sa giocare ovunque. Sono pronto.",ef:{m:6,p:5,t:-2}},
  {tone:"umile",txt:"Un campionato che ti forma. Ogni dettaglio conta. Ho imparato moltissimo.",ef:{m:3,p:4,t:5}},
]},
{ctx:["weekly"],q:"Esiste una squadra con cui hai un conto in sospeso da sistemare?",a:[
  {tone:"diplomatico",txt:"Nel calcio ogni partita è una storia a sé. Non porto rancori da una stagione all'altra.",ef:{m:3,p:3,t:4}},
  {tone:"diretto",txt:"Qualcuna sì. Non faccio nomi ma so dove voglio fare bella figura la prossima volta.",ef:{m:6,p:5,t:-3}},
  {tone:"umile",txt:"Non credo nei conti in sospeso. Ogni partita è nuova. Guardo avanti.",ef:{m:3,p:3,t:5}},
]},
{ctx:["weekly"],y:1,q:"Quali aspetti della tua personalità ti aiutano di più in campo?",a:[
  {tone:"diplomatico",txt:"La determinazione e la capacità di adattarmi alle situazioni. Non mi arrendo.",ef:{m:5,p:4,t:5}},
  {tone:"diretto",txt:"Il sangue freddo e la sicurezza nei miei mezzi. Non mi faccio mai intimorire.",ef:{m:8,p:5,t:-3}},
  {tone:"umile",txt:"La pazienza e la voglia di imparare. Non ho mai pensato di sapere già tutto.",ef:{m:4,p:4,t:7}},
]},
{ctx:["win"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.goals||0)>=1&&((v.matchResult.homeScore||0)-(v.matchResult.awayScore||0))*((v.isHome===false)?-1:1)===1),/* [7.178.0 RC-7] «gol del 90» ⇒ hai segnato E vittoria di misura */q:"Hai appena segnato il gol decisivo nel finale. Come ti senti?",a:[
  {tone:"diplomatico",txt:"Incredibile emozione. Momenti come questi rendono tutti i sacrifici degni.",ef:{m:10,p:10,t:6,f:4}},
  {tone:"diretto",txt:"Sapevo che sarebbe venuto. Nei finali di partita sono il più freddo di tutti.",ef:{m:12,p:10,t:-4,f:5}},
  {tone:"umile",txt:"Che bello. È per i tifosi che non mollavano. Dedico questo gol a loro.",ef:{m:8,p:11,t:7,f:4}},
]},
{ctx:["loss"],cond:(p,v)=>!!(v&&v.matchResult&&(v.matchResult.redCard||v.matchResult.sentOff)),/* [7.178.0 RC-8] «in 10» ⇒ espulsione VERA */q:"Avete giocato in 10 per buona parte della partita. Morale comunque?",a:[
  {tone:"diplomatico",txt:"Alto. Abbiamo lottato con il coltello tra i denti. La reazione è stata grande.",ef:{m:2,p:3,t:5}},
  {tone:"diretto",txt:"In 10 non si può vincere contro certi avversari. Ma abbiamo dimostrato carattere.",ef:{m:3,p:3,t:-2}},
  {tone:"umile",txt:"Dobbiamo imparare a non metterci in situazioni così difficili. Disciplina.",ef:{m:0,p:2,t:6}},
]},
{ctx:["weekly"],y:1,q:"Se potessi rinascere, sceglieresti ancora il calcio?",a:[
  {tone:"diplomatico",txt:"Senza dubbio. È la mia vita, la mia passione. Non riesco a immaginarmi altrove.",ef:{m:6,p:6,t:4}},
  {tone:"diretto",txt:"Sì, ma avrei iniziato prima. Il tempo è la risorsa più preziosa per un atleta.",ef:{m:7,p:5,t:-1}},
  {tone:"umile",txt:"Credo di sì. Ma farei alcune scelte diversamente. Il senno di poi è facile.",ef:{m:5,p:5,t:4}},
]},
{ctx:["win"],q:"Cosa provi quando vedi i bambini con la tua maglia sugli spalti?",a:[
  {tone:"diplomatico",txt:"Enorme responsabilità e orgoglio. Sono esempi per loro. Non posso deludere.",ef:{m:6,p:9,t:5}},
  {tone:"diretto",txt:"Un'emozione pura. Significa che il mio lavoro arriva alla prossima generazione.",ef:{m:8,p:9,t:-1}},
  {tone:"umile",txt:"Mi commuove ogni volta. Ricordo quando ero io quel bambino. È un cerchio magico.",ef:{m:6,p:10,t:5}},
]},
{ctx:["loss"],q:"Come parleresti con un giovane compagno che è giù dopo questa sconfitta?",a:[
  {tone:"diplomatico",txt:"Gli direi che fa parte del percorso. Le sconfitte insegnano più delle vittorie.",ef:{m:1,p:3,t:6}},
  {tone:"diretto",txt:"Gli direi di arrabbiarsi, canalizzare quella rabbia e tornare più forte.",ef:{m:3,p:2,t:-1}},
  {tone:"umile",txt:"Che ci sono passato anch'io. E che il carattere si forma in questi momenti.",ef:{m:2,p:3,t:6}},
]},
{ctx:["weekly"],q:"Qual è la dote tecnica che ti distingue dagli altri nel tuo ruolo?",a:[
  {tone:"diplomatico",txt:"La lettura del gioco. Capire prima degli altri dove andrà il pallone.",ef:{m:5,p:5,t:5}},
  {tone:"diretto",txt:"La qualità in zona decisiva. Quando conta, sono affidabile. Sempre.",ef:{m:9,p:7,t:-4}},
  {tone:"umile",txt:"Non saprei. Forse la disponibilità a fare lavoro sporco quando serve.",ef:{m:3,p:4,t:8}},
]},
{ctx:["weekly"],q:"Come ti senti quando il club fa un grande acquisto nel tuo ruolo?",a:[
  {tone:"diplomatico",txt:"La concorrenza è sana. Ogni buon giocatore in rosa eleva il livello di tutti.",ef:{m:2,p:3,t:5}},
  {tone:"diretto",txt:"Mi stimola. Nessuno mi sposta. Sono io il titolare e lo dimostrerò.",ef:{m:7,p:4,t:-5}},
  {tone:"umile",txt:"Mi fa riflettere. Devo migliorare per restare competitivo. Accetto la sfida.",ef:{m:2,p:3,t:7}},
]},
{ctx:["high_popularity","win"],q:"Il pubblico impazzisce per te. È la tua stagione migliore?",a:[
  {tone:"diplomatico",txt:"Sto dando tutto. Se la gente è felice, sono felice anch'io. Grazie a loro.",ef:{m:7,p:10,t:5}},
  {tone:"diretto",txt:"Sì, è la mia stagione migliore. E posso fare ancora meglio. La vetta è vicina.",ef:{m:11,p:10,t:-4}},
  {tone:"umile",txt:"Spero di sì. Ma ci sono ancora molte partite. Non mi fermo finché c'è da lavorare.",ef:{m:6,p:10,t:6}},
]},
{ctx:["weekly"],y:1,q:"Qual è il ruolo del divertimento nel calcio ad alto livello?",a:[
  {tone:"diplomatico",txt:"Fondamentale. Se non ti diverti non esprimi il meglio. È la base di tutto.",ef:{m:5,p:5,t:4}},
  {tone:"diretto",txt:"Quando vinco mi diverto. La vittoria è il divertimento massimo per me.",ef:{m:7,p:5,t:-2}},
  {tone:"umile",txt:"Cerco di non perderlo mai. Quando il calcio smette di essere gioia, c'è qualcosa che non va.",ef:{m:5,p:5,t:5}},
]},
{ctx:["u18","youth"],q:"Come ti senti a giocare contro giocatori più grandi e fisici di te?",a:[
  {tone:"diplomatico",txt:"È una sfida che mi aiuta a crescere. Il fisico lo costruisco col tempo.",ef:{m:4,p:4,t:6}},
  {tone:"diretto",txt:"La tecnica batte la fisicità. Ho dimostrato che posso reggere con chiunque.",ef:{m:8,p:5,t:-3}},
  {tone:"umile",txt:"Non è sempre facile. Ma mi piace sfidare me stesso in situazioni scomode.",ef:{m:3,p:4,t:7}},
]},
{ctx:["weekly"],q:"C'è qualcosa che cambieresti nel modo in cui i media coprono il calcio?",a:[
  {tone:"diplomatico",txt:"Più rispetto per il lavoro quotidiano che non si vede. Non solo i risultati.",ef:{m:4,p:4,t:3}},
  {tone:"diretto",txt:"Meno gossip e più analisi tecnica. I giocatori non sono personaggi da reality.",ef:{m:5,p:3,t:-2}},
  {tone:"umile",txt:"Non mi permetto. I media fanno il loro lavoro. Spero solo in rispetto reciproco.",ef:{m:3,p:3,t:5}},
]},
{ctx:["win","season_end"],q:"Stagione straordinaria per te. Cosa ti rimane di questo percorso?",a:[
  {tone:"diplomatico",txt:"La crescita umana oltre che tecnica. Ho imparato tantissimo da ogni persona incontrata.",ef:{m:7,p:7,t:6}},
  {tone:"diretto",txt:"Numeri, prestazioni e la conferma che sono tra i migliori. È tangibile.",ef:{m:10,p:8,t:-4}},
  {tone:"umile",txt:"L'umiltà di sapere che il meglio deve ancora venire. Non mi accontento.",ef:{m:5,p:6,t:8}},
]},
{ctx:["weekly"],y:1,q:"Qual è la partita dei sogni che ti piacerebbe giocare un giorno?",a:[
  {tone:"diplomatico",txt:"Qualsiasi finale di coppa importante. Il calcio ai massimi livelli, con la squadra.",ef:{m:5,p:6,t:4}},
  {tone:"diretto",txt:"Una finale europea. Da protagonista assoluto. Con gol decisivo. È il mio sogno.",ef:{m:9,p:8,t:-3}},
  {tone:"umile",txt:"Non mi pongo limiti ma neanche aspettative eccessive. Il prossimo match è già il sogno.",ef:{m:4,p:5,t:6}},
]},
// === Sprint D3 — CONFERENZA STAMPA PRE-PARTITA (ctx:["prematch"]) ===
{ctx:["prematch"],q:"Questa è la partita più importante della stagione. Come vi presentate all'appuntamento?",a:[
  {tone:"diplomatico",txt:"Siamo pronti. Rispettiamo l'avversario ma crediamo nei nostri mezzi.",ef:{m:4,t:2,p:2}},
  {tone:"diretto",txt:"Veniamo per vincere. Non ho altro da aggiungere, il resto si fa in campo.",ef:{m:6,t:-2,p:5,f:1}},
  {tone:"umile",txt:"Sarà durissima, ma daremo tutto fino al fischio finale. Conta lo spirito.",ef:{m:3,t:3,p:1}},
]},
{ctx:["prematch"],q:"Il mister ti ha chiesto qualcosa di particolare in vista di questa sfida?",a:[
  {tone:"diplomatico",txt:"Mi ha chiesto equilibrio e concentrazione. Seguirò le sue indicazioni alla lettera.",ef:{m:3,t:4,p:1}},
  {tone:"diretto",txt:"Mi ha dato carta bianca. Sa che nelle partite vere faccio la differenza.",ef:{m:5,t:-3,p:4}},
  {tone:"umile",txt:"Mi ha solo ricordato di restare umile e lavorare per la squadra. Ha ragione.",ef:{m:2,t:5,p:1,f:1}},
]},
{ctx:["prematch"],q:"In che condizione di forma arrivi a questo big match?",a:[
  {tone:"diplomatico",txt:"Sto bene. Mi sento dentro la partita e pronto a dare il mio contributo.",ef:{m:3,t:2,f:2}},
  {tone:"diretto",txt:"Mai stato così in forma. Oggi gli avversari faranno fatica a starmi dietro.",ef:{m:6,t:-2,p:5,f:2}},
  {tone:"umile",txt:"Bene, ma la forma vera la dimostri in campo. Parlo dopo i novanta minuti.",ef:{m:2,t:3,f:1}},
]},
{ctx:["prematch"],q:"Avete studiato a fondo l'avversario? Cosa temete di più di loro?",a:[
  {tone:"diplomatico",txt:"È una squadra forte e organizzata. Li rispettiamo e li abbiamo preparati bene.",ef:{m:3,t:3,p:2}},
  {tone:"diretto",txt:"Non temiamo nessuno. Se giochiamo da squadra, non hanno scampo.",ef:{m:5,t:-2,p:4,f:1}},
  {tone:"umile",txt:"Hanno qualità in ogni reparto. Servirà la partita perfetta per batterli.",ef:{m:2,t:4,p:1}},
]},
{ctx:["prematch"],q:"I tifosi si aspettano molto da questa gara. Senti la loro pressione?",a:[
  {tone:"diplomatico",txt:"È un onore avere il loro sostegno. La pressione è uno stimolo, non un peso.",ef:{m:4,t:2,p:3}},
  {tone:"diretto",txt:"La pressione mi carica. Più ci credono, più mi esalto in campo.",ef:{m:6,t:-1,p:5,f:1}},
  {tone:"umile",txt:"I tifosi meritano rispetto e impegno. Cercheremo di renderli orgogliosi.",ef:{m:3,t:3,p:2}},
]},
{ctx:["prematch"],q:"Una vittoria oggi può cambiare la stagione. Quanto pesa nei vostri obiettivi?",a:[
  {tone:"diplomatico",txt:"Pesa tanto, ma resta una partita. Pensiamo a questi tre punti, poi al resto.",ef:{m:3,t:3,p:1}},
  {tone:"diretto",txt:"È uno snodo decisivo e lo vinceremo. I nostri obiettivi passano da qui.",ef:{m:6,t:-2,p:5,f:1}},
  {tone:"umile",txt:"Un passo importante, niente di più. La stagione è lunga, restiamo coi piedi a terra.",ef:{m:2,t:4,p:1}},
]},
{ctx:["prematch"],cond:(p,c)=>!!(c&&c.derby)&&(p.proStatus||"u18")==="pro"/* [7.999.113 PO-192] solo in un derby vero e tra i professionisti: «bolgia» e «serate» in Primavera non stanno in piedi */,q:"È una sfida sentitissima, quasi un derby. Che atmosfera vi aspettate?",a:[
  {tone:"diplomatico",txt:"Atmosfera da grande calcio. La vivremo con passione e massimo rispetto.",ef:{m:4,t:2,p:3}},
  {tone:"diretto",txt:"Sarà una bolgia e noi adoriamo queste serate. È qui che si diventa grandi.",ef:{m:7,t:-2,p:6,f:2}},
  {tone:"umile",txt:"Sfide così non si spiegano, si giocano. Servirà testa fredda e cuore caldo.",ef:{m:3,t:3,p:2}},
]},
{ctx:["prematch"],q:"Che ruolo ti aspetti di avere oggi nell'economia della partita?",a:[
  {tone:"diplomatico",txt:"Quello che mi chiede il mister. Mi metto al servizio del gruppo, sempre.",ef:{m:3,t:4,p:1}},
  {tone:"diretto",txt:"Da protagonista. In queste partite voglio la palla e voglio decidere io.",ef:{m:6,t:-3,p:5,f:1}},
  {tone:"umile",txt:"Quello dell'umile lavoratore. Se serve correre per i compagni, lo farò.",ef:{m:2,t:5,p:1,f:1}},
]},
];
// Sprint 15 — pick interview question based on player context
const _recentInterviewQs=[];
function pickInterviewByCtx(p,matchResult=null){
  const ctx=new Set(["weekly"]);
  if(matchResult){ctx.add(matchResult.won?"win":matchResult.drew?"draw":"loss");}
  if((p.form||70)>=75)ctx.add("good_form");
  if((p.form||70)<50)ctx.add("bad_form");
  if((p.morale||70)>=80)ctx.add("high_morale");
  if((p.morale||70)<50)ctx.add("low_morale");
  if((p.contract?.weeksLeft||99)<=8)ctx.add("contract");
  if((p.week||1)<=5)ctx.add("season_start");
  if((p.week||1)>33)ctx.add("season_end");
  if((p.age||18)<21)ctx.add("youth");
  if((p.age||18)>29)ctx.add("veteran");
  if((p.proStatus||"u18")==="u18")ctx.add("u18");
  if((p.proStatus||"u18")==="pro")ctx.add("pro");
  if((p.coachTrust||60)>=80)ctx.add("high_trust");
  if((p.coachTrust||60)<40)ctx.add("low_trust");
  if((p.popularity||20)>=75)ctx.add("high_popularity");
  if(((typeof leagueGoalsOf==="function")?leagueGoalsOf(p):(p.goals||0))>=8)ctx.add("top_scorer");/* [7.161.0 M5] gol di LEGA (non tutte le competizioni) e soglia da vero bomber */
  // [7.1.3 collaudo PO «non era una partita in trasferta! tutto deve avere un senso ed una logica»] alcune domande
  //   presuppongono il LUOGO (casa/trasferta): vanno servite solo quando combacia col match reale. `isHome` arriva
  //   dal risultato (LiveMatch → onMatchEnd.isHome); null nelle interviste settimanali (nessuna partita → le domande
  //   venue-specific hanno ctx post-gara e restano comunque escluse). La cond riceve ora anche l'info di contesto.
  const _venueInfo={isHome:(matchResult&&typeof matchResult.isHome==="boolean")?matchResult.isHome:null,matchResult};
  /* [7.455.0 collaudo PO, quarta segnalazione «un po' presto e fuori luogo la domanda»] LA REGOLA E'
     INVERTITA: non si elenca piu' cosa VIETARE a un ragazzo, si dichiara cosa ha SENSO chiedergli.
     Filtrare domanda per domanda non ha funzionato due volte di fila — «voci di mercato» presa, «un
     mentore nella carriera» sfuggita — perche' delle 65 domande settimanali la maggioranza da' per
     scontato un passato professionistico («la partita piu' bella della sua CARRIERA finora», «cosa
     l'ha sorpresa del calcio professionistico rispetto al giovanile», «il peso delle aspettative in un
     GRANDE CLUB», «com'e' la vita del calciatore professionista»). Ogni setaccio nuovo ne lascia
     passare una. Ora le domande adatte al settore giovanile portano `y:1` e a un u18 si servono SOLO
     quelle: una domanda scritta domani e' esclusa PER DIFETTO finche' qualcuno non la dichiara adatta —
     il caso non previsto cade dalla parte sicura. */
  const _u18Q455=(p.proStatus||"u18")!=="pro";
  const pool=INTERVIEW_QS.filter(q=>q.ctx.some(c=>ctx.has(c))&&(!_u18Q455||q.y===1)&&(!q.cond||(function(){try{return q.cond(p,_venueInfo);}catch(e){return false;}})()));/* [6.97.0 collaudo PO «eviterei di parlare di Nazionale a un OVR basso in B — tutto deve avere una logica»] le domande possono dichiarare una cond di pertinenza */
  const fresh=pool.filter(q=>!_recentInterviewQs.includes(q.q));
  const chosen=(fresh.length?fresh:pool.length?pool:INTERVIEW_QS)[Math.floor(Math.random()*((fresh.length||pool.length)||INTERVIEW_QS.length))];
  _recentInterviewQs.push(chosen.q);
  if(_recentInterviewQs.length>10)_recentInterviewQs.shift();
  const paper=NEWSPAPERS[Math.floor(Math.random()*NEWSPAPERS.length)];
  return{q:chosen,paper};
}
