/* [KE 7.802 · codice 001] «NELLE AZIONI PERICOLOSE IL PALLONE NON HA UN POSSESSORE».
   Nota PO con misura: all'apertura della scena il compagno piu' vicino sta a 10,8u e l'eroe a
   >=24,8u (72 campioni). Qui si rimisura in proprio, su molte scene, all'ISTANTE DELL'APERTURA e
   nei primi fotogrammi: distanza del pallone RESO (non quello logico: lezione del 7.795) dall'uomo
   piu' vicino dei nostri, dall'eroe, e dall'avversario piu' vicino.
   La domanda del player: quando si apre un'azione pericolosa, il pallone e' di qualcuno? */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const GI=(process.env.CPM_GI||'0,8,17,30,60,88,92,96,100,120,132,152,153,178,67').split(',').map(Number);
const ISTANTI=[0,300,700,1200];
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
await openMatch(page,port,{name:'Possesso'});
const R=[];
for(const gi of GI){
  try{await forceSituation(page,gi,{settle:60});}catch(_e){continue;}
  for(const t of ISTANTI){
    if(t)await sleep(t===300?300:400);
    const s=await page.evaluate(()=>{
      const st=window.__CPM_STATE&&window.__CPM_STATE();if(!st||!st.ball)return null;
      const B=st.ball;const d=(p)=>Math.hypot((p.x||50)-B.x,(p.y||50)-B.y);
      let nostro=1e9,avv=1e9;
      (st.players||[]).forEach(p=>{if(!p||p.gk)return;
        const v=d(p);if(p.team==='home'){if(v<nostro)nostro=v;}else if(v<avv)avv=v;});
      const eroe=st.hero?d(st.hero):null;
      return {bx:+B.x.toFixed(1),by:+B.y.toFixed(1),
              nostro:+nostro.toFixed(1),avv:+avv.toFixed(1),eroe:eroe==null?null:+eroe.toFixed(1)};});
    if(s)R.push({gi,t,...s});
  }
}
await ctx.close();await b.close();srv.close();
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return +w[Math.min(w.length-1,Math.floor(p*w.length))].toFixed(1);};
console.log('=== IL PALLONE E\' DI QUALCUNO, ALL\'APERTURA? ('+GI.length+' scene) ===');
console.log("  istante   n   nostro piu' vicino          eroe                  avversario   scene senza padrone");
ISTANTI.forEach(t=>{
  const A=R.filter(x=>x.t===t);if(!A.length)return;
  const N=A.map(x=>x.nostro),E=A.filter(x=>x.eroe!=null).map(x=>x.eroe),V=A.map(x=>x.avv);
  const senza=A.filter(x=>x.nostro>3.5).length;
  console.log('  '+String(t+'ms').padEnd(9)+String(A.length).padStart(3)
    +'   med '+String(q(N,0.5)).padStart(5)+' p90 '+String(q(N,0.9)).padStart(5)
    +'   med '+String(q(E,0.5)).padStart(5)+' p90 '+String(q(E,0.9)).padStart(5)
    +'   med '+String(q(V,0.5)).padStart(5)
    +'      '+senza+'/'+A.length+' ('+Math.round(100*senza/A.length)+'%)');
});
const AP=R.filter(x=>x.t===0);
console.log('\n  ALL\'APERTURA, scena per scena (soglia: oltre 3,5u il pallone non e\' ai piedi di nessuno):');
AP.forEach(x=>console.log('    gi'+String(x.gi).padStart(4)+'  pallone ('+x.bx+','+x.by+')'
  +'  nostro '+String(x.nostro).padStart(5)+'u  eroe '+String(x.eroe).padStart(5)+'u  avversario '+String(x.avv).padStart(5)+'u'
  +(x.nostro>3.5?'   ← SENZA PADRONE':'')
  +(x.avv<x.nostro?'   (l\'avversario e\' piu\' vicino del nostro)':'')));
const senza0=AP.filter(x=>x.nostro>3.5).length;
console.log('\n  '+senza0+' scene su '+AP.length+' aprono con il pallone di nessuno.');
console.log('  '+AP.filter(x=>x.avv<x.nostro).length+' scene aprono con un AVVERSARIO piu\' vicino al pallone di ogni nostro.');
