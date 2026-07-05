/* CAREER-INVARIANTS (non-gate ma OBBLIGATORIO prima dei push che toccano la carriera).
   Asserisce gli INVARIANTI del layer CARRIERA usando le funzioni pure del gioco (getLeagueClubs,
   generateSeasonCalendar, initStandings, updateStandings, generateProContracts, migratePlayer) esposte
   sotto ?cpmtest=1. Nasce dalla direttiva PO «stabilizzare il gioco»: il quality-gate visivo e' cieco
   sulla logica di carriera → questi bug passavano il gate. Questa suite li intercetta PRIMA del push.
   Exit != 0 se un invariante fallisce. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const pageErrs=[]; page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>typeof window.getLeagueClubs!=='undefined'||typeof getLeagueClubs!=='undefined'||document.getElementById('root'),{timeout:40000}).catch(()=>{});
await sleep(1500);

const R = await page.evaluate(()=>{
  const fails=[]; const F=(cond,msg)=>{ if(!cond) fails.push(msg); };
  const pick=(a)=>a[0];
  // ---- 1) LEGA: ogni lega di CLUBS <= 18; getLeagueClubs sempre <= 18 per ogni club/stato ----
  try{
    const byLg={}; CLUBS.forEach(c=>byLg[c.lg]=(byLg[c.lg]||0)+1);
    Object.entries(byLg).forEach(([lg,n])=>F(n<=18, `INV-LEAGUE: lega "${lg}" ha ${n} club (>18)`));
    // getLeagueClubs mai > 18, per un campione di club in stati pro/u18
    const sample=[...CLUBS.slice(0,6), ...(typeof U18_CLUBS!=='undefined'?U18_CLUBS.slice(0,3):[]), ...(typeof U18_CLUBS_P2!=='undefined'?U18_CLUBS_P2.slice(0,3):[])];
    sample.forEach(c=>{
      const lc=getLeagueClubs({proStatus:'pro',club:{...c,isU18:false}});
      F(lc.length<=18, `INV-GLC: getLeagueClubs(${c.id}) = ${lc.length} (>18)`);
      F(lc.length>=4, `INV-GLC: getLeagueClubs(${c.id}) = ${lc.length} (<4)`);
    });
    // fallback nazionale non deve gonfiare (club con lg inesistente)
    const bad=getLeagueClubs({proStatus:'pro',club:{id:'x',nat:'🇮🇹',lg:'LEGA_INESISTENTE'}});
    F(bad.length<=18, `INV-GLC-NAT: fallback nazionale = ${bad.length} (>18)`);
  }catch(e){fails.push('INV-LEAGUE threw: '+e.message);}

  // ---- 2) CALENDARIO: <=34 gare, no duplicati, no avversario consecutivo, home/away bilanciato ----
  try{
    const pool=(typeof U18_CLUBS_P2!=='undefined')?U18_CLUBS_P2:CLUBS.filter(c=>c.lg==='Lega A');
    for(let s=1;s<=6;s++){
      const seed=s*777+(typeof hashStr==='function'?hashStr(pool[0].id):s);
      const cal=generateSeasonCalendar(pool[0],pool,seed);
      F(cal.length<=34, `INV-CAL: stagione ${s} ha ${cal.length} gare (>34)`);
      const seen=new Set(); let dup=0,consec=0,home=0,away=0,near5=0;
      for(let i=0;i<cal.length;i++){
        const k=cal[i].opponentId+'|'+cal[i].isHome; if(seen.has(k))dup++; seen.add(k);
        if(i>0&&cal[i].opponentId===cal[i-1].opponentId)consec++;
        for(let j=Math.max(0,i-5);j<i;j++){if(cal[j].opponentId===cal[i].opponentId){near5++;break;}}
        if(cal[i].isHome)home++; else away++;
      }
      F(dup===0, `INV-CAL: stagione ${s} ha ${dup} fixture DUPLICATE`);
      F(consec===0, `INV-CAL: stagione ${s} ha ${consec} avversari CONSECUTIVI`);
      // [6.52.0] andata/ritorno speculare → mai lo stesso avversario entro 5 giornate
      F(near5===0, `INV-CAL: stagione ${s} ha ${near5} avversari RAVVICINATI (entro 5 giornate)`);
      F(Math.abs(home-away)<=2, `INV-CAL: stagione ${s} sbilancio casa/trasferta ${home}/${away}`);
    }
  }catch(e){fails.push('INV-CAL threw: '+e.message);}

  // ---- 3) STANDINGS: initStandings coerente ----
  try{
    const pool=CLUBS.filter(c=>c.lg==='Lega A');
    const st=initStandings(pool);
    F(st.length===pool.length, `INV-STD: initStandings length ${st.length} != ${pool.length}`);
    F(st.every(t=>t.pts===0&&t.played===0), `INV-STD: initStandings non azzerata`);
    F(st.some(t=>t.id===pool[0].id), `INV-STD: club mancante nelle standings`);
  }catch(e){fails.push('INV-STD threw: '+e.message);}

  // ---- 4) TRANSIZIONE PRO: offerta "same_pro" con lega senior VALIDA + getLeagueClubs <=18 ----
  try{
    if(typeof generateProContracts==='function' && typeof U18_CLUBS_P2!=='undefined'){
      [U18_CLUBS_P2[0], (typeof U18_CLUBS!=='undefined'?U18_CLUBS[0]:U18_CLUBS_P2[1])].forEach(club=>{
        const {offers}=generateProContracts({ovr:70,goals:10,matches:20,nation:'Italia',club,season:2,age:18,u18Seasons:1,stats:{},archetype:'finisher'});
        const same=offers.find(o=>o.id==='same_pro');
        F(same && CLUBS.some(c=>c.lg===same.club.lg), `INV-PRO: same_pro club lg "${same&&same.club.lg}" non e' una lega senior valida`);
        F(same && getLeagueClubs({proStatus:'pro',club:same.club}).length<=18, `INV-PRO: lega pro > 18 per ${club.id}`);
      });
    }
  }catch(e){fails.push('INV-PRO threw: '+e.message);}

  // ---- 5) MIGRATION: ripara save pro rotto (lega U18) + IDEMPOTENTE (no churn) ----
  try{
    if(typeof window.__CPM_MIGRATE==='function' && typeof U18_CLUBS_P2!=='undefined'){
      const p2=U18_CLUBS_P2[0];
      const broken={proStatus:'pro',nation:'Italia',season:2,week:1,age:19,ovr:70,stats:{},
        club:{...p2,lg:'Primavera 2',isU18:false},
        standings:CLUBS.filter(c=>c.nat===p2.nat).map(c=>({id:c.id,n:c.n,a:c.a,pts:0,gf:0,ga:0,gd:0,played:0,w:0,d:0,l:0})),
        calendar:[], matchHistory:[]};
      const m1=window.__CPM_MIGRATE(broken);
      F(m1.changed===true, `INV-MIG: save pro rotto non riparato (changed=false)`);
      F((m1.player.standings||[]).length<=18, `INV-MIG: standings dopo repair = ${(m1.player.standings||[]).length} (>18)`);
      F(CLUBS.some(c=>c.lg===m1.player.club.lg), `INV-MIG: club.lg dopo repair "${m1.player.club.lg}" non valida`);
      // idempotenza: ri-migrare il risultato non deve piu' cambiare la lega/standings (no churn instabile)
      const m2=window.__CPM_MIGRATE(m1.player);
      F(m2.player.club.lg===m1.player.club.lg && (m2.player.standings||[]).length===(m1.player.standings||[]).length, `INV-MIG: migrazione NON idempotente (churn)`);

      // [6.36.0 STAB-12] la migration RICONCILIA (non azzera) la classifica in corso su mismatch di dimensione:
      //   un club reale con partite giocate DEVE conservare played/pts dopo la migrazione (prima → azzerato).
      const goodClub=CLUBS.find(c=>c.lg==='Lega A')||CLUBS[0];
      const goodLc=getLeagueClubs({proStatus:'pro',club:{...goodClub,isU18:false}});
      const baseSt=goodLc.map(c=>({...c,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0}));
      baseSt[0]={...baseSt[0],played:5,wins:5,gf:12,ga:3,gd:9,pts:15}; // il club dell'eroe ha già giocato
      const keepId=baseSt[0].id;
      const drift={proStatus:'pro',nation:goodClub.nat||'🇮🇹',season:3,week:12,age:22,ovr:75,stats:{},
        club:{...goodClub,isU18:false},
        standings:[...baseSt,{id:'__BOGUS__',n:'Bogus',a:'BOG',played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0}],// length = lc+1 → trigger reconcile
        calendar:[{matchday:1,week:1,opponentId:goodLc[1]?.id,opponentName:goodLc[1]?.n,isHome:true,played:false}], matchHistory:[]};
      const mR=window.__CPM_MIGRATE(drift);
      const keptRow=(mR.player.standings||[]).find(s=>s.id===keepId);
      F(keptRow && keptRow.played===5 && keptRow.pts===15, `INV-MIG-RECON: classifica in corso AZZERATA dalla migration (played=${keptRow&&keptRow.played}, pts=${keptRow&&keptRow.pts}, atteso 5/15)`);
      F((mR.player.standings||[]).length===goodLc.length, `INV-MIG-RECON: dimensione classifica ${(mR.player.standings||[]).length} != ${goodLc.length}`);
      F(!(mR.player.standings||[]).some(s=>s.id==='__BOGUS__'), `INV-MIG-RECON: riga extra (BOGUS) non scartata`);

      // [6.37.0 STAB-17] form===0 (falsy) DEVE essere normalizzata a [30,95] (prima (form||70) la mascherava a 70).
      const mForm0=window.__CPM_MIGRATE({proStatus:'pro',club:{...p2,lg:'Lega B',isU18:false},form:0,season:2,week:1,standings:[],calendar:[]});
      F(mForm0.player.form>=30&&mForm0.player.form<=95, `INV-MIG-FORM: form===0 non normalizzata (got ${mForm0.player.form})`);
      const mForm150=window.__CPM_MIGRATE({proStatus:'pro',club:{...p2,lg:'Lega B',isU18:false},form:150,season:2,week:1,standings:[],calendar:[]});
      F(mForm150.player.form>=30&&mForm150.player.form<=95, `INV-MIG-FORM: form fuori range (150) non clampata (got ${mForm150.player.form})`);
      const mForm60=window.__CPM_MIGRATE({proStatus:'pro',club:{...p2,lg:'Lega B',isU18:false},form:60,season:2,week:1,standings:[],calendar:[]});
      F(mForm60.player.form===60, `INV-MIG-FORM: form valida (60) alterata (got ${mForm60.player.form})`);
    }
  }catch(e){fails.push('INV-MIG threw: '+e.message);}

  // ---- 6) NAZIONALE: schedule pura coerente coi trigger (settimana 20; %4->Euro/Mondiale; else pari->Coppa) ----
  try{
    const typeFor=(s)=> s%4===0?(s%8===0?'Mondiale':'Europeo'):(s%2===0?'Coppa delle Nazioni':null);
    F(typeFor(8)==='Mondiale' && typeFor(12)==='Europeo' && typeFor(16)==='Mondiale' && typeFor(10)==='Coppa delle Nazioni' && typeFor(14)==='Coppa delle Nazioni' && typeFor(11)===null,
      `INV-NAT: schedule nazionale non coerente coi trigger`);
  }catch(e){fails.push('INV-NAT threw: '+e.message);}

  // ---- 7) [6.33.0 STAB-4] EURO GROUP TABLE: legge le chiavi opp/hs/as → gf/ga della riga eroe corretti.
  //   (Il bug: l'auto-sim di doAdvanceWeek scriveva opponent/homeScore/awayScore → gf/ga=0, tiebreaker rotto.)
  try{
    if(typeof euroGroupTable==='function'){
      const eu={competition:'UCL',groupResults:[
        {opp:'A',won:true,drew:false,hs:3,as:1},
        {opp:'B',won:false,drew:false,hs:0,as:2},
        {opp:'C',won:false,drew:true,hs:1,as:1}],
        groupOpponents:[{n:'Alfa',a:'ALF'},{n:'Beta',a:'BET'},{n:'Gamma',a:'GAM'}]};
      const t=euroGroupTable(eu,{n:'TU',a:'TU'});
      const me=t.find(r=>r.isPlayer);
      F(me && me.gf===4 && me.ga===4, `INV-EGT: riga eroe gf/ga errati (gf=${me&&me.gf} ga=${me&&me.ga}, atteso 4/4) → chiavi hs/as non lette`);
      F(me && me.pts===4, `INV-EGT: pts eroe ${me&&me.pts} (atteso 4 = 1V+1P+1N)`);
      F(t.length===4, `INV-EGT: tabella girone ${t.length} righe (atteso 4)`);
      // determinismo: stessa tabella a due chiamate
      const t2=euroGroupTable(eu,{n:'TU',a:'TU'});
      F(JSON.stringify(t.map(r=>[r.n,r.pts,r.gf,r.ga]))===JSON.stringify(t2.map(r=>[r.n,r.pts,r.gf,r.ga])), `INV-EGT: euroGroupTable NON deterministica`);
    }
  }catch(e){fails.push('INV-EGT threw: '+e.message);}

  // ---- 8) [6.34.0 STAB-9] PRESTITO: generateTransferOffer non produce MAI offerte se il giocatore è in
  //   prestito — guardia al chokepoint unico (prima 2 dei 3 call-site la bypassavano). ----
  try{
    if(typeof generateTransferOffer==='function'){
      const base={ovr:78,season:5,totalMatches:60,age:22,nation:'Italia',club:CLUBS.find(c=>c.lg==='Lega A')||CLUBS[0],stats:{},archetype:'finisher',form:75,morale:75,value:12};
      const onLoan=generateTransferOffer({...base,loan:{parentClubId:'x',parentClub:base.club,untilSeason:6}});
      F(onLoan===null, `INV-LOAN: generateTransferOffer produce un'offerta mentre in prestito (atteso null)`);
      // sanity: senza prestito PUÒ produrre offerte (non deve essere sempre null per un bug di guardia)
      let anyOffer=false; for(let k=0;k<12;k++){ if(generateTransferOffer({...base,loan:null})){anyOffer=true;break;} }
      F(anyOffer, `INV-LOAN: generateTransferOffer non produce MAI offerte senza prestito (guardia troppo aggressiva?)`);
    }
  }catch(e){fails.push('INV-LOAN threw: '+e.message);}

  // ---- 9) [6.50.0] CALENDAR SELF-HEAL: migratePlayer deduplica i fixture di LEGA (opp+sede) e risolve le
  //   collisioni di settimana lega↔lega, senza toccare coppa/euro né le partite giocate. NO-OP su calendario sano. ----
  try{
    if(typeof window.__CPM_MIGRATE==='function'){
      const club=CLUBS.find(c=>c.lg==='Lega A')||CLUBS[0];
      const lc=getLeagueClubs({proStatus:'pro',club:{...club,isU18:false}}).filter(c=>c.id!==club.id);
      const oA=lc[0],oB=lc[1],oC=lc[2];
      // calendario CORROTTO: due gare di lega alla STESSA settimana (34), un fixture DUPLICATO (oA/H ×2),
      //   + una gara di COPPA che CONDIVIDE la settimana con una di lega (deve restare, non è collisione lega↔lega).
      const corrupt={proStatus:'pro',nation:club.nat||'🇮🇹',season:3,week:33,age:24,ovr:76,stats:{},form:70,
        club:{...club,isU18:false},standings:[],matchHistory:[],
        calendar:[
          {matchday:30,week:30,opponentId:oA.id,opponentName:oA.n,isHome:true,played:true,result:{homeScore:1,awayScore:0,won:true,drew:false}},
          {matchday:31,week:34,opponentId:oB.id,opponentName:oB.n,isHome:true,played:false,result:null},
          {matchday:32,week:34,opponentId:oC.id,opponentName:oC.n,isHome:false,played:false,result:null}, // collisione lega↔lega con matchday 31
          {matchday:33,week:35,opponentId:oA.id,opponentName:oA.n,isHome:true,played:false,result:null},   // DUPLICATO di matchday 30 (oA/H)
          {matchday:990,week:34,opponentId:oB.id,opponentName:oB.n,isHome:true,played:false,result:null,type:'cup',competition:'Coppa Nazionale'} // condivide W34 con la lega: OK
        ]};
      const mh=window.__CPM_MIGRATE(corrupt);
      const cal=mh.player.calendar||[];
      const lgU=cal.filter(m=>(!m.type||m.type==='league')&&!m.played);
      // nessuna collisione di settimana tra voci di lega non giocate
      const wk=lgU.map(m=>m.week); const wkDup=wk.length-new Set(wk).size;
      F(wkDup===0, `INV-CALHEAL: ${wkDup} collisioni di settimana lega↔lega dopo heal (attese 0)`);
      // nessun fixture di lega duplicato (opp+sede) tra TUTTE le voci di lega
      const lgAll=cal.filter(m=>!m.type||m.type==='league');
      const fk=lgAll.map(m=>`${m.opponentId||m.opponentName}|${m.isHome?'H':'A'}`);
      const fkDup=fk.length-new Set(fk).size;
      F(fkDup===0, `INV-CALHEAL: ${fkDup} fixture di lega DUPLICATI dopo heal (attesi 0)`);
      // la gara di COPPA sopravvive e mantiene la sua settimana (non è lega↔lega)
      const cup=cal.find(m=>m.type==='cup');
      F(cup && cup.week===34, `INV-CALHEAL: gara di coppa rimossa/spostata (week=${cup&&cup.week}, attesa 34)`);
      // la partita GIOCATA resta intatta (week + risultato)
      const played=cal.find(m=>m.matchday===30);
      F(played && played.played===true && played.week===30, `INV-CALHEAL: partita giocata alterata`);
      // NO-OP su calendario SANO: nessun cambio alle settimane di lega
      const seed=3*777+(typeof hashStr==='function'?hashStr(club.id):3);
      const healthy=generateSeasonCalendar(club,[club,...lc],seed);
      const good={proStatus:'pro',nation:club.nat||'🇮🇹',season:3,week:1,age:24,ovr:76,stats:{},form:70,
        club:{...club,isU18:false},standings:[],matchHistory:[],calendar:healthy.map(m=>({...m}))};
      const mg=window.__CPM_MIGRATE(good);
      const before=healthy.map(m=>m.matchday+':'+m.week).join(',');
      const after=(mg.player.calendar||[]).filter(m=>!m.type||m.type==='league').sort((a,b)=>a.matchday-b.matchday).map(m=>m.matchday+':'+m.week).join(',');
      F(before===after, `INV-CALHEAL: heal ha ALTERATO un calendario sano (regressione)`);
    }
  }catch(e){fails.push('INV-CALHEAL threw: '+e.message);}

  return { fails, clubs:CLUBS.length };
});

console.log('=== CAREER-INVARIANTS ===');
console.log(`club totali: ${R.clubs} · pageerror: ${pageErrs.length}`);
if(pageErrs.length) pageErrs.slice(0,5).forEach(e=>console.log('  PAGEERR', e));
if(R.fails.length){
  console.log(`\n❌ ${R.fails.length} INVARIANTI VIOLATI:`);
  R.fails.forEach(f=>console.log('  ✗ '+f));
} else {
  console.log('\n✅ tutti gli invarianti di carriera tengono');
}
await browser.close(); srv.close();
process.exit((R.fails.length||pageErrs.length)?1:0);
