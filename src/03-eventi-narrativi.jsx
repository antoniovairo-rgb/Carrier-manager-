/* ========================================================================
 * KORWARD ELITE — frammento n° 03  (dei 20, numerati da 00 a 19)
 * src/03-eventi-narrativi.jsx
 *
 * EVENTI NARRATIVI · SPOGLIATOIO · ACHIEVEMENT
 *
 * Tutte le tabelle di testo della carriera fuori dal campo: WEEKLY_EVENTS,
 * WEEKLY_RANDOM_EVENTS, TEAMMATE_ARCHETYPES, SPOGLIATOIO_MOMENTS, WEEKLY_IMPULSES,
 * JOURNALIST_POOL, LEAGUE_NEWS_TEMPLATES, VITA_EVENTS, CAREER_MOMENTS, gli ultras,
 * CAPTAIN_TEAM_TALKS, gli infortuni (INJURY_TYPES_META / INJURY_REHAB), i dialoghi e
 * le promesse dell’allenatore, i finali di stagione e ACHIEVEMENTS.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 1326-2752   ·   1427 righe di 41427
 * La prima riga dopo questa intestazione è la riga 1326 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 1300 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
const WEEKLY_EVENTS=[
  // ── TRAINING — POSITIVE ──────────────────────────────────────────────────
  {w:12,txt:"💪 Allenamento eccellente! Il mister ti nota.",ef:{morale:10,form:6,coachTrust:8,fatigue:-6}},
  {w:10,txt:"👏 Elogio pubblico del mister in conferenza.",ef:{morale:13,popularity:6,coachTrust:7}},
  {w:8,txt:"🎯 Sessione tecnica perfetta. Tecnica e velocità migliorano.",ef:{tecnica:1,velocità:1,morale:5}},
  {w:7,txt:"💊 Recupero fisico sorprendente. Energia al top.",ef:{fatigue:-22,morale:7,form:9}},
  {w:7,txt:"⭐ Partitella straordinaria. Tutti ti guardano.",ef:{morale:10,coachTrust:7,form:7}},
  {w:6,txt:"🏃 Lavoro specifico sulla velocità col preparatore.",ef:{velocità:1,fatigue:8}},
  {w:6,txt:"⚽ Extra tiri in porta. Conclusioni migliorate.",ef:{tiro:1,fatigue:5}},
  {w:5,txt:"🎯 Lavoro sui passaggi. Visione di gioco in crescita.",ef:{passaggio:1,morale:4}},
  {w:5,txt:"💪 Palestra intensiva. Fisico più forte.",ef:{fisico:1,fatigue:14}},
  {w:5,txt:"🧠 Sessione tattica intensa. Posizionamento migliorato.",ef:{posizionamento:1,mentalità:1}},
  {w:7,txt:"🌀 Dribbling drill col preparatore tecnico. Piedi magici.",ef:{dribbling:1,tecnica:1,fatigue:8}},
  {w:6,txt:"🧘 Sessione mindfulness pre-allenamento. Concentrazione alle stelle.",ef:{mentalità:1,morale:6,fatigue:-5}},
  {w:6,txt:"🏋️ Recupero fisico stellare. Corpo come nuovo.",ef:{fatigue:-20,form:7,morale:6}},
  {w:5,txt:"🎯 Lavoro specifico sui calci piazzati col vice-allenatore.",ef:{tiro:1,passaggio:1,morale:4}},
  {w:5,txt:"🔬 Test atletico eccellente. Il preparatore è entusiasta.",ef:{form:8,morale:7,coachTrust:5}},
  {w:5,txt:"🏆 MVP settimana in allenamento. Il gruppo ti rispetta.",ef:{morale:11,coachTrust:8,popularity:4}},
  {w:5,txt:"🧤 Il portiere amico ti aiuta a migliorare il tiro.",ef:{tiro:1,morale:5}},
  {w:4,txt:"🥗 Piano nutrizionale rivisto. Energia e forma al top.",ef:{fatigue:-14,form:6,morale:4}},
  {w:4,txt:"🧠 Studio video avversario. Visione tattica rivoluzionaria.",ef:{mentalità:1,posizionamento:1,morale:3}},
  {w:4,txt:"🎶 Playlist motivazionale pre-allenamento. Sprint record.",ef:{velocità:1,morale:8,form:5}},
  {w:4,txt:"💥 Colpo di testa al limite in partitella. Il mister sorride.",ef:{fisico:1,morale:7,coachTrust:4}},
  {w:4,txt:"📊 Report tecnico positivo del direttore sportivo.",ef:{coachTrust:6,morale:8,value:0.1}},
  {w:3,txt:"🌱 Crescita silenziosa ma costante. Il lavoro paga.",ef:{morale:6,form:5,mentalità:1}},
  {w:3,txt:"🏖️ Weekend libero concesso dal mister. Torni carico.",ef:{fatigue:-25,morale:10,form:5}},
  // ── SOCIAL & MEDIA — POSITIVE ────────────────────────────────────────────
  {w:8,txt:"📺 Intervista sui media: ottima impressione.",ef:{popularity:9,morale:6,value:0.1}},
  {w:7,txt:"📈 Il tuo valore sale grazie alle prestazioni.",ef:{value:0.2,popularity:4,morale:5}},
  {w:7,txt:"🌟 Un grande club ti osserva! La voce si diffonde.",ef:{popularity:10,morale:8,value:0.3},cond:p=>p.ovr>=65&&p.proStatus==="pro"},
  {w:6,txt:"💬 Supporto caloroso dei tifosi dopo la gara.",ef:{morale:9,popularity:7}},
  {w:6,cond:p=>(p.form||70)>=68/* [7.161.0 BASSA] «momento di grazia» non a forma 35 */,txt:"🔥 Sei in un momento di grazia. Tutto funziona.",ef:{form:12,morale:8,fatigue:-8}},
  {w:5,txt:"🤝 Grande sintonia con un compagno. Spirito di squadra alto.",ef:{morale:8,coachTrust:3}},
  {w:5,txt:"📱 Un tuo video va virale: mezzo milione di views.",ef:{popularity:14,morale:7,value:0.15}},
  {w:4,txt:"🎙️ Intervista esclusiva. Il pubblico ti segue ovunque.",ef:{popularity:11,morale:6,value:0.1}},
  {w:4,txt:"🌍 Feature su un magazine europeo. Interesse internazionale.",ef:{popularity:12,morale:8,value:0.2}},
  {w:4,txt:"🎖️ Premio miglior giovane del mese assegnato dal club.",ef:{popularity:10,morale:12,value:0.15},cond:p=>(p.age||18)<=23/* [7.161.0 A5] */},
  {w:4,txt:"📺 Ospite in TV: ottima impressione, popolarità alle stelle.",ef:{popularity:13,morale:9,value:0.1}},
  {w:3,txt:"🤩 Un tuo fan ti ferma per strada. Ti senti una star.",ef:{morale:9,popularity:5}},
  {w:3,txt:"🏆 Citato in una top list di giovani europei.",ef:{popularity:12,value:0.2,morale:9},cond:p=>(p.age||18)<=23/* [7.161.0 A5] */},
  // ── TEAM / CLUB — POSITIVE ───────────────────────────────────────────────
  {w:5,txt:"🍽️ Cena col presidente. Ti promette un futuro da titolare.",ef:{morale:12,coachTrust:6,popularity:5},cond:p=>(p.squadRole||"rotazione")!=="titolare"&&!p.isCaptain/* [7.161.0 M1] non «prometti la titolarità» al titolare/capitano */},
  {w:4,txt:"💬 Il capitano ti porta in giro per la città. Amicizia solida.",ef:{morale:10,coachTrust:5}},
  {w:4,txt:"🌄 Ritiro pre-campionato fantastico. Gruppo unito come mai.",ef:{morale:11,form:7,fatigue:-8},cond:p=>(p.week||1)<=3},
  {w:4,txt:"🏠 Ambiente familiare sereno. Testa libera, gambe leggere.",ef:{morale:9,fatigue:-10,form:6}},
  {w:3,txt:"⭐ Il club annuncia bonus se raggiungi 10 gol. Motivazione!",ef:{morale:14,form:8},cond:p=>(p.goals||0)<10},
  {w:3,txt:"🎮 Gaming session con i compagni. Legame fortissimo.",ef:{morale:8,coachTrust:3}},
  // ── NEGATIVE — FATIGUE / PHYSICAL ────────────────────────────────────────
  {w:11,txt:"😓 Piccolo affaticamento muscolare. Serve riposo.",ef:{fatigue:16,form:-5,morale:-4}},
  {w:7,txt:"🩹 Fastidio muscolare. Devi ridurre i carichi.",ef:{fatigue:22,form:-8,morale:-6}},
  {w:6,txt:"😔 Momento di black-out. Tutto sembra più difficile.",ef:{form:-10,morale:-10,fatigue:8}},
  {w:5,txt:"🌧️ Settimana di carichi pesanti. Corpo al limite.",ef:{fatigue:26,form:-6,morale:-5}},
  {w:4,txt:"🤒 Piccolo problema di salute. Recupero necessario.",ef:{fatigue:32,form:-13,morale:-8}},
  {w:6,txt:"❄️ Clima rigido agli allenamenti. Dolori muscolari.",ef:{fatigue:18,form:-5,morale:-4}},
  {w:5,txt:"🏥 Controllo medico: affaticamento notato. Carichi ridotti.",ef:{fatigue:20,form:-7,morale:-5}},
  {w:5,txt:"🧳 Trasferta lunga e snervante. Jet-lag alle stelle.",ef:{fatigue:24,morale:-7,form:-5}},
  {w:4,txt:"🔋 Riserve energetiche al minimo. Serve riposo assoluto.",ef:{fatigue:28,form:-9,morale:-7}},
  {w:3,txt:"🌡️ Caldo eccessivo. Allenamento ridotto per precauzione.",ef:{fatigue:15,form:-4}},
  {w:3,txt:"🤒 Raffreddore leggero. Non ti ferma ma rallenta tutto.",ef:{fatigue:20,form:-8,morale:-5}},
  // ── NEGATIVE — TEAM / SOCIAL ─────────────────────────────────────────────
  {w:9,txt:"😤 Discussione in spogliatoio. Tensione alta.",ef:{morale:-11,coachTrust:-5}},
  {w:8,txt:"🗣️ Richiamo dell'allenatore. Non sei al massimo.",ef:{morale:-12,coachTrust:-7,form:-5}},
  {w:7,cond:p=>{try{const h=(p.matchHistory||[]);const m=h[h.length-1];return !!(m&&(m.won===false||(parseFloat(m.rating)||6.5)<=6.0));}catch(e){return false;}}/* [7.161.0 BASSA] i media criticano dopo un fatto negativo REALE (classe 7.35.2) */,txt:"📰 Critica pesante dai media. Pressione psicologica.",ef:{morale:-9,fatigue:5}},
  {w:5,txt:"⚠️ Escluso dai titolari. Situazione difficile.",ef:{morale:-16,coachTrust:-9},cond:p=>p.coachTrust<50},
  {w:5,txt:"🔄 Un nuovo acquisto minaccia il tuo posto.",ef:{morale:-11,coachTrust:-5,form:-4},cond:p=>p.coachTrust<65},
  {w:5,txt:"😡 Discussione con il vice-allenatore. Atmosfera tesa.",ef:{morale:-10,coachTrust:-6}},
  {w:5,txt:"🔄 Cambio di modulo: perdi il ruolo ideale.",ef:{morale:-9,coachTrust:-4,form:-5},cond:p=>p.coachTrust<65},
  {w:4,txt:"⚔️ Rivalità accesa con un compagno per il posto.",ef:{morale:-10,coachTrust:-4}},
  {w:4,txt:"🎙️ Dichiarazione fraintesa dalla stampa. Piccola polemica.",ef:{morale:-8,popularity:-5}},
  {w:4,txt:"⚠️ Richiamo per ritardo agli allenamenti. Situazione delicata.",ef:{morale:-10,coachTrust:-8}},
  {w:4,txt:"🤦 Errore grossolano in partitella. Imbarazzo nello spogliatoio.",ef:{morale:-9,coachTrust:-5,form:-4}},
  {w:3,txt:"👎 Fischi in partitella. I compagni ti criticano.",ef:{morale:-12,form:-6}},
  {w:3,txt:"📉 Periodo down. Il mister ti parla in privato.",ef:{morale:-11,coachTrust:-5,form:-7}},
  {w:3,txt:"📵 Il club limita i social per una settimana. Frustrazione.",ef:{morale:-6,popularity:-3}},
  {w:3,txt:"🏗️ Lavori al centro sportivo. Allenamenti disturbati.",ef:{fatigue:12,morale:-5,form:-4}},
  {w:3,txt:"😤 Incomprensione tattica con il centrocampista titolare.",ef:{morale:-8,coachTrust:-3}},
  {w:2,txt:"😶 Il club acquista un attaccante nel tuo ruolo. Paura.",ef:{morale:-14,coachTrust:-6,form:-5},cond:p=>p.coachTrust<55},
  // Sprint 40 — nuovi eventi settimanali
  {w:5,txt:"⚔️ Settimana del {DERBY} contro {RIVAL}! Tensione altissima al centro sportivo: è la partita che la città aspetta.",ef:{morale:6,fatigue:8,form:4},cond:p=>{const md=(p.calendar||[]).find(m=>m.week===(p.week||1)&&!m.played);return !!(md&&typeof isDerby==="function"&&isDerby(p.club?.id,md.opponentId));}},/* [7.8.5 collaudo PO «la settimana pre-derby è finta»] fire SOLO se la gara della settimana è un DERBY REALE (isDerby) + nome del derby e del rivale */
  {w:4,cond:p=>(p.goals||0)>=1/* [7.161.0 A5] un gol virale richiede un gol */,txt:"📱 Un tuo gol è diventato virale sui social. I tifosi ti contattano in massa.",ef:{popularity:12,morale:8,value:0.04}},
  {w:4,cond:_mktOk,txt:"📰 I media parlano di interesse dall'estero per te. Voci di mercato.",ef:{popularity:8,morale:5,value:0.05}},
  {w:3,txt:"🎉 Un gruppo di tifosi ha fondato un fan club ufficiale a tuo nome.",ef:{popularity:14,morale:10}},
  {w:4,txt:"🌍 Voci di un osservatore della nazionale in tribuna per osservarti.",ef:{morale:8,form:5,popularity:6}},
  {w:6,txt:"🎙️ Un veterano dello spogliatoio ti svela segreti del mestiere. Lezione preziosa.",ef:{form:5,coachTrust:6,morale:7}},
  {w:5,cond:p=>{try{const h=(p.matchHistory||[]);const m=h[h.length-1];return !!(m&&(m.won===false||(parseFloat(m.rating)||6.5)<=5.8));}catch(e){return false;}}/* [7.161.0 A5] «brutta partita» = sconfitta o voto basso REALI (classe 7.35.2) */,txt:"💚 Settimana di recupero mentale dopo una brutta partita. Il mister ti supporta.",ef:{morale:9,form:4,coachTrust:5}},
  {w:5,txt:"🩹 Fastidio muscolare in allenamento. Nulla di grave — ma un campanello d'allarme.",ef:{fatigue:10,form:-4,morale:-3}},
  // ── MERCATO & TRASFERIMENTI ──────────────────────────────────────────────
  {w:6,cond:p=>!!p.hasAgent&&_mktOk(p)/* [7.161.0 M1] */,txt:"💼 Il tuo agente annuncia pubblicamente che valuterà offerte a fine stagione.",ef:{popularity:8,morale:5,value:0.15}},
  {w:5,txt:"🔄 Notizia bomba: un grande club segue da settimane i tuoi allenamenti.",ef:{morale:9,popularity:10,value:0.2}},
  {w:5,txt:"📋 Il direttore sportivo ti convoca: vuole rinnovarti prima della finestra invernale.",ef:{morale:7,coachTrust:6},cond:p=>p.proStatus==="pro"&&p.coachTrust>=50},
  {w:4,txt:"✈️ Osservatori stranieri in tribuna. Il club li vede e inizia a preoccuparsi.",ef:{value:0.25,popularity:9,morale:8},cond:p=>p.ovr>=68&&p.proStatus==="pro"},
  {w:4,txt:"💰 Rumors: una proposta da 15M€ respinta dalla dirigenza. Il tuo valore esplode.",ef:{value:0.3,popularity:12,morale:7},cond:p=>p.ovr>=72&&(p.value||0)>=5&&p.proStatus==="pro"},
  {w:4,cond:p=>!!p.hasAgent&&_mktOk(p)/* [7.161.0 M1] */,txt:"🤝 L'agente negozia con discrezione. Possibile addio a fine anno.",ef:{morale:6,popularity:7,value:0.2}},
  {w:3,txt:"🚨 Flash di mercato: il tuo nome accostato a una big europea. Spogliatoio in subbuglio.",ef:{morale:4,coachTrust:-3,popularity:15,value:0.35},cond:p=>p.ovr>=75&&p.proStatus==="pro"&&_mktOk(p)},
  {w:3,cond:_mktOk,txt:"🔒 Il club blocca qualsiasi cessione. 'È incedibile' — dichiarano in conferenza.",ef:{morale:10,coachTrust:5,popularity:6}},
  // ── NOTIZIE DI CLUB ───────────────────────────────────────────────────────
  {w:6,txt:"📢 Il club annuncia un nuovo sponsor di maglia. Grande campagna pubblicitaria con te in primo piano.",ef:{popularity:10,value:0.1,morale:6}},
  {w:5,txt:"🏗️ Il club inaugura un nuovo centro sportivo ultramoderno. Allenamenti al top.",ef:{form:6,fatigue:-8,morale:8}},
  {w:5,txt:"🤝 Il club firma un accordo con un brand globale. Bonus per tutti i giocatori.",ef:{morale:11,popularity:5}},
  {w:4,txt:"👔 Cambia il direttore sportivo. Nuova gestione, nuove priorità: senti pressione.",ef:{coachTrust:-4,morale:-6,form:-3}},
  {w:4,txt:"💸 Il club acquista un big internazionale: i tifosi esplodono di gioia, tu ti senti in competizione.",ef:{morale:-5,form:3,coachTrust:-2}},
  {w:3,txt:"🏆 Il presidente promette un mercato di gennaio ambizioso. Clima eccitante.",ef:{morale:10,form:5},cond:p=>(p.week||1)>=15&&(p.week||1)<=22&&(p.proStatus||"u18")==="pro"},
  // ── NAZIONALE & PALCOSCENICO INTERNAZIONALE ───────────────────────────────
  {w:6,txt:"🌍 Il ct della nazionale ti segue da vicino: sei nella lista dei pre-convocati.",ef:{morale:12,popularity:11,form:6},cond:p=>p.proStatus==="pro"&&p.ovr>=70},
  {w:5,txt:"📺 Il tuo nome appare per la prima volta in una lista ufficiale della nazionale.",ef:{popularity:14,morale:11,value:0.2},cond:p=>p.proStatus==="pro"&&p.ovr>=68},
  {w:4,cond:p=>(p.age||18)<=23/* [7.161.0 A5] claim d'età esplicito */,txt:"🌐 Feature su un portale europeo: 'Uno dei migliori under-23 del continente'.",ef:{popularity:15,value:0.25,morale:9}},
  {w:4,txt:"🥇 Candidato al premio miglior giovane della lega. Vota il pubblico.",ef:{popularity:13,morale:10,value:0.15},cond:p=>(p.season||1)<=4&&p.ovr>=65},
  {w:3,txt:"🏅 La federazione ti invita a un evento con le leggende del calcio nazionale.",ef:{morale:14,popularity:12,coachTrust:4}},
  // ── VITA DA CALCIATORE ────────────────────────────────────────────────────
  {w:5,txt:"🏠 Trovi casa vicino al centro sportivo. Meno stress, più sonno: forma in crescita.",ef:{fatigue:-15,form:7,morale:8}},
  {w:5,txt:"👨‍👩‍👦 Visita della famiglia allo stadio. Ispirazione pura: vuoi stupirli.",ef:{morale:14,form:8}},
  {w:4,txt:"📚 Inizi a studiare la lingua locale. I compagni apprezzano: integrazione perfetta.",ef:{morale:9,coachTrust:5,popularity:5}},
  {w:4,cond:p=>(p.proStatus||"u18")==="pro"&&(p.age||18)<=23/* [7.161.0 M1] «primo contratto serio» = giovane pro, non un U18 né un veterano milionario */,txt:"🚗 Nuova auto acquistata dopo il primo contratto serio. Senso di realizzazione.",ef:{morale:13,fatigue:-6}},
  {w:3,txt:"🎬 Invitato a un evento di gala in città. Sei ufficialmente un personaggio pubblico.",ef:{popularity:14,morale:8}},
  {w:3,txt:"🤝 Collaborazione con un'associazione benefica. Immagine pubblica alle stelle.",ef:{popularity:12,morale:11}},
  // ── PSICOLOGICI / MENTALI ─────────────────────────────────────────────────
  {w:6,txt:"🧠 Lavoro con lo psicologo sportivo: sblocchi i limiti mentali. Tutto più fluido.",ef:{mentalità:1,form:7,morale:8,fatigue:-5}},
  {w:5,txt:"🔥 Settimana di fuoco: vuoi dimostrare al mister che meriti il posto.",ef:{form:9,fatigue:10,coachTrust:6}},
  {w:4,txt:"💭 Notte insonne prima di una partita importante. L'ansia è alta.",ef:{fatigue:12,form:-5,morale:-4}},
  {w:4,txt:"🌊 Momento di dubbio: stai vivendo la carriera che desideri?",ef:{morale:-7,form:-4,mentalità:1}},
  {w:3,txt:"⚡ Scintilla: un momento in allenamento ti ricorda perché ami questo sport.",ef:{morale:14,form:9,fatigue:-8}},
  // Template events — {CLUB}/{OVR}/{GOALS}/{SEASON} resolved at runtime
  {w:3,txt:"🏟️ Settimana speciale al {CLUB}: il mister convoca tutti per un discorso motivazionale.",ef:{morale:11,coachTrust:5,form:5}},
  {w:2,txt:"🌟 Stagione {SEASON}: il tuo percorso al {CLUB} è sempre più convincente. OVR {OVR} — e in crescita.",ef:{morale:8,coachTrust:5,popularity:6},cond:p=>(p.season||1)>=2},
  {w:2,txt:"⚽ Stai dominando questa stagione al {CLUB}: {GOALS} gol e un OVR di {OVR}. I media non parlano d'altro.",ef:{popularity:12,morale:9,value:0.15},cond:p=>(p.goals||0)>=5&&p.ovr>=65},
];
// Sprint B — resolve template placeholders {CLUB}/{OVR}/{GOALS}/{SEASON} in event text
function resolveEvText(txt,p){
  return txt
    .replace(/\{CLUB\}/g,p.club?.n||p.club?.name||"il club")
    .replace(/\{OVR\}/g,String(p.ovr||60))
    .replace(/\{GOALS\}/g,String(p.goals||0))
    .replace(/\{SEASON\}/g,String(p.season||1))
    .replace(/\{INJWK\}/g,String(p.injuryWeeks||0))
    .replace(/\{AGE\}/g,String(p.age||18))/* [7.159.0] età per i momenti «astro» */
    .replace(/\{RIVGAP\}/g,String(Math.max(1,((p.rival&&p.rival.totalGoals)||0)-(p.totalGoals||0))))/* [7.161.0 M4] gap gol REALE col rivale */
    .replace(/\{DERBY\}/g,(()=>{try{const md=(p.calendar||[]).find(m=>m.week===(p.week||1)&&!m.played);const d=md&&typeof isDerby==="function"&&isDerby(p.club?.id,md.opponentId);return d?d.name:"derby";}catch(e){return "derby";}})())/* [7.8.5] nome del derby REALE della settimana */
    .replace(/\{RIVAL\}/g,(()=>{try{const md=(p.calendar||[]).find(m=>m.week===(p.week||1)&&!m.played);return (md&&(md.opponentName||"i rivali"))||"i rivali";}catch(e){return "i rivali";}})());
}
// [7.159.0 C — anti-ripetizione a LUNGO termine] bucket dei «più freschi»: fra gli impulsi ELEGGIBILI (fuori
//   dalla finestra ravvicinata `recent` + `cond` rispettata) ritorna quelli MENO visti in tutta la carriera
//   (contatore `seen`). Il picker pesca a caso da questo bucket → prima di rivedere un impulso il gioco esaurisce
//   il pool. Puro/testabile (usato dal gioco E dalla probe career-moments-test).
function impulseFreshBucket(pool,recent,seen,condOk){
  const _r=recent||[],_s=seen||{},_ok0=condOk||(()=>true);
  /* [7.430.0 collaudo PO «conseguenza gia' vista nella carriera!» (l'orologio della squadra, di nuovo,
     a S.21)] GLI IMPULSI UNA-TANTUM NON TORNANO MAI. L'anti-ripetizione ravvicinata (ultimi 40) e il
     bucket dei meno visti fanno il loro lavoro, ma su una carriera ventennale il pool CICLA per
     costruzione — e rivivere «compri l'orologio della squadra» quando l'orologio lo possiedi da
     quindici stagioni e' incoerente. Gli eventi che producono un fatto permanente (l'orologio, la
     biografia, il murale, la donazione scoperta...) portano `once:true`: visti una volta
     (contatore a vita `impulseSeen`, 7.159), spariscono per sempre dal pescaggio. */
  const _ok=im=>_ok0(im)&&!(im.once&&_s[im.id]);
  let p=pool.filter(im=>!_r.includes(im.id)&&_ok(im));
  if(p.length<6)p=pool.filter(im=>!_r.slice(-6).includes(im.id)&&_ok(im));
  if(!p.length)return pool.filter(_ok);
  const _min=Math.min(...p.map(im=>(_s[im.id]||0)));
  const _fresh=p.filter(im=>(_s[im.id]||0)<=_min);
  return _fresh.length?_fresh:p;
}

/* ========================================
   WEEKLY RANDOM EVENTS — life events (10 pool)
   Fire during doAdvanceWeek when weekLived=false (25% chance)
======================================== */
let _lastWRE=-1,_lastImpulseId=null;/* [5.98.0 D1] anti-ripetizione consecutiva (memoria di sessione) */
const WEEKLY_RANDOM_EVENTS=[
  {txt:"🤝 Il tuo agente chiama: interesse concreto da un club importante. Sei motivato!",ef:{morale:9,popularity:6}},
  {txt:"🎽 Il club presenta la nuova maglia. Sei in prima fila per la foto. Grande hype!",ef:{popularity:8,morale:5},cond:p=>(p.week||1)<=5/* [7.161.0 BASSA] la maglia si presenta a inizio stagione, non a W25 */},
  {txt:"🌧️ Settimana di carichi pesanti. Lo spogliatoio è stanco ma unito.",ef:{fatigue:10,morale:-3}},
  {txt:"🎂 Compleanno di un compagno. Cena di squadra: il gruppo si compatta.",ef:{morale:9,fatigue:-4}},
  {txt:"📱 Un tuo gol va virale sui social. La popolarità cresce di molto.",ef:{popularity:13,morale:6}},
  {txt:"🧑‍⚕️ Visita medica di routine: risultati ottimi. Sei in piena forma.",ef:{fatigue:-12,morale:5,form:4}},
  {txt:"😤 Tensione negli allenamenti dopo una brutta settimana. Serve concentrazione.",ef:{morale:-7,fatigue:5}},
  {txt:"🌟 Uno scout europeo ti osserva nell'allenamento aperto. La voce si diffonde.",ef:{morale:11,popularity:9,value:0.1}},
  {txt:"📰 Un grande quotidiano sportivo ti dedica un articolo. La notorietà cresce.",ef:{popularity:10,morale:5,value:0.05}},
  {txt:"💬 Il capitano elogia il tuo impegno davanti a tutto il gruppo. Il mister annuisce.",ef:{morale:10,coachTrust:6}},
  {txt:"🏆 Nomina a sorpresa: sei in lista per il premio mensile del club!",ef:{morale:12,popularity:8,value:0.1}},
  {txt:"🎙️ Intervista flash post-allenamento. Rispondi con classe. I tifosi ti amano di più.",ef:{popularity:9,morale:6}},
  {txt:"🍕 Pizza e relax col gruppo. La settimana finisce bene.",ef:{morale:8,fatigue:-8}},
  {txt:"🔑 Ti viene affidata una fascia da capitano in una partitella. Responsabilità e orgoglio.",ef:{morale:13,mentalità:1,coachTrust:5},cond:p=>!p.isCaptain/* [7.161.0 BASSA] sei GIÀ il capitano: la fascia in partitella è ovvia, non un evento */},
  {txt:"📊 Analisi video individuale col mister. Esce un piano di crescita su misura.",ef:{coachTrust:8,form:5,morale:6}},
  {txt:"🎁 Il club regala gadget personalizzati. Piccola sorpresa, grande morale.",ef:{morale:7,popularity:4}},
  {txt:"🚂 Viaggio in treno con la squadra. Legame umano fortissimo.",ef:{morale:8,coachTrust:4,fatigue:-5}},
  {txt:"📸 Servizio fotografico per il sito del club. Ti senti una star.",ef:{popularity:8,morale:6}},
  {cond:_mktOk,txt:"⚠️ Qualcuno diffonde voci su un tuo possibile trasferimento. Distrazione.",ef:{morale:-6,fatigue:6}},
  {txt:"🌩️ Temporale annulla l'allenamento. Giornata libera inaspettata.",ef:{fatigue:-15,morale:5}},
  {txt:"😰 Pressione esterna per i prossimi risultati. Caricarsi o crollare.",ef:{morale:-8,fatigue:7}},
  {txt:"🎤 Compagno famoso fa una battuta su di te in conferenza. Ti scuoti.",ef:{morale:-5,popularity:5}},
  {txt:"🏟️ Visita allo stadio da solo la sera. Ispirazione e brividi.",ef:{morale:11,mentalità:1}},
  {txt:"🧊 Bagni di ghiaccio post-allenamento. Recupero accelerato.",ef:{fatigue:-18,form:7}},
  {txt:"🔥 Mini-torneo tra reparti. Il tuo team vince. Euforia totale.",ef:{morale:12,form:8,coachTrust:3}},
  // Sprint 33 C8 — gossip, press, sponsor
  {txt:"🗣️ Si vocifera di tensioni tra tecnico e dirigenza. L'ambiente è carico.",ef:{morale:-5,fatigue:5}},
  {cond:_mktOk,txt:"📲 Il tuo nome rimbalza online in chiave mercato. Interesse concreto.",ef:{popularity:12,morale:7,value:0.08}},
  {txt:"🤫 Il ds ti confida: il club ti considera intoccabile. Euforia totale.",ef:{morale:12,coachTrust:7,value:0.06}},
  {txt:"🎭 Clima pesante dopo voci su un big che vuole andarsene. Unità a rischio.",ef:{morale:-6,coachTrust:-2}},
  {txt:"🎤 Conferenza stampa: il mister ti elogia davanti ai giornalisti. Visibilità.",ef:{popularity:10,morale:8,coachTrust:3}},
  {txt:"📡 Diretta TV ti dedica uno speciale. I tuoi numeri vengono analizzati in diretta.",ef:{popularity:11,value:0.07,morale:6}},
  {txt:"📰 Un giornalista ti critica pesantemente sull'edizione cartacea. Fastidio.",ef:{morale:-9,popularity:-3}},
  {txt:"🎙️ Sei ospite in un podcast calcistico. La community esplode di commenti.",ef:{popularity:10,morale:5}},
  {txt:"💼 Contatto con uno sponsor sportivo. Proposta di endorsement personale.",ef:{morale:9,popularity:8,value:0.10}},
  {txt:"👟 Un brand ti manda materiale tecnico personalizzato. Ti senti una star.",ef:{morale:7,popularity:6}},
  {txt:"🤝 Il tuo agente finalizza un accordo commerciale secondario. Entrate extra.",ef:{morale:8,popularity:5,value:0.08}},
  {txt:"📦 Gadget ufficiali dallo sponsor del club distribuiti in spogliatoio. Squadra felice.",ef:{morale:7,fatigue:-5}},
  {txt:"🏅 Il club annuncia uno sponsor che include il tuo nome sul kit.",ef:{popularity:9,morale:6,value:0.05}},
  {txt:"🌐 Interview online con un media internazionale. La tua storia fa il giro del mondo.",ef:{popularity:14,morale:8,value:0.06}},
  {txt:"👁️ Uno scout tedesco ti segue da tre settimane. Lo staff ne parla.",ef:{morale:10,popularity:6,value:0.09}},
  // Sprint 111 — nuovi eventi tematici
  {txt:"⚖️ Protesta per un rigore negato. Il club presenta ricorso. Ambiente teso ma unito.",ef:{morale:-4,coachTrust:5}},
  {txt:"📊 Il club pubblica le statistiche stagionali: sei in testa per diverse categorie. Orgoglio.",ef:{morale:11,popularity:8,value:0.06}},
  {txt:"🔥 Virale su Twitter/X: un tuo dribbling viene visto 3 milioni di volte in 24 ore.",ef:{popularity:14,morale:8,value:0.07}},
  {txt:"🌅 Mercato estivo: trattativa sfumata per un big. Lo spogliatoio si concentra sul campo.",ef:{morale:-3,coachTrust:4},cond:p=>(p.week||1)<=6&&(p.proStatus||"u18")==="pro"},
  {txt:"📈 Record storico del club in vista: mancano pochissimo per raggiungerlo.",ef:{morale:12,form:7}},
  {txt:"🗺️ Ritiro tattico in montagna. Il mister presenta il nuovo modulo: eccitazione e curiosità.",ef:{coachTrust:7,mentalità:1,fatigue:8}},
  {txt:"🎙️ Intervista a un media internazionale: sei definito 'il talento del momento'. Brividi.",ef:{popularity:12,morale:9,value:0.05}},
  {txt:"🏟️ Un tifoso ti riconosce per strada e scoppia in lacrime. L'impatto del calcio sulla gente.",ef:{morale:13,popularity:7}},
  {txt:"🏕️ Training camp pre-stagionale intensissimo. Ne esci più forte e con la testa giusta.",ef:{fisico:1,mentalità:1,fatigue:14},cond:p=>(p.week||1)<=3},
  {txt:"🎂 Il club festeggia il centenario. Atmosfera storica, responsabilità enorme.",ef:{morale:10,popularity:8,coachTrust:3}},
  {txt:"🏗️ Inaugurazione della nuova ala dello stadio. Il club cresce — e tu ne fai parte.",ef:{morale:8,popularity:6,value:0.05}},
  {txt:"🤜 Piccolo scontro in allenamento con un compagno. Il mister risolve tutto prima di sera.",ef:{morale:-5,coachTrust:3,fatigue:5}},
];

/* ========================================
   SPRINT 24 — A: LO SPOGLIATOIO
======================================== */
const TEAMMATE_ARCHETYPES=[
  {id:"capitano",name:"Il Capitano",icon:"🤝",desc:"Leader silenzioso. Ti difende sempre nello spogliatoio.",bond_bonus:{coachTrust:4,morale:5}},
  {id:"mentore",name:"Il Mentore",icon:"🧠",desc:"Veterano in declino. Ti insegna più di qualsiasi allenamento.",bond_bonus:{form:4}},
  {id:"amico",name:"L'Amico",icon:"😄",desc:"Stesso sogno, stessa generazione. Ridete e soffrite insieme.",bond_bonus:{morale:7,fatigue:-6}},
  {id:"conflittuale",name:"Il Rivale Interno",icon:"😤",desc:"Compete per il tuo posto. Vi sprondate a vicenda senza dirlo.",bond_bonus:{form:6,morale:-2}},
  {id:"ex_capitano",name:"L'Ex Capitano",icon:"🎖️",desc:"Ti ha ceduto la fascia dopo anni da leader. La sua esperienza resta preziosa.",bond_bonus:{coachTrust:3,morale:4}},// [7.5.0] ruolo assunto dal vecchio capitano quando l'eroe eredita la fascia (niente due capitani)
];
const SPOGLIATOIO_MOMENTS=[
  {id:"sm_derby",cond:p=>{const md=(p.calendar||[]).find(m=>m.week===(p.week||1)&&!m.played);return !!(md&&(md.type||(typeof isDerby==="function"&&isDerby(p.club?.id,md.opponentId))));},/* [6.90.0] «non è una partita normale» ⇒ coppa/europa/nazionale o derby in settimana */txt:'{nome} ti mette la mano sulla spalla: «Oggi non è una partita normale.»',archetype:"capitano",choices:[
    {txt:'«Lo so. Sono pronto.»',ef:{morale:7,coachTrust:3},bond:6},
    {txt:'«Ci penserò durante il riscaldamento.»',ef:{morale:2},bond:2},
  ]},
  {id:"sm_mentor_advice",txt:'{nome} ti ferma in sala video: «Hai visto come si muove il loro terzino? Aspettalo così.»',archetype:"mentore",choices:[
    {txt:'«Ottima osservazione. Ci lavoro.»',ef:{form:5,coachTrust:4},bond:7},
    {txt:'«Ci penso io, grazie.»',ef:{form:1},bond:1},
  ]},
  {id:"sm_friend_joke",txt:'{nome} ti scrive alle 23: «Domani vinciamo. Ho sognato il tuo gol.»',archetype:"amico",choices:[
    {txt:'«Perfetto, ci conto sul serio.»',ef:{morale:9,fatigue:-4},bond:8},
    {txt:'«Dormi. Ci vediamo domani.»',ef:{morale:3},bond:3},
  ]},
  {id:"sm_rival_tension",txt:'{nome} si allena un\'ora in più dopo la sessione. Ti fissa prima di andarsene.',archetype:"conflittuale",choices:[
    {txt:'Resti anche tu. Mezzo giro extra.',ef:{form:7,fatigue:8},bond:5},
    {txt:'Sorridi e torni negli spogliatoi.',ef:{morale:3,fatigue:-4},bond:1},
  ]},
  {id:"sm_bad_result",cond:p=>{const r=(p.matchHistory||[]).slice(-1)[0];return !!(r&&!r.won&&!r.drew);},/* [6.90.0 collaudo PO] SOLO dopo una vera sconfitta */txt:'Dopo la sconfitta, {nome} rompe il silenzio: «Non possiamo permetterci di perdere così ancora.»',archetype:null,choices:[
    {txt:'«Hai ragione. Da lunedì si cambia.»',ef:{coachTrust:5,morale:4},bond:4},
    {txt:'«È colpa del sistema di gioco.»',ef:{coachTrust:-3,morale:-2},bond:-2},
  ]},
  {id:"sm_celebration",cond:p=>{const r=(p.matchHistory||[]).slice(-1)[0];return !!(r&&(r.goals||0)>0);},/* [6.90.0] serve un TUO gol nell\'ultima gara */txt:'Dopo un gol importante, {nome} ti abbraccia forte: «Sei il più forte che abbia mai visto qui.»',archetype:null,choices:[
    {txt:'«Facciamolo ancora insieme.»',ef:{morale:10,popularity:6},bond:8},
    {txt:'Sorridi senza dire nulla.',ef:{morale:5},bond:3},
  ]},
  {id:"sm_crisis",cond:p=>{const r=(p.matchHistory||[]).slice(-1)[0];return !!(r&&!r.won&&!r.drew);},/* [6.90.0] mister furioso ⇒ si viene da una sconfitta */txt:'Il mister è furioso nello spogliatoio. {nome} ti sussurra: «Stai zitto. Non è il momento.»',archetype:"capitano",choices:[
    {txt:'Annuisci e ascolti.',ef:{coachTrust:6,morale:2},bond:5},
    {txt:'Prendi parola comunque.',ef:{coachTrust:-5,morale:5},bond:-3},
  ]},
  {id:"sm_mentor_storia",txt:'{nome} ti racconta quella volta che perse la finale: «Quella notte ho capito tutto.»',archetype:"mentore",choices:[
    {txt:'«Grazie per avermi detto questo.»',ef:{morale:8,form:3},bond:9},
    {txt:'Annuisci educatamente e vai a cambiarti.',ef:{morale:2},bond:1},
  ]},
  {id:"sm_amico_problema",txt:'{nome} non si allena bene da due settimane. Ti chiede un consiglio.',archetype:"amico",choices:[
    {txt:'«Parliamo stasera. Ti sei fatto condizionare.»',ef:{morale:6,coachTrust:4},bond:9},
    {txt:'«Non sono il tipo adatto a questi discorsi.»',ef:{morale:1},bond:-2},
  ]},
  {id:"sm_rientro",txt:'{nome} ti aspetta fuori dalla sala medica: «Bentornato. Ci mancavi.»',archetype:null,requiresRecovery:true,choices:[
    {txt:'«Avete retto bene senza di me.»',ef:{morale:10,fatigue:-6},bond:6},
    {txt:'«Sono solo contento di essere qui.»',ef:{morale:7,fatigue:-3},bond:4},
  ]},
];

/* [7.453.0 collaudo PO «troppo presto, ha poche partite in primavera 2» — screenshot S.1 W.4, FC Calabro
   Primavera, 70 OVR, quarta settimana di sempre] UN BRAND NON INSEGUE UN RAGAZZO DELLA PRIMAVERA.
   L'impulso dello spot personale non aveva NESSUNA condizione: usciva a chiunque, in qualunque momento
   della carriera. Cercandone altri come lui ne sono saltati fuori SEI, tutti della stessa famiglia
   commerciale e tutti senza condizione — spot, endorsement, video virale, accordo con la casa
   automobilistica, bonus-gol social, brand alimentare. Un quattordicenne con quattro presenze poteva
   riceverli tutti. Come per l'identita' della gara, la regola sta in un posto solo: serve essere
   PROFESSIONISTA e avere qualcosa da vendere — un minimo di carriera alle spalle OPPURE una notorieta'
   che la anticipa (il ragazzo esploso subito esiste, quello ignoto che firma spot no). */
const _brandOk453=(p)=>{try{return (p.proStatus||"u18")==="pro"&&(((p.totalMatches||p.matches||0)>=20)||((p.popularity||0)>=40));}catch(_e){return false;}};
/* …e una seconda, piu' leggera, per gli impulsi che non chiedono un contratto ma solo di essere
   RICONOSCIUTI (i tifosi fuori dal centro sportivo, l'asta della maglia, la fondazione che ti chiede
   di metterci il nome): bastano un po' di notorieta' o l'essere passato fra i grandi. */
const _notoOk453=(p)=>{try{return (p.proStatus||"u18")==="pro"||((p.popularity||0)>=28);}catch(_e){return false;}};
/* [7.454.0 collaudo PO «troppo presto!», terza segnalazione della stessa famiglia: la stampa chiede di
   VOCI DI MERCATO a un ragazzo della Primavera 2 alla decima settimana] Terza regola: chi ha un PESO
   nello spogliatoio e in campo. Serve alle domande che danno per scontato uno status — «la pressione di
   essere un giocatore importante», «si sente un punto di riferimento» — che a un diciassettenne di
   Primavera non si possono nemmeno porre. Il meccanismo per filtrarle esiste dal 6.97.0 (le domande
   possono dichiarare una `cond`, aggiunto per la nota PO «eviterei di parlare di Nazionale a un OVR
   basso in B»): queste tre semplicemente non lo usavano. */
const _statusOk453=(p)=>{try{return (p.proStatus||"u18")==="pro"&&(((p.totalMatches||p.matches||0)>=60)||((p.ovr||60)>=78)||((p.popularity||0)>=55));}catch(_e){return false;}};
/* Misura che ha portato a queste due righe (scanner agli atti, impulsi_primavera.mjs): contro il
   giocatore dello screenshot — 17 anni, Primavera 2, quinta settimana di sempre, 4 presenze — erano
   eleggibili 56 impulsi su 106, e TREDICI di essi presupponevano una carriera che quel ragazzo non ha.
   Tredici e' un minimo, non un totale: 50 condizioni su 106 non erano valutabili fuori dal gioco. */

/* ========================================
   SPRINT 24 — B: OGNI SETTIMANA CONTA (IMPULSI)
======================================== */
const WEEKLY_IMPULSES=[
  // [6.85.0 collaudo PO «impulsi settimanali molto ripetitivi»] +12 dilemmi (pool 48→60) + memoria persistente
  //   anti-ripetizione nel picker (player.recentImpulses, ultimi 16 esclusi).
  {id:"wi_docufilm",once:true,cat:"opportunità",cond:p=>(p.popularity||20)>=38,txt:"Il club vuole girarti addosso un mini-documentario: una troupe ti seguirà per tutta la settimana.",choices:[
    {txt:"🎬 Accetto — mi racconto",ef:{popularity:8,fatigue:5,coachTrust:-3}},
    {txt:"🚪 No grazie, prima il campo",ef:{coachTrust:3}},
  ]},
  {id:"wi_asta_maglia",cond:_notoOk453/* [7.453.0] prima ti devono riconoscere */,cat:"scelta",txt:"Il club dei tifosi mette all'asta la tua maglia per beneficenza e ti chiede un gesto in più.",choices:[
    {txt:"❤️ Aggiungo gli scarpini autografati",ef:{popularity:9,morale:5,bank:-5000}},
    {txt:"👕 Va bene la maglia",ef:{popularity:3}},
  ]},
  {id:"wi_dieta_ferrea",cat:"scelta",txt:"Il nutrizionista propone una settimana di dieta ferrea per arrivare tirato alla prossima gara.",choices:[
    {txt:"🥗 La seguo alla lettera",ef:{form:5,morale:-3}},
    {txt:"🍕 Uno sgarro me lo concedo",ef:{morale:4,form:-2}},
  ]},
  {id:"wi_ex_compagno_cena",cat:"tensione",cond:p=>(p.history||[]).length>0&&(p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played),txt:"Un ex compagno, ora avversario diretto della prossima giornata, ti invita a cena. Le foto girerebbero.",choices:[
    {txt:"🍽 Ci vado — l'amicizia viene prima",ef:{morale:5,coachTrust:-3}},
    {txt:"📵 Rimandiamo a dopo la partita",ef:{coachTrust:3,morale:-2}},
  ]},
  {id:"wi_torneo_padel",cat:"scelta",txt:"Nel giorno libero i compagni organizzano un torneo di padel. Sarà battaglia vera.",choices:[
    {txt:"🎾 Gioco per vincere",ef:{chem:7,fatigue:7}},
    {txt:"🛋 Tifo dal divano",ef:{fatigue:-5,chem:-3}},
  ]},
  {id:"wi_biografia",once:true,cat:"opportunità",txt:"Un editore ti propone la biografia «a metà carriera». Anticipo ricco, ma qualcuno la troverà prematura.",choices:[
    {txt:"📖 Firmo il contratto",ef:{bank:20000,popularity:6,coachTrust:-4}},
    {txt:"⌛ È troppo presto",ef:{coachTrust:4}},
  ]},
  {id:"wi_murale",once:true,cat:"scelta",cond:p=>(p.popularity||20)>=50,txt:"I tifosi ti hanno dedicato un murale nel quartiere e ti invitano all'inaugurazione infrasettimanale.",choices:[
    {txt:"🎨 Vado di persona",ef:{popularity:8,morale:6,fatigue:5}},
    {txt:"🙏 Ringrazio con un video",ef:{popularity:3}},
  ]},
  {id:"wi_extra_portieri",cat:"scelta",txt:"Il preparatore dei portieri ti offre una sessione extra di finalizzazione contro i numeri uno della rosa.",choices:[
    {txt:"🥅 Resto e calcio finché fa buio",ef:{form:6,fatigue:7,coachTrust:4}},
    {txt:"⏱ Oggi ho già dato tutto",ef:{fatigue:-2}},
  ]},
  {id:"wi_influencer",cat:"conseguenza",cond:p=>(p.popularity||20)>=45/* [7.161.0 M1] un influencer da milioni di follower non cerca un carneade */,txt:"Un influencer da milioni di follower vuole girare un «una giornata con te» dentro il centro sportivo.",choices:[
    {txt:"📱 Porte aperte",ef:{popularity:10,coachTrust:-6,fatigue:4}},
    {txt:"🚫 Il centro sportivo è sacro",ef:{coachTrust:4,popularity:-2}},
  ]},
  {id:"wi_ospedale",cat:"scelta",txt:"Il reparto pediatrico dell'ospedale cittadino chiede una visita a sorpresa per i piccoli tifosi.",choices:[
    {txt:"🏥 Ci vado con i regali",ef:{morale:8,popularity:6,fatigue:4}},
    {txt:"💸 Dono in silenzio",ef:{bank:-10000,morale:4}},
  ]},
  {id:"wi_recupero_hitech",cat:"scelta",txt:"Il club installa una nuova area recupero hi-tech. Le sessioni extra però tolgono tempo allo spogliatoio.",choices:[
    {txt:"❄️ Ci vivo dentro",ef:{fatigue:-8,form:3,chem:-2}},
    {txt:"👥 Preferisco stare col gruppo",ef:{chem:4}},
  ]},
  {id:"wi_carita_anonima",once:true,cat:"conseguenza",txt:"Un giornalista ha scoperto una tua donazione anonima e vuole pubblicarla. «La gente deve saperlo».",choices:[
    {txt:"📰 Che esca pure",ef:{popularity:8,morale:-2}},
    {txt:"🤫 Resti anonima, o niente",ef:{morale:5}},
  ]},
  // [5.91.0 BIL-9] dilemmi con trade-off REALI: toccano bankBalance (economia 3.2), coachTrust, chimica, fatica.
  {id:"wi_sponsor_pers",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"opportunità",txt:"Un brand sportivo ti offre uno spot personale. Cachet importante, ma il mister storce il naso: «Pensa al campo».",choices:[
    {txt:"💰 Firmo — è il mio momento",ef:{bank:35000,popularity:8,coachTrust:-6}},
    {txt:"🙏 Rifiuto con eleganza",ef:{coachTrust:6,morale:-2}},
  ]},
  {id:"wi_cena_squadra",cat:"scelta",txt:"I senatori organizzano una cena di squadra infrasettimanale. Sarà lunga.",choices:[
    {txt:"🍝 Ci vado — il gruppo conta",ef:{chem:8,morale:6,fatigue:8}},
    {txt:"🛌 Salto — devo recuperare",ef:{fatigue:-6,chem:-4}},
  ]},
  {id:"wi_investimento",once:true,cat:"conseguenza",txt:"Il tuo consulente propone un investimento immobiliare «sicuro». Serve liquidità subito.",choices:[
    {txt:"📈 Investo metà del conto",ef:{bank:-40000,morale:3},flag:"investment",note:"rendita a fine stagione"},
    {txt:"🏦 Tengo i soldi fermi",ef:{morale:1}},
  ]},
  {id:"wi_beneficenza",cond:_notoOk453/* [7.453.0] prima ti devono riconoscere */,cat:"scelta",txt:"La fondazione del club ti chiede di finanziare un campetto di quartiere, a nome tuo.",choices:[
    {txt:"❤️ Lo pago io",ef:{bank:-25000,popularity:12,morale:8}},
    {txt:"🤝 Partecipo solo all'evento",ef:{popularity:4}},
  ]},
  {id:"wi_procuratore_push",cat:"tensione",cond:p=>!!p.hasAgent&&_mktOk(p)/* [7.161.0 M1] «il tuo agente» solo se ce l'hai · [collaudo PO «assurdo a poche settimane dal ritiro»] mai a chi ha annunciato l'addio */,txt:"Il tuo agente vuole forzare: «Faccio uscire il tuo nome sui giornali, il club capirà che vali di più».",choices:[
    {txt:"📰 Dagli il via libera",ef:{value:0.25,popularity:6,coachTrust:-8}},
    {txt:"✋ Fermalo — non è il momento",ef:{coachTrust:4}},
  ]},
  {id:"wi_giovane_aiuto",cat:"scelta",cond:p=>(p.proStatus||"u18")==="pro"/* [7.161.0 M1] un U18 non fa da mentore alla Primavera: ci gioca */,txt:"Un ragazzo della Primavera ti chiede di fermarti dopo l'allenamento per aiutarlo coi movimenti.",choices:[
    {txt:"🎓 Resto un'ora con lui",ef:{chem:6,coachTrust:5,fatigue:6}},
    {txt:"⏱ Non oggi",ef:{fatigue:-2,chem:-2}},
  ]},
  {id:"wi_intervista_scomoda",cat:"tensione",cond:p=>(p.coachTrust||70)<55/* [7.472.0] «il mister ti sta usando male» e' una provocazione che regge solo se il mister davvero non ti sostiene: qui il contesto NON e' la prestazione (quella e' _criticaOk) ma il rapporto col tecnico */,txt:"Un giornalista ti stuzzica: «Il mister ti sta usando male, non trovi?» La risposta finirà in prima pagina.",choices:[
    {txt:"🔥 Dico quello che penso",ef:{popularity:9,coachTrust:-10,morale:4}},
    {txt:"🧊 Glissa con diplomazia",ef:{coachTrust:5,popularity:-2}},
  ]},
  {id:"wi_personal_chef",cat:"opportunità",txt:"Uno chef specializzato in nutrizione sportiva si propone per un mese di prova. Costa.",choices:[
    {txt:"🥗 Lo assumo",ef:{bank:-15000,fatigue:-10,form:3}},
    {txt:"🍕 Sto bene così",ef:{}},
  ]},
  {id:"wi_famiglia_visita",cat:"scelta",txt:"I tuoi genitori vogliono venire a trovarti proprio nella settimana più piena.",choices:[
    {txt:"👨‍👩‍👦 Li ospito — le radici contano",ef:{morale:12,fatigue:6}},
    {txt:"📅 Rimandiamo di un mese",ef:{morale:-4,fatigue:-3}},
  ]},
  {id:"wi_scommessa_social",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,once:true,cat:"conseguenza",txt:"Un tuo vecchio video da ragazzino è diventato virale. Un brand ti offre di ricreare la scena, autoironia totale.",choices:[
    {txt:"😂 Ci sto — ridiamoci su",ef:{bank:18000,popularity:10,coachTrust:-3}},
    {txt:"🚫 Preferisco il basso profilo",ef:{coachTrust:2}},
  ]},
  {id:"wi_compagno_lite",cat:"tensione",txt:"Due compagni hanno litigato pesantemente nello spogliatoio. Sei l'unico che parla con entrambi.",choices:[
    {txt:"🕊 Faccio da paciere stasera",ef:{chem:10,coachTrust:6,fatigue:5}},
    {txt:"🙈 Non mi immischio",ef:{chem:-5}},
  ]},
  /* [7.435.0 evolutiva PO «anche il primo anno da calciatore ed il primo da professionista devono
     essere memorabili»] LE PIETRE MILIARI: sei impulsi per la PRIMA STAGIONE (S.1) e sei per il
     PRIMO ANNO DA PRO (proSeason). Una-tantum, privilegiati dal picker come l'addio (flag mile). */
  {id:"wi_es_busta",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"La prima busta paga vera della tua vita. Non è una cifra da copertina — ma è TUA, e l'hai guadagnata col pallone.",choices:[
    {txt:"📸 Foto alla busta, dritta in famiglia",ef:{morale:6}},
    {txt:"🏦 Da parte, testa bassa: è solo l'inizio",ef:{morale:3,form:2}},
  ]},
  {id:"wi_es_canzone",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"Rito d'iniziazione: l'esordiente canta in piedi sulla sedia davanti a tutta la squadra. Stasera tocca a te.",choices:[
    {txt:"🎤 Salgo e canto: playlist della nonna, senza vergogna",ef:{morale:7,chem:6}},
    {txt:"🙈 Stono apposta per farla finire prima",ef:{chem:3,morale:3}},
  ]},
  {id:"wi_es_autografo",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"Un bambino ti ferma fuori dal campo... e chiede l'autografo al compagno accanto a te. Poi ti squadra: «Vabbè, firmami pure tu».",choices:[
    {txt:"😂 Firmo con dedica: «Al mio primo tifoso per sbaglio»",ef:{morale:6,popularity:2}},
    {txt:"😤 Un giorno la fila la farà per me",ef:{form:2,morale:2}},
  ]},
  {id:"wi_es_bar",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"Il bar del paese ha incorniciato la tua prima convocazione: sta tra la squadra dell'82 e la foto del sindaco.",choices:[
    {txt:"🥹 Passo a firmare la cornice di persona",ef:{popularity:4,morale:5}},
    {txt:"☕ Caffè pagato per tutti, una volta sola",ef:{popularity:5,bank:-1500,morale:3}},
  ]},
  {id:"wi_es_prof",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"Chiama il tuo vecchio professore: «Il pallone va benissimo, ma il diploma? Ti tengo il posto».",choices:[
    {txt:"📚 Studio nei ritiri — promesso davvero",ef:{morale:4,fatigue:2}},
    {txt:"⚽ Il campo è la mia scuola adesso, prof",ef:{form:3,morale:2}},
  ]},
  {id:"wi_es_muretto",once:true,mile:true,cat:"esordio",cond:p=>(p.season||1)===1,txt:"I bimbi del muretto sotto casa ti chiedono il pallone dell'allenamento. Non uno qualsiasi: IL pallone.",choices:[
    {txt:"⚽ Glielo lascio: è cominciato tutto lì",ef:{morale:6,popularity:3}},
    {txt:"🛒 Ne porto uno NUOVO per tutti, domani",ef:{bank:-1000,popularity:5,morale:4}},
  ]},
  {id:"wi_pro_firma",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1),txt:"Il primo contratto da professionista: tre copie da firmare e la penna del club che non scrive. Firmi con quella del magazziniere.",choices:[
    {txt:"✒️ Gliela chiedo in regalo: va in cornice",ef:{morale:6}},
    {txt:"🧊 Conta la firma, non la penna",ef:{form:2,morale:3}},
  ]},
  {id:"wi_pro_armadietto",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1),txt:"Il tuo armadietto era di una bandiera del club. Dentro c'è ancora un suo biglietto: «A chi arriva dopo di me: portalo con onore».",choices:[
    {txt:"🥹 Resta attaccato lì per tutta la mia carriera",ef:{morale:7}},
    {txt:"🖼️ Lo faccio incorniciare per il museo del club",ef:{popularity:4,chem:3}},
  ]},
  {id:"wi_pro_procuratore",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1)&&!p.hasAgent,txt:"Fuori dal centro sportivo ti aspetta un procuratore con due biglietti da visita e tre promesse.",choices:[
    {txt:"🧊 Non ora: al primo anno parla il campo",ef:{coachTrust:4,morale:2}},
    {txt:"📇 Prendo il biglietto — mai dire mai",ef:{popularity:2}},
  ]},
  {id:"wi_pro_store",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1),txt:"Allo store del club è comparsa LA TUA maglia. Entri col cappuccio e ne compri una di nascosto, come un ladro.",choices:[
    {txt:"🛍️ Due: una per me e una per mamma",ef:{bank:-3000,morale:7}},
    {txt:"😎 Chiedo al commesso se vende: «benino», dice",ef:{popularity:3,morale:4}},
  ]},
  {id:"wi_pro_regola",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1),txt:"Il veterano ti si siede accanto in pullman: «Regola uno: quello che vedi qui resta qui. Regola due: i cornetti del giovedì li porti tu».",choices:[
    {txt:"🥐 Giovedì: cornetti per tutti, anche il mister",ef:{chem:7,morale:3,bank:-500}},
    {txt:"📓 Prendo appunti. Letteralmente.",ef:{morale:4,coachTrust:3}},
  ]},
  {id:"wi_pro_battesimo",once:true,mile:true,cat:"primopro",cond:p=>(p.proStatus||"u18")==="pro"&&p.proSeason===(p.season||1),txt:"Battesimo dello spogliatoio dei grandi: scarpe appese al soffitto e borsa nel congelatore. Ridono tutti — aspettano la tua reazione.",choices:[
    {txt:"😂 Rido più forte di loro: adesso sono dentro",ef:{chem:8,morale:5}},
    {txt:"🧊 Recupero tutto in silenzio. Domani mi vendico.",ef:{chem:4,form:2}},
  ]},
  /* [7.433.0 evolutiva PO «l'ultima stagione deve essere indimenticabile, con eventi divertenti,
     attestati di stima ecc»] GLI IMPULSI DELL'ADDIO: escono solo nella stagione annunciata
     (retireAnnounced), sono una-tantum e il picker li PRIVILEGIA — l'ultima stagione non puo'
     essere una stagione qualunque. */
  {id:"wi_addio_maglia_gk",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"Il portiere avversario ti ferma nel tunnel PRIMA della gara: «La maglia me la dai adesso, che al novantesimo ci sarà la fila».",choices:[
    {txt:"😄 Gliela prometto — e gli firmo anche i guanti",ef:{morale:5,popularity:4}},
    {txt:"🧊 Dopo la partita, come si è sempre fatto",ef:{form:2,morale:2}},
  ]},
  {id:"wi_addio_cambio",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"Il mister ti anticipa il piano: «Alla prossima in casa ti cambio all'85', così lo stadio ti saluta in piedi».",choices:[
    {txt:"👏 Accetto: quell'applauso vale una carriera",ef:{morale:8,coachTrust:4,fatigue:-3}},
    {txt:"⚔️ Voglio i novanta minuti: mi salutano al fischio finale",ef:{form:4,coachTrust:-2,morale:3}},
  ]},
  {id:"wi_addio_scarpini",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"Scopri che il magazziniere conserva di nascosto un paio di tuoi scarpini per ogni annata: «A fine stagione faccio la teca. Mi autorizzi?»",choices:[
    {txt:"🥹 Autorizzato — e la teca la firmiamo insieme",ef:{morale:6,chem:4}},
    {txt:"😅 Solo se ci mette anche quelli della papera col Rovigo",ef:{morale:5,popularity:3}},
  ]},
  {id:"wi_addio_docu",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"Una produzione vuole girare «L'ultima stagione»: telecamere ai raduni fino a maggio, montaggio finale al tuo addio.",choices:[
    {txt:"🎬 Che sia un bel finale",ef:{popularity:9,bank:40000,fatigue:4}},
    {txt:"🚪 L'ultima è mia: niente telecamere nello spogliatoio",ef:{morale:5,chem:3}},
  ]},
  {id:"wi_addio_capitani",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"I capitani della lega hanno registrato a sorpresa un video di saluti, uno per squadra. L'ultimo a parlare è il tuo rivale di sempre.",choices:[
    {txt:"🥂 Rispondo a tutti, uno per uno",ef:{morale:7,popularity:5}},
    {txt:"🤫 Lo riguardo da solo. Dieci volte.",ef:{morale:9}},
  ]},
  {id:"wi_addio_bimbi",once:true,addio:true,cat:"addio",cond:p=>p.retireAnnounced===(p.season||1),txt:"La scuola calcio del quartiere chiede «l'ultima lezione del maestro» prima che il maestro smetta.",choices:[
    {txt:"⚽ Un pomeriggio intero, palloni per tutti",ef:{morale:8,popularity:6,fatigue:3}},
    {txt:"📅 Dopo il ritiro avremo tutto il tempo — promesso",ef:{morale:2}},
  ]},
  {id:"wi_orologio",once:true,cat:"conseguenza",cond:p=>!p.isCaptain/* [7.161.0 M1] */,txt:"Il capitano ti prende in giro: sei l'unico senza «l'orologio della squadra». Costa quanto un mese del tuo ingaggio."/* [7.161.0 BASSA] via il riferimento allo «stipendio» settimanale (display solo annuale, 7.36.1) */,choices:[
    {txt:"⌚ Lo compro — rito di passaggio",ef:{bank:-30000,chem:7,morale:4}},
    {txt:"💸 Follia — passo",ef:{chem:-3,morale:1}},
  ]},
  {id:"wi_amichevole",cat:"opportunità",cond:p=>!(p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played),txt:"Il tuo agente segnala un'amichevole internazionale extra. Alzerei la visibilità, ma è un viaggio impegnativo.",choices:[
    {txt:"✅ Ci vado — voglio farmi vedere",ef:{popularity:12,fatigue:14,form:3}},
    {txt:"❌ Rimango a riposare",ef:{fatigue:-10,morale:5}},
  ]},
  {id:"wi_media",cat:"opportunità",txt:"Un canale sportivo ti vuole per una rubrica settimanale. Non è il campo, ma è immagine.",choices:[
    {txt:"📺 Accetto — è riconoscimento",ef:{popularity:14,value:0.08,fatigue:5}},
    {txt:"⚽ No, preferisco allenarmi",ef:{form:4,coachTrust:3}},
  ]},
  {id:"wi_ciclo_forza",cat:"scelta",txt:"Il preparatore atletico propone un ciclo extra di forza. Duro ma efficace.",choices:[
    {txt:"💪 Ciclo completo — massimo impegno",ef:{fatigue:15,form:7}},
    {txt:"🧘 Solo sessione leggera",ef:{fatigue:4,form:2,morale:3}},
  ]},
  {id:"wi_riposo",cat:"scelta",cond:p=>!(p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played),txt:"Settimana libera. Puoi allenarti in autonomia o staccare completamente.",choices:[
    {txt:"🏋️ Mi alleno da solo — non mi fermo mai",ef:{form:6,fatigue:8,coachTrust:3}},
    {txt:"🌴 Mi riposo davvero",ef:{fatigue:-18,morale:10}},
  ]},
  {id:"wi_tensione_spo",cat:"tensione",cond:p=>{const l=(p.matchHistory||[]).slice(-1)[0];return !!l&&!l.won;},txt:"C'è tensione nello spogliatoio dopo una brutta settimana. Due compagni hanno litigato. Cosa fai?",choices:[
    {txt:"🤝 Mediate tra i due",ef:{coachTrust:8,morale:5,popularity:5}},
    {txt:"😶 Non ti impicci",ef:{morale:-3}},
    {txt:"🗣️ Segnali la cosa al mister",ef:{coachTrust:6,morale:-4}},
  ]},
  {id:"wi_fan_aggression",cat:"tensione",cond:p=>{const l=(p.matchHistory||[]).slice(-1)[0];return !!l&&(!l.won&&((l.rating||6.5)<6.4));},txt:"Un tifoso ti ferma per strada e ti insulta per la prestazione dell'ultimo match.",choices:[
    {txt:"😤 Rispondi a tono",ef:{morale:5,popularity:-8}},
    {txt:"🙏 «Scusi, farò meglio»",ef:{popularity:6,morale:-3}},
    {txt:"🚶 Vai avanti senza rispondere",ef:{morale:2}},
  ]},
  {id:"wi_procuratore",cat:"conseguenza",cond:p=>!!p.hasAgent&&!p.transferListed/* [7.161.0 M1] · [7.430.0 collaudo PO «e' compatibile con la nuova funzionalita' del procuratore o e' un refuso sganciato?»] ERA SGANCIATO: prometteva un club interessato e la scelta non produceva alcun fatto. Ora esce solo se il mercato NON si sta gia' muovendo (transferListed) e «voglio muovermi ora» METTE IN LISTA davvero — lo stesso flag che il mercato legge (4142) e che alza le offerte vere */,txt:"Il tuo procuratore ti dice che c'è un club interessato, ma serve pazienza.",choices:[
    {txt:"⏳ Aspettiamo — la pazienza paga",ef:{morale:4}},
    {txt:"📢 No, voglio muovermi ora — mettimi in lista",ef:{popularity:4,coachTrust:-5,morale:-4,transferListed:true}},
  ]},
  {id:"wi_giovane",cat:"opportunità",cond:p=>(p.proStatus||"u18")==="pro"/* [7.161.0 M1] */,txt:"Un giocatore della primavera ti chiede di allenarsi con te. Accetti?",choices:[
    {txt:"✅ Certo — è bello trasmettere",ef:{morale:8,coachTrust:5,popularity:4}},
    {txt:"❌ Non ho tempo per questo",ef:{morale:-2}},
  ]},
  {id:"wi_intervista_sorpresa",cat:"scelta",txt:"Un giornalista famoso vuole un'intervista esclusiva. Argomenti sensibili inclusi.",choices:[
    {txt:"🔥 Dico tutto — la verità libera",ef:{popularity:14,coachTrust:-6,morale:5}},
    {txt:"🤝 Rispondo con diplomazia",ef:{popularity:6,coachTrust:3}},
    {txt:"❌ Declino",ef:{popularity:-3,morale:3}},
  ]},
  {id:"wi_social",cat:"conseguenza",txt:"Un tuo post viene frainteso dai media. Come gestisci?",choices:[
    {txt:"🗑️ Cancello e mi scuso",ef:{popularity:-4,morale:-3}},
    {txt:"😏 Lascio stare — era ironico",ef:{popularity:6,coachTrust:-4}},
    {txt:"📝 Chiarisco con un comunicato",ef:{popularity:2,morale:4}},
  ]},
  {id:"wi_viaggio",cat:"scelta",cond:p=>(p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played&&m.isHome===false),txt:"Partenza anticipata per la trasferta. Hai ore libere in albergo.",choices:[
    {txt:"🎮 Ti rilassi con i compagni",ef:{morale:9,fatigue:-6}},
    {txt:"📊 Studi il video dell'avversario",ef:{form:5,coachTrust:4}},
    {txt:"🏃 Fai un allenamento extra in palestra",ef:{form:4,fatigue:6}},
  ]},
  {id:"wi_sogno",cat:"conseguenza",txt:"Stanotte hai sognato di segnare il gol decisivo in una finale. Ti svegli carico.",choices:[
    {txt:"🔥 Cavalco l'onda — oggi è un gran giorno",ef:{morale:10,form:5}},
    {txt:"😐 Era solo un sogno. Al lavoro.",ef:{form:2,fatigue:-4}},
  ]},
  {id:"wi_ex_club",cat:"tensione",txt:"Un tuo ex compagno ti scrive: «Ti mancano i vecchi tempi?»",choices:[
    {txt:"❤️ «Sì, ma sono felice qui»",ef:{morale:8}},
    {txt:"😐 «È il calcio. Si va avanti»",ef:{morale:3}},
    {txt:"😔 «Onestamente, un po' sì»",ef:{morale:-4,popularity:3}},
  ]},
  {id:"wi_staff",cat:"opportunità",txt:"Il preparatore atletico ti propone un nuovo metodo di recupero post-allenamento.",choices:[
    {txt:"🧪 Lo provo — sono curioso",ef:{fatigue:-14,form:4}},
    {txt:"😐 Resto al metodo classico",ef:{fatigue:-6}},
  ]},
  {id:"wi_capitano_sfida",cat:"scelta",cond:p=>!p.isCaptain/* [7.161.0 M1] col 7.5.0 il vecchio capitano cede la fascia: se sei TU, il «capitano» citato non esiste */,txt:"Il capitano organizza una sfida ai tiri in porta. Tutti guardano.",choices:[
    {txt:"🎯 Accetto — e do il massimo",ef:{form:6,popularity:7,coachTrust:3}},
    {txt:"🚶 Non mi interessa",ef:{form:1,morale:-3}},
  ]},
  {id:"wi_insonnia",cat:"tensione",cond:p=>(p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played),txt:"Non riesci a dormire. La partita di sabato ti pesa.",choices:[
    {txt:"📱 Guardi video motivazionali fino all'alba",ef:{morale:6,fatigue:10}},
    {txt:"🧘 Rispiri, lasci andare, dormi",ef:{morale:4,fatigue:-5,form:3}},
  ]},
  {id:"wi_tifosi",cond:_notoOk453/* [7.453.0] prima ti devono riconoscere */,cat:"opportunità",txt:"Un gruppo di tifosi ti aspetta fuori dal centro sportivo per foto e autografi.",choices:[
    {txt:"📸 Mi fermo 20 minuti con loro",ef:{popularity:12,morale:7,fatigue:4}},
    {txt:"🚗 Sorrido e saluto di corsa",ef:{popularity:4,morale:3}},
  ]},
  {id:"wi_sponsor",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"opportunità",txt:"Un marchio sportivo propone un contratto di endorsement minore. Un segnale di visibilità.",choices:[
    {txt:"✅ Firmo — è riconoscimento",ef:{popularity:9,value:0.05,morale:5}},
    {txt:"⏳ Aspetto qualcosa di più grande",ef:{morale:2}},
  ]},
  {id:"wi_polemica",cat:"tensione",cond:_criticaOk,/* [7.35.2 collaudo PO «dopo una vittoria con l'Inter è fuori luogo!»] solo dopo una PRESTAZIONE davvero brutta · [7.472.0] il criterio e' ora UNO SOLO e vale per tutta la famiglia (vedi _criticaOk) */txt:"I media ti criticano aspramente dopo una brutta prestazione. Il club non difende nessuno.",choices:[
    {txt:"💪 La prendo come motivazione",ef:{morale:5,form:4}},
    {txt:"😤 Mi incazzo — e si vede",ef:{morale:-4,popularity:-6,coachTrust:-3}},
    {txt:"😶 Silenzio stampa totale",ef:{popularity:-3,morale:2}},
  ]},
  {id:"wi_ct_radar",cat:"opportunità",cond:p=>(p.nationalCaps||0)>0||(p.ovr||70)>=76,txt:"Il commissario tecnico della tua nazionale ti osserva in allenamento. Sai che guarda.",choices:[
    {txt:"🔥 Mi supero — voglio essere visto",ef:{form:8,coachTrust:4,fatigue:6}},
    {txt:"😐 Mi alleno normalmente",ef:{form:2}},
  ]},
  {id:"wi_giornalista_mercato",cat:"tensione",cond:p=>{if(!_mktOk(p))return false;const w=p.week||1;return(w<=5||(w>=19&&w<=23))||!!p.transferSaga||!!p.transferListed;},txt:"Un giornalista ti chiede in conferenza se vuoi essere ceduto. Le telecamere sono puntate su di te.",choices:[
    {txt:"🤐 Resto focalizzato sulla squadra",ef:{coachTrust:6,popularity:3,morale:2}},
    {txt:"📢 Ammetto che ci sto pensando",ef:{coachTrust:-8,popularity:7,morale:-4}},
    {txt:"😏 Dico che decido a fine stagione",ef:{coachTrust:-2,popularity:4}},
  ]},
  {id:"wi_vice_infortunato",cat:"leadership",cond:p=>{/* [7.161.0 M1] «guida il gruppo» non si chiede a una riserva sfiduciata o a un 17enne · [7.470.0 collaudo PO «prematuro»] NE' A CHI E' APPENA ARRIVATO. La guardia guardava solo la FIDUCIA DEL MISTER, che a un nuovo acquisto parte gia' a 60-70: bastava essere professionista per farsi chiedere di guidare il gruppo alla SECONDA settimana in un club nuovo — lo screenshot del PO e' S.3 W.2. Guidare un gruppo e' una questione di ANZIANITA', e il dato c'e' gia': le stagioni con questo club nella `history` (la stessa misura con cui si diventa «bandiera», r.~29106). Ora serve almeno una stagione piena qui E aver passato le prime settimane — a meno di essere il CAPITANO, che il grado ce l'ha per definizione. */
    if((p.proStatus||"u18")!=="pro")return false;
    if(!((p.coachTrust||60)>=60||p.isCaptain))return false;
    if(p.isCaptain)return true;
    const _cid=p.club&&p.club.id;
    const _st=(p.history||[]).filter(h=>h&&h.clubId===_cid).length;
    return _st>=1&&(p.week||1)>=6;},txt:"Il vice-capitano si fa male. Il mister ti chiede di guidare il gruppo in questo momento difficile.",choices:[
    {txt:"💪 Prendo le responsabilità — sono pronto",ef:{coachTrust:10,morale:6,fatigue:5,form:4}},
    {txt:"😐 Faccio il mio — nient'altro",ef:{coachTrust:2,morale:2}},
  ]},
  {id:"wi_prestito_inverno",cat:"opportunità",cond:p=>{/* [7.31.1 collaudo PO «l'opportunità non ha senso!»] il prestito in categoria inferiore ha senso SOLO per un giovane che NON gioca: mai per un titolare affermato (usciva a un 77 OVR da 117 gol in carriera) */const r=(typeof calcSquadRole==="function")?calcSquadRole(p):(p.squadRole||"rotazione");return(r==="riserva"||r==="primavera")&&(p.age||24)<=25&&(p.matches||0)<Math.max(3,Math.floor((p.week||1)/3));},txt:"Un club di una categoria inferiore ti vuole in prestito per giocare con continuità. Il club lascia a te la scelta.",choices:[
    {txt:"✅ Vado — ho bisogno di giocare",ef:{form:8,morale:9,coachTrust:-5,value:0.06}},
    {txt:"❌ Resto e mi batto qui",ef:{coachTrust:5,morale:4,fatigue:5}},
  ]},
  {id:"wi_nazionale_b",cat:"opportunità",cond:p=>(p.age||24)<=23&&(p.nationalCaps||0)===0&&((p.totalMatches||p.matches||0)>=10)/* [7.161.0 M1] mai «Under B» a chi gioca già in Nazionale maggiore · [7.453.0 collaudo PO «troppo presto!», screenshot S.1 W.5 in Primavera 2] la condizione guardava l'eta' e i gettoni in Nazionale, mai se il ragazzo AVESSE GIOCATO: un diciassettenne alla quinta settimana di sempre, con quattro presenze, le soddisfaceva entrambe il primo giorno. Una convocazione viene DOPO delle partite */,txt:"Sei convocato per un raduno della nazionale Under B. Opportunità di farti vedere a livello internazionale.",choices:[
    {txt:"🌍 Vado — mi metto in mostra",ef:{popularity:12,form:6,morale:10,fatigue:8}},
    {txt:"🏠 Resto con il club — è un momento delicato",ef:{coachTrust:8,morale:3,form:3}},
  ]},
  // Sprint 61 — nuovi impulsi
  {id:"wi_podcast",cat:"personale",txt:"Un podcaster sportivo di successo ti invita per un'intervista. Potresti aprire tanti nuovi fan.",choices:[
    {txt:"🎙️ Accetto — voglio raccontarmi",ef:{popularity:14,morale:7,value:0.08}},
    {txt:"😶 Sono riservato — preferisco il campo",ef:{morale:4,coachTrust:3}},
  ]},
  {id:"wi_donazione",cat:"personale",txt:"Un'associazione benefica ti chiede di partecipare a una partita di solidarietà. Visibilità vs riposo.",choices:[
    {txt:"💖 Lo faccio — sport e solidarietà",ef:{popularity:10,morale:9,fatigue:7}},
    {txt:"🏃 Passo — ho bisogno di recuperare",ef:{fatigue:-8,morale:3}},
  ]},
  {id:"wi_fan_speciale",cat:"personale",txt:"Un bambino con la tua maglia ti aspetta fuori dallo stadio: «Sei la mia ispirazione.» Ti fermi?",choices:[
    {txt:"💛 Mi fermo, parlo con lui, selfie e firma",ef:{morale:14,popularity:8,value:0.03}},
    {txt:"😔 Sono di fretta — un sorriso e via",ef:{morale:3}},
  ]},
  {id:"wi_analisi_video",cat:"formazione",txt:"Il preparatore atletico ti propone due ore extra di analisi video sui tuoi movimenti. Noioso ma utile.",choices:[
    {txt:"📽️ Lo faccio — ogni dettaglio conta",ef:{form:6,fatigue:6,mentalità:1,posizionamento:1}},
    {txt:"😪 Ho già troppe cose in testa",ef:{morale:4,fatigue:-5}},
  ]},
  {id:"wi_crioterapia",cat:"formazione",txt:"Il preparatore consiglia la crioterapia post-allenamento. «Ti farà bene ma è un inferno.»",choices:[
    {txt:"🧊 Ci provo — tutto per la forma",ef:{fatigue:-16,form:6,morale:3}},
    {txt:"🚿 Preferisco la doccia calda normale",ef:{fatigue:-7,morale:5}},
  ]},
  {id:"wi_veterano_allenamento",cond:p=>(p.proStatus||"u18")==="pro"/* [7.453.0] in Primavera il ragazzo da allenare sei TU */,cat:"formazione",txt:"Un veterano della squadra si offre di allenarti in privato. È un'opportunità rara.",choices:[
    {txt:"💪 Accetto subito — esperienza preziosa",ef:{form:7,coachTrust:5,morale:7,fatigue:6}},
    {txt:"😐 Ho già il mio programma",ef:{morale:2}},
  ]},
  {id:"wi_cena_capitano",cat:"sociale",cond:p=>!p.isCaptain/* [7.161.0 M1] */,txt:"Il capitano organizza una cena di squadra per rafforzare l'unità del gruppo. Partecipi?",choices:[
    {txt:"🍽️ Ci sono — la squadra prima di tutto",ef:{morale:9,coachTrust:5,fatigue:4}},
    {txt:"🏠 Resto a casa — ho bisogno di riposare",ef:{fatigue:-8,morale:3}},
  ]},
  {id:"wi_giovani_accademia",cat:"sociale",txt:"Il club ti chiede di visitare la scuola calcio e ispirare i giovani. Saranno emozionatissimi.",choices:[
    {txt:"👶 Vado — è un gesto che vale",ef:{popularity:9,morale:11,value:0.05}},
    {txt:"😐 Non è il momento giusto per me",ef:{morale:2}},
  ]},
  {id:"wi_campo_bagnato",cat:"scelta",txt:"Il campo è fradicio di pioggia. Al coperto (tecnica) o in campo aperto (fisico)?",choices:[
    {txt:"⛈️ All'aperto — il vero campo si gioca in tutte le condizioni",ef:{fisico:1,fatigue:13,form:5}},
    {txt:"🏋️ Al coperto — tecnica e tattica senza rischi",ef:{tecnica:1,fatigue:7,form:3}},
  ]},
  {id:"wi_sponsor_auto",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"opportunità",txt:"Una casa automobilistica ti offre un accordo sponsorship. Macchina in cambio di 3 post social.",choices:[
    {txt:"🚗 Firmo — è un bel riconoscimento",ef:{popularity:8,value:0.08,morale:7}},
    {txt:"🤝 Passo — voglio restare autentico",ef:{morale:5,coachTrust:3}},
  ]},
  {id:"wi_derby_semana",cat:"tensione",cond:p=>{const md=(p.calendar||[]).find(m=>m.week===(p.week||1)&&!m.played);return !!(md&&typeof isDerby==="function"&&isDerby(p.club?.id,md.opponentId));},/* [7.8.5] SOLO se la gara della settimana è un derby REALE */txt:"È la settimana del {DERBY} contro {RIVAL}. L'ambiente è elettrico e i tifosi ti fermano ovunque. Come gestisci?",choices:[
    {txt:"🔥 Mi carico — per questi momenti esisto",ef:{form:8,morale:9,fatigue:5}},
    {txt:"🎯 Resto concentrato e in silenzio",ef:{mentalità:1,form:4,fatigue:-3}},
    {txt:"😰 Ammetto di essere un po' teso",ef:{mentalità:1,coachTrust:4,morale:-4}},
  ]},
  {id:"wi_figlia_mister",cat:"personale",txt:"La figlia del mister ti ferma dopo l'allenamento: «Papà parla sempre di te. Sei il suo preferito.»",choices:[
    {txt:"😊 «È un onore. Gli sarò sempre grato.»",ef:{coachTrust:9,morale:8}},
    {txt:"😅 Ridi imbarazzato e cambi argomento",ef:{morale:4}},
  ]},
  // [7.106.0 collaudo PO «gli impulsi settimanali sono ripetitivi, aumenta i dialoghi: tutti ragionati, realistici,
  //   con conseguenze positive o negative»] +28 dilemmi nuovi con trade-off reali (bank/morale/fatica/fiducia/
  //   popolarità/chimica/forma/valore), varietà di temi mercato/immagine/vita/spogliatoio/campo. Ognuno ha l'opzione
  //   prudente a costo ~zero → il player non è mai forzato a spendere. Anti-ripetizione allargata (recentImpulses -40).
  {id:"wi_auto_lusso",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"scelta",txt:"Un concessionario ti presta un'auto di lusso per un mese in cambio di qualche post social.",choices:[
    {txt:"🚗 Accetto — che spettacolo",ef:{popularity:6,morale:4,coachTrust:-3}},
    {txt:"🚙 Tengo la mia, niente distrazioni",ef:{coachTrust:4,morale:-1}},
  ]},
  {id:"wi_polemica_social",cat:"tensione",txt:"Un tifoso avversario ti insulta online e diventa virale. I tuoi fan aspettano una tua reazione.",choices:[
    {txt:"🔥 Rispondo per le rime",ef:{popularity:5,morale:-3,coachTrust:-4}},
    {txt:"🤐 Ignoro, parlerò in campo",ef:{coachTrust:4,morale:2}},
  ]},
  {id:"wi_scuola_calcio",cat:"opportunità",cond:p=>(p.popularity||20)>=42,txt:"Ti propongono di aprire una scuola calcio col tuo nome: investimento e un po' del tuo tempo.",choices:[
    {txt:"⚽ Ci metto faccia e soldi",ef:{bank:-30000,popularity:9,morale:6}},
    {txt:"🤝 Presto solo il nome",ef:{popularity:3,bank:6000}},
  ]},
  {id:"wi_giornata_libera",cat:"scelta",txt:"Il mister concede un giorno libero: mare coi compagni o palestra da solo per limare i dettagli?",choices:[
    {txt:"🏖 Mare col gruppo",ef:{chem:7,morale:6,fatigue:3}},
    {txt:"🏋️ Palestra e focus",ef:{form:5,fatigue:5,chem:-2}},
  ]},
  {id:"wi_videogioco",cat:"opportunità",cond:p=>(p.popularity||20)>=55/* [7.161.0 M1] */,txt:"Una software house vuole il tuo volto in un videogioco di calcio.",choices:[
    {txt:"🎮 Firmo — sarò un personaggio",ef:{bank:25000,popularity:8}},
    {txt:"🕹 Chiedo troppo, salta tutto",ef:{morale:-2}},
  ]},
  {id:"wi_genitori_tribuna",cat:"personale",txt:"I tuoi genitori vogliono venire a vederti giocare da lontano: viaggio e hotel a carico tuo.",choices:[
    {txt:"✈️ Li porto in tribuna d'onore",ef:{bank:-6000,morale:9}},
    {txt:"📞 Li sento al telefono, ora no",ef:{morale:2,fatigue:-2}},
  ]},
  {id:"wi_infortunato_posto",cat:"tensione",cond:p=>(p.coachTrust||60)>=60/* [7.472.0] si chiede una parola a chi UNA PAROLA CE L'HA: se il mister non ti ascolta, questa richiesta non arriverebbe mai a te */,txt:"Un compagno sta rientrando da un infortunio e teme di non ritrovare il posto. Ti chiede di spendere una parola per lui col mister.",choices:[
    {txt:"🤝 Parlo col mister: se lo merita",ef:{chem:6,coachTrust:-2}},
    {txt:"😤 Il posto se lo riprende in campo",ef:{coachTrust:4,chem:-5}},
  ]},/* [7.472.0 collaudo PO «strana richiesta»] LA PREMESSA ERA STRANA, NON IL MOMENTO. Un compagno che
     chiede al protagonista di «non brillare troppo in allenamento» non e' una dinamica di spogliatoio:
     e' una richiesta che nessun professionista fa e che nessuno accetterebbe, e infatti la nota del PO
     non dice «fuori luogo» (il difetto di contesto che abbiamo chiuso altrove) ma «strana». Qui non
     serviva una guardia, serviva riscrivere: chi rientra da un infortunio teme di non ritrovare il
     posto e chiede a chi conta di spendere una parola col tecnico — questa succede davvero, e le due
     scelte restano le stesse due facce (il gruppo o la gerarchia). La `cond` e' solo il minimo perche'
     la richiesta abbia senso: la si rivolge a chi il mister ascolta. */
  {id:"wi_tv_primaserata",cat:"opportunità",cond:p=>(p.popularity||20)>=45,txt:"Una TV nazionale ti vuole in prima serata. Grande vetrina, ma è la sera prima della gara.",choices:[
    {txt:"📺 Ci vado — occasione unica",ef:{popularity:9,fatigue:4,form:-2}},
    {txt:"🛌 Prima la partita, sempre",ef:{coachTrust:4,popularity:-2}},
  ]},
  {id:"wi_cripto",cat:"conseguenza",txt:"Un amico ti spinge su una criptovaluta «che esploderà». Rischio alto, tutto o niente.",choices:[
    {txt:"🚀 Ci punto una fetta",ef:{bank:-20000,morale:2},flag:"investment",note:"esito incerto a fine stagione"},
    {txt:"🧊 Non è roba per me",ef:{morale:1}},
  ]},
  {id:"wi_bimbo_sogno",cat:"scelta",txt:"Il papà di un bimbo malato ti scrive: il sogno del figlio è conoscerti.",choices:[
    {txt:"💙 Lo invito all'allenamento",ef:{morale:9,popularity:5,fatigue:2}},
    {txt:"🎁 Gli mando maglia e videomessaggio",ef:{morale:4,bank:-2000}},
  ]},
  {id:"wi_mental_coach",cat:"scelta",txt:"Un mental coach propone due giorni di lavoro sulla concentrazione.",choices:[
    {txt:"🧘 Ci provo — testa libera",ef:{morale:6,form:3,fatigue:-3}},
    {txt:"⚽ Preferisco il campo",ef:{form:2}},
  ]},
  {id:"wi_orologi_squadra",cat:"scelta",txt:"Vuoi cementare il gruppo regalando un orologio a ogni compagno. Costa parecchio.",choices:[
    {txt:"⌚ Li prendo per tutti",ef:{bank:-22000,chem:10,morale:3}},
    {txt:"🍻 Basta una cena insieme",ef:{bank:-4000,chem:4}},
  ]},
  {id:"wi_opinionista",cat:"tensione",cond:p=>!!p.hasAgent&&_criticaOk(p)/* [7.161.0 M1] «il tuo agente» solo se ce l'hai · [7.472.0 collaudo PO «dopo una vittoria con gol e' strano»] e un opinionista non ti stronca in diretta dopo che hai vinto segnando: stesso criterio del gemello wi_polemica */,txt:"Un opinionista TV ti critica pesantemente in diretta. Il tuo agente vuole rispondere.",choices:[
    {txt:"🔥 Rispondo in conferenza",ef:{popularity:3,coachTrust:-4,morale:-2}},
    {txt:"💪 Uso la rabbia in campo",ef:{form:4,morale:3}},
  ]},
  {id:"wi_bonus_gol_social",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"opportunità",txt:"Uno sponsor mette un bonus per ogni tuo gol del mese, ma vuole il logo sui tuoi social.",choices:[
    {txt:"💸 Ci sto",ef:{bank:8000,popularity:4,coachTrust:-2}},
    {txt:"🚫 Niente vetrine sui social",ef:{coachTrust:3}},
  ]},
  {id:"wi_casa_citta",cond:p=>_brandOk453(p)&&((p.bank||0)+(p.bankBalance||0))>=250000/* [7.453.0] non si compra casa/un ristorante senza averci i soldi */,cat:"conseguenza",txt:"Puoi comprare casa in città: ti radichi alla piazza, ma immobilizzi liquidità.",choices:[
    {txt:"🏠 Compro — è casa mia",ef:{bank:-45000,morale:6,popularity:4}},
    {txt:"🔑 Resto in affitto, più libero",ef:{morale:1}},
  ]},
  {id:"wi_primo_mister",cat:"personale",txt:"Il tuo primo allenatore, oggi in difficoltà, ti chiede una mano per un provino ai suoi ragazzi.",choices:[
    {txt:"🎓 Ci vado di persona",ef:{morale:7,fatigue:4,chem:2}},
    {txt:"💌 Mando due parole di stima",ef:{morale:2}},
  ]},
  {id:"wi_tifoso_fisso",cat:"tensione",txt:"Un tifoso ti aspetta ogni giorno fuori dal centro sportivo: gentile ma insistente.",choices:[
    {txt:"🤝 Gli dedico cinque minuti",ef:{popularity:5,morale:2,fatigue:1}},
    {txt:"🚗 Passo dritto, ho fretta",ef:{morale:-1,popularity:-2}},
  ]},
  {id:"wi_esports",cat:"opportunità",cond:p=>(p.popularity||20)>=50/* [7.161.0 M1] */,txt:"Ti offrono di essere il volto di una squadra esports.",choices:[
    {txt:"🎮 Divento ambassador",ef:{bank:18000,popularity:7}},
    {txt:"🧢 Non fa per me",ef:{morale:1}},
  ]},
  {id:"wi_compagno_prestito",cat:"tensione",txt:"Un compagno in difficoltà economica ti chiede in confidenza un prestito personale.",choices:[
    {txt:"🤝 Lo aiuto, senza dirlo a nessuno",ef:{bank:-15000,chem:9,morale:4}},
    {txt:"💬 Gli trovo un consulente serio",ef:{chem:3}},
  ]},
  {id:"wi_pioggia_scelta",cat:"scelta",txt:"Diluvia. Il mister lascia scegliere: campo fangoso o palestra al coperto?",choices:[
    {txt:"🌧 Esco a lavorare duro",ef:{form:5,fatigue:6,coachTrust:4}},
    {txt:"🏋️ Palestra, niente rischi",ef:{fatigue:2,form:2}},
  ]},
  {id:"wi_scommessa_amici",cat:"tensione",txt:"Degli amici ti coinvolgono in una scommessa «innocente» sul campionato. Ma per te è vietata.",choices:[
    {txt:"🚫 Rifiuto netto — è la regola",ef:{morale:3,coachTrust:3}},
    {txt:"🤫 Solo una piccola, che sarà mai…",ef:{morale:-4,coachTrust:-8,popularity:-3}},
  ]},
  {id:"wi_maglia_dieci",cat:"scelta",cond:p=>(p.ovr||60)>=72,txt:"Si libera la maglia numero 10: prenderla è un onore, ma anche una pressione enorme.",choices:[
    {txt:"🔟 La prendo — me la merito",ef:{morale:6,popularity:5,form:-1}},
    {txt:"🙅 Tengo il mio numero",ef:{morale:2}},
  ]},
  {id:"wi_sosta_nazionali",cat:"scelta",cond:p=>!((p.calendar||[]).some(m=>m&&m.week===(p.week||1)&&!m.played)),txt:"Sosta per le nazionali: puoi staccare la spina o allenarti extra col preparatore.",choices:[
    {txt:"😴 Stacco e ricarico",ef:{fatigue:-10,form:-1}},
    {txt:"🏃 Lavoro sui dettagli",ef:{form:5,fatigue:4}},
  ]},
  {id:"wi_ristorante_socio",cond:p=>_brandOk453(p)&&((p.bank||0)+(p.bankBalance||0))>=120000/* [7.453.0] non si compra casa/un ristorante senza averci i soldi */,cat:"conseguenza",txt:"Ti propongono di entrare come socio in un ristorante di lusso in centro.",choices:[
    {txt:"🍽 Investo e ci metto la faccia",ef:{bank:-28000,popularity:6},flag:"investment",note:"rendita se l'attività gira"},
    {txt:"🤔 Troppo rischio adesso",ef:{morale:1}},
  ]},
  {id:"wi_dirigente_idolo",cat:"conseguenza",txt:"Un tuo vecchio idolo, oggi dirigente di un altro club, ti chiama: «C'è un progetto per te».",choices:[
    {txt:"👂 Ascolto la proposta",ef:{value:0.2,coachTrust:-4,morale:3}},
    {txt:"🔒 Sono concentrato qui",ef:{coachTrust:5}},
  ]},
  {id:"wi_compleanno_tifosi",cat:"scelta",cond:p=>(p.popularity||20)>=40,txt:"È il tuo compleanno: i tifosi organizzano una festa a sorpresa fuori dallo stadio.",choices:[
    {txt:"🎂 Esco a salutarli tutti",ef:{popularity:7,morale:6,fatigue:3}},
    {txt:"🏠 Festeggio in famiglia",ef:{morale:5,fatigue:-3}},
  ]},
  {id:"wi_dieta_brand",cond:_brandOk453/* [7.453.0] un brand non insegue un ragazzo della Primavera */,cat:"scelta",txt:"Un brand alimentare ti paga per seguire e mostrare i loro pasti per una settimana.",choices:[
    {txt:"🥦 Accetto e mi adatto",ef:{bank:12000,form:-2,morale:-2}},
    {txt:"🍖 Non cambio alimentazione ora",ef:{form:2}},
  ]},
  {id:"wi_massaggiatore_addio",cat:"scelta",txt:"Il vecchio massaggiatore va in pensione. Puoi organizzargli una festa d'addio a tue spese.",choices:[
    {txt:"🎉 Organizzo tutto io",ef:{bank:-8000,chem:8,morale:5}},
    {txt:"👏 Un applauso in spogliatoio",ef:{chem:2}},
  ]},
];

/* ========================================
   SPRINT 24 — C: LA STAMPA TI RICORDA (GIORNALISTI)
======================================== */
const JOURNALIST_POOL=[
  {id:"j_ferretti",name:"Marco Ferretti",paper:"Sprint Sportivo",icon:"📰",color:"#ef4444",type:"critico",desc:"Analitico e spietato. Ti esalta quando meriti, ti demolisce quando sbagli."},
  {id:"j_esposito",name:"Sofia Esposito",f:true,paper:"Diretta TV",icon:"📺",color:"#3b82f6",type:"fan",desc:"Appassionata. Ha già deciso che sei speciale — ma non tollera tradimenti."},
  {id:"j_neri",name:"Giovanni Neri",paper:"Cronaca di Sport",icon:"🔍",color:"#7c3aed",type:"investigativa",desc:"Caccia gli scoop. Tratta ogni risposta come un indizio."},
  {id:"j_lombardi",name:"Anna Lombardi",f:true,paper:"Zona Mista",icon:"🎙️",color:"#f59e0b",type:"fan",desc:"Ti segue dalla U18. Ha una vera stima nei tuoi confronti."},
  {id:"j_ricci",name:"Davide Ricci",paper:"Cifre del Calcio",icon:"📊",color:"#10b981",type:"critico",desc:"Statistiche e fredda razionalità. Non mente mai — e non è sempre bello."},
  {id:"j_greco",name:"Elena Greco",f:true,paper:"Sport in Rete",icon:"🌐",color:"#8b5cf6",type:"investigativa",desc:"Interesse politico e sportivo si mescolano. Attenzione a cosa riveli."},
];

/* ========================================
   SPRINT 62 — NOTIZIE DELLA LEGA
======================================== */
const LEAGUE_NEWS_TEMPLATES=[
  {e:"🤕",t:"Infortunio a $C: stop di due settimane per il loro attaccante"},
  {e:"💪",t:"$C recupera il capitano in extremis: torna titolare sabato"},
  {e:"📢",t:"Mercato in fermento: $C vicino a chiudere un colpo a sorpresa"},
  {e:"🔄",t:"$C cede un titolare all'estero: affare da 8 milioni"},
  {e:"🔥",t:"$C in striscia positiva: tre vittorie consecutive, nessuno li ferma",w:5},
  {e:"📉",t:"Crisi profonda a $C: solo 2 punti nelle ultime cinque giornate",w:7},
  {e:"⚽",t:"Goleada storica: $C travolge l'avversario per 5-0"},
  {e:"🟥",t:"Squalifica pesante per il difensore di $C: salterà tre gare"},
  {e:"🏟️",t:"Record di abbonati: $C registra il sold-out per l'intero girone di ritorno",w:18},
  {e:"📣",t:"I tifosi di $C protestano davanti alla sede: tensioni con la dirigenza"},
  {e:"👔",t:"$C cambia modulo: il tecnico sperimenta la difesa a tre"},
  {e:"🌟",t:"Il giovane talento di $C convocato per la prima volta in nazionale"},
  {e:"🏆",t:"Lotta al titolo: $C a soli due punti dalla vetta dopo la vittoria di ieri",w:8},
  {e:"⚠️",t:"$C scivolato in zona retrocessione: la dirigenza chiede una reazione immediata"},
  {e:"🎯",t:"Il bomber di $C raggiunge quota 10 reti: già superato il totale dello scorso anno",w:16},
  {e:"📰",t:"La stampa esalta $C: «Miglior collettivo della giornata di campionato»"},
  {e:"🔁",t:"Trattativa sorprendente: $C e $C2 valutano uno scambio di prestiti"},
  {e:"📊",t:"$C è la difesa meno battuta del campionato con soli 8 gol subiti",w:10},
  {e:"🧤",t:"$C rinnova il portiere per altre tre stagioni: «È il pilastro del nostro futuro»"},/* [7.208.0] via l'anno di calendario: il gioco conta stagioni, non anni (questo pool è oggi inutilizzato — vedi generateLeagueNews — ma la copia resta corretta se venisse riattivata) */
  {e:"😤",t:"Polemiche arbitrali dopo $C: il tecnico espulso, 2 turni di stop"},
  {e:"🌧️",t:"Rinviata la partita di $C per maltempo: recupero in infrasettimanale"},
  {e:"🎉",t:"Centenario del club: $C festeggia con uno spettacolo prima del match di sabato"},
  {e:"🛒",t:"$C si muove sul mercato degli svincolati: due nomi nel mirino del ds"},
  {e:"📱",t:"Il capitano di $C pubblica un messaggio d'addio ai tifosi: futuro incerto"},
];

/* ========================================
   SPRINT 25 — A: IL MOMENTO (career-defining, non-repeatable)
======================================== */
// [7.159.0 direttiva PO «eventi/impulsi/opportunità ESCLUSIVI e meno noiosi per l'intera carriera» — A]
//   FASE DI CARRIERA: classifica il giocatore in un arco di vita (astro emergente → titolare → stella → bandiera →
//   veterano → lotta) così i MOMENTI esclusivi e le opportunità capitano «solo a te, ora». Puro/deterministico.
//   Priorità: giovinezza → difficoltà (riserva) → fama globale → fedeltà pluriennale → età → default titolare.
function careerPhase(p){try{
  if(!p||(p.proStatus||"u18")!=="pro")return "astro";
  const age=p.age||18,pop=p.popularity||20,role=p.squadRole||"rotazione",trust=p.coachTrust||60;
  const cid=p.club&&(p.club.id||p.club.n);
  const clubSeasons=((p.fanLegend||[]).find(f=>f&&f.clubId===cid)||{}).seasons||0;
  /* [7.161.0 M2] priorità riviste dal super-test: la LOTTA vince anche sul giovane (un 21enne riserva in crisi
     vive l'arco della riconquista, non quello del predestinato) e il VETERANO vince su stella/bandiera
     (a 32+ «L'Ultimo Ballo»/«Il Dopo-Carriera» devono essere raggiungibili anche per le stelle globali). */
  if((role==="riserva"||role==="primavera")&&trust<55)return "lotta";
  if(age<=21)return "astro";
  if(age>=32)return "veterano";
  if(pop>=82)return "stella";
  if(clubSeasons>=5)return "bandiera";
  return "titolare";
}catch(_e){return "titolare";}}
/* ============================================================================================
   [7.412.0 EVOLUTIVA PO «VITA DELL'EROE»] — eventi di vita quotidiana: contorno leggero,
   contestuale, ANTI-RIPETITIVO. Riusa i sistemi esistenti: il modale settimanale
   (setWeekLiveModal), gli effetti `ef` degli eventi random, `worldMemory` come Storia
   dell'Eroe, il procuratore gia' vivo. QUALITA' > QUANTITA': trenta eventi, ognuno risponde
   alla domanda «aggiunge davvero qualcosa alla carriera?».
   Rarita': c=comune (cooldown 8 sett.) · r=raro (25 sett., max 2 per carriera) · u=UNICO
   (una volta sola). In piu': cooldown di CATEGORIA (3 sett.) e stato persistito nel save
   (vitaSeen/vitaCat, campi ADDITIVI: i salvataggi esistenti li vedono nascere vuoti).
   `next:` incatena un seguito a ~2 settimane (poche catene, speciali). `txt` puo' essere
   funzione di p per i testi contestuali. Vincoli PO rispettati: niente VAR/replay/autogol/
   allenamento, nessuna meccanica calcistica nuova. */
const _vitaAgName=(p)=>((p&&p.agent&&(p.agent.name||p.agent.n))||"Il tuo procuratore");
const VITA_EVENTS=[
  // ---- SPOGLIATOIO E COMPAGNI ----
  {id:"vita_sfotto_gol",cat:"squadra",r:"c",cond:p=>{const mh=p.matchHistory||[];const lm=mh[mh.length-1];return !!(lm&&(lm.goals||0)>=1);}/* [7.438.0 collaudo PO «la partita precedente l'eroe non ha segnato! ci deve essere un filo conduttore»] lo sfotto' sul «bel gol» esce solo se il gol c'e' stato DAVVERO nell'ultima partita */,txt:"💬 Gruppo squadra: «Bel gol. Però ammettilo: volevi crossare 😂». Rispondi con la foto della tua esultanza e la scritta \"tutto voluto\". Pioggia di risate.",ef:{morale:5}},
  {id:"vita_cena_squadra",cat:"squadra",r:"c",txt:"🍕 Cena di squadra improvvisata dopo l'allenamento: il portiere paga per una scommessa persa. Si ride fino a mezzanotte.",ef:{morale:7,chem:3}},
  {id:"vita_scherzo_scarpe",cat:"squadra",r:"c",txt:"🧦 Trovi gli scarpini appesi alla traversa. Il veterano fischietta innocente. La tradizione va rispettata: domani tocca a te scegliere la vittima.",ef:{morale:4}},
  {id:"vita_consiglio_veterano",cat:"squadra",r:"c",cond:p=>(p.ovr||60)<78,txt:"🎙️ Il capitano ti trattiene a fine allenamento: «Guarda meno il pallone e più lo spazio. Il resto viene da sé.» Te lo scrivi mentalmente.",ef:{form:3,morale:4}},
  {id:"vita_aiuto_compagno",cat:"squadra",r:"r",txt:"🤝 Il ragazzo della Primavera ti chiede di restare dopo l'allenamento per i tiri. Un'ora dopo segna il suo primo gol in partitella e corre ad abbracciare TE.",ef:{morale:6,coachTrust:4},mem:"Il giorno in cui hai fatto da maestro"},
  {id:"vita_sale_pranzo",cat:"squadra",r:"c",cond:p=>(p.coachTrust||60)<60,txt:"😠 Il tuo concorrente di reparto non ti passa il sale a pranzo da tre giorni. La panchina pesa a tutti — ma il sale, dai.",ef:{morale:-3}},
  {id:"vita_gruppo_meme",cat:"squadra",r:"c",cond:p=>(p.popularity||20)>=40,txt:"📱 Il gruppo squadra è pieno di meme sulla tua ultima intervista. Il migliore lo ha fatto il magazziniere. Lo salvi anche tu.",ef:{morale:4,popularity:2}},
  {id:"vita_karaoke",cat:"squadra",r:"r",txt:"🎤 Serata karaoke d'iniziazione per i nuovi: uno stona così tanto che il mister, di passaggio, applaude per pietà. Il video resta nel gruppo per sempre.",ef:{morale:6,chem:3},mem:"La serata karaoke passata alla storia"},
  // ---- SOCIAL, MEDIA E TIFOSI ----
  {id:"vita_telecronaca",cat:"social",r:"c",cond:p=>(p.goals||0)>=3,txt:"📱 Un tifoso ha montato il tuo ultimo gol con una telecronaca argentina d'epoca. 200mila visualizzazioni. Non capisci una parola, ma ti emozioni pure tu.",ef:{popularity:6,morale:4}},
  {id:"vita_tendenza",cat:"social",r:"r",cond:p=>(p.popularity||20)>=55,txt:p=>`🔥 Sei in tendenza. Migliaia di post sul tuo nome, meta' complimenti e meta' consigli tattici non richiesti. ${(p.club&&p.club.n)||"Il club"} ripubblica il migliore.`,ef:{popularity:8,morale:5},mem:"Il giorno in tendenza"},
  {id:"vita_opinionista",cat:"social",r:"c",cond:p=>(p.form||70)<55,txt:"💬 Un opinionista ti definisce «discontinuo come il wifi in galleria». Fa male perché è scritto bene.",ef:{morale:-4}},
  {id:"vita_bimbo_maglia",cat:"social",r:"r",txt:"🧒 Allo stadio un bambino ha la maglia bianca col tuo nome scritto a pennarello: non c'erano ancora le tue nella sua taglia. Gliela firmi. Non smette più di saltare.",ef:{morale:8,popularity:3},mem:"La maglia scritta a pennarello"},
  {id:"vita_mixed_zone",cat:"social",r:"c",txt:"🎙️ In mixed zone: «Preferisci segnare o far segnare?» Rispondi «Vincere» e te ne vai. Il clip diventa un gif.",ef:{popularity:3,morale:2}},
  {id:"vita_meme_scivolata",cat:"social",r:"c",cond:p=>(p.form||70)<50,txt:"🙈 La tua scivolata a vuoto è diventata un meme. Lo posti tu per primo con scritto «pattinaggio artistico: 9.5». I tifosi ti perdonano tutto.",ef:{morale:2,popularity:4}},
  // ---- VITA DELL'EROE ----
  {id:"vita_primo_stipendio",cat:"vita",r:"u",cond:p=>(p.salary||0)>=10,txt:"💶 Il primo stipendio VERO. Lo guardi sul telefono per dieci minuti. Poi chiami casa: stasera offri tu, e non si discute.",ef:{morale:8},mem:"Il primo stipendio vero"},
  {id:"vita_auto",cat:"vita",r:"u",cond:p=>(p.bank||0)>=80000,txt:"🚗 Ti concedi l'auto che disegnavi sul diario a scuola. Il concessionario ti chiede un selfie. Guidi piano, ridendo da solo.",ef:{bank:-45000,morale:10},mem:"L'auto dei sogni"},
  {id:"vita_casa",cat:"vita",r:"u",cond:p=>(p.bank||0)>=250000,txt:"🏠 Le chiavi della prima casa TUA. La prima notte dormi per terra sul materasso, felice come mai.",ef:{bank:-180000,morale:12},mem:"La prima casa"},
  {id:"vita_compleanno",cat:"vita",r:"c",cond:p=>((p.week||1)%38)===(((typeof hashStr==="function"?Math.abs(hashStr((p.name||"eroe")+"_bday")):7)%30)+3),txt:"🎂 Compleanno. Lo spogliatoio ti aspetta con una torta e una foto tua da bambino trovata chissà dove, stampata in formato POSTER.",ef:{morale:6}},
  {id:"vita_caffe_oratorio",cat:"vita",r:"r",txt:"☕ Al bar un signore ti paga il caffè senza dire una parola. Poi, sulla porta: «Ti vedevo giocare all'oratorio. Non cambiare.»",ef:{morale:7},mem:"Il caffè dell'oratorio"},
  {id:"vita_famiglia_stadio",cat:"vita",r:"r",cond:p=>(p.popularity||20)>=30,txt:"👨‍👩‍👦 I tuoi in tribuna per la prima volta nello stadio grande. Li cerchi con lo sguardo al riscaldamento. Ci sono. Basta quello.",ef:{morale:9},mem:"La famiglia in tribuna"},
  {id:"vita_torneo_quartiere",cat:"vita",r:"r",cond:p=>(p.popularity||20)>=60,txt:"🏅 Il tuo quartiere ti ha intitolato il torneo estivo. La targa è storta e il campo è quello di sempre, con le buche. È il premio più bello dell'anno.",ef:{popularity:6,morale:7},mem:"Il torneo del quartiere"},
  // ---- EVENTI ASSURDI E MEMORABILI ----
  {id:"vita_tutto_calcolato",cat:"assurdo",r:"r",cond:p=>{const mh=p.matchHistory||[];const lm=mh[mh.length-1];return !!(lm&&(lm.goals||0)>=1);}/* [7.438.0] «ho APPENA visto il tuo gol»: idem, ultima partita */,txt:"😂 Messaggio di un compagno: «Ho appena visto il tuo gol. Era tutto calcolato?» Rispondi: «Ovviamente no.» «Lo sapevo.»",ef:{morale:6},mem:"«Era tutto calcolato?»"},
  {id:"vita_gatto",cat:"assurdo",r:"u",txt:"🐈 Un gatto entra al campo d'allenamento, ignora tutti e si accuccia NEL TUO zaino. Il mister: «Almeno lui ha scelto bene». Da oggi è la mascotte, e ha il tuo numero.",ef:{morale:5},mem:"Il gatto portafortuna"},
  {id:"vita_sosia",cat:"assurdo",r:"r",cond:p=>(p.popularity||20)>=45,txt:"👯 Un sosia firma autografi a tuo nome al centro commerciale. Il club, invece di denunciarlo, gli regala un abbonamento: «Porta bene».",ef:{popularity:4,morale:3},mem:"Il sosia dell'ipermercato"},
  {id:"vita_gps_buffet",cat:"assurdo",r:"u",cond:p=>(p.goals||0)>=5,txt:"📡 Riunione dati: il preparatore proietta la tua velocità massima stagionale. L'ha registrata il GPS... durante la corsa al buffet del ritiro. Applauso liberatorio.",ef:{morale:6},mem:"Il record del buffet"},
  // ---- PROCURATORE / CONFIDENTE ----
  {id:"vita_agente_cena",cat:"agente",r:"c",cond:p=>!!p.agent,txt:p=>`🍝 ${_vitaAgName(p)} ti porta a cena. Niente contratti stavolta: si parla di calcio visto, di viaggi, del suo primo assistito. «Questa la offro io. Succede una volta ogni mai.»`,ef:{morale:5}},
  {id:"vita_agente_sponsor",cat:"agente",r:"r",cond:p=>!!p.agent&&(p.popularity||20)>=50,txt:p=>`📦 ${_vitaAgName(p)}: «Uno sponsor di scarpini ha chiesto di te. Piccolo, ma serio. Ho detto che ci pensavi — cioè che accettavi.»`,ef:{bank:15000,popularity:3},next:"vita_agente_shooting",mem:"Il primo sponsor"},
  {id:"vita_agente_shooting",cat:"agente",r:"r",cond:()=>false/* solo via catena */,txt:"📸 Il servizio fotografico dello sponsor: il fotografo ti fa ripetere QUARANTA volte «guarda l'orizzonte con fame». Non sai più dove sia l'orizzonte, né la fame. Le foto, però, spaccano.",ef:{morale:4,popularity:4}},
  {id:"vita_agente_curva",cat:"agente",r:"c",cond:p=>!!p.agent&&(p.form||70)<55,txt:p=>`📞 ${_vitaAgName(p)}, di sera: «Le carriere non sono rette, sono curve. Chi ti giudica su tre partite non ha mai giocato. Dormici su.» Funziona.`,ef:{morale:6}},
  {id:"vita_agente_orgoglio",cat:"agente",r:"r",cond:p=>!!p.agent,txt:p=>`🗣️ ${_vitaAgName(p)}: «Non te lo dico mai, ma questo periodo mi ha convinto. Non per i numeri. Per come ti alleni quando nessuno guarda.»`,ef:{morale:5},mem:"Le parole del procuratore"},
];
/* il MOTORE anti-ripetitivita': visto/cooldown per evento, cooldown per categoria, rarita',
   catene. Stato in p.vitaSeen={id:{n,at}} e p.vitaCat={cat:at}, con at=(season*100+week)
   (ordinamento monotono; attraverso il confine di stagione i cooldown si allungano, mai si
   accorciano). Puro e testabile; __CPM_VITA_NOCD (solo test) spegne i cooldown per provare
   che il guardiano della varieta' sappia essere ROSSO. */
const pickVitaEvent=(p)=>{try{
  if(typeof window!=="undefined"&&window.__CPM_VITA_OFF)return null;/* [7.416.0] interruttore SOLO TEST: spegne il motore per la prova del rosso del guardiano di FLUSSO (vita-flow) — un guardiano che non sa essere rosso non misura niente */
  const at=((p.season||1)*100)+(p.week||1);
  const vs=p.vitaSeen||{},vc=p.vitaCat||{};
  const noCd=(typeof window!=="undefined"&&window.__CPM_VITA_NOCD);
  /* catena in scadenza: ha precedenza e salta i filtri (e' un seguito promesso) */
  if(p.vitaNext&&p.vitaNext.id&&at>=(p.vitaNext.at||0)){
    const ce=VITA_EVENTS.find(e=>e.id===p.vitaNext.id);
    if(ce)return{ev:ce,chain:true};
  }
  /* [7.463.0 collaudo PO «ripetitivo, gia' uscito scorsa stagione»] IL TEMPO NON ERA LINEARE, QUINDI I
     COOLDOWN NON VALEVANO NULLA FRA UNA STAGIONE E L'ALTRA. `at` e' codificato `stagione*100 + settimana`:
     dentro la stagione due settimane vicine distano 1, ma al cambio di stagione il contatore SALTA di 62
     (da 138 a 201). Qualunque cooldown risultava quindi scaduto per il solo fatto di aver cambiato
     stagione — un evento RARO visto alla S.1 tornava disponibile alla prima settimana della S.2, che e'
     esattamente cio' che il PO ha visto. `LIN` riporta quel codice a un conto di SETTIMANE VERE, e lo fa
     decodificando (`stagione`, `settimana`) dal valore memorizzato: e' esatto anche sui salvataggi gia'
     esistenti, quindi nessuna migrazione e nessun bump di SAVE_VERSION. Con l'asse giusto i cooldown
     tornano a dire quello che c'e' scritto, e quello dei RARI sale a due stagioni piene: 30 eventi di
     vita non bastano a coprire una carriera se ognuno puo' ripresentarsi ogni mezza stagione. */
  const _no463=(typeof window!=="undefined"&&!!window.__CPM_NO463);/* [7.463.0] interruttore test-only: rimette l'asse storto e i cooldown vecchi — e' la prova del rosso del guardiano vita-variety */
  const LIN=_no463?((a)=>a):((a)=>{const _se=Math.floor(a/100),_wk=a-_se*100;return _se*38+_wk;});
  const CD=_no463?{c:8,r:25,u:99999}:{c:14,r:76,u:99999},MAXN={c:99,r:2,u:1},W={c:4,r:2,u:2},CATCD=3;
  const pool=VITA_EVENTS.filter(e=>{
    if(e.cond){try{if(!e.cond(p))return false;}catch(_c){return false;}}
    if(noCd)return true;
    const st=vs[e.id]||{n:0,at:-9999};
    if(st.n>=MAXN[e.r||"c"])return false;
    if(st.n>0&&LIN(at)-LIN(st.at)<CD[e.r||"c"])return false;/* [7.413.0] il cooldown vale solo per chi E' GIA' stato visto: con l'at di default (-9999) e CD.u=99999 il confronto era sempre vero e gli UNICI mai visti restavano fuori dal pool PER SEMPRE (misurato: 0 unici in 120 stagioni su 20 semi) */
    if(LIN(at)-LIN((vc[e.cat]!=null)?vc[e.cat]:-9999)<CATCD)return false;/* [7.463.0] anche il cooldown di CATEGORIA stava sull'asse storto */
    if(p.vitaLastCat&&e.cat===p.vitaLastCat)return false;/* regola di SEQUENZA (dal guardiano): mai due eventi CONSECUTIVI della stessa categoria, per lontani che siano nel tempo — «evitare sequenze di eventi troppo simili» */
    return true;});
  if(!pool.length)return null;
  /* bonus NOVITA' (dal guardiano: 8 distinti su 30 in tre stagioni, zero unici — i comuni dominavano):
     un evento MAI VISTO pesa il triplo, cosi' la carriera esplora il pool prima di riciclare */
  const _w=(e)=>{const _b=W[e.r||"c"];return((vs[e.id]||{}).n||0)===0?_b*3:_b;};
  let tot=0;pool.forEach(e=>tot+=_w(e));
  let r=Math.random()*tot;
  for(const e of pool){r-=_w(e);if(r<=0)return{ev:e,chain:false};}
  return{ev:pool[pool.length-1],chain:false};
}catch(_e){return null;}};
const markVitaEvent=(p,ev)=>{try{
  const at=((p.season||1)*100)+(p.week||1);
  const vs={...(p.vitaSeen||{})},st=vs[ev.id]||{n:0,at:0};
  vs[ev.id]={n:(st.n||0)+1,at};
  const vc={...(p.vitaCat||{})};vc[ev.cat]=at;
  const out={vitaSeen:vs,vitaCat:vc,vitaLastCat:ev.cat/* regola di SEQUENZA: il motore esclude la categoria dell'ULTIMO evento */,vitaNext:(p.vitaNext&&p.vitaNext.id===ev.id)?null:(p.vitaNext||null)};
  if(ev.next)out.vitaNext={id:ev.next,at:at+2};
  return out;
}catch(_e){return{};}};
const CAREER_MOMENTS=[
  {id:"cm_rigore_vita",name:"Il Rigore della Vita",
   trigger:(p)=>p.proStatus==="pro"&&(p.week||1)>=34&&(p.season||1)>=2&&(p.trophies||[]).length===0&&!p.injured&&(p.matchHistory||[]).length>0/* [7.161.0 A4] il momento fire su Avanza (settimane senza gara): serve almeno una gara vera da ricordare, mai da infortunato */,
   prob:0.06,
   txt:"⚽ La notte ripensi all'ultima gara: settantesimo, fischio, rigore. Il dischetto, lo stadio che trattiene il fiato. Momenti così definiscono una carriera.",/* [7.161.0 A4] narrato al presente in una settimana SENZA partita → riformulato come ricordo */
   choices:[
     {txt:"💪 Corro verso il pallone. Il mondo può aspettare.",ef:{morale:18,popularity:20,form:10},mem:"Trasformasti il rigore della vita. La curva impazzì."},
     {txt:"🙋 Cedo il tiro a un compagno. Non me la sento.",ef:{morale:-8,coachTrust:-6},mem:"Lasciasti il rigore decisivo. Alcune scelte non si dimenticano."},
   ]},
  {id:"cm_presidente_notte",name:"L'Offerta della Notte",
   trigger:(p)=>p.proStatus==="pro"&&(p.value||0.8)>=2.0&&(p.season||1)>=3&&(p.renewalSeason||0)!==(p.season||1)/* [7.161.0 A2] non la settimana dopo un rinnovo vero */,
   prob:0.04,
   txt:"📱 Il presidente ti convoca alle 22:00: «Ho un'offerta sul tavolo. Il doppio del tuo stipendio. Firma adesso o la ritiro.»",
   choices:[
     {txt:"✍️ Firmo. È il calcio, non la poesia.",ef:{value:0.8,morale:6,coachTrust:-12,popularity:8,wageMult:2,contractYears:2},mem:"Firmasti per il doppio. Il club capì."},/* [7.161.0 A2] la firma ora RINNOVA davvero: stipendio ×2 e +2 anni (prima il contratto non cambiava = contraddizione visibile nel Tab Agente) */
     {txt:"❌ «Non è la mia priorità. Resto per sport.»",ef:{coachTrust:15,morale:12,popularity:18},mem:"Rifiutasti il doppio per lealtà. Divenne leggenda."},
   ]},
  {id:"cm_rivale_sorpasso",name:"Il Sorpasso",
   trigger:(p)=>!!(p.rival&&(p.rival.totalGoals||0)>=(p.totalGoals||0)+5&&(p.season||1)>=3),
   prob:0.07,
   txt:"📊 Le statistiche non mentono: il tuo rivale ti ha superato di {RIVGAP} gol in carriera. Ti arriva un messaggio: «Ci vediamo in cima.»",/* [7.161.0 M4] gap REALE (placeholder risolto da resolveEvText), non il 5 hardcodato */
   choices:[
     {txt:"🔥 «Ci sei già? Allora ho ancora fame.»",ef:{morale:12,form:8},mem:"Rispondesti al sorpasso del rivale con fuoco."},
     {txt:"😶 Non rispondi. Lavori.",ef:{form:10,fatigue:5},mem:"Silenzio. Lavoro. Risposta sul campo."},
   ]},
  {id:"cm_infortunio_grave",name:"Stop Prolungato",
   trigger:(p)=>!!(p.injured&&(p.injuryWeeks||0)>=6),/* [6.51.0 collaudo PO «diceva 3 mesi ma ero fuori pochissime settimane»] SOLO infortuni GRAVI (6-12 settimane); prima >=3 catturava anche i "medio" (3-5 sett.) ⇒ testo assurdo */
   prob:0.45,
   txt:"🏥 Il dottore abbassa la voce: «Sarà lunga: circa {INJWK} settimane di stop, forse qualcosa in più.» Resto in silenzio.",/* [6.51.0] durata REALE ({INJWK}) invece del fisso "tre mesi" — via resolveEvText nel modal */
   choices:[
     {txt:"💪 «Tornerò più forte. Promesso.»",ef:{morale:10,fatigue:-6},mem:"Nella peggiore crisi, promettesti di tornare. E lo facesti."},
     {txt:"😔 «Quante volte ancora...»",ef:{morale:-5,form:-3},mem:"Quel momento ti scosse nel profondo. Non eri di pietra."},
   ]},
  {id:"cm_nazionale_escluso",name:"La Telefonata del CT",
   trigger:(p)=>p.proStatus==="pro"&&(p.nationalCaps||0)>=5&&!(p.euroMondiale&&p.euroMondiale.active)&&!(p.nationsCupQueue&&p.nationsCupQueue.active&&!p.nationsCupQueue.done)&&!(p.calendar||[]).some(m=>m&&m.type==="national"&&!m.played)/* [7.161.0 M3] mai «escluso dalla lista» mentre GIOCHI il torneo o hai una convocazione in calendario */,
   prob:0.04,
   txt:"📞 Il CT ti chiama personalmente: «Non sei nella lista per il prossimo torneo. So che fa male. Devi tornare al top.»",
   choices:[
     {txt:"🙏 «Capisco. Torno a lavorare.»",ef:{morale:-3,form:6,coachTrust:4},mem:"Accettasti l'esclusione dalla nazionale con classe."},
     {txt:"😤 «È una scelta sbagliata.»",ef:{morale:6,popularity:-8},mem:"Contestasti l'esclusione dalla nazionale."},
   ]},
  {id:"cm_ex_club_finale",name:"Quella Notte",
   trigger:(p)=>(p.history||[]).length>=2&&(p.worldMemory||[]).some(m=>m.type==="ex_club"),
   prob:0.05,
   txt:"📺 In TV passano le immagini della tua ex squadra: lo stadio pieno, la curva che canta i cori che cantava per te. Una fitta al petto.",/* [7.161.0 A3] il «vince il titolo» era INVENTATO (nessuna verifica sui campioni reali): riformulato su un fatto sempre vero */
   choices:[
     {txt:"❤️ «Sono felice per loro. Ero lì anch'io.»",ef:{morale:5,popularity:8},mem:"Guardasti il trionfo dell'ex club senza rimpianti."},
     {txt:"😔 «Potevo essere lì.»",ef:{morale:-6,form:4},mem:"Quella notte capisti cosa avevi lasciato."},
   ]},
  {id:"cm_fan_lettera",name:"La Lettera della Curva",
   trigger:(p)=>p.proStatus==="pro"&&p.transferListed&&(p.fanLegend||[]).some(f=>f.seasons>=2),
   prob:0.20,
   txt:"✉️ Una busta nel tuo armadiello. «Se vai via, non sei mai stato uno di noi.» Firma: la Curva.",
   choices:[
     {txt:"🚶 «È il mio lavoro. Andrò avanti.»",ef:{morale:-3,popularity:-10},mem:"Partisti nonostante la lettera della Curva."},
     {txt:"❤️ «Ritiro la cessione. Resto.»",ef:{morale:14,popularity:22,coachTrust:8,transferListed:false},mem:"La lettera della Curva ti convinse a restare. Leggenda."},
   ]},
  {id:"cm_sogno_sfumato",name:"Il Sogno Sfumato",
   trigger:(p)=>!!(p.dreamClub&&(p.season||1)>=4&&(p.week||1)<=6&&!(p.history||[]).some(h=>h.clubId===p.dreamClub?.id)&&p.club?.id!==p.dreamClub?.id)/* [7.161.0 BASSA] «il colpo dell'estate» solo a inizio stagione */,
   prob:0.05,
   txt:"🌟 Il tuo Club dei Sogni annuncia il colpo dell'estate. Non sei tu. Guardi il comunicato in silenzio.",
   choices:[
     {txt:"💪 «Ci arriverò. A modo mio.»",ef:{morale:7,form:8},mem:"Quando il sogno sembrò sfumare, trasformasti la delusione in carburante."},
     {txt:"😔 «Forse non era destino.»",ef:{morale:-8},mem:"Quella notizia ti tolse il fiato."},
   ]},
  {id:"cm_fascia_ad_altro",name:"La Fascia ad un Altro",
   /* [7.276.0 collaudo PO «troppo giovane e troppo poca seniorità nel club»] Il momento presuppone che tu
      fossi un CANDIDATO alla fascia, ma il trigger chiedeva solo fiducia ≥75 e terza stagione: usciva a un
      ventenne arrivato da poco, che capitano non poteva esserlo per definizione. La fascia si assegna (7.5.0)
      a chi ha 27 anni, 130 presenze, fiducia ≥90 e OVR ≥80: la CANDIDATURA mancata deve stare appena sotto
      quella soglia, non a metà strada dall'esordio. */
   trigger:(p)=>p.proStatus==="pro"&&(p.coachTrust||60)>=75&&!p.isCaptain&&(p.season||1)>=5&&(p.age||18)>=26&&(p.totalMatches||0)>=110&&["titolare","leader"].indexOf(p.squadRole||"")>=0,
   prob:0.04,
   txt:"👕 Il mister annuncia il nuovo capitano. Non è te. Ti guarda negli occhi: «So cosa stai pensando. Dimostrami che ho sbagliato.»",
   choices:[
     {txt:"🤝 «Lo capisco, mister. Lavoro.»",ef:{coachTrust:8,morale:3},mem:"Accettasti la fascia ad un altro con dignità. Poi parlò il campo."},
     {txt:"😤 «Meritavo io quella fascia.»",ef:{coachTrust:-10,morale:5},mem:"Protestasti per la fascia mancata. Il mister non dimenticò."},
   ]},
  {id:"cm_scoop",name:"Lo Scoop",
   trigger:(p)=>(p.journalists||[]).some(j=>j.type==="investigativa"&&(j.trust||50)<40),
   prob:0.14,
   txt:"📲 Tweet. Poi articolo. Il giornalista investigativo ha trovato qualcosa. Non tutto era off-the-record.",
   choices:[
     {txt:"📝 Rilascio una dichiarazione ufficiale.",ef:{popularity:-4,coachTrust:3},mem:"Gestisti lo scoop con un comunicato. Danno limitato."},
     {txt:"🤐 Silenzio totale. Lascio che passi.",ef:{popularity:-7,morale:-3},mem:"Il silenzio sullo scoop alimentò le voci."},
     {txt:"🔥 Rispondo direttamente al giornalista.",ef:{popularity:8,coachTrust:-6,morale:6},mem:"Rispondesti allo scoop a muso duro. Divisivo ma rispettato."},
   ]},
  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // [7.159.0 A+B+C] MOMENTI ESCLUSIVI PER FASE DI CARRIERA (phase) + TIER DI RARITÀ (tier: "raro"|"epico").
  //   Ogni fase ha momenti che le sono propri → un giovane e una leggenda NON vivono gli stessi eventi.
  //   Gli "epico" hanno presentazione premium (modal dorato) e sono once-in-a-career come tutti i CAREER_MOMENTS
  //   (memoria a vita via p.momentsFired). Effetti su chiavi supportate da handleCareerMoment (morale/form/
  //   coachTrust/popularity/value/fatigue/bank/chem/transferListed).
  // ── ASTRO (giovane predestinato) ──
  {id:"cm_astro_predestinato",name:"Il Predestinato",phase:"astro",tier:"epico",
   trigger:(p)=>(p.proStatus||"u18")==="pro"&&careerPhase(p)==="astro"&&(p.ovr||60)>=72&&(p.season||1)>=2/* [7.161.0 M2] gate pro: careerPhase ritorna «astro» anche per gli U18 */,
   prob:0.09,
   txt:"📰 Prime pagine: «È LUI il predestinato». A {AGE} anni sei il volto del futuro. Il peso dell'etichetta è enorme quanto il talento.",
   choices:[
     {txt:"🔥 «Le aspettative sono benzina.»",ef:{morale:10,popularity:12,form:6},mem:"Da predestinato, ti caricasti l'etichetta sulle spalle senza tremare."},
     {txt:"🧘 «Penso solo alla prossima partita.»",ef:{coachTrust:8,form:8,morale:4},mem:"Ignorasti l'hype e lasciasti parlare il campo. Da predestinato a certezza."},
   ]},
  {id:"cm_astro_prima_big",name:"La Prima da Grande",phase:"astro",tier:"raro",
   trigger:(p)=>(p.proStatus||"u18")==="pro"&&careerPhase(p)==="astro"&&(p.totalMatches||0)>=8&&(p.totalMatches||0)<=60&&(p.squadRole||"rotazione")!=="titolare"&&(p.calendar||[]).some(m=>m&&!m.played&&m.week>=(p.week||1)&&m.week<=(p.week||1)+1)/* [7.161.0 A4] «domani parti titolare» solo con una gara REALE in arrivo, da non-titolare, da pro */,
   prob:0.10,
   txt:"👕 Il mister ti chiama nel suo ufficio: «Domani parti titolare nel big match. Ti sei guadagnato la maglia. Non pensarci troppo.»",
   choices:[
     {txt:"💪 «Sono pronto. Da sempre.»",ef:{morale:8,form:6,coachTrust:4},mem:"La tua prima da grande: entrasti in campo come se ci fossi nato."},
     {txt:"😅 «Ho un po' di paura, mister.»",ef:{coachTrust:6,morale:4},mem:"Confessasti la paura della prima da grande. Il mister apprezzò l'onestà."},
   ]},
  // ── LOTTA (riserva / in difficoltà) ──
  {id:"cm_lotta_ultimatum",name:"L'Ultimatum",phase:"lotta",tier:"raro",
   trigger:(p)=>careerPhase(p)==="lotta"&&(p.season||1)>=2,
   prob:0.16,
   txt:"⏳ Il mister è brutale: «Hai un mese per convincermi, o a gennaio saluti. Il posto te lo devi riprendere in allenamento, da domani.»",
   choices:[
     {txt:"🔥 «Mi riprendo tutto. Guardi.»",ef:{form:8,fatigue:6,morale:4},mem:"Rispondesti all'ultimatum col lavoro. Il posto te lo riprendesti coi denti."},
     {txt:"🤝 «Mi dia solo una gara vera.»",ef:{coachTrust:5,morale:3},mem:"Chiedesti solo una chance vera dopo l'ultimatum. Onesto, diretto."},
   ]},
  {id:"cm_lotta_prestito_giocare",name:"Giocare, a Ogni Costo",phase:"lotta",tier:"raro",
   trigger:(p)=>careerPhase(p)==="lotta"&&(p.age||18)<=25&&(p.season||1)>=2&&!p.loan/* [7.161.0 A2] mai proporre il prestito a chi è GIÀ in prestito */&&!!p.hasAgent/* «il procuratore chiama» */,
   prob:0.14,
   txt:"📞 Il procuratore chiama: «Una squadra di categoria inferiore ti vuole titolare da subito. Meno vetrina, ma giochi ogni settimana. Che fai?»",
   choices:[
     {txt:"⚽ «Voglio giocare. Dillo al club: mettetemi in lista.»",ef:{form:10,morale:8,coachTrust:-4,transferListed:true},mem:"Chiedesti i minuti veri alla panchina di lusso. Il club ti mise in lista."},/* [7.161.0 A2] la scelta produce un FATTO (transferListed → il mercato si muove davvero) invece di un prestito solo raccontato */
     {txt:"🛡️ «Resto e me lo prendo qui.»",ef:{coachTrust:6,morale:-2,form:4},mem:"Rifiutasti la via facile: il posto lo volevi qui, dove nessuno credeva in te."},
   ]},
  // ── STELLA (fama globale) ──
  {id:"cm_stella_brand_globale",name:"La Campagna Mondiale",phase:"stella",tier:"epico",
   trigger:(p)=>careerPhase(p)==="stella"&&(p.season||1)>=4,
   prob:0.10,
   txt:"🌍 Un marchio globale ti vuole come volto della prossima campagna mondiale. Cartelloni in ogni città del pianeta. Quasi un milione sul piatto.",/* [7.161.0 M4] «sette zeri» ma l'accredito è 900k → testo allineato al numero vero */
   choices:[
     {txt:"📸 «Il mondo saprà chi sono.»",ef:{popularity:14,bank:900000,value:0.6,fatigue:5},mem:"Il tuo volto illuminò i cartelloni di mezzo mondo. Eri più di un calciatore."},
     {txt:"⚽ «Prima il campo, poi le foto.»",ef:{coachTrust:8,form:6,popularity:5},mem:"Rifiutasti la campagna mondiale per non perdere il focus. Rara umiltà da stella."},
   ]},
  {id:"cm_stella_volto_lega",name:"Il Volto della Lega",phase:"stella",tier:"raro",
   trigger:(p)=>careerPhase(p)==="stella"&&(p.season||1)>=4,
   prob:0.12,
   txt:"📺 La Lega ti sceglie come immagine ufficiale della stagione: sarai TU su ogni locandina, ogni spot, ogni copertina del campionato.",
   choices:[
     {txt:"👑 «È un onore che mi merito.»",ef:{popularity:12,morale:6,value:0.3},mem:"Diventasti il volto ufficiale del campionato. La faccia di un'intera epoca."},
     {txt:"🙏 «Lo dedico ai compagni.»",ef:{chem:8,popularity:6,morale:4},mem:"Da volto della Lega, dedicasti l'onore allo spogliatoio. Leader vero."},
   ]},
  // ── BANDIERA (fedeltà pluriennale) ──
  {id:"cm_bandiera_murale",name:"Il Murale",phase:"bandiera",tier:"epico",
   trigger:(p)=>careerPhase(p)==="bandiera"&&(p.popularity||20)>=55,
   prob:0.12,
   txt:"🎨 Ti svegli e la città ne parla: hanno dipinto un MURALE con la tua faccia, alto tre piani, nel quartiere dello stadio. «Uno di noi», c'è scritto.",
   choices:[
     {txt:"❤️ Vado a vederlo di persona.",ef:{morale:12,popularity:8},mem:"Restasti in silenzio davanti al tuo murale. Eri diventato parte della città."},
     {txt:"🙏 Ringrazio la curva sui social.",ef:{popularity:10,chem:4,morale:6},mem:"Il murale con la tua faccia: la prova che certe bandiere non si ammainano."},
   ]},
  {id:"cm_bandiera_rinnovo_simbolo",name:"Il Contratto Simbolo",phase:"bandiera",tier:"raro",
   trigger:(p)=>careerPhase(p)==="bandiera"&&(p.age||18)>=28&&(p.contract?.duration||3)<=2&&(p.renewalSeason||0)!==(p.season||1)/* [7.161.0 A2] proposta sensata solo a scadenza vicina e senza rinnovo fresco */,
   prob:0.13,
   txt:"✍️ Il presidente ti offre un rinnovo «simbolico»: cifra da bandiera, clausola anti-addio, e la promessa di ritirare la tua maglia. «Qui finisci la carriera.»",
   choices:[
     {txt:"🖊️ «Firmo. Casa è casa.»",ef:{morale:10,coachTrust:8,popularity:8,wageMult:1.1,contractYears:3},mem:"Firmasti il contratto-simbolo: legasti il tuo nome a questi colori per sempre."},/* [7.161.0 A2] la firma ESTENDE davvero il contratto (+3 anni, +10%) */
     {txt:"🤔 «Ne parliamo a fine stagione.»",ef:{value:0.3,morale:2},mem:"Rimandasti il contratto-simbolo. Volevi meritartelo sul campo, ancora."},
   ]},
  // ── VETERANO (fine carriera in vista) ──
  {id:"cm_vet_ultimo_ballo",name:"L'Ultimo Ballo",phase:"veterano",tier:"epico",
   trigger:(p)=>careerPhase(p)==="veterano"&&(p.season||1)>=6,
   prob:0.12,
   txt:"🕯️ Lo senti nelle gambe: forse è l'ultima grande stagione. Il mister ti guarda: «Facciamola diventare leggenda. Un ultimo ballo, insieme.»",
   choices:[
     {txt:"🔥 «Diamogli qualcosa da ricordare.»",ef:{morale:12,form:10,fatigue:4},mem:"Il tuo ultimo ballo: giocasti ogni gara come se fosse una finale. E lo era."},
     {txt:"😌 «Me la godo, gara dopo gara.»",ef:{morale:8,coachTrust:4,form:4},mem:"Ti godesti l'ultimo ballo senza fretta. Ogni pallone, un piccolo addio."},
   ]},
  {id:"cm_vet_dirigenza",name:"Il Dopo-Carriera",phase:"veterano",tier:"raro",
   trigger:(p)=>careerPhase(p)==="veterano"&&(p.popularity||20)>=50,
   prob:0.11,
   txt:"👔 Il club ti prende da parte: «Quando smetterai, qui c'è un ruolo per te. Dirigente, ambasciatore, quello che vorrai. Non ti lasceremo andare.»",
   choices:[
     {txt:"🤝 «Mi lusinga. Ci penserò.»",ef:{morale:8,coachTrust:6},mem:"Il club ti prospettò un futuro da dirigente. La tua storia qui non finirà col fischio."},
     {txt:"⚽ «Un passo alla volta: ora gioco.»",ef:{form:6,morale:4},mem:"Rimandasti i pensieri sul dopo. C'era ancora troppo calcio da giocare."},
   ]},
  // ── TITOLARE (affermato) ──
  {id:"cm_tit_leader_designato",name:"Il Leader Designato",phase:"titolare",tier:"raro",
   trigger:(p)=>careerPhase(p)==="titolare"&&(p.coachTrust||60)>=70&&!p.isCaptain&&(p.totalMatches||0)>=60&&(p.squadRole||"rotazione")!=="riserva"&&(p.squadRole||"rotazione")!=="primavera"/* [7.161.0 M2] «sei il prossimo leader» mai a un panchinaro */,
   prob:0.10,
   txt:"🧭 Nello spogliatoio qualcosa è cambiato: i giovani ti cercano, il mister ti ascolta. «Tu sei il prossimo leader di questo gruppo. Prenditelo.»",
   choices:[
     {txt:"💪 «Mi prendo le mie responsabilità.»",ef:{coachTrust:8,chem:6,morale:6},mem:"Ti prendesti la leadership del gruppo prima ancora della fascia. Da titolare a guida."},
     {txt:"🤫 «Guido con l'esempio, in silenzio.»",ef:{chem:5,form:5,coachTrust:4},mem:"Scegliesti la leadership silenziosa: parlavano i fatti, non le parole."},
   ]},
];
// [7.159.0] esposizione test-only (probe career-moments-test): fase di carriera + pool momenti + eleggibilità.
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD&&/[?&]cpmtest=1\b/.test((window.location&&window.location.search)||"")){
  window.__CPM_careerPhase=careerPhase;
  window.__CPM_MOMENTS=CAREER_MOMENTS;
  window.__CPM_IMPULSES=WEEKLY_IMPULSES;
  window.__CPM_impulseFreshBucket=impulseFreshBucket;
  window.__CPM_eligibleMoments=function(p){try{const fired=(p&&p.momentsFired)||[];return CAREER_MOMENTS.filter(m=>!fired.includes(m.id)&&m.trigger(p)).map(m=>({id:m.id,phase:m.phase||null,tier:m.tier||"raro"}));}catch(e){return "err:"+(e&&e.message);}};
}

/* ========================================
   SPRINT 25 — B: LA CITTÀ (Fan Groups)
======================================== */
const ULTRAS_PREFIXES=["Ultras","Fedelissimi","Boys","Brigate","Curva","Fedayn","Irriducibili","Commando","Fronte","Guardiani"];
const ULTRAS_SUFFIXES=["Nord","Sud","Est","Ovest","Storici","Forever","Eterni","Uniti","Ribelli","1970","del Popolo","Sempre"];

/* ========================================
   SPRINT 25 — C: IL CAPITANO (team talks)
======================================== */
const CAPTAIN_TEAM_TALKS=[
  "«Questa partita la giochiamo per noi. Non per il contratto, non per i giornali. Per quello che siamo.»",
  "«Ognuno di voi vale più di quanto pensi. Usciamo da qui sapendo di aver dato tutto.»",
  "«Non voglio rimpianti. Tutto. Adesso.»",
  "«Ho visto questa squadra alzarsi nelle situazioni peggiori. È il momento di farlo ancora.»",
  "«Il pubblico verrà qui per vederci giocare. Noi usciamo per vincere.»",
  "«Silenzio. Respira. E poi vai — senza pensieri.»",
];

/* ========================================
   INJURY SYSTEM — types + rehab activities
======================================== */
const INJURY_TYPES_META={
  contusione:{label:"Contusione",icon:"🟡"},
  stiramento:{label:"Stiramento muscolare",icon:"🟠"},
  distorsione:{label:"Distorsione",icon:"🔴"},
  osseo:{label:"Trauma osseo",icon:"🦴"},
};
// Keyed by {injuryType: {weeksRemaining: activity}}
const INJURY_REHAB={
  contusione:{
    1:{txt:"🧊 Crioterapia, ghiaccio e bendaggio compressivo. Il fisio è tranquillo: 'Niente di grave, tra qualche giorno torni in gruppo.' Un piccolo sollievo.",ef:{fatigue:-6},icon:"🧊"},
  },
  stiramento:{
    2:{txt:"🏥 Prima sessione di fisioterapia: elettrostimolazione sul quadricipite. C'è ancora fastidio, ma il fisio è ottimista. 'Un'altra settimana di stop, poi si valuta il rientro.'",ef:{fatigue:-5,morale:-4},icon:"⚡"},
    1:{txt:"🏃 Corsetta leggera sul campo col preparatore. La muscolatura regge. Il mister ti ha visto dalla tribuna e ha annuito soddisfatto. Stai tornando.",ef:{fatigue:-10,form:3,morale:5},icon:"✅"},
  },
  distorsione:{
    3:{txt:"🩻 Risonanza magnetica alla caviglia: lesione di secondo grado. Inizia il protocollo RICE. Il dottore è serio ma sereno: 'Tre settimane e sei a posto.'",ef:{fatigue:-4,morale:-6},icon:"🩻"},
    2:{txt:"🚴 Lavoro in piscina e cyclette. Il gonfiore scende visibilmente. Il fisio dice che stai recuperando meglio del previsto.",ef:{fatigue:-8,fisico:1},icon:"🏊"},
    1:{txt:"✅ Visita di controllo: il dottore è soddisfatto. 'Puoi tornare in gruppo domani.' Il mister sorride vedendoti camminare normalmente lungo il corridoio.",ef:{fatigue:-12,form:4,morale:7},icon:"🩺"},
  },
  osseo:{
    4:{txt:"🔪 Intervento in artroscopia presso la clinica del club. L'equipe medica è soddisfatta: 'Decorso nella norma, quattro settimane e rientri gradualmente.' Devi avere pazienza.",ef:{fatigue:-3,morale:-10},icon:"🏥"},
    3:{txt:"💧 Idroterapia e terapia laser. La cicatrizzazione procede bene. Il fisio ti monitora due volte al giorno. Meno dolore al mattino rispetto a ieri.",ef:{fatigue:-6,mentalità:1},icon:"💧"},
    2:{txt:"🏋️ Prima sessione di palestra differenziata: solo parte superiore del corpo. Ti senti già più vivo. I compagni vengono a salutarti nello spogliatoio.",ef:{fatigue:-7,fisico:1,morale:5},icon:"💪"},
    1:{txt:"⚽ Primo allenamento col pallone sul campo. Lento, preciso, controllato. La squadra ti applaude. Il mister: 'Questa settimana sei in panchina, la prossima vediamo.'",ef:{fatigue:-10,form:3,morale:8},icon:"⚽"},
  },
  _fallback:{txt:"🏥 Sessione di fisioterapia con il medico del club. Il recupero procede nella norma. Ancora qualche giorno di stop.",ef:{fatigue:-6},icon:"🏥"},
};

const COACH_DIALOGUES=[
  {q:"«Questa settimana mi aspetto il massimo da te. Come ti senti fisicamente?»",tone_pos:"💪 Pronto al 100%",tone_neu:"😐 Nella media, mister.",tone_neg:"😓 Un po' stanco, ma ci sono.",ef_pos:{coachTrust:5,morale:6,fatigue:5},ef_neu:{coachTrust:2,morale:2},ef_neg:{coachTrust:-3,fatigue:-8,morale:-4}},
  {q:"«Sei arrivato tardi all'allenamento. Cosa è successo?»",tone_pos:"🙏 Chiedo scusa, mister. Non si ripeterà.",tone_neu:"🚗 Traffico, mister.",tone_neg:"😤 Era solo cinque minuti.",ef_pos:{coachTrust:8,morale:3},ef_neu:{coachTrust:-2,morale:-2},ef_neg:{coachTrust:-10,morale:-6}},
  {q:"«Hai visto il video della prossima avversaria. Che impressione ti ha fatto?»",tone_pos:"📊 Difesa alta, possiamo bucarla in profondità.",tone_neu:"😐 Niente di speciale.",tone_neg:"😏 Sono sopravvalutati.",ef_pos:{coachTrust:7,morale:5,form:3},ef_neu:{coachTrust:1},ef_neg:{coachTrust:-5,morale:3}},
  {q:"«Il pubblico si aspetta molto da te sabato. Come gestisci la pressione?»",tone_pos:"🔥 La pressione mi carica, ci sarò.",tone_neu:"😐 Come sempre, ci penserò.",tone_neg:"😰 Sinceramente un po' di ansia ce l'ho.",ef_pos:{coachTrust:5,morale:8,form:4},ef_neu:{coachTrust:2,morale:2},ef_neg:{coachTrust:-3,morale:-5,mentalità:1}},
  {q:"«Hai lavorato bene questa settimana. Hai qualcosa da chiedermi?»",tone_pos:"🎯 Voglio più spazio in area, mister.",tone_neu:"🤝 No, sono soddisfatto.",tone_neg:"💶 Penso che meriti uno stipendio più alto.",ef_pos:{coachTrust:6,morale:6},ef_neu:{coachTrust:3,morale:4},ef_neg:{coachTrust:-6,morale:4,value:0.05}},
  {q:"«C'è tensione nello spogliatoio. Come la vedi tu?»",tone_pos:"🤝 Provo a fare da mediatore tra i compagni.",tone_neu:"😐 Non ne so molto.",tone_neg:"🚶 Fatti loro, penso al campo.",ef_pos:{coachTrust:9,morale:6},ef_neu:{coachTrust:1},ef_neg:{coachTrust:-4,morale:-3}},
  {q:"«Hai sbagliato un gol facile ieri. Come ci lavori?»",tone_pos:"🏋️ Ho fatto extra reps al tiro, non succederà.",tone_neu:"😐 Capita, la prossima va dentro.",tone_neg:"😤 Era difesa che mi pressava.",ef_pos:{coachTrust:7,form:4,tiro:1},ef_neu:{coachTrust:2},ef_neg:{coachTrust:-6,morale:-5}},
  {q:"«Stai valutando altre offerte di mercato?»",tone_pos:"❤️ Sono felice qui, mister. Non cerco niente.",tone_neu:"😐 Non mi occupo di queste cose.",tone_neg:"🤔 Valuterò le opportunità giuste.",ef_pos:{coachTrust:10,morale:5},ef_neu:{coachTrust:3},ef_neg:{coachTrust:-8,value:0.1}},
  // Dialoghi proattivi: il mister prende l'iniziativa
  {q:"«Ehi, come stai? Ti noto un po' diverso ultimamente. Tutto ok?»",tone_pos:"🙏 Grazie per chiedere, mister. Sto migliorando.",tone_neu:"😐 Bene, mister. Niente di grave.",tone_neg:"😶 Non è un momento facile, lo ammetto.",ef_pos:{coachTrust:7,morale:8},ef_neu:{coachTrust:2,morale:2},ef_neg:{coachTrust:4,morale:-3},proactive:true,trigger:"low_form"},
  {q:"«Questo week mi aspettavo di più da te. Cosa sta succedendo?»",tone_pos:"💪 Ha ragione. Lavoro di più da domani.",tone_neu:"😐 Sto attraversando un momento difficile.",tone_neg:"😤 Il problema non sono io, sono le circostanze.",ef_pos:{coachTrust:8,form:5,morale:4},ef_neu:{coachTrust:2,morale:-2},ef_neg:{coachTrust:-9,morale:-6},proactive:true,trigger:"poor_form"},
  {q:"«Ottimo lavoro in questi ultimi allenamenti. Mi stai convincendo sempre di più.»",tone_pos:"🔥 Grazie, mister! Voglio continuare così.",tone_neu:"😊 Cerco sempre di dare il massimo.",tone_neg:"😅 Mi aspettavo di sentirmelo dire prima, mister.",ef_pos:{coachTrust:8,morale:9,form:4},ef_neu:{coachTrust:3,morale:4},ef_neg:{coachTrust:-2,morale:2},proactive:true,trigger:"high_trust"},
  {q:"«Ti vedo stanco. Lo staff medico mi dice che stai forzando troppo. Rallenta.»",tone_pos:"👍 Ha ragione. Seguirò i consigli dello staff.",tone_neu:"😐 Cercherò di gestire meglio i carichi.",tone_neg:"💆 Sto bene, mister. Non si preoccupi.",ef_pos:{coachTrust:6,fatigue:-10,morale:5},ef_neu:{coachTrust:2,fatigue:-5},ef_neg:{coachTrust:-4,morale:-3},proactive:true,trigger:"high_fatigue"},
  {q:"«Sei diventato uno dei punti fermi di questo spogliatoio. Sono fiero di te.»",tone_pos:"🌟 Grazie, mister. La sua fiducia vale tutto.",tone_neu:"🤝 Faccio solo il mio dovere.",tone_neg:"😅 Apprezzo, ma voglio ancora di più.",ef_pos:{coachTrust:10,morale:11,value:0.05},ef_neu:{coachTrust:5,morale:5},ef_neg:{coachTrust:-2,morale:4},proactive:true,trigger:"high_trust"},
];

// Sprint E-1 — Promesse del Mister
const COACH_PROMISES=[
  {type:"starter",
   announce:"«Se continui così, la prossima partita importante sei titolare indiscusso.»",
   checkFn:(p)=>(p.matchStatus==="starter"||(p.squadRole==="titolare"||p.squadRole==="leader")),
   keptMsg:"✅ Il mister ha mantenuto la promessa — sei titolare!",
   brokenMsg:"💔 Il mister non ha mantenuto la promessa. La fiducia scricchiola.",
   trustKept:8, trustBroken:-15},
  {type:"renewal",
   announce:"«Prima della fine della stagione, parleremo di rinnovo. Hai il mio impegno.»",
   checkFn:(p)=>!!(p.contract&&(p.contract.renewedThisSeason||p.contract.duration>1)),
   keptMsg:"✅ Il mister ha mantenuto la promessa — rinnovo confermato!",
   brokenMsg:"💔 Nessun rinnovo come promesso. Il rapporto si incrina.",
   trustKept:10, trustBroken:-18},
  {type:"captain",
   announce:"«Ti vedo come futuro capitano di questa squadra. Ci stiamo lavorando.»",
   checkFn:(p)=>p.isCaptain===true,
   keptMsg:"✅ Il mister ha mantenuto la promessa — sei il capitano!",
   brokenMsg:"💔 La fascia non è arrivata come promesso.",
   trustKept:12, trustBroken:-12},
];

// Sprint 100 — End-of-season coach dialogs (keyed by result + coachStyle)
const SEASON_END_COACH=[
  // CHAMPION
  {result:"champion",style:"Offensivo",txt:"«Campioni! Questo è il calcio che voglio. Tu hai fatto la differenza — gol, pressing, corsa. Non potevo chiedere di meglio.»"},
  {result:"champion",style:"Difensivo",txt:"«Titolo meritato. Solidi in difesa, letali quando contava. Hai rispettato ogni piano. Sono soddisfatto.»"},
  {result:"champion",style:"Possesso",txt:"«Abbiamo dominato con la palla. Tu sei stato il motore di questo gioco. Campioni con stile.»"},
  {result:"champion",style:"Pressing",txt:"«Non ci siamo mai fermati, nemmeno un secondo. Questo titolo è fatto di sudore — tuo in primis.»"},
  {result:"champion",style:null,txt:"«Campioni! Questa squadra ha un'anima. Tu ne sei parte fondamentale. Godi questo momento.»"},
  // EURO CHAMPION [7.421.0 collaudo PO — screenshot fine S.19]: la classificazione non aveva la voce
  // «euro» e dopo una CHAMPIONS VINTA il mister diceva «Stagione discreta» (cadeva su «good»).
  {result:"euro",style:null,txt:"«Campione d'Europa. Alleno da una vita: notti così se ne contano sulle dita di una mano. Grazie per avermela fatta vivere.»"},
  {result:"euro",style:null,txt:"«Quello che avete fatto in Europa resta negli occhi di tutti. Ora la sfida più difficile: dimostrare che non è stato un lampo.»"},
  // PROMOTED
  {result:"promoted",style:"Offensivo",txt:"«Promossi! Volevamo giocare bene e segnare tanto — ci siamo riusciti. Ora si va in alto.»"},
  {result:"promoted",style:"Difensivo",txt:"«Solidità premiata. Non abbiamo regalato niente, e ora siamo nella lega che meritiamo.»"},
  {result:"promoted",style:null,txt:"«Promozione guadagnata sul campo. Stagione eccellente — la testa è già alla prossima categoria.»"},
  // GOOD SEASON (top half, no trophy)
  {result:"good",style:"Offensivo",txt:"«Stagione positiva. I numeri ci danno ragione — peccato per quei due punti persi a novembre. Avremmo potuto fare di più.»"},
  {result:"good",style:"Difensivo",txt:"«Buona stagione. Abbiamo concesso poco. Con un po' più di cinismo davanti potevamo puntare al titolo.»"},
  {result:"good",style:"Pressing",txt:"«Intensità alta per tutta la stagione. I risultati ci hanno sorriso — con qualche rimpianto qua e là.»"},
  {result:"good",style:null,txt:"«Stagione discreta. Hai lavorato bene. Ricarichiamo le pile e prossima stagione puntiamo più in alto.»"},
  // SURVIVAL
  {result:"survival",style:null,txt:"«L'abbiamo portata a casa. Non era scontato. Poche parole, testa bassa e lavoro — così si resta in piedi.»"},
  {result:"survival",style:"Difensivo",txt:"«Ci siamo salvati con le unghie. La difesa ci ha tenuto vivi. Da qui costruiamo qualcosa di più solido.»"},
  // RELEGATED
  {result:"relegated",style:null,txt:"«Non ci sono scuse. Ho sbagliato anch'io. Ma la retrocessione non definisce chi sei — il prossimo anno rispondiamo sul campo.»"},
  {result:"relegated",style:"Offensivo",txt:"«Non è bastato segnare. Abbiamo preso troppi gol. Dobbiamo ripartire e lo faremo con più umiltà.»"},
  // HIGH TRUST bonus
  {result:"any",trustMin:80,txt:"«Qualunque cosa succeda — ti ringrazio. Sei uno dei giocatori su cui ho sempre potuto contare.»"},
];

// Sprint 100 — End-of-season president dialogs
const SEASON_END_PRESIDENT=[
  /* [collaudo PO «il presidente spara solo cazzate, mi sto ritirando»] RIGHE D'ADDIO: a chi ha annunciato
     il ritiro il presidente non promette «qualcosa di speciale — ne parliamo presto» (un rinnovo che non
     esiste): lo CONGEDA. Il picker le preferisce quando retireAnnounced===season e le esclude altrimenti. */
  {retire:true,result:"champion",txt:"«Campione, all'ultimo giro. Non ho contratti da offrirti stavolta — solo la gratitudine di un club intero. Prepareremo un addio all'altezza di quello che hai dato: questa maglia, per te, sarà sempre casa.»"},
  {retire:true,result:"any",txt:"«Si chiude una carriera che ha onorato questo club e questo sport. Qualunque cosa dica la classifica di oggi, ti saluto a nome di tutti: le leggende non firmano rinnovi — lasciano il segno.»"},
  {retire:true,result:"any",txt:"«Da domani lo stadio avrà un tifoso in più e il campo un campione in meno. Grazie di tutto: quando vorrai tornare, qui troverai sempre una porta aperta.»"},
  // CHAMPION
  {result:"champion",objMet:true,txt:"«Campioni! Ho firmato un'estensione del contratto del mister stamattina. Per te ho già pronto qualcosa di speciale — ne parliamo presto.»"},
  {result:"champion",objMet:false,txt:"«Titolo vinto, obiettivi superati. Non sempre succede così — goditi questo momento. Il club ti è riconoscente.»"},
  // PROMOTED
  {result:"promoted",txt:"«Promozione! Il club fa un salto di categoria. Stiamo pianificando investimenti — voglio che tu sia il punto di riferimento anche lassù.»"},
  // OBJECTIVES MET
  {result:"good",objMet:true,txt:"«Obiettivi raggiunti. Il consiglio di amministrazione è soddisfatto. La tua posizione nel club è più solida che mai.»"},
  {result:"good",objMet:true,prestige:"high",txt:"«Hai rispettato gli impegni in un contesto difficile. Un club come il nostro non dimentica chi mantiene la parola.»"},
  // OBJECTIVES MISSED
  {result:"good",objMet:false,txt:"«Stagione sufficiente — ma sufficiente non è quello per cui questo club paga. La prossima stagione mi aspetto qualcosa in più.»"},
  {result:"good",objMet:false,prestige:"high",txt:"«In un club della nostra dimensione non possiamo permetterci stagioni ordinarie. Valuterei la situazione con attenzione.»"},
  // EUROPA CONQUISTATA SUL CAMPO [7.285.0 #107 collaudo PO «presidente troppo severo o mi sbaglio?»]
  {result:"europe",objMet:true,txt:"«L'Europa. Sa cosa significa per questa società? Botteghino, sponsor, ragazzi che ora vogliono venire qui. Ha fatto una cosa grande, e il club se la ricorda.»"},
  {result:"europe",objMet:false,txt:"«Qualche numero personale non è arrivato, e lo sa meglio di me. Ma ci ha portati in Europa: è di questo che parlerà la gente per tutta l'estate, ed è di questo che parlo io.»"},
  {result:"europe",prestige:"high",objMet:true,txt:"«L'Europa, per un club come il nostro, è il punto di partenza. L'abbiamo centrata: adesso viene il difficile, cioè restarci ogni anno. Conto su di lei.»"},
  // SURVIVAL
  {result:"survival",txt:"«Ci siamo salvati, ma non è stata una bella stagione. Il mercato di riparazione sarà importante — preparati a qualche cambiamento.»"},
  {result:"survival",txt:"«Stagione senza scossoni. Per quest'anno può bastare: dal prossimo voglio vedere questa squadra guardare in alto, non alle spalle.»"},
  // RELEGATED
  {result:"relegated",txt:"«La retrocessione è un fallimento collettivo. Non cerco colpevoli oggi — ma l'anno prossimo voglio vedere una risposta di carattere.»"},
  {result:"relegated",prestige:"high",txt:"«Questa non è una situazione accettabile per un club come il nostro. Ci aspetta un anno di sacrifici. Spero tu sia della partita.»"},
  // CUP WINNER
  {result:"cup",txt:"«La Coppa è nostra! Un trofeo è sempre un trofeo. Questo club ha una storia e tu stai contribuendo a costruirla.»"},
  // EURO — TROFEO CONTINENTALE VINTO [7.285.0] (era liquidato con «ha dato visibilità al club. Bene così»)
  {result:"euro",txt:"«In questa bacheca una coppa europea non c'era mai stata. Adesso c'è, e sopra c'è anche il suo nome. Qualunque cosa succeda da qui in avanti, quello non glielo toglie nessuno.»"},
  {result:"euro",prestige:"high",txt:"«L'Europa era l'unica cosa che ci mancava per dire di essere tornati davvero. Grazie. E adesso non facciamola diventare un'eccezione.»"},
];

// Sprint 100 — President opening speech variants
function getPresidentOpeningQuote(player){
  const s=player.season||1;
  const ct=player.coachTrust||50;
  const pop=player.popularity||0;
  const isFirstSeason=s<=1;
  const wasChamp=(player.trophies||[]).some(t=>t.season===(s-1));
  const wasRelegated=false; // can't know easily without prev season data
  const isHighPrestige=(player.club?.p||60)>=80;
  const objs=player.seasonObjectives||[];
  const pool=[];
  if(isFirstSeason)pool.push(
    "«Sei qui perché ci crediamo. Dimostraci che avevamo ragione.»",
    "«Benvenuto in questa famiglia. Non tollero chi non dà il massimo.»",
    "«Ho visto i tuoi dati. Ora voglio vedere i risultati sul campo.»"
  );
  if(wasChamp)pool.push(
    "«Da campioni in carica le aspettative sono ancora più alte. Non deludermi.»",
    "«Difendere il titolo è più difficile che conquistarlo. Lo sappiamo entrambi.»"
  );
  if(isHighPrestige&&!isFirstSeason)pool.push(
    "«Un club come il nostro non può permettersi stagioni mediocri. Sii all'altezza.»",
    "«Hai scelto la piazza giusta. Ora dimostra di meritarla ogni settimana.»"
  );
  if(ct>=75)pool.push(
    "«Il mister mi parla bene di te. Non voglio che cambi nulla — anzi, voglio di più.»"
  );
  if(pop>=60)pool.push(
    "«I tifosi ti amano. È una responsabilità, non un privilegio. Ricordatelo.»"
  );
  if(s>=4)pool.push(
    "«Conosci già questo club. Sa già di cosa sei capace. È il momento di fare il salto di qualità.»"
  );
  pool.push(
    "«Questa stagione mi aspetto risultati concreti. Non deludermi.»",
    "«Gli obiettivi sono chiari. Il resto lo decidi tu sul campo.»",
    "«Ho messo risorse su questo progetto. Ora è il tuo turno di dare.»",
    "«Semplice: lavora, segna, vinci. Il club fa il resto.»"
  );
  return pool[hashStr((player.name||"x")+String(s))%pool.length];
}

const ACHIEVEMENTS=[
  // Scoring
  {id:"hattrick",icon:"🎩",name:"Hat-Trick",desc:"3 gol in una partita",cat:"⚽ Gol"},
  {id:"perfect",icon:"🌟",name:"Prestazione Perfetta",desc:"Voto 10 in una partita",cat:"⚽ Gol"},
  {id:"streak5",icon:"🔥",name:"Serie Fuoco",desc:"Gol in 5 partite consecutive",cat:"⚽ Gol"},
  {id:"freekick",icon:"🎯",name:"Specialista Punizioni",desc:"10 assist totali in carriera",cat:"⚽ Gol"},
  // Career
  {id:"debut_pro",icon:"🎽",name:"Esordio Pro",desc:"Prima partita da professionista",cat:"🏟️ Carriera"},
  {id:"captain",icon:"🤝",name:"Leader",desc:"CoachTrust ≥ 90",cat:"🏟️ Carriera"},
  {id:"veteran",icon:"🏅",name:"Veterano",desc:"5 stagioni da pro",cat:"🏟️ Carriera"},
  {id:"loyal",icon:"❤️",name:"Fedele",desc:"3 stagioni nello stesso club",cat:"🏟️ Carriera"},
  // Trophies
  {id:"first_trophy",icon:"🏆",name:"Primo Trofeo",desc:"Vinci il primo campionato",cat:"🏆 Trofei"},
  {id:"double",icon:"🥇",name:"Double",desc:"Vinci campionato + coppa nella stessa stagione",cat:"🏆 Trofei"},
  {id:"dynasty",icon:"👑",name:"Dinastia",desc:"3 campionati",cat:"🏆 Trofei"},
  // National
  {id:"first_cap",icon:"🌍",name:"Esordio Nazionale",desc:"Prima convocazione",cat:"🌍 Nazionale"},
  {id:"world_class",icon:"⭐",name:"World Class",desc:"20 presenze in Nazionale",cat:"🌍 Nazionale"},
  // Fitness / Stats
  {id:"iron",icon:"💪",name:"Fisico di Ferro",desc:"Fisico ≥ 85",cat:"📊 Stats"},
  {id:"speed_demon",icon:"⚡",name:"Fulmine",desc:"Velocità ≥ 90",cat:"📊 Stats"},
  {id:"technician",icon:"🎭",name:"Tecnico Puro",desc:"Tecnica ≥ 88",cat:"📊 Stats"},
  {id:"mental",icon:"🧠",name:"Mentalità Vincente",desc:"Mentalità ≥ 85",cat:"📊 Stats"},
  // Match moments
  {id:"comeback",icon:"🔄",name:"Rimonta",desc:"Vinci una partita mentre perdevi",cat:"🎮 Match"},
  {id:"derby_hero",icon:"🔥",name:"Eroe del Derby",desc:"Segna in un derby",cat:"🎮 Match"},
  {id:"clutch",icon:"⏱️",name:"Uomo Clutch",desc:"Gol all'80° o oltre",cat:"🎮 Match"},
  {id:"rigore_ok",icon:"🎯",name:"Rigorista",desc:"Segna 3 rigori",cat:"🎮 Match"},
  // Growth
  {id:"growth_10",icon:"📈",name:"Crescita",desc:"Aumenta OVR di 10 in una stagione",cat:"📈 Crescita"},
  {id:"golden_form",icon:"✨",name:"In Forma d'Oro",desc:"Forma ≥ 90 per una settimana",cat:"📈 Crescita"},
  // Longevity
  {id:"age_35",icon:"🎂",name:"Immortale",desc:"Gioca oltre i 35 anni",cat:"🏟️ Carriera"},
  {id:"seasons_10",icon:"📅",name:"Decennio",desc:"10 stagioni totali",cat:"🏟️ Carriera"},
  // [7.8.21 collaudo tester «crea nuove milestone ed achievement»] nuovi obiettivi sbloccabili
  {id:"poker",icon:"🃏",name:"Poker",desc:"4 gol in una partita",cat:"⚽ Gol"},
  {id:"manita",icon:"🖐️",name:"Manita",desc:"5 gol in una partita",cat:"⚽ Gol"},
  {id:"playmaker",icon:"🅰️",name:"Regista",desc:"3 assist in una partita",cat:"⚽ Gol"},
  {id:"all_round",icon:"🎪",name:"Uomo Ovunque",desc:"Gol e assist nella stessa partita",cat:"🎮 Match"},
  {id:"goleador",icon:"🎉",name:"Goleador",desc:"Vinci con 4+ gol di scarto",cat:"🎮 Match"},
  {id:"assist_50",icon:"🎨",name:"Rifinitore",desc:"50 assist in carriera",cat:"⚽ Gol"},
  {id:"bomber_100",icon:"💣",name:"Centurione del Gol",desc:"100 gol in carriera",cat:"⚽ Gol"},
  {id:"marathon",icon:"🏃",name:"Maratoneta",desc:"200 presenze in carriera",cat:"🏟️ Carriera"},
  {id:"nat_scorer",icon:"🎖️",name:"Bomber Azzurro",desc:"Segna con la Nazionale",cat:"🌍 Nazionale"},
];

/* ========================================
   SITUATIONS  (con moveZone e startZone)
======================================== */
// tactic = {pressure:"none"|"low"|"medium"|"high", support:0-4, nearby_def:0-5, lanes:[...], box:{att,def,near,far}}
// Il campo tactic è opzionale (default null) — backward-compatible con tutte le S() esistenti.
// cappedMM e filterSitActions lo consumano in modo data-driven (4.80.0: euristica testuale rimossa, tutte le entry annotate).
// ENGINE Step 1 (migrazione a INTENZIONE) — deriveIntent classifica la situation in ciò che il giocatore
//   STA TENTANDO (intento), dalla STRUTTURA e dal CONTESTO (zone, type, tactic, parole-contesto come
//   "cross"/"corner"/"filtrante"), MAI dalle parole d'esecuzione ("teso"/"a giro"/"rovesciata").
//   Taxonomy: penalty·freekick·recover·anticipate·intercept·cross·through·dribble·onetwo·insertion·shot·
//   progression·switch. È la SORGENTE UNICA dell'intenzione; l'esecuzione la decide poi il Decision Engine.
function deriveIntent(sit, act){
  if(sit&&sit.intent)return sit.intent;/* [7.45.0 Sprint 6 — R1b] l'intento è BAKATO alla costruzione (S() lo
     congela in obj.intent PRIMA che questo campo esista → lì gira la regex, una volta sola al load): a runtime
     si ritorna il valore CONGELATO — nessuna ri-lettura di sit.text nel loop di gioco. Equivalenza per
     costruzione (stessa funzione, stesso testo) → golden/fingerprint invariati la provano. */
  const txt=((sit&&sit.text)||"").toLowerCase();
  const z=sit&&sit.zones&&sit.zones[0];
  const tac=(sit&&sit.tactic)||{}, lanes=tac.lanes||[];
  if(tac.it)return tac.it;// 5.39.0 INTENT-DECOUPLE: override esplicito dell'intent → consente il fine-tuning dei TESTI senza spostare l'intent (zero-diff finché nessuna situation lo usa). Pattern di deriveBallState/deriveSitCine (tactic.bs/tactic.cn).
  const stats=((sit&&sit.actions)||[]).map(a=>a&&a.stat);
  const has=(s)=>stats.indexOf(s)>=0;
  if(/rigore/.test(txt))return "penalty";
  if(/unizione/.test(txt))return "freekick";
  if(sit&&sit.type==="def"){ if(/anticip/.test(txt))return "anticipate"; if(/intercett/.test(txt))return "intercept"; return "recover"; }
  if(/cambio (di )?gioco|allarga|apri il gioco|ribalta/.test(txt))return "switch";
  // intenti DISTINTIVI prima (validi in qualsiasi zona)
  if(/filtrant|imbucat|verticale|in profondità|profondo|taglio|lancio/.test(txt))return "through";
  if(/uno-?due|dai e vai|triangol|combinazion|scarico/.test(txt))return "onetwo";
  if((has("dribbling")&&!has("tiro"))||/dribbl|salta l'uomo|punta l'uomo|finta|sombrero|tunnel/.test(txt))return "dribble";
  // CROSS = batti il cross (dalla FASCIA), non in area; "cross in area" è un inserimento, gestito sotto
  if(z==="fascia"||lanes.some(l=>/overlap|wide|fascia/.test(l))||(/cross|traversone|crossa|dal fondo|sulla fascia/.test(txt)&&z!=="area"))return "cross";
  // AREA = inserimento se arriva un pallone aereo (cross/corner/mischia/stacco), altrimenti conclusione a terra
  if(z==="area"){ if(/cross|corner|calcio d'angolo|mischia|rimbalzo|spizz|secondo palo|primo palo|\bstacco\b|colpo di testa/.test(txt)||tac.box)return "insertion"; return "shot"; }
  if(z==="bordo")return "shot";
  // [6.51.0 collaudo PO «tentativo di tiro da oltre metà campo, assurdo!»] la guardia progression cercava la
  //   label "centrocampo" — MAI presente nei dati (le zone di metà campo/propria metà sono "centro"/"propria"/
  //   "difesa") → una situation di COSTRUZIONE a centrocampo con un'azione a stat "tiro" (es. la "Sventagliata"
  //   di «Ricezione di spalle e giratone») cadeva su has("tiro")→shot, oppure sul default finale shot → intro
  //   "Tentativo di tiro" dalla propria metà. Ora le zone di NON-attacco sono progression (un tiro in porta dalla
  //   propria metà non esiste): "centro"/"propria"/"difesa" + i vecchi centrocampo/trequarti.
  if(z==="centro"||z==="centrocampo"||z==="trequarti"||z==="propria"||z==="difesa"||/progress|avanza|conduzione|riparti|contropiede/.test(txt))return "progression";
  if(has("tiro"))return "shot";
  if(has("passaggio"))return "onetwo";
  if(has("dribbling"))return "dribble";
  return "shot";
}
