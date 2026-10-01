/* [CENSIMENTO 833 · bugie W e U del playtest n°5] UN REGISTA SOLO. Per ogni apertura della libreria delle azioni
   (__CPM_LIB822): a che minuto, con quale turno di possesso, quanti minuti dopo l'ultimo gol. Metriche: aperture per
   partita (banda: non sotto 2, o la 7.785 v2 aveva ragione), aperture entro 2' da un gol (W), aperture con la palla
   avversaria (U). Rosso: CPM_ROSSO=822. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Vairo,Moretti,Galli,Conti').split(',');
const ROSSO=process.env.CPM_ROSSO||'';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
let tot=0,W=0,U=0,golT=0;const perM=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];if(o.rosso)window['__CPM_NO'+o.rosso]=true;if(o.away)window.__CPM_AWAY_TEST=true;},{rosso:ROSSO,away:g>=NOMI.length/2});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>({gate:window.__CPM_LIBGATE785||null,lib:window.__CPM_LIB822||[],gol:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal').map(e=>(e.min|0)+(e.side||'?')[0])}));
  await ctx.close();
  const w=d.lib.filter(x=>x.dopoGol<=2).length,u=d.lib.filter(x=>x.poss<=0).length,gt=d.lib.filter(x=>x.golTick).length;
  tot+=d.lib.length;W+=w;U+=u;golT+=gt;perM.push(d.lib.length);
  console.log('  '+NOMI[g]+': aperture '+d.lib.length+' ['+d.lib.map(x=>x.min+"'"+(x.poss>0?'n':'L')+(x.dopoGol<=2?'!':'')).join(' ')+'] · gol ['+d.gol.join(' ')+'] · entro 2\' da un gol '+w+' · palla loro '+u+' · sul tick del gol '+gt+(d.gate?' · cancello: tentativi '+d.gate.tent+' pg '+d.gate.pg+' gol '+d.gate.gol+' rec '+d.gate.rec+' ko '+d.gate.ko+' cool '+d.gate.cool+' liberi '+d.gate.ok+' → 822 ok '+(d.gate.ok822|0)+' (turno loro '+(d.gate.b822p|0)+', gol vicino '+(d.gate.b822g|0)+', tick gol '+(d.gate.b822t|0)+')':''));
}
await b.close();srv.close();
console.log('\n=== UN REGISTA SOLO ('+NOMI.length+' partite'+(ROSSO?', ROSSO NO'+ROSSO:'')+') ===');
console.log('  aperture della libreria per partita: '+perM.join('/')+' (media '+(tot/NOMI.length).toFixed(1)+')');
console.log('  [W] aperte entro 2\' da un gol: '+W+'/'+tot+'   · sul tick stesso del gol: '+golT);
console.log('  [U] aperte con la palla avversaria: '+U+'/'+tot);
