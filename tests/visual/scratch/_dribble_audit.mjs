import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits=loadSituations(); const {deriveHL}=loadCine();
const dribCue=/dribbl|finta|elastico|doppio passo|sterzat|step-?over|sombrero|tunnel|salta l|punta l|rientr.*tir|serpentin|ubriac/i;
console.log('=== azioni con CUE di dribbling nel label MA type conclusione (shot/cross) — dribble "perso" ===');
let n=0;
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
  const L=(a.label||'').toLowerCase();
  if(dribCue.test(L)){
    const hl=deriveHL(s,a);
    if(hl.type==='shot'||hl.type==='cross'){
      console.log(`gi${gi} act${ai} [${hl.type}/${hl.variant||'-'}/${hl.pattern}] "${a.label}"`); n++;
    }
  }
});});
console.log('totale "dribble perso":',n);
console.log('\n=== confronto: azioni che GIA\' rendono dribble (type=dribble, pattern DRIBBLE_SHOT) ===');
let m=0;
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
  const hl=deriveHL(s,a);
  if(hl.type==='dribble'){ if(m<6)console.log(`gi${gi} act${ai} [${hl.pattern}] "${a.label}"`); m++; }
});});
console.log('totale type=dribble:',m);
