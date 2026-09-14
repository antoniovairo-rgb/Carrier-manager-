// [7.2.0] Screenshot di collaudo della PREMIAZIONE 3D (gate-cieca): riusa l'harness del gate per montare LiveMatch
//   (flusso provino), poi forza la fase ceremony (__CPM_FORCE_CEREMONY) e cattura i 4 beat
//   (esultanza · giro di campo · sotto la curva · podio). Non è un gate — serve al collaudo visivo dello sprint.
import {mkdirSync} from 'fs';
import {resolve} from 'path';
import {startServer,launchBrowser,installCdnRoutes,openMatch,__dirname,sleep} from './lib/harness.mjs';

const OUT=resolve(__dirname,'out/ceremony');mkdirSync(OUT,{recursive:true});
const server=await startServer();const port=server.address().port;
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:900,height:1000}});
const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await installCdnRoutes(page);
await openMatch(page,port,{});// LOAD_ALL → phase hl_choose, il clock (gated su "playing") NON gira → cerimonia non interrotta
await page.waitForFunction(()=>typeof window.__CPM_FORCE_CEREMONY==='function',{timeout:20000});
await page.evaluate(()=>window.__CPM_FORCE_CEREMONY({name:"CAMPIONI D'ITALIA",kind:"league"}));
// headless idle throttla il rAF → pompo i frame a mano finché ceremonyT raggiunge la soglia del beat, poi scatto
const beats=[[1.2,'b1-esultanza'],[4.5,'b2-giro-campo'],[8.5,'b3-sotto-curva'],[11.5,'b4-podio']];
const pump=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(window.__CPM_CERT||0)))));
for(const [ct,name] of beats){
  let cur=0,guard=0;
  while(cur<ct&&guard++<3000){cur=await pump();}
  await page.screenshot({path:`${OUT}/${name}.png`});console.log('shot',name,'@cerT',(+cur.toFixed(2)));
}
console.log('pageerrors:',errs.length,errs.slice(0,3));
await browser.close();server.close();
console.log('OUTPUT →',OUT);
