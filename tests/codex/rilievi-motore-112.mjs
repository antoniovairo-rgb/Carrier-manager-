#!/usr/bin/env node
// Ricontrollo isolato di 26-A e 27-A sulla base corrente, senza cambiare il gioco.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const source=fs.readFileSync(path.join(root,'src/14-motore-possesso.jsx'),'utf8');
const versionSource=fs.readFileSync(path.join(root,'src/07-versione-save-interviste.jsx'),'utf8');
const version=versionSource.match(/const GAME_VERSION="([^"]+)"/)?.[1]??'non verificato';
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const makeContext=(flags={})=>{const context=vm.createContext({window:flags,console});vm.runInContext(source,context,{filename:'src/14-motore-possesso.jsx'});return context;};

const cross=[];
for(let seed=1;seed<=100;seed++){
  const context=makeContext();
  const motor=context.creaMotorePossesso({v2:true,seed,eroe:{name:'Eroe',x:85,y:50,attivo:true,ovr:75},forza:{home:70,away:70}});
  motor.chiedi.origini(true,15,false);
  motor.chiedi.piazzato({kind:'corner',x:97,y:2,lato:'home',batt:8,hold:1});
  let found=null;
  for(let tick=0;tick<120;tick++){
    const events=motor.tick({min:10+Math.floor(tick/3),dt:1,dec:true});
    const event=events.find(e=>e.t==='occasione_eroe'&&e.origine&&e.cast&&e.chi?.i===21);
    if(event){found={tick,hero:event.chi?.i??null,originKicker:event.origine.chi?.i??null,castReceiver:event.cast.ricevente?.i??null,castCrosser:event.cast.crossatore?.i??null,actualCrossReceiver:events.find(e=>e.t==='cross')?.a?.i??null};break;}
  }
  cross.push({seed,found});
}
const c=cross.filter(row=>row.found);
const crossSummary={seeds:cross.length,heroOriginScenes:c.length,receiverIsKicker:c.filter(row=>row.found.castReceiver===row.found.originKicker).length,receiverIsHero:c.filter(row=>row.found.castReceiver===row.found.hero).length,crossEventTargetsHero:c.filter(row=>row.found.actualCrossReceiver===row.found.hero).length};

const freeKicks=[];
for(const disabled of [false,true]){
  const context=makeContext(disabled?{__CPM_NO_PIAZ27:1}:{});
  for(let seed=1;seed<=100;seed++){
    const motor=context.creaMotorePossesso({v2:true,seed,eroe:{name:'Eroe',x:85,y:50,attivo:true,ovr:75},forza:{home:70,away:70}});
    motor.chiedi.origini(true,15,true);
    motor.chiedi.piazzato({kind:'foul',x:85,y:50,lato:'home',batt:21,hold:1});
    const events=[];
    for(let tick=0;tick<20;tick++){
      for(const event of motor.tick({min:10,dt:1,dec:true}))events.push({tick,t:event.t,kind:event.kind??null,intent:event.intent??null,origin:event.origine?.kind??null});
      if(events.some(event=>event.t==='occasione_eroe'&&event.origin==='punizione')||events.some(event=>event.t==='battuta'&&event.kind==='foul'))break;
    }
    freeKicks.push({seed,disabled,events});
  }
}
const kickSummary={};
for(const disabled of [false,true]){
  const rows=freeKicks.filter(row=>row.disabled===disabled);
  kickSummary[disabled?'branchDisabled':'branchEnabled']={n:rows.length,sceneRequested:rows.filter(row=>row.events.some(event=>event.t==='occasione_eroe'&&event.origin==='punizione')).length,freeKickTaken:rows.filter(row=>row.events.some(event=>event.t==='battuta'&&event.kind==='foul')).length,directShots:rows.filter(row=>row.events.some(event=>event.t==='tiro'&&event.intent==='freekick')).length};
}
const data={version,commit,command:'node tests/codex/rilievi-motore-112.mjs',settings:{crossSeeds:'1..100',freeKickSeeds:'1..100',freeKickArms:'normal and __CPM_NO_PIAZ27=1'},crossSummary,kickSummary,cross,freeKicks};
const target=path.join(root,'tests/codex/rilievi-motore-112.json');
fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({target,version,commit,crossSummary,kickSummary}));
