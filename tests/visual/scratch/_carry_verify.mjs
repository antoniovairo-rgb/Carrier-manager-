import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits=loadSituations(); const {deriveHL,buildHLTimeline,validateHLTimeline}=loadCine();
console.log('=== gi28 ===');
const g=sits[28];console.log('intent:',g.intent);
g.actions.forEach((a,i)=>{const hl=deriveHL(g,a);console.log(`  act${i} "${a.label}" -> ${hl.type}/${hl.pattern}`);});
console.log('\n=== TUTTE le azioni con pattern BALL_CARRY (set completo rerouted) ===');
let n=0,viol=0;
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
  const hl=deriveHL(s,a);
  if(hl.pattern==='BALL_CARRY'){
    n++;
    const tl=buildHLTimeline(hl,{x:50,y:50,reward:a.rew,side:1});
    const v=validateHLTimeline(tl,hl);
    if(v.length){viol++;console.log(`  ⚠️ gi${gi} act${ai} "${a.label}" VIOLAZIONI: ${v.join('; ')}`);}
    else console.log(`  gi${gi} act${ai} "${a.label}" (${a.rew}) beats=${tl.beats.length} OK`);
  }
});});
console.log(`\nTotale BALL_CARRY: ${n} · violazioni timeline: ${viol}`);
