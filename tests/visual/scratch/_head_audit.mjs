import { loadSituations } from './lib/situations.mjs';
const sits=loadSituations();
const headCue=/testa|incornata|\bstacco\b|colpo di t|di testa|spizz|incorna/i;
console.log('=== Situations con ballState!="aerial" MA azione "di testa" (offerta incompatibile) ===');
let n=0;
sits.forEach((s,gi)=>{
  if(s.ballState==='aerial')return; // ok: testa su palla aerea è coerente
  (s.actions||[]).forEach((a,ai)=>{
    if(headCue.test(a.label||'')){
      n++; console.log(`gi${gi} [ballState=${s.ballState}] act${ai} "${a.label}"  | sit: ${s.text}`);
    }
  });
});
console.log('\nTOTALE offerte testa su palla NON aerea:',n);
