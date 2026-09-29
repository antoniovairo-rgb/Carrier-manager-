#!/usr/bin/env node
// Reload field and visible-UI probe on 7.999.53. Run: node tests/codex/reload-53.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, process.env.CPM_OUTPUT || 'reload-53-results.json');
const ALL_SEEDS = [2];
const SEEDS = process.env.CPM_SEEDS ? process.env.CPM_SEEDS.split(',').map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<36) : ALL_SEEDS;
const MAX_SEASONS = Number(process.env.CPM_MAX_SEASONS)||0;
const DEADLINE_MS = Number(process.env.CPM_TIME_LIMIT_MS)||4*60*60*1000;
const ATTRS = ['velocità','tecnica','fisico','mentalità','tiro','passaggio','dribbling','posizionamento'];
const ARCH = ['bomber','fantasista','velocista','trequartista','leader','centravanti','enfant','tuttocampista'];
const START = ['Primavera','piccolo','medio','vertice'];
const FORCE = ['debole','media','forte'];
const STYLE = ['prudente','ambizioso','casuale'];
const started = Date.now();
const run = { command:'node tests/codex/reload-53.mjs', env:{CPM_SEEDS:process.env.CPM_SEEDS||null,CPM_MAX_SEASONS:MAX_SEASONS||null,CPM_TIME_LIMIT_MS:DEADLINE_MS,CPM_OUTPUT:process.env.CPM_OUTPUT||null}, startedAt:new Date().toISOString(), version:null, commit:null, catalog:null, careers:[], anomalies:[], failures:[], limits:[], durationMs:0 };
const seenIssues = new Set();
const saveRun = () => { run.durationMs=Date.now()-started; fs.writeFileSync(OUT,JSON.stringify(run,null,2)); };
const fail = (command,error,seed=null) => { const row={command,error:String(error),seed};run.failures.push(row);console.error('COMMAND_FAIL',JSON.stringify(row));saveRun(); };
const issue = (c,s,type,details,severity='media',status='verificata') => {
  const key=[c.seed,s?.season,s?.week,type,details].join('|');if(seenIssues.has(key))return;seenIssues.add(key);
  run.anomalies.push({seed:c.seed,career:c.matrix,season:s?.season??null,week:s?.week??null,type,observed:details,severity,status});
};
const hash = text => { let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0; };
const canonical = v => JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
const diffPaths = (a,b,p='',out=[]) => {if(out.length>=200)return out;if(canonical(a)===canonical(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diffPaths(a[k],b[k],p?`${p}.${k}`:k,out);}else out.push({path:p,before:a,after:b});return out;};
const finiteScan = (v,p='',out=[]) => { if(v===undefined||typeof v==='number'&&!Number.isFinite(v))out.push(p||'$');else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))finiteScan(x,p?`${p}.${k}`:k,out);return out; };
const offerClub = (text,clubs,current) => clubs.filter(x=>x.id!==current).sort((a,b)=>b.n.length-a.n.length).find(x=>text.includes(x.n));
async function visibleViews(page){
  const views={};
  for(const tab of ['dashboard','club','carriera','agente','coppe','profile']){
    await page.evaluate(t=>window.__CPM_CAREER.goTab(t),tab);await sleep(90);
    views[tab]=(await page.locator('body').innerText()).slice(0,18000);
  }
  await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));
  return views;
}
async function enterCareer(page){
  const until=Date.now()+60000;
  while(Date.now()<until){
    if(await page.evaluate(()=>!!window.__CPM_CAREER).catch(()=>false))return;
    const button=page.getByText(/CONTINUA/i).first();
    try{if(await button.isVisible())await button.click({timeout:1500,noWaitAfter:true});}catch{}
    await sleep(700);
  }
  const body=await page.evaluate(()=>document.body?.innerText?.slice(0,500)||'').catch(()=>'<unavailable>');
  throw new Error(`career hook not ready after 60s; visible text: ${body}`);
}
const marketValue = s => typeof s.value==='number'?s.value:null;
const avgRating = s => {const a=(s.matchHistory||[]).filter(x=>x&&x.season===s.season&&typeof x.rating==='number');return a.length?+(a.reduce((sum,x)=>sum+x.rating,0)/a.length).toFixed(2):null;};
const seasonStats = s => ({season:s.season,age:s.age,club:s.club?.id||null,league:s.club?.lg||null,ovr:s.ovr,goals:s.goals??null,matches:s.matches??null,rating:avgRating(s),value:marketValue(s),wage:s.contract?.wage??null,expiresAtSeason:s.contract?.expiresAtSeason??null,contractDuration:s.contract?.duration??null,coachTrust:s.coachTrust??null,injured:s.injured??null,diaryLength:(s.diary||[]).length,diarySeasons:[...new Set((s.diary||[]).map(x=>x?.season).filter(Number.isInteger))].sort((a,b)=>a-b),trophies:s.trophies||[],playerAwards:s.playerAwards||[],primaveraAwards:s.primaveraAwards||[],bank:s.bankBalance??null,calendarN:(s.calendar||[]).length,calendarUnplayed:(s.calendar||[]).filter(x=>!x.played).length});
async function maybeRenew(page,c,s){
  if(s.proStatus!=='pro'||!s.contract)return;
  const relevant=!!s.contractExpired||s.contract.duration<=1||s.contract.expiresAtSeason<=s.season+1;
  if(!relevant)return;
  const key=`${s.season}|${Math.floor(((s.week||1)-1)/15)}`;
  if(c.renewalChecked.includes(key))return;
  c.renewalChecked.push(key);
  const oldScreen=await page.evaluate(()=>window.__CPM_CAREER.screen());
  if(oldScreen==='seasonEnd'||oldScreen==='seasonAwards'||oldScreen==='proTransition')return;
  const contractOpen=await page.getByText('Negoziazione Contratto',{exact:true}).isVisible().catch(()=>false);
  if(!contractOpen){await page.evaluate(()=>window.__CPM_CAREER.dismiss());await sleep(90);}
  await page.evaluate(t=>window.__CPM_CAREER.goTab(t),s.contractExpired?'dashboard':'agente');
  await sleep(90);
  const open=page.getByRole('button',{name:/Negozia rinnovo/i}).first();
  const shown=await open.isVisible().catch(()=>false);
  if(!shown){c.renewals.push({season:s.season,week:s.week,outcome:'button-unavailable',oldScreen,expiresAtSeason:s.contract.expiresAtSeason,duration:s.contract.duration});await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));return;}
  await open.click({timeout:3000});await sleep(90);
  const refused=await page.getByText('Il club non intende rinnovare',{exact:true}).isVisible().catch(()=>false);
  if(refused){c.renewals.push({season:s.season,week:s.week,outcome:'club-refused',oldScreen,expiresAtSeason:s.contract.expiresAtSeason,duration:s.contract.duration,coachTrust:s.coachTrust??null});const close=page.getByRole('button',{name:/Chiudi/i}).last();if(await close.isVisible().catch(()=>false))await close.click({timeout:3000});}
  else {const accept=page.getByRole('button',{name:/Accetta l.offerta del club/i}).first();if(await accept.isVisible().catch(()=>false)){await accept.click({timeout:3000});await sleep(80);const after=await page.evaluate(()=>window.__CPM_CAREER.snapshot());c.renewals.push({season:s.season,week:s.week,outcome:'accepted-ui',oldScreen,before:s.contract,after:after.contract});}else c.renewals.push({season:s.season,week:s.week,outcome:'modal-unrecognized',oldScreen,modal:(await page.locator('body').innerText()).slice(-1000)});}
  await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));
  await sleep(50);
}
const buildSave = (seed,catalog) => {
  const start=START[Math.floor(seed/9)], strength=FORCE[Math.floor(seed%9/3)], style=STYLE[seed%3], archetype=ARCH[seed%8];
  const requestedLeague=catalog.leagues[seed%catalog.leagues.length];
  const tier=c=>start==='piccolo'?c.p<65:start==='medio'?c.p>=65&&c.p<78:c.p>=78;
  let pool=start==='Primavera'?catalog.u18:catalog.clubs.filter(c=>c.lg===requestedLeague&&tier(c));
  let leagueFallback=false;if(!pool.length&&start!=='Primavera'){pool=catalog.clubs.filter(tier);leagueFallback=true;}
  if(!pool.length)throw new Error(`no club for ${start}/${requestedLeague}`);
  const club=pool[hash(`club|${seed}`)%pool.length], base=[58,70,84][Math.floor(seed%9/3)]+seed%5;
  const season=start==='Primavera'?1:2, age=start==='Primavera'?16:20;
  const stats=Object.fromEntries(ATTRS.map(k=>[k,base]));
  const player={name:`QA Carriera ${seed}`,nation:'Italia',avatarId:0,proStatus:start==='Primavera'?'u18':'pro',season,week:1,age,ovr:base,archetype,tutorialDone:true,club,stats,form:70,morale:72,fatigue:10,contract:{duration:3,wage:start==='Primavera'?0:6000,expiresAtSeason:season+3}};
  return {save:{phase:'career',player},matrix:{start,strength,style,archetype,requestedLeague,actualLeague:club.lg,club:club.n,clubId:club.id,leagueFallback,base}};
};

let srv,browser,page,currentCareer=null;
try {
  const html=fs.readFileSync(path.join(ROOT,'CARRIER-MANAGER-AV.html'),'utf8');
  run.version=(html.match(/GAME_VERSION="([0-9.]+)"/)||[])[1]||null;
  const {execFileSync}=await import('node:child_process');
  run.commit=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
  if(run.version!=='7.999.53')throw new Error(`version gate: ${run.version}`);
  srv=await startServer();browser=await launchBrowser();page=await browser.newPage({viewport:{width:900,height:900}});
  await installCdnRoutes(page);
  page.on('pageerror',e=>{if(currentCareer)currentCareer.pageErrors.push(String(e.message));});
  await page.addInitScript(()=>{
    window.__CPM_GLB=false;window.__CPM_SIM_NAT=1;
    const raw=sessionStorage.getItem('qa-rng-state')||localStorage.getItem('qa-seed');
    if(raw){let x=(Number(raw)>>>0)||1;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};window.__QA_RNG_STATE=()=>x>>>0;}
  });
  const url=`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:120000});
  const catalog=await page.evaluate(()=>({clubs:CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg})),u18:U18_CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg}))}));
  catalog.leagues=[...new Set(catalog.clubs.map(c=>c.lg))];
  run.catalog={professionalClubs:catalog.clubs.length,u18Clubs:catalog.u18.length,leagues:catalog.leagues,leagueCounts:Object.fromEntries(catalog.leagues.map(l=>[l,catalog.clubs.filter(c=>c.lg===l).length]))};
  console.log('CATALOG',JSON.stringify(run.catalog));saveRun();

  for(const seed of SEEDS){
    if(Date.now()-started>=DEADLINE_MS){run.limits.push('4h execution ceiling reached');break;}
    const c={seed,matrix:null,steps:0,seasonsDone:0,seasonStats:[],transfers:[],injuries:[],events:{},messages:{},pageErrors:[],status:'running',durationMs:0,interventions:[],saveChecks:[],calendarDays:{},renewals:[],renewalChecked:[],zeroSeasons:[],openingTrace:[]};
    currentCareer=c;run.careers.push(c);const t0=Date.now();
    try{
      const setup=buildSave(seed,catalog);c.matrix=setup.matrix;
      // Ogni carriera nasce in un contesto di storage nuovo: la pagina precedente
      // non può riscrivere il proprio salvataggio durante unload/reload.
      await page.close();page=await browser.newPage({viewport:{width:900,height:900}});
      await installCdnRoutes(page);
      page.on('pageerror',e=>{if(currentCareer)currentCareer.pageErrors.push(String(e.message));});
      await page.addInitScript(({save,n})=>{
        window.__CPM_GLB=false;window.__CPM_SIM_NAT=1;
        if(!sessionStorage.getItem('qa-initialized')){
          localStorage.setItem('cpm-v3',JSON.stringify(save));localStorage.setItem('qa-seed',String(n+1));
          sessionStorage.setItem('qa-rng-state',String(n+1));sessionStorage.setItem('qa-initialized','1');}
        let x=(Number(sessionStorage.getItem('qa-rng-state')||localStorage.getItem('qa-seed'))>>>0)||1;
        Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};window.__QA_RNG_STATE=()=>x>>>0;
      },{save:setup.save,n:seed});
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
      await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:120000});
      await enterCareer(page);await sleep(150);
      let prev=await page.evaluate(()=>window.__CPM_CAREER.snapshot());
      if(typeof prev!=='object'||!prev)throw new Error('initial snapshot missing');
      const initialSeason=prev.season;let lastKey=`${prev.season}|${prev.week}`,same=0,screenStall=0,lastScreen=null;
      let lastLog=(prev.log||[]).slice(),lastDiary=(prev.diary||[]).slice(),injStart=null;
      const target=MAX_SEASONS||3;
      const offerWeeks=new Set();const seasonTeamN=new Map();const ageBySeason=new Map([[prev.season,prev.age]]);
      const checkedCalendar=new Set();let lastClub=prev.club?.id;
      const inspect=s=>{
        if(!s||typeof s!=='object'){issue(c,prev,'snapshot',`snapshot invalid: ${String(s)}`,'alta');return;}
        const bad=finiteScan(s);for(const p of bad)issue(c,s,'numeric',`non-finite/undefined at ${p}`,'alta');
        if(!(s.ovr>=40&&s.ovr<=99))issue(c,s,'ovr',`ovr=${s.ovr}`,'alta');
        for(const k of ATTRS)if(s.stats?.[k]!==undefined&&!(s.stats[k]>=1&&s.stats[k]<=99))issue(c,s,'attribute',`${k}=${s.stats[k]}`,'alta');
        if(prev){if(s.season<prev.season||s.season===prev.season&&s.week<prev.week)issue(c,s,'time',`S${prev.season}W${prev.week}→S${s.season}W${s.week}`,'alta');
          if(s.season>prev.season&&s.age!==prev.age+1)issue(c,s,'age',`age ${prev.age}→${s.age}`,'alta');}
        if(typeof s.bankBalance==='number'&&s.bankBalance<0)issue(c,s,'bank',`bankBalance=${s.bankBalance}`,'alta');
        if(s.proStatus==='pro'&&s.contract){if(!(s.contract.wage>0))issue(c,s,'wage',`wage=${s.contract.wage}`,'alta');if(s.contract.expiresAtSeason<s.season)issue(c,s,'contract',`expiresAtSeason=${s.contract.expiresAtSeason}<${s.season}`,'media');}
        if(typeof s.value==='number'&&s.value<0)issue(c,s,'value',`value=${s.value}`,'alta');
        if(s.club&&s.proStatus==='pro'){const db=catalog.clubs.find(x=>x.id===s.club.id);if(db&&s.club.lg!==db.lg&&!s.leagueOverrides?.[s.club.id])issue(c,s,'league',`${s.club.id}: ${s.club.lg} vs database ${db.lg}`,'media');}
        const st=s.standings;if(Array.isArray(st)){
          const n=seasonTeamN.get(s.season);if(n===undefined)seasonTeamN.set(s.season,st.length);else if(n!==st.length)issue(c,s,'standings-size',`${n}→${st.length}`,'media');
          let gf=0,ga=0;for(const row of st){if(['played','wins','draws','losses'].every(k=>typeof row[k]==='number')&&row.wins+row.draws+row.losses!==row.played)issue(c,s,'standings-record',`${row.id}: ${row.wins}+${row.draws}+${row.losses}≠${row.played}`,'alta');if(['pts','wins','draws'].every(k=>typeof row[k]==='number')&&row.pts!==3*row.wins+row.draws)issue(c,s,'standings-points',`${row.id}: pts=${row.pts}, expected=${3*row.wins+row.draws}`,'alta');gf+=row.gf||0;ga+=row.ga||0;}
          if(gf!==ga)issue(c,s,'standings-goals',`GF=${gf}, GA=${ga}`,'alta');
          if(s.week===1&&st.some(r=>r.played||r.gf||r.ga||r.pts))issue(c,s,'season-start',`week 1 standings not zero`,'media');
        }
        const cal=Array.isArray(s.calendar)?s.calendar:[];
        if(!checkedCalendar.has(s.season)){
          checkedCalendar.add(s.season);const lg=cal.filter(m=>!m.type||m.type==='league');
          c.calendarDays[s.season]={league:s.club?.lg||null,days:lg.length};
          const md=new Set(),w=new Map(),opp=new Map();for(const m of lg){if(md.has(m.matchday))issue(c,s,'calendar-duplicate',`matchday ${m.matchday} repeated`,'alta');md.add(m.matchday);w.set(m.week,(w.get(m.week)||0)+1);const x=opp.get(m.opponentId)||[];x.push(!!m.isHome);opp.set(m.opponentId,x);}
          for(const [week,n] of w)if(n>1)issue(c,{...s,week},'calendar-week',`${n} league matches in week ${week}`,'alta');
          for(const [id,home] of opp)if(home.length>2||home.length===2&&home[0]===home[1])issue(c,s,'calendar-opponent',`${id}: ${home.length} games, home=${home.join(',')}`,'alta');
        }
        const em=s.euroMondiale||{},nc=s.nationsCupQueue||{};if(em.active&&!em.done&&nc.active&&!nc.done)issue(c,s,'national-overlap','both national tournaments active','alta');
        if(s.club?.id&&lastClub&&s.club.id!==lastClub){c.transfers.push({season:s.season,week:s.week,from:lastClub,to:s.club.id,league:s.club.lg});lastClub=s.club.id;}
        if(s.injured&&!injStart)injStart={season:s.season,week:s.week};if(!s.injured&&injStart){c.injuries.push({...injStart,recoveredSeason:s.season,recoveredWeek:s.week});injStart=null;}
        const logs=(s.log||[]);const index=logs.indexOf(lastLog[0]);const newest=index>=0?logs.slice(0,index):logs[0]!==lastLog[0]?logs.slice(0,1):[];
        for(const text of newest){const k=`${s.season}|${text}`;c.messages[k]=(c.messages[k]||0)+1;}
        lastLog=logs.slice();const diary=s.diary||[];let nd=[];if(diary.length>lastDiary.length)nd=diary.slice(lastDiary.length);else if(diary.length&&canonical(diary.at(-1))!==canonical(lastDiary.at(-1)))nd=[diary.at(-1)];
        for(const d of nd){const text=typeof d==='string'?d:(d.id||d.type||d.headline||d.body||JSON.stringify(d));c.events[text]=(c.events[text]||0)+1;}lastDiary=diary.slice();
        prev=s;
      };
      inspect(prev);
      while(c.steps<3600&&c.seasonsDone<target&&Date.now()-started<DEADLINE_MS){
        // Reload comparison reproduces the previous matrix policy exactly:
        // no renewal choice is made in this isolated persistence probe.
        const before=await page.evaluate(()=>window.__CPM_CAREER.snapshot());
        const beforeScreen=await page.evaluate(()=>window.__CPM_CAREER.screen());
        if(seed===30&&before.season===16&&before.week===1&&c.openingTrace.length===0)c.openingBefore=before;
        const step=await page.evaluate(()=>{const C=window.__CPM_CAREER;const r=C.step();return{r,screen:C.screen(),snapshot:C.snapshot()};});
        if(seed===30&&before.season===16&&before.week===1)c.openingTrace.push({step:c.steps+1,beforeScreen,afterScreen:step.screen,result:step.r,beforeWeek:before.week,afterWeek:step.snapshot?.week??null});
        await page.evaluate(()=>window.__CPM_CAREER.dismiss());
        c.steps++;if(typeof step.r==='string'&&step.r.startsWith('error:')){issue(c,before,'step',step.r,'alta');c.status='error';break;}
        if(step.r==='seasonEnd'){
          const end=before;const stat=seasonStats(end);stat.squadRole=await page.evaluate(()=>typeof calcSquadRole==='function'?calcSquadRole(window.__CPM_CAREER.snapshot()):null);stat.screen=beforeScreen;c.seasonStats.push(stat);if(stat.matches===0)c.zeroSeasons.push(stat);
          const unplayed=(end.calendar||[]).filter(m=>(!m.type||m.type==='league')&&!m.played);
          if(unplayed.length)issue(c,end,'calendar-unplayed',`${unplayed.length} league matches unplayed at season end`,'alta');
          const nat=[end.euroMondiale,end.nationsCupQueue].filter(t=>t?.active&&!t?.done);if(nat.length)issue(c,end,'national-unclosed',`${nat.length} active tournaments at season end`,'alta');
          for(const [k,n] of Object.entries(c.messages))if(k.startsWith(`${end.season}|`)&&n>3)issue(c,end,'message-repeat',`${n}× ${k.slice(k.indexOf('|')+1)}`,'bassa');
          const rollover=await page.evaluate(()=>window.__CPM_CAREER.startNewSeason());
          if(rollover!==true){issue(c,end,'rollover',`startNewSeason returned ${String(rollover)}`,'alta');c.status='error';break;}
          await sleep(180);
          const rolloverState=await page.evaluate(()=>({snapshot:window.__CPM_CAREER.snapshot(),screen:window.__CPM_CAREER.screen()}));
          const next=rolloverState.snapshot;inspect(next);c.seasonsDone++;
          console.log('SEASON',JSON.stringify({seed,done:c.seasonsDone,season:end.season,week:end.week,goals:end.goals??null,matches:end.matches??null,ovr:end.ovr,issues:run.anomalies.filter(x=>x.seed===seed).length}));
          if(rolloverState.screen==='careerEnd'){c.status='retired';c.retirementAge=next.age;saveRun();break;}
          if(c.seasonsDone%2===0&&c.seasonsDone<target){
            await sleep(200);const a=await page.evaluate(()=>{sessionStorage.setItem('qa-rng-state',String(window.__QA_RNG_STATE?.()||1));return window.__CPM_CAREER.snapshot();});
            const beforeViews=await visibleViews(page);
            await page.reload({waitUntil:'domcontentloaded',timeout:120000});
            await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:120000});
            await enterCareer(page);
            await sleep(200);const b=await page.evaluate(()=>window.__CPM_CAREER.snapshot());const afterViews=await visibleViews(page);const sameSave=canonical(a)===canonical(b),differences=sameSave?[]:diffPaths(a,b);c.saveChecks.push({season:b.season,week:b.week,equal:sameSave,differences,beforeViews,afterViews});if(!sameSave)issue(c,b,'save-restore',`snapshot changed after reload: ${JSON.stringify(differences)}`,'alta');prev=b;lastLog=(b.log||[]).slice();lastDiary=(b.diary||[]).slice();
          }
          saveRun();continue;
        }
        if(typeof step.r==='string'&&step.r.startsWith('blocked:')){issue(c,before,'tournament-block',step.r,'alta');await page.evaluate(()=>window.__CPM_CAREER.clearTournaments());await sleep(80);continue;}
        await sleep(65);
        let after=await page.evaluate(()=>({snapshot:window.__CPM_CAREER.snapshot(),screen:window.__CPM_CAREER.screen()}));
        if(after.screen==='proTransition'){
          // Primavera ends on its offer screen, without a "seasonEnd" return.
          // Record that completed season before making the required UI choice.
          const stat=seasonStats(after.snapshot);stat.squadRole=await page.evaluate(()=>typeof calcSquadRole==='function'?calcSquadRole(window.__CPM_CAREER.snapshot()):null);stat.screen=after.screen;c.seasonStats.push(stat);if(stat.matches===0)c.zeroSeasons.push(stat);
          c.seasonsDone++;
          console.log('SEASON',JSON.stringify({seed,done:c.seasonsDone,season:after.snapshot.season,week:after.snapshot.week,goals:after.snapshot.goals??null,matches:after.snapshot.matches??null,ovr:after.snapshot.ovr,issues:run.anomalies.filter(x=>x.seed===seed).length}));
          // The real transition screen waits for the player's offer choice.
          // Confirm its preselected first offer through the UI, as a player would.
          await page.keyboard.press('Enter');await sleep(100);
          after=await page.evaluate(()=>({snapshot:window.__CPM_CAREER.snapshot(),screen:window.__CPM_CAREER.screen()}));
          c.interventions.push({season:before.season,week:before.week,screen:'proTransition',action:'Enter (first offer)'});
          saveRun();
        }
        inspect(after.snapshot);
        if(after.screen==='careerEnd'){c.status='retired';c.retirementAge=after.snapshot.age;c.seasonStats.push(seasonStats(after.snapshot));break;}
        if(['nationalCallup','proTransition','clubPresentation'].includes(after.screen)){screenStall=after.screen===lastScreen?screenStall+1:1;if(screenStall>3){await page.evaluate(()=>window.__CPM_CAREER.goScreen('dashboard'));c.interventions.push({season:after.snapshot.season,week:after.snapshot.week,screen:after.screen});issue(c,after.snapshot,'harness-intervention',`goScreen dashboard from ${after.screen}`,'media');screenStall=0;}}
        else screenStall=0;lastScreen=after.screen;
        const key=`${after.snapshot.season}|${after.snapshot.week}`;same=key===lastKey?same+1:0;lastKey=key;
        if(same>8){issue(c,after.snapshot,'stuck',`season/week unchanged for ${same} steps; last step=${step.r}; screen=${after.screen}`,'alta');c.status='blocked';break;}
        if(c.matrix.style!=='prudente'&&[5,20].includes(after.snapshot.week)){
          const offerKey=`${after.snapshot.season}|${after.snapshot.week}`;if(!offerWeeks.has(offerKey)){
            offerWeeks.add(offerKey);const forced=await page.evaluate(()=>window.__CPM_CAREER.forceOffer());await sleep(90);
            if(forced===true){const modal=await page.evaluate(()=>document.querySelector('[data-cpm="offerta23"]')?.innerText||'');const offered=offerClub(modal,catalog.clubs,after.snapshot.club?.id);
              const accept=offered&&(c.matrix.style==='casuale'?hash(`${seed}|${after.snapshot.season}|${after.snapshot.week}`)%2===0:offered.p>(after.snapshot.club?.p||0));
              if(!offered)issue(c,after.snapshot,'offer-unreadable',`forceOffer=true, club not identified in modal`,'media');
              if(accept)await page.evaluate(()=>window.__CPM_CAREER.acceptOffer());else await page.evaluate(()=>window.__CPM_CAREER.dismiss());await sleep(90);
            }else if(typeof forced==='string'&&forced.startsWith('error:'))issue(c,after.snapshot,'force-offer',forced,'media');
          }
        }
      }
      if(c.status==='running')c.status=c.seasonsDone>=target?'target-reached':Date.now()-started>=DEADLINE_MS?'time-limit':'step-limit';
      if(injStart)c.injuries.push({...injStart,ongoing:true});
      for(const [k,n] of Object.entries(c.messages))if(n>3)issue(c,prev,'message-repeat',`${n}× ${k}`,'bassa');
      c.finalSnapshot=prev?{season:prev.season,week:prev.week,age:prev.age,ovr:prev.ovr,club:prev.club?.id,goals:prev.goals??null,matches:prev.matches??null}:null;
    }catch(e){fail(`node tests/codex/career-followup.mjs seed=${seed}`,e?.stack||e,seed);c.status='command-failed';}
    c.durationMs=Date.now()-t0;console.log('CAREER',JSON.stringify({seed,status:c.status,seasons:c.seasonsDone,steps:c.steps,ms:c.durationMs,issues:run.anomalies.filter(x=>x.seed===seed).length}));saveRun();
  }
}catch(e){fail('node tests/codex/career-followup.mjs',e?.stack||e);}finally{
  if(browser)await Promise.race([browser.close().catch(()=>{}),sleep(8000)]);
  if(srv)srv.close();saveRun();
  console.log('DONE',JSON.stringify({version:run.version,commit:run.commit,careers:run.careers.length,seasons:run.careers.reduce((n,c)=>n+c.seasonsDone,0),anomalies:run.anomalies.length,failures:run.failures.length,durationMs:run.durationMs,out:OUT}));
  process.exit(run.failures.length?1:0);
}
