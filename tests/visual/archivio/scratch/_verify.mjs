import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits=loadSituations(); const {deriveHL}=loadCine();
for(const [gi,ai] of [[169,1],[99,1],[56,1],[47,1],[174,1]]){
  const s=sits[gi],a=s.actions[ai]; const hl=deriveHL(s,a);
  console.log(`gi${gi} act${ai} "${a.label}" -> ${hl.type}/${hl.variant||'-'}`);
}
console.log('gi155 intent ->', sits[155].intent, '| type ->', sits[155].type);
