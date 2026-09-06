/* [banco] DOVE, ESATTAMENTE, DUE PARTITE IDENTICHE SMETTONO DI ESSERE IDENTICHE?
   La sonda `ripetibile-804` ha mostrato che la stessa partita (stesso nome, stesso seme) finisce
   6-2 o 5-2 a seconda del giro. Sapere CHE oscilla non basta per ripararlo: serve il PRIMO minuto
   in cui due giri divergono, e quale grandezza diverge per prima.
   Qui si gioca N volte la stessa partita prendendo, a ogni minuto, un'impronta dello stato
   (punteggio, turno, inerzia, possesso, pallone) e si stampa il primo minuto in cui due giri
   non coincidono, con il dettaglio delle grandezze. Il calendario delle tacche si confronta
   IGNORANDO le sentinelle 9999, che sono situazioni incatenate — una conseguenza, non una causa. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOME=process.env.CPM_NOME||'Conti';
const SEME=+(process.env.CPM_SEME||8200);
const GIRI=+(process.env.CPM_GIRI||3);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const GG=[];
for(let g=0;g<GIRI;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;});
  await openMatch(page,port,{skipLoadAll:true,name:NOME});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
  const imp={};let min=0;
  for(let k=0;k<1400;k++){await sleep(250);
    const r=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();if(!ms)return null;
      return {min:ms.min|0,h:(ms.score&&ms.score.h)|0,a:(ms.score&&ms.score.a)|0,turn:ms.turn|0,
              mom:ms.momentum|0,poss:ms.poss|0,
              bx:(ms.ball&&typeof ms.ball.x==='number')?Math.round(ms.ball.x):null,
              by:(ms.ball&&typeof ms.ball.y==='number')?Math.round(ms.ball.y):null};});
    if(r){min=r.min;if(imp[r.min]==null)imp[r.min]=r;}
    if(min>=89)break;}
  const t=await page.evaluate(()=>((window.__CPM_HLTIMES&&window.__CPM_HLTIMES())||[]).filter(x=>x<200));
  GG.push({imp,tacche:t});
  console.log('  giro '+(g+1)+': '+(imp[89]||imp[88]||{h:'?',a:'?'}).h+'-'+(imp[89]||imp[88]||{h:'?',a:'?'}).a
    +' · tacche vere ['+t.join(',')+'] · minuti campionati '+Object.keys(imp).length);
  await ctx.close();
}
await b.close();srv.close();
console.log('\n=== DOVE DIVERGONO ('+GIRI+' giri, nome '+NOME+', seme '+SEME+') ===');
const CAMPI=['h','a','turn','mom','poss','bx','by'];
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
console.log('  calendario (senza le sentinelle di catena): '
  +(GG.every(x=>eq(x.tacche,GG[0].tacche))?'✅ IDENTICO in tutti i giri — il seme comanda'
    :'⚠️  DIVERSO fra i giri — il difetto e\' gia\' a monte, nel seme'));
let primo=null;
for(let m=1;m<=89&&!primo;m++){
  const rif=GG[0].imp[m];if(!rif)continue;
  for(let g=1;g<GG.length;g++){
    const q=GG[g].imp[m];if(!q)continue;
    const diff=CAMPI.filter(c=>rif[c]!==q[c]);
    if(diff.length){primo={m,g,diff,rif,q};break;}
  }
}
if(!primo)console.log('  ✅ nessuna divergenza campionata: i giri coincidono minuto per minuto.');
else{
  console.log('  PRIMO MINUTO CHE DIVERGE: '+primo.m+"'  (giro 1 contro giro "+(primo.g+1)+')');
  console.log('  grandezze che divergono per prime: '+primo.diff.join(', '));
  CAMPI.forEach(c=>console.log('      '+c.padEnd(5)+' giro1 '+String(primo.rif[c]).padStart(5)+'   giro'+(primo.g+1)+' '+String(primo.q[c]).padStart(5)+(primo.diff.indexOf(c)>=0?'   ←':'')));
  const soloPos=primo.diff.every(c=>c==='bx'||c==='by');
  console.log('');
  console.log(soloPos?'  Diverge PRIMA la posizione del pallone: la deriva nasce nel motore di movimento, non nel punteggio.'
    :'  Divergono grandezze di partita (punteggio/turno/inerzia/possesso): la deriva nasce a monte del movimento.');
}
/* Quanto dista il primo gol diverso */
const golDiv=[];
for(let m=1;m<=89;m++){const r=GG[0].imp[m];if(!r)continue;
  for(let g=1;g<GG.length;g++){const q=GG[g].imp[m];if(!q)continue;
    if(r.h!==q.h||r.a!==q.a){golDiv.push(m);break;}}}
if(golDiv.length)console.log('  primo minuto con PUNTEGGIO diverso: '+golDiv[0]+"'");
else console.log('  punteggio: mai diverso nei minuti campionati.');
