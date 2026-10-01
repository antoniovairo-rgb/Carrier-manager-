/* [7.803 misura] LA TELECRONACA TACE ESATTAMENTE QUANDO LA PARTITA SI ACCENDE?
   Due misure separate si contraddicono e vanno confrontate SULLE STESSE PARTITE:
     · il playtest dice che le righe crollano nell'ultimo quarto d'ora (6→1, 12→6, 6→0, 16→2);
     · il censimento dell'andamento dice che le fasi forti sono quasi tutte DOPO il 56'.
   Se e' vero, il racconto muore dove il calcio comincia — ed e' un difetto di credibilita' piu'
   grosso di qualunque highlight. Qui si misurano ENTRAMBE, minuto per minuto, in una passata sola.
   Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Ba,Bb,Bc,Bd,Be,Bf,Bg,Bh').split(',');
const SEMI=NOMI.map((_,g)=>7700+g*613);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const FASCE=[[1,15],[16,30],[31,45],[46,60],[61,75],[76,90]];
const tot={righe:new Array(6).fill(0),forti:new Array(6).fill(0),min:new Array(6).fill(0),gol:new Array(6).fill(0)};
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  const forte={};let min=0;
  for(let k=0;k<1200;k++){await sleep(300);
    const r=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();if(!ms)return null;
      const bx=(ms.ball&&typeof ms.ball.x==='number')?ms.ball.x:50;
      const sp=(((ms.turn|0)>0?1:0)+((ms.momentum|0)>=55?1:0)+((ms.poss|0)>=48?1:0)+(bx>=58?1:0));
      return {min:ms.min|0,sp};});
    if(r){min=r.min;if(r.sp>=3)forte[r.min]=1;}
    if(min>=89)break;}
  const d=await page.evaluate(()=>({cro:window.__CPM_CRO802||[],
    ev:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal').map(e=>e.min|0)}));
  const perF=FASCE.map(()=>0),forF=FASCE.map(()=>0),golF=FASCE.map(()=>0);
  (d.cro||[]).forEach(c=>{FASCE.forEach((f,i)=>{if(c.t>=f[0]&&c.t<=f[1])perF[i]++;});});
  Object.keys(forte).forEach(m=>{const mm=+m;FASCE.forEach((f,i)=>{if(mm>=f[0]&&mm<=f[1])forF[i]++;});});
  (d.ev||[]).forEach(m=>{FASCE.forEach((f,i)=>{if(m>=f[0]&&m<=f[1])golF[i]++;});});
  for(let i=0;i<6;i++){tot.righe[i]+=perF[i];tot.forti[i]+=forF[i];tot.gol[i]+=golF[i];tot.min[i]+=15;}
  console.log('  '+NOMI[g].padEnd(4)+' righe per fascia ['+perF.join(',')+']  · minuti forti ['+forF.join(',')+']  · gol ['+golF.join(',')+']');
  await ctx.close();
}
await b.close();srv.close();
console.log('\n=== IL RACCONTO SEGUE LA PARTITA? ('+NOMI.length+' partite intere) ===');
console.log('  fascia      righe   righe/min   minuti forti   gol');
FASCE.forEach((f,i)=>{
  console.log('  '+String(f[0]+"'-"+f[1]+"'").padEnd(10)
    +String(tot.righe[i]).padStart(5)
    +String((tot.righe[i]/tot.min[i]).toFixed(2)).padStart(11)
    +String(tot.forti[i]+'/'+tot.min[i]).padStart(15)
    +String(tot.gol[i]).padStart(6));
});
const primo=tot.righe[0]+tot.righe[1]+tot.righe[2], secondo=tot.righe[3]+tot.righe[4]+tot.righe[5];
const fPrimo=tot.forti[0]+tot.forti[1]+tot.forti[2], fSecondo=tot.forti[3]+tot.forti[4]+tot.forti[5];
console.log('');
console.log('  PRIMO TEMPO   righe '+primo+'  · minuti forti '+fPrimo);
console.log('  SECONDO TEMPO righe '+secondo+'  · minuti forti '+fSecondo);
const calo=primo?Math.round(100*(secondo-primo)/primo):0;
const salita=fPrimo?Math.round(100*(fSecondo-fPrimo)/fPrimo):0;
console.log('');
console.log('  il RACCONTO nel secondo tempo: '+(calo>=0?'+':'')+calo+'%');
console.log('  la PARTITA  nel secondo tempo: '+(salita>=0?'+':'')+salita+'%');
console.log('');
if(calo<0&&salita>0)console.log('  ⚠️  CONFERMATO: il racconto CALA dove la partita SALE. E\' una bugia del sistema.');
else if(calo>=0&&salita>0)console.log('  ✅ racconto e partita salgono insieme: la contraddizione non c\'e\'.');
else console.log('  la contraddizione non si riproduce in questa forma — serve leggere i numeri per fascia.');
const ult=tot.righe[5],ultF=tot.forti[5];
console.log('');
console.log('  ULTIMI 15 MINUTI: '+ult+' righe ('+(ult/tot.min[5]).toFixed(2)+'/min) contro '+ultF+'/'+tot.min[5]+' minuti forti e '+tot.gol[5]+' gol.');
