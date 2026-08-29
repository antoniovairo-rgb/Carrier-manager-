/* ========================================================================
 * KORWARD ELITE — frammento n° 10  (dei 20, numerati da 00 a 19)
 * src/10-folla-stadi-ritiro.jsx
 *
 * FOLLA 2.0 · IDENTITÀ CLUB · TEMPLATE STADIO · RITIRO
 *
 * CROWD_CFG (il sistema pubblico parametrico), CLUB_IDENTITY, la passione per nazione,
 * STADIUM_TEMPLATES e STADIUM_LG_TPL, e tutto il ritiro pre-campionato (località,
 * hotel, centri, sponsor, RITIRO_EVENTS).
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 8433-9279   ·   847 righe di 41427
 * La prima riga dopo questa intestazione è la riga 8433 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 8409 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* ══════════ CROWD 2.0 — SISTEMA PUBBLICO PARAMETRICO (5.74.0) ══════════
   Revisione completa del pubblico secondo il charter proprietario:
   §1 qualità grafica · §2 LOD · §3 animazioni · §4 colori casa/ospiti/neutrali · §5 distribuzione
   settori (Curva Sud lato tabellone SOLO casa · Curva Nord SOLO ospiti · Est spicchio ospiti ·
   Ovest famiglie/VIP) · §6 affluenza dinamica · §7 atmosfera · §8 provini · §9 big match ·
   §10 performance · §11 TUTTO configurabile qui sotto, la logica non contiene valori magici.
   NOTA orientamento: il tabellone (jumbotron) sta a x=+55 → la curva a x=+sideX È la "Curva Sud". */
const CROWD_CFG={
  quality:{texW:2048,texWMobile:1024,texH:512,colsPerUnit:0.55,tierSplit:0.52,rowsUp:8,rowsLow:6},
  fill:{ // riempimento visivo per contesto [min,max] (§6) — seedato, deterministico
    trial:[0.015,0.035],friendly:[0.15,0.30],u18:[0.08,0.20],cupEarly:[0.25,0.45],
    league:[0.45,0.75],euroGroup:[0.62,0.85],national:[0.55,0.80],ko:[0.80,0.95],
    big:[0.80,0.95],derby:[0.95,1.0],final:[1.0,1.0]},
  intensity:{trial:0.03,friendly:0.30,u18:0.25,cupEarly:0.45,league:0.55,euroGroup:0.70,national:0.65,ko:0.85,big:0.85,derby:1.0,final:1.0},
  weatherMalus:{storm:0.72,thunder:0.72,hail:0.78,snow:0.84,rain:0.86,fog:0.88,mist:0.92,drizzle:0.93,cold:0.95},
  minFillAfterWeather:0.7, // il maltempo non svuota mai sotto il 70% del fill di contesto (derby/finali restano caldi)
  awayShare:{normal:0.55,derby:1.0,ko:0.85,final:1.0,trial:0,euro:0.34,cup:0.46},/* [7.187.0] trasferta EUROPEA = allocazione UEFA piccola (~5% dell impianto → curva ospiti a un terzo) · coppa nazionale infrasettimanale = meno seguito */ // riempimento Curva Nord relativo al fill casa · [6.78.0] finale in campo neutro: Nord piena come la Sud (tifo 50/50)
  sectors:{ // §4/§5 — team: quota abbigliamento nei colori squadra (il resto è casual/neutrale)
    /* [7.187.0] `heat` = moltiplicatore di CALORE del settore: la curva canta e salta anche in una gara qualunque,
       la tribuna (famiglie/VIP) si accende solo quando la partita scotta. Prima l'intensità era UNICA per tutto lo
       stadio e l'unica differenza tra curva e tribuna era la quota di seduti. */
    curvaSud:  {team:0.92,ultras:true, flags:0.11,scarves:0.20,banner:true, seated:0.10,heat:1.18},
    curvaNord: {team:0.90,ultras:true, flags:0.09,scarves:0.18,banner:true, seated:0.12,heat:1.12},
    tribunaEst:{team:0.62,ultras:false,flags:0.015,scarves:0.10,seated:0.72,families:0.18,wedge:0.14,heat:0.78},// wedge=spicchio ospiti accanto alla Curva Nord
    tribunaOvest:{team:0.58,ultras:false,flags:0.01,scarves:0.08,seated:0.78,families:0.22,vip:true,heat:0.62}},
  anim:{idleRedrawMs:110,calmRedrawMs:170,sparseRedrawMs:420,burstRedrawMs:33,burstRedrawMsMobile:50,
    olaMinFill:0.5,olaMinIntensity:0.4,frontRowPerStand:64},
  // [7.3.0 follow-up PO «il numero dei tifosi deve essere proporzionato alla piazza»] la capienza scala col prestigio,
  //   ma le bande basse/medie erano TROPPO piccole: una piazza da seconda divisione (es. Salerno, prestigio 45 perché
  //   RETROCESSA — non perché piccola) finiva in uno stadio da 2.5-7k → affluenza ridicola. Bande rialzate a taglie
  //   da vero calcio professionistico (Serie B reale ~8-30k) + pavimento senior (sotto). U18/Primavera restano piccole
  //   (cap 3000 forzato più sotto). Il crowd-context-test valida i range di FILL e attendance≤capienza → invariato.
  capacity:[[88,46000,80000],[78,33000,56000],[66,23000,42000],[55,15000,30000],[44,10000,24000],[32,6000,14000],[0,2200,6500]],
  minSeniorCap:9000,// nessun club PROFESSIONISTICO (non-U18) ha uno stadio sotto i ~9k: la piazza non collassa in seconda/terza serie
};
// ============================================================================================================
// [7.4.0 FASE 1 — REVISIONE AFFLUENZA/PIAZZE] IDENTITÀ STRUTTURALE DEL CLUB (direttiva PO).
//   Ogni club ha parametri PERMANENTI indipendenti dalla stagione: marketSize (bacino città/territorio),
//   supporterPassion (calore tifoseria), historicalSupport (tradizione/radicamento). Il PRESTIGIO è solo UNO
//   dei fattori dell'affluenza, non il dominante. `CLUB_IDENTITY` cura a mano le piazze riconoscibili (~150);
//   i club non elencati derivano un profilo unico e stabile da lega/nazione/hash-id. Tutto puro e deterministico.
//   Terne: [marketSize, supporterPassion, historicalSupport] su scala 0-100.
// ============================================================================================================
const CLUB_IDENTITY={
  // — Italia (Lega A) — città + tifoseria + tradizione
  juve:[86,80,98],inter:[90,84,92],milan:[91,86,95],napoli:[84,97,78],roma:[88,95,80],lazio:[74,82,72],
  ata:[40,78,56],fio:[66,80,74],tor:[58,80,84],bol:[60,66,64],udi:[38,56,60],sas:[20,38,28],
  cag:[50,72,56],sam:[64,76,72],gen:[64,84,84],ver:[54,72,55],mon2:[40,44,34],lec:[46,72,50],
  // — Italia (Lega B, piazze storiche) —
  par:[52,64,66],cre:[36,50,44],mod:[42,54,50],pal:[70,88,66],cat:[52,80,54],spe:[34,50,40],
  bar2:[74,82,60],ven:[58,52,44],pis:[40,58,50],fro:[30,44,34],ces:[38,58,52],samp:[64,80,74],
  sal:[68,86,54],cit:[24,40,30],sdt:[26,40,30],cos:[40,64,42],bres:[52,58,52],lec2:[44,50,44],
  // — Inghilterra (Premier) —
  mcy:[80,72,74],liv:[78,92,92],ars:[86,86,88],che:[84,82,84],mun:[82,88,94],tot:[80,80,74],
  new:[64,92,78],avl:[62,78,74],whu:[70,82,72],bha:[40,58,44],eve:[60,82,78],lei:[50,66,56],
  wol:[52,68,58],cry:[56,72,54],ful:[68,58,54],bre:[48,52,42],nfo:[46,76,66],bou:[30,46,36],
  // — Inghilterra (Championship) —
  lut:[28,58,42],mid:[46,70,58],cov:[50,64,56],swn:[46,68,58],shu:[54,80,66],ips:[44,66,58],
  lee:[62,92,76],bur:[38,62,56],nor:[46,64,54],wba:[52,74,64],bri:[54,64,52],milw:[58,68,50],
  bla:[44,66,66],pre:[42,60,58],car:[52,72,56],wat:[48,54,50],sto:[46,66,58],qpr:[62,58,50],
  // — Spagna (Liga) —
  rma:[92,84,99],bar:[90,88,97],atm:[80,86,80],sev:[64,84,76],vill:[30,56,52],rsoc:[52,74,66],
  bet:[60,88,70],val:[68,82,78],osa:[40,76,56],cel:[50,74,60],ath:[58,90,82],ray:[56,74,54],
  gir:[42,54,44],mall:[48,60,50],get:[44,48,40],las:[50,66,52],alm:[38,52,42],esp:[62,74,66],
  // — Spagna (Liga 2) —
  dep:[58,82,72],real2:[46,66,58],lev:[52,68,52],tene:[48,68,52],vld:[54,68,58],hue:[30,48,40],
  bur2:[38,54,48],zgz:[62,80,68],mir:[22,40,34],alb:[40,54,44],elx:[46,56,48],mal:[62,80,64],
  snd:[56,84,70],ovi:[54,80,68],cad:[54,82,60],alm2:[40,54,44],cor2:[52,72,58],fer:[34,56,48],
  // — Germania (Bundes) —
  bay:[82,82,96],bvb:[72,96,84],rbl:[46,48,36],b04:[48,64,64],bsc:[74,74,64],fra:[68,86,72],
  fre:[40,62,52],wob:[34,46,48],mgb:[52,78,72],stu:[64,76,68],aug:[38,52,44],mai:[40,58,50],
  hof:[22,38,32],kol:[66,88,72],wer:[58,82,74],dsc:[36,52,46],boc:[46,74,60],ber:[70,74,58],
  // — Germania (Bundes 2) —
  hbu:[72,90,80],han:[56,70,60],nub:[54,76,68],kar:[44,60,54],kil:[40,54,46],kaa:[44,78,66],
  duf:[62,68,58],fur:[34,48,44],s04:[64,94,82],mag:[42,62,52],pad:[36,46,40],ros:[46,72,58],
  brn:[44,66,58],sar:[40,66,56],dre:[54,84,64],stp:[58,86,62],osn:[34,54,48],arm:[46,62,54],
  // — Francia (Ligue) —
  psg:[88,76,72],marse:[74,98,82],mon:[36,44,58],lyon:[70,80,74],nice:[54,68,58],lille:[62,74,64],
  ren:[52,68,58],len:[44,78,58],nan:[54,76,64],mtp:[48,60,52],rei:[44,54,50],tou:[56,58,50],
  lor:[34,52,48],bre2:[38,60,50],cle:[36,44,40],hac:[40,58,52],metz:[42,60,52],
  // — Francia (Ligue 2) —
  cae:[46,62,56],tro:[38,50,46],aux:[36,66,60],gui:[30,60,54],bas2:[34,84,58],aja2:[32,72,52],soch:[36,64,58],
  // — Portogallo —
  ben:[74,94,86],por:[66,92,84],spo:[70,88,80],bra:[48,74,60],vsc:[42,72,60],rioave:[28,44,38],
  // — Olanda —
  ajax:[72,86,88],psv:[58,80,74],feye:[68,92,82],az:[42,58,54],utr:[48,66,56],twe:[50,74,62],
  vita:[42,58,52],gron:[46,66,56],heer:[30,50,48],
  // — Belgio —
  club:[52,82,68],and:[64,84,78],genk:[42,66,56],gent:[48,66,56],std:[46,80,68],usj:[52,66,52],ant:[50,74,60],
  // — Turchia (tifoserie caldissime) —
  gal:[82,98,86],fenk:[80,96,82],bes:[74,92,80],tra:[52,90,72],bas:[64,72,54],ada:[54,74,54],siv:[40,58,46],
};
// natOf: nazione-tifoseria dalla lega (stabile su promozione/retrocessione entro lo stesso paese).
const _NAT_PASSION={it:69,en:66,es:67,de:66,fr:56,pt:67,nl:57,be:57,tr:82,nat:70,xx:56};
function _natCode(lg){lg=lg||"";return /Lega/.test(lg)?"it":/Premier|Championship/.test(lg)?"en":/Ibérica/.test(lg)?"es":/Deutsche/.test(lg)?"de":/Ligue/.test(lg)?"fr":/Lusitana/.test(lg)?"pt":/Oranje/.test(lg)?"nl":/Belga/.test(lg)?"be":/Anatolica/.test(lg)?"tr":/Nazionale/.test(lg)?"nat":"xx";}
// clubProfile(club): parametri strutturali PERMANENTI e DETERMINISTICI (id-seedati). Curati per i club noti,
//   derivati (unici per club) per gli altri. Il prestigio è solo UNO dei driver, mai il dominante.
function clubProfile(club){
  club=club||{};
  const id=club.id||club.n||"club";
  const lg=club.lg||"",nc=_natCode(lg);
  const isU18=!!club.isU18||/Primavera|Provini/.test(lg);
  const p=clamp((club.p||club.prestige||55),25,99);
  const Rk=(k,lo,hi)=>{const s=Math.abs(hashStr(id+"|"+k));return lo+(s%1000)/1000*(hi-lo);};
  const cur=CLUB_IDENTITY[club.id];
  let market,passion,history;
  if(cur){market=cur[0];passion=cur[1];history=cur[2];}
  else{ // derivazione UNICA per club (stabile): bacino da hash, calore da nazione, storia da prestigio — tutti con spread d'id
    market=Math.round(clamp(44+Rk("m",-15,15),12,80));
    passion=Math.round(clamp((_NAT_PASSION[nc]||56)+Rk("pa",-17,17),30,92));
    history=Math.round(clamp(p*0.52+16+Rk("hi",-10,10),22,82));
  }
  if(isU18){market=Math.min(market,18);passion=Math.min(passion,46);history=Math.min(history,36);}
  const loyalty=Math.round(clamp(passion*0.55+history*0.30+Rk("lo",-10,10),25,95));
  const econ=Math.round(clamp(p*0.52+market*0.36+Rk("ec",-7,7),20,99));
  const ticketLevel=Math.round(clamp(30+p*0.34+market*0.20+({en:12,it:4,es:2,fr:0,de:-3}[nc]||0),15,95));
  return {market,passion,history,loyalty,econ,ticketLevel,prestige:p,nat:nc,isU18};
}
if(typeof window!=='undefined')window.__CPM_clubProfile=clubProfile;// esposto per i test/simulatore
// profileCapacity: capienza dello stadio dal PROFILO (bacino domina, poi storia/prestigio), non dal solo prestigio.
//   Condivisa da stadiumConfigFor (geometria 3D) e dal fallback di computeCrowdContext → geometria↔affluenza coerenti.
//   pOverride: prestigio corretto dall'evoluzione (stadiumConfigFor lo passa). Curva 1.85 → suppressione del basso.
function profileCapacity(prof,pOverride){
  if(!prof)return 12000; if(prof.isU18)return 3000;
  const P=(pOverride!=null?pOverride:prof.prestige);
  const capScore=clamp(prof.market*0.44+prof.history*0.22+P*0.24+prof.passion*0.10,0,100);// 0-100
  const cap=Math.round((3000+Math.pow(capScore/100,1.85)*80000)/500)*500;
  return Math.max(9000,cap);
}
if(typeof window!=='undefined')window.__CPM_profileCapacity=profileCapacity;
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){try{window.__CPM_CLUBS=CLUBS;}catch(_e){}}// anagrafica per il simulatore affluenza (test-only)
/* §6/§7 — contesto folla: PURO e SEEDATO (deterministico run-to-run, gate-safe). Unica sorgente di
   verità per numero spettatori (MatchdayCard) e riempimento/atmosfera degli spalti 3D.
   [7.4.0 FASE 1] AFFLUENZA MULTI-FATTORE: non più (quasi) solo prestigio. Combina domanda STRUTTURALE
   (bacino/storia/passione/prestigio/economia dal clubProfile) + modificatori di CONTESTO tutti CAPPATI
   (classifica, forma, corsa, derby, importanza, finale, coppe, avversario, meteo, giorno/orario, prezzo),
   con la FEDELTÀ che smorza i cali e la PASSIONE che alza il pavimento. Nessun fattore domina. */
function computeCrowdContext(a){
  a=a||{};
  const ctx=a.context||"career";
  const club=a.homeClub||{};
  const prof=clubProfile(club);
  const p=prof.prestige,isU18=prof.isU18;
  const seed=Math.abs(hashStr((club.id||club.n||"casa")+"_folla_"+(a.week||1)+"_"+(a.season||1)+"_"+ctx));
  const R=k=>{const s=Math.abs(hashStr(seed+"_"+k));return (s%10000)/10000;};
  // ---- CAPIENZA: stabile per club (da stadiumConfigFor via a.capacity; altrimenti dal profilo). Provino piccolo. ----
  let cap;
  if(ctx==="trial")cap=2200;
  else if(a.capacity!=null)cap=isU18?Math.min(a.capacity,3000):a.capacity;
  else cap=isU18?3000:profileCapacity(prof);
  if(ctx!=="trial"&&!isU18)cap=Math.max(cap,CROWD_CFG.minSeniorCap||9000);// pavimento piazza pro
  // ---- TIER (compat: base intensità + quota ospiti; il fill vero arriva dal modello multi-fattore) ----
  const koCtx=ctx==="euro_ko"||ctx==="euroMondiale_ko";
  const tier=a.isFinal?"final":a.derby?"derby":ctx==="trial"?"trial":ctx==="friendly"?"friendly"
    :(a.matchWeight||1)>=7?"big":koCtx?"ko":ctx==="euro_group"?"euroGroup"
    :(ctx==="national"||ctx==="nationsCup"||ctx==="euroMondiale_group"||ctx==="euroMondiale_qualif")?"national"
    :ctx==="cup"?"cupEarly":isU18?"u18":"league";
  // ---- AFFLUENZA MULTI-FATTORE: domanda STRUTTURALE + modificatori di CONTESTO cappati (nessuno domina) ----
  let fill;
  if(ctx==="trial")fill=0.015+R("f")*0.020;
  else if(isU18)fill=clamp(0.06+R("f")*0.14+prof.passion/100*0.05,0.03,0.35);
  else if(ctx==="friendly")fill=clamp(0.14+R("f")*0.14+prof.passion/100*0.06,0.10,0.45);
  else{
    const structDemand=prof.market*0.30+prof.history*0.22+prof.passion*0.22+p*0.16+prof.econ*0.10;// 0-100
    let base=0.30+structDemand/100*0.46;// ~0.30–0.76 (riempimento di una gara di campionato media)
    if(a.fanbaseBonus)base+=clamp(a.fanbaseBonus,0,30)/100*0.18;// [7.6.0 FASE 2] la fanbase cresciuta nel tempo alza il riempimento (+ fino a ~5.4%)
    let mod=0;
    if(/2$|2 |Championship|Lega B/.test(club.lg||"")&&!isU18)mod-=0.04;// seconda divisione: un filo meno
    if(a.standPos&&a.standN>1)mod+=(1-(a.standPos-1)/(a.standN-1)-0.5)*0.16;// posizione in classifica (±0.08)
    if(a.formStreak)mod+=clamp(a.formStreak/5,-1,1)*0.10;// forma ultimi 5 (±0.10)
    if(a.raceBoost)mod+=clamp(a.raceBoost,0,1)*0.08;// corsa scudetto/salvezza (+0.08)
    if(a.derby)mod+=0.16;// derby ++
    if(a.matchWeight)mod+=clamp((a.matchWeight-5)/5,0,1)*0.10;// importanza gara (+0.10)
    if(a.isFinal)mod+=0.30;// finale +++
    if(/euro/.test(ctx))mod+=0.10;else if(ctx==="cup")mod-=0.03;// competizioni
    if(a.oppPrestige)mod+=clamp((a.oppPrestige-62)/38,0,1)*0.08;// avversario di prestigio richiama (+0.08)
    if(a.midweek||/^(cup|euro)/.test(ctx))mod-=0.07;// infrasettimanale · [7.187.0] coppa/Europa lo sono per costruzione: il flag a.midweek non veniva MAI valorizzato (malus di fatto morto)
    if(a.badHour)mod-=0.04;// orario scomodo
    mod-=clamp((prof.ticketLevel-52)/48,0,1)*0.05;// prezzo alto scoraggia (−0.05)
    const wm=CROWD_CFG.weatherMalus[a.weather?.id||""];if(wm)mod-=(1-wm)*0.75;// meteo
    if(mod<0)mod*=clamp(1-prof.loyalty/100*0.5,0.5,1);// la FEDELTÀ smorza i cali
    const floor=clamp(0.24+prof.passion/100*0.26+prof.loyalty/100*0.10,0.22,0.66);// la PASSIONE alza il pavimento
    fill=clamp(base+mod,floor,1.0);
    if(a.isFinal)fill=Math.max(fill,0.94);// una FINALE si esaurisce (campo neutro, evento clou) a prescindere dalla piazza
  }
  // ---- INTENSITÀ (atmosfera): riempimento × calore, con spinta derby/finale/KO ----
  /* [7.187.0 direttiva PO «rendi realistico il CALORE»] il calore non è il riempimento: una piazza calda con
     lo stadio a metà canta più di uno stadio pieno e freddo. La passione pesa di più del fill e la curva
     (che canta) resta calda anche quando le tribune si svuotano → contributo del fill con radice. */
  let intensity=clamp(Math.pow(clamp(fill,0,1),0.65)*0.42+prof.passion/100*0.44+prof.loyalty/100*0.10,0.05,1);
  if(tier==="derby")intensity=clamp(intensity+0.12,0,1);
  if(tier==="final"||koCtx)intensity=clamp(intensity+0.08,0,1);
  if(ctx==="trial")intensity=0.03;
  const aws=tier==="trial"?CROWD_CFG.awayShare.trial:tier==="derby"?CROWD_CFG.awayShare.derby
    :tier==="final"?CROWD_CFG.awayShare.final:koCtx?CROWD_CFG.awayShare.ko
    :/^euro/.test(ctx)?CROWD_CFG.awayShare.euro:ctx==="cup"?CROWD_CFG.awayShare.cup:CROWD_CFG.awayShare.normal;/* [7.187.0] il seguito ospite dipende dalla COMPETIZIONE: in Europa si viaggia in pochi, in coppa infrasettimanale meno che in campionato */
  const attendance=ctx==="trial"?(60+Math.round(R("att")*180)):Math.min(cap,Math.max(150,Math.round(cap*fill/50)*50));
  return{tier,fill:+fill.toFixed(3),awayFill:+Math.min(1,fill*aws).toFixed(3),intensity:+intensity.toFixed(3),
    passion:prof.passion,loyalty:prof.loyalty,/* [7.187.0] usate dal builder per compattezza/coreografie */
    capacity:cap,attendance,derby:!!a.derby,isFinal:!!a.isFinal,seed,
    profile:{market:prof.market,passion:prof.passion,history:prof.history,loyalty:prof.loyalty,econ:prof.econ}};
}
if(typeof window!=='undefined')window.__CPM_crowdCtx=computeCrowdContext;// esposto per i test analitici

/* ══════════ STADI DINAMICI — S1 FONDAMENTA (5.87.0) ══════════
   Design approvato dal PO in docs/STADIUM_SYSTEM_DESIGN.md: 3 slice · NIENTE pista d'atletica (mai) ·
   trasferta invertita (S3) · evoluzione AUTOMATICA derivata (zero save). S1 = SOLO strato dati:
   template architettonici + resolver puro/seedato + capienza REALISTICA e STABILE per club che alimenta
   computeCrowdContext e la MatchdayCard (prima la capienza cambiava a OGNI partita: seed con week/season).
   Nessun cambiamento visivo allo stadio 3D in questa slice (assemblatore modulare in S2). */
const STADIUM_TEMPLATES={
  provincia:   {rings:1,standH:0.70,dist:1.02,corner:"open",  roof:"none",   tower:"traliccio",    fence:"metal",mod:0.15},
  comunale:    {rings:1,standH:0.85,dist:1.04,corner:"open",  roof:"west",   tower:"perimetrali",  fence:"metal",mod:0.30},
  storico_it:  {rings:2,standH:1.00,dist:1.06,corner:"curve", roof:"partial",tower:"angolari_alte",fence:"plexi",mod:0.45},
  moderno_it:  {rings:2,standH:1.00,dist:0.95,corner:"closed",roof:"full",   tower:"tetto",        fence:"plexi",mod:0.85},
  inglese:     {rings:2,standH:1.15,dist:0.85,corner:"open",  roof:"full",   tower:"tetto",        fence:"none", mod:0.75},
  tedesco:     {rings:2,standH:1.25,dist:0.95,corner:"closed",roof:"full",   tower:"tetto",        fence:"plexi",mod:0.85,megaCurva:true},
  spagnolo:    {rings:3,standH:1.30,dist:1.00,corner:"closed",roof:"partial",tower:"perimetrali",  fence:"plexi",mod:0.55},
  francese:    {rings:2,standH:1.00,dist:1.05,corner:"open",  roof:"full",   tower:"tetto",        fence:"plexi",mod:0.90},
  olandese:    {rings:2,standH:1.05,dist:0.95,corner:"closed",roof:"full",   tower:"tetto",        fence:"plexi",mod:0.80},
  sudamericano:{rings:3,standH:1.35,dist:1.05,corner:"curve", roof:"none",   tower:"angolari_alte",fence:"high", mod:0.35,asym:true},
};
// mappa lega → pool di template (variazione per club via hash): l'identità architettonica nazionale
const STADIUM_LG_TPL={
  "Lega A":["storico_it","moderno_it","storico_it"],"Lega B":["comunale","storico_it"],
  "Premier Division":["inglese"],"Championship":["inglese","provincia"],
  "Liga Ibérica":["spagnolo","spagnolo","moderno_it"],"Liga Ibérica 2":["spagnolo","comunale"],
  "Deutsche Liga":["tedesco","tedesco","moderno_it","comunale"],"Deutsche Liga 2":["tedesco","comunale"],
  "Ligue Nationale":["francese","francese","moderno_it"],"Ligue Nationale 2":["comunale","francese"],
  "Liga Oranje":["olandese"],"Liga Lusitana":["spagnolo","sudamericano"],
  "Liga Belga":["olandese","comunale"],"Liga Anatolica":["sudamericano","moderno_it"],
};
// Resolver PURO e SEEDATO (hash del club → sempre lo stesso stadio, run-to-run e save-to-save).
// evo={prestigeShift,promoted,relegated,trophiesRecent} → EVOLUZIONE AUTOMATICA derivata (decisione PO #4).
// Override DATA-DRIVEN: un campo opzionale stadium:{...} sull'entry CLUBS personalizza senza toccare codice.
function stadiumConfigFor(club,evo){
  evo=evo||{};
  const isU18=!!(club&&club.isU18)||!!(club&&club.lg&&/Primavera|Provini/.test(club.lg));
  const h=Math.abs(hashStr(String((club&&(club.id||club.n))||"club")+"|stadio"));
  const p=clamp(((club&&(club.p||club.prestige))||60)+(evo.prestigeShift||0),30,99);
  const lg=(club&&club.lg)||"";
  let tplId=isU18?"provincia":(lg==="Nazionale"?"moderno_it":(STADIUM_LG_TPL[lg]||["comunale","storico_it"])[h%((STADIUM_LG_TPL[lg]||["comunale","storico_it"]).length)]);
  // [7.4.0 FASE 1] capienza dal PROFILO (bacino/storia/prestigio), non dal solo prestigio → una piazza grande in
  //   seconda serie (bacino alto, prestigio basso) resta uno stadio grande. Curva in profileCapacity; qui SOLO
  //   jitter d'id (varietà) + evoluzione (promozione/retrocessione) + Nazionale. Alimenta SIA geometria 3D SIA
  //   affluenza (a.capacity) → coerenti. p include già evo.prestigeShift (passato a profileCapacity come override).
  const _prof=clubProfile(club);
  let capacity=Math.round(profileCapacity(_prof,p)*(0.94+((h>>>3)%13)/100)/500)*500;// jitter ±6% deterministico per club
  if(isU18)capacity=Math.min(capacity,3000);
  else if(lg!=="Nazionale")capacity=Math.max(capacity,9000);// pavimento PIAZZA: nessun club professionistico sotto ~9k (coerente col floor di computeCrowdContext)
  if(lg==="Nazionale")capacity=Math.max(capacity,62000);
  if(evo.promoted)capacity=Math.round(capacity*1.2/500)*500;   // promozione → ampliamento
  if(evo.relegated)capacity=Math.round(capacity*0.95/500)*500; // retrocessione → settori chiusi
  if(evo.stadiumTier)capacity=Math.round(capacity*(1+Math.min(evo.stadiumTier,2)*0.22)/500)*500;// [7.6.0 FASE 2] ampliamenti pluriennali (tier 1 +22%, tier 2 +44%)
  // [6.1.0 · 7.4.0 VERIFICA MASSIVA PO] coerenza CAPIENZA↔ARCHITETTURA: un 32k+ non pesca mai il template basso
  //   (comunale/provincia), anche se la lega è di 2ª fascia (una grande piazza retrocessa — Palermo/Bari/Samp in
  //   Lega B — ha capienza grande ma il template della lega è piccolo). Ora un template GRANDE per nazione;
  //   un <12k non ha mai muro tedesco/3 anelli.
  const _bigTplFor=(l)=>/Ibérica|Lusitana/.test(l)?"spagnolo":/Deutsche/.test(l)?"tedesco":/Premier|Championship/.test(l)?"inglese":/Ligue/.test(l)?"francese":/Oranje|Belga/.test(l)?"olandese":/Anatolica/.test(l)?"moderno_it":"storico_it";
  if(!isU18){
    if(capacity>=32000&&(tplId==="comunale"||tplId==="provincia"))tplId=_bigTplFor(lg);
    if(capacity<12000&&(STADIUM_TEMPLATES[tplId].megaCurva||STADIUM_TEMPLATES[tplId].rings>=3))tplId="comunale";
  }
  const tpl=STADIUM_TEMPLATES[tplId]||STADIUM_TEMPLATES.comunale;
  const modernity=clamp((tpl.mod||0.4)+(p-60)/160+(((h>>>7)%20)-10)/100+((evo.trophiesRecent||0)>0?0.08:0),0.05,1);
  // [5.89.0 S3] ATMOSFERA per club: fattore di intensità del tifo (0.8–1.2) da hash + template "caldi"
  const atmo=clamp(0.85+((h>>>11)%28)/100+((tplId==="tedesco"||tplId==="sudamericano")?0.10:0)+(p>84?0.04:0),0.75,1.22);
  // [5.92.0 FIX PO «sembrano tutti uguali»] varietà DETERMINISTICA per club dentro lo stesso template:
  //   altezza ±10%, distanza ±8%, tono tetto/cemento, angoli talvolta a curva — due tedeschi non sono più cloni.
  const _jH=0.92+(((h>>>11)%17))/100, _jD=0.94+(((h>>>13)%13))/100;
  const _roofTone=((h>>>15)%3), _wallTone=((h>>>17)%2);
  const _cornerJ=(tpl.corner==="closed"&&((h>>>19)%3)===0)?"curve":tpl.corner;
  // [7.0.1 collaudo PO «lo stadio della Salernitana Primavera non è rispettato»] la Primavera gioca al campo
  //   satellite del SUO club (id ereditato dal club madre → stesso stadio di riferimento), non in uno stadio
  //   generico pescato a caso dal pool.
  const cfg={template:tplId,name:isU18?(((typeof getStadiumName==="function")?getStadiumName(club):"Campo")+" · Campo Primavera"):((typeof getStadiumName==="function")?getStadiumName(club):"Stadio"),atmo,
    capacity,prestige:p,modernity,rings:tpl.rings,corner:_cornerJ,roof:tpl.roof,tower:tpl.tower,
    fence:tpl.fence,standH:tpl.standH*_jH,dist:tpl.dist*_jD,roofTone:_roofTone,wallTone:_wallTone,megaCurva:!!tpl.megaCurva,asym:!!tpl.asym,
    screens:p>82?2:1,ledBoards:modernity>0.55,seatCol:(club&&club.c)||"#8a8a92",seatCol2:(club&&club.c2)||"#3a3a44",
    style:(typeof getStadiumStyle==="function")?getStadiumStyle(club):0};
  return (club&&club.stadium)?{...cfg,...club.stadium}:cfg;
}
if(typeof window!=='undefined')window.stadiumConfigFor=stadiumConfigFor;// esposto per i test analitici

// context-aware realistic attendance
function calcAttendance(homeClub,context,weather){
  // Sprint 81 — realistic prestige-based capacity ranges
  const ctx=context||"career";
  if(ctx==="trial")return rng(80,320);
  const p=homeClub?.p||homeClub?.prestige||60;
  const isU18=homeClub?.isU18;
  if(isU18)return rng(200,1200);
  let base;
  if(p>=90)base=rng(45000,78000);
  else if(p>=80)base=rng(22000,50000);
  else if(p>=65)base=rng(10000,25000);
  else if(p>=52)base=rng(4000,12000);
  else if(p>=38)base=rng(1200,4500);
  else base=rng(300,1500);
  // Sprint 91 — weather reduces attendance
  const wid=weather?.id||"";
  if(wid==="storm"||wid==="blizzard"||wid==="heavy_rain")base=Math.round(base*0.68);
  else if(wid==="rain"||wid==="snow"||wid==="fog"||wid==="hail")base=Math.round(base*0.84);
  else if(wid==="drizzle"||wid==="cold")base=Math.round(base*0.93);
  return base;
}
// Poisson-like integer: most matches end 0-0, 1-0, 1-1, 2-1, 2-0
function poissonGoals(lambda){
  // Knuth algorithm for Poisson sample, capped at 5
  const L=Math.exp(-lambda);let k=0,p=1;
  do{k++;p*=Math.random();}while(p>L&&k<9);// [5.97.0 SL-4] cap allineato al path seedato (era 5 vs 8)
  return Math.max(0,k-1);
}
// [5.97.0 CP-6] SPAREGGIO KO stat-based e SEEDATO: il vecchio Math.random()<0.55 fisso rendeva
//   il pareggio strategicamente conveniente e ignorava le stat. Ora: base 50% + OVR (±6/10 OVR) + morale.
function koShootoutWin(p,seedStr){
  const q=clamp(0.50+((((p&&p.ovr)||65)-70)*0.006)+((((p&&p.morale)||60)-60)*0.0015),0.35,0.72);
  return seededRng((Math.abs(hashStr(String(seedStr)))>>>0)||1)()<q;
}
// Quick simulation for skipped/missed match weeks — uses club prestige + playerOvr influence
// [5.76.0 BUG-6] seed opzionale → risultato RIPRODUCIBILE (stessa λ, rng seedato); senza seed compat invariata
/* [7.200.0 collaudo PO «le partite simulate le perdo o pareggio quasi sempre: troppa severità, deve essere
   realistica anche la simulazione»] TRE cause misurate (probe `sim-balance-test`, stagione intera simulata):
   (1) la squadra del giocatore era l'UNICA valutata sul PRESTIGIO BASE — `updateStandings` (~6826) somma
       `clubPrestigeShifts` a tutti gli altri club, qui non arrivavano mai: un club cresciuto fino a 66-73
       effettivi continuava a giocare le proprie partite come la matricola da 45 del database;
   (2) la CURVA era più ripida di quella con cui viene riempita la classifica in cui compete (1.10/0.95
       contro 1.00/0.85) → doppia penalità per chi è sotto la media della lega;
   (3) il PAVIMENTO di 0.25 gol attesi (un gol ogni 4 partite) non esiste nel calcio: nemmeno l'ultima in
       classifica segna così poco. Misura prima del fix: club p45 = 13 punti a stagione (75% sconfitte).
   Ora: prestigi EFFETTIVI su entrambi i lati (stessa formula e stesso clamp di updateStandings), gradiente
   allineato al modello di lega, pavimenti/soffitti calcistici (0.62-2.55 in casa · 0.55-2.45 fuori) e —
   soprattutto — il FUORICLASSE PESA: il protagonista è il valore aggiunto della squadra, un 88 OVR sposta
   la stagione invece di valere 2 punti. */
/* ========================================================================
   [7.337.0 direttiva PO] RITIRO 2.0 — «L'eroe deve VIVERE il ritiro, non organizzarlo».
   Tre motori PURI e SEEDATI (club+stagione): il racconto del precampionato è deciso
   dalla SOCIETÀ e dallo STAFF, mai dal giocatore.
   - ritiroPlan(p): località/hotel/centro/sponsor/clima/durata/eventi DIVERSI ogni
     stagione + la PREPARAZIONE decisa dallo staff (derivata da filosofia del mister,
     categoria, qualità della rosa, obiettivi, coppe europee, numero di nuovi acquisti,
     condizione fisica) con la motivazione esplicita.
   - ritiroHierarchyVerdict(p,plan): le gerarchie le stabilisce SOLO l'allenatore —
     responso derivato da età/OVR/esperienza/rendimento precedente/livello rosa/acquisti
     nel ruolo. L'eroe riceve il responso; poi cambieranno solo le prestazioni.
   - ritiroFriendlies(p,plan): calendario di amichevoli (selezione locale → pari
     categoria → internazionale) con la DECISIONE DELLO STAFF sull'impiego dell'eroe
     (titolare/subentro/panchina/non convocato) e conseguenze reali su fiducia/forma.
   Niente entra in matchHistory (amichevoli: zero presenze/standings/anti-loop).
======================================================================== */
const RITIRO_LOCS=[
  {n:"Valdorlando",e:"🏔️",clima:"fresco di montagna",fl:"boschi, aria fina e salite che tolgono il fiato"},
  {n:"Lago Sereno",e:"🌅",clima:"mite sul lago",fl:"nebbioline all'alba e corse lungo il pontile"},
  {n:"Costa del Faro",e:"🌊",clima:"brezza di mare",fl:"sabbia per i piedi e vento contro"},
  {n:"Sankt Alben",e:"⛰️",clima:"alpino e ventoso",fl:"prati perfetti e notti fredde"},
  {n:"Pineta Alta",e:"🌲",clima:"ombroso tra i pini",fl:"resina nell'aria e sentieri infiniti"},
  {n:"Colle Ventoso",e:"🌬️",clima:"ventilato di collina",fl:"il pallone curva da solo"},
  {n:"Bad Quellen",e:"♨️",clima:"termale",fl:"vasche di recupero e silenzio"},
  {n:"Punta Miramar",e:"🏖️",clima:"caldo atlantico",fl:"doppie sedute all'alba per scappare dal sole"},
  {n:"Alpe Chiara",e:"🐄",clima:"d'alta quota",fl:"fiato corto i primi giorni, gambe d'acciaio dopo"},
  {n:"Terme di Rocca",e:"🏛️",clima:"asciutto e caldo",fl:"pietra antica e campi appena rifatti"},
  {n:"Verdefonte",e:"⛲",clima:"umido di valle",fl:"erba alta e tifosi ovunque"},
  {n:"Isola Brezza",e:"🏝️",clima:"insulare",fl:"traghetto, salsedine e un campo in mezzo al blu"},
  {n:"Montenevoso",e:"❄️",clima:"rigido anche d'estate",fl:"felpe in luglio e fiato che si vede"},
  {n:"Prato del Re",e:"👑",clima:"continentale",fl:"otto campi in fila e una tribuna sempre piena"}];
const RITIRO_HOTELS=["Grand Hotel Panorama","Sport Resort La Quercia","Albergo La Vetta","Hotel Belvedere Reale","Residence del Parco","Villa dei Pini","Elite Mountain Lodge","Hotel Fontechiara"];
const RITIRO_CENTRI=["Centro Tecnico Federale","Arena Verde","Cittadella dello Sport","Campo Base"];
const RITIRO_SPONSOR=["NORDIK","VOLTARA","CRISTALLA","VULCANO GYM","OLIMPO","SKYLINEA"];
const RITIRO_EVENTS=[
  {e:"🏃",t:"Doppia seduta",d:"mattina atletica, pomeriggio col pallone: si rientra a cena senza parole"},
  {e:"🧠",t:"Riunione tecnica",d:"video, lavagna e i principi del mister ripetuti fino a saperli a memoria"},
  {e:"🏋️",t:"Palestra e test fisici",d:"lo staff misura tutto: chi è indietro lo sa subito"},
  {e:"⚽",t:"Partitella in famiglia",d:"titolari contro riserve — nessuno vuole perdere nemmeno questa"},
  {e:"🗣️",t:"Discorso del capitano",d:"a cena il capitano parla al gruppo: «qui si suda per la maglia»"},
  {e:"📸",t:"Shooting con le nuove maglie",d:"foto ufficiali: le nuove divise brillano sotto i riflettori"},
  {e:"✍️",t:"Firma autografi",d:"i tifosi arrivati in ritiro aspettano fuori dal campo: si firma tutto"},
  {e:"🎤",t:"Conferenza dal ritiro",d:"la stampa sale a trovare la squadra: domande su obiettivi e mercato"},
  {e:"🧗",t:"Team building",d:"una giornata fuori dal campo: il gruppo si scopre squadra"},
  {e:"🍝",t:"Cena di squadra",d:"tavolata unica, i nuovi in piedi a cantare: benvenuti nel gruppo"},
  {e:"🌊",t:"Recupero in acqua",d:"piscina fredda e fisioterapia: le gambe ringraziano"},
  {e:"🚌",t:"Visita dei tifosi organizzati",d:"pullman di tifosi al campo: cori d'estate, la stagione chiama"},
  {e:"😴",t:"Giornata libera",d:"mezza giornata di riposo: chi dorme, chi chiama casa"},
  {e:"🎯",t:"Lavoro sui calci piazzati",d:"schemi provati e riprovati: il mister vuole i dettagli"},
  {e:"🩹",t:"Piccoli acciacchi gestiti",d:"lo staff medico dosa i carichi: nessun rischio inutile"},
  {e:"🎥",t:"Contenuti per i social del club",d:"telecamere al seguito: il ritiro raccontato ai tifosi da casa"}];
const ritiroPlan=(p)=>{
  const sn=p.season||1,cid=(p.club&&p.club.id)||"x";
  const H=(s)=>Math.abs(hashStr(cid+"|rit2|"+sn+"|"+s));
  const loc=RITIRO_LOCS[H("loc")%RITIRO_LOCS.length];
  const hotel=RITIRO_HOTELS[H("hot")%RITIRO_HOTELS.length];
  const centro=RITIRO_CENTRI[H("cen")%RITIRO_CENTRI.length]+" di "+loc.n;
  const sponsor=RITIRO_SPONSOR[H("spo")%RITIRO_SPONSOR.length];
  const days=10+H("day")%8;
  /* eventi: 4 distinti, seedati */
  const evs=[];{const used=new Set();let k=0;while(evs.length<4&&k<40){const i=H("ev"+k)%RITIRO_EVENTS.length;if(!used.has(i)){used.add(i);evs.push(RITIRO_EVENTS[i]);}k++;}}
  /* nuovi acquisti dal diff rosa (7.147) + eventuale concorrente nel ruolo dell'eroe */
  let signings=[],inRole=null;
  try{const cu=generateTeamRoster(p.club,sn)||[],pr=sn>1?(generateTeamRoster(p.club,sn-1)||[]):[];
    signings=cu.map((r,i)=>({name:r.name,role:r.role,out:pr[i]?pr[i].name:null})).filter((m,i)=>m.out&&m.name!==m.out);
    const fam=/attacc|ala|centravanti|trequart|punta/i.test(String(p.position||"Attaccante"))?/attacc|ala|centravanti|trequart|punta/i:/centrocamp|mediano|mezzala|regista/i.test(String(p.position||""))?/centrocamp|mediano|mezzala|regista/i:/difens|terzino|centrale/i;
    inRole=signings.find(s=>fam.test(String(s.role||"")))||null;
  }catch(_e){}
  /* PREPARAZIONE: decide lo STAFF — punteggi derivati dai fattori reali, mai scelti dall'eroe */
  const style=(p.coach&&p.coach.style)||"Bilanciato";
  const tier2=(typeof LEAGUE_PAIRS!=="undefined")&&LEAGUE_PAIRS.some(pr2=>pr2[1]===(p.club&&p.club.lg));
  const euro=!!(p.euro&&p.euro.active);
  const nSign=signings.length;
  const ambizioso=(p.seasonObjectives||[]).some(o=>o&&o.type==="standing"&&(o.target||20)<=6);
  const tired=(p.fatigue||0)>45;
  const sc={atletico:0,tattico:0,tecnico:0,equilibrato:2,rigenerante:-3};
  if(style==="Pressing"||style==="Contropiede")sc.atletico+=4;
  if(style==="Difensivo")sc.tattico+=3;
  if(style==="Possesso Palla"){sc.tecnico+=3;sc.tattico+=2;}
  if(style==="Offensivo")sc.tecnico+=2;
  if(tier2)sc.atletico+=2;else sc.tecnico+=1;
  if(euro){sc.tattico+=3;sc.rigenerante+=2;}
  if(nSign>=3)sc.tattico+=3;else if(nSign<=1)sc.atletico+=1;
  if(ambizioso)sc.tattico+=1;
  if(tired)sc.rigenerante+=7;
  Object.keys(sc).forEach((k,i)=>{sc[k]+=H("prep"+i)%3;});
  const pid=Object.keys(sc).sort((a,b)=>sc[b]-sc[a])[0];
  const reasons=[];
  if(pid==="atletico"){if(style==="Pressing"||style==="Contropiede")reasons.push("il calcio d'intensità che chiede il mister");if(tier2)reasons.push("la battaglia della categoria");if(nSign<=1)reasons.push("un gruppo che si conosce già");}
  if(pid==="tattico"){if(euro)reasons.push("il doppio impegno europeo");if(nSign>=3)reasons.push(`${nSign} volti nuovi da integrare`);if(style==="Difensivo"||style==="Possesso Palla")reasons.push("i principi di gioco del mister");if(ambizioso)reasons.push("gli obiettivi dichiarati dalla società");}
  if(pid==="tecnico")reasons.push(style==="Possesso Palla"?"la qualità che il mister pretende palla al piede":"la qualità della rosa");
  if(pid==="rigenerante")reasons.push("una rosa arrivata stanca a fine stagione");
  if(pid==="equilibrato")reasons.push("un'estate senza urgenze: si costruisce con calma");
  const PREPS={
    atletico:{l:"molto intensa sul piano atletico",e:"🏃",fx:{form:4,fatigue:14,chem:2},int:"altissima",risk:"un po' più alto"},
    tattico:{l:"centrata sul lavoro tattico",e:"🧠",fx:{form:2,fatigue:8,chem:4,trust:2},int:"cerebrale",risk:"contenuto"},
    tecnico:{l:"tutta sul pallone e sulla qualità",e:"⚽",fx:{form:3,fatigue:7,chem:3},int:"alta",risk:"basso"},
    equilibrato:{l:"equilibrata tra lavoro atletico e tecnico",e:"⚖️",fx:{form:3,fatigue:9,chem:3,trust:1},int:"sostenuta",risk:"nella norma"},
    rigenerante:{l:"dosata: prima si ricaricano le batterie",e:"🔋",fx:{form:5,fatigue:3,chem:2},int:"progressiva",risk:"minimo"}};
  return{season:sn,loc,hotel,centro,sponsor,days,events:evs,signings:signings.slice(0,5),inRole,
    prep:{id:pid,...PREPS[pid],reason:reasons.length?reasons.join(" e "):"le valutazioni dello staff"}};
};
const ritiroHierarchyVerdict=(p,plan)=>{
  const ovr=p.ovr||60,age=p.age||20,lvl=(p.club&&(p.club.prestige||p.club.p))||65;
  const lastH=(p.history||[]).slice(-1)[0]||null;
  const lastG=lastH?(lastH.leagueGoals!=null?lastH.leagueGoals:(lastH.goals||0)):0;
  let s=(ovr-lvl)*1.1+(age<=20?-4:age>=30?2:0)+Math.min(6,(p.totalMatches||0)/40)
    +(lastG>=15?5:lastG>=8?2:0)+(p.isCaptain?6:0)+((p.coachTrust||60)-60)*0.12
    -(plan&&plan.inRole?5:0);
  const rival=plan&&plan.inRole?` L'arrivo di ${plan.inRole.name} nel tuo reparto alza la concorrenza.`:"";
  if(s>=12)return{band:"fermo",msg:"Il mister ti considera un punto fermo: sei tra i titolari, ma dovrai confermarti ogni settimana."+rival,fx:{trust:2,morale:2}};
  if(s>=5)return{band:"vicino",msg:"Sei vicino ai titolari: le gerarchie sono aperte e le deciderà il campo."+rival,fx:{trust:1,morale:1}};
  if(s>=-2)return{band:"alternativa",msg:"Lo staff tecnico ti considera una valida alternativa: sfrutta ogni occasione."+rival,fx:{}};
  if(s>=-8)return{band:"indietro",msg:"Parti leggermente indietro nelle gerarchie: il mister vuole osservarti nelle prime settimane."+rival,fx:{morale:-1}};
  return{band:"panchina",msg:"Partirai dalla panchina nelle prime amichevoli: ogni minuto andrà guadagnato in allenamento."+rival,fx:{morale:-2}};
};
const ritiroFriendlies=(p,plan)=>{
  const sn=p.season||1,cid=(p.club&&p.club.id)||"x";
  const H=(s)=>Math.abs(hashStr(cid+"|rit2am|"+sn+"|"+s));
  const verdict=ritiroHierarchyVerdict(p,plan);
  /* avversarie: selezione locale → pari categoria → internazionale (livello ∝ prestigio del club) */
  const opps=[];
  opps.push({club:{id:"amic-loc-"+sn,n:"Selezione "+plan.loc.n,p:26},kind:"la squadra del posto"});
  try{const pool=getLeagueClubs(p).filter(c=>c&&c.id!==(p.club&&p.club.id));
    if(pool.length)opps.push({club:pool[H("same")%pool.length],kind:"pari categoria"});}catch(_e){}
  try{const myLg=(p.club&&p.club.lg)||"",myP=(p.club&&p.club.p)||60;
    const intl=CLUBS.filter(c=>c.lg!==myLg&&Math.abs(c.p-(myP+8))<=10);
    if(intl.length)opps.push({club:intl[H("intl")%intl.length],kind:myP>=76?"big europea":"club internazionale"});}catch(_e){}
  /* impiego deciso dallo STAFF dalla gerarchia (con la rotazione tipica del precampionato) */
  const EMP={fermo:["titolare","titolare","titolare"],vicino:["titolare","subentro","titolare"],alternativa:["subentro","titolare","subentro"],indietro:["subentro","panchina","subentro"],panchina:["panchina","subentro","nc"]}[verdict.band]||["subentro","subentro","panchina"];
  return opps.map((o,i)=>{
    const sd=H("m"+i);
    let status=EMP[i]||"subentro";
    if(status==="titolare"&&sd%7===0)status="subentro";/* rotazione: anche i titolari riposano */
    const sim=simulateMatch(p.club,o.club,p.ovr||60,true,sd,p.clubPrestigeShifts||{});
    const played=status==="titolare"||status==="subentro";
    const rat=played?Math.round(clamp(5.9+((p.form||70)-70)*0.02+((sd%25)-12)*0.09,4.8,8.6)*10)/10:null;
    const min=status==="subentro"?(46+sd%25):status==="titolare"?(60+sd%31):0;
    const fx=!played?(status==="nc"?{morale:-1}:{chem:1})
      :rat>=7.2?{trust:2,form:1,morale:1}:rat>=6.2?{trust:1}:rat<5.5?{form:-1}:{};
    return{opp:o.club.n,kind:o.kind,hs:sim.homeScore,as:sim.awayScore,status,min,rat,fx};
  });
};

/* ========================================================================
   [7.338.0 direttiva PO] IL NO HA UNA VOCE — reazioni al RIFIUTO di un'offerta.
   Il 7.307.0 dava già gli effetti (popolarità/fiducia/chimica) ma li sussurrava in un toast: la fedeltà non
   si VEDEVA da nessuna parte. `refuseEcho` è puro e seedato: dal peso REALE dell'offerta (salto di prestigio
   + salto di stipendio, dati che l'offerta porta già) deriva la fascia e le reazioni di chi esiste davvero
   nel salvataggio — la curva col suo legame, il presidente, il mister COL SUO NOME, un compagno VERO della
   rosa, la firma che ti segue. Nessun campo nuovo, nessun testo inventato su fatti non accaduti.
======================================================================== */
/* ========================================================================
   [7.339.0 direttiva PO «il gioco deve essere in grado di ABBOZZARE gli appunti del bug rispetto a quello che
   ha visto realtime nel live match»] IL REFERTO DELL'AZIONE. Puro: prende la traccia del pallone registrata dal
   testimone nel render-loop (`__CPM_WATCH_SNAP`) più il contesto logico dell'highlight, e ne ricava in italiano
   ciò che NON torna — le stesse classi di difetto che il PO ha segnalato a mano nelle ultime settimane:
   pallone che torna indietro, salti/teletrasporti, palla parcheggiata, uscita dal campo, il compagno che doveva
   arrivarci e non arriva, esito dichiarato che non combacia con dove è finita la palla. È una BOZZA: la nota
   resta editabile, e se non trova nulla lo dice — meglio una riga onesta che una diagnosi inventata.
======================================================================== */
const draftBugNote=(snap,ctx)=>{try{
  const L=[];const c=ctx||{};
  const S=(snap&&snap.samples)||[];
  const gx=(snap&&snap.goalX)||46;
  if(S.length>=8){
    /* [7.340.0] la finestra d'analisi è LA SCENA scelta (tutta, dall'inizio alla fine), non un ritaglio di
       secondi: col testimone che copre l'intera partita si può annotare anche un'azione di venti minuti prima. */
    const t1=S[S.length-1].t;
    /* [7.524.0 — MISURATO: i numeri identici delle note 7.523 (6,8u camera · 14,4u indietro, perfino su
       PARTITE diverse) NON descrivevano nessuna azione] Quando la scena scelta col selettore ◀ non e' piu'
       nell'anello (sovrascritta), questa riga ripiegava sugli ULTIMI 7 SECONDI — che in pausa sono
       CONGELATI e contengono CRONACA: la palla che viaggia legittimamente verso la propria meta' campo
       diventava «tornato INDIETRO» (misurato sul flusso: drawdown 51,2u su soli campioni di cronaca,
       f=1 arco BG), e ogni nota della seduta usciva con gli stessi numeri. Una misura che non e' della
       scena non si spaccia per la scena: si dichiara. */
    const _skHit524=c.sceneKey!=null&&S.some(q=>q.sk===c.sceneKey);
    if(c.sceneKey!=null&&!_skHit524)return "⚠️ la registrazione non copre più questa azione (il testimone tiene l'ultimo tratto di partita a piena risoluzione e questa scena è stata sovrascritta): nessuna misura automatica — descrivi a parole. ";
    let W=_skHit524?S.filter(q=>q.sk===c.sceneKey):S.filter(q=>t1-q.t<=7000);
    /* [7.341.0] la finestra FINISCE CON L'AZIONE: dopo il gol la palla torna a centrocampo per la ripresa e a
       esito concluso si assesta — campionare oltre faceva dire «la palla si e' fermata a 35 unita' dalla porta»
       su gol regolarissimi. Si taglia all'ultimo istante in cui arco o post-arco erano vivi, piu' un margine. */
    {let _la=-1;for(let i=0;i<W.length;i++)if((W[i].f&3)!==0)_la=i;
     if(_la>=0){const _te=W[_la].t+320;W=W.filter(q=>q.t<=_te);}}
    /* [7.420.0] LA FINESTRA FINISCE CON LA SCENA, ANCHE SENZA ARCHI. Il taglio qui sopra e' ancorato
       agli archi (f&3) — ma una difensiva risolta senza arco non ne ha nessuno, il taglio non scatta
       e la finestra sconfina nella cronaca BG (stessa sk fino al prossimo highlight): un gol vero del
       BG diventava «palla in rete» attribuita alla scena. Il bit 8 del testimone dice quando la fase
       hl finisce davvero: si taglia li' (+320ms), archi o non archi. */
    {let _lh=-1;for(let i=0;i<W.length;i++)if((W[i].f&8)!==0)_lh=i;
     if(_lh>=0){const _te2=W[_lh].t+320;W=W.filter(q=>q.t<=_te2);}}
    /* [7.341.0] VERSO DELL'AZIONE: in una scena DIFENSIVA attacca l'avversario — la palla che scende verso la
       nostra porta e' il gioco, non un difetto, e un gol subito finisce nella porta di CASA. */
    const _isDefSc=!!c.def||/goal_against|recover|tackle_win|intercept|clear|throw_in|corner_conceded|beaten|anticipate|loose|save|block/i.test(String(c.out||"")+" "+String(c.intent||""));/* [7.525.0 collaudo PO #45 «Corpo sulla traiettoria», recover→save] la regex diceva `recovery` ma l'intent difensivo e' `recover` (senza y) e l'esito `save` non c'era: il codice 001 scattava su una scena in cui la palla DEVE stare all'avversario — falso positivo dello strumento. `recover` copre entrambi per sottostringa. */
    let back=0,backDD=0,jump=0,jumpAt=null,jumpDt=0,still=0,stillRun=0,out=0,live=0,moved=0,x0=null,xMax=-1e9;
    /* [7.524.0 — le note 7.523 portano numeri IDENTICI su scene e PARTITE diverse (6,8u camera · 14,4u
       indietro): in isolamento il force-path e' pulito, quindi il fenomeno vive nel flusso live sul
       dispositivo — stessa storia del «traballa» 7.404, stessa cura: la bozza dira' QUANDO (secondi dalla
       scena) e CHI (codice scrittore _ws524 dall'anello) — cosi' la prossima nota inchioda il colpevole
       invece di ripetere una grandezza anonima. */
    const _WS524=["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa"];
    const _tW0=W.length?W[0].t:0;const _tRel524=(t)=>((t-_tW0)/1000).toFixed(1);
    let _bkT=null,_bkStep=0,_bkWs=0,_bkDt=0,_bkStepT=null;
    /* [7.339.0] STACCO DI SCENA: quando cambia la scena (hlSitKey) la palla viene riposizionata DI PROPOSITO.
       Ignoro una finestra di grazia dopo ogni cambio — altrimenti ogni highlight sembrerebbe un teletrasporto
       (e' la trappola che nel Live Validator marcava meta' degli highlight come FAIL). */
    const snapT=[];for(let i=1;i<W.length;i++){if(W[i].sk!==W[i-1].sk)snapT.push(W[i].t);
      /* [collaudo PO gi187 «CAMERA salta 33.8u + SALTO pallone 18.4u in 29ms» su scena switch] ANCHE LA FINE
         DELLA SCENA E' UNO STACCO. La finestra d'analisi tiene +320ms dopo l'ultimo frame hl (il settle
         dell'esito serve alle analisi di posizione) — ma in quei 320ms la camera TORNA IN BROADCAST (~30u di
         taglio voluto) e la palla viene RI-PIAZZATA per la ripresa della cronaca (10-20u): sk non cambia fino
         all'highlight successivo, quindi nearSnap non li graziava e i due tagli finivano in bozza come
         teletrasporti di scena. Misurato sul force-path: gi187 pulita su tutte e tre le azioni (palla ≤1,0u,
         camera ≤0,9u) — i numeri della bozza erano il RIENTRO, non l'azione. Il fronte di discesa del bit 8
         (fase hl → cronaca) entra nella lista degli stacchi dichiarati, con la stessa grazia degli altri. */
      if(((W[i-1].f&8)!==0)&&((W[i].f&8)===0))snapT.push(W[i].t);}
    /* [7.340.0] anche l'INIZIO della finestra è un setup: quando si analizza una singola scena tutti i campioni
       hanno la stessa chiave, quindi il cambio non si vede — ma il riposizionamento di palla e giocatori c'è
       comunque. I primi 750 ms della scena non si giudicano. */
    if(W.length)snapT.push(W[0].t);
    const nearSnap=(t)=>snapT.some(st=>t-st>=-60&&t-st<=750);
    for(let i=1;i<W.length;i++){
      const a=W[i-1],b=W[i],dt=(b.t-a.t)/1000;if(dt<=0||dt>0.5)continue;
      const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
      /* [7.341.0] il cammino percorso serve a una cosa sola: sapere se la palla È GIÀ PARTITA. Si azzera
         quando l'arco si arma — da lì in poi «ferma» vuol dire davvero ferma. Contare anche i metri del
         riposizionamento di scena apriva la guardia prima della battuta, e la RINCORSA (l'eroe che carica il
         tiro col pallone che aspetta a terra: 1,5-3,3s misurati su tap-in, deviazioni e calci d'angolo)
         tornava a essere segnalata come difetto. I salti di setup non sono moto e restano esclusi. */
      if(((a.f&1)===0)&&((b.f&1)!==0))moved=0;
      if(d<3)moved+=d;
      if(nearSnap(b.t))continue;
      const acting=(b.f&3)!==0;/* arco o post-arco vivi: è un momento in cui la palla DEVE fare qualcosa */
      if(acting){live+=dt;if(x0==null)x0=a.x;if(b.x>xMax)xMax=b.x;
        /* [7.341.0] «tornato indietro» vuol dire INVERSIONE: prima avanza, poi rincula. Una battuta d'angolo
           parte dalla bandierina (a un passo dalla linea di fondo) e la consegna in area retrocede SEMPRE in x
           — contarla come difetto segnalava ogni corner del gioco. Si conta solo dopo un progresso reale. */
        if(dx<0&&!_isDefSc&&xMax>=x0+2){back+=-dx;/* [storico] SOMMA di tutti gli arretramenti: resta per compatibilita', ma non e' la grandezza da leggere */
          /* [7.466.0 collaudo PO «il pallone e' tornato INDIETRO di 14,2 unita'», DUE VOLTE LO STESSO NUMERO
             su scene diverse] UN NUMERO CHE SI RIPETE IDENTICO SU AZIONI DIVERSE NON DESCRIVE L'AZIONE: e'
             la firma di un ACCUMULO, esattamente come il «salto di 8,7 unita'» del 7.360 che era la soglia
             moltiplicata per l'intervallo di campionamento. `back` sommava OGNI decremento di x fotogramma
             per fotogramma: un pallone che oscilla, o che viaggia in curva, accumula decine di unita' senza
             mai tornare indietro davvero. La grandezza che significa «e' tornato indietro» e' il MASSIMO
             ARRETRAMENTO dal punto piu' avanzato raggiunto — il drawdown — che e' quello che si vede. */
          if(xMax-b.x>backDD){backDD=xMax-b.x;_bkT=b.t;}
          if(-dx>_bkStep){_bkStep=-dx;_bkWs=b.ws||0;_bkDt=dt;_bkStepT=b.t;}/* [7.524.0] il passo all'indietro peggiore, col suo scrittore */}}
      /* teletrasporto = VELOCITÀ impossibile, non distanza cruda: a frame rate basso un tiro vero percorre
         parecchi metri fra due fotogrammi (nessun pallone del motore supera ~60 u/s). */
      if(dt<=0.05&&d/dt>200&&d>jump){jump=d;jumpAt=b;jumpDt=dt;}/* [7.360.0] DUE CORREZIONI, entrambe misurate. (a) Il giudizio si da' SOLO su un intervallo che e' davvero un fotogramma (<=50ms): con l'anello che perdeva risoluzione si giudicava su finestre da mezzo secondo e si chiamava «fotogramma». (b) 85 u/s non e' una velocita' impossibile per un pallone calciato — il commento del 7.341 diceva «nessun pallone del motore supera ~60 u/s», ma misurando si vedono conclusioni oltre gli 85 e riposizionamenti a 300-1100. La soglia sta dove sta il confine vero: sopra i 200 u/s non e' piu' un tiro, e' un teletrasporto. */
      /* [7.341.0] la palla FERMA conta solo DOPO che è partita: con l'arco già armato l'eroe carica il tiro e il
         pallone aspetta sul posto (misurato: 0,7-1,9s di attesa a inizio scena su tiri, punizioni e dribbling —
         era la rincorsa, non un difetto, e faceva scattare la segnalazione su 14 azioni sane su 25). */
      if(moved>1.5&&(b.f&1)&&!(b.f&4)&&d<0.06){stillRun+=dt;if(stillRun>still)still=stillRun;}else stillRun=0;/* [7.339.0] solo con l'ARCO vivo e FUORI dal build-up (che muove la palla per conto suo): nel post-arco la palla può legittimamente assestarsi e durante la costruzione l'arco è armato ma non ancora lanciato — segnalarli sarebbe rumore */
      if(Math.abs(b.x)>50.5||Math.abs(b.z)>32.5)out=Math.max(out,Math.max(Math.abs(b.x)-50.5,Math.abs(b.z)-32.5));
    }
    const last=W[W.length-1]||S[S.length-1];
    /* [7.341.0] SOGLIA MISURATA sul setaccio: dopo un tiro parato o un dribbling perso il pallone rimbalza
       all'indietro di 6-8 unità (è fisica, non un difetto: sul pool intero il massimo legittimo misurato è
       7,9). I boomerang VERI che il PO ha segnalato erano di tutt'altra scala — 18-23 unità sull'appoggio
       dell'uno-due (7.330) e sulla restituzione del «dai e vai» (7.333). La soglia sta in mezzo. */
    /* [7.404.0 collaudo PO «traballa» ×6] IL TREMOLIO DELLA CAMERA SI MISURA DOVE ACCADE. In headless non
       si riproduce (sei strumenti: posa forzata GLB-off e GLB-on, DOM, flusso vero corto e lungo — camera
       sempre immobile): il fenomeno vive a frame-rate pieno. Qui, sul dispositivo del PO, si contano le
       INVERSIONI di direzione della camera (piu' di 3 al secondo = tremolio) e il passo massimo fra due
       fotogrammi (oltre 2,5 unita' a scena in corso = strappo) — fuori dalla grazia degli stacchi, che
       sono tagli voluti. La prossima nota «traballa» arrivera' col numero attaccato. */
    {let _cRev=0,_cMax=0,_cVel=0,_cPrev=0,_cDur=0,_yRev=0,_yPrev=0,_yMax=0,_pRev=0,_pPrev=0,_pMax=0,_cMaxT=null,_cMaxDt=0;
     for(let i=1;i<W.length;i++){const a=W[i-1],b=W[i],dt=(b.t-a.t)/1000;
       if(dt<=0||dt>0.5||b.cx==null||a.cx==null)continue;if(nearSnap(b.t))continue;
       if((b.f&16)||(a.f&16))continue;/* [7.528.0] fotogramma dentro la MASCHERA di un taglio voluto (bit 16): il passo della camera li' e' il taglio stesso, non un difetto — era la riga «salta a 3,7s» fotocopiata nelle note PO */
       _cDur+=dt;const _dc=Math.hypot(b.cx-a.cx,(b.cy-a.cy)||0,(b.cz-a.cz)||0);
       if(_dc>_cMax){_cMax=_dc;_cMaxT=b.t;_cMaxDt=dt;}
       if(_dc/dt>_cVel)_cVel=_dc/dt;/* [7.463.0] la VELOCITA' e' la grandezza indipendente dal frame-rate: e' quella che dice se la camera ha strappato o se il telefono ha perso fotogrammi */
       const _dcx=b.cx-a.cx;if(Math.abs(_dcx)>0.12){if(_cPrev&&Math.sign(_dcx)!==Math.sign(_cPrev))_cRev++;_cPrev=_dcx;}
       /* [7.408.0] l'ASSE DI SGUARDO: yaw dell'asse ottico per fotogramma — un'oscillazione qui dondola
          lo schermo anche a camera perfettamente ferma (i richiami 7.225/7.237 ruotano SOLO il look) */
       if(b.lx!=null&&a.lx!=null){
         const _y1=Math.atan2(a.lz-a.cz,a.lx-a.cx),_y2=Math.atan2(b.lz-b.cz,b.lx-b.cx);
         let _dy=_y2-_y1;while(_dy>Math.PI)_dy-=2*Math.PI;while(_dy<-Math.PI)_dy+=2*Math.PI;
         if(Math.abs(_dy)>0.006){if(_yPrev&&Math.sign(_dy)!==Math.sign(_yPrev))_yRev++;_yPrev=_dy;}
         if(Math.abs(_dy)>_yMax)_yMax=Math.abs(_dy);
         /* [collaudo PO gi108 «Traballa, risolvi definitivamente! (Codice 007 da memorizzare)»] IL BECCHEGGIO
            MANCAVA ALLA MISURA. Le note «traballa» arrivate SENZA la riga-camera (gi108 su 7.433, post-7.408)
            dicono che il fenomeno vive sotto le soglie o su un asse non misurato: lo yaw c'e' dal 7.408, il
            PITCH (dondolio su/giu' dell'asse ottico) no — un nod verticale non faceva mai scattare niente. */
         const _h1=Math.hypot(a.lx-a.cx,a.lz-a.cz)||1e-6,_h2=Math.hypot(b.lx-b.cx,b.lz-b.cz)||1e-6;
         const _p1=Math.atan2((a.ly!=null?a.ly:0)-(a.cy||0),_h1),_p2=Math.atan2((b.ly!=null?b.ly:0)-(b.cy||0),_h2);
         const _dp=_p2-_p1;
         if(Math.abs(_dp)>0.006){if(_pPrev&&Math.sign(_dp)!==Math.sign(_pPrev))_pRev++;_pPrev=_dp;}
         if(Math.abs(_dp)>_pMax)_pMax=Math.abs(_dp);}}
     /* [7.526.0] ATTRIBUZIONE DELLO SGUARDO: l'anello porta per campione l'ultima passata camera del
        fotogramma (wl = conteggio*10+codice). Sul flip per-frame (31,7 inv/s, nota PO su 7.525) i due
        codici che si alternano SONO i colpevoli: la bozza li nomina, con la media di passate/fotogramma. */
     const _WL526=["lerp","porta","guinzaglio","gk","bordo-tanh","bordo-lift","bisezione","snap","sguardo-pre","vista-reale"];
     let _wlCnt526={},_wlTot526=0,_wlPass526=0;
     for(const q of W){if(q.wl==null||nearSnap(q.t))continue;const _v=Math.round(q.wl);const _cd=_v%10,_ct=Math.floor(_v/10);
       _wlCnt526[_cd]=(_wlCnt526[_cd]||0)+1;_wlTot526++;_wlPass526+=_ct;}
     const _wlTop526=Object.entries(_wlCnt526).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${_WL526[+k]||k} ${Math.round(100*v/Math.max(1,_wlTot526))}%`).join(" + ");
     const _wlMed526=_wlTot526?(_wlPass526/_wlTot526).toFixed(1):"—";
     const _cRevS=_cDur>0.5?_cRev/_cDur:0,_yRevS=_cDur>0.5?_yRev/_cDur:0,_pRevS=_cDur>0.5?_pRev/_cDur:0;
     /* [7.408.0] soglie ABBASSATE (3→1,5 rev/s · 2,5→1,2u): le prime note «traballa» su 7.405 NON hanno
        fatto scattare la riga — o il tremolio sta sotto le soglie vecchie, o e' nell'asse di sguardo. */
     /* [gi108] «codice 007» = la classe TRABALLA, come chiesto dal PO: ogni riga-camera della bozza
        arriva etichettata col codice, cosi' le prossime note si riconoscono a colpo d'occhio. */
     /* [7.463.0 — CENSITO: la riga «la CAMERA salta» si accendeva DA SOLA] Il passo per fotogramma NON e'
        una proprieta' della camera, e' una proprieta' del FRAME-RATE: la stessa panoramica vale 0,2u a
        60fps e 1,2u a 10fps, quindi su un telefono che perde fotogrammi la soglia si supera senza che sia
        successo nulla. La soglia di 1,2u non era mai stata misurata (il 7.404 ne stimava 2,5, il 7.408
        l'ha abbassata su un'ipotesi dichiarata nel commento). CENSIMENTO su gioco sano — partite vere,
        detector VERO fatto girare scena per scena (`camera-step-census-test.mjs`): passo mediano 1,57u,
        p90 2,07u, MASSIMO 2,07u; velocita' mediana 43,8 u/s, massimo 65 u/s. A 1,2u venivano etichettate
        3 scene sane su 5. Il lotto di note del PO riporta 1,4 · 2,0 · 2,0 · 2,2 — cioe' dentro la banda
        normale, su note il cui difetto vero era un altro — e un solo 14,3, un ordine di grandezza oltre.
        Ora servono ENTRAMBE: una velocita' che il movimento normale non raggiunge (150 u/s contro un
        massimo sano di 65) e un passo oltre il massimo sano (2,5u, che e' anche la soglia stimata dal
        7.404). Sul censimento: zero scene sane etichettate; un salto da 14,3u a 60fps vale ~860 u/s e
        resta preso. */
     if(_cRevS>=1.5)L.push(`codice 007 — la CAMERA trema: ${_cRevS.toFixed(1)} inversioni di direzione al secondo (passo max ${_cMax.toFixed(2)} unità)`);
     else if(_cMax>=2.5&&_cVel>=150)L.push(`codice 007 — la CAMERA salta: passo di ${_cMax.toFixed(1)} unità fra due fotogrammi a scena in corso (${_cVel.toFixed(0)} u/s)${_cMaxT!=null?` — a ${_tRel524(_cMaxT)}s dall'inizio scena, intervallo ${Math.round(_cMaxDt*1000)}ms`:""}`);
     if(_yRevS>=2)L.push(`codice 007 — lo SGUARDO della camera oscilla: ${_yRevS.toFixed(1)} inversioni/s dell'asse ottico (ampiezza max ${(_yMax*57.3).toFixed(1)}°)${_wlTop526?` — ultima passata per fotogramma: ${_wlTop526} · ${_wlMed526} passate/fotogramma`:""}`);
     if(_pRevS>=2)L.push(`codice 007 — la camera BECCHEGGIA: ${_pRevS.toFixed(1)} inversioni/s su-giù dell'asse ottico (ampiezza max ${(_pMax*57.3).toFixed(1)}°)${_wlTop526?` — ultima passata: ${_wlTop526}`:""}`);}
    if(backDD>=12&&_skHit524)L.push(`codice 012 — il pallone è tornato INDIETRO di ${backDD.toFixed(1)} unità durante l'azione (dal punto più avanzato, verso la propria metà campo)${_bkT!=null?` — massimo arretramento a ${_tRel524(_bkT)}s dall'inizio scena`:""}${_bkStep>0.5?`; passo peggiore ${_bkStep.toFixed(1)}u in ${Math.round(_bkDt*1000)}ms a ${_bkStepT!=null?_tRel524(_bkStepT):"?"}s, scrittore: ${_WS524[_bkWs]||_bkWs}`:""}`);
    if(jump>=6)L.push(`SALTO del pallone di ${jump.toFixed(1)} unità in ${Math.round(jumpDt*1000)} ms${jumpAt?` (a x ${jumpAt.x.toFixed(1)}, a ${_tRel524(jumpAt.t)}s dall'inizio scena, scrittore: ${_WS524[jumpAt.ws||0]||jumpAt.ws})`:""} — ${Math.round(jump/jumpDt)} u/s, sembra un teletrasporto`);/* [7.360.0] la bozza dichiara l'INTERVALLO REALE e la velocità: «in un fotogramma» era una promessa che la sonda non poteva mantenere, e ha fatto finire la stessa riga falsa in quattro note del PO */
    /* [7.341.0] in una scena DIFENSIVA l'arco è un segnaposto (la traiettoria vera la decide il post-guard
       difensivo) e il pallone resta legittimamente ai piedi dell'avversario mentre si consuma il duello:
       misurato su gi54, 1,9-2,5s di «palla ferma» che a schermo è semplicemente un portatore sotto pressione.
       Là si pretende un'immobilità molto più lunga per gridare al difetto. */
    if(still>=(_isDefSc?3:1.4))L.push(`codice 011 — la palla è rimasta FERMA ${still.toFixed(1)}s con l'azione in corso (arco attivo) e poi è ripartita`);
    if(out>=1.5)L.push(`la palla è uscita dal campo di ${out.toFixed(1)} unità`);
    /* [7.417.0 collaudo PO gi126/gi108 «001» su scene aeree] IL CODICE 001 DIVENTA UNA MISURA DEL
       TESTIMONE. In headless le stesse scene aprono con la palla ADDOSSO all'eroe (0,0-0,1u su tre
       repliche): il fenomeno vive solo nel flusso live sul dispositivo — stessa storia del
       «traballa» (7.404/7.408), quindi stessa cura: la bozza automatica ora DICE se all'apertura il
       pallone non era ai piedi di nessuno dei nostri. Finestra 0,75-2,4s dal via della scena (la
       grazia del riposizionamento resta fuori), palla lontana sia dal compagno di movimento piu'
       vicino (md, gia' nell'anello) sia dall'eroe per almeno tre quarti dei campioni. Solo scene
       offensive: in una difensiva il pallone ce l'ha l'avversario, ed e' giusto cosi'. */
    /* ⚠️ [7.680.0 — DUE DIFETTI NELLO STRUMENTO CHE SCRIVE LE NOTE DEL PO, trovati inseguendo il 001
       in quattro regimi di laboratorio senza mai riprodurlo (laboratorio secco, con presentazione,
       col metro del dispositivo su tutte e 191 le scene, e in «vivo emulato» con intro percorsa:
       3-4 scene su 161, e mai una di quelle che il PO segnala).
       (1) L'EROE ERA MISURATO SU UN ASSE SOLO. `Math.abs(q.x-q.hx)` e' la differenza di X fra pallone
       ed eroe, non la loro distanza — mentre il compagno (`md`) e' un `hypot` vero. Due metri diversi
       confrontati con la stessa soglia di 3,5: quello dell'eroe SOTTOSTIMA (un eroe dall'altra parte
       del campo alla stessa altezza dava zero). Era cosi' perche' l'anello non portava la z dell'eroe:
       ora la porta (16->17 float) e la distanza e' una distanza.
       (2) IL 001 POTEVA MISURARE A CAVALLO DI DUE SCENE. Quando la chiave di scena non aggancia
       (`_skHit524` falso) la finestra qui sopra prende gli ULTIMI 7 SECONDI, che possono contenere la
       coda della scena precedente — e `W[0].t`, preso come «via della scena», e' allora solo il
       campione piu' vecchio del buffer. Un eroe che nella scena di prima stava altrove diventa un 001
       che nessuno ha vissuto. Ora il codice 001 esce SOLO con i campioni agganciati alla scena: meglio
       tacere che accusare a cavallo di due azioni. */
    if(!_isDefSc&&_skHit524&&W.length>=6){const _t001=W[0].t;let _fN=0,_wN=0,_fMin=1e9,_fHer=1e9;
      for(const q of W){const _dt0=q.t-_t001;if(_dt0<750||_dt0>2400)continue;_wN++;
        const _dm=(q.md==null||q.md<0)?99:q.md;
        const _dh0=(q.hx==null)?0:Math.hypot(q.x-q.hx,(q.z||0)-(q.hz==null?(q.z||0):q.hz));
        if(_dm>3.5&&_dh0>3.5){_fN++;if(_dm<_fMin)_fMin=_dm;if(_dh0<_fHer)_fHer=_dh0;}}
      if(_wN>=4&&_fN>=_wN*0.75)L.push(`codice 001 MISURATO: all'apertura il pallone non è ai piedi di nessuno dei nostri (compagno più vicino ${_fMin>90?">90":_fMin.toFixed(1)}u, eroe ≥${_fHer.toFixed(1)}u per ${_fN} campioni)`);}
    /* [7.339.0] il compagno lo si aspetta SOLO dove l'azione lo prevede (passaggio/cross/assist/catena):
       su un tiro nessuno deve arrivare sul pallone, segnalarlo sarebbe un falso allarme. */
    /* [7.341.0] il destinatario lo si pretende solo se l'azione è RIUSCITA: su una giocata fallita è NORMALE
       che nessuno arrivi sul pallone (misurato: 9 falsi allarmi su 35 nel setaccio delle difensive). */
    /* [7.361.0 collaudo PO #97, un DRIBBLING: «nessun compagno e' mai arrivato sul pallone... eppure
       l'azione prevedeva un destinatario»] `chance` NON e' un destinatario. Vuol dire «hai creato
       un'occasione», e su un dribbling o un tiro non c'e' nessun compagno che debba arrivare sul pallone:
       la riga partiva a vuoto, come il «salto di 8,7 unita'» del 7.360. Restano gli esiti che un
       destinatario lo nominano davvero (assist, cross) e la lista degli intenti, che gia' copre
       pass/cross/onetwo/through/assist/switch/build/progression. Su #17, che e' un cross, la riga continua
       a scattare — e li' e' vera: 13,0 unita' di compagno piu' vicino su un cross sono un difetto. */
    /* [7.364.0 collaudo PO #17 «nessun compagno e' mai arrivato sul pallone... eppure l'azione prevedeva un
       destinatario», su un cross] TERZA BOZZA FALSA DELLA STESSA FAMIGLIA, dopo il «salto di 8,7 unita'»
       (7.360) e `chance` come destinatario (7.361). Qui la regola guarda l'INTENTO DICHIARATO della scena,
       non cosa l'azione e' DIVENTATA: su una situation dichiarata `cross` la cui azione si risolve in un
       TIRO IN RETE la riga partiva lo stesso, e su un tiro in porta nessun compagno deve arrivare sul
       pallone. MISURATO: delle 13 scene che la riga segnalava, OTTO erano tiri finiti in rete (ht=shot,
       post=in_net/in_net_high) e solo tre erano cross veri — e in quelle tre il ricevente risulta agganciato
       e convergente a 1,8-2,7 unita' dal bersaglio dell'arco, cioe' la macchina funziona.
       Il discriminante non e' un'etichetta ma il PALLONE: se ha superato il piano dei pali, l'azione si e'
       conclusa in porta e il destinatario non si pretende. */
    const _inRete64=W.some(q=>q&&q.x>gx-0.05);
    const _mateDue=c.ok===true&&!_inRete64&&(/pass|cross|onetwo|through|assist|switch|build|progression/i.test(String(c.intent||""))||/assist|cross/i.test(String(c.out||"")));
    const mds=W.filter(q=>q.md>=0).map(q=>q.md);
    if(_mateDue&&mds.length>6){const mn=Math.min(...mds);
      if(mn>4.5)L.push(`nessun compagno è mai arrivato sul pallone (il più vicino si è fermato a ${mn.toFixed(1)} unità) — eppure l'azione prevedeva un destinatario`);}
    /* esito dichiarato ⟺ dove è finita davvero la palla */
    if(last&&c.out){
      /* la porta di riferimento e' quella verso cui si stava giocando: un gol SUBITO finisce in casa nostra */
      const hx=(snap&&snap.homeX!=null)?snap.homeX:-gx;
      const own=/goal_against/i.test(String(c.out)),tx=own?hx:gx,sgn=own?-1:1;
      const inNet=(sgn*(last.x-tx))>=-0.3&&Math.abs(last.z)<3.9&&last.y<2.7;/* [7.341.0] geometria REALE della porta (semi-larghezza 3.66, traversa 2.44): con la soglia larga un pallone fermo nella bocca della porta, ma in gioco, veniva letto come gol */
      const netKey=/goal|in_net/.test(String(c.out));
      /* [7.341.0] la palla in rete è legittima anche sull'ASSIST (segna il compagno): il falso gol si denuncia
         solo quando l'esito dichiarato non prevede in nessun modo il pallone dentro. */
      if(inNet&&!netKey&&!/assist/.test(String(c.out)))L.push(`l'esito dichiarato è «${c.out}» ma la palla è finita IN RETE`);
      /* [7.341.0] IL GOL SI GIUDICA SU DOVE LA PALLA È ARRIVATA, NON SU DOVE SI FERMA: dopo essere entrata il
         pallone si assesta nella bocca della porta e la scena rientra: leggere l'ultimo campione faceva dire
         «fermata a 5 unità dalla porta» su reti regolari. Si misura la penetrazione MASSIMA della scena.
         E la si pretende solo dove la conclusione è davvero dell'eroe: l'assist finisce sui piedi del compagno
         (il suo invariante è «qualcuno è arrivato sul pallone», controllato sopra) e dal 7.8.10 dribbling,
         corsa e uno-due con premio GOL sono convertiti in OCCASIONE — il primo tocco NON segna, finalizza la
         catena — quindi la palla si ferma corta per progetto. Senza queste due distinzioni il setaccio
         segnalava 101 azioni sane su 191. */
      let bestPen=-1e9;for(const q of W){const pen=sgn*(q.x-tx);if(pen>bestPen)bestPen=pen;}
      const _concl=own||/shot|header|penalty|freekick|volley|finish|tap/i.test(String(c.intent||""));
      const _tol=own?14:6;
      if(!inNet&&netKey&&_concl&&bestPen<-_tol){
        /* [7.408.0 collaudo PO gi33/gi44, due volte lo stesso «49,9»] LA BOZZA DICE ANCHE PERCHE'. In
           isolamento la traiettoria del gol subito arriva in porta (misurato: x -48, due repliche); nel
           flusso concatenato la palla resta a meta' campo — e il numero costante suggerisce che NON PARTE
           proprio. I flag del testimone (arco/post-arco vivi) lo dicono: se nella scena non c'e' nemmeno
           un fotogramma con l'esito in moto, il difetto e' l'ARMAMENTO, non la traiettoria. */
        const _fLive=W.filter(q=>(q.f&3)!==0).length;
        const _lastAct524=(()=>{for(let i=W.length-1;i>=0;i--)if((W[i].f&3)!==0)return W[i];return null;})();/* [7.524.0] l'ultimo fotogramma d'azione dice chi teneva la penna quando la corsa verso la porta e' morta */
        L.push(`l'esito dichiarato è «${c.out}» ma la palla non è mai arrivata in porta (si è fermata a ${(-bestPen).toFixed(1)} unità)${_fLive===0?" — e la traiettoria dell'esito NON È MAI PARTITA (zero fotogrammi con arco/post-arco vivi nella scena)":` — arco/post-arco vivi per ${_fLive} fotogrammi${_lastAct524?`, ultimo scrittore in azione: ${_WS524[_lastAct524.ws||0]||_lastAct524.ws} (a ${_tRel524(_lastAct524.t)}s, x ${_lastAct524.x.toFixed(1)})`:""}`}`);}
    }
    /* [7.408.0 collaudo PO gi71 «il pallone rimane indietro durante la corsa» · gi40 «non e'
       sincronizzato» — in isolamento GLB-off la conduzione e' pulita (0 fotogrammi dietro, max 0,6u):
       il fenomeno e' percettivo a 60fps. Qui, sul dispositivo del PO: gap 1D eroe↔palla in x durante
       l'esito di un DRIBBLING — se supera le 4 unita' per piu' di mezzo secondo, la bozza lo dichiara. */
    if(/dribble/i.test(String(c.intent||""))){
      let _gapT=0,_gapMax=0;
      for(let i=1;i<W.length;i++){const a=W[i-1],b=W[i],dt=(b.t-a.t)/1000;
        if(dt<=0||dt>0.5)continue;if(nearSnap(b.t))continue;if((b.f&3)===0)continue;
        const _g=Math.abs(b.x-b.hx);if(_g>4)_gapT+=dt;if(_g>_gapMax)_gapMax=_g;}
      if(_gapT>0.5)L.push(`nel dribbling il pallone e l'eroe si separano: gap oltre 4 unità per ${_gapT.toFixed(1)}s (max ${_gapMax.toFixed(1)}u)`);}
  }
  /* incongruenze puramente logiche, leggibili anche senza traccia */
  if(c.intent&&c.act){
    if(/header/.test(c.intent)&&/terra|rasoterra/i.test(c.act))L.push(`azione di testa con un'esecuzione rasoterra`);
  }
  if(!L.length)return "";
  return `Cosa ho visto (bozza automatica):\n· ${L.join("\n· ")}\n\nCosa non va secondo me: `;
}catch(_e){return "";}};
const refuseEcho=(p,o)=>{try{
  if(!p||!o||o.isRenewal)return null;
  const myP=clamp((p.club&&p.club.p)||50,1,99),thP=clamp((o.club&&o.club.p)||myP,1,99);
  const myW=Math.max(1,(p.contract&&p.contract.wage)||1),thW=Math.max(1,o.wage||myW);
  const dP=thP-myP,rW=thW/myW;
  /* [7.417.0 collaudo PO «ho rifiutato un'offerta dell'Atletico, nessuna reazione?!»] IL CALIBRO
     CONTA QUANTO IL SALTO. Il tier misurava solo il SALTO (dP, rW): per una stella in un top club
     dP non puo' piu' essere ≥5 — OGNI rifiuto diventava «normale» = silenzio a vita, anche il no a
     una corazzata. Ma rifiutare una big fa notizia per il CALIBRO dell'offerente: la piazza celebra
     chi resta nonostante il corteggiamento, il salto non c'entra. Ora una corazzata (prestigio ≥82)
     vale almeno «importante», e una big quasi pari alla tua (≥86, entro 6 di distanza) col rilancio
     d'ingaggio (≥1,35) e' «storica». Le soglie del salto restano identiche per tutti gli altri. */
  const tier=((dP>=12&&rW>=1.6)||dP>=22||rW>=2.6||(thP>=86&&dP>=-6&&rW>=1.35))?"storica":(dP>=5||rW>=1.25||thP>=82)?"importante":"normale";
  const cn=(o.club&&o.club.n)||"un altro club",myN=(p.club&&p.club.n)||"il club";
  const cid=(p.club&&(p.club.id||p.club.n))||"x";
  const _fl=Array.isArray(p.fanLegend)?p.fanLegend:[];/* [7.338.0] difesa: un save col campo corrotto non deve far saltare la scena */
  const seasons=((_fl.find(f=>f&&f.clubId===cid)||{}).seasons)||0;
  const bond=seasons*10+((p.popularity||0)*0.15)+((p.isCaptain)?8:0);
  const seed=Math.abs(hashStr((p.name||"H")+"|refuse|"+(p.season||1)+"|"+(p.week||1)+"|"+cn))>>>0;
  const pick=(arr,salt)=>arr[(seed+salt*7919)%arr.length];
  const sn=(nm)=>{try{return (typeof _surnBG==="function"&&_surnBG(nm))||nm;}catch(_e){return nm;}};
  const voices=[];
  /* la curva: parla in proporzione al legame che ha davvero con te */
  if(tier!=="normale")voices.push({e:"🧣",who:"La curva",line:bond>=45
    ?pick([`Striscione pronto per domenica: «${(p.name||"").split(" ").slice(-1)[0].toUpperCase()} UNO DI NOI».`,`Sotto la sede, cori per un'ora: la Sud lo sapeva già prima dei giornali.`],1)
    :pick([`In curva hanno letto la notizia e hanno cantato il tuo nome per dieci minuti.`,`«Chi resta quando può andare, qui non si dimentica»: lo striscione è comparso in nottata.`],2)});
  /* il presidente: il no gli toglie un pensiero */
  if(tier==="storica")voices.push({e:"🏛️",who:"Il presidente",line:pick([`«Ho detto no a un assegno importante anch'io, oggi. Ma la squadra si costruisce così.»`,`«Questo club se lo ricorderà. Adesso però portiamoci a casa qualcosa insieme.»`],3)});
  /* il mister, col suo nome vero */
  {const mn=(p.coach&&p.coach.name)||"Il mister";
   voices.push({e:"🎽",who:mn,line:tier==="storica"
     ?pick([`«Con te in gruppo, riprogrammo tutto. Adesso ti voglio decisivo.»`,`«Non ti chiedo altro: sei rimasto, ora comanda il campo.»`],4)
     :pick([`«Bene così: qui il tuo posto ce l'hai. Dimostrami che ho ragione.»`,`«Non mi piacciono le teste altrove. La tua è qui: si lavora.»`],5)});}
  /* un compagno REALE della rosa */
  {const tms=(p.teammates||[]).filter(t=>t&&t.name);
   if(tms.length&&tier!=="normale"){const tm=tms[seed%tms.length];
     voices.push({e:"🤝",who:sn(tm.name),line:pick([`ti ha cercato appena l'ha saputo: «Sapevo che restavi».`,`nello spogliatoio ha detto una cosa sola: «Adesso però ce la giochiamo davvero».`],6)});}}
  /* la stampa: la firma che ti segue */
  {const js=(p.journalists||[]).filter(j=>j&&j.name);
   if(js.length&&tier==="storica"){const j=js[(seed>>3)%js.length];
     voices.push({e:"📰",who:(j.paper||sn(j.name)),line:pick([`titola: «Il no che vale una bandiera».`,`apre con la tua faccia e una riga sola: «È rimasto».`],7)});}}
  const head=tier==="storica"?`Hai detto no al ${cn}`:tier==="importante"?`Rifiutata l'offerta del ${cn}`:`Sondaggio del ${cn} respinto`;
  const body=tier==="storica"
    ?`Sul tavolo c'erano ${(typeof _fmtWageY133==="function")?_fmtWageY133(thW):thW+"€"} l'anno e un club da ${thP} di prestigio. Hai scelto ${myN}: da oggi questa piazza ti guarda in un altro modo.`
    :tier==="importante"?`${cn} ci aveva provato sul serio. Nessun tentennamento: si continua qui.`
    :`Un sondaggio senza sostanza, declinato in giornata. La squadra non se n'è nemmeno accorta.`;
  const fx=tier==="storica"?{popularity:7,coachTrust:8,teamChemistry:4,morale:4}
    :tier==="importante"?{popularity:2,coachTrust:3,teamChemistry:1,morale:1}:{};
  return{tier,head,body,voices,fx,club:cn,wage:thW};
}catch(_e){return null;}};
function simulateMatch(playerClub,opponent,playerOvr,isHome=true,seed,shifts){
  const _rng=seed!=null?seededRng((seed>>>0)||1):Math.random;
  const _pg=l=>seed!=null?seededPoissonGoals(l,_rng):poissonGoals(l);
  const _sh=shifts||{};
  const clubP=clamp((playerClub?.p||65)+(_sh[playerClub?.id||playerClub?.n]||0),30,99);
  const oppP=clamp((opponent?.p||65)+(_sh[opponent?.id||opponent?.n]||0),30,99);
  const ovrBonus=clamp(((playerOvr||65)-68)/42,-0.30,0.85);/* [7.200.0] il protagonista fa la differenza (era /180 = +0.13 a OVR 88: +2 punti a stagione) */
  const homeFactor=isHome?0.16:-0.16;
  const diff=clamp((clubP-oppP)/34,-1,1);
  // S12.6: club persona tweaks lambda
  const oppPersona=getClubPersona(opponent);
  const personaMod=oppPersona?oppPersona.lambdaMod*0.5:0;
  const lambdaH=clamp(1.42+diff*0.95+homeFactor+ovrBonus-personaMod,0.62,2.95);// [7.200.0] curva allineata alla lega + pavimento calcistico
  const lambdaA=clamp(1.26-diff*0.82-homeFactor-ovrBonus*0.32+personaMod,0.48,2.45);
  const hG=_pg(lambdaH);
  const aG=_pg(lambdaA);
  const _m=hG-aG;
  const _baseRat=_m>0?(6.2+Math.min(_m*0.25,0.8)):(_m===0?5.8:(5.5-Math.min(-_m*0.18,0.5)));
  const _ovrMod=_m>0?clamp(((playerOvr||65)-65)/200,-0.1,0.3):clamp(((playerOvr||65)-65)/260,-0.08,0.22);/* [7.261.0 collaudo PO «non essere severo con le simulazioni»] la qualità contava SOLO nelle vittorie: un fuoriclasse che pareggia prendeva 5.8 tondo come una riserva. Ora pesa (meno) anche su pari e sconfitta — bounded ±0.22, e resta NEGATIVA per chi è sotto la media: il voto non è un regalo, è il riconoscimento del livello */
  const _simRating=Math.round(clamp(_baseRat+_ovrMod+(_rng()-0.5)*0.4,4.0,9.5)*10)/10;
  return{homeScore:hG,awayScore:aG,won:hG>aG,drew:hG===aG,rating:_simRating,opponent:opponent?.n||opponent?.name,oppAbbr:opponent?.a||opponent?.abbr,oppCol:opponent?.c||opponent?.col,simulated:true};
}
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){try{window.__CPM_simMatch=simulateMatch;}catch(_e){}}// [7.200.0] esposto al simulatore di bilanciamento (test-only)
// Sprint 131: probabilistic player goals/assists for simulated matches
function _pSimStats(sim,ovr,archId,rng){// [5.76.0 BUG-6] rng opzionale seedato → G/A del giocatore riproducibili nelle partite simulate
  const R=rng||Math.random;
  const tg=sim.homeScore||0;
  if(tg===0)return{goals:0,assists:0};
  const o=ovr||65;
  /* [7.261.0 collaudo PO «non essere severo con le simulazioni, l'eroe spesso non fa assist e gol»] la curva
     storica dava λ-gol ~0.33 a OVR 71 → 72% di sim SENZA gol dell'eroe anche a squadra in rete (vs ~1 gol/gara
     giocando dal vivo). Ora λ scala davvero con l'OVR: 65→~0.31 · 71→~0.42 · 80→~0.58 · 88→~0.73 (+arch/won),
     assist analoghi → l'eroe è COINVOLTO (G o A) in circa metà delle sim vinte, da star quasi sempre. */
  const gL=clamp((o-48)/55+(["bomber","centravanti"].includes(archId)?0.14:0)+(sim.won?0.07:0),0.06,0.92);
  const aL=clamp((o-48)/75+(["trequartista","fantasista"].includes(archId)?0.10:0),0.04,0.55);
  const r1=R(),r2=R();
  const pe=x=>Math.exp(-x);
  const g=r1<pe(gL)?0:r1<pe(gL)*(1+gL)?1:2;
  const a=r2<pe(aL)?0:r2<pe(aL)*(1+aL)?1:2;
  return{goals:Math.min(g,tg),assists:Math.min(a,Math.max(0,tg-g))};
}
/* [7.261.0 collaudo PO «nel toast del risultato specifica se l'eroe ha fatto assist e gol ed il voto»] riga-eroe
   condivisa dai toast dei path SIMULA: G/A solo se >0, voto sempre (se disponibile). */
function _heroSimLine(ps,rating){const _p=[];if(ps&&ps.goals)_p.push(`⚽${ps.goals}`);if(ps&&ps.assists)_p.push(`🅰️${ps.assists}`);if(rating!=null)_p.push(`voto ${rating}`);return _p.length?` · ${_p.join(" · ")}`:"";}

