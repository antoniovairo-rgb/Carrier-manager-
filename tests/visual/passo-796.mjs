/* [7.796 censimento] CHI GOVERNA IL BLOCCO SQUADRA: il bersaglio o il PASSO?
   Il 7.703 aveva alzato del 37% il termine che tira gli slot verso il pallone e non aveva mosso niente
   («la manopola non e' collegata al volante»), chiedendo a verbale questo censimento. Qui si legge
   `__CPM_K796`: la distribuzione del passo `k` con cui ogni corpo colma la distanza dal proprio
   bersaglio, e quanto quella distanza vale davvero. Se il passo e' 0,03-0,04, per colmare venti unita'
   servono cinquanta tick — e il pallone nel frattempo si e' gia' spostato: il bersaglio non conta.
   Sola lettura, partite intere, regime del gioco. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc').split(',');
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
const TUTTI={};let dSum=0,dN=0;const DV=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+(g%3)*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>window.__CPM_K796||null);
  if(r){Object.entries(r.perK||{}).forEach(([k,v])=>{TUTTI[k]=(TUTTI[k]|0)+v;});
    dSum+=r.dSum||0;dN+=r.dN||0;(r.dV||[]).forEach(x=>DV.push(x));
    console.log('['+NOMI[g]+'] min '+min+' · campioni '+r.n+' · distanza media dal bersaglio '+((r.dSum/Math.max(1,r.dN)).toFixed(1))+'u');}
  await ctx.close();
}
await b.close();srv.close();
const tot=Object.values(TUTTI).reduce((a,c)=>a+c,0);
console.log('');
console.log('=== '+NOMI.length+' partite · '+tot+' campioni giocatore-tick ===');
console.log('  IL PASSO `k` con cui il corpo colma la distanza dal bersaglio:');
Object.entries(TUTTI).sort((a,c)=>c[1]-a[1]).slice(0,8).forEach(([k,v])=>{
  const perc=(100*v/tot).toFixed(1);
  const tick=(Math.log(0.1)/Math.log(1-(+k||0.0001)));
  console.log('    k='+k+'  →  '+String(v).padStart(7)+' campioni ('+perc+'%)'
    +'   per colmare il 90% della distanza servono '+(isFinite(tick)?Math.round(tick):'?')+' tick'
    +(isFinite(tick)?'  ≈ '+(tick*0.55).toFixed(1)+' s di gioco':''));
});
console.log('');
console.log('  DISTANZA dal bersaglio: media '+(dSum/Math.max(1,dN)).toFixed(1)+'u · mediana '+q(DV,0.5)
  +'u · p75 '+q(DV,0.75)+'u · p90 '+q(DV,0.90)+'u · max '+Math.max(...DV)+'u');
console.log('  (se la distanza resta grande a passo piccolo, il bersaglio non governa niente: e\' il PASSO)');
