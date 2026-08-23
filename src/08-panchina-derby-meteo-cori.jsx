/* ========================================================================
 * KORWARD ELITE — frammento n° 08  (dei 20, numerati da 00 a 19)
 * src/08-panchina-derby-meteo-cori.jsx
 *
 * ALLENATORI · DERBY · METEO · CORI · SLOT · SAFELS
 *
 * COACH_NAMES / COACH_STYLES, DERBIES, SQUAD_ROLES, i nomi dei rivali, WEATHER_TYPES e
 * il clima, i cori della folla (per club, per lega, per nazionale, per lingua),
 * SLOT_KEYS, la configurazione delle chiamate a Claude, safeLS e DEVTOOLS_DEFAULT.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 6381-6975   ·   595 righe di 41427
 * La prima riga dopo questa intestazione è la riga 6381 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 6357 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
// Sprint 11 — S11.1 Coach data
const COACH_NAMES=["Rossi","Ferrari","Bianchi","Conti","Greco","Mancuso","Bellandi","Coralli","Petrucci","Montaldo","Ferrantini","Colussi","Tarantola","Ghiselli","Lupinacci","Verdiani"];// [5.96.0 CR-1] bonifica: erano presenti 11 allenatori REALI (Gattuso, Conte, Allegri, Capello…)
const COACH_STYLES=[
  {style:"Offensivo",trustMod:+5,desc:"Ama i gol, premia chi attacca"},
  {style:"Difensivo",trustMod:-5,desc:"Rigore tattico, esige sacrificio"},
  {style:"Bilanciato",trustMod:0,desc:"Equilibrio tra fase e creatività"},
  {style:"Pressing",trustMod:+3,desc:"Alta intensità, fisico essenziale"},
  {style:"Contropiede",trustMod:-3,desc:"Efficienza sopra la brillantezza"},
  {style:"Possesso Palla",trustMod:+8,desc:"Valorizza tecnica e visione"},
];
// Sprint 11 — S11.4 Derby database
const DERBIES={
  "juve-inter":{name:"Derby d'Italia",e:"⚡"},"inter-juve":{name:"Derby d'Italia",e:"⚡"},
  "milan-inter":{name:"Derby di Milano",e:"🔴"},"inter-milan":{name:"Derby di Milano",e:"🔴"},
  "roma-lazio":{name:"Derby della Capitale",e:"🐺"},"lazio-roma":{name:"Derby della Capitale",e:"🐺"},
  "juve-tor":{name:"Derby di Torino",e:"🏔️"},"tor-juve":{name:"Derby di Torino",e:"🏔️"},
  "napoli-roma":{name:"Derby del Sole",e:"☀️"},"roma-napoli":{name:"Derby del Sole",e:"☀️"},
  // [7.8.5 collaudo PO «deve esserci un derby reale: cittadino, regionale acceso…»] derby italiani aggiuntivi tra club rappresentati
  "gen-sam":{name:"Derby della Lanterna",e:"🏮"},"sam-gen":{name:"Derby della Lanterna",e:"🏮"},// Genova (entrambe Lega A)
  "sal-napoli":{name:"Derby della Campania",e:"🌋"},"napoli-sal":{name:"Derby della Campania",e:"🌋"},
  "ata-bres":{name:"Derby della Lombardia orientale",e:"🦁"},"bres-ata":{name:"Derby della Lombardia orientale",e:"🦁"},
  "fio-bol":{name:"Derby dell'Appennino",e:"⛰️"},"bol-fio":{name:"Derby dell'Appennino",e:"⛰️"},
  "cag-pal":{name:"Derby delle Isole",e:"🏝️"},"pal-cag":{name:"Derby delle Isole",e:"🏝️"},
  "rma-bar":{name:"El Clásico",e:"👑"},"bar-rma":{name:"El Clásico",e:"👑"},
  "rma-atm":{name:"Derbi Madrileño",e:"🌆"},"atm-rma":{name:"Derbi Madrileño",e:"🌆"},
  "mun-mcy":{name:"Manchester Derby",e:"🌹"},"mcy-mun":{name:"Manchester Derby",e:"🌹"},
  "mun-liv":{name:"North-West Derby",e:"🥀"},"liv-mun":{name:"North-West Derby",e:"🥀"},
  "ars-tot":{name:"North London Derby",e:"🔫"},"tot-ars":{name:"North London Derby",e:"🔫"},
  "bay-bvb":{name:"Der Klassiker",e:"🦁"},"bvb-bay":{name:"Der Klassiker",e:"🦁"},
  "psg-marse":{name:"Le Classique",e:"🗼"},"marse-psg":{name:"Le Classique",e:"🗼"},
  "gal-fenk":{name:"Istanbul Derby",e:"🌙"},"fenk-gal":{name:"Istanbul Derby",e:"🌙"},
  "ajax-feye":{name:"De Klassieker",e:"🌷"},"feye-ajax":{name:"De Klassieker",e:"🌷"},
};
function isDerby(aId,bId){return DERBIES[`${aId}-${bId}`]||DERBIES[`${bId}-${aId}`]||null;}

/* ========================================
   MATCH WEIGHT — importance of the match (1-10)
======================================== */
function calcMatchWeight(player,opponentId,standings,week){
  let w=1;
  if(isDerby(player.club?.id,opponentId))w+=3;
  // Ex-club memory
  const isExClub=(player.history||[]).some(h=>h.clubId===opponentId||h.club===opponentId)||(player.worldMemory||[]).some(m=>m.type==="ex_club"&&m.clubId===opponentId);
  if(isExClub)w+=2;
  if(standings&&standings.length>0){
    const sorted=[...standings].sort((a,b)=>b.pts-a.pts||(b.gd||0)-(a.gd||0));
    const ci=player.club?.id||player.club?.n;
    const myRank=sorted.findIndex(t=>t.id===ci||(t.n||t.name)===(player.club?.n||player.club?.name))+1;
    const total=sorted.length;
    if(myRank>0){
      const topPts=sorted[0]?.pts||0;const myPts=sorted[myRank-1]?.pts||0;
      if(week>=28&&myRank<=4&&topPts-myPts<=9)w+=3;   // title race
      if(week>=25&&myRank>=total-2)w+=2;               // relegation
      const oppRank=sorted.findIndex(t=>t.id===opponentId||(t.n||t.name)===opponentId)+1;
      if(myRank<=3&&oppRank>=1&&oppRank<=3)w+=1;       // top vs top
    }
  }
  if(week>=37)w+=3;else if(week>=35)w+=1;             // season finale
  if(player.rival&&(player.rival.club?.id===opponentId||player.rival.club?.n===opponentId))w+=2;
  return Math.min(10,w);
}

// Sprint D1 — Gerarchia di Squadra
const SQUAD_ROLES=['primavera','riserva','rotazione','titolare','leader'];

function calcSquadRole(player){
  const ovr=player.ovr||60;
  const trust=player.coachTrust||60;
  const proStatus=player.proStatus||'u18';
  const recent=(player.matchHistory||[]).slice(-5);
  const avgRat=recent.length?recent.reduce((s,m)=>s+(m.rating||6),0)/recent.length:6.5;/* [7.39.0 §9.2] a storico vuoto (inizio stagione: matchHistory è STAGIONALE) beneficio del dubbio 6.5 — il vecchio 6.0 bloccava strutturalmente rotazione (≥6.2) e titolare (≥6.8): la «gerarchia iniziale dal ritiro» usciva SEMPRE riserva; il gradino titolare resta da dimostrare sul campo */
  const isCap=player.isCaptain||false;
  if(proStatus==='u18')return'primavera';
  if(isCap&&ovr>=80&&trust>=75)return'leader';
  if(ovr>=78&&trust>=72&&avgRat>=6.8)return'titolare';
  if(ovr>=68&&trust>=55&&avgRat>=6.2)return'rotazione';
  if(ovr>=58&&trust>=40)return'riserva';
  return'primavera';
}

/* ========================================
   COACH DECISION — titolare / panchina / non convocato
======================================== */
function calcCoachDecision(player,matchWeight=1){
  const trust=clamp(player.coachTrust||60,0,100);
  const form=clamp(player.form||70,30,95); // Sprint 153: canonical fallback + bounds
  const fatigue=clamp(player.fatigue||0,0,100);
  // recent 3-match average rating (fallback 6.0)
  const recent=(player.matchHistory||[]).slice(-3).map(m=>m.rating||6.0);
  const avgRating=recent.length>0?recent.reduce((s,r)=>s+r,0)/recent.length:6.0;
  // normalize form [30,95]→[0,100] so score thresholds stay calibrated
  const formNorm=((form-30)/65)*100;
  // score 0-100
  let score=trust*0.40+formNorm*0.25+(100-fatigue)*0.20+(avgRating-5)*7.5;
  // big match boost — coach puts his best player in crucial games
  if(matchWeight>=7)score+=10;
  // Sprint D1: modulazione gerarchia (±8 — non altera la calibrazione, solo sfuma le soglie)
  const roleBonus={'leader':8,'titolare':4,'rotazione':0,'riserva':-5,'primavera':-8};
  score+=roleBonus[player.squadRole||'riserva']||0;
  // Sezione 8: OVR del giocatore vs livello della rosa (prestige club ≈ media dei compagni) — un talento
  //   sopra la media si prende il posto, chi è sotto livello resta più spesso in panchina (realismo "2-3 stagioni da riserva")
  const _clubLvl=player.club?.prestige||player.club?.p||65;
  const _ovrEdge=(player.ovr||60)-_clubLvl;
  score+=clamp(_ovrEdge*0.7,-12,14);
  score=clamp(score,0,100);
  let status,reason,entryMinute=60;
  if(trust<12||(score<25&&trust<30)){
    status="not_called";
    reason=trust<12
      ?"Il mister non ha fiducia in te in questo momento. Non sei nei convocati."
      :(fatigue>80?"Non sei in condizione fisica di giocare. Ti serve riposo.":"Il tecnico ha preferito altri. Lavora in allenamento per riconquistare un posto.");
  } else if(score<50||fatigue>78){
    status="bench";
    // Sprint 142 + [7.8.11 collaudo tester «subentra sempre tra il 48' e il 60'»]: finestre PIÙ AMPIE
    //   → il subentro non si raggruppa più in un intervallo fisso. Resta correlato alla fiducia (più fiducia =
    //   ingresso mediamente più anticipato/di peso), ma ora un titolare-di-fiducia può entrare al 46' come al 68',
    //   uno di media fiducia dal 52' al 74', un ultimo-della-rosa dal 60' all'82'.
    const _rnd=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
    entryMinute=trust>=65?_rnd(46,68):trust>=45?_rnd(52,74):_rnd(60,82);
    // [7.140.0 collaudo PO «non indicare da nessuna parte il minuto in cui entrerà l'eroe dalla panchina»] il minuto
    //   d'ingresso resta calcolato (entryMinute) ma NON viene più svelato: solo «tieniti pronto, il mister ti chiamerà».
    reason=fatigue>78
      ?`Troppa stanchezza. Panchina — tieniti pronto, il mister ti chiamerà.`
      :form<40
      ?`Sei in un momento di appannamento. Panchina — pronto a entrare e dimostrare chi sei.`
      :trust<40
      ?`C'è qualcuno davanti a te. Panchina — fatti trovare pronto.`
      :`Scelta tattica: oggi panchina. Preparati: potresti entrare in qualsiasi momento.`;
  } else {
    status="starter";
    reason=_ovrEdge>=8
      ?"Sei tra i migliori della rosa — il mister non può lasciarti fuori. Titolare."
      :trust>=80
      ?"Sei il suo uomo di fiducia. Titolare inamovibile."
      :matchWeight>=7
      ?"Partita cruciale — il mister conta su di te dal primo minuto."
      :avgRating>=7.0
      ?"Le ultime prestazioni ti hanno guadagnato la maglia da titolare."
      :"Sei in formazione. Dai il massimo.";
  }
  return{status,reason,entryMinute};
}

/* ========================================
   RIVAL NPC — parallel career antagonist
======================================== */
const RIVAL_FIRST=["Marco","Luca","Federico","Alessandro","Matteo","Lorenzo","Davide","Simone","Francesco","Roberto","Esteban","Pablo","Carlos","Diego","João","Bruno","Antoine","Théo","Kylian","Florian","Leon","Kai","Harry","Mason","Marcus","Phil","Bukayo","Erling","Vinicius","Pedri"];
const RIVAL_LAST=["Rossi","Ferrari","Conti","Bianchi","Romano","Ricci","Greco","Russo","Moretti","Gallo","García","López","Martínez","Fernández","González","Silva","Santos","Costa","Dupont","Martin","Bernard","Müller","Schmidt","Bauer","Wolf","Smith","Jones","Williams","Brown","Taylor","Saka","Bellingham"];
function generateRival(player){
  const fn=pick(RIVAL_FIRST),ln=pick(RIVAL_LAST);
  const age=clamp((player.age||18)+rng(-1,3),17,24);
  const ovr=clamp((player.ovr||65)+rng(-4,6),55,88);
  const lc=getLeagueClubs(player).filter(c=>c.id!==player.club?.id&&c.n!==player.club?.n);
  const club=lc.length>0?pick(lc.slice(0,Math.min(8,lc.length))):null;
  return{name:`${fn} ${ln}`,nation:player.nation||"Italia",age,ovr,
    club:club?{n:club.n,id:club.id,p:club.p,lg:club.lg,c:club.c,nat:club.nat}:null,
    goals:rng(4,14),totalGoals:rng(6,22),assists:rng(2,8),trophies:0,seasons:1,
    relationship:"sconosciuto"};
}
// Sprint 24 — generate 3 teammates from the actual squad roster (seeded by club+season)
function generateTeammates(player,keepBond){
  // [7.106.3 collaudo PO «Nino non lo vedo in rosa»] archetipi/SLOT stabili dal SOLO club (non cambiano ogni stagione),
  //   ma i NOMI vengono dalla rosa CORRENTE (season-aware, stesso pool di generateTeamRoster) → i compagni «Nello
  //   spogliatoio» sono SEMPRE giocatori REALI presenti in rosa. keepBond{archetype:bond} preserva il legame al refresh.
  const cseed=hashStr(player.club?.id||player.club?.n||"u18");
  const sr=(n)=>((cseed*9301+49297*(n+1))%233280)/233280;
  const roster=generateTeamRoster(player.club||{id:"u18",n:"U18",nat:"🇮🇹"},player.season||1);
  const pool=seededShuffle(roster.slice(1),cseed^0xDEADBEEF); // skip GK
  const archs=TEAMMATE_ARCHETYPES.filter(a=>a.id!=="ex_capitano");/* [7.184.0 collaudo PO «troppi ex capitano!»] ex_capitano è un ruolo ASSUNTO (cessione fascia 7.5.0/7.179.0), mai pescabile a caso: nel pool poteva uscire INSIEME a capitano → con l'eroe capitano la conversione ne produceva DUE */
  for(let i=archs.length-1;i>0;i--){const j=Math.floor(sr(i)*(i+1));[archs[i],archs[j]]=[archs[j],archs[i]];}
  return archs.slice(0,3).map((a,i)=>{const _cap=(a.id==="capitano"&&player&&player.isCaptain);/* [7.179.0 collaudo PO «possibile incongruenza capitano»: se la fascia è dell EROE, ogni rigenerazione dei compagni ricreava comunque un compagno "Il Capitano" (il fix 7.5.0 copriva solo il passaggio di fascia) → qui, al chokepoint, diventa L Ex Capitano */
    return {name:(pool[i]&&pool[i].name)||"Compagno",archetype:_cap?"ex_capitano":a.id,icon:_cap?"🎖️":a.icon,bond:(keepBond&&keepBond[a.id]!=null)?keepBond[a.id]:40};});
}
// [7.106.3] i compagni salvati (name congelato alla stagione di ingaggio) vanno RI-SINCRONIZZATI alla rosa corrente:
//   stesso pool di generateTeammates → l'i-esimo teammate riceve il nome dell'i-esimo slot ATTUALE (archetipi/bond intatti).
function syncTeammateNames(player){
  const tms=player.teammates;if(!tms||!tms.length||!player.club||(player.proStatus||"u18")==="u18")return tms;
  const cseed=hashStr(player.club?.id||player.club?.n||"u18");
  const roster=generateTeamRoster(player.club,player.season||1);
  const pool=seededShuffle(roster.slice(1),cseed^0xDEADBEEF);
  let changed=false;const out=tms.map((t,i)=>{const nm=(pool[i%pool.length]||{}).name;if(nm&&nm!==t.name){changed=true;return{...t,name:nm};}return t;});
  return changed?out:tms;
}
// Sprint 24 — pick 3 journalists (seeded random selection from pool)
function generateJournalists(){
  const pool=shuffle([...JOURNALIST_POOL]);
  return pool.slice(0,3).map(j=>({...j,trust:50,lastTone:null}));
}
// Sprint 24 — readable label from journalist trust
function getJournalistRelLabel(trust){
  if(trust>=80)return"🌟 Fan sfegatato";
  if(trust>=65)return"👍 Favorevole";
  if(trust>=45)return"😐 Neutrale";
  if(trust>=30)return"😤 Critico";
  return"🔥 Ostile";
}
// Sprint 25 — seeded ultra group name per club
function generateUltrasName(clubId){
  const seed=hashStr(String(clubId||"club"));
  const sr=(n)=>((seed*9301+49297*(n+1))%233280)/233280;
  const pre=ULTRAS_PREFIXES[Math.floor(sr(1)*ULTRAS_PREFIXES.length)];
  const suf=ULTRAS_SUFFIXES[Math.floor(sr(2)*ULTRAS_SUFFIXES.length)];
  return`${pre} ${suf}`;
}
// Sprint 16 — Weather system
// Sprint 82 — 20 atmospheric conditions (tod field = restrict to specific time of day)
const WEATHER_TYPES=[
  /* [7.154.0 collaudo PO «spesso è brutto tempo nelle partite, rivedere la logica»] REBILANCIAMENTO dei pesi BASE:
     prima il bel tempo (sunny/partly/cloudy/overcast=14) era quasi pari al brutto (16) → col boost clima/stagione il
     brutto sfiorava il 53-64% in autunno/inverno nei climi piovosi. Ora il SERENO DOMINA la base (sunny 9 · partly 7
     · cloudy 5 · overcast 3) e la pioggia leggera/foschia è ridotta → brutto tempo ~10% sud/estate, ~22% tipico, ~45%
     peggior caso (inverno piovoso, realistico). Clima-sede e stagionalità (climateWeights/seasonalWeights) INVARIATI. */
  {id:"sunny",    name:"Soleggiato",      e:"☀️",  pitchFx:null,   ef:{},                        w:9},
  {id:"partly",   name:"Parz. nuvoloso",  e:"⛅",  pitchFx:null,   ef:{},                        w:7},
  {id:"cloudy",   name:"Nuvoloso",        e:"🌥️",  pitchFx:null,   ef:{},                        w:5},
  {id:"overcast", name:"Coperto",         e:"☁️",  pitchFx:null,   ef:{},                        w:3},
  {id:"heat",     name:"Caldo torrido",   e:"🌡️",  pitchFx:null,   ef:{fatigue:4},               w:2},
  {id:"cold",     name:"Freddo secco",    e:"🌬️",  pitchFx:null,   ef:{spd:-2},                  w:2},
  {id:"humid",    name:"Afosa",           e:"💧",  pitchFx:null,   ef:{fatigue:3},               w:1},
  {id:"wind",     name:"Vento forte",     e:"💨",  pitchFx:"wind", ef:{tiro:-6},                 w:2},
  {id:"drizzle",  name:"Pioggerella",     e:"🌦️",  pitchFx:"rain", ef:{pass:-2},                 w:2},
  {id:"rain",     name:"Pioggia",         e:"🌧️",  pitchFx:"rain", ef:{pass:-5,spd:-3},          w:2},
  {id:"mist",     name:"Foschia",         e:"🌁",  pitchFx:"fog",  ef:{},                        w:1},
  {id:"fog",      name:"Nebbia",          e:"🌫️",  pitchFx:"fog",  ef:{},                        w:1},
  {id:"hail",     name:"Grandine",        e:"🌨️",  pitchFx:"snow", ef:{pass:-6,spd:-5,tiro:-4},  w:1},
  {id:"snow",     name:"Nevicata",        e:"❄️",  pitchFx:"snow", ef:{pass:-8,spd:-8},          w:1},
  {id:"thunder",  name:"Fulmini",         e:"⚡",  pitchFx:"storm",ef:{pass:-8,spd:-4,tiro:-3},  w:1},
  {id:"storm",    name:"Temporale",       e:"⛈️",  pitchFx:"storm",ef:{pass:-10,spd:-6,tiro:-5}, w:1},
  {id:"rainbow",  name:"Arcobaleno",      e:"🌈",  pitchFx:"rain", ef:{morale:3},                w:1,tod:["day","dawn"]},
  {id:"golden",   name:"Ora d'oro",       e:"✨",  pitchFx:null,   ef:{},                        w:1,tod:["dusk","dawn"]},
  {id:"sunset",   name:"Tramonto rosso",  e:"🌅",  pitchFx:null,   ef:{},                        w:2,tod:["dusk"]},
  {id:"starry",   name:"Notte stellata",  e:"🌟",  pitchFx:null,   ef:{},                        w:2,tod:["night"]},
];
/* [7.260.0 collaudo PO «il meteo non è congruente» — ☀️ nell'header su partita NOTTURNA] «sunny/partly/heat» non
   hanno vincolo tod (giusto: una notte serena esiste) ma nome+emoji sono DIURNI → adattatore di DISPLAY per le
   gare serali: il meteo resta lo stesso, cambia solo come lo racconti. Puro, usato dai siti di render. */
const weatherNightDisp=(w,night)=>{if(!w||!night)return w;
  if(w.id==="sunny")return{...w,e:"🌙",name:"Notte serena"};
  if(w.id==="partly")return{...w,e:"🌙",name:"Poco nuvoloso"};
  if(w.id==="heat")return{...w,e:"🌡️",name:"Notte afosa"};
  return w;};
// [7.0.0 collaudo PO «gli eventi atmosferici non devono essere casuali: in Germania nebbia/neve, al Sud Italia
//   rarissimo»] CLIMA PER SEDE: moltiplicatori sui pesi meteo in base al campionato del padrone di casa,
//   con distinzione NORD/SUD per l'Italia a livello di club (la pianura padana ha la nebbia, Palermo no).
const _CLIMATE_SOUTH_IT=new Set(["napoli","roma","lazio","cag","lec","pal","cat","bar2","cos","sal"]);
function climateWeights(club){
  const lg=club?.lg||"",id=club?.id||"";
  if(lg==="Nazionale")return{};
  if(/Deutsche/.test(lg))return{snow:2.2,hail:1.6,fog:2.2,mist:1.8,rain:1.5,drizzle:1.4,cold:1.6,heat:0.4,humid:0.5};
  if(/Premier|Championship/.test(lg))return{rain:2.0,drizzle:2.2,fog:1.8,mist:1.8,wind:1.4,cold:1.2,snow:0.9,heat:0.3,humid:0.6};
  if(/Ibérica/.test(lg))return{heat:2.2,sunny:1.6,humid:1.3,snow:0.15,hail:0.3,fog:0.5,mist:0.7,rain:0.7,drizzle:0.8,cold:0.5};
  if(/Lusitana/.test(lg))return{heat:1.6,sunny:1.5,snow:0.1,hail:0.3,fog:0.8,cold:0.5};
  if(/Oranje|Belga/.test(lg))return{rain:1.8,drizzle:1.9,wind:1.8,fog:1.5,mist:1.5,cold:1.2,heat:0.4};
  if(/Anatolica/.test(lg))return{heat:1.8,sunny:1.4,snow:0.8,fog:0.8,rain:0.9};
  if(/Ligue/.test(lg))return{rain:1.3,drizzle:1.3,fog:1.2,mist:1.2,snow:0.8};
  if(_CLIMATE_SOUTH_IT.has(id))return{heat:2.0,sunny:1.7,humid:1.4,snow:0.08,hail:0.25,fog:0.35,mist:0.6,rain:0.75,drizzle:0.8,cold:0.5};
  return{snow:1.3,fog:1.7,mist:1.6,rain:1.2,drizzle:1.2,cold:1.3,heat:0.8};// nord Italia (Lega A/B/Primavera)
}
// [7.147.0 collaudo PO «spesso piove/diluvia/nevica, siamo in Italia non in Groenlandia! soprattutto la 38ª
//   giornata è solitamente a fine primavera!»] STAGIONALITÀ del meteo: la stagione di gioco va da FINE AGOSTO
//   (W1) a FINE MAGGIO (W38) — il vecchio `isWinter = wk<=10||wk>=33` (×3 precipitazioni) era INVERTITO:
//   rendeva piovose/nevose proprio le prime giornate (estate) e le ultime (primavera!). Moltiplicatori per
//   FASE dell'anno, composti col clima della sede (climateWeights): neve SOLO nel cuore dell'inverno.
function seasonalWeights(wk){
  if(wk<=6)  return{heat:1.6,sunny:1.5,partly:1.2,humid:1.3,snow:0,hail:0.2,cold:0.2,fog:0.3,mist:0.5,rain:0.55,drizzle:0.6,storm:0.8,thunder:0.9};      // fine estate (ago-set)
  if(wk<=13) return{rain:1.25,drizzle:1.2,fog:1.15,mist:1.2,wind:1.2,snow:0.05,hail:0.3,cold:0.7,heat:0.5};                                              // autunno (ott-nov)
  /* [7.324.0 collaudo PO «la neve deve essere un evento rarissimo» — due gare dell'Europeo di fila imbiancate]
     La finestra dei tornei per Nazionali (W20-24) cade ESATTAMENTE nel moltiplicatore invernale: neve 1.6 +
     grandine 1.2 (che usa lo stesso effetto visivo) davano il 6.8% a partita d'inverno = ~35% di vederne
     almeno una in un torneo da 6 gare. Ora 0.3/0.35 → ~1.6% a partita nel cuore dell'inverno (~9% su un
     torneo intero), che scala col clima della sede: in Germania resta piu' probabile (×2.2), al sud quasi
     impossibile (×0.08). Rara davvero, senza sparire dal gioco. */
  if(wk<=24) return{cold:1.6,snow:0.3,fog:1.5,mist:1.4,rain:1.15,drizzle:1.1,hail:0.35,heat:0.15,sunny:0.75,humid:0.3};                                  // inverno (dic-feb)
  if(wk<=31) return{sunny:1.25,partly:1.2,rain:0.8,drizzle:0.8,snow:0.02,hail:0.2,fog:0.5,mist:0.7,cold:0.5,heat:0.8};                                   // primavera (mar-apr)
  return{sunny:1.6,heat:1.3,partly:1.25,rain:0.35,drizzle:0.4,storm:0.6,thunder:0.7,snow:0,hail:0.1,fog:0.2,mist:0.35,cold:0.15};                        // tarda primavera (mag)
}
// Sprint 16 — Crowd chants (expanded Sprint 22)
const CROWD_CHANTS={
  goal:["GOOOOOL! 🎉","SÌ SÌ SÌ!!","FANTASTICO!","CHE GOL!!! ⭐","INCREDIBILEEE!","GOL! GOL! GOL! 🎉","MAGNIFICO! 🌟","CHE GOL! 🔥","EUROGOL! ⚡","FENOMENALE! 🔥","CHE BELLO! 😍","GOLAZO! 💥","UNO A ZERO! ✊","RETE! RETEEEE!!! 🥅","CHE BOLIDE! 💣","SIGNORI, IL GOL! 🎺","MAGICOOO! ✨","CAPOLAVORO! 🖼️","BOMBAAA! 💥","SPETTACOLO PURO! 🌟"],
  near_miss:["Ohhhhh! 😱","Che peccato!","QUASIIII!!","Nooo!!","OH NO! 😩","INCREDIBILE! 😤","PAZZESCO! 😱","STREGATO! 😤","IL PALO! 😱","LA TRAVERSA! 😱","MIRACOLO DEL PORTIERE! 🧤","SULLA RIGA! 😰","SPRECATO! 😤","MANNAGGIA! 😤"],
  save:["MIRACOLO! 🧤","Che parata!","PORTIEROOOO!","Strepitoso!","SALVA! 🧤","MAMMA MIA! 😰","CHE INTERVENTO! 🧤","FENOMENALE! 🧤","IMBATTIBILE! 🦁","CHE RIFLESSI! ⚡","IMPERABILE! 🛡️"],
  pressure:["Dai dai daiii! 💪","FORZA FORZA!","Spingiii! 🔥","Alè alè alè!","Non mollare!","FORZA! 💪","ANDIAMO! ⚡","CAMPIONI! 🏆","DAI! DAI! DAI! 🔥","SPINGI! SPINGI! 💪","NON MOLLARE MAI! ⚡","CORRI! CORRI! 🏃","AGGREDISCI! 🔥","DAI CHE CE LA FAI! 💙","MUOVITI! ⚡","TUTTI SU! 🙌","ANCORA! ANCORA! 🔥"],
  foul:["FALLO! 😤","Arbitro venduto!","Che fallo!","Vergogna!","ARBITRO! 😡","FALLO NETTO! 😤","SCANDALO! 🤬","CHE VERGOGNA! 😡","FALLO DURO! 😤","Protesta la panchina!","CARTELLINO! 🟨","ARBITRO SVEGLIA! 😡","ARBITRO CIECO! 😡","Punizione! 😤","CHE FALLO! 😤"],
  home:["Siamo noi campioni! 🏆","[CLUB]! [CLUB]! [CLUB]!","Forza [CLUB]!","Alé [CLUB] alé! ⚽","FORZA [CLUB]! 💪","[CLUB] CAMPIONI! 🏆","NOI SIAMO [CLUB]! ⚡","[CLUB] AVANTI! 🔥","OHH [CLUB]! OHH [CLUB]!","[CLUB] CI CREDO! 💙","FORZA FORZA [CLUB]! 🙌","INSIEME VINCIAMO! 🏆","AVANTI [CLUB], NON CI FERMATE! ⚡","[CLUB] NEL CUORE! ❤️"],
  half:["Intervallo!","Prima metà combattuta!","Secondo tempo più forte!","FORZA RAGAZZI! 💪","CI SIAMO! ⚡","RIPRENDIAMO CON LA STESSA FAME! 🔥","SECONDO TEMPO — GRANDI! ⚡"],
  danger:["Difesa! Difesa! 🛡️","Attenti ragazzi!","TIENITELA!","Non passano!","ATTENTO! 😱","CHIUDI! 🛡️","VIA! VIA! 🛡️","TIENI! TIENI! 😰","BLOCCA! BLOCCA! 🛡️","NON PASSANO! ✊","REGGI! REGGI! 💪","FUORI LA PALLA! 😤"],
  comeback:["CI CREDOOOO! 🔥","RIMONTAAA! ⚡","NON MOLLARE MAI! 💪","FORZA CHE SI TORNA! 🏃","IMPOSSIBILE È NIENTE! 🔥","ANCORA UNO! ANCORA UNO! 🎯","CUORE GRANDE! ❤️"],
  winning:["CAMPIONIIIII! 🏆","È SEMPRE PIÙ NOSTRA! ✊","INARRESTABILI! ⚡","FORZA CHE VINCIAMO! 🔥","MERAVIGLIOSI! 🌟","FORZA FORZA FORZA! 💪"],
  losing:["NON CI ARRENDIAMO! 💙","TESTA ALTA! ✊","CI CREDO ANCORA! 🔥","FORZA RAGAZZI REAGITE! 💪","NON È ANCORA FINITA! ⚡"],
  away_goal:["Gol subito...","Gli avversari esultano.","Silenzio nel nostro settore.","...","La panchina avversaria si alza in piedi."],
  urgenza:["DAI! CI SIAMO! 🔥","ADESSO! ADESSO! 💥","MANCANO POCHI MINUTI! ⏱️","È ADESSO IL MOMENTO! ⚡","FORZA CHE CE LA FAI! 💪"],
  derby:["DERBYYYYYYY! 🔥","CHE ATMOSFERA! 💥","QUESTA È LA PARTITA! ❤️","VINCI PER NOI! 🔥","QUESTA CITTÀ È NOSTRA! 🏆","UN'EMOZIONE UNICA! ⚡","CHE SPETTACOLO! 🌟","IL DERBY! IL DERBY! 🔥","TIENICI IL DERBY! ✊","OGNI TIFOSO CI CREDE! 💙","NON TRADIRCI! ❤️‍🔥","IL DERBY NON SI GIOCA — SI VINCE! 💯","FUOCO IN CURVA! 🔥"],
  boo:["BOOOOO! 😤","FUORI! FUORI! 😡","CHE DELUSIONE! 😤","NON CI MERITATE! 💔","VERGOGNA! 😡","FISCHI IN CURVA! 😤","ANDATE VIA! 😡","NON SIETE DEGNI! 😤","USCITE DAL CAMPO! 😡","RIMBORSO! 💸","INDECENTI! 😤","QUANTO FA SCHIFO! 😤"],
};
// Sprint 91 — Localized chants per league
const CROWD_CHANTS_LG={
  "Premier Division":{
    goal:["YEEEES! 🎉","WHAT A GOAL! ⭐","BRILLIANT! 🔥","GET IN! ✊","MAGNIFICEEENT!","UNBELIEVABLE! ⚡","WORLDIE! 🌟","PURE CLASS! 💎"],
    home:["[CLUB]! [CLUB]! [CLUB]!","Come on [CLUB]! 💪","WE ARE [CLUB]! ⚡","[CLUB] TILL I DIE! ❤️","GLORY GLORY [CLUB]! 🏆","OH WHEN THE REDS GO MARCHING IN! 🎺"],
    danger:["HOLD IT! 🛡️","DEFEND! DEFEND! 🛡️","CLEAR IT! 😱","COME ON BOYS! 💪","KEEPER! KEEPER! 🧤"],
    foul:["REF! 😡","YOU'RE CHEATING! 😤","FOUL! 😤","BOOK HIM! 🟨","ABSOLUTE DISGRACE! 🤬"],
    near_miss:["OHHHH! 😱","SO CLOSE! 😩","AGONY! 😤","THE POST! 😱","KEEPER WAS BEATEN! 😤"],
    comeback:["COME ON! WE CAN DO IT! 🔥","NEVER GIVE UP! 💪","BELIEVE! ⚡","ONE MORE! ONE MORE! 🎯"],
    winning:["EASY! EASY! EASY! 🏆","WE'RE GONNA WIN THE LEAGUE! 🎉","CHAMPIONS! 🏆","WE'RE TOP OF THE LEAGUE! 🎊"],/* [7.281.0 collaudo PO «cori dei tifosi nella lingua sbagliata, in questo caso devono essere in inglese e non spagnolo»] era «CAMPEONES! OLÉ OLÉ!»: spagnolo in uno stadio inglese, e usciva proprio sul 3-0 (categoria «winning») */
    losing:["WE NEVER GIVE UP! 💙","COME ON YOU [CLUB]! 🔥","FIGHT FOR THE SHIRT! ✊"],
    derby:["THE DERBY! THE DERBY! 🔥","THIS IS WHAT IT'S ABOUT! ⚡","COME ON — IT'S DERBY DAY! 🏆","WIN THIS ONE FOR US! ❤️","THE CITY IS OURS! 💙","NO MERCY TODAY! 🔥","DERBY DAY — OUR DAY! ✊","GIVE IT EVERYTHING! 💪","THIS IS OUR MOMENT! ⚡"],
    boo:["BOOOOOO! 😤","GET OFF! GET OFF! 😡","ABSOLUTE DISGRACE! 😤","NOT GOOD ENOUGH! 💔","SHOCKING DISPLAY! 😡","SORT IT OUT! 😤","EMBARRASSING! 😡","YOU SHOULD BE ASHAMED! 😤"],
  },
  "Championship":{
    goal:["YEEEES! 🎉","GET IN! ✊","GREAT GOAL! 🔥","BRILLIANT! ⭐"],
    home:["[CLUB]! [CLUB]!","Come on [CLUB]! 💪","WE ARE [CLUB]! ⚡"],
    danger:["CLEAR IT! 😱","DEFEND! 🛡️"],foul:["REF! 😡","FOUL! 😤"],
    near_miss:["OHHHH! 😱","SO CLOSE! 😩"],comeback:["NEVER GIVE UP! 💪"],winning:["CHAMPIONS! 🏆"],losing:["FIGHT! 💙"],
  },
  "Deutsche Liga":{
    goal:["TOOOOOOR! 🎉","WAHNSINN! ⭐","UNGLAUBLICH! 🔥","JA! JA! JA! ✊","TRAUMTOR! ⚡","HAMMER! 💥","WELTKLASSE! 🌟","WAS FÜR EIN TOR! 😱"],
    home:["HEY HO, [CLUB]! ⚡","[CLUB]! [CLUB]! [CLUB]! 🏆","AUF [CLUB]! 💪","WIR LIEBEN [CLUB]! ❤️","EIN [CLUB], EIN HERZ! ❤️"],
    danger:["ABWEHR! ABWEHR! 🛡️","HALT! HALT! 😱","MANNSCHAFT! 💪","HALTEN! 🛡️"],
    foul:["SCHIRI! 😡","FOUL! 😤","GELB! 🟨","SKANDAL! 🤬"],
    near_miss:["OHHHH! 😱","WAS WAR DAS! 😩","PFOSTEN! 😱","KNAPP DANEBEN! 😤"],
    comeback:["KÄMPFEN! 🔥","NIEMALS AUFGEBEN! 💪","WIR GLAUBEN DARAN! ⚡"],
    winning:["MEISTER! MEISTER! 🏆","WIR SIND DIE BESTEN! ⚡","DEUTSCHER MEISTER! 🏆"],/* [7.281.0] la terza voce era «CHAMPIONS!»: inglese nel pool tedesco */
    losing:["KOPF HOCH! 💙","NICHT AUFGEBEN! 🔥","WIR KOMMEN ZURÜCK! ⚡"],
    derby:["DAS DERBY! 🔥","HEUTE IST UNSER TAG! ⚡","UNSERE STADT! 🏆","DERBY-SIEG FÜR UNS! ✊","KEINEN SCHRITT ZURÜCK! 💪","KÄMPF FÜR UNS! ❤️","DERBY-STIMMUNG! 💥","UNSER DERBY — UNSER SIEG! 🔥"],
    boo:["BUUUUH! 😤","RAUS! RAUS! 😡","SCHÄMT EUCH! 😤","UNZUMUTBAR! 💔","SKANDAL! 😡","IHR SEID BLAMIERT! 😤","GEHT NACH HAUSE! 😡"],
  },
  "Deutsche Liga 2":{
    goal:["TOOOOOOR! 🎉","JA! JA! ✊","HAMMER! 💥"],
    home:["[CLUB]! [CLUB]! 🏆","AUF [CLUB]! 💪"],
    danger:["ABWEHR! 🛡️"],foul:["SCHIRI! 😡"],near_miss:["OHHHH! 😱"],comeback:["KÄMPFEN! 🔥"],winning:["MEISTER! 🏆"],losing:["KOPF HOCH! 💙"],
  },
  "Ligue Nationale":{
    goal:["BUUUUUT! 🎉","MAGNIFIQUE! ⭐","INCROYABLE! 🔥","OUI! OUI! OUI! ✊","FANTASTIQUE! ⚡","SUBLIME! 🌟","QUEL BUT! 😍"],
    home:["ALLEZ [CLUB]! ALLEZ! 💪","[CLUB]! [CLUB]! 🏆","ON EST LÀ! ⚡","OHH [CLUB]! 🔥","[CLUB] ON T'AIME! ❤️"],
    danger:["DÉGAGEZ! 🛡️","DÉFENSE! DÉFENSE! 🛡️","ATTENTION! 😱","DEHORS! 😤"],
    foul:["ARBITRE! 😡","FAUTE! 😤","SCANDALE! 🤬","CARTON! 🟨"],
    near_miss:["OHHHH! 😱","TELLEMENT PROCHE! 😩","LE POTEAU! 😱","INCROYABLE! 😤"],
    comeback:["ON PEUT LE FAIRE! 🔥","JAMAIS SANS COMBATTRE! 💪","ON Y CROIT! ⚡"],
    winning:["CHAMPIONS! CHAMPIONS! 🏆","ON EST LES MEILLEURS! ⚡","TITRE! TITRE! 🎊"],
    losing:["JAMAIS LÂCHER! 💙","ON PEUT REVENIR! 🔥","ALLEZ! 💪"],
    derby:["LE DERBY! 🔥","C'EST LE GRAND MATCH! ⚡","NOTRE VILLE, NOTRE DERBY! 🏆","BATTEZ-LES POUR NOUS! ❤️","ON GAGNE LE DERBY! ✊","DONNEZ TOUT! 💪","AUJOURD'HUI C'EST NOTRE JOUR! 🔥"],
    boo:["HUUUUUUE! 😤","DEHORS! DEHORS! 😡","QUELLE HONTE! 😤","VOUS NE LE MÉRITEZ PAS! 💔","SCANDALE! 😡","RENTREZ CHEZ VOUS! 😤","INACCEPTABLE! 😡"],
  },
  "Ligue Nationale 2":{
    goal:["BUUUUT! 🎉","OUI! ✊","MAGNIFIQUE! 🔥"],
    home:["ALLEZ [CLUB]! 💪","[CLUB]! [CLUB]! 🏆"],
    danger:["DÉFENSE! 🛡️"],foul:["ARBITRE! 😡"],near_miss:["OHHHH! 😱"],comeback:["ON Y CROIT! 🔥"],winning:["CHAMPIONS! 🏆"],losing:["JAMAIS LÂCHER! 💙"],
  },
  "Liga Ibérica":{
    goal:["GOOOOOL! 🎉","QUÉ GOLAZO! ⭐","INCREÍBLE! 🔥","SÍ! SÍ! SÍ! ✊","MAGISTRAL! ⚡","ESPECTACULAR! 🌟","¡QUÉ BONITO! 😍"],
    home:["¡VAMOS [CLUB]! 💪","[CLUB]! [CLUB]! 🏆","¡CAMPEONES! ⚡","¡FUERZA [CLUB]! 🔥","¡OLÉ OLÉ OLÉ! 🎊"],
    danger:["¡FUERA! 🛡️","¡DEFENSA! DEFENSA! 🛡️","¡ATENTOS! 😱","¡DESPEJAR! 😤"],
    foul:["¡ÁRBITRO! 😡","¡FALTA! 😤","¡ESCÁNDALO! 🤬","¡TARJETA! 🟨"],
    near_miss:["¡OHHHHH! 😱","¡TAN CERCA! 😩","¡EL PALO! 😱","¡QUELLE OPORTUNIDAD! 😤"],
    comeback:["¡PODEMOS! 🔥","¡NUNCA SE RINDE! 💪","¡YO CREO! ⚡"],
    winning:["¡CAMPEONES! 🏆","¡SOMOS LOS MEJORES! ⚡","¡A POR ELLOS! 🎊"],
    losing:["¡NUNCA ABANDONAR! 💙","¡VAMOS, PODEMOS! 🔥","¡ARRIBA [CLUB]! ✊"],
    derby:["¡EL DERBI! 🔥","¡ESTO ES PASIÓN PURA! ⚡","¡NUESTRA CIUDAD! 🏆","¡GANAD POR NOSOTROS! ❤️","¡EL DERBI ES NUESTRO! ✊","¡A MUERTE! 💥","¡HOY ES EL DÍA! 🔥","¡VAMOS A GANAR EL DERBI! 🎊"],
    boo:["¡BUUUUU! 😤","¡FUERA! ¡FUERA! 😡","¡QUÉ VERGÜENZA! 😤","¡NO LO MERECÉIS! 💔","¡ESCÁNDALO! 😡","¡FUERA DE AQUÍ! 😤","¡INDIGNO! 😡"],
  },
  "Liga Ibérica 2":{
    goal:["GOOOOOL! 🎉","SÍ! SÍ! ✊","¡QUÉ GOL! 🔥"],
    home:["¡VAMOS [CLUB]! 💪","[CLUB]! [CLUB]! 🏆"],
    danger:["¡DEFENSA! 🛡️"],foul:["¡ÁRBITRO! 😡"],near_miss:["¡OHHH! 😱"],comeback:["¡PODEMOS! 🔥"],winning:["¡CAMPEONES! 🏆"],losing:["¡NUNCA ABANDONAR! 💙"],
  },
  "Liga Lusitana":{
    goal:["GOOOOLO! 🎉","QUE GOLAÇO! ⭐","INCRÍVEL! 🔥","SIM! SIM! SIM! ✊","ESPETACULAR! ⚡"],
    home:["FORÇA [CLUB]! 💪","[CLUB]! [CLUB]! 🏆","NÓS SOMOS [CLUB]! ⚡","VAMOS [CLUB]! 🔥"],
    danger:["DEFESA! DEFESA! 🛡️","FORA! FORA! 😱"],foul:["ÁRBITRO! 😡","FALTA! 😤"],
    near_miss:["OHHHH! 😱","QUE PENA! 😩"],comeback:["NÃO DESISTIR! 💪"],winning:["CAMPEÕES! 🏆"],losing:["FORÇA! 💙"],
  },
  "Liga Oranje":{
    goal:["GOAAAAL! 🎉","PRACHTIG! ⭐","GEWELDIG! 🔥","JA! JA! JA! ✊","FANTASTISCH! ⚡"],
    home:["[CLUB]! [CLUB]! 🏆","HEJA [CLUB]! 💪","WIJ ZIJN [CLUB]! ⚡"],
    danger:["VERDEDIGING! 🛡️","HOE DAN! 😱"],foul:["SCHEIDS! 😡","OVERTREDING! 😤"],
    near_miss:["OHHHH! 😱","BIJNA! 😩"],comeback:["NOOIT OPGEVEN! 💪"],winning:["KAMPIOENEN! 🏆"],losing:["HOOFD OMHOOG! 💙"],
  },
  "Liga Anatolica":{
    goal:["GOOOOL! 🎉","MUHTEŞEMDİ! ⭐","İNANILMAZ! 🔥","EVET! EVET! ✊","HARIKA! ⚡","SÜPER! 🌟"],
    home:["HAYDI [CLUB]! 💪","[CLUB]! [CLUB]! 🏆","BİZ [CLUB]'İZ! ⚡","GİT [CLUB]! 🔥"],
    danger:["SAVUNMA! 🛡️","DİKKAT! 😱","ENGELLE! 😤"],foul:["HAKEM! 😡","PENALTİ! 🚩","SKANDAL! 🤬"],
    near_miss:["OHHHH! 😱","ÇOK YAKINDI! 😩","DİREK! 😱"],comeback:["ASLA BITMEZ! 🔥","INANIYORUM! 💪"],winning:["ŞAMPİYON! 🏆"],losing:["ASLA ÖDÜNÇ VERME! 💙"],
  },
};
// Sprint 156 — National chant pools: language-congruent per nation
// Reuses existing CROWD_CHANTS_LG pools where the language matches; new pool for Brasil only.
// "Italia" is intentionally omitted → falls through to base CROWD_CHANTS (already Italian).
const CROWD_CHANTS_NAT={
  "Inghilterra":CROWD_CHANTS_LG["Premier Division"],
  "Germania":CROWD_CHANTS_LG["Deutsche Liga"],
  "Francia":CROWD_CHANTS_LG["Ligue Nationale"],
  "Belgio":CROWD_CHANTS_LG["Ligue Nationale"],
  "Spagna":CROWD_CHANTS_LG["Liga Ibérica"],
  "Argentina":CROWD_CHANTS_LG["Liga Ibérica"],
  "Portogallo":CROWD_CHANTS_LG["Liga Lusitana"],
  "Olanda":CROWD_CHANTS_LG["Liga Oranje"],
  "Brasile":{
    goal:["GOOOOL! 🎉","QUE GOLAÇO! ⭐","SENSACIONAL! 🔥","ISSO! ISSO! ✊","FENOMENAL! ⚡","QUE BELEZA! 😍","SHOW DE BOLA! 🌟"],
    home:["BRASIL! BRASIL! 💪","[CLUB]! [CLUB]! 🏆","É CAMPEÃO! ⚡","OLÉ OLÉ BRASIL! 🎊"],
    danger:["DEFENDE! DEFENDE! 🛡️","CUIDADO! 😱","ZAGA! 😤"],
    foul:["ÁRBITRO! 😡","FALTA! 😤","ABSURDO! 🤬","CARTÃO! 🟨"],
    near_miss:["OHHHHH! 😱","QUE PENA! 😩","A TRAVE! 😱","BICHO! 😤"],
    comeback:["BRASIL! BRASIL! 🔥","NÃO DESISTE! 💪","ACREDITA! ⚡"],
    winning:["HEXA! HEXA! 🏆","É CAMPEÃO! ⚡","BRASIL CAMPEÃO! 🎊"],
    losing:["VEM BRASIL! 💙","LUTA! 🔥","FORÇA! 💪"],
    half:["SEGUNDO TEMPO — FORÇA! 🔥","VAMOS EMPURRAR! 💪","É AGORA! ⚡"],
    urgenza:["AGORA! AGORA! 🔥","FALTAM POUCOS MINUTOS! ⏱️","É ESSE O MOMENTO! ⚡","BRASIL VAI LÁ! 💪"],
  },
};
// [6.39.0 collaudo PO «i cori dei tifosi devono essere della lingua giusta!»] FALLBACK CORI PER-LINGUA.
//   I pool per-lega (CROWD_CHANTS_LG) coprono solo alcuni tipi (goal/home/danger/foul/near_miss/comeback/
//   winning/losing/derby/boo). I tipi COMUNI pressure/save/half/urgenza/away_goal (e nelle 2e divisioni anche
//   derby/boo) mancavano da OGNI pool → cadevano sul base ITALIANO anche in leghe straniere («Dai dai daiii!»
//   in Bundesliga, «MIRACOLO!» in Premier). Questo pool per-LINGUA riempie quei buchi NELLA LINGUA GIUSTA.
//   La lingua si deriva dalla lega (LG_LANG) o dalla nazione (NAT_LANG); l'italiano usa il base (già completo).
/* [7.281.0] tinta identitaria di ogni campionato: colora il tappeto di centrocampo, l'anello e il wordmark
   (prop competitionColor → 3D) oltre agli header del walkout e del post-partita. */
/* [7.282.0 collaudo PO «il viola per la Premier League è davvero brutto»] palette rivista: via il viola, e le tinte
   ridistribuite per massima separazione sul verde del prato (la seconda divisione resta la variante chiara della prima). */
const LEAGUE_COMP_COL={"Lega A":"#22c55e","Lega B":"#86efac","Premier Division":"#e11d48","Championship":"#fb7185","Liga Ibérica":"#dc2626","Liga Ibérica 2":"#fca5a5","Deutsche Liga":"#eab308","Deutsche Liga 2":"#fde047","Ligue Nationale":"#0ea5e9","Ligue Nationale 2":"#7dd3fc","Liga Lusitana":"#10b981","Liga Oranje":"#f97316","Liga Anatolica":"#ec4899","Liga Belga":"#14b8a6","Primavera 1":"#34d399","Primavera 2":"#a7f3d0"};
const LG_LANG={"Premier Division":"en","Championship":"en","Deutsche Liga":"de","Deutsche Liga 2":"de","Ligue Nationale":"fr","Ligue Nationale 2":"fr","Liga Ibérica":"es","Liga Ibérica 2":"es","Liga Lusitana":"pt","Liga Oranje":"nl","Liga Anatolica":"tr"};
const NAT_LANG={"Italia":"it","Inghilterra":"en","Germania":"de","Francia":"fr","Belgio":"fr","Spagna":"es","Argentina":"es","Portogallo":"pt","Brasile":"pt","Olanda":"nl"};
const LANG_CHANTS={
  en:{ pressure:["COME ON! 💪","PUSH! PUSH! 🔥","ATTACK! ATTACK! ⚡","LET'S GO! 🙌","GET FORWARD! 🏃","WE WANT MORE! 🔥"],
    save:["WHAT A SAVE! 🧤","KEEPER! 🧤","GREAT STOP! 🛡️","UNBEATABLE! 🦁","WHAT REFLEXES! ⚡"],
    half:["SECOND HALF — COME ON! 🔥","LET'S GO AGAIN! 💪","HERE WE GO! ⚡"],
    urgenza:["COME ON! NOW! 🔥","NOT LONG LEFT! ⏱️","THIS IS THE MOMENT! ⚡","YOU CAN DO IT! 💪"],
    away_goal:["...","Silence in the stands.","The opponents celebrate.","Deflated groans.","Not a sound."],
    derby:["DERBY DAY! 🔥","THIS IS OUR DAY! ⚡","THE CITY IS OURS! 🏆","WIN IT FOR US! ❤️","NO MERCY! 🔥"],
    boo:["BOOOOO! 😤","GET OFF! 😡","NOT GOOD ENOUGH! 💔","EMBARRASSING! 😡","SORT IT OUT! 😤"] },
  de:{ pressure:["LOS! LOS! 💪","DRUCK MACHEN! 🔥","NACH VORNE! ⚡","GEHT! GEHT! 🙌","ANGRIFF! 🏃","WIR WOLLEN MEHR! 🔥"],
    save:["WAS FÜR EINE PARADE! 🧤","TORWART! 🧤","GEHALTEN! 🛡️","UNBEZWINGBAR! 🦁","WELTKLASSE! ⚡"],
    half:["ZWEITE HALBZEIT — LOS! 🔥","NOCHMAL! 💪","AUF GEHT'S! ⚡"],
    urgenza:["JETZT! JETZT! 🔥","NUR NOCH WENIGE MINUTEN! ⏱️","JETZT ODER NIE! ⚡","IHR SCHAFFT DAS! 💪"],
    away_goal:["...","Stille im Stadion.","Der Gegner jubelt.","Enttäuschtes Raunen.","Kein Laut."],
    derby:["DERBY-ZEIT! 🔥","HEUTE UNSER TAG! ⚡","UNSERE STADT! 🏆","GEWINNT FÜR UNS! ❤️","KEINE GNADE! 🔥"],
    boo:["BUUUH! 😤","RAUS! 😡","NICHT GUT GENUG! 💔","BLAMABEL! 😡","REISST EUCH ZUSAMMEN! 😤"] },
  fr:{ pressure:["ALLEZ! ALLEZ! 💪","POUSSEZ! 🔥","EN AVANT! ⚡","ON Y VA! 🙌","ATTAQUEZ! 🏃","ENCORE! 🔥"],
    save:["QUEL ARRÊT! 🧤","GARDIEN! 🧤","SUPERBE! 🛡️","IMBATTABLE! 🦁","QUELS RÉFLEXES! ⚡"],
    half:["DEUXIÈME MI-TEMPS — ALLEZ! 🔥","ON REPART! 💪","C'EST PARTI! ⚡"],
    urgenza:["MAINTENANT! 🔥","PLUS QUE QUELQUES MINUTES! ⏱️","C'EST LE MOMENT! ⚡","VOUS POUVEZ LE FAIRE! 💪"],
    away_goal:["...","Silence dans les tribunes.","L'adversaire exulte.","Murmures déçus.","Aucun bruit."],
    derby:["JOUR DE DERBY! 🔥","C'EST NOTRE JOUR! ⚡","NOTRE VILLE! 🏆","GAGNEZ POUR NOUS! ❤️","AUCUNE PITIÉ! 🔥"],
    boo:["HUUUE! 😤","DEHORS! 😡","PAS À LA HAUTEUR! 💔","LAMENTABLE! 😡","RESSAISISSEZ-VOUS! 😤"] },
  es:{ pressure:["¡VAMOS! ¡VAMOS! 💪","¡EMPUJAD! 🔥","¡ADELANTE! ⚡","¡ARRIBA! 🙌","¡AL ATAQUE! 🏃","¡OTRA! ¡OTRA! 🔥"],
    save:["¡QUÉ PARADÓN! 🧤","¡PORTERO! 🧤","¡ENORME! 🛡️","¡IMBATIBLE! 🦁","¡QUÉ REFLEJOS! ⚡"],
    half:["¡SEGUNDA PARTE — VAMOS! 🔥","¡OTRA VEZ! 💪","¡A POR ELLO! ⚡"],
    urgenza:["¡AHORA! ¡AHORA! 🔥","¡QUEDAN POCOS MINUTOS! ⏱️","¡ES EL MOMENTO! ⚡","¡PODÉIS! 💪"],
    away_goal:["...","Silencio en la grada.","El rival lo celebra.","Murmullos de decepción.","Ni un sonido."],
    derby:["¡DÍA DE DERBI! 🔥","¡ES NUESTRO DÍA! ⚡","¡NUESTRA CIUDAD! 🏆","¡GANAD POR NOSOTROS! ❤️","¡SIN PIEDAD! 🔥"],
    boo:["¡BUUUU! 😤","¡FUERA! 😡","¡NO VALÉIS! 💔","¡VERGONZOSO! 😡","¡ESPABILAD! 😤"] },
  pt:{ pressure:["VAMOS! VAMOS! 💪","PRESSIONA! 🔥","PARA A FRENTE! ⚡","BORA! 🙌","ATACA! 🏃","MAIS! MAIS! 🔥"],
    save:["QUE DEFESA! 🧤","GUARDA-REDES! 🧤","ENORME! 🛡️","IMBATÍVEL! 🦁","QUE REFLEXOS! ⚡"],
    half:["SEGUNDA PARTE — FORÇA! 🔥","OUTRA VEZ! 💪","VAMOS LÁ! ⚡"],
    urgenza:["AGORA! AGORA! 🔥","FALTAM POUCOS MINUTOS! ⏱️","É O MOMENTO! ⚡","VOCÊS CONSEGUEM! 💪"],
    away_goal:["...","Silêncio nas bancadas.","O adversário celebra.","Murmúrios de deceção.","Nem um som."],
    derby:["DIA DE DERBI! 🔥","É O NOSSO DIA! ⚡","A NOSSA CIDADE! 🏆","GANHEM POR NÓS! ❤️","SEM PIEDADE! 🔥"],
    boo:["BUUUU! 😤","FORA! 😡","NÃO CHEGA! 💔","VERGONHOSO! 😡","ACORDEM! 😤"] },
  nl:{ pressure:["KOM OP! 💪","DRUK ZETTEN! 🔥","NAAR VOREN! ⚡","GAAN! GAAN! 🙌","AANVALLEN! 🏃","MEER! MEER! 🔥"],
    save:["WAT EEN REDDING! 🧤","KEEPER! 🧤","GEWELDIG! 🛡️","ONVERSLAANBAAR! 🦁","WAT EEN REFLEX! ⚡"],
    half:["TWEEDE HELFT — KOM OP! 🔥","OPNIEUW! 💪","DAAR GAAN WE! ⚡"],
    urgenza:["NU! NU! 🔥","NOG EVEN! ⏱️","DIT IS HET MOMENT! ⚡","JULLIE KUNNEN HET! 💪"],
    away_goal:["...","Stilte op de tribunes.","De tegenstander juicht.","Teleurgesteld gemompel.","Geen geluid."],
    derby:["DERBYDAG! 🔥","VANDAAG ONZE DAG! ⚡","ONZE STAD! 🏆","WIN VOOR ONS! ❤️","GEEN GENADE! 🔥"],
    boo:["BOEEEE! 😤","ERAF! 😡","NIET GOED GENOEG! 💔","BESCHAMEND! 😡","KOM OP ZEG! 😤"] },
  tr:{ pressure:["HADİ! HADİ! 💪","BASKI! 🔥","İLERİ! ⚡","GİDİN! 🙌","HÜCUM! 🏃","DAHA! DAHA! 🔥"],
    save:["NE KURTARIŞ! 🧤","KALECİ! 🧤","MÜKEMMEL! 🛡️","YENİLMEZ! 🦁","NE REFLEKS! ⚡"],
    half:["İKİNCİ YARI — HADİ! 🔥","TEKRAR! 💪","BAŞLIYORUZ! ⚡"],
    urgenza:["ŞİMDİ! ŞİMDİ! 🔥","AZ KALDI! ⏱️","TAM ZAMANI! ⚡","BAŞARABİLİRSİNİZ! 💪"],
    away_goal:["...","Tribünlerde sessizlik.","Rakip seviniyor.","Hayal kırıklığı.","Çıt yok."],
    derby:["DERBİ GÜNÜ! 🔥","BUGÜN BİZİM GÜNÜMÜZ! ⚡","BU ŞEHİR BİZİM! 🏆","BİZİM İÇİN KAZANIN! ❤️","MERHAMET YOK! 🔥"],
    boo:["YUUUH! 😤","DIŞARI! 😡","YETERSİZ! 💔","REZALET! 😡","KENDİNİZE GELİN! 😤"] },
};
// risolve il pool di cori nella LINGUA della lega/nazione: per-lega specifico → per-lingua (buchi) → base IT
const chantPoolFor=(type,isNat,nation,lg)=>{
  const specific=isNat?((CROWD_CHANTS_NAT[nation||"Italia"]||{})[type]):((CROWD_CHANTS_LG[lg||""]||{})[type]);
  const lang=isNat?(NAT_LANG[nation||"Italia"]||"it"):(LG_LANG[lg||""]||"it");
  const langPool=(LANG_CHANTS[lang]||{})[type];
  return specific||langPool||CROWD_CHANTS[type]||CROWD_CHANTS.home;
};
const SLOT_KEYS=["cpm-v3","cpm-v3-s2","cpm-v3-s3"]; // slot 0 backward-compatible
const storage={
  /* [P0 #2 · audit forense] LE SCRITTURE SONO IN FILA, E LA PIU' RECENTE VINCE SEMPRE.
     `save` e' async: nel browser non si vede (localStorage e' sincrono) ma la build pubblicata su Play
     Store gira su `window.storage` = @capacitor/preferences, iniettato da tools/build-dist.mjs, dove la
     scrittura passa da un bridge asincrono. Due salvataggi concorrenti potevano quindi completare FUORI
     ORDINE — e `savedAt` veniva scritto ma mai riletto, quindi nulla se ne accorgeva. Sequenza misurata
     prima del fix: stato A → parte l'autosave (bridge occupato) → stato B → l'app va in background → il
     flush salva B → il salvataggio di A completa DOPO e riscrive il disco con lo stato vecchio. Su
     Android significa perdere una partita, una settimana, a volte una stagione.
     La cura piu' piccola compatibile con l'architettura: una CODA per chiave (le scritture si
     susseguono nell'ordine in cui sono state chieste, mai sovrapposte) e uno SCARTO delle scritture
     gia' superate (se mentre A aspetta il suo turno e' arrivata B, A non viene nemmeno scritta: il suo
     contenuto e' vecchio per definizione). Nessun campo nuovo nel salvataggio, nessuna nuova
     infrastruttura, formato immutato: i save esistenti restano leggibili identici. */
  _coda:{},_seq:{},
  save:(d,slot=0)=>{
    const key=SLOT_KEYS[slot]||SLOT_KEYS[0];
    const mio=(storage._seq[key]=(storage._seq[key]||0)+1);
    const payload={...d,savedAt:Date.now(),saveVersion:SAVE_VERSION};
    const scrivi=async()=>{
      if(mio<(storage._seq[key]||0)&&!(typeof window!=="undefined"&&window.__CPM_NO_P0_2))return true;/* superata da una richiesta piu' recente: scriverla sarebbe tornare indietro */
      try{const s=JSON.stringify(payload);if(window.storage)await window.storage.set(key,s);else localStorage.setItem(key,s);return true;}catch{return false;}
    };
    /* __CPM_NO_P0_2: interruttore test-only che ripristina il comportamento pre-fix (scritture
       concorrenti, nessuna coda) — serve al guardiano per provare il rosso. */
    if(typeof window!=="undefined"&&window.__CPM_NO_P0_2)return scrivi();
    const p=(storage._coda[key]||Promise.resolve()).then(scrivi,scrivi);
    storage._coda[key]=p.catch(()=>{});
    return p;
  },
  load:async(slot=0)=>{
    const key=SLOT_KEYS[slot]||SLOT_KEYS[0];
    try{
      let s;if(window.storage){const r=await window.storage.get(key);s=r?.value;}else s=localStorage.getItem(key);
      if(!s)return null;
      let d;
      try{d=JSON.parse(s);}catch(parseErr){console.warn("[CPM] Slot",slot,"corrotto — JSON non valido:",parseErr.message);return{_corrupted:true};}
      // Integrity: require player with name
      if(!d?.player?.name)return null;
      return d;
    }catch(_e){console.warn("[CPM] load slot",slot,"errore storage (NON slot vuoto):",_e&&_e.message);return{_error:true};}/* [6.0.0 AR] un errore transitorio non deve sembrare uno slot vuoto */
  },
  del:async(slot=0)=>{
    const key=SLOT_KEYS[slot]||SLOT_KEYS[0];
    try{if(window.storage)await window.storage.delete(key);else localStorage.removeItem(key);}catch{}
  },
  listSlots:async()=>{
    const out=[];
    for(let i=0;i<SLOT_KEYS.length;i++){
      const d=await storage.load(i);
      if(d&&(d._corrupted||d._error))out.push({slot:i,corrupted:!!d._corrupted,error:!!d._error});/* [6.44.0 RC-crit] _error (storage non accessibile) trattato come _corrupted: prima cadeva nel ramo else e dereferenziava d.player.name su {_error:true} → TypeError → listSlots rigetta → boot bloccato sullo spinner */
      else out.push(d&&d.player?{slot:i,name:d.player.name,club:d.player.club?.name||d.player.club?.n||"–",season:d.player.season||1,week:d.player.week||1,ovr:d.player.ovr||60,avatarId:d.player.avatarId||0,savedAt:d.savedAt||0,retired:!!d.player.retired}:null);/* [7.258.0] flag ritiro → badge in Home */
    }
    return out;
  },
};
const toThree=(gx,gy)=>({x:gx-50,z:(gy/100)*60-30});

/* ========================================
   DEBUG TOOLS  (console only)
======================================== */
if(typeof window!=='undefined'&&window.__CPM_STORE_BUILD){window.cpmDebugSimulate=function(){return null;};}else window.cpmDebugSimulate=function(nSeasons=10,leagueName="Lega A"){
  const lc=CLUBS.filter(c=>c.lg===leagueName);
  if(!lc.length){console.warn("[CPM-DEBUG] Lega non trovata:",leagueName);return;}
  const playerClub=lc[0];
  let standings=initStandings(lc);
  const log=[];
  for(let s=1;s<=nSeasons;s++){
    const seed=s*777+hashStr(playerClub.id);
    const cal=generateSeasonCalendar(playerClub,lc,seed);
    standings=initStandings(lc);
    for(let md=0;md<cal.length;md++){
      const _dSd=(hashStr(playerClub.id)+s*100003+(md+1)*9973)>>>0;// [5.76.0 BUG-6] giornata riproducibile anche nel debug-sim
      const sim=simulateMatch(playerClub,lc.find(c=>c.id===cal[md].opponentId)||lc[1],undefined,cal[md].isHome,_dSd);
      standings=updateStandings(standings,playerClub.id,sim,{},{opponentId:cal[md].opponentId,seed:(_dSd^0x9e3779b9)>>>0});
    }
    const mxPlayed=Math.max(...standings.map(t=>t.played));
    const mnPlayed=Math.min(...standings.map(t=>t.played));
    const champ=standings[0];
    const rel=standings.slice(-3).map(t=>t.a||t.n.slice(0,3)).join(",");
    log.push(`S${s}: CAMPIONE=${champ.a} ${champ.pts}pts  RET=[${rel}]  Partite: min=${mnPlayed} max=${mxPlayed}  Δ=${mxPlayed-mnPlayed}`);
    if(mxPlayed-mnPlayed>1)log[log.length-1]+=" ⚠️ DISALLINEAMENTO";
  }
  console.log(`[CPM-DEBUG] Simulazione ${nSeasons} stagioni — ${leagueName} (${lc.length} club)`);
  log.forEach(l=>console.log(l));
  return log;
};
window.cpmDebugLeagues=function(){
  const leghe=["Lega A","Premier Division","Liga Ibérica","Deutsche Liga","Ligue Nationale","Liga Lusitana","Liga Oranje","Liga Belga","Liga Anatolica"];
  leghe.forEach(lg=>{const n=CLUBS.filter(c=>c.lg===lg).length;console.log(`${lg}: ${n} club`);});
};

/* ========================================
   CLAUDE AI INTEGRATION
======================================== */
const CLAUDE_MODEL="claude-sonnet-4-6";// 5.37.1: aggiornato all'ultimo Sonnet (id precedente claude-sonnet-4-20250514 obsoleto)
const CLAUDE_MAX_TOKENS=1000;
const CLAUDE_MIN_INTERVAL=5000; // ms between calls
let _lastClaudeCall=0;
// [5.75.0 BUG-5] safeLS: accesso a localStorage SEMPRE guardato — con storage/cookie disabilitati il solo
//   accesso alla proprietà lancia SecurityError; a module scope (pre-React) uccideva il boot → schermo vuoto muto.
const safeLS={get(k){try{return localStorage.getItem(k);}catch(_e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(_e){}}};
/* [7.342.0 collaudo PO «il pulsante warning nel live match non lo vedo»] GLI STRUMENTI DI COLLAUDO NON SONO
   HOOK DI TEST. Il tasto ⚠️ e la card degli appunti erano protetti da `!window.__CPM_STORE_BUILD`, come i
   probe: ma quel flag lo inietta `tools/build-dist.mjs` in OGNI dist, cioè in tutto ciò che finisce nell'APK —
   quindi sparivano esattamente sul TELEFONO, che è dove il collaudo si fa. Il pulsante era visibile solo
   aprendo l'HTML nel browser del PC, dove non serve a niente.
   Ora hanno un interruttore proprio, ACCESO di default e ricordato sul dispositivo (Carriera → Profilo →
   🐞 Strumenti di collaudo). Gli hook di test restano dove sono, spenti in build store: qui si tratta solo
   del taccuino, che è una funzione del proprietario, non una porta di servizio.
   ⚠️ PRIMA DELLA PUBBLICAZIONE SULLO STORE: portare DEVTOOLS_DEFAULT a false (checklist production-ready). */
const DEVTOOLS_DEFAULT=true;
const devToolsOn=()=>{try{const v=safeLS.get("cpm-devtools");return v==null?DEVTOOLS_DEFAULT:v==="1";}catch(_e){return DEVTOOLS_DEFAULT;}};
const setDevTools=(on)=>{try{safeLS.set("cpm-devtools",on?"1":"0");}catch(_e){}};
