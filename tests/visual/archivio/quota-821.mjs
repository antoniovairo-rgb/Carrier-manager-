/* [CENSIMENTO 821 · candidata 7.808] IL TIRO DELL'OCCASIONE VOLA COME UN PASSAGGIO?
   Le tre battute del piano escono con at:"pass" (src/14 r.4379): l'arco di cronaca prende altezza
   0,9 (pass) invece di 2,8 (shot) e il sito ATE-2 arma il tuffo del portiere solo su shot/save.
   Qui si misura, per ogni battuta d'occasione: la QUOTA massima del pallone reso nel volo (worldY,
   __CPM_BALL) e quanti tuffi T8 (ATE-2) e T9 (segnale 7.695) partono nella finestra (__CPM_GK799).
   Banco a tempo reale. Sola lettura. Rosso generico: CPM_ROSSO=<n>. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db,Dc,Dd').split(',');
const SEMI=NOMI.map((_,g)=>8150+g*617);
const FINESTRA=2600;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const TUTTE=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;if(o.rosso)window['__CPM_NO'+o.rosso]=true;},{rosso:(process.env.CPM_ROSSO||'')});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0,visti=0;const aperte=[],battute=[];
  for(let k=0;k<3400;k++){
    await sleep(80);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const bl=window.__CPM_BALL&&window.__CPM_BALL();
      const B=window.__CPM_BEAT792||[];const G=window.__CPM_GK799||[];
      const w=window.__CPM_WS&&window.__CPM_WS();
      return {t:Date.now(),min:ms?(ms.min|0):0,y:bl?bl.worldY:null,n:B.length,coda:B.slice(-5),gk:G.length,
              gkCoda:G.slice(-3).map(x=>x.tag),arcOn:w&&w.arc?w.arc.on:0};});
    if(!s)continue;clock=s.min;
    for(let j=aperte.length-1;j>=0;j--){const a=aperte[j];
      if(s.y!=null&&s.y>a.quota)a.quota=+s.y.toFixed(2);
      if(s.gk>a.gk0){const nuovi=s.gkCoda.slice(s.gkCoda.length-Math.min(s.gk-a.gk0,3));nuovi.forEach((t,ix)=>{a.tuffi[t]=(a.tuffi[t]||0)+1;a.idx.push((s.gk-nuovi.length+ix)+':'+t);});a.gk0=s.gk;}
      if(s.t>a.t0+FINESTRA)aperte.splice(j,1);}
    if(s.n>visti){const q=Math.min(s.n-visti,s.coda.length);const nuove=s.coda.slice(s.coda.length-q);visti=s.n;
      nuove.forEach(bt=>{if(!bt||!bt.occ)return;const a={t0:Date.now(),min:bt.min,step:bt.step|0,quota:0,tuffi:{},idx:[],gk0:s.gk,partita:NOMI[g]};aperte.push(a);battute.push(a);});}
    if(clock>=89)break;}
  const fps=await page.evaluate(()=>Math.round(window.__CPM_FPS708||0));
  await ctx.close();battute.forEach(a=>TUTTE.push(a));
  console.log('  '+NOMI[g]+': battute '+battute.length+'  fps ~'+fps);
}
await b.close();srv.close();
const q=(a,p)=>{if(!a.length)return 0;const s=a.slice().sort((u,v)=>u-v);return +s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(2);};
/* per OCCASIONE: le tre battute consecutive di una stessa partita; i tuffi si contano per indice distinto */
const OCC=[];TUTTE.forEach(a=>{const u=OCC[OCC.length-1];if(a.step===0||!u||u.partita!==a.partita){OCC.push({partita:a.partita,min:a.min,idx:new Set()});}OCC[OCC.length-1].idx=new Set([...OCC[OCC.length-1].idx,...a.idx]);});
const perOcc=OCC.map(o=>{let t8=0,t9=0;o.idx.forEach(k=>{if(k.endsWith('T8'))t8++;else if(k.endsWith('T9'))t9++;});return {t8,t9,tot:t8+t9};});
console.log('\n  TUFFI PER OCCASIONE ('+OCC.length+' occasioni): esattamente uno '+perOcc.filter(o=>o.tot===1).length+'  · zero '+perOcc.filter(o=>o.tot===0).length+'  · due o piu\' '+perOcc.filter(o=>o.tot>=2).length+
  '   [T8 al tiro in '+perOcc.filter(o=>o.t8>=1).length+' occasioni · T9 in '+perOcc.filter(o=>o.t9>=1).length+']');
console.log('\n=== QUOTA DEL PALLONE E TUFFI PER BATTUTA ('+TUTTE.length+' battute, '+NOMI.length+' partite) ===');
[[0,'apertura'],[1,'tiro'],[2,'parata']].forEach(([st,nome])=>{const A=TUTTE.filter(a=>a.step===st);if(!A.length)return;
  const Q=A.map(a=>a.quota);const t8=A.reduce((x,a)=>x+(a.tuffi.T8||0),0),t9=A.reduce((x,a)=>x+(a.tuffi.T9||0),0);
  console.log('  '+nome.padEnd(9)+' quota max mediana '+q(Q,0.5)+'  p90 '+q(Q,0.9)+'  (pass=0,9 · shot=2,8 · save=1,8)'+
    '   tuffi T8 (ATE-2) '+t8+'  · T9 (segnale 7.695) '+t9+'  su '+A.length);});
