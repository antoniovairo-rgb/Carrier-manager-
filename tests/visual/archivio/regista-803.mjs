/* [7.802 misura] IL REGISTA E' UNO SOLO, E GUARDA LA PARTITA.
   Direttiva PO 06/09: i momenti dell'eroe «non devono essere preconfezionati, ma basarsi
   sull'andamento della partita», e «il regista in partita degli eventi deve essere UNO SOLO».
   Misura appaiata ON / ROSSO (__CPM_NO803) sugli STESSI semi e sugli stessi nomi: cambia solo
   chi decide il minuto. Si guardano tre cose:
     1. QUANTI momenti — deve restare IDENTICO (il budget non si tocca, la carriera nemmeno);
     2. DA CHE COSA nasce il minuto — orologio, andamento o scadenza;
     3. DOVE cadono — la firma «prima 11-17', ultima 84-86'» deve rompersi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Conti,Rizzo,Fabbri,Gallo').split(',');
const SEMI=NOMI.map((_,g)=>8200+g*911);
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const OUT={};
for(const R of [{n:'ON   ',no:false},{n:'ROSSO',no:true}]){
  const tutti=[],primi=[],ultimi=[],conte=[];
  for(let g=0;g<NOMI.length;g++){
    const ctx=await b.newContext({viewport:{width:412,height:915}});
    const page=await ctx.newPage();await installCdnRoutes(page);
    await page.addInitScript((no)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_HL803=[];if(no)window.__CPM_NO803=1;},R.no);
    await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
    await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
    let min=0;
    for(let k=0;k<900;k++){await sleep(700);
      min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
      if(min>=89)break;}
    const h=await page.evaluate(()=>window.__CPM_HL803||[]);
    tutti.push(...h);conte.push(h.length);
    if(h.length){primi.push(h[0].min);ultimi.push(h[h.length-1].min);}
    console.log('  '+R.n+' '+NOMI[g].padEnd(8)+' momenti '+String(h.length).padStart(2)
      +' · minuti ['+h.map(x=>x.min).join(',')+']'
      +' · tacche ['+h.map(x=>x.prog).join(',')+']'
      +' · '+h.map(x=>x.perche[0]).join(''));
    await ctx.close();
  }
  const perche={};tutti.forEach(x=>{perche[x.perche]=(perche[x.perche]||0)+1;});
  const sp=tutti.map(x=>x.sp);
  OUT[R.n.trim()]={n:tutti.length,conte,primi,ultimi,perche,
    forti:tutti.filter(x=>x.sp>=3).length,
    spMed:q(sp,0.5), scarto:tutti.map(x=>x.min-x.prog)};
}
await b.close();srv.close();
const A=OUT.ON,B=OUT.ROSSO;
const f=(o,k)=>o.perche[k]||0;
console.log('\n=== IL REGISTA GUARDA LA PARTITA? (4 partite per regime, stessi semi) ===');
console.log('  momenti totali        ON '+A.n+'  ·  ROSSO '+B.n+(A.n===B.n?'   ✅ il budget non cambia: stesso numero di momenti'
  :'   ⚠️  IL CONTO E\' CAMBIATO — la carriera non e\' piu\' la stessa, il rimedio si revoca'));
console.log('  per partita           ON ['+A.conte.join(',')+']  ·  ROSSO ['+B.conte.join(',')+']');
console.log('  aperti DALL\'ANDAMENTO ON '+f(A,'andamento')+'/'+A.n+'  ·  ROSSO '+f(B,'andamento')+'/'+B.n);
console.log('  aperti a SCADENZA     ON '+f(A,'scadenza')+'/'+A.n);
console.log('  aperti dall\'OROLOGIO  ROSSO '+f(B,'orologio')+'/'+B.n);
console.log('  andamento forte (>=3 voci su 5 al momento dell\'apertura):');
console.log('                        ON '+A.forti+'/'+A.n+'  ·  ROSSO '+B.forti+'/'+B.n);
console.log('  prima scena           ON ['+A.primi.join(',')+']  ·  ROSSO ['+B.primi.join(',')+']');
console.log('  ultima scena          ON ['+A.ultimi.join(',')+']  ·  ROSSO ['+B.ultimi.join(',')+']');
const amp=v=>v.length?(Math.max(...v)-Math.min(...v)):0;
console.log('  ampiezza prima scena  ON '+amp(A.primi)+"'  ·  ROSSO "+amp(B.primi)+"'");
console.log('  scarto dalla tacca    ON mediana '+q(A.scarto,0.5)+"' · min "+Math.min(...A.scarto)+"' · max "+Math.max(...A.scarto)+"'");
