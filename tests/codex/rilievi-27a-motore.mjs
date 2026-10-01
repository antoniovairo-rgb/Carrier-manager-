#!/usr/bin/env node
// Confronto isolato del rilievo 27-A. Non modifica il motore del gioco.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=process.cwd();
const source=fs.readFileSync(path.join(root,'src/14-motore-possesso.jsx'),'utf8');
const rows=[];
for(const disabled of [false,true]){
  const context=vm.createContext({window:disabled?{__CPM_NO_PIAZ27:1}:{},console});
  vm.runInContext(source,context,{filename:'src/14-motore-possesso.jsx'});
  for(let seed=1;seed<=100;seed++){
    const M=context.creaMotorePossesso({v2:true,seed,eroe:{name:'Eroe',x:85,y:50,attivo:true,ovr:75},forza:{home:70,away:70}});
    M.chiedi.origini(true,15,true);
    M.chiedi.piazzato({kind:'foul',x:85,y:50,lato:'home',batt:21,hold:1});
    const events=[];
    for(let tick=0;tick<20;tick++){
      for(const e of M.tick({min:10,dt:1,dec:true}))events.push({tick,t:e.t,kind:e.kind??null,intent:e.intent??null,origine:e.origine?.kind??null,chi:e.chi?.i??null});
      if(events.some(e=>e.t==='occasione_eroe'&&e.origine==='punizione')||events.some(e=>e.t==='battuta'&&e.kind==='foul'))break;
    }
    rows.push({seed,disabled,events,fermo:M._S.fermo?.kind??null});
  }
}
const summary={};
for(const disabled of [false,true]){
  const a=rows.filter(x=>x.disabled===disabled);
  summary[disabled?'branchDisabled':'branchEnabled']={n:a.length,sceneRequested:a.filter(x=>x.events.some(e=>e.t==='occasione_eroe'&&e.origine==='punizione')).length,freeKickTaken:a.filter(x=>x.events.some(e=>e.t==='battuta'&&e.kind==='foul')).length,directShots:a.filter(x=>x.events.some(e=>e.t==='tiro'&&e.intent==='freekick')).length,passes:a.filter(x=>x.events.some(e=>e.t==='passaggio')).length,unresolvedSeeds:a.filter(x=>!x.events.some(e=>e.t==='occasione_eroe'&&e.origine==='punizione')&&!x.events.some(e=>e.t==='battuta'&&e.kind==='foul')).map(x=>x.seed)};
}
const data={version:'7.999.96',commit:'ccabb486d7bc957edc8d7a39ef45d2c51bb80d32',command:'node tests/codex/rilievi-27a-motore.mjs',settings:{seeds:'1..100',location:{x:85,y:50},hero:{i:21,x:85,y:50,ovr:75},force:{home:70,away:70},hold:1,maxTicks:20,min:10},summary,rows};
const target=path.join(root,'tests/codex/rilievi-27a-motore.json');
fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({target,summary}));
