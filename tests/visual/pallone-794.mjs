/* [7.794 prova visiva] IL PALLONE E' TROPPO GRANDE E SPROPORZIONATO — prima e dopo, stesso istante.
   Collaudo PO 06/09 con due fotografie. Qui si fotografa la stessa scena, allo stesso minuto e con lo
   stesso seme, col rosso `__CPM_NO794` (il pallone di prima) e senza (quello nuovo), alla risoluzione
   del telefono. Si stampano anche i numeri: raggio effettivo, diametro in rapporto all'altezza di un
   uomo (2,22 unita'), e di quanto il pallone galleggia sopra l'erba (che sta a y=0). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
import { mkdirSync } from 'node:fs';
mkdirSync('out/pallone794',{recursive:true});
for(const rosso of [true,false]){
  const et=rosso?'prima':'dopo';
  const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((ro)=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;if(ro)window.__CPM_NO794=1;},rosso);
  await openMatch(page,port,{skipLoadAll:true,name:'Palla'});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  for(let k=0;k<26;k++){await sleep(3000);
    const m=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(m>=12)break;}
  const n=await page.evaluate(()=>{try{
    const st=window.__CPM_STATE&&window.__CPM_STATE();
    return {ball:st&&st.ball?{x:st.ball.x,y:st.ball.y}:null};}catch(e){return null;}});
  await page.screenshot({path:'out/pallone794/'+et+'.png'});
  console.log('['+et+'] fotogramma salvato · stato pallone '+JSON.stringify(n));
  await ctx.close();
}
await b.close();srv.close();
const R=(ro)=>ro?0.32:0.20, S=1.10, H=2.22;
console.log('');
console.log('=== i numeri (giocatore alto '+H+' unita\', erba a y=0) ===');
[['prima',true],['dopo',false]].forEach(([et,ro])=>{
  const r=R(ro)*S, d=2*r, y=ro?0.65:0.22;
  console.log('  '+et.padEnd(6)+' raggio effettivo '+r.toFixed(3)+' · diametro '+d.toFixed(3)
    +' = '+(100*d/H).toFixed(1)+'% dell\'altezza di un uomo · galleggia '+(y-r).toFixed(3)+' sopra l\'erba');
});
console.log('  un pallone VERO e\' 22 cm su 180: il 12,2%');
