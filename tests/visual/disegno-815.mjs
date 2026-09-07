/* [CENSIMENTO 815 · nota PO 07/09] «LE AZIONI PERICOLOSE EXTRA EROE SONO RARE E DISEGNATE MALE».
   Prima di toccare qualunque cosa: che cosa MOSTRA davvero un'azione pericolosa extra-eroe?
   Il piano (`_pianoOcc695`) ha tre battute — apertura, tiro, parata — e ognuna DICHIARA un punto
   d'arrivo del pallone (tx,ty nel registro __CPM_BEAT792). Qui si guarda se il pallone RESO —
   l'unico che il giocatore guarda — ci arriva davvero, quanto ci mette, e con che strappi.
   Si legge col campionatore LEGGERO __CPM_OWN (__CPM_STATE costa ~530 ms a lettura, nota 7.343).
   Banco tarato: __CPM_SCMS681 in scala col tick (regola del 06/09). Sola lettura, nessun rimedio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db,Dc,Dd,De,Df').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617);
const FINESTRA=2600;/* ms concessi al pallone per arrivare dove la battuta l'ha mandato */
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const TUTTE=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0,visti=0,prec=null;
  const aperte=[],battute=[];
  for(let k=0;k<3400;k++){
    await sleep(90);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const own=window.__CPM_OWN&&window.__CPM_OWN();
      const B=window.__CPM_BEAT792||[];
      return {t:Date.now(),min:ms?(ms.min|0):0,x:own?own.x:null,y:own?own.y:null,padrone:own?own.d:null,
              n:B.length,coda:B.slice(-5)};});
    if(!s)continue;clock=s.min;
    if(s.x!=null){
      const dt=prec?Math.max(1,s.t-prec.t):0;
      const dd=prec?Math.hypot(s.x-prec.x,s.y-prec.y):0;
      const vel=prec?dd/(dt/1000):0;
      for(let j=aperte.length-1;j>=0;j--){const a=aperte[j];
        if(vel>a.vel)a.vel=Math.round(vel);
        const d=Math.hypot(s.x-a.tx,s.y-a.ty);
        if(d<a.dist){a.dist=+d.toFixed(1);a.ritardo=s.t-a.t0;a.padrone=s.padrone;}
        if(s.t>a.t0+FINESTRA)aperte.splice(j,1);}
      prec={x:s.x,y:s.y,t:s.t};
    }
    if(s.n>visti){
      const q=Math.min(s.n-visti,s.coda.length);
      const nuove=s.coda.slice(s.coda.length-q);visti=s.n;
      nuove.forEach(bt=>{ if(!bt||!bt.occ)return;
        const a={t0:Date.now(),minuto:bt.min,step:bt.step|0,tx:bt.tx,ty:bt.ty,gk:bt.gk|0,tiro:bt.tiro|0,
                 tiroDa:bt.tiroDa,dNom:bt.d,px:bt.px,dist:99,ritardo:null,vel:0,padrone:null,
                 partita:NOMI[g]};
        aperte.push(a);battute.push(a);});
    }
    if(clock>=89)break;}
  await ctx.close();
  battute.forEach(a=>TUTTE.push(a));
  const occ=new Set(battute.map(a=>a.minuto+'|'+(a.step===0?a.minuto:'')));
  console.log('  '+NOMI[g]+': battute d\'occasione '+battute.length+'  (aperture '+battute.filter(a=>a.step===0).length+')');
}
await b.close();srv.close();
const P=(a)=>a.length?a.slice().sort((u,v)=>u-v):[0];
const q=(a,p)=>{const s=P(a);return +s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(1);};
const ap=TUTTE.filter(a=>a.step===0),ti=TUTTE.filter(a=>a.step===1),pa=TUTTE.filter(a=>a.step===2);
console.log('\n=== CHE COSA MOSTRA UN\'AZIONE PERICOLOSA EXTRA-EROE ('+NOMI.length+' partite) ===');
console.log('  aperture '+ap.length+'  ·  tiri '+ti.length+'  ·  parate '+pa.length);
console.log('  occasioni a partita (aperture)  '+(ap.length/NOMI.length).toFixed(2));
console.log('  ARRIVANO AL TIRO   '+ti.length+'/'+ap.length+'   ('+(ap.length?Math.round(100*ti.length/ap.length):0)+'%)');
console.log('  ARRIVANO ALLA PARATA '+pa.length+'/'+ap.length+' ('+(ap.length?Math.round(100*pa.length/ap.length):0)+'%)');
const riga=(nome,A)=>{ if(!A.length){console.log('  '+nome+': nessuna');return;}
  const D=A.map(a=>a.dist),V=A.map(a=>a.vel);
  const arrivate=A.filter(a=>a.dist<=6).length;
  console.log('  '+nome.padEnd(9)+' il pallone ARRIVA (<=6u) '+arrivate+'/'+A.length+
    '  · distanza minima mediana '+q(D,0.5)+'u  p90 '+q(D,0.9)+'u  max '+q(D,1)+'u'+
    '  · strappo max mediano '+q(V,0.5)+' u/s  p90 '+q(V,0.9));};
riga('apertura',ap);riga('tiro',ti);riga('parata',pa);
const conTiro=ti.filter(a=>a.tiroDa!=null);
if(conTiro.length){const Z=conTiro.map(a=>a.tiroDa);
  console.log('\n  ZONA DA CUI SI TIRA (avanzamento dichiarato): mediana '+q(Z,0.5)+'  p10 '+q(Z,0.1)+'  p90 '+q(Z,0.9));
  console.log('  area (>=82) '+Z.filter(v=>v>=82).length+'/'+Z.length+
              '  · limite (70-82) '+Z.filter(v=>v>=70&&v<82).length+
              '  · lontano (<70) '+Z.filter(v=>v<70).length);}
console.log('\n  righe grezze (minuto/step/bersaglio/distanza raggiunta/strappo):');
TUTTE.slice(0,60).forEach(a=>console.log('   '+a.partita+' '+String(a.minuto).padStart(2)+"' step"+a.step+
  ' -> ('+a.tx+','+a.ty+')  d='+a.dist+'u  in '+(a.ritardo==null?'-':a.ritardo+'ms')+'  strappo '+a.vel+' u/s'+(a.tiroDa!=null?'  tiroDa '+a.tiroDa:'')));
