/* [7.788 misura] QUANDO ARRIVA IL MONDO DELLA SCENA, IN PARTITA VERA.
   Il codice 001 del PO ha una firma precisa: nel primo mezzo secondo, senza stacco, nessuno entro 3,5u
   dal pallone (11 scene su 39 nel regime giusto, fino a 27,7u). E il ri-snap del 7.401 scatta sempre,
   ma su scene FORZATE arriva a 1-2,5 s dal taglio.
   Quel ritardo pero' potrebbe essere la struttura della sonda: forzo, aspetto, sghiaccio. Oggi il
   regime forzato mi ha ingannato tre volte sullo stesso difetto, e una quarta sul cross. Qui si lascia
   giocare la partita da sola e si legge lo stesso testimone (`__CPM_STG456`, campo `dt`: i millisecondi
   fra il taglio di scena e l'arrivo dello staging). Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||2);const NOMI=(process.env.CPM_NOMI||'Sa,Sb,Sc').split(',');
const TUTTI=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;
    window.__CPM_PRESENT=1;/* senza questo lo snap e' spento: src/12 r.4480 */},{glb:GLB});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({stg:window.__CPM_STG456||[],rs:window.__CPM_RSNP401||[]}));
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · cambi di staging '+r.stg.length+' · ri-snap '+r.rs.length);
  r.stg.slice(0,10).forEach(x=>console.log('    scena '+x.k+' fase '+x.ph+' · '+x.dt+'ms dal taglio · lontani '+x.far+'/'+x.n+' · max '+x.dmax+'u · taglio armato: '+(x.snap?'si':'no')));
  TUTTI.push(...r.stg);
  await ctx.close();
}
await b.close();srv.close();
const dts=TUTTI.map(x=>x.dt).filter(x=>x!=null).sort((a,c)=>a-c);
const q=(v,p)=>v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:'-';
console.log('');
console.log('=== '+TUTTI.length+' cambi di staging in '+N+' partite intere ===');
console.log('ritardo fra il taglio di scena e l arrivo dello staging: mediana '+q(dts,0.5)+'ms · p90 '+q(dts,0.9)+'ms · max '+q(dts,1)+'ms');
console.log('cambi entro 500ms dal taglio (cioe dentro la finestra dove il PO vede il difetto): '+dts.filter(x=>x<=500).length+'/'+dts.length);
const far=TUTTI.map(x=>x.dmax).filter(x=>x!=null).sort((a,c)=>a-c);
console.log('distanza del piu lontano dal suo bersaglio allo staging: mediana '+q(far,0.5)+'u · max '+q(far,1)+'u');
