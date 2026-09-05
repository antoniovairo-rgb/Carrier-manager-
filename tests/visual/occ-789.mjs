/* [7.789 censimento] QUANTE AZIONI PERICOLOSE EXTRA-EROE SI VEDONO, E QUANTE SE NE RACCONTANO.
   Nota PO: «le azioni pericolose extra eroe continuano ad essere azioni "matematiche" e non di calcio
   vero, devono essere super credibili e sono anche rarissime. A volte la telecronaca scritta racconta
   azioni importanti ma non si vedono».
   Due affermazioni separabili e misurabili:
   (1) RARISSIME — il registro `__CPM_OCC695G` conta i giri del cancello delle occasioni e i motivi per
       cui non si aprono; `__CPM_OCC695` conta quelle ARMATE davvero.
   (2) RACCONTATE MA NON VISTE — le righe di cronaca che descrivono un fatto pericoloso (tiro, parata,
       occasione, palo, gol) contro le occasioni effettivamente MOSTRATE in 3D e i gol accreditati.
   Sola lettura, partite intere, regime del gioco (__CPM_PRESENT). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||3);const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc').split(',');
const RIGHE=[],OCC=[],GOL=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  const ev=[];let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    const c=await page.evaluate(()=>{const e=(window.__CPM_EV&&window.__CPM_EV())||[];if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();return e;});
    ev.push(...c);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({occ:window.__CPM_OCC695||null,g:window.__CPM_OCC695G||null,a:window.__CPM_APRI789||null,
    ms:(window.__CPM_MS&&window.__CPM_MS())||null}));
  const cro=ev.filter(e=>e.ev==='chronicle');
  /* la riga «pericolosa»: parla di una conclusione, di una parata, di un'occasione o di un gol */
  const PER=/tir[oa]|conclu|parat|portiere|palo|traversa|occasion|gol|rete|incorn|colpo di testa|a botta sicura|solo davanti/i;
  const per=cro.filter(e=>PER.test(String(e.txt||'')));
  const gl=ev.filter(e=>e.ev==='goal');
  RIGHE.push({n:cro.length,per:per.length});
  OCC.push(r.occ||{});GOL.push(gl.length);
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · tabellone '+(r.ms&&r.ms.score?r.ms.score.h+'-'+r.ms.score.a:'?'));
  console.log('   righe di cronaca '+cro.length+' · di cui PERICOLOSE (raccontano un fatto) '+per.length);
  console.log('   registro occasioni GREZZO: '+JSON.stringify(r.occ));/* [7.789] letto male una volta oggi: qui si stampa l'oggetto, non la mia interpretazione */
  console.log('   occasioni ARMATE in 3D: '+((r.occ&&r.occ.armate)|0)+' · parate mostrate '+((r.occ&&r.occ.parate)|0)+' · cedute a un gol '+((r.occ&&r.occ.cedute)|0));
  console.log('   cancello VECCHIO (conta il dado del 7.714, non la regola di oggi): '+JSON.stringify(r.g));
  if(r.a){const A=r.a;const med=(v)=>{const w=v.slice().sort((x,y)=>x-y);return w.length?w[w.length>>1]:'-';};
    console.log('   cancello VERO: arrivi '+A.qui+' · avanzamento>=48 '+A.adv+' · minaccia>=58 '+A.thr+' · picco ricordato '+A.picco+' · APRE '+A.apre+' · piano prodotto '+A.piano);
    console.log('      picco visto agli arrivi: '+JSON.stringify((A.pk||[]).slice(0,8)));console.log('      avanzamento agli arrivi: mediana '+med(A.advV)+' · minaccia: mediana '+med(A.thrV));}
  per.slice(0,6).forEach(x=>console.log("      "+String(x.min).padStart(2)+"'  "+String(x.txt||'').slice(0,72)));
  await ctx.close();
}
await b.close();srv.close();
const tp=RIGHE.reduce((s,x)=>s+x.per,0),tc=RIGHE.reduce((s,x)=>s+x.n,0);
const ta=OCC.reduce((s,x)=>s+((x.armate)|0),0);
console.log('');
console.log('=== '+N+' partite intere ===');
console.log('righe di cronaca per partita: '+(tc/N).toFixed(1));
console.log('righe che RACCONTANO un fatto pericoloso: '+(tp/N).toFixed(1)+' a partita  (totale '+tp+')');
console.log('occasioni MOSTRATE in 3D: '+(ta/N).toFixed(1)+' a partita  (totale '+ta+')');
console.log('gol accreditati per partita: '+(GOL.reduce((s,x)=>s+x,0)/N).toFixed(1));
console.log('rapporto raccontate/mostrate: '+(ta?(tp/ta).toFixed(1):'∞')+' a 1');
