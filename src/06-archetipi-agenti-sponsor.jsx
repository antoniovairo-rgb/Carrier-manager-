/* ========================================================================
 * KORWARD ELITE — frammento n° 06  (dei 20, numerati da 00 a 19)
 * src/06-archetipi-agenti-sponsor.jsx
 *
 * ARCHETIPI · ALLENAMENTO · PROCURATORE · SPONSOR
 *
 * ARCHETYPE_STAT_BONUS e la matematica dell’allenamento (TRAIN_BASE_EFF e dintorni),
 * tutto il comparto procuratore (AGENT_ARCHETYPES, AGENT_AMBITIONS, AGENT_NAME_POOL,
 * le battute di intro / check-in / iniziativa / suggerimento), CLUB_SPONSOR_POOL,
 * ARCHETYPES, NPC_PERSONAS e NEWSPAPERS.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 4029-4857   ·   829 righe di 41427
 * La prima riga dopo questa intestazione è la riga 4029 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 4004 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
// Sprint 107: bonus successo per archetipo sulle stat di elezione
const ARCHETYPE_STAT_BONUS={
  bomber:      {tiro:0.06,fisico:0.04,posizionamento:0.05},
  fantasista:  {tecnica:0.06,dribbling:0.05,passaggio:0.04},
  velocista:   {velocità:0.07,dribbling:0.05,fisico:0.03},
  trequartista:{passaggio:0.07,tecnica:0.05,mentalità:0.04},
  leader:      {mentalità:0.06,fisico:0.05,posizionamento:0.03},
  centravanti: {tiro:0.05,posizionamento:0.05,tecnica:0.04},
  enfant:      {tecnica:0.03,velocità:0.03,tiro:0.02,dribbling:0.02,mentalità:0.02,passaggio:0.02,fisico:0.01,posizionamento:0.01},
  tuttocampista:{tiro:0.02,tecnica:0.02,velocità:0.02,fisico:0.02,mentalità:0.02,passaggio:0.02,dribbling:0.02,posizionamento:0.02},
};
function succRate(action,stats,playerX,oppPrestige=65,archetypeId=null){
  const sv=stats[action.stat]||60;
  // Stat-driven base: high-skill players feel the difference
  const base=(sv/99)*0.52+0.09+(action.bon||0)*0.006+(playerX-50)/100*0.04;
  // Meaningful difficulty penalty — [6.83.0 collaudo PO «ancora troppo semplice»]: secondo scaglione dopo
  //   il /180→/160 di 6.78 — /160→/145 (a p=90 il malus passa da −21.9% a −24.1%; a p=65 quasi invariato)
  const diffPenalty=Math.max(0,(oppPrestige-55)/135);/* [6.87.0 collaudo PO «ancora di più»] terzo scaglione: /145→/135 (a p=90: −24.1%→−25.9%) */
  // Sprint 107: archetype bonus on matching stat
  const arcBonus=archetypeId?(ARCHETYPE_STAT_BONUS[archetypeId]?.[action.stat]||0):0;
  // Cap 0.84→0.82 [6.78.0] →0.79 [6.83.0] →0.76 [6.87.0]: anche l'élite conserva un margine d'errore reale
  return Math.round(clamp(base-diffPenalty+arcBonus,0.05,0.76)*100);
}
// xG per chance quality: position × action difficulty × stat type
function calcXG(action,playerX){
  if(!["goal","assist"].includes(action.rew||""))return 0;
  const posFactor=Math.pow(Math.max(playerX,30)/100,1.8);
  const statBase=action.stat==="tiro"?0.28:0.16;
  const diffFactor=clamp(1+(action.bon||0)*0.015,0.35,1.25);
  return Math.round(clamp(statBase*posFactor*diffFactor,0.01,0.92)*100)/100;
}
// Adaptive difficulty: returns a 0-1 multiplier that makes opponent harder when player is performing well
// [5.80.0 BIL-2] adaptive SOLO anti-farm (gpg): i malus su OVR alto e MORALE alto sono RIMOSSI —
//   cancellavano la crescita (un 90 prolifico e un 65 mediocre avevano la stessa % di successo: 43.3 vs 43.2)
//   e punivano il giocatore per stare bene. Il vantaggio delle stat ora resta netto.
function adaptiveDifficulty(player){
  /* [7.261.0 audit del batch simulazioni — DECISIONE MISURATA, non svista] l'anti-farm resta sull'AGGREGATO
     di stagione (gare giocate + simulate). Provata e SCARTATA la variante «solo vissuto dal vivo»: sembra più
     corretta in teoria (il farming lo fai dal vivo) ma è più SEVERA in pratica — su un profilo misto (17 gare
     live a 1.1 gpg + 17 simulate) porta la difficoltà da ×1.00 a ×1.21, cioè punisce chi simula proprio mentre
     il proprietario chiedeva meno severità. Con l'aggregato le simulate (gpg più basso del vivo) possono solo
     ABBASSARE il fattore: simulare non rende mai più dure le partite giocate. Asserito dal guardiano. */
  const gpg=(player.goals||0)/Math.max(player.matches||1,1);
  let factor=1.0;
  if(gpg>1.2)factor+=0.34;// [6.78.0] · [6.83.0] · [6.87.0 collaudo PO «ancora di più»] 0.28→0.34/0.17→0.21: i bomber prolifici trovano difese vere
  else if(gpg>0.8)factor+=0.21;
  return clamp(factor,0.85,1.38);
}
// [5.80.0 BIL-1] moltiplicatore d'ETÀ sull'efficacia del training: un 38enne non si allena come un 17enne.
//   È il pezzo che crea la PARABOLA della carriera — prima il training (+~12 stat/anno anche a 88+) sovrastava
//   un decay di fine stagione ≤1.3 e l'OVR non scendeva MAI.
// [5.80.0 BIL-1] damper globale dell'efficacia training (0.40): il piano auto-ottimale sulle 2 stat più
//   deboli restava sempre sul gradino alto della curva _dim → +9/10 OVR a stagione e OVR 90 sistematico alla
//   S5 (22 anni). Validato con simulazione a 60 run: ora 62→~76 a 21, ~84 a 25, picco ~90-92 a 29-31, poi
//   declino dolce — il criterio §10 della spec («crescita credibile, 2-3 stagioni di gavetta») torna vero.
const TRAIN_BASE_EFF=0.40;
function trainAgeMult(age){const a=age||18;return a<=26?1.0:a<=28?0.75:a<=30?0.55:a<=33?0.25:0.06;}
// [5.80.0 MIN-8] Enfant Prodige: la «crescita x2» promessa alla creazione ora è VERA (×1.35 fino ai 22)
function archGrowthMult(p){const id=p&&(p.archetype?.id||p.archetype);return(id==="enfant"&&((p&&p.age)||18)<23)?1.35:1;}
// [5.80.0 BIL-10] valore di mercato = f(OVR, età, forma, popolarità), ricalcolato ogni settimana con
//   smoothing 70/30 (gli eventi continuano a dare colore, i fondamentali tirano). Scala legacy (~0.3–5 "M€").
function calcMarketValue(p){
  const ovr=(p&&p.ovr)||60,age=(p&&p.age)||18;
  /* [7.40.1 collaudo PO «il valore di mercato è troppo basso!»] la vecchia curva SATURAVA a ~6M€ (a OVR 90
     dava ~5.5M) e IGNORAVA le prestazioni: un bomber da 36 gol/stagione, 6 volte Giovane dell'Anno, valeva 4.3M.
     Curva RIVISTA su ancore di mercato realistiche (pre-moltiplicatori): 60→~0.9M · 70→~5.6M · 75→~12M ·
     80→~22M · 85→~39M · 90→~62M · 95→~95M; età, forma, popolarità E PRODUZIONE (gol+assist stagionali,
     proiettati su 38 settimane) la modulano — le prestazioni CONTANO (±10%→+50%). Deterministico. */
  const base=0.5+Math.pow(Math.max(0,ovr-50)/10,3.6)*0.42;
  const ageM=age<=21?1.35:age<=24?1.22:age<=27?1.05:age<=30?0.78:age<=33?0.45:0.25;
  const formM=0.92+(((p&&p.form)||60)-60)/250;
  const popM=0.92+((p&&p.popularity)||30)/400;
  const _wk=Math.max(6,(p&&p.week)||38);
  const _ga38=(((p&&p.goals)||0)+0.5*((p&&p.assists)||0))*(38/_wk);
  const prodM=clamp(0.9+_ga38*0.014,0.85,1.5);
  return Math.max(0.15,Math.round(base*ageM*formM*popM*prodM*100)/100);
}
// opponent strength affects goal probability in background events
// [5.77.0 MOT-1] oppGoalProb RIMOSSA: era dead code (mai chiamata) — la sua missione (gol avversari legati
//   alla forza delle squadre) è ora svolta davvero da bgMicroTick (~6311), seedato e attuato nel tick di playing.
// Returns clubs from player's current league (for standings + opponents)
function getLeagueClubs(player){
  const isU18=(player?.proStatus||"u18")==="u18"||(player?.club?.isU18&&!player?.club?.transferType);
  if(isU18||!player?.club){
    if(player?.club?.lg==="Primavera 2")return U18_CLUBS_P2;
    return U18_CLUBS;
  }
  const lg=player.club.lg||player.club.league;
  const ov=player.leagueOverrides||{}; // Sprint 84: respect dynamic promotion/relegation overrides
  if(lg){let lc=CLUBS.filter(c=>ov[c.id]?ov[c.id]===lg:c.lg===lg);
    if(lc.length>18){ // Sprint TC: cap difensivo — override corrotti (save vecchi) non gonfiano la lega oltre 18, club dell'eroe sempre incluso
      const myId=player.club.id;
      const mine=lc.filter(c=>c.id===myId),rest=lc.filter(c=>c.id!==myId).sort((a,b)=>(b.p||0)-(a.p||0));
      lc=[...mine,...rest].slice(0,18);
    }
    if(lc.length>=4)return lc;}
  const nat=player.club.nat;
  if(nat){let nc=CLUBS.filter(c=>c.nat===nat);
    if(nc.length>18){ // [6.28.0] CAP DIFENSIVO: una nazione ha 36 club (Lega A+B) → senza cap la lega esplodeva a 36 squadre mescolando due divisioni. Club dell'eroe sempre incluso, poi i più forti fino a 18.
      const myId=player.club.id;const mine=nc.filter(c=>c.id===myId),rest=nc.filter(c=>c.id!==myId).sort((a,b)=>(b.p||0)-(a.p||0));nc=[...mine,...rest].slice(0,18);}
    if(nc.length>=4)return nc;}
  return CLUBS.slice(0,16);
}
// contextual start position: player spawns inside the situation zone
function getStartPos(sit){
  const sz=sit?.startZone||{x:[55,72],y:[30,70]};
  return{x:rng(sz.x[0],sz.x[1]),y:rng(sz.y[0],sz.y[1])};
}
// Durata DINAMICA del post-highlight (ms) — funzione pura di esito+azione (deterministica, testabile).
// Garantisce che la palla atterri (archi ≤1.2s) e lo slow-mo (1.6s) si concluda, + tempo di lettura.
// Esposta a window.__CPM_RESULT_DUR in test mode per la validazione della durata.
function postHighlightDuration(outcome,action){
  const k=outcome&&outcome.outKey, lbl=((action&&action.label)||"").toLowerCase();
  // [7.8.24 collaudo tester «l'esito anticipa la simulazione 3D — prendi tempo, non frenetico»] finestre PIÙ AMPIE
  //   così il 3D dell'azione ha tempo di svolgersi PRIMA che l'esito si riveli, e l'esito resta leggibile. Restano
  //   entro il cap [1800,4000] del check post-highlight (dur = questa + min(revealMs*0.5, 950)).
  let d=2550; // base: copre arco breve + slow-mo + lettura
  if(k==="goal")d=3050;                                          // celebrazione gol
  else if(/cucchiaio|pallonetto|chip|panenka|rovesciat|sforbiciat/.test(lbl))d=3000; // conclusioni lente/acrobatiche
  else if(k==="miss_easy"||k==="goal_against")d=2850;            // errore/gol subito: lascia leggere
  else if(k==="assist"||k==="chance"||k==="miss")d=2800;
  else if(k==="recovery"||k==="save"||k==="intercept"||k==="through")d=2550;
  return d;
}
// Transfer credibility score: prevents absurd offers (U18 → elite clubs)
function transferCredibility(playerOvr,playerSeasons,playerMatches,clubPrestige,currentPrestige){
  // Gap between club prestige and player level
  const playerLevel=clamp(playerOvr*0.9+playerSeasons*3+Math.min(playerMatches,50)*0.2,30,99);
  const gap=clubPrestige-playerLevel;
  if(gap>22)return false; // club way too prestigious
  if(clubPrestige>88&&playerOvr<74)return false; // elite clubs don't sign low-OVR players
  if(clubPrestige>92&&playerOvr<79)return false;
  if(clubPrestige>95&&playerOvr<84)return false;
  if(playerSeasons<=1&&clubPrestige>72)return false; // no elite interest in first season
  if(playerSeasons<=2&&clubPrestige>82)return false;
  return true;
}
// Sprint 133: unified wage helpers — annual € from OVR, weekly from OVR+prestige, formatted string
function _ovrToAnnualWage133(ovr){
  const o=clamp(ovr||60,50,99);
  if(o<=55)return 60000;
  if(o<60)return 60000+(o-55)*12000;    // 60k–120k
  if(o<65)return 120000+(o-60)*26000;   // 120k–250k
  if(o<70)return 250000+(o-65)*90000;   // 250k–700k
  if(o<75)return 700000+(o-70)*260000;  // 700k–2M
  if(o<80)return 2000000+(o-75)*600000; // 2M–5M
  if(o<85)return 5000000+(o-80)*1000000;// 5M–10M
  if(o<90)return 10000000+(o-85)*1000000;// 10M–15M
  if(o<95)return 15000000+(o-90)*1000000;// 15M–20M
  return 20000000;
}
function _ovrToWageWeekly133(ovr,prestige){
  const annual=_ovrToAnnualWage133(ovr||60);
  const p=prestige||60;
  const pm=p>=90?1.4:p>=80?1.2:p>=70?1.0:p>=60?0.85:p>=50?0.70:0.55;
  return Math.round(clamp(annual*pm,0,20000000)/52);
}
function _fmtWageY133(weeklyWage){
  const a=(weeklyWage||0)*52;
  return a>=1000000?`€${Math.round(a/100000)/10}M`:a>=1000?`€${Math.round(a/100)/10}k`:`€${Math.round(a)}`;
}
// [7.131.0 collaudo PO «gestire gli sponsor sulla maglia… aumentare i ricavi della squadra → grandi acquisti/investimenti»]
//   SPONSOR DI MAGLIA del club (economia completa): accordo PLURIENNALE che versa l'annuale nel budget del club
//   (clubEvo.budget), scala con prestigio + divisione, premia i traguardi. Deterministico (seed club + stagione d'inizio).
/* ========================================================================
   [7.374.0 direttiva PO «evoluzione completa del sistema Procuratore»] R1 — LA RELAZIONE.
   Regola #1 del PO: nessuna regressione. Percio' qui non si tocca NIENTE di cio' che gia'
   funziona — `hasAgent` resta la sorgente di verita' per tutta la logica esistente (commissione,
   `agentPlanFor`, `agentTask`, `agentMult`, i sei eventi settimanali condizionati). Questo blocco
   aggiunge, ACCANTO, cio' che mancava davvero: chi e' il procuratore, che rapporto avete, e cosa
   si ricorda di te. Se `player.agent` non c'e' — salvataggi vecchi — ogni funzione qui degrada a
   un valore neutro e il gioco si comporta esattamente come prima.
   Tutto puro e testabile in node, come `goalContext`/`pickCelebration`: e' cio' che permettera'
   di aggiungere procuratori e consigli senza rimettere le mani nell'UI.
======================================================================== */

/* Gli archetipi (§18). La personalita' NON e' una statistica da mostrare: e' un insieme di
   inclinazioni che piu' avanti piegheranno consigli e opportunita'. `req` e' la soglia di
   carriera a cui quel procuratore ti prende in considerazione (§20). */
const AGENT_ARCHETYPES=[
  {id:"prudente",     nome:"Prudente",      desc:"Prima la continuita': minuti, fiducia, un posto sicuro.",
   forte:"stabilita' e minuti",        req:{pop:0,  val:0},    bias:{mercato:-0.35,soldi:-0.10,sponsor:-0.15,restare:0.40}},
  {id:"economico",    nome:"Economico",     desc:"Il contratto prima di tutto: se vali di piu', devi guadagnare di piu'.",
   forte:"contratti e stipendio",      req:{pop:12, val:1.5},  bias:{mercato:0.10, soldi:0.45, sponsor:0.05, restare:0.05}},
  {id:"commerciale",  nome:"Commerciale",   desc:"La tua immagine e' un patrimonio: sa a chi farla vedere.",
   forte:"sponsor e immagine",         req:{pop:25, val:2.5},  bias:{mercato:0.05, soldi:0.20, sponsor:0.50, restare:0.05}},
  {id:"ambizioso",    nome:"Ambizioso",     desc:"Punta in alto e ha fretta: i grandi club, adesso.",
   forte:"grandi club",                req:{pop:35, val:6},    bias:{mercato:0.45, soldi:0.15, sponsor:0.10, restare:-0.30}},
  {id:"internazionale",nome:"Internazionale",desc:"Conosce l'estero meglio di casa propria.",
   forte:"mercato estero",             req:{pop:45, val:10},   bias:{mercato:0.35, soldi:0.20, sponsor:0.20, restare:-0.15}},
];
const AGENT_ARCH_BY_ID=(id)=>AGENT_ARCHETYPES.find(a=>a.id===id)||null;

/* Le ambizioni che l'Eroe puo' dichiarare (§9). Sono le CHIAVI della memoria: il procuratore non
   ricorda le frasi, ricorda cosa conta per te. */
const AGENT_AMBITIONS=[
  {id:"trofei",   label:"Vincere qualcosa di importante"},
  {id:"champions",label:"Arrivare in Champions"},
  {id:"soldi",    label:"Guadagnare il piu' possibile"},
  {id:"titolare", label:"Giocare sempre, ovunque"},
  {id:"crescita", label:"Crescere come giocatore"},
  {id:"fama",     label:"Diventare un nome che tutti conoscono"},
  {id:"nazionale",label:"Vestire la maglia della Nazionale"},
  {id:"estero",   label:"Provare un campionato straniero"},
  {id:"fedelta",  label:"Restare legato a questo club"},
];

/* [7.375.0 Procuratore R2 §2 «quando raggiunge per la prima volta il denaro necessario, il gioco
   DEVE ricordarglielo»] IL COSTO ESISTE GIA': `max(500€, stipendio settimanale)` sul saldo, la
   stessa formula della card d'ingaggio. Qui non nasce nessuna valuta e nessun costo nuovo — si
   rende ATTIVA una condizione che il gioco gia' calcolava e teneva per se'.
   Puro: nessun effetto, nessuno stato. Chi chiama decide cosa farne. */
/* [7.375.0 R2] IL POOL DEI NOMI, in un posto solo. Era duplicato: dichiarato dentro il render del
   tab Procuratore e ricopiato nella migration. Ora e' qui e lo leggono entrambi — cambiare un nome
   in futuro non deve poter far cambiare procuratore a chi ce l'ha gia'. */
const AGENT_NAME_POOL=["Marco Gestini","Luigi Pastore","Gianni Ferretti","Roberto Manconi","Fabio Lanzi","Sergio Donato","Andrea Turati","Claudio Venturi"];
function agentNameFor(p){try{return AGENT_NAME_POOL[Math.abs(hashStr((p&&p.name)||"x"))%AGENT_NAME_POOL.length];}catch(_e){return AGENT_NAME_POOL[0];}}

/* L'INGAGGIO, in una funzione sola. Prima viveva inline dentro il bottone della card: da quando il
   reminder (§2) offre un secondo punto d'ingresso, avere due copie della stessa logica economica
   sarebbe il modo piu' rapido per farle divergere. Qui non cambia NIENTE di cio' che faceva —
   stesso onorario, stesso scalo dal saldo, stesso piano stagionale scritto subito — si aggiunge
   solo la RELAZIONE introdotta in R1 e si spegne il reminder. */
function agentHirePatch(p,fee,amb,archId,nomeSc){
  const _f=fee!=null?fee:agentHireFee(p);
  const _np={...p,hasAgent:true,bankBalance:Math.max(0,(p.bankBalance||0)-_f),
    agentHint:{...(p.agentHint||{}),due:null}};
  const _ar=archId||(p.agentStyle==="global"?"commerciale":"prudente");/* [7.379.0 R6] col catalogo l'archetipo lo sceglie l'Eroe; senza, resta la deduzione dello stile */
  /* [7.376.0 R3] l'ambizione dichiarata all'incontro entra SUBITO nella memoria: e' il primo
     ricordo della relazione, e da li' in avanti piega i consigli (R1 `agentAdvice`). */
  const _ag=(typeof agentInit==="function")?agentInit({id:_ar,arch:_ar,name:nomeSc||agentNameFor(p),season:p.season||1,week:p.week||1}):null;
  if(_ag&&amb&&typeof agentRemember==="function")_ag.memory=agentRemember(_ag.memory,{k:"ambizione",v:amb});
  return{..._np,
    agent:_ag||undefined,
    agentPlan:(typeof agentPlanFor==="function")?agentPlanFor(_np,p.season||1):null};
}
function agentHireFee(p){return Math.max(500,Math.round((p&&p.contract&&p.contract.wage)||0));}

/* Il reminder, con l'anti-spam della §12 dentro la regola invece che nell'UI: la prima volta si
   parla sempre, dopo un «non ora» si torna SOLO in un momento che lo giustifica (mercato aperto,
   contratto in scadenza, un club che si e' mosso, il primo sponsor arrivato), mai prima di dieci
   settimane e mai piu' di quattro volte in tutta la carriera. Un procuratore che te lo chiede ogni
   settimana non e' presente, e' molesto. */
function agentHintCheck(p){
  const _p=p||{};
  if(_p.hasAgent)return{due:null,fee:0};
  if((_p.proStatus||"u18")!=="pro")return{due:null,fee:0};
  const fee=agentHireFee(_p);
  if((+_p.bankBalance||0)<fee)return{due:null,fee};
  const h=_p.agentHint||{n:0,s:0,w:0};
  const s0=+_p.season||1,w0=+_p.week||1;
  if(!h.n)return{due:"first",fee};
  if(h.n>=4)return{due:null,fee};
  const dw=(s0-(+h.s||0))*38+(w0-(+h.w||0));
  if(dw<10)return{due:null,fee};
  const w=w0;
  if((w>=1&&w<=5)||(w>=19&&w<=23))return{due:"mercato",fee};
  if(_p.contract&&(+_p.contract.years||0)>0&&(+_p.contract.years||0)<=1)return{due:"rinnovo",fee};
  if(_p.transferListed)return{due:"interesse",fee};/* [7.378.0] correzione: in R2 qui si leggeva `transferOffer`, che e' stato di React e NON vive in `player` — il motivo «interesse» era codice morto e non si e' mai attivato. `transferListed` e' il segnale persistito che dice davvero «il mercato si sta muovendo per te». */
  if(Array.isArray(_p.sponsors)&&_p.sponsors.length>0&&!h.spSeen)return{due:"sponsor",fee};
  return{due:null,fee};
}
/* [7.376.0 Procuratore R3 §3 «l'ingaggio deve essere un piccolo evento narrativo, non click →
   pagamento → attivo»] LE QUATTRO STRADE CHE GLI PUOI DIRE.
   Le ambizioni sono nove (R1) ma proporle tutte trasformerebbe l'incontro in un questionario — che
   e' esattamente cio' che la direttiva vieta. Se ne offrono QUATTRO, scelte sul contesto reale
   dell'Eroe: a un ventenne in un club piccolo ha senso parlare di crescita e di posto da titolare,
   a un venticinquenne in una big di trofei e di Champions. Puro e deterministico: stesso giocatore,
   stesse strade — se ricarichi la partita non ti cambiano le opzioni sotto il naso. */
function agentIntroOptions(p){
  const _p=p||{};const eta=+_p.age||20,pres=(_p.club&&+_p.club.p)||60,pop=+_p.popularity||0;
  const byId=(id)=>AGENT_AMBITIONS.find(a=>a.id===id);
  const out=[];
  const push=(id)=>{const a=byId(id);if(a&&out.indexOf(a)<0)out.push(a);};
  /* una che parla di CAMPO, una di SOLDI, una di IDENTITA', una legata a dove sei ora:
     quattro direzioni diverse, non quattro sfumature della stessa. */
  if(pres>=78)push("champions");else if(pres>=68)push("trofei");else push("titolare");
  push("soldi");
  if(eta<=22)push("crescita");else if(pop>=35)push("fama");else push("nazionale");
  if(pres>=75)push("fedelta");else push("estero");
  while(out.length<4){const a=AGENT_AMBITIONS.find(x=>out.indexOf(x)<0);if(!a)break;out.push(a);}
  return out.slice(0,4);
}

/* La risposta del procuratore. Non e' un ringraziamento generico: cita la strada che hai scelto —
   ed e' la PRIMA prova, dentro la scena stessa, che quello che dici viene registrato (§5). */
const AGENT_INTRO_REPLY={
  champions:"Allora sappiamo dove stiamo andando. Per arrivarci ti serve la vetrina giusta, e quella la scelgo io con te.",
  trofei:"Vincere. Bene: e' l'unica cosa che alla fine resta scritta. Terro' d'occhio i club che lottano davvero per qualcosa.",
  titolare:"Giocare. E' la richiesta piu' onesta che un giocatore possa farmi: senza campo non esiste il resto. Su questo non transigo.",
  soldi:"Chiaro, e non c'e' niente di male a dirlo. Il mio lavoro e' che tu venga pagato per quello che vali, non un euro di meno.",
  crescita:"Diventare piu' forte. Allora certe offerte le rifiuteremo insieme, anche quando faranno gola.",
  fama:"Vuoi che il tuo nome pesi. Si costruisce dentro e fuori dal campo: della parte fuori mi occupo io.",
  nazionale:"La Nazionale. Si passa dalle prestazioni, ma anche dall'essere nel posto in cui ti guardano. Me lo segno.",
  estero:"Cambiare aria. Ho i contatti giusti: quando sara' il momento, sapremo dove guardare.",
  fedelta:"Restare. Se e' questo che vuoi, allora il mio lavoro e' farti stare qui alle condizioni che meriti.",
};
function agentIntroLine(p,name,ambId){
  const _n=name||"Il tuo procuratore";
  return{
    saluto:`Finalmente ci conosciamo. Ho seguito quello che hai fatto negli ultimi mesi e credo che ci sia molto margine per costruire qualcosa di importante.`,
    ruolo:`Da oggi mi occupo io di proteggere i tuoi interessi e di aiutarti a scegliere le opportunita' migliori.`,
    domanda:`Prima di iniziare, pero', voglio capire una cosa: che cosa vuoi davvero dalla tua carriera?`,
    risposta:AGENT_INTRO_REPLY[ambId]||"Me lo segno. Da qui in avanti ragioniamo insieme.",
    nome:_n,
  };
}
if(typeof window!=='undefined'){window.agentIntroOptions=agentIntroOptions;window.agentIntroLine=agentIntroLine;window.AGENT_INTRO_REPLY=AGENT_INTRO_REPLY;}

/* [7.377.0 Procuratore R4 §4 «ogni circa 4-5 mesi deve proporre spontaneamente un CHECK-IN, con
   una certa variabilita' per evitare che sembri un evento meccanico»] IL CONFRONTO.
   Quattro-cinque mesi su una stagione da 38 settimane sono ~16-20 settimane. La variabilita' NON e'
   casuale — sarebbe irriproducibile e romperebbe il determinismo su cui gira tutto il resto: e'
   derivata dal giocatore e da quanti confronti avete gia' avuto, cosi' due carriere diverse hanno
   ritmi diversi ma la STESSA carriera si comporta sempre allo stesso modo.
   E non si parla mai appena firmato: dopo l'incontro d'ingaggio servono almeno otto settimane
   prima che «come stai?» abbia senso. */
function agentCheckinDue(p){
  const _p=p||{};const ag=_p.agent;
  if(!_p.hasAgent||!ag)return{due:false,att:0};
  if((_p.proStatus||"u18")!=="pro")return{due:false,att:0};
  const s0=+_p.season||1,w0=+_p.week||1;
  const lc=ag.lastCheckin||ag.since||{s:s0,w:w0};
  const dw=(s0-(+lc.s||s0))*38+(w0-(+lc.w||w0));
  const since=(s0-(+((ag.since||{}).s)||s0))*38+(w0-(+((ag.since||{}).w)||w0));
  if(since<8)return{due:false,att:dw};/* appena firmato non si chiede «come stai» */
  let att=16;
  try{att=16+(Math.abs(hashStr((_p.name||"x")+"|ci|"+((ag.memory&&ag.memory.note&&ag.memory.note.length)||0)))%5);}catch(_e){att=18;}
  /* [7.438.0 collaudo PO «il tempismo e' corretto? me lo chiede quasi sempre a mercato chiuso»]
     la domanda «sei felice qui? / guardiamoci intorno» ha senso quando il mercato la può
     RACCOGLIERE: maturata la cadenza, il colloquio si tiene fino alla prima finestra utile
     (W1-5 estiva · W19-23 invernale — le stesse del giornalista di mercato). E a un giocatore
     che ha ANNUNCIATO il ritiro il procuratore non propone piu' trasferimenti. */
  const _mw438=(w0<=5)||(w0>=19&&w0<=23);
  if(_p.retireAnnounced===s0)return{due:false,att,dw};
  return{due:dw>=att&&(_mw438||dw>=att+8),att,dw};/* si aspetta la finestra, ma mai piu' di 8 settimane: il colloquio non e' SOLO mercato */
}

/* Le quattro risposte, e soprattutto CIO' CHE FANNO. La direttiva chiede conseguenze reali: qui
   non nascono meccaniche nuove — si accendono quelle che il gioco ha gia'. `cerca_offerte` e'
   l'incarico che esiste dal 7.29 e che alza del 15% la probabilita' d'offerta; `transferListed` e'
   il flag che il mercato gia' legge. Il procuratore non inventa un mercato suo: usa quello vero. */
const AGENT_CHECKIN_OPTS=[
  {id:"felice", label:"Sto benissimo qui.",                       eff:{morale:4,rapport:5,nota:"restare"}},
  {id:"ruolo",  label:"Sto bene, ma vorrei sentirmi piu' importante.", eff:{rapport:4,nota:"ruolo"}},
  {id:"guardo", label:"Credo sia il momento di guardarci intorno.",    eff:{rapport:2,nota:"esplora",task:"cerca_offerte"}},
  {id:"via",    label:"Voglio cambiare completamente aria.",           eff:{rapport:1,morale:-2,nota:"partire",task:"cerca_offerte",listed:true}},
];
const AGENT_CHECKIN_REPLY={
  felice:"Mi fa piacere sentirlo. Allora non ho fretta di muovermi: si costruisce da qui.",
  ruolo:"Questo e' un discorso che posso fare io, e lo faro'. Il campo devi guadagnartelo, ma qualcuno deve anche ricordarglielo.",
  guardo:"Va bene. Giro il tuo nome con discrezione e vediamo chi si muove — senza forzare niente.",
  via:"Ricevuto. Da adesso lavoro perche' tu abbia una scelta vera davanti, non la prima che capita.",
};

/* La domanda non e' mai generica: parte da cio' che il procuratore VEDE (i temi di `agentAdvice`,
   che leggono minuti, fiducia del mister, morale, contratto) e, se l'Eroe gli ha detto qualcosa,
   glielo ricorda (§5). E' li' che «mi conosce» smette di essere una promessa. */
function agentCheckinAsk(p,ag){
  const _p=p||{};const a=ag||_p.agent||null;
  const adv=(typeof agentAdvice==="function")?agentAdvice(_p,a):{temi:[],amb:[]};
  const amb=(adv.amb&&adv.amb[0])||null;
  const AMB_TXT={champions:"vincere la Champions",trofei:"vincere qualcosa di importante",soldi:"guadagnare il piu' possibile",
    titolare:"giocare sempre",crescita:"diventare piu' forte",fama:"farti un nome",nazionale:"vestire la maglia della Nazionale",
    estero:"provare un campionato straniero",fedelta:"restare legato a questo club"};
  const ricordo=amb?`Mi avevi detto che quello che volevi era ${AMB_TXT[amb]||"qualcosa di importante"}.`:null;
  let lettura="Ti seguo da un po' e volevo sentire la tua, prima di muovermi.";
  if(adv.temi.indexOf("spazio")>=0)lettura="Secondo me il problema non e' il tuo rendimento: e' che non stai ricevendo lo spazio che meriti.";
  else if(adv.temi.indexOf("rendimento")>=0)lettura="I numeri non stanno arrivando come speravamo. Non e' un dramma, ma va detto.";
  else if(adv.temi.indexOf("scadenza")>=0)lettura="Il tuo contratto si avvicina alla fine, e queste sono le settimane in cui si decide.";
  else if(adv.temi.indexOf("stipendio")>=0)lettura="Il tuo contratto non rispecchia piu' il giocatore che sei diventato.";
  else if(adv.temi.indexOf("morale")>=0)lettura="Ti vedo giu'. Prima di parlare di mercato voglio capire da cosa dipende.";
  else if(adv.verso==="restare")lettura="Ti vedo bene, e la squadra gira. Non avrei fretta di muovermi.";
  return{apertura:"Abbiamo fatto parecchia strada negli ultimi mesi.",ricordo,lettura,
    domanda:"Dimmi sinceramente: sei felice qui?",opzioni:AGENT_CHECKIN_OPTS,temi:adv.temi};
}

/* L'esito, puro: dalla scelta ai campi da scrivere. Chi chiama applica — cosi' la regola e'
   testabile in node e l'UI non contiene logica di gioco. */
function agentCheckinApply(p,optId){
  const _p=p||{};const o=AGENT_CHECKIN_OPTS.find(x=>x.id===optId);
  if(!o||!_p.agent)return{};
  const e=o.eff||{};
  const ag={..._p.agent,rapport:Math.max(0,Math.min(100,(+_p.agent.rapport||50)+(e.rapport||0))),
    lastCheckin:{s:_p.season||1,w:_p.week||1}};
  if(typeof agentRemember==="function"&&e.nota)ag.memory=agentRemember(_p.agent.memory,{k:"decisione",v:e.nota,s:_p.season||1,w:_p.week||1});
  const out={agent:ag};
  if(e.morale)out.morale=Math.max(0,Math.min(100,(+_p.morale||70)+e.morale));
  if(e.task)out.agentTask=e.task;/* incarico ESISTENTE: alza del 15% la probabilita' d'offerta */
  if(e.listed)out.transferListed=true;/* flag ESISTENTE letto dal mercato */
  return out;
}
if(typeof window!=='undefined'){window.agentCheckinDue=agentCheckinDue;window.agentCheckinAsk=agentCheckinAsk;
  window.agentCheckinApply=agentCheckinApply;window.AGENT_CHECKIN_OPTS=AGENT_CHECKIN_OPTS;window.AGENT_CHECKIN_REPLY=AGENT_CHECKIN_REPLY;}

/* [7.378.0 Procuratore R5 §6 «il procuratore NON deve aspettare che il giocatore lo interroghi» +
   §8 «ponte narrativo verso il mercato, con progressione»] L'INIZIATIVA.
   Il rischio di questa parte non e' che il procuratore taccia: e' che il gioco finisca con DUE
   mercati, uno vero e uno suo. Percio' qui non nasce nessuna decisione di mercato — nessuna
   offerta, nessun club, nessuna probabilita'. Questa funzione LEGGE segnali che il gioco gia'
   persiste (`transferListed`, `agentTask`, anni di contratto, valore contro stipendio, popolarita'
   contro sponsor firmati) e decide UNA cosa sola: di cosa ha senso che il procuratore ti parli
   questa settimana. Le offerte continuano a nascere da dove nascevano.
   E per lo stesso motivo non promette mai un'offerta che non esiste: racconta l'avvicinamento
   («si stanno informando» → «l'interesse e' concreto»), non l'esito. Quando l'offerta vera arriva,
   arriva dal sistema di sempre — e ti trova preparato invece che sorpreso. */
const AGENT_INIT_KINDS=["contratto","sponsor","mercato2","mercato1"];/* ordine = priorita' */
/* [7.378.0] SOTTOPAGATO, con le unita' giuste. In R1 la condizione era `(value*1000/52) > wage*1.8`:
   trattava `value` come se fosse una cifra annua, mentre nel gioco e' in MILIONI (agentPlanFor lo
   formatta come «4.2M»). Con un valore da 30M e 5.000€ a settimana dava 577 contro 9.000 → falso
   sempre: il tema «il tuo contratto non rispecchia piu' il giocatore che sei diventato» non si e'
   MAI attivato da quando esiste. L'ha trovato il guardiano di R5, non io.
   Regola nuova, leggibile: un giocatore che vale X milioni ci si aspetta guadagni ~X mila a
   settimana; sotto il 55% di quella cifra il procuratore ha qualcosa da dire. */
function _sottopagato378(val,wage){return wage>0&&val>0&&(val*1000*0.55)>wage;}
function agentInitiative(p){
  const _p=p||{};const ag=_p.agent;
  if(!_p.hasAgent||!ag)return null;
  if((_p.proStatus||"u18")!=="pro")return null;
  const s0=+_p.season||1,w0=+_p.week||1;
  const st=_p.agentInit||{k:null,s:0,w:0};
  const dw=(s0-(+st.s||0))*38+(w0-(+st.w||0));
  if(st.k&&dw<6)return null;/* §12: non si bussa due volte in un mese e mezzo */
  const inWindow=(w0>=1&&w0<=5)||(w0>=19&&w0<=23);
  const anni=(_p.contract&&+_p.contract.years)||0;
  const wage=(_p.contract&&+_p.contract.wage)||0;
  const val=+_p.value||0,pop=+_p.popularity||0;
  const nSp=Array.isArray(_p.sponsors)?_p.sponsors.length:0;
  const arch=(typeof AGENT_ARCH_BY_ID==="function")?AGENT_ARCH_BY_ID(ag.arch||ag.id):null;
  const bias=(arch&&arch.bias)||{};
  const cand=[];
  /* CONTRATTO: scadenza vicina, oppure vali molto piu' di quanto guadagni */
  if(anni>0&&anni<=1)cand.push({k:"contratto",why:"scadenza"});
  else if(_sottopagato378(val,wage))cand.push({k:"contratto",why:"stipendio"});
  /* SPONSOR: la tua immagine vale e non la sta sfruttando nessuno */
  if(pop>=(30-(bias.sponsor||0)*20)&&nSp<Math.min(3,1+Math.floor(pop/30)))cand.push({k:"sponsor",why:"immagine"});
  /* MERCATO: due fasi di AVVICINAMENTO, mai un'offerta promessa */
  if(inWindow&&(_p.transferListed||_p.agentTask==="cerca_offerte")){
    cand.push({k:(st.k==="mercato1"?"mercato2":"mercato1"),why:"finestra"});
  }
  if(!cand.length)return null;
  /* si sceglie il piu' urgente, e MAI la stessa cosa due volte di fila */
  const ord=cand.slice().sort((a,b)=>AGENT_INIT_KINDS.indexOf(a.k)-AGENT_INIT_KINDS.indexOf(b.k));
  const pick=ord.find(c=>c.k!==st.k)||null;
  return pick?{...pick,tab:(pick.k==="sponsor"?"agente":pick.k==="contratto"?"club":"agente")}:null;
}
const AGENT_INIT_TXT={
  contratto:{scadenza:"Il tuo contratto si avvicina alla scadenza. Prima che lo facciano loro, voglio sapere cosa vuoi fare.",
             stipendio:"Il tuo contratto non rispecchia piu' il giocatore che sei diventato. Secondo me e' il momento di parlarne."},
  sponsor:{immagine:"Ho parlato con uno sponsor che secondo me e' perfetto per te: la tua immagine sta iniziando a valere davvero."},
  mercato1:{finestra:"Ti avviso: qualcuno si sta informando su di te. Niente di concreto per ora, ma volevo che lo sapessi da me."},
  mercato2:{finestra:"Ho risentito chi si era mosso: l'interesse e' concreto. Non c'e' ancora niente sul tavolo, ma ci siamo vicini."},
};
function agentInitLine(kind,why){const g=AGENT_INIT_TXT[kind]||{};return g[why]||g[Object.keys(g)[0]]||"";}
if(typeof window!=='undefined'){window.agentInitiative=agentInitiative;window.agentInitLine=agentInitLine;window.AGENT_INIT_TXT=AGENT_INIT_TXT;}

/* [7.379.0 Procuratore R6 §10 «se l'Eroe non si trova bene DEVE poter cambiare» + §9 rapporto]
   IL CATALOGO E LA ROTTURA.

   I candidati sono al massimo tre — «non mostrare una lista infinita» — e sono quelli che a questo
   punto della carriera ti prenderebbero davvero (`agentRosterFor`, R1: la disponibilita' cresce con
   popolarita' e valutazione). Il nome e' deterministico dall'archetipo e dal giocatore, cosi' due
   carriere diverse incontrano persone diverse ma la stessa carriera ritrova sempre le stesse. */
function agentCandidates(p,escludi){
  const _p=p||{};const ex=escludi||((_p.agent&&_p.agent.arch)||null);
  const pool=(typeof agentRosterFor==="function")?agentRosterFor(_p):[];
  const out=[];
  for(let i=0;i<pool.length&&out.length<3;i++){
    const a=pool[i];if(a.id===ex)continue;
    let nm=AGENT_NAME_POOL[0];
    try{nm=AGENT_NAME_POOL[Math.abs(hashStr((_p.name||"x")+"|"+a.id))%AGENT_NAME_POOL.length];}catch(_e){}
    out.push({arch:a.id,nome:a.nome,desc:a.desc,forte:a.forte,name:nm});
  }
  return out;
}

/* LA ROTTURA. §26: la memoria PERSONALE appartiene alla relazione che finisce — il successore non
   puo' sapere cosa hai confidato a un altro. Cio' che resta e' lo STORICO: chi e' stato il tuo
   procuratore, da quando a quando, con che rapporto avete chiuso. Sono dati oggettivi di carriera,
   e quelli il nuovo li puo' sapere come li saprebbe chiunque legga la tua scheda.
   Nessuna penale: §24 dice di non inventare costi che non esistono, e una struttura contrattuale
   del procuratore in questo gioco non c'e'. */
function agentPartPatch(p){
  const _p=p||{};const ag=_p.agent;
  const st=Array.isArray(_p.agentHistory)?_p.agentHistory.slice():[];
  if(ag)st.unshift({name:ag.name||null,arch:ag.arch||ag.id||null,
    da:ag.since||null,a:{s:_p.season||1,w:_p.week||1},rapport:+ag.rapport||0});
  return{hasAgent:false,agent:null,agentTask:null,agentPlan:null,
    agentHistory:st.slice(0,6),/* lo storico e' breve: e' una carriera, non un archivio */
    agentInit:{k:null,s:0,w:0,open:false},agentCheckin:{due:false},
    agentHint:{...(_p.agentHint||{}),due:null,n:Math.max(2,((_p.agentHint&&+_p.agentHint.n)||0))}};
    /* il reminder non riparte da zero dopo una rottura: hai gia' saputo cosa fa un procuratore */
}

/* IL LOGORIO (§9/§22). Un rapporto non si rovina perche' passa il tempo: si rovina quando le due
   persone non la pensano allo stesso modo. Qui l'attrito nasce da due cose misurabili — le
   iniziative che l'Eroe lascia caere senza guardarle, e la distanza fra cio' che il procuratore
   SPINGE (l'inclinazione del suo archetipo) e cio' che l'Eroe ha DICHIARATO di volere.
   Un ambizioso che ti spinge sul mercato mentre tu gli hai detto «voglio restare» ti logora; lo
   stesso ambizioso, con un Eroe che sogna la Champions, no. */
function agentRapportDrift(p){
  const _p=p||{};const ag=_p.agent;if(!_p.hasAgent||!ag)return 0;
  const arch=(typeof AGENT_ARCH_BY_ID==="function")?AGENT_ARCH_BY_ID(ag.arch||ag.id):null;
  const bias=(arch&&arch.bias)||{};
  const amb=(ag.memory&&Array.isArray(ag.memory.amb))?ag.memory.amb:[];
  let d=0;
  if(amb.indexOf("fedelta")>=0&&(bias.mercato||0)>0.2)d-=1;
  if(amb.indexOf("titolare")>=0&&(bias.mercato||0)>0.3)d-=1;
  if(amb.indexOf("soldi")>=0&&(bias.soldi||0)<0)d-=1;
  if(amb.indexOf("champions")>=0&&(bias.restare||0)>0.2)d-=1;
  if(amb.length&&!d)d+=1;/* sintonia: vi capite, e il rapporto cresce piano */
  const ign=+ag.ignorate||0;
  if(ign>=3)d-=1;
  return d;
}
/* Quando il rapporto e' rotto il gioco lo DICE, ma non cambia niente da solo (§22). */
function agentRapportAdvice(p){
  const _p=p||{};const ag=_p.agent;if(!_p.hasAgent||!ag)return null;
  const t=(typeof agentRapportTier==="function")?agentRapportTier(ag.rapport):null;
  if(t!=="conflittuale")return null;
  return{tier:t,txt:"Continuo a dirti come la penso, ma vedo che non la pensiamo allo stesso modo. Se credi che sia arrivato il momento di cambiare, lo capisco."};
}
if(typeof window!=='undefined'){window.agentCandidates=agentCandidates;window.agentPartPatch=agentPartPatch;
  window.agentRapportDrift=agentRapportDrift;window.agentRapportAdvice=agentRapportAdvice;}

const AGENT_HINT_TXT={
  first:{t:"💼 Hai fatto un altro passo avanti.",b:"Ora puoi permetterti un Procuratore personale. Potra' aiutarti con mercato, contratti, sponsor e carriera."},
  mercato:{t:"💼 Si e' aperto il mercato.",b:"Te ne avevo gia' parlato: con le trattative in corso, un procuratore al tuo fianco cambia molto."},
  rinnovo:{t:"💼 Il tuo contratto sta per scadere.",b:"E' il momento in cui avere qualcuno che tratti per te vale di piu'."},
  interesse:{t:"💼 Qualcuno si sta muovendo per te.",b:"Ora che arrivano interessamenti, secondo me potrebbe essere il momento giusto."},
  sponsor:{t:"💼 La tua immagine inizia a valere.",b:"Con un procuratore quelle porte si aprono prima, e si aprono meglio."},
};
if(typeof window!=='undefined'){window.agentHireFee=agentHireFee;window.agentHirePatch=agentHirePatch;window.agentNameFor=agentNameFor;window.agentHintCheck=agentHintCheck;window.AGENT_HINT_TXT=AGENT_HINT_TXT;}

/* Chi ti prenderebbe, adesso (§20). La disponibilita' non dipende solo dai soldi ma da dove sei
   arrivato: popolarita' e valutazione, i due indicatori di carriera che il gioco gia' tiene. */
function agentRosterFor(p){
  const _p=p||{};const pop=+_p.popularity||0,val=+_p.value||0;
  return AGENT_ARCHETYPES.filter(a=>pop>=a.req.pop&&val>=a.req.val);
}

/* Le fasce del rapporto (§17). Numero interno 0..100, lette come stato umano. */
function agentRapportTier(r){
  const v=Math.max(0,Math.min(100,+r||0));
  if(v<20)return"conflittuale";
  if(v<45)return"professionale";
  if(v<65)return"positivo";
  if(v<85)return"confidenziale";
  return"strettissimo";
}

/* La memoria (§10). NON si salva ogni frase: si salvano le cose che cambiano i consigli futuri —
   ambizioni, decisioni, orientamento. Tetto basso di proposito: una memoria che ricorda tutto non
   e' una memoria, e' un registro. */
function agentRemember(mem,voce){
  const m=mem&&typeof mem==="object"?mem:{amb:[],note:[]};
  const amb=Array.isArray(m.amb)?m.amb.slice():[];
  const note=Array.isArray(m.note)?m.note.slice():[];
  if(!voce||!voce.k)return{amb,note};
  if(voce.k==="ambizione"){const i=amb.indexOf(voce.v);if(i>=0)amb.splice(i,1);amb.unshift(voce.v);
    return{amb:amb.slice(0,3),note};}
  note.unshift({k:voce.k,v:voce.v,s:voce.s||null,w:voce.w||null});
  return{amb,note:note.slice(0,8)};
}

/* Lo stato di partenza della relazione, alla firma. */
function agentInit(o){
  const _o=o||{};
  return{id:_o.id||"prudente",name:_o.name||"Procuratore",arch:_o.arch||_o.id||"prudente",
    since:{s:+_o.season||1,w:+_o.week||1},rapport:50,memory:{amb:[],note:[]},lastCheckin:{s:+_o.season||1,w:+_o.week||1}};
}

/* Il CONSIGLIO, puro: legge il contesto che il gioco gia' tiene (minuti, morale, fiducia del
   mister, contratto, valutazione) e lo traduce in una lettura. Qui non decide NIENTE — la §28 dice
   che il procuratore consiglia e l'Eroe decide — e infatti torna un giudizio, non un'azione. */
function agentAdvice(p,ag){
  const _p=p||{};const a=ag||_p.agent||null;
  const arch=a?AGENT_ARCH_BY_ID(a.arch||a.id):null;
  const bias=(arch&&arch.bias)||{mercato:0,soldi:0,sponsor:0,restare:0};
  const m=+_p.matches||0,g=+_p.goals||0,as=+_p.assists||0;
  const mor=+_p.morale||50,trust=+_p.coachTrust||50,pop=+_p.popularity||0;
  const wage=(_p.contract&&+_p.contract.wage)||0,val=+_p.value||0;
  const anniRes=(_p.contract&&+_p.contract.years)||0;
  /* «gioca poco ma rende bene» (§11): il rendimento si giudica sui contributi PER PARTITA, non
     sul totale — altrimenti chi gioca poco sembra sempre scarso. */
  const rendi=m>0?((g+as*0.7)/m):0;
  const poco=m>0&&trust<45;
  const bene=rendi>=0.35;
  const temi=[];
  if(poco&&bene)temi.push("spazio");            /* non e' il rendimento, e' il minutaggio */
  else if(!bene&&m>=5)temi.push("rendimento");
  if(anniRes>0&&anniRes<=1)temi.push("scadenza");
  if(_sottopagato378(val,wage))temi.push("stipendio");/* [7.378.0] unita' corrette: vedi _sottopagato378 */
  if(mor<40)temi.push("morale");
  if(pop>=30&&!(Array.isArray(_p.sponsors)&&_p.sponsors.length))temi.push("sponsor");
  /* propensione a muoversi: contesto + inclinazione del procuratore + cosa l'Eroe ha detto */
  let muovi=0;
  if(temi.indexOf("spazio")>=0)muovi+=0.35;
  if(temi.indexOf("morale")>=0)muovi+=0.15;
  if(temi.indexOf("stipendio")>=0)muovi+=0.20;
  if(temi.indexOf("scadenza")>=0)muovi+=0.15;
  muovi+=(bias.mercato||0)-(bias.restare||0);
  const amb=(a&&a.memory&&Array.isArray(a.memory.amb))?a.memory.amb:[];
  if(amb.indexOf("fedelta")>=0)muovi-=0.35;
  if(amb.indexOf("titolare")>=0&&temi.indexOf("spazio")>=0)muovi+=0.20;
  if(amb.indexOf("champions")>=0||amb.indexOf("trofei")>=0)muovi+=0.10;
  muovi=Math.max(-1,Math.min(1,muovi));
  return{temi,muovi:+muovi.toFixed(2),
    verso:muovi>0.35?"cambiare":muovi<-0.15?"restare":"aspettare",
    rapporto:a?agentRapportTier(a.rapport):null,amb};
}
if(typeof window!=='undefined'){window.AGENT_ARCHETYPES=AGENT_ARCHETYPES;window.AGENT_AMBITIONS=AGENT_AMBITIONS;
  window.agentRosterFor=agentRosterFor;window.agentRapportTier=agentRapportTier;window.agentRemember=agentRemember;
  window.agentInit=agentInit;window.agentAdvice=agentAdvice;}/* esposti per i guardiani in node */

const CLUB_SPONSOR_POOL=["VOLTARA","SKYLINEA","FORTEZZA","PIXEL+","RAPIDO","NORDIK","TITANIO","METEORA","PONTE","QUADRIFOGLIO","SIRENA","CRISTALLA","ORAFICIO","VELATOUR"];
function genClubSponsor(club,season,prestigeEff){
  const cid=(club&&(club.id||club.n))||"x";const sd=Math.abs(hashStr("clubsponsor|"+cid+"|"+season));
  const is2nd=(typeof LEAGUE_PAIRS!=="undefined")&&LEAGUE_PAIRS.some(pr=>pr[1]===(club&&club.lg));
  const p=clamp(prestigeEff||(club&&club.p)||60,30,99);
  const annual=Math.max(150000,Math.round((p*p*0.9+300)*(is2nd?0.5:1))*1000);// prestigio 60→~3.5M · 90→~7.6M · 2ª div ×0.5
  const dur=2+(sd%3);// 2-4 stagioni
  return {name:CLUB_SPONSOR_POOL[sd%CLUB_SPONSOR_POOL.length],annual,since:season,until:season+dur,clubId:cid};
}
// generate transfer offer based on player OVR and prestige match
function generateTransferOffer(player,pref){
  // [6.34.0 STAB-9] niente offerte di trasferimento mentre sei in PRESTITO — guardia al CHOKEPOINT unico
  //   (prima solo 1 dei 3 call-site controllava !p.loan: il mercato invernale e il bottone «genera offerta»
  //   dell'agente la bypassavano → un giocatore in prestito poteva firmare altrove ignorando il club madre).
  /* [7.436.0 consolidamento collaudo PO] NIENTE OFFERTE A CHI HA ANNUNCIATO IL RITIRO: la stagione
     d'addio (7.432) e' un impegno pubblico — nessun club ingaggia chi appende gli scarpini a maggio.
     Stessa classe della guardia sul prestito: al CHOKEPOINT unico, cosi' nessun call-site la scavalca. */
  if(player&&player.retireAnnounced===(player.season||1))return null;
  if(player&&player.loan)return null;
  const pOvr=player.ovr||60;
  const seasons=player.season||1;
  const matches=player.totalMatches||0;
  const currentP=player.club?.p||60;

  // OVR-based prestige range
  let minP,maxP;
  if(pOvr<65){minP=40;maxP=65;}
  else if(pOvr<70){minP=50;maxP=72;}
  else if(pOvr<74){minP=58;maxP=80;}
  else if(pOvr<78){minP=65;maxP=86;}
  else if(pOvr<82){minP=72;maxP=92;}
  else if(pOvr<86){minP=80;maxP=97;}
  else{minP=88;maxP=99;}

  // Season cap: early career blocks elite clubs
  if(seasons<=1)maxP=Math.min(maxP,70);
  else if(seasons<=2)maxP=Math.min(maxP,80);
  else if(seasons<=3)maxP=Math.min(maxP,88);

  let candidates=CLUBS.filter(c=>{
    if(c.id===player.club?.id||c.n===player.club?.n)return false;
    if(c.p<minP||c.p>maxP)return false;
    return transferCredibility(pOvr,seasons,matches,c.p,currentP);
  });

  if(!candidates.length){
    // Fallback: find any reasonable club
    candidates=CLUBS.filter(c=>c.id!==player.club?.id&&c.p>=40&&c.p<=clamp(pOvr+10,50,78));
  }
  if(!candidates.length)return null;

  // E-2: preference filter (backward-compat — pref=null/undefined → unchanged)
  if(pref&&pref.mode&&pref.mode!=="any"){
    if(pref.mode==="prestige"&&pref.prestigeTarget){
      const prefC=candidates.filter(c=>Math.abs((c.p||60)-(pref.prestigeTarget||70))<=15);
      if(prefC.length)candidates=prefC;
    }else if(pref.mode==="club"&&pref.clubId){
      const prefC=candidates.filter(c=>c.id===pref.clubId||c.n===pref.clubId);
      if(prefC.length)candidates=prefC;
    }
  }

  const club=pick(candidates);
  // E-3: 4 transfer types with realistic loan sub-types
  const _types4=["prestito","prestito con opzione","prestito con obbligo","trasferimento definitivo"];
  const _noLoan28=player.contractExpired||(player.proStatus||"u18")==="u18";/* [7.8.28 QA, stessa ratio STAB-10] uno SVINCOLATO non può andare «in prestito» (il club madre sarebbe quello che l'ha scaricato, col contratto SCADUTO come parentContract → a fine stagione rientro d'ufficio con contratto fantasma); un U18 idem (parentClub U18 → al rientro un PRO tornava nel pool Primavera bypassando ProTransitionScreen) */
  const type=_noLoan28?"trasferimento definitivo":pOvr<63?"prestito":pOvr<70?pick(_types4.slice(0,2)):pOvr<75?pick(_types4.slice(0,3)):pick(_types4);
  const isPrestito=type.includes("prest");
  const isLoanOpt=type==="prestito con opzione";
  const isLoanObl=type==="prestito con obbligo";
  // E-3: buyClause for loan-with-option/obligation
  const _buyClause=(isLoanOpt||isLoanObl)?Math.round((pOvr*35000+club.p*20000)*(player.hasAgent?1.12:1.0)/100)*100:null;
  const _minMatches=isLoanObl?10:null;
  const _baseWage=_ovrToWageWeekly133(pOvr,club.p);
  const wage=Math.round(_baseWage*(1+rngF(-0.1,0.1))*(player.hasAgent?1.15:1.0));
  const duration=isPrestito?1:rng(2,4);
  return{club,type,minutaggio:isPrestito?rng(30,70):rng(50,90),moralBonus:rng(5,20),growthBonus:rng(5,15),prestigeRatio:club.p/Math.max(1,currentP),wage,duration,...((isLoanOpt||isLoanObl)?{buyClause:_buyClause,minMatches:_minMatches}:{})};
}
// Generate pro contract offers at end of U18 career
function generateProContracts(player){
  /* [7.262.0 collaudo PO «cambiano le squadre, prima carica alcune squadre e poi ne mostra altre! bug grave!»]
     Le offerte nascevano da _pk()/_rf() NON seedati ed erano calcolate nel corpo del render di
     ProTransitionScreen: bastava un qualunque re-render del contenitore (una notifica, l'autosave, un timer)
     perche' club e stipendi venissero riestratti sotto gli occhi del giocatore. Ora l'intera generazione usa
     uno stream SEEDATO sull'identita' del giocatore (nome+nazione+stagione+club+u18Seasons): le stesse
     offerte a ogni render E dopo un reload, per costruzione. `_pk`/`_rf`/`_ri` sostituiscono pick/rngF/rng
     SOLO dentro questa funzione. */
  const _prg=(typeof seededRng==="function")?seededRng((hashStr("prooff|"+(player.name||"?")+"|"+(player.nation||"")+"|"+(player.club?.id||"")+"|"+(player.season||1)+"|"+(player.u18Seasons||0))>>>0)||1):Math.random;
  const _pk=a=>(a&&a.length)?a[Math.floor(_prg()*a.length)%a.length]:undefined;
  const _rf=(a,b)=>a+_prg()*(b-a);
  const _ri=(a,b)=>a+Math.floor(_prg()*(b-a+1));
  const ovr=player.ovr||60;
  const u18S=player.u18Seasons||0;
  const forced=u18S>=2; // max 2 seasons: MUST leave
  const perf=Math.min(10,(player.goals||0)*0.35+(player.matches||0)*0.12+(ovr-50)/6);
  const agentMult=player.hasAgent?1.15:1.0; // Sprint 26B: agent negotiation bonus
  // Sprint D1: gerarchia → leva sull'ingaggio del contratto principale
  const roleWageBonus=player.squadRole==='leader'?1.12:player.squadRole==='titolare'?1.06:1.0;
  const offers=[];
  // 1. Same club first pro contract — conditional on performance (Sprint 105)
  const parentName=((player.club?.n||player.club?.name||"?")+"").replace(/\s+(Primavera|U18)\s*$/i,"").trim();
  // [6.28.0 collaudo PO «primavera 2 con 36 squadre, il calendario inizia contro l'Inter»] FIX CRITICO:
  //   il club "senior" del primo contratto ereditava per spread la lega U18 (lg:"Primavera 1/2"), che NON esiste
  //   tra i club senior → getLeagueClubs cadeva sul fallback per NAZIONALITÀ (36 club = Lega A+B mescolate: "Modena
  //   con l'Inter"). Ora la lega senior si RISOLVE dall'id del club (U18_CLUBS_P2 deriva da Lega B → "serie B").
  const _seniorC=CLUBS.find(c=>c.id===(player.club?.id));
  const _seniorLg=(_seniorC&&_seniorC.lg)||(player.club?.lg==="Primavera 1"?"Lega A":player.club?.lg==="Primavera 2"?"Lega B":(player.club?.lg&&CLUBS.some(c=>c.lg===player.club.lg)?player.club.lg:"Lega B"));
  const parentClub={...(player.club||{}),n:parentName,name:parentName,isU18:false,p:(player.club?.p||55)+12,lg:_seniorLg};
  // Sprint 133: use unified wage helper (weekly €)
  const _wageWeek133=_ovrToWageWeekly133(ovr,parentClub.p||55);
  // Sprint 105: First Team offer requires minimum performance threshold
  const _qualifiesFirstTeam105=ovr>=64&&perf>=3.5;
  if(_qualifiesFirstTeam105){
    offers.push({id:"same_pro",club:parentClub,contractType:"Primo contratto professionistico",wage:Math.round(clamp(_wageWeek133*(1+_rf(-0.10,0.10)),500,500000)*agentMult*roleWageBonus),duration:_ri(1,3),role:ovr>=72?"Titolare giovane":ovr>=65?"Giovane promessa":"Aggregato alla rosa",moralBonus:14,growthBonus:perf>5?20:10,isMain:true});
  }else{
    // Non confermato in prima squadra: proposta ridotta o solo prestito
    offers.push({id:"same_pro",club:parentClub,contractType:ovr>=60?"Aggregato alla rosa (prestito interno)":"Non confermato — svincolo",wage:Math.round(clamp(_wageWeek133*0.65*(1+_rf(-0.08,0.08)),300,200000)*agentMult),duration:1,role:"Riserva giovane",moralBonus:-4,growthBonus:6,isMain:false,isNonConfirmed:true});
  }
  // 2. External club (credibility-filtered)
  if(perf>2||forced){
    // OVR < 65 → only lower-tier clubs; OVR 65-72 → mid; OVR 73+ → higher
    const extMaxP=ovr>=73?clamp(ovr+8,70,86):ovr>=65?clamp(ovr+5,62,78):clamp(ovr+2,50,68);
    const extMinP=ovr>=73?65:ovr>=65?52:40;
    const extPool=CLUBS.filter(c=>c.p>=extMinP&&c.p<=extMaxP&&c.id!==parentClub.id);
    if(extPool.length){
      const ext=_pk(extPool);
      const _extWage133=Math.round(clamp(_ovrToWageWeekly133(ovr,ext.p)*(1+_rf(-0.10,0.15)),400,500000)*agentMult);
      // [6.37.0 STAB-10] al PRIMO contratto pro non esiste un club madre senior → un'offerta di «prestito» era
      //   fuorviante (viene comunque eseguita come trasferimento definitivo). Per scelta PO: sempre FIRMA
      //   DEFINITIVA (etichetta coerente), niente più «Prestito annuale».
      offers.push({id:"external",club:ext,contractType:ovr>=65?"Trasferimento definitivo":"Contratto professionistico",wage:_extWage133,duration:ovr>=65?_ri(2,3):1,role:ovr>=70?"Titolare":"Titolare garantito",moralBonus:8,growthBonus:15});
    }
  }
  // 3. Contratto con un club minore (fallback garantito) — [6.37.0 STAB-10] era etichettato «Prestito»
  //    (semantica indefinita al 1° pro): firma DEFINITIVA con un club di categoria inferiore, minutaggio garantito.
  const loanPool=CLUBS.filter(c=>c.p<68&&c.id!==parentClub.id);
  const loanClub=_pk(loanPool.length?loanPool:CLUBS);
  offers.push({id:"loan_small",club:loanClub,contractType:"Contratto (squadra minore)",wage:Math.round(clamp(_ovrToWageWeekly133(ovr,loanClub?.p||45)*(1+_rf(-0.10,0.10)),300,80000)*agentMult),duration:1,role:"Minutaggio garantito",moralBonus:4,growthBonus:10});
  // 4. Stay another year in U18 (ONLY if under limit)
  if(!forced){
    const isLast=u18S>=1;
    offers.push({id:"stay_u18",club:player.club,contractType:`Resta in Under 18 (${u18S+1}/2)`,wage:player.contract?.wage||200,duration:1,role:"Protagonista U18",moralBonus:-6,growthBonus:4,isStayU18:true,isLastChance:isLast});
  }
  return{offers,forced,perf:Math.round(perf*10)/10};
}
function generateSeasonObjectives(player){
  const ovr=player.ovr||60;
  const arcId=player.archetype?.id||player.archetype||"";
  const p=player.club?.p||50;
  const standT=p>=80?3:p>=65?6:p>=50?9:12;
  // Sprint 107: goal target modulated by archetype
  const baseT=clamp(Math.floor(ovr/5),5,18);
  const goalT=["bomber","centravanti"].includes(arcId)?Math.min(baseT+3,22):arcId==="enfant"?Math.max(baseT-2,3):baseT;
  const objs=[{type:"goals",target:goalT,label:`Segna ${goalT} gol`,bonus:{morale:15,coachTrust:10,value:0.2}}];
  objs.push({type:"standing",target:standT,label:`Finisci nei primi ${standT}`,bonus:{popularity:15,value:0.25}});
  // Sprint 107: 3rd objective by archetype
  if(["trequartista","fantasista"].includes(arcId)){
    const aT=clamp(Math.floor(ovr/7),4,14);objs.push({type:"assists",target:aT,label:`Fornisci ${aT} assist`/* [7.209.0 collaudo PO «Dai 11 assist è sgrammaticato»] «Dai N assist» suona storto accanto agli altri obiettivi («Segna 20 gol», «Finisci nei primi 12»): il verbo giusto per l'assist in italiano calcistico è FORNIRE/servire */,bonus:{coachTrust:10,morale:12,value:0.15}});
  }else if(arcId==="leader"){
    const mT=clamp(Math.floor(ovr/4)+3,18,34);objs.push({type:"matches",target:mT,label:`Gioca ${mT} partite da leader`,bonus:{coachTrust:15,morale:10,popularity:8}});
  }else if(arcId==="velocista"){
    const mT=clamp(Math.floor(ovr/4)+6,20,34);objs.push({type:"matches",target:mT,label:`Gioca ${mT} partite`,bonus:{coachTrust:10,morale:8}});
  }else if(arcId==="enfant"){
    const aT=clamp(Math.floor(ovr/9),2,8);objs.push({type:"assists",target:aT,label:`Fornisci ${aT} assist`,bonus:{coachTrust:8,morale:15,value:0.2}});
  }else if(ovr>=75){
    const aT=clamp(Math.floor(ovr/8),3,12);objs.push({type:"assists",target:aT,label:`Fornisci ${aT} assist`,bonus:{coachTrust:8,morale:10}});
  }else{
    const mT=clamp(Math.floor(ovr/4)+5,15,30);objs.push({type:"matches",target:mT,label:`Gioca ${mT} partite`,bonus:{coachTrust:10,morale:8}});
  }
  return objs;
}
/* ── S12: Player archetypes ── */
const ARCHETYPES=[
  {id:"bomber",       e:"💪", name:"Bomber",           desc:"Potenza e istinto del gol",        bonus:{tiro:+8,fisico:+5,posizionamento:+6,velocità:-2,passaggio:-3},    favored:["tiro","posizionamento","fisico"]},
  {id:"fantasista",   e:"🪄", name:"Fantasista",        desc:"Tecnica sopraffina e imprevedibile",bonus:{tecnica:+8,dribbling:+7,passaggio:+4,fisico:-4,tiro:-2},          favored:["tecnica","dribbling","passaggio"]},
  {id:"velocista",    e:"⚡", name:"Velocista",         desc:"Rapidità devastante sulla fascia",  bonus:{velocità:+10,dribbling:+5,fisico:+3,tiro:-4,mentalità:-2},         favored:["velocità","dribbling","fisico"]},
  {id:"trequartista", e:"🎨", name:"Trequartista",      desc:"Visione e assist al top",           bonus:{passaggio:+9,tecnica:+6,mentalità:+5,fisico:-3,tiro:-3},           favored:["passaggio","tecnica","mentalità"]},
  {id:"leader",       e:"🦁", name:"Leader",            desc:"Trascinatore mentale e fisico",     bonus:{mentalità:+9,fisico:+6,posizionamento:+4,velocità:-2,dribbling:-2}, favored:["mentalità","fisico","posizionamento"]},
  {id:"centravanti",  e:"🎯", name:"Centravanti",       desc:"Equilibrio perfetto in area",       bonus:{tiro:+5,posizionamento:+6,tecnica:+4,passaggio:+2,velocità:-2},    favored:["tiro","posizionamento","tecnica"]},
  {id:"enfant",       e:"✨", name:"Enfant Prodige",    desc:"Potenziale sconfinato, crescita x2",bonus:{tecnica:+4,velocità:+4,tiro:+3,dribbling:+3,mentalità:+2},        favored:["tecnica","velocità","tiro","dribbling","mentalità","passaggio","fisico","posizionamento"]},
  {id:"tuttocampista",e:"⚖️",name:"Tuttocampista",     desc:"Nessun punto debole, nessun picco", bonus:{tiro:+2,tecnica:+2,velocità:+2,fisico:+2,mentalità:+2,passaggio:+2,dribbling:+2,posizionamento:+2}, favored:["tiro","tecnica","velocità","fisico","mentalità","passaggio","dribbling","posizionamento"]},
];
/* ── S12: NPC Club Personas (deterministic from club id hash) ── */
const NPC_PERSONAS=[
  {id:"dominatore",  e:"👑", name:"Dominatore",  desc:"Possesso e pressione costante", lambdaMod:+0.15, trustMod:+3},
  {id:"contropiede", e:"🗡️", name:"Contropiede", desc:"Efficiente e letale in ripartenza",lambdaMod:-0.10, trustMod:-2},
  {id:"pressing",    e:"🔥", name:"Pressing",    desc:"Alta intensità, ritmo forsennato", lambdaMod:+0.05, trustMod:+1},
  {id:"fantasioso",  e:"🎭", name:"Fantasioso",  desc:"Imprevedibile e creativo",         lambdaMod:+0.08, trustMod:+2},
];
function getClubPersona(club){const h=hashStr((club?.id||club?.n||"x"));return NPC_PERSONAS[Math.abs(h)%NPC_PERSONAS.length];}
// 5.49.3 — DE-BRANDING giornali (roadmap 1.5): testate di FANTASIA (niente nomi di media reali), id inclusi.
const NEWSPAPERS=[
  {id:"sprint",   name:"Sprint Sportivo",   short:"Sprint",     color:"#e8000d",e:"📰",tone:"epico"},
  {id:"cronaca",  name:"Cronaca di Sport",  short:"Cronaca",    color:"#003da5",e:"📋",tone:"critico"},
  {id:"totale",   name:"Zona Mista",     short:"Zona Mista",color:"#7c3aed",e:"📄",tone:"drammatico"},
  {id:"rete",     name:"Sport in Rete",        short:"Sport in Rete", color:"#16a34a",e:"🗞️",tone:"analitico"},
  {id:"direttatv",name:"Diretta Sport TV",  short:"Diretta TV", color:"#0099d6",e:"📡",tone:"diretto"},
];
// Sprint 74: seeded NPC jersey number assignment per club/season
const _genNpcJerseyNums=(club,season)=>{
  let s=Math.abs(hashStr((club?.id||"x")+"_jrs_"+(season||1)))||7919;
  const used=new Set();const out=[];
  while(out.length<10){s=((s*1664525)+1013904223)>>>0;const n=(s%99)+1;if(!used.has(n)){used.add(n);out.push(n);}}
  return out;
};
const _getAvailNums=(club,season,trust,fanLegend)=>{
  const npc=new Set(_genNpcJerseyNums(club,season));
  const free=[...Array(99)].map((_,i)=>i+1).filter(n=>!npc.has(n));
  const sac=(fanLegend||[]).filter(f=>f.clubId===club?.id).reduce((m,f)=>Math.max(m,f.seasons||0),0);
  const pri=Math.min(100,(trust||50)*0.5+sac*10);
  if(pri>=70)return free;
  if(pri>=40)return free.filter(n=>n>=10);
  return free.filter(n=>n>=20);
};
