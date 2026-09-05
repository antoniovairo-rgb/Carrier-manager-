/* [7.792 misura] «AZIONI MATEMATICHE E NON DI CALCIO VERO»: chi il racconto NOMINA sta dove manda la palla?
   Nota PO: «le azioni pericolose extra eroe continuano ad essere azioni "matematiche" e non di calcio
   vero, devono essere super credibili». La frequenza e' risolta (7.790: da 0,17 a 2,00 a partita); qui
   si misura la CREDIBILITA' di cio' che si vede.
   Il piano dell'occasione sceglie il protagonista a SORTEGGIO fra tutti i giocatori di movimento e manda
   il pallone su coordinate in scatola (84 → 93 → 96). Se il nominato e' lontano dal punto, il 7.642 fa
   decadere il portatore (oltre 12u) e la palla arriva SENZA PADRONE: e' il difetto che si vede.
   Si legge `__CPM_BEAT792`. Sola lettura, partite intere, regime del gioco. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc,Pa,Pb,Pc').split(',');
const SEMI=NOMI.map((_,g)=>9100+(g%3)*733);
const TUTTE=[],TOP=[];
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>({b:window.__CPM_BEAT792||[],occ:window.__CPM_OCC695||null,top:window.__CPM_TOP792||[]}));
  (r.top||[]).forEach(t=>TOP.push(t));
  const bb=(r.b||[]).filter(x=>x&&x.occ===1&&x.gk!==1&&x.d!=null);
  TUTTE.push(...bb);
  console.log('['+NOMI[g]+'] min '+min+' · occasioni armate '+((r.occ&&r.occ.armate)|0)+' · battute con un nominato '+bb.length);
  bb.slice(0,8).forEach(x=>console.log("      "+String(x.min).padStart(2)+"' battuta "+x.step
    +' · il nominato sta a ('+x.px+','+x.py+') · la palla va a ('+x.tx+','+x.ty+') · distanza '+x.d+'u'
    +(x.d>12?'  ← OLTRE 12u: il portatore DECADE, la palla arriva senza padrone':'')));
  await ctx.close();
}
await b.close();srv.close();
/* ⚠️ LA MISURA GIUSTA E' SOLO LA BATTUTA D'APERTURA, e la prima stesura sovracontava.
   Alla battuta 1 il nominato TIRA: che il pallone lo lasci e voli in porta e' calcio, non un difetto,
   quindi misurare li' la distanza uomo-pallone conta come errore proprio cio' che deve succedere.
   Il difetto vero e' il PASSAGGIO che atterra dove non c'e' nessuno: battuta 0. */
const APERTURA=TUTTE.filter(x=>x.step===0&&!x.tiro);
const D=APERTURA.map(x=>x.d);
const oltre=APERTURA.filter(x=>x.d>12).length;
console.log('');
console.log('=== '+NOMI.length+' partite · '+TUTTE.length+' battute · '+APERTURA.length+' battute D\'APERTURA (il passaggio) ===');
if(!D.length){console.log('  NESSUNA BATTUTA — misura mancata, non un verde.');process.exit(2);}
console.log('  APERTURA — distanza fra chi RICEVE e dove atterra il pallone:');
console.log('    mediana '+q(D,0.5)+'u · p25 '+q(D,0.25)+'u · p75 '+q(D,0.75)+'u · p90 '+q(D,0.90)+'u · max '+Math.max(...D)+'u');
console.log('  battute oltre le 12u (il portatore decade, palla senza padrone): '+oltre+'/'+TUTTE.length
  +'  ('+Math.round(100*oltre/TUTTE.length)+'%)');
if(TOP.length){
  const t1=TOP.map(t=>t.top[0]),t3=TOP.map(t=>t.top[2]!=null?t.top[2]:t.top[t.top.length-1]),md=TOP.map(t=>t.mediana);
  console.log('');
  console.log('  DOVE SONO I PIU\' AVANZATI quando l\'occasione nasce (avanzamento 0-100, 100 = porta avversaria):');
  console.log('    il piu\' avanzato: mediana '+q(t1,0.5)+' · p25 '+q(t1,0.25)+' · p75 '+q(t1,0.75)+' · max '+Math.max(...t1));
  console.log('    il terzo:         mediana '+q(t3,0.5)+' · p25 '+q(t3,0.25)+' · p75 '+q(t3,0.75));
  console.log('    la squadra:       mediana '+q(md,0.5));
  console.log('    ('+TOP.length+' occasioni costruite)');
}
const perStep={};TUTTE.forEach(x=>{(perStep[x.step]=perStep[x.step]||[]).push(x.d);});
Object.keys(perStep).sort().forEach(k=>{const v=perStep[k];
  console.log('    battuta '+k+': '+v.length+' casi · mediana '+q(v,0.5)+'u · oltre 12u '+v.filter(d=>d>12).length
    +(k==='1'?'   (e\' il TIRO: qui la distanza non e\' un difetto, il pallone deve lasciare il piede)':''));});
const TIRI=TUTTE.filter(x=>x.tiro===1&&x.tiroDa!=null).map(x=>x.tiroDa);
if(TIRI.length){console.log('');
  console.log('  DA DOVE SI TIRA (avanzamento 0-100): mediana '+q(TIRI,0.5)+' · p25 '+q(TIRI,0.25)+' · p75 '+q(TIRI,0.75));
  const area=TIRI.filter(v=>v>=82).length,lim=TIRI.filter(v=>v>=70&&v<82).length,lon=TIRI.filter(v=>v<70).length;
  console.log('    in area '+area+' · dal limite '+lim+' · da fuori '+lon+'  (le parole della battuta seguono questa zona)');}
console.log('');
console.log((D.length&&oltre===0)?'  VERDE — il passaggio d\'apertura arriva sempre su un uomo.':'  '+oltre+' aperture su '+D.length+' atterrano dove il ricevente non c\'e\'.');
