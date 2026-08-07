import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits=loadSituations(); const {deriveHL,buildHLTimeline}=loadCine();
// "Progressione palla al piede": intent=progression + azioni di conduzione (carry/avanza), zona centro/trequarti/centrocampo
console.log('=== SITUATIONS con intent=progression ===');
sits.forEach((s,gi)=>{
  if(s.intent!=='progression')return;
  console.log(`\ngi${gi} [${s.zones.join(',')}] "${s.text}"`);
  (s.actions||[]).forEach((a,ai)=>{
    const hl=deriveHL(s,a);
    console.log(`  act${ai} "${a.label}" (stat=${a.stat},rew=${a.rew}) -> ${hl.type}/${hl.pattern}`);
  });
});
