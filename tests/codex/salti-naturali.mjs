#!/usr/bin/env node
// Cinque partite generate dal motore, nessuna scena forzata. Solo sonda e autoplay test-only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(new URL('../visual/package.json',import.meta.url))('playwright');
const file=path.join(root,'reports/codex/2026-09-29-salti-naturali.json');
const nMatches=+(process.env.CPM_MATCHES||5),maxMatchMs=+(process.env.CPM_MATCH_MS||420000);
const launch={executablePath:process.env.CPM_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,
  args:['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox']};
const command='node tests/codex/salti-naturali.mjs'; // defaults and launch arguments are also recorded below
const data=fs.existsSync(file)&&process.env.CPM_FRESH!=='1'?JSON.parse(fs.readFileSync(file)):
  {versione:'7.999.44',compito:'salti-naturali',comando:command,launch,viewport:[412,915],deviceScaleFactor:2,
    matchesRequested:nMatches,matchTimeoutMs:maxMatchMs,started:new Date().toISOString(),matches:[],errors:[]};
const save=()=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2));};
function classifyJumps(){for(const m of data.matches||[]){for(const s of m.scenes||[])for(const j of s.jumps||[]){
    j.carrierEvidence=j.pori===-2?'portatore renderer eroe':j.pori==null&&j.owner===-2?
      'eroe più vicino; portatore renderer non identificabile':'portatore renderer diverso dall’eroe';
    j.compatible=j.pori===-2||(j.pori==null&&j.owner===-2);j.confirmed=j.pori===-2;}
  m.jumps=(m.scenes||[]).filter(s=>s.valid).flatMap(s=>s.jumps||[]);
  m.compatibleJumps=m.jumps.filter(j=>j.compatible);m.confirmedJumps=m.jumps.filter(j=>j.confirmed);}}
if(process.argv.includes('--reanalyze')){classifyJumps();data.reanalysisCommand='node tests/codex/salti-naturali.mjs --reanalyze';save();
  console.log(JSON.stringify(data.matches.map(m=>({match:m.match,candidates:m.jumps.length,compatible:m.compatibleJumps.length,confirmed:m.confirmedJumps.length}))));process.exit(0);}
const med=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:null;};
function analyze(trace,raf,metadata){
  const seen=new Set(),rows=trace.filter(x=>x.w&&!seen.has(x.wi)&&seen.add(x.wi));
  const jumps=[];
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i],dt=(b.w[0]-a.w[0])/1000;if(!(dt>0))continue;
    const carrying=(b.w[1]===4||b.w[1]===14)&&(b.owner===-2||b.pori===-2);
    if(!carrying)continue;
    const d=Math.hypot(b.w[2]-a.w[2],b.w[3]-a.w[3]),threshold=85*dt+.5;
    if(d>threshold)jumps.push({minute:b.minute,scene:metadata.scene,gi:metadata.gi,sceneText:metadata.text,frame:b.wi,
      secondsFromStart:+((b.w[0]-rows[0].w[0])/1000).toFixed(3),dt:+dt.toFixed(4),distance:+d.toFixed(2),
      threshold:+threshold.toFixed(2),writerBefore:a.w[1],writerAfter:b.w[1],owner:b.owner,pori:b.pori});
  }
  const fps=1000/med(raf),carryFrames=rows.filter(x=>(x.w[1]===4||x.w[1]===14)&&(x.owner===-2||x.pori===-2)).length;
  return {...metadata,fpsMedian:Number.isFinite(fps)?+fps.toFixed(2):null,valid:Number.isFinite(fps)&&fps>=45,
    rafFrames:raf.length,writerFrames:rows.length,heroCarryFrames:carryFrames,jumps};
}
let server,browser;
try{
  server=await startServer();browser=await chromium.launch(launch);
  for(let match=1;match<=nMatches;match++){
    if(data.matches.some(x=>x.match===match&&x.finishedMatch))continue;
    let page,context;const result={match,name:`Naturale44_${match}`,scenes:[],errors:[],started:new Date().toISOString()};
    data.matches=data.matches.filter(x=>x.match!==match);data.matches.push(result);save();
    try{
      context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2});page=await context.newPage();
      page.on('pageerror',e=>result.errors.push(String(e.message)));await installCdnRoutes(page);
      await page.addInitScript(()=>{window.__CPM_CINE=1;window.__CPM_PRESENT=1;window.__CPM_WS38_REC=1;
        window.__CPM_NAT_REC={raf:[],trace:[],last:null};const tick=t=>{const q=window.__CPM_NAT_REC;
          if(window.__CPM_PHASE?.()==='hl_result'){
            if(q.last!=null&&q.raf.length<1200)q.raf.push(t-q.last);
            const w=window.__CPM_WS38;if(w?.length&&q.trace.length<1200){const z=w.at(-1),carry=z[1]===4||z[1]===14;
              q.trace.push({wi:w.length-1,w:z,minute:window.__CPM_CLOCK?.()??null,
                owner:carry?window.__CPM_OWN?.()?.i??null:null,pori:carry?window.__CPM_WS?.()?.pori??null:null});}
            q.last=t;
          }else q.last=null;requestAnimationFrame(tick);};requestAnimationFrame(tick);});
      await openMatch(page,server.address().port,{skipLoadAll:true,name:result.name});
      await page.waitForFunction(()=>(window.__CPM_MXCLIP|0)>0&&!!window.__CPM_GLB_READY,null,{timeout:90000});
      result.glb=await page.evaluate(()=>({clips:window.__CPM_MXCLIP,ready:!!window.__CPM_GLB_READY,override:window.__CPM_GLB??null}));
      result.renderer=await page.evaluate(()=>{for(const c of document.querySelectorAll('canvas')){const g=c.getContext('webgl2')||c.getContext('webgl');if(g){const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)}}return null;});
      await page.evaluate(seed=>window.__CPM_AUTOPLAY(true,{seed,policy:'seeded',tickMs:200}),match*701);
      let prev=null,scene=0,resultAt=null,sceneMeta=null,sceneCaptured=false;const start=Date.now();
      const capture=async(reason)=>{if(sceneCaptured||!sceneMeta)return;
        const raw=await page.evaluate(()=>({trace:window.__CPM_NAT_REC?.trace||[],raf:window.__CPM_NAT_REC?.raf||[]}));
        const summary=analyze(raw.trace,raw.raf,sceneMeta);summary.captureReason=reason;
        result.scenes.push(summary);sceneCaptured=true;
        console.log(`${result.name} scena ${summary.scene}: fps=${summary.fpsMedian} valid=${summary.valid} carry=${summary.heroCarryFrames} jumps=${summary.jumps.length} (${reason})`);
        save();};
      while(Date.now()-start<maxMatchMs){
        const state=await page.evaluate(()=>({phase:window.__CPM_PHASE?.()||null,minute:window.__CPM_CLOCK?.()??null,
          gi:window.__CPM_CURSIT?.()?.gi??null,text:window.__CPM_SITCTX?.()?.text||null})).catch(()=>null);const ph=state?.phase;
        if(ph==='ended'||ph==='ceremony'){await capture('fine partita');result.finishedMatch=true;break;}
        if(prev==='hl_result'&&ph!=='hl_result')await capture('uscita dal risultato');
        if(ph&&/^hl_(intro|move|choose)/.test(ph)&&!(prev&&/^hl/.test(prev))){await capture('apertura scena successiva');scene++;sceneMeta={scene,gi:state.gi,minuteAtOpen:state.minute,text:state.text};sceneCaptured=false;
          await page.evaluate(()=>{window.__CPM_WS38=[];window.__CPM_NAT_REC={raf:[],trace:[],last:null};});console.log(`${result.name} scena ${scene} @${state.minute}`);}
        if(ph==='hl_result'){
          if(resultAt==null)resultAt=Date.now();
          if(!sceneCaptured&&Date.now()-resultAt>5500){
            await capture('risultato dopo 5,5 s');await page.getByRole('button',{name:'Continua',exact:true}).last().click({timeout:2000}).catch(()=>{});
            resultAt=null;
          }
        }else resultAt=null;
        prev=ph;await sleep(100);
      }
      await capture('limite partita');result.elapsedMs=Date.now()-start;result.ended=new Date().toISOString();
      result.validScenes=result.scenes.filter(x=>x.valid).length;classifyJumps();
      console.log(`${result.name} ended=${!!result.finishedMatch} scenes=${result.scenes.length} valid=${result.validScenes} jumps=${result.jumps.length}`);
    }catch(e){result.failure=String(e.stack||e);console.error(result.failure);}
    finally{save();await page?.close().catch(()=>{});await context?.close().catch(()=>{});}
  }
}catch(e){data.errors.push(String(e.stack||e));process.exitCode=1;console.error(e);}
finally{await browser?.close().catch(()=>{});server?.close();classifyJumps();data.finished=new Date().toISOString();save();}
