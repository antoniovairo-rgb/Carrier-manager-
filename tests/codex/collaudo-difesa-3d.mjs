import "./collaudo-difesa-3d-raw.mjs";
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {PNG}=createRequire(new URL('../visual/package.json',import.meta.url))('pngjs');
import {startServer,launchBrowser,installCdnRoutes,openMatch,sleep} from '../visual/lib/harness.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'reports/codex/collaudo-difesa-3d');fs.mkdirSync(out,{recursive:true});
const cp=path.join(root,'tests/codex/collaudo-difesa-3d.json');
const pause=path.join(root,'tests/codex/collaudo-difesa-3d.pause');
const source=JSON.parse(fs.readFileSync(path.join(root,'tests/codex/collaudo-difesa-3d-plan.json')));
const version=fs.readFileSync(path.join(root,'src/07-versione-save-interviste.jsx'),'utf8').match(/const GAME_VERSION="([^"]+)"/)[1];
if(version!=='7.999.82')throw Error('Versione inattesa '+version);
const plan=source.flatMap(c=>['success','fail'].map(outcome=>({...c,outcome})));
const data=fs.existsSync(cp)?JSON.parse(fs.readFileSync(cp)):{versione:version,compito:'Campione mirato highlight; tempo simulato per immagini, nessuna misura di fluidità',comando:'node tests/codex/collaudo-difesa-3d.mjs',baseCommit:'fa129a41d2e72263ea20fef6bdfdd6a5077cc000',plan,runs:[]};
data.comandoV2='node tests/codex/collaudo-difesa-3d.mjs';
data.comandoLotti='node tests/codex/collaudo-difesa-3d-lotti.mjs';
const save=()=>fs.writeFileSync(cp,JSON.stringify(data,null,2));
try{os.setPriority(0,10);}catch{}
const batch=Number(process.env.CPM_BATCH||1),key=c=>`${c.gi}:${c.ai}:${c.outcome}`;
const requested=(process.env.CPM_CASES||'').split(',').filter(Boolean);
const captureTag=process.env.CPM_CAPTURE_TAG||'';if(!/^[a-z0-9-]*$/.test(captureTag))throw Error('Tag non valido');
const srv=await startServer();let browser;
try{
 browser=await launchBrowser();
 const pending=plan.filter(c=>requested.length?requested.includes(key(c)):!data.runs.some(r=>key(r)===key(c)&&r.wallMs)).slice(0,batch);
 for(const c of pending){
  if(fs.existsSync(pause)||os.freemem()<2.2*1024**3){console.log('Lotto fermato: pausa o RAM iniziale sotto 2,2 GB');break;}
  const start=Date.now(),r={...c,methodVersion:2,captureProtocol:'foot-near-impact-or-arc',captureTag,startedAt:new Date().toISOString(),frames:[],samples:[],review:'non verificato'};
  data.runs.push(r);save();
  const ctx=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(90000);
  let stopped=false;
  const guard=setInterval(()=>{if(fs.existsSync(pause)||os.freemem()<1.5*1024**3){stopped=true;r.stopReason=fs.existsSync(pause)?'pausa richiesta':'RAM sotto 1,5 GB';r.stopFreeGB=os.freemem()/1024**3;ctx.close().catch(()=>{});}},2000);
  try{
   await page.clock.install();
   await page.clock.pauseAt(new Date(Date.now()+60000));
   r.clockSetup='paused-before-navigation';
   await installCdnRoutes(page);
   await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_PRESENT=1;window.__CPM_CINE=1;window.__CPM_REC=true;window.__CPM_TESTA33_REC=1;});
   let booting=true;
   const pump=(async()=>{while(booting&&!stopped){try{await page.clock.runFor(100);}catch(e){if(stopped)break;}await sleep(25);}})();
   try{await openMatch(page,srv.address().port,{skipLoadAll:true,name:'Difesa3D'+c.gi});}
   finally{booting=false;await pump;}
   const gc=await ctx.newCDPSession(page);await gc.send('HeapProfiler.collectGarbage');await gc.detach();r.preSceneGC=true;
   await page.evaluate(()=>window.__CPM_AUTOPLAY?.(false));
   const probe=()=>page.evaluate(()=>({phase:window.__CPM_PHASE?.(),sit:window.__CPM_CURSIT?.(),last:window.__CPM_WATCH_SNAP?.()?.samples?.at(-1),contact:(window.__CPM_CONT53||[]).at(-1),touch:window.__CPM_CGTRADER_KICK_TOUCH||null,outcome:window.__CPM_OUTCOME?{ok:window.__CPM_OUTCOME.ok,outKey:window.__CPM_OUTCOME.outKey,actionLabel:window.__CPM_OUTCOME.actionLabel}:null}));
   const shot=async label=>{
    const base=path.join(out,`gi${c.gi}-a${c.ai}-${c.outcome}-v2${captureTag?'-'+captureTag:''}-${label}.png`);let file=base,before,after;const attempts=[];
    for(let attempt=0;attempt<4;attempt++){
     if(attempt){await page.clock.runFor(32);file=base.replace('.png','-retry'+attempt+'.png');}
     before=await probe();await page.screenshot({path:file,timeout:20000});after=await probe();
     if(label!=='01-apertura')break;
     const p=PNG.sync.read(fs.readFileSync(file));let dark=0,total=0;
     for(let y=160;y<550;y++)for(let x=20;x<390;x++){const i=(y*p.width+x)*4;total++;if(p.data[i]<8&&p.data[i+1]<8&&p.data[i+2]<8)dark++;}
     attempts.push({png:path.relative(root,file).replaceAll('\\','/'),blackFraction:dark/total,before,after});if(dark/total<=0.98)break;
    }
    if(attempts.length){r.openingAttempts=attempts;r.openingUnusable=attempts.at(-1).blackFraction>0.98;}
    r.frames.push({label,png:path.relative(root,file).replaceAll('\\','/'),before,after});save();
   };
   r.catalog=await page.evaluate(gi=>{const s=typeof SITUATIONS==='undefined'?null:SITUATIONS[gi];return s?{text:s.text,type:s.type,actions:s.actions.map((a,i)=>({i,label:a.label,rew:a.rew,fail:a.fail,hl:typeof deriveHL==='function'?deriveHL(s,a):null}))}:null;},c.gi);
   const selected=r.catalog?.actions.find(a=>a.label===c.label);if(!selected){r.skipped='Scena o etichetta attesa assente';throw Error(r.skipped);}
   r.canonicalIndex=selected.i;r.catalogText=r.catalog.text;r.derived=selected.hl;
   await page.evaluate(gi=>window.__CPM_FORCE_SIT(gi,false),c.gi);
   await page.clock.runFor(700);
   const readyStart=Date.now();let clips=0;
   while(!(clips=await page.evaluate(()=>window.__CPM_MXCLIP||0))&&Date.now()-readyStart<120000){await sleep(500);await page.clock.runFor(16);}
   r.modelStatus=await page.evaluate(()=>window.__CPM_HYPER_CASUAL_STATUS);r.clips=clips;r.loadMs=Date.now()-start;if(!clips)throw Error('Clip assenti dopo 120000 ms: polling senza rAF');
   await page.clock.runFor(200);await page.locator('canvas').first().boundingBox();await page.clock.runFor(32);r.openingFlushed=true;await shot('01-apertura');
   await page.evaluate(()=>document.querySelector('[data-cpm="scegli"]')?.click());
   await page.clock.runFor(200);await shot('02-scelta');
   if((await probe()).phase!=='hl_choose')throw Error('hl_choose assente');
   r.actualLabels=await page.evaluate(()=>window.__CPM_ACTS?.()||[]);
   r.resolverIndex=r.actualLabels.findIndex(label=>label===c.label);if(r.resolverIndex<0){r.skipped='Etichetta assente nelle azioni della scena forzata';throw Error(r.skipped);}
   r.visibleButtons=await page.getByRole('button').allTextContents();
   r.visibleActionButtons=await page.locator('[data-cpm="scelte-righe"] button').allTextContents();
   const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
   r.displayAlias=await page.evaluate(([gi,i])=>{const s=SITUATIONS[gi];return typeof intentLabelDedup==='function'?intentLabelDedup(s.actions[i].label,i,s.actions):s.actions[i].label;},[c.gi,r.canonicalIndex]);
   r.visibleActionIndex=r.visibleActionButtons.findIndex(t=>norm(t).includes(norm(r.displayAlias)));
   r.firstVisibleAction=r.visibleActionButtons[0]||null;
   r.timelineBefore=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   await page.evaluate(()=>{window.__CPM_CGTRADER_KICK_TOUCH=null;});
   const ok=await page.evaluate(([ai,outcome])=>{window.__CPM_FORCE_OUTCOME=outcome;return window.__CPM_RESOLVE(ai);},[r.resolverIndex,c.outcome]);
   if(!ok)throw Error('resolve fallito');
   let contact=false,flight=false;
   for(let ms=0;ms<25000;ms+=100){
    if(stopped)throw Error('Memoria/pausa');
    await page.clock.runFor(100);const p=await probe();r.samples.push({ms:ms+100,...p});
    if(ms===300)await shot('03-rincorsa');
    if(((p.touch&&/foot/i.test(p.touch.anchor||'')&&Math.abs(p.touch.arcT)<=0.06)||(p.contact&&p.contact.sk===p.last?.sk))&&!contact){contact=true;r.contactTrigger=p.touch&&/foot/i.test(p.touch.anchor||'')&&Math.abs(p.touch.arcT)<=0.06?'foot-near-impact':'arc-start';r.contactMs=ms+100;await shot('04-contatto');}
    if(contact&&!flight&&ms+100>=r.contactMs+400){flight=true;await shot('05-volo');}
    // Il pulsante può comparire prima della fine del gesto: non troncare la ripresa.
    if(ms>=8000&&await page.getByRole('button',{name:/^Continua$/i}).count()){await shot('06-esito');break;}
   }
   r.header33=await page.evaluate(()=>window.__CPM_TESTA33||null);r.final=await probe();r.timelineAfter=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   r.actionResolved=r.timelineAfter.slice(r.timelineBefore.length).filter(e=>e.type==='ActionResolved');
   r.observedAction=r.actionResolved.at(-1)||null;
   r.outcomeMatched=r.actionResolved.length===1&&r.observedAction.gi===c.gi&&r.observedAction.label===c.label&&r.observedAction.ok===(c.outcome==='success');
   r.draft=await page.evaluate(c=>{const snap=window.__CPM_WATCH_SNAP?.();const sk=snap?.samples?.at(-1)?.sk;return(window.__CPM_DRAFTNOTE||window.draftBugNote)?.(snap,{sceneKey:sk,intent:c.intent,act:c.label});},c);
   r.sixFrames=r.frames.length===6;
   await page.evaluate(()=>{window.__CPM_FORCED_MODE=false;});
   await page.clock.runFor(1000);
   const next=page.getByRole('button',{name:/^Continua$/i});
   if(await next.count())await next.first().evaluate(el=>el.click());
   await page.clock.runFor(1200);
   r.exitPhase=await page.evaluate(()=>window.__CPM_PHASE?.());r.exitSeen=r.exitPhase!=='hl_result';r.valid=!!(r.outcomeMatched&&r.sixFrames&&r.exitSeen&&r.clips&&!r.openingUnusable);
  }catch(e){r.valid=false;r.error=String(e.stack||e);r.diagnostic=await page.evaluate(()=>({phase:window.__CPM_PHASE?.(),clips:window.__CPM_MXCLIP,status:window.__CPM_HYPER_CASUAL_STATUS,glbFail:window.__CPM_GLB_FAIL})).catch(()=>null);}
  finally{clearInterval(guard);await ctx.close().catch(()=>{});r.wallMs=Date.now()-start;save();console.log(JSON.stringify({key:key(c),frames:r.frames.length,valid:r.valid,observed:r.observedAction,error:r.error,wallMs:r.wallMs}));}
  if(stopped)break;
 }
}finally{await browser?.close();srv.closeAllConnections?.();srv.close();save();}
