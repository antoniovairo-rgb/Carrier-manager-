import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';
const sits = loadSituations();
const { deriveHL } = loadCine();
const norm = s => (s||'').toLowerCase();

// gesture cue -> predicate(hl) che DEVE valere se il cue è nel label
const RULES = [
  {name:'header',    re:/testa|incornata|\bstacco\b|di testa|colpo di t/, ok:hl=>hl.type==='header'},
  {name:'bicycle',   re:/rovesciata|sforbiciata|bicicletta/,             ok:hl=>hl.variant==='shot_volley'||hl.variant==='shot_bicycle'},
  {name:'volley',    re:/\bal volo\b|vol[eé]e|di prima.*vol/,            ok:hl=>hl.variant==='shot_volley'||hl.type==='header'},
  {name:'chip',      re:/pallonetto|scavetto|\bchip\b/,                  ok:hl=>hl.variant==='shot_chip'},
  {name:'freekick',  re:/punizione|calcio di punizione|barriera/,        ok:hl=>hl.type==='freekick'},
  {name:'penalty',   re:/rigore|dal dischetto|dischetto/,                ok:hl=>hl.type==='penalty'},
  {name:'cross',     re:/\bcross|traversone|crossa|cross teso/,          ok:hl=>hl.type==='cross'},
  {name:'dribble',   re:/dribbl|salta l'uomo|salta il|finta|elastico|tunnel|sombrero|doppio passo/, ok:hl=>hl.type==='dribble'},
  {name:'tackle',    re:/contrasto|scivolata|\btackle|\bblocco|spazza|chiudi|anticipa|intercett|recupera|rubare|ruba palla/, ok:hl=>hl.type==='tackle'||hl.type==='recover'},
];

const flags=[];
sits.forEach((s,gi)=>{
  (s.actions||[]).forEach((a,ai)=>{
    let hl; try{hl=deriveHL(s,a);}catch(e){flags.push({gi,ai,sev:'ERR',label:a.label,msg:e.message});return;}
    const L=norm(a.label);
    for(const r of RULES){
      if(r.re.test(L) && !r.ok(hl)){
        flags.push({gi,ai,sev:'MISMATCH',cue:r.name,label:a.label,text:s.text,
          hl:`${hl.type}/${hl.variant||'-'}/${hl.ballState||s.ballState||'-'}`});
      }
    }
  });
});
console.log('SITUATIONS:',sits.length,'· flags:',flags.length,'\n');
flags.forEach(f=>{
  if(f.sev==='ERR'){console.log(`gi${f.gi} act${f.ai} ERR ${f.msg} :: ${f.label}`);return;}
  console.log(`gi${f.gi} act${f.ai} [${f.cue}] "${f.label}"  →  ${f.hl}\n     sit: ${f.text}`);
});
