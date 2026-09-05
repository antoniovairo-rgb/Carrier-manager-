/* [7.790 misura appaiata] L'OCCASIONE PERICOLOSA EXTRA-EROE: QUANTE SE NE VEDONO.
   Nota PO: «le azioni pericolose extra eroe ... sono anche rarissime. A volte la telecronaca scritta
   racconta azioni importanti ma non si vedono».
   Verde e rosso (__CPM_NO790) sugli STESSI sei mondi: stesso seme, stesso nome, stessa partita — la
   sola differenza e' la premessa del cancello. Si contano: occasioni ARMATE in 3D, gol accreditati,
   righe di cronaca che raccontano un fatto pericoloso, e il rapporto raccontate/mostrate.
   Partite intere, regime del gioco (__CPM_PRESENT). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc,Pa,Pb,Pc').split(',');
const SEMI=NOMI.map((_,g)=>9100+(g%3)*733);
const PER=/tir[oa]|conclu|parat|portiere|palo|traversa|occasion|gol|rete|incorn|colpo di testa|a botta sicura|solo davanti/i;
const R={verde:[],rosso:[]};
async function partita(rosso,g){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((ro)=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;if(ro)window.__CPM_NO790=1;},rosso);
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  const ev=[];let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    const c=await page.evaluate(()=>{const e=(window.__CPM_EV&&window.__CPM_EV())||[];if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();return e;});
    ev.push(...c);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({occ:window.__CPM_OCC695||null,a:window.__CPM_APRI789||null,ms:(window.__CPM_MS&&window.__CPM_MS())||null}));
  const cro=ev.filter(e=>e.ev==='chronicle');
  const out={n:NOMI[g],min,
    armate:((r.occ&&r.occ.armate)|0),parate:((r.occ&&r.occ.parate)|0),cedute:((r.occ&&r.occ.cedute)|0),
    qui:((r.a&&r.a.qui)|0),adv:((r.a&&r.a.adv)|0),thr:((r.a&&r.a.thr)|0),prem:((r.a&&r.a.prem)|0),apre:((r.a&&r.a.apre)|0),piano:((r.a&&r.a.piano)|0),
    gol:ev.filter(e=>e.ev==='goal').length,per:cro.filter(e=>PER.test(String(e.txt||''))).length,cro:cro.length,
    score:(r.ms&&r.ms.score)?(r.ms.score.h+'-'+r.ms.score.a):'?',
    minuti:((r.occ&&r.occ.min)||[]).slice(0,8)};
  await ctx.close();return out;
}
for(const rosso of [false,true]){
  const et=rosso?'rosso':'verde';
  for(let g=0;g<NOMI.length;g++){
    const o=await partita(rosso,g);R[et].push(o);
    console.log('['+et+'] '+o.n+' min '+o.min+' · tabellone '+o.score
      +' · ARMATE '+o.armate+' (min '+JSON.stringify(o.minuti)+') · parate '+o.parate+' · cedute '+o.cedute
      +' · gol '+o.gol+' · righe pericolose '+o.per);
    console.log('        cancello: arrivi '+o.qui+' · adv>=48 '+o.adv+' · minaccia>=58 '+o.thr+' · PREMESSA>=75 '+o.prem+' · APRE '+o.apre+' · piano '+o.piano);
  }
}
await b.close();srv.close();
const S=(a,k)=>a.reduce((s,x)=>s+x[k],0);
console.log('');
console.log('=== '+NOMI.length+' mondi identici · verde contro rosso (__CPM_NO790) ===');
const riga=(k,et)=>(S(R[et],k)/NOMI.length).toFixed(2);
[['armate','occasioni MOSTRATE in 3D'],['parate','parate mostrate'],['gol','gol accreditati'],
 ['per','righe che raccontano un fatto pericoloso'],['apre','aperture del cancello'],['piano','piani prodotti']]
 .forEach(([k,d])=>console.log('  '+d.padEnd(42)+' verde '+riga(k,'verde').padStart(6)+'   rosso '+riga(k,'rosso').padStart(6)+'   (a partita)'));
const av=S(R.verde,'armate'),ar=S(R.rosso,'armate');
console.log('');
console.log('  occasioni MOSTRATE, totale: verde '+av+'  ·  rosso '+ar);
console.log('  rapporto raccontate/mostrate: verde '+(av?(S(R.verde,'per')/av).toFixed(1):'∞')+' a 1  ·  rosso '+(ar?(S(R.rosso,'per')/ar).toFixed(1):'∞')+' a 1');
console.log('  gol a partita: verde '+riga('gol','verde')+'  ·  rosso '+riga('gol','rosso')+'  (l\'autorita\' del punteggio e\' il microsim: se cambia, e\' una regressione)');
