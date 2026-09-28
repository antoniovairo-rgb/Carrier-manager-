#!/usr/bin/env node
// Misura read-only dei quattro bracci 7.999.44. Salva dopo ogni scena: interrompibile e riprendibile.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(new URL('../visual/package.json', import.meta.url))('playwright');
const output = path.join(root, process.env.CPM_OUTPUT || 'reports/codex/2026-09-29-conduzione-bracci.json');
const sceneIds = (process.env.CPM_SCENES || '0,16,17,42,46,50,82,83,84,87,91,96,100,102,148,38').split(',').map(Number);
const repetitions = +(process.env.CPM_REPS || 3);
const arms = (process.env.CPM_ARMS || 'A,B,C,D').split(',');
const sceneMs = +(process.env.CPM_SCENE_MS || 6000);
const launch = { executablePath: process.env.CPM_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true, args: ['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox'] };
const cmd = 'node tests/codex/conduzione-bracci.mjs'; // defaults and launch arguments are also recorded below
const data = fs.existsSync(output) && process.env.CPM_FRESH !== '1' ? JSON.parse(fs.readFileSync(output)) :
  { versione: '7.999.44', compito: 'conduzione-bracci', comando: cmd, launch, viewport: [412,915], deviceScaleFactor: 2,
    scenes: sceneIds, repetitions, arms, sceneMs, careerName: 'Bracci44', started: new Date().toISOString(), runs: [], errors: [] };
const armFlags = { A:[0,0], B:[1,0], C:[0,1], D:[1,1] };
const save = () => { fs.mkdirSync(path.dirname(output), {recursive:true}); fs.writeFileSync(output, JSON.stringify(data)); };
const pct = (a,p) => { const s=a.filter(Number.isFinite).sort((x,y)=>x-y); return s.length?s[Math.min(s.length-1,Math.floor(p*(s.length-1)))]:null; };
const rnd = x => Number.isFinite(x)?+x.toFixed(3):null;
function stats(a) { return { n:a.filter(Number.isFinite).length, median:rnd(pct(a,.5)), p95:rnd(pct(a,.95)), max:rnd(Math.max(...a.filter(Number.isFinite))) }; }
function summarize(raw) {
  const unique=[], seen=new Set();
  for(const x of raw.trace) if(!seen.has(x.si)){seen.add(x.si);unique.push(x);}
  const dt=raw.raf.filter(Number.isFinite), fps=1000/pct(dt,.5);
  const carriers=unique.filter(x=>(x.w?.[1]===4||x.w?.[1]===14)&&(x.owner===-2||x.pori===-2));
  const bins={ '0-3':[], '3-6':[], '6-9':[], '9+':[] }, phases={ acceleration:[], braking:[], stable:[] },
    mismatch={ '0-3':[], '3-6':[], '6-9':[], '9+':[] };
  let carrySec=0;
  for(let i=0;i<carriers.length;i++){
    const x=carriers[i], s=x.s, prev=i?carriers[i-1]:null;
    const bin=s.v<3?'0-3':s.v<6?'3-6':s.v<9?'6-9':'9+';
    if(Number.isFinite(s.sl)){
      bins[bin].push(s.sl);
      const dv=prev && x.si===prev.si+1?s.v-prev.s.v:null;
      if(dv!=null)phases[dv>.5?'acceleration':dv<-.5?'braking':'stable'].push(s.sl);
    }
    if(Number.isFinite(s.v)&&Number.isFinite(s.rts)&&Number.isFinite(s.v0))mismatch[bin].push(s.v-s.rts*s.v0);
    if(prev && x.si===prev.si+1)carrySec+=Math.max(0,s.t-prev.s.t);
  }
  const lags=carriers.map(x=>x.s.lag);
  return { valid:Number.isFinite(fps)&&fps>=45, fpsMedian:rnd(fps), rafFrames:dt.length, witnessFrames:unique.length,
    carrierFrames:carriers.length, carrySeconds:rnd(carrySec), hlResultObservedSeconds:rnd(raw.observedMs/1000),
    slBySpeed:Object.fromEntries(Object.entries(bins).map(([k,v])=>[k,stats(v)])),
    slByPhase:Object.fromEntries(Object.entries(phases).map(([k,v])=>[k,stats(v)])),
    speedMinusLegStep:Object.fromEntries(Object.entries(mismatch).map(([k,v])=>[k,stats(v)])),
    lag:stats(lags), lagOver6AtStart:carriers.length?carriers[0].s.lag>6:null,
    errors:raw.errors||[] };
}
const plan=[];
for(let rep=1;rep<=repetitions;rep++)for(const gi of sceneIds)for(let ai=0;ai<arms.length;ai++)
  plan.push({rep,gi,arm:arms[(ai+rep-1)%arms.length]}); // ogni blocco alterna l'ordine A/B/C/D
let browser,server;
try{
  server=await startServer();browser=await chromium.launch(launch);
  const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2});
  for(const item of plan){
    const key=`${item.rep}:${item.gi}:${item.arm}`;
    if(data.runs.some(r=>r.key===key)){continue;}
    let page;
    try{
      page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
      await installCdnRoutes(page);
      await page.addInitScript(([cond,sps])=>{
        window.__CPM_COND44=cond;window.__CPM_SPS44=sps;window.__CPM_CINE=1;window.__CPM_PRESENT=1;
        window.__CPM_TIRO34_REC=1;window.__CPM_WS38_REC=1;
        window.__CPM_ARM_REC={raf:[],trace:[],last:null};
        const tick=t=>{
          const q=window.__CPM_ARM_REC;
          if(window.__CPM_PHASE?.()==='hl_result'){
            if(q.last!=null&&q.raf.length<1200)q.raf.push(t-q.last);
            const s=window.__CPM_TIRO34?.f,w=window.__CPM_WS38;
            if(s?.length&&w?.length&&q.trace.length<1200){const z=w.at(-1),carry=z[1]===4||z[1]===14;
              q.trace.push({si:s.length-1,w:z,s:s.at(-1),owner:carry?window.__CPM_OWN?.()?.i??null:null,
                pori:carry?window.__CPM_WS?.()?.pori??null:null});}
            q.last=t;
          }else q.last=null;
          requestAnimationFrame(tick);
        };requestAnimationFrame(tick);
      },armFlags[item.arm]);
      // Il nome contribuisce al seme della partita: deve restare identico nei quattro bracci.
      await openMatch(page,server.address().port,{skipLoadAll:true,name:'Bracci44'});
      await page.waitForFunction(()=>(window.__CPM_MXCLIP|0)>0&&!!window.__CPM_GESTURE?.()?.glb,null,{timeout:90000});
      const glb=await page.evaluate(()=>({clipCount:window.__CPM_MXCLIP,ready:!!window.__CPM_GLB_READY,override:window.__CPM_GLB??null}));
      await page.evaluate(gi=>{window.__CPM_TIRO34=null;window.__CPM_WS38=[];window.__CPM_ARM_REC={raf:[],trace:[],last:null};window.__CPM_FORCE_SIT(gi,true);window.__CPM_FROZEN=false;},item.gi);
      await page.waitForFunction(()=>window.__CPM_PHASE?.()==='hl_choose',null,{timeout:20000});
      await page.evaluate(()=>{window.__CPM_FORCE_OUTCOME='success';window.__CPM_RESOLVE(0);});
      await page.waitForFunction(()=>window.__CPM_PHASE?.()==='hl_result',null,{timeout:20000});
      const started=Date.now();await sleep(sceneMs);
      const raw=await page.evaluate(()=>({raf:window.__CPM_ARM_REC?.raf||[],trace:window.__CPM_ARM_REC?.trace||[],
        phase:window.__CPM_PHASE?.(),renderer:(()=>{for(const c of document.querySelectorAll('canvas')){const g=c.getContext('webgl2')||c.getContext('webgl');if(g){const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)}}return null})()}));
      raw.observedMs=Date.now()-started;raw.errors=errors;
      const summary=summarize(raw);
      data.runs.push({...item,key,glb,renderer:raw.renderer,phaseAtEnd:raw.phase,...summary});
      console.log(`${key} fps=${summary.fpsMedian} valid=${summary.valid} carry=${summary.carrySeconds} sl3-6=${summary.slBySpeed['3-6'].median}`);
    }catch(e){data.runs.push({...item,key,valid:false,failure:String(e.stack||e)});console.error(`${key} FAIL ${String(e.message||e)}`);}
    finally{await page?.close().catch(()=>{});save();}
  }
  await context.close();
}catch(e){data.errors.push(String(e.stack||e));process.exitCode=1;console.error(e);}
finally{await browser?.close().catch(()=>{});server?.close();data.finished=new Date().toISOString();save();}
