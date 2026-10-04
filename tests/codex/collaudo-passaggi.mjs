#!/usr/bin/env node
// Collaudo esterno PO-147/PO-094. Eseguire dalla radice del repository.
// CPM_SCENES=38 CPM_MAX_CASES=1 restringono un lotto senza cambiare il campione previsto.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/07-versione-save-interviste.jsx'), 'utf8');
const version = source.match(/const GAME_VERSION="([^"]+)"/)?.[1] ?? null;
const commit = execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim();
const defaultScenes = [25,27,38,61,120,121,152,174,179,180,176,64,99];
const scenes = (process.env.CPM_SCENES || defaultScenes.join(',')).split(',').map(Number).filter(Number.isInteger);
const maxCases = Math.max(1, Number(process.env.CPM_MAX_CASES || Infinity));
const rawPath = path.join(root, 'tests/codex/collaudo-passaggi-7999122.json.gz');
const photoDir = path.join(root, 'reports/codex/collaudo-passaggi-7999122');
const freeGiB = () => os.freemem() / 2 ** 30;
// Soglia scelta dal PO il 04/10 per consentire i casi GLB sul PC condiviso.
const minFreeGiB = 3;
const actionRx = /pass|dai|triang|filtr|vertical|spond|lanci|cross|uno.?due|rimorch|scaric|servi|tocca|apri|cambia|scambia/i;
if (version !== '7.999.122') throw Error(`GAME_VERSION atteso 7.999.122, trovato ${version}`);
fs.mkdirSync(photoDir, { recursive: true });
const old = fs.existsSync(rawPath) ? JSON.parse(zlib.gunzipSync(fs.readFileSync(rawPath))) : null;
if (old && (old.version !== version || old.commit !== commit)) throw Error(`Checkpoint della build ${old.version}/${old.commit}, build attuale ${version}/${commit}`);
const data = old || { version, commit, command: 'node tests/codex/collaudo-passaggi.mjs', viewport: [412,915], scenes, discovery: [], cases: [], stopped: null };
function save() { const bytes = zlib.gzipSync(Buffer.from(JSON.stringify(data)), { level: 9 });
  for (let i=0;i<30;i++) try { fs.writeFileSync(rawPath, bytes); return; }
  catch(e) { if (!['EBUSY','EACCES','EPERM'].includes(e.code) || i===29) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,100); }
}
function describe(trace) {
  const result = { billiard: [], flipper: [], backwards: false, frozen: [], jumps: [], arrival: null };
  const rows = trace.filter(x => x.phase === 'hl_result' && x.ball && Number.isFinite(x.ball.x) && Number.isFinite(x.ball.z));
  const dist = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
  const angular = (a,b) => Math.acos(Math.max(-1,Math.min(1,(a.x*b.x+a.z*b.z)/(Math.hypot(a.x,a.z)*Math.hypot(b.x,b.z))))) * 180/Math.PI;
  for(let i=1;i<rows.length;i++) {
    const p=rows[i-1], q=rows[i], dt=q.t-p.t, step=dist(p.ball,q.ball);
    if(step>2 && dt>0 && !p.cut && !q.cut) result.jumps.push({t:q.t,dt,step,speed:step/(dt/1000),shortFrame:dt<=70});
    if(i>1){ const a=rows[i-2], v1={x:p.ball.x-a.ball.x,z:p.ball.z-a.ball.z}, v2={x:q.ball.x-p.ball.x,z:q.ball.z-p.ball.z};
      if(Math.hypot(v1.x,v1.z)>0.3 && Math.hypot(v2.x,v2.z)>0.3 && !a.cut && !p.cut && !q.cut){ const deg=angular(v1,v2);
        if(deg>60){const nearest=Math.min(...(q.players||[]).concat(q.hero?[q.hero]:[]).map(v=>dist(v,q.ball)),Infinity);
          if(nearest>1.5) result.billiard.push({t:q.t,deg,nearest,dt});
        }
      }
    }
  }
  for(let i=0;i<result.billiard.length;i++) if(result.billiard.some((x,j)=>i!==j && Math.abs(x.t-result.billiard[i].t)<400)) result.flipper.push(result.billiard[i]);
  for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++) {
    const dt=rows[j].t-rows[i].t;
    if(dt>500 && dist(rows[j].ball,rows[i].ball)<=0.3 && rows.slice(i,j+1).every(x=>dist(x.ball,rows[i].ball)<=0.3)) {
      result.frozen.push({from:rows[i].t,to:rows[j].t,duration:dt}); i=j; break;
    }
  }
  if(rows.length>=2){result.displacementX=rows.at(-1).ball.x-rows[0].ball.x;
    result.arrival=rows.at(-1).ball.heldBy || null;
  }
  return result;
}
if (freeGiB() < minFreeGiB) { data.stopped=`RAM ${freeGiB().toFixed(2)} GiB < ${minFreeGiB} GiB prima del browser`; save(); console.log(data.stopped); process.exit(0); }
const server=await startServer(); const browser=await launchBrowser(); const port=server.address().port;
async function makePage(){ const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'}); const page=await context.newPage();
  context._memoryGuard=setInterval(()=>{if(freeGiB()<minFreeGiB){data.stopped=`RAM scesa a ${freeGiB().toFixed(2)} GiB durante un caso GLB`;context.close().catch(()=>{});}},250);
  await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_PRESENT=1;window.__CPM_CINE=1;window.__CPM_DTREAL=1;window.__CPM_REC=true;window.__CPM_WS38_REC=1;});
  return {context,page}; }
async function discovery(gi){let context;try{({context}=await makePage());const page=context.pages()[0];await openMatch(page,port);
  await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);await sleep(400);
  const row=await page.evaluate(g=>({gi:g,phase:window.__CPM_PHASE?.(),actions:window.__CPM_ACTS?.()??[],scene:window.__CPM_CURSIT?.()}),gi);
  row.selected=row.actions.map((label,i)=>({i,label})).filter(a=>actionRx.test(a.label));return row;
}finally{clearInterval(context?._memoryGuard);await context?.close().catch(()=>{});}}
async function run(gi,act,outcome,repeat){const id=`gi${gi}-a${act.i}-${outcome}-r${repeat}`;const rec={id,gi,action:act,outcome,repeat,valid:false,rejected:null,photos:[],trace:[]};
  if(freeGiB()<minFreeGiB){rec.rejected=`RAM libera ${freeGiB().toFixed(2)} GiB < ${minFreeGiB}`;return rec;}
  let context;try{({context}=await makePage());const page=context.pages()[0];await openMatch(page,port);
    await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);
    await page.waitForFunction(()=>window.__CPM_PHASE?.()==='hl_choose',null,{timeout:20000});
    await page.waitForFunction(()=>window.__CPM_MXCLIP>0,null,{timeout:30000});
    const offered=await page.evaluate(()=>window.__CPM_ACTS?.()??[]);
    if(offered[act.i]!==act.label){rec.rejected=`etichetta azione cambiata: ${JSON.stringify(offered)}`;return rec;}
    const photo=async label=>{const p=path.join(photoDir,`${id}-${label}.png`);const meta=await page.evaluate(()=>({t:performance.now(),phase:window.__CPM_PHASE?.()}));
      await page.screenshot({path:p,timeout:15000});rec.photos.push(path.relative(root,p).replaceAll('\\','/'));(rec.photoMeta??=[]).push({label,...meta});};
    await photo('01-scelta');
    const start=await page.evaluate(([i,ok])=>{const teams=(window.__CPM_STATE?.()?.players||[]).map(p=>p.team);
      window.__CPM_REC_BUF=[];window.__CPM_WS38=[];const first=performance.now();window.__CPM_FORCE_OUTCOME=ok;
      const before=window.__CPM_TIMELINE?.().length??0;const accepted=window.__CPM_RESOLVE(i);
      return {t:first,before,accepted,teams};},[act.i,outcome]);
    rec.resolve=start; const resolvedWall=Date.now();
    for(const [label,ms] of [['02-partenza',200],['03-meta',500],['04-ricezione',850],['05-ritorno',1300]]){
      await page.waitForTimeout(Math.max(0,ms-(Date.now()-resolvedWall))).catch(()=>{});await photo(label);
    }
    await page.waitForTimeout(Math.max(0,Number(process.env.CPM_RESULT_MS||5000)-(Date.now()-resolvedWall)));
    await photo('06-esito');
    const end=await page.evaluate(([b,label])=>({frames:(window.__CPM_REC_BUF||[]).filter(r=>r.t>=b.t-2&&r.ph==='hl_result'),
      watch:(window.__CPM_WATCH_SNAP?.()?.samples||[]).filter(r=>r.t>=b.t-2),writers:window.__CPM_WS38||[],phase:window.__CPM_PHASE?.(),
      timeline:(window.__CPM_TIMELINE?.()||[]).slice(b.before),state:window.__CPM_STATE?.(),
      draft:(()=>{try{const snap=window.__CPM_WATCH_SNAP?.();const keys=(snap?.samples||[]).map(s=>s.sk).filter(k=>Number.isInteger(k)&&k>=0);const sceneKey=keys.length?keys.at(-1):null;
        return sceneKey==null?null:window.__CPM_DRAFTNOTE?.(snap,{sceneKey,intent:window.__CPM_CURSIT?.()?.intent??null,act:label})??null;}catch(e){return `errore: ${e.message}`;}})()}),[start,act.label]);
    const cuts=new Map((end.watch||[]).map(s=>[Math.round(s.t),!!(s.f&16)]));
    rec.trace=(end.frames||[]).map(r=>({t:r.t-start.t,phase:r.ph,cut:cuts.get(Math.round(r.t))??false,
      ball:{x:r.b[0],z:r.b[1],worldY:r.b[2],logicalX:r.b[0]+50,logicalY:r.b[1]/0.68+50},
      hero:{x:r.h[0],z:r.h[1]},players:(r.p||[]).map((p,i)=>({team:start.teams[i]??null,x:p[0],z:p[1]})),sk:r.sk}));
    let bucket=-1;rec.trace50=rec.trace.filter(r=>{const k=Math.floor(r.t/50);if(k===bucket)return false;bucket=k;return true;});
    rec.writers=end.writers;rec.phase=end.phase;rec.timeline=end.timeline;rec.state=end.state;rec.draft=end.draft;
    rec.metrics=describe(rec.trace);rec.metrics.arrival=end.state?.ball?.heldBy??null;
    const ev=end.timeline.filter(x=>x?.type==='ActionResolved');rec.actionResolved=ev.at(-1)||null;
    rec.valid=ev.length===1&&rec.actionResolved.gi===gi&&rec.actionResolved.ok===(outcome==='success')&&rec.photos.length===6;
    if(!rec.valid)rec.rejected=`ActionResolved non concorde o foto ${rec.photos.length}/6`;
    if(/filtr|vertical/i.test(act.label))rec.metrics.backwards=rec.metrics.displacementX<0;
    return rec;
  }catch(e){rec.rejected=String(e?.stack||e);return rec;}
  finally{clearInterval(context?._memoryGuard);await context?.close().catch(()=>{});}}
try{
  outer: for(const gi of scenes){if(!data.discovery.some(x=>x.gi===gi)){if(freeGiB()<minFreeGiB){data.stopped=`RAM ${freeGiB().toFixed(2)} GiB < ${minFreeGiB} GiB`;save();break outer;}
      data.discovery.push(await discovery(gi));save();}
    const row=data.discovery.find(x=>x.gi===gi);
    for(const act of row.selected)for(const outcome of ['success','fail'])for(let repeat=0;repeat<2;repeat++){
      const id=`gi${gi}-a${act.i}-${outcome}-r${repeat}`;
      if(data.cases.some(x=>x.id===id&&x.valid))continue;
      if(data.cases.filter(x=>x.valid).length>=maxCases){data.stopped=`limite ${maxCases} casi validi`;save();break outer;}
      const rec=await run(gi,act,outcome,repeat);data.cases.push(rec);save();console.log(JSON.stringify({id,valid:rec.valid,rejected:rec.rejected}));
      if(rec.rejected?.startsWith('RAM libera')){data.stopped=rec.rejected;save();break outer;}
    }
  }
}finally{await browser.close().catch(()=>{});server.close();save();}
