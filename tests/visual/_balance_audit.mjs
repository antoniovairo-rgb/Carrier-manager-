import { loadSituations } from './lib/situations.mjs';
const sits=loadSituations();

// CHOICE BALANCE: in una situation, un'azione "domina" se ha bonus molto più alto
// E reward migliore di tutte le altre → scelta finta. bon = modificatore succ; rew goal/assist>recovery>nothing.
const rewRank={goal:3,assist:3,recovery:2,recover:2,nothing:0};
console.log('=== A: opzione DOMINANTE (bonus max E reward >= tutte, gap bonus >= 12) ===');
let aN=0;
sits.forEach((s,gi)=>{
  const acts=s.actions||[]; if(acts.length<2)return;
  const sorted=[...acts].sort((x,y)=>(y.bon||0)-(x.bon||0));
  const top=sorted[0], second=sorted[1];
  const gap=(top.bon||0)-(second.bon||0);
  const topRew=rewRank[top.rew]??1, allLeq=acts.every(a=>a===top||(rewRank[a.rew]??1)<=topRew);
  if(gap>=12 && allLeq && topRew>=Math.max(...acts.map(a=>rewRank[a.rew]??1))){
    console.log(`gi${gi} gap=${gap} top:"${top.label}"(bon${top.bon},${top.rew}) | sit: ${s.text}`); aN++;
  }
});
console.log('dominanti:',aN);

// VARIETY: situations con testo quasi-identico (prime 4 parole significative uguali) o trio di label identico
console.log('\n=== B: testi quasi-duplicati (chiave = testo senza emoji, lowercase, prime 5 parole) ===');
const seen={};
sits.forEach((s,gi)=>{
  const key=(s.text||'').toLowerCase().replace(/[^a-zàèéìòù ]/g,'').trim().split(/\s+/).slice(0,5).join(' ');
  (seen[key]=seen[key]||[]).push(gi);
});
let bN=0;
Object.entries(seen).forEach(([k,gis])=>{ if(gis.length>1 && k.length>6){ console.log(`[${gis.join(',')}] "${k}"`); bN++; }});
console.log('cluster quasi-dup:',bN);
