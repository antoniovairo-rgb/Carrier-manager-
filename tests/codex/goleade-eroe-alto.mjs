#!/usr/bin/env node
// Controllo numerico supplementare PO-190: motore v2 con occasioni dell'eroe attive.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
await import('../../prototipo/partita-vera/motore-v2.js');
await import('../../prototipo/partita-vera/partita.js');
globalThis.window = {};

const version = fs.readFileSync('src/07-versione-save-interviste.jsx','utf8').match(/const GAME_VERSION="([^"]+)"/)?.[1];
const commit = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const pairs = [[93,80],[93,50],[80,93]];
const count = Math.max(1,Math.min(100,Number(process.env.CPM_GAMES_PER_PAIR||100)));
const rows = [];
for (let p=0;p<pairs.length;p++) {
  const [home,away] = pairs[p];
  for (let i=0;i<count;i++) {
    const seed = 190100+p*1000+i;
    const P = globalThis.creaPartita({
      crea: cfg => globalThis.creaMotoreV2({...cfg,occasioniV2:true}),
      registra:false,v2:true,seed,casa:{sigla:'CASA',forza:home},ospite:{sigla:'OSP',forza:away},
      eroeLato:'home',eroe:{nome:'EROE',ovr:home}
    });
    const result = P.tuttaSubito();
    const events = P.stato.eventi;
    rows.push({pair:`${home}-${away}`,seed,home:result.casa,away:result.ospite,
      heroOpportunities:events.filter(e=>e.t==='occasione_eroe').length,
      heroGoals:events.filter(e=>e.t==='gol'&&e.chi?.eroe===true).length,
      scoreGoals:events.filter(e=>e.t==='gol').length,
      homeShots:result.tab?.eroe?.tiri??null,awayShots:result.tab?.avv?.tiri??null});
  }
}
const data = {version,commit,command:'node tests/codex/goleade-eroe-alto.mjs',environment:'Node.js, motore-v2 + partita.js, occasioniV2:true, scelte automatiche',rows};
fs.writeFileSync('tests/codex/goleade-eroe-alto.json',JSON.stringify(data,null,2));
for (const [home,away] of pairs) {
  const r=rows.filter(x=>x.pair===`${home}-${away}`);
  const avg=k=>r.reduce((n,x)=>n+x[k],0)/r.length;
  console.log(JSON.stringify({pair:`${home}-${away}`,n:r.length,homeGoals:avg('home'),awayGoals:avg('away'),sixPlus:r.filter(x=>x.home>=6).length,marginFivePlus:r.filter(x=>Math.abs(x.home-x.away)>=5).length,heroOpportunities:avg('heroOpportunities')}));
}
