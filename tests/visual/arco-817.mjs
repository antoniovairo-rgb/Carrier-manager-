/* [CENSIMENTO 817] L'ARCO DELLA CRONACA: DOVE PORTA IL PALLONE DURANTE UN'AZIONE PERICOLOSA?
   Il censimento 816 dice che il pallone RESO sta a 40-45 unita' dal punto che la battuta dichiara,
   mentre il LOGICO ci arriva (9/15 e 8/15 entro 6u), e che lo scrittore che vince il fotogramma e'
   il numero 2 — l'ARCO — nel 91% dei campioni. Qui si guarda l'arco da dentro: dov'e' il suo
   bersaglio rispetto a quello della battuta, quanti archi vengono BUTTATI perche' ne era gia' uno
   in volo, e dove sta il pallone quando l'arco finisce. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db,Dc').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617);
const FINESTRA=2600;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const TUTTE=[];const SCARTI=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0,visti=0;const aperte=[],battute=[];
  for(let k=0;k<3400;k++){
    await sleep(80);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const w=window.__CPM_WS&&window.__CPM_WS();
      const B=window.__CPM_BEAT792||[];
      return {t:Date.now(),min:ms?(ms.min|0):0,w:w,n:B.length,coda:B.slice(-5),
              scarti:window.__CPM_ARCSCART|0};});
    if(!s)continue;clock=s.min;
    if(s.w){
      for(let j=aperte.length-1;j>=0;j--){const a=aperte[j];
        a.n++;
        if(s.w.arc&&s.w.arc.on){a.conArco++;
          const d=Math.hypot(s.w.arc.tx-a.tx,s.w.arc.ty-a.ty);
          if(d<a.dArco)a.dArco=+d.toFixed(1);
          a.tgt.push(s.w.arc.tx);}
        const dR=Math.hypot(s.w.rx-a.tx,s.w.ry-a.ty);if(dR<a.dReso)a.dReso=+dR.toFixed(1);
        if(s.w.lx!=null){const dL=Math.hypot(s.w.lx-a.tx,s.w.ly-a.ty);if(dL<a.dLog)a.dLog=+dL.toFixed(1);}
        if(s.t>a.t0+FINESTRA){a.scarti=s.scarti-a.scarti0;aperte.splice(j,1);}}
    }
    if(s.n>visti){
      const q=Math.min(s.n-visti,s.coda.length);
      const nuove=s.coda.slice(s.coda.length-q);visti=s.n;
      nuove.forEach(bt=>{ if(!bt||!bt.occ)return;
        const a={t0:Date.now(),minuto:bt.min,step:bt.step|0,tx:bt.tx,ty:bt.ty,
                 dReso:99,dLog:99,dArco:99,n:0,conArco:0,tgt:[],scarti0:s.scarti,scarti:0,partita:NOMI[g]};
        aperte.push(a);battute.push(a);});
    }
    if(clock>=89)break;}
  const fin=await page.evaluate(()=>window.__CPM_ARCSCART|0);
  SCARTI.push({partita:NOMI[g],scarti:fin});
  await ctx.close();
  battute.forEach(a=>TUTTE.push(a));
  console.log('  '+NOMI[g]+': battute '+battute.length+'  · archi di cronaca buttati in tutta la partita: '+fin);
}
await b.close();srv.close();
const q=(a,p)=>{if(!a.length)return 0;const s=a.slice().sort((u,v)=>u-v);return +s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(1);};
console.log('\n=== L\'ARCO DELLA CRONACA DENTRO L\'AZIONE PERICOLOSA ('+TUTTE.length+' battute) ===');
[[0,'apertura'],[1,'tiro'],[2,'parata']].forEach(([st,nome])=>{
  const A=TUTTE.filter(a=>a.step===st);if(!A.length)return;
  const arcoPct=Math.round(100*A.reduce((x,a)=>x+a.conArco,0)/Math.max(1,A.reduce((x,a)=>x+a.n,0)));
  console.log('  '+nome.padEnd(9)+' fotogrammi con un arco in volo '+arcoPct+'%'+
    '  · BERSAGLIO DELL\'ARCO vs punto della battuta: mediana '+q(A.map(a=>a.dArco),0.5)+'u  p90 '+q(A.map(a=>a.dArco),0.9)+'u'+
    '  · arco che punta la battuta (<=6u) '+A.filter(a=>a.dArco<=6).length+'/'+A.length+
    '  · archi buttati nella finestra '+A.reduce((x,a)=>x+a.scarti,0));});
console.log('\n  righe grezze:');
TUTTE.forEach(a=>console.log('   '+a.partita+' '+String(a.minuto).padStart(2)+"' step"+a.step+
  ' battuta ('+a.tx+','+a.ty+')  bersaglio arco a '+a.dArco+'u  reso '+a.dReso+'u  logico '+a.dLog+'u'+
  '  arco '+Math.round(100*a.conArco/Math.max(1,a.n))+'% dei fotogrammi  buttati '+a.scarti+
  '  bersagli visti: '+[...new Set(a.tgt.map(v=>Math.round(v)))].slice(0,6).join(',')));
