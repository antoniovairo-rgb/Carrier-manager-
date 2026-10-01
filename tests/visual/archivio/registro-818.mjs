/* [CENSIMENTO 818] IL REGISTRO DEGLI ARCHI DI CRONACA. Che cosa arriva al renderer riga per riga,
   e che cosa viene ACCETTATO. Due partite bastano: qui non si stimano quantili, si legge un elenco. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0;
  for(let k=0;k<3400;k++){await sleep(200);
    const m=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    clock=m;if(clock>=89)break;}
  const d=await page.evaluate(()=>({reg:window.__CPM_ARCREG||[],beat:window.__CPM_BEAT792||[],scart:window.__CPM_ARCSCART|0}));
  await ctx.close();
  const R=d.reg,B=d.beat.filter(x=>x&&x.occ);
  console.log('\n=== '+NOMI[g]+' — righe di cronaca con un tipo d\'arco: '+R.length+'  · accettate '+R.filter(x=>x.preso).length+'  · buttate '+d.scart);
  const perTipo={};R.forEach(x=>{const k=x.ty||'?';perTipo[k]=perTipo[k]||{n:0,ok:0};perTipo[k].n++;if(x.preso)perTipo[k].ok++;});
  Object.entries(perTipo).forEach(([k,v])=>console.log('    '+k.padEnd(8)+' arrivate '+String(v.n).padStart(3)+'  accettate '+String(v.ok).padStart(3)+'  ('+Math.round(100*v.ok/v.n)+'%)'));
  console.log('    battute d\'occasione: '+B.length+'  ai minuti '+B.map(x=>x.min).join(','));
  const t0=R.length?R[0].t:0;
  console.log('    prime 40 righe (dt dalla prima, tipo, bersaglio x, arco vivo?, presa?):');
  R.slice(0,40).forEach(x=>console.log('      +'+String(((x.t-t0)/1000).toFixed(1)).padStart(6)+'s  '+String(x.ty||'?').padEnd(7)+
    ' -> x '+String(x.ex).padStart(5)+'   vivo '+x.vivo+'  presa '+x.preso+'   pallone a '+x.bx));
}
await b.close();srv.close();
