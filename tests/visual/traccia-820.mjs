/* [CENSIMENTO 820] LA TRACCIA DI UN'OCCASIONE, FOTOGRAMMA PER FOTOGRAMMA. Col banco a tempo reale
   l'arco della cronaca punta la battuta (3,7u al tiro) e il pallone reso resta comunque a 20-30u.
   Qui si guarda che cosa succede DOPO che l'arco arriva: chi scrive, dov'e' il logico, dov'e' il
   corpo del portatore eletto (7.526) e che padrone e' stato eletto (7.555). Una partita, tutte le
   battute d'occasione, un campione ogni ~80 ms per 3 s. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Dc').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617*(NOMI[g]==='Dc'?2:1));
const FINESTRA=3000;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
for(let g=0;g<NOMI.length;g++){
  const seme=NOMI[g]==='Da'?8150:NOMI[g]==='Db'?8767:8150+2*617;
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),seme);
  let clock=0,visti=0;const aperte=[];const tracce=[];
  for(let k=0;k<3400;k++){
    await sleep(80);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const w=window.__CPM_WS&&window.__CPM_WS();
      const B=window.__CPM_BEAT792||[];
      return {t:Date.now(),min:ms?(ms.min|0):0,w:w,n:B.length,coda:B.slice(-5)};});
    if(!s)continue;clock=s.min;
    if(s.w){for(let j=aperte.length-1;j>=0;j--){const a=aperte[j];
      a.c.push({dt:s.t-a.t0,rx:s.w.rx,lx:s.w.lx,ws:s.w.ws,arc:s.w.arc.on,atx:s.w.arc.tx,at:s.w.arc.t,pad:s.w.pad,por:s.w.por});
      if(s.t>a.t0+FINESTRA)aperte.splice(j,1);}}
    if(s.n>visti){const q=Math.min(s.n-visti,s.coda.length);const nuove=s.coda.slice(s.coda.length-q);visti=s.n;
      nuove.forEach(bt=>{if(!bt||!bt.occ)return;const a={t0:Date.now(),min:bt.min,step:bt.step|0,tx:bt.tx,ty:bt.ty,c:[]};aperte.push(a);tracce.push(a);});}
    if(clock>=89)break;}
  const fps=await page.evaluate(()=>Math.round(window.__CPM_FPS708||0));
  await ctx.close();
  console.log('\n=== '+NOMI[g]+' (fps ~'+fps+') — '+tracce.length+' battute ===');
  const NOME={0:'nessuno',1:'scena',2:'arco',3:'inseg',4:'portat',5:'addosso',15:'avvic',17:'fermo',18:'avanz'};
  tracce.forEach(a=>{
    console.log("\n  "+a.min+"' step"+a.step+"  battuta -> x "+a.tx+"   (colonne: ms · reso · logico · scrittore · arco→x · padrone · corpo portatore)");
    a.c.forEach(r=>console.log('    '+String(r.dt).padStart(5)+'  '+String(r.rx).padStart(5)+'  '+String(r.lx).padStart(5)+'  '+
      (NOME[r.ws]||('ws'+r.ws)).padEnd(8)+(r.arc?('arco→'+r.atx).padEnd(11):'—'.padEnd(11))+String(r.pad||'-').padEnd(10)+(r.por==null?'-':r.por)));
  });
}
await b.close();srv.close();
