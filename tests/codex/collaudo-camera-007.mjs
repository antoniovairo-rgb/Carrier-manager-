#!/usr/bin/env node
// PO-144: campiona i passi camera su Chrome/D3D11. Ogni caso usa un contesto nuovo.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {chromium} from '../visual/node_modules/playwright/index.mjs';
import {startServer,installCdnRoutes,openMatch,sleep} from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'tests/codex/collaudo-camera-007.json.gz');
const html=fs.readFileSync(path.join(root,'CARRIER-MANAGER-AV.html'),'utf8');
const version=(html.match(/GAME_VERSION="([0-9.]+)"/)||[])[1];
if(!version||Number(version.split('.').at(-1))<93)throw Error(`Versione insufficiente: ${version}`);
const {execFileSync}=await import('node:child_process');
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const scenes=[171,126,2,24,33,38,64,90,134,152];
const plan=scenes.flatMap(gi=>['success','fail'].flatMap(outcome=>[1,2,3].map(rep=>({gi,outcome,rep,id:`${gi}:${outcome}:${rep}`}))));
const data=fs.existsSync(out)?JSON.parse(zlib.gunzipSync(fs.readFileSync(out))):{version,commit,command:'node tests/codex/collaudo-camera-007.mjs',environment:{viewport:[412,915],deviceScaleFactor:2,headless:true,args:['--headless=new','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'],serviceWorkers:'block'},cases:[],errors:[]};
if(data.version!==version||data.commit!==commit)throw Error('Checkpoint di un commit diverso');
const save=()=>fs.writeFileSync(out,zlib.gzipSync(JSON.stringify(data)));
const selected=new Set((process.env.CPM_CASES||'').split(',').filter(Boolean));
const batch=Number(process.env.CPM_BATCH||60);
const headless=process.env.CPM_HEADED!=='1';
const deviceScaleFactor=Number(process.env.CPM_DSF||2);
const pending=plan.filter(p=>(!selected.size||selected.has(p.id))&&!data.cases.some(c=>c.id===p.id&&(c.headless??true)===headless&&(c.deviceScaleFactor??2)===deviceScaleFactor)).slice(0,batch);
const chrome=process.env.CPM_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const server=await startServer();let browser;
try{
  browser=await chromium.launch({headless,executablePath:chrome,args:headless?data.environment.args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
  for(const item of pending){
    const freeGB=os.freemem()/2**30;
    if(freeGB<2.5){console.log(`STOP memoria ${freeGB.toFixed(2)} GB`);break;}
    const c={...item,startedAt:new Date().toISOString(),freeGB:+freeGB.toFixed(2),headless,deviceScaleFactor,errors:[],cameraSteps:[],rafDt:[],valid:false};
    const tStart=Date.now();let context,page;
    try{
      context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor,serviceWorkers:'block'});
      page=await context.newPage();page.setDefaultTimeout(90000);
      page.on('pageerror',e=>c.errors.push(String(e.message)));
      await installCdnRoutes(page);
      await page.addInitScript(()=>{
        window.__CPM_GLB=true;window.__CPM_PRESENT=1;window.__CPM_CINE=1;window.__CPM_REC=true;window.__CPM_CAMSTEP93ON=1;
        window.__QA_RAF=[];window.__QA_RECORD=false;
        let last=null;
        const tick=t=>{if(window.__QA_RECORD){if(last!=null&&window.__QA_RAF.length<3000)window.__QA_RAF.push(t-last);last=t;}else last=null;requestAnimationFrame(tick);};
        requestAnimationFrame(tick);
      });
      await openMatch(page,server.address().port,{skipLoadAll:true,name:`Camera007-${item.id}`});
      await page.waitForFunction(()=>(window.__CPM_MXCLIP|0)>0,null,{timeout:120000});
      c.renderer=await page.evaluate(()=>{for(const canvas of document.querySelectorAll('canvas')){const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');if(!gl)continue;const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);}return null;});
      await page.evaluate(()=>window.__CPM_AUTOPLAY?.(false));
      c.timelineBefore=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
      c.sceneStart=await page.evaluate(gi=>{window.__CPM_CAMSTEP93=[];window.__QA_RAF=[];window.__QA_RECORD=true;const t=performance.now();window.__CPM_FORCE_SIT(gi,false);return t;},item.gi);
      await sleep(900);
      const choose=page.locator('[data-cpm="scegli"]');
      if(await choose.count())await choose.first().click({timeout:10000});
      await page.waitForFunction(()=>window.__CPM_PHASE?.()==='hl_choose',null,{timeout:30000});
      c.actionLabels=await page.evaluate(()=>window.__CPM_ACTS?.()||[]);
      c.resolveReturn=await page.evaluate(outcome=>{window.__CPM_FORCE_OUTCOME=outcome;return window.__CPM_RESOLVE(0);},item.outcome);
      if(!c.resolveReturn)throw Error('RESOLVE(0) fallito');
      await page.waitForFunction(()=>window.__CPM_PHASE?.()==='hl_result',null,{timeout:30000});
      await sleep(8000);
      c.observed=await page.evaluate((t0)=>{
        window.__QA_RECORD=false;
        const snap=window.__CPM_WATCH_SNAP?.();const sk=snap?.samples?.at(-1)?.sk;
        let draft=null;try{draft=(window.__CPM_DRAFTNOTE||window.draftBugNote)?.(snap,{sceneKey:sk,intent:window.__CPM_CURSIT?.()?.hlType,act:window.__CPM_ACTS?.()?.[0]});}catch(e){draft={error:String(e)}}
        return{steps:(window.__CPM_CAMSTEP93||[]).map(s=>({...s,fromSceneMs:s.t-t0})),raf:(window.__QA_RAF||[]),fps708:window.__CPM_FPS708??null,draft,timeline:window.__CPM_TIMELINE?.()||[],phase:window.__CPM_PHASE?.()};
      },c.sceneStart);
      c.cameraSteps=c.observed.steps.map(s=>({...s,velocity:s.dtr>0?+(s.st*1000/s.dtr).toFixed(1):null}));
      c.rafDt=c.observed.raf;
      const dt=c.rafDt.filter(x=>x>0&&x<1000);
      c.fpsMean=dt.length>0?+(1000*dt.length/dt.reduce((a,b)=>a+b,0)).toFixed(2):null;
      c.fps708=c.observed.fps708;
      c.jumpCandidates=c.cameraSteps.filter(s=>!s.cut&&s.st>=2.5&&s.velocity>=150);
      c.cutFreeSteps=c.cameraSteps.filter(s=>!s.cut).length;
      c.maxCutFreeVelocity=Math.max(0,...c.cameraSteps.filter(s=>!s.cut&&Number.isFinite(s.velocity)).map(s=>s.velocity));
      c.actionResolved=c.observed.timeline.slice(c.timelineBefore.length).filter(e=>e.type==='ActionResolved');
      c.outcomeMatched=c.actionResolved.length===1&&c.actionResolved[0].gi===item.gi&&c.actionResolved[0].ok===(item.outcome==='success');
      c.valid=!!(c.outcomeMatched&&c.fpsMean>=50&&c.renderer&&!/SwiftShader/i.test(c.renderer));
      c.draft=c.observed.draft;
      delete c.observed;delete c.timelineBefore;
    }catch(e){c.error=String(e.stack||e);}
    finally{c.elapsedMs=Date.now()-tStart;await context?.close().catch(()=>{});data.cases.push(c);save();console.log(JSON.stringify({id:c.id,valid:c.valid,fps:c.fpsMean,renderer:c.renderer,steps:c.cameraSteps.length,candidates:c.jumpCandidates?.length||0,error:c.error?.slice(0,140)}));}
  }
}finally{await browser?.close();server.closeAllConnections?.();server.close();save();}
