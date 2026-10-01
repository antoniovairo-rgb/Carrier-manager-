/* [7.787 misura] LA SCENA SI CHIUDE PRIMA CHE IL PALLONE ARRIVI IN PORTA?
   Collaudo PO 04/09: «gol subito... il pallone credo non sia manco entrato. L'azione pericolosa viene
   staccata troppo presto». ARITMETICA SOSPETTA, da due misure gia' fatte: il cancello che tiene aperta
   la scena ha un tetto di 6000 ms reali (src/14 r.7012, `_att461<6000`), e la taratura dell'attesa del
   banco (7.784) ha misurato che dopo la risoluzione il pallone si assesta in 7097 ms in media. Sette
   secondi per arrivare, sei di scena.
   Qui si forzano le scene DIFENSIVE col fallimento (esito goal_against), e per ognuna si registra:
   QUANDO il pallone taglia la linea (gx <= 1.4) e QUANDO la scena si chiude (la fase lascia hl_result).
   Se la chiusura arriva prima del taglio, il PO ha ragione e la causa e' il tetto. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, forceSituation } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage({viewport:{width:412,height:915}});
await installCdnRoutes(page);
/* __CPM_REALWAIT apre SOTTO TEST la stessa attesa del gioco vero: senza, il cancello del 7.461 non
   gira affatto sotto `?cpmtest=1` e la misura non parlerebbe del regime del PO. */
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;window.__CPM_REALWAIT=true;
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:900);
const DEF=await page.evaluate(()=>{const o=[];window.__CPM_SITS.forEach((s,i)=>{if(s&&s.type==='def')o.push(i);});return o;});
const N=+(process.env.CPM_N||10);
const SCELTE=DEF.filter((_,i)=>i%Math.max(1,Math.round(DEF.length/N))===0).slice(0,N);
console.log('scene difensive nel catalogo: '+DEF.length+' · provate: '+SCELTE.length);
const R=[];
for(const gi of SCELTE){
  let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue;
  await sleep(600);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;window.__CPM_WAIT461=[];});
  await sleep(250);
  let r=false;try{r=await page.evaluate(()=>{window.__CPM_FORCE_OUTCOME='fail';return window.__CPM_RESOLVE(0);});}catch(e){}
  if(!r)continue;
  const t0=Date.now();let tLinea=null,tChiusa=null,gxMin=99;
  for(let k=0;k<160;k++){
    const st=await page.evaluate(()=>{const s=window.__CPM_STATE&&window.__CPM_STATE();
      return{gx:(s&&s.ball)?+s.ball.x.toFixed(1):null,ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||null};});
    const el=Date.now()-t0;
    if(st.gx!=null&&st.gx<gxMin)gxMin=st.gx;
    if(tLinea==null&&st.gx!=null&&st.gx<=1.4)tLinea=el;
    if(tChiusa==null&&st.ph&&!/^hl/.test(st.ph))tChiusa=el;
    if(tLinea!=null&&tChiusa!=null)break;
    if(el>16000)break;
    await sleep(100);
  }
  const out=await page.evaluate(()=>window.__CPM_OUTCOME);
  R.push({gi,key:(out&&out.outKey)||null,tLinea,tChiusa,gxMin});
  console.log('#'+gi+'  esito '+((out&&out.outKey)||'?')
    +'  ·  linea tagliata a '+(tLinea==null?'MAI (min gx '+gxMin+')':tLinea+'ms')
    +'  ·  scena chiusa a '+(tChiusa==null?'oltre la finestra':tChiusa+'ms')
    +(tLinea!=null&&tChiusa!=null?('  →  '+(tChiusa<tLinea?'STACCATA PRIMA di '+(tLinea-tChiusa)+'ms':'entrata prima della chiusura')):''));
  await sleep(700);
}
await b.close();srv.close();
const ga=R.filter(r=>r.key==='goal_against');
const conEntrambi=ga.filter(r=>r.tLinea!=null&&r.tChiusa!=null);
const prima=conEntrambi.filter(r=>r.tChiusa<r.tLinea).length;
const maiEntrato=ga.filter(r=>r.tLinea==null).length;
console.log('');
console.log('=== '+ga.length+' gol subiti su '+R.length+' scene difensive (GLB '+(GLB?'ON':'OFF')+') ===');
console.log('il pallone NON taglia mai la linea nella finestra: '+maiEntrato+'/'+ga.length);
console.log('scena chiusa PRIMA che il pallone entri: '+prima+'/'+(conEntrambi.length||1));
const tl=ga.map(r=>r.tLinea).filter(x=>x!=null).sort((a,c)=>a-c);
const tc=ga.map(r=>r.tChiusa).filter(x=>x!=null).sort((a,c)=>a-c);
console.log('tempo per entrare  mediana '+(tl.length?tl[tl.length>>1]:'-')+'ms  (max '+(tl.length?tl[tl.length-1]:'-')+')');
console.log('durata della scena mediana '+(tc.length?tc[tc.length>>1]:'-')+'ms  (tetto del cancello: 6000ms)');
