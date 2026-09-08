/* [DIAGNOSTICA 828 · S4] BATTUTE CONTRO DIARIO. rifiuti-827: nessuna battuta rifiutata, ma 0/6 occasioni
   «complete» nel diario. O le battute cambiano testo fra il piano e addCom, o il confronto sbaglia. Qui
   si stampano, per ogni occasione, le tre battute (testo del piano) e le righe del diario nei minuti
   attorno, senza confronti automatici: si legge. Una partita. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOME=process.env.CPM_NOME||'Rb';const SEME=+(process.env.CPM_SEME||6593);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;window.__CPM_CRO802=[];});
await openMatch(page,port,{skipLoadAll:true,name:NOME});
await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
const d=await page.evaluate(()=>({beat:(window.__CPM_BEAT792||[]).filter(x=>x&&x.occ).map(x=>({min:x.min,step:x.step,txt:x.txt||''})),cro:(window.__CPM_CRO802||[]).map(x=>({t:x.t,txt:x.txt}))}));
await ctx.close();await b.close();srv.close();
const occ=[];d.beat.forEach(x=>{if(x.step===0)occ.push([]);if(occ.length)occ[occ.length-1].push(x);});
console.log('=== '+NOME+'/'+SEME+' — '+occ.length+' occasioni, '+d.cro.length+' righe nel diario ===');
occ.forEach((o,i)=>{const m0=o[0].min;
  console.log('\n  OCCASIONE '+(i+1)+' (minuti '+o.map(x=>x.min).join(',')+')');
  o.forEach(x=>console.log("    PIANO step"+x.step+" "+x.min+"'  "+x.txt));
  d.cro.filter(c=>c.t>=m0-1&&c.t<=m0+4).forEach(c=>console.log("    DIARIO "+c.t+"'  "+c.txt.slice(0,110)));});
