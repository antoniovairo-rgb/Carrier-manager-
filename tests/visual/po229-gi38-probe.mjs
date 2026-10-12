/* [7.999.161 PO-229] SONDA (non guardiano): gi38 «Dai e vai preciso» riuscito, forzato. Stampa esito dichiarato e posizioni di pallone/eroe dopo la consegna. Misurato: riquadro «Passaggio vincente!», cronaca «Lancio millimetrico — compagno solo!», ma il pallone torna ai piedi dell eroe (11/11,6) e resta fermo; nessun compagno conclude (il piu vicino a 9,7u). delivery-arrival lo segnala come 008 perche esclude l eroe: falso allarme sul «pallone solo», vero difetto sull ESITO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const b=await launchBrowser();const p=await b.newPage({viewport:{width:412,height:915}});await installCdnRoutes(p);
await p.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_CINE=1;window.__CPM_PRESENT=1;});
await openMatch(p,srv.address().port,{skipLoadAll:true});await sleep(700);
await p.evaluate(()=>window.__CPM_FORCE_SIT(38,true));await sleep(420);await p.evaluate(()=>{window.__CPM_FROZEN=false;});
const acts=await p.evaluate(()=>window.__CPM_ACTSO());console.log('acts',JSON.stringify(acts));
const k=(acts.find(a=>/assist/i.test(String(a.rew||'')))||acts[0]).i;
await p.evaluate(()=>{window.__CPM_FORCE_OUTCOME='success';});await p.evaluate(i=>window.__CPM_RESOLVE(i),k);
await p.waitForFunction(()=>{const s=window.__CPM_STATE&&window.__CPM_STATE();return s&&s.phase!=='hl_result';},{timeout:25000}).catch(()=>{});
const r=await p.evaluate(()=>{const s=window.__CPM_WATCH_SNAP();const S=s.samples;const mk=Math.max(...S.map(x=>x.sk).filter(v=>v>=0));const W=S.filter(x=>x.sk===mk&&(x.f&8));let last=-1;W.forEach((x,i)=>{if(x.f&1)last=i;});return {out:window.__CPM_OUTCOME,n:W.length,last,sl:W.slice(Math.max(0,last-3),last+12).map(x=>({t:Math.round(x.t),f:x.f,ball:[+x.x.toFixed(1),+x.z.toFixed(1)],hero:[+x.hx.toFixed(1),+x.hz.toFixed(1)],md:+x.md.toFixed(1)}))};});
console.log(JSON.stringify(r,null,0));await b.close();srv.close();
