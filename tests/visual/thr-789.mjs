/* [7.789 misura] LA MINACCIA ARRIVA MAI A 58?
   Misurato: le occasioni pericolose extra-eroe mostrate in 3D sono ZERO in tre partite intere, benche'
   il cancello passi tutte le sue condizioni 2-6 volte a partita. L'ultima porta e' `_apri714`:
   avanzamento >= 48 E minaccia >= 58 (src/14 r.3524). La minaccia e' gia' registrata a ogni tick in
   `__CPM_THREAT` sotto __CPM_REC. Qui si guarda la sua distribuzione: se non arriva mai a 58, le
   occasioni non possono nascere per costruzione, e «rarissime» e' un eufemismo. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||3);const NOMI=(process.env.CPM_NOMI||'Ta,Tb,Tc').split(',');
const TUTTI=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const t=await page.evaluate(()=>window.__CPM_THREAT||[]);
  const v=t.map(x=>x.t|0).sort((a,c)=>a-c);
  const q=(p)=>v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:'-';
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · campioni di minaccia '+v.length
    +' · mediana '+q(0.5)+' · p75 '+q(0.75)+' · p90 '+q(0.9)+' · p99 '+q(0.99)+' · max '+q(1)
    +' · tick con minaccia >=58: '+v.filter(x=>x>=58).length);
  TUTTI.push(...v);
  await ctx.close();
}
await b.close();srv.close();
TUTTI.sort((a,c)=>a-c);
const q=(p)=>TUTTI.length?TUTTI[Math.min(TUTTI.length-1,Math.floor(TUTTI.length*p))]:'-';
console.log('');
console.log('=== '+N+' partite intere · '+TUTTI.length+' campioni ===');
console.log('minaccia: mediana '+q(0.5)+' · p75 '+q(0.75)+' · p90 '+q(0.9)+' · p95 '+q(0.95)+' · p99 '+q(0.99)+' · max '+q(1));
console.log('tick con minaccia >= 58 (la soglia del cancello): '+TUTTI.filter(x=>x>=58).length+'/'+TUTTI.length
  +'  ('+(TUTTI.length?(TUTTI.filter(x=>x>=58).length/TUTTI.length*100).toFixed(1):0)+'%)');
console.log('tick con minaccia >= 48: '+TUTTI.filter(x=>x>=48).length+'  ·  >= 40: '+TUTTI.filter(x=>x>=40).length);
