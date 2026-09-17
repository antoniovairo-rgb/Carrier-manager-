/* DOVE VANNO LE CHIAMATE DEL MOTORE — sola lettura, nessun browser.
   I passaggi stanno a 121 contro 450 veri (0,27x) mentre il 51,6 % delle chiamate e' «tenuta»:
   questo dice quale RAMO della decisione di tenuta si mangia le chiamate che nel calcio vero
   sarebbero passaggi. Senza, la correzione sarebbe un tentativo al buio. CPM_PARTITE, CPM_ROSSO. */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
function loadMotore(){const src=fs.readFileSync(path.join(ROOT,'src','14-motore-possesso.jsx'),'utf8');
  const i=src.indexOf('/* CMAV-SRC-HEADER-END */');const code=src.slice(i+'/* CMAV-SRC-HEADER-END */'.length);
  const W=(process.env.CPM_ROSSO||'').split(',').filter(Boolean).reduce((o,k)=>(o[k]=true,o),{});
  return Function('decideExecution','window',code+'\nreturn creaMotorePossesso;')(undefined,Object.keys(W).length?W:undefined);}
const crea=loadMotore();
const N=+(process.env.CPM_PARTITE||30), MIN=92, DEC=11;
/* la lista dei giocatori e' COPIATA dal banco tabellino-vero: la mia versione inventata
   faceva esplodere il motore su muoviTutti — si riusa la forma vera, non se ne indovina una. */
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const tot={}; let chiamate=0, tenuta=0;
for(let s=0;s<N;s++){
  const m=crea({seed:1000+s,giocatori:giocatori(),eroe:{name:'EROE',x:58,y:50,attivo:true,ovr:74},forza:{home:70,away:66}});
  for(let t=1;t<=MIN;t++){ if(t===18||t===64)m.chiedi.gol('home'); if(t===36||t===78)m.chiedi.gol('away');
    for(let k=0;k<DEC;k++){ m.tick({min:t,dt:1/DEC,dec:true}); chiamate++; } }
  const c=m._S.conta; tenuta+=c.tenuta;
  for(const [k,v] of Object.entries(c.rami||{})) tot[k]=(tot[k]|0)+v;
}
const righe=Object.entries(tot).sort((a,b)=>b[1]-a[1]);
const somma=righe.reduce((s,r)=>s+r[1],0);
console.log(`\n=== DOVE VANNO LE DECISIONI DI TENUTA — ${N} partite, ${DEC} decisioni al minuto ===`);
console.log(`  chiamate totali ${chiamate} · di cui tenuta ${tenuta} (${(100*tenuta/chiamate).toFixed(1)} %)`);
console.log(`  rami contati ${somma} — il resto della tenuta esce senza toccare un ramo\n`);
console.log('  ramo                    per partita   quota dei rami');
for(const [k,v] of righe) console.log(`  ${k.padEnd(22)} ${(v/N).toFixed(2).padStart(9)}   ${(100*v/somma).toFixed(1).padStart(6)} %`);
/* [correzione dello strumento] cross_avanti/cross_largo/cross_senzaRicevente sono DIAGNOSTICI:
   segnano la chiamata ma non la consumano (non c'e' return). Sommandoli ai rami veri il totale
   superava la tenuta e il «senza ramo» usciva NEGATIVO, cioe' una misura impossibile. */
const DIAG=['cross_avanti','cross_largo','cross_senzaRicevente'];
const decisivi=righe.filter(r=>!DIAG.includes(r[0])).reduce((s,r)=>s+r[1],0);
const senza=tenuta-decisivi;
console.log(`\n  rami DECISIVI (senza i tre diagnostici) ${(decisivi/N).toFixed(1)} per partita, contro ${(tenuta/N).toFixed(1)} decisioni di tenuta`);
console.log(`  tenuta senza alcun ramo   ${(senza/N).toFixed(2).padStart(9)}   ${(100*senza/tenuta).toFixed(1).padStart(6)} % della tenuta`);
