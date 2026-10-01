/* [7.786 misura] DOVE VA IL PALLONE SU UNO SMISTAMENTO DI TESTA.
   Le sei azioni con esito ASSIST rese come colpo di testa d'attacco mirano tutte AWAY_GOAL_X=46 (la
   porta avversaria). Qui si forza ognuna delle sei, si risolve, e si legge il BERSAGLIO dell'arco
   (__CPM_ARC.tx) piu' il registro dello smistamento (__CPM_FLICK786: quante volte ha trovato un uomo
   e a che distanza). Appaiata col rosso __CPM_NO786. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, forceSituation } from './lib/harness.mjs';
const CASI=[[64,2],[90,2],[108,0],[108,1],[124,0],[126,0]];
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage();
await installCdnRoutes(page);
await page.addInitScript((rosso)=>{window.__CPM_GLB=false;window.__CPM_REC=true;
  if(rosso)String(rosso).split(',').forEach(r=>{window[r.trim()]=1;});},process.env.CPM_ROSSO||null);
await openMatch(page,port);
const OUT=[];
for(const [gi,ai] of CASI){
  await page.evaluate(()=>{window.__CPM_TIMELINE_RESET&&window.__CPM_TIMELINE_RESET();window.__CPM_ARC=null;});
  await forceSituation(page,gi,{settle:550,choose:true});
  const info=await page.evaluate((k)=>{const S=window.__CPM_SITS[k[0]];const a=S.actions[k[1]];
    const hl=window.deriveHL(S,a);return{lbl:a.label,rew:a.rew,type:hl.type,variant:hl.variant};},[gi,ai]);
  await page.evaluate((k)=>{window.__CPM_FORCE_OUTCOME='success';window.__CPM_RESOLVE(k);},ai);
  await sleep(1400);
  const arc=await page.evaluate(()=>{const a=window.__CPM_ARC;if(!a)return null;
    /* due scrittori con forme diverse: {tx,tz} (r.3465) e {arc:[tgtX,tgtZ,t,dur]} (r.1968) */
    if(a.tx!=null)return{tx:a.tx,tz:a.tz};if(Array.isArray(a.arc))return{tx:a.arc[0],tz:a.arc[1]};return null;});
  OUT.push({gi,ai,...info,tx:arc?arc.tx:null,tz:arc?arc.tz:null});
  console.log('#'+gi+'.'+ai+' ['+info.type+'/'+info.variant+'] '+String(info.lbl).slice(0,32)
    +'  →  bersaglio x='+(arc?arc.tx:'?')+' (porta avversaria x=46, distanza dalla porta '+(arc&&arc.tx!=null?(46-arc.tx).toFixed(1):'?')+')');
  await sleep(500);
}
const F=await page.evaluate(()=>({f:window.__CPM_FLICK786||null,h:window.__CPM_HDR786||null}));
await b.close();srv.close();
const conTx=OUT.filter(o=>o.tx!=null);
const versoPorta=conTx.filter(o=>(46-o.tx)<8).length;
console.log('');
console.log('casi con bersaglio letto: '+conTx.length+'/'+OUT.length);
console.log('bersagli entro 8u dalla porta avversaria (cioe\' un TIRO): '+versoPorta+'/'+conTx.length);
console.log('registro smistamento __CPM_FLICK786: '+JSON.stringify(F.f));
console.log('BERSAGLIO DEL COLPO DI TESTA all istante della decisione __CPM_HDR786: '+JSON.stringify(F.h));
if(F.h&&F.h.tx&&F.h.tx.length){const v=F.h.tx.filter(x=>(46-x)<8).length;console.log('  di cui verso la porta avversaria (entro 8u): '+v+'/'+F.h.tx.length+'  ·  distanza mediana dalla porta '+(46-F.h.tx.slice().sort((a,b)=>a-b)[F.h.tx.length>>1]).toFixed(1)+'u');}
