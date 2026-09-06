/* [7.795 misura v2] IL PING PONG DOPO LA PARATA, NEL FLUSSO VIVO.
   Nota PO sulla 7.792: «ha mostrato un ping pong ripetuto ... non e' calcio ma una sequenza di bug».
   La prima stesura cercava dentro le scene dell'EROE e non ha trovato niente (0 scene su 8 con tre o
   piu' inversioni). Ma «azione pericolosa» e' il nome dell'occasione EXTRA-EROE, e il ping pong il PO
   l'aveva gia' segnalato nel 7.702 — «ping pong di 4-5 volte tra il portiere scoordinato e un
   avversario» — proprio dopo una parata. Il 7.702 aveva costruito il dopo-parata come palla morta;
   dal 7.790 le occasioni sono passate da 0,17 a 2,00 a partita, quindi quel ramo oggi viene percorso
   dieci volte tanto ed e' il momento di verificarlo sul campo invece che sulla carta.
   METODO: partita vera, si sorveglia il contatore delle parate (`__CPM_OCC695.parate`); appena sale si
   campiona la posizione del pallone a passo fitto per cinque secondi e si contano le INVERSIONI del
   verso lungo x con ampiezza oltre due unita'. Un rimbalzo e' calcio; quattro avanti e indietro no. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc,Pa').split(',');
const EPISODI=[];
const ROSSO=!!process.env.CPM_ROSSO;
console.log(ROSSO?'=== ROSSO (__CPM_NO795: elezione sempre attiva) ===':'=== VERDE (elezione sospesa a pallone morto) ===');
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((ro)=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;if(ro)window.__CPM_NO795=1;},ROSSO);
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+(g%3)*733);
  let parate=0,min=0,visti=0;
  for(let k=0;k<2600;k++){
    const s=await page.evaluate(()=>{const w=window.__CPM_OCC695||null;const ms=window.__CPM_MS&&window.__CPM_MS();
      return{p:w?(w.parate|0):0,min:ms?(ms.min|0):0};});
    if(s.min>min)min=s.min;
    if(s.p>parate){
      parate=s.p;visti++;
      const P=[];const fine=Date.now()+5000;
      while(Date.now()<fine){
        /* ⚠️ IL PALLONE GIUSTO E' QUELLO RESO, e la prima stesura sbagliava bersaglio. Campionavo
           `__CPM_MS().ball`, cioe' il punto-palla LOGICO: ma il PO guarda quello che si vede, e il
           codice 011 ha gia' misurato che i due divergono di 9-17 unita' (fino a 48). Uno zero sul
           pallone logico non dice niente sul ping pong che si vede. `__CPM_STATE().ball` e' la
           posizione del mesh, convertita in coordinate di gioco. */
        const d=await page.evaluate(()=>{try{const st=window.__CPM_STATE&&window.__CPM_STATE();
          return st&&st.ball?{x:st.ball.x,y:st.ball.y}:null;}catch(e){return null;}});
        if(d)P.push(d);
        await sleep(85);
      }
      if(P.length>=8){
        let inv=0,verso=0,estremo=P[0].x;const amp=[];
        for(let i=1;i<P.length;i++){
          const d=P[i].x-P[i-1].x;
          if(Math.abs(d)<0.05)continue;
          const v=d>0?1:-1;
          if(verso===0){verso=v;estremo=P[i].x;continue;}
          if(v!==verso){const a=Math.abs(P[i-1].x-estremo);
            if(a>=2){inv++;amp.push(+a.toFixed(1));estremo=P[i-1].x;verso=v;}}
          else estremo=(v>0)?Math.max(estremo,P[i].x):Math.min(estremo,P[i].x);
        }
        const esc=Math.max(...P.map(p=>p.x))-Math.min(...P.map(p=>p.x));
        EPISODI.push({mondo:NOMI[g],min:s.min,inv,amp,esc:+esc.toFixed(1)});
        console.log('['+NOMI[g]+'] parata al '+s.min+"' · campioni "+P.length+' · INVERSIONI (>2u) '+inv
          +' · ampiezze '+JSON.stringify(amp.slice(0,8))+' · escursione '+esc.toFixed(1)+'u'
          +(inv>=3?'   ← PING PONG':''));
      }
    }
    if(min>=89)break;
    await sleep(400);
  }
  console.log('['+NOMI[g]+'] fine al '+min+"' · parate viste "+visti);
  await ctx.close();
}
await b.close();srv.close();
console.log('');
const I=EPISODI.map(e=>e.inv);
console.log('=== '+EPISODI.length+' parate osservate su '+NOMI.length+' partite · PALLONE RESO ===');
if(!I.length){console.log('  NESSUN EPISODIO — misura mancata, non un verde.');process.exit(2);}
console.log('  inversioni dopo la parata: mediana '+q(I,0.5)+' · p75 '+q(I,0.75)+' · max '+Math.max(...I));
const pp=EPISODI.filter(e=>e.inv>=3);
console.log('  episodi di PING PONG (>=3 inversioni da oltre 2u): '+pp.length+'/'+EPISODI.length
  +(pp.length?'  → '+pp.map(e=>e.mondo+' '+e.min+"'("+e.inv+')').join(' · '):''));
