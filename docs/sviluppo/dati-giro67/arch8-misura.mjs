import fs from 'node:fs';
const W=process.argv[2]||'src/';/* cartella src della versione da misurare (giro 67: worktree di lavoro/172) */
const s06=fs.readFileSync(W+'06-archetipi-agenti-sponsor.jsx','utf8');
const a=s06.indexOf('const ARCHETYPES=[');const b=s06.indexOf('];',a);const A8=Function('return '+s06.slice(a+17,b+1))();
const sb=s06.indexOf('const ARCHETYPE_STAT_BONUS=');const se=s06.indexOf('};',sb);const SB=Function('return '+s06.slice(sb+27,se+1))();
const pe=x=>Math.exp(-x);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const Eg=(l)=>{const p0=pe(l),p1=pe(l)*l;return p1+2*(1-p0-p1);};
const src14=fs.readFileSync(W+'14-motore-possesso.jsx','utf8');const code14=src14.slice(src14.indexOf('/* CMAV-SRC-HEADER-END */')+25);
const crea=Function('decideExecution','window',code14+'\nreturn creaMotorePossesso;')(undefined,{});
const gio=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'C'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const q=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'O'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(q);};
const M=crea({seed:67,v2:true,giocatori:gio(),eroe:{name:'E',x:84,y:48,attivo:true,ovr:80},forza:{home:74,away:70}});
const base={velocità:75,tecnica:75,fisico:75,mentalità:75,tiro:75,passaggio:75,dribbling:75,posizionamento:75};
const rows=[];
for(const ar of A8){const st={...base};for(const[k,v]of Object.entries(ar.bonus))st[k]+=v;
  const pT=M.probEroe({fam:'tiro',stat:'tiro',x:84,y:48,stats:st,oppForza:70}).p, pA=M.probEroe({fam:'assist',stat:'passaggio',x:78,y:40,stats:st,oppForza:70}).p;
  const lid=ar.id;const gL=clamp((80-48)/55+(["bomber","centravanti"].includes(lid)?0.14:0)+0.07,0.06,0.92),aL=clamp((80-48)/75+(["trequartista","fantasista"].includes(lid)?0.10:0),0.04,0.55);
  rows.push({id:ar.id,somma:Object.values(ar.bonus).reduce((x,y)=>x+y,0),bonus:ar.bonus,succRateBonusMax:Math.max(...Object.values(SB[ar.id]||{0:0}))*100,probTiro:+pT.toFixed(3),probAssist:+pA.toFixed(3),simGolVinta:+Eg(gL).toFixed(3),simAssist:+Eg(aL).toFixed(3),crescita:ar.id==='enfant'?'x1,35 fino a 22':'x1'});}
const st={...base};const n0={tiro:M.probEroe({fam:'tiro',stat:'tiro',x:84,y:48,stats:st,oppForza:70}).p,assist:M.probEroe({fam:'assist',stat:'passaggio',x:78,y:40,stats:st,oppForza:70}).p};
console.log(JSON.stringify({neutro75:n0,rows},null,1));
