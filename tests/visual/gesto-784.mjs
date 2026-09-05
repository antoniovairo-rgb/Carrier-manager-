/* [7.784 censimento 2] QUANTE AZIONI CHE CONSEGNANO IL PALLONE VENGONO RESE COME UN TIRO.
   deriveHL classifica per stat; le stat che non sono tiro/passaggio/dribbling (es. "tecnica",
   "fisico", "posizionamento") cadono nel fallback di ZONA: in area o al bordo -> "shot".
   Un'azione con rew "assist" e' una CONSEGNA a un compagno: renderla come conclusione in porta
   e' la nota del PO su SIT #26 «Il tacco e' una giocata straordinaria non un tiro in porta». */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();const page=await browser.newPage();
await installCdnRoutes(page);await page.addInitScript(()=>{window.__CPM_GLB=false;});
await openMatch(page,port);await sleep(300);
const rows=await page.evaluate(()=>{
  const SITS=window.__CPM_SITS,dHL=window.deriveHL;const out=[];
  SITS.forEach((sit,gi)=>(sit.actions||[]).forEach((act,ai)=>{
    let hl={};try{hl=dHL(sit,act)||{};}catch(e){}
    out.push({gi,ai,text:(sit.text||'').slice(0,40),lbl:act.label||'',stat:act.stat||null,
      rew:act.rew||null,type:hl.type||null,variant:hl.variant||null,z:(sit.zones||[])[0]||null});
  }));
  return out;
});
await browser.close();srv.close();
const CONCL=new Set(['shot','header','penalty','freekick']);
const bad=rows.filter(r=>r.rew==='assist'&&CONCL.has(r.type));
console.log('coppie situation x azione: '+rows.length);
console.log('azioni con esito ASSIST: '+rows.filter(r=>r.rew==='assist').length);
console.log('');
console.log('ROSSO — esito ASSIST reso come CONCLUSIONE: '+bad.length);
bad.forEach(r=>console.log('   #'+r.gi+'.'+r.ai+' ['+r.type+'/'+r.variant+'] stat='+r.stat+' z='+r.z+' — '+r.text+' | '+r.lbl));
const byStat={};bad.forEach(r=>{byStat[r.stat]=(byStat[r.stat]||0)+1;});
console.log('per stat: '+JSON.stringify(byStat));
