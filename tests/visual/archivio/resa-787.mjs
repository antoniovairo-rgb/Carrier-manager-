/* [7.787 censimento] QUANTO CONVERTE L'EROE, E QUANTE SCENE VEDE.
   Residuo dichiarato del 7.785: 3,75 gol a partita e' sopra la banda del calcio vero (2,6-2,8). La
   parte ambientale e' quella progettata (2/partita, baseline 1,86); il sospetto e' che l'eccesso sia
   l'eroe, che nel banco converte quasi ogni scena. Qui si contano le SCENE risolte e i loro ESITI
   (evento `esito` nel libro mastro: key + ok), per sapere la resa vera per scena. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||6);const NOMI=(process.env.CPM_NOMI||'Ga,Gb,Gc,Gd,Ge,Gf').split(',');
const TUTTI=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  const ev=[];let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    const c=await page.evaluate(()=>{const e=(window.__CPM_EV&&window.__CPM_EV())||[];if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();return e;});
    ev.push(...c);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const sc=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms&&ms.score?{h:ms.score.h|0,a:ms.score.a|0}:null;});
  const es=ev.filter(e=>e.ev==='esito');
  const gl=ev.filter(e=>e.ev==='goal');const by={};gl.forEach(x=>{by[x.src||'?']=(by[x.src||'?']||0)+1;});
  TUTTI.push(...es);
  const kk={};es.forEach(e=>{const k=(e.key||'?')+(e.ok?'':' (fallita)');kk[k]=(kk[k]||0)+1;});
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+']: tabellone '+(sc?sc.h+'-'+sc.a:'?')+' · gol '+JSON.stringify(by)
    +' · scene '+es.length+' '+JSON.stringify(kk));
  await ctx.close();
}
await b.close();srv.close();
const n=TUTTI.length;
const kk={};TUTTI.forEach(e=>{const k=(e.key||'?')+(e.ok?'':' (fallita)');kk[k]=(kk[k]||0)+1;});
const golScena=TUTTI.filter(e=>e.ok&&e.key==='goal').length;
console.log('');
console.log('=== '+N+' partite ===');
console.log('scene risolte: '+n+'  ·  per partita: '+(n/N).toFixed(2));
console.log('esiti: '+JSON.stringify(kk));
console.log('GOL DELL EROE per scena: '+golScena+'/'+n+' = '+(n?Math.round(golScena/n*100):0)+'%');
console.log('riferimento: un attaccante vero segna su circa il 12-18% delle occasioni che tocca');
