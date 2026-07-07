import { loadSituations } from './lib/situations.mjs';
const s=loadSituations();
const by={};
s.forEach((x,gi)=>{(by[x.intent]=by[x.intent]||[]).push(gi);});
console.log('=== Situations per INTENT (priorità protagonista=attaccante) ===');
const order=['progression','dribble','insertion','through','onetwo','shot','cross','penalty','freekick','recover','anticipate','intercept','switch'];
for(const k of order){ if(by[k])console.log(`${k.padEnd(12)} (${by[k].length}): ${by[k].join(', ')}`); }
// temi testuali non catturati dall'intent
const find=(re)=>s.map((x,gi)=>re.test(x.text)?gi:-1).filter(i=>i>=0);
console.log('\n=== temi testuali ===');
console.log('ricezione/controllo:', find(/ricez|ricevi|stop|controllo|spalle|giraton/i).join(', '));
console.log('sponda/velo/spizz  :', find(/sponda|velo|spizz/i).join(', '));
console.log('seconda palla/rimb :', find(/seconda palla|rimbalz|respint|vagante/i).join(', '));
console.log('testa (aerial)     :', s.map((x,gi)=>x.ballState==='aerial'?gi:-1).filter(i=>i>=0).join(', '));
