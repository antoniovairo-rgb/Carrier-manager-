import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits = loadSituations();
const { deriveHL } = loadCine();
for(const gi of [169,155,106,124]){
  const s=sits[gi];
  console.log('\n===== gi'+gi+' =====');
  console.log('text:', JSON.stringify(s.text));
  console.log('intent:',s.intent,'ballState:',s.ballState,'cine:',JSON.stringify(s.cine),'tactic:',JSON.stringify(s.tactic));
  (s.actions||[]).forEach((a,ai)=>{
    const hl=deriveHL(s,a);
    console.log(`  act${ai} "${a.label}"  intent=${a.intent||s.intent}  ->  ${hl.type}/${hl.variant||'-'}/${hl.pattern}`);
  });
}
