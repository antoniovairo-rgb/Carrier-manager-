/* [7.799 misura] CODICE 111 «PORTIERE FUORI TEMPO»: quanto tardi arriva il tuffo, in secondi.
   Nota PO (7.787, SIT #153 [progression] «Bordata da centrocampo!» → goal): «codice 111 — portiere
   fuori tempo». Nel motore il tuffo si arma a u >= 0,55, cioe' al 55% del VOLO: una frazione, non un
   tempo. Su un tiro corto sono due decimi; su una bordata da centrocampo e' mezzo volo. Un portiere
   vero reagisce in due-tre decimi qualunque sia la distanza — la frazione, per costruzione, fa
   aspettare di piu' proprio i tiri da lontano, che sono quelli in cui l'attesa si vede.
   Si forzano le situazioni con conclusione e si legge `__CPM_GK799`. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const GI=(process.env.CPM_GI||'153,8,20,21,26,27,40,47,67,92,101,105,125,144,166,3,9,11,12,22,23,46,56,59').split(',').map(Number);
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
await openMatch(page,port,{});
/* ⚠️ IL CAMPIONE ERA TROPPO PICCOLO PER DECIDERE, e tre passate lo hanno dimostrato: quattro tuffi,
   poi tre, poi ZERO, a codice quasi identico. Un metro che oscilla cosi' non puo' giudicare un rimedio
   — e' la stessa lezione del 7.617 sul metro del portatore («balla di +-10 punti fra run a codice
   identico»). Ora si forzano TUTTE le azioni di ogni situazione, su un catalogo piu' largo. */
for(const gi of GI){
  for(const k of [0,1,2]){
    try{
      await page.evaluate(([i,c])=>window.__CPM_FORCE_SIT(i,c),[gi,true]);
      await sleep(600);
      await page.evaluate((kk)=>window.__CPM_RESOLVE&&window.__CPM_RESOLVE(kk),k);
      await sleep(2400);
    }catch(e){}
  }
}
const G=await page.evaluate(()=>window.__CPM_GK799||[]);
/* ⚠️ IL CONTROLLO CHE MANCAVA alla prima passata: la prima stesura strumentava UNO SOLO dei sette rami
   che armano il tuffo, e ha contato zero — uno zero che non diceva niente sul gioco, solo sulla sonda.
   Ora sono strumentati tutti e sette, e si stampa da quale ramo arriva ogni tuffo. */
const perRamo={};G.forEach(x=>{perRamo[x.tag]=(perRamo[x.tag]|0)+1;});
await ctx.close();await b.close();srv.close();
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
console.log('=== '+G.length+' tuffi osservati su '+GI.length+' scene forzate ===');
console.log('  da quale ramo: '+JSON.stringify(perRamo)+'   (sette rami strumentati)');
if(!G.length){console.log('  NESSUN TUFFO — misura mancata, non un verde.');process.exit(2);}
const conArco=G.filter(x=>x.dur!=null&&x.t!=null);
console.log('  tuffi con un arco attivo (misurabili nel tempo): '+conArco.length+'/'+G.length);
if(!conArco.length){console.log('  nessun tuffo misurabile nel tempo — il ritardo non si puo\' dire.');process.exit(0);}
const D=conArco.map(x=>x.dur),R=conArco.map(x=>x.t);
console.log('  durata del volo (s):   mediana '+q(D,0.5)+' · p25 '+q(D,0.25)+' · p75 '+q(D,0.75)+' · max '+Math.max(...D));
console.log('  RITARDO del tuffo (s): mediana '+q(R,0.5)+' · p25 '+q(R,0.25)+' · p75 '+q(R,0.75)+' · max '+Math.max(...R));
const tardi=R.filter(x=>x>0.45).length;
console.log('  tuffi oltre 0,45 s dalla partenza del pallone (un portiere umano reagisce in 0,2-0,4): '
  +tardi+'/'+R.length+'  ('+Math.round(100*tardi/R.length)+'%)');
conArco.slice(0,12).forEach(x=>console.log('    ['+x.tag+'] volo '+x.dur+'s → tuffo a '+x.t+'s'
  +(x.t>0.45?'   ← fuori tempo':'')));
