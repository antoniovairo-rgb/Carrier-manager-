import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits = loadSituations();
const { deriveHL } = loadCine();
const tests={
  'chip (pallonett|cucchiaio)': /pallonett|cucchiaio/,
  'verb tira/tiri/tirare':      /\btir(a|i|are|ò|erà)\b/,
  'verb conclud(e|i|ere)':      /conclud/,
};
for(const [name,re] of Object.entries(tests)){
  const hits=[];
  sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{
    const L=(a.label||'').toLowerCase();
    if(re.test(L)){ const hl=deriveHL(s,a); hits.push(`gi${gi} act${ai} [${hl.type}/${a.stat}/${a.rew}] "${a.label}"`); }
  });});
  console.log(`\n### ${name} — ${hits.length} azioni con questa parola`);
  hits.forEach(h=>console.log('  '+h));
}
