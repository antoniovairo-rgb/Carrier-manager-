#!/usr/bin/env node
// Reduce the reproducible 191-scene scan to a reviewable, frame-level JSON.
// No game files are read or changed beyond the existing scan outputs.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const report = path.join(root, 'reports/codex');
const n = x => Number.isFinite(x) ? +x.toFixed(2) : null;
const scanPath = path.join(report, '2026-09-28-fluidita-3d-scan.json');
const scan = JSON.parse(fs.existsSync(scanPath)
  ? fs.readFileSync(scanPath, 'utf8')
  : zlib.gunzipSync(fs.readFileSync(scanPath + '.gz')).toString('utf8'));
const retry = JSON.parse(fs.readFileSync(path.join(report, '2026-09-28-fluidita-3d-pilot-headless-d3d11.json'), 'utf8'));
const video = JSON.parse(fs.readFileSync(path.join(report, 'video-fluidita-3d/manifest.json'), 'utf8'));
const isolatedVideo = JSON.parse(fs.readFileSync(path.join(report, 'video-fluidita-3d/manifest-prova-headed-87.json'), 'utf8'));
const openingPath = path.join(report, '2026-09-28-apertura-gpu.json');
const opening = fs.existsSync(openingPath) ? JSON.parse(fs.readFileSync(openingPath, 'utf8')) : null;
const openingPurePath = path.join(report, '2026-09-28-apertura-gpu-no-profiler.json');
const openingPure = fs.existsSync(openingPurePath) ? JSON.parse(fs.readFileSync(openingPurePath, 'utf8')) : null;
const cpuPath = path.join(report, '2026-09-28-apertura-gpu.cpuprofile');
let profileFunctions = null;
if (fs.existsSync(cpuPath)) {
  const p = JSON.parse(fs.readFileSync(cpuPath, 'utf8'));
  const nodes = new Map(p.nodes.map(x=>[x.id,x])); const byName = new Map();
  for (let i=0;i<(p.samples||[]).length;i++) {
    const f=nodes.get(p.samples[i])?.callFrame; if(!f)continue;
    const name=f.functionName||'(anonima)';
    if(['(idle)','(program)','(garbage collector)','(root)'].includes(name))continue;
    const label=name+' @'+(f.url||'').split('/').at(-1).split('?')[0]+':'+(f.lineNumber+1);
    byName.set(label,(byName.get(label)||0)+(p.timeDeltas[i]||0));
  }
  profileFunctions=[...byName.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,us])=>({name,ownMs:n(us/1000)}));
}
const q = (a, p) => { const s = a.filter(Number.isFinite).sort((x,y)=>x-y); return s.length ? s[Math.min(s.length-1, Math.floor(s.length*p))] : null; };
const mandatory = [64, 81, 38, 152, 176, 92, 25];
function correctedHero(s) {
  if (!s.raw?.trace) return s;
  const seen = new Set();
  const rows = s.raw.trace.filter(x => x.s && x.hero && !seen.has(x.si) && seen.add(x.si));
  const velocity = [];
  for (let i=1;i<rows.length;i++) {
    const a=rows[i-1], b=rows[i], dt=b.s.t-a.s.t;
    velocity.push(dt>0 ? {vx:(b.hero[0]-a.hero[0])/dt,vz:(b.hero[1]-a.hero[1])/dt,dt} : null);
  }
  const jerks=[], inversions=[];
  for(let i=2;i<rows.length;i++) {
    const a=velocity[i-2], b=velocity[i-1]; if(!a||!b)continue;
    jerks.push({frame:rows[i].si,t:rows[i].s.t,acceleration:n(Math.hypot(b.vx-a.vx,b.vz-a.vz)/b.dt),gesture:rows[i].s.g});
    const sa=Math.hypot(a.vx,a.vz),sb=Math.hypot(b.vx,b.vz);
    if(sa>1&&sb>1&&a.vx*b.vx+a.vz*b.vz<0)inversions.push({frame:rows[i].si,t:rows[i].s.t,beforeSpeed:n(sa),afterSpeed:n(sb),gesture:rows[i].s.g});
  }
  const carryRows=rows.filter(x=>[4,14].includes(x.w?.[1])&&(x.owner===-2||x.pori===-2));
  const carryIds=new Set(carryRows.map(x=>x.si));
  const carryJerks=jerks.filter(x=>carryIds.has(x.frame));
  const carryInversions=inversions.filter(x=>carryIds.has(x.frame));
  const b={'0-3':[],'3-6':[],'6-9':[],'9+':[]};
  for(const x of carryRows)if(Number.isFinite(x.s.sl)&&Number.isFinite(x.s.v)){
    const k=x.s.v<3?'0-3':x.s.v<6?'3-6':x.s.v<9?'6-9':'9+'; b[k].push(x.s.sl);
  }
  const heroFeet=Object.fromEntries(Object.entries(b).map(([k,v])=>[k,{n:v.length,median:n(q(v,.5)),p95:n(q(v,.95)),conclusive:v.length>=20}]));
  let changes=0, first=null, last=null; const bounded=[];
  for(const x of carryRows){if(!first){first={g:x.s.g,t:x.s.t,frame:x.si};last=first;continue;}
    if(x.s.g!==last.g){changes++;if(x.s.t-last.t<.15)bounded.push({frame:last.frame,g:last.g,duration:n(x.s.t-last.t)});
      last={g:x.s.g,t:x.s.t,frame:x.si};}}
  const byWall=new Map(s.raw.trace.map(x=>[x.wall,x]));
  const byFrame=new Map(rows.map(x=>[x.si,x]));
  const longFrames=s.raw.raf.filter(r=>r.dt>50).map(r=>{const x=byWall.get(r.t),prev=x?byFrame.get(x.si-1):null;
    return {frame:x?.si??null,t:x?.s?.t??null,dt:r.dt,gesture:x?.s?.g??null,
      firstGesture:!!x?.s?.g&&x.s.g!==prev?.s?.g,
      cameraStep:x&&prev?n(Math.hypot(...x.cam.map((v,k)=>v-prev.cam[k]))):null,
      cut:x?.cut??null,contextMatched:!!x};});
  return {...s,dt:{...s.dt,over50:longFrames},hero:{jerks,inversions,accelerationP99:n(q(jerks.map(x=>x.acceleration),.99)),accelerationMax:n(Math.max(...jerks.map(x=>x.acceleration))),
    carryAccelerationP99:n(q(carryJerks.map(x=>x.acceleration),.99)),carryAccelerationMax:n(Math.max(...carryJerks.map(x=>x.acceleration))),carryInversions},
    heroFeet, heroGesture:{changes,perSecond:carryRows.length&&s.carry.seconds?n(changes/s.carry.seconds):null,under0_15:bounded}};
}
const scenes = scan.scenes.map(correctedHero);
const retryScene = correctedHero(retry.analyzed);
const selected = scenes.filter(s => s.valid && s.carry?.seconds >= 1 && s.carry?.heroFrames > 0);
const inspect = [...new Map([...selected, ...mandatory.map(gi => scenes.find(s => s.gi === gi))].map(s => [s.gi, s])).values()];
const compactTrace = s => s.raw.trace.filter(x => x.s && x.w).map(x => [
  x.si, x.wall, x.dt, x.w[0], x.w[1], x.w[2], x.w[3],
  x.s.t, x.s.g, x.s.v, x.s.dL, x.s.dR, x.s.sl, x.s.ct,
  x.hero[0], x.hero[1], x.owner, x.pori, x.cut, ...x.cam
]);
const strip = s => { const { raw, ...rest } = s; const { jerks, ...hero } = rest.hero || {};
  const gesture = rest.gesture ? { ...rest.gesture,
    under0_15: rest.gesture.under0_15.filter(x => x.frame !== rest.gesture.transitions.at(-1)?.frame) } : undefined;
  return { ...rest, hero, gesture }; };
const all = scenes.map(strip);
const frames = Object.fromEntries(inspect.map(s => [s.gi, compactTrace(s)]));
frames[38] = compactTrace(retryScene);
const heroCarry = selected.flatMap(s => {
  const ids = new Set(s.raw.trace.filter(x => [4,14].includes(x.w?.[1]) && (x.owner === -2 || x.pori === -2)).map(x => x.si));
  return s.hero.jerks.filter(x => ids.has(x.frame)).map(x => ({ ...x, gi: s.gi }));
});
const p99 = q(heroCarry.map(x => x.acceleration), .99);
const jerkOutliers = heroCarry.filter(x => x.acceleration >= p99).sort((a,b) => b.acceleration-a.acceleration);
const bands = { '0-3': [], '3-6': [], '6-9': [], '9+': [] };
for (const s of selected) {
  const seen = new Set();
  for (const x of s.raw.trace) {
    if (!x.s || !x.w || seen.has(x.si) || ![4,14].includes(x.w[1]) || !(x.owner===-2 || x.pori===-2)) continue;
    seen.add(x.si);
    if (!Number.isFinite(x.s.sl) || !Number.isFinite(x.s.v)) continue;
    const key = x.s.v < 3 ? '0-3' : x.s.v < 6 ? '3-6' : x.s.v < 9 ? '6-9' : '9+';
    bands[key].push(x.s.sl);
  }
}
const feet = Object.fromEntries(Object.entries(bands).map(([k,v])=>[k,{n:v.length,median:n(q(v,.5)),p95:n(q(v,.95)),conclusive:v.length>=20}]));
const allSlip = Object.values(bands).flat();
const valid = scenes.filter(s=>s.valid);
const counts = {
  scanned: scenes.length, valid: valid.length, invalid: scenes.length-valid.length,
  selected: selected.length, selectedIds: selected.map(s=>s.gi),
  carryFrames: selected.reduce((a,s)=>a+s.carry.heroFrames,0),
  farFrames: selected.reduce((a,s)=>a+s.carry.over1_5.length,0),
  jumps: selected.reduce((a,s)=>a+s.jumps.length,0),
  longFrames: selected.reduce((a,s)=>a+s.dt.over50.length,0),
  longScenes: selected.filter(s=>s.dt.over50.length>0).length,
  slipOver3: allSlip.filter(v=>v>3).length,
  slipOver5: allSlip.filter(v=>v>5).length,
  slipOver10: allSlip.filter(v=>v>10).length,
  slipMax: n(Math.max(...allSlip)),
  inversions: selected.reduce((a,s)=>a+s.hero.inversions.length,0),
  minSelectedFps: n(Math.min(...selected.map(s=>s.fpsMedian))),
  maxSelectedFps: n(Math.max(...selected.map(s=>s.fpsMedian))),
  heroAccelerationSamples: heroCarry.length, heroAccelerationP99: n(p99),
  slBySpeed: feet
};
const output = {
  versione: '7.999.39', compito: 'Fluidità 3D con corpi GLB e GPU D3D11',
  comando: "$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_GPU_MODE='headless-d3d11'; $env:CPM_TASK='scan'; $env:CPM_SCENE_MS='6000'; Remove-Item Env:CPM_FEET -ErrorAction SilentlyContinue; node tests/codex/fluidita-3d.mjs",
  seme: 'gi 0..190, __CPM_FORCE_SIT(gi,true), outcome success, action 0, __CPM_CINE=1',
  renderer: scan.renderer, glb: scan.glb, viewport: scan.viewport, deviceScaleFactor: scan.deviceScaleFactor,
  traceColumns: ['witnessFrame','rafTimestampMs','rafDtMs','writerTimestampMs','writerCode','ballX','ballZ','sceneTimeSec','gesture','heroSpeed','ballLeftFoot','ballRightFoot','stanceSlip','clipTime','heroX','heroZ','owner','pori','cameraCut','cameraX','cameraY','cameraZ'],
  misure: [{ nome:'Scene GPU valide', valore: counts.valid, soglia:'FPS mediano >=45', esito:'ok' },
    { nome:'Scene con conduzione >=1s', valore: counts.selected, soglia:'almeno 15', esito:counts.selected>=15?'ok':'anomalia' },
    { nome:'Campioni di piede appoggiato oltre 3 u/s', valore: counts.slipOver3, soglia:'0 ideale, nessuna soglia di gate concordata', esito:'anomalia' },
    { nome:'Frame rAF oltre 50 ms', valore: counts.longFrames, soglia:'0 ideale', esito:'anomalia' },
    { nome:'Long task alla prima apertura GPU senza profiler', valore: openingPure?.openings?.[0]?.longTaskMaxMs ?? null,
      soglia:'100 ms', esito:(openingPure?.openings?.[0]?.longTaskMaxMs??0)>100?'anomalia':'ok' }],
  segnalazioni: [
    { gravita:'alta', descrizione:'Blocco alla prima e alla seconda apertura anche con GPU D3D11; causa sorgente non verificata',
      come_riprodurre:'CPM_GLB=1 CPM_ATTESA=15000 CPM_SCENES=5 node tests/codex/apertura-gpu.mjs',
      prove:['reports/codex/2026-09-28-apertura-gpu-no-profiler.json','reports/codex/2026-09-28-apertura-gpu.cpuprofile'] },
    { gravita:'alta', descrizione:'Piede appoggiato in movimento durante conduzione; visibilità mobile non verificata',
      come_riprodurre:'CPM_TASK=scan node tests/codex/fluidita-3d.mjs; node tests/codex/riepilogo-fluidita-3d.mjs',
      prove:['reports/codex/2026-09-28-fluidita-3d.json'] },
    { gravita:'media', descrizione:'Salti di allineamento della palla in gi50 e gi87; possibile artefatto di scena forzata',
      come_riprodurre:'CPM_TASK=scan node tests/codex/fluidita-3d.mjs',
      prove:['reports/codex/2026-09-28-fluidita-3d.json','reports/codex/video-fluidita-3d/prova-headed-87.webm'] },
    { gravita:'media', descrizione:'Frame rAF oltre 50 ms in scene con FPS mediano valido; causa non verificata',
      come_riprodurre:'CPM_TASK=scan node tests/codex/fluidita-3d.mjs',
      prove:['reports/codex/2026-09-28-fluidita-3d.json'] }
  ], counts, mandatory,
  scenes: all, frames, rerun38: strip(retryScene),
  heroAccelerationOutliers: jerkOutliers, video, isolatedVideo,
  opening: opening && {renderer:opening.renderer, glb:opening.glb, openings:opening.openings, profile:opening.profile, profileFunctions,
    failure:opening.failure, errors:opening.errors},
  openingNoProfiler: openingPure && {renderer:openingPure.renderer,glb:openingPure.glb,openings:openingPure.openings,
    failure:openingPure.failure,errors:openingPure.errors}
};
const target = path.join(report, '2026-09-28-fluidita-3d.json');
fs.writeFileSync(target, JSON.stringify(output));
console.log(JSON.stringify({counts,mandatory:mandatory.map(gi=>({gi,initial:scenes.find(s=>s.gi===gi)?.fpsMedian,rerun:gi===38?retry.summary?.medianFps:undefined})),jerkOutliers,opening:output.opening?.openings?.map(x=>({index:x.index,longTaskMaxMs:x.longTaskMaxMs,rafMaxGapMs:x.rafMaxGapMs})),bytes:fs.statSync(target).size},null,2));
