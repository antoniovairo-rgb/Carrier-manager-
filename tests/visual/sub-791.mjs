/* [7.791 misura] DOPO LA SOSTITUZIONE DELL'EROE, LE INTERAZIONI INTERATTIVE CONTINUANO?
   Nota PO (05/09): «Dopo la sostituzione dell'eroe continuavano le interazioni interattive».
   Metodo: si gioca una partita vera, al minuto scelto si forza lo stato «uscito dal campo» con la leva
   di collaudo `__CPM_FORCE_SUBOFF` (7.543), poi si CAMPIONA la fase del gioco a intervalli fitti e si
   contano le fasi interattive (`hl_choose`, `hl_move`) e le entrate in scena (`hl_intro`) che arrivano
   DOPO l'uscita. Un eroe fuori dal campo non deve avere nemmeno una scena da giocare.
   Sola lettura oltre alla leva. Regime del gioco (__CPM_PRESENT). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_S||4);
const NOMI=(process.env.CPM_NOMI||'Sa,Sb,Sc,Sd').split(',');
const MINUSCITA=+(process.env.CPM_MIN_SUB||40);
const OUT=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),4400+g*911);
  /* aspetto il minuto d'uscita, poi tiro la leva */
  let usc=null;
  for(let k=0;k<120;k++){await sleep(1500);
    const m=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(m>=MINUSCITA){usc=await page.evaluate(()=>({ok:!!(window.__CPM_FORCE_SUBOFF&&window.__CPM_FORCE_SUBOFF()),st:(window.__CPM_SUBOFF&&window.__CPM_SUBOFF())||null,min:(window.__CPM_MS&&window.__CPM_MS()||{}).min|0}));break;}}
  if(!usc||!usc.ok){console.log('['+NOMI[g]+'] LEVA NON TIRATA — campione scartato');await ctx.close();continue;}
  /* da qui in poi l'eroe e' fuori: ogni fase interattiva e' un difetto */
  const fasi={};let inter=0,intro=0,camp=0;const quando=[];
  for(let k=0;k<200;k++){await sleep(1200);
    const s=await page.evaluate(()=>{const st=(window.__CPM_STATE&&window.__CPM_STATE())||{};
      const ms=(window.__CPM_MS&&window.__CPM_MS())||{};
      const so=(window.__CPM_SUBOFF&&window.__CPM_SUBOFF())||{};
      return{ph:st.phase||st.ph||null,min:ms.min|0,off:!!so.off};});
    camp++;fasi[s.ph]=(fasi[s.ph]|0)+1;
    if(s.ph==='hl_choose'||s.ph==='hl_move'){inter++;if(quando.length<12)quando.push(s.min+"'/"+s.ph);}
    if(s.ph==='hl_intro'){intro++;if(quando.length<12)quando.push(s.min+"'/intro");}
    if(s.min>=90||s.ph==='ended'||s.ph==='ceremony')break;}
  OUT.push({n:NOMI[g],usc:usc.min,inter,intro,camp,fasi,quando});
  console.log('['+NOMI[g]+'] uscito al '+usc.min+"' · campioni dopo l'uscita "+camp
    +' · FASI INTERATTIVE (hl_choose/hl_move) '+inter+' · entrate in scena (hl_intro) '+intro);
  console.log('        fasi viste: '+JSON.stringify(fasi));
  if(quando.length)console.log('        quando: '+quando.join(' · '));
  await ctx.close();
}
await b.close();srv.close();
const ti=OUT.reduce((s,x)=>s+x.inter,0),tn=OUT.reduce((s,x)=>s+x.intro,0);
const rotte=OUT.filter(x=>x.inter>0||x.intro>0).length;
console.log('');
console.log('=== '+OUT.length+' partite, eroe fuori dal '+MINUSCITA+"' ===");
console.log('  partite con almeno una scena DOPO l\'uscita: '+rotte+'/'+OUT.length);
console.log('  campioni in fase interattiva dopo l\'uscita: '+ti);
console.log('  campioni in entrata di scena dopo l\'uscita: '+tn);
console.log(ti===0&&tn===0?'  VERDE — a eroe fuori, nessuna scena.':'  ROSSO — l\'eroe e\' uscito e il gioco gli chiede ancora di giocare.');
