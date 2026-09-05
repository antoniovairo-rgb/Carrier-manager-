/* [7.785 sonda] DOVE SI PERDONO I GOL DEL MICRO-SIMULATORE.
   bgMicroTick in isolamento produce 1,86 gol a partita (gara pari, N=800). In quattro partite intere
   giocate dall'autoplay ne sono arrivati ZERO al tabellone. Qui si legge il contatore gia' esistente
   __CPM_OCC695G: `giri` = quante volte il tick e' stato interrogato, `ev` = quante volte il gol del
   simulatore era vivo a quel punto della catena, piu' i motivi per cui il campo non era libero. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||2);
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;});
  await openMatch(page,port,{skipLoadAll:true,name:'Mc'});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({occ:window.__CPM_OCC695G||null,
    ms:(window.__CPM_MS&&window.__CPM_MS())||null}));
  console.log('partita '+g+' · minuto '+min+' · tabellone '+(r.ms&&r.ms.score?r.ms.score.h+'-'+r.ms.score.a:'?'));
  console.log('   OCC695G '+JSON.stringify(r.occ));
  await ctx.close();
}
await b.close();srv.close();
