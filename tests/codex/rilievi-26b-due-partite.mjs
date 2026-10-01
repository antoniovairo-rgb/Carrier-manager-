#!/usr/bin/env node
// Rilievo 26-B: due partite nella stessa pagina, con origine-sentinella controllata.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {chromium} from '../visual/node_modules/playwright/index.mjs';
import {startServer,installCdnRoutes,sleep} from '../visual/lib/harness.mjs';
const root=process.cwd(),output=path.join(root,'tests/codex/rilievi-26b-due-partite.json');
const fixture=fs.readFileSync(path.join(root,'tests/codex/rilievi-precompiled.html'),'utf8');
const save={phase:'career',player:{name:'Due Partite Probe',nation:'Italia',avatarId:0,proStatus:'pro',season:4,week:6,age:26,ovr:78,tutorialDone:true,campDone:true,jerseyNumSeason:4,presidentModalSeason:4,drawSeen:4,coachPactSeason:4,seasonPledge:{season:4,tone:'equilibrato'},squadRole:'titolare',coachTrust:74,teamChemistry:64,club:{id:'cel',n:'FC Celeste',a:'CEL',p:70,c:'#93c5fd',c2:'#ffffff',nat:'🇪🇸',lg:'Liga Ibérica'},stats:{'velocità':78,tecnica:78,fisico:75,'mentalità':77,tiro:80,passaggio:76,dribbling:79,posizionamento:78},form:82,morale:80,fatigue:30,popularity:52,totalMatches:130,totalGoals:55,matchHistory:[],contract:{duration:3,wage:14000,expiresAtSeason:8}}};
const server=await startServer(),port=server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CPM_CHROME,args:['--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--renderer-process-limit=1','--disable-extensions','--disable-background-networking','--no-sandbox']});
let memoryAbort=false;const guard=setInterval(()=>{if(!memoryAbort&&os.freemem()<1.5*2**30){memoryAbort=true;browser.close().catch(()=>{});}},250);
const rows=[],errors=[];const t0=Date.now();
try{
 const context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:1,serviceWorkers:'block'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e.message)));
 await installCdnRoutes(page);await page.route('**/CARRIER-MANAGER-AV.html?*',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:fixture}));
 await page.addInitScript(s=>{window.__CPM_GLB=false;window.__CPM_REC=true;localStorage.setItem('cpm-v3',JSON.stringify(s));localStorage.setItem('cpm-intro-seen','1');localStorage.setItem('cpm-match-speed','2');},save);
 await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:60000});
 try{await page.getByText('Continua',{exact:false}).first().click({timeout:4000});}catch{}
 await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:12000}).catch(async e=>{rows.push({label:'boot-diagnostic',data:await page.evaluate(()=>({url:location.href,body:document.body?.innerText?.slice(0,1200),root:document.getElementById('root')?.children?.length,test:typeof _CPM_TEST,career:typeof window.__CPM_CAREER,save:localStorage.getItem('cpm-v3')?.slice(0,150)}))});throw e;});
 const snap=async label=>rows.push(await page.evaluate(label=>({label,phase:window.__CPM_PHASE?.()??null,screen:window.__CPM_CAREER?.screen?.()??null,origin:typeof _ORIG26==='undefined'?null:{active:_ORIG26?.active??null,hl:_ORIG26?.hl??null,kind:_ORIG26?.kind??null,min:_ORIG26?.min??null},week:window.__CPM_CAREER?.get?.()?.week??null}),label));
 await snap('career-ready');
 let first=null;
 for(let i=0;i<16;i++){first=await page.evaluate(()=>{const C=window.__CPM_CAREER;C.dismiss();const p=C.playMatch();return p===true?'match':`${p}/${C.step()}`;});if(first==='match')break;await sleep(700);}
 rows.push({label:'first-start',result:first});
 if(first!=='match')throw Error('Prima partita non raggiunta');
 await page.waitForFunction(()=>typeof window.__CPM_AUTOPLAY==='function',null,{timeout:30000});
 await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:2602,policy:'seeded',tickMs:300}));
 await page.waitForFunction(()=>typeof window.__CPM_SO_FORCE==='function'&&['playing','hl_intro','hl_move','hl_choose','hl_result'].includes(window.__CPM_PHASE?.()),null,{timeout:90000});
 await snap('first-live');
 await page.evaluate(()=>{_ORIG26={sit:SITUATIONS[0],kind:'cross',x:80,y:25,hl:999,min:33,active:true};});
 await snap('sentinel-set');
 const forced=await page.evaluate(()=>window.__CPM_SO_FORCE(90));rows.push({label:'forced-end',result:forced});
 await page.waitForFunction(()=>window.__CPM_PHASE?.()==='ended',null,{timeout:30000});await snap('first-ended');
 await page.getByText('Torna alla dashboard',{exact:false}).first().click({timeout:8000});
 await page.waitForFunction(()=>window.__CPM_CAREER?.screen?.()==='dashboard',null,{timeout:30000});await snap('dashboard');
 let second=null;
 for(let i=0;i<20;i++){second=await page.evaluate(()=>{const C=window.__CPM_CAREER;C.dismiss();const p=C.playMatch();return p===true?'match':`${p}/${C.step()}`;});if(second==='match')break;await sleep(700);}
 rows.push({label:'second-start',result:second});await snap('second-mounted');
 if(second==='match'){await page.waitForFunction(()=>typeof window.__CPM_AUTOPLAY==='function',null,{timeout:30000});await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:2603,policy:'seeded',tickMs:300}));await page.waitForFunction(()=>window.__CPM_PHASE?.()==='playing',null,{timeout:90000}).catch(()=>{});await snap('second-playing');const hit=await page.waitForFunction(()=>/^(hl_|ended|ceremony)/.test(window.__CPM_PHASE?.()||''),null,{timeout:90000}).then(()=>true).catch(()=>false);rows.push({label:'second-first-scene-found',result:hit});if(hit)await snap('second-first-scene');}
 await context.close().catch(()=>{});
}catch(e){rows.push({label:'error',error:String(e.stack||e)});}finally{clearInterval(guard);await browser.close().catch(()=>{});server.close();}
const data={version:'7.999.96',commit:'ccabb486d7bc957edc8d7a39ef45d2c51bb80d32',command:'CPM_CHROME=<chrome> node tests/codex/rilievi-26b-due-partite.mjs',settings:{samePage:true,fixture:'rilievi-precompiled.html',glb:false,sentinel:{kind:'cross',hl:999,active:true}},rows,errors,memoryAbort,durationMs:Date.now()-t0};fs.writeFileSync(output,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({output,rows:rows.map(x=>({label:x.label,phase:x.phase,screen:x.screen,origin:x.origin,result:x.result,error:x.error?.split('\n')[0]})),errors:errors.length,memoryAbort,durationMs:data.durationMs}));
