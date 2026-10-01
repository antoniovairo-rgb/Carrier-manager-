/* [CENSIMENTO 836 · «in casa la squadra non tira»] Alle finestre libere del cancello dell'occasione (palcoscenico libero,
   cooldown passato): quante col turno nostro e quante col turno loro, e in quante la palla e' abbastanza avanzata (adv>=48)
   per il lato che ha il turno. Piu' le occasioni armate per lato (__CPM_OCC695 + BEAT792). Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Vairo,Moretti,Galli,Conti').split(',');
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;if(o.away)window.__CPM_AWAY_TEST=true;},{away:g>=NOMI.length/2});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>({g:window.__CPM_OCCG836||[],beat:(window.__CPM_BEAT792||[]).filter(x=>x.step===0),poss:(window.__CPM_OWN&&window.__CPM_OWN())||null}));
  await ctx.close();
  const n=d.g.filter(x=>x.turno>0),l=d.g.filter(x=>x.turno<0);
  const med=(a)=>{if(!a.length)return '-';const s=a.map(x=>x.adv).sort((p,q)=>p-q);return s[Math.floor(s.length/2)];};
  const occN=d.beat.filter(x=>x.occ).length;
  console.log('  '+NOMI[g]+': finestre libere '+d.g.length+' · turno nostro '+n.length+' (adv>=48: '+n.filter(x=>x.adv>=48).length+', adv mediano '+med(n)+') · turno loro '+l.length+' (adv>=48: '+l.filter(x=>x.adv>=48).length+', adv mediano '+med(l)+') · occasioni armate '+occN);
}
await b.close();srv.close();
