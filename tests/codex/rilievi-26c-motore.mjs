#!/usr/bin/env node
// Rilievo 26-C: cerca collisioni di occasione nello stesso minuto nel motore puro.
// Campione sintetico: richiesta di scena sempre aperta; non equivale alla schedulazione del live match.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=process.cwd();const source=fs.readFileSync(path.join(root,'src/14-motore-possesso.jsx'),'utf8');
const context=vm.createContext({window:{},console});vm.runInContext(source,context,{filename:'src/14-motore-possesso.jsx'});
const rows=[];
for(let seed=1;seed<=200;seed++){
  const M=context.creaMotorePossesso({v2:true,seed,eroe:{name:'Eroe',x:58,y:50,attivo:true,ovr:75},forza:{home:70,away:70}});
  M.chiedi.origini(true,6,true);M.chiedi.scenaEroe(true,'cross');
  let generic=0,origin=0;const collisions=[];
  for(let min=1;min<=90;min++){
    const ev=[...M.tick({min,dt:1/3,dec:true}),...M.tick({min,dt:1/3,dec:false}),...M.tick({min,dt:1/3,dec:false})];
    const a=ev.filter(e=>e.t==='occasione_eroe');generic+=a.filter(e=>!e.origine).length;origin+=a.filter(e=>e.origine).length;
    if(a.some(e=>!e.origine)&&a.some(e=>e.origine))collisions.push({min,events:a.map(e=>({origin:e.origine?.kind??null,finestra:e.finestra??null,chi:e.chi?.i??null}))});
  }
  rows.push({seed,generic,origin,collisions});
}
const summary={seeds:rows.length,minutesPerSeed:90,generic:rows.reduce((n,x)=>n+x.generic,0),origin:rows.reduce((n,x)=>n+x.origin,0),collisionMinutes:rows.reduce((n,x)=>n+x.collisions.length,0)};
const data={version:'7.999.96',commit:'ccabb486d7bc957edc8d7a39ef45d2c51bb80d32',command:'node tests/codex/rilievi-26c-motore.mjs',limitation:'Richiesta di scena sempre attiva; non riproduce la schedulazione delle scene né il render del live match.',summary,rows};
const target=path.join(root,'tests/codex/rilievi-26c-motore.json');fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({target,summary}));
