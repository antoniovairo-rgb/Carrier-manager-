/* [7.787 misura] IL PALLONE MENTRE IL GIOCATORE SCEGLIE.
   Il codice 001 del PO dice «all'apertura il pallone non e' ai piedi di nessuno». La prima misura era
   viziata: la sonda risolveva l'azione dopo mezzo secondo, quindi la finestra del rilevatore cadeva
   DENTRO la cinematica, dove un pallone in volo e' legittimamente lontano da tutti. Il PO invece il
   001 lo vede mentre SCEGLIE — la fase interattiva, che dura quanto ci mette lui.
   Qui la scena si apre e NON si risolve: si guarda la custodia del pallone per sei secondi di fase
   interattiva. `md` e' la distanza del compagno piu' vicino dal pallone, campione per campione.
   Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const PASSO=+(process.env.CPM_PASSO||5);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage({viewport:{width:412,height:915}});
await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:800);
const tot=await page.evaluate(()=>window.__CPM_SITS.length);
/* [7.788] CPM_GI accetta una lista esplicita: il censimento a passo fisso saltava proprio le
   scene che il PO ha segnalato (gi17 e gi87 non cadono su un multiplo di 6). Un campione regolare non
   e' un campione rappresentativo. */
const GIs=process.env.CPM_GI?process.env.CPM_GI.split(',').map(Number):(()=>{const o=[];for(let i=0;i<tot;i+=PASSO)o.push(i);return o;})();
const R=[];
for(const gi of GIs){
  await page.evaluate(g=>{try{window.__CPM_RESEED&&window.__CPM_RESEED(g);}catch(e){}},gi);/* [7.788] ripetibilita': ogni scena parte dallo stesso dado, come fa il gate */
  let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue;
  await sleep(300);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});
  await sleep(6000);/* sei secondi di FASE INTERATTIVA: la scena resta aperta, nessuno risolve */
  const o=await page.evaluate(()=>{
    const snap=window.__CPM_WATCH_SNAP&&window.__CPM_WATCH_SNAP();
    if(!snap||!snap.samples||!snap.samples.length)return null;
    const S=snap.samples;const ks=S.map(s=>s.sk).filter(k=>k!=null&&k>=0);
    if(!ks.length)return null;
    const k=Math.max(...ks);const W=S.filter(s=>s.sk===k);
    if(W.length<6)return null;
    const t0=W[0].t;const ph=(window.__CPM_PHASE&&window.__CPM_PHASE())||null;
    /* ⚠️ `md` (il testimone del gioco) ESCLUDE L'EROE per costruzione (src/12 r.1902: `pp.mesh===hero`
       viene saltato). Misurare solo quello significava chiamare «pallone abbandonato» una palla che
       stava ai piedi del protagonista: prima passata 7,5u di mediana e 27 scene su 32 «oltre soglia»,
       un numero che non voleva dire niente. Qui la custodia e' la distanza del PIU' VICINO FRA TUTTI —
       eroe compreso — che e' la cosa che il PO guarda. */
    const d=W.map(q=>{const m=(q.md==null||q.md<0)?null:q.md;
      const h=(q.hx==null)?null:Math.hypot(q.x-q.hx,(q.z||0)-(q.hz==null?(q.z||0):q.hz));
      const best=(m==null)?h:(h==null?m:Math.min(m,h));
      /* [7.788] il bit 16 di `f` e' la MASCHERA DI TAGLIO (stessa finestra del mask, src/12 r.1931):
         se il transitorio d'apertura cade sotto lo stacco nero, non e' un difetto che si vede; se cade
         a scena scoperta, e' esattamente il codice 001 del PO. */
      return{s:+((q.t-t0)/1000).toFixed(1),d:best==null?null:+best.toFixed(1),h:h==null?null:+h.toFixed(1),m:m==null?null:+m.toFixed(1),cut:((q.f|0)&16)?1:0};}).filter(x=>x.d!=null);
    const vals=d.map(x=>x.d).sort((a,c)=>a-c);
    const hv=d.map(x=>x.h).filter(x=>x!=null).sort((a,c)=>a-c);
    return{n:W.length,ph,med:vals.length?vals[vals.length>>1]:null,min:vals.length?vals[0]:null,max:vals.length?vals[vals.length-1]:null,
      medEroe:hv.length?hv[hv.length>>1]:null,sopra35:d.filter(x=>x.d>3.5).length,tot:d.length,tr:d.slice(0,14)};
  });
  if(!o)continue;
  R.push({gi,...o});
  console.log('#'+gi+'  fase '+(o.ph||'?')+'  custodia mediana '+o.med+'u (eroe '+o.medEroe+'u)  (min '+o.min+' max '+o.max+')  oltre 3,5u: '+o.sopra35+'/'+o.tot);
  if(o.tr)console.log('       traccia (s:tutti/eroe/stacco) '+o.tr.map(x=>x.s+':'+x.d+'/'+x.h+(x.cut?'/STACCO':'/scoperta')).join(' '));
  if(o.scop!=null)console.log('       campioni con eroe oltre 3,5u A SCENA SCOPERTA: '+o.scop+'  ·  sotto lo stacco: '+o.sott);
}
await b.close();srv.close();
const med=R.map(r=>r.med).filter(x=>x!=null).sort((a,c)=>a-c);
const abb=R.filter(r=>r.tot&&r.sopra35/r.tot>=0.75).length;
console.log('');
console.log('=== '+R.length+' scene in FASE INTERATTIVA (GLB '+(GLB?'ON':'OFF')+') ===');
console.log('custodia mediana fra le scene (il piu vicino FRA TUTTI, eroe compreso): '+(med.length?med[med.length>>1]:'-')+'u');
const mh=R.map(r=>r.medEroe).filter(x=>x!=null).sort((a,c)=>a-c);
console.log('distanza mediana dell EROE dal pallone: '+(mh.length?mh[mh.length>>1]:'-')+'u');
console.log('scene col pallone oltre 3,5u dal compagno piu vicino per >=75% dei campioni: '+abb+'/'+R.length);
console.log('riferimento: nel calcio vero, mentre il gioco e fermo e tu scegli, il pallone e ai piedi di qualcuno (<=1,5-2u)');
