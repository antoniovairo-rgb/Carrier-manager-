/* [CENSIMENTO 831 · bugia M del playtest n°5] IL COPIONE FISSO. Quattro partite con quattro nomi (quindi
   quattro semi di partita): quante righe del diario (__CPM_CRO802) escono IDENTICHE allo stesso minuto in
   almeno due partite, quante lo sono a meno dei cognomi («struttura»), e a che minuto si arma la prima
   occasione extra-eroe (__CPM_OCC695.min) e la prima scena dell'eroe. Rosso: CPM_ROSSO=819. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Vairo,Moretti,Galli,Conti').split(',');
const ROSSO=process.env.CPM_ROSSO||'';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const per=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];if(o.rosso)window['__CPM_NO'+o.rosso]=true;if(o.away)window.__CPM_AWAY_TEST=true;},{rosso:ROSSO,away:g>=NOMI.length/2});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>({cro:(window.__CPM_CRO802||[]).map(x=>({t:x.t|0,txt:String(x.txt||'')})),occ:(window.__CPM_OCC695&&window.__CPM_OCC695.min)||[],hl:(window.__CPM_HLMIN831||[])}));
  await ctx.close();
  per.push({nome:NOMI[g],cro:d.cro,occ:d.occ});
  console.log('  '+NOMI[g]+': righe '+d.cro.length+' · occasioni armate ai minuti ['+d.occ.join(',')+']');
}
await b.close();srv.close();
/* struttura = riga senza i cognomi: ogni parola con la maiuscola (non a inizio riga) e le sigle diventano «X» */
const strut=(s)=>s.replace(/\((GRA|POL|[A-Z]{2,3})\)/g,'').replace(/(?<=[\s:,—-])[A-Z][a-zà-ù']+/g,'X').replace(/\s+/g,' ').trim();
const mappa=(f)=>{const m=new Map();per.forEach((p,gi)=>{const visti=new Set();p.cro.forEach(c=>{const k=c.t+'|'+f(c.txt);if(visti.has(k))return;visti.add(k);m.set(k,(m.get(k)||[]).concat(gi));});});return m;};
const conta=(m)=>{let n=0,tot=0;const top=[];m.forEach((v,k)=>{tot++;if(v.length>=2){n++;top.push([v.length,k]);}});top.sort((a,b)=>b[0]-a[0]||a[1].localeCompare(b[1]));return {n,tot,top};};
const E=conta(mappa(s=>s)),S=conta(mappa(strut));
console.log('\n=== IL COPIONE FISSO ('+NOMI.length+' partite'+(ROSSO?', ROSSO NO'+ROSSO:'')+') ===');
console.log('  righe IDENTICHE allo stesso minuto in >=2 partite: '+E.n+' (su '+E.tot+' coppie minuto-riga distinte)');
console.log('  righe con la stessa STRUTTURA allo stesso minuto in >=2 partite: '+S.n+' (su '+S.tot+')');
console.log('  prima occasione extra-eroe: ['+per.map(p=>p.occ.length?p.occ[0]:'-').join(', ')+']   · minuti distinti '+new Set(per.map(p=>p.occ[0])).size+'/'+NOMI.length);
console.log('  tutte le occasioni: '+per.map(p=>p.nome+'['+p.occ.join(',')+']').join(' '));
console.log('  le piu\' ripetute (struttura):');S.top.slice(0,12).forEach(([n,k])=>console.log('    '+n+'/'+NOMI.length+'  '+k.slice(0,120)));
