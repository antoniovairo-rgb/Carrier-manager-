/* DOVE STA LA LINEA — perche' il fuorigioco fa 4,7x mentre i passaggi fanno 1,93x.
   Due spiegazioni possibili e opposte: il RICEVENTE va piu' avanti, oppure la LINEA
   difensiva (il penultimo avversario) sale. Si misurano tutt'e due, senza toccare il motore:
   i giocatori si leggono da m._g dopo ogni chiamata. */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const src=fs.readFileSync(path.join(ROOT,'src','14-motore-possesso.jsx'),'utf8');
const i=src.indexOf('/* CMAV-SRC-HEADER-END */');
const crea=Function('decideExecution','window',src.slice(i+25)+'\nreturn creaMotorePossesso;')(undefined,undefined);
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const N=+(process.env.CPM_PARTITE||25), MIN=92;
const adv=(x,l)=>l==='home'?x:100-x;
function giro(DEC){
  let nLinea=0,sLinea=0, nAtt=0,sAtt=0, nLarg=0,sLarg=0, fg=0, pass=0;
  for(let s=0;s<N;s++){
    const m=crea({seed:3000+s,giocatori:giocatori(),eroe:{name:'EROE',x:58,y:50,attivo:true,ovr:74},forza:{home:70,away:66}});
    for(let t=1;t<=MIN;t++){ if(t===18||t===64)m.chiedi.gol('home'); if(t===36||t===78)m.chiedi.gol('away');
      for(let k=0;k<DEC;k++){
        const evs=DEC>1?m.tick({min:t,dt:1/DEC,dec:true}):m.tick({min:t});
        for(const e of evs){ if(e.t==='fuorigioco')fg++; if(e.t==='passaggio')pass++; }
        const st=m.stato(); const l=st.poss&&st.poss.lato; if(!l)continue;
        const G=m._g; const av=[],mi=[];
        for(const q of G){ if(!q||q.attivo===false)continue;
          if(q.team===l){ if(!q.gk)mi.push(adv(q.x,l)); } else av.push(adv(q.x,l)); }
        if(av.length>=2){ av.sort((a,b)=>b-a); sLinea+=av[1]; nLinea++; }
        if(mi.length){ mi.sort((a,b)=>b-a); sAtt+=mi[0]; nAtt++; }
        /* larghezza del blocco in attacco: quanto e' sparpagliata la squadra che ha palla */
        if(mi.length>=2){ sLarg+=(mi[0]-mi[mi.length-1]); nLarg++; }
      } } }
  return {linea:+(sLinea/nLinea).toFixed(2), attaccante:+(sAtt/nAtt).toFixed(2),
    larghezza:+(sLarg/nLarg).toFixed(2), fuorigioco:+(fg/N/2).toFixed(2), passaggi:+(pass/N/2).toFixed(1)};}
console.log(`\n=== DOVE STA LA LINEA — ${N} partite per braccio (valori per squadra) ===`);
const a=giro(11), b=giro(22);
console.log('  grandezza                    11 dec/min   22 dec/min   variazione');
for(const k of ['linea','attaccante','larghezza','passaggi','fuorigioco'])
  console.log(`  ${k.padEnd(26)} ${String(a[k]).padStart(10)} ${String(b[k]).padStart(12)}   ${(b[k]/a[k]).toFixed(2)}x`);
console.log('\n  linea = avanzamento del PENULTIMO avversario (la linea che decide il fuorigioco)');
console.log('  attaccante = avanzamento del compagno piu\' avanti · larghezza = primo meno ultimo');
