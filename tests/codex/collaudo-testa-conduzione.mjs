import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {startServer,launchBrowser,installCdnRoutes,openMatch,sleep} from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'reports/codex/collaudo-testa-conduzione-109');
const raw=path.join(root,'tests/codex/collaudo-testa-conduzione-109.json.gz');
fs.mkdirSync(out,{recursive:true});
const version=fs.readFileSync(path.join(root,'src/07-versione-save-interviste.jsx'),'utf8').match(/const GAME_VERSION="([^"]+)"/)[1];
const expected=process.env.CPM_EXPECT_VERSION||'7.999.112';
if(version!==expected)throw Error(`Versione ${version}, attesa ${expected}`);
const actionIndices=(process.env.CPM_ACTIONS||'0,1,2').split(',').map(Number).filter(Number.isInteger);
const headPlan=[171,6,7,55,64,86,90].flatMap(gi=>actionIndices.flatMap(actionIndex=>['success','fail'].flatMap(outcome=>[0,1,2].map(rep=>({kind:'header',gi,actionIndex,outcome,rep})))));
const carryPlan=[18,19,21,22,47,96,104,112,178].flatMap(gi=>[0,1].flatMap(actionIndex=>['success','fail'].flatMap(outcome=>[0,1,2].map(rep=>({kind:'carry',gi,actionIndex,outcome,rep})))));
const plan=process.env.CPM_KIND==='carry'?carryPlan:process.env.CPM_KIND==='all'?headPlan.concat(carryPlan):headPlan;
const baseCommit='8cef5317';
const arm=process.env.CPM_ARM==='red'?'red':'green';
const data=fs.existsSync(raw)?JSON.parse(zlib.gunzipSync(fs.readFileSync(raw))):{versione:version,baseCommit,comando:'node tests/codex/collaudo-testa-conduzione.mjs',runs:[]};
data.versione=version;data.baseCommit=baseCommit;
const save=()=>{const bytes=zlib.gzipSync(JSON.stringify(data));for(let i=0;i<15;i++){
 try{fs.writeFileSync(raw,bytes);return;}
 catch(e){if(e.code!=='EBUSY'||i===14)throw e;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,200);}
}};
const count=Number(process.env.CPM_BATCH||1);
for(const run of data.runs){
 if(!run.versione)run.versione='7.999.96';
 if(!run.finishedAt&&!run.error){run.error='Interrotto prima del completamento; dati non validi';run.valid=false;run.finishedAt=new Date().toISOString();}
}
save();
if(os.freemem()<3.5*1024**3){console.log('Pausa: RAM libera sotto 3,5 GB');process.exit(0);}
const selectedGi=(process.env.CPM_GI||'').split(',').filter(Boolean).map(Number);
const selectedOutcome=process.env.CPM_OUTCOME||'';
const selectedRep=process.env.CPM_REP==null?null:Number(process.env.CPM_REP);
const pending=plan.filter(c=>
 (!selectedGi.length||selectedGi.includes(c.gi))
 &&(!selectedOutcome||c.outcome===selectedOutcome)
 &&(selectedRep==null||c.rep===selectedRep)
 &&
 !data.runs.some(r=>r.kind===c.kind&&r.gi===c.gi&&r.actionIndex===c.actionIndex&&r.versione===version&&r.skipped)
 &&!data.runs.some(r=>r.kind===c.kind&&r.gi===c.gi&&r.actionIndex===c.actionIndex&&r.outcome===c.outcome&&r.rep===c.rep&&r.arm===arm&&r.versione===version&&r.methodVersion>=3&&r.valid)
).slice(0,count);
const srv=await startServer();const browser=await launchBrowser();
try{
 for(const c of pending){
  if(os.freemem()<3.5*1024**3){console.log('Pausa: RAM libera sotto 3,5 GB');break;}
  const r={...c,arm,versione:version,methodVersion:3,startedAt:new Date().toISOString(),samples:[],frames:[]};data.runs.push(r);save();
  const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(90000);
  let lowMemory=false;const guard=setInterval(()=>{if(os.freemem()<3.5*1024**3){lowMemory=true;context.close().catch(()=>{});}},1000);
  try{
   await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+60000));
   await installCdnRoutes(page);
   await page.addInitScript(red=>{window.__CPM_GLB=true;window.__CPM_PRESENT=1;window.__CPM_CINE=1;window.__CPM_TESTA33_REC=1;window.__CPM_TIRO34_REC=1;window.__CPM_REC=true;window.__CPM_NO_TUFFO109=red?1:0;},arm==='red');
   let boot=true;const pump=(async()=>{while(boot){try{await page.clock.runFor(100);}catch{}await sleep(25);}})();
   try{await openMatch(page,srv.address().port,{skipLoadAll:true,name:`Testa-${c.gi}-${c.outcome}-${c.rep}`});}finally{boot=false;await pump;}
   const catalog=await page.evaluate(gi=>{const s=SITUATIONS[gi];return s?{text:s.text,actions:s.actions.map((a,i)=>({i,label:a.label,hl:deriveHL(s,a)}))}:null;},c.gi);
   r.catalog=catalog;
   const candidates=c.kind==='header'?(catalog?.actions.filter(a=>a.i===c.actionIndex&&a.hl?.type==='header')||[]):
     c.actionIndex===0?[catalog?.actions[0]].filter(Boolean):
     (catalog?.actions.filter(a=>a.i!==0&&/dribbl|conduc|porta palla|scatt|avanz|finta/i.test(a.label))||[]);
   if(!candidates.length){r.skipped=c.kind==='header'?'Nessuna azione di testa nel catalogo':'Nessuna seconda azione di conduzione/dribbling';throw Error(r.skipped);}
   r.action=candidates[0];r.actionCount=candidates.length;
   await page.evaluate(gi=>window.__CPM_FORCE_SIT(gi,false),c.gi);
   await page.clock.runFor(900);
   for(let n=0;n<120&&!(await page.evaluate(()=>window.__CPM_MXCLIP>0));n++){await sleep(500);await page.clock.runFor(16);}
   r.clips=await page.evaluate(()=>window.__CPM_MXCLIP||0);
   if(!r.clips)throw Error('GLB non montati');
   await page.evaluate(()=>document.querySelector('[data-cpm="scegli"]')?.click());await page.clock.runFor(200);
   r.labels=await page.evaluate(()=>window.__CPM_ACTS?.()||[]);
   const resolver=r.labels.indexOf(r.action.label);if(resolver<0)throw Error('Etichetta azione non visibile');
   const before=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   const take=async(tag,ms)=>{const ext=c.kind==='carry'?'jpg':'png';const file=path.join(out,`gi${c.gi}-a${r.action.i}-${c.outcome}-r${c.rep}-${arm}-${tag}.${ext}`);await page.screenshot({path:file,type:c.kind==='carry'?'jpeg':'png',quality:c.kind==='carry'?72:undefined,timeout:20000});r.frames.push({tag,ms,file:path.relative(root,file).replaceAll('\\','/')});};
   await page.evaluate(([i,outcome])=>{window.__CPM_FORCE_OUTCOME=outcome;window.__CPM_RESOLVE(i);},[resolver,c.outcome]);
   const nearShots=[],flightShots=[];
   for(let ms=50;ms<=18000;ms+=50){
    await page.clock.runFor(50);
    const s=await page.evaluate(()=>({phase:window.__CPM_PHASE?.(),ball:window.__CPM_BALL?.(),head:(window.__CPM_TESTA33?.f||[]).at(-1)||null,headCount:window.__CPM_TESTA33?.f?.length||0,ball3:window.__CPM_BALL3?.()||null}));
    r.samples.push({ms,...s});
    if(c.kind==='header'){
     if(ms===50)await take('01-partenza-cross',ms);
     if(ms<=5000&&ms%250===0)flightShots.push({ms,buf:await page.screenshot({timeout:20000})});
     if(s.head&&s.head.d<4&&ms<=6000)nearShots.push({ms,d:s.head.d,buf:await page.screenshot({timeout:20000})});
    }else if(ms===50||ms%300===0)await take(`corsa-${String(ms).padStart(5,'0')}`,ms);
    if(ms>=8000&&await page.getByRole('button',{name:/^Continua$/i}).count()){await take('06-esito',ms);break;}
   }
   r.headFrames=c.kind==='header'?await page.evaluate(()=>window.__CPM_TESTA33?.f||[]):[];
   r.yImpact=c.kind==='header'?await page.evaluate(()=>window.__CPM_Y063||[]):[];
   r.carryFrames=c.kind==='carry'?await page.evaluate(()=>window.__CPM_TIRO34?.f||[]):[];
   r.ballFrames=c.kind==='header'?await page.evaluate(()=>window.__CPM_TIRO34?.f||[]):[];
   if(c.kind==='header'&&r.headFrames.length){
    const gestureFrames=r.headFrames.filter(f=>f.g==='header');
    const headContact=(gestureFrames.length?gestureFrames:r.headFrames).reduce((a,b)=>b.d<a.d?b:a);
    const closestSample=r.samples.reduce((a,b)=>Math.abs((b.head?.t||0)-headContact.t)<Math.abs((a.head?.t||0)-headContact.t)?b:a);
    r.contactWitness={t:headContact.t,d:headContact.d,by:headContact.by,ms:closestSample.ms};
    const choose=(shots,target)=>shots.length?shots.reduce((a,b)=>Math.abs(b.ms-target)<Math.abs(a.ms-target)?b:a):null;
    const selected=[['02-meta-volo',choose(flightShots,closestSample.ms/2)],['03-meno-100ms',choose(nearShots,closestSample.ms-100)],['04-contatto',choose(nearShots,closestSample.ms)],['05-piu-100ms',choose(nearShots,closestSample.ms+100)]];
    for(const [tag,pick] of selected){if(!pick)continue;const file=path.join(out,`gi${c.gi}-a${r.action.i}-${c.outcome}-r${c.rep}-${arm}-${tag}.png`);fs.writeFileSync(file,pick.buf);r.frames.push({tag,ms:pick.ms,file:path.relative(root,file).replaceAll('\\','/')});}
    r.frames.sort((a,b)=>a.tag.localeCompare(b.tag));
    r.photoTimingErrorMs=selected.map(([tag,pick])=>({tag,deltaMs:pick?Math.round(pick.ms-(tag==='02-meta-volo'?closestSample.ms/2:tag==='03-meno-100ms'?closestSample.ms-100:tag==='05-piu-100ms'?closestSample.ms+100:closestSample.ms)):null}));
   }
   r.draft=await page.evaluate(intent=>{const snap=window.__CPM_WATCH_SNAP?.();const sk=snap?.samples?.at(-1)?.sk;return window.__CPM_DRAFTNOTE?.(snap,{sceneKey:sk,intent,act:window.__CPM_ACTS?.()[0]})||null;},c.kind==='header'?'header':'dribble');
   const after=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   r.actionResolved=after.slice(before.length).filter(e=>e.type==='ActionResolved');
   r.outcomeMatched=r.actionResolved.length===1&&r.actionResolved[0].ok===(c.outcome==='success')&&r.actionResolved[0].gi===c.gi;
   r.photosComplete=c.kind==='header'?r.frames.length===6:r.frames.length>=2;
   r.valid=!!(r.outcomeMatched&&r.photosComplete&&(c.kind!=='header'||r.headFrames.length>0));
  }catch(e){r.valid=false;r.error=String(e.stack||e);}
  finally{clearInterval(guard);await context.close().catch(()=>{});r.lowMemory=lowMemory;r.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({gi:r.gi,outcome:r.outcome,rep:r.rep,valid:r.valid,headFrames:r.headFrames?.length||0,photos:r.frames.length,error:r.error,lowMemory}));}
 }
}finally{await browser.close();srv.closeAllConnections?.();srv.close();save();}
