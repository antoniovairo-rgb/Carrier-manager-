/* Verifica AFFIDABILE (una situation per volta, timing pulito — come glb-dribble-verify che ha misurato
   il dribble a 0.949) che i gesti GLB partano per dribble/pass/build/shot dopo il fix 6.41.0. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port);
await page.waitForFunction(()=>{const g=window.__CPM_GESTURE&&window.__CPM_GESTURE();return g&&g.glb;},{timeout:25000}).catch(()=>console.log('WARN glb'));

const targets = await page.evaluate(()=>{
  const findAct=(pred)=>{ for(let gi=0;gi<SITUATIONS.length;gi++){ const acts=SITUATIONS[gi].actions||[]; for(let ai=0;ai<acts.length;ai++){ if(pred(acts[ai],SITUATIONS[gi])) return {gi,ai,label:acts[ai].label,stat:acts[ai].stat}; } } return null; };
  return {
    dribble: findAct(a=>a.stat==='dribbling'),
    pass:    findAct(a=>a.stat==='passaggio'),
    shot:    findAct(a=>a.stat==='tiro'),
    build:   findAct((a,s)=>a.stat!=='tiro'&&a.stat!=='passaggio'&&a.stat!=='dribbling'&&s.zones&&s.zones[0]==='centrocampo'),
  };
});
console.log('target', JSON.stringify(targets));

async function verify(name,t){
  if(!t){ console.log(`[${name}] nessuna situation trovata`); return; }
  await page.evaluate(({gi})=>{ const sz=SITUATIONS[gi].startZone; const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
    window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(gi,true,{x:Math.max(sx,60),y:sy}); }, {gi:t.gi});
  await sleep(900);
  await page.evaluate((k)=>{ window.__CPM_FORCE_OUTCOME='success'; window.__CPM_RESOLVE(k); }, t.ai);
  let maxGw=0, names=new Set(), hlType=null;
  for(let i=0;i<24;i++){ const g=await page.evaluate(()=>window.__CPM_GESTURE());
    if(g){ hlType=hlType||g.hlType; if(g.glb){ if(g.glb.gName)names.add(g.glb.gName); if(g.glb.gw>maxGw)maxGw=g.glb.gw; } }
    await sleep(55); }
  const ok=maxGw>0.2;
  console.log(`[${name}] gi=${t.gi} "${t.label}" hlType=${hlType} → gesto GLB ${ok?'PARTE ✅':'FERMO ❌'} (gName=${[...names].join(',')||'—'} peso=${maxGw.toFixed(3)})`);
  return ok;
}

const r={};
r.shot=await verify('shot(baseline)',targets.shot);
r.dribble=await verify('dribble',targets.dribble);
r.pass=await verify('pass',targets.pass);
r.build=await verify('build',targets.build);
console.log('\n=== ESITO ===');
console.log(`shot ${r.shot?'✅':'❌'} · dribble ${r.dribble?'✅':'❌'} · pass ${r.pass?'✅':'❌'} · build ${r.build?'✅':'❌'}`);
await browser.close(); srv.close(); process.exit(0);
