#!/usr/bin/env node
// Profilo read-only della prima apertura nella build precompilata; richiede `node tools/build-dist.mjs`.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { openMatch, sleep } from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dist=path.join(root,'dist'), output=path.join(root,`reports/codex/2026-09-29-apertura-dist-${process.env.CPM_PROFILE==='1'?'profile':'no-profile'}.json`);
const {chromium}=createRequire(new URL('../visual/package.json',import.meta.url))('playwright');
const launch={executablePath:process.env.CPM_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,
  args:['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox']};
const profileOn=process.env.CPM_PROFILE==='1', waitMs=+(process.env.CPM_ATTESA||15000), nScenes=+(process.env.CPM_SCENES||5);
const command=`$env:CPM_PROFILE='${profileOn?1:0}'; node tests/codex/apertura-dist.mjs`;
const data={versione:'7.999.44',compito:'apertura-dist',comando:command,launch,viewport:[412,915],deviceScaleFactor:2,
  profileOn,waitMs,nScenes,openings:[],phaseChanges:[],errors:[],started:new Date().toISOString()};
function summarizeProfile(profile,perfAtStart,task){const nodes=new Map(profile.nodes.map(n=>[n.id,n]));let t=profile.startTime;
  const self=new Map(),outside=new Map();for(let i=0;i<(profile.samples||[]).length;i++){
    t+=(profile.timeDeltas?.[i]||0);const perfMs=perfAtStart+(t-profile.startTime)/1000;
    if(!task||perfMs<task.start||perfMs>task.start+task.duration)continue;
    const frame=nodes.get(profile.samples[i])?.callFrame;if(!frame)continue;
    const ms=(profile.timeDeltas?.[i]||0)/1000;
    if((frame.url||'').includes('CARRIER-MANAGER-AV.html')){
      const label=`${frame.functionName||'(anonima)'} @dist/index.html:${frame.lineNumber+1}`;
      self.set(label,(self.get(label)||0)+ms);
    }else{const label=frame.functionName||'(anonima)';outside.set(label,(outside.get(label)||0)+ms);}}
  return {topOwn:[...self.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([functionName,ms])=>({functionName,ms:+ms.toFixed(2)})),
    outside:[...outside.entries()].sort((a,b)=>b[1]-a[1]).map(([category,ms])=>({category,ms:+ms.toFixed(2)}))};}
if(process.argv.includes('--reanalyze')){const p=path.join(root,'reports/codex/2026-09-29-apertura-dist-profile.json');
  const d=JSON.parse(fs.readFileSync(p)),profile=JSON.parse(fs.readFileSync(path.join(root,'reports/codex/2026-09-29-apertura-dist.cpuprofile')));
  Object.assign(d.profile,summarizeProfile(profile,d.profile.perfAtStart,d.profile.longestTask));
  d.profile.reanalysisCommand='node tests/codex/apertura-dist.mjs --reanalyze';fs.writeFileSync(p,JSON.stringify(d,null,2));
  console.log(JSON.stringify({topOwn:d.profile.topOwn,outside:d.profile.outside}));process.exit(0);}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.webp':'image/webp'};
let server,browser;
try{
  if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('dist/index.html assente; eseguire node tools/build-dist.mjs');
  server=http.createServer((req,res)=>{let p=decodeURIComponent((req.url||'/').split('?')[0]);if(p==='/'||p==='/CARRIER-MANAGER-AV.html')p='/index.html';
    const fp=path.join(dist,p);if(!fp.startsWith(dist)){res.writeHead(403);res.end();return;}
    fs.readFile(fp,(e,b)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':mime[path.extname(fp).toLowerCase()]||'application/octet-stream'});res.end(b);});});
  await new Promise(r=>server.listen(0,r));browser=await chromium.launch(launch);
  const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2});const page=await context.newPage();
  page.on('pageerror',e=>data.errors.push(String(e.message)));
  await page.addInitScript(()=>{window.__CPM_CINE=1;window.__CPM_PRESENT=1;window.__LT_DIST=[];window.__RAF_DIST=[];window.__PH_DIST=[];
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__LT_DIST.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});}
    catch(e){window.__LT_DIST_ERROR=String(e);}
    let prev=null,prevPhase=null;const tick=t=>{if(prev!=null&&window.__RAF_DIST.length<100000)window.__RAF_DIST.push([t,t-prev]);prev=t;
      const ph=window.__CPM_PHASE?.()||null;if(ph!==prevPhase){window.__PH_DIST.push({t,phase:ph,minute:window.__CPM_CLOCK?.()??null,
        canvases:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height])});prevPhase=ph;}requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  const openNatural=async(name)=>{try{await openMatch(page,server.address().port,{skipLoadAll:true,name});return;}
    catch(e){const diagnostic=await page.evaluate(()=>({url:location.href,title:document.title,body:document.body?.innerText?.slice(0,900),
      phase:window.__CPM_PHASE?.()||null,hooks:{phase:typeof window.__CPM_PHASE,force:typeof window.__CPM_FORCE_SIT,
      state:typeof window.__CPM_STATE,probe:typeof window.__CPM_PROBE,autoplay:typeof window.__CPM_AUTOPLAY},
      buttons:[...document.querySelectorAll('button')].map(x=>x.textContent?.trim()).filter(Boolean).slice(0,25)})).catch(()=>null);
      data.testModeFailure=String(e.stack||e);data.afterTestModeFailure=diagnostic;
      if(diagnostic?.phase==='playing'&&diagnostic?.hooks?.autoplay==='function'){
        data.naturalFallback=true;console.log('Fallback partita naturale: la build non espone STATE/PROBE durante playing');return;}
      throw e;}};
  try{await openNatural('AperturaDist44');}
  catch(e){data.testModeFailure=String(e.stack||e);data.afterTestModeFailure=await page.evaluate(()=>({url:location.href,
    title:document.title,body:document.body?.innerText?.slice(0,900),phase:window.__CPM_PHASE?.()||null,
    hooks:{phase:typeof window.__CPM_PHASE,force:typeof window.__CPM_FORCE_SIT,autoplay:typeof window.__CPM_AUTOPLAY},
    buttons:[...document.querySelectorAll('button')].map(x=>x.textContent?.trim()).filter(Boolean).slice(0,25)})).catch(()=>null);
    throw e;}
  await page.waitForFunction(()=>(window.__CPM_MXCLIP|0)>0&&!!window.__CPM_GLB_READY,null,{timeout:90000});
  let cdp=null,profile=null,perfAtStart=null;
  if(profileOn){cdp=await context.newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});
    await cdp.send('Profiler.start');perfAtStart=await page.evaluate(()=>performance.now());}
  await sleep(waitMs);
  data.glb=await page.evaluate(()=>({clips:window.__CPM_MXCLIP,ready:!!window.__CPM_GLB_READY,override:window.__CPM_GLB??null}));
  data.renderer=await page.evaluate(()=>{for(const c of document.querySelectorAll('canvas')){const g=c.getContext('webgl2')||c.getContext('webgl');if(g){const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)}}return null;});
  await page.evaluate(()=>window.__CPM_AUTOPLAY?.(true,{seed:44,policy:'seeded',tickMs:200}));
  let prev=null,resultAt=null,pageIndex=1,phaseCursor=0;const started=Date.now();
  const capturePage=async()=>{const logs=await page.evaluate(()=>({tasks:window.__LT_DIST||[],raf:window.__RAF_DIST||[],observerError:window.__LT_DIST_ERROR||null}));
    data.observerError=logs.observerError;data.allLongTasks=(data.allLongTasks||[]).concat(logs.tasks.map(x=>({...x,pageIndex})));
    for(const op of data.openings.filter(x=>x.pageIndex===pageIndex)){
      const near=logs.tasks.filter(x=>x.start>op.t-1500&&x.start<op.t+4000),raf=logs.raf.filter(x=>x[0]>op.t-1500&&x[0]<op.t+4000).map(x=>x[1]);
      op.longest=near.length?near.reduce((a,b)=>b.duration>a.duration?b:a):null;op.rafMaxGapMs=raf.length?Math.max(...raf):null;op.rafFrames=raf.length;}
  };
  while(data.openings.length<nScenes&&Date.now()-started<900000){
    const state=await page.evaluate(()=>({phase:window.__CPM_PHASE?.()||null,t:performance.now(),minute:window.__CPM_CLOCK?.()??null,
      canvases:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),phases:window.__PH_DIST||[]})).catch(()=>null);
    const phase=state?.phase;
    if(phase!==prev&&data.phaseChanges.length<100)data.phaseChanges.push({t:state?.t??null,phase});
    if(phase==='ended'||phase==='ceremony'){await capturePage();await openNatural(`AperturaDist44_${data.openings.length}`);pageIndex++;phaseCursor=0;
      await page.evaluate(()=>window.__CPM_AUTOPLAY?.(true,{seed:44+data.openings.length,policy:'seeded',tickMs:200}));prev=null;continue;}
    for(let i=phaseCursor;i<(state?.phases?.length||0)&&data.openings.length<nScenes;i++){const e=state.phases[i],before=state.phases[i-1]?.phase;
      if(e.phase&&/^hl_(intro|move|choose)/.test(e.phase)&&!(before&&/^hl/.test(before))){
        data.openings.push({index:data.openings.length+1,t:e.t,pageIndex,phase:e.phase,minute:e.minute,canvases:e.canvases});console.log(`apertura ${data.openings.length}: ${e.phase}`);
        if(cdp&&!profile){await sleep(4000);profile=(await cdp.send('Profiler.stop')).profile;}}}
    phaseCursor=state?.phases?.length||phaseCursor;
    if(phase==='hl_result'){if(resultAt==null)resultAt=Date.now();if(Date.now()-resultAt>4500)
      await page.getByRole('button',{name:'Continua',exact:true}).last().click({timeout:2000}).catch(()=>{});}else resultAt=null;
    prev=phase;await sleep(100);
  }
  if(cdp&&!profile)profile=(await cdp.send('Profiler.stop')).profile;
  await sleep(500);await capturePage();
  if(profile){const first=data.openings[0],task=first?.longest;data.profile={perfAtStart,longestTask:task,
      note:'Campioni del solo long task più lungo della prima apertura; funzioni di dist/index.html separate dai campioni nativi e non attribuiti',
      ...summarizeProfile(profile,perfAtStart,task)};
    const file=path.join(root,'reports/codex/2026-09-29-apertura-dist.cpuprofile');fs.writeFileSync(file,JSON.stringify(profile));data.profile.file='reports/codex/2026-09-29-apertura-dist.cpuprofile';
  }
  data.elapsedMs=Date.now()-started;console.log(JSON.stringify({glb:data.glb,renderer:data.renderer,openings:data.openings.map(x=>({index:x.index,longest:x.longest})),top10:data.profile?.topOwn,errors:data.errors}));
}catch(e){data.failure=String(e.stack||e);console.error(data.failure);process.exitCode=1;}
finally{await browser?.close().catch(()=>{});server?.close();fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(data,null,2));}
