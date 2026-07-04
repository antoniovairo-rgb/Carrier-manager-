/* Verifica FIX 6.40.0 con GLB ON (come nel gioco reale): il gesto DRIBBLE ora parte (clip receive) invece
   che «solo locomozione». Misura glb.gName/gw durante l'esito di una sterzata + screenshot. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port); // GLB ON di default
// attendi che il rig GLB + le clip siano caricati
await page.waitForFunction(()=>{ const g=window.__CPM_GESTURE&&window.__CPM_GESTURE(); return g&&g.glb; },{timeout:25000}).catch(()=>console.log('WARN: glb non caricato in tempo'));
const clipInfo = await page.evaluate(()=>{ const g=window.__CPM_GESTURE(); return g&&g.glb; });
console.log('GLB hero:', JSON.stringify(clipInfo));

const t = await page.evaluate(()=>{
  const gi=SITUATIONS.findIndex(s=>((s.tactic&&s.tactic.lanes)||[]).some(l=>/overlap/.test(l))&&(s.actions||[]).some(a=>/sterzat.*esterno/i.test(a.label||'')));
  const ai=gi<0?-1:SITUATIONS[gi].actions.findIndex(a=>/sterzat.*esterno/i.test(a.label||''));
  return {gi,ai};
});
console.log('sterzata target', JSON.stringify(t));

await page.evaluate((g)=>{ const sz=SITUATIONS[g].startZone; const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
  window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g,true,{x:Math.max(sx,64),y:sy}); }, t.gi);
await sleep(900);
await page.evaluate((k)=>{ window.__CPM_FORCE_OUTCOME='success'; window.__CPM_RESOLVE(k); }, t.ai);

let maxGw=0, sawDribble=false;
for(let i=0;i<18;i++){
  const g=await page.evaluate(()=>window.__CPM_GESTURE());
  if(g&&g.glb){ if(g.glb.gName==='dribble')sawDribble=true; if(g.glb.gw>maxGw)maxGw=g.glb.gw; }
  if(i===3||i===7) await page.screenshot({ path:`${OUT}/glb-dribble-f${i}.png` });
  await sleep(55);
}
console.log(`\ngesto GLB 'dribble' attivato durante l'esito: ${sawDribble?'SÌ ✅':'NO ❌'} · peso max gesto=${maxGw.toFixed(3)}`);
console.log(sawDribble&&maxGw>0.1 ? '✅ FIX OK — la sterzata ora ha un gesto col GLB' : '❌ il gesto dribble non parte col GLB');
await browser.close(); srv.close(); process.exit(0);
