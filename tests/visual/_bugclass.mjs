import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits = loadSituations();
const { deriveHL } = loadCine();

console.log('=== CLASS A: azione che premia goal/assist ma deriveHL=build (conclusione resa come costruzione) ===');
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
  const hl=deriveHL(s,a);
  if((a.rew==='goal'||a.rew==='assist') && hl.type==='build'){
    console.log(`gi${gi} act${ai} rew=${a.rew} stat=${a.stat} "${a.label}" -> ${hl.type} | sit: ${s.text}`);
  }
});});

console.log('\n=== CLASS B: situazione difensiva (azioni premiano recovery) ma type!=="def" ===');
sits.forEach((s,gi)=>{
  const acts=s.actions||[];
  const recCount=acts.filter(a=>a.rew==='recovery'||a.rew==='recover').length;
  if(recCount>=2 && s.type!=='def'){
    console.log(`gi${gi} type=${s.type} intent=${s.intent} rec=${recCount}/${acts.length} | sit: ${s.text}`);
  }
});

console.log('\n=== CLASS C (info): situazioni type==="def" (per confronto) ===');
let n=0; sits.forEach((s,gi)=>{ if(s.type==='def'){n++;} });
console.log('totali def:',n);
