import { loadSituations } from './lib/situations.mjs';
const sits=loadSituations();
const bad=/ritir|attir|martir|tirann|satir/i;
let n=0;
sits.forEach((s,gi)=>{(s.actions||[]).forEach((a,ai)=>{ if(bad.test(a.label||'')){console.log(`gi${gi} act${ai} "${a.label}"`);n++;} });});
console.log('labels con substring rischiosa:',n);
