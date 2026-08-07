import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits = loadSituations();
const { deriveHL } = loadCine();
console.log('total situations:', sits.length);
for(const gi of [0,1,64,68,132]){
  const s=sits[gi];
  console.log('\n=== gi'+gi+' ===');
  console.log('text:', JSON.stringify(s.text));
  console.log('sit.intent:', s.intent, '| ballState:', s.ballState, '| cine:', JSON.stringify(s.cine));
  (s.actions||[]).forEach((a,ai)=>{
    let hl=null; try{hl=deriveHL(s,a);}catch(e){hl='ERR:'+e.message;}
    console.log('  act['+ai+'] label:', JSON.stringify(a.label), '-> hl:', hl?JSON.stringify({type:hl.type,variant:hl.variant,ballState:hl.ballState,pattern:hl.pattern}):hl);
  });
}
