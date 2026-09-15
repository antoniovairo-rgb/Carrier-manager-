/* [A2 v3 — BANCO «STATI-SUB»] Il motore del possesso (src/14) al banco, senza browser, con e senza sotto-tick.
   Misura per braccio (dt=1: un tick al minuto, com'era; dt=1/3: tre chiamate al minuto, decisione alla prima):
   - quote di TEMPO per stato (pesate per dt): padrone dichiarato = tenuta / (tenuta+volo+libero) nel gioco vivo;
   - a partita: passaggi, tiri (in area), gol, conduzioni, catene >= 3 passaggi -> tiro, minuti di volo per passaggio;
   - spostamenti: massimo per CHIAMATA di un uomo e del pallone (il salto che il renderer deve seguire), uomini > 5u
     per chiamata, corsa media per minuto (deve restare uguale fra i bracci: il mondo non deve andare piu' veloce);
   - invarianti: in tenuta palla <= 3u dal padrone; nessun uomo > 12u in un minuto; gol decretati entrati (minuti).
   CPM_PARTITE (16), CPM_DT ("1,0.333333"). Sola lettura. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
function loadMotore(){const src=fs.readFileSync(path.join(ROOT,'src','14-motore-possesso.jsx'),'utf8');const i=src.indexOf('/* CMAV-SRC-HEADER-END */');const code=src.slice(i+'/* CMAV-SRC-HEADER-END */'.length);const W=(process.env.CPM_ROSSO||'').split(',').filter(Boolean).reduce((o,k)=>(o[k]=true,o),{});/* CPM_ROSSO=__CPM_NOxxx: il braccio rosso al banco */return Function('decideExecution','window',code+'\nreturn creaMotorePossesso;')(undefined,Object.keys(W).length?W:undefined);}
const crea=loadMotore();
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const N=+(process.env.CPM_PARTITE||16),MIN=92;
const DTS=(process.env.CPM_DT||'1,0.333333').split(',').map(Number);
function partita(seed,dt){
  const m=crea({seed,giocatori:giocatori(),eroe:{name:'EROE',x:58,y:50,attivo:true,ovr:74},forza:{home:70,away:66}});
  const acc={min:{},passaggi:0,tiri:0,tiriArea:0,gol:0,cond:0,catene:0,voli:0,voloMin:0,maxG:0,maxB:0,salti5:0,corsa:0,viol3:0,viol12:0,golReq:[],calls:0,fermi:0,padrEroe:0,arrivi:0};
  let prev=m.stato(),chain=0,chainLato=null,voloDa=null,golReqAt=null;const minMove=new Array(22).fill(0);
  const subN=dt>=1?1:Math.round(1/dt);
  for(let t=1;t<=MIN;t++){
    if(t===23||t===61){m.chiedi.gol(t===23?'home':'away');golReqAt=t;}
    if(t===40)m.chiedi.scenaEroe(true);if(t===46)m.chiedi.scenaEroe(false);
    for(let k=0;k<subN;k++){
      const evs=m.tick(dt>=1?{min:t}:{min:t,dt});const st=m.stato();acc.calls++;
      const s=st.poss.stato;acc.min[s]=(acc.min[s]||0)+dt;if(s==='tenuta'&&st.poss.padrone===21)acc.padrEroe+=dt;
      for(const e of evs){
        if(e.t==='passaggio'&&!e.fuori){acc.passaggi++;if(chainLato===e.lato)chain++;else{chain=1;chainLato=e.lato;}}
        else if(e.t==='cross'){acc.passaggi++;if(chainLato===e.lato)chain++;else{chain=1;chainLato=e.lato;}}
        else if(e.t==='tiro'){acc.tiri++;if(e.zona==='area')acc.tiriArea++;if(chain>=3&&chainLato===e.lato)acc.catene++;chain=0;}
        else if(e.t==='gol'){acc.gol++;if(golReqAt!=null){acc.golReq.push(t-golReqAt);golReqAt=null;}}
        else if(e.t==='conduzione')acc.cond++;
        else if(e.t==='ricezione')acc.arrivi++;
        else if(/^(contrasto|intercetto|recupero|palla_persa|fallo|rimessa|rinvio|corner|fuori|centro|spazzata|presa|parata)$/.test(e.t)){chain=0;chainLato=null;if(/^(fallo|rimessa|rinvio|corner)$/.test(e.t))acc.fermi++;}
      }
      if(s==="volo"&&prev.poss.stato!=="volo")voloDa=acc.calls;
      if(s!=='volo'&&prev.poss.stato==='volo'&&voloDa!=null){acc.voli++;acc.voloMin+=(acc.calls-voloDa)*dt;voloDa=null;}
      for(let i=0;i<22;i++){const a=i<21?prev.gioc[i]:prev.eroe,b=i<21?st.gioc[i]:st.eroe;const d=Math.hypot(b.x-a.x,b.y-a.y);if(d>acc.maxG)acc.maxG=d;if(d>5)acc.salti5++;minMove[i]+=d;acc.corsa+=d;}
      {const d=Math.hypot(st.palla.x-prev.palla.x,st.palla.y-prev.palla.y);if(d>acc.maxB)acc.maxB=d;}
      if(s==='tenuta'&&st.poss.padrone!=null){const P=st.poss.padrone===21?st.eroe:st.gioc[st.poss.padrone];if(Math.hypot(P.x-st.palla.x,P.y-st.palla.y)>3)acc.viol3++;}
      prev=st;
    }
    for(let i=0;i<22;i++){if(minMove[i]>12.01)acc.viol12++;minMove[i]=0;}
  }
  if(golReqAt!=null)acc.golReq.push(999);
  return acc;
}
const f1=(x)=>(Math.round(x*10)/10).toFixed(1),f0=(x)=>Math.round(x);
const RIS={};
for(const dt of DTS){
  const A=[];for(let g=0;g<N;g++)A.push(partita(1000+g*131,dt));
  const sum=(k)=>A.reduce((s,a)=>s+a[k],0),med=(k)=>A.map(a=>a[k]).sort((a,b)=>a-b)[N>>1];
  const minTot={};for(const a of A)for(const k in a.min)minTot[k]=(minTot[k]||0)+a.min[k];
  const vivo=(minTot.tenuta||0)+(minTot.volo||0)+(minTot.libero||0),tot=Object.values(minTot).reduce((s,x)=>s+x,0);
  const gr=A.flatMap(a=>a.golReq);
  const r={dt,padrone:100*(minTot.tenuta||0)/vivo,volo:100*(minTot.volo||0)/vivo,libero:100*(minTot.libero||0)/vivo,fermo:100*((minTot.fermo||0)+(minTot.rete||0)+(minTot.kickoff||0))/tot,eroe:100*(A.reduce((s,a)=>s+a.padrEroe,0))/vivo,
    passaggi:sum('passaggi')/N,tiri:sum('tiri')/N,tiriArea:sum('tiriArea')/N,gol:sum('gol')/N,cond:sum('cond')/N,catene:sum('catene')/N,voloPer:sum('voloMin')/Math.max(1,sum('voli')),fermi:sum('fermi')/N,
    maxG:Math.max(...A.map(a=>a.maxG)),medMaxG:med('maxG'),maxB:Math.max(...A.map(a=>a.maxB)),salti5:sum('salti5')/N,corsaMin:sum('corsa')/(N*MIN*22),viol3:sum('viol3'),viol12:sum('viol12'),
    golOk:gr.filter(x=>x<999).length,golN:gr.length,golMed:gr.filter(x=>x<999).sort((a,b)=>a-b)[gr.filter(x=>x<999).length>>1]};
  RIS[dt]=r;
  console.log(`\n=== dt=${dt} (${dt>=1?'un tick al minuto':Math.round(1/dt)+' chiamate al minuto'}), ${N} partite ===`);
  console.log(`  gioco vivo: padrone dichiarato ${f1(r.padrone)} %  · volo ${f1(r.volo)} %  · libero ${f1(r.libero)} %   | palla ferma+rete+centro ${f1(r.fermo)} % del totale · eroe padrone ${f1(r.eroe)} % del vivo`);
  console.log(`  a partita: passaggi ${f1(r.passaggi)} · tiri ${f1(r.tiri)} (in area ${f1(r.tiriArea)}) · gol ${f1(r.gol)} · conduzioni ${f1(r.cond)} · catene>=3->tiro ${f1(r.catene)} · interruzioni ${f1(r.fermi)} · minuti di volo per passaggio ${r.voloPer.toFixed(2)}`);
  console.log(`  spostamenti per chiamata: uomo max ${f1(r.maxG)}u (mediana dei massimi ${f1(r.medMaxG)}) · pallone max ${f1(r.maxB)}u · uomini >5u ${f0(r.salti5)}/partita · corsa media ${r.corsaMin.toFixed(2)}u per uomo e minuto`);
  console.log(`  invarianti: palla >3u dal padrone ${r.viol3} · uomo >12u in un minuto ${r.viol12} · gol decretati entrati ${r.golOk}/${r.golN} (mediana ${r.golMed} minuti)`);
}
if(DTS.length>=2){const a=RIS[DTS[0]],b=RIS[DTS[1]];console.log(`\n=== confronto ${DTS[0]} -> ${DTS[1]} ===`);
  console.log(`  padrone dichiarato ${f1(a.padrone)} -> ${f1(b.padrone)} %  · volo ${f1(a.volo)} -> ${f1(b.volo)} %  · passaggi ${f1(a.passaggi)} -> ${f1(b.passaggi)} · tiri ${f1(a.tiri)} -> ${f1(b.tiri)} · catene ${f1(a.catene)} -> ${f1(b.catene)}`);
  console.log(`  salto massimo per chiamata: uomo ${f1(a.maxG)} -> ${f1(b.maxG)}u · pallone ${f1(a.maxB)} -> ${f1(b.maxB)}u · corsa/minuto ${a.corsaMin.toFixed(2)} -> ${b.corsaMin.toFixed(2)}u`);
  const ok=b.padrone>a.padrone+5&&b.maxG<=a.maxG+0.5&&Math.abs(b.corsaMin-a.corsaMin)<=0.4*a.corsaMin+0.2&&b.viol3===0&&b.viol12===0&&b.golOk===b.golN;
  console.log(ok?'  VERDE — piu\' padrone, salti non piu\' grandi, mondo alla stessa velocita\', invarianti a zero.':'  ROSSO — vedi sopra.');}
