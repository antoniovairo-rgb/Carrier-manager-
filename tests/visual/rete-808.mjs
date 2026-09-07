/* [KE 7.802 · #48] «AZIONE PERICOLOSA EXTRA EROE E GOL MA LA PALLA NON ENTRA IN PORTA».
   Nota PO, due volte in due partite diverse. Qui si misura il fatto nudo: nei secondi attorno a
   un gol raccontato dal piano, QUANTO SI AVVICINA il pallone RESO alla linea di porta?
   Il campo va da 0 a 100 e le porte stanno a 0 e a 100. Si campiona fitto e si tiene il massimo
   avvicinamento alla porta verso cui si segna. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Da,Db,Dc,Dd,De,Df').split(',');
const SEMI=NOMI.map((_,g)=>5150+g*757);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const GOL=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let min=0;const finestra=[];let visti=0;
  for(let k=0;k<3000;k++){
    await sleep(120);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const st=window.__CPM_STATE&&window.__CPM_STATE();
      const ev=((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal');
      return {min:ms?(ms.min|0):0, bx:(st&&st.ball)?+st.ball.x.toFixed(1):null, n:ev.length,
              ultimo:ev.length?ev[ev.length-1]:null};});
    if(!s)continue;min=s.min;
    if(s.bx!=null)finestra.push({min:s.min,bx:s.bx});
    if(finestra.length>90)finestra.shift();
    if(s.n>visti){visti=s.n;
      const lato=s.ultimo&&s.ultimo.side==='home'?1:-1;
      /* il frame e' eroe-centrico: casa attacca verso 100 */
      const vic=finestra.map(f=>lato>0?f.bx:100-f.bx);
      const max=vic.length?Math.max(...vic):null;
      /* ⚠️ DUE NUMERI, NON UNO. Il massimo avvicinamento da' verde anche se il pallone tocca la
         rete per un solo campione e viene subito sovrascritto dal movimento: sullo schermo sarebbe
         un lampo, o niente. Si conta anche QUANTI campioni consecutivi il pallone resta oltre la
         linea — a 120 ms l'uno, servono almeno 4 campioni (~0,5 s) perche' un occhio lo veda. */
      let dentro=0,corsa=0;vic.forEach(v=>{if(v>=98){corsa++;if(corsa>dentro)dentro=corsa;}else corsa=0;});
      GOL.push({partita:NOMI[g],min:s.min,side:s.ultimo&&s.ultimo.side,src:s.ultimo&&s.ultimo.src,max,dentro});
    }
    if(min>=89)break;}
  await ctx.close();
}
await b.close();srv.close();
console.log('=== QUANTO SI AVVICINA IL PALLONE ALLA PORTA, SUL GOL? ('+GOL.length+' gol) ===');
console.log('  la linea di porta e\' a 100. Sotto 98 il pallone NON entra.');
GOL.forEach(x=>console.log('  '+x.partita+'  '+String(x.min).padStart(3)+"'  "+String(x.side).padEnd(5)
  +' ['+String(x.src).padEnd(9)+']  massimo avvicinamento: '+(x.max==null?'n/d':x.max)
  +(x.max!=null&&x.max<98?'   ← NON ENTRA':'   ✅ in rete per '+x.dentro+' campioni ('+(x.dentro*0.12).toFixed(2)+'s)')));
const v=GOL.filter(x=>x.max!=null).map(x=>x.max).sort((a,b)=>a-b);
if(v.length){
  const dentro=v.filter(x=>x>=98).length;
  console.log('\n  massimo avvicinamento: mediana '+v[v.length>>1]+' · p90 '+v[Math.floor(v.length*0.9)]+' · MASSIMO ASSOLUTO '+v[v.length-1]);
  console.log('  gol in cui il pallone raggiunge la linea: '+dentro+'/'+v.length);
  const visibili=GOL.filter(x=>(x.dentro|0)>=4).length;
  console.log('  gol in cui ci RESTA abbastanza da vedersi (>=0,5 s): '+visibili+'/'+v.length);
  console.log('');
  console.log(dentro===0?'  ⚠️  IN NESSUN GOL il pallone arriva in porta. Il tabellone dice gol, il campo no.'
    :'  '+dentro+' gol su '+v.length+' col pallone in rete.');
}
