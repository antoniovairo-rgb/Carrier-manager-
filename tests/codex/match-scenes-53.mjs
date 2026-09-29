#!/usr/bin/env node
// Read-only test harness for walkout frame timings and a cup shootout on 7.999.53.
// From repo root: node tests/codex/match-scenes-53.mjs entry|shootout
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {startServer,installCdnRoutes,sleep} from '../visual/lib/harness.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('../visual/node_modules/playwright');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const MODE=process.argv[2]||'entry';
if(!['entry','shootout'].includes(MODE))throw new Error('entry|shootout required');
const OUTPUT=path.join(ROOT,'tests/codex',process.env.CPM_OUTPUT||(MODE==='entry'?'entry-53.json':'shootout-53.json'));
const shots=path.join(ROOT,'reports/codex/rigori-53');
if(MODE==='shootout')fs.mkdirSync(shots,{recursive:true});
const run={version:'7.999.53',commit:null,mode:MODE,command:`node tests/codex/match-scenes-53.mjs ${MODE}`,startedAt:new Date().toISOString(),launch:null,matches:[],errors:[]};
const save=()=>fs.writeFileSync(OUTPUT,JSON.stringify(run,null,2));
const pct=(xs,p)=>{const a=[...xs].sort((x,y)=>x-y);return a.length?a[Math.min(a.length-1,Math.ceil(a.length*p)-1)]:null;};
const mkSave=(name,type)=>({phase:'career',player:{name,nation:'Italia',avatarId:0,proStatus:'pro',season:4,week:12,weekLived:true,age:24,ovr:82,tutorialDone:true,campDone:true,jerseyNumSeason:4,presidentModalSeason:4,seasonPledge:{season:4,tone:'equilibrato'},drawSeen:4,coachPactSeason:4,bondEv:{s:4,w:11},sponsorDecl:{tier:'tecnico',season:4},matches:8,goals:5,coachTrust:82,
  cup:type==='cup'?{active:true,round:2,eliminated:false,champion:false,results:[{round:1,name:'Sedicesimi',opponent:'FC Rovigo',homeScore:2,awayScore:0,won:true}]}:null,
  calendar:[{matchday:type==='cup'?992:12,week:12,opponentId:'inter',opponentName:'FC Internazionale',opponentData:{id:'inter',n:'FC Internazionale',a:'INT',p:86,c:'#2563eb',c2:'#111827',nat:'🇮🇹',lg:'Lega A'},isHome:true,played:false,result:null,...(type==='league'?{}:{type,competition:type==='cup'?'Coppa Nazionale':'Coppa Europa',...(type==='cup'?{cupRound:2,cupRoundName:'Ottavi'}:{euroPhase:'group'})})}],
  club:{id:'sal',n:'FC Salernum',a:'SAL',p:70,c:'#6c1f2e',c2:'#f5f5f5',nat:'🇮🇹',lg:'Lega B'},
  stats:{'velocità':82,tecnica:81,fisico:80,'mentalità':82,tiro:84,passaggio:81,dribbling:83,posizionamento:82},form:80,fatigue:10,morale:75,contract:{duration:3,wage:12000,expiresAtSeason:7}}});
async function clickButton(page,rx){return page.evaluate(src=>{const r=new RegExp(src,'i');const e=[...document.querySelectorAll('button,a,[role=button]')].find(x=>r.test((x.textContent||'').trim())&&x.getBoundingClientRect().width>0);if(!e)return null;e.click();return(e.textContent||'').trim().slice(0,70);},rx);}
async function boot(browser,port,name,type){
  const page=await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:2});await installCdnRoutes(page);
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
  await page.addInitScript(save=>{localStorage.setItem('cpm-v3',JSON.stringify(save));},mkSave(name,type));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:120000});
  await clickButton(page,'^CONTINUA');
  await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:40000});
  const start=await page.evaluate(()=>window.__CPM_CAREER.playMatch());
  if(start!==true)throw new Error(`playMatch=${start}`);
  for(let i=0;i<18;i++){
    const ph=await page.evaluate(()=>window.__CPM_PHASE?.()||null);
    if(ph==='playing')break;
    const b=await clickButton(page,'Gioca la partita|Formazioni|Entra in campo|Scendi in campo|Salta');
    await sleep(b?350:650);
  }
  await page.waitForFunction(()=>window.__CPM_PHASE?.()==='playing',null,{timeout:40000});
  const renderer=await page.evaluate(()=>{try{const g=document.createElement('canvas').getContext('webgl');const x=g.getExtension('WEBGL_debug_renderer_info');return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER);}catch(e){return String(e);}});
  return{page,errors,renderer};
}
const srv=await startServer();const port=srv.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CPM_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox']});
run.commit=(await import('node:child_process')).execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();run.launch={chrome:process.env.CPM_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox'],viewport:[412,915],deviceScaleFactor:2};save();
try{
  const allCases=MODE==='entry'?[['campionato-1','league'],['campionato-2','league'],['campionato-3','league'],['europeo-1','euro_group'],['europeo-2','euro_group']]:[['coppa-rigori','cup']];
  const start=Number(process.env.CPM_MATCH_START)||0;
  const limit=Number(process.env.CPM_MATCH_LIMIT)||allCases.length;
  const cases=allCases.slice(start,start+limit);
  for(const [name,type] of cases){
    let page=null;const row={name,type,status:'running',renderer:null,errors:[]};run.matches.push(row);save();
    try{
      const b=await boot(browser,port,`QA ${name}`,type);page=b.page;row.renderer=b.renderer;row.errors=b.errors;
      if(MODE==='entry'){
        await page.evaluate(()=>{window.__QA_WALK53={frames:[],seen:false,done:false};const tick=t=>{const w=window.__QA_WALK53;if(!w||w.done)return;const p=window.__CPM_PHASE?.()||null;if(p==='walkout')w.seen=true;if(w.seen)w.frames.push({t,phase:p});if(w.seen&&p==='playing'&&w.frames.length>2){w.done=true;return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);});
        row.forced=await page.evaluate(()=>window.__CPM_FORCE_WALKOUT?.());
        await page.waitForFunction(()=>window.__QA_WALK53?.done,null,{timeout:45000});
        row.frames=await page.evaluate(()=>window.__QA_WALK53.frames);
        const a=row.frames.filter(x=>x.phase==='walkout');const d=[];for(let i=1;i<a.length;i++)d.push(a[i].t-a[i-1].t);
        row.summary={frames:a.length,durationMs:a.length?a.at(-1).t-a[0].t:null,medianMs:pct(d,.5),p95Ms:pct(d,.95),over50:d.filter(x=>x>50).length,worst5:d.map((dt,i)=>({dt,atSeconds:+((a[i+1].t-a[0].t)/1000).toFixed(3)})).sort((x,y)=>y.dt-x.dt).slice(0,5)};
      }else{
        row.forced=await page.evaluate(()=>window.__CPM_SO_FORCE?.());
        await page.waitForFunction(()=>window.__CPM_SO_STATE?.()?.phase==='shootout',null,{timeout:12000});
        row.kicks=[];let seen=-1;
        const deadline=Date.now()+70000;
        while(Date.now()<deadline){
          const so=await page.evaluate(()=>window.__CPM_SO_STATE?.());if(!so||so.done)break;
          if(so.step>=0&&so.step%2===0&&so.step!==seen){
            seen=so.step;const kick=Math.floor(so.step/2),side=kick%2?'A':'H';const rec={kick,side,step:so.step,frames:[]};row.kicks.push(rec);
            const t0=Date.now();for(const [label,target] of [['rincorsa',200],['contatto',900],['arrivo',1400]]){
              await sleep(Math.max(0,t0+target-Date.now()));
              const st=await page.evaluate(()=>({so:window.__CPM_SO_STATE?.(),state:window.__CPM_STATE?.(),text:(document.body.innerText||'').slice(0,800)}));
              const fn=`rigore-${String(kick+1).padStart(2,'0')}-${label}.png`;await page.screenshot({path:path.join(shots,fn)});
              rec.frames.push({label,file:`reports/codex/rigori-53/${fn}`,atMs:Date.now()-t0,so:st.so,hero:st.state?.hero,players:st.state?.players,ball:st.state?.ball,text:st.text});
            }
            save();
          }else await sleep(60);
        }
        row.final=await page.evaluate(()=>window.__CPM_SO_STATE?.());
      }
      row.status='complete';
    }catch(e){row.status='error';row.error=String(e?.stack||e);run.errors.push(`${name}: ${row.error}`);}
    finally{if(page)await page.close().catch(()=>{});save();}
  }
}finally{await browser.close().catch(()=>{});srv.close();save();}
console.log(JSON.stringify({mode:MODE,rows:run.matches.map(x=>({name:x.name,type:x.type,status:x.status,renderer:x.renderer,summary:x.summary,kicks:x.kicks?.length,error:x.error?.slice(0,200)})),errors:run.errors.length,output:OUTPUT},null,2));
process.exit(run.errors.length?1:0);
