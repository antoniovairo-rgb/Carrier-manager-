#!/usr/bin/env node
// PO-176: compare the real autosave and player snapshot before/after reload.
// Run at repository root. The game and existing tests are read-only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {startServer,launchBrowser,installCdnRoutes,sleep} from '../visual/lib/harness.mjs';

const DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(DIR,'../..');
const OUT=path.join(DIR,process.env.CPM_OUTPUT||'salvataggio-ricarica-7999122.json.gz');
const IMG=path.join(ROOT,'reports/codex/salvataggio-ricarica-7999122');
const SEEDS=(process.env.CPM_SEEDS||'0,1,8,13,17,35').split(',').map(Number);
const CHECKS=['S1W10','S2W1','S3W20','post-cup'];
const VIEWS=['dashboard','calendar','standings','coppe','profile','club','agente'];
const ATTRS=['velocità','tecnica','fisico','mentalità','tiro','passaggio','dribbling','posizionamento'];
const ARCH=['bomber','fantasista','velocista','trequartista','leader','centravanti','enfant','tuttocampista'];
const START=['Primavera','piccolo','medio','vertice'];
const POSITION=['Difensore','Centrocampista','Attaccante'];
const hash=text=>{let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const clone=x=>JSON.parse(JSON.stringify(x));
const sort=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
function diff(a,b,p='',out=[]){
  if(sort(a)===sort(b))return out;
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
    for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p?`${p}.${k}`:k,out);
  }else out.push({path:p,before:a??null,after:b??null});
  return out;
}
const started=Date.now();
const run={versione:null,commit:null,compito:'PO-176 salvataggio e ricarica',comando:'node tests/codex/salvataggio-ricarica.mjs',seme:SEEDS,environment:{chrome:process.env.CPM_CHROME||null,glb:false},startedAt:new Date().toISOString(),careers:[],errors:[],durationMs:0};
function save(){run.durationMs=Date.now()-started;fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,zlib.gzipSync(JSON.stringify(run)));}
function setup(seed,catalog){
  const start=START[Math.floor(seed/9)],archetype=ARCH[seed%8],requestedLeague=catalog.leagues[seed%catalog.leagues.length];
  const tier=c=>start==='piccolo'?c.p<65:start==='medio'?c.p>=65&&c.p<78:c.p>=78;
  let pool=start==='Primavera'?catalog.u18:catalog.clubs.filter(c=>c.lg===requestedLeague&&tier(c));
  if(!pool.length&&start!=='Primavera')pool=catalog.clubs.filter(tier);
  const club=pool[hash(`club|${seed}`)%pool.length],base=[58,70,84][Math.floor(seed%9/3)]+seed%5;
  const season=start==='Primavera'?1:2,age=start==='Primavera'?16:20;
  return{save:{phase:'career',player:{name:`QA Carriera ${seed}`,nation:'Italia',avatarId:0,proStatus:start==='Primavera'?'u18':'pro',season,week:1,age,ovr:base,archetype,position:POSITION[seed%3],tutorialDone:true,club,stats:Object.fromEntries(ATTRS.map(k=>[k,base])),form:70,morale:72,fatigue:10,contract:{duration:3,wage:start==='Primavera'?0:6000,expiresAtSeason:season+3}}},matrix:{start,club:club.n,clubId:club.id,league:club.lg,initialSeason:season}};
}
async function enterCareer(page){
  const deadline=Date.now()+60000;
  while(Date.now()<deadline){
    if(await page.evaluate(()=>!!window.__CPM_CAREER).catch(()=>false))return;
    try{const b=page.getByText(/CONTINUA/i).first();if(await b.isVisible())await b.click({timeout:1500,noWaitAfter:true});}catch{}
    await sleep(500);
  }
  throw new Error('career hook not ready: '+await page.evaluate(()=>document.body?.innerText?.slice(0,500)||''));
}
async function renew(page,c,s,tried){
  if((s.proStatus||'u18')!=='pro'||!(s.contractExpired||(s.contract?.duration??9)<=1)||(s.renewalSeason||0)===s.season||tried.has(s.season))return s;
  tried.add(s.season);await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));await sleep(100);
  const b=page.getByRole('button',{name:/Negozia rinnovo/i}).first();
  if(!await b.isVisible().catch(()=>false)){c.interventions.push({season:s.season,week:s.week,action:'renewal button absent'});return s;}
  try{await b.click({timeout:2500});await sleep(100);const a=page.getByRole('button',{name:/Accetta l.offerta del club/i}).first();if(await a.isVisible()){await a.click({timeout:2500});await sleep(100);c.interventions.push({season:s.season,week:s.week,action:'renewed via UI'});}else await page.evaluate(()=>window.__CPM_CAREER.dismiss());}
  catch(e){c.interventions.push({season:s.season,week:s.week,action:'renew failed',error:String(e.message)});await page.evaluate(()=>window.__CPM_CAREER.dismiss());}
  return await page.evaluate(()=>window.__CPM_CAREER.snapshot());
}
async function readState(page){return await page.evaluate(()=>({save:JSON.parse(localStorage.getItem('cpm-v3')||'null'),snapshot:window.__CPM_CAREER?.snapshot?.(),screen:window.__CPM_CAREER?.screen?.(),thisWeekMd:window.__CPM_CAREER?.thisWeekMd?.(),localStorageRaw:localStorage.getItem('cpm-v3')}));}
async function view(page,seed,key,side,keepImages){
  const out={};
  for(const tab of VIEWS){
    await page.evaluate(t=>window.__CPM_CAREER.goTab(t),tab);await sleep(80);
    const name=`${process.env.CPM_RUN_TAG||''}s${seed}-${key}-${side}-${tab}.png`,file=path.join(IMG,name);
    if(process.env.CPM_MASK_MODAL==='1')await page.evaluate(()=>{
      window.__QA_MASKED=[];
      for(const e of document.querySelectorAll('body *')){const s=getComputedStyle(e);if(s.position==='fixed'&&Number.parseInt(s.zIndex,10)>=100){window.__QA_MASKED.push([e,e.style.visibility]);e.style.visibility='hidden';}}
    });
    if(keepImages)await page.screenshot({path:file,fullPage:false});
    out[tab]={text:await page.evaluate(()=>document.body?.innerText||''),image:keepImages?path.relative(ROOT,file).replaceAll('\\','/'):null,modalMasked:process.env.CPM_MASK_MODAL==='1'};
    if(process.env.CPM_MASK_MODAL==='1')await page.evaluate(()=>{for(const [e,v] of window.__QA_MASKED||[])e.style.visibility=v;window.__QA_MASKED=[];});
  }
  await page.evaluate(()=>window.__CPM_CAREER.goTab('dashboard'));await sleep(80);
  return out;
}
function playing(s){return{playedMd:s?.playedMd||null,weekMatch:(s?.calendar||[]).filter(m=>m.week===s.week).map(m=>({type:m.type||'league',matchday:m.matchday,played:!!m.played,opponentId:m.opponentId})),playedCalendar:(s?.calendar||[]).filter(m=>m.played).length,cupClub:s?.cup?.club||null};}
function checkpointName(s){if(s.season===1&&s.week===10)return'S1W10';if(s.season===2&&s.week===1)return'S2W1';if(s.season===3&&s.week===20)return'S3W20';return null;}

let srv,browser,page;
try{
  const source=fs.readFileSync(path.join(ROOT,'src/07-versione-save-interviste.jsx'),'utf8');run.versione=(source.match(/const GAME_VERSION="([0-9.]+)"/)||[])[1]||null;
  if(run.versione!=='7.999.122')throw Error(`Versione non valida: ${run.versione}`);
  run.commit=execFileSync('git',['-c',`safe.directory=${ROOT.replaceAll('\\','/')}`,'merge-base','HEAD','origin/main'],{cwd:ROOT,encoding:'utf8'}).trim();
  if(os.freemem()<3.5*1024**3){run.errors.push('RAM libera sotto 3,5 GiB prima del browser');save();console.log(run.errors.at(-1));process.exit(0);}
  srv=await startServer();browser=await launchBrowser();
  const url=`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  page=await browser.newPage({viewport:{width:900,height:900}});await installCdnRoutes(page);
  await page.goto(url,{waitUntil:'load',timeout:90000});await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});
  const catalog=await page.evaluate(()=>({clubs:CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg})),u18:U18_CLUBS.map(c=>({id:c.id,n:c.n,a:c.a,p:c.p,c:c.c,c2:c.c2,nat:c.nat,lg:c.lg}))}));catalog.leagues=[...new Set(catalog.clubs.map(c=>c.lg))];
  fs.mkdirSync(IMG,{recursive:true});save();
  for(const seed of SEEDS){
    const c={seed,matrix:null,checkpoints:[],interventions:[],errors:[],steps:0,status:'running',cupMatches:0};run.careers.push(c);
    try{
      const init=setup(seed,catalog);c.matrix=init.matrix;
      await page.close();page=await browser.newPage({viewport:{width:900,height:900}});await installCdnRoutes(page);
      await page.addInitScript(({save,n})=>{
        window.__CPM_GLB=false;window.__CPM_SIM_NAT=1;
        if(!sessionStorage.getItem('qa-initialized')){localStorage.setItem('cpm-v3',JSON.stringify(save));localStorage.setItem('qa-seed',String(n+1));sessionStorage.setItem('qa-rng-state',String(n+1));sessionStorage.setItem('qa-initialized','1');}
        let x=(Number(sessionStorage.getItem('qa-rng-state')||localStorage.getItem('qa-seed'))>>>0)||1;
        Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};window.__QA_RNG_STATE=()=>x>>>0;
      },{save:init.save,n:seed});
      await page.goto(url,{waitUntil:'load',timeout:90000});await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});await enterCareer(page);await sleep(150);
      const done=new Set(),tried=new Set();let same=0,last='';
      if(init.matrix.initialSeason>1)c.checkpoints.push({key:'S1W10',status:'inaccessible: seed begins at season 2'});
      while(c.steps<1500&&done.size<(init.matrix.initialSeason===1?4:3)){
        let state=await readState(page),s=state.snapshot;
        if(!s||typeof s!=='object')throw new Error('snapshot missing');
        if(s.season>4)break;
        const key=checkpointName(s);
        if(key&&!done.has(key)){
          await sleep(250);state=await readState(page);s=state.snapshot;
          const beforeViews=await view(page,seed,key,'before',true);
          const before=await readState(page);
          await page.evaluate(()=>sessionStorage.setItem('qa-rng-state',String(window.__QA_RNG_STATE?.()||1)));
          await page.reload({waitUntil:'load',timeout:90000});await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});await enterCareer(page);await sleep(250);
          const after=await readState(page),afterViews=await view(page,seed,key,'after',true);
          c.checkpoints.push({key,status:'measured',season:s.season,week:s.week,before:{save:before.save,snapshot:before.snapshot,screen:before.screen,thisWeekMd:before.thisWeekMd,playing:playing(before.snapshot),views:beforeViews},after:{save:after.save,snapshot:after.snapshot,screen:after.screen,thisWeekMd:after.thisWeekMd,playing:playing(after.snapshot),views:afterViews},saveDiff:diff(before.save,after.save),snapshotDiff:diff(before.snapshot,after.snapshot)});
          done.add(key);save();console.log('CHECKPOINT',JSON.stringify({seed,key,saveDiff:c.checkpoints.at(-1).saveDiff.length,snapshotDiff:c.checkpoints.at(-1).snapshotDiff.length}));
          if(process.env.CPM_STOP_AT===key)break;
          state=after;s=state.snapshot;
        }
        const step=await page.evaluate(()=>{const C=window.__CPM_CAREER;const before=C.snapshot(),screen=C.screen(),match=C.thisWeekMd();const r=C.step();C.dismiss();return{r,before,screen,match};});c.steps++;
        if(typeof step.r==='string'&&step.r.startsWith('error:'))throw new Error('step '+step.r);
        if(step.r==='seasonEnd'){
          const r=await page.evaluate(()=>{const C=window.__CPM_CAREER;const r=C.startNewSeason();C.dismiss();return r;});if(r!==true)throw new Error('startNewSeason '+r);await sleep(150);
          const next=await page.evaluate(()=>window.__CPM_CAREER.snapshot());await renew(page,c,next,tried);continue;
        }
        if(typeof step.r==='string'&&step.r.startsWith('blocked:')){c.interventions.push({season:s.season,week:s.week,action:'clear blocked tournament',reason:step.r});await page.evaluate(()=>window.__CPM_CAREER.clearTournaments());continue;}
        await sleep(65);
        let afterStep=await readState(page);
        if(afterStep.screen==='proTransition'){
          await page.keyboard.press('Enter');await sleep(120);afterStep=await readState(page);c.interventions.push({season:s.season,week:s.week,action:'Enter first pro offer'});
        }
        if(['nationalCallup','proTransition','clubPresentation'].includes(afterStep.screen)){
          c.interventions.push({season:afterStep.snapshot.season,week:afterStep.snapshot.week,action:'go dashboard from '+afterStep.screen});await page.evaluate(()=>window.__CPM_CAREER.goScreen('dashboard'));
        }
        const current=`${afterStep.snapshot.season}|${afterStep.snapshot.week}`;same=current===last?same+1:0;last=current;if(same>14)throw new Error('stuck at '+current+', step '+step.r+', screen '+afterStep.screen);
        if(step.r==='simulated'&&step.match?.type&&step.match.type!=='league'){
          c.cupMatches++;if(!done.has('post-cup')){
            await sleep(250);const bViews=await view(page,seed,'post-cup','before',true),before=await readState(page);
            await page.evaluate(()=>sessionStorage.setItem('qa-rng-state',String(window.__QA_RNG_STATE?.()||1)));
            await page.reload({waitUntil:'load',timeout:90000});await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:60000});await enterCareer(page);await sleep(250);
            const after=await readState(page),aViews=await view(page,seed,'post-cup','after',true);
            c.checkpoints.push({key:'post-cup',status:'measured',season:before.snapshot.season,week:before.snapshot.week,match:step.match,before:{save:before.save,snapshot:before.snapshot,screen:before.screen,thisWeekMd:before.thisWeekMd,playing:playing(before.snapshot),views:bViews},after:{save:after.save,snapshot:after.snapshot,screen:after.screen,thisWeekMd:after.thisWeekMd,playing:playing(after.snapshot),views:aViews},saveDiff:diff(before.save,after.save),snapshotDiff:diff(before.snapshot,after.snapshot)});
            done.add('post-cup');save();console.log('CHECKPOINT',JSON.stringify({seed,key:'post-cup',saveDiff:c.checkpoints.at(-1).saveDiff.length,snapshotDiff:c.checkpoints.at(-1).snapshotDiff.length}));
          }
        }
      }
      for(const key of CHECKS)if(!c.checkpoints.some(q=>q.key===key))c.checkpoints.push({key,status:'not reached'});
      c.status='finished';
    }catch(e){c.errors.push(String(e.stack||e));c.status='failed';}
    save();console.log('CAREER',JSON.stringify({seed,status:c.status,steps:c.steps,checkpoints:c.checkpoints.map(q=>({key:q.key,status:q.status})),errors:c.errors.length}));
  }
}catch(e){run.errors.push(String(e.stack||e));}finally{
  if(browser)await Promise.race([browser.close().catch(()=>{}),sleep(8000)]);
  if(srv)srv.close();save();
  console.log('DONE',JSON.stringify({versione:run.versione,commit:run.commit,careers:run.careers.length,errors:run.errors.length,durationMs:run.durationMs,out:OUT}));
  process.exit(run.errors.length||run.careers.some(c=>c.status==='failed')?1:0);
}
