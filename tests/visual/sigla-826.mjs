/* [MISURA 826 · 7.809 / #55-B] LE RIGHE DEL PIANO PORTANO LA SIGLA DELLA SQUADRA? Playtest n°3: la
   costruzione avversaria («Colombo apre… Incornata di Bianchi a botta sicura!») senza sigla si leggeva
   come un nostro attacco che finiva nel gol loro. Qui: battute di piano (occasione E gol, __CPM_BEAT792
   con txt) che contengono almeno una sigla « (XXX)» / totale. Rosso CPM_ROSSO=809 → atteso 0%. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Sa,Sb,Sc').split(',');
const SEMI=NOMI.map((_,g)=>7150+g*271);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
let tot=0,con=0,occ=0,occCon=0;const esempi=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;if(o.rosso)window['__CPM_NO'+o.rosso]=true;},{rosso:(process.env.CPM_ROSSO||'')});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const B=await page.evaluate(()=>(window.__CPM_BEAT792||[]).map(x=>({occ:x.occ|0,txt:x.txt||''})));
  await ctx.close();
  B.forEach(x=>{tot++;const ok=/\((?:[A-Z]{3}|[A-Z]{2,4})\)/.test(x.txt);if(ok)con++;if(x.occ){occ++;if(ok)occCon++;}if(esempi.length<4&&x.txt)esempi.push(x.txt);});
  console.log('  '+NOMI[g]+': battute '+B.length);
}
await b.close();srv.close();
console.log('\n=== SIGLA NELLE RIGHE DEL PIANO ('+NOMI.length+' partite) ===');
console.log('  con sigla '+con+'/'+tot+' ('+(tot?Math.round(100*con/tot):0)+'%)   · solo occasioni '+occCon+'/'+occ);
esempi.forEach(e=>console.log('   · '+e));
