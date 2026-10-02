import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {startServer,launchBrowser,installCdnRoutes,openMatch,sleep} from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'reports/codex/collaudo-testa-conduzione');
const raw=path.join(root,'tests/codex/collaudo-testa-conduzione.json.gz');
fs.mkdirSync(out,{recursive:true});
const version=fs.readFileSync(path.join(root,'src/07-versione-save-interviste.jsx'),'utf8').match(/const GAME_VERSION="([^"]+)"/)[1];
const expected=process.env.CPM_EXPECT_VERSION||'7.999.103';
if(version!==expected)throw Error(`Versione ${version}, attesa ${expected}`);
const actionIndices=(process.env.CPM_ACTIONS||'0,1,2').split(',').map(Number).filter(Number.isInteger);
const plan=[6,7,39,55,64,86,90,171].flatMap(gi=>actionIndices.flatMap(actionIndex=>['success','fail'].flatMap(outcome=>[0,1,2].map(rep=>({gi,actionIndex,outcome,rep})))));
const data=fs.existsSync(raw)?JSON.parse(zlib.gunzipSync(fs.readFileSync(raw))):{versione:version,baseCommit:'2208f4cb707d42bd25854ab710584e5c8f79f4fa',comando:'node tests/codex/collaudo-testa-conduzione.mjs',runs:[]};
data.versione=version;data.baseCommit='2208f4cb707d42bd25854ab710584e5c8f79f4fa';
const save=()=>fs.writeFileSync(raw,zlib.gzipSync(JSON.stringify(data)));
const count=Number(process.env.CPM_BATCH||1);
for(const run of data.runs){
 if(!run.versione)run.versione='7.999.96';
 if(!run.finishedAt&&!run.error){run.error='Interrotto prima del completamento; dati non validi';run.valid=false;run.finishedAt=new Date().toISOString();}
}
save();
if(os.freemem()<3.5*1024**3){console.log('Pausa: RAM libera sotto 3,5 GB');process.exit(0);}
const pending=plan.filter(c=>!data.runs.some(r=>r.gi===c.gi&&r.actionIndex===c.actionIndex&&r.outcome===c.outcome&&r.rep===c.rep&&r.versione===version&&(r.valid||r.skipped))).slice(0,count);
const srv=await startServer();const browser=await launchBrowser();
try{
 for(const c of pending){
  if(os.freemem()<3.5*1024**3){console.log('Pausa: RAM libera sotto 3,5 GB');break;}
  const r={...c,versione:version,startedAt:new Date().toISOString(),samples:[],frames:[]};data.runs.push(r);save();
  const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(90000);
  let lowMemory=false;const guard=setInterval(()=>{if(os.freemem()<1.8*1024**3){lowMemory=true;context.close().catch(()=>{});}},2000);
  try{
   await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+60000));
   await installCdnRoutes(page);
   await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_PRESENT=1;window.__CPM_CINE=1;window.__CPM_TESTA33_REC=1;window.__CPM_TIRO34_REC=1;window.__CPM_REC=true;});
   let boot=true;const pump=(async()=>{while(boot){try{await page.clock.runFor(100);}catch{}await sleep(25);}})();
   try{await openMatch(page,srv.address().port,{skipLoadAll:true,name:`Testa-${c.gi}-${c.outcome}-${c.rep}`});}finally{boot=false;await pump;}
   const catalog=await page.evaluate(gi=>{const s=SITUATIONS[gi];return s?{text:s.text,actions:s.actions.map((a,i)=>({i,label:a.label,hl:deriveHL(s,a)}))}:null;},c.gi);
   r.catalog=catalog;
   const heads=catalog?.actions.filter(a=>a.hl?.type==='header')||[];
   if(!heads.length){r.skipped='Nessuna azione di testa nel catalogo';throw Error(r.skipped);}
   if(c.actionIndex>=heads.length){r.skipped='Indice azione di testa assente';throw Error(r.skipped);}
   r.action=heads[c.actionIndex];r.actionCount=heads.length;
   await page.evaluate(gi=>window.__CPM_FORCE_SIT(gi,false),c.gi);
   await page.clock.runFor(900);
   for(let n=0;n<120&&!(await page.evaluate(()=>window.__CPM_MXCLIP>0));n++){await sleep(500);await page.clock.runFor(16);}
   r.clips=await page.evaluate(()=>window.__CPM_MXCLIP||0);
   if(!r.clips)throw Error('GLB non montati');
   await page.evaluate(()=>document.querySelector('[data-cpm="scegli"]')?.click());await page.clock.runFor(200);
   r.labels=await page.evaluate(()=>window.__CPM_ACTS?.()||[]);
   const resolver=r.labels.indexOf(r.action.label);if(resolver<0)throw Error('Etichetta azione non visibile');
   const before=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   const take=async(tag,ms)=>{const file=path.join(out,`gi${c.gi}-a${r.action.i}-${c.outcome}-r${c.rep}-${tag}.png`);await page.screenshot({path:file,timeout:20000});r.frames.push({tag,ms,file:path.relative(root,file).replaceAll('\\','/')});};
   await take('01-cross',0);
   await page.evaluate(([i,outcome])=>{window.__CPM_FORCE_OUTCOME=outcome;window.__CPM_RESOLVE(i);},[resolver,c.outcome]);
   let contactCaptured=false;
   for(let ms=50;ms<=18000;ms+=50){
    await page.clock.runFor(50);
    const s=await page.evaluate(()=>({phase:window.__CPM_PHASE?.(),ball:window.__CPM_BALL?.(),head:(window.__CPM_TESTA33?.f||[]).at(-1)||null,headCount:window.__CPM_TESTA33?.f?.length||0,ball3:window.__CPM_BALL3?.()||null}));
    r.samples.push({ms,...s});
    if(ms===500)await take('02-meta-volo',ms);
    if(!contactCaptured&&s.head&&s.head.d<0.8){contactCaptured=true;r.contactPhotoTrigger={ms,d:s.head.d};await take('04-contatto',ms);}
    if(ms===1500)await take('03-prima-contatto-proxy',ms);
    if(contactCaptured&&ms===r.contactPhotoTrigger.ms+100)await take('05-dopo-contatto',ms);
    if(ms>=8000&&await page.getByRole('button',{name:/^Continua$/i}).count()){await take('06-esito',ms);break;}
   }
   r.headFrames=await page.evaluate(()=>window.__CPM_TESTA33?.f||[]);
   r.yImpact=await page.evaluate(()=>window.__CPM_Y063||[]);
   r.draft=await page.evaluate(()=>{const snap=window.__CPM_WATCH_SNAP?.();const sk=snap?.samples?.at(-1)?.sk;return window.__CPM_DRAFTNOTE?.(snap,{sceneKey:sk,intent:'header',act:window.__CPM_ACTS?.()[0]})||null;});
   const after=await page.evaluate(()=>window.__CPM_TIMELINE?.()||[]);
   r.actionResolved=after.slice(before.length).filter(e=>e.type==='ActionResolved');
   r.valid=r.actionResolved.length===1&&r.actionResolved[0].ok===(c.outcome==='success')&&r.actionResolved[0].gi===c.gi;
  }catch(e){r.valid=false;r.error=String(e.stack||e);}
  finally{clearInterval(guard);await context.close().catch(()=>{});r.lowMemory=lowMemory;r.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({gi:r.gi,outcome:r.outcome,rep:r.rep,valid:r.valid,headFrames:r.headFrames?.length||0,photos:r.frames.length,error:r.error,lowMemory}));}
 }
}finally{await browser.close();srv.closeAllConnections?.();srv.close();save();}
