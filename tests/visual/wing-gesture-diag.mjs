/* DIAGNOSI FEDELE: misura se il GESTO dell'eroe (rotazioni arti) si anima durante l'esito di
   sterzata/cross-di-fascia vs un TIRO normale (baseline). «Resta fermo» ⇔ escursione arti ~0. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port);
await page.waitForFunction(()=>typeof window.__CPM_GESTURE==='function',{timeout:20000});

const targets = await page.evaluate(()=>{
  const pick=(pred)=>{const gi=SITUATIONS.findIndex(pred);return gi;};
  const sterz=pick(s=>((s.tactic&&s.tactic.lanes)||[]).some(l=>/overlap/.test(l))&&(s.actions||[]).some(a=>/sterzat.*esterno/i.test(a.label||'')));
  const sterzAI=(gi=>gi<0?-1:SITUATIONS[gi].actions.findIndex(a=>/sterzat.*esterno/i.test(a.label||'')))(sterz);
  const cross=pick(s=>((s.tactic&&s.tactic.lanes)||[]).some(l=>/overlap/.test(l))&&(s.actions||[]).some(a=>/cross.*secondo palo|cross.*palo lontano/i.test(a.label||'')));
  const crossAI=(gi=>gi<0?-1:SITUATIONS[gi].actions.findIndex(a=>/cross.*secondo palo|cross.*palo lontano/i.test(a.label||'')))(cross);
  const shot=pick(s=>s.zones&&s.zones[0]==='area'&&(s.actions||[]).some(a=>a.stat==='tiro'));
  const shotAI=(gi=>gi<0?-1:SITUATIONS[gi].actions.findIndex(a=>a.stat==='tiro'))(shot);
  return { sterz:{gi:sterz,ai:sterzAI}, cross:{gi:cross,ai:crossAI}, shot:{gi:shot,ai:shotAI} };
});
console.log('target', JSON.stringify(targets));

async function measure(gi,ai,label){
  await page.evaluate((g)=>{ const sz=SITUATIONS[g].startZone; const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
    window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g,true,{x:Math.max(sx,64),y:sy}); }, gi);
  await sleep(800);
  await page.evaluate((k)=>{ window.__CPM_FORCE_OUTCOME='success'; window.__CPM_RESOLVE(k); }, ai);
  // campiona il gesto ogni ~60ms per 1.2s (copre la durata gesto ~0.55-0.65s)
  const samples=[];
  for(let i=0;i<20;i++){ const g=await page.evaluate(()=>window.__CPM_GESTURE()); if(g)samples.push(g); await sleep(60); }
  // escursione = max-min della rotazione x di gambe/braccia sui campioni
  const span=(key,sub)=>{const vs=samples.map(s=>s[key]&&s[key][sub]).filter(v=>typeof v==='number'); return vs.length?+(Math.max(...vs)-Math.min(...vs)).toFixed(3):null;};
  const hlType=samples.map(s=>s.hlType).find(Boolean);
  const res={ label, gi, hlType, legR:span('lR','x'), legL:span('lL','x'), armL:span('aL','x'), armR:span('aR','x'), rotYspan:+(Math.max(...samples.map(s=>s.rotY))-Math.min(...samples.map(s=>s.rotY))).toFixed(3) };
  const maxLimb=Math.max(res.legR||0,res.legL||0,res.armL||0,res.armR||0);
  res.gestureFired = maxLimb>0.25; // soglia: uno swing reale supera ~0.25 rad
  console.log(`[${label}] gi=${gi} hlType=${hlType} · escursione arti legR=${res.legR} legL=${res.legL} armL=${res.armL} armR=${res.armR} rotY=${res.rotYspan} → gesto ${res.gestureFired?'PARTE ✅':'FERMO ❌'}`);
  return res;
}

const s=await measure(targets.sterz.gi,targets.sterz.ai,'sterzata');
const c=await measure(targets.cross.gi,targets.cross.ai,'cross-secondo-palo');
const b=await measure(targets.shot.gi,targets.shot.ai,'tiro(baseline)');
console.log('\n=== SINTESI ===');
console.log(`baseline TIRO gesto: ${b.gestureFired?'PARTE':'FERMO'} (se FERMO, il metodo di misura è da tarare)`);
console.log(`sterzata: ${s.gestureFired?'PARTE':'FERMO (bug confermato)'}`);
console.log(`cross secondo palo: ${c.gestureFired?'PARTE':'FERMO (bug confermato)'}`);
await browser.close(); srv.close(); process.exit(0);
