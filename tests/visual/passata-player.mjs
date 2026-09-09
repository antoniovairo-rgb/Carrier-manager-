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
await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];window.__CPM_SCMS681=3500;if(o.dtreal)window.__CPM_DTREAL=true;if(o.away)window.__CPM_AWAY_TEST=true;(o.rosso||[]).forEach(k=>{window[k]=true;});},{away:!!process.env.CPM_AWAY,dtreal:!!process.env.CPM_DTREAL,rosso:String(process.env.CPM_ROSSO||'').split(',').filter(Boolean)});/* CPM_ROSSO=__CPM_NO839,__CPM_NO840: la passata col rimedio spento, stessi semi *//* [playtest n°4] CPM_AWAY=1 apre il provino in TRASFERTA (7.726) — il metro chiede 2 in casa e 2 fuori */
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
  gol:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal'),nome:window.__CPM_NOME814||null,schermo:window.__CPM_SCHERMO843||[],beat:window.__CPM_BEAT792||[]}));
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
  righe+=r.filter(c=>!c.intro).length;/* [7.838 AC] il titolo/intro della scena e' quello che il player legge, ma non e' una riga di cronaca: si stampa e non si conta */
  if(!r.length&&!scene[m]&&!golM[m]){vuoti++;run++;if(run>maxRun){maxRun=run;maxB=m;maxA=m-run+1;}continue;}
  run=0;
  const p=punt[m]||'';
  r.forEach((c,i)=>console.log(String(m).padStart(3)+"'  "+String(i?'':p).padStart(5)+'  '+c.txt.slice(0,110)));
  if(scene[m])console.log(String(m).padStart(3)+"'  "+''.padStart(5)+'  ▶ SCENA DELL\'EROE: '+scene[m].join(' · '));
  if(golM[m])console.log(String(m).padStart(3)+"'  "+''.padStart(5)+'  ⚽ GOL ['+golM[m].join(' · ')+']');
}
/* [7.843 strumento] i minuti muti, classificati da quello che c'era sullo schermo in quel minuto */
const cls={};(d.schermo||[]).forEach(x=>{const k=x.min|0;const c=x.ko>0?'calcio-inizio':x.kick>0?'ripresa':x.hl?'scena':x.out?'palla-morta':x.fermo?'fermo':x.sp?'piazzato':x.cool>0?'pausa-dado':x.pg?'piano':x.ct?'contropiede':x.lib?'libreria':'vuoto';if(!cls[k]||c!=='vuoto')cls[k]=cls[k]&&cls[k]!=='vuoto'?cls[k]:c;});
const muti={};for(let m=1;m<=Math.max(min,89);m++){const r=(d.cro||[]).filter(c=>c.t===m);if(!r.length&&!scene[m]&&!golM[m]){const c=cls[m]||'?';muti[c]=(muti[c]||0)+1;}}
/* [S5 misura] da dove si tira davvero (tiroDa = avanzamento del tiratore alla battuta del tiro) e le aperture oltre soglia (d > 12u fra il nominato e il punto d'arrivo) */
{const _b=d.beat||[];const _t=_b.filter(x=>x.tiro&&x.tiroDa!=null);const _z={area:0,limite:0,lontano:0};_t.forEach(x=>{const v=+x.tiroDa;if(v>=82)_z.area++;else if(v>=70)_z.limite++;else _z.lontano++;});const _ap=[];_b.forEach((x,i)=>{if(x.tiro&&i>0&&_b[i-1]&&!_b[i-1].tiro&&!_b[i-1].gk&&_b[i-1].d!=null)_ap.push(_b[i-1]);});const _oltre=_ap.filter(x=>+x.d>12).length;/* l'apertura e' la battuta subito prima del tiro (7.792) */
const _db=_t.filter(x=>x.db!=null).map(x=>+x.db);const _sul=_db.filter(v=>v<=5).length;console.log('  [S5] tiri di piano '+_t.length+' per zona '+JSON.stringify(_z)+' · tiroDa '+_t.map(x=>Math.round(x.tiroDa)).join(',')+' · aperture oltre 12u '+_oltre+'/'+_ap.length+' · tiratore sul pallone (<=5u) '+_sul+'/'+_db.length+' [db '+_db.join(',')+']');}
console.log('\n══ COSA HA VISSUTO IL PLAYER ══');
console.log('  minuti muti per cosa c\'era sullo schermo: '+JSON.stringify(muti));
console.log('  righe lette: '+righe+'  ·  minuti senza NIENTE: '+vuoti+'/'+min
  +'  ·  silenzio piu\' lungo: '+maxRun+"' (dal "+maxA+"' al "+maxB+"')");
if(d.nome)console.log('  [H] gol nostri al rigo '+(d.nome.gol|0)+' · con piano '+(d.nome.conPiano|0)+' · firmati dall\'ultima battuta '+(d.nome.firmati|0)+' · dettaglio '+JSON.stringify(d.nome.det||[]));
console.log('  scene dell\'eroe: '+Object.keys(scene).length+' ['+Object.keys(scene).join(',')+']');
console.log('  gol: '+(d.gol||[]).length+' ['+Object.keys(golM).join(',')+']');
console.log('  risultato finale: '+(punt[min]||'?'));
console.log('  fotogrammi → '+OUT);
