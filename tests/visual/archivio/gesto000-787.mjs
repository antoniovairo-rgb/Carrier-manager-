/* [7.787 censimento] CODICE 000 «GESTO SCOORDINATO»: quante scene montano DUE gesti sull'eroe.
   Il PO l'ha segnalato tre volte (SIT #92, SIT #111, e una vecchia sul dribbling all'86'). Non esiste
   un rilevatore nella bozza automatica, ma esiste un contatore DENTRO il gioco dal 7.582
   (`__CPM_G000`, per chiave di scena: quante volte il gesto DICHIARATO dell'eroe cambia a scena in
   corso, con la sequenza dei gesti e dei tipi d'azione). Sta nel gioco e non in una sonda perche'
   GLB-ON headless gira a ~0,3 fps e chi campiona da fuori vede due fotogrammi per scena.
   Qui si aprono N scene nel REGIME DEL GIOCO VERO (__CPM_CINE=1: senza, l'esecutore cinematico e'
   spento e il secondo montaggio non puo' nemmeno accadere) e si legge il contatore. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage();
await installCdnRoutes(page);
/* [direttiva PO 01/09] «i test li devi fare con GLB ON»: qui non e' una preferenza, e' una
   condizione — senza i modelli non esistono clip e il contatore dei gesti non puo' nemmeno
   accendersi. Prima passata con GLB OFF: 28 scene aperte, ZERO registrazioni. */
await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CINE=1;});
await openMatch(page,port);await sleep(4000);
const PASSO=+(process.env.CPM_PASSO||16);/* GLB ON headless gira a ~0,3 fps: campione piu' rado, attese piu' lunghe */
const tot=await page.evaluate(()=>window.__CPM_SITS.length);
const GIs=[];for(let i=0;i<tot;i+=PASSO)GIs.push(i);
let aperte=0;
for(const gi of GIs){
  let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue;
  await sleep(1200);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});
  await sleep(400);
  let r=false;try{r=await page.evaluate(()=>window.__CPM_RESOLVE(0));}catch(e){}
  if(!r)continue;
  aperte++;
  await sleep(7000);
}
const G=await page.evaluate(()=>window.__CPM_G000||{});
await b.close();srv.close();
const chiavi=Object.keys(G);
const conDue=chiavi.filter(k=>(G[k].n|0)>=1);
console.log('scene aperte nel regime del gioco vero: '+aperte);
console.log('scene con un SECONDO gesto montato sull eroe: '+conDue.length+'/'+chiavi.length+' registrate');
conDue.slice(0,20).forEach(k=>console.log('   '+k+' · cambi '+G[k].n+' · gesti '+JSON.stringify(G[k].gesti)+' · tipi '+JSON.stringify(G[k].tipi)));
const nn=chiavi.map(k=>G[k].n|0).sort((a,c)=>a-c);
console.log('cambi per scena: mediana '+(nn.length?nn[nn.length>>1]:'-')+' · massimo '+(nn.length?nn[nn.length-1]:'-'));
