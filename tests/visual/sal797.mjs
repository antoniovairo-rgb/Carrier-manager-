import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
await openMatch(page,port,{skipLoadAll:true,name:'Oa'});
await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:9100,policy:'seeded',tickMs:300}));
let min=0;
for(let k=0;k<40;k++){await sleep(20000);
  const r=await page.evaluate(()=>({s:window.__CPM_SAL797||null,o:window.__CPM_OCC695||null,g:window.__CPM_APRI789||null,
    ms:(window.__CPM_MS&&window.__CPM_MS())||null}));
  min=r.ms?(r.ms.min|0):0;
  console.log(min+"' · SAL797 "+JSON.stringify(r.s)+' · OCC '+JSON.stringify(r.o)+' · cancello apre '+((r.g&&r.g.apre)|0)+'/'+((r.g&&r.g.qui)|0));
  if(min>=89)break;}
await ctx.close();await b.close();srv.close();
