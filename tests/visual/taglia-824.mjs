/* [MISURA 824 · #53] «IL PALLONE ADESSO E' TROPPO PICCOLO» (nota PO sulla 7.807, scena di cross in hl).
   L'ipotesi dell'alone e' smentita dalla coppia (alone-822). Qui si misura la cosa vista: la TAGLIA IN
   PIXEL del pallone nella STESSA scena forzata (SIT #101, cross) nei due build — 7.805 (worktree) e il
   corrente — leggendo lo screenshot attorno alla proiezione ndc del pallone (__CPM_STATE().ball.ndc) e
   contando i pixel chiari: raggio = sqrt(n/pi). Piu' la distanza camera (__CPM_STATE().dist). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep, __dirname } from './lib/harness.mjs';
import { PNG } from 'pngjs';import path from 'path';import fs from 'fs';
const GI=+(process.env.CPM_GI||101);
const ROOTS=[['7.805',process.env.CPM_ROOT805||''],['corrente',path.join(__dirname,'..','..','..')]];
if(process.env.CPM_ROOT805)ROOTS[0][1]=process.env.CPM_ROOT805;
const b=await launchBrowser();
const raggio=(png,cx,cy)=>{let n=0;const R=34;for(let y=Math.max(0,cy-R);y<Math.min(png.height,cy+R);y++)for(let x=Math.max(0,cx-R);x<Math.min(png.width,cx+R);x++){const i=(y*png.width+x)*4;const r=png.data[i],g=png.data[i+1],bb=png.data[i+2];if(Math.min(r,g,bb)>185)n++;}return +Math.sqrt(n/Math.PI).toFixed(1);};
for(const [tag,root] of ROOTS){
  const srv=await startServer(root);const port=srv.address().port;
  const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:1});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;});
  await openMatch(page,port,{name:'Taglia'});
  await forceSituation(page,GI,{settle:400,choose:true});
  let fase='?';for(let k=0;k<80;k++){await sleep(150);fase=await page.evaluate(()=>{const s=window.__CPM_STATE&&window.__CPM_STATE();return s?s.phase:'?';});if(fase==='hl_result')break;}
  const R=[],D=[],S=[];
  for(let k=0;k<6;k++){await sleep(250);
    const st=await page.evaluate(()=>{const s=window.__CPM_STATE();return {ndc:s.ball&&s.ball.ndc,on:s.ball&&s.ball.onScreen,dist:s.dist,phase:s.phase,cam:s.camera};});
    if(!st.ndc||!st.on)continue;
    const buf=await page.screenshot();const png=PNG.sync.read(buf);
    const cx=Math.round((st.ndc.x+1)/2*png.width),cy=Math.round((1-st.ndc.y)/2*png.height);
    R.push(raggio(png,cx,cy));D.push(+(+st.dist||0).toFixed(1));S.push(st.phase);
    if(k===2)fs.writeFileSync(path.join(__dirname,'..','out','taglia-'+tag.replace('.','_')+'.png'),buf);}
  await ctx.close();srv.close();
  const med=(a)=>{if(!a.length)return null;const s=a.slice().sort((u,v)=>u-v);return s[s.length>>1];};
  console.log('  '+tag.padEnd(9)+' SIT #'+GI+'  fase '+fase+'  campioni '+R.length+'  raggio pallone mediano '+med(R)+' px  (tutti: '+R.join(',')+')  distanza camera mediana '+med(D));
}
await b.close();
