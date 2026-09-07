/* [CENSIMENTO 825 · S1/S2 della roadmap] UN SOLO PADRONE? Chi possiede il pallone secondo la
   SIMULAZIONE (carrierRef → __CPM_MS().carrier, e lo stato dell'eroe) e chi lo possiede secondo il
   RENDERER (elezione 7.555 → __CPM_WS().pad, corpo __CPM_WS().por). Su tutta la fase ambientale di
   una partita: quanto spesso i due dicono la stessa cosa, e quanto dista il pallone reso dal corpo
   del padrone logico. Piu' lo scarto reso↔logico e i salti > 8u fra due campioni a 30-100 ms.
   Banco a tempo reale. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Pa,Pb').split(',');
const SEMI=NOMI.map((_,g)=>9150+g*331);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  const c={n:0,accordo:0,logNessuno:0,resNessuno:0,eroeRes:0,eroeLog:0,dPor:[],scarto:[],salti:0,tab:{}};
  let clock=0,prev=null;
  for(let k=0;k<4000;k++){await sleep(70);
    const s=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();const w=window.__CPM_WS&&window.__CPM_WS();const v=window.__CPM_VIS665&&window.__CPM_VIS665();
      const carr=ms&&ms.carrier;const ci=(carr&&typeof carr==='object')?(carr.i!=null?carr.i:null):(typeof carr==='number'?carr:null);
      const mp=(window.__CPM_MP&&window.__CPM_MP())||null;
      return {t:Date.now(),min:ms?(ms.min|0):0,w:w,fase:v&&v.fase,sal:v&&v.saliente,ci:ci,eroeLog:!!(ms&&ms.eroe&&(ms.eroe.palla||ms.eroe.possesso||ms.eroe.conPalla))};});
    if(!s||!s.w)continue;clock=s.min;
    if(s.fase!=='playing'){prev=null;if(clock>=89)break;continue;}
    c.n++;
    const padRes=s.w.pad||'nessuno';const padLog=(s.ci!=null)?'portatore':(s.eroeLog?'eroe':'nessuno');
    const k2=padLog+'→'+padRes;c.tab[k2]=(c.tab[k2]||0)+1;
    if(padLog===padRes)c.accordo++;
    if(padRes==='eroe')c.eroeRes++;if(s.eroeLog)c.eroeLog++;
    if(s.w.lx!=null){c.scarto.push(Math.hypot(s.w.rx-s.w.lx,s.w.ry-s.w.ly));}
    if(prev){const dd=Math.hypot(s.w.rx-prev.rx,s.w.ry-prev.ry);const dt=s.t-prev.t;if(dt<=110&&dd>8)c.salti++;}
    prev={rx:s.w.rx,ry:s.w.ry,t:s.t};
    if(clock>=89)break;}
  const P=await page.evaluate(()=>window.__CPM_PADRONE||null);const fps=await page.evaluate(()=>Math.round(window.__CPM_FPS708||0));
  await ctx.close();
  const q=(a,p)=>{if(!a.length)return 0;const s2=a.slice().sort((u,v)=>u-v);return +s2[Math.min(s2.length-1,Math.floor(p*(s2.length-1)))].toFixed(1);};
  console.log('\n=== '+NOMI[g]+' (fps ~'+fps+') — '+c.n+' campioni in fase ambientale ===');
  console.log('  padrone: simulazione e renderer d\'accordo '+Math.round(100*c.accordo/Math.max(1,c.n))+'%   · renderer elegge l\'EROE '+Math.round(100*c.eroeRes/Math.max(1,c.n))+'% dei campioni (simulazione: '+Math.round(100*c.eroeLog/Math.max(1,c.n))+'%)');
  console.log('  incroci (logico→reso): '+Object.entries(c.tab).sort((a,b2)=>b2[1]-a[1]).map(([k,v])=>k+' '+Math.round(100*v/c.n)+'%').join(' · '));
  console.log('  scarto reso↔logico: mediana '+q(c.scarto,0.5)+'u  p90 '+q(c.scarto,0.9)+'u  max '+q(c.scarto,1)+'u   · salti >8u fra campioni ≤110 ms: '+c.salti);
  if(P)console.log('  __CPM_PADRONE (tutta la partita): fotogrammi '+P.n+'  fuori >2u '+Math.round(100*P.fuori/Math.max(1,P.n))+'%  scarto medio '+(P.somma/Math.max(1,P.n)).toFixed(1)+'u  max '+P.max.toFixed(1)+'u  · chi: '+Object.entries(P.chi||{}).sort((a,b2)=>b2[1]-a[1]).slice(0,5).map(([k,v])=>k+':'+v).join(' '));
}
await b.close();srv.close();
