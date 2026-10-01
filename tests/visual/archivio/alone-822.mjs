/* [MISURA 822 · regressione 7.805] L'ALONE DEL PALLONE NEGLI HIGHLIGHT. Nota PO sulla 7.807: «il
   pallone adesso e' troppo piccolo». La 7.805 spegneva l'alone in cronaca testuale senza riaccenderlo.
   Qui: quota di campioni in fase highlight (fase != playing) con alone acceso, e in cronaca con alone
   spento. Atteso verde: highlight ~100% acceso, cronaca ~100% spento. Rosso: CPM_ROSSO=814 (niente
   nascondiglio) oppure il build 7.807 (highlight 0% acceso dopo il primo minuto di cronaca). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOME=process.env.CPM_NOME||'Alo';const SEME=+(process.env.CPM_SEME||5151);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;if(o.rosso)window['__CPM_NO'+o.rosso]=true;},{rosso:(process.env.CPM_ROSSO||'')});
await openMatch(page,port,{skipLoadAll:true,name:NOME});
await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
const c={hlOn:0,hlOff:0,croOn:0,croOff:0};let clock=0;
for(let k=0;k<3400;k++){await sleep(150);
  const s=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();const v=window.__CPM_VIS665&&window.__CPM_VIS665();return {min:ms?(ms.min|0):0,v:v};});
  if(!s||!s.v)continue;clock=s.min;
  const hl=s.v.fase&&s.v.fase!=='playing'&&!s.v.saliente;
  if(hl){if(s.v.alone)c.hlOn++;else c.hlOff++;}
  else if(s.v.fase==='playing'&&!s.v.saliente){if(s.v.alone)c.croOn++;else c.croOff++;}
  if(clock>=89)break;}
await ctx.close();await b.close();srv.close();
const pct=(a,b)=>(a+b)?Math.round(100*a/(a+b)):0;
console.log('=== ALONE DEL PALLONE ('+NOME+'/'+SEME+') ===');
console.log('  highlight: alone ACCESO '+c.hlOn+'/'+(c.hlOn+c.hlOff)+' ('+pct(c.hlOn,c.hlOff)+'%)   atteso ~100%');
console.log('  cronaca:   alone SPENTO '+c.croOff+'/'+(c.croOn+c.croOff)+' ('+pct(c.croOff,c.croOn)+'%)   atteso ~100%');
