/* [7.788 misura] DOVE ATTERRA IL CROSS, E CHI C'E'.
   Nota PO sulla 7.787, SIT #87 «Cross di prima senza guardare!», esito chance RIUSCITA, bozza
   automatica: «codice 001 MISURATO — compagno più vicino 9.9u, eroe ≥41.2u per 74 campioni».
   Che l'eroe stia a 41u e' calcio giusto: ha crossato dalla fascia e resta li'. Il numero che non torna
   e' l'altro: 9,9 unita' dal compagno piu' vicino. Un cross che produce un'OCCASIONE deve trovare un
   uomo; se il piu' vicino sta a dieci metri, il pallone e' stato mandato a un PUNTO — lo stesso difetto
   che il 7.464 ha gia' chiuso sul passaggio («il pallone va a un uomo, non a un punto») e che sul cross
   non e' mai stato guardato.
   Qui si forzano le scene di cross, si risolve l'azione di cross, e si misura per quattro secondi la
   distanza fra il pallone e il nostro piu' vicino ESCLUSO l'eroe (`md`, il testimone del gioco: qui
   escludere l'eroe e' giusto, perche' e' lui che ha crossato). Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, forceSituation } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage({viewport:{width:412,height:915}});
await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;window.__CPM_REALWAIT=true;
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:900);
/* tutte le situation il cui intento e' `cross`: la famiglia che il PO ha segnalato due volte in una partita */
const CROSS=process.env.CPM_GI?process.env.CPM_GI.split(',').map(Number)
  :await page.evaluate(()=>{const o=[];window.__CPM_SITS.forEach((s,i)=>{try{if(window.deriveIntent(s)==='cross')o.push(i);}catch(e){}});return o;});
console.log('scene di cross: '+CROSS.length);
const R=[];
for(const gi of CROSS){
  /* ⚠️ [7.788] LA SONDA NON ERA RIPETIBILE, e me ne sono accorto solo confrontando quattro passate
     sulla stessa domanda: 10, 12, 9 e 6 cross su 24 «senza nessuno entro 3,5u» con lo stesso codice.
     Ogni scena forzata partiva dallo stato lasciato dalla precedente, quindi le posizioni dei ventidue
     si accumulavano diversamente a ogni giro e il rumore era piu' grande dell'effetto che volevo
     misurare. Il gate fa la cosa giusta da sempre: `__CPM_RESEED(gi)` prima di ogni forzatura, cosi'
     ogni scena parte dallo stesso dado. Senza questa riga qualunque confronto verde/rosso qui e' una
     moneta lanciata. */
  await page.evaluate(g=>{try{window.__CPM_RESEED&&window.__CPM_RESEED(g);}catch(e){}},gi);
  let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue;
  await sleep(600);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});
  await sleep(250);
  let r=false;try{r=await page.evaluate(()=>{window.__CPM_FORCE_OUTCOME='success';return window.__CPM_RESOLVE(0);});}catch(e){}
  if(!r)continue;
  await sleep(GLB?6000:4200);
  const o=await page.evaluate(()=>{
    const snap=window.__CPM_WATCH_SNAP&&window.__CPM_WATCH_SNAP();
    if(!snap||!snap.samples||!snap.samples.length)return null;
    const S=snap.samples;const ks=S.map(s=>s.sk).filter(k=>k!=null&&k>=0);
    if(!ks.length)return null;
    const k=Math.max(...ks);const W=S.filter(s=>s.sk===k);
    if(W.length<6)return null;
    const t0=W[0].t;
    /* la CODA della scena: dove il cross e' atterrato e chi c'era, non l'istante della battuta */
    const coda=W.filter(q=>(q.t-t0)>1200);
    const md=coda.map(q=>(q.md==null||q.md<0)?null:q.md).filter(x=>x!=null);
    const vals=md.slice().sort((a,c)=>a-c);
    const out=window.__CPM_OUTCOME;
    return{n:W.length,nc:coda.length,min:vals.length?+vals[0].toFixed(1):null,
      med:vals.length?+vals[vals.length>>1].toFixed(1):null,key:(out&&out.outKey)||null};
  });
  if(!o)continue;
  R.push({gi,...o});
  console.log('#'+gi+'  esito '+(o.key||'?')+'  ·  compagno piu vicino al pallone dopo il cross: minimo '+o.min+'u, mediana '+o.med+'u');
  await sleep(500);
}
const C=await page.evaluate(()=>window.__CPM_CROSS788||null);
console.log('aggancio del bersaglio (7.788): '+JSON.stringify(C));
await b.close();srv.close();
const mins=R.map(r=>r.min).filter(x=>x!=null).sort((a,c)=>a-c);
const lontani=R.filter(r=>r.min!=null&&r.min>3.5).length;
console.log('');
console.log('=== '+R.length+' cross (GLB '+(GLB?'ON':'OFF')+') ===');
console.log('distanza MINIMA fra pallone e compagno dopo il cross: mediana '+(mins.length?mins[mins.length>>1]:'-')+'u · p90 '+(mins.length?mins[Math.floor(mins.length*0.9)]:'-')+'u · max '+(mins.length?mins[mins.length-1]:'-')+'u');
console.log('cross in cui NESSUN compagno arriva entro 3,5u: '+lontani+'/'+R.length);
console.log('riferimento: un cross che produce un occasione deve trovare un uomo; il PO ha misurato 9,9u sulla SIT #87');
