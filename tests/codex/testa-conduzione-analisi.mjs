import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const raw=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'tests/codex/collaudo-testa-conduzione-109.json.gz'))));
const metric=[];
const hypot=(a,b)=>a&&b?Math.hypot(a.x-b.x,a.y-b.y):null;
const distance3=(a,b)=>a?.ball3?.m&&b?.ball3?.m&&a.ball&&b.ball?Math.hypot(a.ball3.m.x-b.ball3.m.x,a.ball3.m.y-b.ball3.m.y,a.ball.worldY-b.ball.worldY):null;
for(const run of raw.runs){
 if(run.versione!==raw.versione||!(run.methodVersion>=2)||!run.valid)continue;
 if(run.kind==='header'){
  const heads=run.headFrames.filter(f=>f.g==='header');
  if(!heads.length){metric.push({kind:'header',arm:run.arm,gi:run.gi,actionIndex:run.actionIndex,rep:run.rep,outcome:run.outcome,valid:true,measurable:false,reason:'gesto header assente'});continue;}
  const contact=heads.reduce((a,b)=>b.d<a.d?b:a);
  const window=heads.filter(f=>f.t>=contact.t-1&&f.t<=contact.t+1.2);
  const peak=window.reduce((a,b)=>b.hy>a.hy?b:a);
  const guardContact=run.headFrames.reduce((a,b)=>b.d<a.d?b:a);
  const guardWindow=run.headFrames.filter(f=>Math.abs(f.t-guardContact.t)<=1&&f.g!=='lift');
  const guardPeak=(guardWindow.length?guardWindow:[guardContact]).reduce((a,b)=>b.hy>a.hy?b:a);
  const samples=run.samples.filter(s=>s.head&&s.ball3?.m);
  const nearest=t=>samples.reduce((a,b)=>Math.abs(b.head.t-t)<Math.abs(a.head.t-t)?b:a);
  const c=nearest(contact.t),before=nearest(contact.t-.2),after=nearest(contact.t+.2);
  let beforeDist=distance3(before,c),afterDist=distance3(c,after);
  let beforeDt=c.head.t-before.head.t,afterDt=after.head.t-c.head.t;
  let speedSource='campioni esterni ogni 50 ms';
  const ballFrames=(run.ballFrames||[]).filter(f=>f.pb?.length===3);
  if(ballFrames.length){
   const nearestBall=t=>ballFrames.reduce((a,b)=>Math.abs(b.t-t)<Math.abs(a.t-t)?b:a);
   const pb=nearestBall(contact.t-.2),pc=nearestBall(contact.t),pa=nearestBall(contact.t+.2);
   beforeDist=Math.hypot(...pb.pb.map((v,i)=>v-pc.pb[i]));
   afterDist=Math.hypot(...pc.pb.map((v,i)=>v-pa.pb[i]));
   beforeDt=pc.t-pb.t;afterDt=pa.t-pc.t;
   speedSource='testimone per fotogramma __CPM_TIRO34.pb';
  }
  const speedBefore=beforeDt>0?beforeDist/beforeDt:null,speedAfter=afterDt>0?afterDist/afterDt:null;
  const steps=[];
  for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i],dt=(b.ms-a.ms)/1000,d=distance3(a,b);
   if(dt>0&&d!=null&&d>2)steps.push({ms:b.ms,d:+d.toFixed(2),dtMs:Math.round(dt*1000),over85:d>85*dt+.5});
  }
  metric.push({kind:'header',arm:run.arm,gi:run.gi,actionIndex:run.actionIndex,action:run.action?.label,outcome:run.outcome,rep:run.rep,valid:true,measurable:true,contact:{t:contact.t,d:contact.d,ballY:contact.by},peak:{t:peak.t,headY:peak.hy},syncMs:Math.round(Math.abs(peak.t-contact.t)*1000),guardContact:{t:guardContact.t,d:guardContact.d,g:guardContact.g},guardPeak:{t:guardPeak.t,headY:guardPeak.hy,g:guardPeak.g},guardSyncMs:Math.round(Math.abs(guardPeak.t-guardContact.t)*1000),speedSource,speedBefore:speedBefore==null?null:+speedBefore.toFixed(2),speedAfter:speedAfter==null?null:+speedAfter.toFixed(2),speedRatio:speedBefore>0?+(speedAfter/speedBefore).toFixed(2):null,stepsOver2:steps.length,stepsOver85:steps.filter(s=>s.over85).length,steps,photos:run.frames,photoTimingErrorMs:run.photoTimingErrorMs||null});
 }else if(run.kind==='carry'){
  const frames=run.carryFrames||[];
  const near=frames.map(f=>Math.min(f.dL??Infinity,f.dR??Infinity)).filter(Number.isFinite);
  const lost=[];let start=null;
  for(let i=0;i<frames.length;i++){
   const d=Math.min(frames[i].dL??Infinity,frames[i].dR??Infinity);
   if(d>2&&start==null)start=i;
   if((d<=2||i===frames.length-1)&&start!=null){const end=d<=2?i-1:i,ms=1000*(frames[end].t-frames[start].t);if(ms>300)lost.push({from:frames[start].t,to:frames[end].t,ms:Math.round(ms)});start=null;}
  }
  let behind=0,behindN=0;
  for(let i=1;i<frames.length;i++){
   const a=frames[i-1],b=frames[i],dx=b.hx-a.hx,dz=b.hz-a.hz;
   if(Math.hypot(dx,dz)<.01||!b.pb)continue;
   behindN++;if((b.pb[0]-b.hx)*dx+(b.pb[2]-b.hz)*dz<0)behind++;
  }
  metric.push({kind:'carry',gi:run.gi,action:run.action?.label,derivedType:run.action?.hl?.type||null,eligible:run.action?.hl?.type==='dribble',outcome:run.outcome,rep:run.rep,valid:true,measurable:!!near.length,samples:near.length,within1_2:near.length?near.filter(d=>d<1.2).length/near.length:null,maxDistance:near.length?Math.max(...near):null,lost,behind,behindN,sl:frames.map(f=>f.sl).filter(Number.isFinite),photos:run.frames});
 }
}
const out=path.join(root,'reports/codex/2026-10-02-testa-conduzione-109-misure.json');
fs.writeFileSync(out,JSON.stringify({versione:raw.versione,baseCommit:raw.baseCommit,comando:'node tests/codex/testa-conduzione-analisi.mjs',misure:metric},null,2));
console.log(JSON.stringify({versione:raw.versione,casi:metric.length,head:metric.filter(x=>x.kind==='header').length,carry:metric.filter(x=>x.kind==='carry').length,output:path.relative(root,out)}));
