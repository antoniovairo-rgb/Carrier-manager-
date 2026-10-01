#!/usr/bin/env node
// External career QA. Run from the repository root: node tests/codex/career-matrix.mjs
// Optional pilot: CPM_SEEDS=30 CPM_MAX_SEASONS=1 node tests/codex/career-matrix.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, process.env.CPM_OUTPUT || 'classifica-gol.json');
const ALL_SEEDS = [...Array.from({length:6},(_,i)=>30+i),...Array.from({length:30},(_,i)=>i)];
const SEEDS = process.env.CPM_SEEDS ? process.env.CPM_SEEDS.split(',').map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<36) : ALL_SEEDS;
const MAX_SEASONS = Number(process.env.CPM_MAX_SEASONS)||0;
const DEADLINE_MS = Number(process.env.CPM_TIME_LIMIT_MS)||4*60*60*1000;
const ATTRS = ['velocità','tecnica','fisico','mentalità','tiro','passaggio','dribbling','posizionamento'];
const ARCH = ['bomber','fantasista','velocista','trequartista','leader','centravanti','enfant','tuttocampista'];
const START = ['Primavera','piccolo','medio','vertice'];
const FORCE = ['debole','media','forte'];
const STYLE = ['prudente','ambizioso','casuale'];
const POSITION = ['Difensore','Centrocampista','Attaccante'];
const started = Date.now();
const run = { command:'node tests/codex/classifica-gol.mjs', env:{CPM_SEEDS:process.env.CPM_SEEDS||null,CPM_MAX_SEASONS:MAX_SEASONS||null,CPM_TIME_LIMIT_MS:DEADLINE_MS,CPM_OUTPUT:process.env.CPM_OUTPUT||null}, startedAt:new Date().toISOString(), version:null, commit:null, catalog:null, careers:[], anomalies:[], failures:[], limits:[], durationMs:0 };
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
async function renewIfNeeded(page,c,s,tried){
  if((s.proStatus||'u18')!=='pro'||!(s.contractExpired||(s.contract?.duration??9)<=1)||(s.renewalSeason||0)===s.season)return s;
  const key=String(s.season);if(tried.has(key))return s;tried.add(key);
  const before={season:s.season,week:s.week,contractExpired:!!s.contractExpired,duration:s.contract?.duration??null,expiresAtSeason:s.contract?.expiresAtSeason??null,coachTrust:s.coachTrust??null,squadRole:s.squadRole||null};
  const screen=await page.evaluate(()=>window.__CPM_CAREER.screen());
  if(screen==='clubPresentation'){
    const start=page.getByRole('button',{name:/Inizia la tua storia/i}).first();
    if(await start.isVisible().catch(()=>false)){await start.click({timeout:8000});await sleep(120);c.interventions.push({season:s.season,week:s.week,screen,action:'UI: Inizia la tua storia'});}
  }
  const currentScreen=await page.evaluate(()=>window.__CPM_CAREER.screen());
  if(currentScreen!=='dashboard')await page.evaluate(()=>window.__CPM_CAREER.goScreen('dashboard'));
  await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));
  await sleep(120);
  for(let n=0;n<12;n++){
    const active=await page.evaluate(()=>{
      document.querySelectorAll('[data-cpm-qa-active]').forEach(x=>x.removeAttribute('data-cpm-qa-active'));
      const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Negozia rinnovo'));
      if(!b)return{ready:false,reason:'renew button missing'};
      const modals=[...document.querySelectorAll('div')].filter(x=>{const r=x.getBoundingClientRect(),st=getComputedStyle(x);return r.width>0&&r.height>0&&st.position==='fixed'&&Number.parseInt(st.zIndex,10)>=1000;}).reverse();
      for(const modal of modals){
        const buttons=[...modal.querySelectorAll('button')].filter(x=>{const q=x.getBoundingClientRect();return q.width>0&&q.height>0&&!x.disabled;});
        for(const choice of buttons){
          const q=choice.getBoundingClientRect(),cx=q.x+q.width/2,cy=q.y+q.height/2;
          if(cx<0||cy<0||cx>=innerWidth||cy>=innerHeight)continue;
          const hit=document.elementFromPoint(cx,cy);
          if(hit!==choice&&!choice.contains(hit))continue;
          choice.setAttribute('data-cpm-qa-active','1');
          return{ready:false,choice:true,label:choice.textContent?.trim().slice(0,160),modal:modal.textContent?.trim().slice(0,160)};
        }
      }
      if(modals.length)return{ready:false,hasModal:true,reason:'visible modal without currently clickable button',modal:modals[0].textContent?.slice(0,160)};
      const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      if(hit===b||b.contains(hit))return{ready:true};
      return{ready:false,reason:'renew button obstructed',hit:hit?.textContent?.slice(0,160)};
    });
    if(active.choice){
      await page.locator('[data-cpm-qa-active="1"]').first().click({timeout:8000});await sleep(120);
      c.interventions.push({season:s.season,week:s.week,screen:'active blocking modal',action:'UI: first active choice',label:active.label,modal:active.modal});
      continue;
    }
    if(active.hasModal){if(n===0)c.interventions.push({season:s.season,week:s.week,screen:'active blocking modal',action:'diagnostic',reason:active.reason,modal:active.modal});await sleep(300);continue;}
    if(active.ready)break;
    if(n===0)c.interventions.push({season:s.season,week:s.week,screen:'renewal probe',action:'diagnostic',reason:active.reason,hit:active.hit});
    await sleep(300);
  }
  const renew=page.getByRole('button',{name:/Negozia rinnovo/i}).first();
  if(!await renew.isVisible().catch(()=>false)){
    c.contractActions.push({before,screen,action:'renew-button-not-visible'});
    return await page.evaluate(()=>window.__CPM_CAREER.snapshot());
  }
  try{await renew.click({timeout:4000});}catch(e){
    const blocker=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Negozia rinnovo'));if(!b)return{button:'missing'};const r=b.getBoundingClientRect();return{screen:window.__CPM_CAREER?.screen(),button:{x:r.x,y:r.y,w:r.width,h:r.height},atPoint:document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).slice(0,6).map(x=>({tag:x.tagName,text:x.textContent?.slice(0,100)||'',className:typeof x.className==='string'?x.className.slice(0,100):''})),visibleButtons:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width&&x.getBoundingClientRect().height).slice(-18).map(x=>x.textContent?.trim().slice(0,85))};});
    await page.screenshot({path:path.join(ROOT,'reports/codex/career-renew-blocked-86.png')}).catch(()=>{});
    c.contractActions.push({before,screen,action:'UI renewal blocked',blocker,error:String(e.message).slice(0,160)});
    throw new Error('renew-click-blocked: '+JSON.stringify(blocker));
  }
  await sleep(100);
  const accept=page.getByRole('button',{name:/Accetta l.offerta del club/i}).first();
  if(!await accept.isVisible().catch(()=>false)){
    const text=await page.evaluate(()=>document.body?.innerText?.slice(-500)||'');
    c.contractActions.push({before,screen,action:'club-refused-or-other-modal',text});
    await page.evaluate(()=>window.__CPM_CAREER.dismiss());
    return await page.evaluate(()=>window.__CPM_CAREER.snapshot());
  }
  await accept.click({timeout:8000});await sleep(150);
  const after=await page.evaluate(()=>window.__CPM_CAREER.snapshot());
  c.contractActions.push({before,screen,action:'UI: Negozia rinnovo > Accetta offerta del club',after:{contractExpired:!!after.contractExpired,duration:after.contract?.duration??null,expiresAtSeason:after.contract?.expiresAtSeason??null}});
  return after;
}
const marketValue = s => typeof s.value==='number'?s.value:null;
const avgRating = s => {const a=(s.matchHistory||[]).filter(x=>x&&x.season===s.season&&typeof x.rating==='number');return a.length?+(a.reduce((sum,x)=>sum+x.rating,0)/a.length).toFixed(2):null;};
const seasonStats = s => ({season:s.season,age:s.age,club:s.club?.id||null,league:s.club?.lg||null,position:s.position||null,ovr:s.ovr,goals:s.goals??null,assists:s.assists??null,matches:s.matches??null,rating:avgRating(s),value:marketValue(s),wage:s.contract?.wage??null,contractExpiresAtSeason:s.contract?.expiresAtSeason??null,contractExpired:!!s.contractExpired,squadRole:s.squadRole||null,coachTrust:s.coachTrust??null,injured:!!s.injured,injuryWeeks:s.injuryWeeks??null,nationalCaps:s.nationalCaps??null,diaryLength:(s.diary||[]).length,diarySeasons:[...new Set((s.diary||[]).map(d=>d.season).filter(Number.isFinite))],trophies:s.trophies||[],playerAwards:s.playerAwards||[],primaveraAwards:s.primaveraAwards||[],bank:s.bankBalance??null,calendarN:(s.calendar||[]).length,calendarUnplayed:(s.calendar||[]).filter(x=>!x.played).length});
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
  const position=POSITION[seed%POSITION.length];
  const player={name:`QA Carriera ${seed}`,nation:'Italia',avatarId:0,proStatus:start==='Primavera'?'u18':'pro',season,week:1,age,ovr:base,archetype,position,tutorialDone:true,club,stats,form:70,morale:72,fatigue:10,contract:{duration:3,wage:start==='Primavera'?0:6000,expiresAtSeason:season+3}};
  return {save:{phase:'career',player},matrix:{start,strength,style,archetype,position,roleInjected:true,requestedLeague,actualLeague:club.lg,club:club.n,clubId:club.id,leagueFallback,base}};
};

let srv,browser,page,currentCareer=null;
try {
  const html=fs.readFileSync(path.join(ROOT,'CARRIER-MANAGER-AV.html'),'utf8');
  run.version=(html.match(/GAME_VERSION="([0-9.]+)"/)||[])[1]||null;
  const {execFileSync}=await import('node:child_process');
  run.commit=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
  if(!run.version||Number(run.version.split('.').at(-1))<43)throw new Error(`version gate: ${run.version}`);
  srv=await startServer();browser=await launchBrowser();page=await browser.newPage({viewport:{width:900,height:900}});
  await installCdnRoutes(page);
  page.on('pageerror',e=>{if(currentCareer)currentCareer.pageErrors.push(String(e.message));});
  await page.addInitScript(()=>{
    window.__CPM_GLB=false;window.__CPM_SIM_NAT=1;
    const raw=sessionStorage.getItem('qa-rng-state')||localStorage.getItem('qa-seed');
    if(raw){let x=(Number(raw)>>>0)||1;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};window.__QA_RNG_STATE=()=>x>>>0;}
  });
  const url=`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  await page.goto(url,{waitUntil:'load',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});
  const catalog=await page.evaluate(()=>({clubs:CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg})),u18:U18_CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg}))}));
  catalog.leagues=[...new Set(catalog.clubs.map(c=>c.lg))];
  run.catalog={professionalClubs:catalog.clubs.length,u18Clubs:catalog.u18.length,leagues:catalog.leagues,leagueCounts:Object.fromEntries(catalog.leagues.map(l=>[l,catalog.clubs.filter(c=>c.lg===l).length]))};
  console.log('CATALOG',JSON.stringify(run.catalog));saveRun();

  for(const seed of SEEDS){
    if(Date.now()-started>=DEADLINE_MS){run.limits.push(`${DEADLINE_MS} ms execution ceiling reached`);break;}
    const c={seed,matrix:null,steps:0,seasonsDone:0,seasonStats:[],transfers:[],injuries:[],events:{},messages:{},weeklyObservations:[],contentObservations:[],pageErrors:[],status:'running',durationMs:0,interventions:[],contractActions:[],saveChecks:[],calendarDays:{},trace:[],firstMismatch:null,stopAfter:false};
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
      await page.goto(url,{waitUntil:'load',timeout:90000});
      await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});
      await enterCareer(page);await sleep(150);
      let prev=await page.evaluate(()=>window.__CPM_CAREER.snapshot());
      if(typeof prev!=='object'||!prev)throw new Error('initial snapshot missing');
      const initialSeason=prev.season;let lastKey=`${prev.season}|${prev.week}`,same=0,screenStall=0,lastScreen=null;
      let lastLog=(prev.log||[]).slice(),lastDiary=(prev.diary||[]).slice(),injStart=null;
      const target=MAX_SEASONS||5;
      const offerWeeks=new Set();const renewalTried=new Set();const weekObs=new Map();const seasonTeamN=new Map();const ageBySeason=new Map([[prev.season,prev.age]]);
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
          if(s.season>=2){
            const row={season:s.season,week:s.week,club:s.club,proStatus:s.proStatus,standings:st.map(x=>({...x})),calendar:(s.calendar||[]).map(x=>({...x})),matchHistory:(s.matchHistory||[]).map(x=>({...x})),gf,ga,delta:gf-ga,transferCount:c.transfers.length};
            const i=c.trace.findIndex(x=>x.season===row.season&&x.week===row.week);if(i<0)c.trace.push(row);else c.trace[i]=row;
          }
          if(gf!==ga){issue(c,s,'standings-goals',`GF=${gf}, GA=${ga}`,'alta');if(!c.firstMismatch)c.firstMismatch={season:s.season,week:s.week,gf,ga};}
          if(c.firstMismatch&&s.season===c.firstMismatch.season&&s.week>=c.firstMismatch.week+(seed===17?3:0))c.stopAfter=true;
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
        const impulseIds=Object.keys(s.impulseSeen||{}).filter(id=>(s.impulseSeen[id]||0)>(prev?.impulseSeen?.[id]||0));
        const vitaIds=Object.keys(s.vitaSeen||{}).filter(id=>!(prev?.vitaSeen||{})[id]);
        const momentIds=(s.momentsFired||[]).filter(id=>!(prev?.momentsFired||[]).includes(id));
        const weekKey=`${s.season}|${s.week}`;
        let wo=weekObs.get(weekKey);if(!wo){wo={season:s.season,week:s.week,messages:[],diary:[],impulses:[],vita:[],moments:[]};weekObs.set(weekKey,wo);c.weeklyObservations.push(wo);}
        wo.messages.push(...newest);wo.diary.push(...nd.map(d=>typeof d==='string'?d:(d.headline||d.body||d.id||d.type||JSON.stringify(d))));wo.impulses.push(...impulseIds);wo.vita.push(...vitaIds);wo.moments.push(...momentIds);
        if(newest.length||nd.length){const mh=(s.matchHistory||[]).filter(m=>m.season===s.season).slice(-4);const ctx={proStatus:s.proStatus||null,squadRole:s.squadRole||null,injured:!!s.injured,position:s.position||null,nationalCaps:s.nationalCaps||0,club:s.club?.id||null,recentMatches:mh.map(m=>({week:m.week,goals:m.goals||0,assists:m.assists||0,minutes:m.minutes??null,won:!!m.won,homeScore:m.homeScore,awayScore:m.awayScore}))};for(const text of newest)c.contentObservations.push({season:s.season,week:s.week,kind:'log',text,context:ctx});for(const d of nd)c.contentObservations.push({season:s.season,week:s.week,kind:'diary',text:typeof d==='string'?d:(d.headline||d.body||d.id||JSON.stringify(d)),context:ctx});}
        prev=s;
      };
      inspect(prev);
      while(c.steps<3600&&c.seasonsDone<target&&Date.now()-started<DEADLINE_MS){
        const before=prev;
        const step=await page.evaluate(()=>{const C=window.__CPM_CAREER;const r=C.step();C.dismiss();return{r,screen:C.screen(),snapshot:C.snapshot()};});
        c.steps++;if(typeof step.r==='string'&&step.r.startsWith('error:')){issue(c,before,'step',step.r,'alta');c.status='error';break;}
        if(step.r==='seasonEnd'){
          const end=before;c.seasonStats.push(seasonStats(end));
          const unplayed=(end.calendar||[]).filter(m=>(!m.type||m.type==='league')&&!m.played);
          if(unplayed.length)issue(c,end,'calendar-unplayed',`${unplayed.length} league matches unplayed at season end`,'alta');
          const nat=[end.euroMondiale,end.nationsCupQueue].filter(t=>t?.active&&!t?.done);if(nat.length)issue(c,end,'national-unclosed',`${nat.length} active tournaments at season end`,'alta');
          for(const [k,n] of Object.entries(c.messages))if(k.startsWith(`${end.season}|`)&&n>3)issue(c,end,'message-repeat',`${n}× ${k.slice(k.indexOf('|')+1)}`,'bassa');
          const rollover=await page.evaluate(()=>{const C=window.__CPM_CAREER;const r=C.startNewSeason();C.dismiss();return r;});
          if(rollover!==true){issue(c,end,'rollover',`startNewSeason returned ${String(rollover)}`,'alta');c.status='error';break;}
          await sleep(180);
          const rolloverState=await page.evaluate(()=>({snapshot:window.__CPM_CAREER.snapshot(),screen:window.__CPM_CAREER.screen()}));
          let next=rolloverState.snapshot;inspect(next);c.seasonsDone++;
          if(c.stopAfter){c.status='first-mismatch-captured';saveRun();break;}
          if(process.env.CPM_RENEW_CHECKPOINT==='1'&&next.contractExpired)fs.writeFileSync(path.join(HERE,'career-renew-checkpoint86.json'),JSON.stringify({seed,season:next.season,screen:rolloverState.screen,snapshot:next},null,2));
          console.log('SEASON',JSON.stringify({seed,done:c.seasonsDone,season:end.season,week:end.week,goals:end.goals??null,matches:end.matches??null,ovr:end.ovr,issues:run.anomalies.filter(x=>x.seed===seed).length}));
          if(rolloverState.screen==='careerEnd'){c.status='retired';c.retirementAge=next.age;saveRun();break;}
          next=await renewIfNeeded(page,c,next,renewalTried);
          inspect(next);
          if(c.seasonsDone%2===0&&c.seasonsDone<target){
            await sleep(200);const a=await page.evaluate(()=>{sessionStorage.setItem('qa-rng-state',String(window.__QA_RNG_STATE?.()||1));return window.__CPM_CAREER.snapshot();});
            await page.reload({waitUntil:'load',timeout:90000});
            await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});
            await enterCareer(page);
            await sleep(200);const b=await page.evaluate(()=>window.__CPM_CAREER.snapshot());const sameSave=canonical(a)===canonical(b),differences=sameSave?[]:diffPaths(a,b);c.saveChecks.push({season:b.season,week:b.week,equal:sameSave,differences});if(!sameSave)issue(c,b,'save-restore',`snapshot changed after reload: ${JSON.stringify(differences)}`,'alta');prev=b;lastLog=(b.log||[]).slice();lastDiary=(b.diary||[]).slice();
          }
          saveRun();continue;
        }
        if(typeof step.r==='string'&&step.r.startsWith('blocked:')){issue(c,before,'tournament-block',step.r,'alta');await page.evaluate(()=>window.__CPM_CAREER.clearTournaments());await sleep(80);continue;}
        await sleep(65);
        let after=await page.evaluate(()=>({snapshot:window.__CPM_CAREER.snapshot(),screen:window.__CPM_CAREER.screen()}));
        if(after.screen==='proTransition'){
          // Primavera ends on its offer screen, without a "seasonEnd" return.
          // Record that completed season before making the required UI choice.
          c.seasonStats.push(seasonStats(after.snapshot));
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
        if(c.stopAfter){c.status='first-mismatch-captured';break;}
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
    }catch(e){fail(`node tests/codex/career-matrix.mjs seed=${seed}`,e?.stack||e,seed);c.status='command-failed';}
    c.durationMs=Date.now()-t0;console.log('CAREER',JSON.stringify({seed,status:c.status,seasons:c.seasonsDone,steps:c.steps,ms:c.durationMs,issues:run.anomalies.filter(x=>x.seed===seed).length}));saveRun();
  }
}catch(e){fail('node tests/codex/career-matrix.mjs',e?.stack||e);}finally{
  if(browser)await Promise.race([browser.close().catch(()=>{}),sleep(8000)]);
  if(srv)srv.close();saveRun();
  console.log('DONE',JSON.stringify({version:run.version,commit:run.commit,careers:run.careers.length,seasons:run.careers.reduce((n,c)=>n+c.seasonsDone,0),anomalies:run.anomalies.length,failures:run.failures.length,durationMs:run.durationMs,out:OUT}));
  process.exit(run.failures.length?1:0);
}
