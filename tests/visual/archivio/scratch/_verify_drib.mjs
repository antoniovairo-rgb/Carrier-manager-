import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits=loadSituations(); const {deriveHL}=loadCine();
const flips=[];
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
  const hl=deriveHL(s,a);
  if(hl.type==='shot'&&hl.pattern==='DRIBBLE_SHOT') flips.push(`gi${gi} act${ai} "${a.label}" [${hl.variant}]`);
});});
console.log('SHOT con pattern DRIBBLE_SHOT (dribble-lead):',flips.length);
flips.forEach(f=>console.log('  '+f));
