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
      /* ⚠️ LA FINESTRA GIUSTA E' ANCHE DOPO. La prima stesura guardava solo gli 11 secondi PRIMA
         del gol e calcolava li' il massimo avvicinamento: ma il pallone entra in rete DOPO che il
         gol e' accreditato, in una finestra che non veniva mai campionata. Cosi' un rimedio che
         funziona (misurato: 100,6 entro 300-450 ms dal gol, e ci resta oltre 1,2 s) risultava
         fallito 2 volte su 15. Settimo strumento che mente in questa sessione — e il primo che mi
         ha fatto buttare un rimedio BUONO invece di spedirne uno cattivo. */
      const dopo=[];
      for(let _j=0;_j<20;_j++){await sleep(120);
        const _q=await page.evaluate(()=>{const st=window.__CPM_STATE&&window.__CPM_STATE();
          return (st&&st.ball)?+st.ball.x.toFixed(1):null;});
        if(_q!=null)dopo.push(lato>0?_q:100-_q);}
      let _dmax=dopo.length?Math.max(...dopo):null,_dd=0,_cc=0;
      dopo.forEach(v=>{if(v>=98){_cc++;if(_cc>_dd)_dd=_cc;}else _cc=0;});
      /* il frame e' eroe-centrico: casa attacca verso 100 */
      const vic=finestra.map(f=>lato>0?f.bx:100-f.bx);
      const max=vic.length?Math.max(...vic):null;
      /* ⚠️ DUE NUMERI, NON UNO. Il massimo avvicinamento da' verde anche se il pallone tocca la
         rete per un solo campione e viene subito sovrascritto dal movimento: sullo schermo sarebbe
         un lampo, o niente. Si conta anche QUANTI campioni consecutivi il pallone resta oltre la
         linea — a 120 ms l'uno, servono almeno 4 campioni (~0,5 s) perche' un occhio lo veda. */
      let dentro=0,corsa=0;vic.forEach(v=>{if(v>=98){corsa++;if(corsa>dentro)dentro=corsa;}else corsa=0;});
      GOL.push({partita:NOMI[g],min:s.min,side:s.ultimo&&s.ultimo.side,src:s.ultimo&&s.ultimo.src,
                max,dentro,dmax:_dmax,ddentro:_dd});
    }
    if(min>=89)break;}
  await ctx.close();
}
await b.close();srv.close();
console.log('=== QUANTO SI AVVICINA IL PALLONE ALLA PORTA, SUL GOL? ('+GOL.length+' gol) ===');
console.log('  la linea di porta e\' a 100. Sotto 98 il pallone NON entra.');
GOL.forEach(x=>console.log('  '+x.partita+'  '+String(x.min).padStart(3)+"'  "+String(x.side).padEnd(5)
  +' ['+String(x.src).padEnd(9)+']  DOPO il gol: '+(x.dmax==null?'n/d':x.dmax)
  +' per '+(x.ddentro*0.12).toFixed(2)+'s'+(x.dmax!=null&&x.dmax>=98?'  ✅ IN RETE':'  ← non entra')
  +'   ·   prima: '+(x.max==null?'n/d':x.max)
  ));
const v=GOL.filter(x=>x.max!=null).map(x=>x.max).sort((a,b)=>a-b);
if(v.length){
  const dentro=GOL.filter(x=>x.dmax!=null&&x.dmax>=98).length;
  console.log('\n  massimo avvicinamento: mediana '+v[v.length>>1]+' · p90 '+v[Math.floor(v.length*0.9)]+' · MASSIMO ASSOLUTO '+v[v.length-1]);
  console.log('  gol in cui il pallone raggiunge la linea: '+dentro+'/'+v.length);
  const visibili=GOL.filter(x=>(x.ddentro|0)>=4).length;
  console.log('  gol in cui ci RESTA abbastanza da vedersi (>=0,5 s): '+visibili+'/'+v.length);
  /* [7.804] IL TELETRASPORTO E' PEGGIO DEL DIFETTO. Se il pallone entra in rete partendo da meta'
     campo, il giocatore vede un salto senza senso — segnalato dal PO al primo collaudo. Qui si
     separano i due casi: gol in cui l'azione era GIA' in zona (prima >=70) da quelli in cui la
     palla era lontana. I secondi NON devono piu' vedere il pallone in rete. */
  const inZona=GOL.filter(x=>x.max!=null&&x.max>=70);
  const lontani=GOL.filter(x=>x.max!=null&&x.max<70);
  const zonaOk=inZona.filter(x=>x.dmax!=null&&x.dmax>=98).length;
  const lontOk=lontani.filter(x=>x.dmax!=null&&x.dmax>=98).length;
  console.log('');
  console.log('  gol con l\'azione GIA\' IN ZONA (prima >=70): '+inZona.length+'  →  in rete '+zonaOk+'/'+inZona.length+'   (devono entrare)');
  console.log('  gol con la palla LONTANA   (prima <70):    '+lontani.length+'  →  in rete '+lontOk+'/'+lontani.length+'   (NON devono: sarebbe un teletrasporto)');
  console.log('');
  console.log((lontOk===0&&zonaOk===inZona.length)
    ?'  ✅ il pallone entra quando l\'azione ci arriva, e non salta quando la palla e\' lontana.'
    :'  ⚠️  '+lontOk+' gol col pallone teletrasportato in rete da lontano.');
  console.log('');
  console.log(dentro===0?'  ⚠️  IN NESSUN GOL il pallone arriva in porta. Il tabellone dice gol, il campo no.'
    :'  '+dentro+' gol su '+v.length+' col pallone in rete.');
}
