#!/usr/bin/env node
// Rilievo 26-A: confronta gli indici dichiarati dal motore, senza modificare il gioco.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=process.cwd();
const source=fs.readFileSync(path.join(root,'src/14-motore-possesso.jsx'),'utf8');
const context=vm.createContext({window:{},console});
vm.runInContext(source,context,{filename:'src/14-motore-possesso.jsx'});
const rows=[];
for(let seed=1;seed<=100;seed++){
  const M=context.creaMotorePossesso({v2:true,seed,eroe:{name:'Eroe',x:85,y:50,attivo:true,ovr:75},forza:{home:70,away:70}});
  M.chiedi.origini(true,15,false);
  M.chiedi.piazzato({kind:'corner',x:97,y:2,lato:'home',batt:8,hold:1});
  let found=null;
  for(let tick=0;tick<120;tick++){
    const events=M.tick({min:10+Math.floor(tick/3),dt:1,dec:true});
    const e=events.find(e=>e.t==='occasione_eroe'&&e.origine&&e.cast&&e.chi?.i===21);
    if(e){found={tick,kind:e.origine.kind,hero:e.chi?.i??null,originKicker:e.origine.chi?.i??null,castReceiver:e.cast.ricevente?.i??null,castCrosser:e.cast.crossatore?.i??null,actualCrossReceiver:events.find(x=>x.t==='cross')?.a?.i??null};break;}
  }
  rows.push({seed,found});
}
const found=rows.filter(x=>x.found);
const summary={seeds:rows.length,heroOriginScenes:found.length,receiverIsCrosser:found.filter(x=>x.found.castReceiver===x.found.originKicker).length,receiverIsHero:found.filter(x=>x.found.castReceiver===x.found.hero).length,actualCrossTargetsHero:found.filter(x=>x.found.actualCrossReceiver===x.found.hero).length};
const data={version:'7.999.96',commit:'ccabb486d7bc957edc8d7a39ef45d2c51bb80d32',command:'node tests/codex/rilievi-26a-motore.mjs',settings:{seeds:'1..100',corner:{x:97,y:2,batt:8},hero:{i:21,x:85,y:50,ovr:75},maxTicks:120},summary,rows};
const target=path.join(root,'tests/codex/rilievi-26a-motore.json');
fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({target,summary,sample:found[0]}));
