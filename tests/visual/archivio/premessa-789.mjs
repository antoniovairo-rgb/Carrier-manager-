/* [7.789 misura] QUALE PREMESSA E' DISPONIBILE NELLA PAUSA.
   La minaccia totale agli istanti in cui il cancello delle occasioni arriva vale mediana 25 e non
   supera mai 58: misurato, e non e' una taratura storta ma la definizione stessa di pausa. Qui si
   scompone. `zona` e `porta` pesano il 55% e dicono DOVE STA LA PALLA ADESSO — in pausa, lontano per
   forza. `spinta`, `sup`, `lib`, `noPress` dicono CHI STA MEGLIO, e non hanno bisogno che la palla sia
   gia' in area. Se una premessa credibile per far NASCERE l'occasione esiste, e' li'.
   Sola lettura. Partite intere, regime del gioco. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||3);const NOMI=(process.env.CPM_NOMI||'Pa,Pb,Pc').split(',');
const TUTTI=[];
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({a:window.__CPM_APRI789||null,occ:window.__CPM_OCC695||null}));
  const cmp=(r.a&&r.a.cmp)||[];
  TUTTI.push(...cmp);
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · arrivi al cancello '+((r.a&&r.a.qui)|0)
    +' · adv>=48 '+((r.a&&r.a.adv)|0)+' · minaccia>=58 '+((r.a&&r.a.thr)|0)+' · APRE '+((r.a&&r.a.apre)|0)
    +' · armate '+((r.occ&&r.occ.armate)|0));
  cmp.slice(0,12).forEach(c=>console.log("   "+String(c.m).padStart(2)+"'  thr "+String(c.t).padStart(2)
    +" | zona "+c.z.toFixed(2)+" porta "+c.p.toFixed(2)+" || spinta "+c.s.toFixed(2)+" lib "+c.l.toFixed(2)
    +" sup "+c.u.toFixed(2)+" noPress "+c.n.toFixed(2)));
  await ctx.close();
}
await b.close();srv.close();
console.log('');
console.log('=== '+N+' partite · '+TUTTI.length+' istanti di PAUSA al cancello ===');
const col=(k)=>TUTTI.map(c=>c[k]);
[['zona','z'],['porta','p'],['spinta','s'],['lib','l'],['sup','u'],['noPress','n']].forEach(([nome,k])=>{
  const v=col(k);
  console.log('  '+nome.padEnd(8)+' mediana '+q(v,0.5).toFixed(2)+' · p75 '+q(v,0.75).toFixed(2)+' · p90 '+q(v,0.90).toFixed(2)+' · max '+Math.max(...v).toFixed(2));
});
/* la PREMESSA: solo le parti che non chiedono la palla gia' in area, ripesate a somma 1 */
const prem=TUTTI.map(c=>Math.round(100*Math.min(1,Math.max(0,(0.40*c.s+0.30*c.l+0.20*c.u+0.10*c.n)))));
console.log('');
console.log('  PREMESSA (0.40 spinta + 0.30 lib + 0.20 sup + 0.10 noPress), 0-100:');
console.log('    mediana '+q(prem,0.5)+' · p25 '+q(prem,0.25)+' · p50 '+q(prem,0.5)+' · p75 '+q(prem,0.75)+' · p90 '+q(prem,0.90)+' · max '+Math.max(...prem));
[30,40,45,50,55,60].forEach(s=>{const n=prem.filter(x=>x>=s).length;
  console.log('    soglia '+s+' → '+n+'/'+prem.length+' istanti ('+(n/N).toFixed(1)+' per partita, PRIMA del cooldown 8\')');});
