/* [7.785 sonda] LA CATENA DEL GOL AMBIENTALE, CONTATORE PER CONTATORE.
   Misurato: il micro-simulatore produce 2 gol a partita (ev=2 in 6 partite su 6, baseline 1,9) e a
   tabellone ne arriva 0,17. Qui si leggono TUTTI i registri gia' esistenti della catena per vedere
   in quale stadio il gol smette di esistere. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||2);const NOMI=(process.env.CPM_NOMI||'Ga,Gb,Gc,Gd').split(',');
const SEME0=+(process.env.CPM_SEME||9100),PASSO=+(process.env.CPM_PASSO||733);
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((rosso)=>{window.__CPM_GLB=false;window.__CPM_REC=true;
    if(rosso)String(rosso).split(',').forEach(r=>{window[r.trim()]=1;});},process.env.CPM_ROSSO||null);
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME0+g*PASSO);
  let min=0;const ev=[];
  for(let k=0;k<40;k++){await sleep(20000);
    const c=await page.evaluate(()=>{const e=(window.__CPM_EV&&window.__CPM_EV())||[];if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();return e;});
    ev.push(...c);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>{const pick={};
    for(const k of Object.keys(window)) if(/^__CPM_(LIBGATE785|LIB666|GOL785|GOL785C|OCC695G)/.test(k)){try{pick[k]=window[k];}catch(_e){}}
    const ms=window.__CPM_MS&&window.__CPM_MS();
    return {pick,score:ms&&ms.score?ms.score:null};});
  const gl=ev.filter(e=>e.ev==='goal');const by={};gl.forEach(x=>{by[x.src||'?']=(by[x.src||'?']||0)+1;});
  console.log('--- partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · tabellone '+(r.score?r.score.h+'-'+r.score.a:'?')+' · gol '+JSON.stringify(by));
  for(const k of Object.keys(r.pick)){
    const v=r.pick[k];
    const t=(k==='__CPM_PG587'&&v&&v.azioni)?('azioni='+v.azioni.length+' '+JSON.stringify(v.azioni.slice(0,6))):JSON.stringify(v);
    console.log('    '+k+' = '+String(t).slice(0,700));
  }
  await ctx.close();
}
await b.close();srv.close();
