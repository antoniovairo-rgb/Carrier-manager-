/* [CENSIMENTO 835 · bugia R] DA DOVE NASCONO LE SCENE DELL'EROE. Per partita: le scene (cpmEv «scena»: calendario /
   reattiva / sotto-63 / sotto-76 / catena / si-continua) col minuto, gli esiti (cpmEv «esito») col minuto, quante scene
   cadono nello stesso minuto di un'altra, e il minuto della prima scena. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Vairo,Moretti,Galli,Conti').split(',');
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const perSrc={};let stessoMin=0,prime=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;if(o.away)window.__CPM_AWAY_TEST=true;},{away:g>=NOMI.length/2});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>{const ev=(window.__CPM_EV&&window.__CPM_EV())||[];return {sc:ev.filter(e=>e.ev==='scena').map(e=>({min:e.min|0,src:e.src})),es:ev.filter(e=>e.ev==='esito').map(e=>({min:e.min|0,key:e.key,ok:!!e.ok}))};});
  await ctx.close();
  d.sc.forEach(s=>{perSrc[s.src]=(perSrc[s.src]||0)+1;});
  const mins={};d.es.forEach(e=>{mins[e.min]=(mins[e.min]||0)+1;});const dop=Object.values(mins).filter(n=>n>=2).length;stessoMin+=dop;
  if(d.es.length)prime.push(d.es[0].min);
  console.log('  '+NOMI[g]+': scene ['+d.sc.map(s=>s.min+"'"+s.src[0]).join(' ')+'] · esiti ['+d.es.map(e=>e.min+"'"+e.key+(e.ok?'+':'-')).join(' ')+'] · minuti con due esiti '+dop);
}
await b.close();srv.close();
console.log('\n=== DA DOVE NASCONO LE SCENE ('+NOMI.length+' partite) ===');
console.log('  per sorgente: '+JSON.stringify(perSrc));
console.log('  prima scena ai minuti ['+prime.join(',')+']   · minuti con due esiti (contraddizioni possibili): '+stessoMin);
