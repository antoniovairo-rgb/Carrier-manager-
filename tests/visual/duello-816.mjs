/* [CENSIMENTO 816] IL PALLONE NON ARRIVA DOVE LA TELECRONACA LO MANDA: DI CHI E' LA COLPA?
   Il censimento 815 ha misurato che, durante un'azione pericolosa extra-eroe, il pallone RESO
   sta a 37-40 unita' dal punto che la battuta dichiara (1 su 12 arriva entro 6u). Restano due
   colpevoli possibili, e sono due rimedi diversi:
     (a) il pallone LOGICO non ci va — allora il difetto e' nel piano/nel moto della palla;
     (b) il pallone logico ci va e il RESO non lo segue — allora e' la gerarchia dei 15 scrittori.
   Qui si guardano tutti e due nello stesso istante, e si nomina lo scrittore che ha vinto il
   fotogramma (__CPM_WS). Sola lettura. Banco tarato. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db,Dc,Dd,De,Df').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617);
const FINESTRA=2600;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const TUTTE=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0,visti=0;const aperte=[],battute=[];
  for(let k=0;k<3400;k++){
    await sleep(90);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const w=window.__CPM_WS&&window.__CPM_WS();
      const B=window.__CPM_BEAT792||[];
      return {t:Date.now(),min:ms?(ms.min|0):0,w:w,n:B.length,coda:B.slice(-5)};});
    if(!s)continue;clock=s.min;
    if(s.w){
      for(let j=aperte.length-1;j>=0;j--){const a=aperte[j];
        const dR=Math.hypot(s.w.rx-a.tx,s.w.ry-a.ty);
        if(dR<a.dReso)a.dReso=+dR.toFixed(1);
        if(s.w.lx!=null){const dL=Math.hypot(s.w.lx-a.tx,s.w.ly-a.ty);if(dL<a.dLog)a.dLog=+dL.toFixed(1);
          const sc=Math.hypot(s.w.rx-s.w.lx,s.w.ry-s.w.ly);if(sc>a.scarto)a.scarto=+sc.toFixed(1);}
        const f=s.w.src||('ws'+s.w.ws);a.chi[f]=(a.chi[f]||0)+1;a.frame++;
        if(s.t>a.t0+FINESTRA)aperte.splice(j,1);}
    }
    if(s.n>visti){
      const q=Math.min(s.n-visti,s.coda.length);
      const nuove=s.coda.slice(s.coda.length-q);visti=s.n;
      nuove.forEach(bt=>{ if(!bt||!bt.occ)return;
        const a={t0:Date.now(),minuto:bt.min,step:bt.step|0,tx:bt.tx,ty:bt.ty,tiroDa:bt.tiroDa,
                 dReso:99,dLog:99,scarto:0,chi:{},frame:0,partita:NOMI[g]};
        aperte.push(a);battute.push(a);});
    }
    if(clock>=89)break;}
  await ctx.close();
  battute.forEach(a=>TUTTE.push(a));
  console.log('  '+NOMI[g]+': battute '+battute.length);
}
await b.close();srv.close();
const q=(a,p)=>{if(!a.length)return 0;const s=a.slice().sort((u,v)=>u-v);return +s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(1);};
console.log('\n=== IL PALLONE LOGICO CI VA? E IL RESO LO SEGUE? ('+TUTTE.length+' battute, '+NOMI.length+' partite) ===');
[[0,'apertura'],[1,'tiro'],[2,'parata']].forEach(([st,nome])=>{
  const A=TUTTE.filter(a=>a.step===st);if(!A.length)return;
  const L=A.map(a=>a.dLog),R=A.map(a=>a.dReso),S=A.map(a=>a.scarto);
  console.log('  '+nome.padEnd(9)+' LOGICO arriva (<=6u) '+A.filter(a=>a.dLog<=6).length+'/'+A.length+
    ' (mediana '+q(L,0.5)+'u)   RESO arriva '+A.filter(a=>a.dReso<=6).length+'/'+A.length+
    ' (mediana '+q(R,0.5)+'u)   scarto reso-logico mediano '+q(S,0.5)+'u  max '+q(S,1)+'u');});
const CHI={};TUTTE.forEach(a=>{for(const k in a.chi)CHI[k]=(CHI[k]||0)+a.chi[k];});
const tot=Object.values(CHI).reduce((x,y)=>x+y,0)||1;
console.log('\n  CHI SCRIVE IL PALLONE durante un\'azione pericolosa extra-eroe:');
Object.entries(CHI).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log('    '+String(k).padEnd(18)+String(v).padStart(5)+'  '+Math.round(100*v/tot)+'%'));
console.log('\n  righe grezze:');
TUTTE.forEach(a=>console.log('   '+a.partita+' '+String(a.minuto).padStart(2)+"' step"+a.step+
  ' -> ('+a.tx+','+a.ty+')  logico '+a.dLog+'u  reso '+a.dReso+'u  scarto '+a.scarto+'u  ['+
  Object.entries(a.chi).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,v])=>k+':'+v).join(' ')+']'));
