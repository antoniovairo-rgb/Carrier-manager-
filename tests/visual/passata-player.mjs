/* [PLAYTEST — LA PASSATA DA PLAYER] Una partita intera, guardata dall'inizio alla fine.
   Non produce quote ne' percentuali: produce IL DIARIO DELLA PARTITA — quello che il giocatore
   legge sullo schermo, minuto per minuto, con il punteggio a fianco — piu' un pugno di fotogrammi.
   Serve a rispondere a UNA domanda sola (direttiva PO 06/09): «dopo questa partita ho la sensazione
   di aver vissuto una giornata della carriera del mio attaccante?»
   Il banco e' tarato: tempo di lettura delle schede in scala col tick (regola imparata il 06/09). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import fs from 'fs';import path from 'path';
const NOME=process.env.CPM_NOME||'Ferrari';
const SEME=+(process.env.CPM_SEME||4242);
const OUT=path.join(__dirname,'..','out','playtest');
fs.mkdirSync(OUT,{recursive:true});
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];window.__CPM_SCMS681=3500;});
await openMatch(page,port,{skipLoadAll:true,name:NOME});
await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
const SCATTI=[3,23,45,58,74,88];const fatti={};
const storia=[];let min=0;
for(let k=0;k<2000;k++){
  await sleep(250);
  const s=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();if(!ms)return null;
    return {min:ms.min|0,h:(ms.score&&ms.score.h)|0,a:(ms.score&&ms.score.a)|0,
            fase:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?'};});
  if(s){min=s.min;if(!storia.length||storia[storia.length-1].min!==min)storia.push(s);
    for(const t of SCATTI)if(min>=t&&!fatti[t]){fatti[t]=1;
      try{await page.screenshot({path:path.join(OUT,'min'+String(t).padStart(2,'0')+'.png')});}catch(_e){}}}
  if(min>=89)break;
}
const d=await page.evaluate(()=>({
  cro:window.__CPM_CRO802||[],
  esiti:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='esito'),
  gol:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal')}));
await ctx.close();await b.close();srv.close();
const punt={};storia.forEach(s=>{punt[s.min]=s.h+'-'+s.a;});
const scene={};(d.esiti||[]).forEach(e=>{(scene[e.min|0]=scene[e.min|0]||[]).push((e.key||'?')+(e.ok?' RIUSCITO':' fallito'));});
const golM={};(d.gol||[]).forEach(e=>{(golM[e.min|0]=golM[e.min|0]||[]).push(e.side+'/'+(e.src||'?'));});
let righe=0,vuoti=0,run=0,maxRun=0,maxA=0,maxB=0;
console.log('╔══════════════════════════════════════════════════════════════════════════════');
console.log('║  DIARIO DELLA PARTITA — eroe «'+NOME+'», seme '+SEME);
console.log('║  Quello che il giocatore vede sullo schermo, minuto per minuto.');
console.log('╚══════════════════════════════════════════════════════════════════════════════');
for(let m=1;m<=Math.max(min,89);m++){
  const r=(d.cro||[]).filter(c=>c.t===m);
  righe+=r.length;
  if(!r.length&&!scene[m]&&!golM[m]){vuoti++;run++;if(run>maxRun){maxRun=run;maxB=m;maxA=m-run+1;}continue;}
  run=0;
  const p=punt[m]||'';
  r.forEach((c,i)=>console.log(String(m).padStart(3)+"'  "+String(i?'':p).padStart(5)+'  '+c.txt.slice(0,110)));
  if(scene[m])console.log(String(m).padStart(3)+"'  "+''.padStart(5)+'  ▶ SCENA DELL\'EROE: '+scene[m].join(' · '));
  if(golM[m])console.log(String(m).padStart(3)+"'  "+''.padStart(5)+'  ⚽ GOL ['+golM[m].join(' · ')+']');
}
console.log('\n══ COSA HA VISSUTO IL PLAYER ══');
console.log('  righe lette: '+righe+'  ·  minuti senza NIENTE: '+vuoti+'/'+min
  +'  ·  silenzio piu\' lungo: '+maxRun+"' (dal "+maxA+"' al "+maxB+"')");
console.log('  scene dell\'eroe: '+Object.keys(scene).length+' ['+Object.keys(scene).join(',')+']');
console.log('  gol: '+(d.gol||[]).length+' ['+Object.keys(golM).join(',')+']');
console.log('  risultato finale: '+(punt[min]||'?'));
console.log('  fotogrammi → '+OUT);
